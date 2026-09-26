/**
 * La corrección de una construcción de Expresión Gráfica: lo único del patrón
 * que corre en la página.
 *
 * Todo lo demás se resuelve en el build (`lib/diedrico-receta.ts`): la receta
 * da la solución, cada objetivo se compila a las posiciones que valen y cada
 * diagnóstico a un árbol con la geometría ya calculada. Aquí solo se mira si
 * un punto marcado cae donde tiene que caer, con la tolerancia de la regla.
 * Por eso este fichero no importa nada que ocupe: los tipos de `lib/diedrico`
 * se borran al compilar, y el navegador recibe unas pocas restas.
 *
 * DOS COSAS QUE SE RESUELVEN AL CORREGIR, NO AL COMPILAR:
 *
 *   · **Lo que el alumno ya marcó.** Un diagnóstico como «B₁ va en la vertical
 *     de B₂» se refiere a su B₂, no al bueno. Si todavía no lo ha marcado, el
 *     diagnóstico no aplica —ni se cumple ni se niega— y se pasa al siguiente.
 *   · **Las elecciones.** Cuando una lámina tiene dos soluciones buenas (en
 *     SD5 el cuadrado sale de A hacia un lado o hacia el otro), la primera
 *     marca que decide cuál fija la rama para todos los objetivos que dependen
 *     de ella. `acierta` dice cuándo una marca la fija.
 */
import type { P2 } from './diedrico';

/** Las posiciones que valen para un objetivo. Sin elección, una sola rama
 *  con todas las posiciones buenas (los abatidos de SD4 valen en ocho); con
 *  elección, una rama por solución, y vale la de la rama elegida. */
export interface Objetivo {
  readonly eleccion?: string;
  readonly ramas: readonly (readonly P2[])[];
}

/** Lo que se dibuja de la solución al abrir el desarrollo: segmentos, una
 *  lista por rama si dependen de una elección. */
export interface Trazado {
  readonly eleccion?: string;
  readonly ramas: readonly (readonly (readonly [P2, P2])[])[];
}

/** Unos puntos a los que se refiere un diagnóstico: fijos, lo que el alumno
 *  marcó con ese nombre, o los de una elección —los de la rama elegida, o con
 *  `otra` los de las demás—. */
export type Puntos =
  | { readonly en: readonly P2[] }
  | { readonly ref: string }
  | { readonly eleccion: string; readonly ramas: readonly (readonly P2[])[]; readonly otra?: true };

/** Un diagnóstico compilado. Es JSON: viaja a la página tal cual. En todos, el
 *  punto que se comprueba es el que acaba de marcar el alumno. */
export type Predicado =
  | { readonly op: 'siempre' }
  | { readonly op: 'no'; readonly de: Predicado }
  | { readonly op: 'y'; readonly de: readonly Predicado[] }
  | { readonly op: 'vertical'; readonly de: Puntos }
  | { readonly op: 'horizontal'; readonly de: Puntos }
  | { readonly op: 'cerca'; readonly de: Puntos }
  | { readonly op: 'distancia'; readonly de: Puntos; readonly d: number }
  | { readonly op: 'recta'; readonly p: P2; readonly d: P2 }
  | { readonly op: 'segmento'; readonly segs: readonly (readonly [P2, P2])[] }
  | { readonly op: 'pie'; readonly desde: Puntos; readonly a: P2; readonly b: P2 };

/** Lo que el alumno ha marcado, por nombre de objetivo. */
export type Marcados = Readonly<Record<string, P2>>;

/** La rama elegida de cada elección, por su nombre. */
export type Elegidas = Readonly<Record<string, number>>;

const distancia = (p: P2, q: P2) => Math.hypot(p[0] - q[0], p[1] - q[1]);

/**
 * Si el punto marcado vale para el objetivo. Cuando además resuelve una
 * elección que seguía abierta, dice cuál: quien corrige la guarda en sus
 * `elegidas` y a partir de ahí solo vale esa rama.
 */
export function acierta(
  o: Objetivo,
  p: P2,
  elegidas: Elegidas,
  tol: number,
): { bien: boolean; elige?: { eleccion: string; rama: number } } {
  const cae = (q: P2) => distancia(p, q) <= tol;
  if (o.eleccion === undefined) return { bien: o.ramas.some((r) => r.some(cae)) };
  const k = elegidas[o.eleccion];
  if (k !== undefined) return { bien: (o.ramas[k] ?? []).some(cae) };
  const rama = o.ramas.findIndex((r) => r.some(cae));
  return rama < 0 ? { bien: false } : { bien: true, elige: { eleccion: o.eleccion, rama } };
}

/** Los puntos concretos a los que se refiere un diagnóstico ahora mismo, o
 *  `undefined` si todavía no existen: una marca que falta, o la «otra» rama de
 *  una elección que nadie ha hecho. */
function resuelve(x: Puntos, marcados: Marcados, elegidas: Elegidas): readonly P2[] | undefined {
  if ('ref' in x) return marcados[x.ref] ? [marcados[x.ref]] : undefined;
  if ('en' in x) return x.en;
  const k = elegidas[x.eleccion];
  if (x.otra) return k === undefined ? undefined : x.ramas.filter((_, i) => i !== k).flat();
  return k === undefined ? x.ramas.flat() : x.ramas[k];
}

const distanciaARecta = (p: P2, a: P2, d: P2) =>
  Math.abs((p[0] - a[0]) * d[1] - (p[1] - a[1]) * d[0]) / Math.hypot(d[0], d[1]);

/** El parámetro del pie de la perpendicular desde p a la recta ab; un
 *  segmento de longitud cero no tiene recta, y se toma su punto. */
function parametro(p: P2, a: P2, b: P2): number {
  const u: P2 = [b[0] - a[0], b[1] - a[1]];
  const l2 = u[0] ** 2 + u[1] ** 2;
  return l2 < 1e-12 ? 0 : ((p[0] - a[0]) * u[0] + (p[1] - a[1]) * u[1]) / l2;
}

const enParametro = (a: P2, b: P2, s: number): P2 => [a[0] + s * (b[0] - a[0]), a[1] + s * (b[1] - a[1])];

function distanciaASegmento(p: P2, a: P2, b: P2): number {
  const s = Math.max(0, Math.min(1, parametro(p, a, b)));
  return distancia(p, enParametro(a, b, s));
}

/** Tres valores: se cumple, no se cumple, o no aplica todavía. */
function evalua(d: Predicado, p: P2, marcados: Marcados, tol: number, elegidas: Elegidas): boolean | undefined {
  const alguno = (x: Puntos, prueba: (q: P2) => boolean): boolean | undefined => {
    const qs = resuelve(x, marcados, elegidas);
    return qs === undefined ? undefined : qs.some(prueba);
  };
  switch (d.op) {
    case 'siempre':
      return true;
    case 'no': {
      const v = evalua(d.de, p, marcados, tol, elegidas);
      return v === undefined ? undefined : !v;
    }
    case 'y': {
      let todo: boolean | undefined = true;
      for (const x of d.de) {
        const v = evalua(x, p, marcados, tol, elegidas);
        if (v === false) return false;
        if (v === undefined) todo = undefined;
      }
      return todo;
    }
    case 'vertical':
      return alguno(d.de, (q) => Math.abs(p[0] - q[0]) <= tol);
    case 'horizontal':
      return alguno(d.de, (q) => Math.abs(p[1] - q[1]) <= tol);
    case 'cerca':
      return alguno(d.de, (q) => distancia(p, q) <= tol);
    case 'distancia':
      return alguno(d.de, (q) => Math.abs(distancia(p, q) - d.d) <= tol);
    case 'recta':
      return distanciaARecta(p, d.p, d.d) <= tol;
    case 'segmento':
      return d.segs.some(([a, b]) => distanciaASegmento(p, a, b) <= tol);
    case 'pie':
      return alguno(d.desde, (q) => distancia(p, enParametro(d.a, d.b, parametro(q, d.a, d.b))) <= tol);
  }
}

/** Si el punto que ha marcado el alumno cumple el diagnóstico. Lo que se
 *  refiere a algo que todavía no existe no se cumple: el diagnóstico no aplica
 *  y se pasa al siguiente. */
export const cumple = (d: Predicado, p: P2, marcados: Marcados, tol: number, elegidas: Elegidas = {}): boolean =>
  evalua(d, p, marcados, tol, elegidas) === true;
