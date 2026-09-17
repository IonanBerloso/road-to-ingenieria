/**
 * Las prácticas del boletín de integración que faltaban en sus escalones.
 *
 * El boletín del tema 5 es el más grande de la asignatura y tenía dieciséis
 * problemas sin ruta, casi todos de área y volumen — que es justo donde los
 * escalones de la extraordinaria no tenían ninguno. Mismo criterio que en
 * complejos: entra la que entrena el `aprendes` del escalón, y donde el
 * boletín no tiene ninguna, el escalón se queda como está.
 *
 *     node scripts/rampa/t05.mjs
 */
import { insertaPractica } from './inserta.mjs';

const R = (n) => `src/content/preparar/calculo-${n}.yaml`;

const puestas = [
  /* ── tercera evaluación ─────────────────────────────────────────────── */
  [R('3ev'), 'arco-y-superficie', 'la-longitud-que-el-boletin-deja-a-medias',
    'Las dos mitades del escalón en un enunciado: la longitud de un arco de parábola y, después, los dos volúmenes que genera la misma elipse según el eje sobre el que gire.'],

  /* ── extraordinaria ─────────────────────────────────────────────────── */
  [R('ext'), 'el-area-entre-curvas', 'la-parabola-entre-sus-dos-tangentes',
    'Tres fronteras en vez de dos: la parábola y sus dos tangentes. Los cortes hay que calcularlos los tres, y el recinto se cierra en pico por abajo.'],
  [R('ext'), 'el-area-entre-curvas', 'entre-la-hiperbola-y-la-bisectriz',
    'Aquí el recinto se cierra en punta por la izquierda y con un lado recto por la derecha, y el área sale con logaritmo mientras que el volumen no.'],
  [R('ext'), 'el-volumen-al-girar', 'area-volumen-y-perimetro-de-un-mismo-dominio',
    'El mismo dominio medido de tres maneras —área, volumen al girar y perímetro— para ver que cada una necesita una integral distinta del mismo dibujo.'],
  [R('ext'), 'el-volumen-al-girar', 'el-area-y-el-volumen-de-la-exponencial',
    'Discos de radio $e^{x}$: el volumen se va casi entero a la mitad derecha porque el radio va al cuadrado. Es el caso donde se ve mejor por qué el método importa.'],
  [R('ext'), 'la-primitiva-primero', 'cinco-integrales-variadas',
    'Cinco integrales **sin método asignado**, que es exactamente la situación del examen: lo primero que hay que resolver es cuál de los cuatro métodos toca.'],
  [R('ext'), 'la-primitiva-primero', 'las-otras-cinco-variadas',
    'Las otras cinco del mismo problema. Tres de los resultados impresos no derivan a la función de partida, y comprobarlo derivando es parte del ejercicio.'],
  [R('ext'), 'las-impropias', 'dos-integrales-impropias',
    'Dos impropias que lo son **por motivos distintos**: una tiene la asíntota dentro del intervalo y la otra el intervalo infinito. Reconocer cuál es cuál es la mitad del ejercicio.'],
  [R('ext'), 'las-impropias', 'impropias-segundo-tipo',
    'Cuatro con la asíntota dentro. En tres de ellas aplicar Barrow como si nada da un número, y el número es falso: por eso hay que partir la integral en el punto malo.'],
];

for (const [f, escalon, id, nota] of puestas) {
  insertaPractica(f, escalon, id, nota);
  console.log(`${f.replace('src/content/preparar/', '')} · ${escalon} ← ${id}`);
}
console.log(`\n${puestas.length} prácticas enlazadas`);
