/**
 * El verificador también hay que verificarlo.
 *
 * `lineal.ts` existe para comprobar las resoluciones de Álgebra, así que un
 * error suyo no daría un fallo: daría **confianza falsa**, que es peor que no
 * comprobar nada. Estos casos tienen resultado conocido de antemano.
 */
import { describe, expect, it } from 'vitest';
import {
  det, escalar, gramSchmidt, inversa, norma, nucleo, porMatriz, porVector,
  productoVectorial, rango, resuelve, traspuesta, valoresPropios,
} from './lineal';

const cerca = (a: number, b: number) => expect(Math.abs(a - b)).toBeLessThan(1e-6);
const cercaV = (a: number[], b: number[]) => {
  expect(a.length).toBe(b.length);
  a.forEach((x, i) => cerca(x, b[i]));
};

describe('determinante', () => {
  it('el de la identidad es 1', () => cerca(det([[1, 0], [0, 1]]), 1));
  it('el de [[1,2],[3,4]] es −2', () => cerca(det([[1, 2], [3, 4]]), -2));
  it('cambia de signo al permutar dos filas', () =>
    cerca(det([[3, 4], [1, 2]]), 2));
  it('una matriz con dos filas iguales vale 0', () =>
    cerca(det([[1, 2, 3], [1, 2, 3], [4, 5, 7]]), 0));
  it('el de una triangular es el producto de la diagonal', () =>
    cerca(det([[2, 9, 9], [0, 3, 9], [0, 0, 5]]), 30));
});

describe('rango', () => {
  it('tres filas independientes dan 3', () =>
    expect(rango([[1, 0, 0], [0, 1, 0], [0, 0, 1]])).toBe(3));
  it('una fila que es suma de las otras dos no cuenta', () =>
    expect(rango([[1, 1, 0], [0, 1, 1], [1, 2, 1]])).toBe(2));
  it('la matriz nula tiene rango 0', () => expect(rango([[0, 0], [0, 0]])).toBe(0));
});

describe('sistemas', () => {
  it('resuelve un 2×2 sencillo', () => cercaV(resuelve([[2, 1], [1, -1]], [5, 1]), [2, 1]));
  it('resuelve un 3×3', () =>
    cercaV(resuelve([[1, 1, 1], [0, 2, 1], [1, 0, -1]], [6, 7, -2]), [1, 2, 3]));
  it('se niega a inventar una solución si el sistema es indeterminado', () =>
    expect(() => resuelve([[1, 1], [2, 2]], [1, 2])).toThrow());
  it('y avisa si es incompatible', () =>
    expect(() => resuelve([[1, 1], [1, 1]], [1, 2])).toThrow());
});

describe('núcleo', () => {
  it('el de una matriz de rango completo es vacío', () =>
    expect(nucleo([[1, 0], [0, 1]])).toHaveLength(0));
  it('el de [[1,1]] es la recta generada por (−1,1)', () => {
    const base = nucleo([[1, 1]]);
    expect(base).toHaveLength(1);
    cercaV(base[0], [-1, 1]);
  });
  it('sus vectores están de verdad en el núcleo', () => {
    const M = [[1, 2, 3, 4], [0, 1, 1, 1]];
    for (const v of nucleo(M)) cercaV(porVector(M, v), [0, 0]);
  });
});

describe('inversa', () => {
  it('la de la identidad es ella misma', () =>
    expect(inversa([[1, 0], [0, 1]])).toEqual([[1, 0], [0, 1]]));
  it('A·A⁻¹ da la identidad', () => {
    const A = [[-3, 1, -1], [0, 5, -1], [-6, 0, -2]];
    const I = porMatriz(A, inversa(A));
    I.forEach((f, i) => f.forEach((x, j) => cerca(x, i === j ? 1 : 0)));
  });
  it('se niega con una matriz singular', () =>
    expect(() => inversa([[1, 2], [2, 4]])).toThrow());
});

describe('productos', () => {
  it('matriz por vector', () => cercaV(porVector([[1, 2], [3, 4]], [1, 1]), [3, 7]));
  it('matriz por matriz', () =>
    expect(porMatriz([[1, 2], [3, 4]], [[0, 1], [1, 0]])).toEqual([[2, 1], [4, 3]]));
  it('traspuesta de una no cuadrada', () =>
    expect(traspuesta([[1, 2, 3], [4, 5, 6]])).toEqual([[1, 4], [2, 5], [3, 6]]));
});

describe('valores propios', () => {
  it('los de una diagonal son su diagonal', () =>
    cercaV(valoresPropios([[2, 0], [0, 5]]), [2, 5]));
  it('los de [[2,1],[1,2]] son 1 y 3', () => cercaV(valoresPropios([[2, 1], [1, 2]]), [1, 3]));
  it('una 3×3 triangular da su diagonal', () => {
    const l = valoresPropios([[1, 7, 7], [0, 2, 7], [0, 0, 3]]).sort((a, b) => a - b);
    cercaV(l, [1, 2, 3]);
  });
  it('y avisa cuando son complejos en el caso 2×2', () =>
    expect(() => valoresPropios([[0, -1], [1, 0]])).toThrow());

  /* Los tres que siguen entraron el 5 de septiembre de 2026, después de que
     la primera versión —que buscaba las tres raíces por cambio de signo— se
     dejara silenciosamente las dobles. Una raíz doble toca el eje y no lo
     cruza, así que no había cambio de signo que ver. */
  it('encuentra una raíz doble', () => {
    const l = valoresPropios([[2, 0, 0], [0, 2, 0], [0, 0, 5]]).sort((a, b) => a - b);
    cercaV(l, [2, 2, 5]);
  });
  it('y una triple, con menos precisión y por un motivo sabido', () => {
    /* Sobre una raíz triple la bisección converge despacio: el polinomio se
       aplasta contra el eje y muchos bits del intervalo no dicen nada. Sale
       con un error de unas 2 cienmilésimas, que es 50 veces menor que la
       tolerancia más estrecha que declara el corpus (0,001), así que el
       límite se documenta en vez de perseguirlo. */
    const l = valoresPropios([[3, 0, 0], [0, 3, 0], [0, 0, 3]]).sort((a, b) => a - b);
    l.forEach((x) => expect(Math.abs(x - 3)).toBeLessThan(1e-4));
  });
  it('devuelve siempre tres, contando multiplicidades', () =>
    expect(valoresPropios([[1, -2, -2], [-2, -7, 8], [2, 8, -7]])).toHaveLength(3));
});

describe('geometría con el producto escalar usual', () => {
  it('el producto vectorial de i por j es k', () =>
    cercaV(productoVectorial([1, 0, 0], [0, 1, 0]), [0, 0, 1]));
  it('y es perpendicular a los dos factores', () => {
    const a = [1, 2, 2];
    const b = [-1, 0, 2];
    const c = productoVectorial(a, b);
    cerca(escalar(c, a), 0);
    cerca(escalar(c, b), 0);
  });
  it('Gram-Schmidt devuelve vectores unitarios y ortogonales', () => {
    const base = gramSchmidt([[1, 2, 2], [-1, 0, 2]]);
    expect(base).toHaveLength(2);
    base.forEach((v) => cerca(norma(v), 1));
    cerca(escalar(base[0], base[1]), 0);
  });
  it('y descarta los vectores dependientes en vez de dividir por cero', () =>
    expect(gramSchmidt([[1, 0], [2, 0]])).toHaveLength(1));
});
