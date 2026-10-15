/**
 * Tema 13 de ERM: teoremas energéticos en estructuras planas de barras
 * (vigas, pórticos y celosías del tema 7): la coenergía de N, M y V, los
 * desplazamientos y giros por el teorema de Engesser-Castigliano con el
 * método de la fuerza unitaria, y los hiperestáticos por Menabrea
 * (∂C/∂Xi = δ0i), con reacciones, resortes y tirantes como incógnitas.
 *
 * Para quién: para el alumno de la 2.ª parte y la final; «desplazamiento por
 * Castigliano» y «hiperestático por energía» salen en casi todas las 2.as
 * partes leídas (`p0`), y para quien escriba sus ejercicios guiados. Qué
 * gana: δ = ∫(M·m/EI + N·n/EA + χ·V·v/GA) sin integrar a mano cada tramo, y
 * las incógnitas hiperestáticas con los coeficientes δij a la vista. Cómo se
 * comprueba: `tests/fisica/erm/energia.test.ts` (los casos de libro; la
 * derivada numérica de la coenergía, que es el teorema 13.14 sin fuerza
 * unitaria; `elastica.ts` en las vigas; `redundantes.ts` y el resorte de
 * `elastica.ts` en los hiperestáticos; χ = 6/5 y 10/9 integrando la ec. 13.37
 * sobre la sección de `secciones.ts`).
 *
 * No es otro modelo de estructura (CLAUDE.md §01): la estructura, sus cargas
 * y sus esfuerzos son los de `estructura.ts` y `esfuerzos.ts`, con su
 * convenio (X a la derecha, Y hacia arriba, pares antihorarios; N > 0
 * tracción, M > 0 tracciona la fibra +y de la barra).
 *
 * EL CONVENIO ES EL DEL CURSO (tema 13):
 *
 *   · Coenergía (tabla de la p. 16): C = ∫N²/2EA + ∫N·ε0 + ∫M²/2EI + ∫M·κ0 +
 *     χ∫V²/2GA (+ F²/2k de cada resorte, ec. 13.45). ε0 es la deformación
 *     inicial uniforme (α·ΔT) y κ0 = (1/I)∫y·ε0 dA, la curvatura inicial
 *     (α·(T₊y − T₋y)/h con un gradiente lineal), que es el segundo término de
 *     la fila Mz de la tabla.
 *   · χ = (A/I²)∫(Qc/b)² dA (ec. 13.37, p. 14): 6/5 en el rectángulo.
 *   · Engesser-Castigliano (ec. 13.14, p. 8): δi = ∂C/∂Fi, y por el método de
 *     la fuerza unitaria (pp. 17-18) ∂N/∂Fi = n, … los esfuerzos de la misma
 *     estructura con una carga unidad en i: δi = ∫(N·n/EA + n·ε0 + M·m/EI +
 *     m·κ0 + χ·V·v/GA). δ es el desplazamiento EN EL SENTIDO de la carga
 *     unidad; un giro es antihorario positivo, como los pares de entrada.
 *   · Desplazamiento relativo de dos puntos (ecs. 13.49-13.50, p. 18): dos
 *     fuerzas unidad iguales y opuestas sobre la recta que los une, que aquí
 *     los ACERCAN: δ > 0 es acercamiento.
 *   · Hiperestáticos (13.7.2, p. 19): ∂C/∂Xi = δ0i (ec. 13.51): una reacción
 *     con el desplazamiento del apoyo dado (0 en uno fijo, −X/k en un
 *     resorte); un tirante entre dos puntos (ec. 13.53), con X > 0 tracción:
 *     el acercamiento de sus extremos es −(X·L/EA + ε0·L).
 */
import { esfuerzosEn, singulares } from './esfuerzos';
import { geometria, nudo, resuelve, type Carga, type Estructura, type Solucion, type Vec2 } from './estructura';
import { integra } from './elastica';
import { resuelveLineal } from './lineal';
import { anchoEnFibra, momentoEstatico, propiedades, vertices, type Seccion } from './secciones';

/** Rigideces de una barra; sin EA o sin GA no se cuenta el axil o el cortante. */
export interface RigidezBarra {
  EI: number;
  EA?: number;
  GA?: number;
  /** Coeficiente de cortante de la ec. 13.37 (6/5 si no se dice). */
  chi?: number;
  /** Deformación inicial uniforme (α·ΔT) y curvatura inicial (α·ΔT/h). */
  eps0?: number;
  kappa0?: number;
}

/** Las mismas rigideces para todas las barras, o una por barra. */
export type Rigideces = RigidezBarra | Readonly<Record<string, RigidezBarra>>;

/** EI > 0 siempre; EA, GA y χ > 0 si se dan (sin EA ni GA, la barra no se deforma por axil ni por cortante). */
function compruebaRigidez(x: RigidezBarra, quien: string): RigidezBarra {
  if (!(x.EI > 0)) throw new Error(`${quien} necesita EI > 0.`);
  if (x.EA !== undefined && !(x.EA > 0)) throw new Error(`${quien} necesita EA > 0 (o no darla).`);
  if (x.GA !== undefined && !(x.GA > 0)) throw new Error(`${quien} necesita GA > 0 (o no darla).`);
  if (x.chi !== undefined && !(x.chi > 0)) throw new Error(`${quien} necesita χ > 0 (o no darlo).`);
  return x;
}

function rigidezDe(r: Rigideces, id: string): RigidezBarra {
  if (typeof (r as RigidezBarra).EI === 'number') return compruebaRigidez(r as RigidezBarra, 'Cada barra');
  const x = (r as Record<string, RigidezBarra>)[id];
  if (!x) throw new Error(`Faltan las rigideces de la barra «${id}».`);
  return compruebaRigidez(x, `La barra «${id}»`);
}

/** ∫ f(barra, s) ds sobre todas las barras, partiendo por los puntos singulares de las soluciones. */
function sobreBarras(sols: readonly Solucion[], f: (id: string, s: number, rig: RigidezBarra) => number, rig: Rigideces): number {
  const est = sols[0].est;
  let total = 0;
  for (const b of est.barras) {
    const L = geometria(est, b).L;
    const cortes = sols.flatMap((s) => singulares(s.est, b, L));
    const r = rigidezDe(rig, b.id);
    total += integra((s) => f(b.id, s, r), 0, L, cortes);
  }
  return total;
}

/** ∫(Na·Nb/EA + Ma·Mb/EI + χ·Va·Vb/GA), el producto que da δ por la fuerza unitaria. */
export function producto(a: Solucion, b: Solucion, rig: Rigideces): number {
  return sobreBarras(
    [a, b],
    (id, s, r) => {
      const ea = esfuerzosEn(a, id, s);
      const eb = esfuerzosEn(b, id, s);
      let v = (ea.M * eb.M) / r.EI;
      if (r.EA) v += (ea.N * eb.N) / r.EA;
      if (r.GA) v += ((r.chi ?? 6 / 5) * ea.V * eb.V) / r.GA;
      return v;
    },
    rig,
  );
}

export interface Coenergia {
  total: number;
  N: number;
  M: number;
  V: number;
  iniciales: number;
}

/** La coenergía de la tabla de la p. 16, término a término. */
export function coenergia(sol: Solucion, rig: Rigideces): Coenergia {
  const parte = (que: 'N' | 'M' | 'V' | 'iniciales') =>
    sobreBarras(
      [sol],
      (id, s, r) => {
        const e = esfuerzosEn(sol, id, s);
        if (que === 'M') return (e.M * e.M) / (2 * r.EI);
        if (que === 'N') return r.EA ? (e.N * e.N) / (2 * r.EA) : 0;
        if (que === 'V') return r.GA ? ((r.chi ?? 6 / 5) * e.V * e.V) / (2 * r.GA) : 0;
        return e.N * (r.eps0 ?? 0) + e.M * (r.kappa0 ?? 0);
      },
      rig,
    );
  const c = { N: parte('N'), M: parte('M'), V: parte('V'), iniciales: parte('iniciales') };
  return { ...c, total: c.N + c.M + c.V + c.iniciales };
}

/* ─── Cargas unidad ─── */

/** Dónde se aplica una carga: un nudo, o un punto de una barra a distancia s de su nudo i. */
export type Punto = { nudo: string } | { barra: string; s: number };

/**
 * La carga unidad del desplazamiento que se busca: una fuerza en la
 * dirección `direccion` (se normaliza), un par antihorario, o el par de
 * fuerzas que acerca dos nudos.
 */
export type Unidad =
  | ({ tipo: 'fuerza'; direccion: Vec2 } & Punto)
  | ({ tipo: 'par' } & Punto)
  | { tipo: 'relativo'; a: string; b: string };

function unitario2(d: Vec2): Vec2 {
  const n = Math.hypot(d[0], d[1]);
  if (!(n > 0)) throw new Error('La dirección no puede ser el vector nulo.');
  return [d[0] / n, d[1] / n];
}

/** Las cargas de `estructura.ts` que son X veces la unidad. */
export function cargasDe(est: Estructura, u: Unidad, X = 1): Carga[] {
  if (u.tipo === 'relativo') {
    const pa = nudo(est, u.a);
    const pb = nudo(est, u.b);
    const e = unitario2([pb.x - pa.x, pb.y - pa.y]);
    return [
      { tipo: 'nudo', nudo: u.a, Fx: X * e[0], Fy: X * e[1] },
      { tipo: 'nudo', nudo: u.b, Fx: -X * e[0], Fy: -X * e[1] },
    ];
  }
  if ('nudo' in u) nudo(est, u.nudo);
  if (u.tipo === 'fuerza') {
    const e = unitario2(u.direccion);
    if ('nudo' in u) return [{ tipo: 'nudo', nudo: u.nudo, Fx: X * e[0], Fy: X * e[1] }];
    return [{ tipo: 'puntual', barra: u.barra, s: u.s, Fx: X * e[0], Fy: X * e[1] }];
  }
  if ('nudo' in u) return [{ tipo: 'nudo', nudo: u.nudo, M: X }];
  return [{ tipo: 'par', barra: u.barra, s: u.s, M: X }];
}

/** La misma estructura (mismos apoyos) con solo la carga unidad, resuelta. */
export function solucionUnidad(est: Estructura, u: Unidad): Solucion {
  return resuelve({ ...est, cargas: cargasDe(est, u) });
}

/** δ en el sentido de la carga unidad (ec. 13.14 con el método de la fuerza unitaria), con ε0 y κ0. */
export function desplazamiento(sol: Solucion, rig: Rigideces, u: Unidad): number {
  const un = solucionUnidad(sol.est, u);
  return producto(sol, un, rig) + iniciales(un, rig);
}

/* ─── Hiperestáticos: Menabrea ─── */

export type RedundantePlana =
  | { tipo: 'fuerza'; nudo: string; direccion: Vec2; desplazamiento?: number; k?: number }
  | { tipo: 'par'; nudo: string; giro?: number; k?: number }
  | { tipo: 'tirante'; a: string; b: string; EA: number; eps0?: number };

export interface Menabrea {
  X: number[];
  /** δ0i: el desplazamiento de i en la base con las cargas (con ε0 y κ0). */
  d0: number[];
  /** δij: el de i con Xj = 1 sola (simétrica, por Maxwell). */
  d: number[][];
  final: Estructura;
  sol: Solucion;
}

function comoUnidad(r: RedundantePlana): Unidad {
  if (r.tipo === 'fuerza') return { tipo: 'fuerza', nudo: r.nudo, direccion: r.direccion };
  if (r.tipo === 'par') return { tipo: 'par', nudo: r.nudo };
  return { tipo: 'relativo', a: r.a, b: r.b };
}

/** Lo que la condición de i añade a la diagonal (−1/k o −L/EA) y lo que pide (δ0i). */
function condicion(est: Estructura, r: RedundantePlana): { flex: number; objetivo: number } {
  if (r.tipo === 'tirante') {
    if (!(r.EA > 0)) throw new Error('El tirante necesita EA > 0.');
    const pa = nudo(est, r.a);
    const pb = nudo(est, r.b);
    const L = Math.hypot(pb.x - pa.x, pb.y - pa.y);
    return { flex: L / r.EA, objetivo: -(r.eps0 ?? 0) * L };
  }
  if (r.k !== undefined) {
    if (!(r.k > 0)) throw new Error('La rigidez del resorte tiene que ser positiva.');
    return { flex: 1 / r.k, objetivo: 0 };
  }
  return { flex: 0, objetivo: r.tipo === 'fuerza' ? (r.desplazamiento ?? 0) : (r.giro ?? 0) };
}

/**
 * Resuelve el hiperestático: `base` es la estructura isostática que queda al
 * quitar los enlaces redundantes, con sus cargas; cada redundante es una
 * fuerza o un par de reacción, o un tirante. δ0i + Σ δij·Xj = objetivo − flex·Xi.
 */
export function menabrea(base: Estructura, rig: Rigideces, redundantes: readonly RedundantePlana[]): Menabrea {
  if (redundantes.length === 0) throw new Error('Hace falta al menos una incógnita hiperestática.');
  const sol0 = resuelve(base);
  const unidades = redundantes.map((r) => solucionUnidad(base, comoUnidad(r)));
  const d0 = unidades.map((u) => producto(sol0, u, rig) + iniciales(u, rig));
  const d = unidades.map((ui) => unidades.map((uj) => producto(uj, ui, rig)));
  const conds = redundantes.map((r) => condicion(base, r));
  const A = d.map((fila, i) => fila.map((dij, j) => dij + (i === j ? conds[i].flex : 0)));
  const b = conds.map((c, i) => c.objetivo - d0[i]);
  const s = resuelveLineal(A, b);
  if (s.rango < redundantes.length) throw new Error('Las redundantes elegidas no son independientes: la base sería un mecanismo.');
  const X = s.x;
  const final: Estructura = { ...base, cargas: [...base.cargas, ...redundantes.flatMap((r, i) => cargasDe(base, comoUnidad(r), X[i]))] };
  return { X, d0, d, final, sol: resuelve(final) };
}

/** ∫(n·ε0 + m·κ0) de una solución unidad. */
function iniciales(u: Solucion, rig: Rigideces): number {
  return sobreBarras(
    [u],
    (id, s, r) => {
      const e = esfuerzosEn(u, id, s);
      return e.N * (r.eps0 ?? 0) + e.M * (r.kappa0 ?? 0);
    },
    rig,
  );
}

/* ─── El coeficiente de cortante de la ec. 13.37 ─── */

/**
 * χy = (A/Iz²)·∫(Qz/b)² dA, integrado por franjas horizontales con el
 * momento estático y el ancho de `secciones.ts` (Gauss en cada tramo entre
 * cambios de ancho).
 */
export function coeficienteCortante(sec: Seccion): number {
  const p = propiedades(sec);
  const ys = [
    ...vertices(sec).map((v) => v[0]),
    ...sec.flatMap((q) => (q.tipo === 'circulo' ? [q.y - q.R, q.y + q.R] : [])),
  ];
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const cortes = [...new Set(ys)].sort((a, b) => a - b);
  const f = (y: number) => {
    const b = anchoEnFibra(sec, y);
    if (!(b > 0)) return 0;
    const Q = momentoEstatico(sec, y, 'encima').Qz;
    return (Q / b) ** 2 * b;
  };
  /* subdividir: Q/b no es polinómico en un círculo */
  const n = 64;
  const partes: number[] = [];
  for (let k = 1; k < n; k++) partes.push(yMin + ((yMax - yMin) * k) / n);
  const I = integra(f, yMin, yMax, [...cortes, ...partes]);
  return (p.A / (p.Iz * p.Iz)) * I;
}
