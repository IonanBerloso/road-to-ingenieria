/**
 * La figura de unas vistas publicadas (`lib/vistas/figura.ts`), lo que pinta
 * `components/patrones/Vistas.astro`: las reglas del lienzo (§17) —nada
 * fuera del `viewBox`, ids con prefijo, título y descripción desde la
 * pieza— y el sitio de cada vista en el sistema europeo, para una figura de
 * prosa y para la opción de un `reconocer`.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';
import { describe, expect, it } from 'vitest';
import { describePieza } from '../../src/lib/vistas/dibujo.ts';
import { figuraDeVistas, puntosDeElemento, type FiguraDeVistas } from '../../src/lib/vistas/figura.ts';
import { compilaPieza, type PiezaDeclarada } from '../../src/lib/vistas/pieza.ts';
import type { VistasPublicadas } from '../../src/lib/vistas/publicadas.ts';

const ID = 'nyv-2-18-3';
const raiz = process.cwd();
const vistas = JSON.parse(readFileSync(join(raiz, 'src', 'content', 'vistas', `${ID}.json`), 'utf8')) as VistasPublicadas;
const pieza = describePieza(compilaPieza(yaml.load(readFileSync(join(raiz, 'src', 'content', 'piezas', `${ID}.yaml`), 'utf8')) as PiezaDeclarada));

/** Cada número que acaba en el marcado, dentro del marco. */
function dentroDelMarco(f: FiguraDeVistas): string[] {
  const fuera: string[] = [];
  for (const g of f.grupos) {
    for (const e of g.elementos) {
      for (const [x, y] of puntosDeElemento(e)) if (x < 0 || y < 0 || x > f.ancho || y > f.alto) fuera.push(`${g.vista} ${e.el} (${x}, ${y})`);
    }
    if (g.rotulo && (g.rotulo.x < 0 || g.rotulo.y - g.rotulo.tamano < 0 || g.rotulo.y > f.alto)) fuera.push(`rótulo ${g.rotulo.texto}`);
  }
  return fuera;
}

const lineaDe = (f: FiguraDeVistas, vista: string) => f.grupos.find((g) => g.vista === vista)!;
const xs = (f: FiguraDeVistas, vista: string) =>
  lineaDe(f, vista)
    .elementos.filter((e) => e.el === 'line' && e.clase === 'vista')
    .flatMap((e) => (e.el === 'line' ? [e.x1, e.x2] : []));
const ys = (f: FiguraDeVistas, vista: string) =>
  lineaDe(f, vista)
    .elementos.filter((e) => e.el === 'line' && e.clase === 'vista')
    .flatMap((e) => (e.el === 'line' ? [e.y1, e.y2] : []));

describe('la figura de prosa: las tres vistas', () => {
  const f = figuraDeVistas(vistas, pieza, { prefijo: 't08-fig1' });

  it('no se sale del viewBox, tampoco un rótulo', () => {
    expect(dentroDelMarco(f)).toEqual([]);
    expect(f.grupos.map((g) => g.rotulo?.texto)).toEqual(['ALZADO', 'PLANTA', 'PERFIL IZQUIERDO']);
  });

  it('pone la planta debajo del alzado con su anchura, y el perfil a la derecha con su altura', () => {
    const [alzX, plaX, perX] = [xs(f, 'alzado'), xs(f, 'planta'), xs(f, 'perfil')];
    const [alzY, plaY, perY] = [ys(f, 'alzado'), ys(f, 'planta'), ys(f, 'perfil')];
    expect(Math.min(...plaX)).toBeCloseTo(Math.min(...alzX), 1);
    expect(Math.max(...plaX)).toBeCloseTo(Math.max(...alzX), 1);
    expect(Math.min(...plaY)).toBeGreaterThan(Math.max(...alzY));
    /* La altura: el canto de abajo de la base, y el de arriba (z = 8), a la
       misma y en el alzado y en el perfil. */
    expect(Math.max(...perY)).toBeCloseTo(Math.max(...alzY), 1);
    const horizontales = (v: string) => new Set(lineaDe(f, v).elementos.flatMap((e) => (e.el === 'line' && e.clase === 'vista' && e.y1 === e.y2 ? [e.y1] : [])));
    const comunes = [...horizontales('alzado')].filter((y) => horizontales('perfil').has(y));
    expect(comunes.length).toBeGreaterThanOrEqual(2);
    expect(Math.min(...perX)).toBeGreaterThan(Math.max(...alzX));
  });

  it('lleva los ids con su prefijo, y título y descripción desde la pieza', () => {
    expect([f.idTitulo, f.idDesc]).toEqual(['t08-fig1-t', 't08-fig1-d']);
    expect(f.titulo).toBe('Alzado, planta y perfil izquierdo de la pieza NyV-2.18-3');
    expect(f.desc).toMatch(/^La pieza NyV-2\.18-3, hecha de base, .*nervio, con taladro izquierdo, taladro derecho y taladro del buje\. /);
    expect(f.desc).toMatch(/la planta debajo del alzado y el perfil izquierdo a su derecha/);
    expect(f.desc).toMatch(/las ocultas a trazos/);
  });

  it('dibuja las ocultas debajo de las vistas, y los ejes debajo de todo', () => {
    for (const g of f.grupos) {
      const orden = g.elementos.map((e) => e.clase);
      const ultimoEje = orden.lastIndexOf('eje');
      const primeraOculta = orden.indexOf('oculta');
      const ultimaOculta = orden.lastIndexOf('oculta');
      const primeraVista = orden.indexOf('vista');
      if (ultimoEje >= 0 && primeraOculta >= 0) expect(ultimoEje).toBeLessThan(primeraOculta);
      if (ultimaOculta >= 0) expect(ultimaOculta).toBeLessThan(primeraVista);
    }
  });

  it('el tamaño en pantalla es el viewBox por la escala', () => {
    const g = figuraDeVistas(vistas, pieza, { prefijo: 'x', escala: 2 });
    expect(g.anchoPx).toBeCloseTo(g.ancho * 2, 1);
    expect(g.altoPx).toBeCloseTo(g.alto * 2, 1);
  });
});

describe('la opción de un reconocer: una vista sola, pequeña y sin rótulo', () => {
  const f = figuraDeVistas(vistas, pieza, { prefijo: 't08-ej1-op2', vistas: ['perfil'], escala: 1.5, rotulos: false });

  it('no lleva más que esa vista, y ajustada a ella', () => {
    expect(f.grupos.map((g) => g.vista)).toEqual(['perfil']);
    expect(f.grupos[0].rotulo).toBeNull();
    expect(dentroDelMarco(f)).toEqual([]);
    const e = vistas.vistas.perfil.encuadre;
    /* El ancho es el de la vista más los ejes, que sobresalen, y el margen. */
    expect(f.ancho).toBeGreaterThan(e.umax - e.umin);
    expect(f.ancho).toBeLessThan(e.umax - e.umin + 2 * 2 + 2 * 3 + 0.1);
  });

  it('su título dice qué vista es', () => {
    expect(f.titulo).toBe('Perfil izquierdo de la pieza NyV-2.18-3');
  });

  it('sin ejes no hay ningún eje', () => {
    const g = figuraDeVistas(vistas, pieza, { prefijo: 'y', vistas: ['alzado'], ejes: false });
    expect(g.grupos[0].elementos.some((e) => e.clase === 'eje')).toBe(false);
  });
});

describe('alzado y planta, sin el perfil', () => {
  const f = figuraDeVistas(vistas, pieza, { prefijo: 'z', vistas: ['planta', 'alzado'] });

  it('salen en su orden y en su sitio, aunque se pidan al revés', () => {
    expect(f.grupos.map((g) => g.vista)).toEqual(['alzado', 'planta']);
    expect(Math.min(...ys(f, 'planta'))).toBeGreaterThan(Math.max(...ys(f, 'alzado')));
    expect(dentroDelMarco(f)).toEqual([]);
  });
});

describe('una pieza sin ocultas dibujadas', () => {
  it('no lleva ninguna oculta, y lo dice', () => {
    const f = figuraDeVistas({ ...vistas, ocultas: 'ninguna' }, pieza, { prefijo: 'w' });
    expect(f.grupos.flatMap((g) => g.elementos).some((e) => e.clase === 'oculta')).toBe(false);
    expect(f.desc).not.toMatch(/ocultas/);
  });
});

describe('y lo que no se puede pedir', () => {
  it('una vista que no existe, o ninguna', () => {
    expect(() => figuraDeVistas(vistas, pieza, { prefijo: 'a', vistas: ['seccion' as 'alzado'] })).toThrow(/las vistas son alzado, planta y perfil/);
    expect(() => figuraDeVistas(vistas, pieza, { prefijo: 'a', vistas: [] })).toThrow(/las vistas son/);
  });

  it('un prefijo que no vale para un id: con espacios, con mayúsculas o vacío', () => {
    for (const prefijo of ['t08 fig1', 'T08-fig1', '', '8-fig', 'fig--1']) {
      expect(() => figuraDeVistas(vistas, pieza, { prefijo }), prefijo).toThrow(/no vale para un id/);
    }
  });

  it('una escala que no es positiva', () => {
    expect(() => figuraDeVistas(vistas, pieza, { prefijo: 'a', escala: 0 })).toThrow(/escala/);
  });
});
