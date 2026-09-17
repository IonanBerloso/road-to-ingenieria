/**
 * Las cinco figuras de los ejemplos de entrada del tema 10.
 *
 * El problema de Laplace como tema de entrada es que todo pasa en una variable
 * que no se ve. Estas cinco dibujan el lado que sí se ve —el del tiempo— y una
 * de ellas dibuja el propio rodeo: el diagrama de ida y vuelta que explica por
 * qué compensa transformar una ecuación diferencial en una algebraica.
 *
 *     node scripts/figuras/calculo-ejemplos-t10.mjs
 */

import { lienzo, mosaico } from './lienzo.mjs';
import { pegaEnCampo } from './pegar.mjs';

export const FICHERO = 'src/content/calculo/t10-laplace/ejercicios.yaml';

export const figuras = [];
const fig = (id, pie, hacer) =>
  figuras.push({ fichero: FICHERO, id, campo: 'resolucion', pie, hacer });

/* ── 1 · la primera transformada, con la tabla ───────────────────────── */

fig('ej-transformada-con-la-tabla',
  'Los tres sumandos de f(t), cada uno con la pieza de la tabla que le corresponde. La transformada es lineal, así que se transforma sumando a sumando y no hay que integrar nada: la constante da 3/s, la rampa 2/s² y la exponencial −1/(s−4).',
  () => {
    const celda = (etiqueta, f, y, dom, marcaY) => ({
      etiqueta,
      x: [-0.3, 2.2], y, cuadrado: false,
      dibuja: (l) => {
        l.ejes({ nombreX: 't', nombreY: '', marcasX: [1, 2], marcasY: marcaY });
        l.curva(f, dom, { clase: 'c', n: 90 });
      },
    });
    return mosaico({
      id: 'f-ej-transformada-tabla',
      columnas: 3,
      titulo: 'Los tres sumandos de la función, por separado',
      desc: 'Tres recuadros. En el primero, una recta horizontal a la altura tres: la constante. '
        + 'En el segundo, una recta que sube desde el origen con pendiente dos: la rampa. En el '
        + 'tercero, una exponencial que arranca en uno y se dispara hacia arriba en cuanto '
        + 'avanza un poco el tiempo. La función del enunciado es la suma de las dos primeras '
        + 'menos la tercera.',
      celdas: [
        celda('3', () => 3, [-0.8, 4.4], [-0.25, 2.15], [3]),
        celda('2t', (t) => 2 * t, [-0.8, 4.8], [-0.25, 2.15], [2, 4]),
        /* La exponencial es e⁴ᵗ y no eᵗ: dibujar la de exponente uno con el
           rótulo de la de exponente cuatro sería justo el tipo de figura que
           §10 prohíbe. Por eso el recorte del dominio llega solo a 0,54. */
        celda('e⁴ᵗ', (t) => Math.exp(4 * t), [-1.5, 9], [-0.25, 0.54], [1, 5]),
      ],
    });
  });

/* ── 2 · volver, descomponiendo en fracciones simples ────────────────── */

fig('ej-inversa-fracciones-simples',
  'Al descomponer, F(s) se parte en dos trozos con denominador s−3 y s+2, y cada uno vuelve a una exponencial. La de exponente positivo crece y la de exponente negativo se apaga; la suma, que es la respuesta, se parece a la primera en cuanto t pasa de 1.',
  () => {
    const l = lienzo({
      id: 'f-ej-inversa-simples',
      ancho: 335, alto: 240,
      x: [-0.25, 1.6], y: [-1.5, 15], cuadrado: false,
      titulo: 'Las dos exponenciales de la descomposición y su suma',
      desc: 'Tres curvas salen del eje vertical. Una crece muy deprisa: es la exponencial de '
        + 'exponente tres. Otra baja acercándose al eje: es la de exponente menos dos. La '
        + 'tercera, con trazo grueso, es la suma de las dos, y se ve que al principio queda por '
        + 'debajo de la primera y que enseguida se confunde con ella, porque la segunda ya no '
        + 'aporta casi nada.',
    });
    l.ejes({ nombreX: 't', nombreY: 'f(t)', marcasX: [[0.5, '0,5'], [1, '1'], [1.5, '1,5']], marcasY: [5, 10] });
    const recorta = (f) => {
      const p = [];
      for (let i = 0; i <= 160; i++) {
        const t = -0.2 + (1.75 * i) / 160;
        const v = f(t);
        if (v > 14.4) break;
        p.push([t, v]);
      }
      return p;
    };
    l.poli(recorta((t) => (9 / 5) * Math.exp(3 * t)), { clase: 'g' });
    l.poli(recorta((t) => (6 / 5) * Math.exp(-2 * t)), { clase: 'g' });
    l.poli(recorta((t) => (9 / 5) * Math.exp(3 * t) + (6 / 5) * Math.exp(-2 * t)), { clase: 'c' });
    l.rotulo(0.52, (9 / 5) * Math.exp(1.56), 'e³ᵗ', { dx: 7, dy: 6, color: 'var(--faint)' });
    l.rotulo(1.1, (6 / 5) * Math.exp(-2.2), 'e⁻²ᵗ', { dx: 6, dy: -5, color: 'var(--faint)' });
    l.rotulo(0.6, (9 / 5) * Math.exp(1.8) + (6 / 5) * Math.exp(-1.2), 'la suma', { dx: -7, dy: 2, anclaje: 'end' });
    return l.svg();
  });

/* ── 3 · escribir con el escalón una función que empieza tarde ───────── */

fig('ej-escalon-y-retraso',
  'La parábola no empieza en 0: empieza en 3, y antes la función vale cero. Escribirla como θ(t−3)·(t−3)² es decir exactamente eso, y el (t−3) de dentro es lo que hace que la parábola arranque de nuevo desde su vértice en el instante 3 y no antes.',
  () => {
    const l = lienzo({
      id: 'f-ej-escalon-retraso',
      ancho: 335, alto: 230,
      x: [-0.6, 6.4], y: [-1.5, 10], cuadrado: false,
      titulo: 'La parábola que arranca en el instante tres, con el tramo plano antes',
      desc: 'Hasta el instante tres la función vale cero y se dibuja como un tramo recto sobre '
        + 'el eje. En ese instante arranca una parábola que sube desde el cero cada vez más '
        + 'deprisa. Con trazo fino se dibuja la parábola sin desplazar, que arrancaría en el '
        + 'origen, para que se vea que es la misma curva corrida tres unidades. Una línea '
        + 'vertical de puntos marca el instante tres.',
    });
    l.ejes({ nombreX: 't', nombreY: 'f(t)', marcasX: [3, 6], marcasY: [5] });
    l.curva((t) => t * t, [0, 3.1], { clase: 'fue', n: 60 });
    l.poli([[-0.55, 0], [3, 0]], { clase: 'c' });
    l.curva((t) => (t - 3) ** 2, [3, 6.1], { clase: 'c', n: 70 });
    l.poli([[3, -1.5], [3, 10]], { clase: 'g' });
    l.punto(3, 0, { clase: 'o', r: 4.4 });
    l.rotulo(3, 0, 'aquí arranca', { dx: 8, dy: 26, color: 'var(--flag)' });
    l.rotulo(2.2, 4.84, 't² sin retrasar', { dx: -6, dy: 2, anclaje: 'end', color: 'var(--faint)', pequeno: true });
    return l.svg();
  });

/* ── 4 · el rodeo completo, de la EDO a la solución ──────────────────── */

fig('ej-edo-entera-con-laplace',
  'El rodeo es más corto que el camino recto, y esa es toda la gracia del método: derivar se convierte en multiplicar por s, la condición inicial entra sola al transformar, y lo que queda es despejar una incógnita en una ecuación de primer grado.',
  () => {
    const l = lienzo({
      id: 'f-ej-rodeo-laplace',
      ancho: 340, alto: 215,
      x: [0, 10], y: [0, 6.4], cuadrado: false,
      titulo: 'El diagrama del rodeo: transformar, despejar y volver',
      desc: 'Un diagrama con cuatro cajas. Arriba a la izquierda, la ecuación diferencial con su '
        + 'condición inicial. Una flecha hacia la derecha, rotulada transformar, lleva a una '
        + 'caja con la ecuación algebraica en la variable s. De ahí, una flecha hacia abajo '
        + 'rotulada despejar lleva a la caja con la transformada de la solución. Y de esa, una '
        + 'flecha hacia la izquierda rotulada antitransformar lleva a la caja de abajo a la '
        + 'izquierda, con la solución. Una flecha discontinua atraviesa el diagrama de arriba '
        + 'abajo por la izquierda, rotulada el camino directo, para indicar que también se '
        + 'podría resolver sin dar el rodeo.',
    });
    const caja = (cx, cy, texto, clase) => {
      l.poli([[cx - 2.1, cy - 0.75], [cx + 2.1, cy - 0.75], [cx + 2.1, cy + 0.75], [cx - 2.1, cy + 0.75]], { clase, cerrar: true });
      l.poli([[cx - 2.1, cy - 0.75], [cx + 2.1, cy - 0.75], [cx + 2.1, cy + 0.75], [cx - 2.1, cy + 0.75]], { clase: 'c', cerrar: true });
      l.rotulo(cx, cy, texto, { dx: 0, dy: 4, anclaje: 'middle' });
    };
    caja(2.4, 5.2, 'y′ + 3y = 0', 'f');
    caja(7.6, 5.2, 'sY − 2 + 3Y = 0', 'f2');
    caja(7.6, 1.3, 'Y = 2/(s+3)', 'f2');
    caja(2.4, 1.3, 'y = 2e⁻³ᵗ', 'f');
    l.flecha([4.6, 5.2], [5.4, 5.2], { clase: 'c2', color: 'var(--alt)', punta: 6 });
    l.flecha([7.6, 4.35], [7.6, 2.2], { clase: 'c2', color: 'var(--alt)', punta: 6 });
    l.flecha([5.4, 1.3], [4.6, 1.3], { clase: 'c2', color: 'var(--alt)', punta: 6 });
    l.rotulo(5, 5.2, 'transformar', { dx: 0, dy: -13, anclaje: 'middle', color: 'var(--alt)', pequeno: true });
    l.rotulo(7.6, 3.3, 'despejar', { dx: 7, dy: 3, color: 'var(--alt)', pequeno: true });
    l.rotulo(5, 1.3, 'antitransformar', { dx: 0, dy: 21, anclaje: 'middle', color: 'var(--alt)', pequeno: true });
    l.poli([[0.7, 4.35], [0.7, 2.2]], { clase: 'cp' });
    l.flecha([0.7, 2.6], [0.7, 2.2], { clase: 'cp', punta: 5 });
    l.rotulo(0.7, 3.3, 'directo', { dx: 6, dy: 3, color: 'var(--faint)', pequeno: true });
    return l.svg();
  });

/* ── 5 · multiplicar por t es derivar la transformada ────────────────── */

fig('ej-multiplicar-por-t-es-derivar-la-transformada',
  'Multiplicar por t no cambia la forma de la función, le pone una rampa encima: la exponencial sale del origen en vez de valer 1, y luego crece más deprisa todavía. Esa modificación es lo que en el lado de s se traduce en derivar la transformada y cambiar el signo.',
  () => {
    const l = lienzo({
      id: 'f-ej-multiplicar-por-t',
      ancho: 335, alto: 240,
      x: [-0.25, 1.65], y: [-2, 26], cuadrado: false,
      titulo: 'La exponencial y la misma exponencial multiplicada por t',
      desc: 'Dos curvas crecientes. La primera arranca en la altura uno sobre el eje vertical y '
        + 'sube deprisa. La segunda arranca en el origen, al principio va muy por debajo de la '
        + 'primera y la alcanza en el instante uno, a partir del cual la supera claramente: es '
        + 'la misma exponencial multiplicada por t. El punto donde se cruzan está marcado.',
    });
    l.ejes({ nombreX: 't', nombreY: 'f(t)', marcasX: [[0.5, '0,5'], [1, '1'], [1.5, '1,5']], marcasY: [10, 20] });
    const recorta = (f) => {
      const p = [];
      for (let i = 0; i <= 160; i++) {
        const t = -0.2 + (1.82 * i) / 160;
        const v = f(t);
        if (v > 25) break;
        p.push([t, v]);
      }
      return p;
    };
    l.poli(recorta((t) => Math.exp(3 * t)), { clase: 'g' });
    l.poli(recorta((t) => t * Math.exp(3 * t)), { clase: 'c' });
    l.punto(1, Math.exp(3), { clase: 'o', r: 4.4 });
    l.rotulo(1, Math.exp(3), 'se cruzan en t = 1', { dx: -8, dy: 4, anclaje: 'end', color: 'var(--flag)' });
    l.rotulo(0.72, Math.exp(2.16), 'e³ᵗ', { dx: 6, dy: -4, color: 'var(--faint)' });
    l.rotulo(0.8, 0.8 * Math.exp(2.4), 't·e³ᵗ', { dx: -7, dy: 12, anclaje: 'end' });
    return l.svg();
  });

/* ── a pegar ─────────────────────────────────────────────────────────── */
for (const f of figuras) f.svg = f.hacer();

if (process.argv[1]?.endsWith('calculo-ejemplos-t10.mjs')) {
  for (const f of figuras) pegaEnCampo(f.fichero, f.id, f.campo, f.svg, f.pie);
  console.log(`${figuras.length} figuras de ejemplo pegadas en ${FICHERO}`);
}
