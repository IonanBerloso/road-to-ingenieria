/**
 * Álgebra lineal mínima para `tests/verificacion/`.
 *
 * POR QUÉ ESTÁ AQUÍ Y NO EN `src/lib/`
 * El sitio no necesita esto: sus ejercicios de Álgebra no calculan nada en el
 * navegador, comparan lo que escribe el alumno. Esto existe solo para rehacer
 * las cuentas de los exámenes desde su enunciado, así que vive con los tests.
 *
 * Todo con eliminación gaussiana y pivote parcial. Los tamaños son de examen
 * —matrices de 3×4 como mucho—, así que no hay nada que optimizar y sí que
 * mantener legible.
 */

const CERO = 1e-9;

/** Copia profunda, porque todo lo de aquí elimina sobre la marcha. */
const copia = (A: number[][]) => A.map((f) => [...f]);

/** Forma escalonada reducida por filas. Devuelve la matriz y las columnas pivote. */
export function rref(M: number[][]): { R: number[][]; pivotes: number[] } {
  const R = copia(M);
  const filas = R.length;
  const cols = R[0]?.length ?? 0;
  const pivotes: number[] = [];
  let f = 0;
  for (let c = 0; c < cols && f < filas; c++) {
    /* Pivote parcial: la fila con el mayor valor absoluto en esta columna. */
    let mejor = f;
    for (let i = f + 1; i < filas; i++) if (Math.abs(R[i][c]) > Math.abs(R[mejor][c])) mejor = i;
    if (Math.abs(R[mejor][c]) < CERO) continue;
    [R[f], R[mejor]] = [R[mejor], R[f]];
    const p = R[f][c];
    for (let j = 0; j < cols; j++) R[f][j] /= p;
    for (let i = 0; i < filas; i++) {
      if (i === f) continue;
      const k = R[i][c];
      if (Math.abs(k) < CERO) continue;
      for (let j = 0; j < cols; j++) R[i][j] -= k * R[f][j];
    }
    pivotes.push(c);
    f++;
  }
  return { R, pivotes };
}

export const rango = (M: number[][]) => rref(M).pivotes.length;

/** Determinante por eliminación, para matrices cuadradas. */
export function det(M: number[][]): number {
  const A = copia(M);
  const n = A.length;
  let d = 1;
  for (let c = 0; c < n; c++) {
    let mejor = c;
    for (let i = c + 1; i < n; i++) if (Math.abs(A[i][c]) > Math.abs(A[mejor][c])) mejor = i;
    if (Math.abs(A[mejor][c]) < CERO) return 0;
    if (mejor !== c) {
      [A[c], A[mejor]] = [A[mejor], A[c]];
      d = -d;
    }
    d *= A[c][c];
    for (let i = c + 1; i < n; i++) {
      const k = A[i][c] / A[c][c];
      for (let j = c; j < n; j++) A[i][j] -= k * A[c][j];
    }
  }
  return d;
}

/** Producto matriz por vector. */
export const porVector = (M: number[][], v: number[]) =>
  M.map((f) => f.reduce((s, x, j) => s + x * v[j], 0));

/** Producto de matrices. */
export const porMatriz = (A: number[][], B: number[][]) =>
  A.map((f) => B[0].map((_, j) => f.reduce((s, x, k) => s + x * B[k][j], 0)));

/** Traspuesta. */
export const traspuesta = (A: number[][]) => A[0].map((_, j) => A.map((f) => f[j]));

/**
 * Resuelve un sistema compatible determinado A·x = b. Falla si no lo es: en
 * un test, un sistema que no tiene solución única es un error de
 * planteamiento, no un caso que haya que tratar con elegancia.
 */
export function resuelve(A: number[][], b: number[]): number[] {
  const cols = A[0].length;
  const { R, pivotes } = rref(A.map((f, i) => [...f, b[i]]));
  if (pivotes.includes(cols)) throw new Error('el sistema es incompatible');
  if (pivotes.length !== cols) throw new Error('el sistema no tiene solución única');
  const x = new Array(cols).fill(0);
  pivotes.forEach((c, i) => (x[c] = R[i][cols]));
  return x;
}

/** Inversa por Gauss-Jordan sobre [A | I]. Falla si A es singular. */
export function inversa(A: number[][]): number[][] {
  const n = A.length;
  const { R, pivotes } = rref(A.map((f, i) => [...f, ...f.map((_, j) => (i === j ? 1 : 0))]));
  if (pivotes.length !== n || pivotes.some((c, i) => c !== i))
    throw new Error('la matriz no tiene inversa');
  return R.map((f) => f.slice(n));
}

/**
 * Una base del núcleo de M, con los parámetros libres tomados de uno en uno.
 * El orden de los vectores es el de las columnas libres, de izquierda a
 * derecha; dentro de cada uno, las componentes van en el orden natural.
 */
export function nucleo(M: number[][]): number[][] {
  const cols = M[0].length;
  const { R, pivotes } = rref(M);
  const libres = [...Array(cols).keys()].filter((c) => !pivotes.includes(c));
  return libres.map((libre) => {
    const v = new Array(cols).fill(0);
    v[libre] = 1;
    pivotes.forEach((c, i) => (v[c] = -R[i][libre]));
    return v;
  });
}

/**
 * Valores propios de una matriz 2×2 o 3×3, por el polinomio característico.
 * Devuelve siempre tantos como el orden, contando multiplicidades.
 *
 * PRECISIÓN: sobre una raíz simple el error queda por debajo de 1e-9; sobre
 * una TRIPLE baja a unas 2e-5, porque ahí el polinomio se aplasta contra el
 * eje y la bisección deja de ganar bits. Sigue siendo cincuenta veces más
 * fino que la tolerancia más estrecha que declara el corpus.
 */
export function valoresPropios(M: number[][]): number[] {
  const n = M.length;
  if (n === 2) {
    const tr = M[0][0] + M[1][1];
    const d = det(M);
    const disc = tr * tr - 4 * d;
    if (disc < 0) throw new Error('valores propios complejos');
    const r = Math.sqrt(disc);
    return [(tr - r) / 2, (tr + r) / 2];
  }
  if (n !== 3) throw new Error('solo 2×2 y 3×3');
  /* λ³ − tr·λ² + m·λ − det = 0, con m la suma de los menores principales. */
  const tr = M[0][0] + M[1][1] + M[2][2];
  const menor = (i: number, j: number) =>
    M.filter((_, a) => a !== i && a !== j).map((f) => f.filter((_, b) => b !== i && b !== j));
  const m = det(menor(0, 0)) + det(menor(1, 1)) + det(menor(2, 2));
  const d = det(M);
  const p = (x: number) => x ** 3 - tr * x ** 2 + m * x - d;

  /* UNA raíz por bisección —una cúbica real siempre tiene al menos una—, y
     las otras dos deflacionando y resolviendo la cuadrática.
     El primer intento buscaba las tres por cambio de signo, y **se dejaba las
     dobles**: una raíz doble toca el eje y no lo cruza. Lo destapó la
     extraordinaria de Álgebra de 2021-2022, cuyo ejercicio 4 va justo de
     eso. */
  let lo = -1;
  let hi = 1;
  while (p(lo) * p(hi) > 0) {
    lo *= 2;
    hi *= 2;
    if (hi > 1e6) throw new Error('no encuentro ninguna raíz real');
  }
  for (let k = 0; k < 200; k++) {
    const mid = (lo + hi) / 2;
    if (p(lo) * p(mid) <= 0) hi = mid;
    else lo = mid;
  }
  const r1 = (lo + hi) / 2;

  /* División sintética por (λ − r1): queda λ² + b·λ + c. */
  const b = -tr + r1;
  const c = m + r1 * b;
  const disc = b * b - 4 * c;
  if (disc < -1e-9) throw new Error('dos de los valores propios son complejos');
  const raiz = Math.sqrt(Math.max(disc, 0));
  return [r1, (-b - raiz) / 2, (-b + raiz) / 2];
}

/** Producto vectorial en R³. */
export const productoVectorial = (a: number[], b: number[]) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

/** Producto escalar usual y norma que sale de él. */
export const escalar = (a: number[], b: number[]) => a.reduce((s, x, i) => s + x * b[i], 0);
export const norma = (a: number[]) => Math.sqrt(escalar(a, a));
export const unitario = (a: number[]) => a.map((x) => x / norma(a));

/** Gram-Schmidt con el producto escalar usual, devolviendo la base ortonormal. */
export function gramSchmidt(vectores: number[][]): number[][] {
  const base: number[][] = [];
  for (const v of vectores) {
    const orto = base.reduce((w, u) => w.map((x, i) => x - escalar(v, u) * u[i]), [...v]);
    if (norma(orto) < CERO) continue; // dependiente de los anteriores
    base.push(unitario(orto));
  }
  return base;
}
