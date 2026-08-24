import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

/**
 * La ÚNICA declaración de la tubería de Markdown del proyecto.
 *
 * La importan dos sitios y por eso vive aquí: `astro.config.mjs`, para el MDX
 * de los temas, y `mate()` de abajo, para los textos que viven en
 * `ejercicios.yaml`. Si estuviera declarada dos veces, el día que se cambie una
 * opción el YAML y el MDX empezarían a renderizar distinto sin que nadie avise.
 *
 * Salida HTML + MathML generada en el build (CLAUDE.md §07): sin JavaScript en
 * cliente, imprimible, legible por lectores de pantalla y sin CDN.
 *
 * `htmlAndMathml` y no `mathml` a secas. Con MathML puro, el dibujo de la
 * fórmula depende de la fuente matemática que tenga instalada cada alumno, y
 * eso rompió dos cosas básicas: la raíz de $\sqrt3$ desaparecía y la barra del
 * conjugado no se dibujaba —$\overline{z}$ se leía como $z$, que es justo lo
 * contrario—. KaTeX dibuja la fórmula con sus propias fuentes, autoalojadas, y
 * añade el MathML detrás para los lectores de pantalla. Se ve igual en
 * cualquier máquina.
 */
export const procesador = () =>
  unified({
    remarkPlugins: [remarkMath],
    rehypePlugins: [[rehypeKatex, { output: 'htmlAndMathml' }]],
  });

/** Un solo renderizador para todo el build; crearlo por llamada es caro. */
let renderizador;

/**
 * Convierte un texto de `ejercicios.yaml` —Markdown con LaTeX entre `$`— en
 * HTML con MathML. Los ejercicios son DATOS (§04): su prosa no pasa por el
 * pipeline de MDX, así que la pasamos por aquí.
 *
 * ## El prefijo, y por qué hace falta
 *
 * Astro inyecta `rehypeHeadingIds` en toda tubería de Markdown, aunque no
 * aparezca arriba, y ese plugin crea **un `github-slugger` nuevo por cada
 * llamada a `render()`**. Como aquí se renderiza un campo por llamada, cada
 * campo empieza a numerar desde cero: las treinta resoluciones que titulan un
 * apartado «Resultado» producen treinta `id="resultado"` en la misma página.
 * Medido el 23 de agosto de 2026: **309 ids repetidos en el sitio**, 66 solo
 * en la página de complejos. No los enlaza nadie, pero un lector de pantalla
 * que navegue por encabezados ve veintinueve destinos con el mismo nombre.
 *
 * La segunda causa es distinta y el prefijo la arregla igual: en las páginas
 * de examen el mismo enunciado se dibuja dos veces —en la hoja y dentro del
 * ejercicio guiado—, así que los ids de sus figuras SVG salían por duplicado.
 *
 * Se prefijan los `id`, y con ellos las referencias que los usan
 * (`aria-labelledby`, los `href="#…"` internos y los `url(#…)` de SVG), o el
 * prefijo rompería lo que viene a arreglar.
 *
 * Los `url(#…)` faltaban, y se añaden el 25 de agosto de 2026. Es la forma en
 * que un SVG apunta a un `clipPath`, a un `pattern` o a un degradado suyo, y
 * al renombrarse el id sin renombrar la referencia el recorte deja de
 * aplicarse: el relleno se sale del marco de la gráfica. Estaba pasando en
 * tres exámenes publicados —2019-2020-3ev, 2020-2021-3ev y 2025-2026-4ev— con
 * el build en verde, porque un `url(#…)` que no apunta a nada no es un error
 * de HTML: simplemente no hace nada.
 *
 * @param {string | undefined} texto
 * @param {string} [prefijo] Identificador único del contenedor, sin guion final.
 * @returns {Promise<string>} HTML listo para `set:html`
 */
export async function mate(texto, prefijo) {
  if (!texto) return '';
  renderizador ??= await procesador().createRenderer({});
  const { code } = await renderizador.render(pegaElSvg(texto));
  return prefijo ? prefija(code, prefijo) : code;
}

/**
 * Quita las líneas en blanco de dentro de un `<svg>`.
 *
 * En Markdown, **una línea en blanco cierra un bloque de HTML crudo**. Un SVG
 * escrito con sus grupos separados por un renglón —que es como se escribe un
 * SVG legible— deja de ser un bloque y pasa a ser varios: el analizador cierra
 * el `<svg>` por su cuenta en el primer hueco, y todo lo que venía detrás
 * queda **fuera** de él. Un `<path>` fuera de un `<svg>` no es nada: el
 * navegador lo tira y solo sobrevive el texto de las etiquetas. Si además la
 * línea siguiente va sangrada cuatro espacios, el trozo se publica como
 * bloque de código, con el marcado a la vista.
 *
 * Medido el 25 de agosto de 2026, al mirar por qué el sombreado de una figura
 * nueva se salía de su marco: **52 de las 105 figuras de examen del sitio
 * estaban rotas así**, algunas desde el día que se transcribieron. El build,
 * el esquema, `verify.mjs` y la consola del navegador, todos en verde: el HTML
 * resultante es válido, solo que no dibuja nada.
 *
 * Se arregla aquí y no en los 52 ficheros a propósito (Regla 0). El script que
 * recorriera los 52 sería la prueba de que el problema no está en ellos: nadie
 * que escriba una figura tiene por qué saber que un renglón en blanco se la
 * come. Los ficheros se quedan legibles y es la tubería la que se ocupa.
 */
const pegaElSvg = (texto) =>
  texto.replace(/<svg\b[\s\S]*?<\/svg>/g, (bloque) =>
    bloque.split('\n').filter((l) => l.trim()).join('\n'));

/** Antepone `prefijo-` a todo id del HTML y a todo lo que apunte a un id. */
function prefija(html, prefijo) {
  return html
    .replace(/\sid="([^"]+)"/g, (_, id) => ` id="${prefijo}-${id}"`)
    .replace(
      /\saria-labelledby="([^"]+)"/g,
      (_, v) => ` aria-labelledby="${v.split(/\s+/).filter(Boolean).map((x) => `${prefijo}-${x}`).join(' ')}"`,
    )
    .replace(/\shref="#([^"]+)"/g, (_, id) => ` href="#${prefijo}-${id}"`)
    .replace(/url\(#([^)"']+)\)/g, (_, id) => `url(#${prefijo}-${id})`);
}
