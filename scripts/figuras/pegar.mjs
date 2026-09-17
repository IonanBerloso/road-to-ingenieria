/**
 * Pega una figura generada dentro del ejercicio al que pertenece.
 *
 * Se hace sobre el texto y no volcando el YAML entero porque volcarlo
 * reescribe los cien bloques literales del fichero —los enunciados, las
 * resoluciones, los mensajes— y un `git diff` de tres mil líneas para añadir
 * una figura es un diff que nadie revisa.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { paraYaml } from './lienzo.mjs';

const CR = String.fromCharCode(13);
const LF = String.fromCharCode(10);

/**
 * Lee el fichero en líneas **sin** el retorno de carro, y devuelve además cómo
 * volver a escribirlas.
 *
 * Unos cuantos `ejercicios.yaml` tienen finales de línea de Windows, y alguno
 * los tiene mezclados. Partir por el salto de línea a secas deja el retorno de
 * carro pegado al final de cada línea, y entonces comparar con
 * `'  - id: loquesea'` no casa nunca: el pegador dice que el ejercicio no
 * existe cuando existe —costó descubrirlo en `2024-2025-2ev`—. Aquí se quita
 * para comparar y se devuelve al escribir, línea a línea, de modo que el
 * fichero conserva exactamente los finales que tenía.
 */
function leeLineas(fichero) {
  const crudas = readFileSync(fichero, 'utf8').split(LF);
  const cr = crudas.map((l) => l.endsWith(CR));
  const lineas = crudas.map((l, i) => (cr[i] ? l.slice(0, -1) : l));

  /** Escribe el resultado; las líneas nuevas heredan el final de su vecina. */
  const escribe = (cuantasNuevas, desde) => {
    const marcas = cr.slice();
    const herencia = cr[Math.max(0, desde - 1)] ?? false;
    if (cuantasNuevas < 0) marcas.splice(desde, -cuantasNuevas);
    else marcas.splice(desde, 0, ...Array.from({ length: cuantasNuevas }, () => herencia));
    writeFileSync(fichero, lineas.map((l, i) => (marcas[i] ? l + CR : l)).join(LF));
  };

  return { lineas, escribe };
}

/**
 * @param {string} fichero   ruta del `ejercicios.yaml`
 * @param {string} idEj      id del ejercicio
 * @param {string} svg       el SVG ya generado
 * @param {number} cual      qué paso `dibujar` del ejercicio, 0 el primero
 */
export function pega(fichero, idEj, svg, cual = 0) {
  const { lineas, escribe } = leeLineas(fichero);

  const inicio = lineas.findIndex((l) => l === `  - id: ${idEj}`);
  if (inicio < 0) throw new Error(`${fichero}: no está el ejercicio ${idEj}`);

  let fin = lineas.length;
  for (let i = inicio + 1; i < lineas.length; i++) {
    if (/^  - id: /.test(lineas[i])) { fin = i; break; }
  }

  let visto = -1;
  for (let i = inicio; i < fin; i++) {
    if (!/^ {6}- tipo: dibujar\s*$/.test(lineas[i])) continue;
    visto++;
    if (visto !== cual) continue;

    /* Si ya tiene figura no se pisa: sobrescribir una figura revisada a mano
       con una recién generada es perder trabajo sin avisar. */
    for (let j = i + 1; j < fin && /^ {8}\S/.test(lineas[j]); j++) {
      if (/^ {8}figura: [|]/.test(lineas[j])) {
        throw new Error(`${idEj}: el paso ${cual} ya tiene figura`);
      }
      if (/^ {6}- /.test(lineas[j])) break;
    }

    const bloque = ['        figura: |', ...paraYaml(svg, 10).split(LF)];
    lineas.splice(i + 1, 0, ...bloque);
    escribe(bloque.length, i + 1);
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
  const { lineas, escribe } = leeLineas(fichero);

  const inicio = lineas.findIndex((l) => l === `  - id: ${idEj}`);
  if (inicio < 0) throw new Error(`${fichero}: no está el ejercicio ${idEj}`);

  let fin = lineas.length;
  for (let i = inicio + 1; i < lineas.length; i++) {
    if (/^  - id: /.test(lineas[i])) { fin = i; break; }
  }

  /* La barra del bloque literal va entre corchetes: escrita como una barra
     escapada dentro de una plantilla se queda en una barra a secas, que en una
     expresión regular es una alternancia con el vacío y casa con cualquier
     línea. Costó una tanda de veintitrés figuras pegadas bajo el `titulo`. */
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

  if (lineas.slice(cabecera, cierre).join(LF).includes('<svg')) {
    throw new Error(`${idEj}: ${campo} ya lleva una figura`);
  }

  const bloque = [
    '',
    '      <figure class="figura-examen">',
    ...paraYaml(svg, 6).split(LF),
    `      <figcaption>${pie}</figcaption>`,
    '      </figure>',
  ];
  lineas.splice(cierre, 0, ...bloque);
  escribe(bloque.length, cierre);
}

/**
 * Añade un paso al final de la lista `pasos:` de un ejercicio.
 *
 * Lo usan los guiones que meten rúbricas nuevas: un paso `redactar` que la
 * asignatura no tenía, escrito a mano y pegado donde le toca.
 */
export function anexaPaso(fichero, idEj, bloque) {
  const { lineas, escribe } = leeLineas(fichero);

  const inicio = lineas.findIndex((l) => l === `  - id: ${idEj}`);
  if (inicio < 0) throw new Error(`${fichero}: no está el ejercicio ${idEj}`);

  let fin = lineas.length;
  for (let i = inicio + 1; i < lineas.length; i++) {
    if (/^  - id: /.test(lineas[i])) { fin = i; break; }
  }

  const cab = lineas.findIndex((l, i) => i > inicio && i < fin && l === '    pasos:');
  if (cab < 0) throw new Error(`${idEj}: no tiene lista de pasos`);

  let cierre = fin;
  for (let i = cab + 1; i < fin; i++) {
    if (lineas[i].trim() === '') continue;
    if (/^ {0,4}\S/.test(lineas[i])) { cierre = i; break; }
  }
  while (cierre > cab + 1 && lineas[cierre - 1].trim() === '') cierre--;

  const nuevas = bloque.split(LF);
  while (nuevas.length && nuevas[nuevas.length - 1] === '') nuevas.pop();
  lineas.splice(cierre, 0, ...nuevas);
  escribe(nuevas.length, cierre);
}

/**
 * Quita la figura que un campo ya tenía, para poder volver a pegarla.
 *
 * Una figura se rehace: se descubre que un rótulo se sale, que una curva
 * miente o que el dibujo se lee mejor de otra manera. Sin esto había que
 * revertir el fichero entero y volver a pasar el generador, y el fichero
 * entero lleva también lo que se escribió a mano.
 */
export function quitaFigura(fichero, idEj, campo) {
  const { lineas, escribe } = leeLineas(fichero);

  const inicio = lineas.findIndex((l) => l === `  - id: ${idEj}`);
  if (inicio < 0) throw new Error(`${fichero}: no está el ejercicio ${idEj}`);
  let fin = lineas.length;
  for (let i = inicio + 1; i < lineas.length; i++) {
    if (/^  - id: /.test(lineas[i])) { fin = i; break; }
  }

  const cab = lineas.findIndex(
    (l, i) => i > inicio && i < fin && new RegExp(`^ {4}${campo}: [|]`).test(l),
  );
  if (cab < 0) throw new Error(`${idEj}: no tiene ${campo} como bloque literal`);

  const abre = lineas.findIndex(
    (l, i) => i > cab && i < fin && l.trim() === '<figure class="figura-examen">',
  );
  if (abre < 0) throw new Error(`${idEj}: ${campo} no lleva ninguna figura`);
  let cierra = -1;
  for (let i = abre + 1; i < fin; i++) {
    if (lineas[i].trim() === '</figure>') { cierra = i; break; }
  }
  if (cierra < 0) throw new Error(`${idEj}: la figura de ${campo} no se cierra`);

  /* Se lleva también la línea en blanco de delante, que puso `pegaEnCampo`. */
  const desde = abre > 0 && lineas[abre - 1].trim() === '' ? abre - 1 : abre;
  lineas.splice(desde, cierra - desde + 1);
  escribe(-(cierra - desde + 1), desde);
}
