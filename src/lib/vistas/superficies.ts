/**
 * Lo que tiene cada primitiva en el mundo: sus caras planas con su región,
 * su superficie curva si la tiene, y sus aristas propias.
 *
 * Es lo que necesitan las curvas candidatas (§3.2, paso 2): los bordes de
 * cada cara, y los cruces de las caras y superficies de una primitiva con
 * las de otra. Una cara se guarda como su plano y la región que ocupa en él
 * (polígono, disco o, para un semiespacio, el plano entero), porque para
 * recortar una recta contra ella basta con eso.
 */
import type { P2 } from '../diedrico.ts';
import type { Curva3 } from './curvas.ts';
import { aMundo, type Primitiva } from './pieza.ts';
import { areaConSigno, distanciaAlBorde, enPoligono } from './plano2d.ts';
import { CASI_CERO, HOLGURA_NUMERICA, TOL_EXACTA } from './tolerancias.ts';
import { escalar3, por3, resta3, suma3, unitario3, type V3 } from './vector.ts';

export type Region =
  | { readonly tipo: 'poligono'; readonly puntos: readonly P2[] }
  | { readonly tipo: 'disco'; readonly r: number }
  | { readonly tipo: 'todo' };

/** Una cara plana: el plano n·q = d, con n hacia fuera de su primitiva, y la
 *  región en las coordenadas (u, v) del plano, con origen en `o`. */
export interface CaraPlana {
  readonly prim: number;
  readonly n: V3;
  readonly d: number;
  readonly o: V3;
  readonly u: V3;
  readonly v: V3;
  readonly region: Region;
}

/** La superficie de un cilindro o de un cono: o + w·eje + r(w)·(cos θ·e1 +
 *  sen θ·e2), con r lineal de r0 en w0 a r1 en w1. */
export interface SuperficieCurva {
  readonly prim: number;
  readonly o: V3;
  readonly eje: V3;
  readonly e1: V3;
  readonly e2: V3;
  readonly w0: number;
  readonly w1: number;
  readonly r0: number;
  readonly r1: number;
}

/** Holgura para decir que un punto está en una región: la de lo exacto. */
export const HOLGURA_REGION = TOL_EXACTA;

const cara = (prim: number, n: V3, o: V3, u: V3, v: V3, region: Region): CaraPlana => ({ prim, n, d: escalar3(n, o), o, u, v, region });

const yaCalculadas = new WeakMap<Primitiva, CaraPlana[]>();

/** Las caras planas de una primitiva. Se guardan: la prueba del pliegue las
 *  pide en cada punto llano. */
export function carasDe(p: Primitiva): CaraPlana[] {
  const ya = yaCalculadas.get(p);
  if (ya) return ya;
  const r = calculaCaras(p);
  yaCalculadas.set(p, r);
  return r;
}

function calculaCaras(p: Primitiva): CaraPlana[] {
  const { marco: m, forma: f, indice: i } = p;
  const [e0, e1, e2] = m.e;
  if (f.tipo === 'caja') {
    const r: CaraPlana[] = [];
    for (let k = 0; k < 3; k++) {
      const [a, b] = [(k + 1) % 3, (k + 2) % 3];
      for (const lado of [-1, 1] as const) {
        const l: [number, number, number] = [0, 0, 0];
        l[k] = lado < 0 ? f.min[k] : f.max[k];
        const rect: P2[] = [
          [f.min[a], f.min[b]],
          [f.max[a], f.min[b]],
          [f.max[a], f.max[b]],
          [f.min[a], f.max[b]],
        ];
        r.push(cara(i, por3(m.e[k], lado), aMundo(m, l), m.e[a], m.e[b], { tipo: 'poligono', puntos: rect }));
      }
    }
    return r;
  }
  if (f.tipo === 'prisma') {
    const pol = f.poligono;
    const r: CaraPlana[] = [
      cara(i, por3(e2, -1), aMundo(m, [0, 0, f.w0]), e0, e1, { tipo: 'poligono', puntos: pol }),
      cara(i, e2, aMundo(m, [0, 0, f.w1]), e0, e1, { tipo: 'poligono', puntos: pol }),
    ];
    const giro = areaConSigno(pol) > 0 ? 1 : -1;
    for (let k = 0; k < pol.length; k++) {
      const [a, b] = [pol[k], pol[(k + 1) % pol.length]];
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const [dx, dy] = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
      const n = unitario3(suma3(por3(e0, dy * giro), por3(e1, -dx * giro)));
      const u = unitario3(suma3(por3(e0, dx), por3(e1, dy)));
      const rect: P2[] = [
        [0, f.w0],
        [L, f.w0],
        [L, f.w1],
        [0, f.w1],
      ];
      r.push(cara(i, n, aMundo(m, [a[0], a[1], 0]), u, e2, { tipo: 'poligono', puntos: rect }));
    }
    return r;
  }
  if (f.tipo === 'cilindro' || f.tipo === 'cono') {
    const [r0, r1] = f.tipo === 'cilindro' ? [f.r, f.r] : [f.r0, f.r1];
    const r: CaraPlana[] = [];
    if (r0 > 0) r.push(cara(i, por3(e2, -1), aMundo(m, [0, 0, f.w0]), e0, e1, { tipo: 'disco', r: r0 }));
    if (r1 > 0) r.push(cara(i, e2, aMundo(m, [0, 0, f.w1]), e0, e1, { tipo: 'disco', r: r1 }));
    return r;
  }
  return [cara(i, e2, m.o, e0, e1, { tipo: 'todo' })];
}

/** La superficie curva de una primitiva, si la tiene. */
export function superficieDe(p: Primitiva): SuperficieCurva | null {
  const f = p.forma;
  if (f.tipo !== 'cilindro' && f.tipo !== 'cono') return null;
  const [r0, r1] = f.tipo === 'cilindro' ? [f.r, f.r] : [f.r0, f.r1];
  return { prim: p.indice, o: p.marco.o, eje: p.marco.e[2], e1: p.marco.e[0], e2: p.marco.e[1], w0: f.w0, w1: f.w1, r0, r1 };
}

/** El radio de la superficie en la altura w. */
export const radioDeSuperficie = (s: SuperficieCurva, w: number): number => s.r0 + ((s.r1 - s.r0) * (w - s.w0)) / (s.w1 - s.w0);

/** Un punto de la superficie. */
export const puntoDeSuperficie = (s: SuperficieCurva, theta: number, w: number): V3 =>
  suma3(suma3(s.o, por3(s.eje, w)), suma3(por3(s.e1, radioDeSuperficie(s, w) * Math.cos(theta)), por3(s.e2, radioDeSuperficie(s, w) * Math.sin(theta))));

/** Las aristas propias de una primitiva: las de sus caras y sus bordes
 *  circulares. Cada una, una vez. */
export function aristasDe(p: Primitiva): Curva3[] {
  const { marco: m, forma: f } = p;
  if (f.tipo === 'caja') {
    const r: Curva3[] = [];
    const esquina = (bits: number): V3 => aMundo(m, [bits & 1 ? f.max[0] : f.min[0], bits & 2 ? f.max[1] : f.min[1], bits & 4 ? f.max[2] : f.min[2]]);
    for (let a = 0; a < 8; a++) for (const bit of [1, 2, 4]) if (!(a & bit)) r.push({ tipo: 'segmento', a: esquina(a), b: esquina(a | bit) });
    return r;
  }
  if (f.tipo === 'prisma') {
    const r: Curva3[] = [];
    const pol = f.poligono;
    for (let k = 0; k < pol.length; k++) {
      const [a, b] = [pol[k], pol[(k + 1) % pol.length]];
      for (const w of [f.w0, f.w1]) r.push({ tipo: 'segmento', a: aMundo(m, [a[0], a[1], w]), b: aMundo(m, [b[0], b[1], w]) });
      r.push({ tipo: 'segmento', a: aMundo(m, [a[0], a[1], f.w0]), b: aMundo(m, [a[0], a[1], f.w1]) });
    }
    return r;
  }
  const s = superficieDe(p);
  if (!s) return [];
  const r: Curva3[] = [];
  for (const [w, radio] of [
    [s.w0, s.r0],
    [s.w1, s.r1],
  ] as const) {
    if (radio > 0) r.push({ tipo: 'arco', c: suma3(s.o, por3(s.eje, w)), e1: s.e1, e2: s.e2, r: radio, desde: 0, hasta: 2 * Math.PI });
  }
  return r;
}

/* ── La región de una cara ────────────────────────────────────────────── */

/** Las coordenadas (u, v) de un punto en el plano de la cara. */
export const enCara = (c: CaraPlana, q: V3): P2 => {
  const d = resta3(q, c.o);
  return [escalar3(d, c.u), escalar3(d, c.v)];
};

/** Si el punto (que está en el plano) cae en la región de la cara, con el
 *  borde dentro. */
export function enRegion(c: CaraPlana, q: V3, holgura = HOLGURA_REGION): boolean {
  const [u, v] = enCara(c, q);
  if (c.region.tipo === 'todo') return true;
  if (c.region.tipo === 'disco') return Math.hypot(u, v) <= c.region.r + holgura;
  return enPoligono(u, v, c.region.puntos) || distanciaAlBorde(u, v, c.region.puntos) <= holgura;
}

/**
 * Los intervalos de s en que la recta p0 + s·dir, que va por el plano de la
 * cara, cae en su región. Se cortan los bordes y los vértices que pasan por
 * la recta, y cada trozo se clasifica por su punto medio con el borde
 * dentro: una recta que va justo por el borde de una cara está en la cara,
 * por arriba y por abajo, que es lo que pide una arista de dos caras.
 */
export function intervalosEnCara(c: CaraPlana, p0: V3, dir: V3): [number, number][] {
  if (c.region.tipo === 'todo') return [[-Infinity, Infinity]];
  const [a0, a1] = enCara(c, p0);
  const [b0, b1] = [escalar3(dir, c.u), escalar3(dir, c.v)];
  const bb = b0 * b0 + b1 * b1;
  if (bb < HOLGURA_NUMERICA ** 2) return [];
  if (c.region.tipo === 'disco') {
    const r = c.region.r + HOLGURA_REGION;
    const pb = a0 * b0 + a1 * b1;
    const disc = pb * pb - bb * (a0 * a0 + a1 * a1 - r * r);
    if (disc < 0) return [];
    const raiz = Math.sqrt(disc);
    return [[(-pb - raiz) / bb, (-pb + raiz) / bb]];
  }
  const pol = c.region.puntos;
  const cortes: number[] = [];
  for (let i = 0; i < pol.length; i++) {
    const [p, q] = [pol[i], pol[(i + 1) % pol.length]];
    const [ex, ey] = [q[0] - p[0], q[1] - p[1]];
    const den = b0 * ey - b1 * ex;
    /* el vértice, proyectado sobre la recta */
    cortes.push(((p[0] - a0) * b0 + (p[1] - a1) * b1) / bb);
    if (Math.abs(den) < CASI_CERO) continue;
    const s = ((p[0] - a0) * ey - (p[1] - a1) * ex) / den;
    const t = ((p[0] - a0) * b1 - (p[1] - a1) * b0) / den;
    if (t >= -HOLGURA_NUMERICA && t <= 1 + HOLGURA_NUMERICA) cortes.push(s);
  }
  cortes.sort((x, y) => x - y);
  const r: [number, number][] = [];
  for (let k = 0; k + 1 < cortes.length; k++) {
    const [s0, s1] = [cortes[k], cortes[k + 1]];
    if (s1 - s0 < CASI_CERO) continue;
    const m = (s0 + s1) / 2;
    const [u, v] = [a0 + m * b0, a1 + m * b1];
    if (!(enPoligono(u, v, pol) || distanciaAlBorde(u, v, pol) <= HOLGURA_REGION)) continue;
    if (r.length && Math.abs(r[r.length - 1][1] - s0) < CASI_CERO) r[r.length - 1][1] = s1;
    else r.push([s0, s1]);
  }
  return r;
}
