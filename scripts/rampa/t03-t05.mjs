/**
 * Las últimas prácticas que el boletín permite colocar.
 *
 * Después de estas, los escalones que sigan con una sola práctica es porque el
 * boletín **no tiene** una segunda que entrene lo suyo: no hay ninguna
 * telescópica, ninguna de leer una gráfica, ninguna de Fermat y ninguna que
 * demuestre Barrow. Eso ya está declarado en el `falta[]` de sus bloques y no
 * se arregla enlazando un problema que va de otra cosa.
 *
 *     node scripts/rampa/t03-t05.mjs
 */
import { insertaPractica } from './inserta.mjs';

const R = (n) => `src/content/preparar/calculo-${n}.yaml`;

const puestas = [
  [R('2ev'), 'inversa', 'dominio-y-rango',
    'El rango es lo que decide: una función tiene inversa donde es inyectiva, y el dominio de la inversa es el rango de la original. Estas seis se hacen antes de despejar nada.'],
  [R('2ev'), 'cerrar-bien', 'rectangulo-en-triangulo-equilatero',
    'Aquí el intervalo está acotado por la propia geometría, así que hay que comprobar también los extremos: con la base en cero o en el lado entero el rectángulo se queda sin área.'],
  [R('2ev'), 'cerrar-bien', 'maximo-con-restriccion',
    'Un punto crítico y dos extremos. El máximo está dentro, pero decirlo hace falta: sin comparar con los bordes, el ejercicio está a medias.'],
  [R('2ev'), 'punto-fijo', 'bolzano-raiz-unica',
    'La función auxiliar es la misma idea: se pasa todo a un lado para tener un cero que buscar. Aquí además hay que probar que es el único, que es el segundo paso de casi todos los de punto fijo.'],
  [R('3ev'), 'los-teoremas', 'teorema-de-lagrange',
    'Tres funciones y las hipótesis del valor medio. Elegir cuál de los cinco teoremas resuelve un enunciado empieza por saber qué pide cada uno, y este los pide uno a uno.'],
  [R('ord'), 'la-tangente-a-una-integral', 'derivar-sin-integrar',
    'La pendiente de esa tangente es la derivada de la función integral, y aquí se calculan seis sin resolver ninguna integral. Es el paso previo, hecho seis veces.'],
];

for (const [f, escalon, id, nota] of puestas) {
  insertaPractica(f, escalon, id, nota);
  console.log(`${f.replace('src/content/preparar/', '')} · ${escalon} ← ${id}`);
}
console.log(`\n${puestas.length} prácticas enlazadas`);
