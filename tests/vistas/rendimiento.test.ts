/**
 * Lo que tarda el motor de vistas. Una placa de fundición del cuaderno lleva
 * decenas de agujeros, y el motor no puede crecer con el cuadrado de las
 * primitivas: el 9 de octubre de 2026, 80 agujeros tardaban 3,4 s y 40,
 * 0,84 s (cuatro veces, el doble de primitivas). Lo que se comprueba aquí:
 *   · que doblar los agujeros no cuadruplique el tiempo;
 *   · y un techo para 40 agujeros, con mucho margen sobre lo medido, para
 *     que no dependa de la máquina.
 */
import { describe, expect, it } from 'vitest';
import { compilaPieza } from '../../src/lib/vistas/pieza.ts';
import { calculaVistas } from '../../src/lib/vistas/motor.ts';
import { BLOQUE_TALADRADO, placaConAgujeros } from './piezas';

/** Milisegundos que tarda el motor en una pieza, el mejor de dos intentos. */
function tarda(n: number): number {
  const p = compilaPieza(placaConAgujeros(n));
  let mejor = Infinity;
  for (let k = 0; k < 2; k++) {
    const t = performance.now();
    calculaVistas(p);
    mejor = Math.min(mejor, performance.now() - t);
  }
  return mejor;
}

/** El techo para 40 agujeros, en ms: más de tres veces lo medido el 9 de
 *  octubre de 2026 después de quitar lo cuadrático (ver MOTOR-LEEME). */
const TECHO_40 = 1500;

describe('el motor no crece con el cuadrado de las primitivas', () => {
  it('doblar los agujeros, de 40 a 80, no llega a triplicar el tiempo; y 40 caben en el techo', () => {
    calculaVistas(compilaPieza(BLOQUE_TALADRADO)); // calentar el JIT
    const [t40, t80] = [tarda(40), tarda(80)];
    expect(t80 / t40, `40 agujeros: ${t40.toFixed(0)} ms; 80: ${t80.toFixed(0)} ms`).toBeLessThan(3);
    expect(t40).toBeLessThan(TECHO_40);
  }, 120_000);
});
