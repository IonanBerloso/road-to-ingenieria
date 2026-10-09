/**
 * La salida SVG de lib/vistas (`dibujo.ts`), con las reglas del lienzo de
 * las figuras (§17), y la convención de ocultas de la pieza.
 */
import { describe, expect, it } from 'vitest';
import { svgDeVistas } from '../../src/lib/vistas/dibujo.ts';
import { vistasDe } from './ayudas';
import { BLOQUE_TALADRADO, piezaDeLaEspiga } from './piezas';

describe('la salida SVG, para mirarla', () => {
  const svg = svgDeVistas(vistasDe(piezaDeLaEspiga()), { id: 'ri-v1' });

  it('la etiqueta de apertura en una línea, con título y descripción', () => {
    expect(svg.split('\n')[0]).toMatch(/^<svg [^>]*>$/);
    expect(svg).toMatch(/<title id="ri-v1-titulo">[^<]+<\/title>/);
    expect(svg).toMatch(/<desc id="ri-v1-desc">[^<]+<\/desc>/);
  });

  it('solo tokens: ni un color escrito a mano', () => {
    expect(svg).not.toMatch(/#[0-9a-f]{3,8}\b/i);
  });

  it('las tres clases del Taller, y nada fuera del viewBox', () => {
    expect(svg).toMatch(/class="vista"/);
    expect(svg).toMatch(/class="oculta"/);
    expect(svg).toMatch(/class="eje"/);
    const [, , w, h] = svg.match(/viewBox="([^"]+)"/)![1].split(' ').map(Number);
    const numeros = [...svg.matchAll(/ (?:x1|x2|cx|x)="(-?[\d.]+)"/g)].map((m) => Number(m[1]));
    const alturas = [...svg.matchAll(/ (?:y1|y2|cy|y)="(-?[\d.]+)"/g)].map((m) => Number(m[1]));
    expect(Math.min(...numeros)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...numeros)).toBeLessThanOrEqual(w);
    expect(Math.min(...alturas)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...alturas)).toBeLessThanOrEqual(h);
  });
});

describe('la convención de ocultas de la pieza', () => {
  const con = (ocultas: 'todas' | 'necesarias' | 'ninguna') => svgDeVistas(vistasDe({ ...BLOQUE_TALADRADO, ocultas }), { id: `ocultas-${ocultas}` });

  it('«ninguna»: no se dibuja ni una oculta, y las vistas siguen ahí', () => {
    const svg = con('ninguna');
    expect(svg).not.toMatch(/class="oculta"/);
    expect(svg).toMatch(/class="vista"/);
  });

  it('«necesarias» se dibuja como «todas» mientras no se decida cuáles lo son (§6, pregunta 2)', () => {
    const cuenta = (s: string) => (s.match(/class="oculta"/g) ?? []).length;
    expect(cuenta(con('necesarias'))).toBeGreaterThan(0);
    expect(cuenta(con('necesarias'))).toBe(cuenta(con('todas')));
  });
});
