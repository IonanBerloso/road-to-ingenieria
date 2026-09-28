/* Estados en el lenguaje de la pizarra (brief Pizarra, §06): honestos y sin
 * jerga de obra. «Entera» solo lo dice el catálogo, nunca una página.
 *
 * Cada estado dice lo mismo en dos sitios y con dos longitudes: `corta` en la
 * fila de la lista de la portada, `larga` en el rótulo de tiza de la banda del
 * detalle (brief §5b) y en la página de la asignatura. Estaban en dos tablas
 * separadas por cuatro líneas, y había una tercera copia todavía peor: la fila
 * de una asignatura `ok` llevaba la palabra «entera» escrita a mano dentro de
 * una plantilla. Una tabla, tres usos (§01, hecho el 15 de septiembre de 2026).
 *
 * Vivía en `pages/index.astro` y se mudó aquí el 28 de septiembre de 2026,
 * cuando la página de la asignatura (fase E2) la necesitó también: un
 * componente de página no se puede importar desde otra. */
export const ESTADO = {
  ok: { corta: 'entera', larga: 'asignatura entera' },
  obra: { corta: 'la estamos escribiendo', larga: 'la estamos escribiendo' },
  prev: { corta: 'aún no', larga: 'aún no' },
} as const;
