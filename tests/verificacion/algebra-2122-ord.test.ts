/**
 * Convocatoria ordinaria de Álgebra, curso 2021-2022.
 *
 * Álgebra no publica solución de ninguno de sus 32 ejercicios, así que aquí
 * pasa lo mismo que con Química: la única verificación posible es rehacer las
 * cuentas. La diferencia es que aquí casi ninguna respuesta es un número —son
 * vectores, matrices y dimensiones—, y por eso `corpus.ts` sabe comparar las
 * cuatro formas.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { det, nucleo, porVector, rango, rref, valoresPropios } from './lineal';

const cuadra = convocatoria('algebra', '2021-2022-ord');

describe('1 · simétricas y antisimétricas parten el espacio', () => {
  const id = 'exalg2122-ord-1-simetricas-y-antisimetricas-parten-el-espacio';

  it('las simétricas de orden 2 forman un subespacio de dimensión 3', () => {
    /* Se cuenta sobre las matrices de verdad, no con la fórmula n(n+1)/2:
       el rango de las cuatro entradas vistas como vectores de R⁴, sujetas a
       la condición de simetría. */
    const base = [
      [1, 0, 0, 0], // [[1,0],[0,0]]
      [0, 1, 1, 0], // [[0,1],[1,0]]
      [0, 0, 0, 1], // [[0,0],[0,1]]
    ];
    cuadra(id, 'La dimensión de las simétricas', rango(base));
  });

  it('la matriz [[−2,2],[4,1]] tiene coordenadas (−2, 3, 1, −1)', () => {
    /* La base de U+V del enunciado, cada matriz aplanada por filas. Las
       coordenadas salen de resolver el sistema, no de mirar la resolución. */
    const B = [
      [1, 0, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 1],
      [0, 1, -1, 0],
    ];
    const M = [-2, 2, 4, 1];
    /* Columnas los vectores de la base: B traspuesta. */
    const A = [0, 1, 2, 3].map((f) => B.map((v) => v[f]));
    const { R, pivotes } = rref(A.map((f, i) => [...f, M[i]]));
    const x = new Array(4).fill(0);
    pivotes.forEach((c: number, i: number) => (x[c] = R[i][4]));
    cuadra.vector(id, 'Las coordenadas en la base de la suma', x);
  });
});

describe('2 · tres datos cruzados y el núcleo por ecuaciones', () => {
  const id = 'exalg2122-ord-2-tres-datos-cruzados-y-el-nucleo-por-ecuaciones';

  /* Los tres datos del enunciado. */
  const fe1 = [0, 1, 2];
  const fe2mase3 = [0, -1, 0];
  const fe1mase2menose3 = [-2, -2, 0];

  /* De f(e1+e2−e3) = f(e1) + f(e2) − f(e3) se despeja f(e2) − f(e3), y con
     f(e2) + f(e3) se resuelve el sistema de dos vectores. */
  const resta = fe1mase2menose3.map((v, i) => v - fe1[i]); // f(e2) − f(e3)
  const fe2 = fe2mase3.map((v, i) => (v + resta[i]) / 2);
  const fe3 = fe2mase3.map((v, i) => v - fe2[i]);

  it('f(e₂) vale (−1, −2, −1)', () =>
    cuadra.vector(id, 'La imagen del segundo vector de la base', fe2));

  it('la matriz asociada sale de poner las cuatro imágenes en columnas', () => {
    /* La cuarta columna sale del núcleo: x = z = 0, y − z − t = 0 da el
       vector (0,1,0,1), y f de él es cero, luego f(e4) = −f(e2). */
    const baseKer = nucleo([
      [1, 0, 0, 0], // x = 0
      [0, 0, 1, 0], // z = 0
      [0, 1, -1, -1], // y − z − t = 0
    ]);
    if (baseKer.length !== 1) throw new Error('el núcleo debería tener dimensión 1');
    const [k] = baseKer;
    /* f(k) = 0 con k = (0,1,0,1) salvo escala: f(e2)·k[1] + f(e4)·k[3] = 0. */
    const fe4 = fe2.map((v) => (-v * k[1]) / k[3]);
    const columnas = [fe1, fe2, fe3, fe4];
    cuadra.matriz(id, 'La matriz asociada', [0, 1, 2].map((f) => columnas.map((c) => c[f])));
  });

  it('la dimensión de la imagen es 3', () => {
    /* Tres ecuaciones independientes en R⁴ dejan un núcleo de dimensión 1, y
       el teorema de las dimensiones hace el resto. */
    const ker = 4 - rango([
      [1, 0, 0, 0],
      [0, 0, 1, 0],
      [0, 1, -1, -1],
    ]);
    cuadra(id, 'La dimensión de la imagen', 4 - ker);
  });
});

describe('3 · ortonormalizar con un producto escalar que no es el de siempre', () => {
  const id = 'exalg2122-ord-3-ortonormalizar-con-un-producto-escalar-que-no-es-el-de-siempre';

  /* ⟨x,y⟩ = x₁y₁ − x₁y₂ − x₂y₁ + 2x₂y₂ + 2x₃y₃, o sea la matriz de Gram: */
  const G = [
    [1, -1, 0],
    [-1, 2, 0],
    [0, 0, 2],
  ];
  const dot = (x: number[], y: number[]) => {
    const Gy = porVector(G, y);
    return x.reduce((s, xi, i) => s + xi * Gy[i], 0);
  };
  const norma = (x: number[]) => Math.sqrt(dot(x, x));

  const w1 = [1, 0, -2];

  it('la norma de (1, 0, −2) con este producto vale 3', () => {
    /* Con el producto de siempre valdría √5: la gracia del ejercicio es que
       la métrica cambia las longitudes. */
    cuadra(id, 'La norma del primer generador', norma(w1));
  });

  const u1 = w1.map((v) => v / norma(w1));

  it('el segundo vector de la base de S es (1, 1, 0)', () => {
    /* Gram-Schmidt sobre (0,1,2), que también cumple −2x + 2y − z = 0. */
    const w2 = [0, 1, 2];
    const proy = dot(w2, u1);
    const orto = w2.map((v, i) => v - proy * u1[i]);
    cuadra.vector(id, 'El segundo vector de la base de S', orto.map((v) => v / norma(orto)));
  });

  it('la dirección que completa la base es (4, 0, 1)', () => {
    /* Ortogonal a los dos anteriores CON ESTA MÉTRICA: las dos condiciones
       son (G·u)ᵀ·v = 0, y el núcleo de esas dos filas da la dirección. */
    const u2 = [1, 1, 0];
    const base = nucleo([porVector(G, u1), porVector(G, u2)]);
    if (base.length !== 1) throw new Error('debería quedar una sola dirección');
    /* `nucleo` deja la coordenada libre a 1, y aquí la libre es la tercera:
       sale (4, 0, 1) directamente, que ya es la forma entera mínima con la
       primera coordenada positiva que pide el enunciado. */
    cuadra.vector(id, 'La dirección que completa la base', base[0]);
  });
});

describe('4 · una simétrica con tres autovalores limpios', () => {
  const id = 'exalg2122-ord-4-una-simetrica-con-tres-autovalores-limpios';
  const G = [
    [3, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
  ];

  it('el determinante nulo delata el autovalor 0', () => {
    /* Las filas 2 y 3 son iguales, así que el determinante es cero y el
       producto de los autovalores también. */
    if (Math.abs(det(G)) > 1e-9) throw new Error('el determinante no es cero');
    cuadra(id, 'El autovalor que delata el determinante', 0);
  });

  const propios = valoresPropios(G).sort((a, b) => a - b);

  it('el mayor de los tres es 4', () => cuadra(id, 'El autovalor más grande', propios[2]));

  it('y su autovector es (2, 1, 1)', () => {
    /* El núcleo de G − 4I, escalado para que las dos últimas coordenadas
       valgan 1, como pide el enunciado. */
    const M = G.map((f, i) => f.map((x, j) => x - (i === j ? 4 : 0)));
    const base = nucleo(M);
    if (base.length !== 1) throw new Error('el autoespacio debería ser una recta');
    const v = base[0];
    cuadra.vector(id, 'El autovector del autovalor 4', v.map((x) => x / v[2]));
  });
});
