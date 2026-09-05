/**
 * Las dos convocatorias de Álgebra del curso 2024-2025, y con ellas la
 * asignatura entera verificada.
 *
 * La ordinaria trae la única matriz del corpus expresada en dos bases a la vez
 * —ni la de salida ni la de llegada son la canónica—, que es donde más se
 * falla por invertir la matriz que no toca.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { det, inversa, nucleo, rango, resuelve, valoresPropios } from './lineal';

const cuadraOrd = convocatoria('algebra', '2024-2025-ord');
const cuadraExt = convocatoria('algebra', '2024-2025-ext');

describe('ordinaria · 1 · la suma de subespacios y una base de R⁴', () => {
  const id = 'exalg2425-ord-1-la-suma-de-subespacios-y-una-base-de-r4';
  const S = (a: number) => [
    [1, 0, -2, 0],
    [-1, 1, a, 1],
    [1, a, 1, a],
  ];

  it('la dimensión baja a 2 en a = −1 y a = 3', () => {
    const bajan: number[] = [];
    for (let a = -8; a <= 8; a++) if (rango(S(a)) === 2) bajan.push(a);
    cuadraOrd.conjunto(id, 'Los valores de a que bajan la dimensión', bajan);
  });

  it('las coordenadas (1, 0, −1, 0) son (0, 0, −3, 0) en la canónica', () => {
    /* Pasar de la base nueva a la canónica es multiplicar. El cuarto vector
       de la base completada no importa aquí: su coordenada es cero, y eso es
       lo que hace que la respuesta no dependa de cómo se complete. */
    const [v1, v2, v3] = S(0);
    const x = v1.map((_, i) => 1 * v1[i] + 0 * v2[i] + -1 * v3[i]);
    cuadraOrd.vector(id, 'Las coordenadas en la base canónica', x);
  });
});

describe('ordinaria · 2 · inyectiva si y solo si el núcleo es cero', () => {
  const id = 'exalg2425-ord-2-inyectiva-si-y-solo-si-el-nucleo-es-cero';
  /* f(x,y,z) = (x−z, 2x+4y, −2y+2z), leída por columnas. */
  const A = [
    [1, 0, -1],
    [2, 4, 0],
    [0, -2, 2],
  ];

  it('el núcleo es cero, así que f es inyectiva', () =>
    cuadraOrd(id, 'La dimensión del núcleo', nucleo(A).length));

  it('la matriz en las bases nuevas se calcula con las dos, no con una', () => {
    /* Cada vector de B_V se pasa por f, y el resultado se escribe en B_V'.
       Escribirlo en la canónica y dejarlo ahí es el error del apartado. */
    const BV = [
      [1, 1, 0],
      [0, 1, 1],
      [-1, 0, -1],
    ];
    const BV2 = [
      [0, -2, 2],
      [-1, 1, 0],
      [2, 0, 0],
    ];
    const P2 = [0, 1, 2].map((f) => BV2.map((v) => v[f])); // por columnas
    const columnas = BV.map((v) => {
      const imagen = A.map((f) => f.reduce((s, x, j) => s + x * v[j], 0));
      return resuelve(P2, imagen);
    });
    cuadraOrd.matriz(id, 'La matriz asociada en las bases nuevas', [0, 1, 2].map((f) => columnas.map((c) => c[f])));
  });
});

describe('ordinaria · 3 · idempotentes y una base ortonormal', () => {
  const id = 'exalg2425-ord-3-idempotentes-y-una-base-ortonormal';

  it('dos de las tres afirmaciones sobre idempotentes son ciertas', () => {
    /* Se comprueban con una idempotente concreta y con un contraejemplo, en
       vez de contarlas de memoria. */
    const A = [
      [1, 0],
      [0, 0],
    ]; // idempotente y singular
    const cuadrado = (M: number[][]) =>
      M.map((f, i) => f.map((_, j) => M[i].reduce((s, x, k) => s + x * M[k][j], 0)));
    const igual = (X: number[][], Y: number[][]) =>
      X.every((f, i) => f.every((x, j) => Math.abs(x - Y[i][j]) < 1e-9));
    const cubo = cuadrado(A).map((f, i) => f.map((_, j) => cuadrado(A)[i].reduce((s, x, k) => s + x * A[k][j], 0)));
    const traspuesta = A[0].map((_, j) => A.map((f) => f[j]));
    const afirmaciones = [
      igual(cuadrado(cubo), cubo), // A³ idempotente
      igual(cuadrado(traspuesta), traspuesta), // Aᵀ idempotente
      Math.abs(det(A)) > 1e-9, // existe la inversa — falsa, y A lo demuestra
    ];
    cuadraOrd(id, 'Cuántas de las tres afirmaciones son ciertas', afirmaciones.filter(Boolean).length);
  });

  it('el tercer vector de la base ortonormal es (−√6/6, 0, √6/2)', () => {
    const G = [
      [3, 0, 1],
      [0, 2, 0],
      [1, 0, 1],
    ];
    const dot = (x: number[], y: number[]) =>
      x.reduce((s, xi, i) => s + xi * y.reduce((t, yj, j) => t + G[i][j] * yj, 0), 0);
    const nor = (x: number[]) => Math.sqrt(dot(x, x));
    const base: number[][] = [];
    for (const e of [[1, 0, 0], [0, 1, 0], [0, 0, 1]]) {
      const orto = base.reduce((w, u) => w.map((x, i) => x - dot(e, u) * u[i]), [...e]);
      base.push(orto.map((x) => x / nor(orto)));
    }
    cuadraOrd.vector(id, 'El tercer vector de la base ortonormal', base[2]);
  });
});

describe('ordinaria · 4 · el polinomio característico y una que no se puede', () => {
  const id = 'exalg2425-ord-4-el-polinomio-caracteristico-y-una-que-no-se-puede';
  const A = [
    [1, 0, -1],
    [0, 1, -1],
    [1, -1, 0],
  ];

  it('el autovalor doble es 1', () => {
    const l = valoresPropios(A).sort((a, b) => a - b);
    const doble = l.find((x, i) => i > 0 && Math.abs(x - l[i - 1]) < 1e-6);
    if (doble === undefined) throw new Error('no hay ningún autovalor doble');
    cuadraOrd(id, 'El autovalor doble', doble);
  });

  it('y su autoespacio es una recta, así que no diagonaliza', () => {
    const M = A.map((f, i) => f.map((x, j) => x - (i === j ? 1 : 0)));
    cuadraOrd(id, 'La multiplicidad geométrica del autovalor doble', nucleo(M).length);
  });
});

describe('extraordinaria · 1 · un subespacio de matrices', () => {
  const id = 'exalg2425-ext-1-las-coordenadas-son-unicas-y-un-subespacio-de-matrices';
  /* M·A = 0 con A = [[1,2],[2,4]]. Aplanando M por filas, las condiciones son
     dos ecuaciones sobre R⁴: cada fila de M por cada columna de A. */
  const condiciones = [
    [1, 2, 0, 0], // m11 + 2m12 = 0
    [2, 4, 0, 0], // 2m11 + 4m12 = 0, que es la misma
    [0, 0, 1, 2], // m21 + 2m22 = 0
    [0, 0, 2, 4],
  ];

  it('S tiene dimensión 2', () => cuadraExt(id, 'La dimensión del subespacio S', 4 - rango(condiciones)));

  it('y con primera fila (−6, 3) la segunda es (10, −5)', () => {
    /* m21 + 2m22 = 0 con m21 = 10. */
    cuadraExt(id, 'Una matriz concreta del subespacio', -10 / 2);
  });
});

describe('extraordinaria · 2 · una aplicación dada por tres datos', () => {
  const id = 'exalg2425-ext-2-una-aplicacion-dada-por-tres-datos';
  /* f(0,1,1) = (0,2,2); f(1,0,−1) = (2,0,−4); (−1,1,0) en el núcleo, o sea
     f(e1) = f(e2). Con eso: b + c = (0,2,2) y a − c = (2,0,−4) con a = b. */
  const bmasc = [0, 2, 2];
  const amenosc = [2, 0, -4];
  const a = amenosc.map((v, i) => (v + bmasc[i]) / 2);
  const b = a;
  const c = bmasc.map((v, i) => v - b[i]);
  const M = [0, 1, 2].map((f) => [a, b, c].map((col) => col[f]));

  it('la imagen tiene dimensión 2, porque dos columnas coinciden', () =>
    cuadraExt(id, 'La dimensión de la imagen', rango(M)));

  it('y la matriz canónica es (1,1,−1; 1,1,1; −1,−1,3)', () =>
    cuadraExt.matriz(id, 'La matriz en la base canónica', M));
});

describe('extraordinaria · 3 · Minkowsky y la matriz con parámetro', () => {
  const id = 'exalg2425-ext-3-minkowsky-y-la-matriz-con-parametro';
  const A = (x: number) => [
    [-x, 1, 0, 1],
    [1, -x, 1, 0],
    [0, 1, -x, 1],
    [0, x, 0, -x],
  ];

  it('son tres valores distintos, aunque el polinomio tenga cuatro raíces', () => {
    /* El determinante es x²(x−2)(x+2): cuatro raíces contando multiplicidad
       y **tres** valores distintos. Se comprueba que en los tres se anula, y
       que en los enteros de alrededor no. */
    const malos = [0, 2, -2];
    for (const x of malos)
      if (Math.abs(det(A(x))) > 1e-9) throw new Error(`en x=${x} sí es invertible`);
    for (let x = -6; x <= 6; x++)
      if (!malos.includes(x) && Math.abs(det(A(x))) < 1e-9)
        throw new Error(`en x=${x} también se anula y no estaba en la lista`);
    cuadraExt(id, 'Cuántos valores de x estropean la matriz', new Set(malos).size);
  });

  it('y en x = 1 la entrada (1,1) de la inversa es −1/3', () =>
    cuadraExt(id, 'Una entrada de la inversa', inversa(A(1))[0][0]));
});

describe('extraordinaria · 4 · diagonalizar con una base ortonormal', () => {
  const id = 'exalg2425-ext-4-diagonalizar-con-una-base-ortonormal';
  const A = [
    [2, 1, 1],
    [1, 2, 1],
    [1, 1, 2],
  ];

  it('el autovalor simple es 4', () => {
    const l = valoresPropios(A).sort((a, b) => a - b);
    const simples = l.filter((x, i) => l.every((y, j) => i === j || Math.abs(x - y) > 1e-6));
    if (simples.length !== 1) throw new Error('debería haber exactamente un autovalor simple');
    cuadraExt(id, 'El autovalor simple', simples[0]);
  });

  it('y su autovector unitario es (√3/3, √3/3, √3/3)', () => {
    const M = A.map((f, i) => f.map((x, j) => x - (i === j ? 4 : 0)));
    const [v] = nucleo(M);
    const n = Math.sqrt(v.reduce((s, x) => s + x * x, 0));
    const signo = v[0] < 0 ? -1 : 1;
    cuadraExt.vector(id, 'El autovector del autovalor simple', v.map((x) => (signo * x) / n));
  });
});
