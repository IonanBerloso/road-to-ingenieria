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

/**
 * Las formas en que el corpus escribe un número dentro de un vector o de una
 * matriz: entero, decimal, fracción y raíz —«-5/3», «2.4494897», «1/√10»,
 * «3√2/2»—. Nada más: esto no es un intérprete de expresiones, y si aparece
 * una forma nueva conviene que falle en vez de adivinar.
 */
function termino(t: string): number {
  const m = /^(-?)(\d+(?:\.\d+)?)?(?:√(\d+(?:\.\d+)?))?$/.exec(t.trim());
  if (!m || (!m[2] && !m[3])) throw new Error(`no sé leer el número «${t}»`);
  const signo = m[1] === '-' ? -1 : 1;
  const coef = m[2] ? Number(m[2]) : 1;
  const raiz = m[3] ? Math.sqrt(Number(m[3])) : 1;
  return signo * coef * raiz;
}

function numero(t: string): number {
  const s = t.trim().replace(',', '.');
  const partes = s.split('/');
  if (partes.length === 2) return termino(partes[0]) / termino(partes[1]);
  if (partes.length !== 1) throw new Error(`no sé leer el número «${t}»`);
  return termino(s);
}

/** «(1, -1, 2)» → [1, -1, 2]. También sin paréntesis. */
export const vector = (t: string): number[] =>
  t.replace(/^[([{]|[)\]}]$/g, '').split(',').map(numero);

/** «[1, 2; 3, 4]» → [[1,2],[3,4]]. También sin corchetes. */
export const matriz = (t: string): number[][] =>
  t.replace(/^[([{]|[)\]}]$/g, '').split(';').map(vector);

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
  /** El paso `titulo` del ejercicio `id`, o un error que dice cuáles hay. */
  function busca(id: string, titulo: string) {
    const ej = porId.get(id);
    if (!ej) throw new Error(`no existe el ejercicio ${id} en ${carpeta}`);
    const paso = (ej.pasos ?? []).find((p) => p.titulo === titulo);
    if (!paso)
      throw new Error(
        `no existe el paso «${titulo}» en ${id}. Los que hay: ` +
          (ej.pasos ?? []).map((p) => p.titulo ?? '(sin título)').join(' · '),
      );
    if (!paso.respuesta?.valor) throw new Error(`el paso «${titulo}» de ${id} no declara valor`);
    return { valor: String(paso.respuesta.valor), tol: paso.respuesta.tolerancia ?? 0 };
  }

  /** Un número. */
  function cuadra(id: string, titulo: string, calculado: number) {
    const { valor, tol } = busca(id, titulo);
    const publicado = numero(valor);
    expect(
      Math.abs(calculado - publicado),
      `${id} · ${titulo}: recalculado ${calculado}, publicado ${publicado} (tolerancia ${tol})`,
    ).toBeLessThanOrEqual(tol);
  }

  /** Una lista de números, componente a componente y en el mismo orden. */
  cuadra.vector = (id: string, titulo: string, calculado: number[]) => {
    const { valor, tol } = busca(id, titulo);
    const publicado = vector(valor);
    expect(calculado.length, `${id} · ${titulo}: ${calculado.length} componentes contra ${publicado.length}`)
      .toBe(publicado.length);
    publicado.forEach((v, i) =>
      expect(
        Math.abs(calculado[i] - v),
        `${id} · ${titulo}: componente ${i + 1} recalculada ${calculado[i]}, publicada ${v}`,
      ).toBeLessThanOrEqual(tol),
    );
  };

  /** Una matriz, fila a fila. */
  cuadra.matriz = (id: string, titulo: string, calculado: number[][]) => {
    const { valor, tol } = busca(id, titulo);
    const publicado = matriz(valor);
    expect(calculado.length, `${id} · ${titulo}: ${calculado.length} filas contra ${publicado.length}`)
      .toBe(publicado.length);
    publicado.forEach((fila, i) =>
      fila.forEach((v, j) =>
        expect(
          Math.abs(calculado[i][j] - v),
          `${id} · ${titulo}: elemento (${i + 1},${j + 1}) recalculado ${calculado[i][j]}, publicado ${v}`,
        ).toBeLessThanOrEqual(tol),
      ),
    );
  };

  /** Un conjunto: los mismos números, sin importar el orden. */
  cuadra.conjunto = (id: string, titulo: string, calculado: number[]) => {
    const { valor, tol } = busca(id, titulo);
    const publicado = vector(valor).sort((a, b) => a - b);
    const mio = [...calculado].sort((a, b) => a - b);
    expect(mio.length, `${id} · ${titulo}: ${mio.length} elementos contra ${publicado.length}`)
      .toBe(publicado.length);
    publicado.forEach((v, i) =>
      expect(
        Math.abs(mio[i] - v),
        `${id} · ${titulo}: elemento ${i + 1} recalculado ${mio[i]}, publicado ${v}`,
      ).toBeLessThanOrEqual(tol),
    );
  };

  return cuadra;
}
