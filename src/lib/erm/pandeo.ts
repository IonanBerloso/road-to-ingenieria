/**
 * Tema 14 de ERM: pandeo. Carga crítica de Euler con la longitud de pandeo
 * de cada enlace, esbeltez, tensión crítica, la esbeltez límite que separa
 * piezas cortas y esbeltas, y la compresión excéntrica de la columna esbelta
 * empotrada-libre (la fórmula de la secante), en uno o en los dos ejes.
 *
 * Para quién: para el alumno de la 2.ª parte y la final; «compresión
 * excéntrica de columnas esbeltas» es la pregunta de pandeo que más se
 * repite en los exámenes leídos (`p0`), unas veces como cuestión y otras con
 * números («b para que el factor de amplificación sea 2», 2017-2018), y la
 * carga crítica de Euler de una sección en C o en L, la otra. Qué gana: el
 * Imin bien elegido, la Lp de cada enlace y el sec(αL) sin despejar a mano.
 * Cómo se comprueba: `tests/fisica/erm/pandeo.test.ts` (las Lp de la p. 7
 * contra los autovalores de EI·v'''' + P·v'' = 0 con cada par de enlaces;
 * la secante contra la integración numérica de la ec. 14.14).
 *
 * EL CONVENIO ES EL DEL CURSO (tema 14 de los apuntes):
 *
 *   · Pcrit = π²·E·Imin/Lp² (ecs. 14.8-14.9, pp. 6-7), con Lp = L
 *     articulada-articulada, 2L empotrada-libre, 0,5L empotrada-empotrada y
 *     0,7L empotrada-articulada (p. 7).
 *   · σcrit = Pcrit/A = π²E/λ², λ = Lp/imin, imin² = Imin/A (14.10-14.12,
 *     p. 8).
 *   · La curva de Euler vale para λ > λ0 = π·√(E/σe), donde σcrit = σe: la
 *     pieza es esbelta y falla por pandeo; con λ < λ0 es corta y «la curva de
 *     Euler no se puede utilizar» (p. 8): la diapositiva 12 la da por fallo
 *     por fluencia, σ = σe (la llama λL). No hay en el material otra fórmula
 *     (ni ω ni Johnson) para las cortas; aquí la carga de agotamiento de una
 *     corta es σe·A, como en esa diapositiva.
 *   · Compresión excéntrica de la empotrada-libre (14.13-14.20, pp. 9-11):
 *     con α = √(P/EI), δ = e·(1 − cos αL)/cos αL y M en el empotramiento
 *     = −P·e·sec(αL); sec(αL) es el factor de amplificación, y αL → π/2 es
 *     la carga crítica de la empotrada-libre (14.21). Con excentricidad en
 *     los dos ejes (diapositiva 17): Mz = −P·ey·sec(αz·L) con αz = √(P/EIz)
 *     y My = −P·ez·sec(αy·L) con αy = √(P/EIy). P > 0 es compresión: son
 *     los Mz, My de la ec. 9.43 (tema 9) con N = −P, así que se pueden dar
 *     tal cual a `flexion.ts`.
 */
import type { EsfuerzosSeccion } from './flexion';

export type Enlace = 'articulada-articulada' | 'empotrada-libre' | 'empotrada-empotrada' | 'empotrada-articulada';

/** Lp/L de la p. 7. */
export const FACTOR_LONGITUD_PANDEO: Readonly<Record<Enlace, number>> = {
  'articulada-articulada': 1,
  'empotrada-libre': 2,
  'empotrada-empotrada': 0.5,
  'empotrada-articulada': 0.7,
};

export function longitudPandeo(L: number, enlace: Enlace): number {
  if (!(L > 0)) throw new Error('La longitud tiene que ser positiva.');
  const f = FACTOR_LONGITUD_PANDEO[enlace];
  if (f === undefined) throw new Error(`Enlace desconocido: «${enlace}».`);
  return f * L;
}

export function cargaCritica(E: number, I: number, Lp: number): number {
  if (!(E > 0) || !(I > 0) || !(Lp > 0)) throw new Error('E, I y Lp tienen que ser positivos.');
  return (Math.PI ** 2 * E * I) / (Lp * Lp);
}

export function esbeltez(Lp: number, i: number): number {
  if (!(Lp > 0) || !(i > 0)) throw new Error('Lp y el radio de giro tienen que ser positivos.');
  return Lp / i;
}

export function tensionCritica(E: number, lambda: number): number {
  if (!(E > 0) || !(lambda > 0)) throw new Error('E y λ tienen que ser positivos.');
  return (Math.PI ** 2 * E) / (lambda * lambda);
}

/** λ0 (λL en las diapositivas): la esbeltez con σcrit = σe. */
export function esbeltezLimite(E: number, sigmaE: number): number {
  if (!(E > 0) || !(sigmaE > 0)) throw new Error('E y σe tienen que ser positivos.');
  return Math.PI * Math.sqrt(E / sigmaE);
}

/** Un plano de pandeo: el momento de inercia que trabaja en él y su enlace (o su Lp). */
export interface PlanoPandeo {
  I: number;
  enlace?: Enlace;
  Lp?: number;
}

export interface Columna {
  E: number;
  A: number;
  L: number;
  /** Uno por plano; con el mismo enlace en los dos basta [{ I: Imin, enlace }]. */
  planos: readonly PlanoPandeo[];
  sigmaE?: number;
}

export interface Pandeo {
  /** El plano que manda (el de menor Pcrit). */
  plano: number;
  Lp: number;
  i: number;
  lambda: number;
  Pcrit: number;
  sigmaCrit: number;
  lambdaLimite?: number;
  /** Con σe: esbelta (pandeo, Pcrit) o corta (fluencia, σe·A). */
  tipo?: 'esbelta' | 'corta';
  cargaAgotamiento?: number;
}

export function pandeo(c: Columna): Pandeo {
  if (!(c.A > 0)) throw new Error('El área tiene que ser positiva.');
  if (!(c.L > 0)) throw new Error('La longitud tiene que ser positiva.');
  if (c.planos.length === 0) throw new Error('Hace falta al menos un plano de pandeo.');
  const casos = c.planos.map((p) => {
    if (p.Lp !== undefined && p.enlace !== undefined) {
      throw new Error('Un plano lleva su enlace o su Lp, no los dos a la vez: no se sabe cuál manda.');
    }
    const Lp = p.Lp ?? (p.enlace ? longitudPandeo(c.L, p.enlace) : NaN);
    if (!(Lp > 0)) throw new Error('Cada plano necesita su enlace o su Lp.');
    return { Lp, I: p.I, Pcrit: cargaCritica(c.E, p.I, Lp) };
  });
  let k = 0;
  casos.forEach((x, j) => {
    if (x.Pcrit < casos[k].Pcrit) k = j;
  });
  const { Lp, I, Pcrit } = casos[k];
  const i = Math.sqrt(I / c.A);
  const lambda = esbeltez(Lp, i);
  const out: Pandeo = { plano: k, Lp, i, lambda, Pcrit, sigmaCrit: Pcrit / c.A };
  if (c.sigmaE !== undefined) {
    out.lambdaLimite = esbeltezLimite(c.E, c.sigmaE);
    out.tipo = lambda > out.lambdaLimite ? 'esbelta' : 'corta';
    out.cargaAgotamiento = out.tipo === 'esbelta' ? Pcrit : c.sigmaE * c.A;
  }
  return out;
}

/* ─── Compresión excéntrica (la secante) ─── */

export interface Excentrica {
  alfa: number;
  alfaL: number;
  /** sec(αL), el factor de amplificación del momento. */
  factor: number;
  /** Desplazamiento del extremo libre (ec. 14.17). */
  delta: number;
  /** Momento en el empotramiento (ec. 14.20), con su signo. */
  Mmax: number;
  /** La flecha a distancia x del empotramiento (ec. 14.18). */
  v: (x: number) => number;
}

/** Empotrada en x = 0 y libre en x = L, con P de compresión a la excentricidad e. */
export function compresionExcentrica(P: number, e: number, E: number, I: number, L: number): Excentrica {
  if (!(P > 0) || !(E > 0) || !(I > 0) || !(L > 0)) throw new Error('P, E, I y L tienen que ser positivos.');
  const alfa = Math.sqrt(P / (E * I));
  const alfaL = alfa * L;
  if (alfaL >= Math.PI / 2) throw new Error('αL ≥ π/2: la carga alcanza la crítica de la empotrada-libre (ec. 14.21).');
  const c = Math.cos(alfaL);
  return {
    alfa,
    alfaL,
    factor: 1 / c,
    delta: (e * (1 - c)) / c,
    Mmax: (-P * e) / c,
    v: (x) => (e * (1 - Math.cos(alfa * x))) / c,
  };
}

/** Excentricidad en los dos ejes (diapositiva 17): los esfuerzos del empotramiento para `flexion.ts`. */
export function compresionExcentricaBiaxial(
  P: number,
  ey: number,
  ez: number,
  E: number,
  Iz: number,
  Iy: number,
  L: number,
): EsfuerzosSeccion & { factorZ: number; factorY: number } {
  const z = compresionExcentrica(P, 1, E, Iz, L);
  const y = compresionExcentrica(P, 1, E, Iy, L);
  return { N: -P, Mz: -P * ey * z.factor, My: -P * ez * y.factor, factorZ: z.factor, factorY: y.factor };
}

/** El I con el que sec(αL) vale `factor` (> 1): αL = arccos(1/factor). */
export function inerciaParaFactor(P: number, E: number, L: number, factor: number): number {
  if (!(factor > 1)) throw new Error('El factor de amplificación tiene que ser mayor que 1.');
  const aL = Math.acos(1 / factor);
  return (P * L * L) / (E * aL * aL);
}
