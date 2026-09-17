/**
 * Las figuras de las prácticas del tema 2 que van de sucesiones a trozos.
 *
 * Media docena de ejercicios del boletín define una sucesión por tramos y
 * pregunta si es monótona, si está acotada y a dónde va. Todas esas preguntas
 * se contestan mirando la nube de puntos; lo que cuesta es imaginársela,
 * porque los tramos están hechos para despistar —un tramo que vale n³ hasta el
 * término mil no se «ve» en la cabeza—.
 *
 * Varias llevan el eje vertical **comprimido logarítmicamente**, y se dice en
 * la figura. Es la única manera honesta de poner en el mismo dibujo un tramo
 * que vale un millón y otro que vale cinco: la alternativa era dibujar el
 * millón fuera del papel o mentir sobre la escala.
 *
 *     node scripts/figuras/calculo-practica-t02.mjs
 */

import { lienzo, mosaico } from './lienzo.mjs';
import { pegaEnCampo } from './pegar.mjs';

export const FICHERO = 'src/content/calculo/t02-sucesiones/ejercicios.yaml';

export const figuras = [];
const fig = (id, pie, hacer) =>
  figuras.push({ fichero: FICHERO, id, campo: 'resolucion', pie, hacer });

/** La compresión logarítmica con signo, que respeta el cero y los negativos. */
const comp = (y) => Math.sign(y) * Math.log10(1 + Math.abs(y));
/** Una marca del eje comprimido: se coloca donde toca y se rotula con su valor. */
const marca = (v, texto) => [comp(v), texto ?? String(v)];

/** Dibuja los términos de una sucesión, submuestreando si son muchos. */
const terminos = (l, a, n0, n1, cuantos = 999, opts = {}) => {
  const paso = Math.max(1, Math.round((n1 - n0) / cuantos));
  for (let n = n0; n <= n1; n += paso) l.punto(n, a(n), { r: 2.6, ...opts });
};

/* ── 1 · una sucesión creciente que tiende a cero ────────────────────── */

fig('creciente-con-limite-cero',
  'Si crece y su límite es 0, todos los términos tienen que ser negativos: no puede haber ninguno positivo, porque a partir de él la sucesión ya no podría bajar hasta 0 sin dejar de crecer. El dibujo es de −1/n, pero la forma es obligatoria.',
  () => {
    const l = lienzo({
      id: 'f-creciente-limite-cero',
      ancho: 330, alto: 235,
      x: [-1.5, 25], y: [-1.25, 0.5], cuadrado: false,
      titulo: 'Una sucesión creciente con límite cero, con todos sus términos por debajo del eje',
      desc: 'Los términos de la sucesión son puntos que van subiendo de izquierda a derecha, '
        + 'empezando en menos uno y acercándose cada vez más a la altura cero sin llegar nunca. '
        + 'Todos están por debajo del eje horizontal. Una línea de puntos marca la altura cero, '
        + 'que es el límite, y una banda sombreada cubre la zona de los valores positivos con '
        + 'la nota de que ahí no puede caer ningún término.',
    });
    l.poli([[-1.5, 0], [25, 0], [25, 0.5], [-1.5, 0.5]], { clase: 'f2', cerrar: true });
    l.ejes({ nombreX: 'n', nombreY: 'aₙ', marcasX: [5, 10, 20], marcasY: [[-1, '−1']] });
    terminos(l, (n) => -1 / n, 1, 24, 999, { clase: 'o', r: 3.2 });
    l.esquina(10, 17, 'aquí no puede haber ninguno', { color: 'var(--alt)' });
    l.rotulo(13, 0, 'límite 0', { dx: 0, dy: -8, anclaje: 'middle' });
    return l.svg();
  });

/* ── 2 · comparar infinitésimos ──────────────────────────────────────── */

fig('comparar-infinitesimos',
  'Las cuatro tienden a cero y ninguna lo hace igual. 1/n² se desploma; 1/n baja despacio; (−1)ⁿ/n hace lo mismo pero saltando de lado a lado; y 1/(n+100) empieza tan abajo que en esta ventana parece constante, aunque acabe en el mismo sitio.',
  () => {
    const celda = (etiqueta, a, y, dibuja) => ({
      etiqueta,
      x: [-1.4, 21], y, cuadrado: false,
      dibuja: (l) => {
        l.ejes({ nombreX: 'n', nombreY: 'aₙ', marcasX: [10, 20] });
        terminos(l, a, 1, 20, 999, { clase: 'o', r: 2.8 });
        if (dibuja) dibuja(l);
      },
    });
    return mosaico({
      id: 'f-comparar-infinitesimos',
      columnas: 2,
      ancho: 210,
      alto: 150,
      titulo: 'Las cuatro sucesiones que tienden a cero, cada una a su ritmo',
      desc: 'Cuatro recuadros con los veinte primeros términos de cada sucesión. En el primero, '
        + 'uno partido por n, que empieza en uno y baja formando una curva suave hacia el cero. '
        + 'En el segundo, uno partido por n al cuadrado, que también empieza en uno pero se pega '
        + 'al cero mucho antes. En el tercero, menos uno elevado a n partido por n, que va '
        + 'saltando de un lado a otro del eje mientras los saltos se hacen cada vez más '
        + 'pequeños. En el cuarto, uno partido por n más cien, que en esta ventana apenas se '
        + 'mueve de una altura muy baja, cerca de una centésima.',
      celdas: [
        celda('(a) 1/n', (n) => 1 / n, [-0.18, 1.15]),
        celda('(b) 1/n²', (n) => 1 / (n * n), [-0.18, 1.15]),
        celda('(c) (−1)ⁿ/n', (n) => (-1) ** n / n, [-1.15, 1.15]),
        celda('(d) 1/(n+100)', (n) => 1 / (n + 100), [-0.0018, 0.0115], (l) => {
          l.rotulo(10, 0.0099, '≈ 0,01', { dx: 0, dy: -7, anclaje: 'middle', pequeno: true });
        }),
      ],
    });
  });

/* ── 3 · una serie que no puede converger ────────────────────────────── */

fig('serie-sucesion-tres-tramos',
  'El eje vertical va comprimido para que quepan a la vez el tramo que llega a mil millones y el que vale uno. Lo que decide el ejercicio está a la derecha: el término tiende a 1, no a 0, y una serie cuyo término no tiende a cero no converge.',
  () => {
    const a = (n) => (n < 1000 ? n ** 3 : n < 2000 ? 1 : 1 - 1 / n);
    const l = lienzo({
      id: 'f-serie-tres-tramos',
      ancho: 340, alto: 240,
      x: [-180, 2500], y: [-0.4, 10.2], cuadrado: false,
      titulo: 'La sucesión de tres tramos, con el eje vertical comprimido',
      desc: 'Los términos de la sucesión, con el eje vertical comprimido logarítmicamente para '
        + 'que quepan valores muy distintos. Hasta el término mil, la sucesión vale n al cubo y '
        + 'sube hasta cerca de mil millones. En el término mil cae de golpe al valor uno y se '
        + 'queda ahí hasta el término dos mil. A partir de ahí vale uno menos uno partido por n, '
        + 'que sigue valiendo prácticamente uno. Una línea de puntos horizontal marca la altura '
        + 'uno, y otra marca la altura cero: los términos acaban pegados a la primera, no a la '
        + 'segunda, y por eso la serie no converge.',
    });
    l.ejes({
      nombreX: 'n', nombreY: 'aₙ',
      marcasX: [[1000, '1000'], [2000, '2000']],
      marcasY: [marca(1), marca(1000, '10³'), marca(1e6, '10⁶'), marca(1e9, '10⁹')],
    });
    l.poli([[-180, comp(1)], [2500, comp(1)]], { clase: 'g' });
    terminos(l, (n) => comp(a(n)), 20, 2450, 70, { clase: 'o', r: 2.6 });
    l.rotulo(2300, comp(1), 'aₙ → 1', { dx: 0, dy: -8, anclaje: 'middle', color: 'var(--alt)' });
    l.esquina(8, 16, 'eje vertical comprimido', { color: 'var(--faint)' });
    return l.svg();
  });

/* ── 4 · una sucesión con un pico en medio ───────────────────────────── */

fig('sucesion-tres-tramos',
  'El pico central es lo que rompe todas las respuestas fáciles: entre los términos 100 y 200 la sucesión sube hasta 200, así que no es monótona y su supremo no está ni al principio ni al final. Después se calma en 1, que es el límite.',
  () => {
    const a = (n) => (n < 100 ? -1 / (n * n) : n <= 200 ? n : 1 - 1 / n);
    const l = lienzo({
      id: 'f-sucesion-pico',
      ancho: 340, alto: 240,
      x: [-25, 290], y: [-0.45, 2.75], cuadrado: false,
      titulo: 'La sucesión con un pico entre los términos cien y doscientos',
      desc: 'Los términos, con el eje vertical comprimido logarítmicamente. Hasta el término '
        + 'noventa y nueve la sucesión vale menos uno partido por n al cuadrado, un número '
        + 'negativo tan pequeño que los puntos se confunden con el eje. En el término cien salta '
        + 'de golpe hasta valer cien y sigue subiendo en línea recta hasta valer doscientos en '
        + 'el término doscientos: es el pico. Justo después vuelve a caer, hasta un valor algo '
        + 'menor que uno, y se queda ahí acercándose a uno. Dos líneas de puntos marcan la '
        + 'altura doscientos, que es el supremo, y la altura uno, que es el límite.',
    });
    l.ejes({
      nombreX: 'n', nombreY: 'aₙ',
      marcasX: [100, 200],
      marcasY: [marca(1), marca(10), marca(200)],
    });
    l.poli([[-25, comp(200)], [290, comp(200)]], { clase: 'g' });
    l.poli([[-25, comp(1)], [290, comp(1)]], { clase: 'g' });
    terminos(l, (n) => comp(a(n)), 2, 285, 70, { clase: 'o', r: 2.8 });
    l.rotulo(150, comp(200), 'supremo 200', { dx: 0, dy: -8, anclaje: 'middle', color: 'var(--alt)' });
    l.rotulo(255, comp(1), 'límite 1', { dx: 0, dy: -9, anclaje: 'middle' });
    l.esquina(8, 16, 'eje vertical comprimido', { color: 'var(--faint)' });
    return l.svg();
  });

/* ── 5 · alternar infinitas veces o cambiar una sola vez ─────────────── */

fig('alternante-frente-a-salto',
  'Las dos tienen exactamente los mismos valores; lo único que cambia es cuándo los toman. La de la izquierda salta infinitas veces y no converge. La de la derecha salta una sola vez y converge a −2: a partir del término 50 ya no vuelve a subir.',
  () => {
    const celda = (etiqueta, a, dibuja) => ({
      etiqueta,
      x: [-4, 78], y: [-3.3, 3.3], cuadrado: false,
      dibuja: (l) => {
        l.ejes({ nombreX: 'n', nombreY: '', marcasX: [50], marcasY: [[2, '2'], [-2, '−2']] });
        l.poli([[-4, 2], [78, 2]], { clase: 'g' });
        l.poli([[-4, -2], [78, -2]], { clase: 'g' });
        terminos(l, a, 1, 76, 999, { clase: 'o', r: 2.6 });
        if (dibuja) dibuja(l);
      },
    });
    return mosaico({
      id: 'f-alternante-vs-salto',
      columnas: 2,
      ancho: 210,
      alto: 168,
      titulo: 'La sucesión que alterna siempre y la que solo cambia una vez',
      desc: 'Dos recuadros con los mismos dos niveles marcados, más dos y menos dos. En el '
        + 'primero, los términos van saltando alternativamente de arriba abajo durante todo el '
        + 'recorrido, y nunca se quedan en un lado: la sucesión no converge. En el segundo, los '
        + 'primeros cuarenta y nueve términos están todos arriba y, a partir del término '
        + 'cincuenta, todos abajo, sin volver a subir: la sucesión converge a menos dos. Una '
        + 'línea vertical marca ese término cincuenta.',
      celdas: [
        celda('aₙ: alterna siempre', (n) => (n % 2 === 1 ? 2 + 1 / n : -2 - 1 / n)),
        celda('bₙ: salta una vez', (n) => (n < 50 ? 2 + 1 / n : -2 - 1 / n), (l) => {
          l.poli([[50, -3.3], [50, 3.3]], { clase: 'cp2' });
          l.rotulo(50, -2.7, 'converge', { dx: 6, dy: 0, color: 'var(--alt)', pequeno: true });
        }),
      ],
    });
  });

/* ── 6 · de crecer como un cubo a estabilizarse en cinco ─────────────── */

fig('cubo-y-luego-cinco',
  'Otra vez el eje comprimido: el tramo de n³ llega casi al millón y el otro vale cinco. El salto está en n = 100 y es hacia abajo, así que la sucesión no es monótona; su supremo es 99³, y su límite, 5.',
  () => {
    const a = (n) => (n < 100 ? n ** 3 : 5 - 2 / n);
    const l = lienzo({
      id: 'f-cubo-luego-cinco',
      ancho: 330, alto: 240,
      x: [-16, 175], y: [-0.4, 6.6], cuadrado: false,
      titulo: 'La sucesión que crece como un cubo y luego cae a cinco',
      desc: 'Los términos, con el eje vertical comprimido logarítmicamente. Hasta el término '
        + 'noventa y nueve la sucesión vale n al cubo y sube en una curva que llega casi al '
        + 'millón. En el término cien cae de golpe hasta poco menos de cinco y se queda ahí, '
        + 'acercándose a cinco por debajo. Una línea de puntos marca la altura cinco y otra la '
        + 'altura del último término del primer tramo, que es el supremo de toda la sucesión.',
    });
    l.ejes({
      nombreX: 'n', nombreY: 'aₙ',
      marcasX: [50, 100, 150],
      marcasY: [marca(5), marca(1000, '10³'), marca(1e5, '10⁵')],
    });
    l.poli([[-16, comp(5)], [175, comp(5)]], { clase: 'g' });
    l.poli([[-16, comp(99 ** 3)], [175, comp(99 ** 3)]], { clase: 'g' });
    terminos(l, (n) => comp(a(n)), 2, 170, 60, { clase: 'o', r: 2.8 });
    l.rotulo(118, comp(99 ** 3), 'supremo = 99³', { dx: 0, dy: -8, anclaje: 'middle', color: 'var(--alt)' });
    l.rotulo(148, comp(5), 'límite 5', { dx: 0, dy: -8, anclaje: 'middle' });
    l.esquina(8, 16, 'eje vertical comprimido', { color: 'var(--faint)' });
    return l.svg();
  });

/* ── 7 · dos parámetros a partir del supremo y el ínfimo ─────────────── */

fig('parametros-supremo-infimo',
  'Con a = −3 y b = −2 la sucesión empieza en 3 —que es el supremo, y se alcanza— y a partir del término 10 rebota entre +2 y −2, de donde sale el ínfimo −2. El salto del término 9 al 10 es el dato que cierra el sistema: vale 7/3.',
  () => {
    const a = (n) => (n < 10 ? 3 / n : -2 * (-1) ** n);
    const l = lienzo({
      id: 'f-parametros-sup-inf',
      ancho: 335, alto: 250,
      x: [-1.8, 23], y: [-2.9, 3.7], cuadrado: false,
      titulo: 'La sucesión con supremo tres e ínfimo menos dos',
      desc: 'Los primeros nueve términos bajan desde la altura tres, que es el mayor valor de '
        + 'toda la sucesión, acercándose al cero. A partir del término diez, los términos saltan '
        + 'alternativamente entre menos dos y más dos y ya no cambian de amplitud. Dos líneas de '
        + 'puntos marcan las alturas tres y menos dos, que son el supremo y el ínfimo. El salto '
        + 'entre el término nueve y el diez está señalado con una flecha y mide siete tercios.',
    });
    l.ejes({ nombreX: 'n', nombreY: 'xₙ', marcasX: [5, 10, 15, 20], marcasY: [[3, '3'], [-2, '−2']] });
    l.poli([[-1.8, 3], [23, 3]], { clase: 'g' });
    l.poli([[-1.8, -2], [23, -2]], { clase: 'g' });
    l.flecha([9.5, 3 / 9], [9.5, -1.85], { clase: 'cp2', color: 'var(--alt)', punta: 6 });
    terminos(l, a, 1, 22, 999, { clase: 'o', r: 3 });
    l.rotulo(9.5, -0.8, '7/3', { dx: 6, dy: 0, color: 'var(--alt)' });
    l.rotulo(17, 3, 'supremo', { dx: 0, dy: -7, anclaje: 'middle', pequeno: true });
    l.rotulo(17, -2, 'ínfimo', { dx: 0, dy: 16, anclaje: 'middle', pequeno: true });
    return l.svg();
  });

/* ── 8 · una sucesión decreciente y la serie que forma ───────────────── */

fig('decreciente-y-serie',
  'Decrece en los dos tramos y también en el salto: 4+1/9 es mayor que (2/3)¹⁰, que ya es casi cero. Su supremo es el primer término, 5, y como el segundo tramo es geométrico de razón 2/3, la serie sí converge.',
  () => {
    const a = (n) => (n < 10 ? 4 + 1 / n : (2 / 3) ** n);
    const l = lienzo({
      id: 'f-decreciente-serie',
      ancho: 335, alto: 240,
      x: [-1.8, 23], y: [-0.55, 5.6], cuadrado: false,
      titulo: 'La sucesión decreciente que cae de cuatro a casi cero en el término diez',
      desc: 'Los primeros nueve términos están arriba, entre cinco y algo más de cuatro, bajando '
        + 'muy poco a poco. En el término diez la sucesión cae de golpe hasta casi cero, porque '
        + 'pasa a valer dos tercios elevado a n, y a partir de ahí sigue bajando pegada al eje. '
        + 'Una línea de puntos marca la altura cinco, que es el primer término y también el '
        + 'supremo, y otra marca la altura cuatro, por debajo de la cual está el resto del '
        + 'primer tramo.',
    });
    l.ejes({ nombreX: 'n', nombreY: 'aₙ', marcasX: [5, 10, 15, 20], marcasY: [4, 5] });
    l.poli([[-1.8, 5], [23, 5]], { clase: 'g' });
    l.poli([[-1.8, 4], [23, 4]], { clase: 'g' });
    terminos(l, a, 1, 22, 999, { clase: 'o', r: 3 });
    l.rotulo(7, 5, 'supremo = 5', { dx: 0, dy: -8, anclaje: 'middle' });
    l.rotulo(14, 0.1, 'geométrica de razón ⅔', { dx: 0, dy: -8, anclaje: 'middle', color: 'var(--alt)', pequeno: true });
    return l.svg();
  });

/* ── a pegar ─────────────────────────────────────────────────────────── */
for (const f of figuras) f.svg = f.hacer();

if (process.argv[1]?.endsWith('calculo-practica-t02.mjs')) {
  for (const f of figuras) pegaEnCampo(f.fichero, f.id, f.campo, f.svg, f.pie);
  console.log(`${figuras.length} figuras de práctica pegadas en ${FICHERO}`);
}
