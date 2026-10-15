/**
 * Tema 13 de ERM (con el 12): barras quebradas en el espacio, empotradas en
 * un extremo —la «barra quebrada espacial» de los exámenes—, con flexión,
 * torsión, axil y cortante; sus esfuerzos, su coenergía, los desplazamientos
 * y giros por Engesser-Castigliano con la fuerza unitaria, y el hiperestático
 * por Menabrea con apoyos, resortes y tirantes.
 *
 * Para quién: para el alumno de la 2.ª parte y la final; la familia
 * «castigliano-espacial» (una barra quebrada ABC… empotrada en A con fuerzas
 * en el extremo, E = 2,5G, «desplazamiento de C» o «F para que C no se
 * mueva») es el problema de energía que más se repite en los exámenes leídos
 * (`p0`). Qué gana: los Mt y M de cada tramo, que a mano se confunden al
 * cambiar de barra, y el δ = ∫M·m/EI + ∫Mt·mt/GIt sumado entero. Cómo se
 * comprueba: `tests/fisica/erm/espacial.test.ts` (la barra en L con su
 * fórmula cerrada Pb³/3EI + Pa³/3EI + Pb²a/GIt; las barras planas contra
 * `energia.ts`, que es otro motor —el del tema 7—, también en el signo de M;
 * la derivada numérica de la coenergía; Maxwell-Betti).
 *
 * Es un modelo nuevo porque el resto del motor es plano: `estructura.ts` no
 * tiene torsión ni flexión fuera del plano. Su convenio es el mismo:
 *
 *   · El esfuerzo de una sección de la barra i→j es lo que la parte del lado
 *     +x (hacia j) ejerce sobre la del lado −x, con x local de i a j (tema 7,
 *     pp. 8-9, como en `estructura.ts`): N = R·x (> 0 tracción) y Mt = M·x,
 *     positivo según la regla de la mano derecha sobre +x (tema 12).
 *   · Si se da la dirección del eje z local de la sección (`ejeZ`), y = z × x
 *     y M_G = Mt·i + My·j − Mz·k (tema 7 y fig. 9.3 del tema 9, p. 6): así
 *     My = M·y, Mz = −M·z, Ty = R·y y Tz = R·z. En una viga horizontal según
 *     +X con Z global hacia arriba, ejeZ = +Y da y local hacia abajo y Mz es
 *     el M de `estructura.ts` (el test lo exige).
 *   · Coenergía (tema 13, tabla de la p. 16): N²/2EA + Mt²/2GIt + My²/2EIy +
 *     Mz²/2EIz + χ(Ty² + Tz²)/2GA. Con una sola EI (sección de dos ejes de
 *     simetría con Iy = Iz: circular, cuadrada), |Mflector|²/2EI y no hace
 *     falta ejeZ. Sin EA, GIt o GA, ese término no se cuenta (lo que el
 *     enunciado manda despreciar).
 *   · Desplazamientos en el sentido de la carga unidad; giros según la regla
 *     de la mano derecha sobre su dirección. Relativo de dos nudos: δ > 0 es
 *     acercamiento (ecs. 13.49-13.50). Hiperestáticos: ec. 13.51 (un apoyo,
 *     δ dado o −X/k con un resorte) y 13.53 (un tirante, X > 0 tracción, el
 *     acercamiento de sus extremos es −(X·L/EA + ε0·L)).
 *
 * Las coordenadas son globales, en un triedro directo cualquiera.
 */
import { integra } from './elastica';
import { resuelveLineal } from './lineal';
import { dot, norma, unitario, type Vec3 } from './tensor';

export interface Nudo3 {
  id: string;
  p: Vec3;
}

export interface Rigidez3 {
  /** Una sola rigidez a flexión (Iy = Iz), o las dos con el eje z local de la sección. */
  EI?: number;
  EIy?: number;
  EIz?: number;
  ejeZ?: Vec3;
  GIt?: number;
  EA?: number;
  GA?: number;
  chi?: number;
}

export interface Barra3 {
  id: string;
  i: string;
  j: string;
  rig: Rigidez3;
}

/** Una fuerza y un par en un nudo, o una carga repartida uniforme por unidad de longitud de barra. */
export type Carga3 = { tipo: 'nudo'; nudo: string; F?: Vec3; M?: Vec3 } | { tipo: 'repartida'; barra: string; w: Vec3 };

/** Barras sin ciclos, empotradas en un único nudo. */
export interface Arbol {
  nudos: readonly Nudo3[];
  barras: readonly Barra3[];
  empotramiento: string;
  cargas: readonly Carga3[];
}

/* ─── Vectores ─── */

const suma = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const resta = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const escala = (k: number, a: Vec3): Vec3 => [k * a[0], k * a[1], k * a[2]];
export const vectorial = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const CERO: Vec3 = [0, 0, 0];

/* ─── La topología: qué queda del lado libre de cada barra ─── */

interface BarraOrientada {
  barra: Barra3;
  pi: Vec3;
  pj: Vec3;
  L: number;
  e: Vec3;
  /** true si el lado libre (lejos del empotramiento) es el de j. */
  haciaJ: boolean;
  /** Nudos y barras que cuelgan del extremo libre. */
  nudosLibres: Set<string>;
  barrasLibres: Set<string>;
}

const cache = new WeakMap<Arbol, Map<string, BarraOrientada>>();

function topologia(a: Arbol): Map<string, BarraOrientada> {
  const hecho = cache.get(a);
  if (hecho) return hecho;
  const pos = new Map(a.nudos.map((n) => [n.id, n.p]));
  if (pos.size !== a.nudos.length) throw new Error('Hay dos nudos con el mismo nombre.');
  if (!pos.has(a.empotramiento)) throw new Error(`No existe el nudo empotrado «${a.empotramiento}».`);
  for (const b of a.barras) {
    if (!pos.has(b.i) || !pos.has(b.j)) throw new Error(`La barra «${b.id}» une nudos que no existen.`);
  }
  if (a.barras.length !== a.nudos.length - 1) throw new Error('Las barras tienen que formar un árbol: tantas como nudos menos uno, sin ciclos.');
  /* recorrido desde el empotramiento */
  const padre = new Map<string, string>([[a.empotramiento, '']]);
  const hijosDe = new Map<string, Barra3[]>();
  const cola = [a.empotramiento];
  while (cola.length) {
    const n = cola.shift() as string;
    for (const b of a.barras) {
      const otro = b.i === n ? b.j : b.j === n ? b.i : null;
      if (otro === null || padre.get(n) === b.id) continue;
      if (padre.has(otro)) throw new Error('Las barras forman un ciclo: no es un árbol.');
      padre.set(otro, b.id);
      hijosDe.set(n, [...(hijosDe.get(n) ?? []), b]);
      cola.push(otro);
    }
  }
  if (padre.size !== a.nudos.length) throw new Error('Hay nudos que no están unidos al empotramiento.');
  const colgando = (n: string, nudos: Set<string>, barras: Set<string>) => {
    nudos.add(n);
    for (const b of hijosDe.get(n) ?? []) {
      barras.add(b.id);
      colgando(b.i === n ? b.j : b.i, nudos, barras);
    }
  };
  const out = new Map<string, BarraOrientada>();
  for (const b of a.barras) {
    const pi = pos.get(b.i) as Vec3;
    const pj = pos.get(b.j) as Vec3;
    const L = norma(resta(pj, pi));
    if (!(L > 0)) throw new Error(`La barra «${b.id}» tiene longitud nula.`);
    const haciaJ = padre.get(b.j) === b.id;
    const nudosLibres = new Set<string>();
    const barrasLibres = new Set<string>();
    colgando(haciaJ ? b.j : b.i, nudosLibres, barrasLibres);
    out.set(b.id, { barra: b, pi, pj, L, e: unitario(resta(pj, pi)), haciaJ, nudosLibres, barrasLibres });
  }
  cache.set(a, out);
  return out;
}

function orientada(a: Arbol, id: string): BarraOrientada {
  const o = topologia(a).get(id);
  if (!o) throw new Error(`No existe la barra «${id}».`);
  return o;
}

/* ─── Esfuerzos ─── */

/** Fuerza R y momento M (globales) de la sección a distancia s de i, con el convenio de la cabecera. */
export function resultanteEn(a: Arbol, barraId: string, s: number): { R: Vec3; M: Vec3; P: Vec3 } {
  const o = orientada(a, barraId);
  const P = suma(o.pi, escala(s, o.e));
  const pos = new Map(a.nudos.map((n) => [n.id, n.p]));
  let F: Vec3 = CERO;
  let M: Vec3 = CERO;
  const anade = (r: Vec3, f: Vec3) => {
    F = suma(F, f);
    M = suma(M, vectorial(resta(r, P), f));
  };
  for (const c of a.cargas) {
    if (c.tipo === 'nudo') {
      if (!pos.has(c.nudo)) throw new Error(`La carga va a un nudo que no existe: «${c.nudo}».`);
      if (!o.nudosLibres.has(c.nudo)) continue;
      anade(pos.get(c.nudo) as Vec3, c.F ?? CERO);
      M = suma(M, c.M ?? CERO);
      continue;
    }
    if (c.barra === barraId) {
      /* el trozo de la propia barra del lado libre */
      const [s0, s1] = o.haciaJ ? [s, o.L] : [0, s];
      if (s1 > s0) anade(suma(o.pi, escala((s0 + s1) / 2, o.e)), escala(s1 - s0, c.w));
    } else if (o.barrasLibres.has(c.barra)) {
      const q = orientada(a, c.barra);
      anade(escala(0.5, suma(q.pi, q.pj)), escala(q.L, c.w));
    }
  }
  return o.haciaJ ? { R: F, M, P } : { R: escala(-1, F), M: escala(-1, M), P };
}

export interface Esfuerzos3 {
  N: number;
  Mt: number;
  /** Cortante y flector como vectores globales, perpendiculares a la barra. */
  T: Vec3;
  Mf: Vec3;
  /** Componentes locales, si la barra lleva `ejeZ`. */
  Ty?: number;
  Tz?: number;
  My?: number;
  Mz?: number;
}

function ejesLocales(o: BarraOrientada): { ey: Vec3; ez: Vec3 } | null {
  const z = o.barra.rig.ejeZ;
  if (!z) return null;
  const zp = resta(z, escala(dot(z, o.e), o.e));
  if (!(norma(zp) > 1e-12 * norma(z))) throw new Error(`El eje z de la barra «${o.barra.id}» no puede ir según la barra.`);
  const ez = unitario(zp);
  return { ey: vectorial(ez, o.e), ez };
}

export function esfuerzos3(a: Arbol, barraId: string, s: number): Esfuerzos3 {
  const o = orientada(a, barraId);
  const { R, M } = resultanteEn(a, barraId, s);
  const N = dot(R, o.e);
  const Mt = dot(M, o.e);
  const out: Esfuerzos3 = { N, Mt, T: resta(R, escala(N, o.e)), Mf: resta(M, escala(Mt, o.e)) };
  const ejes = ejesLocales(o);
  if (ejes) {
    out.Ty = dot(R, ejes.ey);
    out.Tz = dot(R, ejes.ez);
    out.My = dot(M, ejes.ey);
    out.Mz = -dot(M, ejes.ez);
  }
  return out;
}

/* ─── Energía ─── */

/** La forma bilineal de la coenergía en una sección (la mitad de ella consigo misma es la densidad). */
function bilineal(o: BarraOrientada, x: Esfuerzos3, y: Esfuerzos3): { N: number; Mt: number; Mf: number; T: number } {
  const r = o.barra.rig;
  let Mf = 0;
  if (r.EIy !== undefined || r.EIz !== undefined) {
    if (!(r.EIy && r.EIy > 0 && r.EIz && r.EIz > 0) || !r.ejeZ) {
      throw new Error(`La barra «${o.barra.id}» con EIy y EIz necesita las dos, positivas, y su ejeZ.`);
    }
    Mf = ((x.My as number) * (y.My as number)) / r.EIy + ((x.Mz as number) * (y.Mz as number)) / r.EIz;
  } else if (r.EI !== undefined) {
    if (!(r.EI > 0)) throw new Error(`La barra «${o.barra.id}» necesita EI > 0.`);
    Mf = dot(x.Mf, y.Mf) / r.EI;
  }
  return {
    N: r.EA ? (x.N * y.N) / r.EA : 0,
    Mt: r.GIt ? (x.Mt * y.Mt) / r.GIt : 0,
    Mf,
    T: r.GA ? ((r.chi ?? 6 / 5) * dot(x.T, y.T)) / r.GA : 0,
  };
}

/** ∫ de la forma bilineal entre dos estados de cargas sobre la misma geometría, por términos. */
function productoTerminos(a: Arbol, b: Arbol): { N: number; Mt: number; Mf: number; T: number } {
  const t = { N: 0, Mt: 0, Mf: 0, T: 0 };
  for (const barra of a.barras) {
    const o = orientada(a, barra.id);
    for (const k of ['N', 'Mt', 'Mf', 'T'] as const) {
      t[k] += integra((s) => bilineal(o, esfuerzos3(a, barra.id, s), esfuerzos3(b, barra.id, s))[k], 0, o.L, []);
    }
  }
  return t;
}

export function producto3(a: Arbol, b: Arbol): number {
  const t = productoTerminos(a, b);
  return t.N + t.Mt + t.Mf + t.T;
}

export interface Coenergia3 {
  total: number;
  N: number;
  Mt: number;
  Mf: number;
  T: number;
}

export function coenergia3(a: Arbol): Coenergia3 {
  const t = productoTerminos(a, a);
  const c = { N: t.N / 2, Mt: t.Mt / 2, Mf: t.Mf / 2, T: t.T / 2 };
  return { ...c, total: c.N + c.Mt + c.Mf + c.T };
}

/** Reacción del empotramiento: fuerza y par (respecto del nudo empotrado). */
export function reaccionEmpotramiento(a: Arbol): { F: Vec3; M: Vec3 } {
  const pos = new Map(a.nudos.map((n) => [n.id, n.p]));
  const pc = pos.get(a.empotramiento) as Vec3;
  let F: Vec3 = CERO;
  let M: Vec3 = CERO;
  for (const c of a.cargas) {
    let r: Vec3;
    let f: Vec3;
    if (c.tipo === 'nudo') {
      r = pos.get(c.nudo) as Vec3;
      f = c.F ?? CERO;
      M = suma(M, c.M ?? CERO);
    } else {
      const q = orientada(a, c.barra);
      r = escala(0.5, suma(q.pi, q.pj));
      f = escala(q.L, c.w);
    }
    F = suma(F, f);
    M = suma(M, vectorial(resta(r, pc), f));
  }
  return { F: escala(-1, F), M: escala(-1, M) };
}

/* ─── Desplazamientos ─── */

export type Unidad3 =
  | { tipo: 'fuerza'; nudo: string; direccion: Vec3 }
  | { tipo: 'momento'; nudo: string; direccion: Vec3 }
  | { tipo: 'relativo'; a: string; b: string }
  | { tipo: 'haciaPunto'; nudo: string; punto: Vec3 };

function cargasUnidad(a: Arbol, u: Unidad3, X = 1): Carga3[] {
  const pos = new Map(a.nudos.map((n) => [n.id, n.p]));
  const p = (id: string) => {
    const v = pos.get(id);
    if (!v) throw new Error(`No existe el nudo «${id}».`);
    return v;
  };
  if (u.tipo === 'relativo') {
    const e = unitario(resta(p(u.b), p(u.a)));
    return [
      { tipo: 'nudo', nudo: u.a, F: escala(X, e) },
      { tipo: 'nudo', nudo: u.b, F: escala(-X, e) },
    ];
  }
  if (u.tipo === 'haciaPunto') return [{ tipo: 'nudo', nudo: u.nudo, F: escala(X, unitario(resta(u.punto, p(u.nudo)))) }];
  p(u.nudo);
  const e = unitario(u.direccion);
  return [u.tipo === 'fuerza' ? { tipo: 'nudo', nudo: u.nudo, F: escala(X, e) } : { tipo: 'nudo', nudo: u.nudo, M: escala(X, e) }];
}

/** δ (o el giro) en el sentido de la carga unidad: ∫ de la forma bilineal entre las cargas y la unidad. */
export function desplazamiento3(a: Arbol, u: Unidad3): number {
  return producto3(a, { ...a, cargas: cargasUnidad(a, u) });
}

/* ─── Hiperestático ─── */

export type Redundante3 =
  | { tipo: 'fuerza' | 'momento'; nudo: string; direccion: Vec3; impuesto?: number; k?: number }
  | { tipo: 'tirante'; a: string; b?: string; punto?: Vec3; EA: number; eps0?: number };

export interface Menabrea3 {
  X: number[];
  d0: number[];
  d: number[][];
  final: Arbol;
}

function unidadDe(r: Redundante3): Unidad3 {
  if (r.tipo !== 'tirante') return { tipo: r.tipo, nudo: r.nudo, direccion: r.direccion };
  if (r.b !== undefined) return { tipo: 'relativo', a: r.a, b: r.b };
  if (!r.punto) throw new Error('Un tirante necesita el otro nudo (b) o el punto fijo donde se ancla.');
  return { tipo: 'haciaPunto', nudo: r.a, punto: r.punto };
}

export function menabrea3(base: Arbol, redundantes: readonly Redundante3[]): Menabrea3 {
  if (redundantes.length === 0) throw new Error('Hace falta al menos una incógnita hiperestática.');
  topologia(base);
  const unidades = redundantes.map((r) => ({ ...base, cargas: cargasUnidad(base, unidadDe(r)) }));
  const d0 = unidades.map((u) => producto3(base, u));
  const d = unidades.map((ui) => unidades.map((uj) => producto3(uj, ui)));
  const pos = new Map(base.nudos.map((n) => [n.id, n.p]));
  const conds = redundantes.map((r) => {
    if (r.tipo === 'tirante') {
      if (!(r.EA > 0)) throw new Error('El tirante necesita EA > 0.');
      const pa = pos.get(r.a) as Vec3;
      const pb = r.b !== undefined ? (pos.get(r.b) as Vec3) : (r.punto as Vec3);
      const L = norma(resta(pb, pa));
      return { flex: L / r.EA, objetivo: -(r.eps0 ?? 0) * L };
    }
    if (r.k !== undefined) {
      if (!(r.k > 0)) throw new Error('La rigidez del resorte tiene que ser positiva.');
      return { flex: 1 / r.k, objetivo: 0 };
    }
    return { flex: 0, objetivo: r.impuesto ?? 0 };
  });
  const A = d.map((fila, i) => fila.map((dij, j) => dij + (i === j ? conds[i].flex : 0)));
  const b = conds.map((c, i) => c.objetivo - d0[i]);
  const s = resuelveLineal(A, b);
  if (s.rango < redundantes.length) throw new Error('Las redundantes elegidas no son independientes.');
  const X = s.x;
  const final: Arbol = { ...base, cargas: [...base.cargas, ...redundantes.flatMap((r, i) => cargasUnidad(base, unidadDe(r), X[i]))] };
  return { X, d0, d, final };
}
