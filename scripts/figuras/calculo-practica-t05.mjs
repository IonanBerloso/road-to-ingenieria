/**
 * Las figuras de las prácticas del tema 5: la integral de una variable.
 *
 * Aquí el dibujo hace dos trabajos distintos. En los ejercicios de área y
 * volumen dice **qué región** se integra, que es la mitad del problema. En los
 * del teorema de la media y las impropias dice **por qué** la respuesta es la
 * que es: el rectángulo de la media, o el trozo de área que se escapa.
 *
 *     node scripts/figuras/calculo-practica-t05.mjs
 */

import { lienzo, mosaico, reetiqueta } from './lienzo.mjs';
import { pegaEnCampo } from './pegar.mjs';
import { figuras as ejemplos } from './calculo-ejemplos.mjs';
import { figuras as t05 } from './calculo-t05.mjs';

const FICHERO = 'src/content/calculo/t05-integracion/ejercicios.yaml';
const P = Math.PI;

export const figuras = [];
const fig = (id, pie, hacer) => figuras.push({ fichero: FICHERO, id, campo: 'resolucion', pie, hacer });

const entre = (arriba, abajo, a, b, n = 80) => {
  const p = [];
  for (let k = 0; k <= n; k++) { const x = a + ((b - a) * k) / n; p.push([x, arriba(x)]); }
  for (let k = 0; k <= n; k++) { const x = b + ((a - b) * k) / n; p.push([x, abajo(x)]); }
  return p;
};

const deLista = (lista, id) => {
  const f = lista.find((x) => x.id === id);
  if (!f) throw new Error(`no está la figura ${id}`);
  return f.svg;
};

/* ── 1 · el teorema de la media, cuatro casos ────────────────────────── */
fig('teorema-de-la-media',
  'Los cuatro casos: el rectángulo de la media tiene siempre la misma área que la región, y el punto c es donde la curva lo corta.',
  () => {
    const panel = (etiqueta, f, [a, b], media, ces, x, y, marcasX, marcasY, n = 60) => ({
      etiqueta, x, y, cuadrado: false,
      dibuja: (l) => {
        l.poli(entre(f, () => 0, a, b, n), { clase: 'f', cerrar: true });
        l.ejes({ nombreX: 'x', nombreY: 'y', marcasX, marcasY });
        l.curva(f, [a, b], { clase: 'c', n });
        l.poli([[a, media], [b, media]], { clase: 'c2' });
        for (const c of ces) l.punto(c, media, { clase: 'o', r: 3.6 });
      },
    });
    const cA = Math.sqrt(13 / 3);
    const mB = 1.3;
    const mD = 2 / P;
    return mosaico({
      id: 'f-pt5-media',
      titulo: 'El teorema de la media en cuatro funciones, con su altura media y sus puntos c',
      desc: 'Cuatro gráficas independientes, cada una con su región sombreada y una recta '
        + 'horizontal a la altura del valor medio. En la parábola tres x al cuadrado sobre menos '
        + 'uno y cuatro la media vale trece y el punto c está en dos coma cero ocho. En el valor '
        + 'absoluto de x menos dos sobre cero y cinco la media vale uno coma tres y hay dos '
        + 'puntos, cero coma siete y tres coma tres. En el seno sobre cero y dos pi la media es '
        + 'cero y el punto es pi. Y en el seno sobre cero y pi la media vale dos partido por pi y '
        + 'otra vez hay dos puntos.',
      columnas: 2, ancho: 205, alto: 165,
      celdas: [
        panel('(a) 3x² en [−1,4] · media 13', (x) => 3 * x * x, [-1, 4], 13, [cA],
          [-1.6, 4.6], [-6, 52], [-1, 4], [13]),
        panel('(b) |x−2| en [0,5] · media 1,3', (x) => Math.abs(x - 2), [0, 5], mB, [0.7, 3.3],
          [-0.6, 5.6], [-0.6, 3.4], [2, 5], [[mB, '1,3']], 40),
        panel('(c) sen x en [0,2π] · media 0', Math.sin, [0, 2 * P], 0, [P],
          [-0.6, 2 * P + 0.6], [-1.5, 1.5], [[P, 'π'], [2 * P, '2π']], []),
        panel('(d) sen x en [0,π] · media 2/π', Math.sin, [0, P], mD, [0.6901, P - 0.6901],
          [-0.5, P + 0.5], [-0.45, 1.35], [[P, 'π']], [[mD, '2/π']]),
      ],
    });
  });

/* ── 2 · el parámetro que hace continua la función ───────────────────── */
fig('parametro-para-la-media',
  'Con a = 1 las dos ramas empalman en (1,2) y la función es continua: por eso vale el teorema. La media sale −0,44.',
  () => {
    const f = (x) => (x <= 1 ? x + 1 : 3 - x * x);
    const m = -4 / 9;
    const l = lienzo({
      id: 'f-pt5-parametro-media',
      ancho: 340, alto: 235,
      x: [-3.4, 3.4], y: [-6.8, 3.2],
      titulo: 'Las dos ramas empalmadas en (1,2), con la recta del valor medio',
      desc: 'De menos tres a uno, la recta x más uno sube de menos dos a dos. De uno a tres, la '
        + 'parábola tres menos x al cuadrado baja de dos a menos seis. Con a igual a uno las dos '
        + 'ramas valen dos en x igual a uno, así que no hay salto y el teorema se puede aplicar. '
        + 'La horizontal del valor medio, a altura menos cero coma cuarenta y cuatro, corta la '
        + 'gráfica en dos puntos: uno en cada rama.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-3, 1, 3], marcasY: [2, -6] });
    l.poli([[-3, -2], [1, 2]], { clase: 'c' });
    l.curva((x) => 3 - x * x, [1, 3], { clase: 'c', n: 40 });
    l.poli([[-3.3, m], [3.3, m]], { clase: 'c2' });
    l.punto(1, 2, { clase: 'o', r: 4.2 });
    l.punto(-1 - 4 / 9, m, { r: 4 });
    l.punto(Math.sqrt(3 + 4 / 9), m, { r: 4 });
    l.rotulo(1, 2, 'empalme (1,2)', { dx: 7, dy: -5, color: 'var(--flag)' });
    l.rotulo(-3.3, m, 'media −0,44', { dx: 4, dy: -7, color: 'var(--alt)' });
    return l.svg();
  });

/* ── 3 · continua sí, derivable no ───────────────────────────────────── */
fig('continuidad-media-y-derivabilidad',
  'La condición de continuidad ata las dos ramas en (2, ln 2). Queda una familia de parábolas, dibujadas a trazos: la media elige una.',
  () => {
    const l = lienzo({
      id: 'f-pt5-continuidad-media',
      ancho: 330, alto: 235,
      x: [-0.3, 3.4], y: [-0.35, 2.2],
      titulo: 'El logaritmo hasta x = 2 y la familia de parábolas que empalman con él',
      desc: 'De uno a dos, el logaritmo sube de cero a cero coma sesenta y nueve. De dos a tres, '
        + 'una parábola a x al cuadrado más b. La continuidad obliga a que valga cero coma sesenta '
        + 'y nueve en x igual a dos, y eso deja una familia: tres parábolas a trazos que salen '
        + 'todas del mismo punto con pendientes distintas. La condición sobre el valor medio es la '
        + 'que elige una.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2, 3], marcasY: [[Math.LN2, 'ln 2'], 1, 2] });
    l.curva(Math.log, [1, 2], { clase: 'c', n: 40 });
    for (const a of [0.05, 0.15, 0.25]) {
      l.curva((x) => a * x * x + (Math.LN2 - 4 * a), [2, 3], { clase: 'cp2', n: 30 });
    }
    l.punto(2, Math.LN2, { clase: 'o', r: 4.4 });
    l.rotulo(2, Math.LN2, '4a + b = ln 2', { dx: -7, dy: -7, anclaje: 'end', color: 'var(--flag)' });
    l.esquina(14, 18, 'continua: sí · derivable: depende de a');
    return l.svg();
  });

/* ── 4 · tres funciones integrales a trozos ──────────────────────────── */
fig('funciones-integrales-a-trozos',
  'Las tres primitivas: la esquina del integrando se convierte en un cambio de curvatura, no en un pico. Por eso salen derivables.',
  () =>
    mosaico({
      id: 'f-pt5-integrales-trozos',
      titulo: 'Las tres funciones integrales, todas continuas y sin picos',
      desc: 'Tres gráficas independientes. La primera, la integral del valor absoluto de z menos '
        + 'uno, sube hasta un medio en x igual a uno con la pendiente cada vez menor y luego '
        + 'vuelve a acelerar. La segunda, la de una función que primero crece y luego se queda '
        + 'plana, es una parábola hasta x igual a dos y una recta después. La tercera, la del '
        + 'valor absoluto del seno, sube en escalones suaves de dos en dos unidades por cada pi. '
        + 'En las tres, donde el integrando tiene una esquina la primitiva solo cambia de '
        + 'curvatura: sigue siendo derivable.',
      columnas: 3, ancho: 176, alto: 158,
      celdas: [
        {
          etiqueta: '(a) ∫₀ˣ|z−1|dz',
          x: [-0.25, 2.6], y: [-0.25, 1.4], cuadrado: false,
          dibuja: (l) => {
            const F = (x) => (x <= 1 ? x - (x * x) / 2 : 0.5 + ((x - 1) ** 2) / 2);
            l.ejes({ nombreX: 'x', nombreY: 'F', marcasX: [1, 2], marcasY: [[0.5, '½'], 1] });
            l.curva(F, [0, 2.5], { clase: 'c', n: 60 });
            l.punto(1, 0.5, { clase: 'o', r: 3.6 });
          },
        },
        {
          etiqueta: '(b) escalón integrado',
          x: [-0.35, 4.4], y: [-0.5, 6.4], cuadrado: false,
          dibuja: (l) => {
            const F = (x) => (x <= 2 ? (x * x) / 2 : 2 + 2 * (x - 2));
            l.ejes({ nombreX: 'x', nombreY: 'F', marcasX: [2, 4], marcasY: [2, 6] });
            l.curva(F, [0, 4.2], { clase: 'c', n: 60 });
            l.punto(2, 2, { clase: 'o', r: 3.6 });
          },
        },
        {
          etiqueta: '(c) ∫₀ˣ|sen z|dz',
          x: [-0.35, 2 * P + 0.4], y: [-0.5, 4.8], cuadrado: false,
          dibuja: (l) => {
            const F = (x) => (x <= P ? 1 - Math.cos(x) : 3 + Math.cos(x));
            l.ejes({ nombreX: 'x', nombreY: 'F', marcasX: [[P, 'π'], [2 * P, '2π']], marcasY: [2, 4] });
            l.curva(F, [0, 2 * P], { clase: 'c', n: 80 });
            l.punto(P, 2, { clase: 'o', r: 3.6 });
          },
        },
      ],
    }));

/* ── 5, 7, 8, 9 · las que repiten un ejemplo o un ejercicio del tema ─── */
fig('area-y-volumen-exponencial',
  'El dominio bajo la exponencial y la trompeta que genera al girar: la misma figura del ejemplo del tema.',
  () => reetiqueta(deLista(t05, 'el-area-y-el-volumen-de-la-exponencial'), 'f-exp-area-volumen', 'f-pt5-exp'));

fig('raiz-frente-a-valor-absoluto',
  'La hoja entre la raíz y la uve, con los cortes en (½,½) y (2,1): la misma figura del ejercicio guiado del tema.',
  () => reetiqueta(deLista(t05, 'la-raiz-contra-el-valor-absoluto'), 'f-raiz-vs-uve', 'f-pt5-raiz-uve'));

fig('parametro-por-area',
  'La lente entre y = 3x e y = x², que es el caso a = 3: el área vale 9/2, que es justo lo que pide el enunciado.',
  () => {
    const l = lienzo({
      id: 'f-pt5-parametro-area',
      ancho: 300, alto: 245,
      x: [-0.6, 3.6], y: [-1, 10], cuadrado: false,
      titulo: 'La lente entre la recta y = 3x y la parábola y = x², de área nueve medios',
      desc: 'La recta y igual a tres x va por encima y la parábola y igual a x al cuadrado por '
        + 'debajo, entre el origen y el punto (3,9), que son sus dos cortes. Entre las dos queda '
        + 'una lente cuya separación máxima, nueve cuartos, se da en x igual a tres medios. Su '
        + 'área es nueve medios, que es el dato del enunciado, y de ahí sale que a vale tres.',
    });
    l.poli(entre((x) => 3 * x, (x) => x * x, 0, 3), { clase: 'f', cerrar: true });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [[1.5, '3/2'], 3], marcasY: [9] });
    l.curva((x) => 3 * x, [0, 3.3], { clase: 'c' });
    l.curva((x) => x * x, [-0.5, 3.15], { clase: 'c2', n: 60 });
    l.poli([[1.5, 2.25], [1.5, 4.5]], { clase: 'g' });
    l.punto(0, 0, { r: 3.6 });
    l.punto(3, 9, { r: 3.6 });
    l.rotulo(1.5, 3.4, '9/4', { dx: 5, dy: 4, color: 'var(--faint)', pequeno: true });
    l.rotulo(3, 9, '(3,9)', { dx: -6, dy: -6, anclaje: 'end' });
    return l.svg();
  });

fig('parabola-tumbada',
  'La parábola tumbada y² = 4+x cerrada por x = 2: en franjas horizontales es una sola integral, en verticales serían dos.',
  () => {
    const l = lienzo({
      id: 'f-pt5-parabola-tumbada',
      ancho: 330, alto: 235,
      x: [-4.8, 2.8], y: [-3.2, 3.2], cuadrado: false,
      titulo: 'La parábola tumbada con el vértice en (−4,0), cerrada por la vertical x = 2',
      desc: 'La parábola y al cuadrado igual a cuatro más x está tumbada y abierta hacia la '
        + 'derecha, con el vértice en el punto (−4,0). La vertical x igual a dos la cierra, '
        + 'cortándola en más y menos raíz de seis, unos dos coma cuarenta y cinco. Una franja '
        + 'horizontal de muestra va desde la parábola hasta esa vertical: ese es el orden que '
        + 'resuelve el ejercicio con una sola integral.',
    });
    const xDe = (y) => y * y - 4;
    const ym = Math.sqrt(6);
    l.poli([
      ...Array.from({ length: 61 }, (_, k) => { const y = -ym + (2 * ym * k) / 60; return [xDe(y), y]; }),
      [2, ym], [2, -ym],
    ], { clase: 'f', cerrar: true });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-4, 2], marcasY: [[ym, '√6'], [-ym, '−√6']] });
    l.curva((y) => [xDe(y), y], [-ym - 0.15, ym + 0.15], { clase: 'c', n: 80 });
    l.poli([[2, -3.1], [2, 3.1]], { clase: 'cp2' });
    l.poli([[xDe(1.2), 1.2], [2, 1.2]], { clase: 'cp' });
    l.punto(-4, 0, { clase: 'o', r: 4 });
    l.rotulo(-4, 0, 'vértice', { dx: 6, dy: -6, color: 'var(--flag)' });
    l.rotulo(2, 1.2, 'franja dx', { dx: -5, dy: -6, anclaje: 'end', color: 'var(--d1)' });
    return l.svg();
  });

/* ── 6 y 15 · la parábola entre sus dos tangentes ────────────────────── */
const parabolaDosTangentes = (id) => {
  const f = (x) => x * x + 2 * x + 2;
  const t1 = () => 1;
  const t2 = (x) => 6 * x - 2;
  const l = lienzo({
    id,
    ancho: 330, alto: 245,
    x: [-1.8, 2.6], y: [-0.5, 11],
    titulo: 'La parábola y sus dos tangentes: la del mínimo y la de pendiente seis',
    desc: 'La parábola y igual a x al cuadrado más dos x más dos tiene el mínimo en (−1,1), donde '
      + 'su tangente es la horizontal y igual a uno. La otra tangente, de pendiente seis, la toca '
      + 'en (2,10) y es la recta y igual a seis x menos dos. Las dos tangentes se cortan en x '
      + 'igual a un medio, y el recinto que encierran con la parábola es un triángulo curvo con '
      + 'el pico hacia abajo.',
  });
  const borde = [];
  for (let k = 0; k <= 60; k++) { const x = -1 + (3 * k) / 60; borde.push([x, f(x)]); }
  borde.push([0.5, t2(0.5)]);
  l.poli(borde, { clase: 'f', cerrar: true });
  l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-1, [0.5, '½'], 2], marcasY: [1, 10] });
  l.curva(f, [-1.7, 2.4], { clase: 'c', n: 60 });
  l.poli([[-1.7, t1()], [2.4, t1()]], { clase: 'c2' });
  l.curva(t2, [0.3, 2.4], { clase: 'c2' });
  l.punto(-1, 1, { clase: 'o', r: 4 });
  l.punto(2, 10, { clase: 'o', r: 4 });
  l.punto(0.5, 1, { r: 3.6 });
  l.rotulo(-1, 1, 'mínimo (−1,1)', { dx: 7, dy: 14 });
  l.rotulo(2, 10, '(2,10)', { dx: -6, dy: -6, anclaje: 'end' });
  l.rotulo(0.5, 1, 'se cortan aquí', { dx: 7, dy: -6, color: 'var(--flag)' });
  return l.svg();
};

fig('area-entre-parabola-y-dos-tangentes',
  'La parábola y sus dos tangentes: la horizontal del mínimo y la de pendiente 6. Se cortan en x = ½.',
  () => parabolaDosTangentes('f-pt5-dos-tangentes'));

fig('la-parabola-entre-sus-dos-tangentes',
  'El mismo recinto que el problema anterior del boletín: parábola, tangente en el mínimo y tangente de pendiente 6.',
  () => parabolaDosTangentes('f-pt5-dos-tangentes-bis'));

/* ── 10 · las cinco fórmulas clásicas ────────────────────────────────── */
fig('formulas-clasicas-con-integrales',
  'De dónde sale cada fórmula: el arco que se mide, el disco que se barre, la esfera que gira y el cono que se apila.',
  () =>
    mosaico({
      id: 'f-pt5-formulas',
      titulo: 'Las cuatro construcciones de las que salen las fórmulas clásicas',
      desc: 'Cuatro dibujos. El primero, la circunferencia de radio R con un arco marcado: la '
        + 'longitud se integra sobre él. El segundo, el mismo círculo con una franja vertical de '
        + 'muestra, que es como se barre el área. El tercero, la semicircunferencia que al girar '
        + 'genera la esfera, con un aro de muestra. Y el cuarto, el triángulo que al girar genera '
        + 'el cono de radio R y altura h, con un disco de muestra a media altura.',
      columnas: 2, ancho: 205, alto: 170,
      celdas: [
        {
          etiqueta: '(a) el perímetro',
          x: [-1.4, 1.4], y: [-1.4, 1.4], cuadrado: true,
          dibuja: (l) => {
            l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [[1, 'R']] });
            l.curva((t) => [Math.cos(t), Math.sin(t)], [0, 2 * P], { clase: 'g', n: 90 });
            l.curva((t) => [Math.cos(t), Math.sin(t)], [0.35, 1.2], { clase: 'c', n: 30 });
            l.rotulo(...[Math.cos(0.78), Math.sin(0.78)], 'ds', { dx: 6, dy: -4 });
          },
        },
        {
          etiqueta: '(b) el área',
          x: [-1.4, 1.4], y: [-1.4, 1.4], cuadrado: true,
          dibuja: (l) => {
            l.curva((t) => [Math.cos(t), Math.sin(t)], [0, 2 * P], { clase: 'f', n: 90, cerrar: true });
            l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [[1, 'R']] });
            l.curva((t) => [Math.cos(t), Math.sin(t)], [0, 2 * P], { clase: 'c', n: 90 });
            const h = Math.sqrt(1 - 0.36);
            l.poli([[0.6, -h], [0.6, h]], { clase: 'cp2' });
            l.rotulo(0.6, h, 'dx', { dx: 4, dy: -5, color: 'var(--alt)' });
          },
        },
        {
          etiqueta: '(c) y (d) la esfera',
          x: [-1.4, 1.4], y: [-1.4, 1.4], cuadrado: true,
          dibuja: (l) => {
            l.curva((t) => [Math.cos(t), Math.sin(t)], [0, P], { clase: 'f', n: 60, cerrar: true });
            l.poli([[-1.35, 0], [1.35, 0]], { clase: 'eje' });
            l.curva((t) => [Math.cos(t), Math.sin(t)], [0, P], { clase: 'c', n: 60 });
            l.curva((t) => [0.4 + 0.06 * Math.sin(t), Math.sqrt(1 - 0.16) * Math.cos(t)], [0, 2 * P], { clase: 'cp', n: 60 });
            l.rotulo(0.4, Math.sqrt(1 - 0.16), 'aro', { dx: 4, dy: -5, color: 'var(--d1)' });
          },
        },
        {
          etiqueta: '(e) el cono',
          x: [-0.3, 1.5], y: [-1.25, 1.25], cuadrado: false,
          dibuja: (l) => {
            l.poli([[0, 0], [1, 1], [1, -1]], { clase: 'f', cerrar: true });
            l.poli([[-0.25, 0], [1.45, 0]], { clase: 'eje' });
            l.poli([[0, 0], [1, 1]], { clase: 'c' });
            l.poli([[0, 0], [1, -1]], { clase: 'c' });
            l.curva((t) => [1 + 0.05 * Math.sin(t), Math.cos(t)], [0, 2 * P], { clase: 'c', n: 60 });
            l.curva((t) => [0.55 + 0.04 * Math.sin(t), 0.55 * Math.cos(t)], [0, 2 * P], { clase: 'cp', n: 60 });
            l.rotulo(1, 1, 'R', { dx: 4, dy: -4, color: 'var(--faint)', pequeno: true });
            l.rotulo(1.45, 0, 'h', { dx: -3, dy: -7, anclaje: 'end', color: 'var(--faint)', pequeno: true });
          },
        },
      ],
    }));

/* ── 11 · los dos elipsoides ─────────────────────────────────────────── */
fig('elipsoides',
  'La misma elipse girada de dos maneras: sobre OX sale un puro alargado; sobre OY, un platillo. Los volúmenes salen 20π/3 y 100π/3.',
  () =>
    mosaico({
      id: 'f-pt5-elipsoides',
      titulo: 'Los dos elipsoides que genera la misma elipse, según el eje de giro',
      desc: 'A la izquierda, la elipse de semiejes cinco y uno girada alrededor del eje '
        + 'horizontal: sale un cuerpo alargado y estrecho, como un puro, de volumen veinte pi '
        + 'tercios. A la derecha, la misma elipse girada alrededor del eje vertical: sale un '
        + 'cuerpo ancho y aplastado, como un platillo, de volumen cien pi tercios, cinco veces '
        + 'mayor. La elipse es la misma; lo que cambia es qué semieje se repite.',
      columnas: 2, ancho: 205, alto: 170,
      celdas: [
        {
          etiqueta: 'sobre OX · 20π/3',
          x: [-6.2, 6.2], y: [-2.6, 2.6], cuadrado: false,
          dibuja: (l) => {
            l.curva((t) => [5 * Math.cos(t), Math.sin(t)], [0, 2 * P], { clase: 'f', n: 90, cerrar: true });
            l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [5], marcasY: [1] });
            l.curva((t) => [5 * Math.cos(t), Math.sin(t)], [0, 2 * P], { clase: 'c', n: 90 });
            l.curva((t) => [0.3 * Math.sin(t), Math.cos(t)], [0, 2 * P], { clase: 'cp', n: 60 });
            l.poli([[-6, 0], [6, 0]], { clase: 'c2' });
            l.rotulo(-6, 0, 'eje', { dx: 4, dy: -6, color: 'var(--alt)' });
          },
        },
        {
          etiqueta: 'sobre OY · 100π/3',
          x: [-6.2, 6.2], y: [-2.6, 2.6], cuadrado: false,
          dibuja: (l) => {
            l.curva((t) => [5 * Math.cos(t), Math.sin(t)], [0, 2 * P], { clase: 'f2', n: 90, cerrar: true });
            l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [5], marcasY: [1] });
            l.curva((t) => [5 * Math.cos(t), Math.sin(t)], [0, 2 * P], { clase: 'c2', n: 90 });
            l.curva((t) => [5 * Math.cos(t), 0.22 * Math.sin(t)], [0, 2 * P], { clase: 'cp2', n: 60 });
            l.poli([[0, -2.4], [0, 2.4]], { clase: 'c' });
            l.rotulo(0, 2.4, 'eje', { dx: 5, dy: 2, color: 'var(--d1)' });
          },
        },
      ],
    }));

/* ── 12 y 16 · la longitud del arco de parábola ──────────────────────── */
const arcoParabola = (id) => {
  const f = (x) => x * x + x - 2;
  const l = lienzo({
    id,
    ancho: 320, alto: 235,
    x: [-2.6, 1.6], y: [-2.8, 1.2],
    titulo: 'El arco de la parábola y = x²+x−2 entre sus dos cortes con el eje',
    desc: 'La parábola corta el eje horizontal exactamente en menos dos y en uno, que son los '
      + 'extremos del arco que hay que medir, y tiene el vértice en el punto (−0,5 ; −2,25). El '
      + 'trozo que se mide es la curva entre esos dos cortes, dibujada en trazo grueso.',
  });
  l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-2, 1], marcasY: [-2] });
  l.curva(f, [-2.5, 1.5], { clase: 'g', n: 60 });
  l.curva(f, [-2, 1], { clase: 'c', n: 60 });
  l.punto(-2, 0, { r: 4 });
  l.punto(1, 0, { r: 4 });
  l.punto(-0.5, -2.25, { clase: 'o', r: 4 });
  l.rotulo(-0.5, -2.25, 'vértice (−0,5 ; −2,25)', { dx: 8, dy: 4, color: 'var(--flag)' });
  return l.svg();
};

fig('longitud-de-arco-parabola',
  'El arco que se mide: de (−2,0) a (1,0), pasando por el vértice en (−0,5 ; −2,25).',
  () => arcoParabola('f-pt5-arco-parabola'));

fig('la-longitud-que-el-boletin-deja-a-medias',
  'El mismo arco del problema 8: de (−2,0) a (1,0). Es el trozo cuya longitud el boletín deja sin terminar.',
  () => arcoParabola('f-pt5-arco-parabola-bis'));

/* ── 13 · la parábola y su tangente paralela ─────────────────────────── */
fig('parabola-y-su-tangente-paralela',
  'La tangente de pendiente 8 toca en (1,4) y corta el eje en x = ½: el recinto del primer cuadrante es el triángulo curvo entre las dos.',
  () => {
    const l = lienzo({
      id: 'f-pt5-tangente-paralela',
      ancho: 320, alto: 240,
      x: [-0.25, 1.45], y: [-0.6, 4.8],
      titulo: 'La parábola y = 4x² y su tangente de pendiente ocho, que la toca en (1,4)',
      desc: 'La parábola y igual a cuatro x al cuadrado sale del origen. Su tangente paralela a '
        + 'la recta y igual a ocho x tiene pendiente ocho y la toca en el punto (1,4); esa '
        + 'tangente corta el eje horizontal en x igual a un medio. El recinto del primer '
        + 'cuadrante limitado por la curva, la tangente y el eje es un triángulo curvo con los '
        + 'vértices en el origen, en (0,5 ; 0) y en (1,4).',
    });
    const f = (x) => 4 * x * x;
    const t = (x) => 8 * x - 4;
    l.poli([
      ...Array.from({ length: 41 }, (_, k) => { const x = k / 40; return [x, f(x)]; }),
      [0.5, 0], [0, 0],
    ], { clase: 'f', cerrar: true });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [[0.5, '½'], 1], marcasY: [4] });
    l.curva(f, [0, 1.1], { clase: 'c', n: 50 });
    l.curva(t, [0.45, 1.1], { clase: 'c2' });
    l.punto(1, 4, { clase: 'o', r: 4.2 });
    l.punto(0.5, 0, { r: 4 });
    l.rotulo(1, 4, 'tangencia (1,4)', { dx: -7, dy: -6, anclaje: 'end', color: 'var(--flag)' });
    l.rotulo(0.5, 0, '(½,0)', { dx: 6, dy: 15 });
    return l.svg();
  });

/* ── 14 · la parábola y la tangente en su corte con el eje ───────────── */
fig('parabola-y-sus-dos-tangentes-en-los-cortes',
  'La parábola y = 2x − x² y su tangente en el origen, y = 2x: entre las dos queda una hoja que solo se cierra en el propio origen.',
  () => {
    const f = (x) => 2 * x - x * x;
    const t = (x) => 2 * x;
    const l = lienzo({
      id: 'f-pt5-tangente-en-el-corte',
      ancho: 320, alto: 240,
      x: [-0.35, 2.5], y: [-0.6, 4.6],
      titulo: 'La parábola y = 2x − x² y su tangente en el origen',
      desc: 'La parábola corta el eje horizontal en cero y en dos, con el máximo a altura uno en '
        + 'x igual a uno. Su tangente en el origen es la recta y igual a dos x, que sube por '
        + 'encima de ella y se separa cada vez más. Entre las dos queda una región que solo se '
        + 'cierra en el origen y que por la derecha llega hasta x igual a dos.',
    });
    l.poli(entre(t, f, 0, 2), { clase: 'f', cerrar: true });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2], marcasY: [1, 4] });
    l.curva(f, [-0.2, 2.35], { clase: 'c', n: 50 });
    l.curva(t, [0, 2.2], { clase: 'c2' });
    l.punto(0, 0, { clase: 'o', r: 4.2 });
    l.punto(2, 0, { r: 4 });
    l.punto(2, 4, { r: 4 });
    l.rotulo(0, 0, 'tangencia', { dx: 7, dy: 15, color: 'var(--flag)' });
    l.rotulo(1.6, t(1.6), 'y = 2x', { dx: -6, dy: -6, anclaje: 'end', color: 'var(--alt)' });
    return l.svg();
  });

/* ── 17, 18, 19 · las impropias ──────────────────────────────────────── */
fig('impropias-primer-tipo',
  'El área bajo la cola: se extiende hasta el infinito y aun así es finita, porque la curva baja lo bastante deprisa.',
  () =>
    mosaico({
      id: 'f-pt5-impropias-1',
      titulo: 'Dos colas infinitas de área finita',
      desc: 'A la izquierda, la exponencial e elevado a x sobre todo el semieje negativo: la cola '
        + 'se va al infinito por la izquierda pegándose al eje, y el área que encierra vale uno. '
        + 'A la derecha, la curva uno partido por x al cuadrado más cuatro sobre toda la recta: '
        + 'una campana que se aplana en los dos sentidos y cuya área total vale pi partido por '
        + 'dos. En los dos casos el recinto no tiene borde por los lados, y la integral existe de '
        + 'todos modos.',
      columnas: 2, ancho: 205, alto: 170,
      celdas: [
        {
          etiqueta: '(a) ∫₋∞⁰ eˣ dx = 1',
          x: [-5.4, 1.4], y: [-0.25, 1.35], cuadrado: false,
          dibuja: (l) => {
            l.poli(entre(Math.exp, () => 0, -5.2, 0, 60), { clase: 'f', cerrar: true });
            l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-4, -2], marcasY: [1] });
            l.curva(Math.exp, [-5.2, 0], { clase: 'c', n: 60 });
            l.poli([[0, 0], [0, 1]], { clase: 'cp2' });
            l.rotulo(-3, 0.15, 'área 1', { dx: 0, dy: 0, anclaje: 'middle' });
          },
        },
        {
          etiqueta: '(e) ∫₋∞^∞ dx/(x²+4) = π/2',
          x: [-8.4, 8.4], y: [-0.06, 0.32], cuadrado: false,
          dibuja: (l) => {
            const f = (x) => 1 / (x * x + 4);
            l.poli(entre(f, () => 0, -8.2, 8.2, 80), { clase: 'f', cerrar: true });
            l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-4, 4], marcasY: [[0.25, '¼']] });
            l.curva(f, [-8.2, 8.2], { clase: 'c', n: 90 });
          },
        },
      ],
    }));

fig('impropias-segundo-tipo',
  'Aquí el infinito está dentro: la curva se dispara en x = 0 y por eso Barrow no vale, aunque dé un número.',
  () => {
    const l = lienzo({
      id: 'f-pt5-impropias-2',
      ancho: 320, alto: 245,
      x: [-1.4, 1.4], y: [-7, 7],
      titulo: 'La hipérbola 1/x sobre el intervalo que contiene su asíntota',
      desc: 'La curva uno partido por x sube hacia más infinito por la derecha del cero y baja '
        + 'hacia menos infinito por la izquierda. El intervalo de integración, de menos uno a '
        + 'uno, contiene esa asíntota justo en medio. Aplicar la regla de Barrow como si la '
        + 'función fuera continua da cero, y es falso: la integral no existe.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-1, 1], marcasY: [5, -5] });
    l.curva((x) => 1 / x, [0.15, 1.3], { clase: 'c', n: 60 });
    l.curva((x) => 1 / x, [-1.3, -0.15], { clase: 'c', n: 60 });
    l.poli([[0, -6.8], [0, 6.8]], { clase: 'cp2' });
    l.rotulo(0, 5.5, 'la asíntota', { dx: 7, dy: 0, color: 'var(--flag)' });
    l.esquina(14, 18, 'Barrow no vale aquí');
    return l.svg();
  });

fig('dos-integrales-impropias',
  'Dos motivos distintos: una tiene la asíntota dentro del intervalo; la otra, el intervalo infinito.',
  () =>
    mosaico({
      id: 'f-pt5-impropias-dos',
      titulo: 'Las dos maneras de que una integral sea impropia',
      desc: 'A la izquierda, la curva uno partido por la raíz cúbica de x menos uno sobre el '
        + 'intervalo de cero a cuatro: se dispara en x igual a uno, que está dentro, y por eso es '
        + 'impropia de segundo tipo. A la derecha, una cola que se extiende hacia menos infinito '
        + 'sin que el recinto tenga borde por la izquierda: impropia de primer tipo. Son motivos '
        + 'distintos y se tratan de manera distinta.',
      columnas: 2, ancho: 205, alto: 170,
      celdas: [
        {
          etiqueta: '(a) asíntota en x = 1',
          x: [-0.4, 4.4], y: [-4.5, 4.5], cuadrado: false,
          dibuja: (l) => {
            const f = (x) => Math.cbrt(x - 1) === 0 ? NaN : 1 / Math.cbrt(x - 1);
            l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2, 4], marcasY: [2, -2] });
            l.curva(f, [0, 0.985], { clase: 'c', n: 60 });
            l.curva(f, [1.015, 4.2], { clase: 'c', n: 60 });
            l.poli([[1, -4.3], [1, 4.3]], { clase: 'cp2' });
          },
        },
        {
          etiqueta: '(b) intervalo infinito',
          x: [-6.4, 1.4], y: [-0.25, 1.35], cuadrado: false,
          dibuja: (l) => {
            l.poli(entre(Math.exp, () => 0, -6.2, 0, 60), { clase: 'f', cerrar: true });
            l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-4, -2], marcasY: [1] });
            l.curva(Math.exp, [-6.2, 0], { clase: 'c', n: 60 });
            l.rotulo(-5.6, 0.25, '…', { dx: 0, dy: 0, color: 'var(--live)' });
          },
        },
      ],
    }));

void ejemplos;

/* ── a pegar ─────────────────────────────────────────────────────────── */
for (const f of figuras) f.svg = f.hacer();

if (process.argv[1]?.endsWith('calculo-practica-t05.mjs')) {
  for (const f of figuras) pegaEnCampo(f.fichero, f.id, f.campo, f.svg, f.pie);
  console.log(`${figuras.length} figuras de práctica pegadas en ${FICHERO}`);
}
