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

/** Valores propios de una matriz 2×2 o 3×3, por la característica. */
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
  /* Raíces por barrido y bisección: los exámenes las tienen enteras o casi,
     y una cúbica de este tamaño no merece Cardano. */
  const p = (x: number) => x ** 3 - tr * x ** 2 + m * x - d;
  const raices: number[] = [];
  for (let x = -50; x < 50; x += 0.001) {
    const a = p(x);
    const b = p(x + 0.001);
    if (a === 0) raices.push(x);
    else if (a * b < 0) {
      let lo = x;
      let hi = x + 0.001;
      for (let k = 0; k < 60; k++) {
        const mid = (lo + hi) / 2;
        if (p(lo) * p(mid) <= 0) hi = mid;
        else lo = mid;
      }
      raices.push((lo + hi) / 2);
    }
  }
  return raices;
}
