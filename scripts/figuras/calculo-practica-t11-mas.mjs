/**
 * Las cinco prácticas del tema 11 que quedaban sin figura, y las dos del tema
 * 6 que hablan de geometría.
 *
 * Las de Fourier son las que peor se aguantan sin dibujo: un espectro discreto
 * **es** un dibujo —el enunciado dice «trazar el espectro»— y la paridad de
 * una función es una simetría, que es lo más visual que hay. Las dos de varias
 * variables son el gradiente perpendicular al nivel y la retícula polar frente
 * a la cartesiana.
 *
 *     node scripts/figuras/calculo-practica-t11-mas.mjs
 */

import { lienzo, mosaico } from './lienzo.mjs';
import { pegaEnCampo } from './pegar.mjs';

const T = (tema) => `src/content/calculo/${tema}/ejercicios.yaml`;
export const figuras = [];
const fig = (tema, id, pie, hacer) =>
  figuras.push({ fichero: T(tema), id, campo: 'resolucion', pie, hacer });

const P = Math.PI;
const param = (f, a, b, n = 200) =>
  Array.from({ length: n + 1 }, (_, k) => f(a + ((b - a) * k) / n));

/* ── 1 · tres espectros discretos ────────────────────────────────────── */

fig('t11-fourier', 'tres-espectros-discretos',
  'El espectro del apartado (a): una raya por cada frecuencia presente, de altura la amplitud. El seno y el coseno de la misma frecuencia se funden en una sola raya —√(3²+5²) = 5,83 para ω = 3—, y por eso salen seis rayas y no siete términos.',
  () => {
    /* y = 5 − 3cos3t + 5sen3t − cos12t − 3cos18t + 5cos6t − 4cos15t */
    const rayas = [
      [0, 5, '5'], [3, Math.hypot(3, 5), '5,83'], [6, 5, '5'],
      [12, 1, '1'], [15, 4, '4'], [18, 3, '3'],
    ];
    const l = lienzo({
      id: 'f-espectro-discreto',
      ancho: 340, alto: 235,
      x: [-2.5, 21], y: [-1.2, 7.2], cuadrado: false,
      titulo: 'El espectro discreto del apartado a: seis rayas y sus alturas',
      desc: 'Un diagrama de barras verticales sobre el eje de frecuencias. Hay seis barras, en '
        + 'las frecuencias cero, tres, seis, doce, quince y dieciocho. Sus alturas son cinco, '
        + 'cinco coma ochenta y tres, cinco, uno, cuatro y tres respectivamente, y cada una '
        + 'lleva escrito su valor encima y un punto en la punta. Las frecuencias que no aparecen '
        + 'en la función no tienen barra: el espectro es discreto, solo hay raya donde hay '
        + 'término.',
    });
    l.ejes({ nombreX: 'ω', nombreY: 'amplitud', marcasX: [3, 6, 12, 15, 18], marcasY: [5] });
    for (const [w, A, t] of rayas) {
      l.poli([[w, 0], [w, A]], { clase: 'c' });
      l.punto(w, A, { clase: 'o', r: 4 });
      l.rotulo(w, A, t, { dx: w === 0 ? -7 : 0, dy: w === 0 ? 4 : -8, anclaje: w === 0 ? 'end' : 'middle', color: 'var(--flag)', pequeno: true });
    }
    l.esquina(10, 17, 'seno y coseno de ω = 3, en una sola raya');
    return l.svg();
  });

/* ── 2 · nueve funciones, par, impar o ninguna ───────────────────────── */

fig('t11-fourier', 'nueve-funciones-par-impar-o-ninguna',
  'Las tres casillas, dibujadas. Par es simétrica respecto del eje vertical; impar, simétrica respecto del origen —lo que se ve girando media vuelta—; y la tercera casilla, la que casi nadie usa, es la de las que no son ni una cosa ni otra.',
  () => {
    const celda = (etiqueta, f, y, dom, dibuja) => ({
      etiqueta,
      x: [-2.4, 2.4], y, cuadrado: false,
      dibuja: (l) => {
        l.ejes({ nombreX: 't', nombreY: 'f', marcasX: [-1, 1] });
        l.curva(f, dom, { clase: 'c', n: 110 });
        if (dibuja) dibuja(l);
      },
    });
    return mosaico({
      id: 'f-par-impar-ninguna',
      columnas: 3,
      titulo: 'Una función par, una impar y una que no es ninguna de las dos',
      desc: 'Tres recuadros. En el primero, una parábola invertida simétrica respecto del eje '
        + 'vertical: lo que hay a la izquierda es el reflejo de lo que hay a la derecha, y eso '
        + 'es ser par. En el segundo, una cúbica que sube, baja y vuelve a subir, simétrica '
        + 'respecto del origen: girando el dibujo media vuelta queda igual, y eso es ser impar. '
        + 'En el tercero, una exponencial creciente que no tiene ninguna de las dos simetrías. '
        + 'En los dos primeros se dibuja con trazo fino el reflejo para que la simetría se vea.',
      celdas: [
        celda('(a) par: 1 − t²', (t) => 1 - t * t, [-4.6, 1.6], [-2.3, 2.3], (l) => {
          l.poli([[0, -4.6], [0, 1.6]], { clase: 'g' });
        }),
        celda('(c) impar: 2t³ − 4t', (t) => 2 * t ** 3 - 4 * t, [-4.6, 4.6], [-1.8, 1.8], (l) => {
          l.punto(0, 0, { clase: 'o', r: 4 });
        }),
        celda('(e) ninguna: eᵗ', Math.exp, [-1.2, 7.4], [-2.3, 1.98]),
      ],
    });
  });

/* ── 3 · el seno desarrollado en cosenos ─────────────────────────────── */

fig('t11-fourier', 'la-serie-de-cosenos-del-seno',
  'Desarrollar en cosenos es extender la función de forma par al otro lado, y la extensión par de sen t en (0,π) es |sen t|. Por eso la serie que sale no tiene senos: la función que de verdad se está desarrollando es la de abajo, que es par.',
  () => {
    const l = lienzo({
      id: 'f-serie-cosenos-del-seno',
      ancho: 340, alto: 230,
      x: [-7.2, 7.2], y: [-0.5, 1.5], cuadrado: false,
      titulo: 'El seno en el intervalo dado y su extensión par, que es el valor absoluto del seno',
      desc: 'Sobre una banda sombreada que cubre el intervalo de cero a pi se dibuja con trazo '
        + 'grueso la joroba del seno, que es lo único que da el enunciado. Fuera de esa banda, '
        + 'con el mismo trazo, se dibuja la extensión par: la joroba se refleja a la izquierda '
        + 'del eje vertical y se repite cada dos pi hacia los dos lados, de modo que todas las '
        + 'jorobas quedan por encima del eje. La curva resultante es el valor absoluto del seno, '
        + 'que es simétrica respecto del eje vertical.',
    });
    l.poli([[0, -0.5], [P, -0.5], [P, 1.5], [0, 1.5]], { clase: 'f', cerrar: true });
    l.ejes({
      nombreX: 't', nombreY: 'f',
      marcasX: [[-2 * P, '−2π'], [-P, '−π'], [P, 'π'], [2 * P, '2π']], marcasY: [1],
    });
    l.curva((t) => Math.abs(Math.sin(t)), [-7.15, 7.15], { clase: 'c', n: 300 });
    l.rotulo(P / 2, 1, 'lo que da el enunciado', { dx: 0, dy: -9, anclaje: 'middle' });
    l.rotulo(-3 * P / 2, 0.5, 'la extensión par', { dx: 0, dy: 4, anclaje: 'middle', color: 'var(--alt)', pequeno: true });
    return l.svg();
  });

/* ── 4 · dos identidades y cuatro sumas ──────────────────────────────── */

fig('t11-fourier', 'dos-identidades-y-cuatro-sumas',
  'Las dos series valen lo mismo en [0,π] porque las dos representan la parábola t(π−t), pero se construyen al revés: una la extiende de forma par y otra de forma impar. Evaluando en t = 0 o en t = π/2 caen las cuatro sumas numéricas que el ejercicio pide.',
  () => {
    const f = (t) => t * (P - t);
    const cos3 = (t) => (P * P) / 6 - (Math.cos(2 * t) + Math.cos(4 * t) / 4 + Math.cos(6 * t) / 9);
    const l = lienzo({
      id: 'f-parabola-dos-series',
      ancho: 335, alto: 235,
      x: [-0.5, 3.6], y: [-0.5, 3.2], cuadrado: false,
      titulo: 'La parábola y las dos series que la representan, con tres términos cada una',
      desc: 'Una parábola que sale del origen, sube hasta su máximo en pi medios, algo menos de '
        + 'dos y medio, y vuelve a bajar hasta cero en pi. Junto a ella, con otro trazo, la suma '
        + 'de los tres primeros términos de la serie de cosenos, que ya la sigue muy de cerca y '
        + 'solo se separa un poco en los extremos. Dos puntos marcados señalan los valores donde '
        + 'se evalúa para obtener las sumas numéricas: el origen y pi medios.',
    });
    l.ejes({ nombreX: 't', nombreY: 'f', marcasX: [[P / 2, 'π/2'], [P, 'π']], marcasY: [1, 2] });
    l.curva(cos3, [0, P], { clase: 'c2', n: 140 });
    l.curva(f, [0, P], { clase: 'c', n: 90 });
    l.punto(0, 0, { clase: 'o', r: 4.4 });
    l.punto(P / 2, f(P / 2), { clase: 'o', r: 4.4 });
    l.rotulo(P / 2, f(P / 2), 'π²/4', { dx: 7, dy: -4, color: 'var(--flag)' });
    l.rotulo(2.6, cos3(2.6), 'tres términos', { dx: -6, dy: 12, anclaje: 'end', color: 'var(--alt)', pequeno: true });
    l.esquina(10, 17, 'en t = 0 sale Basilea');
    return l.svg();
  });

/* ── 5 · tres series del complementario ──────────────────────────────── */

fig('t11-fourier', 'tres-series-del-complementario',
  'Las tres tienen simetrías distintas, y eso decide qué coeficientes hay que calcular: la primera es impar y solo tiene senos; la tercera es par y solo tiene cosenos; la segunda no es ni una cosa ni otra, así que hay que calcularlo todo.',
  () => {
    const onda = (t, T, f) => f(((t % T) + T) % T);
    const celda = (etiqueta, T, f, y, nota) => ({
      etiqueta,
      x: [-3.4 * (T / 2), 3.4 * (T / 2)], y, cuadrado: false,
      dibuja: (l) => {
        l.ejes({ nombreX: 't', nombreY: 'f', marcasX: [-T, T] });
        for (let k = -2; k <= 1; k++) {
          const p = [];
          for (let i = 0; i <= 60; i++) {
            const u = 1e-4 + ((T - 2e-4) * i) / 60;
            p.push([k * T + u, f(u)]);
          }
          l.poli(p, { clase: 'c' });
        }
        l.esquina(6, 13, nota);
      },
    });
    return mosaico({
      id: 'f-tres-series-simetria',
      columnas: 3,
      titulo: 'Las tres funciones periódicas y la simetría de cada una',
      desc: 'Tres recuadros. En el primero, una onda cuadrada que vale menos uno en la primera '
        + 'mitad de cada periodo y uno en la segunda: es impar, simétrica respecto del origen. '
        + 'En el segundo, otra onda cuadrada que vale cero y dos en lugar de menos uno y uno: al '
        + 'no estar centrada en el eje no es ni par ni impar. En el tercero, una función en '
        + 'zigzag con forma de uve repetida, que vale uno en los mínimos: es par, simétrica '
        + 'respecto del eje vertical. Bajo cada una está escrito qué coeficientes hacen falta.',
      celdas: [
        celda('(a) impar: solo senos', 2, (u) => (u < 1 ? 1 : -1), [-1.7, 1.7], 'solo bₙ'),
        celda('(b) ni par ni impar', 6, (u) => (u < 3 ? 2 : 0), [-0.9, 2.8], 'aₙ y bₙ'),
        celda('(c) par: solo cosenos', 2, (u) => 1 + Math.abs(u < 1 ? u : u - 2), [-0.6, 2.6], 'solo aₙ'),
      ],
    });
  });

/* ── 6 · un vector perpendicular a la curva de nivel ─────────────────── */

fig('t06-varias-variables', 'perpendicular-a-la-curva-de-nivel',
  'La curva de nivel f = 2 que pasa por el origen es el propio eje x, porque ahí y = 0 anula los dos términos que dependen de y. El gradiente en el origen vale (0,2), que efectivamente es perpendicular a ella: el gradiente siempre lo es.',
  () => {
    const l = lienzo({
      id: 'f-perpendicular-al-nivel',
      ancho: 330, alto: 250,
      x: [-2.6, 2.6], y: [-1.6, 2.6], cuadrado: true,
      titulo: 'La curva de nivel que pasa por el origen y el gradiente perpendicular a ella',
      desc: 'El eje horizontal está resaltado con trazo grueso: es la curva de nivel f igual a '
        + 'dos que pasa por el origen. Desde el origen sale hacia arriba una flecha vertical de '
        + 'longitud dos, el gradiente, y forma con la curva un ángulo recto marcado con una '
        + 'escuadra. Con trazo fino se dibuja también la otra rama de ese nivel, la hipérbola '
        + 'x²y = −2, que queda por debajo y no pasa por el origen.',
    });
    l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-2, -1, 1, 2], marcasY: [1, 2] });
    l.poli([[-2.55, 0], [2.55, 0]], { clase: 'c' });
    for (const s of [-1, 1]) {
      l.poli(param((x) => [s * x, -2 / (x * x)], 1.05, 2.5, 60), { clase: 'g' });
    }
    l.flecha([0, 0], [0, 2], { clase: 'c2', color: 'var(--alt)' });
    l.poli([[0, 0.3], [0.3, 0.3], [0.3, 0]], { clase: 'g' });
    l.punto(0, 0, { clase: 'o', r: 4.8 });
    l.rotulo(0, 2, '∇f = (0,2)', { dx: 7, dy: 4, color: 'var(--alt)' });
    l.rotulo(2.5, 0, 'la curva de nivel f = 2', { dx: 0, dy: -9, anclaje: 'end' });
    l.rotulo(2, -0.32, 'la otra rama', { dx: 0, dy: 14, anclaje: 'middle', color: 'var(--faint)', pequeno: true });
    return l.svg();
  });

/* ── 7 · cuatro EDPs pasadas a polares ───────────────────────────────── */

fig('t06-varias-variables', 'cuatro-edps-en-polares',
  'Cambiar a polares es cambiar de retícula: donde antes había cuadrados iguales ahora hay trozos de corona que crecen al alejarse del origen. Las derivadas se transforman por la regla de la cadena, y la ρ que aparece en los denominadores sale de ahí.',
  () => {
    const celda = (etiqueta, dibuja) => ({
      etiqueta,
      x: [-2.6, 2.6], y: [-2.6, 2.6], cuadrado: true,
      dibuja: (l) => {
        dibuja(l);
        l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2] });
      },
    });
    return mosaico({
      id: 'f-reticula-polar',
      columnas: 2,
      ancho: 205,
      alto: 190,
      titulo: 'La retícula cartesiana y la retícula polar sobre el mismo trozo de plano',
      desc: 'Dos recuadros con el mismo trozo de plano. En el primero, una cuadrícula de líneas '
        + 'horizontales y verticales igualmente espaciadas: todas las celdas son cuadrados del '
        + 'mismo tamaño. En el segundo, una retícula formada por circunferencias concéntricas y '
        + 'radios que salen del origen: las celdas son trozos de corona, todas con la misma '
        + 'anchura radial pero cada vez más largas según se alejan del centro, porque el arco '
        + 'crece con el radio.',
      celdas: [
        celda('cartesiana: todo igual', (l) => {
          for (let v = -2.5; v <= 2.5; v += 0.5) {
            l.poli([[-2.5, v], [2.5, v]], { clase: 'g' });
            l.poli([[v, -2.5], [v, 2.5]], { clase: 'g' });
          }
        }),
        celda('polar: crece con ρ', (l) => {
          for (let r = 0.5; r <= 2.5; r += 0.5) l.circunferencia(0, 0, r, { clase: 'g' });
          for (let k = 0; k < 12; k++) {
            const t = (2 * P * k) / 12;
            l.poli([[0, 0], [2.5 * Math.cos(t), 2.5 * Math.sin(t)]], { clase: 'g' });
          }
          const p = [];
          for (let i = 0; i <= 20; i++) { const t = (2 * P * i) / 12 / 20 + (2 * P * 2) / 12; p.push([2 * Math.cos(t), 2 * Math.sin(t)]); }
          for (let i = 20; i >= 0; i--) { const t = (2 * P * i) / 12 / 20 + (2 * P * 2) / 12; p.push([1.5 * Math.cos(t), 1.5 * Math.sin(t)]); }
          l.poli(p, { clase: 'f', cerrar: true });
        }),
      ],
    });
  });

/* ── a pegar ─────────────────────────────────────────────────────────── */
for (const f of figuras) f.svg = f.hacer();

if (process.argv[1]?.endsWith('calculo-practica-t11-mas.mjs')) {
  for (const f of figuras) pegaEnCampo(f.fichero, f.id, f.campo, f.svg, f.pie);
  console.log(`${figuras.length} figuras pegadas`);
}
