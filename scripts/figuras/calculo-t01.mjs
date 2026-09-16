/**
 * Las figuras del tema 1 de Cálculo: el plano complejo.
 *
 * Veinticinco pasos `dibujar` que pedían un dibujo y no enseñaban ninguno. La
 * consigna dice qué hay que dibujar y el bloque `comprueba` dice qué tiene que
 * salir; estas figuras son exactamente eso, calculado.
 *
 *     node scripts/figuras/calculo-t01.mjs
 */

import { lienzo, mosaico } from './lienzo.mjs';
import { pega } from './pegar.mjs';

const FICHERO = 'src/content/calculo/t01-complejos/ejercicios.yaml';
const g = (grados) => (grados * Math.PI) / 180;
const pol = (r, a) => [r * Math.cos(a), r * Math.sin(a)];

/** Una circunferencia como lista de vértices, para usarla de hueco. */
const aro = (cx, cy, r, n = 120) =>
  Array.from({ length: n + 1 }, (_, k) => {
    const t = (2 * Math.PI * k) / n;
    return [cx + r * Math.cos(t), cy + r * Math.sin(t)];
  });

/** Una elipse centrada, con semiejes a (horizontal) y b (vertical). */
const oval = (cx, cy, a, b, n = 140) =>
  Array.from({ length: n + 1 }, (_, k) => {
    const t = (2 * Math.PI * k) / n;
    return [cx + a * Math.cos(t), cy + b * Math.sin(t)];
  });

export const figuras = [];
const fig = (id, paso, hacer) => figuras.push({ id, paso, hacer });

/* ── 1 · un disco, y decidir si el borde entra ───────────────────────── */
fig('ej-disco-y-borde', 0, () => {
  const l = lienzo({
    id: 'f-disco-borde',
    x: [-3.2, 5.2], y: [-1.8, 5.8], cuadrado: true,
    titulo: 'El disco de centro 1+2i y radio 3',
    desc: 'Un disco relleno centrado en el punto (1,2), con el borde en trazo continuo porque '
      + 'la desigualdad no es estricta. Llega de x igual a menos dos hasta x igual a cuatro, y de '
      + 'y igual a menos uno hasta y igual a cinco. El origen queda dentro.',
  });
  l.ejes({ marcasX: [-2, 2, 4], marcasY: [-1, 2, 5] });
  l.disco(1, 2, 3);
  l.circunferencia(1, 2, 3);
  l.poli([[1, 2], [4, 2]], { clase: 'g' });
  l.punto(1, 2, { clase: 'o', r: 4.4 });
  l.punto(0, 0, { r: 3 });
  l.rotulo(2.5, 2, '3', { anclaje: 'middle', dy: -6, color: 'var(--faint)', pequeno: true });
  l.rotulo(1, 2, '1+2i', { dx: 7, dy: -7, color: 'var(--flag)' });
  l.rotulo(0, 0, '0', { dx: -5, dy: 13, color: 'var(--live)' });
  l.esquina(30, 24, '|z − (1+2i)| ≤ 3');
  return l.svg();
});

/* ── 2 · la mediatriz ────────────────────────────────────────────────── */
fig('ej-mediatriz-simple', 0, () => {
  const l = lienzo({
    id: 'f-mediatriz',
    x: [-3.5, 6], y: [-1.5, 5.5], cuadrado: true,
    titulo: 'La mediatriz del segmento que une 2 con 4i',
    desc: 'Los puntos 2 y 4i marcados, el segmento entre ellos a trazos y su punto medio en (1,2). '
      + 'Por ese punto medio pasa una recta perpendicular al segmento, de pendiente un medio: la '
      + 'mediatriz, que es el lugar pedido.',
  });
  l.ejes({ marcasX: [], marcasY: [] });
  l.poli([[2, 0], [0, 4]], { clase: 'g' });
  l.curva((x) => 2 + (x - 1) / 2, [-3.4, 5.9]);
  l.punto(2, 0, { clase: 'o' });
  l.punto(0, 4, { clase: 'o' });
  l.punto(1, 2, { r: 4.4 });
  l.rotulo(2, 0, 'z₁ = 2', { dx: 6, dy: 15, color: 'var(--flag)' });
  l.rotulo(0, 4, 'z₂ = 4i', { dx: -8, dy: -6, anclaje: 'end', color: 'var(--flag)' });
  l.rotulo(1, 2, 'M(1,2)', { dx: -8, dy: -8, anclaje: 'end' });
  l.esquina(310, 90, 'x − 2y + 3 = 0', { anclaje: 'end', color: 'var(--d1)' });
  return l.svg();
});

/* ── 3 · suma de dos potencias décimas ───────────────────────────────── */
fig('suma-conjugados', 0, () => {
  const l = lienzo({
    id: 'f-suma-conj',
    x: [-1.6, 1.6], y: [-1.6, 1.6], cuadrado: true,
    titulo: 'Las dos bases a 45 grados, sus potencias en i y en menos i, y la suma en el origen',
    desc: 'La circunferencia unidad con cuatro puntos marcados: las dos bases a más y menos '
      + 'cuarenta y cinco grados, y las dos potencias décimas en i y en menos i, arriba y abajo. '
      + 'La suma cae en el origen, señalada con otro color, porque las dos potencias son opuestas.',
  });
  l.ejes({ marcasX: [-1, 1], marcasY: [] });
  l.circunferencia(0, 0, 1, { clase: 'g' });
  l.poli([[0, 1], [0, -1]], { clase: 'cp' });
  for (const a of [45, -45]) l.punto(...pol(1, g(a)), { clase: 'pt' });
  for (const [x, y] of [[0, 1], [0, -1]]) l.punto(x, y, { clase: 'pt', r: 5 });
  l.punto(0, 0, { clase: 'o', r: 5 });
  l.rotulo(...pol(1, g(45)), '(1+i)/√2', { dx: 6, dy: -6 });
  l.rotulo(...pol(1, g(-45)), '(1−i)/√2', { dx: 6, dy: 14 });
  l.rotulo(0, 1, 'i', { dx: -8, dy: -6, anclaje: 'end' });
  l.rotulo(0, -1, '−i', { dx: -8, dy: 14, anclaje: 'end' });
  l.rotulo(0, 0, 'suma = 0', { dx: -10, dy: -7, anclaje: 'end', color: 'var(--flag)' });
  return l.svg();
});

/* ── 4 · la cúbica con cociente ──────────────────────────────────────── */
fig('ecuacion-cubica-cociente', 0, () => {
  const R = Math.pow(2, -1 / 6);
  const l = lienzo({
    id: 'f-cubica-coc',
    x: [-1.5, 1.5], y: [-1.5, 1.5], cuadrado: true,
    titulo: 'Las tres raíces cúbicas, sobre una circunferencia algo menor que la unidad',
    desc: 'Tres puntos repartidos cada ciento veinte grados sobre una circunferencia de radio '
      + 'cero coma ocho nueve, dibujada dentro de la circunferencia unidad de referencia. El '
      + 'primero está a treinta y cinco grados. Los tres forman un triángulo equilátero.',
  });
  l.ejes({ marcasX: [1] });
  l.circunferencia(0, 0, 1, { clase: 'g' });
  l.circunferencia(0, 0, R, { clase: 'cp' });
  const vs = [35, 155, 275].map((a) => pol(R, g(a)));
  l.poli(vs, { clase: 'c', cerrar: true });
  for (const v of vs) l.punto(...v, { r: 4.4 });
  l.poli([[0, 0], vs[0]], { clase: 'g' });
  l.rotulo(...pol(0.55, g(17)), '35°', { color: 'var(--faint)', pequeno: true });
  l.rotulo(...vs[0], 'z₀', { dx: 7, dy: 14 });
  l.rotulo(...vs[1], 'z₁', { dx: -8, dy: -6, anclaje: 'end' });
  l.rotulo(...vs[2], 'z₂', { dx: 0, dy: 16, anclaje: 'middle' });
  l.esquina(28, 24, 'r = 2^(−1/6) ≈ 0,891');
  return l.svg();
});

/* ── 5 · las raíces cuartas de −16 ───────────────────────────────────── */
fig('ecuacion-cuarta-menos-dieciseis', 0, () => {
  const l = lienzo({
    id: 'f-cuarta-16',
    x: [-2.7, 2.7], y: [-2.7, 2.7], cuadrado: true,
    titulo: 'Las cuatro raíces cuartas de menos dieciséis, en los vértices de un cuadrado',
    desc: 'Una circunferencia de radio dos con cuatro puntos a cuarenta y cinco, ciento treinta y '
      + 'cinco, doscientos veinticinco y trescientos quince grados: uno en cada cuadrante y '
      + 'ninguno sobre los ejes. Unidos forman un cuadrado inclinado.',
  });
  l.ejes({ marcasX: [-2, 2], marcasY: [-2, 2] });
  l.circunferencia(0, 0, 2, { clase: 'g' });
  const vs = [45, 135, 225, 315].map((a) => pol(2, g(a)));
  l.poli(vs, { clase: 'c', cerrar: true });
  for (const v of vs) l.punto(...v, { r: 4.4 });
  l.rotulo(...vs[0], '√2+√2i', { dx: 7, dy: -6 });
  l.rotulo(...vs[2], '−√2−√2i', { dx: -7, dy: 15, anclaje: 'end' });
  l.esquina(28, 24, 'z⁴ = −16');
  return l.svg();
});

/* ── 6 · z² = conjugado ──────────────────────────────────────────────── */
fig('ecuacion-cuadrado-conjugado', 0, () => {
  const l = lienzo({
    id: 'f-cuad-conj',
    x: [-1.6, 1.6], y: [-1.6, 1.6], cuadrado: true,
    titulo: 'Las cuatro soluciones de z al cuadrado igual al conjugado',
    desc: 'La circunferencia unidad con tres puntos a cero, ciento veinte y doscientos cuarenta '
      + 'grados, que forman un triángulo equilátero con un vértice en el uno. Y un cuarto punto '
      + 'en el origen, marcado igual que los otros tres porque cuenta como solución.',
  });
  l.ejes({ marcasX: [1] });
  l.circunferencia(0, 0, 1, { clase: 'g' });
  const vs = [0, 120, 240].map((a) => pol(1, g(a)));
  l.poli(vs, { clase: 'c', cerrar: true });
  for (const v of vs) l.punto(...v, { r: 4.4 });
  l.punto(0, 0, { r: 4.4 });
  l.rotulo(0, 0, 'z = 0', { dx: -8, dy: -8, anclaje: 'end' });
  l.rotulo(...vs[0], 'z = 1', { dx: 7, dy: -7 });
  l.esquina(28, 24, 'cuatro, no tres');
  return l.svg();
});

/* ── 7 · potencia y conjugado ────────────────────────────────────────── */
fig('ecuacion-cuarta-conjugado', 0, () => {
  const l = lienzo({
    id: 'f-cuarta-conj',
    x: [-1.6, 1.6], y: [-1.6, 1.6], cuadrado: true,
    titulo: 'Las tres soluciones, sobre la circunferencia unidad, a 30, 150 y 270 grados',
    desc: 'La circunferencia unidad con tres puntos: dos arriba, a treinta y a ciento cincuenta '
      + 'grados, y uno abajo del todo, a doscientos setenta. Forman un triángulo equilátero. El '
      + 'origen no está marcado, porque z igual a cero no es solución.',
  });
  l.ejes({ marcasX: [1] });
  l.circunferencia(0, 0, 1, { clase: 'g' });
  const vs = [30, 150, 270].map((a) => pol(1, g(a)));
  l.poli(vs, { clase: 'c', cerrar: true });
  for (const v of vs) l.punto(...v, { r: 4.4 });
  l.rotulo(...vs[0], '30°', { dx: 7, dy: -6 });
  l.rotulo(...vs[1], '150°', { dx: -7, dy: -6, anclaje: 'end' });
  l.rotulo(...vs[2], '270°', { dx: 0, dy: 17, anclaje: 'middle' });
  l.esquina(28, 24, 'z = 0 no entra');
  return l.svg();
});

/* ── 8 · la bicúbica ─────────────────────────────────────────────────── */
fig('ecuacion-bicubica', 0, () => {
  const l = lienzo({
    id: 'f-bicubica',
    x: [-2.7, 2.7], y: [-2.7, 2.7], cuadrado: true,
    titulo: 'Las seis soluciones en dos circunferencias, de radio uno y de radio dos',
    desc: 'Dos circunferencias concéntricas. En la pequeña, de radio uno, tres puntos a cero, '
      + 'ciento veinte y doscientos cuarenta grados. En la grande, de radio dos, otros tres a '
      + 'sesenta, ciento ochenta y trescientos. Los dos triángulos equiláteros están girados '
      + 'sesenta grados uno respecto del otro.',
  });
  l.ejes({ marcasX: [1, 2] });
  l.circunferencia(0, 0, 1, { clase: 'g' });
  l.circunferencia(0, 0, 2, { clase: 'g' });
  const chico = [0, 120, 240].map((a) => pol(1, g(a)));
  const grande = [60, 180, 300].map((a) => pol(2, g(a)));
  l.poli(chico, { clase: 'c', cerrar: true });
  l.poli(grande, { clase: 'c2', cerrar: true });
  for (const v of chico) l.punto(...v, { r: 4 });
  for (const v of grande) l.punto(...v, { clase: 'o', r: 4 });
  l.esquina(28, 24, 'z³ = 1', { color: 'var(--d1)' });
  l.esquina(28, 40, 'z³ = −8', { color: 'var(--alt)' });
  return l.svg();
});

/* ── 9 · el cubo igual a menos el módulo ─────────────────────────────── */
fig('ecuacion-cubo-menos-modulo', 0, () => {
  const l = lienzo({
    id: 'f-cubo-mod',
    x: [-1.6, 1.6], y: [-1.6, 1.6], cuadrado: true,
    titulo: 'El origen y tres puntos a 60, 180 y 300 grados sobre la circunferencia unidad',
    desc: 'La circunferencia unidad con tres soluciones a sesenta, ciento ochenta y trescientos '
      + 'grados, simétricas respecto del eje real, y una cuarta en el origen marcada de otro '
      + 'color.',
  });
  l.ejes({ marcasX: [-1, 1] });
  l.circunferencia(0, 0, 1, { clase: 'g' });
  const vs = [60, 180, 300].map((a) => pol(1, g(a)));
  l.poli(vs, { clase: 'c', cerrar: true });
  for (const v of vs) l.punto(...v, { r: 4.4 });
  l.punto(0, 0, { clase: 'o', r: 4.4 });
  l.rotulo(0, 0, 'z = 0', { dx: 8, dy: -7, color: 'var(--flag)' });
  l.esquina(28, 24, 'simétricas en Re');
  return l.svg();
});

/* ── 10 · el logaritmo disfrazado ────────────────────────────────────── */
fig('logaritmo-complejo', 0, () => {
  const P = Math.PI;
  const l = lienzo({
    id: 'f-log-complejo',
    ancho: 340, alto: 170,
    x: [-14, 20], y: [-3, 3],
    titulo: 'Una fila de puntos sobre el eje real, separados cuatro pi',
    desc: 'Todos los valores caen sobre el eje real. El primero está en pi, algo más de tres, y '
      + 'los siguientes aparecen cada cuatro pi, unos doce coma cinco siete, en los dos sentidos. '
      + 'Sendos puntos suspensivos a izquierda y derecha recuerdan que la lista no acaba.',
  });
  l.ejes({ marcasX: [[P, 'π'], [P + 4 * P, '5π'], [P - 4 * P, '−3π']], marcasY: [] });
  for (const k of [-1, 0, 1]) l.punto(P + 4 * P * k, 0, { r: 4.4 });
  l.poli([[P - 4 * P, 0], [P + 4 * P, 0]], { clase: 'g' });
  l.rotulo(P + 2 * P, 0, '4π', { anclaje: 'middle', dy: -8, color: 'var(--faint)', pequeno: true });
  l.rotulo(-13, 0, '…', { dy: -7, color: 'var(--live)' });
  l.rotulo(18.5, 0, '…', { dy: -7, anclaje: 'end', color: 'var(--live)' });
  l.esquina(28, 22, 'todas reales');
  return l.svg();
});

/* ── 11 · la exponencial ─────────────────────────────────────────────── */
fig('ecuacion-exponencial', 0, () => {
  const h = -Math.log(2) / 2;
  const x0 = Math.PI / 4;
  const l = lienzo({
    id: 'f-exponencial',
    ancho: 340, alto: 185,
    x: [-8, 11], y: [-2.4, 1.6],
    titulo: 'Una fila horizontal de puntos por debajo del eje real, separados dos pi',
    desc: 'Tres puntos a la misma altura, y igual a menos cero coma tres cinco, por debajo del '
      + 'eje real. El de en medio está en pi cuartos, a la derecha del eje imaginario, y los '
      + 'otros dos a dos pi de distancia a cada lado. Una recta a trazos marca la altura común.',
  });
  l.ejes({ marcasX: [[x0, 'π/4']], marcasY: [] });
  l.poli([[-7.8, h], [10.8, h]], { clase: 'g' });
  for (const k of [-1, 0, 1]) l.punto(x0 + 2 * Math.PI * k, h, { r: 4.4 });
  l.rotulo(x0 + Math.PI, h, '2π', { anclaje: 'middle', dy: -8, color: 'var(--faint)', pequeno: true });
  l.rotulo(-7.6, h, 'y = −ln2 / 2 ≈ −0,347', { dy: 15 });
  return l.svg();
});

/* ── 12 · el recinto cuadrado ────────────────────────────────────────── */
fig('recinto-cuadrado', 0, () => {
  const A = [0, 2];
  const B = [2, 1];
  /* El lado es B−A = (2,−1). Girarlo por i da (1,2); por −i, (−1,−2). */
  const bueno = [A, B, [B[0] + 1, B[1] + 2], [A[0] + 1, A[1] + 2]];
  const otro = [A, B, [B[0] - 1, B[1] - 2], [A[0] - 1, A[1] - 2]];
  const l = lienzo({
    id: 'f-recinto',
    x: [-2, 4.5], y: [-1.5, 4.8], cuadrado: true,
    titulo: 'Los dos cuadrados posibles sobre el lado dado, y el que contiene al afijo',
    desc: 'Los vértices 2i y 2+i unidos por un lado. A cada lado de ese segmento se levanta un '
      + 'cuadrado: uno hacia arriba a la derecha, con vértices en 3+3i y 1+4i, y otro hacia abajo '
      + 'a la izquierda. El afijo 2+2i queda dentro del primero, que aparece sombreado.',
  });
  l.ejes({ marcasX: [2], marcasY: [2, 4] });
  l.poli(bueno, { clase: 'f', cerrar: true });
  l.poli(otro, { clase: 'cp2', cerrar: true });
  l.poli(bueno, { clase: 'c', cerrar: true });
  for (const v of bueno) l.punto(...v, { r: 4 });
  l.punto(2, 2, { clase: 'o', r: 4.4 });
  l.rotulo(0, 2, '2i', { dx: -7, dy: -6, anclaje: 'end' });
  l.rotulo(2, 1, '2+i', { dx: 7, dy: 14 });
  l.rotulo(3, 3, '3+3i', { dx: 7, dy: 0 });
  l.rotulo(1, 4, '1+4i', { dx: -7, dy: -6, anclaje: 'end' });
  l.rotulo(2, 2, '2+2i', { dx: 8, dy: -6, color: 'var(--flag)' });
  return l.svg();
});

/* ── 13 · cociente de módulos ────────────────────────────────────────── */
fig('lugar-cociente-modulos', 0, () => {
  const R = Math.sqrt(3) / 2;
  const l = lienzo({
    id: 'f-coc-modulos',
    x: [-1.2, 3.2], y: [-0.6, 2.6], cuadrado: true,
    titulo: 'El exterior de la circunferencia de Apolonio de centro un medio y uno',
    desc: 'Una circunferencia de centro en el punto (0,5 ; 1) y radio cero coma ocho siete, '
      + 'dibujada a trazos porque la desigualdad es estricta. Lo sombreado es todo lo de fuera, '
      + 'no lo de dentro. Los dos puntos del cociente, 2+i y 1+i, quedan los dos dentro del '
      + 'círculo excluido.',
  });
  l.exteriorDe([aro(0.5, 1, R)]);
  l.ejes({ marcasX: [1, 2], marcasY: [1, 2] });
  l.poli(aro(0.5, 1, R), { clase: 'cp' });
  l.punto(2, 1, { clase: 'o' });
  l.punto(1, 1, { clase: 'o' });
  l.punto(0.5, 1, { r: 3 });
  l.rotulo(2, 1, '2+i', { dx: 7, dy: -6, color: 'var(--flag)' });
  l.rotulo(1, 1, '1+i', { dx: 2, dy: 16, color: 'var(--flag)' });
  l.rotulo(0.5, 1, 'C(½,1)', { dx: -7, dy: -7, anclaje: 'end' });
  l.esquina(28, 24, 'se sombrea FUERA');
  return l.svg();
});

/* ── 14 · dos condiciones de módulo: la luna ─────────────────────────── */
fig('lugar-dos-condiciones-modulo', 0, () => {
  const l = lienzo({
    id: 'f-dos-modulos',
    x: [-1.4, 1.4], y: [-1.3, 1.5], cuadrado: true,
    titulo: 'La luna entre la circunferencia unidad y la circunferencia pequeña tangente',
    desc: 'La circunferencia unidad y, dentro, otra de centro (0 ; 0,5) y radio un medio, '
      + 'tangente al eje real en el origen y que pasa por i. Se sombrea lo que está dentro de la '
      + 'grande y fuera de la pequeña: una luna. El origen se marca con círculo hueco porque '
      + 'queda excluido.',
  });
  l.crudo(
    `<path class="f-dos-modulos-f" fill-rule="evenodd" d="` +
      `${aro(0, 0, 1).map(([u, v], i) => `${i ? 'L' : 'M'}${Math.round(l.X(u) * 10) / 10} ${Math.round(l.Y(v) * 10) / 10}`).join('')}Z` +
      `${aro(0, 0.5, 0.5).map(([u, v], i) => `${i ? 'L' : 'M'}${Math.round(l.X(u) * 10) / 10} ${Math.round(l.Y(v) * 10) / 10}`).join('')}Z"/>`,
  );
  l.ejes({ marcasX: [-1, 1], marcasY: [1] });
  l.poli(aro(0, 0, 1), { clase: 'c' });
  l.poli(aro(0, 0.5, 0.5), { clase: 'c2' });
  l.punto(0, 1, { r: 4 });
  l.crudo(`<circle class="f-dos-modulos-hueco" cx="${Math.round(l.X(0) * 10) / 10}" cy="${Math.round(l.Y(0) * 10) / 10}" r="4"/>`);
  l.rotulo(0, 1, 'i', { dx: 8, dy: -4 });
  l.rotulo(0, 0, 'z = 0 fuera', { dx: 9, dy: 14, color: 'var(--flag)' });
  l.esquina(28, 24, 'tangentes en i');
  return l.svg();
});

/* ── 15 · la elipse recortada por el sector ──────────────────────────── */
fig('lugar-elipse-sector', 0, () => {
  const a = 3;
  const b = 5;
  const l = lienzo({
    id: 'f-elipse-sector',
    x: [-5.6, 5.6], y: [-5.6, 5.6], cuadrado: true,
    titulo: 'La cuña entre 30 y 60 grados recortada dentro de la elipse',
    desc: 'Una elipse de semiejes tres en horizontal y cinco en vertical, a trazos, con los focos '
      + 'en más y menos cuatro i marcados. Dos semirrectas salen del origen hacia el primer '
      + 'cuadrante, a treinta y a sesenta grados, y el trozo de elipse entre ellas aparece '
      + 'sombreado como una cuña con la punta en el origen.',
  });
  /* El radio de la elipse en cada dirección, para cerrar la cuña por el borde. */
  const rElipse = (t) => 1 / Math.hypot(Math.cos(t) / a, Math.sin(t) / b);
  const cuna = [[0, 0]];
  for (let k = 0; k <= 40; k++) {
    const t = g(30) + ((g(60) - g(30)) * k) / 40;
    cuna.push(pol(rElipse(t), t));
  }
  l.poli(cuna, { clase: 'f', cerrar: true });
  l.ejes({ marcasX: [-5, 5], marcasY: [] });
  l.poli(oval(0, 0, a, b), { clase: 'cp' });
  for (const t of [g(30), g(60)]) l.poli([[0, 0], pol(rElipse(t), t)], { clase: 'c2' });
  l.punto(0, 4, { clase: 'o' });
  l.punto(0, -4, { clase: 'o' });
  l.rotulo(0, 4, '4i', { dx: -7, dy: -5, anclaje: 'end', color: 'var(--flag)' });
  l.rotulo(0, -4, '−4i', { dx: -7, dy: 13, anclaje: 'end', color: 'var(--flag)' });
  l.rotulo(...pol(3.1, g(22)), '30°', { color: 'var(--alt)' });
  l.rotulo(...pol(3.4, g(68)), '60°', { color: 'var(--alt)' });
  l.esquina(28, 24, 'semiejes 3 y 5');
  return l.svg();
});

/* ── 16 · la lente de los dos discos ─────────────────────────────────── */
fig('lugar-inverso-desplazado', 0, () => {
  const l = lienzo({
    id: 'f-inverso-lente',
    x: [-0.4, 3.4], y: [-2.4, 1.4], cuadrado: true,
    titulo: 'La lente donde se solapan los dos discos de radio uno',
    desc: 'Dos circunferencias de radio uno, una centrada en (2,0) y otra en (1,−1), dibujadas a '
      + 'trazos. Se cortan en z igual a uno y en 2−i, los dos con círculo hueco porque no '
      + 'pertenecen. La lente donde se solapan aparece sombreada.',
  });
  /* La lente: el arco de un disco desde un corte al otro, y la vuelta por el otro. */
  const ang = (cx, cy, [px, py]) => Math.atan2(py - cy, px - cx);
  const c1 = [2, 0];
  const c2 = [1, -1];
  const A = [1, 0];
  const B = [2, -1];
  const arco = (c, p0, p1, sentido) => {
    const t0 = ang(c[0], c[1], p0);
    let t1 = ang(c[0], c[1], p1);
    if (sentido > 0) while (t1 < t0) t1 += 2 * Math.PI;
    else while (t1 > t0) t1 -= 2 * Math.PI;
    return Array.from({ length: 41 }, (_, k) => pol(1, t0 + ((t1 - t0) * k) / 40))
      .map(([u, v]) => [c[0] + u, c[1] + v]);
  };
  l.poli([...arco(c1, A, B, 1), ...arco(c2, B, A, 1)], { clase: 'f', cerrar: true });
  l.ejes({ marcasX: [1, 2, 3], marcasY: [-1, -2] });
  l.poli(aro(...c1, 1), { clase: 'cp' });
  l.poli(aro(...c2, 1), { clase: 'cp2' });
  l.poli([[0.4, 0.6], [2.6, -1.6]], { clase: 'g' });
  for (const [px, py] of [A, B]) {
    l.crudo(`<circle class="f-inverso-lente-hueco" cx="${Math.round(l.X(px) * 10) / 10}" cy="${Math.round(l.Y(py) * 10) / 10}" r="4.2"/>`);
  }
  l.rotulo(...A, 'z = 1', { dx: -7, dy: -7, anclaje: 'end' });
  l.rotulo(...B, '2 − i', { dx: 8, dy: 13 });
  l.rotulo(2.55, -1.55, 'x + y = 1', { dy: 14, anclaje: 'end', color: 'var(--faint)', pequeno: true });
  return l.svg();
});

/* ── 17 · el arco capaz del cociente ─────────────────────────────────── */
fig('lugar-argumento-cociente', 0, () => {
  const l = lienzo({
    id: 'f-arg-cociente',
    x: [-0.2, 2.8], y: [-0.85, 1.15], cuadrado: true,
    titulo: 'La semicircunferencia superior de diámetro el segmento de 1 a 2',
    desc: 'Una circunferencia de centro uno coma cinco y radio un medio, dibujada entera a '
      + 'trazos. Solo la mitad de arriba va en trazo grueso: es la que cumple la condición. Los '
      + 'extremos, z igual a uno y z igual a dos, llevan círculo hueco porque no entran.',
  });
  l.ejes({ marcasX: [1, 2], marcasY: [] });
  l.poli(aro(1.5, 0, 0.5), { clase: 'g' });
  l.curva((t) => pol(0.5, t).map((v, i) => (i ? v : v + 1.5)), [0, Math.PI], { clase: 'c', n: 80 });
  l.poli([[1, 0], [2, 0]], { clase: 'cp2' });
  for (const px of [1, 2]) {
    l.crudo(`<circle class="f-arg-cociente-hueco" cx="${Math.round(l.X(px) * 10) / 10}" cy="${Math.round(l.Y(0) * 10) / 10}" r="4.2"/>`);
  }
  l.punto(1.5, 0.5, { r: 3.6 });
  l.rotulo(1.5, 0.5, '3/2 + i/2', { dx: 7, dy: -6 });
  l.rotulo(1.5, 0, 'diámetro', { dy: 15, anclaje: 'middle', color: 'var(--alt)' });
  l.esquina(28, 22, 'solo la mitad de arriba');
  return l.svg();
});

/* ── 18 · la mediatriz y la parábola ─────────────────────────────────── */
fig('lugar-mediatriz-parabola', 0, () => {
  const par = (x) => 2 - (x * x) / 8;
  const xA = -4 + 2 * Math.sqrt(6);
  const xB = -4 - 2 * Math.sqrt(6);
  const l = lienzo({
    id: 'f-mediatriz-parabola',
    x: [-10.5, 4.5], y: [-11, 4],
    titulo: 'La franja curva entre la bisectriz y la parábola',
    desc: 'La bisectriz y igual a x y la parábola y igual a dos menos x cuadrado partido por '
      + 'ocho, las dos a trazos. Se cortan en x igual a cero coma nueve y en x igual a menos ocho '
      + 'coma nueve. Entre las dos, por encima de la recta y por debajo de la parábola, queda '
      + 'sombreada una franja curva abierta hacia la izquierda.',
  });
  const contorno = [];
  for (let k = 0; k <= 80; k++) {
    const x = xB + ((xA - xB) * k) / 80;
    contorno.push([x, par(x)]);
  }
  for (let k = 0; k <= 80; k++) {
    const x = xA + ((xB - xA) * k) / 80;
    contorno.push([x, x]);
  }
  l.poli(contorno, { clase: 'f', cerrar: true });
  l.ejes({ marcasX: [-8, -4], marcasY: [-8, -4] });
  l.curva((x) => x, [-10.4, 3.9], { clase: 'cp' });
  l.curva(par, [-10.4, 4.4], { clase: 'cp2' });
  l.punto(xA, xA, { r: 4 });
  l.punto(xB, xB, { r: 4 });
  l.rotulo(xA, xA, '≈ (0,90 ; 0,90)', { dx: -10, dy: 24, anclaje: 'end' });
  l.rotulo(xB, xB, '≈ (−8,90 ; −8,90)', { dx: 10, dy: 2 });
  l.rotulo(-3, 2 - 9 / 8, 'y = 2 − x²/8', { dx: 0, dy: -10, anclaje: 'middle', color: 'var(--alt)' });
  l.rotulo(-6, -6, 'y = x', { dx: 12, dy: 4, color: 'var(--d1)' });
  return l.svg();
});

/* ── 19 · las ocho regiones del boletín ──────────────────────────────── */
fig('ocho-regiones-del-boletin', 0, () => {
  const marco = { x: [-2.6, 2.6], y: [-2.6, 2.6] };
  const celdas = [
    {
      etiqueta: '(a) Im z = 3',
      x: [-3.4, 3.4], y: [-0.8, 4],
      dibuja: (l) => { l.ejes({ marcasY: [3] }); l.poli([[-3.3, 3], [3.3, 3]], { clase: 'c' }); },
    },
    {
      etiqueta: '(b) Re z ≥ −1',
      ...marco,
      dibuja: (l) => {
        l.poli([[-1, -2.5], [2.5, -2.5], [2.5, 2.5], [-1, 2.5]], { clase: 'f', cerrar: true });
        l.ejes({ marcasX: [-1] });
        l.poli([[-1, -2.5], [-1, 2.5]], { clase: 'c' });
      },
    },
    {
      etiqueta: '(c) |z| = 1',
      ...marco,
      dibuja: (l) => { l.ejes({ marcasX: [1] }); l.poli(aro(0, 0, 1), { clase: 'c' }); },
    },
    {
      etiqueta: '(d) |z+i| ≤ 1',
      ...marco,
      dibuja: (l) => {
        l.poli(aro(0, -1, 1), { clase: 'f', cerrar: true });
        l.ejes({ marcasY: [-1] });
        l.poli(aro(0, -1, 1), { clase: 'c' });
        l.punto(0, -1, { r: 3 });
      },
    },
    {
      etiqueta: '(e) |z| ≥ |z−i|',
      ...marco,
      dibuja: (l) => {
        l.poli([[-2.5, 0.5], [2.5, 0.5], [2.5, 2.5], [-2.5, 2.5]], { clase: 'f', cerrar: true });
        l.ejes({ marcasY: [[0.5, '½']] });
        l.poli([[-2.5, 0.5], [2.5, 0.5]], { clase: 'c' });
      },
    },
    {
      etiqueta: '(f) |(z−1)/(z−i)| > 2',
      x: [-1.8, 1.4], y: [-0.4, 2.6],
      dibuja: (l) => {
        l.poli(aro(-1 / 3, 4 / 3, Math.sqrt(2) * 2 / 3), { clase: 'f', cerrar: true });
        l.ejes({ marcasX: [1], marcasY: [1] });
        l.poli(aro(-1 / 3, 4 / 3, Math.sqrt(2) * 2 / 3), { clase: 'cp' });
        l.punto(-1 / 3, 4 / 3, { r: 3 });
      },
    },
    {
      etiqueta: '(g) |z| + Re z = 2',
      x: [-3.4, 2], y: [-2.7, 2.7],
      dibuja: (l) => {
        l.ejes({ marcasX: [1], marcasY: [2] });
        l.curva((y) => [1 - (y * y) / 4, y], [-2.6, 2.6], { clase: 'c' });
        l.punto(1, 0, { r: 3.4 });
      },
    },
    {
      etiqueta: '(h) elipse, eje mayor vertical',
      x: [-3.4, 3.4], y: [-5.6, 5.6],
      dibuja: (l) => {
        l.ejes({ marcasX: [3], marcasY: [5] });
        l.poli(oval(0, 0, 3, 5), { clase: 'c' });
        l.punto(0, 4, { clase: 'o', r: 3.4 });
        l.punto(0, -4, { clase: 'o', r: 3.4 });
      },
    },
  ];
  return mosaico({
    id: 'f-ocho-regiones',
    titulo: 'Las ocho regiones del boletín, cada una en sus propios ejes',
    desc: 'Ocho dibujos pequeños e independientes, uno por apartado. Una recta horizontal a '
      + 'altura tres; un semiplano a la derecha de x igual a menos uno; la circunferencia unidad; '
      + 'el disco de centro menos i y radio uno; el semiplano por encima de y igual a un medio; '
      + 'el interior de una circunferencia de Apolonio de centro en (−1/3 ; 4/3); una parábola '
      + 'abierta hacia la izquierda con vértice en el uno; y una elipse con el eje mayor '
      + 'vertical y los focos en más y menos cuatro i.',
    columnas: 4,
    celdas,
  });
});

/* ── 20 · las cuatro regiones de argumento ───────────────────────────── */
fig('cuatro-regiones-de-argumento', 0, () => {
  const celdas = [
    {
      etiqueta: '(a) π/2 < arg z < π',
      x: [-2.6, 2.6], y: [-2.6, 2.6],
      dibuja: (l) => {
        l.poli([[0, 0], [-2.5, 0], [-2.5, 2.5], [0, 2.5]], { clase: 'f', cerrar: true });
        l.ejes();
        l.poli([[0, 0], [-2.5, 0]], { clase: 'cp' });
        l.poli([[0, 0], [0, 2.5]], { clase: 'cp' });
      },
    },
    {
      etiqueta: '(b) |arg z| < π/6',
      x: [-2.6, 2.6], y: [-2.6, 2.6],
      dibuja: (l) => {
        l.poli([[0, 0], [2.5, 2.5 / Math.sqrt(3)], [2.5, -2.5 / Math.sqrt(3)]], { clase: 'f', cerrar: true });
        l.ejes();
        l.poli([[0, 0], [2.5, 2.5 / Math.sqrt(3)]], { clase: 'cp' });
        l.poli([[0, 0], [2.5, -2.5 / Math.sqrt(3)]], { clase: 'cp' });
      },
    },
    {
      etiqueta: '(c) semiplano menos el semidisco',
      x: [-2.2, 3], y: [-0.6, 2.6],
      dibuja: (l) => {
        const semi = [[-2.1, 0], [2.9, 0], [2.9, 2.5], [-2.1, 2.5]];
        const tapa = Array.from({ length: 41 }, (_, k) => pol(0.5, (Math.PI * k) / 40))
          .map(([u, v]) => [1.5 + u, v]);
        l.crudo(
          `<path class="f-cuatro-arg-f" fill-rule="evenodd" d="` +
            semi.map(([u, v], i) => `${i ? 'L' : 'M'}${Math.round(l.X(u) * 10) / 10} ${Math.round(l.Y(v) * 10) / 10}`).join('') + 'Z' +
            tapa.map(([u, v], i) => `${i ? 'L' : 'M'}${Math.round(l.X(u) * 10) / 10} ${Math.round(l.Y(v) * 10) / 10}`).join('') + 'Z"/>',
        );
        l.ejes({ marcasX: [1, 2] });
        l.poli(tapa, { clase: 'cp' });
      },
    },
    {
      etiqueta: '(d) circunferencia sin 1 y 3',
      x: [-0.2, 4.2], y: [-1.6, 1.6],
      dibuja: (l) => {
        l.ejes({ marcasX: [1, 2, 3] });
        l.poli(aro(2, 0, 1), { clase: 'c' });
        for (const px of [1, 3]) {
          l.crudo(`<circle class="f-cuatro-arg-hueco" cx="${Math.round(l.X(px) * 10) / 10}" cy="${Math.round(l.Y(0) * 10) / 10}" r="3.6"/>`);
        }
      },
    },
  ];
  return mosaico({
    id: 'f-cuatro-arg',
    titulo: 'Las cuatro regiones de argumento: dos sectores y dos arcos capaces',
    desc: 'Cuatro dibujos independientes. El segundo cuadrante abierto, con los dos ejes a '
      + 'trazos. Un sector de sesenta grados alrededor del semieje real positivo. El semiplano '
      + 'superior al que se le ha quitado el semidisco de diámetro el segmento de uno a dos. Y la '
      + 'circunferencia entera de centro dos y radio uno, sin los puntos uno y tres, marcados con '
      + 'círculo hueco.',
    columnas: 2,
    ancho: 200,
    alto: 165,
    celdas,
  });
});

/* ── 21 · la corona entre dos elipses confocales ─────────────────────── */
fig('entre-dos-elipses-confocales', 0, () => {
  const l = lienzo({
    id: 'f-dos-elipses',
    x: [-6.6, 6.6], y: [-6.6, 6.6], cuadrado: true,
    titulo: 'La corona entre las dos elipses de focos más y menos tres i',
    desc: 'Dos elipses con el mismo par de focos, más y menos tres i, y el eje mayor vertical. '
      + 'La interior, a trazos, corta los ejes en más menos dos coma sesenta y cinco y en más '
      + 'menos cuatro. La exterior, en trazo continuo, en más menos cinco coma veinte y en más '
      + 'menos seis. Entre las dos queda sombreada la corona.',
  });
  const dentro = oval(0, 0, Math.sqrt(7), 4);
  const fuera = oval(0, 0, 3 * Math.sqrt(3), 6);
  const d = (ps) => ps.map(([u, v], i) => `${i ? 'L' : 'M'}${Math.round(l.X(u) * 10) / 10} ${Math.round(l.Y(v) * 10) / 10}`).join('') + 'Z';
  l.crudo(`<path class="f-dos-elipses-f" fill-rule="evenodd" d="${d(fuera)}${d(dentro)}"/>`);
  l.ejes({ marcasX: [[-6, '−6'], 6], marcasY: [] });
  l.poli(dentro, { clase: 'cp' });
  l.poli(fuera, { clase: 'c' });
  l.punto(0, 3, { clase: 'o' });
  l.punto(0, -3, { clase: 'o' });
  l.rotulo(0, 3, '3i', { dx: 7, dy: -5, color: 'var(--flag)' });
  l.rotulo(0, -3, '−3i', { dx: 7, dy: 13, color: 'var(--flag)' });
  l.rotulo(0, 4, '4', { dx: 7, dy: -4, color: 'var(--d1)' });
  l.rotulo(0, 6, '6', { dx: 7, dy: -4, color: 'var(--d1)' });
  l.rotulo(Math.sqrt(7), 0, '√7', { dx: -2, dy: 16, anclaje: 'middle', color: 'var(--d1)' });
  l.rotulo(3 * Math.sqrt(3), 0, '3√3', { dx: 2, dy: 16, anclaje: 'middle', color: 'var(--d1)' });
  return l.svg();
});

/* ── 22 · media elipse cortada por el eje ────────────────────────────── */
fig('media-elipse-cortada-por-el-eje', 0, () => {
  const a = Math.sqrt(8);
  const b = 3;
  const yc = Math.sqrt(9 * (1 - 1 / 8));
  const l = lienzo({
    id: 'f-media-elipse',
    x: [-2.4, 4.4], y: [-3.6, 3.6], cuadrado: true,
    titulo: 'La elipse de centro uno, y el arco con parte real no negativa',
    desc: 'Una elipse centrada en el uno, con el eje mayor vertical de semieje tres y el menor de '
      + 'dos raíz de dos. Se dibuja entera a trazos y, encima, en trazo grueso, el arco que queda '
      + 'a la derecha del eje imaginario, que es bastante más de la mitad. Los dos cortes con ese '
      + 'eje, a altura más y menos dos coma ocho uno, van marcados.',
  });
  l.ejes({ marcasX: [1, 3], marcasY: [3, -3] });
  l.poli(oval(1, 0, a, b), { clase: 'g' });
  const t0 = Math.acos(-1 / a);
  l.curva((t) => [1 + a * Math.cos(t), b * Math.sin(t)], [-t0, t0], { clase: 'c', n: 120 });
  l.punto(1, 1, { clase: 'o', r: 3.6 });
  l.punto(1, -1, { clase: 'o', r: 3.6 });
  l.punto(0, yc, { r: 4 });
  l.punto(0, -yc, { r: 4 });
  l.rotulo(0, yc, '≈ 2,81i', { dx: -7, dy: -6, anclaje: 'end' });
  l.rotulo(0, -yc, '≈ −2,81i', { dx: -7, dy: 14, anclaje: 'end' });
  l.rotulo(1, 1, '1+i', { dx: 7, dy: -5, color: 'var(--flag)' });
  l.rotulo(1, -1, '1−i', { dx: 7, dy: 13, color: 'var(--flag)' });
  l.esquina(28, 22, 'el arco abarca ≈ 222°');
  return l.svg();
});

/* ── 23 · las raíces que después son los focos ───────────────────────── */
fig('las-raices-que-son-los-focos', 0, () => {
  const b = Math.sqrt(9 - 6.25);
  const l = lienzo({
    id: 'f-raices-focos',
    x: [-2.6, 2.6], y: [-2.2, 5.2], cuadrado: true,
    titulo: 'Las dos raíces sobre el eje imaginario, y la elipse que generan',
    desc: 'Las raíces cuatro i y menos i, marcadas sobre el eje imaginario, hacen de focos. La '
      + 'elipse que generan está centrada en un coma cinco i, tiene los vértices del eje mayor en '
      + 'cuatro coma cinco i y en menos uno coma cinco i, y los del menor a más menos uno coma '
      + 'sesenta y seis de altura uno coma cinco. Sale muy estirada porque la suma pedida, seis, '
      + 'apenas supera la distancia entre focos, cinco.',
  });
  l.ejes({ marcasY: [4, -1] });
  l.poli(oval(0, 1.5, b, 3), { clase: 'c' });
  l.punto(0, 4, { clase: 'o', r: 4.4 });
  l.punto(0, -1, { clase: 'o', r: 4.4 });
  l.punto(0, 1.5, { r: 3.6 });
  for (const [px, py] of [[0, 4.5], [0, -1.5], [b, 1.5], [-b, 1.5]]) l.punto(px, py, { r: 3.4 });
  l.rotulo(0, 4, 'z₁ = 4i', { dx: 8, dy: 0, color: 'var(--flag)' });
  l.rotulo(0, -1, 'z₂ = −i', { dx: 8, dy: 0, color: 'var(--flag)' });
  l.rotulo(0, 1.5, 'C = 3i/2', { dx: 8, dy: -5 });
  l.rotulo(b, 1.5, '1,66', { dx: 5, dy: 14, pequeno: true, color: 'var(--faint)' });
  l.esquina(28, 22, '2c = 5 < 6');
  return l.svg();
});

/* ── 24 · la elipse partida por la bisectriz ─────────────────────────── */
fig('la-elipse-partida-por-la-bisectriz', 0, () => {
  const a = Math.sqrt(5.25);
  const b = 2.5;
  const xc = Math.sqrt(1 / (1 / 5.25 + 1 / 6.25));
  const l = lienzo({
    id: 'f-elipse-bisectriz',
    x: [-3, 3], y: [-3, 3], cuadrado: true,
    titulo: 'La mitad de la elipse que queda por encima de la bisectriz',
    desc: 'Una elipse centrada en el origen con el eje mayor vertical de semieje dos coma cinco y '
      + 'el menor de dos coma veintinueve, con los focos en más y menos i. La recta y igual a x '
      + 'la atraviesa por el centro y corta el borde en más menos uno coma sesenta y nueve. Se '
      + 'sombrea la mitad de arriba, la que cumple que la parte imaginaria no es menor que la '
      + 'real.',
  });
  /* La mitad de arriba: el arco de la elipse de un corte al otro, cerrado por
     la cuerda, que es justo el trozo de la recta que queda dentro. */
  const trozo = [];
  const tA = Math.atan2(xc / b, xc / a);
  const tB = tA + Math.PI;
  for (let k = 0; k <= 100; k++) {
    const t = tA + ((tB - tA) * k) / 100;
    trozo.push([a * Math.cos(t), b * Math.sin(t)]);
  }
  l.poli(trozo, { clase: 'f', cerrar: true });
  l.ejes({ marcasX: [2, -2], marcasY: [2, -2] });
  l.poli(oval(0, 0, a, b), { clase: 'c' });
  l.curva((x) => x, [-2.9, 2.9], { clase: 'cp2' });
  l.punto(0, 1, { clase: 'o', r: 3.8 });
  l.punto(0, -1, { clase: 'o', r: 3.8 });
  l.punto(xc, xc, { r: 4 });
  l.punto(-xc, -xc, { r: 4 });
  l.rotulo(xc, xc, '≈ (1,69 ; 1,69)', { dx: 6, dy: -6 });
  l.rotulo(-xc, -xc, '≈ (−1,69 ; −1,69)', { dx: 8, dy: 15 });
  l.rotulo(0, 1, 'i', { dx: 7, dy: -4, color: 'var(--flag)' });
  l.rotulo(0, -1, '−i', { dx: 7, dy: 13, color: 'var(--flag)' });
  return l.svg();
});

/* ── 25 · i elevado a 1+i ────────────────────────────────────────────── */
fig('i-elevado-a-uno-mas-i', 0, () => {
  const h = Math.exp(-Math.PI / 2);
  const l = lienzo({
    id: 'f-i-elevado',
    ancho: 340, alto: 190,
    x: [-1.1, 1.1], y: [-0.45, 0.45], cuadrado: true,
    titulo: 'El valor principal, su conjugado, y el eje real entero como lugar geométrico',
    desc: 'Dos puntos simétricos sobre el eje imaginario, a altura más y menos cero coma dos uno: '
      + 'el valor principal y su conjugado. El lugar de los w es el eje real completo, dibujado '
      + 'en trazo grueso. El conjugado lleva círculo hueco porque queda excluido.',
  });
  l.ejes({ marcasY: [[h, '0,208'], [-h, '−0,208']] });
  l.poli([[-1.05, 0], [1.05, 0]], { clase: 'c' });
  l.punto(0, h, { r: 4.4 });
  l.crudo(`<circle class="f-i-elevado-hueco" cx="${Math.round(l.X(0) * 10) / 10}" cy="${Math.round(l.Y(-h) * 10) / 10}" r="4.4"/>`);
  l.rotulo(0, h, 'z = e^(−π/2) i', { dx: 9, dy: -5 });
  l.rotulo(0, -h, 'z̄ excluido', { dx: 9, dy: 13, color: 'var(--flag)' });
  l.esquina(30, 24, 'el lugar es TODO el eje real');
  return l.svg();
});

/* ── a pegar ─────────────────────────────────────────────────────────── */

/* Primero se dibujan TODAS y después se pegan. Si una revienta a mitad de
   camino, el fichero se queda como estaba en vez de con doce figuras dentro y
   trece fuera, que es un estado del que no se sale mirando el diff. */
for (const f of figuras) f.svg = f.hacer();

/* Importado —por la previsualización— solo dibuja; ejecutado, pega. */
if (process.argv[1]?.endsWith('calculo-t01.mjs')) {
  for (const f of figuras) pega(FICHERO, f.id, f.svg, f.paso);
  console.log(`${figuras.length} figuras pegadas en ${FICHERO}`);
}
