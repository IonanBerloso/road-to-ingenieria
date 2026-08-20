#!/usr/bin/env node
/**
 * verify.mjs — el suelo de calidad (CLAUDE.md §11).
 *
 * Corre en CI y bloquea el despliegue. Sale con código distinto de cero si
 * algo falla. No arregla nada: avisa. Arreglarlo automáticamente sería
 * exactamente el script de rediseño masivo que la Regla 0 prohíbe.
 *
 *   node scripts/verify.mjs          comprueba src/ y dist/
 *   node scripts/verify.mjs --solo-fuente   solo src/, sin necesidad de build
 *
 * Qué NO comprueba, y hay que saberlo:
 *   · el foco visible se comprueba de forma indirecta (que nadie apague el
 *     outline sin poner otra cosa), no midiendo píxeles en un navegador;
 *   · los 360 px se comprueban buscando anchos fijos, no renderizando.
 * Las dos cosas piden un navegador de verdad; cuando haya tests de interfaz,
 * se mueven allí.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, extname, dirname, posix, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');
const DIST = join(ROOT, 'dist');
/* La URL del sitio se declara UNA vez, en astro.config.mjs. Repetirla aquí
 * sería el mismo error de siempre: dos fuentes de verdad que se separan el día
 * que se renombra el repositorio. */
const { default: astroConfig } = await import('../astro.config.mjs');
const BASE = astroConfig.base.replace(/\/$/, '');
const ORIGEN = astroConfig.site.replace(/\/$/, '');
const SOLO_FUENTE = process.argv.includes('--solo-fuente');

/* Los prototipos de referencia/ están fuera a propósito: son material de
   partida, llevan su CSS inline y no se publican. */
const IGNORA = new Set(['node_modules', 'dist', '.astro', '.git', 'referencia']);

let fallos = 0;
let avisos = 0;

const fallo = (regla, detalle) => {
  console.error(`  ✗ ${regla}\n    ${detalle}`);
  fallos++;
};
const aviso = (regla, detalle) => {
  console.warn(`  · ${regla}\n    ${detalle}`);
  avisos++;
};
const ok = (texto) => console.log(`  ✓ ${texto}`);

function* archivos(dir, exts) {
  if (!existsSync(dir)) return;
  for (const nombre of readdirSync(dir)) {
    if (IGNORA.has(nombre)) continue;
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) yield* archivos(ruta, exts);
    else if (exts.includes(extname(ruta))) yield ruta;
  }
}

const leer = (f) => readFileSync(f, 'utf8');
/** Siempre con barras `/`: en Windows `relative` devuelve `\` y entonces
 *  las comparaciones de ruta de abajo no coinciden nunca. */
const rel = (f) => relative(ROOT, f).split(sep).join('/');

/** Quita comentarios: una regla no es lo mismo que hablar de una regla.
 *  Sin esto, escribir «:root{}» en un comentario cuenta como declararlo. */
const sinComentarios = (texto) =>
  texto.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

/* ═══════════════════════════════════════════════════════════════════
   1 · Un solo :root{} en todo el repositorio
   ═══════════════════════════════════════════════════════════════════ */
console.log('\nTokens');
{
  const encontrados = [];
  for (const f of archivos(SRC, ['.css', '.astro', '.mdx', '.ts', '.js'])) {
    const n = (sinComentarios(leer(f)).match(/:root\s*\{/g) ?? []).length;
    if (n) encontrados.push([rel(f), n]);
  }
  const total = encontrados.reduce((s, [, n]) => s + n, 0);

  if (total === 1 && encontrados[0][0] === posix.join('src', 'styles', 'tokens.css')) {
    ok('un único :root{}, en src/styles/tokens.css');
  } else {
    fallo(
      'Tiene que haber exactamente un :root{} y estar en tokens.css',
      encontrados.map(([f, n]) => `${f} (${n})`).join(', ') || 'no hay ninguno',
    );
  }
}

/* ═══════════════════════════════════════════════════════════════════
   2 · Cero colores literales fuera de tokens.css
   ═══════════════════════════════════════════════════════════════════ */
{
  const LITERAL = /#[0-9a-fA-F]{3,8}\b|\brgba?\s*\(|\bhsla?\s*\(/g;
  const sospechosos = [];

  for (const f of archivos(SRC, ['.css', '.astro', '.mdx'])) {
    if (rel(f).endsWith(posix.join('styles', 'tokens.css'))) continue;
    for (const linea of sinComentarios(leer(f)).split('\n')) {
      // Un id de fragmento (#seccion) o una clase no son un color.
      const encontrados = (linea.match(LITERAL) ?? []).filter(
        (m) => !m.startsWith('#') || /^#[0-9a-fA-F]{3,8}$/.test(m),
      );
      if (encontrados.length) sospechosos.push(`${rel(f)}: ${encontrados.join(' ')}`);
    }
  }

  if (sospechosos.length === 0) ok('ningún color literal fuera de tokens.css');
  else fallo('Los colores van en tokens.css y se usan con var()', sospechosos.slice(0, 12).join('\n    '));
}

/* ═══════════════════════════════════════════════════════════════════
   2 bis · LaTeX que no se dibuja
   ═══════════════════════════════════════════════════════════════════
   Dos comandos que se escriben igual de bien y se dibujan mal:

   · `\bar{z}` usa un acento que muchas fuentes matemáticas no traen, y la
     barra desaparece sin aviso. Con `\overline` sí se dibuja.
   · `\overline{...}` sobre algo ANCHO tampoco vale: Chromium no estira la
     barra, así que en `\overline{z^{n}}` cae solo encima del exponente, y
     sobre una fracción se monta encima del signo. La barra va sobre un
     símbolo suelto: `\left(\overline{z}\right)^{n}`, que además es la
     igualdad que se está enseñando.

   Pasó el 20 de agosto de 2026 en el ejercicio 1.2. */
{
  const prohibido = [
    [/\\bar\s*\{|\\bar\s+[a-zA-Z]/g, 'usa \\overline{...}: \\bar no dibuja la barra en todas las fuentes'],
    [
      /\\overline\{[^{}]*[\^_+\-\\][^{}]*\}|\\overline\{[^{}]*\{/g,
      'la barra solo sobre un símbolo suelto: Chromium no la estira sobre expresiones',
    ],
  ];
  const pegas = [];

  for (const f of archivos(SRC, ['.mdx', '.yaml', '.astro'])) {
    const texto = leer(f);
    for (const [patron, porque] of prohibido) {
      for (const m of texto.match(patron) ?? []) pegas.push(`${rel(f)}: «${m.trim()}» — ${porque}`);
    }
  }

  if (pegas.length === 0) ok('ningún comando LaTeX de los que no se dibujan');
  else fallo('LaTeX que el navegador no dibuja', pegas.slice(0, 8).join('\n    '));
}

/* ═══════════════════════════════════════════════════════════════════
   3 · Foco visible: nadie apaga el outline
   ═══════════════════════════════════════════════════════════════════ */
console.log('\nAccesibilidad de la fuente');
{
  const apagones = [];
  for (const f of archivos(SRC, ['.css', '.astro'])) {
    const texto = sinComentarios(leer(f));
    for (const m of texto.matchAll(/outline\s*:\s*(none|0)\s*[;}]/g)) {
      apagones.push(`${rel(f)} → ${m[0].trim()}`);
    }
  }
  if (apagones.length === 0) ok('nadie apaga el outline del foco');
  else fallo('Foco visible obligatorio: no se apaga el outline sin poner otra cosa', apagones.join('\n    '));
}

/* ═══════════════════════════════════════════════════════════════════
   4 · prefers-reduced-motion respetado
   ═══════════════════════════════════════════════════════════════════ */
{
  const base = join(SRC, 'styles', 'base.css');
  const tieneBloque = existsSync(base) && /@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/.test(leer(base));
  if (tieneBloque) ok('base.css neutraliza animaciones con prefers-reduced-motion');
  else fallo('prefers-reduced-motion', 'base.css tiene que neutralizar animaciones y transiciones');
}

/* ═══════════════════════════════════════════════════════════════════
   5 · Anchos fijos que rompan a 360 px
   ═══════════════════════════════════════════════════════════════════ */
{
  const anchos = [];
  for (const f of archivos(SRC, ['.css', '.astro'])) {
    const texto = sinComentarios(leer(f));
    for (const m of texto.matchAll(/(?<!max-|min-)width\s*:\s*(\d{3,})px/g)) {
      if (Number(m[1]) > 360) anchos.push(`${rel(f)} → ${m[0].trim()}`);
    }
    for (const m of texto.matchAll(/min-width\s*:\s*(\d{3,})px/g)) {
      // Dentro de @media es legítimo: es un punto de ruptura.
      const antes = texto.slice(0, m.index).lastIndexOf('@media');
      const cierre = texto.slice(0, m.index).lastIndexOf('}');
      if (antes < cierre && Number(m[1]) > 360) anchos.push(`${rel(f)} → ${m[0].trim()}`);
    }
  }
  if (anchos.length === 0) ok('ningún ancho fijo por encima de 360 px');
  else fallo('Responsive real hasta 360 px', anchos.join('\n    '));
}

/* ═══════════════════════════════════════════════════════════════════
   6 · Cruce catálogo ↔ temas escritos
   ═══════════════════════════════════════════════════════════════════ */
console.log('\nContenido');
{
  const dirCatalogo = join(SRC, 'content', 'catalogo');
  const problemas = [];
  let temas = 0;
  let hechos = 0;

  for (const f of archivos(dirCatalogo, ['.json'])) {
    const datos = JSON.parse(leer(f));
    const id = rel(f).split(/[\\/]/).pop().replace('.json', '');
    temas += datos.temas.length;

    for (const t of datos.temas) {
      if (!t.hecho) continue;
      hechos++;
      const mdx = join(SRC, 'content', id, t.id, 'index.mdx');
      if (!existsSync(mdx)) problemas.push(`${id} · ${t.id} está marcado hecho y no existe ${rel(mdx)}`);
    }

    if (!datos.temarioOficial && datos.temas.length > 0) {
      aviso('Temario provisional', `${id}: puesto a ojo, hay que sustituirlo por el oficial`);
    }
  }

  if (problemas.length === 0) ok(`catálogo coherente: ${hechos} de ${temas} temas escritos`);
  else fallo('El catálogo miente sobre lo que está hecho', problemas.join('\n    '));
}

/* ═══════════════════════════════════════════════════════════════════
   Comprobaciones sobre el sitio construido
   ═══════════════════════════════════════════════════════════════════ */
if (SOLO_FUENTE) {
  resumen();
} else if (!existsSync(DIST)) {
  fallo('No hay dist/', 'ejecuta `npm run build` antes de verificar, o usa --solo-fuente');
  resumen();
} else {
  const paginas = [...archivos(DIST, ['.html'])];
  console.log(`\nSitio construido — ${paginas.length} página(s)`);

  const externos = new Set();
  const sinDescripcion = [];
  const sinOg = [];
  const sinCanonical = [];
  const h1Malos = [];
  const sinLang = [];
  const imgSinAlt = [];
  const rotos = [];
  const sinViewport = [];
  const sinModos = [];

  for (const f of paginas) {
    const html = leer(f);
    const nombre = rel(f);

    /* dominios externos */
    for (const m of html.matchAll(/https?:\/\/[^"'\s)>]+/g)) {
      const url = m[0];
      if (url.startsWith(ORIGEN)) continue;
      if (url.startsWith('http://www.w3.org/')) continue; // espacio de nombres de MathML, no una petición
      externos.add(`${nombre} → ${url}`);
    }

    /* metadatos */
    if (!/<meta\s+name="description"\s+content="[^"]{10,}"/.test(html)) sinDescripcion.push(nombre);
    if (!/<meta\s+property="og:title"/.test(html)) sinOg.push(nombre);
    if (!/<link\s+rel="canonical"/.test(html)) sinCanonical.push(nombre);
    if (!/<html[^>]+lang="es"/.test(html)) sinLang.push(nombre);
    if (!/<meta\s+name="viewport"/.test(html)) sinViewport.push(nombre);

    /* exactamente un h1 */
    const h1 = (html.match(/<h1[\s>]/g) ?? []).length;
    if (h1 !== 1) h1Malos.push(`${nombre} (${h1})`);

    /* alt en toda imagen */
    for (const m of html.matchAll(/<img\b[^>]*>/g)) {
      if (!/\balt\s*=/.test(m[0])) imgSinAlt.push(`${nombre} → ${m[0].slice(0, 70)}`);
    }

    /* modo guiado y modo completo en páginas de contenido */
    const esContenido = /data-lectura/.test(html);
    if (esContenido && !/data-modo="guiado"/.test(html)) sinModos.push(nombre);

    /* enlaces internos */
    for (const m of html.matchAll(/href="([^"#][^"]*)"/g)) {
      const href = m[1];
      if (/^(https?:|mailto:|tel:|data:)/.test(href)) continue;
      if (!href.startsWith(BASE)) {
        rotos.push(`${nombre} → ${href} (no lleva el base ${BASE}; usa ruta())`);
        continue;
      }
      const limpio = href.split('#')[0].split('?')[0];
      const destino = limpio.slice(BASE.length);
      const candidatos = [
        join(DIST, destino),
        join(DIST, destino, 'index.html'),
        join(DIST, `${destino.replace(/\/$/, '')}.html`),
      ];
      if (!candidatos.some(existsSync)) rotos.push(`${nombre} → ${href}`);
    }
  }

  const grupo = (coleccion, regla, detalle) => {
    const lista = [...coleccion];
    if (lista.length === 0) ok(regla);
    else fallo(regla, `${detalle} (${lista.length}):\n    ${lista.slice(0, 10).join('\n    ')}`);
  };

  grupo(externos, 'cero peticiones a dominios externos', 'referencias fuera del sitio');
  grupo(sinDescripcion, 'toda página con description', 'sin description');
  grupo(sinOg, 'toda página con og:title', 'sin og:title');
  grupo(sinCanonical, 'toda página con canonical', 'sin canonical');
  grupo(sinLang, 'lang="es" en <html>', 'sin lang');
  grupo(sinViewport, 'meta viewport en toda página', 'sin viewport');
  grupo(h1Malos, 'exactamente un <h1> por página', 'páginas con otro número de h1');
  grupo(imgSinAlt, 'alt en toda imagen', 'imágenes sin alt');
  grupo(sinModos, 'modo guiado y modo completo en las páginas de contenido', 'páginas sin los dos modos');
  grupo(rotos, 'cero enlaces internos rotos', 'enlaces que no llevan a ninguna parte');

  /* prefers-reduced-motion en el CSS publicado */
  const hojas = [...archivos(DIST, ['.css'])];
  const css = hojas.map(leer).join('\n');
  if (/prefers-reduced-motion/.test(css)) ok('el CSS publicado respeta prefers-reduced-motion');
  else fallo('prefers-reduced-motion', 'no aparece en el CSS publicado');

  /* Todo lo que pide el CSS tiene que estar en el propio sitio: esta es la
     comprobación de «desconecta la red y recarga», tipografías incluidas. */
  const faltan = [];
  let recursos = 0;
  for (const hoja of hojas) {
    for (const m of leer(hoja).matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
      const url = m[1].trim();
      if (url.startsWith('data:')) continue;
      recursos++;
      if (/^https?:\/\//.test(url)) {
        faltan.push(`${rel(hoja)} → ${url} (petición externa)`);
        continue;
      }
      const destino = url.startsWith('/')
        ? join(DIST, url.slice(BASE.length + 1))
        : join(dirname(hoja), url);
      if (!existsSync(destino)) faltan.push(`${rel(hoja)} → ${url}`);
    }
  }
  grupo(faltan, `sin conexión: los ${recursos} recursos del CSS están en el sitio`, 'recursos que no se sirven desde aquí');

  resumen();
}

function resumen() {
  console.log('');
  if (avisos) console.log(`${avisos} aviso(s): no bloquean, pero están ahí.`);
  if (fallos) {
    console.error(`${fallos} fallo(s). El despliegue se queda parado.`);
    process.exit(1);
  }
  console.log('Suelo de calidad: en verde.');
}
