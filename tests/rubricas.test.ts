/**
 * Las rúbricas compartidas (fase D0 de la auditoría del 27 de septiembre de
 * 2026).
 *
 * Un paso `redactar` puede llevar su rúbrica escrita o el id de una de
 * `src/content/rubricas/`. El segundo caso tiene un fallo posible que el
 * esquema no ve, porque el esquema mira cada fichero por separado: un id que
 * no existe. `EjercicioGuiado` rompe la construcción si pasa, pero eso es al
 * final del build; esto lo dice en un segundo y con el ejercicio.
 *
 * Y una regla de contenido: una rúbrica compartida existe para marcar lo que
 * el corrector exige, así que tiene que tener al menos un `minimo`.
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { describe, expect, it } from 'vitest';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONT = join(RAIZ, 'src', 'content');
const DIR_RUBRICAS = join(CONT, 'rubricas');

type Punto = { punto: string; porque: string; minimo?: boolean; peso?: number };
type Paso = { tipo: string; rubrica?: string | Punto[] };
type Ejercicio = { id: string; pasos?: Paso[] };

function* ficherosDeEjercicios(dir: string): Generator<string> {
  for (const nombre of readdirSync(dir)) {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) yield* ficherosDeEjercicios(ruta);
    else if (nombre === 'ejercicios.yaml') yield ruta;
  }
}

const rubricas = new Map<string, { titulo: string; puntos: Punto[] }>();
if (existsSync(DIR_RUBRICAS)) {
  for (const f of readdirSync(DIR_RUBRICAS).filter((n) => n.endsWith('.yaml'))) {
    rubricas.set(f.replace(/\.yaml$/, ''), yaml.load(readFileSync(join(DIR_RUBRICAS, f), 'utf8')) as never);
  }
}

const usos: { ejercicio: string; id: string }[] = [];
for (const f of ficherosDeEjercicios(CONT)) {
  const doc = yaml.load(readFileSync(f, 'utf8')) as { ejercicios?: Ejercicio[] };
  for (const e of doc?.ejercicios ?? []) {
    for (const p of e.pasos ?? []) {
      if (p.tipo === 'redactar' && typeof p.rubrica === 'string') usos.push({ ejercicio: e.id, id: p.rubrica });
    }
  }
}

describe('las rúbricas compartidas', () => {
  it('hay alguna, y algún paso que la usa', () => {
    expect(rubricas.size).toBeGreaterThan(0);
    expect(usos.length).toBeGreaterThan(0);
  });

  it.each(usos.map((u) => [u.ejercicio, u.id]))('%s usa una rúbrica que existe (%s)', (_e, id) => {
    expect(rubricas.has(id), `no hay src/content/rubricas/${id}.yaml`).toBe(true);
  });

  it.each([...rubricas.keys()])('%s marca al menos un mínimo', (id) => {
    expect(rubricas.get(id)!.puntos.some((p) => p.minimo === true)).toBe(true);
  });

  it.each([...rubricas.keys()])('%s la usa algún ejercicio', (id) => {
    expect(usos.some((u) => u.id === id), `nadie usa la rúbrica ${id}`).toBe(true);
  });
});
