const BASE = import.meta.env.BASE_URL;

/** Construye una ruta interna respetando el `base` del despliegue.
 *  Nunca escribas un href a mano: en local funciona y en Pages se rompe. */
export function ruta(camino = ''): string {
  const limpio = camino.replace(/^\/+/, '');
  const completo = `${BASE}/${limpio}`.replace(/\/{2,}/g, '/');
  return completo.endsWith('/') ? completo : `${completo}/`;
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
