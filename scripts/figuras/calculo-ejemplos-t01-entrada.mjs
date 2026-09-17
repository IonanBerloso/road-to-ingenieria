/**
 * Las doce figuras que les faltaban a los ejemplos de entrada del tema 1.
 *
 * Los ejemplos de entrada de complejos son los doce primeros peldaños del
 * corpus entero: son por donde se empieza a estudiar. Y todos hablan del plano
 * —módulo, argumento, giro, raíces repartidas— sin enseñarlo. Con el plano
 * delante, «el argumento de −1−i no es arctan 1» deja de ser una advertencia
 * que hay que creerse y pasa a ser evidente.
 *
 *     node scripts/figuras/calculo-ejemplos-t01-entrada.mjs
 */

import { lienzo } from './lienzo.mjs';
import { pegaEnCampo } from './pegar.mjs';

export const FICHERO = 'src/content/calculo/t01-complejos/ejercicios.yaml';

export const figuras = [];
const fig = (id, pie, hacer) =>
  figuras.push({ fichero: FICHERO, id, campo: 'resolucion', pie, hacer });

const P = Math.PI;

/** El arco que marca un ángulo desde el semieje real positivo. */
const arcoAngulo = (l, r, t0, t1, clase = 'g') => {
  const p = [];
  for (let i = 0; i <= 40; i++) {
    const t = t0 + ((t1 - t0) * i) / 40;
    p.push([r * Math.cos(t), r * Math.sin(t)]);
  }
  l.poli(p, { clase });
};

/** Un lienzo de Argand con los ejes ya puestos. */
const argand = (id, titulo, desc, x, y, opts = {}) => {
  const l = lienzo({ id, ancho: 300, alto: 270, x, y, cuadrado: true, titulo, desc, ...opts });
  return l;
};

/* ── 1 · pasar 1 + i a forma polar ───────────────────────────────────── */

fig('ej-polar-de-uno-mas-i',
  'El módulo es la longitud de la flecha y el argumento, el ángulo que forma con el eje real. Aquí el triángulo es el de medio cuadrado: catetos 1 y 1, hipotenusa √2 y ángulo de 45°. Por eso salen números redondos.',
  () => {
    const l = argand('f-ej-polar-uno-mas-i',
      'El afijo de uno más i con su módulo y su ángulo de cuarenta y cinco grados',
      'Desde el origen sale una flecha hasta el punto de coordenadas uno y uno. Dos líneas de '
      + 'puntos bajan de ese punto a los dos ejes, formando con la flecha un triángulo '
      + 'rectángulo de catetos uno y uno. La hipotenusa, que es la flecha, está rotulada con su '
      + 'longitud, raíz de dos. Un arco junto al origen marca el ángulo que la flecha forma con '
      + 'el eje horizontal, rotulado como pi cuartos, es decir cuarenta y cinco grados.',
      [-0.5, 1.8], [-0.5, 1.8]);
    l.ejes({ nombreX: 'Re', nombreY: 'Im', marcasX: [1], marcasY: [1] });
    l.poli([[1, 0], [1, 1]], { clase: 'g' });
    l.poli([[0, 1], [1, 1]], { clase: 'g' });
    arcoAngulo(l, 0.45, 0, P / 4);
    l.flecha([0, 0], [1, 1], { clase: 'c' });
    l.punto(1, 1, { clase: 'o', r: 4.6 });
    l.rotulo(1, 1, '1 + i', { dx: 7, dy: -4, color: 'var(--flag)' });
    l.rotulo(0.5, 0.5, '√2', { dx: -8, dy: -2, anclaje: 'end' });
    l.rotulo(0.55, 0.23, 'π/4', { dx: 4, dy: 2, pequeno: true });
    return l.svg();
  });

/* ── 2 · volver a binómica desde la polar ────────────────────────────── */

fig('ej-binomica-desde-polar',
  'Volver es proyectar: la parte real es el coseno del ángulo por el módulo y la imaginaria, el seno. Con módulo 2 y ángulo 60° salen 1 y √3, que son los catetos del medio triángulo equilátero de siempre.',
  () => {
    const z = [1, Math.sqrt(3)];
    const l = argand('f-ej-binomica-desde-polar',
      'El afijo de dos por e elevado a i pi tercios, con sus dos proyecciones',
      'Desde el origen sale una flecha de longitud dos que forma sesenta grados con el eje '
      + 'horizontal. Del extremo de la flecha bajan dos líneas de puntos a los ejes: la del eje '
      + 'horizontal marca el valor uno y la del vertical, raíz de tres, algo más de uno coma '
      + 'siete. Un arco junto al origen marca el ángulo de pi tercios. Una circunferencia fina '
      + 'de radio dos recuerda que el módulo no cambia al girar.',
      [-0.6, 2.6], [-0.6, 2.6]);
    arcoAngulo(l, 2, 0, P / 2, 'fue');
    l.ejes({ nombreX: 'Re', nombreY: 'Im', marcasX: [1, 2], marcasY: [1, 2] });
    l.poli([[z[0], 0], z], { clase: 'g' });
    l.poli([[0, z[1]], z], { clase: 'g' });
    arcoAngulo(l, 0.5, 0, P / 3);
    l.flecha([0, 0], z, { clase: 'c' });
    l.punto(...z, { clase: 'o', r: 4.6 });
    l.rotulo(...z, '1 + √3 i', { dx: 7, dy: -4, color: 'var(--flag)' });
    l.rotulo(0.45, 1.05, '2', { dx: -7, dy: 0, anclaje: 'end' });
    l.rotulo(0.62, 0.33, 'π/3', { dx: 4, dy: 2, pequeno: true });
    return l.svg();
  });

/* ── 3 · el argumento de un número del tercer cuadrante ──────────────── */

fig('ej-argumento-tercer-cuadrante',
  'La calculadora contesta 45°, y 45° está en el primer cuadrante: la flecha señala al contrario. La arcotangente no distingue −1/−1 de 1/1, y por eso hay que mirar el dibujo y sumar π. El argumento es 225°, o −135°.',
  () => {
    const l = argand('f-ej-argumento-tercer',
      'El afijo de menos uno menos i y el punto equivocado que da la arcotangente',
      'Desde el origen sale una flecha hacia abajo y a la izquierda hasta el punto de '
      + 'coordenadas menos uno y menos uno: es el número del enunciado, y está en el tercer '
      + 'cuadrante. Con trazo fino se dibuja otra flecha hacia arriba y a la derecha, hasta el '
      + 'punto uno coma uno: es a donde llevaría el ángulo que devuelve la calculadora. Las dos '
      + 'flechas son opuestas. Un arco grande recorre los doscientos veinticinco grados que '
      + 'separan el semieje real positivo del número de verdad.',
      [-1.9, 1.9], [-1.9, 1.9]);
    l.ejes({ nombreX: 'Re', nombreY: 'Im', marcasX: [-1, 1], marcasY: [-1, 1] });
    arcoAngulo(l, 0.62, 0, (5 * P) / 4, 'cp');
    l.flecha([0, 0], [1, 1], { clase: 'fue', color: 'var(--faint)' });
    l.flecha([0, 0], [-1, -1], { clase: 'c' });
    l.punto(-1, -1, { clase: 'o', r: 4.6 });
    l.punto(1, 1, { r: 3.4 });
    l.rotulo(-1, -1, '−1 − i', { dx: -7, dy: 4, anclaje: 'end', color: 'var(--flag)' });
    l.rotulo(1, 1, 'lo que da arctan', { dx: -6, dy: -6, anclaje: 'end', color: 'var(--faint)', pequeno: true });
    l.rotulo(-0.35, 0.52, '225°', { dx: 0, dy: 0, anclaje: 'middle' });
    return l.svg();
  });

/* ── 4 · el argumento cuando la parte real es cero ───────────────────── */

fig('ej-argumento-imaginario-puro',
  'Aquí la arcotangente no es que se equivoque: no se puede ni escribir, porque habría que dividir entre cero. El dibujo lo resuelve sin fórmula — la flecha apunta hacia abajo en vertical, así que el argumento es −90°.',
  () => {
    const l = argand('f-ej-argumento-imaginario',
      'El afijo de menos dos i, sobre el eje imaginario y apuntando hacia abajo',
      'Desde el origen sale una flecha vertical hacia abajo hasta el punto de altura menos dos '
      + 'sobre el eje imaginario. Su longitud es dos, que es el módulo. Un arco recorre los '
      + 'noventa grados que hay del semieje real positivo hasta ella, medidos en sentido '
      + 'horario, y está rotulado como menos noventa grados. Junto al origen, una nota señala '
      + 'que la parte real vale cero y que por eso el cociente de la arcotangente no se puede '
      + 'formar.',
      [-1.9, 1.9], [-2.6, 1.2]);
    l.ejes({ nombreX: 'Re', nombreY: 'Im', marcasX: [1], marcasY: [[-2, '−2'], [1, '1']] });
    arcoAngulo(l, 0.6, 0, -P / 2, 'cp');
    l.flecha([0, 0], [0, -2], { clase: 'c' });
    l.punto(0, -2, { clase: 'o', r: 4.6 });
    l.rotulo(0, -2, '−2i', { dx: 8, dy: 4, color: 'var(--flag)' });
    l.rotulo(0.72, -0.5, '−90°', { dx: 4, dy: 4 });
    l.esquina(10, 17, 'parte real 0: no hay arctan');
    return l.svg();
  });

/* ── 5 · dividir racionalizando ──────────────────────────────────────── */

fig('ej-dividir-racionalizando',
  'Dividir es restar argumentos y dividir módulos, y eso se comprueba en el dibujo: el cociente queda en la bisectriz del primer cuadrante porque los ángulos de arriba y abajo se restan, y mucho más cerca del origen porque los módulos también.',
  () => {
    const l = argand('f-ej-dividir-racionalizando',
      'Los dos números del cociente y el resultado, mucho más pequeño y en la bisectriz',
      'Tres flechas salen del origen. Una llega al punto dos coma uno, el numerador. Otra al '
      + 'punto tres coma menos uno, el denominador, que apunta ligeramente hacia abajo. La '
      + 'tercera, más corta y con trazo grueso, llega al punto cero coma cinco y cero coma '
      + 'cinco: es el cociente, y cae justo sobre la bisectriz del primer cuadrante, que se '
      + 'dibuja con una línea de puntos.',
      [-0.8, 3.6], [-1.6, 2.2]);
    l.ejes({ nombreX: 'Re', nombreY: 'Im', marcasX: [1, 2, 3], marcasY: [[1, '1'], [-1, '−1']] });
    l.poli([[0, 0], [2.1, 2.1]], { clase: 'g' });
    l.flecha([0, 0], [2, 1], { clase: 'fue', color: 'var(--faint)' });
    l.flecha([0, 0], [3, -1], { clase: 'fue', color: 'var(--faint)' });
    l.flecha([0, 0], [0.5, 0.5], { clase: 'c' });
    l.punto(0.5, 0.5, { clase: 'o', r: 4.6 });
    l.rotulo(2, 1, '2 + i', { dx: 6, dy: -4, color: 'var(--faint)' });
    l.rotulo(3, -1, '3 − i', { dx: 6, dy: 4, color: 'var(--faint)' });
    l.rotulo(0.5, 0.5, '0,5 + 0,5i', { dx: -8, dy: -5, anclaje: 'end', color: 'var(--flag)' });
    return l.svg();
  });

/* ── 6 · un número por su conjugado ──────────────────────────────────── */

fig('ej-modulo-por-conjugado',
  'El conjugado es el reflejo en el eje real: mismo módulo, argumento cambiado de signo. Al multiplicarlos, los argumentos se cancelan y los módulos se multiplican, así que el resultado cae en el eje real y vale |z|². Aquí, 25.',
  () => {
    const l = argand('f-ej-modulo-conjugado',
      'El número, su conjugado reflejado y el producto sobre el eje real',
      'Dos flechas salen del origen y son simétricas respecto del eje horizontal: una llega al '
      + 'punto tres coma cuatro y la otra al tres coma menos cuatro. Las dos tienen la misma '
      + 'longitud, cinco, y sobre un arco fino que pasa por los dos está escrito ese valor. Una '
      + 'línea de puntos vertical une los dos afijos, dejando ver que solo se diferencian en el '
      + 'signo de la parte imaginaria. El producto de los dos vale veinticinco y es un número '
      + 'real, como dice la nota de la esquina; no se dibuja porque a esa distancia del origen '
      + 'los dos afijos quedarían del tamaño de una mota.',
      [-1.4, 6.4], [-5.4, 5.4]);
    arcoAngulo(l, 5, -P / 2, P / 2, 'fue');
    l.ejes({ nombreX: 'Re', nombreY: 'Im', marcasX: [3], marcasY: [[4, '4'], [-4, '−4']] });
    l.flecha([0, 0], [3, 4], { clase: 'c' });
    l.flecha([0, 0], [3, -4], { clase: 'c2', color: 'var(--alt)' });
    l.poli([[3, 4], [3, -4]], { clase: 'g' });
    l.punto(3, 4, { clase: 'o', r: 4.6 });
    l.punto(3, -4, { clase: 'o', r: 4.6 });
    l.rotulo(3, 4, 'z = 3+4i', { dx: 7, dy: -4, color: 'var(--flag)' });
    l.rotulo(3, -4, 'z̄ = 3−4i', { dx: 7, dy: 4, color: 'var(--alt)' });
    l.rotulo(3.6, 2.5, '|z| = 5', { dx: 2, dy: 0 });
    l.esquina(10, 17, 'z·z̄ = 25 = |z|², y es real');
    return l.svg();
  });

/* ── 7 · una potencia alta, sin desarrollar el binomio ───────────────── */

fig('ej-potencia-por-de-moivre',
  'Cada vez que se multiplica por 1+i, el módulo se multiplica por √2 y el argumento sube 45°. Ocho veces son 360° exactos —una vuelta entera— y el módulo queda en (√2)⁸ = 16: por eso el resultado cae en el eje real positivo.',
  () => {
    const l = lienzo({
      id: 'f-ej-potencia-moivre',
      ancho: 320, alto: 290,
      x: [-14, 18], y: [-10, 14], cuadrado: true,
      titulo: 'Las ocho potencias sucesivas de uno más i, girando y alejándose',
      desc: 'Ocho puntos parten del uno más i y van girando alrededor del origen en sentido '
      + 'antihorario, cada uno cuarenta y cinco grados más allá que el anterior y más lejos del '
      + 'centro, dibujando una espiral que se abre. Una línea de puntos los une para que se '
      + 'siga el recorrido. El octavo cae exactamente sobre el eje horizontal, a la derecha, en '
      + 'el valor dieciséis: ha dado la vuelta completa. Está marcado con un círculo más grande.',
    });
    const pot = Array.from({ length: 9 }, (_, k) => {
      const r = Math.SQRT2 ** k, t = (k * P) / 4;
      return [r * Math.cos(t), r * Math.sin(t)];
    });
    l.ejes({ nombreX: 'Re', nombreY: 'Im', marcasX: [8, 16], marcasY: [8] });
    l.poli(pot, { clase: 'cp' });
    for (let k = 1; k <= 7; k++) l.punto(...pot[k], { r: 3.6 });
    l.punto(...pot[1], { clase: 'o', r: 4.4 });
    l.punto(...pot[8], { clase: 'o', r: 5.2 });
    l.rotulo(...pot[1], '1+i', { dx: -6, dy: -5, anclaje: 'end', color: 'var(--flag)' });
    l.rotulo(...pot[8], '(1+i)⁸ = 16', { dx: -6, dy: -9, anclaje: 'end', color: 'var(--flag)' });
    l.esquina(10, 17, 'cada paso: ×√2 y +45°');
    return l.svg();
  });

/* ── 8 · las tres raíces cúbicas de un número real ───────────────────── */

fig('ej-raices-cubicas-de-ocho',
  'Las tres raíces están repartidas a 120° sobre la circunferencia de radio 2, que es la raíz cúbica real de 8. Solo una de ellas es real; las otras dos son complejas conjugadas, y ninguna calculadora las da si no se piden en el plano.',
  () => {
    const l = argand('f-ej-raices-cubicas-ocho',
      'Las tres raíces cúbicas de ocho, en los vértices de un triángulo equilátero',
      'Una circunferencia de radio dos centrada en el origen lleva marcados tres puntos '
      + 'repartidos a intervalos iguales: uno sobre el eje horizontal en el dos, y los otros dos '
      + 'arriba a la izquierda y abajo a la izquierda, a ciento veinte y doscientos cuarenta '
      + 'grados. Los tres están unidos por un triángulo equilátero. Desde el origen sale una '
      + 'flecha a cada uno. El de la derecha es la única raíz real; los otros dos son complejos '
      + 'conjugados entre sí.',
      [-2.9, 2.9], [-2.9, 2.9]);
    l.circunferencia(0, 0, 2, { clase: 'fue' });
    const r = [0, (2 * P) / 3, (4 * P) / 3].map((t) => [2 * Math.cos(t), 2 * Math.sin(t)]);
    l.poli(r, { clase: 'cp2', cerrar: true });
    l.ejes({ nombreX: 'Re', nombreY: 'Im', marcasX: [2], marcasY: [2] });
    for (const v of r) l.flecha([0, 0], v, { clase: 'c' });
    for (const v of r) l.punto(...v, { clase: 'o', r: 4.6 });
    l.rotulo(...r[0], '2', { dx: 7, dy: -5, color: 'var(--flag)' });
    l.rotulo(...r[1], '−1+√3 i', { dx: -6, dy: -5, anclaje: 'end', color: 'var(--flag)' });
    l.rotulo(...r[2], '−1−√3 i', { dx: -6, dy: 12, anclaje: 'end', color: 'var(--flag)' });
    l.esquina(10, 17, 'a 120° una de otra');
    return l.svg();
  });

/* ── 9 · una ecuación con la z y su conjugado a la vez ───────────────── */

fig('ej-ecuacion-con-conjugado',
  'Tomando módulos, r² = r, así que o r = 0 o r = 1: solo puede haber soluciones en el origen y en la circunferencia unidad. En ella, la condición sobre los argumentos deja tres. En total cuatro, y una de ellas es el propio cero.',
  () => {
    const l = argand('f-ej-ecuacion-conjugado',
      'Las cuatro soluciones: el origen y tres puntos sobre la circunferencia unidad',
      'Una circunferencia de radio uno centrada en el origen lleva tres puntos marcados, '
      + 'repartidos a ciento veinte grados: uno en el uno sobre el eje horizontal y los otros '
      + 'dos arriba y abajo a la izquierda, unidos por un triángulo equilátero. Además, el '
      + 'propio origen está marcado como cuarta solución, con un rótulo aparte. Fuera de la '
      + 'circunferencia y del origen no hay nada, porque al tomar módulos la ecuación obliga a '
      + 'que el módulo valga cero o uno.',
      [-1.9, 1.9], [-1.9, 1.9]);
    l.circunferencia(0, 0, 1, { clase: 'fue' });
    const r = [0, (2 * P) / 3, (4 * P) / 3].map((t) => [Math.cos(t), Math.sin(t)]);
    l.poli(r, { clase: 'cp2', cerrar: true });
    l.ejes({ nombreX: 'Re', nombreY: 'Im', marcasX: [1], marcasY: [1] });
    for (const v of r) l.punto(...v, { clase: 'o', r: 4.8 });
    l.punto(0, 0, { clase: 'o', r: 4.8 });
    l.rotulo(0, 0, 'z = 0', { dx: -7, dy: 14, anclaje: 'end', color: 'var(--flag)' });
    l.rotulo(...r[0], '1', { dx: 7, dy: -5, color: 'var(--flag)' });
    l.esquina(10, 17, 'módulo 0 o 1: no hay más sitios');
    return l.svg();
  });

/* ── 10 · girar un vértice para encontrar los demás ──────────────────── */

fig('ej-girar-para-completar-la-figura',
  'No hace falta resolver ninguna ecuación: los tres vértices de un equilátero centrado en el origen están a 120° uno de otro, así que basta multiplicar el que se conoce por e^{2πi/3} dos veces. Multiplicar por un complejo de módulo 1 es exactamente girar.',
  () => {
    const l = argand('f-ej-girar-completar',
      'El vértice conocido y los dos que salen al girarlo ciento veinte grados',
      'Sobre una circunferencia de radio uno hay tres puntos que forman un triángulo '
      + 'equilátero con el centro en el origen. Uno de ellos, el del eje horizontal en el uno, '
      + 'está resaltado: es el que da el enunciado. Dos arcos con flecha salen de él y recorren '
      + 'ciento veinte grados cada uno hasta los otros dos vértices, indicando el giro. Los '
      + 'tres están unidos por los lados del triángulo.',
      [-1.9, 1.9], [-1.9, 1.9]);
    l.circunferencia(0, 0, 1, { clase: 'fue' });
    const r = [0, (2 * P) / 3, (4 * P) / 3].map((t) => [Math.cos(t), Math.sin(t)]);
    l.poli(r, { clase: 'c', cerrar: true });
    l.ejes({ nombreX: 'Re', nombreY: 'Im', marcasX: [1], marcasY: [1] });
    arcoAngulo(l, 1.35, 0.12, (2 * P) / 3 - 0.12, 'cp2');
    l.flecha([1.35 * Math.cos((2 * P) / 3 - 0.24), 1.35 * Math.sin((2 * P) / 3 - 0.24)],
      [1.35 * Math.cos((2 * P) / 3 - 0.12), 1.35 * Math.sin((2 * P) / 3 - 0.12)],
      { clase: 'cp2', color: 'var(--alt)', punta: 6 });
    for (const v of r) l.punto(...v, { clase: 'o', r: 4.6 });
    l.rotulo(...r[0], 'z₀ = 1', { dx: 7, dy: -5, color: 'var(--flag)' });
    l.rotulo(1.35 * Math.cos(1), 1.35 * Math.sin(1), 'giro de 120°', { dx: 6, dy: -4, color: 'var(--alt)', pequeno: true });
    return l.svg();
  });

/* ── 11 · una exponencial con infinitas soluciones ───────────────────── */

fig('ej-exponencial-con-infinitas-soluciones',
  'La exponencial compleja es periódica de periodo 2πi, así que si una z resuelve la ecuación, también la resuelven todas las que estén 2π más arriba o más abajo. Las soluciones son una escalera infinita sobre el eje imaginario.',
  () => {
    const l = lienzo({
      id: 'f-ej-exponencial-infinitas',
      ancho: 300, alto: 285,
      x: [-3.4, 3.4], y: [-11.5, 11.5], cuadrado: false,
      titulo: 'Las soluciones de e elevado a z igual a menos uno, alineadas sobre el eje imaginario',
      desc: 'Sobre el eje vertical hay una columna de puntos igualmente espaciados. El de en '
      + 'medio está a la altura pi, algo más de tres; los siguientes aparecen cada dos pi hacia '
      + 'arriba y hacia abajo, en menos pi, tres pi y menos tres pi. Una llave marca la '
      + 'separación de dos pi entre dos consecutivos. Sendos puntos suspensivos arriba y abajo '
      + 'recuerdan que la lista no acaba. Ninguna solución se sale del eje vertical, porque la '
      + 'parte real tiene que ser cero para que el módulo valga uno.',
    });
    l.ejes({ nombreX: 'Re', nombreY: 'Im', marcasX: [2], marcasY: [[P, 'π'], [3 * P, '3π'], [-P, '−π'], [-3 * P, '−3π']] });
    for (const k of [-1, 0, 1]) l.punto(0, P + 2 * P * k, { clase: 'o', r: 4.6 });
    l.flecha([1.5, P], [1.5, 3 * P], { clase: 'cp2', color: 'var(--alt)', punta: 6 });
    l.poli([[0.2, P], [1.5, P]], { clase: 'g' });
    l.poli([[0.2, 3 * P], [1.5, 3 * P]], { clase: 'g' });
    l.rotulo(1.5, 2 * P, '2π', { dx: 6, dy: 4, color: 'var(--alt)' });
    l.rotulo(0, 10.4, '⋮', { dx: 0, dy: 0, anclaje: 'middle' });
    l.rotulo(0, -10.4, '⋮', { dx: 0, dy: 0, anclaje: 'middle' });
    return l.svg();
  });

/* ── 12 · el coseno de un número imaginario ──────────────────────────── */

fig('ej-coseno-de-i',
  'Sobre el eje real el coseno no se sale nunca de la banda entre −1 y 1. Sobre el eje imaginario deja de estar acotado: cos(it) es el coseno hiperbólico, que crece sin tope. Por eso cos i vale 1,543, que en los reales sería imposible.',
  () => {
    const l = lienzo({
      id: 'f-ej-coseno-de-i',
      ancho: 335, alto: 250,
      x: [-3.6, 3.6], y: [-1.8, 4.4], cuadrado: false,
      titulo: 'El coseno sobre el eje real, acotado, y sobre el eje imaginario, sin cota',
      desc: 'Dos curvas comparten los ejes. Una ondula entre menos uno y uno sin salirse nunca '
      + 'de esa banda, que está sombreada: es el coseno de un número real. La otra tiene forma '
      + 'de cadena colgante invertida, con el mínimo en uno y creciendo hacia arriba por los dos '
      + 'lados sin tope: es el coseno de i por t, que resulta ser el coseno hiperbólico. En t '
      + 'igual a uno hay un punto marcado a la altura uno coma cinco cuatro tres, que es el '
      + 'valor pedido, y se ve que queda por encima de la banda.',
    });
    l.poli([[-3.6, -1], [3.6, -1], [3.6, 1], [-3.6, 1]], { clase: 'f', cerrar: true });
    l.ejes({ nombreX: 't', nombreY: '', marcasX: [-2, -1, 1, 2], marcasY: [[1, '1'], [-1, '−1']] });
    l.curva(Math.cos, [-3.55, 3.55], { clase: 'c2', n: 160 });
    l.curva(Math.cosh, [-2.1, 2.1], { clase: 'c', n: 120 });
    l.punto(1, Math.cosh(1), { clase: 'o', r: 4.8 });
    l.rotulo(1, Math.cosh(1), 'cos i = 1,543', { dx: 8, dy: 2, color: 'var(--flag)' });
    l.rotulo(-2.4, Math.cos(-2.4), 'cos t', { dx: -4, dy: 14, anclaje: 'end', color: 'var(--alt)' });
    l.rotulo(-1.9, Math.cosh(1.9), 'cos(it)', { dx: 5, dy: 2 });
    return l.svg();
  });

/* ── a pegar ─────────────────────────────────────────────────────────── */
for (const f of figuras) f.svg = f.hacer();

if (process.argv[1]?.endsWith('calculo-ejemplos-t01-entrada.mjs')) {
  for (const f of figuras) pegaEnCampo(f.fichero, f.id, f.campo, f.svg, f.pie);
  console.log(`${figuras.length} figuras de ejemplo pegadas en ${FICHERO}`);
}
