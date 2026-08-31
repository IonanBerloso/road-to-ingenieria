/**
 * Lectura y comparación de magnitudes físicas: un número con su unidad.
 *
 * POR QUÉ EXISTE
 * Las tres asignaturas escritas hasta ahora eran matemáticas: la respuesta es
 * un número y punto. Mecánica de Fluidos es la primera con **magnitudes**, y
 * ahí «101325» y «101325 Pa» no son la misma respuesta — ni «1 bar» y «1 Pa»
 * son respuestas distintas por poco.
 *
 * CLAUDE.md dejó dicho que esta capa se hace **una vez, bien, cuando entre la
 * primera asignatura con unidades**, y no con un apaño en el contenido. Esto
 * es esa capa.
 *
 * QUÉ RESUELVE, Y POR QUÉ ASÍ
 * 1. **Comparar por dimensión, no por texto.** El alumno escribe la presión en
 *    bar, en kPa o en metros de columna de agua según por dónde haya entrado
 *    al problema, y las tres son correctas. Se convierte todo al SI y se
 *    compara ahí.
 * 2. **Distinguir tres errores que no son el mismo**, porque cada uno pide un
 *    diagnóstico distinto:
 *      · el número está bien y **falta la unidad** — descuido, medio punto;
 *      · el número está bien y la unidad es **de otra magnitud** (dar caudal
 *        en m/s) — confusión conceptual, que es la grave;
 *      · el número está mal — el error de siempre.
 *    Un comparador booleano no puede decir cuál de los tres ha sido, y en una
 *    asignatura donde el 90 % de los fallos son de unidades eso es justo lo
 *    que hay que decir.
 * 3. **Tolerancia relativa.** En fluidos media respuesta sale de un ábaco —el
 *    de Moody— o de una tabla, y exigir cuatro cifras es exigir que el alumno
 *    y quien escribió el ejercicio lean el mismo píxel. La tolerancia se
 *    interpreta como fracción del valor esperado, no como diferencia absoluta.
 *
 * LO QUE NO HACE, A PROPÓSITO
 * No es un álgebra de unidades general: no multiplica magnitudes ni deriva
 * dimensiones de una fórmula. Lee lo que un alumno escribe en una casilla y lo
 * compara con lo que el ejercicio espera. Nada más.
 */

/** Exponentes de las tres dimensiones que aparecen en fluidos: masa, longitud
 *  y tiempo. La temperatura se trata aparte (ver `ESCALAS`) porque sus escalas
 *  no son proporcionales: 20 °C no es «20 veces» nada. */
export interface Dim {
  M: number;
  L: number;
  T: number;
}

export interface Magnitud {
  /** El valor ya convertido a unidades base del SI. */
  valor: number;
  dim: Dim;
  /** La unidad tal y como venía escrita, para poder citarla en el diagnóstico.
   *  `null` cuando el texto era un número pelado. */
  unidad: string | null;
}

const D = (M = 0, L = 0, T = 0): Dim => ({ M, L, T });

export const ADIMENSIONAL = D();

/** Las dimensiones con nombre, para que los mensajes digan «una velocidad» y
 *  no «M⁰L¹T⁻¹». El orden importa: se busca la primera que coincida. */
const NOMBRES: ReadonlyArray<readonly [Dim, string]> = [
  [D(), 'un número sin unidades'],
  [D(0, 1), 'una longitud'],
  [D(0, 2), 'un área'],
  [D(0, 3), 'un volumen'],
  [D(0, 0, 1), 'un tiempo'],
  [D(1), 'una masa'],
  [D(0, 1, -1), 'una velocidad'],
  [D(0, 1, -2), 'una aceleración'],
  [D(0, 3, -1), 'un caudal'],
  [D(1, 0, -1), 'un caudal másico'],
  [D(1, 1, -2), 'una fuerza'],
  [D(1, -1, -2), 'una presión'],
  [D(1, -3), 'una densidad'],
  [D(1, -2, -2), 'un peso específico'],
  [D(1, -1, -1), 'una viscosidad dinámica'],
  [D(0, 2, -1), 'una viscosidad cinemática'],
  [D(1, 2, -2), 'una energía'],
  [D(1, 2, -3), 'una potencia'],
];

export function nombreDim(d: Dim): string {
  const n = NOMBRES.find(([x]) => x.M === d.M && x.L === d.L && x.T === d.T);
  return n ? n[1] : 'una magnitud de otra clase';
}

/** Una unidad: cuánto vale en unidades base del SI, y su dimensión.
 *
 *  Los factores no son de memoria. `mca` y `mmHg` salen de $p = \rho g h$ con
 *  la densidad del agua a 4 °C (1000) y la del mercurio (13595,1), y con
 *  $g = 9,80665$, que es la gravedad estándar y la que usa el enunciado
 *  cuando dice «metros de columna de agua». Están escritos como producto para
 *  que se vea de dónde vienen. */
const G = 9.80665;

const UNIDADES: Record<string, { f: number; d: Dim }> = {
  // — longitud
  m: { f: 1, d: D(0, 1) },
  km: { f: 1000, d: D(0, 1) },
  dm: { f: 0.1, d: D(0, 1) },
  cm: { f: 0.01, d: D(0, 1) },
  mm: { f: 0.001, d: D(0, 1) },
  in: { f: 0.0254, d: D(0, 1) },
  ft: { f: 0.3048, d: D(0, 1) },
  // — tiempo
  s: { f: 1, d: D(0, 0, 1) },
  seg: { f: 1, d: D(0, 0, 1) },
  min: { f: 60, d: D(0, 0, 1) },
  h: { f: 3600, d: D(0, 0, 1) },
  // — masa
  kg: { f: 1, d: D(1) },
  g: { f: 0.001, d: D(1) },
  t: { f: 1000, d: D(1) },
  // — volumen (las que no se escriben como m³)
  l: { f: 0.001, d: D(0, 3) },
  ml: { f: 1e-6, d: D(0, 3) },
  cc: { f: 1e-6, d: D(0, 3) },
  // — fuerza
  n: { f: 1, d: D(1, 1, -2) },
  kn: { f: 1000, d: D(1, 1, -2) },
  mn: { f: 1e6, d: D(1, 1, -2) }, // meganewton; el milinewton no aparece en fluidos
  kp: { f: G, d: D(1, 1, -2) },
  kgf: { f: G, d: D(1, 1, -2) },
  // — presión
  pa: { f: 1, d: D(1, -1, -2) },
  kpa: { f: 1000, d: D(1, -1, -2) },
  mpa: { f: 1e6, d: D(1, -1, -2) },
  hpa: { f: 100, d: D(1, -1, -2) },
  bar: { f: 1e5, d: D(1, -1, -2) },
  mbar: { f: 100, d: D(1, -1, -2) },
  atm: { f: 101325, d: D(1, -1, -2) },
  mmhg: { f: 13595.1 * G * 0.001, d: D(1, -1, -2) },
  torr: { f: 13595.1 * G * 0.001, d: D(1, -1, -2) },
  mca: { f: 1000 * G, d: D(1, -1, -2) },
  mcda: { f: 1000 * G, d: D(1, -1, -2) },
  // — energía y potencia
  j: { f: 1, d: D(1, 2, -2) },
  kj: { f: 1000, d: D(1, 2, -2) },
  w: { f: 1, d: D(1, 2, -3) },
  kw: { f: 1000, d: D(1, 2, -3) },
  mw: { f: 1e6, d: D(1, 2, -3) },
  cv: { f: 735.49875, d: D(1, 2, -3) },
  // — viscosidad, que en los enunciados viejos viene en poises
  poise: { f: 0.1, d: D(1, -1, -1) },
  p: { f: 0.1, d: D(1, -1, -1) },
  cpoise: { f: 0.001, d: D(1, -1, -1) },
  cp: { f: 0.001, d: D(1, -1, -1) },
  stokes: { f: 1e-4, d: D(0, 2, -1) },
  st: { f: 1e-4, d: D(0, 2, -1) },
  cst: { f: 1e-6, d: D(0, 2, -1) },
  // — adimensionales con nombre (Reynolds, Froude…) y el porcentaje
  '': { f: 1, d: ADIMENSIONAL },
};

/** Las escalas que **no** son proporcionales. Se convierten aparte y solo se
 *  aceptan solas: «20 °C/s» no es algo que este lector deba entender. */
const ESCALAS: Record<string, (x: number) => number> = {
  '°c': (x) => x + 273.15,
  c: (x) => x + 273.15,
  '°k': (x) => x,
  k: (x) => x,
};

const DIM_TEMPERATURA = { M: 0, L: 0, T: 0, esTemperatura: true } as const;

/** Normaliza lo que producen el teclado del alumno, el copiar-pegar del PDF y
 *  la costumbre de escribir m3 en vez de m³. */
function normaliza(entrada: string): string {
  return (entrada ?? '')
    .trim()
    .toLowerCase()
    .replace(/[−–—]/g, '-')
    .replace(/[²]/g, '^2')
    .replace(/[³]/g, '^3')
    .replace(/[·⋅×]/g, '*')
    .replace(/\s+/g, ' ');
}

/** Parte «12,5 kN/m^2» en número y unidad. La coma decimal se acepta porque es
 *  lo que escribe todo el mundo aquí; no hay ambigüedad con separadores de
 *  lista, que en una magnitud no existen. */
function parte(texto: string): { n: number; u: string } | null {
  const m = /^([-+]?[\d.,]+(?:e[-+]?\d+)?)\s*(.*)$/.exec(texto);
  if (!m) return null;
  const n = Number(m[1].replace(/,/g, '.'));
  if (!Number.isFinite(n)) return null;
  return { n, u: m[2].trim() };
}

/** Un factor de la unidad: `kg`, `m^3`, `s^-1`. */
function factor(t: string): { f: number; d: Dim } | null {
  const m = /^([a-zµ°]+)(?:\^?(-?\d+))?$/.exec(t);
  if (!m) return null;
  const base = UNIDADES[m[1]];
  if (!base) return null;
  const e = m[2] === undefined ? 1 : Number(m[2]);
  return {
    f: Math.pow(base.f, e),
    d: D(base.d.M * e, base.d.L * e, base.d.T * e),
  };
}

/** Compone la unidad entera: productos con `*` o espacio, cocientes con `/`.
 *  Todo lo que va detrás de la primera barra divide, que es como se escribe
 *  `kg/m^3` y `n*s/m^2`. */
function unidad(t: string): { f: number; d: Dim } | null {
  if (t === '') return { f: 1, d: ADIMENSIONAL };

  const [arriba, ...abajo] = t.split('/');
  let f = 1;
  const d = D();

  const acumula = (parte: string, signo: 1 | -1): boolean => {
    for (const trozo of parte.split(/[*\s]+/).filter(Boolean)) {
      const x = factor(trozo);
      if (!x) return false;
      f *= signo === 1 ? x.f : 1 / x.f;
      d.M += signo * x.d.M;
      d.L += signo * x.d.L;
      d.T += signo * x.d.T;
    }
    return true;
  };

  if (!acumula(arriba, 1)) return null;
  for (const parte of abajo) if (!acumula(parte, -1)) return null;
  return { f, d };
}

/**
 * Lee una magnitud. Devuelve `null` si no se entiende: es preferible pedir que
 * lo reescriba a corregir algo que no ha dicho.
 *
 * Un número sin unidad **se lee** —con `unidad: null`—, porque el diagnóstico
 * «te falta la unidad» necesita saber que el número estaba bien.
 */
export function leeMagnitud(entrada: string): Magnitud | null {
  const texto = normaliza(entrada);
  if (texto === '') return null;

  const p = parte(texto);
  if (!p) return null;

  const u = p.u.replace(/^%$/, '');
  if (p.u === '%') return { valor: p.n / 100, dim: ADIMENSIONAL, unidad: '%' };

  const escala = ESCALAS[u];
  if (escala) {
    return {
      valor: escala(p.n),
      dim: { M: DIM_TEMPERATURA.M, L: DIM_TEMPERATURA.L, T: DIM_TEMPERATURA.T },
      unidad: p.u,
    };
  }

  const x = unidad(u);
  if (!x) return null;
  return { valor: p.n * x.f, dim: x.d, unidad: p.u === '' ? null : p.u };
}

export interface Veredicto {
  /** Número y dimensión correctos dentro de la tolerancia. */
  igual: boolean;
  /** El número es el bueno pero no escribió unidad ninguna. */
  faltaUnidad: boolean;
  /** Escribió una unidad de otra magnitud (caudal en m/s). Este es el error
   *  conceptual, y el que merece el mensaje largo. */
  otraDimension: boolean;
}

const mismaDim = (a: Dim, b: Dim) => a.M === b.M && a.L === b.L && a.T === b.T;

/**
 * Compara dos magnitudes. `tolerancia` es **relativa**: 0,02 es el 2 % del
 * valor esperado. Con el esperado a cero se usa la tolerancia como absoluta,
 * porque el 2 % de cero no distingue nada.
 */
export function comparaMagnitud(a: Magnitud, b: Magnitud, tolerancia: number): Veredicto {
  const margen = b.valor === 0 ? tolerancia : Math.abs(b.valor) * tolerancia;

  /* Sin unidad escrita, se compara el número contra el valor esperado **en la
     unidad en que el ejercicio lo escribió**, no contra el valor en SI: quien
     responde «1,5» a una respuesta de «1,5 bar» ha hecho bien la física y se
     ha dejado la unidad, y eso no es lo mismo que equivocarse de escala. */
  if (a.unidad === null) {
    const enSuUnidad = b.unidad === null ? b.valor : b.valor / factorDe(b);
    const margenSuyo = enSuUnidad === 0 ? tolerancia : Math.abs(enSuUnidad) * tolerancia;
    const numeroBueno =
      Math.abs(a.valor - enSuUnidad) <= margenSuyo || Math.abs(a.valor - b.valor) <= margen;
    if (b.unidad === null) return { igual: numeroBueno, faltaUnidad: false, otraDimension: false };
    return { igual: false, faltaUnidad: numeroBueno, otraDimension: false };
  }

  if (!mismaDim(a.dim, b.dim)) {
    return { igual: false, faltaUnidad: false, otraDimension: true };
  }

  return {
    igual: Math.abs(a.valor - b.valor) <= margen,
    faltaUnidad: false,
    otraDimension: false,
  };
}

/** El factor de la unidad con la que se escribió una magnitud, para poder
 *  volver del SI a «lo que ponía en el enunciado». */
function factorDe(m: Magnitud): number {
  if (m.unidad === null) return 1;
  const x = unidad(normaliza(m.unidad));
  return x && x.f !== 0 ? x.f : 1;
}

/** ¿Este texto trae unidad? Lo usa el esquema para exigirla donde toca. */
export function traeUnidad(texto: string): boolean {
  const m = leeMagnitud(texto);
  return m !== null && m.unidad !== null;
}
