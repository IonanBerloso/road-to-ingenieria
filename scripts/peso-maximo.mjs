/**
 * El listón de peso de una página de estudio: **ningún HTML de tema ni de
 * bloque de ejercicios pasa de 3 MB** (fase E4 de la auditoría del 27 de
 * septiembre de 2026).
 *
 * El número no es por la red —GitHub Pages sirve con gzip y el HTML de KaTeX
 * comprime al 3 %, lo cuenta `peso.mjs`—, sino por lo que el teléfono tiene
 * que construir: la página del tema 5 de Cálculo pesaba 11,5 MB, eran 110.000
 * nodos y tardaba unos siete segundos en estar lista con la CPU a un cuarto.
 *
 * `verify.mjs` lo exige en cada build y `peso.mjs` lo marca al medir. Vive
 * aquí para que sea un solo número en un solo sitio (§01).
 */
export const PESO_MAXIMO = 3 * 1024 * 1024;

/** Las páginas a las que se exige: la de cada tema, la de cada bloque de
 *  ejercicios y la de sus cuestiones (fase E3), dadas como ruta dentro de
 *  `dist/` o como URL sin base. Las demás —rutas de estudio, exámenes— se
 *  avisan y no se paran: el encargo era de tema, y una ruta que incrusta
 *  ejercicios es otra decisión. */
export const esDeEstudio = (camino) =>
  /(^|\/)[a-z-]+\/t\d{2}-[^/]+\/(ejercicios\/\d+\/|cuestiones\/)?(index\.html)?$/.test(camino);
