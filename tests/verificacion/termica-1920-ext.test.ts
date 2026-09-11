/**
 * La extraordinaria de Ingeniería Térmica de febrero de 2020.
 *
 * El butano de exponente −4 se recalcula por el primer principio con
 * R = c_p − c_v, no con la fórmula de γ: el enunciado da γ = 1,1 redondeado
 * cuando c_p/c_v vale 1,1005, y los dos caminos tienen que aterrizar igual. En
 * el intercambiador, la misma placa lleva dos correlaciones.
 */
import { describe, expect, it } from 'vitest';
import { convocatoria } from './corpus';

const cuadra = convocatoria('ingenieria-termica', '2019-2020-ext');
const K = 273.15;
const g = 9.8; // la de los apuntes y la de la resolución

describe('1 · cinco signos, y los cinco negativos', () => {
  const id = 'exter1920-ext-1-cinco-signos-y-los-cinco-negativos';
  const [n, m, gamma, cp, cv] = [-4, 2, 1.1, 1.577, 1.433];
  const R = cp - cv;
  const [T1, T2] = [50 + K, 20 + K];

  it('el volumen baja a 0,9807 del inicial, igual por la politrópica que por la ecuación de estado', () => {
    const porPolitropica = (T1 / T2) ** (1 / (n - 1));
    // P₂/P₁ por la politrópica en temperaturas, y después v₂/v₁ = (T₂/T₁)/(P₂/P₁)
    const P21 = (T2 / T1) ** (n / (n - 1));
    const porEstado = T2 / T1 / P21;
    expect(Math.abs(porPolitropica - porEstado)).toBeLessThan(1e-12);
    expect(P21).toBeLessThan(1); // y la presión baja con él
    cuadra(id, 'El volumen específico', porEstado);
  });

  // q = c_v·dT + R·dT/(1 − n), sin γ
  const cn = cv - R / (n - 1);

  it('c_n vale 1,4617 kJ/(kg·K), entre c_v y c_p', () => {
    // la fórmula con γ = 1,1 solo se aparta por el redondeo de γ
    expect(Math.abs(cn - cv * ((n - gamma) / (n - 1)))).toBeLessThan(5e-4);
    expect(cn).toBeGreaterThan(cv);
    expect(cn).toBeLessThan(cp);
    cuadra.magnitud(id, 'El calor específico politrópico', cn, 'kJ/(kg K)');
  });

  it('y cede 87,7 kJ: el trabajo es 1,7 y todo lo demás es calor', () => {
    const dU = m * cv * (T2 - T1);
    const W = (m * R * (T2 - T1)) / (1 - n);
    const Q = dU + W;
    expect(Math.abs(Q - m * cn * (T2 - T1))).toBeLessThan(1e-9);
    expect(W).toBeLessThan(0);
    expect(Math.abs(W / Q)).toBeLessThan(0.03);
    // la entropía del gas baja, y no por eso la generada es negativa: la trampa del ejercicio
    expect(m * cn * Math.log(T2 / T1)).toBeLessThan(0);
    cuadra.magnitud(id, 'El calor intercambiado', Q, 'kJ');
  });
});

describe('3 · las dos caras de la misma placa', () => {
  const id = 'exter1920-ext-3-las-dos-caras-de-la-misma-placa';
  const [A, P, c] = [4 * 6, 2 * (4 + 6), 4182];
  const L = A / P;
  // cada cara a la media de la corriente que la toca, como dice la nota
  const [tSup, tInf] = [(20 + 25) / 2, (40 + 39) / 2];
  const [aSup, aInf] = [18, 23];
  const Ra = (dT: number, tPel: number, rho: number, mu: number, Pr: number) =>
    ((g / (tPel + K)) * dT * L ** 3 * rho ** 2 * Pr) / mu ** 2;

  const pelSup = (tSup + aSup) / 2;
  const hSup = (0.15 * Ra(tSup - aSup, pelSup, 1.203, 1.8262e-5, 0.7308) ** (1 / 3) * 0.02516) / L;
  const qSup = hSup * A * (tSup - aSup);

  /* La cara de abajo lleva la correlación de la placa caliente mirando hacia
     abajo, 0,27·Ra^(1/4). No la da ninguna pregunta: es del anexo, y el propio
     ejercicio la nombra en un distractor del paso de la cara de arriba. */
  const pelInf = (tInf + aInf) / 2;
  const hInf = (0.27 * Ra(tInf - aInf, pelInf, 1.1593, 1.8778e-5, 0.7279) ** (1 / 4) * 0.02597) / L;
  const qInf = hInf * A * (tInf - aInf);

  it('arriba, 2,949 W/(m²·K), con las películas a 20,25 y 31,25 °C que publica la nota', () => {
    expect(pelSup).toBeCloseTo(20.25, 10);
    expect(pelInf).toBeCloseTo(31.25, 10);
    cuadra.magnitud(id, 'El coeficiente de la cara de arriba', hSup, 'W/(m^2 K)');
  });

  it('la fría lleva 0,0152 kg/s: se queda con la mitad de lo que le da la caliente', () =>
    cuadra.magnitud(id, 'El gasto de la corriente fría', (2 * qSup - qSup) / (c * (25 - 20)), 'kg/s'));

  it('y la caliente 0,2766 kg/s, y abajo se pierde más con peor coeficiente', () => {
    // los 519,9 W que la pregunta da hechos, recalculados con la correlación de abajo
    expect(Math.abs(qInf - 519.9) / 519.9).toBeLessThan(2e-3);
    expect(hInf).toBeLessThan(hSup);
    expect(qInf).toBeGreaterThan(qSup);
    const mC = (qInf + 2 * qSup) / (c * (40 - 39));
    const mF = qSup / (c * (25 - 20));
    // el balance global: lo que suelta la caliente = lo que se queda la fría + lo que se llevan los dos aires
    expect(Math.abs(mC * c * 1 - (mF * c * 5 + qSup + qInf))).toBeLessThan(1e-9);
    // y la fría conserva el 27,5 %
    expect((mF * c * 5) / (mC * c * 1)).toBeCloseTo(0.275, 2);
    cuadra.magnitud(id, 'El gasto de la corriente caliente', mC, 'kg/s');
  });
});
