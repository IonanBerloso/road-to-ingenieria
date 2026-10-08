import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  PT_MM,
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

/* Los Ejercicios 24 (SD32) y 25 (SD33) de la Colección de ejercicios de
   diédrico (Dpto. de Expresión Gráfica y Proyectos de Ingeniería, EIG,
   UPV/EHU), págs. 25 y 26, del tema 4: la intersección de los triángulos ABC
   y DEF, con el mismo enunciado y dos figuras.

   Las coordenadas son las de sus láminas. Las cifras esperadas salen de un
   guion aparte, escrito el 8 de octubre de 2026: álgebra de vectores sobre esas
   mismas coordenadas, sin importar nada de `src/lib/`, con la visibilidad por
   rayos contra las dos placas opacas. Aquí se cotejan contra `lib/diedrico`. */

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
/** El cruce de las rectas ab y cd del papel, prolongadas. */
const cruce = (a: P2, b: P2, c: P2, d: P2): P2 => {
  const r: P2 = [b[0] - a[0], b[1] - a[1]];
  const s: P2 = [d[0] - c[0], d[1] - c[1]];
  const t = ((c[0] - a[0]) * s[1] - (c[1] - a[1]) * s[0]) / (r[0] * s[1] - r[1] * s[0]);
  return [a[0] + t * r[0], a[1] + t * r[1]];
};
const vertical = (p: P2): P2 => [p[0], p[1] - 10];
/** Si X, que está en el plano del triángulo, cae dentro de él. */
const dentro = (X: P3, [A, B, C]: readonly P3[]): boolean => {
  const sub = (a: P3, b: P3) => [a.x - b.x, a.y - b.y, a.z - b.z];
  const cruz = (a: number[], b: number[]) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const pe = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const n = cruz(sub(B, A), sub(C, A));
  const s = [[A, B], [B, C], [C, A]].map(([p, q]) => Math.sign(pe(cruz(sub(q, p), sub(X, p)), n)));
  return s.every((x) => x >= 0) || s.every((x) => x <= 0);
};
/** El parámetro de X en el segmento PQ del espacio (0 en P, 1 en Q). */
const enSegmento = (X: P3, P: P3, Q: P3) => {
  const d = [Q.x - P.x, Q.y - P.y, Q.z - P.z];
  return ((X.x - P.x) * d[0] + (X.y - P.y) * d[1] + (X.z - P.z) * d[2]) / (d[0] ** 2 + d[1] ** 2 + d[2] ** 2);
};
const punto = (L: DatosLamina, n: string): P2 => [L.puntos[n].x, L.puntos[n].y];

describe('SD32 · la intersección de los triángulos ABC y DEF', () => {
  const L = lamina('sd32');
  const [A, B, C, D, E, F] = ['A', 'B', 'C', 'D', 'E', 'F'].map((n) => puntoDe(L, n));
  const [abc, def] = [plano(A, B, C), plano(D, E, F)];
  const I = corteRectaPlano(rectaPorPuntos(D, E), abc);
  const J = corteRectaPlano(rectaPorPuntos(B, C), def);
  const K = corteRectaPlano(rectaPorPuntos(A, B), def);
  const Lp = corteRectaPlano(rectaPorPuntos(E, F), abc);

  it('DE atraviesa ABC en I, y BC atraviesa DEF en J, los dos dentro del otro triángulo', () => {
    cerca(proyPlanta(I), [165.3544, 458.315]);
    cerca(proyAlzado(I), [165.3544, 266.3572]);
    cerca(proyPlanta(J), [247.0827, 455.6948]);
    cerca(proyAlzado(J), [247.0827, 273.1032]);
    expect(enSegmento(I, D, E)).toBeCloseTo(0.3448, 3);
    expect(enSegmento(J, B, C)).toBeCloseTo(0.404, 3);
    expect(dentro(I, [A, B, C])).toBe(true);
    expect(dentro(J, [D, E, F])).toBe(true);
    expect(enPlano(I, def)).toBe(true);
    expect(enPlano(J, abc)).toBe(true);
  });

  it('AB y EF cortan el plano del otro fuera de él: K y L, en la recta común, por fuera de IJ', () => {
    cerca(proyAlzado(K), [121.2337, 262.7154]);
    cerca(proyAlzado(Lp), [348.7608, 281.4959]);
    expect(dentro(K, [D, E, F])).toBe(false);
    expect(dentro(Lp, [A, B, C])).toBe(false);
    /* en la recta común van K, I, J y L, en ese orden */
    expect(enSegmento(I, K, Lp)).toBeGreaterThan(0);
    expect(enSegmento(J, K, Lp)).toBeGreaterThan(enSegmento(I, K, Lp));
    expect(enSegmento(J, K, Lp)).toBeLessThan(1);
  });

  it('IJ mide 28,94 mm, y la planta y el alzado casi lo mismo; las cuerdas de un solo triángulo, no', () => {
    expect(mm(vm(I, J))).toBeCloseTo(28.9447, 3);
    expect(mm(vmPlanta(I, J))).toBeCloseTo(28.8467, 3);
    expect(mm(vmAlzado(I, J))).toBeCloseTo(28.93, 3);
    expect(mm(vm(K, J))).toBeCloseTo(44.5704, 3);
    expect(mm(vm(I, Lp))).toBeCloseTo(64.9548, 3);
    expect(mm(vm(K, Lp))).toBeCloseTo(80.5805, 3);
  });

  it('en el papel: M₂N₂ corta D₂E₂ en I₂, y P₂Q₂ corta B₂C₂ en J₂', () => {
    const [A1, B1, C1, D1, E1, F1] = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1'].map((n) => punto(L, n));
    const [A2, B2, C2, D2, E2, F2] = ['A2', 'B2', 'C2', 'D2', 'E2', 'F2'].map((n) => punto(L, n));
    const M1 = cruce(D1, E1, A1, B1);
    const N1 = cruce(D1, E1, C1, A1);
    const M2 = cruce(M1, vertical(M1), A2, B2);
    const N2 = cruce(N1, vertical(N1), C2, A2);
    expect(d2(cruce(M2, N2, D2, E2), proyAlzado(I))).toBeLessThan(0.01);
    const P1 = cruce(B1, C1, F1, D1);
    const Q1 = cruce(B1, C1, E1, F1);
    const P2 = cruce(P1, vertical(P1), F2, D2);
    const Q2 = cruce(Q1, vertical(Q1), E2, F2);
    expect(d2(cruce(P2, Q2, B2, C2), proyAlzado(J))).toBeLessThan(0.01);
  });
});

describe('SD33 · la intersección de ABC y DEF, con la arista FD de perfil', () => {
  const L = lamina('sd33');
  const [A, B, C, D, E, F] = ['A', 'B', 'C', 'D', 'E', 'F'].map((n) => puntoDe(L, n));
  const [abc, def] = [plano(A, B, C), plano(D, E, F)];
  const I = corteRectaPlano(rectaPorPuntos(E, F), abc);
  const J = corteRectaPlano(rectaPorPuntos(F, D), abc);
  const K = corteRectaPlano(rectaPorPuntos(A, B), def);
  const S = corteRectaPlano(rectaPorPuntos(C, A), def);

  it('FD es de perfil, y A, D y E tienen el mismo alejamiento', () => {
    expect(D.x).toBe(F.x);
    expect(A.y).toBe(D.y);
    expect(E.y).toBe(D.y);
  });

  it('EF y FD atraviesan ABC en I y J; la recta común sale de DEF antes que de ABC', () => {
    cerca(proyPlanta(I), [218.5811, 513.4032]);
    cerca(proyAlzado(I), [218.5811, 290.5997]);
    cerca(proyPlanta(J), [155.64, 509.9638]);
    cerca(proyAlzado(J), [155.64, 264.8267]);
    expect(dentro(I, [A, B, C])).toBe(true);
    expect(dentro(J, [A, B, C])).toBe(true);
    expect(dentro(K, [D, E, F])).toBe(false);
    /* en la recta común: S, I, J y K, y el tramo común es IJ, entero en DEF */
    expect(enSegmento(I, S, K)).toBeGreaterThan(0);
    expect(enSegmento(J, S, K)).toBeGreaterThan(enSegmento(I, S, K));
    expect(enSegmento(J, S, K)).toBeLessThan(1);
    expect(mm(vm(J, K))).toBeCloseTo(1.3949, 3);
  });

  it('IJ mide 24,02 mm; el alzado casi lo mismo, la planta no', () => {
    expect(mm(vm(I, J))).toBeCloseTo(24.0243, 3);
    expect(mm(vmPlanta(I, J))).toBeCloseTo(22.2373, 3);
    expect(mm(vmAlzado(I, J))).toBeCloseTo(23.9936, 3);
    expect(mm(vm(I, K))).toBeCloseTo(25.4192, 3);
    expect(mm(vm(S, K))).toBeCloseTo(46.3976, 3);
  });

  it('en el papel: I por el plano vertical de EF, K por el de AB con R en DE prolongada, y J en la recta IK', () => {
    const [A1, B1, C1, D1, E1, F1] = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1'].map((n) => punto(L, n));
    const [A2, B2, C2, D2, E2, F2] = ['A2', 'B2', 'C2', 'D2', 'E2', 'F2'].map((n) => punto(L, n));
    const M1 = cruce(E1, F1, A1, B1);
    const N1 = cruce(E1, F1, C1, A1);
    const M2 = cruce(M1, vertical(M1), A2, B2);
    const N2 = cruce(N1, vertical(N1), C2, A2);
    expect(d2(cruce(M2, N2, E2, F2), proyAlzado(I))).toBeLessThan(0.01);
    /* A₁ está en D₁E₁ prolongada; R₂, en la vertical de A₂ */
    expect(Math.abs(A1[1] - D1[1])).toBeLessThan(1e-9);
    const P2 = cruce(M1, vertical(M1), E2, F2);
    const R2 = cruce(D2, E2, A2, vertical(A2));
    cerca(R2, [84.72, 146.1805]);
    const K2 = cruce(R2, P2, A2, B2);
    expect(d2(K2, proyAlzado(K))).toBeLessThan(0.01);
    const K1 = cruce(K2, vertical(K2), A1, B1);
    expect(d2(K1, proyPlanta(K))).toBeLessThan(0.01);
    expect(d2(cruce(proyAlzado(I), K2, D2, F2), proyAlzado(J))).toBeLessThan(0.01);
    expect(d2(cruce(proyPlanta(I), K1, D1, F1), proyPlanta(J))).toBeLessThan(0.01);
  });
});
