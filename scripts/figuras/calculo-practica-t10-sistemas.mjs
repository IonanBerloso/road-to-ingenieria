/**
 * Las figuras de las prácticas del tema 10 que no van del tiempo: los sistemas
 * y las bolas que ruedan.
 *
 * Los tres de la bola no son de Laplace —son de gradiente, y están en este
 * fichero del boletín por cómo viene repartido el temario—, pero son los más
 * geométricos de todo el tema: «se suelta una bola y rueda hasta el plano XY»
 * es una curva concreta sobre un mapa de niveles, y se dibuja.
 *
 * Los sistemas sí son de Laplace, y su dibujo natural no es x frente a t sino
 * el **plano de fases**: la trayectoria que el punto (x,y) describe. Ahí se ve
 * de un vistazo si la solución gira, se escapa o se muere, que es lo que las
 * fórmulas con exponenciales y senos esconden.
 *
 *     node scripts/figuras/calculo-practica-t10-sistemas.mjs
 */

import { lienzo, mosaico } from './lienzo.mjs';
import { pegaEnCampo } from './pegar.mjs';

export const FICHERO = 'src/content/calculo/t10-laplace/ejercicios.yaml';

export const figuras = [];
const fig = (id, pie, hacer) =>
  figuras.push({ fichero: FICHERO, id, campo: 'resolucion', pie, hacer });

const param = (f, a, b, n = 200) =>
  Array.from({ length: n + 1 }, (_, k) => f(a + ((b - a) * k) / n));

/* ── 1 · la bola que rueda por la superficie ─────────────────────────── */

fig('la-bola-que-rueda',
  'El mapa de niveles de la superficie y la trayectoria de la bola encima. Baja siempre perpendicular a las curvas de nivel, que es lo que quiere decir «máxima pendiente», y esa condición da y = x². Toca el suelo donde esa parábola corta al nivel z = 0.',
  () => {
    /* z = 5 − x²/2 − y²; los niveles son elipses de semiejes √(2(5−z)) y
       √(5−z). La bola sigue y = x², que es la curva ortogonal a todas. */
    const elipse = (z) => param((t) => {
      const a = Math.sqrt(2 * (5 - z)), b = Math.sqrt(5 - z);
      return [a * Math.cos(t), b * Math.sin(t)];
    }, 0, 2 * Math.PI, 140);
    const l = lienzo({
      id: 'f-bola-rueda',
      ancho: 330, alto: 265,
      x: [-3.6, 3.6], y: [-2.6, 2.9], cuadrado: true,
      titulo: 'El mapa de niveles de la superficie y la trayectoria de máxima pendiente de la bola',
      desc: 'Varias elipses concéntricas centradas en el origen, más anchas que altas, son las '
        + 'curvas de nivel de la superficie: la más pequeña corresponde a la altura mayor y la '
        + 'más grande, a la altura cero. Desde el punto de coordenadas uno y uno sale una curva '
        + 'con forma de parábola que se aleja del centro cortando todas las elipses en ángulo '
        + 'recto, y acaba en un punto marcado sobre la elipse exterior, de coordenadas raíz de '
        + 'dos y dos: es donde la bola llega al suelo.',
    });
    for (const z of [4, 3, 2, 1]) l.poli(elipse(z), { clase: 'g', cerrar: true });
    l.poli(elipse(0), { clase: 'cp2', cerrar: true });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2, 3], marcasY: [1, 2] });
    l.poli(param((x) => [x, x * x], 0, Math.SQRT2, 80), { clase: 'c' });
    l.punto(1, 1, { clase: 'o', r: 4.6 });
    l.punto(Math.SQRT2, 2, { clase: 'o', r: 4.6 });
    l.rotulo(1, 1, 'P', { dx: 8, dy: 4, color: 'var(--flag)' });
    l.rotulo(Math.SQRT2, 2, 'S(√2, 2)', { dx: 8, dy: -4, color: 'var(--flag)' });
    l.rotulo(-2.6, -1.35, 'z = 0', { dx: 0, dy: 0, anclaje: 'middle', color: 'var(--alt)', pequeno: true });
    l.esquina(10, 17, 'corta los niveles en ángulo recto');
    return l.svg();
  });

/* ── 2 · por dónde bajaría una bola en una silla de montar ───────────── */

fig('dos-trayectorias-de-maxima-pendiente',
  'En una silla de montar la bola no baja «hacia el centro»: huye de él por el valle. Las dos trayectorias, y = 1/√x y y = −√3/√x, son hipérbolas que se pegan al eje x, que es la dirección en la que la superficie baja.',
  () => {
    /* z = y² − 2x²: los niveles son hipérbolas. Las de máxima pendiente son
       y = C/√x, ortogonales a ellas. */
    const nivel = (c) => {
      /* y² − 2x² = c  ⟹  y = ±√(c + 2x²) */
      const p = [];
      for (let i = 0; i <= 120; i++) {
        const x = 0.05 + (3.2 * i) / 120;
        const v = c + 2 * x * x;
        if (v < 0) continue;
        p.push([x, Math.sqrt(v)]);
      }
      return p;
    };
    const l = lienzo({
      id: 'f-maxima-pendiente-silla',
      ancho: 330, alto: 265,
      x: [0, 3.5], y: [-2.6, 2.9], cuadrado: true,
      titulo: 'Las curvas de nivel de la silla de montar y las dos trayectorias de máxima pendiente',
      desc: 'En el semiplano de las x positivas, varias hipérbolas abiertas hacia arriba y hacia '
        + 'abajo son las curvas de nivel de la superficie. Cruzándolas en ángulo recto, dos '
        + 'curvas que bajan hacia el eje horizontal sin llegar a tocarlo: la de arriba parte del '
        + 'punto uno coma uno y la de abajo del punto tres coma menos uno. Las dos se van '
        + 'aplanando hacia la derecha, porque es hacia donde la superficie desciende.',
    });
    for (const c of [-4, -1.5, 1.5, 4]) {
      const arriba = nivel(c).filter(([u, v]) => v <= 2.85 && u <= 3.45);
      if (arriba.length > 1) {
        l.poli(arriba, { clase: 'g' });
        l.poli(arriba.map(([u, v]) => [u, -v]).filter(([, v]) => v >= -2.55), { clase: 'g' });
      }
    }
    l.ejes({ nombreX: 'x', nombreY: 'y', enY: 0.02, marcasX: [1, 2, 3], marcasY: [1, 2] });
    l.poli(param((x) => [x, 1 / Math.sqrt(x)], 0.16, 3.45, 120), { clase: 'c' });
    l.poli(param((x) => [x, -Math.sqrt(3) / Math.sqrt(x)], 0.5, 3.45, 120), { clase: 'c2' });
    l.punto(1, 1, { clase: 'o', r: 4.4 });
    l.punto(3, -1, { clase: 'o', r: 4.4 });
    l.rotulo(1, 1, '(1,1)', { dx: 8, dy: -3, color: 'var(--flag)' });
    l.rotulo(3, -1, '(3,−1)', { dx: 6, dy: 14, anclaje: 'end', color: 'var(--flag)' });
    return l.svg();
  });

/* ── 3 · una bola que rueda por una loma, y dónde para ───────────────── */

fig('la-bola-en-la-loma-elipsoidal',
  'Aquí los niveles son circunferencias centradas en (0,−1), y la máxima pendiente se aleja del centro en línea recta: la trayectoria es y = 2x − 1. Para donde esa recta corta al nivel del suelo, en (2,05 ; 3,10).',
  () => {
    /* F = −0,1(y²+2y+x²)+2 ⟹ los niveles son x² + (y+1)² = 21 − 10z. */
    const aro = (r) => param((t) => [r * Math.cos(t), -1 + r * Math.sin(t)], 0, 2 * Math.PI, 140);
    const l = lienzo({
      id: 'f-bola-loma',
      ancho: 330, alto: 275,
      x: [-4.9, 4.9], y: [-6.4, 4.4], cuadrado: true,
      titulo: 'Los niveles circulares de la loma y la trayectoria recta de la bola',
      desc: 'Varias circunferencias concéntricas centradas en el punto de coordenadas cero y '
        + 'menos uno son las curvas de nivel de la loma: la más pequeña es la cima y la más '
        + 'grande, dibujada a trazos, es el nivel del suelo. Desde el centro sale una recta que '
        + 'pasa por el punto uno coma uno y llega hasta la circunferencia exterior; ahí acaba, '
        + 'en un punto marcado de coordenadas dos coma cero cinco y tres coma diez. La recta es '
        + 'radial, es decir, corta todas las circunferencias en ángulo recto.',
    });
    for (const r of [1.5, 2.4, 3.3]) l.poli(aro(r), { clase: 'g', cerrar: true });
    l.poli(aro(Math.sqrt(21)), { clase: 'cp2', cerrar: true });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [2, 4], marcasY: [[-1, '−1'], [3, '3']] });
    l.poli([[0, -1], [2.0494, 3.0988]], { clase: 'c' });
    l.punto(0, -1, { r: 3.6 });
    l.punto(1, 1, { clase: 'o', r: 4.4 });
    l.punto(2.0494, 3.0988, { clase: 'o', r: 4.8 });
    l.rotulo(1, 1, 'P(1,1)', { dx: 8, dy: 4, color: 'var(--flag)' });
    l.rotulo(2.0494, 3.0988, 'S', { dx: 8, dy: -4, color: 'var(--flag)' });
    l.rotulo(-3.2, -4.2, 'el suelo', { dx: 0, dy: 0, anclaje: 'middle', color: 'var(--alt)', pequeno: true });
    l.esquina(10, 17, 'y = 2x − 1');
    return l.svg();
  });

/* ── 4 · un sistema cuya solución gira ───────────────────────────────── */

fig('sistema-que-sale-en-espiral',
  'Las raíces son 1 ± 2i: la parte imaginaria hace girar y la real, que es positiva, hace que cada vuelta sea más ancha que la anterior. Por eso la trayectoria es una espiral que se escapa, y el origen es un punto de equilibrio inestable.',
  () => {
    const c = (t) => [Math.exp(t) * Math.cos(2 * t), -Math.exp(t) * Math.sin(2 * t)];
    return mosaico({
      id: 'f-espiral-sistema',
      columnas: 2,
      ancho: 205,
      alto: 200,
      titulo: 'La trayectoria en el plano de fases y las dos componentes en función del tiempo',
      desc: 'A la izquierda, el plano donde se representa y frente a x: la trayectoria sale del '
        + 'punto uno coma cero, gira alrededor del origen en sentido horario y cada vuelta la '
        + 'da más lejos, dibujando una espiral que se abre. El origen está marcado y de él no '
        + 'sale ni entra nada: es el equilibrio, y es inestable. A la derecha, las dos '
        + 'componentes en función del tiempo: las dos oscilan con amplitud creciente, y una va '
        + 'adelantada respecto de la otra.',
      celdas: [
        {
          etiqueta: 'el plano de fases',
          x: [-26, 26], y: [-26, 26], cuadrado: true,
          dibuja: (l) => {
            /* Solo cabe una vuelta larga, y esa es la lección: como el radio
               va con eᵗ y una vuelta tarda π, cada vuelta sale e^π ≈ 23 veces
               más ancha que la anterior. La segunda no cabría en el papel. */
            l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [20], marcasY: [20] });
            l.poli(param(c, 0, 3.25, 400).filter(([u, v]) => Math.hypot(u, v) <= 25), { clase: 'c' });
            l.punto(1, 0, { clase: 'o', r: 4 });
            l.punto(0, 0, { r: 3.4 });
            l.flecha(c(2.4), c(2.5), { clase: 'c' });
            l.esquina(6, 13, 'cada vuelta, ×e^π');
          },
        },
        {
          etiqueta: 'x(t) e y(t)',
          x: [-0.15, 2.2], y: [-7, 7], cuadrado: false,
          dibuja: (l) => {
            l.ejes({ nombreX: 't', nombreY: '', marcasX: [1, 2], marcasY: [5] });
            l.curva((t) => Math.exp(t) * Math.cos(2 * t), [0, 2.15], { clase: 'c', n: 200 });
            l.curva((t) => -Math.exp(t) * Math.sin(2 * t), [0, 2.15], { clase: 'c2', n: 200 });
            l.rotulo(0.2, Math.exp(0.2) * Math.cos(0.4), 'x', { dx: 6, dy: -4 });
            l.rotulo(0.55, -Math.exp(0.55) * Math.sin(1.1), 'y', { dx: 6, dy: 10, color: 'var(--alt)' });
          },
        },
      ],
    });
  });

/* ── 5 · un sistema de dos EDOs ──────────────────────────────────────── */

fig('sistema-de-edos-con-laplace',
  'La solución es x = t + eᵗ e y = 1 − eᵗ, y su suma vale t + 1 exactamente: las dos exponenciales se cancelan. Eso se ve en el dibujo —las dos curvas se separan simétricamente de la recta— y sirve de comprobación rápida del resultado.',
  () => {
    const l = lienzo({
      id: 'f-sistema-dos-edos',
      ancho: 335, alto: 250,
      x: [-0.25, 2.2], y: [-7.5, 10], cuadrado: false,
      titulo: 'Las dos componentes del sistema y la recta que suman entre las dos',
      desc: 'Dos curvas parten del eje vertical, una de la altura uno y otra del cero, y se '
        + 'separan: la de arriba crece cada vez más deprisa y la de abajo baja con la misma '
        + 'forma invertida. Entre las dos, una recta de puntos que sube suavemente: es la suma '
        + 'de ambas, que vale t más uno, y se mantiene recta porque las exponenciales de las dos '
        + 'curvas se cancelan al sumarlas.',
    });
    l.ejes({ nombreX: 't', nombreY: '', marcasX: [1, 2], marcasY: [[5, '5'], [-5, '−5']] });
    l.curva((t) => t + Math.exp(t), [0, 2.15], { clase: 'c', n: 90 });
    l.curva((t) => 1 - Math.exp(t), [0, 2.15], { clase: 'c2', n: 90 });
    l.curva((t) => t + 1, [0, 2.15], { clase: 'cp' });
    l.punto(0, 1, { clase: 'o', r: 4 });
    l.punto(0, 0, { clase: 'o', r: 4 });
    l.rotulo(1.6, 1.6 + Math.exp(1.6), 'x = t + eᵗ', { dx: -6, dy: 4, anclaje: 'end' });
    l.rotulo(1.6, 1 - Math.exp(1.6), 'y = 1 − eᵗ', { dx: -6, dy: 4, anclaje: 'end', color: 'var(--alt)' });
    l.rotulo(2.05, 3.05, 'x + y = t + 1', { dx: -4, dy: -7, anclaje: 'end' });
    return l.svg();
  });

/* ── 6 · una ecuación integral, y la convolución ─────────────────────── */

fig('ecuacion-integral-convolucion',
  'La solución es t + t³/6, y el dibujo enseña de dónde sale cada sumando: la recta es el término que ya estaba en el enunciado y la cúbica es lo que la integral va añadiendo. Al principio casi no se nota; a partir de t = 2 manda ella.',
  () => {
    const l = lienzo({
      id: 'f-integral-convolucion',
      ancho: 330, alto: 245,
      x: [-0.3, 3.4], y: [-0.9, 10], cuadrado: false,
      titulo: 'La solución de la ecuación integral y sus dos sumandos por separado',
      desc: 'Tres curvas. Una recta que sube despacio es el sumando t. Una curva que arranca '
        + 'pegada al eje y luego se dispara es el sumando t al cubo partido por seis. La suma de '
        + 'las dos, con trazo grueso, va pegada a la recta al principio y se despega cada vez '
        + 'más según avanza. Un punto marca el instante t igual a dos, donde los dos sumandos '
        + 'valen lo mismo y a partir del cual manda el cúbico.',
    });
    l.ejes({ nombreX: 't', nombreY: 'y', marcasX: [1, 2, 3], marcasY: [5] });
    l.curva((t) => t, [0, 3.35], { clase: 'g', n: 2 });
    l.curva((t) => t ** 3 / 6, [0, 3.35], { clase: 'g', n: 80 });
    l.curva((t) => t + t ** 3 / 6, [0, 3.35], { clase: 'c', n: 90 });
    l.punto(2, 2 + 8 / 6, { clase: 'o', r: 4.2 });
    l.rotulo(3.1, 3.1, 't', { dx: -6, dy: 12, anclaje: 'end', color: 'var(--faint)' });
    l.rotulo(2.75, 2.75 ** 3 / 6, 't³/6', { dx: -6, dy: 12, anclaje: 'end', color: 'var(--faint)' });
    l.rotulo(2, 2 + 8 / 6, 'aquí se igualan', { dx: -8, dy: 2, anclaje: 'end', color: 'var(--flag)' });
    return l.svg();
  });

/* ── 7 · una ecuación integral cuya solución es un seno ──────────────── */

fig('ecuacion-integral-que-da-un-seno',
  'El resultado sorprende porque el enunciado no tiene nada periódico: solo una t y una integral. Pero la convolución con (t−z) divide por s², y eso convierte 1/s² en 1/(s²+1), que es exactamente el seno. Así que sí, la solución oscila para siempre.',
  () => {
    const l = lienzo({
      id: 'f-integral-seno',
      ancho: 340, alto: 220,
      x: [-0.4, 11], y: [-1.6, 1.9], cuadrado: false,
      titulo: 'La solución de la ecuación integral, que resulta ser el seno',
      desc: 'Una onda que sale del origen, sube hasta uno, baja hasta menos uno y sigue '
        + 'oscilando sin apagarse ni crecer a lo largo de todo el dibujo: es la función seno. '
        + 'Con trazo fino se dibuja también la recta y igual a t, que es el término del '
        + 'enunciado, para ver que las dos coinciden solo cerca del origen y se separan en '
        + 'seguida.',
    });
    l.ejes({ nombreX: 't', nombreY: 'y', marcasX: [[Math.PI, 'π'], [2 * Math.PI, '2π'], [3 * Math.PI, '3π']], marcasY: [1] });
    l.curva((t) => t, [0, 1.85], { clase: 'g', n: 2 });
    l.curva(Math.sin, [-0.35, 10.9], { clase: 'c', n: 220 });
    l.rotulo(1.85, 1.85, 'y = t', { dx: 5, dy: 0, color: 'var(--faint)', pequeno: true });
    l.rotulo(Math.PI / 2, 1, 'y = sen t', { dx: 8, dy: -5 });
    return l.svg();
  });

/* ── 8 · una EDO y dos sistemas ──────────────────────────────────────── */

fig('tres-problemas-con-laplace',
  'El apartado (a) tiene raíces −1 ± √3 i, y eso se lee entero en el dibujo: la parte real negativa hace que la envolvente se cierre y la imaginaria pone la frecuencia. La solución oscila y se muere, que es el comportamiento típico de un sistema amortiguado.',
  () => {
    /* y'' + 2y' + 4y = 0 con y(0)=1, y'(0)=1: raíces −1 ± √3 i. */
    const w = Math.sqrt(3);
    const y = (t) => Math.exp(-t) * (Math.cos(w * t) + (2 / w) * Math.sin(w * t));
    const l = lienzo({
      id: 'f-tres-laplace',
      ancho: 335, alto: 235,
      x: [-0.3, 6.4], y: [-1.8, 1.9], cuadrado: false,
      titulo: 'La solución del apartado a, una oscilación amortiguada',
      desc: 'Una onda que empieza en la altura uno, sube un poco más, y a partir de ahí va '
        + 'oscilando con amplitud cada vez menor hasta quedar casi pegada al eje horizontal al '
        + 'final del dibujo. Dos curvas finas la envuelven por arriba y por abajo, cerrándose '
        + 'hacia el eje: son la exponencial de exponente menos uno y su simétrica, y son las que '
        + 'marcan el ritmo al que la oscilación se apaga.',
    });
    l.ejes({ nombreX: 't', nombreY: 'y', marcasX: [2, 4, 6], marcasY: [1] });
    const A = Math.hypot(1, 2 / w);
    l.curva((t) => A * Math.exp(-t), [0, 6.35], { clase: 'g', n: 90 });
    l.curva((t) => -A * Math.exp(-t), [0, 6.35], { clase: 'g', n: 90 });
    l.curva(y, [0, 6.35], { clase: 'c', n: 260 });
    l.punto(0, 1, { clase: 'o', r: 4.2 });
    l.rotulo(0, 1, 'y(0) = 1', { dx: 8, dy: -4, color: 'var(--flag)' });
    l.esquina(10, 17, 'raíces −1 ± √3 i: oscila y se apaga');
    return l.svg();
  });

/* ── a pegar ─────────────────────────────────────────────────────────── */
for (const f of figuras) f.svg = f.hacer();

if (process.argv[1]?.endsWith('calculo-practica-t10-sistemas.mjs')) {
  for (const f of figuras) pegaEnCampo(f.fichero, f.id, f.campo, f.svg, f.pie);
  console.log(`${figuras.length} figuras de sistemas pegadas en ${FICHERO}`);
}
