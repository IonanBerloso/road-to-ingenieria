/**
 * El plan por días de una ruta: dónde vive, cómo se nombra y a dónde lleva
 * cada paso.
 *
 * POR QUÉ ESTÁ AQUÍ Y NO EN LA PÁGINA. Por lo mismo que `antes-de-entrar.ts`:
 * lo necesitan la página `/[asignatura]/preparar/[evaluacion]/plan`, que solo
 * existe si la ruta tiene `plan`, y la página de la ruta, que solo la enlaza
 * entonces y dice en su tarjeta para cuántos días hay plan.
 */

/** El último trozo de la URL, debajo de la de la ruta. */
export const SEGMENTO_PLAN = 'plan';

const EN_LETRA = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete'];

/** «Un día», «Dos días»: el título de cada plan. */
export function diasEnTitulo(n: number): string {
  if (n === 1) return 'Un día';
  const letra = EN_LETRA[n] ?? String(n);
  return `${letra[0].toUpperCase()}${letra.slice(1)} días`;
}

/** «uno, dos o tres días», «un día»: los planes que hay, para la tarjeta. */
export function diasDichos(ns: readonly number[]): string {
  const orden = [...ns].sort((a, b) => a - b);
  if (orden.length === 1) return orden[0] === 1 ? 'un día' : `${EN_LETRA[orden[0]] ?? orden[0]} días`;
  const letras = orden.map((n) => EN_LETRA[n] ?? String(n));
  return `${letras.slice(0, -1).join(', ')} o ${letras.at(-1)} días`;
}

type Paso = {
  bloque?: string;
  escalon?: string;
  examen?: { curso: string; convocatoria: string };
  antesDeEntrar?: true;
};

type Bloque = { id: string; titulo: string; escalones?: readonly { id: string; titulo: string }[] };

export type ExamenEnlazable = { curso: string; convocatoria: string; titulo: string; href: string };

export type Destino = { rotulo: string; titulo: string; href: string };

/** A dónde lleva un paso, o `null` si es solo texto. Rompe el build si el
 *  destino no existe: `verify.mjs` no valida los fragmentos de un enlace,
 *  y un escalón mal escrito dejaría al alumno en la cabecera de la ruta. */
export function destinoDelPaso(
  p: Paso,
  donde: {
    ruta: string;
    deLaRuta: string;
    bloques: readonly Bloque[];
    examenes: readonly ExamenEnlazable[];
    antesDeEntrar: string | null;
  },
): Destino | null {
  const falla = (que: string) => new Error(`El plan de la ruta "${donde.ruta}.yaml" lleva a ${que}, que no existe.`);
  if (p.escalon) {
    const es = donde.bloques.flatMap((b) => b.escalones ?? []).find((e) => e.id === p.escalon);
    if (!es) throw falla(`el escalón "${p.escalon}"`);
    return { rotulo: 'escalón', titulo: es.titulo, href: `${donde.deLaRuta}#esc-${es.id}` };
  }
  if (p.bloque) {
    const b = donde.bloques.find((x) => x.id === p.bloque);
    if (!b) throw falla(`el bloque "${p.bloque}"`);
    return { rotulo: 'bloque', titulo: b.titulo, href: `${donde.deLaRuta}#${b.id}` };
  }
  if (p.examen) {
    const { curso, convocatoria } = p.examen;
    const ex = donde.examenes.find((x) => x.curso === curso && x.convocatoria === convocatoria);
    if (!ex) throw falla(`el examen ${curso} · ${convocatoria}`);
    return { rotulo: 'examen', titulo: ex.titulo, href: ex.href };
  }
  if (p.antesDeEntrar) {
    if (!donde.antesDeEntrar) throw falla('la hoja de antes de entrar');
    return { rotulo: 'hoja', titulo: 'Antes de entrar', href: donde.antesDeEntrar };
  }
  return null;
}
