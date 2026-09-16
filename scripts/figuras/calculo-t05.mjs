/**
 * Las figuras del tema 5 de Cálculo: la integral de una variable.
 *
 * Nueve dominios planos y dos croquis de sólido de revolución. Todo lo que
 * aquí se dibuja está calculado a partir de las mismas funciones que integra
 * la resolución, así que no puede desmentirla.
 *
 *     node scripts/figuras/calculo-t05.mjs
 */

import { lienzo, mosaico, vista3d } from './lienzo.mjs';
import { pega } from './pegar.mjs';

const FICHERO = 'src/content/calculo/t05-integracion/ejercicios.yaml';

export const figuras = [];
const fig = (id, paso, hacer) => figuras.push({ id, paso, hacer });

/** El contorno de la región entre dos curvas sobre [a,b]. */
const entre = (arriba, abajo, a, b, n = 80) => {
  const p = [];
  for (let k = 0; k <= n; k++) { const x = a + ((b - a) * k) / n; p.push([x, arriba(x)]); }
  for (let k = 0; k <= n; k++) { const x = b + ((a - b) * k) / n; p.push([x, abajo(x)]); }
  return p;
};

/* La función a trozos que sale en dos ejercicios distintos. */
const yTrozos = (x) => (x < 1 ? x : Math.exp(1 - x));
/* Su función media, (1/x)·∫₀ˣ y. Las dos ramas valen ½ en x = 1. */
const mediaTrozos = (x) => (x <= 1 ? x / 2 : (1.5 - Math.exp(1 - x)) / x);
const VALOR_MEDIO = mediaTrozos(2);

/* ── 1 · función media frente a valor medio ──────────────────────────── */
fig('funcion-media-frente-a-valor-medio', 0, () => {
  const l = lienzo({
    id: 'f-media-vs-medio',
    ancho: 360, alto: 250,
    x: [-0.15, 2.25], y: [-0.15, 1.25],
    titulo: 'La función, su función media y el valor medio, los tres en el mismo dibujo',
    desc: 'La función sube recta del origen hasta el punto (1,1) y después baja como una '
      + 'exponencial hasta cero coma treinta y siete. Encima, con otro trazo, la función media: '
      + 'una recta de pendiente un medio hasta x igual a uno y luego una curva que sube despacio. '
      + 'Una horizontal a altura cero coma cinco seis seis marca el valor medio, y la función '
      + 'media la toca justo en x igual a dos.',
  });
  l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2], marcasY: [[VALOR_MEDIO, '0,566'], 1] });
  l.poli([[0, VALOR_MEDIO], [2.2, VALOR_MEDIO]], { clase: 'g' });
  l.curva(yTrozos, [0, 1], { clase: 'c', n: 2 });
  l.curva(yTrozos, [1, 2], { clase: 'c', n: 60 });
  l.curva(mediaTrozos, [0.001, 2], { clase: 'c2', n: 80 });
  l.punto(1, 1, { r: 4 });
  l.punto(2, VALOR_MEDIO, { clase: 'o', r: 4.4 });
  l.rotulo(0.72, 0.72, 'f(x)', { dx: -6, dy: -6, anclaje: 'end', color: 'var(--d1)' });
  l.rotulo(1.6, mediaTrozos(1.6), 'f̄(x)', { dx: 4, dy: -7, color: 'var(--alt)' });
  l.rotulo(2, VALOR_MEDIO, 'f̄ = 0,566', { dx: -6, dy: 16, anclaje: 'end', color: 'var(--flag)' });
  return l.svg();
});

/* ── 2 · girar alrededor de y = 1 ────────────────────────────────────── */
fig('giro-alrededor-de-y-igual-1', 0, () => {
  const P = Math.PI;
  const l = lienzo({
    id: 'f-giro-y1',
    ancho: 360, alto: 240,
    x: [-0.25, P + 0.35], y: [-0.35, 2.35],
    titulo: 'El dominio entre la recta y igual a uno y la curva dos seno de x, con su eje de giro',
    desc: 'La curva y igual a dos seno de x sube del origen hasta dos en pi medios y vuelve a '
      + 'bajar. La recta horizontal y igual a uno la corta en pi sextos y en cinco pi sextos. '
      + 'Entre esos dos cortes, la zona que queda por encima de la recta y por debajo de la curva '
      + 'aparece sombreada: ese es el dominio que gira, y gira alrededor de esa misma recta.',
  });
  l.poli(entre((x) => 2 * Math.sin(x), () => 1, P / 6, (5 * P) / 6), { clase: 'f', cerrar: true });
  l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [[P / 6, 'π/6'], [P / 2, 'π/2'], [(5 * P) / 6, '5π/6']], marcasY: [1, 2] });
  l.curva((x) => 2 * Math.sin(x), [0, P], { clase: 'c' });
  l.poli([[-0.2, 1], [P + 0.3, 1]], { clase: 'c2' });
  l.punto(P / 6, 1, { r: 4 });
  l.punto((5 * P) / 6, 1, { r: 4 });
  l.punto(P / 2, 2, { clase: 'o', r: 4 });
  l.rotulo(P + 0.3, 1, 'eje de giro y = 1', { dy: 16, anclaje: 'end', color: 'var(--alt)' });
  l.rotulo(P / 2, 2, 'y = 2 sen x', { dx: 8, dy: 0, color: 'var(--d1)' });
  return l.svg();
});

/* ── 3 · la función a trozos, sola ───────────────────────────────────── */
fig('la-funcion-valor-medio-de-una-a-trozos', 0, () => {
  const l = lienzo({
    id: 'f-trozos-sola',
    ancho: 340, alto: 235,
    x: [-0.15, 2.25], y: [-0.15, 1.25],
    titulo: 'La función a trozos: una recta hasta el uno y una exponencial que baja',
    desc: 'Un segmento recto del origen al punto (1,1) y, a continuación, la exponencial e '
      + 'elevado a uno menos x, que baja de uno hasta cero coma treinta y siete en x igual a dos. '
      + 'En x igual a uno las dos ramas valen lo mismo: no hay salto, sino un vértice, que es '
      + 'además el máximo de la función.',
  });
  l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2], marcasY: [[Math.exp(-1), '0,37'], 1] });
  l.curva(yTrozos, [0, 1], { clase: 'c', n: 2 });
  l.curva(yTrozos, [1, 2], { clase: 'c', n: 60 });
  l.punto(1, 1, { clase: 'o', r: 4.4 });
  l.punto(2, Math.exp(-1), { r: 4 });
  l.rotulo(1, 1, 'vértice (1,1)', { dx: 8, dy: -5, color: 'var(--flag)' });
  l.rotulo(0.5, 0.5, 'y = x', { dx: 6, dy: 14, color: 'var(--d1)' });
  l.rotulo(1.6, yTrozos(1.6), 'y = e^(1−x)', { dx: 8, dy: -6, color: 'var(--d1)' });
  return l.svg();
});

/* ── 4 · cuatro tramos ───────────────────────────────────────────────── */
fig('el-valor-medio-con-cuatro-tramos', 0, () => {
  const y = (x) => (x <= 1 ? x * x : x <= 4 ? Math.abs(x - 2) : 2);
  const l = lienzo({
    id: 'f-cuatro-tramos',
    ancho: 360, alto: 220,
    x: [-0.3, 5.4], y: [-0.35, 2.45],
    titulo: 'Los cuatro tramos: parábola, uve y meseta',
    desc: 'De cero a uno, una parábola que sube hasta el uno. De uno a dos, una recta que baja '
      + 'hasta cero. De dos a cuatro, otra recta que sube hasta dos: las dos forman una uve con '
      + 'el vértice en el punto (2,0). De cuatro a cinco, un tramo horizontal a altura dos. No '
      + 'hay ningún salto en los tres empalmes.',
  });
  l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2, 3, 4, 5], marcasY: [1, 2] });
  l.curva(y, [0, 1], { clase: 'c', n: 40 });
  l.poli([[1, 1], [2, 0], [4, 2], [5, 2]], { clase: 'c' });
  for (const [px, py] of [[1, 1], [4, 2], [5, 2]]) l.punto(px, py, { r: 3.6 });
  l.punto(2, 0, { clase: 'o', r: 4.4 });
  l.rotulo(2, 0, 'vértice de la uve', { dx: 10, dy: -9, color: 'var(--flag)' });
  l.rotulo(0.55, 0.3, 'x²', { dx: -6, dy: 0, anclaje: 'end', color: 'var(--d1)' });
  l.rotulo(4.5, 2, 'y = 2', { dy: -8, anclaje: 'middle', color: 'var(--d1)' });
  return l.svg();
});

/* ── 5 · el área y el volumen de la exponencial ──────────────────────── */
fig('el-area-y-el-volumen-de-la-exponencial', 0, () => {
  const p3 = vista3d({ escalaXY: 0.5, inclinacion: 0.4 });
  return mosaico({
    id: 'f-exp-area-volumen',
    titulo: 'El dominio bajo la exponencial y el sólido de trompeta que genera al girar',
    desc: 'A la izquierda, el dominio: la curva e elevado a x entre x igual a uno y x igual a '
      + 'dos, cerrado por abajo con el eje horizontal y por los lados con dos verticales. Sube de '
      + 'dos coma setenta y dos a siete coma treinta y nueve. A la derecha, el sólido que resulta '
      + 'de girarlo alrededor del eje horizontal: una trompeta que se ensancha mucho hacia la '
      + 'derecha, con la boca bastante más grande que el cuello. Ese segundo dibujo es un '
      + 'croquis con el eje estirado: a escala, el sólido sería más ancho que largo y no se '
      + 'distinguiría nada.',
    columnas: 2,
    ancho: 210,
    alto: 190,
    celdas: [
      {
        etiqueta: 'el dominio D',
        x: [-0.2, 2.45], y: [-0.7, 8.9], cuadrado: false, margen: 22,
        dibuja: (l) => {
          l.poli(entre(Math.exp, () => 0, 1, 2), { clase: 'f', cerrar: true });
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2], marcasY: [[Math.E, 'e'], [Math.E ** 2, 'e²']] });
          l.curva(Math.exp, [0, 2.17], { clase: 'c', n: 60 });
          l.poli([[1, 0], [1, Math.E]], { clase: 'cp2' });
          l.poli([[2, 0], [2, Math.E ** 2]], { clase: 'cp2' });
        },
      },
      {
        /* Croquis, no a escala: el sólido mide una unidad de largo y hasta
           siete coma cuatro de radio, así que dibujado a escala sería una
           moneda y no se vería nada. Se estira el eje, y se dice. */
        etiqueta: 'el sólido · croquis',
        x: [0.72, 2.3], y: [-9.2, 9.2], cuadrado: false, margen: 16,
        dibuja: (l) => {
          const R = Math.exp;
          l.poli(entre(R, (x) => -R(x), 1, 2), { clase: 'f', cerrar: true });
          l.poli([[0.78, 0], [2.25, 0]], { clase: 'eje' });
          l.curva(R, [1, 2], { clase: 'c', n: 40 });
          l.curva((x) => -R(x), [1, 2], { clase: 'c', n: 40 });
          /* Las dos bocas, en elipse: el radio de verdad en vertical y un
             achatamiento fijo en horizontal, que es como se dibuja a mano. */
          for (const [x, cl] of [[1, 'cp'], [2, 'c']]) {
            l.poli(Array.from({ length: 73 }, (_, k) => {
              const t = (2 * Math.PI * k) / 72;
              return [x + 0.11 * Math.sin(t), R(x) * Math.cos(t)];
            }), { clase: cl });
          }
          l.rotulo(2.25, 0, 'OX', { dy: -7, anclaje: 'end', color: 'var(--faint)', pequeno: true });
          l.rotulo(2, R(2), 'boca e²', { dx: -4, dy: -7, anclaje: 'end', color: 'var(--d1)' });
          l.rotulo(1, R(1), 'cuello e', { dx: 4, dy: -7, color: 'var(--d1)' });
        },
      },
    ],
  });
});

/* ── 6 · área, volumen y perímetro del mismo dominio ─────────────────── */
fig('area-volumen-y-perimetro-de-un-mismo-dominio', 0, () => {
  const l = lienzo({
    id: 'f-lente-x-x2',
    ancho: 300, alto: 250,
    x: [-0.12, 1.2], y: [-0.12, 1.2], cuadrado: true,
    titulo: 'La lente entre la recta y la parábola, de anchura máxima un cuarto',
    desc: 'La recta y igual a x por encima y la parábola y igual a x al cuadrado por debajo, '
      + 'entre el origen y el punto (1,1), que son sus dos únicos cortes. Entre las dos queda una '
      + 'lente delgada cuya separación máxima, un cuarto, se da en x igual a un medio. El dominio '
      + 'solo toca el eje horizontal en el origen.',
  });
  l.poli(entre((x) => x, (x) => x * x, 0, 1), { clase: 'f', cerrar: true });
  l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1], marcasY: [1] });
  l.curva((x) => x, [0, 1.15], { clase: 'c' });
  l.curva((x) => x * x, [0, 1.08], { clase: 'c2' });
  l.poli([[0.5, 0.25], [0.5, 0.5]], { clase: 'g' });
  l.punto(0, 0, { r: 4 });
  l.punto(1, 1, { r: 4 });
  l.rotulo(0.5, 0.375, '¼', { dx: 6, dy: 4, color: 'var(--faint)', pequeno: true });
  l.rotulo(0.85, 0.85, 'y = x', { dx: -6, dy: -6, anclaje: 'end', color: 'var(--d1)' });
  l.rotulo(0.95, 0.9, 'y = x²', { dx: 6, dy: 14, color: 'var(--alt)' });
  return l.svg();
});

/* ── 7 · la raíz contra el valor absoluto ────────────────────────────── */
fig('la-raiz-contra-el-valor-absoluto', 0, () => {
  const raiz = (x) => Math.sqrt(x / 2);
  const uve = (x) => Math.abs(1 - x);
  const l = lienzo({
    id: 'f-raiz-vs-uve',
    ancho: 330, alto: 235,
    x: [-0.15, 2.3], y: [-0.15, 1.25],
    titulo: 'La hoja entre la raíz y la uve del valor absoluto',
    desc: 'La curva raíz de x partido por dos sube del origen al punto (2,1), creciente y '
      + 'cóncava. La uve del valor absoluto de uno menos x baja de (0,1) al vértice (1,0) y '
      + 'vuelve a subir hasta (2,1). Se cortan en (0,5 ; 0,5) y en (2,1), y entre esos dos cortes '
      + 'queda una hoja que toca el eje horizontal en el vértice de la uve.',
  });
  l.poli([
    ...Array.from({ length: 61 }, (_, k) => { const x = 0.5 + (1.5 * k) / 60; return [x, raiz(x)]; }),
    [2, 1], [1, 0], [0.5, 0.5],
  ], { clase: 'f', cerrar: true });
  l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [[0.5, '½'], 1, 2], marcasY: [[0.5, '½'], 1] });
  l.curva(raiz, [0, 2.2], { clase: 'c', n: 80 });
  l.poli([[0, 1], [1, 0], [2.2, 1.2]], { clase: 'c2' });
  l.punto(0.5, 0.5, { r: 4 });
  l.punto(2, 1, { r: 4 });
  l.punto(1, 0, { clase: 'o', r: 4 });
  l.rotulo(0.5, 0.5, '(½,½)', { dx: -7, dy: -6, anclaje: 'end' });
  l.rotulo(2, 1, '(2,1)', { dx: -4, dy: -8, anclaje: 'end' });
  l.rotulo(1.55, raiz(1.55), 'y = √(x/2)', { dx: 4, dy: 15, color: 'var(--d1)' });
  l.rotulo(0.3, 0.7, 'y = |1−x|', { dx: -4, dy: -6, anclaje: 'end', color: 'var(--alt)' });
  return l.svg();
});

/* ── 8 · entre la hipérbola y la bisectriz ───────────────────────────── */
fig('entre-la-hiperbola-y-la-bisectriz', 0, () => {
  const l = lienzo({
    id: 'f-hiperbola-bisectriz',
    ancho: 320, alto: 245,
    x: [-0.2, 2.5], y: [-0.2, 2.4], cuadrado: true,
    titulo: 'La cuña entre la bisectriz y la hipérbola, de x igual a uno a x igual a dos',
    desc: 'La bisectriz y igual a x por encima y la hipérbola y igual a uno partido por x por '
      + 'debajo. En x igual a uno las dos valen uno y el dominio se cierra en punta. En x igual a '
      + 'dos la separación es máxima, de un medio a dos, y un lado vertical lo cierra. El dominio '
      + 'no llega a tocar el eje horizontal.',
  });
  l.poli(entre((x) => x, (x) => 1 / x, 1, 2), { clase: 'f', cerrar: true });
  l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2], marcasY: [[0.5, '½'], 1, 2] });
  l.curva((x) => x, [0, 2.3], { clase: 'c' });
  l.curva((x) => 1 / x, [0.42, 2.4], { clase: 'c2', n: 80 });
  l.poli([[2, 0.5], [2, 2]], { clase: 'cp' });
  l.punto(1, 1, { clase: 'o', r: 4.4 });
  l.rotulo(1, 1, 'se cierra en punta', { dx: 10, dy: -9, color: 'var(--flag)' });
  l.rotulo(2, 1.25, '3/2', { dx: 7, dy: 4, color: 'var(--faint)', pequeno: true });
  l.rotulo(2.2, 2.2, 'y = x', { dx: -4, dy: 14, anclaje: 'end', color: 'var(--d1)' });
  l.rotulo(2.3, 1 / 2.3, 'y = 1/x', { dx: 2, dy: 14, anclaje: 'end', color: 'var(--alt)' });
  return l.svg();
});

/* ── 9 · la parábola tumbada, y el parámetro del área ────────────────── */
fig('la-parabola-tumbada-y-el-parametro-del-area', 0, () =>
  mosaico({
    id: 'f-parabola-tumbada',
    titulo: 'Los dos dominios: la parábola tumbada y la lente entre la recta y la parábola',
    desc: 'A la izquierda, la parábola y al cuadrado igual a cuatro más x, tumbada y abierta '
      + 'hacia la derecha, con el vértice en el punto (−4,0) y cortada por la vertical x igual a '
      + 'dos en más y menos raíz de seis, unos dos coma cuarenta y cinco. A la derecha, la recta '
      + 'y igual a tres x por encima de la parábola y igual a x al cuadrado entre el origen y el '
      + 'punto (3,9): una lente cuya anchura máxima, nueve cuartos, se da en x igual a tres '
      + 'medios.',
    columnas: 2,
    ancho: 215,
    alto: 195,
    celdas: [
      {
        etiqueta: 'problema 6 · franjas horizontales',
        x: [-4.8, 2.8], y: [-3, 3], cuadrado: false, margen: 20,
        dibuja: (l) => {
          const xDe = (y) => y * y - 4;
          l.poli([
            ...Array.from({ length: 61 }, (_, k) => { const y = -Math.sqrt(6) + (2 * Math.sqrt(6) * k) / 60; return [xDe(y), y]; }),
            [2, Math.sqrt(6)], [2, -Math.sqrt(6)],
          ], { clase: 'f', cerrar: true });
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-4, 2], marcasY: [] });
          l.curva((y) => [xDe(y), y], [-Math.sqrt(6) - 0.15, Math.sqrt(6) + 0.15], { clase: 'c', n: 80 });
          l.poli([[2, -2.9], [2, 2.9]], { clase: 'cp2' });
          l.punto(-4, 0, { clase: 'o', r: 4 });
          l.punto(2, Math.sqrt(6), { r: 3.6 });
          l.punto(2, -Math.sqrt(6), { r: 3.6 });
          l.rotulo(2, Math.sqrt(6), '√6', { dx: -5, dy: -6, anclaje: 'end' });
        },
      },
      {
        etiqueta: 'problema 7 · a = 3',
        x: [-0.6, 3.6], y: [-1, 9.8], cuadrado: false, margen: 20,
        dibuja: (l) => {
          l.poli(entre((x) => 3 * x, (x) => x * x, 0, 3), { clase: 'f', cerrar: true });
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [[1.5, '3/2'], 3], marcasY: [9] });
          l.curva((x) => 3 * x, [0, 3.3], { clase: 'c' });
          l.curva((x) => x * x, [-0.5, 3.15], { clase: 'c2', n: 60 });
          l.poli([[1.5, 2.25], [1.5, 4.5]], { clase: 'g' });
          l.punto(0, 0, { r: 3.6 });
          l.punto(3, 9, { r: 3.6 });
          l.rotulo(1.5, 3.4, '9/4', { dx: 5, dy: 4, color: 'var(--faint)', pequeno: true });
        },
      },
    ],
  }));

/* ── a pegar ─────────────────────────────────────────────────────────── */
for (const f of figuras) f.svg = f.hacer();

if (process.argv[1]?.endsWith('calculo-t05.mjs')) {
  for (const f of figuras) pega(FICHERO, f.id, f.svg, f.paso);
  console.log(`${figuras.length} figuras pegadas en ${FICHERO}`);
}
