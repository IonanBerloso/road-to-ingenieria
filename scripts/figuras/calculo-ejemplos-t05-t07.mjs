/**
 * Las trece figuras que les faltaban a los ejemplos de entrada de los temas
 * 5, 6 y 7.
 *
 * Con estas, los noventa y un ejemplos de entrada del corpus de Cálculo tienen
 * dibujo. Era la mitad de la dimensión F que más se notaba: un ejemplo de
 * entrada existe para poder empezar sin saber nada, y «el valor medio de una
 * función» o «el orden de integración que desbloquea la integral» no se
 * empiezan leyendo — se empiezan mirando.
 *
 *     node scripts/figuras/calculo-ejemplos-t05-t07.mjs
 */

import { lienzo, mosaico } from './lienzo.mjs';
import { pegaEnCampo } from './pegar.mjs';

export const figuras = [];
const T = (tema) => `src/content/calculo/${tema}/ejercicios.yaml`;
const fig = (tema, id, pie, hacer) =>
  figuras.push({ fichero: T(tema), id, campo: 'resolucion', pie, hacer });

const P = Math.PI;
/** Un cuadrante de circunferencia, para los mapas de nivel del primer cuadrante. */
const cuadrante = (l, r, clase) => {
  const p = [];
  for (let i = 0; i <= 60; i++) {
    const t = (P / 2) * (i / 60);
    p.push([r * Math.cos(t), r * Math.sin(t)]);
  }
  l.poli(p, { clase });
};

const bajo = (f, a, b, n = 90) => {
  const p = [[a, 0]];
  for (let i = 0; i <= n; i++) { const x = a + ((b - a) * i) / n; p.push([x, f(x)]); }
  p.push([b, 0]);
  return p;
};

/* ═══ tema 5 ═════════════════════════════════════════════════════════ */

fig('t05-integracion', 'ej-derivar-funcion-integral',
  'F(x) es el área acumulada desde 1 hasta x. Si x avanza un poquito, el área crece en una tira de anchura dx y altura x³: eso es F′(x) = x³, y es todo lo que dice el teorema fundamental. No hace falta calcular la integral para saberlo.',
  () => {
    const f = (t) => t ** 3;
    const l = lienzo({
      id: 'f-ej-derivar-integral',
      ancho: 330, alto: 245,
      x: [-0.3, 2.5], y: [-1.6, 10], cuadrado: false,
      titulo: 'El área acumulada bajo t al cubo y la tira que se añade al avanzar x',
      desc: 'La curva t al cubo sube de izquierda a derecha. Bajo ella, entre el uno y un punto '
        + 'marcado como x, hay una región sombreada: es el área que acumula la función F. Justo '
        + 'a la derecha de x hay una tira vertical estrecha, sombreada de otro tono, que es lo '
        + 'que el área crece si x avanza un poquito. Su altura es el valor de la curva en x y su '
        + 'anchura es ese poquito, de modo que su área vale x al cubo por dx.',
    });
    const X = 1.9;
    l.poli(bajo(f, 1, X), { clase: 'f', cerrar: true });
    l.poli([[X, 0], [X + 0.22, 0], [X + 0.22, f(X + 0.22)], [X, f(X)]], { clase: 'f2', cerrar: true });
    l.ejes({ nombreX: 't', nombreY: 'y', marcasX: [1, 2], marcasY: [5] });
    l.curva(f, [-0.25, 2.14], { clase: 'c', n: 90 });
    l.poli([[X, 0], [X, f(X)]], { clase: 'g' });
    l.rotulo(X, 0, 'x', { dx: 0, dy: 15, anclaje: 'middle', color: 'var(--flag)' });
    l.rotulo(1.45, 2.4, 'F(x)', { dx: 0, dy: 0, anclaje: 'middle' });
    l.rotulo(X + 0.11, f(X), 'altura x³', { dx: -8, dy: -7, anclaje: 'end', color: 'var(--alt)' });
    return l.svg();
  });

fig('t05-integracion', 'ej-impropia-que-converge',
  'La región es infinitamente larga y aun así su área es finita: vale 1. Lo que ocurre es que la curva baja tan deprisa que lo que queda a partir de x = b mide 1/b, y eso se va a cero. Un recinto sin fin puede tener área con fin.',
  () => {
    const f = (x) => 1 / (x * x);
    const l = lienzo({
      id: 'f-ej-impropia-converge',
      ancho: 340, alto: 220,
      x: [-0.6, 8.4], y: [-0.35, 1.5], cuadrado: false,
      titulo: 'La región bajo uno partido por x al cuadrado desde uno hasta el infinito',
      desc: 'La curva uno partido por x al cuadrado baja desde la altura uno en x igual a uno y '
        + 'se va pegando al eje horizontal sin llegar a tocarlo. La región entre la curva y el '
        + 'eje, desde x igual a uno hacia la derecha, está sombreada y se prolonga hasta el '
        + 'borde del dibujo. Una segunda zona, sombreada de otro tono a partir de x igual a '
        + 'cuatro, es la cola, y lleva escrito que su área vale un cuarto: cada vez que el '
        + 'extremo se aleja, lo que queda pendiente es menor.',
    });
    l.poli(bajo(f, 1, 8.35, 120), { clase: 'f', cerrar: true });
    l.poli(bajo(f, 4, 8.35, 80), { clase: 'f2', cerrar: true });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 4, 8], marcasY: [1] });
    l.curva(f, [0.85, 8.35], { clase: 'c', n: 120 });
    l.poli([[1, 0], [1, 1]], { clase: 'g' });
    l.rotulo(2.1, 0.22, 'área total: 1', { dx: 0, dy: 0, anclaje: 'middle' });
    l.rotulo(6, 0.04, 'la cola: ¼', { dx: 0, dy: -8, anclaje: 'middle', color: 'var(--alt)', pequeno: true });
    return l.svg();
  });

fig('t05-integracion', 'ej-taylor-de-una-integral',
  'F no se puede escribir con funciones elementales, pero su derivada sí, y eso basta: se desarrolla e^{−t²} —que es la exponencial de siempre con t² en lugar de t— y se integra término a término. La curva gruesa y su polinomio coinciden cerca de cero.',
  () => {
    const l = lienzo({
      id: 'f-ej-taylor-integral',
      ancho: 335, alto: 240,
      x: [-2.1, 2.1], y: [-1.3, 1.3], cuadrado: false,
      titulo: 'La función integral y su polinomio de McLaurin de tres términos',
      desc: 'Una curva con forma de ese tumbada sube desde abajo a la izquierda, pasa por el '
        + 'origen y se aplana por la derecha acercándose a una altura constante: es la función '
        + 'integral. Junto a ella, con otro trazo, su polinomio de McLaurin de tres términos, '
        + 'que la sigue exactamente cerca del origen y se separa hacia arriba y hacia abajo en '
        + 'cuanto se aleja. Una banda sombreada alrededor del origen marca la zona donde las '
        + 'dos son indistinguibles.',
    });
    /* F(x) = ∫₀ˣ e^{−t²}dt se integra numéricamente, que es lo honesto: no
       tiene primitiva elemental y ese es justamente el punto del ejemplo. */
    const F = (x) => {
      const n = 200, h = x / n;
      let s = 0;
      for (let i = 0; i < n; i++) {
        const a = i * h, b = (i + 1) * h, m = (a + b) / 2;
        s += (h / 6) * (Math.exp(-a * a) + 4 * Math.exp(-m * m) + Math.exp(-b * b));
      }
      return s;
    };
    const p = (x) => x - x ** 3 / 3 + x ** 5 / 10;
    l.poli([[-0.75, -1.3], [0.75, -1.3], [0.75, 1.3], [-0.75, 1.3]], { clase: 'f', cerrar: true });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-2, -1, 1, 2], marcasY: [1] });
    l.curva(p, [-1.45, 1.45], { clase: 'c2', n: 110 });
    l.curva(F, [-2.05, 2.05], { clase: 'c', n: 110 });
    l.rotulo(1.75, F(1.75), 'F(x)', { dx: 5, dy: -5 });
    l.rotulo(-1.3, p(-1.3), 'x − x³/3 + x⁵/10', { dx: 6, dy: 12, color: 'var(--alt)', pequeno: true });
    return l.svg();
  });

fig('t05-integracion', 'ej-valor-medio-de-una-funcion',
  'El valor medio es la altura que tendría que tener un rectángulo del mismo ancho para encerrar la misma área. Aquí sale 3, y se ve en el dibujo: lo que al rectángulo le sobra por la izquierda es exactamente lo que le falta por la derecha.',
  () => {
    const f = (x) => x * x;
    const l = lienzo({
      id: 'f-ej-valor-medio',
      ancho: 320, alto: 250,
      x: [-0.4, 3.6], y: [-1.2, 10], cuadrado: false,
      titulo: 'La parábola entre cero y tres y el rectángulo de la misma área',
      desc: 'La parábola x al cuadrado sube desde el origen hasta la altura nueve en x igual a '
        + 'tres. Bajo ella, entre cero y tres, la región está sombreada. Encima se dibuja un '
        + 'rectángulo del mismo ancho y altura tres, que es el valor medio. La parte del '
        + 'rectángulo que sobresale por encima de la parábola, a la izquierda, tiene exactamente '
        + 'la misma área que la parte de la parábola que sobresale por encima del rectángulo, a '
        + 'la derecha. El punto donde la parábola cruza la altura tres está marcado.',
    });
    l.poli(bajo(f, 0, 3), { clase: 'f', cerrar: true });
    l.poli([[0, 0], [3, 0], [3, 3], [0, 3]], { clase: 'c2', cerrar: true });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2, 3], marcasY: [3, 9] });
    l.curva(f, [-0.35, 3.15], { clase: 'c', n: 80 });
    l.poli([[-0.4, 3], [3.55, 3]], { clase: 'g' });
    l.punto(Math.sqrt(3), 3, { clase: 'o', r: 4.4 });
    l.rotulo(Math.sqrt(3), 3, '√3', { dx: 0, dy: 16, anclaje: 'middle', color: 'var(--flag)' });
    l.rotulo(0.75, 1.5, 'sobra', { dx: 0, dy: 0, anclaje: 'middle', color: 'var(--alt)', pequeno: true });
    l.rotulo(2.6, 5.4, 'falta', { dx: 0, dy: 0, anclaje: 'middle', color: 'var(--alt)', pequeno: true });
    l.esquina(10, 17, 'valor medio = 3');
    return l.svg();
  });

fig('t05-integracion', 'ej-elegir-el-metodo-de-integracion',
  'Antes de integrar nada hay que clasificar, y son tres preguntas en este orden. La primera es la más barata —¿está la derivada del denominador arriba?— y resuelve la segunda integral de un plumazo, sin partes ni fracciones simples.',
  () => {
    const l = lienzo({
      id: 'f-ej-elegir-metodo',
      ancho: 340, alto: 235,
      x: [0, 10], y: [0, 6.6], cuadrado: false,
      titulo: 'El orden de preguntas para elegir el método de integración',
      desc: 'Un diagrama en cascada con tres preguntas encadenadas. La primera: ¿está arriba la '
        + 'derivada de abajo? Si sí, la integral es un logaritmo. Si no, se baja a la siguiente: '
        + '¿es un producto de dos tipos distintos de función? Si sí, integración por partes. Y '
        + 'si tampoco: ¿es un cociente de polinomios? Entonces, fracciones simples. Cada '
        + 'pregunta tiene a su derecha el método que le corresponde.',
    });
    const filas = [
      ['¿arriba está (abajo)′?', 'logaritmo'],
      ['¿producto de tipos?', 'por partes'],
      ['¿cociente de polinomios?', 'fracciones simples'],
    ];
    filas.forEach(([q, r], i) => {
      const y = 5.6 - i * 2.05;
      l.poli([[0.3, y - 0.62], [4.9, y - 0.62], [4.9, y + 0.62], [0.3, y + 0.62]], { clase: 'f', cerrar: true });
      l.poli([[0.3, y - 0.62], [4.9, y - 0.62], [4.9, y + 0.62], [0.3, y + 0.62]], { clase: 'c', cerrar: true });
      l.rotulo(2.6, y, q, { dx: 0, dy: 4, anclaje: 'middle', pequeno: true });
      l.flecha([5, y], [6.2, y], { clase: 'c2', color: 'var(--alt)', punta: 6 });
      l.poli([[6.3, y - 0.55], [9.8, y - 0.55], [9.8, y + 0.55], [6.3, y + 0.55]], { clase: 'f2', cerrar: true });
      l.rotulo(8.05, y, r, { dx: 0, dy: 4, anclaje: 'middle', color: 'var(--alt)', pequeno: true });
      if (i < 2) {
        l.flecha([2.6, y - 0.7], [2.6, y - 1.35], { clase: 'c', punta: 6 });
        l.rotulo(2.6, y - 1.05, 'no', { dx: 6, dy: 3, color: 'var(--faint)', pequeno: true });
      }
    });
    return l.svg();
  });

fig('t05-integracion', 'ej-mclaurin-por-dos-caminos',
  'El integrando sen t / t no está definido en t = 0, pero su límite vale 1 y el hueco se tapa solo: por eso la curva de arriba pasa por (0,1) sin saltar. Integrándola sale G, cuyo coeficiente de x³ es −1/18, y el dibujo enseña de dónde viene esa forma tan plana.',
  () => {
    const s = (t) => (Math.abs(t) < 1e-6 ? 1 : Math.sin(t) / t);
    const G = (x) => {
      const n = 160, h = x / n;
      let a = 0;
      for (let i = 0; i < n; i++) {
        const u = i * h, v = (i + 1) * h, m = (u + v) / 2;
        a += (h / 6) * (s(u) + 4 * s(m) + s(v));
      }
      return a;
    };
    return mosaico({
      id: 'f-ej-mclaurin-dos-caminos',
      columnas: 2,
      ancho: 210,
      alto: 170,
      titulo: 'El integrando seno de t partido por t y la función integral que produce',
      desc: 'Dos recuadros. En el primero, la curva del seno de t partido por t: vale uno en el '
        + 'origen, baja suavemente por los dos lados y ondula haciéndose cada vez más pequeña; '
        + 'el punto del origen está marcado con un círculo, porque ahí la expresión no está '
        + 'definida y hay que rellenar el hueco con su límite. En el segundo, la función '
        + 'integral: sale del origen subiendo con pendiente uno y se va aplanando, quedando muy '
        + 'cerca de la recta y igual a x durante un buen trecho.',
      celdas: [
        {
          etiqueta: 'sen t / t',
          x: [-8.4, 8.4], y: [-0.5, 1.3], cuadrado: false,
          dibuja: (l) => {
            l.ejes({ nombreX: 't', nombreY: '', marcasX: [[-2 * P, '−2π'], [2 * P, '2π']], marcasY: [1] });
            l.curva(s, [-8.35, 8.35], { clase: 'c', n: 260 });
            l.punto(0, 1, { clase: 'o', r: 4 });
          },
        },
        {
          etiqueta: 'G(x) y la recta x',
          x: [-2.6, 2.6], y: [-2.1, 2.1], cuadrado: false,
          dibuja: (l) => {
            l.ejes({ nombreX: 'x', nombreY: '', marcasX: [-2, -1, 1, 2], marcasY: [1] });
            l.curva((x) => x, [-1.9, 1.9], { clase: 'g', n: 2 });
            l.curva(G, [-2.55, 2.55], { clase: 'c', n: 110 });
          },
        },
      ],
    });
  });

/* ═══ tema 6 ═════════════════════════════════════════════════════════ */

fig('t06-varias-variables', 'ej-parcial-con-y-congelada',
  'Derivar respecto de x es congelar y: se corta la superficie por un plano y = constante y se deriva la curva que aparece en ese corte, que ya es una función de una sola variable. Por eso las reglas de derivación de siempre valen tal cual.',
  () => {
    const f = (x, y) => x ** 3 * y ** 2 + 4 * y;
    return mosaico({
      id: 'f-ej-parcial-congelada',
      columnas: 2,
      ancho: 210,
      alto: 175,
      titulo: 'Los dos cortes que dan las dos derivadas parciales',
      desc: 'Dos recuadros. En el primero se ha fijado y igual a uno y queda una curva que '
        + 'depende solo de x: es una cúbica desplazada hacia arriba. En el segundo se ha fijado '
        + 'x igual a uno y queda una curva que depende solo de y: una parábola con un término '
        + 'lineal. En cada recuadro hay un punto marcado y una recta tangente en él: su '
        + 'pendiente es la derivada parcial correspondiente.',
      celdas: [
        {
          etiqueta: 'y = 1 fija: f(x,1)',
          x: [-1.8, 1.8], y: [-1.2, 9], cuadrado: false,
          dibuja: (l) => {
            l.ejes({ nombreX: 'x', nombreY: 'f', marcasX: [-1, 1], marcasY: [4] });
            l.curva((x) => f(x, 1), [-1.75, 1.6], { clase: 'c', n: 80 });
            l.punto(1, 5, { clase: 'o', r: 4 });
            l.poli([[0.35, 5 - 3 * 0.65], [1.65, 5 + 3 * 0.65]], { clase: 'c2' });
            l.rotulo(1, 5, 'fₓ = 3', { dx: -7, dy: -5, anclaje: 'end', color: 'var(--flag)' });
          },
        },
        {
          etiqueta: 'x = 1 fija: f(1,y)',
          x: [-2.6, 2.6], y: [-4.5, 12], cuadrado: false,
          dibuja: (l) => {
            l.ejes({ nombreX: 'y', nombreY: 'f', marcasX: [-2, -1, 1, 2], marcasY: [5, 10] });
            l.curva((y) => f(1, y), [-2.55, 2.1], { clase: 'c', n: 80 });
            l.punto(1, 5, { clase: 'o', r: 4 });
            l.poli([[0.25, 5 - 6 * 0.75], [1.75, 5 + 6 * 0.75]], { clase: 'c2' });
            l.rotulo(1, 5, 'f_y = 6', { dx: -7, dy: 12, anclaje: 'end', color: 'var(--flag)' });
          },
        },
      ],
    });
  });

fig('t06-varias-variables', 'ej-gradiente-tres-preguntas',
  'Las tres respuestas están en el mismo dibujo. El gradiente es la flecha que sale de P; su longitud es la velocidad máxima de cambio; y la dirección en la que la función no cambia es la perpendicular a él, que es la tangente a la curva de nivel.',
  () => {
    const l = lienzo({
      id: 'f-ej-gradiente-tres',
      ancho: 320, alto: 290,
      x: [-1.2, 8.4], y: [-1.2, 8.4], cuadrado: true,
      titulo: 'El gradiente en el punto P, la circunferencia de nivel y la dirección de cambio nulo',
      desc: 'Varias circunferencias concéntricas centradas en el origen son las curvas de nivel '
        + 'de la función. En el punto de coordenadas tres y cuatro, que está sobre una de ellas, '
        + 'nace una flecha que apunta hacia fuera en la dirección del radio: es el gradiente, y '
        + 'está rotulado con sus componentes, seis y ocho. Otra flecha, más corta y de otro '
        + 'color, sale del mismo punto perpendicular a la primera, tangente a la circunferencia: '
        + 'es la dirección en la que la función no cambia.',
    });
    for (const r of [2, 3.5, 5, 6.5]) cuadrante(l, r, 'g');
    cuadrante(l, 5, 'cp2');
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [3, 6], marcasY: [4, 8] });
    l.flecha([3, 4], [3 + 1.8, 4 + 2.4], { clase: 'c' });
    l.flecha([3, 4], [3 - 1.6, 4 + 1.2], { clase: 'c2', color: 'var(--alt)' });
    l.punto(3, 4, { clase: 'o', r: 4.8 });
    l.rotulo(3, 4, 'P(3,4)', { dx: 7, dy: 12, color: 'var(--flag)' });
    l.rotulo(3 + 1.8, 4 + 2.4, '∇f = (6,8)', { dx: -4, dy: -7, anclaje: 'end' });
    l.rotulo(3 - 1.6, 4 + 1.2, 'aquí no cambia', { dx: 4, dy: 14, color: 'var(--alt)', pequeno: true });
    return l.svg();
  });

fig('t06-varias-variables', 'ej-direccional-sin-normalizar',
  'Lo que la derivada direccional mide es la proyección del gradiente sobre la dirección, y una proyección solo tiene sentido con un vector de longitud 1. Si se usa v sin normalizar, la respuesta sale multiplicada por |v| = 5: 24 en vez de 4,8.',
  () => {
    const l = lienzo({
      id: 'f-ej-direccional-normalizar',
      ancho: 320, alto: 280,
      x: [-1, 5.6], y: [-1, 5.6], cuadrado: true,
      titulo: 'El gradiente, la dirección y la proyección de uno sobre la otra',
      desc: 'Del origen salen dos flechas: una hacia el punto tres coma cuatro, que es el '
        + 'gradiente, y otra hacia el punto cuatro coma tres, que es la dirección dada. Las dos '
        + 'tienen longitud cinco. Sobre la segunda se marca el vector unitario, mucho más corto, '
        + 'y desde el extremo del gradiente baja una línea de puntos perpendicular a ella hasta '
        + 'el punto donde cae la proyección, a distancia cuatro coma ocho del origen. Ese es el '
        + 'valor de la derivada direccional.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 3, 4], marcasY: [3, 4] });
    l.flecha([0, 0], [3, 4], { clase: 'c' });
    l.flecha([0, 0], [4, 3], { clase: 'fue', color: 'var(--faint)' });
    l.flecha([0, 0], [0.8, 0.6], { clase: 'c2', color: 'var(--alt)' });
    const pr = 4.8;
    l.poli([[3, 4], [pr * 0.8, pr * 0.6]], { clase: 'g' });
    l.punto(pr * 0.8, pr * 0.6, { clase: 'o', r: 4.6 });
    l.rotulo(3, 4, '∇f = (3,4)', { dx: -6, dy: -6, anclaje: 'end' });
    l.rotulo(4, 3, 'v = (4,3)', { dx: 5, dy: 4, color: 'var(--faint)' });
    l.rotulo(0.8, 0.6, 'v̂', { dx: 5, dy: 12, color: 'var(--alt)' });
    l.rotulo(pr * 0.8, pr * 0.6, '4,8', { dx: -7, dy: 13, anclaje: 'end', color: 'var(--flag)' });
    return l.svg();
  });

fig('t06-varias-variables', 'ej-limite-dos-variables-por-caminos',
  'Acercándose por cada recta y = mx el cociente vale m/(1+m²), un número distinto para cada m: por el eje x da 0 y por la bisectriz da ½. Como dos caminos discrepan, el límite no existe. En dos variables no basta con probar uno.',
  () => {
    const l = lienzo({
      id: 'f-ej-limite-por-caminos',
      ancho: 320, alto: 275,
      x: [-2.4, 2.8], y: [-2.4, 2.8], cuadrado: true,
      titulo: 'Varias rectas de acercamiento al origen, cada una con el valor que da el cociente',
      desc: 'Del origen salen cuatro rectas con pendientes distintas, dibujadas con trazo fino y '
        + 'con una flecha que apunta hacia el origen: son los caminos por los que uno se puede '
        + 'acercar. Junto al extremo de cada una está escrito el valor que toma el cociente a lo '
        + 'largo de ella: cero por el eje horizontal, un medio por la bisectriz, cuatro décimas '
        + 'por la de pendiente dos y menos un medio por la de pendiente menos uno. Como los '
        + 'valores no coinciden, el límite no existe.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2], marcasY: [1, 2] });
    const caminos = [[0, '0'], [1, '½'], [2, '0,4'], [-1, '−½']];
    for (const [m, texto] of caminos) {
      const x1 = Math.abs(m) > 1 ? 2.6 / Math.abs(m) : 2.6;
      l.poli([[0, 0], [x1, m * x1]], { clase: 'cp' });
      l.flecha([0.85 * x1, 0.85 * m * x1], [0.55 * x1, 0.55 * m * x1], { clase: 'cp', punta: 6 });
      l.rotulo(x1, m * x1, texto, { dx: m >= 0 ? 6 : 6, dy: m > 0 ? -4 : 12 });
    }
    l.punto(0, 0, { clase: 'o', r: 5 });
    l.esquina(10, 17, 'valores distintos: no hay límite');
    return l.svg();
  });

fig('t06-varias-variables', 'ej-gradiente-al-reves',
  'Las direcciones (1,0) y (0,1) son justamente las de los ejes, así que sus derivadas direccionales son las dos parciales: 3 y 4. Y el gradiente no es más que el vector que las tiene por componentes, así que ya está: ∇f = (3,4).',
  () => {
    const l = lienzo({
      id: 'f-ej-gradiente-al-reves',
      ancho: 320, alto: 275,
      x: [-1, 5], y: [-1, 5], cuadrado: true,
      titulo: 'Las dos direcciones de los ejes y el gradiente que se arma con sus valores',
      desc: 'Del origen salen dos flechas cortas sobre los ejes, una horizontal y otra vertical, '
        + 'de longitud uno: son las dos direcciones del enunciado, y llevan escritos los valores '
        + 'tres y cuatro que toman en ellas las derivadas direccionales. Una tercera flecha, más '
        + 'larga y de trazo grueso, va del origen al punto tres coma cuatro: es el gradiente. '
        + 'Dos líneas de puntos bajan de su extremo a los ejes, en el tres y en el cuatro, '
        + 'mostrando que sus componentes son exactamente aquellos dos valores.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 3], marcasY: [1, 4] });
    l.poli([[3, 0], [3, 4]], { clase: 'g' });
    l.poli([[0, 4], [3, 4]], { clase: 'g' });
    l.flecha([0, 0], [1, 0], { clase: 'c2', color: 'var(--alt)' });
    l.flecha([0, 0], [0, 1], { clase: 'c2', color: 'var(--alt)' });
    l.flecha([0, 0], [3, 4], { clase: 'c' });
    l.punto(3, 4, { clase: 'o', r: 4.8 });
    l.rotulo(1, 0, 'u: vale 3', { dx: 5, dy: 14, color: 'var(--alt)', pequeno: true });
    l.rotulo(0, 1, 'v: vale 4', { dx: -6, dy: 2, anclaje: 'end', color: 'var(--alt)', pequeno: true });
    l.rotulo(3, 4, '∇f = (3,4)', { dx: 7, dy: -4, color: 'var(--flag)' });
    return l.svg();
  });

/* ═══ tema 7 ═════════════════════════════════════════════════════════ */

fig('t07-integral-multiple', 'ej-doble-sobre-rectangulo',
  'Sobre un rectángulo los cuatro límites son constantes, y por eso es el único caso en que el orden da exactamente igual y se puede integrar sin pensar. En cuanto el recinto deja de ser un rectángulo, esa comodidad se acaba.',
  () => {
    const l = lienzo({
      id: 'f-ej-doble-rectangulo',
      ancho: 320, alto: 245,
      x: [-0.5, 2.8], y: [-0.5, 1.9], cuadrado: true,
      titulo: 'El rectángulo de integración con sus cuatro límites constantes',
      desc: 'Un rectángulo sombreado ocupa la zona entre cero y dos en horizontal y entre cero y '
        + 'uno en vertical. Sus cuatro lados están rotulados con el valor constante que les '
        + 'corresponde. Dentro se dibujan dos flechas: una vertical, que indica el barrido '
        + 'interior en y, y otra horizontal debajo, que indica el barrido exterior en x. Al ser '
        + 'todos los límites números, las dos flechas se podrían intercambiar sin cambiar nada.',
    });
    l.poli([[0, 0], [2, 0], [2, 1], [0, 1]], { clase: 'f', cerrar: true });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2], marcasY: [1] });
    l.poli([[0, 0], [2, 0], [2, 1], [0, 1]], { clase: 'c', cerrar: true });
    l.flecha([1.2, 0.08], [1.2, 0.92], { clase: 'c2', color: 'var(--alt)' });
    l.flecha([0.15, -0.3], [1.85, -0.3], { clase: 'c2', color: 'var(--alt)' });
    l.rotulo(1.2, 0.5, 'y: 0 → 1', { dx: 7, dy: 4, color: 'var(--alt)', pequeno: true });
    l.rotulo(1, -0.3, 'x: 0 → 2', { dx: 0, dy: -7, anclaje: 'middle', color: 'var(--alt)', pequeno: true });
    return l.svg();
  });

fig('t07-integral-multiple', 'ej-cambiar-el-orden-que-desbloquea',
  'El recinto es el mismo en los dos dibujos; lo que cambia es cómo se barre. Barriendo en vertical hay que integrar e^{y²} respecto de y, que no tiene primitiva. Barriendo en horizontal hay que integrarla respecto de x, y ahí es una constante: sale sola.',
  () => {
    const celda = (etiqueta, dibuja) => ({
      etiqueta,
      x: [-0.35, 1.45], y: [-0.35, 1.45], cuadrado: true,
      dibuja: (l) => {
        l.poli([[0, 0], [1, 1], [0, 1]], { clase: 'f', cerrar: true });
        l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1], marcasY: [1] });
        l.poli([[0, 0], [1, 1], [0, 1]], { clase: 'c', cerrar: true });
        dibuja(l);
      },
    });
    return mosaico({
      id: 'f-ej-cambiar-el-orden',
      columnas: 2,
      ancho: 200,
      alto: 190,
      titulo: 'El mismo triángulo barrido en los dos órdenes',
      desc: 'Dos recuadros con el mismo triángulo sombreado, el que tiene vértices en el origen, '
        + 'en el punto uno coma uno y en el cero coma uno. En el primero, tres flechas verticales '
        + 'suben desde la diagonal hasta el borde de arriba: es el orden del enunciado, primero '
        + 'en y. En el segundo, tres flechas horizontales van desde el borde izquierdo hasta la '
        + 'diagonal: es el orden cambiado, primero en x. El recinto es idéntico; lo único que '
        + 'cambia es la dirección del barrido.',
      celdas: [
        celda('primero en y: se atasca', (l) => {
          for (const x of [0.25, 0.5, 0.75]) l.flecha([x, x + 0.04], [x, 0.96], { clase: 'c2', color: 'var(--alt)' });
          l.rotulo(0.5, 1, 'y: x → 1', { dx: 0, dy: -8, anclaje: 'middle', color: 'var(--alt)', pequeno: true });
        }),
        celda('primero en x: sale', (l) => {
          for (const y of [0.3, 0.55, 0.8]) l.flecha([0.04, y], [y - 0.04, y], { clase: 'c2', color: 'var(--alt)' });
          l.rotulo(0.45, 0.15, 'x: 0 → y', { dx: 0, dy: 0, anclaje: 'middle', color: 'var(--alt)', pequeno: true });
        }),
      ],
    });
  });

/* ── a pegar ─────────────────────────────────────────────────────────── */
for (const f of figuras) f.svg = f.hacer();

if (process.argv[1]?.endsWith('calculo-ejemplos-t05-t07.mjs')) {
  for (const f of figuras) pegaEnCampo(f.fichero, f.id, f.campo, f.svg, f.pie);
  console.log(`${figuras.length} figuras de ejemplo pegadas`);
}
