import { describe, expect, it } from 'vitest';
import { comparaComplejo, escribeComplejo, leeComplejo } from '../src/lib/complejo';

/**
 * El alumno escribe a mano, en el móvil, con prisa y la noche antes del examen.
 * Estos casos son los que va a escribir de verdad; si alguno falla, el sistema
 * le dirá que se ha equivocado cuando no se ha equivocado, y eso es peor que no
 * corregir nada.
 */
describe('leeComplejo', () => {
  const casos: Array<[string, number, number]> = [
    ['i', 0, 1],
    ['-i', 0, -1],
    ['3', 3, 0],
    ['-16-16i', -16, -16],
    ['-16 - 16i', -16, -16],
    ['-16 - 16 i', -16, -16],
    ['- 16 - 16i', -16, -16],
    ['16i-16', -16, 16],
    ['1+i', 1, 1],
    ['2i', 0, 2],
    ['0', 0, 0],
    ['1,5-2,25i', 1.5, -2.25],
    ['1.5-2.25i', 1.5, -2.25],
    ['+4+3i', 4, 3],
    ['−16−16i', -16, -16], // signo menos tipográfico: lo pega quien copia del PDF
  ];

  for (const [texto, re, im] of casos) {
    it(`lee «${texto}»`, () => {
      expect(leeComplejo(texto)).toEqual({ re, im });
    });
  }

  it('entiende raíces y fracciones, que es como se escriben estas respuestas', () => {
    expect(leeComplejo('√2/2 + √2/2 i')).toEqual({
      re: Math.SQRT2 / 2,
      im: Math.SQRT2 / 2,
    });
    expect(leeComplejo('-1/2 - √3/2 i')?.re).toBeCloseTo(-0.5, 12);
    expect(leeComplejo('-1/2 - √3/2 i')?.im).toBeCloseTo(-Math.sqrt(3) / 2, 12);
    expect(leeComplejo('16√2')).toEqual({ re: 16 * Math.SQRT2, im: 0 });
    expect(leeComplejo('sqrt(2)')).toEqual({ re: Math.SQRT2, im: 0 });
  });

  it('devuelve null cuando no hay forma de saber qué ha escrito', () => {
    for (const basura of ['', '   ', 'no sé', 'e^{i pi}', '2 + 3j', '1+', '**']) {
      expect(leeComplejo(basura)).toBeNull();
    }
  });
});

describe('comparaComplejo', () => {
  const objetivo = { re: -16, im: -16 };

  it('acepta la respuesta exacta', () => {
    expect(comparaComplejo({ re: -16, im: -16 }, objetivo, 0.01)).toBe(true);
  });

  it('acepta dentro de la tolerancia y rechaza fuera', () => {
    expect(comparaComplejo({ re: -16.005, im: -16 }, objetivo, 0.01)).toBe(true);
    expect(comparaComplejo({ re: -16.5, im: -16 }, objetivo, 0.01)).toBe(false);
  });

  it('no confunde el conjugado con la respuesta', () => {
    expect(comparaComplejo({ re: -16, im: 16 }, objetivo, 0.01)).toBe(false);
  });

  it('distingue el signo global, que es el error de arctan', () => {
    expect(comparaComplejo({ re: 16, im: 16 }, objetivo, 0.01)).toBe(false);
  });
});

describe('escribeComplejo', () => {
  it('escribe la forma binómica como se escribe en un examen', () => {
    expect(escribeComplejo({ re: -16, im: -16 })).toBe('-16 - 16i');
    expect(escribeComplejo({ re: 0, im: 1 })).toBe('i');
    expect(escribeComplejo({ re: 0, im: -1 })).toBe('-i');
    expect(escribeComplejo({ re: 3, im: 0 })).toBe('3');
    expect(escribeComplejo({ re: 0, im: 0 })).toBe('0');
    expect(escribeComplejo({ re: 1, im: 2 })).toBe('1 + 2i');
  });
});
