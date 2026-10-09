/**
 * Los vectores del espacio de lib/vistas.
 *
 * POR QUÉ NO SON LOS DE `lib/diedrico`. Allí un punto es `{ x, y, z }` con
 * la y como alejamiento —crece hacia quien mira el alzado— y las cuentas
 * son privadas del fichero. Aquí la pieza se escribe como datos, en el YAML,
 * con listas de tres números en el marco de un CAD: x a la derecha, **y hacia
 * el fondo** y z hacia arriba, en mm. Mezclar los dos convenios en un mismo
 * tipo sería pedir que alguien lea una y al revés; por eso el tipo es otro.
 */

import { CASI_CERO } from './tolerancias.ts';

export type V3 = readonly [number, number, number];

export const suma3 = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const resta3 = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const por3 = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
/** a + s·b, que es lo que más se escribe al recorrer una recta. */
export const avanza3 = (a: V3, b: V3, s: number): V3 => [a[0] + b[0] * s, a[1] + b[1] * s, a[2] + b[2] * s];
export const escalar3 = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const vectorial3 = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const modulo3 = (a: V3): number => Math.hypot(a[0], a[1], a[2]);
export const distancia3 = (a: V3, b: V3): number => modulo3(resta3(a, b));

export function unitario3(a: V3): V3 {
  const l = modulo3(a);
  /* También con NaN: una cuenta que ha salido mal no tiene dirección. */
  if (!(l >= CASI_CERO)) throw new Error('un vector de longitud cero no tiene dirección');
  return por3(a, 1 / l);
}

/**
 * Dos vectores unitarios perpendiculares a `n` y entre sí. Se parte del eje
 * del mundo menos alineado con `n`, y así los puntos de un anillo alrededor
 * de una arista de una caja no caen nunca justo en el plano de una cara: con
 * los ángulos del anillo desplazados medio paso (ver `pliegue.ts`), ninguno
 * va a 0°, 90°, 180° ni 270°.
 */
export function baseOrtogonal(n: V3): readonly [V3, V3] {
  const u = unitario3(n);
  const a = Math.abs(u[0]) <= Math.abs(u[1]) && Math.abs(u[0]) <= Math.abs(u[2]) ? 0 : Math.abs(u[1]) <= Math.abs(u[2]) ? 1 : 2;
  const eje: V3 = [a === 0 ? 1 : 0, a === 1 ? 1 : 0, a === 2 ? 1 : 0];
  const e1 = unitario3(vectorial3(u, eje));
  return [e1, vectorial3(u, e1)];
}

/** Gira `p` un ángulo (radianes) alrededor de la recta que pasa por `por`
 *  con dirección unitaria `eje`, con la regla de la mano derecha. */
export function gira3(p: V3, eje: V3, por: V3, angulo: number): V3 {
  const q = resta3(p, por);
  const c = Math.cos(angulo);
  const s = Math.sin(angulo);
  const k = escalar3(eje, q) * (1 - c);
  const x = vectorial3(eje, q);
  return suma3(por, [q[0] * c + x[0] * s + eje[0] * k, q[1] * c + x[1] * s + eje[1] * k, q[2] * c + x[2] * s + eje[2] * k]);
}
