/**
 * Tema 3 de ERM: deformaciones. El tensor de deformaciones, la deformación en
 * una dirección y sus componentes intrínsecas, deformaciones principales, las
 * galgas y rosetas, y la deformación tangencial a partir de las aristas
 * deformadas.
 *
 * Para quién: el alumno del parcial 1. Cuándo: el ejercicio de galgas, que
 * cae en los parciales de 2015, 2016, 2017, 2020 y 2022 con tres galgas en
 * direcciones que no son las de la roseta de libro (0°, 60° y 150° en 2016 y
 * 2017). Qué gana: εx, εy y γxy de cualquier terna de galgas, y lo que sigue.
 * Cómo se comprueba: `tests/fisica/erm/deformaciones.test.ts` (las fórmulas
 * cerradas de la roseta a 120° de los apuntes, la geometría exacta de una
 * arista deformada, la solución del ejercicio 3.1) y el ejercicio 2 del
 * parcial del 03-11-2017 en `aceptacion.test.ts`.
 *
 * EL CONVENIO ES EL DEL CURSO (apuntes del tema 3):
 *   · p. 8, ec. 3.15: γxy = π/2 − ϕxy, la disminución del ángulo recto entre
 *     x e y. Ec. 3.21 (p. 9): γxy = u,y + v,x.
 *   · p. 12 (ec. 3.35): el tensor [ε] lleva εx, εy, εz en la diagonal y ½γ
 *     fuera de ella.
 *   · p. 17, ecs. 3.52-3.55: εu = {u}ᵗ[ε]{u} =
 *     εx·ux² + εy·uy² + εz·uz² + γxy·ux·uy + γyz·uy·uz + γzx·uz·ux, y
 *     ½γu = √(Du² − εu²).
 *   · p. 17-18, tabla de similitud: todo lo de tensiones vale con σ → ε y
 *     τ → ½γ. En el círculo de Mohr los ejes son εu y ½γ, y un eje va arriba
 *     si las deformaciones tangenciales lo giran en sentido horario.
 *   · p. 18, ec. 3.59: e = εx + εy + εz.
 *   · p. 21, ecs. 3.65-3.66: roseta a 120° (a según x): εy = [2(εb + εc) − εa]/3
 *     y γxy = 2(εc − εb)/√3.
 *   · Ejercicio 3.1 resuelto de la colección (Solución_del_ejercicio_3.1): la
 *     disminución del ángulo ϕ entre dos direcciones u1 y u2 cualesquiera es
 *     Γ = [2·u1ᵗ[ε]u2 − (ε1 + ε2)·cos ϕ] / sen ϕ.
 */
import { planoTension, mohrPlano } from './tensiones';
import { dot, mulMV, norma, principales, type Mat3, type Principales, type Vec3 } from './tensor';

export type { Mat3, Vec3 } from './tensor';

/** Tensor de deformaciones con ½γ fuera de la diagonal (ec. 3.35). */
export function tensorDeformaciones(c: {
  ex: number;
  ey: number;
  ez: number;
  gxy?: number;
  gyz?: number;
  gzx?: number;
}): Mat3 {
  const hxy = (c.gxy ?? 0) / 2;
  const hyz = (c.gyz ?? 0) / 2;
  const hzx = (c.gzx ?? 0) / 2;
  return [
    [c.ex, hxy, hzx],
    [hxy, c.ey, hyz],
    [hzx, hyz, c.ez],
  ];
}

/** Ecs. 3.49-3.53: vector deformación Du, deformación normal εu y ½γu de la dirección unitaria u. */
export function deformacionEnDireccion(eps: Mat3, u: Vec3): { D: Vec3; epsU: number; mediaGammaU: number } {
  if (Math.abs(norma(u) - 1) > 1e-9) throw new Error('La dirección tiene que ser unitaria.');
  const D = mulMV(eps, u);
  const epsU = dot(D, u);
  return { D, epsU, mediaGammaU: Math.sqrt(Math.max(0, dot(D, D) - epsU * epsU)) };
}

/** Deformaciones y direcciones principales (ε1 ≥ ε2 ≥ ε3). */
export function principalesDeformacion(eps: Mat3): Principales {
  return principales(eps);
}

/** Ec. 3.59: deformación volumétrica unitaria. */
export function volumetrica(eps: Mat3): number {
  return eps[0][0] + eps[1][1] + eps[2][2];
}

/* ── en el plano ───────────────────────────────────────────────────────── */

export interface DefPlana {
  ex: number;
  ey: number;
  gxy: number;
}

/** Ec. 3.55: εu de la dirección que forma θ (rad, antihorario) con x. */
export function deformacionGalga(d: DefPlana, theta: number): number {
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  return d.ex * c * c + d.ey * s * s + d.gxy * s * c;
}

export interface Galga {
  /** Ángulo con el eje x, en grados, antihorario. */
  angulo: number;
  epsilon: number;
}

/**
 * εx, εy y γxy a partir de tres galgas en direcciones cualesquiera: tres
 * ecuaciones 3.55 con tres incógnitas, por Cramer. Dos galgas paralelas (o
 * la misma dirección dos veces) no dan información: se dice.
 */
export function roseta(galgas: readonly [Galga, Galga, Galga]): DefPlana {
  const filas = galgas.map((g) => {
    const t = (g.angulo * Math.PI) / 180;
    const c = Math.cos(t);
    const s = Math.sin(t);
    return [c * c, s * s, s * c];
  });
  const det3 = (m: number[][]) =>
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
    m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
    m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  const D = det3(filas);
  if (Math.abs(D) < 1e-9) throw new Error('Dos galgas tienen la misma dirección: la roseta no determina la deformación.');
  const b = galgas.map((g) => g.epsilon);
  const conColumna = (k: number) => filas.map((f, i) => f.map((v, j) => (j === k ? b[i] : v)));
  return { ex: det3(conColumna(0)) / D, ey: det3(conColumna(1)) / D, gxy: det3(conColumna(2)) / D };
}

/** Roseta a 45°: galgas a 0°, 45° y 90°. */
export function roseta45(ea: number, eb: number, ec: number): DefPlana {
  return { ex: ea, ey: ec, gxy: 2 * eb - ea - ec };
}

/**
 * Roseta a 120° de los apuntes (figura 3.8): a según x, b a 120° y c a 240°.
 * Ecs. 3.65-3.66. OJO: la galga a 240° es la misma recta que una a 60°, así que
 * con las galgas a 0°, 60° y 120° hay que pasar (e0, e120, e60). Pasarlas en
 * orden natural da εx y εy bien y γxy con el signo cambiado, sin aviso: para
 * ese orden está `roseta60`.
 */
export function roseta120(ea: number, eb: number, ec: number): DefPlana {
  return { ex: ea, ey: (2 * (eb + ec) - ea) / 3, gxy: (2 * (ec - eb)) / Math.sqrt(3) };
}

/** Roseta a 60° (delta): galgas a 0°, 60° y 120°, en ese orden. Ec. 3.55 en las tres direcciones. */
export function roseta60(e0: number, e60: number, e120: number): DefPlana {
  return { ex: e0, ey: (2 * (e60 + e120) - e0) / 3, gxy: (2 * (e60 - e120)) / Math.sqrt(3) };
}

/** Mohr de deformaciones en el plano: el de tensiones con σ → ε y τ → ½γ (p. 17). */
export function mohrDeformacion(d: DefPlana) {
  return mohrPlano({ sx: d.ex, sy: d.ey, txy: d.gxy / 2 });
}

/** εu y ½γ con signo en la dirección θ: la ec. 2.61 con la sustitución de la p. 17. */
export function direccionPlana(d: DefPlana, theta: number): { epsU: number; mediaGamma: number } {
  const r = planoTension({ sx: d.ex, sy: d.ey, txy: d.gxy / 2 }, theta);
  return { epsU: r.sigmaN, mediaGamma: r.tauN };
}

/**
 * Ejercicio 3.1 de la colección: disminución Γ del ángulo entre dos
 * direcciones unitarias u1 y u2 (que no tienen por qué ser perpendiculares).
 */
export function disminucionAngulo(eps: Mat3, u1: Vec3, u2: Vec3): number {
  const cosPhi = dot(u1, u2);
  const senPhi = Math.sqrt(Math.max(0, 1 - cosPhi * cosPhi));
  if (senPhi === 0) throw new Error('Dos direcciones paralelas no forman ángulo.');
  const e1 = dot(u1, mulMV(eps, u1));
  const e2 = dot(u2, mulMV(eps, u2));
  return (2 * dot(u1, mulMV(eps, u2)) - (e1 + e2) * cosPhi) / senPhi;
}

/**
 * Ecs. 3.15-3.16: γ a partir de dos aristas que eran perpendiculares, ya
 * deformadas (vectores O'A' y O'B'). Es la definición, sin linealizar:
 * γ = π/2 − ϕ, con tg γ = (a·b)/|a×b|. Con atan2 no se pierden cifras cuando γ
 * es pequeña, que es siempre; π/2 − acos(cos ϕ) las perdía.
 */
export function gammaDeAristas(a: Vec3, b: Vec3): number {
  const cruz = norma([a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]);
  if (cruz === 0 && dot(a, a) * dot(b, b) === 0) throw new Error('Una arista nula no forma ángulo.');
  return Math.atan2(dot(a, b), cruz);
}
