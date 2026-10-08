import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  PT_MM,
  abatido,
  abatidoPlanta,
  anguloConPH,
  anguloDiedro,
  anguloPlanoConPH,
  anguloPlanos,
  anguloRectaPlano,
  anguloRectas,
  cambioPlano,
  enPlano,
  gira,
  pieEnPlano,
  pieEnRecta,
  plano,
  proyAlzado,
  proyPlanta,
  punto3,
  puntoATresDistancias,
  puntoEnPlanoDesdePlanta,
  puntosADistancia,
  rectaPorPuntos,
  vm,
  vmPlanta,
  type P2,
  type P3,
} from '../../src/lib/diedrico';
import type { DatosLamina } from '../../src/lib/lamina';

/* SD18, SD62 y SD66 · los Ejercicios 15, 46 y 50 de la Colección de
   ejercicios de diédrico directo (Dpto. de Expresión Gráfica y Proyectos de
   Ingeniería, EIG, UPV/EHU), págs. 16, 47 y 51: la placa triangular soldada a
   60° sobre una pieza angular, los ángulos de una cabria y el mástil sostenido
   por tres barras sobre un tejado a dos aguas.

   Las coordenadas son las de las láminas `sd18`, `sd62` y `sd66`. Las cifras
   esperadas salen de un guion aparte escrito el 8 de octubre de 2026: álgebra
   de vectores sobre esas mismas coordenadas, sin importar nada de `src/lib/`,
   con cada cifra por dos vías cuando se puede (la placa por su altura y por
   las tres distancias; el ángulo de los planos de la cabria por las normales y
   en la vista con VB de punta; el de AD con el faldón por el seno, AT/AD, y
   girando D alrededor de la perpendicular). Aquí se cotejan contra
   `lib/diedrico`. */

const lam = (n: string) => JSON.parse(readFileSync(join(process.cwd(), 'src', 'content', 'laminas', `${n}.json`), 'utf8')) as DatosLamina;
const punto = (L: DatosLamina, alzado: string, planta: string): P3 => {
  const [a, p] = [L.puntos[alzado], L.puntos[planta]];
  return punto3([a.x, a.y], [p.x, p.y]);
};
const segmento = (L: DatosLamina, nombre: string) => {
  const s = L.segmentos.find((x) => x.nombre === nombre);
  if (!s) throw new Error(`falta el segmento ${nombre}`);
  return { p: s.a, d: [s.b[0] - s.a[0], s.b[1] - s.a[1]] as P2 };
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
const mm = (x: number) => x / PT_MM;

describe('SD18 · la placa triangular soldada a 60° sobre la pieza angular', () => {
  const L = lam('sd18');
  const [A, B, D, C, E] = [punto(L, 'A2', 'A1'), punto(L, 'B2', 'B1'), punto(L, 'D2', 'D1'), punto(L, 'C2', 'C1'), punto(L, 'E2', 'E1')];
  const vertical = plano(A, B, D);
  const horizontal = plano(D, C, E);
  const DC = rectaPorPuntos(D, C);
  const [P] = puntosADistancia(DC, D, mm(30));
  /* La cota de R, con el triángulo equilátero auxiliar del alzado. */
  const [X] = puntosADistancia(DC, P, mm(70));
  const eje = rectaPorPuntos(P, { ...P, y: P.y + 10 });
  const Z = [gira(X, eje, 60), gira(X, eje, -60)].sort((a, b) => b.z - a.z)[0];
  const M = { x: (P.x + X.x) / 2, y: (P.y + X.y) / 2, z: (P.z + X.z) / 2 };
  const [W] = puntosADistancia(rectaPorPuntos(P, Z), P, vm(Z, M));
  const Pw: P3 = { x: P.x, y: P.y, z: W.z };
  const R: P3 = { x: P.x + Math.sqrt(mm(70) ** 2 - vm(P, Pw) ** 2), y: P.y, z: W.z };
  const Rp = pieEnRecta(R, DC);
  const Q = puntoATresDistancias(P, mm(70), R, mm(70), Rp, vm(Rp, P), 1);

  it('la pieza: 120 mm de largo, el ala vertical de 60 y la horizontal de 55; P a 30 mm de D', () => {
    expect(enMm(vm(D, C))).toBeCloseTo(120.01, 2);
    expect(enMm(vm(A, D))).toBeCloseTo(59.99, 2);
    expect(enMm(vm(D, E))).toBeCloseTo(54.99, 2);
    cerca(proyAlzado(P), [176.49, 385.09]);
    cerca(proyPlanta(P), [176.49, 501.97]);
  });

  it('R: 52,5 mm por encima del ala horizontal y a 70 mm de P, en el ala vertical', () => {
    expect(enMm(vm(Z, M))).toBeCloseTo(60.6218, 3);
    expect(enMm(W.z - P.z)).toBeCloseTo(52.5, 3);
    cerca(proyAlzado(R), [307.74, 236.27]);
    cerca(proyPlanta(R), [307.74, 501.97]);
    expect(enPlano(R, vertical)).toBe(true);
    expect(enMm(vmPlanta(P, R))).toBeCloseTo(46.3006, 3);
  });

  it('Q: en el ala horizontal, a 70 mm de P y de R, delante del ala vertical', () => {
    cerca(proyPlanta(Q), [326.48, 631.87]);
    cerca(proyAlzado(Q), [326.48, 385.09]);
    expect(enPlano(Q, horizontal)).toBe(true);
    expect(enMm(vm(P, Q))).toBeCloseTo(70, 3);
    expect(enMm(vm(Q, R))).toBeCloseTo(70, 3);
    expect(enMm(vm(P, R))).toBeCloseTo(70, 3);
    expect(enMm(Q.y - P.y)).toBeCloseTo(45.8258, 3);
  });

  it('la placa forma 60° con el ala horizontal; su lado PR, 48,59°, como RQ', () => {
    const placa = plano(P, Q, R);
    expect(anguloPlanoConPH(placa)).toBeCloseTo(60, 6);
    expect(anguloPlanos(placa, horizontal)).toBeCloseTo(60, 6);
    expect(anguloConPH(P, R)).toBeCloseTo(48.5904, 3);
    expect(anguloConPH(Q, R)).toBeCloseTo(48.5904, 3);
    expect(Math.asin(52.5 / 70) * G).toBeCloseTo(anguloConPH(P, R), 6);
    expect(anguloPlanos(placa, vertical)).toBeCloseTo(49.1066, 3);
  });
});

describe('SD62 · los ángulos de la cabria', () => {
  const L = lam('sd62');
  const [V, A, B, C] = [punto(L, 'V2', 'V1'), punto(L, 'A2', 'A1'), punto(L, 'B2', 'B1'), punto(L, 'C2', 'C1')];

  it('A, B y C a la misma cota; VB frontal; A y C simétricos respecto de V₁B₁', () => {
    expect(A.z).toBe(B.z);
    expect(C.z).toBe(B.z);
    expect(V.y).toBe(B.y);
    expect(B.y - A.y).toBeCloseTo(C.y - B.y, 9);
    expect(enMm(V.z - A.z)).toBeCloseTo(21.59, 2);
  });

  it('el ángulo AVB: 30,91°, por las rectas y en el triángulo abatido con la charnela AB', () => {
    const a = anguloRectas(rectaPorPuntos(V, A), rectaPorPuntos(V, B));
    expect(a).toBeCloseTo(30.9068, 3);
    const ch = rectaPorPuntos(A, B);
    const [V0] = abatido(V, ch, plano(A, V, B));
    cerca(proyPlanta(V0), [307.97, 522.26]);
    cerca(proyPlanta(pieEnRecta(V, ch)), [358.6, 446.17]);
    expect(enMm(vm(V, pieEnRecta(V, ch)))).toBeCloseTo(32.24, 2);
    expect(angTri(proyPlanta(V0), proyPlanta(A), proyPlanta(B))).toBeCloseTo(a, 6);
    expect(angTri(proyPlanta(V), proyPlanta(A), proyPlanta(B))).toBeCloseTo(33.6901, 3);
  });

  it('los planos AVB y CVB: el menor 67,77°, las caras 112,23°, con VB de punta', () => {
    expect(anguloPlanos(plano(A, V, B), plano(C, V, B))).toBeCloseTo(67.7713, 3);
    expect(anguloDiedro(A, rectaPorPuntos(V, B), C)).toBeCloseTo(112.2287, 3);
    const linea = segmento(L, 'nueva');
    const [V4, B4, A4, C4] = [V, B, A, C].map((X) => cambioPlano(X, 'horizontal', linea, V));
    cerca(V4, [267.322, 174.069]);
    /* V₄ ≡ B₄, a 0,005 pt: la línea nueva de la lámina va redondeada al centésimo. */
    cerca(B4, [267.32, 174.073]);
    cerca(A4, [291.577, 216.816]);
    cerca(C4, [218.576, 180.355]);
    /* En el papel, con la línea nueva redondeada, la décima. */
    expect(angTri(V4, A4, C4)).toBeCloseTo(112.2287, 1);
    /* La casualidad de la planta: A₁V₁C₁ cae en la tolerancia del menor. */
    expect(angTri(proyPlanta(V), proyPlanta(A), proyPlanta(C))).toBeCloseTo(67.3801, 3);
  });

  it('las patas con el plano horizontal: CV 39,76° con su triángulo, BV 26,54° en el alzado', () => {
    expect(anguloConPH(C, V)).toBeCloseTo(39.7622, 3);
    expect(anguloConPH(A, V)).toBeCloseTo(39.7622, 3);
    expect(anguloConPH(B, V)).toBeCloseTo(26.5426, 3);
    const [, Vp] = abatidoPlanta(C, V);
    cerca(Vp, [287.052, 553.601]);
    expect(angTri(proyPlanta(C), proyPlanta(V), Vp)).toBeCloseTo(39.7622, 3);
    expect(angTri(proyAlzado(B), proyAlzado(A), proyAlzado(V))).toBeCloseTo(26.5426, 3);
  });
});

describe('SD66 · el mástil sobre el tejado', () => {
  const L = lam('sd66');
  const [A, F, Gc, H, J, K, Lc] = [
    punto(L, 'A2', 'A1'),
    punto(L, 'F2', 'F1'),
    punto(L, 'G2', 'G1'),
    punto(L, 'H2', 'H1'),
    punto(L, 'J2', 'J1'),
    punto(L, 'K2', 'K1'),
    punto(L, 'L2', 'L1'),
  ];
  const del = plano(F, Gc, H);
  const tra = plano(F, Gc, Lc);
  const P1 = (n: string): P2 => [L.puntos[n].x, L.puntos[n].y];
  const [C, D, E] = ['C1', 'D1', 'E1'].map((n) => puntoEnPlanoDesdePlanta(P1(n), del));
  const linea = segmento(L, 'nueva');
  const v4 = (X: P3) => cambioPlano(X, 'vertical', linea, H);

  it('el tejado es plano: J en el faldón delantero y K en el trasero; B₂ queda 0,44 mm por encima', () => {
    expect(enPlano(J, del)).toBe(true);
    expect(enPlano(K, tra)).toBe(true);
    const B = punto(L, 'B2', 'B1');
    expect(enMm(B.z - puntoEnPlanoDesdePlanta(P1('B1'), del).z)).toBeCloseTo(0.4447, 3);
  });

  it('a) los anclajes, en el faldón delantero', () => {
    cerca(proyAlzado(C), [687.45, 169.27]);
    cerca(proyAlzado(D), [541.17, 182.22]);
    cerca(proyAlzado(E), [603.69, 241.6]);
    expect(enMm(C.z - H.z)).toBeCloseTo(28.13, 2);
    expect(enMm(D.z - H.z)).toBeCloseTo(23.56, 2);
    expect(enMm(E.z - H.z)).toBeCloseTo(2.61, 2);
  });

  it('b) los faldones: 38,86° y 58,22°, y entre ellos 82,92°, con la cumbrera de punta', () => {
    expect(anguloPlanoConPH(del)).toBeCloseTo(38.8647, 3);
    expect(anguloPlanoConPH(tra)).toBeCloseTo(58.2169, 3);
    expect(anguloPlanos(del, tra)).toBeCloseTo(82.9185, 3);
    expect(anguloDiedro(H, rectaPorPuntos(F, Gc), Lc)).toBeCloseTo(82.9185, 3);
    const [F4, G4, H4, L4] = [F, Gc, H, Lc].map(v4);
    cerca(F4, [835.781, 480.106]);
    cerca(G4, [835.781, 480.106], 1);
    expect(angTri(F4, H4, L4)).toBeCloseTo(82.9185, 3);
  });

  it('c) las barras AC y AE: 41,66°, y E abatido sobre el plano frontal de AC', () => {
    const a = anguloRectas(rectaPorPuntos(A, C), rectaPorPuntos(A, E));
    expect(a).toBeCloseTo(41.6551, 3);
    expect(A.y).toBe(C.y);
    const ch = rectaPorPuntos(C, A);
    cerca(proyAlzado(pieEnRecta(E, ch)), [690.448, 173.064]);
    const [E0] = abatido(E, ch, plano(A, C, E));
    cerca(proyAlzado(E0), [788.142, 95.887]);
    expect(enMm(vm(E, pieEnRecta(E, ch)))).toBeCloseTo(43.9211, 3);
    expect(angTri(proyAlzado(A), proyAlzado(C), proyAlzado(E0))).toBeCloseTo(a, 6);
  });

  it('d) la barra AD con el faldón: 46,84°, por el seno y girando D alrededor de t', () => {
    const a = anguloRectaPlano(rectaPorPuntos(A, D), del);
    expect(a).toBeCloseTo(46.8417, 3);
    const T = pieEnPlano(A, del);
    expect(Math.asin(vm(A, T) / vm(A, D)) * G).toBeCloseTo(a, 6);
    expect(enMm(vm(A, T))).toBeCloseTo(37.791, 3);
    expect(enMm(vm(T, D))).toBeCloseTo(35.4364, 3);
    /* D girado alrededor de t: en el faldón, en su línea de máxima pendiente
       por T, del lado de D. */
    const l = Math.hypot(Gc.x - F.x, Gc.y - F.y);
    const n: P2 = [-(Gc.y - F.y) / l, (Gc.x - F.x) / l];
    const delante = puntoEnPlanoDesdePlanta([T.x + 20 * n[0], T.y + 20 * n[1]], del);
    const [Dg] = puntosADistancia(rectaPorPuntos(T, delante), T, vm(T, D));
    expect(enPlano(Dg, del)).toBe(true);
    const [A4, T4, Dg4, F4] = [A, T, Dg, F].map(v4);
    cerca(A4, [883.356, 576.258]);
    cerca(T4, [841.035, 477.848]);
    cerca(Dg4, [748.757, 517.533]);
    expect(angTri(Dg4, A4, T4)).toBeCloseTo(a, 3);
    /* T₄, F₄ y D′₄ en la misma recta, el canto, con F₄ entre los dos. */
    expect(angTri(F4, T4, Dg4)).toBeCloseTo(180, 1);
    expect(anguloRectaPlano(rectaPorPuntos(A, D), tra)).toBeCloseTo(17.048, 3);
    expect(anguloConPH(A, D)).toBeCloseTo(54.1177, 3);
  });
});
