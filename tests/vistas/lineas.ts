/**
 * Las líneas de una vista como las dibuja una clave: cada arista entera, sin
 * partir en los cruces. El motor parte cada línea donde la toca otra (para
 * que `casaTramo` valga tal cual); una clave del material no, y para
 * compararlas hay que juntar lo que el motor parte.
 *
 * Juntar es: dos segmentos del mismo tipo que están en la misma recta y se
 * tocan por una punta son uno; dos arcos del mismo tipo de la misma
 * circunferencia que se tocan son uno, y si dan la vuelta entera, una
 * circunferencia. Un segmento que sigue a un arco tangente no se junta: en
 * la clave también son dos trazos.
 *
 * Y comparar es emparejar uno a uno, con dos tolerancias en mm: la de la
 * POSICIÓN (la recta de un segmento, la curva de un arco, el centro y el
 * radio de una circunferencia) y la de las PUNTAS. Son distintas porque en un
 * escaneo una punta se lee peor que una posición: el trazo tiene grueso y
 * una línea que acaba en otra se pasa la mitad. Un arco corto no se compara
 * por su centro, que con poca curva baila milímetros, sino por su curva: unos
 * puntos de uno tienen que caer en el otro.
 */
import type { P2 } from '../../src/lib/diedrico';
import type { VistaCalculada } from '../../src/lib/vistas/motor.ts';
import type { Forma2 } from '../../src/lib/vistas/plano2d.ts';

export type TipoDeLinea = 'visto' | 'oculto';
export interface Linea {
  readonly tipo: TipoDeLinea;
  readonly forma: Forma2;
}

/** Lo que pueden separarse dos puntas o dos centros para ser el mismo
 *  punto al juntar lo del motor, en mm: la astilla del motor (ASTILLA, en
 *  `tolerancias.ts`), que es lo más corto que deja entre dos cortes. */
const JUNTA = 0.05;

const dist = (p: P2, q: P2) => Math.hypot(p[0] - q[0], p[1] - q[1]);
const norma = (a: number) => ((a % 360) + 360) % 360;

type Seg = { a: P2; b: P2 };
type Arc = { c: P2; r: number; desde: number; hasta: number };

/** Si los dos segmentos están en la misma recta. */
function enLaMismaRecta(s: Seg, t: Seg): boolean {
  const L = dist(s.a, s.b);
  const u: P2 = [(s.b[0] - s.a[0]) / L, (s.b[1] - s.a[1]) / L];
  const lejos = (p: P2) => Math.abs((p[0] - s.a[0]) * u[1] - (p[1] - s.a[1]) * u[0]);
  return lejos(t.a) < JUNTA && lejos(t.b) < JUNTA;
}

/** Une dos segmentos en la misma recta que se tocan o se pisan: el que va
 *  de la punta más lejana de uno a la del otro. */
function uneSegmentos(s: Seg, t: Seg): Seg | null {
  if (!enLaMismaRecta(s, t)) return null;
  const L = dist(s.a, s.b);
  const u: P2 = [(s.b[0] - s.a[0]) / L, (s.b[1] - s.a[1]) / L];
  const par = (p: P2) => (p[0] - s.a[0]) * u[0] + (p[1] - s.a[1]) * u[1];
  const [t0, t1] = [par(t.a), par(t.b)].sort((x, y) => x - y);
  if (t0 > L + JUNTA || t1 < -JUNTA) return null;
  const lo = Math.min(0, t0);
  const hi = Math.max(L, t1);
  const p = (k: number): P2 => [s.a[0] + u[0] * k, s.a[1] + u[1] * k];
  return { a: p(lo), b: p(hi) };
}

/** Une dos arcos de la misma circunferencia que se tocan: los dos van
 *  creciendo de `desde` a `hasta`, en grados. */
function uneArcos(s: Arc, t: Arc): Arc | null {
  if (dist(s.c, t.c) > JUNTA || Math.abs(s.r - t.r) > JUNTA) return null;
  const tocaPorDelante = Math.abs(norma(s.hasta) - norma(t.desde)) * (Math.PI / 180) * s.r < JUNTA || Math.abs(Math.abs(norma(s.hasta) - norma(t.desde)) - 360) * (Math.PI / 180) * s.r < JUNTA;
  if (tocaPorDelante) {
    const vuelta = s.hasta - s.desde + (t.hasta - t.desde);
    return { c: s.c, r: s.r, desde: s.desde, hasta: s.desde + Math.min(360, vuelta) };
  }
  return null;
}

/** Las líneas de una vista, con lo que el motor partió vuelto a juntar. */
export function lineasDeVista(v: Pick<VistaCalculada, 'tramos'>): Linea[] {
  const r: Linea[] = [];
  for (const tipo of ['visto', 'oculto'] as const) {
    let segs: Seg[] = [];
    let arcs: Arc[] = [];
    for (const t of v.tramos) {
      if (t.tipo !== tipo) continue;
      if (t.forma.tipo === 'segmento') segs.push({ a: t.forma.a, b: t.forma.b });
      else if (t.forma.tipo === 'arco') arcs.push({ c: t.forma.c, r: t.forma.r, desde: t.forma.desde, hasta: t.forma.hasta });
      else r.push({ tipo, forma: t.forma });
    }
    segs = juntaHastaQueNoSePueda(segs, uneSegmentos);
    arcs = juntaHastaQueNoSePueda(arcs, (a, b) => uneArcos(a, b) ?? uneArcos(b, a));
    for (const s of segs) r.push({ tipo, forma: { tipo: 'segmento', a: s.a, b: s.b } });
    for (const a of arcs) r.push({ tipo, forma: { tipo: 'arco', c: a.c, r: a.r, desde: a.desde, hasta: a.hasta } });
  }
  return r;
}

function juntaHastaQueNoSePueda<T>(xs: T[], une: (a: T, b: T) => T | null): T[] {
  const r = [...xs];
  let cambiado = true;
  while (cambiado) {
    cambiado = false;
    for (let i = 0; i < r.length && !cambiado; i++) {
      for (let j = i + 1; j < r.length && !cambiado; j++) {
        const u = une(r[i], r[j]);
        if (u) {
          r.splice(j, 1);
          r[i] = u;
          cambiado = true;
        }
      }
    }
  }
  return r;
}

const esCircunferencia = (f: Forma2) => f.tipo === 'arco' && f.hasta - f.desde >= 360 - 1e-6;
const puntaDeArco = (f: Extract<Forma2, { tipo: 'arco' }>, a: number): P2 => [f.c[0] + f.r * Math.cos((a * Math.PI) / 180), f.c[1] + f.r * Math.sin((a * Math.PI) / 180)];

/** Lo que dista p de la recta ab. */
function aLaRecta(p: P2, a: P2, b: P2): number {
  const L = dist(a, b);
  return Math.abs((p[0] - a[0]) * (b[1] - a[1]) - (p[1] - a[1]) * (b[0] - a[0])) / L;
}

/** Lo que dista p del arco: de su circunferencia si cae en su vuelta, y de
 *  la punta más cercana si no. */
function alArco(p: P2, f: Extract<Forma2, { tipo: 'arco' }>): number {
  const a = (Math.atan2(p[1] - f.c[1], p[0] - f.c[0]) * 180) / Math.PI;
  const dentro = [-720, -360, 0, 360, 720].some((k) => a + k >= f.desde - 1e-9 && a + k <= f.hasta + 1e-9);
  return dentro ? Math.abs(dist(p, f.c) - f.r) : Math.min(dist(p, puntaDeArco(f, f.desde)), dist(p, puntaDeArco(f, f.hasta)));
}

export interface Tolerancias {
  /** Lo que se aparta una recta, una curva, un centro o un radio, en mm. */
  readonly posicion: number;
  /** Lo que se aparta una punta, en mm. */
  readonly punta: number;
}

/**
 * Una línea de una clave. Lo que lleva es lo leído en el escaneo, con dos
 * salvedades que se dicen aquí y no se esconden:
 * - `sinPunta`: las puntas que el escaneo no deja leer (una recta que entra
 *   tangente en un arco grande, dos arcos tangentes). Su número es el que dio
 *   la lectura, pero no se compara: ni a favor ni en contra del motor;
 * - una `polilinea`: una curva leída por puntos del contorno, que se compara
 *   por esos puntos y sin puntas, porque el escaneo no da su centro.
 */
export interface LineaDeClave extends Linea {
  readonly sinPunta?: readonly (1 | 2)[];
}

/** Lo que dista p de una forma del motor. */
function aLaForma(p: P2, f: Forma2): number {
  if (f.tipo === 'arco') return alArco(p, f);
  const pts = f.tipo === 'segmento' ? [f.a, f.b] : f.puntos;
  let d = Infinity;
  for (let i = 1; i < pts.length; i++) {
    const [a, b] = [pts[i - 1], pts[i]];
    const L2 = (b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2;
    const t = L2 === 0 ? 0 : Math.max(0, Math.min(1, ((p[0] - a[0]) * (b[0] - a[0]) + (p[1] - a[1]) * (b[1] - a[1])) / L2));
    d = Math.min(d, dist(p, [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]));
  }
  return d;
}

/** Si las puntas que se comparan caen a menos de `tol`, emparejadas en un
 *  sentido o en el otro. */
function puntasCasan(motor: readonly [P2, P2], clave: readonly [P2, P2], sin: readonly (1 | 2)[], tol: number): boolean {
  const vale = (orden: readonly [P2, P2]) => clave.every((q, i) => sin.includes((i + 1) as 1 | 2) || dist(q, orden[i]) <= tol);
  return vale(motor) || vale([motor[1], motor[0]]);
}

/** Si una línea del motor y una de la clave son la misma, con esas
 *  tolerancias. */
export function casan(m: Linea, k: LineaDeClave, tol: Tolerancias): boolean {
  if (m.tipo !== k.tipo) return false;
  const [f, g] = [m.forma, k.forma];
  const sin = k.sinPunta ?? [];
  if (g.tipo === 'polilinea') return g.puntos.every((p) => aLaForma(p, f) <= tol.posicion);
  if (f.tipo === 'segmento' && g.tipo === 'segmento') {
    const leidas = [g.a, g.b].filter((_, i) => !sin.includes((i + 1) as 1 | 2));
    const paralelas = Math.max(...leidas.map((q) => aLaRecta(q, f.a, f.b)), aLaRecta(f.a, g.a, g.b), aLaRecta(f.b, g.a, g.b)) <= tol.posicion;
    return paralelas && puntasCasan([f.a, f.b], [g.a, g.b], sin, tol.punta);
  }
  if (f.tipo === 'arco' && g.tipo === 'arco') {
    if (esCircunferencia(f) || esCircunferencia(g)) {
      return esCircunferencia(f) && esCircunferencia(g) && dist(f.c, g.c) <= tol.posicion && Math.abs(f.r - g.r) <= tol.posicion;
    }
    const enLaCurva = [0.1, 0.3, 0.5, 0.7, 0.9].every((t) => alArco(puntaDeArco(g, g.desde + (g.hasta - g.desde) * t), f) <= tol.posicion);
    const motor: [P2, P2] = [puntaDeArco(f, f.desde), puntaDeArco(f, f.hasta)];
    return enLaCurva && puntasCasan(motor, [puntaDeArco(g, g.desde), puntaDeArco(g, g.hasta)], sin, tol.punta);
  }
  return false;
}

/** Lo que separa dos líneas que casan, para elegir la mejor pareja: la
 *  suma de lo que se apartan sus puntas, o su centro y su radio, o sus
 *  puntos. */
function separacion(m: Linea, k: Linea): number {
  const [f, g] = [m.forma, k.forma];
  if (g.tipo === 'polilinea') return g.puntos.reduce((s, p) => s + aLaForma(p, f), 0);
  if (f.tipo === 'segmento' && g.tipo === 'segmento') return Math.min(dist(f.a, g.a) + dist(f.b, g.b), dist(f.a, g.b) + dist(f.b, g.a));
  if (f.tipo === 'arco' && g.tipo === 'arco') {
    if (esCircunferencia(f)) return dist(f.c, g.c) + Math.abs(f.r - g.r);
    const [p0, p1, q0, q1] = [puntaDeArco(f, f.desde), puntaDeArco(f, f.hasta), puntaDeArco(g, g.desde), puntaDeArco(g, g.hasta)];
    return Math.min(dist(p0, q0) + dist(p1, q1), dist(p0, q1) + dist(p1, q0));
  }
  return Infinity;
}

/** Empareja las líneas del motor con las de la clave, una a una, cada línea
 *  de la clave con la del motor que casa y más se le parece. Devuelve lo
 *  que queda sin pareja a cada lado. */
export function comparaLineas(motor: readonly Linea[], clave: readonly LineaDeClave[], tol: Tolerancias): { sobran: Linea[]; faltan: LineaDeClave[] } {
  const libres = [...motor];
  const faltan: LineaDeClave[] = [];
  for (const k of clave) {
    let mejor = -1;
    libres.forEach((m, i) => {
      if (casan(m, k, tol) && (mejor < 0 || separacion(m, k) < separacion(libres[mejor], k))) mejor = i;
    });
    if (mejor < 0) faltan.push(k);
    else libres.splice(mejor, 1);
  }
  return { sobran: libres, faltan };
}

const mm = (x: number) => x.toFixed(1);
/** Una línea, para leerla en un mensaje. */
export function describe(l: Linea): string {
  const f = l.forma;
  if (f.tipo === 'segmento') return `${l.tipo} de (${mm(f.a[0])}, ${mm(f.a[1])}) a (${mm(f.b[0])}, ${mm(f.b[1])})`;
  if (f.tipo === 'arco') {
    return esCircunferencia(f)
      ? `${l.tipo}: circunferencia de centro (${mm(f.c[0])}, ${mm(f.c[1])}) y radio ${mm(f.r)}`
      : `${l.tipo}: arco de centro (${mm(f.c[0])}, ${mm(f.c[1])}), radio ${mm(f.r)}, de ${mm(f.desde)}° a ${mm(f.hasta)}°`;
  }
  return `${l.tipo}: polilínea de ${f.puntos.length} puntos`;
}
