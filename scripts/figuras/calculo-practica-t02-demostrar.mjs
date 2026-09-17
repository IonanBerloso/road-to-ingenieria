/**
 * Las figuras de las prácticas del tema 2 que hay que demostrar, y las dos de
 * series.
 *
 * Las demostraciones con épsilon son las que más se resisten, y casi todas
 * tienen el mismo dibujo detrás: una banda alrededor del límite y la pregunta
 * de qué términos caben dentro. Cuando se ve la banda, «para todo épsilon
 * existe un m» deja de ser una cadena de cuantificadores y pasa a ser una
 * frase sobre un dibujo. Por eso estas figuras no dibujan la sucesión del
 * enunciado —no hay: son propiedades generales— sino **el argumento**: dónde
 * se pone la banda y por qué la contradicción es una contradicción.
 *
 *     node scripts/figuras/calculo-practica-t02-demostrar.mjs
 */

import { lienzo, mosaico } from './lienzo.mjs';
import { pegaEnCampo } from './pegar.mjs';

export const FICHERO = 'src/content/calculo/t02-sucesiones/ejercicios.yaml';

export const figuras = [];
const fig = (id, pie, hacer) =>
  figuras.push({ fichero: FICHERO, id, campo: 'resolucion', pie, hacer });

const terminos = (l, a, n0, n1, opts = {}) => {
  for (let n = n0; n <= n1; n++) l.punto(n, a(n), { r: 2.8, ...opts });
};

/** Una banda horizontal centrada en `c` de semianchura `e`. */
const banda = (l, c, e, x0, x1, clase = 'f') =>
  l.poli([[x0, c - e], [x1, c - e], [x1, c + e], [x0, c + e]], { clase, cerrar: true });

/* ── 1 · la serie geométrica ─────────────────────────────────────────── */

fig('serie-geometrica',
  'La suma entera mide 2 y se reparte en trozos que valen la mitad del anterior. Empezar en n = 3 es quedarse solo con lo que sobra después de los tres primeros: ⅛+1/16+… = ¼, que es justamente r³/(1−r).',
  () => {
    const l = lienzo({
      id: 'f-serie-geometrica',
      ancho: 340, alto: 195,
      x: [-0.18, 2.22], y: [-0.62, 0.72], cuadrado: false,
      titulo: 'La suma de la geométrica de razón un medio, repartida en sus trozos',
      desc: 'Un segmento horizontal que va de cero a dos representa la suma total de la serie. '
        + 'Está dividido en trozos cada vez más pequeños: el primero mide uno, el siguiente un '
        + 'medio, el siguiente un cuarto, y así sucesivamente, amontonándose contra el extremo '
        + 'derecho sin llegar a alcanzarlo. Los tres primeros trozos, que suman uno coma setenta '
        + 'y cinco, están marcados aparte. El resto, desde el cuarto en adelante, está sombreado '
        + 'y suma un cuarto: es la parte que se pide cuando la serie empieza en n igual a tres.',
    });
    const S = (k) => 2 - 2 * 0.5 ** k;
    l.poli([[S(3), -0.16], [2, -0.16], [2, 0.16], [S(3), 0.16]], { clase: 'f', cerrar: true });
    l.poli([[0, 0], [2, 0]], { clase: 'c' });
    for (let k = 0; k <= 9; k++) l.poli([[S(k), -0.16], [S(k), 0.16]], { clase: 'eje' });
    l.poli([[2, -0.22], [2, 0.22]], { clase: 'c2' });
    for (const [k, t] of [[0, '1'], [1, '½'], [2, '¼']]) {
      l.rotulo((S(k) + S(k + 1)) / 2, 0, t, { dx: 0, dy: -8, anclaje: 'middle' });
    }
    l.rotulo(0, 0, '0', { dx: 0, dy: 20, anclaje: 'middle', color: 'var(--faint)', pequeno: true });
    l.rotulo(2, 0, '2', { dx: 0, dy: 20, anclaje: 'middle', color: 'var(--faint)', pequeno: true });
    l.poli([[1.875, -0.2], [1.6, -0.42]], { clase: 'g' });
    l.rotulo(1.6, -0.42, 'desde n = 3: ¼', { dx: -4, dy: 4, anclaje: 'end', color: 'var(--alt)' });
    l.rotulo(0.875, 0.16, 'los tres primeros suman 1,75', { dx: 0, dy: -8, anclaje: 'middle', pequeno: true });
    return l.svg();
  });

/* ── 2 · el alpinista que nunca llega ────────────────────────────────── */

fig('alpinista-geometrica',
  'Cada intento sube la mitad que el anterior, así que la altura acumulada se acerca a 200 m sin tocarlos nunca. La pared mide exactamente esos 200: el alpinista necesitaría infinitos intentos, y por eso la respuesta es que no llega.',
  () => {
    const alt = (k) => 200 * (1 - 0.5 ** k);
    const l = lienzo({
      id: 'f-alpinista',
      ancho: 320, alto: 265,
      x: [-1.6, 11], y: [-22, 232], cuadrado: false,
      titulo: 'La altura acumulada del alpinista tras cada intento, frente a la pared de doscientos metros',
      desc: 'Una línea horizontal de puntos a la altura doscientos representa lo alto de la '
        + 'pared. Debajo, los puntos van marcando la altura total alcanzada tras cada intento: '
        + 'cien tras el primero, ciento cincuenta tras el segundo, ciento setenta y cinco tras '
        + 'el tercero, y así sucesivamente, acercándose cada vez más a la línea pero sin tocarla '
        + 'nunca. A la izquierda, una franja vertical representa la pared entera, con la parte '
        + 'alcanzada sombreada.',
    });
    l.ejes({ nombreX: 'intento', nombreY: 'altura (m)', marcasX: [1, 5, 10], marcasY: [100, 200] });
    l.poli([[-1.6, 200], [11, 200]], { clase: 'cp2' });
    for (let k = 1; k <= 10; k++) l.poli([[k, 0], [k, alt(k)]], { clase: 'g' });
    terminos(l, alt, 1, 10, { clase: 'o', r: 3.6 });
    l.rotulo(10.6, 200, 'la pared: 200 m', { dx: 0, dy: -9, anclaje: 'end', color: 'var(--alt)' });
    l.rotulo(6, 150, 'nunca la toca', { dx: 0, dy: 0, anclaje: 'middle' });
    return l.svg();
  });

/* ── 3 · tres definiciones que hay que saber escribir ────────────────── */

fig('definiciones-formales',
  'Las tres definiciones, dibujadas. Creciente es que ningún punto baja respecto del anterior; acotada es que todos caben en una banda; y divergente a −∞ es que, elijas el techo que elijas por abajo, a partir de algún término todos lo han cruzado.',
  () => {
    const celda = (etiqueta, y, dibuja) => ({ etiqueta, x: [-1.6, 17], y, cuadrado: false, dibuja });
    return mosaico({
      id: 'f-definiciones-formales',
      columnas: 3,
      titulo: 'Las tres definiciones dibujadas: creciente, acotada y divergente hacia menos infinito',
      desc: 'Tres recuadros. En el primero, los términos de una sucesión que nunca baja: cada '
        + 'punto está a la misma altura o más arriba que el anterior. En el segundo, los '
        + 'términos saltan arriba y abajo pero todos caen dentro de una banda sombreada '
        + 'limitada por dos líneas horizontales, que son la cota inferior y la superior. En el '
        + 'tercero, los términos bajan sin parar; una línea horizontal marca un valor K elegido '
        + 'por debajo, y a partir de un término señalado con m todos los puntos están por '
        + 'debajo de esa línea.',
      celdas: [
        celda('creciente', [-0.4, 6.4], (l) => {
          const a = (n) => 5.6 * (1 - Math.exp(-n / 4.5));
          l.ejes({ nombreX: 'n', nombreY: 'aₙ' });
          terminos(l, a, 1, 16, { clase: 'o', r: 2.6 });
          for (let n = 1; n < 16; n++) l.poli([[n, a(n)], [n + 1, a(n)]], { clase: 'g' });
        }),
        celda('acotada', [-3.4, 3.4], (l) => {
          const a = (n) => 2.1 * Math.sin(n * 1.7) + 0.3 * Math.cos(n * 0.6);
          banda(l, 0, 2.4, -1.6, 17);
          l.ejes({ nombreX: 'n', nombreY: 'aₙ', marcasY: [[2.4, 'M'], [-2.4, 'm']] });
          l.poli([[-1.6, 2.4], [17, 2.4]], { clase: 'cp2' });
          l.poli([[-1.6, -2.4], [17, -2.4]], { clase: 'cp2' });
          terminos(l, a, 1, 16, { clase: 'o', r: 2.6 });
        }),
        celda('divergente a −∞', [-9.4, 1.6], (l) => {
          const a = (n) => 0.6 - 0.36 * n * n;
          l.ejes({ nombreX: 'n', nombreY: 'aₙ', marcasY: [[-4, 'K']] });
          l.poli([[-1.6, -4], [17, -4]], { clase: 'cp2' });
          terminos(l, a, 1, 5, { clase: 'o', r: 2.6 });
          l.punto(4, a(4), { clase: 'o', r: 4.2 });
          l.rotulo(4, a(4), 'm', { dx: 7, dy: 4, color: 'var(--flag)' });
        }),
      ],
    });
  });

/* ── 4 · el límite de una sucesión de términos no negativos ──────────── */

fig('limite-de-no-negativos',
  'La demostración es por reducción al absurdo y el dibujo es el absurdo: si el límite fuera negativo, la banda de radio |L|/2 a su alrededor cabría entera por debajo del cero, y desde algún término en adelante todos tendrían que estar dentro. Pero todos son ≥ 0.',
  () => {
    const L = -1.4;
    const l = lienzo({
      id: 'f-limite-no-negativos',
      ancho: 340, alto: 240,
      x: [-1.8, 19], y: [-2.6, 2.3], cuadrado: false,
      titulo: 'La banda alrededor de un límite negativo, que no puede contener términos no negativos',
      desc: 'Se supone, para llegar a un absurdo, que el límite L es negativo. Alrededor de él '
        + 'hay una banda sombreada de semianchura la mitad del valor absoluto de L, y la banda '
        + 'entera queda por debajo del eje horizontal. Arriba, por encima del eje, hay puntos '
        + 'que representan los términos de la sucesión, todos mayores o iguales que cero. '
        + 'Ningún punto puede estar a la vez por encima del eje y dentro de la banda, y esa es '
        + 'la contradicción.',
    });
    banda(l, L, Math.abs(L) / 2, -1.8, 19, 'f2');
    l.ejes({ nombreX: 'n', nombreY: 'aₙ', marcasX: [5, 10, 15], marcasY: [[L, 'L']] });
    l.poli([[-1.8, L], [19, L]], { clase: 'cp2' });
    terminos(l, (n) => 0.25 + 1.4 / n, 1, 17, { clase: 'o', r: 2.8 });
    l.rotulo(9, L + Math.abs(L) / 2, 'la banda cabe entera bajo el 0', { dx: 0, dy: 15, anclaje: 'middle', color: 'var(--alt)', pequeno: true });
    l.rotulo(14, 0.35, 'todos los aₙ ≥ 0', { dx: 0, dy: -8, anclaje: 'middle' });
    return l.svg();
  });

/* ── 5 · infinitos positivos e infinitos negativos ───────────────────── */

fig('signos-infinitos-limite-cero',
  'Si la sucesión converge y tiene infinitos términos a cada lado del cero, el límite no puede ser otra cosa que 0: cualquier otro L dejaría media banda de un solo signo, y la otra mitad de los términos se quedaría fuera para siempre.',
  () => {
    const a = (n) => ((-1) ** n * 2.3) / Math.sqrt(n);
    const l = lienzo({
      id: 'f-signos-infinitos',
      ancho: 340, alto: 240,
      x: [-1.8, 26], y: [-2.8, 2.8], cuadrado: false,
      titulo: 'Una sucesión con infinitos términos positivos e infinitos negativos que converge a cero',
      desc: 'Los términos van saltando de un lado a otro del eje horizontal: uno arriba, otro '
        + 'abajo, sin parar. Los saltos se van haciendo cada vez más pequeños, de modo que los '
        + 'puntos se van cerrando sobre el eje. Una banda sombreada estrecha centrada en el cero '
        + 'contiene todos los términos a partir de cierto punto, marcado con la letra m. Como la '
        + 'banda tiene que contener términos de los dos signos por muy estrecha que se haga, su '
        + 'centro no puede ser otro que el cero.',
    });
    banda(l, 0, 0.55, -1.8, 26);
    l.ejes({ nombreX: 'n', nombreY: 'aₙ', marcasX: [10, 20], marcasY: [[0.55, 'ε'], [-0.55, '−ε']] });
    terminos(l, a, 1, 25, { clase: 'o', r: 2.8 });
    l.poli([[18, -2.8], [18, 2.8]], { clase: 'cp2' });
    l.rotulo(18, -2.3, 'm', { dx: 6, dy: 0, color: 'var(--alt)' });
    l.esquina(10, 17, 'siempre a los dos lados del 0');
    return l.svg();
  });

/* ── 6 · las desigualdades sobreviven al límite, debilitadas ─────────── */

fig('desigualdad-en-el-limite',
  'Aquí xₙ es estrictamente menor que yₙ en todos y cada uno de los términos, y sin embargo los dos límites valen 0. Ese es el contraejemplo: al pasar al límite el «menor estricto» se convierte en «menor o igual», y no se puede afinar más.',
  () => {
    const l = lienzo({
      id: 'f-desigualdad-limite',
      ancho: 340, alto: 235,
      x: [-1.8, 21], y: [-0.35, 1.2], cuadrado: false,
      titulo: 'Dos sucesiones con desigualdad estricta término a término y el mismo límite',
      desc: 'Dos series de puntos. La de abajo está toda pegada al eje horizontal, a la altura '
        + 'cero: es la sucesión x sub n, que vale cero siempre. La de arriba empieza en uno y va '
        + 'bajando hacia el eje sin llegar a tocarlo: es y sub n, uno partido por n. En cada '
        + 'término el punto de arriba está estrictamente por encima del de abajo, y hay flechas '
        + 'verticales cortas que lo señalan en varios de ellos. Sin embargo las dos sucesiones '
        + 'acaban en la misma altura, el cero, de modo que sus límites son iguales.',
    });
    l.ejes({ nombreX: 'n', nombreY: '', marcasX: [5, 10, 20], marcasY: [1] });
    for (const n of [2, 4, 7, 12]) l.flecha([n, 1 / n], [n, 0.03], { clase: 'g', punta: 5, color: 'var(--faint)' });
    terminos(l, () => 0, 1, 20, { clase: 'o', r: 2.8 });
    terminos(l, (n) => 1 / n, 1, 20, { r: 2.8 });
    l.rotulo(14, 1 / 14, 'yₙ = 1/n', { dx: 0, dy: -9, anclaje: 'middle' });
    l.rotulo(17, 0, 'xₙ = 0', { dx: 0, dy: 28, anclaje: 'middle', color: 'var(--flag)' });
    l.esquina(10, 17, 'xₙ < yₙ siempre, y aun así lím x = lím y');
    return l.svg();
  });

/* ── 7 · por qué el límite es único ──────────────────────────────────── */

fig('unicidad-del-limite',
  'Si hubiera dos límites distintos, se toma como épsilon la mitad de lo que los separa y las dos bandas quedan sin tocarse. Pero desde algún término todos tendrían que estar en las dos a la vez, y eso es imposible: de ahí que L₁ y L₂ tengan que coincidir.',
  () => {
    const L1 = -1.1, L2 = 1.5;
    const e = (L2 - L1) / 2;
    const l = lienzo({
      id: 'f-unicidad-limite',
      ancho: 340, alto: 245,
      x: [-1.8, 22], y: [-3.1, 3.5], cuadrado: false,
      titulo: 'Las dos bandas disjuntas alrededor de dos límites supuestos distintos',
      desc: 'Se suponen dos límites distintos, L uno abajo y L dos arriba. Alrededor de cada uno '
        + 'hay una banda sombreada cuya semianchura es la mitad de la distancia que los separa, '
        + 'de modo que las dos bandas se tocan justo en el punto medio y no se solapan en '
        + 'ninguna parte. Una llave vertical marca esa distancia entre los dos límites. Como a '
        + 'partir de cierto término la sucesión tendría que estar dentro de las dos bandas a la '
        + 'vez, y no hay ningún punto que esté en las dos, los dos límites no pueden ser '
        + 'distintos.',
    });
    banda(l, L1, e, -1.8, 22, 'f');
    banda(l, L2, e, -1.8, 22, 'f2');
    l.ejes({ nombreX: 'n', nombreY: '', marcasY: [[L1, 'L₁'], [L2, 'L₂']] });
    l.poli([[-1.8, L1], [22, L1]], { clase: 'cp' });
    l.poli([[-1.8, L2], [22, L2]], { clase: 'cp2' });
    l.poli([[-1.8, (L1 + L2) / 2], [22, (L1 + L2) / 2]], { clase: 'g' });
    l.flecha([19, (L1 + L2) / 2], [19, L2], { clase: 'g', punta: 5, color: 'var(--faint)' });
    l.flecha([19, (L1 + L2) / 2], [19, L1], { clase: 'g', punta: 5, color: 'var(--faint)' });
    l.rotulo(19, (L1 + L2) / 2, 'ε', { dx: -7, dy: 4, anclaje: 'end', color: 'var(--faint)', pequeno: true });
    l.esquina(10, 17, 'las dos bandas no se tocan');
    l.rotulo(8, L1, 'y aquí tendrían que estar todos', { dx: 0, dy: 16, anclaje: 'middle', pequeno: true });
    return l.svg();
  });

/* ── a pegar ─────────────────────────────────────────────────────────── */
for (const f of figuras) f.svg = f.hacer();

if (process.argv[1]?.endsWith('calculo-practica-t02-demostrar.mjs')) {
  for (const f of figuras) pegaEnCampo(f.fichero, f.id, f.campo, f.svg, f.pie);
  console.log(`${figuras.length} figuras de demostración pegadas en ${FICHERO}`);
}
