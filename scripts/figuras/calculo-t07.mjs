/**
 * Las figuras del tema 7 de Cálculo: la integral múltiple.
 *
 * Aquí casi todo son sólidos, y un sólido en un papel se entiende con **dos**
 * dibujos, no con uno: el corte por el plano que contiene el eje —de donde
 * salen los límites de z— y la proyección sobre XY —de donde salen los de r o
 * los de x e y—. Esa es la pareja que estas figuras ponen lado a lado, que es
 * además el orden en que hay que dibujarlas en el examen.
 *
 *     node scripts/figuras/calculo-t07.mjs
 */

import { lienzo, mosaico, vista3d } from './lienzo.mjs';
import { pega } from './pegar.mjs';

const FICHERO = 'src/content/calculo/t07-integral-multiple/ejercicios.yaml';

export const figuras = [];
const fig = (id, paso, hacer) => figuras.push({ id, paso, hacer });

const aro = (cx, cy, r, n = 96) =>
  Array.from({ length: n + 1 }, (_, k) => {
    const t = (2 * Math.PI * k) / n;
    return [cx + r * Math.cos(t), cy + r * Math.sin(t)];
  });

const oval = (cx, cy, a, b, n = 120) =>
  Array.from({ length: n + 1 }, (_, k) => {
    const t = (2 * Math.PI * k) / n;
    return [cx + a * Math.cos(t), cy + b * Math.sin(t)];
  });

const entre = (arriba, abajo, a, b, n = 70) => {
  const p = [];
  for (let k = 0; k <= n; k++) { const x = a + ((b - a) * k) / n; p.push([x, arriba(x)]); }
  for (let k = 0; k <= n; k++) { const x = b + ((a - b) * k) / n; p.push([x, abajo(x)]); }
  return p;
};

/**
 * La pareja de siempre: a la izquierda el corte por XZ, a la derecha la
 * proyección sobre XY. Le das las dos funciones de dibujo y te la monta.
 */
const corteYProyeccion = ({ id, titulo, desc, corte, proyeccion, etiquetaCorte = 'el corte por XZ', etiquetaProy = 'la proyección sobre XY' }) =>
  mosaico({
    id, titulo, desc,
    columnas: 2,
    ancho: 205,
    alto: 185,
    celdas: [
      { etiqueta: etiquetaCorte, ...corte },
      { etiqueta: etiquetaProy, ...proyeccion },
    ],
  });

/* ── 1 · un sólido y tres órdenes ────────────────────────────────────── */
fig('solido-con-tres-ordenes', 0, () => {
  const p3 = vista3d({ escalaXY: 0.8, inclinacion: 0.5 });
  const V = {
    a: p3(0, 0, 0), b: p3(4, 0, 0), c: p3(4, 2, 0), d: p3(0, 2, 0),
    A: p3(0, 0, 5), B: p3(4, 0, 5), C: p3(4, 2, 1), D: p3(0, 2, 1),
  };
  const l = lienzo({
    id: 'f-prisma-trapecial',
    ancho: 350, alto: 250,
    x: [-2.6, 4.6], y: [-1.6, 6.4], cuadrado: false,
    titulo: 'El prisma de base rectangular con el techo inclinado solo en la dirección y',
    desc: 'Una caja de cuatro por dos en el suelo, con el techo cortado por un plano que baja de '
      + 'altura cinco sobre el borde y igual a cero a altura uno sobre el borde y igual a dos. El '
      + 'techo no se inclina en la dirección x: todas las secciones perpendiculares al eje x son '
      + 'el mismo trapecio.',
  });
  l.poli([V.a, V.b, V.c, V.d], { clase: 'g', cerrar: true });
  l.poli([V.A, V.B, V.C, V.D], { clase: 'f', cerrar: true });
  l.poli([V.a, V.b, V.B, V.A], { clase: 'c', cerrar: true });
  l.poli([V.b, V.c, V.C, V.B], { clase: 'c', cerrar: true });
  l.poli([V.A, V.B, V.C, V.D], { clase: 'c2', cerrar: true });
  l.poli([V.d, V.D], { clase: 'g' });
  l.poli([V.a, V.A], { clase: 'g' });
  l.rotulo(...p3(4.3, 0, 0), 'x', { dx: 4, dy: 4, color: 'var(--faint)', pequeno: true });
  l.rotulo(...p3(0, 2.3, 0), 'y', { dx: -12, dy: 6, color: 'var(--faint)', pequeno: true });
  l.rotulo(...p3(0, 0, 5), 'z = 5', { dx: 6, dy: -6, color: 'var(--alt)' });
  l.rotulo(...p3(4, 2, 1), 'z = 1', { dx: 6, dy: 2, color: 'var(--alt)' });
  l.esquina(16, 18, 'techo z = 5 − 2y');
  return l.svg();
});

/* ── 2 · entre dos paraboloides ──────────────────────────────────────── */
fig('volumen-entre-dos-paraboloides', 0, () =>
  corteYProyeccion({
    id: 'f-dos-paraboloides',
    titulo: 'El corte por el plano y=0 y la elipse de la proyección',
    desc: 'A la izquierda, el corte por el plano y igual a cero: la parábola z igual a x al '
      + 'cuadrado abriendo hacia arriba desde el origen y, encima, la parábola z igual a ocho '
      + 'menos x al cuadrado abriendo hacia abajo desde z igual a ocho. Se cortan a la altura '
      + 'cuatro, en x igual a más y menos dos, y encierran una lente. A la derecha, la '
      + 'proyección: el interior de la elipse de semiejes dos en horizontal y uno en vertical.',
    corte: {
      x: [-2.9, 2.9], y: [-1, 9], cuadrado: false,
      dibuja: (l) => {
        l.poli(entre((x) => 8 - x * x, (x) => x * x, -2, 2), { clase: 'f', cerrar: true });
        l.ejes({ nombreX: 'x', nombreY: 'z', marcasX: [-2, 2], marcasY: [4, 8] });
        l.curva((x) => x * x, [-2.8, 2.8], { clase: 'c', n: 60 });
        l.curva((x) => 8 - x * x, [-2.8, 2.8], { clase: 'c2', n: 60 });
        l.punto(2, 4, { clase: 'o', r: 3.8 });
        l.punto(-2, 4, { clase: 'o', r: 3.8 });
        l.rotulo(2, 4, 'z = 4', { dx: 6, dy: 4, color: 'var(--flag)' });
      },
    },
    proyeccion: {
      x: [-2.6, 2.6], y: [-2.6, 2.6], cuadrado: true,
      dibuja: (l) => {
        l.poli(oval(0, 0, 2, 1), { clase: 'f', cerrar: true });
        l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [2], marcasY: [1] });
        l.poli(oval(0, 0, 2, 1), { clase: 'c' });
        l.rotulo(0, 0, 'x²/4 + y² ≤ 1', { dx: 0, dy: -10, anclaje: 'middle' });
      },
    },
  }));

/* ── 3 · cono y paraboloide ──────────────────────────────────────────── */
fig('cono-y-paraboloide', 0, () =>
  corteYProyeccion({
    id: 'f-cono-paraboloide',
    titulo: 'La peonza: cono por debajo, paraboloide por encima, cortándose en r igual a uno',
    desc: 'A la izquierda, el corte: dos rectas que salen del origen con pendiente uno y menos '
      + 'uno —el cono— y, encima, la parábola z igual a dos menos x al cuadrado, con el vértice '
      + 'en z igual a dos. Se cortan en x igual a más y menos uno, a la altura uno. La región '
      + 'entre las dos tiene forma de peonza: punta abajo y panza arriba. A la derecha, la '
      + 'proyección: el disco de radio uno.',
    corte: {
      x: [-1.8, 1.8], y: [-0.5, 2.5], cuadrado: false,
      dibuja: (l) => {
        l.poli(entre((x) => 2 - x * x, (x) => Math.abs(x), -1, 1), { clase: 'f', cerrar: true });
        l.ejes({ nombreX: 'x', nombreY: 'z', marcasX: [-1, 1], marcasY: [1, 2] });
        l.poli([[-1.55, 1.55], [0, 0], [1.55, 1.55]], { clase: 'c' });
        l.curva((x) => 2 - x * x, [-1.55, 1.55], { clase: 'c2', n: 60 });
        l.punto(1, 1, { clase: 'o', r: 3.8 });
        l.punto(-1, 1, { clase: 'o', r: 3.8 });
        l.rotulo(1, 1, 'r=z=1', { dx: -7, dy: -6, anclaje: 'end', color: 'var(--flag)' });
      },
    },
    proyeccion: {
      x: [-1.6, 1.6], y: [-1.6, 1.6], cuadrado: true,
      dibuja: (l) => {
        l.poli(aro(0, 0, 1), { clase: 'f', cerrar: true });
        l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1] });
        l.poli(aro(0, 0, 1), { clase: 'c' });
        l.rotulo(0, 0, 'r ≤ 1', { dx: 0, dy: -9, anclaje: 'middle' });
      },
    },
  }));

/* ── 4 · seis dobles sobre rectángulos ───────────────────────────────── */
fig('seis-dobles-sobre-rectangulos', 0, () => {
  const rect = (x0, x1, y0, y1, marcasX, marcasY) => (l) => {
    l.poli([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], { clase: 'f', cerrar: true });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX, marcasY });
    l.poli([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], { clase: 'c', cerrar: true });
  };
  const P = Math.PI;
  return mosaico({
    id: 'f-seis-rectangulos',
    titulo: 'Los seis recintos, todos rectángulos, y los dos pares que comparten recinto',
    desc: 'Seis dibujos independientes, todos rectángulos. Los apartados a y b comparten el mismo '
      + 'recinto, de cero a uno en x y de cero a dos en y: cambia el orden de integración, no la '
      + 'región. Los apartados c y d comparten otro, de menos uno a uno en x y de cero a uno en '
      + 'y. El e es el cuadrado unidad. Y el f va de cero a pi cuartos en x y de cero a pi medios '
      + 'en y.',
    columnas: 3,
    ancho: 176,
    alto: 156,
    celdas: [
      { etiqueta: '(a) dx dy', x: [-0.4, 1.6], y: [-0.5, 2.5], cuadrado: false, dibuja: rect(0, 1, 0, 2, [1], [2]) },
      { etiqueta: '(b) dy dx · el mismo', x: [-0.4, 1.6], y: [-0.5, 2.5], cuadrado: false, dibuja: rect(0, 1, 0, 2, [1], [2]) },
      { etiqueta: '(c) dx dy', x: [-1.6, 1.6], y: [-0.5, 1.5], cuadrado: false, dibuja: rect(-1, 1, 0, 1, [-1, 1], [1]) },
      { etiqueta: '(d) dy dx · el mismo', x: [-1.6, 1.6], y: [-0.5, 1.5], cuadrado: false, dibuja: rect(-1, 1, 0, 1, [-1, 1], [1]) },
      { etiqueta: '(e) cuadrado unidad', x: [-0.4, 1.5], y: [-0.4, 1.5], cuadrado: true, dibuja: rect(0, 1, 0, 1, [1], [1]) },
      {
        etiqueta: '(f) π/4 por π/2',
        x: [-0.25, 1.1], y: [-0.3, 2], cuadrado: false,
        dibuja: (l) => rect(0, P / 4, 0, P / 2, [[P / 4, 'π/4']], [[P / 2, 'π/2']])(l),
      },
    ],
  });
});

/* ── 5 · cinco recintos ──────────────────────────────────────────────── */
fig('cinco-recintos-que-hay-que-dibujar', 0, () => {
  const P = Math.PI;
  return mosaico({
    id: 'f-cinco-recintos',
    titulo: 'Los cinco recintos, y sus puntos de corte',
    desc: 'Cinco dibujos independientes. El a, entre la recta y igual a x por abajo y la parábola '
      + 'y igual a dos menos x al cuadrado por arriba, que se cortan en el punto (1,1). El b, el '
      + 'triángulo de vértices el origen, (2,0) y (0,2). El c, entre la cúbica y igual a x al '
      + 'cubo y la recta x más y igual a dos, que se cortan también en (1,1). El d, el segmento '
      + 'circular entre la cuerda que une (2,0) con (0,2) y el arco de la circunferencia de radio '
      + 'dos. Y el e, el triángulo de vértices el origen, (pi medios, 0) y (pi cuartos, pi '
      + 'cuartos).',
    columnas: 3,
    ancho: 176,
    alto: 158,
    celdas: [
      {
        etiqueta: '(a) recta y parábola',
        x: [-0.35, 1.5], y: [-0.4, 2.3], cuadrado: false,
        dibuja: (l) => {
          l.poli(entre((x) => 2 - x * x, (x) => x, 0, 1), { clase: 'f', cerrar: true });
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1], marcasY: [1, 2] });
          l.curva((x) => x, [0, 1.4], { clase: 'c' });
          l.curva((x) => 2 - x * x, [-0.3, 1.4], { clase: 'c2', n: 50 });
          l.punto(1, 1, { clase: 'o', r: 3.6 });
        },
      },
      {
        etiqueta: '(b) triángulo',
        x: [-0.4, 2.5], y: [-0.4, 2.5], cuadrado: true,
        dibuja: (l) => {
          l.poli([[0, 0], [2, 0], [0, 2]], { clase: 'f', cerrar: true });
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [2], marcasY: [2] });
          l.poli([[0, 0], [2, 0], [0, 2]], { clase: 'c', cerrar: true });
        },
      },
      {
        etiqueta: '(c) cúbica y recta',
        x: [-0.3, 1.6], y: [-0.35, 2.2], cuadrado: false,
        dibuja: (l) => {
          l.poli(entre((x) => 2 - x, (x) => x ** 3, 0, 1), { clase: 'f', cerrar: true });
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1], marcasY: [1, 2] });
          l.curva((x) => x ** 3, [0, 1.25], { clase: 'c', n: 50 });
          l.curva((x) => 2 - x, [-0.2, 1.5], { clase: 'c2' });
          l.punto(1, 1, { clase: 'o', r: 3.6 });
        },
      },
      {
        etiqueta: '(d) segmento circular',
        x: [-2.4, 2.4], y: [-2.4, 2.4], cuadrado: true,
        dibuja: (l) => {
          const arco = Array.from({ length: 49 }, (_, k) => {
            const t = ((Math.PI / 2) * k) / 48;
            return [2 * Math.cos(t), 2 * Math.sin(t)];
          });
          l.poli(arco, { clase: 'f', cerrar: true });
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [2], marcasY: [2] });
          l.poli(aro(0, 0, 2), { clase: 'c' });
          l.poli([[2, 0], [0, 2]], { clase: 'c2' });
          l.punto(2, 0, { clase: 'o', r: 3.4 });
          l.punto(0, 2, { clase: 'o', r: 3.4 });
        },
      },
      {
        etiqueta: '(e) triángulo con π',
        x: [-0.25, 1.85], y: [-0.25, 1.3], cuadrado: false,
        dibuja: (l) => {
          l.poli([[0, 0], [P / 2, 0], [P / 4, P / 4]], { clase: 'f', cerrar: true });
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [[P / 2, 'π/2']], marcasY: [[P / 4, 'π/4']] });
          l.poli([[0, 0], [P / 2, 0], [P / 4, P / 4]], { clase: 'c', cerrar: true });
          l.punto(P / 4, P / 4, { clase: 'o', r: 3.4 });
        },
      },
    ],
  });
});

/* ── 6 · el rombo y el cambio que lo endereza ────────────────────────── */
fig('el-rombo-y-el-cambio-que-lo-endereza', 0, () =>
  mosaico({
    id: 'f-rombo-cambio',
    titulo: 'El rombo en el plano XY y el cuadrado en que lo convierte el cambio',
    desc: 'A la izquierda, el rombo de vértices (1,0), (0,4), (−1,0) y (0,−4), formado por cuatro '
      + 'rectas: dos de pendiente cuatro y dos de pendiente menos cuatro. A la derecha, su imagen '
      + 'tras el cambio de variable: el cuadrado de lado dos que va de menos uno a uno en u y de '
      + 'menos uno a uno en v. Cada vértice lleva su letra para poder emparejarlos entre los dos '
      + 'dibujos.',
    columnas: 2,
    ancho: 205,
    alto: 185,
    celdas: [
      {
        etiqueta: 'el rombo en XY',
        x: [-1.7, 1.7], y: [-5, 5], cuadrado: false,
        dibuja: (l) => {
          const vs = [[1, 0], [0, 4], [-1, 0], [0, -4]];
          l.poli(vs, { clase: 'f', cerrar: true });
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, -1], marcasY: [4, -4] });
          l.poli(vs, { clase: 'c', cerrar: true });
          const letras = ['P', 'Q', 'R', 'S'];
          vs.forEach(([px, py], k) => {
            l.punto(px, py, { r: 3.6 });
            l.rotulo(px, py, letras[k], { dx: px >= 0 ? 7 : -7, dy: py > 0 ? -5 : 13, anclaje: px >= 0 ? 'start' : 'end' });
          });
        },
      },
      {
        etiqueta: 'el cuadrado en UV',
        x: [-1.7, 1.7], y: [-1.7, 1.7], cuadrado: true,
        dibuja: (l) => {
          const vs = [[1, -1], [1, 1], [-1, 1], [-1, -1]];
          l.poli(vs, { clase: 'f', cerrar: true });
          l.ejes({ nombreX: 'u', nombreY: 'v', marcasX: [1, -1], marcasY: [1, -1] });
          l.poli(vs, { clase: 'c', cerrar: true });
          const letras = ['P', 'Q', 'R', 'S'];
          vs.forEach(([px, py], k) => {
            l.punto(px, py, { r: 3.6 });
            l.rotulo(px, py, letras[k], { dx: px > 0 ? 7 : -7, dy: py > 0 ? -5 : 13, anclaje: px > 0 ? 'start' : 'end' });
          });
        },
      },
    ],
  }));

/* ── 7 · el cuenco parabólico con tapa esférica ──────────────────────── */
fig('el-cuenco-parabolico-con-tapa-esferica', 0, () =>
  corteYProyeccion({
    id: 'f-cuenco-esfera',
    titulo: 'El cuenco parabólico con tapa esférica, y el disco de radio raíz de dos',
    desc: 'A la izquierda, el corte por el plano y igual a cero: la parábola z igual a x al '
      + 'cuadrado, que sale en punta del origen, y encima el arco de la circunferencia de radio '
      + 'raíz de seis, unos dos coma cuarenta y cinco. Se cortan a la altura dos, en x igual a '
      + 'más y menos raíz de dos. Entre las dos queda la sección del sólido. A la derecha, la '
      + 'proyección sobre el plano XY: el disco de radio raíz de dos.',
    corte: {
      x: [-2.7, 2.7], y: [-0.6, 2.9], cuadrado: false,
      dibuja: (l) => {
        const R = Math.sqrt(6);
        const r2 = Math.sqrt(2);
        l.poli(entre((x) => Math.sqrt(R * R - x * x), (x) => x * x, -r2, r2), { clase: 'f', cerrar: true });
        l.ejes({ nombreX: 'x', nombreY: 'z', marcasX: [[-r2, '−√2'], [r2, '√2']], marcasY: [2, [R, '√6']] });
        l.curva((x) => x * x, [-1.65, 1.65], { clase: 'c', n: 60 });
        l.curva((x) => Math.sqrt(Math.max(0, R * R - x * x)), [-2.6, 2.6], { clase: 'c2', n: 80 });
        l.punto(r2, 2, { clase: 'o', r: 3.8 });
        l.punto(-r2, 2, { clase: 'o', r: 3.8 });
        l.rotulo(r2, 2, 'z = 2', { dx: 6, dy: -5, color: 'var(--flag)' });
      },
    },
    proyeccion: {
      x: [-1.9, 1.9], y: [-1.9, 1.9], cuadrado: true,
      dibuja: (l) => {
        const r2 = Math.sqrt(2);
        l.poli(aro(0, 0, r2), { clase: 'f', cerrar: true });
        l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [[r2, '√2']] });
        l.poli(aro(0, 0, r2), { clase: 'c' });
        l.rotulo(0, 0, 'r ≤ √2', { dx: 0, dy: -9, anclaje: 'middle' });
      },
    },
  }));

/* ── 8 · el cono tapado por un paraboloide ───────────────────────────── */
fig('el-cono-tapado-por-un-paraboloide', 0, () =>
  corteYProyeccion({
    id: 'f-cono-tapado',
    titulo: 'El cono tapado por un paraboloide, cortándose en r igual a dos',
    desc: 'A la izquierda, el corte: dos rectas de pendiente uno y menos uno que salen del '
      + 'origen, que son el cono, y la parábola z igual a seis menos x al cuadrado, con el '
      + 'vértice a altura seis. Se cortan en x igual a más y menos dos, a la altura dos. A la '
      + 'derecha, la proyección sobre XY: el disco de radio dos.',
    corte: {
      x: [-3.2, 3.2], y: [-1, 7], cuadrado: false,
      dibuja: (l) => {
        l.poli(entre((x) => 6 - x * x, (x) => Math.abs(x), -2, 2), { clase: 'f', cerrar: true });
        l.ejes({ nombreX: 'x', nombreY: 'z', marcasX: [-2, 2], marcasY: [2, 6] });
        l.poli([[-3, 3], [0, 0], [3, 3]], { clase: 'c' });
        l.curva((x) => 6 - x * x, [-2.7, 2.7], { clase: 'c2', n: 60 });
        l.punto(2, 2, { clase: 'o', r: 3.8 });
        l.punto(-2, 2, { clase: 'o', r: 3.8 });
        l.rotulo(2, 2, 'r=z=2', { dx: -7, dy: -6, anclaje: 'end', color: 'var(--flag)' });
      },
    },
    proyeccion: {
      x: [-2.6, 2.6], y: [-2.6, 2.6], cuadrado: true,
      dibuja: (l) => {
        l.poli(aro(0, 0, 2), { clase: 'f', cerrar: true });
        l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [2] });
        l.poli(aro(0, 0, 2), { clase: 'c' });
        l.rotulo(0, 0, 'r ≤ 2', { dx: 0, dy: -9, anclaje: 'middle' });
      },
    },
  }));

/* ── 9 · la esfera mordida por el cilindro ───────────────────────────── */
fig('la-esfera-mordida-por-el-cilindro', 0, () =>
  corteYProyeccion({
    id: 'f-esfera-cilindro',
    etiquetaCorte: 'el corte por el plano y = 0',
    titulo: 'La esfera de radio dos mordida por el cilindro tangente r igual a dos coseno',
    desc: 'A la izquierda, el corte por el plano y igual a cero: la circunferencia de radio dos y '
      + 'las dos generatrices del cilindro, en x igual a cero y en x igual a dos, que la tocan en '
      + 'el origen y en el punto (2,0,0). A la derecha, la clave del ejercicio: la proyección '
      + 'sobre XY es la circunferencia de centro (1,0) y radio uno, tangente por dentro a la de '
      + 'radio dos y pasando por el origen.',
    corte: {
      x: [-2.6, 2.6], y: [-2.6, 2.6], cuadrado: true,
      dibuja: (l) => {
        l.poli([
          ...Array.from({ length: 61 }, (_, k) => {
            const x = 2 - (2 * k) / 60;
            return [x, Math.sqrt(Math.max(0, 4 - x * x))];
          }),
          ...Array.from({ length: 61 }, (_, k) => {
            const x = (2 * k) / 60;
            return [x, -Math.sqrt(Math.max(0, 4 - x * x))];
          }),
        ], { clase: 'f', cerrar: true });
        l.ejes({ nombreX: 'x', nombreY: 'z', marcasX: [2], marcasY: [2, -2] });
        l.poli(aro(0, 0, 2), { clase: 'c' });
        l.poli([[2, -2.4], [2, 2.4]], { clase: 'cp2' });
        l.poli([[0, -2.4], [0, 2.4]], { clase: 'cp2' });
        l.punto(2, 0, { clase: 'o', r: 3.8 });
      },
    },
    proyeccion: {
      x: [-2.6, 2.6], y: [-2.6, 2.6], cuadrado: true,
      dibuja: (l) => {
        l.poli(aro(1, 0, 1), { clase: 'f', cerrar: true });
        l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2] });
        l.poli(aro(0, 0, 2), { clase: 'g' });
        l.poli(aro(1, 0, 1), { clase: 'c' });
        l.punto(2, 0, { clase: 'o', r: 3.6 });
        l.punto(0, 0, { clase: 'o', r: 3.6 });
        l.rotulo(1, 1, 'r = 2cos θ', { dx: 4, dy: -6 });
      },
    },
  }));

/* ── 10 · el paraboloide elíptico tumbado ────────────────────────────── */
fig('el-paraboloide-eliptico-tumbado', 0, () =>
  corteYProyeccion({
    id: 'f-parab-tumbado',
    etiquetaCorte: 'el corte por el plano z = 0',
    etiquetaProy: 'las secciones x = cte',
    titulo: 'El paraboloide elíptico tumbado sobre el eje x, y sus secciones elípticas',
    desc: 'A la izquierda, el corte por el plano z igual a cero: la parábola x igual a y al '
      + 'cuadrado, tumbada y abierta hacia la derecha desde el origen, cerrada por la vertical en '
      + 'x igual a cuatro. A la derecha, las secciones perpendiculares al eje x: elipses cada vez '
      + 'más grandes, dibujadas para x igual a uno, dos y cuatro, con la proporción entre '
      + 'semiejes constante.',
    corte: {
      x: [-0.8, 5], y: [-2.6, 2.6], cuadrado: false,
      dibuja: (l) => {
        l.poli([
          ...Array.from({ length: 61 }, (_, k) => { const y = -2 + (4 * k) / 60; return [y * y, y]; }),
          [4, 2], [4, -2],
        ], { clase: 'f', cerrar: true });
        l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 4], marcasY: [2, -2] });
        l.curva((y) => [y * y, y], [-2.2, 2.2], { clase: 'c', n: 80 });
        l.poli([[4, -2.4], [4, 2.4]], { clase: 'cp2' });
      },
    },
    proyeccion: {
      x: [-2.4, 2.4], y: [-1.7, 1.7], cuadrado: false,
      dibuja: (l) => {
        l.ejes({ nombreX: 'y', nombreY: 'z', marcasX: [1, 2], marcasY: [1] });
        for (const [x, cl] of [[1, 'cp'], [2, 'c2'], [4, 'c']]) {
          const a = Math.sqrt(x);
          l.poli(oval(0, 0, a, a / 2), { clase: cl });
        }
        l.rotulo(0, 1, 'x = 4', { dx: 0, dy: -7, anclaje: 'middle', color: 'var(--d1)' });
        l.rotulo(0, 0.5, 'x = 1', { dx: 0, dy: -6, anclaje: 'middle', color: 'var(--faint)', pequeno: true });
      },
    },
  }));

/* ── a pegar ─────────────────────────────────────────────────────────── */
for (const f of figuras) f.svg = f.hacer();

if (process.argv[1]?.endsWith('calculo-t07.mjs')) {
  for (const f of figuras) pega(FICHERO, f.id, f.svg, f.paso);
  console.log(`${figuras.length} figuras pegadas en ${FICHERO}`);
}
