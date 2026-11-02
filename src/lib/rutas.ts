import { enSolo } from './edicion.mjs';

const BASE = import.meta.env.BASE_URL;

/** Construye una ruta interna respetando el `base` del despliegue.
 *  Nunca escribas un href a mano: en local funciona y en Pages se rompe. */
export function ruta(camino = ''): string {
  const limpio = camino.replace(/^\/+/, '');
  const completo = `${BASE}/${limpio}`.replace(/\/{2,}/g, '/');
  return completo.endsWith('/') ? completo : `${completo}/`;
}

/** Adonde lleva el logo y «volver al principio».
 *
 *  En el sitio completo, la portada con todas las asignaturas. En la edición
 *  de una sola (src/lib/edicion.mjs), su entrada, que es esa misma página con
 *  la ficha de la asignatura abierta. */
export function rutaInicio(): string {
  return ruta();
}

/** Adonde lleva el nombre de la asignatura en la cabecera de sus páginas:
 *  su ficha en la portada (`/#id`), o la entrada de la edición de una sola,
 *  que ya es esa ficha.
 *
 *  Del 14 al 15 de octubre de 2026 tuvo un segundo caso, las asignaturas que
 *  la portada pinta solo como botón, que no tenían ficha. Desde el 15 la
 *  tienen (el porqué, en `pages/index.astro`), y el caso se fue. */
export function rutaAsignatura(id: string): string {
  return enSolo ? ruta() : `${ruta()}#${id}`;
}

/** Lo mismo, pero para un fichero de `public/`: **sin** barra final.
 *
 *  `ruta()` la añade siempre porque todas las páginas del sitio son
 *  directorios. Un PDF no lo es, y con la barra el servidor devuelve un 404
 *  que en local no se ve porque el servidor de desarrollo es más indulgente
 *  que GitHub Pages. */
export function archivo(camino: string): string {
  const limpio = camino.replace(/^\/+/, '');
  return `${BASE}/${limpio}`.replace(/\/{2,}/g, '/');
}
