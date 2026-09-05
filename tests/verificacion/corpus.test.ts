/**
 * Los lectores de `corpus.ts`, verificados.
 *
 * Estos son los que traducen lo que el corpus **escribe** a lo que el test
 * **compara**, así que un fallo suyo no rompe nada: hace que una comparación
 * pase por casualidad, o que falle una que estaba bien. Ya pasó dos veces —el
 * lector no sabía leer «1/√10», y una barra invertida perdida convirtió el
 * limpiador de espacios en un borrador de eses—.
 */
import { describe, expect, it } from 'vitest';
import { complejo, matriz, vector } from './corpus';

describe('vectores', () => {
  it('con paréntesis y sin ellos', () => {
    expect(vector('(1, -1, 2)')).toEqual([1, -1, 2]);
    expect(vector('1, -1, 2')).toEqual([1, -1, 2]);
  });
  it('con fracciones', () => {
    const v = vector('(-5/3, 1/3, 2/3)');
    expect(v[0]).toBeCloseTo(-5 / 3, 12);
    expect(v[2]).toBeCloseTo(2 / 3, 12);
  });
  it('con raíces, que es como se escriben las bases ortonormales', () => {
    const v = vector('(1/√10, 2/√10, 0)');
    expect(v[0]).toBeCloseTo(1 / Math.sqrt(10), 12);
    expect(v[1]).toBeCloseTo(2 / Math.sqrt(10), 12);
    expect(v[2]).toBe(0);
  });
  it('y con la raíz arriba', () => {
    const v = vector('(√3/3, -√6/6)');
    expect(v[0]).toBeCloseTo(Math.sqrt(3) / 3, 12);
    expect(v[1]).toBeCloseTo(-Math.sqrt(6) / 6, 12);
  });
  it('se niega ante algo que no sabe leer, en vez de adivinar', () =>
    expect(() => vector('(1, dos, 3)')).toThrow());
});

describe('matrices', () => {
  it('con corchetes y sin ellos', () => {
    expect(matriz('[1, 2; 3, 4]')).toEqual([[1, 2], [3, 4]]);
    expect(matriz('1, 2; 3, 4')).toEqual([[1, 2], [3, 4]]);
  });
  it('con fracciones dentro', () => {
    const M = matriz('-1, 0, -1; 4, 4, -4; 5/2, 3/2, -2');
    expect(M[2][0]).toBeCloseTo(2.5, 12);
    expect(M[2][1]).toBeCloseTo(1.5, 12);
  });
});

describe('complejos', () => {
  it('parte real y parte imaginaria', () => expect(complejo('-1+9.5i')).toEqual([-1, 9.5]));
  it('solo imaginario', () => expect(complejo('2i')).toEqual([0, 2]));
  it('la unidad imaginaria sola', () => expect(complejo('i')).toEqual([0, 1]));
  it('y con signo', () => expect(complejo('-i')).toEqual([0, -1]));
  it('solo real', () => expect(complejo('3')).toEqual([3, 0]));
  it('con espacios', () => expect(complejo('  -1 + 9.5i ')).toEqual([-1, 9.5]));
  it('se niega ante algo que no sabe leer', () => expect(() => complejo('1+2j')).toThrow());
});
