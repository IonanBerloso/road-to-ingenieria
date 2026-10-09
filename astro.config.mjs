// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { procesador } from './src/lib/markdown.mjs';
import { enSolo, BASE_SOLO, BASE_COMPLETA, SALIDA, integracionEdicion } from './src/lib/edicion.mjs';

/**
 * Road to Ingeniería — sitio estático para GitHub Pages.
 *
 * El repositorio es ionanberloso/road-to-ingenieria, así que el sitio vive en
 * https://ionanberloso.github.io/road-to-ingenieria y `base` tiene que ser
 * /road-to-ingenieria.
 *
 * Estas dos líneas son la ÚNICA declaración de la URL del sitio: scripts/verify.mjs
 * las importa de aquí. Si algún día hay dominio propio, se cambian aquí y nada más.
 */
export default defineConfig({
  site: 'https://ionanberloso.github.io',
  base: enSolo ? BASE_SOLO : BASE_COMPLETA,
  /* La edición de una sola asignatura sale a su carpeta (src/lib/edicion.mjs). */
  outDir: `./${SALIDA}`,
  trailingSlash: 'always',

  integrations: [mdx(), integracionEdicion()],

  markdown: {
    // La tubería vive en src/lib/markdown.mjs porque los ejercicios en YAML
    // tienen que renderizar exactamente igual que el MDX (CLAUDE.md §07).
    processor: procesador(),
  },

  build: {
    inlineStylesheets: 'never',
  },
});
