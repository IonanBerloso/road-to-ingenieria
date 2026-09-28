/**
 * Las dos reglas de texto de los bancos de test que no dependen de Astro, y
 * por eso se pueden probar solas (`tests/banco.test.ts`). Las usa
 * `lib/banco.ts`, que sí lee la colección.
 */

/** El ancla del apartado `id` en la página de cuestiones: la ponen
 *  `Cuestiones.astro` en cada apartado y la página en su carril, y con dos
 *  copias de la regla un punto de «1.2» cambiado en una sola dejaría el
 *  carril apuntando a nada. */
export const anclaDeBloque = (id: string): string => `cq-${id.replace(/\./g, '-')}`;

/** Una opción que es solo una fórmula se dibuja como fórmula en bloque.
 *
 *  En línea, KaTeX encoge las fracciones y las integrales para que quepan en
 *  el renglón, y en una opción como $F(s)=\frac{e^{-2s}-e^{-4s}}{s}$ el
 *  numerador salía ilegible; las diapositivas las ponen grandes. Se arregla
 *  aquí, al pintar, y no escribiendo `\dfrac` en doscientas opciones: una
 *  opción con texto alrededor de la fórmula se queda en línea, porque ahí
 *  una fracción alta separaría los renglones.
 *
 *  En bloque y no en línea con `\displaystyle`, que era como iba hasta el
 *  28 de septiembre de 2026: una fórmula en bloque que no cabe se desplaza de
 *  lado **con su aviso** (`base.css`), y una en línea se corta sin decir
 *  nada. En un móvil, las integrales en esféricas de t07 medían 500 px en un
 *  hueco de 237, y lo que distingue una opción de otra va al final. */
export function aTamanoDeFormula(texto: string): string {
  const m = /^\s*\$([^$]+)\$\s*$/.exec(texto);
  return m ? `$$\n${m[1]}\n$$` : texto;
}
