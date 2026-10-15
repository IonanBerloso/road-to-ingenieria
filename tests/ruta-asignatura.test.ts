import { describe, expect, it } from 'vitest';
import { rutaAsignatura } from '../src/lib/rutas';

/* Adonde lleva el nombre de la asignatura en la cabecera de sus páginas: al
 * ancla de su ficha en la portada. Del 14 al 15 de octubre de 2026 una
 * asignatura que en la portada es solo un botón (`portada: 'boton'`) no tenía
 * ficha y llevaba a su página; desde el 15 la tiene, como las demás, y que su
 * ancla abra de verdad esa ficha lo comprueba `humo.mjs` en un navegador. */
describe('rutaAsignatura', () => {
  it('lleva al ancla de su ficha en la portada', () => {
    expect(rutaAsignatura('calculo')).toMatch(/\/#calculo$/);
  });

  it('también la de una asignatura que en la portada es solo un botón', () => {
    expect(rutaAsignatura('elasticidad-resistencia')).toMatch(/\/#elasticidad-resistencia$/);
  });
});
