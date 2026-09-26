/**
 * Cuántos ejercicios trae el cuadernillo de una convocatoria.
 *
 * No es lo mismo que cuántas resoluciones ofrece el sitio. En Térmica un
 * ejercicio tiene cinco apartados que cruzan tres temas y se parte en varias
 * piezas guiadas, así que contar entradas publicaría «7 ejercicios» de un
 * examen que tiene tres. Cuando las entradas declaran su `n`, manda el número
 * de `n` distintos; si no, las dos cifras coinciden.
 *
 * POR QUÉ ES UN FICHERO. La regla estaba escrita tres veces —en `Examen.astro`,
 * en el índice de exámenes y en la meta de cada convocatoria—, y de dos
 * maneras distintas que daban lo mismo por casualidad de la aritmética. Unida
 * el 26 de septiembre de 2026 (Regla 0): la siguiente copia que cambiara sola
 * publicaría un número distinto en cada página.
 */
export function ejerciciosDelCuadernillo(ejercicios: readonly { n?: number | null }[]): number {
  const numeros = new Set(ejercicios.map((e) => e.n).filter((n): n is number => n != null));
  return numeros.size > 0 ? numeros.size : ejercicios.length;
}
