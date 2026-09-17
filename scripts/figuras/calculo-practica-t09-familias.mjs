/**
 * Las figuras de las prácticas del tema 9 que dibujan familias de soluciones.
 *
 * Un ejercicio de EDOs se cierra con una fórmula que lleva una constante
 * suelta, y esa constante es lo que más cuesta entender: la solución general
 * no es una curva, son **infinitas**, una por cada valor de la constante, y
 * la condición inicial no «calcula» nada — elige cuál de ellas es. Dibujadas
 * unas cuantas, eso deja de necesitar explicación.
 *
 * Las de coeficientes constantes van aparte porque enseñan otra cosa: qué
 * forma tiene la solución según cómo sean las raíces de la característica.
 * Reales del mismo signo, exponenciales; complejas, oscilación; repetidas, la
 * x que aparece delante y que nadie recuerda de dónde sale.
 *
 *     node scripts/figuras/calculo-practica-t09-familias.mjs
 */

import { lienzo, mosaico } from './lienzo.mjs';
import { pegaEnCampo } from './pegar.mjs';

export const FICHERO = 'src/content/calculo/t09-ecuaciones-diferenciales/ejercicios.yaml';

export const figuras = [];
const fig = (id, pie, hacer) =>
  figuras.push({ fichero: FICHERO, id, campo: 'resolucion', pie, hacer });

const P = Math.PI;

/**
 * Los puntos de `f` que caben en la ventana vertical, cortando el trazo en
 * cuanto se sale.
 *
 * Una familia de soluciones se dibuja precisamente porque cada curva se va
 * por un lado distinto, así que recortarlas todas por el mismo sitio deja la
 * mitad fuera del marco. Cada una se corta donde le toca.
 */
const dentroDe = (f, [a, b], [y0, y1], n = 160) => {
  const p = [];
  for (let i = 0; i <= n; i++) {
    const x = a + ((b - a) * i) / n;
    const y = f(x);
    if (!Number.isFinite(y) || y < y0 || y > y1) {
      if (p.length) break;
      continue;
    }
    p.push([x, y]);
  }
  return p;
};

/* ── 1 · seis características con raíces reales ──────────────────────── */

fig('seis-caracteristicas-con-raices-reales',
  'Con raíces reales la solución es una suma de exponenciales, y lo único que hay que mirar es el signo. Las dos negativas se apagan; una positiva manda sobre todas las demás y la solución se dispara; y una raíz nula deja un sumando constante que no se va nunca.',
  () => {
    const celda = (etiqueta, fs, y, nota) => ({
      etiqueta,
      x: [-0.4, 3.2], y, cuadrado: false,
      dibuja: (l) => {
        l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2, 3] });
        for (const [f, clase, a, b] of fs) l.curva(f, [a, b], { clase, n: 90 });
        if (nota) l.esquina(6, 13, nota);
      },
    });
    return mosaico({
      id: 'f-raices-reales',
      columnas: 3,
      titulo: 'Las tres formas que toma la solución según el signo de las raíces reales',
      desc: 'Tres recuadros. En el primero, dos curvas que bajan hacia el eje horizontal y se '
        + 'quedan pegadas a él: son exponenciales de exponente negativo, y la solución se apaga. '
        + 'En el segundo, una curva que baja y otra que se dispara hacia arriba: hay una raíz '
        + 'positiva, y esa manda, de modo que la solución crece sin tope. En el tercero, una '
        + 'curva que se acerca a una recta horizontal distinta de cero: hay una raíz nula, y el '
        + 'sumando constante que produce no desaparece nunca.',
      celdas: [
        celda('las dos negativas', [
          [(x) => Math.exp(-x), 'c', -0.35, 3.15],
          [(x) => Math.exp(-2.2 * x), 'c2', -0.35, 3.15],
        ], [-0.5, 2.4], 'se apaga'),
        celda('una positiva', [
          [(x) => Math.exp(-x), 'c2', -0.35, 3.15],
          [(x) => Math.exp(1.1 * x), 'c', -0.35, 2.55],
        ], [-3, 16], 'se dispara'),
        celda('una raíz nula', [
          [() => 1.4, 'c2', -0.35, 3.15],
          [(x) => 1.4 + 1.6 * Math.exp(-1.6 * x), 'c', -0.35, 3.15],
        ], [-0.5, 3.6], 'no se va'),
      ],
    });
  });

/* ── 2 · cuando las raíces son complejas ─────────────────────────────── */

fig('tres-caracteristicas-con-raices-complejas',
  'Con raíces a ± bi, cada parte hace una cosa y solo una: la real gobierna la envolvente —crece, decrece o se queda— y la imaginaria, la frecuencia. Leer la solución es leer esas dos cosas por separado, y el dibujo las separa.',
  () => {
    const celda = (etiqueta, a, b, y) => ({
      etiqueta,
      x: [-0.25, 3.4], y, cuadrado: false,
      dibuja: (l) => {
        l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2, 3] });
        l.curva((x) => Math.exp(a * x), [0, 3.35], { clase: 'g', n: 80 });
        l.curva((x) => -Math.exp(a * x), [0, 3.35], { clase: 'g', n: 80 });
        l.curva((x) => Math.exp(a * x) * Math.cos(b * x), [-0.2, 3.35], { clase: 'c', n: 300 });
      },
    });
    return mosaico({
      id: 'f-raices-complejas',
      columnas: 3,
      titulo: 'Tres oscilaciones con la misma frecuencia y envolventes distintas',
      desc: 'Tres recuadros, cada uno con una onda y dos curvas finas que la envuelven por '
        + 'arriba y por abajo. En el primero la envolvente se abre: la onda oscila cada vez con '
        + 'más amplitud. En el segundo la envolvente es horizontal: la onda oscila siempre '
        + 'igual. En el tercero la envolvente se cierra hacia el eje: la onda se va apagando. '
        + 'Las tres oscilan al mismo ritmo, porque lo que cambia entre ellas es la parte real de '
        + 'las raíces, no la imaginaria.',
      celdas: [
        celda('a > 0: se abre', 0.55, 5, [-6.5, 6.5]),
        celda('a = 0: se mantiene', 0, 5, [-1.6, 1.6]),
        celda('a < 0: se apaga', -1.1, 5, [-1.3, 1.3]),
      ],
    });
  });

/* ── 3 · raíces repetidas, y por qué aparece la x delante ────────────── */

fig('seis-caracteristicas-con-raices-multiples',
  'Si la raíz está repetida, e^{rx} y e^{rx} son la misma función y solo aportan una solución: hacen falta dos. La segunda es x·e^{rx}, que es distinta —arranca en cero, sube y luego se rinde ante la exponencial— y por eso la x de delante no es un adorno.',
  () => {
    const r = -1;
    const l = lienzo({
      id: 'f-raices-multiples',
      ancho: 335, alto: 240,
      x: [-0.4, 6.4], y: [-0.2, 1.25], cuadrado: false,
      titulo: 'La exponencial y la misma exponencial multiplicada por x',
      desc: 'Dos curvas. La primera sale de la altura uno y baja continuamente hacia el eje: es '
        + 'la exponencial de exponente negativo. La segunda sale del origen, sube hasta un '
        + 'máximo cerca de x igual a uno y después baja también hacia el eje, quedando por '
        + 'debajo de la primera a partir de ahí: es la misma exponencial multiplicada por x. Son '
        + 'dos formas claramente distintas, y por eso sirven como las dos soluciones '
        + 'independientes que la ecuación necesita.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2, 4, 6], marcasY: [1] });
    l.curva((x) => Math.exp(r * x), [-0.35, 6.35], { clase: 'c', n: 110 });
    l.curva((x) => x * Math.exp(r * x), [0, 6.35], { clase: 'c2', n: 110 });
    l.punto(1, Math.exp(-1), { clase: 'o', r: 4 });
    l.rotulo(0.5, Math.exp(-0.5), 'eʳˣ', { dx: 6, dy: -6 });
    l.rotulo(1, Math.exp(-1), 'x·eʳˣ', { dx: 8, dy: 13, color: 'var(--alt)' });
    l.esquina(10, 17, 'dos formas distintas, dos soluciones');
    return l.svg();
  });

/* ── 4 · dada la solución, hallar la ecuación ────────────────────────── */

fig('el-parametro-que-hace-que-sea-solucion',
  'En y″ + my = 0 el parámetro m no cambia la amplitud ni la fase: cambia la frecuencia, y solo eso. Cuanto mayor es m, más apretadas van las ondas, porque la frecuencia es √m. Por eso basta contar cuántas veces oscila la solución dada para despejarlo.',
  () => {
    const celda = (etiqueta, w) => ({
      etiqueta,
      x: [-0.15, 2.15], y: [-1.75, 1.75], cuadrado: false,
      dibuja: (l) => {
        l.ejes({ nombreX: 't', nombreY: 'y', marcasX: [1, 2], marcasY: [[1.4, 'A']] });
        l.poli([[-0.15, 1.4], [2.15, 1.4]], { clase: 'g' });
        l.poli([[-0.15, -1.4], [2.15, -1.4]], { clase: 'g' });
        l.curva((t) => 1.4 * Math.sin(w * P * t), [0, 2.1], { clase: 'c', n: 60 * w + 120 });
      },
    });
    return mosaico({
      id: 'f-parametro-frecuencia',
      columnas: 3,
      titulo: 'Tres soluciones de la misma ecuación con tres valores del parámetro',
      desc: 'Tres recuadros con la misma escala. En los tres, la onda sube y baja entre las '
        + 'mismas dos líneas de puntos, de modo que la amplitud es idéntica. Lo único que cambia '
        + 'es lo apretadas que van las ondas: en el primer recuadro cabe una oscilación entera, '
        + 'en el segundo dos y en el tercero cuatro. Debajo de cada uno está el valor del '
        + 'parámetro, y se ve que va como el cuadrado de la frecuencia: pi al cuadrado, cuatro '
        + 'pi al cuadrado y dieciséis pi al cuadrado.',
      celdas: [
        celda('m = π²', 1),
        celda('m = 4π²', 2),
        celda('m = 16π²', 4),
      ],
    });
  });

/* ── 5 · seis ecuaciones exactas, y su potencial ─────────────────────── */

fig('seis-exactas-y-su-potencial',
  'Lo que tiene de bueno una ecuación exacta es que su solución general no hay que integrarla dos veces: es la familia de curvas de nivel del potencial F. Aquí F = x²y + y³, y cada curva del dibujo es un valor de la constante. La condición inicial elige una.',
  () => {
    /* F = x²y + y³ = C se despeja en x: x = ±√((C − y³)/y), que es como se
       dibuja sin resolver una cúbica en cada punto. */
    const curva = (C) => {
      const p = [];
      for (let i = 0; i <= 200; i++) {
        const y = -2.4 + (4.8 * i) / 200;
        if (Math.abs(y) < 1e-3) continue;
        const t = (C - y ** 3) / y;
        if (t < 0) continue;
        p.push([Math.sqrt(t), y]);
      }
      return p;
    };
    const l = lienzo({
      id: 'f-exactas-potencial',
      ancho: 330, alto: 265,
      x: [-0.3, 3.4], y: [-2.5, 2.5], cuadrado: true,
      titulo: 'Las curvas de nivel del potencial x al cuadrado por y más y al cubo',
      desc: 'Varias curvas cruzan el dibujo de arriba abajo, cada una correspondiente a un valor '
        + 'distinto de la constante. Las de constante positiva quedan en la mitad de arriba y '
        + 'las de constante negativa en la de abajo, y ninguna corta a otra. Una de ellas está '
        + 'resaltada con trazo grueso y lleva marcado un punto: es la que pasa por la condición '
        + 'inicial, y es la que el problema pide cuando da un dato.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2, 3], marcasY: [[2, '2'], [-2, '−2']] });
    for (const C of [-8, -4, -1.5, 1.5, 4, 8]) {
      const p = curva(C).filter(([u, v]) => u <= 3.35 && v >= -2.45 && v <= 2.45);
      if (p.length > 1) l.poli(p, { clase: 'g' });
    }
    const dest = curva(6).filter(([u, v]) => u <= 3.35 && v >= -2.45 && v <= 2.45);
    l.poli(dest, { clase: 'c' });
    l.punto(...dest[Math.floor(dest.length / 2)], { clase: 'o', r: 4.6 });
    l.esquina(10, 17, 'cada curva, un valor de C');
    return l.svg();
  });

/* ── 6 · ocho separables, y las constantes que hay que fijar ─────────── */

fig('ocho-separables-y-las-constantes-que-hay-que-fijar',
  'La solución general de y′ = −xeʸ es y = −ln(x²/2 + C), y aquí está dibujada para seis valores de C. Ninguna es «la» solución: la condición inicial no calcula la constante, elige qué curva de estas es la buena. Las cinco del enunciado que traen dato hacen eso.',
  () => {
    const y = (C) => (x) => -Math.log(x * x / 2 + C);
    const l = lienzo({
      id: 'f-separables-familia',
      ancho: 335, alto: 255,
      x: [-2.6, 2.6], y: [-2.1, 2.6], cuadrado: false,
      titulo: 'Seis soluciones de la misma ecuación separable, una por valor de la constante',
      desc: 'Seis curvas con forma de campana invertida, todas simétricas respecto del eje '
        + 'vertical y encajadas unas dentro de otras como las capas de una cebolla. La más alta '
        + 'corresponde a la constante más pequeña y la más baja a la mayor. Ninguna corta a '
        + 'otra. Una de ellas está resaltada y lleva un punto marcado sobre el eje vertical: es '
        + 'la que cumpliría una condición inicial concreta.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-2, -1, 1, 2], marcasY: [[2, '2'], [-2, '−2']] });
    for (const C of [0.2, 0.5, 1.5, 3, 6]) l.poli(dentroDe(y(C), [-2.55, 2.55], [-2.05, 2.55]), { clase: 'g' });
    l.poli(dentroDe(y(1), [-2.55, 2.55], [-2.05, 2.55]), { clase: 'c' });
    l.punto(0, 0, { clase: 'o', r: 4.6 });
    l.rotulo(0, 0, 'y(0) = 0  ⟹  C = 1', { dx: 8, dy: -6, color: 'var(--flag)' });
    return l.svg();
  });

/* ── 7 · seis lineales de primer orden ───────────────────────────────── */

fig('seis-lineales-de-primer-orden',
  'En una lineal la solución general siempre tiene la misma forma: una solución particular más K veces la de la homogénea. Aquí la particular es la recta −x/2 − ¼ y lo que K mueve es la exponencial que se le suma; por eso todas las curvas salen de la misma recta.',
  () => {
    const y = (K) => (x) => K * Math.exp(2 * x) - x / 2 - 0.25;
    const l = lienzo({
      id: 'f-lineales-familia',
      ancho: 335, alto: 255,
      x: [-2.2, 1.5], y: [-2.6, 3.4], cuadrado: false,
      titulo: 'Varias soluciones de la lineal, todas saliendo de la misma recta particular',
      desc: 'Una recta descendente cruza el dibujo: es la solución particular, sin exponencial. '
        + 'Alrededor de ella, varias curvas se van separando hacia arriba o hacia abajo según '
        + 'avanza x, cada vez más deprisa; por la izquierda, en cambio, todas se pegan a la '
        + 'recta hasta confundirse con ella. La separación es la exponencial, que por la '
        + 'izquierda se apaga y por la derecha domina.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-2, -1, 1], marcasY: [[2, '2'], [-2, '−2']] });
    for (const K of [0.4, 0.15, -0.15, -0.4]) {
      l.poli(dentroDe(y(K), [-2.15, 1.45], [-2.55, 3.35]), { clase: 'g' });
    }
    l.curva(y(0), [-2.15, 1.45], { clase: 'c', n: 2 });
    l.rotulo(-1.75, y(0)(-1.75), 'K = 0: la particular', { dx: 5, dy: -7 });
    return l.svg();
  });

/* ── 8 · seis homogéneas, y el cambio que las separa ─────────────────── */

fig('seis-homogeneas-y-el-cambio-que-las-separa',
  'Una EDO homogénea solo depende de y/x, y por eso su campo de direcciones es el mismo a lo largo de cada recta que pasa por el origen. Esa es la razón de que el cambio u = y/x la separe: en la variable u, la ecuación deja de ver la x.',
  () => {
    const l = lienzo({
      id: 'f-homogeneas-rayos',
      ancho: 330, alto: 260,
      x: [0.05, 3.3], y: [-1.6, 3.4], cuadrado: true,
      titulo: 'El campo de direcciones de una homogénea, constante a lo largo de cada rayo desde el origen',
      desc: 'Sobre tres rectas que salen del origen con pendientes distintas se dibujan trocitos '
        + 'de recta que representan el campo de direcciones. Sobre cada una de las tres rectas, '
        + 'todos los trocitos son paralelos entre sí, por lejos o cerca del origen que estén; '
        + 'entre una recta y otra, en cambio, la inclinación cambia. Encima, con trazo grueso, '
        + 'una solución de la ecuación, que corta las tres rectas con la inclinación que a cada '
        + 'una le corresponde.',
    });
    l.clase('campo', 'stroke: var(--faint); stroke-width: 1.5; fill: none;');
    /* y′ = 2 + y/x: la pendiente solo depende de u = y/x, y eso es lo que el
       dibujo tiene que enseñar. */
    for (const u of [-0.4, 0.35, 1.05]) {
      l.poli([[0.1, 0.1 * u], [3.25, 3.25 * u]], { clase: 'cp' });
      for (const x of [0.5, 1, 1.5, 2, 2.5, 3]) {
        const m = 2 + u;
        const k = 0.26 / (2 * Math.hypot(1, m));
        l.poli([[x - k, x * u - k * m], [x + k, x * u + k * m]], { clase: 'campo' });
      }
    }
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2, 3], marcasY: [[2, '2']] });
    l.poli(dentroDe((x) => 2 * x * Math.log(x) + 0.6 * x, [0.1, 3.2], [-1.55, 3.35]), { clase: 'c' });
    l.rotulo(2.6, 2.6 * 1.05, 'y/x = 1,05', { dx: -5, dy: -6, anclaje: 'end', color: 'var(--alt)', pequeno: true });
    l.rotulo(3.25, 3.25 * -0.4, 'y/x = −0,4', { dx: -4, dy: 13, anclaje: 'end', color: 'var(--alt)', pequeno: true });
    l.esquina(10, 17, 'sobre cada rayo, la misma pendiente');
    return l.svg();
  });

/* ── a pegar ─────────────────────────────────────────────────────────── */
for (const f of figuras) f.svg = f.hacer();

if (process.argv[1]?.endsWith('calculo-practica-t09-familias.mjs')) {
  for (const f of figuras) pegaEnCampo(f.fichero, f.id, f.campo, f.svg, f.pie);
  console.log(`${figuras.length} figuras de familias pegadas en ${FICHERO}`);
}
