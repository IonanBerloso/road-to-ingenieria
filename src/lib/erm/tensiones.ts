/**
 * Tema 2 de ERM: tensiones. El vector tensión de un plano y sus componentes
 * intrínsecas, tensiones y direcciones principales en 3D y en tensión plana,
 * el giro de ejes, el círculo de Mohr y la tangencial máxima.
 *
 * Para quién: el alumno del parcial 1. Cuándo: el ejercicio de «la matriz de
 * tensiones en un punto… determinar las tensiones y direcciones principales y
 * las componentes intrínsecas en el plano…», que cae en los parciales de
 * 2013, 2016, 2017, 2019 y 2022, y al final de los de galgas, que piden las
 * tensiones que causan lo medido. Qué gana: cada resultado calculado y comprobado por
 * otro camino. Cómo se comprueba: `tests/fisica/erm/tensiones.test.ts`
 * (invariantes, ortogonalidad, círculo contra fórmula) y el ejercicio 1 del
 * parcial del 03-11-2017 en `aceptacion.test.ts`.
 *
 * EL CONVENIO ES EL DEL CURSO (apuntes del tema 2):
 *   · p. 5-6: una componente es positiva si va en sentido positivo en cara
 *     positiva, o en sentido negativo en cara negativa. τij: i es la normal
 *     del plano, j la dirección de la componente.
 *   · p. 11-12, ecs. 2.14 y 2.16: {S} = [σ]{n}; σn = {n}ᵗ[σ]{n} y
 *     τn² = |S|² − σn². En 3D, τn es un módulo, siempre ≥ 0.
 *   · p. 22, ecs. 2.57-2.59, figura 2.11: en tensión plana, n = (cos θ, sen θ)
 *     con θ antihorario desde x, y t̂ = (−sen θ, cos θ); τn = S·t̂ lleva signo.
 *     Ec. 2.61 (p. 23): σn = (σx+σy)/2 + (σx−σy)/2·cos 2θ + τxy·sen 2θ y
 *     τn = (σy−σx)/2·sen 2θ + τxy·cos 2θ. Con θ' = θ + 90° sale σy'.
 *   · p. 23, ec. 2.62: tan 2θ1 = 2τxy/(σx − σy) da las direcciones principales.
 *   · pp. 24-26, ecs. 2.68-2.69 y figuras 2.12-2.13: centro (σx+σy)/2, radio
 *     √(((σx−σy)/2)² + τxy²), σ1,2 = σC ± R. El eje vertical es |τn|, y una
 *     dirección va en la mitad SUPERIOR si las tangenciales de los planos
 *     perpendiculares a ella forman par HORARIO: con τxy > 0 el eje x va abajo,
 *     en (σx, −τxy), y el y arriba, en (σy, τxy). Con ese dibujo, girar la
 *     dirección θ antihorario es girar el punto 2θ antihorario en el círculo.
 *     El curso no usa el polo, y aquí no se calcula.
 *   · pp. 27-29, figuras 2.14-2.15: τmax = (σ1 − σ3)/2, el radio del círculo
 *     mayor; en tensión plana la tercera principal es 0 y entra en el orden.
 */
import { dot, mulMV, norma, principales, type Mat3, type Principales, type Vec3 } from './tensor';

export type { Mat3, Vec3 } from './tensor';

/** Tensor de tensiones a partir de sus seis componentes. */
export function tensorTensiones(c: {
  sx: number;
  sy: number;
  sz: number;
  txy?: number;
  tyz?: number;
  tzx?: number;
}): Mat3 {
  const txy = c.txy ?? 0;
  const tyz = c.tyz ?? 0;
  const tzx = c.tzx ?? 0;
  return [
    [c.sx, txy, tzx],
    [txy, c.sy, tyz],
    [tzx, tyz, c.sz],
  ];
}

/** Ec. 2.14: el vector tensión del plano de normal unitaria n. */
export function vectorTension(sigma: Mat3, n: Vec3): Vec3 {
  return mulMV(sigma, n);
}

/** Ec. 2.16: componentes intrínsecas. τn es el módulo de la tangencial. */
export function componentesIntrinsecas(sigma: Mat3, n: Vec3): { S: Vec3; sigmaN: number; tauN: number } {
  if (Math.abs(norma(n) - 1) > 1e-9) throw new Error('La normal del plano tiene que ser unitaria.');
  const S = vectorTension(sigma, n);
  const sigmaN = dot(S, n);
  const tauN = Math.sqrt(Math.max(0, dot(S, S) - sigmaN * sigmaN));
  return { S, sigmaN, tauN };
}

/** Normal unitaria dada por los ángulos que forma con los ejes (en grados). Falta uno: se completa. */
export function normalPorAngulos(alfa: number | null, beta: number | null, gamma: number | null, signoFalta = 1): Vec3 {
  const c = (g: number | null) => (g === null ? null : Math.cos((g * Math.PI) / 180));
  const cs = [c(alfa), c(beta), c(gamma)];
  const faltan = cs.filter((x) => x === null).length;
  if (faltan > 1) throw new Error('Hacen falta al menos dos ángulos.');
  const suma = cs.reduce<number>((s, x) => s + (x ?? 0) ** 2, 0);
  if (suma > 1 + 1e-12) throw new Error('Esos ángulos no son de una dirección: los cosenos al cuadrado suman más de 1.');
  const resto = signoFalta * Math.sqrt(Math.max(0, 1 - suma));
  return [cs[0] ?? resto, cs[1] ?? resto, cs[2] ?? resto];
}

/** Tensiones y direcciones principales (σ1 ≥ σ2 ≥ σ3). */
export function principalesTension(sigma: Mat3): Principales {
  return principales(sigma);
}

/** Tensión tangencial máxima: el radio del círculo de Mohr mayor. */
export function tauMax(sigma: Mat3): number {
  const [s1, , s3] = principales(sigma).valores;
  return (s1 - s3) / 2;
}

/** Ecs. 2.51-2.54: componentes esférica y desviadora. */
export function esfericaDesviadora(sigma: Mat3): { sigmaE: number; desviador: Mat3 } {
  const sigmaE = (sigma[0][0] + sigma[1][1] + sigma[2][2]) / 3;
  const d = sigma.map((f, i) => f.map((v, j) => (i === j ? v - sigmaE : v))) as unknown as Mat3;
  return { sigmaE, desviador: d };
}

/* ── tensión plana ─────────────────────────────────────────────────────── */

export interface Plana {
  sx: number;
  sy: number;
  txy: number;
}

/** Ec. 2.61: σn y τn (con signo, según t̂) en el plano cuya normal forma θ (rad) con x. */
export function planoTension(p: Plana, theta: number): { sigmaN: number; tauN: number } {
  const c2 = Math.cos(2 * theta);
  const s2 = Math.sin(2 * theta);
  return {
    sigmaN: (p.sx + p.sy) / 2 + ((p.sx - p.sy) / 2) * c2 + p.txy * s2,
    tauN: ((p.sy - p.sx) / 2) * s2 + p.txy * c2,
  };
}

/** Las componentes en ejes x'y' girados θ (rad) antihorario: σx', σy', τx'y'. */
export function giroEjes(p: Plana, theta: number): Plana {
  const a = planoTension(p, theta);
  const b = planoTension(p, theta + Math.PI / 2);
  return { sx: a.sigmaN, sy: b.sigmaN, txy: a.tauN };
}

export interface Mohr2D {
  centro: number;
  radio: number;
  sigma1: number;
  sigma2: number;
  /** Ángulo (rad, antihorario desde x) de la dirección de σ1, en (−π/2, π/2]. */
  theta1: number;
  /** Puntos de los ejes x e y en el dibujo del curso: ordenada positiva = par horario. */
  puntoX: [number, number];
  puntoY: [number, number];
}

/** Ecs. 2.62 y 2.68-2.69: el círculo de Mohr de un estado plano. */
export function mohrPlano(p: Plana): Mohr2D {
  const centro = (p.sx + p.sy) / 2;
  const radio = Math.hypot((p.sx - p.sy) / 2, p.txy);
  return {
    centro,
    radio,
    sigma1: centro + radio,
    sigma2: centro - radio,
    theta1: radio === 0 ? 0 : Math.atan2(2 * p.txy, p.sx - p.sy) / 2,
    puntoX: [p.sx, -p.txy],
    puntoY: [p.sy, p.txy],
  };
}

/**
 * Figura 2.15: las tres tensiones principales de un estado de tensión plana
 * (la de z es 0) ordenadas, y la tangencial máxima, que no siempre está en el
 * plano xy.
 */
export function principalesPlana(p: Plana): { valores: Vec3; tauMax: number } {
  const m = mohrPlano(p);
  const v = [m.sigma1, m.sigma2, 0].sort((a, b) => b - a) as [number, number, number];
  return { valores: v, tauMax: (v[0] - v[2]) / 2 };
}

/** Los tres círculos de Mohr del estado general (figura 2.14): centro y radio de cada uno. */
export function circulosMohr(valores: Vec3): { centro: number; radio: number; planos: string }[] {
  const [s1, s2, s3] = valores;
  return [
    { planos: '1-2', centro: (s1 + s2) / 2, radio: (s1 - s2) / 2 },
    { planos: '2-3', centro: (s2 + s3) / 2, radio: (s2 - s3) / 2 },
    { planos: '1-3', centro: (s1 + s3) / 2, radio: (s1 - s3) / 2 },
  ];
}
