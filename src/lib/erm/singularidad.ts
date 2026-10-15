/**
 * Tema 10 de ERM: la elástica con funciones de singularidad (corchetes de
 * Macaulay), el método del apartado 10.3 de los apuntes, en forma cerrada.
 *
 * Para quién: para el alumno que tiene que escribir el flector de toda la
 * viga «con una única ecuación» (tema 10, p. 8) e integrarlo, y para quien
 * escriba los pasos de esos ejercicios; las finales de 2015-2016 lo piden con
 * esas palabras («por funciones de singularidad»). Cuándo: con EI uniforme.
 * Qué gana: el flector, el giro y la flecha como sumas de términos
 * c·⟨x − a⟩ⁿ que se pueden enseñar paso a paso. Cómo se comprueba:
 * `tests/fisica/erm/elastica.test.ts`, contra la integración numérica de
 * `elastica.ts`, que es otro camino (cuadratura con las reacciones como
 * incógnitas), y contra los casos de libro.
 *
 * EL CONVENIO ES EL DEL CURSO y el de `elastica.ts`: v y y hacia abajo,
 * θ = dv/dx, EI·v″ = −M (ec. 10.14, p. 7), M > 0 tracciona la fibra
 * inferior. ⟨x − a⟩ⁿ = (x − a)ⁿ si x > a y 0 si x ≤ a (ec. 10.15, p. 8).
 * Los términos del flector son los de la figura 10.5 (p. 8-9): una fuerza P
 * hacia abajo en a da −P·⟨x − a⟩; un par M0, M0·⟨x − a⟩⁰ (con el signo de
 * `viga.ts`, positivo el que tracciona la fibra inferior a su derecha); una
 * repartida uniforme q0 desde a, −½q0·⟨x − a⟩², y una lineal de pendiente k,
 * −⅙k·⟨x − a⟩³. Una repartida que no llega al final se cierra sumando y
 * restando (figuras 10.6 y 10.7, p. 9). Las reacciones entran como fuerzas
 * hacia arriba y los empotramientos como pares.
 */
import type { Carga } from '../viga';
import { resuelveLineal } from './lineal';

/** c·⟨x − a⟩ⁿ */
export interface Termino {
  c: number;
  a: number;
  n: number;
}

/** ⟨x − a⟩ⁿ según la ec. 10.15. */
export function corchete(x: number, a: number, n: number): number {
  return x > a ? (x - a) ** n : 0;
}

export function evalua(terminos: readonly Termino[], x: number): number {
  return terminos.reduce((s, t) => s + t.c * corchete(x, t.a, t.n), 0);
}

/** La primitiva término a término: c⟨x − a⟩ⁿ → c⟨x − a⟩ⁿ⁺¹/(n + 1). */
export function integraTerminos(terminos: readonly Termino[]): Termino[] {
  return terminos.map((t) => ({ c: t.c / (t.n + 1), a: t.a, n: t.n + 1 }));
}

/** Una reacción conocida: fuerza hacia arriba R en x y, si es un empotramiento, su par M. */
export interface ReaccionSingular {
  x: number;
  R: number;
  M?: number;
}

/** El flector de toda la viga como suma de corchetes (figuras 10.5-10.7). */
export function flectorSingular(cargas: readonly Carga[], reacciones: readonly ReaccionSingular[]): Termino[] {
  const t: Termino[] = [];
  for (const r of reacciones) {
    t.push({ c: r.R, a: r.x, n: 1 });
    if (r.M) t.push({ c: r.M, a: r.x, n: 0 });
  }
  for (const c of cargas) {
    if (c.tipo === 'puntual') t.push({ c: -c.P, a: c.x, n: 1 });
    else if (c.tipo === 'par') t.push({ c: c.M, a: c.x, n: 0 });
    else {
      const k = (c.q2 - c.q1) / (c.x2 - c.x1);
      t.push({ c: -c.q1 / 2, a: c.x1, n: 2 }, { c: -k / 6, a: c.x1, n: 3 });
      t.push({ c: c.q2 / 2, a: c.x2, n: 2 }, { c: k / 6, a: c.x2, n: 3 });
    }
  }
  return t.filter((x) => x.c !== 0);
}

/** Una condición de contorno o de compatibilidad: la flecha o el giro en x. */
export interface Condicion {
  x: number;
  que: 'v' | 'theta';
  valor: number;
}

export interface ElasticaSingular {
  /** Términos del flector, de EI·θ (sin constantes) y de EI·v (sin constantes). */
  M: Termino[];
  EItheta: Termino[];
  EIv: Termino[];
  C1: number;
  C2: number;
  /** Saltos de giro en las rótulas, en el orden dado. */
  saltos: number[];
  theta: (x: number) => number;
  v: (x: number) => number;
}

/**
 * Integra EI·v″ = −M dos veces: EI·θ = −∫M + C1 y EI·v = −∬M + C1·x + C2,
 * más un salto de giro Δθh·⟨x − xh⟩⁰ (y su Δθh·⟨x − xh⟩ en v) por rótula.
 * Las constantes y los saltos salen de las condiciones, que tienen que ser
 * tantas como incógnitas (2 + número de rótulas).
 */
export function elasticaSingular(
  EI: number,
  cargas: readonly Carga[],
  reacciones: readonly ReaccionSingular[],
  condiciones: readonly Condicion[],
  rotulas: readonly number[] = [],
): ElasticaSingular {
  if (!(EI > 0)) throw new Error('La rigidez EI tiene que ser positiva.');
  const n = 2 + rotulas.length;
  if (condiciones.length !== n) throw new Error(`Hacen falta ${n} condiciones y hay ${condiciones.length}.`);
  const M = flectorSingular(cargas, reacciones);
  const negM = M.map((t) => ({ ...t, c: -t.c }));
  const EItheta = integraTerminos(negM);
  const EIv = integraTerminos(EItheta);
  /* Incógnitas: C1, C2 y EI·Δθh de cada rótula. */
  const A: number[][] = [];
  const b: number[] = [];
  for (const c of condiciones) {
    if (c.que === 'v') {
      A.push([c.x, 1, ...rotulas.map((xr) => corchete(c.x, xr, 1))]);
      b.push(EI * c.valor - evalua(EIv, c.x));
    } else {
      A.push([1, 0, ...rotulas.map((xr) => corchete(c.x, xr, 0))]);
      b.push(EI * c.valor - evalua(EItheta, c.x));
    }
  }
  const sol = resuelveLineal(A, b);
  if (sol.rango < n) throw new Error('Las condiciones no fijan las constantes: falta un apoyo o sobra una condición repetida.');
  const [C1, C2, ...EIsaltos] = sol.x;
  const theta = (x: number) =>
    (evalua(EItheta, x) + C1 + rotulas.reduce((s, xr, h) => s + EIsaltos[h] * corchete(x, xr, 0), 0)) / EI;
  const v = (x: number) =>
    (evalua(EIv, x) + C1 * x + C2 + rotulas.reduce((s, xr, h) => s + EIsaltos[h] * corchete(x, xr, 1), 0)) / EI;
  return { M, EItheta, EIv, C1, C2, saltos: EIsaltos.map((s) => s / EI), theta, v };
}
