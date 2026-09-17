/**
 * Las prácticas de sucesiones y de estudio local que faltaban.
 *
 * Los boletines de los temas 2 y 4 no tienen ningún problema sin ruta: están
 * todos colocados. Lo que falta aquí son **segundas** prácticas en escalones
 * que solo tienen una, y la única manera honesta de darlas es que un mismo
 * problema del boletín sirva a dos escalones cuando de verdad entrena los dos
 * —casi siempre porque tiene dos apartados que van de cosas distintas—. La
 * nota dice en cada caso qué parte es la que toca.
 *
 * Donde eso no se cumple, el escalón se queda con una sola práctica y su
 * `falta[]` ya lo dice: en el tema 4 el boletín no tiene ni un ejercicio de
 * leer una gráfica, y en el 2 no tiene ninguna telescópica.
 *
 *     node scripts/rampa/t02-t04.mjs
 */
import { insertaPractica } from './inserta.mjs';

const R = (n) => `src/content/preparar/calculo-${n}.yaml`;

const puestas = [
  /* ── tema 2 · sucesiones ────────────────────────────────────────────── */
  [R('1ev'), 'la-definicion', 'desigualdad-en-el-limite',
    'Una demostración formal más, y de las cortas: el épsilon se elige al principio y todo lo demás sale solo. Sirve para practicar el mecanismo sin que la dificultad esté en otra parte.'],
  [R('1ev'), 'unicidad', 'limite-de-no-negativos',
    'La misma estructura que la unicidad —suponer lo contrario y elegir el épsilon que lo rompe— sobre un enunciado más sencillo. Si esta sale, aquella sale.'],
  [R('3ev'), 'negar-convergencias', 'sucesion-tres-tramos',
    'Una sucesión definida por tramos con un pico en medio: hay que decidir crecimiento, acotación y convergencia, y para lo primero el contraejemplo está en el propio pico.'],
  [R('3ev'), 'negar-convergencias', 'creciente-con-limite-cero',
    'Cuatro afirmaciones sobre una sucesión creciente que tiende a cero, y hay que decidir cuáles son ciertas. Se contesta con contraejemplos, que es de lo que va este escalón.'],
  [R('ext'), 'definiciones-de-sucesiones', 'definiciones-formales',
    'Las tres definiciones escritas con cuantificadores. Es el punto de partida: sin tenerlas escritas no se puede despejar nada a partir de ellas.'],
  [R('ext'), 'definiciones-de-sucesiones', 'parametros-supremo-infimo',
    'Y el uso: dos parámetros que se despejan imponiendo el supremo y el ínfimo. Exactamente lo que el escalón dice que hay que saber hacer.'],

  /* ── tema 4 · estudio local ─────────────────────────────────────────── */
  [R('2ev'), 'la-cota', 'taylor-tangente-de-dos-grados',
    'La segunda mitad del enunciado es esta: acotar cuánto se equivoca la aproximación. La primera —calcular el polinomio— ya la has hecho en el escalón anterior.'],
  [R('3ev'), 'aproximar-y-acotar', 'taylor-tangente-de-dos-grados',
    'Aproximar y acotar en el mismo enunciado, que es como lo pide la tercera evaluación: primero el valor, después el resto de Lagrange.'],
  [R('ext'), 'el-polinomio', 'taylor-tangente-de-dos-grados',
    'El polinomio de grado dos escrito a partir de la tangente, que es el de grado uno. Enseña que cada orden añade un término al anterior en vez de empezar de cero.'],
  [R('ord'), 'componer-en-vez-de-derivar', 'taylor-tangente-de-dos-grados',
    'El caso pequeño del mismo atajo: el polinomio de dos grados sale de la tangente sin volver a derivar nada.'],
  [R('ord'), 'la-cota-del-error', 'taylor-tangente-de-dos-grados',
    'Acotar el error de una aproximación concreta, con números. La pregunta inversa —cuántos términos hacen falta— es el otro ejercicio de este escalón.'],
  [R('ext'), 'traducir-antes-de-derivar', 'triangulo-de-area-minima',
    'La geometría que hay que traducir aquí es una recta que pasa por un punto fijo: la incógnita se elige mal de dos maneras distintas y bien de una.'],
  [R('ext'), 'traducir-antes-de-derivar', 'caja-sin-tapa',
    'El clásico: volumen fijo y superficie mínima. La ligadura se despeja y se sustituye, que es el paso que este escalón entrena.'],
  [R('ext'), 'los-que-vienen-disfrazados', 'poster-con-margenes',
    'Un póster con márgenes: el enunciado no dice «optimizar» en ningún sitio y hay que verlo. La ligadura está en el área impresa, no en la total.'],
  [R('ext'), 'los-que-vienen-disfrazados', 'rectangulo-en-semicircunferencia',
    'Un rectángulo dentro de media circunferencia. Lo que lo disfraza es que la ligadura es la propia circunferencia, y conviene parametrizar con el ángulo.'],
  [R('ord'), 'verdadero-o-falso', 'teorema-de-rolle',
    'Tres funciones y las hipótesis de Rolle, una a una. Decidir si el teorema se puede aplicar —y por qué no cuando no— es el mismo trabajo que este escalón pide sobre una gráfica.'],
];

for (const [f, escalon, id, nota] of puestas) {
  insertaPractica(f, escalon, id, nota);
  console.log(`${f.replace('src/content/preparar/', '')} · ${escalon} ← ${id}`);
}
console.log(`\n${puestas.length} prácticas enlazadas`);
