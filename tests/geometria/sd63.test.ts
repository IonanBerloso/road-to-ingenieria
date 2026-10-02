import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  PT_MM,
  abatido,
  abatidoJunto,
  anguloRectaPlano,
  anguloRectas,
  corteRectaPlano,
  enRecta,
  frontalPor,
  horizontalPor,
  perpendicularAPlano,
  pieComun,
  pieEnPlano,
  pieEnRecta,
  plano,
  proyAlzado,
  proyPlanta,
  punto3,
  rectaDesdeProyecciones,
  rectaPorPuntos,
  vm,
  type P2,
  type P3,
} from '../../src/lib/diedrico';
import type { DatosLamina } from '../../src/lib/lamina';

/* SD63 · el Ejercicio 47 de la Colección de ejercicios de diédrico (Dpto. de
   Expresión Gráfica y Proyectos de Ingeniería, EIG, UPV/EHU), pág. 48: «Hallar
   la magnitud y la posición del ángulo entre la recta r y el plano ABC».

   Las coordenadas son las de la lámina `sd63`. P es el extremo común de r₂
   (arriba) y r₁ (abajo), que están en la misma vertical. Las cifras esperadas
   salen de un segundo camino escrito aparte el 2 de octubre de 2026: álgebra de
   vectores sobre esas mismas coordenadas, sin importar nada de `src/lib/`, con
   δ por tres vías que coinciden (arcsen |d·n|, arcsen PT/PR en el triángulo
   PTR, y el ángulo del triángulo abatido en R₀, en geometría plana sobre la
   planta) y cada punto de la construcción como cruce de dos rectas del papel.
   Aquí se cotejan contra `lib/diedrico`. */

const L = JSON.parse(readFileSync(join(process.cwd(), 'src', 'content', 'laminas', 'sd63.json'), 'utf8')) as DatosLamina;
const punto = (alzado: string, planta: string): P3 => {
  const [a, p] = [L.puntos[alzado], L.puntos[planta]];
  return punto3([a.x, a.y], [p.x, p.y]);
};
const segmento = (n: string): [P2, P2] => {
  const s = L.segmentos.find((x) => x.nombre === n);
  if (!s) throw new Error(`no hay segmento ${n}`);
  return [s.a, s.b];
};
const A = punto('A2', 'A1');
const B = punto('B2', 'B1');
const C = punto('C2', 'C1');
const P = punto('P2', 'P1');
const abc = plano(A, B, C);
const r = rectaDesdeProyecciones(segmento('r2'), segmento('r1'));
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
/** El ángulo entre dos rectas del papel, de 0 a 90°. */
const ang2 = (u: P2, v: P2) => Math.acos(Math.abs(u[0] * v[0] + u[1] * v[1]) / Math.hypot(u[0], u[1]) / Math.hypot(v[0], v[1])) * G;

const R = corteRectaPlano(r, abc);
const T = pieEnPlano(P, abc);

describe('SD63 · el ángulo de r con el plano ABC', () => {
  it('P, el extremo común de r₂ y r₁, es un punto de r', () => {
    expect(L.puntos.P2.x).toBe(L.puntos.P1.x);
    expect(enRecta(P, r)).toBe(true);
  });

  it('la posición: R, donde r corta al plano, y T, el pie de la perpendicular desde P', () => {
    cerca(proyPlanta(R), [257.5678, 383.7015]);
    cerca(proyAlzado(R), [257.5678, 206.9392]);
    cerca(proyPlanta(T), [350.887, 433.803]);
    cerca(proyAlzado(T), [350.887, 235.2326]);
    /* T es el pie de la perpendicular: PT tiene la dirección de la normal. */
    expect(enRecta(T, perpendicularAPlano(P, abc))).toBe(true);
  });

  it('la magnitud: δ = 56,88°, igual por la normal y por el triángulo PTR', () => {
    const delta = anguloRectaPlano(r, abc);
    expect(delta).toBeCloseTo(56.8808, 3);
    /* PTR es rectángulo en T, y sen δ = PT/PR. */
    const [PT, PR, RT] = [vm(P, T), vm(P, R), vm(R, T)];
    expect(PT * PT + RT * RT).toBeCloseTo(PR * PR, 6);
    expect(Math.asin(PT / PR) * G).toBeCloseTo(delta, 9);
    expect(PT * PT_MM).toBeCloseTo(59.2849, 3);
    expect(PR * PT_MM).toBeCloseTo(70.7849, 3);
    expect(RT * PT_MM).toBeCloseTo(38.6757, 3);
    /* El complementario es el ángulo de r con la perpendicular. */
    expect(anguloRectas(r, perpendicularAPlano(P, abc))).toBeCloseTo(90 - delta, 9);
  });

  it('los distractores: lo que se lee en las proyecciones', () => {
    const d = (a: P2, b: P2): P2 => [b[0] - a[0], b[1] - a[1]];
    expect(ang2(d(proyPlanta(R), proyPlanta(P)), d(proyPlanta(R), proyPlanta(T)))).toBeCloseTo(31.7846, 3);
    expect(ang2(d(proyAlzado(R), proyAlzado(P)), d(proyAlzado(R), proyAlzado(T)))).toBeCloseTo(69.4502, 3);
  });

  it('el distractor del radio igual a la diferencia de cotas: 50,44° en R₀', () => {
    const ptr = plano(P, T, R);
    const ch = horizontalPor(T, ptr);
    const J1 = proyPlanta(pieComun(r, ch)), T1 = proyPlanta(T), R1 = proyPlanta(R), M = proyPlanta(pieEnRecta(P, ch));
    const P1 = proyPlanta(P);
    const dz = P.z - T.z;
    const l = Math.hypot(P1[0] - M[0], P1[1] - M[1]);
    const P0mal: P2 = [M[0] + (dz * (P1[0] - M[0])) / l, M[1] + (dz * (P1[1] - M[1])) / l];
    /* R₀ por afinidad con ese P₀: J₁P₀ cortada con la perpendicular a la charnela por R₁. */
    const e: P2 = [T1[0] - J1[0], T1[1] - J1[1]];
    const q: P2 = [P0mal[0] - J1[0], P0mal[1] - J1[1]];
    const n: P2 = [-e[1], e[0]];
    const den = q[0] * n[1] - q[1] * n[0];
    const k = ((R1[0] - J1[0]) * n[1] - (R1[1] - J1[1]) * n[0]) / den;
    const R0mal: P2 = [J1[0] + k * q[0], J1[1] + k * q[1]];
    expect(angTri(R0mal, T1, P0mal)).toBeCloseTo(50.4416, 3);
  });

  it('dos casualidades que la casilla no distingue: r con BC casi igual que δ, y r con el plano horizontal casi igual que el complementario', () => {
    const delta = anguloRectaPlano(r, abc);
    const conBC = anguloRectas(r, rectaPorPuntos(B, C));
    expect(conBC).toBeCloseTo(56.943, 3);
    expect(Math.abs(conBC - delta)).toBeLessThan(0.5);
    /* Con cualquier recta del plano sale más que con la proyección. */
    expect(conBC).toBeGreaterThan(delta);
    expect(anguloRectas(r, rectaPorPuntos(A, B))).toBeCloseTo(63.983, 3);
    const conPH = Math.asin(Math.abs(r.d.z)) * G;
    expect(conPH).toBeCloseTo(33.1559, 3);
    expect(Math.abs(conPH - (90 - delta))).toBeLessThan(0.5);
  });

  it('la construcción: los planos verticales de r y de t, la horizontal por 2 y la frontal por 1', () => {
    const P_alto = punto3([L.puntos.P2.x, L.puntos.P2.y - 10], [L.puntos.P1.x, L.puntos.P1.y]);
    const vertR = plano(P, R, P_alto);
    const vertT = plano(P, T, P_alto);
    const I1 = corteRectaPlano(rectaPorPuntos(A, C), vertR);
    const I2 = corteRectaPlano(rectaPorPuntos(C, B), vertR);
    const I3 = corteRectaPlano(rectaPorPuntos(C, B), vertT);
    const I4 = corteRectaPlano(rectaPorPuntos(A, B), vertT);
    cerca(proyPlanta(I1), [245.6836, 363.1049]);
    cerca(proyAlzado(I1), [245.6836, 193.511]);
    cerca(proyPlanta(I2), [288.4588, 437.239]);
    cerca(proyAlzado(I2), [288.4588, 241.8437]);
    cerca(proyPlanta(I3), [347.7905, 465.3396]);
    cerca(proyAlzado(I3), [347.7905, 257.2383]);
    cerca(proyPlanta(I4), [353.8781, 403.3405]);
    cerca(proyAlzado(I4), [353.8781, 213.9764]);
    const H = pieComun(rectaPorPuntos(A, B), horizontalPor(I2, abc));
    const F = pieComun(rectaPorPuntos(A, B), frontalPor(I1, abc));
    cerca(proyPlanta(H), [374.1962, 445.6575]);
    cerca(proyAlzado(F), [334.5594, 187.4798]);
  });

  it('el triángulo PTR abatido con su horizontal por T: P₀ a los dos lados, R₀ con él, y δ en R₀', () => {
    const ptr = plano(P, T, R);
    const ch = horizontalPor(T, ptr);
    const J = pieComun(r, ch);
    cerca(proyPlanta(J), [235.923, 346.1885]);
    cerca(proyPlanta(pieEnRecta(P, ch)), [390.9524, 464.3369]);
    const [Pa, Pb] = abatido(P, ch, ptr);
    cerca(proyPlanta(Pa), [293.7731, 591.8515]);
    cerca(proyPlanta(Pb), [488.1316, 336.8223]);
    const Ra = abatidoJunto(R, ch, ptr, Pa, P);
    const Rb = abatidoJunto(R, ch, ptr, Pb, P);
    cerca(proyPlanta(Ra), [247.7809, 396.5436]);
    cerca(proyPlanta(Rb), [287.6197, 344.2687]);
    /* En el papel: el ángulo en R₀ es δ y el de T₁ es recto, a los dos lados. */
    const T1 = proyPlanta(T);
    for (const [Pab, Rab] of [[Pa, Ra], [Pb, Rb]] as const) {
      expect(angTri(proyPlanta(Rab), T1, proyPlanta(Pab))).toBeCloseTo(56.8808, 3);
      expect(angTri(T1, proyPlanta(Rab), proyPlanta(Pab))).toBeCloseTo(90, 6);
      /* T₁P₀ es la verdadera magnitud de PT. */
      expect(Math.hypot(proyPlanta(Pab)[0] - T1[0], proyPlanta(Pab)[1] - T1[1])).toBeCloseTo(vm(P, T), 6);
    }
  });
});
