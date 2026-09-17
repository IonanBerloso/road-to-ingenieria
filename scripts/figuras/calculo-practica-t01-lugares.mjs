/**
 * Las siete prácticas del tema 1 que describen un lugar del plano y no lo
 * dibujaban.
 *
 * Son las que más lo piden: «hallar los a reales para que el cociente sea
 * real» es, mirado en el plano, preguntar dónde corta al eje real una
 * circunferencia; y «demostrar que si w está en el eje real, z está en una
 * recta» es enseñar esa recta. En los dos casos el dibujo no ilustra la
 * solución: es la solución, y la cuenta solo la confirma.
 *
 *     node scripts/figuras/calculo-practica-t01-lugares.mjs
 */

import { lienzo, mosaico } from './lienzo.mjs';
import { pegaEnCampo } from './pegar.mjs';

export const FICHERO = 'src/content/calculo/t01-complejos/ejercicios.yaml';

export const figuras = [];
const fig = (id, pie, hacer) =>
  figuras.push({ fichero: FICHERO, id, campo: 'resolucion', pie, hacer });

const P = Math.PI;
const param = (f, a, b, n = 140) =>
  Array.from({ length: n + 1 }, (_, k) => f(a + ((b - a) * k) / n));
const aro = (cx, cy, r, t0 = 0, t1 = 2 * P, n = 120) =>
  param((t) => [cx + r * Math.cos(t), cy + r * Math.sin(t)], t0, t1, n);

/* ── 1 · el vértice de un triángulo rectángulo isósceles ─────────────── */

fig('triangulo-rectangulo-isosceles',
  'En un rectángulo isósceles el vértice del ángulo recto está sobre la mediatriz de la hipotenusa, a media hipotenusa del centro. Así que se toma el punto medio y se gira media hipotenusa 90°: no hace falta plantear ninguna ecuación.',
  () => {
    const z1 = [Math.sqrt(3) / 2, -0.5];
    const z2 = [0, 1];
    const M = [(z1[0] + z2[0]) / 2, (z1[1] + z2[1]) / 2];
    const d = [z2[0] - M[0], z2[1] - M[1]];
    const z3 = [M[0] - d[1], M[1] + d[0]];
    const z3b = [M[0] + d[1], M[1] - d[0]];
    const l = lienzo({
      id: 'f-triangulo-rect-isosceles',
      ancho: 320, alto: 270,
      x: [-1.2, 1.9], y: [-1.1, 1.6], cuadrado: true,
      titulo: 'El triángulo rectángulo isósceles y las dos posiciones posibles del tercer vértice',
      desc: 'Dos puntos marcados son los extremos de la hipotenusa: uno arriba sobre el eje '
        + 'imaginario y otro abajo a la derecha. Entre ellos, el segmento de la hipotenusa con '
        + 'su punto medio señalado. Desde ese punto medio sale, perpendicular a la hipotenusa, '
        + 'un segmento de la misma longitud que la mitad de ella, y su extremo es el tercer '
        + 'vértice. El triángulo que forman los tres está dibujado con trazo grueso. Al otro '
        + 'lado de la hipotenusa, con trazo fino, se dibuja la otra solución posible, simétrica '
        + 'de la primera.',
    });
    l.poli([z1, z2, z3], { clase: 'f', cerrar: true });
    l.ejes({ nombreX: 'Re', nombreY: 'Im', marcasX: [1], marcasY: [1] });
    l.poli([z1, z2, z3b], { clase: 'g', cerrar: true });
    l.poli([z1, z2, z3], { clase: 'c', cerrar: true });
    l.poli([M, z3], { clase: 'cp2' });
    l.punto(...z1, { clase: 'o', r: 4.4 });
    l.punto(...z2, { clase: 'o', r: 4.4 });
    l.punto(...M, { r: 3.4 });
    l.punto(...z3, { clase: 'o', r: 4.8 });
    l.rotulo(...z1, 'z₁', { dx: 7, dy: 4, color: 'var(--flag)' });
    l.rotulo(...z2, 'z₂ = i', { dx: -7, dy: -5, anclaje: 'end', color: 'var(--flag)' });
    l.rotulo(...z3, 'z₃', { dx: 8, dy: 4, color: 'var(--flag)' });
    l.rotulo(...M, 'M', { dx: -7, dy: 12, anclaje: 'end', color: 'var(--faint)', pequeno: true });
    l.esquina(10, 17, 'z₃ = M + giro de 90° de MZ₂');
    return l.svg();
  });

/* ── 2 · un parámetro real con cuatro condiciones ────────────────────── */

fig('parametro-real-cociente',
  'Al mover a por toda la recta real, el afijo de z no se mueve por cualquier sitio: recorre una circunferencia que pasa por el origen. Los apartados del ejercicio son sus cortes con los ejes, y por eso hay exactamente un a para cada uno.',
  () => {
    /* z = (2+i)/(a−i). La recta Im w = −1 se invierte en una circunferencia
       por el origen, y multiplicar por 2+i la gira y la escala: queda la de
       centro (−0,5 ; 1) y radio √5/2. */
    const C = [-0.5, 1], R = Math.sqrt(5) / 2;
    /* (2+i)/(a−i) = (2+i)(a+i)/(a²+1) = (2a−1 + (a+2)i)/(a²+1). La primera
       versión de esto tenía los signos cambiados y los puntos caían fuera de
       su propia circunferencia: lo cazó el marco del lienzo, no una lectura. */
    const z = (a) => {
      const d = a * a + 1;
      return [(2 * a - 1) / d, (a + 2) / d];
    };
    const l = lienzo({
      id: 'f-parametro-real-cociente',
      ancho: 320, alto: 275,
      x: [-2.1, 1.5], y: [-0.6, 2.5], cuadrado: true,
      titulo: 'La circunferencia que recorre el afijo de z al variar el parámetro',
      desc: 'Una circunferencia que pasa por el origen, con el centro arriba a la izquierda. '
        + 'Sobre ella hay varios puntos marcados, cada uno correspondiente a un valor del '
        + 'parámetro. Dos están señalados con círculos grandes: el que cae sobre el eje real, en '
        + 'menos uno, que corresponde al valor menos dos del parámetro; y el que cae sobre el '
        + 'eje imaginario, en dos i, que corresponde al valor un medio. El origen también está '
        + 'sobre la circunferencia, y es el punto al que z se acerca cuando el parámetro se va '
        + 'al infinito.',
    });
    l.poli(aro(...C, R), { clase: 'f', cerrar: true });
    l.ejes({ nombreX: 'Re', nombreY: 'Im', marcasX: [[-1, '−1'], [1, '1']], marcasY: [1, 2] });
    l.poli(aro(...C, R), { clase: 'c', cerrar: true });
    for (const a of [-6, -3, -1, 0, 1, 2, 4]) l.punto(...z(a), { r: 3 });
    l.punto(-1, 0, { clase: 'o', r: 4.8 });
    l.punto(0, 2, { clase: 'o', r: 4.8 });
    l.punto(0, 0, { clase: 'hueco', r: 4.4 });
    l.rotulo(-1, 0, 'a = −2: real', { dx: -7, dy: 13, anclaje: 'end', color: 'var(--flag)' });
    l.rotulo(0, 2, 'a = ½: imaginario', { dx: -7, dy: -5, anclaje: 'end', color: 'var(--flag)' });
    l.rotulo(0, 0, 'a → ∞', { dx: 8, dy: 10, color: 'var(--faint)', pequeno: true });
    return l.svg();
  });

/* ── 3 · una potencia que tiene que salir real y negativa ────────────── */

fig('potencia-real-negativa',
  'Al crecer a, el afijo gira y se aleja: describe una espiral. Ser real negativo es caer sobre el semieje de la izquierda, y eso pasa cada media vuelta; la condición sobre el módulo recorta cuántas de esas veces valen. Aquí, dos.',
  () => {
    const z = (a) => [2 ** a * Math.cos(2 * a), 2 ** a * Math.sin(2 * a)];
    const l = lienzo({
      id: 'f-potencia-real-negativa',
      ancho: 320, alto: 285,
      x: [-30, 22], y: [-24, 26], cuadrado: true,
      titulo: 'La espiral que describe la potencia al crecer el exponente, y sus cortes con el semieje negativo',
      desc: 'Una espiral sale de cerca del origen y va dando vueltas alejándose. Corta al semieje '
        + 'real negativo, que está resaltado, en dos puntos marcados con círculos grandes: el '
        + 'primero cerca del origen y el segundo mucho más lejos a la izquierda. Una '
        + 'circunferencia fina de radio uno marca el límite inferior del módulo; el superior, '
        + 'sesenta y cuatro, queda fuera del recorte, y el tercer corte de la espiral con el '
        + 'semieje también, porque su módulo pasa de doscientos.',
    });
    l.ejes({ nombreX: 'Re', nombreY: 'Im', marcasX: [[-20, '−20'], [20, '20']], marcasY: [20] });
    l.poli(aro(0, 0, 1), { clase: 'g', cerrar: true });
    l.poli(param(z, 0, 5.0, 400), { clase: 'c' });
    l.poli([[-29, 0], [-0.5, 0]], { clase: 'cp2' });
    for (const a of [P / 2, (3 * P) / 2]) l.punto(...z(a), { clase: 'o', r: 5 });
    l.rotulo(...z(P / 2), 'a = π/2', { dx: 2, dy: 17, anclaje: 'middle', color: 'var(--flag)' });
    l.rotulo(...z((3 * P) / 2), 'a = 3π/2', { dx: 0, dy: 17, anclaje: 'middle', color: 'var(--flag)' });
    l.rotulo(-15, 0, 'reales negativos', { dx: 0, dy: -9, anclaje: 'middle', color: 'var(--alt)', pequeno: true });
    return l.svg();
  });

/* ── 4 · dos complejos con el cociente real ──────────────────────────── */

fig('dos-complejos-cociente-real',
  'Que el cociente de dos complejos sea real quiere decir que tienen el mismo argumento o argumentos opuestos: los dos afijos y el origen están alineados. Aquí salen a lados distintos del origen, porque el cociente resulta ser negativo.',
  () => {
    const z1 = [2, 4], z2 = [-1, -2];
    const l = lienzo({
      id: 'f-cociente-real-alineados',
      ancho: 310, alto: 280,
      x: [-2.6, 3.2], y: [-3.2, 5], cuadrado: true,
      titulo: 'Los dos afijos alineados con el origen, uno a cada lado',
      desc: 'Una recta que pasa por el origen sube de izquierda a derecha. Sobre ella hay dos '
        + 'puntos marcados: uno arriba a la derecha, en dos coma cuatro, y otro abajo a la '
        + 'izquierda, en menos uno coma menos dos. Están a lados opuestos del origen, lo que '
        + 'indica que el cociente entre ellos es un número real negativo. Desde el origen sale '
        + 'una flecha a cada uno. Un tercer punto, marcado aparte, es la suma de los dos, y vale '
        + 'uno más dos i.',
    });
    l.poli([[-1.55, -3.1], [2.45, 4.9]], { clase: 'cp' });
    l.ejes({ nombreX: 'Re', nombreY: 'Im', marcasX: [[-1, '−1'], [2, '2']], marcasY: [[4, '4'], [-2, '−2']] });
    l.flecha([0, 0], z1, { clase: 'c' });
    l.flecha([0, 0], z2, { clase: 'c' });
    l.punto(...z1, { clase: 'o', r: 4.8 });
    l.punto(...z2, { clase: 'o', r: 4.8 });
    l.punto(1, 2, { r: 3.6 });
    l.rotulo(...z1, 'z₁ = 2+4i', { dx: -7, dy: 4, anclaje: 'end', color: 'var(--flag)' });
    l.rotulo(...z2, 'z₂ = −1−2i', { dx: 7, dy: 12, color: 'var(--flag)' });
    l.rotulo(1, 2, 'z₁+z₂', { dx: 7, dy: 4, color: 'var(--faint)', pequeno: true });
    l.esquina(10, 17, 'alineados con el origen');
    return l.svg();
  });

/* ── 5 · seis ecuaciones que en los reales no tendrían solución ──────── */

fig('seis-ecuaciones-en-el-plano-complejo',
  'Las soluciones de sen z = −3 no están en la recta real: están repartidas en dos filas por encima y por debajo de ella, y se repiten cada 2π. Eso es lo que quiere decir que una ecuación «sin solución» en ℝ tenga infinitas en ℂ.',
  () => {
    const b = Math.acosh(3);
    const l = lienzo({
      id: 'f-ecuaciones-sin-solucion-real',
      ancho: 340, alto: 235,
      x: [-8.4, 8.4], y: [-3.2, 3.2], cuadrado: false,
      titulo: 'Las soluciones de seno de z igual a menos tres, en dos filas fuera del eje real',
      desc: 'Sobre el plano complejo hay dos filas horizontales de puntos, una por encima del eje '
        + 'real y otra por debajo, a la misma distancia de él. Dentro de cada fila los puntos '
        + 'están igualmente espaciados, separados dos pi. El eje real está resaltado con una '
        + 'banda y lleva una nota: sobre él no hay ninguna solución, porque el seno de un número '
        + 'real nunca vale menos tres. Puntos suspensivos a los lados indican que las dos filas '
        + 'siguen indefinidamente.',
    });
    l.poli([[-8.4, -0.28], [8.4, -0.28], [8.4, 0.28], [-8.4, 0.28]], { clase: 'f2', cerrar: true });
    l.ejes({
      nombreX: 'Re', nombreY: 'Im',
      marcasX: [[-P / 2, '−π/2'], [(3 * P) / 2, '3π/2']],
      marcasY: [],
    });
    for (const k of [-1, 0, 1]) {
      const x = -P / 2 + 2 * P * k;
      l.punto(x, b, { clase: 'o', r: 4.6 });
      l.punto(x, -b, { clase: 'o', r: 4.6 });
    }
    l.rotulo(-8.2, b, 'Im = 1,76', { dx: 0, dy: -8 });
    l.rotulo(-8.2, -b, 'Im = −1,76', { dx: 0, dy: 17 });
    l.rotulo(-2.6, 0, 'aquí no hay ninguna', { dx: 0, dy: -8, anclaje: 'middle', color: 'var(--alt)', pequeno: true });
    l.rotulo(7.9, b, 'se repiten cada 2π', { dx: 0, dy: -9, anclaje: 'end', pequeno: true });
    return l.svg();
  });

/* ── 6 · un módulo y un argumento a la vez ───────────────────────────── */

fig('el-modulo-y-el-argumento-a-la-vez',
  'Cada condición es un lugar: |z−3| = 4 es una circunferencia y arg z = π/4 una semirrecta desde el origen. La solución es donde se cortan, y la semirrecta —que no es una recta entera— corta solo una vez: por eso hay una única respuesta.',
  () => {
    const t = 3.897916;
    const l = lienzo({
      id: 'f-modulo-y-argumento',
      ancho: 320, alto: 275,
      x: [-2.2, 7.6], y: [-4.4, 5], cuadrado: true,
      titulo: 'La circunferencia y la semirrecta, y su único punto común',
      desc: 'Una circunferencia de radio cuatro centrada en el punto tres del eje real, que por '
        + 'la izquierda llega hasta menos uno. Desde el origen sale una semirrecta a cuarenta y '
        + 'cinco grados hacia arriba y a la derecha, dibujada con trazo grueso; la prolongación '
        + 'hacia el tercer cuadrante se dibuja con trazo fino para recordar que no cuenta. La '
        + 'semirrecta corta a la circunferencia en un solo punto, marcado con un círculo grande, '
        + 'de coordenadas tres coma noventa en las dos.',
    });
    l.poli(aro(3, 0, 4), { clase: 'f', cerrar: true });
    l.ejes({ nombreX: 'Re', nombreY: 'Im', marcasX: [[-1, '−1'], [3, '3'], [7, '7']], marcasY: [4] });
    l.poli(aro(3, 0, 4), { clase: 'c', cerrar: true });
    l.poli([[-2.1, -2.1], [0, 0]], { clase: 'fue' });
    l.poli([[0, 0], [4.9, 4.9]], { clase: 'c2' });
    l.punto(3, 0, { r: 3.4 });
    l.punto(t, t, { clase: 'o', r: 5 });
    l.rotulo(t, t, 'la solución', { dx: 7, dy: -4, color: 'var(--flag)' });
    l.rotulo(4.6, 4.6, 'arg z = π/4', { dx: 5, dy: 4, color: 'var(--alt)' });
    l.rotulo(3, -4, '|z−3| = 4', { dx: 0, dy: 16, anclaje: 'middle' });
    return l.svg();
  });

/* ── 7 · cuándo un cociente es real, y cuándo imaginario ─────────────── */

fig('la-recta-y-la-circunferencia-de-un-cociente',
  'Los dos apartados son las dos caras del mismo dibujo. Que w sea real deja a z en la recta que une 2 con i; que sea imaginario puro lo deja en la circunferencia que tiene a esos dos puntos como extremos de un diámetro. Y las dos pasan por 2 y por i.',
  () => {
    const l = lienzo({
      id: 'f-recta-y-circunferencia-cociente',
      ancho: 320, alto: 280,
      x: [-0.9, 3.1], y: [-1.1, 2.4], cuadrado: true,
      titulo: 'La recta por los puntos dos e i y la circunferencia que los tiene por diámetro',
      desc: 'Dos puntos marcados: el dos sobre el eje real y el i sobre el eje imaginario. Una '
        + 'recta pasa por los dos y se prolonga a ambos lados: es el lugar de z cuando el '
        + 'cociente es real. Una circunferencia pasa también por los dos, y el segmento que los '
        + 'une es su diámetro; su centro, marcado, está en el punto medio, uno coma cero cinco. '
        + 'Esa circunferencia es el lugar de z cuando el cociente es imaginario puro. Los dos '
        + 'lugares se cortan exactamente en los dos puntos de partida.',
    });
    const C = [1, 0.5], R = Math.sqrt(5) / 2;
    l.poli(aro(...C, R), { clase: 'f2', cerrar: true });
    l.ejes({ nombreX: 'Re', nombreY: 'Im', marcasX: [1, 2], marcasY: [1, 2] });
    l.poli(aro(...C, R), { clase: 'c2', cerrar: true });
    l.poli([[-0.7, 1.35], [3, -0.5]], { clase: 'c' });
    l.punto(2, 0, { clase: 'o', r: 4.8 });
    l.punto(0, 1, { clase: 'o', r: 4.8 });
    l.punto(...C, { r: 3.4 });
    l.rotulo(2, 0, '2', { dx: 6, dy: 14, color: 'var(--flag)' });
    l.rotulo(0, 1, 'i', { dx: -7, dy: -4, anclaje: 'end', color: 'var(--flag)' });
    l.rotulo(-0.5, 1.2, 'w real', { dx: 4, dy: -5 });
    l.rotulo(1, 1.62, 'w imaginario', { dx: 0, dy: -8, anclaje: 'middle', color: 'var(--alt)' });
    return l.svg();
  });

/* ── a pegar ─────────────────────────────────────────────────────────── */
for (const f of figuras) f.svg = f.hacer();

if (process.argv[1]?.endsWith('calculo-practica-t01-lugares.mjs')) {
  for (const f of figuras) pegaEnCampo(f.fichero, f.id, f.campo, f.svg, f.pie);
  console.log(`${figuras.length} figuras de lugares pegadas en ${FICHERO}`);
}
