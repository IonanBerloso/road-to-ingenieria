import { SOLO, enSolo } from './edicion.mjs';

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
 *  de una sola (src/lib/edicion.mjs), la página de esa asignatura: no hay
 *  otra a la que volver. */
export function rutaInicio(): string {
  return enSolo ? ruta(SOLO) : ruta();
}

/** Adonde lleva el nombre de la asignatura en la cabecera de sus páginas:
 *  su ficha en la portada (`/#id`), o, en la edición de una sola, la propia
 *  página de la asignatura. */
export function rutaAsignatura(id: string): string {
  return enSolo ? ruta(id) : `${ruta()}#${id}`;
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
