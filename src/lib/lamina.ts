/**
 * Las láminas de Expresión Gráfica como datos: la figura de cada ejercicio de
 * la colección de diédrico, con las coordenadas del PDF (pt, y hacia abajo),
 * y lo que una receta puede nombrar de ella.
 *
 * Una lámina es un fichero de `src/content/laminas/`, cotejado encima de su
 * página del PDF con `scripts/lamina-sobre-pdf.mjs` antes de escribir su
 * primer objetivo (brief del 8 de septiembre de 2026, §4): un segmento
 * desplazado convierte una solución buena en un diagnóstico falso. Aquí vive
 * lo que se comprueba de ella, que usa el esquema de `content.config.ts`, y
 * cómo se convierte en lo que lee una receta (`lib/diedrico-receta`).
 *
 * LO QUE LLEVA UN PUNTO. Sin `marca` es solo un nombre para la receta —los
 * vértices del tejado de SD1 no están rotulados en la lámina—; con `cruz` se
 * dibuja la cruz del enunciado y su rótulo; con `vertice`, solo el rótulo,
 * porque el vértice ya es el extremo de un segmento.
 */
import type { P2 } from './diedrico';
import type { Lamina } from './diedrico-receta';

export interface PuntoDeLamina {
  readonly x: number;
  readonly y: number;
  readonly marca?: 'cruz' | 'vertice';
  readonly rotulo?: string;
}

export interface SegmentoDeLamina {
  readonly nombre?: string;
  readonly a: P2;
  readonly b: P2;
  /** Como en el PDF: continuo, oculto o eje de trazo y punto. El eje entró
   *  con SD4, cuyo poste lo lleva en las dos vistas; hasta entonces aquí
   *  ponía que la colección no usaba más que los otros dos. */
  readonly tipo: 'c' | 'o' | 'e';
}

export interface DatosLamina {
  readonly codigo: string;
  readonly origen?: 'coleccion' | 'hoja' | 'otro-pdf' | 'nuestra';
  readonly pdf?: string;
  /** Sin ella, una lámina nuestra que no sale de ningún PDF. */
  readonly pagina?: number;
  readonly ejercicio?: number;
  readonly encuadre: { readonly x: number; readonly y: number; readonly w: number; readonly h: number };
  readonly puntos: Readonly<Record<string, PuntoDeLamina>>;
  readonly segmentos: readonly SegmentoDeLamina[];
  readonly circulos?: readonly { readonly c: P2; readonly r: number }[];
  readonly rotulos?: readonly { readonly texto: string; readonly x: number; readonly y: number }[];
}

/** Cómo puede llamarse algo de una lámina: letras, cifras, `_`, y lo que usa
 *  la propia colección —`r2≡s2`, `A2′`—. */
export const NOMBRE_EN_LAMINA = /^[\p{L}\p{N}_≡′']+$/u;

/** Lo que está mal en una lámina, en frases; vacío si nada. */
export function problemasDeLamina(d: DatosLamina): string[] {
  const problemas: string[] = [];
  const { x, y, w, h } = d.encuadre;
  const fuera = ([px, py]: P2) => px < x || px > x + w || py < y || py > y + h;
  for (const [nombre, p] of Object.entries(d.puntos)) {
    if (fuera([p.x, p.y])) problemas.push(`el punto «${nombre}» (${p.x}, ${p.y}) cae fuera del encuadre`);
    if (p.marca && !p.rotulo) problemas.push(`el punto «${nombre}» lleva marca y no rótulo: lo que se dibuja se rotula`);
  }
  const vistos = new Set<string>();
  d.segmentos.forEach((s, i) => {
    const quien = s.nombre ? `el segmento «${s.nombre}»` : `el segmento ${i + 1}`;
    if (s.nombre !== undefined) {
      if (vistos.has(s.nombre)) problemas.push(`hay dos segmentos que se llaman «${s.nombre}»`);
      vistos.add(s.nombre);
    }
    if (Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1]) < 0.01) problemas.push(`${quien} tiene longitud cero`);
    if (fuera(s.a) || fuera(s.b)) problemas.push(`${quien} se sale del encuadre`);
  });
  if (d.segmentos.length === 0 && !Object.values(d.puntos).some((p) => p.marca === 'cruz')) {
    problemas.push('la lámina no tiene ni un segmento ni una cruz: no hay nada que dibujar');
  }
  for (const c of d.circulos ?? []) {
    if (fuera([c.c[0] - c.r, c.c[1] - c.r]) || fuera([c.c[0] + c.r, c.c[1] + c.r])) {
      problemas.push(`el círculo de centro (${c.c[0]}, ${c.c[1]}) se sale del encuadre`);
    }
  }
  return problemas;
}

/** Lo que una receta puede nombrar de la lámina: sus puntos, y los
 *  segmentos que tienen nombre. */
export function laminaDe(d: DatosLamina): Lamina {
  const segmentos: Record<string, readonly [P2, P2]> = {};
  for (const s of d.segmentos) if (s.nombre !== undefined) segmentos[s.nombre] = [s.a, s.b];
  return {
    puntos: Object.fromEntries(Object.entries(d.puntos).map(([n, p]) => [n, [p.x, p.y] as const])),
    segmentos,
  };
}
