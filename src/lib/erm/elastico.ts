/**
 * Tema 4 de ERM: el cuerpo elástico. La ley de Hooke generalizada en los dos
 * sentidos, la relación entre E, G y ν, la variación de volumen, la
 * deformación térmica y los estados de tensión y de deformación plana.
 *
 * Para quién: el alumno del parcial 1. Cuándo: entre las galgas y las
 * tensiones (εx, εy, γxy → σ), en el prisma entre placas de 2012 y 2014 y en
 * el hueco rígido de 2015. Qué gana: el paso de deformaciones a tensiones sin
 * equivocar el denominador 1 − ν² de la tensión plana. Cómo se comprueba:
 * `tests/fisica/erm/elastico.test.ts` (ida y vuelta, el estado hidrostático
 * de la ec. 4.15, el cortante puro que da G, la energía por dos fórmulas).
 *
 * EL CONVENIO ES EL DEL CURSO (apuntes del tema 4):
 *   · p. 4, ec. 4.2: εx = [σx − ν(σy + σz)]/E, y así en y y z.
 *   · p. 5, ecs. 4.3 y 4.6: γ = τ/G, con G = E/(2(1 + ν)).
 *   · pp. 6-7, ecs. 4.12-4.13: σ = 2Gε + λe, τ = Gγ, λ = νE/((1+ν)(1−2ν)).
 *   · p. 7, ecs. 4.14-4.16: e = 3(1 − 2ν)σe/E; módulo volumétrico
 *     k = E/(3(1 − 2ν)). P. 8, ec. 4.18: −1 < ν < 0,5.
 *   · pp. 8-9, ecs. 4.19-4.22: la temperatura suma αΔT a cada deformación
 *     normal; en sentido inverso se usa ε' = ε − αΔT y e' = e − 3αΔT.
 *   · p. 9, ecs. 4.24-4.25: tensión plana, σx = E(εx + νεy)/(1 − ν²) y
 *     εz = −ν(σx + σy)/E. P. 10: deformación plana, εz = 0.
 *   · p. 13, ec. 4.36: U0 = ½(σxεx + σyεy + σzεz + τxyγxy + τyzγyz + τzxγzx).
 * Los tensores son los de `tensiones.ts` (τ fuera de la diagonal) y
 * `deformaciones.ts` (½γ fuera de la diagonal).
 */
import type { Mat3 } from './tensor';

export function moduloG(E: number, nu: number): number {
  compruebaNu(nu);
  return E / (2 * (1 + nu));
}

export function lame(E: number, nu: number): number {
  compruebaNu(nu);
  return (nu * E) / ((1 + nu) * (1 - 2 * nu));
}

export function moduloVolumetrico(E: number, nu: number): number {
  compruebaNu(nu);
  return E / (3 * (1 - 2 * nu));
}

/** ν a partir de E y G (ec. 4.6 despejada). */
export function poissonDeEG(E: number, G: number): number {
  return E / (2 * G) - 1;
}

/** Comprueba la ec. 4.18 y lanza si ν no es físicamente posible. */
function compruebaNu(nu: number): void {
  if (!(nu > -1 && nu < 0.5)) throw new Error(`ν = ${nu} no está entre −1 y 0,5 (ec. 4.18).`);
}

/** Ecs. 4.2-4.3 y 4.19: tensor de deformaciones a partir del de tensiones. */
export function deformacionesDeTensiones(sigma: Mat3, E: number, nu: number, alfaDT = 0): Mat3 {
  compruebaNu(nu);
  const G = moduloG(E, nu);
  const [sx, sy, sz] = [sigma[0][0], sigma[1][1], sigma[2][2]];
  const ex = (sx - nu * (sy + sz)) / E + alfaDT;
  const ey = (sy - nu * (sx + sz)) / E + alfaDT;
  const ez = (sz - nu * (sx + sy)) / E + alfaDT;
  /* fuera de la diagonal va ½γ = τ/(2G) */
  const h = (t: number) => t / (2 * G);
  return [
    [ex, h(sigma[0][1]), h(sigma[0][2])],
    [h(sigma[1][0]), ey, h(sigma[1][2])],
    [h(sigma[2][0]), h(sigma[2][1]), ez],
  ];
}

/** Ecs. 4.12-4.13 y 4.21-4.22: tensor de tensiones a partir del de deformaciones. */
export function tensionesDeDeformaciones(eps: Mat3, E: number, nu: number, alfaDT = 0): Mat3 {
  compruebaNu(nu);
  const G = moduloG(E, nu);
  const lam = lame(E, nu);
  const ex = eps[0][0] - alfaDT;
  const ey = eps[1][1] - alfaDT;
  const ez = eps[2][2] - alfaDT;
  const e = ex + ey + ez;
  /* τ = G·γ = 2G·(½γ) */
  const t = (h: number) => 2 * G * h;
  return [
    [2 * G * ex + lam * e, t(eps[0][1]), t(eps[0][2])],
    [t(eps[1][0]), 2 * G * ey + lam * e, t(eps[1][2])],
    [t(eps[2][0]), t(eps[2][1]), 2 * G * ez + lam * e],
  ];
}

/** Ecs. 4.24-4.25: tensión plana a partir de εx, εy, γxy (galgas); da también εz. */
export function tensionPlana(
  d: { ex: number; ey: number; gxy: number },
  E: number,
  nu: number,
  alfaDT = 0,
): { sx: number; sy: number; txy: number; ez: number } {
  compruebaNu(nu);
  const ex = d.ex - alfaDT;
  const ey = d.ey - alfaDT;
  const sx = (E / (1 - nu * nu)) * (ex + nu * ey);
  const sy = (E / (1 - nu * nu)) * (nu * ex + ey);
  return { sx, sy, txy: moduloG(E, nu) * d.gxy, ez: (-nu * (sx + sy)) / E + alfaDT };
}

/** Deformación plana (p. 10): εz = 0 y la σz que hace falta para impedirla. */
export function deformacionPlana(
  d: { ex: number; ey: number; gxy: number },
  E: number,
  nu: number,
): { sx: number; sy: number; sz: number; txy: number } {
  const s = tensionesDeDeformaciones(
    [
      [d.ex, d.gxy / 2, 0],
      [d.gxy / 2, d.ey, 0],
      [0, 0, 0],
    ],
    E,
    nu,
  );
  return { sx: s[0][0], sy: s[1][1], sz: s[2][2], txy: s[0][1] };
}

/** Ec. 4.8: deformación volumétrica e = (1 − 2ν)(σx + σy + σz)/E (+ 3αΔT). */
export function variacionVolumen(sigma: Mat3, E: number, nu: number, alfaDT = 0): number {
  return ((1 - 2 * nu) * (sigma[0][0] + sigma[1][1] + sigma[2][2])) / E + 3 * alfaDT;
}

/** Ec. 4.36: energía de deformación por unidad de volumen. Con ½γ en el tensor, τγ = 2·σij·εij. */
export function energiaPorVolumen(sigma: Mat3, eps: Mat3): number {
  let u = 0;
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) u += sigma[i][j] * eps[i][j];
  return u / 2;
}
