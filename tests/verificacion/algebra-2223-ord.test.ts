/**
 * Convocatoria ordinaria de Álgebra, curso 2022-2023.
 *
 * Doce comprobaciones. Aquí entra por primera vez un cambio de base en los dos
 * sentidos —de B a B' y de vuelta—, que es donde se invierte la matriz que no
 * toca.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import {
  det, gramSchmidt, nucleo, porVector, productoVectorial, rango, resuelve, valoresPropios,
} from './lineal';

const cuadra = convocatoria('algebra', '2022-2023-ord');

describe('1 · la suma, la intersección y una base nueva', () => {
  const id = 'exalg2223-ord-1-la-suma-la-interseccion-y-una-base-nueva';

  it('S₁ ∩ S₂ tiene dimensión 1', () => {
    /* Con {v1,v2,v3} libre se puede trabajar en coordenadas: S₁ lo generan
       (1,0,0) y (0,1,1); S₂, (0,1,0) y (0,0,1). La fórmula de Grassmann hace
       el resto. */
    const S1 = [[1, 0, 0], [0, 1, 1]];
    const S2 = [[0, 1, 0], [0, 0, 1]];
    cuadra(id, 'La dimensión de la intersección', rango(S1) + rango(S2) - rango([...S1, ...S2]));
  });

  /* Los cuatro vectores nuevos, en coordenadas de la base B. */
  const B2 = [
    [1, 1, 1, 0], // v1 = u1+u2+u3
    [0, -1, 0, 0], // v2 = −u2
    [1, 0, 0, -1], // v3 = u1−u4
    [1, 0, 1, 1], // v4 = u1+u3+u4
  ];
  /* La matriz de cambio: por columnas, los nuevos expresados en los viejos. */
  const P = [0, 1, 2, 3].map((f) => B2.map((v) => v[f]));

  it('las coordenadas de x en la base nueva son (−3, −5, 2, 2)', () => {
    /* x = u1 + 2u2 − u3. Pasar de B a B' es resolver P·y = x. */
    cuadra.vector(id, 'Las coordenadas de x en la base nueva', resuelve(P, [1, 2, -1, 0]));
  });

  it('y el camino de vuelta da (2, 4, 2, 1)', () => {
    /* De B' a B es multiplicar, sin resolver nada. */
    cuadra.vector(id, 'Y el camino de vuelta', porVector(P, [1, -3, 0, 1]));
  });
});

describe('2 · el núcleo dado y la matriz que sale de él', () => {
  const id = 'exalg2223-ord-2-el-nucleo-dado-y-la-matriz-que-sale-de-el';
  /* Ker f = {x = y, z = 0}, o sea la recta de (1,1,0): ahí f vale cero. */
  const f010 = [0, 1, 1];
  const f101 = [1, 0, 1];

  const f100 = f010.map((v) => -v); // f(1,1,0) = 0 = f(1,0,0) + f(0,1,0)

  it('f(1,0,0) vale (0, −1, −1)', () =>
    cuadra.vector(id, 'La imagen del primer vector de la base canónica', f100));

  const f001 = f101.map((v, i) => v - f100[i]);

  it('la matriz asociada sale de las tres imágenes', () => {
    const columnas = [f100, f010, f001];
    cuadra.matriz(id, 'La matriz asociada, entera', [0, 1, 2].map((f) => columnas.map((c) => c[f])));
  });

  it('la imagen tiene dimensión 2', () => {
    const M = [0, 1, 2].map((f) => [f100, f010, f001].map((c) => c[f]));
    cuadra(id, 'La dimensión de la imagen', rango(M));
  });
});

describe('3 · determinantes de memoria y una base ortonormal', () => {
  const id = 'exalg2223-ord-3-determinantes-de-memoria-y-una-base-ortonormal';

  it('|2B| vale 96 y no 24', () => {
    /* El factor sale elevado al ORDEN de la matriz, no multiplicando una vez:
       es el error que este apartado busca. Se comprueba sobre una matriz
       concreta de determinante 12. */
    const B = [[12, 0, 0], [0, 1, 0], [0, 0, 1]];
    if (Math.abs(det(B) - 12) > 1e-9) throw new Error('la matriz de prueba no tiene |B| = 12');
    cuadra(id, 'El determinante de 2B', det(B.map((f) => f.map((x) => 2 * x))));
  });

  const base = gramSchmidt([[1, 2, 2], [-1, 0, 2]]);

  it('el segundo vector de la base de U es (−2/3, −1/3, 2/3)', () =>
    cuadra.vector(id, 'El segundo vector de la base ortonormal de U', base[1]));

  it('y el que completa R³ es (2/3, −2/3, 1/3)', () =>
    cuadra.vector(id, 'El vector que completa la base de R³', productoVectorial(base[0], base[1])));
});

describe('4 · el mismo polinomio y solo una diagonaliza', () => {
  const id = 'exalg2223-ord-4-el-mismo-polinomio-y-solo-una-diagonaliza';
  const A = [
    [2, 3, -3],
    [1, 0, -1],
    [1, 1, -2],
  ];
  const B = [
    [0, 1, 0],
    [3, 0, 1],
    [2, 0, 0],
  ];

  it('las dos comparten determinante, y vale 2', () => {
    /* El apartado dice que comparten polinomio característico; el
       determinante es su término independiente, así que tiene que coincidir.
       Se comprueba con las dos, no con una. */
    if (Math.abs(det(A) - det(B)) > 1e-9) throw new Error('los determinantes no coinciden');
    cuadra(id, 'El determinante que comparten', det(A));
  });

  it('para λ = −1 el autoespacio de A tiene dimensión 2', () => {
    const M = A.map((f, i) => f.map((x, j) => x + (i === j ? 1 : 0)));
    cuadra(id, 'La multiplicidad geométrica que decide', nucleo(M).length);
  });

  it('y el autovector de λ = 2 es (3, 1, 1)', () => {
    /* Se comprueba antes que 2 es de verdad autovalor, para que el núcleo no
       salga vacío por un error de planteamiento. */
    if (!valoresPropios(A).some((l) => Math.abs(l - 2) < 1e-6))
      throw new Error('2 no es autovalor de A');
    const M = A.map((f, i) => f.map((x, j) => x - (i === j ? 2 : 0)));
    const [v] = nucleo(M);
    cuadra.vector(id, 'El vector propio del autovalor simple', v.map((x) => (x * 3) / v[0]));
  });
});
