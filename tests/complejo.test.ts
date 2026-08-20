import { describe, expect, it } from 'vitest';
import {
  comparaComplejo,
  comparaConjunto,
  escribeComplejo,
  leeComplejo,
  leeConjunto,
} from '../src/lib/complejo';

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

describe('leeConjunto y comparaConjunto', () => {
  const tres = [
    { re: 0, im: 0 },
    { re: 1, im: 0 },
    { re: -0.5, im: 0.866 },
  ];

  it('lee una lista separada por comas', () => {
    expect(leeConjunto('0, 1, -0.5+0.866i')).toEqual(tres);
  });

  it('acepta el punto y coma, que es lo que sale al copiar de un examen', () => {
    expect(leeConjunto('0; 1; -0.5+0.866i')).toEqual(tres);
  });

  it('rechaza la lista entera si una sola solucion no se entiende', () => {
    expect(leeConjunto('0, 1, no se')).toBeNull();
    expect(leeConjunto('')).toBeNull();
    expect(leeConjunto('  ,  ')).toBeNull();
  });

  it('no le importa el orden: un conjunto no lo tiene', () => {
    const revuelto = leeConjunto('-0.5+0.866i, 0, 1')!;
    expect(comparaConjunto(revuelto, tres, 0.01).igual).toBe(true);
  });

  it('distingue faltar de sobrar, que es lo que permite diagnosticar', () => {
    const soloUna = comparaConjunto([{ re: 1, im: 0 }], tres, 0.01);
    expect(soloUna.igual).toBe(false);
    expect(soloUna.faltan).toBe(2);
    expect(soloUna.sobran).toBe(0);

    const deMas = comparaConjunto([...tres, { re: 7, im: 7 }], tres, 0.01);
    expect(deMas.faltan).toBe(0);
    expect(deMas.sobran).toBe(1);
  });

  it('no da por buena una solucion repetida en lugar de dos distintas', () => {
    const repetida = comparaConjunto(
      [{ re: 1, im: 0 }, { re: 1, im: 0 }, { re: 0, im: 0 }],
      tres,
      0.01,
    );
    expect(repetida.igual).toBe(false);
    expect(repetida.faltan).toBe(1);
    expect(repetida.sobran).toBe(1);
  });
});
