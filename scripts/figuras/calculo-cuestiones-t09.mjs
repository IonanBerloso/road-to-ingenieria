/**
 * Las figuras de las cuestiones del tema 9 de Cálculo, las de las
 * diapositivas de «Ecuaciones diferenciales» (fase E3 de la auditoría del 27
 * de septiembre de 2026).
 *
 * Se redibujan, no se recortan del PDF (§08), y se calculan con el lienzo.
 * Las curvas salen de sus fórmulas: las tres de la diapositiva 4 que pueden
 * ser solución son y = Ce^x − x − 1 con los mínimos medidos sobre la
 * diapositiva a 300 ppp, y la que no, y = e^(x−1) − x − 2, es la del
 * original; las parábolas de la 5 son las del original, leídas en sus cortes
 * con los ejes. Las curvas de nivel de la 9 son de un potencial inventado,
 * porque la diapositiva no da ninguno: lo que importa es que P esté en la de
 * 17 y Q en la de 5, y se comprueba al generar.
 *
 * La foto de los plátanos (7) y el dibujo de los muelles (13) son decorado y
 * no se redibujan.
 *
 *   BANCO=<ruta> node scripts/figuras/calculo-cuestiones-t09.mjs
 *
 * Pega cada figura en su pregunta; si la pregunta ya tiene una, se para.
 */
import { lienzo } from './lienzo.mjs';
import { pegaEnPregunta } from './pegar.mjs';

/* El destino se puede cambiar para rehacerlas sobre una copia en revisión. */
const BANCO = process.env.BANCO ?? 'src/content/banco/calculo-t09.yaml';

/** Los puntos de y = g(x) desde x0 hasta que la curva pasa de `tope`. */
function hastaElTope(g, x0, x1, tope, n = 160) {
  const puntos = [];
  for (let k = 0; k <= n; k++) {
    const x = x0 + ((x1 - x0) * k) / n;
    const y = g(x);
    if (y > tope) {
      /* El último tramo se corta justo en el tope, por bisección. */
      let [a, b] = [puntos.at(-1)[0], x];
      for (let i = 0; i < 40; i++) {
        const m = (a + b) / 2;
        if (g(m) > tope) b = m;
        else a = m;
      }
      puntos.push([a, g(a)]);
      break;
    }
    puntos.push([x, y]);
  }
  return puntos;
}

/** La rejilla de la diapositiva: rectas finas en los enteros, del color de
 *  los ejes, para que ayude a leer los mínimos sin competir con las curvas. */
function rejilla(f, [x0, x1], [y0, y1]) {
  f.clase('rej', 'stroke: var(--rule); stroke-width: 1; fill: none; stroke-dasharray: 4 3;');
  for (let x = Math.ceil(x0); x <= x1; x++) if (x) f.poli([[x, y0], [x, y1]], { clase: 'rej' });
  for (let y = Math.ceil(y0); y <= y1; y++) if (y) f.poli([[x0, y], [x1, y]], { clase: 'rej' });
}

/* ── 3 · una gráfica que crece y se curva hacia arriba ──────────────── */

const grafica = (() => {
  const f = lienzo({
    id: 'cq9-grafica',
    x: [-3.3, 2.5],
    y: [-1.5, 6.3],
    titulo: 'La gráfica de y(x)',
    desc:
      'Una curva que pasa por el origen y sube en todo el dibujo, cada vez más empinada: por la ' +
      'izquierda va por debajo del eje x y casi plana, y por la derecha se dispara hacia arriba. ' +
      'Se curva hacia arriba en todos sus puntos.',
  });
  f.ejes({ nombreX: 'x', nombreY: 'y' });
  f.curva((x) => Math.exp(x) - 1, [-3.2, Math.log(7.1)], { n: 140 });
  f.rotulo(1.2, Math.exp(1.2) - 1, 'y(x)', { anclaje: 'end', dx: -10, dy: 0 });
  return f.svg();
})();

/* ── 4 · cuatro candidatas a solución de y′ = x + y ─────────────────── */

const cuatroCurvas = (() => {
  const X = [-3.3, 4.6];
  const Y = [-2.5, 3.3];
  const f = lienzo({
    id: 'cq9-cuatro-curvas',
    x: X,
    y: Y,
    titulo: 'Cuatro funciones candidatas a solución de y′ = x + y',
    desc:
      'Cuatro curvas en forma de U sobre una rejilla, todas bajan desde la izquierda, tocan fondo ' +
      'y suben cada vez más deprisa. A tiene el punto más bajo hacia menos uno coma ocho, uno ' +
      'coma ocho; B, hacia menos cero coma noventa y cinco, cero coma noventa y cinco; C, hacia ' +
      'cero coma cuarenta y cinco, menos cero coma cuarenta y cinco; y D, en uno, menos dos.',
  });
  rejilla(f, [-3.2, 4.5], [-2.4, 3.2]);
  /* Por debajo de y = 3, para que las letras no pisen la marca del eje. */
  const tope = 2.6;
  const curvas = [
    ['A', (x) => Math.exp(x + 1.8) - x - 1, -2.65],
    ['B', (x) => Math.exp(x + 0.95) - x - 1, -2.65],
    ['C', (x) => Math.exp(x - 0.45) - x - 1, -2.65],
    /* La de la diapositiva: no es solución, su mínimo está en (1, −2). */
    ['D', (x) => Math.exp(x - 1) - x - 2, -2.72],
  ];
  const finales = [];
  for (const [letra, g, x0] of curvas) {
    const p = hastaElTope(g, x0, 4.4, tope);
    f.poli(p);
    finales.push([letra, p.at(-1)]);
  }
  /* Los ejes después de las curvas: la C pisa la marca del 1, y así la marca
     queda encima con su halo. */
  f.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-3, -2, -1, 1, 2, 3, 4], marcasY: [-2, -1, 1, 2, 3] });
  for (const [letra, fin] of finales) f.rotulo(...fin, letra, { anclaje: 'start', dx: 5, dy: 2 });
  return f.svg();
})();

/* ── 5 · la curva de los puntos de inflexión de y′ = x² − y ─────────── */

const inflexion = (() => {
  const f = lienzo({
    id: 'cq9-inflexion',
    alto: 300,
    x: [-3.3, 5.3],
    y: [-4.5, 5.9],
    titulo: 'Tres parábolas candidatas',
    desc:
      'Tres parábolas. A se abre hacia abajo, con el vértice arriba, en uno, cuatro coma cinco, y ' +
      'corta el eje x en menos dos y en cuatro. B se abre hacia arriba, con el vértice en uno, menos ' +
      'uno, y pasa por el origen y por dos, cero. C es como B pero tres unidades más abajo: vértice ' +
      'en uno, menos cuatro, y corta el eje x en menos uno y en tres.',
  });
  f.clase('c3', 'stroke: var(--d4); stroke-width: 2.8; fill: none;');
  const arriba = 5.75;
  const abajo = -4.4;
  /* A: la parábola hacia abajo que corta en −2 y 4 y vale 4 en x = 0. */
  f.curva((x) => 4 + x - (x * x) / 2, [1 - Math.sqrt(2 * (4.5 - abajo)), 1 + Math.sqrt(2 * (4.5 - abajo))], { clase: 'c' });
  /* B: y = x² − 2x.  C: y = x² − 2x − 3. */
  f.curva((x) => x * x - 2 * x, [1 - Math.sqrt(1 + arriba), 1 + Math.sqrt(1 + arriba)], { clase: 'c2' });
  f.curva((x) => x * x - 2 * x - 3, [1 - Math.sqrt(4 + arriba), 1 + Math.sqrt(4 + arriba)], { clase: 'c3' });
  /* Los ejes después de las parábolas, que cortan el eje x justo donde van
     las marcas: así quedan encima con su halo. */
  f.ejes({
    nombreX: 'x',
    nombreY: 'y',
    marcasX: [-3, -2, -1, 1, 2, 3, 4, 5],
    marcasY: [-4, -3, -2, -1, 1, 2, 3, 4, 5],
  });
  f.rotulo(1, 4.5, 'A', { anclaje: 'middle', dy: -8, color: 'var(--d1)' });
  f.rotulo(1, -1, 'B', { anclaje: 'middle', dy: 16, color: 'var(--alt)' });
  f.rotulo(1, -4, 'C', { anclaje: 'middle', dy: 16, color: 'var(--d4)' });
  return f.svg();
})();

/* ── 9 · el trabajo entre dos curvas de nivel ──────────────────────── */

/*
 * Un potencial con curvas de nivel anidadas y abolladas por arriba, como las
 * de la diapositiva: un cono de base elíptica, que da niveles igual de
 * separados, más una joroba que empuja hacia dentro la parte de arriba de
 * los niveles bajos. Las curvas se trazan por rayos desde el origen, así que
 * cada rayo tiene que cortar cada nivel una sola vez: se comprueba.
 */
const U = (x, y) =>
  -1 + 3 * Math.hypot(x / 1.25, y) + 4 * Math.exp(-((x + 0.3) ** 2 + (y - 1.9) ** 2) / 2.6);

function radioDelNivel(C, t) {
  const [c, s] = [Math.cos(t), Math.sin(t)];
  let [a, b] = [0.02, 12];
  if (U(a * c, a * s) > C || U(b * c, b * s) < C) throw new Error(`el nivel ${C} no corta el rayo ${t}`);
  for (let i = 0; i < 60; i++) {
    const m = (a + b) / 2;
    if (U(m * c, m * s) > C) b = m;
    else a = m;
  }
  return a;
}

for (let k = 0; k < 360; k++) {
  const t = (2 * Math.PI * k) / 360;
  let antes = -Infinity;
  for (let r = 0.02; r < 8; r += 0.01) {
    const u = U(r * Math.cos(t), r * Math.sin(t));
    if (u <= antes) throw new Error(`el potencial no crece a lo largo del rayo ${k}°`);
    antes = u;
  }
}

/** Catmull-Rom por unos puntos de paso: una curva suave, calculada. */
function suave(paso, n = 24) {
  const p = [paso[0], ...paso, paso.at(-1)];
  const salida = [];
  for (let i = 1; i < p.length - 2; i++) {
    for (let k = 0; k < n; k++) {
      const t = k / n;
      const t2 = t * t;
      const t3 = t2 * t;
      const eje = (j) =>
        0.5 *
        (2 * p[i][j] +
          (-p[i - 1][j] + p[i + 1][j]) * t +
          (2 * p[i - 1][j] - 5 * p[i][j] + 4 * p[i + 1][j] - p[i + 2][j]) * t2 +
          (-p[i - 1][j] + 3 * p[i][j] - 3 * p[i + 1][j] + p[i + 2][j]) * t3);
      salida.push([eje(0), eje(1)]);
    }
  }
  salida.push(paso.at(-1));
  return salida;
}

const niveles = (() => {
  const f = lienzo({
    id: 'cq9-niveles',
    alto: 300,
    x: [-7.9, 7.9],
    y: [-6.3, 6.5],
    cuadrado: true,
    titulo: 'Seis curvas de nivel y un camino de Q a P',
    desc:
      'Seis curvas cerradas, unas dentro de otras, con su valor de C escrito encima: 2 la más ' +
      'pequeña, en el centro, y luego 5, 8, 11, 14 y 17 hacia fuera. Las de dentro están ' +
      'abolladas por arriba, como un riñón. Q está abajo a la derecha, sobre la curva de 5, y P ' +
      'arriba, sobre la de 17. Un camino L con revueltas sale de Q, cruza la de 8, cruza tres ' +
      'veces la de 11 —sale, vuelve a entrar y sale otra vez—, cruza la de 14, se asoma por fuera ' +
      'de la de 17 y vuelve a ella en P; una flecha marca que va de Q a P.',
  });
  const valores = [2, 5, 8, 11, 14, 17];
  /** El punto del nivel C en la dirección t, en radianes. */
  const nivel = (C) => (t) => {
    const r = radioDelNivel(C, t);
    return [r * Math.cos(t), r * Math.sin(t)];
  };
  const punto = (C, grados) => nivel(C)((grados * Math.PI) / 180);
  for (const C of valores) f.curva(nivel(C), [0, 2 * Math.PI], { n: 200, cerrar: true });
  /* Los valores, sobre su curva, a la izquierda. */
  for (const C of valores) {
    const [x, y] = punto(C, C === 2 ? 200 : 162);
    f.rotulo(x, y, String(C), { anclaje: 'middle', dy: 4, color: 'var(--graphite)' });
  }
  const Q = punto(5, -52);
  const P = punto(17, 98);
  /* El camino L, por puntos de paso que se dan por su nivel y su ángulo: sale
     de Q hacia fuera, cruza el 8 y el 11, vuelve a cruzar el 11 hacia
     dentro, sale otra vez, pasa por fuera del 17 y entra en P. */
  const paso = [[6.5, -28], [9.5, 0], [12.5, 26], [9.8, 50], [15.5, 70], [18.3, 86]].map(([C, g]) => punto(C, g));
  const L = suave([Q, ...paso, P], 30);
  f.clase('punta', 'fill: var(--alt); stroke: none;');
  f.poli(L, { clase: 'c2' });
  const medio = Math.floor(L.length * 0.3);
  f.flecha(L[medio - 1], L[medio + 1], { clase: 'c2', color: 'var(--alt)', punta: 10 });
  f.rotulo(...paso[4], 'L', { anclaje: 'start', dx: 9, dy: 4, color: 'var(--alt)' });
  f.punto(...Q, { clase: 'o', r: 4.5 });
  f.punto(...P, { clase: 'o', r: 4.5 });
  f.rotulo(...Q, 'Q', { anclaje: 'middle', dy: 17, color: 'var(--flag)' });
  f.rotulo(...P, 'P', { anclaje: 'end', dx: -7, dy: -5, color: 'var(--flag)' });

  /* Lo que la pregunta da por hecho: P en la de 17 y Q en la de 5. */
  if (Math.abs(U(...P) - 17) > 1e-6 || Math.abs(U(...Q) - 5) > 1e-6) throw new Error('P o Q no están en su nivel');
  return f.svg();
})();

/* ── 11 · el mapa de pendientes de y′ = 3y^(2/3) ───────────────────── */

const pendientes = (() => {
  const f = lienzo({
    id: 'cq9-pendientes',
    alto: 290,
    x: [-0.35, 4.5],
    y: [-0.4, 5.5],
    titulo: 'El mapa de pendientes de y′ = 3 y elevado a dos tercios',
    desc:
      'Una retícula de trocitos que marcan la pendiente en cada punto del primer cuadrante: casi ' +
      'planos cerca del eje x y cada vez más empinados al subir. Resaltadas, dos soluciones que ' +
      'salen del origen: la recta y igual a cero, sobre el eje x, y la curva y igual a x al cubo, ' +
      'que sube desde el origen y se hace casi vertical hacia x igual a uno coma siete.',
  });
  f.clase('campo', 'stroke: var(--faint); stroke-width: 1.2; fill: none;');
  const sx = f.X(1) - f.X(0);
  const sy = f.Y(0) - f.Y(1);
  const largo = 9;
  /* Las filas empiezan en 0,45 para dejar sitio al rótulo de y = 0. */
  for (let x = 0.2; x <= 4.3; x += 0.25) {
    for (let y = 0.45; y <= 5.3; y += 0.3) {
      const m = 3 * Math.cbrt(y * y);
      /* Medio trocito de `largo` píxeles, se dibuje como se dibuje la escala. */
      const k = largo / 2 / Math.hypot(sx, sy * m);
      f.poli([[x - k, y - k * m], [x + k, y + k * m]], { clase: 'campo' });
    }
  }
  f.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2, 3, 4], marcasY: [1, 2, 3, 4, 5] });
  f.poli([[0, 0], [4.4, 0]], { clase: 'c2' });
  f.curva((x) => x ** 3, [0, Math.cbrt(5.4)], { n: 120 });
  f.rotulo(Math.cbrt(4.2), 4.2, 'y = x³', { anclaje: 'start', dx: 8, dy: 4, color: 'var(--d1)' });
  f.rotulo(3.4, 0, 'y = 0', { anclaje: 'middle', dy: -8, color: 'var(--alt)' });
  return f.svg();
})();

const figuras = {
  'solucion-por-su-grafica': grafica,
  'y-prima-igual-a-x-mas-y': cuatroCurvas,
  'curva-de-los-puntos-de-inflexion': inflexion,
  'trabajo-entre-dos-niveles': niveles,
  'dos-soluciones-por-el-origen': pendientes,
};

for (const [id, svg] of Object.entries(figuras)) pegaEnPregunta(BANCO, id, svg);
console.log(`${Object.keys(figuras).length} figuras pegadas en ${BANCO}`);
