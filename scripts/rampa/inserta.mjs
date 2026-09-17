/**
 * Mete un ejercicio en la lista de un escalón, respetando el orden de §14.
 *
 * El orden dentro de un escalón es ejemplo → práctica → examen, y `deuda.mjs`
 * §2 bis lo comprueba. Así que una práctica nueva no se añade al final: se
 * pone justo antes del primer ejercicio de examen, que son los únicos cuyo id
 * empieza por `ex`.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const LF = String.fromCharCode(10);

export function insertaPractica(fichero, escalonId, idNuevo, nota) {
  const lineas = readFileSync(fichero, 'utf8').split(LF);

  const cab = lineas.findIndex((l) => l === `      - id: ${escalonId}`);
  if (cab < 0) throw new Error(`${fichero}: no está el escalón ${escalonId}`);
  let fin = lineas.length;
  for (let i = cab + 1; i < lineas.length; i++) {
    if (/^ {0,6}- id: /.test(lineas[i]) || /^ {2}- id: /.test(lineas[i])) { fin = i; break; }
  }

  const lista = lineas.findIndex((l, i) => i > cab && i < fin && l === '        ejercicios:');
  if (lista < 0) throw new Error(`${escalonId}: no tiene lista de ejercicios`);

  if (lineas.slice(lista, fin).some((l) => l.trim() === `- id: ${idNuevo}`)) {
    throw new Error(`${escalonId}: ya tiene ${idNuevo}`);
  }

  /* Antes del primer ejercicio de examen; si no hay ninguno, al final. */
  let donde = fin;
  for (let i = lista + 1; i < fin; i++) {
    if (/^ {10}- id: ex/.test(lineas[i])) { donde = i; break; }
  }
  while (donde > lista + 1 && lineas[donde - 1].trim() === '') donde--;

  const bloque = [`          - id: ${idNuevo}`];
  if (nota) {
    bloque.push('            nota: >-');
    for (const l of partir(nota, 66)) bloque.push(`              ${l}`);
  }
  lineas.splice(donde, 0, ...bloque);
  writeFileSync(fichero, lineas.join(LF));
}

/** Parte una frase en líneas de como mucho `ancho` caracteres. */
function partir(texto, ancho) {
  const palabras = texto.split(/\s+/);
  const salida = [];
  let linea = '';
  for (const p of palabras) {
    if (linea && (linea + ' ' + p).length > ancho) { salida.push(linea); linea = p; }
    else linea = linea ? linea + ' ' + p : p;
  }
  if (linea) salida.push(linea);
  return salida;
}
