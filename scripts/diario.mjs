#!/usr/bin/env node
/**
 * diario.mjs — arma el «Diario del proyecto Road to Ingeniería» en PDF.
 *
 * El diario se escribe en Markdown, un fichero por día en `diario/`. Ese es el
 * original: se versiona, se lee en GitHub y cada día es un commit limpio. El
 * PDF es un artefacto de build y NO se versiona (CLAUDE.md §12) — el
 * `.gitignore` ya excluye `*.pdf`.
 *
 * Se reutiliza lo que ya hay: el mismo procesador de Markdown que el sitio
 * (`src/lib/markdown.mjs`, con las fórmulas resueltas en el build) y el mismo
 * Chromium que el guardián de navegador. Cero dependencias nuevas.
 *
 *   npm run diario
 */

import { readFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { mate } from '../src/lib/markdown.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIARIO = join(ROOT, 'diario');
const SALIDA = join(DIARIO, 'diario-road-to-ingenieria.pdf');

if (!existsSync(DIARIO)) {
  console.error('No hay carpeta diario/. Todavía no se ha escrito ninguna entrada.');
  process.exit(1);
}

/** Las entradas van por nombre de fichero: `dia-01-2026-08-19.md` ordena solo. */
const entradas = readdirSync(DIARIO)
  .filter((f) => f.endsWith('.md'))
  .sort();

if (entradas.length === 0) {
  console.error('No hay entradas en diario/.');
  process.exit(1);
}

const paginas = [];
for (const fichero of entradas) {
  paginas.push(await mate(readFileSync(join(DIARIO, fichero), 'utf8')));
}

const tokens = readFileSync(join(ROOT, 'src', 'styles', 'tokens.css'), 'utf8');
const katex = readFileSync(join(ROOT, 'node_modules', 'katex', 'dist', 'katex.min.css'), 'utf8');

/** Las fuentes se incrustan en base64: el PDF tiene que verse igual en
 *  cualquier ordenador, sin depender de lo que haya instalado. */
function fuente(ruta, familia, peso) {
  const datos = readFileSync(join(ROOT, 'node_modules', ruta)).toString('base64');
  return `@font-face{font-family:'${familia}';font-weight:${peso};font-display:block;
    src:url(data:font/woff2;base64,${datos}) format('woff2')}`;
}

/* Las familias del rediseño Pizarra (§06): Karla para todo, Caveat para
 * anotaciones. Fraunces e IBM Plex Sans salieron del repo con él. */
const fuentes = [
  fuente('@fontsource/karla/files/karla-latin-400-normal.woff2', 'Karla', 400),
  fuente('@fontsource/karla/files/karla-latin-600-normal.woff2', 'Karla', 600),
  fuente('@fontsource/karla/files/karla-latin-800-normal.woff2', 'Karla', 800),
  fuente('@fontsource/caveat/files/caveat-latin-700-normal.woff2', 'Caveat', 700),
  fuente('@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2', 'IBM Plex Mono', 400),
].join('\n');

const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>Diario · Road to Ingeniería</title>
<style>
${fuentes}
${tokens}
${katex}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: var(--body);
  color: var(--ink);
  background: var(--paper);
  line-height: 1.62;
  font-size: 10.5pt;
}
.portada {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  page-break-after: always;
}
.portada h1 { font-size: 34pt; line-height: 1.02; margin-bottom: .5rem; }
.portada p { color: var(--graphite); font-size: 12pt; max-width: 34em; }
.portada .sello {
  font-family: var(--mono);
  font-size: 8pt;
  text-transform: uppercase;
  letter-spacing: .12em;
  color: var(--live);
  margin-bottom: 1.2rem;
}
.dia { page-break-before: always; }
h1 { font-family: var(--display); font-weight: 600; letter-spacing: -.02em; }
h2 {
  font-family: var(--display);
  font-size: 17pt;
  font-weight: 600;
  letter-spacing: -.015em;
  margin: 0 0 .3rem;
  padding-bottom: .5rem;
  border-bottom: 2px solid var(--live);
}
h3 {
  font-family: var(--display);
  font-size: 12.5pt;
  font-weight: 600;
  margin: 1.5rem 0 .4rem;
  page-break-after: avoid;
}
h4 {
  font-family: var(--mono);
  font-size: 8.5pt;
  text-transform: uppercase;
  letter-spacing: .1em;
  color: var(--graphite);
  margin: 1.2rem 0 .3rem;
  page-break-after: avoid;
}
p { margin-bottom: .6rem; orphans: 3; widows: 3; }
ul, ol { margin: 0 0 .7rem 1.1rem; }
li { margin-bottom: .22rem; }
strong { font-weight: 600; }
code {
  font-family: var(--mono);
  font-size: .88em;
  background: var(--grid);
  padding: .08em .3em;
  border-radius: 2px;
}
blockquote {
  border-left: 2px solid var(--flag);
  background: var(--flag-soft);
  padding: .5rem .8rem;
  margin: .8rem 0;
  page-break-inside: avoid;
}
blockquote p:last-child { margin-bottom: 0; }
hr { border: none; border-top: 1px solid var(--rule); margin: 1.4rem 0; }
table { border-collapse: collapse; width: 100%; margin: .8rem 0; font-size: 9.5pt; }
th, td { text-align: left; padding: .35rem .6rem; border-bottom: 1px solid var(--rule); }
th { font-family: var(--mono); font-size: 8pt; text-transform: uppercase; letter-spacing: .08em; color: var(--graphite); }
</style></head>
<body>
<section class="portada">
  <p class="sello">Diario del proyecto</p>
  <h1>Road to Ingeniería</h1>
  <p>Qué se hizo cada día, qué se rompió y qué se decidió. Los fallos también
  se cuentan: son la parte que no está en el historial de git.</p>
</section>
${paginas.map((p) => `<section class="dia">${p}</section>`).join('\n')}
</body></html>`;

const navegador = await chromium.launch();
const pagina = await navegador.newPage();
await pagina.setContent(html, { waitUntil: 'networkidle' });

mkdirSync(DIARIO, { recursive: true });
await pagina.pdf({
  path: SALIDA,
  format: 'A4',
  margin: { top: '20mm', bottom: '18mm', left: '22mm', right: '22mm' },
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: '<span></span>',
  footerTemplate: `<div style="width:100%;font-family:sans-serif;font-size:7pt;color:#8A929C;
    padding:0 22mm;display:flex;justify-content:space-between">
    <span>Diario · Road to Ingeniería</span><span class="pageNumber"></span></div>`,
});

/* `npm run diario -- --vistazo` deja además un PNG de la primera pantalla.
   Sirve para revisar el diseño sin abrir el PDF. */
if (process.argv.includes('--vistazo')) {
  await pagina.setViewportSize({ width: 794, height: 1123 }); // A4 a 96 ppp
  await pagina.screenshot({ path: join(DIARIO, 'vistazo.png') });
}

await navegador.close();

console.log(`Diario con ${entradas.length} entrada(s) → ${SALIDA.replace(ROOT + '\\', '')}`);
