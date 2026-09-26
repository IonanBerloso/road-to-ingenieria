import { describe, expect, it } from 'vitest';
import {
  PT_MM,
  anguloPlanoConPH,
  anguloPlanoConPV,
  anguloEntreRectas,
  corte2D,
  enPlano,
  frontalDir,
  horizontalDir,
  lmiDir,
  lmpDir,
  plano,
  proyAlzado,
  proyPlanta,
  punto3,
  puntoEnPlanoDesdeAlzado,
  puntoEnPlanoDesdePlanta,
  type P2,
  type P3,
} from '../../src/lib/diedrico';

/* SD3 · cuatro tramos sobre un triángulo. Ejercicio 3 de la colección de
   diédrico directo (Dpto. de Expresión Gráfica, EIG, UPV/EHU): desde A, 15 mm
   por una horizontal del plano ABC, 15 mm por una frontal, la línea de máxima
   pendiente bajando hasta el lado de menor cota y la de máxima inclinación
   subiendo hasta AB.

   La figura y la construcción son las del piloto `taller/sd3.js` del paquete
   del 8 de septiembre de 2026, y los valores esperados salieron el 26 de
   septiembre de 2026 de ejecutar el propio piloto con su biblioteca `G`. La
   construcción de abajo es la receta en forma de prueba: el día que el paso
   `construir` lea recetas del YAML, esta es la que tiene que reproducir. */

const A = punto3([188.76, 348.12], [188.76, 524.04]);
const B = punto3([273.84, 244.8], [273.84, 624.84]);
const C = punto3([372.96, 397.56], [372.96, 459.0]);
const abc = plano(A, B, C);
const L = 15 / PT_MM;

/** Si un punto de la planta cae dentro del triángulo A₁B₁C₁: es como se elige
 *  el sentido de los dos primeros tramos, que el enunciado da por dentro. */
const dentro = (x: number, y: number) => {
  const lado = (u: P3, v: P3) => (v.x - u.x) * (y - u.y) - (v.y - u.y) * (x - u.x);
  const s = [lado(A, B), lado(B, C), lado(C, A)];
  return s.every((v) => v >= 0) || s.every((v) => v <= 0);
};

let h = horizontalDir(abc);
if (!dentro(A.x + h[0] * L, A.y + h[1] * L)) h = [-h[0], -h[1]];
const M: P3 = { x: A.x + h[0] * L, y: A.y + h[1] * L, z: A.z };

let f = frontalDir(abc);
if (!dentro(M.x + f[0] * L, M.y)) f = [-f[0], -f[1]];
/* En el alzado la y es menos la cota: avanzar f[1] en y es bajar f[1] en cota. */
const N: P3 = { x: M.x + f[0] * L, y: M.y, z: M.z - f[1] * L };

const baja = lmpDir(abc).baja;
const tP = corte2D(proyPlanta(N), baja, proyPlanta(C), proyPlanta(A))!;
const P = puntoEnPlanoDesdePlanta([N.x + baja[0] * tP.t, N.y + baja[1] * tP.t], abc);

const sube = lmiDir(abc).sube;
const tQ = corte2D(proyAlzado(P), sube, proyAlzado(A), proyAlzado(B))!;
const Q = puntoEnPlanoDesdeAlzado([P.x + sube[0] * tQ.t, proyAlzado(P)[1] + sube[1] * tQ.t], abc);

const cerca = (a: P2, b: P2, tol = 0.001) => {
  expect(Math.abs(a[0] - b[0]), `x ${a[0]} frente a ${b[0]}`).toBeLessThanOrEqual(tol);
  expect(Math.abs(a[1] - b[1]), `y ${a[1]} frente a ${b[1]}`).toBeLessThanOrEqual(tol);
};

describe('SD3 · cuatro tramos sobre un triángulo', () => {
  it('los cuatro puntos del recorrido caen donde los deja el piloto', () => {
    cerca(proyPlanta(M), [231.1615, 520.8717]);
    cerca(proyAlzado(M), [231.1615, 348.12]);
    cerca(proyPlanta(N), [273.5712, 520.8717]);
    cerca(proyAlzado(N), [273.5712, 345.0645]);
    cerca(proyPlanta(P), [271.6218, 494.782]);
    cerca(proyAlzado(P), [271.6218, 370.3604]);
    cerca(proyPlanta(Q), [263.4819, 612.568]);
    cerca(proyAlzado(Q), [263.4819, 257.3788]);
  });

  it('los ángulos del plano con los dos de proyección', () => {
    expect(anguloPlanoConPH(abc)).toBeCloseTo(44.0352, 3);
    expect(anguloPlanoConPV(abc)).toBeCloseTo(46.1186, 3);
  });

  it('la l.m.p. y la l.m.i. forman 5,93°: por eso un tramo corto no las distingue', () => {
    expect(anguloEntreRectas(N, P, P, Q)).toBeCloseTo(5.9339, 3);
  });
});

describe('SD3 · lo que la construcción exige, comprobado sin el piloto', () => {
  it('todo el recorrido está en el plano del triángulo', () => {
    for (const X of [M, N, P, Q]) expect(enPlano(X, abc, 1e-6)).toBe(true);
  });

  it('el primer tramo es horizontal y mide 15 mm en la planta', () => {
    expect(M.z).toBe(A.z);
    expect(Math.hypot(M.x - A.x, M.y - A.y) * PT_MM).toBeCloseTo(15, 9);
  });

  it('el segundo es frontal y mide 15 mm en el alzado', () => {
    expect(N.y).toBe(M.y);
    expect(Math.hypot(N.x - M.x, N.z - M.z) * PT_MM).toBeCloseTo(15, 9);
  });

  it('el tercero baja por la l.m.p. hasta el lado CA, y el cuarto sube por la l.m.i. hasta AB', () => {
    expect(P.z).toBeLessThan(N.z);
    expect(tP.s).toBeGreaterThanOrEqual(0);
    expect(tP.s).toBeLessThanOrEqual(1);
    expect(tQ.s).toBeGreaterThanOrEqual(0);
    expect(tQ.s).toBeLessThanOrEqual(1);
  });

  it('la l.m.i. es perpendicular a las frontales, en el alzado', () => {
    const fr = frontalDir(abc);
    expect(sube[0] * fr[0] + sube[1] * fr[1]).toBeCloseTo(0, 12);
  });
});
