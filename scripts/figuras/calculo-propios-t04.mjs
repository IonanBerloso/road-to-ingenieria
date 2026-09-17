/**
 * Las figuras de los tres ejercicios propios del tema 4 que las necesitan.
 *
 * Dos de ellas no ilustran: **son el enunciado**. Los ejercicios de leer la
 * gráfica de la derivada no tienen datos aparte de la curva, así que la figura
 * va en el campo `enunciado` y no en la resolución. Si se cayera, el ejercicio
 * dejaría de tener sentido, y por eso sus `desc` describen la curva entera y
 * no solo lo que se quiere señalar: alguien que use lector de pantalla tiene
 * que poder resolverlo con el texto alternativo delante.
 *
 * La tercera sí es de comparación: el esbozo bueno del paso `dibujar` del
 * estudio completo.
 *
 *     node scripts/figuras/calculo-propios-t04.mjs
 */

import { lienzo } from './lienzo.mjs';
import { pega, pegaEnCampo } from './pegar.mjs';

export const FICHERO = 'src/content/calculo/t04-estudio-local/ejercicios.yaml';

export const figuras = [];
const fig = (id, campo, pie, hacer) =>
  figuras.push({ fichero: FICHERO, id, campo, pie, hacer });

/* ── 1 · la gráfica de f′ con tres cortes (dato del enunciado) ───────── */

fig('la-derivada-que-corta-tres-veces', 'enunciado',
  'La gráfica de f prima. Los tres cortes con el eje horizontal están en x = −1, x = 1 y x = 3.',
  () => {
    const fp = (x) => ((x + 1) * (x - 1) * (x - 3)) / 4;
    const l = lienzo({
      id: 'f-derivada-tres-cortes',
      ancho: 340, alto: 250,
      x: [-2, 4], y: [-1.8, 1.8], cuadrado: false,
      margen: 26,
      titulo: 'La gráfica de la derivada de f, que corta al eje horizontal en menos uno, uno y tres',
      desc: 'Una curva que viene de muy abajo por la izquierda, sube cortando el eje horizontal '
        + 'en x igual a menos uno, alcanza una cima justo a la izquierda del cero, baja y vuelve '
        + 'a cortar el eje en x igual a uno, sigue bajando hasta un valle alrededor de x igual a '
        + 'dos con quince, y por último sube y corta el eje por tercera vez en x igual a tres, '
        + 'continuando hacia arriba. Así que la curva está por debajo del eje antes de menos uno '
        + 'y entre uno y tres, y por encima entre menos uno y uno y a partir de tres. Los tres '
        + 'cortes están marcados con un punto. La curva dibujada es la derivada, no la función.',
    });
    l.ejes({ nombreX: 'x', nombreY: "f'", marcasX: [-1, 1, 3], marcasY: [-1, 1] });
    l.curva(fp, [-1.5, 3.5], { clase: 'c', n: 160 });
    for (const x of [-1, 1, 3]) l.punto(x, 0, { clase: 'o', r: 4.2 });
    return l.svg();
  });

/* ── 2 · la derivada constante a trozos (dato del enunciado) ─────────── */

fig('de-la-derivada-a-trozos-a-la-funcion', 'enunciado',
  'La gráfica de f prima, escalonada. Las áreas sombreadas son lo que hay que acumular: la de debajo del eje resta.',
  () => {
    const l = lienzo({
      id: 'f-derivada-a-trozos',
      ancho: 340, alto: 235,
      x: [-0.7, 5.6], y: [-2.9, 2.2], cuadrado: false,
      margen: 26,
      titulo: 'La gráfica de la derivada de f, constante a trozos, con valores uno, menos dos y uno',
      desc: 'Una gráfica escalonada formada por tres tramos horizontales. El primero va de x '
        + 'igual a cero a x igual a dos a la altura uno, por encima del eje. El segundo va de x '
        + 'igual a dos a x igual a tres a la altura menos dos, por debajo del eje. El tercero va '
        + 'de x igual a tres a x igual a cinco, otra vez a la altura uno. En los dos saltos, en x '
        + 'igual a dos y en x igual a tres, hay trazos verticales de puntos que unen los tramos, '
        + 'porque la función dibujada salta y no es continua ahí. Bajo cada tramo hay una zona '
        + 'sombreada entre la gráfica y el eje: dos rectángulos por encima, de áreas dos y dos, y '
        + 'uno por debajo, de área dos. Lo dibujado es la derivada.',
    });
    l.ejes({ nombreX: 'x', nombreY: "f'", marcasX: [2, 3, 5], marcasY: [-2, 1] });
    /* Las tres áreas, que es lo que hay que acumular. */
    l.region([[0, 0], [2, 0], [2, 1], [0, 1]], { clase: 'f' });
    l.region([[2, 0], [3, 0], [3, -2], [2, -2]], { clase: 'f2' });
    l.region([[3, 0], [5, 0], [5, 1], [3, 1]], { clase: 'f' });
    /* Los tres tramos. */
    l.poli([[0, 1], [2, 1]], { clase: 'c' });
    l.poli([[2, -2], [3, -2]], { clase: 'c' });
    l.poli([[3, 1], [5, 1]], { clase: 'c' });
    /* Los saltos, a puntos: la derivada no es continua ahí. */
    l.poli([[2, 1], [2, -2]], { clase: 'g' });
    l.poli([[3, -2], [3, 1]], { clase: 'g' });
    l.rotulo(1, 0.5, '+2', { dx: 0, dy: 4, anclaje: 'middle', color: 'var(--faint)', pequeno: true });
    l.rotulo(2.5, -1, '−2', { dx: 0, dy: 4, anclaje: 'middle', color: 'var(--faint)', pequeno: true });
    l.rotulo(4, 0.5, '+2', { dx: 0, dy: 4, anclaje: 'middle', color: 'var(--faint)', pequeno: true });
    return l.svg();
  });

/* ── 3 · el esbozo bueno de x²/(x−1) (paso dibujar) ──────────────────── */

fig('estudio-completo-de-una-racional', 'paso',
  null,
  () => {
    const f = (x) => (x * x) / (x - 1);
    const l = lienzo({
      id: 'f-racional-completa',
      ancho: 330, alto: 300,
      x: [-4.4, 6.4], y: [-8.5, 12.5], cuadrado: false,
      margen: 26,
      titulo: 'La gráfica de x al cuadrado partido por x menos uno, con sus dos asíntotas',
      desc: 'La gráfica está partida en dos ramas por una recta vertical de puntos en x igual a '
        + 'uno, que es la asíntota vertical. Hay además una recta oblicua de puntos, y igual a x '
        + 'más uno, que es la asíntota oblicua. La rama izquierda viene de abajo a la izquierda '
        + 'pegada por debajo a la recta oblicua, sube hasta tocar el origen, donde tiene tangente '
        + 'horizontal, y desde ahí cae hacia menos infinito pegándose a la recta vertical. La '
        + 'rama derecha baja desde arriba pegada a la recta vertical por su derecha, alcanza un '
        + 'punto más bajo en x igual a dos, a la altura cuatro, y desde ahí sube pegándose por '
        + 'encima a la recta oblicua. Los dos puntos de tangente horizontal, el origen y el dos '
        + 'coma cuatro, están marcados: el primero es un máximo local y el segundo un mínimo '
        + 'local, aunque el máximo esté más abajo que el mínimo, porque están en ramas distintas.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-2, 2, 4], marcasY: [4, 8] });
    /* Las dos asíntotas, primero, que son el armazón del esbozo. */
    l.poli([[1, -8.3], [1, 12.3]], { clase: 'fue' });
    l.poli([[-4.3, -3.3], [6.3, 7.3]], { clase: 'cp2' });
    /* Las dos ramas, cortadas donde se salen por arriba o por abajo. */
    /* Hasta donde cada rama se sale por arriba o por abajo, y no antes: lo
       que hay que ver es que huyen de la vertical, no que se detienen. */
    l.curva(f, [-4.3, 0.9], { clase: 'c', n: 170 });
    l.curva(f, [1.1, 6.3], { clase: 'c', n: 170 });
    l.punto(0, 0, { clase: 'o', r: 4.2 });
    l.punto(2, 4, { clase: 'o', r: 4.2 });
    l.rotulo(0, 0, 'máx (0,0)', { dx: -8, dy: 15, anclaje: 'end', color: 'var(--flag)' });
    l.rotulo(2, 4, 'mín (2,4)', { dx: 10, dy: 21, color: 'var(--flag)' });
    l.rotulo(5.4, 6.4, 'y = x+1', { dx: 0, dy: -6, anclaje: 'end', color: 'var(--alt)' });
    l.rotulo(1, 11, 'x = 1', { dx: 6, dy: 0, color: 'var(--faint)', pequeno: true });
    return l.svg();
  });

/* ── 4 · las tres curvas a emparejar (dato del enunciado) ────────────── */

fig('cual-de-las-tres-es-la-funcion', 'enunciado',
  'Las tres curvas, sin decir cuál es cuál. Cada una corta al eje horizontal una sola vez, y esos tres cortes están marcados.',
  () => {
    /* Es x·e^(−x/3) con sus dos derivadas. El tercio del exponente no es
       capricho: con x·e^(−x) la segunda derivada arranca en −2 y aplasta a
       las otras dos contra el eje, de modo que el mínimo de f′ —que es la
       mitad del razonamiento— dejaba de verse. Así las tres caben en la
       misma escala y sus ceros salen en 0, 3 y 6, uno por curva.

       Que la más pequeña de las tres sea f″ y no f es indiferente al
       método, y de hecho el ejercicio desmiente que el tamaño ordene nada. */
    const C = (x) => x * Math.exp(-x / 3);
    const A = (x) => (1 - x / 3) * Math.exp(-x / 3);
    const Bc = (x) => (x / 9 - 2 / 3) * Math.exp(-x / 3);
    const l = lienzo({
      id: 'f-tres-curvas-emparejar',
      ancho: 350, alto: 255,
      x: [-0.8, 10.4], y: [-0.85, 1.3], cuadrado: false,
      margen: 26,
      titulo: 'Tres curvas rotuladas A, B y C, que son una función y sus dos derivadas en algún orden',
      desc: 'Tres curvas dibujadas sobre los mismos ejes, entre x igual a cero y x igual a diez. '
        + 'La rotulada C arranca en el origen, sube hasta su punto más alto en x igual a tres, a la '
        + 'altura uno coma uno, y desde ahí baja despacio acercándose al eje sin volver a tocarlo. '
        + 'La rotulada A arranca a la altura uno cuando x vale cero, baja cortando el eje en x igual '
        + 'a tres, sigue bajando hasta su punto más bajo en x igual a seis, a la altura menos cero '
        + 'coma catorce, y después sube muy suavemente hacia el eje. La rotulada B arranca a la '
        + 'altura menos cero coma sesenta y siete cuando x vale cero, sube cortando el eje en x '
        + 'igual a seis y alcanza un punto más alto muy pequeño hacia x igual a nueve. Los tres '
        + 'cortes con el eje horizontal, en cero, tres y seis, están marcados con un punto. Lo '
        + 'que hay que decidir es cuál de las tres es la función y cuáles sus derivadas.',
    });
    l.clase('cB', 'stroke: var(--live); stroke-width: 2.8; fill: none; stroke-dasharray: 7 4;');
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [3, 6, 9], marcasY: [1] });
    l.curva(C, [0, 10.2], { clase: 'c', n: 170 });
    l.curva(A, [0, 10.2], { clase: 'c2', n: 170 });
    l.curva(Bc, [0, 10.2], { clase: 'cB', n: 170 });
    for (const x of [0, 3, 6]) l.punto(x, 0, { clase: 'o', r: 4 });
    l.rotulo(3, C(3), 'C', { dx: 0, dy: -8, anclaje: 'middle', color: 'var(--d1)' });
    l.rotulo(1.1, A(1.1), 'A', { dx: 7, dy: -4, color: 'var(--alt)' });
    l.rotulo(2.2, Bc(2.2), 'B', { dx: 7, dy: 12, color: 'var(--live)' });
    return l.svg();
  });

/* ── a pegar ─────────────────────────────────────────────────────────── */
for (const f of figuras) f.svg = f.hacer();

if (process.argv[1]?.endsWith('calculo-propios-t04.mjs')) {
  for (const f of figuras) {
    if (f.campo === 'paso') pega(f.fichero, f.id, f.svg);
    else pegaEnCampo(f.fichero, f.id, f.campo, f.svg, f.pie);
  }
  console.log(`${figuras.length} figuras propias pegadas en ${FICHERO}`);
}
