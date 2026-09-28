/**
 * Las figuras de las cuestiones del tema 6 de Cálculo, las de las
 * diapositivas de «Funciones reales de varias variables reales» (fase E3 de
 * la auditoría del 27 de septiembre de 2026).
 *
 * Se redibujan, no se recortan del PDF (§08), y se calculan con el lienzo.
 * Tres cosas que este guion añade y que conviene saber antes de tocarlo:
 *
 * 1. **Una cámara ortográfica con profundidad.** `vista3d` da la isometría
 *    de los sólidos del tema 7, siempre desde el mismo lado. Las diapositivas
 *    miran cada superficie desde un sitio distinto —en unas el eje x apunta a
 *    la izquierda, y eso es la trampa de la pregunta—, y una malla que se ve
 *    entera, con las líneas de detrás cruzando las de delante, no se lee. Así
 *    que cada superficie se parte en cuadriláteros que se pintan de atrás
 *    hacia delante, rellenos de papel: cada uno tapa lo que queda detrás. La
 *    cara que mira hacia el lector va en papel y la otra en un tono de fondo,
 *    como el verde y el celeste de las diapositivas.
 * 2. **Curvas de nivel trazadas, no dibujadas.** Las de los mapas salen de la
 *    función con el algoritmo de los cuadrados («marching squares»): se evalúa
 *    en una rejilla, se localiza dónde cruza cada nivel y se encadenan los
 *    tramos.
 * 3. **Las funciones que el original no da se reconstruyen.** Ninguna
 *    diapositiva da la fórmula de sus superficies ni de sus mapas. Donde la
 *    respuesta depende de un signo o de una curvatura, ese signo se ha leído
 *    sobre la diapositiva renderizada a 600 ppp, y la función de aquí tiene el
 *    mismo; el guion comprueba con `exige` lo que la pregunta da por cierto —el
 *    signo de una derivada en un punto, dónde es mayor el gradiente— y se para
 *    si deja de cumplirse.
 *
 * Y una regla de la revisión del 28 de septiembre de 2026: los ejes se pintan
 * después de las curvas y las superficies, para que el halo de sus números
 * quede encima y ninguna recta tape un número.
 *
 *   BANCO=<ruta> node scripts/figuras/calculo-cuestiones-t06.mjs
 *
 * Pega cada figura en su pregunta; si la pregunta ya tiene una, se para.
 */
import { lienzo, mosaico, reetiqueta } from './lienzo.mjs';
import { pegaEnPregunta } from './pegar.mjs';

/* El destino se puede cambiar para rehacerlas sobre una copia en revisión. */
const BANCO = process.env.BANCO ?? 'src/content/banco/calculo-t06.yaml';
const PI = Math.PI;

/** Se para si algo que la pregunta da por cierto no lo es en el dibujo. */
function exige(condicion, mensaje) {
  if (!condicion) throw new Error(`calculo-cuestiones-t06: ${mensaje}`);
}

/** Un decimal con coma, para los rótulos. */
const coma = (v, d = 2) => String(Number(v.toFixed(d))).replace('.', ',').replace('-', '−');

/* ══ La cámara y las mallas ══════════════════════════════════════════════ */

const resta = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const escalar = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const vectorial = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/**
 * Una cámara ortográfica. `az` es el acimut del observador (0° mirando desde
 * el eje x positivo, 90° desde el y positivo) y `el`, su altura sobre el plano
 * xy. Devuelve el proyector a coordenadas del lienzo y, colgada de él, la
 * profundidad: mayor cuanto más cerca del observador.
 */
function camara(az, el) {
  const f = (az * PI) / 180;
  const e = (el * PI) / 180;
  const R = [-Math.sin(f), Math.cos(f), 0];
  const U = [-Math.sin(e) * Math.cos(f), -Math.sin(e) * Math.sin(f), Math.cos(e)];
  const V = [Math.cos(e) * Math.cos(f), Math.cos(e) * Math.sin(f), Math.sin(e)];
  const p = (x, y, z) => [escalar([x, y, z], R), escalar([x, y, z], U)];
  p.prof = (x, y, z) => escalar([x, y, z], V);
  p.V = V;
  return p;
}

/** Las clases de las mallas: la cara que mira al lector y la de detrás. */
function clasesDeMalla(l) {
  l.clase('m', 'fill: var(--paper); stroke: var(--d1); stroke-width: .7; stroke-linejoin: round;');
  l.clase('md', 'fill: var(--rule); stroke: var(--d1); stroke-width: .7; stroke-linejoin: round;');
  l.clase('base', 'fill: var(--live); fill-opacity: .14; stroke: var(--live); stroke-width: .8;');
  l.clase('eje3', 'stroke: var(--faint); stroke-width: 1; fill: none;');
  l.clase('punta', 'fill: var(--faint); stroke: none;');
}

/**
 * Los cuadriláteros de una superficie paramétrica S(u, v) = [x, y, z], con su
 * profundidad y la clase de la cara que se ve. `fuera` dice si la normal
 * ∂S/∂u × ∂S/∂v apunta hacia la cara «de papel» (+1) o hacia la otra (−1).
 */
function caras(cam, S, [u0, u1], [v0, v1], nu, nv, fuera = 1) {
  const P = [];
  for (let i = 0; i <= nu; i++) {
    P[i] = [];
    for (let j = 0; j <= nv; j++) P[i][j] = S(u0 + ((u1 - u0) * i) / nu, v0 + ((v1 - v0) * j) / nv);
  }
  const lista = [];
  for (let i = 0; i < nu; i++) {
    for (let j = 0; j < nv; j++) {
      const q = [P[i][j], P[i + 1][j], P[i + 1][j + 1], P[i][j + 1]];
      const c = q.reduce((a, b) => [a[0] + b[0] / 4, a[1] + b[1] / 4, a[2] + b[2] / 4], [0, 0, 0]);
      const n = vectorial(resta(q[2], q[0]), resta(q[3], q[1]));
      const mira = fuera * escalar(n, cam.V) >= 0;
      lista.push({ q, prof: cam.prof(...c), clase: mira ? 'm' : 'md' });
    }
  }
  return lista;
}

/** Pinta los cuadriláteros de atrás hacia delante: cada uno tapa lo de detrás. */
function pinta(l, cam, lista) {
  for (const c of [...lista].sort((a, b) => a.prof - b.prof)) {
    l.poli(c.q.map((pt) => cam(...pt)), { clase: c.clase, cerrar: true });
  }
}

/** Los tres ejes desde el origen, con su nombre en la punta. */
function ejes3d(l, cam, [lx, ly, lz], { desde = [0, 0, 0], nombres = ['x', 'y', 'z'] } = {}) {
  const o = desde;
  const puntas = [[o[0] + lx, o[1], o[2]], [o[0], o[1] + ly, o[2]], [o[0], o[1], o[2] + lz]];
  puntas.forEach((pt, k) => {
    l.flecha(cam(...o), cam(...pt), { clase: 'eje3', punta: 6, color: 'var(--faint)' });
    const [a, b] = cam(...pt);
    const [c, d] = cam(...o);
    const ux = a - c;
    const uy = b - d;
    const n = Math.hypot(ux, uy) || 1;
    const px = (ux / n) * 9;
    const py = (-uy / n) * 9;
    l.rotulo(a, b, nombres[k], {
      anclaje: 'middle',
      dx: px,
      dy: py + 4,
      pequeno: true,
      color: 'var(--faint)',
    });
  });
}

/* ══ Las curvas de nivel ═════════════════════════════════════════════════ */

/**
 * Las curvas F = nivel dentro del rectángulo, como poligonales en
 * coordenadas de la asignatura. Cuadrados de marcha sobre una rejilla de
 * n × m, con los tramos encadenados por la arista que comparten.
 */
function isolineas(F, [x0, x1], [y0, y1], nivel, n = 140, m = n) {
  const dx = (x1 - x0) / n;
  const dy = (y1 - y0) / m;
  const V = [];
  for (let i = 0; i <= n; i++) {
    V[i] = [];
    for (let j = 0; j <= m; j++) V[i][j] = F(x0 + i * dx, y0 + j * dy) - nivel;
  }
  const signo = (v) => v >= 0;
  const punto = new Map();
  const arista = (tipo, i, j) => {
    const k = `${tipo}${i},${j}`;
    if (!punto.has(k)) {
      if (tipo === 'h') {
        const t = V[i][j] / (V[i][j] - V[i + 1][j]);
        punto.set(k, [x0 + (i + t) * dx, y0 + j * dy]);
      } else {
        const t = V[i][j] / (V[i][j] - V[i][j + 1]);
        punto.set(k, [x0 + i * dx, y0 + (j + t) * dy]);
      }
    }
    return k;
  };
  const vecinos = new Map();
  const une = (a, b) => {
    if (!vecinos.has(a)) vecinos.set(a, []);
    if (!vecinos.has(b)) vecinos.set(b, []);
    vecinos.get(a).push(b);
    vecinos.get(b).push(a);
  };
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      const s = [signo(V[i][j]), signo(V[i + 1][j]), signo(V[i + 1][j + 1]), signo(V[i][j + 1])];
      const cortes = [];
      if (s[0] !== s[1]) cortes.push(arista('h', i, j));
      if (s[1] !== s[2]) cortes.push(arista('v', i + 1, j));
      if (s[2] !== s[3]) cortes.push(arista('h', i, j + 1));
      if (s[3] !== s[0]) cortes.push(arista('v', i, j));
      if (cortes.length === 2) une(cortes[0], cortes[1]);
      else if (cortes.length === 4) {
        /* Silla: se decide por el valor del centro. */
        const centro = signo((V[i][j] + V[i + 1][j] + V[i + 1][j + 1] + V[i][j + 1]) / 4);
        if (centro === s[0]) {
          une(cortes[0], cortes[1]);
          une(cortes[2], cortes[3]);
        } else {
          une(cortes[0], cortes[3]);
          une(cortes[1], cortes[2]);
        }
      }
    }
  }
  const usado = new Set();
  const cadenas = [];
  const recorre = (inicio) => {
    const cadena = [inicio];
    usado.add(inicio);
    let actual = inicio;
    for (;;) {
      const sig = (vecinos.get(actual) ?? []).find((v) => !usado.has(v));
      if (!sig) break;
      cadena.push(sig);
      usado.add(sig);
      actual = sig;
    }
    return cadena;
  };
  /* Primero las abiertas, que empiezan en el borde; luego las cerradas. */
  for (const [k, vs] of vecinos) if (vs.length === 1 && !usado.has(k)) cadenas.push(recorre(k));
  for (const k of vecinos.keys()) {
    if (usado.has(k)) continue;
    const c = recorre(k);
    c.push(c[0]);
    cadenas.push(c);
  }
  return cadenas.map((c) => c.map((k) => punto.get(k)));
}

/** Ramer–Douglas–Peucker: quita los puntos que no cambian el dibujo. */
function simplifica(pts, tol) {
  if (pts.length < 3) return pts;
  const [a, b] = [pts[0], pts[pts.length - 1]];
  let peor = 0;
  let donde = 0;
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  for (let i = 1; i < pts.length - 1; i++) {
    const d = L < 1e-12
      ? Math.hypot(pts[i][0] - a[0], pts[i][1] - a[1])
      : Math.abs((b[0] - a[0]) * (a[1] - pts[i][1]) - (a[0] - pts[i][0]) * (b[1] - a[1])) / L;
    if (d > peor) {
      peor = d;
      donde = i;
    }
  }
  if (peor <= tol) return [a, b];
  return [...simplifica(pts.slice(0, donde + 1), tol).slice(0, -1), ...simplifica(pts.slice(donde), tol)];
}

/** Pinta las curvas de nivel de F en el lienzo `l`, una por nivel. */
function mapa(l, F, caja, niveles, { clase = 'niv', n = 140 } = {}) {
  l.clase('niv', 'stroke: var(--d1); stroke-width: 1.3; fill: none; stroke-linejoin: round;');
  const tol = 0.35 / Math.abs(l.X(1) - l.X(0));
  for (const nv of niveles) {
    for (const c of isolineas(F, caja.x, caja.y, nv, n)) {
      if (c.length > 1) l.poli(simplifica(c, tol), { clase });
    }
  }
}

/** Dónde corta la vertical x = x0 a la curva F = nivel, por bisección. */
function corteVertical(F, x0, nivel, [a, b]) {
  let fa = F(x0, a) - nivel;
  if (fa * (F(x0, b) - nivel) > 0) return null;
  for (let k = 0; k < 60; k++) {
    const c = (a + b) / 2;
    const fc = F(x0, c) - nivel;
    if (fa * fc <= 0) b = c;
    else {
      a = c;
      fa = fc;
    }
  }
  return (a + b) / 2;
}

/** El gradiente numérico de F. */
const gradiente = (F, x, y, h = 1e-5) => [
  (F(x + h, y) - F(x - h, y)) / (2 * h),
  (F(x, y + h) - F(x, y - h)) / (2 * h),
];

const niveles = (desde, hasta, paso) => {
  const out = [];
  for (let v = desde; v <= hasta + 1e-9; v += paso) out.push(Number(v.toFixed(6)));
  return out;
};

/** El recuadro que abarca unos puntos del lienzo, con un margen alrededor. */
function encuadre(puntos, m = 0.12) {
  const xs = puntos.map((p) => p[0]);
  const ys = puntos.map((p) => p[1]);
  const [a, b] = [Math.min(...xs), Math.max(...xs)];
  const [c, d] = [Math.min(...ys), Math.max(...ys)];
  const h = Math.max(b - a, d - c) * m;
  return { x: [a - h, b + h], y: [c - h, d + h] };
}

/** Una rejilla de puntos de una superficie, para encuadrarla. */
const muestras3d = (S, [u0, u1], [v0, v1], n = 12) => {
  const out = [];
  for (let i = 0; i <= n; i++) {
    for (let j = 0; j <= n; j++) out.push(S(u0 + ((u1 - u0) * i) / n, v0 + ((v1 - v0) * j) / n));
  }
  return out;
};

/* ══ 1 y 2 · cuatro curvas de nivel y cuatro puntos ══════════════════════ */

/* Medidas sobre la diapositiva a 300 ppp, en centésimas del recorte: los
   centros de las curvas se desplazan hacia arriba a la izquierda al
   encogerse, así que del lado de M se aprietan y del de S se separan. */
const ELIPSES = [
  { c: [3.3, 2.69], a: 2.87, b: 1.87 },
  { c: [3.17, 2.99], a: 2.49, b: 1.4 },
  { c: [2.87, 3.36], a: 1.7, b: 0.78 },
  { c: [2.58, 3.4], a: 1.17, b: 0.47 },
];
const PUNTOS_MNRS = { M: [1.2, 4.43], N: [5.2, 4.43], R: [2.05, 3.46], S: [4.05, 0.63] };

const dentroDeElipse = ({ c, a, b }, [x, y]) => ((x - c[0]) / a) ** 2 + ((y - c[1]) / b) ** 2 < 1;
const elipse = ({ c, a, b }, t) => [c[0] + a * Math.cos(t), c[1] + b * Math.sin(t)];

function nivelMNRS() {
  /* Cada curva, dentro de la anterior; M, N y S fuera de todas, y R dentro de
     la más pequeña: es lo que hace iguales los tres desniveles. */
  for (let k = 1; k < ELIPSES.length; k++) {
    for (let s = 0; s < 360; s++) {
      exige(dentroDeElipse(ELIPSES[k - 1], elipse(ELIPSES[k], (s * PI) / 180)), `la curva ${k + 1} se sale de la ${k}`);
    }
  }
  for (const q of ['M', 'N', 'S']) exige(!dentroDeElipse(ELIPSES[0], PUNTOS_MNRS[q]), `${q} tiene que quedar fuera`);
  exige(dentroDeElipse(ELIPSES[3], PUNTOS_MNRS.R), 'R tiene que quedar dentro de la curva pequeña');

  const f = lienzo({
    id: 'cq6-mnrs',
    x: [0.15, 6.55],
    y: [0.1, 5.2],
    cuadrado: true,
    titulo: 'Cuatro curvas de nivel y cuatro puntos',
    desc:
      'Cuatro curvas cerradas, una dentro de otra, como óvalos cada vez más pequeños cuyo centro se desplaza ' +
      'hacia arriba y a la izquierda: arriba a la izquierda las cuatro curvas pasan muy juntas, y abajo quedan ' +
      'muy separadas. R está dentro de la curva más pequeña. M, arriba a la izquierda, N, arriba a la derecha, ' +
      'y S, abajo, están fuera de la curva más grande; M es el que queda más cerca de R.',
  });
  for (const e of ELIPSES) f.curva((t) => elipse(e, t), [0, 2 * PI], { n: 120, cerrar: true });
  for (const [q, [x, y]] of Object.entries(PUNTOS_MNRS)) {
    f.punto(x, y, { r: 3.6 });
    f.rotulo(x, y, q, { anclaje: 'start', dx: 7, dy: -5, color: 'var(--graphite)' });
  }
  return f.svg();
}

/* ══ 3 · la curva de nivel de g(x² + y² − 4) ════════════════════════════ */

/* La gráfica de g, leída a 600 ppp: g(0) = 3, máximo 4,19 en t = 2,5,
   g(5) = 3 y g(6) = 1,86. Es la parábola 3 + 0,19·t·(5 − t). */
const g3 = (t) => 3 + 0.19 * t * (5 - t);

function curvaDeNivelDeG() {
  exige(Math.abs(g3(0) - 3) < 1e-9 && Math.abs(g3(5) - 3) < 1e-9, 'g tiene que valer 3 en t = 0 y en t = 5');
  const cuadro = (p, marcasX, marcasY, nx = 'x', ny = 'y') => {
    p.clase('rej', 'stroke: var(--rule); stroke-width: 1; fill: none; stroke-dasharray: 2 3;');
    for (const m of marcasX) p.poli([[m, p.rango.y[0] + 0.3], [m, p.rango.y[1] - 0.3]], { clase: 'rej' });
    for (const m of marcasY) p.poli([[p.rango.x[0] + 0.3, m], [p.rango.x[1] - 0.3, m]], { clase: 'rej' });
    return () => p.ejes({ nombreX: nx, nombreY: ny, marcasX, marcasY });
  };
  return mosaico({
    id: 'cq6-g-nivel',
    titulo: 'La gráfica de g y tres candidatas a la curva de nivel F = 3',
    desc:
      'Cuatro gráficas. La primera es la de u = g(t) entre t = 0 y t = 6: empieza en u = 3, sube hasta algo ' +
      'más de 4 en t = 2,5, vuelve a valer 3 en t = 5 y baja hasta menos de 2 en t = 6. En A, tres rectas ' +
      'paralelas de pendiente menos uno: x + y = −1, x + y = 1 y x + y = 3. En B, dos circunferencias con ' +
      'centro en el origen, de radios 2 y 3. En C, la parábola y = x².',
    columnas: 2,
    celdas: [
      {
        etiqueta: 'u = g(t)',
        x: [-0.6, 6.8],
        y: [-0.6, 5.2],
        cuadrado: false,
        dibuja: (p) => {
          const ejes = cuadro(p, [1, 2, 3, 4, 5, 6], [1, 2, 3, 4, 5], 't', 'u');
          p.curva(g3, [0, 6], { n: 80 });
          ejes();
        },
      },
      {
        etiqueta: 'A',
        x: [-3.6, 5.6],
        y: [-3.6, 3.8],
        dibuja: (p) => {
          const ejes = cuadro(p, [-3, -2, -1, 1, 2, 3, 4, 5], [-3, -2, -1, 1, 2, 3]);
          for (const k of [-1, 1, 3]) {
            const a = Math.max(-3.5, k - 3.7);
            const b = Math.min(5.5, k + 3.5);
            p.poli([[a, k - a], [b, k - b]]);
          }
          ejes();
        },
      },
      {
        etiqueta: 'B',
        x: [-3.8, 4.6],
        y: [-3.6, 3.6],
        dibuja: (p) => {
          const ejes = cuadro(p, [-3, -2, -1, 1, 2, 3, 4], [-3, -2, -1, 1, 2, 3]);
          p.circunferencia(0, 0, 2).circunferencia(0, 0, 3);
          ejes();
        },
      },
      {
        etiqueta: 'C',
        x: [-3.8, 4.6],
        y: [-1.4, 5.6],
        dibuja: (p) => {
          const ejes = cuadro(p, [-3, -2, -1, 1, 2, 3, 4], [-1, 1, 2, 3, 4, 5]);
          p.curva((x) => x * x, [-2.33, 2.33], { n: 80 });
          ejes();
        },
      },
    ],
  });
}

/* ══ 4 · tres superficies y sus curvas de nivel ══════════════════════════ */

/* El original no da las funciones. Se usan una silla, z = xy, cuyas curvas
   de nivel son hipérbolas en los cuatro cuadrantes; una de revolución con
   ondas, z = sen r / r; y z = sen x · sen y, con dos picos y dos hoyos. */
const silla = (x, y) => x * y;
const sombrero = (x, y) => {
  const r = Math.hypot(x, y);
  return r < 1e-9 ? 1 : Math.sin(r) / r;
};
const huevera = (x, y) => Math.sin(x) * Math.sin(y);

function superficiesYCurvas() {
  const celda3d = (etiqueta, S, U, V, nu, nv, escalaZ, largos, cam = camara(40, 24)) => {
    const Se = (u, v) => {
      const [x, y, z] = S(u, v);
      return [x, y, z * escalaZ];
    };
    const puntos = [...muestras3d(Se, U, V), [largos[0], 0, 0], [0, largos[1], 0], [0, 0, largos[2]]].map((p) => cam(...p));
    return {
      etiqueta,
      ...encuadre(puntos, 0.1),
      dibuja: (p) => {
        clasesDeMalla(p);
        pinta(p, cam, caras(cam, Se, U, V, nu, nv));
        ejes3d(p, cam, largos);
      },
    };
  };
  const celdaMapa = (etiqueta, F, caja, nv) => ({
    etiqueta,
    ...caja,
    dibuja: (p) => mapa(p, F, caja, nv, { n: 120 }),
  });
  const A = 1;
  const B = 8;
  const C = PI;
  return mosaico({
    id: 'cq6-sup-niv',
    titulo: 'Tres superficies y tres mapas de curvas de nivel',
    desc:
      'Arriba, tres superficies en perspectiva. La (a) es una silla de montar: sube en dos esquinas opuestas y ' +
      'baja en las otras dos. La (b) es de revolución: un bulto en el centro rodeado de ondas circulares cada ' +
      'vez más bajas. La (c) tiene dos picos y dos hoyos repartidos por los cuatro cuadrantes. Abajo, tres ' +
      'mapas de curvas de nivel. En el (1), cuatro familias de curvas cerradas, una en cada cuadrante. En el ' +
      '(2), circunferencias concéntricas repartidas a distancias desiguales. En el (3), hipérbolas en las ' +
      'cuatro esquinas, que dejan libre una cruz a lo largo de los ejes.',
    columnas: 3,
    celdas: [
      celda3d('(a)', (u, v) => [u, v, silla(u, v)], [-A, A], [-A, A], 12, 12, 0.9, [1.7, 1.7, 1.3], camara(8, 30)),
      celda3d(
        '(b)',
        (r, t) => [r * Math.cos(t), r * Math.sin(t), sombrero(r * Math.cos(t), r * Math.sin(t))],
        [0.001, B],
        [0, 2 * PI],
        12,
        32,
        4,
        [11, 11, 5.5],
      ),
      celda3d('(c)', (u, v) => [u, v, huevera(u, v)], [-C, C], [-C, C], 14, 14, 2, [4.8, 4.8, 3.2]),
      celdaMapa('(1)', huevera, { x: [-C, C], y: [-C, C] }, [-0.85, -0.6, -0.35, -0.12, 0.12, 0.35, 0.6, 0.85]),
      celdaMapa('(2)', sombrero, { x: [-B, B], y: [-B, B] }, [0.7, 0.35, 0, -0.15, 0.08]),
      celdaMapa('(3)', silla, { x: [-A, A], y: [-A, A] }, [-0.7, -0.45, -0.25, -0.1, 0.1, 0.25, 0.45, 0.7]),
    ],
  });
}

/* ══ 5 a 7 · el cono y los dos paraboloides ══════════════════════════════ */

/** Una superficie sola en su lienzo, con los ejes encima. */
function superficieSola({ id, titulo, desc, cam, trozos, largos, desde, antes, extra, ancho = 320, alto = 270 }) {
  const puntos = [];
  for (const t of trozos) puntos.push(...muestras3d(t.S, t.U, t.V));
  const o = desde ?? [0, 0, 0];
  puntos.push(o, [o[0] + largos[0], o[1], o[2]], [o[0], o[1] + largos[1], o[2]], [o[0], o[1], o[2] + largos[2]]);
  const caja = encuadre(puntos.map((p) => cam(...p)), 0.09);
  const f = lienzo({ id, ancho, alto, ...caja, cuadrado: true, titulo, desc });
  clasesDeMalla(f);
  if (antes) antes(f);
  const lista = [];
  for (const t of trozos) lista.push(...caras(cam, t.S, t.U, t.V, t.nu, t.nv, t.fuera ?? 1));
  pinta(f, cam, lista);
  if (extra) extra(f);
  ejes3d(f, cam, largos, { desde: o });
  return f.svg();
}

const elCono = () => superficieSola({
  id: 'cq6-cono',
  titulo: 'Un cono doble a lo largo del eje y',
  desc:
    'Un cono de dos hojas unidas por el vértice en el origen. Las dos hojas se abren a lo largo del eje y, ' +
    'una hacia las y positivas y otra hacia las negativas; cada corte perpendicular al eje y es una ' +
    'circunferencia, más grande cuanto más lejos del origen.',
  cam: camara(38, 20),
  trozos: [
    { S: (y, t) => [Math.abs(y) * Math.cos(t), y, Math.abs(y) * Math.sin(t)], U: [-2, 2], V: [0, 2 * PI], nu: 12, nv: 22 },
  ],
  largos: [2.4, 2.8, 2.4],
});

const paraboloideYNegativas = () => superficieSola({
  id: 'cq6-parab-y',
  titulo: 'Un paraboloide abierto hacia las y negativas',
  desc:
    'Un paraboloide con el vértice en el origen y el eje a lo largo del eje y, abierto hacia las y ' +
    'negativas: la boca queda a la izquierda del dibujo, de cara al lector, y se ve su interior sombreado. ' +
    'El eje y apunta hacia la derecha, al lado contrario de la boca.',
  cam: camara(-25, 24),
  trozos: [
    { S: (r, t) => [r * Math.cos(t), -r * r, r * Math.sin(t)], U: [0.001, 1.45], V: [0, 2 * PI], nu: 9, nv: 24, fuera: -1 },
  ],
  largos: [1.8, 1.6, 1.8],
});

/* a = 1, b = 1, c = −1: el vértice en (−1, 1, 1) y la boca en x = 1,6. */
const paraboloideDesplazado = () => superficieSola({
  id: 'cq6-parab-x',
  titulo: 'Un paraboloide desplazado, abierto hacia las x positivas',
  desc:
    'Un paraboloide con el eje paralelo al eje x, por encima del plano xy y a la derecha del eje z. Su boca ' +
    'es una circunferencia en un plano perpendicular al eje x y mira hacia el lado de las x positivas, hacia ' +
    'el lector: se ve su interior sombreado. El vértice queda detrás, hacia las x negativas.',
  cam: camara(40, 20),
  trozos: [
    { S: (r, t) => [r * r - 1, 1 + r * Math.cos(t), 1 + r * Math.sin(t)], U: [0.001, 1.6], V: [0, 2 * PI], nu: 9, nv: 24, fuera: -1 },
  ],
  largos: [2.6, 3.1, 3.0],
});

/* ══ 8 · cuatro cilindros hiperbólicos ═══════════════════════════════════ */

function cuatroCilindros() {
  const t0 = 0.42;
  const t1 = 2.4;
  const celda = (etiqueta, cam, S, U, V) => {
    const largos = [2.7, 2.7, 2.6];
    const puntos = [...muestras3d(S, U, V), [largos[0], 0, 0], [0, largos[1], 0], [0, 0, largos[2]], [0, 0, 0]];
    return {
      etiqueta,
      ...encuadre(puntos.map((p) => cam(...p)), 0.1),
      dibuja: (p) => {
        clasesDeMalla(p);
        pinta(p, cam, caras(cam, S, U, V, 9, 6));
        ejes3d(p, cam, largos);
      },
    };
  };
  const normal = camara(40, 22);
  const girada = camara(-60, 25);
  return mosaico({
    id: 'cq6-cilindros',
    titulo: 'Cuatro superficies cilíndricas',
    desc:
      'Cuatro trozos de cilindro hiperbólico, cada uno con sus ejes. En A, las rectas de la superficie son ' +
      'paralelas al eje y, y su perfil, en el plano xz, baja desde lo alto junto al eje z al crecer x. En B, ' +
      'las rectas son paralelas al eje x, y el perfil, en el plano yz, baja desde lo alto junto al eje z al ' +
      'crecer y. En C, las rectas son verticales, paralelas al eje z, y el perfil está en el plano xy. D es ' +
      'también un cilindro de rectas verticales, visto desde otro lado: sus ejes x e y salen hacia la derecha.',
    columnas: 2,
    celdas: [
      celda('A', normal, (x, y) => [x, y, 1 / x], [t0, t1], [0, 2]),
      celda('B', normal, (y, x) => [x, y, 1 / y], [t0, t1], [0, 2]),
      celda('C', normal, (x, z) => [x, 1 / x, z], [t0, t1], [0, 1.6]),
      celda('D', girada, (x, z) => [x, 1 / x, z], [t0, t1], [0, 1.6]),
    ],
  });
}

/* ══ 9 · el sólido: un paraboloide y su tapa ═════════════════════════════ */

function solidoParaboloide() {
  const cam = camara(20, 20);
  const S = (r, t) => [r * Math.cos(t), 0.2 + r * r, r * Math.sin(t)];
  const caja = [[-1, 0, -1], [1, 1.2, 1]];
  const esquinas = [];
  for (const x of [caja[0][0], caja[1][0]]) for (const y of [caja[0][1], caja[1][1]]) for (const z of [caja[0][2], caja[1][2]]) esquinas.push([x, y, z]);
  const aristas = [];
  for (let i = 0; i < 8; i++) {
    for (let j = i + 1; j < 8; j++) {
      const d = resta(esquinas[i], esquinas[j]).filter((v) => Math.abs(v) > 1e-9).length;
      if (d === 1) aristas.push([esquinas[i], esquinas[j]]);
    }
  }
  /* Las aristas de la caja que quedan detrás del sólido se pintan antes, y el
     sólido las tapa; las de delante, después. */
  const centro = cam.prof(0, 0.6, 0);
  const medio = ([a, b]) => cam.prof((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
  const detras = aristas.filter((e) => medio(e) < centro);
  const delante = aristas.filter((e) => medio(e) >= centro);
  const pintaAristas = (f, lista) => {
    f.clase('caja', 'stroke: var(--faint); stroke-width: .8; fill: none; stroke-dasharray: 4 3;');
    for (const [a, b] of lista) f.poli([cam(...a), cam(...b)], { clase: 'caja' });
  };
  return superficieSola({
    id: 'cq6-solido',
    titulo: 'Un paraboloide cerrado por una tapa plana',
    desc:
      'Un sólido con forma de cuenco tumbado: un paraboloide con el eje a lo largo del eje y y el vértice en ' +
      'el punto (0; 0,2; 0), cerrado por una tapa circular de radio 1 en el plano y = 1,2. Lo rodea una caja ' +
      'de aristas finas que va de −1 a 1 en x y en z, y de 0 a 1,2 en y; dos esquinas opuestas de la caja ' +
      'llevan sus coordenadas: (−1; 0; 1) y (1; 1,2; −1).',
    cam,
    trozos: [{ S, U: [0.001, 1], V: [0, 2 * PI], nu: 8, nv: 26 }],
    largos: [1.9, 2.0, 1.6],
    antes: (f) => pintaAristas(f, detras),
    extra: (f) => {
      /* La tapa va encima del paraboloide: el lector la ve de frente y el
         paraboloide entero queda detrás de su plano. */
      const borde = Array.from({ length: 73 }, (_, k) => cam(Math.cos((k * PI) / 36), 1.2, Math.sin((k * PI) / 36)));
      f.poli(borde, { clase: 'md', cerrar: true });
      for (let k = 0; k < 8; k++) f.poli([cam(0, 1.2, 0), cam(Math.cos((k * PI) / 4), 1.2, Math.sin((k * PI) / 4))], { clase: 'g' });
      pintaAristas(f, delante);
      f.rotulo(...cam(-1, 0, 1), '(−1; 0; 1)', { anclaje: 'end', dx: -4, dy: -6, pequeno: true, color: 'var(--faint)' });
      f.rotulo(...cam(1, 1.2, -1), '(1; 1,2; −1)', { anclaje: 'start', dx: 4, dy: 12, pequeno: true, color: 'var(--faint)' });
    },
  });
}

/* ══ 17 y 37 · una cresta en la dirección x que sube en la dirección y ═══ */

/* En el original las líneas de la malla en la dirección y son rectas y
   paralelas —la cresta, los bordes—, así que la superficie sube en línea
   recta al avanzar en y: F = h(x) + m·y, con h un arco. */
const cresta = (x, y) => 1 + 0.8 * x * (2 - x) + 0.25 * y;

function laCresta() {
  for (let x = 0; x <= 2; x += 0.1) {
    for (let y = 0; y <= 3; y += 0.25) {
      const [fx, fy] = gradiente(cresta, x, y);
      exige(fy > 0, 'en la cresta F_y tiene que ser positiva');
      exige(x < 0.95 ? fx > 0 : x > 1.05 ? fx < 0 : true, 'en la cresta F_x tiene que pasar de positiva a negativa');
    }
  }
  return superficieSola({
    id: 'cq6-cresta',
    titulo: 'Una superficie en forma de cresta',
    desc:
      'Una superficie sobre un rectángulo del plano xy. Cada corte con y fijo es un arco: sube desde el borde ' +
      'x = 0 hasta una cresta en el medio y vuelve a bajar hasta la misma altura en el otro borde. Al avanzar ' +
      'en el sentido del eje y, que apunta hacia el fondo a la derecha, toda la superficie sube en línea recta: ' +
      'la cresta y los bordes son rectas paralelas que suben.',
    cam: camara(-55, 25),
    trozos: [{ S: (x, y) => [x, y, cresta(x, y)], U: [0, 2], V: [0, 3], nu: 10, nv: 12 }],
    largos: [2.7, 3.7, 2.9],
  });
}

/* ══ 18 y 38 · cuatro superficies casi planas ════════════════════════════ */

/* Los signos se han leído en la diapositiva a 600 ppp, esquina por esquina,
   y las curvaturas, por lo que se separa cada borde de su cuerda. En el (4)
   el eje x apunta a la izquierda, como en el original. */
const CUATRO = [
  { et: '(1)', F: (x, y) => 2.2 - 0.6 * x - 0.6 * y - 0.3 * x * x + 0.25 * y * y, cam: camara(-40, 20), s: [-1, -1, -1, 1] },
  { et: '(2)', F: (x, y) => 0.6 + 0.9 * x + 0.9 * y - 0.35 * x * x + 0.35 * y * y, cam: camara(-55, 25), s: [1, 1, -1, 1] },
  { et: '(3)', F: (x, y) => 1.2 - 0.9 * x + 0.9 * y + 0.35 * x * x - 0.35 * y * y, cam: camara(-25, 15), s: [-1, 1, 1, -1] },
  { et: '(4)', F: (x, y) => 1.2 + 0.9 * x - 0.9 * y - 0.35 * x * x + 0.35 * y * y, cam: camara(65, 25), s: [1, -1, -1, 1] },
];

function cuatroSuperficies() {
  const h = 1e-4;
  for (const { et, F, s } of CUATRO) {
    for (let x = 0; x <= 1; x += 0.125) {
      for (let y = 0; y <= 1; y += 0.125) {
        const [fx, fy] = gradiente(F, x, y);
        const fxx = (F(x + h, y) - 2 * F(x, y) + F(x - h, y)) / (h * h);
        const fyy = (F(x, y + h) - 2 * F(x, y) + F(x, y - h)) / (h * h);
        [fx, fy, fxx, fyy].forEach((v, k) => exige(Math.sign(v) === s[k], `${et}: el signo ${k} no es el leído en la diapositiva`));
      }
    }
  }
  return mosaico({
    id: 'cq6-cuatro',
    titulo: 'Cuatro superficies sobre su dominio',
    desc:
      'Cuatro superficies, cada una flotando sobre un cuadrado sombreado del plano xy y con sus propios ejes. ' +
      'La (1) está más alta en la esquina del origen y baja al avanzar en x y al avanzar en y; en la dirección ' +
      'x se arquea un poco hacia abajo y en la dirección y se hunde un poco. La (2) está más baja en la ' +
      'esquina del origen y sube en las dos direcciones; se arquea hacia abajo en la dirección x y se curva ' +
      'hacia arriba en la dirección y. La (3) baja al avanzar en x y sube al avanzar en y; se hunde en la ' +
      'dirección x y se abomba en la dirección y. En la (4) el eje x apunta hacia la izquierda y el eje y ' +
      'hacia delante: sube hacia donde apunta el eje x y baja hacia donde apunta el eje y; se arquea hacia ' +
      'abajo en la dirección x y se curva hacia arriba en la dirección y.',
    columnas: 2,
    celdas: CUATRO.map(({ et, F, cam }) => {
      const S = (x, y) => [x, y, F(x, y)];
      const zmax = Math.max(...muestras3d(S, [0, 1], [0, 1]).map((p) => p[2]));
      const largos = [1.45, 1.45, zmax + 0.35];
      const puntos = [...muestras3d(S, [0, 1], [0, 1]), [largos[0], 0, 0], [0, largos[1], 0], [0, 0, largos[2]], [0, 0, 0]];
      return {
        etiqueta: et,
        ...encuadre(puntos.map((p) => cam(...p)), 0.1),
        dibuja: (p) => {
          clasesDeMalla(p);
          p.poli([[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]].map((q) => cam(...q)), { clase: 'base', cerrar: true });
          pinta(p, cam, caras(cam, S, [0, 1], [0, 1], 8, 8));
          ejes3d(p, cam, largos);
        },
      };
    }),
  });
}

/* ══ 19 · un plano inclinado sobre el tercer cuadrante ═══════════════════ */

const plano19 = (x, y) => 1.4 - 0.45 * x - 0.35 * y + 0.06 * x * x;

function planoInclinado() {
  for (let x = -2; x <= 0; x += 0.25) {
    for (let y = -1.5; y <= 0; y += 0.25) {
      const [fx, fy] = gradiente(plano19, x, y);
      exige(fx < 0 && fy < 0, 'en la diapositiva 19 las dos parciales tienen que ser negativas');
    }
  }
  const cam = camara(55, 20);
  return superficieSola({
    id: 'cq6-plano',
    titulo: 'Una superficie sobre un rectángulo detrás de los ejes',
    desc:
      'El eje x apunta hacia la izquierda y el eje y hacia delante, a la derecha. El dominio, sombreado, es un ' +
      'rectángulo con x e y negativas: queda a la derecha del eje z y hacia el fondo. Encima, una superficie ' +
      'casi plana que está más baja en la esquina del origen y sube hacia la derecha del dibujo, que es hacia ' +
      'las x negativas, y hacia el fondo, que es hacia las y negativas.',
    cam,
    trozos: [{ S: (x, y) => [x, y, plano19(x, y)], U: [-2, 0], V: [-1.5, 0], nu: 10, nv: 8 }],
    largos: [1.3, 1.3, 3.6],
    antes: (f) => f.poli([[0, 0, 0], [-2, 0, 0], [-2, -1.5, 0], [0, -1.5, 0]].map((q) => cam(...q)), { clase: 'base', cerrar: true }),
  });
}

/* ══ 39 · una onda en la dirección x ═════════════════════════════════════ */

/* x entre −π y π, y entre 0 y 2, como la caja del original: en la dirección
   x, una cresta hacia x = −π/2 y un valle hacia x = π/2; en la dirección y,
   una bajada cada vez más rápida, cóncava. */
const onda = (x, y) => 3.5 - 0.1 * y - 0.42 * y * y - 0.45 * Math.sin(x);

function laOnda() {
  const h = 1e-4;
  for (let x = -3; x <= 3; x += 0.2) {
    const fxx = (onda(x + h, 1) - 2 * onda(x, 1) + onda(x - h, 1)) / (h * h);
    const fyy = (onda(x, 1 + h) - 2 * onda(x, 1) + onda(x, 1 - h)) / (h * h);
    if (Math.abs(x) > 0.05) exige(Math.sign(fxx) === Math.sign(x), 'en la diapositiva 39 F_xx tiene que ser negativa antes de x = 0 y positiva después');
    exige(fyy < 0, 'en la diapositiva 39 F_yy tiene que ser negativa');
  }
  const cam = camara(70, 25);
  const caja = [[-PI, 0, 0], [PI, 2, 4]];
  const esquinas = [];
  for (const x of [caja[0][0], caja[1][0]]) for (const y of [caja[0][1], caja[1][1]]) for (const z of [caja[0][2], caja[1][2]]) esquinas.push([x, y, z]);
  const aristas = [];
  for (let i = 0; i < 8; i++) {
    for (let j = i + 1; j < 8; j++) {
      if (resta(esquinas[i], esquinas[j]).filter((v) => Math.abs(v) > 1e-9).length === 1) aristas.push([esquinas[i], esquinas[j]]);
    }
  }
  const centro = cam.prof(0, 1, 2);
  const medio = ([a, b]) => cam.prof((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
  const pintaAristas = (f, lista) => {
    f.clase('caja', 'stroke: var(--faint); stroke-width: .8; fill: none; stroke-dasharray: 4 3;');
    for (const [a, b] of lista) f.poli([cam(...a), cam(...b)], { clase: 'caja' });
  };
  const S = (x, y) => [x, y, onda(x, y)];
  const puntos = [...muestras3d(S, [-PI, PI], [0, 2]), ...esquinas, [PI + 0.9, 0, 0], [0, 2.7, 0], [0, 0, 4.5]].map((p) => cam(...p));
  const f = lienzo({
    id: 'cq6-onda',
    ancho: 340,
    alto: 260,
    ...encuadre(puntos, 0.08),
    cuadrado: true,
    titulo: 'Una superficie ondulada en la dirección x',
    desc:
      'Una superficie sobre el rectángulo de x entre menos pi y pi e y entre 0 y 2, dentro de una caja de ' +
      'aristas finas de altura 4. El eje x apunta hacia la izquierda y el eje y hacia delante. En la dirección ' +
      'x la superficie hace una onda: partiendo del borde derecho, x = −π, sube a una cresta, baja a un valle ' +
      'y vuelve a subir hasta el borde izquierdo, x = π. En la dirección y, de atrás hacia delante, baja cada ' +
      'vez más deprisa. El punto P está en el borde derecho del dominio, en x = −π e y = 1.',
  });
  clasesDeMalla(f);
  pintaAristas(f, aristas.filter((e) => medio(e) < centro));
  pinta(f, cam, caras(cam, S, [-PI, PI], [0, 2], 20, 8));
  pintaAristas(f, aristas.filter((e) => medio(e) >= centro));
  f.flecha(cam(-PI - 0.2, 0, 0), cam(PI + 0.9, 0, 0), { clase: 'eje3', punta: 6 });
  f.flecha(cam(0, 0, 0), cam(0, 2.7, 0), { clase: 'eje3', punta: 6 });
  f.flecha(cam(0, 0, 0), cam(0, 0, 4.5), { clase: 'eje3', punta: 6 });
  f.rotulo(...cam(PI + 0.9, 0, 0), 'x', { anclaje: 'end', dx: -8, dy: 4, pequeno: true, color: 'var(--faint)' });
  f.rotulo(...cam(0, 2.7, 0), 'y', { anclaje: 'start', dx: 7, dy: 6, pequeno: true, color: 'var(--faint)' });
  f.rotulo(...cam(0, 0, 4.5), 'z', { anclaje: 'start', dx: 6, dy: 4, pequeno: true, color: 'var(--faint)' });
  f.rotulo(...cam(PI, 0, 0), 'π', { anclaje: 'middle', dx: 0, dy: 14, pequeno: true, color: 'var(--faint)' });
  f.rotulo(...cam(-PI, 0, 0), '−π', { anclaje: 'middle', dx: 0, dy: -7, pequeno: true, color: 'var(--faint)' });
  f.punto(...cam(-PI, 1, 0), { r: 3.6 });
  f.rotulo(...cam(-PI, 1, 0), 'P', { anclaje: 'start', dx: 7, dy: 4, color: 'var(--graphite)' });
  return f.svg();
}

/* ══ 20, 30 y 33 · el mapa de curvas onduladas ═══════════════════════════ */

/* Ajustada a las etiquetas del original, leídas a 600 ppp: los valores
   crecen hacia abajo, las curvas tienen la cresta hacia x = 0,3 y el valle
   hacia x = −0,7, y se aprietan abajo. */
const ondulado = (x, y) => 1.885 - 0.773 * y + 0.159 * y * y + 0.21 * Math.sin(PI * (x + 0.2));
const CAJA20 = { x: [-1.05, 1.05], y: [-0.97, 0.97] };
const PMRN = { P: [-0.5, 0.355], R: [0.417, 0.462], M: [-0.52, -0.553], N: [0.768, -0.652] };

function mapaOndulado(id, titulo, desc, encima) {
  for (let x = -1; x <= 1; x += 0.1) {
    for (let y = -0.95; y <= 0.95; y += 0.1) exige(gradiente(ondulado, x, y)[1] < 0, 'en el mapa ondulado F_y tiene que ser negativa');
  }
  const fx = (q) => gradiente(ondulado, ...PMRN[q])[0];
  exige(fx('P') > 0 && fx('M') > 0 && fx('R') < 0 && fx('N') < 0, 'los signos de F_x en P, M, R y N no son los del original');
  const f = lienzo({ id, ancho: 340, alto: 318, ...CAJA20, margen: 16, cuadrado: true, titulo, desc });
  mapa(f, ondulado, CAJA20, niveles(1.08, 2.94, 0.06), { n: 150 });
  for (const v of [1.2, 1.44, 1.92]) {
    const y = corteVertical(ondulado, -0.8, v, [-0.95, 0.95]);
    if (y !== null) f.rotulo(-0.8, y, coma(v), { anclaje: 'middle', dy: 3.5, pequeno: true, color: 'var(--faint)' });
  }
  for (const v of [2.28, 2.52, 2.76]) {
    const y = corteVertical(ondulado, 0.3, v, [-0.95, 0.95]);
    if (y !== null) f.rotulo(0.3, y, coma(v), { anclaje: 'middle', dy: 3.5, pequeno: true, color: 'var(--faint)' });
  }
  f.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-1, 1] });
  for (const [q, [x, y]] of Object.entries(PMRN)) {
    f.punto(x, y, { r: 3.4, clase: 'o' });
    f.rotulo(x, y, q, { anclaje: 'end', dx: -6, dy: -4, color: 'var(--graphite)' });
  }
  if (encima) encima(f);
  return f.svg();
}

const DESC_ONDULADO =
  'Un mapa de curvas de nivel ondulado: cada curva cruza el dibujo de izquierda a derecha haciendo un ' +
  'valle hacia x = −0,7 y una cresta hacia x = 0,3. Los valores crecen hacia abajo: las etiquetas dicen ' +
  '1,2, 1,44 y 1,92 a la izquierda, de arriba abajo, y 2,28, 2,52 y 2,76 en el centro, más abajo. ' +
  'P está arriba a la izquierda y M abajo a la izquierda, donde las curvas suben hacia la derecha; R está ' +
  'arriba a la derecha, justo pasada la cresta, y N abajo a la derecha, donde las curvas bajan hacia la ' +
  'derecha.';

const flechaEn = (f, [x, y], [dx, dy], nombre) => {
  f.flecha([x, y], [x + dx, y + dy], { clase: 'c2', punta: 7 });
  if (nombre) f.rotulo(x + dx, y + dy, nombre, { anclaje: 'start', dx: 5, dy: dy < 0 ? 11 : -3, color: 'var(--alt)' });
};

function mapaConDirecciones() {
  const L = 0.2;
  const dir = { v: [1, 0], u: [0, -1], w: [0.46, -0.89], s: [-0.39, 0.92] };
  const en = { v: 'P', u: 'R', w: 'M', s: 'N' };
  const g = (q) => gradiente(ondulado, ...PMRN[q]);
  const derivada = (q, d, signo = 1) => signo * escalar([...g(q), 0], [...d, 0]);
  exige(derivada('P', dir.v) > 0, 'F_v(P) tiene que ser positiva: la A es falsa');
  exige(derivada('R', dir.u, -1) < 0, 'F_−u(R) tiene que ser negativa: la B es falsa');
  exige(derivada('M', dir.w, -1) < 0, 'F_−w(M) tiene que ser negativa: la C es falsa');
  exige(derivada('N', dir.s, -1) > 0, 'F_−s(N) tiene que ser positiva: la D es la buena');
  return mapaOndulado(
    'cq6-direcciones',
    'El mapa ondulado con una dirección en cada punto',
    DESC_ONDULADO +
      ' Desde cada punto sale una flecha: v desde P, hacia la derecha; u desde R, hacia abajo; w desde M, ' +
      'hacia abajo y un poco a la derecha, casi perpendicular a las curvas; y s desde N, hacia arriba y un ' +
      'poco a la izquierda, también casi perpendicular a las curvas.',
    (f) => {
      f.clase('punta', 'fill: var(--alt); stroke: none;');
      for (const [nombre, d] of Object.entries(dir)) {
        const n = Math.hypot(...d);
        flechaEn(f, PMRN[en[nombre]], [(L * d[0]) / n, (L * d[1]) / n], nombre);
      }
    },
  );
}

function mapaConGradientes() {
  return mapaOndulado(
    'cq6-gradientes',
    'El mapa ondulado con un vector gradiente dibujado en cada punto',
    DESC_ONDULADO +
      ' En cada punto hay dibujada una flecha que pretende ser el gradiente. En P apunta hacia abajo a la ' +
      'derecha, en R hacia abajo a la izquierda y en M hacia abajo, las tres perpendiculares a las curvas y ' +
      'hacia valores mayores. En N es perpendicular a las curvas pero apunta hacia arriba a la derecha, hacia ' +
      'valores menores.',
    (f) => {
      f.clase('punta', 'fill: var(--alt); stroke: none;');
      for (const q of ['P', 'R', 'M', 'N']) {
        const [gx, gy] = gradiente(ondulado, ...PMRN[q]);
        const s = q === 'N' ? -0.2 : 0.2;
        flechaEn(f, PMRN[q], [s * gx, s * gy]);
      }
    },
  );
}

/* ══ 22 · curvas cerradas alrededor de un mínimo ═════════════════════════ */

const HUEVO = { c: [2.4, 2.9], R: [0.55, 0.95, 1.25, 1.55, 1.95] };
const rho = (t) => 1 + 0.08 * Math.cos(t - 0.6) + 0.06 * Math.cos(2 * t - 0.4);
const huevo = (k, t) => [
  HUEVO.c[0] + HUEVO.R[k] * rho(t) * Math.cos(t),
  HUEVO.c[1] + HUEVO.R[k] * rho(t) * Math.sin(t),
];

function curvasAlrededorDeUnMinimo() {
  const tP = -0.75;
  const P = huevo(3, tP);
  /* La normal hacia fuera en P, que es hacia donde crecen los valores: tiene
     que apuntar a la derecha y hacia abajo (m > 0, n < 0). */
  const [a, b] = [huevo(3, tP - 1e-4), huevo(3, tP + 1e-4)];
  const T = [b[0] - a[0], b[1] - a[1]];
  exige(T[1] > 0 && -T[0] < 0, 'en P la normal exterior tiene que apuntar a la derecha y hacia abajo');
  const f = lienzo({
    id: 'cq6-minimo',
    ancho: 300,
    alto: 300,
    x: [-0.45, 5.0],
    y: [-0.45, 5.35],
    cuadrado: true,
    titulo: 'Cinco curvas de nivel alrededor de un mínimo, y el punto P',
    desc:
      'Cinco curvas cerradas, una dentro de otra, rotuladas del 1, la más pequeña, al 5, la más grande: los ' +
      'valores crecen del centro hacia fuera. El punto P(a,b) está en la curva 4, abajo a la derecha de las ' +
      'curvas, y dos líneas discontinuas lo proyectan sobre los ejes: a en el eje x y b en el eje y.',
  });
  for (let k = 0; k < 5; k++) f.curva((t) => huevo(k, t), [0, 2 * PI], { n: 120, cerrar: true, clase: 'c' });
  f.poli([[0, P[1]], P], { clase: 'g' }).poli([[P[0], 0], P], { clase: 'g' });
  [0.95, 0.9, 0.85, 0.3, 0.02].forEach((t, k) => {
    f.rotulo(...huevo(k, t), String(k + 1), { anclaje: 'middle', dy: 4, color: 'var(--graphite)' });
  });
  f.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [[P[0], 'a']], marcasY: [[P[1], 'b']] });
  f.punto(...P, { r: 3.6, clase: 'o' });
  f.rotulo(...P, 'P', { anclaje: 'start', dx: 6, dy: -6, color: 'var(--flag)' });
  return f.svg();
}

/* ══ 23 · circunferencias de nivel y dos cambios de variable ═════════════ */

/** Una interpolación cúbica de Hermite por puntos, con pendientes centradas. */
function traza(puntos) {
  const n = puntos.length;
  const m = puntos.map((p, i) => {
    const a = puntos[Math.max(0, i - 1)];
    const b = puntos[Math.min(n - 1, i + 1)];
    return (b[1] - a[1]) / (b[0] - a[0]);
  });
  return (t) => {
    let i = 0;
    while (i < n - 2 && t > puntos[i + 1][0]) i++;
    const [t0, v0] = puntos[i];
    const [t1, v1] = puntos[i + 1];
    const h = t1 - t0;
    const s = (t - t0) / h;
    return (2 * s ** 3 - 3 * s ** 2 + 1) * v0 + (s ** 3 - 2 * s ** 2 + s) * h * m[i]
      + (-2 * s ** 3 + 3 * s ** 2) * v1 + (s ** 3 - s ** 2) * h * m[i + 1];
  };
}

/* Los puntos de las dos gráficas, leídos a 300 ppp. */
const xDeT = traza([[0, -1], [0.4, -1.25], [1.1, 0], [1.8, 2.1], [2.4, 2.85], [3, 1.8], [3.6, 0], [4, -1.35]]);
const yDeT = traza([[0, -0.5], [1, 1.05], [1.9, 1.4], [3, 1], [4, 0.35]]);

function reglaDeLaCadena() {
  const d = (f, t) => (f(t + 1e-4) - f(t - 1e-4)) / 2e-4;
  exige(xDeT(3) > 0 && yDeT(3) > 0 && d(xDeT, 3) < 0 && d(yDeT, 3) < 0, 'en t = 3 x e y tienen que ser positivas y decrecientes');
  const rejilla = (p, xs, ys) => {
    p.clase('rej', 'stroke: var(--rule); stroke-width: 1; fill: none; stroke-dasharray: 2 3;');
    for (const m of xs) p.poli([[m, p.rango.y[0] + 0.2], [m, p.rango.y[1] - 0.2]], { clase: 'rej' });
    for (const m of ys) p.poli([[p.rango.x[0] + 0.2, m], [p.rango.x[1] - 0.2, m]], { clase: 'rej' });
  };
  return mosaico({
    id: 'cq6-cadena',
    titulo: 'Las curvas de nivel de F y las gráficas de x(t) e y(t)',
    desc:
      'Tres gráficas. La primera, las curvas de nivel de F: circunferencias con centro en el origen, de radios ' +
      '0,5, 1, 1,5 y así hasta 4, rotuladas 0, 1, 2… hasta 7 de dentro hacia fuera. La segunda, x(t) entre ' +
      't = 0 y t = 4: empieza en −1, baja un poco, sube hasta casi 3 hacia t = 2,4 y baja deprisa: en t = 3 ' +
      'vale algo menos de 2 y está bajando. La tercera, y(t): empieza en −0,5, sube hasta 1,4 hacia t = 1,9 ' +
      'y baja despacio: en t = 3 vale 1 y está bajando.',
    columnas: 3,
    celdas: [
      {
        etiqueta: 'curvas de F',
        x: [-4.7, 4.7],
        y: [-4.7, 4.7],
        dibuja: (p) => {
          for (let k = 0; k < 8; k++) p.circunferencia(0, 0, 0.5 * (k + 1), { clase: 'niv' });
          p.clase('niv', 'stroke: var(--d1); stroke-width: 1.3; fill: none;');
          p.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-4, 4], marcasY: [-4, 4] });
          for (let k = 0; k < 8; k++) {
            const r = 0.5 * (k + 1);
            /* Pares e impares en dos radios distintos, para que no se pisen. */
            const ang = k % 2 === 0 ? 0.5 : 1.15;
            p.rotulo(r * Math.cos(ang), r * Math.sin(ang), String(k), { anclaje: 'middle', dy: 3.5, pequeno: true, color: 'var(--graphite)' });
          }
        },
      },
      {
        etiqueta: 'x(t)',
        x: [-0.45, 4.5],
        y: [-2.1, 3.4],
        cuadrado: false,
        dibuja: (p) => {
          rejilla(p, [1, 2, 3, 4], [-2, -1, 1, 2, 3]);
          p.curva(xDeT, [0, 4], { n: 120 });
          p.ejes({ nombreX: 't', nombreY: 'x', marcasX: [1, 2, 3, 4], marcasY: [-2, -1, 1, 2, 3] });
        },
      },
      {
        etiqueta: 'y(t)',
        x: [-0.45, 4.5],
        y: [-1.3, 3.4],
        cuadrado: false,
        dibuja: (p) => {
          rejilla(p, [1, 2, 3, 4], [-1, 1, 2, 3]);
          p.curva(yDeT, [0, 4], { n: 120 });
          p.ejes({ nombreX: 't', nombreY: 'y', marcasX: [1, 2, 3, 4], marcasY: [-1, 1, 2, 3] });
        },
      },
    ],
  });
}

/* ══ 31 · dónde es mayor el gradiente ════════════════════════════════════ */

/* El original no da la función. Esta reproduce su aspecto: F = y·s(x − γy),
   así que el eje x es una curva de nivel, arriba hay familias de curvas en U
   —una grande y otra doble, más plana— y abajo, en arco; las rectas donde
   s se anula van inclinadas y el mapa se aprieta al alejarse del eje x. */
const perfil31 = (t) => Math.sin(t) + 0.5 * Math.sin(2 * t + 0.9);
const G31 = -0.3;
const mapa31 = (x, y) => y * perfil31(x - G31 * y);
const CAJA31 = { x: [-3.3, 3.3], y: [-2.9, 2.9] };
/* Cada punto, puesto por su θ = x − γy y su altura y: E en una recta donde
   s se anula, abajo del todo; C en el fondo de la U plana. */
const en31 = (t, y) => [t + G31 * y, y];
const PUNTOS31 = {
  A: en31(-1.1, 1.8),
  B: en31(-2.648, -0.55),
  C: en31(2.84, 0.9),
  D: en31(0.746, -0.5),
  E: en31(-0.223, -2.6),
  F: en31(3.35, 2.2),
};

function dondeElGradienteEsMayor() {
  const modulo = (q) => Math.hypot(...gradiente(mapa31, ...PUNTOS31[q]));
  const otros = ['A', 'B', 'C', 'D', 'F'].map(modulo);
  exige(modulo('E') > 2 * Math.max(...otros), 'el gradiente en E tiene que ser, con diferencia, el mayor');
  exige(modulo('C') === Math.min(...otros, modulo('E')), 'el gradiente en C tiene que ser el menor');
  const f = lienzo({
    id: 'cq6-mayor',
    ancho: 340,
    alto: 310,
    ...CAJA31,
    margen: 12,
    cuadrado: true,
    titulo: 'Un mapa de curvas de nivel con seis puntos',
    desc:
      'Un mapa de curvas de nivel. El eje x es una de ellas. Arriba hay familias de curvas en forma de U: una ' +
      'grande a la izquierda, con A dentro, y a la derecha otra más plana, con C en el fondo de una de sus U, ' +
      'donde las curvas quedan muy separadas; F está a la derecha, arriba, donde las curvas van juntas. Abajo ' +
      'las familias tienen forma de arco: D está en lo alto de uno de ellos, B a la izquierda cerca del eje x, ' +
      'y E abajo del todo, donde dos familias se juntan y las curvas están apretadísimas.',
  });
  f.clase('niv', 'stroke: var(--d1); stroke-width: 1.05; fill: none; stroke-linejoin: round;');
  mapa(f, mapa31, CAJA31, niveles(-4, 4, 0.4), { n: 200 });
  f.ejes({ nombreX: 'x', nombreY: 'y' });
  for (const [q, [x, y]] of Object.entries(PUNTOS31)) {
    f.punto(x, y, { r: 3.6, clase: 'o' });
    f.rotulo(x, y, q, { anclaje: 'start', dx: 6, dy: -5, color: 'var(--graphite)' });
  }
  return f.svg();
}

/* ══ 32 · un mapa de gradientes y tres mapas de curvas ═══════════════════ */

/* Tampoco da las funciones. El mapa y el gráfico A salen de la misma: impar
   en x, con un máximo abajo a la izquierda y un mínimo abajo a la derecha, y
   subiendo hacia la esquina de arriba a la izquierda, como el original. El B
   es una huevera con un máximo en el origen; el C, una función cuyas curvas
   se abren hacia los lados, entre rectas horizontales. */
const campana = (u, v) => Math.exp(-(u * u + v * v) / 0.1);
const mapaA = (x, y) => x * (y + 0.16) * (0.3 - x * x) + 0.35 * (campana(x + 0.45, y + 0.62) - campana(x - 0.45, y + 0.62));
const mapaB = (x, y) => Math.cos(4.4 * x) * Math.cos(3.8 * (y + 0.05)) + 0.2 * Math.cos(8.8 * x);
const mapaC = (x, y) => Math.sin((PI * y) / 0.85) * (x * x + 0.15);

function mapaDeGradientes() {
  /* El máximo de abajo a la izquierda, buscado en su cuadrado: tiene que
     estar dentro y no en el borde, o no sería un máximo local. Por ser impar
     en x, el mínimo es su simétrico. */
  let mejor = [0, 0];
  let vMax = -Infinity;
  for (let x = -0.8; x <= -0.1 + 1e-9; x += 0.01) {
    for (let y = -0.9; y <= -0.3 + 1e-9; y += 0.01) {
      if (mapaA(x, y) > vMax) {
        vMax = mapaA(x, y);
        mejor = [x, y];
      }
    }
  }
  exige(mejor[0] > -0.75 && mejor[0] < -0.15 && mejor[1] > -0.85 && mejor[1] < -0.35, 'abajo a la izquierda tiene que haber un máximo local');
  exige(gradiente(mapaA, 0, 0.4)[0] > 0 && gradiente(mapaA, 0, -0.4)[0] < 0, 'junto al origen las flechas tienen que ir a la derecha arriba y a la izquierda abajo');
  const caja = { x: [-1, 1], y: [-1, 1] };
  const cajaC = { x: [-1, 1], y: [-1.1, 1] };
  const nivelesA = [-0.72, -0.56, -0.42, -0.3, -0.2, -0.12, -0.05, 0, 0.05, 0.12, 0.2, 0.3, 0.42, 0.56, 0.72];
  return mosaico({
    id: 'cq6-campo',
    titulo: 'Un mapa de gradientes y tres mapas de curvas de nivel',
    desc:
      'Cuatro cuadros. El primero es un mapa de gradientes: flechas del mismo largo en una rejilla. Abajo a ' +
      'la izquierda hay un punto al que llegan las flechas de todo alrededor, y abajo a la derecha otro del ' +
      'que salen hacia todos lados. Arriba a la izquierda las flechas apuntan hacia la izquierda y algo hacia arriba; a lo largo ' +
      'del eje y apuntan a la derecha por encima del origen y a la izquierda por debajo. En A, curvas de ' +
      'nivel con dos familias de curvas cerradas abajo, una a cada lado, y curvas que rodean las esquinas de ' +
      'arriba. En B, varias familias de curvas cerradas, una de ellas alrededor del origen. En C, curvas que ' +
      'se abren hacia la izquierda y hacia la derecha, entre rectas horizontales, sin ninguna cerrada.',
    columnas: 2,
    alto: 168,
    celdas: [
      {
        etiqueta: 'gradientes',
        ...caja,
        dibuja: (p) => {
          p.clase('fl', 'stroke: var(--graphite); stroke-width: 1; fill: none;');
          p.clase('punta', 'fill: var(--graphite); stroke: none;');
          const n = 10;
          for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
              const x = -0.9 + (1.8 * i) / (n - 1);
              const y = -0.9 + (1.8 * j) / (n - 1);
              const [gx, gy] = gradiente(mapaA, x, y);
              const m = Math.hypot(gx, gy);
              if (m < 1e-6) continue;
              const L = 0.13;
              p.flecha([x - (L / 2) * (gx / m), y - (L / 2) * (gy / m)], [x + (L / 2) * (gx / m), y + (L / 2) * (gy / m)], { clase: 'fl', punta: 4 });
            }
          }
          p.ejes({ nombreX: 'x', nombreY: 'y' });
        },
      },
      {
        etiqueta: 'A',
        ...caja,
        dibuja: (p) => {
          mapa(p, mapaA, caja, nivelesA, { n: 120 });
          p.ejes({ nombreX: 'x', nombreY: 'y' });
        },
      },
      {
        etiqueta: 'B',
        ...caja,
        dibuja: (p) => {
          mapa(p, mapaB, caja, [-1, -0.7, -0.4, -0.1, 0.2, 0.5, 0.8], { n: 120 });
          p.ejes({ nombreX: 'x', nombreY: 'y' });
        },
      },
      {
        etiqueta: 'C',
        ...cajaC,
        dibuja: (p) => {
          mapa(p, mapaC, cajaC, [-0.7, -0.5, -0.35, -0.22, -0.12, 0, 0.12, 0.22, 0.35, 0.5, 0.7], { n: 120 });
          p.ejes({ nombreX: 'x', nombreY: 'y' });
        },
      },
    ],
  });
}

/* ══ a pegar ═════════════════════════════════════════════════════════════ */

const mnrs = nivelMNRS();
const cuatro = cuatroSuperficies();
const figuras = {
  'cambio-de-altitud-mayor': mnrs,
  'cambio-de-altitud-mas-rapido': reetiqueta(mnrs, 'cq6-mnrs', 'cq6-mnrs2'),
  'curva-de-nivel-de-g-compuesta': curvaDeNivelDeG(),
  'superficies-y-curvas-de-nivel': superficiesYCurvas(),
  'el-cono': elCono(),
  'paraboloide-hacia-y-negativas': paraboloideYNegativas(),
  'paraboloide-desplazado': paraboloideDesplazado(),
  'yz-igual-a-uno': cuatroCilindros(),
  'solido-paraboloide-y-plano': solidoParaboloide(),
  'parciales-en-una-cresta': laCresta(),
  'cuatro-superficies-y-sus-parciales': cuatro,
  'parciales-de-un-plano-inclinado': planoInclinado(),
  'derivadas-segundas-en-una-cresta': reetiqueta(laCresta(), 'cq6-cresta', 'cq6-cresta2'),
  'cuatro-superficies-y-sus-derivadas-segundas': reetiqueta(cuatro, 'cq6-cuatro', 'cq6-cuatro2'),
  'el-punto-que-cruza-el-dominio': laOnda(),
  'parciales-en-un-mapa-de-curvas': mapaOndulado('cq6-ondulado', 'Un mapa de curvas de nivel onduladas y cuatro puntos', DESC_ONDULADO),
  'signo-de-las-derivadas-direccionales': mapaConDirecciones(),
  'el-gradiente-mal-dibujado': mapaConGradientes(),
  'signos-de-la-diferencial': curvasAlrededorDeUnMinimo(),
  'regla-de-la-cadena-en-t-igual-a-3': reglaDeLaCadena(),
  'donde-el-gradiente-es-mayor': dondeElGradienteEsMayor(),
  'mapa-de-gradientes': mapaDeGradientes(),
};

for (const [id, svg] of Object.entries(figuras)) pegaEnPregunta(BANCO, id, svg);
console.log(`${Object.keys(figuras).length} figuras pegadas en ${BANCO}`);
