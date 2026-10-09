/**
 * Las ayudas de los tests del motor de vistas: calcular una pieza una sola
 * vez, y medir qué cubre una vista sobre un segmento o una circunferencia.
 */
import type { P2 } from '../../src/lib/diedrico';
import { compilaPieza, type PiezaDeclarada } from '../../src/lib/vistas/pieza.ts';
import { calculaVistas, type OpcionesDelMotor, type VistaCalculada, type VistasCalculadas } from '../../src/lib/vistas/motor.ts';
import type { Forma2 } from '../../src/lib/vistas/plano2d.ts';

/* La caché va por la pieza entera, no por su código: dos piezas de prueba
   con el mismo código no se pisan. */
const cache = new Map<string, VistasCalculadas>();

export function vistasDe(d: PiezaDeclarada, opciones: OpcionesDelMotor = {}): VistasCalculadas {
  const clave = `${JSON.stringify(d)}|${opciones.erosion ?? 'pieza'}`;
  const ya = cache.get(clave);
  if (ya) return ya;
  const v = calculaVistas(compilaPieza(d), opciones);
  cache.set(clave, v);
  return v;
}

export const TOL = 0.05;
export const dist = (p: P2, q: P2) => Math.hypot(p[0] - q[0], p[1] - q[1]);

/** Parámetro de p sobre ab (0 en a, 1 en b) y su distancia a la recta. */
function sobreRecta(p: P2, a: P2, b: P2): { s: number; d: number } {
  const L = dist(a, b);
  const ux = (b[0] - a[0]) / L;
  const uy = (b[1] - a[1]) / L;
  const s = ((p[0] - a[0]) * ux + (p[1] - a[1]) * uy) / L;
  const d = Math.abs((p[0] - a[0]) * uy - (p[1] - a[1]) * ux);
  return { s, d };
}

/** Cuántos mm del segmento ab cubren los segmentos de esa lista. */
export function cubiertoPor(formas: readonly Forma2[], a: P2, b: P2): number {
  const L = dist(a, b);
  const trozos: [number, number][] = [];
  for (const f of formas) {
    if (f.tipo !== 'segmento') continue;
    const p = sobreRecta(f.a, a, b);
    const q = sobreRecta(f.b, a, b);
    if (p.d > TOL || q.d > TOL) continue;
    const lo = Math.max(0, Math.min(p.s, q.s));
    const hi = Math.min(1, Math.max(p.s, q.s));
    if (hi > lo) trozos.push([lo, hi]);
  }
  trozos.sort((x, y) => x[0] - y[0]);
  let total = 0;
  let hasta = 0;
  for (const [lo, hi] of trozos) {
    const desde = Math.max(lo, hasta);
    if (hi > desde) total += hi - desde;
    hasta = Math.max(hasta, hi);
  }
  return total * L;
}

export const cubierto = (v: VistaCalculada, a: P2, b: P2, tipo: 'visto' | 'oculto') =>
  cubiertoPor(
    v.tramos.filter((t) => t.tipo === tipo).map((t) => t.forma),
    a,
    b,
  );

export const cualquiera = (v: VistaCalculada, a: P2, b: P2) => cubierto(v, a, b, 'visto') + cubierto(v, a, b, 'oculto');

/** Los grados de la circunferencia (c, r) que cubren los tramos de ese tipo. */
export function gradosDe(v: VistaCalculada, c: P2, r: number, tipo: 'visto' | 'oculto'): number {
  const arcos = v.tramos
    .filter((t) => t.tipo === tipo && t.forma.tipo === 'arco')
    .map((t) => t.forma as Extract<Forma2, { tipo: 'arco' }>)
    .filter((f) => dist(f.c, c) < TOL && Math.abs(f.r - r) < TOL);
  return arcos.reduce((s, f) => s + (f.hasta - f.desde), 0);
}

/** Los descartes que van por el segmento ab. */
export const descarteSobre = (v: VistaCalculada, a: P2, b: P2) => v.descartes.filter((d) => cubiertoPor([d.forma], a, b) > 0.5 * dist(a, b));

/** Si los ejes de la vista cubren el segmento ab. */
export const ejeSobre = (v: VistaCalculada, a: P2, b: P2) =>
  cubiertoPor(
    v.ejes.map((e) => ({ tipo: 'segmento', a: e.a, b: e.b }) as const),
    a,
    b,
  ) >
  dist(a, b) - TOL;

/** La firma de los tramos de una vista, para comparar dos piezas que
 *  tienen que dibujarse igual. */
export const firma = (v: VistaCalculada) =>
  v.tramos
    .map((t) => {
      const f = t.forma;
      if (f.tipo !== 'segmento') return `${t.tipo} ${f.tipo}`;
      const [p, q] = [f.a, f.b].sort((x, y) => x[0] - y[0] || x[1] - y[1]);
      return `${t.tipo} ${p.map((n) => n.toFixed(2))} ${q.map((n) => n.toFixed(2))}`;
    })
    .sort();
