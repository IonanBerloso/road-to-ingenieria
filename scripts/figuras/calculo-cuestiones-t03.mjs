/**
 * Las figuras de las cuestiones del tema 3 de Cálculo, las de las
 * diapositivas de «Funciones reales de una variable real» (fase E3 de la
 * auditoría del 27 de septiembre de 2026).
 *
 * Se redibujan, no se recortan del PDF (§08), y se calculan con el lienzo.
 * Casi ninguna curva del original trae fórmula: se han medido sobre la
 * diapositiva renderizada a 600 ppp y se dibujan con un interpolador monótono
 * por trozos que pasa por los puntos medidos, con los valores que usa cada
 * pregunta clavados donde toca —f(2) = 3, g(−2) = 2, f′(4) = 2…—. Llevan
 * fórmula las que el original deja reconocer: la cuártica de la diapositiva 1
 * (la que pasa por los cinco puntos enteros de su gráfica), las cuatro
 * funciones de la 4, la cúbica de la diferencial, x³ y x² − 7x + 13 en la
 * regla de la cadena, 1 + cos x y las dos derivadas de la última.
 *
 * Dos avisos que dicen sus preguntas en `calculo-t03.yaml`: el mínimo de la
 * diapositiva 1 cae a la izquierda del eje y, como en el original, porque de
 * eso depende la respuesta; y en la 20 el eje x apunta hacia la izquierda,
 * también como en el original, porque esa es la trampa.
 *
 * Los ejes se dibujan después de las curvas y las regiones, para que el halo
 * de sus números quede encima y ninguna recta tape uno.
 *
 *   node scripts/figuras/calculo-cuestiones-t03.mjs
 *
 * Pega cada figura en su pregunta; si la pregunta ya tiene una, se para.
 */
import { lienzo, mosaico } from './lienzo.mjs';
import { pegaEnPregunta } from './pegar.mjs';

/* El destino se puede cambiar para rehacerlas sobre una copia en revisión. */
const BANCO = process.env.BANCO ?? 'src/content/banco/calculo-t03.yaml';

/* ── utilidades ───────────────────────────────────────────────────── */

/**
 * Un interpolador cúbico monótono por trozos (Fritsch y Carlson).
 *
 * Entre dos puntos seguidos la curva no sube ni baja más de lo que dicen
 * ellos, así que los máximos y los mínimos caen exactamente en los puntos en
 * los que la lista cambia de sentido: donde los pone el original, no donde
 * los deje un polinomio que pase por todos.
 */
function suave(puntos) {
  const n = puntos.length;
  const xs = puntos.map((p) => p[0]);
  const ys = puntos.map((p) => p[1]);
  const h = [];
  const d = [];
  for (let k = 0; k < n - 1; k++) {
    h.push(xs[k + 1] - xs[k]);
    d.push((ys[k + 1] - ys[k]) / h[k]);
  }
  const m = new Array(n).fill(0);
  for (let k = 1; k < n - 1; k++) {
    if (d[k - 1] * d[k] <= 0) continue;
    const w1 = 2 * h[k] + h[k - 1];
    const w2 = h[k] + 2 * h[k - 1];
    m[k] = (w1 + w2) / (w1 / d[k - 1] + w2 / d[k]);
  }
  const extremo = (h0, h1, d0, d1) => {
    let v = ((2 * h0 + h1) * d0 - h0 * d1) / (h0 + h1);
    if (Math.sign(v) !== Math.sign(d0)) v = 0;
    else if (Math.sign(d0) !== Math.sign(d1) && Math.abs(v) > Math.abs(3 * d0)) v = 3 * d0;
    return v;
  };
  m[0] = extremo(h[0], h[1], d[0], d[1]);
  m[n - 1] = extremo(h[n - 2], h[n - 3], d[n - 2], d[n - 3]);
  return (x) => {
    let k = 0;
    while (k < n - 2 && x > xs[k + 1]) k++;
    const t = (x - xs[k]) / h[k];
    const t2 = t * t;
    const t3 = t2 * t;
    return (
      (2 * t3 - 3 * t2 + 1) * ys[k] +
      (t3 - 2 * t2 + t) * h[k] * m[k] +
      (3 * t2 - 2 * t3) * ys[k + 1] +
      (t3 - t2) * h[k] * m[k + 1]
    );
  };
}

/** La primitiva de `fp` que vale `y0` en `x0`, por trapecios finos en [a, b]. */
function primitiva(fp, x0, y0, [a, b], paso = 0.002) {
  const n = Math.ceil((b - a) / paso);
  const acumulada = [0];
  for (let k = 1; k <= n; k++) {
    const u = a + (k - 1) * paso;
    acumulada.push(acumulada[k - 1] + ((fp(u) + fp(u + paso)) * paso) / 2);
  }
  const en = (x) => {
    const s = Math.min(n, Math.max(0, (x - a) / paso));
    const k = Math.floor(s);
    const r = s - k;
    return k >= n ? acumulada[n] : acumulada[k] + r * (acumulada[k + 1] - acumulada[k]);
  };
  const base = en(x0);
  return (x) => y0 + en(x) - base;
}

/** Una marca de eje con su texto a la española: signo menos y coma decimal. */
const et = (v) => [v, String(v).replace('-', '−').replace('.', ',')];

/** Las clases de las curvas: la de siempre (azul) y tres más, con tokens. */
function colores(f) {
  f.clase('cv', 'stroke: var(--d3); stroke-width: 2.8; fill: none;');
  f.clase('cn', 'stroke: var(--d2); stroke-width: 2.8; fill: none;');
  f.clase('cg', 'stroke: var(--graphite); stroke-width: 2.8; fill: none;');
  f.clase('ptc', 'fill: var(--d1);');
  f.clase('huc', 'fill: var(--paper); stroke: var(--d1); stroke-width: 2;');
  f.clase('seg', 'stroke: var(--d2); stroke-width: 3.4; fill: none;');
}
const AZUL = 'var(--d1)';
const VERDE = 'var(--d3)';
const NARANJA = 'var(--d2-tinta)';
const GRIS = 'var(--graphite)';

/** La rejilla de las diapositivas: rectas finas y discontinuas del color de
 *  los ejes, para leer valores sin competir con las curvas. */
function rejilla(f, xs, ys) {
  const [x0, x1] = f.rango.x;
  const [y0, y1] = f.rango.y;
  f.clase('rej', 'stroke: var(--rule); stroke-width: 1; fill: none; stroke-dasharray: 4 3;');
  for (const x of xs) f.poli([[x, y0], [x, y1]], { clase: 'rej' });
  for (const y of ys) f.poli([[x0, y], [x1, y]], { clase: 'rej' });
}

/** Una punta de flecha en el extremo de un eje, en píxeles para que no se
 *  deforme con la escala. `hacia`: 'izq', 'der' o 'arr'. */
function puntaDeEje(f, [u, v], hacia) {
  const sx = f.X(1) - f.X(0);
  const sy = f.Y(0) - f.Y(1);
  const largo = 9;
  const ancho = 4;
  const tri = {
    izq: [[u, v], [u + largo / sx, v + ancho / sy], [u + largo / sx, v - ancho / sy]],
    der: [[u, v], [u - largo / sx, v + ancho / sy], [u - largo / sx, v - ancho / sy]],
    arr: [[u, v], [u - ancho / sx, v - largo / sy], [u + ancho / sx, v - largo / sy]],
  }[hacia];
  f.poli(tri, { clase: 'pe', cerrar: true });
}

/** Los ejes con flecha de las dos asíntotas, que se dibujan a mano porque en
 *  una de ellas el eje x crece hacia la izquierda. */
function ejesConFlecha(f, haciaX) {
  f.clase('ejeF', 'stroke: var(--faint); stroke-width: 1.2; fill: none;');
  f.clase('pe', 'fill: var(--faint); stroke: none;');
  const [x0, x1] = f.rango.x;
  const [y0, y1] = f.rango.y;
  const punta = haciaX === 'izq' ? x0 : x1;
  f.poli([[x0, 0], [x1, 0]], { clase: 'ejeF' });
  puntaDeEje(f, [punta, 0], haciaX);
  f.poli([[0, y0], [0, y1]], { clase: 'ejeF' });
  puntaDeEje(f, [0, y1], 'arr');
  const gris = { color: 'var(--faint)', pequeno: true };
  if (haciaX === 'izq') {
    f.rotulo(punta, 0, 'x', { ...gris, anclaje: 'start', dx: 2, dy: -9 });
    f.rotulo(0, y1, 'y', { ...gris, anclaje: 'end', dx: -7, dy: 9 });
  } else {
    f.rotulo(punta, 0, 'x', { ...gris, anclaje: 'end', dx: -2, dy: -9 });
    f.rotulo(0, y1, 'y', { ...gris, anclaje: 'start', dx: 7, dy: 9 });
  }
}

/* ── 1 · la inversa en un subdominio ──────────────────────────────── */

/** La cuártica que pasa por (−3, 1), (0, −3), (2, 1), (4, 5) y (5, 2). */
const cuartica = (x) => (-5 * x ** 4 - x ** 3 + 146 * x ** 2 + 88 * x - 504) / 168;

const subdominio = (() => {
  const f = lienzo({
    id: 'cq3-subdominio',
    alto: 300,
    x: [-3.7, 6.4],
    y: [-3.7, 5.7],
    cuadrado: true,
    titulo: 'Una función definida en [−3, 5]',
    desc:
      'La gráfica de una función definida entre x = −3 y x = 5, sobre una cuadrícula de lado 1. ' +
      'Empieza en (−3, 1), baja cortando el eje x hacia x = −2,4 y toca fondo un poco por debajo ' +
      'de −3 algo a la izquierda del eje y, hacia x = −0,3; en x = 0 vale −3. Luego sube: vale ' +
      'unos −1,6 en x = 1, corta el eje x hacia x = 1,7 y pasa por (2, 1). Llega a su máximo, ' +
      'algo más de 5, un poco antes de x = 4, vale 5 en x = 4 y baja hasta terminar en (5, 2).',
  });
  colores(f);
  rejilla(f, [-3, -2, -1, 1, 2, 3, 4, 5, 6], [-3, -2, -1, 1, 2, 3, 4, 5]);
  f.curva(cuartica, [-3, 5], { n: 180 });
  f.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-3, -2, -1, 1, 2, 3, 4, 5].map(et) });
  /* Los números del eje y van al borde izquierdo y no junto al eje: el −3
     caería justo encima del mínimo, que es lo que hay que ver. */
  for (const v of [-3, -2, -1, 1, 2, 3, 4, 5]) {
    f.rotulo(f.rango.x[0], v, et(v)[1], { anclaje: 'start', dx: 1, dy: 3.6, pequeno: true, color: 'var(--faint)' });
  }
  return f.svg();
})();

/* ── 3 y 6 · la misma f, medida en las dos diapositivas ───────────── */

/* Cada cuarto de unidad, la media de lo medido en las dos diapositivas, con
   el mínimo clavado en (−1, −2) y f(2) = 3, f(3) = 4. */
const f36 = suave([
  [-3, 4], [-2.75, 2.43], [-2.5, 1.07], [-2.25, -0.02], [-2, -0.86], [-1.75, -1.45],
  [-1.5, -1.8], [-1.25, -1.98], [-1, -2], [-0.75, -1.9], [-0.5, -1.68], [-0.25, -1.34],
  [0, -0.95], [0.25, -0.5], [0.5, 0], [0.75, 0.55], [1, 1.09], [1.25, 1.59], [1.5, 2.07],
  [1.75, 2.55], [2, 3], [2.25, 3.35], [2.5, 3.62], [2.75, 3.85], [3, 4], [3.25, 4.05],
  [3.5, 4.03], [3.75, 3.93], [4, 3.72], [4.25, 3.42], [4.5, 3.04], [4.75, 2.58], [5, 2.07],
]);

/* Medida cada cuarto de unidad, con g(−2) = 2 y g(2) = −1. */
const g6 = suave([
  [-3, -2.74], [-2.75, -1.34], [-2.5, 0], [-2.25, 1.1], [-2, 2], [-1.75, 2.62], [-1.5, 3.08],
  [-1.25, 3.4], [-1, 3.56], [-0.75, 3.6], [-0.5, 3.49], [-0.25, 3.28], [0, 2.97], [0.25, 2.57],
  [0.5, 2.13], [0.75, 1.65], [1, 1.13], [1.25, 0.58], [1.5, 0.04], [1.75, -0.48], [2, -1],
  [2.25, -1.43], [2.5, -1.83], [2.75, -2.13], [3, -2.36], [3.25, -2.47], [3.375, -2.5],
  [3.5, -2.47], [3.75, -2.33], [4, -2.03], [4.25, -1.54], [4.5, -0.86], [4.75, -0.01], [5, 1],
]);

const dominio = (() => {
  const f = lienzo({
    id: 'cq3-dominio',
    x: [-3.7, 6.4],
    y: [-2.8, 5.2],
    cuadrado: true,
    titulo: 'Otra función definida en [−3, 5]',
    desc:
      'La gráfica de una función definida entre x = −3 y x = 5, sobre una cuadrícula de lado 1. ' +
      'Empieza arriba, en (−3, 4), baja cortando el eje x hacia x = −2,3 hasta su mínimo en ' +
      '(−1, −2), y sube pasando cerca de (0, −1) y de (1, 1), por (2, 3) y por (3, 4). Llega a su ' +
      'máximo, algo más de 4, hacia x = 3,3, y baja hasta terminar en (5, 2).',
  });
  colores(f);
  rejilla(f, [-3, -2, -1, 1, 2, 3, 4, 5, 6], [-2, -1, 1, 2, 3, 4, 5]);
  f.curva(f36, [-3, 5], { n: 180 });
  f.ejes({
    nombreX: 'x',
    nombreY: 'y',
    marcasX: [-3, -2, -1, 1, 2, 3, 4, 5].map(et),
    marcasY: [-2, -1, 1, 2, 3, 4, 5].map(et),
  });
  return f.svg();
})();

const composicion = (() => {
  const f = lienzo({
    id: 'cq3-composicion',
    x: [-3.6, 6.3],
    y: [-3.3, 5.3],
    cuadrado: true,
    titulo: 'Las gráficas de f y de g',
    desc:
      'Dos curvas sobre una cuadrícula de lado 1, entre x = −3 y x = 5. f empieza en (−3, 4), ' +
      'baja hasta su mínimo en (−1, −2) y sube pasando por (2, 3) hasta su máximo, algo más de ' +
      '4, hacia x = 3,3; termina en (5, 2). g empieza abajo, a unos −2,7 en x = −3, sube pasando ' +
      'por (−2, 2) hasta su máximo, unos 3,6, hacia x = −0,8, baja pasando por (0, 3) y por ' +
      '(2, −1) hasta su mínimo, unos −2,5, hacia x = 3,4, y sube hasta (5, 1). Las dos se ' +
      'cruzan cerca de (1, 1).',
  });
  colores(f);
  rejilla(f, [-3, -2, -1, 1, 2, 3, 4, 5, 6], [-3, -2, -1, 1, 2, 3, 4, 5]);
  f.curva(f36, [-3, 5], { clase: 'cv', n: 180 });
  f.curva(g6, [-3, 5], { n: 180 });
  f.ejes({
    nombreX: 'x',
    nombreY: 'y',
    marcasX: [-3, -2, -1, 1, 2, 3, 4, 5].map(et),
    marcasY: [-3, -2, -1, 1, 2, 3, 4, 5].map(et),
  });
  f.rotulo(-0.9, 3.6, 'g(x)', { anclaje: 'middle', dy: -9, color: AZUL });
  f.rotulo(1.75, 3.6, 'f(x)', { anclaje: 'middle', dy: 0, color: VERDE });
  return f.svg();
})();

/* ── 4 · la gráfica de la inversa ─────────────────────────────────── */

const inversa = (() => {
  const f = lienzo({
    id: 'cq3-inversa',
    alto: 370,
    x: [-3.5, 6.6],
    y: [-4.7, 6.6],
    cuadrado: true,
    titulo: 'Cuatro funciones: y, u, v y w',
    desc:
      'Cuatro curvas sobre una cuadrícula de lado 1. y(x) sube despacio de izquierda a derecha, ' +
      'pasa por (0, 2) con la tangente vertical y por (1, 3), y llega a unos 3,8 en x = 6. u(x) ' +
      'sube muy empinada desde abajo, pasa por (1, −1), se aplana en (2, 0) con la tangente ' +
      'horizontal y sigue subiendo por (3, 1). v(x) es u al revés: baja desde arriba, pasa por ' +
      '(1, 1), se aplana en (2, 0) y sigue bajando por (3, −1). w(x) es y al revés: baja ' +
      'despacio, pasa por (0, −2) con la tangente vertical y por (1, −3).',
  });
  colores(f);
  rejilla(f, [-3, -2, -1, 1, 2, 3, 4, 5, 6], [-4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
  /* Paramétricas, para que el tramo vertical de la raíz cúbica salga liso. */
  f.curva((t) => [t ** 3, 2 + t], [Math.cbrt(-3.4), Math.cbrt(6.5)], { clase: 'cv', n: 160 });
  f.curva((t) => [t ** 3, -2 - t], [Math.cbrt(-3.4), Math.cbrt(6.5)], { clase: 'cg', n: 160 });
  /* u y v se cortan en y = 5,8 para no pisar el nombre del eje y. */
  f.curva((t) => [2 + t, t ** 3], [-Math.cbrt(4.6), Math.cbrt(5.8)], { clase: 'cn', n: 160 });
  f.curva((t) => [2 + t, -(t ** 3)], [-Math.cbrt(5.8), Math.cbrt(4.6)], { n: 160 });
  f.ejes({
    nombreX: 'x',
    nombreY: 'y',
    marcasX: [-3, -2, -1, 1, 2, 3, 4, 5, 6].map(et),
    marcasY: [-4, -3, -2, -1, 1, 2, 3, 4, 5, 6].map(et),
  });
  f.rotulo(5.2, 2 + Math.cbrt(5.2), 'y(x)', { anclaje: 'middle', dy: -9, color: VERDE });
  f.rotulo(2 + Math.cbrt(5.6), 5.6, 'u(x)', { anclaje: 'end', dx: -8, dy: 4, color: NARANJA });
  f.rotulo(2 - Math.cbrt(1.9), 1.9, 'v(x)', { anclaje: 'start', dx: 8, dy: 4, color: AZUL });
  f.rotulo(2.6, -2 - Math.cbrt(2.6), 'w(x)', { anclaje: 'middle', dy: 17, color: GRIS });
  return f.svg();
})();

/* ── 7 · la composición con la inversa ────────────────────────────── */

/* Medidas cada cuarto de unidad: f vale 2 en x = 1, 3 y 5, y g(1) = 1,
   g(3) = 4, como en el original. */
const f7 = suave([
  [0, 0], [0.25, 0.6], [0.5, 1.15], [0.75, 1.62], [1, 2], [1.25, 2.32], [1.5, 2.53],
  [1.75, 2.65], [2, 2.67], [2.25, 2.6], [2.5, 2.44], [2.75, 2.24], [3, 2], [3.25, 1.71],
  [3.5, 1.42], [3.75, 1.2], [4, 1.03], [4.25, 1], [4.5, 1.1], [4.75, 1.4], [5, 2],
]);
const g7 = suave([
  [0, -0.77], [0.25, -0.41], [0.5, 0.04], [0.75, 0.52], [1, 1], [1.25, 1.5], [1.5, 1.96],
  [1.75, 2.42], [2, 2.86], [2.25, 3.27], [2.5, 3.6], [2.75, 3.83], [3, 4], [3.25, 4.06],
  [3.5, 4.02], [3.75, 3.86], [4, 3.58], [4.25, 3.14], [4.5, 2.57], [4.75, 1.8], [5, 0.9],
]);

const compInversa = (() => {
  const f = lienzo({
    id: 'cq3-comp-inversa',
    x: [-0.5, 5.7],
    y: [-1.15, 4.45],
    cuadrado: true,
    titulo: 'Las gráficas de f y de g, entre 0 y 5',
    desc:
      'Dos curvas sobre una cuadrícula de lado 1. f sale del origen, pasa por (1, 2), llega a su ' +
      'máximo, unos 2,7, hacia x = 2, baja pasando por (3, 2) hasta su mínimo, 1, hacia x = 4,25, ' +
      'y sube hasta terminar en (5, 2). g empieza en x = 0 a unos −0,8, pasa por (1, 1) y por ' +
      '(3, 4), llega a su máximo, algo más de 4, hacia x = 3,3, y cae hasta terminar en x = 5 ' +
      'por debajo de 1.',
  });
  colores(f);
  rejilla(f, [1, 2, 3, 4, 5], [-1, 1, 2, 3, 4]);
  f.curva(f7, [0, 5], { clase: 'cv', n: 140 });
  f.curva(g7, [0, 5], { n: 140 });
  f.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2, 3, 4, 5].map(et), marcasY: [-1, 1, 2, 3, 4].map(et) });
  f.rotulo(4.35, 3.55, 'g(x)', { anclaje: 'start', dx: 4, color: AZUL });
  f.rotulo(3.55, 1.62, 'f(x)', { anclaje: 'start', dx: 2, color: VERDE });
  return f.svg();
})();

/* ── 16 · el cociente de dos rectas ───────────────────────────────── */

/** Las dos rectas se anulan en a = −4,25 y cortan el eje y en 6 y en 3. */
const rF = (x) => (24 * x + 102) / 17;
const rG = (x) => (12 * x + 51) / 17;

const rectas = (() => {
  const f = lienzo({
    id: 'cq3-rectas',
    alto: 300,
    x: [-7.6, 4.3],
    y: [-2.3, 8.2],
    cuadrado: true,
    titulo: 'Las rectas f y g',
    desc:
      'Dos rectas sobre una cuadrícula de lado 1 que se cortan en el mismo punto del eje x, ' +
      'rotulado a, entre −5 y −4. La más empinada, f, corta el eje y en 6; la otra, g, lo corta ' +
      'en 3.',
  });
  colores(f);
  rejilla(f, [-7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4], [-2, -1, 1, 2, 3, 4, 5, 6, 7, 8]);
  f.poli([[(-2.25 * 17 - 102) / 24, -2.25], [(8.15 * 17 - 102) / 24, 8.15]], { clase: 'cv' });
  f.poli([[-7.5, rG(-7.5)], [4.25, rG(4.25)]]);
  f.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-6, -3, 3].map(et), marcasY: [3, 6].map(et) });
  f.rotulo(-4.25, 0, 'a', { anclaje: 'middle', dy: 16, color: GRIS });
  f.rotulo(-1.2, 5.3, 'f(x)', { anclaje: 'end', color: VERDE });
  f.rotulo(1.5, 5.4, 'g(x)', { anclaje: 'start', color: AZUL });
  return f.svg();
})();

/* ── 19 y 20 · asíntotas horizontales ─────────────────────────────── */

const asintota1 = (() => {
  const R = 2;
  const f = lienzo({
    id: 'cq3-asintota-1',
    alto: 240,
    x: [-0.8, 6],
    y: [-1.1, 2.75],
    titulo: 'Una gráfica que se acerca a R',
    desc:
      'La gráfica de y(x) empieza por debajo del eje x, sube muy deprisa, lo cruza y se va ' +
      'acercando a la recta horizontal discontinua de altura R, siempre por debajo de ella y ' +
      'cada vez más pegada a medida que x avanza hacia la derecha. El eje x apunta a la derecha.',
  });
  colores(f);
  f.poli([[-0.8, R], [6, R]], { clase: 'g' });
  f.curva((x) => R * (1 - (0.77 / x) ** 1.79), [0.64, 6], { n: 160 });
  ejesConFlecha(f, 'der');
  f.rotulo(0, R, 'R', { anclaje: 'end', dx: -6, dy: 4, color: GRIS });
  return f.svg();
})();

/** Medida en la diapositiva y alisada: crestas y valles donde están, con el
 *  eje y a la derecha y la x creciendo hacia la izquierda. */
const oscila = suave([
  [-11.1, 1.02], [-10.1, 1.12], [-9.35, 1], [-8.5, 0.86], [-7.85, 1], [-6.9, 1.18],
  [-6.25, 1], [-5.45, 0.76], [-4.7, 1], [-3.8, 1.3], [-3.1, 1], [-2.3, 0.48], [-1.7, 0.85],
  [-1.1, 1.88], [-0.5, 3.1], [0, 3.55],
]);

const asintota2 = (() => {
  const R = 1;
  const f = lienzo({
    id: 'cq3-asintota-2',
    alto: 240,
    x: [-11.3, 0.9],
    y: [-0.7, 3.95],
    titulo: 'Una gráfica con el eje x hacia la izquierda',
    desc:
      'El eje x apunta hacia la izquierda, con la flecha y la x en su extremo izquierdo, y el ' +
      'eje y está a la derecha del dibujo. Junto al eje y la gráfica queda muy por encima de la ' +
      'recta horizontal discontinua de altura R; hacia la izquierda baja, la cruza y oscila a su ' +
      'alrededor, por encima y por debajo, con ondas cada vez más pequeñas a medida que se aleja ' +
      'hacia la izquierda.',
  });
  colores(f);
  f.poli([[-11.3, R], [0, R]], { clase: 'g' });
  f.curva(oscila, [-11.1, 0], { n: 220 });
  ejesConFlecha(f, 'izq');
  f.rotulo(0, R, 'R', { anclaje: 'end', dx: -5, dy: -6, color: GRIS });
  return f.svg();
})();

/* ── 21 a 23 · continuidad ────────────────────────────────────────── */

/* Medida cada cuarto de unidad. */
const continua21 = suave([
  [2.06, -2.11], [2.25, -1.55], [2.5, -0.48], [2.75, 0.53], [3, 1.45], [3.25, 2.24],
  [3.5, 2.94], [3.75, 3.44], [4, 3.84], [4.25, 4.08], [4.5, 4.11], [4.75, 4.09], [5, 3.9],
  [5.25, 3.63], [5.5, 3.29], [5.75, 2.89], [6, 2.47], [6.25, 2.09], [6.5, 1.68], [6.75, 1.37],
  [7, 1.06], [7.25, 0.87], [7.5, 0.76], [7.75, 0.73], [8, 0.77], [8.25, 0.88], [8.5, 1.05],
  [8.75, 1.3], [9, 1.54], [9.25, 1.84], [9.5, 2.12], [9.75, 2.33], [10, 2.55], [10.25, 2.71],
  [10.5, 2.82], [10.75, 2.89], [10.95, 2.9], [11.25, 2.87], [11.5, 2.83],
]);

const continua = (() => {
  const f = lienzo({
    id: 'cq3-continua',
    x: [-0.45, 11.8],
    y: [-2.55, 6.5],
    cuadrado: true,
    titulo: 'Una curva sin cortes',
    desc:
      'Una curva seguida entre x = 2 y x = 11,5: sube desde y = −2, cruza el eje x hacia ' +
      'x = 2,6, llega a su máximo, algo más de 4, hacia x = 4,5, pasa por x = 5 bajando, a unos ' +
      '3,9, toca fondo hacia x = 7,8 a unos 0,7 y vuelve a subir hasta cerca de 3. No tiene ' +
      'saltos, huecos ni puntos sueltos.',
  });
  colores(f);
  f.curva(continua21, [2.06, 11.5], { n: 200 });
  f.ejes({
    nombreX: 'x',
    nombreY: 'y',
    marcasX: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(et),
    marcasY: [-2, -1, 1, 2, 3, 4, 5, 6].map(et),
  });
  return f.svg();
})();

const tramoIzq = suave([
  [0, 0.35], [0.5, 0.42], [1, 0.63], [1.5, 0.95], [2, 1.35], [2.5, 1.76], [3, 2.12], [3.5, 2.4],
  [4, 2.56], [4.5, 2.61], [5, 2.57],
]);
const tramoDer = suave([
  [5, 3.17], [5.5, 3.04], [6, 2.88], [6.5, 2.74], [7, 2.63], [7.5, 2.575], [7.9, 2.56],
  [8.5, 2.62], [9, 2.73], [9.5, 2.815], [10, 2.9],
]);

function salto(id, relleno, titulo, desc) {
  const f = lienzo({ id, alto: 210, x: [-0.55, 10.7], y: [-0.4, 3.65], titulo, desc });
  colores(f);
  f.curva(tramoIzq, [0, 5], { n: 100 });
  f.curva(tramoDer, [5, 10], { n: 100 });
  f.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [5, 10].map(et), marcasY: [1, 2, 3].map(et) });
  f.punto(5, 2.57, { clase: relleno ? 'ptc' : 'huc', r: 4.5 });
  f.punto(5, 3.17, { clase: 'huc', r: 4.5 });
  return f.svg();
}

const saltoHueco = salto(
  'cq3-salto',
  false,
  'Una gráfica con un salto en x = 5',
  'Dos trozos de curva. El de la izquierda sube desde x = 0 y termina en x = 5, a unos 2,6, ' +
    'con un círculo hueco. El de la derecha empieza en x = 5, a unos 3,2, también con un ' +
    'círculo hueco, baja un poco y vuelve a subir hasta x = 10. En x = 5 no hay ningún punto ' +
    'relleno.',
);

const saltoRelleno = salto(
  'cq3-salto-2',
  true,
  'Una gráfica con un salto en x = 5 y el punto relleno a la izquierda',
  'Los mismos dos trozos de curva: el de la izquierda termina en x = 5, a unos 2,6, con un ' +
    'círculo relleno, que marca el valor y(5); el de la derecha empieza en x = 5, a unos 3,2, ' +
    'con un círculo hueco, baja un poco y vuelve a subir hasta x = 10.',
);

/* ── 29 · la velocidad media ──────────────────────────────────────── */

/* Medidas cada cuarto de unidad, con f(−4) = g(−4) = 1, f(3) = −2 y
   g(3) = 2, los cuatro valores que pide la pregunta. */
const f29 = suave([
  [-4.3, 1.38], [-4, 1], [-3.75, 0.8], [-3.5, 0.62], [-3.25, 0.52], [-2.9, 0.465], [-2.5, 0.53],
  [-2.25, 0.62], [-2, 0.76], [-1.75, 0.91], [-1.5, 1.08], [-1.25, 1.26], [-1, 1.44],
  [-0.75, 1.6], [-0.5, 1.77], [-0.25, 1.9], [0, 1.99], [0.25, 2.07], [0.5, 2.1], [0.75, 2.05],
  [1, 1.97], [1.25, 1.78], [1.5, 1.53], [1.75, 1.17], [2, 0.78], [2.25, 0.24], [2.5, -0.38],
  [2.75, -1.12], [3, -2], [3.15, -2.55],
]);
const g29 = suave([
  [-4.3, 1.42], [-4, 1], [-3.75, 0.7], [-3.5, 0.34], [-3.25, -0.02], [-3, -0.37], [-2.75, -0.66],
  [-2.5, -0.93], [-2.25, -1.18], [-2, -1.36], [-1.75, -1.47], [-1.5, -1.51], [-1.25, -1.5],
  [-1, -1.42], [-0.75, -1.29], [-0.5, -1.09], [-0.25, -0.86], [0, -0.55], [0.25, -0.22],
  [0.5, 0.16], [0.75, 0.54], [1, 0.94], [1.25, 1.3], [1.5, 1.68], [1.75, 1.97], [2, 2.18],
  [2.25, 2.33], [2.5, 2.37], [2.75, 2.26], [3, 2], [3.25, 1.51], [3.4, 1.18],
]);

const velMedia = (() => {
  const f = lienzo({
    id: 'cq3-velmedia',
    x: [-4.45, 3.6],
    y: [-2.75, 3.3],
    cuadrado: true,
    titulo: 'Las gráficas de f y de g, entre −4 y 3',
    desc:
      'Dos curvas sobre una cuadrícula de lado 1 que se cruzan en (−4, 1). f baja hasta un ' +
      'mínimo de algo menos de 0,5 hacia x = −2,9, sube hasta su máximo, algo más de 2, hacia ' +
      'x = 0,5, y cae empinada hasta (3, −2). g baja cortando el eje x hacia x = −3,3 hasta su ' +
      'mínimo, unos −1,5, hacia x = −1,5, sube hasta su máximo, algo menos de 2,4, hacia ' +
      'x = 2,5, y baja hasta (3, 2).',
  });
  colores(f);
  rejilla(f, [-4, -3, -2, -1, 1, 2, 3], [-2, -1, 1, 2, 3]);
  f.curva(g29, [-4.3, 3.4], { clase: 'cv', n: 160 });
  f.curva(f29, [-4.3, 3.15], { n: 160 });
  f.ejes({
    nombreX: 'x',
    nombreY: 'y',
    marcasX: [-4, -3, -2, -1, 1, 2, 3].map(et),
    marcasY: [-2, -1, 1, 2, 3].map(et),
  });
  f.rotulo(-1.6, 1.62, 'f(x)', { anclaje: 'middle', color: AZUL });
  f.rotulo(-1.45, -1.51, 'g(x)', { anclaje: 'middle', dy: 17, color: VERDE });
  return f.svg();
})();

/* ── 34 · la recta secante ────────────────────────────────────────── */

const y34 = suave([
  [-4.55, -5.08], [-3.05, 0], [-1.8, 1.78], [-0.88, 2.05], [0, 1.83], [2, 0], [3.77, -1.83],
  [4.95, -2.3], [6.8, -0.87],
]);

const secante = (() => {
  const a = -1.8;
  const b = 3.77;
  const f = lienzo({
    id: 'cq3-secante',
    alto: 250,
    x: [-4.8, 7],
    y: [-5.3, 2.7],
    cuadrado: true,
    titulo: 'Dos puntos de la gráfica de y(x)',
    desc:
      'Una curva que sube desde abajo a la izquierda, llega a un máximo algo a la izquierda del ' +
      'eje y, baja cruzando el eje x, toca fondo a la derecha y vuelve a subir. Hay dos puntos ' +
      'marcados sobre ella: el de abscisa a, a la izquierda del eje y y por encima del eje x, y ' +
      'el de abscisa b, a la derecha y por debajo del eje x, cada uno con sus proyecciones sobre ' +
      'los ejes en trazo discontinuo.',
  });
  colores(f);
  f.curva(y34, [-4.55, 6.8], { n: 180 });
  f.poli([[a, 0], [a, y34(a)]], { clase: 'g' }).poli([[0, y34(a)], [a, y34(a)]], { clase: 'g' });
  f.poli([[b, 0], [b, y34(b)]], { clase: 'g' }).poli([[0, y34(b)], [b, y34(b)]], { clase: 'g' });
  f.ejes({ nombreX: 'x', nombreY: 'y' });
  f.punto(a, y34(a)).punto(b, y34(b));
  f.rotulo(a, 0, 'a', { anclaje: 'middle', dy: 16, color: GRIS });
  f.rotulo(b, 0, 'b', { anclaje: 'middle', dy: -8, color: GRIS });
  return f.svg();
})();

/* ── 38 · la diferencial ──────────────────────────────────────────── */

/** Medida en la diapositiva: la cúbica con la inflexión en 0,66, y ahí su
 *  tangente, de pendiente −1,18, que es la que da el enunciado. */
const yd = (x) => 0.4 - 1.18 * (x - 0.66) + 0.182 * (x - 0.66) ** 3;
const tangente = (x) => 0.4 - 1.18 * (x - 0.66);

const diferencial = (() => {
  const f = lienzo({
    id: 'cq3-diferencial',
    ancho: 400,
    alto: 325,
    x: [-2.05, 2.8],
    y: [-1, 2.8],
    cuadrado: true,
    titulo: 'Una curva y su recta tangente en (0,66; 0,4)',
    desc:
      'Una curva con un máximo de algo más de 1,5 hacia x = −0,8 y un mínimo de unos −0,75 ' +
      'hacia x = 2,1. En el punto marcado, (0,66; 0,4), está dibujada su recta tangente, que ' +
      'baja con pendiente −1,18: la curva queda por debajo de la tangente a la izquierda del ' +
      'punto y por encima a la derecha, y cerca del punto casi no se separan.',
  });
  colores(f);
  f.curva(yd, [-1.95, 2.64], { n: 160 });
  f.poli([[0.66 - 2.35 / 1.18, tangente(0.66 - 2.35 / 1.18)], [0.66 + 1.35 / 1.18, tangente(0.66 + 1.35 / 1.18)]], {
    clase: 'c2',
  });
  f.ejes({
    nombreX: 'x',
    nombreY: 'y',
    marcasX: [-1.32, -0.66, 0.66, 1.32, 1.98].map(et),
    marcasY: [1, 2].map(et),
  });
  f.punto(0.66, 0.4);
  return f.svg();
})();

/* ── 39 · la regla de la cadena con gráficas ──────────────────────── */

const cadena = mosaico({
  id: 'cq3-cadena',
  titulo: 'Las gráficas de f, de g y de sus derivadas',
  desc:
    'Dos paneles con cuadrícula. En el de la izquierda, f(x), que se aplana en el origen y pasa ' +
    'por (1, 1), y f′(x), una parábola con el vértice en el origen que pasa por (−1, 3) y ' +
    '(1, 3). En el de la derecha, g(x), una parábola con el mínimo, unos 0,75, en x = 3,5, que ' +
    'pasa por (2, 3), (3, 1), (4, 1) y (5, 3), y g′(x), una recta que corta el eje x en 3,5 y ' +
    'pasa por (3, −1), (4, 1) y (5, 3).',
  columnas: 2,
  ancho: 230,
  alto: 205,
  celdas: [
    {
      etiqueta: 'f y f′',
      x: [-2.45, 2.7],
      y: [-0.55, 3.95],
      dibuja: (p) => {
        colores(p);
        rejilla(p, [-2, -1, 1, 2], [1, 2, 3]);
        p.curva((x) => x ** 3, [-Math.cbrt(0.5), Math.cbrt(3.9)], { clase: 'cv', n: 120 });
        p.curva((x) => 3 * x * x, [-Math.sqrt(3.9 / 3), Math.sqrt(3.9 / 3)], { n: 120 });
        p.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-2, -1, 1, 2].map(et), marcasY: [1, 2, 3].map(et) });
        p.rotulo(-1.2, 3.45, 'f′(x)', { anclaje: 'end', color: AZUL });
        p.rotulo(1.2, 1.15, 'f(x)', { anclaje: 'start', dx: 4, color: VERDE });
      },
    },
    {
      etiqueta: 'g y g′',
      x: [-0.4, 5.75],
      y: [-1.45, 3.95],
      dibuja: (p) => {
        colores(p);
        rejilla(p, [1, 2, 3, 4, 5], [-1, 1, 2, 3]);
        const r = Math.sqrt(49 - 4 * 9.1);
        p.curva((x) => x * x - 7 * x + 13, [(7 - r) / 2, (7 + r) / 2], { clase: 'cv', n: 120 });
        p.poli([[2.8, -1.4], [5.45, 3.9]]);
        p.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2, 3, 4, 5].map(et), marcasY: [-1, 1, 2, 3].map(et) });
        p.rotulo(2.35, 2.6, 'g(x)', { anclaje: 'start', color: VERDE });
        p.rotulo(4.1, 0.45, 'g′(x)', { anclaje: 'start', color: AZUL });
      },
    },
  ],
});

/* ── 41 y 43 · f y f′, con el punto P ─────────────────────────────── */

/** f′ medida en la diapositiva, con f′(4) = 2; f es su primitiva con
 *  f(4) = 4, como en el original, así que las dos gráficas no se
 *  contradicen. */
const fp41 = suave([
  [2, 0], [2.25, 0.25], [2.5, 0.54], [2.75, 0.85], [3, 1.13], [3.25, 1.41], [3.5, 1.65],
  [3.75, 1.85], [4, 2], [4.25, 2.12], [4.6, 2.2], [4.75, 2.18], [5, 2.08], [5.25, 1.91],
  [5.5, 1.67], [5.75, 1.31], [6, 0.85],
]);
const f41 = primitiva(fp41, 4, 4, [2, 6]);

function puntoP(id, { xP, sobreLaCurva, xMax, ancho, titulo, desc }) {
  const f = lienzo({
    id,
    ancho,
    alto: 295,
    x: [-0.45, xMax + 0.4],
    y: [-0.55, 8.3],
    cuadrado: true,
    titulo,
    desc,
  });
  colores(f);
  const xs = Array.from({ length: Math.floor(xMax) }, (_, k) => k + 1);
  rejilla(f, xs, [1, 2, 3, 4, 5, 6, 7, 8]);
  f.curva(f41, [2, 6], { clase: 'cv', n: 140 });
  f.curva(fp41, [2, 6], { n: 140 });
  f.ejes({
    nombreX: 'x',
    nombreY: 'y',
    marcasX: xs.filter((x) => x % 2 === 0).map(et),
    marcasY: [1, 2, 3, 4, 5, 6, 7].map(et),
  });
  const yP = f41(xP);
  f.poli([[0, 0], [xP, 0]], { clase: 'seg' });
  f.poli([[xP, 0], [xP, yP]], { clase: 'seg' });
  f.rotulo(xP, yP / 2, 'h', { anclaje: 'end', dx: -7, dy: 4, color: NARANJA });
  f.rotulo(6, f41(6), 'f(x)', { anclaje: 'start', dx: 7, dy: 4, color: VERDE });
  f.rotulo(6, fp41(6), 'f′(x)', { anclaje: 'start', dx: 7, dy: 4, color: AZUL });
  if (sobreLaCurva) {
    f.punto(xP, yP);
    f.rotulo(xP, yP, 'P', { anclaje: 'end', dx: -7, dy: -3 });
    f.rotulo(3, 0, 's', { anclaje: 'middle', dy: 16, color: NARANJA });
  } else {
    f.punto(xP, 0);
    f.rotulo(xP, 0, 'P', { anclaje: 'middle', dy: 17 });
  }
  return f.svg();
}

const eje41 = puntoP('cq3-eje', {
  xP: 4.55,
  sobreLaCurva: false,
  xMax: 10,
  ancho: 340,
  titulo: 'El punto P sobre el eje x',
  desc:
    'Sobre una cuadrícula de lado 1, la gráfica de f(x) entre x = 2 y x = 6, creciente, de unos ' +
    '1,8 a unos 7,8, y la de f′(x), que sale de 0 en x = 2, vale 2 en x = 4, llega a su máximo, ' +
    'algo más de 2, hacia x = 4,6, y baja hasta menos de 1 en x = 6. El punto P está sobre el eje ' +
    'x, un poco a la derecha de x = 4, al final de un segmento que va por el eje desde el origen, ' +
    'y otro segmento vertical, h, sube desde P hasta la gráfica de f.',
});

const inversa43 = puntoP('cq3-inversa-2', {
  xP: 4.8,
  sobreLaCurva: true,
  xMax: 8,
  ancho: 300,
  titulo: 'El punto P sobre la gráfica de f',
  desc:
    'Las mismas gráficas de f(x) y f′(x), sobre una cuadrícula de lado 1: f crece de unos 1,8 en ' +
    'x = 2 a unos 7,8 en x = 6, y f′ sale de 0 en x = 2, vale 2 en x = 4 y tiene su máximo, algo ' +
    'más de 2, hacia x = 4,6. El punto P está sobre la gráfica de f, algo a la derecha de ' +
    'x = 4,5; el segmento s va por el eje x desde el origen hasta debajo de P, y el segmento h ' +
    'sube desde ahí hasta P.',
});

/* ── 45 · el bote ─────────────────────────────────────────────────── */

const bote = (() => {
  const f = lienzo({
    id: 'cq3-bote',
    alto: 210,
    x: [0, 10],
    y: [-1.1, 4.4],
    cuadrado: true,
    titulo: 'El bote, la cuerda y el muelle',
    desc:
      'Un bote flota en el agua, a la izquierda. De su proa sale una cuerda tensa que sube en ' +
      'diagonal hasta lo alto del borde del muelle, a la derecha, y desde ahí sigue horizontal ' +
      'por encima del muelle, con una flecha que indica hacia dónde se tira de ella.',
  });
  f.clase('agua', 'fill: var(--d1); fill-opacity: .12; stroke: none;');
  f.clase('aguaL', 'stroke: var(--d1); stroke-width: 1.4; fill: none;');
  f.clase('muelle', 'fill: var(--faint); fill-opacity: .22; stroke: var(--faint); stroke-width: 1.2;');
  f.clase('casco', 'fill: var(--d2); fill-opacity: .35; stroke: var(--d2); stroke-width: 1.6;');
  f.clase('cuerda', 'stroke: var(--ink); stroke-width: 1.8; fill: none;');
  f.clase('punta', 'fill: var(--ink); stroke: none;');
  const [y0] = f.rango.y;
  f.region([[0, y0], [10, y0], [10, 0], [0, 0]], { clase: 'agua' });
  f.poli([[0, 0], [7.9, 0]], { clase: 'aguaL' });
  f.region([[7.9, y0], [9.7, y0], [9.7, 3], [7.9, 3]], { clase: 'muelle' });
  f.region([{ f: (t) => [2.6 + 1.8 * Math.cos(t), 0.8 + 1.05 * Math.sin(t)], en: [Math.PI, 2 * Math.PI] }], {
    clase: 'casco',
    n: 60,
  });
  f.poli([[4.4, 0.8], [7.9, 3.35]], { clase: 'cuerda' });
  f.poli([[7.9, 3], [7.9, 3.35]], { clase: 'cuerda' });
  f.flecha([7.9, 3.35], [9.65, 3.35], { clase: 'cuerda' });
  f.rotulo(2.6, 0.8, 'bote', { anclaje: 'middle', dy: -9, color: NARANJA });
  f.rotulo(6.1, 2.05, 'cuerda', { anclaje: 'end', dx: -7, dy: -5, color: 'var(--ink)' });
  f.rotulo(8.8, 3.35, 'muelle', { anclaje: 'middle', dy: -11, color: GRIS });
  return f.svg();
})();

/* ── 46 · la gráfica de 1 + cos x ─────────────────────────────────── */

const coseno = (() => {
  const f = lienzo({
    id: 'cq3-coseno',
    ancho: 520,
    alto: 180,
    x: [-0.6, 20],
    y: [-1.3, 3.3],
    titulo: 'La gráfica de 1 + cos x',
    desc:
      'La curva y = 1 + cos x entre x = 0 y x = 19,5, sobre una cuadrícula: oscila sin parar ' +
      'entre 0 y 2, con máximos en 0, 2π, 4π y 6π y mínimos en π, 3π y 5π, y no se acerca a ' +
      'ningún valor.',
  });
  colores(f);
  const xs = Array.from({ length: 19 }, (_, k) => k + 1);
  rejilla(f, xs, [-1, 1, 2, 3]);
  f.curva((x) => 1 + Math.cos(x), [0, 19.6], { clase: 'cv', n: 320 });
  f.ejes({ nombreX: 'x', nombreY: 'y', marcasX: xs.map(et), marcasY: [-1, 1, 2, 3].map(et) });
  f.rotulo(2.3, 2.75, 'y(x) = 1 + cos x', { anclaje: 'start', color: VERDE });
  return f.svg();
})();

/* ── 47 · f′ y g′ cerca de 0 ──────────────────────────────────────── */

const lhopital = (() => {
  const f = lienzo({
    id: 'cq3-lhopital',
    ancho: 360,
    alto: 290,
    x: [-0.015, 0.232],
    y: [-0.022, 0.318],
    titulo: 'Las gráficas de f′ y de g′ cerca de 0',
    desc:
      'Sobre una cuadrícula fina, dos curvas que salen del origen, entre x = 0 y x = 0,22. f′(x) ' +
      'es una recta que sube el doble de deprisa: vale 0,2 en x = 0,1 y 0,3 en x = 0,15. g′(x) ' +
      'sube más despacio, curvándose un poco hacia arriba: vale algo más de 0,1 en x = 0,1 y unos ' +
      '0,25 en x = 0,22.',
  });
  colores(f);
  const paso = (desde, hasta) => {
    const v = [];
    for (let k = Math.round(desde / 0.02); k * 0.02 <= hasta + 1e-9; k++) v.push(Math.round(k * 2) / 100);
    return v;
  };
  rejilla(f, paso(0.02, 0.22), paso(0.02, 0.3));
  f.curva((x) => Math.exp(x) - 1, [0, 0.22], { clase: 'cv', n: 60 });
  f.curva((x) => 2 * x, [0, 0.158], { n: 20 });
  const dos = (v) => [v, v.toFixed(2).replace('.', ',')];
  f.ejes({
    nombreX: 'x',
    nombreY: 'y',
    marcasX: [0.04, 0.08, 0.12, 0.16, 0.2].map(dos),
    marcasY: [0.04, 0.08, 0.12, 0.16, 0.2, 0.24, 0.28].map(dos),
  });
  f.rotulo(0.105, 0.245, 'f′(x)', { anclaje: 'end', color: AZUL });
  f.rotulo(0.19, Math.exp(0.19) - 1, 'g′(x)', { anclaje: 'middle', dy: -11, color: VERDE });
  return f.svg();
})();

const figuras = {
  'inversa-en-un-subdominio': subdominio,
  'dominio-de-la-inversa': dominio,
  'grafica-de-la-inversa': inversa,
  'composicion-multiple': composicion,
  'composicion-con-la-inversa': compInversa,
  'cociente-de-dos-rectas': rectas,
  'asintota-por-debajo': asintota1,
  'asintota-con-el-eje-al-reves': asintota2,
  'continua-en-x-igual-a-5': continua,
  'continua-con-un-salto': saltoHueco,
  'continuidad-por-sucesiones': saltoRelleno,
  'velocidad-media-de-dos-funciones': velMedia,
  'pendiente-de-la-secante': secante,
  'aproximacion-por-la-diferencial': diferencial,
  'regla-de-la-cadena-con-graficas': cadena,
  'punto-que-recorre-el-eje': eje41,
  'derivada-de-la-inversa-con-graficas': inversa43,
  'bote-amarrado-al-muelle': bote,
  'lhopital-mal-aplicado': coseno,
  'lhopital-con-las-derivadas': lhopital,
};

for (const [id, svg] of Object.entries(figuras)) pegaEnPregunta(BANCO, id, svg);
console.log(`${Object.keys(figuras).length} figuras pegadas en ${BANCO}`);
