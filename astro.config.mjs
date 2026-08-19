// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

/**
 * Road to Ingeniería — sitio estático para GitHub Pages.
 *
 * El repositorio es ionanberloso/2027, así que el sitio vive en
 * https://ionanberloso.github.io/2027 y `base` tiene que ser /2027.
 * Si algún día hay dominio propio, se cambian estas dos líneas y nada más.
 */
export default defineConfig({
  site: 'https://ionanberloso.github.io',
  base: '/2027',
  trailingSlash: 'always',

  integrations: [mdx()],

  markdown: {
    // MathML generado en el build: sin JavaScript en cliente, imprimible,
    // legible por lectores de pantalla y funciona sin conexión (CLAUDE.md §07).
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [[rehypeKatex, { output: 'mathml' }]],
    }),
  },

  build: {
    inlineStylesheets: 'never',
  },
});
