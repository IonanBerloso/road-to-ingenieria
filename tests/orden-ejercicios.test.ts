/**
 * Los ejercicios de un tema se ven en orden: ejemplos, práctica por boletín y
 * número, examen (el porqué, en `src/lib/orden-ejercicios.ts`). Tres partes:
 * la regla con los casos que la hicieron falta, que el orden se aplica de
 * verdad al cargar la colección, y un barrido de todos los temas del sitio.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { describe, expect, it } from 'vitest';
import { boletinYNumero, ordenDeEjercicios, type Ordenable } from '../src/lib/orden-ejercicios';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONT = join(RAIZ, 'src', 'content');

type E = Ordenable & { id: string };
const ej = (id: string, nivel: string, fuente = ''): E => ({ id, nivel, fuente });
const ids = (l: E[]) => ordenDeEjercicios(l).map((e) => e.id);
const comp = (n: string) => `Ejercicio ${n} · Problemas complementarios, tema 1 · Cálculo, UPV/EHU`;

describe('ordenDeEjercicios()', () => {
  it('pone los ejemplos delante, la práctica después y el examen al final', () => {
    const l = [ej('p', 'practica', comp('1.1')), ej('x', 'examen'), ej('e2', 'ejemplo'), ej('e1', 'ejemplo')];
    expect(ids(l)).toEqual(['e2', 'e1', 'p', 'x']);
  });

  /* El tema 1 de Cálculo, como estaba el 15 de octubre de 2026. */
  it('ordena la práctica por número, y 1.10 va detrás de 1.9', () => {
    const l = ['1.1', '1.8', '1.13', '1.6', '1.10', '1.9', '1.7'].map((n) => ej(n, 'practica', comp(n)));
    expect(ids(l)).toEqual(['1.1', '1.6', '1.7', '1.8', '1.9', '1.10', '1.13']);
  });

  it('las letras y los pares de ejercicios caen en su número', () => {
    const l = [
      ej('2.8b', 'practica', comp('2.8b')),
      ej('2.7-y-2.8', 'practica', 'Ejercicios 2.7 y 2.8 · Problemas complementarios, tema 2 · Cálculo'),
      ej('2.8a', 'practica', comp('2.8a')),
      ej('2.10', 'practica', comp('2.10')),
    ];
    expect(ids(l)).toEqual(['2.7-y-2.8', '2.8a', '2.8b', '2.10']);
  });

  it('no mezcla dos numeraciones del mismo boletín', () => {
    const l = [
      ej('apl3', 'practica', 'Aplicaciones de la integral, problema 3 · Problemas, tema 5 · Cálculo'),
      ej('ej3', 'practica', 'Ejercicio 3 · Problemas, tema 5 · Cálculo'),
      ej('apl1', 'practica', 'Aplicaciones de la integral, problema 1 · Problemas, tema 5 · Cálculo'),
      ej('ej1', 'practica', 'Ejercicio 1 · Problemas, tema 5 · Cálculo'),
    ];
    expect(ids(l)).toEqual(['apl1', 'apl3', 'ej1', 'ej3']);
  });

  it('no separa los complementarios 1.3 de los problemas sueltos 3', () => {
    expect(boletinYNumero(comp('1.3')).boletin).not.toBe(
      boletinYNumero('Ejercicio 3 · Problemas, tema 1 · Cálculo').boletin,
    );
  });

  /* El golpe de ariete de Fluidos: la misma colección, escrita de tres maneras. */
  it('un número con capítulo agrupa por el capítulo, se escriba como se escriba el boletín', () => {
    const l = [
      ej('7.13', 'practica', 'Ejercicio 7.13 · Colección de Problemas, capítulo 7 · Mecánica de Fluidos'),
      ej('7.4', 'practica', 'Ejercicio 7.4 · Colección de problemas, capítulo 7 · Mecánica de Fluidos'),
      ej('7.6', 'practica', 'Ejercicio 7.6 · Colección de problemas de Mecánica de Fluidos, Régimen transitorio'),
    ];
    expect(ids(l)).toEqual(['7.4', '7.6', '7.13']);
  });

  it('lo que no lleva número y los de examen conservan el orden del fichero', () => {
    const l = [
      ej('propio-b', 'practica', 'Ejercicio propio · Road to Ingeniería. B'),
      ej('x2', 'examen'),
      ej('propio-a', 'practica', 'Ejercicio propio · Road to Ingeniería. A'),
      ej('x1', 'examen'),
    ];
    expect(ids(l)).toEqual(['propio-b', 'propio-a', 'x2', 'x1']);
  });

  it('no toca la lista que recibe', () => {
    const l = [ej('p', 'practica', comp('1.2')), ej('e', 'ejemplo')];
    const copia = [...l];
    ordenDeEjercicios(l);
    expect(l).toEqual(copia);
  });
});

/* El orden solo vale si la colección lo aplica: sin esto, la función podría
   seguir en verde sin que ninguna página la usara. */
describe('la colección de ejercicios sale ordenada', () => {
  it('content.config.ts ordena al cargar', () => {
    const config = readFileSync(join(RAIZ, 'src', 'content.config.ts'), 'utf8');
    const coleccion = config.slice(config.indexOf('const ejercicios = defineCollection('));
    const hasta = coleccion.slice(0, coleccion.indexOf('\n});') + 4);
    expect(hasta).toMatch(/\.transform\(\(f\) => \(\{ \.\.\.f, ejercicios: ordenDeEjercicios\(f\.ejercicios\) \}\)\)/);
  });
});

function ejercicios(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) return ejercicios(p);
    return n === 'ejercicios.yaml' ? [p] : [];
  });
}

describe('todos los temas del sitio, ya ordenados', () => {
  const ficheros = ejercicios(CONT).map((f) => ({
    f: relative(RAIZ, f),
    lista: (yaml.load(readFileSync(f, 'utf8')) as { ejercicios: E[] }).ejercicios,
  }));
  const NIVEL: Record<string, number> = { ejemplo: 0, practica: 1, examen: 2 };

  it('hay temas que mirar', () => {
    expect(ficheros.length).toBeGreaterThan(50);
  });

  it('ningún tema enseña un ejemplo detrás de la práctica, ni práctica detrás del examen', () => {
    const malos = ficheros.filter(({ lista }) => {
      const n = ordenDeEjercicios(lista).map((e) => NIVEL[e.nivel] ?? 3);
      return n.some((v, i) => i > 0 && v < n[i - 1]);
    });
    expect(malos.map((m) => m.f)).toEqual([]);
  });

  it('dentro de cada boletín, ningún número va detrás de uno mayor', () => {
    /** Negativo si `a` va antes que `b`: 1.2 antes que 1.10 y que 1.2.1. */
    const compara = (a: number[], b: number[]) => {
      for (let i = 0; i < Math.max(a.length, b.length); i++) {
        if ((a[i] ?? -1) !== (b[i] ?? -1)) return (a[i] ?? -1) - (b[i] ?? -1);
      }
      return 0;
    };
    const malos: string[] = [];
    for (const { f, lista } of ficheros) {
      const ultimo = new Map<string, number[]>();
      for (const e of ordenDeEjercicios(lista)) {
        if (e.nivel !== 'practica') continue;
        const { boletin, numero } = boletinYNumero(e.fuente);
        if (!numero) continue;
        const antes = ultimo.get(boletin);
        if (antes && compara(numero, antes) < 0) malos.push(`${f}: ${e.id} (${numero.join('.')}) detrás de ${antes.join('.')}`);
        ultimo.set(boletin, numero);
      }
    }
    expect(malos).toEqual([]);
  });

  it('ordenar dos veces da lo mismo que una', () => {
    const malos = ficheros.filter(({ lista }) => {
      const una = ordenDeEjercicios(lista);
      return ordenDeEjercicios(una).some((e, i) => e !== una[i]);
    });
    expect(malos.map((m) => m.f)).toEqual([]);
  });
});
