/**
 * Las tres figuras que les faltaban a los ejemplos de entrada del tema 4.
 *
 * Los otros ocho ya tenían dibujo. Estos tres son justo los que introducen las
 * tres cosas que el tema pide hacer —clasificar un punto crítico, aplicar el
 * valor medio y optimizar con una ligadura—, así que eran los peores tres para
 * dejar sin figura.
 *
 *     node scripts/figuras/calculo-ejemplos-t04.mjs
 */

import { lienzo, mosaico } from './lienzo.mjs';
import { pegaEnCampo } from './pegar.mjs';

export const FICHERO = 'src/content/calculo/t04-estudio-local/ejercicios.yaml';

export const figuras = [];
const fig = (id, pie, hacer) =>
  figuras.push({ fichero: FICHERO, id, campo: 'resolucion', pie, hacer });

/* ── 1 · un punto crítico, y decidir qué es ──────────────────────────── */

fig('ej-punto-critico-clasificado',
  'Los dos puntos donde la tangente es horizontal. El de la izquierda es un máximo local y el de la derecha un mínimo local, y ninguno de los dos es absoluto: la curva sube y baja sin tope. Eso es lo que quiere decir «local».',
  () => {
    const f = (x) => x ** 3 - 3 * x;
    const l = lienzo({
      id: 'f-ej-punto-critico',
      ancho: 320, alto: 265,
      x: [-2.4, 2.4], y: [-4.2, 4.2], cuadrado: false,
      titulo: 'La cúbica x al cubo menos tres x, con sus dos puntos de tangente horizontal',
      desc: 'Una curva que sube desde abajo a la izquierda, hace una joroba, baja hasta un valle '
        + 'y vuelve a subir hasta arriba a la derecha. La cima de la joroba está en el punto '
        + 'menos uno coma dos y el fondo del valle en el punto uno coma menos dos. En cada uno '
        + 'de los dos hay dibujada una recta horizontal corta, que es la tangente: es horizontal '
        + 'porque ahí la derivada se anula. La curva sigue subiendo indefinidamente por la '
        + 'derecha y bajando por la izquierda, de modo que ninguno de los dos puntos es el mayor '
        + 'ni el menor valor de la función.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-1, 1], marcasY: [-2, 2] });
    l.curva(f, [-2.1, 2.1], { clase: 'c', n: 110 });
    l.poli([[-1.75, 2], [-0.25, 2]], { clase: 'c2' });
    l.poli([[0.25, -2], [1.75, -2]], { clase: 'c2' });
    l.punto(-1, 2, { clase: 'o', r: 4.4 });
    l.punto(1, -2, { clase: 'o', r: 4.4 });
    l.rotulo(-1, 2, 'máximo local', { dx: 0, dy: -9, anclaje: 'middle', color: 'var(--flag)' });
    l.rotulo(1, -2, 'mínimo local', { dx: 0, dy: 19, anclaje: 'middle', color: 'var(--flag)' });
    return l.svg();
  });

/* ── 2 · el teorema del valor medio, aplicado ────────────────────────── */

fig('ej-lagrange-basico',
  'La secante entre (0,0) y (2,4) tiene pendiente 2, y la tangente a la parábola vale 2 justo en x = 1. El teorema no dice cuál es ese punto: dice que existe. Aquí se ve, y además cae en el medio del intervalo, que en la parábola pasa siempre.',
  () => {
    const l = lienzo({
      id: 'f-ej-lagrange-basico',
      ancho: 300, alto: 265,
      x: [-0.6, 2.7], y: [-1.5, 4.7], cuadrado: false,
      titulo: 'La parábola y igual a x al cuadrado entre cero y dos, con la secante y la tangente paralelas',
      desc: 'Una parábola sube del origen hasta el punto dos coma cuatro. Una recta discontinua '
        + 'une esos dos extremos: es la secante, y su pendiente vale dos. Otra recta, continua y '
        + 'de otro color, es tangente a la parábola en el punto uno coma uno y es paralela a la '
        + 'anterior. Una línea de puntos baja de ese punto de tangencia hasta el eje horizontal, '
        + 'donde está marcado el valor c igual a uno, justo en el centro del intervalo.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2], marcasY: [1, 4] });
    l.poli([[0, 0], [2, 4]], { clase: 'cp2' });
    l.curva((x) => x * x, [-0.5, 2.2], { clase: 'c', n: 80 });
    l.poli([[-0.15, -1.15], [2.3, 3.6]], { clase: 'c2' });
    l.poli([[1, 0], [1, 1]], { clase: 'g' });
    l.punto(0, 0, { r: 3.4 });
    l.punto(2, 4, { r: 3.4 });
    l.punto(1, 1, { clase: 'o', r: 4.4 });
    l.rotulo(1, 0, 'c = 1', { dx: 0, dy: 15, anclaje: 'middle', color: 'var(--flag)' });
    l.rotulo(0.55, 1.1, 'secante', { dx: -5, dy: -5, anclaje: 'end', color: 'var(--alt)', pequeno: true });
    l.rotulo(1.75, 2.75, 'tangente', { dx: 5, dy: 10, color: 'var(--alt)', pequeno: true });
    return l.svg();
  });

/* ── 3 · optimizar, con la restricción a la vista ────────────────────── */

fig('ej-optimizar-rectangulo',
  'Los tres rectángulos tienen el mismo perímetro, 20 m, y áreas muy distintas. El cuadrado gana, y la gráfica de la derecha dice por qué: el área es una parábola invertida con el vértice justo en x = 5.',
  () => mosaico({
    id: 'f-ej-optimizar-rectangulo',
    columnas: 2,
    ancho: 205,
    alto: 175,
    titulo: 'Tres rectángulos de igual perímetro y la gráfica del área en función del lado',
    desc: 'A la izquierda, tres rectángulos apoyados en la misma línea, todos con perímetro '
        + 'veinte metros. El primero es estrecho y alto, de dos por ocho, y su área vale '
        + 'dieciséis. El segundo es un cuadrado de cinco por cinco y su área vale veinticinco, '
        + 'la mayor. El tercero es ancho y bajo, de ocho por dos, y vuelve a valer dieciséis. A '
        + 'la derecha, la gráfica del área en función del lado x: una parábola abierta hacia '
        + 'abajo que vale cero en x igual a cero y en x igual a diez, y cuyo punto más alto está '
        + 'exactamente en x igual a cinco, con valor veinticinco.',
    celdas: [
      {
        etiqueta: 'mismo perímetro, 20 m',
        x: [-1, 18.5], y: [-2.6, 9.6], cuadrado: true,
        dibuja: (l) => {
          const caja = (x0, w, h, clase) =>
            l.poli([[x0, 0], [x0 + w, 0], [x0 + w, h], [x0, h]], { clase, cerrar: true });
          l.poli([[3, 0], [8, 0], [8, 5], [3, 5]], { clase: 'f', cerrar: true });
          l.poli([[-0.8, 0], [18.2, 0]], { clase: 'eje' });
          caja(0, 2, 8, 'g');
          caja(3, 5, 5, 'c');
          caja(9.5, 8, 2, 'g');
          l.rotulo(5.5, 5, '5×5 = 25', { dx: 0, dy: -7, anclaje: 'middle' });
          l.rotulo(1, 8, '2×8 = 16', { dx: 0, dy: -7, anclaje: 'middle', color: 'var(--faint)', pequeno: true });
          l.rotulo(13.5, 2, '8×2 = 16', { dx: 0, dy: -7, anclaje: 'middle', color: 'var(--faint)', pequeno: true });
        },
      },
      {
        etiqueta: 'el área A(x) = x(10−x)',
        x: [-1.2, 11.4], y: [-3.4, 29], cuadrado: false,
        dibuja: (l) => {
          l.ejes({ nombreX: 'x', nombreY: 'A', marcasX: [5, 10], marcasY: [25] });
          l.curva((x) => x * (10 - x), [0, 10], { clase: 'c2', n: 80 });
          l.poli([[5, 0], [5, 25]], { clase: 'g' });
          l.punto(5, 25, { clase: 'o', r: 4.2 });
          l.rotulo(5, 25, 'A = 25', { dx: 6, dy: -4, color: 'var(--flag)' });
        },
      },
    ],
  }));

/* ── a pegar ─────────────────────────────────────────────────────────── */
for (const f of figuras) f.svg = f.hacer();

if (process.argv[1]?.endsWith('calculo-ejemplos-t04.mjs')) {
  for (const f of figuras) pegaEnCampo(f.fichero, f.id, f.campo, f.svg, f.pie);
  console.log(`${figuras.length} figuras de ejemplo pegadas en ${FICHERO}`);
}
