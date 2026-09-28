/**
 * La colección del tema 7 de Ingeniería Térmica, la de las diapositivas, que
 * entró el 28 de septiembre de 2026. Se recalculan los cinco ejercicios cuyas
 * cifras dependen de algo que puede cambiar: los cuatro de vapor, que leen las
 * tablas del sitio —si un día se regeneran, esto es lo que avisa—, y el helio,
 * que es el único de gas con los dos caminos cerrando en el mismo número. Los
 * otros tres de gas (7.1, 7.2 y 7.3) son cuentas con los datos del enunciado,
 * y `recalcula` ya las comprueba en su desarrollo.
 *
 * Las propiedades se leen como las lee el alumno: filas de la tabla e
 * interpolación lineal entre ellas.
 */
import { describe, expect, it } from 'vitest';
import { tema } from './corpus';
import tablas from '../../src/content/tablas/vapor-de-agua.json';

const cuadra = tema('ingenieria-termica', 't07-analisis-exergetico');

type Tipo = 'sobrecalentado' | 'liquido';
type Estado = { T: number; v: number; u: number; h: number; s: number };
const COL = { T: 0, v: 1, u: 2, h: 3, s: 4 } as const;

/** Las filas [T, v, u, h, s] de un bloque, con la de saturación en su sitio:
 *  delante en el sobrecalentado y detrás en el líquido. */
function bloque(tipo: Tipo, p: number): number[][] {
  const b = tablas[tipo].bloques.find((x) => x.p === p);
  if (!b) throw new Error(`no hay bloque de ${p} bar en ${tipo}`);
  const filas = b.filas.map((f) => [...f]);
  if (b.saturado) {
    const sat = [b.Tsat as number, ...(b.saturado as number[])];
    if (tipo === 'sobrecalentado') filas.unshift(sat);
    else filas.push(sat);
  }
  return filas;
}

/** Entra en un bloque por una propiedad y devuelve el estado interpolado. */
function lee(tipo: Tipo, p: number, prop: keyof Estado, valor: number): Estado {
  const f = bloque(tipo, p);
  const k = COL[prop];
  for (let i = 1; i < f.length; i++) {
    const [a, b] = [f[i - 1], f[i]];
    if ((a[k] - valor) * (b[k] - valor) <= 0) {
      const t = (valor - a[k]) / (b[k] - a[k]);
      const en = (j: number) => a[j] + t * (b[j] - a[j]);
      return { T: en(0), v: en(1), u: en(2), h: en(3), s: en(4) };
    }
  }
  throw new Error(`${prop} = ${valor} cae fuera del bloque de ${p} bar`);
}

/** Saturación por presión: [p, T, v', v'', h', h'', s', s'']. */
function satP(p: number) {
  const f = tablas.saturacionP.filas.find((r) => r[0] === p);
  if (!f) throw new Error(`no hay fila de ${p} bar`);
  const [, T, vl, vv, hl, hv, sl, sv] = f;
  return { T, vl, vv, hl, hv, sl, sv };
}

/** Saturación por temperatura: [T, p, v', v'', h', h'', s', s'']. */
function satT(T: number) {
  const f = tablas.saturacionT.filas.find((r) => r[0] === T);
  if (!f) throw new Error(`no hay fila de ${T} °C`);
  const [, p, vl, vv, hl, hv, sl, sv] = f;
  return { p, vl, vv, hl, hv, sl, sv };
}

describe('7.8 · la mezcla que pierde calor (la sesión 4 de TermoLagun)', () => {
  const id = 'ejter-col78-la-mezcla-que-pierde-calor-y-sale-humeda';
  const T0 = 288;
  const TMC = 293;
  const Q = -908; // sale del volumen de control
  const e1 = lee('sobrecalentado', 20, 'T', 400);
  // el agua a 30 °C y la referencia, con el modelo incompresible de la resolución
  const [h2, s2] = [4.186 * 30, 4.186 * Math.log(303 / 273)];
  const [h0, s0] = [4.186 * 15, 4.186 * Math.log(288 / 273)];
  const h3 = (Q + 3 * e1.h + 0.5 * h2) / 3.5;
  const sat = satP(20);
  const x3 = (h3 - sat.hl) / (sat.hv - sat.hl);
  const s3 = sat.sl + x3 * (sat.sv - sat.sl);
  const a = (h: number, s: number) => h - h0 - T0 * (s - s0);
  const [A1, A2, A3] = [3 * a(e1.h, e1.s), 0.5 * a(h2, s2), 3.5 * a(h3, s3)];

  it('la corriente de 400 °C tiene fila propia a 20 bar', () => expect(e1.T).toBe(400));
  it('la mezcla sale con 2542,8 kJ/kg', () => cuadra.magnitud(id, 'La entalpía de la mezcla', h3, 'kJ/kg'));

  it('dentro de la campana, con 0,08628 m³/kg', () => {
    expect(x3).toBeGreaterThan(0);
    expect(x3).toBeLessThan(1);
    cuadra.magnitud(id, 'El volumen específico de la mezcla', sat.vl + x3 * (sat.vv - sat.vl), 'm^3/kg');
  });

  it('se destruyen 529 kW, los mismos por el balance que por Guy-Stodola', () => {
    const porBalance = (1 - T0 / TMC) * Q - A3 + A1 + A2;
    const SG = 3.5 * s3 - 0.5 * s2 - 3 * e1.s - Q / TMC;
    expect(Math.abs(porBalance - T0 * SG)).toBeLessThan(1e-9 * porBalance);
    cuadra.magnitud(id, 'La exergía destruida', porBalance, 'kW');
  });

  it('y la mezcla se lleva el 84,8 % de la exergía que entra', () =>
    cuadra(id, 'El rendimiento exergético', A3 / (A1 + A2)));
});

describe('7.11 · la bomba y la turbina que la mueve', () => {
  const id = 'ejter-col711-la-bomba-y-la-turbina-que-la-mueve';
  const T0 = 288;
  const e1 = satT(15); // la entrada de la bomba, leída como líquido a 15 °C
  const ws = e1.vl * (5000 - 100);
  const w = lee('liquido', 50, 'T', 15.4).h - e1.hl;

  it('la bomba rinde un 77 %, con el isentrópico por v·ΔP', () =>
    cuadra(id, 'El rendimiento interno de la bomba', ws / w));

  it('interpolando la entropía en la tabla de 50 bar saldría un 87 %, que es el error de las diapositivas', () => {
    const wsTabla = lee('liquido', 50, 's', e1.sl).h - e1.hl;
    expect(wsTabla / ws).toBeGreaterThan(1.12); // infla el isentrópico un 13 %
    expect(wsTabla / w).toBeCloseTo(0.867, 2);
  });

  const e3 = lee('sobrecalentado', 20, 'T', 400);
  const sat = satP(0.05);
  const x4s = (e3.s - sat.sl) / (sat.sv - sat.sl);
  const wT = 0.88 * (e3.h - (sat.hl + x4s * (sat.hv - sat.hl)));
  const mT = (80 * w) / wT;
  const s4 = sat.sl + ((e3.h - wT - sat.hl) / (sat.hv - sat.hl)) * (sat.sv - sat.sl);

  it('la turbina necesita 0,542 kg/s de vapor', () =>
    cuadra.magnitud(id, 'El gasto de vapor de la turbina', mT, 'kg/s'));
  it('y destruye 66 kW', () =>
    cuadra.magnitud(id, 'La exergía destruida en la turbina', T0 * mT * (s4 - e3.s), 'kW'));
  it('con un rendimiento exergético del 88,6 %, algo mayor que el interno', () =>
    cuadra(id, 'El rendimiento exergético de la turbina', wT / (wT + T0 * (s4 - e3.s))));
});

describe('7.12 · el helio agitado a presión constante', () => {
  const id = 'ejter-col712-el-helio-que-se-calienta-y-pierde-exergia';
  const [m, R, cv, cp] = [1.5, 2.077, 3.11, 5.18];
  const [T1, T2, Tm, T0, Tmedio, P, P0] = [308, 363, 335.5, 293, 298, 500, 100];
  const W = m * R * (T2 - T1); // de frontera, a presión constante
  const WP = -0.8 * 1800; // el mezclador, que entra
  const Q = m * cv * (T2 - T1) + W + WP;
  const dV = (m * R * (T2 - T1)) / P;
  const dS = m * cp * Math.log(T2 / T1);
  const dA = m * cv * (T2 - T1) + P0 * dV - T0 * dS;
  const ExQ = (1 - T0 / Tm) * Q;
  const ExD = -dA + ExQ - (W - P0 * dV) - WP;

  it('el helio cede 1012 kJ', () => cuadra.magnitud(id, 'El calor que cede el helio', Q, 'kJ'));
  it('y pierde 83 kJ de exergía aunque se caliente 55 grados', () =>
    cuadra.magnitud(id, 'La variación de exergía del helio', dA, 'kJ'));

  it('se destruyen 1258 kJ, los mismos por Guy-Stodola', () => {
    expect(Math.abs(ExD - T0 * (dS - Q / Tm))).toBeLessThan(1e-9 * ExD);
    cuadra.magnitud(id, 'La exergía destruida en el helio', ExD, 'kJ');
  });

  it('el rendimiento exergético es 1 − ExD/W_P, el 12,64 %', () => {
    const eta = (W - P0 * dV + dA - ExQ) / -WP;
    expect(Math.abs(eta - (1 - ExD / -WP))).toBeLessThan(1e-12);
    cuadra(id, 'El rendimiento exergético del helio', eta);
  });

  it('y el universo pierde 1369 kJ, con el calor cayendo hasta el medio', () =>
    cuadra.magnitud(id, 'La variación de exergía del universo', -T0 * (dS - Q / Tmedio), 'kJ'));
});

describe('7.13 · la válvula, el separador y el intercambiador', () => {
  const id = 'ejter-col713-la-valvula-el-separador-y-el-intercambiador';
  const T0 = 291;
  const e1 = lee('sobrecalentado', 5, 'T', 180);
  const e2 = lee('sobrecalentado', 2, 'h', e1.h); // laminado: la misma entalpía

  it('la válvula deja el vapor sobrecalentado a 2 bar y genera 2,896 kW/K', () => {
    expect(e2.T).toBeGreaterThan(satP(2).T);
    cuadra.magnitud(id, 'La entropía generada en la válvula', 7 * (e2.s - e1.s), 'kW/K');
  });

  const sat = satP(2);
  const e3 = satT(75); // el agua a 75 °C, leída como líquido
  const m5 = (7 * e1.h + 4 * e3.hl - 11 * sat.hl) / (sat.hv - sat.hl);

  it('del separador salen 6,987 kg/s de vapor', () =>
    cuadra.magnitud(id, 'El vapor que sale del separador', m5, 'kg/s'));
  it('y destruye unos 72 kW, una resta de números de 56 kW/K', () =>
    cuadra.magnitud(
      id,
      'La exergía destruida en el separador',
      T0 * (m5 * sat.sv + (11 - m5) * sat.sl - 7 * e2.s - 4 * e3.sl),
      'kW',
    ));

  const cpa = 1.0045;
  const lnAire = Math.log(303 / 293);
  const ma = (m5 * 0.3 * (sat.hv - sat.hl)) / (cpa * 10);
  const SGi = -m5 * 0.3 * (sat.sv - sat.sl) + ma * cpa * lnAire;
  const ganaAire = ma * cpa * (10 - T0 * lnAire);
  const pierdeVapor = m5 * 0.3 * (sat.hv - sat.hl - T0 * (sat.sv - sat.sl));

  it('el intercambiador destruye 1093 kW, lo que pierde el vapor menos lo que gana el aire', () => {
    expect(Math.abs(pierdeVapor - ganaAire - T0 * SGi)).toBeLessThan(1e-9 * pierdeVapor);
    cuadra.magnitud(id, 'La exergía destruida en el intercambiador', T0 * SGi, 'kW');
  });
  it('y rinde un 9 %', () => cuadra(id, 'El rendimiento exergético del intercambiador', ganaAire / pierdeVapor));
});

describe('7.14 · la instalación entera', () => {
  const id = 'ejter-col714-la-instalacion-entera-sistema-por-sistema';
  const T0 = 288;
  const e1 = lee('sobrecalentado', 10, 'T', 200);
  const sat = satP(1);
  const e3 = satT(35);
  const m3 = (e1.h - sat.hl) / (sat.hl - e3.hl);

  it('la cámara necesita 8,9 kg/s de agua a 35 °C', () =>
    cuadra.magnitud(id, 'El agua que entra en la cámara de mezcla', m3, 'kg/s'));
  it('la válvula destruye 298 kW', () =>
    cuadra.magnitud(id, 'La exergía destruida en la válvula', T0 * (lee('sobrecalentado', 1, 'h', e1.h).s - e1.s), 'kW'));

  it('la bomba rinde un 87 % exergético, y no el 91,57 % de las diapositivas', () => {
    const ws = lee('liquido', 50, 's', sat.sl).h - sat.hl;
    const w = ws / 0.83;
    const s5 = lee('liquido', 50, 'h', sat.hl + w).s;
    const eta = (w - T0 * (s5 - sat.sl)) / w;
    expect(Math.abs(eta - 0.9157)).toBeGreaterThan(0.04);
    // con sus propias exergías, las de la lámina 71, tampoco sale el 91,57
    expect((488.81 - 435.32) / 61.37).toBeCloseTo(0.872, 3);
    cuadra(id, 'El rendimiento exergético de la bomba', eta);
  });

  const m4 = 1 + m3;
  const e6 = lee('liquido', 50, 'T', 120);
  const e7 = lee('sobrecalentado', 50, 'T', 500);

  it('el generador de vapor destruye 8436 kW', () => {
    const Q = m4 * (e7.h - e6.h);
    cuadra.magnitud(id, 'La exergía destruida en el generador de vapor', T0 * (m4 * (e7.s - e6.s) - Q / 1173), 'kW');
  });

  it('y la turbina rinde un 89,9 % exergético', () => {
    const wT = 0.85 * (e7.h - lee('sobrecalentado', 4, 's', e7.s).h);
    const s8 = lee('sobrecalentado', 4, 'h', e7.h - wT).s;
    cuadra(id, 'El rendimiento exergético de la turbina', wT / (wT + T0 * (s8 - e7.s)));
  });
});
