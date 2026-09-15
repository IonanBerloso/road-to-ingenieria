#!/usr/bin/env node
/**
 * check-color.mjs — verifica la paleta de tokens.css (CLAUDE.md §06).
 *
 * Comprueba, para los seis colores de datos y los nueve acentos de asignatura,
 * en tema claro y en tema oscuro:
 *
 *   1. Contraste WCAG contra el papel  >= 3.0 (objetos gráficos, WCAG 1.4.11).
 *   2. Distinguibilidad por pares bajo deuteranopía y protanopía (Viénot 1999),
 *      medida como distancia CIE76 en Lab  >= 14.
 *   3. Separación en escala de grises: la luminancia relativa de dos series
 *      contiguas por orden no puede ser idéntica.
 *
 * Sale con código != 0 si algo falla. No modifica ficheros.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, extname, join, relative } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CSS = readFileSync(join(ROOT, 'src/styles/tokens.css'), 'utf8');

/* ── lectura de tokens ─────────────────────────────────────────────── */

/**
 * Lee un bloque de tokens.css por su PRIMERA LÍNEA literal.
 *
 * Antes lo buscaba con una expresión regular sobre el selector, y eso tenía
 * un fallo que no se veía: la cabecera del fichero dice «el ÚNICO :root{} del
 * repositorio», y el patrón casaba con esa cita dentro del comentario. El
 * bloque empezaba ahí, se tragaba la prosa, y solo funcionaba porque la prosa
 * no lleva declaraciones. Una llave de cierre en la columna 0 dentro de un
 * comentario habría cortado el bloque antes del primer color y el guion habría
 * dicho «paleta verificada» sobre cero tokens. Buscar el literal con su salto
 * de línea delante no se puede confundir con una cita.
 */
function block(inicio) {
  const i = CSS.indexOf(`\n${inicio}`);
  if (i < 0) throw new Error(`No encuentro el bloque «${inicio}» en tokens.css`);
  const j = CSS.indexOf('\n}', i);
  if (j < 0) throw new Error(`El bloque «${inicio}» no se cierra en tokens.css`);
  const out = {};
  for (const [, name, value] of CSS.slice(i, j).matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    out[name] = value.trim();
  }
  if (Object.keys(out).length === 0)
    throw new Error(`El bloque «${inicio}» no declara ningún token: el guion se estaría apagando solo.`);
  return out;
}

const light = block(':root {');
const dark = { ...light, ...block('[data-theme="oscuro"] {') };

const hex = (v) => {
  const m = /^#([0-9a-f]{6})$/i.exec((v ?? '').trim());
  return m ? m[1] : null;
};

/* ── color ─────────────────────────────────────────────────────────── */

const srgb = (h) => [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luminance = (h) => {
  const [r, g, b] = srgb(h).map(lin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

/* Viénot, Brettel & Mollon 1999 — simulación de dicromacia sobre LMS */
const RGB_LMS = [
  [17.8824, 43.5161, 4.11935],
  [3.45565, 27.1554, 3.86714],
  [0.0299566, 0.184309, 1.46709],
];
const LMS_RGB = [
  [0.0809444479, -0.130504409, 0.116721066],
  [-0.0102485335, 0.0540193266, -0.113614708],
  [-0.000365296938, -0.00412161469, 0.693511405],
];
const SIM = {
  deuteranopia: [
    [1, 0, 0],
    [0.494207, 0, 1.24827],
    [0, 0, 1],
  ],
  protanopia: [
    [0, 2.02344, -2.52581],
    [0, 1, 0],
    [0, 0, 1],
  ],
};
const mul = (M, v) => M.map((row) => row.reduce((s, k, i) => s + k * v[i], 0));

function simulate(h, kind) {
  const rgb = srgb(h).map(lin);
  const out = mul(LMS_RGB, mul(SIM[kind], mul(RGB_LMS, rgb)));
  return out.map((c) => {
    const v = Math.max(0, Math.min(1, c));
    return v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055;
  });
}

function toLab(rgbGamma) {
  const [r, g, b] = rgbGamma.map(lin);
  const X = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047;
  const Y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const Z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const [fx, fy, fz] = [f(X), f(Y), f(Z)];
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

const deltaE = (a, b) => Math.hypot(...toLab(a).map((v, i) => v - toLab(b)[i]));

/* ── comprobaciones ────────────────────────────────────────────────── */

const MIN_CONTRAST = 3.0;      // WCAG 1.4.11, objetos gráficos
const MIN_DELTA_E = 14;        // por pares bajo dicromacia (Okabe-Ito llega a 19)
const MIN_GRIS = 0.014;        // separación de luminancia al imprimir en b/n
const MIN_DELTA_E_NORMAL = 12; // por pares en visión normal

/* Los dos grupos NO se juzgan igual, y la diferencia es deliberada:
 *
 * · Los seis colores de datos conviven en la misma gráfica y el lector tiene
 *   que separarlos entre sí. Se les exige distinguibilidad por pares bajo
 *   deuteranopía y protanopía, y separación en escala de grises.
 *
 * · Los nueve acentos de asignatura no compiten nunca por decodificar un dato:
 *   viven en el marco, junto al nombre de su asignatura, que es lo que
 *   identifica de verdad. Se les exige contraste suficiente y que no sean el
 *   mismo color a simple vista. Pedirles distinguibilidad dicromática por pares
 *   sería imposible con nueve tonos y no arreglaría nada real. */
const GRUPOS = {
  'datos --d1..--d6': {
    tokens: ['--d1', '--d2', '--d3', '--d4', '--d5', '--d6'],
    cvd: true,
  },
  'acentos de asignatura': {
    tokens: Object.keys(light).filter((k) => k.startsWith('--a-')),
    cvd: false,
  },
};

let fallos = 0;
const fallo = (msg) => {
  console.error(`  ✗ ${msg}`);
  fallos++;
};

for (const [temaNombre, tokens] of [['claro', light], ['oscuro', dark]]) {
  const paper = hex(tokens['--paper']);
  console.log(`\nTema ${temaNombre} — papel #${paper}`);

  for (const [grupo, { tokens: nombres, cvd }] of Object.entries(GRUPOS)) {
    const usables = nombres.filter((n) => hex(tokens[n]));
    /* El fallo silencioso que encontró la auditoría del 13 de septiembre de
       2026: `--d1..--d6` está escrita a mano y este filtro descarta sin decir
       nada lo que no case con `#rrggbb`. Si alguien renombra los tokens,
       `usables` se queda vacío, los dos bucles de abajo corren CERO veces,
       `fallos` se queda en 0 y el guion imprime «Paleta verificada» y sale 0.
       Un guardián que se apaga solo es peor que no tenerlo, así que aquí se
       afirma lo que se da por supuesto. */
    if (usables.length !== nombres.length)
      fallo(
        `el grupo «${grupo}» declara ${nombres.length} tokens y solo ${usables.length} tienen color: ` +
          `${nombres.filter((n) => !hex(tokens[n])).join(', ')} no se leen del tema ${temaNombre}`,
      );
    if (usables.length < 2)
      fallo(`el grupo «${grupo}» se ha quedado con ${usables.length} token(s): no hay nada que comparar`);
    let peor = Infinity;

    for (const n of usables) {
      const c = contrast(hex(tokens[n]), paper);
      if (c < MIN_CONTRAST) fallo(`${n} contrasta ${c.toFixed(2)}:1 con el papel (mínimo ${MIN_CONTRAST})`);
    }

    const rgbPlano = (h) => [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);

    for (let i = 0; i < usables.length; i++) {
      for (let j = i + 1; j < usables.length; j++) {
        const [a, b] = [usables[i], usables[j]];

        if (cvd) {
          for (const kind of ['deuteranopia', 'protanopia']) {
            const d = deltaE(simulate(hex(tokens[a]), kind), simulate(hex(tokens[b]), kind));
            peor = Math.min(peor, d);
            if (d < MIN_DELTA_E) fallo(`${a} y ${b} se confunden bajo ${kind} (ΔE ${d.toFixed(1)} < ${MIN_DELTA_E})`);
          }
          const g = Math.abs(luminance(hex(tokens[a])) - luminance(hex(tokens[b])));
          if (g < MIN_GRIS) fallo(`${a} y ${b} son el mismo gris al imprimir en blanco y negro`);
        } else {
          const d = deltaE(rgbPlano(hex(tokens[a])), rgbPlano(hex(tokens[b])));
          peor = Math.min(peor, d);
          if (d < MIN_DELTA_E_NORMAL) fallo(`${a} y ${b} son prácticamente el mismo color (ΔE ${d.toFixed(1)})`);
        }
      }
    }

    console.log(`  ${grupo}: ${usables.length} colores, ΔE mínima por pares ${peor.toFixed(1)}${cvd ? ' bajo dicromacia' : ''}`);
  }
}

/* ── la capa de tinta ───────────────────────────────────────────────
 *
 * Hasta el 15 de septiembre de 2026 este guion medía DOS grupos —las seis
 * series de datos y los nueve acentos— contra UNA superficie, `--paper`, y a
 * un solo listón, el de objeto gráfico. Todo lo demás de la paleta no lo
 * miraba nadie. Lo que se estaba publicando mientras tanto, medido el día que
 * se escribió esto: `--faint` a 3,43:1 en claro y 4,42:1 en oscuro, `--flag`
 * a 4,18:1 sobre el papel, `--barra-justificar` usado como color de texto a
 * 3,50:1, y `--tiza-flag` a 4,20:1 sobre la parte clara de la pizarra. Cuatro
 * incumplimientos de AA en la tinta con la que se lee el sitio, en un
 * repositorio que tiene un guardián de color desde agosto.
 *
 * Dos decisiones de diseño de esta tabla:
 *
 * 1. **Los pares tinta/fondo se declaran a mano.** Sobre qué fondo cae una
 *    tinta no está en la hoja de estilos: está en el árbol del documento. No
 *    se puede deducir, así que cada fila lo dice, con su umbral y su razón.
 *
 * 2. **La lista de tintas NO se declara a mano**, y por eso no se puede
 *    quedar vieja. Se lee de `src/` —todo lo que aparezca en un `color:` o un
 *    `fill:` como `var(--algo)`— y se exige que cada una esté en la tabla.
 *    Meter una tinta nueva sin medirla rompe el guion. Es la misma defensa
 *    que el recuento de `usables` de arriba: un guardián que se apaga solo es
 *    peor que no tenerlo.
 *
 * La tercera escena es la pizarra, y su remapeo tampoco se copia: se lee del
 * bloque `.hero, .banda` de `index.astro`, que es donde vive. El fondo que se
 * usa es `--piz-claro`, el extremo MÁS claro del degradado radial, porque es
 * el peor caso y es un caso que se ve en pantalla. */

const AA_TEXTO = 4.5;  // WCAG 1.4.3 · texto normal
const AA_OBJETO = 3.0; // WCAG 1.4.11 · objeto gráfico

/* El remapeo de la pizarra, leído de donde se declara. */
const INDEX = readFileSync(join(ROOT, 'src/pages/index.astro'), 'utf8');
const bloquePizarra = INDEX.match(/\.hero,\s*\n\s*\.banda\s*\{([\s\S]*?)\n {2}\}/);
if (!bloquePizarra)
  throw new Error(
    'No encuentro el bloque «.hero, .banda» de index.astro, que es donde la pizarra ' +
      'remapea la tinta. Si se ha movido, esta comprobación se ha quedado sin escena.',
  );
const REMAPEO = Object.fromEntries(
  [...bloquePizarra[1].matchAll(/(--[\w-]+)\s*:\s*var\((--[\w-]+)\)/g)].map((m) => [m[1], m[2]]),
);
if (Object.keys(REMAPEO).length < 8)
  throw new Error(
    `El remapeo de pizarra solo tiene ${Object.keys(REMAPEO).length} claves: algo se ha roto al leerlo.`,
  );
const pizarra = { ...light };
for (const [destino, origen] of Object.entries(REMAPEO)) pizarra[destino] = light[origen];

/* Un color puede venir como `#rrggbb` o como `rgba(...)` —la tiza apagada, la
   suave, el velo—. Lo segundo hay que componerlo sobre su fondo antes de
   medir: un rgba al 62 % no contrasta lo que contrastaría opaco. */
function tinta(valor, fondoHex) {
  const opaco = hex(valor);
  if (opaco) return opaco;
  const m = /rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\.?\d+)\s*\)/.exec(valor ?? '');
  if (!m) return null;
  const a = parseFloat(m[4]);
  const f = [m[1], m[2], m[3]].map(Number);
  const g = [0, 2, 4].map((i) => parseInt(fondoHex.slice(i, i + 2), 16));
  return f
    .map((v, i) => Math.round(v * a + g[i] * (1 - a)).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

const ESCENAS = {
  claro: { tokens: light, fondos: ['--paper', '--panel'] },
  oscuro: { tokens: dark, fondos: ['--paper', '--panel'] },
  pizarra: { tokens: pizarra, fondos: ['--piz-claro'] },
};

const PAPEL = ['claro', 'oscuro'];
const TODAS = ['claro', 'oscuro', 'pizarra'];

/* token · en qué escenas vive · sobre qué cae (por defecto, los fondos de la
   escena) · con qué listón · y por qué ese listón y no el otro. */
const TINTAS = [
  { token: '--ink', escenas: TODAS, umbral: AA_TEXTO, porque: 'el cuerpo del texto' },
  { token: '--graphite', escenas: TODAS, umbral: AA_TEXTO, porque: 'la prosa secundaria' },
  { token: '--faint', escenas: TODAS, umbral: AA_TEXTO, porque: 'los rótulos y la meta; es texto, no adorno' },
  { token: '--live', escenas: TODAS, umbral: AA_TEXTO, porque: 'los enlaces y lo que se toca' },
  { token: '--live-hover', escenas: PAPEL, umbral: AA_TEXTO, porque: 'el enlace bajo el ratón, sobre papel' },
  { token: '--flag', escenas: TODAS, umbral: AA_TEXTO, porque: 'lo que te suspende: se lee' },
  { token: '--alt', escenas: TODAS, umbral: AA_TEXTO, porque: 'el segundo objeto de la escena' },
  {
    token: '--marco',
    escenas: PAPEL,
    umbral: AA_TEXTO,
    porque: 'la anotación de tiza en tono «marco» y el título de la caja de lo que falta',
  },
  {
    token: '--peso-medio-tinta',
    escenas: PAPEL,
    sobre: ['--peso-medio-fondo'],
    umbral: AA_TEXTO,
    porque: 'la pastilla de peso medio, que solo cae sobre su propio fondo',
  },
  {
    token: '--panel',
    escenas: PAPEL,
    sobre: ['--live', '--flag'],
    umbral: AA_TEXTO,
    porque: 'tinta invertida: el número del bloque abierto y la pastilla de peso alto',
  },
  {
    token: '--paper',
    escenas: PAPEL,
    sobre: ['--live'],
    umbral: AA_TEXTO,
    porque: 'tinta invertida del botón principal; en las figuras es relleno de forma, no letra',
  },
  {
    token: '--piz-medio',
    escenas: PAPEL,
    sobre: ['--tiza-amarilla'],
    umbral: AA_TEXTO,
    porque: 'la letra del CTA de tiza amarilla',
  },
  /* Las series como rótulo. §06 las diseñó como colores de LÍNEA, y por eso el
     listón de los seis es el de objeto gráfico; pero tres de ellas rotulan su
     propia curva, y un rótulo es letra. `--d1` y `--d3` pasan AA de sobra.
     `--d2` no —3,15:1 sobre el papel—, y oscurecerlo hasta 4,5 no es posible
     sin romper la separación dicromática de los otros cinco: se recorrió el
     espacio de tonos entero y no hay ningún naranja que cumpla las dos cosas.
     Por eso existe `--d2-tinta`: el naranja de la serie, oscurecido SOLO para
     cuando es letra. La línea sigue siendo `--d2`. */
  { token: '--d1', escenas: PAPEL, umbral: AA_TEXTO, porque: 'rotula su propia curva, 202 veces' },
  { token: '--d3', escenas: PAPEL, umbral: AA_TEXTO, porque: 'rotula su propia curva, 9 veces' },
  { token: '--d4', escenas: PAPEL, umbral: AA_TEXTO, porque: 'rotula su propia curva, 5 veces' },
  { token: '--d5', escenas: PAPEL, umbral: AA_TEXTO, porque: 'rotula su propia curva, 5 veces' },
  { token: '--d2', escenas: PAPEL, umbral: AA_OBJETO, porque: 'color de línea: como letra se usa --d2-tinta' },
  { token: '--d2-tinta', escenas: PAPEL, umbral: AA_TEXTO, porque: 'el naranja de --d2 cuando rotula' },
  /* La tiza, que solo existe sobre la pizarra. */
  { token: '--tiza', escenas: ['pizarra'], umbral: AA_TEXTO, porque: 'la tinta del héroe' },
  { token: '--tiza-suave', escenas: ['pizarra'], umbral: AA_TEXTO, porque: 'la prosa secundaria del héroe' },
  { token: '--tiza-apagada', escenas: ['pizarra'], umbral: AA_TEXTO, porque: 'los rótulos del héroe' },
  { token: '--tiza-amarilla', escenas: ['pizarra'], umbral: AA_TEXTO, porque: 'los enlaces del héroe' },
  { token: '--tiza-menta', escenas: ['pizarra'], umbral: AA_TEXTO, porque: 'el segundo objeto, sobre pizarra' },
];

console.log('\nLa capa de tinta — cada color contra el fondo sobre el que se pinta');

const declaradas = new Set(TINTAS.map((t) => t.token));
let medidas = 0;

for (const { token, escenas, sobre, umbral, porque } of TINTAS) {
  for (const nombre of escenas) {
    const escena = ESCENAS[nombre];
    if (!escena) throw new Error(`«${token}» dice vivir en la escena «${nombre}», que no existe.`);
    for (const fondoToken of sobre ?? escena.fondos) {
      const fondo = hex(escena.tokens[fondoToken]);
      if (!fondo) {
        fallo(`el fondo ${fondoToken} de ${token} no se lee como #rrggbb en la escena ${nombre}`);
        continue;
      }
      if (escena.tokens[token] === undefined) {
        fallo(`${token} está en la tabla de TINTAS y no existe en tokens.css`);
        continue;
      }
      const color = tinta(escena.tokens[token], fondo);
      if (!color) {
        fallo(`${token} no se lee como color en la escena ${nombre} (vale «${escena.tokens[token]}»)`);
        continue;
      }
      const c = contrast(color, fondo);
      medidas++;
      if (c < umbral)
        fallo(`${token} sobre ${fondoToken} en ${nombre}: ${c.toFixed(2)}:1, por debajo de ${umbral} — ${porque}`);
    }
  }
}

/* El cierre que impide que esta tabla envejezca: toda tinta usada en src/
   tiene que estar declarada arriba, y toda fila de la tabla tiene que usarse. */
/* Dos formas de pintar letra, y las dos cuentan. La segunda es la que se
   escapó al escribir esta tabla: las figuras del corpus no usan una hoja de
   estilos, escriben `fill="var(--d2)"` en el propio `<text>`, y así había 124
   rótulos que ninguna regla CSS declaraba. */
const USA_TINTA = /(?:^|[;{\s"'])(?:color|fill|-webkit-text-fill-color)\s*:\s*var\((--[\w-]+)/g;
const USA_TINTA_ATRIBUTO = /<(?:text|tspan)\b[^>]*?fill="var\((--[\w-]+)\)"/g;
const EXTENSIONES = new Set(['.astro', '.css', '.yaml', '.mdx', '.ts']);
const definidos = new Set([...CSS.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));
const encontradas = new Map();

(function recorre(dir) {
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entrada.name);
    if (entrada.isDirectory()) {
      recorre(p);
      continue;
    }
    if (!EXTENSIONES.has(extname(entrada.name)) || p.endsWith('tokens.css')) continue;
    const texto = readFileSync(p, 'utf8');
    for (const patron of [USA_TINTA, USA_TINTA_ATRIBUTO]) {
      for (const [, nombre] of texto.matchAll(patron)) {
        if (!definidos.has(nombre)) continue;
        if (!encontradas.has(nombre)) encontradas.set(nombre, relative(ROOT, p));
      }
    }
  }
})(join(ROOT, 'src'));

for (const [nombre, donde] of [...encontradas].sort()) {
  if (!declaradas.has(nombre))
    fallo(
      `${nombre} se usa como tinta en ${donde} y no está en la tabla de TINTAS: ` +
        'nadie ha medido sobre qué fondo cae',
    );
}
for (const nombre of declaradas) {
  if (!encontradas.has(nombre))
    fallo(`${nombre} está en la tabla de TINTAS y ya no se usa como color en src/: sobra`);
}

console.log(
  `  ${TINTAS.length} tintas declaradas, ${medidas} medidas contra su fondo, ` +
    `${encontradas.size} usadas como color en src/`,
);

console.log('');
if (fallos) {
  console.error(`${fallos} problema(s) de color. El color nunca es el único distintivo, pero eso no excusa una paleta que se confunde.`);
  process.exit(1);
}
console.log('Paleta verificada: contraste, deuteranopía, protanopía, escala de grises y la capa de tinta contra su fondo.');
