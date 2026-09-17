/**
 * Las figuras de las prácticas del tema 6: funciones de varias variables.
 *
 * Casi todos estos ejercicios son la misma escena: un punto del plano, una o
 * dos direcciones y el gradiente. Y casi todos se contestan con el signo de un
 * producto escalar, que es un ángulo —agudo o obtuso— y por tanto se ve. Por
 * eso el dibujo ahorra media cuenta: dice antes de calcular si la función
 * sube o baja.
 *
 *     node scripts/figuras/calculo-practica-t06.mjs
 */

import { lienzo, mosaico, reetiqueta } from './lienzo.mjs';
import { pegaEnCampo } from './pegar.mjs';

export const FICHERO = 'src/content/calculo/t06-varias-variables/ejercicios.yaml';
const P = Math.PI;

export const figuras = [];
const fig = (id, pie, hacer) => figuras.push({ fichero: FICHERO, id, campo: 'resolucion', pie, hacer });

const aro = (cx, cy, r, n = 120) =>
  Array.from({ length: n + 1 }, (_, k) => {
    const t = (2 * P * k) / n;
    return [cx + r * Math.cos(t), cy + r * Math.sin(t)];
  });

/** Un vector dibujado desde un punto, escalado para que se vea. */
const flechaDesde = (l, [px, py], [vx, vy], escala, etiqueta, opciones = {}) => {
  const fin = [px + vx * escala, py + vy * escala];
  l.flecha([px, py], fin, { clase: opciones.clase ?? 'c2', color: opciones.color ?? 'var(--live)' });
  if (etiqueta) l.rotulo(...fin, etiqueta, { dx: opciones.dx ?? 6, dy: opciones.dy ?? -4, anclaje: opciones.anclaje, color: opciones.color ?? 'var(--live)' });
  return fin;
};

/* ── 1 · el límite por caminos ───────────────────────────────────────── */
fig('limite-por-caminos',
  'Cada recta y = mx llega al origen con un valor distinto: m/(1+m²). Basta con dos para que el límite no exista.',
  () => {
    const l = lienzo({
      id: 'f-pt6-limite-caminos',
      ancho: 320, alto: 250,
      x: [-2.3, 2.3], y: [-2.3, 2.3], cuadrado: true,
      titulo: 'Las rectas por el origen, cada una con el valor al que llega la función',
      desc: 'Cuatro rectas que pasan por el origen, con pendientes cero, un medio, uno y menos '
        + 'uno. Al acercarse al origen por cada una de ellas la función tiende a un valor '
        + 'distinto: cero por el eje horizontal, cero coma cuatro por la de pendiente un medio, '
        + 'cero coma cinco por la bisectriz y menos cero coma cinco por la otra diagonal. Con dos '
        + 'valores distintos ya basta: el límite no existe.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y' });
    for (const [m, etiqueta, cl] of [[0, '0', 'c'], [0.5, '0,4', 'c2'], [1, '½', 'c'], [-1, '−½', 'c2']]) {
      l.curva((x) => m * x, [-2.2, 2.2], { clase: cl });
      l.rotulo(2.2, m * 2.2, etiqueta, { dx: -4, dy: m >= 0 ? -6 : 14, anclaje: 'end', color: cl === 'c' ? 'var(--d1)' : 'var(--alt)' });
    }
    l.punto(0, 0, { clase: 'o', r: 4.6 });
    l.esquina(14, 18, 'valores distintos → no hay límite');
    return l.svg();
  });

/* ── 2 · el monte con dos direccionales ──────────────────────────────── */
fig('monte-con-dos-direccionales',
  'Las dos direccionales dadas son justo las de los ejes: valen las dos parciales, y el gradiente sale (2,2) sin más cuentas.',
  () => {
    const l = lienzo({
      id: 'f-pt6-monte',
      ancho: 320, alto: 245,
      x: [-0.4, 3.4], y: [-0.5, 3.6], cuadrado: true,
      titulo: 'El punto (1,2) con las dos direcciones del enunciado y el gradiente que fijan',
      desc: 'Desde el punto (1,2) salen dos flechas: una hacia (2,2), que es la dirección del eje '
        + 'x, y otra hacia (1,1), que es la del eje y cambiada de signo. La primera da una '
        + 'direccional de dos, o sea la parcial respecto de x; la segunda da menos dos, o sea '
        + 'menos la parcial respecto de y. Con las dos parciales, el gradiente es (2,2) y apunta '
        + 'a cuarenta y cinco grados: la dirección de máxima subida.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2, 3], marcasY: [1, 2, 3] });
    l.punto(1, 2, { clase: 'o', r: 4.6 });
    flechaDesde(l, [1, 2], [1, 0], 1, 'D = 2', { color: 'var(--alt)', clase: 'c2' });
    flechaDesde(l, [1, 2], [0, -1], 1, 'D = −2', { color: 'var(--alt)', clase: 'c2', dy: 14 });
    flechaDesde(l, [1, 2], [2, 2], 0.42, '∇F = (2,2)', { color: 'var(--d1)', clase: 'c' });
    l.rotulo(1, 2, 'P(1,2)', { dx: -8, dy: 4, anclaje: 'end', color: 'var(--flag)' });
    return l.svg();
  });

/* ── 3 · el bañista ──────────────────────────────────────────────────── */
fig('banista-en-el-lago',
  'El gradiente en (1,3) vale (10,6) y apunta arriba a la derecha; la dirección hacia P(5,5) forma con él un ángulo agudo, así que el bañista se calienta.',
  () => {
    const l = lienzo({
      id: 'f-pt6-banista',
      ancho: 330, alto: 250,
      x: [-0.5, 6.5], y: [0, 6.5], cuadrado: true,
      titulo: 'El gradiente en el punto del bañista y la dirección hacia P(5,5)',
      desc: 'Desde el punto (1,3) salen dos flechas. La del gradiente, que vale (10,6), apunta '
        + 'hacia arriba a la derecha con poca inclinación: esa es la dirección en la que el agua '
        + 'se calienta más deprisa. La otra va hacia el punto (5,5) y forma con la primera un '
        + 'ángulo agudo, así que nadando hacia allí también se calienta, aunque no al máximo '
        + 'ritmo posible.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 5], marcasY: [3, 5] });
    l.punto(1, 3, { clase: 'o', r: 4.6 });
    l.punto(5, 5, { r: 4 });
    flechaDesde(l, [1, 3], [10, 6], 0.24, '∇T', { color: 'var(--d1)', clase: 'c', dy: -6 });
    flechaDesde(l, [1, 3], [4, 2], 0.85, 'hacia P', { color: 'var(--alt)', clase: 'c2', dy: 15 });
    l.rotulo(1, 3, '(1,3)', { dx: -8, dy: 4, anclaje: 'end', color: 'var(--flag)' });
    l.rotulo(5, 5, 'P(5,5)', { dx: -6, dy: -7, anclaje: 'end' });
    l.esquina(14, 18, 'ángulo agudo → se calienta');
    return l.svg();
  });

/* ── 4 · la placa con dos ritmos ─────────────────────────────────────── */
fig('placa-con-dos-ritmos',
  'Los dos datos del enunciado son dos proyecciones del gradiente sobre direcciones distintas: dos ecuaciones y dos incógnitas.',
  () => {
    const l = lienzo({
      id: 'f-pt6-placa',
      ancho: 320, alto: 245,
      x: [-2.4, 2.4], y: [-2.4, 2.4], cuadrado: true,
      titulo: 'Las dos direcciones del enunciado desde el punto P, y el gradiente que hay que despejar',
      desc: 'Desde el punto P salen dos direcciones: la primera, (1,−1), baja hacia la derecha; la '
        + 'segunda, (1,2), sube hacia la derecha con más pendiente. Cada una viene con su ritmo de '
        + 'cambio, y cada ritmo es la proyección del gradiente sobre esa dirección. Son dos '
        + 'ecuaciones con dos incógnitas —las dos parciales— y de ahí sale el gradiente, dibujado '
        + 'a trazos porque es lo que hay que encontrar.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y' });
    l.punto(0, 0, { clase: 'o', r: 4.6 });
    flechaDesde(l, [0, 0], [1, -1], 1.1, 'v₁ = (1,−1)', { color: 'var(--alt)', clase: 'c2', dy: 14 });
    flechaDesde(l, [0, 0], [1, 2], 0.85, 'v₂ = (1,2)', { color: 'var(--alt)', clase: 'c2' });
    flechaDesde(l, [0, 0], [-1.4, 0.6], 1, '∇T = ?', { color: 'var(--d1)', clase: 'cp', anclaje: 'end', dx: -6 });
    l.rotulo(0, 0, 'P', { dx: -8, dy: 14, anclaje: 'end', color: 'var(--flag)' });
    return l.svg();
  });

/* ── 5 · el máximo paralelo al eje ───────────────────────────────────── */
fig('maximo-paralelo-al-eje',
  'Que el máximo se dé en la dirección de OX obliga a que la parcial respecto de y se anule: esa es la primera ecuación.',
  () => {
    const l = lienzo({
      id: 'f-pt6-maximo-eje',
      ancho: 320, alto: 235,
      x: [-0.4, 3.6], y: [-0.4, 3.2], cuadrado: true,
      titulo: 'El gradiente en P(1,2), horizontal y de módulo ocho',
      desc: 'En el punto (1,2) el gradiente es horizontal: apunta en la dirección del eje x. Eso '
        + 'significa que la parcial respecto de y vale cero allí, y es la primera de las dos '
        + 'ecuaciones. Que su módulo sea ocho es la segunda. Una flecha vertical a trazos, tachada, '
        + 'recuerda que la componente que falta es justo la que tiene que ser nula.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2, 3], marcasY: [1, 2, 3] });
    l.punto(1, 2, { clase: 'o', r: 4.6 });
    flechaDesde(l, [1, 2], [1, 0], 1.6, '|∇f| = 8', { color: 'var(--d1)', clase: 'c' });
    l.poli([[1, 2], [1, 2.8]], { clase: 'cp2' });
    l.poli([[0.7, 2.5], [1.3, 2.9]], { clase: 'cp2' });
    l.rotulo(1, 2.8, 'f_y = 0', { dx: 7, dy: -4, color: 'var(--alt)' });
    l.rotulo(1, 2, 'P(1,2)', { dx: -8, dy: 12, anclaje: 'end', color: 'var(--flag)' });
    return l.svg();
  });

/* ── 6 · aproximar con la diferencial ────────────────────────────────── */
fig('aproximar-con-la-diferencial',
  'El desplazamiento de P es pequeño y casi perpendicular al gradiente, por eso el valor baja poco: 2,40 frente al 2,44 exacto.',
  () => {
    const l = lienzo({
      id: 'f-pt6-diferencial',
      ancho: 330, alto: 240,
      x: [0.55, 1.55], y: [1.55, 2.45], cuadrado: true,
      titulo: 'El punto P(1,2), el desplazamiento pequeño y el gradiente',
      desc: 'Un zoom alrededor del punto (1,2). De él sale una flecha corta hacia (1,1 ; 1,9), que '
        + 'es el desplazamiento del enunciado, y otra, la del gradiente, que vale (−2,4) y apunta '
        + 'arriba a la izquierda. Las dos forman un ángulo obtuso, así que el valor baja: la '
        + 'aproximación da dos coma cuarenta y el valor exacto es dos coma cuarenta y cuatro.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1], marcasY: [2], enX: 1.6, enY: 0.6 });
    l.punto(1, 2, { clase: 'o', r: 4.6 });
    l.punto(1.1, 1.9, { r: 4 });
    flechaDesde(l, [1, 2], [-2, 4], 0.08, '∇f = (−2,4)', { color: 'var(--d1)', clase: 'c', anclaje: 'end', dx: -6 });
    l.flecha([1, 2], [1.1, 1.9], { clase: 'c2', color: 'var(--alt)' });
    l.rotulo(1.1, 1.9, '(1,1 ; 1,9)', { dx: 6, dy: 4, color: 'var(--alt)' });
    l.rotulo(1, 2, 'P', { dx: -8, dy: 4, anclaje: 'end', color: 'var(--flag)' });
    l.esquina(14, 18, 'aprox. 2,40 · exacto 2,44');
    return l.svg();
  });

/* ── 7 · los cuatro límites por curvas ───────────────────────────────── */
fig('cuatro-limites-por-curvas',
  'Las tres familias de caminos que usa el ejercicio: rectas, parábolas y senos. Cada familia toca el origen con una tangente distinta.',
  () =>
    mosaico({
      id: 'f-pt6-limites-curvas',
      titulo: 'Las tres familias de caminos hacia el origen que usa el ejercicio',
      desc: 'Tres mapas independientes. El primero, la familia de rectas y igual a m x, que '
        + 'llegan al origen con todas las pendientes. El segundo, la familia de parábolas y igual '
        + 'a m x al cuadrado, que llegan todas tangentes al eje horizontal: por eso distinguen '
        + 'cosas que las rectas no ven. El tercero, la familia y igual a m seno de x, que cerca '
        + 'del origen se confunde con las rectas pero no lejos.',
      columnas: 3, ancho: 176, alto: 158,
      celdas: [
        {
          etiqueta: '(a) y = mx',
          x: [-1.6, 1.6], y: [-1.6, 1.6], cuadrado: true,
          dibuja: (l) => {
            l.ejes({ nombreX: 'x', nombreY: 'y' });
            for (const m of [-2, -0.5, 0.5, 2]) {
              const b = Math.min(1.5, 1.5 / Math.abs(m));
              l.curva((x) => m * x, [-b, b], { clase: 'c' });
            }
            l.punto(0, 0, { clase: 'o', r: 3.6 });
          },
        },
        {
          etiqueta: '(b) y = mx²',
          x: [-1.6, 1.6], y: [-1.6, 1.6], cuadrado: true,
          dibuja: (l) => {
            l.ejes({ nombreX: 'x', nombreY: 'y' });
            for (const m of [-2, -0.5, 0.5, 2]) {
              const b = Math.min(1.5, Math.sqrt(1.5 / Math.abs(m)));
              l.curva((x) => m * x * x, [-b, b], { clase: 'c2', n: 40 });
            }
            l.punto(0, 0, { clase: 'o', r: 3.6 });
          },
        },
        {
          etiqueta: '(c) y = m sen x',
          x: [-3.4, 3.4], y: [-2.2, 2.2], cuadrado: false,
          dibuja: (l) => {
            l.ejes({ nombreX: 'x', nombreY: 'y' });
            for (const m of [-2, -1, 1, 2]) l.curva((x) => m * Math.sin(x), [-3.2, 3.2], { clase: 'c', n: 60 });
            l.punto(0, 0, { clase: 'o', r: 3.6 });
          },
        },
      ],
    }));

/* ── 8 y 9 · los cuatro planos tangentes y sus aproximaciones ────────── */
const cuatroNiveles = (id) =>
  mosaico({
    id,
    titulo: 'Las cuatro curvas de nivel por el punto dado, con su tangente',
    desc: 'Cuatro mapas independientes. En el primero, la curva de nivel tres de la superficie, '
      + 'que pasa por (1,2), con su tangente. En el segundo, la sección de la superficie a la '
      + 'altura cuatro, que es la circunferencia de radio raíz de dos, y su tangente en (1,−1). '
      + 'En el tercero, el nivel cero del logaritmo, que es la recta dos x más y igual a uno: '
      + 'ella misma es su tangente. En el cuarto, el nivel cinco del paraboloide elíptico, una '
      + 'elipse, con su tangente en (−4,3).',
    columnas: 2, ancho: 205, alto: 170,
    celdas: [
      {
        etiqueta: '(a) z = (x−y)²+2y−2 · P(1,2)',
        x: [-1.6, 3.6], y: [-0.6, 4.2], cuadrado: false,
        dibuja: (l) => {
          /* (x−y)² + 2y − 2 = 3  ⟹  x = y ± √(5−2y). */
          const rama = (s) => (y) => [y + s * Math.sqrt(Math.max(0, 5 - 2 * y)), y];
          for (const s of [1, -1]) l.curva(rama(s), [0.3, 2.5], { clase: 'c', n: 50 });
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 3], marcasY: [1, 2, 4] });
          /* La tangente: ∇f = (−2,4), así que la curva va en la dirección (4,2). */
          l.curva((t) => [1 + 4 * t, 2 + 2 * t], [-0.45, 0.45], { clase: 'c2', n: 2 });
          l.punto(1, 2, { clase: 'o', r: 4 });
        },
      },
      {
        etiqueta: '(b) z = 4 · P(1,−1)',
        x: [-2.2, 2.2], y: [-2.2, 2.2], cuadrado: true,
        dibuja: (l) => {
          l.poli(aro(0, 0, Math.SQRT2), { clase: 'c' });
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1], marcasY: [-1] });
          l.curva((t) => [1 + t, -1 + t], [-1.1, 1.1], { clase: 'c2', n: 2 });
          l.punto(1, -1, { clase: 'o', r: 4 });
        },
      },
      {
        etiqueta: '(c) z = 0 · P(−1,3)',
        x: [-2.6, 1.6], y: [-0.9, 4.2], cuadrado: false,
        dibuja: (l) => {
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-1, 1], marcasY: [1, 3] });
          l.curva((x) => 1 - 2 * x, [-1.6, 0.5], { clase: 'c' });
          l.punto(-1, 3, { clase: 'o', r: 4 });
          l.rotulo(-1, 3, 'es su tangente', { dx: 6, dy: 14, pequeno: true, color: 'var(--faint)' });
        },
      },
      {
        etiqueta: '(d) z = 5 · P(−4,3)',
        x: [-7, 7], y: [-5.4, 5.4], cuadrado: false,
        dibuja: (l) => {
          l.curva((t) => [Math.sqrt(32) * Math.cos(t), Math.sqrt(18) * Math.sin(t)], [0, 2 * P], { clase: 'c', n: 90 });
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-4, 4], marcasY: [3] });
          /* ∇f = (x/8, 2y/9) = (−0,5 ; 0,667): la tangente va en (2,1,5). */
          l.curva((t) => [-4 + 2 * t, 3 + 1.5 * t], [-1.6, 1.6], { clase: 'c2', n: 2 });
          l.punto(-4, 3, { clase: 'o', r: 4 });
        },
      },
    ],
  });

fig('cuatro-planos-tangentes',
  'Las cuatro curvas de nivel por el punto dado y su tangente: el plano tangente es esa tangente levantada a la altura que toca.',
  () => cuatroNiveles('f-pt6-cuatro-niveles'));

fig('cuatro-aproximaciones-con-la-diferencial',
  'Los mismos cuatro puntos del ejercicio anterior: aproximar es quedarse con la tangente en vez de la curva.',
  () => reetiqueta(cuatroNiveles('f-pt6-cuatro-niveles'), 'f-pt6-cuatro-niveles', 'f-pt6-cuatro-aprox'));

/* ── 10 · la direccional hacia un punto lejano ───────────────────────── */
fig('la-direccional-hacia-un-punto-lejano',
  'Lo que cuenta de Q es la dirección, no la distancia: el vector PQ se normaliza y la lejanía desaparece de la cuenta.',
  () => {
    const l = lienzo({
      id: 'f-pt6-lejano',
      ancho: 330, alto: 240,
      x: [-0.4, 5], y: [-3, 2.6], cuadrado: true,
      titulo: 'El punto P, el punto Q lejano y el vector unitario que de verdad se usa',
      desc: 'El punto P está en (1 ; 1,57) y el punto Q, mucho más lejos, en (4 ; −2,43). El '
        + 'vector que los une mide cinco, y lo que entra en la derivada direccional es el vector '
        + 'unitario en esa misma dirección: la flecha corta dibujada sobre la larga. El gradiente '
        + 'en P vale (0,−2) y apunta hacia abajo.',
    });
    const Pt = [1, P / 2];
    const Q = [4, P / 2 - 4];
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 4], marcasY: [[P / 2, 'π/2']] });
    l.poli([Pt, Q], { clase: 'g' });
    l.punto(...Pt, { clase: 'o', r: 4.6 });
    l.punto(...Q, { r: 4.2 });
    l.flecha(Pt, [Pt[0] + 0.6, Pt[1] - 0.8], { clase: 'c2', color: 'var(--alt)' });
    flechaDesde(l, Pt, [0, -2], 0.6, '∇f = (0,−2)', { color: 'var(--d1)', clase: 'c', anclaje: 'end', dx: -6 });
    l.rotulo(...Pt, 'P', { dx: -8, dy: -4, anclaje: 'end', color: 'var(--flag)' });
    l.rotulo(...Q, 'Q', { dx: 7, dy: 4 });
    l.rotulo(Pt[0] + 0.6, Pt[1] - 0.8, 'u unitario', { dx: 6, dy: 4, color: 'var(--alt)' });
    return l.svg();
  });

/* ── 11 · mayor o menor sin conocer la función ───────────────────────── */
fig('mayor-o-menor-sin-conocer-la-funcion',
  'El gradiente y el desplazamiento forman ángulo agudo —su producto escalar vale 2, positivo—, así que la función sube.',
  () => {
    const l = lienzo({
      id: 'f-pt6-mayor-menor',
      ancho: 320, alto: 240,
      x: [-1.4, 3.6], y: [-2.6, 2.4], cuadrado: true,
      titulo: 'El gradiente (3,−5) y el desplazamiento (4,2), que forman ángulo agudo',
      desc: 'Desde el punto (1,1) salen dos flechas. La del gradiente, (3,−5), apunta abajo a la '
        + 'derecha; la del desplazamiento, (4,2), arriba a la derecha. El ángulo que forman es '
        + 'menor de noventa grados, así que su producto escalar es positivo —vale dos— y la '
        + 'función crece al moverse en esa dirección.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 3], marcasY: [1, -2] });
    l.punto(1, 1, { clase: 'o', r: 4.6 });
    flechaDesde(l, [1, 1], [3, -5], 0.4, '∇F = (3,−5)', { color: 'var(--d1)', clase: 'c', dy: 14 });
    flechaDesde(l, [1, 1], [4, 2], 0.4, 'v = (4,2)', { color: 'var(--alt)', clase: 'c2' });
    l.rotulo(1, 1, '(1,1)', { dx: -8, dy: -4, anclaje: 'end', color: 'var(--flag)' });
    l.esquina(14, 18, '∇F · v = 2 > 0 → sube');
    return l.svg();
  });

/* ── 12 · los dos parámetros que fija el gradiente ───────────────────── */
fig('los-dos-parametros-que-fija-el-gradiente',
  'El gradiente en el origen es (a,b). Que sea paralelo a la recta fija su dirección; que la direccional en OX valga 2 fija su tamaño.',
  () => {
    const l = lienzo({
      id: 'f-pt6-dos-parametros',
      ancho: 320, alto: 245,
      x: [-1.4, 3.6], y: [-1.4, 4.6], cuadrado: true,
      titulo: 'El gradiente (2,4) en el origen, paralelo a la recta 2x − y = 1',
      desc: 'La recta dos x menos y igual a uno, dibujada a trazos, pasa por (0,5 ; 0) y tiene '
        + 'pendiente dos. El gradiente en el origen tiene que ser paralelo a ella, así que sus dos '
        + 'componentes están en proporción uno a dos. La condición de que la derivada direccional '
        + 'en el sentido positivo del eje x valga dos fija la primera componente, y el gradiente '
        + 'resulta ser (2,4).',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2, 3], marcasY: [2, 4] });
    l.curva((x) => 2 * x - 1, [-0.2, 2.7], { clase: 'cp2' });
    l.punto(0, 0, { clase: 'o', r: 4.6 });
    flechaDesde(l, [0, 0], [2, 4], 0.95, '∇f = (2,4)', { color: 'var(--d1)', clase: 'c', anclaje: 'end', dx: -6 });
    l.rotulo(2.2, 3.4, '2x − y = 1', { dx: 6, dy: 8, color: 'var(--alt)' });
    l.rotulo(0, 0, 'A(0,0)', { dx: 7, dy: 14, color: 'var(--flag)' });
    return l.svg();
  });

/* ── 13 · la velocidad que sale del plano tangente ───────────────────── */
fig('la-velocidad-que-sale-del-plano-tangente',
  'Del plano tangente salen las dos parciales: ∇f = (−½, −¾). Forma ángulo obtuso con PQ, así que f baja.',
  () => {
    const l = lienzo({
      id: 'f-pt6-velocidad-plano',
      ancho: 320, alto: 245,
      x: [-0.6, 4.6], y: [-0.5, 5], cuadrado: true,
      titulo: 'El gradiente deducido del plano tangente y la dirección de P a Q',
      desc: 'Desde el punto P, en (1,2), sale la flecha del gradiente, que vale menos un medio y '
        + 'menos tres cuartos y apunta abajo a la izquierda. La otra flecha va hacia Q, en (3,4), '
        + 'arriba a la derecha. El ángulo entre las dos es mayor de noventa grados, así que la '
        + 'función disminuye: la velocidad de cambio sale negativa, unos menos cero coma ochenta '
        + 'y ocho.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 3], marcasY: [2, 4] });
    l.punto(1, 2, { clase: 'o', r: 4.6 });
    l.punto(3, 4, { r: 4.2 });
    flechaDesde(l, [1, 2], [-0.5, -0.75], 1.6, '∇f = (−½,−¾)', { color: 'var(--d1)', clase: 'c', dx: 6, dy: 14 });
    l.flecha([1, 2], [3, 4], { clase: 'c2', color: 'var(--alt)' });
    l.rotulo(3, 4, 'Q(3,4)', { dx: -7, dy: -6, anclaje: 'end', color: 'var(--alt)' });
    l.rotulo(1, 2, 'P(1,2)', { dx: 7, dy: -5, color: 'var(--flag)' });
    l.esquina(14, 18, 'ángulo obtuso → baja');
    return l.svg();
  });

/* ── a pegar ─────────────────────────────────────────────────────────── */
for (const f of figuras) f.svg = f.hacer();

if (process.argv[1]?.endsWith('calculo-practica-t06.mjs')) {
  for (const f of figuras) pegaEnCampo(f.fichero, f.id, f.campo, f.svg, f.pie);
  console.log(`${figuras.length} figuras de práctica pegadas en ${FICHERO}`);
}
