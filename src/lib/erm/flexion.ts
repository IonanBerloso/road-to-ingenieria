/**
 * Tema 9 de ERM, flexión: tensiones. Navier en flexión simple y esviada,
 * eje neutro, flexión compuesta y compresión excéntrica, núcleo central,
 * tensiones cortantes por el teorema del flujo cortante (Collignon en
 * secciones macizas, alas y almas de perfiles de pared delgada), uniones de
 * vigas compuestas y el dimensionado de una sección para una tensión
 * admisible.
 *
 * Para quién: para el alumno que prepara la 2.ª parte, la final o la
 * extraordinaria, y para quien escriba sus ejercicios guiados. Cuándo: el
 * tema 9 cae en treinta preguntas de examen de las leídas (`p0`): veinte de
 * «viga, diagramas y dimensionado», siete de tracción o compresión excéntrica
 * y las de flexión esviada. Qué gana: la tensión de cada esquina, el eje
 * neutro y la t mínima sin rehacer a mano el sistema 9.9. Cómo se comprueba:
 * `tests/fisica/erm/flexion.test.ts` (la forma 9.11 contra la 9.12 y contra
 * los ejes principales; el campo de tensiones integrado en una malla devuelve
 * N, My y Mz; Collignon contra 6T/bh³(h²/4 − y²) y 4T/3πR²; el núcleo de un
 * rectángulo general contra el rombo de h/6 y b/6) y `aceptacion-bloque2.test.ts`
 * (los parciales 1 de 2013-2014, 2014-2015 y 2015-2016 resueltos por p6d, p6c
 * y p6b, y la 2.ª parte de 2018-2019).
 *
 * EL CONVENIO ES EL DEL CURSO, el de `secciones.ts` (y hacia abajo, z hacia la
 * derecha, figura 9.3, p. 6):
 *
 *   · M = My·j − Mz·k (ec. 9.17, p. 10), con My = ∫σx·z dA y Mz = ∫σx·y dA
 *     (ec. 9.8, p. 7): Mz > 0 tracciona las fibras de y > 0 (las de abajo),
 *     que es el M > 0 de los diagramas del tema 7 y de `vigas.ts`; My > 0
 *     tracciona las de z > 0. Es el mismo convenio que el del tema 7 publicado
 *     (M_G = Mt·i + My·j − Mz·k) y el que comprobaron p6b, p6c y p6d.
 *   · σx = C1·y + C2·z, C1 = (My·Iyz − Mz·Iy)/(Iyz² − Iy·Iz),
 *     C2 = (Mz·Iyz − My·Iz)/(Iyz² − Iy·Iz) (ecs. 9.10-9.11, p. 7); la forma
 *     con M'z y M'y es la ec. 9.12 (p. 8), y el eje neutro, y/z = −M'y·Iz/(M'z·Iy)
 *     (ec. 9.13, p. 8). Con N: σx = N/A + … (ec. 9.41, p. 23).
 *   · Fuerza P de tracción en (ey, ez): N = P, Mz = P·ey, My = P·ez (ec. 9.43,
 *     p. 25); el eje neutro corta los ejes en yN = −iz²/ey, zN = −iy²/ez
 *     (ec. 9.46, p. 26), si y, z son principales.
 *   · Flujo cortante a través del contorno de una parte Ac:
 *     qc = T'y·Qz/Iz + T'z·Qy/Iy (ec. 9.34, p. 15), con T' de la ec. 9.31
 *     (p. 14); qc > 0 en la sección derecha cuando entra en Ac (p. 14). Ty y
 *     Tz son las cortantes del curso (V en el tema 7 publicado y en
 *     `esfuerzos.ts`). Si el contorno corta la sección por una línea de
 *     longitud b, τ = qc/b (ecs. 9.37, p. 17, y 9.35).
 *   · Uniones de vigas compuestas: qc·e = n·S (ec. 9.39, p. 22) y
 *     S = τ·πD²/4 (ec. 9.40).
 *   · Núcleo central: el de la sección rectangular es el rombo de
 *     semidiagonales h/6 y b/6, y el de la circular, el círculo de radio D/8
 *     (pp. 28-29).
 *   · Dimensionado: Wz = Iz/ymax y Wz = Mmax/σadm (ecs. 9.24-9.25, p. 12).
 */
import {
  anchoEnFibra,
  parte,
  propiedades,
  vertices,
  type Caja,
  type Propiedades,
  type PuntoYZ,
  type Seccion,
} from './secciones';

/** Las fuerzas y momentos de sección que entran en el tema 9 (convenio arriba). */
export interface EsfuerzosSeccion {
  N?: number;
  My?: number;
  Mz?: number;
  Ty?: number;
  Tz?: number;
}

/** σx = a0 + C1·(y − yG) + C2·(z − zG). */
export interface Navier {
  a0: number;
  C1: number;
  C2: number;
}

/** Los coeficientes de la distribución de tensiones normales (ecs. 9.10 y 9.41). */
export function coeficientesNavier(p: Propiedades, e: EsfuerzosSeccion): Navier {
  const My = e.My ?? 0;
  const Mz = e.Mz ?? 0;
  const den = p.Iyz * p.Iyz - p.Iy * p.Iz;
  if (den === 0) throw new Error('Iy·Iz = Iyz²: la sección no tiene inercia en alguna dirección.');
  return {
    a0: (e.N ?? 0) / p.A,
    C1: (My * p.Iyz - Mz * p.Iy) / den,
    C2: (Mz * p.Iyz - My * p.Iz) / den,
  };
}

/** Los momentos M'z y M'y de la ec. 9.12, con los que σx = M'z·y/Iz + M'y·z/Iy. */
export function momentosEquivalentes(p: Propiedades, e: EsfuerzosSeccion): { MzP: number; MyP: number } {
  const My = e.My ?? 0;
  const Mz = e.Mz ?? 0;
  const k = 1 - (p.Iyz * p.Iyz) / (p.Iy * p.Iz);
  return { MzP: (Mz - (My * p.Iyz) / p.Iy) / k, MyP: (My - (Mz * p.Iyz) / p.Iz) / k };
}

/** σx en el punto [y, z] (coordenadas de la sección, no desde G). */
export function tensionNormal(p: Propiedades, e: EsfuerzosSeccion, punto: PuntoYZ): number {
  const c = coeficientesNavier(p, e);
  return c.a0 + c.C1 * (punto[0] - p.yG) + c.C2 * (punto[1] - p.zG);
}

export interface EjeNeutro extends Navier {
  /** y/z de los puntos del eje neutro, desde G, si pasa por G (ec. 9.13); ±∞ si es paralelo a y. */
  pendiente: number;
  /**
   * Cuánto sube el eje neutro por encima de +z, en radianes, en (−π/2, π/2]:
   * con y hacia abajo, positivo es hacia −y.
   */
  anguloSobreZ: number;
  /** Cortes con los ejes por G (yN en z = 0, zN en y = 0), si hay axil; ±∞ si no corta. */
  yN: number;
  zN: number;
}

/** El eje neutro: σx = 0 (ecs. 9.13 y 9.44). */
export function ejeNeutro(p: Propiedades, e: EsfuerzosSeccion): EjeNeutro {
  const c = coeficientesNavier(p, e);
  if (c.C1 === 0 && c.C2 === 0) throw new Error('Sin flexión no hay eje neutro.');
  const anguloSobreZ = c.C1 === 0 ? Math.PI / 2 : Math.atan(c.C2 / c.C1);
  return {
    ...c,
    pendiente: c.C1 === 0 ? Infinity : -c.C2 / c.C1,
    anguloSobreZ,
    yN: c.C1 === 0 ? Infinity : -c.a0 / c.C1,
    zN: c.C2 === 0 ? Infinity : -c.a0 / c.C2,
  };
}

export interface PuntoTension {
  sigma: number;
  punto: PuntoYZ;
}

/**
 * Los puntos de máxima tracción y máxima compresión. σx es lineal en la
 * sección, así que los extremos están en los vértices de las piezas o, en un
 * círculo, en el punto del borde según el gradiente (fig. 9.4, p. 8).
 */
export function tensionesExtremas(sec: Seccion, e: EsfuerzosSeccion): { max: PuntoTension; min: PuntoTension } {
  const p = propiedades(sec);
  const c = coeficientesNavier(p, e);
  const cand: PuntoYZ[] = vertices(sec);
  const g = Math.hypot(c.C1, c.C2);
  for (const pz of sec) {
    if (pz.tipo !== 'circulo' || pz.hueco) continue;
    if (g === 0) cand.push([pz.y, pz.z]);
    else {
      cand.push([pz.y + (pz.R * c.C1) / g, pz.z + (pz.R * c.C2) / g]);
      cand.push([pz.y - (pz.R * c.C1) / g, pz.z - (pz.R * c.C2) / g]);
    }
  }
  if (cand.length === 0) throw new Error('La sección no tiene piezas macizas.');
  const sig = (q: PuntoYZ) => c.a0 + c.C1 * (q[0] - p.yG) + c.C2 * (q[1] - p.zG);
  let max: PuntoTension = { sigma: sig(cand[0]), punto: cand[0] };
  let min = max;
  for (const q of cand) {
    const s = sig(q);
    if (s > max.sigma) max = { sigma: s, punto: q };
    if (s < min.sigma) min = { sigma: s, punto: q };
  }
  return { max, min };
}

/** Módulo resistente Wz = Iz/ymax (ec. 9.24, p. 12). */
export function moduloResistente(I: number, distanciaMax: number): number {
  if (!(distanciaMax > 0)) throw new Error('La distancia a la fibra más alejada tiene que ser positiva.');
  return I / distanciaMax;
}

/** El módulo resistente que hace falta: Wz = Mmax/σadm (ec. 9.25, p. 12). */
export function moduloNecesario(Mmax: number, sigmaAdm: number): number {
  if (!(sigmaAdm > 0)) throw new Error('La tensión admisible tiene que ser positiva.');
  return Math.abs(Mmax) / sigmaAdm;
}

/** Las admisibles: a tracción y a compresión (en positivo; si falta la de compresión, la misma). */
export interface Admisibles {
  traccion: number;
  compresion?: number;
}

/**
 * La escala t mínima de una sección cuyas cotas son todas proporcionales a t
 * (`seccionUnidad` es la de t = 1) para que ninguna fibra pase de las
 * admisibles. Al escalar, A va con t², I con t⁴, y σ = N/(A1·t²) +
 * (C1·y + C2·z)/t³ con los coeficientes de t = 1. Sin axil sale cerrada,
 * t = ∛(σ1/σadm); con axil se busca de arriba abajo y se afina por bisección
 * (la tensión de un punto no tiene por qué ser monótona en t si el axil y la
 * flexión tiran a lados contrarios).
 */
export function escalaMinima(seccionUnidad: Seccion, e: EsfuerzosSeccion, adm: Admisibles): number {
  const sT = adm.traccion;
  const sC = adm.compresion ?? adm.traccion;
  if (!(sT > 0) || !(sC > 0)) throw new Error('Las admisibles tienen que ser positivas.');
  const p = propiedades(seccionUnidad);
  const c = coeficientesNavier(p, e);
  const g = Math.hypot(c.C1, c.C2);
  const pts: PuntoYZ[] = vertices(seccionUnidad);
  for (const pz of seccionUnidad) {
    if (pz.tipo === 'circulo' && !pz.hueco && g > 0) {
      pts.push([pz.y + (pz.R * c.C1) / g, pz.z + (pz.R * c.C2) / g], [pz.y - (pz.R * c.C1) / g, pz.z - (pz.R * c.C2) / g]);
    }
  }
  const flex = pts.map((q) => c.C1 * (q[0] - p.yG) + c.C2 * (q[1] - p.zG));
  const exceso = (t: number) => {
    let m = -Infinity;
    for (const f of flex) {
      const s = c.a0 / (t * t) + f / t ** 3;
      m = Math.max(m, s / sT - 1, -s / sC - 1);
    }
    return m;
  };
  if (c.a0 === 0) {
    const r = Math.max(...flex.map((f) => Math.max(f / sT, -f / sC)));
    if (!(r > 0)) throw new Error('Sin esfuerzos no hay espesor que dimensionar.');
    return Math.cbrt(r);
  }
  let hi = 1;
  while (exceso(hi) > 0) hi *= 2;
  let lo = hi;
  while (exceso(lo) <= 0 && lo > 1e-12) lo /= 2;
  for (let k = 0; k < 200 && hi - lo > 1e-14 * hi; k++) {
    const m = (lo + hi) / 2;
    if (exceso(m) > 0) lo = m;
    else hi = m;
  }
  return hi;
}

/* ─── Cortantes ────────────────────────────────────────────────────────── */

/** Las cortantes equivalentes T'y y T'z de la ec. 9.31 (p. 14). */
export function cortantesEquivalentes(p: Propiedades, e: EsfuerzosSeccion): { TyP: number; TzP: number } {
  const Ty = e.Ty ?? 0;
  const Tz = e.Tz ?? 0;
  const k = 1 - (p.Iyz * p.Iyz) / (p.Iy * p.Iz);
  return { TyP: (Ty - (Tz * p.Iyz) / p.Iy) / k, TzP: (Tz - (Ty * p.Iyz) / p.Iz) / k };
}

/**
 * Flujo cortante a través del contorno de la parte Ac de la sección que cae
 * dentro de la caja (ec. 9.34, p. 15): positivo si, en la sección derecha,
 * entra en Ac. Solo cuenta el trozo de contorno que no es borde de la pieza.
 */
export function flujoCortante(sec: Seccion, e: EsfuerzosSeccion, caja: Caja): number {
  const p = propiedades(sec);
  const { TyP, TzP } = cortantesEquivalentes(p, e);
  const q = parte(sec, caja);
  return (TyP * q.Qz) / p.Iz + (TzP * q.Qy) / p.Iy;
}

/**
 * La tensión cortante τxy en la fibra y = yFibra, repartida por igual en el
 * ancho b de la fibra (hipótesis de la p. 17). Ac es la parte de DEBAJO de la
 * fibra, como en la deducción de la ec. 9.36; con Ty > 0 y la sección
 * simétrica, τ sale positiva. En la unión de un ala y un alma el flujo es
 * uno pero el ancho salta: `lado` dice si se quiere la τ de la pieza de
 * justo encima o la de justo debajo (sin él, en una unión, se lanza).
 */
export function cortanteEnFibra(
  sec: Seccion,
  e: EsfuerzosSeccion,
  yFibra: number,
  lado?: 'encima' | 'debajo',
): { qc: number; b: number; tau: number } {
  const qc = flujoCortante(sec, e, { yMin: yFibra });
  const b = anchoEnFibra(sec, yFibra, lado);
  if (!(b > 0)) throw new Error(`La fibra y = ${yFibra} no corta la sección.`);
  return { qc, b, tau: qc / b };
}

/**
 * La tensión cortante en un corte vertical de un ala de pared delgada: Ac es
 * la parte de la caja (el trozo de ala desde su borde libre hasta el corte) y
 * t, el espesor que corta. τzx = qc/t (p. 20).
 */
export function cortanteEnAla(sec: Seccion, e: EsfuerzosSeccion, trozo: Caja, t: number): { qc: number; tau: number } {
  if (!(t > 0)) throw new Error('El espesor del ala tiene que ser positivo.');
  const qc = flujoCortante(sec, e, trozo);
  return { qc, tau: qc / t };
}

/** Rectángulo b × h con Ty = T: τxy = 6T/(bh³)·(h²/4 − y²) (ec. 9.37, p. 17), y desde G. */
export function cortanteRectangulo(T: number, b: number, h: number, y: number): number {
  if (Math.abs(y) > h / 2) throw new Error('La fibra está fuera del rectángulo.');
  return ((6 * T) / (b * h ** 3)) * ((h * h) / 4 - y * y);
}

/**
 * Círculo de radio R con Ty = T (pp. 18-19), y desde G: τxy uniforme en la
 * cuerda MN, 4T(R² − y²)/(3πR⁴), y la del borde, τM = τxy·R/√(R² − y²).
 */
export function cortanteCircular(T: number, R: number, y: number): { tauXY: number; tauBorde: number } {
  if (Math.abs(y) >= R) throw new Error('La fibra está fuera del círculo.');
  const tauXY = (4 * T * (R * R - y * y)) / (3 * Math.PI * R ** 4);
  return { tauXY, tauBorde: (tauXY * R) / Math.sqrt(R * R - y * y) };
}

/** La separación entre uniones de una viga compuesta: e = n·S/qc (ec. 9.39, p. 22). */
export function separacionUniones(qc: number, n: number, S: number): number {
  if (qc === 0) throw new Error('Sin flujo cortante en la unión no hay separación que calcular.');
  return (n * S) / Math.abs(qc);
}

/** La fuerza que aguanta una unión de diámetro D: S = τ·πD²/4 (ec. 9.40, p. 22). */
export function fuerzaUnion(tau: number, D: number): number {
  return (tau * Math.PI * D * D) / 4;
}

/* ─── Tracción y compresión excéntrica; núcleo central ─────────────────── */

/** Los esfuerzos de una fuerza P (tracción > 0) aplicada en (ey, ez) desde G (ec. 9.43, p. 25). */
export function excentrica(P: number, ey: number, ez: number): EsfuerzosSeccion {
  return { N: P, Mz: P * ey, My: P * ez };
}

/** Cortes del eje neutro con los ejes principales: yN = −iz²/ey, zN = −iy²/ez (ec. 9.46, p. 26). */
export function cortesEjeNeutro(iz2: number, iy2: number, ey: number, ez: number): { yN: number; zN: number } {
  return { yN: ey === 0 ? Infinity : -iz2 / ey, zN: ez === 0 ? Infinity : -iy2 / ez };
}

/** Núcleo central del rectángulo b × h: el rombo de vértices (±h/6, 0) y (0, ±b/6), [y, z] desde G (p. 29). */
export function nucleoRectangulo(b: number, h: number): PuntoYZ[] {
  return [
    [h / 6, 0],
    [0, b / 6],
    [-h / 6, 0],
    [0, -b / 6],
  ];
}

/** Radio del núcleo central de la sección circular de diámetro D: D/8 (p. 28). */
export function nucleoCircular(D: number): number {
  return D / 8;
}

/** Envolvente convexa (cadena monótona), en sentido antihorario en el plano (z, y). */
function envolvente(pts: readonly PuntoYZ[]): PuntoYZ[] {
  const ps = [...pts].sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  const cruz = (o: PuntoYZ, a: PuntoYZ, b: PuntoYZ) => (a[1] - o[1]) * (b[0] - o[0]) - (a[0] - o[0]) * (b[1] - o[1]);
  const lo: PuntoYZ[] = [];
  for (const p of ps) {
    while (lo.length >= 2 && cruz(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop();
    lo.push(p);
  }
  const up: PuntoYZ[] = [];
  for (let k = ps.length - 1; k >= 0; k--) {
    const p = ps[k];
    while (up.length >= 2 && cruz(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop();
    up.push(p);
  }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}

/**
 * Núcleo central de una sección de piezas poligonales (rectángulos y
 * polígonos), con ejes principales o no: para cada lado de la envolvente
 * convexa, el punto de aplicación de P cuyo eje neutro es ese lado (p. 28:
 * «la condición para determinar el Núcleo es que el Eje Neutro sea tangente
 * a la sección»). Por unidad de P, el eje neutro es 1/A + C1·y + C2·z = 0, y
 * de C1, C2 salen Mz = ey y My = ez por la ec. 9.9. Vértices [y, z] desde G.
 */
export function nucleoCentral(sec: Seccion): PuntoYZ[] {
  if (sec.some((p) => p.tipo === 'circulo')) throw new Error('El núcleo general solo admite piezas poligonales.');
  const p = propiedades(sec);
  const env = envolvente(vertices(sec).map((q) => [q[0] - p.yG, q[1] - p.zG] as PuntoYZ));
  const out: PuntoYZ[] = [];
  for (let k = 0; k < env.length; k++) {
    const a = env[k];
    const b = env[(k + 1) % env.length];
    /* Recta n·r = c por a y b, con n hacia fuera (c > 0: G queda dentro). */
    let ny = b[1] - a[1];
    let nz = -(b[0] - a[0]);
    let c = ny * a[0] + nz * a[1];
    if (c < 0) {
      ny = -ny;
      nz = -nz;
      c = -c;
    }
    if (!(c > 0)) throw new Error('G está en el borde de la envolvente: no hay núcleo.');
    const C1 = -ny / (c * p.A);
    const C2 = -nz / (c * p.A);
    out.push([C1 * p.Iz + C2 * p.Iyz, C1 * p.Iyz + C2 * p.Iy]);
  }
  return out;
}
