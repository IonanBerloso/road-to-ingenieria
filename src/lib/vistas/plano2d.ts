/**
 * La geometría del papel: las líneas de una vista, cómo se funden y cómo se
 * parten.
 *
 * FUNDIR CON PRIORIDAD (§3.2, paso 5). En una vista caen muchas veces varias
 * aristas sobre la misma línea: la de delante y la de detrás de una caja,
 * la circunferencia de arriba y la de abajo de un taladro. Se agrupan las
 * rectas por su recta y los arcos por su círculo, se unen los trozos de cada
 * clase, y una clase de más prioridad tapa a las de menos: lo visto tapa lo
 * oculto (NyV p. 4; LIBRO p. 59).
 *
 * PARTIR EN LOS CRUCES. Una línea se parte en cada punto donde la toca otra
 * de la vista, para que trazar de vértice a vértice valga con `casaTramo`
 * tal como está (`lib/diedrico-corrige`): un trazo de punta a punta de
 * tramos seguidos del mismo tipo se da por bueno de un tirón, y uno que
 * acaba donde no cambia nada es «corte». Partir de más no estorba; partir
 * de menos, sí.
 *
 * Los arcos van en grados, medidos con atan2 en el papel (la v hacia abajo),
 * de `desde` a `hasta` creciendo: la misma convención que el arco de compás
 * de la receta (`arco()` en `diedrico-receta-funciones`).
 */
import type { P2 } from '../diedrico.ts';
import { ASTILLA, CASI_CERO, HOLGURA_NUMERICA, LARGO_MINIMO, REDONDEO, SENO_PARALELAS, TOL_CONTACTO, TOL_FUSION } from './tolerancias.ts';

export type Forma2 =
  | { readonly tipo: 'segmento'; readonly a: P2; readonly b: P2 }
  | { readonly tipo: 'arco'; readonly c: P2; readonly r: number; readonly desde: number; readonly hasta: number }
  | { readonly tipo: 'polilinea'; readonly puntos: readonly P2[] };

/** Un trazo de una vista con su clase (vista u oculta, mismo plano o
 *  tangencia…), las primitivas de las que sale y una frase. */
export interface Trazo<C extends string> {
  readonly forma: Forma2;
  readonly clase: C;
  readonly de: readonly string[];
  readonly texto: string;
}


const GRADOS = 180 / Math.PI;
const dist = (p: P2, q: P2) => Math.hypot(p[0] - q[0], p[1] - q[1]);
/** Un número sin la basura de las cuentas, y sin el −0. */
export const limpio = (n: number): number => Math.round(n * REDONDEO) / REDONDEO || 0;
const punto = (x: number, y: number): P2 => [limpio(x), limpio(y)];

/* ── Polígonos ────────────────────────────────────────────────────────── */

export function areaConSigno(pol: readonly P2[]): number {
  let a = 0;
  for (let i = 0; i < pol.length; i++) {
    const [p, q] = [pol[i], pol[(i + 1) % pol.length]];
    a += p[0] * q[1] - q[0] * p[1];
  }
  return a / 2;
}

/** Par e impar: si (u, v) está dentro del polígono. */
export function enPoligono(u: number, v: number, pol: readonly P2[]): boolean {
  let dentro = false;
  for (let i = 0, j = pol.length - 1; i < pol.length; j = i++) {
    const [a, b] = [pol[i], pol[j]];
    if (a[1] > v !== b[1] > v && u < ((b[0] - a[0]) * (v - a[1])) / (b[1] - a[1]) + a[0]) dentro = !dentro;
  }
  return dentro;
}

/** La distancia de (u, v) al borde del polígono. */
export function distanciaAlBorde(u: number, v: number, pol: readonly P2[]): number {
  let mejor = Infinity;
  for (let i = 0; i < pol.length; i++) mejor = Math.min(mejor, distanciaASegmento([u, v], pol[i], pol[(i + 1) % pol.length]));
  return mejor;
}

export function distanciaASegmento(p: P2, a: P2, b: P2): number {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const L2 = dx * dx + dy * dy;
  const s = L2 < CASI_CERO ** 2 ? 0 : Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L2));
  return Math.hypot(p[0] - a[0] - s * dx, p[1] - a[1] - s * dy);
}

/** El polígono sin vértices repetidos: ni dos seguidos iguales ni el de
 *  cierre, que quien escribe un polígono a mano pone a menudo. */
export function limpiaPoligono(pol: readonly P2[]): P2[] {
  const r: P2[] = [];
  for (const p of pol) if (!r.length || Math.hypot(p[0] - r[r.length - 1][0], p[1] - r[r.length - 1][1]) >= LARGO_MINIMO) r.push(p);
  while (r.length > 1 && Math.hypot(r[0][0] - r[r.length - 1][0], r[0][1] - r[r.length - 1][1]) < LARGO_MINIMO) r.pop();
  return r;
}

/** Si dos segmentos se tocan o se cortan. */
function seTocanSegmentos(a: P2, b: P2, c: P2, d: P2): boolean {
  const orienta = (p: P2, q: P2, r: P2) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
  const [o1, o2, o3, o4] = [orienta(a, b, c), orienta(a, b, d), orienta(c, d, a), orienta(c, d, b)];
  if (((o1 > 0 && o2 < 0) || (o1 < 0 && o2 > 0)) && ((o3 > 0 && o4 < 0) || (o3 < 0 && o4 > 0))) return true;
  return [distanciaASegmento(c, a, b), distanciaASegmento(d, a, b), distanciaASegmento(a, c, d), distanciaASegmento(b, c, d)].some((x) => x < LARGO_MINIMO);
}

/** Los pares de lados que no son vecinos. */
function ladosNoVecinos(pol: readonly P2[]): [P2, P2, P2, P2][] {
  const n = pol.length;
  const r: [P2, P2, P2, P2][] = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue;
      r.push([pol[i], pol[(i + 1) % n], pol[j], pol[(j + 1) % n]]);
    }
  }
  return r;
}

/** Si el polígono se corta o se toca a sí mismo: dos lados que no son
 *  vecinos se encuentran. */
export const seCortaASiMismo = (pol: readonly P2[]): boolean => ladosNoVecinos(pol).some(([a, b, c, d]) => seTocanSegmentos(a, b, c, d));

/** Lo más estrecho del polígono: la menor distancia entre dos lados que no
 *  son vecinos. Una pared del perfil más fina que esto se borraría. */
export function estrechez(pol: readonly P2[]): number {
  let r = Infinity;
  for (const [a, b, c, d] of ladosNoVecinos(pol)) {
    r = Math.min(r, distanciaASegmento(c, a, b), distanciaASegmento(d, a, b), distanciaASegmento(a, c, d), distanciaASegmento(b, c, d));
  }
  return r;
}

/* ── Una forma ────────────────────────────────────────────────────────── */

/** El ángulo de p visto desde c, en grados, en [0, 360). */
const anguloDesde = (c: P2, p: P2): number => {
  const a = Math.atan2(p[1] - c[1], p[0] - c[0]) * GRADOS;
  return a < 0 ? a + 360 : a;
};

/** Si el ángulo `a` cae en el arco, con una holgura en grados. */
function enArco(f: Extract<Forma2, { tipo: 'arco' }>, a: number, holgura: number): boolean {
  if (f.hasta - f.desde >= 360 - HOLGURA_NUMERICA) return true;
  const x = (((a - f.desde) % 360) + 360) % 360;
  return x <= f.hasta - f.desde + holgura || x >= 360 - holgura;
}

export function largoDe(f: Forma2): number {
  if (f.tipo === 'segmento') return dist(f.a, f.b);
  if (f.tipo === 'arco') return (f.r * (f.hasta - f.desde)) / GRADOS;
  let l = 0;
  for (let i = 1; i < f.puntos.length; i++) l += dist(f.puntos[i - 1], f.puntos[i]);
  return l;
}

/** El punto a una distancia s del principio, recorriendo la forma. */
export function puntoDe(f: Forma2, s: number): P2 {
  if (f.tipo === 'segmento') {
    const L = dist(f.a, f.b);
    const t = L < CASI_CERO ? 0 : s / L;
    return [f.a[0] + (f.b[0] - f.a[0]) * t, f.a[1] + (f.b[1] - f.a[1]) * t];
  }
  if (f.tipo === 'arco') {
    const a = (f.desde + (s / f.r) * GRADOS) / GRADOS;
    return [f.c[0] + f.r * Math.cos(a), f.c[1] + f.r * Math.sin(a)];
  }
  let resto = s;
  for (let i = 1; i < f.puntos.length; i++) {
    const l = dist(f.puntos[i - 1], f.puntos[i]);
    if (resto <= l || i === f.puntos.length - 1) {
      const t = l < CASI_CERO ? 0 : Math.min(1, resto / l);
      return [f.puntos[i - 1][0] + (f.puntos[i][0] - f.puntos[i - 1][0]) * t, f.puntos[i - 1][1] + (f.puntos[i][1] - f.puntos[i - 1][1]) * t];
    }
    resto -= l;
  }
  return f.puntos[0];
}

/** Dónde cae p sobre la forma, como distancia desde su principio, y a
 *  cuánto está de ella. */
export function proyectaEnForma(f: Forma2, p: P2): { s: number; d: number } {
  if (f.tipo === 'segmento') {
    const L = dist(f.a, f.b);
    const [ux, uy] = [(f.b[0] - f.a[0]) / L, (f.b[1] - f.a[1]) / L];
    const s = Math.max(0, Math.min(L, (p[0] - f.a[0]) * ux + (p[1] - f.a[1]) * uy));
    return { s, d: dist(p, [f.a[0] + ux * s, f.a[1] + uy * s]) };
  }
  if (f.tipo === 'arco') {
    const a = anguloDesde(f.c, p);
    const x = (((a - f.desde) % 360) + 360) % 360;
    const span = f.hasta - f.desde;
    if (x <= span) return { s: (f.r * x) / GRADOS, d: Math.abs(dist(p, f.c) - f.r) };
    const [ini, fin] = [puntoDe(f, 0), puntoDe(f, largoDe(f))];
    return dist(p, ini) <= dist(p, fin) ? { s: 0, d: dist(p, ini) } : { s: largoDe(f), d: dist(p, fin) };
  }
  let mejor = { s: 0, d: Infinity };
  let acumulado = 0;
  for (let i = 1; i < f.puntos.length; i++) {
    const seg: Forma2 = { tipo: 'segmento', a: f.puntos[i - 1], b: f.puntos[i] };
    const l = largoDe(seg);
    if (l > CASI_CERO) {
      const r = proyectaEnForma(seg, p);
      if (r.d < mejor.d) mejor = { s: acumulado + r.s, d: r.d };
    }
    acumulado += l;
  }
  return mejor;
}

export const distanciaAForma = (p: P2, f: Forma2): number => proyectaEnForma(f, p).d;

/** El trozo de la forma de s0 a s1 (distancias desde su principio). */
export function subForma(f: Forma2, s0: number, s1: number): Forma2 {
  if (f.tipo === 'segmento') {
    const [a, b] = [puntoDe(f, s0), puntoDe(f, s1)];
    return { tipo: 'segmento', a: punto(a[0], a[1]), b: punto(b[0], b[1]) };
  }
  if (f.tipo === 'arco') return { ...f, desde: limpio(f.desde + (s0 / f.r) * GRADOS), hasta: limpio(f.desde + (s1 / f.r) * GRADOS) };
  const puntos: P2[] = [puntoDe(f, s0)];
  let acumulado = 0;
  for (let i = 1; i < f.puntos.length; i++) {
    acumulado += dist(f.puntos[i - 1], f.puntos[i]);
    if (acumulado > s0 + HOLGURA_NUMERICA && acumulado < s1 - HOLGURA_NUMERICA) puntos.push(f.puntos[i]);
  }
  puntos.push(puntoDe(f, s1));
  return { tipo: 'polilinea', puntos };
}

/** Los puntos extremos de la forma en cada dirección del papel. */
export function encuadreDe(f: Forma2): { umin: number; umax: number; vmin: number; vmax: number } {
  let pts: P2[];
  if (f.tipo === 'segmento') pts = [f.a, f.b];
  else if (f.tipo === 'polilinea') pts = [...f.puntos];
  else {
    pts = [puntoDe(f, 0), puntoDe(f, largoDe(f))];
    for (const a of [0, 90, 180, 270]) {
      if (enArco(f, a, 0)) pts.push([f.c[0] + f.r * Math.cos(a / GRADOS), f.c[1] + f.r * Math.sin(a / GRADOS)]);
    }
  }
  return {
    umin: Math.min(...pts.map((p) => p[0])),
    umax: Math.max(...pts.map((p) => p[0])),
    vmin: Math.min(...pts.map((p) => p[1])),
    vmax: Math.max(...pts.map((p) => p[1])),
  };
}

/* ── Reconocer la forma de una proyección ─────────────────────────────── */

/**
 * Lo que es de verdad una polilínea proyectada: si todos sus puntos caen en
 * una recta, un segmento (de un extremo al otro, aunque la curva vaya y
 * vuelva, como una circunferencia vista de canto); si caen en una
 * circunferencia, un arco; si no, la polilínea.
 */
export function reconoce(puntos: readonly P2[]): Forma2 | null {
  if (puntos.length < 2) return null;
  /* La recta: por los dos puntos más alejados. */
  let [i0, i1, lejos] = [0, 0, -1];
  for (let i = 0; i < puntos.length; i++) {
    const d = dist(puntos[0], puntos[i]);
    if (d > lejos) [i1, lejos] = [i, d];
  }
  lejos = -1;
  for (let i = 0; i < puntos.length; i++) {
    const d = dist(puntos[i1], puntos[i]);
    if (d > lejos) [i0, lejos] = [i, d];
  }
  if (lejos < LARGO_MINIMO) return null;
  const [a, b] = [puntos[i0], puntos[i1]];
  if (puntos.every((p) => distanciaASegmento(p, a, b) < TOL_FUSION / 10)) return { tipo: 'segmento', a: punto(a[0], a[1]), b: punto(b[0], b[1]) };
  /* La circunferencia: por tres puntos repartidos. Los extremos de un trozo
     de polilínea caen en mitad de una cuerda, un poco dentro de la curva, y
     en un arco corto eso desplazaba el centro 0,06 mm: se toman los
     vértices de dentro cuando los hay, que sí están sobre la curva. */
  const dentroDe = puntos.length >= 5 ? 1 : 0;
  const [p, q, r] = [puntos[dentroDe], puntos[puntos.length >> 1], puntos[puntos.length - 1 - dentroDe]];
  const c = circuncentro(p, q, r) ?? circuncentro(p, puntos[puntos.length >> 2], q);
  if (c) {
    const radio = dist(c, q);
    if (puntos.every((x) => Math.abs(dist(c, x) - radio) < TOL_FUSION / 10)) {
      /* Los ángulos, seguidos, para saber de dónde a dónde va. */
      const angulos = [anguloDesde(c, puntos[0])];
      for (let i = 1; i < puntos.length; i++) {
        let x = anguloDesde(c, puntos[i]);
        while (x - angulos[i - 1] > 180) x -= 360;
        while (x - angulos[i - 1] < -180) x += 360;
        angulos.push(x);
      }
      let [desde, hasta] = [Math.min(...angulos), Math.max(...angulos)];
      if (hasta - desde > 360 - HOLGURA_NUMERICA) hasta = desde + 360;
      while (desde < 0) [desde, hasta] = [desde + 360, hasta + 360];
      return { tipo: 'arco', c: punto(c[0], c[1]), r: limpio(radio), desde: limpio(desde), hasta: limpio(hasta) };
    }
  }
  return { tipo: 'polilinea', puntos: puntos.map((x) => punto(x[0], x[1])) };
}

function circuncentro(a: P2, b: P2, c: P2): P2 | null {
  const d = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]));
  if (Math.abs(d) < HOLGURA_NUMERICA) return null;
  const [a2, b2, c2] = [a[0] ** 2 + a[1] ** 2, b[0] ** 2 + b[1] ** 2, c[0] ** 2 + c[1] ** 2];
  return [(a2 * (b[1] - c[1]) + b2 * (c[1] - a[1]) + c2 * (a[1] - b[1])) / d, (a2 * (c[0] - b[0]) + b2 * (a[0] - c[0]) + c2 * (b[0] - a[0])) / d];
}

/* ── Intervalos ───────────────────────────────────────────────────────── */

type Intervalo = readonly [number, number];

function une(xs: readonly Intervalo[]): Intervalo[] {
  const ord = [...xs].filter(([a, b]) => b - a > CASI_CERO).sort((x, y) => x[0] - y[0]);
  const r: [number, number][] = [];
  for (const [a, b] of ord) {
    if (r.length && a <= r[r.length - 1][1] + HOLGURA_NUMERICA) r[r.length - 1][1] = Math.max(r[r.length - 1][1], b);
    else r.push([a, b]);
  }
  return r;
}

function quita(xs: readonly Intervalo[], fuera: readonly Intervalo[]): Intervalo[] {
  let r: Intervalo[] = [...xs];
  for (const [c, d] of fuera) {
    r = r.flatMap(([a, b]): Intervalo[] => {
      if (d <= a || c >= b) return [[a, b]];
      const trozos: Intervalo[] = [];
      if (c > a) trozos.push([a, c]);
      if (d < b) trozos.push([d, b]);
      return trozos;
    });
  }
  return r.filter(([a, b]) => b - a > HOLGURA_NUMERICA);
}

/* ── Fundir con prioridad ─────────────────────────────────────────────── */

/** Un soporte común: una recta (origen y dirección) o un círculo. */
type Soporte = { readonly tipo: 'recta'; readonly o: P2; readonly u: P2 } | { readonly tipo: 'circulo'; readonly c: P2; readonly r: number };

function soporteDe(f: Forma2): Soporte | null {
  if (f.tipo === 'segmento') {
    const L = dist(f.a, f.b);
    return { tipo: 'recta', o: f.a, u: [(f.b[0] - f.a[0]) / L, (f.b[1] - f.a[1]) / L] };
  }
  if (f.tipo === 'arco') return { tipo: 'circulo', c: f.c, r: f.r };
  return null;
}

function mismoSoporte(s: Soporte, f: Forma2): boolean {
  if (s.tipo === 'recta') {
    if (f.tipo !== 'segmento') return false;
    const fuera = (p: P2) => Math.abs((p[0] - s.o[0]) * s.u[1] - (p[1] - s.o[1]) * s.u[0]);
    /* Y paralelos: dos segmentos cortos que hacen una V muy plana tienen
       los extremos cerca de la recta del otro sin ser la misma recta, y al
       fundirlos el segundo se torcía sobre el primero (junto al punto
       singular de dos tubos, 0,007 mm fuera de la pieza). */
    const L = dist(f.a, f.b);
    const seno = Math.abs(((f.b[0] - f.a[0]) * s.u[1] - (f.b[1] - f.a[1]) * s.u[0]) / L);
    return fuera(f.a) < TOL_FUSION && fuera(f.b) < TOL_FUSION && seno < SENO_PARALELAS;
  }
  return f.tipo === 'arco' && dist(f.c, s.c) < TOL_FUSION && Math.abs(f.r - s.r) < TOL_FUSION;
}

/** Los intervalos que ocupa la forma sobre su soporte: distancias a lo
 *  largo de la recta, o grados en [0, 360] del círculo. */
function intervalosSobre(s: Soporte, f: Forma2): Intervalo[] {
  if (s.tipo === 'recta' && f.tipo === 'segmento') {
    const p = (q: P2) => (q[0] - s.o[0]) * s.u[0] + (q[1] - s.o[1]) * s.u[1];
    const [a, b] = [p(f.a), p(f.b)];
    return [[Math.min(a, b), Math.max(a, b)]];
  }
  if (f.tipo !== 'arco') return [];
  if (f.hasta - f.desde >= 360 - HOLGURA_NUMERICA) return [[0, 360]];
  const d = ((f.desde % 360) + 360) % 360;
  const h = d + (f.hasta - f.desde);
  return h <= 360 ? [[d, h]] : [
    [d, 360],
    [0, h - 360],
  ];
}

/** La forma que ocupa un intervalo del soporte. Los arcos que tocan los
 *  0° y los 360° se juntan en uno que pasa por cero. */
function formasDe(s: Soporte, xs: readonly Intervalo[]): Forma2[] {
  if (s.tipo === 'recta') {
    return xs.map(([a, b]) => ({ tipo: 'segmento', a: punto(s.o[0] + s.u[0] * a, s.o[1] + s.u[1] * a), b: punto(s.o[0] + s.u[0] * b, s.o[1] + s.u[1] * b) }));
  }
  const arcos = xs.map(([a, b]) => [a, b] as [number, number]);
  if (arcos.length === 1 && arcos[0][0] <= HOLGURA_NUMERICA && arcos[0][1] >= 360 - HOLGURA_NUMERICA) return [{ tipo: 'arco', c: s.c, r: s.r, desde: 0, hasta: 360 }];
  const primero = arcos.find((x) => x[0] <= HOLGURA_NUMERICA);
  const ultimo = arcos.find((x) => x[1] >= 360 - HOLGURA_NUMERICA);
  if (primero && ultimo && primero !== ultimo) {
    ultimo[1] = 360 + primero[1];
    arcos.splice(arcos.indexOf(primero), 1);
  }
  return arcos.map(([a, b]) => ({ tipo: 'arco', c: s.c, r: s.r, desde: limpio(a), hasta: limpio(b) }));
}

/**
 * Funde los trazos que van por la misma recta o por el mismo círculo, clase
 * por clase, y quita a cada clase lo que cubren las que van antes en
 * `prioridad`. De cada trozo que queda, `de` junta las primitivas de todos
 * los trazos que lo pisan, y `texto` es el del primero que pasa por su
 * mitad. Las polilíneas, que no tienen recta ni círculo, se tratan después
 * cuerda a cuerda (`quitaLoCubiertoDePolilineas`).
 */
export function fundeConPrioridad<C extends string>(trazos: readonly Trazo<C>[], prioridad: readonly C[]): Trazo<C>[] {
  const fuera: Trazo<C>[] = [];
  const grupos: { soporte: Soporte; trazos: Trazo<C>[] }[] = [];
  for (const t of trazos) {
    const s = soporteDe(t.forma);
    if (!s) {
      fuera.push(t);
      continue;
    }
    const g = grupos.find((x) => mismoSoporte(x.soporte, t.forma));
    if (g) g.trazos.push(t);
    else grupos.push({ soporte: s, trazos: [t] });
  }
  const r: Trazo<C>[] = [];
  for (const { soporte, trazos: ts } of grupos) {
    let tapado: Intervalo[] = [];
    for (const clase of prioridad) {
      const propios = ts.filter((t) => t.clase === clase);
      if (!propios.length) continue;
      const libres = quita(une(propios.flatMap((t) => intervalosSobre(soporte, t.forma))), tapado);
      tapado = une([...tapado, ...libres]);
      for (const forma of formasDe(soporte, libres)) {
        const medio = puntoDe(forma, largoDe(forma) / 2);
        const pisan = propios.filter((t) => solapa(t.forma, forma));
        const guia = propios.find((t) => distanciaAForma(medio, t.forma) < TOL_FUSION) ?? pisan[0] ?? propios[0];
        r.push({ forma, clase, de: [...new Set(pisan.flatMap((t) => t.de))], texto: guia.texto });
      }
    }
  }
  return quitaLoCubiertoDePolilineas(r, fuera, prioridad);
}

/**
 * La prioridad, también en las polilíneas: de cada una se quita lo que ya
 * cubre un trazo que va antes —de una clase anterior, o de la suya ya
 * aceptado—, cuerda a cuerda. Una cuerda está cubierta si sus dos extremos
 * y su mitad caen sobre un mismo trazo aceptado; lo que queda se guarda en
 * trozos, y lo que no llega a una astilla se tira. Sin esto, en un eje con
 * un pasador la mitad de atrás de cada curva de encuentro (oculta) quedaba
 * encima de la de delante (vista): 184 de 192 ocultas eran copia de una
 * vista, y el dibujo pintaba los trazos sobre la línea continua (segunda
 * revisión del 9 de octubre de 2026).
 */
function quitaLoCubiertoDePolilineas<C extends string>(aceptados: Trazo<C>[], polilineas: readonly Trazo<C>[], prioridad: readonly C[]): Trazo<C>[] {
  const r = [...aceptados];
  const orden = [...polilineas].sort((a, b) => prioridad.indexOf(a.clase) - prioridad.indexOf(b.clase));
  for (const t of orden) {
    if (t.forma.tipo !== 'polilinea') continue;
    const pts = t.forma.puntos;
    const caja = encuadreDe(t.forma);
    const antes = r.filter((u) => prioridad.indexOf(u.clase) <= prioridad.indexOf(t.clase) && seTocan(caja, encuadreDe(u.forma), TOL_FUSION));
    const cubierta = (p: P2, q: P2) => {
      const m: P2 = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
      return antes.some((u) => [p, m, q].every((x) => distanciaAForma(x, u.forma) < TOL_FUSION));
    };
    let trozo: P2[] = [pts[0]];
    const cierra = () => {
      if (trozo.length >= 2) {
        const forma: Forma2 = { tipo: 'polilinea', puntos: trozo };
        if (largoDe(forma) >= ASTILLA) r.push({ ...t, forma });
      }
    };
    for (let i = 1; i < pts.length; i++) {
      if (cubierta(pts[i - 1], pts[i])) {
        cierra();
        trozo = [pts[i]];
      } else trozo.push(pts[i]);
    }
    cierra();
  }
  return r;
}

/** Si dos formas del mismo soporte comparten más que un punto. */
function solapa(a: Forma2, b: Forma2): boolean {
  const n = 5;
  const L = largoDe(b);
  for (let k = 1; k < n; k++) if (distanciaAForma(puntoDe(b, (L * k) / n), a) < TOL_FUSION) return true;
  return false;
}

/** Quita de cada trazo lo que tapan esas formas cuando van por su misma
 *  recta o su mismo círculo: el eje que coincide con una arista, el
 *  descarte que cae encima de una línea que sí se dibuja. */
export function quitaLoTapado<C extends string>(trazos: readonly Trazo<C>[], tapan: readonly Forma2[]): Trazo<C>[] {
  return trazos.flatMap((t) => {
    const s = soporteDe(t.forma);
    if (!s) return [t];
    const cubre = une(tapan.filter((f) => mismoSoporte(s, f)).flatMap((f) => intervalosSobre(s, f)));
    if (!cubre.length) return [t];
    return formasDe(s, quita(intervalosSobre(s, t.forma), cubre))
      .filter((f) => largoDe(f) > LARGO_MINIMO)
      .map((forma) => ({ ...t, forma }));
  });
}

/* ── Partir en los cruces ─────────────────────────────────────────────── */

/** Si dos cajas del papel se tocan, con una holgura. */
const seTocan = (a: ReturnType<typeof encuadreDe>, b: ReturnType<typeof encuadreDe>, tol: number) =>
  a.umin <= b.umax + tol && b.umin <= a.umax + tol && a.vmin <= b.vmax + tol && b.vmin <= a.vmax + tol;

/** Los puntos donde se tocan dos formas: sus cruces y los extremos de una
 *  que caen sobre la otra. Cada cuerda de una polilínea se mira solo contra
 *  las del otro lado cuyas cajas toca: dos polilíneas de 360 puntos son
 *  130.000 parejas, y casi todas están lejos. */
function contactos(a: Forma2, b: Forma2, tol: number): P2[] {
  if (!seTocan(encuadreDe(a), encuadreDe(b), tol)) return [];
  const segmentosDe = (f: Forma2): [P2, P2][] =>
    f.tipo === 'segmento' ? [[f.a, f.b]] : f.tipo === 'polilinea' ? f.puntos.slice(1).map((p, i) => [f.puntos[i], p] as [P2, P2]) : [];
  const extremos = (f: Forma2): P2[] => (f.tipo === 'polilinea' ? [f.puntos[0], f.puntos[f.puntos.length - 1]] : [puntoDe(f, 0), puntoDe(f, largoDe(f))]);
  const r: P2[] = [];
  for (const p of extremos(a)) if (distanciaAForma(p, b) < tol) r.push(p);
  for (const p of extremos(b)) if (distanciaAForma(p, a) < tol) r.push(p);
  const caja = ([p, q]: [P2, P2]) => encuadreDe({ tipo: 'segmento', a: p, b: q });
  const sb = segmentosDe(b).map((s) => ({ s, c: caja(s) }));
  for (const sa of segmentosDe(a)) {
    const ca = caja(sa);
    for (const { s, c } of sb) {
      if (!seTocan(ca, c, tol)) continue;
      const x = cruceDeRectas(sa[0], sa[1], s[0], s[1]);
      if (x && distanciaASegmento(x, sa[0], sa[1]) < tol && distanciaASegmento(x, s[0], s[1]) < tol) r.push(x);
    }
  }
  const arcos = [a, b].filter((f): f is Extract<Forma2, { tipo: 'arco' }> => f.tipo === 'arco');
  for (const arco of arcos) {
    const otro = arco === a ? b : a;
    const enArcoYa = (x: P2) => distanciaAForma(x, arco) < tol;
    for (const [p, q] of segmentosDe(otro)) for (const x of cruceRectaCirculo(p, q, arco.c, arco.r)) if (distanciaASegmento(x, p, q) < tol && enArcoYa(x)) r.push(x);
  }
  if (arcos.length === 2) r.push(...cruceDeCirculos(arcos[0], arcos[1]).filter((x) => distanciaAForma(x, a) < tol && distanciaAForma(x, b) < tol));
  return r;
}

function cruceDeRectas(p: P2, q: P2, r: P2, s: P2): P2 | null {
  const [d1x, d1y, d2x, d2y] = [q[0] - p[0], q[1] - p[1], s[0] - r[0], s[1] - r[1]];
  const den = d1x * d2y - d1y * d2x;
  if (Math.abs(den) < CASI_CERO) return null;
  const t = ((r[0] - p[0]) * d2y - (r[1] - p[1]) * d2x) / den;
  return [p[0] + t * d1x, p[1] + t * d1y];
}

function cruceRectaCirculo(p: P2, q: P2, c: P2, r: number): P2[] {
  const [dx, dy] = [q[0] - p[0], q[1] - p[1]];
  const [fx, fy] = [p[0] - c[0], p[1] - c[1]];
  const A = dx * dx + dy * dy;
  const B = 2 * (fx * dx + fy * dy);
  const C = fx * fx + fy * fy - r * r;
  let disc = B * B - 4 * A * C;
  if (disc < 0 && disc > -HOLGURA_NUMERICA * A * r * r) disc = 0;
  if (disc < 0 || A < CASI_CERO ** 2) return [];
  const raiz = Math.sqrt(disc);
  return [(-B - raiz) / (2 * A), (-B + raiz) / (2 * A)].map((t) => [p[0] + t * dx, p[1] + t * dy] as P2);
}

/** Los puntos donde se cortan dos circunferencias: ninguno, uno si son
 *  tangentes, o dos. Concéntricas, ninguno. */
export function cortesDeCircunferencias(c1: P2, r1: number, c2: P2, r2: number): P2[] {
  const d = dist(c1, c2);
  if (d < CASI_CERO || d > r1 + r2 + HOLGURA_NUMERICA || d < Math.abs(r1 - r2) - HOLGURA_NUMERICA) return [];
  const x = (d * d + r1 * r1 - r2 * r2) / (2 * d);
  const h = Math.sqrt(Math.max(0, r1 * r1 - x * x));
  const [ux, uy] = [(c2[0] - c1[0]) / d, (c2[1] - c1[1]) / d];
  const m: P2 = [c1[0] + ux * x, c1[1] + uy * x];
  if (h < HOLGURA_NUMERICA) return [m];
  return [
    [m[0] - uy * h, m[1] + ux * h],
    [m[0] + uy * h, m[1] - ux * h],
  ];
}

const cruceDeCirculos = (a: Extract<Forma2, { tipo: 'arco' }>, b: Extract<Forma2, { tipo: 'arco' }>): P2[] => cortesDeCircunferencias(a.c, a.r, b.c, b.r);


/**
 * Parte cada trazo en los puntos donde lo toca otro de la lista. Las cajas
 * se calculan una vez y una pareja cuyas cajas no se tocan no se mira. Dos
 * cortes a menos de una astilla son uno, y no se corta a menos de una
 * astilla de un extremo: una elipse tangente a una recta la cruza dos veces
 * muy cerca, y entre los dos cortes quedaba un tramo de 0,004 mm (revisión
 * del 9 de octubre de 2026).
 */
export function parteEnLosCruces<C extends string>(trazos: readonly Trazo<C>[]): Trazo<C>[] {
  const cajas = trazos.map((t) => encuadreDe(t.forma));
  return trazos.flatMap((t, i) => {
    const L = largoDe(t.forma);
    const cortes: number[] = [];
    trazos.forEach((u, j) => {
      if (i === j || !seTocan(cajas[i], cajas[j], TOL_CONTACTO)) return;
      for (const p of contactos(t.forma, u.forma, TOL_CONTACTO)) {
        const { s } = proyectaEnForma(t.forma, p);
        if (s > ASTILLA && s < L - ASTILLA) cortes.push(s);
      }
    });
    cortes.sort((x, y) => x - y);
    const unicos = cortes.filter((s, k) => k === 0 || s - cortes[k - 1] > ASTILLA);
    /* Una circunferencia entera con cortes empieza en el primero y da la
       vuelta: su cero no es un sitio donde cambie nada. */
    const vuelta = t.forma.tipo === 'arco' && t.forma.hasta - t.forma.desde >= 360 - HOLGURA_NUMERICA && unicos.length > 0;
    const limites = vuelta ? [...unicos, unicos[0] + L] : [0, ...unicos, L];
    const r: Trazo<C>[] = [];
    for (let k = 0; k + 1 < limites.length; k++) {
      if (limites[k + 1] - limites[k] > LARGO_MINIMO) r.push({ ...t, forma: subForma(t.forma, limites[k], limites[k + 1]) });
    }
    return r;
  });
}

/**
 * Las astillas que queden —un tramo de menos de ASTILLA, que sale de un
 * cambio de visibilidad junto a un vértice o de dos curvas casi tangentes—
 * se funden con el vecino que las continúa por su misma recta o su mismo
 * círculo, y si no tienen, se quitan: un hueco así no lo nota `casaTramo`,
 * que salva los menores que la tolerancia de la regla.
 */
export function fundeAstillas<C extends string>(trazos: readonly Trazo<C>[]): Trazo<C>[] {
  const r = [...trazos];
  for (let i = 0; i < r.length; ) {
    const t = r[i];
    if (largoDe(t.forma) >= ASTILLA) {
      i++;
      continue;
    }
    r.splice(i, 1);
    const extremos = (f: Forma2) => [puntoDe(f, 0), puntoDe(f, largoDe(f))];
    const j = r.findIndex((u) => {
      const s = soporteDe(u.forma);
      return s !== null && largoDe(u.forma) >= ASTILLA && mismoSoporte(s, t.forma) && extremos(u.forma).some((p) => extremos(t.forma).some((q) => dist(p, q) < TOL_CONTACTO));
    });
    if (j < 0) continue;
    const s = soporteDe(r[j].forma) as Soporte;
    const juntas = formasDe(s, une([...intervalosSobre(s, r[j].forma), ...intervalosSobre(s, t.forma)]));
    if (juntas.length === 1) r[j] = { ...r[j], forma: juntas[0] };
    i = 0;
  }
  return r;
}
