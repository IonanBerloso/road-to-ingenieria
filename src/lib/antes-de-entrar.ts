/**
 * «Antes de entrar»: qué bloques de una ruta llevan tarjeta, qué texto tiene
 * cada una y cuánto se tarda en leerlas.
 *
 * POR QUÉ ESTÁ AQUÍ Y NO EN LA PÁGINA. La regla la necesitan dos sitios: la
 * página `/[asignatura]/preparar/[evaluacion]/antes-de-entrar`, que solo
 * existe si alguna tarjeta hay, y la página de la ruta, que solo la enlaza
 * entonces. Es el caso de `formulario.ts`, que nació de seis enlaces rotos
 * publicados por una portada que enlazaba sin preguntar: con la regla en dos
 * plantillas, el día que cambie se arregla en una y la otra miente.
 */

/** El último trozo de la URL, debajo de la de la ruta. */
export const SEGMENTO = 'antes-de-entrar';

/** A cuántas palabras por minuto se cuenta la lectura. Es lectura atenta de
 *  texto técnico, no de novela: más deprisa, en la puerta del aula, lo que se
 *  lee no se queda. */
export const PALABRAS_POR_MINUTO = 200;

type ConTarjeta<B extends { antesDeEntrar?: unknown }> = B & {
  antesDeEntrar: NonNullable<B['antesDeEntrar']>;
};

/** Los bloques que llevan tarjeta, en el orden de la ruta: el orden es parte
 *  del contenido de una ruta, y la hoja lo respeta. */
export function tarjetas<B extends { antesDeEntrar?: unknown }>(bloques: readonly B[]): ConTarjeta<B>[] {
  return bloques.filter((b): b is ConTarjeta<B> => b.antesDeEntrar != null);
}

/** Si la ruta tiene hoja de antes de entrar. Basta una tarjeta. */
export function hayAntesDeEntrar(bloques: readonly { antesDeEntrar?: unknown }[]): boolean {
  return tarjetas(bloques).length > 0;
}

/** Todo lo que la tarjeta de un bloque pinta, en su orden: lo que el examen
 *  pide, los pasos y la trampa. Es lo que se lee y lo que se cuenta. */
export function textosDeLaTarjeta(b: {
  pide: string;
  antesDeEntrar?: { pasos: readonly string[]; trampa: string };
}): string[] {
  if (!b.antesDeEntrar) return [];
  return [b.pide, ...b.antesDeEntrar.pasos, b.antesDeEntrar.trampa];
}

/** Cuántas palabras suman unos textos y en cuántos minutos se leen.
 *
 *  Una fórmula cuenta como una palabra, centrada o en línea: el LaTeX de
 *  `\frac{x-y}{2}` son muchos caracteres y se lee de un vistazo. Los minutos
 *  se redondean hacia arriba y nunca bajan de uno, porque «cero minutos» no
 *  es algo que se pueda publicar. */
export function lectura(textos: readonly string[]): { palabras: number; minutos: number } {
  const palabras = textos
    .map((t) => t.replace(/\$\$[\s\S]+?\$\$/g, ' F ').replace(/\$[^$\n]+\$/g, 'F'))
    .reduce((n, t) => n + (t.match(/\S+/g)?.length ?? 0), 0);
  return { palabras, minutos: Math.max(1, Math.ceil(palabras / PALABRAS_POR_MINUTO)) };
}
