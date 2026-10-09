/**
 * Las curvas del espacio que pueden ser aristas: segmentos, arcos de
 * circunferencia y polilíneas (lo que sale de muestrear un corte de un plano
 * oblicuo con un cilindro, o de dos cilindros entre sí).
 *
 * Todas se recorren por su longitud, `s` de 0 a `largo`, en mm: así el
 * muestreo de la prueba del pliegue y el de la visibilidad van al mismo paso
 * en una recta que en un arco. Los segmentos y los arcos se guardan
 * exactos, no muestreados, porque al proyectar se funden «las rectas por su
 * recta y los arcos por su círculo» (§3.2, paso 5) y un arco hecho de
 * cuerdas no se funde con nada.
 */
import { CASI_CERO, HOLGURA_NUMERICA } from './tolerancias.ts';
import { avanza3, distancia3, por3, resta3, suma3, unitario3, type V3 } from './vector.ts';

export type Curva3 =
  | { readonly tipo: 'segmento'; readonly a: V3; readonly b: V3 }
  /** c + r·(cos θ·e1 + sen θ·e2), con θ de `desde` a `hasta` (radianes,
   *  hasta > desde; la vuelta entera es hasta = desde + 2π). */
  | { readonly tipo: 'arco'; readonly c: V3; readonly e1: V3; readonly e2: V3; readonly r: number; readonly desde: number; readonly hasta: number }
  | { readonly tipo: 'polilinea'; readonly puntos: readonly V3[] };

export interface CurvaRecorrida {
  readonly curva: Curva3;
  readonly largo: number;
  /** Si se cierra sobre sí misma: un recorrido que pasa de `largo` sigue
   *  por el principio. */
  readonly cerrada: boolean;
  readonly punto: (s: number) => V3;
  readonly tangente: (s: number) => V3;
}

const DOS_PI = 2 * Math.PI;

/** La curva lista para recorrerla. */
export function recorre(curva: Curva3): CurvaRecorrida {
  if (curva.tipo === 'segmento') {
    const largo = distancia3(curva.a, curva.b);
    const t = unitario3(resta3(curva.b, curva.a));
    return { curva, largo, cerrada: false, punto: (s) => avanza3(curva.a, t, s), tangente: () => t };
  }
  if (curva.tipo === 'arco') {
    const { c, e1, e2, r, desde, hasta } = curva;
    const cerrada = hasta - desde >= DOS_PI - CASI_CERO;
    const largo = r * (hasta - desde);
    const angulo = (s: number) => desde + (cerrada ? ((s % largo) + largo) % largo : s) / r;
    return {
      curva,
      largo,
      cerrada,
      punto: (s) => {
        const a = angulo(s);
        return suma3(c, suma3(por3(e1, r * Math.cos(a)), por3(e2, r * Math.sin(a))));
      },
      tangente: (s) => {
        const a = angulo(s);
        return suma3(por3(e1, -Math.sin(a)), por3(e2, Math.cos(a)));
      },
    };
  }
  const pts = curva.puntos;
  const cerrada = pts.length > 2 && distancia3(pts[0], pts[pts.length - 1]) < HOLGURA_NUMERICA;
  const acumulado = [0];
  for (let i = 1; i < pts.length; i++) acumulado.push(acumulado[i - 1] + distancia3(pts[i - 1], pts[i]));
  const largo = acumulado[acumulado.length - 1];
  /* El tramo donde cae s, por bisección sobre lo acumulado. */
  const tramo = (s: number): number => {
    let [lo, hi] = [0, pts.length - 2];
    while (lo < hi) {
      const m = (lo + hi + 1) >> 1;
      if (acumulado[m] <= s) lo = m;
      else hi = m - 1;
    }
    return lo;
  };
  const normaliza = (s: number) => (cerrada ? ((s % largo) + largo) % largo : Math.max(0, Math.min(largo, s)));
  return {
    curva,
    largo,
    cerrada,
    punto: (s0) => {
      const s = normaliza(s0);
      const i = tramo(s);
      const l = acumulado[i + 1] - acumulado[i];
      return l < CASI_CERO ? pts[i] : avanza3(pts[i], resta3(pts[i + 1], pts[i]), (s - acumulado[i]) / l);
    },
    tangente: (s0) => {
      const i = tramo(normaliza(s0));
      const d = resta3(pts[i + 1], pts[i]);
      return Math.hypot(...d) < CASI_CERO ? [1, 0, 0] : unitario3(d);
    },
  };
}

/** El trozo de la curva de `s0` a `s1` (s1 > s0), como curva nueva. En una
 *  curva cerrada, s1 puede pasar de `largo`. */
export function trozo(c: CurvaRecorrida, s0: number, s1: number): Curva3 {
  const k = c.curva;
  if (k.tipo === 'segmento') return { tipo: 'segmento', a: c.punto(s0), b: c.punto(s1) };
  if (k.tipo === 'arco') return { ...k, desde: k.desde + s0 / k.r, hasta: k.desde + s1 / k.r };
  /* La polilínea: sus vértices de dentro, y los dos extremos exactos. */
  const puntos: V3[] = [c.punto(s0)];
  let acumulado = 0;
  const vueltas = c.cerrada && s1 > c.largo ? 2 : 1;
  for (let v = 0; v < vueltas; v++) {
    for (let i = 1; i < k.puntos.length; i++) {
      acumulado += distancia3(k.puntos[i - 1], k.puntos[i]);
      if (acumulado > s0 + HOLGURA_NUMERICA && acumulado < s1 - HOLGURA_NUMERICA) puntos.push(k.puntos[i]);
    }
  }
  puntos.push(c.punto(s1));
  return { tipo: 'polilinea', puntos };
}
