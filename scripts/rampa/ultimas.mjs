/**
 * Las cinco últimas, y por qué no hay una sexta.
 *
 * Después de esta tanda quedan quince escalones de Cálculo con una sola
 * práctica, y los quince por el mismo motivo: **el boletín no tiene una
 * segunda que entrene lo suyo**. No hay ninguna telescópica, ninguna de leer
 * una gráfica de derivada, ninguna de Fermat, ninguna que demuestre Barrow y
 * ninguna de estudio completo de una función. Está declarado en el `falta[]`
 * de esos bloques desde agosto y no se arregla enlazando un problema que va de
 * otra cosa: eso sería subir un recuento y bajar la ruta.
 *
 *     node scripts/rampa/ultimas.mjs
 */
import { insertaPractica } from './inserta.mjs';

const R = (n) => `src/content/preparar/calculo-${n}.yaml`;

const puestas = [
  [R('1ev'), 'formas', 'potencia-doceava',
    'Antes de elevar nada hay que escribir los cuatro factores en polar, y uno de ellos es una raíz cúbica. Ese paso previo —leer la forma de cada uno— es justo lo de este escalón; la potencia viene después.'],
  [R('1ev'), 'argumento', 'raiz-cubica-cociente',
    'El argumento del cociente decide los tres resultados, y hay que dividirlo entre tres sin perder el cuadrante. Es el mismo cuidado de este escalón, aplicado tres veces seguidas.'],
  [R('3ev'), 'funciones-que-no-se-pueden-escribir', 'ecuacion-con-funcion-integral',
    'Aquí la incógnita es el límite de integración, así que hay que derivar la ecuación entera con el teorema fundamental antes de poder despejar. Mismo teorema, usado al revés.'],
  [R('ext'), 'derivar-sin-integrar', 'ecuacion-con-funcion-integral',
    'La versión con incógnita: se deriva la ecuación para sacar $f$, y después se evalúa en el extremo para sacar $a$. Los dos pasos usan el teorema fundamental.'],
  [R('ext'), 'el-polinomio-de-la-integral', 'derivar-sin-integrar',
    'Los coeficientes del desarrollo son las derivadas en el punto, y estas seis se calculan sin resolver ninguna integral. Es la materia prima del polinomio.'],
];

for (const [f, escalon, id, nota] of puestas) {
  insertaPractica(f, escalon, id, nota);
  console.log(`${f.replace('src/content/preparar/', '')} · ${escalon} ← ${id}`);
}
console.log(`\n${puestas.length} prácticas enlazadas`);
