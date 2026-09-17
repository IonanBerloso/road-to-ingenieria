/**
 * Las figuras de las prácticas del tema 3 que son aplicaciones.
 *
 * Aquí hay dos grupos. Los de velocidades relacionadas —el coche que se aleja
 * del incendio, el avión visto por el radar— son problemas de triángulo: sin
 * el triángulo delante no hay ecuación que derivar, y uno de ellos dice
 * literalmente «el coche de la figura» sobre una figura que el boletín tiene y
 * nosotros no teníamos. Los otros son de lectura: un dominio y un rango se
 * leen sobre los ejes, y una inversa es la misma curva reflejada en y = x.
 *
 *     node scripts/figuras/calculo-practica-t03-aplicaciones.mjs
 */

import { lienzo, mosaico } from './lienzo.mjs';
import { pegaEnCampo } from './pegar.mjs';

export const FICHERO = 'src/content/calculo/t03-funciones-reales/ejercicios.yaml';

export const figuras = [];
const fig = (id, pie, hacer) =>
  figuras.push({ fichero: FICHERO, id, campo: 'resolucion', pie, hacer });

const P = Math.PI;

/** La curva de `f` reflejada en la recta y = x, que es su inversa. */
const reflejada = (f, [a, b], n = 90) =>
  Array.from({ length: n + 1 }, (_, k) => {
    const t = a + ((b - a) * k) / n;
    return [f(t), t];
  });

/* ── 1 · a qué velocidad se aleja el coche del incendio ──────────────── */

fig('coche-y-edificio',
  'El triángulo que el enunciado describe y no dibuja: catetos 3 y 4, hipotenusa 5. Derivando x²+9 = z² sale z·z′ = x·x′, y como x/z = 4/5, la velocidad de alejamiento es 4/5 de los 5 km/h del coche: 4 km/h.',
  () => {
    const l = lienzo({
      id: 'f-coche-edificio',
      ancho: 330, alto: 250,
      x: [-0.9, 5.6], y: [-1.1, 4.1], cuadrado: true,
      titulo: 'El triángulo rectángulo entre el cruce, el edificio y el coche',
      desc: 'Un triángulo rectángulo con el ángulo recto en el cruce de las dos carreteras. Un '
        + 'cateto vertical de tres kilómetros sube desde el cruce hasta el edificio en llamas. '
        + 'Un cateto horizontal de cuatro kilómetros va desde el cruce hasta el coche, que está '
        + 'a la derecha sobre la carretera. La hipotenusa, de cinco kilómetros, une el edificio '
        + 'con el coche: es la distancia que interesa. Una flecha sobre la carretera indica que '
        + 'el coche se mueve hacia la derecha a cinco kilómetros por hora, y otra flecha sobre '
        + 'la hipotenusa indica que la distancia al edificio crece a cuatro.',
    });
    l.poli([[-0.8, 0], [5.5, 0]], { clase: 'eje' });
    l.poli([[0, 0], [0, 3.6]], { clase: 'eje' });
    l.poli([[0, 0], [4, 0], [0, 3]], { clase: 'f', cerrar: true });
    l.poli([[0, 0], [4, 0], [0, 3]], { clase: 'c', cerrar: true });
    l.poli([[0, 0.35], [0.35, 0.35], [0.35, 0]], { clase: 'g' });
    l.flecha([4.3, 0], [5.2, 0], { clase: 'c2', color: 'var(--alt)' });
    l.flecha([2.2, 1.35], [2.75, 0.94], { clase: 'c2', color: 'var(--alt)' });
    l.punto(0, 3, { clase: 'o', r: 5 });
    l.punto(4, 0, { clase: 'o', r: 5 });
    l.punto(0, 0, { r: 3.4 });
    l.rotulo(0, 3, 'edificio', { dx: 6, dy: -5, color: 'var(--flag)' });
    l.rotulo(4, 0, 'coche', { dx: 3, dy: -9, color: 'var(--flag)' });
    l.rotulo(0, 0, 'cruce', { dx: -6, dy: 14, anclaje: 'end', color: 'var(--faint)', pequeno: true });
    l.rotulo(0, 1.5, '3 km', { dx: -7, dy: 4, anclaje: 'end' });
    l.rotulo(2, 0, 'x = 4 km', { dx: 0, dy: 15, anclaje: 'middle' });
    l.rotulo(2.3, 1.7, 'z = 5 km', { dx: 6, dy: -4 });
    l.rotulo(4.75, 0, '5 km/h', { dx: 0, dy: -13, anclaje: 'middle', color: 'var(--alt)', pequeno: true });
    l.rotulo(2.75, 0.94, 'z′ = 4', { dx: 8, dy: 8, color: 'var(--alt)' });
    return l.svg();
  });

/* ── 2 · la velocidad de un avión medida por su ángulo ───────────────── */

fig('avion-y-radar',
  'El dato que cambia es el ángulo, no la distancia, así que la relación que hay que derivar es la que los liga: x = h/tg θ. Los 0,5 grados por segundo hay que pasarlos a radianes antes de derivar nada — es el paso donde más se falla.',
  () => {
    const h = 6;
    const x0 = h / Math.tan(P / 6);
    const l = lienzo({
      id: 'f-avion-radar',
      ancho: 340, alto: 220,
      x: [-1.4, 13.5], y: [-1.8, 8.2], cuadrado: true,
      titulo: 'El avión, la estación de radar y el ángulo de visión de treinta grados',
      desc: 'Sobre una línea horizontal que representa el suelo hay una estación de radar a la '
        + 'izquierda. A seis kilómetros de altura y a unos diez kilómetros y medio en '
        + 'horizontal vuela el avión, hacia la izquierda, es decir, acercándose al radar. La '
        + 'visual del radar al avión forma con el suelo un ángulo de treinta grados, marcado con '
        + 'un pequeño arco. Una línea vertical de puntos baja del avión al suelo y está rotulada '
        + 'con la altura de seis kilómetros; el tramo de suelo entre el radar y el pie de esa '
        + 'vertical está rotulado con la letra x.',
    });
    l.poli([[-1.3, 0], [13.4, 0]], { clase: 'eje' });
    l.poli([[0, 0], [x0, h]], { clase: 'c' });
    l.poli([[x0, 0], [x0, h]], { clase: 'g' });
    const arco = Array.from({ length: 25 }, (_, i) => {
      const t = (P / 6) * (i / 24);
      return [2.4 * Math.cos(t), 2.4 * Math.sin(t)];
    });
    l.poli(arco, { clase: 'g' });
    l.flecha([x0 - 0.3, h], [x0 - 2.4, h], { clase: 'c2', color: 'var(--alt)' });
    l.punto(0, 0, { clase: 'o', r: 4.6 });
    l.punto(x0, h, { clase: 'o', r: 4.6 });
    l.rotulo(0, 0, 'radar', { dx: 0, dy: 15, anclaje: 'middle', color: 'var(--flag)' });
    l.rotulo(x0, h, 'avión', { dx: 7, dy: -4, color: 'var(--flag)' });
    l.rotulo(2.9, 0.85, 'θ = 30°', { dx: 4, dy: 2, pequeno: true });
    l.rotulo(x0, 3, 'h = 6 km', { dx: 7, dy: 4 });
    l.rotulo(x0 / 2, 0, 'x', { dx: 0, dy: 15, anclaje: 'middle' });
    l.rotulo(x0 - 1.35, h, 'v', { dx: 0, dy: -7, anclaje: 'middle', color: 'var(--alt)' });
    return l.svg();
  });

/* ── 3 · tres tramos de carretera que empalman suave ─────────────────── */

fig('carretera-con-tramo-parabolico',
  'La escala vertical va muy exagerada: 36 metros de desnivel sobre 2 km de carretera, que a escala verdadera serían invisibles. Lo que sí es exacto es la condición: la parábola tiene que salir con pendiente 6 % y llegar con −4 %, y eso fija sus dos coeficientes.',
  () => {
    /* En metros la vertical y en kilómetros la horizontal, que es como se
       dibuja un perfil longitudinal de verdad. Sin decirlo, el dibujo haría
       creer que la carretera sube como un tobogán. */
    const par = (x) => (-0.025 * x * x + 0.06 * x) * 1000;
    const l = lienzo({
      id: 'f-carretera-parabolica',
      ancho: 340, alto: 230,
      x: [-1.25, 3.3], y: [-72, 58], cuadrado: false,
      titulo: 'El perfil de la carretera: recta al 6 %, tramo parabólico de dos kilómetros y recta al 4 %',
      desc: 'El perfil de la carretera visto de lado, con la altura muy exagerada respecto de la '
        + 'distancia. Por la izquierda entra una recta que sube con una pendiente del seis por '
        + 'ciento hasta el punto A. Desde A arranca un tramo curvo de dos kilómetros de largo '
        + 'que sube cada vez menos, alcanza su punto más alto a unos treinta y seis metros por '
        + 'encima de A y empieza a bajar, llegando al punto B a veinte metros de altura. Desde B '
        + 'sale una recta que baja con una pendiente del cuatro por ciento. En A y en B las '
        + 'pendientes de la curva y de las rectas coinciden, de modo que no hay ningún quiebro.',
    });
    l.ejes({
      nombreX: 'x (km)', nombreY: 'altura (m)', enX: -72,
      marcasX: [[0, 'A'], [2, 'B']], marcasY: [],
    });
    l.curva((x) => 60 * x, [-1.2, 0], { clase: 'c2', n: 2 });
    l.curva(par, [0, 2], { clase: 'c', n: 90 });
    l.curva((x) => 20 - 40 * (x - 2), [2, 3.25], { clase: 'c2', n: 2 });
    l.poli([[1.2, -72], [1.2, par(1.2)]], { clase: 'g' });
    l.punto(0, 0, { clase: 'o', r: 4.4 });
    l.punto(2, 20, { clase: 'o', r: 4.4 });
    l.punto(1.2, par(1.2), { r: 3.6 });
    l.rotulo(-0.75, 60 * -0.75, 'sube 6 %', { dx: 0, dy: -8, anclaje: 'middle', color: 'var(--alt)' });
    l.rotulo(2.8, 20 - 40 * 0.8, 'baja 4 %', { dx: 0, dy: -8, anclaje: 'middle', color: 'var(--alt)' });
    l.rotulo(1.3, par(1.2), 'lo más alto: 36 m', { dx: 6, dy: -7 });
    l.rotulo(2, 20, 'B: 20 m', { dx: 7, dy: 12, color: 'var(--flag)' });
    l.esquina(10, 17, 'altura muy exagerada', { color: 'var(--faint)' });
    return l.svg();
  });

/* ── 4 · aproximar con el diferencial ────────────────────────────────── */

fig('aproximar-con-el-diferencial',
  'Los cuatro se resuelven igual: se elige un punto de apoyo donde la función se sepa de memoria y se avanza por la tangente. El error es el hueco entre la recta y la curva, y por eso conviene que el punto de apoyo esté lo más cerca posible del que se busca.',
  () => {
    /* Los cuatro son acercamientos a un trocito de curva, y en ninguno cae el
       origen dentro. Así que aquí las dos rectas **no son los ejes**: son el
       marco del recuadro con su escala, dibujado en el borde y con las marcas
       en sus valores verdaderos. Pintar un eje por el borde y llamarlo «x»
       sería decir que el cero está ahí. */
    const celda = (etiqueta, f, df, a, buscado, x, y, marcaX, marcaY) => ({
      etiqueta,
      x, y, cuadrado: false,
      /* Margen ancho a la izquierda: las marcas del marco se escriben fuera de
         la recta vertical, y con el margen de siempre no les cabe el rótulo. */
      margen: 40,
      dibuja: (l) => {
        l.ejes({ nombreX: 'x', nombreY: 'y', enX: y[0], enY: x[0], marcasX: marcaX, marcasY: marcaY });
        l.curva(f, x, { clase: 'c', n: 80 });
        l.curva((t) => f(a) + df(a) * (t - a), x, { clase: 'c2', n: 2 });
        l.poli([[buscado, y[0]], [buscado, f(a) + df(a) * (buscado - a)]], { clase: 'g' });
        l.punto(a, f(a), { r: 3.6 });
        l.punto(buscado, f(a) + df(a) * (buscado - a), { clase: 'o', r: 3.8 });
      },
    });
    return mosaico({
      id: 'f-aproximar-diferencial',
      columnas: 2,
      ancho: 210,
      alto: 160,
      titulo: 'Los cuatro valores aproximados con la recta tangente en un punto cómodo',
      desc: 'Cuatro recuadros. En cada uno se ve la curva de la función y, tocándola en un punto '
        + 'donde su valor se conoce de memoria, la recta tangente. Una línea vertical de puntos '
        + 'sube desde el eje horizontal en el valor que se quiere aproximar hasta cortar la '
        + 'recta, y ahí hay un punto marcado: esa altura es la aproximación. El hueco que queda '
        + 'entre la recta y la curva en ese mismo sitio es el error que se comete, y se ve que '
        + 'es tanto menor cuanto más cerca está el valor buscado del punto de apoyo.',
      celdas: [
        celda('(a) e^0,2 desde x=0', Math.exp, Math.exp, 0, 0.2, [-0.45, 0.85], [0.35, 2.5],
          [[0, '0'], [0.2, '0,2']], [[1, '1'], [2, '2']]),
        celda('(b) ln 0,9 desde x=1', Math.log, (t) => 1 / t, 1, 0.9, [0.55, 1.65], [-0.62, 0.55],
          [[0.9, '0,9']], [[0, '0'], [0.4, '0,4']]),
        celda('(c) √27 desde x=25', Math.sqrt, (t) => 1 / (2 * Math.sqrt(t)), 25, 27, [22, 30], [4.4, 5.6],
          [[25, '25'], [27, '27']], [[5, '5'], [5.4, '5,4']]),
        celda('(d) sen 58° desde 60°', Math.sin, Math.cos, P / 3, (58 * P) / 180, [0.82, 1.22], [0.72, 0.99],
          [[(58 * P) / 180, '58°']], [[0.85, '0,9']]),
      ],
    });
  });

/* ── 5 · seis dominios y seis rangos ─────────────────────────────────── */

fig('dominio-y-rango',
  'El dominio se lee sobre el eje horizontal y el rango sobre el vertical: son la sombra de la curva sobre cada eje. En (a), (b) y (c) el dominio es toda la recta y lo que se recorta es el rango; en (d), (e) y (f) es al revés.',
  () => {
    const celda = (etiqueta, f, dom, x, y, marcaX, marcaY) => ({
      etiqueta,
      x, y, cuadrado: false,
      dibuja: (l) => {
        l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: marcaX, marcasY: marcaY });
        l.curva(f, dom, { clase: 'c', n: 110 });
      },
    });
    return mosaico({
      id: 'f-dominio-rango',
      columnas: 3,
      titulo: 'Las seis funciones, con su dominio en el eje horizontal y su rango en el vertical',
      desc: 'Seis recuadros. Una parábola con el vértice por debajo del eje; una sinusoide que '
        + 'oscila entre menos uno y tres; una uve con el vértice a la altura dos; media rama de '
        + 'raíz que arranca en el punto uno coma menos dos y sube; un arcoseno estirado que solo '
        + 'existe entre menos un medio y un medio y recorre alturas de cero a tres pi; y un '
        + 'arcocoseno desplazado que solo existe entre menos uno y uno y recorre alturas de '
        + 'menos pi a cero. En cada uno, las marcas de los ejes señalan hasta dónde llega la '
        + 'curva en horizontal y en vertical.',
      celdas: [
        celda('(a) x²−3x+2', (x) => x * x - 3 * x + 2, [-0.6, 3.6], [-1.2, 4.2], [-1.6, 4.2], [1, 3], [2]),
        celda('(b) 1+2sen x', (x) => 1 + 2 * Math.sin(x), [-6.4, 6.4], [-6.8, 6.8], [-1.9, 3.9], [], [[3, '3'], [-1, '−1']]),
        celda('(c) 2+|x+1|', (x) => 2 + Math.abs(x + 1), [-4.4, 2.4], [-4.8, 2.8], [-0.9, 5.7], [-1], [2]),
        celda('(d) √(x−1)−2', (x) => Math.sqrt(x - 1) - 2, [1, 8.4], [-1.2, 8.8], [-2.9, 1.5], [1], [[-2, '−2']]),
        celda('(e) 3π/2+3arcsin 2x', (x) => 1.5 * P + 3 * Math.asin(2 * x), [-0.5, 0.5], [-0.72, 0.72], [-1.2, 10.4], [[-0.5, '−½'], [0.5, '½']], [[3 * P, '3π']]),
        celda('(f) −π+arccos x', (x) => -P + Math.acos(x), [-1, 1], [-1.45, 1.45], [-3.9, 1.1], [-1, 1], [[-P, '−π']]),
      ],
    });
  });

/* ── 6 · seis inversas ───────────────────────────────────────────────── */

fig('funcion-inversa',
  'Cuatro de las seis. La inversa es la misma curva reflejada en la recta y = x: el dominio y el rango se intercambian, y por eso el dominio de la inversa es siempre el rango de la original. En (b) la reflexión enseña de un vistazo cuál de las dos ramas hay que quedarse.',
  () => {
    const celda = (etiqueta, f, dom, x, y, dibuja) => ({
      etiqueta,
      x, y, cuadrado: true,
      dibuja: (l) => {
        l.ejes({ nombreX: 'x', nombreY: 'y' });
        l.curva((t) => t, x, { clase: 'g', n: 2 });
        l.curva(f, dom, { clase: 'c', n: 90 });
        l.poli(reflejada(f, dom), { clase: 'c2' });
        if (dibuja) dibuja(l);
      },
    });
    return mosaico({
      id: 'f-funcion-inversa',
      columnas: 2,
      ancho: 200,
      alto: 175,
      titulo: 'Cuatro funciones con su inversa, reflejadas en la recta y igual a x',
      desc: 'Cuatro recuadros. En cada uno hay tres trazos: la recta y igual a x con trazo fino, '
        + 'la función original con trazo grueso, y su inversa con otro color. La inversa es '
        + 'siempre la imagen de la original en un espejo colocado sobre la recta fina: donde una '
        + 'sube deprisa la otra sube despacio, y los extremos de una son los extremos de la otra '
        + 'con las coordenadas cambiadas de sitio.',
      celdas: [
        celda('(a) 1+e²ˣ', (t) => 1 + Math.exp(2 * t), [-1.6, 0.6], [-1.6, 4.6], [-1.6, 4.6]),
        celda('(b) x²−1 en x≤0', (t) => t * t - 1, [-2.05, 0], [-2.4, 3.4], [-2.4, 3.4]),
        celda('(c) ln(x+3)', (t) => Math.log(t + 3), [-2.9, 3.4], [-3.4, 3.4], [-3.4, 3.4]),
        celda('(d) cos(x−1) en [1,π+1]', (t) => Math.cos(t - 1), [1, P + 1], [-1.4, 4.4], [-1.4, 4.4]),
      ],
    });
  });

/* ── 7 · dos derivadas como manda la definición ──────────────────────── */

fig('derivada-por-definicion',
  'La definición es el límite de la pendiente de la secante cuando el segundo punto se acerca al primero. Las tres secantes del dibujo se van tumbando hacia la tangente, y ese tumbarse es lo que el cociente incremental calcula.',
  () => {
    const f = (x) => x ** 3;
    const a = 0.85;
    const l = lienzo({
      id: 'f-derivada-definicion',
      ancho: 330, alto: 255,
      x: [-0.35, 2.1], y: [-1.2, 6.2], cuadrado: false,
      titulo: 'Tres secantes acercándose a la tangente en la cúbica',
      desc: 'La curva x al cubo sube de izquierda a derecha. Sobre ella hay un punto fijo y tres '
        + 'puntos más a su derecha, cada vez más cerca del primero. Desde el punto fijo sale una '
        + 'recta hacia cada uno de los tres: son las secantes, y cada una está menos inclinada '
        + 'que la anterior. La última recta, dibujada con más grosor, es la tangente en el punto '
        + 'fijo: es el límite al que se acercan las secantes cuando el segundo punto se pega al '
        + 'primero.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2], marcasY: [2, 4] });
    l.curva(f, [-0.3, 1.78], { clase: 'c', n: 110 });
    /* Cada secante se dibuja solo alrededor de sus dos puntos: prolongarlas
       todas hasta el borde las sacaría del marco y, peor, taparía la curva. */
    for (const h of [0.85, 0.5, 0.25]) {
      const m = (f(a + h) - f(a)) / h;
      const [u, v] = [a - 0.2, a + h + 0.15];
      l.poli([[u, f(a) + m * (u - a)], [v, f(a) + m * (v - a)]], { clase: 'g' });
      l.punto(a + h, f(a + h), { r: 3.2 });
    }
    const m0 = 3 * a * a;
    l.poli([[0.35, f(a) + m0 * (0.35 - a)], [2.0, f(a) + m0 * (2.0 - a)]], { clase: 'c2' });
    l.punto(a, f(a), { clase: 'o', r: 4.6 });
    l.rotulo(a, f(a), 'x₀', { dx: -7, dy: 15, anclaje: 'end', color: 'var(--flag)' });
    l.rotulo(1.7, f(a) + m0 * (1.7 - a), 'tangente', { dx: 5, dy: 12, color: 'var(--alt)' });
    l.esquina(10, 17, 'las secantes se tumban hacia ella');
    return l.svg();
  });

/* ── a pegar ─────────────────────────────────────────────────────────── */
for (const f of figuras) f.svg = f.hacer();

if (process.argv[1]?.endsWith('calculo-practica-t03-aplicaciones.mjs')) {
  for (const f of figuras) pegaEnCampo(f.fichero, f.id, f.campo, f.svg, f.pie);
  console.log(`${figuras.length} figuras de aplicación pegadas en ${FICHERO}`);
}
