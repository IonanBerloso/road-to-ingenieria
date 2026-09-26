/**
 * El servidor de vista previa de los guiones que abren el sitio en un
 * navegador. Una sola vez, para todos.
 *
 * POR QUÉ ES UN FICHERO. Hasta el 26 de septiembre de 2026 cinco guiones
 * —`humo`, `humo-todo`, `contraste`, `peso` y `comprueba-simuladores`—
 * levantaban `astro preview` cada uno a su manera, y el `base` del sitio se
 * leía de tres formas: importando el `astro.config` (humo), buscándolo con
 * una expresión regular en su texto (contraste) y escrito a mano (peso y
 * comprueba-simuladores). Es la Regla 0 (§01) en los propios guardianes:
 * el día que cambie el `base`, dos de ellos habrían medido páginas 404 sin
 * CSS — que es exactamente el error que llevó a medir «344 px de ancho de
 * texto» el 17 de septiembre sobre una página sin estilos.
 *
 * Lo que hace, y por qué cada cosa:
 *
 *   · **para antes cualquier `astro preview` que haya quedado de fondo.** Es
 *     un demonio y sobrevive al guion que lo lanzó; con uno vivo, el nuevo no
 *     arranca y el mensaje no dice por qué (§17);
 *   · **espera a que responda** antes de devolver, hasta treinta segundos;
 *   · con `fuera: true` **no levanta nada** y usa el que ya haya en el
 *     puerto: es lo que hace `humo-todo` con sus tandas, que comparten uno.
 *
 * Y lo que NO resuelve, y conviene saber: dos guiones que levantan servidor
 * no pueden correr a la vez, porque cada uno para el del otro al arrancar.
 * Pasó el 24 de septiembre de 2026 con el humo y el suelo en paralelo.
 */
import { spawn, spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ASTRO = join(ROOT, 'node_modules', 'astro', 'bin', 'astro.mjs');

/** El `base` del sitio, sin barra final, leído del propio `astro.config`. */
export const BASE = (await import('../astro.config.mjs')).default.base.replace(/\/$/, '');

/** Para cualquier `astro preview` que haya quedado de fondo, en cualquier puerto. */
export function paraPreview() {
  spawnSync(process.execPath, [ASTRO, 'preview', 'stop'], { cwd: ROOT, stdio: 'ignore' });
}

/**
 * Levanta la vista previa en `puerto` y espera a que responda.
 *
 * @param {{ puerto: number, fuera?: boolean }} opciones
 * @returns {Promise<{ origen: string, para: () => void }>} el origen con el
 *   `base` ya puesto, y la función que lo apaga (no hace nada si era de fuera)
 */
export async function levanta({ puerto, fuera = false }) {
  const origen = `http://localhost:${puerto}${BASE}`;
  let hijo = null;
  if (!fuera) {
    paraPreview();
    hijo = spawn(process.execPath, [ASTRO, 'preview', '--port', String(puerto)], {
      cwd: ROOT,
      stdio: 'ignore',
    });
  }
  const para = () => {
    if (fuera) return;
    hijo?.kill();
    paraPreview();
  };
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(`${origen}/`)).ok) return { origen, para };
    } catch { /* todavía no */ }
    await new Promise((r) => setTimeout(r, 500));
  }
  para();
  throw new Error(
    `El servidor de vista previa no responde en ${origen} tras 30 s. ` +
      (fuera
        ? 'Se esperaba uno levantado por fuera, y no lo hay.'
        : '¿Hay otro «astro preview» de fondo? Míralo con: node node_modules/astro/bin/astro.mjs preview status'),
  );
}
