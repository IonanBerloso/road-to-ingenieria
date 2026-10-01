import { describe, expect, it } from 'vitest';
import { anguloEnVertice } from '../../src/lib/diedrico-corrige';

/* El transportador del Taller (fase K, 1 de octubre de 2026): el ángulo en un
   vértice, por dos caminos —el producto escalar que usa la función y la
   diferencia de las dos direcciones con atan2—. */
const porAtan2 = (v: readonly [number, number], a: readonly [number, number], b: readonly [number, number]) => {
  let d = Math.abs(Math.atan2(a[1] - v[1], a[0] - v[0]) - Math.atan2(b[1] - v[1], b[0] - v[0]));
  if (d > Math.PI) d = 2 * Math.PI - d;
  return (d * 180) / Math.PI;
};

describe('anguloEnVertice', () => {
  it('un recto, un llano y el de un triángulo equilátero', () => {
    expect(anguloEnVertice([0, 0], [10, 0], [0, 7])).toBeCloseTo(90, 9);
    expect(anguloEnVertice([0, 0], [10, 0], [-3, 0])).toBeCloseTo(180, 9);
    expect(anguloEnVertice([0, 0], [10, 0], [5, 5 * Math.sqrt(3)])).toBeCloseTo(60, 9);
  });

  it('coincide con la diferencia de direcciones, sea cual sea el orden de los lados', () => {
    const casos: [number, number][][] = [
      [[12.5, -3], [40, 8], [-7, 33]],
      [[100, 100], [101, 300], [400, 99]],
      [[-20, 5], [-60, -40], [10, 70]],
    ];
    for (const [v, a, b] of casos) {
      expect(anguloEnVertice(v, a, b)).toBeCloseTo(porAtan2(v, a, b), 9);
      expect(anguloEnVertice(v, b, a)).toBeCloseTo(anguloEnVertice(v, a, b), 12);
    }
  });

  it('sin lado no hay ángulo', () => {
    expect(anguloEnVertice([1, 1], [1, 1], [5, 0])).toBeNaN();
  });
});
