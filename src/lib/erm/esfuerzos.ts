/**
 * Tema 7 de ERM: los esfuerzos de sección N, V y M de una estructura ya
 * resuelta (`estructura.ts`), sus diagramas, sus valores en cada tramo y sus
 * máximos.
 *
 * Para quién y cuándo: los mismos que `estructura.ts`; esto es lo que el
 * examen pide dibujar. Qué gana: los valores de cada tramo —en los dos
 * extremos y en el punto donde V = 0, que es donde M es extremo (tema 7,
 * p. 13: «si T = 0 en un punto, M tiene tangente horizontal»)— sin leerlos de
 * un dibujo. Cómo se comprueba: `tests/fisica/erm/esfuerzos.test.ts`, que
 * mira además dM/dx = V y dV/dx = −q por diferencias finitas, un camino que no
 * pasa por las fórmulas de aquí.
 *
 * Convenio (el del curso, escrito entero en la cabecera de `estructura.ts`):
 * se aísla el trozo de barra que va del nudo `i` a la sección; N, V y M son lo
 * que el resto ejerce sobre su cara derecha, con N > 0 tracción, V > 0 según
 * la y local y M > 0 traccionando la fibra del lado +y (tema 7, pp. 8-9 y 12).
 */
import {
  barra,
  cargasHasta,
  cruz,
  geometria,
  type Barra,
  type Estructura,
  type Geometria,
  type Solucion,
  type Vec2,
} from './estructura';

export interface Esfuerzos {
  N: number;
  V: number;
  M: number;
}

function esfuerzosGeo(sol: Solucion, b: Barra, geo: Geometria, s: number, lado: 'izq' | 'der'): Esfuerzos {
  const P: Vec2 = [geo.pi[0] + s * geo.ex[0], geo.pi[1] + s * geo.ex[1]];
  const F0 = sol.extremoI.get(b.id);
  if (!F0) throw new Error(`La solución no tiene la barra «${b.id}».`);
  const c = cargasHasta(sol.est, b, geo, s, lado, P);
  const Fx = F0.Fx + c.Fx;
  const Fy = F0.Fy + c.Fy;
  const Mt = F0.M + cruz([geo.pi[0] - P[0], geo.pi[1] - P[1]], [F0.Fx, F0.Fy]) + c.M;
  /* Lo que el resto de la estructura ejerce sobre la cara derecha del trozo
     equilibra todo lo anterior. M antihorario en ejes globales es el M del
     curso: la z local (x × y) apunta hacia −Z, y el flector positivo va «en el
     sentido opuesto del eje z» (tema 7, p. 8). */
  return {
    N: -(Fx * geo.ex[0] + Fy * geo.ex[1]),
    V: -(Fx * geo.ey[0] + Fy * geo.ey[1]),
    M: -Mt,
  };
}

/**
 * N, V y M en la sección a distancia `s` del nudo `i` de la barra. Donde hay
 * una carga puntual o un par, el diagrama salta: `lado` dice de qué lado del
 * salto se pregunta (`der` lo incluye).
 */
export function esfuerzosEn(sol: Solucion, barraId: string, s: number, lado: 'izq' | 'der' = 'der'): Esfuerzos {
  const b = barra(sol.est, barraId);
  return esfuerzosGeo(sol, b, geometria(sol.est, b), s, lado);
}

/**
 * Abscisas donde algo cambia en la barra: extremos, cargas puntuales, pares,
 * bordes de repartidas y el punto donde una repartida cambia de signo (ahí V
 * tiene un extremo, por dV/dx = −q, y así queda en el borde de un tramo).
 */
export function singulares(est: Estructura, b: Barra, L: number): number[] {
  const s = new Set<number>([0, L]);
  for (const c of est.cargas) {
    if (c.tipo === 'nudo' || c.barra !== b.id) continue;
    if (c.tipo === 'repartida') {
      s.add(c.s1);
      s.add(c.s2);
      if (c.q1 * c.q2 < 0) s.add(c.s1 + (c.q1 / (c.q1 - c.q2)) * (c.s2 - c.s1));
    } else s.add(c.s);
  }
  return [...s].filter((x) => x >= 0 && x <= L).sort((a, z) => a - z);
}

export interface Extremo {
  barra: string;
  s: number;
  valor: number;
}

export interface Tramo {
  barra: string;
  s0: number;
  s1: number;
  /** Valores justo a la derecha de `s0` y justo a la izquierda de `s1`. */
  inicio: Esfuerzos;
  fin: Esfuerzos;
  /** Puntos interiores donde V = 0, con su M: los extremos relativos del flector. */
  ceros: { s: number; M: number }[];
}

/**
 * Ceros de V dentro de (a, b) por muestreo y bisección. V es continua dentro de
 * un tramo. Si V es nula en todo el tramo (|V| ≤ 10⁻⁹·escala en cada muestra),
 * no hay cero aislado sino un tramo de M constante, y no se devuelve ninguno.
 */
function cerosDeV(f: (s: number) => number, a: number, b: number, escala: number, n = 64): number[] {
  const out: number[] = [];
  const h = (b - a) / n;
  let maxV = 0;
  for (let k = 0; k <= n; k++) maxV = Math.max(maxV, Math.abs(f(a + h * (k === 0 ? 1e-6 : k === n ? n - 1e-6 : k))));
  if (maxV <= 1e-9 * Math.max(escala, maxV)) return out;
  const tol = 1e-13 * Math.max(1, Math.abs(b));
  let x0 = a + h * 1e-6;
  let f0 = f(x0);
  for (let k = 1; k <= n; k++) {
    const x1 = k === n ? b - h * 1e-6 : a + k * h;
    const f1 = f(x1);
    if (f0 === 0) out.push(x0);
    else if (f0 * f1 < 0) {
      let lo = x0;
      let hi = x1;
      let flo = f0;
      for (let it = 0; it < 200 && hi - lo > tol; it++) {
        const mid = (lo + hi) / 2;
        const fm = f(mid);
        if (fm === 0) {
          lo = hi = mid;
          break;
        }
        if (flo * fm < 0) hi = mid;
        else {
          lo = mid;
          flo = fm;
        }
      }
      out.push((lo + hi) / 2);
    }
    x0 = x1;
    f0 = f1;
  }
  return out;
}

/** Los tramos de todas las barras, con sus valores en los bordes y los ceros de V. */
export function tramos(sol: Solucion): Tramo[] {
  const out: Tramo[] = [];
  for (const b of sol.est.barras) {
    const geo = geometria(sol.est, b);
    const xs = singulares(sol.est, b, geo.L);
    /* La escala de V en la barra: su mayor |V| en los puntos singulares. Dentro
       de un tramo sin carga V es constante, así que en los casos de examen la
       guarda de `cerosDeV` solo actúa con V exactamente nulo; la tolerancia es
       para el ruido de redondeo. */
    let escala = 0;
    for (const x of xs) {
      for (const lado of ['izq', 'der'] as const) escala = Math.max(escala, Math.abs(esfuerzosGeo(sol, b, geo, x, lado).V));
    }
    for (let k = 0; k + 1 < xs.length; k++) {
      const s0 = xs[k];
      const s1 = xs[k + 1];
      const V = (s: number) => esfuerzosGeo(sol, b, geo, s, 'der').V;
      const ceros = cerosDeV(V, s0, s1, escala).map((s) => ({ s, M: esfuerzosGeo(sol, b, geo, s, 'der').M }));
      out.push({
        barra: b.id,
        s0,
        s1,
        inicio: esfuerzosGeo(sol, b, geo, s0, 'der'),
        fin: esfuerzosGeo(sol, b, geo, s1, 'izq'),
        ceros,
      });
    }
  }
  return out;
}

export interface Maximos {
  Mmax: Extremo;
  Mmin: Extremo;
  Vmax: Extremo;
  Vmin: Extremo;
  Nmax: Extremo;
  Nmin: Extremo;
}

/**
 * Los máximos y mínimos de N, V y M en toda la estructura. Salen de los bordes
 * de los tramos y de los ceros de V: dentro de un tramo M solo tiene extremos
 * donde V = 0 (dM/dx = V), y V solo donde q = 0 (dV/dx = −q), que
 * `singulares` ya ha convertido en borde de tramo. Y N tampoco tiene extremos
 * interiores: dN/dx = −q_x (tema 7, ec. 7.8), y la componente axial de una
 * repartida se anula donde se anula ella.
 */
export function maximos(sol: Solucion): Maximos {
  const cand: { barra: string; s: number; e: Esfuerzos }[] = [];
  for (const t of tramos(sol)) {
    cand.push({ barra: t.barra, s: t.s0, e: t.inicio }, { barra: t.barra, s: t.s1, e: t.fin });
    for (const z of t.ceros) cand.push({ barra: t.barra, s: z.s, e: { N: t.inicio.N, V: 0, M: z.M } });
  }
  const mejor = (k: keyof Esfuerzos, signo: 1 | -1): Extremo => {
    let m = cand[0];
    for (const c of cand) if (signo * c.e[k] > signo * m.e[k]) m = c;
    return { barra: m.barra, s: m.s, valor: m.e[k] };
  };
  return {
    Mmax: mejor('M', 1),
    Mmin: mejor('M', -1),
    Vmax: mejor('V', 1),
    Vmin: mejor('V', -1),
    Nmax: mejor('N', 1),
    Nmin: mejor('N', -1),
  };
}

export interface PuntoDiagrama extends Esfuerzos {
  s: number;
}

/**
 * Los tres diagramas de una barra muestreados en `n` puntos, con los puntos
 * singulares repetidos a los dos lados para que los saltos salgan verticales.
 */
export function diagrama(sol: Solucion, barraId: string, n = 200): PuntoDiagrama[] {
  const b = barra(sol.est, barraId);
  const geo = geometria(sol.est, b);
  const sing = singulares(sol.est, b, geo.L);
  const tol = 1e-9 * geo.L;
  /* `orden` coloca, en una misma abscisa, el valor de la izquierda antes que
     el de la derecha: así el salto se dibuja de abajo arriba y no en zigzag. */
  const pts: (PuntoDiagrama & { orden: number })[] = [];
  for (const s of sing) {
    pts.push({ s, orden: 0, ...esfuerzosGeo(sol, b, geo, s, 'izq') });
    pts.push({ s, orden: 1, ...esfuerzosGeo(sol, b, geo, s, 'der') });
  }
  for (let k = 0; k <= n; k++) {
    const s = (geo.L * k) / n;
    if (sing.some((x) => Math.abs(x - s) < tol)) continue;
    pts.push({ s, orden: 0, ...esfuerzosGeo(sol, b, geo, s, 'der') });
  }
  return pts
    .sort((p, q) => p.s - q.s || p.orden - q.orden)
    .map(({ s, N, V, M }) => ({ s, N, V, M }));
}
