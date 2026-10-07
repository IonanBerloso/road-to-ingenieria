/**
 * Los tramos del Taller: una arista que el alumno pasa a limpio, vista u
 * oculta, contra los tramos de la solución (`casaTramo`, lib/diedrico-corrige).
 */
import { describe, expect, it } from 'vitest';
import { casaTramo, type Tramo } from '../../src/lib/diedrico-corrige';
import { compilaObjetivo, evaluaReceta, type Lamina } from '../../src/lib/diedrico-receta';

/** Una arista de (0,0) a (100,0) que pasa a oculta en (40,0), y otra de
 *  (0,0) a (0,50), vista entera: el vértice (0,0) es de las dos. */
const ARISTAS: Tramo[] = [
  { a: [0, 0], b: [40, 0], tipo: 'visto' },
  { a: [40, 0], b: [100, 0], tipo: 'oculto' },
  { a: [0, 0], b: [0, 50], tipo: 'visto' },
];

describe('casaTramo', () => {
  it('da por bueno un tramo con su tipo, en los dos sentidos', () => {
    expect(casaTramo([0, 0], [40, 0], 'visto', ARISTAS, 1)).toEqual({ que: 'bien', tramos: [0] });
    expect(casaTramo([40, 0], [0, 0], 'visto', ARISTAS, 1)).toEqual({ que: 'bien', tramos: [0] });
    expect(casaTramo([40, 0], [100, 0], 'oculto', ARISTAS, 1)).toEqual({ que: 'bien', tramos: [1] });
  });

  it('no confunde dos aristas que salen del mismo vértice', () => {
    expect(casaTramo([0, 0], [0, 50], 'visto', ARISTAS, 1)).toEqual({ que: 'bien', tramos: [2] });
  });

  it('acepta los extremos dentro de la tolerancia', () => {
    expect(casaTramo([0.5, 0.3], [39.6, -0.2], 'visto', ARISTAS, 1)).toEqual({ que: 'bien', tramos: [0] });
  });

  it('dice qué tramo va del otro tipo, el primero desde donde se empezó', () => {
    expect(casaTramo([40, 0], [100, 0], 'visto', ARISTAS, 1)).toEqual({ que: 'tipo', tramo: 1 });
    expect(casaTramo([0, 0], [100, 0], 'visto', ARISTAS, 1)).toEqual({ que: 'tipo', tramo: 1 });
    expect(casaTramo([0, 0], [100, 0], 'oculto', ARISTAS, 1)).toEqual({ que: 'tipo', tramo: 0 });
    expect(casaTramo([100, 0], [0, 0], 'visto', ARISTAS, 1)).toEqual({ que: 'tipo', tramo: 1 });
  });

  it('une los tramos seguidos del mismo tipo en un solo trazo', () => {
    const recta: Tramo[] = [
      { a: [0, 0], b: [40, 0], tipo: 'visto' },
      { a: [40, 0], b: [100, 0], tipo: 'visto' },
    ];
    expect(casaTramo([0, 0], [100, 0], 'visto', recta, 1)).toEqual({ que: 'bien', tramos: [0, 1] });
    expect(casaTramo([100, 0], [0, 0], 'visto', recta, 1)).toEqual({ que: 'bien', tramos: [1, 0] });
  });

  it('un trazo sobre una arista que no acaba donde cambia algo es un corte mal puesto', () => {
    expect(casaTramo([0, 0], [60, 0], 'visto', ARISTAS, 1)).toEqual({ que: 'corte' });
    expect(casaTramo([20, 0], [40, 0], 'visto', ARISTAS, 1)).toEqual({ que: 'corte' });
  });

  it('un hueco entre dos tramos de la misma recta no se cubre', () => {
    const conHueco: Tramo[] = [
      { a: [0, 0], b: [40, 0], tipo: 'visto' },
      { a: [60, 0], b: [100, 0], tipo: 'visto' },
    ];
    expect(casaTramo([0, 0], [100, 0], 'visto', conHueco, 1)).toEqual({ que: 'corte' });
  });

  it('un trazo que no va por ninguna arista está fuera', () => {
    expect(casaTramo([0, 0], [50, 50], 'visto', ARISTAS, 1)).toEqual({ que: 'fuera' });
    expect(casaTramo([0, 20], [100, 20], 'visto', ARISTAS, 1)).toEqual({ que: 'fuera' });
    expect(casaTramo([10, 10], [10, 10.5], 'visto', ARISTAS, 1)).toEqual({ que: 'fuera' });
  });
});

describe('cruce_aparente(): el cruce aparente de dos rectas de la lámina', () => {
  const lamina: Lamina = { puntos: { A: [0, 0], B: [10, 10], C: [0, 10], D: [10, 0], E: [20, 20] }, segmentos: {} };
  const r = evaluaReceta(lamina, { escena: {}, solucion: {} });
  const punto = (src: string) => compilaObjetivo(src, lamina, r).ramas[0][0];

  it('es donde se cortan en el papel, prolongadas', () => {
    const [x, y] = punto('cruce_aparente(segmento2(figura.punto("A"), figura.punto("B")), segmento2(figura.punto("C"), figura.punto("D")))');
    expect(x).toBeCloseTo(5, 12);
    expect(y).toBeCloseTo(5, 12);
    const [u, v] = punto('cruce_aparente(segmento2(figura.punto("C"), figura.punto("D")), segmento2(figura.punto("B"), figura.punto("E")))');
    expect(u).toBeCloseTo(5, 12);
    expect(v).toBeCloseTo(5, 12);
  });

  it('dos rectas paralelas no se cruzan', () => {
    expect(() => punto('cruce_aparente(segmento2(figura.punto("A"), figura.punto("B")), segmento2(figura.punto("B"), figura.punto("E")))')).toThrow(
      /paralelas/,
    );
  });
});
