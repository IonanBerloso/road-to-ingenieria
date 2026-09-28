/**
 * Las figuras de las cuestiones del tema 1 de Cálculo, las de las
 * diapositivas de «Números complejos» (fase E3 de la auditoría del 27 de
 * septiembre de 2026).
 *
 * Se redibujan, no se recortan del PDF (§08), y se calculan con el lienzo:
 * los vectores del cuadrado y de la raíz cúbica están medidos sobre la
 * diapositiva renderizada a 600 ppp, con una salvedad que dice su pregunta en
 * `calculo-t01.yaml`: la opción buena del cuadrado se dibuja con el módulo que
 * le toca, |z|², y no con el del original.
 *
 *   node scripts/figuras/calculo-cuestiones-t01.mjs
 *
 * Pega cada figura en su pregunta; si la pregunta ya tiene una, se para.
 */
import { lienzo, mosaico } from './lienzo.mjs';
import { pegaEnPregunta } from './pegar.mjs';

/* El destino se puede cambiar para rehacerlas sobre una copia en revisión. */
const BANCO = process.env.BANCO ?? 'src/content/banco/calculo-t01.yaml';
const grados = (g) => (g * Math.PI) / 180;
const polar = (r, g) => [r * Math.cos(grados(g)), r * Math.sin(grados(g))];

/* ── 2 a 5 · el argumento, un cuadrante cada vez ───────────────────── */

function argumento(id, cuadrante, [zx, zy]) {
  const theta = (Math.atan2(zy, zx) + 2 * Math.PI) % (2 * Math.PI);
  const f = lienzo({
    id,
    x: [-2.9, 2.9],
    y: [-2.4, 2.4],
    cuadrado: true,
    titulo: `El número z en el ${cuadrante} cuadrante`,
    desc:
      `Un vector del origen a z, en el ${cuadrante} cuadrante, con sus proyecciones x e y ` +
      'sobre los ejes en trazo discontinuo, y el ángulo θ medido desde el semieje real ' +
      'positivo en sentido antihorario hasta z.',
  });
  f.ejes({ nombreX: 'Re', nombreY: 'Im' });
  f.poli([[zx, 0], [zx, zy]], { clase: 'g' }).poli([[0, zy], [zx, zy]], { clase: 'g' });
  f.curva((t) => [0.75 * Math.cos(t), 0.75 * Math.sin(t)], [0, theta], { clase: 'c2', n: 72 });
  f.flecha([0, 0], [zx, zy]);
  const medio = theta / 2;
  f.rotulo(1.05 * Math.cos(medio), 1.05 * Math.sin(medio), 'θ', { anclaje: 'middle', dy: 4, color: 'var(--alt)' });
  f.rotulo(zx, zy, 'z', { anclaje: zx < 0 ? 'end' : 'start', dx: zx < 0 ? -6 : 6, dy: zy < 0 ? 12 : -4 });
  f.rotulo(zx, 0, 'x', { anclaje: 'middle', dy: zy < 0 ? -7 : 15, color: 'var(--graphite)' });
  f.rotulo(0, zy, 'y', { anclaje: zx < 0 ? 'start' : 'end', dx: zx < 0 ? 6 : -6, dy: 4, color: 'var(--graphite)' });
  return f.svg();
}

/* ── 7 y 8 · el cuadrado y la raíz cúbica ─────────────────────────── */

/** Un panel del plano con la circunferencia unidad y un vector rotulado. */
const planoUnidad = (vectores) => (p) => {
  p.ejes({ nombreX: 'Re', nombreY: 'Im', marcasX: [-1, 1], marcasY: [-1, 1] });
  p.circunferencia(0, 0, 1, { clase: 'g' });
  for (const { a, rotulo, dx = 0, dy = 0 } of vectores) {
    p.flecha([0, 0], a);
    p.rotulo(a[0], a[1], rotulo, { anclaje: a[0] < 0 ? 'end' : 'start', dx: dx || (a[0] < 0 ? -4 : 4), dy });
  }
};

const cuadrado = mosaico({
  id: 'cq1-cuadrado',
  titulo: 'El número z y tres candidatos a z al cuadrado',
  desc:
    'Cuatro planos con la circunferencia unidad. En el primero, z: dentro de la circunferencia, ' +
    'a unos 60 grados. En A, un vector a unos 120 grados que se sale de la circunferencia. ' +
    'En B, un vector a unos 120 grados, más corto que z. En C, un vector a unos 210 grados, ' +
    'en el tercer cuadrante, dentro de la circunferencia.',
  columnas: 2,
  celdas: [
    { etiqueta: 'z', r: [0.77, 60] },
    { etiqueta: 'A', r: [1.25, 120] },
    { etiqueta: 'B', r: [0.77 ** 2, 120] },
    { etiqueta: 'C', r: [0.56, 210] },
  ].map(({ etiqueta, r }) => ({
    etiqueta,
    x: [-1.45, 1.45],
    y: [-1.45, 1.45],
    dibuja: planoUnidad([{ a: polar(...r), rotulo: etiqueta === 'z' ? 'z' : 'z²', dy: -3 }]),
  })),
});

const raiz = (() => {
  const f = lienzo({
    id: 'cq1-raiz',
    x: [-1.35, 1.35],
    y: [-1.35, 1.35],
    cuadrado: true,
    titulo: 'El número z y tres candidatos a raíz cúbica',
    desc:
      'La circunferencia unidad y cuatro vectores de módulo 1: z a unos 240 grados, A a unos ' +
      '320, B a unos 190 y C a unos 100 grados.',
  });
  planoUnidad([
    { a: polar(1, 240), rotulo: 'z', dy: 12 },
    { a: polar(1, 320), rotulo: 'A', dy: 12 },
    { a: polar(1, 190), rotulo: 'B', dy: 12 },
    { a: polar(1, 100), rotulo: 'C', dy: -4 },
  ])(f);
  return f.svg();
})();

/* ── 9 a 11 · la suma de distancias a dos puntos ───────────────────── */

function sumaDeDistancias(id, cuanto) {
  const z1 = [-1, 0];
  const z2 = [1, 0];
  const puntos = (p) => {
    p.punto(...z1).punto(...z2);
    p.rotulo(...z1, 'z₁', { anclaje: 'middle', dy: -9 }).rotulo(...z2, 'z₂', { anclaje: 'middle', dy: -9 });
  };
  const celda = (etiqueta, dibuja) => ({ etiqueta, x: [-2.4, 2.4], y: [-2, 2], dibuja });
  return mosaico({
    id,
    titulo: `Dos puntos a distancia d y tres candidatos al lugar de suma ${cuanto}`,
    desc:
      'Cuatro paneles con los mismos dos puntos, z₁ y z₂. En el primero, la distancia d entre ' +
      'ellos. En A, una elipse con focos en z₁ y z₂. En B, el segmento que los une. En C, la ' +
      'recta entera que pasa por los dos.',
    columnas: 2,
    celdas: [
      celda('z₁ y z₂', (p) => {
        p.flecha([0, 0], [-0.93, 0], { clase: 'c2', color: 'var(--alt)' });
        p.flecha([0, 0], [0.93, 0], { clase: 'c2', color: 'var(--alt)' });
        p.rotulo(0, 0, 'd', { anclaje: 'middle', dy: 16, color: 'var(--alt)' });
        puntos(p);
      }),
      celda('A', (p) => {
        p.curva((t) => [2 * Math.cos(t), Math.sqrt(3) * Math.sin(t)], [0, 2 * Math.PI], { cerrar: true, n: 120 });
        puntos(p);
      }),
      celda('B', (p) => {
        p.poli([z1, z2]);
        puntos(p);
      }),
      celda('C', (p) => {
        p.poli([[-2.3, 0], [2.3, 0]]);
        puntos(p);
      }),
    ],
  });
}

/* ── 12 a 14 · lugares con z + z̄ ──────────────────────────────────── */

const ejesDeLugar = (marcasY) => (p) =>
  p.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-3, 3], marcasY });

const conjugado = mosaico({
  id: 'cq1-mas-conjugado',
  titulo: 'Tres candidatos al lugar de z más su conjugado igual a menos seis',
  desc:
    'Tres planos. En A, la recta horizontal y igual a menos tres. En B, el punto menos tres del ' +
    'eje real. En C, la recta vertical x igual a menos tres.',
  columnas: 3,
  celdas: [
    ['A', (p) => p.poli([[-4.8, -3], [4.8, -3]])],
    ['B', (p) => p.punto(-3, 0)],
    ['C', (p) => p.poli([[-3, -3.8], [-3, 3.8]])],
  ].map(([etiqueta, traza]) => ({
    etiqueta,
    x: [-5, 5],
    y: [-4, 4],
    /* Los ejes, después del trazo: sus rótulos llevan halo y así la recta
       y = −3 no tapa el «−3» del eje. */
    dibuja: (p) => {
      traza(p);
      ejesDeLugar([-3, 3])(p);
    },
  })),
});

const BANDA = {
  A: (p) => {
    p.region([[-5.2, -2.3], [-3, -2.3], [-3, 2.3], [-5.2, 2.3]]);
    p.region([[3, -2.3], [5.2, -2.3], [5.2, 2.3], [3, 2.3]]);
    p.poli([[-3, -2.3], [-3, 2.3]]).poli([[3, -2.3], [3, 2.3]]);
  },
  B: (p) => {
    p.region([[-3, -2.3], [3, -2.3], [3, 2.3], [-3, 2.3]]);
    p.poli([[-3, -2.3], [-3, 2.3]]).poli([[3, -2.3], [3, 2.3]]);
  },
  C: (p) => p.poli([[-3, -2.3], [-3, 2.3]]).poli([[3, -2.3], [3, 2.3]]),
  D: (p) => p.poli([[-3, 0], [3, 0]]),
};

const DESC_BANDA = {
  A: 'la región de fuera de la banda, x menor o igual que menos tres y x mayor o igual que tres, sombreada',
  B: 'la banda vertical entre x igual a menos tres y x igual a tres, sombreada y con los bordes',
  C: 'las dos rectas verticales x igual a menos tres y x igual a tres',
  D: 'el segmento del eje real que va de menos tres a tres',
};

function banda(id, letras, titulo) {
  return mosaico({
    id,
    titulo,
    desc: `${letras.length} planos. ` + letras.map((l) => `En ${l}, ${DESC_BANDA[l]}.`).join(' '),
    columnas: 2,
    ancho: 190,
    alto: 118,
    celdas: letras.map((l) => ({
      etiqueta: l,
      x: [-5.4, 5.4],
      y: [-2.5, 2.5],
      dibuja: (p) => {
        BANDA[l](p);
        ejesDeLugar([-2, 2])(p);
      },
    })),
  });
}

/* ── 15 a 19 · la figura, y la condición ──────────────────────────── */

function lugar(id, titulo, desc, traza, { x = [-4.8, 5.2], y = [-3.4, 3.4], mx = [-4, -2, 2, 4], my = [-2, 2] } = {}) {
  const f = lienzo({ id, x, y, cuadrado: true, titulo, desc });
  traza(f);
  f.ejes({ nombreX: 'x', nombreY: 'y', marcasX: mx, marcasY: my });
  return f.svg();
}

const figuras = {
  'argumento-primer-cuadrante': argumento('cq1-arg-1', 'primer', [2, 1.5]),
  'argumento-segundo-cuadrante': argumento('cq1-arg-2', 'segundo', [-2, 1.6]),
  'argumento-tercer-cuadrante': argumento('cq1-arg-3', 'tercer', [-2, -1.25]),
  'argumento-cuarto-cuadrante': argumento('cq1-arg-4', 'cuarto', [1.55, -1.8]),
  'el-cuadrado-de-z': cuadrado,
  'una-raiz-cubica': raiz,
  'suma-de-distancias-d': sumaDeDistancias('cq1-suma-d', 'd'),
  'suma-de-distancias-2d': sumaDeDistancias('cq1-suma-2d', '2d'),
  'suma-de-distancias-d-medios': sumaDeDistancias('cq1-suma-d2', 'd/2'),
  'z-mas-conjugado-igual-a-menos-6': conjugado,
  'modulo-menor-o-igual-que-6': banda('cq1-banda-le', ['A', 'B', 'C', 'D'], 'Cuatro candidatos al lugar de |z + z̄| ≤ 6'),
  'modulo-igual-a-menos-6': banda('cq1-banda-neg', ['A', 'C', 'D'], 'Tres candidatos al lugar de |z + z̄| = −6'),
  'recta-vertical': lugar(
    'cq1-vertical',
    'Una recta vertical',
    'La recta vertical que corta el eje real en menos dos.',
    (f) => f.poli([[-2, -3.3], [-2, 3.3]]),
  ),
  'recta-horizontal': lugar(
    'cq1-horizontal',
    'Una recta horizontal',
    'La recta horizontal que corta el eje imaginario en dos, por encima del eje real.',
    (f) => f.poli([[-4.7, 2], [5.1, 2]]),
  ),
  'banda-horizontal': lugar(
    'cq1-banda-h',
    'Una banda horizontal',
    'La banda horizontal entre y igual a menos uno e y igual a dos, sombreada, con los dos bordes en trazo discontinuo.',
    (f) => {
      f.region([[-4.7, -1], [5.1, -1], [5.1, 2], [-4.7, 2]]);
      f.poli([[-4.7, -1], [5.1, -1]], { clase: 'cp' }).poli([[-4.7, 2], [5.1, 2]], { clase: 'cp' });
    },
    { my: [-1, 1, 2] },
  ),
  rectangulo: lugar(
    'cq1-rectangulo',
    'Un rectángulo',
    'El rectángulo de vértices menos uno menos dos i y tres más cuatro i, sombreado y con el borde en trazo discontinuo.',
    (f) => {
      const r = [[-1, -2], [3, -2], [3, 4], [-1, 4]];
      f.region(r);
      f.poli(r, { clase: 'cp', cerrar: true });
    },
    { x: [-3.2, 5.2], y: [-3, 5], mx: [-1, 1, 3], my: [-2, 2, 4] },
  ),
  'exterior-de-un-circulo': lugar(
    'cq1-exterior',
    'El exterior de un círculo',
    'La circunferencia de centro uno más dos i y radio tres, en trazo continuo, con todo lo de fuera sombreado y el disco sin sombrear. El centro está marcado con sus proyecciones sobre los ejes.',
    (f) => {
      f.exteriorDe([(t) => [1 + 3 * Math.cos(t), 2 + 3 * Math.sin(t)]]);
      f.circunferencia(1, 2, 3);
      f.poli([[1, 0], [1, 2]], { clase: 'g' }).poli([[0, 2], [1, 2]], { clase: 'g' });
      f.punto(1, 2, { r: 3 });
    },
    { x: [-3.4, 6.4], y: [-2.4, 5.6], mx: [-2, 1, 4], my: [-1, 2, 5] },
  ),
};

for (const [id, svg] of Object.entries(figuras)) pegaEnPregunta(BANCO, id, svg);
console.log(`${Object.keys(figuras).length} figuras pegadas en ${BANCO}`);
