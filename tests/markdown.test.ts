/**
 * La tubería de Markdown con figuras SVG dentro (`src/lib/markdown.mjs`).
 *
 * Nace el 29 de septiembre de 2026. Las figuras que dibuja
 * `scripts/figuras/lienzo.mjs` escriben la etiqueta de apertura en dos
 * renglones —el `aria-labelledby` va en el segundo—, y un `<svg>` suelto, sin
 * un `<figure>` alrededor, solo se lee como bloque de HTML crudo si su
 * etiqueta cabe entera en la primera línea. Si no, Markdown lo mete en un
 * párrafo, el `<svg>` se cierra vacío y el título, la descripción y los
 * rótulos quedan fuera, a la vista como texto. Estaba publicado así en 94 de
 * las 98 páginas con una figura en un paso `dibujar`; lo encontró un agente
 * que dibujaba las suyas en una sola línea y vio que las del resto no salían.
 */
import { describe, expect, it } from 'vitest';
import { mate } from '../src/lib/markdown.mjs';

const figura = (apertura: string) =>
  [
    apertura,
    '  <title id="f-t">Una circunferencia</title>',
    '  <desc id="f-d">Un círculo de radio uno centrado en el origen.</desc>',
    '  <circle cx="50" cy="50" r="40" />',
    '</svg>',
  ].join('\n');

describe('una figura suelta se publica entera dentro de su svg', () => {
  it('con la etiqueta de apertura en una línea', async () => {
    const html = await mate(figura('<svg viewBox="0 0 100 100" role="img" aria-labelledby="f-t f-d">'), 'x');
    expect(html).not.toMatch(/<p><svg/);
    expect(html).toMatch(/<svg[^>]*>[\s\S]*<circle[\s\S]*<\/svg>/);
  });

  it('con la etiqueta partida en dos líneas, como la escribe el lienzo', async () => {
    const html = await mate(
      figura('<svg viewBox="0 0 100 100" role="img" width="100" height="100"\n     aria-labelledby="f-t f-d">'),
      'x',
    );
    expect(html).not.toMatch(/<p><svg/);
    expect(html).not.toMatch(/<svg[^>]*><\/svg>/);
    expect(html).toMatch(/<svg[^>]*>[\s\S]*<title[\s\S]*<circle[\s\S]*<\/svg>/);
    expect(html).toContain('aria-labelledby="x-f-t x-f-d"');
  });
});
