/**
 * Las figuras de los cinco ejercicios propios de los temas 2 y 3.
 *
 * Las dos de las telescópicas responden a la misma pregunta por los dos lados:
 * qué se cancela y qué sobrevive. Una serie telescópica se explica dibujando
 * los términos y tachando los que se van, y sin ese dibujo el alumno aprende a
 * hacer la cuenta sin ver por qué sale.
 *
 *     node scripts/figuras/calculo-propios-t02-t03.mjs
 */

import { lienzo, mosaico } from './lienzo.mjs';
import { pegaEnCampo } from './pegar.mjs';

const T2 = 'src/content/calculo/t02-sucesiones/ejercicios.yaml';
const T3 = 'src/content/calculo/t03-funciones-reales/ejercicios.yaml';

export const FICHERO = T2;
export const figuras = [];
const fig = (fichero, id, pie, hacer) =>
  figuras.push({ fichero, id, campo: 'resolucion', pie, hacer });

/* ── 1 · la telescópica que diverge ──────────────────────────────────── */

fig(T2, 'telescopica-con-raices',
  'A la izquierda, los términos, que se hacen pequeños. A la derecha, la suma parcial, que no para de crecer. Las dos cosas a la vez son posibles, y este es el ejemplo.',
  () => {
    const a = (n) => 1 / (Math.sqrt(n) + Math.sqrt(n + 1));
    const S = (n) => Math.sqrt(n + 1) - 1;
    return mosaico({
      id: 'f-telescopica-raices',
      titulo: 'Los términos tendiendo a cero y la suma parcial creciendo sin tope',
      desc: 'Dos gráficas una al lado de la otra. En la de la izquierda hay veinte puntos que '
        + 'bajan: el primero está a la altura cero coma cuatro uno y el vigésimo a la altura cero '
        + 'coma once, acercándose al eje sin llegar a tocarlo. En la de la derecha hay una curva '
        + 'creciente que va de cero hasta nueve cuando el índice llega a cien, y sigue subiendo al '
        + 'borde derecho sin doblarse hacia ninguna horizontal. La comparación es el ejercicio: '
        + 'los términos se hacen pequeños y aun así su suma crece sin tope.',
      columnas: 2, ancho: 250, alto: 215, hueco: 26,
      celdas: [
        {
          etiqueta: 'los términos a(n)',
          x: [-1.5, 21], y: [-0.06, 0.48], cuadrado: false,
          dibuja: (l) => {
            l.ejes({ nombreX: 'n', nombreY: 'a', marcasX: [10, 20], marcasY: [0.4] });
            for (let n = 1; n <= 20; n++) l.punto(n, a(n), { clase: 'pt', r: 2.6 });
            l.rotulo(14, a(14), 'tienden a 0', { dx: 0, dy: -10, anclaje: 'middle', color: 'var(--faint)', pequeno: true });
          },
        },
        {
          etiqueta: 'la suma parcial S(N)',
          x: [-8, 108], y: [-1.2, 10.5], cuadrado: false,
          dibuja: (l) => {
            l.ejes({ nombreX: 'N', nombreY: 'S', marcasX: [50, 100], marcasY: [5, 9] });
            l.curva(S, [0, 104], { clase: 'c', n: 140 });
            l.punto(99, S(99), { clase: 'o', r: 4 });
            l.rotulo(99, S(99), 'S(99) = 9', { dx: -6, dy: 12, anclaje: 'end', color: 'var(--flag)' });
          },
        },
      ],
    });
  });

/* ── 2 · la telescópica de hueco tres ────────────────────────────────── */

fig(T2, 'telescopica-de-tres-en-tres',
  'Cada barra de arriba se cancela con la de abajo que cae en el mismo sitio. Sobran tres arriba —las de 1, 2 y 3— y tres abajo, que son las que se van a cero.',
  () => {
    /* La suma parcial con N = 8, dibujada como un peine: arriba los sumandos
       +1/k con k de 1 a 8, abajo los −1/k con k de 4 a 11. Los que comparten
       k se anulan, y lo que queda a la vista es qué sobra por cada lado. */
    const N = 8;
    const alto = (k) => 1 / k;
    const l = lienzo({
      id: 'f-telescopica-hueco-tres',
      ancho: 350, alto: 250,
      x: [0.2, 12.3], y: [-0.62, 1.22], cuadrado: false,
      margen: 30,
      titulo: 'Los sumandos positivos y negativos de la suma parcial, emparejados por su denominador',
      desc: 'Un peine de barras verticales sobre un eje horizontal con los denominadores del uno '
        + 'al once. Hacia arriba salen ocho barras, que son los sumandos positivos uno partido por '
        + 'k para k del uno al ocho; la del uno es la más alta y van menguando. Hacia abajo salen '
        + 'otras ocho, que son los sumandos negativos, para k del cuatro al once. En los '
        + 'denominadores del cuatro al ocho hay barra arriba y barra abajo de la misma longitud, y '
        + 'ese par se anula. Quedan sin pareja las tres barras de arriba de los denominadores uno, '
        + 'dos y tres, resaltadas, y las tres de abajo de los denominadores nueve, diez y once, '
        + 'que son pequeñas y tienden a cero al crecer el número de sumandos. Por eso la suma '
        + 'vale un tercio de uno más un medio más un tercio.',
    });
    /* El hueco de 0,09 a cada lado del eje es lo que hace legible la figura:
       sin el, la barra positiva y la negativa del mismo k se dibujan pegadas
       y se leen como una sola barra larga en vez de como un par que se anula. */
    const H = 0.09;
    l.clase('sobra', 'stroke: var(--flag); stroke-width: 5; fill: none; stroke-linecap: round;');
    l.clase('cancel', 'stroke: var(--faint); stroke-width: 5; fill: none; stroke-linecap: round;');
    /* Sin marcas en el 9, 10 y 11: ahi hay barra, y el numero quedaria debajo
       de ella y no se leeria. Los rotulos dicen de que grupo se habla. */
    l.ejes({ nombreX: 'k', nombreY: '', marcasX: [1, 2, 3, 8], marcasY: [] });
    for (let k = 1; k <= N; k++)
      l.poli([[k, H], [k, H + alto(k)]], { clase: k <= 3 ? 'sobra' : 'cancel' });
    for (let k = 4; k <= N + 3; k++)
      l.poli([[k, -H], [k, -H - alto(k)]], { clase: k > N ? 'sobra' : 'cancel' });
    l.rotulo(2, 1.09, 'los tres que sobreviven', { dx: 8, dy: -3, color: 'var(--flag)' });
    l.rotulo(6, -0.43, 'se anulan', {
      dx: 0, dy: 2, anclaje: 'middle', color: 'var(--faint)', pequeno: true });
    l.rotulo(10.3, -0.28, 'tienden a 0', {
      dx: 0, dy: 16, anclaje: 'middle', color: 'var(--flag)', pequeno: true });
    return l.svg();
  });

/* ── 3 · Bolzano, tres veces ─────────────────────────────────────────── */

fig(T3, 'bolzano-tres-raices-de-una-quintica',
  'Los tres cortes con el eje, uno por cada cambio de signo. Los valores en x = −2 y x = 2 quedan muy por debajo y por encima del recuadro, y por eso no se ven.',
  () => {
    const f = (x) => x ** 5 - 3 * x + 1;
    const l = lienzo({
      id: 'f-bolzano-quintica',
      ancho: 330, alto: 265,
      x: [-1.75, 1.6], y: [-3.2, 3.2], cuadrado: false,
      margen: 26,
      titulo: 'La quíntica x a la quinta menos tres x más uno, cortando al eje tres veces',
      desc: 'Una curva que entra por abajo a la izquierda, sube cortando el eje horizontal cerca '
        + 'de menos uno coma treinta y nueve, sigue subiendo hasta una joroba a la altura algo '
        + 'mayor que dos, baja cortando el eje por segunda vez cerca de cero coma treinta y tres, '
        + 'continúa bajando hasta un valle a la altura menos uno y pico, y vuelve a subir cortando '
        + 'el eje por tercera vez cerca de uno coma veintiuno antes de salirse por arriba. Los '
        + 'tres cortes están marcados con un punto. Están marcados también los dos valores que se '
        + 'usan para el segundo cambio de signo: f de cero, que vale uno y está por encima del '
        + 'eje, y f de uno, que vale menos uno y está por debajo. Los otros dos valores del '
        + 'tanteo, en menos dos y en dos, valen menos veinticinco y veintisiete y caen muy fuera '
        + 'del recuadro.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-1, 1], marcasY: [-2, 2] });
    /* Hasta donde la quintica se sale del recuadro y no mas: crece tan
       deprisa que un decimo mas de dominio la manda medio viewBox abajo. */
    l.curva(f, [-1.55, 1.45], { clase: 'c', n: 180 });
    for (const r of [-1.38879, 0.33473, 1.21465]) l.punto(r, 0, { clase: 'o', r: 4.2 });
    l.punto(0, 1, { clase: 'pt', r: 3.4 });
    l.punto(1, -1, { clase: 'pt', r: 3.4 });
    l.rotulo(0, 1, 'f(0) = 1', { dx: -8, dy: -11, anclaje: 'end', color: 'var(--live)' });
    l.rotulo(1, -1, 'f(1) = −1', { dx: -7, dy: 15, anclaje: 'end', color: 'var(--live)' });
    return l.svg();
  });

/* ── 4 · el punto fijo del coseno ────────────────────────────────────── */

fig(T3, 'punto-fijo-del-coseno',
  'Las dos curvas se cruzan una sola vez: una sube y la otra baja, así que no pueden volver a encontrarse.',
  () => {
    const l = lienzo({
      id: 'f-punto-fijo-coseno',
      ancho: 300, alto: 265,
      x: [-0.25, 1.7], y: [-0.25, 1.7], cuadrado: true,
      margen: 26,
      titulo: 'La curva del coseno y la recta y igual a x, cortándose una sola vez',
      desc: 'Sobre unos ejes con la misma escala hay dos curvas. Una es la recta que pasa por el '
        + 'origen con pendiente uno, que sube. La otra es el coseno, que arranca en la altura uno '
        + 'cuando x vale cero y baja despacio. Se cruzan en un único punto, marcado, cuya abscisa '
        + 'vale aproximadamente cero coma setenta y cuatro, y ese punto está dentro del intervalo '
        + 'de cero a uno. Que una suba mientras la otra baja es la razón de que no puedan volver '
        + 'a cortarse: el corte es único. Están marcados además los dos extremos del intervalo de '
        + 'cero a uno, donde la diferencia entre las dos cambia de signo.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1], marcasY: [1] });
    l.curva(Math.cos, [-0.2, 1.65], { clase: 'c', n: 140 });
    l.curva((x) => x, [-0.2, 1.65], { clase: 'c2' });
    const c = 0.7390851;
    l.punto(c, c, { clase: 'o', r: 4.4 });
    l.poli([[c, 0], [c, c]], { clase: 'g' });
    l.rotulo(c, 0, '0,739', { dx: 4, dy: 14, color: 'var(--flag)', pequeno: true });
    l.rotulo(1.62, Math.cos(1.62), 'y = cos x', { dx: -4, dy: 16, anclaje: 'end', color: 'var(--d1)' });
    l.rotulo(1.38, 1.38, 'y = x', { dx: -6, dy: 12, anclaje: 'end', color: 'var(--alt)' });
    return l.svg();
  });

/* ── 5 · el dominio, sobre la recta real ─────────────────────────────── */

fig(T3, 'dominio-con-un-punto-excluido',
  'El dominio sobre la recta real. El corchete de la izquierda entra, el paréntesis de la derecha no, y el hueco del 2 es el que pone el denominador.',
  () => {
    const l = lienzo({
      id: 'f-dominio-punto-excluido',
      ancho: 340, alto: 150,
      x: [-3.6, 4.4], y: [-1.5, 1.5], cuadrado: false,
      margen: 26,
      titulo: 'El dominio marcado sobre la recta real, con un hueco en el dos',
      desc: 'Una recta real horizontal con marcas en menos dos, cero, dos y tres. Sobre ella hay '
        + 'un trazo grueso que empieza en menos dos y termina en tres, con un punto relleno en '
        + 'menos dos, que sí pertenece al dominio, y un círculo hueco en tres, que no pertenece. '
        + 'En el dos el trazo se interrumpe con otro círculo hueco: ese punto queda fuera porque '
        + 'ahí el logaritmo del denominador vale cero. Debajo de cada extremo está escrita la '
        + 'condición que lo produce: la raíz para el menos dos, el denominador para el dos y el '
        + 'logaritmo para el tres.',
    });
    l.clase('dom', 'stroke: var(--d1); stroke-width: 5; fill: none;');
    l.ejes({ nombreX: 'x', nombreY: '', marcasX: [-2, 0, 2, 3], marcasY: [] });
    /* El trazo se corta de verdad antes del 2 y se reanuda despues: pintar
       el circulo hueco encima de un trazo continuo no abre ningun hueco, lo
       tapa. */
    l.poli([[-2, 0.45], [1.87, 0.45]], { clase: 'dom' });
    l.poli([[2.13, 0.45], [3, 0.45]], { clase: 'dom' });
    l.punto(-2, 0.45, { clase: 'pt', r: 5 });
    l.punto(2, 0.45, { clase: 'hueco', r: 5 });
    l.punto(3, 0.45, { clase: 'hueco', r: 5 });
    l.rotulo(-2, 0.45, 'la raíz: entra', { dx: 0, dy: -12, anclaje: 'middle', color: 'var(--faint)', pequeno: true });
    l.rotulo(2, 0.45, 'el denominador', { dx: 0, dy: -12, anclaje: 'middle', color: 'var(--flag)', pequeno: true });
    l.rotulo(3, 0.45, 'el logaritmo', { dx: 0, dy: -28, anclaje: 'middle', color: 'var(--faint)', pequeno: true });
    return l.svg();
  });

/* ── a pegar ─────────────────────────────────────────────────────────── */
for (const f of figuras) f.svg = f.hacer();

if (process.argv[1]?.endsWith('calculo-propios-t02-t03.mjs')) {
  for (const f of figuras) pegaEnCampo(f.fichero, f.id, f.campo, f.svg, f.pie);
  console.log(`${figuras.length} figuras propias pegadas en los temas 2 y 3`);
}
