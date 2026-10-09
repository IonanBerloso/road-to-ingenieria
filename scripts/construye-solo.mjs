#!/usr/bin/env node
/**
 * construye-solo.mjs — construye la edición de UNA asignatura en `dist-solo/`.
 *
 * Para quién: Ionan, cuando va a enseñar una asignatura sola. Cuándo: antes de
 * publicar esa edición. Qué gana: una orden y no tres variables de entorno
 * que recordar (y que en Windows se escriben distinto que en el resto).
 * Cómo se comprueba: `npm run verifica:solo` sobre lo que sale.
 *
 *   npm run build:solo                       Expresión Gráfica, base /expresion-grafica
 *   npm run build:solo -- fluidos            otra asignatura, base /fluidos
 *   BASE_SOLO=/otra-base npm run build:solo  otra base
 *
 * El modo entero vive en `src/lib/edicion.mjs`; esto solo pone las variables
 * y lanza el build de Astro, que lee la carpeta de salida de la configuración.
 */

import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const asignatura = process.argv[2] ?? process.env.SOLO_ASIGNATURA ?? 'expresion-grafica';

const env = {
  ...process.env,
  SOLO_ASIGNATURA: asignatura,
  BASE_SOLO: process.env.BASE_SOLO || `/${asignatura}`,
};

const astro = join(dirname(createRequire(import.meta.url).resolve('astro/package.json')), 'bin', 'astro.mjs');
const r = spawnSync(process.execPath, [astro, 'build'], { cwd: ROOT, env, stdio: 'inherit' });
if (r.status !== 0) process.exit(r.status ?? 1);

console.log(`\nEdición de «${asignatura}» en dist-solo/ (base ${env.BASE_SOLO}).`);
console.log('Comprobar los enlaces: npm run verifica:solo');
