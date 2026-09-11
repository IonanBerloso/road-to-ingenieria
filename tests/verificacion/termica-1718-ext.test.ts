/**
 * La extraordinaria de Ingeniería Térmica de junio de 2018, la última
 * celebrada en junio.
 *
 * El ciclo de tres politrópicas trae su propia comprobación —el calor neto
 * tiene que ser el trabajo neto—, y aquí se exige con el trabajo integrado
 * tramo a tramo y el c_v coherente con R' y γ, que es justo lo que la
 * resolución oficial no cumplía con su 0,737.
 */
import { describe, expect, it } from 'vitest';
import { convocatoria } from './corpus';
import { integra } from './numerico';

const cuadra = convocatoria('ingenieria-termica', '2017-2018-ext');
const K = 273.15;

describe('3 · sesenta centímetros de fachada y tres vatios', () => {
  const id = 'exter1718-ext-3-sesenta-centimetros-de-fachada-y-tres-vatios';
  const [eInt, kInt, eExt, kExt, h] = [0.4, 0.1, 0.2, 0.3, 11];
  const [tSup, tAire] = [20, 5];
  const [rInt, rExt, rPel] = [eInt / kInt, eExt / kExt, 1 / h];
  const q = (tSup - tAire) / (rInt + rExt + rPel);

  it('pasan 3,15 W por metro cuadrado, y la capa interior es el 84 % del aislamiento', () => {
    expect(rInt / (rInt + rExt + rPel)).toBeCloseTo(0.84, 2);
    cuadra.magnitud(id, 'El flujo de calor', q, 'W/m^2');
  });

  it('la cara exterior está a 5,28 °C, bajando desde dentro y subiendo desde el aire', () => {
    const desdeDentro = tSup - q * (rInt + rExt);
    const desdeFuera = tAire + q * rPel;
    expect(Math.abs(desdeDentro - desdeFuera)).toBeLessThan(1e-12);
    cuadra.magnitud(id, 'La temperatura de la superficie exterior', desdeDentro, '°C');
  });
});

describe('1 · el ciclo reversible que rinde menos del diez por ciento', () => {
  const id = 'exter1718-ext-1-el-ciclo-reversible-que-rinde-el-diez-por-ciento';
  const [R, gamma] = [0.297, 1.4]; // la nota del enunciado
  const cv = R / (gamma - 1);
  const [P1, P2, P3] = [1100, 800, 400]; // kPa
  const [T1, T2] = [777 + K, 1367 + K];
  const n31 = 2.5;
  const v = (P: number, T: number) => (R * T) / P;
  // Pvⁿ = cte entre dos estados: n = −ln(Pb/Pa)/ln(vb/va)
  const exponente = (Pa: number, Ta: number, Pb: number, Tb: number) =>
    -Math.log(Pb / Pa) / Math.log(v(Pb, Tb) / v(Pa, Ta));

  const n12 = exponente(P1, T1, P2, T2);
  // el estado 3 por el tramo 3-1: su volumen por Pvⁿ desde el 1, y la temperatura por la ecuación de estado
  const v3 = v(P1, T1) * (P1 / P3) ** (1 / n31);
  const T3 = (P3 * v3) / R;
  const n23 = exponente(P2, T2, P3, T3);
  const cn = (n: number) => cv - R / (n - 1); // el primer principio, sin la fórmula de γ

  it('el tramo 1-2 tiene exponente 0,4166', () => cuadra(id, 'El exponente del tramo 1-2', n12));

  it('el estado 3 está a 572,3 K, igual por los volúmenes que por la relación en temperaturas', () => {
    expect(Math.abs(T3 - T1 * (P3 / P1) ** ((n31 - 1) / n31))).toBeLessThan(1e-9);
    cuadra.magnitud(id, 'La temperatura del estado 3', T3, 'K');
  });

  it('el 2-3 tiene exponente −1,927: presión y volumen bajan juntos', () => {
    expect(n23).toBeLessThan(0);
    cuadra(id, 'El exponente del tramo 2-3', n23);
  });

  it('su calor específico politrópico es 0,844, positivo con exponente negativo', () => {
    expect(Math.abs(cn(n23) - cv * ((gamma - n23) / (1 - n23)))).toBeLessThan(1e-12);
    cuadra.magnitud(id, 'El calor específico del tramo 2-3', cn(n23), 'kJ/(kg K)');
  });

  it('y el ciclo rinde el 9,8 %, con el calor neto igual al trabajo integrado', () => {
    const tramos: [number, number, number, number, number][] = [
      [P1, T1, P2, T2, n12],
      [P2, T2, P3, T3, n23],
      [P3, T3, P1, T1, n31],
    ];
    const q = tramos.map(([, Ta, , Tb, n]) => cn(n) * (Tb - Ta));
    // el trabajo de cada tramo, ∫P·dv sobre su politrópica, no por R·ΔT/(1 − n)
    const w = tramos.map(([Pa, Ta, Pb, Tb, n]) =>
      integra((x) => Pa * (v(Pa, Ta) / x) ** n, v(Pa, Ta), v(Pb, Tb), 1e-10),
    );
    const suma = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
    expect(q.every((_, i) => cn(tramos[i][4]) > 0)).toBe(true);
    expect(Math.abs(suma(q) - suma(w))).toBeLessThan(1e-7);
    const eta = (100 * suma(w)) / suma(q.filter((x) => x > 0));
    // Carnot entre los extremos daría el 65 %: reversible no es Carnot
    expect(1 - T3 / T2).toBeCloseTo(0.651, 2);
    cuadra(id, 'El rendimiento del ciclo', eta);
  });
});

describe('2 · los signos antes de la cuenta', () => {
  const id = 'exter1718-ext-2-los-signos-antes-de-la-cuenta';
  const [V1, P1, T1, T2, Tf, n] = [0.1, 480, 305 + K, 41 + K, 5 + K, -1.4];
  const [cp, cv, R] = [1.005, 0.718, 0.287]; // la nota del enunciado
  const m = (P1 * V1) / (R * T1);
  const P2 = P1 * (T2 / T1) ** (n / (n - 1));
  const V2 = (m * R * T2) / P2;
  // ∫P·dV sobre P = P₁·(V₁/V)ⁿ, no por la fórmula de la politrópica
  const W = integra((V) => P1 * (V1 / V) ** n, V1, V2, 1e-10);
  const Q = m * cv * (T2 - T1) + W;

  it('el aire recibe 9,1 kJ: el volumen baja, y la integral da lo mismo que m·R·ΔT/(1 − n)', () => {
    expect(V2).toBeLessThan(V1);
    expect(Math.abs(W - (m * R * (T2 - T1)) / (1 - n))).toBeLessThan(1e-8);
    cuadra.magnitud(id, 'El trabajo', W, 'kJ');
  });

  it('y cede 64 kJ, igual por el primer principio que por c_n', () => {
    const cn = cv * ((n - cp / cv) / (n - 1));
    expect(Math.abs(Q - m * cn * (T2 - T1))).toBeLessThan(1e-8);
    expect(Q).toBeLessThan(m * cv * (T2 - T1)); // cede más de lo que baja U
    cuadra.magnitud(id, 'El calor', Q, 'kJ');
  });

  it('y el universo genera 0,0823 kJ/K aunque la entropía del aire baje', () => {
    const dSAire = m * (cp * Math.log(T2 / T1) - R * Math.log(P2 / P1));
    // por c_n sale lo mismo, porque c_p − c_v = R' exactamente con estos datos
    expect(Math.abs(dSAire - m * (cv - R / (n - 1)) * Math.log(T2 / T1))).toBeLessThan(1e-12);
    expect(dSAire).toBeLessThan(0);
    const SG = dSAire - Q / Tf;
    expect(SG).toBeGreaterThan(0);
    cuadra.magnitud(id, 'La entropía generada en el universo', SG, 'kJ/K');
  });
});
