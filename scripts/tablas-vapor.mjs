/**
 * Escribe las tablas del agua y su vapor de Térmica en
 * `src/content/tablas/vapor-de-agua.json`: la rejilla del anexo del curso,
 * calculada con IAPWS-95 (fase F1 de la auditoría del 27 de septiembre de
 * 2026). El porqué de la formulación y de la rejilla está en
 * `src/lib/iapws95.ts` y en `src/lib/tablas-vapor.ts`.
 *
 *     node scripts/tablas-vapor.mjs
 *
 * Solo hay que volver a pasarlo si cambia la rejilla o la formulación, y
 * `tests/fisica/vapor.test.ts` avisa si el JSON publicado ya no es lo que
 * saldría de aquí.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as iapws95 from '../src/lib/iapws95.ts';
import { generaTablas } from '../src/lib/tablas-vapor.ts';

const DESTINO = fileURLToPath(new URL('../src/content/tablas/vapor-de-agua.json', import.meta.url));

const tablas = {
  asignatura: 'ingenieria-termica',
  titulo: 'Las tablas del agua y su vapor',
  ...generaTablas(iapws95, 'IAPWS-95'),
};

/* Una fila por línea: con JSON.stringify sangrado, cada número iría en la
   suya, y un cambio de una celda sería un diff de mil líneas. */
const texto = JSON.stringify(tablas, null, 2).replace(
  /\[\s+(-?[\d.e+-]+(?:,\s+-?[\d.e+-]+)*)\s+\]/g,
  (_, dentro) => `[${dentro.split(/,\s+/).join(', ')}]`,
);
writeFileSync(DESTINO, `${texto}\n`);

const celdas =
  tablas.saturacionT.filas.length + tablas.saturacionP.filas.length +
  tablas.sobrecalentado.bloques.reduce((n, b) => n + b.filas.length, 0) +
  tablas.liquido.bloques.reduce((n, b) => n + b.filas.length, 0);
console.log(`${DESTINO}: ${celdas} filas`);
