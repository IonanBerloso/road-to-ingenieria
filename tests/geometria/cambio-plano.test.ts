import { describe, expect, it } from 'vitest';
import { cambioPlano, frontalDir, horizontalDir, horizontalPor, plano, proyAlzado, proyPlanta, punto3, vm, type P2, type P3, type Recta2 } from '../../src/lib/diedrico';
import { evaluaReceta, type Lamina } from '../../src/lib/diedrico-receta';

/* El cambio de plano del diédrico directo (lote 1 de la fase K), comprobado
   por lo que tiene que conservar, sin repetir su cuenta: en la vista auxiliar
   de un cambio vertical, un segmento mide lo que su planta a lo largo de la
   línea nueva y su diferencia de cotas en la otra dirección; con la línea
   paralela a la planta del segmento, su verdadera magnitud; y con dos cambios
   bien elegidos, un triángulo se ve igual que es. */
const p = (x: number, y: number, z: number): P3 => ({ x, y, z });
const d2 = (a: P2, b: P2) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const casi = (a: number, b: number, tol = 1e-6) => expect(Math.abs(a - b), `${a} frente a ${b}`).toBeLessThanOrEqual(tol);
const recta = (a: P2, b: P2): Recta2 => ({ p: a, d: [b[0] - a[0], b[1] - a[1]] });
/** Lo lejos que queda Q de la recta r, con signo. */
const lado = (Q: P2, r: Recta2) => {
  const l = Math.hypot(r.d[0], r.d[1]);
  return ((Q[0] - r.p[0]) * -r.d[1] + (Q[1] - r.p[1]) * r.d[0]) / l;
};

const A = p(60, 140, 30);
const B = p(170, 90, 95);
const C = p(120, 200, 140);

describe('un cambio de plano vertical', () => {
  /* La línea nueva, abajo a la derecha de la planta, paralela a A₁B₁. */
  const [A1, B1] = [proyPlanta(A), proyPlanta(B)];
  const n: P2 = [-(B1[1] - A1[1]), B1[0] - A1[0]];
  const linea = recta([A1[0] - 2 * n[0], A1[1] - 2 * n[1]], [B1[0] - 2 * n[0], B1[1] - 2 * n[1]]);

  it('la referencia cae en la línea nueva', () => {
    casi(lado(cambioPlano(A, 'vertical', linea, A), linea), 0);
  });

  it('con la línea paralela a la planta del segmento, lo da en verdadera magnitud', () => {
    casi(d2(cambioPlano(A, 'vertical', linea, A), cambioPlano(B, 'vertical', linea, A)), vm(A, B));
  });

  it('con cualquier línea: lo que mide la planta a lo largo de la línea, y la diferencia de cotas en la otra dirección', () => {
    const otra = recta([300, 20], [380, 260]);
    const [P4, Q4] = [cambioPlano(B, 'vertical', otra, A), cambioPlano(C, 'vertical', otra, A)];
    const u: P2 = [otra.d[0] / Math.hypot(...otra.d), otra.d[1] / Math.hypot(...otra.d)];
    const [B1o, C1o] = [proyPlanta(B), proyPlanta(C)];
    const aLoLargo = (C1o[0] - B1o[0]) * u[0] + (C1o[1] - B1o[1]) * u[1];
    casi(d2(P4, Q4), Math.hypot(aLoLargo, C.z - B.z));
  });

  it('el que tiene más cota que la referencia se aparta de la planta; el que tiene menos, se acerca', () => {
    const lejos = (P: P3) => -lado(cambioPlano(P, 'vertical', linea, A), linea) * Math.sign(lado(proyPlanta(A), linea));
    expect(lejos(B)).toBeGreaterThan(0);
    expect(lejos(p(100, 100, 10))).toBeLessThan(0);
  });
});

describe('un cambio de plano horizontal', () => {
  it('lleva alejamientos desde el alzado: con la línea paralela al alzado del segmento, la verdadera magnitud', () => {
    const [A2, B2] = [proyAlzado(A), proyAlzado(B)];
    const n: P2 = [-(B2[1] - A2[1]), B2[0] - A2[0]];
    const linea = recta([A2[0] + 2 * n[0], A2[1] + 2 * n[1]], [B2[0] + 2 * n[0], B2[1] + 2 * n[1]]);
    casi(d2(cambioPlano(A, 'horizontal', linea, B), cambioPlano(B, 'horizontal', linea, B)), vm(A, B));
  });
});

describe('dos cambios: un plano oblicuo en verdadera magnitud', () => {
  /* Primero vertical, con la línea perpendicular a la planta de una horizontal
     del plano: el plano se ve de canto. Después horizontal, con la segunda
     línea paralela a ese canto: el plano se ve en verdadera magnitud. */
  const pl = plano(A, B, C);
  const h = horizontalPor(A, pl);
  const linea1 = recta([400, 100], [400 - 50 * h.d.y, 100 + 50 * h.d.x]);

  it('tras el primer cambio, el plano se ve de canto: A, B y C en una recta', () => {
    const [a, b, c] = [A, B, C].map((P) => cambioPlano(P, 'vertical', linea1, A));
    casi(lado(c, recta(a, b)), 0, 1e-6);
  });

  it('tras el segundo, el triángulo mide lo que mide en el espacio', () => {
    const [a4, b4] = [A, B].map((P) => cambioPlano(P, 'vertical', linea1, A));
    const n: P2 = [-(b4[1] - a4[1]), b4[0] - a4[0]];
    const l = Math.hypot(...n);
    const linea2 = recta([a4[0] + (80 * n[0]) / l, a4[1] + (80 * n[1]) / l], [b4[0] + (80 * n[0]) / l, b4[1] + (80 * n[1]) / l]);
    const [a5, b5, c5] = [A, B, C].map((P) => cambioPlano(P, 'vertical', linea1, A, linea2));
    casi(d2(a5, b5), vm(A, B));
    casi(d2(b5, c5), vm(B, C));
    casi(d2(c5, a5), vm(C, A));
    casi(lado(a5, linea2), 0);
  });

  it('una línea que pasa por la proyección de la referencia, o sin dirección, lanza', () => {
    expect(() => cambioPlano(B, 'vertical', recta(proyPlanta(A), [0, 0]), A)).toThrow(/pasa por la proyección de la referencia/);
    expect(() => cambioPlano(B, 'vertical', { p: [0, 0], d: [0, 0] }, A)).toThrow(/no tiene dirección/);
  });
});

describe('cambio_plano_vertical y cambio_plano_horizontal, desde una receta', () => {
  const lamina: Lamina = {
    puntos: Object.fromEntries(
      Object.entries({ A, B, C }).flatMap(([n, P]) => [
        [`${n}2`, proyAlzado(P)],
        [`${n}1`, proyPlanta(P)],
      ]),
    ),
    segmentos: { L1: [[400, 100], [430, 300]], L2: [[60, -300], [260, -330]] },
  };
  const escena = Object.fromEntries(
    ['A', 'B', 'C'].map((n) => [n, `punto3(alzado: figura.punto("${n}2"), planta: figura.punto("${n}1"))`]),
  );
  const res = evaluaReceta(lamina, {
    escena,
    solucion: {
      B4: 'cambio_plano_vertical(B, figura.segmento("L1"), ref: A)',
      C4: 'cambio_plano_horizontal(C, figura.segmento("L2"), ref: A)',
    },
  });

  it('dan lo mismo que la biblioteca', () => {
    const L1 = recta([400, 100], [430, 300]);
    const L2 = recta([60, -300], [260, -330]);
    expect(res.valores.get('B4')).toEqual({ k: 'p2', v: cambioPlano(B, 'vertical', L1, A) });
    expect(res.valores.get('C4')).toEqual({ k: 'p2', v: cambioPlano(C, 'horizontal', L2, A) });
  });
});

/* Los lados, que una reflexión sobre la línea no cambiaría en ninguna
   distancia (revisión independiente, M6): contra las dos diapositivas del
   curso que resuelven un plano por dos cambios («Cambios de plano», §3.2,
   págs. 13 y 14), digitalizadas en px a 200 ppp. La vista nueva al lado
   contrario caería a cientos de px de lo dibujado; lo dibujado a mano se
   aparta unos px. */
describe('contra las diapositivas del curso', () => {
  const area = (a: P2, b: P2, c: P2) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  const desde = (alz: Record<string, P2>, pla: Record<string, P2>) =>
    Object.fromEntries(Object.keys(alz).map((n) => [n, punto3(alz[n], pla[n], 5)])) as Record<'A' | 'B' | 'C', P3>;

  it('diap. 13: primero vertical y luego horizontal, con B de referencia en los dos', () => {
    const P = desde({ A: [138, 45], C: [62, 157], B: [338, 262] }, { A: [135, 500], C: [60, 655], B: [335, 718] });
    const IV: Record<string, P2> = { A: [592, 395], C: [512, 548], B: [440, 693] };
    const V: Record<string, P2> = { A: [828, 510], C: [835, 708], B: [545, 745] };
    const h = horizontalDir(plano(P.A, P.B, P.C));
    const l1: Recta2 = { p: IV.B, d: [-h[1], h[0]] };
    const iv = Object.fromEntries((['A', 'B', 'C'] as const).map((n) => [n, cambioPlano(P[n], 'vertical', l1, P.B)]));
    for (const n of ['A', 'B', 'C']) expect(d2(iv[n], IV[n]), `${n} en la vista IV`).toBeLessThan(6);
    const l2: Recta2 = { p: V.B, d: [iv.A[0] - iv.B[0], iv.A[1] - iv.B[1]] };
    const v = Object.fromEntries((['A', 'B', 'C'] as const).map((n) => [n, cambioPlano(P[n], 'vertical', l1, P.B, l2)]));
    for (const n of ['A', 'B', 'C']) expect(d2(v[n], V[n]), `${n} en la vista V`).toBeLessThan(12);
    expect(Math.sign(area(v.A, v.B, v.C))).toBe(Math.sign(area(V.A, V.B, V.C)));
  });

  it('diap. 14: primero horizontal y luego vertical, con A en el primero y B en el segundo (ref2)', () => {
    const P = desde({ A: [165, 133], C: [80, 240], B: [298, 312] }, { A: [168, 405], C: [82, 473], B: [296, 530] });
    const IV: Record<string, P2> = { A: [703, 97], C: [778, 185], B: [848, 270] };
    const V: Record<string, P2> = { A: [530, 240], C: [540, 380], B: [780, 330] };
    const f = frontalDir(plano(P.A, P.B, P.C));
    const l1: Recta2 = { p: IV.A, d: [-f[1], f[0]] };
    const iv = Object.fromEntries((['A', 'B', 'C'] as const).map((n) => [n, cambioPlano(P[n], 'horizontal', l1, P.A)]));
    for (const n of ['A', 'B', 'C']) expect(d2(iv[n], IV[n]), `${n} en la vista IV`).toBeLessThan(30);
    const l2: Recta2 = { p: V.B, d: [iv.B[0] - iv.A[0], iv.B[1] - iv.A[1]] };
    const v = Object.fromEntries((['A', 'B', 'C'] as const).map((n) => [n, cambioPlano(P[n], 'horizontal', l1, P.A, l2, P.B)]));
    casi(lado(v.B, l2), 0);
    for (const n of ['A', 'B', 'C']) expect(d2(v[n], V[n]), `${n} en la vista V`).toBeLessThan(30);
    expect(Math.sign(area(v.A, v.B, v.C))).toBe(Math.sign(area(V.A, V.B, V.C)));
  });

  it('en el cambio horizontal, el que tiene más alejamiento que la referencia se aparta del alzado', () => {
    const l: Recta2 = { p: [0, -400], d: [1, 0.1] };
    const lejos = (Q: P3) => -lado(cambioPlano(Q, 'horizontal', l, A), l) * Math.sign(lado(proyAlzado(A), l));
    expect(lejos({ ...B, y: A.y + 50 })).toBeGreaterThan(0);
    expect(lejos({ ...B, y: A.y - 50 })).toBeLessThan(0);
  });

  it('dos cambios empezando por horizontal, desde una receta con luego: y ref2:', () => {
    const lamina: Lamina = {
      puntos: Object.fromEntries(Object.entries({ A, B, C }).flatMap(([n, Q]) => [[`${n}2`, proyAlzado(Q)], [`${n}1`, proyPlanta(Q)]])),
      segmentos: { L1: [[60, -300], [260, -330]], L2: [[500, 100], [520, 300]] },
    };
    const escena = Object.fromEntries(['A', 'B', 'C'].map((n) => [n, `punto3(alzado: figura.punto("${n}2"), planta: figura.punto("${n}1"))`]));
    const r = evaluaReceta(lamina, { escena, solucion: { C5: 'cambio_plano_horizontal(C, figura.segmento("L1"), ref: A, luego: figura.segmento("L2"), ref2: B)' } });
    expect(r.valores.get('C5')).toEqual({
      k: 'p2',
      v: cambioPlano(C, 'horizontal', recta([60, -300], [260, -330]), A, recta([500, 100], [520, 300]), B),
    });
  });
});
