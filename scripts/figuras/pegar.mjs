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

/**
 * Pega una figura al final de un campo de texto del ejercicio.
 *
 * Los ejemplos de entrada de recintos, regiones y sólidos casi nunca tienen un
 * paso `dibujar` —no se les pide dibujar, se les pide entender qué hay
 * dibujado—, así que su figura va donde la va a buscar quien estudia: al final
 * de la `resolucion`, envuelta como las demás y con su pie.
 *
 * @param {string} fichero   ruta del `ejercicios.yaml`
 * @param {string} idEj      id del ejercicio
 * @param {string} campo     `resolucion` o `enunciado`
 * @param {string} svg       el SVG ya generado
 * @param {string} pie       el `<figcaption>`, una línea
 */
export function pegaEnCampo(fichero, idEj, campo, svg, pie) {
  const lineas = readFileSync(fichero, 'utf8').split('\n');

  const inicio = lineas.findIndex((l) => l === `  - id: ${idEj}`);
  if (inicio < 0) throw new Error(`${fichero}: no está el ejercicio ${idEj}`);

  let fin = lineas.length;
  for (let i = inicio + 1; i < lineas.length; i++) {
    if (/^  - id: /.test(lineas[i])) { fin = i; break; }
  }

  /* La barra del bloque literal va entre corchetes: escrita como `\|` dentro
     de una plantilla se queda en `|` a secas, que en una expresión regular es
     una alternancia con el vacío y casa con cualquier línea. Costó una tanda
     de veintitrés figuras pegadas justo debajo del `titulo`. */
  const cabecera = lineas.findIndex(
    (l, i) => i > inicio && i < fin && new RegExp(`^ {4}${campo}: [|]`).test(l),
  );
  if (cabecera < 0) throw new Error(`${idEj}: no tiene ${campo} como bloque literal`);

  /* El bloque acaba en la primera línea con contenido a sangría de 4 o menos. */
  let cierre = fin;
  for (let i = cabecera + 1; i < fin; i++) {
    if (lineas[i].trim() === '') continue;
    if (/^ {0,4}\S/.test(lineas[i])) { cierre = i; break; }
  }
  /* Y se recortan las líneas en blanco del final del bloque. */
  while (cierre > cabecera + 1 && lineas[cierre - 1].trim() === '') cierre--;

  if (lineas.slice(cabecera, cierre).join('\n').includes('<svg')) {
    throw new Error(`${idEj}: ${campo} ya lleva una figura`);
  }

  const bloque = [
    '',
    '      <figure class="figura-examen">',
    ...paraYaml(svg, 6).split('\n'),
    `      <figcaption>${pie}</figcaption>`,
    '      </figure>',
  ];
  lineas.splice(cierre, 0, ...bloque);
  writeFileSync(fichero, lineas.join('\n'));
}
