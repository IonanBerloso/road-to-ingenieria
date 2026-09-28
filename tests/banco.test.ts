/**
 * Las reglas de texto de los bancos de test (fase E3 de la auditoría del 27
 * de septiembre de 2026): el ancla de cada apartado, que comparten el
 * componente y el carril de la página, y cuándo una opción se dibuja a
 * tamaño de fórmula aparte.
 */
import { describe, expect, it } from 'vitest';
import { aTamanoDeFormula, anclaDeBloque } from '../src/lib/banco-texto';

describe('el ancla de un apartado', () => {
  it('cambia los puntos por guiones, que en un id estorban a los selectores', () => {
    expect(anclaDeBloque('1.2')).toBe('cq-1-2');
    expect(anclaDeBloque('2.8.3')).toBe('cq-2-8-3');
    expect(anclaDeBloque('10.1-10.2')).toBe('cq-10-1-10-2');
    expect(anclaDeBloque('lugares')).toBe('cq-lugares');
  });
});

describe('una opción que es solo una fórmula', () => {
  it('se dibuja como fórmula en bloque, que si no cabe se desplaza con su aviso', () => {
    expect(aTamanoDeFormula('$F(s)=\\frac{1}{s}$')).toBe('$$\nF(s)=\\frac{1}{s}\n$$');
    expect(aTamanoDeFormula('  $x>0$ ')).toBe('$$\nx>0\n$$');
  });

  it('con texto alrededor se queda en línea', () => {
    expect(aTamanoDeFormula('Depende de $z_1$ y $z_2$')).toBe('Depende de $z_1$ y $z_2$');
    expect(aTamanoDeFormula('La representación A')).toBe('La representación A');
    expect(aTamanoDeFormula('$a$ y $b$')).toBe('$a$ y $b$');
  });
});
