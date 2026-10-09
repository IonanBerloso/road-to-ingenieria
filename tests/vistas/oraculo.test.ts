/**
 * El oráculo: el segundo camino del motor de vistas (§10; diseño de la fase
 * M, §3.8).
 *
 * Un calculador independiente, en el espacio de la imagen. Por cada píxel
 * de una vista lanza un rayo de quien mira hacia la pieza y apunta todas
 * sus entradas y salidas: las capas. Las aristas son los saltos entre
 * píxeles vecinos —una capa que aparece o desaparece, un salto de
 * profundidad o de normal—; en la primera capa son vistas, y en las demás,
 * ocultas. Luego se cruzan con el motor: cada tramo suyo tiene que caer
 * sobre un salto del oráculo de su clase, y cada salto sobre un tramo.
 *
 * QUÉ COMPARTE CON EL MOTOR: la pertenencia de las primitivas (`dentro`), y
 * nada más. Las capas se encuentran avanzando por el rayo y afinando por
 * bisección; las normales, con dos rayos desplazados una centésima; cómo
 * mira cada vista está escrito aquí otra vez, desde las reglas del sistema
 * europeo y no desde `proyeccion.ts`; y las distancias a los tramos, con su
 * propia geometría.
 *
 * CUÁNTOS PÍXELES. El diseño pide píxeles de 0,1 mm en toda la vista: unos
 * 400.000 rayos por vista, que en JavaScript son minutos. Aquí se barre por
 * líneas cada 2 mm en las dos direcciones, a 0,5 mm, y donde dos píxeles
 * vecinos difieren se baja a 0,1 mm. Un salto que cruza una línea de
 * barrido se encuentra a 0,1 mm; uno más corto que el barrido lo vigila la
 * otra dirección de la comprobación, que parte de cada tramo del motor.
 *
 * PLIEGUES SUAVES. Un salto de normal entre vecinos tiene que pasar de 20°,
 * para no confundirlo con lo que se curva un cilindro. Un tramo del motor
 * por donde la superficie se pliega menos —el cruce de dos tubos del mismo
 * radio junto a su punto singular, dos cilindros paralelos casi juntos— se
 * da por bueno si la normal, medida con signo, gira al cruzarlo distinto de
 * lo que gira a cada lado (`pliegaSuave`): en la primera capa para uno
 * visto, en las de atrás para uno oculto. Solo sirve para dar por bueno,
 * nunca para acusar, y no se mide con la superficie casi de canto.
 *
 * VALIDADO AL REVÉS: con el motor erosionando primitiva a primitiva —el
 * fallo de la espiga—, con un tramo de menos, uno de más y uno del otro
 * tipo, el oráculo lo caza (los últimos tests).
 */
import { describe, expect, it } from 'vitest';
import type { PiezaDeclarada } from '../../src/lib/vistas/pieza.ts';
import { compilaPieza, dentro, type PiezaCompilada } from '../../src/lib/vistas/pieza.ts';
import { calculaVistas, type OpcionesDelMotor, type VistaCalculada } from '../../src/lib/vistas/motor.ts';
import type { Forma2 } from '../../src/lib/vistas/plano2d.ts';
import {
  AGUJERO_CIEGO,
  AVELLANADO,
  BLOQUE_TALADRADO,
  CHAFLAN_SIN_DENTRO,
  CILINDROS_PARALELOS,
  COLUMNA_EN_BASE,
  CONTACTO_POR_ARISTA,
  CONTACTO_POR_VERTICE,
  CRUZ_DE_TUBOS,
  EJE_TALADRADO,
  GIRADAS,
  L_DE_DOS_CAJAS,
  L_PRISMA,
  MUESCA_COPLANARIA,
  PLACA_REDONDEADA,
  RANURA_EN_V,
  TRONCO_DE_CONO,
  piezaDeLaEspiga,
  tubosDescentrados,
} from './piezas';

type V = readonly [number, number, number];
type Pt = readonly [number, number];
type Id = 'alzado' | 'planta' | 'perfil';

/* ── Constantes, con sus unidades ─────────────────────────────────────── */

/** El paso con que se avanza por el rayo, en mm: una pared más delgada que
 *  esto no la ve, y una cuña más estrecha tampoco (el fondo de una ranura
 *  en V se encuentra a medio paso de donde está). Era 0,2: con eso, junto a
 *  un taladro descentrado la lámina de materia que queda tras el taladro
 *  (0,08 mm a 0,1 mm del borde) aparecía a 0,27 mm de la arista, más allá
 *  de CASA, y el oráculo no veía aristas que el motor sí dibujaba bien
 *  (segunda revisión del 9 de octubre de 2026). Cuesta un 50 % más. */
const PASO_RAYO = 0.1;
/** Bisecciones para afinar un cruce: 0,2 mm / 2^24. */
const AFINA = 24;
/** El píxel fino y el grueso, en mm. */
const PIXEL = 0.1;
const PIXEL_GRUESO = 0.5;
/** Cada cuánto va una línea de barrido, en mm. */
const ENTRE_BARRIDOS = 2;
/** Hasta dónde se busca, a cada lado, el cruce de un rayo desplazado, en
 *  mm: una cara de pendiente 50 todavía lo da. No es el paso del rayo: con
 *  0,1 mm, en un desmoldeo de 3° el cruce caía fuera y la normal salía
 *  nula. */
const HORQUILLA = 0.5;
/** Los rayos desplazados que dan la normal, en mm. */
const DESPLAZA = 0.01;
/** Dos normales vecinas que se apartan más de esto son un pliegue. */
const SALTO_DE_NORMAL = (20 * Math.PI) / 180;
/** Lo que se aparta la profundidad de un píxel de lo que predice la
 *  pendiente de su vecino para ser un salto, en mm. */
const SALTO_DE_PROFUNDIDAD = 0.1;
/** A qué distancia de un tramo tiene que caer un salto, y al revés, en mm:
 *  el píxel, más medio paso del rayo para las cuñas. */
const CASA = 0.25;
/** Lo que no se mira junto al extremo de un tramo, ni junto a otro tramo
 *  que lo cruce o corra a su lado, en mm: ahí la sonda ve las dos líneas, y
 *  en el cruce de dos tubos del mismo radio, el punto singular, el pliegue
 *  se anula (a 0,64 mm del cruce ya no se distingue de la curvatura). */
const LEJOS = 0.8;
/** Un pliegue suave se da por visto si la normal se quiebra al cruzar la
 *  línea esto más de lo que se curva a cada lado, en grados. */
const QUIEBRO = 0.5;
/** El coseno entre la normal y la mirada por debajo del cual una
 *  superficie está casi de canto (más de 60°). */
const CANTO = 0.5;
/** Cuántos píxeles se miran a cada lado de un tramo del motor. */
const A_CADA_LADO = 6;

/* ── Cómo mira cada vista, escrito otra vez ───────────────────────────── */

interface Marco {
  readonly x: Pt;
  readonly y: Pt;
  readonly z: Pt;
}

interface Mirada {
  /** El rayo del punto (u, v) del papel: de quien mira hacia la pieza. */
  readonly rayo: (u: number, v: number) => { o: V; d: V };
  readonly largo: number;
  /** Lo que ocupa la vista en el papel, con 1 mm de margen. */
  readonly ventana: readonly [number, number, number, number];
  /** Las dos direcciones del papel, u y v, en el espacio. */
  readonly ejes: readonly [V, V];
}

/* El sistema europeo, desde sus reglas (NyV p. 9-12): el alzado mira desde
   delante y en el papel la u es la x y la v baja cuando la z sube; la planta
   mira desde arriba y queda debajo del alzado, con lo de delante abajo; el
   perfil izquierdo mira desde la izquierda y queda a la derecha del alzado,
   con lo de delante a la derecha. */
function mirada(id: Id, m: Marco): Mirada {
  const M = 1;
  if (id === 'alzado') {
    return {
      rayo: (u, v) => ({ o: [u, m.y[0] - M, -v], d: [0, 1, 0] }),
      largo: m.y[1] - m.y[0] + 2 * M,
      ventana: [m.x[0] - M, m.x[1] + M, -m.z[1] - M, -m.z[0] + M],
      ejes: [
        [1, 0, 0],
        [0, 0, -1],
      ],
    };
  }
  if (id === 'planta') {
    return {
      rayo: (u, v) => ({ o: [u, -v, m.z[1] + M], d: [0, 0, -1] }),
      largo: m.z[1] - m.z[0] + 2 * M,
      ventana: [m.x[0] - M, m.x[1] + M, -m.y[1] - M, -m.y[0] + M],
      ejes: [
        [1, 0, 0],
        [0, -1, 0],
      ],
    };
  }
  return {
    rayo: (u, v) => ({ o: [m.x[0] - M, -u, -v], d: [1, 0, 0] }),
    largo: m.x[1] - m.x[0] + 2 * M,
    ventana: [-m.y[1] - M, -m.y[0] + M, -m.z[1] - M, -m.z[0] + M],
    ejes: [
      [0, -1, 0],
      [0, 0, -1],
    ],
  };
}

/* ── Las capas de un rayo, con la pertenencia y nada más ──────────────── */

interface Capa {
  readonly t: number;
  /** La normal, sin orientar; null donde los rayos vecinos no la
   *  encuentran (junto a un contorno, o en una cara muy de canto). */
  readonly n: V | null;
}

const en = (p: PiezaCompilada, o: V, d: V, t: number) => dentro(p, [o[0] + d[0] * t, o[1] + d[1] * t, o[2] + d[2] * t]);

function biseca(p: PiezaCompilada, o: V, d: V, a: number, b: number, ea: boolean): number {
  for (let i = 0; i < AFINA; i++) {
    const m = (a + b) / 2;
    if (en(p, o, d, m) === ea) a = m;
    else b = m;
  }
  return (a + b) / 2;
}

/** El cruce de un rayo desplazado cerca de t, o null si no hay uno solo. */
function cruceCerca(p: PiezaCompilada, o: V, d: V, t: number): number | null {
  const [a, b] = [t - HORQUILLA, t + HORQUILLA];
  const ea = en(p, o, d, a);
  if (ea === en(p, o, d, b)) return null;
  return biseca(p, o, d, a, b, ea);
}

const suma = (a: V, b: V, s: number): V => [a[0] + b[0] * s, a[1] + b[1] * s, a[2] + b[2] * s];
const cruz = (a: V, b: V): V => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

function capas(p: PiezaCompilada, mira: Mirada, u: number, v: number): Capa[] {
  const { o, d } = mira.rayo(u, v);
  const [U, W] = mira.ejes;
  const r: Capa[] = [];
  let antes = en(p, o, d, 0);
  for (let t = PASO_RAYO; t <= mira.largo + 1e-9; t += PASO_RAYO) {
    const ahora = en(p, o, d, t);
    if (ahora === antes) continue;
    const tc = biseca(p, o, d, t - PASO_RAYO, t, antes);
    /* La normal: la superficie sube o baja tanto al moverse una centésima
       por el papel en cada dirección. */
    const tu = cruceCerca(p, suma(o, U, DESPLAZA), d, tc);
    const tw = cruceCerca(p, suma(o, W, DESPLAZA), d, tc);
    let n: V | null = null;
    if (tu !== null && tw !== null) {
      const g = cruz(suma(U, d, (tu - tc) / DESPLAZA), suma(W, d, (tw - tc) / DESPLAZA));
      const l = Math.hypot(...g);
      n = [g[0] / l, g[1] / l, g[2] / l];
    }
    r.push({ t: tc, n });
    antes = ahora;
  }
  return r;
}

/* ── Los saltos entre dos píxeles vecinos ─────────────────────────────── */

/** La primera capa en que dos píxeles vecinos, a `paso` mm, no siguen la
 *  misma superficie; -1 si en todas la siguen. */
function primeraQueSalta(a: readonly Capa[], b: readonly Capa[], paso: number, dir: V, d: V): number {
  const n = Math.min(a.length, b.length);
  for (let k = 0; k < n; k++) {
    const [x, y] = [a[k], b[k]];
    if (x.n && y.n) {
      const coseno = Math.abs(x.n[0] * y.n[0] + x.n[1] * y.n[1] + x.n[2] * y.n[2]);
      if (Math.acos(Math.min(1, coseno)) > SALTO_DE_NORMAL) return k;
      /* Lo que debería cambiar la profundidad con la pendiente de cada uno:
         la normal n cumple n·(dir·paso + d·Δt) = 0. */
      const pendiente = (c: V) => {
        const nd = c[0] * d[0] + c[1] * d[1] + c[2] * d[2];
        const nu = c[0] * dir[0] + c[1] * dir[1] + c[2] * dir[2];
        return Math.abs(nd) < 1e-9 ? Infinity : -nu / nd;
      };
      const prevista = ((pendiente(x.n) + pendiente(y.n)) / 2) * paso;
      if (Number.isFinite(prevista) && Math.abs(y.t - x.t - prevista) > SALTO_DE_PROFUNDIDAD) return k;
    } else if (Math.abs(y.t - x.t) > 10 * paso) return k;
  }
  return a.length !== b.length ? n : -1;
}

interface Salto {
  readonly en: Pt;
  readonly visto: boolean;
}

/** La primera capa en que dos píxeles a dos pasos se pliegan: la normal
 *  cambia más de SALTO_DE_NORMAL. Hace falta además de comparar vecinos: un
 *  píxel que cae justo en el pliegue sale con una normal a medio camino, y
 *  partía en dos de 13° el salto de 26° del cruce de dos tubos, por debajo
 *  del umbral. */
function primeraQuePliega(a: readonly Capa[], c: readonly Capa[]): number {
  for (let k = 0; k < Math.min(a.length, c.length); k++) {
    const [x, y] = [a[k].n, c[k].n];
    if (!x || !y) continue;
    const coseno = Math.abs(x[0] * y[0] + x[1] * y[1] + x[2] * y[2]);
    if (Math.acos(Math.min(1, coseno)) > SALTO_DE_NORMAL) return k;
  }
  return -1;
}

/** Si la primera capa se pliega en el píxel `c` de la fila, aunque sea
 *  menos que SALTO_DE_NORMAL: lo que gira la normal de tres píxeles a un
 *  lado a tres al otro se aparta de lo que gira, en la misma distancia, a
 *  cada lado. Es para los pliegues suaves, como el cruce de dos tubos del
 *  mismo radio junto a su punto singular, donde el ángulo baja hasta cero
 *  y ningún umbral entre vecinos lo ve; en una superficie lisa, lo que se
 *  gira al cruzar es lo que se gira a un lado más lo que se gira al otro.
 *  Con signo, medido en el plano de la sonda y la mirada: un pliegue que
 *  va contra la curvatura —dos cilindros paralelos a 0,5 mm, cuyo pliegue
 *  de 2,9° deshace lo que se curvan— sin signo se compensaba y no se veía
 *  (segunda revisión del 9 de octubre de 2026). */
function pliegaSuave(fila: readonly (readonly Capa[])[], c: number, dir: V, d: V, capa: number): boolean {
  const cuantas = fila[c].length;
  const fi = (k: number): number | null => {
    const pixel = fila[c + k];
    const n = pixel?.length === cuantas ? pixel[capa]?.n : null;
    if (!n) return null;
    const [a, b] = [n[0] * dir[0] + n[1] * dir[1] + n[2] * dir[2], n[0] * d[0] + n[1] * d[1] + n[2] * d[2]];
    /* Casi de canto, junto a un contorno, la normal gira tan deprisa que la
       cuenta daría pliegues que no hay: ahí no se mide. */
    if (Math.abs(b) < CANTO) return null;
    return (Math.atan2(a, b) * 180) / Math.PI;
  };
  const [a, b, x, y] = [fi(-6), fi(-3), fi(3), fi(6)];
  if (a === null || b === null || x === null || y === null) return false;
  return Math.abs(x - b - (b - a + (y - x))) > QUIEBRO;
}

/** Los saltos de una fila de píxeles seguidos, a `paso` mm, con su sitio. */
function saltosDeLaFila(fila: readonly (readonly Capa[])[], sitio: (k: number) => Pt, paso: number, dir: V, d: V): Salto[] {
  const r: Salto[] = [];
  for (let k = 1; k < fila.length; k++) {
    const capa = primeraQueSalta(fila[k - 1], fila[k], paso, dir, d);
    if (capa >= 0) r.push({ en: sitio(k - 0.5), visto: capa === 0 });
    if (k + 1 < fila.length) {
      const pliega = primeraQuePliega(fila[k - 1], fila[k + 1]);
      if (pliega >= 0) r.push({ en: sitio(k), visto: pliega === 0 });
    }
  }
  return r;
}

/** Los saltos a lo largo de una línea del papel, de `desde` en la dirección
 *  `dir` (unitaria en el papel), `largo` mm. */
function barre(p: PiezaCompilada, mira: Mirada, desde: Pt, dir: Pt, largo: number): Salto[] {
  const enPapel = (s: number): Pt => [desde[0] + dir[0] * s, desde[1] + dir[1] * s];
  const dirEspacio: V = suma(suma([0, 0, 0], mira.ejes[0], dir[0]), mira.ejes[1], dir[1]);
  const { d } = mira.rayo(0, 0);
  const pixel = (s: number) => {
    const [u, v] = enPapel(s);
    return capas(p, mira, u, v);
  };
  const saltos: Salto[] = [];
  const n = Math.floor(largo / PIXEL_GRUESO);
  let anterior = pixel(0);
  for (let i = 1; i <= n; i++) {
    const s = i * PIXEL_GRUESO;
    const actual = pixel(s);
    if (primeraQueSalta(anterior, actual, PIXEL_GRUESO, dirEspacio, d) >= 0) {
      /* Se baja al píxel fino entre los dos. */
      const pasos = Math.round(PIXEL_GRUESO / PIXEL);
      const fila = Array.from({ length: pasos + 1 }, (_, j) => (j === 0 ? anterior : j === pasos ? actual : pixel(s - PIXEL_GRUESO + j * PIXEL)));
      saltos.push(...saltosDeLaFila(fila, (k) => enPapel(s - PIXEL_GRUESO + k * PIXEL), PIXEL, dirEspacio, d));
    }
    anterior = actual;
  }
  return saltos;
}

/* ── La geometría del papel, propia ───────────────────────────────────── */

const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);

function aSegmento(p: Pt, a: Pt, b: Pt): number {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const L2 = dx * dx + dy * dy;
  const s = L2 === 0 ? 0 : Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L2));
  return Math.hypot(p[0] - a[0] - s * dx, p[1] - a[1] - s * dy);
}

function aForma(p: Pt, f: Forma2): number {
  if (f.tipo === 'segmento') return aSegmento(p, f.a, f.b);
  if (f.tipo === 'polilinea') return Math.min(...f.puntos.slice(1).map((q, i) => aSegmento(p, f.puntos[i], q)));
  const ang = ((Math.atan2(p[1] - f.c[1], p[0] - f.c[0]) * 180) / Math.PI + 360) % 360;
  const dentroDelArco = f.hasta - f.desde >= 360 || (((ang - f.desde) % 360) + 360) % 360 <= f.hasta - f.desde;
  if (dentroDelArco) return Math.abs(dist(p, f.c) - f.r);
  const punta = (a: number): Pt => [f.c[0] + f.r * Math.cos((a * Math.PI) / 180), f.c[1] + f.r * Math.sin((a * Math.PI) / 180)];
  return Math.min(dist(p, punta(f.desde)), dist(p, punta(f.hasta)));
}

/** Puntos a lo largo de una forma, cada `paso` mm, con su normal en el
 *  papel. */
function cuerdas(f: Forma2): [Pt, Pt][] {
  if (f.tipo === 'segmento') return [[f.a, f.b]];
  if (f.tipo === 'polilinea') return f.puntos.slice(1).map((q, i) => [f.puntos[i], q] as [Pt, Pt]);
  const n = Math.max(2, Math.ceil(((f.hasta - f.desde) * Math.PI * f.r) / 180 / 0.05));
  const punto = (k: number): Pt => {
    const a = ((f.desde + ((f.hasta - f.desde) * k) / n) * Math.PI) / 180;
    return [f.c[0] + f.r * Math.cos(a), f.c[1] + f.r * Math.sin(a)];
  };
  return Array.from({ length: n }, (_, k) => [punto(k), punto(k + 1)] as [Pt, Pt]);
}

function recorre(f: Forma2, paso: number): { p: Pt; n: Pt; s: number; largo: number }[] {
  const tramos = cuerdas(f);
  const largo = tramos.reduce((s, [a, b]) => s + dist(a, b), 0);
  const r: { p: Pt; n: Pt; s: number; largo: number }[] = [];
  let acumulado = 0;
  let siguiente = paso / 2;
  for (const [a, b] of tramos) {
    const l = dist(a, b);
    while (siguiente <= acumulado + l && l > 0) {
      const t = (siguiente - acumulado) / l;
      r.push({ p: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], n: [-(b[1] - a[1]) / l, (b[0] - a[0]) / l], s: siguiente, largo });
      siguiente += paso;
    }
    acumulado += l;
  }
  return r;
}

/* ── La comparación ───────────────────────────────────────────────────── */

/** Lo que el oráculo no casa con el motor en una vista: frases, vacío si
 *  todo casa. */
function desacuerdos(p: PiezaCompilada, id: Id, m: Marco, vista: VistaCalculada): string[] {
  const mira = mirada(id, m);
  const r: string[] = [];
  const [u0, u1, v0, v1] = mira.ventana;
  const tramos = vista.tramos;
  const cerca = (q: Pt, tipo?: 'visto' | 'oculto') => tramos.some((t) => (!tipo || t.tipo === tipo) && aForma(q, t.forma) < CASA);

  /* Cada salto del oráculo, sobre un tramo: si es de la primera capa, sobre
     uno visto; si es de las demás, sobre cualquiera (una oculta que cae
     bajo una vista es la vista, por prioridad). */
  const saltos: Salto[] = [];
  for (let v = v0 + 0.137; v < v1; v += ENTRE_BARRIDOS) saltos.push(...barre(p, mira, [u0 + 0.0371, v], [1, 0], u1 - u0 - 0.1));
  for (let u = u0 + 0.137; u < u1; u += ENTRE_BARRIDOS) saltos.push(...barre(p, mira, [u, v0 + 0.0371], [0, 1], v1 - v0 - 0.1));
  for (const s of saltos) {
    if (!cerca(s.en, s.visto ? 'visto' : undefined)) {
      r.push(`${id}: el oráculo ve un salto ${s.visto ? 'visto' : 'oculto'} en (${s.en[0].toFixed(2)}, ${s.en[1].toFixed(2)}) y el motor no tiene ahí ningún tramo${s.visto ? ' visto' : ''}`);
    }
  }

  /* Cada tramo del motor, sobre un salto de su clase: se mira a través de
     él, cada milímetro, lejos de sus extremos y de los demás tramos. */
  const { d } = mira.rayo(0, 0);
  tramos.forEach((t, i) => {
    for (const { p: q, n, s, largo } of recorre(t.forma, 1)) {
      if (s < LEJOS || s > largo - LEJOS) continue;
      if (tramos.some((o, j) => j !== i && aForma(q, o.forma) < LEJOS)) continue;
      const desde: Pt = [q[0] - n[0] * A_CADA_LADO * PIXEL, q[1] - n[1] * A_CADA_LADO * PIXEL];
      const dirEspacio: V = suma(suma([0, 0, 0], mira.ejes[0], n[0]), mira.ejes[1], n[1]);
      const pixeles = Array.from({ length: 2 * A_CADA_LADO + 1 }, (_, k) => capas(p, mira, desde[0] + n[0] * k * PIXEL, desde[1] + n[1] * k * PIXEL));
      const saltosAqui = saltosDeLaFila(pixeles, (k) => [desde[0] + n[0] * k * PIXEL, desde[1] + n[1] * k * PIXEL], PIXEL, dirEspacio, d);
      const junto = saltosAqui.filter((x) => dist(x.en, q) < CASA);
      const hayVisto = junto.some((x) => x.visto);
      const hayOculto = junto.some((x) => !x.visto);
      /* Un pliegue suave solo sirve para dar por bueno un tramo, nunca para
         acusar a un oculto de verse: en la primera capa, para uno visto; en
         las de atrás, para uno oculto. */
      const cuantasCapas = pixeles[A_CADA_LADO].length;
      const suaveVisto = pliegaSuave(pixeles, A_CADA_LADO, dirEspacio, d, 0);
      const suaveOculto = Array.from({ length: Math.max(0, cuantasCapas - 1) }, (_, k) => k + 1).some((k) => pliegaSuave(pixeles, A_CADA_LADO, dirEspacio, d, k));
      const donde = `(${q[0].toFixed(2)}, ${q[1].toFixed(2)})`;
      if (t.tipo === 'visto' && !hayVisto && !suaveVisto) r.push(`${id}: el motor dibuja vista la línea por ${donde} y el oráculo no ve ahí ningún salto de la primera capa`);
      if (t.tipo === 'oculto' && ((!hayOculto && !suaveOculto) || hayVisto)) {
        r.push(`${id}: el motor dibuja oculta la línea por ${donde} y el oráculo ${hayVisto ? 'la ve' : 'no ve ahí ningún salto'}`);
      }
    }
  });
  return [...new Set(r)];
}

/** Compara el oráculo con el motor. `estropea` cambia lo que da el motor
 *  antes de comparar: es para validar al revés el propio oráculo. */
function comparaConElMotor(
  d: PiezaDeclarada,
  m: Marco,
  opciones: OpcionesDelMotor = {},
  estropea: (id: Id, v: VistaCalculada) => VistaCalculada = (_, v) => v,
): string[] {
  const p = compilaPieza(d);
  const v = calculaVistas(p, opciones);
  return (['alzado', 'planta', 'perfil'] as const).flatMap((id) => desacuerdos(p, id, m, estropea(id, v.vistas[id])));
}

/* ── Las piezas ───────────────────────────────────────────────────────── */

const caja = (x: Pt, y: Pt, z: Pt): Marco => ({ x, y, z });

const cilZ = (nombre: string, centro: [number, number], r: number) => ({ nombre, cilindro: { eje: 'z' as const, centro, r, desde: 0, hasta: 20 } });
const conoZ = (nombre: string, r0: number, r1: number, desde: number, hasta: number) => ({ nombre, cono: { eje: 'z' as const, centro: [20, 20] as [number, number], r0, r1, desde, hasta } });
const pieza = (codigo: string, p: Omit<PiezaDeclarada, 'codigo' | 'fuente'>): PiezaDeclarada => ({ codigo, fuente: `Pieza de prueba del revisor: ${codigo}.`, ...p });
const TUBO_V = { nombre: 'v', cilindro: { eje: 'z' as const, centro: [0, 0] as [number, number], r: 10, desde: 0, hasta: 40 } };
const tuboH = (centro: [number, number], r = 10, gira?: { eje: 'z'; grados: number }) => ({ nombre: 'h', cilindro: { eje: 'x' as const, centro, r, desde: -20, hasta: 20 }, ...(gira ? { gira } : {}) });
const BLOQUE = { nombre: 'bloque', caja: [0, 40, 0, 40, 0, 20] as [number, number, number, number, number, number] };
/* Los casos con que el revisor probó el motor en su segunda revisión (9 de
   octubre de 2026), con el marco que cubre la pieza entera: con uno más
   pequeño el rayo acaba dentro de la materia y salen desacuerdos falsos. */
const REVISOR: (readonly [string, PiezaDeclarada, Marco])[] = [
  ['paralelos a 0,5 mm', pieza('p1', { suma: [cilZ('a', [0, 0], 10), cilZ('b', [0.5, 0], 10)] }), caja([-10, 11], [-10, 10], [0, 20])],
  ['paralelos tangentes por fuera', pieza('p2', { suma: [cilZ('a', [0, 0], 10), cilZ('b', [20, 0], 10)] }), caja([-10, 30], [-10, 10], [0, 20])],
  ['paralelos de distinto radio', pieza('p3', { suma: [cilZ('a', [0, 0], 10), cilZ('b', [12, 3], 6)] }), caja([-10, 18], [-10, 10], [0, 20])],
  ['paralelos restados', pieza('p4', { suma: [{ nombre: 'bl', caja: [-20, 30, -20, 20, 0, 20] }], resta: [cilZ('a', [0, 0], 10), cilZ('b', [12, 0], 10)] }), caja([-20, 30], [-20, 20], [0, 20])],
  ['avellanado que entra en el taladro', pieza('a1', { suma: [BLOQUE], resta: [{ nombre: 't', cilindro: { eje: 'z', centro: [20, 20], r: 4 } }, conoZ('a', 3, 9, 14, 21)] }), caja([0, 40], [0, 40], [0, 20])],
  ['avellanado al revés', pieza('a2', { suma: [BLOQUE], resta: [{ nombre: 't', cilindro: { eje: 'z', centro: [20, 20], r: 4 } }, conoZ('a', 9, 3, 14, 21)] }), caja([0, 40], [0, 40], [0, 20])],
  ['cono y cilindro paralelos', pieza('c1', { suma: [{ nombre: 'a', cono: { eje: 'z', centro: [0, 0], r0: 10, r1: 5, desde: 0, hasta: 20 } }, cilZ('b', [8, 0], 6)] }), caja([-10, 14], [-10, 10], [0, 20])],
  ['tubos girados 45°', pieza('x2', { suma: [TUBO_V, tuboH([0, 20], 10, { eje: 'z', grados: 45 })] }), caja([-22, 22], [-22, 22], [0, 40])],
  ['taladro descentrado 2 mm', pieza('x3', { suma: [TUBO_V], resta: [{ nombre: 'h', cilindro: { eje: 'x', centro: [2, 20], r: 10 } }] }), caja([-10, 10], [-10, 10], [0, 40])],
  ['tres tubos', pieza('x4', { suma: [TUBO_V, tuboH([0, 20]), { nombre: 'k', cilindro: { eje: 'y', centro: [0, 20], r: 10, desde: -20, hasta: 20 } }] }), caja([-20, 20], [-20, 20], [0, 40])],
  ['desmoldeo de 3°', pieza('d1', { suma: [{ nombre: 'a', prisma: { plano: 'xz', poligono: [[0, 0], [20, 0], [21.05, 20], [-1.05, 20]], desde: 0, hasta: 10 } }] }), caja([-2, 22], [0, 10], [0, 20])],
  ['tubos r 6 a 5 mm', pieza('y2', { suma: [TUBO_V, tuboH([5, 20], 6)] }), caja([-20, 20], [-10, 11], [0, 40])],
  ['tubos r 4 a 3 mm', pieza('y3', { suma: [TUBO_V, tuboH([3, 20], 4)] }), caja([-20, 20], [-10, 10], [0, 40])],
];

/* Fuera, con su motivo: el eje con un taladro de su mismo radio. Junto a la
   X de su alzado la materia es una cuña que se afila hasta cero, más
   delgada que el paso con que el oráculo avanza por el rayo; el oráculo la
   ve aparecer y desaparecer a medio milímetro de la línea. El motor la
   dibuja bien (motor.test.ts) y el oráculo no puede decirlo; se volvió a
   probar con el paso del rayo a 0,1 mm, y tampoco. */
const CASOS: readonly (readonly [string, PiezaDeclarada, Marco])[] = [
  ['dos cajas en L', L_DE_DOS_CAJAS, caja([0, 60], [0, 40], [0, 30])],
  ['la L como prisma', L_PRISMA, caja([0, 60], [0, 40], [0, 30])],
  ['placa con redondeo tangente', PLACA_REDONDEADA, caja([0, 20], [0, 40], [0, 10])],
  ['ranura en V (arista cóncava)', RANURA_EN_V, caja([0, 60], [0, 40], [0, 20])],
  ['bloque con taladro pasante', BLOQUE_TALADRADO, caja([0, 60], [0, 40], [0, 20])],
  ['columna sobre base (contorno aparente)', COLUMNA_EN_BASE, caja([0, 60], [0, 40], [0, 40])],
  ['tronco de cono', TRONCO_DE_CONO, caja([-10, 10], [-10, 10], [0, 20])],
  ['eje con taladro transversal', EJE_TALADRADO, caja([-10, 10], [-10, 10], [0, 40])],
  ['cilindros de ejes paralelos', CILINDROS_PARALELOS, caja([-10, 22], [-10, 10], [0, 20])],
  ['dos tubos del mismo radio cruzados', CRUZ_DE_TUBOS, caja([-20, 20], [-10, 10], [0, 40])],
  ['taladro avellanado', AVELLANADO, caja([0, 40], [0, 40], [0, 20])],
  ['agujero ciego con punta', AGUJERO_CIEGO, caja([0, 40], [0, 40], [0, 30])],
  ['cubos que se tocan por una arista', CONTACTO_POR_ARISTA, caja([0, 20], [0, 10], [0, 20])],
  ['cubos que se tocan por un vértice', CONTACTO_POR_VERTICE, caja([0, 20], [0, 20], [0, 20])],
  ['chaflán sin «dentro»', CHAFLAN_SIN_DENTRO, caja([0, 40], [0, 20], [0, 20])],
  ['muesca coplanaria con un bloque', MUESCA_COPLANARIA, caja([0, 40], [0, 20], [0, 30])],
  ['primitivas giradas', GIRADAS, caja([-25, 25], [-15, 15], [0, 20])],
  ['tubos de ejes que se cruzan, r 10 a 3 mm', tubosDescentrados(10, 3), caja([-20, 20], [-10, 13], [0, 40])],
  /* Este no lo caza el oráculo si el motor falla: con la arista partida
     (segunda revisión del 9 de octubre de 2026), sus huecos eran cuatro de
     unos 0,6 mm detrás del tubo vertical, y ningún punto de la curva quedaba
     a más de 0,32 mm del tramo más cercano. El oráculo casa a CASA (0,25 mm)
     y barre cada ENTRE_BARRIDOS (2 mm): está por debajo de lo que ve. No es
     LEJOS, que solo aparta las muestras de los tramos del motor. Se queda
     porque sí comprueba todo lo demás de la pieza; el hueco lo vigila el
     test de la curva entera de motor.test.ts. */
  ['tubos de ejes que se cruzan, r 8 a 3 mm', tubosDescentrados(8, 3), caja([-20, 20], [-10, 11], [0, 40])],
  ...REVISOR,
];

describe('el oráculo casa con el motor, salto a salto y tramo a tramo', () => {
  it.each(CASOS)('%s', (_, pieza, marco) => {
    expect(comparaConElMotor(pieza, marco)).toEqual([]);
  }, 60_000);

  it('la pieza de la espiga (RI-V1)', () => {
    expect(comparaConElMotor(piezaDeLaEspiga(), caja([0, 80], [0, 50], [0, 50]))).toEqual([]);
  }, 120_000);

});

describe('el oráculo, validado al revés: caza cada error metido a propósito', () => {
  const L = caja([0, 60], [0, 40], [0, 30]);
  const sobre = (f: Forma2, a: Pt, b: Pt) => f.tipo === 'segmento' && aSegmento(f.a, a, b) < 0.01 && aSegmento(f.b, a, b) < 0.01;

  it('el motor erosionando primitiva a primitiva: la junta, vista en el perfil', () => {
    const fallos = comparaConElMotor(L_DE_DOS_CAJAS, L, { erosion: 'primitiva' });
    expect(fallos.some((f) => f.startsWith('perfil: el motor dibuja vista') && f.includes(', -10.00)'))).toBe(true);
  }, 60_000);

  it('un tramo de menos: sin la oculta de la junta en el perfil', () => {
    const fallos = comparaConElMotor(L_DE_DOS_CAJAS, L, {}, (id, v) =>
      id === 'perfil' ? { ...v, tramos: v.tramos.filter((t) => !sobre(t.forma, [-40, -10], [0, -10])) } : v,
    );
    expect(fallos.some((f) => f.startsWith('perfil: el oráculo ve un salto oculto'))).toBe(true);
  }, 60_000);

  it('un tramo de más: la línea de la junta en el alzado, donde las dos caras están en el mismo plano', () => {
    const fallos = comparaConElMotor(L_DE_DOS_CAJAS, L, {}, (id, v) =>
      id === 'alzado' ? { ...v, tramos: [...v.tramos, { forma: { tipo: 'segmento', a: [0, -10], b: [20, -10] }, tipo: 'visto', porque: '', de: [] }] } : v,
    );
    expect(fallos.some((f) => f.startsWith('alzado: el motor dibuja vista la línea por') && f.includes(', -10.00)'))).toBe(true);
  }, 60_000);

  it('un tramo del otro tipo: el escalón de la planta, pasado a oculto', () => {
    const fallos = comparaConElMotor(L_DE_DOS_CAJAS, L, {}, (id, v) =>
      id === 'planta' ? { ...v, tramos: v.tramos.map((t) => (sobre(t.forma, [20, 0], [20, -40]) ? { ...t, tipo: 'oculto' as const } : t)) } : v,
    );
    expect(fallos.some((f) => f.startsWith('planta: el motor dibuja oculta la línea por (20.00') && f.includes('la ve'))).toBe(true);
  }, 60_000);
});
