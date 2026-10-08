import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  PT_MM,
  abatido,
  corteRectaPlano,
  enPlano,
  plano,
  proyAlzado,
  proyPlanta,
  punto3,
  rectaPorPuntos,
  vm,
  vmAlzado,
  vmPlanta,
  type P2,
  type P3,
} from '../../src/lib/diedrico';
import type { DatosLamina } from '../../src/lib/lamina';

/* Los Ejercicios 22 (SD29), 23 (SD30) y 26 (SD34) de la Colección de
   ejercicios de diédrico (Dpto. de Expresión Gráfica y Proyectos de
   Ingeniería, EIG, UPV/EHU), págs. 23, 24 y 27, del tema 4: una recta y una
   chapa doblada, y dos chapas cortadas por un plano.

   Las coordenadas son las de sus láminas. Las cifras esperadas salen de un
   guion aparte, escrito el 8 de octubre de 2026: álgebra de vectores sobre esas
   mismas coordenadas, sin importar nada de `src/lib/`. Aquí se cotejan contra
   `lib/diedrico`. */

const lamina = (c: string) => JSON.parse(readFileSync(join(process.cwd(), 'src', 'content', 'laminas', `${c}.json`), 'utf8')) as DatosLamina;
const puntoDe = (L: DatosLamina, n: string): P3 => {
  const [a, p] = [L.puntos[`${n}2`], L.puntos[`${n}1`]];
  return punto3([a.x, a.y], [p.x, p.y]);
};
const punto = (L: DatosLamina, n: string): P2 => [L.puntos[n].x, L.puntos[n].y];
const cerca = (p: P2, [x, y]: readonly [number, number], d = 2) => {
  expect(p[0]).toBeCloseTo(x, d);
  expect(p[1]).toBeCloseTo(y, d);
};
const mm = (pt: number) => pt * PT_MM;
const d2 = (a: P2, b: P2) => Math.hypot(a[0] - b[0], a[1] - b[1]);
/** El cruce de las rectas ab y cd del papel, prolongadas. */
const cruce = (a: P2, b: P2, c: P2, d: P2): P2 => {
  const r: P2 = [b[0] - a[0], b[1] - a[1]];
  const s: P2 = [d[0] - c[0], d[1] - c[1]];
  const t = ((c[0] - a[0]) * s[1] - (c[1] - a[1]) * s[0]) / (r[0] * s[1] - r[1] * s[0]);
  return [a[0] + t * r[0], a[1] + t * r[1]];
};
const vertical = (p: P2): P2 => [p[0], p[1] - 10];
/** Las coordenadas de X en el paralelogramo de vértices o, o+u, o+v: dentro si las dos van de 0 a 1. */
const enCara = (X: P3, o: P3, u: P3, v: P3): [number, number] => {
  const a = [u.x - o.x, u.y - o.y, u.z - o.z];
  const b = [v.x - o.x, v.y - o.y, v.z - o.z];
  const w = [X.x - o.x, X.y - o.y, X.z - o.z];
  const pe = (p: number[], q: number[]) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];
  const [aa, ab, bb, wa, wb] = [pe(a, a), pe(a, b), pe(b, b), pe(w, a), pe(w, b)];
  const det = aa * bb - ab * ab;
  return [(wa * bb - wb * ab) / det, (aa * wb - ab * wa) / det];
};
const dentro01 = ([s, t]: [number, number]) => s >= 0 && s <= 1 && t >= 0 && t <= 1;

describe('SD29 · la recta r a través de la chapa doblada', () => {
  const L = lamina('sd29');
  const [A, B, C, E, F, G] = ['A', 'B', 'C', 'E', 'F', 'G'].map((n) => puntoDe(L, n));
  const r2 = L.segmentos.find((s) => s.nombre === 'r2')!;
  const r1 = L.segmentos.find((s) => s.nombre === 'r1')!;
  /* dos puntos de r: los de x = 200 y x = 400 en las dos vistas */
  const enR = (x: number): P3 => {
    const y2 = r2.a[1] + ((x - r2.a[0]) * (r2.b[1] - r2.a[1])) / (r2.b[0] - r2.a[0]);
    const y1 = r1.a[1] + ((x - r1.a[0]) * (r1.b[1] - r1.a[1])) / (r1.b[0] - r1.a[0]);
    return punto3([x, y2], [x, y1]);
  };
  const r = rectaPorPuntos(enR(200), enR(400));
  const [abfe, bcgf] = [plano(B, F, A), plano(B, F, C)];
  const I = corteRectaPlano(r, abfe);
  const J = corteRectaPlano(r, bcgf);

  it('r atraviesa las dos caras, por dentro: ABFE en I y BCGF en J', () => {
    cerca(proyPlanta(I), [241.2228, 469.3395]);
    cerca(proyAlzado(I), [241.2228, 342.5926]);
    cerca(proyPlanta(J), [323.9994, 517.1366]);
    cerca(proyAlzado(J), [323.9994, 294.7903]);
    expect(dentro01(enCara(I, B, A, F))).toBe(true);
    expect(dentro01(enCara(J, B, C, F))).toBe(true);
    expect(enPlano(E, abfe)).toBe(true);
    expect(enPlano(G, bcgf)).toBe(true);
    expect(mm(vm(I, J))).toBeCloseTo(37.702, 2);
  });

  it('r pasa por debajo del doblez: en la vertical de N₁, BF va 21,83 mm más alto', () => {
    const N1 = cruce(r1.a, r1.b, punto(L, 'B1'), punto(L, 'F1'));
    cerca(N1, [296.7686, 501.4129]);
    const N = enR(N1[0]);
    expect(mm(B.z - N.z)).toBeCloseTo(21.8284, 2);
  });

  it('en el papel: la quebrada M₂N₂P₂ del plano vertical de r corta r₂ en I₂ y J₂', () => {
    const [A1, B1, C1, E1, F1, G1] = ['A1', 'B1', 'C1', 'E1', 'F1', 'G1'].map((n) => punto(L, n));
    const [A2, B2, C2, E2, F2, G2] = ['A2', 'B2', 'C2', 'E2', 'F2', 'G2'].map((n) => punto(L, n));
    const M1 = cruce(r1.a, r1.b, A1, E1);
    const N1 = cruce(r1.a, r1.b, B1, F1);
    const P1 = cruce(r1.a, r1.b, C1, G1);
    const [M2, N2, P2] = [cruce(M1, vertical(M1), A2, E2), cruce(N1, vertical(N1), B2, F2), cruce(P1, vertical(P1), C2, G2)];
    /* E y G quedan a 0,14 pt (0,05 mm) del plano de su cara: el papel y el
       espacio difieren en unas centésimas de pt */
    expect(d2(cruce(M2, N2, r2.a, r2.b), proyAlzado(I))).toBeLessThan(0.1);
    expect(d2(cruce(N2, P2, r2.a, r2.b), proyAlzado(J))).toBeLessThan(0.1);
  });

  it('la chapa desplegada: con el doblez de charnela, cada cara a un lado; mide 110,22 mm de A₀ a C₀', () => {
    const charnela = rectaPorPuntos(F, B);
    const [A0, A0b] = abatido(A, charnela, abfe);
    const [C0b, C0] = abatido(C, charnela, bcgf);
    cerca(proyPlanta(A0), [157.4163, 419.8369]);
    cerca(proyPlanta(A0b), [378.6269, 640.5997]);
    cerca(proyPlanta(C0), [378.4378, 640.657]);
    cerca(proyPlanta(C0b), [157.3593, 420.0261]);
    cerca(proyPlanta(abatido(E, charnela, abfe)[0]), [216.6422, 360.623]);
    cerca(proyPlanta(abatido(G, charnela, bcgf)[1]), [437.6637, 581.4431]);
    expect(mm(vm(A0, C0))).toBeCloseTo(110.2181, 2);
    expect(mm(vm(A, B) + vm(B, C))).toBeCloseTo(110.2181, 3);
    expect(mm(vm(A, B))).toBeCloseTo(55.1255, 3);
    expect(mm(vmPlanta(A, B))).toBeCloseTo(30.3533, 3);
    expect(mm(vmAlzado(A, B))).toBeCloseTo(50.7756, 3);
    expect(mm(B.z - A.z)).toBeCloseTo(46.0163, 3);
    expect(mm(vmPlanta(A, C))).toBeCloseTo(60.6467, 3);
  });
});

describe('SD30 · el triángulo MNO y la chapa de dos caras verticales', () => {
  const L = lamina('sd30');
  const [A, B, C, E, F, M, N, O] = ['A', 'B', 'C', 'E', 'F', 'M', 'N', 'O'].map((n) => puntoDe(L, n));
  const [abfe, bcgf, mno] = [plano(A, B, E), plano(B, C, F), plano(M, N, O)];
  const I = corteRectaPlano(rectaPorPuntos(M, N), abfe);
  const J = corteRectaPlano(rectaPorPuntos(B, F), mno);
  const K = corteRectaPlano(rectaPorPuntos(N, O), bcgf);

  it('A₁ ≡ E₁ y C₁ ≡ G₁ están en la vertical de A₂ y C₂, en la prolongación del trazo recortado', () => {
    cerca(punto(L, 'A1'), [192.96, 461.6432]);
    cerca(punto(L, 'C1'), [389.4, 474.72]);
  });

  it('MN atraviesa ABFE en I, el doblez atraviesa MNO en J, y NO atraviesa BCGF en K', () => {
    cerca(proyPlanta(I), [253.642, 433.3373]);
    cerca(proyAlzado(I), [253.642, 232.2534]);
    cerca(proyAlzado(J), [318, 234.9579]);
    cerca(proyPlanta(K), [355.2212, 440.5412]);
    cerca(proyAlzado(K), [355.2212, 187.3577]);
    /* I y K, entre el borde de arriba y el de abajo de la chapa */
    for (const X of [I, J, K]) expect(-X.z).toBeGreaterThan(183.96);
    for (const X of [I, J, K]) expect(-X.z).toBeLessThan(303.84);
  });

  it('la quebrada mide 50,11 mm; la recta IK y la planta, no', () => {
    expect(mm(vm(I, J))).toBeCloseTo(25.0703, 3);
    expect(mm(vm(J, K))).toBeCloseTo(25.0363, 3);
    expect(mm(vm(I, J) + vm(J, K))).toBeCloseTo(50.1067, 3);
    expect(mm(vm(I, K))).toBeCloseTo(39.2613, 3);
    expect(mm(vmPlanta(I, J) + vmPlanta(J, K))).toBeCloseTo(43.6219, 3);
  });

  it('en el papel: I₂Q₂, con Q en A₁B₁ prolongada y O₁M₁, corta B₂F₂ en J₂; I₂K₂, no', () => {
    const [A1, B1, M1, O1] = ['A1', 'B1', 'M1', 'O1'].map((n) => punto(L, n));
    const [B2, F2, M2, O2] = ['B2', 'F2', 'M2', 'O2'].map((n) => punto(L, n));
    const Q1 = cruce(A1, B1, O1, M1);
    const Q2 = cruce(Q1, vertical(Q1), O2, M2);
    cerca(Q1, [392.5327, 368.5571]);
    expect(d2(cruce(proyAlzado(I), Q2, B2, F2), proyAlzado(J))).toBeLessThan(0.01);
    cerca(cruce(proyAlzado(I), proyAlzado(K), B2, F2), [318, 203.8087]);
  });
});

describe('SD34 · el plano MNOP y la chapa de caras ABFE y BCGF', () => {
  const L = lamina('sd34');
  const [A, B, C, E, F, G, M, N, O, P] = ['A', 'B', 'C', 'E', 'F', 'G', 'M', 'N', 'O', 'P'].map((n) => puntoDe(L, n));
  const mnop = plano(M, N, O);
  const I = corteRectaPlano(rectaPorPuntos(E, A), mnop);
  const J = corteRectaPlano(rectaPorPuntos(B, F), mnop);
  const K = corteRectaPlano(rectaPorPuntos(C, G), mnop);

  it('EA, BF y CG atraviesan MNOP dentro de él, en I, J y K', () => {
    expect(enPlano(P, mnop)).toBe(true);
    cerca(proyPlanta(I), [251.7029, 450.8971]);
    cerca(proyAlzado(I), [251.7029, 192.336]);
    cerca(proyPlanta(J), [276.1994, 403.1206]);
    cerca(proyAlzado(J), [276.1994, 245.6689]);
    cerca(proyPlanta(K), [333.5931, 426.2697]);
    cerca(proyAlzado(K), [333.5931, 255.637]);
    for (const X of [I, J, K]) expect(dentro01(enCara(X, M, N, P))).toBe(true);
  });

  it('la quebrada mide 48,81 mm; la recta IK y la planta, no', () => {
    expect(mm(vm(I, J))).toBeCloseTo(26.6973, 3);
    expect(mm(vm(J, K))).toBeCloseTo(22.1135, 3);
    expect(mm(vm(I, J) + vm(J, K))).toBeCloseTo(48.8108, 3);
    expect(mm(vm(I, K))).toBeCloseTo(37.5332, 3);
    expect(mm(vmPlanta(I, J) + vmPlanta(J, K))).toBeCloseTo(40.7729, 3);
  });

  it('en el papel: R₁S₁ da J₁, y sus paralelas por T₁ y U₁, I₁ y K₁', () => {
    const p = (n: string) => punto(L, n);
    const R2 = cruce(p('B2'), p('F2'), p('M2'), p('N2'));
    const S2 = cruce(p('B2'), p('F2'), p('O2'), p('P2'));
    const R1 = cruce(R2, vertical(R2), p('M1'), p('N1'));
    const S1 = cruce(S2, vertical(S2), p('O1'), p('P1'));
    cerca(R1, [241.7428, 358.92]);
    cerca(S1, [340.9639, 486.48]);
    /* P queda a 0,03 mm del plano de M, N y O, y B, E y G tienen 0,24 pt de
       diferencia de x entre las dos vistas: el papel y el espacio difieren en
       una décima de pt */
    expect(d2(cruce(R1, S1, p('B1'), p('F1')), proyPlanta(J))).toBeLessThan(0.2);
    const T2 = cruce(p('E2'), p('A2'), p('O2'), p('P2'));
    const T1 = cruce(T2, vertical(T2), p('O1'), p('P1'));
    const U2 = cruce(p('C2'), p('G2'), p('M2'), p('N2'));
    const U1 = cruce(U2, vertical(U2), p('M1'), p('N1'));
    const rs: P2 = [S1[0] - R1[0], S1[1] - R1[1]];
    const I1 = cruce(T1, [T1[0] + rs[0], T1[1] + rs[1]], p('E1'), p('A1'));
    const K1 = cruce(U1, [U1[0] + rs[0], U1[1] + rs[1]], p('C1'), p('G1'));
    cerca(I1, [251.7739, 450.8261]);
    cerca(K1, [333.6156, 426.2472]);
    expect(d2(I1, proyPlanta(I))).toBeLessThan(0.2);
    expect(d2(K1, proyPlanta(K))).toBeLessThan(0.2);
  });
});
