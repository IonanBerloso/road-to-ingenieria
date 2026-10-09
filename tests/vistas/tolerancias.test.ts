/**
 * Las holguras del motor de vistas guardan un orden: cada una tiene que
 * caber holgada dentro de la siguiente. Si alguien cambia una de base, aquí
 * se ve qué derivada deja de tener sentido.
 */
import { describe, expect, it } from 'vitest';
import * as T from '../../src/lib/vistas/tolerancias.ts';

describe('las holguras de lib/vistas, en orden', () => {
  it('el ruido de las cuentas, por debajo de todo lo que se mide', () => {
    expect(T.CASI_CERO).toBeLessThan(T.HOLGURA_NUMERICA);
    expect(T.HOLGURA_NUMERICA).toBeLessThan(T.TOL_EXACTA);
    expect(1 / T.REDONDEO).toBeLessThanOrEqual(T.HOLGURA_NUMERICA);
  });

  it('lo exacto, lo muestreado, lo que se funde y lo que se ve', () => {
    expect(T.TOL_EXACTA).toBeLessThan(T.LARGO_MINIMO);
    expect(T.FLECHA_MAXIMA).toBeLessThan(T.TOL_MUESTREADA);
    expect(T.TOL_CONTACTO).toBeGreaterThanOrEqual(T.FLECHA_MAXIMA);
    expect(T.TOL_MUESTREADA).toBeLessThan(T.TOL_FUSION);
    expect(T.TOL_FUSION).toBeLessThan(T.ASTILLA);
    expect(T.ASTILLA).toBeLessThan(T.DESCARTE_MINIMO);
  });

  it('la sonda y el rayo, a la escala de la erosión', () => {
    expect(T.SONDA).toBe(T.EROSION);
    expect(T.DESDE).toBeGreaterThan(T.EROSION);
    expect(T.ESPESOR_MINIMO).toBeGreaterThanOrEqual(2 * T.SONDA);
    expect(T.CRUCE).toBeLessThan(T.SONDA);
    /* La sonda de orientación, por su cuenta: por encima del ruido y por
       debajo de la holgura de «pasa por», de la que no se deriva. */
    expect(T.CRUCE).toBeGreaterThan(T.HOLGURA_NUMERICA);
    expect(T.CRUCE).toBeLessThan(T.TOL_EXACTA);
  });

  it('los ángulos: la cuerda de una polilínea cabe en el de contener, y el singular en el llano', () => {
    expect(T.ANGULO_CONTIENE).toBeGreaterThan(180 / T.GENERATRICES);
    expect(T.ANGULO_SINGULAR).toBeLessThan(T.ANGULO_LLANO);
  });

  it('la bisección baja de un paso de muestreo al redondeo', () => {
    expect(T.PASO_MUESTREO / 2 ** T.BISECCIONES).toBeLessThan(1 / T.REDONDEO);
  });
});
