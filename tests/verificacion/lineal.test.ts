/**
 * El verificador también hay que verificarlo.
 *
 * `lineal.ts` existe para comprobar las resoluciones de Álgebra, así que un
 * error suyo no daría un fallo: daría **confianza falsa**, que es peor que no
 * comprobar nada. Estos casos tienen resultado conocido de antemano.
 */
import { describe, expect, it } from 'vitest';
import { det, nucleo, porMatriz, porVector, rango, resuelve, traspuesta, valoresPropios } from './lineal';

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
});
