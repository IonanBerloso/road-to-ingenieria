/**
 * Los criterios de corrección como datos (fase K, unidad k-crit, 1 de octubre
 * de 2026): `src/content/criterios/`, una hoja por asignatura.
 *
 * El esquema de content.config.ts mira la forma de cada fichero, y de
 * `donde` solo que tenga forma de id de tema. Aquí, sin construir el sitio,
 * lo que el esquema no ve, porque mira cada fichero por separado:
 *
 * 1. que cada hoja se llama como una asignatura del catálogo, y que cada
 *    `donde` es un tema de ESA asignatura con página (no `soloEnClase`);
 * 2. que los datos dicen lo mismo que el texto impreso, cada cosa en su
 *    sitio: el precio detrás de los dos puntos, el tope detrás de «máximo» o
 *    «hasta» con su ámbito, y `por` solo si la hoja lo imprime justo detrás
 *    del precio;
 * 3. la hoja de Expresión Gráfica entera —10 mínimos en sus bloques, 6 muy
 *    graves y 9 típicos, todos de los temas del bloque 2— y su precio
 *    compuesto, el de la escala de una pieza, que es la prueba de utilidad de
 *    la colección. Sus cuentas usan la lectura del plan, que la hoja no
 *    confirma (ver el último caso).
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { describe, expect, it } from 'vitest';

type ParteDePrecio = { precio: number; donde: 'pieza' | 'cajetin' };
type Minimo = { id: string; bloque: 'vistas' | 'acotacion' | 'tolerancias'; texto: string; donde: string };
type MuyGrave = { id: string; texto: string; precio: number; por?: 'pieza'; donde: string };
type Tipico = {
  id: string;
  texto: string;
  precio: number | ParteDePrecio[];
  por?: 'caso' | 'cada-una' | 'cada' | 'vista';
  tope?: number;
  topeEn?: 'pieza' | 'plano' | 'total';
  donde: string;
};
type Hoja = { fuente: string; entradilla: string; minimos: Minimo[]; muyGraves: MuyGrave[]; tipicos: Tipico[] };

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONT = join(RAIZ, 'src', 'content');
const HOJAS = readdirSync(join(CONT, 'criterios'))
  .filter((f) => f.endsWith('.yaml'))
  .map((f) => {
    const asignatura = f.replace(/\.yaml$/, '');
    return { asignatura, hoja: yaml.load(readFileSync(join(CONT, 'criterios', f), 'utf8')) as Hoja };
  });
const ASIGNATURAS = new Set(readdirSync(join(CONT, 'catalogo')).map((f) => f.replace(/\.json$/, '')));
/** Los temas con página de una asignatura: los `soloEnClase` no la tendrán nunca. */
const temasDe = (asignatura: string): Set<string> =>
  new Set(
    (JSON.parse(readFileSync(join(CONT, 'catalogo', `${asignatura}.json`), 'utf8')) as { temas: { id: string; soloEnClase?: string }[] }).temas
      .filter((t) => !t.soloEnClase)
      .map((t) => t.id),
  );

/** Un número como lo imprime la hoja: guion corto y coma decimal (−0,5 → «-0,5»). */
const impreso = (x: number) => `-${String(Math.abs(x)).replace('.', ',')}`;
/** La cifra impresa como patrón, sin dejar que «-1» case dentro de «-1,5». */
const cifra = (x: number) => `${impreso(x)}(?![\\d,])`;
/** El ámbito del tope, tal como lo imprime la hoja; sin ámbito impreso, `total`. */
const ambitoImpreso = (texto: string) =>
  /(máximo|hasta) -[\d,]+ por pieza/.test(texto) ? 'pieza' : /(máximo|hasta) -[\d,]+ en todo el plano/.test(texto) ? 'plano' : 'total';
/** Lo que la hoja imprime, justo detrás del precio, para cada valor de `por`. */
const DICE_POR: Record<NonNullable<Tipico['por']>, string> = {
  caso: 'por cada caso',
  'cada-una': 'por cada una',
  cada: 'por cada (',
  vista: 'por cada vista principal extra',
};

describe('los criterios de corrección', () => {
  it('hay al menos una hoja, y cada una se llama como una asignatura del catálogo', () => {
    expect(HOJAS.length).toBeGreaterThan(0);
    for (const { asignatura } of HOJAS) expect(ASIGNATURAS.has(asignatura), `no hay catálogo ${asignatura}.json`).toBe(true);
  });

  for (const { asignatura, hoja } of HOJAS) {
    const todos = [...hoja.minimos, ...hoja.muyGraves, ...hoja.tipicos];

    it(`${asignatura}: cada \`donde\` es un tema con página de su catálogo`, () => {
      const temas = temasDe(asignatura);
      for (const c of todos) expect(temas.has(c.donde), `${c.id} → ${c.donde}`).toBe(true);
    });

    it(`${asignatura}: ningún id se repite`, () => {
      expect(new Set(todos.map((c) => c.id)).size).toBe(todos.length);
    });

    it(`${asignatura}: cada precio, cada tope y su ámbito salen en su texto, en su sitio`, () => {
      for (const t of hoja.tipicos) {
        if (typeof t.precio === 'number') expect(t.texto, t.id).toMatch(new RegExp(`: ${cifra(t.precio)}`));
        else
          for (const p of t.precio)
            expect(t.texto, t.id).toMatch(new RegExp(`\\[si falta en ${p.donde === 'cajetin' ? 'el cajetín' : 'la pieza'} ${cifra(p.precio)}\\]`));
        if (t.tope !== undefined) {
          expect(t.texto, t.id).toMatch(new RegExp(`(máximo|hasta) ${cifra(t.tope)}`));
          expect(t.topeEn, t.id).toBe(ambitoImpreso(t.texto));
        } else expect(t.texto, `${t.id}: la hoja pone un tope y el dato no`).not.toMatch(/máximo|hasta/);
      }
      for (const g of hoja.muyGraves) expect(g.precio, g.id).toBe(-2);
    });

    it(`${asignatura}: \`por\` está solo cuando la hoja lo imprime, justo detrás del precio`, () => {
      for (const t of hoja.tipicos) {
        if (typeof t.precio !== 'number') {
          expect(t.por, t.id).toBeUndefined();
          continue;
        }
        const tras = t.texto.match(new RegExp(`: ${cifra(t.precio)}(.*)$`))?.[1] ?? '';
        if (t.por !== undefined) expect(tras.startsWith(` ${DICE_POR[t.por]}`), t.id).toBe(true);
        else expect(tras, `${t.id}: la hoja imprime «por…» y el dato no`).not.toMatch(/^\s*por\b/);
      }
      for (const g of hoja.muyGraves) expect(g.por === 'pieza', g.id).toBe(/-2 por pieza/.test(g.texto));
    });
  }
});

describe('la hoja de Expresión Gráfica', () => {
  const eg = HOJAS.find((h) => h.asignatura === 'expresion-grafica');

  it('existe, y trae 10 mínimos, 6 muy graves y 9 típicos, con cada mínimo en el bloque de la hoja', () => {
    expect(eg).toBeDefined();
    const { minimos, muyGraves, tipicos } = eg!.hoja;
    expect([minimos.length, muyGraves.length, tipicos.length]).toEqual([10, 6, 9]);
    const delBloque = (b: Minimo['bloque']) => minimos.filter((m) => m.bloque === b).map((m) => m.id);
    expect(delBloque('vistas')).toEqual(['una-vista-bien-colocada', 'eje-de-simetria-y-de-agujero', 'una-rosca-bien-dibujada', 'vistas-necesarias']);
    expect(delBloque('acotacion')).toEqual(['rosca-con-m', 'numero-de-cota', 'simbolos-de-diametro-y-radio', 'despiece-en-mm']);
    expect(delBloque('tolerancias')).toEqual(['una-tolerancia-dimensional', 'un-acabado-superficial']);
  });

  it('cada criterio apunta a un tema del bloque 2, de t07 a t13', () => {
    const { minimos, muyGraves, tipicos } = eg!.hoja;
    for (const c of [...minimos, ...muyGraves, ...tipicos]) expect(/^t(0[7-9]|1[0-3])-/.test(c.donde), `${c.id} → ${c.donde}`).toBe(true);
  });

  it('tiene un solo precio compuesto: la escala de una pieza, medio punto en la pieza y medio en el cajetín, como mucho −2 en total', () => {
    const compuestos = eg!.hoja.tipicos.filter((t) => Array.isArray(t.precio));
    expect(compuestos).toHaveLength(1);
    const escala = compuestos[0];
    expect(escala.id).toBe('escala-de-una-pieza');
    expect(escala.precio).toEqual([
      { precio: -0.5, donde: 'pieza' },
      { precio: -0.5, donde: 'cajetin' },
    ]);
    expect(escala.tope).toBe(-2);
    expect(escala.topeEn).toBe('total');
    /* La hoja no dice «por» en este: leemos que lo que se repite es la parte
       de la pieza, «aunque se produzca en más piezas». */
    expect(escala.por).toBeUndefined();
  });

  it('con la lectura del plan (§3.3), que la hoja no confirma —la parte del cajetín se cobra una vez—: dos piezas y el cajetín, −1,5; cinco piezas, −2', () => {
    /* La cuenta que hará el componente de los Criterios (PLAN-K, §3.3),
       escrita aquí solo para comprobar que los datos bastan para hacerla.
       Cuando exista su función en lib/, este caso la usa a ella.

       Es una lectura, no lo que dice la hoja: «[si falta en la pieza -0,5] +
       [si falta en el cajetín -0,5], como máximo -2 aunque se produzca en más
       piezas» no dice cuántas veces se cobra cada corchete. Si cada pieza
       puede costar −0,5 + −0,5, dos piezas dan −2 y no −1,5. Está pendiente
       de preguntar (tasks/pendiente.md; §13, caso 5). */
    const escala = eg!.hoja.tipicos.find((t) => t.id === 'escala-de-una-pieza')!;
    const partes = escala.precio as ParteDePrecio[];
    const descuento = (piezas: number, cajetin: boolean) => {
      const suma = partes.reduce((s, p) => s + (p.donde === 'pieza' ? piezas * p.precio : cajetin ? p.precio : 0), 0);
      return Math.max(suma, escala.tope!);
    };
    expect(descuento(2, true)).toBe(-1.5);
    expect(descuento(5, true)).toBe(-2);
    expect(descuento(1, false)).toBe(-0.5);
  });
});
