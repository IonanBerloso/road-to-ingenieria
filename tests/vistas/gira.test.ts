/**
 * La media vuelta de una pieza (`lib/vistas/gira.ts`), que da el perfil
 * derecho como el perfil izquierdo de la pieza girada.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';
import { describe, expect, it } from 'vitest';
import { mediaVuelta } from '../../src/lib/vistas/gira.ts';
import { calculaVistas } from '../../src/lib/vistas/motor.ts';
import { compilaPieza, dentro, type PiezaDeclarada } from '../../src/lib/vistas/pieza.ts';
import { GIRADAS, TRONCO_DE_CONO, piezaDeLaEspiga } from './piezas';

const PIEZAS = join(process.cwd(), 'src', 'content', 'piezas');
const DE_LA_COLECCION = readdirSync(PIEZAS)
  .filter((f) => f.endsWith('.yaml'))
  .map((f) => yaml.load(readFileSync(join(PIEZAS, f), 'utf8')) as PiezaDeclarada);

describe('la media vuelta', () => {
  it('dos veces es la pieza', () => {
    for (const d of [piezaDeLaEspiga(), GIRADAS, TRONCO_DE_CONO, ...DE_LA_COLECCION]) expect(mediaVuelta(mediaVuelta(d)), d.codigo).toEqual(d);
  });

  it('pone cada punto en (−x, −y, z): la pertenencia lo dice, también con giros y conos', () => {
    for (const d of [piezaDeLaEspiga(), GIRADAS, TRONCO_DE_CONO, ...DE_LA_COLECCION]) {
      const [p, q] = [compilaPieza(d), compilaPieza(mediaVuelta(d))];
      const c = p.caja;
      let distintos = 0;
      /* Una rejilla de puntos que no caen en ninguna cara entera. */
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          for (let k = 0; k < 9; k++) {
            const x = c.min[0] + ((c.max[0] - c.min[0]) * (i + 0.37)) / 9;
            const y = c.min[1] + ((c.max[1] - c.min[1]) * (j + 0.41)) / 9;
            const z = c.min[2] + ((c.max[2] - c.min[2]) * (k + 0.43)) / 9;
            if (dentro(p, [x, y, z]) !== dentro(q, [-x, -y, z])) distintos++;
          }
        }
      }
      expect(distintos, d.codigo).toBe(0);
    }
  });
});

describe('el perfil derecho, como el izquierdo de la pieza con media vuelta', () => {
  /* Un bloque con un taladro ciego que entra por la cara de la derecha: en
     el perfil izquierdo va oculto; en el derecho se ve de frente. */
  const BLOQUE: PiezaDeclarada = {
    codigo: 'PRUEBA-DERECHO',
    fuente: 'Pieza de prueba de la media vuelta.',
    suma: [{ nombre: 'bloque', caja: [0, 40, 0, 20, 0, 20] }],
    resta: [{ nombre: 'taladro ciego', cilindro: { eje: 'x', centro: [10, 10], r: 4, desde: 25, hasta: 41 } }],
  };

  it('en el izquierdo, el taladro va oculto', () => {
    const v = calculaVistas(compilaPieza(BLOQUE)).vistas.perfil;
    expect(v.tramos.filter((t) => t.de.includes('taladro ciego')).every((t) => t.tipo === 'oculto')).toBe(true);
  });

  it('en el derecho se ve, de frente y en su sitio: u = y, v = −z', () => {
    const v = calculaVistas(compilaPieza(mediaVuelta(BLOQUE))).vistas.perfil;
    const circulo = v.tramos.find((t) => t.forma.tipo === 'arco' && t.forma.hasta - t.forma.desde >= 359.9);
    expect(circulo?.tipo).toBe('visto');
    if (circulo?.forma.tipo !== 'arco') throw new Error('sin circunferencia');
    expect(circulo.forma.c[0]).toBeCloseTo(10, 6);
    expect(circulo.forma.c[1]).toBeCloseTo(-10, 6);
    expect(circulo.forma.r).toBeCloseTo(4, 6);
    expect(v.encuadre).toEqual({ umin: 0, umax: 20, vmin: -20, vmax: 0 });
  });
});
