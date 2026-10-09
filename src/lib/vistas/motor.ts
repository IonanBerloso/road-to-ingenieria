/**
 * El motor de vistas (diseño de la fase M, §3.2): de una pieza descrita
 * como datos, el alzado, la planta y el perfil izquierdo del sistema
 * europeo, con cada línea vista u oculta y su porqué, los ejes de los
 * cilindros y conos, y el catálogo de las líneas que no existen con su
 * motivo.
 *
 * LOS PASOS, EN ORDEN:
 *   1. las candidatas (`candidatas.ts`), las que no dependen de la vista y
 *      los contornos aparentes de cada una;
 *   2. la prueba del pliegue a lo largo de cada candidata (`pliegue.ts`),
 *      que la parte en aristas y en descartes con su motivo;
 *   3. la visibilidad de cada arista, con el rayo contra la pieza erosionada
 *      (`rayo.ts`), afinando por bisección dónde cambia;
 *   4. la proyección al papel (`proyeccion.ts`), la fusión con prioridad y
 *      el partir en los cruces (`plano2d.ts`);
 *   5. los ejes, que no tapan nada y se quitan donde coinciden con una
 *      arista (la traza tapa al eje, NyV p. 4).
 *
 * SIN CORTES. Esto es M1: los cortes, las secciones y el rayado son M3.
 *
 * Lo que se publica de aquí lo calcula el build desde la pieza y nunca se
 * dibuja a mano (§13, caso 2); el segundo camino que lo vigila es el
 * oráculo de `tests/vistas/oraculo.test.ts` (§10).
 */
import type { P2 } from '../diedrico.ts';
import { candidatasFijas, contornos, type Candidata } from './candidatas.ts';
import { trozo, type CurvaRecorrida } from './curvas.ts';
import type { Ocultas, PiezaCompilada } from './pieza.ts';
import { pliegueEn, rachasDe, type Racha } from './pliegue.ts';
import {
  encuadreDe,
  fundeAstillas,
  fundeConPrioridad,
  largoDe,
  parteEnLosCruces,
  quitaLoTapado,
  reconoce,
  type Forma2,
  type Trazo,
} from './plano2d.ts';
import { ORDEN_DE_VISTAS, VISTAS, proyectaCurva, type Vista, type VistaId } from './proyeccion.ts';
import { loQueTapa, type Erosion } from './rayo.ts';
import { superficieDe, puntoDeSuperficie, radioDeSuperficie } from './superficies.ts';
import { BISECCIONES, BORDE_VISIBILIDAD, DESCARTE_MINIMO, HOLGURA_NUMERICA, LARGO_MINIMO, PASO_MUESTREO, SOBRESALE_EJE } from './tolerancias.ts';
import { avanza3, escalar3, resta3, type V3 } from './vector.ts';

export interface OpcionesDelMotor {
  /** Solo para validar al revés los tests: «primitiva» es la erosión que
   *  falló en la espiga. Por defecto, «pieza». */
  readonly erosion?: Erosion;
}

export type TipoDeTramo = 'visto' | 'oculto';

/** Una línea de la vista con su tipo, partida en cada cruce. */
export interface TramoDeVista {
  readonly forma: Forma2;
  readonly tipo: TipoDeTramo;
  /** Lo que se le dice a quien la pasa del otro tipo. */
  readonly porque: string;
  /** Las primitivas de las que sale. */
  readonly de: readonly string[];
}

export interface EjeDeVista {
  readonly a: P2;
  readonly b: P2;
  readonly de: readonly string[];
}

export type Motivo = 'mismo-plano' | 'tangencia';

/** Una línea que no existe, con su motivo: el catálogo de errores (§3.5). */
export interface DescarteDeVista {
  readonly forma: Forma2;
  readonly motivo: Motivo;
  readonly primitivas: readonly string[];
  readonly mensaje: string;
  readonly fuente: string;
}

export interface Encuadre {
  readonly umin: number;
  readonly umax: number;
  readonly vmin: number;
  readonly vmax: number;
}

export interface VistaCalculada {
  readonly vista: VistaId;
  readonly tramos: readonly TramoDeVista[];
  readonly ejes: readonly EjeDeVista[];
  readonly descartes: readonly DescarteDeVista[];
  /** Lo que ocupan sus tramos en el papel. */
  readonly encuadre: Encuadre;
}

export interface VistasCalculadas {
  readonly codigo: string;
  readonly ocultas: Ocultas;
  readonly vistas: Readonly<Record<VistaId, VistaCalculada>>;
}

const FUENTE: Record<Motivo, string> = {
  'mismo-plano': 'piloto B del paquete de diseño; NyV p. 11',
  tangencia: 'NyV p. 25',
};

const comillas = (n: string) => `«${n}»`;

function mensajeDe(motivo: Motivo, primitivas: readonly string[]): string {
  const [a, b] = [comillas(primitivas[0] ?? '?'), comillas(primitivas[1] ?? '?')];
  return motivo === 'mismo-plano'
    ? `${a} y ${b} están en el mismo plano: ahí no hay arista`
    : `entre ${a} y ${b} la superficie curva es tangente a la otra: donde una superficie curva es tangente a la plana no hay arista`;
}

/* ── La visibilidad a lo largo de una arista ──────────────────────────── */

interface TrozoVisto {
  readonly desde: number;
  readonly hasta: number;
  readonly tipo: TipoDeTramo;
  readonly porque: string;
}

/** Si el trozo de curva se ve de punta en la vista (un segmento paralelo a
 *  la mirada): entonces no hay nada que mirar. Se miran siete puntos a
 *  fracciones sin simetría, porque una circunferencia vista de canto lleva
 *  su principio, su mitad y su final al mismo sitio del papel. */
function dePunta(c: CurvaRecorrida, desde: number, hasta: number, v: Vista): boolean {
  const pts = [0, 0.13, 0.29, 0.5, 0.61, 0.83, 1].map((f) => v.aPapel(c.punto(desde + (hasta - desde) * f)));
  return Math.max(...pts.map((p) => Math.hypot(p[0] - pts[0][0], p[1] - pts[0][1]))) < LARGO_MINIMO;
}

function partePorVisibilidad(p: PiezaCompilada, c: CurvaRecorrida, r: Racha, v: Vista, erosion: Erosion): TrozoVisto[] {
  const { desde, hasta } = r;
  if (dePunta(c, desde, hasta, v)) return [];
  const tapa = (s: number) => loQueTapa(p, c.punto(s), v.haciaObservador, erosion);
  const L = hasta - desde;
  const n = Math.max(3, Math.ceil(L / PASO_MUESTREO) + 1);
  /* En el vértice mismo, los rayos vecinos de la erosión se salen por la
     cara de al lado y la arista oculta saldría vista sus primeros 0,05 mm. */
  const borde = Math.min(BORDE_VISIBILIDAD, L / 4);
  const pos = Array.from({ length: n }, (_, k) => desde + borde + ((L - 2 * borde) * k) / (n - 1));
  const visto = pos.map((s) => tapa(s) === null);
  const cortes = [desde];
  for (let k = 0; k + 1 < n; k++) {
    if (visto[k] === visto[k + 1]) continue;
    let [a, b] = [pos[k], pos[k + 1]];
    for (let i = 0; i < BISECCIONES; i++) {
      const m = (a + b) / 2;
      if ((tapa(m) === null) === visto[k]) a = m;
      else b = m;
    }
    cortes.push((a + b) / 2);
  }
  cortes.push(hasta);
  const r2: TrozoVisto[] = [];
  for (let k = 0; k + 1 < cortes.length; k++) {
    const m = (cortes[k] + cortes[k + 1]) / 2;
    const quien = tapa(m);
    r2.push({
      desde: cortes[k],
      hasta: cortes[k + 1],
      tipo: quien === null ? 'visto' : 'oculto',
      porque: quien === null ? 'se ve: entre la arista y quien mira no hay materia' : quien === '?' ? 'oculta: hay materia delante' : `oculta: la tapa ${comillas(quien)}`,
    });
  }
  return r2;
}

/* ── Los ejes ─────────────────────────────────────────────────────────── */

interface Presencia {
  readonly w0: number;
  readonly w1: number;
  readonly r: number;
}

/** Dónde está un cilindro o un cono en la piel de la pieza, a lo largo de su
 *  eje: el w más bajo y el más alto en que alguna de ocho generatrices es
 *  borde. Null si no asoma en ningún sitio. Se mira con la generatriz como
 *  tangente: en un cono no es el eje, y con el eje ningún cono llevaba eje
 *  (revisión del 9 de octubre de 2026). */
function presencia(p: PiezaCompilada, i: number): Presencia | null {
  const s = superficieDe(p.primitivas[i]);
  if (!s) return null;
  /* Por celdas, mirando su centro: en el borde mismo la normal de un cono,
     que se inclina, deja la prueba de piel fuera de la pieza. */
  const n = Math.max(1, Math.ceil((s.w1 - s.w0) / PASO_MUESTREO));
  const paso = (s.w1 - s.w0) / n;
  let [k0, k1, r] = [Infinity, -Infinity, 0];
  for (let j = 0; j < 8; j++) {
    const theta = (j * Math.PI) / 4 + 0.1;
    const generatriz = resta3(puntoDeSuperficie(s, theta, s.w1), puntoDeSuperficie(s, theta, s.w0));
    for (let k = 0; k < n; k++) {
      const w = s.w0 + (k + 0.5) * paso;
      if (pliegueEn(p, puntoDeSuperficie(s, theta, w), generatriz, true).estado !== 'arista') continue;
      k0 = Math.min(k0, k);
      k1 = Math.max(k1, k);
      r = Math.max(r, radioDeSuperficie(s, s.w0 + k * paso), radioDeSuperficie(s, s.w0 + (k + 1) * paso));
    }
  }
  return k1 >= k0 ? { w0: s.w0 + k0 * paso, w1: s.w0 + (k1 + 1) * paso, r } : null;
}

function ejesDe(p: PiezaCompilada, v: Vista, presencias: readonly (Presencia | null)[]): Trazo<'eje'>[] {
  const r: Trazo<'eje'>[] = [];
  const mete = (a: P2, b: P2, nombre: string) => r.push({ forma: { tipo: 'segmento', a, b }, clase: 'eje', de: [nombre], texto: '' });
  p.primitivas.forEach((prim, i) => {
    const s = superficieDe(prim);
    const donde = presencias[i];
    if (!s || !donde) return;
    if (Math.abs(escalar3(s.eje, v.haciaObservador)) > 1 - HOLGURA_NUMERICA) {
      /* De frente: una cruz. */
      const c = v.aPapel(avanza3(s.o, s.eje, donde.w0));
      const largo = donde.r + SOBRESALE_EJE;
      mete([c[0] - largo, c[1]], [c[0] + largo, c[1]], prim.nombre);
      mete([c[0], c[1] - largo], [c[0], c[1] + largo], prim.nombre);
      return;
    }
    const forma = reconoce([v.aPapel(avanza3(s.o, s.eje, donde.w0 - SOBRESALE_EJE)), v.aPapel(avanza3(s.o, s.eje, donde.w1 + SOBRESALE_EJE))]);
    if (forma?.tipo === 'segmento') mete(forma.a, forma.b, prim.nombre);
  });
  /* Los planos de simetría declarados, en las vistas que los ven de canto:
     de lado a lado de la pieza, sobresaliendo como los ejes. */
  for (const sim of p.simetria) {
    const k = 'xyz'.indexOf(sim.plano);
    if (Math.abs(v.haciaObservador[k]) > HOLGURA_NUMERICA) continue;
    const [i, j] = [0, 1, 2].filter((x) => x !== k);
    const esquina = (a: number, b: number): V3 => {
      const q: [number, number, number] = [0, 0, 0];
      q[k] = sim.en;
      q[i] = a;
      q[j] = b;
      return q;
    };
    const [lo0, hi0, lo1, hi1] = [p.caja.min[i], p.caja.max[i], p.caja.min[j], p.caja.max[j]];
    const forma = reconoce([esquina(lo0, lo1), esquina(hi0, lo1), esquina(hi0, hi1), esquina(lo0, hi1)].map(v.aPapel));
    if (forma?.tipo !== 'segmento') continue;
    const [a, b] = [forma.a, forma.b];
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const [ux, uy] = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
    mete([a[0] - ux * SOBRESALE_EJE, a[1] - uy * SOBRESALE_EJE], [b[0] + ux * SOBRESALE_EJE, b[1] + uy * SOBRESALE_EJE], `simetría ${sim.plano} = ${sim.en}`);
  }
  return r;
}

/* ── El motor ─────────────────────────────────────────────────────────── */

interface Recorrida {
  readonly candidata: Candidata;
  readonly rachas: readonly Racha[];
}

function encuadreDeTramos(tramos: readonly TramoDeVista[]): Encuadre {
  const cajas = tramos.map((t) => encuadreDe(t.forma));
  return {
    umin: Math.min(...cajas.map((c) => c.umin)),
    umax: Math.max(...cajas.map((c) => c.umax)),
    vmin: Math.min(...cajas.map((c) => c.vmin)),
    vmax: Math.max(...cajas.map((c) => c.vmax)),
  };
}

function calculaVista(p: PiezaCompilada, v: Vista, fijas: readonly Recorrida[], presencias: readonly (Presencia | null)[], erosion: Erosion): VistaCalculada {
  const propias: Recorrida[] = contornos(p, v.haciaObservador).map((candidata) => ({ candidata, rachas: rachasDe(p, candidata) }));
  const trazos: Trazo<TipoDeTramo>[] = [];
  const descartes: Trazo<Motivo>[] = [];
  for (const { candidata: c, rachas } of [...fijas, ...propias]) {
    const de = c.de.map((i) => p.primitivas[i].nombre);
    for (const r of rachas) {
      if (r.estado === 'arista') {
        for (const t of partePorVisibilidad(p, c.curva, r, v, erosion)) {
          for (const forma of proyectaCurva(trozo(c.curva, t.desde, t.hasta), v)) trazos.push({ forma, clase: t.tipo, de, texto: t.porque });
        }
      } else if (r.estado === 'mismo-plano' || r.estado === 'tangencia') {
        const motivo = r.estado;
        for (const forma of proyectaCurva(trozo(c.curva, r.desde, r.hasta), v)) descartes.push({ forma, clase: motivo, de: r.primitivas, texto: mensajeDe(motivo, r.primitivas) });
      }
    }
  }
  const tramos: TramoDeVista[] = fundeAstillas(parteEnLosCruces(fundeConPrioridad<TipoDeTramo>(trazos, ['visto', 'oculto']))).map((t) => ({
    forma: t.forma,
    tipo: t.clase,
    porque: t.texto,
    de: t.de,
  }));
  if (!tramos.length) throw new Error(`no tiene ni una arista en el ${v.nombre}: la pieza está vacía`);
  const encuadre = encuadreDeTramos(tramos);
  const formas = tramos.map((t) => t.forma);
  const ejes = quitaLoTapado(fundeConPrioridad<'eje'>(ejesDe(p, v, presencias), ['eje']), formas)
    .filter((e) => e.forma.tipo === 'segmento')
    .map((e) => {
      const f = e.forma as Extract<Forma2, { tipo: 'segmento' }>;
      return { a: f.a, b: f.b, de: e.de };
    });
  /* Un descarte que no nombra dos primitivas no dice nada a quien lo lee:
     no se publica. */
  const catalogo = quitaLoTapado(fundeConPrioridad<Motivo>(descartes, ['tangencia', 'mismo-plano']), formas)
    .filter((d) => largoDe(d.forma) >= DESCARTE_MINIMO && d.de.length >= 2)
    .map((d) => ({ forma: d.forma, motivo: d.clase, primitivas: d.de, mensaje: mensajeDe(d.clase, d.de), fuente: FUENTE[d.clase] }));
  return { vista: v.id, tramos, ejes, descartes: catalogo, encuadre };
}

/** Las tres vistas de la pieza. Si algo falla, el error lleva el código de
 *  la pieza delante. */
export function calculaVistas(p: PiezaCompilada, opciones: OpcionesDelMotor = {}): VistasCalculadas {
  const erosion = opciones.erosion ?? 'pieza';
  try {
    const fijas: Recorrida[] = candidatasFijas(p).map((candidata) => ({ candidata, rachas: rachasDe(p, candidata) }));
    const presencias = p.primitivas.map((_, i) => presencia(p, i));
    const vistas = Object.fromEntries(ORDEN_DE_VISTAS.map((id) => [id, calculaVista(p, VISTAS[id], fijas, presencias, erosion)])) as Record<VistaId, VistaCalculada>;
    return { codigo: p.codigo, ocultas: p.ocultas, vistas };
  } catch (err) {
    throw new Error(`la pieza ${p.codigo}: ${(err as Error).message}`);
  }
}
