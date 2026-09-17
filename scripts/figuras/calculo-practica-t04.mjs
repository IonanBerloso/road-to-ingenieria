/**
 * Las figuras de las prácticas del tema 4 que hablan de teoremas y de Taylor.
 *
 * Los del valor medio son **el** caso en que enseñar el dibujo es enseñar el
 * teorema: la tesis dice que existe un punto donde la tangente es paralela a
 * la secante, y eso es una frase hasta que se ven las dos rectas. Los de
 * Taylor son el otro: el polinomio se pega a la curva cerca del punto y se
 * despega lejos, y el ejercicio pregunta justamente cuánto.
 *
 * Los ocho de optimización van en `calculo-practica-t04-optimizacion.mjs`.
 *
 *     node scripts/figuras/calculo-practica-t04.mjs
 */

import { lienzo, mosaico } from './lienzo.mjs';
import { pegaEnCampo } from './pegar.mjs';

export const FICHERO = 'src/content/calculo/t04-estudio-local/ejercicios.yaml';

export const figuras = [];
const fig = (id, pie, hacer) =>
  figuras.push({ fichero: FICHERO, id, campo: 'resolucion', pie, hacer });

const P = Math.PI;

/** La recta tangente a `f` en `c`, dibujada a lo ancho de `radio`. */
const tangente = (l, f, df, c, radio, clase = 'c2') => {
  const m = df(c), y0 = f(c);
  l.poli([[c - radio, y0 - m * radio], [c + radio, y0 + m * radio]], { clase });
};

/* ── 1 · el teorema de Lagrange ──────────────────────────────────────── */

fig('teorema-de-lagrange',
  'En los tres, la recta discontinua es la secante entre los extremos y la continua es la tangente en el punto c que el teorema garantiza. Son paralelas: eso es todo lo que dice el teorema. En (a) la función ya es una recta, así que cualquier c sirve.',
  () => {
    const celda = (etiqueta, x, y, dibuja) => ({ etiqueta, x, y, cuadrado: false, dibuja });
    return mosaico({
      id: 'f-lagrange-tres',
      columnas: 3,
      titulo: 'Las tres funciones con su secante y la tangente paralela que el teorema garantiza',
      desc: 'Tres recuadros. En el primero, la función es la recta tres x menos cuatro entre uno '
        + 'y cuatro: la secante entre los extremos es la propia recta, y la tangente también, de '
        + 'modo que las tres coinciden y cualquier punto del intervalo sirve. En el segundo, la '
        + 'raíz de uno menos x entre menos tres y cero, una curva que baja suavemente; la '
        + 'secante une sus extremos y la tangente paralela toca la curva en menos uno coma '
        + 'veinticinco. En el tercero, x menos uno partido por x entre uno y tres, una curva '
        + 'creciente; la tangente paralela a la secante toca en raíz de tres, algo más de uno '
        + 'coma siete. En los tres, el punto c está marcado también sobre el eje horizontal.',
      celdas: [
        celda('(a) 3x − 4', [-0.35, 4.6], [-2.4, 9.2], (l) => {
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 4] });
          l.curva((x) => 3 * x - 4, [0.6, 4.5], { clase: 'c', n: 2 });
          /* La secante va encima y a trazos justamente porque coincide con la
             función: dibujada debajo desaparecería, y el apartado va de eso. */
          l.poli([[1, -1], [4, 8]], { clase: 'cp2' });
          l.punto(1, -1, { clase: 'o', r: 3.6 });
          l.punto(4, 8, { clase: 'o', r: 3.6 });
          l.esquina(6, 13, 'todo c vale');
        }),
        celda('(b) √(1−x)', [-3.6, 0.7], [-0.45, 2.75], (l) => {
          const f = (x) => Math.sqrt(1 - x);
          const df = (x) => -1 / (2 * Math.sqrt(1 - x));
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-3, 0] });
          l.poli([[-3, 2], [0, 1]], { clase: 'cp2' });
          l.curva(f, [-3.5, 0.6], { clase: 'c', n: 80 });
          tangente(l, f, df, -1.25, 1.5);
          l.poli([[-1.25, 0], [-1.25, f(-1.25)]], { clase: 'g' });
          l.punto(-1.25, f(-1.25), { clase: 'o', r: 3.6 });
          l.rotulo(-1.25, 0, 'c', { dx: 0, dy: 14, anclaje: 'middle', color: 'var(--flag)' });
        }),
        celda('(c) x − 1/x', [-0.35, 3.5], [-0.65, 3.35], (l) => {
          const f = (x) => x - 1 / x;
          const df = (x) => 1 + 1 / (x * x);
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 3] });
          l.poli([[1, 0], [3, 8 / 3]], { clase: 'cp2' });
          l.curva(f, [0.55, 3.45], { clase: 'c', n: 80 });
          tangente(l, f, df, Math.sqrt(3), 0.85);
          l.poli([[Math.sqrt(3), 0], [Math.sqrt(3), f(Math.sqrt(3))]], { clase: 'g' });
          l.punto(Math.sqrt(3), f(Math.sqrt(3)), { clase: 'o', r: 3.6 });
          l.rotulo(Math.sqrt(3), 0, '√3', { dx: 2, dy: 14, anclaje: 'middle', color: 'var(--flag)' });
        }),
      ],
    });
  });

/* ── 2 · el teorema de Rolle ─────────────────────────────────────────── */

fig('teorema-de-rolle',
  'Rolle es Lagrange cuando la secante es horizontal: si la función vale lo mismo en los dos extremos, en algún punto de dentro la tangente tiene que ser plana. En los tres dibujos la recta discontinua está a la altura común y la tangente en c es paralela a ella, es decir, horizontal.',
  () => {
    const celda = (etiqueta, x, y, dibuja) => ({ etiqueta, x, y, cuadrado: false, dibuja });
    return mosaico({
      id: 'f-rolle-tres',
      columnas: 3,
      titulo: 'Las tres funciones de Rolle, con la altura común y la tangente horizontal',
      desc: 'Tres recuadros. En el primero, una parábola entre menos tres y dos que vale diez en '
        + 'los dos extremos; su vértice, donde la tangente es horizontal, está en menos un '
        + 'medio. En el segundo, una cúbica entre uno y cinco que vale tres en los dos extremos; '
        + 'baja, hace un mínimo y vuelve a subir, y ese mínimo está en tres coma cinco dos ocho. '
        + 'En el tercero, el seno entre cero y pi, que vale cero en los dos extremos y tiene su '
        + 'máximo en pi medios. En los tres, una línea discontinua horizontal marca la altura '
        + 'común de los extremos y otra recta, continua, es la tangente en el punto c.',
      celdas: [
        celda('(a) x²+x+4', [-3.6, 2.6], [-0.9, 11.5], (l) => {
          const f = (x) => x * x + x + 4;
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-3, 2] });
          l.poli([[-3, 10], [2, 10]], { clase: 'cp2' });
          l.curva(f, [-3.25, 2.25], { clase: 'c', n: 80 });
          l.poli([[-1.6, f(-0.5)], [0.6, f(-0.5)]], { clase: 'c2' });
          l.punto(-0.5, f(-0.5), { clase: 'o', r: 3.6 });
          l.punto(-3, 10, { r: 3.2 });
          l.punto(2, 10, { r: 3.2 });
          l.rotulo(-3, 10, 'f = 10', { dx: -5, dy: -6, anclaje: 'start', color: 'var(--alt)', pequeno: true });
          l.rotulo(-0.5, f(-0.5), 'c = −½', { dx: 0, dy: 17, anclaje: 'middle', color: 'var(--flag)' });
        }),
        celda('(b) x³−6x²+5x+3', [0.5, 5.5], [-13, 7], (l) => {
          const f = (x) => x ** 3 - 6 * x * x + 5 * x + 3;
          const c = 2 + Math.sqrt(7 / 3);
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 5] });
          l.poli([[1, 3], [5, 3]], { clase: 'cp2' });
          l.curva(f, [0.6, 5.15], { clase: 'c', n: 100 });
          l.poli([[c - 1.1, f(c)], [c + 1.1, f(c)]], { clase: 'c2' });
          l.punto(c, f(c), { clase: 'o', r: 3.6 });
          l.punto(1, 3, { r: 3.2 });
          l.punto(5, 3, { r: 3.2 });
          l.rotulo(c, f(c), 'c ≈ 3,53', { dx: 0, dy: 15, anclaje: 'middle', color: 'var(--flag)' });
        }),
        celda('(c) sen x', [-0.35, 3.55], [-0.45, 1.45], (l) => {
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [[P, 'π']] });
          l.poli([[0, 0], [P, 0]], { clase: 'cp2' });
          l.curva(Math.sin, [-0.3, 3.5], { clase: 'c', n: 90 });
          l.poli([[P / 2 - 0.85, 1], [P / 2 + 0.85, 1]], { clase: 'c2' });
          l.punto(P / 2, 1, { clase: 'o', r: 3.6 });
          l.punto(0, 0, { r: 3.2 });
          l.punto(P, 0, { r: 3.2 });
          l.rotulo(P / 2, 1, 'c = π/2', { dx: 0, dy: -8, anclaje: 'middle', color: 'var(--flag)' });
        }),
      ],
    });
  });

/* ── 3 · la tangente de dos grados ───────────────────────────────────── */

fig('taylor-tangente-de-dos-grados',
  'La tangente y su polinomio de Taylor de orden dos, que es la recta y = x. Se separan visiblemente ya en medio radián; en 2°, que son 0,035 radianes, están tan pegadas que el dibujo no las distingue — y de ahí sale que el error sea de dos cienmilésimas.',
  () => {
    const dosGrados = P / 90;
    const l = lienzo({
      id: 'f-taylor-tangente',
      ancho: 330, alto: 260,
      x: [-0.75, 0.85], y: [-0.95, 1.05], cuadrado: false,
      titulo: 'La tangente y la recta y igual a x, que es su polinomio de Taylor de orden dos',
      desc: 'Dos curvas que salen juntas del origen. Una es la función tangente y la otra la '
        + 'recta y igual a x. Cerca del origen van superpuestas; a partir de medio radián la '
        + 'tangente se despega hacia arriba y se separa claramente de la recta. Una banda '
        + 'estrecha sombreada alrededor del origen marca dónde caen los dos grados del '
        + 'enunciado, que son cero coma cero tres cinco radianes: una franja tan fina que a esa '
        + 'escala las dos curvas son indistinguibles.',
    });
    /* La franja es exactamente de 0 a 2°, no un poco más ancha «para que se
       vea»: ensancharla convertiría la figura en un argumento falso, porque
       lo que el ejercicio explota es justo lo estrecha que es. */
    l.poli([[0, -0.95], [dosGrados, -0.95], [dosGrados, 1.05], [0, 1.05]], { clase: 'f', cerrar: true });
    l.ejes({ nombreX: 'x (radianes)', nombreY: 'y', marcasX: [[-0.5, '−0,5'], [0.5, '0,5']], marcasY: [[0.5, '0,5']] });
    l.curva((x) => x, [-0.72, 0.82], { clase: 'c2', n: 2 });
    l.curva(Math.tan, [-0.75, 0.8], { clase: 'c', n: 140 });
    l.punto(dosGrados, Math.tan(dosGrados), { clase: 'o', r: 4 });
    l.esquina(164, 24, '2° = 0,035 rad');
    l.rotulo(0.66, Math.tan(0.66), 'tg x', { dx: -8, dy: 2, anclaje: 'end' });
    l.rotulo(0.8, 0.8, 'y = x', { dx: -4, dy: 16, anclaje: 'end', color: 'var(--alt)' });
    return l.svg();
  });

/* ── 4 · cuántos términos hacen falta ────────────────────────────────── */

fig('cuantos-terminos-hacen-falta',
  'El seno con sus dos primeras aproximaciones. Cuanto más lejos del origen, más términos hacen falta; y 15° son 0,262 radianes, que está muy cerca. Por eso bastan dos: el primero solo ya se queda a tres milésimas, y el segundo baja a una cienmilésima.',
  () => {
    const p1 = (x) => x;
    const p3 = (x) => x - x ** 3 / 6;
    const q = (15 * P) / 180;
    const l = lienzo({
      id: 'f-cuantos-terminos',
      ancho: 340, alto: 250,
      x: [-0.25, 3.35], y: [-1.15, 1.75], cuadrado: false,
      titulo: 'El seno y sus aproximaciones de uno, dos y tres términos',
      desc: 'La curva del seno sube del origen hasta uno y vuelve a bajar. Junto a ella, tres '
        + 'aproximaciones. La primera es la recta y igual a x, que sigue al seno solo al '
        + 'principio y luego se dispara hacia arriba. La segunda, con dos términos, aguanta '
        + 'bastante más antes de desviarse hacia abajo. La tercera, con tres, aguanta casi hasta '
        + 'el final del dibujo. Una banda estrecha sombreada junto al origen marca dónde caen '
        + 'los quince grados del enunciado, cero coma dos seis radianes: ahí las cuatro curvas '
        + 'son la misma a simple vista.',
    });
    l.poli([[0, -1.15], [q, -1.15], [q, 1.75], [0, 1.75]], { clase: 'f', cerrar: true });
    l.ejes({
      nombreX: 'x (radianes)', nombreY: 'y',
      marcasX: [[q, '15°'], [1, '1'], [2, '2'], [3, '3']], marcasY: [1],
    });
    l.curva(p1, [0, 1.6], { clase: 'g' });
    l.curva(p3, [0, 2.75], { clase: 'c2', n: 90 });
    l.curva(Math.sin, [-0.2, 3.3], { clase: 'c', n: 120 });
    l.rotulo(1.45, p1(1.45), 'x', { dx: 6, dy: -4, color: 'var(--faint)' });
    l.rotulo(2.6, p3(2.6), 'x − x³/6', { dx: -6, dy: 12, anclaje: 'end', color: 'var(--alt)' });
    l.rotulo(2.75, Math.sin(2.75), 'sen x', { dx: 5, dy: -6 });
    return l.svg();
  });

/* ── 5 · ocho series de potencias ────────────────────────────────────── */

fig('ocho-series-de-potencias',
  'Cuatro de los ocho, con su suma parcial encima y la zona donde el desarrollo vale sombreada. La exponencial y el seno convergen en toda la recta; el logaritmo y la fracción, solo entre −1 y 1, y fuera de ahí la serie no es que aproxime mal: es que no suma nada.',
  () => {
    const celda = (etiqueta, x, y, dibuja) => ({ etiqueta, x, y, cuadrado: false, dibuja });
    const banda = (l, a, b, y0, y1) => l.poli([[a, y0], [b, y0], [b, y1], [a, y1]], { clase: 'f', cerrar: true });
    return mosaico({
      id: 'f-ocho-series',
      columnas: 2,
      ancho: 210,
      alto: 168,
      titulo: 'Cuatro de los ocho desarrollos, con su suma parcial y su radio de convergencia',
      desc: 'Cuatro recuadros, cada uno con una función y una suma parcial de su serie. En el '
        + 'primero, la exponencial y un polinomio de cuatro términos que la sigue bien en toda '
        + 'la franja dibujada; el fondo está sombreado entero porque la serie converge en toda '
        + 'la recta. En el segundo, el seno y su aproximación, igual. En el tercero, el '
        + 'logaritmo de uno más x: la sombra llega solo de menos uno a uno, y fuera de ahí la '
        + 'suma parcial se dispara. En el cuarto, uno partido por x menos uno, con la misma '
        + 'sombra de menos uno a uno y una asíntota vertical en x igual a uno.',
      celdas: [
        celda('eᵡ · converge siempre', [-2.4, 2.4], [-1.2, 7.6], (l) => {
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-2, 2], marcasY: [4] });
          l.curva((x) => 1 + x + x * x / 2 + x ** 3 / 6, [-2.35, 2.35], { clase: 'c2', n: 70 });
          l.curva(Math.exp, [-2.35, 2.05], { clase: 'c', n: 70 });
        }),
        celda('sen x · converge siempre', [-4.2, 4.2], [-1.9, 1.9], (l) => {
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [[-P, '−π'], [P, 'π']], marcasY: [1] });
          l.curva((x) => x - x ** 3 / 6 + x ** 5 / 120, [-3.5, 3.5], { clase: 'c2', n: 90 });
          l.curva(Math.sin, [-4.15, 4.15], { clase: 'c', n: 110 });
        }),
        celda('ln(1+x) · solo |x|<1', [-1.55, 1.55], [-3.1, 1.6], (l) => {
          banda(l, -1, 1, -3.1, 1.6);
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-1, 1], marcasY: [1] });
          l.curva((x) => x - x * x / 2 + x ** 3 / 3 - x ** 4 / 4, [-1.2, 1.5], { clase: 'c2', n: 80 });
          l.curva((x) => Math.log(1 + x), [-0.95, 1.5], { clase: 'c', n: 80 });
          l.poli([[-1, -3.1], [-1, 1.6]], { clase: 'g' });
          l.poli([[1, -3.1], [1, 1.6]], { clase: 'g' });
        }),
        celda('1/(x−1) · solo |x|<1', [-1.55, 1.55], [-4.2, 1.6], (l) => {
          banda(l, -1, 1, -4.2, 1.6);
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-1], marcasY: [-1] });
          l.curva((x) => -(1 + x + x * x + x ** 3 + x ** 4), [-1.5, 0.9], { clase: 'c2', n: 80 });
          l.curva((x) => 1 / (x - 1), [-1.5, 0.72], { clase: 'c', n: 80 });
          l.poli([[1, -4.2], [1, 1.6]], { clase: 'g' });
          l.poli([[-1, -4.2], [-1, 1.6]], { clase: 'g' });
        }),
      ],
    });
  });

/* ── a pegar ─────────────────────────────────────────────────────────── */
for (const f of figuras) f.svg = f.hacer();

if (process.argv[1]?.endsWith('calculo-practica-t04.mjs')) {
  for (const f of figuras) pegaEnCampo(f.fichero, f.id, f.campo, f.svg, f.pie);
  console.log(`${figuras.length} figuras de práctica pegadas en ${FICHERO}`);
}
