/* scripts/peso.mjs — cuánto tarda una página en estar lista en un móvil.
 *
 * POR QUÉ EXISTE
 * Ningún guardián medía el peso, y creció sin que nadie lo mirase: el 28 de
 * agosto de 2026 el tema 1 tardaba 5,9 s en responder en un móvil de gama
 * media. La causa no era el peso —el tema 5 pesa MÁS y tardaba 2,6 s— sino
 * doce lienzos del paso `verificar` pintándose al cargar, 360.000 píxeles
 * cada uno. Se pasaron a tiempo muerto y bajó a 2,3 s.
 *
 * QUÉ NO ES
 * No es un guardián: no entra en `npm run suelo` —tarda, y el número depende
 * de la máquina— y no bloquea nada. Es una medida que se toma al cerrar una
 * asignatura, para ver si el sitio ha engordado y por dónde.
 *
 * Chromium a 390 px con la CPU frenada ×4, sobre el sitio CONSTRUIDO.
 *
 *   npm run peso  [ruta...]
 */
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { spawn } from 'node:child_process';

const RAIZ = dirname(dirname(fileURLToPath(import.meta.url)));
const { chromium } = await import(new URL('node_modules/playwright/index.mjs', `file:///${RAIZ.replace(/\\/g, '/')}/`).href);

const PUERTO = 4408;
const BASE = '/road-to-ingenieria';
const ORIGEN = `http://localhost:${PUERTO}${BASE}`;

const srv = spawn(process.execPath,
  [join(RAIZ, 'node_modules', 'astro', 'bin', 'astro.mjs'), 'preview', '--port', String(PUERTO)],
  { cwd: RAIZ, stdio: 'ignore' });

let vivo = false;
for (let i = 0; i < 60; i++) {
  try { if ((await fetch(`${ORIGEN}/`)).ok) { vivo = true; break; } } catch {}
  await new Promise((r) => setTimeout(r, 500));
}
if (!vivo) {
  console.error('El servidor de vista previa no arrancó. ¿Hay otro en el mismo puerto?');
  srv.kill();
  process.exit(1);
}

const PAGINAS = process.argv.slice(2).length ? process.argv.slice(2) : [
  '/calculo/t01-complejos/',
  '/calculo/t05-integracion/',
  '/algebra/t07-diagonalizacion/',
  '/calculo/preparar/ord/',
  '/calculo/examenes/2019-2020-ord/',
  '/',
];

const nav = await chromium.launch();

/* Calentar y descartar: la primera carga paga el arranque del navegador y del
   servidor, y sin esto la primera página de la lista sale el doble de lenta
   que si la pones la segunda. */
{
  const c = await nav.newContext({ viewport: { width: 390, height: 780 } });
  const p = await c.newPage();
  await p.goto(ORIGEN + PAGINAS[0], { waitUntil: 'load', timeout: 120000 }).catch(() => {});
  await c.close();
}

console.log('Peso — Chromium a 390 px, CPU ×4 más lenta\n');
console.log('página                                    HTML    nodos    listo');
const filas = [];
for (const ruta of PAGINAS) {
  const ctx = await nav.newContext({ viewport: { width: 390, height: 780 } });
  const pag = await ctx.newPage();
  const cdp = await ctx.newCDPSession(pag);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const t0 = Date.now();
  await pag.goto(ORIGEN + ruta, { waitUntil: 'load', timeout: 120000 });
  const listo = (Date.now() - t0) / 1000;
  const { nodos, html } = await pag.evaluate(() => ({
    nodos: document.getElementsByTagName('*').length,
    html: document.documentElement.outerHTML.length,
  }));
  filas.push({ ruta, listo, nodos, html });
  const aviso = listo > 4 ? '  ←' : '';
  console.log(`${ruta.padEnd(40)} ${(html / 1048576).toFixed(1)} MB ${String(nodos).padStart(8)} ${(listo.toFixed(1) + ' s').padStart(8)}${aviso}`);
  await ctx.close();
}
await nav.close();
srv.kill();

const lentas = filas.filter((f) => f.listo > 4);
console.log(lentas.length
  ? `\n${lentas.length} página(s) por encima de 4 s. Mira qué se ejecuta al cargar antes de culpar al peso: el tamaño del HTML explica menos de lo que parece.`
  : '\nNinguna página pasa de 4 s.');
