/**
 * Las ocho figuras de los problemas de optimización del tema 4.
 *
 * En un problema de optimización el dibujo no ilustra el método: **es** el
 * primer paso del método. «El rectángulo de área máxima inscrito en una
 * semicircunferencia de radio a» no tiene función objetivo hasta que alguien
 * decide qué llama x, y esa decisión se toma sobre un dibujo. Por eso las ocho
 * figuras marcan la incógnita con su nombre: lo que hay que ver no es la forma
 * bonita, es de dónde sale la ligadura.
 *
 *     node scripts/figuras/calculo-practica-t04-optimizacion.mjs
 */

import { lienzo, vista3d } from './lienzo.mjs';
import { pegaEnCampo } from './pegar.mjs';

export const FICHERO = 'src/content/calculo/t04-estudio-local/ejercicios.yaml';

export const figuras = [];
const fig = (id, pie, hacer) =>
  figuras.push({ fichero: FICHERO, id, campo: 'resolucion', pie, hacer });

const R3 = Math.sqrt(3);

/* ── 1 · un producto máximo con la suma fijada ───────────────────────── */

fig('maximo-con-restriccion',
  'La recta x + y = 6 es la ligadura y las curvas xy² = k son las líneas de nivel de lo que se maximiza. El máximo está donde una de ellas toca la recta sin cruzarla: en (2,4), con k = 32.',
  () => {
    const nivel = (k) => (y) => [k / (y * y), y];
    const traza = (k, y0, y1, clase) => (l) => {
      const p = [];
      for (let i = 0; i <= 90; i++) {
        const y = y0 + ((y1 - y0) * i) / 90;
        const [x] = nivel(k)(y);
        if (x <= 7.2) p.push([x, y]);
      }
      l.poli(p, { clase });
    };
    const l = lienzo({
      id: 'f-maximo-restriccion',
      ancho: 330, alto: 275,
      x: [-0.6, 7.3], y: [-0.6, 7.3], cuadrado: true,
      titulo: 'La recta de la ligadura y las curvas de nivel del producto x por y al cuadrado',
      desc: 'Una recta baja de izquierda a derecha uniendo el punto cero coma seis con el punto '
        + 'seis coma cero: es la condición x más y igual a seis. Cruzándola hay tres curvas con '
        + 'forma de rama de hipérbola, que son los niveles del producto x por y al cuadrado. La '
        + 'de valor dieciséis corta la recta en dos puntos. La de valor cuarenta y ocho no la '
        + 'toca. La de valor treinta y dos la toca en un solo punto, el de coordenadas dos y '
        + 'cuatro, sin cruzarla: ahí está el máximo, y está marcado con un punto.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [2, 6], marcasY: [4, 6] });
    traza(16, 1.55, 7.2, 'g')(l);
    traza(48, 2.7, 7.2, 'g')(l);
    traza(32, 2.15, 7.2, 'c2')(l);
    l.poli([[0, 6], [6, 0]], { clase: 'c' });
    l.poli([[2, 0], [2, 4]], { clase: 'g' });
    l.poli([[0, 4], [2, 4]], { clase: 'g' });
    l.punto(2, 4, { clase: 'o', r: 4.6 });
    l.rotulo(2, 4, '(2,4)', { dx: 8, dy: -5, color: 'var(--flag)' });
    l.rotulo(5.3, 0.7, 'x + y = 6', { dx: 4, dy: 12 });
    l.rotulo(...nivel(32)(5), 'xy² = 32', { dx: 8, dy: -4, color: 'var(--alt)', pequeno: true });
    l.rotulo(...nivel(16)(2), '16', { dx: 6, dy: 12, color: 'var(--faint)', pequeno: true });
    l.rotulo(...nivel(48)(3), '48', { dx: 6, dy: -5, color: 'var(--faint)', pequeno: true });
    return l.svg();
  });

/* ── 2 · el rectángulo bajo la parábola ──────────────────────────────── */

fig('rectangulo-bajo-la-parabola',
  'La simetría de la parábola obliga a que el rectángulo esté centrado, así que con una sola incógnita basta: la semibase x. La altura no es libre —es 6 − x², porque el vértice tiene que estar sobre la curva—, y ahí está toda la ligadura.',
  () => {
    const x = Math.SQRT2;
    const l = lienzo({
      id: 'f-rectangulo-parabola',
      ancho: 330, alto: 265,
      x: [-3.1, 3.1], y: [-1.1, 7.0], cuadrado: false,
      titulo: 'El rectángulo de área máxima bajo la parábola y igual a seis menos x al cuadrado',
      desc: 'Una parábola abierta hacia abajo corta el eje x en menos raíz de seis y en raíz de '
        + 'seis, y pasa por el punto cero coma seis. Dentro de ella, apoyado en el eje x, hay un '
        + 'rectángulo sombreado cuyos dos vértices de arriba están sobre la curva. La semibase '
        + 'está marcada con la letra x y vale raíz de dos, algo más de uno coma cuatro; la '
        + 'altura está marcada como seis menos x al cuadrado y vale cuatro. Líneas de puntos '
        + 'llevan el vértice superior derecho hasta los dos ejes.',
    });
    l.poli([[-x, 0], [x, 0], [x, 4], [-x, 4]], { clase: 'f', cerrar: true });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasY: [4, 6] });
    l.curva((t) => 6 - t * t, [-2.75, 2.75], { clase: 'c', n: 90 });
    l.poli([[-x, 0], [x, 0], [x, 4], [-x, 4]], { clase: 'c2', cerrar: true });
    l.poli([[x, 4], [0, 4]], { clase: 'g' });
    l.poli([[x, 0], [x, 4]], { clase: 'g' });
    l.punto(x, 4, { clase: 'o', r: 4.4 });
    l.punto(-x, 4, { clase: 'o', r: 4.4 });
    l.rotulo(x / 2, 0, 'x', { dx: 0, dy: 15, anclaje: 'middle', color: 'var(--flag)' });
    l.rotulo(x, 2, '6 − x²', { dx: 7, dy: 4, color: 'var(--flag)' });
    l.esquina(10, 17, 'y = 6 − x²');
    return l.svg();
  });

/* ── 3 · el triángulo de área mínima ─────────────────────────────────── */

fig('triangulo-de-area-minima',
  'La hipotenusa tiene que pasar por (3,7), y eso es lo único que la ata: al inclinarla, un cateto crece mientras el otro se encoge. Las dos posiciones grises son triángulos válidos y peores; el bueno es el de catetos 6 y 14.',
  () => {
    const l = lienzo({
      id: 'f-triangulo-minimo',
      ancho: 320, alto: 285,
      x: [-1.2, 13.4], y: [-1.9, 18.5], cuadrado: false,
      titulo: 'El triángulo rectángulo de área mínima con la hipotenusa pasando por el punto tres coma siete',
      desc: 'Tres triángulos rectángulos comparten el vértice del ángulo recto en el origen y '
        + 'tienen sus catetos sobre los ejes. Los tres tienen la hipotenusa pasando por el mismo '
        + 'punto, el de coordenadas tres y siete, que está marcado. Dos de ellos, dibujados con '
        + 'trazo fino, son más grandes: uno tiene la hipotenusa muy tumbada y el otro muy '
        + 'empinada. El tercero, sombreado y con trazo grueso, es el de área mínima: corta el '
        + 'eje x en seis y el eje y en catorce, y su área vale cuarenta y dos.',
    });
    /* La hipotenusa pasa por (3,7): si corta OX en a, corta OY en 7a/(a−3). */
    const corte = (a) => (7 * a) / (a - 3);
    l.poli([[0, 0], [6, 0], [0, 14]], { clase: 'f', cerrar: true });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [3, 6], marcasY: [7, 14] });
    for (const a of [5, 12]) l.poli([[0, 0], [a, 0], [0, corte(a)]], { clase: 'g', cerrar: true });
    l.poli([[0, 0], [6, 0], [0, 14]], { clase: 'c', cerrar: true });
    l.poli([[3, 0], [3, 7]], { clase: 'g' });
    l.poli([[0, 7], [3, 7]], { clase: 'g' });
    l.punto(3, 7, { clase: 'o', r: 4.6 });
    l.rotulo(3, 7, '(3,7)', { dx: 8, dy: 4, color: 'var(--flag)' });
    l.rotulo(1.6, 3.2, 'A = 42', { dx: 0, dy: 0, anclaje: 'middle' });
    l.rotulo(11.2, corte(12) / 2, 'peores', { dx: -4, dy: 0, anclaje: 'end', color: 'var(--faint)', pequeno: true });
    return l.svg();
  });

/* ── 4 · la caja sin tapa ────────────────────────────────────────────── */

fig('caja-sin-tapa',
  'Base cuadrada de lado x y altura h. El volumen fija una de las dos —h = 108/x²— y el cartón que se gasta es la base más las cuatro paredes: el techo no cuenta, y por eso la caja óptima sale más ancha que alta.',
  () => {
    const p3 = vista3d({ escalaXY: 0.95, inclinacion: 0.42 });
    const V = {
      a: p3(0, 0, 0), b: p3(6, 0, 0), c: p3(6, 6, 0), d: p3(0, 6, 0),
      A: p3(0, 0, 3), B: p3(6, 0, 3), C: p3(6, 6, 3), D: p3(0, 6, 3),
    };
    const l = lienzo({
      id: 'f-caja-sin-tapa',
      ancho: 320, alto: 245,
      x: [-7.5, 7.5], y: [-1.6, 8.6], cuadrado: false,
      titulo: 'La caja de base cuadrada y sin tapa, con el lado y la altura marcados',
      desc: 'Una caja vista en perspectiva, de base cuadrada y sin tapa: se ve el interior del '
        + 'fondo, sombreado, y las cuatro paredes verticales, de las cuales las dos de delante '
        + 'se dibujan con trazo continuo y las dos de detrás con trazo fino. El borde de arriba '
        + 'queda abierto. El lado de la base está rotulado con la letra x y vale seis metros; la '
        + 'altura está rotulada con la letra h y vale tres, la mitad. La caja es claramente más '
        + 'ancha que alta.',
    });
    l.poli([V.a, V.b, V.c, V.d], { clase: 'f', cerrar: true });
    l.poli([V.a, V.b, V.c, V.d], { clase: 'g', cerrar: true });
    l.poli([V.d, V.D], { clase: 'g' });
    l.poli([V.c, V.C], { clase: 'g' });
    l.poli([V.D, V.C], { clase: 'g' });
    l.poli([V.a, V.A], { clase: 'c' });
    l.poli([V.b, V.B], { clase: 'c' });
    l.poli([V.a, V.b], { clase: 'c' });
    l.poli([V.A, V.B, V.C, V.D], { clase: 'c2', cerrar: true });
    l.rotulo(...p3(3, 0, 0), 'x = 6', { dx: 0, dy: 16, anclaje: 'middle', color: 'var(--flag)' });
    l.rotulo(...p3(6, 0, 1.5), 'h = 3', { dx: 8, dy: 4, color: 'var(--flag)' });
    l.esquina(8, 16, 'sin tapa', { color: 'var(--alt)' });
    return l.svg();
  });

/* ── 5 · el canal de capacidad máxima ────────────────────────────────── */

fig('canal-de-capacidad-maxima',
  'La sección es un trapecio de base 10 y lados 10, y lo único libre es el ángulo α. Con α = 60° los tres lados quedan iguales al de un hexágono regular, y la base superior mide 20: el doble de la de abajo.',
  () => {
    const a = Math.PI / 3;
    const h = 10 * Math.sin(a), d = 10 * Math.cos(a);
    const l = lienzo({
      id: 'f-canal-maximo',
      ancho: 340, alto: 235,
      x: [-8, 18], y: [-2.6, 12.6], cuadrado: true,
      titulo: 'La sección del canal con el ángulo óptimo de sesenta grados',
      desc: 'La sección del canal es un trapecio abierto por arriba. La base mide diez metros y '
        + 'está apoyada en horizontal. De cada extremo sale un lado de diez metros, inclinado '
        + 'sesenta grados sobre la base y abriéndose hacia fuera, de modo que el trapecio es más '
        + 'ancho arriba que abajo. La anchura de arriba, marcada con una doble flecha, vale '
        + 'veinte metros: el doble de la base. La altura del agua es diez por el seno de sesenta '
        + 'grados, unos ocho coma sesenta y seis. El ángulo alfa está marcado en el extremo '
        + 'izquierdo de la base con un pequeño arco.',
    });
    const P0 = [0, 0], P1 = [10, 0], Q1 = [10 + d, h], Q0 = [-d, h];
    l.poli([P0, P1, Q1, Q0], { clase: 'f', cerrar: true });
    l.poli([Q0, P0, P1, Q1], { clase: 'c' });
    l.poli([[-6, 0], [16, 0]], { clase: 'eje' });
    l.poli([[Q0[0], h + 1.6], [Q1[0], h + 1.6]], { clase: 'cp2' });
    l.flecha([Q0[0] + 2.4, h + 1.6], [Q0[0], h + 1.6], { clase: 'cp2', color: 'var(--alt)', punta: 6 });
    l.flecha([Q1[0] - 2.4, h + 1.6], [Q1[0], h + 1.6], { clase: 'cp2', color: 'var(--alt)', punta: 6 });
    /* El ángulo se mide entre el lado y la prolongación de la base hacia
       fuera, que es lo que quiere decir «inclinación sobre la base»: el
       ángulo interior del trapecio en ese vértice es el suplementario, 120°,
       y marcarlo ahí diría otra cosa. */
    const arco = [];
    for (let i = 0; i <= 24; i++) {
      const t = Math.PI - (a * i) / 24;
      arco.push([2.6 * Math.cos(t), 2.6 * Math.sin(t)]);
    }
    l.poli(arco, { clase: 'g' });
    l.rotulo(5, 0, '10', { dx: 0, dy: 15, anclaje: 'middle', color: 'var(--flag)' });
    l.rotulo(-d / 2, h / 2, '10', { dx: -7, dy: 0, anclaje: 'end', color: 'var(--flag)' });
    l.rotulo(5, h + 1.6, '20', { dx: 0, dy: -7, anclaje: 'middle', color: 'var(--alt)' });
    l.rotulo(-3.4, 1.85, 'α = 60°', { dx: -4, dy: 2, anclaje: 'end', pequeno: true });
    return l.svg();
  });

/* ── 6 · el rectángulo en la semicircunferencia ──────────────────────── */

fig('rectangulo-en-semicircunferencia',
  'Media circunferencia de radio a y el rectángulo inscrito de área máxima. Sale el doble de ancho que de alto, y su área es exactamente a², es decir, el cuadrado del radio: dos tercios del semicírculo.',
  () => {
    const x = 1 / Math.SQRT2;
    const l = lienzo({
      id: 'f-rectangulo-semicirc',
      ancho: 320, alto: 220,
      x: [-1.35, 1.35], y: [-0.35, 1.35], cuadrado: true,
      titulo: 'El rectángulo de área máxima inscrito en una semicircunferencia de radio a',
      desc: 'Media circunferencia de radio a, con el diámetro apoyado en horizontal sobre el eje '
        + 'x, de menos a a más a. Dentro, apoyado en ese diámetro, hay un rectángulo sombreado '
        + 'cuyos dos vértices de arriba tocan el arco. Es claramente más ancho que alto: la base '
        + 'mide a por raíz de dos y la altura, a partido por raíz de dos, la mitad de la base. '
        + 'Desde el centro sale un radio hasta el vértice superior derecho, rotulado con la letra '
        + 'a, y la semibase del rectángulo está rotulada con la letra x.',
    });
    l.poli([[-x, 0], [x, 0], [x, x], [-x, x]], { clase: 'f', cerrar: true });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [[-1, '−a'], [1, 'a']] });
    const semi = [];
    for (let i = 0; i <= 90; i++) {
      const t = (Math.PI * i) / 90;
      semi.push([Math.cos(t), Math.sin(t)]);
    }
    l.poli(semi, { clase: 'c' });
    l.poli([[-1, 0], [1, 0]], { clase: 'c' });
    l.poli([[-x, 0], [x, 0], [x, x], [-x, x]], { clase: 'c2', cerrar: true });
    l.poli([[0, 0], [x, x]], { clase: 'g' });
    l.punto(x, x, { clase: 'o', r: 4.2 });
    l.punto(-x, x, { clase: 'o', r: 4.2 });
    l.rotulo(x / 2, 0, 'x', { dx: 0, dy: 15, anclaje: 'middle', color: 'var(--flag)' });
    l.rotulo(x / 2, x / 2, 'a', { dx: -3, dy: -5, anclaje: 'end' });
    l.rotulo(x, x / 2, '√(a²−x²)', { dx: 7, dy: 4, color: 'var(--flag)', pequeno: true });
    return l.svg();
  });

/* ── 7 · el rectángulo en el triángulo equilátero ────────────────────── */

fig('rectangulo-en-triangulo-equilatero',
  'El rectángulo inscrito de área máxima tiene exactamente la mitad de la altura del triángulo y la mitad de su lado. Ocupa el 50 % del triángulo, y esa proporción no depende del tamaño: sale la misma para cualquier a.',
  () => {
    const H = R3 / 2;
    const h = H / 2;
    const l = lienzo({
      id: 'f-rectangulo-equilatero',
      ancho: 320, alto: 250,
      x: [-0.3, 1.3], y: [-0.28, 1.15], cuadrado: true,
      titulo: 'El rectángulo de área máxima inscrito en un triángulo equilátero de lado a',
      desc: 'Un triángulo equilátero apoyado sobre su base, con el lado marcado como a. Dentro, '
        + 'apoyado también en la base, hay un rectángulo sombreado cuyos dos vértices de arriba '
        + 'tocan los lados inclinados del triángulo. Su altura es exactamente la mitad de la '
        + 'altura del triángulo, marcada con una línea de puntos horizontal a media altura, y su '
        + 'base es exactamente la mitad del lado. El rectángulo ocupa la mitad del triángulo.',
    });
    l.poli([[0.25, 0], [0.75, 0], [0.75, h], [0.25, h]], { clase: 'f', cerrar: true });
    l.poli([[0, 0], [1, 0], [0.5, H]], { clase: 'c', cerrar: true });
    l.poli([[0.25, 0], [0.75, 0], [0.75, h], [0.25, h]], { clase: 'c2', cerrar: true });
    l.poli([[0.1, h], [0.9, h]], { clase: 'g' });
    l.poli([[0.5, 0], [0.5, H]], { clase: 'g' });
    l.punto(0.25, h, { clase: 'o', r: 4 });
    l.punto(0.75, h, { clase: 'o', r: 4 });
    l.rotulo(0.5, 0, 'a', { dx: 0, dy: 15, anclaje: 'middle' });
    l.rotulo(0.5, h / 2, 'a/2', { dx: 0, dy: 4, anclaje: 'middle', color: 'var(--flag)' });
    l.rotulo(0.9, h, 'H/2', { dx: 5, dy: 4, color: 'var(--flag)', pequeno: true });
    l.rotulo(0.5, H, 'H = a√3/2', { dx: 6, dy: -5 });
    return l.svg();
  });

/* ── 8 · el póster con márgenes ──────────────────────────────────────── */

fig('poster-con-margenes',
  'Lo que está fijado es el rectángulo de dentro, 216 cm². Los márgenes son constantes, así que el de fuera mide siempre 4 cm más de ancho y 6 cm más de alto: esa es la relación que convierte el problema en una sola variable.',
  () => {
    const l = lienzo({
      id: 'f-poster-margenes',
      ancho: 300, alto: 285,
      x: [-3.4, 19.4], y: [-3.4, 27.4], cuadrado: true,
      titulo: 'El póster de dieciséis por veinticuatro con la inscripción de doce por dieciocho dentro',
      desc: 'Un rectángulo grande, el póster, de dieciséis centímetros de ancho por veinticuatro '
        + 'de alto. Dentro, centrado, hay otro rectángulo sombreado que es la inscripción, de '
        + 'doce por dieciocho, cuya área vale doscientos dieciséis centímetros cuadrados. Entre '
        + 'los dos quedan los márgenes: dos centímetros a cada lado y tres centímetros arriba y '
        + 'abajo, marcados con sus medidas. La anchura total está rotulada como w más cuatro y '
        + 'la altura total como h más seis.',
    });
    l.poli([[0, 0], [16, 0], [16, 24], [0, 24]], { clase: 'c', cerrar: true });
    l.poli([[2, 3], [14, 3], [14, 21], [2, 21]], { clase: 'f', cerrar: true });
    l.poli([[2, 3], [14, 3], [14, 21], [2, 21]], { clase: 'c2', cerrar: true });
    l.poli([[0, 3], [2, 3]], { clase: 'g' });
    l.poli([[2, 0], [2, 3]], { clase: 'g' });
    l.rotulo(8, 12, '216 cm²', { dx: 0, dy: 4, anclaje: 'middle' });
    l.rotulo(8, 11, 'w × h', { dx: 0, dy: 20, anclaje: 'middle', color: 'var(--alt)', pequeno: true });
    l.rotulo(1, 12, '2', { dx: 0, dy: 4, anclaje: 'middle', color: 'var(--flag)', pequeno: true });
    l.rotulo(8, 1.5, '3', { dx: 0, dy: 4, anclaje: 'middle', color: 'var(--flag)', pequeno: true });
    l.esquina(6, 16, 'márgenes 2 y 3 cm', { color: 'var(--faint)' });
    l.rotulo(8, 24, 'w + 4 = 16', { dx: 0, dy: -8, anclaje: 'middle' });
    l.rotulo(16, 12, 'h + 6 = 24', { dx: 7, dy: 4 });
    return l.svg();
  });

/* ── a pegar ─────────────────────────────────────────────────────────── */
for (const f of figuras) f.svg = f.hacer();

if (process.argv[1]?.endsWith('calculo-practica-t04-optimizacion.mjs')) {
  for (const f of figuras) pegaEnCampo(f.fichero, f.id, f.campo, f.svg, f.pie);
  console.log(`${figuras.length} figuras de optimización pegadas en ${FICHERO}`);
}
