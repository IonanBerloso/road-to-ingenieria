/**
 * Un contact sheet con las figuras de un generador, para mirarlas.
 *
 * No forma parte del suelo de calidad: es el equivalente a levantar el papel a
 * contraluz antes de pegarlo. Se le pasa un módulo que exporte `figuras` y
 * escribe un PNG con todas, en el tema que se pida.
 *
 *     node scripts/figuras/previsualiza.mjs calculo-t01 [oscuro]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const cual = process.argv[2];
const tema = process.argv[3] === 'oscuro' ? 'dark' : 'light';
const mod = await import(`./${cual}.mjs`);
const filtro = process.argv[4];
const figuras = (mod.figuras ?? []).filter((f) => !filtro || filtro.split(",").some((q) => f.id.includes(q)));
if (!figuras.length) throw new Error(`${cual} no exporta figuras`);

const tokens = readFileSync('src/styles/tokens.css', 'utf8');

const html = `<!doctype html><html lang="es"${tema === 'dark' ? ' data-theme="oscuro"' : ''}><meta charset="utf-8">
<style>${tokens}
  body { background: var(--paper); color: var(--ink); font-family: system-ui; margin: 0; padding: 14px; }
  figure { margin: 0; }
  figcaption { font: 600 11px/1.3 monospace; color: var(--live); margin-bottom: 2px; }
  .rejilla { display: flex; flex-wrap: wrap; gap: 14px; align-items: flex-start; }
  svg { display: block; }
</style>
<div class="rejilla">
${figuras.map((f) => `<figure><figcaption>${f.id}</figcaption>${f.svg ?? f.hacer()}</figure>`).join('\n')}
</div>`;

const salida = `scripts/.previa-${cual}-${tema}`;
writeFileSync(`${salida}.html`, html);

const nav = await chromium.launch();
const p = await nav.newPage({ viewport: { width: 1180, height: 900 }, colorScheme: tema, deviceScaleFactor: 2 });
await p.goto(pathToFileURL(resolve(`${salida}.html`)).href);
await p.screenshot({ path: `${salida}.png`, fullPage: true });
await nav.close();
console.log(`${salida}.png`);
