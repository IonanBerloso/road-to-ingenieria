/**
 * Un banco de preguntas de test, listo para pintar: cada texto pasado por el
 * mismo `mate()` que el resto del sitio.
 *
 * Lo leen los dos componentes que usan bancos: `TestDeMinimos`, el simulacro
 * con reloj de Materiales, y `Cuestiones`, la práctica de las diapositivas de
 * Cálculo (fase E3 de la auditoría del 27 de septiembre de 2026). Vivía dentro
 * del primero; con dos lectores habrían sido dos copias de la misma limpieza,
 * y la de los párrafos ya había que saberla (Regla 0).
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { mate } from './markdown.mjs';
import { aTamanoDeFormula } from './banco-texto';

export interface Opcion {
  texto: string;
  correcta?: boolean;
  porque: string;
}

export interface Pregunta {
  id: string;
  bloque: string;
  diapositiva?: number;
  /** Más de una cierta, a propósito (ver el esquema). */
  varias?: boolean;
  pregunta: string;
  figura?: string;
  opciones: Opcion[];
}

export { anclaDeBloque } from './banco-texto';

/** Un texto del banco en HTML de una sola línea.
 *
 *  Las preguntas van dentro de un `<legend>` y las opciones de un `<label>`,
 *  que no admiten párrafos: se quita el `<p>` de fuera, y si un texto trae dos
 *  párrafos se juntan con un salto de línea. Hasta el 26 de septiembre de 2026
 *  los textos viajaban crudos; el banco de Materiales no traía ni fórmulas ni
 *  negritas, así que no se veía nada roto. */
export async function enLinea(texto: string): Promise<string> {
  const html = (await mate(texto)).trim().replace(/<\/p>\s*<p>/g, '<br>');
  const m = /^<p>([\s\S]*)<\/p>$/.exec(html);
  return m ? m[1] : html;
}

/** El banco que se llama `id`, con sus textos ya dibujados. Si no existe, el
 *  build se para diciendo cuál falta: quien lo pide es un MDX o una página, y
 *  un banco que no está es un error de datos, no un caso normal (§03). */
export async function preparaBanco(
  id: string,
  quien: string,
): Promise<{ entrada: CollectionEntry<'banco'>; preguntas: Pregunta[] }> {
  const entrada = (await getCollection('banco')).find((b) => b.id === id);
  if (!entrada) {
    throw new Error(`${quien}: no hay ningún banco que se llame "${id}" en src/content/banco/.`);
  }
  const preguntas = await Promise.all(
    entrada.data.preguntas.map(async (p) => ({
      ...p,
      pregunta: await enLinea(p.pregunta),
      opciones: await Promise.all(
        p.opciones.map(async (o) => ({
          ...o,
          texto: await enLinea(aTamanoDeFormula(o.texto)),
          porque: await enLinea(o.porque),
        })),
      ),
    })),
  );
  return { entrada, preguntas };
}
