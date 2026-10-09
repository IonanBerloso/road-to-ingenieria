/**
 * La visibilidad (§3.2, paso 4): desde cada punto de una arista se lanza un
 * rayo hacia el observador, y si atraviesa materia la arista va oculta. Lo
 * que corta el rayo es el `porque` del tramo: «la tapa la torre».
 *
 * INTERVALOS EXACTOS. La espiga avanzaba el rayo a pasos de 0,25 mm, y un
 * paso así se salta una pared delgada. Aquí cada primitiva da los puntos
 * donde el rayo puede cruzar su borde —los planos de sus caras, las raíces
 * de su cuádrica—, se ordenan todos, y cada trozo entre dos seguidos se
 * clasifica por su punto medio con la pertenencia del árbol. Es el trazado
 * de rayos clásico sobre CSG, con una ventaja: no hay que combinar
 * intervalos según el árbol, porque la pertenencia ya lo hace.
 *
 * LA PIEZA EROSIONADA. Un rayo que roza una cara de canto —el de una arista
 * de arriba, que va por el plano de la cara de arriba— no puede taparse con
 * ella. Por eso se mira contra la pieza erosionada: un punto es materia si
 * él y sus seis vecinos a 0,05 mm lo son (§3.2). Los dos vecinos a lo largo
 * del rayo encogen cada intervalo 0,05 mm por cada lado; los otros cuatro
 * son cuatro rayos paralelos, y la materia es lo que tienen los cinco.
 *
 * Y SE EROSIONA LA PIEZA ENTERA, NO CADA PRIMITIVA. Es el fallo que
 * encontró la espiga: erosionando primitiva a primitiva se abre una rendija
 * en la junta de dos bloques sumados, y el rayo que va por ella no toca
 * nada. La erosión «primitiva» se queda aquí solo para validar al revés el
 * test que lo caza (`tests/vistas/motor.test.ts`), y el oráculo.
 */
import { aLocal, dentro, dentroConMargen, materiaEn, primitivasDonde, type Caja3, type PiezaCompilada, type Primitiva } from './pieza.ts';
import { CASI_CERO, DESDE, EROSION, HOLGURA_NUMERICA, MARGEN_CAJA } from './tolerancias.ts';
import { avanza3, baseOrtogonal, escalar3, type V3 } from './vector.ts';


export type Erosion = 'pieza' | 'primitiva';
type Intervalo = readonly [number, number];

/** Donde el rayo o + t·d puede cruzar el borde de la primitiva. */
function cortesDePrimitiva(prim: Primitiva, o: V3, d: V3): number[] {
  const l = aLocal(prim.marco, o);
  const e = prim.marco.e;
  const dl: V3 = [escalar3(d, e[0]), escalar3(d, e[1]), escalar3(d, e[2])];
  const plano = (k: number, valor: number): number[] => (Math.abs(dl[k]) < CASI_CERO ? [] : [(valor - l[k]) / dl[k]]);
  const f = prim.forma;
  switch (f.tipo) {
    case 'caja':
      return [0, 1, 2].flatMap((k) => [...plano(k, f.min[k]), ...plano(k, f.max[k])]);
    case 'semiespacio':
      return plano(2, 0);
    case 'prisma': {
      const r = [...plano(2, f.w0), ...plano(2, f.w1)];
      const pol = f.poligono;
      for (let i = 0; i < pol.length; i++) {
        const [a, b] = [pol[i], pol[(i + 1) % pol.length]];
        const [ex, ey] = [b[0] - a[0], b[1] - a[1]];
        const den = dl[0] * ey - dl[1] * ex;
        if (Math.abs(den) > CASI_CERO) r.push(((a[0] - l[0]) * ey - (a[1] - l[1]) * ex) / den);
      }
      return r;
    }
    case 'cilindro':
    case 'cono': {
      const [r0, r1] = f.tipo === 'cilindro' ? [f.r, f.r] : [f.r0, f.r1];
      const k = (r1 - r0) / (f.w1 - f.w0);
      const R0 = r0 + k * (l[2] - f.w0);
      const A = dl[0] * dl[0] + dl[1] * dl[1] - k * k * dl[2] * dl[2];
      const B = 2 * (l[0] * dl[0] + l[1] * dl[1] - R0 * k * dl[2]);
      const C = l[0] * l[0] + l[1] * l[1] - R0 * R0;
      const r = [...plano(2, f.w0), ...plano(2, f.w1)];
      if (k !== 0 && Math.abs(dl[2]) > CASI_CERO) r.push(-R0 / (k * dl[2]));
      if (Math.abs(A) > CASI_CERO) {
        const disc = B * B - 4 * A * C;
        if (disc >= 0) r.push((-B - Math.sqrt(disc)) / (2 * A), (-B + Math.sqrt(disc)) / (2 * A));
      } else if (Math.abs(B) > CASI_CERO) r.push(-C / B);
      return r;
    }
  }
}

/** Los trozos del rayo o + t·d, con t de t0 a t1, en que se cumple
 *  `pertenece`. */
export function intervalosDelRayo(p: PiezaCompilada, o: V3, d: V3, t0: number, t1: number, pertenece: (q: V3) => boolean): Intervalo[] {
  const cortes = [t0, t1];
  /* Una primitiva cuya caja no cruza el rayo no lo corta: no se mira, y el
     árbol no baja por las ramas cuya caja tampoco. La caja va crecida una
     erosión, lo que crece una primitiva restada en la erosión primitiva a
     primitiva. */
  for (const i of primitivasDonde(p, (c) => cruzaCaja(c, o, d, t0, t1, EROSION + HOLGURA_NUMERICA))) {
    for (const t of cortesDePrimitiva(p.primitivas[i], o, d)) if (t > t0 && t < t1) cortes.push(t);
  }
  cortes.sort((a, b) => a - b);
  const r: [number, number][] = [];
  for (let k = 0; k + 1 < cortes.length; k++) {
    const [a, b] = [cortes[k], cortes[k + 1]];
    if (b - a < CASI_CERO) continue;
    if (!pertenece(avanza3(o, d, (a + b) / 2))) continue;
    if (r.length && Math.abs(r[r.length - 1][1] - a) < CASI_CERO) r[r.length - 1][1] = b;
    else r.push([a, b]);
  }
  return r;
}

/** Si el trozo del rayo o + t·d con t de t0 a t1 pasa por la caja,
 *  agrandada `holgura`: el método de las franjas. */
function cruzaCaja(c: Caja3, o: V3, d: V3, t0: number, t1: number, holgura: number): boolean {
  let [lo, hi] = [t0, t1];
  for (let k = 0; k < 3; k++) {
    const [a, b] = [c.min[k] - holgura, c.max[k] + holgura];
    if (Math.abs(d[k]) < CASI_CERO) {
      if (o[k] < a || o[k] > b) return false;
      continue;
    }
    const [s, u] = [(a - o[k]) / d[k], (b - o[k]) / d[k]];
    lo = Math.max(lo, Math.min(s, u));
    hi = Math.min(hi, Math.max(s, u));
    if (hi < lo) return false;
  }
  return true;
}

function corta(a: readonly Intervalo[], b: readonly Intervalo[]): Intervalo[] {
  const r: Intervalo[] = [];
  for (const [p, q] of a) for (const [s, t] of b) if (Math.min(q, t) > Math.max(p, s)) r.push([Math.max(p, s), Math.min(q, t)]);
  return r.sort((x, y) => x[0] - y[0]);
}

/** Hasta dónde hay que mirar: la salida del rayo de la caja de la pieza. */
function alcance(p: PiezaCompilada, o: V3, d: V3): number {
  let hasta = Infinity;
  for (let k = 0; k < 3; k++) {
    if (Math.abs(d[k]) < CASI_CERO) continue;
    const borde = d[k] > 0 ? p.caja.max[k] + MARGEN_CAJA : p.caja.min[k] - MARGEN_CAJA;
    hasta = Math.min(hasta, (borde - o[k]) / d[k]);
  }
  return Math.max(0, hasta);
}

/** La materia erosionada a lo largo del rayo que sale de q hacia el
 *  observador. */
function materiaDelRayo(p: PiezaCompilada, q: V3, hacia: V3, erosion: Erosion): Intervalo[] {
  const t1 = alcance(p, q, hacia);
  if (t1 <= DESDE) return [];
  if (erosion === 'primitiva') return intervalosDelRayo(p, q, hacia, 0, t1, (x) => dentroConMargen(p, x, EROSION)).filter(([, b]) => b > DESDE);
  const pertenece = (x: V3) => dentro(p, x);
  let materia: Intervalo[] = intervalosDelRayo(p, q, hacia, 0, t1, pertenece)
    .map(([a, b]): Intervalo => [a + EROSION, b - EROSION])
    .filter(([a, b]) => b > a && b > DESDE);
  const [e1, e2] = baseOrtogonal(hacia);
  for (const [e, s] of [
    [e1, 1],
    [e1, -1],
    [e2, 1],
    [e2, -1],
  ] as const) {
    if (!materia.length) break;
    materia = corta(materia, intervalosDelRayo(p, avanza3(q, e, s * EROSION), hacia, 0, t1, pertenece));
  }
  return materia.filter(([a, b]) => b - a > HOLGURA_NUMERICA && b > DESDE);
}

/** Lo que tapa el punto q mirado desde `hacia` (de la pieza al observador),
 *  por su nombre; null si se ve. Si la materia que tapa no se deja atribuir
 *  a ninguna primitiva —no debería pasar: está dentro de la pieza—, '?', y
 *  nunca la primera primitiva por defecto, que acusaría a quien no es. */
export function loQueTapa(p: PiezaCompilada, q: V3, hacia: V3, erosion: Erosion = 'pieza'): string | null {
  const materia = materiaDelRayo(p, q, hacia, erosion);
  if (!materia.length) return null;
  const [a, b] = materia[0];
  return materiaEn(p, avanza3(q, hacia, (Math.max(a, DESDE) + b) / 2)) ?? '?';
}
