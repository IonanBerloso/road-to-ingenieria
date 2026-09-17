/**
 * Las figuras de las prácticas del tema 11: series de Fourier.
 *
 * En este tema **la gráfica es el enunciado**. Casi todas las preguntas —a qué
 * converge la serie en un punto, qué coeficientes se anulan, cómo se reduce un
 * argumento enorme— se contestan mirando el dibujo de la función periódica, y
 * sin él hay que reconstruirlo mentalmente antes de empezar.
 *
 *     node scripts/figuras/calculo-practica-t11.mjs
 */

import { lienzo, mosaico } from './lienzo.mjs';
import { pegaEnCampo } from './pegar.mjs';

export const FICHERO = 'src/content/calculo/t11-fourier/ejercicios.yaml';
const P = Math.PI;

export const figuras = [];
const fig = (id, pie, hacer) => figuras.push({ fichero: FICHERO, id, campo: 'resolucion', pie, hacer });

/**
 * Una función periódica dibujada sobre varios periodos.
 *
 * `tramo` devuelve el valor dentro del periodo básico `[0,T)`, y aquí se
 * repite tantas veces como quepa. Los saltos se marcan con una vertical a
 * trazos y un punto en su altura media, que es a lo que converge la serie.
 */
const periodica = ({
  id, titulo, desc, T, tramo, x, y, ancho = 380, alto = 195,
  marcasX = [], marcasY = [], nombreX = 't', nombreY = 'f', saltos = [], n = 60, medios = true,
}) => {
  const l = lienzo({ id, ancho, alto, x, y, titulo, desc });
  l.ejes({ nombreX, nombreY, marcasX, marcasY });
  const k0 = Math.floor(x[0] / T);
  const k1 = Math.ceil(x[1] / T);
  for (let k = k0; k <= k1; k++) {
    const a = k * T;
    const puntos = [];
    for (let j = 0; j <= n; j++) {
      const u = (T * j) / n;
      const t = a + u;
      if (t < x[0] + 0.02 || t > x[1] - 0.02) continue;
      puntos.push([t, tramo(Math.min(Math.max(u, 1e-6), T - 1e-6))]);
    }
    if (puntos.length > 1) l.poli(puntos, { clase: 'c' });
  }
  /* Los saltos: la vertical y, si se pide, el punto de convergencia. */
  for (let k = k0; k <= k1; k++) {
    for (const [u, abajo, arriba] of saltos) {
      const t = k * T + u;
      if (t < x[0] + 0.02 || t > x[1] - 0.02) continue;
      l.poli([[t, abajo], [t, arriba]], { clase: 'g' });
      if (medios) l.punto(t, (abajo + arriba) / 2, { clase: 'o', r: 3.8 });
    }
  }
  return l;
};

/* ── 1 · Dirichlet en cinco puntos ───────────────────────────────────── */
fig('dirichlet-en-cinco-puntos',
  'El diente de sierra de periodo 2. En los enteros impares hay salto y la serie vale 0; en el resto, S y f coinciden.',
  () => {
    const l = periodica({
      id: 'f-pr-dirichlet5',
      T: 2, tramo: (u) => (u < 1 ? u : u - 2),
      x: [-2.6, 4.6], y: [-1.9, 1.9],
      marcasX: [-2, -1, 1, 2, 3, 4], marcasY: [1, -1],
      saltos: [[1, -1, 1]],
      titulo: 'El diente de sierra de f(t)=t con periodo dos',
      desc: 'Rampas de pendiente uno que suben de menos uno a uno y caen de golpe en los enteros '
        + 'impares. En cada salto, un punto a altura cero: es lo que vale la serie allí. En los '
        + 'enteros pares la función es continua y la serie vale lo mismo que ella.',
    });
    l.punto(0, 0, { r: 4 });
    l.punto(0.5, 0.5, { r: 4 });
    l.punto(2, 0, { r: 4 });
    l.punto(3.5, -0.5, { r: 4 });
    l.rotulo(1, 0, 'S(1) = 0', { dx: 7, dy: -6, color: 'var(--flag)' });
    l.rotulo(0.5, 0.5, 'S(0,5) = 0,5', { dx: 6, dy: -6 });
    l.rotulo(3.5, -0.5, 'S(3,5) = −0,5', { dx: -6, dy: 15, anclaje: 'end' });
    return l.svg();
  });

/* ── 2 · la que no tiene saltos ──────────────────────────────────────── */
fig('la-que-no-tiene-saltos',
  'La onda triangular de periodo π: continua en todas partes, así que S(t) = f(t) siempre.',
  () => {
    const l = periodica({
      id: 'f-pr-sin-saltos',
      T: P, tramo: (u) => Math.abs(u < P / 2 ? u : u - P),
      x: [-1.7 * P, 1.7 * P], y: [-0.5, 2.2],
      marcasX: [[-P, '−π'], [-P / 2, '−π/2'], [P / 2, 'π/2'], [P, 'π']],
      marcasY: [[P / 2, 'π/2']],
      n: 2,
      titulo: 'La onda triangular de periodo π, sin ningún salto',
      desc: 'Una onda triangular con valles a altura cero en los múltiplos de pi y picos a altura '
        + 'pi medios en los múltiplos impares de pi medios. No hay ningún salto: la función es '
        + 'continua en todas partes, y por eso la serie coincide con ella en todos los puntos.',
    });
    l.rotulo(P / 2, P / 2, 'pico π/2', { dx: 7, dy: -5, color: 'var(--flag)' });
    l.esquina(14, 18, 'continua: S = f en todo t');
    return l.svg();
  });

/* ── 3 · la ampliación impar de una recta ────────────────────────────── */
fig('ampliacion-impar-de-una-recta',
  'La ampliación impar de 2π − t: en (0,π) baja de 2π a π, y se refleja al otro lado del origen.',
  () => {
    const l = periodica({
      id: 'f-pr-ampliacion-impar',
      T: 2 * P, tramo: (u) => (u < P ? 2 * P - u : -(2 * P - (2 * P - u))),
      x: [-2.6 * P, 2.6 * P], y: [-7.6, 7.6],
      marcasX: [[-2 * P, '−2π'], [-P, '−π'], [P, 'π'], [2 * P, '2π']],
      marcasY: [[2 * P, '2π'], [P, 'π'], [-P, '−π'], [-2 * P, '−2π']],
      n: 2,
      saltos: [[0, -2 * P, 2 * P]],
      titulo: 'La ampliación impar de 2π − t, con sus saltos en los múltiplos de 2π',
      desc: 'En cada intervalo de cero a pi la función baja de dos pi a pi. Al otro lado del '
        + 'origen es su reflejo cambiado de signo: sube de menos pi a menos dos pi. En los '
        + 'múltiplos de dos pi hay un salto de cuatro pi, y en su mitad, a altura cero, está el '
        + 'valor de la serie: por eso S(0) vale cero aunque f no esté definida allí.',
    });
    l.rotulo(0, 0, 'S(0) = 0', { dx: 8, dy: -6, color: 'var(--flag)' });
    l.punto(P / 2, 1.5 * P, { r: 4 });
    l.rotulo(P / 2, 1.5 * P, 'S(π/2) = 3π/2', { dx: 6, dy: -6 });
    return l.svg();
  });

/* ── 4 · el escalón de periodo diez ──────────────────────────────────── */
fig('el-escalon-de-periodo-diez',
  'El escalón de periodo 10: vale 0 y 3 alternándose, y en los saltos la serie vale 1,5, que es la media.',
  () => {
    const l = periodica({
      id: 'f-pr-escalon10',
      T: 10, tramo: (u) => (u < 5 ? 3 : 0),
      x: [-11, 11], y: [-1.2, 4.2],
      marcasX: [-10, -5, 5, 10], marcasY: [[1.5, '1,5'], 3],
      n: 240,
      saltos: [[0, 0, 3], [5, 0, 3]],
      titulo: 'El escalón de periodo diez, con el valor de la serie en los saltos',
      desc: 'Tramos horizontales a altura tres y a altura cero que se alternan cada cinco '
        + 'unidades. En t igual a menos cinco, cero y cinco hay saltos de altura tres, y en cada '
        + 'uno un punto a altura uno coma cinco: eso es lo que vale la serie allí, y lo que hay '
        + 'que poner como valor de f para que converja en todo el intervalo.',
    });
    l.poli([[-10.8, 1.5], [10.8, 1.5]], { clase: 'g' });
    l.rotulo(7.5, 1.5, 'S = 1,5 en los saltos', { dx: 0, dy: -8, anclaje: 'end', color: 'var(--flag)' });
    return l.svg();
  });

/* ── 5 · la parábola en un periodo entero ────────────────────────────── */
fig('la-parabola-en-un-periodo-entero',
  'La parábola t² sobre (0,2π), repetida: ni par ni impar, así que la serie lleva senos, cosenos y término constante.',
  () => {
    const l = periodica({
      id: 'f-pr-parabola-periodo',
      T: 2 * P, tramo: (u) => u * u,
      x: [-2.3 * P, 4.3 * P], y: [-8, 46],
      marcasX: [[2 * P, '2π'], [4 * P, '4π'], [-2 * P, '−2π']],
      marcasY: [[4 * P * P, '4π²']],
      n: 50,
      saltos: [[0, 0, 4 * P * P]],
      titulo: 'La parábola t² sobre un periodo entero, repetida sin ninguna simetría',
      desc: 'En cada periodo la curva sube desde cero hasta cuatro pi al cuadrado, unos treinta y '
        + 'nueve coma cinco, y cae de golpe al empezar el siguiente. El dibujo no es simétrico ni '
        + 'respecto del eje vertical ni respecto del origen: la función no es par ni impar, y por '
        + 'eso su serie tiene término constante, cosenos y senos.',
    });
    l.esquina(14, 18, 'ni par ni impar: a₀, aₙ y bₙ');
    return l.svg();
  });

/* ── 6 · uno de los cuatro desarrollos del boletín ───────────────────── */
fig('cuatro-desarrollos-del-boletin',
  'Los cuatro apartados dibujados: la onda cuadrada, la triangular, el diente de sierra y la rampa con meseta.',
  () =>
    mosaico({
      id: 'f-pr-cuatro-desarrollos',
      titulo: 'Los cuatro desarrollos del boletín, cada uno con su periodo y su simetría',
      desc: 'Cuatro gráficas independientes. La (b) es una onda cuadrada de periodo cuatro entre '
        + 'más y menos ocho, impar. La (c) es una onda triangular de periodo ocho con valles en '
        + 'cero y picos a altura cuatro, par. La (d) es un diente de sierra de periodo diez que '
        + 'sube de cero a cuarenta, sin simetría. Y la (e) es una rampa que sube de cero a seis '
        + 'en la primera mitad del periodo y se queda en cero en la segunda, tampoco simétrica.',
      columnas: 2, ancho: 205, alto: 165,
      celdas: [
        {
          etiqueta: '(b) T = 4 · impar',
          x: [-4.6, 8.6], y: [-11, 11], cuadrado: false,
          dibuja: (l) => {
            l.ejes({ nombreX: 't', nombreY: 'f', marcasX: [2, 4, 8], marcasY: [8, -8] });
            for (const k of [-1, 0, 1]) {
              const a = Math.max(4 * k, -4.5);
              const b = Math.min(4 * k + 2, 8.5);
              if (b > a) l.poli([[a, 8], [b, 8]], { clase: 'c' });
              const c = Math.max(4 * k + 2, -4.5);
              const d = Math.min(4 * k + 4, 8.5);
              if (d > c) l.poli([[c, -8], [d, -8]], { clase: 'c' });
              for (const t of [4 * k, 4 * k + 2]) {
                if (t < -4.5 || t > 8.5) continue;
                l.poli([[t, -8], [t, 8]], { clase: 'g' });
                l.punto(t, 0, { clase: 'o', r: 3.2 });
              }
            }
          },
        },
        {
          etiqueta: '(c) T = 8 · par',
          x: [-9.4, 9.4], y: [-1.5, 5.5], cuadrado: false,
          dibuja: (l) => {
            l.ejes({ nombreX: 't', nombreY: 'f', marcasX: [-4, 4, 8], marcasY: [4] });
            l.poli([[-8.8, 0.8], [-8, 0], [-4, 4], [0, 0], [4, 4], [8, 0], [8.8, 0.8]], { clase: 'c' });
          },
        },
        {
          etiqueta: '(d) T = 10 · sin simetría',
          x: [-11, 21], y: [-8, 48], cuadrado: false,
          dibuja: (l) => {
            l.ejes({ nombreX: 't', nombreY: 'f', marcasX: [10, 20], marcasY: [40] });
            for (const k of [-1, 0, 1]) {
              l.poli([[10 * k + 0.05, 0.2], [10 * k + 9.95, 39.8]], { clase: 'c' });
              l.poli([[10 * k, 0], [10 * k, 40]], { clase: 'g' });
              l.punto(10 * k, 20, { clase: 'o', r: 3.4 });
            }
          },
        },
        {
          etiqueta: '(e) T = 6 · rampa',
          x: [-7, 10], y: [-1.8, 7.6], cuadrado: false,
          dibuja: (l) => {
            l.ejes({ nombreX: 't', nombreY: 'f', marcasX: [-3, 3, 6], marcasY: [6] });
            for (const k of [-1, 0, 1]) {
              l.poli([[Math.max(6 * k - 3, -6.9), 0], [6 * k, 0]], { clase: 'c' });
              l.poli([[6 * k + 0.03, 0.06], [6 * k + 2.97, 5.94]], { clase: 'c' });
              l.poli([[6 * k + 3, 0], [6 * k + 3, 6]], { clase: 'g' });
              l.punto(6 * k + 3, 3, { clase: 'o', r: 3.4 });
            }
          },
        },
      ],
    }));

/* ── 7 · senos y cosenos de la misma recta ───────────────────────────── */
fig('senos-y-cosenos-de-la-misma-recta',
  'La misma recta, ampliada de dos maneras: impar da un diente de sierra con saltos; par, una triangular continua.',
  () =>
    mosaico({
      id: 'f-pr-senos-cosenos',
      titulo: 'La misma recta ampliada en impar y en par, y los saltos que aparecen o no',
      desc: 'A la izquierda, la ampliación impar de f igual a t en el intervalo de cero a dos: un '
        + 'diente de sierra de periodo cuatro que salta cuatro unidades en los pares, con el '
        + 'valor de la serie a mitad del salto. A la derecha, la ampliación par: una onda '
        + 'triangular del mismo periodo, sin ningún salto. La segunda converge más deprisa '
        + 'justamente por eso.',
      columnas: 2, ancho: 205, alto: 170,
      celdas: [
        {
          etiqueta: '(a) impar · senos',
          x: [-4.6, 4.6], y: [-3.2, 3.2], cuadrado: false,
          dibuja: (l) => {
            l.ejes({ nombreX: 't', nombreY: 'f', marcasX: [-2, 2, 4], marcasY: [2, -2] });
            for (const k of [-1, 0, 1]) {
              const a = Math.max(4 * k - 2 + 0.03, -4.5);
              const b = Math.min(4 * k + 2 - 0.03, 4.5);
              if (b > a) l.poli([[a, a - 4 * k], [b, b - 4 * k]], { clase: 'c' });
              if (Math.abs(4 * k + 2) <= 4.5) {
                l.poli([[4 * k + 2, -2], [4 * k + 2, 2]], { clase: 'g' });
                l.punto(4 * k + 2, 0, { clase: 'o', r: 3.6 });
              }
            }
          },
        },
        {
          etiqueta: '(b) par · cosenos',
          x: [-4.6, 4.6], y: [-1, 3.4], cuadrado: false,
          dibuja: (l) => {
            l.ejes({ nombreX: 't', nombreY: 'f', marcasX: [-2, 2, 4], marcasY: [2] });
            l.poli([[-4.5, 1.5], [-4, 2], [-2, 0], [0, 2], [2, 0], [4, 2], [4.5, 1.5]], { clase: 'c' });
          },
        },
      ],
    }));

/* ── 8 · la recta desplazada ─────────────────────────────────────────── */
fig('la-recta-desplazada-en-cinco-puntos',
  'La rampa t+1 de periodo 2: sube de 1 a 3 y salta dos unidades en cada par, donde la serie vale 2.',
  () => {
    const l = periodica({
      id: 'f-pr-recta-desplazada',
      T: 2, tramo: (u) => u + 1,
      x: [-1.6, 5.6], y: [-0.6, 4],
      marcasX: [1, 2, 3, 4, 5], marcasY: [1, 2, 3],
      n: 2,
      saltos: [[0, 1, 3]],
      titulo: 'La rampa t+1 de periodo dos, con el valor de la serie en cada salto',
      desc: 'En cada periodo la recta sube de uno a tres y luego cae de golpe al empezar el '
        + 'siguiente. En los enteros pares hay saltos de dos unidades y en su mitad, a altura '
        + 'dos, está el valor de la serie. En los puntos donde la función es continua —t igual a '
        + 'uno, a tres y medio o a cuatro y medio— la serie vale lo mismo que ella.',
    });
    for (const [t, v] of [[1, 2], [3.5, 2.5], [4.5, 1.5]]) l.punto(t, v, { r: 4 });
    l.rotulo(0, 2, 'S = 2', { dx: 8, dy: -5, color: 'var(--flag)' });
    l.rotulo(3.5, 2.5, 'S(3,5) = 2,5', { dx: 5, dy: -6 });
    return l.svg();
  });

/* ── a pegar ─────────────────────────────────────────────────────────── */
for (const f of figuras) f.svg = f.hacer();

if (process.argv[1]?.endsWith('calculo-practica-t11.mjs')) {
  for (const f of figuras) pegaEnCampo(f.fichero, f.id, f.campo, f.svg, f.pie);
  console.log(`${figuras.length} figuras de práctica pegadas en ${FICHERO}`);
}
