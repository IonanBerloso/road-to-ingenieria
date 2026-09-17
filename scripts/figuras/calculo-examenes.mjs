/**
 * Las figuras de los pasos `dibujar` de las convocatorias de Cálculo.
 *
 * Cuarenta y nueve, repartidas por treinta y cinco ficheros. Nueve de ellas
 * son, punto por punto, el mismo dibujo que un ejemplo de su tema: en esos
 * casos se reutiliza la figura del tema con otro prefijo de ids en vez de
 * escribirla dos veces, que es como se acaba con dos versiones que no
 * coinciden.
 *
 *     node scripts/figuras/calculo-examenes.mjs
 */

import { lienzo, mosaico, vista3d, reetiqueta } from './lienzo.mjs';
import { pega } from './pegar.mjs';
import { figuras as t01 } from './calculo-t01.mjs';
import { figuras as t06 } from './calculo-t06.mjs';
import { figuras as t07 } from './calculo-t07.mjs';

const EX = 'src/content/calculo/examenes';

export const figuras = [];
/** Cada figura sabe en qué convocatoria vive. */
const fig = (convocatoria, id, hacer, paso = 0) =>
  figuras.push({ fichero: `${EX}/${convocatoria}/ejercicios.yaml`, id, paso, hacer });

const g = (grados) => (grados * Math.PI) / 180;
const pol = (r, a) => [r * Math.cos(a), r * Math.sin(a)];

const aro = (cx, cy, r, n = 120) =>
  Array.from({ length: n + 1 }, (_, k) => {
    const t = (2 * Math.PI * k) / n;
    return [cx + r * Math.cos(t), cy + r * Math.sin(t)];
  });

const oval = (cx, cy, a, b, n = 140) =>
  Array.from({ length: n + 1 }, (_, k) => {
    const t = (2 * Math.PI * k) / n;
    return [cx + a * Math.cos(t), cy + b * Math.sin(t)];
  });

const entre = (arriba, abajo, a, b, n = 80) => {
  const p = [];
  for (let k = 0; k <= n; k++) { const x = a + ((b - a) * k) / n; p.push([x, arriba(x)]); }
  for (let k = 0; k <= n; k++) { const x = b + ((a - b) * k) / n; p.push([x, abajo(x)]); }
  return p;
};

/** El arco de una circunferencia entre dos ángulos. */
const arco = (cx, cy, r, a0, a1, n = 90) =>
  Array.from({ length: n + 1 }, (_, k) => {
    const t = a0 + ((a1 - a0) * k) / n;
    return [cx + r * Math.cos(t), cy + r * Math.sin(t)];
  });

/** Busca en un generador de tema la figura ya hecha. */
const deTema = (lista, id) => {
  const f = lista.find((x) => x.id === id);
  if (!f) throw new Error(`no está la figura ${id}`);
  return f.svg;
};

/** Un círculo hueco: el símbolo de «este punto no entra». */
const hueco = (l, id, x, y, r = 4.2) =>
  l.crudo(`<circle class="${id}-hueco" cx="${Math.round(l.X(x) * 10) / 10}" cy="${Math.round(l.Y(y) * 10) / 10}" r="${r}"/>`);

/* ══ las nueve que repiten un ejemplo del tema ══════════════════════════ */

fig('2014-2015-4ev', 'ex1415-4ev-2-donde-la-derivada-maxima-vale-cuatro', () =>
  reetiqueta(deTema(t06, 'donde-la-maxima-vale-cuatro'), 'f-maxima-cuatro', 'f-ex1415-maxima'));

fig('2015-2016-2ev', 'ex1516-2ev-1-exponencial-compleja', () =>
  reetiqueta(deTema(t01, 'ecuacion-exponencial'), 'f-exponencial', 'f-ex1516-exponencial'));

fig('2017-2018-1ev', 'ex1718-1-semicircunferencia', () =>
  reetiqueta(deTema(t01, 'lugar-argumento-cociente'), 'f-arg-cociente', 'f-ex1718-semicirc'));

fig('2017-2018-4ev-rec', 'ex1718-rec-1-la-elipse-cortada-por-el-sector', () =>
  reetiqueta(deTema(t01, 'lugar-elipse-sector'), 'f-elipse-sector', 'f-ex1718-elipse-sector'));

fig('2018-2019-1ev', 'ex1819-1-lente-de-dos-discos', () =>
  reetiqueta(deTema(t01, 'lugar-inverso-desplazado'), 'f-inverso-lente', 'f-ex1819-lente'));

fig('2018-2019-1ev', 'ex1819-2-bicubica', () =>
  reetiqueta(deTema(t01, 'ecuacion-bicubica'), 'f-bicubica', 'f-ex1819-bicubica'));

fig('2018-2019-4ev-rec', 'ex1819-rec-1-una-desigualdad-que-no-esta-definida', () =>
  reetiqueta(deTema(t01, 'lugar-dos-condiciones-modulo'), 'f-dos-modulos', 'f-ex1819-luna'));

fig('2018-2019-4ev', 'ex1819-4ev-2-el-rombo-que-se-vuelve-cuadrado', () =>
  reetiqueta(deTema(t07, 'el-rombo-y-el-cambio-que-lo-endereza'), 'f-rombo-cambio', 'f-ex1819-rombo'));

fig('2018-2019-4ev', 'ex1819-4ev-3-cono-paraboloide-y-momento', () =>
  reetiqueta(deTema(t07, 'el-cono-tapado-por-un-paraboloide'), 'f-cono-tapado', 'f-ex1819-cono'));

fig('2019-2020-4ev-rec', 'ex1920-rec-1-media-recta-y-parabola', () =>
  reetiqueta(deTema(t01, 'lugar-mediatriz-parabola'), 'f-mediatriz-parabola', 'f-ex1920-mediatriz'));

/* ══ sólidos: corte y proyección ════════════════════════════════════════ */

/** El molde de los sólidos de revolución: corte a la izquierda, planta a la derecha. */
const solido = ({ id, titulo, desc, corte, planta, etiquetaCorte = 'el corte por XZ', etiquetaPlanta = 'la proyección sobre XY' }) =>
  mosaico({
    id, titulo, desc,
    columnas: 2, ancho: 205, alto: 185,
    celdas: [{ etiqueta: etiquetaCorte, ...corte }, { etiqueta: etiquetaPlanta, ...planta }],
  });

/** Un disco en planta, con su radio rotulado. */
const planta = (id, R, etiqueta) => ({
  x: [-R * 1.3, R * 1.3], y: [-R * 1.3, R * 1.3], cuadrado: true,
  dibuja: (l) => {
    l.poli(aro(0, 0, R), { clase: 'f', cerrar: true });
    l.ejes({ nombreX: 'x', nombreY: 'y' });
    l.poli(aro(0, 0, R), { clase: 'c' });
    l.rotulo(0, 0, etiqueta, { dx: 0, dy: -9, anclaje: 'middle' });
  },
});

fig('2014-2015-4ev', 'ex1415-4ev-1-masa-bajo-el-paraboloide', () =>
  solido({
    id: 'f-ex1415-masa',
    titulo: 'El cilindro de radio dos rematado por un paraboloide, y su planta',
    desc: 'A la izquierda, el corte por el plano y igual a cero: un rectángulo que va de menos '
      + 'dos a dos, apoyado en el suelo z igual a cero, rematado por arriba por la parábola z '
      + 'igual a x al cuadrado más dos, que sube de dos en el eje a seis en la pared. A la '
      + 'derecha, la planta: el disco de radio dos.',
    corte: {
      x: [-3, 3], y: [-1, 7], cuadrado: false,
      dibuja: (l) => {
        l.poli(entre((x) => x * x + 2, () => 0, -2, 2), { clase: 'f', cerrar: true });
        l.ejes({ nombreX: 'x', nombreY: 'z', marcasX: [-2, 2], marcasY: [2, 6] });
        l.curva((x) => x * x + 2, [-2, 2], { clase: 'c', n: 60 });
        l.poli([[-2, 0], [-2, 6]], { clase: 'c2' });
        l.poli([[2, 0], [2, 6]], { clase: 'c2' });
        l.poli([[-2, 0], [2, 0]], { clase: 'c2' });
        l.rotulo(0, 2, 'z = r²+2', { dx: 0, dy: -8, anclaje: 'middle', color: 'var(--d1)' });
      },
    },
    planta: planta('f-ex1415-masa', 2, 'r ≤ 2'),
  }));

fig('2015-2016-4ev', 'ex1516-4ev-1-paraboloide-y-su-centro', () =>
  solido({
    id: 'f-ex1516-parab',
    titulo: 'El paraboloide boca abajo con vértice en z igual a uno, y su disco base',
    desc: 'A la izquierda, el corte: la parábola z igual a uno menos x al cuadrado, con el '
      + 'vértice arriba en z igual a uno, apoyada en el suelo z igual a cero, donde corta en x '
      + 'igual a más y menos uno. El centro de gravedad se marca sobre el eje, por debajo de la '
      + 'altura un medio. A la derecha, la planta: el disco de radio uno.',
    corte: {
      x: [-1.6, 1.6], y: [-0.45, 1.45], cuadrado: false,
      dibuja: (l) => {
        l.poli(entre((x) => 1 - x * x, () => 0, -1, 1), { clase: 'f', cerrar: true });
        l.ejes({ nombreX: 'x', nombreY: 'z', marcasX: [-1, 1], marcasY: [1] });
        l.curva((x) => 1 - x * x, [-1, 1], { clase: 'c', n: 60 });
        l.poli([[-1, 0], [1, 0]], { clase: 'c2' });
        l.punto(0, 1 / 3, { clase: 'o', r: 4 });
        l.rotulo(0, 1 / 3, 'G', { dx: 7, dy: 4, color: 'var(--flag)' });
      },
    },
    planta: planta('f-ex1516-parab', 1, 'r ≤ 1'),
  }));

fig('2017-2018-4ev', 'ex1718-4ev-3-paraboloide-dentro-del-cilindro', () =>
  solido({
    id: 'f-ex1718-cilindro',
    titulo: 'El cilindro de radio uno con tapa parabólica, que baja de cinco a cuatro',
    desc: 'A la izquierda, el corte: un rectángulo estrecho de menos uno a uno sobre el suelo, '
      + 'con la tapa curva z igual a cinco menos x al cuadrado, que baja de cinco en el eje a '
      + 'cuatro en la pared. La superficie tiene tres piezas: base plana, lateral recto y tapa '
      + 'curva. A la derecha, la planta: el disco de radio uno.',
    corte: {
      x: [-1.7, 1.7], y: [-0.8, 6], cuadrado: false,
      dibuja: (l) => {
        l.poli(entre((x) => 5 - x * x, () => 0, -1, 1), { clase: 'f', cerrar: true });
        l.ejes({ nombreX: 'x', nombreY: 'z', marcasX: [-1, 1], marcasY: [4, 5] });
        l.curva((x) => 5 - x * x, [-1, 1], { clase: 'c', n: 40 });
        l.poli([[-1, 0], [-1, 4]], { clase: 'c2' });
        l.poli([[1, 0], [1, 4]], { clase: 'c2' });
        l.poli([[-1, 0], [1, 0]], { clase: 'c2' });
      },
    },
    planta: planta('f-ex1718-cilindro', 1, 'r ≤ 1'),
  }));

fig('2022-2023-ord', 'ex2223-ord-5-la-esfera-cortada-por-el-cilindro', () =>
  solido({
    id: 'f-ex2223-esfera',
    etiquetaCorte: 'el corte por el plano x = 0',
    titulo: 'La media bola de radio cuatro mordida por el cilindro tangente de radio dos',
    desc: 'A la izquierda, el corte por el plano x igual a cero: la media circunferencia superior '
      + 'de radio cuatro, con las dos generatrices del cilindro en y igual a cero y en y igual a '
      + 'cuatro. A la derecha, la clave: la proyección sobre el plano XY es el disco de centro '
      + '(0,2) y radio dos, tangente por dentro a la circunferencia de radio cuatro y con el '
      + 'origen justo en su borde.',
    corte: {
      x: [-4.8, 4.8], y: [-1.2, 4.8], cuadrado: false,
      dibuja: (l) => {
        l.poli([
          ...arco(0, 0, 4, 0, Math.PI / 2, 60).filter(([u]) => u <= 4),
          [0, 0],
        ], { clase: 'f', cerrar: true });
        l.ejes({ nombreX: 'y', nombreY: 'z', marcasX: [2, 4, -4], marcasY: [4] });
        l.poli(arco(0, 0, 4, 0, Math.PI, 90), { clase: 'c' });
        l.poli([[0, -1], [0, 4.6]], { clase: 'cp2' });
        l.poli([[4, -1], [4, 4.6]], { clase: 'cp2' });
        l.punto(4, 0, { clase: 'o', r: 3.8 });
      },
    },
    planta: {
      x: [-4.8, 4.8], y: [-4.8, 4.8], cuadrado: true,
      dibuja: (l) => {
        l.poli(aro(0, 2, 2), { clase: 'f', cerrar: true });
        l.ejes({ nombreX: 'x', nombreY: 'y', marcasY: [2, 4] });
        l.poli(aro(0, 0, 4), { clase: 'g' });
        l.poli(aro(0, 2, 2), { clase: 'c' });
        l.punto(0, 4, { clase: 'o', r: 3.6 });
        l.punto(0, 0, { clase: 'o', r: 3.6 });
        l.rotulo(2, 2, 'r = 4senθ', { dx: -4, dy: -7, anclaje: 'end' });
      },
    },
  }));

fig('2024-2025-4ev', 'ex2425-4ev-2-cono-y-paraboloide-invertidos', () =>
  solido({
    id: 'f-ex2425-invertido',
    titulo: 'El sólido entre el cono y el paraboloide, entero por debajo del plano z igual a cero',
    desc: 'A la izquierda, el corte: una uve invertida que baja del origen con pendiente más y '
      + 'menos uno —el cono— y, por debajo, el arco de la parábola z igual a x al cuadrado menos '
      + 'seis, con el vértice en z igual a menos seis. Se cortan en x igual a más y menos dos, a '
      + 'la altura menos dos. Todo el sólido queda bajo el plano z igual a cero. A la derecha, la '
      + 'planta: el disco de radio dos.',
    corte: {
      x: [-3, 3], y: [-7, 1], cuadrado: false,
      dibuja: (l) => {
        l.poli(entre((x) => -Math.abs(x), (x) => x * x - 6, -2, 2), { clase: 'f', cerrar: true });
        l.ejes({ nombreX: 'x', nombreY: 'z', marcasX: [-2, 2], marcasY: [-2, -6] });
        l.poli([[-2.5, -2.5], [0, 0], [2.5, -2.5]], { clase: 'c' });
        l.curva((x) => x * x - 6, [-2.6, 2.6], { clase: 'c2', n: 60 });
        l.punto(2, -2, { clase: 'o', r: 3.8 });
        l.punto(-2, -2, { clase: 'o', r: 3.8 });
        l.rotulo(2, -2, 'r=2, z=−2', { dx: -7, dy: -6, anclaje: 'end', color: 'var(--flag)' });
      },
    },
    planta: planta('f-ex2425-invertido', 2, 'r ≤ 2'),
  }));

/* ══ sólidos con eje que no es OZ, y el octante ═════════════════════════ */

fig('2021-2022-4ev', 'ex2122-4ev-3-paraboloide-eliptico', () =>
  mosaico({
    id: 'f-ex2122-parab-tumbado',
    titulo: 'El paraboloide elíptico tumbado sobre el eje OX, y la elipse de su tapa',
    desc: 'A la izquierda, el corte por el plano z igual a cero: la parábola y al cuadrado igual '
      + 'a nueve x, tumbada y abierta hacia la derecha desde el origen, cerrada por la vertical x '
      + 'igual a tres, donde llega a más y menos cinco coma veinte. A la derecha, la tapa: la '
      + 'elipse de semiejes tres raíz de tres en la dirección y y tres en la dirección z.',
    columnas: 2, ancho: 205, alto: 185,
    celdas: [
      {
        etiqueta: 'el corte por z = 0',
        x: [-0.6, 3.8], y: [-6, 6], cuadrado: false,
        dibuja: (l) => {
          const xDe = (y) => (y * y) / 9;
          l.poli([
            ...Array.from({ length: 61 }, (_, k) => { const y = -3 * Math.sqrt(3) + (6 * Math.sqrt(3) * k) / 60; return [xDe(y), y]; }),
            [3, 3 * Math.sqrt(3)], [3, -3 * Math.sqrt(3)],
          ], { clase: 'f', cerrar: true });
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [3], marcasY: [5, -5] });
          l.curva((y) => [xDe(y), y], [-5.5, 5.5], { clase: 'c', n: 80 });
          l.poli([[3, -5.8], [3, 5.8]], { clase: 'cp2' });
        },
      },
      {
        etiqueta: 'la tapa en x = 3',
        x: [-6.2, 6.2], y: [-4.2, 4.2], cuadrado: false,
        dibuja: (l) => {
          l.poli(oval(0, 0, 3 * Math.sqrt(3), 3), { clase: 'f', cerrar: true });
          l.ejes({ nombreX: 'y', nombreY: 'z', marcasX: [5], marcasY: [3] });
          l.poli(oval(0, 0, 3 * Math.sqrt(3), 3), { clase: 'c' });
          l.rotulo(0, 0, 'y²/27 + z²/9 = 1', { dx: 0, dy: -8, anclaje: 'middle' });
        },
      },
    ],
  }));

fig('2022-2023-4ev', 'ex2223-4ev-3-cono-eliptico-en-y', () =>
  mosaico({
    id: 'f-ex2223-cono-y',
    titulo: 'El cono de eje OY: el corte triangular y la base elíptica de semiejes 2 y 3',
    desc: 'A la izquierda, el corte por el plano z igual a cero: un triángulo con el vértice en '
      + 'el origen que se abre hacia y positivo hasta llegar a más y menos dos en y igual a uno. '
      + 'El eje del cono es OY, no OZ. A la derecha, la base en y igual a uno: la elipse de '
      + 'semiejes dos en la dirección x y tres en la dirección z, que no es una circunferencia.',
    columnas: 2, ancho: 205, alto: 185,
    celdas: [
      {
        etiqueta: 'el corte por z = 0',
        x: [-0.25, 1.35], y: [-2.6, 2.6], cuadrado: false,
        dibuja: (l) => {
          l.poli([[0, 0], [1, 2], [1, -2]], { clase: 'f', cerrar: true });
          l.ejes({ nombreX: 'y', nombreY: 'x', marcasX: [1], marcasY: [2, -2] });
          l.poli([[0, 0], [1, 2], [1, -2]], { clase: 'c', cerrar: true });
          l.punto(0, 0, { clase: 'o', r: 4 });
          l.rotulo(0, 0, 'vértice', { dx: 6, dy: -7, color: 'var(--flag)' });
          l.rotulo(1, 0, 'x = ±2y', { dx: -5, dy: -8, anclaje: 'end', color: 'var(--d1)' });
        },
      },
      {
        etiqueta: 'la base en y = 1',
        x: [-2.8, 2.8], y: [-3.8, 3.8], cuadrado: false,
        dibuja: (l) => {
          l.poli(oval(0, 0, 2, 3), { clase: 'f', cerrar: true });
          l.ejes({ nombreX: 'x', nombreY: 'z', marcasX: [2], marcasY: [3] });
          l.poli(oval(0, 0, 2, 3), { clase: 'c' });
          l.rotulo(0, 0, 'x²/4 + z²/9 = 1', { dx: 0, dy: -8, anclaje: 'middle' });
        },
      },
    ],
  }));

fig('2023-2024-4ev', 'ex2324-4ev-3-cono-eliptico-planteado', () =>
  mosaico({
    id: 'f-ex2324-cono-doble',
    titulo: 'El cono doble de eje OX: el corte en pajarita y las dos tapas de distinto tamaño',
    desc: 'A la izquierda, el corte por el plano z igual a cero: dos triángulos que comparten el '
      + 'vértice en el origen, uno abriendo hacia x positivo hasta más y menos seis en x igual a '
      + 'dos, y otro más pequeño hacia x negativo hasta más y menos tres en x igual a menos uno. '
      + 'A la derecha, las dos tapas: la de x igual a dos, de semiejes seis y cuatro, y dentro la '
      + 'de x igual a menos uno, de semiejes tres y dos, las dos elipses en proporción tres a '
      + 'dos.',
    columnas: 2, ancho: 205, alto: 185,
    celdas: [
      {
        etiqueta: 'el corte por z = 0',
        x: [-1.6, 2.6], y: [-7.2, 7.2], cuadrado: false,
        dibuja: (l) => {
          l.poli([[0, 0], [2, 6], [2, -6]], { clase: 'f', cerrar: true });
          l.poli([[0, 0], [-1, 3], [-1, -3]], { clase: 'f', cerrar: true });
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [2, -1], marcasY: [6, 3] });
          l.poli([[0, 0], [2, 6], [2, -6]], { clase: 'c', cerrar: true });
          l.poli([[0, 0], [-1, 3], [-1, -3]], { clase: 'c2', cerrar: true });
          l.punto(0, 0, { clase: 'o', r: 4 });
        },
      },
      {
        etiqueta: 'las dos tapas',
        x: [-7, 7], y: [-4.6, 4.6], cuadrado: false,
        dibuja: (l) => {
          l.poli(oval(0, 0, 6, 4), { clase: 'f', cerrar: true });
          l.ejes({ nombreX: 'y', nombreY: 'z', marcasX: [3, 6], marcasY: [2, 4] });
          l.poli(oval(0, 0, 6, 4), { clase: 'c' });
          l.poli(oval(0, 0, 3, 2), { clase: 'c2' });
          l.rotulo(0, 4, 'x = 2', { dx: 5, dy: -4, color: 'var(--d1)' });
          l.rotulo(0, 2, 'x = −1', { dx: 5, dy: -4, color: 'var(--alt)' });
        },
      },
    ],
  }));

fig('2022-2023-4ev', 'ex2223-4ev-2-octante-de-la-bola', () => {
  const p3 = vista3d({ escalaXY: 0.85, inclinacion: 0.5 });
  const l = lienzo({
    id: 'f-ex2223-octante',
    ancho: 320, alto: 250,
    x: [-1.5, 1.5], y: [-1.6, 1.3], cuadrado: false,
    titulo: 'El octante de la bola unidad con x e y positivas y z negativa',
    desc: 'Un octavo de la bola de radio uno: el que tiene x mayor o igual que cero, y mayor o '
      + 'igual que cero y z menor o igual que cero, es decir, el que queda por debajo del plano '
      + 'XY. Se ven las tres caras planas —cuartos de disco sobre los planos coordenados— y la '
      + 'cara esférica que las cierra.',
  });
  for (const [a, b] of [[[1.3, 0, 0], [0, 0, 0]], [[0, 1.3, 0], [0, 0, 0]], [[0, 0, -1.3], [0, 0, 0]]]) {
    l.poli([p3(...a), p3(...b)], { clase: 'eje' });
  }
  /* La cara sobre z = 0: el cuarto de disco del primer cuadrante. */
  l.poli([p3(0, 0, 0), ...Array.from({ length: 33 }, (_, k) => {
    const t = (Math.PI / 2 * k) / 32;
    return p3(Math.cos(t), Math.sin(t), 0);
  })], { clase: 'f', cerrar: true });
  /* Los tres cuartos de circunferencia que forman el borde. */
  l.poli(Array.from({ length: 33 }, (_, k) => { const t = (Math.PI / 2 * k) / 32; return p3(Math.cos(t), Math.sin(t), 0); }), { clase: 'c' });
  l.poli(Array.from({ length: 33 }, (_, k) => { const t = (Math.PI / 2 * k) / 32; return p3(Math.cos(t), 0, -Math.sin(t)); }), { clase: 'c' });
  l.poli(Array.from({ length: 33 }, (_, k) => { const t = (Math.PI / 2 * k) / 32; return p3(0, Math.cos(t), -Math.sin(t)); }), { clase: 'c' });
  l.poli([p3(0, 0, 0), p3(1, 0, 0)], { clase: 'g' });
  l.poli([p3(0, 0, 0), p3(0, 1, 0)], { clase: 'g' });
  l.poli([p3(0, 0, 0), p3(0, 0, -1)], { clase: 'g' });
  l.rotulo(...p3(1.3, 0, 0), 'x ≥ 0', { dx: 3, dy: 6, color: 'var(--faint)', pequeno: true });
  l.rotulo(...p3(0, 1.3, 0), 'y ≥ 0', { dx: -8, dy: 6, anclaje: 'end', color: 'var(--faint)', pequeno: true });
  l.rotulo(...p3(0, 0, -1.3), 'z ≤ 0', { dx: 5, dy: 6, color: 'var(--faint)', pequeno: true });
  l.esquina(14, 18, 'un octavo, no media bola');
  return l.svg();
});

/* ══ regiones del plano complejo ════════════════════════════════════════ */

fig('2015-2016-1ev', 'ex1516-2-media-elipse', () => {
  const a = 1.5;
  const b = 2.5;
  const cx = -1;
  /* Los cortes de y = x con la elipse centrada en (−1,0). */
  const A = 6.25 + 2.25;
  const raiz = Math.sqrt(12.5 * 12.5 + 4 * A * (14.0625 - 6.25));
  const x1 = (-12.5 + raiz) / (2 * A);
  const x2 = (-12.5 - raiz) / (2 * A);
  const t1 = Math.atan2(x1 / b, (x1 - cx) / a);
  const t2 = Math.atan2(x2 / b, (x2 - cx) / a);
  const l = lienzo({
    id: 'f-ex1516-media-elipse',
    x: [-3.2, 3.2], y: [-3.2, 3.2], cuadrado: true,
    titulo: 'La mitad de la elipse que queda por debajo de la bisectriz',
    desc: 'Una elipse centrada en el punto (−1,0), con los focos en menos uno más dos i y menos '
      + 'uno menos dos i. El eje mayor es vertical y llega a más y menos dos coma cinco; el menor '
      + 'va de x igual a menos dos coma cinco a x igual a cero coma cinco. El borde va en trazo '
      + 'continuo. La recta y igual a x la atraviesa, y se sombrea la mitad de abajo, que es la '
      + 'que cumple que la parte real no es menor que la imaginaria.',
  });
  const mitad = [];
  let t = t1;
  const fin = t2 > t1 ? t2 : t2 + 2 * Math.PI;
  for (let k = 0; k <= 100; k++) {
    t = t1 + ((fin - t1) * k) / 100;
    mitad.push([cx + a * Math.cos(t), b * Math.sin(t)]);
  }
  l.poli(mitad, { clase: 'f', cerrar: true });
  l.ejes({ marcasX: [-2, 1], marcasY: [2, -2] });
  l.poli(oval(cx, 0, a, b), { clase: 'c' });
  l.curva((x) => x, [-3.1, 3.1], { clase: 'cp2' });
  l.punto(cx, 2, { clase: 'o', r: 3.8 });
  l.punto(cx, -2, { clase: 'o', r: 3.8 });
  l.punto(x1, x1, { r: 4 });
  l.punto(x2, x2, { r: 4 });
  l.rotulo(cx, 2, '−1+2i', { dx: -7, dy: -5, anclaje: 'end', color: 'var(--flag)' });
  l.rotulo(cx, -2, '−1−2i', { dx: -7, dy: 13, anclaje: 'end', color: 'var(--flag)' });
  l.rotulo(x1, x1, '≈ 0,47', { dx: 7, dy: -5 });
  l.rotulo(x2, x2, '≈ −1,94', { dx: 7, dy: 14 });
  return l.svg();
});

fig('2016-2017-1ev', 'ex1617-2-elipse-por-definicion', () => {
  const b = Math.sqrt(3);
  const l = lienzo({
    id: 'f-ex1617-elipse',
    x: [-1.4, 3.4], y: [-2.6, 2.6], cuadrado: true,
    titulo: 'La elipse de focos 1+i y 1−i con suma de distancias cuatro',
    desc: 'Una elipse centrada en el punto (1,0), con los focos en uno más i y uno menos i. El '
      + 'eje mayor es vertical y sus vértices están en uno más y menos dos i; los del eje menor, '
      + 'en uno más y menos raíz de tres, que es aproximadamente uno coma setenta y tres. La '
      + 'curva pasa por encima y por debajo de los focos, nunca entre un foco y el borde lateral.',
  });
  l.ejes({ marcasX: [1, 3], marcasY: [2, -2] });
  l.poli(oval(1, 0, b, 2), { clase: 'c' });
  l.punto(1, 1, { clase: 'o', r: 4 });
  l.punto(1, -1, { clase: 'o', r: 4 });
  l.punto(1, 0, { r: 3.4 });
  for (const [px, py] of [[1, 2], [1, -2], [1 + b, 0], [1 - b, 0]]) l.punto(px, py, { r: 3.6 });
  l.rotulo(1, 1, '1+i', { dx: 7, dy: -4, color: 'var(--flag)' });
  l.rotulo(1, -1, '1−i', { dx: 7, dy: 13, color: 'var(--flag)' });
  l.rotulo(1, 2, '(1,2)', { dx: 7, dy: -4 });
  l.rotulo(1 + b, 0, '1+√3', { dx: 4, dy: 15, anclaje: 'middle' });
  return l.svg();
});

fig('2016-2017-2ev', 'ex1617-2ev-1-cociente-real-o-imaginario', () => {
  const l = lienzo({
    id: 'f-ex1617-cociente',
    x: [-1.8, 1.8], y: [-1.8, 1.8], cuadrado: true,
    titulo: 'El eje imaginario para el cociente real y la circunferencia unidad para el imaginario puro',
    desc: 'Dos lugares en el mismo plano. El apartado a da el eje imaginario completo, dibujado '
      + 'en trazo grueso, con el punto menos i excluido. El apartado b da la circunferencia '
      + 'unidad, con los puntos i y menos i excluidos. Los tres puntos excluidos llevan círculo '
      + 'hueco.',
  });
  l.ejes({ marcasX: [1, -1] });
  l.poli([[0, -1.7], [0, 1.7]], { clase: 'c' });
  l.poli(aro(0, 0, 1), { clase: 'c2' });
  hueco(l, 'f-ex1617-cociente', 0, 1);
  hueco(l, 'f-ex1617-cociente', 0, -1);
  l.rotulo(0, 1.7, '(a) eje imaginario', { dx: 8, dy: 10, color: 'var(--d1)' });
  l.rotulo(...pol(1, g(-40)), '(b) |z| = 1', { dx: 6, dy: 6, color: 'var(--alt)' });
  l.rotulo(0, -1, '−i fuera de a y de b', { dx: 8, dy: 14, color: 'var(--flag)' });
  l.rotulo(0, 1, 'i fuera de b', { dx: 8, dy: -6, color: 'var(--flag)' });
  return l.svg();
});

fig('2017-2018-1ev', 'ex1718-2-exponencial-recta-vertical', () => {
  const x0 = Math.log(2);
  const y0 = (2 * Math.PI) / 3;
  const l = lienzo({
    id: 'f-ex1718-vertical',
    ancho: 260, alto: 265,
    x: [-1.6, 2.6], y: [-6.6, 9],
    titulo: 'Una columna de puntos sobre la recta vertical x igual a logaritmo de dos',
    desc: 'Todas las soluciones caen sobre la recta vertical de abscisa logaritmo de dos, unos '
      + 'cero coma sesenta y nueve. El valor principal está a altura dos pi tercios, unos dos '
      + 'coma cero nueve; los siguientes aparecen cada dos pi hacia arriba y hacia abajo, así que '
      + 'también los hay por debajo del eje real.',
  });
  l.ejes({ marcasX: [[x0, 'ln2']], marcasY: [] });
  l.poli([[x0, -6.4], [x0, 8.8]], { clase: 'cp' });
  for (const k of [-1, 0, 1]) l.punto(x0, y0 + 2 * Math.PI * k, { r: 4.4 });
  l.rotulo(x0, y0, '2π/3', { dx: 8, dy: 4 });
  l.rotulo(x0, y0 + Math.PI, '2π', { dx: 8, dy: 4, color: 'var(--faint)', pequeno: true });
  l.esquina(14, 18, 'x = ln 2 siempre');
  return l.svg();
});

fig('2018-2019-4ev-rec', 'ex1819-rec-2-seno-igual-a-seno-del-doble', () => {
  const P = Math.PI;
  const l = lienzo({
    id: 'f-ex1819-senos',
    ancho: 380, alto: 165,
    x: [-2.6 * P, 2.6 * P], y: [-2, 2],
    titulo: 'Las dos familias de soluciones, todas sobre el eje real',
    desc: 'Todas las soluciones son reales. Una familia, marcada con punto lleno, está en los '
      + 'múltiplos de pi: menos dos pi, menos pi, cero, pi y dos pi. La otra, marcada con otro '
      + 'color, está en más y menos pi tercios y en esos mismos valores desplazados dos pi. Las '
      + 'dos familias no comparten ningún punto.',
  });
  l.ejes({ marcasX: [[-2 * P, '−2π'], [-P, '−π'], [P, 'π'], [2 * P, '2π']], marcasY: [] });
  for (const k of [-2, -1, 0, 1, 2]) l.punto(k * P, 0, { r: 4.4 });
  for (const s of [1, -1]) for (const k of [-1, 0, 1]) {
    const x = s * (P / 3) + 2 * P * k;
    if (Math.abs(x) <= 2.5 * P) l.punto(x, 0, { clase: 'o', r: 4.2 });
  }
  l.rotulo(0, 0, 'z = kπ', { dx: -6, dy: -9, anclaje: 'end' });
  l.rotulo(P / 3, 0, 'z = ±π/3 + 2kπ', { dx: 6, dy: 16, color: 'var(--flag)' });
  return l.svg();
});

fig('2018-2019-ext', 'ex1819-ext-1-el-arco-capaz-y-la-elipse-imposible', () => {
  const R = Math.SQRT2;
  const l = lienzo({
    id: 'f-ex1819-arco',
    x: [-1.2, 3.2], y: [-2.2, 2.2], cuadrado: true,
    titulo: 'El arco capaz de 45 grados sobre el segmento de −i a i, y los focos sin elipse',
    desc: 'La circunferencia de centro (1,0) y radio raíz de dos pasa por i y por menos i, que '
      + 'están unidos por un segmento de longitud dos. De ella, solo el arco mayor —el que queda '
      + 'a la derecha, con x positiva— cumple la condición, y va en trazo grueso; el resto, a '
      + 'trazos. Aparte se marcan los focos del apartado b, uno más i y menos uno más i, con la '
      + 'distancia dos entre ellos anotada y ninguna elipse dibujada, porque no existe.',
  });
  l.ejes({ marcasX: [1, 2], marcasY: [1, -1] });
  l.poli(aro(1, 0, R), { clase: 'g' });
  const a0 = Math.atan2(1, -1);
  l.poli(arco(1, 0, R, a0, 2 * Math.PI - a0, 120), { clase: 'c' });
  l.poli([[0, 1], [0, -1]], { clase: 'cp2' });
  hueco(l, 'f-ex1819-arco', 0, 1);
  hueco(l, 'f-ex1819-arco', 0, -1);
  l.punto(1, 0, { r: 3.4 });
  l.rotulo(1, 0, 'C(1,0)', { dx: 6, dy: 14 });
  l.rotulo(0, 1, 'i', { dx: -7, dy: -5, anclaje: 'end' });
  l.rotulo(0, -1, '−i', { dx: -7, dy: 14, anclaje: 'end' });
  l.esquina(14, 18, 'arco mayor: x > 0');
  return l.svg();
});

fig('2019-2020-1ev', 'ex1920-1-apolonio-con-raiz-cubica', () => {
  const l = lienzo({
    id: 'f-ex1920-apolonio',
    x: [-9.6, 4.6], y: [-3.6, 5.4], cuadrado: true,
    titulo: 'La circunferencia de Apolonio de centro (−5,1) y radio cuatro',
    desc: 'Los dos puntos del cociente, tres más i y menos tres más i, están a la misma altura. '
      + 'La circunferencia que resulta tiene el centro en (−5,1) y radio cuatro: no está centrada '
      + 'en ninguno de los dos puntos. Menos tres más i queda dentro y tres más i queda fuera. '
      + 'Aparte, abajo, el punto menos dos i, que es la raíz imaginaria pura de la raíz cúbica de '
      + 'ocho i, con las otras dos raíces cúbicas marcadas a trazos.',
  });
  l.poli(aro(-5, 1, 4), { clase: 'f', cerrar: true });
  l.ejes({ marcasX: [-5, 3, -3], marcasY: [1] });
  l.poli(aro(-5, 1, 4), { clase: 'c' });
  l.punto(-5, 1, { r: 3.4 });
  l.punto(3, 1, { clase: 'o', r: 4.2 });
  l.punto(-3, 1, { clase: 'o', r: 4.2 });
  l.punto(0, -2, { r: 4.2 });
  for (const ang of [30, 150]) {
    const [px, py] = pol(2, g(ang));
    hueco(l, 'f-ex1920-apolonio', px, py, 3.6);
  }
  l.rotulo(3, 1, 'z₁ = 3+i', { dx: -7, dy: -7, anclaje: 'end', color: 'var(--flag)' });
  l.rotulo(-3, 1, 'z₂', { dx: 4, dy: -6, color: 'var(--flag)' });
  l.rotulo(-5, 1, 'C(−5,1)', { dx: -6, dy: 14, anclaje: 'end' });
  l.rotulo(0, -2, 'z₃ = −2i', { dx: 7, dy: 4 });
  return l.svg();
});

fig('2020-2021-1ev', 'ex2021-1-arco-capaz', () => {
  const R = 3 * Math.SQRT2;
  const l = lienzo({
    id: 'f-ex2021-arco',
    x: [-8.2, 2.2], y: [-5.2, 5.2], cuadrado: true,
    titulo: 'El arco mayor de la circunferencia de centro (−3,0) y radio tres raíz de dos',
    desc: 'Los puntos tres i y menos tres i, unidos por una cuerda de longitud seis. La '
      + 'circunferencia que pasa por los dos tiene el centro en (−3,0) y radio tres raíz de dos, '
      + 'unos cuatro coma veinticuatro. Solo el arco mayor, el que queda a la izquierda con x '
      + 'negativa, cumple la condición y va en trazo grueso. Los dos extremos llevan círculo '
      + 'hueco.',
  });
  l.ejes({ marcasX: [-3, -7], marcasY: [3, -3] });
  l.poli(aro(-3, 0, R), { clase: 'g' });
  const a0 = Math.atan2(3, 3);
  l.poli(arco(-3, 0, R, a0, 2 * Math.PI - a0, 120), { clase: 'c' });
  l.poli([[0, 3], [0, -3]], { clase: 'cp2' });
  hueco(l, 'f-ex2021-arco', 0, 3);
  hueco(l, 'f-ex2021-arco', 0, -3);
  l.punto(-3, 0, { r: 3.4 });
  l.rotulo(-3, 0, 'C(−3,0)', { dx: 0, dy: 15, anclaje: 'middle' });
  l.rotulo(0, 3, '3i', { dx: 7, dy: -4 });
  l.rotulo(0, -3, '−3i', { dx: 7, dy: 13 });
  l.esquina(14, 18, 'arco mayor: x < 0');
  return l.svg();
});

fig('2020-2021-1ev', 'ex2021-2-exponencial-en-el-eje-real', () => {
  const x0 = (-5 * Math.PI) / 6;
  const l = lienzo({
    id: 'f-ex2021-eje-real',
    ancho: 380, alto: 165,
    x: [-11, 6], y: [-2, 2],
    titulo: 'Las soluciones, todas sobre el eje real y separadas dos pi',
    desc: 'Todas las soluciones son reales. El valor principal está en menos cinco pi sextos, '
      + 'unos menos dos coma sesenta y dos, y los demás aparecen cada dos pi hacia los dos lados. '
      + 'El módulo del segundo miembro es uno, que es lo que hace que no haya parte imaginaria.',
  });
  l.ejes({ marcasX: [[x0, '−5π/6']], marcasY: [] });
  for (const k of [-1, 0, 1]) l.punto(x0 + 2 * Math.PI * k, 0, { r: 4.4 });
  l.poli([[x0 - 2 * Math.PI, 0], [x0 + 2 * Math.PI, 0]], { clase: 'g' });
  l.rotulo(x0 + Math.PI, 0, '2π', { dx: 0, dy: -9, anclaje: 'middle', color: 'var(--faint)', pequeno: true });
  l.esquina(14, 18, '|−√3/2 + i/2| = 1');
  return l.svg();
});

fig('2020-2021-2ev', 'ex2021-2ev-1-hexagono-regular', () => {
  const z1 = [5, -2];
  const z2 = [3, 1];
  const v = [z2[0] - z1[0], z2[1] - z1[1]];
  const gira = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
  const buena = [z2[0] + gira(v, g(-60))[0], z2[1] + gira(v, g(-60))[1]];
  const otra = [z2[0] + gira(v, g(60))[0], z2[1] + gira(v, g(60))[1]];
  const l = lienzo({
    id: 'f-ex2021-hexagono',
    x: [-1.6, 6.2], y: [-3.2, 5.4], cuadrado: true,
    titulo: 'Las dos posiciones posibles del tercer vértice, y la que se elige',
    desc: 'El lado conocido va de cinco menos dos i a tres más i, con vector menos dos más tres i '
      + 'y longitud raíz de trece, unos tres coma sesenta y uno. Girándolo sesenta grados a un '
      + 'lado y a otro salen las dos posiciones posibles del tercer vértice. Se elige la de '
      + 'arriba, aproximadamente cuatro coma sesenta más cuatro coma veintitrés i, por tener '
      + 'mayor parte imaginaria.',
  });
  l.ejes({ marcasX: [3, 5], marcasY: [3, -2] });
  l.poli([z1, z2], { clase: 'c' });
  l.poli([z2, buena], { clase: 'c' });
  l.poli([z2, otra], { clase: 'cp2' });
  l.punto(...z1, { r: 4.2 });
  l.punto(...z2, { r: 4.2 });
  l.punto(...buena, { clase: 'o', r: 4.6 });
  hueco(l, 'f-ex2021-hexagono', ...otra, 4.2);
  l.rotulo(...z1, 'z₁ = 5−2i', { dx: 6, dy: 14 });
  l.rotulo(...z2, 'z₂ = 3+i', { dx: -7, dy: 4, anclaje: 'end' });
  l.rotulo(...buena, 'z₃ ≈ 4,60+4,23i', { dx: -7, dy: -7, anclaje: 'end', color: 'var(--flag)' });
  l.rotulo(...otra, 'la otra', { dx: -7, dy: 6, anclaje: 'end', color: 'var(--alt)' });
  l.esquina(14, 18, 'giro de 60°, no de 90°');
  return l.svg();
});

fig('2020-2021-4ev-rec', 'ex2021-rec-2-la-ecuacion-que-se-desarma-sola', () => {
  const P = Math.PI;
  const l = lienzo({
    id: 'f-ex2021-desarma',
    ancho: 380, alto: 165,
    x: [-5.2 * P, 5.2 * P], y: [-2, 2],
    titulo: 'Las soluciones en los múltiplos pares de pi, sobre el eje real',
    desc: 'Cinco puntos sobre el eje real, en menos cuatro pi, menos dos pi, cero, dos pi y '
      + 'cuatro pi. La separación es dos pi, no pi. El origen cuenta como una solución más, y hay '
      + 'puntos también a la izquierda.',
  });
  l.ejes({ marcasX: [[-4 * P, '−4π'], [-2 * P, '−2π'], [2 * P, '2π'], [4 * P, '4π']], marcasY: [] });
  for (const k of [-2, -1, 0, 1, 2]) l.punto(2 * k * P, 0, { r: 4.4 });
  l.rotulo(P, 0, '2π', { dx: 0, dy: -9, anclaje: 'middle', color: 'var(--faint)', pequeno: true });
  l.esquina(14, 18, 'el 0 también es solución');
  return l.svg();
});

fig('2021-2022-1ev', 'ex2122-1-apolonio-de-area-dada', () => {
  const l = lienzo({
    id: 'f-ex2122-apolonio',
    x: [-3.6, 2.4], y: [-1.2, 4.8], cuadrado: true,
    titulo: 'La circunferencia de Apolonio de centro (−1,2) y radio dos, con w igual a i',
    desc: 'Los dos puntos de la condición son z igual a uno y w igual a i, que distan raíz de '
      + 'dos. La circunferencia que sale tiene el centro en (−1,2) y radio dos, que es lo que da '
      + 'el área cuatro pi pedida. El punto i queda dentro de la circunferencia y el uno queda '
      + 'fuera.',
  });
  l.poli(aro(-1, 2, 2), { clase: 'f', cerrar: true });
  l.ejes({ marcasX: [1, -1, -3], marcasY: [2, 4] });
  l.poli(aro(-1, 2, 2), { clase: 'c' });
  l.punto(-1, 2, { r: 3.4 });
  l.punto(1, 0, { clase: 'o', r: 4.2 });
  l.punto(0, 1, { clase: 'o', r: 4.2 });
  l.poli([[1, 0], [0, 1]], { clase: 'g' });
  l.rotulo(1, 0, 'z = 1', { dx: 6, dy: 14, color: 'var(--flag)' });
  l.rotulo(0, 1, 'w = i', { dx: 7, dy: -5, color: 'var(--flag)' });
  l.rotulo(-1, 2, 'C(−1,2) · r = 2', { dx: -6, dy: -8, anclaje: 'end' });
  return l.svg();
});

fig('2021-2022-1ev', 'ex2122-2-quinta-con-conjugado', () => {
  const l = lienzo({
    id: 'f-ex2122-quinta',
    x: [-1.6, 1.6], y: [-1.6, 1.6], cuadrado: true,
    titulo: 'El origen y los cuatro puntos del cuadrado girado 22,5 grados',
    desc: 'Cinco soluciones: el origen, marcado con otro color, y cuatro sobre la circunferencia '
      + 'unidad separadas noventa grados. La primera está en veintidós grados y medio, no en '
      + 'cero, de modo que el cuadrado que forman las cuatro aparece girado respecto de los ejes.',
  });
  l.ejes({ marcasX: [1, -1] });
  l.poli(aro(0, 0, 1), { clase: 'g' });
  const vs = [22.5, 112.5, 202.5, 292.5].map((a) => pol(1, g(a)));
  l.poli(vs, { clase: 'c', cerrar: true });
  for (const v of vs) l.punto(...v, { r: 4.4 });
  l.punto(0, 0, { clase: 'o', r: 4.4 });
  l.rotulo(0, 0, 'z = 0', { dx: 8, dy: -6, color: 'var(--flag)' });
  l.rotulo(...vs[0], '22,5°', { dx: 6, dy: -6 });
  return l.svg();
});

fig('2022-2023-1ev', 'ex2223-1-recta-y-conjunto-vacio', () => {
  const l = lienzo({
    id: 'f-ex2223-recta',
    x: [-3.4, 3.4], y: [-3.6, 3.2], cuadrado: true,
    titulo: 'La recta y igual a x menos uno, sin el segmento entre sus dos puntos',
    desc: 'La recta que pasa por menos uno menos dos i y por uno. El segmento entre esos dos '
      + 'puntos no pertenece al lugar y va a trazos; el resto de la recta, en trazo grueso. Los '
      + 'dos extremos llevan círculo hueco porque tampoco entran. El apartado b no tiene dibujo '
      + 'porque su condición no la cumple ningún número.',
  });
  l.ejes({ marcasX: [1, -1], marcasY: [-2] });
  l.poli([[-3.3, -4.3], [-1, -2]].filter(([, y]) => y >= -3.5), { clase: 'c' });
  l.curva((x) => x - 1, [-2.5, -1], { clase: 'c' });
  l.curva((x) => x - 1, [1, 3.3], { clase: 'c' });
  l.poli([[-1, -2], [1, 0]], { clase: 'cp2' });
  hueco(l, 'f-ex2223-recta', -1, -2);
  hueco(l, 'f-ex2223-recta', 1, 0);
  l.rotulo(-1, -2, '−1−2i', { dx: -8, dy: 4, anclaje: 'end', color: 'var(--flag)' });
  l.rotulo(1, 0, 'z = 1', { dx: 8, dy: -5, color: 'var(--flag)' });
  l.rotulo(2.4, 1.4, 'y = x − 1', { dx: 4, dy: 14, anclaje: 'end', color: 'var(--d1)' });
  l.esquina(14, 18, '(b) no hay figura: vacío');
  return l.svg();
});

fig('2023-2024-1ev', 'ex2324-1-semirrecta-vertical', () => {
  const l = lienzo({
    id: 'f-ex2324-semirrecta',
    x: [-1.4, 4.4], y: [-2.6, 4], cuadrado: true,
    titulo: 'La semirrecta vertical que baja desde (2,3), y el trozo que queda por debajo de y = ½',
    desc: 'Una semirrecta vertical que baja desde el punto (2,3), con el vértice marcado con '
      + 'círculo hueco porque no pertenece. La recta horizontal y igual a un medio separa la '
      + 'parte que cumple la segunda condición. En trazo grueso, solo el trozo de semirrecta '
      + 'desde (2 ; 0,5) hacia abajo; el resto, a trazos.',
  });
  l.ejes({ marcasX: [2], marcasY: [3, [0.5, '½']] });
  l.poli([[-1.3, 0.5], [4.3, 0.5]], { clase: 'cp2' });
  l.poli([[2, 3], [2, 0.5]], { clase: 'g' });
  l.poli([[2, 0.5], [2, -2.5]], { clase: 'c' });
  hueco(l, 'f-ex2324-semirrecta', 2, 3);
  l.punto(2, 0.5, { clase: 'o', r: 4 });
  l.rotulo(2, 3, '(2,3) fuera', { dx: 8, dy: -5, color: 'var(--flag)' });
  l.rotulo(2, 0.5, '(2 ; ½)', { dx: 8, dy: -5 });
  l.rotulo(-1.3, 0.5, 'y = ½', { dx: 4, dy: -7, color: 'var(--alt)' });
  return l.svg();
});

fig('2024-2025-1ev', 'ex2425-1-parabola-y-circunferencia', () => {
  const par = (x) => (1 - x * x) / 2;
  const l = lienzo({
    id: 'f-ex2425-parab-circ',
    x: [-1.9, 1.9], y: [-2.4, 1.4], cuadrado: true,
    titulo: 'Bajo la parábola y fuera de la circunferencia de centro (0,−1)',
    desc: 'La parábola y igual a uno menos x al cuadrado partido por dos, abierta hacia abajo con '
      + 'el vértice en (0 ; 0,5) y cortando el eje horizontal en más y menos uno, dibujada a '
      + 'trazos. La circunferencia de centro (0,−1) y radio uno, en trazo continuo. Se sombrea lo '
      + 'que queda por debajo de la parábola y fuera de la circunferencia.',
  });
  /* Debajo de la parábola y fuera del círculo: el marco recortado dos veces. */
  const bajoParabola = [
    ...Array.from({ length: 81 }, (_, k) => { const x = -1.85 + (3.7 * k) / 80; return [x, par(x)]; }),
    [1.85, -2.35], [-1.85, -2.35],
  ];
  const d = (ps) => ps.map(([u, v], i) => `${i ? 'L' : 'M'}${Math.round(l.X(u) * 10) / 10} ${Math.round(l.Y(v) * 10) / 10}`).join('') + 'Z';
  l.crudo(`<path class="f-ex2425-parab-circ-f" fill-rule="evenodd" d="${d(bajoParabola)}${d(aro(0, -1, 1))}"/>`);
  l.ejes({ marcasX: [1, -1], marcasY: [[0.5, '½'], -1] });
  l.curva(par, [-1.85, 1.85], { clase: 'cp', n: 80 });
  l.poli(aro(0, -1, 1), { clase: 'c2' });
  l.punto(0, -1, { r: 3.4 });
  l.rotulo(0, 0.5, 'y = (1−x²)/2', { dx: 6, dy: -8, color: 'var(--d1)' });
  l.rotulo(0, -1, 'C(0,−1)', { dx: 7, dy: 4, color: 'var(--alt)' });
  return l.svg();
});

fig('2024-2025-1ev', 'ex2425-2-cubica-desplazada', () => {
  const c = [2, 1];
  const l = lienzo({
    id: 'f-ex2425-cubica',
    x: [-0.6, 4.6], y: [-1.6, 3.6], cuadrado: true,
    titulo: 'Las tres raíces cúbicas alrededor del centro 2+i, no del origen',
    desc: 'Una circunferencia de radio dos centrada en el punto (2,1), con tres puntos repartidos '
      + 'cada ciento veinte grados. Uno de ellos cae exactamente en z igual a i. El centro está '
      + 'marcado para dejar claro que la figura no está centrada en el origen.',
  });
  l.ejes({ marcasX: [2, 4], marcasY: [1, 3] });
  l.poli(aro(...c, 2), { clase: 'g' });
  const vs = [60, 180, 300].map((a) => [c[0] + 2 * Math.cos(g(a)), c[1] + 2 * Math.sin(g(a))]);
  l.poli(vs, { clase: 'c', cerrar: true });
  for (const v of vs) l.punto(...v, { r: 4.4 });
  l.punto(...c, { clase: 'o', r: 3.8 });
  l.rotulo(...c, '2+i', { dx: 7, dy: 4, color: 'var(--flag)' });
  l.rotulo(...vs[1], 'z = i', { dx: -7, dy: -6, anclaje: 'end' });
  return l.svg();
});

fig('2024-2025-ord', 'ex2425-ord-1-la-tangente-compleja-y-la-circunferencia', () => {
  const h = Math.log(3) / 2;
  const P = Math.PI;
  return mosaico({
    id: 'f-ex2425-tangente',
    titulo: 'La fila de soluciones de la tangente, y la circunferencia con su punto excluido',
    desc: 'A la izquierda, los afijos del apartado a: una fila horizontal de puntos a altura '
      + 'logaritmo de tres partido por dos, unos cero coma cincuenta y cinco, separados pi, con '
      + 'el primero a la derecha del eje en pi medios. A la derecha, el lugar del apartado b: la '
      + 'circunferencia de centro (0,75 ; 1) y radio cero coma setenta y cinco, con el punto i '
      + 'marcado con círculo hueco porque está sobre ella y hay que excluirlo.',
    columnas: 2, ancho: 205, alto: 175,
    celdas: [
      {
        etiqueta: '(a) tan z = 2i',
        x: [-5.5, 7], y: [-1.6, 2.2], cuadrado: false,
        dibuja: (l) => {
          l.ejes({ marcasX: [[P / 2, 'π/2']], marcasY: [[h, '0,55']] });
          l.poli([[-5.3, h], [6.8, h]], { clase: 'g' });
          for (const k of [-1, 0, 1]) l.punto(P / 2 + k * P, h, { r: 4.2 });
          l.rotulo(P, h, 'π', { dx: 0, dy: -8, anclaje: 'middle', color: 'var(--faint)', pequeno: true });
        },
      },
      {
        etiqueta: '(b) la circunferencia',
        x: [-0.9, 2.4], y: [-0.5, 2.3], cuadrado: true,
        dibuja: (l) => {
          l.poli(aro(0.75, 1, 0.75), { clase: 'f', cerrar: true });
          l.ejes({ marcasX: [[0.75, '¾'], 1], marcasY: [1, 2] });
          l.poli(aro(0.75, 1, 0.75), { clase: 'c' });
          l.punto(0.75, 1, { r: 3.2 });
          hueco(l, 'f-ex2425-tangente', 0, 1, 4);
          l.rotulo(0, 1, 'i fuera', { dx: 6, dy: -7, color: 'var(--flag)' });
        },
      },
    ],
  });
});

fig('2025-2026-1ev', 'ex2526-1-semiplano-con-mordisco', () => {
  const l = lienzo({
    id: 'f-ex2526-mordisco',
    x: [-5.2, 2.2], y: [-2.4, 3.4], cuadrado: true,
    titulo: 'El semiplano por encima de y igual a tres cuartos, con el mordisco del círculo',
    desc: 'La recta horizontal y igual a tres cuartos deja por encima el semiplano que cumple la '
      + 'segunda condición. La circunferencia de centro (−2,5 ; 0) y radio uno coma cinco tiene '
      + 'que quedar fuera, y lo que le quita al semiplano es un mordisco: el trozo de disco que '
      + 'sobresale por encima de la recta. Los dos bordes van en trazo continuo.',
  });
  const semi = [[-5.1, 0.75], [2.1, 0.75], [2.1, 3.3], [-5.1, 3.3]];
  const d = (ps) => ps.map(([u, v], i) => `${i ? 'L' : 'M'}${Math.round(l.X(u) * 10) / 10} ${Math.round(l.Y(v) * 10) / 10}`).join('') + 'Z';
  l.crudo(`<path class="f-ex2526-mordisco-f" fill-rule="evenodd" d="${d(semi)}${d(aro(-2.5, 0, 1.5))}"/>`);
  l.ejes({ marcasX: [-2.5, -4, -1], marcasY: [[0.75, '¾'], 2] });
  l.poli([[-5.1, 0.75], [2.1, 0.75]], { clase: 'c' });
  l.poli(aro(-2.5, 0, 1.5), { clase: 'c2' });
  l.punto(-2.5, 0, { r: 3.4 });
  l.rotulo(-2.5, 0, 'C(−5/2, 0)', { dx: 0, dy: 15, anclaje: 'middle', color: 'var(--alt)' });
  l.rotulo(2.1, 0.75, 'y = ¾', { dx: -4, dy: -7, anclaje: 'end', color: 'var(--d1)' });
  l.esquina(14, 18, 'fuera del círculo, encima de la recta');
  return l.svg();
});

fig('2025-2026-1ev', 'ex2526-2-raiz-cuarta-de-la-figura', () => {
  const l = lienzo({
    id: 'f-ex2526-raiz-cuarta',
    x: [-2.6, 2.6], y: [-2.6, 2.6], cuadrado: true,
    titulo: 'Las cuatro soluciones de módulo dos, la primera a 75 grados',
    desc: 'Cuatro puntos sobre la circunferencia de radio dos, separados noventa grados, con el '
      + 'primero a setenta y cinco grados: el cuadrado que forman aparece girado respecto de los '
      + 'ejes. Dentro, sobre la circunferencia unidad y a trazos, los tres datos de la figura del '
      + 'enunciado, con argumentos sesenta, menos sesenta y menos ciento veinte grados y el mismo '
      + 'módulo.',
  });
  l.ejes({ marcasX: [1, 2] });
  l.poli(aro(0, 0, 1), { clase: 'g' });
  l.poli(aro(0, 0, 2), { clase: 'g' });
  const vs = [75, 165, 255, 345].map((a) => pol(2, g(a)));
  l.poli(vs, { clase: 'c', cerrar: true });
  for (const v of vs) l.punto(...v, { r: 4.4 });
  const datos = [[60, 'z₁'], [-60, 'z₂'], [-120, 'z₃']];
  for (const [a, nombre] of datos) {
    const [px, py] = pol(1, g(a));
    l.punto(px, py, { clase: 'o', r: 3.6 });
    l.rotulo(px, py, nombre, { dx: px >= 0 ? 6 : -6, dy: py >= 0 ? -5 : 13, anclaje: px >= 0 ? 'start' : 'end', color: 'var(--flag)' });
  }
  l.rotulo(...vs[0], '75°', { dx: 5, dy: -5 });
  return l.svg();
});

fig('2025-2026-3ev', 'ex2526-3ev-1-medio-disco', () => {
  const R = Math.SQRT2;
  const l = lienzo({
    id: 'f-ex2526-medio-disco',
    x: [-1.2, 3.2], y: [-3.4, 1], cuadrado: true,
    titulo: 'El medio disco que queda por debajo de la recta, que pasa por el centro',
    desc: 'El disco de centro (1,−1) y radio raíz de dos, con el borde a trazos porque la '
      + 'desigualdad es estricta. La recta y igual a x menos dos pasa exactamente por el centro '
      + 'del disco, así que lo parte en dos mitades iguales. Se sombrea la de abajo, que es la '
      + 'que cumple las dos condiciones.',
  });
  const t0 = g(-135);
  l.poli(arco(1, -1, R, t0, t0 + Math.PI, 90), { clase: 'f', cerrar: true });
  l.ejes({ marcasX: [1, 2], marcasY: [-1, -2] });
  l.poli(aro(1, -1, R), { clase: 'cp' });
  l.curva((x) => x - 2, [-1.1, 3.1], { clase: 'c2' });
  l.punto(1, -1, { clase: 'o', r: 4 });
  l.rotulo(1, -1, 'C(1,−1)', { dx: 7, dy: -5, color: 'var(--flag)' });
  l.rotulo(3.1, 1.1, 'y = x − 2', { dx: -4, dy: 16, anclaje: 'end', color: 'var(--alt)' });
  return l.svg();
});

/* ══ dominios de integración y gráficas ═════════════════════════════════ */

fig('2017-2018-2ev', 'ex1718-2ev-2-el-dron', () => {
  const h = (x) => -(x ** 3) / 160 + (3 * x * x) / 80;
  const h1 = (x) => (3 * x * (4 - x)) / 160;
  const h2 = (x) => (12 - 6 * x) / 160;
  const l = lienzo({
    id: 'f-ex1718-dron',
    ancho: 360, alto: 230,
    x: [-0.35, 4.6], y: [-0.11, 0.24],
    titulo: 'La trayectoria del dron con su primera y su segunda derivada',
    desc: 'La altura sube de cero a cero coma dos a lo largo de cuatro kilómetros. La primera '
      + 'derivada es una parábola hacia abajo que se anula en cero y en cuatro y tiene su máximo '
      + 'en dos. La segunda derivada es una recta decreciente que se anula también en dos. En x '
      + 'igual a dos coinciden el máximo de la pendiente, el cero de la segunda derivada y la '
      + 'inflexión de la trayectoria.',
  });
  l.ejes({ nombreX: 'x (km)', nombreY: 'h', marcasX: [2, 4], marcasY: [[0.2, '0,2']] });
  l.curva(h, [0, 4], { clase: 'c', n: 60 });
  l.curva(h1, [0, 4], { clase: 'c2', n: 60 });
  l.curva(h2, [0, 4], { clase: 'cp', n: 2 });
  l.poli([[2, 0], [2, h(2)]], { clase: 'g' });
  l.punto(2, h(2), { clase: 'o', r: 4 });
  l.punto(2, h1(2), { r: 3.6 });
  l.punto(2, 0, { r: 3.6 });
  l.rotulo(3.4, h(3.4), 'h', { dx: 5, dy: -4, color: 'var(--d1)' });
  l.rotulo(1, h1(1), 'h′', { dx: -5, dy: -5, anclaje: 'end', color: 'var(--alt)' });
  l.rotulo(0.3, h2(0.3), 'h″', { dx: 3, dy: -5, color: 'var(--d1)' });
  l.rotulo(2, h(2), 'inflexión', { dx: 7, dy: -5, color: 'var(--flag)' });
  return l.svg();
});

fig('2017-2018-5ev', 'ex1718-5ev-1-el-orden-que-parte-en-dos', () => {
  const l = lienzo({
    id: 'f-ex1718-orden',
    ancho: 340, alto: 220,
    x: [-0.4, 3.5], y: [-0.4, 1.6],
    titulo: 'El recinto entre la parábola, la recta y el eje, con las dos franjas de muestra',
    desc: 'Un recinto con tres vértices: el origen, el punto (3,0) y el punto (1,1). Por la '
      + 'izquierda lo cierra la parábola y igual a x al cuadrado; por la derecha, la recta y '
      + 'igual a tres menos x partido por dos; por abajo, el eje horizontal. Se dibujan dos '
      + 'franjas de muestra: una horizontal, que es el orden del enunciado, y una vertical, que '
      + 'es el orden nuevo. La vertical x igual a uno marca dónde cambia el techo.',
  });
  l.poli([
    ...Array.from({ length: 41 }, (_, k) => { const x = (k) / 40; return [x, x * x]; }),
    [3, 0], [0, 0],
  ], { clase: 'f', cerrar: true });
  l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 3], marcasY: [1] });
  l.curva((x) => x * x, [0, 1.25], { clase: 'c', n: 40 });
  l.curva((x) => (3 - x) / 2, [0.4, 3.3], { clase: 'c2' });
  l.poli([[1, 0], [1, 1]], { clase: 'g' });
  /* Las dos franjas de muestra: una horizontal y una vertical. */
  l.poli([[Math.sqrt(0.5), 0.5], [2, 0.5]], { clase: 'cp' });
  l.poli([[0.6, 0], [0.6, 0.36]], { clase: 'cp2' });
  l.punto(1, 1, { clase: 'o', r: 4 });
  l.punto(3, 0, { r: 3.6 });
  l.rotulo(1, 1, '(1,1)', { dx: 7, dy: -5, color: 'var(--flag)' });
  l.rotulo(2, 0.5, 'franja dy', { dx: 5, dy: -4, color: 'var(--d1)' });
  l.rotulo(0.6, 0.36, 'franja dx', { dx: -6, dy: -6, anclaje: 'end', color: 'var(--alt)' });
  return l.svg();
});

fig('2020-2021-4ev', 'ex2021-4ev-2-region-con-recta-y-parabola', () => {
  const l = lienzo({
    id: 'f-ex2021-region',
    ancho: 320, alto: 240,
    x: [-0.3, 1.6], y: [-0.5, 4.6],
    titulo: 'El recinto entre la recta y igual a tres x y la parábola y igual a cuatro menos x al cuadrado',
    desc: 'Entre x igual a cero y x igual a uno, la recta y igual a tres x hace de suelo y la '
      + 'parábola y igual a cuatro menos x al cuadrado hace de techo. El lado izquierdo se apoya '
      + 'en el eje vertical, de altura cero a cuatro, y por la derecha el recinto se cierra en '
      + 'punta en el punto (1,3). Una franja vertical de muestra enseña el orden del enunciado.',
  });
  l.poli(entre((x) => 4 - x * x, (x) => 3 * x, 0, 1), { clase: 'f', cerrar: true });
  l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1], marcasY: [3, 4] });
  l.curva((x) => 3 * x, [0, 1.4], { clase: 'c' });
  l.curva((x) => 4 - x * x, [-0.2, 1.4], { clase: 'c2', n: 50 });
  l.poli([[0.5, 1.5], [0.5, 3.75]], { clase: 'cp' });
  l.punto(1, 3, { clase: 'o', r: 4 });
  l.punto(0, 4, { r: 3.6 });
  l.punto(0, 0, { r: 3.6 });
  l.rotulo(1, 3, '(1,3)', { dx: -7, dy: -6, anclaje: 'end', color: 'var(--flag)' });
  l.rotulo(0.5, 2.6, 'franja dy', { dx: 5, dy: 0, color: 'var(--d1)' });
  return l.svg();
});

fig('2023-2024-4ev', 'ex2324-4ev-2-cambiar-el-orden-y-calcular', () => {
  const r2 = Math.SQRT2;
  const l = lienzo({
    id: 'f-ex2324-orden',
    ancho: 320, alto: 240,
    x: [-2.2, 2.2], y: [-0.5, 4.6],
    titulo: 'El recinto entre las dos parábolas, que es uno solo aunque el enunciado lo dé en dos',
    desc: 'La parábola y igual a x al cuadrado abre hacia arriba y la parábola y igual a cuatro '
      + 'menos x al cuadrado abre hacia abajo. Se cortan en más y menos raíz de dos, a la altura '
      + 'dos, y encierran una región con forma de lente. La horizontal y igual a dos marca dónde '
      + 'el enunciado parte la integral en dos trozos; una franja vertical enseña que en el orden '
      + 'nuevo basta con una.',
  });
  l.poli(entre((x) => 4 - x * x, (x) => x * x, -r2, r2), { clase: 'f', cerrar: true });
  l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [[r2, '√2'], [-r2, '−√2']], marcasY: [2, 4] });
  l.curva((x) => x * x, [-2.1, 2.1], { clase: 'c', n: 60 });
  l.curva((x) => 4 - x * x, [-2.1, 2.1], { clase: 'c2', n: 60 });
  l.poli([[-2.1, 2], [2.1, 2]], { clase: 'g' });
  l.poli([[0.7, 0.49], [0.7, 3.51]], { clase: 'cp' });
  l.punto(r2, 2, { clase: 'o', r: 3.8 });
  l.punto(-r2, 2, { clase: 'o', r: 3.8 });
  l.rotulo(0.7, 3.51, 'franja dy', { dx: 5, dy: -4, color: 'var(--d1)' });
  l.rotulo(-2.1, 2, 'y = 2', { dx: 4, dy: -7, color: 'var(--faint)', pequeno: true });
  return l.svg();
});

fig('2025-2026-3ev', 'ex2526-3ev-5-parabola-tumbada-y-tangente', () => {
  const xDe = (y) => (y - 2) ** 2 + 1;
  const tg = (y) => 2 * (y - 2);
  const l = lienzo({
    id: 'f-ex2526-tangente',
    ancho: 340, alto: 235,
    x: [-5, 6], y: [-0.6, 4],
    titulo: 'El recinto entre la tangente en P, la parábola tumbada y el eje OX',
    desc: 'La parábola x igual a y menos dos al cuadrado más uno, tumbada y abierta hacia la '
      + 'derecha con el vértice en (1,2). La recta tangente en el punto P(2,3) corta el eje '
      + 'horizontal en (−4,0), y la parábola lo corta en (5,0). El recinto tiene esos tres '
      + 'vértices y se extiende de y igual a cero a y igual a tres, con la tangente a la '
      + 'izquierda y la parábola a la derecha.',
  });
  l.poli([
    ...Array.from({ length: 41 }, (_, k) => { const y = (3 * k) / 40; return [xDe(y), y]; }),
    [2, 3], [-4, 0],
  ], { clase: 'f', cerrar: true });
  l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-4, 1, 5], marcasY: [2, 3] });
  l.curva((y) => [xDe(y), y], [-0.3, 3.8], { clase: 'c', n: 70 });
  l.curva((y) => [tg(y) + 2, y], [-0.3, 3.8], { clase: 'c2', n: 2 });
  l.punto(2, 3, { clase: 'o', r: 4.2 });
  l.punto(-4, 0, { r: 3.8 });
  l.punto(5, 0, { r: 3.8 });
  l.punto(1, 2, { r: 3.4 });
  l.rotulo(2, 3, 'P(2,3)', { dx: 7, dy: -5, color: 'var(--flag)' });
  l.rotulo(-4, 0, '(−4,0)', { dx: 4, dy: 15, anclaje: 'middle' });
  l.rotulo(5, 0, '(5,0)', { dx: 0, dy: 15, anclaje: 'middle' });
  l.rotulo(1, 2, 'vértice', { dx: -6, dy: -6, anclaje: 'end', color: 'var(--faint)', pequeno: true });
  return l.svg();
});

/* ══ campos escalares ═══════════════════════════════════════════════════ */

fig('2021-2022-4ev', 'ex2122-4ev-1-vertido-en-el-oceano', () => {
  const R = Math.SQRT2;
  const l = lienzo({
    id: 'f-ex2122-vertido',
    x: [-3.2, 1.4], y: [-2.2, 2.6], cuadrado: true,
    titulo: 'La curva de nivel por P, el gradiente hacia el centro y la dirección tangente',
    desc: 'El centro del vertido, donde la contaminación es máxima, está en (−1,0). La curva de '
      + 'nivel que pasa por P(0,1) es la circunferencia de centro (−1,0) y radio raíz de dos. '
      + 'Desde P salen dos flechas: la del gradiente, que apunta hacia el centro en la dirección '
      + '(−1,−1), y la dirección v igual a (−1,1), que es tangente a la curva de nivel y por '
      + 'tanto la dirección en la que la contaminación no cambia.',
  });
  l.ejes({ marcasX: [-1, -2], marcasY: [1, 2] });
  l.poli(aro(-1, 0, R), { clase: 'c' });
  l.punto(-1, 0, { clase: 'o', r: 4.4 });
  l.punto(0, 1, { r: 4.4 });
  l.flecha([0, 1], [-0.75, 0.25], { clase: 'c2', color: 'var(--alt)' });
  l.flecha([0, 1], [-0.85, 1.85], { clase: 'cp' });
  l.rotulo(-1, 0, 'centro (−1,0)', { dx: -8, dy: 14, anclaje: 'end', color: 'var(--flag)' });
  l.rotulo(0, 1, 'P(0,1)', { dx: 7, dy: -5 });
  l.rotulo(-0.75, 0.25, '∇f', { dx: -6, dy: -5, anclaje: 'end', color: 'var(--alt)' });
  l.rotulo(-0.85, 1.85, 'v', { dx: -6, dy: -4, anclaje: 'end', color: 'var(--d1)' });
  return l.svg();
});

fig('2024-2025-4ev', 'ex2425-4ev-1-curva-de-nivel-dada', () => {
  const g5 = Math.sqrt(5);
  const l = lienzo({
    id: 'f-ex2425-nivel',
    ancho: 340, alto: 250,
    x: [-3.4, 3.4], y: [-3.6, 3.2], cuadrado: true,
    titulo: 'La curva de nivel, la tangente en P y las dos posibilidades del gradiente',
    desc: 'La parábola y igual a dos menos x al cuadrado pasa por el punto P(−1,1). La tangente '
      + 'en P tiene pendiente dos y va en la dirección (1,2). Las dos flechas del gradiente son '
      + 'perpendiculares a ella y de longitud diez a escala: una apunta hacia abajo a la derecha '
      + 'y la otra hacia arriba a la izquierda. El vector b igual a (−2,3), dibujado también '
      + 'desde P, forma ángulo agudo con una de las dos y obtuso con la otra.',
  });
  l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, -1], marcasY: [2, -2] });
  l.curva((x) => 2 - x * x, [-2.3, 2.3], { clase: 'c', n: 60 });
  l.punto(-1, 1, { clase: 'o', r: 4.4 });
  /* La tangente, en dirección (1,2) normalizada. */
  l.poli([[-1 - 1 / g5, 1 - 2 / g5], [-1 + 1 / g5, 1 + 2 / g5]], { clase: 'cp2' });
  /* El gradiente, a escala: diez unidades se dibujan como dos. */
  l.flecha([-1, 1], [-1 + 2 / g5, 1 - 1 / g5], { clase: 'c2', color: 'var(--alt)' });
  l.flecha([-1, 1], [-1 - 2 / g5, 1 + 1 / g5], { clase: 'c2', color: 'var(--alt)' });
  l.flecha([-1, 1], [-1 - 2 / 1.8, 1 + 3 / 1.8], { clase: 'cp' });
  l.rotulo(-1, 1, 'P(−1,1)', { dx: 8, dy: 4 });
  l.rotulo(-1 + 2 / g5, 1 - 1 / g5, '∇f', { dx: 5, dy: 12, color: 'var(--alt)' });
  l.rotulo(-1 - 2 / 1.8, 1 + 3 / 1.8, 'b = (−2,3)', { dx: -4, dy: -7, anclaje: 'end', color: 'var(--d1)' });
  l.esquina(14, 18, '|∇f| = 10, a escala');
  return l.svg();
});

/* ══ Fourier ════════════════════════════════════════════════════════════ */

fig('2017-2018-ext', 'ex1718-ext-8-la-rampa-y-la-serie-de-leibniz', () => {
  const P = Math.PI;
  return mosaico({
    id: 'f-ex1718-rampa',
    titulo: 'La rampa de pendiente un medio y su espectro de amplitudes',
    desc: 'A la izquierda, tres periodos de rampas de pendiente un medio que suben de menos pi '
      + 'medios a pi medios, con saltos de altura pi en los múltiplos impares de pi y un punto de '
      + 'convergencia a altura cero en la mitad de cada salto. A la derecha, el espectro: una '
      + 'raya por armónico, sin ninguna en la frecuencia cero porque la serie solo tiene senos, y '
      + 'con las alturas decreciendo como uno partido por ene.',
    columnas: 2, ancho: 205, alto: 180,
    celdas: [
      {
        etiqueta: 'f(t) = t/2',
        x: [-3.5 * P, 3.5 * P], y: [-2.6, 2.6], cuadrado: false,
        dibuja: (l) => {
          l.ejes({ nombreX: 't', nombreY: 'f', marcasX: [[-P, '−π'], [P, 'π']], marcasY: [[P / 2, 'π/2']] });
          for (const c of [-2, 0, 2]) l.poli([[c * P - P + 0.03, -P / 2 + 0.02], [c * P + P - 0.03, P / 2 - 0.02]], { clase: 'c' });
          for (const k of [-3, -1, 1, 3]) {
            l.poli([[k * P, -P / 2], [k * P, P / 2]], { clase: 'g' });
            l.punto(k * P, 0, { clase: 'o', r: 3.6 });
          }
        },
      },
      {
        etiqueta: 'el espectro |bₙ|',
        x: [-0.6, 7], y: [-0.2, 1.25], cuadrado: false,
        dibuja: (l) => {
          l.ejes({ nombreX: 'n', nombreY: '|bₙ|', marcasX: [1, 3, 5], marcasY: [1] });
          for (let n = 1; n <= 6; n++) {
            l.poli([[n, 0], [n, 1 / n]], { clase: 'c' });
            l.punto(n, 1 / n, { r: 3.2 });
          }
          l.rotulo(0, 0, 'nada en n = 0', { dx: 6, dy: -8, color: 'var(--flag)' });
        },
      },
    ],
  });
});

fig('2022-2023-ord', 'ex2223-ord-9-fourier-de-la-escalera-de-dos-peldanos', () => {
  const l = lienzo({
    id: 'f-ex2223-escalera',
    ancho: 380, alto: 200,
    x: [-2.4, 4.4], y: [-0.35, 1.5],
    titulo: 'La escalera de periodo dos, con los saltos de medio y la media a tres cuartos',
    desc: 'Dos periodos completos de una función escalonada de periodo dos, con el eje marcado en '
      + 'enteros y no en múltiplos de pi. Cada periodo tiene un peldaño a altura uno en el primer '
      + 'tramo y otro a altura un medio en el segundo. En los enteros hay saltos de altura un '
      + 'medio, y en cada uno de ellos un punto a altura tres cuartos, que es lo que vale la '
      + 'serie. Una horizontal a esa altura marca el valor medio.',
  });
  l.ejes({ nombreX: 't', nombreY: 'f', marcasX: [-2, -1, 1, 2, 3, 4], marcasY: [[0.5, '½'], 1] });
  l.poli([[-2.3, 0.75], [4.3, 0.75]], { clase: 'g' });
  for (const c of [-2, 0, 2]) {
    l.poli([[c, 1], [c + 1, 1]], { clase: 'c' });
    l.poli([[c + 1, 0.5], [c + 2, 0.5]], { clase: 'c' });
    l.poli([[c, 0.5], [c, 1]], { clase: 'g' });
    l.poli([[c + 1, 0.5], [c + 1, 1]], { clase: 'g' });
  }
  for (const t of [-2, -1, 0, 1, 2, 3, 4]) l.punto(t, 0.75, { clase: 'o', r: 3.6 });
  l.rotulo(3.4, 0.75, 'S = ¾ en los saltos', { dx: 0, dy: -8, anclaje: 'end', color: 'var(--flag)' });
  l.esquina(14, 18, 'periodo T = 2, no 2π');
  return l.svg();
});

/* ── a pegar ─────────────────────────────────────────────────────────── */
for (const f of figuras) f.svg = f.hacer();

if (process.argv[1]?.endsWith('calculo-examenes.mjs')) {
  for (const f of figuras) pega(f.fichero, f.id, f.svg, f.paso);
  console.log(`${figuras.length} figuras pegadas en ${new Set(figuras.map((f) => f.fichero)).size} convocatorias`);
}
