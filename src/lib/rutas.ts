const BASE = import.meta.env.BASE_URL;

/** Construye una ruta interna respetando el `base` del despliegue.
 *  Nunca escribas un href a mano: en local funciona y en Pages se rompe. */
export function ruta(camino = ''): string {
  const limpio = camino.replace(/^\/+/, '');
  const completo = `${BASE}/${limpio}`.replace(/\/{2,}/g, '/');
  return completo.endsWith('/') ? completo : `${completo}/`;
}
