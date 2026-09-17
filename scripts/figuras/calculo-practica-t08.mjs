/**
 * Las figuras de las prácticas del tema 8: integral curvilínea.
 *
 * Es el tema más geométrico de la asignatura y el que estaba más vacío: cero
 * de veintitrés prácticas con dibujo. Y aquí el dibujo no es adorno. Una
 * integral curvilínea tiene tres datos —el campo, la curva y **el sentido**—
 * y los dos últimos son geometría: «la frontera del recinto limitado por
 * $x^2+y^2\ge 2x$, $x^2+y^2\le 4x$, $y\le x$, $y\ge 0$» es una luna entre dos
 * circunferencias que nadie ve en la cabeza a la primera, y quien no la ve no
 * puede ni empezar a poner límites.
 *
 * Este fichero lleva los recintos y trayectorias de una pieza; los ejercicios
 * de varios apartados van en `calculo-practica-t08-apartados.mjs`.
 *
 *     node scripts/figuras/calculo-practica-t08.mjs
 */

import { lienzo, mosaico, vista3d } from './lienzo.mjs';
import { pegaEnCampo } from './pegar.mjs';

export const FICHERO = 'src/content/calculo/t08-integral-curvilinea/ejercicios.yaml';

export const figuras = [];
const fig = (id, pie, hacer) =>
  figuras.push({ fichero: FICHERO, id, campo: 'resolucion', pie, hacer });

const P = Math.PI;

/** Un arco de circunferencia, en coordenadas de la asignatura. */
const arco = (cx, cy, r, t0, t1, n = 96) =>
  Array.from({ length: n + 1 }, (_, k) => {
    const t = t0 + ((t1 - t0) * k) / n;
    return [cx + r * Math.cos(t), cy + r * Math.sin(t)];
  });

/** Una curva paramétrica muestreada. */
const param = (f, t0, t1, n = 140) =>
  Array.from({ length: n + 1 }, (_, k) => f(t0 + ((t1 - t0) * k) / n));

/* ── 1 · la parábola y su cuerda ─────────────────────────────────────── */

fig('la-parabola-y-su-cuerda',
  'La parábola de eje vertical por A(1,0) y B(2,3) es y = x² − 1, y la cuerda es y = 3(x−1). El contorno AmBnA va por la parábola de A a B y vuelve por la cuerda, que es sentido horario: por eso Green sale con signo menos.',
  () => {
    const par = (x) => x * x - 1;
    const cue = (x) => 3 * (x - 1);
    const l = lienzo({
      id: 'f-parabola-cuerda',
      ancho: 330, alto: 300,
      x: [-0.28, 2.42], y: [-0.4, 3.3], cuadrado: false,
      titulo: 'La parábola y = x² − 1 entre A(1,0) y B(2,3), y la cuerda que los une',
      desc: 'Entre los puntos A, de coordenadas uno y cero, y B, de coordenadas dos y tres, se '
        + 'dibujan dos caminos. Uno es el arco de la parábola y igual a x al cuadrado menos uno, '
        + 'que va por debajo. El otro es el segmento recto que los une, la cuerda, que va por '
        + 'encima. Entre los dos queda encerrada una región con forma de lente, sombreada. El '
        + 'contorno cerrado se recorre subiendo por la parábola de A a B y bajando por la cuerda '
        + 'de B a A, lo que deja la región a la derecha: es sentido horario, o negativo.',
    });
    const region = [
      ...param((x) => [x, par(x)], 1, 2, 60),
      ...param((x) => [x, cue(x)], 2, 1, 60),
    ];
    /* La lente que encierran es de verdad estrecha —la separación máxima entre
       parábola y cuerda es un cuarto de unidad sobre un recorrido de tres—, y
       con la trama de siempre no se distinguía del fondo. Se le sube la tinta
       a esta figura en vez de mentir sobre la escala. */
    l.clase('f', 'fill: var(--live); fill-opacity: .26; stroke: none;');
    l.poli(region, { clase: 'f', cerrar: true });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2], marcasY: [3] });
    l.curva((x) => par(x), [0.7, 2.1], { clase: 'c', n: 80 });
    l.curva((x) => cue(x), [0.92, 2.12], { clase: 'c2', n: 2 });
    l.flecha([1.45, par(1.45)], [1.62, par(1.62)], { clase: 'c' });
    l.flecha([1.62, cue(1.62)], [1.45, cue(1.45)], { clase: 'c2', color: 'var(--alt)' });
    l.punto(1, 0, { clase: 'o', r: 4.4 });
    l.punto(2, 3, { clase: 'o', r: 4.4 });
    l.rotulo(1, 0, 'A(1,0)', { dx: -8, dy: -5, anclaje: 'end', color: 'var(--flag)' });
    l.rotulo(2, 3, 'B(2,3)', { dx: -7, dy: -8, anclaje: 'end', color: 'var(--flag)' });
    l.rotulo(1.85, par(1.85), 'y = x²−1', { dx: 8, dy: 12, anclaje: 'start' });
    l.rotulo(1.72, cue(1.72), 'cuerda', { dx: -8, dy: -6, anclaje: 'end', color: 'var(--alt)' });
    return l.svg();
  });

/* ── 2 · Green que no se puede aplicar ───────────────────────────────── */

fig('green-que-no-se-puede-aplicar',
  'El campo no está definido en el origen, y el origen está dentro de la curva. Por eso Green no se puede aplicar al disco entero, y por eso la integral vale 2π en vez de cero pese a que Qx − Py sea cero en todos los puntos donde existe.',
  () => {
    const l = lienzo({
      id: 'f-green-no-aplicable',
      ancho: 320, alto: 260,
      x: [-1.55, 1.55], y: [-1.5, 1.6], cuadrado: true,
      titulo: 'La circunferencia de radio R y el punto del centro donde el campo no existe',
      desc: 'Una circunferencia de radio R centrada en el origen, recorrida en sentido '
        + 'antihorario, con el disco que encierra sombreado. En el centro, justo en el origen, '
        + 'hay un pequeño círculo vacío que marca el único punto del plano donde el campo no '
        + 'está definido, porque allí el denominador x al cuadrado más y al cuadrado se anula. '
        + 'Ese punto está dentro de la curva, y por eso el teorema de Green no se puede aplicar '
        + 'a la región encerrada: sus hipótesis piden que el campo sea derivable en todos los '
        + 'puntos de la región, sin excepciones.',
    });
    l.disco(0, 0, 1, { clase: 'f' });
    l.ejes({ nombreX: 'x', nombreY: 'y' });
    l.circunferencia(0, 0, 1, { clase: 'c' });
    l.flecha([Math.cos(0.32), Math.sin(0.32)], [Math.cos(0.52), Math.sin(0.52)], { clase: 'c' });
    l.flecha([Math.cos(P + 0.32), Math.sin(P + 0.32)], [Math.cos(P + 0.52), Math.sin(P + 0.52)], { clase: 'c' });
    l.punto(0, 0, { clase: 'hueco', r: 5 });
    l.rotulo(Math.cos(-0.8), Math.sin(-0.8), 'R', { dx: 7, dy: 6 });
    l.esquina(10, 17, 'el campo no existe en (0,0)', { color: 'var(--flag)' });
    return l.svg();
  });

/* ── 3 · la luna entre dos circunferencias ───────────────────────────── */

fig('entre-dos-circunferencias-que-pasan-por-el-origen',
  'Las dos condiciones con circunferencias son, en polares, ρ ≥ 2cosθ y ρ ≤ 4cosθ; las otras dos recortan el sector 0 ≤ θ ≤ π/4. El recinto es la luna sombreada, y su frontera tiene cuatro tramos: dos arcos y dos segmentos radiales.',
  () => {
    const dentro = (t) => [2 * Math.cos(t) * Math.cos(t), 2 * Math.cos(t) * Math.sin(t)];
    const fuera = (t) => [4 * Math.cos(t) * Math.cos(t), 4 * Math.cos(t) * Math.sin(t)];
    const l = lienzo({
      id: 'f-luna-dos-circunferencias',
      ancho: 350, alto: 235,
      x: [-0.35, 4.45], y: [-0.5, 2.7], cuadrado: true,
      titulo: 'La luna entre las dos circunferencias, cortada por el sector de cuarenta y cinco grados',
      desc: 'Dos circunferencias pasan por el origen y tienen su centro sobre el eje x: la '
        + 'pequeña, de radio uno y centro en el uno, y la grande, de radio dos y centro en el '
        + 'dos. De ellas se dibuja solo la mitad de arriba, con trazo discontinuo. La recta y '
        + 'igual a x sale del origen a cuarenta y cinco grados. La región sombreada es lo que '
        + 'queda fuera de la circunferencia pequeña, dentro de la grande y entre el eje x y esa '
        + 'recta. Su frontera tiene cuatro tramos: el segmento del eje x que va de dos a cuatro, '
        + 'el arco grande hasta el punto dos coma dos, el segmento que baja por la recta hasta '
        + 'el punto uno coma uno, y el arco pequeño que vuelve al punto de partida.',
    });
    l.poli(
      [...param(fuera, 0, P / 4, 60), ...param(dentro, P / 4, 0, 60)],
      { clase: 'f', cerrar: true },
    );
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [2, 4] });
    l.poli(arco(1, 0, 1, 0, P, 70), { clase: 'fue' });
    l.poli(arco(2, 0, 2, 0, P, 80), { clase: 'fue' });
    l.poli([[0, 0], [2.55, 2.55]], { clase: 'g' });
    l.poli(param(fuera, 0, P / 4, 60), { clase: 'c' });
    l.poli(param(dentro, 0, P / 4, 60), { clase: 'c' });
    l.poli([[2, 0], [4, 0]], { clase: 'c2' });
    l.poli([[1, 1], [2, 2]], { clase: 'c2' });
    l.punto(2, 2, { clase: 'o', r: 4 });
    l.punto(1, 1, { clase: 'o', r: 4 });
    l.rotulo(2, 2, '(2,2)', { dx: 7, dy: 3, color: 'var(--flag)', pequeno: true });
    l.rotulo(1, 1, '(1,1)', { dx: -9, dy: 4, anclaje: 'end', color: 'var(--flag)', pequeno: true });
    l.rotulo(2.55, 2.55, 'y = x', { dx: 3, dy: 11, color: 'var(--faint)', pequeno: true });
    l.rotulo(...fuera(0.55), 'ρ = 4cos θ', { dx: 6, dy: -4 });
    l.rotulo(1.42, 0.3, 'ρ = 2cos θ', { dx: 0, dy: 4, anclaje: 'middle' });
    return l.svg();
  });

/* ── 4 · el cuarto de disco, por los dos caminos ─────────────────────── */

fig('la-misma-circulacion-de-dos-formas',
  'El recinto es el cuarto de disco del primer cuadrante. Su frontera tiene tres tramos —dos radios y el arco—, y eso es justo lo que hace que parametrizar cueste tres integrales y Green solo una.',
  () => {
    const l = lienzo({
      id: 'f-cuarto-disco-dos-formas',
      ancho: 300, alto: 250,
      x: [-0.3, 1.35], y: [-0.3, 1.35], cuadrado: true,
      titulo: 'El cuarto de disco de radio uno del primer cuadrante, con su frontera en tres tramos',
      desc: 'La región es el cuarto de disco de radio uno que queda en el primer cuadrante, '
        + 'limitado por el eje x entre cero y uno, por el arco de la circunferencia unidad, y '
        + 'por el eje y entre uno y cero. Está sombreada. Sobre la frontera hay tres flechas que '
        + 'marcan el sentido antihorario: hacia la derecha por el eje x, subiendo por el arco, y '
        + 'bajando por el eje y. Cada tramo está rotulado con su nombre.',
    });
    l.poli([[0, 0], ...arco(0, 0, 1, 0, P / 2, 60)], { clase: 'f', cerrar: true });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1], marcasY: [1] });
    l.poli([[0, 0], [1, 0]], { clase: 'c' });
    l.poli(arco(0, 0, 1, 0, P / 2, 60), { clase: 'c' });
    l.poli([[0, 1], [0, 0]], { clase: 'c' });
    l.flecha([0.42, 0], [0.62, 0], { clase: 'c' });
    l.flecha([Math.cos(0.68), Math.sin(0.68)], [Math.cos(0.88), Math.sin(0.88)], { clase: 'c' });
    l.flecha([0, 0.62], [0, 0.42], { clase: 'c' });
    l.rotulo(0.55, 0, 'L₁: y = 0', { dx: 0, dy: 15, anclaje: 'middle', pequeno: true });
    l.rotulo(Math.cos(0.78), Math.sin(0.78), 'L₂: el arco', { dx: 5, dy: -4, pequeno: true });
    l.rotulo(0, 0.55, 'L₃: x = 0', { dx: -7, dy: -3, anclaje: 'end', pequeno: true });
    return l.svg();
  });

/* ── 5 · el semieje que minimiza el trabajo ──────────────────────────── */

fig('el-semieje-que-minimiza-el-trabajo',
  'A la izquierda, la familia de semielipses: todas empiezan en (−1,0) y acaban en (1,0), y lo único que cambia es la altura b. A la derecha, el trabajo en función de b, que es la parábola W = 4b² − 8πb: baja, toca el mínimo en b = π y vuelve a subir.',
  () => {
    const semi = (b) => param((t) => [Math.cos(t), b * Math.sin(t)], P, 0, 80);
    return mosaico({
      id: 'f-semieje-minimo',
      columnas: 2,
      ancho: 200,
      alto: 168,
      titulo: 'La familia de semielipses y la parábola del trabajo, con su mínimo en b igual a pi',
      desc: 'A la izquierda, cuatro semielipses dibujadas sobre los mismos extremos, el punto '
        + 'menos uno coma cero y el punto uno coma cero, con alturas uno, dos, pi y cuatro. La '
        + 'de altura pi está resaltada. A la derecha, la gráfica del trabajo en función de b: '
        + 'una parábola que vale cero en b igual a cero, baja hasta su vértice en b igual a pi, '
        + 'donde vale menos cuatro pi al cuadrado, unos menos treinta y nueve con cinco, y '
        + 'vuelve a valer cero en b igual a dos pi. El mínimo está marcado con un punto y una '
        + 'línea de puntos que lo lleva a cada eje.',
      celdas: [
        {
          etiqueta: 'las semielipses',
          x: [-1.35, 1.35], y: [-0.35, 4.4], cuadrado: false,
          dibuja: (l) => {
            l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-1, 1] });
            for (const b of [1, 2, 4]) l.poli(semi(b), { clase: 'g' });
            l.poli(semi(P), { clase: 'c' });
            l.flecha([Math.cos(2.7), P * Math.sin(2.7)], [Math.cos(2.45), P * Math.sin(2.45)], { clase: 'c' });
            l.punto(-1, 0, { clase: 'o', r: 3.8 });
            l.punto(1, 0, { clase: 'o', r: 3.8 });
            l.rotulo(0.22, P, 'b = π', { dx: 6, dy: -4 });
            l.rotulo(0, 4, 'b = 4', { dx: 5, dy: -4, color: 'var(--faint)', pequeno: true });
            l.rotulo(0, 1, 'b = 1', { dx: 5, dy: -4, color: 'var(--faint)', pequeno: true });
          },
        },
        {
          etiqueta: 'el trabajo W(b)',
          x: [-0.4, 6.9], y: [-46, 9], cuadrado: false,
          dibuja: (l) => {
            l.ejes({ nombreX: 'b', nombreY: 'W', marcasX: [[P, 'π'], [2 * P, '2π']] });
            l.curva((b) => 4 * b * b - 8 * P * b, [0, 6.6], { clase: 'c', n: 90 });
            l.poli([[P, -7], [P, -4 * P * P]], { clase: 'g' });
            l.poli([[0, -4 * P * P], [P, -4 * P * P]], { clase: 'g' });
            l.punto(P, -4 * P * P, { clase: 'o', r: 4 });
            l.rotulo(P, -4 * P * P, '−4π²', { dx: 6, dy: 12, color: 'var(--flag)' });
          },
        },
      ],
    });
  });

/* ── 6 · la espiral y el área que barre ──────────────────────────────── */

fig('la-espiral-y-el-area-que-barre',
  'La espiral ρ = θ da una vuelta completa mientras θ va de 0 a 2π, y acaba en B(2π,0). Cerrando con el segmento de vuelta por el eje x queda la región sombreada, cuya área es exactamente el trabajo del campo: ese campo mide áreas.',
  () => {
    const esp = (t) => [t * Math.cos(t), t * Math.sin(t)];
    const l = lienzo({
      id: 'f-espiral-area',
      ancho: 340, alto: 265,
      x: [-3.9, 6.9], y: [-5.1, 2.6], cuadrado: true,
      titulo: 'La espiral de Arquímedes tras una vuelta completa, y el área que barre',
      desc: 'Una espiral sale del origen y da una vuelta completa en sentido antihorario, '
        + 'alejándose poco a poco del centro, hasta llegar al punto de abscisa dos pi sobre el '
        + 'eje x, algo más de seis. El segmento del eje x que vuelve de ese punto al origen '
        + 'cierra la curva. La región encerrada entre la espiral y ese segmento está sombreada: '
        + 'es una espira completa, más ancha por la derecha que por la izquierda. El punto de '
        + 'partida A está en el origen y el de llegada B en dos pi coma cero.',
    });
    l.poli(param(esp, 0, 2 * P, 200), { clase: 'f', cerrar: true });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [[2 * P, '2π']] });
    l.poli(param(esp, 0, 2 * P, 200), { clase: 'c' });
    l.poli([[2 * P, 0], [0, 0]], { clase: 'c2' });
    l.flecha(esp(2.0), esp(2.35), { clase: 'c' });
    l.flecha([3.4, 0], [2.6, 0], { clase: 'c2', color: 'var(--alt)' });
    l.punto(0, 0, { clase: 'o', r: 4.2 });
    l.punto(2 * P, 0, { clase: 'o', r: 4.2 });
    l.rotulo(0, 0, 'A', { dx: -7, dy: 13, anclaje: 'end', color: 'var(--flag)' });
    l.rotulo(2 * P, 0, 'B', { dx: -8, dy: -8, anclaje: 'end', color: 'var(--flag)' });
    l.rotulo(...esp(2.6), 'ρ = θ', { dx: 4, dy: -5 });
    l.rotulo(3.5, 0, 'segmento BA', { dx: 0, dy: -8, anclaje: 'middle', color: 'var(--alt)', pequeno: true });
    return l.svg();
  });

/* ── 7 · el área de la astroide ──────────────────────────────────────── */

fig('el-area-de-la-astroide',
  'La astroide, con sus cuatro picos sobre los ejes y sus cuatro lados hundidos hacia dentro. Cabe en el cuadrado de lado 2 y ocupa solo 3π/8 de las 4 unidades de ese cuadrado: poco más de una cuarta parte.',
  () => {
    const ast = (t) => [Math.cos(t) ** 3, Math.sin(t) ** 3];
    const l = lienzo({
      id: 'f-astroide',
      ancho: 300, alto: 270,
      x: [-1.35, 1.35], y: [-1.35, 1.35], cuadrado: true,
      titulo: 'La astroide inscrita en el cuadrado de lado dos',
      desc: 'La curva tiene cuatro picos, uno en cada uno de los puntos uno coma cero, cero coma '
        + 'uno, menos uno coma cero y cero coma menos uno. Entre pico y pico el trazo no es '
        + 'recto sino que se hunde hacia el centro, de modo que la figura parece una estrella de '
        + 'cuatro puntas con los lados cóncavos. El interior está sombreado. Alrededor, con '
        + 'trazo discontinuo, el cuadrado de vértices más y menos uno en cada eje, que la curva '
        + 'toca solo en los cuatro picos.',
    });
    l.poli(param(ast, 0, 2 * P, 200), { clase: 'f', cerrar: true });
    l.poli([[-1, -1], [1, -1], [1, 1], [-1, 1]], { clase: 'fue', cerrar: true });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-1, 1], marcasY: [-1, 1] });
    l.poli(param(ast, 0, 2 * P, 200), { clase: 'c', cerrar: true });
    l.flecha(ast(0.45), ast(0.62), { clase: 'c' });
    for (const t of [0, P / 2, P, (3 * P) / 2]) l.punto(...ast(t), { clase: 'o', r: 3.8 });
    l.esquina(10, 17, 'área = 3π/8');
    return l.svg();
  });

/* ── 8 · la media elipse en sentido negativo ─────────────────────────── */

fig('la-media-elipse-en-sentido-negativo',
  'La mitad de arriba de la elipse, recorrida en sentido negativo: eso significa ir de (−a,0) a (a,0), y no al revés. El sentido es el dato que decide el signo del resultado, y es lo único que el enunciado dice de la orientación.',
  () => {
    const a = 2, b = 1.25;
    const el = (t) => [a * Math.cos(t), b * Math.sin(t)];
    const l = lienzo({
      id: 'f-media-elipse-negativa',
      ancho: 330, alto: 215,
      x: [-2.45, 2.45], y: [-0.95, 1.75], cuadrado: true,
      titulo: 'La mitad superior de la elipse, recorrida de menos a a más a',
      desc: 'La mitad de arriba de una elipse de semieje horizontal a y semieje vertical b, '
        + 'dibujada con trazo grueso; la mitad de abajo aparece con trazo discontinuo para '
        + 'recordar que no forma parte del camino. Tres flechas sobre el arco apuntan hacia la '
        + 'derecha: el recorrido empieza en el punto menos a coma cero, sube por la izquierda, '
        + 'pasa por lo alto y baja hasta el punto a coma cero. Ese es el sentido negativo, u '
        + 'horario, porque el antihorario sobre esta misma media elipse iría al revés.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [[-a, '−a'], [a, 'a']], marcasY: [[b, 'b']] });
    l.poli(param(el, P, 2 * P, 90), { clase: 'fue' });
    l.poli(param(el, P, 0, 120), { clase: 'c' });
    for (const t of [2.65, P / 2, 0.5]) l.flecha(el(t + 0.16), el(t - 0.16), { clase: 'c' });
    l.punto(-a, 0, { clase: 'o', r: 4.2 });
    l.punto(a, 0, { clase: 'o', r: 4.2 });
    l.rotulo(-a, 0, 'salida', { dx: -3, dy: 28, anclaje: 'middle', color: 'var(--flag)', pequeno: true });
    l.rotulo(a, 0, 'llegada', { dx: 3, dy: 28, anclaje: 'middle', color: 'var(--flag)', pequeno: true });
    return l.svg();
  });

/* ── 9 · la circulación que no depende del radio ─────────────────────── */

fig('la-circulacion-que-no-depende-del-radio',
  'Dos circunferencias del mismo centro y distinto radio dan exactamente el mismo valor, −2π. Al parametrizar, la a² del denominador se come la a² que sale de los diferenciales, y el radio desaparece antes de integrar.',
  () => {
    const l = lienzo({
      id: 'f-circulacion-sin-radio',
      ancho: 320, alto: 260,
      x: [-2.1, 2.1], y: [-2.05, 2.15], cuadrado: true,
      titulo: 'Dos circunferencias concéntricas de radios distintos y la misma circulación',
      desc: 'Dos circunferencias centradas en el origen, una de radio uno y otra de radio dos, '
        + 'ambas recorridas en sentido antihorario, marcado con una flecha en cada una. Junto a '
        + 'cada una, el mismo valor: menos dos pi. El origen aparece como un círculo vacío, '
        + 'porque también aquí el campo deja de estar definido en el centro. El dibujo enseña de '
        + 'un vistazo que el radio no interviene en el resultado.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y' });
    l.circunferencia(0, 0, 1, { clase: 'c' });
    l.circunferencia(0, 0, 1.8, { clase: 'c2' });
    l.flecha([Math.cos(0.42), Math.sin(0.42)], [Math.cos(0.66), Math.sin(0.66)], { clase: 'c' });
    l.flecha([1.8 * Math.cos(0.3), 1.8 * Math.sin(0.3)], [1.8 * Math.cos(0.48), 1.8 * Math.sin(0.48)], { clase: 'c2', color: 'var(--alt)' });
    l.punto(0, 0, { clase: 'hueco', r: 4.6 });
    l.rotulo(0, 1, 'a = 1', { dx: 7, dy: -6, pequeno: true });
    l.rotulo(0, 1.8, 'a = 2', { dx: 7, dy: -7, color: 'var(--alt)', pequeno: true });
    l.esquina(10, 17, 'las dos dan I = −2π');
    return l.svg();
  });

/* ── 10 · Green en el triángulo del boletín ──────────────────────────── */

fig('green-en-un-triangulo-del-boletin',
  'El triángulo A(1,1), B(2,2), C(1,3) tiene el lado AC vertical sobre x = 1 y los otros dos apoyados en las rectas y = x e y = 4 − x. Su área es 1, y ese dato basta para rematar la integral doble.',
  () => {
    const A = [1, 1], B = [2, 2], C = [1, 3];
    const l = lienzo({
      id: 'f-green-triangulo-boletin',
      ancho: 320, alto: 250,
      x: [-0.2, 2.6], y: [-0.2, 3.6], cuadrado: true,
      titulo: 'El triángulo de vértices uno uno, dos dos y uno tres',
      desc: 'Un triángulo con un lado vertical sobre la recta x igual a uno, que va desde el '
        + 'punto uno coma uno hasta el punto uno coma tres. El vértice restante está en el punto '
        + 'dos coma dos, a la derecha, de modo que el triángulo apunta hacia la derecha. El lado '
        + 'de abajo está sobre la recta y igual a x y el de arriba sobre la recta y igual a '
        + 'cuatro menos x, ambas dibujadas con trazo discontinuo más allá del triángulo. El '
        + 'interior está sombreado y tres flechas marcan el recorrido antihorario.',
    });
    l.poli([A, B, C], { clase: 'f', cerrar: true });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2], marcasY: [1, 2, 3] });
    l.poli([[0.15, 0.15], [2.45, 2.45]], { clase: 'g' });
    l.poli([[1.4, 2.6], [2.45, 1.55]], { clase: 'g' });
    l.poli([A, B, C], { clase: 'c', cerrar: true });
    l.flecha([1.4, 1.4], [1.62, 1.62], { clase: 'c' });
    l.flecha([1.62, 2.38], [1.4, 2.6], { clase: 'c' });
    l.flecha([1, 2.2], [1, 1.8], { clase: 'c' });
    for (const v of [A, B, C]) l.punto(...v, { clase: 'o', r: 4.2 });
    l.rotulo(...A, 'A(1,1)', { dx: -6, dy: 12, anclaje: 'end', color: 'var(--flag)', pequeno: true });
    l.rotulo(...B, 'B(2,2)', { dx: 9, dy: 3, color: 'var(--flag)', pequeno: true });
    l.rotulo(...C, 'C(1,3)', { dx: -6, dy: -6, anclaje: 'end', color: 'var(--flag)', pequeno: true });
    l.esquina(10, 17, 'área del triángulo: 1');
    return l.svg();
  });

/* ── 11 · Green en la circunferencia del boletín ─────────────────────── */

fig('green-en-la-circunferencia-del-boletin',
  'El recinto es el disco entero de radio R. Con Qx − Py = x² + y², la integral doble pide polares: el integrando pasa a ρ² y el jacobiano añade otra ρ.',
  () => {
    const l = lienzo({
      id: 'f-green-circunferencia-boletin',
      ancho: 300, alto: 260,
      x: [-1.5, 1.5], y: [-1.45, 1.55], cuadrado: true,
      titulo: 'El disco de radio R, con un anillo elemental de polares dibujado dentro',
      desc: 'Una circunferencia de radio R centrada en el origen, recorrida en sentido '
        + 'antihorario, con el disco que encierra sombreado. Dentro se dibuja, con trazo '
        + 'discontinuo, un anillo intermedio de radio rho, y un radio que va del centro a la '
        + 'circunferencia: son los elementos con los que se monta la integral en polares, donde '
        + 'rho recorre de cero a R y el ángulo da la vuelta entera.',
    });
    l.disco(0, 0, 1, { clase: 'f' });
    l.ejes({ nombreX: 'x', nombreY: 'y' });
    l.circunferencia(0, 0, 0.62, { clase: 'g' });
    l.circunferencia(0, 0, 1, { clase: 'c' });
    l.poli([[0, 0], [Math.cos(0.9), Math.sin(0.9)]], { clase: 'g' });
    l.flecha([Math.cos(0.3), Math.sin(0.3)], [Math.cos(0.5), Math.sin(0.5)], { clase: 'c' });
    l.punto(0, 0, { r: 3.2 });
    l.rotulo(Math.cos(-0.65), Math.sin(-0.65), 'R', { dx: 7, dy: 5 });
    l.rotulo(0.62 * Math.cos(-1.9), 0.62 * Math.sin(-1.9), 'ρ', { dx: -6, dy: 4, anclaje: 'end', color: 'var(--faint)', pequeno: true });
    return l.svg();
  });

/* ── 12 · Green al revés, con el área como dato ──────────────────────── */

fig('trabajo-con-el-area-dada',
  'El enunciado no dice cómo es L₁, y no hace falta: al ser constante el integrando de Green, lo único que cuenta de la curva es cuánta área encierra. El segmento de vuelta va por el eje x, donde el campo no aporta nada.',
  () => {
    /* La curva dibujada es *una* L₁ cualquiera, no la del boletín: el
       enunciado solo fija los extremos, el sentido y el área. Dibujar una
       concreta y decir que es la del enunciado sería inventarse un dato. */
    const l1 = (x) => 3.2 * (1 - x * x) * (1 + 0.42 * x);
    const l = lienzo({
      id: 'f-trabajo-area-dada',
      ancho: 330, alto: 235,
      x: [-1.55, 1.75], y: [-0.85, 3.9], cuadrado: false,
      titulo: 'Una trayectoria cualquiera de A a B, y el área que encierra al cerrarla por el eje x',
      desc: 'Del punto A, de coordenadas menos uno y cero, sale una curva que sube, se abomba '
        + 'hacia arriba y vuelve a bajar hasta el punto B, de coordenadas uno y cero. El '
        + 'segmento del eje x que va de B a A cierra la figura. La región encerrada está '
        + 'sombreada y lleva escrito dentro que su área vale diez. Flechas sobre la curva y '
        + 'sobre el segmento marcan el recorrido: por la curva de A a B, y por el eje de vuelta '
        + 'de B a A, que es el sentido positivo. Sobre el segmento hay una nota que dice que '
        + 'ahí la integral aporta cero. La forma concreta de la curva es inventada: el enunciado '
        + 'solo fija los extremos, el sentido y el área.',
    });
    l.poli(param((x) => [x, l1(x)], -1, 1, 90), { clase: 'f', cerrar: true });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-1, 1] });
    l.curva((x) => l1(x), [-1, 1], { clase: 'c', n: 90 });
    l.poli([[1, 0], [-1, 0]], { clase: 'c2' });
    l.flecha([-0.72, l1(-0.72)], [-0.52, l1(-0.52)], { clase: 'c' });
    l.flecha([0.25, 0], [-0.05, 0], { clase: 'c2', color: 'var(--alt)' });
    l.punto(-1, 0, { clase: 'o', r: 4.2 });
    l.punto(1, 0, { clase: 'o', r: 4.2 });
    l.rotulo(-1, 0, 'A(−1,0)', { dx: -7, dy: -6, anclaje: 'end', color: 'var(--flag)' });
    l.rotulo(1, 0, 'B(1,0)', { dx: 6, dy: -6, color: 'var(--flag)' });
    l.rotulo(0.05, 1.5, 'S = 10', { dx: 0, dy: 0, anclaje: 'middle' });
    l.rotulo(-0.35, 0, 'aquí aporta 0', { dx: 0, dy: 28, anclaje: 'middle', color: 'var(--alt)', pequeno: true });
    l.rotulo(-0.2, l1(-0.2), 'L₁', { dx: 0, dy: -7, anclaje: 'middle' });
    return l.svg();
  });

/* ── 13 · el cable helicoidal ────────────────────────────────────────── */

fig('la-masa-del-cable-helicoidal',
  'Tres vueltas de hélice de radio 1 subiendo hasta z = 6π. El eje vertical va comprimido para que quepa: en escala verdadera el cable sería tres veces más esbelto. La densidad crece con z², así que casi toda la masa está arriba.',
  () => {
    const p3 = vista3d({ escalaXY: 3.1, inclinacion: 0.42 });
    /* El eje z se dibuja comprimido: tres vueltas de radio 1 subiendo hasta
       6π son, a escala, un hilo cuatro veces más alto que ancho, y de ese
       dibujo no se lee nada. Se dice en la descripción y en el pie. */
    const K = 2.4;
    const hel = (t) => p3(Math.sin(t), Math.cos(t), t / K);
    const l = lienzo({
      id: 'f-cable-helicoidal',
      ancho: 300, alto: 280,
      x: [-6.4, 6.4], y: [-1.6, 10.4], cuadrado: false,
      titulo: 'Las tres vueltas del cable helicoidal, con el eje vertical comprimido',
      desc: 'Una hélice de radio uno da tres vueltas completas mientras sube desde la altura '
        + 'cero hasta la altura seis pi. Se ve en perspectiva, con el eje z vertical en el '
        + 'centro y los ejes x e y saliendo hacia los lados por abajo. La proyección de la '
        + 'hélice sobre el suelo es la circunferencia de radio uno, dibujada con trazo '
        + 'discontinuo. El eje vertical está comprimido a propósito, algo menos de la mitad, '
        + 'porque a escala verdadera el cable sería un hilo demasiado esbelto para leerlo. Tres '
        + 'marcas señalan las alturas dos pi, cuatro pi y seis pi, una por vuelta.',
    });
    l.poli(p3.aro(0, 1), { clase: 'g' });
    l.poli([p3(0, 0, 0), p3(0, 0, (6 * P) / K + 0.9)], { clase: 'eje' });
    l.poli([p3(0, 0, 0), p3(2.1, 0, 0)], { clase: 'eje' });
    l.poli([p3(0, 0, 0), p3(0, 2.1, 0)], { clase: 'eje' });
    l.poli(param(hel, 0, 6 * P, 420), { clase: 'c' });
    for (const k of [2, 4, 6]) {
      const [px, py] = p3(0, 0, (k * P) / K);
      l.poli([[px - 0.35, py], [px + 0.35, py]], { clase: 'g' });
      l.rotulo(px - 0.5, py, `${k}π`, { dx: -2, dy: 3, anclaje: 'end', color: 'var(--faint)', pequeno: true });
    }
    l.rotulo(...p3(2.1, 0, 0), 'x', { dx: 4, dy: 8, color: 'var(--faint)', pequeno: true });
    l.rotulo(...p3(0, 2.1, 0), 'y', { dx: -10, dy: 8, color: 'var(--faint)', pequeno: true });
    l.rotulo(...p3(0, 0, (6 * P) / K + 0.9), 'z', { dx: 6, dy: 2, color: 'var(--faint)', pequeno: true });
    l.esquina(6, 14, 'eje z comprimido', { color: 'var(--faint)' });
    return l.svg();
  });

/* ── 14 · el campo con una componente desconocida ────────────────────── */

fig('campo-con-componente-desconocida',
  'Lo que se da es el trabajo por la diagonal de M(0,0) a N(1,1); lo que se pide es el del segmento vertical de P(a,0) a Q(a,1), con a cualquiera. Entre los dos no hay ninguna relación geométrica: la relación la pone el potencial.',
  () => {
    const a = 2.3;
    const l = lienzo({
      id: 'f-componente-desconocida',
      ancho: 320, alto: 230,
      x: [-0.4, 3.1], y: [-0.4, 1.6], cuadrado: true,
      titulo: 'La diagonal que se conoce y el segmento vertical que se pregunta',
      desc: 'En el plano hay dos caminos marcados. El primero es la diagonal que va del origen, '
        + 'llamado M, al punto uno coma uno, llamado N, y sobre él está escrito que el trabajo '
        + 'vale e. El segundo es un segmento vertical situado más a la derecha, a una abscisa '
        + 'cualquiera llamada a, que sube del punto a coma cero, llamado P, al punto a coma uno, '
        + 'llamado Q, y lleva un interrogante. Una línea de puntos horizontal une los dos puntos '
        + 'de altura uno y otra los dos de altura cero, para dejar ver que lo único que cambia '
        + 'entre los dos caminos es la abscisa.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, [a, 'a']], marcasY: [1] });
    l.poli([[0, 1], [a, 1]], { clase: 'g' });
    l.poli([[1, 0], [a, 0]], { clase: 'g' });
    l.flecha([0, 0], [1, 1], { clase: 'c' });
    l.flecha([a, 0], [a, 1], { clase: 'c2', color: 'var(--alt)' });
    l.punto(0, 0, { clase: 'o', r: 4 });
    l.punto(1, 1, { clase: 'o', r: 4 });
    l.punto(a, 0, { clase: 'o', r: 4 });
    l.punto(a, 1, { clase: 'o', r: 4 });
    l.rotulo(0, 0, 'M', { dx: -5, dy: 14, anclaje: 'end', color: 'var(--flag)' });
    l.rotulo(1, 1, 'N', { dx: -6, dy: -6, anclaje: 'end', color: 'var(--flag)' });
    l.rotulo(a, 0, 'P', { dx: 8, dy: 2, color: 'var(--flag)' });
    l.rotulo(a, 1, 'Q', { dx: 7, dy: -4, color: 'var(--flag)' });
    l.rotulo(0.5, 0.5, 'W = e', { dx: 5, dy: 8 });
    l.rotulo(a, 0.5, '¿?', { dx: -7, dy: 4, anclaje: 'end', color: 'var(--alt)' });
    return l.svg();
  });

/* ── a pegar ─────────────────────────────────────────────────────────── */
for (const f of figuras) f.svg = f.hacer();

if (process.argv[1]?.endsWith('calculo-practica-t08.mjs')) {
  for (const f of figuras) pegaEnCampo(f.fichero, f.id, f.campo, f.svg, f.pie);
  console.log(`${figuras.length} figuras de práctica pegadas en ${FICHERO}`);
}
