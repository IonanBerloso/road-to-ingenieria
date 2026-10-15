/**
 * Geometría de masas de la sección, para los temas 9, 10, 12 y 14 de ERM:
 * área, centro de gravedad, momentos y producto de inercia, Steiner, ejes
 * principales (círculo de Mohr de inercias), radio de giro, el ancho de una
 * fibra y el momento estático de una parte de la sección.
 *
 * Para quién: para el alumno de 2.º que prepara la 2.ª parte, la final o la
 * extraordinaria de Elasticidad y Resistencia de Materiales, y para quien
 * escriba sus ejercicios guiados. Cuándo: en todos los problemas de flexión
 * (dimensionar una U, una T o una L de espesor t cae en veinte convocatorias
 * de las leídas en `fase-p/p0/examenes.json`), en pandeo (el momento de inercia
 * mínimo) y en el flujo cortante. Qué gana: G, Iz, Iy, Iyz y Q sin errores de
 * Steiner, que es donde se pierden los puntos. Cómo se comprueba:
 * `tests/fisica/erm/secciones.test.ts` (cada rectángulo también como polígono
 * por el teorema de Green, que es otro camino; el círculo con hueco contra
 * π(D⁴ − d⁴)/64; las tres secciones de los parciales de 2013, 2014 y 2015
 * contra los números de sus unidades) y una malla de celdas para Q.
 *
 * EL CONVENIO ES EL DEL CURSO (apuntes del tema 9, figura 9.3, p. 6, y
 * figura 9.8, p. 15): en la sección, el eje y apunta HACIA ABAJO y el eje z
 * hacia la DERECHA; x sale del papel (es el eje de la pieza). Aquí todas las
 * coordenadas se dan como [y, z], y las piezas se colocan en un origen
 * cualquiera; las propiedades salen respecto de G:
 *
 *   · Iz = ∫(y − yG)² dA, Iy = ∫(z − zG)² dA (momentos respecto de los ejes
 *     z e y que pasan por G) e Iyz = ∫(y − yG)(z − zG) dA (ecs. 9.8-9.9,
 *     p. 7). Con y hacia abajo, el signo de Iyz es el del curso: la L de
 *     2013-2014 (ala vertical a la izquierda, horizontal arriba hacia la
 *     derecha) tiene Iyz < 0.
 *   · Mohr de inercias (ecs. 9.19 y 9.20, p. 10): con ξ = y·cos φ + z·sen φ
 *     (ec. 9.6) y η el eje perpendicular, Iη = ½(Iy + Iz) + ½(Iz − Iy)cos 2φ
 *     + Iyz sen 2φ, Iξη = ½(Iy − Iz) sen 2φ + Iyz cos 2φ, centro ½(Iy + Iz),
 *     radio √(¼(Iy − Iz)² + Iyz²) y tg 2φ1 = 2Iyz/(Iz − Iy). En φ = 0, η es z
 *     e Iη = Iz.
 *   · Momento estático de una parte Ac (ec. 9.33, p. 15): Qz = ∫ y dA y
 *     Qy = ∫ z dA sobre Ac, con y, z medidas desde G.
 *   · Radio de giro: i² = I/A (tema 14, p. 8, y ecs. 9.45-9.46, p. 25).
 *
 * Una sección es una lista de piezas: rectángulos, polígonos y círculos;
 * `hueco: true` resta la pieza (un tubo es un círculo menos otro). Los
 * rectángulos y los círculos se integran con su fórmula y Steiner; los
 * polígonos, por el teorema de Green sobre el contorno.
 */

/** Un punto de la sección: [y, z], con y hacia abajo y z hacia la derecha. */
export type PuntoYZ = readonly [number, number];

export type Pieza =
  | { tipo: 'rectangulo'; y0: number; y1: number; z0: number; z1: number; hueco?: boolean }
  | { tipo: 'poligono'; puntos: readonly PuntoYZ[]; hueco?: boolean }
  | { tipo: 'circulo'; y: number; z: number; R: number; hueco?: boolean };

export type Seccion = readonly Pieza[];

/**
 * Integrales de una región respecto del ORIGEN de coordenadas: área,
 * momentos estáticos ∫y dA y ∫z dA, y de segundo orden ∫y² dA, ∫z² dA y
 * ∫yz dA.
 */
export interface Integrales {
  A: number;
  Sy: number;
  Sz: number;
  Jyy: number;
  Jzz: number;
  Jyz: number;
}

/** Propiedades de la sección: G en las coordenadas de entrada, inercias respecto de G. */
export interface Propiedades {
  A: number;
  yG: number;
  zG: number;
  Iz: number;
  Iy: number;
  Iyz: number;
}

const CERO: Integrales = { A: 0, Sy: 0, Sz: 0, Jyy: 0, Jzz: 0, Jyz: 0 };

function suma(a: Integrales, b: Integrales, signo = 1): Integrales {
  return {
    A: a.A + signo * b.A,
    Sy: a.Sy + signo * b.Sy,
    Sz: a.Sz + signo * b.Sz,
    Jyy: a.Jyy + signo * b.Jyy,
    Jzz: a.Jzz + signo * b.Jzz,
    Jyz: a.Jyz + signo * b.Jyz,
  };
}

/**
 * Teorema de Steiner: el momento de inercia respecto de un eje paralelo a
 * distancia d del que pasa por G. `steinerProducto` es el del producto de
 * inercia, con las dos distancias con su signo.
 */
export function steiner(Ipropio: number, A: number, d: number): number {
  return Ipropio + A * d * d;
}

export function steinerProducto(Ipropio: number, A: number, dy: number, dz: number): number {
  return Ipropio + A * dy * dz;
}

/** Integrales de un rectángulo: bh³/12 propio más Steiner al origen. */
function rectangulo(y0: number, y1: number, z0: number, z1: number): Integrales {
  const h = Math.abs(y1 - y0);
  const b = Math.abs(z1 - z0);
  if (h === 0 || b === 0) throw new Error('Un rectángulo de la sección tiene un lado nulo.');
  const A = b * h;
  const yc = (y0 + y1) / 2;
  const zc = (z0 + z1) / 2;
  return {
    A,
    Sy: A * yc,
    Sz: A * zc,
    Jyy: steiner((b * h ** 3) / 12, A, yc),
    Jzz: steiner((h * b ** 3) / 12, A, zc),
    Jyz: steinerProducto(0, A, yc, zc),
  };
}

/** Integrales de un círculo: πR⁴/4 propio (respecto de cualquier diámetro) más Steiner. */
function circulo(y: number, z: number, R: number): Integrales {
  if (!(R > 0)) throw new Error('El radio de un círculo de la sección tiene que ser positivo.');
  const A = Math.PI * R * R;
  const I = (Math.PI * R ** 4) / 4;
  return { A, Sy: A * y, Sz: A * z, Jyy: steiner(I, A, y), Jzz: steiner(I, A, z), Jyz: steinerProducto(0, A, y, z) };
}

/**
 * Integrales de un polígono simple por el teorema de Green sobre su
 * contorno, sea cual sea el sentido en que se recorren los vértices.
 */
export function poligono(puntos: readonly PuntoYZ[]): Integrales {
  if (puntos.length < 3) throw new Error('Un polígono necesita al menos tres vértices.');
  let A = 0;
  let Sy = 0;
  let Sz = 0;
  let Jyy = 0;
  let Jzz = 0;
  let Jyz = 0;
  for (let k = 0; k < puntos.length; k++) {
    const [y1, z1] = puntos[k];
    const [y2, z2] = puntos[(k + 1) % puntos.length];
    /* En el plano (z, y): c = z1·y2 − z2·y1. */
    const c = z1 * y2 - z2 * y1;
    A += c / 2;
    Sz += ((z1 + z2) * c) / 6;
    Sy += ((y1 + y2) * c) / 6;
    Jzz += ((z1 * z1 + z1 * z2 + z2 * z2) * c) / 12;
    Jyy += ((y1 * y1 + y1 * y2 + y2 * y2) * c) / 12;
    Jyz += ((z1 * y2 + 2 * z1 * y1 + 2 * z2 * y2 + z2 * y1) * c) / 24;
  }
  const s = A < 0 ? -1 : 1;
  return { A: s * A, Sy: s * Sy, Sz: s * Sz, Jyy: s * Jyy, Jzz: s * Jzz, Jyz: s * Jyz };
}

function integralesPieza(p: Pieza): Integrales {
  if (p.tipo === 'rectangulo') return rectangulo(p.y0, p.y1, p.z0, p.z1);
  if (p.tipo === 'circulo') return circulo(p.y, p.z, p.R);
  return poligono(p.puntos);
}

/** Las integrales de la sección entera respecto del origen (los huecos restan). */
export function integrales(sec: Seccion): Integrales {
  let t = CERO;
  for (const p of sec) t = suma(t, integralesPieza(p), p.hueco ? -1 : 1);
  return t;
}

/** Área, centro de gravedad y momentos y producto de inercia respecto de G. */
export function propiedades(sec: Seccion): Propiedades {
  const t = integrales(sec);
  if (!(t.A > 0)) throw new Error('La sección tiene área nula o negativa: ¿un hueco mayor que la pieza?');
  const yG = t.Sy / t.A;
  const zG = t.Sz / t.A;
  /* Steiner al revés: del origen a G. */
  return {
    A: t.A,
    yG,
    zG,
    Iz: t.Jyy - t.A * yG * yG,
    Iy: t.Jzz - t.A * zG * zG,
    Iyz: t.Jyz - t.A * yG * zG,
  };
}

/** Radio de giro i = √(I/A). */
export function radioDeGiro(I: number, A: number): number {
  if (!(A > 0) || I < 0) throw new Error('Radio de giro con área no positiva o inercia negativa.');
  return Math.sqrt(I / A);
}

/**
 * Momentos y producto de inercia en los ejes ξ, η girados φ (ecs. 9.19,
 * p. 10): ξ = y·cos φ + z·sen φ, η el eje perpendicular (en φ = 0, ξ es y y
 * η es z). `Ieta` es el momento respecto del eje η, `Ixi` respecto del ξ.
 */
export function inerciaGirada(Iz: number, Iy: number, Iyz: number, phi: number): { Ieta: number; Ixi: number; Ixieta: number } {
  const c = (Iy + Iz) / 2;
  const c2 = Math.cos(2 * phi);
  const s2 = Math.sin(2 * phi);
  return {
    Ieta: c + ((Iz - Iy) / 2) * c2 + Iyz * s2,
    Ixi: c - ((Iz - Iy) / 2) * c2 - Iyz * s2,
    Ixieta: ((Iy - Iz) / 2) * s2 + Iyz * c2,
  };
}

export interface Principales {
  /** Centro y radio del círculo de Mohr de inercias (ec. 9.20). */
  centro: number;
  radio: number;
  Imax: number;
  Imin: number;
  /**
   * El φ (radianes, en (−π/2, π/2]) con el que Iη = Imax: el eje de inercia
   * máxima es η = (−sen φ, cos φ) en componentes [y, z]. Con y hacia abajo,
   * φ > 0 levanta ese eje por encima de +z.
   */
  phiMax: number;
  /** Direcciones [y, z] de los ejes de inercia máxima y mínima. */
  ejeMax: PuntoYZ;
  ejeMin: PuntoYZ;
}

/** Ejes principales de inercia por el círculo de Mohr (ecs. 9.19 y 9.20, p. 10). */
export function principales(Iz: number, Iy: number, Iyz: number): Principales {
  const centro = (Iy + Iz) / 2;
  const radio = Math.hypot((Iy - Iz) / 2, Iyz);
  /* tg 2φ1 = 2Iyz/(Iz − Iy): atan2 da el φ del máximo (cos 2φ con el signo de
     Iz − Iy y sen 2φ con el de Iyz, que es donde Iη = centro + radio). */
  let phiMax = radio === 0 ? 0 : 0.5 * Math.atan2(2 * Iyz, Iz - Iy);
  if (phiMax <= -Math.PI / 2) phiMax += Math.PI;
  const ejeMax: PuntoYZ = [-Math.sin(phiMax), Math.cos(phiMax)];
  const ejeMin: PuntoYZ = [Math.cos(phiMax), Math.sin(phiMax)];
  return { centro, radio, Imax: centro + radio, Imin: centro - radio, phiMax, ejeMax, ejeMin };
}

/* ─── Partes de la sección: recortes por una caja de lados paralelos a y, z ─── */

/** Una caja [yMin, yMax] × [zMin, zMax]; un lado que falte es infinito. */
export interface Caja {
  yMin?: number;
  yMax?: number;
  zMin?: number;
  zMax?: number;
}

/** Recorte de Sutherland-Hodgman de un polígono por el semiplano `dentro`. */
function recortaPoligono(
  pts: readonly PuntoYZ[],
  dentro: (p: PuntoYZ) => boolean,
  corte: (a: PuntoYZ, b: PuntoYZ) => PuntoYZ,
): PuntoYZ[] {
  const out: PuntoYZ[] = [];
  for (let k = 0; k < pts.length; k++) {
    const a = pts[k];
    const b = pts[(k + 1) % pts.length];
    const da = dentro(a);
    const db = dentro(b);
    if (da) out.push(a);
    if (da !== db) out.push(corte(a, b));
  }
  return out;
}

function cortaEnY(y: number) {
  return (a: PuntoYZ, b: PuntoYZ): PuntoYZ => {
    const t = (y - a[0]) / (b[0] - a[0]);
    return [y, a[1] + t * (b[1] - a[1])];
  };
}

function cortaEnZ(z: number) {
  return (a: PuntoYZ, b: PuntoYZ): PuntoYZ => {
    const t = (z - a[1]) / (b[1] - a[1]);
    return [a[0] + t * (b[0] - a[0]), z];
  };
}

function poligonoDe(p: Exclude<Pieza, { tipo: 'circulo' }>): PuntoYZ[] {
  if (p.tipo === 'poligono') return [...p.puntos];
  return [
    [p.y0, p.z0],
    [p.y0, p.z1],
    [p.y1, p.z1],
    [p.y1, p.z0],
  ];
}

function recortaCaja(pts: PuntoYZ[], c: Caja): PuntoYZ[] {
  let r = pts;
  if (c.yMin !== undefined) r = recortaPoligono(r, (p) => p[0] >= (c.yMin as number), cortaEnY(c.yMin));
  if (r.length && c.yMax !== undefined) r = recortaPoligono(r, (p) => p[0] <= (c.yMax as number), cortaEnY(c.yMax));
  if (r.length && c.zMin !== undefined) r = recortaPoligono(r, (p) => p[1] >= (c.zMin as number), cortaEnZ(c.zMin));
  if (r.length && c.zMax !== undefined) r = recortaPoligono(r, (p) => p[1] <= (c.zMax as number), cortaEnZ(c.zMax));
  return r;
}

/**
 * Integrales de la parte de un círculo con y entre yMin e yMax (un segmento
 * circular, o una franja). Primitivas en u = y − yc, con a(u) = √(R² − u²):
 * área 2a, ∫u → −⅔a³, ∫u² → ¼u(2u² − R²)a + ¼R⁴ asen(u/R), y ∫w² (w = z − zc)
 * → ⅔ de ∫a³ du, con ∫a³ du = ⅛u(5R² − 2u²)a + ⅜R⁴ asen(u/R).
 */
function franjaCircular(yc: number, zc: number, R: number, yMin: number, yMax: number): Integrales {
  const u0 = Math.max(-R, Math.min(R, yMin - yc));
  const u1 = Math.max(-R, Math.min(R, yMax - yc));
  if (u1 <= u0) return CERO;
  const a = (u: number) => Math.sqrt(Math.max(0, R * R - u * u));
  const as = (u: number) => Math.asin(Math.max(-1, Math.min(1, u / R)));
  const F0 = (u: number) => u * a(u) + R * R * as(u);
  const F1 = (u: number) => (-2 / 3) * a(u) ** 3;
  const F2 = (u: number) => 0.25 * u * (2 * u * u - R * R) * a(u) + 0.25 * R ** 4 * as(u);
  const F3 = (u: number) => (2 / 3) * ((u / 8) * (5 * R * R - 2 * u * u) * a(u) + ((3 * R ** 4) / 8) * as(u));
  const A = F0(u1) - F0(u0);
  const Iu = F1(u1) - F1(u0); // ∫u dA
  const Iuu = F2(u1) - F2(u0); // ∫u² dA
  const Iww = F3(u1) - F3(u0); // ∫w² dA
  /* Al origen: y = yc + u, z = zc + w, con ∫w dA = ∫uw dA = 0 por simetría. */
  return {
    A,
    Sy: A * yc + Iu,
    Sz: A * zc,
    Jyy: Iuu + 2 * yc * Iu + A * yc * yc,
    Jzz: Iww + A * zc * zc,
    Jyz: zc * (Iu + A * yc),
  };
}

function integralesPiezaEnCaja(p: Pieza, c: Caja): Integrales {
  if (p.tipo === 'circulo') {
    const partidoEnZ = (c.zMin !== undefined && c.zMin > p.z - p.R) || (c.zMax !== undefined && c.zMax < p.z + p.R);
    if (partidoEnZ) throw new Error('Un círculo solo se sabe partir por rectas horizontales (y constante).');
    return franjaCircular(p.y, p.z, p.R, c.yMin ?? -Infinity, c.yMax ?? Infinity);
  }
  const r = recortaCaja(poligonoDe(p), c);
  return r.length >= 3 ? poligono(r) : CERO;
}

/** Lo que importa de una parte Ac para el flujo cortante (ec. 9.33, p. 15). */
export interface Parte {
  /** Área de la parte. */
  A: number;
  /** Momentos estáticos de la parte respecto de los ejes por G: Qz = ∫y dA, Qy = ∫z dA. */
  Qz: number;
  Qy: number;
}

/** Las integrales, respecto del origen, de la parte de la sección que cae dentro de la caja (los huecos restan). */
export function integralesParte(sec: Seccion, caja: Caja): Integrales {
  let t = CERO;
  for (const p of sec) t = suma(t, integralesPiezaEnCaja(p, caja), p.hueco ? -1 : 1);
  return t;
}

/**
 * La parte de la sección que cae dentro de la caja: su área y sus momentos
 * estáticos respecto de los ejes que pasan por G de la sección ENTERA.
 */
export function parte(sec: Seccion, caja: Caja): Parte {
  const G = propiedades(sec);
  const t = integralesParte(sec, caja);
  return { A: t.A, Qz: t.Sy - t.A * G.yG, Qy: t.Sz - t.A * G.zG };
}

/**
 * El momento estático de la parte de la sección que queda por ENCIMA (y menor)
 * o por DEBAJO (y mayor) de la fibra y = yFibra, respecto del eje z por G.
 */
export function momentoEstatico(sec: Seccion, yFibra: number, lado: 'encima' | 'debajo'): Parte {
  return parte(sec, lado === 'encima' ? { yMax: yFibra } : { yMin: yFibra });
}

/** El ancho justo por encima (y algo menor) o justo por debajo (y algo mayor) de la fibra. */
function anchoAUnLado(sec: Seccion, yFibra: number, lado: 'encima' | 'debajo'): number {
  /* Un lado del polígono cuenta si sigue por ese lado de la recta: medio
     abierto hacia abajo (min ≤ y < max) o hacia arriba (min < y ≤ max). Así
     un vértice en la recta cuenta una sola vez, y los lados horizontales,
     ninguna. */
  const cruza = lado === 'debajo' ? (a: number, c: number) => a <= yFibra !== c <= yFibra : (a: number, c: number) => a < yFibra !== c < yFibra;
  let b = 0;
  for (const p of sec) {
    let l = 0;
    if (p.tipo === 'circulo') {
      const u = yFibra - p.y;
      l = Math.abs(u) < p.R ? 2 * Math.sqrt(p.R * p.R - u * u) : 0;
    } else {
      const pts = poligonoDe(p);
      const cortes: number[] = [];
      for (let k = 0; k < pts.length; k++) {
        const a = pts[k];
        const c = pts[(k + 1) % pts.length];
        if (cruza(a[0], c[0])) cortes.push(a[1] + ((yFibra - a[0]) / (c[0] - a[0])) * (c[1] - a[1]));
      }
      cortes.sort((m, n) => m - n);
      for (let k = 0; k + 1 < cortes.length; k += 2) l += cortes[k + 1] - cortes[k];
    }
    b += p.hueco ? -l : l;
  }
  return b;
}

/**
 * Longitud de la recta y = yFibra dentro de la sección: el ancho b de la
 * fibra. En la unión de dos piezas de distinto ancho (ala y alma) el ancho
 * salta: `lado` dice si se quiere el de justo encima o el de justo debajo, y
 * sin `lado` se lanza un error en vez de escoger uno. En un borde de fuera
 * (a un lado no hay nada), el ancho es el del lado que tiene sección.
 */
export function anchoEnFibra(sec: Seccion, yFibra: number, lado?: 'encima' | 'debajo'): number {
  if (lado) return anchoAUnLado(sec, yFibra, lado);
  const bE = anchoAUnLado(sec, yFibra, 'encima');
  const bD = anchoAUnLado(sec, yFibra, 'debajo');
  const tol = 1e-12 * Math.max(1, Math.abs(bE), Math.abs(bD));
  if (Math.abs(bE - bD) <= tol || Math.abs(bD) <= tol) return bE;
  if (Math.abs(bE) <= tol) return bD;
  throw new Error(
    `La fibra y = ${yFibra} es una unión: el ancho es ${bE} justo encima y ${bD} justo debajo. Di qué lado ('encima' o 'debajo').`,
  );
}

/** Todos los vértices de las piezas que no son hueco (para buscar fibras extremas). */
export function vertices(sec: Seccion): PuntoYZ[] {
  const out: PuntoYZ[] = [];
  for (const p of sec) if (p.tipo !== 'circulo' && !p.hueco) out.push(...poligonoDe(p));
  return out;
}

/* ─── Atajos para las secciones de los exámenes ─────────────────────────── */

/** Rectángulo macizo de ancho b (según z) y canto h (según y), con su esquina de arriba a la izquierda en el origen. */
export function rectanguloMacizo(b: number, h: number): Seccion {
  return [{ tipo: 'rectangulo', y0: 0, y1: h, z0: 0, z1: b }];
}

/** Círculo de diámetro D (macizo) o corona de diámetros D y d, centrada en el origen. */
export function circular(D: number, d = 0): Seccion {
  const s: Pieza[] = [{ tipo: 'circulo', y: 0, z: 0, R: D / 2 }];
  if (d > 0) s.push({ tipo: 'circulo', y: 0, z: 0, R: d / 2, hueco: true });
  return s;
}
