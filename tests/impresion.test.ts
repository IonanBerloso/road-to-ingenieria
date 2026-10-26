/**
 * La tinta de papel de tokens.css tiene que ganar en papel, en los dos temas.
 *
 * Hasta el 26 de octubre de 2026 no ganaba en ninguno: el bloque de impresión
 * iba con el selector `html`, que pesa (0,0,1), y perdía contra `:root` y
 * `[data-theme="oscuro"]`, que pesan (0,1,0). En claro se imprimía con los
 * colores de pantalla; en oscuro, con la tinta clara del tema sobre el papel
 * blanco, porque los navegadores tiran los fondos al imprimir. Lo vio el
 * revisor del laboratorio de Materiales el 29 de septiembre de 2026.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const CSS = readFileSync('src/styles/tokens.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, (c) =>
  c.replace(/[^\n]/g, ' '),
);

/** Los preámbulos de los bloques que envuelven la posición `i`, de fuera adentro. */
function envoltorios(css: string, i: number): string[] {
  const pila: string[] = [];
  let desde = 0;
  for (let k = 0; k < i; k++) {
    if (css[k] === '{') {
      pila.push(css.slice(desde, k).trim());
      desde = k + 1;
    } else if (css[k] === '}') {
      pila.pop();
      desde = k + 1;
    } else if (css[k] === ';') {
      desde = k + 1;
    }
  }
  return pila;
}

/** Especificidad de un selector compuesto sin combinadores: [id, clase, tipo]. */
function especificidad(selector: string): [number, number, number] {
  const sinAtributos = selector.replace(/\[[^\]]*\]/g, '');
  return [
    (selector.match(/#[\w-]+/g) ?? []).length,
    (selector.match(/\.[\w-]+|\[[^\]]*\]|:(?!:)[\w-]+/g) ?? []).length,
    (sinAtributos.match(/^[a-z][\w-]*/i) ?? []).length,
  ];
}

const pesaMas = (a: number[], b: number[]) => {
  for (let k = 0; k < 3; k++) if (a[k] !== b[k]) return a[k] > b[k];
  return false;
};

describe('impresión · la tinta de papel gana en los dos temas', () => {
  it('el tema oscuro no se aplica en papel', () => {
    const i = CSS.indexOf('\n[data-theme="oscuro"] {');
    expect(i, 'no encuentro el bloque del tema oscuro').toBeGreaterThan(0);
    expect(envoltorios(CSS, i + 1)).toEqual(['@media not print']);
  });

  it('el bloque de impresión pesa más que :root', () => {
    const i = CSS.indexOf('--paper: #FFFFFF;');
    expect(i, 'no encuentro la tinta de papel').toBeGreaterThan(0);
    const [media, selector] = envoltorios(CSS, i);
    expect(media).toBe('@media print');
    expect(
      pesaMas(especificidad(selector), especificidad(':root')),
      `«${selector}» pesa ${especificidad(selector)} y :root pesa 0,1,0`,
    ).toBe(true);
  });

  it('la especificidad se cuenta bien', () => {
    expect(especificidad(':root')).toEqual([0, 1, 0]);
    expect(especificidad('html')).toEqual([0, 0, 1]);
    expect(especificidad('html[lang]')).toEqual([0, 1, 1]);
    expect(especificidad('[data-theme="oscuro"]')).toEqual([0, 1, 0]);
  });
});
