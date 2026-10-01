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
 * `&&`. Si una receta necesita algo que no está, **se añade la función en
 * `diedrico-receta-funciones.ts` y en `lib/diedrico`, con su prueba**, y la
 * receta sigue siendo datos.
 *
 * DÓNDE ESTÁ CADA COSA. Desde el 1 de octubre de 2026 las recetas son cuatro
 * ficheros: este, con la evaluación y la API pública (lo que importan
 * `construir.ts` y los tests); `-sintaxis`, el analizador; `-valores`, la
 * lámina y los tipos de valor; y `-funciones`, lo que una receta puede llamar.
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
  proyAlzado,
  proyPlanta,
  type P2,
} from './diedrico';
import { propio, RESERVADAS, QUE, espera, comoNum, comoP3, comoRecta2, iguales } from './diedrico-receta-valores';
import type { Lamina, Valor } from './diedrico-receta-valores';
import { analiza } from './diedrico-receta-sintaxis';
import type { Operador, Nodo } from './diedrico-receta-sintaxis';
import { compruebaFirma, FUNCIONES, PREDICADOS, PALABRAS } from './diedrico-receta-funciones';
import type { Entorno, Funcion } from './diedrico-receta-funciones';
import type { Objetivo, Predicado, Puntos, Trazado } from './diedrico-corrige';

export type { Trazado } from './diedrico-corrige';
export type { Lamina, Valor } from './diedrico-receta-valores';
export { analiza, type Nodo } from './diedrico-receta-sintaxis';

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
