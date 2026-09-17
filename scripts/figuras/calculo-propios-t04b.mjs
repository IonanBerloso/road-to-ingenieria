/**
 * Las figuras de los otros cinco ejercicios propios del tema 4.
 *
 * Van aparte de `calculo-propios-t04.mjs` porque aquellas son el dato del
 * enunciado y estas ilustran la resolución: son dos trabajos distintos y se
 * revisan por separado.
 *
 * Las dos de Fermat son los dos contraejemplos que hay que saber decir de
 * memoria, y se dicen mucho mejor señalando un dibujo que recitando.
 *
 *     node scripts/figuras/calculo-propios-t04b.mjs
 */

import { lienzo } from './lienzo.mjs';
import { pegaEnCampo } from './pegar.mjs';

export const FICHERO = 'src/content/calculo/t04-estudio-local/ejercicios.yaml';

export const figuras = [];
const fig = (id, pie, hacer) =>
  figuras.push({ fichero: FICHERO, id, campo: 'resolucion', pie, hacer });

/* ── 1 · Fermat: el mínimo en el borde ───────────────────────────────── */

fig('fermat-en-el-borde-del-intervalo',
  'El mínimo está en el borde izquierdo, y la tangente ahí tiene pendiente 2. Fermat no dice nada de los bordes, así que no hay contradicción.',
  () => {
    const l = lienzo({
      id: 'f-fermat-borde',
      ancho: 300, alto: 260,
      x: [-0.5, 3.7], y: [-1.6, 10.4], cuadrado: false,
      margen: 26,
      titulo: 'La parábola y igual a x al cuadrado sobre el intervalo de uno a tres',
      desc: 'Un tramo de la parábola y igual a x al cuadrado, dibujado solo entre x igual a uno y '
        + 'x igual a tres, que es el intervalo del ejercicio. El tramo sube todo el rato: empieza '
        + 'en el punto uno coma uno, que es el más bajo, y acaba en el punto tres coma nueve, que '
        + 'es el más alto. Los dos extremos están marcados con un punto. En el punto uno coma uno '
        + 'hay dibujada una recta corta que es la tangente, y se ve claramente inclinada, no '
        + 'horizontal: su pendiente vale dos. Dos líneas verticales de puntos marcan dónde empieza '
        + 'y acaba el intervalo, y el resto de la parábola, incluido su vértice en el origen, no '
        + 'se dibuja porque queda fuera.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 3], marcasY: [1, 9] });
    l.poli([[1, 0], [1, 1]], { clase: 'g' });
    l.poli([[3, 0], [3, 9]], { clase: 'g' });
    l.curva((x) => x * x, [1, 3], { clase: 'c', n: 90 });
    /* La tangente en el mínimo: pendiente 2, y se ve que no es horizontal. */
    l.poli([[0.45, 1 - 2 * 0.55], [1.75, 1 + 2 * 0.75]], { clase: 'c2' });
    l.punto(1, 1, { clase: 'o', r: 4.4 });
    l.punto(3, 9, { clase: 'pt', r: 3.6 });
    l.rotulo(1, 1, 'mínimo', { dx: 9, dy: 14, color: 'var(--flag)' });
    l.rotulo(1.75, 2.5, 'pendiente 2', { dx: 5, dy: 2, color: 'var(--alt)', pequeno: true });
    return l.svg();
  });

/* ── 2 · Fermat: el pico sin derivada ────────────────────────────────── */

fig('fermat-y-el-pico-sin-derivada',
  'El mínimo está en un punto interior, pero es un pico: las dos pendientes que llegan a él son −1 y +1, así que no hay una sola derivada.',
  () => {
    const l = lienzo({
      id: 'f-fermat-pico',
      ancho: 310, alto: 240,
      x: [-0.6, 4.6], y: [-0.9, 2.9], cuadrado: false,
      margen: 26,
      titulo: 'La uve del valor absoluto de x menos dos, con el vértice en el dos',
      desc: 'La gráfica del valor absoluto de x menos dos entre cero y cuatro, que tiene forma de '
        + 'uve. Baja en línea recta desde el punto cero coma dos hasta el punto dos coma cero, con '
        + 'pendiente menos uno, y desde ahí sube en línea recta hasta el punto cuatro coma dos, '
        + 'con pendiente más uno. El vértice, en el punto dos coma cero, está marcado: es el '
        + 'mínimo y está en el interior del intervalo, no en un borde. Junto a cada uno de los dos '
        + 'tramos está escrita su pendiente, menos uno a la izquierda y más uno a la derecha. Que '
        + 'sean distintas es la razón de que no exista la derivada en el vértice.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [2, 4], marcasY: [2] });
    l.poli([[0, 2], [2, 0], [4, 2]], { clase: 'c' });
    l.punto(2, 0, { clase: 'o', r: 4.6 });
    l.rotulo(2, 0, 'mínimo interior', { dx: 22, dy: 31, anclaje: 'middle', color: 'var(--flag)' });
    l.rotulo(0.8, 1.2, 'pendiente −1', { dx: -4, dy: -7, anclaje: 'end', color: 'var(--faint)', pequeno: true });
    l.rotulo(3.2, 1.2, 'pendiente +1', { dx: 4, dy: -7, color: 'var(--faint)', pequeno: true });
    return l.svg();
  });

/* ── 3 · Taylor del logaritmo en uno ─────────────────────────────────── */

fig('taylor-del-logaritmo-en-uno',
  'La cúbica de Taylor y el logaritmo no se separan hasta bastante lejos del uno. Cerca del centro no se distinguen, y por eso la cota del error sale tan pequeña.',
  () => {
    const P = (x) => (x - 1) - (x - 1) ** 2 / 2 + (x - 1) ** 3 / 3;
    const l = lienzo({
      id: 'f-taylor-ln-en-uno',
      ancho: 330, alto: 250,
      /* El cero entra en la ventana aunque el logaritmo no llegue: si no,
         el eje vertical se dibuja pegado al borde y sus marcas se salen. */
      x: [-0.4, 2.5], y: [-1.5, 1.2], cuadrado: false,
      margen: 26,
      titulo: 'El logaritmo y su polinomio de Taylor de orden tres centrado en el uno',
      desc: 'Dos curvas sobre los mismos ejes. Una es el logaritmo natural, que sube desde muy '
        + 'abajo a la izquierda, pasa por el punto uno coma cero y sigue subiendo despacio. La '
        + 'otra es su polinomio de Taylor de grado tres centrado en el uno. Entre x igual a cero '
        + 'coma seis y x igual a uno coma cuatro las dos van tan juntas que no se distinguen; a '
        + 'partir de ahí el polinomio se despega, por abajo a la izquierda y por arriba a la '
        + 'derecha. El punto uno coma uno, donde se hace la aproximación, está marcado y cae de '
        + 'lleno en la zona donde las dos coinciden. El centro del desarrollo, el punto uno coma '
        + 'cero, también está marcado.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2], marcasY: [-1, 1] });
    l.curva(Math.log, [0.28, 2.45], { clase: 'c', n: 170 });
    l.curva(P, [0.32, 2.05], { clase: 'c2', n: 170 });
    l.punto(1, 0, { clase: 'pt', r: 3.6 });
    l.punto(1.1, Math.log(1.1), { clase: 'o', r: 4.2 });
    l.rotulo(1.1, Math.log(1.1), 'x = 1,1', { dx: 4, dy: -13, color: 'var(--flag)' });
    l.rotulo(2.42, Math.log(2.42), 'ln x', { dx: -4, dy: 15, anclaje: 'end', color: 'var(--d1)' });
    l.rotulo(2.02, P(2.02), 'la cúbica', { dx: -5, dy: -7, anclaje: 'end', color: 'var(--alt)' });
    return l.svg();
  });

/* ── 4 · componer dos desarrollos ────────────────────────────────────── */

fig('componer-tres-desarrollos-conocidos',
  'La cúbica obtenida componiendo sigue a la función bastante más allá del cero, que es lo que significa un error de orden x⁴.',
  () => {
    const g = (x) => Math.log(1 + Math.sin(x));
    const P = (x) => x - (x * x) / 2 + x ** 3 / 6;
    const l = lienzo({
      id: 'f-componer-desarrollos',
      ancho: 320, alto: 250,
      x: [-1.45, 1.8], y: [-1.6, 1.15], cuadrado: false,
      margen: 26,
      titulo: 'La función logaritmo de uno más seno de x y su desarrollo hasta el término cúbico',
      desc: 'Dos curvas que arrancan juntas del origen. Una es el logaritmo de uno más el seno de '
        + 'x, que sube despacio por la derecha y baja muy deprisa por la izquierda, tanto que se '
        + 'sale por el borde inferior del recuadro cuando x vale alrededor de menos cero coma '
        + 'noventa: a partir de ahi se va a menos infinito. La otra es el polinomio x '
        + 'menos x al cuadrado partido por dos más x al cubo partido por seis. Entre menos cero '
        + 'coma seis y más uno las dos van pegadas; fuera de ese tramo el polinomio se separa, y '
        + 'sobre todo por la izquierda, donde la función cae mucho más deprisa que él. El origen, '
        + 'que es el centro del desarrollo, está marcado.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-1, 1], marcasY: [-1, 1] });
    /* La función solo hasta donde cabe: cerca de −π/2 el logaritmo se va a
       menos infinito y cualquier décima de más se sale del recuadro. */
    l.curva(g, [-0.92, 1.75], { clase: 'c', n: 190 });
    l.curva(P, [-0.97, 1.62], { clase: 'c2', n: 150 });
    l.punto(0, 0, { clase: 'pt', r: 3.6 });
    l.rotulo(1.75, g(1.75), 'la función', { dx: -4, dy: 17, anclaje: 'end', color: 'var(--d1)' });
    l.rotulo(1.35, P(1.35), 'la cúbica', { dx: -6, dy: -8, anclaje: 'end', color: 'var(--alt)' });
    return l.svg();
  });

/* ── 5 · la diferencial, y de qué lado falla ─────────────────── */

fig('aproximar-una-raiz-cubica-con-la-diferencial',
  'La tangente va por encima de la curva a los dos lados, porque la raíz cúbica es cóncava hacia abajo. Ese es el motivo de que la aproximación se pase, y se ve sin calcular nada. El incremento del ejercicio, de 8 a 8,1, es una centésima del ancho de este dibujo: por eso el error sale de tres cienmilésimas.',
  () => {
    const r = (x) => Math.cbrt(x);
    const T = (x) => 2 + (x - 8) / 12;
    /* A la escala del ejercicio no se ve nada: entre 8 y 8,1 la curva y su
       tangente se separan 3·10⁻⁵, que a cualquier zoom legible es menos de
       un píxel. Se dibuja entonces el intervalo largo, donde la concavidad
       sí se aprecia, y el pie dice que el incremento real es minúsculo. Esa
       es justamente la razón de que la aproximación sea tan buena. */
    const l = lienzo({
      id: 'f-diferencial-raiz-cubica',
      ancho: 330, alto: 250,
      x: [-1.6, 21.5], y: [-0.35, 3.4], cuadrado: false,
      margen: 26,
      titulo: 'La raíz cúbica y su recta tangente en el ocho',
      desc: 'La curva de la raíz cúbica, que sube deprisa al principio y luego se va aplanando, '
        + 'dibujada entre cero y veinte. Sobre ella hay una recta, la tangente en el punto ocho '
        + 'coma dos, que está marcado. Las dos se tocan en ese punto y en ningún otro, y la recta '
        + 'queda por encima de la curva a los dos lados: por la izquierda la curva cae hacia el '
        + 'origen mucho más deprisa que la recta, y por la derecha la recta sigue subiendo recta '
        + 'mientras la curva se dobla. Esa es la forma de una función cóncava hacia abajo, y es lo '
        + 'que hace que la aproximación por la tangente se pase por arriba. El incremento del '
        + 'ejercicio, de ocho a ocho coma uno, es tan pequeño al lado del ancho dibujado que no '
        + 'se distingue: ahí la recta y la curva aún no se han separado ni una centésima.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [8, 20], marcasY: [2, 3] });
    l.curva(r, [0, 21.2], { clase: 'c', n: 170 });
    l.curva(T, [1.2, 21.2], { clase: 'c2', n: 60 });
    l.poli([[8, 0], [8, 2]], { clase: 'g' });
    l.punto(8, 2, { clase: 'o', r: 4.4 });
    l.rotulo(8, 2, 'a = 8', { dx: -10, dy: 21, anclaje: 'end', color: 'var(--flag)' });
    l.rotulo(19, T(19), 'la tangente', { dx: -4, dy: -8, anclaje: 'end', color: 'var(--alt)' });
    l.rotulo(20.8, r(20.8), 'la curva', { dx: -4, dy: 18, anclaje: 'end', color: 'var(--d1)' });
    return l.svg();
  });

/* ── a pegar ─────────────────────────────────────────────────────────── */
for (const f of figuras) f.svg = f.hacer();

if (process.argv[1]?.endsWith('calculo-propios-t04b.mjs')) {
  for (const f of figuras) pegaEnCampo(f.fichero, f.id, f.campo, f.svg, f.pie);
  console.log(`${figuras.length} figuras propias pegadas en ${FICHERO}`);
}
