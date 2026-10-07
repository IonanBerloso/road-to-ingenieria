import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  PT_MM,
  abatido,
  cambioPlano,
  corteRectaPlano,
  distanciaAPlano,
  enPlano,
  enRecta,
  perpendicularAPlano,
  pieComun,
  pieEnPlano,
  pieEnRecta,
  plano,
  proyAlzado,
  proyPlanta,
  punto3,
  puntosADistancia,
  rectaPorPuntos,
  vm,
  vmAlzado,
  vmPlanta,
  type P2,
  type P3,
  type Plano,
} from '../../src/lib/diedrico';
import type { DatosLamina } from '../../src/lib/lamina';

/* Los Ejercicios 12 (SD15), 33 (SD47), 39 (SD55) y 42 (SD58) de la Colección
   de ejercicios de diédrico (Dpto. de Expresión Gráfica y Proyectos de
   Ingeniería, EIG, UPV/EHU), págs. 13, 34, 40 y 43, del tema 5.

   Las coordenadas son las de sus láminas. Las cifras esperadas salen de un
   guion aparte, escrito el 7 de octubre de 2026: álgebra de vectores sobre esas
   mismas coordenadas, sin importar nada de `src/lib/`, con la visibilidad por
   rayos contra las caras opacas. Aquí se cotejan contra `lib/diedrico`. */

const lamina = (c: string) => JSON.parse(readFileSync(join(process.cwd(), 'src', 'content', 'laminas', `${c}.json`), 'utf8')) as DatosLamina;
const puntoDe = (L: DatosLamina, n: string): P3 => {
  const [a, p] = [L.puntos[`${n}2`], L.puntos[`${n}1`]];
  return punto3([a.x, a.y], [p.x, p.y]);
};
const cerca = (p: P2, [x, y]: readonly [number, number], d = 2) => {
  expect(p[0]).toBeCloseTo(x, d);
  expect(p[1]).toBeCloseTo(y, d);
};
const mm = (pt: number) => pt * PT_MM;
const d2 = (a: P2, b: P2) => Math.hypot(a[0] - b[0], a[1] - b[1]);
/** Si X, que está en el plano del polígono convexo, cae dentro de él. */
const dentro = (X: P3, poli: readonly P3[]): boolean => {
  const sub = (a: P3, b: P3) => [a.x - b.x, a.y - b.y, a.z - b.z];
  const cruz = (a: number[], b: number[]) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const pe = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const n = cruz(sub(poli[1], poli[0]), sub(poli[2], poli[0]));
  let s = 0;
  for (let i = 0; i < poli.length; i++) {
    const t = pe(cruz(sub(poli[(i + 1) % poli.length], poli[i]), sub(X, poli[i])), n);
    if (Math.abs(t) < 1e-9) continue;
    if (s === 0) s = Math.sign(t);
    else if (Math.sign(t) !== s) return false;
  }
  return true;
};
const lineaDe = (L: DatosLamina, n: string) => {
  const s = L.segmentos.find((x) => x.nombre === n);
  if (!s) throw new Error(`no hay segmento ${n}`);
  return { p: s.a, d: [s.b[0] - s.a[0], s.b[1] - s.a[1]] as P2 };
};

describe('SD47 · el tubo perpendicular al fondo de la tolva, de P al suelo', () => {
  const L = lamina('sd47');
  const [A, B, C, D, P] = ['A', 'B', 'C', 'D', 'P'].map((n) => puntoDe(L, n));
  const fondo = plano(A, B, D);
  const zSuelo = -L.puntos.Zi.y;
  const suelo: Plano = { n: { x: 0, y: 0, z: 1 }, d: zSuelo };
  const S = corteRectaPlano(perpendicularAPlano(P, fondo), suelo);

  it('P está en el fondo, a 0,2 mm, y el fondo es plano', () => {
    expect(mm(distanciaAPlano(P, fondo))).toBeCloseTo(0.2007, 3);
    expect(mm(distanciaAPlano(C, fondo))).toBeLessThan(0.02);
  });

  it('el tubo llega al suelo en S, debajo de la tolva', () => {
    cerca(proyPlanta(S), [275.51, 469.51]);
    cerca(proyAlzado(S), [275.51, 368.16]);
    expect(S.z).toBeLessThan(P.z);
    /* S₁ dentro de la planta del fondo */
    const plana = (X: P3): P3 => ({ x: X.x, y: X.y, z: 0 });
    expect(dentro(plana(S), [A, B, C, D].map(plana))).toBe(true);
  });

  it('la longitud del tubo, 28,96 mm, y sus tres errores', () => {
    expect(mm(vm(P, S))).toBeCloseTo(28.9556, 3);
    expect(mm(vmPlanta(P, S))).toBeCloseTo(16.0053, 3);
    expect(mm(vmAlzado(P, S))).toBeCloseTo(26.7927, 3);
    expect(mm(P.z - S.z)).toBeCloseTo(24.13, 3);
  });

  it('en el papel: la frontal por P, t₂ perpendicular a M₂N₂, y el cambio de visibilidad en A₂D₂', () => {
    const enY = (a: P3, b: P3): P3 => {
      const t = (P.y - a.y) / (b.y - a.y);
      return { x: a.x + t * (b.x - a.x), y: P.y, z: a.z + t * (b.z - a.z) };
    };
    const [M2, N2] = [proyAlzado(enY(A, D)), proyAlzado(enY(B, C))];
    cerca(M2, [260.97, 277.5]);
    cerca(N2, [359.16, 324.92]);
    const f: P2 = [N2[0] - M2[0], N2[1] - M2[1]];
    const P2p = proyAlzado(P);
    const t = (-zSuelo - P2p[1]) / f[0];
    const S2papel: P2 = [P2p[0] - f[1] * t, P2p[1] + f[0] * t];
    expect(d2(S2papel, proyAlzado(S))).toBeLessThan(0.1);
    /* el tubo cruza A₂D₂ a 0,2249 de su largo en el alzado */
    const [a, b] = [proyAlzado(A), proyAlzado(D)];
    const [p, q] = [P2p, proyAlzado(S)];
    const den = (q[0] - p[0]) * (b[1] - a[1]) - (q[1] - p[1]) * (b[0] - a[0]);
    const s = ((a[0] - p[0]) * (b[1] - a[1]) - (a[1] - p[1]) * (b[0] - a[0])) / den;
    expect(s).toBeCloseTo(0.2249, 3);
  });
});

describe('SD58 · la tubería más corta de P a la tolva', () => {
  const L = lamina('sd58');
  const V = Object.fromEntries('ABCDEFGH'.split('').map((n) => [n, puntoDe(L, n)])) as Record<string, P3>;
  const P = puntoDe(L, 'P');
  const cara = plano(V.A, V.B, V.E);
  const T = pieEnPlano(P, cara);

  it('el pie en la cara ABFE cae dentro, y la tubería mide 28,47 mm', () => {
    expect(enPlano(V.F, cara)).toBe(true);
    expect(dentro(T, [V.A, V.B, V.F, V.E])).toBe(true);
    cerca(proyPlanta(T), [280.18, 428.43]);
    cerca(proyAlzado(T), [280.18, 201.94]);
    expect(mm(vm(P, T))).toBeCloseTo(28.4654, 3);
    expect(mm(vm(P, pieEnRecta(P, rectaPorPuntos(V.B, V.F))))).toBeCloseTo(28.6457, 3);
  });

  it('en las otras caras el pie cae fuera; los planos de BCGF y DAEH pasan más cerca', () => {
    for (const k of ['BCGF', 'CDHG', 'DAEH', 'ABCD', 'EFGH']) {
      const poli = k.split('').map((x) => V[x]);
      expect(dentro(pieEnPlano(P, plano(poli[0], poli[1], poli[2])), poli)).toBe(false);
    }
    expect(mm(distanciaAPlano(P, plano(V.B, V.C, V.G)))).toBeCloseTo(2.8907, 3);
    expect(mm(distanciaAPlano(P, plano(V.D, V.A, V.E)))).toBeCloseTo(10.0808, 3);
  });

  it('los distractores: en la planta, P₁ a A₁B₁ y P₁T₁', () => {
    expect(mm(vmPlanta(P, pieEnRecta(P, rectaPorPuntos(V.A, V.B))))).toBeCloseTo(12.2578, 3);
    expect(mm(vmPlanta(P, T))).toBeCloseTo(25.3296, 3);
    expect(mm(P.z - T.z)).toBeCloseTo(12.988, 3);
  });

  it('el cambio de plano: la cara de canto, y P₄T₄ perpendicular a ella', () => {
    const nueva = lineaDe(L, 'nueva');
    const v4 = (X: P3) => cambioPlano(X, 'vertical', nueva, V.A);
    const [A4, E4, P4, T4] = [V.A, V.E, P, T].map(v4);
    cerca(A4, [282.67, 506.66]);
    cerca(E4, [385.73, 573.04]);
    cerca(P4, [307.26, 618.48]);
    cerca(T4, [350.94, 550.64]);
    cerca(v4(V.B), A4, 1);
    expect(mm(d2(P4, T4))).toBeCloseTo(28.4654, 2);
    /* T₄ entre A₄ y E₄, a 0,66 de A₄ */
    expect(d2(A4, T4) / d2(A4, E4)).toBeCloseTo(0.6625, 3);
    /* P₄T₄ ⊥ A₄E₄ */
    const pe = (P4[0] - T4[0]) * (E4[0] - A4[0]) + (P4[1] - T4[1]) * (E4[1] - A4[1]);
    expect(Math.abs(pe) / (d2(P4, T4) * d2(A4, E4))).toBeLessThan(1e-3);
  });
});

describe('SD55 · la tubería más corta de P a la tubería AB', () => {
  const L = lamina('sd55');
  const [A, B, P] = ['A', 'B', 'P'].map((n) => puntoDe(L, n));
  const AB = rectaPorPuntos(A, B);
  const H = pieEnRecta(P, AB);

  it('el pie H cae dentro del tramo AB, y la distancia es 32,37 mm', () => {
    expect(vm(A, H) / vm(A, B)).toBeCloseTo(0.6564, 3);
    cerca(proyPlanta(H), [316.92, 547.04]);
    cerca(proyAlzado(H), [316.92, 328.32]);
    expect(mm(vm(P, H))).toBeCloseTo(32.3662, 3);
    expect(mm(vm(A, B))).toBeCloseTo(52.061, 3);
  });

  it('los distractores', () => {
    expect(mm(vmPlanta(P, H))).toBeCloseTo(30.7018, 3);
    expect(mm(vmAlzado(P, H))).toBeCloseTo(23.1368, 3);
    expect(mm(vm(P, B))).toBeCloseTo(36.9797, 3);
  });

  it('los dos cambios de plano: AB en verdadera magnitud y de punta', () => {
    const [n1, n2] = [lineaDe(L, 'nueva1'), lineaDe(L, 'nueva2')];
    const v4 = (X: P3) => cambioPlano(X, 'vertical', n1, B);
    const v5 = (X: P3) => cambioPlano(X, 'vertical', n1, B, n2);
    cerca(v4(A), [194.58, 623.98]);
    cerca(v4(B), [338.52, 591.42]);
    cerca(v4(P), [297.35, 639.24]);
    cerca(v4(H), [289.06, 602.61]);
    expect(mm(d2(v4(A), v4(B)))).toBeCloseTo(52.061, 1);
    expect(mm(d2(v4(P), v4(H)))).toBeCloseTo(13.2513, 2);
    cerca(v5(A), [170.2, 629.49]);
    cerca(v5(B), v5(A), 1);
    cerca(v5(H), v5(A), 1);
    cerca(v5(P), [96.84, 684.59]);
    expect(mm(d2(v5(P), v5(A)))).toBeCloseTo(32.367, 2);
  });
});

describe('SD15 · la chapa de 20 × 30 cm doblada por BE', () => {
  const L = lamina('sd15');
  const V = Object.fromEntries('ABCDEF'.split('').map((n) => [n, puntoDe(L, n)])) as Record<string, P3>;
  const cara1 = plano(V.A, V.B, V.E);
  const cara2 = plano(V.B, V.C, V.E);
  const BE = rectaPorPuntos(V.B, V.E);
  const M: P3 = { x: (V.B.x + V.E.x) / 2, y: (V.B.y + V.E.y) / 2, z: (V.B.z + V.E.z) / 2 };
  const [Lp, K] = puntosADistancia(BE, M, 10 / PT_MM);
  /* la perpendicular a BE dentro de cada cara, por F y por D */
  const lado = (Q: P3, desde: P3): P3 => {
    const pie = pieEnRecta(Q, BE);
    const r = rectaPorPuntos(pie, Q);
    return puntosADistancia({ p: desde, d: r.d }, desde, 15 / PT_MM)[0];
  };
  const [R, S, U, Vv] = [lado(V.F, K), lado(V.F, Lp), lado(V.D, K), lado(V.D, Lp)];

  it('BE mide 59,41 mm en el papel, 59,4 cm reales a 1:10, y sus errores', () => {
    expect(mm(vm(V.B, V.E))).toBeCloseTo(59.4143, 3);
    expect(mm(vmPlanta(V.B, V.E))).toBeCloseTo(48.9826, 3);
    expect(mm(vmAlzado(V.B, V.E))).toBeCloseTo(41.1738, 3);
  });

  it('la chapa: K y L en BE, y sus cuatro vértices en las caras, por dentro', () => {
    cerca(proyPlanta(K), [315.23, 552.38]);
    cerca(proyPlanta(Lp), [292.56, 593.26]);
    cerca(proyPlanta(R), [283.78, 526.09]);
    cerca(proyAlzado(R), [283.78, 304.3]);
    cerca(proyPlanta(S), [261.11, 566.96]);
    cerca(proyAlzado(S), [261.11, 336.39]);
    cerca(proyPlanta(U), [350.31, 552.98]);
    cerca(proyAlzado(U), [350.31, 317.05]);
    cerca(proyPlanta(Vv), [327.63, 593.85]);
    cerca(proyAlzado(Vv), [327.63, 349.14]);
    expect(enPlano(R, cara1) && enPlano(S, cara1)).toBe(true);
    expect(enPlano(U, cara2) && enPlano(Vv, cara2)).toBe(true);
    expect(dentro(R, [V.A, V.B, V.E, V.F]) && dentro(S, [V.A, V.B, V.E, V.F])).toBe(true);
    expect(dentro(U, [V.B, V.C, V.D, V.E]) && dentro(Vv, [V.B, V.C, V.D, V.E])).toBe(true);
    expect(mm(vm(K, Lp))).toBeCloseTo(20, 6);
    expect(mm(vm(R, K))).toBeCloseTo(15, 6);
  });

  it('los abatimientos sobre la base: B₀ a 53,8 y 42,0 mm, y W en las charnelas', () => {
    const ch1 = rectaPorPuntos(V.F, V.E);
    const ch2 = rectaPorPuntos(V.E, V.D);
    const [B01] = abatido(V.B, ch1, cara1);
    const [B02] = abatido(V.B, ch2, cara2);
    cerca(proyPlanta(B01), [102.42, 647.94]);
    cerca(proyPlanta(B02), [432.84, 677.34]);
    expect(mm(vm(V.B, pieEnRecta(V.B, ch1)))).toBeCloseTo(53.802, 3);
    expect(mm(vm(V.B, pieEnRecta(V.B, ch2)))).toBeCloseTo(42.0456, 3);
    expect(mm(vm(B01, V.E))).toBeCloseTo(59.4143, 3);
    const W1 = pieComun(rectaPorPuntos(R, S), ch1);
    const W2 = pieComun(rectaPorPuntos(U, Vv), ch2);
    cerca(proyPlanta(W1), [246.73, 592.87]);
    cerca(proyPlanta(W2), [322.27, 603.52]);
    expect(enRecta(W1, ch1) && enRecta(W2, ch2)).toBe(true);
  });
});
