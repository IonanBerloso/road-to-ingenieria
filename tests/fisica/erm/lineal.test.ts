/**
 * El resolvedor lineal del motor de ERM (`src/lib/erm/lineal.ts`).
 *
 * Segundo camino: cada solución se sustituye en el sistema (A·x = b), y el
 * caso determinado se compara con la solución escrita a mano: x + y + z = 6,
 * 2y + 5z = −4, 2x + 5y − z = 27 da (5, 3, −2), que se comprueba de cabeza.
 */
import { describe, expect, it } from 'vitest';
import { resuelveLineal } from '../../../src/lib/erm/lineal';

describe('resuelveLineal', () => {
  it('resuelve un sistema determinado: (5, 3, −2)', () => {
    const A = [
      [1, 1, 1],
      [0, 2, 5],
      [2, 5, -1],
    ];
    const s = resuelveLineal(A, [6, -4, 27]);
    expect(s.rango).toBe(3);
    expect(s.libres).toEqual([]);
    expect(s.x[0]).toBeCloseTo(5, 12);
    expect(s.x[1]).toBeCloseTo(3, 12);
    expect(s.x[2]).toBeCloseTo(-2, 12);
    expect(s.residuo).toBeLessThan(1e-12);
  });

  it('admite ecuaciones repetidas sin perder el rango verdadero', () => {
    const A = [
      [1, 1],
      [2, 2],
      [1, -1],
    ];
    const s = resuelveLineal(A, [3, 6, 1]);
    expect(s.rango).toBe(2);
    expect(s.x[0]).toBeCloseTo(2, 12);
    expect(s.x[1]).toBeCloseTo(1, 12);
    expect(s.residuo).toBeLessThan(1e-12);
  });

  it('dice qué incógnita queda libre en un sistema indeterminado', () => {
    const s = resuelveLineal([[1, 1]], [2]);
    expect(s.rango).toBe(1);
    expect(s.libres).toEqual([1]);
    expect(s.residuo).toBeLessThan(1e-12);
  });

  it('deja un residuo grande en un sistema incompatible', () => {
    const s = resuelveLineal(
      [
        [1, 1],
        [1, 1],
      ],
      [1, 2],
    );
    expect(s.rango).toBe(1);
    expect(s.residuo).toBeGreaterThan(0.1);
  });

  it('no toca la matriz que recibe', () => {
    const A = [
      [2, 1],
      [1, 3],
    ];
    const copia = A.map((f) => [...f]);
    resuelveLineal(A, [3, 5]);
    expect(A).toEqual(copia);
  });
});
