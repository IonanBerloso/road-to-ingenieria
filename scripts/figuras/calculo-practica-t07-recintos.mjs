/**
 * Las figuras de las prácticas del tema 7 que van de recintos planos y de
 * cambios de variable.
 *
 * Un cambio de variable en una integral doble es, literalmente, un dibujo que
 * se convierte en otro: un paralelogramo torcido que se endereza hasta ser un
 * rectángulo, una corona que se estira hasta ser una banda. Mientras eso no se
 * ve, el jacobiano es un factor que aparece porque lo dice el libro; en cuanto
 * se ve, es el área del trocito deformado, que es lo que de verdad es.
 *
 * Por eso varias de estas figuras son de dos paneles: el recinto de partida y
 * el que queda después del cambio, uno al lado del otro.
 *
 *     node scripts/figuras/calculo-practica-t07-recintos.mjs
 */

import { lienzo, mosaico, vista3d } from './lienzo.mjs';
import { pegaEnCampo } from './pegar.mjs';

export const FICHERO = 'src/content/calculo/t07-integral-multiple/ejercicios.yaml';

export const figuras = [];
const fig = (id, pie, hacer) =>
  figuras.push({ fichero: FICHERO, id, campo: 'resolucion', pie, hacer });

const P = Math.PI;
const param = (f, a, b, n = 140) =>
  Array.from({ length: n + 1 }, (_, k) => f(a + ((b - a) * k) / n));
const arco = (cx, cy, r, t0, t1, n = 90) =>
  param((t) => [cx + r * Math.cos(t), cy + r * Math.sin(t)], t0, t1, n);

/* ── 1 · tres integrales dobles directas ─────────────────────────────── */

fig('tres-dobles-directas',
  'Los dos primeros recintos, que es donde está la dificultad. El triángulo se barre mejor en un orden que en el otro, y el medio disco de (b) está centrado en (2,0), no en el origen: si se pasa a polares sin darse cuenta, los límites salen mal.',
  () => {
    return mosaico({
      id: 'f-tres-dobles-directas',
      columnas: 2,
      ancho: 210,
      alto: 180,
      titulo: 'El triángulo del apartado a y el medio disco del apartado b',
      desc: 'Dos recuadros. En el primero, un triángulo sombreado con vértices en el origen, en '
        + 'el punto uno coma uno y en el cero coma uno; su lado inclinado es la bisectriz. Tres '
        + 'flechas horizontales lo barren de izquierda a derecha, indicando que conviene '
        + 'integrar primero en x. En el segundo, la mitad de arriba de un disco de radio uno '
        + 'centrado en el punto dos coma cero, con el diámetro apoyado en el eje horizontal; el '
        + 'centro está marcado, y se ve que no es el origen.',
      celdas: [
        {
          etiqueta: '(a) el triángulo',
          x: [-0.35, 1.45], y: [-0.35, 1.45], cuadrado: true,
          dibuja: (l) => {
            l.poli([[0, 0], [1, 1], [0, 1]], { clase: 'f', cerrar: true });
            l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1], marcasY: [1] });
            l.poli([[0, 0], [1, 1], [0, 1]], { clase: 'c', cerrar: true });
            for (const y of [0.3, 0.55, 0.8]) l.flecha([0.04, y], [y - 0.04, y], { clase: 'c2', color: 'var(--alt)' });
            l.punto(1, 1, { clase: 'o', r: 4 });
          },
        },
        {
          etiqueta: '(b) medio disco en (2,0)',
          x: [-0.4, 3.4], y: [-0.5, 1.6], cuadrado: true,
          dibuja: (l) => {
            l.poli([[1, 0], ...arco(2, 0, 1, 0, P, 70)], { clase: 'f', cerrar: true });
            l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2, 3], marcasY: [1] });
            l.poli(arco(2, 0, 1, 0, P, 70), { clase: 'c' });
            l.poli([[1, 0], [3, 0]], { clase: 'c' });
            l.punto(2, 0, { clase: 'o', r: 4.2 });
            l.rotulo(2, 0, 'centro (2,0)', { dx: 0, dy: 15, anclaje: 'middle', color: 'var(--flag)', pequeno: true });
          },
        },
      ],
    });
  });

/* ── 2 · dos dobles en polares ───────────────────────────────────────── */

fig('dos-dobles-en-polares',
  'La circunferencia x² + y² = 2ax no está centrada en el origen: en polares se convierte en ρ = 2a·cos θ, que no es un radio constante sino uno que depende del ángulo. Esa es la diferencia entre un disco cómodo y uno que hay que pensar.',
  () => {
    const a = 1;
    return mosaico({
      id: 'f-dos-dobles-polares',
      columnas: 2,
      ancho: 205,
      alto: 185,
      titulo: 'El disco desplazado y su descripción en polares',
      desc: 'A la izquierda, un disco sombreado de radio uno centrado en el punto uno coma cero, '
        + 'que pasa por el origen. Desde el origen sale un radio hasta el borde, con un arco que '
        + 'marca el ángulo: se ve que la distancia al borde cambia según el ángulo, y que cuando '
        + 'el ángulo llega a noventa grados esa distancia es cero. A la derecha, la misma región '
        + 'descrita en el plano de rho frente a theta: queda por debajo de la curva rho igual a '
        + 'dos por el coseno de theta, entre menos noventa y noventa grados.',
      celdas: [
        {
          etiqueta: 'x²+y² = 2ax',
          x: [-0.5, 2.5], y: [-1.5, 1.5], cuadrado: true,
          dibuja: (l) => {
            l.poli(arco(a, 0, a, 0, 2 * P, 120), { clase: 'f', cerrar: true });
            l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [[2 * a, '2a']] });
            l.poli(arco(a, 0, a, 0, 2 * P, 120), { clase: 'c', cerrar: true });
            const t = 0.65;
            l.poli([[0, 0], [2 * a * Math.cos(t) * Math.cos(t), 2 * a * Math.cos(t) * Math.sin(t)]], { clase: 'c2' });
            l.poli(arco(0, 0, 0.45, 0, t, 30), { clase: 'g' });
            l.rotulo(0.6, 0.2, 'θ', { dx: 2, dy: 2, pequeno: true });
            l.esquina(6, 13, 'ρ = 2a cos θ', { color: 'var(--alt)' });
          },
        },
        {
          etiqueta: 'en el plano ρ–θ',
          x: [-2.1, 2.1], y: [-0.35, 2.5], cuadrado: false,
          dibuja: (l) => {
            const f = (t) => 2 * a * Math.cos(t);
            l.poli([[-P / 2, 0], ...param((t) => [t, f(t)], -P / 2, P / 2, 80), [P / 2, 0]], { clase: 'f', cerrar: true });
            l.ejes({ nombreX: 'θ', nombreY: 'ρ', marcasX: [[-P / 2, '−π/2'], [P / 2, 'π/2']], marcasY: [[2 * a, '2a']] });
            l.curva(f, [-P / 2, P / 2], { clase: 'c', n: 80 });
          },
        },
      ],
    });
  });

/* ── 3 · polares generalizadas en la elipse ──────────────────────────── */

fig('polares-generalizadas-en-la-elipse',
  'Las polares generalizadas estiran cada eje por su semieje: x = aρcos θ, y = bρsen θ. Con eso la elipse se convierte en la circunferencia unidad y la integral se vuelve la de siempre. El precio es el jacobiano, que ya no es ρ sino abρ.',
  () => {
    const a = 2, b = 1.2;
    return mosaico({
      id: 'f-polares-generalizadas',
      columnas: 2,
      ancho: 205,
      alto: 185,
      titulo: 'La elipse de partida y la circunferencia en la que se convierte',
      desc: 'A la izquierda, el interior de una elipse sombreado, con el semieje horizontal a y '
        + 'el vertical b marcados. A la derecha, el interior de la circunferencia de radio uno, '
        + 'también sombreado, que es en lo que la elipse se convierte al aplicar el cambio. Una '
        + 'flecha entre los dos recuadros indica la dirección del cambio, y lleva escrito que el '
        + 'jacobiano vale a por b por rho.',
      celdas: [
        {
          etiqueta: 'la elipse en (x,y)',
          x: [-2.6, 2.6], y: [-1.7, 1.7], cuadrado: true,
          dibuja: (l) => {
            l.poli(param((t) => [a * Math.cos(t), b * Math.sin(t)], 0, 2 * P, 120), { clase: 'f', cerrar: true });
            l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [[a, 'a']], marcasY: [[b, 'b']] });
            l.poli(param((t) => [a * Math.cos(t), b * Math.sin(t)], 0, 2 * P, 120), { clase: 'c', cerrar: true });
            l.esquina(6, 13, 'J = abρ', { color: 'var(--alt)' });
          },
        },
        {
          etiqueta: 'el círculo en (ρ,θ)',
          x: [-1.5, 1.5], y: [-1.5, 1.5], cuadrado: true,
          dibuja: (l) => {
            l.disco(0, 0, 1, { clase: 'f' });
            l.ejes({ nombreX: 'u', nombreY: 'v', marcasX: [1] });
            l.circunferencia(0, 0, 1, { clase: 'c' });
          },
        },
      ],
    });
  });

/* ── 4 · un paralelogramo inclinado ──────────────────────────────────── */

fig('el-paralelogramo-inclinado',
  'El cambio está elegido para que u = y − x y v = y + x/3, que son exactamente las cuatro rectas del enunciado. Por eso el recinto torcido se endereza en un rectángulo, y los límites pasan de ser un problema a ser cuatro números.',
  () => {
    const XY = (u, v) => [0.75 * (v - u), 0.25 * u + 0.75 * v];
    const esquinas = [[-3, 2], [1, 2], [1, 4], [-3, 4]].map(([u, v]) => XY(u, v));
    return mosaico({
      id: 'f-paralelogramo-inclinado',
      columnas: 2,
      ancho: 205,
      alto: 190,
      titulo: 'El paralelogramo del enunciado y el rectángulo en el que se convierte',
      desc: 'A la izquierda, un paralelogramo sombreado e inclinado, limitado por cuatro rectas: '
        + 'dos paralelas de pendiente uno y dos paralelas de pendiente menos un tercio. A la '
        + 'derecha, un rectángulo sombreado con los lados paralelos a los ejes, que va de menos '
        + 'tres a uno en horizontal y de dos a cuatro en vertical: es lo que queda del '
        + 'paralelogramo tras el cambio de variable. Cada lado del paralelogramo corresponde a '
        + 'un lado del rectángulo, y los rótulos lo indican.',
      celdas: [
        {
          etiqueta: 'D en (x,y)',
          x: [-0.5, 6.2], y: [-0.5, 4.2], cuadrado: true,
          dibuja: (l) => {
            l.poli(esquinas, { clase: 'f', cerrar: true });
            l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [2, 4], marcasY: [2] });
            l.poli(esquinas, { clase: 'c', cerrar: true });
            l.rotulo(...esquinas[0], 'u = −3', { dx: 4, dy: 12, color: 'var(--alt)', pequeno: true });
            l.rotulo(...esquinas[2], 'v = 4', { dx: -4, dy: -6, anclaje: 'end', color: 'var(--alt)', pequeno: true });
          },
        },
        {
          etiqueta: 'D en (u,v)',
          x: [-4.2, 2.2], y: [-0.5, 5], cuadrado: true,
          dibuja: (l) => {
            l.poli([[-3, 2], [1, 2], [1, 4], [-3, 4]], { clase: 'f', cerrar: true });
            l.ejes({ nombreX: 'u', nombreY: 'v', marcasX: [[-3, '−3'], [1, '1']], marcasY: [2, 4] });
            l.poli([[-3, 2], [1, 2], [1, 4], [-3, 4]], { clase: 'c', cerrar: true });
          },
        },
      ],
    });
  });

/* ── 5 · la corona y el sector ───────────────────────────────────────── */

fig('la-corona-y-el-sector',
  'En polares la corona es el rectángulo 1 ≤ ρ ≤ 2, 0 ≤ θ ≤ 2π, y el sector es el mismo rectángulo recortado por arriba. Ese es todo el motivo de cambiar de coordenadas: los límites dejan de depender unos de otros.',
  () => {
    const corona = [...arco(0, 0, 2, 0, 2 * P, 120), ...arco(0, 0, 1, 2 * P, 0, 120)];
    return mosaico({
      id: 'f-corona-y-sector',
      columnas: 3,
      titulo: 'La corona, el sector y el rectángulo que los dos son en polares',
      desc: 'Tres recuadros. En el primero, una corona circular sombreada entre los radios uno y '
        + 'dos. En el segundo, el trozo de esa corona comprendido entre los ángulos de cuarenta '
        + 'y cinco y ciento ochenta grados, con los dos radios que lo limitan dibujados. En el '
        + 'tercero, el plano de rho frente a theta, donde la corona entera es un rectángulo que '
        + 'va de uno a dos en rho y de cero a dos pi en theta, y el sector es la parte de ese '
        + 'rectángulo comprendida entre pi cuartos y pi, sombreada de otro tono.',
      celdas: [
        {
          etiqueta: '(a) la corona',
          x: [-2.5, 2.5], y: [-2.5, 2.5], cuadrado: true,
          dibuja: (l) => {
            l.poli(corona, { clase: 'f', cerrar: true });
            l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2] });
            l.circunferencia(0, 0, 1, { clase: 'c' });
            l.circunferencia(0, 0, 2, { clase: 'c' });
          },
        },
        {
          etiqueta: '(b) el sector',
          x: [-2.5, 2.5], y: [-2.5, 2.5], cuadrado: true,
          dibuja: (l) => {
            l.poli([...arco(0, 0, 2, P / 4, P, 70), ...arco(0, 0, 1, P, P / 4, 70)], { clase: 'f', cerrar: true });
            l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2] });
            l.poli(arco(0, 0, 1, P / 4, P, 70), { clase: 'c' });
            l.poli(arco(0, 0, 2, P / 4, P, 70), { clase: 'c' });
            l.poli([[Math.SQRT1_2, Math.SQRT1_2], [Math.SQRT2, Math.SQRT2]], { clase: 'c' });
            l.poli([[-1, 0], [-2, 0]], { clase: 'c' });
            l.rotulo(1.6, 1.6, 'π/4', { dx: 4, dy: 2, pequeno: true });
          },
        },
        {
          etiqueta: 'en polares',
          x: [-1.1, 7.2], y: [-0.5, 2.6], cuadrado: false,
          dibuja: (l) => {
            l.poli([[0, 1], [2 * P, 1], [2 * P, 2], [0, 2]], { clase: 'f', cerrar: true });
            l.poli([[P / 4, 1], [P, 1], [P, 2], [P / 4, 2]], { clase: 'f2', cerrar: true });
            l.ejes({ nombreX: 'θ', nombreY: 'ρ', marcasX: [[P, 'π'], [2 * P, '2π']], marcasY: [1, 2] });
            l.poli([[0, 1], [2 * P, 1], [2 * P, 2], [0, 2]], { clase: 'c', cerrar: true });
            l.poli([[P / 4, 1], [P / 4, 2]], { clase: 'cp2' });
            l.poli([[P, 1], [P, 2]], { clase: 'cp2' });
          },
        },
      ],
    });
  });

/* ── 6 · de dónde sale el jacobiano de las polares ───────────────────── */

fig('de-donde-sale-el-jacobiano-de-las-polares',
  'El ρ no sale de una fórmula: sale del tamaño del trocito. Un rectangulito de lados dρ y dθ en el plano polar se convierte en un trozo de corona cuyos lados miden dρ y ρ·dθ, porque el arco es el radio por el ángulo. Su área es ρ dρ dθ.',
  () => {
    const r0 = 1.5, r1 = 2.35, t0 = 0.55, t1 = 0.95;
    const l = lienzo({
      id: 'f-jacobiano-polares',
      ancho: 330, alto: 275,
      x: [-0.4, 3.2], y: [-0.4, 3.2], cuadrado: true,
      titulo: 'El trocito elemental de las polares, con sus dos lados medidos',
      desc: 'Dos arcos de circunferencia concéntricos y dos radios recortan un trocito con forma '
        + 'de rectángulo curvado, sombreado. El lado que va en la dirección del radio está '
        + 'rotulado con d rho y el que va en la dirección del arco, con rho por d theta, porque '
        + 'la longitud de un arco es el radio por el ángulo. El área del trocito es por tanto '
        + 'rho por d rho por d theta, que es de donde sale el factor rho del cambio de variable. '
        + 'Con trazo fino se prolongan los dos radios y los dos arcos para situar el trocito.',
    });
    l.poli([...arco(0, 0, r0, t0, t1, 30), ...arco(0, 0, r1, t1, t0, 30)], { clase: 'f', cerrar: true });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2, 3] });
    l.poli(arco(0, 0, r0, 0, P / 2, 60), { clase: 'g' });
    l.poli(arco(0, 0, r1, 0, P / 2, 60), { clase: 'g' });
    l.poli([[0, 0], [3.1 * Math.cos(t0), 3.1 * Math.sin(t0)]], { clase: 'g' });
    l.poli([[0, 0], [3.1 * Math.cos(t1), 3.1 * Math.sin(t1)]], { clase: 'g' });
    l.poli(arco(0, 0, r0, t0, t1, 30), { clase: 'c' });
    l.poli(arco(0, 0, r1, t0, t1, 30), { clase: 'c' });
    l.poli([[r0 * Math.cos(t0), r0 * Math.sin(t0)], [r1 * Math.cos(t0), r1 * Math.sin(t0)]], { clase: 'c' });
    l.poli([[r0 * Math.cos(t1), r0 * Math.sin(t1)], [r1 * Math.cos(t1), r1 * Math.sin(t1)]], { clase: 'c' });
    l.rotulo(1.9 * Math.cos(t0), 1.9 * Math.sin(t0), 'dρ', { dx: 8, dy: 6, color: 'var(--alt)' });
    l.rotulo(r1 * Math.cos(0.75), r1 * Math.sin(0.75), 'ρ·dθ', { dx: 6, dy: -5, color: 'var(--alt)' });
    l.rotulo(0.62, 0.42, 'ρ', { dx: 2, dy: 6, pequeno: true });
    l.esquina(10, 17, 'área = ρ dρ dθ');
    return l.svg();
  });

/* ── 7 · los jacobianos de cilíndricas y esféricas ───────────────────── */

fig('de-donde-salen-los-jacobianos-de-cilindricas-y-esfericas',
  'El mismo argumento, una dimensión más arriba. En cilíndricas el trocito es el de las polares con una altura dz encima, así que el factor sigue siendo ρ. En esféricas hay dos arcos: uno de radio r y otro de radio r·sen φ —el del paralelo, que es más corto cuanto más cerca del polo—, y de ahí el r²·sen φ.',
  () => {
    const p3 = vista3d({ escalaXY: 1.15, inclinacion: 0.5 });
    return mosaico({
      id: 'f-jacobianos-3d',
      columnas: 2,
      ancho: 210,
      alto: 205,
      titulo: 'Los trocitos elementales de las coordenadas cilíndricas y de las esféricas',
      desc: 'Dos recuadros en perspectiva, cada uno con un bloque pequeño dibujado en grande y '
        + 'con todas sus aristas. En el primero, el trocito de las cilíndricas: el trozo de '
        + 'corona de las polares levantado una altura, de modo que sus tres aristas miden d rho '
        + 'en la dirección radial, rho por d theta en la dirección del arco y d zeta en '
        + 'vertical; las tres están rotuladas. En el segundo, el trocito de las esféricas: sus '
        + 'tres aristas miden d erre, erre por d fi y erre por el seno de fi por d theta. La '
        + 'tercera es la del paralelo, y se hace más corta cuanto más cerca del polo está el '
        + 'trocito: por eso aparece el seno de fi.',
      celdas: [
        {
          etiqueta: 'cilíndricas: J = ρ',
          x: [-3.2, 3.2], y: [-1.4, 4.4], cuadrado: true,
          dibuja: (l) => {
            const r0 = 1.3, r1 = 2.2, a0 = 0.28, a1 = 1.02, h = 1.5;
            const cil = (r, a, z) => p3(r * Math.cos(a), r * Math.sin(a), z);
            const tapa = (z) => [
              ...param((t) => cil(r0, t, z), a0, a1, 18),
              ...param((t) => cil(r1, t, z), a1, a0, 18),
            ];
            l.poli(tapa(h), { clase: 'f', cerrar: true });
            l.poli(tapa(0), { clase: 'c', cerrar: true });
            l.poli(tapa(h), { clase: 'c', cerrar: true });
            for (const a of [a0, a1]) for (const r of [r0, r1]) l.poli([cil(r, a, 0), cil(r, a, h)], { clase: 'c' });
            l.poli([p3(0, 0, 0), p3(0, 0, 3.2)], { clase: 'eje' });
            l.poli([p3(0, 0, 0), cil(r0, a0, 0)], { clase: 'g' });
            l.rotulo(...cil((r0 + r1) / 2, a0, 0), 'dρ', { dx: 4, dy: 14, color: 'var(--alt)' });
            l.rotulo(...cil(r1, (a0 + a1) / 2, 0), 'ρ·dθ', { dx: 6, dy: 8, color: 'var(--alt)' });
            l.rotulo(...cil(r1, a0, h / 2), 'dz', { dx: 7, dy: 4, color: 'var(--alt)' });
          },
        },
        {
          etiqueta: 'esféricas: J = r²senφ',
          x: [-3.6, 3.6], y: [-1.6, 4.8], cuadrado: true,
          dibuja: (l) => {
            const r0 = 1.35, r1 = 2.7, f0 = 0.46, f1 = 1.3, a0 = 0.05, a1 = 1.35;
            const esf = (r, f, a) => p3(r * Math.sin(f) * Math.cos(a), r * Math.sin(f) * Math.sin(a), r * Math.cos(f));
            const cara = (r) => [
              ...param((f) => esf(r, f, a0), f0, f1, 16),
              ...param((a) => esf(r, f1, a), a0, a1, 16),
              ...param((f) => esf(r, f, a1), f1, f0, 16),
              ...param((a) => esf(r, f0, a), a1, a0, 16),
            ];
            l.poli(cara(r1), { clase: 'f', cerrar: true });
            l.poli(cara(r0), { clase: 'c', cerrar: true });
            l.poli(cara(r1), { clase: 'c', cerrar: true });
            for (const f of [f0, f1]) for (const a of [a0, a1]) l.poli([esf(r0, f, a), esf(r1, f, a)], { clase: 'c' });
            l.poli([p3(0, 0, 0), p3(0, 0, 3.4)], { clase: 'eje' });
            l.poli([p3(0, 0, 0), esf(r0, f0, a0)], { clase: 'g' });
            l.rotulo(...esf((r0 + r1) / 2, f0, a0), 'dr', { dx: 7, dy: -4, color: 'var(--alt)' });
            l.rotulo(...esf(r1, (f0 + f1) / 2, a0), 'r·dφ', { dx: -7, dy: 2, anclaje: 'end', color: 'var(--alt)' });
            l.rotulo(...esf(r1, f1, (a0 + a1) / 2), 'r senφ·dθ', { dx: 0, dy: 17, anclaje: 'middle', color: 'var(--alt)' });
          },
        },
      ],
    });
  });

/* ── 8 · la campana de Gauss ─────────────────────────────────────────── */

fig('la-integral-de-gauss',
  'El truco es que I² es una integral doble sobre todo el plano, y en polares el integrando pasa a ser e^{−ρ²}·ρ, que sí tiene primitiva. La ρ que aparece por el jacobiano es exactamente la que faltaba: el problema se resuelve porque el cambio la regala.',
  () => {
    return mosaico({
      id: 'f-integral-gauss',
      columnas: 2,
      ancho: 210,
      alto: 175,
      titulo: 'La campana en una variable y el barrido en anillos de la campana en dos',
      desc: 'A la izquierda, la campana de e elevado a menos x al cuadrado, con toda la región '
        + 'bajo ella sombreada: su área es el número que se busca. A la derecha, el plano visto '
        + 'desde arriba, con varias circunferencias concéntricas que representan el barrido en '
        + 'coordenadas polares; una de ellas está resaltada y lleva rotulado el anillo elemental '
        + 'de anchura d rho y perímetro dos pi rho. Sobre él está escrito que el integrando pasa '
        + 'a ser e elevado a menos rho al cuadrado por rho, que sí tiene primitiva.',
      celdas: [
        {
          etiqueta: 'la campana e⁻ˣ²',
          x: [-3.4, 3.4], y: [-0.35, 1.35], cuadrado: false,
          dibuja: (l) => {
            const f = (x) => Math.exp(-x * x);
            l.poli([[-3.35, 0], ...param((x) => [x, f(x)], -3.35, 3.35, 120), [3.35, 0]], { clase: 'f', cerrar: true });
            l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-2, 2], marcasY: [1] });
            l.curva(f, [-3.35, 3.35], { clase: 'c', n: 140 });
            l.rotulo(0, 0.35, 'área = I', { dx: 0, dy: 0, anclaje: 'middle' });
          },
        },
        {
          etiqueta: 'en polares: anillos',
          x: [-2.6, 2.6], y: [-2.6, 2.6], cuadrado: true,
          dibuja: (l) => {
            l.poli([...arco(0, 0, 1.6, 0, 2 * P, 100), ...arco(0, 0, 1.25, 2 * P, 0, 100)], { clase: 'f2', cerrar: true });
            l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2] });
            for (const r of [0.5, 0.9, 1.25, 1.6, 2]) l.circunferencia(0, 0, r, { clase: 'g' });
            l.circunferencia(0, 0, 1.25, { clase: 'c' });
            l.circunferencia(0, 0, 1.6, { clase: 'c' });
            l.rotulo(0, 1.42, 'dρ', { dx: 6, dy: -5, color: 'var(--alt)', pequeno: true });
            l.esquina(6, 13, 'e^−ρ²·ρ sí se integra');
          },
        },
      ],
    });
  });

/* ── 9 · nueve integrales en polares ─────────────────────────────────── */

fig('nueve-integrales-en-polares',
  'Cuatro de los nueve recintos. Lo que hay que reconocer es siempre lo mismo: si el borde es una circunferencia centrada en el origen, ρ va entre constantes; si pasa por el origen, ρ depende de θ; y si es una elipse, hacen falta polares generalizadas.',
  () => {
    const celda = (etiqueta, dibuja, x, y) => ({ etiqueta, x, y, cuadrado: true, dibuja });
    return mosaico({
      id: 'f-nueve-en-polares',
      columnas: 2,
      ancho: 200,
      alto: 175,
      titulo: 'Cuatro de los recintos del ejercicio, con lo que cada uno pide',
      desc: 'Cuatro recuadros con regiones sombreadas. El primero es el círculo de radio uno '
        + 'centrado en el origen. El segundo es el semicírculo superior del mismo círculo. El '
        + 'tercero es un círculo que pasa por el origen y está desplazado hacia la derecha. El '
        + 'cuarto es el interior de una elipse más ancha que alta. En cada uno, una nota indica '
        + 'si rho va entre constantes, si depende del ángulo o si hacen falta polares '
        + 'generalizadas.',
      celdas: [
        celda('círculo: ρ de 0 a 1', (l) => {
          l.disco(0, 0, 1, { clase: 'f' });
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1] });
          l.circunferencia(0, 0, 1, { clase: 'c' });
        }, [-1.5, 1.5], [-1.5, 1.5]),
        celda('semicírculo: θ de 0 a π', (l) => {
          l.poli([[-1, 0], ...arco(0, 0, 1, 0, P, 70)], { clase: 'f', cerrar: true });
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-1, 1] });
          l.poli(arco(0, 0, 1, 0, P, 70), { clase: 'c' });
          l.poli([[-1, 0], [1, 0]], { clase: 'c' });
        }, [-1.5, 1.5], [-1.1, 1.5]),
        celda('pasa por 0: ρ = 2cos θ', (l) => {
          l.poli(arco(1, 0, 1, 0, 2 * P, 100), { clase: 'f', cerrar: true });
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2] });
          l.poli(arco(1, 0, 1, 0, 2 * P, 100), { clase: 'c', cerrar: true });
        }, [-0.6, 2.6], [-1.6, 1.6]),
        celda('elipse: generalizadas', (l) => {
          l.poli(param((t) => [1.9 * Math.cos(t), Math.sin(t)], 0, 2 * P, 110), { clase: 'f', cerrar: true });
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [[1.9, 'a']], marcasY: [[1, 'b']] });
          l.poli(param((t) => [1.9 * Math.cos(t), Math.sin(t)], 0, 2 * P, 110), { clase: 'c', cerrar: true });
        }, [-2.4, 2.4], [-1.5, 1.5]),
      ],
    });
  });

/* ── 10 · el sólido de una triple, y el otro orden ───────────────────── */

fig('el-solido-de-una-triple-y-el-otro-orden',
  'El enunciado pide dibujarlo, y aquí está: un prisma de base el rectángulo [0,1]×[0,3] al que se le pone por techo la parábola z = (x−2)², que sobre ese tramo baja de 4 a 1. El sólido es una cuña de techo curvo, y de ahí salen los límites del otro orden.',
  () => {
    const p3 = vista3d({ escalaXY: 1.15, inclinacion: 0.5 });
    const techo = (x) => (x - 2) ** 2;
    const l = lienzo({
      id: 'f-solido-triple-otro-orden',
      ancho: 330, alto: 265,
      x: [-4.4, 3.6], y: [-1.2, 6.4], cuadrado: false,
      titulo: 'El sólido que describe la integral triple, con su techo parabólico',
      desc: 'Una vista en perspectiva de un sólido apoyado en el suelo. Su base es un rectángulo '
        + 'que va de cero a uno en la dirección x y de cero a tres en la dirección y. Las '
        + 'paredes son verticales. El techo no es plano: es una superficie curvada que sobre '
        + 'x igual a cero está a altura cuatro y sobre x igual a uno, a altura uno, siguiendo la '
        + 'parábola z igual a x menos dos al cuadrado. Los tres ejes salen del origen y están '
        + 'rotulados.',
    });
    const borde = (y) => param((x) => p3(x, y, techo(x)), 0, 1, 24);
    l.poli([...borde(0), ...param((x) => p3(x, 3, techo(x)), 1, 0, 24)], { clase: 'f', cerrar: true });
    l.poli([p3(0, 0, 0), p3(1, 0, 0), p3(1, 3, 0), p3(0, 3, 0)], { clase: 'g', cerrar: true });
    l.poli([...borde(0), p3(1, 0, 0), p3(0, 0, 0)], { clase: 'c', cerrar: true });
    l.poli([...borde(3), p3(1, 3, 0), p3(0, 3, 0)], { clase: 'c', cerrar: true });
    l.poli([p3(0, 0, 4), p3(0, 3, 4)], { clase: 'c' });
    l.poli([p3(1, 0, 1), p3(1, 3, 1)], { clase: 'c' });
    l.poli([p3(0, 0, 0), p3(1.9, 0, 0)], { clase: 'eje' });
    l.poli([p3(0, 0, 0), p3(0, 3.9, 0)], { clase: 'eje' });
    l.poli([p3(0, 0, 0), p3(0, 0, 5)], { clase: 'eje' });
    l.rotulo(...p3(1.9, 0, 0), 'x', { dx: 4, dy: 10, color: 'var(--faint)', pequeno: true });
    l.rotulo(...p3(0, 3.9, 0), 'y', { dx: -9, dy: 10, color: 'var(--faint)', pequeno: true });
    l.rotulo(...p3(0, 0, 5), 'z', { dx: 5, dy: 2, color: 'var(--faint)', pequeno: true });
    l.rotulo(...p3(0, 0, 4), '4', { dx: -7, dy: 3, anclaje: 'end', color: 'var(--flag)' });
    l.rotulo(...p3(1, 0, 1), '1', { dx: 6, dy: 3, color: 'var(--flag)' });
    l.esquina(10, 17, 'techo: z = (x−2)²');
    return l.svg();
  });

/* ── a pegar ─────────────────────────────────────────────────────────── */
for (const f of figuras) f.svg = f.hacer();

if (process.argv[1]?.endsWith('calculo-practica-t07-recintos.mjs')) {
  for (const f of figuras) pegaEnCampo(f.fichero, f.id, f.campo, f.svg, f.pie);
  console.log(`${figuras.length} figuras de recintos pegadas en ${FICHERO}`);
}
