/**
 * Las siete figuras de los ejemplos de entrada del tema 3.
 *
 * Ninguno tenía dibujo, y son los siete peldaños por los que se entra al tema:
 * un dominio que no se ve, una inversa que obliga a elegir rama, dos trozos
 * que hay que pegar, Bolzano, un pico donde no hay derivada, dos magnitudes
 * que cambian a la vez y una raíz aproximada con la tangente.
 *
 *     node scripts/figuras/calculo-ejemplos-t03.mjs
 */

import { lienzo } from './lienzo.mjs';
import { pegaEnCampo } from './pegar.mjs';

export const FICHERO = 'src/content/calculo/t03-funciones-reales/ejercicios.yaml';

export const figuras = [];
const fig = (id, pie, hacer) =>
  figuras.push({ fichero: FICHERO, id, campo: 'resolucion', pie, hacer });

const P = Math.PI;

/* ── 1 · un dominio con una restricción que no se ve ─────────────────── */

fig('ej-dominio-con-arcoseno',
  'El arcoseno solo existe entre −1 y 1, así que lo que tiene que caer ahí es 2x, no x. Eso parte el intervalo por la mitad: el dominio es [−½, ½]. La banda sombreada marca lo que el arcoseno admite, y la flecha, de dónde sale la mitad.',
  () => {
    const l = lienzo({
      id: 'f-ej-dominio-arcoseno',
      ancho: 330, alto: 240,
      x: [-1.45, 1.45], y: [-2.1, 2.1], cuadrado: false,
      titulo: 'El arcoseno de dos x y la banda de valores que el arcoseno admite',
      desc: 'Una banda vertical sombreada cubre la franja de las x entre menos un medio y un '
        + 'medio: es el dominio. Dentro de ella se dibuja la curva del arcoseno de dos x, que '
        + 'sube desde menos pi medios en el extremo izquierdo de la banda hasta pi medios en el '
        + 'derecho, con tangente vertical en los dos extremos. Fuera de la banda no hay curva, '
        + 'porque ahí dos x se sale del intervalo de menos uno a uno y el arcoseno no está '
        + 'definido. Dos líneas de puntos verticales marcan los bordes.',
    });
    l.poli([[-0.5, -2.1], [0.5, -2.1], [0.5, 2.1], [-0.5, 2.1]], { clase: 'f', cerrar: true });
    l.ejes({
      nombreX: 'x', nombreY: 'y',
      marcasX: [[-0.5, '−½'], [0.5, '½'], [-1, '−1'], [1, '1']],
      marcasY: [[P / 2, 'π/2'], [-P / 2, '−π/2']],
    });
    l.poli([[-0.5, -2.1], [-0.5, 2.1]], { clase: 'g' });
    l.poli([[0.5, -2.1], [0.5, 2.1]], { clase: 'g' });
    l.curva((x) => Math.asin(2 * x), [-0.4995, 0.4995], { clase: 'c', n: 140 });
    l.esquina(10, 17, 'el dominio es [−½, ½]');
    l.rotulo(1.05, 0.5, '|2x| ≤ 1', { dx: 0, dy: 0, anclaje: 'middle', color: 'var(--alt)', pequeno: true });
    return l.svg();
  });

/* ── 2 · una inversa, y el signo que hay que elegir ──────────────────── */

fig('ej-inversa-con-signo',
  'La parábola entera no tiene inversa porque cada altura la alcanza dos veces. Restringida a x ≤ 0 sí: se queda solo la rama izquierda, y su reflejo en y = x es la raíz con signo menos, no la positiva. La rama descartada va a trazos para que se vea qué se ha tirado.',
  () => {
    const l = lienzo({
      id: 'f-ej-inversa-signo',
      ancho: 320, alto: 280,
      x: [-2.6, 3.4], y: [-2.6, 3.4], cuadrado: true,
      titulo: 'La parábola restringida a las x negativas y su inversa, la raíz con signo menos',
      desc: 'Una parábola con el vértice en el origen. Su rama izquierda, la de las x negativas, '
        + 'está dibujada con trazo grueso; la derecha, a trazos, porque el enunciado la deja '
        + 'fuera. La recta y igual a x cruza el dibujo en diagonal. Reflejando la rama gruesa en '
        + 'esa recta aparece otra curva, en otro color, que sale del origen hacia la derecha y '
        + 'hacia abajo: es la inversa, la raíz de x cambiada de signo, y está definida solo para '
        + 'x mayor o igual que cero.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2], marcasY: [1, 2] });
    l.curva((x) => x, [-2.55, 3.35], { clase: 'g', n: 2 });
    l.curva((x) => x * x, [0, 1.82], { clase: 'fue', n: 60 });
    l.curva((x) => x * x, [-1.82, 0], { clase: 'c', n: 60 });
    l.poli(Array.from({ length: 61 }, (_, k) => {
      const t = (1.82 * k) / 60;
      return [t * t, -t];
    }), { clase: 'c2' });
    l.rotulo(-1.5, 2.25, 'se queda', { dx: -6, dy: 4, anclaje: 'end' });
    l.rotulo(1.5, 2.25, 'se descarta', { dx: 6, dy: 4, color: 'var(--faint)', pequeno: true });
    l.rotulo(2.6, -1.61, 'f⁻¹(x) = −√x', { dx: 4, dy: 12, anclaje: 'end', color: 'var(--alt)' });
    return l.svg();
  });

/* ── 3 · un parámetro que pega dos trozos ───────────────────────────── */

fig('ej-continuidad-parametro',
  'A la izquierda, con k mal elegido, los dos trozos llegan a alturas distintas y queda un escalón. A la derecha, con k = 2, llegan a la misma y la curva pasa de largo. Continuidad en un punto de empalme es exactamente eso: que las dos alturas coincidan.',
  () => {
    const l = lienzo({
      id: 'f-ej-continuidad-parametro',
      ancho: 335, alto: 250,
      x: [-0.6, 3.4], y: [-1.2, 6.4], cuadrado: false,
      titulo: 'Los dos trozos con el escalón que deja un k equivocado y sin él cuando k vale dos',
      desc: 'A la izquierda del valor dos la función es la recta x más k, y a la derecha la '
        + 'parábola x al cuadrado, que en ese punto vale cuatro. Se dibujan dos rectas: una con '
        + 'un k equivocado, que llega a una altura menor y deja un escalón visible marcado con '
        + 'un círculo hueco y una flecha, y otra con k igual a dos, que llega exactamente a '
        + 'cuatro y empalma con la parábola sin salto. Una línea vertical de puntos marca el '
        + 'punto de empalme.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2, 3], marcasY: [2, 4] });
    l.poli([[2, -1.2], [2, 6.4]], { clase: 'g' });
    l.curva((x) => x * x, [2, 2.5], { clase: 'c', n: 40 });
    l.curva((x) => x + 2, [-0.5, 2], { clase: 'c', n: 2 });
    l.curva((x) => x + 0.4, [-0.5, 2], { clase: 'fue', n: 2 });
    l.flecha([2, 2.4], [2, 3.75], { clase: 'cp2', color: 'var(--alt)', punta: 6 });
    l.punto(2, 2.4, { clase: 'hueco', r: 4.4 });
    l.punto(2, 4, { clase: 'o', r: 4.6 });
    l.rotulo(0.5, 2.5, 'x + 2', { dx: -5, dy: -6, anclaje: 'end' });
    l.rotulo(0.5, 0.9, 'un k pequeño', { dx: -5, dy: 12, anclaje: 'end', color: 'var(--faint)', pequeno: true });
    l.rotulo(2, 3.1, 'escalón', { dx: 7, dy: 4, color: 'var(--alt)' });
    l.rotulo(2.4, 5.76, 'x²', { dx: 6, dy: 2 });
    return l.svg();
  });

/* ── 4 · Bolzano, y por qué la raíz existe ───────────────────────────── */

fig('ej-bolzano-una-raiz',
  'La función entra por debajo del eje en x = 0 y sale por encima en x = 1. Siendo continua, no hay manera de pasar de un lado al otro sin cruzarlo: eso es Bolzano, y es todo lo que hace falta para afirmar que la solución existe sin calcularla.',
  () => {
    const f = (x) => x ** 3 + x - 1;
    const l = lienzo({
      id: 'f-ej-bolzano-raiz',
      ancho: 320, alto: 250,
      x: [-0.35, 1.35], y: [-1.5, 1.5], cuadrado: false,
      titulo: 'La cúbica x al cubo más x menos uno cruzando el eje entre cero y uno',
      desc: 'La curva sube de izquierda a derecha. En x igual a cero vale menos uno, claramente '
        + 'por debajo del eje horizontal, y en x igual a uno vale uno, por encima. Entre los dos '
        + 'cruza el eje una vez, en un punto cercano a cero coma sesenta y ocho, marcado con un '
        + 'círculo. Dos bandas sombreadas, una por debajo del eje a la izquierda y otra por '
        + 'encima a la derecha, recuerdan que la función empieza en una y acaba en la otra, y '
        + 'que para pasar de una a otra sin despegarse tiene que tocar el eje.',
    });
    l.poli([[0, -1.5], [0, 0], [0.6823, 0], [0.6823, -1.5]], { clase: 'f', cerrar: true });
    l.poli([[0.6823, 0], [1, 0], [1, 1.5], [0.6823, 1.5]], { clase: 'f2', cerrar: true });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1], marcasY: [[1, '1'], [-1, '−1']] });
    l.curva(f, [-0.3, 1.16], { clase: 'c', n: 110 });
    l.punto(0, -1, { r: 4 });
    l.punto(1, 1, { r: 4 });
    l.punto(0.6823, 0, { clase: 'o', r: 4.8 });
    l.rotulo(0, -1, 'f(0) = −1', { dx: 8, dy: 14 });
    l.rotulo(1, 1, 'f(1) = 1', { dx: -7, dy: 4, anclaje: 'end' });
    l.rotulo(0.6823, 0, 'la raíz', { dx: 0, dy: 18, anclaje: 'middle', color: 'var(--flag)' });
    return l.svg();
  });

/* ── 5 · una derivada que hay que calcular como límite ───────────────── */

fig('ej-derivada-por-definicion-en-un-pico',
  'En el pico, las secantes por la derecha tienen pendiente 1 y las de la izquierda, −1, siempre, por cerca que se tomen. Los dos límites laterales existen y no coinciden, y por eso no hay derivada: no hay una sola recta que valga como tangente.',
  () => {
    const l = lienzo({
      id: 'f-ej-pico-valor-absoluto',
      ancho: 320, alto: 230,
      x: [-2.2, 2.2], y: [-0.85, 2.3], cuadrado: false,
      titulo: 'El valor absoluto y las dos pendientes distintas que llegan al pico',
      desc: 'La gráfica del valor absoluto tiene forma de uve con el vértice en el origen. A la '
        + 'derecha del vértice el trazo sube con pendiente uno; a la izquierda baja con '
        + 'pendiente menos uno. Sobre cada rama hay una flecha y un rótulo con su pendiente. En '
        + 'el vértice hay un círculo marcado y la nota de que ahí hay dos pendientes distintas, '
        + 'de modo que no existe una única tangente.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-1, 1], marcasY: [1, 2] });
    l.poli([[-2.1, 2.1], [0, 0], [2.1, 2.1]], { clase: 'c' });
    l.flecha([-1.5, 1.5], [-0.75, 0.75], { clase: 'cp2', color: 'var(--alt)', punta: 6 });
    l.flecha([0.75, 0.75], [1.5, 1.5], { clase: 'cp2', color: 'var(--alt)', punta: 6 });
    l.punto(0, 0, { clase: 'o', r: 5 });
    l.rotulo(-1.5, 1.5, 'pendiente −1', { dx: 6, dy: -6 });
    l.rotulo(1.5, 1.5, 'pendiente +1', { dx: -6, dy: -6, anclaje: 'end' });
    l.rotulo(0, 0, 'aquí, las dos', { dx: 0, dy: 18, anclaje: 'middle', color: 'var(--flag)' });
    return l.svg();
  });

/* ── 6 · dos magnitudes que cambian a la vez ─────────────────────────── */

fig('ej-velocidades-relacionadas',
  'Lo que crece el área al crecer el lado es la corona en forma de escuadra: dos tiras de 5×Δl más el cuadradito de la esquina. Cuando Δl se hace pequeño el cuadradito es despreciable y quedan las dos tiras: de ahí sale dA/dt = 2l·dl/dt = 20.',
  () => {
    const L = 5, d = 1.1;
    const l = lienzo({
      id: 'f-ej-velocidades-relacionadas',
      ancho: 300, alto: 270,
      x: [-1.2, 7.4], y: [-1.2, 7.4], cuadrado: true,
      titulo: 'El cuadrado de lado cinco y la escuadra que se le añade al crecer el lado',
      desc: 'Un cuadrado de lado cinco, sombreado, con el vértice inferior izquierdo en el '
        + 'origen. Alrededor de él, por arriba y por la derecha, se añade una franja en forma de '
        + 'escuadra que corresponde al crecimiento del lado: dos tiras rectangulares largas y '
        + 'estrechas, cada una de cinco por el incremento, más un cuadradito pequeño en la '
        + 'esquina superior derecha donde las dos se encuentran. Las dos tiras están sombreadas '
        + 'con un tono y el cuadradito de la esquina con otro más claro, porque es el término '
        + 'que se desprecia al hacer el incremento pequeño.',
    });
    l.poli([[0, 0], [L, 0], [L, L], [0, L]], { clase: 'f', cerrar: true });
    l.poli([[L, 0], [L + d, 0], [L + d, L], [L, L]], { clase: 'f2', cerrar: true });
    l.poli([[0, L], [L, L], [L, L + d], [0, L + d]], { clase: 'f2', cerrar: true });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [[L, '5']], marcasY: [[L, '5']] });
    l.poli([[0, 0], [L + d, 0], [L + d, L + d], [0, L + d]], { clase: 'c2', cerrar: true });
    l.poli([[0, 0], [L, 0], [L, L], [0, L]], { clase: 'c', cerrar: true });
    l.poli([[L, L], [L + d, L], [L + d, L + d], [L, L + d]], { clase: 'g', cerrar: true });
    l.rotulo(2.5, 2.5, 'A = l²', { dx: 0, dy: 4, anclaje: 'middle' });
    l.rotulo(L + d / 2, 2.4, '5·Δl', { dx: 0, dy: 4, anclaje: 'middle', pequeno: true });
    l.rotulo(2.4, L + d / 2, '5·Δl', { dx: 0, dy: 4, anclaje: 'middle', pequeno: true });
    l.rotulo(L + d, L + d, 'Δl² : se desprecia', { dx: 4, dy: -7, anclaje: 'end', color: 'var(--faint)', pequeno: true });
    return l.svg();
  });

/* ── 7 · aproximar una raíz, y elegir dónde apoyarse ─────────────────── */

fig('ej-diferencial-el-punto-de-apoyo',
  'El punto de apoyo no es el que se busca: es el cuadrado perfecto más cercano, 49, porque ahí la raíz se sabe de memoria. Desde él se avanza por la tangente los 3 que faltan, y el error es el huequito entre la recta y la curva — aquí, dos centésimas.',
  () => {
    const l = lienzo({
      id: 'f-ej-diferencial-apoyo',
      ancho: 335, alto: 235,
      x: [44, 58], y: [6.5, 7.75], cuadrado: false, margen: 44,
      titulo: 'La raíz cuadrada cerca de cuarenta y nueve, con la tangente que aproxima la raíz de cincuenta y dos',
      desc: 'Un acercamiento a la curva de la raíz cuadrada entre cuarenta y cuatro y cincuenta '
        + 'y ocho; la curva sube muy despacio. En x igual a cuarenta y nueve está marcado el '
        + 'punto de apoyo, a la altura siete exacta, y desde él sale la recta tangente, que '
        + 'sube casi igual que la curva pero un poco por encima. En x igual a cincuenta y dos, '
        + 'una línea vertical de puntos corta a las dos: la recta da siete coma doscientos '
        + 'catorce y la curva, siete coma doscientos once. El hueco entre las dos es el error, '
        + 'tan pequeño que apenas se aprecia. Las dos rectas de los bordes son el marco con su '
        + 'escala, no los ejes: el origen queda muy lejos de este recorte.',
    });
    l.ejes({
      nombreX: 'x', nombreY: '√x', enX: 6.5, enY: 44,
      marcasX: [[49, '49'], [52, '52']], marcasY: [[7, '7'], [7.5, '7,5']],
    });
    l.curva(Math.sqrt, [44, 58], { clase: 'c', n: 90 });
    l.curva((x) => 7 + (x - 49) / 14, [44, 58], { clase: 'c2', n: 2 });
    l.poli([[52, 6.5], [52, 7 + 3 / 14]], { clase: 'g' });
    l.punto(49, 7, { r: 4.2 });
    l.punto(52, 7 + 3 / 14, { clase: 'o', r: 4.4 });
    l.rotulo(49, 7, 'apoyo: √49 = 7', { dx: 0, dy: 17, anclaje: 'middle' });
    l.rotulo(52, 7 + 3 / 14, '≈ 7,214', { dx: 6, dy: -5, color: 'var(--flag)' });
    l.esquina(12, 17, 'error: 3 milésimas', { color: 'var(--alt)' });
    return l.svg();
  });

/* ── a pegar ─────────────────────────────────────────────────────────── */
for (const f of figuras) f.svg = f.hacer();

if (process.argv[1]?.endsWith('calculo-ejemplos-t03.mjs')) {
  for (const f of figuras) pegaEnCampo(f.fichero, f.id, f.campo, f.svg, f.pie);
  console.log(`${figuras.length} figuras de ejemplo pegadas en ${FICHERO}`);
}
