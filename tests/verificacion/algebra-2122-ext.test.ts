/**
 * Convocatoria extraordinaria de Álgebra, curso 2021-2022.
 *
 * Once comprobaciones. Dos de ellas son conjuntos —los valores de un parámetro
 * donde algo se rompe—, que es la forma de respuesta más típica de esta
 * asignatura y la que más se equivoca por dejarse una raíz.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { inversa, nucleo, rango, rref, valoresPropios } from './lineal';

const cuadra = convocatoria('algebra', '2021-2022-ext');

describe('1 · un subespacio por generadores y otro por ecuaciones', () => {
  const id = 'exalg2122-ext-1-un-subespacio-por-generadores-y-otro-por-ecuaciones';
  const generadores = [
    [1, 0, 0, 0],
    [2, 1, 1, 0],
    [0, 0, 1, 0],
  ];

  it('S tiene dimensión 3', () => cuadra(id, 'La dimensión del primero', rango(generadores)));

  it('la intersección con T es una recta', () => {
    /* S resulta ser {t = 0} —los tres generadores tienen la cuarta
       coordenada nula y son independientes—, así que la intersección se
       obtiene juntando esa ecuación con las dos de T. */
    const ecuaciones = [
      [0, 0, 0, 1], // t = 0, la de S
      [1, -2, -1, 0], // x − 2y − z = 0
      [0, 0, 1, 1], // z + t = 0
    ];
    cuadra(id, 'La dimensión de la intersección', 4 - rango(ecuaciones));
  });

  it('las coordenadas de (2,1,0,0) en la base ampliada son (0, 1, −1, 0)', () => {
    const base = [...generadores, [0, 0, 0, 1]];
    const A = [0, 1, 2, 3].map((f) => base.map((v) => v[f]));
    const { R, pivotes } = rref(A.map((f, i) => [...f, [2, 1, 0, 0][i]]));
    const x = new Array(4).fill(0);
    pivotes.forEach((c, i) => (x[c] = R[i][4]));
    cuadra.vector(id, 'Las coordenadas en la base ampliada', x);
  });
});

describe('2 · tres imágenes en una base torcida', () => {
  const id = 'exalg2122-ext-2-tres-imagenes-en-una-base-torcida';
  /* Los tres datos, cada uno con su antiimagen. */
  const f110 = [2, 0, 1];
  const f02m1 = [0, 2, -3];
  const f120 = [3, -1, 3];

  const fe2 = f120.map((v, i) => v - f110[i]); // f(1,2,0) − f(1,1,0)

  it('f(0,1,0) vale (1, −1, 2)', () =>
    cuadra.vector(id, 'La imagen del segundo vector canónico', fe2));

  const fe1 = f110.map((v, i) => v - fe2[i]);
  const fe3 = fe2.map((v, i) => 2 * v - f02m1[i]); // de f(0,2,−1) = 2f(e2) − f(e3)

  it('la matriz en la base canónica pone las tres imágenes en columnas', () => {
    const columnas = [fe1, fe2, fe3];
    cuadra.matriz(id, 'La matriz en la base canónica', [0, 1, 2].map((f) => columnas.map((c) => c[f])));
  });

  it('el núcleo es la recta de (−1, 3, −1)', () => {
    const M = [0, 1, 2].map((f) => [fe1, fe2, fe3].map((c) => c[f]));
    const base = nucleo(M);
    if (base.length !== 1) throw new Error('el núcleo debería ser una recta');
    /* El enunciado la pide con segunda coordenada 3. */
    const v = base[0];
    cuadra.vector(id, 'El generador del núcleo', v.map((x) => (x * 3) / v[1]));
  });
});

describe('3 · una ecuación que da la inversa sin calcularla', () => {
  const id = 'exalg2122-ext-3-una-ecuacion-que-da-la-inversa-sin-calcularla';

  it('la inversa falta en a = 2 y a = 3', () => {
    /* El determinante es a² − 5a + 6, y sus raíces son donde el rango cae.
       Se resuelve la cuadrática en vez de copiar las raíces. */
    const [p, q] = [-5, 6];
    const disc = Math.sqrt(p * p - 4 * q);
    cuadra.conjunto(id, 'Los valores donde no hay inversa', [(-p - disc) / 2, (-p + disc) / 2]);
  });

  it('con a = 0 la primera fila de la inversa es (−5/3, 1/3, 2/3)', () => {
    const A = [
      [-3, 1, -1],
      [0, 5, -1],
      [-6, 0, -2],
    ];
    cuadra.vector(id, 'La primera fila de la inversa', inversa(A)[0]);
  });
});

describe('4 · el parámetro que decide si diagonaliza', () => {
  const id = 'exalg2122-ext-4-el-parametro-que-decide-si-diagonaliza';
  const A = (a: number) => [
    [1, -2, -2],
    [-2, a, 8],
    [2, 8, a],
  ];

  it('el autovalor 1 no depende del parámetro', () => {
    /* Se comprueba de verdad: con dos valores distintos de a, el 1 sigue
       estando entre los autovalores. */
    for (const a of [0, 5]) {
      const l = valoresPropios(A(a));
      if (!l.some((x) => Math.abs(x - 1) < 1e-6)) throw new Error(`con a=${a} el 1 no sale`);
    }
    cuadra(id, 'El autovalor que no depende del parámetro', 1);
  });

  it('los autovalores se repiten en a = −7 y a = 9', () => {
    /* Los tres son 1, a+8 y a−8, así que las coincidencias posibles son
       1 = a+8 y 1 = a−8; la tercera, a+8 = a−8, no ocurre nunca. */
    const candidatos = [1 - 8, 1 + 8];
    for (const a of candidatos) {
      const l = valoresPropios(A(a)).sort((x, y) => x - y);
      const repetido = l.some((x, i) => i > 0 && Math.abs(x - l[i - 1]) < 1e-6);
      if (!repetido) throw new Error(`con a=${a} no hay autovalor doble`);
    }
    cuadra.conjunto(id, 'Los valores de a con autovalor repetido', candidatos);
  });

  it('con a = −7 el autoespacio del 1 es una recta, así que no diagonaliza', () => {
    const M = A(-7).map((f, i) => f.map((x, j) => x - (i === j ? 1 : 0)));
    cuadra(id, 'La multiplicidad geométrica en el caso conflictivo', nucleo(M).length);
  });
});
