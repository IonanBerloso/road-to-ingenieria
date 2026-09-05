/**
 * Lo común a los ficheros de `tests/verificacion/`: leer del corpus el valor
 * que una convocatoria publica, para poder compararlo con uno recalculado.
 *
 * La clave de todo esto es que el test **no repite el número**. Lo lee del
 * YAML, junto con la tolerancia que el propio corpus declara. Así, si mañana
 * alguien corrige una respuesta y la cuenta deja de salir, el test se pone
 * rojo en vez de seguir en verde con un número copiado que ya no es el de
 * nadie.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import yaml from 'js-yaml';
import { expect } from 'vitest';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

type Paso = {
  titulo?: string;
  respuesta?: { tipo?: string; valor?: string; tolerancia?: number };
};
type Ejercicio = { id: string; pasos?: Paso[] };

/** Todos los ejercicios de una convocatoria, indexados por su id. */
export function convocatoria(asignatura: string, carpeta: string) {
  const f = join(RAIZ, 'src', 'content', asignatura, 'examenes', carpeta, 'ejercicios.yaml');
  const doc = yaml.load(readFileSync(f, 'utf8')) as { ejercicios: Ejercicio[] };
  const porId = new Map(doc.ejercicios.map((e) => [e.id, e]));

  /**
   * Comprueba que `calculado` cae dentro de la tolerancia del paso `titulo`
   * del ejercicio `id`. Si el paso no existe, falla diciendo cuáles hay: un
   * título mal escrito daría un test que pasa sin comprobar nada.
   */
  return function cuadra(id: string, titulo: string, calculado: number) {
    const ej = porId.get(id);
    if (!ej) throw new Error(`no existe el ejercicio ${id} en ${carpeta}`);
    const paso = (ej.pasos ?? []).find((p) => p.titulo === titulo);
    if (!paso)
      throw new Error(
        `no existe el paso «${titulo}» en ${id}. Los que hay: ` +
          (ej.pasos ?? []).map((p) => p.titulo ?? '(sin título)').join(' · '),
      );
    const r = paso.respuesta;
    if (!r?.valor) throw new Error(`el paso «${titulo}» de ${id} no declara valor`);
    const publicado = Number(String(r.valor).replace(',', '.'));
    if (!Number.isFinite(publicado))
      throw new Error(`el valor «${r.valor}» de ${id}/${titulo} no es un número`);
    const tol = r.tolerancia ?? 0;
    expect(
      Math.abs(calculado - publicado),
      `${id} · ${titulo}: recalculado ${calculado}, publicado ${publicado} (tolerancia ${tol})`,
    ).toBeLessThanOrEqual(tol);
  };
}
