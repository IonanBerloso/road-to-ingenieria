/**
 * Las figuras del tema 6 de Cálculo: funciones de varias variables.
 *
 * Cuatro dibujos, y dos de ellos son mosaicos de seis apartados cada uno
 * —dominios de definición y familias de curvas de nivel—, porque la consigna
 * pide expresamente unos ejes por apartado.
 *
 *     node scripts/figuras/calculo-t06.mjs
 */

import { lienzo, mosaico, vista3d } from './lienzo.mjs';
import { pega } from './pegar.mjs';

export const FICHERO = 'src/content/calculo/t06-varias-variables/ejercicios.yaml';

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

/* ── 1 · la cucaracha ────────────────────────────────────────────────── */
fig('cucaracha-y-el-gas', 0, () => {
  const l = lienzo({
    id: 'f-cucaracha',
    x: [-0.6, 2.6], y: [-1.4, 2.6], cuadrado: true,
    titulo: 'La curva de nivel por P y la dirección de huida, perpendicular a ella',
    desc: 'El punto de máxima concentración está en (1,1) y se marca con otro color. La curva '
      + 'donde la concentración no cambia al pasar por P, que está en (1,0), es la '
      + 'circunferencia de centro (1,1) y radio uno. La flecha de huida sale de P hacia abajo, en '
      + 'la dirección (0,−1), perpendicular a esa circunferencia.',
  });
  l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2], marcasY: [1, 2] });
  l.poli(aro(1, 1, 1), { clase: 'c' });
  l.punto(1, 1, { clase: 'o', r: 4.6 });
  l.punto(1, 0, { r: 4.6 });
  l.flecha([1, 0], [1, -1], { clase: 'c2' });
  l.rotulo(1, 1, 'máximo (1,1)', { dx: 9, dy: -5, color: 'var(--flag)' });
  l.rotulo(1, 0, 'P(1,0)', { dx: -9, dy: 4, anclaje: 'end' });
  l.rotulo(1, -1, 'huida (0,−1)', { dx: 9, dy: 4, color: 'var(--alt)' });
  l.rotulo(...[1 + Math.cos(Math.PI / 4), 1 + Math.sin(Math.PI / 4)], 'f = e^(−1)', { dx: 6, dy: -6 });
  return l.svg();
});

/* ── 2 · seis dominios de definición ─────────────────────────────────── */
fig('seis-dominios-de-definicion', 0, () => {
  const p3 = vista3d({ escalaXY: 0.75, inclinacion: 0.42 });
  const cuadro = { x: [-3.4, 3.4], y: [-3.4, 3.4] };
  return mosaico({
    id: 'f-seis-dominios',
    titulo: 'Los seis dominios de definición, y cuáles son cerrados y cuáles abiertos',
    desc: 'Seis dibujos independientes. En el (a), el semiplano cerrado por encima de la recta y '
      + 'igual a menos x. En el (b), el primer cuadrante cerrado. En el (c), el primer y el '
      + 'tercer cuadrante, con los ejes incluidos. En el (d), el interior abierto de una elipse '
      + 'de semiejes tres y uno, con el borde a trazos. En el (e), una bola abierta de radio '
      + 'cuatro dibujada en perspectiva, también a trazos. Y en el (f), un disco cerrado de radio '
      + 'dos.',
    columnas: 3,
    ancho: 176,
    alto: 158,
    celdas: [
      {
        etiqueta: '(a) √(x+y)',
        ...cuadro,
        dibuja: (l) => {
          l.poli([[-3.2, 3.2], [3.2, -3.2], [3.2, 3.2]], { clase: 'f', cerrar: true });
          l.ejes({ nombreX: 'x', nombreY: 'y' });
          l.poli([[-3.2, 3.2], [3.2, -3.2]], { clase: 'c' });
        },
      },
      {
        etiqueta: '(b) √x + √y',
        ...cuadro,
        dibuja: (l) => {
          l.poli([[0, 0], [3.2, 0], [3.2, 3.2], [0, 3.2]], { clase: 'f', cerrar: true });
          l.ejes({ nombreX: 'x', nombreY: 'y' });
          l.poli([[0, 3.2], [0, 0], [3.2, 0]], { clase: 'c' });
        },
      },
      {
        etiqueta: '(c) √(xy)',
        ...cuadro,
        dibuja: (l) => {
          l.poli([[0, 0], [3.2, 0], [3.2, 3.2], [0, 3.2]], { clase: 'f', cerrar: true });
          l.poli([[0, 0], [-3.2, 0], [-3.2, -3.2], [0, -3.2]], { clase: 'f', cerrar: true });
          l.ejes({ nombreX: 'x', nombreY: 'y' });
        },
      },
      {
        etiqueta: '(d) ln(9−x²−9y²)',
        x: [-3.6, 3.6], y: [-1.8, 1.8], cuadrado: false,
        dibuja: (l) => {
          l.poli(oval(0, 0, 3, 1), { clase: 'f', cerrar: true });
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [3], marcasY: [1] });
          l.poli(oval(0, 0, 3, 1), { clase: 'cp' });
        },
      },
      {
        etiqueta: '(e) bola abierta r = 4',
        x: [-5.6, 5.6], y: [-5.2, 5.2], cuadrado: false,
        dibuja: (l) => {
          l.poli([p3(-5, 0, 0), p3(5, 0, 0)], { clase: 'eje' });
          l.poli([p3(0, -5, 0), p3(0, 5, 0)], { clase: 'eje' });
          l.poli([p3(0, 0, -4.8), p3(0, 0, 4.8)], { clase: 'eje' });
          l.poli(aro(0, 0, 4), { clase: 'cp' });
          l.poli(p3.aro(0, 4), { clase: 'g' });
        },
      },
      {
        etiqueta: '(f) √(36−9x²−9y²)',
        ...cuadro,
        dibuja: (l) => {
          l.poli(aro(0, 0, 2), { clase: 'f', cerrar: true });
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [2] });
          l.poli(aro(0, 0, 2), { clase: 'c' });
        },
      },
    ],
  });
});

/* ── 3 · seis familias de curvas de nivel ────────────────────────────── */
fig('seis-familias-de-curvas-de-nivel', 0, () => {
  const p3 = vista3d({ escalaXY: 0.75, inclinacion: 0.42 });
  const cuadro = { x: [-3.4, 3.4], y: [-3.4, 3.4] };
  return mosaico({
    id: 'f-seis-niveles',
    titulo: 'Las seis familias de curvas de nivel, con el valor de k anotado en cada una',
    desc: 'Seis mapas independientes. En el (a), rectas paralelas de pendiente menos uno. En el '
      + '(b), las mismas pero solo desde k igual a cero hacia arriba. En el (c), elipses '
      + 'concéntricas con los semiejes en proporción dos a uno. En el (d), circunferencias que '
      + 'empiezan en k igual a uno, que es un punto. En el (e), hipérbolas de dos familias, y '
      + 'para k igual a cero el par de rectas y igual a más menos x. Y en el (f), esferas '
      + 'concéntricas de centro (0,2,0), dibujadas en unos ejes de tres dimensiones.',
    columnas: 3,
    ancho: 176,
    alto: 158,
    celdas: [
      {
        etiqueta: '(a) x+y',
        ...cuadro,
        dibuja: (l) => {
          l.ejes({ nombreX: 'x', nombreY: 'y' });
          for (const k of [-2, 0, 2]) {
            l.curva((x) => k - x, [Math.max(-3.2, k - 3.2), Math.min(3.2, k + 3.2)], { clase: 'c' });
            l.rotulo(Math.min(3.2, k + 3.2), k - Math.min(3.2, k + 3.2), `k=${k}`, { dx: -3, dy: -5, anclaje: 'end', pequeno: true, color: 'var(--faint)' });
          }
        },
      },
      {
        etiqueta: '(b) √(x+y), k ≥ 0',
        ...cuadro,
        dibuja: (l) => {
          l.ejes({ nombreX: 'x', nombreY: 'y' });
          for (const k of [0, 1, 2]) {
            const c = k * k;
            l.curva((x) => c - x, [Math.max(-3.2, c - 3.2), Math.min(3.2, c + 3.2)], { clase: 'c' });
            l.rotulo(Math.min(3.2, c + 3.2), c - Math.min(3.2, c + 3.2), `k=${k}`, { dx: -3, dy: -5, anclaje: 'end', pequeno: true, color: 'var(--faint)' });
          }
        },
      },
      {
        etiqueta: '(c) x²+4y²',
        ...cuadro,
        dibuja: (l) => {
          l.ejes({ nombreX: 'x', nombreY: 'y' });
          for (const k of [1, 4, 9]) {
            const a = Math.sqrt(k);
            l.poli(oval(0, 0, a, a / 2), { clase: 'c' });
            l.rotulo(0, a / 2, `k=${k}`, { dx: 4, dy: -4, pequeno: true, color: 'var(--faint)' });
          }
        },
      },
      {
        etiqueta: '(d) x²+y²+1',
        ...cuadro,
        dibuja: (l) => {
          l.ejes({ nombreX: 'x', nombreY: 'y' });
          l.punto(0, 0, { clase: 'o', r: 3.4 });
          for (const k of [2, 5, 10]) {
            l.poli(aro(0, 0, Math.sqrt(k - 1)), { clase: 'c' });
            l.rotulo(Math.sqrt(k - 1), 0, `k=${k}`, { dx: -3, dy: -5, anclaje: 'end', pequeno: true, color: 'var(--faint)' });
          }
          l.rotulo(0, 0, 'k=1', { dx: 5, dy: 12, pequeno: true, color: 'var(--flag)' });
        },
      },
      {
        etiqueta: '(e) x²−y²',
        ...cuadro,
        dibuja: (l) => {
          l.ejes({ nombreX: 'x', nombreY: 'y' });
          l.curva((x) => x, [-3.2, 3.2], { clase: 'cp2' });
          l.curva((x) => -x, [-3.2, 3.2], { clase: 'cp2' });
          for (const k of [1, 4]) {
            const a = Math.sqrt(k);
            /* Hasta donde la rama cabe en el panel, y ni un punto más. */
            const T = Math.acosh(3.2 / a);
            for (const s of [1, -1]) {
              l.curva((t) => [s * a * Math.cosh(t), a * Math.sinh(t)], [-T, T], { clase: 'c', n: 50 });
              l.curva((t) => [a * Math.sinh(t), s * a * Math.cosh(t)], [-T, T], { clase: 'c2', n: 50 });
            }
          }
          l.rotulo(3.1, 3.1, 'k=0', { dx: -3, dy: 12, anclaje: 'end', pequeno: true, color: 'var(--faint)' });
        },
      },
      {
        etiqueta: '(f) esferas en (0,2,0)',
        x: [-4.4, 4.4], y: [-3.6, 3.6], cuadrado: false,
        dibuja: (l) => {
          l.poli([p3(-3.4, 0, 0), p3(3.4, 0, 0)], { clase: 'eje' });
          l.poli([p3(0, -1, 0), p3(0, 5, 0)], { clase: 'eje' });
          l.poli([p3(0, 0, -3), p3(0, 0, 3)], { clase: 'eje' });
          for (const r of [1, 2]) {
            l.poli(Array.from({ length: 97 }, (_, k) => {
              const t = (2 * Math.PI * k) / 96;
              return [r * Math.cos(t), r * Math.sin(t)];
            }).map(([u, v]) => [u, v + p3(0, 2, 0)[1]]).map(([u, v]) => [u + p3(0, 2, 0)[0], v]), { clase: 'c' });
            l.poli(p3.aro(0, r, r, 72, 0, 2), { clase: 'g' });
          }
          l.punto(...p3(0, 2, 0), { clase: 'o', r: 3 });
        },
      },
    ],
  });
});

/* ── 4 · dónde la derivada máxima vale cuatro ────────────────────────── */
fig('donde-la-maxima-vale-cuatro', 0, () => {
  const l = lienzo({
    id: 'f-maxima-cuatro',
    x: [-2.2, 2.2], y: [-3.4, 3.4], cuadrado: true,
    titulo: 'La elipse donde la derivada direccional máxima vale cuatro, y los dos puntos del eje',
    desc: 'Una elipse de semieje uno en horizontal y dos en vertical, centrada en el origen: ese '
      + 'es el lugar de los puntos donde el módulo del gradiente vale cuatro. En lo más alto, el '
      + 'punto (0,2), con una flecha hacia arriba de módulo cuatro. Abajo, el punto (0,−2), con '
      + 'su flecha hacia abajo, tachado porque allí la dirección no es la pedida.',
  });
  l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, -1], marcasY: [2, -2] });
  l.poli(Array.from({ length: 121 }, (_, k) => {
    const t = (2 * Math.PI * k) / 120;
    return [Math.cos(t), 2 * Math.sin(t)];
  }), { clase: 'c' });
  l.punto(0, 2, { r: 4.6 });
  l.punto(0, -2, { clase: 'o', r: 4.6 });
  l.flecha([0, 2], [0, 3], { clase: 'c2' });
  l.flecha([0, -2], [0, -3], { clase: 'c2' });
  l.poli([[-0.45, -2.45], [0.45, -1.55]], { clase: 'cp2' });
  l.rotulo(0, 2, 'P(0,2) · v = (0,1)', { dx: 9, dy: -4 });
  l.rotulo(0, -2, '(0,−2) · v = (0,−1)', { dx: 9, dy: 14, color: 'var(--flag)' });
  l.rotulo(0, 3, '|∇F| = 4', { dx: 8, dy: 2, color: 'var(--alt)' });
  l.esquina(12, 20, 'pendiente, no altura');
  return l.svg();
});

/* ── a pegar ─────────────────────────────────────────────────────────── */
for (const f of figuras) f.svg = f.hacer();

if (process.argv[1]?.endsWith('calculo-t06.mjs')) {
  for (const f of figuras) pega(FICHERO, f.id, f.svg, f.paso);
  console.log(`${figuras.length} figuras pegadas en ${FICHERO}`);
}
