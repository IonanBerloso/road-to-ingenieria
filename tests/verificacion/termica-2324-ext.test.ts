/**
 * La extraordinaria de Ingeniería Térmica fechada el 30 de enero de 2024.
 *
 * El separador mal aislado es el paso más sensible de la tanda a las 273,15:
 * su entropía generada es la resta de dos sumandos de 3,9 que casi se anulan
 * más un calor dividido por la temperatura de la pared, y pasar de 399 a
 * 399,15 K la mueve un 1 %. Cabe en la casilla, y aquí se comprueba que cabe.
 */
import { describe, expect, it } from 'vitest';
import { convocatoria } from './corpus';

const cuadra = convocatoria('ingenieria-termica', '2023-2024-ext');
const K = 273.15;

describe('1 · la misma expansión dos veces, con calor y sin él', () => {
  const id = 'exter2324-ext-1-la-misma-expansion-con-calor-y-sin-el';
  const m = 0.25;
  const [v1, v2, P1, T2] = [0.9, 1.5, 100, 5 + K]; // m³/kg, m³/kg, kPa, K
  const [cp, cv, R] = [1.0045, 0.718, 0.287]; // la nota del enunciado
  const T1 = (P1 * v1) / R;
  const P2 = (R * T2) / v2;
  const n = Math.log(P1 / P2) / Math.log(v2 / v1);

  /** Simpson compuesto: el trabajo se integra, no se saca de la fórmula. */
  const simpson = (f: (x: number) => number, a: number, b: number, N = 2000) => {
    const h = (b - a) / N;
    let s = f(a) + f(b);
    for (let i = 1; i < N; i++) s += (i % 2 ? 4 : 2) * f(a + i * h);
    return (s * h) / 3;
  };

  it('el exponente es 1,2359, por las presiones y por las temperaturas', () => {
    expect(Math.abs(1 + Math.log(T1 / T2) / Math.log(v2 / v1) - n)).toBeLessThan(1e-12);
    cuadra(id, 'El exponente politrópico', n);
  });

  const W = m * simpson((v) => P1 * (v1 / v) ** n, v1, v2);

  it('el aire hace 10,83 kJ, integrando p·dv a lo largo de la politrópica', () => {
    expect(Math.abs(W - (m * R * (T1 - T2)) / (n - 1)) / W).toBeLessThan(1e-9);
    cuadra.magnitud(id, 'El trabajo de la expansión', W, 'kJ');
  });

  it('y le entran 4,44 kJ de calor mientras se enfría', () => {
    const Q = m * cv * (T2 - T1) + W;
    /* Por el calor específico politrópico, con γ = c_p/c_v, sale un 0,4 % menos:
       c_p − c_v = 0,2865 y R' = 0,287 no son del todo el mismo gas, y c_n
       divide dos números pequeños. Es la sensibilidad que la resolución avisa. */
    const cn = (n * cv - cp) / (n - 1);
    expect(Math.abs(m * cn * (T2 - T1) - Q) / Q).toBeLessThan(0.01);
    expect(T2).toBeLessThan(T1);
    cuadra.magnitud(id, 'El calor intercambiado', Q, 'kJ');
  });

  it('sin calor hace menos trabajo, 10,4 kJ, y se enfría más', () => {
    const gamma = cp / cv; // la resolución redondea a 1,4 y cae igual
    const T3 = T1 * (v1 / v2) ** (gamma - 1);
    const Wad = m * cv * (T1 - T3); // −ΔU
    // y por la integral de la adiabática, que con R' en lugar de c_p − c_v se separa un 0,2 %
    const porIntegral = m * simpson((v) => P1 * (v1 / v) ** gamma, v1, v2);
    expect(Math.abs(porIntegral - Wad) / Wad).toBeLessThan(5e-3);
    expect(Wad).toBeLessThan(W);
    expect(T3).toBeLessThan(T2);
    cuadra.magnitud(id, 'El trabajo si fuera adiabático', Wad, 'kJ');
  });
});

describe('2 · el separador mal aislado', () => {
  const id = 'exter2324-ext-2-el-separador-mal-aislado-y-el-noventa-y-siete-por-ciento';
  const [m1, mL, mV] = [0.5, 0.1, 0.4];
  // las tablas de vapor, con los valores que dan las preguntas
  const [h1, hL, hV] = [2971.0, 504.7, 2706.7];
  const [s1, sL, sV] = [7.7086, 1.5301, 7.1271];
  const [T0, Tsup] = [19 + K, 126 + K];
  const qPerdido = m1 * h1 - mL * hL - mV * hV;
  const SG = mL * sL + mV * sV - m1 * s1 + qPerdido / Tsup;

  it('el separador pierde 352,35 kW por la pared', () => {
    expect(mL + mV).toBeCloseTo(m1, 12);
    cuadra.magnitud(id, 'El calor perdido', qPerdido, 'kW');
  });

  it('se generan 0,0326 kW/K, y sin el término del calor saldría negativa', () => {
    expect(SG - qPerdido / Tsup).toBeLessThan(0);
    expect(SG).toBeGreaterThan(0);
    cuadra.magnitud(id, 'La entropía generada', SG, 'kW/K');
  });

  it('y se destruyen 9,53 kW, por el balance de exergía que pide el enunciado', () => {
    // exergía de flujo salvo una constante, que se va porque entra la misma masa que sale
    const b = (h: number, s: number) => h - T0 * s;
    const porBalance = m1 * b(h1, s1) - mL * b(hL, sL) - mV * b(hV, sV) - qPerdido * (1 - T0 / Tsup);
    expect(Math.abs(porBalance - T0 * SG)).toBeLessThan(1e-9 * porBalance);
    cuadra.magnitud(id, 'La exergía destruida', porBalance, 'kW');
  });
});
