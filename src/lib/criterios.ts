/**
 * Las cuentas de los criterios de corrección (fase K, PLAN-K §3.3): si un
 * ejercicio se corrige y cuánto se le descuenta. Los datos son los de
 * `src/content/criterios/`, una hoja por asignatura; `ui/Criterios.astro`
 * solo los pinta, y su script llama a esta función.
 *
 * Prueba de utilidad (§13):
 * - **Para quién:** el alumno del bloque 2 de Expresión Gráfica.
 * - **Cuándo:** al acabar un despiece de práctica, antes de compararlo con la
 *   solución.
 * - **Qué gana:** saber si ese despiece se corregiría, y cuánto le quitan.
 * - **Cómo se comprueba:** `tests/criterios-cuenta.test.ts`, un caso por cada
 *   clase de tope y el precio compuesto de la escala: «falta en dos piezas y
 *   en el cajetín» da −1,5, y «en cinco piezas» se queda en −2.
 *
 * Cómo se cuenta cada error lo dicen sus datos, y nada más (`formaDe`):
 * - sin `por`, **una vez**: la hoja no imprime repetición. Es una lectura
 *   nuestra, por contraste con «(-2 por pieza)», y también vale para un muy
 *   grave repetido —dos ejes cortados a lo largo—, que la hoja no aclara;
 * - con `por`, **por cada vez**, con su tope si lo tiene;
 * - con el tope «por pieza», **pieza a pieza**: cada una topa por su lado;
 * - el precio en dos partes, el de la escala de una pieza: la de la pieza por
 *   cada pieza en la que falta y la del cajetín **una vez**, otra lectura
 *   nuestra (PLAN-K §3.3). Si se cobrara por pieza, dos piezas darían −2.
 *
 * Son cuatro lecturas nuestras, y las cuatro están en `tasks/pendiente.md`,
 * pendientes de preguntar (§13, caso 5): el muy grave repetido, una vez; el
 * cajetín del compuesto, una vez; los dos muy graves de la escala, que se
 * solapan («dibujar sin tener en cuenta la escala» está en los dos) y aquí se
 * suman si se marcan los dos; y un mínimo cuyo elemento no tiene la pieza,
 * que se marca como cumplido. La cuenta solo usa las dos primeras; las otras
 * dos las avisa quien la pinta, donde el alumno marca.
 */

export interface ParteDePrecio {
  readonly precio: number;
  readonly donde: 'pieza' | 'cajetin';
}

export interface Minimo {
  readonly id: string;
  readonly bloque: 'vistas' | 'acotacion' | 'tolerancias';
  readonly texto: string;
  readonly donde: string;
}

export interface MuyGrave {
  readonly id: string;
  readonly texto: string;
  readonly precio: number;
  readonly por?: 'pieza';
  readonly donde: string;
}

export interface Tipico {
  readonly id: string;
  readonly texto: string;
  readonly precio: number | readonly ParteDePrecio[];
  readonly por?: 'caso' | 'cada-una' | 'cada' | 'vista';
  readonly tope?: number;
  readonly topeEn?: 'pieza' | 'plano' | 'total';
  readonly donde: string;
}

export interface HojaDeCriterios {
  readonly minimos: readonly Minimo[];
  readonly muyGraves: readonly MuyGrave[];
  readonly tipicos: readonly Tipico[];
}

/** Un error de la hoja: muy grave o típico. */
export type Fallo = MuyGrave | Tipico;

/** Cómo se cuenta un error: con una casilla (`una-vez`), con un número de
 *  veces (`veces`), con un número por pieza (`por-pieza`) o con las piezas en
 *  las que falta y una casilla para el cajetín (`compuesto`). */
export type Forma = 'una-vez' | 'veces' | 'por-pieza' | 'compuesto';

export function formaDe(e: Fallo): Forma {
  if (typeof e.precio !== 'number') return 'compuesto';
  if ('topeEn' in e && e.topeEn === 'pieza') return 'por-pieza';
  return e.por ? 'veces' : 'una-vez';
}

/** Lo que se ha marcado de un error, según su forma: 0 o 1 en `una-vez`, las
 *  veces en `veces`, una cuenta por pieza en `por-pieza` y, en `compuesto`,
 *  en cuántas piezas falta y si falta en el cajetín. */
export type Cuenta = number | readonly number[] | { readonly piezas: number; readonly cajetin: boolean };

export interface Marcas {
  /** Los ids de los mínimos que la lámina cumple. */
  readonly cumple: readonly string[];
  /** Las piezas del despiece: al menos una. */
  readonly piezas: number;
  /** Lo marcado de cada error, por su id. Lo que no está, no se ha cometido. */
  readonly errores: Readonly<Record<string, Cuenta>>;
}

export interface Linea {
  readonly error: Fallo;
  /** Lo que se quita por este error, negativo, ya topado. */
  readonly descuento: number;
  /** Si el tope ha recortado algo: sin él se quitaría más. */
  readonly topado: boolean;
}

export interface Resultado {
  /** «Si se cumplen estos mínimos, se corregirá el ejercicio.» */
  readonly seCorrige: boolean;
  /** Los mínimos que no se han marcado, en el orden de la hoja. */
  readonly faltan: readonly Minimo[];
  /** Los errores que quitan algo, en el orden de la hoja: muy graves primero. */
  readonly lineas: readonly Linea[];
  /** La suma de los descuentos: cero o negativa. */
  readonly total: number;
}

const esCuenta = (n: unknown, quien: string): number => {
  if (typeof n !== 'number' || !Number.isInteger(n) || n < 0) throw new RangeError(`${quien}: una cuenta es un entero de 0 en adelante`);
  return n;
};

/** El descuento ya topado. `+ 0` quita el −0 de −2 × 0, que se pintaría «−0». */
const topa = (bruto: number, tope: number | undefined): number => (tope === undefined ? bruto : Math.max(bruto, tope)) + 0;

/** Lo que cuesta un error con lo que se ha marcado de él. */
export function descuentoDe(e: Fallo, cuenta: Cuenta, piezas: number): Omit<Linea, 'error'> {
  const forma = formaDe(e);
  const tope = 'tope' in e ? e.tope : undefined;
  const quien = `«${e.id}»`;
  if (forma === 'compuesto') {
    if (cuenta === null || typeof cuenta !== 'object' || Array.isArray(cuenta)) throw new TypeError(`${quien} se marca con las piezas y el cajetín`);
    const c = cuenta as { piezas: number; cajetin: boolean };
    if (typeof c.cajetin !== 'boolean') throw new TypeError(`${quien}: lo del cajetín es sí o no`);
    if (esCuenta(c.piezas, quien) > piezas) throw new RangeError(`${quien}: falta en más piezas de las que tiene el despiece`);
    const bruto = (e.precio as readonly ParteDePrecio[]).reduce(
      (s, p) => s + (p.donde === 'pieza' ? p.precio * c.piezas : c.cajetin ? p.precio : 0),
      0,
    );
    return { descuento: topa(bruto, tope), topado: tope !== undefined && bruto < tope };
  }
  const precio = e.precio as number;
  if (forma === 'por-pieza') {
    if (!Array.isArray(cuenta) || cuenta.length !== piezas) throw new TypeError(`${quien} se marca con una cuenta por pieza: ${piezas}`);
    const brutos = cuenta.map((n) => precio * esCuenta(n, quien));
    return {
      descuento: brutos.reduce((s, b) => s + topa(b, tope), 0) + 0,
      topado: brutos.some((b) => b < tope!),
    };
  }
  if (typeof cuenta !== 'number') throw new TypeError(`${quien} se marca con un número`);
  const n = esCuenta(cuenta, quien);
  if (forma === 'una-vez' && n > 1) throw new RangeError(`${quien} se cobra una vez: se marca con 0 o 1`);
  if ('por' in e && e.por === 'pieza' && n > piezas) throw new RangeError(`${quien}: en más piezas de las que tiene el despiece`);
  const bruto = precio * n;
  return { descuento: topa(bruto, tope), topado: tope !== undefined && bruto < tope };
}

/** Si el ejercicio se corrige, y cuánto se le quita. */
export function corrige(hoja: HojaDeCriterios, marcas: Marcas): Resultado {
  if (!Number.isInteger(marcas.piezas) || marcas.piezas < 1) throw new RangeError('un despiece tiene al menos una pieza');
  const minimos = new Set(hoja.minimos.map((m) => m.id));
  for (const id of marcas.cumple) if (!minimos.has(id)) throw new Error(`«${id}» no es un mínimo de la hoja`);
  const errores = [...hoja.muyGraves, ...hoja.tipicos];
  const porId = new Map(errores.map((e) => [e.id, e]));
  for (const id of Object.keys(marcas.errores)) if (!porId.has(id)) throw new Error(`«${id}» no es un error de la hoja`);

  const cumple = new Set(marcas.cumple);
  const faltan = hoja.minimos.filter((m) => !cumple.has(m.id));
  const lineas = errores
    .filter((e) => Object.prototype.hasOwnProperty.call(marcas.errores, e.id))
    .map((e) => ({ error: e, ...descuentoDe(e, marcas.errores[e.id], marcas.piezas) }))
    .filter((l) => l.descuento < 0);
  return {
    seCorrige: faltan.length === 0,
    faltan,
    lineas,
    total: lineas.reduce((s, l) => s + l.descuento, 0),
  };
}
