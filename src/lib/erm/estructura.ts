/**
 * Tema 7 de ERM: estructuras planas de barras rectas —vigas y pórticos
 * isostáticos— y sus reacciones.
 *
 * Para quién: para el alumno de 2.º que prepara el parcial 1 de Elasticidad y
 * Resistencia de Materiales (30 de octubre de 2026), y para quien escriba sus
 * ejercicios guiados. Cuándo: en los problemas de diagramas, que caen en siete
 * de los diez parciales 1 distintos leídos entre 2012 y 2022 —con rótula
 * intermedia en los de 2014, 2018, 2019 y 2020—. Qué gana: el material no
 * trae resueltos los exámenes; con esto cada valor de un diagrama se calcula
 * y se comprueba por otro camino.
 * Cómo se comprueba: `tests/fisica/erm/esfuerzos.test.ts` (los cuatro casos de
 * `viga.test.ts` dan lo mismo aquí, el equilibrio global cierra y M = 0 en
 * las rótulas) y `tests/fisica/erm/aceptacion.test.ts` (el ejercicio 2 del
 * parcial del 16-11-2018, con su rótula en E).
 *
 * EL CONVENIO DE SIGNOS ES EL DEL CURSO, y es el mismo que el de `viga.ts`
 * (Mecánica Aplicada), que no se duplica sino que se amplía:
 *
 *   · Apuntes del tema 7, pp. 8-9 (figuras 7.4 y 7.5): en la sección derecha
 *     de la parte izquierda, x local sale de la sección (N > 0 es tracción),
 *     y local apunta hacia ABAJO en una barra que va de izquierda a derecha,
 *     y la cortante positiva va según +y. Con eso, V es la suma de las fuerzas
 *     hacia arriba que quedan a la izquierda, como en `viga.ts`.
 *   · Apuntes del tema 7, p. 8 (bajo las ecuaciones 7.7): M_z = ∫σx·y dA, así
 *     que M > 0 tracciona la fibra del lado +y: la inferior en una viga.
 *   · Apuntes del tema 7, p. 12 (ecuaciones 7.14 y 7.15): dV/dx = −q y
 *     dM/dx = V, con q positiva según +y (hacia abajo). Los apuntes llaman T a
 *     la cortante; las diapositivas del tema la llaman V, y aquí se usa V.
 *   · Apuntes del tema 7, p. 8: «las secciones se denominarán sección derecha
 *     o sección izquierda atendiendo al sistema de referencia que se adopte,
 *     incluso cuando la orientación de la pieza sea vertical». Por eso en un
 *     pórtico cada barra lleva su x local del nudo `i` al nudo `j`, y su y
 *     local es esa x girada 90° en sentido horario: en una barra que sube, y
 *     apunta a la derecha y la fibra «inferior» es la derecha.
 *
 * Y lo que el curso no fija y aquí se decide (las ENTRADAS, no los esfuerzos):
 * las coordenadas globales van con X a la derecha e Y hacia ARRIBA, como se
 * dibujan los exámenes; una fuerza se da por sus componentes globales (una
 * carga de P hacia abajo es Fy = −P), y un par aplicado es positivo
 * ANTIHORARIO. `vigas.ts` traduce desde el convenio de `viga.ts` (P y q
 * positivas hacia abajo, par positivo el que tracciona la fibra inferior).
 *
 * Cómo se resuelve: por equilibrio puro, sin rigideces, que es lo que pide un
 * isostático. Las incógnitas son los esfuerzos que cada nudo `i` ejerce sobre
 * su barra (X, Y, M en ejes globales) y las reacciones; las ecuaciones, el
 * equilibrio de cada nudo y M = 0 en cada extremo de barra que llega a una
 * rótula. Si el sistema no tiene solución única, la estructura no es
 * isostática y se dice cuál de las dos cosas le pasa.
 */
import { resuelveLineal } from './lineal';

export interface Nudo {
  id: string;
  x: number;
  y: number;
}

/**
 * Un apoyo en un nudo. `movil` reacciona solo en la dirección `angulo`
 * (grados desde +X, antihorario), 90° por defecto: un carrito sobre suelo
 * horizontal. Un empotramiento `deslizante` deja correr el nudo en X (da
 * fuerza vertical y par, no horizontal): lo usa la viga conjugada del tema 10
 * (`conjugada.ts`), que con los dos bordes libres lleva dos empotramientos y
 * sin él tendría una reacción horizontal de más.
 */
export type Apoyo =
  | { tipo: 'empotramiento'; nudo: string; deslizante?: boolean }
  | { tipo: 'articulado'; nudo: string }
  | { tipo: 'movil'; nudo: string; angulo?: number };

/** Una barra recta del nudo `i` al nudo `j`: su x local va de `i` a `j`. */
export interface Barra {
  id: string;
  i: string;
  j: string;
}

/**
 * Las cargas. Fuerzas en componentes globales (Y hacia arriba), pares
 * antihorarios positivos, posiciones `s` medidas sobre la barra desde `i`.
 * Una repartida va por unidad de longitud de barra, lineal entre `q1` en `s1`
 * y `q2` en `s2`; `perpendicular` (por defecto) la aplica según la y local
 * —hacia abajo en una viga que va de izquierda a derecha—, y `vertical`,
 * hacia −Y.
 */
export type Carga =
  | { tipo: 'nudo'; nudo: string; Fx?: number; Fy?: number; M?: number }
  | { tipo: 'puntual'; barra: string; s: number; Fx?: number; Fy?: number }
  | {
      tipo: 'repartida';
      barra: string;
      s1: number;
      s2: number;
      q1: number;
      q2: number;
      direccion?: 'perpendicular' | 'vertical';
    }
  | { tipo: 'par'; barra: string; s: number; M: number };

export interface Estructura {
  nudos: Nudo[];
  barras: Barra[];
  apoyos: Apoyo[];
  /** Nudos donde todas las barras que llegan están articuladas (M = 0). */
  rotulas?: string[];
  cargas: Carga[];
}

export type Vec2 = readonly [number, number];

/** Geometría de una barra: extremos, longitud y ejes locales en globales. */
export interface Geometria {
  pi: Vec2;
  pj: Vec2;
  L: number;
  ex: Vec2;
  ey: Vec2;
}

/** Fuerza y momento (antihorario, respecto de un punto) de un conjunto de cargas. */
export interface Resultante {
  Fx: number;
  Fy: number;
  M: number;
}

/** Tolerancia de posición, relativa a la longitud de la barra. */
const EPS_S = 1e-9;

export function nudo(est: Estructura, id: string): Nudo {
  const n = est.nudos.find((m) => m.id === id);
  if (!n) throw new Error(`No existe el nudo «${id}».`);
  return n;
}

export function barra(est: Estructura, id: string): Barra {
  const b = est.barras.find((m) => m.id === id);
  if (!b) throw new Error(`No existe la barra «${id}».`);
  return b;
}

export function geometria(est: Estructura, b: Barra): Geometria {
  const ni = nudo(est, b.i);
  const nj = nudo(est, b.j);
  const dx = nj.x - ni.x;
  const dy = nj.y - ni.y;
  const L = Math.hypot(dx, dy);
  if (L === 0) throw new Error(`La barra «${b.id}» tiene longitud nula.`);
  const ex: Vec2 = [dx / L, dy / L];
  /* y local = x local girada 90° en sentido horario (tema 7, figura 7.5). */
  const ey: Vec2 = [ex[1], -ex[0]];
  return { pi: [ni.x, ni.y], pj: [nj.x, nj.y], L, ex, ey };
}

/** Producto vectorial plano (r × F)·k. */
export function cruz(r: Vec2, F: Vec2): number {
  return r[0] * F[1] - r[1] * F[0];
}

/** Resultante de una repartida lineal entre a y b: módulo y abscisa del centroide. */
export function trapecio(a: number, b: number, qa: number, qb: number): { R: number; sc: number } {
  const l = b - a;
  const R = ((qa + qb) / 2) * l;
  if (l === 0) return { R: 0, sc: a };
  const suma = qa + qb;
  /* Centroide del trapecio: a + l·(qa + 2qb) / (3(qa + qb)). Si qa + qb = 0
     (dos triángulos opuestos), la resultante es nula y el centroide da igual:
     lo que importa entonces es el par, y se calcula aparte. */
  const sc = suma === 0 ? a + l / 2 : a + (l * (qa + 2 * qb)) / (3 * suma);
  return { R, sc };
}

/**
 * Resultante, respecto del punto `P`, de las cargas de la barra que están en
 * [0, s]: con `lado = 'der'` entra una carga puntual o un par situados
 * exactamente en `s`; con `'izq'`, no.
 */
export function cargasHasta(
  est: Estructura,
  b: Barra,
  geo: Geometria,
  s: number,
  lado: 'izq' | 'der',
  P: Vec2,
): Resultante {
  const tol = EPS_S * geo.L;
  const dentro = (sp: number) => (lado === 'der' ? sp <= s + tol : sp < s - tol);
  const punto = (sp: number): Vec2 => [geo.pi[0] + sp * geo.ex[0], geo.pi[1] + sp * geo.ex[1]];
  let Fx = 0;
  let Fy = 0;
  let M = 0;
  const suma = (F: Vec2, en: Vec2) => {
    Fx += F[0];
    Fy += F[1];
    M += cruz([en[0] - P[0], en[1] - P[1]], F);
  };
  for (const c of est.cargas) {
    if (c.tipo === 'nudo' || c.barra !== b.id) continue;
    if (c.tipo === 'puntual') {
      if (dentro(c.s)) suma([c.Fx ?? 0, c.Fy ?? 0], punto(c.s));
    } else if (c.tipo === 'par') {
      if (dentro(c.s)) M += c.M;
    } else {
      const hasta = Math.min(c.s2, s);
      if (hasta <= c.s1) continue;
      const qEn = (x: number) => c.q1 + ((c.q2 - c.q1) * (x - c.s1)) / (c.s2 - c.s1);
      const qa = c.q1;
      const qb = qEn(hasta);
      const d: Vec2 = c.direccion === 'vertical' ? [0, -1] : geo.ey;
      /* El trapecio se parte en dos triángulos para que el momento sea exacto
         también cuando qa + qb = 0 y la resultante se anula. */
      const t1 = trapecio(c.s1, hasta, qa, 0);
      const t2 = trapecio(c.s1, hasta, 0, qb);
      suma([t1.R * d[0], t1.R * d[1]], punto(t1.sc));
      suma([t2.R * d[0], t2.R * d[1]], punto(t2.sc));
    }
  }
  return { Fx, Fy, M };
}

/** Las componentes de reacción que aporta cada apoyo, en orden. */
function componentes(a: Apoyo): { fx: number; fy: number; m: number }[] {
  if (a.tipo === 'empotramiento') {
    if (a.deslizante) {
      return [
        { fx: 0, fy: 1, m: 0 },
        { fx: 0, fy: 0, m: 1 },
      ];
    }
    return [
      { fx: 1, fy: 0, m: 0 },
      { fx: 0, fy: 1, m: 0 },
      { fx: 0, fy: 0, m: 1 },
    ];
  }
  if (a.tipo === 'articulado') {
    return [
      { fx: 1, fy: 0, m: 0 },
      { fx: 0, fy: 1, m: 0 },
    ];
  }
  const ang = ((a.angulo ?? 90) * Math.PI) / 180;
  return [{ fx: Math.cos(ang), fy: Math.sin(ang), m: 0 }];
}

export interface Reaccion {
  apoyo: Apoyo;
  Rx: number;
  Ry: number;
  /** Momento de empotramiento, antihorario positivo. */
  M: number;
}

export interface Solucion {
  est: Estructura;
  /** Lo que el nudo `i` ejerce sobre cada barra en su extremo `i` (globales). */
  extremoI: Map<string, Resultante>;
  reacciones: Reaccion[];
}

export interface Clasificacion {
  tipo: 'isostatica' | 'hiperestatica' | 'mecanismo';
  /** Grado de hiperestatismo, o número de ecuaciones que sobran si es mecanismo. */
  grado: number;
}

interface Sistema {
  A: number[][];
  b: number[];
  nInc: number;
  colApoyo: number[];
}

/** Monta el sistema de equilibrio. Una fila por ecuación verdadera. */
function monta(est: Estructura): Sistema {
  const rot = new Set(est.rotulas ?? []);
  const colApoyo: number[] = [];
  let nInc = 3 * est.barras.length;
  for (const a of est.apoyos) {
    colApoyo.push(nInc);
    nInc += componentes(a).length;
  }
  const A: number[][] = [];
  const b: number[] = [];
  const geos = new Map(est.barras.map((br) => [br.id, geometria(est, br)]));
  for (const n of est.nudos) {
    const fx = new Array<number>(nInc).fill(0);
    const fy = new Array<number>(nInc).fill(0);
    const m = new Array<number>(nInc).fill(0);
    let bx = 0;
    let by = 0;
    let bm = 0;
    est.barras.forEach((br, k) => {
      const geo = geos.get(br.id) as Geometria;
      if (br.i === n.id) {
        fx[3 * k] -= 1;
        fy[3 * k + 1] -= 1;
        m[3 * k + 2] -= 1;
      }
      if (br.j === n.id) {
        /* Lo que la barra ejerce sobre el nudo j: la fuerza del extremo i más
           todas las cargas de la barra, con su momento respecto de j. */
        const dxij = geo.pi[0] - geo.pj[0];
        const dyij = geo.pi[1] - geo.pj[1];
        const L = cargasHasta(est, br, geo, geo.L, 'der', geo.pj);
        fx[3 * k] += 1;
        fy[3 * k + 1] += 1;
        m[3 * k] += -dyij;
        m[3 * k + 1] += dxij;
        m[3 * k + 2] += 1;
        bx -= L.Fx;
        by -= L.Fy;
        bm -= L.M;
      }
    });
    est.apoyos.forEach((a, ia) => {
      if (a.nudo !== n.id) return;
      componentes(a).forEach((c, ic) => {
        const col = colApoyo[ia] + ic;
        fx[col] += c.fx;
        fy[col] += c.fy;
        m[col] += c.m;
      });
    });
    for (const c of est.cargas) {
      if (c.tipo !== 'nudo' || c.nudo !== n.id) continue;
      if (rot.has(n.id) && (c.M ?? 0) !== 0) {
        throw new Error(`Un par aplicado justo en la rótula «${n.id}» no dice a qué lado actúa.`);
      }
      bx -= c.Fx ?? 0;
      by -= c.Fy ?? 0;
      bm -= c.M ?? 0;
    }
    A.push(fx, fy);
    b.push(bx, by);
    /* En una rótula la ecuación de momentos del nudo es 0 = 0: no se escribe,
       y en su lugar entran las de M = 0 en cada extremo de barra. */
    if (!rot.has(n.id)) {
      A.push(m);
      b.push(bm);
    }
  }
  est.barras.forEach((br, k) => {
    const geo = geos.get(br.id) as Geometria;
    if (rot.has(br.i)) {
      const fila = new Array<number>(nInc).fill(0);
      fila[3 * k + 2] = 1;
      A.push(fila);
      b.push(0);
    }
    if (rot.has(br.j)) {
      const dxij = geo.pi[0] - geo.pj[0];
      const dyij = geo.pi[1] - geo.pj[1];
      const L = cargasHasta(est, br, geo, geo.L, 'der', geo.pj);
      const fila = new Array<number>(nInc).fill(0);
      fila[3 * k] = -dyij;
      fila[3 * k + 1] = dxij;
      fila[3 * k + 2] = 1;
      A.push(fila);
      b.push(-L.M);
    }
  });
  return { A, b, nInc, colApoyo };
}

/** Isostática, hiperestática (y de qué grado) o mecanismo. */
export function clasifica(est: Estructura): Clasificacion {
  const { A, b, nInc } = monta(est);
  const { rango } = resuelveLineal(A, b);
  if (rango < nInc) return { tipo: 'hiperestatica', grado: nInc - rango };
  if (rango < A.length) return { tipo: 'mecanismo', grado: A.length - rango };
  return { tipo: 'isostatica', grado: 0 };
}

/** Resuelve una estructura isostática. Si no lo es, lanza un error que lo dice. */
export function resuelve(est: Estructura): Solucion {
  const { A, b, nInc, colApoyo } = monta(est);
  const sol = resuelveLineal(A, b);
  if (sol.rango < nInc) {
    throw new Error(`La estructura es hiperestática de grado ${nInc - sol.rango}: el equilibrio no basta.`);
  }
  const bmax = b.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
  if (sol.rango < A.length || sol.residuo > 1e-9 * Math.max(bmax, 1e-300)) {
    throw new Error('La estructura es un mecanismo: le faltan enlaces para estar en equilibrio.');
  }
  const extremoI = new Map<string, Resultante>();
  est.barras.forEach((br, k) => {
    extremoI.set(br.id, { Fx: sol.x[3 * k], Fy: sol.x[3 * k + 1], M: sol.x[3 * k + 2] });
  });
  const reacciones = est.apoyos.map((a, ia) => {
    let Rx = 0;
    let Ry = 0;
    let M = 0;
    componentes(a).forEach((c, ic) => {
      const v = sol.x[colApoyo[ia] + ic];
      Rx += c.fx * v;
      Ry += c.fy * v;
      M += c.m * v;
    });
    return { apoyo: a, Rx, Ry, M };
  });
  return { est, extremoI, reacciones };
}
