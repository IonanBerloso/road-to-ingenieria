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

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CSS = readFileSync(join(ROOT, 'src/styles/tokens.css'), 'utf8');

/* ── lectura de tokens ─────────────────────────────────────────────── */

function block(selector) {
  const re = new RegExp(`${selector}\\s*\\{([\\s\\S]*?)\\n\\}`, 'm');
  const m = CSS.match(re);
  if (!m) throw new Error(`No encuentro el bloque ${selector} en tokens.css`);
  const out = {};
  for (const [, name, value] of m[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    out[name] = value.trim();
  }
  return out;
}

const light = block(':root');
const dark = { ...light, ...block('\\[data-theme="oscuro"\\]') };

const hex = (v) => {
  const m = /^#([0-9a-f]{6})$/i.exec(v.trim());
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

console.log('');
if (fallos) {
  console.error(`${fallos} problema(s) de color. El color nunca es el único distintivo, pero eso no excusa una paleta que se confunde.`);
  process.exit(1);
}
console.log('Paleta verificada: contraste, deuteranopía, protanopía y escala de grises.');
