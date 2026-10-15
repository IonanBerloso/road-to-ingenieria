/**
 * El plan por días de una ruta: qué hacer si te quedan uno, dos o tres días.
 *
 * Se pidió el 15 de octubre de 2026, cuatro días antes de la 1.ª evaluación
 * de Cálculo. Lo que más importa probar aquí no es la página, sino que los
 * planes sean coherentes entre sí: si algo entra en el plan de un día, es
 * porque es lo que más rinde, y entonces tiene que entrar también en el de
 * dos y en el de tres. Un plan largo que se olvida de lo que el corto pone
 * primero es un plan que se contradice, y nadie lo vería mirando uno solo.
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { describe, expect, it } from 'vitest';
import { destinoDelPaso, diasDichos, diasEnTitulo } from '../src/lib/plan';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');

describe('diasEnTitulo() y diasDichos()', () => {
  it('nombra cada plan con su número en letra', () => {
    expect(diasEnTitulo(1)).toBe('Un día');
    expect(diasEnTitulo(2)).toBe('Dos días');
    expect(diasEnTitulo(3)).toBe('Tres días');
  });

  it('dice los planes que hay en una frase, en orden', () => {
    expect(diasDichos([3, 1, 2])).toBe('uno, dos o tres días');
    expect(diasDichos([1, 3])).toBe('uno o tres días');
    expect(diasDichos([1])).toBe('un día');
    expect(diasDichos([2])).toBe('dos días');
  });
});

describe('destinoDelPaso()', () => {
  const donde = {
    ruta: 'prueba-1ev',
    deLaRuta: '/r/',
    bloques: [
      { id: 'regiones', titulo: 'Regiones', escalones: [{ id: 'traducir', titulo: 'Traducir' }] },
      { id: 'enteros', titulo: 'Los exámenes enteros' },
    ],
    examenes: [{ curso: '2026-2027', convocatoria: 'simulacro-primera-a', titulo: 'Simulacro A', href: '/ex/a/' }],
    antesDeEntrar: '/r/antes-de-entrar/',
  };

  it('lleva un escalón a su ancla en la ruta', () => {
    expect(destinoDelPaso({ escalon: 'traducir' }, donde)).toEqual({
      rotulo: 'escalón',
      titulo: 'Traducir',
      href: '/r/#esc-traducir',
    });
  });

  it('lleva un bloque, un examen y la hoja de antes de entrar a su sitio', () => {
    expect(destinoDelPaso({ bloque: 'regiones' }, donde)?.href).toBe('/r/#regiones');
    expect(destinoDelPaso({ examen: { curso: '2026-2027', convocatoria: 'simulacro-primera-a' } }, donde)?.href).toBe('/ex/a/');
    expect(destinoDelPaso({ antesDeEntrar: true }, donde)?.href).toBe('/r/antes-de-entrar/');
  });

  it('un paso sin destino es solo texto', () => {
    expect(destinoDelPaso({}, donde)).toBeNull();
  });

  it('rompe si el destino no existe, en vez de enlazar a la nada', () => {
    expect(() => destinoDelPaso({ escalon: 'no-esta' }, donde)).toThrow(/escalón "no-esta"/);
    expect(() => destinoDelPaso({ bloque: 'no-esta' }, donde)).toThrow(/bloque "no-esta"/);
    expect(() => destinoDelPaso({ examen: { curso: '2020-2021', convocatoria: 'primera' } }, donde)).toThrow(/examen/);
    expect(() => destinoDelPaso({ antesDeEntrar: true }, { ...donde, antesDeEntrar: null })).toThrow(/antes de entrar/);
  });
});

type Paso = { texto: string; bloque?: string; escalon?: string; examen?: { convocatoria: string }; antesDeEntrar?: true };
type Ruta = {
  plan: { opciones: { dias: number; jornadas: { titulo: string; pasos: Paso[] }[] }[] };
  bloques: { id: string; escalones?: { id: string }[] }[];
};

describe('el plan de la primera evaluación de Cálculo', () => {
  const r = yaml.load(readFileSync(join(RAIZ, 'src/content/preparar/calculo-1ev.yaml'), 'utf8')) as Ruta;
  const opciones = [...r.plan.opciones].sort((a, b) => a.dias - b.dias);
  const pasos = (o: Ruta['plan']['opciones'][number]) => o.jornadas.flatMap((j) => j.pasos);

  /** Los escalones que un plan cubre: los que nombra, y todos los de los
   *  bloques que nombra enteros. */
  const cubre = (o: Ruta['plan']['opciones'][number]) =>
    new Set(
      pasos(o).flatMap((p) => {
        if (p.escalon) return [p.escalon];
        if (p.bloque) return (r.bloques.find((b) => b.id === p.bloque)?.escalones ?? []).map((e) => e.id);
        return [];
      }),
    );

  it('tiene los planes de uno, dos y tres días que se pidieron', () => {
    expect(opciones.map((o) => o.dias)).toEqual([1, 2, 3]);
  });

  it('lo que entra con menos días entra también con más', () => {
    for (let i = 1; i < opciones.length; i++) {
      const largo = cubre(opciones[i]);
      const faltan = [...cubre(opciones[i - 1])].filter((e) => !largo.has(e));
      expect(faltan, `el plan de ${opciones[i].dias} días se deja lo que pone el de ${opciones[i - 1].dias}`).toEqual([]);
    }
  });

  it('cada plan pasa por los cuatro huecos del examen', () => {
    const huecos = ['regiones', 'segundo-de-complejos', 'demostracion-de-sucesiones', 'series'];
    for (const o of opciones) {
      const suyos = cubre(o);
      for (const h of huecos) {
        const escalones = (r.bloques.find((b) => b.id === h)?.escalones ?? []).map((e) => e.id);
        expect(escalones.some((e) => suyos.has(e)), `el plan de ${o.dias} días no toca ${h}`).toBe(true);
      }
    }
  });

  it('cada plan hace el simulacro A entero y acaba en la hoja de antes de entrar', () => {
    for (const o of opciones) {
      expect(pasos(o).some((p) => p.examen?.convocatoria === 'simulacro-primera-a')).toBe(true);
      expect(pasos(o).at(-1)?.antesDeEntrar).toBe(true);
    }
  });
});
