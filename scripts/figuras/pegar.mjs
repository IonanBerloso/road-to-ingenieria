/**
 * Pega una figura generada dentro de su paso `dibujar`.
 *
 * Se hace sobre el texto y no volcando el YAML entero porque volcarlo
 * reescribe los cien bloques literales del fichero —los enunciados, las
 * resoluciones, los mensajes— y un `git diff` de tres mil líneas para añadir
 * una figura es un diff que nadie revisa.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { paraYaml } from './lienzo.mjs';

/**
 * @param {string} fichero   ruta del `ejercicios.yaml`
 * @param {string} idEj      id del ejercicio
 * @param {string} svg       el SVG ya generado
 * @param {number} cual      qué paso `dibujar` del ejercicio, 0 el primero
 */
export function pega(fichero, idEj, svg, cual = 0) {
  const lineas = readFileSync(fichero, 'utf8').split('\n');

  const inicio = lineas.findIndex((l) => l === `  - id: ${idEj}`);
  if (inicio < 0) throw new Error(`${fichero}: no está el ejercicio ${idEj}`);

  let fin = lineas.length;
  for (let i = inicio + 1; i < lineas.length; i++) {
    if (/^  - id: /.test(lineas[i])) { fin = i; break; }
  }

  let visto = -1;
  for (let i = inicio; i < fin; i++) {
    if (!/^      - tipo: dibujar\s*$/.test(lineas[i])) continue;
    visto++;
    if (visto !== cual) continue;

    /* Si ya tiene figura no se pisa: sobrescribir una figura revisada a mano
       con una recién generada es perder trabajo sin avisar. */
    for (let j = i + 1; j < fin && /^        \S/.test(lineas[j]); j++) {
      if (/^        figura: \|/.test(lineas[j])) {
        throw new Error(`${idEj}: el paso ${cual} ya tiene figura`);
      }
      if (/^      - /.test(lineas[j])) break;
    }

    const bloque = ['        figura: |', ...paraYaml(svg, 10).split('\n')];
    lineas.splice(i + 1, 0, ...bloque);
    writeFileSync(fichero, lineas.join('\n'));
    return;
  }

  throw new Error(`${fichero}: ${idEj} no tiene un paso dibujar número ${cual}`);
}
