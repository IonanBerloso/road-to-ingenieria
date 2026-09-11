/**
 * La extraordinaria de Ingeniería Térmica de febrero de 2021.
 *
 * Tres ejercicios independientes, y dos erratas de la resolución oficial que
 * el sitio corrige: el 1,005 del aire en la exergía del agua y el v' de 2 bar
 * con un cero de menos. Se rehace con los datos buenos, y se comprueba que la
 * errata del intercambiador da justo el distractor que el corpus señala.
 */
import { describe, expect, it } from 'vitest';
import { convocatoria } from './corpus';

const cuadra = convocatoria('ingenieria-termica', '2020-2021-ext');
const K = 273.15; // la resolución usa 273

describe('2 · el aire que entra en el estado muerto', () => {
  const id = 'exter2021-ext-2-el-aire-que-entra-en-el-estado-muerto';
  const [cW, cA] = [4.182, 1.005]; // los de la pregunta, kJ/(kg·K)
  const T0 = 20 + K;
  const [T1, T2] = [60 + K, 40 + K]; // agua
  const [T3, T4] = [20 + K, 35 + K]; // aire: entra en el estado muerto y sube 15
  const r = (cW * (T1 - T2)) / (cA * (T4 - T3)); // kg de aire por kg de agua
  // ψe − ψs de un incompresible, con el mismo c en los dos términos
  const baja = (c: number, cEntropia: number, Te: number, Ts: number) =>
    c * (Te - Ts) - T0 * cEntropia * Math.log(Te / Ts);
  const cedeAgua = baja(cW, cW, T1, T2);
  const ganaAire = -baja(cA, cA, T3, T4);

  it('hacen falta 5,548 kg de aire por kilo de agua', () => cuadra(id, 'El aire necesario', r));

  it('el agua pierde 7,74 kJ/kg de exergía, y con la errata oficial saldrían 65,4', () => {
    expect(baja(cW, cA, T1, T2)).toBeCloseTo(65.4, 1);
    cuadra.magnitud(id, 'La exergía que pierde el agua', cedeAgua, 'kJ/kg');
  });

  it('y el rendimiento exergético es del 26,7 %, igual por el cociente que por Guy-Stodola', () => {
    const SG = cW * Math.log(T2 / T1) + r * cA * Math.log(T4 / T3); // por kg de agua
    const porCociente = (r * ganaAire) / cedeAgua;
    const porDestruida = 1 - (T0 * SG) / cedeAgua;
    expect(Math.abs(porCociente - porDestruida)).toBeLessThan(1e-9);
    cuadra(id, 'El rendimiento exergético', 100 * porCociente);
  });
});

describe('3 · la esfera en la corriente, y dos correlaciones que no coinciden', () => {
  const id = 'exter2021-ext-3-la-esfera-y-las-dos-correlaciones-que-no-coinciden';
  const [D, c, dT] = [0.04, 2, 60 - 15];
  const A = Math.PI * D * D; // la esfera entera, no el círculo
  // la nota del enunciado: agua a 15 °C para Whitaker y a 37,5 °C para la otra
  const w = { rho: 999.1, k: 0.589, mu: 1.138e-3, Pr: 8.09 };
  const p = { rho: 993.05, k: 0.627, mu: 6.865e-4 };
  const ReW = (w.rho * c * D) / w.mu;
  const NuW = 2 + (0.4 * ReW ** 0.5 + 0.06 * ReW ** (2 / 3)) * w.Pr ** 0.4;
  const hW = (NuW * w.k) / D;
  const ReP = (p.rho * c * D) / p.mu;
  const QP = ((0.33 * ReP ** 0.6 * p.k) / D) * A * dT;

  it('el Reynolds de Whitaker, 70.236, cabe en su rango', () => {
    expect(ReW).toBeGreaterThanOrEqual(3.5);
    expect(ReW).toBeLessThanOrEqual(80000);
    cuadra(id, 'El Reynolds de Whitaker', ReW);
  });

  it('su coeficiente es de 7.103 W/(m²·K)', () =>
    cuadra.magnitud(id, 'El coeficiente de Whitaker', hW, 'W/(m^2 K)'));

  it('y la esfera disipa 1.607 W por Whitaker', () =>
    cuadra.magnitud(id, 'El calor, por Whitaker', hW * A * dT, 'W'));

  it('y 1.277 W por la alternativa: la viscosidad a la de película sube el Reynolds un 65 %', () => {
    expect(ReP / ReW).toBeGreaterThan(1.6);
    expect((hW * A * dT) / QP).toBeGreaterThan(1.2); // un 26 % de diferencia, y las dos valen
    cuadra.magnitud(id, 'El calor, por la correlación alternativa', QP, 'W');
  });
});

describe('1 · el depósito que triplica su presión y sigue siendo mezcla', () => {
  const id = 'exter2021-ext-1-el-deposito-que-triplica-la-presion-y-sigue-siendo-mezcla';
  const m = 2;
  // la nota del enunciado, a 2 bar y a 6 bar
  const a2 = { vf: 0.0010605, vg: 0.8857, uf: 504.49, ug: 2529.5, sf: 1.5301, sg: 7.1271 };
  const a6 = { vf: 0.001101, vg: 0.3157, uf: 669.9, ug: 2567.4, sf: 1.9312, sg: 6.76 };
  const lee = (f: number, g: number, x: number) => f + x * (g - f);
  const x1 = 0.2;
  const v = lee(a2.vf, a2.vg, x1); // rígido: el mismo al principio y al final
  const x2 = (v - a6.vf) / (a6.vg - a6.vf);
  const Q = m * (lee(a6.uf, a6.ug, x2) - lee(a2.uf, a2.ug, x1)); // rígido: Q = ΔU
  const dS = m * (lee(a6.sf, a6.sg, x2) - lee(a2.sf, a2.sg, x1));
  const Tfuente = 300 + K;

  it('el volumen específico es 0,178 m³/kg', () => cuadra.magnitud(id, 'El volumen específico', v, 'm^3/kg'));

  it('a 6 bar ese volumen cae dentro de la campana: título 0,5623 y 158,9 °C sin más cuentas', () => {
    expect(x2).toBeGreaterThan(0);
    expect(x2).toBeLessThan(1);
    cuadra(id, 'El título final', x2);
  });

  it('el agua recibe 1.654,8 kJ', () => cuadra.magnitud(id, 'El calor aportado', Q, 'kJ'));

  it('y el universo genera 1,106 kJ/K', () => {
    const SG = dS - Q / Tfuente;
    expect(SG).toBeGreaterThan(0);
    cuadra.magnitud(id, 'La entropía generada en el universo', SG, 'kJ/K');
  });
});
