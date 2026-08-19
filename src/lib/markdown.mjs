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
 * Salida MathML generada en el build: sin JavaScript en cliente, imprimible y
 * legible por lectores de pantalla (CLAUDE.md §07).
 */
export const procesador = () =>
  unified({
    remarkPlugins: [remarkMath],
    rehypePlugins: [[rehypeKatex, { output: 'mathml' }]],
  });

/** Un solo renderizador para todo el build; crearlo por llamada es caro. */
let renderizador;

/**
 * Convierte un texto de `ejercicios.yaml` —Markdown con LaTeX entre `$`— en
 * HTML con MathML. Los ejercicios son DATOS (§04): su prosa no pasa por el
 * pipeline de MDX, así que la pasamos por aquí.
 *
 * @param {string | undefined} texto
 * @returns {Promise<string>} HTML listo para `set:html`
 */
export async function mate(texto) {
  if (!texto) return '';
  renderizador ??= await procesador().createRenderer({});
  const { code } = await renderizador.render(texto);
  return code;
}
