/**
 * La extraordinaria de Ingeniería Térmica de febrero de 2022.
 *
 * Su cifra más frágil es la exergía de la turbina de gas: Δs es la resta de
 * dos términos de 0,86, y con R sacado de c_p y γ el recálculo entra por poco
 * en el 3 % que declara el corpus. El aislante se rehace desde los h de las
 * preguntas: las propiedades del aire en reposo no están en el corpus.
 */
import { describe, expect, it } from 'vitest';
import { convocatoria } from './corpus';

const cuadra = convocatoria('ingenieria-termica', '2021-2022-ext');
const K = 273.15; // la resolución usa 273

describe('1 · la mezcla que sale sobrecalentada', () => {
  const id = 'exter2122-ext-1-la-mezcla-que-sale-sobrecalentada';
  const T0 = 0 + K; // el punto triple: ahí las tablas ponen h₀ = s₀ = 0
  const m1 = 0.5;
  // valores de tabla que dan las preguntas, todos a 1,4882 bar
  const [h1, s1] = [3485, 8.6475];
  const [h2, s2] = [2247.49, 6.0681]; // saturada a 111 °C, x = 0,8
  const [h3, s3] = [2948, 7.8]; // sobrecalentada con s = 7,8
  const m2 = (m1 * (h1 - h3)) / (h3 - h2);
  const m3 = m1 + m2;
  const af = (h: number, s: number) => h - T0 * s;
  const entra = m1 * af(h1, s1) + m2 * af(h2, s2);
  const sale = m3 * af(h3, s3);
  const SG = m3 * s3 - m1 * s1 - m2 * s2;

  it('entran 0,383 kg/s de vapor húmedo', () => cuadra.magnitud(id, 'El gasto de vapor húmedo', m2, 'kg/s'));

  it('se destruyen 65,5 kW, los mismos por el balance de exergía que por Guy-Stodola', () => {
    const porBalance = entra - sale;
    expect(Math.abs(porBalance - T0 * SG)).toBeLessThan(1e-9 * porBalance);
    cuadra.magnitud(id, 'La exergía destruida', porBalance, 'kW');
  });

  it('y el rendimiento exergético es del 91,7 %', () => cuadra(id, 'El rendimiento exergético', sale / entra));
});

describe('2 · la turbina de gas, y los dos rendimientos que casi coinciden', () => {
  const id = 'exter2122-ext-2-la-turbina-de-gas-y-los-dos-rendimientos';
  const [m, cp, g] = [2, 1.005, 1.4]; // c_p y γ, los de las preguntas
  const R = (cp * (g - 1)) / g; // R = c_p − c_v con c_v = c_p/γ: 0,2871
  const [T1, T2, P1, P2] = [800 + K, 195 + K, 20, 1];
  const T0 = 20 + K;
  const W = m * cp * (T1 - T2);
  const T2s = T1 * (P2 / P1) ** ((g - 1) / g);
  const ds = cp * Math.log(T2 / T1) - R * Math.log(P2 / P1);

  it('la turbina da 1.216 kW', () => cuadra.magnitud(id, 'La potencia', W, 'kW'));

  it('sin irreversibilidades saldría a 455,9 K, doce grados por debajo de la real', () => {
    expect(T2 - T2s).toBeGreaterThan(10);
    cuadra.magnitud(id, 'La temperatura que habría a la salida sin irreversibilidades', T2s, 'K');
  });

  it('se destruyen 15,2 kW, los mismos por Guy-Stodola que por el balance de exergía', () => {
    /* Con este R el recálculo da 15,5 kW, un 2,4 % sobre los 15,17 publicados
       y dentro de su 3 %. No es un error de nadie: la resolución usa R = 0,287
       y la resta de dos términos de 0,86 amplifica esa cuarta cifra. */
    expect(ds).toBeGreaterThan(0);
    const porGuyStodola = T0 * m * ds;
    const porBalance = m * (cp * (T1 - T2) + T0 * ds) - W; // ṁ(a_f1 − a_f2) − Ẇ
    expect(Math.abs(porBalance - porGuyStodola)).toBeLessThan(1e-9 * porGuyStodola);
    cuadra.magnitud(id, 'La exergía destruida', porGuyStodola, 'kW');
  });

  it('y los dos rendimientos, 98 % y 98,8 %, casi coinciden sin ser el mismo', () => {
    const etaS = (T1 - T2) / (T1 - T2s);
    const etaB = W / (W + T0 * m * ds);
    expect(etaS).toBeGreaterThan(0.97);
    expect(etaB - etaS).toBeGreaterThan(0);
    expect(etaB - etaS).toBeLessThan(0.02);
  });
});

describe('3 · el aislante que hay que identificar', () => {
  const id = 'exter2122-ext-3-el-aislante-que-hay-que-identificar';
  const [D1, D2, D3, L, kTubo] = [0.05, 0.07, 0.08, 10, 2];
  /* Los h exteriores salen de Nu = 0,53·Ra^¼ con el aire a 40 y a 35 °C, y esas
     propiedades no están en el corpus: se usan los que da cada pregunta. */
  const [hA, hB] = [6.49, 5.87];
  const Qa = hA * Math.PI * D2 * L * (60 - 20);
  const Qb = hB * Math.PI * D3 * L * (50 - 20);

  it('sin aislante se pierden 571 W', () => cuadra.magnitud(id, 'El flujo sin aislante', Qa, 'W'));

  it('con aislante, 443 W, y los dos h son de la misma correlación', () => {
    /* Con Nu ∝ Ra^¼ y las propiedades fijas, h ∝ (ΔT/D)^¼. La película pasa de
       40 a 35 °C y eso mueve el cociente medio punto; si los dos h de las
       preguntas no salieran de la misma ley, se iría mucho más. */
    const cociente = hB / hA / ((30 / 40) * (D2 / D3)) ** 0.25;
    expect(Math.abs(cociente - 1)).toBeLessThan(0.01);
    cuadra.magnitud(id, 'El flujo con aislante', Qb, 'W');
  });

  it('y el aislante conduce 0,07 W/(m·K), del orden de una espuma densa', () => {
    const tInterfaz = 63.43; // la da la pregunta
    // la pared sola ya se lleva 1,2 K, y la interfaz deja sitio a la película interior
    expect(tInterfaz).toBeLessThan(65 - (Qb * Math.log(D2 / D1)) / (2 * Math.PI * kTubo * L));
    const k = (Qb * Math.log(D3 / D2)) / (2 * Math.PI * L * (tInterfaz - 50));
    cuadra.magnitud(id, 'La conductividad del aislante', k, 'W/(m K)');
  });
});
