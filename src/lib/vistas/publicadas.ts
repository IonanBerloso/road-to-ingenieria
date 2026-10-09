/**
 * Las vistas publicadas (diseño de la fase M, §3.2, punto 8): lo que
 * `scripts/vistas.mjs` escribe en `src/content/vistas/<id>.json` desde cada
 * pieza de `src/content/piezas/`, y lo que se comprueba de ello.
 *
 * EL MOTOR NO CORRE EN CADA BUILD. Corre `npm run vistas`, que guarda lo
 * calculado con el resumen (sha-256) del texto de la pieza y del código del
 * motor. Es el precedente de las tablas de vapor: se calcula, no se edita a
 * mano, y dos guardianes lo vigilan. El esquema de la colección `vistas`
 * rechaza un JSON cuyo resumen no casa con su pieza o con el motor de hoy
 * (`esquemas.ts`), y `tests/vistas/al-dia.test.ts` lo recalcula entero.
 *
 * Prueba de utilidad (§13):
 * - **Para quién:** quien escribe un ejercicio de vistas de Expresión
 *   Gráfica (temas 8 y 9), y el alumno que lo hace.
 * - **Cuándo:** al describir una pieza y al construir el sitio.
 * - **Qué gana:** las vistas de cada pieza sin calcularlas en cada build
 *   (de 0,1 a 1 s por pieza) y sin que una vista publicada se quede atrás
 *   de su pieza; una vista girada o espejada por error para el build.
 * - **Cómo se comprueba:** `tests/vistas/publicadas.test.ts`, con un JSON
 *   de resumen cambiado, una planta espejada y una desplazada.
 *
 * Aquí no hay nada que lea el disco: eso es `resumen.ts`, para que la página
 * pueda importar esto sin arrastrar `node:fs`.
 *
 * Este fichero entra en el resumen del motor (`resumen.ts`): cambiar
 * `DECIMALES` o la forma del JSON cambia lo publicado, y el build pide
 * entonces `npm run vistas` como si hubiera cambiado el motor.
 */
import type { VistaCalculada, VistasCalculadas } from './motor.ts';
import type { VistaId } from './proyeccion.ts';

/** Las cifras que se guardan: diezmilésimas de mm. El Taller corrige a 1 mm;
 *  esto quita la basura de las cuentas y deja el fichero legible. */
export const DECIMALES = 4;

/** Lo que pueden separarse dos vistas de la misma pieza en su medida común
 *  —la anchura de alzado y planta, la altura de alzado y perfil, la
 *  profundidad de planta y perfil— antes de decir que una está girada o
 *  espejada, en mm. Muy por encima del redondeo y muy por debajo de
 *  cualquier error de verdad, que mueve milímetros. */
export const TOL_INVARIANTE = 0.01;

/** Lo que pueden separarse una cifra recalculada y la publicada antes de
 *  decir que la publicada se ha quedado atrás, en mm (o en grados, en los
 *  arcos). El motor da lo mismo en todas las máquinas; esto es por si el
 *  redondeo de la última cifra cae del otro lado. */
export const TOL_AL_DIA = 1e-3;

export interface Resumen {
  /** El del texto de la pieza, con los finales de línea en LF. */
  readonly pieza: string;
  /** El del código del motor: los ficheros de `lib/vistas` que corren al
   *  compilar una pieza y calcular sus vistas (`ficherosDelMotor`). */
  readonly motor: string;
}

export interface VistasPublicadas extends VistasCalculadas {
  readonly resumen: Resumen;
}

/** El id de una pieza, que es el nombre de sus dos ficheros: su código en
 *  minúsculas, con guiones. NyV-2.18-3 → nyv-2-18-3; RI-V1 → ri-v1. Como las
 *  láminas, cada fichero se llama como su código. */
export function idDePieza(codigo: string): string {
  return codigo
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const redondea = (x: number): number => {
  const f = 10 ** DECIMALES;
  return Math.round(x * f) / f || 0;
};

/** Una copia con cada número redondeado a `DECIMALES`. */
function redondeaTodo<T>(x: T): T {
  if (typeof x === 'number') return redondea(x) as T;
  if (Array.isArray(x)) return x.map((y) => redondeaTodo(y)) as T;
  if (x && typeof x === 'object') return Object.fromEntries(Object.entries(x).map(([k, v]) => [k, redondeaTodo(v)])) as T;
  return x;
}

/** Lo que se guarda de una pieza: lo calculado, redondeado, con su resumen
 *  delante. Las claves van en un orden fijo para que el fichero no cambie
 *  si no cambia nada. */
export function publicaVistas(v: VistasCalculadas, resumen: Resumen): VistasPublicadas {
  const vistas = redondeaTodo(v.vistas);
  return { codigo: v.codigo, resumen: { pieza: resumen.pieza, motor: resumen.motor }, ocultas: v.ocultas, vistas };
}

/**
 * El texto del JSON: con sangría, salvo cada tramo, eje y descarte, que va
 * en su renglón. Así un cambio de una arista es un cambio de un renglón, y
 * no de veinte (lo mismo que hace `tablas-vapor.mjs` con cada fila).
 */
export function textoDeVistas(p: VistasPublicadas): string {
  const lista = (xs: readonly unknown[], sangria: string) =>
    xs.length ? `[\n${xs.map((x) => `${sangria}  ${JSON.stringify(x)}`).join(',\n')}\n${sangria}]` : '[]';
  const vista = (k: VistaId) => {
    const v = p.vistas[k];
    const s = '      ';
    return [
      `    "${k}": {`,
      `${s}"vista": ${JSON.stringify(v.vista)},`,
      `${s}"encuadre": ${JSON.stringify(v.encuadre)},`,
      `${s}"tramos": ${lista(v.tramos, s)},`,
      `${s}"ejes": ${lista(v.ejes, s)},`,
      `${s}"descartes": ${lista(v.descartes, s)}`,
      '    }',
    ].join('\n');
  };
  const ids = Object.keys(p.vistas) as VistaId[];
  return [
    '{',
    `  "codigo": ${JSON.stringify(p.codigo)},`,
    `  "resumen": ${JSON.stringify(p.resumen)},`,
    `  "ocultas": ${JSON.stringify(p.ocultas)},`,
    '  "vistas": {',
    ids.map(vista).join(',\n'),
    '  }',
    '}',
    '',
  ].join('\n');
}

/** Si el resumen guardado es el de la pieza y el motor de hoy; si no, qué
 *  falta hacer. */
export function problemasDeResumen(guardado: Resumen, hoy: Resumen): string[] {
  const r: string[] = [];
  if (guardado.pieza !== hoy.pieza) r.push('la pieza ha cambiado desde que se calcularon sus vistas (cuenta su texto entero, también un comentario o un espacio): pasa `npm run vistas`');
  if (guardado.motor !== hoy.motor) r.push('el motor de vistas ha cambiado desde que se calcularon: pasa `npm run vistas`');
  return r;
}

/**
 * Los invariantes del diseño (§3.8) que se comprueban en el build: alzado y
 * planta con la misma anchura, alzado y perfil con la misma altura, planta
 * y perfil con la misma profundidad. Cazan una vista girada o espejada, y
 * una desplazada respecto de las otras.
 *
 * Con las coordenadas del papel de `proyeccion.ts`: el alzado es (x, −z), la
 * planta (x, −y) y el perfil izquierdo (−y, −z). Así la anchura es la u del
 * alzado y de la planta, la altura es la v del alzado y del perfil, y la
 * profundidad es la v de la planta y la u del perfil.
 */
export function problemasDeInvariantes(v: { readonly vistas: Readonly<Record<VistaId, Pick<VistaCalculada, 'encuadre'>>> }): string[] {
  const { alzado, planta, perfil } = { alzado: v.vistas.alzado.encuadre, planta: v.vistas.planta.encuadre, perfil: v.vistas.perfil.encuadre };
  const r: string[] = [];
  const mm = (x: number) => x.toFixed(2).replace('.', ',');
  const igual = (que: string, a: [number, number], b: [number, number], de: string) => {
    if (Math.abs(a[0] - b[0]) > TOL_INVARIANTE || Math.abs(a[1] - b[1]) > TOL_INVARIANTE) {
      r.push(`${de} no tienen la misma ${que}: de ${mm(a[0])} a ${mm(a[1])} mm contra de ${mm(b[0])} a ${mm(b[1])} mm (¿una vista girada, espejada o movida?)`);
    }
  };
  igual('anchura', [alzado.umin, alzado.umax], [planta.umin, planta.umax], 'el alzado y la planta');
  igual('altura', [alzado.vmin, alzado.vmax], [perfil.vmin, perfil.vmax], 'el alzado y el perfil');
  igual('profundidad', [planta.vmin, planta.vmax], [perfil.umin, perfil.umax], 'la planta y el perfil');
  return r;
}

/**
 * La primera diferencia entre lo recalculado y lo publicado, con su camino
 * («vistas.planta.tramos[3].forma.a[1]: 12,5 contra 12,7»); null si son lo
 * mismo. Las cifras se comparan con `TOL_AL_DIA`; lo demás, exacto.
 */
export function primeraDiferencia(hoy: unknown, publicado: unknown, camino = '', tol = TOL_AL_DIA): string | null {
  const donde = camino || '(raíz)';
  if (typeof hoy === 'number' && typeof publicado === 'number') {
    return Math.abs(hoy - publicado) <= tol ? null : `${donde}: ${hoy} hoy contra ${publicado} publicado`;
  }
  if (Array.isArray(hoy) && Array.isArray(publicado)) {
    if (hoy.length !== publicado.length) return `${donde}: ${hoy.length} elementos hoy contra ${publicado.length} publicados`;
    for (let i = 0; i < hoy.length; i++) {
      const d = primeraDiferencia(hoy[i], publicado[i], `${camino}[${i}]`, tol);
      if (d) return d;
    }
    return null;
  }
  if (hoy && publicado && typeof hoy === 'object' && typeof publicado === 'object' && !Array.isArray(hoy) && !Array.isArray(publicado)) {
    const [a, b] = [hoy as Record<string, unknown>, publicado as Record<string, unknown>];
    const claves = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
    for (const k of claves) {
      if (!(k in a)) return `${camino ? `${camino}.` : ''}${k}: no está hoy y sí en lo publicado`;
      if (!(k in b)) return `${camino ? `${camino}.` : ''}${k}: está hoy y no en lo publicado`;
      const d = primeraDiferencia(a[k], b[k], camino ? `${camino}.${k}` : k, tol);
      if (d) return d;
    }
    return null;
  }
  return hoy === publicado ? null : `${donde}: ${JSON.stringify(hoy)} hoy contra ${JSON.stringify(publicado)} publicado`;
}
