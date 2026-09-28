/**
 * El reparto de los ejercicios de tema en bloques de diez (fase E4 de la
 * auditoría del 27 de septiembre de 2026).
 *
 * Lo que se protege es la dirección de cada ejercicio: la página del tema, la
 * de cada bloque, las rutas de estudio y la paleta la calculan con estas
 * funciones, y si dos de ellas no casaran un enlace aterrizaría en un bloque
 * donde el ejercicio no está. `verify.mjs` lo caza en el sitio construido; esto
 * lo caza antes, y dice qué cuenta es la que falla.
 */
import { describe, expect, it } from 'vitest';
import {
  POR_PAGINA,
  caminoDeBloque,
  caminoDeEjercicio,
  limitesDeBloque,
  numPaginas,
  paginaDeEjercicio,
  paginaDeIndice,
  rotuloDeBloque,
  tramoDeBloque,
} from '../src/lib/ejercicios';

describe('bloques de diez', () => {
  it('el lugar de un ejercicio dice su bloque', () => {
    expect(POR_PAGINA).toBe(10);
    expect([0, 9, 10, 19, 20].map(paginaDeIndice)).toEqual([1, 1, 2, 2, 3]);
  });

  it('cuántos bloques salen de n ejercicios', () => {
    expect([1, 10, 11, 34, 40].map(numPaginas)).toEqual([1, 1, 2, 4, 4]);
  });

  it('cada ejercicio cae en un solo bloque, y ese bloque lo contiene', () => {
    for (let n = 1; n <= 45; n++) {
      let enBloques = 0;
      for (let p = 1; p <= numPaginas(n); p++) {
        const { desde, hasta } = limitesDeBloque(p, n);
        expect(hasta - desde + 1).toBeLessThanOrEqual(POR_PAGINA);
        enBloques += hasta - desde + 1;
      }
      expect(enBloques).toBe(n);
      for (let i = 0; i < n; i++) {
        const { desde, hasta } = limitesDeBloque(paginaDeIndice(i), n);
        expect(i + 1).toBeGreaterThanOrEqual(desde);
        expect(i + 1).toBeLessThanOrEqual(hasta);
      }
    }
  });
});

describe('direcciones', () => {
  it('el bloque y el ejercicio, sin base ni barra', () => {
    expect(caminoDeBloque('calculo', 't05-integracion', 3)).toBe('calculo/t05-integracion/ejercicios/3');
    expect(caminoDeEjercicio('algebra', 't07-diagonalizacion', 22)).toBe(
      'algebra/t07-diagonalizacion/ejercicios/3',
    );
  });

  it('un ejercicio de tema va a su bloque y uno de examen a su convocatoria', () => {
    expect(paginaDeEjercicio('calculo/t05-integracion/ejercicios', 0)).toBe(
      'calculo/t05-integracion/ejercicios/1',
    );
    expect(paginaDeEjercicio('calculo/t05-integracion/ejercicios', 10)).toBe(
      'calculo/t05-integracion/ejercicios/2',
    );
    expect(paginaDeEjercicio('calculo/examenes/2015-2016-1ev/ejercicios', 14)).toBe(
      'calculo/examenes/2015-2016-1ev',
    );
  });
});

describe('rótulos', () => {
  it('el largo, para el índice y el titular', () => {
    expect(rotuloDeBloque(1, 34)).toBe('del 1 al 10');
    expect(rotuloDeBloque(4, 34)).toBe('del 31 al 34');
    expect(rotuloDeBloque(3, 21)).toBe('el 21');
  });

  it('el corto, para la fila de bloques', () => {
    expect(tramoDeBloque(2, 34)).toBe('11–20');
    expect(tramoDeBloque(4, 34)).toBe('31–34');
    expect(tramoDeBloque(3, 21)).toBe('21');
  });
});
