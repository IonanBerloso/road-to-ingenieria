/**
 * Dónde vive cada ejercicio de tema: en una subpágina de diez (fase E4 de la
 * auditoría del 27 de septiembre de 2026).
 *
 * POR QUÉ. La página del tema 5 de Cálculo pesaba 11,5 MB y tardaba unos siete
 * segundos en abrirse en un teléfono con la CPU a un cuarto; diecinueve
 * páginas de tema pasaban de 3 MB. El 97 % de ese peso eran los ejercicios,
 * cada uno con todos sus pasos, su resolución y sus fórmulas dibujadas. La
 * teoría se queda en la página del tema, y los ejercicios van de diez en diez
 * a `…/t05-integracion/ejercicios/1/`, `…/2/`, y así.
 *
 * Diez y no por peso: por número, la dirección de un ejercicio no cambia
 * cuando se reescribe la resolución de otro, y un enlace compartido sigue
 * valiendo. Diez ejercicios del tema más pesado son unos 2 MB.
 *
 * Es la única fuente del reparto: la página del tema, la de cada bloque, las
 * rutas de estudio y el índice de la paleta lo leen de aquí.
 */
export const POR_PAGINA = 10;

/** El bloque, contando desde 1, del ejercicio que ocupa el lugar `i` (desde 0). */
export const paginaDeIndice = (i: number): number => Math.floor(i / POR_PAGINA) + 1;

/** Cuántos bloques salen de `n` ejercicios. */
export const numPaginas = (n: number): number => Math.max(1, Math.ceil(n / POR_PAGINA));

/** El camino de la subpágina, sin base ni barra: `calculo/t05-integracion/ejercicios/3`.
 *  Se pasa por `ruta()` para enlazarlo. */
export const caminoDeBloque = (asignatura: string, tema: string, pagina: number): string =>
  `${asignatura}/${tema}/ejercicios/${pagina}`;

/** El camino del bloque donde vive el ejercicio que ocupa el lugar `i`. */
export const caminoDeEjercicio = (asignatura: string, tema: string, i: number): string =>
  caminoDeBloque(asignatura, tema, paginaDeIndice(i));

/** Dónde vive el ejercicio que ocupa el lugar `i` de un `ejercicios.yaml`,
 *  dado el id del fichero en la colección.
 *
 *  Hay dos formas y solo dos: `calculo/t05-integracion/ejercicios`, de tema,
 *  que va a su bloque, y `calculo/examenes/2015-2016-1ev/ejercicios`, de
 *  examen, que vive entero en la página de su convocatoria —un examen no pasa
 *  de quince ejercicios y no se parte—. Las rutas de estudio y la paleta lo
 *  preguntan aquí: antes cada una quitaba el `/ejercicios` del id por su
 *  cuenta, y con los bloques habrían sido dos copias de la misma regla. */
export function paginaDeEjercicio(idFichero: string, i: number): string {
  const partes = idFichero.split('/');
  if (partes.length === 3 && partes[1] !== 'examenes') return caminoDeEjercicio(partes[0], partes[1], i);
  return partes.slice(0, -1).join('/');
}

/** El primer y el último número, contando desde 1, del bloque `pagina` de un
 *  tema con `total` ejercicios. */
export function limitesDeBloque(pagina: number, total: number): { desde: number; hasta: number } {
  return { desde: (pagina - 1) * POR_PAGINA + 1, hasta: Math.min(pagina * POR_PAGINA, total) };
}

/** «del 11 al 20», o «el 21» si el bloque tiene uno solo. */
export function rotuloDeBloque(pagina: number, total: number): string {
  const { desde, hasta } = limitesDeBloque(pagina, total);
  return desde === hasta ? `el ${desde}` : `del ${desde} al ${hasta}`;
}

/** «11–20», o «21»: el rótulo corto, para la fila de bloques. */
export function tramoDeBloque(pagina: number, total: number): string {
  const { desde, hasta } = limitesDeBloque(pagina, total);
  return desde === hasta ? `${desde}` : `${desde}–${hasta}`;
}
