/**
 * Enlaza los trece ejercicios propios a los escalones que los necesitaban.
 *
 * Son los escalones que la medición de la rampa daba con `pr:0` o `pr:1`: los
 * que saltaban del ejemplo de entrada al ejercicio de examen sin nada en
 * medio. Varios ejercicios sirven a más de un escalón, y no por rellenar: el
 * de la quíntica entrena lo mismo en `2ev/teoremas/bolzano` que en
 * `ord/continuidad/bolzano-disfrazado`, que son el mismo contenido visto desde
 * dos convocatorias.
 *
 *     node scripts/rampa/enlaza-nuevos.mjs
 */
import { insertaPractica } from './inserta.mjs';

const R = (r) => `src/content/preparar/calculo-${r}.yaml`;

const enlaces = [
  ['1ev', 'telescopica', 'telescopica-con-raices',
    'Telescópica y divergente a la vez, que es la combinación que nadie espera. '
    + 'Se racionaliza, sale la diferencia de dos raíces consecutivas, la suma '
    + 'parcial es √(N+1)−1 y se va al infinito. Hazlo antes del examen: el '
    + 'examen da por sabido que telescópica no implica convergente.'],
  ['1ev', 'telescopica', 'telescopica-de-tres-en-tres',
    'El hueco entre los denominadores es 3 en vez de 1, así que al final no '
    + 'sobrevive un término sino tres. Es el único sitio donde se falla una vez '
    + 'descompuesta la fracción, y se falla contando mal.'],

  ['2ev', 'fermat', 'fermat-en-el-borde-del-intervalo',
    'El primero de los dos contraejemplos que hay que saber decir de memoria: '
    + 'un mínimo con derivada 2, legal porque el punto es el borde y no es '
    + 'interior. De aquí sale la regla de que los bordes también son candidatos.'],
  ['2ev', 'fermat', 'fermat-y-el-pico-sin-derivada',
    'El segundo contraejemplo, el de la hipótesis de derivabilidad: |x−2| tiene '
    + 'su mínimo en un punto interior donde no hay derivada. Con el anterior, '
    + 'cubren las tres palabras del enunciado.'],
  ['ext', 'fermat', 'fermat-en-el-borde-del-intervalo',
    'El contraejemplo del borde. Corto, y es la mitad de lo que se pide cuando '
    + 'el examen dice «enuncia el teorema y discute sus hipótesis».'],
  ['ext', 'fermat', 'fermat-y-el-pico-sin-derivada',
    'El contraejemplo del pico. La otra mitad.'],

  ['2ev', 'bolzano', 'bolzano-tres-raices-de-una-quintica',
    'Bolzano usado tres veces en el mismo ejercicio, que es como cae cuando el '
    + 'enunciado pide «al menos tres raíces». Encontrar los cambios de signo es '
    + 'tanteo con enteros pequeños, y conviene haberlo hecho una vez antes del '
    + 'examen.'],
  ['ord', 'bolzano-disfrazado', 'bolzano-tres-raices-de-una-quintica',
    'Mismo mecanismo que los disfrazados, sin disfraz: la función ya viene '
    + 'igualada a cero y lo único que hay que montar son los intervalos. Sirve '
    + 'para separar lo que es Bolzano de lo que es el disfraz.'],
  ['2ev', 'punto-fijo', 'punto-fijo-del-coseno',
    'El punto fijo canónico, cos x = x. Existencia con Bolzano sobre la función '
    + 'auxiliar y unicidad con la monotonía: son dos argumentos distintos y el '
    + 'enunciado pide los dos. Escribir solo uno es media nota.'],

  ['2ev', 'el-polinomio', 'taylor-del-logaritmo-en-uno',
    'Centrado en a=1, no en cero, que es donde se falla: al sustituir hay que '
    + 'elevar el incremento 0,1 y no el 1,1. Lleva además la cota del resto, que '
    + 'forma parte del ejercicio y no es un extra.'],
  ['2ev', 'los-desarrollos', 'componer-tres-desarrollos-conocidos',
    'Un desarrollo dentro de otro, sin derivar la función. Enseña la regla que '
    + 'hace el método rápido: al multiplicar los grados se suman, así que del de '
    + 'dentro solo hace falta el material que puede llegar al orden pedido.'],

  ['2ev', 'leer-la-grafica', 'la-derivada-que-corta-tres-veces',
    'El formato tal cual: lo dibujado es f prima y hay que traducirlo. El punto '
    + 'más alto de la curva no es un máximo de f, y esa confusión es lo que el '
    + 'ejercicio ataca primero.'],
  ['2ev', 'leer-la-grafica', 'de-la-derivada-a-trozos-a-la-funcion',
    'La otra dirección: de la gráfica de f prima al valor de f, acumulando área '
    + 'con signo. Aquí aparece para qué sirve el dato f(0), que sin él la '
    + 'función solo queda determinada salvo una constante.'],
  ['ext', 'cual-deriva-a-cual', 'la-derivada-que-corta-tres-veces',
    'Antes de emparejar gráficas conviene saber leer una sola. Los cortes con el '
    + 'eje son los extremos y los picos son las inflexiones: con eso, emparejar '
    + 'deja de ser adivinar.'],
  ['ord', 'cual-deriva-a-cual', 'la-derivada-que-corta-tres-veces',
    'La lectura básica de una gráfica de derivada, que es lo que hay que tener '
    + 'automatizado antes de ponerse a emparejar.'],
  ['ext', 'el-estudio-completo', 'estudio-completo-de-una-racional',
    'El estudio entero de x²/(x−1), con las dos asíntotas y los dos extremos. '
    + 'Tiene la sorpresa de que el máximo local vale menos que el mínimo local, '
    + 'que es correcto y se explica solo si has entendido que la asíntota parte '
    + 'la gráfica en dos ramas.'],

  ['3ev', 'barrow-demostrado', 'derivar-una-integral-de-limites-variables',
    'Los dos límites variables y un integrando sin primitiva elemental, que es '
    + 'donde el teorema demuestra para qué sirve. Lo que se olvida son el signo '
    + 'menos del límite inferior y los dos factores de la regla de la cadena.'],
  ['3ev', 'barrow-demostrado', 'la-funcion-integral-de-una-funcion-a-trozos',
    'La cara opuesta: qué se rompe cuando el integrando no es continuo. La '
    + 'integral sigue existiendo y F sigue siendo continua; lo que se pierde es '
    + 'la igualdad F′ = f en el punto del salto. Saber decir esto es saber para '
    + 'qué está la hipótesis.'],
];

for (const [ruta, escalon, id, nota] of enlaces) {
  insertaPractica(R(ruta), escalon, id, nota);
  console.log(`${ruta}/${escalon} ← ${id}`);
}
console.log(`\n${enlaces.length} enlaces nuevos`);
