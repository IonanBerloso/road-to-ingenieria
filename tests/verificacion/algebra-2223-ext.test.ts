/**
 * Convocatoria extraordinaria de Álgebra, curso 2022-2023.
 *
 * Diez comprobaciones, y la única de todo Álgebra donde hay que invertir una
 * matriz 4×4 a mano en el examen.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { det, inversa, nucleo, rango, valoresPropios } from './lineal';

const cuadra = convocatoria('algebra', '2022-2023-ext');

describe('1 · un subespacio y otro que no lo es', () => {
  it('S₁ tiene dimensión 3', () => {
    /* Las matrices [[0, a+b, a],[c, 0, b]] aplanadas por filas: cada
       parámetro aporta un generador, y hay que comprobar que los tres son
       independientes en vez de contar parámetros. */
    const generadores = [
      [0, 1, 1, 0, 0, 0], // a
      [0, 1, 0, 0, 0, 1], // b
      [0, 0, 0, 1, 0, 0], // c
    ];
    cuadra('exalg2223-ext-1-un-subespacio-y-otro-que-no-lo-es', 'La dimensión del que sí es subespacio', rango(generadores));
  });
});

describe('2 · cuatro imágenes y una matriz que no es cuadrada', () => {
  const id = 'exalg2223-ext-2-cuatro-imagenes-y-una-matriz-que-no-es-cuadrada';
  /* Las cuatro imágenes en coordenadas de B'. */
  const columnas = [
    [1, 1, -4],
    [2, 1, -2],
    [3, 1, 0],
    [1, 0, 2],
  ];
  const M = [0, 1, 2].map((f) => columnas.map((c) => c[f]));

  it('la matriz es 3×4 y sale de poner las imágenes en columnas', () =>
    cuadra.matriz(id, 'La matriz asociada', M));

  it('el núcleo tiene dimensión 2', () => cuadra(id, 'La dimensión del núcleo', 4 - rango(M)));

  it('y el vector con segunda coordenada 1 y tercera 0 es (−1, 1, 0, −1)', () => {
    /* La base que devuelve `nucleo` no tiene por qué ser esa, así que se
       combina: se busca la combinación de los dos vectores del núcleo que
       cumple las dos condiciones del enunciado. */
    const base = nucleo(M);
    if (base.length !== 2) throw new Error('el núcleo debería tener dimensión 2');
    const [p, q] = base;
    /* α·p + β·q con segunda componente 1 y tercera 0. */
    const d = p[1] * q[2] - p[2] * q[1];
    const alfa = q[2] / d;
    const beta = -p[2] / d;
    cuadra.vector(id, 'Un vector concreto del núcleo', p.map((x, i) => alfa * x + beta * q[i]));
  });
});

describe('3 · cuándo existe la inversa y cuánto vale', () => {
  const id = 'exalg2223-ext-3-cuando-existe-la-inversa-y-cuanto-vale';
  const A = (x: number) => [
    [1, -x, 0, 0],
    [0, 1, -x, 0],
    [-1, x - 1, 1, 1 - x],
    [0, 1, 0, -1],
  ];

  it('el determinante es de verdad x² − 1', () => {
    /* El enunciado del paso da esa fórmula por sabida. Se comprueba en cinco
       puntos, que para un polinomio de grado dos sobra. */
    for (const x of [-3, -2, 0, 1, 4])
      if (Math.abs(det(A(x)) - (x * x - 1)) > 1e-9)
        throw new Error(`en x=${x} el determinante no es x²−1`);
    cuadra.conjunto(id, 'Los valores prohibidos', [1, -1]);
  });

  it('para x = −2 vale 3', () => cuadra(id, 'El determinante en el caso que se pide', det(A(-2))));

  it('y la primera fila de la inversa es (−1/3, 2/3, −4/3, −4)', () =>
    cuadra.vector(id, 'La primera fila de la inversa', inversa(A(-2))[0]));
});

describe('4 · los parámetros que el autovector obliga', () => {
  const id = 'exalg2223-ext-4-los-parametros-que-el-autovector-obliga';

  /* A·(1,1,1) = 1·(1,1,1) da una ecuación por fila, y cada una despeja su
     parámetro sin tocar los otros. */
  const alfa = 1 - 1 - 2;
  const beta = 1 - 2 - 1;
  const gamma = 1 - 2 - 2;
  const A = [
    [1, 2, alfa],
    [2, 1, beta],
    [2, 2, gamma],
  ];

  it('los parámetros son (−2, −2, −3)', () =>
    cuadra.vector(id, 'Los tres parámetros', [alfa, beta, gamma]));

  it('el otro autovalor es −1, y es doble', () => {
    /* Se comprueba primero que (1,1,1) es autovector de la A ya completa, que
       es la hipótesis de la que salen los parámetros. */
    const imagen = A.map((f) => f.reduce((s, x) => s + x, 0));
    if (imagen.some((v) => Math.abs(v - 1) > 1e-9)) throw new Error('(1,1,1) no es autovector');
    const otros = valoresPropios(A).filter((l) => Math.abs(l - 1) > 1e-6);
    if (otros.length !== 2 || Math.abs(otros[0] - otros[1]) > 1e-6)
      throw new Error('los otros dos autovalores no coinciden');
    cuadra(id, 'El otro autovalor', otros[0]);
  });

  it('y su autoespacio es un plano, así que A sí diagonaliza', () => {
    const M = A.map((f, i) => f.map((x, j) => x + (i === j ? 1 : 0)));
    cuadra(id, 'La multiplicidad geométrica del autovalor doble', nucleo(M).length);
  });
});
