/**
 * Tema 12 de ERM: torsión. Sección circular maciza y hueca, rectangular (con
 * la tabla de α y β de los apuntes), abierta y cerrada de pequeño espesor
 * (Bredt), centro de torsión de la U, flexión-torsión de ejes circulares y
 * el eje recto con tramos de distinta rigidez, uno o varios empotramientos y
 * pares concentrados o repartidos (el hiperestático de torsión).
 *
 * Para quién: para el alumno de la 2.ª parte y la final; el «eje biempotrado»
 * (macizo en 2016-2017, tubular en 2013-2014) es el problema de torsión de los
 * exámenes leídos, y «secciones cerradas de pequeño espesor» la cuestión que
 * más se repite (`fase-p/p0/examenes.json`). Qué gana: el reparto del par
 * entre los dos empotramientos, los diagramas de Mt y de giro y la tensión
 * máxima de cada tramo, sin el error de signo de la compatibilidad. Cómo se
 * comprueba: `tests/fisica/erm/torsion.test.ts` (la tabla α, β contra la serie
 * de Saint-Venant; Bredt contra el tubo circular; el eje contra las fórmulas
 * cerradas a mano y contra el reparto por rigideces).
 *
 * EL CONVENIO ES EL DEL CURSO (tema 12, pp. 4-17):
 *
 *   · x es el eje de la pieza; un par es positivo si gira en sentido
 *     antihorario mirando desde +x (regla de la mano derecha sobre +x). El
 *     momento torsor Mt de una sección es la componente x de la resultante
 *     M_G = Mt·i + My·j − Mz·k del tema 7: el par que la parte de la derecha
 *     ejerce sobre la de la izquierda, igual a la suma de los pares exteriores
 *     (reacciones incluidas) a la derecha de la sección.
 *   · Circular: τ = Mt·r/Ip (ec. 12.10, p. 7), Ip = πD⁴/32 o π(D⁴ − d⁴)/32,
 *     τmax = 16Mt/πD³ (12.11) y 16Mt/(πD³(1 − d⁴/D⁴)) (12.12, p. 7).
 *   · Giro: φB − φA = ∫Mt/(G·It) dx (ec. 12.13, p. 8), con It = Ip en la
 *     circular. φ positivo en el sentido de Mt.
 *   · Rectangular (p. 10): h ≥ b, τmax = Mt/(α·h·b²) en la mitad del lado
 *     mayor e It = β·h·b³, con la tabla de la p. 10. OJO: la ec. 12.15 de la
 *     TEORÍA imprime α·b·h²; las diapositivas (12, «módulo resistente a
 *     torsión equivalente») y la tabla (α → 1/3 cuando h/b → ∞, que es la
 *     sección delgada de la p. 10) dicen α·h·b²: se sigue esa.
 *   · Abierta de pequeño espesor (pp. 10-11): α = β = 1/3, It = ⅓·Σti³·si y
 *     τmax = Mt·tmax/It (ecs. 12.17-12.20). OJO: las ecs. 12.19-12.20 de la
 *     TEORÍA imprimen It = Σti³·si sin el ⅓, que el texto de la misma página
 *     («α = β = 1/3») y la diapositiva 14 sí ponen: se pone el ⅓.
 *   · Cerrada de pequeño espesor (Bredt, pp. 11-14): flujo q = τ·t = Mt/(2At)
 *     uniforme, τ = Mt/(2·At·t) (12.24), máxima donde t es mínimo, e
 *     It = 4At²/∮ds/t (12.29); At es el área encerrada por la línea media.
 *   · Centro de torsión de la U (fig. 12.11 y ec. 12.33, p. 15):
 *     OC = b0²·h0²·t1/(4·Iz), con C en la línea media del alma, b0 el vuelo de
 *     las alas hasta esa línea, h0 la distancia entre las líneas medias de las
 *     alas y O al otro lado del alma que las alas.
 *   · Flexión-torsión de un eje circular (pp. 16-17): σ = 32M/πD³,
 *     τ = 16Mt/πD³ (12.34), τmax = (16/πD³)·√(M² + Mt²) (12.35, Tresca) y
 *     D = ∛(16·√(M² + Mt²)/(π·τadm)) (12.36).
 *
 * Los coeficientes entre dos columnas de la tabla se interpolan linealmente
 * en h/b, y por encima de h/b = 10 linealmente en b/h hasta 0,333 en h/b = ∞:
 * la interpolación es nuestra, la tabla no dice cómo.
 */
import { integra } from './elastica';
import { resuelveLineal } from './lineal';

/* ─── Sección circular ─── */

/** Momento de inercia polar de la sección circular, maciza (d = 0) o hueca. */
export function inerciaPolar(D: number, d = 0): number {
  if (!(D > 0) || !(d >= 0) || !(d < D)) throw new Error('Hace falta D > 0 y 0 ≤ d < D.');
  return (Math.PI * (D ** 4 - d ** 4)) / 32;
}

export interface TorsionCircular {
  Ip: number;
  /** Módulo resistente a torsión, Ip/(D/2): τmax = Mt/Wt. */
  Wt: number;
  /** τ en el borde exterior (la máxima) y en el interior (0 en la maciza). */
  tauMax: number;
  tauMin: number;
  /** τ a la distancia r del centro (ec. 12.10). */
  tau: (r: number) => number;
}

export function torsionCircular(Mt: number, D: number, d = 0): TorsionCircular {
  const Ip = inerciaPolar(D, d);
  const tau = (r: number) => {
    if (r < d / 2 - 1e-12 * D || r > D / 2 + 1e-12 * D) throw new Error(`r = ${r} está fuera de la sección.`);
    return (Mt * r) / Ip;
  };
  return { Ip, Wt: Ip / (D / 2), tauMax: (Mt * D) / 2 / Ip, tauMin: (Mt * d) / 2 / Ip, tau };
}

/* ─── Sección rectangular: la tabla de la p. 10 ─── */

/** La tabla de la p. 10 del tema 12, tal cual (h ≥ b). */
export const TABLA_RECTANGULAR = {
  pagina: 10,
  hb: [1, 1.5, 1.75, 2, 2.5, 3, 4, 6, 8, 10, Infinity],
  alfa: [0.208, 0.231, 0.239, 0.246, 0.258, 0.267, 0.282, 0.299, 0.307, 0.313, 0.333],
  beta: [0.141, 0.196, 0.214, 0.229, 0.249, 0.263, 0.281, 0.299, 0.307, 0.313, 0.333],
} as const;

export interface CoeficientesRectangular {
  /** h/b con h el lado mayor. */
  hb: number;
  alfa: number;
  beta: number;
  /** true si h/b es una columna de la tabla; false si se ha interpolado. */
  deTabla: boolean;
}

/** α y β de un rectángulo de lados h y b (en cualquier orden). */
export function coeficientesRectangular(lado1: number, lado2: number): CoeficientesRectangular {
  if (!(lado1 > 0) || !(lado2 > 0)) throw new Error('Los lados del rectángulo tienen que ser positivos.');
  const hb = Math.max(lado1, lado2) / Math.min(lado1, lado2);
  const { hb: xs, alfa, beta } = TABLA_RECTANGULAR;
  const k = xs.findIndex((x) => Math.abs(x - hb) < 1e-9 * hb);
  if (k >= 0) return { hb, alfa: alfa[k], beta: beta[k], deTabla: true };
  const n = xs.length;
  if (hb > xs[n - 2]) {
    /* entre h/b = 10 e ∞, lineal en b/h (de 0,1 a 0) */
    const s = 1 / hb / (1 / xs[n - 2]);
    const entre = (c: readonly number[]) => c[n - 1] + (c[n - 2] - c[n - 1]) * s;
    return { hb, alfa: entre(alfa), beta: entre(beta), deTabla: false };
  }
  const j = xs.findIndex((x) => x > hb);
  const s = (hb - xs[j - 1]) / (xs[j] - xs[j - 1]);
  const entre = (c: readonly number[]) => c[j - 1] + (c[j] - c[j - 1]) * s;
  return { hb, alfa: entre(alfa), beta: entre(beta), deTabla: false };
}

export interface TorsionRectangular extends CoeficientesRectangular {
  h: number;
  b: number;
  /** Módulo resistente a torsión α·h·b² (τmax = Mt/Wt) e inercia equivalente β·h·b³. */
  Wt: number;
  It: number;
  tauMax: number;
}

export function torsionRectangular(Mt: number, lado1: number, lado2: number): TorsionRectangular {
  const c = coeficientesRectangular(lado1, lado2);
  const h = Math.max(lado1, lado2);
  const b = Math.min(lado1, lado2);
  const Wt = c.alfa * h * b * b;
  return { ...c, h, b, Wt, It: c.beta * h * b ** 3, tauMax: Mt / Wt };
}

/* ─── Pequeño espesor ─── */

/** Un trozo recto de la línea media: su longitud s y su espesor t. */
export interface TrozoDelgado {
  s: number;
  t: number;
}

function compruebaTrozos(trozos: readonly TrozoDelgado[]): void {
  if (trozos.length === 0) throw new Error('Hace falta al menos un trozo.');
  for (const p of trozos) if (!(p.s > 0) || !(p.t > 0)) throw new Error('Cada trozo necesita s > 0 y t > 0.');
}

export interface TorsionAbierta {
  It: number;
  tMax: number;
  /** Módulo resistente It/tmax y la τ máxima, en el trozo más grueso. */
  Wt: number;
  tauMax: number;
  /** τ máxima en un trozo de espesor t (ec. 12.17 con t en vez de tmax). */
  tau: (t: number) => number;
}

/** Sección abierta de pequeño espesor (ecs. 12.17-12.20 con el ⅓). */
export function torsionAbierta(Mt: number, trozos: readonly TrozoDelgado[]): TorsionAbierta {
  compruebaTrozos(trozos);
  const It = trozos.reduce((s, p) => s + p.t ** 3 * p.s, 0) / 3;
  const tMax = Math.max(...trozos.map((p) => p.t));
  return { It, tMax, Wt: It / tMax, tauMax: (Mt * tMax) / It, tau: (t) => (Mt * t) / It };
}

export interface TorsionCerrada {
  /** Flujo cortante q = τ·t, uniforme (ec. 12.21). */
  q: number;
  It: number;
  tMin: number;
  /** Módulo resistente 2·At·tmin y la τ máxima, en el trozo más delgado. */
  Wt: number;
  tauMax: number;
  tau: (t: number) => number;
}

/** Sección cerrada de pequeño espesor, una celda (Bredt, ecs. 12.24 y 12.29). */
export function torsionCerrada(Mt: number, At: number, trozos: readonly TrozoDelgado[]): TorsionCerrada {
  compruebaTrozos(trozos);
  if (!(At > 0)) throw new Error('El área encerrada At tiene que ser positiva.');
  const q = Mt / (2 * At);
  const It = (4 * At * At) / trozos.reduce((s, p) => s + p.s / p.t, 0);
  const tMin = Math.min(...trozos.map((p) => p.t));
  return { q, It, tMin, Wt: 2 * At * tMin, tauMax: q / tMin, tau: (t) => q / t };
}

/** Distancia OC del centro de torsión de la U a la línea media del alma (ec. 12.33). */
export function centroTorsionU(b0: number, h0: number, t1: number, Iz: number): number {
  if (!(b0 > 0) || !(h0 > 0) || !(t1 > 0) || !(Iz > 0)) throw new Error('Hace falta b0, h0, t1 e Iz positivos.');
  return (b0 * b0 * h0 * h0 * t1) / (4 * Iz);
}

/* ─── Flexión-torsión de ejes circulares (pp. 16-17) ─── */

export interface FlexionTorsion {
  sigma: number;
  tau: number;
  /** Radio del círculo de Mohr del punto A (ec. 12.35). */
  tauMax: number;
}

export function flexionTorsion(M: number, Mt: number, D: number): FlexionTorsion {
  if (!(D > 0)) throw new Error('El diámetro tiene que ser positivo.');
  const c = 16 / (Math.PI * D ** 3);
  return { sigma: 2 * c * M, tau: c * Mt, tauMax: c * Math.hypot(M, Mt) };
}

/** Diámetro con el que τmax = τadm (ec. 12.36). */
export function diametroFlexionTorsion(M: number, Mt: number, tauAdm: number): number {
  if (!(tauAdm > 0)) throw new Error('La tensión admisible tiene que ser positiva.');
  return Math.cbrt((16 * Math.hypot(M, Mt)) / (Math.PI * tauAdm));
}

/* ─── El eje: Mt(x) y φ(x) con empotramientos ─── */

/** Un tramo de rigidez G·It uniforme, con su módulo resistente si se quiere τ. */
export interface TramoTorsion {
  x0: number;
  x1: number;
  GIt: number;
  Wt?: number;
}

/** Un par concentrado T en x, o uno repartido de m1 a m2 por unidad de longitud entre x1 y x2. */
export type CargaTorsion = { tipo: 'par'; x: number; T: number } | { tipo: 'repartido'; x1: number; x2: number; m1: number; m2?: number };

/** Un empotramiento a torsión en x, con su giro impuesto (0 si no se dice). */
export interface EmpotramientoTorsion {
  x: number;
  giro?: number;
}

export interface Eje {
  L: number;
  tramos: readonly TramoTorsion[];
  empotramientos: readonly EmpotramientoTorsion[];
  cargas: readonly CargaTorsion[];
}

export interface EjeResuelto {
  /** Par de reacción de cada empotramiento (positivo como los pares). */
  R: number[];
  /** Giro de la sección x = 0. */
  phi0: number;
  Mt: (x: number, lado?: 'izq' | 'der') => number;
  phi: (x: number) => number;
  /** |Mt|/Wt del tramo de x (hace falta su Wt). */
  tauMax: (x: number, lado?: 'izq' | 'der') => number;
}

/** Un eje circular por tramos de diámetro D (y d si es hueco): GIt = G·Ip y Wt = Ip/(D/2). */
export function tramosCirculares(G: number, tramos: readonly { x0: number; x1: number; D: number; d?: number }[]): TramoTorsion[] {
  return tramos.map((t) => {
    const Ip = inerciaPolar(t.D, t.d ?? 0);
    return { x0: t.x0, x1: t.x1, GIt: G * Ip, Wt: Ip / (t.D / 2) };
  });
}

/** Suma de los pares exteriores a la izquierda de x (con lo que hay en x si `lado` es 'der'). */
function paresIzquierda(cargas: readonly CargaTorsion[], x: number, lado: 'izq' | 'der'): number {
  let s = 0;
  for (const c of cargas) {
    if (c.tipo === 'par') {
      if (c.x < x || (lado === 'der' && c.x === x)) s += c.T;
      continue;
    }
    const b = Math.min(x, c.x2);
    if (b <= c.x1) continue;
    const m2 = c.m2 ?? c.m1;
    const mEn = (u: number) => c.m1 + ((m2 - c.m1) * (u - c.x1)) / (c.x2 - c.x1);
    s += ((c.m1 + mEn(b)) / 2) * (b - c.x1);
  }
  return s;
}

function compruebaEje(eje: Eje): void {
  const tol = 1e-9 * eje.L;
  if (!(eje.L > 0)) throw new Error('La longitud del eje tiene que ser positiva.');
  const ts = [...eje.tramos].sort((a, b) => a.x0 - b.x0);
  if (ts.length === 0 || Math.abs(ts[0].x0) > tol || Math.abs(ts[ts.length - 1].x1 - eje.L) > tol) {
    throw new Error('Los tramos tienen que cubrir el eje de 0 a L.');
  }
  ts.forEach((t, k) => {
    if (!(t.GIt > 0) || !(t.x1 > t.x0)) throw new Error('Cada tramo necesita x1 > x0 y GIt > 0.');
    if (k > 0 && Math.abs(t.x0 - ts[k - 1].x1) > tol) throw new Error('Los tramos tienen que ser contiguos.');
  });
  const dentro = (x: number) => x >= -tol && x <= eje.L + tol;
  for (const e of eje.empotramientos) if (!dentro(e.x)) throw new Error(`El empotramiento en ${e.x} está fuera del eje.`);
  for (const c of eje.cargas) {
    const ok = c.tipo === 'par' ? dentro(c.x) : dentro(c.x1) && dentro(c.x2) && c.x2 > c.x1;
    if (!ok) throw new Error('Hay una carga fuera del eje o un par repartido con x2 ≤ x1.');
  }
}

/**
 * Resuelve el eje. Incógnitas: el par de cada empotramiento y el giro φ0 de
 * x = 0; ecuaciones: el equilibrio (suma de pares nula) y el giro de cada
 * empotramiento (ec. 12.13 integrada desde 0). Con un empotramiento es
 * isostático; con dos o más, la compatibilidad da el reparto.
 */
export function resuelveEje(eje: Eje): EjeResuelto {
  compruebaEje(eje);
  const ts = [...eje.tramos].sort((a, b) => a.x0 - b.x0);
  const tramoDe = (x: number, lado: 'izq' | 'der' = 'der') => {
    for (const t of ts) if (lado === 'izq' ? x > t.x0 && x <= t.x1 : x >= t.x0 && x < t.x1) return t;
    return lado === 'izq' ? ts[0] : ts[ts.length - 1];
  };
  const cortes = new Set<number>(ts.flatMap((t) => [t.x0, t.x1]));
  for (const e of eje.empotramientos) cortes.add(e.x);
  for (const c of eje.cargas) {
    if (c.tipo === 'par') cortes.add(c.x);
    else cortes.add(c.x1), cortes.add(c.x2);
  }
  const cs = [...cortes];
  /* ∫ de a a b de ds/GIt, y el giro que dan las cargas solas desde x = 0 */
  const flex = (a: number, b: number) => integra((s) => 1 / tramoDe(s).GIt, a, b, cs);
  const phiCargas = (x: number) => integra((s) => -paresIzquierda(eje.cargas, s, 'der') / tramoDe(s).GIt, 0, x, cs);
  const emp = eje.empotramientos;
  const n = emp.length;
  /* columnas: R_0 … R_{n−1}, φ0 */
  const A: number[][] = [];
  const b: number[] = [];
  A.push([...emp.map(() => 1), 0]);
  b.push(-paresIzquierda(eje.cargas, eje.L, 'der'));
  for (const ei of emp) {
    A.push([...emp.map((ek) => (ek.x < ei.x ? -flex(ek.x, ei.x) : 0)), 1]);
    b.push((ei.giro ?? 0) - phiCargas(ei.x));
  }
  const sol = resuelveLineal(A, b);
  if (sol.rango < n + 1) {
    throw new Error(n === 0 ? 'El eje no tiene ningún empotramiento: es un mecanismo.' : 'Dos empotramientos en la misma sección: el sistema no tiene solución única.');
  }
  const R = sol.x.slice(0, n);
  const phi0 = sol.x[n];
  const todas: CargaTorsion[] = [...eje.cargas, ...emp.map((e, k) => ({ tipo: 'par' as const, x: e.x, T: R[k] }))];
  const Mt = (x: number, lado: 'izq' | 'der' = 'der') => -paresIzquierda(todas, x, lado);
  const phi = (x: number) => phi0 + integra((s) => Mt(s) / tramoDe(s).GIt, 0, x, cs);
  const tauMax = (x: number, lado: 'izq' | 'der' = 'der') => {
    const t = tramoDe(x, lado);
    if (!(t.Wt && t.Wt > 0)) throw new Error('Para la tensión hace falta el módulo resistente Wt del tramo.');
    return Math.abs(Mt(x, lado)) / t.Wt;
  };
  return { R, phi0, Mt, phi, tauMax };
}
