/**
 * Las figuras de las prácticas del tema 3 que van de funciones y curvas.
 *
 * Tema 3 es el que más se resiente de no tener dibujos, porque casi todo lo
 * que pregunta es una propiedad que se ve: si dos trozos empalman, si hay un
 * pico, si una curva pasa dos veces por el mismo punto. El caso extremo es
 * `limite-que-no-existe`: el coseno de pi partido por x oscila infinitas veces
 * en cualquier entorno del cero, y eso no se «deduce», se mira.
 *
 * Las de velocidades relacionadas y el resto de aplicaciones van en
 * `calculo-practica-t03-aplicaciones.mjs`.
 *
 *     node scripts/figuras/calculo-practica-t03.mjs
 */

import { lienzo, mosaico } from './lienzo.mjs';
import { pegaEnCampo } from './pegar.mjs';

export const FICHERO = 'src/content/calculo/t03-funciones-reales/ejercicios.yaml';

export const figuras = [];
const fig = (id, pie, hacer) =>
  figuras.push({ fichero: FICHERO, id, campo: 'resolucion', pie, hacer });

const P = Math.PI;
const param = (f, t0, t1, n = 160) =>
  Array.from({ length: n + 1 }, (_, k) => f(t0 + ((t1 - t0) * k) / n));

/* ── 1 · dos sucesiones que discrepan ────────────────────────────────── */

fig('limite-que-no-existe',
  'Cerca del cero la curva sube y baja infinitas veces, y cada vez llega hasta +1 y hasta −1. Por eso las dos sucesiones del enunciado, que caen en crestas y en valles respectivamente, dan límites distintos: 1 y −1. Si dos caminos discrepan, el límite no existe.',
  () => {
    const f = (x) => Math.cos(P / x);
    const l = lienzo({
      id: 'f-limite-no-existe',
      ancho: 340, alto: 250,
      x: [-0.06, 0.62], y: [-1.5, 1.6], cuadrado: false,
      titulo: 'El coseno de pi partido por x oscilando cada vez más deprisa cerca del cero',
      desc: 'La curva ondula entre menos uno y uno. A la derecha las ondas son anchas, y según '
        + 'se acerca al cero por la izquierda se van comprimiendo hasta ser tan estrechas que ya '
        + 'no se distinguen unas de otras: la función oscila infinitas veces en cualquier '
        + 'entorno del cero, por pequeño que sea. Sobre la cresta que vale uno y sobre el valle '
        + 'que vale menos uno hay puntos marcados: son los términos de las dos sucesiones del '
        + 'enunciado, que se acercan al cero por sitios distintos y dan valores distintos.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [[0.5, '0,5'], [0.25, '0,25']], marcasY: [[1, '1'], [-1, '−1']] });
    l.poli([[-0.06, 1], [0.62, 1]], { clase: 'g' });
    l.poli([[-0.06, -1], [0.62, -1]], { clase: 'g' });
    /* El muestreo tiene que ser mucho más fino que el periodo local, o la
       curva sale suave donde en realidad oscila: eso es exactamente el error
       que el ejercicio quiere desmontar. */
    l.curva(f, [0.028, 0.6], { clase: 'c', n: 1400 });
    for (const n of [1, 2, 3, 4]) l.punto(1 / (2 * n), 1, { clase: 'o', r: 3.6 });
    for (const n of [2, 3, 4, 5]) l.punto(2 / (2 * n + 1), -1, { r: 3.6 });
    l.rotulo(0.36, 1, 'aₙ = 1/2n  →  f = 1', { dx: 0, dy: -9, anclaje: 'middle', color: 'var(--flag)' });
    l.rotulo(0.42, -1, 'bₙ = 2/(2n+1)  →  f = −1', { dx: 0, dy: 17, anclaje: 'middle' });
    l.esquina(10, 17, 'cerca del 0 oscila infinitas veces');
    return l.svg();
  });

/* ── 2 · una raíz que existe, y que además es la única ───────────────── */

fig('bolzano-raiz-unica',
  'Bolzano da la existencia: la función vale −1 en 0 y algo más de 1,7 en 1, así que cruza el eje en medio. La unicidad la da la derivada, que es (x+1)eˣ y no se anula en el semieje positivo: la curva sube siempre, de modo que solo puede cruzar una vez.',
  () => {
    const f = (x) => x * Math.exp(x) - 1;
    const l = lienzo({
      id: 'f-bolzano-unica',
      ancho: 330, alto: 250,
      x: [-0.25, 1.35], y: [-1.5, 2.6], cuadrado: false,
      titulo: 'La función x por e elevado a x menos uno, creciente y con una sola raíz',
      desc: 'La curva entra por abajo a la izquierda con el valor menos uno en x igual a cero, '
        + 'sube sin pararse nunca y sale por arriba a la derecha con un valor cercano a uno coma '
        + 'ocho en x igual a uno. Cruza el eje horizontal una sola vez, en un punto cercano a '
        + 'cero coma cincuenta y siete, marcado con un círculo. Dos puntos más marcan los '
        + 'valores en los extremos del intervalo, uno por debajo del eje y otro por encima: son '
        + 'los que Bolzano necesita para garantizar el cruce.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [[0.5, '0,5'], [1, '1']], marcasY: [[-1, '−1'], [1, '1']] });
    l.curva(f, [-0.2, 1.22], { clase: 'c', n: 120 });
    l.punto(0, -1, { r: 4 });
    l.punto(1, Math.E - 1, { r: 4 });
    l.punto(0.5671, 0, { clase: 'o', r: 4.6 });
    l.rotulo(0, -1, 'f(0) = −1 < 0', { dx: 7, dy: 4 });
    l.rotulo(1, Math.E - 1, 'f(1) ≈ 1,72 > 0', { dx: -7, dy: 4, anclaje: 'end' });
    l.rotulo(0.5671, 0, 'la única raíz', { dx: 0, dy: 17, anclaje: 'middle', color: 'var(--flag)' });
    l.esquina(10, 17, 'creciente: no puede volver a cruzar');
    return l.svg();
  });

/* ── 3 · continua en dos puntos, derivable solo en uno ───────────────── */

fig('continuidad-y-derivabilidad-trozos',
  'Con a = 1 y b = −1 los tres trozos empalman sin saltos. Pero empalmar no es lo mismo que pegar suave: en x = −1 las dos pendientes coinciden y la curva pasa lisa, y en x = 2 no —llega con pendiente 11 por un lado y la recta sale con 11 por el otro—, de modo que hay que mirarlo trozo a trozo.',
  () => {
    const f = (x) => (x <= -1 ? 0 : x < 2 ? x ** 3 - x : 11 * x - 16);
    const l = lienzo({
      id: 'f-tres-trozos-derivable',
      ancho: 335, alto: 265,
      x: [-2.4, 2.9], y: [-3.2, 7.2], cuadrado: false,
      titulo: 'Los tres trozos de la función, empalmando en menos uno y en dos',
      desc: 'A la izquierda de menos uno la función vale cero y se dibuja como un segmento '
        + 'horizontal sobre el eje. Entre menos uno y dos es la cúbica x al cubo menos x, que '
        + 'sale del cero, baja un poco, vuelve a subir y llega a valer seis en x igual a dos. A '
        + 'partir de ahí es la recta once x menos dieciséis, que sigue subiendo. Los dos puntos '
        + 'de empalme están marcados con círculos y con líneas verticales de puntos. En el '
        + 'primero la curva pasa sin formar esquina; en el segundo se ve el quiebro.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-1, 2], marcasY: [6] });
    l.poli([[-2.35, 0], [-1, 0]], { clase: 'c' });
    l.curva((x) => x ** 3 - x, [-1, 2], { clase: 'c', n: 110 });
    l.curva((x) => 11 * x - 16, [2, 2.15], { clase: 'c', n: 2 });
    l.poli([[-1, -3.2], [-1, 7.2]], { clase: 'g' });
    l.poli([[2, -3.2], [2, 7.2]], { clase: 'g' });
    l.punto(-1, 0, { clase: 'o', r: 4.4 });
    l.punto(2, 6, { clase: 'o', r: 4.4 });
    l.rotulo(-1, 0, 'liso', { dx: 0, dy: 17, anclaje: 'middle', color: 'var(--flag)' });
    l.esquina(10, 17, 'en x = 2 hay que mirar la derivada', { color: 'var(--flag)' });
    l.rotulo(-1.9, 0, 'f = 0', { dx: 0, dy: -8, anclaje: 'middle' });
    l.rotulo(0.9, f(0.9), 'x³ − x', { dx: 6, dy: 12 });
    return l.svg();
  });

/* ── 4 · dos parámetros para pegar dos trozos ────────────────────────── */

fig('continuidad-parametro-k',
  'Pegar dos trozos es igualar sus valores en el punto de corte, y eso da una ecuación en k. En (a) sale una sola solución; en (b) la ecuación es de segundo grado y salen dos, y las dos valen: hay dos funciones distintas que cumplen lo pedido.',
  () => {
    const celda = (etiqueta, x, y, dibuja) => ({ etiqueta, x, y, cuadrado: false, dibuja });
    return mosaico({
      id: 'f-continuidad-k',
      columnas: 2,
      ancho: 210,
      alto: 175,
      titulo: 'Los dos apartados: uno con una sola solución y otro con dos',
      desc: 'Dos recuadros. En el primero, la parábola x al cuadrado por la izquierda y la recta '
        + 'k x menos tres por la derecha, empalmando en x igual a uno a la altura uno: con k '
        + 'igual a cuatro las dos partes se tocan sin salto. En el segundo, dos parábolas por la '
        + 'izquierda y dos rectas por la derecha, dibujadas por parejas, que corresponden a los '
        + 'dos valores posibles de k: un medio y menos uno. Las dos parejas empalman en x igual '
        + 'a dos, cada una a una altura distinta, y las dos son respuestas válidas.',
      celdas: [
        celda('(a) k = 4', [-0.35, 2.6], [-3.6, 4.6], (l) => {
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1], marcasY: [1] });
          l.curva((x) => x * x, [-0.3, 1], { clase: 'c', n: 60 });
          l.curva((x) => 4 * x - 3, [1, 1.9], { clase: 'c2', n: 2 });
          l.poli([[1, -3.6], [1, 4.6]], { clase: 'g' });
          l.punto(1, 1, { clase: 'o', r: 4 });
        }),
        celda('(b) k = ½ y k = −1', [-0.35, 3.4], [-1.6, 6.4], (l) => {
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [2], marcasY: [1, 4] });
          l.poli([[2, -1.6], [2, 6.4]], { clase: 'g' });
          l.curva((x) => 0.25 * x * x, [-0.3, 2], { clase: 'c', n: 60 });
          l.curva((x) => 0.5 * x, [2, 3.3], { clase: 'c', n: 2 });
          l.curva((x) => x * x, [-0.3, 2], { clase: 'c2', n: 60 });
          l.curva((x) => 2 * x, [2, 3.15], { clase: 'c2', n: 2 });
          l.punto(2, 1, { clase: 'o', r: 3.8 });
          l.punto(2, 4, { clase: 'o', r: 3.8 });
          l.rotulo(2.6, 1.3, 'k = ½', { dx: 0, dy: 0, pequeno: true });
          l.rotulo(2.6, 5.2, 'k = −1', { dx: 0, dy: 0, color: 'var(--alt)', pequeno: true });
        }),
      ],
    });
  });

/* ── 5 · una tangente a una curva con forma de flor ──────────────────── */

fig('tangente-a-la-cuadrifolia',
  'La curva tiene cuatro pétalos y pasa por (−1,1), que es el punto más alejado del pétalo de arriba a la izquierda. Ahí la tangente vale y = x + 2, y por simetría se adivina antes de derivar: en el punto extremo de un pétalo la tangente es perpendicular al radio.',
  () => {
    /* En polares, (ρ²)³ = 8ρ⁴cos²θ sen²θ, es decir ρ² = 2 sen²(2θ), o sea
       ρ = √2 |sen 2θ|. Así se dibuja sin resolver nada implícito. */
    const flor = (t) => {
      const r = Math.SQRT2 * Math.abs(Math.sin(2 * t));
      return [r * Math.cos(t), r * Math.sin(t)];
    };
    const l = lienzo({
      id: 'f-cuadrifolia',
      ancho: 320, alto: 290,
      x: [-2.1, 2.1], y: [-1.9, 2.4], cuadrado: true,
      titulo: 'La cuadrifolia con la tangente en el punto menos uno coma uno',
      desc: 'Una curva con cuatro pétalos iguales que salen del origen, uno hacia cada cuadrante '
        + 'en diagonal. El punto de coordenadas menos uno y uno está en el extremo del pétalo de '
        + 'arriba a la izquierda, que es su punto más alejado del origen. Por ese punto pasa una '
        + 'recta de pendiente uno, la tangente, que corta el eje vertical en dos. Una línea de '
        + 'puntos une el origen con el punto de tangencia y se ve que es perpendicular a la '
        + 'recta.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-1, 1], marcasY: [1, 2] });
    l.poli(param(flor, 0, 2 * P, 400), { clase: 'c', cerrar: true });
    l.poli([[0, 0], [-1, 1]], { clase: 'g' });
    l.curva((x) => x + 2, [-2.05, 0.35], { clase: 'c2', n: 2 });
    l.punto(-1, 1, { clase: 'o', r: 4.6 });
    l.rotulo(-1, 1, 'P(−1,1)', { dx: -7, dy: -6, anclaje: 'end', color: 'var(--flag)' });
    l.rotulo(-1.7, 0.3, 'y = x + 2', { dx: 6, dy: 10, color: 'var(--alt)' });
    return l.svg();
  });

/* ── 6 · un punto por el que la curva pasa dos veces ─────────────────── */

fig('dos-tangentes-en-un-punto',
  'La curva se cruza consigo misma en (0,4): pasa por ahí con t = 2 y con t = −2. Cada paso lleva su propia pendiente, +⅛ y −⅛, así que hay dos tangentes y no una. Preguntar «la tangente en P» sin mirar el dibujo lleva a dar media respuesta.',
  () => {
    const c = (t) => [t ** 5 - 4 * t ** 3, t * t];
    const l = lienzo({
      id: 'f-dos-tangentes',
      ancho: 330, alto: 275,
      x: [-13, 13], y: [-1.2, 8.2], cuadrado: false,
      titulo: 'La curva paramétrica que se cruza consigo misma en el punto cero coma cuatro',
      desc: 'Una curva con forma de lazo: sube por la izquierda, se curva hacia la derecha, se '
        + 'cruza consigo misma en el punto de abscisa cero y altura cuatro, y vuelve a bajar '
        + 'formando un bucle simétrico respecto del eje vertical. En el punto de cruce hay dos '
        + 'rectas tangentes distintas, una de pendiente un octavo y otra de pendiente menos un '
        + 'octavo, que forman una equis muy abierta. El punto de cruce está marcado con un '
        + 'círculo.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-10, 10], marcasY: [4] });
    l.poli(param(c, -2.25, 2.25, 300), { clase: 'c' });
    l.curva((x) => 4 + x / 8, [-12.5, 12.5], { clase: 'c2', n: 2 });
    l.curva((x) => 4 - x / 8, [-12.5, 12.5], { clase: 'cp2', n: 2 });
    l.punto(0, 4, { clase: 'o', r: 5 });
    l.rotulo(0, 4, 'P(0,4)', { dx: -7, dy: -7, anclaje: 'end', color: 'var(--flag)' });
    l.rotulo(11.5, 4 + 11.5 / 8, 't = 2', { dx: -4, dy: -6, anclaje: 'end', color: 'var(--alt)', pequeno: true });
    l.rotulo(11.5, 4 - 11.5 / 8, 't = −2', { dx: -4, dy: 14, anclaje: 'end', color: 'var(--alt)', pequeno: true });
    return l.svg();
  });

/* ── 7 · tres derivadas en función del parámetro ─────────────────────── */

fig('derivada-parametrica',
  'Las tres curvas del enunciado. En la primera hay dos puntos con tangente vertical —donde dx/dt se anula— y en ellos dy/dx no existe; en la tercera, la elipse, pasa lo mismo en los extremos del eje horizontal. Saberlo evita dividir por cero sin darse cuenta.',
  () => {
    const celda = (etiqueta, x, y, cuadrado, dibuja) => ({ etiqueta, x, y, cuadrado, dibuja });
    return mosaico({
      id: 'f-derivada-parametrica',
      columnas: 3,
      titulo: 'Las tres curvas paramétricas del ejercicio',
      desc: 'Tres recuadros. En el primero, una curva con forma de lazo tumbado, cerrada sobre '
        + 'sí misma, con dos puntos marcados donde la tangente es vertical. En el segundo, una '
        + 'curva que sale del punto uno coma cero y se va hacia la derecha ondulando ligeramente '
        + 'mientras sube y baja. En el tercero, una elipse de semieje horizontal tres y semieje '
        + 'vertical dos, con los dos puntos de tangente vertical marcados en sus extremos '
        + 'izquierdo y derecho.',
      celdas: [
        celda('(a) t³−t, 4−t²', [-1.4, 1.4], [-0.5, 4.6], false, (l) => {
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasY: [2, 4] });
          l.poli(param((t) => [t ** 3 - t, 4 - t * t], -1.35, 1.35, 200), { clase: 'c' });
          for (const t of [-1 / Math.sqrt(3), 1 / Math.sqrt(3)]) {
            l.punto(t ** 3 - t, 4 - t * t, { clase: 'o', r: 3.6 });
          }
        }),
        celda('(b) 2t³+1, t²cos t', [-2.6, 5.2], [-2.6, 2.6], false, (l) => {
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 4] });
          l.poli(param((t) => [2 * t ** 3 + 1, t * t * Math.cos(t)], -1.1, 1.25, 200), { clase: 'c' });
        }),
        celda('(c) 3cos t, 2sen t', [-3.7, 3.7], [-2.7, 2.7], true, (l) => {
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [3], marcasY: [2] });
          l.poli(param((t) => [3 * Math.cos(t), 2 * Math.sin(t)], 0, 2 * P, 160), { clase: 'c', cerrar: true });
          l.punto(3, 0, { clase: 'o', r: 3.6 });
          l.punto(-3, 0, { clase: 'o', r: 3.6 });
        }),
      ],
    });
  });

/* ── 8 · seis derivadas sin despejar la y ────────────────────────────── */

fig('derivacion-implicita',
  'Tres de las seis, las que se pueden dibujar. Ninguna es la gráfica de una función: por (b) y por (f) pasan dos valores de y para el mismo x. Ese es el motivo de derivar implícitamente en vez de despejar — despejar obligaría a partir la curva en trozos.',
  () => {
    const celda = (etiqueta, x, y, dibuja) => ({ etiqueta, x, y, cuadrado: true, dibuja });
    return mosaico({
      id: 'f-derivacion-implicita',
      columnas: 3,
      titulo: 'Tres de las curvas definidas implícitamente en el ejercicio',
      desc: 'Tres recuadros. En el primero, la circunferencia de radio uno centrada en el '
        + 'origen. En el segundo, la curva x al cubo más y al cubo igual a cuatro, que baja de '
        + 'izquierda a derecha cortando los dos ejes y que sí es la gráfica de una función. En '
        + 'el tercero, una parábola tumbada que se abre hacia la izquierda, con el vértice en '
        + 'uno coma cinco y cero y pasando por los puntos cero coma tres y cero coma menos tres. '
        + 'En el primero y el tercero se marca con una línea vertical de puntos que para un '
        + 'mismo valor de x hay dos valores de y.',
      celdas: [
        celda('(b) x²+y²=1', [-1.5, 1.5], [-1.5, 1.5], (l) => {
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1] });
          l.circunferencia(0, 0, 1, { clase: 'c' });
          l.poli([[0.5, -1.5], [0.5, 1.5]], { clase: 'g' });
          l.punto(0.5, Math.sqrt(0.75), { clase: 'o', r: 3.4 });
          l.punto(0.5, -Math.sqrt(0.75), { clase: 'o', r: 3.4 });
        }),
        celda('(d) x³+y³=4', [-2.6, 2.6], [-2.6, 2.6], (l) => {
          l.ejes({ nombreX: 'x', nombreY: 'y' });
          l.curva((x) => Math.cbrt(4 - x ** 3), [-2.5, 2.5], { clase: 'c', n: 120 });
        }),
        celda('(f) y² = 9−6x', [-2.4, 2.4], [-3.6, 3.6], (l) => {
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasY: [3] });
          l.poli(param((t) => [(9 - t * t) / 6, t], -3.4, 3.4, 120), { clase: 'c' });
          l.poli([[0, -3.6], [0, 3.6]], { clase: 'g' });
          l.punto(0, 3, { clase: 'o', r: 3.4 });
          l.punto(0, -3, { clase: 'o', r: 3.4 });
        }),
      ],
    });
  });

/* ── a pegar ─────────────────────────────────────────────────────────── */
for (const f of figuras) f.svg = f.hacer();

if (process.argv[1]?.endsWith('calculo-practica-t03.mjs')) {
  for (const f of figuras) pegaEnCampo(f.fichero, f.id, f.campo, f.svg, f.pie);
  console.log(`${figuras.length} figuras de práctica pegadas en ${FICHERO}`);
}
