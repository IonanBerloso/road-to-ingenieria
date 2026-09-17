/**
 * Las cuatro figuras que les faltaban a los ejemplos de entrada del tema 2.
 *
 * Son los cuatro primeros peldaños del tema: la definición de límite, el
 * contraejemplo del signo, la suma de una geométrica y la cancelación de una
 * telescópica. Un ejemplo de entrada existe para poder empezar sin saber nada,
 * y los cuatro hablan de cosas que se ven de un vistazo y no se ven en una
 * fórmula.
 *
 *     node scripts/figuras/calculo-ejemplos-t02.mjs
 */

import { lienzo } from './lienzo.mjs';
import { pegaEnCampo } from './pegar.mjs';

export const FICHERO = 'src/content/calculo/t02-sucesiones/ejercicios.yaml';

export const figuras = [];
const fig = (id, pie, hacer) =>
  figuras.push({ fichero: FICHERO, id, campo: 'resolucion', pie, hacer });

const terminos = (l, a, n0, n1, opts = {}) => {
  for (let n = n0; n <= n1; n++) l.punto(n, a(n), { r: 2.8, ...opts });
};

/* ── 1 · leer la definición de límite en un caso concreto ────────────── */

fig('ej-definicion-de-limite',
  'La banda de radio 0,01 alrededor del 0 y el primer término que entra en ella: el 101, porque 1/101 ya es menor que una centésima y 1/100 todavía no lo es. Cualquier m ≥ 100 sirve; lo que la definición pide es que exista alguno, no el mejor.',
  () => {
    const l = lienzo({
      id: 'f-ej-definicion-limite',
      ancho: 340, alto: 235,
      x: [-14, 190], y: [-0.022, 0.075], cuadrado: false,
      titulo: 'La banda de radio una centésima alrededor del cero y el término a partir del cual la sucesión no sale',
      desc: 'Los términos de la sucesión uno partido por n van bajando hacia el eje horizontal. '
        + 'Una banda estrecha sombreada, de una centésima de altura por encima y por debajo del '
        + 'cero, cruza el dibujo de lado a lado. Los primeros términos quedan por encima de la '
        + 'banda; a partir del término número cien todos caen dentro y ya no vuelven a salir. '
        + 'Una línea vertical marca ese término, etiquetada como m igual a cien.',
    });
    l.poli([[-14, -0.01], [190, -0.01], [190, 0.01], [-14, 0.01]], { clase: 'f', cerrar: true });
    l.ejes({
      nombreX: 'n', nombreY: 'aₙ',
      marcasX: [50, 100, 150],
      marcasY: [[0.01, 'ε'], [-0.01, '−ε']],
    });
    terminos(l, (n) => 1 / n, 14, 185, { clase: 'o', r: 2.4 });
    l.poli([[100, -0.022], [100, 0.06]], { clase: 'cp2' });
    l.rotulo(100, 0.055, 'm = 100', { dx: 6, dy: 0, color: 'var(--alt)' });
    l.esquina(10, 17, 'ε = 0,01');
    l.rotulo(40, 0.028, 'fuera', { dx: 0, dy: 0, anclaje: 'middle', pequeno: true });
    l.rotulo(185, 0.022, 'dentro, y ya para siempre', { dx: 0, dy: 4, anclaje: 'end', pequeno: true });
    return l.svg();
  });

/* ── 2 · por qué el límite de términos positivos no tiene que serlo ──── */

fig('ej-signo-en-el-limite',
  'Todos los términos de 1/n son estrictamente positivos y su límite vale 0, que no lo es. La desigualdad estricta no sobrevive al límite: lo que sí sobrevive es la que lleva el igual, L ≥ 0.',
  () => {
    const l = lienzo({
      id: 'f-ej-signo-limite',
      ancho: 335, alto: 230,
      x: [-1.8, 26], y: [-0.28, 1.15], cuadrado: false,
      titulo: 'La sucesión uno partido por n, con todos sus términos positivos y límite cero',
      desc: 'Los términos de la sucesión son puntos que empiezan en la altura uno y van bajando '
        + 'hacia el eje horizontal, cada vez más pegados a él pero siempre por encima: ninguno '
        + 'llega a tocarlo. Una banda sombreada marca la zona estrictamente positiva, donde '
        + 'están todos. El propio eje, la altura cero, es el límite, y está fuera de esa zona: '
        + 'esa es toda la lección del ejemplo.',
    });
    l.poli([[-1.8, 0], [26, 0], [26, 1.15], [-1.8, 1.15]], { clase: 'f', cerrar: true });
    l.ejes({ nombreX: 'n', nombreY: 'aₙ', marcasX: [10, 20], marcasY: [1] });
    terminos(l, (n) => 1 / n, 1, 25, { clase: 'o', r: 3 });
    l.rotulo(14, 0.5, 'todos aquí: aₙ > 0', { dx: 0, dy: 0, anclaje: 'middle' });
    l.rotulo(25, 0, 'el límite es 0, que no es > 0', { dx: 0, dy: 30, anclaje: 'end', color: 'var(--alt)', pequeno: true });
    return l.svg();
  });

/* ── 3 · sumar una serie geométrica ──────────────────────────────────── */

fig('ej-suma-geometrica',
  'Las sumas parciales, que son lo que de verdad converge. Cada una recorta la mitad de lo que faltaba para llegar a 2: por eso se acercan sin parar y por eso no llegan nunca en un número finito de pasos.',
  () => {
    const S = (N) => 2 - 2 * 0.5 ** N;
    const l = lienzo({
      id: 'f-ej-suma-geometrica',
      ancho: 335, alto: 240,
      x: [-1, 11.5], y: [-0.28, 2.4], cuadrado: false,
      titulo: 'Las sumas parciales de la geométrica de razón un medio acercándose a dos',
      desc: 'Una línea horizontal de puntos a la altura dos marca la suma de la serie. Debajo, '
        + 'los puntos de las sumas parciales: la primera vale uno, la segunda uno coma cinco, la '
        + 'tercera uno coma setenta y cinco, y así sucesivamente, subiendo cada vez menos y '
        + 'acercándose a la línea sin llegar a tocarla. Entre cada punto y la línea hay un trazo '
        + 'vertical que muestra lo que falta, y que se reduce a la mitad en cada paso.',
    });
    l.ejes({ nombreX: 'N (términos sumados)', nombreY: 'Sₙ', marcasX: [1, 5, 10], marcasY: [1, 2] });
    l.poli([[-1, 2], [11.5, 2]], { clase: 'cp2' });
    for (let N = 1; N <= 10; N++) l.poli([[N, S(N)], [N, 2]], { clase: 'g' });
    terminos(l, S, 1, 10, { clase: 'o', r: 3.4 });
    l.rotulo(9.6, 2, 'suma = 2', { dx: 0, dy: -9, anclaje: 'end', color: 'var(--alt)' });
    l.esquina(10, 17, 'lo que falta se parte en dos cada vez');
    return l.svg();
  });

/* ── 4 · una serie telescópica, término a término ────────────────────── */

fig('ej-telescopica-que-se-cancela',
  'Cada término se parte en dos trozos, 1/n y −1/(n+1), y el segundo de cada fila anula al primero de la siguiente. Al final de la suma parcial solo sobreviven el primero de todos, que vale 1, y el último, que se va a cero: el límite es 1.',
  () => {
    const l = lienzo({
      id: 'f-ej-telescopica',
      ancho: 340, alto: 250,
      x: [-0.35, 6.4], y: [-0.9, 5.9], cuadrado: false,
      titulo: 'Las cinco primeras filas de la telescópica, con las cancelaciones marcadas',
      desc: 'Cinco filas, una por término de la serie. En cada fila hay dos cajas: a la '
        + 'izquierda, el trozo positivo uno partido por n; a la derecha, el trozo negativo menos '
        + 'uno partido por n más uno. El trozo negativo de cada fila y el positivo de la fila de '
        + 'debajo tienen el mismo valor y están unidos por una línea diagonal que indica que se '
        + 'cancelan mutuamente. Al final solo quedan sin cancelar el trozo positivo de la '
        + 'primera fila, que vale uno, y el trozo negativo de la última, que se va haciendo cada '
        + 'vez más pequeño. Debajo de todo, la suma resultante: uno menos uno partido por N más '
        + 'uno, que tiende a uno.',
    });
    const fila = (k) => 6 - k;
    for (let n = 1; n <= 5; n++) {
      const y = fila(n);
      l.poli([[0.2, y - 0.28], [2.5, y - 0.28], [2.5, y + 0.28], [0.2, y + 0.28]], { clase: 'f', cerrar: true });
      l.poli([[3.1, y - 0.28], [5.4, y - 0.28], [5.4, y + 0.28], [3.1, y + 0.28]], { clase: 'f2', cerrar: true });
      l.rotulo(1.35, y, `+ 1/${n}`, { dx: 0, dy: 4, anclaje: 'middle' });
      l.rotulo(4.25, y, `− 1/${n + 1}`, { dx: 0, dy: 4, anclaje: 'middle', color: 'var(--alt)' });
      if (n < 5) l.poli([[3.1, y - 0.28], [2.5, y - 0.72]], { clase: 'cp2' });
    }
    l.poli([[-0.2, 0.18], [6.2, 0.18]], { clase: 'eje' });
    l.rotulo(1.35, 5.28, 'sobrevive', { dx: 0, dy: -11, anclaje: 'middle', pequeno: true });
    l.rotulo(4.25, 1, 'sobrevive', { dx: 0, dy: 14, anclaje: 'middle', color: 'var(--alt)', pequeno: true });
    l.rotulo(2.8, -0.28, 'S₅ = 1 − 1/6', { dx: 0, dy: -8, anclaje: 'middle' });
    l.rotulo(2.8, -0.55, 'y en general Sₙ = 1 − 1/(N+1) → 1', { dx: 0, dy: 4, anclaje: 'middle', pequeno: true });
    return l.svg();
  });

/* ── a pegar ─────────────────────────────────────────────────────────── */
for (const f of figuras) f.svg = f.hacer();

if (process.argv[1]?.endsWith('calculo-ejemplos-t02.mjs')) {
  for (const f of figuras) pegaEnCampo(f.fichero, f.id, f.campo, f.svg, f.pie);
  console.log(`${figuras.length} figuras de ejemplo pegadas en ${FICHERO}`);
}
