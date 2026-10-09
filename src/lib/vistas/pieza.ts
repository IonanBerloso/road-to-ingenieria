/**
 * La pieza como datos (diseño de la fase M, §3.1): el árbol de sumas, restas
 * e intersecciones de primitivas con nombre que escribe quien prepara un
 * ejercicio, lo que se comprueba de él y su pertenencia.
 *
 * Se lee como el árbol de operaciones de un CAD —extrusión, vaciado,
 * taladro—, que es lo que el alumno hará en Solid Edge en el bloque 3. La
 * forma de los tipos es la del YAML del diseño, para que el esquema de la
 * colección `piezas` (todavía por escribir) sea una traducción y no una
 * reinvención.
 *
 * LA PERTENENCIA ES LO ÚNICO EXACTO. Cada primitiva sabe si un punto está
 * dentro y el árbol combina las respuestas; todo lo demás del motor —las
 * aristas, el pliegue, la visibilidad— se apoya en esta pregunta. También es
 * lo único que comparte el motor con su segundo camino, el oráculo de
 * `tests/vistas/oraculo.test.ts` (§10).
 *
 * Fuera, declarado (§3.1): toros, esferas y superficies libres. Los
 * redondeos de las placas son cilindros sumados tangentes a la caja.
 */
import type { P2 } from '../diedrico.ts';
import { areaConSigno, distanciaAlBorde, enPoligono, estrechez, limpiaPoligono, seCortaASiMismo } from './plano2d.ts';
import { ESPESOR_MINIMO, HOLGURA_NUMERICA, LARGO_MINIMO, MARGEN_CAJA } from './tolerancias.ts';
import { escalar3, gira3, por3, resta3, suma3, unitario3, vectorial3, type V3 } from './vector.ts';

/* ── Lo que se escribe ────────────────────────────────────────────────── */

export type Eje = 'x' | 'y' | 'z';
export type Par = readonly [number, number];

/** Un giro de la primitiva alrededor de la recta paralela a `eje` que pasa
 *  por `por` (el origen si no se dice), en grados y con la mano derecha. Es
 *  lo que pide un brazo a 45° de las Tareas 82 y 83. */
export interface Giro {
  readonly eje: Eje;
  readonly grados: number;
  readonly por?: V3;
}

interface Comun {
  readonly nombre: string;
  readonly gira?: Giro;
  /** Solo en una resta: lo que quita, lo quita de esa suma y de nada más.
   *  El chaflán de la espiga va `dentro: torre`, y así no muerde la base. */
  readonly dentro?: string;
}

/** [x0, x1, y0, y1, z0, z1], en mm. */
export interface CajaDeclarada extends Comun {
  readonly caja: readonly [number, number, number, number, number, number];
}

/** La extrusión de un polígono, convexo o no. `plano` dice en qué
 *  coordenadas va el polígono —'xz' son (x, z)— y la extrusión va por la
 *  tercera, de `desde` a `hasta`. */
export interface PrismaDeclarado extends Comun {
  readonly prisma: { readonly plano: 'xy' | 'xz' | 'yz'; readonly poligono: readonly Par[]; readonly desde: number; readonly hasta: number };
}

/** `centro` son las otras dos coordenadas, en orden (para `eje: y`, x y z).
 *  Sin `desde` ni `hasta` es pasante: atraviesa la pieza entera, y solo
 *  puede ir restando. */
export interface CilindroDeclarado extends Comun {
  readonly cilindro: { readonly eje: Eje; readonly centro: Par; readonly r: number; readonly desde?: number; readonly hasta?: number };
}

/** Un tronco de cono: radio `r0` en `desde` y `r1` en `hasta`. */
export interface ConoDeclarado extends Comun {
  readonly cono: { readonly eje: Eje; readonly centro: Par; readonly r0: number; readonly r1: number; readonly desde: number; readonly hasta: number };
}

/** El semiespacio que queda detrás de su normal: los puntos con
 *  normal·(p − pasa) ≤ 0. Restado, quita eso: chaflanes y cortes oblicuos. */
export interface SemiespacioDeclarado extends Comun {
  readonly semiespacio: { readonly normal: V3; readonly pasa: V3 };
}

export interface GrupoDeclarado extends Comun {
  readonly suma: readonly SolidoDeclarado[];
  readonly resta?: readonly SolidoDeclarado[];
  readonly interseca?: readonly SolidoDeclarado[];
}

export type SolidoDeclarado = CajaDeclarada | PrismaDeclarado | CilindroDeclarado | ConoDeclarado | SemiespacioDeclarado | GrupoDeclarado;

export type Ocultas = 'todas' | 'necesarias' | 'ninguna';

export interface PiezaDeclarada {
  readonly codigo: string;
  readonly fuente: string;
  readonly cotas?: 'dadas' | 'proporcionales';
  readonly suma: readonly SolidoDeclarado[];
  readonly resta?: readonly SolidoDeclarado[];
  readonly interseca?: readonly SolidoDeclarado[];
  readonly noSeCorta?: readonly string[];
  readonly simetria?: readonly { readonly plano: Eje; readonly en: number }[];
  /** La convención del ejercicio (§1.3 del diseño). El motor calcula
   *  siempre todas; esto dice cuáles se dibujan. Sin decir, todas. */
  readonly ocultas?: Ocultas;
}

/* ── Lo que se compila ────────────────────────────────────────────────── */

/** El marco local de una primitiva: su origen y sus tres ejes, unitarios y
 *  perpendiculares, en coordenadas del mundo. No tiene por qué ser de mano
 *  derecha: la pertenencia no lo nota. */
export interface Marco {
  readonly o: V3;
  readonly e: readonly [V3, V3, V3];
}

/** La forma en su marco. Lo que tiene eje lo tiene en la tercera
 *  coordenada local, `w`; el semiespacio es `w ≤ 0`. */
export type FormaLocal =
  | { readonly tipo: 'caja'; readonly min: V3; readonly max: V3 }
  | { readonly tipo: 'prisma'; readonly poligono: readonly P2[]; readonly w0: number; readonly w1: number }
  | { readonly tipo: 'cilindro'; readonly r: number; readonly w0: number; readonly w1: number }
  | { readonly tipo: 'cono'; readonly r0: number; readonly r1: number; readonly w0: number; readonly w1: number }
  | { readonly tipo: 'semiespacio' };

export interface Primitiva {
  readonly nombre: string;
  readonly indice: number;
  readonly marco: Marco;
  readonly forma: FormaLocal;
}

/** El árbol de la pieza. Cada nodo que no es hoja lleva, ya compilado, la
 *  caja de lo que puede tener dentro (null si no tiene fin): una pregunta
 *  por un punto o por un rayo no baja por las ramas cuya caja queda lejos. */
export type Nodo =
  | { readonly op: 'hoja'; readonly i: number }
  | { readonly op: 'union'; readonly hijos: readonly Nodo[]; readonly caja?: Caja3 | null }
  | { readonly op: 'resta'; readonly de: Nodo; readonly quita: Nodo; readonly caja?: Caja3 | null }
  | { readonly op: 'interseca'; readonly hijos: readonly Nodo[]; readonly caja?: Caja3 | null };

export interface Caja3 {
  readonly min: V3;
  readonly max: V3;
}

export interface PiezaCompilada {
  readonly codigo: string;
  readonly fuente: string;
  readonly primitivas: readonly Primitiva[];
  readonly arbol: Nodo;
  /** La caja que envuelve la pieza, en el mundo. */
  readonly caja: Caja3;
  /** La de cada primitiva, en su orden; null si no tiene fin (un
   *  semiespacio). Con ellas, preguntar si un punto está dentro o qué cruza
   *  un rayo no recorre las primitivas que quedan lejos: sin esto, el motor
   *  crecía con el cuadrado de los agujeros de una placa. */
  readonly cajas: readonly (Caja3 | null)[];
  readonly simetria: readonly { readonly plano: Eje; readonly en: number }[];
  readonly ocultas: Ocultas;
  readonly noSeCorta: readonly string[];
}


/* ── Lo que se comprueba ──────────────────────────────────────────────── */

const EJES: readonly Eje[] = ['x', 'y', 'z'];
const finito = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n);
const esGrupo = (s: SolidoDeclarado): s is GrupoDeclarado => 'suma' in s;

/** De qué es una primitiva, por la clave que lleva. */
function claseDe(s: SolidoDeclarado): string[] {
  return ['caja', 'prisma', 'cilindro', 'cono', 'semiespacio', 'suma'].filter((k) => k in s);
}

type Donde = 'suma' | 'resta' | 'interseca';

const terna = (x: unknown): boolean => Array.isArray(x) && x.length === 3 && x.every(finito);

/** Lo que está mal en la forma de una primitiva: sus números, y si puede ir
 *  donde va. */
function problemasDeForma(s: Exclude<SolidoDeclarado, GrupoDeclarado>, quien: string, donde: Donde): string[] {
  const r: string[] = [];
  const delgada = `${quien} es más delgada que ${ESPESOR_MINIMO} mm: la sonda del pliegue la atraviesa y el motor no la vería`;
  if ('caja' in s) {
    const c = s.caja;
    if (!Array.isArray(c) || c.length !== 6 || !c.every(finito)) r.push(`${quien}: la caja son seis números, [x0, x1, y0, y1, z0, z1]`);
    else if (!(c[0] < c[1] && c[2] < c[3] && c[4] < c[5])) r.push(`${quien}: la caja tiene que cumplir x0 < x1, y0 < y1 y z0 < z1`);
    else if (c[1] - c[0] < ESPESOR_MINIMO || c[3] - c[2] < ESPESOR_MINIMO || c[5] - c[4] < ESPESOR_MINIMO) r.push(delgada);
  } else if ('prisma' in s) {
    const p = s.prisma;
    if (!['xy', 'xz', 'yz'].includes(p.plano)) r.push(`${quien}: el plano del prisma es xy, xz o yz`);
    if (!Array.isArray(p.poligono) || !p.poligono.every((q) => Array.isArray(q) && q.length === 2 && q.every(finito))) {
      r.push(`${quien}: cada vértice del polígono del prisma son dos números`);
    } else {
      const pol = limpiaPoligono(p.poligono);
      /* Dos vértices seguidos que casi coinciden, sin llegar a quitarse al
         limpiar: lo más probable es un vértice escrito dos veces con una
         errata, y decir «delgada» no ayudaría a encontrarlo. */
      const n = p.poligono.length;
      const casi = p.poligono.findIndex((q, i) => {
        const s = p.poligono[(i + 1) % n];
        const d = Math.hypot(s[0] - q[0], s[1] - q[1]);
        return d >= LARGO_MINIMO && d < ESPESOR_MINIMO;
      });
      if (pol.length < 3) r.push(`${quien}: el polígono del prisma necesita tres vértices distintos o más`);
      else if (casi >= 0) {
        const [a, b] = [p.poligono[casi], p.poligono[(casi + 1) % n]];
        const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
        r.push(`${quien}: los vértices ${casi + 1} y ${((casi + 1) % n) + 1} del polígono están a ${d.toPrecision(2)} mm: parece un vértice casi repetido, y sobra uno`);
      } else if (seCortaASiMismo(pol)) r.push(`${quien}: el polígono del prisma se corta a sí mismo, y eso no es una sección`);
      else if (Math.abs(areaConSigno(pol)) < LARGO_MINIMO ** 2) r.push(`${quien}: el polígono del prisma no tiene área`);
      else if (estrechez(pol) < ESPESOR_MINIMO) r.push(delgada);
    }
    if (!finito(p.desde) || !finito(p.hasta) || !(p.desde < p.hasta)) r.push(`${quien}: el prisma va de «desde» a «hasta», con desde < hasta`);
    else if (p.hasta - p.desde < ESPESOR_MINIMO) r.push(delgada);
  } else if ('semiespacio' in s) {
    const h = s.semiespacio;
    if (!terna(h.normal) || Math.hypot(...h.normal) < HOLGURA_NUMERICA) r.push(`${quien}: la normal del semiespacio no puede ser nula`);
    if (!terna(h.pasa)) r.push(`${quien}: el semiespacio necesita un punto por el que pasa`);
    if (donde === 'suma') r.push(`${quien}: un semiespacio sumado no tiene fin; solo puede restar o intersecar`);
  } else {
    const c = 'cilindro' in s ? s.cilindro : s.cono;
    if (!EJES.includes(c.eje)) r.push(`${quien}: el eje es x, y o z`);
    if (!Array.isArray(c.centro) || c.centro.length !== 2 || !c.centro.every(finito)) r.push(`${quien}: el centro son las otras dos coordenadas del eje`);
    if ('cilindro' in s) {
      const { r: radio, desde, hasta } = s.cilindro;
      if (!finito(radio) || radio <= 0) r.push(`${quien}: el radio tiene que ser positivo`);
      else if (2 * radio < ESPESOR_MINIMO) r.push(delgada);
      if ((desde === undefined) !== (hasta === undefined)) r.push(`${quien}: «desde» y «hasta» van juntos, o ninguno si es pasante`);
      else if (desde === undefined) {
        if (donde !== 'resta') r.push(`${quien}: un cilindro pasante, sin «desde» ni «hasta», solo puede ir restando`);
      } else if (!finito(desde) || !finito(hasta) || !(desde < (hasta as number))) r.push(`${quien}: desde < hasta`);
      else if ((hasta as number) - desde < ESPESOR_MINIMO) r.push(delgada);
    } else {
      const k = s.cono;
      if (!finito(k.r0) || !finito(k.r1) || k.r0 < 0 || k.r1 < 0 || k.r0 + k.r1 <= 0) r.push(`${quien}: los radios del cono son positivos o cero, y no los dos cero`);
      if (!finito(k.desde) || !finito(k.hasta) || !(k.desde < k.hasta)) r.push(`${quien}: desde < hasta`);
      else if (k.hasta - k.desde < ESPESOR_MINIMO || 2 * Math.max(k.r0, k.r1) < ESPESOR_MINIMO) r.push(delgada);
    }
  }
  return r;
}

/** Lo que está mal en una pieza, en frases; vacío si nada. */
export function problemasDePieza(d: PiezaDeclarada): string[] {
  const problemas: string[] = [];
  if (!d.codigo) problemas.push('la pieza no tiene código');
  if (!d.fuente || d.fuente.length < 10) problemas.push('la pieza no dice de dónde sale (fuente, 10 caracteres o más)');
  const nombres = new Map<string, number>();

  const revisa = (s: SolidoDeclarado, donde: Donde, hermanas: readonly SolidoDeclarado[]) => {
    const quien = `«${s.nombre ?? '?'}»`;
    if (!s.nombre) problemas.push('hay una primitiva sin nombre');
    nombres.set(s.nombre, (nombres.get(s.nombre) ?? 0) + 1);
    if (claseDe(s).length !== 1) {
      problemas.push(`${quien} tiene que ser una caja, un prisma, un cilindro, un cono, un semiespacio o un grupo con suma, y solo una cosa`);
      return;
    }
    if (s.gira && (!EJES.includes(s.gira.eje) || !finito(s.gira.grados))) problemas.push(`${quien}: el giro necesita eje (x, y o z) y grados`);
    if (s.gira?.por !== undefined && !terna(s.gira.por)) problemas.push(`${quien}: el punto por el que pasa el eje del giro («por») son tres números`);
    if (s.dentro !== undefined) {
      if (donde !== 'resta') problemas.push(`${quien}: «dentro» solo tiene sentido en una resta`);
      else if (!hermanas.some((h) => h.nombre === s.dentro)) problemas.push(`${quien} va dentro de «${s.dentro}», que no es ninguna suma de su nivel`);
    }
    if (esGrupo(s)) revisaNivel(s.suma, s.resta, s.interseca, quien);
    else problemas.push(...problemasDeForma(s, quien, donde));
  };

  const revisaNivel = (
    suma: readonly SolidoDeclarado[] | undefined,
    resta: readonly SolidoDeclarado[] | undefined,
    interseca: readonly SolidoDeclarado[] | undefined,
    quien: string,
  ) => {
    if (!Array.isArray(suma) || suma.length === 0) problemas.push(`${quien} necesita al menos una suma`);
    if (interseca !== undefined && (!Array.isArray(interseca) || interseca.length === 0)) problemas.push(`${quien}: «interseca» está vacía y no interseca nada; o lleva algo, o se quita`);
    for (const s of suma ?? []) revisa(s, 'suma', []);
    for (const s of resta ?? []) revisa(s, 'resta', suma ?? []);
    for (const s of interseca ?? []) revisa(s, 'interseca', []);
  };

  revisaNivel(d.suma, d.resta, d.interseca, `la pieza ${d.codigo}`);
  for (const [n, k] of nombres) if (k > 1) problemas.push(`hay dos primitivas que se llaman «${n}»`);
  for (const n of d.noSeCorta ?? []) if (!nombres.has(n)) problemas.push(`«noSeCorta» nombra «${n}», que no es ninguna primitiva`);
  for (const s of d.simetria ?? []) if (!EJES.includes(s.plano) || !finito(s.en)) problemas.push('cada simetría es un plano x, y o z y dónde está («en»)');
  if (d.ocultas !== undefined && !['todas', 'necesarias', 'ninguna'].includes(d.ocultas)) problemas.push('«ocultas» es todas, necesarias o ninguna');
  return problemas;
}

/* ── La compilación ───────────────────────────────────────────────────── */

const VECTOR_DE: Record<Eje, V3> = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };

/** Los ejes locales de una primitiva con eje: los dos del centro, en el
 *  orden en que se escribe `centro`, y el eje. */
function ejesDe(eje: Eje): readonly [V3, V3, V3] {
  const [a, b] = EJES.filter((k) => k !== eje);
  return [VECTOR_DE[a], VECTOR_DE[b], VECTOR_DE[eje]];
}

function aplicaGiro(m: Marco, g: Giro | undefined): Marco {
  if (!g) return m;
  const eje = VECTOR_DE[g.eje];
  const a = (g.grados * Math.PI) / 180;
  const por = g.por ?? [0, 0, 0];
  const cero: V3 = [0, 0, 0];
  return { o: gira3(m.o, eje, por, a), e: [gira3(m.e[0], eje, cero, a), gira3(m.e[1], eje, cero, a), gira3(m.e[2], eje, cero, a)] };
}

/** La primitiva en su marco. Un cilindro pasante sale con w0 y w1 sin
 *  fijar (NaN): se fijan cuando se conoce la caja de la pieza. */
function primitivaDe(s: Exclude<SolidoDeclarado, GrupoDeclarado>, indice: number): Primitiva {
  const base = (o: V3, e: readonly [V3, V3, V3], forma: FormaLocal): Primitiva => ({
    nombre: s.nombre,
    indice,
    marco: aplicaGiro({ o, e }, s.gira),
    forma,
  });
  if ('caja' in s) {
    const [x0, x1, y0, y1, z0, z1] = s.caja;
    return base([0, 0, 0], [VECTOR_DE.x, VECTOR_DE.y, VECTOR_DE.z], { tipo: 'caja', min: [x0, y0, z0], max: [x1, y1, z1] });
  }
  if ('prisma' in s) {
    const { plano, poligono, desde, hasta } = s.prisma;
    const [a, b] = plano.split('') as [Eje, Eje];
    const w = EJES.find((k) => k !== a && k !== b) as Eje;
    return base([0, 0, 0], [VECTOR_DE[a], VECTOR_DE[b], VECTOR_DE[w]], { tipo: 'prisma', poligono: limpiaPoligono(poligono.map((q) => [q[0], q[1]] as P2)), w0: desde, w1: hasta });
  }
  if ('cilindro' in s) {
    const { eje, centro, r, desde, hasta } = s.cilindro;
    const e = ejesDe(eje);
    return base(suma3(por3(e[0], centro[0]), por3(e[1], centro[1])), e, { tipo: 'cilindro', r, w0: desde ?? Number.NaN, w1: hasta ?? Number.NaN });
  }
  if ('cono' in s) {
    const { eje, centro, r0, r1, desde, hasta } = s.cono;
    const e = ejesDe(eje);
    return base(suma3(por3(e[0], centro[0]), por3(e[1], centro[1])), e, { tipo: 'cono', r0, r1, w0: desde, w1: hasta });
  }
  const n = unitario3(s.semiespacio.normal);
  const e0 = unitario3(vectorial3(n, Math.abs(n[0]) < 0.9 ? VECTOR_DE.x : VECTOR_DE.y));
  return base(s.semiespacio.pasa, [e0, vectorial3(n, e0), n], { tipo: 'semiespacio' });
}

/** Compila la pieza. Lanza con el código delante si tiene problemas. */
export function compilaPieza(d: PiezaDeclarada): PiezaCompilada {
  const problemas = problemasDePieza(d);
  if (problemas.length) throw new Error(`la pieza ${d.codigo}: ${problemas.join('; ')}`);
  const primitivas: Primitiva[] = [];

  const nodoDe = (s: SolidoDeclarado): Nodo => {
    if (esGrupo(s)) return nivel(s.suma, s.resta, s.interseca);
    const p = primitivaDe(s, primitivas.length);
    primitivas.push(p);
    return { op: 'hoja', i: p.indice };
  };

  /* Un nivel del árbol: la unión de las sumas, menos las restas, por las
     intersecciones. Una resta con `dentro` se cuelga de su suma. */
  const nivel = (
    suma: readonly SolidoDeclarado[],
    resta: readonly SolidoDeclarado[] = [],
    interseca: readonly SolidoDeclarado[] = [],
  ): Nodo => {
    const hijos = suma.map(nodoDe);
    const generales: Nodo[] = [];
    for (const r of resta) {
      const n = nodoDe(r);
      if (r.dentro === undefined) {
        generales.push(n);
        continue;
      }
      const k = suma.findIndex((s) => s.nombre === r.dentro);
      hijos[k] = { op: 'resta', de: hijos[k], quita: n };
    }
    let nodo: Nodo = hijos.length === 1 ? hijos[0] : { op: 'union', hijos };
    if (generales.length) nodo = { op: 'resta', de: nodo, quita: generales.length === 1 ? generales[0] : { op: 'union', hijos: generales } };
    if (interseca.length) nodo = { op: 'interseca', hijos: [nodo, ...interseca.map(nodoDe)] };
    return nodo;
  };

  const arbol = nivel(d.suma, d.resta, d.interseca);
  const caja = cajaDeNodo(arbol, primitivas);
  if (!caja) throw new Error(`la pieza ${d.codigo} no está acotada: algo sumado no tiene fin`);
  if ([0, 1, 2].some((k) => caja.max[k] - caja.min[k] < ESPESOR_MINIMO)) {
    throw new Error(`la pieza ${d.codigo} no tiene nada: lo que se interseca no tiene nada en común`);
  }

  /* Los pasantes, ahora que se sabe hasta dónde llega la pieza. */
  const fijadas = primitivas.map((p): Primitiva => {
    if (p.forma.tipo !== 'cilindro' || !Number.isNaN(p.forma.w0)) return p;
    const eje = p.marco.e[2];
    const ws = esquinas(caja).map((q) => escalar3(resta3(q, p.marco.o), eje));
    return { ...p, forma: { ...p.forma, w0: Math.min(...ws) - MARGEN_CAJA, w1: Math.max(...ws) + MARGEN_CAJA } };
  });

  return {
    codigo: d.codigo,
    fuente: d.fuente,
    primitivas: fijadas,
    arbol: conCajas(arbol, fijadas),
    caja,
    cajas: fijadas.map(cajaDePrimitiva),
    simetria: d.simetria ?? [],
    ocultas: d.ocultas ?? 'todas',
    noSeCorta: d.noSeCorta ?? [],
  };
}

/* ── La caja de la pieza ──────────────────────────────────────────────── */

function esquinas(c: Caja3): V3[] {
  const r: V3[] = [];
  for (const x of [c.min[0], c.max[0]]) for (const y of [c.min[1], c.max[1]]) for (const z of [c.min[2], c.max[2]]) r.push([x, y, z]);
  return r;
}

/** Si un punto está en la caja, agrandada `holgura` por cada lado. */
export const enCaja = (c: Caja3, q: V3, holgura = 0): boolean =>
  q[0] >= c.min[0] - holgura && q[0] <= c.max[0] + holgura && q[1] >= c.min[1] - holgura && q[1] <= c.max[1] + holgura && q[2] >= c.min[2] - holgura && q[2] <= c.max[2] + holgura;

/** Si dos cajas se tocan, con una holgura; una caja null no tiene fin y lo
 *  toca todo. */
export const seTocanCajas = (a: Caja3 | null, b: Caja3 | null, holgura = 0): boolean =>
  !a || !b || [0, 1, 2].every((k) => a.min[k] <= b.max[k] + holgura && b.min[k] <= a.max[k] + holgura);

/** Las coordenadas del mundo de un punto local. */
export const aMundo = (m: Marco, l: V3): V3 => [
  m.o[0] + m.e[0][0] * l[0] + m.e[1][0] * l[1] + m.e[2][0] * l[2],
  m.o[1] + m.e[0][1] * l[0] + m.e[1][1] * l[1] + m.e[2][1] * l[2],
  m.o[2] + m.e[0][2] * l[0] + m.e[1][2] * l[1] + m.e[2][2] * l[2],
];

const envuelve = (ps: readonly V3[]): Caja3 => ({
  min: [0, 1, 2].map((k) => Math.min(...ps.map((p) => p[k]))) as unknown as V3,
  max: [0, 1, 2].map((k) => Math.max(...ps.map((p) => p[k]))) as unknown as V3,
});

/** La caja de una primitiva en el mundo; null si no tiene fin. */
export function cajaDePrimitiva(p: Primitiva): Caja3 | null {
  const f = p.forma;
  if (f.tipo === 'semiespacio') return null;
  if (f.tipo === 'caja') return envuelve(esquinas({ min: f.min, max: f.max }).map((l) => aMundo(p.marco, l)));
  if (f.tipo === 'prisma') return envuelve(f.poligono.flatMap((q) => [aMundo(p.marco, [q[0], q[1], f.w0]), aMundo(p.marco, [q[0], q[1], f.w1])]));
  if (Number.isNaN(f.w0)) return null;
  const r = f.tipo === 'cilindro' ? f.r : Math.max(f.r0, f.r1);
  const eje = p.marco.e[2];
  const extremos = [aMundo(p.marco, [0, 0, f.w0]), aMundo(p.marco, [0, 0, f.w1])];
  const holgura = [0, 1, 2].map((k) => r * Math.sqrt(Math.max(0, 1 - eje[k] * eje[k])));
  return {
    min: [0, 1, 2].map((k) => Math.min(extremos[0][k], extremos[1][k]) - holgura[k]) as unknown as V3,
    max: [0, 1, 2].map((k) => Math.max(extremos[0][k], extremos[1][k]) + holgura[k]) as unknown as V3,
  };
}

function cajaDeNodo(n: Nodo, ps: readonly Primitiva[]): Caja3 | null {
  if (n.op === 'hoja') return cajaDePrimitiva(ps[n.i]);
  if (n.op === 'resta') return cajaDeNodo(n.de, ps);
  const cajas = n.hijos.map((h) => cajaDeNodo(h, ps));
  if (n.op === 'union') {
    if (cajas.some((c) => c === null)) return null;
    return envuelve((cajas as Caja3[]).flatMap((c) => [c.min, c.max]));
  }
  const finitas = cajas.filter((c): c is Caja3 => c !== null);
  if (!finitas.length) return null;
  return {
    min: [0, 1, 2].map((k) => Math.max(...finitas.map((c) => c.min[k]))) as unknown as V3,
    max: [0, 1, 2].map((k) => Math.min(...finitas.map((c) => c.max[k]))) as unknown as V3,
  };
}

/** La caja de un nodo ya compilado. */
const cajaCompilada = (n: Nodo, ps: readonly Primitiva[]): Caja3 | null => (n.op === 'hoja' ? cajaDePrimitiva(ps[n.i]) : (n.caja ?? null));

/** Una unión de muchos hijos, partida en un árbol de uniones por cercanía:
 *  por la mitad, a lo largo del lado más largo de su caja, hasta que quedan
 *  cuatro. Así una placa con ochenta agujeros no mira los ochenta en cada
 *  pregunta: sin esto, el motor crecía con el cuadrado de los agujeros. */
function equilibra(hijos: readonly Nodo[], ps: readonly Primitiva[]): Nodo {
  const cajas = hijos.map((h) => cajaCompilada(h, ps));
  const caja = cajas.some((c) => c === null) ? null : envuelve((cajas as Caja3[]).flatMap((c) => [c.min, c.max]));
  if (hijos.length <= 4 || !caja) return { op: 'union', hijos, caja };
  const k = [0, 1, 2].reduce((a, b) => (caja.max[b] - caja.min[b] > caja.max[a] - caja.min[a] ? b : a), 0);
  const centro = (h: Nodo) => {
    const c = cajaCompilada(h, ps) as Caja3;
    return (c.min[k] + c.max[k]) / 2;
  };
  const orden = [...hijos].sort((a, b) => centro(a) - centro(b));
  const mitad = orden.length >> 1;
  return { op: 'union', hijos: [equilibra(orden.slice(0, mitad), ps), equilibra(orden.slice(mitad), ps)], caja };
}

/** El árbol con la caja de cada nodo, y las uniones grandes equilibradas. */
function conCajas(n: Nodo, ps: readonly Primitiva[]): Nodo {
  if (n.op === 'hoja') return n;
  if (n.op === 'resta') {
    const de = conCajas(n.de, ps);
    return { op: 'resta', de, quita: conCajas(n.quita, ps), caja: cajaCompilada(de, ps) };
  }
  const hijos = n.hijos.map((h) => conCajas(h, ps));
  if (n.op === 'union') return equilibra(hijos, ps);
  const finitas = hijos.map((h) => cajaCompilada(h, ps)).filter((c): c is Caja3 => c !== null);
  const caja = finitas.length
    ? {
        min: [0, 1, 2].map((k) => Math.max(...finitas.map((c) => c.min[k]))) as unknown as V3,
        max: [0, 1, 2].map((k) => Math.min(...finitas.map((c) => c.max[k]))) as unknown as V3,
      }
    : null;
  return { op: 'interseca', hijos, caja };
}

/** Las primitivas cuya caja pasa la prueba (o que no tienen fin), bajando
 *  por el árbol sin entrar en los nodos cuya caja no la pasa. En orden. */
export function primitivasDonde(p: PiezaCompilada, prueba: (c: Caja3) => boolean): number[] {
  const r: number[] = [];
  const baja = (n: Nodo): void => {
    if (n.op === 'hoja') {
      const c = p.cajas[n.i];
      if (!c || prueba(c)) r.push(n.i);
      return;
    }
    if (n.caja && !prueba(n.caja)) return;
    if (n.op === 'resta') {
      baja(n.de);
      baja(n.quita);
    } else n.hijos.forEach(baja);
  };
  baja(p.arbol);
  return r.sort((a, b) => a - b);
}

/* ── La pertenencia ───────────────────────────────────────────────────── */

/** Las coordenadas locales de un punto del mundo. */
export const aLocal = (m: Marco, q: V3): V3 => {
  const d = resta3(q, m.o);
  return [escalar3(d, m.e[0]), escalar3(d, m.e[1]), escalar3(d, m.e[2])];
};

/** El radio de un cono en la altura local `w`. */
export const radioEn = (f: { r0: number; r1: number; w0: number; w1: number }, w: number): number =>
  f.r0 + ((f.r1 - f.r0) * (w - f.w0)) / (f.w1 - f.w0);

/**
 * Si el punto local está dentro de la forma encogida `m` mm (con `m`
 * negativo, crecida). Con m = 0 es la pertenencia exacta, cerrada: un punto
 * de una cara está dentro. El margen solo lo usa la erosión primitiva a
 * primitiva (`rayo.ts`), que está para validar al revés el test de la junta
 * y el oráculo.
 */
export function dentroDeForma(f: FormaLocal, l: V3, m = 0): boolean {
  switch (f.tipo) {
    case 'caja':
      return (
        l[0] >= f.min[0] + m && l[0] <= f.max[0] - m && l[1] >= f.min[1] + m && l[1] <= f.max[1] - m && l[2] >= f.min[2] + m && l[2] <= f.max[2] - m
      );
    case 'prisma': {
      if (l[2] < f.w0 + m || l[2] > f.w1 - m) return false;
      const den = enPoligono(l[0], l[1], f.poligono);
      if (m === 0) return den;
      const d = distanciaAlBorde(l[0], l[1], f.poligono);
      return m > 0 ? den && d >= m : den || d <= -m;
    }
    case 'cilindro':
      return l[2] >= f.w0 + m && l[2] <= f.w1 - m && Math.hypot(l[0], l[1]) <= f.r - m;
    case 'cono': {
      if (l[2] < f.w0 + m || l[2] > f.w1 - m) return false;
      const r = radioEn(f, l[2]) - m;
      return r >= 0 && Math.hypot(l[0], l[1]) <= r;
    }
    case 'semiespacio':
      return l[2] <= -m;
  }
}

export const dentroDePrimitiva = (p: Primitiva, q: V3, m = 0): boolean => dentroDeForma(p.forma, aLocal(p.marco, q), m);

/** El árbol, con el margen de cada primitiva: lo que se resta crece cuando
 *  lo sumado encoge, y al revés. */
export function dentroConMargen(p: PiezaCompilada, q: V3, m: number, nodo: Nodo = p.arbol): boolean {
  if (nodo.op === 'hoja') {
    /* Lo que queda fuera de la caja de la primitiva (crecida si el margen
       la crece) no está dentro, y no hace falta pasarlo a su marco. Igual
       con la caja de cada nodo, abajo. */
    const c = p.cajas[nodo.i];
    if (c && !enCaja(c, q, Math.max(0, -m) + HOLGURA_NUMERICA)) return false;
    return dentroDePrimitiva(p.primitivas[nodo.i], q, m);
  }
  if (nodo.caja && !enCaja(nodo.caja, q, Math.max(0, -m) + HOLGURA_NUMERICA)) return false;
  switch (nodo.op) {
    case 'union':
      return nodo.hijos.some((h) => dentroConMargen(p, q, m, h));
    case 'interseca':
      return nodo.hijos.every((h) => dentroConMargen(p, q, m, h));
    case 'resta':
      return dentroConMargen(p, q, m, nodo.de) && !dentroConMargen(p, q, -m, nodo.quita);
  }
}

/** Si el punto es de la pieza: la pertenencia exacta, con las caras dentro. */
export const dentro = (p: PiezaCompilada, q: V3): boolean => dentroConMargen(p, q, 0);

/** La primitiva sumada que pone la materia en `q`, por su nombre: la que
 *  «tapa» una arista. Se baja por el árbol siguiendo lo que contiene el
 *  punto, y si la ponen dos, la primera que se escribió; null si el punto
 *  no es de la pieza. */
export function materiaEn(p: PiezaCompilada, q: V3): string | null {
  const i = hojaCon(p, q, p.arbol);
  return i === null ? null : p.primitivas[i].nombre;
}

function hojaCon(p: PiezaCompilada, q: V3, nodo: Nodo): number | null {
  if (nodo.op === 'hoja') return dentroConMargen(p, q, 0, nodo) ? nodo.i : null;
  if (nodo.caja && !enCaja(nodo.caja, q, HOLGURA_NUMERICA)) return null;
  switch (nodo.op) {
    case 'union': {
      const todas = nodo.hijos.map((h) => hojaCon(p, q, h)).filter((i): i is number => i !== null);
      return todas.length ? Math.min(...todas) : null;
    }
    case 'interseca':
      return nodo.hijos.length && nodo.hijos.every((h) => dentroConMargen(p, q, 0, h)) ? hojaCon(p, q, nodo.hijos[0]) : null;
    case 'resta':
      return dentroConMargen(p, q, 0, nodo.quita) ? null : hojaCon(p, q, nodo.de);
  }
}

/** Las primitivas que restan, con su polaridad en el árbol: si una hoja
 *  acaba quitando materia (está en un número impar de «quita»). */
export function polaridades(p: PiezaCompilada): readonly boolean[] {
  const quita: boolean[] = p.primitivas.map(() => false);
  const baja = (n: Nodo, resta: boolean) => {
    if (n.op === 'hoja') quita[n.i] = resta;
    else if (n.op === 'resta') {
      baja(n.de, resta);
      baja(n.quita, !resta);
    } else for (const h of n.hijos) baja(h, resta);
  };
  baja(p.arbol, false);
  return quita;
}

