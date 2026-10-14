/**
 * Tema 8 de ERM: tracción y compresión. Alargamientos de barras de sección o
 * carga variable, la barra recta con tramos, cargas, temperatura y una
 * holgura que se cierra, las tensiones en un plano inclinado de una barra a
 * tracción, y los depósitos y anillos de pequeño espesor.
 *
 * Para quién: el alumno del parcial 1 (30 de octubre de 2026). Cuándo: en el
 * ejercicio de barras, que cae en los diez parciales 1 distintos leídos entre
 * 2012 y 2022, y en la teoría de depósitos (parciales de 2013 y 2019). Qué gana: el
 * resultado de cada apartado calculado y comprobado por otro camino, que el
 * material no trae. Cómo se comprueba: `tests/fisica/erm/axial.test.ts`
 * (fórmulas cerradas de libro y el equilibrio de cada nudo) y el ejercicio 1
 * del parcial del 16-11-2018 en `aceptacion.test.ts`.
 *
 * El convenio es el del curso (apuntes del tema 8):
 *   · p. 5-6, ecs. 8.3-8.5: εx = σx/E + ε0 y σx = N/A, con N > 0 tracción.
 *     ε0 es la deformación inicial: αΔT si cambia la temperatura, y h/L si la
 *     barra es h más larga por un error de fabricación (h < 0 si es más corta).
 *   · p. 6-7, ecs. 8.8-8.9: ΔL = ∫(N/EA + ε0) dx, y NL/EA + ε0·L si todo es
 *     uniforme.
 *   · p. 10, ecs. 8.15-8.17: depósito esférico σ = pr/2t; cilíndrico
 *     σ1 = pr/t (circunferencial) y σ2 = pr/2t (longitudinal).
 *   · p. 11-12, ecs. 8.18-8.19: anillo con presión interior σ = pr1/t, con
 *     presión exterior σ = −pr2/t; ε = σ/E + ε0.
 *   · El plano inclinado sale del tema 2 (p. 22, ec. 2.59) con σy = τxy = 0:
 *     θ es el ángulo de la normal del plano con el eje de la barra, medido en
 *     sentido antihorario, y τn va según t̂ = (−sen θ, cos θ).
 *
 * En la barra recta de `resuelveBarraAxial`, x va de izquierda a derecha, las
 * cargas P y los desplazamientos u son positivos hacia +x.
 */
import { resuelveLineal } from './lineal';

/** Ec. 8.9: alargamiento de una barra uniforme. */
export function alargamiento(N: number, L: number, E: number, A: number, eps0 = 0): number {
  return (N * L) / (E * A) + eps0 * L;
}

/** ε0 de una barra: αΔT más h/L, con h lo que la barra mide de más (8.3, p. 6). */
export function deformacionInicial(d: { alfa?: number; dT?: number; h?: number; L?: number }): number {
  const termica = (d.alfa ?? 0) * (d.dT ?? 0);
  if (d.h && !(d.L && d.L > 0)) throw new Error('Un error de fabricación h necesita la longitud L de la barra (ε0 = h/L).');
  const fabricacion = d.h ? d.h / (d.L as number) : 0;
  return termica + fabricacion;
}

/* Gauss-Legendre de 5 puntos en [−1, 1]. */
const GL_X = [0, -0.5384693101056831, 0.5384693101056831, -0.906179845938664, 0.906179845938664];
const GL_W = [0.5688888888888889, 0.4786286704993665, 0.4786286704993665, 0.2369268850561891, 0.2369268850561891];

/** Integral de f en [a, b] con Gauss-Legendre compuesta de `n` subintervalos. */
export function integra(f: (x: number) => number, a: number, b: number, n = 64): number {
  const h = (b - a) / n;
  let s = 0;
  for (let k = 0; k < n; k++) {
    const c = a + (k + 0.5) * h;
    for (let i = 0; i < 5; i++) s += GL_W[i] * f(c + (GL_X[i] * h) / 2);
  }
  return (s * h) / 2;
}

/**
 * Ec. 8.8: alargamiento de una barra con N, EA o ε0 variables a lo largo de x,
 * de 0 a L. Sirve para la barra cónica y para la que cuelga con su peso.
 */
export function alargamientoVariable(
  f: { N: (x: number) => number; EA: (x: number) => number; eps0?: (x: number) => number },
  L: number,
  n = 64,
): number {
  return integra((x) => f.N(x) / f.EA(x) + (f.eps0 ? f.eps0(x) : 0), 0, L, n);
}

export interface TramoAxial {
  L: number;
  EA: number;
  /** Deformación inicial del tramo (αΔT + h/L). */
  eps0?: number;
}

export interface BarraAxial {
  tramos: TramoAxial[];
  /** Cargas en los nudos: el nudo k está entre el tramo k−1 y el k (0 y n son los extremos). */
  cargas?: { nudo: number; P: number }[];
  izquierda: 'fijo' | 'libre';
  /** `holgura`: el extremo derecho está a `holgura` de una pared y la toca si llega. */
  derecha: 'fijo' | 'libre' | { holgura: number };
}

export interface SolucionAxial {
  /** Fuerza normal de cada tramo, tracción positiva. */
  N: number[];
  /** Desplazamiento de cada nudo, positivo hacia +x. */
  u: number[];
  /** Fuerza que el apoyo izquierdo y el derecho ejercen sobre la barra (+x). */
  reaccionIzq: number;
  reaccionDer: number;
  /** Si hay holgura: si se ha cerrado. */
  contacto: boolean;
}

/** Resuelve la barra con los extremos dados; `uDer` impone el desplazamiento del extremo derecho. */
function resuelveCon(b: BarraAxial, uDer: number | null): SolucionAxial {
  const n = b.tramos.length;
  const nd = n + 1;
  const K = Array.from({ length: nd }, () => new Array<number>(nd).fill(0));
  const F = new Array<number>(nd).fill(0);
  b.tramos.forEach((t, k) => {
    const rig = t.EA / t.L;
    const d0 = (t.eps0 ?? 0) * t.L;
    K[k][k] += rig;
    K[k + 1][k + 1] += rig;
    K[k][k + 1] -= rig;
    K[k + 1][k] -= rig;
    F[k] -= rig * d0;
    F[k + 1] += rig * d0;
  });
  for (const c of b.cargas ?? []) F[c.nudo] += c.P;
  const restr: { nudo: number; valor: number }[] = [];
  if (b.izquierda === 'fijo') restr.push({ nudo: 0, valor: 0 });
  if (uDer !== null) restr.push({ nudo: n, valor: uDer });
  const m = nd + restr.length;
  /* Las filas de ligadura se escalan con la rigidez: con un 1 frente a un EA/L
     de 10⁸, el pivote de la ligadura se confundía con un cero y una barra
     empotrada salía «mecanismo». Se vio en rojo al escribir el test. */
  const s = Math.max(...K.map((f, i) => Math.abs(f[i]))) || 1;
  const A = Array.from({ length: m }, () => new Array<number>(m).fill(0));
  const rhs = new Array<number>(m).fill(0);
  for (let i = 0; i < nd; i++) {
    for (let j = 0; j < nd; j++) A[i][j] = K[i][j];
    rhs[i] = F[i];
  }
  restr.forEach((r, k) => {
    A[r.nudo][nd + k] = s;
    A[nd + k][r.nudo] = s;
    rhs[nd + k] = s * r.valor;
  });
  const sol = resuelveLineal(A, rhs);
  if (sol.rango < m) throw new Error('La barra no está sujeta: es un mecanismo.');
  const u = sol.x.slice(0, nd);
  const N = b.tramos.map((t, k) => (t.EA / t.L) * (u[k + 1] - u[k] - (t.eps0 ?? 0) * t.L));
  /* La reacción es −s·λ: el multiplicador entra en K·u + s·λ = F. */
  const reac = (nudo: number) => {
    const k = restr.findIndex((r) => r.nudo === nudo);
    return k < 0 ? 0 : -s * sol.x[nd + k];
  };
  return { N, u, reaccionIzq: reac(0), reaccionDer: reac(n), contacto: false };
}

/**
 * Resuelve la barra recta. Con holgura, primero se resuelve libre; si el
 * extremo derecho llega a la pared (u ≥ holgura), se vuelve a resolver con
 * u = holgura en ese extremo: es el «valor de P para que la viga toque la
 * pared» y lo que pasa después.
 */
export function resuelveBarraAxial(b: BarraAxial): SolucionAxial {
  if (b.derecha === 'fijo') return resuelveCon(b, 0);
  if (b.derecha === 'libre') return resuelveCon(b, null);
  const libre = resuelveCon(b, null);
  const xi = b.derecha.holgura;
  if (libre.u[b.tramos.length] < xi) return libre;
  return { ...resuelveCon(b, xi), contacto: true };
}

/** Tensiones en un plano cuya normal forma θ (rad, antihorario) con el eje de una barra a tensión σ. */
export function planoInclinado(sigma: number, theta: number): { sigmaN: number; tauN: number } {
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  return { sigmaN: sigma * c * c, tauN: -sigma * s * c };
}

/** Ecs. 8.16-8.17: depósito cilíndrico de radio r y espesor t con presión p. */
export function depositoCilindrico(p: number, r: number, t: number): { circunferencial: number; longitudinal: number } {
  return { circunferencial: (p * r) / t, longitudinal: (p * r) / (2 * t) };
}

/** Ec. 8.15: depósito esférico. */
export function depositoEsferico(p: number, r: number, t: number): number {
  return (p * r) / (2 * t);
}

/** Ecs. 8.18-8.19: anillo con presión en su radio interior (r1) o exterior (r2). */
export function anillo(
  p: number,
  r: number,
  t: number,
  E: number,
  cara: 'interior' | 'exterior',
  eps0 = 0,
): { sigma: number; epsilon: number } {
  const sigma = cara === 'interior' ? (p * r) / t : (-p * r) / t;
  return { sigma, epsilon: sigma / E + eps0 };
}
