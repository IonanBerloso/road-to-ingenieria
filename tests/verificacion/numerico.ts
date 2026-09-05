/**
 * Cálculo numérico mínimo para `tests/verificacion/`.
 *
 * POR QUÉ ES LA HERRAMIENTA BUENA PARA CÁLCULO
 * Las respuestas de Álgebra se verifican rehaciendo el mismo álgebra, así que
 * un malentendido de fondo sobreviviría a las dos. En Cálculo se puede hacer
 * algo mejor: **el resultado se obtiene por un camino distinto del de la
 * resolución**. Donde el examen integra por partes, aquí se integra por
 * Simpson; donde deriva y despeja, aquí se busca el máximo por sección áurea.
 * Si los dos caminos aterrizan en el mismo número, el número es bueno.
 *
 * La contrapartida es que esto no demuestra nada, solo comprueba: una
 * cuadratura con seis cifras buenas no distingue π de π + 10⁻⁹. Para lo que se
 * usa —tolerancias de 10⁻³ o 10⁻⁴— sobra.
 */

/** Simpson adaptativo. Devuelve el valor con el error pedido o falla. */
export function integra(
  f: (x: number) => number,
  a: number,
  b: number,
  tol = 1e-10,
): number {
  const simpson = (x0: number, x1: number) => {
    const m = (x0 + x1) / 2;
    return ((x1 - x0) / 6) * (f(x0) + 4 * f(m) + f(x1));
  };
  const paso = (x0: number, x1: number, entero: number, e: number, hondo: number): number => {
    const m = (x0 + x1) / 2;
    const izq = simpson(x0, m);
    const der = simpson(m, x1);
    if (hondo > 50) throw new Error(`la integral no converge en [${x0}, ${x1}]`);
    if (Math.abs(izq + der - entero) <= 15 * e) return izq + der + (izq + der - entero) / 15;
    return paso(x0, m, izq, e / 2, hondo + 1) + paso(m, x1, der, e / 2, hondo + 1);
  };
  return paso(a, b, simpson(a, b), tol, 0);
}

/**
 * Integral de a a b cuando la función tiene una singularidad integrable —una
 * derivada infinita, típicamente— en uno de los dos extremos. `singular` dice
 * en cuál, y **hay que decirlo**: la primera versión suponía siempre que era
 * el primero, y al integrar un cuarto de circunferencia de 4 a 2√2 devolvió el
 * área con el signo cambiado sin quejarse de nada.
 *
 * El corte se aprieta hasta que dos cortes seguidos coinciden.
 */
export function integraCasi(
  f: (x: number) => number,
  a: number,
  b: number,
  tol = 1e-8,
  singular: 'a' | 'b' = 'a',
): number {
  const conCorte = (eps: number) =>
    singular === 'a' ? integra(f, a + eps * (b - a), b, tol) : integra(f, a, b - eps * (b - a), tol);
  let previo = conCorte(1e-4);
  for (let k = 5; k <= 9; k++) {
    const ahora = conCorte(Math.pow(10, -k));
    if (Math.abs(ahora - previo) < tol) return ahora;
    previo = ahora;
  }
  return previo;
}

/** Derivada por diferencias centradas, con el paso que menos ruido mete. */
export const deriva = (f: (x: number) => number, x: number, h = 1e-5) =>
  (f(x + h) - f(x - h)) / (2 * h);

/** Máximo de una función unimodal en [a,b], por sección áurea. */
export function maximiza(f: (x: number) => number, a: number, b: number): { x: number; y: number } {
  const phi = (Math.sqrt(5) - 1) / 2;
  let lo = a;
  let hi = b;
  for (let k = 0; k < 300; k++) {
    const c = hi - phi * (hi - lo);
    const d = lo + phi * (hi - lo);
    if (f(c) < f(d)) lo = c;
    else hi = d;
  }
  const x = (lo + hi) / 2;
  return { x, y: f(x) };
}

/** Raíz de f en [a,b] por bisección, exigiendo que cambie de signo. */
export function raiz(f: (x: number) => number, a: number, b: number): number {
  if (f(a) * f(b) > 0) throw new Error('no hay cambio de signo en el intervalo');
  let lo = a;
  let hi = b;
  for (let k = 0; k < 200; k++) {
    const m = (lo + hi) / 2;
    if (f(lo) * f(m) <= 0) hi = m;
    else lo = m;
  }
  return (lo + hi) / 2;
}

/**
 * Integral de línea de un campo vectorial sobre una curva parametrizada:
 * ∫ V(r(t))·r'(t) dt. La derivada de la parametrización se toma numérica a
 * propósito, para no tener que escribirla a mano y equivocarse en ella.
 */
export function trabajo(
  V: (p: number[]) => number[],
  r: (t: number) => number[],
  t0: number,
  t1: number,
  tol = 1e-9,
): number {
  const integrando = (t: number) => {
    /* Diferencias centradas de cinco puntos: con tres, el ruido de la
       derivada era del orden de 1e-4 relativo, y una integral que vale
       varios miles no llegaba nunca a la tolerancia por defecto. */
    const h = 1e-4;
    const c = [1 / 12, -8 / 12, 0, 8 / 12, -1 / 12];
    const puntos = [-2, -1, 0, 1, 2].map((k) => r(t + k * h));
    const dr = puntos[0].map((_, i) =>
      c.reduce((s, cj, j) => s + cj * puntos[j][i], 0) / h,
    );
    return V(r(t)).reduce((s, x, i) => s + x * dr[i], 0);
  };
  /* La tolerancia es absoluta, así que en integrales grandes hay que
     aflojarla: pedir 1e-9 sobre un valor de varios miles es pedir trece
     cifras significativas, más de las que da ninguna derivada numérica. */
  return integra(integrando, t0, t1, tol);
}

/* ── complejos, lo justo ────────────────────────────────────────────── */
export type C = [number, number];
export const cSuma = (a: C, b: C): C => [a[0] + b[0], a[1] + b[1]];
export const cResta = (a: C, b: C): C => [a[0] - b[0], a[1] - b[1]];
export const cPor = (a: C, b: C): C => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
export const cEntre = (a: C, b: C): C => {
  const d = b[0] * b[0] + b[1] * b[1];
  return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d];
};
export const cModulo = (a: C) => Math.hypot(a[0], a[1]);
/** sen(x+iy) = sen x · ch y + i · cos x · sh y */
export const cSen = (z: C): C => [
  Math.sin(z[0]) * Math.cosh(z[1]),
  Math.cos(z[0]) * Math.sinh(z[1]),
];
/** cos(x+iy) = cos x · ch y − i · sen x · sh y */
export const cCos = (z: C): C => [
  Math.cos(z[0]) * Math.cosh(z[1]),
  -Math.sin(z[0]) * Math.sinh(z[1]),
];
