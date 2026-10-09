/**
 * Las vistas del sistema europeo y cómo cae una curva del espacio en cada
 * una (§3.2, paso 5).
 *
 * «¡¡ESTE SISTEMA EN LAS LÁMINAS!!» (NyV p. 12; LIBRO p. 63-64): la planta
 * debajo del alzado y el perfil izquierdo —la pieza vista desde su
 * izquierda— a la derecha. Cada vista se da en sus coordenadas del papel,
 * en mm y con la v hacia abajo, que es como las lee el Taller:
 *
 *   · alzado: mira desde delante (y negativas); u = x, v = −z.
 *   · planta: mira desde arriba; u = x, v = −y. Lo de delante queda abajo,
 *     lejos del alzado.
 *   · perfil izquierdo: mira desde la izquierda (x negativas); u = −y,
 *     v = −z. Lo de delante queda a la derecha, lejos del alzado.
 *
 * Así alzado y planta comparten la u (las anchuras), alzado y perfil la v
 * (las alturas), y la profundidad es la −v de la planta y la u del perfil:
 * la correspondencia de NyV p. 9-11, que los tests comprueban.
 */
import type { P2 } from '../diedrico.ts';
import type { Curva3 } from './curvas.ts';
import { limpio, reconoce, type Forma2 } from './plano2d.ts';
import { GENERATRICES, HOLGURA_NUMERICA, LARGO_MINIMO } from './tolerancias.ts';
import { escalar3, por3, suma3, vectorial3, type V3 } from './vector.ts';

export type VistaId = 'alzado' | 'planta' | 'perfil';

export interface Vista {
  readonly id: VistaId;
  readonly nombre: string;
  /** La dirección que va de la pieza al observador. */
  readonly haciaObservador: V3;
  /** Dónde cae un punto del espacio en el papel. */
  readonly aPapel: (q: V3) => P2;
}

export const VISTAS: Readonly<Record<VistaId, Vista>> = {
  alzado: { id: 'alzado', nombre: 'alzado', haciaObservador: [0, -1, 0], aPapel: (q) => [q[0], -q[2]] },
  planta: { id: 'planta', nombre: 'planta', haciaObservador: [0, 0, 1], aPapel: (q) => [q[0], -q[1]] },
  perfil: { id: 'perfil', nombre: 'perfil izquierdo', haciaObservador: [-1, 0, 0], aPapel: (q) => [-q[1], -q[2]] },
};

export const ORDEN_DE_VISTAS: readonly VistaId[] = ['alzado', 'planta', 'perfil'];


const GRADOS = 180 / Math.PI;

/** Un giro en el papel más brusco que esto parte una polilínea, en grados:
 *  una curva muestreada a un grado gira mucho menos de una cuerda a la
 *  siguiente. */
const GIRO_BRUSCO = 45;

/** Los puntos de una polilínea del papel, partidos donde gira de golpe: en
 *  una esquina o donde la proyección vuelve sobre sí misma. La rama de corte
 *  de dos tubos del mismo radio recorre media elipse de cada plano y dobla
 *  en el punto singular: entera no es nada, y en trozos son cuatro
 *  segmentos, la X del alzado. */
function troceaEnLosGiros(puntos: readonly P2[]): P2[][] {
  const coseno = Math.cos((GIRO_BRUSCO * Math.PI) / 180);
  const trozos: P2[][] = [[puntos[0]]];
  let antes: P2 | null = null;
  for (let i = 1; i < puntos.length; i++) {
    const [p, q] = [puntos[i - 1], puntos[i]];
    const l = Math.hypot(q[0] - p[0], q[1] - p[1]);
    if (l < LARGO_MINIMO / 10) continue;
    const dir: P2 = [(q[0] - p[0]) / l, (q[1] - p[1]) / l];
    if (antes && antes[0] * dir[0] + antes[1] * dir[1] < coseno) trozos.push([p]);
    trozos[trozos.length - 1].push(q);
    antes = dir;
  }
  return trozos.filter((t) => t.length >= 2);
}

const reconoceEnTrozos = (puntos: readonly P2[]): Forma2[] =>
  troceaEnLosGiros(puntos)
    .map(reconoce)
    .filter((f): f is Forma2 => f !== null);

/** La curva en el papel de la vista: segmentos, arcos y, lo que no es
 *  ninguna de las dos cosas, polilíneas. Nada si se ve de punta. */
export function proyectaCurva(c: Curva3, v: Vista): Forma2[] {
  if (c.tipo === 'segmento') {
    const [a, b] = [v.aPapel(c.a), v.aPapel(c.b)];
    if (Math.hypot(b[0] - a[0], b[1] - a[1]) < LARGO_MINIMO) return [];
    return [{ tipo: 'segmento', a: [limpio(a[0]), limpio(a[1])], b: [limpio(b[0]), limpio(b[1])] }];
  }
  if (c.tipo === 'arco') {
    const normal = vectorial3(c.e1, c.e2);
    /* De frente: el arco es un arco, con el mismo radio. */
    if (Math.abs(escalar3(normal, v.haciaObservador)) > 1 - HOLGURA_NUMERICA) {
      const centro = v.aPapel(c.c);
      const E1 = v.aPapel(suma3(c.c, c.e1));
      const E2 = v.aPapel(suma3(c.c, c.e2));
      const [x1, y1, x2, y2] = [E1[0] - centro[0], E1[1] - centro[1], E2[0] - centro[0], E2[1] - centro[1]];
      const directo = x1 * y2 - y1 * x2 > 0;
      const angulo = (t: number) => {
        const p = v.aPapel(suma3(c.c, suma3(por3(c.e1, c.r * Math.cos(t)), por3(c.e2, c.r * Math.sin(t)))));
        const a = Math.atan2(p[1] - centro[1], p[0] - centro[0]) * GRADOS;
        return a < 0 ? a + 360 : a;
      };
      const vuelta = (c.hasta - c.desde) * GRADOS;
      const desde = angulo(directo ? c.desde : c.hasta);
      const hasta = vuelta >= 360 - HOLGURA_NUMERICA ? desde + 360 : desde + vuelta;
      return [{ tipo: 'arco', c: [limpio(centro[0]), limpio(centro[1])], r: limpio(c.r), desde: limpio(desde), hasta: limpio(hasta) }];
    }
    const n = Math.max(3, Math.ceil(((c.hasta - c.desde) / (2 * Math.PI)) * GENERATRICES) + 1);
    const puntos = Array.from({ length: n }, (_, k) => {
      const t = c.desde + ((c.hasta - c.desde) * k) / (n - 1);
      return v.aPapel(suma3(c.c, suma3(por3(c.e1, c.r * Math.cos(t)), por3(c.e2, c.r * Math.sin(t)))));
    });
    return reconoceEnTrozos(puntos);
  }
  return reconoceEnTrozos(c.puntos.map(v.aPapel));
}
