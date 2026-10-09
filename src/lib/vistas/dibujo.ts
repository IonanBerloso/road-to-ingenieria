/**
 * Las vistas calculadas, en SVG, para mirarlas (§3.3): el alzado arriba a
 * la izquierda, la planta debajo y el perfil izquierdo a la derecha, como
 * manda el sistema europeo.
 *
 * Las reglas son las del lienzo de las figuras (`scripts/figuras/lienzo.mjs`,
 * §17): solo tokens y ni un color escrito a mano —con `currentColor` de
 * respaldo, para que el fichero suelto se vea fuera del sitio—; la etiqueta
 * `<svg>` en una línea; ids con prefijo; `<title>` y `<desc>`; y nada fuera
 * del `viewBox`, que aquí se comprueba al dibujar y lanza. Las clases son
 * las de la lámina del Taller: `vista`, `oculta` y `eje`.
 *
 * Es una salida para revisar, no la figura de un ejercicio: esa la harán el
 * Taller de vistas (M2) y los guiones de figuras, con su lienzo.
 */
import type { P2 } from '../diedrico.ts';
import type { EjeDeVista, Encuadre, TramoDeVista, VistasCalculadas } from './motor.ts';
import { polaridades, type PiezaCompilada } from './pieza.ts';
import { encuadreDe, type Forma2 } from './plano2d.ts';
import { ORDEN_DE_VISTAS, VISTAS, type VistaId } from './proyeccion.ts';
import { HOLGURA_NUMERICA } from './tolerancias.ts';

export interface OpcionesDeDibujo {
  /** El prefijo de los ids. */
  readonly id: string;
  /** Píxeles por mm del dibujo: solo cambia el tamaño en pantalla. */
  readonly escala?: number;
  /** El hueco entre vistas, en mm. */
  readonly separacion?: number;
  /** Lo que dice `<desc>`; si no, se cuenta lo que hay. */
  readonly descripcion?: string;
}

/** El margen alrededor del dibujo, en mm: cabe el rótulo de cada vista. */
const MARGEN = 8;
const ALTO_ROTULO = 3;

const n2 = (x: number) => (Math.round(x * 100) / 100 || 0).toString();

/** «Hecha de base y torre, con chaflán y agujero de la base»: la pieza
 *  contada por sus primitivas, para el `<desc>`. */
export function describePieza(p: PiezaCompilada): string {
  const quita = polaridades(p);
  const lista = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} y ${xs[xs.length - 1]}`);
  const suma = p.primitivas.filter((_, i) => !quita[i]).map((x) => x.nombre);
  const resta = p.primitivas.filter((_, i) => quita[i]).map((x) => x.nombre);
  return `La pieza ${p.codigo}, hecha de ${lista(suma)}${resta.length ? `, con ${lista(resta)}` : ''}`;
}

function cajaDeVista(tramos: readonly TramoDeVista[], ejes: readonly EjeDeVista[], e: Encuadre): Encuadre {
  const cajas = [e, ...ejes.map((x) => encuadreDe({ tipo: 'segmento', a: x.a, b: x.b })), ...tramos.map((t) => encuadreDe(t.forma))];
  return {
    umin: Math.min(...cajas.map((c) => c.umin)),
    umax: Math.max(...cajas.map((c) => c.umax)),
    vmin: Math.min(...cajas.map((c) => c.vmin)),
    vmax: Math.max(...cajas.map((c) => c.vmax)),
  };
}

/** Dónde va el origen de cada vista en la hoja, en mm: el alzado arriba a
 *  la izquierda, la planta debajo con la misma u, el perfil a la derecha
 *  con la misma v. */
export function colocaVistas(v: VistasCalculadas, separacion = 15): { origen: Record<VistaId, P2>; ancho: number; alto: number } {
  const caja = Object.fromEntries(ORDEN_DE_VISTAS.map((id) => [id, cajaDeVista(v.vistas[id].tramos, v.vistas[id].ejes, v.vistas[id].encuadre)])) as Record<VistaId, Encuadre>;
  const izquierda = Math.min(caja.alzado.umin, caja.planta.umin);
  const ua = MARGEN - izquierda;
  const va = MARGEN + ALTO_ROTULO - Math.min(caja.alzado.vmin, caja.perfil.vmin);
  const origen: Record<VistaId, P2> = {
    alzado: [ua, va],
    planta: [ua, va + Math.max(caja.alzado.vmax, caja.perfil.vmax) + separacion + ALTO_ROTULO - caja.planta.vmin],
    perfil: [ua + Math.max(caja.alzado.umax, caja.planta.umax) + separacion - caja.perfil.umin, va],
  };
  const ancho = Math.max(...ORDEN_DE_VISTAS.map((id) => origen[id][0] + caja[id].umax)) + MARGEN;
  const alto = Math.max(...ORDEN_DE_VISTAS.map((id) => origen[id][1] + caja[id].vmax)) + MARGEN;
  return { origen, ancho, alto };
}

function elemento(f: Forma2, clase: string, o: P2): string {
  const x = (u: number) => n2(u + o[0]);
  const y = (v: number) => n2(v + o[1]);
  if (f.tipo === 'segmento') return `<line x1="${x(f.a[0])}" y1="${y(f.a[1])}" x2="${x(f.b[0])}" y2="${y(f.b[1])}" class="${clase}"/>`;
  if (f.tipo === 'polilinea') return `<polyline points="${f.puntos.map((p) => `${x(p[0])},${y(p[1])}`).join(' ')}" class="${clase}"/>`;
  if (f.hasta - f.desde >= 360 - HOLGURA_NUMERICA) return `<circle cx="${x(f.c[0])}" cy="${y(f.c[1])}" r="${n2(f.r)}" class="${clase}"/>`;
  const punto = (a: number): P2 => [f.c[0] + f.r * Math.cos((a * Math.PI) / 180), f.c[1] + f.r * Math.sin((a * Math.PI) / 180)];
  const [p, q] = [punto(f.desde), punto(f.hasta)];
  const grande = f.hasta - f.desde > 180 ? 1 : 0;
  return `<path d="M ${x(p[0])} ${y(p[1])} A ${n2(f.r)} ${n2(f.r)} 0 ${grande} 1 ${x(q[0])} ${y(q[1])}" class="${clase}"/>`;
}

const escapa = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** El SVG de las tres vistas. Lanza si algo se sale del `viewBox`. */
export function svgDeVistas(v: VistasCalculadas, opciones: OpcionesDeDibujo): string {
  const { id } = opciones;
  const escala = opciones.escala ?? 4;
  const { origen, ancho, alto } = colocaVistas(v, opciones.separacion);
  const dibujaOcultas = v.ocultas !== 'ninguna';
  const cuenta = (tipo: string) => ORDEN_DE_VISTAS.reduce((s, k) => s + v.vistas[k].tramos.filter((t) => t.tipo === tipo).length, 0);
  const desc =
    opciones.descripcion ??
    `Alzado, planta y perfil izquierdo de la pieza ${v.codigo} en el sistema europeo, calculados: ${cuenta('visto')} tramos vistos, ${cuenta('oculto')} ocultos y los ejes de sus cilindros.`;
  const cuerpo: string[] = [];
  for (const k of ORDEN_DE_VISTAS) {
    const vista = v.vistas[k];
    const o = origen[k];
    const caja = cajaDeVista(vista.tramos, vista.ejes, vista.encuadre);
    cuerpo.push(`<g class="${k}">`);
    cuerpo.push(`<text x="${n2(caja.umin + o[0])}" y="${n2(caja.vmin + o[1] - 1.5)}" class="rotulo">${escapa(VISTAS[k].nombre.toUpperCase())}</text>`);
    for (const e of vista.ejes) cuerpo.push(elemento({ tipo: 'segmento', a: e.a, b: e.b }, 'eje', o));
    for (const t of vista.tramos) if (t.tipo === 'visto' || dibujaOcultas) cuerpo.push(elemento(t.forma, t.tipo === 'visto' ? 'vista' : 'oculta', o));
    cuerpo.push('</g>');
  }
  /* Nada fuera del marco: se comprueba cada número escrito. */
  for (const linea of cuerpo) {
    for (const m of linea.matchAll(/ (x1|x2|cx|x|y1|y2|cy|y)="(-?[\d.]+)"/g)) {
      const valor = Number(m[2]);
      const limite = m[1].startsWith('x') || m[1] === 'cx' ? ancho : alto;
      if (valor < 0 || valor > limite) throw new Error(`svgDeVistas: ${m[1]} = ${valor} se sale del viewBox (0 a ${n2(limite)})`);
    }
  }
  const estilo = [
    `[data-vistas="${id}"] .vista { stroke: var(--ink, currentColor); stroke-width: .5; fill: none; stroke-linecap: round; }`,
    `[data-vistas="${id}"] .oculta { stroke: var(--ink, currentColor); stroke-width: .3; fill: none; stroke-dasharray: 2 1; }`,
    `[data-vistas="${id}"] .eje { stroke: var(--ink, currentColor); stroke-width: .2; fill: none; stroke-dasharray: 6 1 1 1; }`,
    `[data-vistas="${id}"] .rotulo { fill: var(--ink, currentColor); font-family: var(--mono, monospace); font-size: 2.6px; }`,
  ].join(' ');
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n2(ancho)} ${n2(alto)}" width="${n2(ancho * escala)}" height="${n2(alto * escala)}" role="img" aria-labelledby="${id}-titulo ${id}-desc" data-vistas="${id}">`,
    `<title id="${id}-titulo">${escapa(`Vistas de la pieza ${v.codigo}`)}</title>`,
    `<desc id="${id}-desc">${escapa(desc)}</desc>`,
    `<style>${estilo}</style>`,
    ...cuerpo,
    '</svg>',
  ].join('\n');
}
