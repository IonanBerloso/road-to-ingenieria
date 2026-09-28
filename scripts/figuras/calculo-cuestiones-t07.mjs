/**
 * Las figuras de las cuestiones del tema 7 de Cálculo, las de las
 * diapositivas de «Integral múltiple» (fase E3 de la auditoría del 27 de
 * septiembre de 2026).
 *
 * Se redibujan, no se recortan del PDF (§08), y se calculan con el lienzo:
 * los recintos con sus ecuaciones y los sólidos con `vista3d`. Los vértices,
 * las cotas de los sólidos y la gráfica de h(t) están medidos sobre las
 * diapositivas renderizadas a 600 ppp. Cuatro diapositivas repiten el recinto
 * de la anterior (2, 8, 10 y 12): la figura se copia con `reetiqueta`, no se
 * escribe dos veces.
 *
 *   node scripts/figuras/calculo-cuestiones-t07.mjs
 *
 * Pega cada figura en su pregunta; si la pregunta ya tiene una, se para.
 */
import { lienzo, mosaico, vista3d, reetiqueta } from './lienzo.mjs';
import { pegaEnPregunta } from './pegar.mjs';

/* El destino se puede cambiar para rehacerlas sobre una copia en revisión. */
const BANCO = process.env.BANCO ?? 'src/content/banco/calculo-t07.yaml';

const PI = Math.PI;
/** n + 1 puntos de f sobre [a, b]; valen igual para el plano y para el espacio. */
const tira = (f, [a, b], n = 48) => Array.from({ length: n + 1 }, (_, k) => f(a + ((b - a) * k) / n));

/* ── los recintos del plano ─────────────────────────────────────────── */

/** La rejilla de las diapositivas, en el gris más suave del sitio. */
const conRejilla = (l) => l.clase('rej', 'stroke: var(--grid); stroke-width: 1; fill: none;');

function rejilla(l, [x0, x1], [y0, y1]) {
  for (let x = Math.ceil(x0); x <= x1; x++) if (x !== 0) l.poli([[x, y0], [x, y1]], { clase: 'rej' });
  for (let y = Math.ceil(y0); y <= y1; y++) if (y !== 0) l.poli([[x0, y], [x1, y]], { clase: 'rej' });
}

/**
 * Un recinto: la rejilla, el recinto sombreado con su borde, sus rótulos y,
 * al final, los ejes, para que ninguna línea tape un número.
 */
function recinto(l, contorno, { rej, rotulos = [], marcasX = [], marcasY = [], nombres = ['x', 'y'] }) {
  conRejilla(l);
  if (rej) rejilla(l, ...rej);
  l.region(contorno);
  l.poli(contorno, { cerrar: true });
  for (const [x, y, texto] of rotulos) l.rotulo(x, y, texto, { anclaje: 'middle', dy: 4 });
  l.ejes({ nombreX: nombres[0], nombreY: nombres[1], marcasX, marcasY });
}

const menos = (n) => [n, `−${Math.abs(n)}`];

/* 1 y 2 · el rectángulo partido en dos por el eje y */
const dominio = (() => {
  const l = lienzo({
    id: 'cq7-dominio-1',
    x: [-1.7, 1.7],
    y: [-0.45, 2.45],
    cuadrado: true,
    titulo: 'El dominio D partido en dos mitades por el eje y',
    desc:
      'El rectángulo D, de x entre menos uno y uno y de y entre cero y dos, sombreado. El eje y lo ' +
      'parte en dos mitades iguales: D₁ a la izquierda y D₂ a la derecha.',
  });
  conRejilla(l);
  l.region([[-1, 0], [1, 0], [1, 2], [-1, 2]]);
  l.poli([[-1, 0], [1, 0], [1, 2], [-1, 2]], { cerrar: true });
  l.poli([[0, 0], [0, 2]]);
  l.rotulo(-0.5, 1.2, 'D₁', { anclaje: 'middle' });
  l.rotulo(0.5, 1.2, 'D₂', { anclaje: 'middle' });
  l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [menos(-1), 1], marcasY: [1, 2] });
  return l.svg();
})();

/* 6 · un triángulo con límites constantes */
const triangulo = (() => {
  const l = lienzo({
    id: 'cq7-triangulo',
    x: [-0.4, 1.5],
    y: [-0.3, 2.35],
    cuadrado: true,
    titulo: 'El dominio D, un triángulo rectángulo',
    desc:
      'El triángulo D de vértices cero, uno; uno, uno; y cero, dos, sombreado. Su lado de abajo es ' +
      'horizontal, en y igual a uno; el de la izquierda está sobre el eje y, y la hipotenusa baja desde ' +
      'el cero, dos hasta el uno, uno.',
  });
  recinto(l, [[0, 1], [1, 1], [0, 2]], { rotulos: [[0.3, 1.3, 'D']], marcasX: [1], marcasY: [1, 2] });
  return l.svg();
})();

/* 7 y 8 · un paralelogramo */
const paralelogramo = (() => {
  const l = lienzo({
    id: 'cq7-paralelogramo-1',
    x: [-0.4, 5.6],
    y: [-0.5, 2.5],
    cuadrado: true,
    titulo: 'Un paralelogramo sobre una rejilla',
    desc:
      'Un paralelogramo sombreado sobre una rejilla de cuadros de lado uno, de vértices cero, cero; ' +
      'cuatro, uno; cinco, dos; y uno, uno. Los dos lados largos son paralelos y suben despacio hacia ' +
      'la derecha; los dos cortos, uno del origen al uno, uno y otro del cuatro, uno al cinco, dos, ' +
      'también son paralelos entre sí.',
  });
  recinto(l, [[0, 0], [4, 1], [5, 2], [1, 1]], {
    rej: [[0, 5.3], [0, 2.3]],
    marcasX: [1, 2, 3, 4, 5],
    marcasY: [1, 2],
  });
  return l.svg();
})();

/* 9 y 10 · un triángulo con un vértice en el origen */
const trianguloGrande = (() => {
  const l = lienzo({
    id: 'cq7-triangulo-grande-1',
    x: [-0.5, 5.7],
    y: [-0.5, 5.5],
    cuadrado: true,
    titulo: 'Un triángulo con un vértice en el origen, sobre una rejilla',
    desc:
      'Un triángulo sombreado sobre una rejilla de cuadros de lado uno, de vértices cero, cero; cinco, ' +
      'dos; y tres, cinco. El lado de abajo va del origen al cinco, dos; el de la izquierda, del origen ' +
      'al tres, cinco, y el de la derecha baja del tres, cinco al cinco, dos.',
  });
  recinto(l, [[0, 0], [5, 2], [3, 5]], {
    rej: [[0, 5.4], [0, 5.3]],
    marcasX: [1, 2, 3, 4, 5],
    marcasY: [1, 2, 3, 4, 5],
  });
  return l.svg();
})();

/* 11 y 12 · medio disco a la izquierda del eje y */
const medioDisco = (() => {
  const l = lienzo({
    id: 'cq7-medio-disco-1',
    x: [-2.6, 1.6],
    y: [-0.5, 4.5],
    cuadrado: true,
    titulo: 'Medio disco a la izquierda del eje y',
    desc:
      'La mitad izquierda del disco de centro cero, dos y radio dos, sombreada sobre una rejilla. La ' +
      'curva es media circunferencia que sale del origen, llega a x igual a menos dos a la altura de ' +
      'y igual a dos y vuelve al eje y en el cero, cuatro; el lado recto es el trozo del eje y entre ' +
      'y igual a cero e y igual a cuatro.',
  });
  recinto(l, tira((t) => [2 * Math.cos(t), 2 + 2 * Math.sin(t)], [PI / 2, (3 * PI) / 2], 72), {
    rej: [[-2.4, 1.4], [0, 4.3]],
    marcasX: [menos(-2), menos(-1), 1],
    marcasY: [1, 2, 3, 4],
  });
  return l.svg();
})();

/* 13 · dos cuartos de circunferencia y dos segmentos */
const dosArcos = (() => {
  const l = lienzo({
    id: 'cq7-dos-arcos',
    x: [-1.6, 2.2],
    y: [-1.45, 1.45],
    cuadrado: true,
    titulo: 'Un recinto de dos cuartos de circunferencia y dos segmentos',
    desc:
      'Un recinto sombreado, con cuatro trozos de borde. Arriba a la izquierda, el cuarto de la ' +
      'circunferencia unidad que va del menos uno, cero al cero, uno. Arriba a la derecha, el segmento ' +
      'del cero, uno al uno, cero. Abajo a la derecha, el cuarto de circunferencia unidad del uno, cero ' +
      'al cero, menos uno. Y abajo a la izquierda, el segmento del cero, menos uno al menos uno, cero.',
  });
  const contorno = [
    ...tira((t) => [Math.cos(t), Math.sin(t)], [PI, PI / 2], 36),
    ...tira((t) => [Math.cos(t), Math.sin(t)], [0, -PI / 2], 36),
  ];
  recinto(l, contorno, { rej: [[-1.4, 2], [-1.3, 1.3]], marcasX: [menos(-1), 1, 2], marcasY: [menos(-1), 1] });
  return l.svg();
})();

/* 14 · un trébol de cuatro lóbulos */
const trebol = (() => {
  const l = lienzo({
    id: 'cq7-trebol',
    x: [-2.5, 2.9],
    y: [-2.5, 2.5],
    cuadrado: true,
    titulo: 'Un recinto con forma de trébol de cuatro hojas',
    desc:
      'Un recinto sombreado formado por el cuadrado de vértices menos uno, menos uno y uno, uno, más ' +
      'cuatro medios círculos de radio uno pegados a sus lados: el de la izquierda con centro en el ' +
      'menos uno, cero; el de arriba, en el cero, uno; el de la derecha, en el uno, cero; y el de abajo, ' +
      'en el cero, menos uno. Llega a x igual a menos dos y a dos, y a y igual a menos dos y a dos.',
  });
  const lobulo = ([cx, cy], [a, b]) => tira((t) => [cx + Math.cos(t), cy + Math.sin(t)], [a, b], 36);
  const contorno = [
    ...lobulo([1, 0], [-PI / 2, PI / 2]),
    ...lobulo([0, 1], [0, PI]),
    ...lobulo([-1, 0], [PI / 2, (3 * PI) / 2]),
    ...lobulo([0, -1], [PI, 2 * PI]),
  ];
  recinto(l, contorno, {
    rej: [[-2.3, 2.7], [-2.3, 2.3]],
    marcasX: [menos(-2), menos(-1), 1, 2],
    marcasY: [menos(-2), menos(-1), 1, 2],
  });
  return l.svg();
})();

/* 16 · un cambio lineal que lleva un rectángulo a un cuadrado */
const cambioCuadrado = mosaico({
  id: 'cq7-cambio-cuadrado',
  titulo: 'El rectángulo D₂ en el plano uv y el cuadrado D₁ en el plano xy',
  desc:
    'Dos recuadros. En el primero, plano uv, el rectángulo D₂ con u entre menos uno y uno y v entre cero ' +
    'y dos. En el segundo, plano xy, el cuadrado D₁ girado cuarenta y cinco grados, de vértices uno, ' +
    'uno arriba; tres, menos uno a la derecha; uno, menos tres abajo; y menos uno, menos uno a la ' +
    'izquierda.',
  columnas: 2,
  ancho: 200,
  alto: 210,
  celdas: [
    {
      etiqueta: 'plano uv',
      x: [-1.9, 1.9],
      y: [-0.6, 2.6],
      dibuja: (p) =>
        recinto(p, [[-1, 0], [1, 0], [1, 2], [-1, 2]], {
          rotulos: [[0.45, 1, 'D₂']],
          marcasX: [menos(-1), 1],
          marcasY: [1, 2],
          nombres: ['u', 'v'],
        }),
    },
    {
      etiqueta: 'plano xy',
      x: [-1.6, 3.6],
      y: [-3.4, 1.5],
      dibuja: (p) =>
        recinto(p, [[1, 1], [3, -1], [1, -3], [-1, -1]], {
          rej: [[-1.4, 3.4], [-3.2, 1.3]],
          rotulos: [[1.2, -1, 'D₁']],
          marcasX: [menos(-1), 1, 2, 3],
          marcasY: [menos(-3), menos(-2), menos(-1), 1],
        }),
    },
  ],
});

/* 17 · un cambio lineal entre dos triángulos */
const cambioTriangulo = mosaico({
  id: 'cq7-cambio-triangulo',
  titulo: 'El triángulo D₁ en el plano xy y el triángulo D₂ en el plano uv',
  desc:
    'Dos recuadros. En el primero, plano xy, el triángulo D₁ de vértices cero, cero; uno, cero; y uno, ' +
    'uno. En el segundo, plano uv, el triángulo D₂ de vértices cero, cero; dos, uno; y uno, dos, más ' +
    'grande que el primero.',
  columnas: 2,
  ancho: 200,
  alto: 190,
  celdas: [
    {
      etiqueta: 'plano xy',
      x: [-0.4, 1.6],
      y: [-0.4, 1.5],
      dibuja: (p) =>
        recinto(p, [[0, 0], [1, 0], [1, 1]], { rotulos: [[0.68, 0.34, 'D₁']], marcasX: [1], marcasY: [1] }),
    },
    {
      etiqueta: 'plano uv',
      x: [-0.4, 2.5],
      y: [-0.4, 2.4],
      dibuja: (p) =>
        recinto(p, [[0, 0], [2, 1], [1, 2]], {
          rotulos: [[1.05, 1.05, 'D₂']],
          marcasX: [1, 2],
          marcasY: [1, 2],
          nombres: ['u', 'v'],
        }),
    },
  ],
});

/* 19 · una corona abierta por la derecha */
const corona = (() => {
  const l = lienzo({
    id: 'cq7-corona',
    x: [-3.5, 3.5],
    y: [-3.4, 3.4],
    cuadrado: true,
    titulo: 'Un trozo de corona circular abierto por la derecha',
    desc:
      'El recinto D, sombreado, entre las circunferencias de centro el origen y radios uno y tres. Le ' +
      'falta el trozo de la derecha: lo cortan dos segmentos radiales, uno a cuarenta y cinco grados por ' +
      'encima del eje x y otro a cuarenta y cinco grados por debajo, y el recinto da la vuelta por la ' +
      'izquierda, como una letra C.',
  });
  const contorno = [
    ...tira((t) => [3 * Math.cos(t), 3 * Math.sin(t)], [PI / 4, (7 * PI) / 4], 90),
    ...tira((t) => [Math.cos(t), Math.sin(t)], [(7 * PI) / 4, PI / 4], 60),
  ];
  recinto(l, contorno, {
    rotulos: [[-1.5, 1.5, 'D']],
    marcasX: [menos(-3), menos(-2), menos(-1), 1, 2, 3],
    marcasY: [menos(-3), menos(-2), menos(-1), 1, 2, 3],
  });
  return l.svg();
})();

/* 20 · la corona entre dos elipses y la gráfica de h */
const elipses = (() => {
  /* h(t) medida sobre la diapositiva: pasa por h(1) = 1 y h(4) = 2, que son
     los dos únicos valores que hacen falta, y los dos caen en un cruce de la
     rejilla, como en el original. */
  const H = [
    [0, 0.52], [0.18, 1.1], [0.5, 1.38], [1, 1], [1.5, 0.5], [2, 0.17], [2.5, 0.45], [3, 0.96],
    [3.5, 1.55], [4, 2], [4.3, 2.05], [4.65, 1.93], [5, 1.55], [5.4, 1.05], [5.76, 0.84], [6, 1],
  ];
  const spline = (P) => {
    const Q = [P[0], ...P, P[P.length - 1]];
    const n = P.length - 1;
    return (s) => {
      const u = Math.min(Math.max(s, 0), 1) * n;
      const i = Math.min(Math.floor(u), n - 1);
      const f = u - i;
      const cr = (p0, p1, p2, p3) =>
        0.5 * (2 * p1 + (p2 - p0) * f + (2 * p0 - 5 * p1 + 4 * p2 - p3) * f * f + (3 * p1 - p0 - 3 * p2 + p3) * f * f * f);
      return [0, 1].map((k) => cr(Q[i][k], Q[i + 1][k], Q[i + 2][k], Q[i + 3][k]));
    };
  };
  return mosaico({
    id: 'cq7-elipses',
    titulo: 'El recinto entre dos elipses y la gráfica de h(t)',
    desc:
      'Dos recuadros. En el (1), el recinto D sombreado entre dos elipses centradas en el origen y ' +
      'alargadas en vertical: la de dentro corta los ejes en x igual a más y menos uno y en y igual a ' +
      'más y menos dos; la de fuera, en x igual a más y menos dos y en y igual a más y menos cuatro. En ' +
      'el (2), sobre una rejilla, la gráfica de h entre t igual a cero y t igual a seis: empieza en ' +
      'medio, sube, pasa por la altura uno en t igual a uno, baja casi hasta cero en t igual a dos, sube ' +
      'hasta la altura dos en t igual a cuatro y vuelve a bajar hasta terminar en la altura uno en t ' +
      'igual a seis.',
    columnas: 2,
    ancho: 190,
    alto: 250,
    celdas: [
      {
        etiqueta: '(1)',
        x: [-2.8, 2.8],
        y: [-4.6, 4.6],
        dibuja: (p) => {
          conRejilla(p);
          const fuera = tira((t) => [2 * Math.cos(t), 4 * Math.sin(t)], [0, 2 * PI], 120);
          const dentro = tira((t) => [Math.cos(t), 2 * Math.sin(t)], [2 * PI, 0], 90);
          p.region([...fuera, ...dentro]);
          p.poli(fuera, { cerrar: true }).poli(dentro, { cerrar: true });
          p.rotulo(1.45, 1.4, 'D', { anclaje: 'middle' });
          p.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [menos(-2), menos(-1), 1, 2], marcasY: [menos(-4), menos(-2), 2, 4] });
        },
      },
      {
        etiqueta: '(2)',
        x: [-0.5, 6.6],
        y: [-0.35, 2.5],
        cuadrado: false,
        dibuja: (p) => {
          conRejilla(p);
          rejilla(p, [0, 6.4], [0, 2.3]);
          p.curva(spline(H), [0, 1], { n: 240 });
          p.ejes({ nombreX: 't', nombreY: 'h(t)', marcasX: [1, 2, 3, 4, 5, 6], marcasY: [1, 2] });
        },
      },
    ],
  });
})();

/* ── los sólidos ────────────────────────────────────────────────────── */

/*
 * La proyección de todos los sólidos es la de `vista3d`, con el suelo algo
 * más plano que la isométrica exacta: inclinación 0,85 y no 1. Con la exacta,
 * dos aristas distintas caen en la misma recta en cuanto la diferencia entre
 * sus puntos apunta al observador —el eje y y la arista de delante de la caja
 * de la diapositiva 22 salían superpuestos—.
 */
const INCLINACION = 0.85;
const iso = vista3d({ escalaXY: 1, inclinacion: INCLINACION });

/**
 * El sólido girado un ángulo α alrededor del eje z. El observador mira desde
 * la dirección (cos α + sen α, cos α − sen α, 0,85): una cara se ve si su
 * normal exterior apunta hacia ahí, y en un sólido convexo eso basta. Los que
 * no lo son —el valle de la 21 y la 23, el cuenco de la 28— se miran desde
 * donde ninguna cara visible queda tapada por otra; la cuenta está en su
 * comentario.
 */
const vista = (alfa) => {
  const c = Math.cos(alfa);
  const s = Math.sin(alfa);
  return (x, y, z) => iso(-(x * c - y * s), -(x * s + y * c), z);
};
/** Desde (1, 1, 0,85): x hacia abajo a la izquierda, y hacia abajo a la derecha. */
const DELANTE = vista(0);
/** Desde (1, −1, 0,85): x hacia abajo a la derecha, y hacia arriba a la derecha. */
const DERECHA = vista(PI / 2);
/** Desde (0,41, 1,35, 0,85), casi de frente al plano y = 1: x hacia la izquierda, y hacia el observador. */
const VALLE = vista(-0.49);

/** El marco de un lienzo que enseña esos puntos del espacio, con un margen en unidades por cada lado. */
function marco(P, puntos, [izq, der, abajo, arriba]) {
  const q = puntos.map((p) => P(...p));
  const us = q.map(([u]) => u);
  const vs = q.map(([, v]) => v);
  return { x: [Math.min(...us) - izq, Math.max(...us) + der], y: [Math.min(...vs) - abajo, Math.max(...vs) + arriba] };
}

/** Las piezas de un dibujo en el espacio, sobre un lienzo y una proyección. */
function en3d(l, P) {
  const q = (p) => P(...p);
  const gris = { color: 'var(--graphite)', pequeno: true };
  const d = {
    cara: (pts, clase = 'f') => l.poli(pts.map(q), { clase, cerrar: true }),
    linea: (pts, clase = 'c') => l.poli(pts.map(q), { clase }),
    arista: (a, b, clase = 'c') => l.poli([q(a), q(b)], { clase }),
    /** La caja de referencia de las diapositivas, en trazo fino discontinuo. */
    caja([x0, x1], [y0, y1], [z0, z1]) {
      const v = (i, j, k) => [[x0, x1][i], [y0, y1][j], [z0, z1][k]];
      for (const [a, b] of [
        [[0, 0, 0], [1, 0, 0]], [[0, 1, 0], [1, 1, 0]], [[0, 0, 1], [1, 0, 1]], [[0, 1, 1], [1, 1, 1]],
        [[0, 0, 0], [0, 1, 0]], [[1, 0, 0], [1, 1, 0]], [[0, 0, 1], [0, 1, 1]], [[1, 0, 1], [1, 1, 1]],
        [[0, 0, 0], [0, 0, 1]], [[1, 0, 0], [1, 0, 1]], [[0, 1, 0], [0, 1, 1]], [[1, 1, 0], [1, 1, 1]],
      ]) {
        d.arista(v(...a), v(...b), 'g');
      }
    },
    /** Los tres ejes, de `desde` a `hasta` en cada coordenada. Van debajo de las caras. */
    ejes([hx, hy, hz], [dx, dy, dz] = [0, 0, 0]) {
      d.arista([dx, 0, 0], [hx, 0, 0], 'eje');
      d.arista([0, dy, 0], [0, hy, 0], 'eje');
      d.arista([0, 0, dz], [0, 0, hz], 'eje');
    },
    /** Los nombres de los ejes, al final, para que su halo quede encima. */
    nombres([hx, hy, hz], pos) {
      const n = { color: 'var(--faint)', pequeno: true };
      l.rotulo(...q([hx, 0, 0]), 'x', { ...n, ...pos.x });
      l.rotulo(...q([0, hy, 0]), 'y', { ...n, ...pos.y });
      l.rotulo(...q([0, 0, hz]), 'z', { ...n, ...pos.z });
    },
    rotulo: (p, texto, opciones = {}) => l.rotulo(...q(p), texto, { ...gris, ...opciones }),
  };
  return d;
}

const ARRIBA = { anclaje: 'middle', dy: -5 };

/* 3 · el sólido entre y = 2x² e y = x² + 2 */
const cilindrosDados = (() => {
  const P = DERECHA;
  const EJES = [1.9, 4.6, 2.9];
  const l = lienzo({
    id: 'cq7-cilindros-dados',
    ancho: 340,
    alto: 290,
    cuadrado: true,
    ...marco(P, [[0, 0, -1], [1, 0, -1], [1, 3, -1], [0, 3, 2], [0, 0, 2], [1.9, 0, 0], [0, 4.6, 0], [0, 0, 2.9]], [1.35, 0.4, 0.55, 0.35]),
    titulo: 'El sólido entre los cilindros parabólicos y = 2x² e y = x² + 2',
    desc:
      'Una caja de referencia en trazo discontinuo, con la esquina cero, cero, dos arriba a la izquierda y ' +
      'la esquina uno, tres, menos uno abajo a la derecha. Dentro, dos paredes verticales curvas que van ' +
      'de la cara de abajo a la de arriba, con z de menos uno a dos. La de delante es la pared y igual a dos ' +
      'x cuadrado, que sale del eje z y se curva hasta el punto x igual a uno, y igual a dos. La de detrás, ' +
      'en trazo discontinuo, es la pared y igual a x cuadrado más dos, que va del cero, dos al uno, tres. ' +
      'El sólido es lo que queda entre las dos, con su cara de arriba sombreada.',
  });
  const d = en3d(l, P);
  const A = (x, z) => [x, 2 * x * x, z];
  const B = (x, z) => [x, x * x + 2, z];
  d.ejes(EJES);
  d.caja([0, 1], [0, 3], [-1, 2]);
  /* Desde (1, −1, 0,85) la pared y = 2x² se ve entera —su normal exterior,
     (4x, −1, 0), apunta al observador para todo x— y ninguna cara queda
     tapada: se sale por la pared convexa. La pared y = x² + 2 y la cara
     x = 0 quedan detrás. */
  d.cara([...tira((x) => A(x, 2), [0, 1]), ...tira((x) => A(x, -1), [1, 0])], 'f2');
  d.cara([[1, 2, -1], [1, 3, -1], [1, 3, 2], [1, 2, 2]]);
  d.cara([...tira((x) => A(x, 2), [0, 1]), ...tira((x) => B(x, 2), [1, 0])]);
  d.linea(tira((x) => A(x, 2), [0, 1]));
  d.linea(tira((x) => B(x, 2), [0, 1]));
  d.linea(tira((x) => A(x, -1), [0, 1]));
  d.arista([1, 2, 2], [1, 3, 2]);
  d.arista([0, 0, 2], [0, 2, 2]);
  d.arista([1, 2, -1], [1, 3, -1]);
  d.arista([0, 0, -1], [0, 0, 2]);
  d.arista([1, 2, -1], [1, 2, 2]);
  d.arista([1, 3, -1], [1, 3, 2]);
  d.linea(tira((x) => B(x, -1), [0, 1]), 'cp');
  d.arista([0, 2, -1], [0, 2, 2], 'cp');
  d.arista([0, 0, -1], [0, 2, -1], 'cp');
  d.rotulo([0, 0, 2], '(0,0,2)', { anclaje: 'end', dx: -6, dy: -2 });
  d.rotulo([1, 3, -1], '(1,3,−1)', { anclaje: 'middle', dy: 15 });
  d.rotulo(A(0.5, 0.5), 'y = 2x²', { anclaje: 'middle', color: 'var(--alt)', pequeno: false });
  d.rotulo(B(0.45, 2), 'y = x² + 2', { anclaje: 'middle', dy: -14, color: 'var(--alt)', pequeno: false });
  d.nombres(EJES, { x: { dx: 5, dy: 8 }, y: { dx: 5, dy: 3 }, z: ARRIBA });
  return l.svg();
})();

/* 4 · el sólido entre x = y² y x = 4 − y² */
const cilindrosDibujados = (() => {
  const P = DELANTE;
  const EJES = [4.9, 1.9, 2.9];
  const l = lienzo({
    id: 'cq7-cilindros-dibujados',
    ancho: 340,
    alto: 270,
    cuadrado: true,
    ...marco(P, [[0, -1, 0], [4, -1, 0], [4, 1, 0], [0, 1, 2], [4, -1, 2], [4.9, 0, 0], [0, 1.9, 0], [0, 0, 2.9]], [0.45, 1.25, 0.55, 0.35]),
    titulo: 'El sólido entre dos cilindros parabólicos enfrentados',
    desc:
      'Una caja de referencia en trazo discontinuo, de la esquina cero, uno, dos a la esquina cuatro, ' +
      'menos uno, cero. Dentro, dos paredes verticales curvas de altura dos. La primera es la parábola ' +
      'con el vértice en el origen, abierta hacia las x positivas, que llega a las caras y igual a más y ' +
      'menos uno en x igual a uno. La segunda es la parábola con el vértice en x igual a cuatro, abierta ' +
      'hacia las x negativas, que llega a esas caras en x igual a tres. El sólido es lo que queda entre ' +
      'las dos paredes, con su cara de arriba sombreada; las marcas uno y tres, en la arista de delante, ' +
      'señalan dónde acaban las paredes.',
  });
  const d = en3d(l, P);
  const W1 = (y, z) => [y * y, y, z];
  const W2 = (y, z) => [4 - y * y, y, z];
  const muro = (F, [a, b]) => [...tira((y) => F(y, 2), [a, b], 24), ...tira((y) => F(y, 0), [b, a], 24)];
  d.ejes(EJES);
  d.caja([0, 4], [-1, 1], [0, 2]);
  /* El sólido es convexo. Desde (1, 1, 0,85) se ven la cara y = 1, la de
     arriba y un trozo de cada pared: la de x = y² para y > 1/2 y la de
     x = 4 − y² para y > −1/2. Ahí van sus contornos. */
  d.cara(muro(W1, [0.5, 1]), 'f2');
  d.cara(muro(W2, [-0.5, 1]), 'f2');
  d.cara([[1, 1, 0], [3, 1, 0], [3, 1, 2], [1, 1, 2]]);
  d.cara([...tira((y) => W1(y, 2), [-1, 1]), ...tira((y) => W2(y, 2), [1, -1])]);
  d.linea(tira((y) => W1(y, 2), [-1, 1]));
  d.linea(tira((y) => W2(y, 2), [-1, 1]));
  d.arista([1, 1, 2], [3, 1, 2]);
  d.arista([1, -1, 2], [3, -1, 2]);
  d.arista([1, 1, 0], [1, 1, 2]);
  d.arista([3, 1, 0], [3, 1, 2]);
  d.arista([1, 1, 0], [3, 1, 0]);
  d.linea(tira((y) => W1(y, 0), [0.5, 1], 12));
  d.linea(tira((y) => W2(y, 0), [-0.5, 1], 36));
  d.arista(W1(0.5, 0), W1(0.5, 2));
  d.arista(W2(-0.5, 0), W2(-0.5, 2));
  d.arista([3, -1, 0], [3, -1, 2], 'cp');
  d.arista([1, -1, 0], [1, -1, 2], 'cp');
  d.arista([1, -1, 0], [3, -1, 0], 'cp');
  d.linea(tira((y) => W1(y, 0), [-1, 0.5], 36), 'cp');
  d.linea(tira((y) => W2(y, 0), [-1, -0.5], 12), 'cp');
  d.rotulo([1, 1, 0], '1', { anclaje: 'middle', dy: 14 });
  d.rotulo([3, 1, 0], '3', { anclaje: 'middle', dy: 14 });
  d.rotulo([0, 1, 2], '(0,1,2)', { dx: 6, dy: -3 });
  d.rotulo([4, -1, 0], '(4,−1,0)', { anclaje: 'middle', dy: 15 });
  d.nombres(EJES, { x: { anclaje: 'end', dx: -4, dy: 8 }, y: { dx: 5, dy: 6 }, z: ARRIBA });
  return l.svg();
})();

/* 21 y 23 · el sólido simétrico respecto del plano x = 0 */

/**
 * El sólido 0 ≤ z ≤ 1 + x² sobre [xa, xb] × [0, 1], visto desde VALLE.
 *
 * No es convexo —el techo es un valle—, pero desde (0,41, 1,35, 0,85) no se
 * tapa a sí mismo: un rayo que sale del techo hacia el observador sube 0,85
 * por cada 0,41 que avanza en x, y el valle no sube tan deprisa antes de que
 * el rayo salga por x = xb o por y = 1. Se ven el techo, la cara y = 1 y la
 * de x = xb; lo que queda detrás son las tres aristas de la esquina x = xa,
 * y = 0, z = 0.
 */
function solidoSimetrico(d, [xa, xb]) {
  const T = (x, y) => [x, y, 1 + x * x];
  const top = (y, [a, b], n = 40) => tira((x) => T(x, y), [a, b], n);
  d.cara([...top(1, [xa, xb]), [xb, 1, 0], [xa, 1, 0]]);
  d.cara([[xb, 0, 0], [xb, 1, 0], T(xb, 1), T(xb, 0)]);
  d.cara([...top(0, [xa, xb]), ...top(1, [xb, xa])], 'f2');
  for (const x of [-0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75]) {
    if (x > xa + 1e-9 && x < xb - 1e-9) d.arista(T(x, 0), T(x, 1), 'g');
  }
  d.linea(top(0.5, [xa, xb]), 'g');
  d.linea(top(0, [xa, xb]));
  d.linea(top(1, [xa, xb]));
  d.arista(T(xa, 0), T(xa, 1));
  d.arista(T(xb, 0), T(xb, 1));
  d.arista([xb, 0, 0], T(xb, 0));
  d.arista([xb, 1, 0], T(xb, 1));
  d.arista([xa, 1, 0], T(xa, 1));
  d.arista([xa, 1, 0], [xb, 1, 0]);
  d.arista([xb, 0, 0], [xb, 1, 0]);
  d.arista([xa, 0, 0], T(xa, 0), 'cp');
  d.arista([xa, 0, 0], [xb, 0, 0], 'cp');
  d.arista([xa, 0, 0], [xa, 1, 0], 'cp');
}

const EJES_R = [1.7, 1.75, 2.7];
const DESDE_R = [-1.4, 0, 0];
const NOMBRES_R = { x: { anclaje: 'end', dx: -4, dy: 4 }, y: { dx: 4, dy: 9 }, z: ARRIBA };
const PUNTOS_R = [
  [-1, 0, 0], [1, 0, 0], [-1, 1, 0], [1, 1, 0], [-1, 0, 2], [1, 0, 2], [-1, 1, 2], [1, 1, 2],
  [1.7, 0, 0], [-1.4, 0, 0], [0, 1.75, 0], [0, 0, 2.7],
];

const simetricoPartido = mosaico({
  id: 'cq7-simetrico-partido',
  titulo: 'El sólido R, simétrico respecto del plano x = 0, y sus dos mitades',
  desc:
    'Tres recuadros en perspectiva. En el primero, el sólido R: una pieza sobre un rectángulo del ' +
    'suelo, con el techo curvo, alto en los dos extremos y bajo en el centro, simétrica respecto del ' +
    'plano x igual a cero. En el segundo, R₁, la mitad de R con x positiva; en el tercero, R₂, la mitad ' +
    'con x negativa, con la cara del corte a la vista. Las dos mitades son una el reflejo de la otra.',
  columnas: 3,
  ancho: 150,
  alto: 165,
  celdas: [
    ['R', [-1, 1]],
    ['R₁', [0, 1]],
    ['R₂', [-1, 0]],
  ].map(([etiqueta, tramo]) => ({
    etiqueta,
    ...marco(VALLE, PUNTOS_R, [0.3, 0.2, 0.3, 0.35]),
    dibuja: (p) => {
      const d = en3d(p, VALLE);
      d.ejes(EJES_R, DESDE_R);
      solidoSimetrico(d, tramo);
      d.nombres(EJES_R, NOMBRES_R);
    },
  })),
});

const simetrico = (() => {
  const l = lienzo({
    id: 'cq7-simetrico',
    ancho: 320,
    alto: 270,
    cuadrado: true,
    ...marco(VALLE, PUNTOS_R, [0.35, 1.3, 0.55, 0.35]),
    titulo: 'El sólido R, simétrico respecto del plano x = 0',
    desc:
      'Una caja de referencia en trazo discontinuo, de la esquina menos uno, cero, dos arriba a la ' +
      'derecha a la esquina uno, uno, cero abajo a la izquierda. Dentro, el sólido R sobre el rectángulo ' +
      'de x entre menos uno y uno e y entre cero y uno: la cara de delante tiene el borde de arriba curvo, ' +
      'a la altura dos en los dos extremos, x igual a más y menos uno, y bajando hasta la altura uno en el ' +
      'centro. Es simétrico respecto del plano x igual a cero.',
  });
  const d = en3d(l, VALLE);
  d.ejes(EJES_R, DESDE_R);
  d.caja([-1, 1], [0, 1], [0, 2]);
  solidoSimetrico(d, [-1, 1]);
  d.rotulo([-1, 0, 2], '(−1,0,2)', { dx: 6, dy: -2 });
  d.rotulo([1, 1, 0], '(1,1,0)', { anclaje: 'middle', dy: 15 });
  d.nombres(EJES_R, NOMBRES_R);
  return l.svg();
})();

/* 22, 24 y 25 · la caja, la media caja y el tetraedro, todos convexos */

const SOLIDOS_CAJA = {
  caja: (d) => {
    d.cara([[1, 0, 0], [1, 2, 0], [1, 2, 1], [1, 0, 1]]);
    d.cara([[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]]);
    d.cara([[0, 0, 1], [1, 0, 1], [1, 2, 1], [0, 2, 1]], 'f2');
    for (const [a, b] of [
      [[0, 0, 0], [1, 0, 0]], [[1, 0, 0], [1, 2, 0]], [[0, 0, 0], [0, 0, 1]], [[1, 0, 0], [1, 0, 1]],
      [[1, 2, 0], [1, 2, 1]], [[0, 0, 1], [1, 0, 1]], [[1, 0, 1], [1, 2, 1]], [[1, 2, 1], [0, 2, 1]],
      [[0, 2, 1], [0, 0, 1]],
    ]) {
      d.arista(a, b);
    }
    for (const b of [[1, 2, 0], [0, 0, 0], [0, 2, 1]]) d.arista([0, 2, 0], b, 'cp');
  },
  mediaCaja: (d) => {
    d.cara([[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]]);
    d.cara([[1, 0, 0], [1, 2, 0], [1, 0, 1]]);
    d.cara([[0, 0, 1], [1, 0, 1], [1, 2, 0], [0, 2, 0]], 'f2');
    for (const [a, b] of [
      [[0, 0, 0], [1, 0, 0]], [[1, 0, 0], [1, 2, 0]], [[1, 2, 0], [0, 2, 0]], [[0, 0, 0], [0, 0, 1]],
      [[1, 0, 0], [1, 0, 1]], [[0, 0, 1], [1, 0, 1]], [[1, 0, 1], [1, 2, 0]], [[0, 0, 1], [0, 2, 0]],
    ]) {
      d.arista(a, b);
    }
    d.arista([0, 0, 0], [0, 2, 0], 'cp');
  },
  tetraedro: (d) => {
    d.cara([[0, 0, 0], [1, 0, 0], [0, 0, 1]]);
    d.cara([[1, 0, 0], [0, 2, 0], [0, 0, 1]], 'f2');
    for (const [a, b] of [
      [[0, 0, 0], [1, 0, 0]], [[0, 0, 0], [0, 0, 1]], [[1, 0, 0], [0, 2, 0]], [[0, 2, 0], [0, 0, 1]],
      [[0, 0, 1], [1, 0, 0]],
    ]) {
      d.arista(a, b);
    }
    d.arista([0, 0, 0], [0, 2, 0], 'cp');
  },
};

const EJES_CAJA = [2.2, 3.3, 1.6];
const PUNTOS_CAJA = [[0, 0, 0], [1, 0, 0], [1, 2, 0], [0, 2, 1], [1, 2, 1], [0, 0, 1], [2.2, 0, 0], [0, 3.3, 0], [0, 0, 1.6]];

/** Uno de los sólidos de la caja [0, 1] × [0, 2] × [0, 1], con la caja y sus dos esquinas. */
function enLaCaja(l, cual) {
  const d = en3d(l, DERECHA);
  d.ejes(EJES_CAJA);
  d.caja([0, 1], [0, 2], [0, 1]);
  SOLIDOS_CAJA[cual](d);
  d.rotulo([1, 0, 0], '(1,0,0)', { anclaje: 'middle', dy: 15 });
  d.rotulo([0, 2, 1], '(0,2,1)', { anclaje: 'middle', dy: -7 });
  d.nombres(EJES_CAJA, { x: { dx: 4, dy: 7 }, y: { dx: 5, dy: 3 }, z: ARRIBA });
}

const tresSolidos = mosaico({
  id: 'cq7-tres-solidos',
  titulo: 'Tres sólidos dentro de la misma caja',
  desc:
    'Tres recuadros con la misma caja de referencia en trazo discontinuo, de la esquina uno, cero, cero ' +
    'a la esquina cero, dos, uno. En A, el sólido es la caja entera. En B, la mitad de la caja que ' +
    'queda por debajo del plano que baja de la arista de arriba en y igual a cero hasta la arista de ' +
    'abajo en y igual a dos. En C, el tetraedro de vértices el origen, el uno, cero, cero, el cero, dos, ' +
    'cero y el cero, cero, uno.',
  columnas: 3,
  ancho: 176,
  alto: 150,
  celdas: [
    ['A', 'caja'],
    ['B', 'mediaCaja'],
    ['C', 'tetraedro'],
  ].map(([etiqueta, cual]) => ({
    etiqueta,
    ...marco(DERECHA, PUNTOS_CAJA, [0.3, 0.3, 0.55, 0.45]),
    dibuja: (p) => enLaCaja(p, cual),
  })),
});

const unaDeLaCaja = (id, cual, titulo, desc) => {
  const l = lienzo({ id, ancho: 300, alto: 230, cuadrado: true, ...marco(DERECHA, PUNTOS_CAJA, [0.3, 0.3, 0.55, 0.45]), titulo, desc });
  enLaCaja(l, cual);
  return l.svg();
};

const mediaCaja = unaDeLaCaja(
  'cq7-media-caja',
  'mediaCaja',
  'Media caja cortada por un plano inclinado',
  'Una caja de referencia en trazo discontinuo, de la esquina uno, cero, cero a la esquina cero, dos, uno. ' +
    'El sólido R es la mitad de la caja que queda por debajo de un plano inclinado: el plano pasa por la ' +
    'arista de arriba de la cara y igual a cero, a la altura uno, y baja hasta la arista del suelo en y ' +
    'igual a dos. Sus caras laterales, x igual a cero y x igual a uno, son triángulos.',
);

const tetraedro = unaDeLaCaja(
  'cq7-tetraedro',
  'tetraedro',
  'Un tetraedro en una esquina de la caja',
  'Una caja de referencia en trazo discontinuo, de la esquina uno, cero, cero a la esquina cero, dos, uno. ' +
    'El sólido R es el tetraedro de vértices el origen, el uno, cero, cero, el cero, dos, cero y el cero, ' +
    'cero, uno: tres caras sobre los planos coordenados y una cara inclinada que une los otros tres ' +
    'vértices.',
);

/* 26 · el sólido bajo el cilindro z = 1 + y(4 − y) */
const bajoCilindro = (() => {
  const P = DELANTE;
  const EJES = [3.7, 4.8, 5.8];
  const l = lienzo({
    id: 'cq7-bajo-cilindro',
    ancho: 330,
    alto: 330,
    cuadrado: true,
    ...marco(P, [[3, 0, 0], [0, 4, 0], [3, 4, 0], [0, 0, 5], [3, 0, 5], [0, 4, 5], [3.7, 0, 0], [0, 4.8, 0], [0, 0, 5.8]], [0.4, 0.45, 0.6, 0.35]),
    titulo: 'El sólido bajo el cilindro z = 1 + y(4 − y)',
    desc:
      'Una caja de referencia en trazo discontinuo, de la esquina cero, cero, cinco arriba a la esquina ' +
      'tres, cuatro, cero abajo. El sólido R está sobre el rectángulo del suelo de x entre uno y tres e ' +
      'y entre dos y cuatro, dibujado sombreado en el suelo, con sus dos lados de delante sobre las ' +
      'aristas de la caja y rotulados x igual a uno e y igual a dos. El sólido empieza a la altura uno, ' +
      'rotulada z igual a uno en una línea de puntos. Su techo es el cilindro: a la altura cinco en el ' +
      'borde y igual a dos, y bajando en curva hasta la altura uno en el borde y igual a cuatro.',
  });
  const d = en3d(l, P);
  const h = (y) => 1 + y * (4 - y);
  const T = (x, y) => [x, y, h(y)];
  d.ejes(EJES);
  d.caja([0, 3], [0, 4], [0, 5]);
  /* La sombra en el suelo, con dos lados sobre las aristas de delante de la
     caja: sus esquinas se rotulan ahí, y no en los ejes, que quedan detrás
     del sólido y sus números se leían como alturas. */
  d.cara([[1, 2, 0], [3, 2, 0], [3, 4, 0], [1, 4, 0]], 'f2');
  for (const [x, y] of [[1, 2], [3, 2], [3, 4], [1, 4]]) d.arista([x, y, 0], [x, y, 1], 'g');
  /* Convexo: el techo es una parábola hacia abajo. Desde (1, 1, 0,85) se ven
     la cara x = 3 y el techo, cuya normal (0, 2y − 4, 1) apunta al
     observador para todo y ≥ 2. */
  d.cara([...tira((y) => T(3, y), [2, 4]), [3, 2, 1]]);
  d.cara([...tira((y) => T(1, y), [2, 4]), ...tira((y) => T(3, y), [4, 2])], 'f2');
  for (const y of [2.5, 3, 3.5]) d.arista(T(1, y), T(3, y), 'g');
  d.linea(tira((y) => T(3, y), [2, 4]));
  d.linea(tira((y) => T(1, y), [2, 4]));
  d.arista(T(1, 2), T(3, 2));
  d.arista([1, 4, 1], [3, 4, 1]);
  d.arista([3, 2, 1], T(3, 2));
  d.arista([3, 2, 1], [3, 4, 1]);
  d.arista([1, 2, 1], T(1, 2), 'cp');
  d.arista([1, 2, 1], [1, 4, 1], 'cp');
  d.arista([1, 2, 1], [3, 2, 1], 'cp');
  d.rotulo([1, 4, 0], 'x = 1', { dx: 5, dy: 11 });
  d.rotulo([3, 2, 0], 'y = 2', { anclaje: 'end', dx: -5, dy: 11 });
  d.rotulo([3, 2, 0.5], 'z = 1', { anclaje: 'end', dx: -5, dy: 4 });
  d.rotulo([0, 0, 5], '(0,0,5)', { anclaje: 'end', dx: -6, dy: -3 });
  d.rotulo([3, 4, 0], '(3,4,0)', { anclaje: 'middle', dy: 15 });
  d.nombres(EJES, { x: { anclaje: 'end', dx: -4, dy: 6 }, y: { dx: 5, dy: 6 }, z: ARRIBA });
  return l.svg();
})();

/* 28 · cilíndricas: un cuarto de cilindro bajo un paraboloide */
const cilindricas = (() => {
  const P = DERECHA;
  const EJES = [1.4, 1.7, 3.25];
  const DESDE = [-1.5, 0, 0];
  const l = lienzo({
    id: 'cq7-cilindricas',
    ancho: 300,
    alto: 280,
    cuadrado: true,
    ...marco(P, [[-1, 0, 0], [0, 1, 0], [0, 0, 0], [-1, 1, 2], [-1, 0, 2], [0, 1, 2], [-1.5, 0, 0], [1.4, 0, 0], [0, 1.7, 0], [0, 0, 3.25]], [1.25, 0.9, 0.4, 0.35]),
    titulo: 'Un cuarto de cilindro con el techo en el paraboloide z = 1 + x² + y²',
    desc:
      'Una caja de referencia en trazo discontinuo, de la esquina menos uno, cero, dos arriba a la ' +
      'izquierda a la esquina cero, uno, cero abajo a la derecha. El sólido R es un cuarto de cilindro de ' +
      'radio uno sobre el cuarto de círculo del suelo con x negativa e y positiva. Delante se ven sus dos ' +
      'caras planas, sobre los planos x igual a cero e y igual a cero, que se juntan en el eje z; la pared ' +
      'del cilindro queda detrás. Su techo es el paraboloide, con forma de cuenco: a la altura uno sobre ' +
      'el eje z y subiendo hasta la altura dos en el borde del cilindro.',
  });
  const d = en3d(l, P);
  const c = (t, r, z) => [r * Math.cos(t), r * Math.sin(t), z];
  d.ejes(EJES, DESDE);
  d.caja([-1, 0], [0, 1], [0, 2]);
  /* El cuenco no es convexo, pero desde (1, −1, 0,85) nada lo tapa: un rayo
     que sale del techo hacia el observador sube más deprisa que el cuenco
     hasta salir por una de las dos caras planas, que son las que se ven con
     él. La pared del cilindro queda detrás. */
  d.cara([...tira((r) => [0, r, 1 + r * r], [0, 1], 24), [0, 1, 0], [0, 0, 0]]);
  d.cara([...tira((r) => [-r, 0, 1 + r * r], [0, 1], 24), [-1, 0, 0], [0, 0, 0]]);
  d.cara(
    [
      ...tira((t) => c(t, 1, 2), [PI / 2, PI], 36),
      ...tira((r) => [-r, 0, 1 + r * r], [1, 0], 24),
      ...tira((r) => [0, r, 1 + r * r], [0, 1], 24),
    ],
    'f2',
  );
  for (const t of [(5 * PI) / 8, (3 * PI) / 4, (7 * PI) / 8]) d.linea(tira((r) => c(t, r, 1 + r * r), [0, 1], 16), 'g');
  d.linea(tira((t) => c(t, 0.5, 1.25), [PI / 2, PI], 24), 'g');
  d.linea(tira((t) => c(t, 1, 2), [PI / 2, PI], 36));
  d.linea(tira((r) => [0, r, 1 + r * r], [0, 1], 24));
  d.linea(tira((r) => [-r, 0, 1 + r * r], [0, 1], 24));
  d.arista([0, 0, 0], [0, 0, 1]);
  d.arista([0, 1, 0], [0, 1, 2]);
  d.arista([-1, 0, 0], [-1, 0, 2]);
  d.arista([0, 0, 0], [0, 1, 0]);
  d.arista([0, 0, 0], [-1, 0, 0]);
  d.linea(tira((t) => c(t, 1, 0), [PI / 2, PI], 36), 'cp');
  d.rotulo([-1, 0, 2], '(−1,0,2)', { anclaje: 'end', dx: -6, dy: 0 });
  d.rotulo([0, 1, 0], '(0,1,0)', { dx: 6, dy: 5 });
  d.nombres(EJES, { x: { dx: 4, dy: 8 }, y: { dx: 5, dy: 3 }, z: ARRIBA });
  return l.svg();
})();

/* 29 · esféricas: un octavo de bola por debajo del plano z = 0 */
const esfericas = (() => {
  const P = DELANTE;
  const EJES = [2.8, 2.8, 1];
  const DESDE = [0, 0, -2.5];
  const l = lienzo({
    id: 'cq7-esfericas',
    ancho: 320,
    alto: 290,
    cuadrado: true,
    ...marco(P, [[2, 0, 0], [0, 2, 0], [2, 0, -2], [2, 2, -2], [0, 2, -2], [2.8, 0, 0], [0, 2.8, 0], [0, 0, 1], [0, 0, -2.5]], [0.35, 1.25, 0.6, 0.35]),
    titulo: 'Un octavo de bola por debajo del plano z = 0',
    desc:
      'Una caja de referencia en trazo discontinuo, de la esquina cero, dos, cero a la esquina dos, cero, ' +
      'menos dos. El sólido R es el octavo de la bola de radio dos que queda con x e y positivas y z ' +
      'negativa: su cara de arriba es el cuarto de círculo del plano z igual a cero, sombreado, y por ' +
      'debajo lo cierra la esfera, que baja hasta el punto cero, cero, menos dos.',
  });
  const d = en3d(l, P);
  const esf = (th, ph) => [2 * Math.sin(ph) * Math.cos(th), 2 * Math.sin(ph) * Math.sin(th), 2 * Math.cos(ph)];
  /* Se mira desde m = (1, 1, 0,85). El contorno de la esfera son los puntos
     con (x, y, z)·m = 0: la circunferencia máxima de base e1, e2 ⟂ m. Los
     meridianos de los planos x = 0 e y = 0 dejan de verse donde la cruzan,
     en φ₀ = π − arctg(0,85). */
  const m = [1, 1, INCLINACION];
  const e1 = [1 / Math.SQRT2, -1 / Math.SQRT2, 0];
  const cruz = [m[1] * e1[2] - m[2] * e1[1], m[2] * e1[0] - m[0] * e1[2], m[0] * e1[1] - m[1] * e1[0]];
  const nc = Math.hypot(...cruz);
  const e2 = cruz.map((v) => v / nc);
  const contorno = (t) => [0, 1, 2].map((k) => 2 * (Math.cos(t) * e1[k] + Math.sin(t) * e2[k]));
  const dentro = (t) => {
    const [x, y, z] = contorno(t);
    return x >= -1e-9 && y >= -1e-9 && z <= 1e-9;
  };
  const ts = tira((t) => t, [0, PI], 3600).filter(dentro);
  /* Vacío, los puntos saldrían NaN, y un NaN no cuenta como desborde en el
     lienzo: la figura se rompería sin que nada avisara. */
  if (!ts.length) throw new Error('esfericas: el borde de la esfera no cae en el octante; revisa INCLINACION');
  const [t0, t1] = [ts[0], ts[ts.length - 1]];
  const ph0 = PI - Math.atan(INCLINACION);
  d.ejes(EJES, DESDE);
  d.caja([0, 2], [0, 2], [-2, 0]);
  d.cara([
    ...tira((th) => esf(th, PI / 2), [0, PI / 2], 36),
    ...tira((ph) => esf(PI / 2, ph), [PI / 2, ph0], 18),
    ...tira((t) => contorno(t), [t1, t0], 36),
    ...tira((ph) => esf(0, ph), [ph0, PI / 2], 18),
  ]);
  d.cara([[0, 0, 0], ...tira((th) => esf(th, PI / 2), [0, PI / 2], 36)], 'f2');
  d.linea(tira((th) => esf(th, PI / 2), [0, PI / 2], 36));
  d.linea(tira((t) => contorno(t), [t0, t1], 36));
  for (const th of [0, PI / 2]) {
    d.linea(tira((ph) => esf(th, ph), [PI / 2, ph0], 18));
    d.linea(tira((ph) => esf(th, ph), [ph0, PI], 18), 'cp');
  }
  d.arista([0, 0, 0], [2, 0, 0]);
  d.arista([0, 0, 0], [0, 2, 0]);
  d.arista([0, 0, 0], [0, 0, -2], 'cp');
  d.rotulo([0, 2, 0], '(0,2,0)', { dx: 6, dy: -4 });
  d.rotulo([2, 0, -2], '(2,0,−2)', { anclaje: 'middle', dy: 15 });
  d.nombres(EJES, { x: { anclaje: 'end', dx: -4, dy: 6 }, y: { dx: 5, dy: 6 }, z: ARRIBA });
  return l.svg();
})();

const figuras = {
  'dominio-partido-en-dos-mitades': dominio,
  'simetria-que-iguala-las-dos-mitades': reetiqueta(dominio, 'cq7-dominio-1', 'cq7-dominio-2'),
  'volumen-entre-dos-cilindros-parabolicos-dados': cilindrosDados,
  'volumen-entre-dos-cilindros-parabolicos-dibujados': cilindrosDibujados,
  'limites-constantes-en-un-triangulo': triangulo,
  'limites-en-un-paralelogramo-con-y-por-fuera': paralelogramo,
  'limites-en-un-paralelogramo-con-x-por-fuera': reetiqueta(paralelogramo, 'cq7-paralelogramo-1', 'cq7-paralelogramo-2'),
  'limites-en-un-triangulo-con-x-por-fuera': trianguloGrande,
  'limites-en-un-triangulo-con-y-por-fuera': reetiqueta(trianguloGrande, 'cq7-triangulo-grande-1', 'cq7-triangulo-grande-2'),
  'limites-en-medio-disco': medioDisco,
  'limites-en-medio-disco-con-x-por-fuera': reetiqueta(medioDisco, 'cq7-medio-disco-1', 'cq7-medio-disco-2'),
  'limites-en-dos-arcos-y-dos-segmentos': dosArcos,
  'limites-en-un-trebol-de-cuatro-lobulos': trebol,
  'cambio-lineal-de-un-rectangulo-a-un-cuadrado': cambioCuadrado,
  'jacobiano-de-un-cambio-lineal-entre-triangulos': cambioTriangulo,
  'polares-en-una-corona-abierta': corona,
  'polares-generalizadas-entre-dos-elipses': elipses,
  'solido-simetrico-partido-en-dos': simetricoPartido,
  'para-que-solido-valen-limites-constantes': tresSolidos,
  'tres-afirmaciones-sobre-un-solido-simetrico': simetrico,
  'limites-de-media-caja-cortada-por-un-plano': mediaCaja,
  'limites-de-un-tetraedro': tetraedro,
  'limites-bajo-un-cilindro-parabolico': bajoCilindro,
  'cilindricas-bajo-un-paraboloide': cilindricas,
  'esfericas-bajo-el-plano-z-0': esfericas,
};

for (const [id, svg] of Object.entries(figuras)) pegaEnPregunta(BANCO, id, svg);
console.log(`${Object.keys(figuras).length} figuras pegadas en ${BANCO}`);
