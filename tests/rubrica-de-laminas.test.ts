/**
 * La rúbrica de las láminas de Expresión Gráfica como datos (auditoría de
 * Expresión Gráfica del 8 de octubre de 2026, B8).
 *
 * El esquema mira la forma; esto mira que la transcripción sea la hoja: sus
 * ocho filas en su orden, cuántas líneas tiene cada columna, dónde lleva la
 * hoja su «(1)», y que cada `donde` sea un tema del catálogo. Las cuentas
 * salen de la página leída a mano el 9 de octubre de 2026: si la escuela
 * cambia la rúbrica, este test es el primero que lo dice.
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { describe, expect, it } from 'vitest';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONT = join(RAIZ, 'src', 'content');

type Linea = { texto: string; donde?: string[]; sub?: Linea[] };
type Fila = { id: string; criterio: string; bien: Linea[]; mal: Linea[] };
type Rubrica = { titulo: string; nota: { marca: string; texto: string }; filas: Fila[] };

const rubrica = yaml.load(readFileSync(join(CONT, 'rubrica-de-laminas', 'expresion-grafica.yaml'), 'utf8')) as Rubrica;
const catalogo = JSON.parse(readFileSync(join(CONT, 'catalogo', 'expresion-grafica.json'), 'utf8')) as {
  temas: { id: string }[];
};
const temas = new Set(catalogo.temas.map((t) => t.id));

/** Cada línea y sus guiones, en el orden de la hoja. */
const todas = (ls: Linea[]): Linea[] => ls.flatMap((l) => [l, ...(l.sub ?? [])]);

/** Fila, líneas de BIEN, líneas de MAL (cada línea con guiones cuenta como
 *  una, y sus guiones aparte). */
const HOJA: [string, number, number, number][] = [
  ['Cajetín y textos', 4, 3, 0],
  ['Escala', 2, 3, 0],
  ['Solución y proceso', 7, 7, 6],
  ['Líneas', 4, 4, 0],
  ['Presentación', 5, 5, 0],
  ['Tiempo', 2, 2, 0],
  ['Actitud', 5, 5, 0],
  ['General', 1, 1, 0],
];

describe('la rúbrica de las láminas de Expresión Gráfica', () => {
  it('tiene las ocho filas de la hoja, en su orden', () => {
    expect(rubrica.filas.map((f) => f.criterio)).toEqual(HOJA.map(([c]) => c));
  });

  it.each(HOJA)('«%s»: %i líneas de BIEN y %i de MAL, y %i guiones en cada columna', (criterio, bien, mal, guiones) => {
    const f = rubrica.filas.find((x) => x.criterio === criterio)!;
    expect(f.bien).toHaveLength(bien);
    expect(f.mal).toHaveLength(mal);
    expect(f.bien.flatMap((l) => l.sub ?? [])).toHaveLength(guiones);
    expect(f.mal.flatMap((l) => l.sub ?? [])).toHaveLength(guiones);
  });

  it('la nota «(1)» sale en las tres líneas de BIEN donde la imprime la hoja, y en ninguna de MAL', () => {
    const conMarca = rubrica.filas.flatMap((f) => todas(f.bien)).filter((l) => l.texto.includes(rubrica.nota.marca));
    expect(conMarca.map((l) => l.texto.slice(0, 20))).toEqual([
      'Cajetín ampliado ord',
      'Aplicación de normas',
      'Trazado a lápiz (se ',
    ]);
    expect(rubrica.filas.flatMap((f) => todas(f.mal)).some((l) => l.texto.includes(rubrica.nota.marca))).toBe(false);
  });

  it('cada guion empieza por «- », como en la hoja, y ninguna línea suelta lo lleva', () => {
    for (const f of rubrica.filas) {
      for (const l of [...f.bien, ...f.mal]) {
        expect(l.texto.startsWith('- '), l.texto).toBe(false);
        for (const s of l.sub ?? []) expect(s.texto.startsWith('- '), s.texto).toBe(true);
      }
    }
  });

  it('sin dobles espacios ni espacios en los bordes: los de la hoja son de su maquetación', () => {
    for (const l of rubrica.filas.flatMap((f) => [...todas(f.bien), ...todas(f.mal)])) {
      expect(l.texto, l.texto).toBe(l.texto.trim());
      expect(l.texto.includes('  '), l.texto).toBe(false);
    }
  });

  it('cada `donde` es un tema del catálogo, y solo lo llevan las líneas de BIEN', () => {
    for (const f of rubrica.filas) {
      for (const l of todas(f.bien)) for (const id of l.donde ?? []) expect(temas.has(id), `${f.criterio}: ${id}`).toBe(true);
      for (const l of todas(f.mal)) expect(l.donde, `${f.criterio}: ${l.texto}`).toBeUndefined();
    }
  });

  it('una línea de BIEN con guiones no lleva `donde`: lo llevan sus guiones', () => {
    for (const l of rubrica.filas.flatMap((f) => f.bien)) {
      if (l.sub) {
        expect(l.donde, l.texto).toBeUndefined();
        for (const s of l.sub) expect(s.donde, s.texto).toBeDefined();
      }
    }
  });
});
