import { describe, expect, it } from 'vitest';
import { avisoDeResoluciones, ejerciciosDelCuadernillo, filasDelCuadernillo, queEsElPdf } from '../src/lib/cuadernillo';

/* La regla que publican tres páginas: cuántos ejercicios trae un cuadernillo.
   Unida en src/lib/cuadernillo.ts el 26 de septiembre de 2026. */
describe('ejerciciosDelCuadernillo', () => {
  it('sin `n`, cada entrada es un ejercicio', () => {
    expect(ejerciciosDelCuadernillo([{}, {}, {}])).toBe(3);
  });

  it('con `n`, cuenta los ejercicios del examen y no las piezas guiadas', () => {
    /* La ordinaria de Térmica de 2025-2026: tres ejercicios partidos en siete
       resoluciones. Contar entradas publicaba «7 ejercicios». */
    const piezas = [{ n: 1 }, { n: 1 }, { n: 2 }, { n: 2 }, { n: 2 }, { n: 3 }, { n: 3 }];
    expect(ejerciciosDelCuadernillo(piezas)).toBe(3);
  });

  it('con un `n` por entrada, las dos cifras coinciden', () => {
    expect(ejerciciosDelCuadernillo([{ n: 1 }, { n: 2 }, { n: 3 }, { n: 4 }])).toBe(4);
  });

  it('un `n` nulo no cuenta como ejercicio aparte', () => {
    expect(ejerciciosDelCuadernillo([{ n: 1 }, { n: null }, { n: 2 }])).toBe(2);
  });

  it('un cuadernillo vacío no tiene ejercicios', () => {
    expect(ejerciciosDelCuadernillo([])).toBe(0);
  });
});

/* Qué número lleva cada fila de la hoja y cuánto reloj le toca. Nace el 28 de
   septiembre de 2026 con las dos resoluciones oficiales de Química, que traen
   ejercicios partidos en piezas y huecos: la resolución de 2013 empieza en el
   3. Numerar por posición publicaba «1, 2, 3…» junto a un cuadernillo que dice
   «3, 4, 5…», y el reloj del simulacro contaba piezas y no ejercicios. */
describe('filasDelCuadernillo', () => {
  it('sin `n`, cada fila es su posición y pesa un ejercicio', () => {
    expect(filasDelCuadernillo([{}, {}, {}])).toEqual([
      { etiqueta: '1', n: 1, peso: 1, primera: true },
      { etiqueta: '2', n: 2, peso: 1, primera: true },
      { etiqueta: '3', n: 3, peso: 1, primera: true },
    ]);
  });

  it('con `n`, la fila lleva el número del cuadernillo y una letra por pieza', () => {
    const filas = filasDelCuadernillo([{ n: 3 }, { n: 4 }, { n: 5 }, { n: 5 }, { n: 6 }, { n: 6 }, { n: 7 }, { n: 8 }]);
    expect(filas.map((f) => f.etiqueta)).toEqual(['3', '4', '5a', '5b', '6a', '6b', '7', '8']);
    expect(filas.map((f) => f.primera)).toEqual([true, true, true, false, true, false, true, true]);
  });

  it('las piezas de un ejercicio se reparten su reloj, y el total son los ejercicios', () => {
    /* La ordinaria de Térmica de 2025-2026: tres ejercicios en siete piezas.
       Con un peso por casilla, el simulacro daba 7 × 50 min en vez de 150. */
    const piezas = [{ n: 1 }, { n: 1 }, { n: 1 }, { n: 2 }, { n: 2 }, { n: 2 }, { n: 3 }];
    const filas = filasDelCuadernillo(piezas);
    expect(filas.map((f) => f.etiqueta)).toEqual(['1a', '1b', '1c', '2a', '2b', '2c', '3']);
    const total = filas.reduce((s, f) => s + f.peso, 0);
    expect(total).toBeCloseTo(ejerciciosDelCuadernillo(piezas), 10);
  });
});

describe('queEsElPdf', () => {
  const enunciado = { pdf: 'a.pdf', pdfEs: 'enunciado' as const };
  const resolucion = { pdf: 'b.pdf', pdfEs: 'resolucion' as const };
  const sinPdf = { pdfEs: 'resolucion' as const };

  it('todas con su enunciado', () => {
    expect(queEsElPdf([enunciado, enunciado])).toBe('su enunciado original en PDF');
  });

  it('todas con la corrección del profesor', () => {
    expect(queEsElPdf([resolucion, resolucion])).toBe('el PDF corregido de la escuela');
  });

  /* Fluidos: el cuadernillo trae impreso el resultado de cada apartado, sin
     resolverlo. Nace el 29 de septiembre de 2026 (fase I, tanda 0). */
  const conResultados = { pdf: 'c.pdf', pdfEs: 'enunciado-con-resultados' as const };

  it('todas con el enunciado y los resultados impresos', () => {
    expect(queEsElPdf([conResultados, conResultados])).toBe('su enunciado original en PDF, con los resultados impresos');
  });

  it('enunciados, unos con resultados y otros sin, y ninguna corrección', () => {
    expect(queEsElPdf([enunciado, conResultados])).toBe(
      'su enunciado original en PDF, que en algunas trae los resultados impresos',
    );
  });

  it('mezcladas, y una que no publica PDF', () => {
    expect(queEsElPdf([enunciado, resolucion, sinPdf])).toBe(
      'el PDF de la escuela, que es el enunciado o, en alguna, la corrección del profesor, salvo una que no lo publica y dice por qué',
    );
  });
});

describe('avisoDeResoluciones', () => {
  it('sin ninguna resolución oficial, todo es propuesta nuestra', () => {
    expect(avisoDeResoluciones([{ pdfEs: 'enunciado' }])).toMatch(/^Los exámenes no publican solución/);
  });

  it('con todas, se dice contra qué están contrastadas', () => {
    expect(avisoDeResoluciones([{ pdfEs: 'resolucion' }, { pdfEs: 'resolucion' }])).toMatch(/contrastadas con la resolución del profesor/);
  });

  it('todas con los resultados impresos: las nuestras llegan a ellos', () => {
    const a = avisoDeResoluciones([{ pdfEs: 'enunciado-con-resultados' }, { pdfEs: 'enunciado-con-resultados' }]);
    expect(a).toMatch(/^Los exámenes publican los resultados, no la resolución/);
  });

  it('unas con resultados y otras sin, ninguna oficial', () => {
    const a = avisoDeResoluciones([{ pdfEs: 'enunciado' }, { pdfEs: 'enunciado-con-resultados' }]);
    expect(a).toMatch(/algunos traen los resultados impresos/);
  });

  it('mezcladas, se dicen las dos cosas', () => {
    const a = avisoDeResoluciones([{ pdfEs: 'enunciado' }, { pdfEs: 'resolucion' }]);
    expect(a).toMatch(/propuesta nuestra/);
    expect(a).toMatch(/resolución del profesor/);
  });
});
