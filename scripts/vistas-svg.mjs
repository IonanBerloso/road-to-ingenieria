/**
 * Las tres vistas que calcula lib/vistas para una pieza, en SVG, para
 * mirarlas a ojo (diseño de la fase M, §3.3): el alzado, la planta debajo y
 * el perfil izquierdo a la derecha, las vistas en continua, las ocultas a
 * trazos y los ejes de trazo y punto.
 *
 *   node scripts/vistas-svg.mjs [pieza.yaml] [salida.svg]
 *
 * Sin pieza, la de la espiga (tests/vistas/piezas/ri-v1.yaml). Sin salida,
 * el SVG va a la salida estándar. Por la de errores sale lo que el motor
 * descarta con su motivo, que es el catálogo de errores (§3.5).
 *
 * No escribe nada en el repositorio: es para revisar. Lo que se publicará lo
 * escribirá `scripts/vistas.mjs`, con la colección `piezas`, en la segunda
 * parte de M1.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { compilaPieza } from '../src/lib/vistas/pieza.ts';
import { calculaVistas } from '../src/lib/vistas/motor.ts';
import { describePieza, svgDeVistas } from '../src/lib/vistas/dibujo.ts';

const ESPIGA = fileURLToPath(new URL('../tests/vistas/piezas/ri-v1.yaml', import.meta.url));
const [entrada = ESPIGA, salida] = process.argv.slice(2);

const pieza = compilaPieza(yaml.load(readFileSync(entrada, 'utf8')));
const vistas = calculaVistas(pieza);
const id = `vistas-${pieza.codigo.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
const svg = svgDeVistas(vistas, { id, descripcion: `${describePieza(pieza)}: alzado, planta y perfil izquierdo, en el sistema europeo.` });

if (salida) writeFileSync(salida, `${svg}\n`, 'utf8');
else process.stdout.write(`${svg}\n`);

for (const [nombre, v] of Object.entries(vistas.vistas)) {
  for (const d of v.descartes) process.stderr.write(`${nombre}: ${d.motivo} — ${d.mensaje}\n`);
}
