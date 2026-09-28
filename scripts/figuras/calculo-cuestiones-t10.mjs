/**
 * Las figuras de las cuestiones del tema 10 de Cálculo, las de las
 * diapositivas de «Transformada de Laplace» (fase E3 de la auditoría del 27
 * de septiembre de 2026).
 *
 * Se redibujan, no se recortan del PDF (§08), y se calculan con el lienzo:
 *
 *   · el pulso de la 3 vale 1 entre t = 2 y t = 4, como en el original;
 *   · la curva de la 5 es y = Ce^(2t) − e^(−t) con C = 3·10⁻⁶, la que encaja
 *     con la del original medida a 600 ppp: sale de y(0) = −1 a la vista y se
 *     dispara hacia t = 6 (lo dice un comentario en su pregunta);
 *   · la Y(s) de la 11 es (1,5s + 0,5)/(s² + 1,6), la transformada de
 *     1,5 cos(ωt) + (0,5/ω) sen(ωt) con ω² = 1,6, que reproduce la del
 *     original —0,31 en s = 0, un máximo de 0,77 cerca de s = 1, 0,30 en
 *     s = 5—; A es Y′(s) y B es −Y′(s), que es H(s).
 *
 *   BANCO=<ruta> node scripts/figuras/calculo-cuestiones-t10.mjs
 *
 * Pega cada figura en su pregunta; si la pregunta ya tiene una, se para.
 */
import { lienzo, mosaico } from './lienzo.mjs';
import { pegaEnPregunta } from './pegar.mjs';

/* El destino se puede cambiar para rehacerlas sobre una copia en revisión. */
const BANCO = process.env.BANCO ?? 'src/content/banco/calculo-t10.yaml';

/** La rejilla de las diapositivas: rectas finas del color de los ejes. */
function rejilla(f, xs, ys, [x0, x1], [y0, y1]) {
  f.clase('rej', 'stroke: var(--rule); stroke-width: 1; fill: none; stroke-dasharray: 4 3;');
  for (const x of xs) f.poli([[x, y0], [x, y1]], { clase: 'rej' });
  for (const y of ys) f.poli([[x0, y], [x1, y]], { clase: 'rej' });
}

/* ── 3 · un pulso de altura 1 entre t = 2 y t = 4 ────────────────────── */

const pulso = (() => {
  const f = lienzo({
    id: 'cq10-pulso',
    alto: 170,
    x: [-0.4, 5.7],
    y: [-0.3, 1.45],
    titulo: 'La función f(t), un pulso entre t = 2 y t = 4',
    desc:
      'La gráfica de f(t): vale cero desde t igual a cero hasta t igual a dos, uno entre t igual ' +
      'a dos y t igual a cuatro, y cero otra vez a partir de cuatro.',
  });
  rejilla(f, [1, 2, 3, 4, 5], [1], [-0.3, 5.6], [-0.25, 1.4]);
  f.ejes({ nombreX: 't', nombreY: 'y', marcasX: [1, 2, 3, 4, 5], marcasY: [1] });
  f.poli([[0, 0], [2, 0]]).poli([[2, 1], [4, 1]]).poli([[4, 0], [5.6, 0]]);
  f.rotulo(3, 1, 'f(t)', { anclaje: 'middle', dy: -9 });
  return f.svg();
})();

/* ── 5 · una solución de y′ = 2y + 3e^(−t) que sale de y(0) = −1 ───────── */

const solucion = (() => {
  const C = 3e-6;
  const y = (t) => C * Math.exp(2 * t) - Math.exp(-t);
  const f = lienzo({
    id: 'cq10-solucion',
    alto: 230,
    x: [-2.5, 7.6],
    y: [-3.5, 2.7],
    titulo: 'La gráfica de y(t)',
    desc:
      'La curva empieza sobre el eje vertical, en y igual a menos uno, sube despacio acercándose ' +
      'a cero, lo cruza hacia t igual a cuatro y a partir de t igual a cinco se dispara hacia ' +
      'arriba: vale casi dos y medio poco antes de t igual a siete.',
  });
  rejilla(f, [-2, -1, 1, 2, 3, 4, 5, 6, 7], [-3, -2, -1, 1, 2], [-2.4, 7.5], [-3.45, 2.6]);
  /* Hasta y = 2,4, que es donde se sale el original; y antes que los ejes,
     para que la marca del 1, que la curva pisa, quede encima con su halo. */
  const fin = Math.log((2.4 + Math.exp(-6.8)) / C) / 2;
  f.curva(y, [0, fin], { n: 160 });
  f.ejes({ nombreX: 't', nombreY: 'y', marcasX: [-2, -1, 1, 2, 3, 4, 5, 6, 7], marcasY: [-3, -2, -1, 1, 2] });
  return f.svg();
})();

/* ── 11 · Y(s), y dos candidatas a H(s) = ℒ(t·y(t)) ─────────────────── */

const Y = (s) => (1.5 * s + 0.5) / (s * s + 1.6);
/* Y′(s), derivada a mano y comprobada abajo contra el cociente incremental. */
const dY = (s) => (2.4 - s - 1.5 * s * s) / (s * s + 1.6) ** 2;
for (const s of [0.2, 1, 2.5, 4.8]) {
  const num = (Y(s + 1e-6) - Y(s - 1e-6)) / 2e-6;
  if (Math.abs(num - dY(s)) > 1e-6) throw new Error(`Y′ mal derivada en s = ${s}`);
}

const multiplicarPorT = mosaico({
  id: 'cq10-por-t',
  titulo: 'La transformada Y(s) y dos candidatas a H(s)',
  desc:
    'Tres gráficas con el mismo eje s, de cero a cinco. En la primera, Y(s): empieza en cero coma ' +
    'tres, sube hasta un máximo de casi cero coma ocho cerca de s igual a uno y luego baja ' +
    'despacio, hasta cero coma tres en s igual a cinco. En A, una curva que empieza en cero coma ' +
    'nueve, baja, corta el eje cerca de s igual a uno, se queda un poco por debajo y se acerca a ' +
    'cero desde abajo. En B, la simétrica de A: empieza en menos cero coma nueve, sube, corta el ' +
    'eje cerca de s igual a uno, llega a unos cero coma dieciocho hacia s igual a uno coma ocho y ' +
    'baja despacio hacia cero.',
  columnas: 1,
  ancho: 340,
  alto: 118,
  celdas: [
    ['Y(s)', Y],
    ['A', dY],
    ['B', (s) => -dY(s)],
  ].map(([etiqueta, g]) => ({
    etiqueta,
    x: [-0.35, 5.45],
    y: [-1.15, 1.15],
    cuadrado: false,
    /* La curva antes que los ejes, para que las marcas queden encima con
       su halo; y hasta s = 5,15, para que no pise el nombre del eje. */
    dibuja: (p) => {
      rejilla(p, [1, 2, 3, 4, 5], [-1, 1], [-0.3, 5.35], [-1.1, 1.1]);
      p.curva(g, [0, 5.15], { n: 140 });
      p.ejes({ nombreX: 's', nombreY: '', marcasX: [1, 2, 3, 4, 5], marcasY: [-1, 1] });
    },
  })),
});

const figuras = {
  'un-pulso-entre-2-y-4': pulso,
  'transformar-una-edo': solucion,
  'multiplicar-por-t': multiplicarPorT,
};

for (const [id, svg] of Object.entries(figuras)) pegaEnPregunta(BANCO, id, svg);
console.log(`${Object.keys(figuras).length} figuras pegadas en ${BANCO}`);
