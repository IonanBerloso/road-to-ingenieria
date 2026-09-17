/**
 * Las figuras de las prácticas del tema 10 que hablan del tiempo.
 *
 * Laplace parece un tema sin dibujos porque casi todo ocurre en la variable s,
 * que no se dibuja. Pero el lado del tiempo sí, y es donde están los errores:
 * una función que arranca tarde, una periódica de la que hay que coger un
 * periodo, un escalón que desplaza toda la respuesta. Uno de los ejercicios
 * del boletín, de hecho, **pide dibujar** —«Dibujar la función periódica de
 * periodo 2π…»— y no tenía dibujo.
 *
 *     node scripts/figuras/calculo-practica-t10.mjs
 */

import { lienzo, mosaico } from './lienzo.mjs';
import { pegaEnCampo } from './pegar.mjs';

export const FICHERO = 'src/content/calculo/t10-laplace/ejercicios.yaml';

export const figuras = [];
const fig = (id, pie, hacer) =>
  figuras.push({ fichero: FICHERO, id, campo: 'resolucion', pie, hacer });

const P = Math.PI;

/** Una función a trozos muestreada, cortando el trazo en cada salto. */
const aTrozos = (l, f, a, b, saltos, clase = 'c', n = 400) => {
  const cortes = [a, ...saltos, b];
  for (let k = 0; k < cortes.length - 1; k++) {
    const [u, v] = [cortes[k], cortes[k + 1]];
    const m = Math.max(2, Math.round((n * (v - u)) / (b - a)));
    const p = [];
    for (let i = 0; i <= m; i++) {
      const t = u + 1e-6 + ((v - u - 2e-6) * i) / m;
      p.push([t, f(t)]);
    }
    l.poli(p, { clase });
  }
};

/* ── 1 · la media onda de seno ───────────────────────────────────────── */

fig('la-media-onda-de-seno',
  'El enunciado pide dibujarla, y aquí está: una joroba de seno y luego un tramo plano, repitiéndose cada 2π. Para transformarla solo hace falta el primer periodo —de 0 a 2π— porque la fórmula de las periódicas divide por 1 − e^{−sT} y eso ya suma todas las copias.',
  () => {
    const f = (t) => { const u = ((t % (2 * P)) + 2 * P) % (2 * P); return u < P ? Math.sin(u) : 0; };
    const l = lienzo({
      id: 'f-media-onda-seno',
      ancho: 340, alto: 205,
      x: [-0.8, 13.6], y: [-0.5, 1.5], cuadrado: false,
      titulo: 'La media onda de seno: una joroba y un tramo llano, repitiéndose',
      desc: 'La curva sube desde el origen formando una joroba de seno que alcanza la altura uno '
        + 'y vuelve a bajar hasta cero en pi. Desde ahí hasta dos pi se queda pegada al eje, '
        + 'valiendo cero. A partir de dos pi vuelve a empezar igual, y otra vez a partir de '
        + 'cuatro pi. Una banda sombreada cubre el primer periodo, de cero a dos pi, que es el '
        + 'único tramo que hace falta para calcular la transformada.',
    });
    l.poli([[0, -0.5], [2 * P, -0.5], [2 * P, 1.5], [0, 1.5]], { clase: 'f', cerrar: true });
    l.ejes({
      nombreX: 't', nombreY: 'f(t)',
      marcasX: [[P, 'π'], [2 * P, '2π'], [3 * P, '3π'], [4 * P, '4π']], marcasY: [1],
    });
    /* El dibujo se corta a media tercera joroba y eso está bien: lo que tiene
       que quedar claro es que sigue, no cuántas copias caben. */
    const fin = 13.5;
    for (const k of [0, 1, 2]) {
      const d = 2 * P * k;
      if (d >= fin) break;
      l.curva((t) => Math.sin(t - d), [d, Math.min(d + P, fin)], { clase: 'c', n: 60 });
      if (d + P < fin) l.poli([[d + P, 0], [Math.min(d + 2 * P, fin), 0]], { clase: 'c' });
    }
    l.poli([[2 * P, -0.5], [2 * P, 1.5]], { clase: 'g' });
    l.esquina(10, 17, 'basta con el primer periodo');
    return l.svg();
  });

/* ── 2 · onda cuadrada y diente de sierra ────────────────────────────── */

fig('onda-cuadrada-y-diente-de-sierra',
  'Las dos periódicas de siempre, cada una con su periodo sombreado. La cuadrada salta entre +1 y −1 cada unidad; el diente de sierra sube en rampa y cae a plomo al llegar a 1. Ese salto vertical es discontinuidad, no un error de dibujo.',
  () => {
    const celda = (etiqueta, T, dibuja, y) => ({
      etiqueta,
      x: [-0.4, 4.6], y, cuadrado: false,
      dibuja: (l) => {
        l.poli([[0, y[0]], [T, y[0]], [T, y[1]], [0, y[1]]], { clase: 'f', cerrar: true });
        l.ejes({ nombreX: 't', nombreY: 'f(t)', marcasX: [1, 2, 3, 4], marcasY: [1] });
        dibuja(l);
      },
    });
    return mosaico({
      id: 'f-cuadrada-y-sierra',
      columnas: 2,
      ancho: 210,
      alto: 168,
      titulo: 'La onda cuadrada y el diente de sierra, con su periodo marcado',
      desc: 'Dos recuadros. En el primero, una señal que vale uno durante una unidad de tiempo, '
        + 'salta a menos uno durante la siguiente y vuelve a empezar: los saltos son verticales '
        + 'y están dibujados con trazo fino. Su periodo, de cero a dos, está sombreado. En el '
        + 'segundo, una rampa que sube desde cero hasta uno en una unidad de tiempo y cae de '
        + 'golpe al cero para volver a subir: su periodo, de cero a uno, también está sombreado.',
      celdas: [
        celda('(a) cuadrada, T = 2', 2, (l) => {
          for (let k = 0; k < 5; k++) {
            const v = k % 2 === 0 ? 1 : -1;
            l.poli([[k, v], [k + 1, v]], { clase: 'c' });
            if (k < 4) l.poli([[k + 1, v], [k + 1, -v]], { clase: 'g' });
          }
        }, [-1.6, 1.6]),
        celda('(b) sierra, T = 1', 1, (l) => {
          for (let k = 0; k < 5; k++) {
            l.poli([[k, 0], [k + 1, 1]], { clase: 'c' });
            if (k < 4) l.poli([[k + 1, 1], [k + 1, 0]], { clase: 'g' });
          }
        }, [-0.5, 1.6]),
      ],
    });
  });

/* ── 3 · una función que arranca tarde ───────────────────────────────── */

fig('la-transformada-de-una-funcion-que-arranca-tarde',
  'Es un coseno normal, pero empujado 2π/3 a la derecha y con cero a la izquierda. Ese empujón es lo único que separa su transformada de la del coseno de toda la vida: un factor e^{−2πs/3} delante, y nada más.',
  () => {
    const a = (2 * P) / 3;
    const l = lienzo({
      id: 'f-arranca-tarde',
      ancho: 340, alto: 215,
      x: [-0.7, 11.5], y: [-1.5, 1.5], cuadrado: false,
      titulo: 'El coseno desplazado, plano antes de dos tercios de pi',
      desc: 'Hasta el instante dos pi tercios, algo más de dos, la función vale cero y se dibuja '
        + 'como un tramo recto sobre el eje. Justo en ese instante arranca de golpe en el valor '
        + 'uno y sigue como un coseno normal, oscilando entre uno y menos uno. Con trazo fino se '
        + 'dibuja también el coseno sin desplazar, que arranca en cero, para que se vea que son '
        + 'la misma curva corrida.',
    });
    l.ejes({ nombreX: 't', nombreY: 'f(t)', marcasX: [[a, '2π/3'], [2 * P, '2π'], [3 * P, '3π']], marcasY: [1] });
    l.curva(Math.cos, [-0.65, 11.4], { clase: 'fue', n: 200 });
    l.poli([[-0.65, 0], [a, 0]], { clase: 'c' });
    l.curva((t) => Math.cos(t - a), [a, 11.4], { clase: 'c', n: 200 });
    l.poli([[a, 0], [a, 1]], { clase: 'g' });
    l.punto(a, 1, { clase: 'o', r: 4.2 });
    l.rotulo(a, 1, 'arranca aquí', { dx: 7, dy: -4, color: 'var(--flag)' });
    l.rotulo(0, 1, 'cos t', { dx: 6, dy: -6, color: 'var(--faint)', pequeno: true });
    return l.svg();
  });

/* ── 4 · un retraso escondido en una exponencial ─────────────────────── */

fig('retraso-en-el-tiempo',
  'El e^{−2s} del numerador no es parte de la fracción: es el retraso. Se aparta, se invierte lo que queda —2e^{t}cos t— y al final se desplaza todo dos unidades y se pone a cero antes. El dibujo hace visible lo que el factor exponencial quiere decir.',
  () => {
    const g = (t) => 2 * Math.exp(t) * Math.cos(t);
    const l = lienzo({
      id: 'f-retraso-tiempo',
      ancho: 340, alto: 235,
      x: [-0.6, 6.2], y: [-24, 24], cuadrado: false,
      titulo: 'La función sin retrasar y la misma desplazada dos unidades, plana antes',
      desc: 'Con trazo fino, una onda que crece rápidamente en amplitud a medida que avanza: es '
        + 'dos por e elevado a t por el coseno de t. Con trazo grueso, la misma onda pero '
        + 'corrida dos unidades hacia la derecha y con el tramo anterior pegado al eje, valiendo '
        + 'cero. Una línea vertical de puntos marca el instante dos, donde la segunda arranca. '
        + 'Las dos curvas tienen exactamente la misma forma; lo único que las separa es el '
        + 'desplazamiento.',
    });
    l.ejes({ nombreX: 't', nombreY: 'f(t)', marcasX: [2, 4, 6], marcasY: [[20, '20'], [-20, '−20']] });
    const recorta = (f, a, b) => {
      const p = [];
      for (let i = 0; i <= 260; i++) {
        const t = a + ((b - a) * i) / 260;
        const v = f(t);
        if (v > 23 || v < -23) { if (p.length) break; continue; }
        p.push([t, v]);
      }
      return p;
    };
    l.poli(recorta(g, -0.55, 6.15), { clase: 'fue' });
    l.poli([[-0.55, 0], [2, 0]], { clase: 'c' });
    l.poli(recorta((t) => g(t - 2), 2, 6.15), { clase: 'c' });
    l.poli([[2, -24], [2, 24]], { clase: 'g' });
    l.rotulo(2, -20, 'aquí arranca', { dx: 6, dy: 4, color: 'var(--alt)' });
    return l.svg();
  });

/* ── 5 · cuatro a trozos, integrando tramo a tramo ───────────────────── */

fig('cuatro-a-trozos-por-definicion',
  'Integrar por definición una función a trozos es partir la integral en los mismos trozos, ni uno más. El dibujo dice dónde están los cortes, que es lo único que hay que sacar del enunciado antes de ponerse a integrar.',
  () => {
    const celda = (etiqueta, dibuja, x, y, marcaX, marcaY) => ({
      etiqueta, x, y, cuadrado: false,
      dibuja: (l) => {
        l.ejes({ nombreX: 't', nombreY: 'f(t)', marcasX: marcaX, marcasY: marcaY });
        dibuja(l);
      },
    });
    return mosaico({
      id: 'f-cuatro-a-trozos',
      columnas: 2,
      ancho: 210,
      alto: 160,
      titulo: 'Dos de las funciones a trozos del ejercicio, con sus puntos de corte',
      desc: 'Dos recuadros. En el primero, la función vale uno constante desde cero hasta uno y '
        + 'a partir de ahí salta a la exponencial, que se dispara hacia arriba; el salto está '
        + 'marcado con un círculo hueco abajo y uno lleno arriba. En el segundo, una función '
        + 'que sube en línea recta hasta el instante dos y a partir de ahí se queda constante; '
        + 'ahí no hay salto, solo un cambio de pendiente.',
      celdas: [
        celda('(a) 1, luego eᵗ', (l) => {
          l.poli([[0, 1], [1, 1]], { clase: 'c' });
          l.curva(Math.exp, [1, 2.4], { clase: 'c', n: 60 });
          l.punto(1, 1, { clase: 'hueco', r: 4 });
          l.punto(1, Math.E, { clase: 'o', r: 4 });
        }, [-0.4, 2.8], [-1.5, 12], [1, 2], [1, 5, 10]),
        celda('(c) rampa y meseta', (l) => {
          l.poli([[0, 0], [2, 2]], { clase: 'c' });
          l.poli([[2, 2], [4.4, 2]], { clase: 'c' });
          l.punto(2, 2, { clase: 'o', r: 4 });
        }, [-0.6, 4.8], [-0.8, 3.2], [2, 4], [2]),
      ],
    });
  });

/* ── 6 · una inversa por tres caminos, y un retraso ──────────────────── */

fig('una-inversa-por-tres-caminos-y-un-retraso',
  'La inversa de 1/(s+1)² es t·e^{−t}, que sube, hace un máximo en t = 1 y se apaga. La del apartado con e^{−s} es la misma idea aplicada al seno hiperbólico: la función sale desplazada una unidad y vale cero antes.',
  () => {
    const celda = (etiqueta, f, x, y, dom, dibuja) => ({
      etiqueta, x, y, cuadrado: false,
      dibuja: (l) => {
        l.ejes({ nombreX: 't', nombreY: 'f(t)', marcasX: [1, 2, 3].filter((v) => v < x[1] - 0.2) });
        l.curva(f, dom ?? x, { clase: 'c', n: 120 });
        if (dibuja) dibuja(l);
      },
    });
    return mosaico({
      id: 'f-inversa-tres-caminos',
      columnas: 2,
      ancho: 210,
      alto: 168,
      titulo: 'La inversa de uno partido por s más uno al cuadrado, y la versión retrasada',
      desc: 'Dos recuadros. En el primero, una curva que sale del origen, sube hasta un máximo '
        + 'en el instante uno y luego baja acercándose al eje sin llegar a tocarlo. En el '
        + 'segundo, una función que vale cero hasta el instante uno y a partir de ahí crece cada '
        + 'vez más deprisa, como un seno hiperbólico que arrancase con un retraso de una unidad. '
        + 'Una línea vertical de puntos marca ese arranque.',
      celdas: [
        celda('t·e⁻ᵗ', (t) => t * Math.exp(-t), [-0.4, 4.8], [-0.12, 0.48], [0, 4.75], (l) => {
          l.punto(1, Math.exp(-1), { clase: 'o', r: 4 });
          l.rotulo(1, Math.exp(-1), 'máximo', { dx: 6, dy: -5, color: 'var(--flag)', pequeno: true });
        }),
        celda('retrasada una unidad', (t) => (t < 1 ? 0 : 2 * Math.sinh(t - 1)), [-0.4, 3.4], [-1, 9], [-0.35, 3.2], (l) => {
          l.poli([[1, -1], [1, 9]], { clase: 'g' });
        }),
      ],
    });
  });

/* ── 7 · un circuito RLC, y la fuente que llega tarde ────────────────── */

fig('el-circuito-rlc-y-la-fuente-que-llega-tarde',
  'Las dos respuestas son idénticas; la segunda es la primera copiada dos segundos más tarde. Eso es lo que hace un escalón θ(t−2): no cambia la física del circuito, solo retrasa el momento en que empieza a pasar. La carga final es 0,75 C en los dos casos.',
  () => {
    const q = (t) => 0.75 - 0.75 * Math.exp(-10 * t) * (Math.cos(10 * t) + Math.sin(10 * t));
    const l = lienzo({
      id: 'f-rlc-retrasado',
      ancho: 340, alto: 235,
      x: [-0.25, 3.2], y: [-0.16, 1.02], cuadrado: false,
      titulo: 'La carga del condensador con la fuente inmediata y con la fuente retrasada dos segundos',
      desc: 'Dos curvas con exactamente la misma forma. La primera arranca en el instante cero, '
        + 'sube deprisa con una pequeña ondulación y se estabiliza en la altura cero coma '
        + 'setenta y cinco. La segunda está pegada al eje hasta el instante dos y a partir de '
        + 'ahí repite el mismo arranque, estabilizándose también en cero coma setenta y cinco '
        + 'pero dos segundos más tarde. Una línea horizontal de puntos marca ese valor final.',
    });
    l.ejes({ nombreX: 't (s)', nombreY: 'q (C)', marcasX: [1, 2, 3], marcasY: [[0.75, '0,75']] });
    l.poli([[-0.25, 0.75], [3.2, 0.75]], { clase: 'cp2' });
    l.curva(q, [0, 3.15], { clase: 'c', n: 220 });
    l.poli([[-0.2, 0], [2, 0]], { clase: 'c2' });
    l.curva((t) => q(t - 2), [2, 3.15], { clase: 'c2', n: 120 });
    l.poli([[2, -0.16], [2, 1.02]], { clase: 'g' });
    l.rotulo(0.9, 0.86, 'e(t) = 150 V', { dx: 0, dy: 0, anclaje: 'middle' });
    l.rotulo(2.9, 0.86, 'con θ(t−2)', { dx: 0, dy: 0, anclaje: 'end', color: 'var(--alt)' });
    return l.svg();
  });

/* ── a pegar ─────────────────────────────────────────────────────────── */
for (const f of figuras) f.svg = f.hacer();

if (process.argv[1]?.endsWith('calculo-practica-t10.mjs')) {
  for (const f of figuras) pegaEnCampo(f.fichero, f.id, f.campo, f.svg, f.pie);
  console.log(`${figuras.length} figuras de práctica pegadas en ${FICHERO}`);
}
