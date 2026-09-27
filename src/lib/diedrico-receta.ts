/**
 * Las recetas de Expresión Gráfica: la solución de una lámina escrita como
 * DATOS en el YAML y evaluada con `lib/diedrico` en el build.
 *
 * POR QUÉ UN LENGUAJE, Y TAN PEQUEÑO. Cada lámina de diédrico tiene una
 * geometría distinta, así que su solución no cabe en un campo fijo. Escribirla
 * en JavaScript por ejercicio rompería §04 —«si para añadir un ejercicio hay
 * que tocar JavaScript, algo está mal diseñado»— y la Regla 0. Así que se
 * escribe como receta: una línea por objeto, con nombre, que llama a funciones
 * de `lib/diedrico` y se refiere a la lámina o a líneas anteriores (brief del
 * 8 de septiembre de 2026, §3.2):
 *
 *     escena:
 *       L: punto3(alzado: figura.punto("L2"), planta: figura.punto("L1"))
 *       tejado: plano(L, T, R)
 *     solucion:
 *       P: punto_en_plano(alzado: figura.punto("P2"), plano: tejado)
 *       lmp: lmp(tejado, por: P, sentido: descendente)
 *       semidiagonal: mm(50) * raiz(2) / 2
 *     comprueba:
 *       - en_plano(B, tejado)
 *
 * La gramática es deliberadamente mínima: números y cuentas (`+ - * /`),
 * textos, nombres, listas, llamadas con argumentos por posición o por nombre,
 * `figura.punto("…")` y `figura.segmento("…")`, y para los diagnósticos `!` y
 * `&&`. Si una receta necesita algo que no está, **se añade la función aquí y
 * en `lib/diedrico`, con su prueba**, y la receta sigue siendo datos.
 *
 * LAS ELECCIONES. Hay láminas con más de una solución buena: en SD5 el
 * cuadrado sale de A hacia un lado o hacia el otro. La función que da los dos
 * puntos (`punto_a_distancia`) devuelve una elección que se llama como su
 * línea, y todo lo que se calcula a partir de ella la hereda, rama a rama. Lo
 * que vale lo mismo en todas las ramas deja de ser una elección. Quien corrige
 * fija la rama con la primera marca que la resuelve (`lib/diedrico-corrige`).
 *
 * TRES DECISIONES QUE NO SE NEGOCIAN:
 *
 *   · Un nombre que no existe es un error, nunca un símbolo; y un argumento
 *     de más, repetido o con un nombre que la función no tiene, también. Una
 *     errata no puede convertirse en silencio en otra cosa.
 *   · Una receta que no evalúa rompe el build, como un id que no existe
 *     (§11), y el mensaje dice dónde: `solucion.Q: …`, `objetivo «…»: …`.
 *   · Los diagnósticos se compilan aquí a un árbol con la geometría ya
 *     resuelta, y la página solo lo evalúa (`lib/diedrico-corrige`).
 */
import {
  PT_MM,
  TOL_VERTICAL,
  anguloConPH,
  anguloConPV,
  anguloPlanoConPH,
  anguloPlanoConPV,
  corteConSegmentos,
  distanciaAPlano,
  distanciaARecta,
  enPlano,
  enRecta,
  frontalPor,
  horizontalPor,
  lmpDir,
  pieEnRecta,
  plano as planoPor,
  planoPorLmp,
  proyAlzado,
  proyPlanta,
  punto3 as punto3De,
  puntoEnPlanoDesdeAlzado,
  puntoEnPlanoDesdePlanta,
  puntoEnSegmento,
  puntosADistancia,
  rectaDesdeProyecciones,
  rectaPorPuntos,
  simetrico as simetricoDe,
  vm as vmDe,
  vmAlzado,
  vmPlanta,
  type P2,
  type P3,
  type Plano,
  type Recta3,
} from './diedrico';
import type { Objetivo, Predicado, Puntos, Trazado } from './diedrico-corrige';

export type { Trazado } from './diedrico-corrige';

/** Una lámina como datos: sus puntos y segmentos con nombre, en pt del PDF. */
export interface Lamina {
  readonly puntos: Readonly<Record<string, P2>>;
  readonly segmentos: Readonly<Record<string, readonly [P2, P2]>>;
}

const propio = (o: object, k: string) => Object.prototype.hasOwnProperty.call(o, k);

/* ═══════════════════════════════ el analizador ═══════════════════════════ */

type Operador = '+' | '-' | '*' | '/';

export type Nodo =
  | { tipo: 'numero'; v: number }
  | { tipo: 'texto'; v: string }
  | { tipo: 'nombre'; v: string }
  | { tipo: 'miembro'; objeto: string; campo: string }
  | { tipo: 'llamada'; nombre: string; objeto?: string; args: Nodo[]; porNombre: Record<string, Nodo> }
  | { tipo: 'lista'; elementos: Nodo[] }
  | { tipo: 'cuenta'; op: Operador; a: Nodo; b: Nodo }
  | { tipo: 'no'; de: Nodo }
  | { tipo: 'y'; de: Nodo[] };

interface Ficha {
  t: 'num' | 'txt' | 'id' | 'p' | 'fin';
  v: string;
}

function fichas(src: string): Ficha[] {
  const out: Ficha[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    if (c === '&' && src[i + 1] === '&') { out.push({ t: 'p', v: '&&' }); i += 2; continue; }
    if ('()[],:.!+-*/'.includes(c)) { out.push({ t: 'p', v: c }); i++; continue; }
    if (c === '"') {
      const j = src.indexOf('"', i + 1);
      if (j < 0) throw new Error(`falta la comilla que cierra el texto de la posición ${i}`);
      out.push({ t: 'txt', v: src.slice(i + 1, j) });
      i = j + 1;
      continue;
    }
    const num = /^\d+(\.\d+)?/.exec(src.slice(i));
    if (num) { out.push({ t: 'num', v: num[0] }); i += num[0].length; continue; }
    const id = /^[\p{L}_][\p{L}\p{N}_]*/u.exec(src.slice(i));
    if (id) { out.push({ t: 'id', v: id[0] }); i += id[0].length; continue; }
    throw new Error(`no entiendo «${c}» en la posición ${i}`);
  }
  out.push({ t: 'fin', v: '' });
  return out;
}

/** El árbol de una expresión de receta. Lanza con un mensaje que dice qué
 *  faltaba o qué sobraba. */
export function analiza(src: string): Nodo {
  const T = fichas(src);
  let p = 0;
  const mira = () => T[p];
  const esP = (v: string) => mira().t === 'p' && mira().v === v;
  const come = (v: string) => {
    const f = T[p];
    if (f.t === 'p' && f.v === v) { p++; return; }
    throw new Error(f.t === 'fin' ? `falta «${v}» al final de «${src}»` : `no esperaba «${f.v}» en «${src}»: faltaba «${v}»`);
  };

  /* De menos a más fuerte: `&&`, `!`, suma y resta, producto y cociente, el
     signo menos, y lo demás. */
  function expresion(): Nodo {
    const primero = unario();
    if (!esP('&&')) return primero;
    const de = [primero];
    while (esP('&&')) { p++; de.push(unario()); }
    return { tipo: 'y', de };
  }

  function unario(): Nodo {
    if (esP('!')) { p++; return { tipo: 'no', de: unario() }; }
    return suma();
  }

  function suma(): Nodo {
    let a = producto();
    while (esP('+') || esP('-')) {
      const op = mira().v as Operador;
      p++;
      a = { tipo: 'cuenta', op, a, b: producto() };
    }
    return a;
  }

  function producto(): Nodo {
    let a = signo();
    while (esP('*') || esP('/')) {
      const op = mira().v as Operador;
      p++;
      a = { tipo: 'cuenta', op, a, b: signo() };
    }
    return a;
  }

  function signo(): Nodo {
    if (esP('-')) { p++; return { tipo: 'cuenta', op: '-', a: { tipo: 'numero', v: 0 }, b: signo() }; }
    return primario();
  }

  function argumentos(): { args: Nodo[]; porNombre: Record<string, Nodo> } {
    come('(');
    const args: Nodo[] = [];
    const porNombre: Record<string, Nodo> = {};
    if (esP(')')) { p++; return { args, porNombre }; }
    for (;;) {
      if (mira().t === 'id' && T[p + 1].t === 'p' && T[p + 1].v === ':') {
        const nombre = mira().v;
        if (propio(porNombre, nombre)) throw new Error(`«${nombre}:» aparece dos veces en «${src}»`);
        p += 2;
        porNombre[nombre] = expresion();
      } else {
        args.push(expresion());
      }
      if (esP(',')) { p++; continue; }
      come(')');
      return { args, porNombre };
    }
  }

  function primario(): Nodo {
    const f = mira();
    if (f.t === 'num') { p++; return { tipo: 'numero', v: Number(f.v) }; }
    if (f.t === 'txt') { p++; return { tipo: 'texto', v: f.v }; }
    if (f.t === 'p' && f.v === '[') {
      p++;
      const elementos: Nodo[] = [];
      if (!esP(']')) {
        for (;;) {
          elementos.push(expresion());
          if (esP(',')) { p++; continue; }
          break;
        }
      }
      come(']');
      return { tipo: 'lista', elementos };
    }
    if (f.t === 'p' && f.v === '(') {
      p++;
      const dentro = expresion();
      come(')');
      return dentro;
    }
    if (f.t === 'id') {
      p++;
      if (esP('.')) {
        p++;
        const campo = mira();
        if (campo.t !== 'id') throw new Error(`después de «${f.v}.» esperaba un nombre en «${src}»`);
        p++;
        if (esP('(')) return { tipo: 'llamada', objeto: f.v, nombre: campo.v, ...argumentos() };
        return { tipo: 'miembro', objeto: f.v, campo: campo.v };
      }
      if (esP('(')) return { tipo: 'llamada', nombre: f.v, ...argumentos() };
      return { tipo: 'nombre', v: f.v };
    }
    if (f.t === 'fin') throw new Error(`la expresión «${src}» se corta antes de tiempo`);
    throw new Error(`no esperaba «${f.v}» en «${src}»`);
  }

  const arbol = expresion();
  if (mira().t !== 'fin') throw new Error(`no esperaba «${mira().v}» en «${src}»`);
  return arbol;
}

/* ═══════════════════════════════ los valores ═════════════════════════════ */

type Sentido = 'descendente' | 'ascendente';

export type Valor =
  | { k: 'num'; v: number }
  | { k: 'txt'; v: string }
  | { k: 'bool'; v: boolean; detalle?: string }
  | { k: 'sentido'; v: Sentido }
  | { k: 'p2'; v: P2 }
  | { k: 'p3'; v: P3 }
  | { k: 'plano'; v: Plano }
  | { k: 'recta3'; v: Recta3 }
  | { k: 'linea'; p: P2; d: P2 }
  | { k: 'seg2'; a: P2; b: P2 }
  | { k: 'seg3'; a: P3; b: P3 }
  | { k: 'semirrecta'; origen: P3; dir: P2 }
  | { k: 'lista'; v: Valor[] }
  | { k: 'ramas'; eleccion: string; v: Valor[] };

const RESERVADAS: Readonly<Record<string, Valor>> = {
  descendente: { k: 'sentido', v: 'descendente' },
  ascendente: { k: 'sentido', v: 'ascendente' },
};

const QUE: Record<Valor['k'], string> = {
  num: 'un número',
  txt: 'un texto',
  bool: 'una condición',
  sentido: 'un sentido',
  p2: 'un punto de la lámina',
  p3: 'un punto del espacio',
  plano: 'un plano',
  recta3: 'una recta del espacio',
  linea: 'una recta de la lámina',
  seg2: 'un segmento de la lámina',
  seg3: 'un segmento del espacio',
  semirrecta: 'una semirrecta',
  lista: 'una lista',
  ramas: 'una elección',
};

function espera<K extends Valor['k']>(v: Valor | undefined, k: K, quien: string): Extract<Valor, { k: K }> {
  if (!v) throw new Error(`${quien} espera ${QUE[k]}, y no se le ha dado`);
  if (v.k !== k) throw new Error(`${quien} espera ${QUE[k]}, y ha recibido ${QUE[v.k]}`);
  return v as Extract<Valor, { k: K }>;
}

const comoNum = (v: Valor | undefined, quien: string) => espera(v, 'num', quien).v;
const comoP3 = (v: Valor | undefined, quien: string) => espera(v, 'p3', quien).v;
const comoPlano = (v: Valor | undefined, quien: string) => espera(v, 'plano', quien).v;
const comoRecta3 = (v: Valor | undefined, quien: string) => espera(v, 'recta3', quien).v;

/** Una recta de la lámina, venga como recta o como segmento. */
function comoRecta2(v: Valor | undefined, quien: string): { p: P2; d: P2 } {
  if (v?.k === 'linea') return { p: v.p, d: v.d };
  if (v?.k === 'seg2') return { p: v.a, d: [v.b[0] - v.a[0], v.b[1] - v.a[1]] };
  if (v?.k === 'recta3') {
    throw new Error(`${quien} espera una recta de la lámina, y ha recibido una recta del espacio: usa proy_planta() o proy_alzado()`);
  }
  throw new Error(`${quien} espera una recta de la lámina, y ha recibido ${v ? QUE[v.k] : 'nada'}`);
}

/** Si dos valores son el mismo, con la holgura de la aritmética. */
function iguales(a: unknown, b: unknown): boolean {
  if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => iguales(x, b[i]));
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const [ka, kb] = [Object.keys(a), Object.keys(b)];
    return ka.length === kb.length && ka.every((k) => iguales((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
  }
  return a === b;
}

/* ════════════════════════════ las funciones ══════════════════════════════ */

interface Entorno {
  readonly lamina: Lamina;
  readonly valores: ReadonlyMap<string, Valor>;
  /** Los nombres que son de la escena; los demás son de la solución. */
  readonly escena: ReadonlySet<string>;
  /** La línea de la receta que se está evaluando: da nombre a una elección. */
  readonly linea?: string;
}

type Obligacion = 'obligatorio' | 'opcional';

/** Lo que admite una función: cuántos argumentos por posición —exactos, o
 *  entre dos cifras— y qué nombres. Cualquier otra cosa es una errata. */
interface Firma {
  readonly posicion: number | readonly [number, number];
  readonly nombres?: Readonly<Record<string, Obligacion>>;
}

interface Funcion extends Firma {
  readonly hace: (args: Valor[], n: Record<string, Valor | undefined>, e: Entorno) => Valor;
}

function compruebaFirma(quien: string, f: Firma, posicion: number, claves: readonly string[]): void {
  const [min, max] = typeof f.posicion === 'number' ? [f.posicion, f.posicion] : f.posicion;
  if (posicion < min || posicion > max) {
    const cuantos = min === max ? `${min}` : max === Infinity ? `al menos ${min}` : `entre ${min} y ${max}`;
    throw new Error(`${quien}() espera ${cuantos} ${cuantos === '1' ? 'argumento' : 'argumentos'} por posición, y ha recibido ${posicion}`);
  }
  const nombres = f.nombres ?? {};
  for (const k of claves) {
    if (!propio(nombres, k)) {
      const tiene = Object.keys(nombres).map((x) => `«${x}:»`);
      throw new Error(`${quien}() no tiene el argumento «${k}:»${tiene.length ? `; tiene ${tiene.join(', ')}` : ''}`);
    }
  }
  for (const [k, o] of Object.entries(nombres)) {
    if (o === 'obligatorio' && !claves.includes(k)) throw new Error(`${quien}() necesita «${k}:»`);
  }
}

const lineaDe = (a: P2, b: P2): Valor => ({ k: 'linea', p: a, d: [b[0] - a[0], b[1] - a[1]] });

function proyeccion(x: Valor | undefined, vista: 'planta' | 'alzado'): Valor {
  const quien = `proy_${vista}()`;
  if (!x) throw new Error(`${quien} necesita algo que proyectar`);
  const pr = vista === 'planta' ? proyPlanta : proyAlzado;
  if (x.k === 'p3') return { k: 'p2', v: pr(x.v) };
  if (x.k === 'seg3') return { k: 'seg2', a: pr(x.a), b: pr(x.b) };
  if (x.k === 'lista') return { k: 'lista', v: x.v.map((y) => proyeccion(y, vista)) };
  if (x.k === 'semirrecta' && vista === 'planta') return { k: 'linea', p: proyPlanta(x.origen), d: x.dir };
  if (x.k === 'recta3') {
    const d: P2 = vista === 'planta' ? [x.v.d.x, x.v.d.y] : [x.v.d.x, -x.v.d.z];
    if (Math.hypot(d[0], d[1]) < 1e-9) {
      throw new Error(`${quien}: la recta es ${vista === 'planta' ? 'vertical' : 'de punta'}, y esa proyección es un punto`);
    }
    return { k: 'linea', p: pr(x.v.p), d };
  }
  throw new Error(`${quien} no sabe proyectar ${QUE[x.k]}`);
}

function angulo(x: Valor | undefined, con: 'ph' | 'pv'): Valor {
  const quien = `angulo_con_${con}()`;
  const dePuntos = con === 'ph' ? anguloConPH : anguloConPV;
  if (x?.k === 'plano') return { k: 'num', v: con === 'ph' ? anguloPlanoConPH(x.v) : anguloPlanoConPV(x.v) };
  if (x?.k === 'seg3') return { k: 'num', v: dePuntos(x.a, x.b) };
  if (x?.k === 'recta3') {
    const { p, d } = x.v;
    return { k: 'num', v: dePuntos(p, { x: p.x + d.x, y: p.y + d.y, z: p.z + d.z }) };
  }
  throw new Error(`${quien} espera un plano, una recta o un segmento del espacio, y ha recibido ${x ? QUE[x.k] : 'nada'}`);
}

/** Lo que una receta puede llamar. Cada entrada es una función de
 *  `lib/diedrico` con sus argumentos comprobados. */
const FUNCIONES: Readonly<Record<string, Funcion>> = {
  linea: {
    posicion: 1,
    hace: ([s]) => {
      const g = espera(s, 'seg2', 'linea()');
      return lineaDe(g.a, g.b);
    },
  },
  punto3: {
    posicion: 0,
    nombres: { alzado: 'obligatorio', planta: 'obligatorio' },
    hace: (_, n) => ({
      k: 'p3',
      v: punto3De(espera(n.alzado, 'p2', 'punto3(alzado:)').v, espera(n.planta, 'p2', 'punto3(planta:)').v),
    }),
  },
  plano: {
    posicion: 3,
    hace: ([a, b, c]) => ({ k: 'plano', v: planoPor(comoP3(a, 'plano()'), comoP3(b, 'plano()'), comoP3(c, 'plano()')) }),
  },
  segmento3: {
    posicion: 2,
    hace: ([a, b]) => ({ k: 'seg3', a: comoP3(a, 'segmento3()'), b: comoP3(b, 'segmento3()') }),
  },
  recta3: {
    posicion: [0, 2],
    nombres: { alzado: 'opcional', planta: 'opcional' },
    hace: (args, n) => {
      if (args.length === 2 && !n.alzado && !n.planta) {
        return { k: 'recta3', v: rectaPorPuntos(comoP3(args[0], 'recta3()'), comoP3(args[1], 'recta3()')) };
      }
      if (args.length === 0 && n.alzado && n.planta) {
        const [a, p] = [espera(n.alzado, 'seg2', 'recta3(alzado:)'), espera(n.planta, 'seg2', 'recta3(planta:)')];
        return { k: 'recta3', v: rectaDesdeProyecciones([a.a, a.b], [p.a, p.b]) };
      }
      throw new Error('recta3() se da por dos puntos del espacio, o por sus dos proyecciones con alzado: y planta:');
    },
  },
  punto_en_plano: {
    posicion: 0,
    nombres: { alzado: 'opcional', planta: 'opcional', plano: 'obligatorio' },
    hace: (_, n) => {
      const pl = comoPlano(n.plano, 'punto_en_plano(plano:)');
      if (n.alzado && n.planta) throw new Error('punto_en_plano() se da por el alzado o por la planta, no por los dos');
      if (n.alzado) return { k: 'p3', v: puntoEnPlanoDesdeAlzado(espera(n.alzado, 'p2', 'punto_en_plano(alzado:)').v, pl) };
      if (n.planta) return { k: 'p3', v: puntoEnPlanoDesdePlanta(espera(n.planta, 'p2', 'punto_en_plano(planta:)').v, pl) };
      throw new Error('punto_en_plano() necesita el alzado o la planta del punto');
    },
  },
  lmp: {
    posicion: 1,
    nombres: { por: 'obligatorio', sentido: 'obligatorio' },
    hace: ([pl], n) => {
      const d = lmpDir(comoPlano(pl, 'lmp()'));
      const sentido = espera(n.sentido, 'sentido', 'lmp(sentido:)').v;
      return { k: 'semirrecta', origen: comoP3(n.por, 'lmp(por:)'), dir: sentido === 'descendente' ? d.baja : d.sube };
    },
  },
  /* El primer segmento que corta la semirrecta, mirado en la planta, y el
     punto del espacio SOBRE ese segmento: es como se construye (la solución
     que se corrige es la que el alumno construye; ver `puntoEnSegmento`). */
  corte: {
    posicion: 2,
    hace: ([s, lista]) => {
      const semi = espera(s, 'semirrecta', 'corte()');
      const segs = espera(lista, 'lista', 'corte()').v.map((x) => espera(x, 'seg3', 'corte() en su lista'));
      const planta = segs.map((g) => [proyPlanta(g.a), proyPlanta(g.b)] as const);
      const golpe = corteConSegmentos(proyPlanta(semi.origen), semi.dir, planta);
      if (!golpe) throw new Error('corte(): la semirrecta no corta ninguno de los segmentos');
      const g = segs[golpe.indice];
      return { k: 'p3', v: puntoEnSegmento(g.a, g.b, golpe.s) };
    },
  },
  /* Cae en vertical desde P hasta la recta dada en el alzado —el suelo—: la
     planta no cambia y la cota es la de esa recta en la x de P. */
  vertical_hasta: {
    posicion: 2,
    hace: ([p, l]) => {
      const P = comoP3(p, 'vertical_hasta()');
      const r = espera(l, 'linea', 'vertical_hasta()');
      if (Math.abs(r.d[0]) < 1e-12) throw new Error('vertical_hasta(): la recta de llegada es vertical');
      const y2 = r.p[1] + ((P.x - r.p[0]) * r.d[1]) / r.d[0];
      return { k: 'p3', v: { x: P.x, y: P.y, z: -y2 } };
    },
  },
  /* En el espacio, desde un punto a una recta del espacio; en el papel, desde
     un punto de la lámina a una recta de la lámina —que es el error de SD1:
     la perpendicular al alero en vez de a las horizontales—. */
  pie_perpendicular: {
    posicion: 2,
    hace: ([p, r]) => {
      if (p?.k === 'p2') {
        const q = p.v;
        const { p: a, d } = comoRecta2(r, 'pie_perpendicular()');
        const l2 = d[0] ** 2 + d[1] ** 2;
        if (l2 < 1e-12) throw new Error('pie_perpendicular(): la recta es un segmento de longitud cero');
        const s = ((q[0] - a[0]) * d[0] + (q[1] - a[1]) * d[1]) / l2;
        return { k: 'p2', v: [a[0] + s * d[0], a[1] + s * d[1]] };
      }
      return { k: 'p3', v: pieEnRecta(comoP3(p, 'pie_perpendicular()'), comoRecta3(r, 'pie_perpendicular()')) };
    },
  },
  punto_medio: {
    posicion: 1,
    hace: ([s]) => {
      if (s?.k === 'seg2') return { k: 'p2', v: [(s.a[0] + s.b[0]) / 2, (s.a[1] + s.b[1]) / 2] };
      const g = espera(s, 'seg3', 'punto_medio()');
      return { k: 'p3', v: { x: (g.a.x + g.b.x) / 2, y: (g.a.y + g.b.y) / 2, z: (g.a.z + g.b.z) / 2 } };
    },
  },
  /* Los dos puntos a esa distancia real: una elección, con el nombre de la
     línea que la declara. */
  punto_a_distancia: {
    posicion: 1,
    nombres: { desde: 'obligatorio', distancia: 'obligatorio' },
    hace: ([r], n, e) => {
      if (!e.linea) {
        throw new Error('punto_a_distancia() da dos puntos, que son una elección: se declara en una línea de la receta, con nombre');
      }
      const [a, b] = puntosADistancia(
        comoRecta3(r, 'punto_a_distancia()'),
        comoP3(n.desde, 'punto_a_distancia(desde:)'),
        comoNum(n.distancia, 'punto_a_distancia(distancia:)'),
      );
      return { k: 'ramas', eleccion: e.linea, v: [{ k: 'p3', v: a }, { k: 'p3', v: b }] };
    },
  },
  simetrico: {
    posicion: 1,
    nombres: { respecto: 'obligatorio' },
    hace: ([p], n) => ({ k: 'p3', v: simetricoDe(comoP3(p, 'simetrico()'), comoP3(n.respecto, 'simetrico(respecto:)')) }),
  },
  horizontal_por: {
    posicion: 2,
    hace: ([p, pl]) => ({ k: 'recta3', v: horizontalPor(comoP3(p, 'horizontal_por()'), comoPlano(pl, 'horizontal_por()')) }),
  },
  frontal_por: {
    posicion: 2,
    hace: ([p, pl]) => ({ k: 'recta3', v: frontalPor(comoP3(p, 'frontal_por()'), comoPlano(pl, 'frontal_por()')) }),
  },
  plano_por_lmp: {
    posicion: 1,
    hace: ([r]) => ({ k: 'plano', v: planoPorLmp(comoRecta3(r, 'plano_por_lmp()')) }),
  },
  angulo_con_ph: { posicion: 1, hace: ([x]) => angulo(x, 'ph') },
  angulo_con_pv: { posicion: 1, hace: ([x]) => angulo(x, 'pv') },
  vm: { posicion: 2, hace: ([a, b]) => ({ k: 'num', v: vmDe(comoP3(a, 'vm()'), comoP3(b, 'vm()')) }) },
  vm_planta: { posicion: 2, hace: ([a, b]) => ({ k: 'num', v: vmPlanta(comoP3(a, 'vm_planta()'), comoP3(b, 'vm_planta()')) }) },
  vm_alzado: { posicion: 2, hace: ([a, b]) => ({ k: 'num', v: vmAlzado(comoP3(a, 'vm_alzado()'), comoP3(b, 'vm_alzado()')) }) },
  en_mm: { posicion: 1, hace: ([x]) => ({ k: 'num', v: comoNum(x, 'en_mm()') * PT_MM }) },
  mm: { posicion: 1, hace: ([x]) => ({ k: 'num', v: comoNum(x, 'mm()') / PT_MM }) },
  raiz: {
    posicion: 1,
    hace: ([x]) => {
      const v = comoNum(x, 'raiz()');
      if (v < 0) throw new Error('raiz() de un número negativo');
      return { k: 'num', v: Math.sqrt(v) };
    },
  },
  proy_planta: { posicion: 1, hace: ([x]) => proyeccion(x, 'planta') },
  proy_alzado: { posicion: 1, hace: ([x]) => proyeccion(x, 'alzado') },
  /* Un punto de la lámina corrido en el papel, en pt (con mm() si se piensa
     en milímetros). Sirve para escribir el ejemplo de un error: «a un
     centímetro de la vertical de Q₁». */
  desplaza: {
    posicion: 1,
    nombres: { dx: 'opcional', dy: 'opcional' },
    hace: ([p], n) => {
      if (!n.dx && !n.dy) throw new Error('desplaza() sin dx: ni dy: no desplaza nada');
      const q = espera(p, 'p2', 'desplaza()').v;
      const dx = n.dx ? comoNum(n.dx, 'desplaza(dx:)') : 0;
      const dy = n.dy ? comoNum(n.dy, 'desplaza(dy:)') : 0;
      return { k: 'p2', v: [q[0] + dx, q[1] + dy] };
    },
  },
  /* El compás sobre una proyección: los dos puntos de esa recta de la lámina a
     esa distancia de papel. Es la construcción equivocada de medir una
     longitud real donde la proyección la acorta, y por eso da una lista —los
     dos son el mismo error— y no una elección. */
  medir_sobre: {
    posicion: 1,
    nombres: { desde: 'obligatorio', distancia: 'obligatorio' },
    hace: ([l], n) => {
      const r = comoRecta2(l, 'medir_sobre()');
      const q = espera(n.desde, 'p2', 'medir_sobre(desde:)').v;
      const k = comoNum(n.distancia, 'medir_sobre(distancia:)');
      const largo = Math.hypot(r.d[0], r.d[1]);
      if (largo < 1e-9) throw new Error('medir_sobre(): la recta es un segmento de longitud cero');
      const fuera = Math.abs((q[0] - r.p[0]) * r.d[1] - (q[1] - r.p[1]) * r.d[0]) / largo;
      if (fuera > TOL_VERTICAL) {
        throw new Error(`medir_sobre(): el punto de partida no está en la recta: queda a ${(fuera * PT_MM).toFixed(2)} mm`);
      }
      const u: P2 = [r.d[0] / largo, r.d[1] / largo];
      return {
        k: 'lista',
        v: [
          { k: 'p2', v: [q[0] + u[0] * k, q[1] + u[1] * k] },
          { k: 'p2', v: [q[0] - u[0] * k, q[1] - u[1] * k] },
        ],
      };
    },
  },
  /* La perpendicular a una recta de la lámina por un punto, trazada en el
     papel: vale en la proyección donde esa recta está en verdadera magnitud, y
     en las demás es un error típico. */
  perpendicular: {
    posicion: 0,
    nombres: { por: 'obligatorio', a: 'obligatorio' },
    hace: (_, n) => {
      const r = comoRecta2(n.a, 'perpendicular(a:)');
      return { k: 'linea', p: espera(n.por, 'p2', 'perpendicular(por:)').v, d: [-r.d[1], r.d[0]] };
    },
  },
  en_plano: {
    posicion: 2,
    hace: ([p, pl]) => {
      const [P, plano] = [comoP3(p, 'en_plano()'), comoPlano(pl, 'en_plano()')];
      return { k: 'bool', v: enPlano(P, plano), detalle: `queda a ${(distanciaAPlano(P, plano) * PT_MM).toFixed(2)} mm del plano` };
    },
  },
  en_recta: {
    posicion: 2,
    hace: ([p, r]) => {
      const [P, recta] = [comoP3(p, 'en_recta()'), comoRecta3(r, 'en_recta()')];
      return { k: 'bool', v: enRecta(P, recta), detalle: `queda a ${(distanciaARecta(P, recta) * PT_MM).toFixed(2)} mm de la recta` };
    },
  },
};

/** Los diagnósticos: en todos, el primer argumento es el punto que acaba de
 *  marcar el alumno, y no se escribe. */
const PREDICADOS: Readonly<Record<string, Firma>> = {
  en_vertical_de: { posicion: 1 },
  en_horizontal_de: { posicion: 1 },
  cerca_de: { posicion: 1 },
  a_distancia: { posicion: 0, nombres: { de: 'obligatorio', d: 'obligatorio' } },
  en_recta: { posicion: 1 },
  en_segmento: { posicion: [1, Infinity] },
  es_pie_perpendicular: { posicion: 0, nombres: { desde: 'obligatorio', sobre: 'obligatorio' } },
};

/** Palabras que no pueden ser el nombre de una línea. */
const PALABRAS = new Set(['figura', 'escena', 'solucion', 'siempre', 'otra_rama', 'rama']);

/* ══════════════════════════════ la evaluación ════════════════════════════ */

/** Llama a la función; si algún argumento es una elección, rama a rama. */
function aplica(f: Funcion, args: Valor[], porNombre: Record<string, Valor>, e: Entorno): Valor {
  const elecciones = [...args, ...Object.values(porNombre)].filter(
    (v): v is Extract<Valor, { k: 'ramas' }> => v.k === 'ramas',
  );
  if (elecciones.length === 0) return f.hace(args, porNombre, e);
  const { eleccion } = elecciones[0];
  const otra = elecciones.find((v) => v.eleccion !== eleccion);
  if (otra) {
    throw new Error(`combina dos elecciones distintas, «${eleccion}» y «${otra.eleccion}»: eso todavía no se sabe hacer`);
  }
  const rama = (v: Valor, i: number) => (v.k === 'ramas' ? v.v[i] : v);
  const v = elecciones[0].v.map((_, i) =>
    f.hace(
      args.map((a) => rama(a, i)),
      Object.fromEntries(Object.entries(porNombre).map(([k, a]) => [k, rama(a, i)])),
      e,
    ),
  );
  if (v.some((x) => x.k === 'ramas')) throw new Error('una elección dentro de otra todavía no se sabe hacer');
  /* Lo que vale lo mismo en todas las ramas no depende de la elección. */
  return v.every((x) => iguales(x, v[0])) ? v[0] : { k: 'ramas', eleccion, v };
}

const CUENTAS: Record<Operador, (a: number, b: number) => number> = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '*': (a, b) => a * b,
  '/': (a, b) => {
    if (b === 0) throw new Error('«/» divide entre cero');
    return a / b;
  },
};

function evalua(n: Nodo, e: Entorno): Valor {
  switch (n.tipo) {
    case 'numero':
      return { k: 'num', v: n.v };
    case 'texto':
      return { k: 'txt', v: n.v };
    case 'lista': {
      const v = n.elementos.map((x) => evalua(x, e));
      /* Una elección dentro de una lista no se reparte rama a rama como en una
         llamada: fallaría más adelante, lejos de aquí y con un mensaje que no
         dice por qué. Se dice aquí (revisión del 27 de septiembre de 2026). */
      const eleccion = v.find((x) => x.k === 'ramas');
      if (eleccion?.k === 'ramas') {
        throw new Error(`una elección («${eleccion.eleccion}») no puede ir dentro de una lista: eso todavía no se sabe hacer`);
      }
      return { k: 'lista', v };
    }
    case 'nombre': {
      const v = e.valores.get(n.v) ?? (propio(RESERVADAS, n.v) ? RESERVADAS[n.v] : undefined);
      if (!v) throw new Error(`no hay nada que se llame «${n.v}»`);
      return v;
    }
    case 'miembro': {
      const v = e.valores.get(n.campo);
      if (!v || (n.objeto !== 'solucion' && n.objeto !== 'escena')) {
        throw new Error(`no hay nada que se llame «${n.objeto}.${n.campo}»`);
      }
      const deLaEscena = e.escena.has(n.campo);
      if ((n.objeto === 'escena') !== deLaEscena) {
        throw new Error(`«${n.objeto}.${n.campo}» no existe: «${n.campo}» es de la ${deLaEscena ? 'escena' : 'solución'}`);
      }
      return v;
    }
    case 'cuenta': {
      const op = n.op;
      const hace = ([a, b]: Valor[]): Valor => ({ k: 'num', v: CUENTAS[op](comoNum(a, `«${op}»`), comoNum(b, `«${op}»`)) });
      return aplica({ posicion: 2, hace }, [evalua(n.a, e), evalua(n.b, e)], {}, e);
    }
    case 'llamada': {
      if (n.objeto === 'figura') return deLaLamina(n, e.lamina);
      if (n.objeto) throw new Error(`no hay nada que se llame «${n.objeto}.${n.nombre}»`);
      if (n.nombre === 'rama') return unaRama(n, e);
      if (!propio(FUNCIONES, n.nombre)) {
        if (propio(PREDICADOS, n.nombre)) throw new Error(`«${n.nombre}» es de los diagnósticos, no de las recetas`);
        throw new Error(`la función «${n.nombre}» no existe`);
      }
      const f = FUNCIONES[n.nombre];
      compruebaFirma(n.nombre, f, n.args.length, Object.keys(n.porNombre));
      const args = n.args.map((x) => evalua(x, e));
      const porNombre = Object.fromEntries(Object.entries(n.porNombre).map(([k, x]) => [k, evalua(x, e)]));
      return aplica(f, args, porNombre, e);
    }
    case 'no':
    case 'y':
      throw new Error('«!» y «&&» son de los diagnósticos, no de las recetas');
  }
}

/** `rama(x, 2)`: la segunda rama de una elección, contando desde 1. Es para
 *  escribir el ejemplo de un error que depende de la rama —el cuadrado
 *  cruzado de SD5—, y no se reparte rama a rama como las demás funciones:
 *  es justo la que escoge una. */
function unaRama(n: Extract<Nodo, { tipo: 'llamada' }>, e: Entorno): Valor {
  compruebaFirma('rama', { posicion: 2 }, n.args.length, Object.keys(n.porNombre));
  const x = evalua(n.args[0], e);
  if (x.k !== 'ramas') throw new Error(`rama() espera una elección, y ha recibido ${QUE[x.k]}`);
  const i = comoNum(evalua(n.args[1], e), 'rama()');
  if (!Number.isInteger(i) || i < 1 || i > x.v.length) {
    throw new Error(`rama(): la elección «${x.eleccion}» tiene ${x.v.length} ramas, y se ha pedido la ${i}`);
  }
  return x.v[i - 1];
}

function deLaLamina(n: Extract<Nodo, { tipo: 'llamada' }>, lamina: Lamina): Valor {
  compruebaFirma(`figura.${n.nombre}`, { posicion: 1 }, n.args.length, Object.keys(n.porNombre));
  const arg = n.args[0];
  if (arg.tipo !== 'texto') throw new Error(`figura.${n.nombre}() espera el nombre entre comillas`);
  if (n.nombre === 'punto') {
    if (!propio(lamina.puntos, arg.v)) throw new Error(`la lámina no tiene el punto «${arg.v}»`);
    return { k: 'p2', v: lamina.puntos[arg.v] };
  }
  if (n.nombre === 'segmento') {
    if (!propio(lamina.segmentos, arg.v)) throw new Error(`la lámina no tiene el segmento «${arg.v}»`);
    const [a, b] = lamina.segmentos[arg.v];
    return { k: 'seg2', a, b };
  }
  throw new Error(`la lámina no sabe «figura.${n.nombre}»: solo punto() y segmento()`);
}

function nombreLibre(nombre: string, valores: ReadonlyMap<string, Valor>, escena: ReadonlySet<string>): void {
  if (!/^[\p{L}_][\p{L}\p{N}_]*$/u.test(nombre)) throw new Error(`«${nombre}» no sirve de nombre: letras, cifras y _, y empezando por letra`);
  if (propio(FUNCIONES, nombre)) throw new Error(`«${nombre}» es el nombre de una función: llama a esta línea de otra manera`);
  if (propio(RESERVADAS, nombre) || propio(PREDICADOS, nombre) || PALABRAS.has(nombre)) {
    throw new Error(`«${nombre}» es una palabra de las recetas: llama a esta línea de otra manera`);
  }
  if (valores.has(nombre)) throw new Error(`«${nombre}» ya está en la ${escena.has(nombre) ? 'escena' : 'solución'}`);
}

export interface Receta {
  readonly escena?: Readonly<Record<string, string>>;
  readonly solucion: Readonly<Record<string, string>>;
  /** Lo que el enunciado da por hecho y el build comprueba. */
  readonly comprueba?: readonly string[];
}

export interface Resultado {
  readonly valores: ReadonlyMap<string, Valor>;
  readonly escena: ReadonlySet<string>;
  planta(nombre: string): P2;
  alzado(nombre: string): P2;
  numero(nombre: string): number;
}

/**
 * Evalúa una receta sobre su lámina: primero la escena, después la solución,
 * en el orden en que están escritas, y por último lo que el enunciado da por
 * hecho, que tiene que cumplirse en todas las ramas. Cualquier fallo lanza con
 * el nombre de la línea delante.
 */
export function evaluaReceta(lamina: Lamina, receta: Receta): Resultado {
  const valores = new Map<string, Valor>();
  const escena = new Set<string>();
  for (const [bloque, lineas] of [['escena', receta.escena ?? {}], ['solucion', receta.solucion]] as const) {
    for (const [nombre, src] of Object.entries(lineas)) {
      try {
        nombreLibre(nombre, valores, escena);
        valores.set(nombre, evalua(analiza(src), { lamina, valores, escena, linea: nombre }));
      } catch (err) {
        throw new Error(`${bloque}.${nombre}: ${(err as Error).message}`);
      }
      if (bloque === 'escena') escena.add(nombre);
    }
  }
  for (const src of receta.comprueba ?? []) {
    let v: Valor;
    try {
      v = evalua(analiza(src), { lamina, valores, escena });
    } catch (err) {
      throw new Error(`comprueba «${src}»: ${(err as Error).message}`);
    }
    for (const caso of v.k === 'ramas' ? v.v : [v]) {
      const b = espera(caso, 'bool', `comprueba «${src}»`);
      if (!b.v) throw new Error(`comprueba «${src}»: no se cumple${b.detalle ? ` (${b.detalle})` : ''}`);
    }
  }
  return {
    valores,
    escena,
    planta: (nombre) => proyPlanta(comoP3(valores.get(nombre), `planta(«${nombre}»)`)),
    alzado: (nombre) => proyAlzado(comoP3(valores.get(nombre), `alzado(«${nombre}»)`)),
    numero: (nombre) => comoNum(valores.get(nombre), `numero(«${nombre}»)`),
  };
}

/* ═════════════════════════ objetivos y diagnósticos ══════════════════════ */

const entornoDe = (lamina: Lamina, r: Resultado): Entorno => ({ lamina, valores: r.valores, escena: r.escena });

/** Los puntos de la lámina que hay en un valor: uno, o los de una lista. */
function puntosDe(v: Valor, quien: string): P2[] {
  if (v.k === 'p2') return [v.v];
  if (v.k === 'lista') return v.v.flatMap((x) => puntosDe(x, quien));
  throw new Error(`${quien} espera un punto de la lámina, y ha recibido ${QUE[v.k]}`);
}

/** Las posiciones que valen para un objetivo: una, varias si la receta da una
 *  lista (los abatidos de SD4), o una por rama si depende de una elección. */
export function compilaObjetivo(src: string, lamina: Lamina, r: Resultado): Objetivo {
  try {
    const v = evalua(analiza(src), entornoDe(lamina, r));
    if (v.k === 'ramas') return { eleccion: v.eleccion, ramas: v.v.map((x) => puntosDe(x, 'un objetivo')) };
    return { ramas: [puntosDe(v, 'un objetivo')] };
  } catch (err) {
    throw new Error(`objetivo «${src}»: ${(err as Error).message}`);
  }
}

/** La cifra de una expresión sobre la receta: la que tiene que dar la
 *  respuesta o un distractor de un `calcular` que dice de dónde sale. Si
 *  depende de una elección no hay una cifra sino varias, y un `calcular` solo
 *  corrige una. */
export function evaluaNumero(src: string, lamina: Lamina, r: Resultado): number {
  try {
    const v = evalua(analiza(src), entornoDe(lamina, r));
    if (v.k === 'ramas') {
      throw new Error(`depende de una elección («${v.eleccion}»), y un calcular solo corrige una cifra`);
    }
    return comoNum(v, 'una cifra');
  } catch (err) {
    throw new Error(`cifra «${src}»: ${(err as Error).message}`);
  }
}

/** Los segmentos de la lámina que hay en un valor: uno, o los de una lista. */
function segmentosDe(v: Valor): (readonly [P2, P2])[] {
  if (v.k === 'seg2') return [[v.a, v.b]];
  if (v.k === 'lista') return v.v.flatMap(segmentosDe);
  throw new Error(`el trazado espera segmentos de la lámina, y ha recibido ${QUE[v.k]}`);
}

/** Lo que se dibuja de la solución cuando se abre el desarrollo: segmentos,
 *  uno por rama si dependen de una elección. */
export function compilaTrazado(src: string, lamina: Lamina, r: Resultado): Trazado {
  try {
    const v = evalua(analiza(src), entornoDe(lamina, r));
    if (v.k === 'ramas') return { eleccion: v.eleccion, ramas: v.v.map(segmentosDe) };
    return { ramas: [segmentosDe(v)] };
  } catch (err) {
    throw new Error(`trazado «${src}»: ${(err as Error).message}`);
  }
}

/**
 * Compila el `si:` de un diagnóstico. `objetivos` son los nombres de lo que el
 * alumno marca en ese paso: un nombre de esos dentro de un diagnóstico es una
 * referencia a su marca, no un valor de la receta, y por eso no pueden
 * llamarse igual que una línea.
 */
export function compilaPredicado(src: string, lamina: Lamina, r: Resultado, objetivos: readonly string[]): Predicado {
  const e = entornoDe(lamina, r);
  const refs = new Set(objetivos);

  const puntos = (n: Nodo | undefined, quien: string): Puntos => {
    if (!n) throw new Error(`${quien} necesita un punto`);
    if (n.tipo === 'nombre' && refs.has(n.v)) return { ref: n.v };
    if (n.tipo === 'llamada' && !n.objeto && n.nombre === 'otra_rama') {
      compruebaFirma('otra_rama', { posicion: 1 }, n.args.length, Object.keys(n.porNombre));
      const v = evalua(n.args[0], e);
      if (v.k !== 'ramas') throw new Error(`otra_rama() espera una elección, y ha recibido ${QUE[v.k]}`);
      return { eleccion: v.eleccion, ramas: v.v.map((x) => puntosDe(x, quien)), otra: true };
    }
    const v = evalua(n, e);
    if (v.k === 'ramas') return { eleccion: v.eleccion, ramas: v.v.map((x) => puntosDe(x, quien)) };
    return { en: puntosDe(v, quien) };
  };
  const numero = (n: Nodo | undefined, quien: string): number => {
    if (!n) throw new Error(`${quien} necesita un número`);
    const v = evalua(n, e);
    if (v.k === 'ramas') throw new Error(`${quien} depende de una elección: eso todavía no se sabe comprobar`);
    return comoNum(v, quien);
  };
  const recta = (n: Nodo | undefined, quien: string): { p: P2; d: P2 } => {
    const r2 = comoRecta2(n ? evalua(n, e) : undefined, quien);
    if (Math.hypot(r2.d[0], r2.d[1]) < 1e-9) throw new Error(`${quien}: la recta es un segmento de longitud cero`);
    return r2;
  };

  const compila = (n: Nodo): Predicado => {
    if (n.tipo === 'no') return { op: 'no', de: compila(n.de) };
    if (n.tipo === 'y') return { op: 'y', de: n.de.map(compila) };
    if (n.tipo === 'nombre' && n.v === 'siempre') return { op: 'siempre' };
    if (n.tipo !== 'llamada' || n.objeto) throw new Error('esperaba una condición: en_recta(), cerca_de(), en_vertical_de()…');
    if (!propio(PREDICADOS, n.nombre)) throw new Error(`el diagnóstico «${n.nombre}» no existe`);
    compruebaFirma(n.nombre, PREDICADOS[n.nombre], n.args.length, Object.keys(n.porNombre));
    const [x] = n.args;
    switch (n.nombre) {
      case 'en_vertical_de':
        return { op: 'vertical', de: puntos(x, 'en_vertical_de()') };
      case 'en_horizontal_de':
        return { op: 'horizontal', de: puntos(x, 'en_horizontal_de()') };
      case 'cerca_de':
        return { op: 'cerca', de: puntos(x, 'cerca_de()') };
      case 'a_distancia':
        return { op: 'distancia', de: puntos(n.porNombre.de, 'a_distancia(de:)'), d: numero(n.porNombre.d, 'a_distancia(d:)') };
      case 'en_recta':
        return { op: 'recta', ...recta(x, 'en_recta()') };
      case 'en_segmento':
        return {
          op: 'segmento',
          segs: n.args.map((a) => {
            const s = espera(evalua(a, e), 'seg2', 'en_segmento()');
            return [s.a, s.b] as const;
          }),
        };
      default: {
        const { p, d } = recta(n.porNombre.sobre, 'es_pie_perpendicular(sobre:)');
        const b: P2 = [p[0] + d[0], p[1] + d[1]];
        return { op: 'pie', desde: puntos(n.porNombre.desde, 'es_pie_perpendicular(desde:)'), a: p, b };
      }
    }
  };

  try {
    for (const o of objetivos) {
      if (r.valores.has(o)) throw new Error(`«${o}» es a la vez un objetivo y una línea de la receta: cambia uno de los dos`);
    }
    return compila(analiza(src));
  } catch (err) {
    throw new Error(`diagnóstico «${src}»: ${(err as Error).message}`);
  }
}
