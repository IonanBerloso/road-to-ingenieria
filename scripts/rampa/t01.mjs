/**
 * Las prácticas del boletín de complejos que faltaban en sus escalones.
 *
 * El criterio es el de §14 y no es «rellenar»: una práctica entra en un
 * escalón si entrena **su** `aprendes`, y si el boletín no tiene ninguna que
 * lo haga, el escalón se queda como está y se dice. Tres escalones de
 * `regiones` apuntan al mismo ejercicio del boletín —el de las ocho
 * regiones— y eso no es pereza: ese ejercicio tiene ocho apartados y cada uno
 * es de una familia distinta. La nota dice cuál toca en cada caso.
 *
 *     node scripts/rampa/t01.mjs
 */
import { insertaPractica } from './inserta.mjs';

const R = (n) => `src/content/preparar/calculo-${n}.yaml`;

const puestas = [
  /* ── primera evaluación ─────────────────────────────────────────────── */
  [R('1ev'), 'traducir', 'ocho-regiones-del-boletin',
    'Los cuatro primeros apartados son exactamente las cuatro frases de este escalón: una recta horizontal, un semiplano, una circunferencia y un disco. Se dibujan sin calcular nada, que es lo que se entrena aquí.'],
  [R('1ev'), 'apolonio', 'ocho-regiones-del-boletin',
    'Hazte solo el apartado (f). Es la única Apolonio del boletín, y viene camuflada entre siete regiones que salen a ojo: reconocerla es medio ejercicio.'],
  [R('1ev'), 'parabola', 'ocho-regiones-del-boletin',
    'Hazte solo el apartado (g). Módulo más parte real igual a una constante: la forma que siempre da parábola, y aquí abre hacia la izquierda.'],
  [R('1ev'), 'arco-capaz', 'cuatro-regiones-de-argumento',
    'Los apartados (c) y (d) son arcos capaces; los dos primeros son sectores con vértice en el origen. Distinguir de qué tipo es cada uno antes de dibujar es el ejercicio entero.'],
  [R('1ev'), 'elipse', 'entre-dos-elipses-confocales',
    'Dos elipses con los mismos focos y una corona entre ellas. Los semiejes salen de la suma de distancias sin desarrollar nada, que es lo que este escalón entrena.'],
  [R('1ev'), 'elipse', 'media-elipse-cortada-por-el-eje',
    'La elipse está centrada fuera del origen y el corte con el eje hay que calcularlo. Enseña que el arco que queda no tiene por qué ser la mitad.'],
  [R('1ev'), 'cociente', 'la-recta-y-la-circunferencia-de-un-cociente',
    'Los dos casos de un tirón: cuándo el cociente cae en el eje real —una recta— y cuándo es imaginario puro —una circunferencia—. Se racionaliza una vez y se leen las dos condiciones.'],

  /* ── extraordinaria ─────────────────────────────────────────────────── */
  [R('ext'), 'lugares-y-regiones', 'ocho-regiones-del-boletin',
    'Ocho regiones seguidas, de la recta a la elipse pasando por una Apolonio. Es el repaso más rápido que hay de todo este bloque.'],
  [R('ext'), 'lugares-y-regiones', 'cuatro-regiones-de-argumento',
    'Y las cuatro de argumento: dos sectores y dos arcos capaces. Lo que hay que decidir antes de dibujar es de cuál de los dos tipos se trata.'],
  [R('ext'), 'exponencial-logaritmo-y-seno', 'seis-ecuaciones-en-el-plano-complejo',
    'Seis ecuaciones que en los reales no tendrían solución —un seno que vale menos tres, un coseno que vale dos, una exponencial negativa— y en los complejos sí. Es el boletín entero de este escalón en un solo ejercicio.'],

  /* ── ordinaria ──────────────────────────────────────────────────────── */
  [R('ord'), 'condiciones-sobre-un-complejo', 'la-recta-y-la-circunferencia-de-un-cociente',
    '«Está en el eje real» y «es imaginario puro» escritas sobre un cociente. Racionalizar y leer la parte que se anula es exactamente lo que pide este escalón.'],
  [R('ord'), 'lugares-en-la-ordinaria', 'la-elipse-partida-por-la-bisectriz',
    'Una elipse y una recta que pasa por su centro, con los dos cortes calculados. Tiene borde continuo y región sombreada, que es lo que la ordinaria suele pedir.'],
  [R('ord'), 'lugares-en-la-ordinaria', 'las-raices-que-son-los-focos',
    'Primero se resuelve una ecuación de segundo grado y después sus dos raíces hacen de focos. El enunciado encadena dos cosas, como los de examen.'],
  [R('ord'), 'poligonos-y-raices', 'recinto-cuadrado',
    'Dos vértices contiguos de un cuadrado y hay que levantar los otros dos. El giro de noventa grados es multiplicar por $i$, y el afijo del enunciado decide cuál de las dos construcciones vale.'],
  [R('ord'), 'poligonos-y-raices', 'triangulo-rectangulo-isosceles',
    'El mismo giro, ahora para cerrar un triángulo rectángulo isósceles. Aquí hay que decidir además cuál de los dos resultados tiene mayor parte imaginaria.'],
];

for (const [f, escalon, id, nota] of puestas) {
  insertaPractica(f, escalon, id, nota);
  console.log(`${f.replace('src/content/preparar/', '')} · ${escalon} ← ${id}`);
}
console.log(`\n${puestas.length} prácticas enlazadas`);
