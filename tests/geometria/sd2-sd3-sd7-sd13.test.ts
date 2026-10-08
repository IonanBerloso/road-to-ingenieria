import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  PT_MM,
  abatido,
  abatidoJunto,
  anguloPlanoConPH,
  corte2D,
  enPlano,
  horizontalPor,
  lmpDir,
  pieComun,
  plano,
  planoPorLmp,
  proyAlzado,
  proyPlanta,
  punto3,
  puntoEnPlanoDesdePlanta,
  rectaDesdeProyecciones,
  rectaPorPuntos,
  vm,
  vmAlzado,
  vmPlanta,
  type P2,
  type P3,
} from '../../src/lib/diedrico';
import type { DatosLamina } from '../../src/lib/lamina';

/* SD2, SD3, SD7 y SD13 · los Ejercicios 2, 3, 6 y 11 de la Colección de
   ejercicios de diédrico directo (Dpto. de Expresión Gráfica y Proyectos de
   Ingeniería, EIG, UPV/EHU), págs. 3, 4, 7 y 12: la gota que baja por tres
   caras, los cuatro tramos sobre un triángulo, el cuadrado con una diagonal
   en la l.m.p. y el triángulo cuyo plano tiene una l.m.p. frontal.

   Las coordenadas son las de las láminas `sd2`, `sd3`, `sd7` y `sd13`. SD3 y
   SD7 ya tienen sus pruebas (`sd3.test.ts` y `sd7.test.ts`), con las
   coordenadas escritas a mano: aquí solo se comprueba que sus láminas traen
   esas mismas. Las cifras esperadas de SD2 y SD13 salen de un guion aparte
   escrito el 8 de octubre de 2026: álgebra de vectores sobre las mismas
   coordenadas, sin importar nada de `src/lib/` (la gota, con las normales de
   las tres caras; el triángulo de SD13, subiendo cada vértice a r₂ y
   abatiéndolo a mano, perpendicular a r₂, lo que su planta dista de r₁). Aquí
   se cotejan contra `lib/diedrico`. */

const lam = (n: string) => JSON.parse(readFileSync(join(process.cwd(), 'src', 'content', 'laminas', `${n}.json`), 'utf8')) as DatosLamina;
const xy = (L: DatosLamina, n: string): P2 => [L.puntos[n].x, L.puntos[n].y];
const punto = (L: DatosLamina, alzado: string, planta: string): P3 => punto3(xy(L, alzado), xy(L, planta));
const seg = (L: DatosLamina, nombre: string): [P2, P2] => {
  const s = L.segmentos.find((x) => x.nombre === nombre);
  if (!s) throw new Error(`falta el segmento ${nombre}`);
  return [s.a, s.b];
};
const cerca = (p: readonly number[], q: readonly number[], d = 2) => {
  expect(p[0]).toBeCloseTo(q[0], d);
  expect(p[1]).toBeCloseTo(q[1], d);
};
const enMm = (pt: number) => pt * PT_MM;

describe('SD2 · la gota que baja por el tejado, la pared y la rampa', () => {
  const L = lam('sd2');
  const [A, B, C, D, E] = (['A', 'B', 'C', 'D', 'E'] as const).map((n) => punto(L, `${n}2`, `${n}1`));
  const tejado = plano(A, B, C);
  const rampa = plano(C, D, E);
  /* La l.m.p. del tejado desde A hasta BC, en la planta. */
  const tQ = corte2D(proyPlanta(A), lmpDir(tejado).baja, proyPlanta(B), proyPlanta(C))!;
  const Q1: P2 = [A.x + lmpDir(tejado).baja[0] * tQ.t, A.y + lmpDir(tejado).baja[1] * tQ.t];
  const Q = puntoEnPlanoDesdePlanta(Q1, tejado);
  /* Por la pared, en vertical: R tiene la planta de Q y está en la rampa, en CD. */
  const R = puntoEnPlanoDesdePlanta(Q1, rampa);
  /* La l.m.p. de la rampa desde R hasta DE. */
  const tS = corte2D(Q1, lmpDir(rampa).baja, proyPlanta(D), proyPlanta(E))!;
  const S = puntoEnPlanoDesdePlanta([Q1[0] + lmpDir(rampa).baja[0] * tS.t, Q1[1] + lmpDir(rampa).baja[1] * tS.t], rampa);
  /* La vista 3: la x es el alejamiento corrido lo que dicen B₃ y B₁. */
  const corrimiento = L.puntos.B3.x - L.puntos.B1.y;
  const vista3 = (P: P3): P2 => [P.y + corrimiento, -P.z];

  it('B₁ ≡ D₁: BD es vertical, y la pared BCD también', () => {
    cerca(proyPlanta(B), proyPlanta(D), 9);
    expect(B.z).toBeGreaterThan(D.z);
  });

  it('la vista 3 conserva las alturas y lleva el alejamiento hacia la derecha', () => {
    for (const n of ['B', 'C', 'D', 'E']) {
      expect(L.puntos[`${n}3`].y).toBe(L.puntos[`${n}2`].y);
      expect(L.puntos[`${n}3`].x - L.puntos[`${n}1`].y).toBeCloseTo(corrimiento, 2);
    }
    /* A₃, 0,12 pt a la izquierda: el redondeo de la lámina. */
    expect(Math.abs(L.puntos.A3.x - L.puntos.A1.y - corrimiento)).toBeLessThan(0.15);
  });

  it('Q, por donde la gota deja el tejado, en BC', () => {
    expect(tQ.s).toBeGreaterThan(0);
    expect(tQ.s).toBeLessThan(1);
    cerca(proyPlanta(Q), [198.4754, 478.044]);
    cerca(proyAlzado(Q), [198.4754, 298.6951]);
    cerca(vista3(Q), [389.724, 298.6951]);
  });

  it('R, al pie de la pared: la misma planta que Q, en CD', () => {
    cerca(proyAlzado(R), [198.4754, 349.4453]);
    cerca(vista3(R), [389.724, 349.4453]);
    const sobreCD = (R.x - C.x) / (D.x - C.x);
    expect(R.z).toBeCloseTo(C.z + sobreCD * (D.z - C.z), 6);
    expect(R.y).toBeCloseTo(C.y + sobreCD * (D.y - C.y), 6);
  });

  it('S, donde toca el suelo: en DE, que es horizontal', () => {
    expect(D.z).toBe(E.z);
    expect(tS.s).toBeGreaterThan(0);
    expect(tS.s).toBeLessThan(1);
    cerca(proyPlanta(S), [256.3288, 510.1546]);
    cerca(proyAlzado(S), [256.3288, 388.56]);
    cerca(vista3(S), [421.8346, 388.56]);
    /* En la vista 3, S₃ queda a lo que S tiene de alejamiento más que D. */
    expect(enMm(S.y - D.y)).toBeCloseTo(27.91, 2);
  });

  it('la l.m.p. del tejado es perpendicular a la horizontal B₁H₁, y la de la rampa a D₁E₁', () => {
    /* H, el punto de AC con la cota de B. */
    const s = (B.z - A.z) / (C.z - A.z);
    const H: P3 = { x: A.x + s * (C.x - A.x), y: A.y + s * (C.y - A.y), z: B.z };
    cerca(proyPlanta(H), [146.4316, 485.7284]);
    expect(enPlano(H, tejado, 1e-6)).toBe(true);
    const [bh, de] = [[H.x - B.x, H.y - B.y], [E.x - D.x, E.y - D.y]];
    expect(lmpDir(tejado).baja[0] * bh[0] + lmpDir(tejado).baja[1] * bh[1]).toBeCloseTo(0, 9);
    expect(lmpDir(rampa).baja[0] * de[0] + lmpDir(rampa).baja[1] * de[1]).toBeCloseTo(0, 9);
  });

  it('los tres tramos y lo que recorre la gota, con los distractores', () => {
    expect(enMm(vm(A, Q))).toBeCloseTo(30.8238, 3);
    expect(enMm(vm(Q, R))).toBeCloseTo(17.9035, 3);
    expect(enMm(vm(R, S))).toBeCloseTo(27.1159, 3);
    expect(enMm(vm(A, Q) + vm(Q, R) + vm(R, S))).toBeCloseTo(75.8432, 3);
    expect(enMm(vmPlanta(A, Q) + vmPlanta(R, S))).toBeCloseTo(35.5947, 3);
    expect(enMm(vmAlzado(A, Q) + vmAlzado(Q, R) + vmAlzado(R, S))).toBeCloseTo(71.1202, 3);
    expect(enMm(vm(A, Q) + vm(R, S))).toBeCloseTo(57.9397, 3);
  });

  it('lo visto y lo oculto: cada cara, por el lado por el que corre la gota', () => {
    /* La normal de la cara por la que corre la gota: hacia arriba en el tejado
       y en la rampa, hacia E en la pared. Se ve en una vista si apunta hacia
       quien mira: +z en la planta, +y en el alzado, −x en la vista 3. */
    const normal = (P: P3, Q: P3, R: P3, hacia: P3) => {
      const u = [Q.x - P.x, Q.y - P.y, Q.z - P.z];
      const v = [R.x - P.x, R.y - P.y, R.z - P.z];
      const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
      const s = n[0] * (hacia.x - P.x) + n[1] * (hacia.y - P.y) + n[2] * (hacia.z - P.z) < 0 ? -1 : 1;
      return n.map((c) => c * s);
    };
    const arriba = (P: P3): P3 => ({ ...P, z: P.z + 100 });
    const caras = [normal(A, B, C, arriba(A)), normal(B, C, D, E), normal(C, D, E, arriba(C))];
    for (const n of caras) {
      expect(n[1]).toBeGreaterThan(0);
      expect(n[0]).toBeGreaterThan(0);
    }
    expect(caras[0][2]).toBeGreaterThan(0);
    expect(caras[2][2]).toBeGreaterThan(0);
    expect(Math.abs(caras[1][2])).toBeLessThan(1e-6);
  });
});

describe('SD13 · el triángulo cuyo plano tiene por l.m.p. la frontal r', () => {
  const L = lam('sd13');
  const r = rectaDesdeProyecciones(seg(L, 'r2'), seg(L, 'r1'));
  const pl = planoPorLmp(r);
  const [A, B, C] = (['A1', 'B1', 'C1'] as const).map((n) => puntoEnPlanoDesdePlanta(xy(L, n), pl));
  const M = punto(L, 'M2', 'M1');
  const N = punto(L, 'L2', 'L1');
  const charnela = rectaPorPuntos(M, N);

  it('r es frontal y el plano, proyectante vertical, a 25° del horizontal', () => {
    expect(L.puntos.L1.y).toBe(L.puntos.M1.y);
    expect(Math.abs(pl.n.y)).toBeLessThan(1e-9);
    expect(anguloPlanoConPH(pl)).toBeCloseTo(25.0044, 3);
  });

  it('a) el alzado de los tres vértices, en r₂', () => {
    cerca(proyAlzado(A), [372.12, 285.0882]);
    cerca(proyAlzado(B), [212.4, 359.5817]);
    cerca(proyAlzado(C), [283.8, 326.2807]);
    /* C₁ está en r₁: C es un punto de r. */
    expect(L.puntos.C1.y).toBe(L.puntos.M1.y);
  });

  it('b) la horizontal por B es de punta, y corta r en K', () => {
    const h = horizontalPor(B, pl);
    expect(Math.abs(h.d.x)).toBeLessThan(1e-9);
    expect(Math.abs(h.d.z)).toBeLessThan(1e-9);
    const K = pieComun(r, h);
    cerca(proyPlanta(K), [212.4, 382.92]);
    cerca(proyAlzado(K), proyAlzado(B), 6);
  });

  it('c) abatido alrededor de r: A₀ y B₀ del mismo lado, y C no se mueve', () => {
    const [A0, A0otro] = abatido(A, charnela, pl);
    cerca(proyAlzado(A0), [350.5122, 238.7594]);
    cerca(proyAlzado(A0otro), [393.7278, 331.417]);
    /* Abatido sobre el plano frontal de r: todo con el alejamiento de r. */
    expect(A0.y).toBeCloseTo(L.puntos.M1.y, 9);
    const B0 = abatidoJunto(B, charnela, pl, A0, A);
    cerca(proyAlzado(B0), [176.4377, 282.4758]);
    expect(enMm(Math.hypot(proyAlzado(A0)[0] - proyAlzado(A)[0], proyAlzado(A0)[1] - proyAlzado(A)[1]))).toBeCloseTo(18.034, 3);
    expect(enMm(Math.hypot(proyAlzado(B0)[0] - proyAlzado(B)[0], proyAlzado(B0)[1] - proyAlzado(B)[1]))).toBeCloseTo(30.0143, 3);
    expect(abatido(C, charnela, pl).every((X) => vm(X, C) < 1e-6)).toBe(true);
  });

  it('el triángulo en verdadera magnitud y su ángulo en C', () => {
    expect(enMm(vm(A, B))).toBeCloseTo(63.3165, 3);
    expect(enMm(vm(B, C))).toBeCloseTo(40.9063, 3);
    expect(enMm(vm(C, A))).toBeCloseTo(38.8224, 3);
    const ang = (P: P3, O: P3, Q: P3) => {
      const u = [P.x - O.x, P.y - O.y, P.z - O.z];
      const v = [Q.x - O.x, Q.y - O.y, Q.z - O.z];
      return (Math.acos((u[0] * v[0] + u[1] * v[1] + u[2] * v[2]) / Math.hypot(...u) / Math.hypot(...v)) * 180) / Math.PI;
    };
    expect(ang(A, C, B)).toBeCloseTo(105.1201, 3);
    /* En la planta, el ángulo en C₁: el distractor. */
    const [a1, b1, c1] = [xy(L, 'A1'), xy(L, 'B1'), xy(L, 'C1')];
    const plano0 = (p: P2): P3 => ({ x: p[0], y: p[1], z: 0 });
    expect(ang(plano0(a1), plano0(c1), plano0(b1))).toBeCloseTo(99.9413, 3);
    for (const X of [A, B, C]) expect(enPlano(X, pl, 1e-6)).toBe(true);
  });
});

describe('SD3 y SD7 · sus láminas traen las coordenadas de sus pruebas', () => {
  it('SD3: el triángulo de sd3.test.ts', () => {
    const L = lam('sd3');
    cerca(xy(L, 'A2'), [188.76, 348.12], 9);
    cerca(xy(L, 'B2'), [273.84, 244.8], 9);
    cerca(xy(L, 'C2'), [372.96, 397.56], 9);
    cerca(xy(L, 'A1'), [188.76, 524.04], 9);
    cerca(xy(L, 'B1'), [273.84, 624.84], 9);
    cerca(xy(L, 'C1'), [372.96, 459.0], 9);
  });

  it('SD7: r y O de sd7.test.ts', () => {
    const L = lam('sd7');
    const [r2, r1] = [seg(L, 'r2'), seg(L, 'r1')];
    cerca(r2[0], [135.96, 388.2], 9);
    cerca(r2[1], [316.32, 207.84], 9);
    cerca(r1[0], [135.96, 503.04], 9);
    cerca(r1[1], [316.32, 437.4], 9);
    cerca(xy(L, 'O2'), [212.46, 311.7], 9);
    cerca(xy(L, 'O1'), [212.46, 475.14], 9);
  });
});
