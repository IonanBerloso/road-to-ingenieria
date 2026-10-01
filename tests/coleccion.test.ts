/**
 * La Colección de ejercicios como datos (`src/content/coleccion/`, auditoría
 * del 1 de octubre de 2026). El esquema mira la forma de cada fichero; aquí,
 * lo que no ve porque mira cada fichero por separado:
 *
 * 1. que cada colección se llama como una asignatura del catálogo y cada tema
 *    que nombra es un tema de esa asignatura;
 * 2. que cada lámina ya publicada (`src/content/laminas/`, origen colección)
 *    está en la colección con el mismo número de ejercicio y la misma página,
 *    y que no hay ninguna lámina de la colección sin su ejercicio;
 * 3. la de Expresión Gráfica entera: 55 ejercicios, del 1 al 51 con lámina y
 *    del 52 al 55 de varios apartados, y solo el 54 titulado «Examen».
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { describe, expect, it } from 'vitest';

type Ejercicio = { n: number; codigo?: string; paginas: number[]; pide: string; temas: string[]; titulado?: string };
type Coleccion = { titulo: string; fuente: string; ejercicios: Ejercicio[] };
type Lamina = { codigo: string; pagina: number; ejercicio?: number; origen?: string };

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONT = join(RAIZ, 'src', 'content');
const COLECCIONES = readdirSync(join(CONT, 'coleccion'))
  .filter((f) => f.endsWith('.yaml'))
  .map((f) => ({ asignatura: f.replace(/\.yaml$/, ''), datos: yaml.load(readFileSync(join(CONT, 'coleccion', f), 'utf8')) as Coleccion }));
const LAMINAS = readdirSync(join(CONT, 'laminas'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join(CONT, 'laminas', f), 'utf8')) as Lamina)
  .filter((l) => (l.origen ?? 'coleccion') === 'coleccion');

describe('cada colección', () => {
  for (const { asignatura, datos } of COLECCIONES) {
    it(`${asignatura}: es una asignatura del catálogo, y sus temas son suyos`, () => {
      const catalogo = JSON.parse(readFileSync(join(CONT, 'catalogo', `${asignatura}.json`), 'utf8')) as { temas: { id: string }[] };
      const temas = new Set(catalogo.temas.map((t) => t.id));
      for (const e of datos.ejercicios) for (const t of e.temas) expect(temas.has(t), `ejercicio ${e.n} → ${t}`).toBe(true);
    });
  }
});

describe('la Colección de ejercicios de Expresión Gráfica', () => {
  const eg = COLECCIONES.find((c) => c.asignatura === 'expresion-grafica')!.datos;
  const porCodigo = new Map(eg.ejercicios.filter((e) => e.codigo).map((e) => [e.codigo!, e]));

  it('tiene 55 ejercicios: del 1 al 51 con lámina, del 52 al 55 de varios apartados', () => {
    expect(eg.ejercicios.map((e) => e.n)).toEqual(Array.from({ length: 55 }, (_, i) => i + 1));
    expect(eg.ejercicios.filter((e) => e.codigo).map((e) => e.n)).toEqual(Array.from({ length: 51 }, (_, i) => i + 1));
  });

  it('cada lámina en su página, una por página, de la 2 a la 52', () => {
    expect(eg.ejercicios.filter((e) => e.codigo).map((e) => e.paginas)).toEqual(Array.from({ length: 51 }, (_, i) => [i + 2]));
    expect(eg.ejercicios.filter((e) => !e.codigo).map((e) => e.paginas)).toEqual([[53, 57], [58, 60], [61, 63], [64, 66]]);
  });

  it('solo el 54 se titula «Examen»', () => {
    expect(eg.ejercicios.filter((e) => e.titulado).map((e) => [e.n, e.titulado])).toEqual([[54, 'Examen']]);
  });

  it('cada lámina publicada está en la colección con su número y su página', () => {
    expect(LAMINAS.length).toBeGreaterThan(0);
    for (const l of LAMINAS) {
      const e = porCodigo.get(l.codigo);
      expect(e, `${l.codigo} no está en la colección`).toBeDefined();
      expect(e!.paginas, l.codigo).toEqual([l.pagina]);
      if (l.ejercicio !== undefined) expect(e!.n, l.codigo).toBe(l.ejercicio);
    }
  });
});
