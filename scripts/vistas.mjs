/**
 * Calcula las vistas de cada pieza de `src/content/piezas/` y las escribe en
 * `src/content/vistas/<id>.json`, con el resumen de la pieza y del motor
 * (diseño de la fase M, §3.2, punto 8).
 *
 *     npm run vistas                    todas las piezas
 *     node scripts/vistas.mjs nyv-2-18-3   solo esas, por su id
 *
 * El motor no corre en el build: corre aquí, y el resultado se guarda como
 * las tablas de vapor (`tablas-vapor.mjs`). Hay que volver a pasarlo cuando
 * cambia una pieza o el motor, y el build lo dice: el esquema de `vistas`
 * rechaza un JSON cuyo resumen no casa, y `tests/vistas/al-dia.test.ts`
 * recalcula cada pieza y compara.
 *
 * OJO: el resumen de la pieza es el de su TEXTO (`lib/vistas/resumen.ts`).
 * Un comentario, un espacio, el orden de las claves o una nota nueva de
 * `revision` piden volver a pasar esto, aunque las vistas no cambien. Y el
 * del motor cambia con cualquier cambio de su código o de
 * `lib/vistas/publicadas.ts`, que decide lo que se escribe.
 *
 * Antes de escribir comprueba lo mismo que comprobará el build: que cada
 * pieza se llama como su código, que pasa `problemasDePieza` y que sus tres
 * vistas guardan la anchura, la altura y la profundidad (§3.8). Si algo
 * falla no escribe nada de esa pieza, y sale con error. Y dice qué JSON no
 * tiene pieza, sin borrarlo: borrar es decisión de quien lo lea.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { compilaPieza, problemasDePieza } from '../src/lib/vistas/pieza.ts';
import { calculaVistas } from '../src/lib/vistas/motor.ts';
import { idDePieza, problemasDeInvariantes, publicaVistas, textoDeVistas } from '../src/lib/vistas/publicadas.ts';
import { CARPETA_DE_PIEZAS, CARPETA_DE_VISTAS, resumenDeTexto, resumenDelMotor, rutaDeVistas } from '../src/lib/vistas/resumen.ts';

const RAIZ = fileURLToPath(new URL('..', import.meta.url));
const PIEZAS = join(RAIZ, ...CARPETA_DE_PIEZAS);
const VISTAS = join(RAIZ, ...CARPETA_DE_VISTAS);

const pedidas = process.argv.slice(2);
const todas = existsSync(PIEZAS) ? readdirSync(PIEZAS).filter((f) => f.endsWith('.yaml')).map((f) => f.replace(/\.yaml$/, '')).sort() : [];
const ids = pedidas.length ? pedidas : todas;
const desconocidas = ids.filter((id) => !todas.includes(id));
if (desconocidas.length) {
  console.error(`No hay src/content/piezas/<id>.yaml para: ${desconocidas.join(', ')}`);
  process.exit(1);
}
if (!ids.length) {
  console.log('No hay piezas en src/content/piezas/: nada que calcular.');
  process.exit(0);
}

mkdirSync(VISTAS, { recursive: true });
const motor = resumenDelMotor(RAIZ);
let fallos = 0;

for (const id of ids) {
  const texto = readFileSync(join(PIEZAS, `${id}.yaml`), 'utf8');
  /* Un fichero vacío, que no parsea o con la forma rota se dice con su
     nombre, y no como una excepción a medias (revisión del 9 de octubre de
     2026); la forma completa la comprueba el esquema de `piezas`. */
  let declarada;
  let problemas;
  try {
    declarada = yaml.load(texto);
    if (!declarada || typeof declarada !== 'object' || Array.isArray(declarada)) throw new Error('no es una pieza: el fichero está vacío o no es un objeto YAML');
    problemas = problemasDePieza(declarada);
  } catch (e) {
    console.error(`✗ ${id} (src/content/piezas/${id}.yaml): ${e.message}`);
    fallos++;
    continue;
  }
  if (idDePieza(String(declarada.codigo ?? '')) !== id) problemas.push(`el fichero se llama ${id}.yaml y su código, ${declarada.codigo}, pide ${idDePieza(String(declarada.codigo ?? ''))}.yaml`);
  if (problemas.length) {
    console.error(`✗ ${id}: ${problemas.join('; ')}`);
    fallos++;
    continue;
  }
  const t0 = performance.now();
  const calculadas = calculaVistas(compilaPieza(declarada));
  const ms = Math.round(performance.now() - t0);
  const invariantes = problemasDeInvariantes(calculadas);
  if (invariantes.length) {
    console.error(`✗ ${id}: ${invariantes.join('; ')}`);
    fallos++;
    continue;
  }
  const publicadas = publicaVistas(calculadas, { pieza: resumenDeTexto(texto), motor });
  writeFileSync(rutaDeVistas(RAIZ, id), textoDeVistas(publicadas), 'utf8');
  const cuenta = Object.entries(publicadas.vistas)
    .map(([k, v]) => `${k} ${v.tramos.filter((t) => t.tipo === 'visto').length}+${v.tramos.filter((t) => t.tipo === 'oculto').length}`)
    .join(', ');
  console.log(`✓ ${id}: ${cuenta} tramos (vistos+ocultos), en ${ms} ms`);
}

const huerfanas = existsSync(VISTAS)
  ? readdirSync(VISTAS).filter((f) => f.endsWith('.json') && !todas.includes(f.replace(/\.json$/, '')))
  : [];
if (huerfanas.length) console.warn(`· sin pieza en src/content/piezas/ (no se borran): ${huerfanas.join(', ')}`);

if (fallos) {
  console.error(`${fallos} pieza(s) sin calcular.`);
  process.exit(1);
}
