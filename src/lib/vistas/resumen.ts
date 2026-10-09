/**
 * El resumen (sha-256) de una pieza y del motor de vistas, y dónde viven sus
 * ficheros: lo que necesitan `scripts/vistas.mjs` para escribir las vistas,
 * el esquema de las colecciones `piezas` y `vistas` para comprobarlas, y
 * `tests/vistas/al-dia.test.ts` para recalcularlas.
 *
 * Lee el disco, así que no lo importa ninguna página: solo el build, los
 * guiones y los tests, que corren en Node.
 *
 * LA PIEZA SE RESUME POR SU TEXTO, con los finales de línea en LF, y no por
 * sus datos. Así que cualquier cambio del fichero —un comentario, un espacio,
 * el orden de las claves, una nota de `revision`— deja sus vistas «atrasadas»
 * aunque la pieza sea la misma, y el build pide `npm run vistas` (medio
 * segundo por pieza). Se aceptó así en la revisión del 9 de octubre de 2026:
 * es barato, no se equivoca nunca hacia el lado peligroso (unas vistas viejas
 * dadas por buenas) y el esquema no necesita leer YAML para comprobarlo.
 *
 * EL MOTOR SE RESUME POR SU CÓDIGO: `pieza.ts` y `motor.ts` y lo que ellos
 * importan para correr, siguiendo los `import` relativos que no son solo de
 * tipos, y `publicadas.ts`, que decide lo que se escribe (las cifras que se
 * guardan, `DECIMALES`, y la forma del JSON). Así entra un fichero nuevo del
 * motor el día que se importe, y no entran `dibujo.ts`, `figura.ts`, este
 * fichero ni los esquemas, que no cambian lo publicado. No hay número de
 * versión que subir a mano: el que se olvida de subirlo es el que publica
 * unas vistas de un motor que ya no existe.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { idDePieza, type Resumen } from './publicadas.ts';

/** Dónde empieza el motor: lo que llama `scripts/vistas.mjs` para calcular
 *  y para escribir. `publicadas.ts` entra desde la revisión del 9 de octubre
 *  de 2026: cambiar `DECIMALES` cambiaba lo publicado sin cambiar el resumen. */
const ENTRADAS_DEL_MOTOR = ['pieza.ts', 'motor.ts', 'publicadas.ts'];

export const CARPETA_DEL_MOTOR = ['src', 'lib', 'vistas'];
export const CARPETA_DE_PIEZAS = ['src', 'content', 'piezas'];
export const CARPETA_DE_VISTAS = ['src', 'content', 'vistas'];

/** El sha-256 de un texto, en hexadecimal, con los finales de línea en LF:
 *  la misma pieza da el mismo resumen en Windows y en el CI. */
export const resumenDeTexto = (texto: string): string => createHash('sha256').update(texto.replace(/\r\n/g, '\n'), 'utf8').digest('hex');

/** Los `import` de un fichero que corren: los relativos, sin los `import
 *  type`. Un `import { a, type B }` corre, y cuenta. */
export function importados(texto: string): string[] {
  const r: string[] = [];
  const conNombres = /^(?:import|export)\s+(type\s+)?(?:\{[^}]*\}|\*(?:\s+as\s+\w+)?|\w+(?:\s*,\s*\{[^}]*\})?)\s+from\s+'(\.[^']+)'/gm;
  for (const m of texto.matchAll(conNombres)) if (!m[1]) r.push(m[2]);
  for (const m of texto.matchAll(/^import\s+'(\.[^']+)'/gm)) r.push(m[1]);
  return r;
}

/** Los ficheros del motor, relativos a la raíz del repositorio y en orden:
 *  `pieza.ts`, `motor.ts` y lo que importan para correr. */
export function ficherosDelMotor(raiz: string): string[] {
  const carpeta = join(raiz, ...CARPETA_DEL_MOTOR);
  const vistos = new Set<string>();
  const pendientes = ENTRADAS_DEL_MOTOR.map((f) => join(carpeta, f));
  while (pendientes.length) {
    const f = resolve(pendientes.pop() as string);
    if (vistos.has(f)) continue;
    if (!existsSync(f)) throw new Error(`el motor de vistas importa ${relative(raiz, f)}, que no existe`);
    vistos.add(f);
    for (const i of importados(readFileSync(f, 'utf8'))) pendientes.push(join(dirname(f), i));
  }
  return [...vistos].map((f) => relative(raiz, f).split('\\').join('/')).sort();
}

/** El resumen del motor: cada fichero con su ruta delante, en orden. */
export function resumenDelMotor(raiz: string): string {
  const texto = ficherosDelMotor(raiz)
    .map((f) => `${f}\n${readFileSync(join(raiz, f), 'utf8').replace(/\r\n/g, '\n')}`)
    .join('\n');
  return resumenDeTexto(texto);
}

export const rutaDePieza = (raiz: string, id: string): string => join(raiz, ...CARPETA_DE_PIEZAS, `${id}.yaml`);
export const rutaDeVistas = (raiz: string, id: string): string => join(raiz, ...CARPETA_DE_VISTAS, `${id}.json`);

/** El texto de la pieza con ese id, o null si no hay fichero. */
export function textoDePieza(raiz: string, id: string): string | null {
  const f = rutaDePieza(raiz, id);
  return existsSync(f) ? readFileSync(f, 'utf8') : null;
}

/** El resumen guardado en las vistas publicadas de ese id, o null si no
 *  hay fichero o no se puede leer. */
export function resumenGuardado(raiz: string, id: string): Resumen | null {
  const f = rutaDeVistas(raiz, id);
  if (!existsSync(f)) return null;
  try {
    const r = (JSON.parse(readFileSync(f, 'utf8')) as { resumen?: Resumen }).resumen;
    return r && typeof r.pieza === 'string' && typeof r.motor === 'string' ? r : null;
  } catch {
    return null;
  }
}

/** El resumen de hoy de una pieza por su código: el de su texto y el del
 *  motor. Null si la pieza no tiene fichero con ese nombre. */
export function resumenDeHoy(raiz: string, codigo: string, motor = resumenDelMotor(raiz)): Resumen | null {
  const texto = textoDePieza(raiz, idDePieza(codigo));
  return texto === null ? null : { pieza: resumenDeTexto(texto), motor };
}
