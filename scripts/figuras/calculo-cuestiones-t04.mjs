/**
 * Las figuras de las cuestiones del tema 4 de Cálculo, las de las
 * diapositivas de «Estudio local de funciones reales de una variable real»
 * (fase E3 de la auditoría del 27 de septiembre de 2026).
 *
 * Se redibujan, no se recortan del PDF (§08), y se calculan: cada curva está
 * medida sobre su diapositiva renderizada a 600 ppp, columna a columna y por
 * el color del trazo, y las tablas de abajo son esa medida. Tres reglas:
 *
 *  · Donde la pregunta es cuál de varias curvas es la derivada de otra, la
 *    buena no se dibuja con su medida: sale de la otra, integrando la
 *    derivada medida (la 13 y la 14, donde casan con un desvío de 0,02 a
 *    0,03, el grosor del trazo) o derivando la función medida (la 18). Así el
 *    dibujo no puede decir otra cosa que la respuesta.
 *  · Las que salen de una fórmula se dibujan con ella: la cuártica de la 15,
 *    la parábola de la 16 y las dos de la 17.
 *  · Lo que afirma cada porqué de `calculo-t04.yaml` —los ceros, los
 *    máximos, las cotas— se comprueba al generar, y el guion se para si el
 *    dibujo deja de cumplirlo.
 *
 *   node scripts/figuras/calculo-cuestiones-t04.mjs
 *
 * Pega cada figura en su pregunta; si la pregunta ya tiene una, se para.
 */
import { lienzo, mosaico, reetiqueta } from './lienzo.mjs';
import { pegaEnPregunta } from './pegar.mjs';

/* El destino se puede cambiar para rehacerlas sobre una copia en revisión. */
const BANCO = process.env.BANCO ?? 'src/content/banco/calculo-t04.yaml';

/* ── herramientas de curvas ────────────────────────────────────────── */

const comprueba = (cierto, que) => {
  if (!cierto) throw new Error(`calculo-cuestiones-t04: ${que}`);
};

/** Pares [x, y] a partir de una x inicial, un paso y los valores medidos. */
const tabla = (x0, h, valores) => valores.map((v, i) => [Math.round((x0 + i * h) * 100) / 100, v]);

function resuelve(A, B) {
  const n = B.length;
  const M = A.map((fila, i) => [...fila, B[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = c + 1; r < n; r++) {
      const k = M[r][c] / M[c][c];
      for (let j = c; j <= n; j++) M[r][j] -= k * M[c][j];
    }
  }
  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = M[r][n];
    for (let j = r + 1; j < n; j++) s -= M[r][j] * x[j];
    x[r] = s / M[r][r];
  }
  return x;
}

/**
 * El polinomio de grado `grado` que mejor pasa por los puntos, por mínimos
 * cuadrados en la variable reescalada a [−1, 1]. Lleva sus dos primeras
 * derivadas (`.d`, `.d2`) y una primitiva (`.prim`), que se anula en el
 * centro del tramo.
 */
function ajusta(puntos, grado) {
  const xs = puntos.map((p) => p[0]);
  const m = (Math.min(...xs) + Math.max(...xs)) / 2;
  const s = (Math.max(...xs) - Math.min(...xs)) / 2;
  const n = grado + 1;
  const A = Array.from({ length: n }, () => new Array(n).fill(0));
  const B = new Array(n).fill(0);
  for (const [x, y] of puntos) {
    const u = (x - m) / s;
    const pot = [1];
    for (let k = 1; k < 2 * n; k++) pot.push(pot[k - 1] * u);
    for (let i = 0; i < n; i++) {
      B[i] += y * pot[i];
      for (let j = 0; j < n; j++) A[i][j] += pot[i + j];
    }
  }
  const c = resuelve(A, B);
  const horner = (coef, u) => coef.reduceRight((v, ck) => v * u + ck, 0);
  const f = (x) => horner(c, (x - m) / s);
  f.d = (x) => horner(c.slice(1).map((ck, k) => (k + 1) * ck), (x - m) / s) / s;
  f.d2 = (x) => horner(c.slice(2).map((ck, k) => (k + 2) * (k + 1) * ck), (x - m) / s) / (s * s);
  f.prim = (x) => {
    const u = (x - m) / s;
    return horner(c.map((ck, k) => ck / (k + 1)), u) * u * s;
  };
  return f;
}

/** Spline cúbico natural por los puntos medidos, con su derivada (`.d`). */
function spline(puntos) {
  const x = puntos.map((p) => p[0]);
  const y = puntos.map((p) => p[1]);
  const n = x.length - 1;
  const h = x.slice(1).map((v, i) => v - x[i]);
  const a = new Array(n + 1).fill(0);
  const b = new Array(n + 1).fill(1);
  const c = new Array(n + 1).fill(0);
  const d = new Array(n + 1).fill(0);
  for (let i = 1; i < n; i++) {
    a[i] = h[i - 1];
    b[i] = 2 * (h[i - 1] + h[i]);
    c[i] = h[i];
    d[i] = 6 * ((y[i + 1] - y[i]) / h[i] - (y[i] - y[i - 1]) / h[i - 1]);
  }
  for (let i = 1; i <= n; i++) {
    const k = a[i] / b[i - 1];
    b[i] -= k * c[i - 1];
    d[i] -= k * d[i - 1];
  }
  const M = new Array(n + 1).fill(0);
  M[n] = d[n] / b[n];
  for (let i = n - 1; i >= 0; i--) M[i] = (d[i] - c[i] * M[i + 1]) / b[i];
  const tramo = (t) => {
    let i = 0;
    while (i < n - 1 && t > x[i + 1]) i++;
    return i;
  };
  const f = (t) => {
    const i = tramo(t);
    const A = x[i + 1] - t;
    const B = t - x[i];
    return (M[i] * A ** 3 + M[i + 1] * B ** 3) / (6 * h[i])
      + (y[i] / h[i] - (M[i] * h[i]) / 6) * A + (y[i + 1] / h[i] - (M[i + 1] * h[i]) / 6) * B;
  };
  f.d = (t) => {
    const i = tramo(t);
    const A = x[i + 1] - t;
    const B = t - x[i];
    return (M[i + 1] * B ** 2 - M[i] * A ** 2) / (2 * h[i])
      + (y[i + 1] - y[i]) / h[i] - ((M[i + 1] - M[i]) * h[i]) / 6;
  };
  f.d2 = (t) => {
    const i = tramo(t);
    return (M[i] * (x[i + 1] - t) + M[i + 1] * (t - x[i])) / h[i];
  };
  return f;
}

/** Hermite cúbico por nodos [x, y, pendiente]; sin pendiente, la de los vecinos. */
function hermite(nodos) {
  const n = nodos.length;
  const pend = nodos.map((p, i) => {
    if (p[2] !== undefined) return p[2];
    const [u, v] = i === 0 ? [nodos[0], nodos[1]] : i === n - 1 ? [nodos[n - 2], nodos[n - 1]] : [nodos[i - 1], nodos[i + 1]];
    return (v[1] - u[1]) / (v[0] - u[0]);
  });
  return (t) => {
    let i = 0;
    while (i < n - 2 && t > nodos[i + 1][0]) i++;
    const [x0, y0] = nodos[i];
    const [x1, y1] = nodos[i + 1];
    const h = x1 - x0;
    const u = (t - x0) / h;
    return (2 * u ** 3 - 3 * u ** 2 + 1) * y0 + (u ** 3 - 2 * u ** 2 + u) * h * pend[i]
      + (-2 * u ** 3 + 3 * u ** 2) * y1 + (u ** 3 - u ** 2) * h * pend[i + 1];
  };
}

/** Dónde cruza f el valor v en [a, b], por cambios de signo. */
function cortes(f, [a, b], v = 0, h = 1e-3) {
  const r = [];
  let xa = a;
  let fa = f(a) - v;
  for (let x = a + h; x <= b + 1e-12; x += h) {
    const fx = f(x) - v;
    if (fa * fx < 0) r.push(xa - (fa * h) / (fx - fa));
    xa = x;
    fa = fx;
  }
  return r;
}

/** El máximo de f en [a, b], muestreado: [x, f(x)]. */
function maximo(f, [a, b], h = 1e-3) {
  let mejor = [a, f(a)];
  for (let x = a; x <= b + 1e-12; x += h) if (f(x) > mejor[1]) mejor = [x, f(x)];
  return mejor;
}
const minimo = (f, tramo) => {
  const [x, v] = maximo((t) => -f(t), tramo);
  return [x, -v];
};
const cerca = (a, b, tol) => Math.abs(a - b) <= tol;

/** La constante que, sumada a la primitiva F, mejor casa con la función
 *  medida (mínimos cuadrados). Devuelve la función y su desvío medio. */
function casa(F, medida) {
  const n = medida.length;
  const C = medida.reduce((s, [x, v]) => s + v - F(x), 0) / n;
  const g = (x) => F(x) + C;
  const desvio = Math.sqrt(medida.reduce((s, [x, v]) => s + (v - g(x)) ** 2, 0) / n);
  return { g, desvio };
}

/* ── el dibujo ─────────────────────────────────────────────────────── */

/** La rejilla de las diapositivas: rectas finas del color de los ejes. */
function rejilla(f, xs, ys, [x0, x1], [y0, y1]) {
  f.clase('rej', 'stroke: var(--rule); stroke-width: 1; fill: none; stroke-dasharray: 4 3;');
  for (const x of xs) f.poli([[x, y0], [x, y1]], { clase: 'rej' });
  for (const y of ys) f.poli([[x0, y], [x1, y]], { clase: 'rej' });
}

/** Los valores de a a b con paso h, sin el cero (ahí va el eje). */
const serie = (a, b, h) => {
  const r = [];
  for (let k = 0; a + k * h <= b + 1e-9; k++) {
    const v = Math.round((a + k * h) * 1000) / 1000;
    if (Math.abs(v) > 1e-9) r.push(v);
  }
  return r;
};

/** Una etiqueta de marca con coma decimal: 0.5 → «0,5». */
const coma = (v) => [v, String(v).replace('.', ',')];

/* ── 1 · extremos con un salto y dos picos ────────────────────────── */

const extremos = (() => {
  const f = lienzo({
    id: 'cq4-extremos',
    ancho: 400,
    alto: 300,
    x: [-6.6, 8.6],
    y: [-5.7, 5.2],
    cuadrado: true,
    titulo: 'Una función con un salto y dos picos',
    desc:
      'La gráfica de una función entre x igual a menos seis y x igual a ocho, sobre una cuadrícula. ' +
      'Empieza en 1,2, baja hasta un mínimo suave en el punto (menos cuatro, menos tres) y sube hasta ' +
      'un círculo hueco en (menos tres, menos dos). En x igual a menos tres la función vale menos ' +
      'cinco, un punto relleno, y desde ahí sube hasta un pico en (cuatro, cuatro). Baja casi en ' +
      'línea recta hasta un vértice en (seis, menos dos) y vuelve a subir hasta (ocho, dos).',
  });
  const [x0, x1] = f.rango.x;
  const [y0, y1] = f.rango.y;
  rejilla(f, serie(-6, 8, 1), serie(-5, 5, 1), [x0, x1], [y0, y1]);
  const t1 = hermite([[-6, 1.2], [-5.5, -0.68], [-5, -1.92], [-4.5, -2.7], [-4, -3, 0], [-3.5, -2.83], [-3, -2, 2.1]]);
  const t2 = hermite([
    [-3, -5, 2.9], [-2.5, -3.65], [-2, -2.62], [-1.5, -1.83], [-1, -1.28], [-0.5, -0.93], [0, -0.7],
    [0.5, -0.52], [1, -0.35], [1.5, -0.13], [2, 0.25], [2.5, 0.78], [3, 1.5], [3.5, 2.53], [4, 4, 3.4],
  ]);
  const t3 = hermite([[4, 4, -6.8], [4.25, 2.46], [4.5, 1.3], [4.75, 0.29], [5, -0.65], [5.25, -1.29], [5.5, -1.76], [5.75, -1.95], [6, -2, -0.3]]);
  const t4 = hermite([[6, -2, 3.3], [6.25, -1.21], [6.5, -0.51], [6.75, 0.16], [7, 0.69], [7.25, 1.16], [7.5, 1.48], [7.75, 1.77], [8, 2, 0.85]]);
  /* Lo que dicen los porqués: mínimo local en −4 que vale −3, f(−3) = −5
     por debajo de todo, máximo absoluto 4 en x = 4. */
  comprueba(cerca(minimo(t1, [-6, -3])[0], -4, 0.05), 'el mínimo del primer tramo no está en x = −4');
  const todo = (x) => (x < -3 ? t1(x) : x <= 4 ? t2(x) : x <= 6 ? t3(x) : t4(x));
  comprueba(minimo((x) => (x === -3 ? -5 : todo(x)), [-6, 8])[1] >= -5 - 1e-9, 'algo baja de −5');
  comprueba(maximo(todo, [-6, 8])[0] === 4 || cerca(maximo(todo, [-6, 8])[0], 4, 1e-3), 'el máximo absoluto no está en x = 4');
  f.curva(t1, [-6, -3], { n: 90 });
  f.curva(t2, [-3, 4], { n: 150 });
  f.curva(t3, [4, 6], { n: 60 });
  f.curva(t4, [6, 8], { n: 60 });
  f.ejes({ nombreX: 'x', nombreY: 'y', marcasX: serie(-6, 8, 1), marcasY: serie(-5, 5, 1) });
  f.punto(-3, -2, { clase: 'hueco', r: 3.6 });
  f.punto(-3, -5, { r: 3.6 });
  return f.svg();
})();

/* ── 2 · el beneficio a lo largo del año ──────────────────────────── */

const beneficio = (() => {
  const f = lienzo({
    id: 'cq4-beneficio',
    ancho: 380,
    alto: 250,
    x: [-0.8, 12.9],
    y: [-0.25, 7.4],
    titulo: 'El beneficio de un comercio a lo largo del año',
    desc:
      'Una curva sobre los doce meses del año, repartidos en cuatro trimestres rotulados en-mar, ' +
      'abr-jun, jul-sep y oct-dic, con una cuadrícula de un mes de ancho. Sube desde el principio ' +
      'del año hasta un pico a primeros de marzo, baja hasta un valle a finales de junio, sube ' +
      'hasta un pico pequeño a primeros de octubre, baja un poco hasta finales de noviembre y en ' +
      'diciembre sube con fuerza hasta acabar el año más alta que el pico de marzo. El eje ' +
      'vertical no lleva números.',
  });
  rejilla(f, serie(1, 12, 1), serie(1, 7, 1), [0, 12], [0, 7]);
  const b = hermite([
    [0, 3, 0.4], [0.5, 3.35], [1, 4], [1.5, 4.73], [2, 5.08], [2.25, 5.15, 0], [2.5, 5.11], [3, 4.79],
    [3.5, 4.23], [4, 3.56], [4.5, 2.82], [5, 2.27], [5.5, 1.93], [5.9, 1.84, 0], [6.5, 1.99], [7, 2.37],
    [7.5, 2.9], [8, 3.45], [8.5, 3.92], [9, 4.2], [9.4, 4.24, 0], [10, 4.04], [10.5, 3.74], [10.85, 3.65, 0],
    [11.25, 3.87], [11.5, 4.31], [11.75, 5.1], [12, 6.45, 5.8],
  ]);
  /* El máximo del año es el último día, y el pico de marzo queda por debajo. */
  comprueba(cerca(maximo(b, [0, 12])[0], 12, 1e-6), 'el máximo del año no es el último día');
  comprueba(maximo(b, [0, 11])[0] < 3, 'el mayor pico interior no es el de marzo');
  comprueba(maximo(b, [6, 9])[1] < maximo(b, [0, 3])[1], 'jul-sep sube por encima del pico de marzo');
  f.curva(b, [0, 12], { n: 200 });
  f.ejes({ nombreX: 'día', nombreY: 'beneficio', marcasX: [3, 6, 9, 12].map((m) => [m, '']) });
  for (const [m, t] of [[1.5, 'en-mar'], [4.5, 'abr-jun'], [7.5, 'jul-sep'], [10.5, 'oct-dic']]) {
    f.rotulo(m, 0, t, { anclaje: 'middle', dy: 16, pequeno: true, color: 'var(--faint)' });
  }
  return f.svg();
})();

/* ── 5 · cuántos puntos con pendiente 1/7 ─────────────────────────── */

const pendiente = (() => {
  const y = spline([
    [3, 2], [3.5, 1.21], [4, 0.04], [4.5, -1.24], [5, -2.57], [5.5, -3.52], [6, -4.31], [6.5, -4.66],
    [7, -4.51], [7.5, -3.94], [8, -2.92], [8.5, -1.58], [9, -0.02], [9.5, 1.79], [10, 3.29], [10.5, 4.64],
    [11, 5.69], [11.5, 6.43], [12, 6.61], [12.5, 6.34], [13, 5.7], [13.5, 4.83], [14, 3.8], [14.5, 2.61],
    [15, 1.75], [15.5, 1.26], [16, 1.41], [16.5, 2.46], [17, 4],
  ]);
  /* La pendiente media es (4 − 2)/14 = 1/7 y se alcanza tres veces. */
  const puntos = cortes(y.d, [3, 17], 1 / 7);
  comprueba(puntos.length === 3, `y' = 1/7 en ${puntos.length} puntos, y el porqué dice tres`);
  comprueba(y(3) === 2 && y(17) === 4, 'los extremos no son (3, 2) y (17, 4)');
  const f = lienzo({
    id: 'cq4-pendiente',
    ancho: 420,
    alto: 320,
    x: [-0.6, 17.8],
    y: [-5.5, 7.6],
    cuadrado: true,
    titulo: 'Una función entre x igual a tres y x igual a diecisiete',
    desc:
      'La gráfica de y(x) sobre una cuadrícula. Empieza en el punto (3, 2), baja hasta un mínimo ' +
      'de casi menos cinco cerca de x igual a 6,6, sube cortando el eje en x igual a nueve hasta un ' +
      'máximo de 6,6 en x igual a doce, baja hasta un mínimo de 1,25 cerca de x igual a 15,7 y ' +
      'termina subiendo en el punto (17, 4).',
  });
  const [x0, x1] = f.rango.x;
  const [y0, y1] = f.rango.y;
  rejilla(f, serie(1, 17, 1), serie(-4, 6, 2), [x0, x1], [y0, y1]);
  f.curva(y, [3, 17], { n: 240 });
  f.ejes({ nombreX: 'x', nombreY: 'y', marcasX: serie(1, 17, 1), marcasY: serie(-4, 6, 2) });
  f.punto(3, 2, { r: 3 }).punto(17, 4, { r: 3 });
  f.rotulo(7.8, 4.4, 'y(x)', { anclaje: 'middle', color: 'var(--d1)' });
  return f.svg();
})();

/* ── 8, 9 y 10 · la derivada tercera, o la cuarta ─────────────────── */

const derivadaAlta = spline([
  [-4, 3.95], [-3.9, 3.1], [-3.8, 2.43], [-3.7, 2.07], [-3.6, 1.91], [-3.5, 1.85], [-3.4, 1.82], [-3.2, 1.8],
  [-3, 1.53], [-2.8, 1.07], [-2.6, 0.44], [-2.4, -0.25], [-2.2, -1.05], [-2, -1.81], [-1.8, -2.32],
  [-1.6, -2.67], [-1.4, -2.75], [-1.2, -2.58], [-1, -2.15], [-0.8, -1.63], [-0.6, -0.95], [-0.4, -0.21],
  [-0.2, 0.56], [0, 1.17], [0.2, 1.68], [0.4, 2.1], [0.6, 2.29], [0.8, 2.36], [1, 2.3], [1.2, 2.17],
  [1.4, 2.04], [1.6, 1.99], [1.8, 2.05], [2, 2.31], [2.2, 2.75], [2.4, 3.38], [2.6, 4.07], [2.8, 4.7],
  [3, 5.18], [3.1, 5.15], [3.2, 4.96], [3.3, 4.5], [3.4, 3.63], [3.5, 2.77],
]);
{
  const g = derivadaAlta;
  const abs = (x) => Math.abs(g(x));
  /* Diapositiva 8, en [2, 3]: el máximo es unos 5,2 (la B, 5,5, lo acota) y
     el mínimo unos 2,3 (la C, 5,5/4!, queda por debajo del error). */
  comprueba(maximo(g, [2, 3])[1] > 5 && maximo(g, [2, 3])[1] < 5.5, 'el máximo en [2, 3] no está entre 5 y 5,5');
  comprueba(minimo(g, [2, 3])[1] >= 2.28, 'el mínimo en [2, 3] baja de 2,28');
  /* Diapositiva 9, en [−3, −2]: |y⁽⁴⁾| llega a 1,8 (pasa de 1,5, no de 2). */
  const m9 = maximo(abs, [-3, -2])[1];
  comprueba(m9 > 1.5 && m9 < 2, `el máximo de |y⁽⁴⁾| en [−3, −2] es ${m9.toFixed(2)}`);
  comprueba(cerca(g(-2), -1.8, 0.05) && cerca(g(-3), 1.53, 0.05), 'los valores en −3 y −2 no son 1,5 y −1,8');
  /* Diapositiva 10, en [−2, 0]: el mínimo es unos −2,75 (pasa de 2,5, no de 3). */
  const m10 = minimo(g, [-2, 0]);
  comprueba(m10[1] > -3 && m10[1] < -2.5 && cerca(m10[0], -1.4, 0.1), `el mínimo en [−2, 0] es ${m10[1].toFixed(2)}`);
  comprueba(g(-4) > 3.8, 'la gráfica no empieza en 4');
}

function taylor(id, rotulo, cual) {
  const f = lienzo({
    id,
    ancho: 340,
    alto: 300,
    x: [-4.6, 4.1],
    y: [-3.4, 5.9],
    titulo: `La gráfica de ${cual}`,
    desc:
      `La gráfica de ${cual} entre x igual a menos cuatro y x igual a 3,5, sobre una cuadrícula ` +
      'de media unidad. Empieza en cuatro, baja deprisa hasta un rellano de 1,8 cerca de x igual a ' +
      'menos 3,5, corta el eje en menos 2,5 y llega a un mínimo de menos 2,75 cerca de x igual a ' +
      'menos 1,4. Sube, corta el eje cerca de menos 0,35, hace un máximo pequeño de 2,4 cerca de ' +
      'x igual a 0,8 y un mínimo de 2 en 1,6, y sube hasta un máximo de 5,2 cerca de x igual a tres ' +
      'antes de caer hasta 2,8 en 3,5.',
  });
  const [x0, x1] = f.rango.x;
  const [y0, y1] = f.rango.y;
  rejilla(f, serie(-4.5, 4, 0.5), serie(-3, 5.5, 0.5), [x0, x1], [y0, y1]);
  f.curva(derivadaAlta, [-4, 3.5], { n: 240 });
  f.ejes({ nombreX: 'x', nombreY: 'y', marcasX: serie(-4, 4, 1), marcasY: serie(-3, 5, 1) });
  f.rotulo(-3.5, 4.6, rotulo, { color: 'var(--d1)' });
  return f.svg();
}

/* ── 12 · los signos del polinomio de Taylor en x = 4 ─────────────── */

const signos = (() => {
  /* Un spline por la medida hacía un codo justo en x = 4, que es donde se
     mira la concavidad; el polinomio de grado 5 casa igual (0,02) y es suave. */
  const y = ajusta(tabla(0, 0.25, [
    0.32, -0.48, -1.16, -1.66, -1.93, -2.05, -2.03, -1.86, -1.6, -1.29, -0.91, -0.44, 0.04,
    0.49, 0.93, 1.32, 1.71, 1.97, 2.17, 2.23, 2.18, 1.95, 1.54, 0.93, 0.19,
  ]), 5);
  /* a = y(4) > 0, b = y'(4) > 0, c = y''(4)/2 < 0; el cero y la inflexión,
     cerca de x = 3. */
  comprueba(y(4) > 1.5 && y.d(4) > 0 && y.d2(4) < 0, 'los signos en x = 4 no son +, +, −');
  comprueba(cerca(cortes(y, [1, 5])[0], 3, 0.05), 'el cero no está en x = 3');
  comprueba(cerca(cortes(y.d2, [1, 5])[0], 3, 0.1), 'la inflexión no está cerca de x = 3');
  comprueba(cerca(maximo(y, [3, 6])[0], 4.75, 0.1), 'el máximo no está cerca de 4,75');
  const f = lienzo({
    id: 'cq4-signos',
    ancho: 340,
    alto: 250,
    x: [-0.5, 6.5],
    y: [-2.5, 2.8],
    cuadrado: true,
    titulo: 'Una función con un mínimo y un máximo',
    desc:
      'La gráfica de y(x) entre x igual a cero y x igual a seis, sobre una cuadrícula. Empieza en ' +
      '0,3, baja hasta un mínimo de menos dos cerca de x igual a 1,3, sube cortando el eje en x ' +
      'igual a tres hasta un máximo de 2,2 cerca de x igual a 4,75 y baja hasta casi cero en x ' +
      'igual a seis. En x igual a cuatro la curva está a una altura de 1,7, subiendo.',
  });
  const [x0, x1] = f.rango.x;
  const [y0, y1] = f.rango.y;
  rejilla(f, serie(1, 6, 1), serie(-2, 2, 1), [x0, x1], [y0, y1]);
  f.curva(y, [0, 6], { n: 160 });
  f.ejes({ nombreX: 'x', nombreY: 'y', marcasX: serie(1, 6, 1), marcasY: serie(-2, 2, 1) });
  return f.svg();
})();

/* ── 13 y 14 · cuál es la derivada, cuál la función ───────────────── */

/** Un panel de ejes con rejilla para los mosaicos de −4 a 2. */
const panel = (etiqueta, traza, y = [-2.3, 2.7]) => ({
  etiqueta,
  x: [-4.35, 2.45],
  y,
  dibuja: (p) => {
    const [x0, x1] = p.rango.x;
    const [y0, y1] = p.rango.y;
    rejilla(p, serie(-4, 2, 1), serie(-2, 2, 1), [x0, x1], [y0, y1]);
    p.curva(traza, [-4, 2], { n: 150 });
    p.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-4, -3, -2, -1, 1, 2], marcasY: [-2, -1, 1, 2] });
  },
});

const derivada = (() => {
  /* La (3) es y′: se ajusta su medida y se integra; la constante casa con la
     y medida. La (1) y la (2), tal como se miden. */
  const d3 = ajusta(tabla(-4, 0.2, [
    0.29, 0.75, 0.97, 0.92, 0.67, 0.32, -0.01, -0.34, -0.59, -0.7, -0.71, -0.64, -0.44, -0.24, 0, 0.41,
    0.86, 1.17, 1.51, 1.75, 1.96, 2.06, 2.06, 1.97, 1.76, 1.39, 1.12, 0.68, 0.17, -0.41, -0.87,
  ]), 8);
  const yMedida = tabla(-3.8, 0.2, [
    -1.22, -1.06, -0.85, -0.71, -0.61, -0.58, -0.62, -0.71, -0.81, -0.99, -1.12, -1.21, -1.28, -1.31,
    -1.26, -1.13, -0.94, -0.67, -0.34, 0.04, 0.44, 0.79, 1.26, 1.58, 1.98, 2.22, 2.38, 2.48, 2.45, 2.37,
  ]);
  const { g: y, desvio } = casa(d3.prim, yMedida);
  comprueba(desvio < 0.05, `la integral de la (3) se aparta ${desvio.toFixed(3)} de la y medida`);
  const d1 = ajusta(tabla(-4, 0.2, [
    2, 1.57, 1.05, 0.58, 0.27, -0.04, -0.28, -0.41, -0.47, -0.47, -0.4, -0.31, -0.06, -0.01, 0.26, 0.5,
    0.71, 0.9, 1.06, 1.24, 1.35, 1.39, 1.39, 1.36, 1.24, 1.11, 0.88, 0.62, 0.31, -0.09, -0.4,
  ]), 8);
  const d2 = ajusta(tabla(-4, 0.2, [
    2.32, 1.77, 1.13, 0.53, 0, -0.45, -0.77, -0.99, -1.06, -1.01, -0.86, -0.67, -0.33, 0.01, 0.37, 0.82,
    1.21, 1.54, 1.85, 2.02, 2.17, 2.19, 2.15, 2.01, 1.74, 1.41, 1.08, 0.58, 0.1, -0.44, -0.96,
  ]), 8);
  /* Los porqués: la (3) se anula en −2,8, −1,2 y 1,65 y vale unos 2 como
     mucho; la (1) no llega a 1,5 y y sube más de 1,8 de media entre −0,5 y 1;
     la (2) cambia de signo en −3,2, con y todavía subiendo hasta −2,8. */
  const ceros3 = cortes(d3, [-4, 2]);
  comprueba(ceros3.length === 3 && cerca(ceros3[0], -2.8, 0.08) && cerca(ceros3[1], -1.2, 0.08) && cerca(ceros3[2], 1.65, 0.08),
    `los ceros de la (3) son ${ceros3.map((c) => c.toFixed(2))}`);
  comprueba(cerca(maximo(d3, [-1, 2])[1], 2.05, 0.1), 'el máximo de la (3) no es de unos 2');
  comprueba(maximo(d1, [-4, 2], 1e-3)[1] > 1.9 && maximo(d1, [-2, 2])[1] < 1.5, 'la (1) no se queda por debajo de 1,5');
  comprueba((y(1) - y(-0.5)) / 1.5 > 1.8 && cerca(y(-0.5), -0.8, 0.06) && cerca(y(1), 2, 0.06), 'la pendiente media de y entre −0,5 y 1 no pasa de 1,8');
  comprueba(cerca(cortes(d2, [-4, -2.5])[0], -3.2, 0.08) && y(-2.8) > y(-3.2), 'la (2) no cambia de signo en −3,2 con y subiendo');
  return mosaico({
    id: 'cq4-derivada',
    titulo: 'Una función y tres candidatas a su derivada',
    desc:
      'Cuatro recuadros con los mismos ejes, de x igual a menos cuatro a x igual a dos. En el ' +
      'primero, y(x): sube de menos 1,35 hasta un máximo de menos 0,6 en x igual a menos 2,8, baja ' +
      'hasta un mínimo de menos 1,3 en x igual a menos 1,2, sube empinada por el origen hasta un ' +
      'máximo de 2,5 en x igual a 1,65 y baja un poco. La (1) empieza en dos, baja hasta menos 0,5, ' +
      'sube hasta un máximo de 1,4 y acaba en menos 0,4; se anula cerca de menos tres, menos 1,4 y ' +
      '1,75. La (2) empieza en 2,3, se anula en menos 3,2, baja hasta menos 1,05, sube hasta 2,2 y ' +
      'acaba en menos uno. La (3) empieza en 0,3, sube hasta uno, se anula en menos 2,8, baja hasta ' +
      'menos 0,7, se anula en menos 1,2, sube hasta dos, se anula en 1,65 y acaba en menos 0,9.',
    columnas: 2,
    ancho: 200,
    alto: 165,
    celdas: [panel('y(x)', y), panel('(1)', d1), panel('(2)', d2), panel('(3)', d3)],
  });
})();

const primitiva = (() => {
  /* y′ se ajusta a su medida y la (1) es su integral, con la constante que
     casa con la (1) medida. La (2) y la (3), tal como se miden. */
  const dy = ajusta(tabla(-4, 0.2, [
    -1.58, -1.36, -1.05, -0.84, -0.56, -0.33, -0.13, 0.05, 0.2, 0.35, 0.46, 0.54, 0.64, 0.65, 0.71, 0.71,
    0.7, 0.65, 0.6, 0.53, 0.45, 0.3, 0.17, 0.03, -0.18, -0.39, -0.6, -0.79, -1.09, -1.35, -1.68,
  ]), 6);
  const unoMedida = tabla(-3.9, 0.2, [
    1.21, 0.94, 0.71, 0.55, 0.45, 0.37, 0.35, 0.36, 0.41, 0.47, 0.55, 0.65, 0.8, 0.93, 1.06, 1.2, 1.39,
    1.5, 1.62, 1.74, 1.82, 1.9, 1.92, 1.92, 1.91, 1.82, 1.73, 1.54, 1.33, 1.07,
  ]);
  const { g: uno, desvio } = casa(dy.prim, unoMedida);
  comprueba(desvio < 0.05, `la integral de y′ se aparta ${desvio.toFixed(3)} de la (1) medida`);
  const dos = ajusta(tabla(-4, 0.2, [
    0.82, 0.4, 0.02, -0.29, -0.49, -0.66, -0.74, -0.74, -0.73, -0.65, -0.5, -0.36, -0.17, 0.06, 0.26, 0.5,
    0.77, 1.01, 1.21, 1.43, 1.63, 1.79, 1.91, 1.98, 2.02, 2, 1.91, 1.76, 1.57, 1.28, 0.94,
  ]), 6);
  const tres = ajusta(tabla(-3.9, 0.2, [
    0.83, 1.21, 1.49, 1.72, 1.9, 2.02, 2.1, 2.12, 2.12, 2.06, 2.01, 1.92, 1.79, 1.62, 1.51, 1.35, 1.18,
    1.02, 0.87, 0.77, 0.59, 0.51, 0.44, 0.38, 0.37, 0.38, 0.45, 0.56, 0.68, 0.88,
  ]), 6);
  /* Los porqués: y′ se anula en −2,65 y 0,6 y no pasa de 0,7; la (2) sube de
     media unos 0,85 entre −2,6 y 0,6; la (1), menos de 0,5; la (3) tiene su
     máximo cerca de −2,5. */
  const ceros = cortes(dy, [-4, 2]);
  const maxDy = maximo(dy, [-4, 2])[1];
  comprueba(ceros.length === 2 && cerca(ceros[0], -2.65, 0.06) && cerca(ceros[1], 0.62, 0.06), `los ceros de y′ son ${ceros.map((c) => c.toFixed(2))}`);
  comprueba(maxDy > 0.68 && maxDy < 0.74, `el máximo de y′ es ${maxDy.toFixed(2)}`);
  const media2 = (dos(0.6) - dos(-2.6)) / 3.2;
  comprueba(media2 > 0.8 && media2 < 0.9 && media2 > maxDy, `la pendiente media de la (2) es ${media2.toFixed(2)}`);
  const media1 = (maximo(uno, [-1, 2])[1] - minimo(uno, [-4, -1])[1]) / (maximo(uno, [-1, 2])[0] - minimo(uno, [-4, -1])[0]);
  comprueba(media1 < 0.5, `la pendiente media de la (1) es ${media1.toFixed(2)}`);
  comprueba(cerca(maximo(tres, [-4, 0])[0], -2.5, 0.15), 'el máximo de la (3) no está cerca de −2,5');
  return mosaico({
    id: 'cq4-primitiva',
    titulo: 'Una derivada y tres candidatas a la función',
    desc:
      'Cuatro recuadros con los mismos ejes, de x igual a menos cuatro a x igual a dos. En el ' +
      'primero, y prima de x: empieza en menos 1,6, se anula en x igual a menos 2,65, llega a un ' +
      'máximo de 0,7 en x igual a menos uno, se anula en 0,6 y acaba en menos 1,7. La (1) baja de ' +
      '1,3 a un mínimo de 0,35 en menos 2,7, sube hasta un máximo de 1,9 cerca de 0,6 y baja hasta ' +
      'uno. La (2) baja de 0,8 a un mínimo de menos 0,75 en menos 2,65, sube hasta un máximo de dos ' +
      'cerca de 0,8 y baja hasta 0,9. La (3) sube de 0,7 a un máximo de 2,1 cerca de menos 2,5, ' +
      'baja hasta un mínimo de 0,4 cerca de uno y sube hasta uno.',
    columnas: 2,
    ancho: 200,
    alto: 165,
    celdas: [panel("y'(x)", dy), panel('(1)', uno), panel('(2)', dos), panel('(3)', tres)],
  });
})();

/* ── 15 · la función y sus dos derivadas, sin decir cuál es cuál ──── */

const cadena = (() => {
  /* Medidas las tres, son exactamente una cuártica par en u = x + 1/2 y sus
     dos derivadas: y = a·u⁴ + b·u² + c (casan con un desvío de 0,006). */
  const a = 0.1068;
  const b = -0.7065;
  const c = 0.17;
  const y = (x) => a * (x + 0.5) ** 4 + b * (x + 0.5) ** 2 + c;
  const y1 = (x) => 4 * a * (x + 0.5) ** 3 + 2 * b * (x + 0.5);
  const y2 = (x) => 12 * a * (x + 0.5) ** 2 + 2 * b;
  /* Los porqués: y′ se anula en −0,5; y″ en −1,55 y 0,55; y no se anula en
     −1,55 ni en 0,55. */
  const ceros2 = cortes(y2, [-2, 1]);
  comprueba(ceros2.length === 2 && cerca(ceros2[0], -1.55, 0.02) && cerca(ceros2[1], 0.55, 0.02), 'y″ no se anula en −1,55 y 0,55');
  comprueba(Math.abs(y(-1.55)) > 0.3 && Math.abs(y(0.55)) > 0.3 && y(-0.5) > 0.1, 'y se anula donde no debe');
  const f = lienzo({
    id: 'cq4-cadena',
    ancho: 380,
    alto: 300,
    x: [-2.35, 1.75],
    y: [-1.6, 1.75],
    cuadrado: true,
    titulo: 'Tres curvas: una función y sus dos primeras derivadas',
    desc:
      'Tres curvas en los mismos ejes, entre x igual a menos dos y x igual a uno, sobre una ' +
      'cuadrícula de media unidad. La (1), con forma de parábola, baja de 1,5 a un mínimo de ' +
      'menos 1,4 en x igual a menos 0,5 y sube a 1,5, cortando el eje en menos 1,55 y 0,55. La ' +
      '(2) sube de 0,7 a un máximo de uno en x igual a menos 1,55, baja cortando el eje en menos ' +
      '0,5 hasta un mínimo de menos uno en x igual a 0,55 y sube a menos 0,7. La (3) sube de menos ' +
      '0,9 a un máximo de 0,17 en x igual a menos 0,5, cortando el eje en menos uno y en cero, y ' +
      'baja a menos 0,9.',
  });
  f.clase('c3', 'stroke: var(--d2); stroke-width: 2.8; fill: none;');
  const [x0, x1] = f.rango.x;
  const [yy0, yy1] = f.rango.y;
  rejilla(f, serie(-2, 1.5, 0.5), serie(-1.5, 1.5, 0.5), [x0, x1], [yy0, yy1]);
  f.curva(y2, [-2, 1], { n: 120 });
  f.curva(y1, [-2, 1], { clase: 'c2', n: 120 });
  f.curva(y, [-2, 1], { clase: 'c3', n: 120 });
  f.ejes({
    nombreX: 'x',
    nombreY: 'y',
    marcasX: [-2, -1.5, -1, -0.5, 0.5, 1].map(coma),
    marcasY: [-1, -0.5, 0.5, 1, 1.5].map(coma),
  });
  f.rotulo(-2, y2(-2), '(1)', { anclaje: 'end', dx: -6, dy: 4, color: 'var(--d1)' });
  f.rotulo(-2, y1(-2), '(2)', { anclaje: 'end', dx: -6, dy: 4, color: 'var(--alt)' });
  f.rotulo(-2, y(-2), '(3)', { anclaje: 'end', dx: -6, dy: 4, color: 'var(--d2)' });
  return f.svg();
})();

/* ── 16 · la derivada de una parábola ─────────────────────────────── */

const parabola = (() => {
  /* y = k·x(6 − x), medida: el vértice (3; 3,78) y los ceros en 0 y 6. */
  const k = 0.42;
  const y = (x) => k * x * (6 - x);
  const d = (x) => k * (6 - 2 * x);
  const dos = (x) => 1.2 - 0.4 * x;
  const tres = (x) => 0.55 * (x - 3);
  /* Los porqués: y(1) = 2,1; la (1) empieza en 2,5 y la (2) en 1,2. */
  comprueba(cerca(y(1), 2.1, 0.02) && cerca(d(0), 2.52, 0.01) && dos(0) === 1.2, 'los valores de la 16 no son los del porqué');
  const celda = (etiqueta, traza, dominio, y0) => ({
    etiqueta,
    x: [-1.3, 6.6],
    y: y0,
    dibuja: (p) => {
      const [x0, x1] = p.rango.x;
      const [a, b] = p.rango.y;
      rejilla(p, serie(-1, 6, 1), serie(Math.ceil(a), Math.floor(b), 1), [x0, x1], [a, b]);
      p.curva(traza, dominio, { n: 80 });
      p.ejes({ nombreX: 'x', nombreY: 'y', marcasX: serie(1, 6, 1), marcasY: serie(Math.ceil(a), Math.floor(b), 1) });
    },
  });
  return mosaico({
    id: 'cq4-parabola',
    titulo: 'Una parábola y tres rectas candidatas a su derivada',
    desc:
      'Cuatro recuadros. En el primero, y(x): una parábola que sale del origen, sube hasta un ' +
      'máximo de 3,8 en x igual a tres y vuelve a cero en x igual a seis. La (1) es una recta que ' +
      'baja de 2,5 en x igual a cero a menos 2,5 en x igual a seis, cortando el eje en tres. La (2), ' +
      'una recta que baja de 1,2 a menos 1,2, también con el corte en tres. La (3), una recta que ' +
      'sube de menos 1,65 a 1,65, con el corte en tres.',
    columnas: 2,
    ancho: 200,
    alto: 165,
    celdas: [
      celda('y(x)', y, [0, 6], [-0.6, 4.3]),
      celda('(1)', d, [0, 6], [-3.2, 3.2]),
      celda('(2)', dos, [0, 6], [-3.2, 3.2]),
      celda('(3)', tres, [0, 6], [-3.2, 3.2]),
    ],
  });
})();

/* ── 17 · el crecimiento de una compuesta ─────────────────────────── */

const compuesta = (() => {
  /* Medidas, son exactamente f(x) = 6 − (x − 3)² en [1, 5] y
     g(x) = (x − 5)² + 1 en [2, 6]. */
  const f = (x) => 6 - (x - 3) ** 2;
  const g = (x) => (x - 5) ** 2 + 1;
  comprueba(f(2) === 5 && f(4) === 5 && f(3) === 6 && g(5) === 1, 'f y g no pasan por donde dice el porqué');
  const celda = (etiqueta, traza, dominio, x, y, mx, my) => ({
    etiqueta,
    x,
    y,
    dibuja: (p) => {
      const [x0, x1] = p.rango.x;
      const [a, b] = p.rango.y;
      rejilla(p, mx, my, [x0, x1], [a, b]);
      p.curva(traza, dominio, { n: 80 });
      p.ejes({ nombreX: 'x', nombreY: 'y', marcasX: mx, marcasY: my });
    },
  });
  return mosaico({
    id: 'cq4-compuesta',
    titulo: 'Las funciones f y g',
    desc:
      'Dos recuadros. En el primero, f(x): un arco de parábola que va de (1, 2) a un máximo en ' +
      '(3, 6) y baja a (5, 2), pasando por (2, 5) y por (4, 5). En el segundo, g(x): baja desde ' +
      '(2, 10), pasa por (3, 5) y por (4, 2), toca su mínimo en (5, 1) y sube hasta (6, 2).',
    columnas: 2,
    ancho: 200,
    alto: 235,
    celdas: [
      celda('f(x)', f, [1, 5], [-0.6, 6.7], [-0.6, 6.7], serie(1, 6, 1), serie(1, 6, 1)),
      celda('g(x)', g, [2, 6], [-1.2, 7.3], [-0.6, 10.7], serie(1, 7, 1), serie(1, 10, 1)),
    ],
  });
})();

/* ── 18 · cuál puede ser la derivada segunda ──────────────────────── */

const segunda = (() => {
  /* La y se ajusta a su medida y la (1) es su derivada segunda exacta. La (1)
     del original tiene los ceros y los signos de y″ pero no su tamaño: cerca
     del máximo de y vale −0,8, y la curvatura de la y medida da −1,3. Se
     dibuja la de verdad, y lo dice su pregunta en `calculo-t04.yaml`. La (2),
     tal como se mide. */
  const y = ajusta([
    [-1.97, 0.75], [-1.95, 0.75],
    ...tabla(-1.9, 0.1, [
      0.77, 0.81, 0.84, 0.85, 0.85, 0.83, 0.81, 0.78, 0.73, 0.69, 0.62, 0.58, 0.52, 0.48, 0.44, 0.39, 0.36,
      0.33, 0.31, 0.29, 0.29, 0.29, 0.29, 0.3, 0.31, 0.32, 0.33, 0.34, 0.34, 0.33, 0.31, 0.27, 0.23, 0.17,
      0.12, 0.05, -0.02, -0.13, -0.21,
    ]),
    [1.95, -0.26], [1.98, -0.27],
  ], 7);
  const d1 = y.d2;
  const d2 = ajusta(tabla(-2, 0.2, [
    0.85, 1.35, 1.56, 1.49, 1.22, 0.8, 0.37, 0.02, -0.44, -0.67, -0.8, -0.81, -0.65, -0.44, -0.11, 0.27,
    0.67, 1.02, 1.26, 1.25, 1.01,
  ]), 9);
  /* Los porqués: máximo de y cerca de −1,55, con la (1) negativa y la (2)
     positiva, de unos 1,5; mínimo suave cerca de 0,15, con la (1) positiva y
     la (2) negativa. */
  const extremos = cortes(y.d, [-2, 2]);
  comprueba(extremos.length === 3, `y tiene ${extremos.length} extremos, y los porqués cuentan tres`);
  const [xMax, xMin] = extremos;
  comprueba(cerca(xMax, -1.55, 0.05) && d1(xMax) < -0.5 && d2(xMax) > 1.3, 'en el máximo de y los signos no son los del porqué');
  comprueba(cerca(xMin, 0.15, 0.05) && d1(xMin) > 0.2 && d2(xMin) < -0.5, 'en el mínimo de y los signos no son los del porqué');
  const ceros1 = cortes(d1, [-2, 2]);
  comprueba(ceros1.length === 3 && cerca(ceros1[0], -0.83, 0.05) && cerca(ceros1[1], 0.5, 0.05), 'la (1) no se anula en −0,83 y 0,5, como dice la descripción');
  const celda = (etiqueta, traza, yr, my) => ({
    etiqueta,
    x: [-2.3, 2.3],
    y: yr,
    cuadrado: false,
    dibuja: (p) => {
      const [x0, x1] = p.rango.x;
      rejilla(p, serie(-2, 2, 0.5), my, [x0, x1], yr);
      p.curva(traza, [-2, 2], { n: 160 });
      p.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-2, -1, 1, 2], marcasY: my.map(coma) });
    },
  });
  return mosaico({
    id: 'cq4-segunda',
    titulo: 'Una función y dos candidatas a su derivada segunda',
    desc:
      'Tres recuadros, uno debajo de otro, con el mismo eje x de menos dos a dos. En el primero, ' +
      'y(x): sube de 0,73 a un máximo de 0,85 cerca de x igual a menos 1,55, baja hasta un mínimo ' +
      'suave de 0,29 cerca de x igual a 0,15, sube apenas hasta 0,34 cerca de 0,83 y baja hasta ' +
      'menos 0,3 en x igual a dos. La (1) empieza en menos 0,35, baja hasta menos 1,3 cerca de ' +
      'menos 1,6, sube cortando el eje en menos 0,83 hasta 0,75 cerca de menos 0,2, baja cortando ' +
      'el eje en 0,5 hasta menos 1,15 cerca de 1,35 y sube cortando el eje en 1,8 hasta 1,1. La ' +
      '(2) sube de 0,85 a un máximo de 1,55 cerca de menos 1,55, baja hasta menos 0,8 cerca de ' +
      '0,1, sube hasta 1,3 cerca de 1,7 y acaba en uno.',
    columnas: 1,
    ancho: 340,
    alto: 118,
    celdas: [
      celda('y(x)', y, [-0.45, 1.05], serie(-0.5, 1, 0.5)),
      celda('(1)', d1, [-1.5, 1.3], serie(-1, 1, 0.5)),
      celda('(2)', d2, [-1.0, 1.8], serie(-0.5, 1.5, 0.5)),
    ],
  });
})();

const taylor4 = taylor('cq4-taylor-4a', 'y⁽⁴⁾(x)', 'la derivada cuarta de y(x)');

const figuras = {
  'extremos-con-salto-y-picos': extremos,
  'beneficio-maximo-del-ano': beneficio,
  'pendiente-un-septimo': pendiente,
  'cota-de-taylor-de-orden-2': taylor('cq4-taylor-3', "y'''(x)", 'la derivada tercera de y(x)'),
  'cota-de-taylor-en-menos-3': taylor4,
  'cota-de-taylor-en-0': reetiqueta(taylor4, 'cq4-taylor-4a', 'cq4-taylor-4b'),
  'signos-del-polinomio-de-taylor': signos,
  'derivada-de-la-grafica': derivada,
  'funcion-desde-su-derivada': primitiva,
  'funcion-y-sus-dos-derivadas': cadena,
  'derivada-de-una-parabola': parabola,
  'crecimiento-de-la-compuesta': compuesta,
  'derivada-segunda-de-la-grafica': segunda,
};

for (const [id, svg] of Object.entries(figuras)) pegaEnPregunta(BANCO, id, svg);
console.log(`${Object.keys(figuras).length} figuras pegadas en ${BANCO}`);
