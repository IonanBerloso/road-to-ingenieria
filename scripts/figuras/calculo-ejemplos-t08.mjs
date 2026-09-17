/**
 * Las figuras de los cinco ejemplos de entrada del tema 8.
 *
 * Van en fichero aparte y no dentro de `calculo-ejemplos.mjs` por una razón
 * práctica: aquel ya tiene sus veintitrés pegadas, y volver a ejecutarlo para
 * añadir cinco haría saltar el guardián que impide pisar una figura existente
 * —que es un guardián que conviene tener—. `rehacer.mjs` los recorre los dos.
 *
 *     node scripts/figuras/calculo-ejemplos-t08.mjs
 */

import { lienzo, mosaico } from './lienzo.mjs';
import { pegaEnCampo } from './pegar.mjs';

export const FICHERO = 'src/content/calculo/t08-integral-curvilinea/ejercicios.yaml';

export const figuras = [];
const fig = (id, pie, hacer) =>
  figuras.push({ fichero: FICHERO, id, campo: 'resolucion', pie, hacer });

/**
 * Un campo vectorial como malla de flechas.
 *
 * Las flechas se escalan con el módulo pero con tope: un campo que crece como
 * x² produce, sin tope, tres flechas diminutas y una que cruza el dibujo
 * entero, y entonces no se ve el campo sino la flecha grande.
 */
const campo = (l, F, xs, ys, largo = 0.34) => {
  const puntos = [];
  let max = 0;
  for (const x of xs) for (const y of ys) {
    const [u, v] = F(x, y);
    const m = Math.hypot(u, v);
    if (m > max) max = m;
    puntos.push([x, y, u, v, m]);
  }
  for (const [x, y, u, v, m] of puntos) {
    if (m < 1e-9) continue;
    const k = (largo * (0.35 + 0.65 * (m / max))) / m;
    l.flecha([x, y], [x + k * u, y + k * v], { clase: 'g2', punta: 5, color: 'var(--faint)' });
  }
};

const CAMPO_CSS = 'stroke: var(--faint); stroke-width: 1.5; fill: none;';

/* ── 1 · parametrizar un segmento ────────────────────────────────────── */

fig('ej-parametrizar-un-segmento',
  'El segmento con su parámetro marcado: t = 0 en A, t = 1 en B, y los valores intermedios repartidos a partes iguales. Esa es toda la idea de la parametrización r(t) = A + t(B − A).',
  () => {
    const A = [1, 2], B = [3, 6];
    const r = (t) => [A[0] + t * (B[0] - A[0]), A[1] + t * (B[1] - A[1])];
    const l = lienzo({
      id: 'f-ej-parametrizar-segmento',
      ancho: 300, alto: 265,
      x: [-0.4, 4.2], y: [-0.5, 7.0], cuadrado: true,
      titulo: 'El segmento de A a B con el parámetro t marcado de cero a uno',
      desc: 'Un segmento recto va del punto A, de coordenadas uno y dos, al punto B, de '
        + 'coordenadas tres y seis. Sobre él hay cinco marcas repartidas a intervalos iguales, '
        + 'etiquetadas con los valores del parámetro: cero en A, un cuarto, un medio, tres '
        + 'cuartos y uno en B. Una flecha en el centro indica que el recorrido va de A hacia B. '
        + 'Líneas de puntos bajan de A y de B hasta los ejes para leer sus coordenadas.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 3], marcasY: [2, 6] });
    l.poli([[1, 0], [1, 2]], { clase: 'g' });
    l.poli([[0, 2], [1, 2]], { clase: 'g' });
    l.poli([[3, 0], [3, 6]], { clase: 'g' });
    l.poli([[0, 6], [3, 6]], { clase: 'g' });
    l.poli([A, B], { clase: 'c' });
    l.flecha(r(0.44), r(0.62), { clase: 'c' });
    for (const t of [0.25, 0.5, 0.75]) l.punto(...r(t), { r: 3.2 });
    l.punto(...A, { clase: 'o', r: 4.4 });
    l.punto(...B, { clase: 'o', r: 4.4 });
    l.rotulo(...A, 'A  t = 0', { dx: 8, dy: 4, color: 'var(--flag)' });
    l.rotulo(...B, 'B  t = 1', { dx: -8, dy: -6, anclaje: 'end', color: 'var(--flag)' });
    l.rotulo(...r(0.25), '¼', { dx: 7, dy: 4, color: 'var(--faint)', pequeno: true });
    l.rotulo(...r(0.5), '½', { dx: 7, dy: 4, color: 'var(--faint)', pequeno: true });
    l.rotulo(...r(0.75), '¾', { dx: 7, dy: 4, color: 'var(--faint)', pequeno: true });
    return l.svg();
  });

/* ── 2 · conservativo o no ───────────────────────────────────────────── */

fig('ej-conservativo-o-no',
  'El mismo cuadrado recorrido en los dos campos. En el de la izquierda la circulación es cero, y lo sería en cualquier otra curva cerrada: por eso es conservativo. En el de la derecha vale 1, y esa unidad es exactamente el área del cuadrado por Qx − Py = 1.',
  () => {
    const cuadro = [[0.3, 0.3], [1.7, 0.3], [1.7, 1.7], [0.3, 1.7]];
    const celda = (etiqueta, F, nota) => ({
      etiqueta,
      x: [-0.25, 2.25], y: [-0.25, 2.25], cuadrado: true,
      dibuja: (l) => {
        l.clase('g2', CAMPO_CSS);
        l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2], marcasY: [1, 2] });
        campo(l, F, [0.25, 0.75, 1.25, 1.75], [0.25, 0.75, 1.25, 1.75], 0.3);
        l.poli(cuadro, { clase: 'c', cerrar: true });
        l.flecha([0.9, 0.3], [1.15, 0.3], { clase: 'c' });
        l.flecha([1.7, 0.9], [1.7, 1.15], { clase: 'c' });
        l.esquina(6, 14, nota);
      },
    });
    return mosaico({
      id: 'f-ej-conservativo-o-no',
      columnas: 2,
      ancho: 200,
      alto: 170,
      titulo: 'Los dos campos con el mismo cuadrado recorrido en sentido positivo',
      desc: 'Dos recuadros, cada uno con una malla de flechas finas que representa un campo '
        + 'vectorial, y encima el mismo cuadrado de lado uno coma cuatro recorrido en sentido '
        + 'antihorario. En el primero, el campo V, la circulación a lo largo del cuadrado vale '
        + 'cero. En el segundo, el campo W, vale uno. Las flechas del primer campo apuntan hacia '
        + 'fuera abriéndose desde el origen; las del segundo giran, y ese giro es lo que hace '
        + 'que la circulación no se anule.',
      celdas: [
        celda('V = (2xy, x²)', (x, y) => [2 * x * y, x * x], '∮ = 0 · conservativo'),
        celda('W = (y, 2x)', (x, y) => [y, 2 * x], '∮ = 1 · no lo es'),
      ],
    });
  });

/* ── 3 · el trabajo parametrizando ───────────────────────────────────── */

fig('ej-trabajo-parametrizando',
  'El segmento de (0,0) a (1,1) y el campo sobre él. Las flechas no son tangentes al camino: solo cuenta la parte que va en la dirección del movimiento, y eso es lo que calcula el producto escalar F·dr.',
  () => {
    const l = lienzo({
      id: 'f-ej-trabajo-parametrizando',
      ancho: 300, alto: 265,
      x: [-0.25, 1.45], y: [-0.25, 1.45], cuadrado: true,
      titulo: 'El segmento de la diagonal y el campo F igual a y, x al cuadrado sobre él',
      desc: 'Una malla de flechas finas cubre el primer cuadrante: es el campo. Sobre ella, el '
        + 'segmento que va del origen al punto uno coma uno, con trazo grueso y una flecha que '
        + 'marca el sentido. En tres puntos del segmento se dibuja, con trazo destacado, el '
        + 'vector del campo en ese punto: se ve que no apunta en la dirección del segmento, sino '
        + 'inclinado respecto de él. La parte del vector que sí va en la dirección del camino es '
        + 'lo único que contribuye al trabajo.',
    });
    l.clase('g2', CAMPO_CSS);
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1], marcasY: [1] });
    campo(l, (x, y) => [y, x * x], [0.15, 0.45, 0.75, 1.05, 1.35], [0.15, 0.45, 0.75, 1.05, 1.35], 0.24);
    l.poli([[0, 0], [1, 1]], { clase: 'c' });
    l.flecha([0.42, 0.42], [0.58, 0.58], { clase: 'c' });
    for (const s of [0.3, 0.6, 0.9]) {
      const k = 0.3 / Math.hypot(s, s * s);
      l.flecha([s, s], [s + k * s, s + k * s * s], { clase: 'c2', punta: 6, color: 'var(--alt)' });
    }
    l.punto(0, 0, { clase: 'o', r: 4.2 });
    l.punto(1, 1, { clase: 'o', r: 4.2 });
    l.rotulo(1, 1, '(1,1)', { dx: -7, dy: -6, anclaje: 'end', color: 'var(--flag)' });
    l.rotulo(0.6, 0.6, 'F', { dx: 14, dy: 10, color: 'var(--alt)' });
    return l.svg();
  });

/* ── 4 · Green en un triángulo ───────────────────────────────────────── */

fig('ej-green-en-un-triangulo',
  'El triángulo rectángulo de catetos 4 y 3, recorrido en sentido antihorario. Con Qx − Py = 2, la integral doble es 2 por el área, y el área de este triángulo se sabe sin integrar: 6.',
  () => {
    const V = [[0, 0], [4, 0], [0, 3]];
    const l = lienzo({
      id: 'f-ej-green-triangulo',
      ancho: 320, alto: 250,
      x: [-0.5, 4.8], y: [-0.5, 3.8], cuadrado: true,
      titulo: 'El triángulo de vértices el origen, cuatro cero y cero tres',
      desc: 'Un triángulo rectángulo con el ángulo recto en el origen: un cateto sobre el eje x '
        + 'de longitud cuatro y otro sobre el eje y de longitud tres, unidos por la hipotenusa. '
        + 'El interior está sombreado. Tres flechas recorren el contorno en sentido antihorario: '
        + 'hacia la derecha por la base, subiendo en diagonal por la hipotenusa de derecha a '
        + 'izquierda, y bajando por el cateto vertical. Dentro está escrito que el área vale '
        + 'seis.',
    });
    l.poli(V, { clase: 'f', cerrar: true });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [4], marcasY: [3] });
    l.poli(V, { clase: 'c', cerrar: true });
    l.flecha([1.6, 0], [2.4, 0], { clase: 'c' });
    l.flecha([2.4, 1.2], [1.6, 1.8], { clase: 'c' });
    l.flecha([0, 1.8], [0, 1.2], { clase: 'c' });
    for (const v of V) l.punto(...v, { clase: 'o', r: 4.2 });
    l.rotulo(4, 0, '(4,0)', { dx: 6, dy: 13, color: 'var(--flag)', pequeno: true });
    l.rotulo(0, 3, '(0,3)', { dx: 6, dy: -6, color: 'var(--flag)', pequeno: true });
    l.rotulo(1.15, 0.8, 'área 6', { dx: 0, dy: 0, anclaje: 'middle' });
    return l.svg();
  });

/* ── 5 · la masa de un alambre recto ─────────────────────────────────── */

fig('ej-la-masa-de-un-alambre-recto',
  'El alambre es la hipotenusa del triángulo 3-4-5, así que mide 5 sin integrar nada. La densidad x + y crece de 0 en el origen a 7 en B, y el ancho de la banda la dibuja: la masa es el área de esa banda.',
  () => {
    const B = [3, 4];
    const n = [-4 / 5, 3 / 5];
    const dens = (s) => 3 * s + 4 * s;
    const banda = [
      ...Array.from({ length: 41 }, (_, k) => {
        const s = k / 40;
        return [3 * s, 4 * s];
      }),
      ...Array.from({ length: 41 }, (_, k) => {
        const s = 1 - k / 40;
        const h = (0.62 * dens(s)) / 7;
        return [3 * s + h * n[0], 4 * s + h * n[1]];
      }),
    ];
    const l = lienzo({
      id: 'f-ej-alambre-recto',
      ancho: 300, alto: 265,
      x: [-1.5, 3.8], y: [-0.5, 4.8], cuadrado: true,
      titulo: 'El alambre del origen al punto tres cuatro, con la densidad dibujada como anchura',
      desc: 'Un segmento va del origen al punto de coordenadas tres y cuatro; es el alambre, y '
        + 'mide cinco porque es la hipotenusa del triángulo de catetos tres y cuatro, dibujados '
        + 'con trazo discontinuo. A lo largo del alambre, hacia el lado de arriba y a la '
        + 'izquierda, se extiende una banda sombreada cuya anchura crece desde cero en el origen '
        + 'hasta el máximo en el otro extremo: es la densidad, que vale x más y y por tanto '
        + 'aumenta según se avanza. La masa del alambre es el área de esa banda.',
    });
    l.poli(banda, { clase: 'f', cerrar: true });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [3], marcasY: [4] });
    l.poli([[0, 0], [3, 0], [3, 4]], { clase: 'g' });
    l.poli(banda, { clase: 'cp2' });
    l.poli([[0, 0], B], { clase: 'c' });
    l.punto(0, 0, { clase: 'o', r: 4.2 });
    l.punto(...B, { clase: 'o', r: 4.2 });
    l.rotulo(0, 0, 'A(0,0)', { dx: 8, dy: 13, color: 'var(--flag)', pequeno: true });
    l.rotulo(...B, 'B(3,4)', { dx: 7, dy: -5, color: 'var(--flag)', pequeno: true });
    l.rotulo(1.5, 2, 'L = 5', { dx: 10, dy: 10 });
    l.rotulo(1.26, 2.49, 'densidad x+y', { dx: -6, dy: 0, anclaje: 'end', color: 'var(--alt)', pequeno: true });
    return l.svg();
  });

/* ── a pegar ─────────────────────────────────────────────────────────── */
for (const f of figuras) f.svg = f.hacer();

if (process.argv[1]?.endsWith('calculo-ejemplos-t08.mjs')) {
  for (const f of figuras) pegaEnCampo(f.fichero, f.id, f.campo, f.svg, f.pie);
  console.log(`${figuras.length} figuras de ejemplo pegadas en ${FICHERO}`);
}
