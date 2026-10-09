/**
 * Las curvas candidatas (§3.2, paso 2): todas las líneas que *podrían* ser
 * aristas. Que lo sean o no lo decide después la prueba del pliegue
 * (`pliegue.ts`); aquí se pecha por exceso, porque una candidata de más se
 * descarta con su motivo, y una de menos es una arista que no se dibuja.
 *
 *   · las aristas propias de cada primitiva: los bordes de sus caras y sus
 *     circunferencias;
 *   · los cruces entre primitivas: plano con plano es una recta recortada
 *     por las dos caras; plano con cilindro o cono, y cilindro o cono entre
 *     sí, se resuelven muestreando las generatrices de uno contra la
 *     superficie del otro;
 *   · en cada vista, las generatrices de contorno aparente de los cilindros
 *     y conos que se ven de lado.
 */
import { recorre, type Curva3, type CurvaRecorrida } from './curvas.ts';
import { aLocal, seTocanCajas, type PiezaCompilada } from './pieza.ts';
import { cortesDeCircunferencias } from './plano2d.ts';
import {
  aristasDe,
  carasDe,
  enRegion,
  intervalosEnCara,
  puntoDeSuperficie,
  radioDeSuperficie,
  superficieDe,
  type CaraPlana,
  type SuperficieCurva,
} from './superficies.ts';
import { BISECCIONES, CASI_CERO, FLECHA_MAXIMA, GENERATRICES, HOLGURA_NUMERICA, LARGO_MINIMO, MARGEN_CAJA, TOL_EXACTA } from './tolerancias.ts';
import { avanza3, distancia3, escalar3, modulo3, por3, resta3, suma3, unitario3, vectorial3, type V3 } from './vector.ts';

export type ClaseDeCandidata = 'arista' | 'cruce' | 'contorno';

export interface Candidata {
  readonly curva: CurvaRecorrida;
  /** Las primitivas de las que sale, por su índice. */
  readonly de: readonly number[];
  readonly clase: ClaseDeCandidata;
}


const DOS_PI = 2 * Math.PI;

type Intervalo = readonly [number, number];

function corta(a: readonly Intervalo[], b: readonly Intervalo[]): Intervalo[] {
  const r: Intervalo[] = [];
  for (const [p, q] of a) for (const [s, t] of b) if (Math.min(q, t) - Math.max(p, s) > 0) r.push([Math.max(p, s), Math.min(q, t)]);
  return r.sort((x, y) => x[0] - y[0]);
}

/** El intervalo de s en que p0 + s·dir está dentro de la caja de la pieza
 *  agrandada. */
function enCaja(p: PiezaCompilada, p0: V3, dir: V3): Intervalo[] {
  let [lo, hi] = [-Infinity, Infinity];
  for (let k = 0; k < 3; k++) {
    const [a, b] = [p.caja.min[k] - MARGEN_CAJA, p.caja.max[k] + MARGEN_CAJA];
    if (Math.abs(dir[k]) < CASI_CERO) {
      if (p0[k] < a || p0[k] > b) return [];
      continue;
    }
    const [s, t] = [(a - p0[k]) / dir[k], (b - p0[k]) / dir[k]];
    lo = Math.max(lo, Math.min(s, t));
    hi = Math.min(hi, Math.max(s, t));
  }
  return hi > lo ? [[lo, hi]] : [];
}

/**
 * Los trozos de la vuelta en que se cumple algo, como [θa, θb] con θb > θa
 * (un trozo que pasa por cero acaba por encima de 2π). Se muestrea a un
 * grado y cada borde se afina por bisección.
 */
function rachas(vale: (t: number) => boolean): [number, number][] {
  const paso = DOS_PI / GENERATRICES;
  const muestras = Array.from({ length: GENERATRICES }, (_, k) => vale(k * paso));
  if (muestras.every(Boolean)) return [[0, DOS_PI]];
  if (!muestras.some(Boolean)) return [];
  /* De a, donde se cumple, hacia b, donde no; se devuelve el último punto
     donde se cumple, para que la curva se pueda evaluar en él. */
  const borde = (a: number, b: number): number => {
    for (let i = 0; i < BISECCIONES; i++) {
      const m = (a + b) / 2;
      if (vale(m)) a = m;
      else b = m;
    }
    return a;
  };
  const r: [number, number][] = [];
  const inicio = muestras.findIndex((v, k) => !v && muestras[(k + 1) % GENERATRICES]);
  for (let n = 0; n < GENERATRICES; n++) {
    const k = (inicio + n) % GENERATRICES;
    const sig = (k + 1) % GENERATRICES;
    const theta = (inicio + n) * paso;
    if (!muestras[k] && muestras[sig]) r.push([borde(theta + paso, theta), Number.NaN]);
    else if (muestras[k] && !muestras[sig] && r.length) r[r.length - 1][1] = borde(theta, theta + paso);
  }
  return r.filter(([a, b]) => b > a);
}

/** Lo más que se parte una cuerda al afinar una polilínea, y lo más que
 *  puede crecer: un tope, por si una curva no se dejara aproximar. */
const MAS_PUNTOS = 20 * GENERATRICES;

/**
 * Una polilínea por un trozo [θa, θb] de una curva dada por su ángulo. Se
 * toma un punto por grado y, entre dos, se parte la cuerda mientras su
 * mitad se aparte de la curva más que FLECHA_MAXIMA. Cerca de donde una
 * curva de corte gira —la generatriz de un tubo, tangente al otro—, la curva
 * cambia muy deprisa con el ángulo, y la cuerda de un grado se apartaba de
 * la superficie del otro tubo más que TOL_MUESTREADA: la prueba del pliegue
 * veía allí una sola superficie y la arista se cortaba entre 1 y 9 mm
 * (segunda revisión del 9 de octubre de 2026). Los puntos que la curva no
 * da (null) se saltan.
 */
function polilineaDe(a: number, b: number, punto: (t: number) => V3 | null, extras: readonly number[] = []): Curva3 {
  const paso = DOS_PI / GENERATRICES;
  const angulos: number[] = [a];
  for (let t = Math.ceil(a / paso + HOLGURA_NUMERICA) * paso; t < b - HOLGURA_NUMERICA; t += paso) angulos.push(t);
  /* Los ángulos de más (los puntos singulares), llevados a la vuelta del
     trozo. */
  for (const e of extras) {
    const t = a + ((((e - a) % DOS_PI) + DOS_PI) % DOS_PI);
    if (t > a + HOLGURA_NUMERICA && t < b - HOLGURA_NUMERICA) angulos.push(t);
  }
  angulos.push(b);
  angulos.sort((x, y) => x - y);
  const base = angulos.map((t) => ({ t, p: punto(t) })).filter((x): x is { t: number; p: V3 } => x.p !== null);
  const puntos: V3[] = base.length ? [base[0].p] : [];
  let anadidos = 0;
  const afina = (t0: number, p0: V3, t1: number, p1: V3, hondo: number): void => {
    if (hondo < BISECCIONES && anadidos < MAS_PUNTOS) {
      const tm = (t0 + t1) / 2;
      const pm = punto(tm);
      if (pm && distancia3(pm, por3(suma3(p0, p1), 0.5)) > FLECHA_MAXIMA) {
        anadidos++;
        afina(t0, p0, tm, pm, hondo + 1);
        afina(tm, pm, t1, p1, hondo + 1);
        return;
      }
    }
    puntos.push(p1);
  };
  for (let k = 1; k < base.length; k++) afina(base[k - 1].t, base[k - 1].p, base[k].t, base[k].p, 0);
  return { tipo: 'polilinea', puntos };
}

/* ── Plano con plano ──────────────────────────────────────────────────── */

function cruceDeCaras(p: PiezaCompilada, f: CaraPlana, g: CaraPlana): Curva3[] {
  const dir = vectorial3(f.n, g.n);
  if (modulo3(dir) < HOLGURA_NUMERICA) return [];
  const u = unitario3(dir);
  /* El punto de la recta común más cerca del origen: los tres planos
     n1·p = d1, n2·p = d2 y u·p = 0. */
  const det = escalar3(f.n, vectorial3(g.n, u));
  const p0 = por3(suma3(por3(vectorial3(g.n, u), f.d), por3(vectorial3(u, f.n), g.d)), 1 / det);
  const trozos = corta(corta(intervalosEnCara(f, p0, u), intervalosEnCara(g, p0, u)), enCaja(p, p0, u));
  return trozos.filter(([s, t]) => t - s > LARGO_MINIMO).map(([s, t]) => ({ tipo: 'segmento', a: avanza3(p0, u, s), b: avanza3(p0, u, t) }));
}

/* ── Plano con cilindro o cono ────────────────────────────────────────── */

function cruceCaraSuperficie(f: CaraPlana, s: SuperficieCurva): Curva3[] {
  const na = escalar3(f.n, s.eje);
  const esCilindro = Math.abs(s.r1 - s.r0) < CASI_CERO;
  /* El plano, perpendicular al eje: una circunferencia, exacta. */
  if (Math.abs(na) > 1 - HOLGURA_NUMERICA) {
    const w = (f.d - escalar3(f.n, s.o)) / na;
    if (w < s.w0 - HOLGURA_NUMERICA || w > s.w1 + HOLGURA_NUMERICA) return [];
    const r = radioDeSuperficie(s, w);
    if (r < LARGO_MINIMO) return [];
    const c = avanza3(s.o, s.eje, w);
    return rachas((t) => enRegion(f, puntoDeSuperficie(s, t, w))).map(([a, b]) => ({ tipo: 'arco', c, e1: s.e1, e2: s.e2, r, desde: a, hasta: b }));
  }
  /* Un cilindro con el plano paralelo a su eje: una o dos generatrices. */
  if (esCilindro && Math.abs(na) < HOLGURA_NUMERICA) {
    const delta = f.d - escalar3(f.n, s.o);
    if (Math.abs(delta) > s.r0 + HOLGURA_NUMERICA) return [];
    const h = Math.sqrt(Math.max(0, s.r0 * s.r0 - delta * delta));
    const m = unitario3(vectorial3(s.eje, f.n));
    const bases = h < HOLGURA_NUMERICA ? [avanza3(s.o, f.n, delta)] : [-1, 1].map((k) => avanza3(avanza3(s.o, f.n, delta), m, k * h));
    return bases.flatMap((b) =>
      corta(intervalosEnCara(f, b, s.eje), [[s.w0, s.w1]])
        .filter(([p, q]) => q - p > LARGO_MINIMO)
        .map(([p, q]): Curva3 => ({ tipo: 'segmento', a: avanza3(b, s.eje, p), b: avanza3(b, s.eje, q) })),
    );
  }
  /* Lo demás: cada generatriz contra el plano. */
  const corteEn = (t: number): V3 | null => {
    const g0 = puntoDeSuperficie(s, t, s.w0);
    const g1 = puntoDeSuperficie(s, t, s.w1);
    const den = escalar3(f.n, resta3(g1, g0));
    if (Math.abs(den) < CASI_CERO) return null;
    const lambda = (f.d - escalar3(f.n, g0)) / den;
    if (lambda < -CASI_CERO || lambda > 1 + CASI_CERO) return null;
    const q = avanza3(g0, resta3(g1, g0), lambda);
    return enRegion(f, q) ? q : null;
  };
  return rachas((t) => corteEn(t) !== null).map(([a, b]) => polilineaDe(a, b, (t) => corteEn(t) ?? corteEn(t + HOLGURA_NUMERICA)));
}

/* ── Cilindro o cono con cilindro o cono ──────────────────────────────── */

/** Los cortes de la generatriz θ de `a` con la superficie de `b`, del de
 *  menor parámetro al de mayor: hasta dos. */
/** Los parámetros λ (de 0 a 1 a lo largo de la generatriz θ de `a`) donde
 *  corta la superficie de `b`, de menor a mayor: hasta dos. */
function raicesDeGeneratriz(a: SuperficieCurva, t: number, b: SuperficieCurva): { g0: V3; g1: V3; raices: number[] } {
  const g0 = puntoDeSuperficie(a, t, a.w0);
  const g1 = puntoDeSuperficie(a, t, a.w1);
  const marco = { o: b.o, e: [b.e1, b.e2, b.eje] as const };
  const [x0, y0, w0] = aLocal(marco, g0);
  const [x1, y1, w1] = aLocal(marco, g1);
  const [dx, dy, dw] = [x1 - x0, y1 - y0, w1 - w0];
  const k = (b.r1 - b.r0) / (b.w1 - b.w0);
  const R0 = b.r0 + k * (w0 - b.w0);
  const A = dx * dx + dy * dy - k * k * dw * dw;
  const B = 2 * (x0 * dx + y0 * dy - R0 * k * dw);
  const C = x0 * x0 + y0 * y0 - R0 * R0;
  let raices: number[];
  if (Math.abs(A) < CASI_CERO) raices = Math.abs(B) < CASI_CERO ? [] : [-C / B];
  else {
    /* Una raíz doble —la generatriz tangente a la otra superficie, en el
       punto singular de dos tubos del mismo radio— sale con el
       discriminante en −10⁻¹⁶: es cero, y si se perdiera, la polilínea
       cortaría la esquina 0,17 mm. */
    let disc = B * B - 4 * A * C;
    if (disc < 0 && disc > -HOLGURA_NUMERICA * B * B) disc = 0;
    if (disc < 0) return { g0, g1, raices: [] };
    const q = Math.sqrt(disc);
    raices = [(-B - q) / (2 * A), (-B + q) / (2 * A)].sort((p, r) => p - r);
  }
  raices = raices.filter((l) => {
    const w = w0 + l * dw;
    return l >= -CASI_CERO && l <= 1 + CASI_CERO && w >= b.w0 - HOLGURA_NUMERICA && w <= b.w1 + HOLGURA_NUMERICA && R0 + k * l * dw >= -CASI_CERO;
  });
  return { g0, g1, raices };
}

function cortesDeGeneratriz(a: SuperficieCurva, t: number, b: SuperficieCurva): V3[] {
  const { g0, g1, raices } = raicesDeGeneratriz(a, t, b);
  return raices.map((l) => avanza3(g0, resta3(g1, g0), l));
}

/**
 * Los ángulos donde las dos ramas de un corte se tocan sin acabarse: un
 * punto singular, donde la curva hace esquina. Entre dos muestras la
 * polilínea cortaría la esquina, así que se busca el mínimo de la
 * separación entre las dos raíces (por tercios) y se mete ese ángulo.
 */
function angulosSingulares(a: SuperficieCurva, b: SuperficieCurva): number[] {
  const paso = DOS_PI / GENERATRICES;
  const separacion = (t: number) => {
    const r = raicesDeGeneratriz(a, t, b).raices;
    return r.length === 2 ? r[1] - r[0] : Infinity;
  };
  const g = Array.from({ length: GENERATRICES }, (_, k) => separacion(k * paso));
  const r: number[] = [];
  for (let k = 0; k < GENERATRICES; k++) {
    const [antes, ahora, luego] = [g[(k + GENERATRICES - 1) % GENERATRICES], g[k], g[(k + 1) % GENERATRICES]];
    if (!Number.isFinite(ahora) || ahora > antes || ahora > luego || !Number.isFinite(antes) || !Number.isFinite(luego)) continue;
    let [lo, hi] = [(k - 1) * paso, (k + 1) * paso];
    for (let i = 0; i < BISECCIONES; i++) {
      const [m1, m2] = [lo + (hi - lo) / 3, hi - (hi - lo) / 3];
      if (separacion(m1) < separacion(m2)) hi = m2;
      else lo = m1;
    }
    const t = (lo + hi) / 2;
    if (separacion(t) < LARGO_MINIMO / modulo3(resta3(puntoDeSuperficie(a, t, a.w1), puntoDeSuperficie(a, t, a.w0)))) r.push(t);
  }
  return r;
}

/**
 * Dos superficies de ejes paralelos, que el muestreo de generatrices no ve
 * siempre: cada generatriz de un cilindro es paralela al eje del otro y no
 * lo corta nunca, y así dos cilindros que se cortan no daban su arista de
 * encuentro (revisión del 9 de octubre de 2026).
 *   · dos cilindros: sus circunferencias se cortan en cero, uno o dos
 *     puntos, y por cada uno va una generatriz común, recortada a donde
 *     están los dos;
 *   · coaxiales: donde se igualan los radios, una circunferencia exacta (el
 *     encuentro de un taladro con su avellanado);
 *   · lo demás —un cono y algo paralelo sin ser coaxial— lo resuelve el
 *     muestreo, porque la generatriz del cono no es paralela a nada: null.
 */
function cruceDeParalelas(s: SuperficieCurva, t: SuperficieCurva): Curva3[] | null {
  const sentido = escalar3(s.eje, t.eje) > 0 ? 1 : -1;
  const d = resta3(t.o, s.o);
  const [cx, cy, dw] = [escalar3(d, s.e1), escalar3(d, s.e2), escalar3(d, s.eje)];
  /* El punto de altura w de s está en la altura sentido·(w − dw) de t. */
  const [ta, tb] = [dw + sentido * t.w0, dw + sentido * t.w1];
  const [w0, w1] = [Math.max(s.w0, Math.min(ta, tb)), Math.min(s.w1, Math.max(ta, tb))];
  if (w1 - w0 < LARGO_MINIMO) return [];
  if (Math.hypot(cx, cy) < TOL_EXACTA) {
    const ks = (s.r1 - s.r0) / (s.w1 - s.w0);
    const kt = (t.r1 - t.r0) / (t.w1 - t.w0);
    const rs = (w: number) => s.r0 + ks * (w - s.w0);
    const rt = (w: number) => t.r0 + kt * (sentido * (w - dw) - t.w0);
    const pendiente = ks - kt * sentido;
    if (Math.abs(pendiente) < CASI_CERO) return [];
    const w = (rt(0) - rs(0)) / pendiente;
    if (w < w0 - TOL_EXACTA || w > w1 + TOL_EXACTA || rs(w) < LARGO_MINIMO) return [];
    return [{ tipo: 'arco', c: avanza3(s.o, s.eje, w), e1: s.e1, e2: s.e2, r: rs(w), desde: 0, hasta: DOS_PI }];
  }
  const cilindros = Math.abs(s.r1 - s.r0) < CASI_CERO && Math.abs(t.r1 - t.r0) < CASI_CERO;
  if (!cilindros) return null;
  return cortesDeCircunferencias([0, 0], s.r0, [cx, cy], t.r0).map(([x, y]): Curva3 => {
    const base = suma3(s.o, suma3(por3(s.e1, x), por3(s.e2, y)));
    return { tipo: 'segmento', a: avanza3(base, s.eje, w0), b: avanza3(base, s.eje, w1) };
  });
}

function cruceDeSuperficies(s: SuperficieCurva, t: SuperficieCurva): Curva3[] {
  if (modulo3(vectorial3(s.eje, t.eje)) < HOLGURA_NUMERICA) {
    const paralelas = cruceDeParalelas(s, t);
    if (paralelas) return paralelas;
  }
  /* Se muestrea la de menor radio contra la otra, para no quedarse con dos
     puntos de una curva pequeña. */
  const [a, b] = Math.max(s.r0, s.r1) <= Math.max(t.r0, t.r1) ? [s, t] : [t, s];
  const singulares = angulosSingulares(a, b);
  const curvas: Curva3[] = [];
  for (const rama of [0, 1]) {
    const corte = (th: number): V3 | null => {
      const c = cortesDeGeneratriz(a, th, b);
      return c.length === 2 ? c[rama] : c.length === 1 && rama === 0 ? c[0] : null;
    };
    for (const [p, q] of rachas((th) => corte(th) !== null)) {
      curvas.push(polilineaDe(p, q, (th) => corte(th) ?? corte(th + HOLGURA_NUMERICA) ?? corte(th - HOLGURA_NUMERICA), singulares));
    }
  }
  return juntaPorLosExtremos(curvas);
}

/** Junta las polilíneas que acaban donde empieza otra: las dos ramas de un
 *  corte se encuentran donde la generatriz es tangente a la otra superficie. */
function juntaPorLosExtremos(curvas: Curva3[]): Curva3[] {
  const lineas = curvas.map((c) => (c.tipo === 'polilinea' ? [...c.puntos] : null));
  const otras = curvas.filter((c) => c.tipo !== 'polilinea');
  const cerca = (p: V3, q: V3) => distancia3(p, q) < LARGO_MINIMO;
  let junto = true;
  while (junto) {
    junto = false;
    for (let i = 0; i < lineas.length && !junto; i++) {
      for (let j = 0; j < lineas.length && !junto; j++) {
        const [a, b] = [lineas[i], lineas[j]];
        if (i === j || !a || !b) continue;
        const [a0, a1, b0, b1] = [a[0], a[a.length - 1], b[0], b[b.length - 1]];
        let nueva: V3[] | null = null;
        if (cerca(a1, b0)) nueva = [...a, ...b.slice(1)];
        else if (cerca(a1, b1)) nueva = [...a, ...[...b].reverse().slice(1)];
        else if (cerca(a0, b1)) nueva = [...b, ...a.slice(1)];
        else if (cerca(a0, b0)) nueva = [...[...b].reverse(), ...a.slice(1)];
        if (nueva) {
          lineas[i] = nueva;
          lineas[j] = null;
          junto = true;
        }
      }
    }
  }
  return [...otras, ...lineas.filter((l): l is V3[] => l !== null).map((puntos): Curva3 => ({ tipo: 'polilinea', puntos }))];
}

/* ── Las candidatas de la pieza ───────────────────────────────────────── */

/** Las candidatas que no dependen de la vista. */
export function candidatasFijas(p: PiezaCompilada): Candidata[] {
  const r: Candidata[] = [];
  const mete = (c: Curva3, de: number[], clase: ClaseDeCandidata) => {
    const curva = recorre(c);
    if (curva.largo > LARGO_MINIMO) r.push({ curva, de, clase });
  };
  const caras = p.primitivas.map(carasDe);
  const superficies = p.primitivas.map(superficieDe);
  p.primitivas.forEach((prim, i) => aristasDe(prim).forEach((c) => mete(c, [i], 'arista')));
  const n = p.primitivas.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      /* Dos primitivas cuyas cajas no se tocan no se cortan: no se miran. */
      if (i === j || !seTocanCajas(p.cajas[i], p.cajas[j], MARGEN_CAJA)) continue;
      if (i < j) for (const f of caras[i]) for (const g of caras[j]) cruceDeCaras(p, f, g).forEach((c) => mete(c, [i, j], 'cruce'));
      const s = superficies[j];
      if (s) for (const f of caras[i]) cruceCaraSuperficie(f, s).forEach((c) => mete(c, [i, j], 'cruce'));
      const t = superficies[i];
      if (i < j && s && t) cruceDeSuperficies(t, s).forEach((c) => mete(c, [i, j], 'cruce'));
    }
  }
  return r;
}

/**
 * Las generatrices de contorno aparente de cada cilindro y cono, vistos
 * desde `haciaObservador` (la dirección que va de la pieza a quien mira).
 * En un cilindro, las dos donde la normal es perpendicular a la mirada; en
 * un cono, donde (N(θ) − k·eje)·v = 0, con k lo que crece el radio por mm.
 */
export function contornos(p: PiezaCompilada, haciaObservador: V3): Candidata[] {
  const r: Candidata[] = [];
  for (const prim of p.primitivas) {
    const s = superficieDe(prim);
    if (!s) continue;
    const v = haciaObservador;
    const k = (s.r1 - s.r0) / (s.w1 - s.w0);
    const [A, B] = [escalar3(s.e1, v), escalar3(s.e2, v)];
    const m = Math.hypot(A, B);
    if (m < HOLGURA_NUMERICA) continue;
    const c = (k * escalar3(s.eje, v)) / m;
    if (Math.abs(c) > 1) continue;
    const fi = Math.atan2(B, A);
    const giro = Math.acos(c);
    for (const t of [fi + giro, fi - giro]) {
      const a = puntoDeSuperficie(s, t, s.w0);
      const b = puntoDeSuperficie(s, t, s.w1);
      if (distancia3(a, b) > LARGO_MINIMO) r.push({ curva: recorre({ tipo: 'segmento', a, b }), de: [prim.indice], clase: 'contorno' });
    }
  }
  return r;
}
