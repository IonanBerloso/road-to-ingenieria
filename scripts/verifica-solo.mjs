#!/usr/bin/env node
/**
 * verifica-solo.mjs — que la edición de una sola asignatura no se sale de sí misma.
 *
 * Para quién: quien publica la edición (Ionan). Cuándo: después de
 * `npm run build:solo` y antes de publicarla. Qué gana: la garantía de que
 * desde la edición no se llega a ninguna otra asignatura ni a un 404: cada
 * enlace interno apunta a una página que existe en `dist-solo/`. Cómo se
 * comprueba que el guardián sirve: `tests/edicion/edicion.test.ts` le pasa un
 * `dist-solo/` de juguete con un enlace roto y uno que se sale, y tienen que
 * salir los dos.
 *
 *   node scripts/verifica-solo.mjs [carpeta]     por omisión, dist-solo/
 *
 * Mira, en todo el HTML:
 *   · `href`, `src`, `action`, `poster` y `srcset`;
 *   · los destinos que la paleta de comandos lleva en su índice (`data-indice`)
 *     y el índice de ejercicios (`indice-ejercicios.json`), que son enlaces
 *     aunque no sean `<a>`;
 * y exige que:
 *   · todo enlace interno (con la base, o relativo) resuelva a un fichero de
 *     la carpeta, y su ancla `#id` exista en esa página;
 *   · ninguna ruta de la carpeta ni ningún enlace nombre otra asignatura;
 *   · no haya enlaces absolutos a otro origen salvo los de la lista blanca
 *     (el formulario de avisos del repositorio, como en `verify.mjs`).
 *
 * Los enlaces externos que sí se admiten se cuentan y se listan, para que se
 * vean. Sale con código distinto de cero si algo falla.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, posix, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Lo único externo que se permite enlazar: lo mismo que `verify.mjs`. */
const EXTERNOS_OK = ['https://github.com/ionanberloso/road-to-ingenieria/issues/new'];

export function* recorre(dir) {
  for (const nombre of readdirSync(dir)) {
    const p = join(dir, nombre);
    if (statSync(p).isDirectory()) yield* recorre(p);
    else yield p;
  }
}

/** Los destinos de un HTML: atributos de enlace más los del índice de la paleta. */
export function destinosDe(html) {
  const salida = [];
  const attr = /\s(href|src|action|poster|data-href)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/gi;
  for (const m of html.matchAll(attr)) salida.push(m[3] ?? m[4] ?? m[5]);
  for (const m of html.matchAll(/\ssrcset\s*=\s*"([^"]*)"/gi)) {
    for (const trozo of m[1].split(',')) salida.push(trozo.trim().split(/\s+/)[0]);
  }
  /* El índice de la paleta: `{ destino: "/base/…#ancla" }`. */
  const indice = html.match(/<script[^>]*data-indice[^>]*>([\s\S]*?)<\/script>/i);
  if (indice) {
    try {
      for (const e of JSON.parse(indice[1])) if (e.destino) salida.push(e.destino);
    } catch {
      salida.push('__indice-ilegible__');
    }
  }
  return salida.filter((d) => d !== '');
}

/** Los ids y `name` de una página, para comprobar las anclas. */
export function anclasDe(html) {
  const ids = new Set();
  for (const m of html.matchAll(/\s(?:id|name)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)) {
    ids.add(m[1] ?? m[2] ?? m[3]);
  }
  return ids;
}

/**
 * Comprueba una carpeta de salida.
 * @param {string} dist  la carpeta (dist-solo/)
 * @param {{ base: string, site: string, otras: string[] }} opts
 */
export function verifica(dist, { base, site, otras }) {
  const errores = [];
  const externos = new Map();
  const ficheros = [...recorre(dist)].map((f) => relative(dist, f).split(sep).join('/'));
  const existentes = new Set(ficheros);
  const cacheAnclas = new Map();

  const paginaDe = (rutaRel) => {
    if (existentes.has(rutaRel)) return rutaRel;
    const conIndex = posix.join(rutaRel, 'index.html');
    if (existentes.has(conIndex)) return conIndex;
    return null;
  };

  for (const f of ficheros) {
    for (const o of otras) {
      if (f === o || f.startsWith(`${o}/`) || f.includes(`/${o}/`)) {
        errores.push(`${f}: la ruta nombra otra asignatura («${o}»)`);
      }
    }
  }

  const comprueba = (origen, destino, urlPagina) => {
    if (/^(mailto:|tel:|javascript:|data:|blob:)/i.test(destino)) return;
    let d = destino;
    if (/^https?:\/\//i.test(d) || d.startsWith('//')) {
      const absoluto = d.startsWith('//') ? `https:${d}` : d;
      if (absoluto.startsWith(site + '/') || absoluto === site) {
        d = absoluto.slice(site.length) || '/';
      } else {
        const ok = EXTERNOS_OK.some((p) => absoluto.startsWith(p));
        if (ok) externos.set(absoluto, (externos.get(absoluto) ?? 0) + 1);
        else errores.push(`${origen}: enlace externo no admitido ${destino}`);
        return;
      }
    }
    const [sinAncla, ancla] = d.split('#');
    const [sinConsulta] = sinAncla.split('?');
    let camino;
    if (sinConsulta === '') camino = urlPagina;
    else if (sinConsulta.startsWith('/')) {
      if (sinConsulta !== base && !sinConsulta.startsWith(`${base}/`)) {
        errores.push(`${origen}: ${destino} sale de la edición (no empieza por ${base}/)`);
        return;
      }
      camino = sinConsulta;
    } else camino = posix.join(posix.dirname(urlPagina.endsWith('/') ? urlPagina + 'x' : urlPagina), sinConsulta);

    for (const o of otras) {
      if (camino.includes(`/${o}/`) || camino.endsWith(`/${o}`)) {
        errores.push(`${origen}: ${destino} apunta a otra asignatura («${o}»)`);
        return;
      }
    }
    const rel = decodeURI(camino.slice(base.length)).replace(/^\/+/, '');
    const pagina = paginaDe(rel);
    if (rel !== '' && !pagina && !(rel === '' )) {
      errores.push(`${origen}: ${destino} no existe en la edición`);
      return;
    }
    const real = pagina ?? 'index.html';
    if (ancla && ancla !== 'principal' && real.endsWith('.html')) {
      if (!cacheAnclas.has(real)) cacheAnclas.set(real, anclasDe(readFileSync(join(dist, real), 'utf8')));
      if (!cacheAnclas.get(real).has(decodeURIComponent(ancla))) {
        errores.push(`${origen}: ${destino} — la página no tiene el ancla #${ancla}`);
      }
    }
  };

  let enlaces = 0;
  for (const f of ficheros) {
    if (!f.endsWith('.html')) continue;
    const html = readFileSync(join(dist, f), 'utf8');
    const url = `${base}/${f.replace(/index\.html$/, '')}`;
    for (const d of destinosDe(html)) {
      enlaces++;
      comprueba(f, d, url);
    }
  }

  /* El índice de ejercicios de la paleta: cada `u` es una página de bloque. */
  const idx = 'indice-ejercicios.json';
  if (existentes.has(idx)) {
    for (const g of JSON.parse(readFileSync(join(dist, idx), 'utf8'))) {
      enlaces++;
      comprueba(idx, g.u, `${base}/`);
      for (const e of g.e) comprueba(idx, `${g.u}#ej-${e[1]}`, `${base}/`);
    }
  }

  return { errores, externos, enlaces, paginas: ficheros.filter((f) => f.endsWith('.html')).length };
}

/* ── ejecución ──────────────────────────────────────────────────────── */
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const dist = join(ROOT, process.argv[2] ?? 'dist-solo');
  if (!existsSync(dist)) {
    console.error(`No existe ${dist}. Corre antes: npm run build:solo`);
    process.exit(1);
  }
  const base = (process.env.BASE_SOLO || `/${process.env.SOLO_ASIGNATURA ?? 'expresion-grafica'}`).replace(/\/+$/, '');
  const solo = process.env.SOLO_ASIGNATURA ?? 'expresion-grafica';
  const site = 'https://ionanberloso.github.io';
  /* «Las demás» salen del catálogo, que es la lista de asignaturas del sitio. */
  const catalogo = join(ROOT, 'src', 'content', 'catalogo');
  const otras = readdirSync(catalogo)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''))
    .filter((id) => id !== solo);

  const r = verifica(dist, { base, site, otras });
  console.log(`${r.paginas} páginas, ${r.enlaces} enlaces comprobados en ${relative(ROOT, dist) || '.'}`);
  for (const [u, n] of r.externos) console.log(`  externo admitido (${n}): ${u}`);
  if (r.errores.length) {
    const unicos = [...new Set(r.errores)];
    console.error(`\n✗ ${unicos.length} problemas:`);
    for (const e of unicos.slice(0, 60)) console.error(`  ${e}`);
    if (unicos.length > 60) console.error(`  … y ${unicos.length - 60} más`);
    process.exit(1);
  }
  console.log('✓ Ningún enlace sale de la edición.');
}
