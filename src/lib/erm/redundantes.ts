/**
 * Tema 11 de ERM: la viga hiperestática por el método de los apuntes
 * (apartados 11.1 y 11.2): se quitan los enlaces redundantes, se ponen en su
 * lugar las incógnitas hiperestáticas X como cargas sobre la viga isostática
 * que queda, y se imponen las condiciones de flecha o de giro de los enlaces
 * quitados, por superposición: δi0 + Σj δij·Xj = condición i.
 *
 * Para quién: para el alumno que tiene que escribir esa superposición (la
 * figura 11.2, p. 5, «Condición: vB = 0» o «θA = 0») y para quien escriba sus
 * ejercicios guiados; las vigas hiperestáticas de un vano, con resorte o con
 * asiento salen en los exámenes de 2015-2016 a 2021-2022 (`p0`). Qué gana:
 * los coeficientes de flexibilidad δij y δi0 a la vista (son lo que se pide
 * escribir), las X y los diagramas de la viga final. Cómo se comprueba:
 * `tests/fisica/erm/hiperestatica.test.ts` resuelve las mismas vigas con
 * `elastica.ts` planteando la viga entera (otro camino: las reacciones como
 * incógnitas de un único sistema, sin superposición) y con los tres momentos.
 *
 * EL CONVENIO ES EL DEL CURSO y el de `elastica.ts` (tema 10, pp. 4-7; tema
 * 11, pp. 4-7): v hacia abajo, θ = dv/dx (horario positivo), cargas de
 * `viga.ts`. Una redundante `fuerza` es una reacción vertical HACIA ARRIBA en
 * x, con la condición v(x) = asiento (δ positivo hacia abajo) o, si hay un
 * resorte de rigidez k, v(x) = asiento + X/k (el asiento es entonces el de la
 * base del resorte; sin él, v(x) = X/k). Una redundante `par` es un par en x con
 * el signo de `viga.ts` (positivo el que tracciona la fibra inferior a su
 * derecha: horario), con la condición θ(x) = giro impuesto (0 si no se dice):
 * es el par de un empotramiento convertido en articulación.
 *
 * La viga base es una `VigaRecta` de `vigas.ts` y tiene que ser isostática
 * (se comprueba resolviéndola con la estática del tema 7); sus flechas y giros
 * salen de `elastica.ts`, y los esfuerzos de la viga final, de `vigas.ts`.
 */
import type { Carga } from '../viga';
import { resuelveElastica, type ElasticaResuelta, type TramoEI, type VigaElastica } from './elastica';
import { resuelveLineal } from './lineal';
import { resuelveViga, type VigaRecta, type VigaResuelta } from './vigas';

export type Redundante = { tipo: 'fuerza'; x: number; asiento?: number; k?: number } | { tipo: 'par'; x: number; giro?: number };

export interface Superposicion {
  /** Las incógnitas hiperestáticas, en el orden dado. */
  X: number[];
  /** δi0: la flecha (o el giro) en el enlace i de la viga base con las cargas. */
  d0: number[];
  /** δij: la flecha (o el giro) en i con Xj = 1 sola. */
  d: number[][];
  /** La viga base con las cargas y las X puestas como cargas: isostática. */
  final: VigaRecta;
  /** Sus esfuerzos (tema 7) y su elástica (tema 10). */
  esfuerzos: VigaResuelta;
  elastica: ElasticaResuelta;
}

/** Una redundante con valor X como carga de `viga.ts`. */
function comoCarga(r: Redundante, X: number): Carga {
  return r.tipo === 'fuerza' ? { tipo: 'puntual', x: r.x, P: -X } : { tipo: 'par', x: r.x, M: X };
}

function elasticaDe(base: VigaRecta, EI: number | readonly TramoEI[], cargas: readonly Carga[]): ElasticaResuelta {
  const v: VigaElastica = { L: base.L, EI, apoyos: base.apoyos, rotulas: base.rotulas, cargas };
  return resuelveElastica(v);
}

/** Lo que mide la condición del enlace i: la flecha o el giro en su x. */
function medida(r: Redundante, e: ElasticaResuelta): number {
  return r.tipo === 'fuerza' ? e.v(r.x) : e.theta(r.x);
}

export function porRedundantes(base: VigaRecta, EI: number | readonly TramoEI[], redundantes: readonly Redundante[]): Superposicion {
  if (redundantes.length === 0) throw new Error('Hace falta al menos una incógnita hiperestática.');
  for (const r of redundantes) {
    if (r.x < 0 || r.x > base.L) throw new Error(`La redundante en x = ${r.x} está fuera de la viga.`);
    if (r.tipo === 'fuerza' && r.k !== undefined && !(r.k > 0)) throw new Error('La rigidez del resorte tiene que ser positiva.');
  }
  /* la base tiene que ser isostática: la estática del tema 7 lo dice */
  resuelveViga(base);
  const e0 = elasticaDe(base, EI, base.cargas);
  const d0 = redundantes.map((r) => medida(r, e0));
  const d = redundantes.map((ri) =>
    redundantes.map((rj) => medida(ri, elasticaDe(base, EI, [comoCarga(rj, 1)]))),
  );
  /* δi0 + Σ δij Xj = asiento (+ Xi/k si hay resorte) o giro */
  const A = d.map((fila, i) => {
    const r = redundantes[i];
    return fila.map((dij, j) => dij - (i === j && r.tipo === 'fuerza' && r.k ? 1 / r.k : 0));
  });
  const b = redundantes.map((r, i) => (r.tipo === 'fuerza' ? (r.asiento ?? 0) : (r.giro ?? 0)) - d0[i]);
  const sol = resuelveLineal(A, b);
  if (sol.rango < redundantes.length) throw new Error('Las redundantes elegidas no son independientes: la base sería un mecanismo.');
  const X = sol.x;
  const final: VigaRecta = { ...base, cargas: [...base.cargas, ...redundantes.map((r, i) => comoCarga(r, X[i]))] };
  return { X, d0, d, final, esfuerzos: resuelveViga(final), elastica: elasticaDe(base, EI, final.cargas) };
}
