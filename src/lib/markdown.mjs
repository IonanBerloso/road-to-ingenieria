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
 * (`aria-labelledby` y los `href="#…"` internos), o el prefijo rompería lo que
 * viene a arreglar.
 *
 * @param {string | undefined} texto
 * @param {string} [prefijo] Identificador único del contenedor, sin guion final.
 * @returns {Promise<string>} HTML listo para `set:html`
 */
export async function mate(texto, prefijo) {
  if (!texto) return '';
  renderizador ??= await procesador().createRenderer({});
  const { code } = await renderizador.render(texto);
  return prefijo ? prefija(code, prefijo) : code;
}

/** Antepone `prefijo-` a todo id del HTML y a todo lo que apunte a un id. */
function prefija(html, prefijo) {
  return html
    .replace(/\sid="([^"]+)"/g, (_, id) => ` id="${prefijo}-${id}"`)
    .replace(
      /\saria-labelledby="([^"]+)"/g,
      (_, v) => ` aria-labelledby="${v.split(/\s+/).filter(Boolean).map((x) => `${prefijo}-${x}`).join(' ')}"`,
    )
    .replace(/\shref="#([^"]+)"/g, (_, id) => ` href="#${prefijo}-${id}"`);
}
