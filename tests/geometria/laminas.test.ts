import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { laminaDe, problemasDeLamina, type DatosLamina } from '../../src/lib/lamina';

/* Las láminas de src/content/laminas: que cada una está bien formada y que da
   a la receta lo que la receta nombra. El esquema de content.config.ts usa la
   misma comprobación en el build; aquí se prueba sin construir el sitio. */

const CARPETA = join(process.cwd(), 'src', 'content', 'laminas');
const LAMINAS: { id: string; datos: DatosLamina }[] = readdirSync(CARPETA)
  .filter((f: string) => f.endsWith('.json'))
  .map((f: string) => ({ id: f.replace(/\.json$/, ''), datos: JSON.parse(readFileSync(join(CARPETA, f), 'utf8')) as DatosLamina }));

const BASE: DatosLamina = {
  codigo: 'SD0',
  pagina: 1,
  ejercicio: 1,
  encuadre: { x: 0, y: 0, w: 100, h: 100 },
  puntos: { A2: { x: 10, y: 10, marca: 'cruz', rotulo: 'A₂' } },
  segmentos: [{ nombre: 'r2', a: [0, 50], b: [100, 50], tipo: 'c' }],
};

describe('una lámina sin segmentos', () => {
  it('vale si tiene alguna cruz, como SD23', () => {
    const cruces: DatosLamina = { ...BASE, segmentos: [] };
    expect(problemasDeLamina(cruces)).toEqual([]);
  });

  it('no vale si tampoco tiene cruces: no hay nada que dibujar', () => {
    const vacia: DatosLamina = { ...BASE, segmentos: [], puntos: { A2: { x: 10, y: 10 } } };
    expect(problemasDeLamina(vacia).join(' ')).toMatch(/nada que dibujar/);
  });
});

describe('las láminas de la colección', () => {
  it('hay al menos una, y cada fichero se llama como su código', () => {
    expect(LAMINAS.length).toBeGreaterThan(0);
    for (const { id, datos } of LAMINAS) expect(id).toBe(datos.codigo.toLowerCase());
  });

  for (const { id, datos } of LAMINAS) {
    it(`${id} está bien formada`, () => {
      expect(problemasDeLamina(datos)).toEqual([]);
    });
  }

  it('SD1 da a su receta los cuatro vértices del tejado en las dos vistas, P₂, el suelo y los bordes', () => {
    const sd1 = LAMINAS.find((l) => l.id === 'sd1');
    expect(sd1).toBeDefined();
    const l = laminaDe(sd1!.datos);
    for (const v of ['L', 'T', 'R', 'B']) {
      expect(l.puntos[`${v}1`], `${v}1`).toBeDefined();
      expect(l.puntos[`${v}2`], `${v}2`).toBeDefined();
      /* Las dos proyecciones de un vértice, en la misma vertical. */
      expect(l.puntos[`${v}1`][0]).toBeCloseTo(l.puntos[`${v}2`][0], 6);
    }
    expect(l.puntos.P2).toEqual([309.12, 228.24]);
    for (const s of ['suelo', 'LT1', 'TR1', 'RB1', 'BL1']) expect(l.segmentos[s], s).toBeDefined();
  });
});

describe('lo que la comprobación de una lámina caza', () => {
  it('una lámina bien formada no tiene problemas', () => {
    expect(problemasDeLamina(BASE)).toEqual([]);
  });

  it('dos segmentos con el mismo nombre', () => {
    const d = { ...BASE, segmentos: [...BASE.segmentos, { nombre: 'r2', a: [0, 60], b: [100, 60], tipo: 'c' } as const] };
    expect(problemasDeLamina(d)).toContain('hay dos segmentos que se llaman «r2»');
  });

  it('un punto o un segmento fuera del encuadre, y un segmento de longitud cero', () => {
    const d: DatosLamina = {
      ...BASE,
      puntos: { ...BASE.puntos, Z: { x: 150, y: 10 } },
      segmentos: [...BASE.segmentos, { a: [10, 10], b: [10, 10], tipo: 'o' }, { a: [0, 0], b: [120, 0], tipo: 'c' }],
    };
    expect(problemasDeLamina(d)).toEqual([
      'el punto «Z» (150, 10) cae fuera del encuadre',
      'el segmento 2 tiene longitud cero',
      'el segmento 3 se sale del encuadre',
    ]);
  });

  it('una marca sin rótulo', () => {
    const d: DatosLamina = { ...BASE, puntos: { A2: { x: 10, y: 10, marca: 'cruz' } } };
    expect(problemasDeLamina(d)).toEqual(['el punto «A2» lleva marca y no rótulo: lo que se dibuja se rotula']);
  });

  it('a la receta solo llegan los segmentos con nombre', () => {
    const d: DatosLamina = { ...BASE, segmentos: [...BASE.segmentos, { a: [0, 70], b: [100, 70], tipo: 'c' }] };
    expect(Object.keys(laminaDe(d).segmentos)).toEqual(['r2']);
    expect(laminaDe(d).puntos).toEqual({ A2: [10, 10] });
  });
});
