import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';
import { describe, expect, it } from 'vitest';
import { resuelveEjercicio, type EjercicioConReceta } from '../../src/lib/construir';
import type { DatosLamina } from '../../src/lib/lamina';

/* Todos los ejercicios del corpus que llevan receta, resueltos como los
   resuelve EjercicioGuiado al pintarlos: la receta evaluada sobre su lámina,
   cada paso construir compilado con sus errores construidos a propósito, y
   cada cifra de un calcular atada a la receta comprobada. Es lo mismo que
   rompería el build, en un segundo y sin construir el sitio (como recalcula
   con las cuentas). */

const CONTENIDO = join(process.cwd(), 'src', 'content');
const LAMINAS = join(CONTENIDO, 'laminas');

function ficherosDeEjercicios(): string[] {
  const out: string[] = [];
  for (const asignatura of readdirSync(CONTENIDO, { withFileTypes: true })) {
    if (!asignatura.isDirectory()) continue;
    const base = join(CONTENIDO, asignatura.name);
    for (const d of readdirSync(base, { withFileTypes: true })) {
      if (!d.isDirectory()) continue;
      if (/^t\d\d-/.test(d.name)) out.push(join(base, d.name, 'ejercicios.yaml'));
      if (d.name === 'examenes') {
        for (const ex of readdirSync(join(base, d.name))) out.push(join(base, d.name, ex, 'ejercicios.yaml'));
      }
    }
  }
  return out.filter((f) => existsSync(f));
}

const CON_RECETA = ficherosDeEjercicios().flatMap((f) => {
  const datos = yaml.load(readFileSync(f, 'utf8')) as { ejercicios?: EjercicioConReceta[] };
  return (datos.ejercicios ?? []).filter((e) => e.receta !== undefined).map((e) => ({ fichero: f, e }));
});

describe('los ejercicios con receta del corpus', () => {
  it('hay al menos uno: la guarda no vigila en vacío', () => {
    expect(CON_RECETA.length).toBeGreaterThan(0);
  });

  for (const { e } of CON_RECETA) {
    it(`${e.id} se resuelve sobre su lámina`, () => {
      const fichero = join(LAMINAS, `${e.receta!.lamina}.json`);
      const lamina = existsSync(fichero) ? (JSON.parse(readFileSync(fichero, 'utf8')) as DatosLamina) : undefined;
      expect(() => resuelveEjercicio(e, lamina)).not.toThrow();
    });
  }
});
