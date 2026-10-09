/**
 * La prueba del pliegue (§3.2, paso 3): si una candidata es arista, punto a
 * punto, y si no lo es, por qué.
 *
 * EL ANILLO DEL DISEÑO, Y POR QUÉ NO ESTÁ. El diseño ponía en cada muestra
 * un anillo de 24 puntos a 0,4 mm, perpendicular a la curva: todo dentro o
 * todo fuera, no es borde; media vuelta, caras en el mismo plano o
 * tangentes; otra cosa, arista. Se escribió así y los tests lo tumbaron dos
 * veces, las dos cerca de otra cara:
 *   · en una tangencia, la circunferencia de arriba de un redondeo pasa a
 *     menos de 0,4 mm de la cara lateral de la placa a lo largo de 16° a
 *     cada lado del punto de tangencia; el anillo ve allí la esquina y la
 *     llama arista (salían 208° de arco donde van 180);
 *   · en una esquina aguda, el anillo de una generatriz de un cono, que va
 *     inclinado, se mete por debajo del borde de abajo y cae entero fuera:
 *     la generatriz perdía su primer 0,01 mm y el contorno no cerraba.
 * Con un anillo más pequeño los dos errores encogen, pero no desaparecen.
 *
 * LAS SUPERFICIES QUE PASAN POR EL PUNTO. Por eso el pliegue se decide con
 * las superficies de las primitivas que contienen la candidata en ese
 * punto, mirando cuáles son piel de verdad: una lo es a un lado de la
 * candidata si, un poco más allá sobre ella (0,05 mm), la pieza cambia de
 * dentro a fuera al cruzarla. Eso es exacto: no depende de a qué distancia
 * quede otra cara. Con las que son piel:
 *   · ninguna: la candidata no está en el borde;
 *   · todas con la misma normal: es llano. Si son de dos primitivas, las dos
 *     caras están en el mismo plano, o son tangentes si una es curva, y no
 *     hay arista: eso va al catálogo con los dos nombres (§3.5). Si son de
 *     una sola, la candidata va por en medio de una cara —el plano del
 *     chaflán de la espiga corta la cara de arriba de la base en x = 54,
 *     donde el chaflán no quita nada— y no es ninguna junta;
 *   · normales distintas: arista.
 * Las generatrices de contorno solo piden estar en el borde.
 */
import type { Candidata } from './candidatas.ts';
import { aLocal, dentro, enCaja, primitivasDonde, type PiezaCompilada } from './pieza.ts';
import { carasDe, enRegion, superficieDe, radioDeSuperficie, type SuperficieCurva } from './superficies.ts';
import {
  ANGULO_CONTIENE,
  ANGULO_LLANO,
  ANGULO_SINGULAR,
  BISECCIONES,
  CRUCE,
  HOLGURA_NUMERICA,
  LARGO_MINIMO,
  PASO_MUESTREO,
  SONDA,
  TOL_EXACTA,
  TOL_MUESTREADA,
} from './tolerancias.ts';
import { avanza3, escalar3, modulo3, por3, resta3, suma3, unitario3, vectorial3, type V3 } from './vector.ts';

export type Estado = 'arista' | 'mismo-plano' | 'tangencia' | 'llano' | 'interior' | 'exterior';

const SENO_CONTIENE = Math.sin((ANGULO_CONTIENE * Math.PI) / 180);
const COSENO_LLANO = Math.cos((ANGULO_LLANO * Math.PI) / 180);

export interface Pliegue {
  readonly estado: Estado;
  /** Para «mismo-plano» y «tangencia»: las primitivas de las caras que se
   *  juntan. */
  readonly primitivas?: readonly string[];
}

interface SuperficieEnPunto {
  readonly prim: number;
  readonly curva: boolean;
  /** La normal hacia fuera de su primitiva, en q. */
  readonly normal: V3;
  /** Lleva un punto cercano a la superficie y da su normal allí; null si
   *  cae fuera de ella (más allá del borde de la cara). */
  readonly sobre: (x: V3) => { readonly punto: V3; readonly normal: V3 } | null;
}

function enCurva(s: SuperficieCurva, x: V3): { punto: V3; normal: V3 } | null {
  const [a, b, h] = aLocal({ o: s.o, e: [s.e1, s.e2, s.eje] }, x);
  const ro = Math.hypot(a, b);
  if (h < s.w0 - TOL_MUESTREADA || h > s.w1 + TOL_MUESTREADA || ro < HOLGURA_NUMERICA) return null;
  const R = radioDeSuperficie(s, h);
  const radial = unitario3(suma3(por3(s.e1, a / ro), por3(s.e2, b / ro)));
  const k = (s.r1 - s.r0) / (s.w1 - s.w0);
  return { punto: avanza3(avanza3(s.o, s.eje, h), radial, R), normal: unitario3(resta3(radial, por3(s.eje, k))) };
}

/** Las superficies de cada primitiva que pasan por q, con holgura `tol`.
 *  Las primitivas cuya caja queda lejos no se miran. */
function superficiesPor(p: PiezaCompilada, q: V3, tol: number): SuperficieEnPunto[] {
  const r: SuperficieEnPunto[] = [];
  for (const i of primitivasDonde(p, (c) => enCaja(c, q, tol + HOLGURA_NUMERICA))) {
    const prim = p.primitivas[i];
    for (const c of carasDe(prim)) {
      if (Math.abs(escalar3(c.n, q) - c.d) > tol || !enRegion(c, q, tol)) continue;
      const sobre = (x: V3) => {
        const punto = avanza3(x, c.n, c.d - escalar3(c.n, x));
        return enRegion(c, punto) ? { punto, normal: c.n } : null;
      };
      r.push({ prim: prim.indice, curva: false, normal: c.n, sobre });
    }
    const s = superficieDe(prim);
    if (!s) continue;
    const [x, y, w] = aLocal({ o: s.o, e: [s.e1, s.e2, s.eje] }, q);
    if (w < s.w0 - tol || w > s.w1 + tol) continue;
    if (Math.abs(Math.hypot(x, y) - radioDeSuperficie(s, w)) > tol) continue;
    const aqui = enCurva(s, q);
    if (aqui) r.push({ prim: prim.indice, curva: true, normal: aqui.normal, sobre: (z) => enCurva(s, z) });
  }
  return r;
}

/** Una superficie que es piel de la pieza junto a la candidata, con la
 *  normal hacia fuera de la pieza. No es la de su primitiva: la cara de una
 *  resta mira hacia la materia que queda. */
export interface Piel {
  readonly prim: number;
  readonly curva: boolean;
  readonly normal: V3;
}

/** Cómo es piel la superficie en x: +1 si la pieza queda detrás de su
 *  normal, −1 si delante, 0 si ahí no es piel (a los dos lados lo mismo). */
function orientacion(p: PiezaCompilada, x: { readonly punto: V3; readonly normal: V3 }): number {
  const detras = dentro(p, avanza3(x.punto, x.normal, -CRUCE));
  const delante = dentro(p, avanza3(x.punto, x.normal, CRUCE));
  return detras === delante ? 0 : detras ? 1 : -1;
}

/** La superficie como piel a algún lado de la candidata: un poco más allá
 *  sobre ella, la pieza cambia al cruzarla. */
function comoPiel(p: PiezaCompilada, s: SuperficieEnPunto, q: V3, lado: V3): Piel | null {
  for (const k of [-1, 1]) {
    const x = s.sobre(avanza3(q, lado, k * SONDA));
    const o = x ? orientacion(p, x) : 0;
    if (o !== 0) return { prim: s.prim, curva: s.curva, normal: por3(s.normal, o) };
  }
  return null;
}

/** Las superficies que contienen la candidata en q (su normal es
 *  perpendicular a ella) y son piel. */
export function pielEn(p: PiezaCompilada, q: V3, t: V3, tol = TOL_EXACTA): Piel[] {
  const tu = unitario3(t);
  const r: Piel[] = [];
  for (const s of superficiesPor(p, q, tol)) {
    if (Math.abs(escalar3(s.normal, tu)) > SENO_CONTIENE) continue;
    const lado = vectorial3(s.normal, tu);
    if (modulo3(lado) <= HOLGURA_NUMERICA) continue;
    const piel = comoPiel(p, s, q, unitario3(lado));
    if (piel) r.push(piel);
  }
  return r;
}

/** Lo que se abren las normales de la piel en q: el mayor ángulo entre dos,
 *  en grados; null si no hay dos. */
export function aperturaEn(p: PiezaCompilada, q: V3, t: V3, tol = TOL_EXACTA): number | null {
  const piel = pielEn(p, q, t, tol);
  if (piel.length < 2) return null;
  let mayor = 0;
  for (let i = 0; i < piel.length; i++) {
    for (let j = i + 1; j < piel.length; j++) {
      const c = Math.max(-1, Math.min(1, escalar3(piel[i].normal, piel[j].normal)));
      mayor = Math.max(mayor, (Math.acos(c) * 180) / Math.PI);
    }
  }
  return mayor;
}

/** La prueba del pliegue en un punto q de una candidata de tangente t. */
export function pliegueEn(p: PiezaCompilada, q: V3, t: V3, soloBorde: boolean, conNombres = false, tol = TOL_EXACTA): Pliegue {
  const piel = pielEn(p, q, t, tol);
  if (!piel.length) return { estado: dentro(p, q) ? 'interior' : 'exterior' };
  if (soloBorde) return { estado: 'arista' };
  /* Llano si todas miran al mismo lado. Dos caras que se miran de frente
     (normales opuestas) no están en el mismo plano: se tocan por fuera, y
     eso es arista. */
  const n0 = piel[0].normal;
  if (!piel.every((s) => escalar3(n0, s.normal) > COSENO_LLANO)) return { estado: 'arista' };
  const nombres = [...new Set(piel.map((s) => p.primitivas[s.prim].nombre))];
  if (nombres.length < 2) return { estado: 'llano' };
  const estado = piel.some((s) => s.curva) ? 'tangencia' : 'mismo-plano';
  return conNombres ? { estado, primitivas: nombres } : { estado };
}

/* ── A lo largo de una candidata ──────────────────────────────────────── */

/** Un trozo de candidata con un mismo estado, de `desde` a `hasta` (en una
 *  curva cerrada, `hasta` puede pasar de su largo). */
export interface Racha {
  readonly desde: number;
  readonly hasta: number;
  readonly estado: Estado;
  readonly primitivas: readonly string[];
}

type Trozo = { desde: number; hasta: number; estado: Estado };

/**
 * Los huecos de un punto singular. Donde dos superficies se tocan en un
 * solo punto —dos tubos del mismo radio que se cruzan—, sus normales se
 * acercan hasta coincidir y la prueba del pliegue ve, a un lado y a otro
 * del punto, un trocito llano: la arista salía con huecos de ±0,25 mm y un
 * descarte de tangencia sin nombres (revisión del 9 de octubre de 2026).
 * Un trozo que no es arista entre dos que lo son se cose a ellas si a un
 * cuarto de cada extremo las normales ya se abren más de ANGULO_SINGULAR:
 * en un punto aislado el ángulo crece desde cero, y en una tangencia o un
 * plano común de verdad se queda en cero.
 */
function coseSingulares(trozos: Trozo[], cerrada: boolean, apertura: (s: number) => number | null): Trozo[] {
  const n = trozos.length;
  const arista = (i: number) => trozos[(i + n) % n].estado === 'arista';
  /* Abierta, el hueco necesita una arista a cada lado: tres trozos; cerrada,
     la vuelta pone el otro lado, y bastan dos. */
  if (n < (cerrada ? 2 : 3) || trozos.every((_, i) => arista(i)) || !trozos.some((_, i) => arista(i))) return trozos;
  const r = trozos.map((t) => ({ ...t }));
  for (let i = 0; i < n; i++) {
    if (arista(i) || !arista(i - 1) || (!cerrada && i === 0)) continue;
    let k = i;
    while (!arista(k + 1) && k + 1 < i + n) k++;
    if (!cerrada && k + 1 >= n) continue;
    const ultimo = trozos[k % n];
    const desde = trozos[i].desde;
    const hasta = k >= n ? ultimo.hasta + (trozos[n - 1].hasta - trozos[0].desde) : ultimo.hasta;
    const L = hasta - desde;
    const abre = Math.max(apertura(desde + L / 4) ?? 0, apertura(desde + (3 * L) / 4) ?? 0);
    if (abre > ANGULO_SINGULAR) for (let j = i; j <= k; j++) r[j % n].estado = 'arista';
  }
  /* Se juntan los trozos seguidos del mismo estado. */
  const juntos: Trozo[] = [];
  for (const t of r) {
    const previo = juntos[juntos.length - 1];
    if (previo && previo.estado === t.estado && Math.abs(previo.hasta - t.desde) < LARGO_MINIMO) previo.hasta = t.hasta;
    else juntos.push(t);
  }
  return juntos;
}

/** La candidata partida por estados: se muestrea al paso, y cada cambio se
 *  afina por bisección. */
export function rachasDe(p: PiezaCompilada, c: Candidata): Racha[] {
  const { curva } = c;
  const soloBorde = c.clase === 'contorno';
  const tol = curva.curva.tipo === 'polilinea' ? TOL_MUESTREADA : TOL_EXACTA;
  const estadoEn = (s: number) => pliegueEn(p, curva.punto(s), curva.tangente(s), soloBorde, false, tol).estado;
  const L = curva.largo;
  const n = Math.max(3, Math.ceil(L / PASO_MUESTREO) + 1);
  const borde = Math.min(LARGO_MINIMO, L / 10);
  const posiciones = curva.cerrada ? Array.from({ length: n }, (_, k) => (L * k) / n) : Array.from({ length: n }, (_, k) => borde + ((L - 2 * borde) * k) / (n - 1));
  const estados = posiciones.map(estadoEn);
  if (estados.every((e) => e === 'interior' || e === 'exterior')) return [];

  const afina = (a: number, b: number, ea: Estado): number => {
    for (let i = 0; i < BISECCIONES; i++) {
      const m = (a + b) / 2;
      if (estadoEn(m) === ea) a = m;
      else b = m;
    }
    return (a + b) / 2;
  };

  let trozos: Trozo[] = [];
  if (curva.cerrada) {
    const cortes: { s: number; despues: Estado }[] = [];
    for (let k = 0; k < n; k++) {
      const j = (k + 1) % n;
      if (estados[k] === estados[j]) continue;
      const hasta = j === 0 ? L : posiciones[j];
      cortes.push({ s: afina(posiciones[k], hasta, estados[k]), despues: estados[j] });
    }
    if (!cortes.length) trozos.push({ desde: 0, hasta: L, estado: estados[0] });
    for (let k = 0; k < cortes.length; k++) {
      const sig = cortes[(k + 1) % cortes.length];
      trozos.push({ desde: cortes[k].s, hasta: sig.s > cortes[k].s ? sig.s : sig.s + L, estado: cortes[k].despues });
    }
  } else {
    let desde = 0;
    for (let k = 0; k + 1 < n; k++) {
      if (estados[k] === estados[k + 1]) continue;
      const s = afina(posiciones[k], posiciones[k + 1], estados[k]);
      trozos.push({ desde, hasta: s, estado: estados[k] });
      desde = s;
    }
    trozos.push({ desde, hasta: L, estado: estados[n - 1] });
  }
  if (!soloBorde) trozos = coseSingulares(trozos, curva.cerrada, (s) => aperturaEn(p, curva.punto(s), curva.tangente(s), tol));

  return trozos
    .filter((t) => t.estado !== 'interior' && t.estado !== 'exterior' && t.estado !== 'llano')
    .map((t) => {
      if (t.estado !== 'mismo-plano' && t.estado !== 'tangencia') return { ...t, primitivas: [] };
      /* Los nombres, de varios puntos del trozo: en uno solo puede caer un
         sitio donde la piel no se deja ver. */
      const nombres = new Set<string>();
      for (const f of [0.5, 0.25, 0.75]) {
        const s = t.desde + (t.hasta - t.desde) * f;
        for (const n of pliegueEn(p, curva.punto(s), curva.tangente(s), false, true, tol).primitivas ?? []) nombres.add(n);
      }
      return { ...t, primitivas: [...nombres] };
    });
}
