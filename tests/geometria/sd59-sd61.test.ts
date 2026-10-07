import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  PT_MM,
  abatido,
  abatidoJunto,
  abatidoPlanta,
  anguloConPH,
  anguloConPV,
  anguloDiedro,
  anguloPlanoConPH,
  anguloPlanos,
  anguloRectas,
  cambioPlano,
  enPlano,
  gira,
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
} from '../../src/lib/diedrico';
import type { DatosLamina } from '../../src/lib/lamina';

/* SD59, SD60 y SD61 · los Ejercicios 43, 44 y 45 de la Colección de
   ejercicios de diédrico directo (Dpto. de Expresión Gráfica y Proyectos de
   Ingeniería, EIG, UPV/EHU), págs. 44 a 46: la grúa cuyo contrapeso baja al
   suelo, la pieza de la cara CDGH y las caras α y β, y el trípode del tren de
   aterrizaje.

   Las coordenadas son las de las láminas `sd59`, `sd60` y `sd61`. Las cifras
   esperadas salen de un segundo camino escrito aparte el 7 de octubre de 2026:
   álgebra de vectores sobre esas mismas coordenadas, sin importar nada de
   `src/lib/`, con cada cifra por dos vías cuando se puede (el cable por suma
   de tramos y por Pitágoras en el triángulo NQP; el diedro por las
   perpendiculares a la arista, por las normales y en la vista con la arista de
   punta; el ángulo de AD y AC por el producto escalar, por el teorema del
   coseno y en el triángulo abatido). Aquí se cotejan contra `lib/diedrico`. */

const lam = (n: string) => JSON.parse(readFileSync(join(process.cwd(), 'src', 'content', 'laminas', `${n}.json`), 'utf8')) as DatosLamina;
const punto = (L: DatosLamina, alzado: string, planta: string): P3 => {
  const [a, p] = [L.puntos[alzado], L.puntos[planta]];
  return punto3([a.x, a.y], [p.x, p.y]);
};
const cerca = (p: P2, [x, y]: readonly [number, number], d = 2) => {
  expect(p[0]).toBeCloseTo(x, d);
  expect(p[1]).toBeCloseTo(y, d);
};
const G = 180 / Math.PI;
/** El ángulo de un triángulo del papel en su vértice O, de 0 a 180°. */
const angTri = (O: P2, X: P2, Y: P2) => {
  const [u, v] = [[X[0] - O[0], X[1] - O[1]], [Y[0] - O[0], Y[1] - O[1]]];
  return Math.acos((u[0] * v[0] + u[1] * v[1]) / Math.hypot(u[0], u[1]) / Math.hypot(v[0], v[1])) * G;
};
const enMm = (pt: number) => pt * PT_MM;

describe('SD59 · el nudo de la grúa cuando el contrapeso toca el suelo', () => {
  const L = lam('sd59');
  const Q = punto(L, 'Q2', 'Q1');
  const P = punto(L, 'P2', 'P1');
  const N = punto(L, 'N2', 'N1');
  const suelo = L.segmentos.find((s) => s.nombre === 'suelo');
  if (!suelo) throw new Error('falta el suelo');
  const Ps: P3 = { x: P.x, y: P.y, z: -suelo.a[1] };
  const baja = P.z - Ps.z;

  it('QP es vertical, N está a la cota de P y en el cable de la lámina', () => {
    expect(P.x).toBe(Q.x);
    expect(P.y).toBe(Q.y);
    expect(N.z).toBe(P.z);
    expect(enMm(baja)).toBeCloseTo(25.908, 3);
  });

  it('el cable de N a P, por los tramos y por Pitágoras en NQP, rectángulo en P', () => {
    expect(enMm(vm(N, Q))).toBeCloseTo(64.0519, 3);
    expect(enMm(vm(N, Q) + vm(Q, P))).toBeCloseTo(89.9599, 3);
    expect(enMm(Math.hypot(vm(N, P), vm(Q, P)) + vm(Q, P))).toBeCloseTo(89.9599, 3);
  });

  it('el ángulo de NQ y QP: 66,14°, y el de NQ con el plano horizontal, su complementario', () => {
    const a = anguloRectas(rectaPorPuntos(Q, N), rectaPorPuntos(Q, P));
    expect(a).toBeCloseTo(66.1412, 3);
    expect(Math.atan2(vm(N, P), vm(Q, P)) * G).toBeCloseTo(a, 9);
    expect(anguloConPH(Q, N)).toBeCloseTo(90 - a, 9);
  });

  it('N′: el nudo avanza hacia Q lo que baja P, y el cable mide lo mismo', () => {
    const [Nn] = puntosADistancia(rectaPorPuntos(Q, N), Q, vm(Q, N) - baja);
    cerca(proyPlanta(Nn), [306.13, 503.506]);
    cerca(proyAlzado(Nn), [306.13, 174.775]);
    expect(enMm(vm(Q, Nn) + vm(Q, Ps))).toBeCloseTo(89.9599, 3);
  });

  it('el giro de eje vertical por Q deja QN frontal, sin cambiar la cota de N', () => {
    const eje = rectaPorPuntos(Q, { ...Q, z: Q.z + 10 });
    const fi = Math.atan2(N.y - Q.y, N.x - Q.x) * G;
    const Ng = gira(N, eje, -fi);
    cerca(proyPlanta(Ng), [511.769, 594.12]);
    cerca(proyAlzado(Ng), [511.769, 204.48]);
    expect(Ng.z).toBeCloseTo(N.z, 9);
    expect(vmAlzado(Q, Ng)).toBeCloseTo(vm(Q, N), 9);
    /* (N′)₂: lo que baja P, desde (N)₂ hacia Q₂, cae a la altura de N′₂. */
    const [a, b] = [proyAlzado(Ng), proyAlzado(Q)];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const Nng2: P2 = [a[0] + ((b[0] - a[0]) * baja) / l, a[1] + ((b[1] - a[1]) * baja) / l];
    cerca(Nng2, [444.605, 174.775]);
  });

  it('los distractores: el cable con los tramos acortados y el ángulo en el alzado', () => {
    expect(enMm(vmAlzado(N, Q) + vm(Q, P))).toBeCloseTo(60.8544, 3);
    expect(enMm(vmPlanta(N, Q) + vm(Q, P))).toBeCloseTo(84.4864, 3);
    expect(enMm(vm(N, P))).toBeCloseTo(58.5784, 3);
    expect(enMm(vm(N, Q) + vm(Q, Ps))).toBeCloseTo(115.8679, 3);
    expect(angTri(proyAlzado(Q), proyAlzado(N), proyAlzado(P))).toBeCloseTo(42.1523, 3);
  });
});

describe('SD60 · la cara CDGH y el ángulo de las caras α y β', () => {
  const L = lam('sd60');
  const [A, B, C, D] = [punto(L, 'A2', 'A1'), punto(L, 'B2', 'B1'), punto(L, 'C2', 'C1'), punto(L, 'D2', 'D1')];
  const [E, F, Gv, H] = [punto(L, 'E2', 'E1'), punto(L, 'F2', 'F1'), punto(L, 'G2', 'G1'), punto(L, 'H2', 'H1')];
  const cara = plano(C, H, Gv);

  it('las caras son planas: D en CHG, D en ABC y F en ABE', () => {
    expect(enPlano(D, cara)).toBe(true);
    expect(enPlano(D, plano(A, B, C))).toBe(true);
    expect(enPlano(F, plano(A, B, E))).toBe(true);
  });

  it('la verdadera magnitud: G₀ y D₀ abatidos con la charnela CH, hacia abajo', () => {
    const ch = rectaPorPuntos(C, H);
    const [Ga, Gb] = abatido(Gv, ch, cara);
    cerca(proyPlanta(Ga), [390.72, 633.003]);
    cerca(proyPlanta(Gb), [390.72, 368.997]);
    const Da = abatidoJunto(D, ch, cara, Ga, Gv);
    cerca(proyPlanta(Da), [305.64, 633.003]);
    expect(enMm(vm(Gv, H))).toBeCloseTo(46.5678, 3);
    expect(enMm(vm(C, D))).toBeCloseTo(46.8349, 3);
    /* En el papel, el trapecio abatido tiene sus lados de verdad. */
    expect(enMm(Math.hypot(proyPlanta(Da)[0] - C.x, proyPlanta(Da)[1] - C.y))).toBeCloseTo(46.8349, 3);
  });

  it('la pendiente: 75,09°, por la normal y por la recta de máxima pendiente GH', () => {
    expect(anguloPlanoConPH(cara)).toBeCloseTo(75.0921, 3);
    expect(anguloConPH(H, Gv)).toBeCloseTo(75.0921, 3);
    expect(anguloConPH(C, D)).toBeCloseTo(73.9101, 3);
  });

  it('el diedro de las caras, 93,78°, por la arista y en la vista con AB de punta', () => {
    const ab = rectaPorPuntos(A, B);
    expect(anguloDiedro(C, ab, E)).toBeCloseTo(93.7817, 3);
    expect(anguloPlanos(plano(A, B, C), plano(A, B, E))).toBeCloseTo(86.2183, 3);
    /* Un cambio de plano horizontal con la línea nueva perpendicular a A₂B₂
       pone AB de punta: A₄ ≡ B₄, y las caras se ven de canto. */
    const linea = { p: [420, 120] as P2, d: [127.56, 48.24] as P2 };
    const [A4, B4, C4, E4] = [A, B, C, E].map((X) => cambioPlano(X, 'horizontal', linea, A));
    cerca(B4, A4);
    expect(angTri(A4, C4, E4)).toBeCloseTo(93.7817, 3);
    /* Con D y F en vez de C y E, el redondeo de la lámina da una décima más. */
    expect(anguloDiedro(D, ab, F)).toBeCloseTo(93.9072, 3);
  });
});

describe('SD61 · el trípode del tren de aterrizaje', () => {
  const L = lam('sd61');
  const [A, B, C, D] = [punto(L, 'A2', 'A1'), punto(L, 'B2', 'B1'), punto(L, 'C2', 'C1'), punto(L, 'D2', 'D1')];

  it('B, C y D a la misma cota; AD frontal', () => {
    expect(B.z).toBe(C.z);
    expect(C.z).toBe(D.z);
    expect(A.y).toBe(D.y);
  });

  it('el brazo AB: 37,03 mm y 51,96° con el plano horizontal, en el triángulo A₁B₁B₀', () => {
    expect(enMm(vm(A, B))).toBeCloseTo(37.0342, 3);
    expect(anguloConPH(A, B)).toBeCloseTo(51.9606, 3);
    const [B0] = abatidoPlanta(A, B);
    cerca(B0, [208.179, 459.946]);
    expect(enMm(Math.hypot(B0[0] - A.x, B0[1] - A.y))).toBeCloseTo(37.0342, 3);
    expect(angTri(proyPlanta(A), proyPlanta(B), B0)).toBeCloseTo(51.9606, 3);
    expect(anguloConPV(A, B)).toBeCloseTo(17.5642, 3);
    expect(enMm(vmAlzado(A, B))).toBeCloseTo(35.3076, 3);
  });

  it('el ángulo de AD y AC: 39,44°, y en el triángulo abatido con la charnela CD', () => {
    const a = anguloRectas(rectaPorPuntos(A, D), rectaPorPuntos(A, C));
    expect(a).toBeCloseTo(39.438, 3);
    const ch = rectaPorPuntos(D, C);
    const acd = plano(A, C, D);
    const M = pieEnRecta(A, ch);
    cerca(proyPlanta(M), [139.179, 395.895]);
    expect(enMm(vm(A, M))).toBeCloseTo(37.3877, 3);
    const [Aa, Ab] = abatido(A, ch, acd);
    cerca(proyPlanta(Aa), [54.314, 459.377]);
    cerca(proyPlanta(Ab), [224.043, 332.412]);
    for (const X of [Aa, Ab]) expect(angTri(proyPlanta(X), proyPlanta(D), proyPlanta(C))).toBeCloseTo(39.438, 3);
  });

  it('los distractores: el ángulo de AD y AC en la planta y en el alzado', () => {
    expect(angTri(proyPlanta(A), proyPlanta(D), proyPlanta(C))).toBeCloseTo(59.0527, 3);
    expect(angTri(proyAlzado(A), proyAlzado(D), proyAlzado(C))).toBeCloseTo(21.0251, 3);
  });
});
