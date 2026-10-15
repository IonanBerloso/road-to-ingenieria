/**
 * Tema 11 de ERM: el teorema de los tres momentos (Clapeyron) para vigas
 * continuas, con inercia distinta en cada vano, asientos de apoyo, voladizos
 * y empotramientos en los extremos (apartado 11.3 de los apuntes).
 *
 * Para quién: para el alumno de la 2.ª parte y la final, y para quien
 * escriba sus ejercicios guiados: «viga continua» sale cinco veces en los
 * exámenes leídos (`p0`), dos de ellas pidiendo expresamente los tres
 * momentos. Qué gana: los momentos en los apoyos de un sistema que a mano
 * se escribe mal (a y b cambiados, el 6E·β con el signo al revés). Cómo se
 * comprueba: `tests/fisica/erm/elastica.test.ts`, contra `elastica.ts`, que
 * resuelve la misma viga por compatibilidad de flechas sin pasar por la
 * ec. 11.3, y contra los casos de libro (dos vanos iguales: −qL²/8).
 *
 * EL CONVENIO ES EL DEL CURSO (tema 11, pp. 5-7):
 *
 *   · Apoyos 0…N, vanos 1…N; el vano [i] va del apoyo i−1 al i (fig. 11.3).
 *   · Ec. 11.3: Mi−1·Li/Ii + 2Mi(Li/Ii + Li+1/Ii+1) + Mi+1·Li+1/Ii+1 =
 *     −6·Ai·ai/(Li·Ii) − 6·Ai+1·bi+1/(Li+1·Ii+1) − 6E(βi+1 − βi), con
 *     βi = (δi − δi−1)/Li. Ai es el área del diagrama isostático del vano [i]
 *     (el de la viga simplemente apoyada), ai la distancia de su centro de
 *     gravedad al apoyo izquierdo del vano y bi, al derecho (ecs. 11.1-11.2:
 *     momentos en i−1 para el vano [i] y en i+1 para el [i+1]).
 *   · M > 0 tracciona la fibra inferior; los asientos δ, positivos hacia
 *     abajo, como v en el tema 10.
 *   · Un voladizo en un extremo se sustituye por su efecto: el momento del
 *     apoyo extremo es conocido, M0 = −P·a en la figura 11.6 (p. 7).
 *   · Un empotramiento se sustituye por un vano ficticio de inercia infinita
 *     (fig. 11.7): sus términos se anulan y su momento pasa a ser incógnita.
 *
 * El diagrama isostático de cada vano se calcula con `viga.ts` (la viga
 * biapoyada de Mecánica Aplicada), no con otro modelo.
 */
import { flector, reacciones as reaccionesBiapoyada, type Carga, type Viga } from '../viga';
import { integra } from './elastica';
import { resuelveLineal } from './lineal';

/** Un vano: su luz, su momento de inercia y sus cargas con x desde su apoyo izquierdo. */
export interface Vano {
  L: number;
  I: number;
  cargas: readonly Carga[];
}

/** Lo que hay en un extremo: un apoyo simple (con el momento de un voladizo, si lo hay) o un empotramiento. */
export type Extremo = { tipo: 'apoyo'; M?: number } | { tipo: 'empotramiento' };

export interface VigaContinua {
  E: number;
  vanos: readonly Vano[];
  /** Asientos de los N + 1 apoyos, positivos hacia abajo. */
  asientos?: readonly number[];
  izquierda?: Extremo;
  derecha?: Extremo;
}

/** El diagrama isostático de un vano: su área A y las distancias a y b de su centro de gravedad. */
export function isostatico(vano: Vano): { A: number; a: number; b: number; Aa: number; Ab: number } {
  const v: Viga = { L: vano.L, xA: 0, xB: vano.L, cargas: [...vano.cargas] };
  const cortes = vano.cargas.flatMap((c) => (c.tipo === 'repartida' ? [c.x1, c.x2] : [c.x]));
  const A = integra((x) => flector(v, x), 0, vano.L, cortes);
  const Aa = integra((x) => flector(v, x) * x, 0, vano.L, cortes);
  const Ab = integra((x) => flector(v, x) * (vano.L - x), 0, vano.L, cortes);
  return { A, a: A === 0 ? vano.L / 2 : Aa / A, b: A === 0 ? vano.L / 2 : Ab / A, Aa, Ab };
}

export interface TresMomentosResuelta {
  /** Momentos flectores en los apoyos 0…N. */
  M: number[];
  /** Reacciones (hacia arriba) de los apoyos 0…N, sin las cargas de los voladizos. */
  R: number[];
  /** El flector en x dentro del vano i (1…N), x desde su apoyo izquierdo. */
  flectorVano: (i: number, x: number) => number;
}

/** Plantea y resuelve las ecuaciones 11.3 de cada apoyo cuyo momento es incógnita. */
export function tresMomentos(viga: VigaContinua): TresMomentosResuelta {
  const N = viga.vanos.length;
  if (N < 1) throw new Error('Hace falta al menos un vano.');
  for (const v of viga.vanos) if (!(v.L > 0) || !(v.I > 0)) throw new Error('Cada vano necesita L > 0 e I > 0.');
  const delta = viga.asientos ?? new Array<number>(N + 1).fill(0);
  if (delta.length !== N + 1) throw new Error(`Hacen falta ${N + 1} asientos, uno por apoyo.`);
  const izq = viga.izquierda ?? { tipo: 'apoyo' };
  const der = viga.derecha ?? { tipo: 'apoyo' };
  const iso = viga.vanos.map(isostatico);
  const L = (i: number) => viga.vanos[i - 1].L;
  const I = (i: number) => viga.vanos[i - 1].I;
  const beta = (i: number) => (delta[i] - delta[i - 1]) / L(i);
  /* Qué momentos son incógnita: los interiores, y los extremos empotrados. */
  const conocido = new Map<number, number>();
  if (izq.tipo === 'apoyo') conocido.set(0, izq.M ?? 0);
  if (der.tipo === 'apoyo') conocido.set(N, der.M ?? 0);
  const incognitas = [...Array(N + 1).keys()].filter((i) => !conocido.has(i));
  const col = new Map(incognitas.map((i, k) => [i, k]));
  const A: number[][] = [];
  const b: number[] = [];
  for (const i of incognitas) {
    const f = new Array<number>(incognitas.length).fill(0);
    let t = 0;
    const suma = (j: number, coef: number) => {
      if (col.has(j)) f[col.get(j) as number] += coef;
      else t -= coef * (conocido.get(j) as number);
    };
    /* vano [i] a la izquierda del apoyo i (si existe; si no, es el ficticio de I = ∞) */
    if (i >= 1) {
      suma(i - 1, L(i) / I(i));
      suma(i, (2 * L(i)) / I(i));
      t += (-6 * iso[i - 1].Aa) / (L(i) * I(i)) + 6 * viga.E * beta(i);
    }
    /* vano [i+1] a la derecha */
    if (i + 1 <= N) {
      suma(i, (2 * L(i + 1)) / I(i + 1));
      suma(i + 1, L(i + 1) / I(i + 1));
      t += (-6 * iso[i].Ab) / (L(i + 1) * I(i + 1)) - 6 * viga.E * beta(i + 1);
    }
    A.push(f);
    b.push(t);
  }
  const M = new Array<number>(N + 1).fill(0);
  for (const [i, m] of conocido) M[i] = m;
  /* Con L > 0 e I > 0 la matriz es de diagonal estrictamente dominante
     (2(Li/Ii + Li+1/Ii+1) frente a Li/Ii + Li+1/Ii+1): siempre tiene solución única. */
  if (incognitas.length) {
    const sol = resuelveLineal(A, b);
    incognitas.forEach((i, k) => (M[i] = sol.x[k]));
  }
  const R = new Array<number>(N + 1).fill(0);
  viga.vanos.forEach((vano, k) => {
    const r0 = reaccionesBiapoyada({ L: vano.L, xA: 0, xB: vano.L, cargas: [...vano.cargas] });
    const dM = (M[k + 1] - M[k]) / vano.L;
    R[k] += r0.RA + dM;
    R[k + 1] += r0.RB - dM;
  });
  const flectorVano = (i: number, x: number) => {
    const vano = viga.vanos[i - 1];
    const v: Viga = { L: vano.L, xA: 0, xB: vano.L, cargas: [...vano.cargas] };
    return flector(v, x) + M[i - 1] * (1 - x / vano.L) + (M[i] * x) / vano.L;
  };
  return { M, R, flectorVano };
}
