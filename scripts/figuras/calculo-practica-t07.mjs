/**
 * Las figuras de las prácticas del tema 7: la integral múltiple.
 *
 * Diecinueve recintos y sólidos. En este tema la mitad del ejercicio es poner
 * los límites, y los límites se leen de dos dibujos: el corte, que da los de
 * la altura, y la planta, que da los del plano. Cuando el enunciado usa
 * parámetros —a, R, h— se dibuja con ellos valiendo uno, y el pie de la figura
 * lo dice: lo que informa es la forma, no el tamaño.
 *
 *     node scripts/figuras/calculo-practica-t07.mjs
 */

import { lienzo, mosaico } from './lienzo.mjs';
import { pegaEnCampo } from './pegar.mjs';

const FICHERO = 'src/content/calculo/t07-integral-multiple/ejercicios.yaml';
const P = Math.PI;

export const figuras = [];
const fig = (id, pie, hacer) => figuras.push({ fichero: FICHERO, id, campo: 'resolucion', pie, hacer });

const aro = (cx, cy, r, n = 120) =>
  Array.from({ length: n + 1 }, (_, k) => {
    const t = (2 * P * k) / n;
    return [cx + r * Math.cos(t), cy + r * Math.sin(t)];
  });
const oval = (cx, cy, a, b, n = 140) =>
  Array.from({ length: n + 1 }, (_, k) => {
    const t = (2 * P * k) / n;
    return [cx + a * Math.cos(t), cy + b * Math.sin(t)];
  });
const arco = (cx, cy, r, a0, a1, n = 90) =>
  Array.from({ length: n + 1 }, (_, k) => {
    const t = a0 + ((a1 - a0) * k) / n;
    return [cx + r * Math.cos(t), cy + r * Math.sin(t)];
  });
const entre = (arriba, abajo, a, b, n = 80) => {
  const p = [];
  for (let k = 0; k <= n; k++) { const x = a + ((b - a) * k) / n; p.push([x, arriba(x)]); }
  for (let k = 0; k <= n; k++) { const x = b + ((a - b) * k) / n; p.push([x, abajo(x)]); }
  return p;
};

/** El molde de siempre: corte a la izquierda, planta a la derecha. */
const solido = ({ id, titulo, desc, corte, planta, etiquetaCorte = 'el corte por XZ', etiquetaPlanta = 'la planta en XY' }) =>
  mosaico({
    id, titulo, desc, columnas: 2, ancho: 205, alto: 180,
    celdas: [{ etiqueta: etiquetaCorte, ...corte }, { etiqueta: etiquetaPlanta, ...planta }],
  });

/** Una planta que es un disco. */
const disco = (R, etiqueta, cx = 0, cy = 0, extra) => ({
  x: [cx - R * 1.6, cx + R * 1.6], y: [cy - R * 1.6, cy + R * 1.6], cuadrado: true,
  dibuja: (l) => {
    l.poli(aro(cx, cy, R), { clase: 'f', cerrar: true });
    l.ejes({ nombreX: 'x', nombreY: 'y' });
    l.poli(aro(cx, cy, R), { clase: 'c' });
    l.rotulo(cx, cy, etiqueta, { dx: 0, dy: -9, anclaje: 'middle' });
    if (extra) extra(l);
  },
});

/* ── 1 · el área con tres desigualdades ──────────────────────────────── */
fig('area-con-tres-desigualdades',
  'El recinto entre las dos rectas y bajo la hipérbola xy = 2, con los vértices en (1,2) y (2,1).',
  () => {
    const l = lienzo({
      id: 'f-pt7-tres-desig',
      ancho: 320, alto: 250,
      x: [-0.25, 3], y: [-0.25, 3], cuadrado: true,
      titulo: 'El recinto entre y = x/2 e y = 2x, recortado por la hipérbola xy = 2',
      desc: 'Las dos rectas y igual a dos x e y igual a x partido por dos salen del origen y '
        + 'abren una cuña. La hipérbola xy igual a dos la corta en los puntos (1,2) y (2,1), y el '
        + 'recinto es lo que queda entre el origen y esa curva: una cuña con la punta en el '
        + 'origen y el borde de arriba curvo.',
    });
    const t1 = Math.atan(2);
    const t2 = Math.atan(0.5);
    const borde = [[0, 0]];
    for (let k = 0; k <= 40; k++) {
      const t = t2 + ((t1 - t2) * k) / 40;
      const r = Math.sqrt(2 / (Math.cos(t) * Math.sin(t)));
      borde.push([r * Math.cos(t), r * Math.sin(t)]);
    }
    l.poli(borde, { clase: 'f', cerrar: true });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2], marcasY: [1, 2] });
    l.curva((x) => 2 * x, [0, 1.45], { clase: 'c' });
    l.curva((x) => x / 2, [0, 2.9], { clase: 'c' });
    l.curva((x) => 2 / x, [0.7, 2.9], { clase: 'c2', n: 60 });
    l.punto(1, 2, { clase: 'o', r: 4 });
    l.punto(2, 1, { clase: 'o', r: 4 });
    l.rotulo(1, 2, '(1,2)', { dx: 6, dy: -5, color: 'var(--flag)' });
    l.rotulo(2, 1, '(2,1)', { dx: 6, dy: 4, color: 'var(--flag)' });
    l.rotulo(2.6, 2 / 2.6, 'xy = 2', { dx: 4, dy: 14, anclaje: 'end', color: 'var(--alt)' });
    return l.svg();
  });

/* ── 2 · el triángulo con densidad lineal ────────────────────────────── */
fig('centro-de-gravedad-triangulo-densidad-lineal',
  'El triángulo de catetos a y b, con las franjas más oscuras donde más pesa: la densidad crece al alejarse del cateto vertical.',
  () => {
    const l = lienzo({
      id: 'f-pt7-triangulo-densidad',
      ancho: 320, alto: 230,
      x: [-0.25, 1.35], y: [-0.25, 1.25], cuadrado: false,
      titulo: 'El triángulo rectángulo de catetos a y b, con la densidad creciendo hacia la derecha',
      desc: 'Un triángulo rectángulo con el ángulo recto en el origen, el cateto horizontal de '
        + 'longitud a sobre el eje x y el vertical de longitud b sobre el eje y. Se dibujan tres '
        + 'franjas verticales de muestra, cada vez más oscuras hacia la derecha, porque la '
        + 'densidad es proporcional a la distancia al cateto vertical.',
    });
    l.poli([[0, 0], [1, 0], [0, 1]], { clase: 'f', cerrar: true });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [[1, 'a']], marcasY: [[1, 'b']] });
    l.poli([[0, 0], [1, 0], [0, 1]], { clase: 'c', cerrar: true });
    for (const x of [0.25, 0.5, 0.75]) l.poli([[x, 0], [x, 1 - x]], { clase: 'cp2' });
    l.rotulo(0.75, 0.25, 'pesa más', { dx: 6, dy: -4, color: 'var(--alt)' });
    l.rotulo(0.25, 0.75, 'pesa menos', { dx: 6, dy: -4, color: 'var(--faint)', pequeno: true });
    return l.svg();
  });

/* ── 3 · el sector circular ──────────────────────────────────────────── */
fig('centro-de-gravedad-sector-circular',
  'El sector de radio a y ángulo 2α, simétrico respecto del eje: el centro de gravedad cae sobre él.',
  () => {
    const al = g60();
    const l = lienzo({
      id: 'f-pt7-sector',
      x: [-0.4, 1.4], y: [-1, 1], cuadrado: true,
      titulo: 'El sector circular de radio a y ángulo 2α, con su centro de gravedad sobre el eje',
      desc: 'Un trozo de tarta con el vértice en el origen, de radio a, que abre el mismo ángulo '
        + 'alfa por encima y por debajo del eje horizontal. Por esa simetría, el centro de '
        + 'gravedad cae sobre el eje horizontal, a dos tercios del radio por el seno de alfa '
        + 'partido por alfa.',
    });
    const xG = ((2 / 3) * Math.sin(al)) / al;
    l.poli([[0, 0], ...arco(0, 0, 1, -al, al, 60)], { clase: 'f', cerrar: true });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [[1, 'a']] });
    l.poli([[0, 0], ...arco(0, 0, 1, -al, al, 60), [0, 0]], { clase: 'c' });
    l.poli([[0, 0], [1.25, 0]], { clase: 'g' });
    l.punto(xG, 0, { clase: 'o', r: 4.4 });
    l.rotulo(xG, 0, 'G', { dx: 0, dy: -8, anclaje: 'middle', color: 'var(--flag)' });
    l.rotulo(...[0.62 * Math.cos(al / 2), 0.62 * Math.sin(al / 2)], 'α', { dx: 2, dy: -3 });
    return l.svg();
  });
function g60() { return P / 3; }

/* ── 4 · la bóveda de Viviani ────────────────────────────────────────── */
fig('boveda-de-viviani',
  'La media bola de radio a mordida por el cilindro que pasa por el centro y toca la esfera: en planta, el disco pequeño con el origen en su borde.',
  () =>
    solido({
      id: 'f-pt7-viviani',
      etiquetaCorte: 'el corte por y = 0',
      titulo: 'La bóveda de Viviani: media esfera de radio a recortada por el cilindro tangente',
      desc: 'A la izquierda, el corte por el plano y igual a cero: la media circunferencia '
        + 'superior de radio a, con las dos generatrices del cilindro en x igual a cero y en x '
        + 'igual a a. A la derecha, la planta, que es la clave: el disco de centro (a/2, 0) y '
        + 'radio a partido por dos, tangente por dentro a la circunferencia de radio a y con el '
        + 'origen justo en su borde.',
      corte: {
        x: [-1.3, 1.3], y: [-0.35, 1.25], cuadrado: false,
        dibuja: (l) => {
          l.poli([...arco(0, 0, 1, 0, P / 2, 50), [0, 0]], { clase: 'f', cerrar: true });
          l.ejes({ nombreX: 'x', nombreY: 'z', marcasX: [[1, 'a']], marcasY: [[1, 'a']] });
          l.poli(arco(0, 0, 1, 0, P, 90), { clase: 'c' });
          l.poli([[1, -0.3], [1, 1.2]], { clase: 'cp2' });
          l.poli([[0, -0.3], [0, 1.2]], { clase: 'cp2' });
          l.punto(1, 0, { clase: 'o', r: 3.6 });
        },
      },
      planta: {
        x: [-1.4, 1.4], y: [-1.4, 1.4], cuadrado: true,
        dibuja: (l) => {
          l.poli(aro(0.5, 0, 0.5), { clase: 'f', cerrar: true });
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [[1, 'a']] });
          l.poli(aro(0, 0, 1), { clase: 'g' });
          l.poli(aro(0.5, 0, 0.5), { clase: 'c' });
          l.punto(0, 0, { clase: 'o', r: 3.4 });
          l.punto(1, 0, { clase: 'o', r: 3.4 });
          l.rotulo(0.5, 0.5, 'r = a cos θ', { dx: 2, dy: -6 });
        },
      },
    }));

/* ── 5 · la esfera partida por el cono ───────────────────────────────── */
fig('esfera-cortada-por-el-cono',
  'La bola de radio a menos los dos conos de 45°: lo que queda es la faja central, y φ va de π/4 a 3π/4.',
  () => {
    const l = lienzo({
      id: 'f-pt7-esfera-cono',
      ancho: 330, alto: 250,
      x: [-1.4, 1.4], y: [-1.4, 1.4], cuadrado: true,
      titulo: 'La faja de la bola que queda fuera de los dos conos de cuarenta y cinco grados',
      desc: 'El corte por un plano que contiene el eje: la circunferencia de radio a y las dos '
        + 'rectas de pendiente uno y menos uno, que son el cono doble. La condición deja fuera '
        + 'los dos conos —el de arriba y el de abajo— y se queda con la faja central, sombreada. '
        + 'En esféricas eso es el ángulo phi entre pi cuartos y tres pi cuartos.',
    });
    const t0 = P / 4;
    l.poli([...arco(0, 0, 1, -t0, t0, 40), [0, 0]], { clase: 'f', cerrar: true });
    l.poli([...arco(0, 0, 1, P - t0, P + t0, 40), [0, 0]], { clase: 'f', cerrar: true });
    l.ejes({ nombreX: 'x', nombreY: 'z', marcasX: [[1, 'a'], [-1, '−a']] });
    l.poli(aro(0, 0, 1), { clase: 'c' });
    l.curva((x) => x, [-1.3, 1.3], { clase: 'c2' });
    l.curva((x) => -x, [-1.3, 1.3], { clase: 'c2' });
    l.rotulo(0.85, 0.15, 'φ ∈ (π/4, 3π/4)', { dx: -8, dy: 4, anclaje: 'end' });
    l.esquina(14, 18, 'los dos conos quedan fuera');
    return l.svg();
  });

/* ── 6 · el cilindro descentrado bajo un paraboloide ─────────────────── */
fig('cilindro-bajo-paraboloide',
  'El cilindro descentrado x²+y² = 2ax visto en planta, y el paraboloide que le pone el techo.',
  () =>
    solido({
      id: 'f-pt7-cilindro-parab',
      etiquetaCorte: 'el corte por y = 0',
      titulo: 'El cilindro descentrado con techo de paraboloide',
      desc: 'A la izquierda, el corte por el plano y igual a cero: el suelo z igual a cero, las '
        + 'dos generatrices del cilindro en x igual a cero y x igual a dos a, y encima la '
        + 'parábola z igual a x al cuadrado partido por dos a, que sube de cero a dos a. A la '
        + 'derecha, la planta: el disco de centro (a,0) y radio a, que pasa por el origen.',
      corte: {
        x: [-0.6, 2.6], y: [-0.5, 2.6], cuadrado: false,
        dibuja: (l) => {
          l.poli(entre((x) => (x * x) / 2, () => 0, 0, 2), { clase: 'f', cerrar: true });
          l.ejes({ nombreX: 'x', nombreY: 'z', marcasX: [[1, 'a'], [2, '2a']], marcasY: [[2, '2a']] });
          l.curva((x) => (x * x) / 2, [0, 2.2], { clase: 'c', n: 50 });
          l.poli([[0, 0], [0, 2.4]], { clase: 'cp2' });
          l.poli([[2, 0], [2, 2.4]], { clase: 'cp2' });
          l.poli([[0, 0], [2, 0]], { clase: 'c2' });
        },
      },
      planta: {
        x: [-1.6, 3.6], y: [-2.6, 2.6], cuadrado: true,
        dibuja: (l) => {
          l.poli(aro(1, 0, 1), { clase: 'f', cerrar: true });
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [[1, 'a'], [2, '2a']] });
          l.poli(aro(1, 0, 1), { clase: 'c' });
          l.punto(0, 0, { clase: 'o', r: 3.4 });
          l.rotulo(1, 1, 'r = 2a cos θ', { dx: 2, dy: -6 });
        },
      },
    }));

/* ── 7 · el cilindro descentrado con un cono encima ──────────────────── */
fig('volumen-cilindro-cono',
  'El mismo cilindro descentrado, ahora con el cono z = r de techo: en el corte, una recta en vez de una parábola.',
  () =>
    solido({
      id: 'f-pt7-cilindro-cono',
      etiquetaCorte: 'el corte por y = 0',
      titulo: 'El cilindro descentrado con techo de cono',
      desc: 'A la izquierda, el corte por el plano y igual a cero: el suelo, las dos generatrices '
        + 'del cilindro en cero y en dos a, y el techo, que aquí es la recta z igual a x —el '
        + 'cono— y llega a dos a en la pared del fondo. A la derecha, la planta: el mismo disco '
        + 'de centro (a,0) y radio a que pasa por el origen.',
      corte: {
        x: [-0.6, 2.6], y: [-0.5, 2.6], cuadrado: false,
        dibuja: (l) => {
          l.poli([[0, 0], [2, 0], [2, 2]], { clase: 'f', cerrar: true });
          l.ejes({ nombreX: 'x', nombreY: 'z', marcasX: [[1, 'a'], [2, '2a']], marcasY: [[2, '2a']] });
          l.curva((x) => x, [0, 2.3], { clase: 'c' });
          l.poli([[0, 0], [0, 2.4]], { clase: 'cp2' });
          l.poli([[2, 0], [2, 2.4]], { clase: 'cp2' });
          l.poli([[0, 0], [2, 0]], { clase: 'c2' });
          l.rotulo(1.4, 1.4, 'z = r', { dx: -6, dy: -6, anclaje: 'end', color: 'var(--d1)' });
        },
      },
      planta: {
        x: [-1.6, 3.6], y: [-2.6, 2.6], cuadrado: true,
        dibuja: (l) => {
          l.poli(aro(1, 0, 1), { clase: 'f', cerrar: true });
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [[1, 'a'], [2, '2a']] });
          l.poli(aro(1, 0, 1), { clase: 'c' });
          l.punto(0, 0, { clase: 'o', r: 3.4 });
        },
      },
    }));

/* ── 8 · la inercia del triángulo ────────────────────────────────────── */
fig('inercia-del-triangulo',
  'El triángulo de vértices (0,2), (2,0) y (2,2). Barrerlo en franjas horizontales es lo que hace la integral corta.',
  () => {
    const l = lienzo({
      id: 'f-pt7-inercia-triangulo',
      ancho: 300, alto: 250,
      x: [-0.3, 2.6], y: [-0.3, 2.6], cuadrado: true,
      titulo: 'El triángulo entre x+y = 2, x = 2 e y = 2, con una franja horizontal de muestra',
      desc: 'Un triángulo con los vértices en (0,2), (2,0) y (2,2), limitado por la recta x más y '
        + 'igual a dos por abajo a la izquierda, por la vertical x igual a dos por la derecha y '
        + 'por la horizontal y igual a dos por arriba. Una franja horizontal de muestra, a la '
        + 'altura y igual a uno, va desde la recta hasta la vertical.',
    });
    l.poli([[0, 2], [2, 0], [2, 2]], { clase: 'f', cerrar: true });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [2], marcasY: [2] });
    l.poli([[0, 2], [2, 0], [2, 2]], { clase: 'c', cerrar: true });
    l.poli([[1, 1], [2, 1]], { clase: 'cp2' });
    l.rotulo(1.5, 1, 'x: de 2−y a 2', { dx: 0, dy: -7, anclaje: 'middle', color: 'var(--alt)' });
    l.rotulo(0.9, 1.1, 'x+y = 2', { dx: -6, dy: -6, anclaje: 'end', color: 'var(--d1)' });
    return l.svg();
  });

/* ── 9 · la arandela ─────────────────────────────────────────────────── */
fig('inercias-del-disco-anular',
  'La arandela entre los radios d/2 y D/2. Por simetría, la inercia respecto de un diámetro es la mitad de la polar.',
  () => {
    const l = lienzo({
      id: 'f-pt7-arandela',
      ancho: 300, alto: 250,
      x: [-1.3, 1.3], y: [-1.3, 1.3], cuadrado: true,
      titulo: 'La arandela entre los dos radios, con el diámetro de referencia marcado',
      desc: 'Dos circunferencias concéntricas, la interior de radio d partido por dos y la '
        + 'exterior de radio D partido por dos. Entre ellas queda sombreada la corona. Un '
        + 'diámetro horizontal a trazos marca el eje respecto del que se calcula la segunda '
        + 'inercia; por simetría entre los dos diámetros perpendiculares, esa inercia es la mitad '
        + 'de la polar.',
    });
    const d = (ps) => ps.map(([u, v], i) => `${i ? 'L' : 'M'}${Math.round(l.X(u) * 10) / 10} ${Math.round(l.Y(v) * 10) / 10}`).join('') + 'Z';
    l.crudo(`<path class="f-pt7-arandela-f" fill-rule="evenodd" d="${d(aro(0, 0, 1))}${d(aro(0, 0, 0.45))}"/>`);
    l.ejes({ nombreX: 'x', nombreY: 'y' });
    l.poli(aro(0, 0, 1), { clase: 'c' });
    l.poli(aro(0, 0, 0.45), { clase: 'c2' });
    l.poli([[-1.2, 0], [1.2, 0]], { clase: 'cp' });
    l.rotulo(1, 0, 'D/2', { dx: -3, dy: -8, anclaje: 'end', color: 'var(--d1)' });
    l.rotulo(0.45, 0, 'd/2', { dx: -3, dy: 16, anclaje: 'end', color: 'var(--alt)' });
    l.esquina(14, 18, 'I_diámetro = I_polar / 2');
    return l.svg();
  });

/* ── 10 · el cono hasta su tapa ──────────────────────────────────────── */
fig('triple-del-cono-hasta-la-tapa',
  'El cono de radio R y altura h con su tapa: z va de la pared del cono hasta h, y r de 0 a R.',
  () =>
    solido({
      id: 'f-pt7-cono-tapa',
      titulo: 'El cono de radio R y altura h, cerrado por su tapa plana',
      desc: 'A la izquierda, el corte: dos rectas que salen del origen y llegan a altura h en x '
        + 'igual a más y menos R, cerradas arriba por la tapa horizontal. Es un triángulo con el '
        + 'vértice abajo. A la derecha, la planta: el disco de radio R.',
      corte: {
        x: [-1.5, 1.5], y: [-0.35, 1.5], cuadrado: false,
        dibuja: (l) => {
          l.poli([[0, 0], [1, 1], [-1, 1]], { clase: 'f', cerrar: true });
          l.ejes({ nombreX: 'x', nombreY: 'z', marcasX: [[1, 'R'], [-1, '−R']], marcasY: [[1, 'h']] });
          l.poli([[-1, 1], [0, 0], [1, 1]], { clase: 'c' });
          l.poli([[-1, 1], [1, 1]], { clase: 'c2' });
          l.rotulo(0, 0.55, 'z: de hr/R a h', { dx: 0, dy: 4, anclaje: 'middle' });
        },
      },
      planta: disco(1, 'r ≤ R'),
    }));

/* ── 11 · el área entre dos circunferencias en polares ───────────────── */
fig('area-entre-dos-circunferencias-en-polares',
  'La corona entre r = 2cos θ y r = 4cos θ, recortada por el sector de 0 a 45°: en polares es un rectángulo.',
  () => {
    const l = lienzo({
      id: 'f-pt7-dos-circunferencias',
      ancho: 330, alto: 235,
      x: [-0.6, 4.6], y: [-0.8, 2.8], cuadrado: true,
      titulo: 'La región entre las dos circunferencias tangentes en el origen, dentro del sector',
      desc: 'Dos circunferencias que pasan por el origen: la pequeña de centro (1,0) y radio uno, '
        + 'la grande de centro (2,0) y radio dos. Entre las dos queda una corona en forma de '
        + 'media luna. Las condiciones y mayor o igual que cero e y menor o igual que x recortan '
        + 'de ella el sector entre cero y cuarenta y cinco grados, que es lo sombreado.',
    });
    const region = [];
    for (let k = 0; k <= 40; k++) { const t = (P / 4 * k) / 40; region.push([4 * Math.cos(t) * Math.cos(t), 4 * Math.cos(t) * Math.sin(t)]); }
    for (let k = 40; k >= 0; k--) { const t = (P / 4 * k) / 40; region.push([2 * Math.cos(t) * Math.cos(t), 2 * Math.cos(t) * Math.sin(t)]); }
    l.poli(region, { clase: 'f', cerrar: true });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2, 4] });
    /* Solo las mitades de arriba: la condición y ≥ 0 deja fuera el resto. */
    l.poli(arco(1, 0, 1, 0, P, 60), { clase: 'c' });
    l.poli(arco(2, 0, 2, 0, P, 60), { clase: 'c2' });
    l.poli([[0, 0], [2.6, 2.6]], { clase: 'g' });
    l.rotulo(2, 0.3, 'r = 4cos θ', { dx: 8, dy: 0, color: 'var(--alt)' });
    l.rotulo(1, -0.35, 'r = 2cos θ', { dx: 0, dy: 0, anclaje: 'middle', color: 'var(--d1)' });
    l.rotulo(2.6, 2.6, 'y = x', { dx: -4, dy: 14, anclaje: 'end', color: 'var(--faint)', pequeno: true });
    return l.svg();
  });

/* ── 12 · el cuarto de elipse ────────────────────────────────────────── */
fig('centro-de-gravedad-elipse',
  'El cuarto de elipse de semiejes 2 y 1 en el primer cuadrante, con su centro de gravedad marcado.',
  () => {
    const xG = 8 / (3 * P);
    const yG = 4 / (3 * P);
    const l = lienzo({
      id: 'f-pt7-cuarto-elipse',
      ancho: 320, alto: 220,
      x: [-0.4, 2.6], y: [-0.35, 1.5], cuadrado: true,
      titulo: 'El cuarto de elipse del primer cuadrante y su centro de gravedad',
      desc: 'Un cuarto de elipse de semieje dos en horizontal y uno en vertical, apoyado en los '
        + 'dos ejes. El centro de gravedad cae dentro, en el punto de coordenadas ocho partido '
        + 'por tres pi y cuatro partido por tres pi, aproximadamente (0,85 ; 0,42): más cerca del '
        + 'origen que del arco, porque ahí hay más área.',
    });
    l.poli([[0, 0], ...Array.from({ length: 41 }, (_, k) => { const t = (P / 2 * k) / 40; return [2 * Math.cos(t), Math.sin(t)]; })], { clase: 'f', cerrar: true });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2], marcasY: [1] });
    l.curva((t) => [2 * Math.cos(t), Math.sin(t)], [0, P / 2], { clase: 'c', n: 60 });
    l.poli([[0, 0], [2, 0]], { clase: 'c2' });
    l.poli([[0, 0], [0, 1]], { clase: 'c2' });
    l.punto(xG, yG, { clase: 'o', r: 4.4 });
    l.rotulo(xG, yG, 'G ≈ (0,85 ; 0,42)', { dx: 7, dy: -5, color: 'var(--flag)' });
    return l.svg();
  });

/* ── 13 · cilíndricas o esféricas ────────────────────────────────────── */
fig('cilindricas-o-esfericas',
  'El helado: cono de 45° por debajo, casquete de la esfera de radio 2 por encima, cortándose en r = z = √2.',
  () =>
    solido({
      id: 'f-pt7-cilindricas',
      titulo: 'El cono de cuarenta y cinco grados tapado por el casquete de la esfera de radio dos',
      desc: 'A la izquierda, el corte: dos rectas de pendiente uno y menos uno que salen del '
        + 'origen —el cono— y el arco de la circunferencia de radio dos por encima. Se cortan en '
        + 'x igual a más y menos raíz de dos, a la altura raíz de dos. La región entre las dos '
        + 'tiene forma de helado: cucurucho abajo, bola arriba. A la derecha, la planta: el disco '
        + 'de radio raíz de dos.',
      corte: {
        x: [-2.4, 2.4], y: [-0.4, 2.4], cuadrado: false,
        dibuja: (l) => {
          const r2 = Math.SQRT2;
          l.poli([[0, 0], ...arco(0, 0, 2, P / 4, (3 * P) / 4, 40)], { clase: 'f', cerrar: true });
          l.ejes({ nombreX: 'x', nombreY: 'z', marcasX: [[r2, '√2'], [-r2, '−√2'], 2], marcasY: [[r2, '√2'], 2] });
          l.poli([[-2.1, 2.1], [0, 0], [2.1, 2.1]].filter(([, v]) => v <= 2.3), { clase: 'c' });
          l.poli(arco(0, 0, 2, 0, P, 90), { clase: 'c2' });
          l.punto(r2, r2, { clase: 'o', r: 3.6 });
          l.punto(-r2, r2, { clase: 'o', r: 3.6 });
        },
      },
      planta: disco(Math.SQRT2, 'r ≤ √2'),
    }));

/* ── 14 · el cuarto de corona ────────────────────────────────────────── */
fig('centro-de-gravedad-de-una-figura',
  'El cuarto de corona entre los radios 1 y 2, con su centro de gravedad sobre la bisectriz.',
  () => {
    const rG = (4 / 3) * ((8 - 1) / (4 - 1)) / P * (P / 2) / (P / 2);
    const xG = ((4 / 3) * (8 - 1)) / ((P / 2) * (4 - 1)) * (1);
    const l = lienzo({
      id: 'f-pt7-cuarto-corona',
      ancho: 300, alto: 250,
      x: [-0.4, 2.6], y: [-0.4, 2.6], cuadrado: true,
      titulo: 'El cuarto de corona entre los radios uno y dos, con su centro de gravedad',
      desc: 'La zona del primer cuadrante que queda entre la circunferencia de radio uno y la de '
        + 'radio dos. El centro de gravedad cae sobre la bisectriz del cuadrante, por simetría, a '
        + 'una distancia del origen de aproximadamente uno coma cuarenta y ocho, más cerca del '
        + 'arco exterior que del interior porque ahí hay más área.',
    });
    l.poli([
      ...arco(0, 0, 2, 0, P / 2, 40),
      ...arco(0, 0, 1, P / 2, 0, 40),
    ], { clase: 'f', cerrar: true });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2], marcasY: [1, 2] });
    l.poli(arco(0, 0, 2, 0, P / 2, 60), { clase: 'c' });
    l.poli(arco(0, 0, 1, 0, P / 2, 60), { clase: 'c2' });
    l.poli([[1, 0], [2, 0]], { clase: 'c' });
    l.poli([[0, 1], [0, 2]], { clase: 'c' });
    l.poli([[0, 0], [2.2, 2.2]], { clase: 'g' });
    const d = xG / Math.SQRT2;
    l.punto(d, d, { clase: 'o', r: 4.4 });
    l.rotulo(d, d, 'G', { dx: 7, dy: -5, color: 'var(--flag)' });
    void rG;
    return l.svg();
  });

/* ── 15 · el cilindro cortado en diagonal ────────────────────────────── */
fig('el-cilindro-cortado-por-un-plano-inclinado',
  'El cilindro de radio 1 con el techo inclinado z = 3 − x − y: la altura media es 3, y por simetría los términos en x e y se van.',
  () =>
    solido({
      id: 'f-pt7-cilindro-diagonal',
      etiquetaCorte: 'el corte por y = 0',
      titulo: 'El cilindro de radio uno con el techo cortado por un plano inclinado',
      desc: 'A la izquierda, el corte por el plano y igual a cero: un rectángulo de menos uno a '
        + 'uno apoyado en el suelo, con el techo inclinado z igual a tres menos x, que baja de '
        + 'cuatro a dos. La altura en el eje es tres. A la derecha, la planta: el disco de radio '
        + 'uno, sobre el que se integra.',
      corte: {
        x: [-1.7, 1.7], y: [-0.7, 4.8], cuadrado: false,
        dibuja: (l) => {
          l.poli([[-1, 0], [1, 0], [1, 2], [-1, 4]], { clase: 'f', cerrar: true });
          l.ejes({ nombreX: 'x', nombreY: 'z', marcasX: [-1, 1], marcasY: [2, 3, 4] });
          l.curva((x) => 3 - x, [-1.4, 1.4], { clase: 'c' });
          l.poli([[-1, 0], [-1, 4]], { clase: 'c2' });
          l.poli([[1, 0], [1, 2]], { clase: 'c2' });
          l.poli([[-1, 0], [1, 0]], { clase: 'c2' });
          l.punto(0, 3, { clase: 'o', r: 3.6 });
          l.rotulo(0, 3, 'altura media 3', { dx: 6, dy: -6, color: 'var(--flag)' });
        },
      },
      planta: disco(1, 'r ≤ 1'),
    }));

/* ── 16 · el centro de gravedad del paraboloide tumbado ──────────────── */
fig('centro-de-gravedad-del-paraboloide',
  'El paraboloide elíptico tumbado sobre OX, cortado en x = 2: el centro de gravedad cae en x = 4/3, no en la mitad.',
  () =>
    mosaico({
      id: 'f-pt7-cg-paraboloide',
      titulo: 'El paraboloide tumbado cortado en x = 2, con el centro de gravedad a dos tercios',
      desc: 'A la izquierda, el corte por el plano z igual a cero: la parábola y al cuadrado igual '
        + 'a cuatro x, tumbada y abierta hacia la derecha, cerrada por la vertical x igual a dos, '
        + 'donde llega a más y menos dos coma ochenta y tres. El centro de gravedad está sobre el '
        + 'eje, en x igual a cuatro tercios: más cerca de la tapa que del vértice, porque las '
        + 'secciones crecen. A la derecha, la tapa: la elipse de semiejes dos coma ochenta y tres '
        + 'y dos.',
      columnas: 2, ancho: 205, alto: 180,
      celdas: [
        {
          etiqueta: 'el corte por z = 0',
          x: [-0.4, 2.7], y: [-3.4, 3.4], cuadrado: false,
          dibuja: (l) => {
            const ym = Math.sqrt(8);
            l.poli([
              ...Array.from({ length: 61 }, (_, k) => { const y = -ym + (2 * ym * k) / 60; return [(y * y) / 4, y]; }),
              [2, ym], [2, -ym],
            ], { clase: 'f', cerrar: true });
            l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [[4 / 3, '4/3'], 2], marcasY: [[ym, '2,83']] });
            l.curva((y) => [(y * y) / 4, y], [-3.1, 3.1], { clase: 'c', n: 70 });
            l.poli([[2, -3.2], [2, 3.2]], { clase: 'cp2' });
            l.punto(4 / 3, 0, { clase: 'o', r: 4 });
            l.rotulo(4 / 3, 0, 'G', { dx: 0, dy: -8, anclaje: 'middle', color: 'var(--flag)' });
          },
        },
        {
          etiqueta: 'la tapa en x = 2',
          x: [-3.6, 3.6], y: [-2.8, 2.8], cuadrado: false,
          dibuja: (l) => {
            l.poli(oval(0, 0, Math.sqrt(8), 2), { clase: 'f', cerrar: true });
            l.ejes({ nombreX: 'y', nombreY: 'z', marcasX: [[Math.sqrt(8), '2,83']], marcasY: [2] });
            l.poli(oval(0, 0, Math.sqrt(8), 2), { clase: 'c' });
          },
        },
      ],
    }));

/* ── 17 · el paraboloide elíptico cortado por un plano ───────────────── */
fig('paraboloide-eliptico-cortado-por-un-plano',
  'El paraboloide tumbado hasta x = a. Su volumen es exactamente la mitad del cilindro que lo envuelve.',
  () =>
    mosaico({
      id: 'f-pt7-parab-medio-cilindro',
      titulo: 'El paraboloide tumbado y el cilindro que lo envuelve, del que es la mitad justa',
      desc: 'A la izquierda, el corte: la parábola tumbada que sale del origen y llega a la tapa '
        + 'en x igual a a, dibujada dentro del rectángulo del cilindro que la envuelve. El '
        + 'paraboloide ocupa exactamente la mitad de ese cilindro, que es el resultado del '
        + 'ejercicio. A la derecha, la tapa: la elipse de semiejes dos b y dos c.',
      columnas: 2, ancho: 205, alto: 180,
      celdas: [
        {
          etiqueta: 'el corte por z = 0',
          x: [-0.35, 1.45], y: [-2.6, 2.6], cuadrado: false,
          dibuja: (l) => {
            l.poli([
              ...Array.from({ length: 61 }, (_, k) => { const y = -2 + (4 * k) / 60; return [(y * y) / 4, y]; }),
              [1, 2], [1, -2],
            ], { clase: 'f', cerrar: true });
            l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [[1, 'a']], marcasY: [[2, '√2·b'], [-2, '−√2·b']] });
            l.curva((y) => [(y * y) / 4, y], [-2.2, 2.2], { clase: 'c', n: 60 });
            l.poli([[0, -2], [1, -2], [1, 2], [0, 2]], { clase: 'cp2', cerrar: true });
            l.rotulo(0.55, 0, 'la mitad', { dx: 0, dy: 4, anclaje: 'middle' });
          },
        },
        {
          etiqueta: 'la tapa en x = a',
          x: [-2.8, 2.8], y: [-2.2, 2.2], cuadrado: false,
          dibuja: (l) => {
            l.poli(oval(0, 0, 2, 1.4), { clase: 'f', cerrar: true });
            l.ejes({ nombreX: 'y', nombreY: 'z', marcasX: [[2, '√2·b']], marcasY: [[1.4, '√2·c']] });
            l.poli(oval(0, 0, 2, 1.4), { clase: 'c' });
          },
        },
      ],
    }));

/* ── 18 · la inercia del cilindro sobre un diámetro de la base ───────── */
fig('inercia-del-cilindro-respecto-al-diametro-de-la-base',
  'El cilindro de radio a y altura h, girando sobre un diámetro de su base: el eje está en el suelo, no en el centro.',
  () => {
    const l = lienzo({
      id: 'f-pt7-inercia-cilindro',
      ancho: 320, alto: 235,
      x: [-1.6, 1.6], y: [-0.6, 1.9], cuadrado: false,
      titulo: 'El cilindro de radio a y altura h con el eje de giro en un diámetro de la base',
      desc: 'El corte por un plano vertical: un rectángulo de menos a a a y de altura h. El eje '
        + 'respecto del que se calcula la inercia no es el eje del cilindro sino un diámetro de '
        + 'su base, dibujado horizontal y apoyado en el suelo. La distancia de cada punto a ese '
        + 'eje mezcla la altura y una de las dos coordenadas del plano.',
    });
    l.poli([[-1, 0], [1, 0], [1, 1.5], [-1, 1.5]], { clase: 'f', cerrar: true });
    l.ejes({ nombreX: 'x', nombreY: 'z', marcasX: [[1, 'a'], [-1, '−a']], marcasY: [[1.5, 'h']] });
    l.poli([[-1, 0], [1, 0], [1, 1.5], [-1, 1.5]], { clase: 'c', cerrar: true });
    l.poli([[-1.45, 0], [1.45, 0]], { clase: 'cp2' });
    l.poli([[0, 0], [0, 1.5]], { clase: 'g' });
    l.rotulo(-1.45, 0, 'eje de giro', { dx: 4, dy: 16, color: 'var(--alt)' });
    l.rotulo(0, 1.5, 'eje del cilindro', { dx: 6, dy: -5, color: 'var(--faint)', pequeno: true });
    return l.svg();
  });

/* ── 19 · el ladrillo ────────────────────────────────────────────────── */
fig('masa-del-paralelepipedo',
  'El ladrillo a×b×c con la densidad creciendo hacia el vértice opuesto al origen: las tres integrales se separan.',
  () => {
    const p = (x, y, z) => [x + 0.42 * y, 0.3 * y + 0.95 * z];
    const l = lienzo({
      id: 'f-pt7-ladrillo',
      ancho: 320, alto: 240,
      x: [-0.35, 1.9], y: [-0.35, 1.75], cuadrado: false,
      titulo: 'El paralelepípedo de lados a, b y c, con la densidad creciendo hacia el vértice opuesto',
      desc: 'Una caja con una esquina en el origen y lados a, b y c en las tres direcciones. El '
        + 'vértice opuesto al origen está marcado: es donde la densidad, que vale x más y más z, '
        + 'es máxima. Como la densidad es una suma de las tres variables, la integral triple se '
        + 'parte en tres integrales sencillas.',
    });
    const V = {
      o: p(0, 0, 0), x: p(1, 0, 0), xy: p(1, 1, 0), y: p(0, 1, 0),
      z: p(0, 0, 1), xz: p(1, 0, 1), xyz: p(1, 1, 1), yz: p(0, 1, 1),
    };
    l.poli([V.z, V.xz, V.xyz, V.yz], { clase: 'f', cerrar: true });
    l.poli([V.o, V.x, V.xz, V.z], { clase: 'c', cerrar: true });
    l.poli([V.x, V.xy, V.xyz, V.xz], { clase: 'c', cerrar: true });
    l.poli([V.z, V.xz, V.xyz, V.yz], { clase: 'c2', cerrar: true });
    l.poli([V.o, V.y], { clase: 'g' });
    l.poli([V.y, V.xy], { clase: 'g' });
    l.poli([V.y, V.yz], { clase: 'g' });
    l.punto(...V.xyz, { clase: 'o', r: 4.2 });
    l.rotulo(...V.xyz, 'densidad máxima', { dx: -7, dy: -7, anclaje: 'end', color: 'var(--flag)' });
    l.rotulo(...V.x, 'a', { dx: 0, dy: 15, anclaje: 'middle', color: 'var(--faint)', pequeno: true });
    l.rotulo(...V.y, 'b', { dx: -8, dy: 10, anclaje: 'end', color: 'var(--faint)', pequeno: true });
    l.rotulo(...V.z, 'c', { dx: -8, dy: 0, anclaje: 'end', color: 'var(--faint)', pequeno: true });
    return l.svg();
  });

/* ── a pegar ─────────────────────────────────────────────────────────── */
for (const f of figuras) f.svg = f.hacer();

if (process.argv[1]?.endsWith('calculo-practica-t07.mjs')) {
  for (const f of figuras) pegaEnCampo(f.fichero, f.id, f.campo, f.svg, f.pie);
  console.log(`${figuras.length} figuras de práctica pegadas en ${FICHERO}`);
}
