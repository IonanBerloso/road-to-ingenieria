import { describe, expect, it } from 'vitest';
import { ejerciciosDelCuadernillo } from '../src/lib/cuadernillo';

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
