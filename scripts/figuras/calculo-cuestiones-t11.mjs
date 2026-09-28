/**
 * Las figuras de las cuestiones del tema 11 de Cálculo, las de las
 * diapositivas de «Introducción al análisis de Fourier» (fase E3 de la
 * auditoría del 27 de septiembre de 2026).
 *
 * Se redibujan, no se recortan del PDF (§08), y se calculan con el lienzo:
 * las alturas de los espectros son las de la diapositiva, leídas a 300 ppp;
 * las sumas parciales de la diapositiva 5 se calculan con los cinco primeros
 * términos de la serie de cada función, y los datos de la diapositiva 10 son
 * los nueve puntos de la figura, tal cual —el de t = 8 no coincide con el de
 * t = 0, y así se deja: lo dice el comentario de su pregunta—.
 *
 *   BANCO=<ruta> node scripts/figuras/calculo-cuestiones-t11.mjs
 *
 * Pega cada figura en su pregunta; si la pregunta ya tiene una, se para.
 */
import { lienzo, mosaico } from './lienzo.mjs';
import { pegaEnPregunta } from './pegar.mjs';

/* El destino se puede cambiar para rehacerlas sobre una copia en revisión. */
const BANCO = process.env.BANCO ?? 'src/content/banco/calculo-t11.yaml';
const PI = Math.PI;

/* ── 1, 2 y 4 · los espectros ─────────────────────────────────────────── */

/** La rejilla de fondo: más tenue que las curvas, para leer alturas. */
const REJILLA = 'stroke: var(--rule); stroke-width: 1; fill: none; stroke-dasharray: 2 3;';

/**
 * Un espectro de rayas: una flecha por armónico, hacia abajo si el valor es
 * negativo (así lo dibuja la opción A de la diapositiva 1). El trazo se para
 * donde empieza la punta, para que la punta se vea entera.
 *
 * Los ejes van después de las rayas, para que el halo de sus números quede
 * encima; la raya de la frecuencia cero cae sobre el eje vertical y se pinta
 * al final, porque si no la línea del eje la cruzaría. No tapa ningún número:
 * los de ese eje van a su izquierda.
 */
const espectro = (rayas, { marcasY, armonicos }) => (p) => {
  p.clase('barra', 'stroke: var(--d1); stroke-width: 3; fill: none;');
  p.clase('punta', 'fill: var(--d1); stroke: none;');
  p.clase('rej', REJILLA);
  for (const m of marcasY) p.poli([[-0.15, m], [armonicos + 0.5, m]], { clase: 'rej' });
  const porUnidad = Math.abs(p.Y(1) - p.Y(0));
  const raya = (a, k) => {
    const base = a - (Math.sign(a) * 8) / porUnidad;
    p.poli([[k, 0], [k, base]], { clase: 'barra' });
    p.flecha([k, base], [k, a], { clase: 'barra', punta: 10 });
  };
  rayas.forEach((a, k) => {
    if (a && k > 0) raya(a, k);
  });
  p.ejes({
    nombreX: '',
    nombreY: '',
    marcasX: Array.from({ length: armonicos }, (_, k) => [k + 1, `${k === 0 ? '' : k + 1}F`]),
    marcasY,
  });
  if (rayas[0]) raya(rayas[0], 0);
};

const espectroDeY = mosaico({
  id: 'cq11-espectro-y',
  titulo: 'Tres espectros candidatos para la señal y(t)',
  desc:
    'Tres espectros de rayas, con las frecuencias 0, F, 2F, 3F y 4F en el eje horizontal. ' +
    'En A, una raya hacia abajo de altura 1 en la frecuencia 0, y rayas de 2 en F, 5 en 2F y 3 en 3F. ' +
    'En B, rayas de 1 en 0, 2 en F, 5 en 2F, ninguna en 3F y 3 en 4F. ' +
    'En C, rayas de 1 en 0, 2 en F, 3 en 2F, ninguna en 3F y 5 en 4F.',
  columnas: 3,
  celdas: [
    ['A', [-1, 2, 5, 3, 0]],
    ['B', [1, 2, 5, 0, 3]],
    ['C', [1, 2, 3, 0, 5]],
  ].map(([etiqueta, rayas]) => ({
    etiqueta,
    x: [-0.7, 4.7],
    y: [-1.6, 5.7],
    cuadrado: false,
    dibuja: espectro(rayas, { marcasY: [-1, 1, 2, 3, 4, 5], armonicos: 4 }),
  })),
});

const espectroDeCinco = mosaico({
  id: 'cq11-espectro-cinco',
  titulo: 'Tres espectros candidatos para la señal de cinco términos',
  desc:
    'Tres espectros de rayas, uno debajo de otro, con los armónicos de F a 10F en el eje horizontal. ' +
    'En A, rayas de 12 en F, 7 en 2F y 2 en 5F. En B, rayas de 12 en F, 7 en 4F y 10 en 10F. ' +
    'En C, rayas de 12 en F, 5 en 2F y 10 en 5F.',
  columnas: 1,
  ancho: 340,
  alto: 116,
  celdas: [
    ['A', { 1: 12, 2: 7, 5: 2 }],
    ['B', { 1: 12, 4: 7, 10: 10 }],
    ['C', { 1: 12, 2: 5, 5: 10 }],
  ].map(([etiqueta, r]) => ({
    etiqueta,
    x: [-0.4, 10.7],
    y: [-1.2, 13.2],
    cuadrado: false,
    dibuja: espectro(Array.from({ length: 11 }, (_, k) => r[k] ?? 0), { marcasY: [4, 8, 12], armonicos: 10 }),
  })),
});

const U = [2, 1, 3, 1, 2, 1.5, 1, 3];
const espectroDeV = mosaico({
  id: 'cq11-espectro-v',
  titulo: 'El espectro de u(t) y dos candidatos para el de v(t)',
  desc:
    'Tres espectros de rayas, uno debajo de otro, con las frecuencias de 0 a 7F. ' +
    'El de u(t) tiene rayas de 2, 1, 3, 1, 2, 1,5, 1 y 3. ' +
    'En A, cada raya es la de u multiplicada por 1,5 y con 2 sumado: 5, 3,5, 6,5, 3,5, 5, 4,25, 3,5 y 6,5. ' +
    'En B, la raya de la frecuencia 0 vale 5 y las demás son las de u multiplicadas por 1,5: 1,5, 4,5, 1,5, 3, 2,25, 1,5 y 4,5.',
  columnas: 1,
  ancho: 340,
  alto: 116,
  celdas: [
    ['u(t)', U],
    ['A', U.map((a) => 1.5 * a + 2)],
    ['B', U.map((a, k) => (k === 0 ? 1.5 * a + 2 : 1.5 * a))],
  ].map(([etiqueta, rayas]) => ({
    etiqueta,
    x: [-0.5, 7.6],
    y: [-1, 7.3],
    cuadrado: false,
    dibuja: espectro(rayas, { marcasY: [1, 2, 3, 4, 5, 6, 7], armonicos: 7 }),
  })),
});

/* ── 5 · las sumas parciales ──────────────────────────────────────────── */

/* Cinco términos: el constante y los cuatro primeros armónicos. */
const N = 4;
const sumaV = (t) => {
  let s = 1;
  for (let n = 1; n <= N; n++) s += ((2 * (-1) ** (n + 1)) / (n * PI)) * Math.sin(n * PI * t);
  return s;
};
const sumaU = (t) => 2 - sumaV(t); // u = 1 − t = 2 − v en (−1, 1)
const sumaW = (t) => {
  /* w(t) = t − 1 en (−2, 1): −1,5 más un diente de sierra centrado en −0,5. */
  let s = -1.5;
  for (let n = 1; n <= N; n++) s += ((3 * (-1) ** (n + 1)) / (n * PI)) * Math.sin((2 * n * PI * (t + 0.5)) / 3);
  return s;
};

const suma = (f, marcasY) => (p) => {
  p.clase('rej', REJILLA);
  for (const m of marcasY) p.poli([[-2.7, m], [2.7, m]], { clase: 'rej' });
  p.curva(f, [-2.7, 2.7], { n: 240 });
  p.ejes({ nombreX: 't', nombreY: '', marcasX: [-2, -1, 1, 2], marcasY });
};

const sumasParciales = mosaico({
  id: 'cq11-sumas',
  titulo: 'Tres sumas parciales de series de Fourier',
  desc:
    'Tres gráficas, cada una la suma de cinco términos de una serie de Fourier, con pequeñas ondulaciones. ' +
    'La 1 va de menos 3 a 0, por debajo del eje: sube en rampa y cae de golpe cerca de t igual a 1 y de t igual a menos 2, con periodo 3. ' +
    'La 2 va de 0 a 2: baja en rampa y sube de golpe cerca de t igual a menos 1 y de t igual a 1, con periodo 2. ' +
    'La 3 va de 0 a 2: sube en rampa y cae de golpe cerca de t igual a menos 1 y de t igual a 1, con periodo 2.',
  columnas: 3,
  celdas: [
    { etiqueta: '1', x: [-2.8, 2.8], y: [-3.5, 0.7], dibuja: suma(sumaW, [-3, -2, -1]) },
    { etiqueta: '2', x: [-2.8, 2.8], y: [-0.6, 2.5], dibuja: suma(sumaU, [1, 2]) },
    { etiqueta: '3', x: [-2.8, 2.8], y: [-0.6, 2.5], dibuja: suma(sumaV, [1, 2]) },
  ].map((c) => ({ ...c, cuadrado: false })),
});

/* ── 6 · la onda cuadrada ─────────────────────────────────────────────── */

const ondaCuadrada = (() => {
  const f = lienzo({
    id: 'cq11-cuadrada',
    ancho: 340,
    alto: 150,
    x: [-7.3, 7.6],
    y: [-1.7, 1.8],
    margen: 22,
    titulo: 'La onda cuadrada de periodo dos pi',
    desc:
      'Una función escalonada: vale 1 entre 0 y pi, menos 1 entre menos pi y 0, y se repite con periodo ' +
      'dos pi. Vale 1 también entre menos dos pi y menos pi, y menos 1 entre pi y dos pi.',
  });
  for (let k = -3; k <= 2; k++) {
    const a = Math.max(k * PI, -7.2);
    const b = Math.min((k + 1) * PI, 7.5);
    if (a >= b) continue;
    const v = k % 2 === 0 ? 1 : -1;
    f.poli([[a, v], [b, v]]);
  }
  f.ejes({
    nombreX: 't',
    nombreY: '',
    marcasX: [[-2 * PI, '−2π'], [-PI, '−π'], [PI, 'π'], [2 * PI, '2π']],
  });
  /* Las marcas de ±1 van cada una al lado del eje donde no hay tramo: el 1 a
     la izquierda y el −1 a la derecha, para que ningún tramo tape el número. */
  const tic = 3.5 / Math.abs(f.X(1) - f.X(0));
  f.poli([[-tic, 1], [tic, 1]], { clase: 'eje' }).poli([[-tic, -1], [tic, -1]], { clase: 'eje' });
  f.rotulo(0, 1, '1', { anclaje: 'end', dx: -7, dy: 3.6, pequeno: true, color: 'var(--faint)' });
  f.rotulo(0, -1, '−1', { anclaje: 'start', dx: 7, dy: 3.6, pequeno: true, color: 'var(--faint)' });
  return f.svg();
})();

/* ── 8 · f, g y h ─────────────────────────────────────────────────────── */

const periodica = (pieza) => (t) => {
  const k = Math.round(t / 2);
  return pieza(t - 2 * k);
};

const fgh = mosaico({
  id: 'cq11-fgh',
  titulo: 'Las gráficas de f, g y h',
  desc:
    'Tres gráficas entre t igual a menos 1,5 y 3,5. f(t) es una senoidal de periodo 2 que pasa por el origen ' +
    'subiendo, con máximo 1 en t igual a 0,5 y mínimo menos 1 en t igual a menos 0,5. g(t) es un trozo de cúbica ' +
    'que va de menos 1 en t igual a menos 1 a 1 en t igual a 1, pasando por el origen, y se repite con periodo 2, ' +
    'con un salto en cada entero impar. h(t) es un trozo de parábola que vale 0 en t igual a 0 y 1 en t igual a ' +
    'más y menos 1, repetido con periodo 2: arcos que se tocan en picos en los enteros impares.',
  columnas: 3,
  alto: 120,
  celdas: [
    {
      etiqueta: 'f(t)',
      dibuja: (p) => {
        p.curva((t) => Math.sin(PI * t), [-1.5, 3.5], { n: 200 });
        p.ejes({ nombreX: 't', nombreY: '', marcasX: [-1, 1, 2, 3], marcasY: [[1, '1'], [-1, '−1']] });
      },
    },
    {
      etiqueta: 'g(t)',
      dibuja: (p) => {
        for (let k = -1; k <= 2; k++) {
          const a = Math.max(2 * k - 1, -1.5);
          const b = Math.min(2 * k + 1, 3.5);
          if (a >= b) continue;
          p.curva((t) => (t - 2 * k) ** 3, [a + 0.001, b - 0.001], { n: 60 });
        }
        p.ejes({ nombreX: 't', nombreY: '', marcasX: [-1, 1, 2, 3], marcasY: [[1, '1'], [-1, '−1']] });
      },
    },
    {
      etiqueta: 'h(t)',
      dibuja: (p) => {
        p.curva(periodica((s) => s * s), [-1.5, 3.5], { n: 200 });
        p.ejes({ nombreX: 't', nombreY: '', marcasX: [-1, 1, 2, 3], marcasY: [[1, '1']] });
      },
    },
  ].map((c) => ({ ...c, x: [-1.7, 3.8], y: [-1.35, 1.35], cuadrado: false })),
});

/* ── 10 · los nueve datos ─────────────────────────────────────────────── */

const DATOS = [4, 2, 4, 6, 5, 4, 6, 6, 3];
const muestras = (() => {
  const f = lienzo({
    id: 'cq11-datos',
    ancho: 330,
    alto: 250,
    x: [-0.5, 8.9],
    y: [-0.7, 7.5],
    titulo: 'Los valores conocidos de la señal',
    desc:
      'Nueve puntos sueltos, uno en cada t entero de 0 a 8. Valen 4, 2, 4, 6, 5, 4, 6, 6 y 3: en t igual a 0 ' +
      'vale 4, en t igual a 1 vale 2, y así hasta t igual a 8, que vale 3.',
  });
  f.clase('rej', REJILLA);
  for (let k = 1; k <= 7; k++) f.poli([[0, k], [8.7, k]], { clase: 'rej' });
  for (let k = 1; k <= 8; k++) f.poli([[k, 0], [k, 7.3]], { clase: 'rej' });
  f.ejes({ nombreX: 't', nombreY: 'y', marcasX: [1, 2, 3, 4, 5, 6, 7, 8], marcasY: [1, 2, 3, 4, 5, 6, 7] });
  /* Los puntos, después de los ejes: el de t = 0 cae sobre el eje vertical y
     ninguno tapa un número. */
  DATOS.forEach((v, t) => f.punto(t, v, { r: 4.2 }));
  return f.svg();
})();

const figuras = {
  'espectro-de-la-senal-y': espectroDeY,
  'espectro-de-cinco-terminos': espectroDeCinco,
  'espectro-de-a-u-mas-b': espectroDeV,
  'sumas-parciales-de-tres-funciones': sumasParciales,
  'la-serie-de-leibniz': ondaCuadrada,
  'producto-de-tres-funciones': fgh,
  'coeficientes-a-partir-de-datos': muestras,
};

for (const [id, svg] of Object.entries(figuras)) pegaEnPregunta(BANCO, id, svg);
console.log(`${Object.keys(figuras).length} figuras pegadas en ${BANCO}`);
