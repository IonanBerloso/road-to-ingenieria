/**
 * Las figuras de las prácticas del tema 9 que se pueden mirar: las
 * cualitativas y las de modelado.
 *
 * Las otras once del boletín son «resuelve estas siete EDOs», y ahí no hay
 * nada que dibujar que no sea la propia cuenta. Pero las cualitativas son lo
 * contrario: piden hablar de la solución **sin resolverla**, y la herramienta
 * para eso es el campo de direcciones —en cada punto del plano, la pendiente
 * que la ecuación obliga a tener—. Y las de modelado acaban todas en la misma
 * pregunta, «¿qué pasa a largo plazo?», que es una recta horizontal en el
 * dibujo.
 *
 *     node scripts/figuras/calculo-practica-t09.mjs
 */

import { lienzo, mosaico } from './lienzo.mjs';
import { pegaEnCampo } from './pegar.mjs';

export const FICHERO = 'src/content/calculo/t09-ecuaciones-diferenciales/ejercicios.yaml';

export const figuras = [];
const fig = (id, pie, hacer) =>
  figuras.push({ fichero: FICHERO, id, campo: 'resolucion', pie, hacer });

/**
 * El campo de direcciones de y′ = f(x,y).
 *
 * Los trocitos se dibujan de longitud constante **en coordenadas de la
 * asignatura**, de modo que solo valen si los dos ejes tienen la misma
 * escala: con escalas distintas, una pendiente 1 no se vería a 45° y el campo
 * estaría mintiendo sobre lo único que tiene que decir.
 */
const campoDirecciones = (l, f, xs, ys, largo = 0.3) => {
  for (const x of xs) {
    for (const y of ys) {
      const m = f(x, y);
      if (!Number.isFinite(m)) continue;
      const k = largo / (2 * Math.hypot(1, m));
      l.poli([[x - k, y - k * m], [x + k, y + k * m]], { clase: 'campo' });
    }
  }
};

const CAMPO_CSS = 'stroke: var(--faint); stroke-width: 1.5; fill: none;';
const rango = (a, b, paso) => {
  const s = [];
  for (let v = a; v <= b + 1e-9; v += paso) s.push(Number(v.toFixed(6)));
  return s;
};

/* ── 1 · estudiar la solución sin resolver la ecuación ───────────────── */

fig('estudio-cualitativo-sin-resolver',
  'El campo de direcciones de y′ = −xy dice todo lo del apartado (a) sin resolver nada: a la izquierda del eje vertical los trocitos suben y a la derecha bajan, así que la solución crece hasta x = 0 y decrece después. La curva gruesa es la que pasa por (0,3).',
  () => {
    const sol = (x) => 3 * Math.exp((-x * x) / 2);
    const l = lienzo({
      id: 'f-cualitativo-menos-xy',
      ancho: 330, alto: 250,
      x: [-2.6, 2.6], y: [-0.5, 3.7], cuadrado: true,
      titulo: 'El campo de direcciones de y prima igual a menos x por y, con la solución que pasa por cero coma tres',
      desc: 'Una retícula de trocitos de recta cubre el dibujo: en cada punto, el trocito tiene '
        + 'la pendiente que la ecuación obliga a tener a la solución que pase por ahí. A la '
        + 'izquierda del eje vertical los trocitos apuntan hacia arriba y a la derecha hacia '
        + 'abajo; sobre el propio eje vertical están todos horizontales. Encima, con trazo '
        + 'grueso, la solución que arranca en el punto de altura tres sobre el eje vertical: '
        + 'sube por la izquierda, alcanza su máximo justo en x igual a cero y baja por la '
        + 'derecha, con forma de campana.',
    });
    l.clase('campo', CAMPO_CSS);
    campoDirecciones(l, (x, y) => -x * y, rango(-2.4, 2.4, 0.6), rango(0.25, 3.55, 0.55), 0.42);
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-2, -1, 1, 2], marcasY: [3] });
    l.curva(sol, [-2.55, 2.55], { clase: 'c', n: 140 });
    l.punto(0, 3, { clase: 'o', r: 4.6 });
    l.rotulo(0, 3, 'y(0) = 3', { dx: 8, dy: -4, color: 'var(--flag)' });
    l.rotulo(-1.6, sol(-1.6), 'crece', { dx: -5, dy: -6, anclaje: 'end' });
    l.rotulo(1.6, sol(1.6), 'decrece', { dx: 5, dy: -6 });
    return l.svg();
  });

/* ── 2 · tres EDOs de las que hay que hablar sin resolverlas ─────────── */

fig('sacarle-informacion-a-una-edo-sin-resolverla',
  'Para y′ = x² − y, la parábola y = x² es la frontera: por encima de ella la solución decrece y por debajo crece, porque ahí es donde y′ cambia de signo. Las tres curvas son soluciones distintas, y todas acaban pegándose a la misma parábola.',
  () => {
    const l = lienzo({
      id: 'f-cualitativo-x2-menos-y',
      ancho: 335, alto: 255,
      x: [-2.3, 3.4], y: [-1.6, 5.4], cuadrado: true,
      titulo: 'El campo de direcciones de y prima igual a x al cuadrado menos y, con la parábola donde la derivada se anula',
      desc: 'Una retícula de trocitos de recta cubre el dibujo. Cruzándola, una parábola '
        + 'dibujada a trazos: es el lugar de los puntos donde la derivada vale cero, y ahí todos '
        + 'los trocitos están horizontales. Por encima de la parábola los trocitos bajan y por '
        + 'debajo suben. Tres soluciones dibujadas con trazo grueso salen de alturas distintas y '
        + 'las tres acaban acercándose a la misma curva por la derecha, siguiendo la parábola.',
    });
    l.clase('campo', CAMPO_CSS);
    campoDirecciones(l, (x, y) => x * x - y, rango(-2, 3, 0.62), rango(-1.3, 5.1, 0.64), 0.42);
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-2, -1, 1, 2, 3], marcasY: [2, 4] });
    l.curva((x) => x * x, [-2.28, 2.28], { clase: 'cp2' });
    /* Las soluciones de y′ = x²−y son y = x²−2x+2 + K e^{−x}: la parábola
       trasladada más una exponencial que se apaga. Cada una se recorta donde
       se saldría del marco, que no es en el mismo sitio para todas. */
    for (const [K, a, b] of [[1.2, -0.4, 3.0], [0, -0.8, 3.0], [-1.4, -1.0, 3.0]]) {
      l.curva((x) => x * x - 2 * x + 2 + K * Math.exp(-x), [a, b], { clase: 'c', n: 100 });
    }
    l.rotulo(1.35, 1.82, 'y = x²', { dx: -6, dy: 12, anclaje: 'end', color: 'var(--alt)' });
    l.esquina(10, 17, 'encima decrece, debajo crece');
    return l.svg();
  });

/* ── 3 · el embalse, y qué pasa a largo plazo ────────────────────────── */

fig('embalse-y-largo-plazo',
  'Da igual con cuánta agua se empiece: la exponencial se apaga y todas las soluciones acaban en los mismos 20 000 litros. Ese nivel es donde la lluvia que entra iguala a la evaporación que sale, y se lee de la propia ecuación haciendo C′ = 0.',
  () => {
    const C = (K) => (t) => 20000 + K * Math.exp(-0.05 * t);
    const l = lienzo({
      id: 'f-embalse',
      ancho: 335, alto: 240,
      x: [-8, 92], y: [-2500, 38000], cuadrado: false, margen: 44,
      titulo: 'Varias soluciones del embalse, todas convergiendo a veinte mil litros',
      desc: 'Una línea horizontal de puntos marca el nivel de veinte mil litros. Cuatro curvas '
        + 'parten de niveles iniciales distintos, dos por encima y dos por debajo, y todas se '
        + 'van acercando a esa línea según avanza el tiempo, sin cruzarla: las de arriba bajan y '
        + 'las de abajo suben. Al cabo de unos sesenta meses todas son prácticamente '
        + 'indistinguibles de la línea.',
    });
    l.ejes({
      nombreX: 't (meses)', nombreY: 'C (litros)',
      marcasX: [30, 60, 90], marcasY: [[20000, '20 mil'], [35000, '35 mil']],
    });
    l.poli([[-8, 20000], [92, 20000]], { clase: 'cp2' });
    for (const K of [15000, 6000, -8000, -18000]) l.curva(C(K), [0, 90], { clase: 'c', n: 90 });
    l.esquina(10, 17, 'el equilibrio: C′ = 0 cuando C = 20 000');
    return l.svg();
  });

/* ── 4 · el paracaidista y su velocidad límite ───────────────────────── */

fig('paracaidista-y-velocidad-limite',
  'La velocidad no crece sin freno: el rozamiento crece con ella hasta igualar al peso, y ahí la aceleración se anula. Con m = 50, k = 10 y g = 10 eso ocurre en 50 m/s, y se alcanza con un 99 % a los 25 segundos.',
  () => {
    const v = (t) => 50 * (1 - Math.exp(-t / 5));
    const l = lienzo({
      id: 'f-paracaidista',
      ancho: 330, alto: 240,
      x: [-2.5, 29], y: [-6, 62], cuadrado: false,
      titulo: 'La velocidad del paracaidista acercándose a los cincuenta metros por segundo',
      desc: 'Una curva sale del origen subiendo muy deprisa y va doblándose hasta quedar casi '
        + 'horizontal, pegada a una línea de puntos situada a la altura cincuenta. Esa línea es '
        + 'la velocidad terminal. Junto al origen, una recta de puntos marca la pendiente '
        + 'inicial, que es la de la caída libre sin rozamiento: la curva arranca con esa '
        + 'pendiente y se va separando de ella en cuanto el rozamiento cuenta.',
    });
    l.ejes({ nombreX: 't (s)', nombreY: 'v (m/s)', marcasX: [5, 10, 20], marcasY: [[50, '50']] });
    l.poli([[-2.5, 50], [29, 50]], { clase: 'cp2' });
    l.curva((t) => 10 * t, [0, 5.6], { clase: 'g', n: 2 });
    l.curva(v, [0, 28.5], { clase: 'c', n: 110 });
    l.punto(0, 0, { r: 3.6 });
    l.rotulo(27, 50, 'velocidad terminal', { dx: 0, dy: 19, anclaje: 'end', color: 'var(--alt)' });
    l.rotulo(5.6, 56, 'caída libre (sin aire)', { dx: 4, dy: 4, color: 'var(--faint)', pequeno: true });
    return l.svg();
  });

/* ── 5 · la ley de Newton del enfriamiento ───────────────────────────── */

fig('barra-que-se-calienta',
  'La barra no se calienta a ritmo constante: cuanto más se acerca a los 100 °C del agua, más despacio sube. Por eso llegar de 20 a 90 cuesta 83 s y los últimos ocho grados, hasta 98, cuestan otros 64: casi lo mismo que todo el camino anterior.',
  () => {
    const T = (t) => 100 - 80 * Math.exp(-0.025 * t);
    const l = lienzo({
      id: 'f-barra-newton',
      ancho: 340, alto: 250,
      x: [-14, 175], y: [-8, 118], cuadrado: false,
      titulo: 'La temperatura de la barra subiendo de veinte a cien grados cada vez más despacio',
      desc: 'Una curva arranca a los veinte grados y sube, primero deprisa y luego cada vez más '
        + 'despacio, acercándose a una línea de puntos situada a los cien grados, que es la '
        + 'temperatura del agua hirviendo. Dos líneas verticales de puntos marcan los instantes '
        + 'en que la barra llega a noventa grados, a los ochenta y tres segundos, y a noventa y '
        + 'ocho, a los ciento cuarenta y ocho. Se ve que el segundo tramo, de solo ocho grados, '
        + 'tarda casi tanto como los setenta anteriores.',
    });
    l.ejes({
      nombreX: 't (s)', nombreY: 'T (°C)',
      marcasX: [[83.2, '83'], [147.6, '148']], marcasY: [[20, '20'], [90, '90'], [100, '100']],
    });
    l.poli([[-14, 100], [175, 100]], { clase: 'cp2' });
    l.poli([[-14, 90], [83.2, 90]], { clase: 'g' });
    l.poli([[83.2, -8], [83.2, 90]], { clase: 'g' });
    l.poli([[147.6, -8], [147.6, 98]], { clase: 'g' });
    l.curva(T, [0, 172], { clase: 'c', n: 120 });
    l.punto(0, 20, { r: 4 });
    l.punto(83.2, 90, { clase: 'o', r: 4.4 });
    l.punto(147.6, 98, { clase: 'o', r: 4.4 });
    l.rotulo(140, 100, 'el agua: 100 °C', { dx: 0, dy: -9, anclaje: 'end', color: 'var(--alt)' });
    l.rotulo(115, 78, '8 °C más: 64 s', { dx: 0, dy: 0, anclaje: 'middle', pequeno: true });
    return l.svg();
  });

/* ── 6 · un almacén, una epidemia y unos plátanos ────────────────────── */

fig('tres-problemas-de-modelado-con-edos',
  'Los tres tienen la misma forma y el mismo final: una magnitud que se acerca a su equilibrio y no lo pasa. Cambia solo qué es el equilibrio —20 000 libros, los 100 habitantes del municipio, el punto de maduración 2— y a qué velocidad se llega.',
  () => {
    const celda = (etiqueta, f, x, y, marcaX, marcaY, eq, dibuja) => ({
      etiqueta,
      x, y, cuadrado: false, margen: 40,
      dibuja: (l) => {
        l.ejes({ nombreX: 't', nombreY: '', marcasX: marcaX, marcasY: marcaY });
        l.poli([[x[0], eq], [x[1], eq]], { clase: 'cp2' });
        l.curva(f, [0, x[1] * 0.97], { clase: 'c', n: 110 });
        if (dibuja) dibuja(l);
      },
    });
    const k = Math.log(99 / 24);
    return mosaico({
      id: 'f-tres-modelos',
      columnas: 3,
      titulo: 'Los tres modelos: el almacén, la epidemia y la maduración de los plátanos',
      desc: 'Tres recuadros. En el primero, el número de libros del almacén sube desde un valor '
        + 'inicial bajo y se estabiliza en veinte mil, marcado con una línea de puntos. En el '
        + 'segundo, el número de contagiados sigue una curva con forma de ese: empieza casi '
        + 'plana, se dispara y vuelve a aplanarse al acercarse a los cien habitantes del '
        + 'municipio; una marca señala el día en que se alcanza el noventa por ciento, cerca del '
        + 'cuarto día y ocho décimas. En el tercero, el estado de maduración sube desde cero '
        + 'coma cinco hacia dos y cruza el uno coma cinco, el punto de consumo, a las dos '
        + 'semanas y dos décimas.',
      celdas: [
        /* Aquí el equilibrio se rotula dentro del panel y no como marca del
           eje: «20 000» no cabe a la izquierda de la vertical sin comerse
           medio recuadro, y estrecharlo para que quepa dejaría la curva
           aplastada. */
        celda('9.15 el almacén', (t) => 20000 - 14000 * Math.exp(-0.02 * t), [-18, 210], [-2600, 26000],
          [100, 200], [], 20000, (l) => {
            l.rotulo(200, 20000, '20 000', { dx: 0, dy: -8, anclaje: 'end', color: 'var(--alt)', pequeno: true });
          }),
        celda('9.16 la epidemia', (t) => 100 / (1 + 99 * Math.exp(-k * t)), [-0.6, 7.4], [-12, 120],
          [[4.79, '4,8']], [[100, '100']], 100, (l) => {
            l.poli([[4.79, -12], [4.79, 90]], { clase: 'g' });
            l.punto(4.79, 90, { clase: 'o', r: 3.8 });
            l.rotulo(4.79, 90, '90 %', { dx: 6, dy: 10, color: 'var(--flag)', pequeno: true });
          }),
        celda('9.17 los plátanos', (t) => 2 - 1.5 * Math.exp(-0.5 * t), [-0.45, 5.4], [-0.25, 2.4],
          [[2.2, '2,2']], [[2, '2'], [1.5, '1,5']], 2, (l) => {
            l.poli([[2.197, -0.25], [2.197, 1.5]], { clase: 'g' });
            l.punto(2.197, 1.5, { clase: 'o', r: 3.8 });
          }),
      ],
    });
  });

/* ── 7 · cuando la particular ya está en la homogénea ────────────────── */

fig('particular-que-resuena',
  'Esa es la resonancia: el segundo miembro 4·cos 5x es exactamente una solución de la homogénea, así que la particular no puede ser otro coseno — tiene que llevar una x delante, y por eso la amplitud crece sin tope en vez de quedarse acotada.',
  () => {
    const l = lienzo({
      id: 'f-resonancia',
      ancho: 340, alto: 250,
      x: [-0.4, 6.6], y: [-1.6, 1.6], cuadrado: false,
      titulo: 'La solución resonante, cuya amplitud crece linealmente, frente a una acotada',
      desc: 'Dos ondas comparten el dibujo. Una, dibujada con trazo fino, es un coseno normal '
        + 'que oscila siempre entre los mismos dos valores. La otra, con trazo grueso, oscila '
        + 'con la misma frecuencia pero cada vez más alto y más bajo: su amplitud crece. Dos '
        + 'rectas de puntos que salen del origen abriéndose en uve envuelven a esa segunda onda '
        + 'y enseñan que la amplitud crece proporcionalmente a x. Esa es la marca de la '
        + 'resonancia.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [2, 4, 6] });
    l.curva((x) => 0.22 * x, [0, 6.5], { clase: 'g', n: 2 });
    l.curva((x) => -0.22 * x, [0, 6.5], { clase: 'g', n: 2 });
    l.curva((x) => 0.7 * Math.cos(5 * x), [-0.35, 6.5], { clase: 'fue', n: 380 });
    l.curva((x) => 0.22 * x * Math.sin(5 * x), [0, 6.5], { clase: 'c', n: 420 });
    l.rotulo(5.6, 1.23, 'x·sen 5x: crece', { dx: -4, dy: -6, anclaje: 'end' });
    l.rotulo(1.2, -0.7, 'cos 5x: acotado', { dx: 0, dy: 16, anclaje: 'middle', color: 'var(--faint)', pequeno: true });
    return l.svg();
  });

/* ── a pegar ─────────────────────────────────────────────────────────── */
for (const f of figuras) f.svg = f.hacer();

if (process.argv[1]?.endsWith('calculo-practica-t09.mjs')) {
  for (const f of figuras) pegaEnCampo(f.fichero, f.id, f.campo, f.svg, f.pie);
  console.log(`${figuras.length} figuras de práctica pegadas en ${FICHERO}`);
}
