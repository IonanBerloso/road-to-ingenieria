/**
 * La figura de unas vistas publicadas (diseño de la fase M, §3.3): lo que
 * pinta `components/patrones/Vistas.astro`, calculado aquí para que los
 * tests lo puedan medir sin construir el sitio.
 *
 * Vale para dos cosas: la figura de un párrafo —qué vistas y a qué escala—
 * y la opción de un `reconocer`, que es una sola vista pequeña y sin
 * rótulo. Las vistas que se piden se colocan como manda el sistema europeo
 * (NyV p. 12): la planta debajo del alzado, con su misma anchura; el perfil
 * izquierdo a su derecha, con su misma altura. Si falta una, su hueco se
 * cierra, pero las que quedan siguen alineadas.
 *
 * Las reglas del lienzo (`scripts/figuras/lienzo.mjs`, §17): nada fuera del
 * `viewBox` —tampoco un rótulo, medido por lo alto— y el `<title>` y el
 * `<desc>` escritos desde la pieza. Las clases son las de la lámina del
 * Taller: `vista`, `oculta` y `eje`. Los colores los pone el componente,
 * con tokens.
 *
 * Coordenadas: las del papel de cada vista (`proyeccion.ts`), en mm, con la
 * v hacia abajo. El `viewBox` va en mm y `escala` dice cuántos píxeles de
 * pantalla mide uno.
 */
import type { VistasCalculadas } from './motor.ts';
import { encuadreDe, type Forma2 } from './plano2d.ts';
import { ORDEN_DE_VISTAS, type VistaId } from './proyeccion.ts';

export interface OpcionesDeFigura {
  /** El prefijo de los ids: único en la página. */
  readonly prefijo: string;
  /** Qué vistas, en cualquier orden; por defecto las tres. */
  readonly vistas?: readonly VistaId[];
  /** Píxeles de pantalla por mm de la pieza. */
  readonly escala?: number;
  /** El hueco entre vistas, en mm. */
  readonly separacion?: number;
  /** El nombre de cada vista encima de ella. */
  readonly rotulos?: boolean;
  /** Los ejes de los cilindros y de simetría. */
  readonly ejes?: boolean;
}

export type ElementoDeFigura =
  | { readonly el: 'line'; readonly x1: number; readonly y1: number; readonly x2: number; readonly y2: number; readonly clase: Clase }
  | { readonly el: 'circle'; readonly cx: number; readonly cy: number; readonly r: number; readonly clase: Clase }
  | { readonly el: 'path'; readonly d: string; readonly clase: Clase }
  | { readonly el: 'polyline'; readonly points: string; readonly clase: Clase };

export type Clase = 'vista' | 'oculta' | 'eje';

export interface RotuloDeFigura {
  readonly x: number;
  readonly y: number;
  readonly texto: string;
  /** El cuerpo de la letra, en mm del `viewBox`. */
  readonly tamano: number;
}

export interface GrupoDeFigura {
  readonly vista: VistaId;
  readonly rotulo: RotuloDeFigura | null;
  /** Primero los ejes, luego las ocultas y encima las vistas. */
  readonly elementos: readonly ElementoDeFigura[];
}

export interface FiguraDeVistas {
  /** El `viewBox` es `0 0 ancho alto`, en mm. */
  readonly ancho: number;
  readonly alto: number;
  /** El tamaño en pantalla, en píxeles. */
  readonly anchoPx: number;
  readonly altoPx: number;
  readonly idTitulo: string;
  readonly idDesc: string;
  readonly titulo: string;
  readonly desc: string;
  readonly grupos: readonly GrupoDeFigura[];
}

/** Píxeles por mm si no se dice. */
export const ESCALA = 3;
/** Lo que puede ser el prefijo de los ids: va en `id` y en `aria-labelledby`,
 *  que separa por espacios, así que sin espacios ni nada raro. */
export const PREFIJO = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
/** El margen alrededor de todo, en mm: que el trazo del borde no se corte. */
const MARGEN = 2;
/** El cuerpo de los rótulos en pantalla, en píxeles. */
const LETRA_PX = 10;
/** Lo que mide una letra de la fuente mono por lo alto, en cuerpos: el paso
 *  real de IBM Plex Mono es 0,6, y el lienzo mide con 7,9 píxeles por letra
 *  de 10,5 (§17: un guardián que solo vale en una máquina no vale). */
const ANCHO_LETRA = 0.8;

const n2 = (x: number): number => Math.round(x * 100) / 100 || 0;

type Caja = { umin: number; umax: number; vmin: number; vmax: number };

const une = (cs: readonly Caja[]): Caja => ({
  umin: Math.min(...cs.map((c) => c.umin)),
  umax: Math.max(...cs.map((c) => c.umax)),
  vmin: Math.min(...cs.map((c) => c.vmin)),
  vmax: Math.max(...cs.map((c) => c.vmax)),
});

/** Columna y fila de cada vista en el sistema europeo. */
const SITIO: Record<VistaId, { col: 0 | 1; fila: 0 | 1 }> = {
  alzado: { col: 0, fila: 0 },
  planta: { col: 0, fila: 1 },
  perfil: { col: 1, fila: 0 },
};

const NOMBRE: Record<VistaId, string> = { alzado: 'alzado', planta: 'planta', perfil: 'perfil izquierdo' };

/** «alzado, planta y perfil izquierdo». */
const enLista = (xs: readonly string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} y ${xs[xs.length - 1]}`);
const mayuscula = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function elementoDe(f: Forma2, clase: Clase, o: readonly [number, number]): ElementoDeFigura {
  const x = (u: number) => n2(u + o[0]);
  const y = (v: number) => n2(v + o[1]);
  if (f.tipo === 'segmento') return { el: 'line', x1: x(f.a[0]), y1: y(f.a[1]), x2: x(f.b[0]), y2: y(f.b[1]), clase };
  if (f.tipo === 'polilinea') return { el: 'polyline', points: f.puntos.map((p) => `${x(p[0])},${y(p[1])}`).join(' '), clase };
  if (f.hasta - f.desde >= 360 - 1e-9) return { el: 'circle', cx: x(f.c[0]), cy: y(f.c[1]), r: n2(f.r), clase };
  const punto = (a: number): [number, number] => [f.c[0] + f.r * Math.cos((a * Math.PI) / 180), f.c[1] + f.r * Math.sin((a * Math.PI) / 180)];
  const [p, q] = [punto(f.desde), punto(f.hasta)];
  const grande = f.hasta - f.desde > 180 ? 1 : 0;
  return { el: 'path', d: `M${x(p[0])} ${y(p[1])}A${n2(f.r)} ${n2(f.r)} 0 ${grande} 1 ${x(q[0])} ${y(q[1])}`, clase };
}

/** La figura de las vistas pedidas de una pieza. `pieza` es su descripción
 *  («La pieza NyV-2.18-3, hecha de…», `describePieza`). Lanza si algo se
 *  sale del `viewBox`, o si se piden vistas que no existen. */
export function figuraDeVistas(v: VistasCalculadas, pieza: string, opciones: OpcionesDeFigura): FiguraDeVistas {
  const escala = opciones.escala ?? ESCALA;
  const separacion = opciones.separacion ?? 10;
  const conRotulos = opciones.rotulos ?? true;
  const conEjes = opciones.ejes ?? true;
  const pedidas = ORDEN_DE_VISTAS.filter((k) => (opciones.vistas ?? ORDEN_DE_VISTAS).includes(k));
  const raras = (opciones.vistas ?? []).filter((k) => !ORDEN_DE_VISTAS.includes(k));
  if (!pedidas.length || raras.length) throw new Error(`figuraDeVistas: las vistas son alzado, planta y perfil (pedidas: ${(opciones.vistas ?? []).join(', ') || 'ninguna'})`);
  if (!(escala > 0)) throw new Error('figuraDeVistas: la escala son píxeles por mm, y es positiva');
  if (!PREFIJO.test(opciones.prefijo)) {
    throw new Error(`figuraDeVistas: el prefijo «${opciones.prefijo}» no vale para un id: minúsculas, cifras y guiones, empezando por una letra (t08-ej1-op2)`);
  }
  const dibujaOcultas = v.ocultas !== 'ninguna';

  const tamano = LETRA_PX / escala;
  const altoRotulo = conRotulos ? tamano * 1.6 : 0;
  const anchoRotulo = (k: VistaId) => (conRotulos ? NOMBRE[k].length * ANCHO_LETRA * tamano : 0);

  /* Lo que ocupa cada vista con sus ejes, en sus coordenadas. */
  const caja = Object.fromEntries(
    pedidas.map((k) => {
      const vista = v.vistas[k];
      const cajas: Caja[] = [vista.encuadre];
      if (conEjes) for (const e of vista.ejes) cajas.push(encuadreDe({ tipo: 'segmento', a: e.a, b: e.b }));
      return [k, une(cajas)];
    }),
  ) as Record<VistaId, Caja>;

  /* Cada columna, con la u de sus vistas y lo que pida su rótulo; cada fila,
     con la v de las suyas. Alzado y planta comparten la u, alzado y perfil
     la v: por eso se alinean por columna y por fila, y no una a una. */
  const enCol = (c: 0 | 1) => pedidas.filter((k) => SITIO[k].col === c);
  const enFila = (f: 0 | 1) => pedidas.filter((k) => SITIO[k].fila === f);
  const col = ([0, 1] as const).map((c) => {
    const ks = enCol(c);
    if (!ks.length) return null;
    const u = une(ks.map((k) => caja[k]));
    return { umin: u.umin, ancho: Math.max(u.umax - u.umin, ...ks.map(anchoRotulo)) };
  });
  const fila = ([0, 1] as const).map((f) => {
    const ks = enFila(f);
    if (!ks.length) return null;
    const c = une(ks.map((k) => caja[k]));
    return { vmin: c.vmin, alto: c.vmax - c.vmin };
  });
  const x0 = MARGEN;
  const x1 = col[0] ? x0 + col[0].ancho + separacion : x0;
  const y0 = MARGEN + altoRotulo;
  const y1 = fila[0] ? y0 + fila[0].alto + separacion + altoRotulo : y0;
  const origen = (k: VistaId): [number, number] => {
    const { col: c, fila: f } = SITIO[k];
    const cc = col[c] as { umin: number };
    const ff = fila[f] as { vmin: number };
    return [(c === 0 ? x0 : x1) - cc.umin, (f === 0 ? y0 : y1) - ff.vmin];
  };

  /* Lo que se dibuja, y la caja de cada cosa ya colocada, para mirar el
     marco al final: la de un arco es la de su curva, no la de sus puntas. */
  const ocupa: { caja: Caja; que: string }[] = [];
  const grupos: GrupoDeFigura[] = pedidas.map((k) => {
    const vista = v.vistas[k];
    const o = origen(k);
    const elementos: ElementoDeFigura[] = [];
    const mete = (f: Forma2, clase: Clase) => {
      elementos.push(elementoDe(f, clase, o));
      const c = encuadreDe(f);
      ocupa.push({ caja: { umin: c.umin + o[0], umax: c.umax + o[0], vmin: c.vmin + o[1], vmax: c.vmax + o[1] }, que: `una línea ${clase} del ${NOMBRE[k]}` });
    };
    if (conEjes) for (const e of vista.ejes) mete({ tipo: 'segmento', a: e.a, b: e.b }, 'eje');
    if (dibujaOcultas) for (const t of vista.tramos) if (t.tipo === 'oculto') mete(t.forma, 'oculta');
    for (const t of vista.tramos) if (t.tipo === 'visto') mete(t.forma, 'vista');
    const c = caja[k];
    /* El nombre, encima de su vista y a la altura de los de su fila: el
       alzado y el perfil no tienen por qué empezar a la misma v. */
    const arriba = SITIO[k].fila === 0 ? y0 : y1;
    const rotulo = conRotulos ? { x: n2(c.umin + o[0]), y: n2(arriba - tamano * 0.5), texto: NOMBRE[k].toUpperCase(), tamano: n2(tamano) } : null;
    if (rotulo) {
      ocupa.push({
        caja: { umin: rotulo.x, umax: rotulo.x + rotulo.texto.length * ANCHO_LETRA * rotulo.tamano, vmin: rotulo.y - rotulo.tamano, vmax: rotulo.y },
        que: `el rótulo «${rotulo.texto}»`,
      });
    }
    return { vista: k, rotulo, elementos };
  });

  /* El marco: lo que ocupa todo, más el margen. */
  const extremos = pedidas.map((k) => {
    const o = origen(k);
    const c = caja[k];
    return { umin: c.umin + o[0], umax: Math.max(c.umax + o[0], c.umin + o[0] + anchoRotulo(k)), vmin: c.vmin + o[1] - altoRotulo, vmax: c.vmax + o[1] };
  });
  const todo = une(extremos);
  const ancho = n2(todo.umax + MARGEN);
  const alto = n2(todo.vmax + MARGEN);
  compruebaMarco(ocupa, ancho, alto, opciones.prefijo);

  const nombres = pedidas.map((k) => NOMBRE[k]);
  const como = [
    'las aristas vistas en trazo continuo',
    dibujaOcultas ? 'las ocultas a trazos' : '',
    conEjes ? 'los ejes de trazo y punto' : '',
  ].filter(Boolean);
  const colocacion =
    pedidas.length > 1
      ? ` (${[pedidas.includes('planta') && pedidas.includes('alzado') ? 'la planta debajo del alzado' : '', pedidas.includes('perfil') && pedidas.includes('alzado') ? 'el perfil izquierdo a su derecha' : ''].filter(Boolean).join(' y ') || 'en su sitio'})`
      : '';
  return {
    ancho,
    alto,
    anchoPx: n2(ancho * escala),
    altoPx: n2(alto * escala),
    idTitulo: `${opciones.prefijo}-t`,
    idDesc: `${opciones.prefijo}-d`,
    titulo: `${mayuscula(enLista(nombres))} de la pieza ${v.codigo}`,
    desc: `${pieza.replace(/\.$/, '')}. ${mayuscula(enLista(nombres))} en el sistema europeo${colocacion}, calculados desde la pieza: ${enLista(como)}.`,
    grupos,
  };
}

/** Nada fuera del `viewBox`: la caja de cada línea, de cada arco por su
 *  curva y de cada rótulo con su ancho medido por lo alto. Lanza diciendo
 *  qué se sale y por dónde. */
function compruebaMarco(ocupa: readonly { caja: Caja; que: string }[], ancho: number, alto: number, prefijo: string): void {
  const fuera: string[] = [];
  for (const { caja: c, que } of ocupa) {
    const lados = [c.umin < 0 ? 'izquierda' : '', c.umax > ancho ? 'derecha' : '', c.vmin < 0 ? 'arriba' : '', c.vmax > alto ? 'abajo' : ''].filter(Boolean);
    if (lados.length) fuera.push(`${que}, por ${lados.join(' y ')}`);
  }
  if (fuera.length) throw new Error(`${prefijo}: ${fuera.length} cosa(s) fuera del viewBox (0 0 ${ancho} ${alto}) — ${fuera.slice(0, 4).join('; ')}`);
}

/** Un `viewBox` de verdad, para los tests: cada número que acaba en el
 *  marcado, leído de los elementos ya escritos. */
export function puntosDeElemento(e: ElementoDeFigura): [number, number][] {
  if (e.el === 'line') return [[e.x1, e.y1], [e.x2, e.y2]];
  if (e.el === 'circle') return [[e.cx - e.r, e.cy - e.r], [e.cx + e.r, e.cy + e.r]];
  const nums = (e.el === 'polyline' ? e.points : e.d.replace(/[MA]/g, ' '))
    .replace(/,/g, ' ')
    .trim()
    .split(/\s+/)
    .map(Number);
  if (e.el === 'polyline') return Array.from({ length: nums.length / 2 }, (_, i) => [nums[2 * i], nums[2 * i + 1]]);
  /* M x y A rx ry giro grande barrido x y: el principio y el final. */
  return [[nums[0], nums[1]], [nums[7], nums[8]]];
}
