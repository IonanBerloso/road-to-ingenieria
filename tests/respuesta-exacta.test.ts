/**
 * Respuestas en forma exacta, porque en el examen no hay calculadora.
 *
 * Medido el 23 de agosto de 2026: de las 380 respuestas numéricas del corpus,
 * 128 pedían tres decimales o más y 83 lo decían con todas las letras («Da
 * cuatro decimales»). Un alumno sin calculadora no puede escribir 4,6708 para
 * un área que vale (e²−1)/2. Estas pruebas fijan que la forma exacta se lee.
 */
import { describe, expect, it } from 'vitest';
import { evaluaNumero } from '../src/lib/regiones';

const casos: Array<[string, number]> = [
  ['pi/4', Math.PI / 4],
  ['2pi', 2 * Math.PI],
  ['pi^2/6', Math.PI ** 2 / 6],
  ['sqrt(3)/2', Math.sqrt(3) / 2],
  ['(e^2-1)/2', (Math.E ** 2 - 1) / 2],
  ['ln(2)', Math.LN2],
  ['e', Math.E],
  ['3', 3],
  ['0.5', 0.5],
  ['-2/3', -2 / 3],
  ['24pi/5', (24 * Math.PI) / 5],
  ['(1+sqrt(5))/2', (1 + Math.sqrt(5)) / 2],
];

describe('el evaluador lee la forma exacta', () => {
  for (const [texto, esperado] of casos) {
    it(texto, () => {
      const v = evaluaNumero(texto);
      expect(v, `no ha entendido «${texto}»`).not.toBeNull();
      expect(v!.re).toBeCloseTo(esperado, 9);
      expect(v!.im).toBeCloseTo(0, 9);
    });
  }

  it('lee también un complejo', () => {
    const v = evaluaNumero('2+3i');
    expect(v!.re).toBeCloseTo(2, 9);
    expect(v!.im).toBeCloseTo(3, 9);
  });

  /* Notación científica, que en Química es la forma normal de escribir
     cualquier constante de equilibrio. Antes del 5 de septiembre de 2026
     `1.8e-5` se leía como `1.8 · e − 5 = −0,107`: no daba error, daba un
     número **equivocado**, así que el alumno escribía bien y el sitio le
     decía que no. Estas pruebas fijan las dos mitades de la regla — que la
     notación se lee, y que la `e` suelta sigue siendo Euler. */
  const cientifica: Array<[string, number]> = [
    ['1.8e-5', 1.8e-5],
    ['1,8e-5', 1.8e-5],
    ['1.08E-3', 1.08e-3],
    ['2.44e-6', 2.44e-6],
    ['3e8', 3e8],
    ['6.022e23', 6.022e23],
    ['1e-14', 1e-14],
    ['-4.66e-3', -4.66e-3],
  ];
  for (const [texto, esperado] of cientifica) {
    it(`notación científica: ${texto}`, () => {
      const v = evaluaNumero(texto);
      expect(v, `no ha entendido «${texto}»`).not.toBeNull();
      expect(v!.re / esperado).toBeCloseTo(1, 9);
    });
  }

  it('la e suelta sigue siendo el número de Euler', () => {
    expect(evaluaNumero('e')!.re).toBeCloseTo(Math.E, 9);
    expect(evaluaNumero('2e')!.re).toBeCloseTo(2 * Math.E, 9);
    expect(evaluaNumero('e^2')!.re).toBeCloseTo(Math.E ** 2, 9);
    /* Sin dígitos detrás no hay exponente que consumir, así que esto sigue
       siendo un producto y no notación científica a medias. */
    expect(evaluaNumero('3*e')!.re).toBeCloseTo(3 * Math.E, 9);
  });

  it('rechaza una expresión con variable libre', () => {
    expect(evaluaNumero('x^2')).toBeNull();
    expect(evaluaNumero('2z')).toBeNull();
  });

  it('rechaza lo que no entiende', () => {
    expect(evaluaNumero('hola')).toBeNull();
    expect(evaluaNumero('')).toBeNull();
    expect(evaluaNumero('2+')).toBeNull();
  });
});
