/**
 * Tema 8 de ERM: sistemas de barras articuladas unidas a sólidos rígidos o a
 * nudos, isostáticos e hiperestáticos, con temperatura, errores de
 * fabricación, resortes y holguras que se cierran.
 *
 * Para quién: el alumno del parcial 1. Cuándo: el ejercicio de «la viga ABC
 * es rígida… se sustenta por las barras…», que cae en los parciales de 2015,
 * 2016, 2017, 2018, 2019, 2020 y 2022, y las estructuras articuladas de 2012,
 * 2013 y 2014. Qué gana: fuerzas, giros y desplazamientos de cualquier punto
 * sin plantear a mano el equilibrio y la compatibilidad, para comprobar los
 * que sí plantea. Cómo se comprueba: `tests/fisica/erm/barras.test.ts` (una
 * isostática cuyas fuerzas no dependen de EA, una celosía con su fórmula
 * cerrada, un caso térmico y uno con holgura resueltos a mano) y el ejercicio
 * 3 del parcial del 16-11-2018 en `aceptacion.test.ts`.
 *
 * Convenio (apuntes del tema 8, pp. 5-8): N > 0 es tracción; el alargamiento
 * de una barra es ΔL = NL/EA + ε0·L (ec. 8.9), con ε0 = αΔT + h/L, h lo que la
 * barra mide de más (ec. 8.3); y con desplazamientos pequeños ΔL es la
 * proyección sobre la barra de la diferencia de desplazamientos de sus
 * extremos (ecs. 8.10-8.12, «el arco se sustituye por la tangente»).
 * Coordenadas globales con X a la derecha e Y hacia arriba; giros y momentos
 * antihorarios positivos.
 *
 * Cómo se resuelve: por desplazamientos. Un sólido rígido tiene tres grados
 * de libertad (u, v y el giro θ de su punto de referencia) y un nudo, dos.
 * Cada barra aporta su rigidez EA/L; cada enlace, una ecuación de ligadura
 * con su multiplicador, que es la reacción. Un sistema isostático sale igual
 * que uno hiperestático: equilibrio y compatibilidad a la vez.
 */
import { resuelveLineal } from './lineal';

export interface Solido {
  id: string;
  /** `rigido`: u, v y giro; `nudo`: u y v (una articulación de barras). */
  tipo: 'rigido' | 'nudo';
  /** Punto de referencia: el giro y los desplazamientos se dan en él. */
  x: number;
  y: number;
}

/** Un punto de un sólido, o de la bancada si no se dice el sólido. */
export interface Punto {
  solido?: string;
  x: number;
  y: number;
}

export interface BarraElastica {
  id: string;
  a: Punto;
  b: Punto;
  /** Rigidez axial: EA (con L geométrica, o la dada) o directamente k (un resorte). */
  EA?: number;
  k?: number;
  L?: number;
  /** Para la tensión σ = N/A. */
  A?: number;
  alfa?: number;
  dT?: number;
  /** La barra mide h más que la distancia entre sus extremos (h < 0: más corta). */
  h?: number;
}

export type Enlace =
  | { id?: string; tipo: 'articulacion'; solido: string; x: number; y: number }
  | { id?: string; tipo: 'deslizadera'; solido: string; x: number; y: number; angulo: number }
  | { id?: string; tipo: 'giro'; solido: string }
  /** El punto puede avanzar en la dirección `angulo` (grados) hasta `holgura`; ahí toca y no pasa. */
  | { id?: string; tipo: 'contacto'; solido: string; x: number; y: number; angulo: number; holgura: number };

export interface CargaSolido {
  solido: string;
  x?: number;
  y?: number;
  Fx?: number;
  Fy?: number;
  M?: number;
}

export interface SistemaBarras {
  solidos: Solido[];
  barras: BarraElastica[];
  enlaces: Enlace[];
  cargas: CargaSolido[];
}

export interface EstadoBarra {
  N: number;
  /** Alargamiento total ΔL (elástico + inicial). */
  alargamiento: number;
  sigma?: number;
}

export interface ReaccionEnlace {
  enlace: Enlace;
  /** Fuerza (y momento, para `giro`) que la bancada ejerce sobre el sólido. */
  Fx: number;
  Fy: number;
  M: number;
}

export interface ResultadoBarras {
  /** u, v del punto de referencia y giro θ (0 en un nudo). */
  desplazamientos: Map<string, { u: number; v: number; theta: number }>;
  barras: Map<string, EstadoBarra>;
  reacciones: ReaccionEnlace[];
  /** Contactos cerrados, por índice de enlace. */
  contactosCerrados: number[];
  desplazamientoDe: (p: Punto) => [number, number];
}

interface Indices {
  base: Map<string, number>;
  n: number;
}

function indices(s: SistemaBarras): Indices {
  const base = new Map<string, number>();
  let n = 0;
  for (const so of s.solidos) {
    base.set(so.id, n);
    n += so.tipo === 'rigido' ? 3 : 2;
  }
  return { base, n };
}

function solido(s: SistemaBarras, id: string): Solido {
  const so = s.solidos.find((x) => x.id === id);
  if (!so) throw new Error(`No existe el sólido «${id}».`);
  return so;
}

/** Filas que dan (u, v) de un punto en función de los grados de libertad. */
function filasPunto(s: SistemaBarras, idx: Indices, p: Punto): [number[], number[]] {
  const fu = new Array<number>(idx.n).fill(0);
  const fv = new Array<number>(idx.n).fill(0);
  if (!p.solido) return [fu, fv];
  const so = solido(s, p.solido);
  const k = idx.base.get(so.id) as number;
  fu[k] = 1;
  fv[k + 1] = 1;
  if (so.tipo === 'rigido') {
    /* u_P = u_O − θ·(y_P − y_O), v_P = v_O + θ·(x_P − x_O): θ × OP. */
    fu[k + 2] = -(p.y - so.y);
    fv[k + 2] = p.x - so.x;
  } else if (Math.hypot(p.x - so.x, p.y - so.y) > 1e-9 * (1 + Math.hypot(so.x, so.y))) {
    throw new Error(`El punto (${p.x}, ${p.y}) no es el nudo «${so.id}».`);
  }
  return [fu, fv];
}

const punto = (fila: number[], q: number[]) => fila.reduce((acc, v, i) => acc + v * q[i], 0);

interface Geo {
  g: number[];
  k: number;
  d0: number;
}

/** Fila g con ΔL = g·q, rigidez k y alargamiento inicial d0 de una barra. */
function geoBarra(s: SistemaBarras, idx: Indices, b: BarraElastica): Geo {
  const dx = b.b.x - b.a.x;
  const dy = b.b.y - b.a.y;
  const Lgeo = Math.hypot(dx, dy);
  if (Lgeo === 0) throw new Error(`La barra «${b.id}» tiene longitud nula.`);
  const e = [dx / Lgeo, dy / Lgeo];
  const [au, av] = filasPunto(s, idx, b.a);
  const [bu, bv] = filasPunto(s, idx, b.b);
  const g = au.map((_, i) => e[0] * (bu[i] - au[i]) + e[1] * (bv[i] - av[i]));
  const L = b.L ?? Lgeo;
  const k = b.k ?? (b.EA as number) / L;
  if (!Number.isFinite(k)) throw new Error(`La barra «${b.id}» necesita EA o k.`);
  const d0 = (b.alfa ?? 0) * (b.dT ?? 0) * L + (b.h ?? 0);
  return { g, k, d0 };
}

interface Ligadura {
  fila: number[];
  valor: number;
  enlace: number;
  /** Dirección de la fuerza de reacción asociada (x, y, momento). */
  dir: [number, number, number];
}

function ligaduras(s: SistemaBarras, idx: Indices, cerrados: Set<number>): Ligadura[] {
  const out: Ligadura[] = [];
  s.enlaces.forEach((en, ie) => {
    if (en.tipo === 'giro') {
      const so = solido(s, en.solido);
      if (so.tipo !== 'rigido') throw new Error('Un nudo no tiene giro que impedir.');
      const fila = new Array<number>(idx.n).fill(0);
      fila[(idx.base.get(so.id) as number) + 2] = 1;
      out.push({ fila, valor: 0, enlace: ie, dir: [0, 0, 1] });
      return;
    }
    const [fu, fv] = filasPunto(s, idx, { solido: en.solido, x: en.x, y: en.y });
    if (en.tipo === 'articulacion') {
      out.push({ fila: fu, valor: 0, enlace: ie, dir: [1, 0, 0] });
      out.push({ fila: fv, valor: 0, enlace: ie, dir: [0, 1, 0] });
      return;
    }
    if (en.tipo === 'contacto' && !cerrados.has(ie)) return;
    const a = (en.angulo * Math.PI) / 180;
    const d: [number, number] = [Math.cos(a), Math.sin(a)];
    const fila = fu.map((v, i) => d[0] * v + d[1] * fv[i]);
    out.push({ fila, valor: en.tipo === 'contacto' ? en.holgura : 0, enlace: ie, dir: [d[0], d[1], 0] });
  });
  return out;
}

interface Paso {
  q: number[];
  lambdas: number[];
  lig: Ligadura[];
}

function paso(s: SistemaBarras, idx: Indices, geos: Geo[], cerrados: Set<number>): Paso {
  const n = idx.n;
  const lig = ligaduras(s, idx, cerrados);
  const m = n + lig.length;
  const A = Array.from({ length: m }, () => new Array<number>(m).fill(0));
  const rhs = new Array<number>(m).fill(0);
  for (const { g, k, d0 } of geos) {
    for (let i = 0; i < n; i++) {
      if (g[i] === 0) continue;
      rhs[i] += k * d0 * g[i];
      for (let j = 0; j < n; j++) A[i][j] += k * g[i] * g[j];
    }
  }
  for (const c of s.cargas) {
    const so = solido(s, c.solido);
    const [fu, fv] = filasPunto(s, idx, { solido: so.id, x: c.x ?? so.x, y: c.y ?? so.y });
    for (let i = 0; i < n; i++) rhs[i] += fu[i] * (c.Fx ?? 0) + fv[i] * (c.Fy ?? 0);
    if (c.M) {
      if (so.tipo !== 'rigido') throw new Error('Un par necesita un sólido rígido.');
      rhs[(idx.base.get(so.id) as number) + 2] += c.M;
    }
  }
  /* Las ligaduras se escalan con la rigidez para que su pivote no se confunda
     con un cero frente a un EA/L grande (la misma trampa que en axial.ts). */
  let esc = 0;
  for (let i = 0; i < n; i++) esc = Math.max(esc, Math.abs(A[i][i]));
  esc = esc || 1;
  lig.forEach((l, k) => {
    for (let i = 0; i < n; i++) {
      A[i][n + k] = esc * l.fila[i];
      A[n + k][i] = esc * l.fila[i];
    }
    rhs[n + k] = esc * l.valor;
  });
  const sol = resuelveLineal(A, rhs);
  if (sol.rango < m) throw new Error('El sistema es un mecanismo: algún sólido puede moverse sin deformar ninguna barra.');
  return { q: sol.x.slice(0, n), lambdas: sol.x.slice(n).map((v) => esc * v), lig };
}

/**
 * Resuelve el sistema. Los contactos empiezan abiertos; se cierra el que el
 * desplazamiento atraviesa y se abre el que tira en vez de empujar, hasta que
 * nada cambia.
 */
export function resuelveBarras(s: SistemaBarras, maxIter = 50): ResultadoBarras {
  const idx = indices(s);
  const geos = s.barras.map((b) => geoBarra(s, idx, b));
  const cerrados = new Set<number>();
  let p = paso(s, idx, geos, cerrados);
  let asentado = false;
  for (let it = 0; it < maxIter; it++) {
    let cambia = false;
    s.enlaces.forEach((en, ie) => {
      if (en.tipo !== 'contacto') return;
      const a = (en.angulo * Math.PI) / 180;
      const [fu, fv] = filasPunto(s, idx, { solido: en.solido, x: en.x, y: en.y });
      const avance = Math.cos(a) * punto(fu, p.q) + Math.sin(a) * punto(fv, p.q);
      const escala = Math.max(Math.abs(en.holgura), 1e-12);
      if (!cerrados.has(ie) && avance > en.holgura + 1e-9 * escala) {
        cerrados.add(ie);
        cambia = true;
      } else if (cerrados.has(ie)) {
        const k = p.lig.findIndex((l) => l.enlace === ie);
        /* Reacción = −λ en la dirección de avance: si sale positiva, la pared tira. */
        if (-p.lambdas[k] > 0) {
          cerrados.delete(ie);
          cambia = true;
        }
      }
    });
    if (!cambia) {
      asentado = true;
      break;
    }
    p = paso(s, idx, geos, cerrados);
  }
  if (!asentado && s.enlaces.some((en) => en.tipo === 'contacto')) {
    throw new Error(`Los contactos siguen cambiando tras ${maxIter} iteraciones: no se sabe cuáles tocan.`);
  }
  const { q, lambdas, lig } = p;
  const desplazamientos = new Map<string, { u: number; v: number; theta: number }>();
  for (const so of s.solidos) {
    const k = idx.base.get(so.id) as number;
    desplazamientos.set(so.id, { u: q[k], v: q[k + 1], theta: so.tipo === 'rigido' ? q[k + 2] : 0 });
  }
  const barras = new Map<string, EstadoBarra>();
  s.barras.forEach((b, i) => {
    const { g, k, d0 } = geos[i];
    const alargamientoTotal = punto(g, q);
    const N = k * (alargamientoTotal - d0);
    barras.set(b.id, { N, alargamiento: alargamientoTotal, sigma: b.A ? N / b.A : undefined });
  });
  const reacciones: ReaccionEnlace[] = s.enlaces.map((enlace, ie) => {
    let Fx = 0;
    let Fy = 0;
    let M = 0;
    lig.forEach((l, k) => {
      if (l.enlace !== ie) return;
      Fx -= lambdas[k] * l.dir[0];
      Fy -= lambdas[k] * l.dir[1];
      M -= lambdas[k] * l.dir[2];
    });
    return { enlace, Fx, Fy, M };
  });
  const desplazamientoDe = (pt: Punto): [number, number] => {
    const [fu, fv] = filasPunto(s, idx, pt);
    return [punto(fu, q), punto(fv, q)];
  };
  return { desplazamientos, barras, reacciones, contactosCerrados: [...cerrados].sort(), desplazamientoDe };
}
