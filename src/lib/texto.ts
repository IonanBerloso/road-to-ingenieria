/**
 * La clave con la que se compara un texto al buscar: en minúscula y sin
 * tildes, para que «entropia» encuentre lo mismo que «entropía».
 *
 * POR QUÉ ES UN FICHERO. La portada la necesita dos veces —al armar el índice
 * de la paleta en el build y al comparar lo que se teclea en el navegador— y
 * estaba escrita dos veces en `index.astro`, una en cada lado. Si un día
 * cambia una y no la otra, la búsqueda deja de encontrar sin avisar
 * (Regla 0). Unida el 26 de septiembre de 2026.
 *
 * No es la de `quimica.ts`, y no por descuido: esa **conserva las
 * mayúsculas**, porque en una fórmula `CO` es monóxido y `Co` es cobalto.
 *
 * `\p{M}`, con la barra. Sin ella el literal es `/p{M}/gu`, que no es «una
 * marca diacrítica» sino «una p seguida de un cuantificador incompleto», y el
 * navegador lo rechaza AL EVALUARLO: la primera llamada lanza y se lleva por
 * delante el guion entero. Se publicó así hasta el 15 de septiembre de 2026, y
 * lo encontró `humo.mjs` el día que se le pusieron escuchas de consola a la
 * portada.
 */
export const sinTildes = (s: string): string => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
