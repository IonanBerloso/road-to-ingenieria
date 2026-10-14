import { describe, expect, it } from 'vitest';
import { rutaAsignatura } from '../src/lib/rutas';

/* Adonde lleva el nombre de la asignatura en la cabecera de sus páginas.
 * Con ficha en la portada, al ancla de esa ficha; una asignatura que en la
 * portada es solo un botón (`portada: 'boton'` en su catálogo) no tiene ficha
 * a la que volver, y el ancla dejaba al alumno en lo alto de la portada sin
 * nada abierto: lo cazó `verify.mjs` el 14 de octubre de 2026, con veinte
 * páginas de Elasticidad enlazando `/#elasticidad-resistencia`. */
describe('rutaAsignatura', () => {
  it('con ficha en la portada, lleva a su ancla', () => {
    expect(rutaAsignatura('calculo')).toMatch(/\/#calculo$/);
  });

  it('sin ficha en la portada, lleva a la página de la asignatura', () => {
    const r = rutaAsignatura('elasticidad-resistencia', false);
    expect(r).toMatch(/\/elasticidad-resistencia\/$/);
    expect(r).not.toContain('#');
  });
});
