/**
 * Los valores de una receta y lo que se comprueba de ellos: la lámina como datos, los tipos de valor y las conversiones que dan un error claro.
 *
 * Parte de las recetas de Expresión Gráfica: el porqué y la gramática están en
 * `diedrico-receta.ts`, que es la API pública. Se partió en cuatro ficheros el
 * 1 de octubre de 2026 (fase K, tanda 0 b), sin cambiar nada de lo que hace,
 * para que quepan las funciones de los lotes siguientes.
 */
import {
  type P2,
  type P3,
  type Plano,
  type Recta3,
} from './diedrico';

/** Una lámina como datos: sus puntos y segmentos con nombre, en pt del PDF. */
export interface Lamina {
  readonly puntos: Readonly<Record<string, P2>>;
  readonly segmentos: Readonly<Record<string, readonly [P2, P2]>>;
}

export const propio = (o: object, k: string) => Object.prototype.hasOwnProperty.call(o, k);

/* ═══════════════════════════════ los valores ═════════════════════════════ */

export type Sentido = 'descendente' | 'ascendente';

export type Valor =
  | { k: 'num'; v: number }
  | { k: 'txt'; v: string }
  | { k: 'bool'; v: boolean; detalle?: string }
  | { k: 'sentido'; v: Sentido }
  | { k: 'p2'; v: P2 }
  | { k: 'p3'; v: P3 }
  | { k: 'plano'; v: Plano }
  | { k: 'recta3'; v: Recta3 }
  | { k: 'linea'; p: P2; d: P2 }
  | { k: 'seg2'; a: P2; b: P2 }
  | { k: 'seg3'; a: P3; b: P3 }
  | { k: 'semirrecta'; origen: P3; dir: P2 }
  | { k: 'lista'; v: Valor[] }
  | { k: 'ramas'; eleccion: string; v: Valor[] };

export const RESERVADAS: Readonly<Record<string, Valor>> = {
  descendente: { k: 'sentido', v: 'descendente' },
  ascendente: { k: 'sentido', v: 'ascendente' },
};

export const QUE: Record<Valor['k'], string> = {
  num: 'un número',
  txt: 'un texto',
  bool: 'una condición',
  sentido: 'un sentido',
  p2: 'un punto de la lámina',
  p3: 'un punto del espacio',
  plano: 'un plano',
  recta3: 'una recta del espacio',
  linea: 'una recta de la lámina',
  seg2: 'un segmento de la lámina',
  seg3: 'un segmento del espacio',
  semirrecta: 'una semirrecta',
  lista: 'una lista',
  ramas: 'una elección',
};

export function espera<K extends Valor['k']>(v: Valor | undefined, k: K, quien: string): Extract<Valor, { k: K }> {
  if (!v) throw new Error(`${quien} espera ${QUE[k]}, y no se le ha dado`);
  if (v.k !== k) throw new Error(`${quien} espera ${QUE[k]}, y ha recibido ${QUE[v.k]}`);
  return v as Extract<Valor, { k: K }>;
}

export const comoNum = (v: Valor | undefined, quien: string) => espera(v, 'num', quien).v;
export const comoP3 = (v: Valor | undefined, quien: string) => espera(v, 'p3', quien).v;
export const comoPlano = (v: Valor | undefined, quien: string) => espera(v, 'plano', quien).v;
export const comoRecta3 = (v: Valor | undefined, quien: string) => espera(v, 'recta3', quien).v;

/** Una recta de la lámina, venga como recta o como segmento. */
export function comoRecta2(v: Valor | undefined, quien: string): { p: P2; d: P2 } {
  if (v?.k === 'linea') return { p: v.p, d: v.d };
  if (v?.k === 'seg2') return { p: v.a, d: [v.b[0] - v.a[0], v.b[1] - v.a[1]] };
  if (v?.k === 'recta3') {
    throw new Error(`${quien} espera una recta de la lámina, y ha recibido una recta del espacio: usa proy_planta() o proy_alzado()`);
  }
  throw new Error(`${quien} espera una recta de la lámina, y ha recibido ${v ? QUE[v.k] : 'nada'}`);
}

/** Si dos valores son el mismo, con la holgura de la aritmética. */
export function iguales(a: unknown, b: unknown): boolean {
  if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => iguales(x, b[i]));
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const [ka, kb] = [Object.keys(a), Object.keys(b)];
    return ka.length === kb.length && ka.every((k) => iguales((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
  }
  return a === b;
}
