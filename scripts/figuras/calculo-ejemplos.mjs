/**
 * Las figuras de los ejemplos de entrada que hablan de recintos, regiones o
 * sólidos: temas 1, 5, 6, 7 y 11 de Cálculo.
 *
 * Un ejemplo de entrada existe para que se pueda empezar por él sabiendo nada.
 * Si lo primero que dice es «la región limitada por…» y no hay región
 * dibujada, no se empieza: se adivina. Estas figuras van al final de la
 * `resolucion`, porque en varios de ellos la figura **es** la respuesta y
 * enseñarla en el enunciado sería contestar la pregunta.
 *
 *     node scripts/figuras/calculo-ejemplos.mjs
 */

import { lienzo, mosaico } from './lienzo.mjs';
import { pegaEnCampo } from './pegar.mjs';

const T = (tema) => `src/content/calculo/${tema}/ejercicios.yaml`;

export const figuras = [];
const fig = (tema, id, pie, hacer) =>
  figuras.push({ fichero: T(tema), id, campo: 'resolucion', pie, hacer });

const P = Math.PI;
const aro = (cx, cy, r, n = 120) =>
  Array.from({ length: n + 1 }, (_, k) => {
    const t = (2 * P * k) / n;
    return [cx + r * Math.cos(t), cy + r * Math.sin(t)];
  });
const entre = (arriba, abajo, a, b, n = 80) => {
  const p = [];
  for (let k = 0; k <= n; k++) { const x = a + ((b - a) * k) / n; p.push([x, arriba(x)]); }
  for (let k = 0; k <= n; k++) { const x = b + ((a - b) * k) / n; p.push([x, abajo(x)]); }
  return p;
};
const hueco = (l, id, x, y, r = 4.2) =>
  l.crudo(`<circle class="${id}-hueco" cx="${Math.round(l.X(x) * 10) / 10}" cy="${Math.round(l.Y(y) * 10) / 10}" r="${r}"/>`);

/** El molde de los sólidos de revolución: corte y planta. */
const solido = ({ id, titulo, desc, corte, planta }) =>
  mosaico({
    id, titulo, desc, columnas: 2, ancho: 205, alto: 180,
    celdas: [{ etiqueta: 'el corte por XZ', ...corte }, { etiqueta: 'la planta en XY', ...planta }],
  });

const discoPlanta = (R, etiqueta) => ({
  x: [-R * 1.35, R * 1.35], y: [-R * 1.35, R * 1.35], cuadrado: true,
  dibuja: (l) => {
    l.poli(aro(0, 0, R), { clase: 'f', cerrar: true });
    l.ejes({ nombreX: 'x', nombreY: 'y' });
    l.poli(aro(0, 0, R), { clase: 'c' });
    l.rotulo(0, 0, etiqueta, { dx: 0, dy: -9, anclaje: 'middle' });
  },
});

/* ══ t01 · cuatro lugares geométricos de entrada ════════════════════════ */

fig('t01-complejos', 'ej-apolonio-basico',
  'La circunferencia de Apolonio: centro (4,0) y radio 2. Los dos puntos de la condición, 0 y 3, quedan los dos fuera de ella.',
  () => {
    const l = lienzo({
      id: 'f-ej-apolonio',
      x: [-1.4, 7], y: [-3, 3], cuadrado: true,
      titulo: 'La circunferencia de centro (4,0) y radio 2',
      desc: 'Los dos puntos de la condición son el origen y el tres, marcados sobre el eje real. '
        + 'El lugar es una circunferencia de centro (4,0) y radio dos, que corta el eje real en '
        + 'el dos y en el seis. Ninguno de los dos puntos de partida está en el centro.',
    });
    l.poli(aro(4, 0, 2), { clase: 'f', cerrar: true });
    l.ejes({ marcasX: [2, 3, 6] });
    l.poli(aro(4, 0, 2), { clase: 'c' });
    l.punto(0, 0, { clase: 'o', r: 4.2 });
    l.punto(3, 0, { clase: 'o', r: 4.2 });
    l.punto(4, 0, { r: 3.4 });
    l.rotulo(0, 0, '0', { dx: -5, dy: -7, anclaje: 'end', color: 'var(--flag)' });
    l.rotulo(3, 0, '3', { dx: -2, dy: -8, anclaje: 'end', color: 'var(--flag)' });
    l.rotulo(4, 0, 'C(4,0) · r = 2', { dx: 0, dy: 16, anclaje: 'middle' });
    return l.svg();
  });

fig('t01-complejos', 'ej-arco-capaz-basico',
  'La semicircunferencia superior de diámetro el segmento de −1 a 1. Los extremos no entran: en ellos el cociente no está definido.',
  () => {
    const id = 'f-ej-arco-capaz';
    const l = lienzo({
      id,
      x: [-1.6, 1.6], y: [-0.7, 1.4], cuadrado: true,
      titulo: 'La semicircunferencia de arriba, con los extremos excluidos',
      desc: 'La circunferencia unidad completa, dibujada a trazos, y encima en trazo grueso solo '
        + 'su mitad superior, que es la que cumple la condición. Los puntos menos uno y uno '
        + 'llevan círculo hueco porque no pertenecen. El segmento que los une es el diámetro.',
    });
    l.ejes({ marcasX: [-1, 1], marcasY: [1] });
    l.poli(aro(0, 0, 1), { clase: 'g' });
    l.curva((t) => [Math.cos(t), Math.sin(t)], [0, P], { clase: 'c', n: 90 });
    l.poli([[-1, 0], [1, 0]], { clase: 'cp2' });
    hueco(l, id, -1, 0);
    hueco(l, id, 1, 0);
    l.punto(0, 1, { r: 3.6 });
    l.rotulo(0, 1, 'z = i', { dx: 7, dy: -5 });
    l.rotulo(0, 0, 'diámetro', { dy: 15, anclaje: 'middle', color: 'var(--alt)' });
    return l.svg();
  });

fig('t01-complejos', 'ej-parabola-basica',
  'La parábola x = (y²−4)/4, tumbada y abierta hacia la derecha, con el vértice en (−1,0).',
  () => {
    const l = lienzo({
      id: 'f-ej-parabola',
      x: [-2.2, 3.4], y: [-3.4, 3.4], cuadrado: true,
      titulo: 'La parábola tumbada de vértice (−1,0), abierta hacia la derecha',
      desc: 'Comparar una distancia con una coordenada da una parábola. Esta está tumbada, se '
        + 'abre hacia la derecha y tiene el vértice en el punto (−1,0). Corta el eje vertical en '
        + 'más y menos dos.',
    });
    l.ejes({ marcasX: [-1, 2], marcasY: [2, -2] });
    l.curva((y) => [(y * y - 4) / 4, y], [-3.3, 3.3], { clase: 'c', n: 90 });
    l.punto(-1, 0, { clase: 'o', r: 4.2 });
    l.punto(0, 2, { r: 3.6 });
    l.punto(0, -2, { r: 3.6 });
    l.rotulo(-1, 0, 'vértice', { dx: -6, dy: -7, anclaje: 'end', color: 'var(--flag)' });
    l.rotulo(0, 2, '2i', { dx: 7, dy: -4 });
    l.rotulo(2, 0, 'y² = 4x + 4', { dx: 4, dy: 18, anclaje: 'middle', color: 'var(--d1)' });
    return l.svg();
  });

fig('t01-complejos', 'ej-condicion-sobre-un-cociente',
  'La circunferencia de centro (1,0) y radio 1, sin el origen: ahí el cociente 1/z no existe.',
  () => {
    const id = 'f-ej-cociente';
    const l = lienzo({
      id,
      x: [-0.6, 2.6], y: [-1.6, 1.6], cuadrado: true,
      titulo: 'La circunferencia de centro (1,0) y radio uno, sin el origen',
      desc: 'Una condición sobre la parte real del inverso da una circunferencia que pasa por el '
        + 'origen: la de centro (1,0) y radio uno. El origen queda marcado con círculo hueco '
        + 'porque ahí el inverso no está definido.',
    });
    l.ejes({ marcasX: [1, 2] });
    l.poli(aro(1, 0, 1), { clase: 'c' });
    l.punto(1, 0, { r: 3.4 });
    hueco(l, id, 0, 0);
    l.rotulo(1, 0, 'C(1,0)', { dx: 0, dy: 16, anclaje: 'middle' });
    l.rotulo(0, 0, 'z = 0 fuera', { dx: 7, dy: -7, color: 'var(--flag)' });
    return l.svg();
  });

/* ══ t05 · área, volumen y longitud ═════════════════════════════════════ */

fig('t05-integracion', 'ej-area-entre-curvas',
  'La recta por encima y la parábola por debajo, entre sus dos cortes: el origen y el punto (1,1).',
  () => {
    const l = lienzo({
      id: 'f-ej-area-curvas',
      ancho: 300, alto: 250,
      x: [-0.12, 1.2], y: [-0.12, 1.2], cuadrado: true,
      titulo: 'La región entre la recta y la parábola, de (0,0) a (1,1)',
      desc: 'La recta y igual a x va por encima y la parábola y igual a x al cuadrado por debajo '
        + 'en todo el intervalo de cero a uno. Se cortan exactamente en el origen y en el punto '
        + '(1,1), y entre las dos queda una lente delgada cuya separación máxima, un cuarto, se '
        + 'da en x igual a un medio.',
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

fig('t05-integracion', 'ej-volumen-por-discos',
  'El triángulo bajo y = x de 0 a 1 y el cono que genera al girar: radio 1 en la base y altura 1.',
  () =>
    mosaico({
      id: 'f-ej-discos',
      titulo: 'El triángulo que gira y el cono que resulta',
      desc: 'A la izquierda, la región bajo la recta y igual a x entre cero y uno: un triángulo '
        + 'rectángulo con los catetos de longitud uno. A la derecha, el sólido que genera al '
        + 'girar alrededor del eje horizontal: un cono con el vértice en el origen, de radio uno '
        + 'y altura uno, con un disco de muestra dibujado a media altura.',
      columnas: 2, ancho: 200, alto: 175,
      celdas: [
        {
          etiqueta: 'la región',
          x: [-0.15, 1.25], y: [-0.15, 1.25], cuadrado: true,
          dibuja: (l) => {
            l.poli([[0, 0], [1, 0], [1, 1]], { clase: 'f', cerrar: true });
            l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1], marcasY: [1] });
            l.poli([[0, 0], [1, 1]], { clase: 'c' });
            l.poli([[1, 0], [1, 1]], { clase: 'cp2' });
          },
        },
        {
          etiqueta: 'el cono al girar',
          x: [-0.2, 1.3], y: [-1.25, 1.25], cuadrado: false,
          dibuja: (l) => {
            l.poli([[0, 0], [1, 1], [1, -1]], { clase: 'f', cerrar: true });
            l.poli([[-0.15, 0], [1.25, 0]], { clase: 'eje' });
            l.poli([[0, 0], [1, 1]], { clase: 'c' });
            l.poli([[0, 0], [1, -1]], { clase: 'c' });
            l.poli(Array.from({ length: 73 }, (_, k) => {
              const t = (2 * P * k) / 72;
              return [1 + 0.07 * Math.sin(t), Math.cos(t)];
            }), { clase: 'c' });
            l.poli(Array.from({ length: 73 }, (_, k) => {
              const t = (2 * P * k) / 72;
              return [0.5 + 0.05 * Math.sin(t), 0.5 * Math.cos(t)];
            }), { clase: 'cp' });
            l.rotulo(0.5, 0.5, 'disco r = x', { dx: -6, dy: -7, anclaje: 'end', color: 'var(--d1)' });
            l.rotulo(1.25, 0, 'OX', { dy: -7, anclaje: 'end', color: 'var(--faint)', pequeno: true });
          },
        },
      ],
    }));

/* Los dos ejercicios de longitud de arco son la misma curva: una figura y su copia. */
const arcoRedondo = (id) => {
  const f = (x) => (2 / 3) * x ** 1.5;
  const l = lienzo({
    id,
    ancho: 320, alto: 230,
    x: [-0.3, 3.6], y: [-0.4, 4.2],
    titulo: 'El arco de y = ⅔x^(3/2) entre x = 0 y x = 3',
    desc: 'La curva sale del origen y sube, cada vez más inclinada, hasta el punto (3 ; 3,46). '
      + 'El trozo dibujado en trazo grueso es el que se mide: su longitud sale redonda, catorce '
      + 'tercios, porque la raíz de la fórmula se simplifica.',
  });
  l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2, 3], marcasY: [[f(3), '3,46']] });
  l.curva(f, [0, 3], { clase: 'c', n: 80 });
  l.curva(f, [3, 3.5], { clase: 'g', n: 20 });
  l.punto(0, 0, { r: 4 });
  l.punto(3, f(3), { clase: 'o', r: 4.2 });
  l.rotulo(3, f(3), '(3 ; 3,46)', { dx: -7, dy: -7, anclaje: 'end', color: 'var(--flag)' });
  l.rotulo(1.6, f(1.6), 'y = ⅔x^(3/2)', { dx: 6, dy: 14, color: 'var(--d1)' });
  l.esquina(14, 18, 'longitud = 14/3');
  return l.svg();
};

fig('t05-integracion', 'ej-longitud-de-arco-que-sale-redonda',
  'El arco que se mide, de (0,0) a (3 ; 3,46). Lo que hace que la longitud salga redonda es que la raíz se simplifica.',
  () => arcoRedondo('f-ej-arco-redondo'));

fig('t05-integracion', 'ej-longitud-de-arco-basica',
  'El arco que se mide, de (0,0) a (3 ; 3,46): la misma curva del ejercicio anterior, vista entera.',
  () => arcoRedondo('f-ej-arco-basico'));

/* ══ t06 · nivel y plano tangente ═══════════════════════════════════════ */

fig('t06-varias-variables', 'ej-curva-de-nivel-basica',
  'La curva de nivel k = 2: la parábola y = 2 − x², con P(−1,1) sobre ella.',
  () => {
    const l = lienzo({
      id: 'f-ej-nivel-basica',
      ancho: 320, alto: 240,
      x: [-2.6, 2.6], y: [-2.6, 2.6], cuadrado: true,
      titulo: 'La curva de nivel que pasa por P, que es la parábola y = 2 − x²',
      desc: 'La parábola y igual a dos menos x al cuadrado, abierta hacia abajo con el vértice en '
        + '(0,2), es la curva de nivel dos. El punto P, en (−1,1), está sobre ella. Se dibujan '
        + 'también dos niveles vecinos, k igual a cero y k igual a cuatro, para que se vea que la '
        + 'familia son parábolas trasladadas en vertical.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, -1], marcasY: [2, -2] });
    /* Cada parábola solo donde cabe en el marco: la de k = 4 entra por arriba,
       así que de ella solo se ven las dos ramas de los lados. */
    const abajo = (k) => Math.min(2.5, Math.sqrt(k + 2.5));
    const arriba = (k) => (k > 2.5 ? Math.sqrt(k - 2.5) : 0);
    for (const k of [0, 4]) {
      const a = arriba(k);
      const b = abajo(k);
      if (a === 0) l.curva((x) => k - x * x, [-b, b], { clase: 'g', n: 60 });
      else {
        l.curva((x) => k - x * x, [a, b], { clase: 'g', n: 40 });
        l.curva((x) => k - x * x, [-b, -a], { clase: 'g', n: 40 });
      }
    }
    l.curva((x) => 2 - x * x, [-abajo(2), abajo(2)], { clase: 'c', n: 60 });
    l.punto(-1, 1, { clase: 'o', r: 4.4 });
    l.rotulo(-1, 1, 'P(−1,1)', { dx: -7, dy: -7, anclaje: 'end', color: 'var(--flag)' });
    l.rotulo(0, 2, 'k = 2', { dx: 8, dy: 6, color: 'var(--d1)' });
    l.rotulo(0, 0, 'k = 0', { dx: 7, dy: 14, color: 'var(--faint)', pequeno: true });
    return l.svg();
  });

fig('t06-varias-variables', 'ej-plano-tangente-y-aproximar',
  'El corte por y = 1: la parábola z = x² + 1 y su tangente en x = 1. Aproximar con el plano es quedarse con la recta.',
  () => {
    const l = lienzo({
      id: 'f-ej-plano-tangente',
      ancho: 330, alto: 235,
      x: [-0.1, 2.1], y: [-0.4, 4.4],
      titulo: 'El corte por y = 1: la parábola y la recta tangente que la aproxima',
      desc: 'Cortando la superficie por el plano y igual a uno queda la parábola z igual a x al '
        + 'cuadrado más uno. Su tangente en x igual a uno es la recta z igual a dos más dos por x '
        + 'menos uno. En x igual a uno coma uno la parábola vale 2,21 y la recta 2,20: la '
        + 'diferencia es una centésima, y ese hueco es exactamente el error de la aproximación.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'z', marcasX: [1, 2], marcasY: [2, 4] });
    l.curva((x) => x * x + 1, [0, 2], { clase: 'c', n: 60 });
    l.curva((x) => 2 + 2 * (x - 1), [0.05, 2], { clase: 'c2' });
    l.punto(1, 2, { r: 4.2 });
    l.punto(1.1, 1.1 * 1.1 + 1, { clase: 'o', r: 3.6 });
    l.poli([[1.1, 2 + 0.2], [1.1, 1.1 * 1.1 + 1]], { clase: 'g' });
    l.rotulo(1, 2, '(1,2)', { dx: -7, dy: -6, anclaje: 'end' });
    l.rotulo(1.5, 1.5 * 1.5 + 1, 'z = x²+1', { dx: -6, dy: -6, anclaje: 'end', color: 'var(--d1)' });
    l.rotulo(1.75, 2 + 2 * 0.75, 'tangente', { dx: 4, dy: 14, anclaje: 'end', color: 'var(--alt)' });
    l.rotulo(1.1, 2.21, 'error 0,01', { dx: 7, dy: 2, color: 'var(--flag)' });
    return l.svg();
  });

/* ══ t07 · recintos y sólidos de entrada ════════════════════════════════ */

fig('t07-integral-multiple', 'ej-recinto-y-limites',
  'El triángulo de vértices (0,0), (2,0) y (2,2), con la franja vertical que da los límites en el orden dy dx.',
  () => {
    const l = lienzo({
      id: 'f-ej-recinto-limites',
      ancho: 300, alto: 250,
      x: [-0.3, 2.6], y: [-0.3, 2.6], cuadrado: true,
      titulo: 'El triángulo, con la franja vertical que se lee para poner los límites',
      desc: 'Un triángulo con los vértices en el origen, en (2,0) y en (2,2), limitado por el eje '
        + 'horizontal, por la vertical x igual a dos y por la bisectriz y igual a x. Una franja '
        + 'vertical de muestra, dibujada en x igual a uno coma dos, sube desde el eje hasta la '
        + 'bisectriz: es la que dice que y va de cero a x.',
    });
    l.poli([[0, 0], [2, 0], [2, 2]], { clase: 'f', cerrar: true });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [2], marcasY: [2] });
    l.poli([[0, 0], [2, 0], [2, 2]], { clase: 'c', cerrar: true });
    l.poli([[1.2, 0], [1.2, 1.2]], { clase: 'cp2' });
    l.punto(1.2, 1.2, { clase: 'o', r: 3.6 });
    l.rotulo(1.2, 1.2, 'y va de 0 a x', { dx: 6, dy: -6, color: 'var(--flag)' });
    l.rotulo(2, 1, 'x = 2', { dx: 5, dy: 0, color: 'var(--d1)' });
    l.rotulo(0.8, 0.8, 'y = x', { dx: -6, dy: -6, anclaje: 'end', color: 'var(--d1)' });
    return l.svg();
  });

fig('t07-integral-multiple', 'ej-polares-primera',
  'El círculo de radio 3 y el trocito de área en polares: un cuadradito de lados dr y r·dθ, que es de donde sale el jacobiano.',
  () => {
    const l = lienzo({
      id: 'f-ej-polares',
      x: [-3.6, 3.6], y: [-3.6, 3.6], cuadrado: true,
      titulo: 'El círculo de radio tres y el elemento de área en polares',
      desc: 'El disco de radio tres centrado en el origen. Dentro, un trocito de corona marcado '
        + 'entre dos radios y dos circunferencias: sus lados miden dr en la dirección radial y r '
        + 'por dθ en la dirección del giro, y por eso el área del trocito es r dr dθ.',
    });
    l.poli(aro(0, 0, 3), { clase: 'f', cerrar: true });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [3], marcasY: [3] });
    l.poli(aro(0, 0, 3), { clase: 'c' });
    /* El elemento de área, entre r = 1,6 y 2,2 y entre 35° y 55°. */
    const a0 = (35 * P) / 180;
    const a1 = (55 * P) / 180;
    const trozo = [
      ...Array.from({ length: 13 }, (_, k) => { const t = a0 + ((a1 - a0) * k) / 12; return [1.6 * Math.cos(t), 1.6 * Math.sin(t)]; }),
      ...Array.from({ length: 13 }, (_, k) => { const t = a1 + ((a0 - a1) * k) / 12; return [2.2 * Math.cos(t), 2.2 * Math.sin(t)]; }),
    ];
    l.poli(trozo, { clase: 'f2', cerrar: true });
    l.poli(trozo, { clase: 'c2', cerrar: true });
    l.poli([[0, 0], [2.9 * Math.cos(a0), 2.9 * Math.sin(a0)]], { clase: 'g' });
    l.poli([[0, 0], [2.9 * Math.cos(a1), 2.9 * Math.sin(a1)]], { clase: 'g' });
    l.rotulo(2.2 * Math.cos(a1), 2.2 * Math.sin(a1), 'dA = r dr dθ', { dx: 6, dy: -4, color: 'var(--alt)' });
    l.rotulo(3, 0, 'r = 3', { dx: -3, dy: -8, anclaje: 'end', color: 'var(--d1)' });
    return l.svg();
  });

fig('t07-integral-multiple', 'ej-area-de-un-plano-inclinado',
  'El rectángulo de la base y el trozo de plano que queda encima: la misma sombra, pero inclinada, y por eso mide 3 veces más.',
  () => {
    const l = lienzo({
      id: 'f-ej-plano-inclinado',
      ancho: 330, alto: 235,
      x: [-0.4, 3.4], y: [-0.7, 2.2], cuadrado: false,
      titulo: 'El rectángulo de la base y el trozo de plano inclinado que queda encima',
      desc: 'Abajo, la sombra: el rectángulo de dos por uno sobre el plano XY, de área dos. '
        + 'Encima, el trozo de plano inclinado que se proyecta sobre él, dibujado como un '
        + 'paralelogramo levantado. Tiene la misma sombra pero está inclinado, y por eso su área '
        + 'es tres veces mayor: seis.',
    });
    /* Una isometría sencilla, sin más pretensión que enseñar la inclinación. */
    const p = (x, y, z) => [x + 0.45 * y, 0.32 * y + 0.17 * z];
    const base = [p(0, 0, 0), p(2, 0, 0), p(2, 1, 0), p(0, 1, 0)];
    const alto = [p(0, 0, 1), p(2, 0, 5), p(2, 1, 7), p(0, 1, 3)];
    l.poli(base, { clase: 'f', cerrar: true });
    l.poli(base, { clase: 'c2', cerrar: true });
    l.poli(alto, { clase: 'f2', cerrar: true });
    l.poli(alto, { clase: 'c', cerrar: true });
    for (let k = 0; k < 4; k++) l.poli([base[k], alto[k]], { clase: 'g' });
    l.rotulo(...base[1], 'sombra: área 2', { dx: 4, dy: 14, anclaje: 'end', color: 'var(--alt)' });
    l.rotulo(...alto[3], 'plano: área 6', { dx: 4, dy: -7, color: 'var(--d1)' });
    return l.svg();
  });

fig('t07-integral-multiple', 'ej-area-del-casquete-de-paraboloide',
  'El cuenco cortado por el plano z = 1: la parábola del corte y el disco de radio 1 sobre el que se integra.',
  () =>
    solido({
      id: 'f-ej-casquete',
      titulo: 'El paraboloide por debajo de z = 1, y el disco de radio uno de su planta',
      desc: 'A la izquierda, el corte: la parábola z igual a x al cuadrado sale en punta del '
        + 'origen y se corta con la recta horizontal z igual a uno en x igual a más y menos uno. '
        + 'A la derecha, la planta: el disco de radio uno, que es sobre lo que se integra.',
      corte: {
        x: [-1.6, 1.6], y: [-0.35, 1.6], cuadrado: false,
        dibuja: (l) => {
          l.poli(entre(() => 1, (x) => x * x, -1, 1), { clase: 'f', cerrar: true });
          l.ejes({ nombreX: 'x', nombreY: 'z', marcasX: [-1, 1], marcasY: [1] });
          l.curva((x) => x * x, [-1.25, 1.25], { clase: 'c', n: 50 });
          l.poli([[-1.5, 1], [1.5, 1]], { clase: 'c2' });
          l.punto(1, 1, { clase: 'o', r: 3.6 });
          l.punto(-1, 1, { clase: 'o', r: 3.6 });
        },
      },
      planta: discoPlanta(1, 'r ≤ 1'),
    }));

fig('t07-integral-multiple', 'ej-volumen-bajo-un-paraboloide',
  'El paraboloide de vértice (0,0,4) apoyado en el plano z = 0, y el disco de radio 2 de su planta.',
  () =>
    solido({
      id: 'f-ej-vol-paraboloide',
      titulo: 'El paraboloide boca abajo con vértice en z = 4, y el disco de radio dos',
      desc: 'A la izquierda, el corte: la parábola z igual a cuatro menos x al cuadrado, con el '
        + 'vértice arriba en z igual a cuatro, que corta el suelo en x igual a más y menos dos. A '
        + 'la derecha, la planta: el disco de radio dos.',
      corte: {
        x: [-2.6, 2.6], y: [-0.8, 4.6], cuadrado: false,
        dibuja: (l) => {
          l.poli(entre((x) => 4 - x * x, () => 0, -2, 2), { clase: 'f', cerrar: true });
          l.ejes({ nombreX: 'x', nombreY: 'z', marcasX: [-2, 2], marcasY: [4] });
          l.curva((x) => 4 - x * x, [-2.3, 2.3], { clase: 'c', n: 60 });
          l.poli([[-2, 0], [2, 0]], { clase: 'c2' });
        },
      },
      planta: discoPlanta(2, 'r ≤ 2'),
    }));

fig('t07-integral-multiple', 'ej-plantear-sin-calcular',
  'El cuenco z = x²+y² tapado por el plano z = 4: z va de r² a 4, y r de 0 a 2.',
  () =>
    solido({
      id: 'f-ej-plantear',
      titulo: 'El cuenco tapado por el plano z = 4, con los límites leídos del corte',
      desc: 'A la izquierda, el corte: la parábola z igual a x al cuadrado sube desde el origen y '
        + 'se corta con la recta z igual a cuatro en x igual a más y menos dos. La región entre '
        + 'las dos es la sección del sólido, y de ella se leen los límites: z va de r al cuadrado '
        + 'a cuatro. A la derecha, la planta: el disco de radio dos, de donde sale que r va de '
        + 'cero a dos.',
      corte: {
        x: [-2.6, 2.6], y: [-0.8, 4.8], cuadrado: false,
        dibuja: (l) => {
          l.poli(entre(() => 4, (x) => x * x, -2, 2), { clase: 'f', cerrar: true });
          l.ejes({ nombreX: 'x', nombreY: 'z', marcasX: [-2, 2], marcasY: [4] });
          l.curva((x) => x * x, [-2.2, 2.2], { clase: 'c', n: 60 });
          l.poli([[-2.5, 4], [2.5, 4]], { clase: 'c2' });
          l.punto(2, 4, { clase: 'o', r: 3.6 });
          l.punto(-2, 4, { clase: 'o', r: 3.6 });
          l.rotulo(0, 2, 'z: de r² a 4', { dx: 0, dy: 4, anclaje: 'middle' });
        },
      },
      planta: discoPlanta(2, 'r: de 0 a 2'),
    }));

fig('t07-integral-multiple', 'ej-centro-del-medio-disco',
  'El semicírculo y su centro de gravedad, a altura 4/(3π) ≈ 0,42: por debajo de la mitad del radio, como tiene que ser.',
  () => {
    const yG = 4 / (3 * P);
    const l = lienzo({
      id: 'f-ej-medio-disco',
      ancho: 320, alto: 210,
      x: [-1.35, 1.35], y: [-0.35, 1.35], cuadrado: true,
      titulo: 'El semicírculo de radio uno con su centro de gravedad marcado',
      desc: 'La mitad de arriba del disco de radio uno, con el diámetro apoyado en el eje '
        + 'horizontal. El centro de gravedad está sobre el eje vertical, a la altura cuatro '
        + 'partido por tres pi, unos cero coma cuarenta y dos: por debajo de la mitad del radio, '
        + 'porque abajo hay más área que arriba.',
    });
    l.poli([...Array.from({ length: 91 }, (_, k) => { const t = (P * k) / 90; return [Math.cos(t), Math.sin(t)]; })], { clase: 'f', cerrar: true });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-1, 1], marcasY: [[0.5, '½'], 1] });
    l.curva((t) => [Math.cos(t), Math.sin(t)], [0, P], { clase: 'c', n: 90 });
    l.poli([[-1, 0], [1, 0]], { clase: 'c' });
    l.poli([[-1.3, yG], [1.3, yG]], { clase: 'g' });
    l.punto(0, yG, { clase: 'o', r: 4.6 });
    l.rotulo(0, yG, 'G(0 ; 0,42)', { dx: 8, dy: -5, color: 'var(--flag)' });
    return l.svg();
  });

fig('t07-integral-multiple', 'ej-donde-se-cortan-dos-superficies',
  'Las dos superficies se cortan en la circunferencia r = 1 a la altura z = 1: eso es lo que fija los límites.',
  () =>
    solido({
      id: 'f-ej-se-cortan',
      titulo: 'Los dos paraboloides y la circunferencia donde se cortan, en r = 1 y z = 1',
      desc: 'A la izquierda, el corte: la parábola z igual a x al cuadrado sube del origen y la '
        + 'parábola z igual a dos menos x al cuadrado baja desde z igual a dos. Se cortan en x '
        + 'igual a más y menos uno, a la altura uno. A la derecha, la planta: el disco de radio '
        + 'uno, que es la sombra de esa circunferencia de corte.',
      corte: {
        x: [-1.7, 1.7], y: [-0.4, 2.4], cuadrado: false,
        dibuja: (l) => {
          l.poli(entre((x) => 2 - x * x, (x) => x * x, -1, 1), { clase: 'f', cerrar: true });
          l.ejes({ nombreX: 'x', nombreY: 'z', marcasX: [-1, 1], marcasY: [1, 2] });
          l.curva((x) => x * x, [-1.45, 1.45], { clase: 'c', n: 50 });
          l.curva((x) => 2 - x * x, [-1.45, 1.45], { clase: 'c2', n: 50 });
          l.punto(1, 1, { clase: 'o', r: 3.8 });
          l.punto(-1, 1, { clase: 'o', r: 3.8 });
          l.rotulo(1, 1, 'r=1, z=1', { dx: -6, dy: -7, anclaje: 'end', color: 'var(--flag)' });
        },
      },
      planta: discoPlanta(1, 'r ≤ 1'),
    }));

fig('t07-integral-multiple', 'ej-centro-de-la-semiesfera',
  'La media bola y su centro de gravedad, a altura 3/8 del radio: más bajo aún que el del semicírculo.',
  () => {
    const l = lienzo({
      id: 'f-ej-semiesfera',
      ancho: 320, alto: 210,
      x: [-1.35, 1.35], y: [-0.35, 1.35], cuadrado: true,
      titulo: 'El corte de la media bola, con el centro de gravedad a tres octavos de altura',
      desc: 'El corte por un plano que contiene el eje: media circunferencia de radio uno '
        + 'apoyada en el eje horizontal. El centro de gravedad está sobre el eje vertical a la '
        + 'altura tres octavos, cero coma trescientos setenta y cinco, todavía más bajo que el '
        + 'del semicírculo plano porque en un sólido el área de cada rodaja pesa como el radio al '
        + 'cuadrado.',
    });
    l.poli([...Array.from({ length: 91 }, (_, k) => { const t = (P * k) / 90; return [Math.cos(t), Math.sin(t)]; })], { clase: 'f', cerrar: true });
    l.ejes({ nombreX: 'r', nombreY: 'z', marcasX: [-1, 1], marcasY: [[0.5, '½'], 1] });
    l.curva((t) => [Math.cos(t), Math.sin(t)], [0, P], { clase: 'c', n: 90 });
    l.poli([[-1, 0], [1, 0]], { clase: 'c' });
    l.poli([[-1.3, 0.375], [1.3, 0.375]], { clase: 'g' });
    l.punto(0, 0.375, { clase: 'o', r: 4.6 });
    l.rotulo(0, 0.375, 'G(0 ; 3/8)', { dx: 8, dy: -5, color: 'var(--flag)' });
    return l.svg();
  });

/* ══ t11 · las cuatro de Fourier ════════════════════════════════════════ */

fig('t11-fourier', 'ej-paridad-antes-de-integrar',
  'A la izquierda t², simétrica respecto del eje: solo cosenos. A la derecha t³, simétrica respecto del origen: solo senos.',
  () =>
    mosaico({
      id: 'f-ej-paridad',
      titulo: 'La función par y la impar, y la simetría que decide qué coeficientes se anulan',
      desc: 'A la izquierda, t al cuadrado repetida cada dos pi: cada trozo es una parábola con '
        + 'el valle en el centro, y el dibujo es simétrico respecto del eje vertical. A la '
        + 'derecha, t al cubo repetida igual: cada trozo sube de menos pi cubo a pi cubo, y el '
        + 'dibujo es simétrico respecto del origen. La primera es par y solo tiene cosenos; la '
        + 'segunda es impar y solo tiene senos.',
      columnas: 2, ancho: 205, alto: 175,
      celdas: [
        {
          etiqueta: '(a) t² · par',
          x: [-3.4 * P, 3.4 * P], y: [-2, 12], cuadrado: false,
          dibuja: (l) => {
            l.ejes({ nombreX: 't', nombreY: 'f', marcasX: [[-P, '−π'], [P, 'π']], marcasY: [[P * P, 'π²']] });
            for (const c of [-2, 0, 2]) l.curva((t) => [c * P + t, t * t], [-P + 0.02, P - 0.02], { clase: 'c', n: 40 });
            l.poli([[0, 0], [0, 11]], { clase: 'g' });
            l.rotulo(0, 11, 'eje de simetría', { dx: 4, dy: 2, color: 'var(--faint)', pequeno: true });
          },
        },
        {
          etiqueta: '(b) t³ · impar',
          x: [-3.4 * P, 3.4 * P], y: [-38, 38], cuadrado: false,
          dibuja: (l) => {
            l.ejes({ nombreX: 't', nombreY: 'g', marcasX: [[-P, '−π'], [P, 'π']], marcasY: [[P ** 3, 'π³']] });
            for (const c of [-2, 0, 2]) l.curva((t) => [c * P + t, t ** 3], [-P + 0.02, P - 0.02], { clase: 'c', n: 40 });
            for (const k of [-3, -1, 1, 3]) l.punto(k * P, 0, { clase: 'o', r: 3.4 });
            l.punto(0, 0, { r: 3.8 });
          },
        },
      ],
    }));

fig('t11-fourier', 'ej-dirichlet-en-el-salto',
  'La onda cuadrada: en t = 0 hay salto y la serie vale 0, la media; en t = 0,5 la función es continua y la serie vale 1.',
  () => {
    const l = lienzo({
      id: 'f-ej-dirichlet',
      ancho: 380, alto: 190,
      x: [-2.4, 2.4], y: [-1.7, 1.7],
      titulo: 'La onda cuadrada de periodo dos, con los puntos de convergencia en los saltos',
      desc: 'Tramos horizontales a altura menos uno y a altura uno que se alternan cada unidad. '
        + 'En los enteros hay saltos de altura dos, y en la mitad de cada salto un punto a altura '
        + 'cero: es lo que vale la serie allí. En t igual a cero coma cinco, donde la función es '
        + 'continua, la serie vale lo mismo que la función: uno.',
    });
    l.ejes({ nombreX: 't', nombreY: 'f', marcasX: [-2, -1, 1, 2], marcasY: [1, -1] });
    /* f vale −1 en (−1,0) y +1 en (0,1), y de ahí en adelante se repite cada
       dos. El tramo que empieza en cada entero par es el de arriba. */
    for (const c of [-2, 0]) {
      l.poli([[Math.max(c - 1, -2.35), -1], [c, -1]], { clase: 'c' });
      l.poli([[c, 1], [c + 1, 1]], { clase: 'c' });
      l.poli([[c, -1], [c, 1]], { clase: 'g' });
      l.poli([[c + 1, -1], [c + 1, 1]], { clase: 'g' });
    }
    l.poli([[2, -1], [2.35, -1]], { clase: 'c' });
    for (const t of [-2, -1, 0, 1, 2]) l.punto(t, 0, { clase: 'o', r: 4 });
    l.punto(0.5, 1, { r: 4.2 });
    l.rotulo(0, 0, 'S(0) = 0', { dx: -7, dy: -7, anclaje: 'end', color: 'var(--flag)' });
    l.rotulo(0.5, 1, 'S(0,5) = 1', { dx: 6, dy: -6 });
    return l.svg();
  });

fig('t11-fourier', 'ej-ampliar-y-reducir',
  'La ampliación impar: un diente de sierra. A la izquierda de π vale π, a la derecha −π, y 41π se reduce a π.',
  () => {
    const l = lienzo({
      id: 'f-ej-ampliar',
      ancho: 380, alto: 200,
      x: [-3.6 * P, 3.6 * P], y: [-4.4, 4.4],
      titulo: 'El diente de sierra de la ampliación impar, y los dos límites laterales en π',
      desc: 'Rampas de pendiente uno que suben de menos pi a pi en cada periodo y caen de golpe '
        + 'en los múltiplos impares de pi. Justo a la izquierda de pi la función tiende a pi; '
        + 'justo a la derecha, a menos pi. En el propio pi la serie vale cero, la media de los '
        + 'dos. Reducir t igual a cuarenta y un pi lleva al mismo sitio, porque cuarenta y un pi '
        + 'menos veinte periodos es pi.',
    });
    l.ejes({
      nombreX: 't', nombreY: 'F',
      marcasX: [[-3 * P, '−3π'], [-P, '−π'], [P, 'π'], [3 * P, '3π']],
      marcasY: [[P, 'π'], [-P, '−π']],
    });
    for (const c of [-2, 0, 2]) l.poli([[c * P - P + 0.03, -P + 0.03], [c * P + P - 0.03, P - 0.03]], { clase: 'c' });
    for (const k of [-3, -1, 1, 3]) {
      l.poli([[k * P, -P], [k * P, P]], { clase: 'g' });
      l.punto(k * P, 0, { clase: 'o', r: 4 });
    }
    l.rotulo(P, P, 'π⁻ → π', { dx: -6, dy: -6, anclaje: 'end' });
    l.rotulo(P, -P, 'π⁺ → −π', { dx: 6, dy: 14 });
    l.rotulo(P, 0, '41π cae aquí', { dx: 8, dy: -6, color: 'var(--flag)' });
    return l.svg();
  });

fig('t11-fourier', 'ej-un-coeficiente-integrado',
  'La rampa y su primer armónico, 2·sen t. Un solo seno ya acierta la forma general, y el error se ve en los extremos.',
  () => {
    const l = lienzo({
      id: 'f-ej-coeficiente',
      ancho: 380, alto: 200,
      x: [-3.6 * P, 3.6 * P], y: [-4.4, 4.4],
      titulo: 'La rampa f(t)=t y su primer armónico, dos por seno de t',
      desc: 'Las rampas de pendiente uno de la función, y encima, con otro trazo, la onda dos por '
        + 'seno de t, que es el primer término de la serie. La onda sigue la forma general de la '
        + 'rampa —sube donde ella sube y se anula donde ella se anula— pero se queda corta cerca '
        + 'de los saltos, que es exactamente lo que van corrigiendo los armónicos siguientes.',
    });
    l.ejes({
      nombreX: 't', nombreY: 'f',
      marcasX: [[-3 * P, '−3π'], [-P, '−π'], [P, 'π'], [3 * P, '3π']],
      marcasY: [[P, 'π'], [2, '2']],
    });
    for (const c of [-2, 0, 2]) l.poli([[c * P - P + 0.03, -P + 0.03], [c * P + P - 0.03, P - 0.03]], { clase: 'c' });
    for (const k of [-3, -1, 1, 3]) l.poli([[k * P, -P], [k * P, P]], { clase: 'g' });
    l.curva((t) => 2 * Math.sin(t), [-3.5 * P, 3.5 * P], { clase: 'c2', n: 200 });
    l.rotulo(P / 2, 2, 'b₁ sen t = 2 sen t', { dx: 6, dy: -6, color: 'var(--alt)' });
    return l.svg();
  });

/* ── a pegar ─────────────────────────────────────────────────────────── */
for (const f of figuras) f.svg = f.hacer();

if (process.argv[1]?.endsWith('calculo-ejemplos.mjs')) {
  for (const f of figuras) pegaEnCampo(f.fichero, f.id, f.campo, f.svg, f.pie);
  console.log(`${figuras.length} figuras de ejemplo pegadas`);
}
