/**
 * La extraordinaria de Ingeniería Térmica del 30 de enero de 2023.
 *
 * La tobera se rehace desde las tablas del sitio, con la doble interpolación
 * que enseña el ejercicio, y se contrasta con la formulación completa: la
 * resolución oficial la lee en el Mollier. El nitrógeno llega sin R ni
 * calores específicos en el enunciado: se toman de la resolución, que es de
 * donde los toma el corpus, y aquí se comprueba al menos que casan entre sí.
 * La tubería defiende una cifra en la que el sitio se aparta de la oficial: el
 * Nusselt es 341,8, no 371,7.
 */
import { describe, expect, it } from 'vitest';
import { convocatoria } from './corpus';
import tablas from '../../src/content/tablas/vapor-de-agua.json';
import { estadoDePT } from '../../src/lib/iapws95';

const cuadra = convocatoria('ingenieria-termica', '2022-2023-ext');
const K = 273.15; // la resolución usa 273

describe('1 · la tobera de 600 m/s, y el volumen que el Mollier no dice', () => {
  const id = 'exter2223-ext-1-la-tobera-y-el-volumen-que-el-mollier-no-dice';
  const [m, c2] = [2, 600];
  const bloque = (p: number) => {
    const b = tablas.sobrecalentado.bloques.find((x) => x.p === p);
    if (!b || b.Tsat == null || !b.saturado) throw new Error(`no hay isobara de ${p} bar`);
    return b;
  };
  // [T, v, u, h, s] de la fila de 300 °C a 20 bar
  const entrada = bloque(20).filas.find((f) => f[0] === 300)!;
  const [v1, h1, s1] = [entrada[1], entrada[3], entrada[4]];
  const h2 = h1 - c2 ** 2 / 2 / 1000;

  /* El punto de una isobara con s = s1, entre sus dos filas vecinas; la de
     saturación entra como una fila más, a Tsat. `Tsat` deja probar la
     cabecera errada del anexo. */
  const conEntropia = (p: number, s: number, Tsat?: number) => {
    const b = bloque(p);
    const filas = [[Tsat ?? b.Tsat!, ...b.saturado!], ...b.filas];
    const i = filas.findIndex((f, j) => j < filas.length - 1 && s >= f[4] && s <= filas[j + 1][4]);
    if (i < 0) throw new Error(`s = ${s} no cae en la isobara de ${p} bar`);
    const [a, c] = [filas[i], filas[i + 1]];
    const f = (s - a[4]) / (c[4] - a[4]);
    return { T: a[0] + f * (c[0] - a[0]), v: a[1] + f * (c[1] - a[1]), h: a[3] + f * (c[3] - a[3]) };
  };
  const salida = (s: number, Tsat8?: number) => {
    const [a, b] = [conEntropia(8, s, Tsat8), conEntropia(10, s)];
    const w = (h2 - a.h) / (b.h - a.h);
    return { p: 8 + 2 * w, T: a.T + w * (b.T - a.T), v: a.v + w * (b.v - a.v), w };
  };
  const s2 = salida(s1);

  it('el vapor sale con h = 2844,2 kJ/kg: 600 m/s son 180 kJ/kg', () =>
    cuadra.magnitud(id, 'La entalpía de salida', h2, 'kJ/kg'));

  it('se expande hasta 9,14 bar, entre las isobaras de 8 y 10', () => {
    expect(s2.w).toBeGreaterThan(0);
    expect(s2.w).toBeLessThan(1); // 2844,2 cae entre las dos entalpías
    cuadra.magnitud(id, 'La presión de salida', s2.p, 'bar');
  });

  it('sale a 205,0 °C, 95 grados más frío y todavía sobrecalentado', () => {
    // a 9 bar el agua satura a 175,35 °C: por encima de eso es vapor
    const sat9 = tablas.saturacionP.filas.find((r) => r[0] === 9)!;
    expect(s2.T).toBeGreaterThan(sat9[1] + 25);
    expect(300 - s2.T).toBeCloseTo(95, 0);
    cuadra.magnitud(id, 'La temperatura de salida', s2.T, '°C');
  });

  it('y la sección de salida es de 7,72 cm²', () =>
    cuadra.magnitud(id, 'El área de salida', (m * s2.v) / c2, 'm^2'));

  it('la formulación completa, sin interpolar, da lo mismo salvo un 1 % en el volumen', () => {
    // Newton en (p, T) sobre h = h2 y s = s1, en MPa y K
    let [p, T] = [s2.p / 10, s2.T + K];
    for (let k = 0; k < 30; k++) {
      const [e, ep, eT] = [estadoDePT(p, T), estadoDePT(p * 1.0001, T), estadoDePT(p, T + 0.01)];
      const [a, b] = [(ep.h - e.h) / (p * 1e-4), (eT.h - e.h) / 0.01];
      const [c, d] = [(ep.s - e.s) / (p * 1e-4), (eT.s - e.s) / 0.01];
      const [F, G] = [e.h - h2, e.s - s1];
      const det = a * d - b * c;
      p -= (F * d - G * b) / det;
      T -= (G * a - F * c) / det;
    }
    const exacto = estadoDePT(p, T);
    expect(Math.abs(exacto.h - h2)).toBeLessThan(1e-6);
    expect(Math.abs(p * 10 - s2.p)).toBeLessThan(0.005); // 9,140 frente a 9,141 bar
    expect(Math.abs(T - K - s2.T)).toBeLessThan(0.5); // 204,6 frente a 205,0 °C
    expect(s2.v / exacto.v - 1).toBeGreaterThan(0.005);
    expect(s2.v / exacto.v - 1).toBeLessThan(0.015);
  });

  it('la resolución oficial: v a 205 °C y 9,2 bar da 0,23086 m³/kg y 7,695 cm²', () => {
    const fila = (p: number, T: number) => bloque(p).filas.find((f) => f[0] === T)!;
    const lerp = (x: number, x0: number, x1: number, y0: number, y1: number) =>
      y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
    const vA = (p: number) => lerp(205, 200, 250, fila(p, 200)[1], fila(p, 250)[1]);
    const v = lerp(9.2, 8, 10, vA(8), vA(10));
    expect(v).toBeCloseTo(0.23086, 5);
    expect(((m * v) / c2) * 1e4).toBeCloseTo(7.695, 3);
  });

  it('su s1 = 6,784 es el 6,7684 con una cifra caída, y llevaría la salida a 8,8 bar', () => {
    expect(s1).toBe(6.7684);
    expect(salida(6.784).p).toBeCloseTo(8.83, 2);
  });

  it('con la cabecera errada del anexo, 143,61 °C a 8 bar, la salida sale a 201,4 °C', () => {
    expect(bloque(8).Tsat).toBe(170.41);
    expect(salida(s1, 143.61).T).toBeCloseTo(201.4, 1);
  });

  it('con el volumen de la entrada, la sección saldría casi a la mitad', () =>
    expect((m * s2.v) / c2 / ((m * v1) / c2)).toBeGreaterThan(1.8));
});

describe('2 · el nitrógeno que se reparte, y la irreversibilidad que manda', () => {
  const id = 'exter2223-ext-2-el-nitrogeno-que-se-reparte-y-la-irreversibilidad-que-manda';
  // N₂, de la resolución del corpus: el enunciado no los publica
  const [R, cv, cp] = [0.297, 0.742, 1.039];
  const [VA, P1, P2] = [0.2, 2000, 500]; // m³, kPa
  // «sin aislamiento» y «nuevo estado de equilibrio»: acaba a la del pabellón
  const [T1, T2] = [60 + K, 20 + K];
  const m = (P1 * VA) / (R * T1);
  const Q = m * cv * (T2 - T1); // rígido: todo el calor es ΔU
  const dS = m * (cp * Math.log(T2 / T1) - R * Math.log(P2 / P1));
  const Suniv = dS - Q / T2; // el pabellón recibe −Q a 20 °C

  it('las tres constantes del nitrógeno casan: c_p − c_v = R', () => expect(cp - cv).toBeCloseTo(R, 10));

  it('el depósito vacío mide 0,504 m³, por el cociente de estados y por la masa', () => {
    const porCociente = VA * (P1 / P2) * (T2 / T1) - VA;
    const porMasa = (m * R * T2) / P2 - VA;
    expect(Math.abs(porCociente - porMasa)).toBeLessThan(1e-12);
    cuadra.magnitud(id, 'El volumen del depósito vacío', porMasa, 'm^3');
  });

  it('el universo genera 1,537 kJ/K, y el 98 % lo pone el trasvase y no el calor', () => {
    expect(Q).toBeLessThan(0);
    expect(dS).toBeGreaterThan(0); // sube aunque el gas ceda calor
    // la NOTA: el calor sale del sistema a la temperatura media del proceso
    const Tm = (T1 + T2) / 2;
    const trasvase = dS - Q / Tm;
    const calor = -Q / T2 + Q / Tm;
    expect(Math.abs(trasvase + calor - Suniv)).toBeLessThan(1e-12);
    expect(trasvase / Suniv).toBeGreaterThan(0.98);
    cuadra.magnitud(id, 'La entropía generada en el universo', Suniv, 'kJ/K');
  });
});

describe('3 · la tubería de hierro fundido, y el metal que esta vez sí cuenta', () => {
  const id = 'exter2223-ext-3-el-metal-que-esta-vez-si-cuenta';
  // el agua a 41,5 °C, de la nota del enunciado
  const [cp, rho, k, nu, Pr] = [4179, 991.5, 0.6328, 6.4135e-7, 4.197];
  const [m, D1, e, L, kFe] = [2, 0.05, 0.005, 1.2, 52];
  const D2 = D1 + 2 * e;
  const Q = m * cp * (45 - 38);

  /* El Reynolds por el gasto, 4ṁ/(πDμ) con μ = ρν, sin pasar por la
     velocidad de 1,03 m/s que usa la resolución. */
  const Re = (4 * m) / (Math.PI * D1 * rho * nu);
  const Nu = 0.023 * Re ** 0.8 * Pr ** 0.4; // 0,4: el agua se calienta
  const h = (Nu * k) / D1;
  const Rconv = 1 / (h * Math.PI * D1 * L);
  const Rpared = Math.log(D2 / D1) / (2 * Math.PI * kFe * L);
  const tp1 = (38 + 45) / 2 + Q * Rconv;
  const tp2 = tp1 + Q * Rpared;

  it('el agua recibe 58,5 kW', () => cuadra.magnitud(id, 'El calor que recibe el agua', Q, 'W'));

  it('su película tiene 4.326 W/(m²·K): el Nusselt es 341,8, no el 371,7 de la resolución oficial', () => {
    expect(Re).toBeGreaterThan(1e4);
    expect(Math.abs(Nu - 371.71)).toBeGreaterThan(25);
    cuadra.magnitud(id, 'El coeficiente de convección', h, 'W/(m^2 K)');
  });

  it('y la cara exterior está a 140,5 °C: el hierro es el 27,5 % de la resistencia', () => {
    expect(Rpared / (Rpared + Rconv)).toBeCloseTo(0.275, 2);
    cuadra.magnitud(id, 'La temperatura de la cara exterior', tp2, '°C');
  });
});
