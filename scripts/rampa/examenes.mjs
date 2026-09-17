/**
 * Los dos escalones que se quedaban sin ejercicio de examen y sí tenían uno.
 *
 * De los diez escalones de Cálculo que no acaban en examen, ocho son de
 * `suelo` y no acaban en examen **porque el suelo no se examina solo**: nadie
 * pone un ejercicio de «di el módulo de este complejo». Los otros dos sí
 * podían, y aquí se cierran.
 *
 * El de estudio cualitativo de una EDO se queda como está: buscando en las 88
 * convocatorias, la única que dice «sin resolver la ecuación» pregunta el
 * polinomio de McLaurin, que es otra cosa. Eso es un hueco del examen, no de
 * la ruta.
 *
 *     node scripts/rampa/examenes.mjs
 */
import { insertaPractica } from './inserta.mjs';

const R = 'src/content/preparar/calculo-3ev.yaml';

/* `insertaPractica` coloca antes del primer `ex…`; para uno de examen hay que
   ir al final, así que se pasa el id tal cual y el guion lo deja donde toca
   porque el escalón todavía no tiene ninguno. */
const puestas = [
  ['el-area', 'ex2324-3ev-4-area-de-la-elipse',
    'Hazte solo la parte del área. La elipse viene dada por su ecuación y el recinto hay que dibujarlo antes de integrar, que es lo que este escalón entrena; el volumen es del escalón siguiente.'],
  ['el-area', 'ex1718-3ev-5-parabola-recta-y-eje',
    'Tres fronteras —una parábola, una recta y el eje— y hay que decidir cuál va arriba en cada tramo. Es el caso en que el recinto obliga a partir la integral.'],
];

for (const [escalon, id, nota] of puestas) {
  insertaPractica(R, escalon, id, nota);
  console.log(`calculo-3ev.yaml · ${escalon} ← ${id}`);
}
console.log(`\n${puestas.length} ejercicios de examen enlazados`);
