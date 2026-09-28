/**
 * Las figuras de las cuestiones del tema 8 de Cálculo, las de las
 * diapositivas de «Integral curvilínea» (fase E3 de la auditoría del 27 de
 * septiembre de 2026).
 *
 * Se redibujan, no se recortan del PDF (§08), y se calculan con el lienzo.
 * Los campos llevan la receta de las diapositivas: una malla de flechas
 * proporcionales al módulo, o todas del mismo largo cuando el enunciado dice
 * «con el mismo módulo». Las trayectorias, las curvas de nivel y los puntos
 * M y N están medidos sobre las diapositivas renderizadas a 600 ppp.
 *
 *   node scripts/figuras/calculo-cuestiones-t08.mjs
 *
 * Pega cada figura en su pregunta; si la pregunta ya tiene una, se para.
 */
import { lienzo, mosaico } from './lienzo.mjs';
import { pegaEnPregunta } from './pegar.mjs';

/* El destino se puede cambiar para rehacerlas sobre una copia en revisión. */
const BANCO = process.env.BANCO ?? 'src/content/banco/calculo-t08.yaml';

const paso = (a, b, h) => Array.from({ length: Math.round((b - a) / h) + 1 }, (_, i) => a + i * h);
/** La misma malla sin la fila o la columna que caería encima de un eje y de sus números. */
const sinEje = (valores) => valores.filter((v) => Math.abs(v) > 1e-9);

/* ── las piezas ─────────────────────────────────────────────────────── */

/** Las clases propias: el campo en gris, y una tercera trayectoria en naranja. */
const clases = (l) =>
  l
    .clase('v', 'stroke: var(--faint); stroke-width: 1.2; fill: none;')
    .clase('vp', 'fill: var(--faint); stroke: none;')
    .clase('c3', 'stroke: var(--d2); stroke-width: 2.8; fill: none;')
    .clase('pc', 'fill: var(--d1); stroke: none;')
    .clase('pc2', 'fill: var(--alt); stroke: none;')
    .clase('pc3', 'fill: var(--d2); stroke: none;')
    .clase('nv', 'stroke: var(--graphite); stroke-width: 1.5; fill: none;');

/** De píxeles a coordenadas de la asignatura: el lienzo es lineal en los dos ejes. */
const aSujeto = (l) => {
  const ox = l.X(0);
  const ex = l.X(1) - ox;
  const oy = l.Y(0);
  const ey = l.Y(1) - oy;
  return ([px, py]) => [(px - ox) / ex, (py - oy) / ey];
};

/**
 * Una malla de flechas centradas en sus puntos.
 *
 * `largo` es el del cuerpo de la flecha más larga, en píxeles; con `unitario`,
 * el de todas. Sin `unitario` el cuerpo es proporcional al módulo y la punta
 * no encoge, como en las diapositivas: donde el campo es casi nulo queda solo
 * la punta, y eso es justo lo que hay que ver.
 */
function campo(l, F, xs, ys, { largo = 18, unitario = false } = {}) {
  const inv = aSujeto(l);
  const datos = [];
  let max = 0;
  for (const x of xs) {
    for (const y of ys) {
      const [u, v] = F(x, y);
      const m = Math.hypot(u, v);
      /* Un campo unitario no está definido en el origen: ahí no hay flecha. */
      if (!Number.isFinite(m)) continue;
      if (m > max) max = m;
      datos.push([x, y, u, v, m]);
    }
  }
  const h = 4.4;
  const w = 2.2;
  for (const [x, y, u, v, m] of datos) {
    if (m <= 1e-9 * max) continue;
    const dx = l.X(x + u) - l.X(x);
    const dy = l.Y(y + v) - l.Y(y);
    const n = Math.hypot(dx, dy);
    const [ux, uy] = [dx / n, dy / n];
    const s = unitario ? largo : largo * (m / max);
    const L = s + h;
    const [cx, cy] = [l.X(x), l.Y(y)];
    const cola = [cx - (ux * L) / 2, cy - (uy * L) / 2];
    const tip = [cx + (ux * L) / 2, cy + (uy * L) / 2];
    const base = [tip[0] - ux * h, tip[1] - uy * h];
    if (s >= 1) l.poli([inv(cola), inv(base)], { clase: 'v' });
    l.poli(
      [inv(tip), inv([base[0] - uy * w, base[1] + ux * w]), inv([base[0] + uy * w, base[1] - ux * w])],
      { clase: 'vp', cerrar: true },
    );
  }
}

/** Una punta de flecha sobre una trayectoria, en `p` y apuntando hacia `d`. */
function punta(l, p, d, clase = 'pc') {
  const inv = aSujeto(l);
  const dx = l.X(p[0] + d[0]) - l.X(p[0]);
  const dy = l.Y(p[1] + d[1]) - l.Y(p[1]);
  const n = Math.hypot(dx, dy);
  const [ux, uy] = [dx / n, dy / n];
  const [tx, ty] = [l.X(p[0]) + ux * 5, l.Y(p[1]) + uy * 5];
  const [bx, by] = [tx - ux * 10, ty - uy * 10];
  l.poli([inv([tx, ty]), inv([bx - uy * 4.6, by + ux * 4.6]), inv([bx + uy * 4.6, by - ux * 4.6])], {
    clase,
    cerrar: true,
  });
}

/** Una curva suave cerrada por sus puntos de paso (Catmull-Rom), t en [0, 1]. */
function cerrada(P) {
  const n = P.length;
  return (t) => {
    const s = (((t % 1) + 1) % 1) * n;
    const i = Math.floor(s);
    const f = s - i;
    const [a, b, c, d] = [P[(i - 1 + n) % n], P[i % n], P[(i + 1) % n], P[(i + 2) % n]];
    const cr = (p0, p1, p2, p3) =>
      0.5 * (2 * p1 + (p2 - p0) * f + (2 * p0 - 5 * p1 + 4 * p2 - p3) * f * f + (3 * p1 - p0 - 3 * p2 + p3) * f * f * f);
    return [cr(a[0], b[0], c[0], d[0]), cr(a[1], b[1], c[1], d[1])];
  };
}

/** Lo mismo con extremos: la curva empieza en el primer punto y acaba en el último. */
function abierta(P) {
  const Q = [P[0], ...P, P[P.length - 1]];
  const n = P.length - 1;
  return (t) => {
    const s = Math.min(Math.max(t, 0), 1) * n;
    const i = Math.min(Math.floor(s), n - 1);
    const f = s - i;
    const [a, b, c, d] = [Q[i], Q[i + 1], Q[i + 2], Q[i + 3]];
    const cr = (p0, p1, p2, p3) =>
      0.5 * (2 * p1 + (p2 - p0) * f + (2 * p0 - 5 * p1 + 4 * p2 - p3) * f * f + (3 * p1 - p0 - 3 * p2 + p3) * f * f * f);
    return [cr(a[0], b[0], c[0], d[0]), cr(a[1], b[1], c[1], d[1])];
  };
}

/** La dirección de una curva paramétrica en t, para orientar su punta. */
const tangente = (r, t) => {
  const [a, b] = [r(t - 0.004), r(t + 0.004)];
  return [b[0] - a[0], b[1] - a[1]];
};

/* ── 1 a 5 · qué expresión tiene el campo ──────────────────────────── */

function unCampo(id, titulo, desc, F, { x, y, xs, ys, largo, marcasX, marcasY, ancho, alto, cuadrado = false }) {
  const l = clases(lienzo({ id, x, y, ancho, alto, cuadrado, titulo, desc }));
  campo(l, F, xs, ys, { largo });
  l.ejes({ nombreX: 'x', nombreY: 'y', marcasX, marcasY });
  return l.svg();
}

const campoVertical = unCampo(
  'cq8-campo-0-x',
  'Un campo de flechas verticales en el semiplano superior',
  'Una malla de flechas sobre el semiplano superior, con y de cero a ocho y medio. Todas son verticales: ' +
    'a la derecha del eje y apuntan hacia arriba y a la izquierda, hacia abajo. Son más largas cuanto más ' +
    'lejos del eje y; junto a él se quedan en la punta. En cada columna todas las flechas son iguales.',
  (x) => [0, x],
  { x: [-6.3, 7.1], y: [0, 8.8], xs: paso(-5.5, 6.5, 1), ys: paso(0.9, 8.1, 0.9), largo: 22, marcasX: [-4, -2, 2, 4, 6], marcasY: [2, 4, 6, 8] },
);

const campoCubico = unCampo(
  'cq8-campo-0-x3',
  'Un campo de flechas verticales que crecen muy deprisa',
  'Una malla de flechas verticales entre x igual a menos cuatro y x igual a cuatro. A la derecha del eje y ' +
    'apuntan hacia arriba y a la izquierda, hacia abajo. Junto al eje se quedan en la punta, y crecen muy ' +
    'deprisa al alejarse: las de x igual a cuatro son mucho más largas que las de x igual a dos. En cada ' +
    'columna todas son iguales.',
  (x) => [0, x ** 3],
  { x: [-4.5, 4.7], y: [-2.3, 2.3], xs: paso(-4, 4, 2 / 3), ys: paso(-1.8, 1.8, 0.6), largo: 26, marcasX: [-4, -2, 2, 4], marcasY: [-2, -1, 1, 2] },
);

const campoY2 = unCampo(
  'cq8-campo-y2-0',
  'Un campo de flechas horizontales, todas hacia la derecha',
  'Una malla de flechas horizontales en la banda de x entre menos uno y uno. Todas apuntan hacia la ' +
    'derecha, por encima y por debajo del eje x. Son más largas cuanto más lejos del eje x, y a la misma ' +
    'distancia por encima y por debajo miden lo mismo; junto al eje se quedan en la punta. En cada fila ' +
    'todas son iguales.',
  (x, y) => [y * y, 0],
  {
    x: [-1.12, 1.12], y: [-1.8, 1.85], ancho: 240, alto: 330, cuadrado: true,
    xs: paso(-0.9, 0.9, 0.3), ys: paso(-1.68, 1.68, 0.28), largo: 20,
    marcasX: [[-1, '-1'], [1, '1']], marcasY: [[-1, '-1'], [1, '1']],
  },
);

const campoYY1 = unCampo(
  'cq8-campo-y-y-1',
  'Un campo de flechas horizontales que cambia de sentido dos veces',
  'Una malla de flechas horizontales entre y igual a menos uno e y igual a dos. Por encima de y igual a ' +
    'uno y por debajo de y igual a cero apuntan hacia la derecha, más largas cuanto más lejos de esas ' +
    'rectas; en la banda de entre cero y uno apuntan hacia la izquierda y son muy cortas. En cada fila ' +
    'todas son iguales.',
  (x, y) => [y * (y - 1), 0],
  {
    x: [-1.12, 1.25], y: [-1.05, 2.05], ancho: 250, alto: 320, cuadrado: true,
    xs: paso(-0.9, 1.1, 0.25), ys: paso(-0.9, 1.9, 0.2), largo: 20,
    marcasX: [[-1, '-1'], [1, '1']], marcasY: [[-1, '-1'], [1, '1'], [2, '2']],
  },
);

const campoDiagonal = unCampo(
  'cq8-campo-h-y',
  'Un campo de flechas diagonales que cambia de sentido en el eje x',
  'Una malla de flechas, todas paralelas a la diagonal que baja hacia la derecha. Por encima del eje x ' +
    'apuntan abajo a la derecha y por debajo, arriba a la izquierda. Son más largas cuanto más lejos del ' +
    'eje x, y junto a él se quedan en la punta. En cada fila todas las flechas son iguales.',
  (x, y) => [y, -y],
  { x: [-5.2, 5.2], y: [-4.6, 4.6], cuadrado: true, xs: paso(-4.5, 4.5, 0.75), ys: paso(-4.2, 4.2, 0.6), largo: 18, marcasX: [-4, -2, 2, 4], marcasY: [-4, -2, 2, 4] },
);

/* ── 6 · tres campos y tres expresiones ────────────────────────────── */

const tresCampos = mosaico({
  id: 'cq8-tres-campos',
  titulo: 'Tres campos vectoriales alrededor del origen',
  desc:
    'Tres recuadros con una malla de flechas cada uno. En el (1), las flechas salen del origen en todas ' +
    'direcciones y son más largas cuanto más lejos de él; junto al origen se quedan en la punta. En el (2), ' +
    'también salen del origen, pero todas miden lo mismo. En el (3), las flechas giran alrededor del origen ' +
    'en sentido horario: arriba apuntan a la derecha y a la derecha, hacia abajo; son más largas cuanto más ' +
    'lejos del origen.',
  columnas: 3,
  ancho: 150,
  alto: 150,
  celdas: [
    ['(1)', (x, y) => [x, y], false],
    ['(2)', (x, y) => [x / Math.hypot(x, y), y / Math.hypot(x, y)], true],
    ['(3)', (x, y) => [y, -x], false],
  ].map(([etiqueta, F, unitario]) => ({
    etiqueta,
    x: [-2.5, 2.5],
    y: [-2.5, 2.5],
    dibuja: (p) => {
      clases(p);
      campo(p, F, paso(-2.2, 2.2, 0.55), paso(-2.2, 2.2, 0.55), { largo: 11, unitario });
      p.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-2, 2], marcasY: [-2, 2] });
    },
  })),
});

/* ── 8 · el signo del trabajo en cinco trayectorias ────────────────── */

const cincoTrayectorias = (() => {
  const l = clases(
    lienzo({
      id: 'cq8-cinco-caminos',
      x: [-10.4, 10.4],
      y: [-7.6, 7.8],
      titulo: 'El campo unitario y cinco trayectorias',
      desc:
        'Una malla de flechas verticales, todas del mismo largo: por encima del eje x apuntan hacia arriba y ' +
        'por debajo, hacia abajo. Sobre ellas, cinco trayectorias rectas con su sentido. C₁ es horizontal, ' +
        'por encima del eje, y va hacia la derecha. C₂ es vertical, a la izquierda y por debajo del eje, y ' +
        'baja. C₃ es vertical, empieza por debajo del eje, lo cruza y sube hasta quedar por encima. C₄ es ' +
        'vertical, por encima del eje, y sube. C₅ es vertical, a la derecha y por debajo del eje, y sube ' +
        'hasta casi tocarlo.',
    }),
  );
  campo(l, (x, y) => [0, Math.sign(y)], paso(-9.5, 9.5, 1), [...paso(-7, -1, 1), ...paso(1, 7, 1)], {
    largo: 12,
    unitario: true,
  });
  const tramos = [
    ['C₁', [-9, 5.3], [-1, 5.3], [-5, 5.3], { dx: -2, dy: -10, anclaje: 'end' }, [-9, 5.3]],
    ['C₂', [-8.5, -1.6], [-8.5, -6.4], [-8.5, -2.6], { dx: -6, dy: 4, anclaje: 'end' }, [-8.5, -1.6]],
    ['C₃', [-3.5, -5.6], [-3.5, 2.8], [-3.5, -1.2], { dx: 0, dy: 16, anclaje: 'middle' }, [-3.5, -5.6]],
    ['C₄', [3.5, 0.8], [3.5, 7.1], [3.5, 5.2], { dx: 7, dy: 4, anclaje: 'start' }, [3.5, 0.8]],
    ['C₅', [6.5, -6.5], [6.5, -0.3], [6.5, -3.2], { dx: 0, dy: 16, anclaje: 'middle' }, [6.5, -6.5]],
  ];
  for (const [nombre, a, b, en, pos, donde] of tramos) {
    l.poli([a, b], { clase: 'c' });
    punta(l, en, [b[0] - a[0], b[1] - a[1]]);
    l.rotulo(donde[0], donde[1], nombre, { color: 'var(--d1)', ...pos });
  }
  l.ejes({ nombreX: 'x', nombreY: 'y' });
  return l.svg();
})();

/* ── 9 · tres segmentos paralelos en el campo (x, y) ───────────────── */

const tresSegmentos = (() => {
  const l = clases(
    lienzo({
      id: 'cq8-tres-segmentos',
      x: [-1.9, 8.2],
      y: [-1.9, 5.9],
      cuadrado: true,
      titulo: 'El campo (x, y) con todas las flechas del mismo largo y tres segmentos paralelos',
      desc:
        'Una malla de flechas del mismo largo que apuntan en dirección contraria al origen. Encima, tres ' +
        'segmentos paralelos de la misma longitud, los tres en la dirección de la diagonal y recorridos ' +
        'hacia arriba a la derecha. C₁ va del punto uno, cero coma dos al tres, dos coma dos. C₂, del uno, dos ' +
        'al tres, cuatro. C₃, del cinco, tres coma dos al siete, cinco coma dos: es el más alejado del origen.',
    }),
  );
  campo(l, (x, y) => [x, y], sinEje(paso(-1.5, 7.5, 0.75)), sinEje(paso(-1.5, 5.25, 0.75)), { largo: 11, unitario: true });
  const segs = [
    ['C₁', [1, 0.2], [3, 2.2], { dx: -7, dy: 2, anclaje: 'end' }],
    ['C₂', [1, 2], [3, 4], { dx: -7, dy: 2, anclaje: 'end' }],
    ['C₃', [5, 3.2], [7, 5.2], { dx: -7, dy: 2, anclaje: 'end' }],
  ];
  for (const [nombre, a, b, pos] of segs) {
    l.poli([a, b], { clase: 'c' });
    punta(l, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], [1, 1]);
    l.rotulo(a[0], a[1] + 0.3, nombre, { color: 'var(--d1)', ...pos });
  }
  l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [2, 4, 6, 8], marcasY: [2, 4] });
  return l.svg();
})();

/* ── 10 · un campo de gradientes ───────────────────────────────────── */

const gradiente = unCampo(
  'cq8-gradiente',
  'Un campo de gradientes de flechas horizontales hacia el eje y',
  'Una malla de flechas horizontales. A la izquierda del eje y apuntan hacia la derecha y a la derecha ' +
    'del eje, hacia la izquierda: todas hacia el eje y. Son más largas cuanto más lejos de él, y junto al ' +
    'eje se quedan en la punta. En cada columna todas son iguales.',
  (x) => [-2 * x, 0],
  { x: [-10, 10], y: [-9.8, 9.8], cuadrado: true, xs: paso(-9.1, 9.1, 1.3), ys: paso(-8.25, 8.25, 1.5), largo: 20, marcasX: [-9, -6, -3, 3, 6, 9], marcasY: [-9, -6, -3, 3, 6, 9] },
);

/* ── 11 · tres caminos en un campo que gira ─────────────────────────── */

const tresCaminosEnUnGiro = (() => {
  const l = clases(
    lienzo({
      id: 'cq8-giro-tres-caminos',
      x: [-1.05, 1.62],
      y: [-1.12, 1.12],
      cuadrado: true,
      titulo: 'El campo (−y, x) con todas las flechas del mismo largo y tres caminos',
      desc:
        'Una malla de flechas del mismo largo que giran alrededor del origen en sentido antihorario. Encima, ' +
        'tres caminos. C₁ es el segmento que sale del origen hasta el punto uno, uno. C₂ es el segmento ' +
        'vertical x igual a uno, recorrido hacia arriba desde y igual a menos uno hasta y igual a uno. C₃ es ' +
        'el arco de la circunferencia de radio raíz de dos centrada en el origen que une esos mismos dos ' +
        'puntos por la derecha, recorrido hacia arriba.',
    }),
  );
  campo(l, (x, y) => [-y, x], paso(-0.9, 1.5, 0.2), paso(-1, 1, 0.2), { largo: 9, unitario: true });
  const R = Math.SQRT2;
  const arco = (t) => [R * Math.cos(t), R * Math.sin(t)];
  l.poli([[0, 0], [1, 1]], { clase: 'c' });
  punta(l, [0.55, 0.55], [1, 1], 'pc');
  l.poli([[1, -1], [1, 1]], { clase: 'c2' });
  punta(l, [1, 0.35], [0, 1], 'pc2');
  l.curva(arco, [-Math.PI / 4, Math.PI / 4], { clase: 'c3', n: 60 });
  punta(l, arco(0.12), tangente(arco, 0.12), 'pc3');
  l.rotulo(0.45, 0.55, 'C₁', { color: 'var(--d1)', anclaje: 'end', dx: -4, dy: -2 });
  l.rotulo(1, -0.45, 'C₂', { color: 'var(--alt)', anclaje: 'end', dx: -6, dy: 4 });
  l.rotulo(...arco(-0.45), 'C₃', { color: 'var(--d2)', anclaje: 'start', dx: 6, dy: 4 });
  l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1], marcasY: [-1, 1] });
  return l.svg();
})();

/* ── 12 · una trayectoria en escalera ──────────────────────────────── */

const escalera = (() => {
  const l = clases(
    lienzo({
      id: 'cq8-escalera',
      x: [-0.4, 10.6],
      y: [-0.4, 8.7],
      cuadrado: true,
      titulo: 'El campo (x + y, x − y) con todas las flechas del mismo largo y una trayectoria en escalera',
      desc:
        'Una malla de flechas del mismo largo en el primer cuadrante: abajo a la derecha apuntan hacia arriba ' +
        'a la derecha y arriba a la izquierda, hacia abajo a la derecha. Encima, la trayectoria C, en tres ' +
        'tramos rectos: del punto cero, cuatro va hacia la derecha hasta el cuatro, cuatro; sube hasta el ' +
        'cuatro, seis, y sigue hacia la derecha hasta el diez, seis.',
    }),
  );
  campo(l, (x, y) => [x + y, x - y], paso(1, 9, 1), paso(1, 8, 1), { largo: 16, unitario: true });
  const C = [[0, 4], [4, 4], [4, 6], [10, 6]];
  l.poli(C, { clase: 'c' });
  punta(l, [2, 4], [1, 0]);
  punta(l, [4, 5.1], [0, 1]);
  punta(l, [7.4, 6], [1, 0]);
  l.rotulo(0, 4, 'C', { color: 'var(--d1)', dx: 6, dy: -9 });
  l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [2, 4, 6, 8, 10], marcasY: [2, 4, 6, 8] });
  return l.svg();
})();

/* ── 13 · un rectángulo recorrido en sentido horario ───────────────── */

const rectangulo = (() => {
  const l = clases(
    lienzo({
      id: 'cq8-rectangulo',
      x: [-0.4, 8.8],
      y: [-0.4, 7.9],
      cuadrado: true,
      titulo: 'El campo (x − y, x + y) con todas las flechas del mismo largo y un rectángulo recorrido',
      desc:
        'Una malla de flechas del mismo largo que giran en sentido antihorario alrededor del origen, que queda ' +
        'abajo a la izquierda. Encima, la trayectoria C: el rectángulo de vértices uno, dos y siete, siete, ' +
        'recorrido en sentido horario: el lado de arriba hacia la derecha, el de la derecha hacia abajo, el de ' +
        'abajo hacia la izquierda y el de la izquierda hacia arriba.',
    }),
  );
  campo(l, (x, y) => [x - y, x + y], paso(0.5, 8.5, 0.75), paso(0.5, 7.5, 0.75), { largo: 11, unitario: true });
  const R = [[1, 2], [1, 7], [7, 7], [7, 2]];
  l.poli(R, { clase: 'c', cerrar: true });
  punta(l, [4.2, 7], [1, 0]);
  punta(l, [7, 4.3], [0, -1]);
  punta(l, [3.8, 2], [-1, 0]);
  punta(l, [1, 4.7], [0, 1]);
  l.rotulo(1, 7, 'C', { color: 'var(--d1)', dx: 8, dy: 16 });
  l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 4, 7], marcasY: [2, 4, 7] });
  return l.svg();
})();

/* ── 18 a 20 · ¿es conservativo? ────────────────────────────────────── */

const campoQueGira = unCampo(
  'cq8-campo-que-gira',
  'Un campo de flechas que giran alrededor del origen',
  'Una malla de flechas que giran alrededor del origen en sentido horario: arriba apuntan hacia la ' +
    'derecha, a la derecha hacia abajo, abajo hacia la izquierda y a la izquierda hacia arriba. Son más ' +
    'largas cuanto más lejos del origen.',
  (x, y) => [y, -x],
  { x: [-12.6, 12.6], y: [-10.6, 10.6], cuadrado: true, xs: paso(-11.4, 11.4, 1.9), ys: paso(-9.5, 9.5, 1.9), largo: 20, marcasX: [-12, -6, 6, 12], marcasY: [-9, -3, 3, 9] },
);

const campoHorizontal = unCampo(
  'cq8-campo-x-0',
  'Un campo de flechas horizontales que crecen hacia la derecha',
  'Una malla de flechas en el primer cuadrante, con x de cero a ocho e y de cero a cinco. Todas son ' +
    'horizontales y apuntan hacia la derecha; son más largas cuanto más a la derecha, y en cada columna ' +
    'todas miden lo mismo.',
  (x) => [x, 0],
  { x: [-0.3, 8.8], y: [-0.3, 5.4], xs: paso(0.5, 8.1, 0.69), ys: paso(0.45, 4.95, 0.45), largo: 26, marcasX: paso(1, 8, 1), marcasY: paso(1, 5, 1) },
);

const campoPorFilas = (() => {
  const l = clases(
    /* Con la misma escala en los dos ejes, como los demás campos oblicuos:
       con la de por defecto la flecha de arriba, (1; 1,05), salía a 39° y no
       a los 45° que dice la descripción. Se gana alto y no se pierde ancho:
       estrechando la figura, las columnas se juntaban hasta que las flechas
       se tocaban y cada fila se leía como una raya. */
    lienzo({
      id: 'cq8-campo-por-filas',
      alto: 330,
      cuadrado: true,
      x: [-0.3, 15.6],
      y: [-0.3, 15],
      titulo: 'Un campo de flechas iguales en cada fila',
      desc:
        'Una malla de flechas en el primer cuadrante, con el eje horizontal t y el vertical y, sin números. ' +
        'En la fila de abajo las flechas son casi horizontales, hacia la derecha. Al subir, todas se inclinan ' +
        'hacia arriba y se alargan, hasta apuntar a unos cuarenta y cinco grados en la fila de arriba. Dentro ' +
        'de cada fila todas las flechas son iguales.',
    }),
  );
  campo(l, (t, y) => [1, y / 13], paso(1, 15, 1), paso(1, 13.6, 0.97), { largo: 20 });
  l.ejes({ nombreX: 't', nombreY: 'y' });
  return l.svg();
})();

/* ── 22 a 24 · curvas de nivel ──────────────────────────────────────── */

/**
 * El contorno de una judía, medido sobre la diapositiva 26, recorrido en
 * sentido antihorario desde abajo a la izquierda. Los puntos van a distancias
 * parecidas: con uno muy cerca de otro, la curva de Catmull-Rom hace un pico,
 * y la trayectoria del enunciado es suave.
 */
const JUDIA = [
  [-1.68, -0.22], [-1.14, -0.66], [-0.59, -1.04], [-0.07, -1.15], [0.5, -1.09], [1.05, -0.82],
  [1.38, -0.49], [1.51, -0.16], [1.51, 0.27], [1.38, 0.77], [1.05, 1.15], [0.72, 1.26], [0.28, 1.2],
  [0.12, 1.09], [-0.04, 0.82], [-0.26, 0.67], [-0.7, 0.77], [-1.14, 0.9], [-1.6, 0.98], [-1.8, 0.62],
  [-1.88, 0.1],
];
/** El parámetro en que la curva pasa por el punto k de la judía. */
const tJ = (k) => k / JUDIA.length;
/* Los puntos de la judía con nombre, para colocar rótulos, M, N y flechas. */
const J = { abajo: 3, abajoDerecha: 5, derecha: 7, arribaDerecha: 9, arribaIzquierda: 17, izquierda: 19, abajoIzquierda: 0 };

/**
 * Las curvas de nivel de un valle: judías anidadas, más juntas por abajo.
 * Cada una es la judía escalada, con el centro más bajo cuanto más pequeña.
 */
const ESCALA = { 2: 0.3, 5: 0.52, 8: 0.73, 11: 0.92, 14: 1.1 };
const nivel = (L) => {
  const s = ESCALA[L];
  const [cx, cy] = [0, -0.6 + 0.6 * s];
  return cerrada(JUDIA.map(([x, y]) => [cx + s * (x + 0.18), cy + s * (y - 0.05)]));
};
/** El punto k de la judía en la curva de nivel L. */
const enNivel = (L, k) => nivel(L)(tJ(k));

/* Dónde va el número de cada curva: el 2 abajo, el 5 abajo a la izquierda y
   los demás arriba a la izquierda, como en las diapositivas. */
const ROTULO_NIVEL = { 2: J.abajo, 5: J.abajoIzquierda, 8: J.arribaIzquierda, 11: J.arribaIzquierda, 14: J.arribaIzquierda };

function curvasDeNivel(l, niveles) {
  for (const L of niveles) {
    l.curva(nivel(L), [0, 1], { clase: 'nv', n: 160, cerrar: true });
    const [x, y] = enNivel(L, ROTULO_NIVEL[L]);
    l.rotulo(x, y, String(L), { color: 'var(--graphite)', anclaje: 'middle', dy: 4 });
  }
}

function puntoMN(l, p, nombre, pos) {
  l.punto(p[0], p[1], { r: 3.6 });
  l.rotulo(p[0], p[1], nombre, { color: 'var(--live)', ...pos });
}

const nivelesYTrayectoria = (() => {
  const l = clases(
    lienzo({
      id: 'cq8-niveles-camino',
      x: [-2.15, 2.25],
      y: [-1.45, 2.08],
      cuadrado: true,
      titulo: 'Curvas de nivel de F y una trayectoria de M a N',
      desc:
        'Unas curvas de nivel cerradas y anidadas, con forma de judía, rotuladas de dentro afuera con sus ' +
        'valores: dos, cinco, ocho, once y catorce. Arriba a la derecha asoma un trozo de la curva de nivel ' +
        'diecisiete. El punto M está sobre la curva de nivel cinco, abajo a la derecha, y el punto N sobre la ' +
        'de diecisiete, arriba. La trayectoria C sale de M, sube dando un par de curvas y cruzando las de ' +
        'nivel ocho, once y catorce, y llega a N.',
    }),
  );
  curvasDeNivel(l, [2, 5, 8, 11, 14]);
  const d17 = abierta([[0.02, 2.06], [0.18, 1.76], [0.5, 1.6], [0.95, 1.56], [1.45, 1.64], [1.85, 1.82], [2.2, 2.06]]);
  l.curva(d17, [0, 1], { clase: 'nv', n: 80 });
  l.rotulo(1.95, 1.88, '17', { color: 'var(--graphite)', anclaje: 'middle', dy: 4 });
  const M = enNivel(5, J.abajoDerecha);
  const N = d17(1 / 6);
  const C = abierta([M, [0.95, -0.55], [1.05, -0.1], [0.82, 0.35], [0.7, 0.8], [0.95, 1.15], [0.8, 1.55], N]);
  l.curva(C, [0, 1], { clase: 'c', n: 120 });
  punta(l, C(0.24), tangente(C, 0.24));
  puntoMN(l, M, 'M', { anclaje: 'middle', dy: 16 });
  puntoMN(l, N, 'N', { anclaje: 'end', dx: -7, dy: 4 });
  l.rotulo(...C(0.6), 'C', { color: 'var(--d1)', dx: 8, dy: 4 });
  return l.svg();
})();

const nivelesYFragmento = (() => {
  const l = clases(
    lienzo({
      id: 'cq8-niveles-fragmento',
      x: [-2.15, 2.25],
      y: [-1.45, 1.6],
      cuadrado: true,
      titulo: 'Curvas de nivel de F y un trozo de una de ellas, de M a N',
      desc:
        'Unas curvas de nivel cerradas y anidadas, con forma de judía, rotuladas de dentro afuera con sus ' +
        'valores: dos, cinco, ocho, once y catorce. Los puntos M y N están los dos sobre la curva de nivel ' +
        'cinco: M abajo a la derecha y N a la izquierda. La trayectoria C es el trozo de esa misma curva que ' +
        'va de M a N por arriba, pasando por la muesca de la judía.',
    }),
  );
  curvasDeNivel(l, [2, 5, 8, 11, 14]);
  const k5 = nivel(5);
  const [tM, tN] = [tJ(J.abajoDerecha), tJ(J.izquierda)];
  l.curva(k5, [tM, tN], { clase: 'c', n: 120 });
  punta(l, k5(tJ(10.5)), tangente(k5, tJ(10.5)));
  puntoMN(l, k5(tM), 'M', { anclaje: 'middle', dy: 16 });
  puntoMN(l, k5(tN), 'N', { anclaje: 'end', dx: -7, dy: 4 });
  l.rotulo(...k5(tJ(8.2)), 'C', { color: 'var(--d1)', dx: 7, dy: -5 });
  return l.svg();
})();

const nivelesYCurvaOrientada = (() => {
  const l = clases(
    lienzo({
      id: 'cq8-niveles-orientada',
      x: [-2.15, 2.25],
      y: [-1.45, 1.6],
      cuadrado: true,
      titulo: 'Curvas de nivel de F y una curva orientada entre M y N',
      desc:
        'Unas curvas de nivel cerradas y anidadas, con forma de judía, rotuladas de dentro afuera con sus ' +
        'valores: dos, cinco, ocho, once y catorce. El punto M está sobre la curva de nivel cinco, a la ' +
        'derecha, y el punto N sobre la de catorce, arriba a la derecha. La curva C sale de N, baja por fuera ' +
        'de la de once hasta abajo del todo y vuelve hacia dentro hasta M. La flecha, en el tramo que baja, ' +
        'dice que se recorre de N a M.',
    }),
  );
  curvasDeNivel(l, [2, 5, 8, 11, 14]);
  const M = enNivel(5, J.derecha);
  const N = enNivel(14, J.arribaDerecha);
  const C = abierta([N, [1.78, 0.35], [1.74, -0.12], [1.6, -0.52], [1.32, -0.82], [1.02, -0.86], M]);
  l.curva(C, [0, 1], { clase: 'c', n: 120 });
  punta(l, C(0.25), tangente(C, 0.25));
  puntoMN(l, M, 'M', { anclaje: 'end', dx: -6, dy: 4 });
  puntoMN(l, N, 'N', { anclaje: 'start', dx: 7, dy: -4 });
  l.rotulo(...C(0.45), 'C', { color: 'var(--d1)', dx: 9, dy: 4 });
  return l.svg();
})();

/* ── 26 a 28 · Green en una curva cerrada ──────────────────────────── */

function greenEnLaJudia(id, nombre, F, descCampo) {
  const l = clases(
    lienzo({
      id,
      x: [-2.5, 2.7],
      y: [-2.1, 2.1],
      cuadrado: true,
      titulo: `El campo ${nombre} y una curva cerrada recorrida en sentido antihorario`,
      desc:
        `Una malla de flechas: ${descCampo} Encima, una curva cerrada suave con forma de judía, con una ` +
        'muesca arriba, que rodea el origen. La región que encierra está sombreada, y una flecha en su borde ' +
        'de arriba, a la izquierda, apunta hacia la izquierda: la curva se recorre en sentido antihorario.',
    }),
  );
  const r = cerrada(JUDIA);
  l.region([{ f: r, en: [0, 1], n: 160 }]);
  campo(l, F, paso(-2.25, 2.45, 0.34), paso(-1.85, 1.85, 0.34), { largo: 12 });
  l.curva(r, [0, 1], { clase: 'c', n: 160, cerrar: true });
  /* La flecha, en el borde de arriba a la izquierda: recorrerla en sentido
     antihorario es ir por ahí hacia la izquierda. */
  punta(l, r(tJ(J.arribaIzquierda + 0.5)), tangente(r, tJ(J.arribaIzquierda + 0.5)));
  l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-2, -1, 1, 2], marcasY: [-2, -1, 1, 2] });
  return l.svg();
}

const greenU = greenEnLaJudia(
  'cq8-green-u',
  'U = (−y, 0)',
  (x, y) => [-y, 0],
  'todas horizontales, hacia la izquierda por encima del eje x y hacia la derecha por debajo, más largas ' +
    'cuanto más lejos del eje.',
);
const greenV = greenEnLaJudia(
  'cq8-green-v',
  'V = (0, x)',
  (x) => [0, x],
  'todas verticales, hacia arriba a la derecha del eje y y hacia abajo a la izquierda, más largas cuanto ' +
    'más lejos del eje.',
);
const greenS = greenEnLaJudia(
  'cq8-green-s',
  'S = (−y, x)',
  (x, y) => [-y, x],
  'giran alrededor del origen en sentido antihorario y son más largas cuanto más lejos de él.',
);

/* ── 29 · dos funciones que se diferencian en una constante ─────────── */

const dosFunciones = (() => {
  const l = clases(
    lienzo({
      id: 'cq8-dos-funciones',
      x: [-0.5, 7],
      y: [-0.5, 4.1],
      titulo: 'Las gráficas de f y g, separadas por la constante M',
      desc:
        'Dos curvas con forma de arco, una encima de la otra y con la misma forma: la de arriba es f(t) y la ' +
        'de abajo, g(t). Una flecha doble vertical entre las dos, rotulada M, marca que la distancia entre ' +
        'ellas es la misma en todos los puntos.',
    }),
  );
  const f = (t) => 3.3 - 0.3 * (t - 3.5) ** 2;
  const g = (t) => f(t) - 1.55;
  l.curva(f, [1.2, 5.8], { clase: 'c' });
  l.curva(g, [1.2, 5.8], { clase: 'c' });
  /* Los ejes sin números ni nombre en el vertical, como en la diapositiva:
     por eso no van con ejes(), que los pide. */
  l.poli([[-0.3, 0], [6.8, 0]], { clase: 'eje' }).poli([[0, -0.3], [0, 3.9]], { clase: 'eje' });
  l.rotulo(6.8, 0, 't', { color: 'var(--faint)', anclaje: 'end', dy: -7, pequeno: true });
  l.poli([[4.7, g(4.7) + 0.1], [4.7, f(4.7) - 0.1]], { clase: 'c2' });
  punta(l, [4.7, f(4.7) - 0.1], [0, 1], 'pc2');
  punta(l, [4.7, g(4.7) + 0.1], [0, -1], 'pc2');
  l.rotulo(4.7, (f(4.7) + g(4.7)) / 2, 'M', { color: 'var(--alt)', dx: 8, dy: 4 });
  l.rotulo(2.3, f(2.3), 'f(t)', { color: 'var(--d1)', anclaje: 'end', dx: -6, dy: -6 });
  l.rotulo(2.3, g(2.3), 'g(t)', { color: 'var(--d1)', anclaje: 'end', dx: -6, dy: -6 });
  return l.svg();
})();

const figuras = {
  'campo-vertical-que-cambia-de-sentido-en-x': campoVertical,
  'campo-vertical-que-crece-deprisa': campoCubico,
  'campo-horizontal-hacia-la-derecha': campoY2,
  'campo-horizontal-con-dos-cambios-de-sentido': campoYY1,
  'campo-diagonal-constante-por-filas': campoDiagonal,
  'asociar-tres-campos-con-su-expresion': tresCampos,
  'signo-del-trabajo-en-cinco-trayectorias': cincoTrayectorias,
  'tres-segmentos-paralelos-en-x-y': tresSegmentos,
  'identificar-f-por-su-gradiente': gradiente,
  'ordenar-tres-trabajos-en-un-giro': tresCaminosEnUnGiro,
  'trabajo-aproximado-en-una-escalera': escalera,
  'trabajo-en-un-rectangulo': rectangulo,
  'conservativo-campo-que-gira': campoQueGira,
  'conservativo-campo-horizontal': campoHorizontal,
  'conservativo-campo-igual-por-filas': campoPorFilas,
  'curvas-de-nivel-y-trayectoria': nivelesYTrayectoria,
  'curvas-de-nivel-y-fragmento-de-nivel': nivelesYFragmento,
  'curvas-de-nivel-y-curva-orientada': nivelesYCurvaOrientada,
  'circulacion-de-menos-y-0-en-una-curva-cerrada': greenU,
  'circulacion-de-0-x-en-una-curva-cerrada': greenV,
  'circulacion-de-menos-y-x-en-una-curva-cerrada': greenS,
  'circulacion-con-dos-funciones-que-difieren-en-m': dosFunciones,
};

for (const [id, svg] of Object.entries(figuras)) pegaEnPregunta(BANCO, id, svg);
console.log(`${Object.keys(figuras).length} figuras pegadas en ${BANCO}`);
