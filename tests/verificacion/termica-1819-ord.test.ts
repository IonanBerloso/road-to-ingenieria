/**
 * La ordinaria de Ingeniería Térmica de enero de 2019.
 *
 * Un termo, un radiador y una politrópica abierta, y las tres cadenas se
 * cierran por un segundo camino: la exergía destruida del termo por
 * Guy-Stodola, el radiador que pide 17 módulos con las dos correlaciones del
 * anexo, y el trabajo técnico integrado a lo largo de la curva.
 */
import { describe, expect, it } from 'vitest';
import { convocatoria } from './corpus';
import { integra } from './numerico';

const cuadra = convocatoria('ingenieria-termica', '2018-2019-ord');
const K = 273.15;
const g = 9.8; // la de los apuntes y la de la resolución

describe('2 · el termo eléctrico y el siete por ciento', () => {
  const id = 'exter1819-ord-2-el-termo-electrico-y-el-siete-por-ciento';
  // la densidad del líquido a 37,5 °C es la del paso de reconocer; c, la de la pregunta
  const [V, rho, c] = [0.05, 993.15, 4.186];
  const m = V * rho;
  const [T1, T2, TR, T0] = [15 + K, 60 + K, 89 + K, 15 + K];
  const Q = m * c * (T2 - T1);
  const dS = m * c * Math.log(T2 / T1);
  // el agua arranca en el estado muerto: todo lo que tiene al final lo ha ganado aquí
  const dB = Q - T0 * dS;

  it('hacen falta 1,3 kW como mínimo', () => cuadra.magnitud(id, 'La potencia mínima', Q / 7200, 'kW'));

  it('el agua gana 662,6 kJ de exergía', () => cuadra.magnitud(id, 'La exergía que gana el agua', dB, 'kJ'));

  it('y se destruyen 1.249,6 kJ, los mismos por el balance que por Guy-Stodola', () => {
    const entra = (1 - T0 / TR) * Q;
    const porBalance = entra - dB;
    expect(Math.abs(porBalance - T0 * (dS - Q / TR))).toBeLessThan(1e-9 * porBalance);
    // la cadena de la resolución: del enchufe al 20 %, y al agua el 7 %
    expect(entra / Q).toBeCloseTo(0.2, 1);
    expect(dB / Q).toBeCloseTo(0.07, 2);
    cuadra.magnitud(id, 'La exergía destruida', porBalance, 'kJ');
  });
});

describe('1 · diecisiete módulos y no dieciséis', () => {
  const id = 'exter1819-ord-1-diecisiete-modulos-y-no-dieciseis';
  // aire a la película, 40 °C, de la nota del enunciado
  const [rho, k, mu, Pr] = [1.127, 0.02662, 1.918e-5, 0.7255];
  const [L, Amod, Ts, Tinf, Qpedida] = [1, 0.8, 60, 20, 2000];
  const Ra = (g * (1 / ((Ts + Tinf) / 2 + K)) * (Ts - Tinf) * L ** 3 * rho ** 2 * Pr) / mu ** 2;
  const modulos = (Nu: number) => Qpedida / (((Nu * k) / L) * Amod * (Ts - Tinf));
  const h = (0.1 * Ra ** (1 / 3) * k) / L;

  it('el Rayleigh es 3,14·10⁹, justo por encima del cambio de correlación', () => {
    expect(Ra).toBeGreaterThan(1e9);
    /* El corpus lo publica como «3.137e9», y en la primera pasada el lector
       de corpus.ts no sabía leer la notación científica: el paso se quedó sin
       comprobar. Arreglado en el lector el 12 de septiembre de 2026, con su
       caso en corpus.test.ts. */
    cuadra(id, 'El número de Rayleigh', Ra);
  });

  it('h vale 3,9 W/(m²·K), con la de exponente 1/3', () =>
    cuadra.magnitud(id, 'El coeficiente de convección', h, 'W/(m^2 K)'));

  it('y son 17: los 16,04 se cubren hacia arriba, y la otra correlación también pide 17', () => {
    const exactos = modulos(0.1 * Ra ** (1 / 3));
    expect(exactos).toBeGreaterThan(16);
    expect(exactos).toBeLessThan(16.1);
    expect(Math.ceil(modulos(0.59 * Ra ** (1 / 4)))).toBe(17);
    cuadra(id, 'Cuántos módulos', Math.ceil(exactos));
  });
});

describe('3 · el mismo proceso con dos trabajos de signo contrario', () => {
  const id = 'exter1819-ord-3-el-mismo-proceso-con-dos-trabajos-de-signo-contrario';
  // γ es de la pregunta; R' = 0,287 de la pista, y c_p = γR'/(γ − 1) = 1,0045 sale de ahí
  const [m, n, gamma, R] = [4, -2.6, 1.4, 0.287];
  const cv = R / (gamma - 1);
  const cp = cv + R;
  const [T1, T2] = [18 + K, 34 + K];
  const cn = cv * ((gamma - n) / (1 - n));
  const Q = m * cn * (T2 - T1);

  it('c_n vale 0,7972 kJ/(kg·K), igual por la fórmula que por el primer principio', () => {
    expect(Math.abs(cn - (cv - R / (n - 1)))).toBeLessThan(1e-12);
    cuadra.magnitud(id, 'El calor específico politrópico', cn, 'kJ/(kg K)');
  });

  it('entran 51,02 kW de calor', () => cuadra.magnitud(id, 'El calor', Q, 'kW'));

  it('y el aire recibe 13,27 kW por el eje: −∫v·dP recorrida sobre la curva, contra el primer principio', () => {
    /* P = C·v^(−n), recorriendo v de v₁ a v₂; la presión inicial es arbitraria
       y se cancela, así que se toma 1 bar. */
    const P1 = 100;
    const v1 = (R * T1) / P1;
    const v2 = v1 * (T1 / T2) ** (1 / (n - 1));
    const C = P1 * v1 ** n;
    const Pde = (v: number) => C * v ** -n;
    const tecnico = m * integra((v) => -v * (-n * C * v ** (-n - 1)), v1, v2, 1e-12);
    const frontera = m * integra(Pde, v1, v2, 1e-12);
    expect(v2).toBeGreaterThan(v1);
    expect(frontera).toBeGreaterThan(0); // en un cilindro se expandiría haciendo trabajo...
    expect(tecnico).toBeLessThan(0); // ...y por el eje lo recibe
    expect(Math.abs(tecnico - n * frontera)).toBeLessThan(1e-8);
    expect(Math.abs(tecnico - (Q - m * cp * (T2 - T1)))).toBeLessThan(1e-8);
    cuadra.magnitud(id, 'El trabajo técnico', tecnico, 'kW');
  });
});
