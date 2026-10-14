/**
 * Álgebra de tensores simétricos de 3×3, compartida por el tensor de
 * tensiones (tema 2) y el de deformaciones (tema 3) del motor de ERM.
 *
 * Para quién: para `tensiones.ts` y `deformaciones.ts`, que hacen las mismas
 * operaciones —el tema 3 lo dice en su tabla de la p. 17, «similitud entre
 * tensiones y deformaciones»— y no deben hacerlas con dos códigos distintos
 * (CLAUDE.md §01). Cuándo: en cada tensor de un problema. Qué gana: valores y
 * direcciones principales fiables también con valores repetidos, que es donde
 * la ecuación característica resuelta a mano se vuelve inestable. Cómo se
 * comprueba: `tests/fisica/erm/tensiones.test.ts` (invariantes, ortogonalidad
 * y σ·n = λ·n para cada dirección).
 *
 * Convenio (apuntes del tema 2): {S} = [σ]{n} (ec. 2.14, p. 11); el giro de
 * ejes es [σ'] = [R][σ][R]ᵗ con las filas de [R] los vectores del sistema
 * girado (ecs. 2.22 y 2.27, pp. 13-14); los invariantes, los de la ec. 2.36
 * (p. 17); y los valores principales se ordenan 1 ≥ 2 ≥ 3 (p. 17).
 */

export type Vec3 = readonly [number, number, number];
export type Mat3 = readonly [Vec3, Vec3, Vec3];

export function mulMV(A: Mat3, v: Vec3): Vec3 {
  return [
    A[0][0] * v[0] + A[0][1] * v[1] + A[0][2] * v[2],
    A[1][0] * v[0] + A[1][1] * v[1] + A[1][2] * v[2],
    A[2][0] * v[0] + A[2][1] * v[1] + A[2][2] * v[2],
  ];
}

export function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

export function norma(a: Vec3): number {
  return Math.sqrt(dot(a, a));
}

export function unitario(a: Vec3): Vec3 {
  const n = norma(a);
  if (n === 0) throw new Error('El vector nulo no tiene dirección.');
  return [a[0] / n, a[1] / n, a[2] / n];
}

export function transpuesta(A: Mat3): Mat3 {
  return [
    [A[0][0], A[1][0], A[2][0]],
    [A[0][1], A[1][1], A[2][1]],
    [A[0][2], A[1][2], A[2][2]],
  ];
}

export function mulMM(A: Mat3, B: Mat3): Mat3 {
  const f = (i: number, j: number) => A[i][0] * B[0][j] + A[i][1] * B[1][j] + A[i][2] * B[2][j];
  return [
    [f(0, 0), f(0, 1), f(0, 2)],
    [f(1, 0), f(1, 1), f(1, 2)],
    [f(2, 0), f(2, 1), f(2, 2)],
  ];
}

/** Ec. 2.27: el tensor en el sistema girado, [R][T][R]ᵗ. */
export function giraTensor(T: Mat3, R: Mat3): Mat3 {
  return mulMM(mulMM(R, T), transpuesta(R));
}

/** Ec. 2.36: I1, I2 e I3. */
export function invariantes(T: Mat3): { I1: number; I2: number; I3: number } {
  const I1 = T[0][0] + T[1][1] + T[2][2];
  const I2 =
    T[0][0] * T[1][1] -
    T[0][1] * T[1][0] +
    T[0][0] * T[2][2] -
    T[0][2] * T[2][0] +
    T[1][1] * T[2][2] -
    T[1][2] * T[2][1];
  const I3 =
    T[0][0] * (T[1][1] * T[2][2] - T[1][2] * T[2][1]) -
    T[0][1] * (T[1][0] * T[2][2] - T[1][2] * T[2][0]) +
    T[0][2] * (T[1][0] * T[2][1] - T[1][1] * T[2][0]);
  return { I1, I2, I3 };
}

export function esSimetrico(T: Mat3, tol = 1e-12): boolean {
  const s = Math.max(1, ...T.flat().map(Math.abs));
  return (
    Math.abs(T[0][1] - T[1][0]) <= tol * s && Math.abs(T[0][2] - T[2][0]) <= tol * s && Math.abs(T[1][2] - T[2][1]) <= tol * s
  );
}

export interface Principales {
  /** Valores principales, de mayor a menor. */
  valores: Vec3;
  /** Direcciones principales unitarias, en el mismo orden; forman un triedro directo. */
  direcciones: Mat3;
}

/**
 * Valores y direcciones principales por rotaciones de Jacobi: se anula el
 * término fuera de la diagonal más grande hasta que todos son despreciables.
 * Converge siempre en un tensor simétrico y no pasa por la ecuación
 * característica, así que da direcciones bien definidas aunque dos valores
 * coincidan.
 */
export function principales(T: Mat3): Principales {
  if (!esSimetrico(T)) throw new Error('El tensor no es simétrico.');
  const a = T.map((f) => [...f]);
  const v = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ];
  const escala = Math.max(1e-300, ...T.flat().map(Math.abs));
  for (let it = 0; it < 100; it++) {
    let p = 0;
    let q = 1;
    for (const [i, j] of [
      [0, 1],
      [0, 2],
      [1, 2],
    ]) {
      if (Math.abs(a[i][j]) > Math.abs(a[p][q])) {
        p = i;
        q = j;
      }
    }
    if (Math.abs(a[p][q]) <= 1e-15 * escala) break;
    const theta = (a[q][q] - a[p][p]) / (2 * a[p][q]);
    const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
    const c = 1 / Math.sqrt(t * t + 1);
    const s = t * c;
    for (let k = 0; k < 3; k++) {
      const akp = a[k][p];
      const akq = a[k][q];
      a[k][p] = c * akp - s * akq;
      a[k][q] = s * akp + c * akq;
    }
    for (let k = 0; k < 3; k++) {
      const apk = a[p][k];
      const aqk = a[q][k];
      a[p][k] = c * apk - s * aqk;
      a[q][k] = s * apk + c * aqk;
    }
    for (let k = 0; k < 3; k++) {
      const vkp = v[k][p];
      const vkq = v[k][q];
      v[k][p] = c * vkp - s * vkq;
      v[k][q] = s * vkp + c * vkq;
    }
  }
  const orden = [0, 1, 2].sort((i, j) => a[j][j] - a[i][i]);
  const dir = orden.map((k) => [v[0][k], v[1][k], v[2][k]] as const);
  /* Triedro directo: la tercera es el producto vectorial de las dos primeras. */
  const n1 = dir[0];
  const n2 = dir[1];
  const n3: Vec3 = [n1[1] * n2[2] - n1[2] * n2[1], n1[2] * n2[0] - n1[0] * n2[2], n1[0] * n2[1] - n1[1] * n2[0]];
  return {
    valores: [a[orden[0]][orden[0]], a[orden[1]][orden[1]], a[orden[2]][orden[2]]],
    direcciones: [n1, n2, n3],
  };
}
