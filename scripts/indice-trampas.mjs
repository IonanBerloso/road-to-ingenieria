/**
 * El índice de las trampas de CLAUDE.md §17, generado a partir de las propias
 * entradas.
 *
 * POR QUÉ EXISTE. §17 pasó de ochocientas líneas el 26 de septiembre de 2026,
 * con más de cincuenta trampas seguidas y sin nada que las enumerara: para
 * saber si una ya estaba había que leerlas todas. El índice es una línea por
 * trampa, con la frase en negrita que la abre, en el mismo orden.
 *
 * Y es una segunda copia de esas frases, que es justo lo que la Regla 0 (§01)
 * prohíbe dejar suelto. Por eso no se escribe a mano: lo genera este guion, y
 * `verify.mjs` usa la misma función para comprobar que sigue al día. Al añadir
 * una trampa, se vuelve a pasar:
 *
 *   npm run trampas
 *
 * Desde el 3 de octubre de 2026 las entradas viven en
 * `docs/porques/17-trampas.md` y en CLAUDE.md §17 queda solo el índice: §17
 * entero eran 72 KB de los 218 que lee cada sesión (`docs/decisiones.md`,
 * «CLAUDE.md en dos niveles»). Las entradas se leen de allí y el índice se
 * escribe aquí.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const MARCA_INI = '<!-- índice de trampas: lo genera un guion a partir de las entradas -->';
export const MARCA_FIN = '<!-- fin del índice de trampas -->';

/** Dónde viven las entradas, relativo a la raíz del repositorio. */
export const ENTRADAS = 'docs/porques/17-trampas.md';

/** La frase en negrita de cada entrada, en orden, sobre las líneas de
 *  `ENTRADAS`. Una entrada es una línea que empieza por «- **» sin sangría; su
 *  frase puede partirse en varias líneas, así que se juntan hasta que se
 *  cierra el `**`. */
export function trampas(lineas) {
  const fin = lineas.length;
  const salida = [];
  for (let i = 0; i < fin; i++) {
    if (!lineas[i].startsWith('- **')) continue;
    let texto = lineas[i].slice(4);
    let j = i;
    while (!texto.includes('**') && j + 1 < fin) texto += ' ' + lineas[++j].trim();
    const cierre = texto.indexOf('**');
    if (cierre < 0) throw new Error(`${ENTRADAS}:${i + 1}: una trampa sin cerrar su negrita`);
    salida.push(texto.slice(0, cierre).trim());
  }
  if (salida.length === 0) throw new Error(`${ENTRADAS} no tiene ninguna trampa`);
  return salida;
}

/** El índice tal como tiene que estar escrito. */
export function indice(lista) {
  return [
    MARCA_INI,
    '',
    `**Las ${lista.length}, en una línea cada una** —el detalle y el porqué, en su entrada de [\`${ENTRADAS}\`](${ENTRADAS}) y en este mismo orden—:`,
    '',
    ...lista.map((t) => `- ${t}`),
    '',
    MARCA_FIN,
  ];
}

/** El índice que hay escrito ahora mismo, o `null` si no hay. */
export function indiceEscrito(lineas) {
  const a = lineas.indexOf(MARCA_INI);
  const b = lineas.indexOf(MARCA_FIN);
  return a >= 0 && b > a ? lineas.slice(a, b + 1) : null;
}

/* Ejecutado directamente, reescribe el índice. */
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
  const F = join(RAIZ, 'CLAUDE.md');
  const lineas = readFileSync(F, 'utf8').split('\n');
  const nuevo = indice(trampas(readFileSync(join(RAIZ, ENTRADAS), 'utf8').split('\n')));
  const a = lineas.indexOf(MARCA_INI);
  const b = lineas.indexOf(MARCA_FIN);
  if (a < 0 || b < a) throw new Error('CLAUDE.md §17 no tiene las marcas del índice: ponlas debajo de su primera frase');
  lineas.splice(a, b - a + 1, ...nuevo);
  writeFileSync(F, lineas.join('\n'));
  console.log(`Índice de §17 al día: ${nuevo.length - 6} trampas.`);
}
