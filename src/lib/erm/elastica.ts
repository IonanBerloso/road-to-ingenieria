/**
 * Temas 10 y 11 de ERM: la curva elástica de una viga recta —giros y
 * flechas en cualquier punto— y las reacciones de las vigas hiperestáticas
 * (empotradas, continuas, con resortes, con asientos de apoyo y con rótulas),
 * por integración de la ecuación diferencial de la elástica con las
 * condiciones de contorno y de compatibilidad.
 *
 * Para quién: para el alumno que prepara la 2.ª parte, la final o la
 * extraordinaria, y para quien escriba sus ejercicios guiados. Cuándo: «flecha
 * y giro de una viga» cae en trece preguntas de examen de las leídas (`p0`) y
 * «viga hiperestática» o «continua» en diecinueve, casi siempre con una
 * rótula, un resorte o un asiento. Qué gana: el giro y la flecha de cualquier
 * sección y las incógnitas hiperestáticas sin plantear a mano las constantes
 * de integración. Cómo se comprueba: `tests/fisica/erm/elastica.test.ts`
 * (casos de libro como 5qL⁴/384EI y 3qL/8; las soluciones 10.3 y 10.4 de la
 * colección; en los isostáticos, las reacciones y el flector de
 * `estructura.ts`, que es otro código; los teoremas de Mohr; las funciones de
 * singularidad de `singularidad.ts`; la viga conjugada de `conjugada.ts`; el
 * teorema de los tres momentos de `tresMomentos.ts`; Maxwell-Betti).
 *
 * No es un segundo modelo de viga (CLAUDE.md §01): las cargas son las de
 * `viga.ts` (P y q positivas hacia abajo, un par positivo el que tracciona la
 * fibra inferior) y los apoyos, los de `vigas.ts` (`articulado`, `movil`,
 * `empotramiento`), a los que se añade el resorte del tema 11. El flector es
 * el de `viga.ts` —la suma de los momentos de lo que queda a la izquierda,
 * M > 0 tracciona la fibra inferior (tema 7, p. 8)—, con las reacciones como
 * incógnitas; en los isostáticos, el test exige que coincida con el de
 * `estructura.ts` en cada punto.
 *
 * EL CONVENIO ES EL DEL CURSO (apuntes del tema 10):
 *
 *   · x de izquierda a derecha, y y la flecha v hacia ABAJO (figuras 10.1,
 *     10.2 y 10.8, pp. 4-11): v > 0 es una sección que baja.
 *   · El giro es θ = dv/dx (ec. 10.13, p. 7): θ > 0 es un giro HORARIO (la
 *     elástica baja al avanzar x). Es el signo de las soluciones 10.3 y 10.4
 *     de la colección: θC = qa³/2EI en la punta de un voladizo cargado.
 *   · La ecuación de la elástica: d²v/dx² = −M/EIz (ec. 10.14, p. 7).
 *   · Primer teorema de Mohr: θA − θB = ∫ M/EI dx de A a B (ecs. 10.16-10.17,
 *     p. 10); segundo: δB,A = ∫ M·xB/EI dxB (ecs. 10.20-10.21, pp. 10-11),
 *     con xB medida desde B hacia A.
 *   · Tema 11: el asiento de un apoyo, δ, positivo hacia abajo (es una v),
 *     como en la ec. 11.3 (p. 7). Un resorte de rigidez k bajo la viga da
 *     una reacción hacia arriba R = k·v.
 *   · En una rótula el giro salta y el flector es nulo; una rótula sin apoyo
 *     tiene la flecha continua.
 *
 * Cómo se resuelve: v(x) = v0 + θ0·x − ∫₀ˣ (x − s)·M(s)/EI(s) ds + Σ Δθh·⟨x − xh⟩,
 * con M lineal en las reacciones. Incógnitas: las reacciones verticales, los
 * pares de empotramiento, v0, θ0 y el salto de giro de cada rótula.
 * Ecuaciones: ΣFy = 0, M = 0 más allá del extremo derecho, M = 0 en cada
 * rótula, la flecha de cada apoyo (su asiento, o R/k en un resorte) y el giro
 * de cada empotramiento. El sistema es cuadrado; si no tiene rango completo,
 * la viga es un mecanismo. Las integrales, por Gauss-Legendre de cinco puntos
 * en cada tramo entre puntos singulares, exacta para los polinomios de grado
 * ≤ 9 que salen con cargas lineales.
 */
import type { Carga } from '../viga';
import { trapecio } from './estructura';
import { resuelveLineal } from './lineal';

/** Un apoyo de la viga elástica: los de `vigas.ts`, con asiento, y el resorte. */
export type ApoyoElastico =
  | { tipo: 'articulado' | 'movil'; x: number; asiento?: number }
  | { tipo: 'empotramiento'; x: number; asiento?: number; giro?: number }
  | { tipo: 'resorte'; x: number; k: number };

/** EI por tramos: [x0, x1) con su rigidez. */
export interface TramoEI {
  x0: number;
  x1: number;
  EI: number;
}

export interface VigaElastica {
  L: number;
  /** La rigidez a flexión: un número si es uniforme, o por tramos que cubran [0, L]. */
  EI: number | readonly TramoEI[];
  apoyos: readonly ApoyoElastico[];
  /** Abscisas de las rótulas intermedias. */
  rotulas?: readonly number[];
  cargas: readonly Carga[];
}

/* ─── Integración ──────────────────────────────────────────────────────── */

/** Nodos y pesos de Gauss-Legendre de cinco puntos en [−1, 1]. */
const GL_X = [
  0, -0.5384693101056831, 0.5384693101056831, -0.906179845938664, 0.906179845938664,
];
const GL_W = [
  0.5688888888888889, 0.47862867049936647, 0.47862867049936647, 0.23692688505618908, 0.23692688505618908,
];

/** ∫ f en [a, b] partiendo por los puntos `cortes` (los que caen dentro). */
export function integra(f: (s: number) => number, a: number, b: number, cortes: readonly number[]): number {
  if (b <= a) return 0;
  const xs = [a, ...cortes.filter((c) => c > a && c < b), b].sort((m, n) => m - n);
  let total = 0;
  for (let k = 0; k + 1 < xs.length; k++) {
    const x0 = xs[k];
    const x1 = xs[k + 1];
    if (x1 - x0 <= 0) continue;
    const m = (x0 + x1) / 2;
    const h = (x1 - x0) / 2;
    for (let i = 0; i < 5; i++) total += GL_W[i] * f(m + h * GL_X[i]) * h;
  }
  return total;
}

/* ─── El flector de las cargas (como en viga.ts) ───────────────────────── */

/**
 * Momento flector y cortante en x de las CARGAS que quedan a la izquierda
 * (sin reacciones): M > 0 tracciona la fibra inferior, V es la suma de las
 * fuerzas hacia arriba. `lado` dice de qué lado de una puntual o un par se
 * pregunta. Las repartidas, por su resultante y su centroide (`trapecio`).
 */
export function cargasIzquierda(cargas: readonly Carga[], x: number, lado: 'izq' | 'der' = 'der'): { M: number; V: number } {
  const tol = 1e-12 * Math.max(1, Math.abs(x));
  const cuenta = (xi: number) => (lado === 'der' ? xi <= x + tol : xi < x - tol);
  let M = 0;
  let V = 0;
  for (const c of cargas) {
    if (c.tipo === 'puntual') {
      if (cuenta(c.x)) {
        M -= c.P * (x - c.x);
        V -= c.P;
      }
    } else if (c.tipo === 'par') {
      if (cuenta(c.x)) M += c.M;
    } else {
      const hasta = Math.min(x, c.x2);
      if (hasta <= c.x1) continue;
      const qh = c.q1 + ((c.q2 - c.q1) * (hasta - c.x1)) / (c.x2 - c.x1);
      /* dos triángulos, para que el par sea exacto aunque q cambie de signo */
      const t1 = trapecio(c.x1, hasta, c.q1, 0);
      const t2 = trapecio(c.x1, hasta, 0, qh);
      M -= t1.R * (x - t1.sc) + t2.R * (x - t2.sc);
      V -= t1.R + t2.R;
    }
  }
  return { M, V };
}

/* ─── La viga ──────────────────────────────────────────────────────────── */

function rigidez(v: VigaElastica): (s: number) => number {
  return rigidezPorTramos(v.L, v.EI);
}

/**
 * La EI en cada x de una viga de luz L, uniforme o por tramos, comprobada:
 * positiva, y los tramos cubriendo [0, L] sin huecos ni solapes. La usa
 * también la viga conjugada.
 */
export function rigidezPorTramos(L: number, EIs: number | readonly TramoEI[]): (s: number) => number {
  if (typeof EIs === 'number') {
    const EI = EIs;
    if (!(EI > 0)) throw new Error('La rigidez EI tiene que ser positiva.');
    return () => EI;
  }
  const tramos = [...EIs].sort((a, b) => a.x0 - b.x0);
  if (tramos.length === 0) throw new Error('Faltan los tramos de EI.');
  for (const t of tramos) if (!(t.EI > 0) || !(t.x1 > t.x0)) throw new Error('Un tramo de EI no es válido.');
  const tol = 1e-9 * L;
  if (Math.abs(tramos[0].x0) > tol || Math.abs(tramos[tramos.length - 1].x1 - L) > tol) {
    throw new Error('Los tramos de EI tienen que cubrir la viga de 0 a L.');
  }
  for (let k = 1; k < tramos.length; k++) {
    if (Math.abs(tramos[k].x0 - tramos[k - 1].x1) > tol) throw new Error('Los tramos de EI dejan un hueco o se solapan.');
  }
  return (s: number) => {
    for (const t of tramos) if (s < t.x1) return t.EI;
    return tramos[tramos.length - 1].EI;
  };
}

/** Puntos donde cambia algo: extremos, cargas, apoyos, rótulas y cambios de EI. */
function singulares(v: VigaElastica): number[] {
  const s = new Set<number>([0, v.L]);
  for (const c of v.cargas) {
    if (c.tipo === 'repartida') {
      s.add(c.x1);
      s.add(c.x2);
    } else s.add(c.x);
  }
  for (const a of v.apoyos) s.add(a.x);
  for (const r of v.rotulas ?? []) s.add(r);
  if (typeof v.EI !== 'number') for (const t of v.EI) s.add(t.x0), s.add(t.x1);
  return [...s].sort((a, b) => a - b);
}

function compruebaViga(v: VigaElastica): void {
  if (!(v.L > 0)) throw new Error('La longitud de la viga tiene que ser positiva.');
  const tol = 1e-9 * v.L;
  const fuera = (x: number, que: string) => {
    if (x < -tol || x > v.L + tol) throw new Error(`${que} en x = ${x} está fuera de la viga (0 a ${v.L}).`);
  };
  for (const a of v.apoyos) {
    fuera(a.x, 'Un apoyo');
    if (a.tipo === 'resorte' && !(a.k > 0)) throw new Error('La rigidez de un resorte tiene que ser positiva.');
  }
  for (const r of v.rotulas ?? []) fuera(r, 'Una rótula');
  for (const c of v.cargas) {
    if (c.tipo === 'repartida') {
      fuera(c.x1, 'Una repartida');
      fuera(c.x2, 'Una repartida');
      if (!(c.x2 > c.x1)) throw new Error('Una repartida tiene que ir de x1 a x2 > x1.');
    } else fuera(c.x, 'Una carga');
    if (c.tipo === 'par' && (v.rotulas ?? []).some((r) => Math.abs(r - c.x) < tol)) {
      throw new Error(`Un par aplicado justo en la rótula de x = ${c.x} no dice a qué lado actúa.`);
    }
  }
}

/** La solución: reacciones, constantes de la elástica y las funciones para preguntar. */
export interface ElasticaResuelta {
  viga: VigaElastica;
  /** Reacción vertical de cada apoyo, hacia arriba, en el orden de `viga.apoyos`. */
  R: number[];
  /** Par de cada apoyo (0 si no es empotramiento), con el signo de un par de `viga.ts`. */
  Mapoyo: number[];
  v0: number;
  theta0: number;
  /** Salto de giro θ(xh⁺) − θ(xh⁻) en cada rótula, en el orden de `viga.rotulas`. */
  saltos: number[];
  M: (x: number, lado?: 'izq' | 'der') => number;
  V: (x: number, lado?: 'izq' | 'der') => number;
  theta: (x: number, lado?: 'izq' | 'der') => number;
  v: (x: number) => number;
}

/**
 * Resuelve la viga: isostática o hiperestática, con rótulas, resortes,
 * asientos y EI por tramos. Lanza si es un mecanismo.
 */
export function resuelveElastica(viga: VigaElastica): ElasticaResuelta {
  compruebaViga(viga);
  const EI = rigidez(viga);
  const sing = singulares(viga);
  const rot = [...(viga.rotulas ?? [])];
  const ap = viga.apoyos;
  const nR = ap.length;
  const emp = ap.map((a, k) => (a.tipo === 'empotramiento' ? k : -1)).filter((k) => k >= 0);
  const nM = emp.length;
  const nInc = nR + nM + 2 + rot.length;
  const iV0 = nR + nM;
  const iT0 = iV0 + 1;
  const iRot = iT0 + 1;
  const tolX = 1e-12 * viga.L;

  /* El flector en s como función lineal de las incógnitas: [coeficientes, término independiente]. */
  const flectorLineal = (s: number): { c: number[]; b: number } => {
    const c = new Array<number>(nInc).fill(0);
    ap.forEach((a, k) => {
      if (a.x <= s + tolX) c[k] = s - a.x;
    });
    emp.forEach((k, j) => {
      if (ap[k].x <= s + tolX) c[nR + j] = 1;
    });
    return { c, b: cargasIzquierda(viga.cargas, s).M };
  };

  /* ∫₀ˣ M/EI y ∫₀ˣ (x − s)·M/EI, por columnas (lineales en las incógnitas). */
  const integrales = (x: number) => {
    const F = new Array<number>(nInc + 1).fill(0);
    const G = new Array<number>(nInc + 1).fill(0);
    const xs = [...sing, x];
    const columnas = [...Array(nR + nM).keys()];
    const fM = (s: number, j: number) => {
      const { c, b } = flectorLineal(s);
      return (j < 0 ? b : c[j]) / EI(s);
    };
    for (const j of [-1, ...columnas]) {
      const col = j < 0 ? nInc : j;
      F[col] = integra((s) => fM(s, j), 0, x, xs);
      G[col] = integra((s) => (x - s) * fM(s, j), 0, x, xs);
    }
    return { F, G };
  };

  /* Filas del sistema: fila·[incógnitas] = término. */
  const A: number[][] = [];
  const b: number[] = [];
  const fila = () => new Array<number>(nInc).fill(0);

  /* ΣFy = 0 */
  {
    const f = fila();
    for (let k = 0; k < nR; k++) f[k] = 1;
    A.push(f);
    b.push(-cargasIzquierda(viga.cargas, viga.L).V);
  }
  /* M = 0 más allá del extremo derecho (todo a la izquierda de L⁺) */
  {
    const { c, b: m } = flectorLineal(viga.L + 2 * tolX);
    A.push(c);
    b.push(-m);
  }
  /* M = 0 en cada rótula */
  for (const xr of rot) {
    const { c, b: m } = flectorLineal(xr);
    A.push(c);
    b.push(-m);
  }
  /* La flecha en x: v0 + θ0·x − G(x) + Σ Δθh·⟨x − xh⟩, como fila. */
  const filaFlecha = (x: number) => {
    const { G } = integrales(x);
    const f = fila();
    for (let j = 0; j < nR + nM; j++) f[j] = -G[j];
    f[iV0] = 1;
    f[iT0] = x;
    rot.forEach((xr, h) => {
      if (xr < x - tolX) f[iRot + h] = x - xr;
    });
    return { f, ind: -G[nInc] };
  };
  const filaGiro = (x: number) => {
    const { F } = integrales(x);
    const f = fila();
    for (let j = 0; j < nR + nM; j++) f[j] = -F[j];
    f[iT0] = 1;
    rot.forEach((xr, h) => {
      if (xr < x - tolX) f[iRot + h] = 1;
    });
    return { f, ind: -F[nInc] };
  };
  ap.forEach((a, k) => {
    const { f, ind } = filaFlecha(a.x);
    if (a.tipo === 'resorte') {
      /* v − R/k = 0 */
      f[k] -= 1 / a.k;
      A.push(f);
      b.push(-ind);
    } else {
      A.push(f);
      b.push((a.asiento ?? 0) - ind);
    }
  });
  emp.forEach((k) => {
    const a = ap[k] as Extract<ApoyoElastico, { tipo: 'empotramiento' }>;
    const { f, ind } = filaGiro(a.x);
    A.push(f);
    b.push((a.giro ?? 0) - ind);
  });

  const sol = resuelveLineal(A, b);
  const bmax = b.reduce((m, x) => Math.max(m, Math.abs(x)), 0);
  if (sol.rango < nInc || sol.residuo > 1e-8 * Math.max(bmax, 1e-300)) {
    throw new Error('La viga es un mecanismo: le faltan apoyos para estar en equilibrio.');
  }
  const X = sol.x;
  const R = X.slice(0, nR);
  const Mapoyo = ap.map((_, k) => {
    const j = emp.indexOf(k);
    return j < 0 ? 0 : X[nR + j];
  });
  const v0 = X[iV0];
  const theta0 = X[iT0];
  const saltos = rot.map((_, h) => X[iRot + h]);

  const M = (x: number, lado: 'izq' | 'der' = 'der') => {
    const tol = lado === 'der' ? tolX : -tolX;
    let m = cargasIzquierda(viga.cargas, x, lado).M;
    ap.forEach((a, k) => {
      if (a.x <= x + tol) m += R[k] * (x - a.x) + Mapoyo[k];
    });
    return m;
  };
  const V = (x: number, lado: 'izq' | 'der' = 'der') => {
    const tol = lado === 'der' ? tolX : -tolX;
    let s = cargasIzquierda(viga.cargas, x, lado).V;
    ap.forEach((a, k) => {
      if (a.x <= x + tol) s += R[k];
    });
    return s;
  };
  const conX = (fl: { f: number[]; ind: number }) => fl.f.reduce((s, c, j) => s + c * X[j], fl.ind);
  const theta = (x: number, lado: 'izq' | 'der' = 'der') => {
    let t = conX(filaGiro(x));
    /* filaGiro cuenta los saltos con xh < x; en la rótula misma, el lado decide */
    rot.forEach((xr, h) => {
      if (Math.abs(xr - x) <= tolX && lado === 'der') t += saltos[h];
    });
    return t;
  };
  const v = (x: number) => conX(filaFlecha(x));
  return { viga, R, Mapoyo, v0, theta0, saltos, M, V, theta, v };
}

/** Los teoremas de Mohr no valen a través de una rótula: allí el giro salta. */
function sinRotulaEntre(sol: ElasticaResuelta, a: number, b: number): void {
  const r = (sol.viga.rotulas ?? []).find((x) => x > a && x < b);
  if (r !== undefined) {
    throw new Error(`Hay una rótula en x = ${r} entre A y B: el giro salta en ella y el teorema de Mohr no la ve. Aplícalo a cada lado.`);
  }
}

/**
 * El primer teorema de Mohr: ∫ M/EI de xA a xB, que es θA − θB (ec. 10.16,
 * p. 10). Vale también con A a la derecha de B (la integral cambia de signo);
 * con una rótula entre los dos, lanza.
 */
export function mohr1(sol: ElasticaResuelta, xA: number, xB: number): number {
  const EI = rigidez(sol.viga);
  const [a, b] = xA < xB ? [xA, xB] : [xB, xA];
  sinRotulaEntre(sol, a, b);
  const I = integra((s) => sol.M(s) / EI(s), a, b, singulares(sol.viga));
  return xA < xB ? I : -I;
}

/**
 * El segundo teorema de Mohr: δB,A = ∫ M·xB/EI con xB medida desde B hacia A
 * (ec. 10.20, p. 10): la distancia de B′ a la tangente en A′, positiva si B′
 * queda por encima de ella (hacia −y). Con A a cualquier lado de B,
 * δB,A = vA + θA·(xB − xA) − vB; con una rótula entre los dos, lanza.
 */
export function mohr2(sol: ElasticaResuelta, xA: number, xB: number): number {
  const EI = rigidez(sol.viga);
  const [a, b] = xA < xB ? [xA, xB] : [xB, xA];
  sinRotulaEntre(sol, a, b);
  return integra((s) => (sol.M(s) * Math.abs(xB - s)) / EI(s), a, b, singulares(sol.viga));
}

/** Muestreo de los cuatro diagramas, con los puntos singulares a los dos lados. */
export function diagramaElastica(sol: ElasticaResuelta, n = 200): { x: number; M: number; V: number; theta: number; v: number }[] {
  const L = sol.viga.L;
  const out: { x: number; M: number; V: number; theta: number; v: number }[] = [];
  const xs = new Set<number>(singulares(sol.viga));
  for (let k = 0; k <= n; k++) xs.add((L * k) / n);
  for (const x of [...xs].sort((a, b) => a - b)) {
    out.push({ x, M: sol.M(x, 'izq'), V: sol.V(x, 'izq'), theta: sol.theta(x, 'izq'), v: sol.v(x) });
    out.push({ x, M: sol.M(x), V: sol.V(x), theta: sol.theta(x), v: sol.v(x) });
  }
  return out;
}

/**
 * La flecha extrema (la de mayor valor absoluto) y dónde está: en un extremo,
 * en una rótula o donde θ = 0, buscado por bisección entre las muestras.
 */
export function flechaMaxima(sol: ElasticaResuelta, n = 400): { x: number; v: number } {
  const L = sol.viga.L;
  const cand = new Set<number>([...singulares(sol.viga)]);
  let x0 = 0;
  let t0 = sol.theta(0);
  for (let k = 1; k <= n; k++) {
    const x1 = (L * k) / n;
    const t1 = sol.theta(x1, 'izq');
    if (t0 === 0) cand.add(x0);
    else if (t0 * t1 < 0) {
      let lo = x0;
      let hi = x1;
      let flo = t0;
      for (let it = 0; it < 100 && hi - lo > 1e-14 * L; it++) {
        const m = (lo + hi) / 2;
        const fm = sol.theta(m);
        if (flo * fm <= 0) hi = m;
        else {
          lo = m;
          flo = fm;
        }
      }
      cand.add((lo + hi) / 2);
    }
    x0 = x1;
    t0 = sol.theta(x1);
  }
  let mejor = { x: 0, v: sol.v(0) };
  for (const x of cand) {
    const v = sol.v(x);
    if (Math.abs(v) > Math.abs(mejor.v)) mejor = { x, v };
  }
  return mejor;
}
