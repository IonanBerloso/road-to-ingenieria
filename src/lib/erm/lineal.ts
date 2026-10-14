/**
 * Sistemas lineales pequeños y densos, para el motor de Elasticidad y
 * Resistencia de Materiales (ERM).
 *
 * Para quién: para los dos resolvedores del motor que plantean ecuaciones, el
 * de esfuerzos de sección (`esfuerzos.ts`, tema 7) y el de barras con sólidos
 * rígidos (`barras.ts`, tema 8). Cuándo: cada vez que resuelven un problema.
 * Qué gana: que los dos digan lo mismo cuando una estructura no tiene
 * solución única —hiperestática o mecanismo— en vez de devolver un número
 * cualquiera. Cómo se comprueba: `tests/fisica/erm/lineal.test.ts`, con un
 * sistema de solución conocida, uno indeterminado y uno incompatible.
 *
 * Es eliminación de Gauss-Jordan con pivote parcial, que admite más
 * ecuaciones que incógnitas (las ecuaciones de equilibrio de un nudo con
 * rótula son dependientes, y no se quitan a mano: se deja que el rango lo
 * diga). Las variables libres, si las hay, se ponen a cero.
 */

export interface SolucionLineal {
  /** La solución; las incógnitas libres valen 0. */
  x: number[];
  /** Número de ecuaciones independientes encontradas. */
  rango: number;
  /** Índices de las incógnitas que quedaron sin pivote (libres). */
  libres: number[];
  /** max |A·x − b|: si no es ~0, el sistema es incompatible. */
  residuo: number;
}

/** Escala de la tolerancia: el mayor valor absoluto de la matriz. */
function escala(A: readonly (readonly number[])[]): number {
  let m = 0;
  for (const fila of A) for (const v of fila) m = Math.max(m, Math.abs(v));
  return m === 0 ? 1 : m;
}

/**
 * Resuelve A·x = b. `A` puede tener más filas que columnas. No modifica sus
 * argumentos: trabaja sobre una copia.
 */
export function resuelveLineal(
  A: readonly (readonly number[])[],
  b: readonly number[],
  tolRel = 1e-11,
): SolucionLineal {
  const filas = A.length;
  const cols = filas === 0 ? 0 : A[0].length;
  const tol = tolRel * escala(A);
  const M = A.map((fila, i) => [...fila, b[i]]);
  const pivotes: number[] = [];
  let r = 0;
  for (let c = 0; c < cols && r < filas; c++) {
    let p = r;
    for (let i = r + 1; i < filas; i++) if (Math.abs(M[i][c]) > Math.abs(M[p][c])) p = i;
    if (Math.abs(M[p][c]) <= tol) continue;
    [M[r], M[p]] = [M[p], M[r]];
    const piv = M[r][c];
    for (let k = c; k <= cols; k++) M[r][k] /= piv;
    for (let i = 0; i < filas; i++) {
      if (i === r || M[i][c] === 0) continue;
      const f = M[i][c];
      for (let k = c; k <= cols; k++) M[i][k] -= f * M[r][k];
    }
    pivotes.push(c);
    r++;
  }
  const x = new Array<number>(cols).fill(0);
  pivotes.forEach((c, i) => {
    x[c] = M[i][cols];
  });
  const libres: number[] = [];
  for (let c = 0; c < cols; c++) if (!pivotes.includes(c)) libres.push(c);
  let residuo = 0;
  for (let i = 0; i < filas; i++) {
    let s = 0;
    for (let c = 0; c < cols; c++) s += A[i][c] * x[c];
    residuo = Math.max(residuo, Math.abs(s - b[i]));
  }
  return { x, rango: pivotes.length, libres, residuo };
}
