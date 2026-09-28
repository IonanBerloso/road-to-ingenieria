/**
 * Las figuras de las cuestiones del tema 5 de Cálculo, las de las
 * diapositivas de «Integración» (fase E3 de la auditoría del 27 de
 * septiembre de 2026).
 *
 * Se redibujan, no se recortan del PDF (§08), y se calculan. Las curvas que
 * resultaron ser fórmulas se dibujan con la fórmula —la exponencial de la 1,
 * las parábolas de la 6 y la 7, el arcotangente de la 9, las rectas de la
 * 12—; las demás están medidas sobre la diapositiva renderizada a 600 ppp,
 * columna a columna y por el color del trazo. Tres salvedades, que dice cada
 * pregunta en `calculo-t05.yaml`: en la 10, la 15 y la 16 la curva se ajusta
 * para pasar exactamente por las lecturas de las que salen las opciones
 * (el original se desvía de ellas entre 0,05 y 0,3 unidades).
 *
 * Lo que afirma cada porqué —el valor medio, las áreas, los valores en los
 * extremos— se comprueba al generar, y el guion se para si deja de cumplirse.
 *
 *   node scripts/figuras/calculo-cuestiones-t05.mjs
 *
 * Pega cada figura en su pregunta; si la pregunta ya tiene una, se para.
 */
import { lienzo, mosaico } from './lienzo.mjs';
import { pegaEnPregunta } from './pegar.mjs';

/* El destino se puede cambiar para rehacerlas sobre una copia en revisión. */
const BANCO = process.env.BANCO ?? 'src/content/banco/calculo-t05.yaml';

/* ── herramientas ──────────────────────────────────────────────────── */

const comprueba = (cierto, que) => {
  if (!cierto) throw new Error(`calculo-cuestiones-t05: ${que}`);
};
const cerca = (a, b, tol) => Math.abs(a - b) <= tol;

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

/** La integral de f en [a, b], por Simpson con muchos tramos. */
function integral(f, [a, b], n = 2000) {
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let k = 1; k < n; k++) s += (k % 2 ? 4 : 2) * f(a + k * h);
  return (s * h) / 3;
}

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

/* ── 1 · tres sumas para el valor medio de eˣ ─────────────────────── */

const sumas = (() => {
  /* La curva es eˣ: pasa por e^−1,5 = 0,22, 1, e^0,5 = 1,65 y e = 2,72. */
  const nodos = [-1.5, -1, -0.5, 0, 0.5, 1];
  const altura = {
    A: (a) => Math.exp(a),
    B: (a) => Math.exp(a + 0.5),
    C: (a) => Math.exp(a + 0.25),
  };
  const desc = {
    A: 'la altura de la curva en el extremo izquierdo de su base, así que queda por debajo de ella',
    B: 'la del extremo derecho, así que asoma por encima de la curva',
    C: 'la del punto medio: la curva corta el techo de cada rectángulo por la mitad',
  };
  return mosaico({
    id: 'cq5-sumas',
    titulo: 'Tres maneras de aproximar el área bajo la misma curva',
    desc:
      'Tres recuadros, uno debajo de otro, con la misma curva creciente y(x) entre x igual a ' +
      'menos 1,5 y x igual a 1, que pasa por (0, 1) y acaba en 2,7, y cinco rectángulos de ' +
      `base 0,5 debajo. En A, cada rectángulo tiene ${desc.A}. En B, ${desc.B}. En C, ${desc.C}.`,
    columnas: 1,
    ancho: 340,
    alto: 125,
    celdas: ['A', 'B', 'C'].map((letra) => ({
      etiqueta: letra,
      x: [-1.75, 1.3],
      y: [-0.35, 2.95],
      cuadrado: false,
      dibuja: (p) => {
        p.clase('rb', 'stroke: var(--graphite); stroke-width: 1.2; fill: none;');
        for (const a of nodos.slice(0, 5)) {
          const r = [[a, 0], [a + 0.5, 0], [a + 0.5, altura[letra](a)], [a, altura[letra](a)]];
          p.region(r);
          p.poli(r, { clase: 'rb', cerrar: true });
        }
        p.curva((x) => Math.exp(x), [-1.5, 1], { n: 80 });
        p.ejes({
          nombreX: 'x',
          nombreY: 'y',
          marcasX: [-1.5, -1, -0.5, 0.5, 1].map(coma),
          marcasY: [1, 2].map(coma),
        });
      },
    })),
  });
})();

/* ── 5 · los cortes con el valor medio ────────────────────────────── */

const media = (() => {
  /* Medida cada 0,25; los nodos van cada 0,5, que siguen la forma sin el
     temblor del grosor del trazo. */
  const y = spline(tabla(0, 0.5, [
    2.14, 2.21, 2.39, 2.58, 2.69, 2.58, 2.25, 1.76, 1.2, 0.79, 0.69, 1, 1.62, 2.52, 3.49, 4.28, 4.52,
    4.15, 3.21, 1.93, 0.54,
  ]));
  /* Los porqués: área de unas 23,7, media de unos 2,4, por encima de
     y(0) = 2,15 y por debajo de la loma de 2,7; cuatro cortes. */
  const area = integral(y, [0, 10]);
  const yMedia = area / 10;
  comprueba(cerca(area, 23.7, 0.2), `el área bajo la curva es ${area.toFixed(2)}`);
  comprueba(yMedia > y(0) + 0.1 && yMedia < maximo(y, [0, 3])[1] - 0.1, 'la media no queda entre y(0) y la loma de x = 2');
  comprueba(cortes(y, [0, 10], yMedia).length === 4, 'la recta de la media no corta cuatro veces');
  const f = lienzo({
    id: 'cq5-media',
    ancho: 420,
    alto: 260,
    x: [-0.5, 10.6],
    y: [-0.4, 5.3],
    cuadrado: true,
    titulo: 'Una función continua en el intervalo de cero a diez',
    desc:
      'La gráfica de y(x) sobre una cuadrícula de una unidad. Empieza en 2,15, sube despacio ' +
      'hasta una loma de 2,7 en x igual a dos, baja hasta un mínimo de 0,7 en x igual a cinco, ' +
      'sube hasta un máximo de 4,5 en x igual a ocho y baja hasta 0,55 en x igual a diez.',
  });
  const [x0, x1] = f.rango.x;
  const [y0, y1] = f.rango.y;
  rejilla(f, serie(1, 10, 1), serie(1, 5, 1), [x0, x1], [y0, y1]);
  f.curva(y, [0, 10], { n: 200 });
  f.ejes({ nombreX: 'x', nombreY: 'y', marcasX: serie(1, 10, 1), marcasY: serie(1, 5, 1) });
  f.rotulo(4.4, 3.3, 'y(x)', { anclaje: 'middle', color: 'var(--d1)' });
  return f.svg();
})();

/* ── 6 · el crecimiento de la función integral ────────────────────── */

const fundamental = (() => {
  /* Medida, es exactamente y = 1 − (x − 1)². */
  const y = (x) => 1 - (x - 1) ** 2;
  comprueba(y(0.5) === 0.75 && y(2) === 0 && y(1.25) > 0, 'la parábola no es la de la diapositiva');
  const f = lienzo({
    id: 'cq5-fundamental',
    ancho: 340,
    alto: 280,
    x: [-0.2, 2.7],
    y: [-1.4, 1.25],
    cuadrado: true,
    titulo: 'Un arco de parábola entre 0,5 y 2,5',
    desc:
      'La gráfica de y(x) entre x igual a 0,5 y x igual a 2,5, sobre una cuadrícula de media ' +
      'unidad: empieza en 0,75, sube hasta un máximo de uno en x igual a uno, baja cortando el ' +
      'eje en x igual a dos y acaba en menos 1,25.',
  });
  const [x0, x1] = f.rango.x;
  const [y0, y1] = f.rango.y;
  rejilla(f, serie(0.5, 2.5, 0.5), serie(-1, 1, 0.5), [x0, x1], [y0, y1]);
  f.curva(y, [0.5, 2.5], { n: 80 });
  f.ejes({ nombreX: 'x', nombreY: 'y', marcasX: serie(0.5, 2.5, 0.5).map(coma), marcasY: [-1, -0.5, 0.5, 1].map(coma) });
  f.rotulo(1.9, 0.8, 'y(x)', { color: 'var(--d1)' });
  return f.svg();
})();

/* ── 7 · cuál es la gráfica de la función integral ────────────────── */

const funcionIntegral = (() => {
  /* Medida, y = k(x − 1)(x − 2) con k = 0,52; F es su integral desde 0,5
     (la B casa con un desvío de 0,009), la A es F + 0,43 y la C es −F. */
  const k = 0.52;
  const y = (x) => k * (x - 1) * (x - 2);
  const F = (x) => k * (x ** 3 / 3 - 1.5 * x ** 2 + 2 * x - 2 / 3);
  comprueba(Math.abs(F(0.5)) < 1e-12 && Math.abs(F(2)) < 1e-12 && cerca(F(3.5), 1.17, 0.01), 'F no pasa por donde dice el porqué');
  const celda = (etiqueta, traza, yr, my) => ({
    etiqueta,
    x: [-0.5, 3.7],
    y: yr,
    cuadrado: false,
    dibuja: (p) => {
      const [x0, x1] = p.rango.x;
      rejilla(p, serie(0.5, 3.5, 0.5), serie(Math.ceil(yr[0] * 2) / 2, yr[1], 0.5), [x0, x1], yr);
      p.curva(traza, [0.5, 3.5], { n: 90 });
      p.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2, 3], marcasY: my.map(coma) });
    },
  });
  return mosaico({
    id: 'cq5-integral',
    titulo: 'Una función y tres candidatas a su función integral',
    desc:
      'Cuatro recuadros de x igual a 0,5 a x igual a 3,5. En el primero, y(x): una parábola que ' +
      'baja de 0,4, corta el eje en x igual a uno, llega a menos 0,13 en 1,5, vuelve a cortarlo ' +
      'en dos y sube hasta dos. La A empieza en 0,43, sube apenas, baja a 0,43 en x igual a dos y ' +
      'sube hasta 1,6. La B hace lo mismo empezando en cero: sube a 0,09, vuelve a cero en x igual ' +
      'a dos y sube hasta 1,17. La C es la B al revés: baja a menos 0,09, vuelve a cero y baja ' +
      'hasta menos 1,17.',
    columnas: 2,
    ancho: 200,
    alto: 150,
    celdas: [
      celda('y(x)', y, [-0.35, 2.15], [0.5, 1, 1.5, 2]),
      celda('A', (x) => F(x) + 0.43, [-0.55, 1.75], [0.5, 1, 1.5]),
      celda('B', F, [-0.55, 1.75], [0.5, 1, 1.5]),
      celda('C', (x) => -F(x), [-1.55, 0.75], [-1.5, -1, -0.5, 0.5]),
    ],
  });
})();

/* ── 9 · cuál es y y cuál es F ────────────────────────────────────── */

const uv = (() => {
  /* Medidas, v = arctg x y u = x·arctg x − ½ ln(1 + x²), su integral desde
     cero (casan con un desvío de 0,006). */
  const v = (x) => Math.atan(x);
  const u = (x) => x * Math.atan(x) - 0.5 * Math.log(1 + x * x);
  comprueba(cerca(integral(v, [0, 2.5]), u(2.5), 1e-9) && cerca(u(2.5), 2, 0.02), 'u no es la integral de v, o no vale 2 en 2,5');
  const f = lienzo({
    id: 'cq5-uv',
    ancho: 340,
    alto: 280,
    x: [-0.2, 2.85],
    y: [-0.2, 2.15],
    titulo: 'Dos funciones que salen del origen',
    desc:
      'Dos curvas entre x igual a cero y x igual a 2,5, sobre una cuadrícula de un cuarto de ' +
      'unidad. u(x) sale del origen plana y se va empinando hasta llegar a dos en x igual a 2,5. ' +
      'v(x) sale del origen con pendiente uno y se va aplanando hasta 1,19 en x igual a 2,5. Se ' +
      'cortan cerca de x igual a 1,6, a una altura de uno.',
  });
  const [x0, x1] = f.rango.x;
  const [y0, y1] = f.rango.y;
  rejilla(f, serie(0.25, 2.75, 0.25), serie(0.25, 2, 0.25), [x0, x1], [y0, y1]);
  f.curva(u, [0, 2.5], { n: 100 });
  f.curva(v, [0, 2.5], { clase: 'c2', n: 100 });
  f.ejes({ nombreX: 'x', nombreY: 'y', marcasX: serie(0.5, 2.5, 0.5).map(coma), marcasY: serie(0.5, 2, 0.5).map(coma) });
  f.rotulo(1.85, 1.75, 'u(x)', { anclaje: 'end', color: 'var(--d1)' });
  f.rotulo(2.2, 0.95, 'v(x)', { color: 'var(--alt)' });
  return f.svg();
})();

/* ── 10 · el área entre la derivada y el eje ──────────────────────── */

const area = (() => {
  /* Las marcas del eje son múltiplos de 0,3567 con dos decimales: y(0) es la
     de 1,42, el máximo, la de 3,21 en x = 2, y las opciones leen y(2,5) en la
     de 2,85 (el original acaba en 2,90). y′ = x(2 − x)·Q(x), con Q cúbico
     ajustado a la y′ medida con esas tres lecturas exactas: casa con un
     desvío de 0,044. */
  const u = 0.35667;
  const [y0, y2, y25] = [4 * u, 9 * u, 8 * u];
  const medida = tabla(0.1, 0.1, [
    0.205, 0.387, 0.571, 0.74, 0.895, 1.028, 1.169, 1.253, 1.324, 1.36, 1.374, 1.345, 1.295, 1.21,
    1.077, 0.929, 0.754, 0.556, 0.338, 0.084, -0.188, -0.485, -0.781, -1.078, -1.352,
  ]);
  const base = (k, b) => (2 * b ** (k + 2)) / (k + 2) - b ** (k + 3) / (k + 3);
  const n = 4;
  const A = Array.from({ length: n + 2 }, () => new Array(n + 2).fill(0));
  const B = new Array(n + 2).fill(0);
  for (const [x, v] of medida) {
    const phi = Array.from({ length: n }, (_, k) => x * (2 - x) * x ** k);
    for (let i = 0; i < n; i++) {
      B[i] += 2 * v * phi[i];
      for (let j = 0; j < n; j++) A[i][j] += 2 * phi[i] * phi[j];
    }
  }
  for (let k = 0; k < n; k++) {
    A[k][n] = A[n][k] = base(k, 2);
    A[k][n + 1] = A[n + 1][k] = base(k, 2.5);
  }
  B[n] = y2 - y0;
  B[n + 1] = y25 - y0;
  const c = resuelve(A, B).slice(0, n);
  const dy = (x) => x * (2 - x) * c.reduce((s, ck, k) => s + ck * x ** k, 0);
  const y = (x) => y0 + c.reduce((s, ck, k) => s + ck * base(k, x), 0);
  const desvio = Math.sqrt(medida.reduce((s, [x, v]) => s + (v - dy(x)) ** 2, 0) / medida.length);
  comprueba(desvio < 0.06, `y′ se aparta ${desvio.toFixed(3)} de la medida`);
  comprueba(cerca(y(2), y2, 1e-9) && cerca(y(2.5), y25, 1e-9) && dy(0) === 0, 'y no pasa por las marcas');
  comprueba(minimo(dy, [0.01, 1.99])[1] > 0 && maximo(dy, [2.01, 2.5])[1] < 0, 'y′ no cambia de signo solo en x = 2');
  const sombra = integral((x) => Math.abs(dy(x)), [0, 2.5], 4000);
  comprueba(cerca(sombra, 2.14, 0.01), `el área sombreada es ${sombra.toFixed(3)}`);
  const f = lienzo({
    id: 'cq5-area',
    ancho: 300,
    alto: 380,
    x: [-0.25, 2.75],
    y: [-1.6, 3.45],
    titulo: 'Una función, su derivada y el área entre la derivada y el eje',
    desc:
      'Dos curvas entre x igual a cero y x igual a 2,5, con un eje vertical marcado en 1,42, ' +
      '2,85, 3,21 y los demás múltiplos de 0,357. y(x) empieza en 1,42, sube hasta un máximo de ' +
      '3,21 en x igual a dos y baja hasta 2,85 en 2,5. Debajo, y prima de x sale de cero, sube ' +
      'hasta 1,4 cerca de x igual a uno, corta el eje en dos y baja hasta menos 1,4. Está ' +
      'sombreada la región entre y prima y el eje, de cero a 2,5: por encima del eje hasta x ' +
      'igual a dos y por debajo después.',
  });
  const marcas = [
    [-4, '-1,42'], [-3, '-1,07'], [-2, '-0,71'], [-1, '-0,36'], [1, '0,36'], [2, '0,71'], [3, '1,07'],
    [4, '1,42'], [5, '1,78'], [6, '2,14'], [7, '2,49'], [8, '2,85'], [9, '3,21'],
  ].map(([m, t]) => [m * u, t]);
  const [x0, x1] = f.rango.x;
  rejilla(f, serie(0.5, 2.5, 0.5), marcas.map((m) => m[0]), [x0, x1], [-1.5, 3.3]);
  f.region([{ f: dy, en: [0, 2.5], n: 120 }, [2.5, 0], [0, 0]]);
  f.curva(dy, [0, 2.5], { clase: 'c2', n: 120 });
  f.curva(y, [0, 2.5], { n: 120 });
  f.ejes({ nombreX: 'x', nombreY: 'y', marcasX: serie(0.5, 2.5, 0.5).map(coma), marcasY: marcas });
  f.rotulo(0.8, 2.95, 'y(x)', { anclaje: 'middle', color: 'var(--d1)' });
  f.rotulo(1.75, 1.45, "y'(x)", { color: 'var(--alt)' });
  return f.svg();
})();

/* ── 12 · tres vehículos ──────────────────────────────────────────── */

const vehiculos = (() => {
  const trazas = {
    1: [[0, 2], [4, 2]],
    2: [[0, 4], [4, 1]],
    3: [[0, 0], [3, 3], [4, 3]],
  };
  /* Las distancias del porqué: 8, 10 y 7,5 (áreas bajo cada velocidad). */
  const areaBajo = (p) => p.slice(1).reduce((s, q, i) => s + ((q[1] + p[i][1]) / 2) * (q[0] - p[i][0]), 0);
  comprueba(areaBajo(trazas[1]) === 8 && areaBajo(trazas[2]) === 10 && areaBajo(trazas[3]) === 7.5, 'las distancias no son 8, 10 y 7,5');
  return mosaico({
    id: 'cq5-vehiculos',
    titulo: 'La velocidad de tres vehículos durante cuatro minutos',
    desc:
      'Tres recuadros con la velocidad v frente al tiempo t, de cero a cuatro minutos. En el 1, ' +
      'una recta horizontal a altura dos. En el 2, una recta que baja de cuatro en t igual a cero ' +
      'a uno en t igual a cuatro. En el 3, una recta que sube de cero a tres entre t igual a cero ' +
      'y t igual a tres, y después se queda en tres hasta t igual a cuatro.',
    columnas: 3,
    ancho: 148,
    alto: 128,
    celdas: [1, 2, 3].map((n) => ({
      etiqueta: String(n),
      x: [-0.5, 5.6],
      y: [-0.5, 4.6],
      cuadrado: false,
      dibuja: (p) => {
        const [x0, x1] = p.rango.x;
        const [a, b] = p.rango.y;
        rejilla(p, serie(1, 5, 1), serie(1, 4, 1), [x0, x1], [a, b]);
        p.poli(trazas[n]);
        p.ejes({ nombreX: 't', nombreY: 'v', marcasX: serie(1, 5, 1), marcasY: serie(1, 4, 1) });
      },
    })),
  });
})();

/* ── 13 · la mancha de tinta ──────────────────────────────────────── */

const mancha = (() => {
  const izquierda = spline(tabla(-0.5, 0.1, [
    1.23, 1.51, 1.52, 1.36, 1.1, 0.82, 0.55, 0.36, 0.23, 0.15, 0.15, 0.19, 0.28, 0.39, 0.53, 0.64, 0.76,
    0.87, 0.94, 0.98, 1.01, 1, 0.97, 0.91, 0.82, 0.74, 0.65, 0.56,
  ]));
  const derecha = spline([[3.5, 0.33], ...tabla(3.6, 0.1, [0.43, 0.53, 0.63, 0.76, 0.88, 0.98, 1.1, 1.16, 1.19, 1.13])]);
  /* El contorno de la mancha, medido: un brazo a la izquierda, el cuerpo
     hasta x = 3,2 y un saliente bajo hasta 3,8. */
  const tinta = [
    [2.02, 0.62], [2.12, 0.64], [2.2, 0.66], [2.27, 0.68], [2.28, 1.13], [2.4, 1.11], [2.5, 1.04],
    [2.6, 1], [2.72, 1], [2.8, 1.1], [2.9, 1.11], [3, 1.05], [3.1, 1], [3.17, 1], [3.19, 0.36],
    [3.35, 0.35], [3.55, 0.35], [3.65, 0.34], [3.72, 0.31], [3.77, 0.26], [3.79, 0.15], [3.7, 0.12],
    [3.62, 0.07], [3.57, -0.2], [3.4, -0.22], [3.25, -0.22], [3.21, -0.35], [3.1, -0.35], [3, -0.29],
    [2.9, -0.26], [2.8, -0.21], [2.7, -0.26], [2.6, -0.29], [2.5, -0.21], [2.4, -0.21], [2.3, -0.23],
    [2.24, -0.24], [2.23, 0.25], [2.18, 0.28], [2.12, 0.33], [2.06, 0.37], [2.02, 0.45],
  ];
  /** Hasta dónde llega la mancha, arriba y abajo, en una x. */
  const alcance = (x) => {
    const ys = [];
    tinta.forEach((p, i) => {
      const q = tinta[(i + 1) % tinta.length];
      if ((p[0] - x) * (q[0] - x) <= 0 && p[0] !== q[0]) ys.push(p[1] + ((x - p[0]) * (q[1] - p[1])) / (q[0] - p[0]));
    });
    return [Math.min(...ys), Math.max(...ys)];
  };
  /* Los porqués: y′(0) < 0 < y′(4); lo visible hasta 2,1 pasa de 1,3; bajo
     la mancha, entre 2,1 y 3, nada baja de −0,3; en x = 3 llega por arriba
     a más de 1, por encima de y(0) ≈ 0,8. */
  comprueba(izquierda.d(0) < -1 && derecha.d(4) > 0.5, 'las pendientes en 0 y en 4 no son las del porqué');
  comprueba(integral(izquierda, [0, 2.1]) > 1.3, 'lo visible no llega a 1,3 de área');
  comprueba(Math.min(...[2.25, 2.5, 2.75, 3].map((x) => alcance(x)[0])) >= -0.3, 'la mancha baja de −0,3 antes de x = 3');
  comprueba(alcance(3)[1] > 1 && cerca(izquierda(0), 0.82, 0.01), 'en x = 3 la mancha no pasa de y(0)');
  const f = lienzo({
    id: 'cq5-mancha',
    ancho: 420,
    alto: 200,
    x: [-0.7, 4.8],
    y: [-0.5, 1.75],
    cuadrado: true,
    titulo: 'Una gráfica con una mancha de tinta encima',
    desc:
      'La gráfica de y(x) entre x igual a menos 0,5 y x igual a 4,5. Empieza en 1,2, sube a un ' +
      'máximo de 1,5 cerca de menos 0,35, baja cortando el eje vertical en 0,8 hasta un mínimo de ' +
      '0,15 cerca de 0,45, sube hasta uno en 1,5 y baja hasta 0,6 cerca de x igual a 2,15, donde ' +
      'la tapa una mancha de tinta. La mancha va de x igual a 2,05 a 3,8; hasta x igual a 3,2 ' +
      'llega por arriba a entre uno y 1,13 y por abajo a entre menos 0,2 y menos 0,35, y de 3,2 ' +
      'a 3,8 es un saliente bajo, hasta 0,35. La curva sale de la mancha cerca de x igual a 3,55, ' +
      'a 0,4, y sube hasta 1,2 en 4,4.',
  });
  f.clase('mancha', 'fill: var(--ink); stroke: none;');
  f.curva(izquierda, [-0.5, 2.18], { n: 150 });
  f.curva(derecha, [3.5, 4.5], { n: 60 });
  f.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2, 4], marcasY: [1] });
  /* La tinta, después de los ejes: como en el original, tapa también el eje.
     Con los ejes encima, en el tema oscuro se veía el eje cruzando la mancha. */
  f.poli(tinta, { clase: 'mancha', cerrar: true });
  f.rotulo(4.25, 1.5, 'y(x)', { anclaje: 'middle', color: 'var(--d1)' });
  return f.svg();
})();

/* ── 15 · el cambio de variable ───────────────────────────────────── */

const cambio = (() => {
  /* Medida cada 0,1; los nodos van cada 0,2, sin el temblor del trazo. */
  const y = spline(tabla(1, 0.2, [
    0.98, 1.69, 1.82, 1.66, 1.3, 0.88, 0.52, 0.26, 0.18, 0.27, 0.49, 0.81, 1.13, 1.31, 1.21, 0.74,
  ]));
  /* h, con la forma medida y pasando exactamente por las seis lecturas de
     las opciones: 4 en t = −2,5, −1,25, 5 y 8,75; 1 en t = 0 y 10. */
  const h = hermite([
    [-2.7, 3.1, 4.8], [-2.5, 4, 4.2], [-1.875, 4.9, 0], [-1.25, 4, -2.6], [0, 1, -2.6],
    [0.8, -0.95], [1.9, -1.87, 0], [2.8, -1.15], [3.45, 0, 2.3], [4.2, 1.7], [5, 4, 2.4], [5.8, 5.55],
    [6.875, 6.53, 0], [7.9, 5.85], [8.75, 4, -2.5], [9.5, 2.1], [10, 1, -1.7], [10.35, 0.6, -0.9],
  ]);
  for (const [t, v] of [[-2.5, 4], [-1.25, 4], [0, 1], [5, 4], [8.75, 4], [10, 1]]) {
    comprueba(cerca(h(t), v, 1e-9), `h(${t}) no vale ${v}`);
  }
  comprueba(cerca(minimo(h, [0, 4])[1], -1.87, 0.02) && cerca(maximo(h, [4, 10])[1], 6.53, 0.02), 'los extremos de h no son los medidos');
  const celda = (etiqueta, traza, dominio, x, yr, mx, my, nombres) => ({
    etiqueta,
    x,
    y: yr,
    cuadrado: false,
    dibuja: (p) => {
      rejilla(p, mx.map((m) => (Array.isArray(m) ? m[0] : m)), my.map((m) => (Array.isArray(m) ? m[0] : m)), x, yr);
      p.curva(traza, dominio, { n: 200 });
      p.ejes({ nombreX: nombres[0], nombreY: nombres[1], marcasX: mx, marcasY: my });
    },
  });
  return mosaico({
    id: 'cq5-cambio',
    titulo: 'Las funciones y(x) y h(t)',
    desc:
      'Dos recuadros, uno debajo de otro. En el primero, y(x) entre x igual a uno y x igual a ' +
      'cuatro: sube de uno a un máximo de 1,8 en 1,4, baja a un mínimo de 0,18 en 2,6, sube a 1,3 ' +
      'en 3,65 y baja a 0,74. En el segundo, h(t) entre t igual a menos 2,7 y t igual a 10,35, ' +
      'con el eje t marcado cada 1,25: sube de 3,1 pasando por cuatro en t igual a menos 2,5 hasta ' +
      'un máximo de 4,9, baja pasando por cuatro en menos 1,25 y por uno en t igual a cero hasta ' +
      'un mínimo de menos 1,87 en 1,9, sube pasando por cuatro en t igual a cinco hasta un máximo ' +
      'de 6,5 cerca de siete, y baja pasando por cuatro en 8,75 y por uno en t igual a diez.',
    columnas: 1,
    ancho: 460,
    alto: 180,
    celdas: [
      celda('y(x)', y, [1, 4], [-0.5, 4.3], [-0.3, 2.3], serie(0.5, 4, 0.5).map(coma), serie(0.3, 2.1, 0.3).map(coma), ['x', 'y']),
      celda(
        'h(t)',
        h,
        [-2.7, 10.35],
        [-3.3, 10.9],
        [-2.5, 7.5],
        [-2.5, -1.25, 1.25, 2.5, 3.75, 5, 6.25, 7.5, 8.75, 10].map(coma),
        serie(-2, 7, 1),
        ['t', 'x'],
      ),
    ],
  });
})();

/* ── 16 · Simpson con la producción de aceite ─────────────────────── */

const simpson = (() => {
  /* La forma medida, pasando por los nueve valores de la cuadrícula de los
     que sale la opción buena: 2; 2,25; 1,75; 2; 2,5; 1,75; 1,25; 1,75; 1,75
     (el original se aparta de ellos menos de 0,04). */
  const v = hermite([
    [0, 2, -5.5], [0.15, 1.61, 0], [0.35, 2.02], [0.5, 2.25, 0.3], [0.55, 2.26, 0], [0.8, 2.03],
    [1, 1.75, -0.9], [1.17, 1.655, 0], [1.5, 2, 1.4], [1.75, 2.34], [2, 2.5, 0], [2.25, 2.24],
    [2.5, 1.75, -2], [2.9, 1.2, 0], [3, 1.25, 0.6], [3.25, 1.54], [3.5, 1.75, 0], [3.7, 1.57],
    [3.85, 1.37, 0], [4, 1.75, 5],
  ]);
  const nodos = [2, 2.25, 1.75, 2, 2.5, 1.75, 1.25, 1.75, 1.75];
  nodos.forEach((valor, i) => comprueba(cerca(v(i / 2), valor, 1e-9), `v(${i / 2}) no vale ${valor}`));
  /* Los porqués: Simpson da 7,625 con h = 0,5, 6,9 con h = 1 y 9,2 con h = 2;
     v no pasa de 2,5, solo pasa de 2,3 cerca de t = 2 y solo baja de 1,5
     cerca de t = 3 y de t = 3,85. */
  const s05 = (0.5 / 3) * (nodos[0] + nodos[8] + 4 * (nodos[1] + nodos[3] + nodos[5] + nodos[7]) + 2 * (nodos[2] + nodos[4] + nodos[6]));
  const s1 = (1 / 3) * (nodos[0] + 4 * nodos[2] + 2 * nodos[4] + 4 * nodos[6] + nodos[8]);
  const s2 = (2 / 3) * (nodos[0] + 4 * nodos[4] + nodos[8]);
  comprueba(cerca(s05, 7.625, 1e-9) && cerca(s1, 6.92, 0.01) && cerca(s2, 9.17, 0.01), 'las sumas de Simpson no son las del porqué');
  comprueba(maximo(v, [0, 4])[1] <= 2.5 + 1e-9, 'v pasa de 2,5');
  const sobre = cortes(v, [0, 4], 2.3);
  comprueba(sobre.length === 2 && sobre[0] > 1.6 && sobre[1] < 2.4, 'v pasa de 2,3 fuera de los alrededores de t = 2');
  const bajo = cortes(v, [0, 4], 1.5);
  comprueba(bajo.length === 4 && bajo[0] > 2.5 && bajo[1] < 3.3 && bajo[2] > 3.6, 'v baja de 1,5 fuera de t = 3 y t = 3,85');
  const f = lienzo({
    id: 'cq5-simpson',
    ancho: 420,
    alto: 290,
    x: [-0.3, 4.3],
    y: [-0.2, 2.9],
    titulo: 'La velocidad de producción de aceite durante cuatro días',
    desc:
      'La gráfica de v(t) entre t igual a cero y t igual a cuatro días, sobre una cuadrícula de ' +
      'medio día por un cuarto. En la cuadrícula vale dos en t igual a cero, 2,25 en 0,5, 1,75 en ' +
      'uno, dos en 1,5, 2,5 en dos, 1,75 en 2,5, 1,25 en tres, 1,75 en 3,5 y 1,75 en cuatro. Entre ' +
      'medias oscila: baja a 1,6 cerca de t igual a 0,15, a 1,65 cerca de 1,2, a 1,2 cerca de 2,9 ' +
      'y a 1,37 cerca de 3,85.',
  });
  const [x0, x1] = f.rango.x;
  rejilla(f, serie(0.5, 4, 0.5), serie(0.25, 2.75, 0.25), [x0, x1], [-0.2, 2.9]);
  f.curva(v, [0, 4], { n: 240 });
  f.ejes({ nombreX: 't', nombreY: 'v', marcasX: serie(0.5, 4, 0.5).map(coma), marcasY: serie(0.25, 2.75, 0.25).map(coma) });
  return f.svg();
})();

const figuras = {
  'tres-sumas-para-el-valor-medio': sumas,
  'cortes-con-el-valor-medio': media,
  'crecimiento-de-la-funcion-integral': fundamental,
  'grafica-de-la-funcion-integral': funcionIntegral,
  'cual-es-la-funcion-integral': uv,
  'area-con-la-derivada': area,
  'tres-vehiculos': vehiculos,
  'mancha-de-tinta': mancha,
  'cambio-de-variable-mal-aplicado': cambio,
  'simpson-produccion-de-aceite': simpson,
};

for (const [id, svg] of Object.entries(figuras)) pegaEnPregunta(BANCO, id, svg);
console.log(`${Object.keys(figuras).length} figuras pegadas en ${BANCO}`);
