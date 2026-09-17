/**
 * Las seis figuras de los ejemplos de entrada del tema 9.
 *
 * Uno de ellos, `ej-clasificar-cuatro-edos`, lleva un diagrama y no una
 * gráfica: lo que enseña no es una curva sino un orden de preguntas, y ese
 * orden es exactamente lo que hay que tener en la cabeza al abrir el examen.
 * Dibujarlo como diagrama no es decorarlo — es el único formato en el que un
 * método se puede mirar entero de una vez.
 *
 *     node scripts/figuras/calculo-ejemplos-t09.mjs
 */

import { lienzo } from './lienzo.mjs';
import { pegaEnCampo } from './pegar.mjs';

export const FICHERO = 'src/content/calculo/t09-ecuaciones-diferenciales/ejercicios.yaml';

export const figuras = [];
const fig = (id, pie, hacer) =>
  figuras.push({ fichero: FICHERO, id, campo: 'resolucion', pie, hacer });

/* ── 1 · la primera EDO, separando variables ─────────────────────────── */

fig('ej-separable-basica',
  'La solución general es y = K·e^{x²}, una campana invertida por cada K, y la condición y(0) = 5 elige la que pasa por ahí. Fíjate en que ninguna cruza al eje: si K es positivo la curva se queda arriba para siempre, porque y = 0 también es solución.',
  () => {
    const y = (K) => (x) => K * Math.exp(x * x);
    const l = lienzo({
      id: 'f-ej-separable-basica',
      ancho: 330, alto: 250,
      x: [-1.5, 1.5], y: [-1.5, 13], cuadrado: false,
      titulo: 'Varias soluciones de y prima igual a dos x y, con la que pasa por cero coma cinco resaltada',
      desc: 'Varias curvas con forma de uve muy abierta y fondo redondeado, todas simétricas '
        + 'respecto del eje vertical y encajadas unas dentro de otras. La de trazo grueso pasa '
        + 'por el punto de altura cinco sobre el eje vertical, que está marcado. Por debajo hay '
        + 'otras dos más planas y por encima una más empinada. Ninguna toca el eje horizontal, '
        + 'porque la recta y igual a cero es también solución de la ecuación y las soluciones no '
        + 'se cruzan.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-1, 1], marcasY: [5, 10] });
    for (const K of [1, 2.5, 8]) {
      const p = [];
      for (let i = 0; i <= 120; i++) {
        const x = -1.45 + (2.9 * i) / 120;
        const v = y(K)(x);
        if (v > 12.8) { if (p.length) break; continue; }
        p.push([x, v]);
      }
      l.poli(p, { clase: 'g' });
    }
    const p5 = [];
    for (let i = 0; i <= 120; i++) {
      const x = -1.45 + (2.9 * i) / 120;
      const v = y(5)(x);
      if (v <= 12.8) p5.push([x, v]);
    }
    l.poli(p5, { clase: 'c' });
    l.punto(0, 5, { clase: 'o', r: 4.8 });
    l.rotulo(0, 5, 'y(0) = 5', { dx: 8, dy: 4, color: 'var(--flag)' });
    l.esquina(10, 17, 'y = 0 también es solución');
    return l.svg();
  });

/* ── 2 · clasificar antes de resolver ────────────────────────────────── */

fig('ej-clasificar-cuatro-edos',
  'El orden de las preguntas importa: se empieza por la más barata de comprobar y se baja. Casi todas las EDOs de primer orden del boletín caen en una de estas cuatro casillas, y el método sale de la casilla, no de la ecuación.',
  () => {
    const l = lienzo({
      id: 'f-ej-clasificar-edos',
      ancho: 340, alto: 275,
      x: [0, 10], y: [0, 8], cuadrado: false,
      titulo: 'El orden de preguntas para clasificar una ecuación diferencial de primer orden',
      desc: 'Un diagrama en cascada con cuatro preguntas encadenadas, una debajo de otra. La '
        + 'primera: ¿se pueden separar las variables? Si la respuesta es sí, a la derecha sale '
        + 'la etiqueta separable. Si no, se baja a la siguiente: ¿todo depende solo del cociente '
        + 'y partido por x? Si sí, homogénea. Si no: ¿tiene la forma y prima más P por y igual a '
        + 'Q? Si sí, lineal. Y por último: ¿coinciden las derivadas cruzadas de M y de N? Si sí, '
        + 'exacta, y si no, hay que buscar un factor integrante.',
    });
    const preguntas = [
      ['¿se separan?', 'separable'],
      ['¿todo va en y/x?', 'homogénea'],
      ['¿y′ + P y = Q?', 'lineal'],
      ['¿Mᵧ = Nₓ?', 'exacta'],
    ];
    preguntas.forEach(([q, r], i) => {
      const y = 7 - i * 1.75;
      l.poli([[0.3, y - 0.55], [4.6, y - 0.55], [4.6, y + 0.55], [0.3, y + 0.55]], { clase: 'f', cerrar: true });
      l.poli([[0.3, y - 0.55], [4.6, y - 0.55], [4.6, y + 0.55], [0.3, y + 0.55]], { clase: 'c', cerrar: true });
      l.rotulo(2.45, y, q, { dx: 0, dy: 4, anclaje: 'middle' });
      l.flecha([4.7, y], [6.1, y], { clase: 'c2', color: 'var(--alt)', punta: 6 });
      l.rotulo(5.4, y, 'sí', { dx: 0, dy: -7, anclaje: 'middle', color: 'var(--faint)', pequeno: true });
      l.poli([[6.2, y - 0.5], [9.8, y - 0.5], [9.8, y + 0.5], [6.2, y + 0.5]], { clase: 'f2', cerrar: true });
      l.rotulo(8, y, r, { dx: 0, dy: 4, anclaje: 'middle', color: 'var(--alt)' });
      if (i < 3) {
        l.flecha([2.45, y - 0.6], [2.45, y - 1.15], { clase: 'c', punta: 6 });
        l.rotulo(2.45, y - 0.9, 'no', { dx: 6, dy: 3, color: 'var(--faint)', pequeno: true });
      }
    });
    l.rotulo(3.05, 0.55, 'ninguna: factor integrante', { dx: 0, dy: 4, anclaje: 'middle', pequeno: true });
    l.flecha([2.45, 1.12], [2.45, 0.9], { clase: 'c', punta: 6 });
    l.rotulo(2.45, 1.0, 'no', { dx: 6, dy: 3, color: 'var(--faint)', pequeno: true });
    return l.svg();
  });

/* ── 3 · la lineal, y el factor que la hace integrable ───────────────── */

fig('ej-lineal-con-factor-integrante',
  'La solución tiene dos piezas que se leen por separado: el 3 es el régimen permanente —donde se queda— y el −2e^{−2x} es el transitorio, que se apaga. Cambiar la condición inicial cambia el transitorio y no toca el 3: por eso todas acaban igual.',
  () => {
    const y = (K) => (x) => 3 + K * Math.exp(-2 * x);
    const l = lienzo({
      id: 'f-ej-lineal-factor',
      ancho: 330, alto: 240,
      x: [-0.35, 3.4], y: [-0.7, 6.4], cuadrado: false,
      titulo: 'Varias soluciones de la lineal, todas acercándose al valor tres',
      desc: 'Una línea horizontal de puntos marca la altura tres. Cuatro curvas salen de alturas '
        + 'iniciales distintas, dos por encima y dos por debajo, y todas se pegan a esa línea en '
        + 'menos de dos unidades de x. La que arranca en la altura uno está resaltada con trazo '
        + 'grueso y lleva su punto de partida marcado: es la que cumple la condición del '
        + 'enunciado.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2, 3], marcasY: [3] });
    l.poli([[-0.35, 3], [3.4, 3]], { clase: 'cp2' });
    for (const K of [3, 1.5, -3]) l.curva(y(K), [0, 3.35], { clase: 'g', n: 90 });
    l.curva(y(-2), [0, 3.35], { clase: 'c', n: 90 });
    l.punto(0, 1, { clase: 'o', r: 4.6 });
    l.rotulo(0, 1, 'y(0) = 1', { dx: 8, dy: 4, color: 'var(--flag)' });
    l.rotulo(2.9, 3, 'el permanente: 3', { dx: 0, dy: -9, anclaje: 'end', color: 'var(--alt)' });
    return l.svg();
  });

/* ── 4 · segundo orden, con dos raíces ───────────────────────────────── */

fig('ej-segundo-orden-dos-raices',
  'Las dos raíces, 2 y 3, dan dos soluciones básicas, y la general es cualquier combinación de las dos. Como las dos crecen, toda solución crece; y como e^{3x} crece más deprisa, es la que acaba mandando por muy pequeño que sea su coeficiente.',
  () => {
    const l = lienzo({
      id: 'f-ej-dos-raices',
      ancho: 330, alto: 245,
      x: [-1.4, 1.5], y: [-2, 16], cuadrado: false,
      titulo: 'Las dos soluciones básicas y una combinación de ellas',
      desc: 'Tres curvas crecientes salen de la parte izquierda pegadas al eje horizontal y se '
        + 'separan hacia arriba según avanzan. La más lenta es e elevado a dos x, la más rápida '
        + 'e elevado a tres x, y entre ellas, con trazo grueso, una combinación de las dos que '
        + 'empieza pareciéndose a la primera y acaba pareciéndose a la segunda.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-1, 1], marcasY: [5, 10, 15] });
    const recorta = (f) => {
      const p = [];
      for (let i = 0; i <= 140; i++) {
        const x = -1.35 + (2.8 * i) / 140;
        const v = f(x);
        if (v > 15.8) break;
        p.push([x, v]);
      }
      return p;
    };
    l.poli(recorta((x) => Math.exp(2 * x)), { clase: 'g' });
    l.poli(recorta((x) => Math.exp(3 * x)), { clase: 'g' });
    l.poli(recorta((x) => 1.4 * Math.exp(2 * x) + 0.35 * Math.exp(3 * x)), { clase: 'c' });
    l.rotulo(1.05, Math.exp(2.1), 'e²ˣ', { dx: 7, dy: 4, color: 'var(--faint)' });
    l.rotulo(0.72, Math.exp(2.16), 'e³ˣ', { dx: -7, dy: -4, anclaje: 'end', color: 'var(--faint)' });
    l.rotulo(0.25, 1.4 * Math.exp(0.5) + 0.35 * Math.exp(0.75), 'C₁e²ˣ + C₂e³ˣ', { dx: -7, dy: 12, anclaje: 'end' });
    return l.svg();
  });

/* ── 5 · la particular, cuando el segundo miembro no resuena ─────────── */

fig('ej-particular-sin-resonancia',
  'e^{2x} no es solución de la homogénea —lo son e^{x} y e^{−x}—, así que no hay resonancia y la particular se puede buscar de la misma forma que el segundo miembro: A·e^{2x}. Si hubiera coincidido con una de las dos, habría hecho falta una x delante.',
  () => {
    const l = lienzo({
      id: 'f-ej-particular-sin-resonancia',
      ancho: 335, alto: 245,
      x: [-1.6, 1.5], y: [-1, 14], cuadrado: false,
      titulo: 'Las dos soluciones de la homogénea y la particular, que no coincide con ninguna',
      desc: 'Tres curvas. Dos de ellas, con trazo fino, son las soluciones de la ecuación '
        + 'homogénea: una crece hacia la derecha y la otra decrece, cruzándose en el punto de '
        + 'altura uno sobre el eje vertical. La tercera, con trazo grueso, es la solución '
        + 'particular, y crece más deprisa que las dos: es claramente distinta de ambas, y por '
        + 'eso el método de coeficientes indeterminados funciona sin correcciones.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-1, 1], marcasY: [5, 10] });
    const recorta = (f, a, b) => {
      const p = [];
      for (let i = 0; i <= 140; i++) {
        const x = a + ((b - a) * i) / 140;
        const v = f(x);
        if (v > 13.6) break;
        p.push([x, v]);
      }
      return p;
    };
    l.poli(recorta(Math.exp, -1.55, 1.45), { clase: 'g' });
    l.poli(recorta((x) => Math.exp(-x), -1.55, 1.45), { clase: 'g' });
    l.poli(recorta((x) => Math.exp(2 * x), -1.55, 1.45), { clase: 'c' });
    l.punto(0, 1, { r: 3.6 });
    l.rotulo(1.35, Math.exp(1.35), 'eˣ', { dx: 6, dy: 4, color: 'var(--faint)' });
    l.rotulo(-1.35, Math.exp(1.35), 'e⁻ˣ', { dx: -6, dy: 4, anclaje: 'end', color: 'var(--faint)' });
    l.rotulo(1.05, Math.exp(2.1), 'e²ˣ: la particular', { dx: -7, dy: 4, anclaje: 'end' });
    l.esquina(10, 17, 'no coincide con ninguna: sin resonancia');
    return l.svg();
  });

/* ── 6 · qué hace la solución, sin resolver la ecuación ──────────────── */

fig('ej-edo-sin-resolverla',
  'Las dos rectas horizontales y = 0 e y = 1 son soluciones constantes, y ninguna otra puede cruzarlas. Empezando en 0,5 se está entre las dos, y ahí el campo apunta siempre hacia arriba: la solución sube y queda atrapada bajo el 1. De ahí sale el límite sin resolver nada.',
  () => {
    const l = lienzo({
      id: 'f-ej-logistica',
      ancho: 340, alto: 250,
      x: [-0.4, 5.4], y: [-0.35, 1.5], cuadrado: false,
      titulo: 'El campo de direcciones de la logística con las dos soluciones constantes',
      desc: 'Dos rectas horizontales de trazo grueso marcan las alturas cero y uno: son las dos '
        + 'soluciones constantes de la ecuación. Entre ellas, una retícula de trocitos inclinados '
        + 'hacia arriba indica que cualquier solución que empiece ahí sube. Una curva con forma '
        + 'de ese arranca en la altura cero coma cinco, sube cada vez más despacio y se pega a '
        + 'la recta de altura uno sin llegar a tocarla. Por encima de la recta de altura uno, los '
        + 'trocitos apuntan hacia abajo: las soluciones de arriba también bajan hacia ella.',
    });
    l.clase('campo', 'stroke: var(--faint); stroke-width: 1.5; fill: none;');
    for (let x = -0.15; x <= 5.2; x += 0.65) {
      for (let y = 0.1; y <= 1.42; y += 0.155) {
        const m = y * (1 - y);
        const k = 0.28 / (2 * Math.hypot(1, m));
        l.poli([[x - k, y - k * m], [x + k, y + k * m]], { clase: 'campo' });
      }
    }
    l.ejes({ nombreX: 't', nombreY: 'y', marcasX: [1, 2, 3, 4, 5], marcasY: [[1, '1'], [0.5, '0,5']] });
    l.poli([[-0.35, 1], [5.35, 1]], { clase: 'c2' });
    l.poli([[-0.35, 0], [5.35, 0]], { clase: 'c2' });
    l.curva((t) => 1 / (1 + Math.exp(-t)), [-0.35, 5.35], { clase: 'c', n: 140 });
    l.punto(0, 0.5, { clase: 'o', r: 4.6 });
    l.rotulo(0, 0.5, 'y(0) = 0,5', { dx: 8, dy: 12, color: 'var(--flag)' });
    l.rotulo(4.6, 1, 'y = 1: el límite', { dx: 0, dy: -9, anclaje: 'end', color: 'var(--alt)' });
    l.rotulo(1.6, 0, 'y = 0', { dx: 0, dy: -8, anclaje: 'middle', color: 'var(--alt)', pequeno: true });
    return l.svg();
  });

/* ── a pegar ─────────────────────────────────────────────────────────── */
for (const f of figuras) f.svg = f.hacer();

if (process.argv[1]?.endsWith('calculo-ejemplos-t09.mjs')) {
  for (const f of figuras) pegaEnCampo(f.fichero, f.id, f.campo, f.svg, f.pie);
  console.log(`${figuras.length} figuras de ejemplo pegadas en ${FICHERO}`);
}
