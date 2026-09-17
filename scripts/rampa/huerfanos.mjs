/**
 * Coloca los siete ejercicios de examen que no estaban en ningún escalón.
 *
 * Los seis primeros son la pregunta de complejos de las convocatorias de
 * **segunda** evaluación: el examen de la segunda repite un ejercicio del tema
 * 1, y como la ruta de complejos es la de la primera, se habían quedado sin
 * casa. Eso es un agujero de cobertura, no de rampa: existían, estaban
 * transcritos y no los enlazaba nadie.
 *
 * Al colocarlos se cierran además cuatro escalones que no tenían ejercicio de
 * examen, y se cierran **enlazando lo que hay**, que es la única manera
 * honesta: a `formas` va el que empieza pasando 1+i a polar, a `argumento` el
 * que se resuelve averiguando el argumento de ω, y a `conjugado` el que es
 * literalmente el gemelo de examen de la práctica que ya estaba ahí.
 *
 *     node scripts/rampa/huerfanos.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { insertaPractica } from './inserta.mjs';

const LF = String.fromCharCode(10);

/** Añade un ejercicio de examen al final de la lista de un escalón. */
function insertaExamen(fichero, escalonId, idNuevo, nota) {
  const lineas = readFileSync(fichero, 'utf8').split(LF);
  const cab = lineas.findIndex((l) => l === `      - id: ${escalonId}`);
  if (cab < 0) throw new Error(`${fichero}: no está el escalón ${escalonId}`);
  let fin = lineas.length;
  for (let i = cab + 1; i < lineas.length; i++) {
    if (/^ {0,6}- id: /.test(lineas[i])) { fin = i; break; }
  }
  const lista = lineas.findIndex((l, i) => i > cab && i < fin && l === '        ejercicios:');
  if (lista < 0) throw new Error(`${escalonId}: no tiene lista de ejercicios`);
  if (lineas.slice(lista, fin).some((l) => l.trim() === `- id: ${idNuevo}`)) {
    throw new Error(`${escalonId}: ya tiene ${idNuevo}`);
  }
  let donde = fin;
  while (donde > lista + 1 && lineas[donde - 1].trim() === '') donde--;
  const bloque = [`          - id: ${idNuevo}`, '            nota: >-'];
  for (const l of partir(nota, 66)) bloque.push(`              ${l}`);
  lineas.splice(donde, 0, ...bloque);
  writeFileSync(fichero, lineas.join(LF));
}

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

const R = (r) => `src/content/preparar/calculo-${r}.yaml`;

const enlaces = [
  ['1ev', 'formas', 'ex1516-2ev-1-exponencial-compleja',
    'Un examen entero cuyo primer movimiento es este: para resolver e^{iz} = 1+i '
    + 'hay que escribir 1+i en polar, y de ahí salen el módulo √2 y el argumento π/4 '
    + 'que se meten en el logaritmo. Si ese paso no es automático, el ejercicio se '
    + 'atasca en la primera línea.'],
  ['1ev', 'argumento', 'ex1920-2ev-1-logaritmo-de-modulo-uno',
    'Con |ω| = 1 el logaritmo es i·arg ω y nada más: el ejercicio entero es '
    + 'averiguar el argumento. Y se averigua de la condición de que el cociente sea '
    + 'real, que obliga a que arg ω coincida con el del denominador salvo media '
    + 'vuelta. Dos respuestas, por tanto, y hay que dar las dos.'],
  ['1ev', 'conjugado', 'ex1718-2ev-1-dos-complejos-con-tres-condiciones',
    'Es el gemelo de examen de la práctica de aquí arriba, palabra por palabra: '
    + 'mismas tres condiciones y mismos números. Si acabas de hacerla, esto es '
    + 'comprobar que la sabes hacer en el tiempo del examen.'],
  ['1ev', 'traducir', 'ex1617-2ev-1-cociente-real-o-imaginario',
    'El enunciado más liso que hay de este escalón: «calcular y representar el '
    + 'lugar geométrico». Las dos condiciones dan una recta y una circunferencia, y '
    + 'las dos pasan por los mismos dos puntos; conviene hacerlo después del último '
    + 'escalón del bloque, el del cociente, pero se puede intentar ya.'],
  ['1ev', 'cociente', 'ex1617-2ev-1-cociente-real-o-imaginario',
    'Con la z en el denominador y dos condiciones sobre el mismo cociente. Es el '
    + 'mismo que abre el bloque; aquí se vuelve a él con la herramienta ya montada.'],
  ['1ev', 'demoivre', 'ex1819-2ev-1-potencia-real-negativa',
    'El gemelo de examen de la práctica de arriba. La potencia de módulo y '
    + 'argumento se calcula con De Moivre, y lo que decide el resultado es dónde '
    + 'cae el argumento: en el semieje negativo.'],
  ['1ev', 'giros', 'ex2021-2ev-1-hexagono-regular',
    'Un hexágono en vez de un triángulo, pero el mecanismo es el mismo: el vértice '
    + 'siguiente sale de girar el lado alrededor del vértice común, y girar es '
    + 'multiplicar por un complejo de módulo 1. El enunciado trae figura, así que la '
    + 'mitad del trabajo —saber qué se gira y alrededor de qué— viene hecha.'],
  ['1ev', 'exponencial-y-logaritmo', 'ex1516-2ev-1-exponencial-compleja',
    'La z en el exponente y una respuesta con infinitas soluciones, que además pide '
    + 'representar. Es el ejercicio 1.14 del boletín con otro enunciado.'],
  ['1ev', 'exponencial-y-logaritmo', 'ex1920-2ev-1-logaritmo-de-modulo-uno',
    'Un logaritmo complejo en el que el módulo no aporta nada —vale 1— y todo el '
    + 'trabajo está en el argumento. Sirve para comprobar que la fórmula del '
    + 'logaritmo se usa entendida y no de memoria.'],
  ['5ev', 'cualitativo', 'ex1314-ord-3-taylor-de-una-edo-sin-resolverla',
    'Exactamente lo que este escalón entrena, y en examen: de la ecuación y′ = −2xy '
    + 'y de un punto por el que pasa la solución sale su polinomio de Taylor de '
    + 'grado tres, derivando la propia ecuación. Ni se resuelve la EDO ni hace '
    + 'falta.'],
];

let n = 0;
for (const [ruta, escalon, id, nota] of enlaces) {
  insertaExamen(R(ruta), escalon, id, nota);
  n++;
  console.log(`${ruta}/${escalon} ← ${id}`);
}
console.log(`\n${n} enlaces nuevos`);
