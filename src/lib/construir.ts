/**
 * El paso `construir` de Expresión Gráfica, resuelto para la página: la receta
 * del ejercicio evaluada sobre su lámina, cada objetivo compilado a las
 * posiciones que valen, cada diagnóstico a su árbol, y **cada error declarado
 * construido a propósito** para ver que salta con su mensaje.
 *
 * Lo usa `EjercicioGuiado` al pintar el ejercicio, así que una receta que no
 * evalúa, un objetivo mal escrito o un diagnóstico que no se puede alcanzar
 * rompen el build; y lo usa `tests/geometria/construcciones.test.ts`, que hace
 * lo mismo en un segundo sin construir el sitio.
 *
 * FALLAR A PROPÓSITO, SIN NAVEGADOR. §16 pide mirar cada ejercicio fallando a
 * propósito, y los pilotos lo hacían con Playwright construyendo cada error
 * con las herramientas. La lógica no necesita el navegador: cada diagnóstico
 * lleva un `ejemplo` —un punto que comete ese error, escrito como expresión de
 * la receta— y aquí se comprueba que ese punto **no se da por bueno** y que
 * **el primer diagnóstico que lo recoge es el suyo**. Un diagnóstico tapado por
 * otro anterior, o uno que nunca se puede cumplir, no llega a publicarse. Con
 * los objetivos anteriores marcados en su sitio y las elecciones en su primera
 * rama, que es lo que tiene delante quien llega a ese objetivo.
 */
import { PT_MM, type P2 } from './diedrico';
import { acierta, cumple, type Elegidas, type Marcados, type Objetivo, type Predicado } from './diedrico-corrige';
import {
  compilaObjetivo,
  compilaPredicado,
  compilaTrazado,
  evaluaNumero,
  evaluaReceta,
  type Lamina,
  type Receta,
  type Resultado,
  type Trazado,
} from './diedrico-receta';
import { laminaDe, type DatosLamina } from './lamina';

export interface DiagnosticoDeclarado {
  readonly si: string;
  readonly mensaje: string;
  readonly ejemplo?: string;
}

export interface ObjetivoDeclarado {
  readonly nombre: string;
  readonly rotulo?: string;
  readonly pide: string;
  readonly es: string;
  readonly bien: string;
  readonly diagnosticos: readonly DiagnosticoDeclarado[];
}

export interface ConstruirDeclarado {
  readonly titulo: string;
  readonly intro: string;
  readonly herramientas: readonly string[];
  /** En mm, la de la regla. */
  readonly tolerancia: number;
  readonly objetivos: readonly ObjetivoDeclarado[];
  readonly trazado?: readonly string[];
  readonly pista: string;
  readonly desarrollo: string;
}

export interface ObjetivoResuelto {
  readonly nombre: string;
  readonly rotulo: string;
  readonly pide: string;
  readonly bien: string;
  readonly es: Objetivo;
  readonly diagnosticos: readonly { readonly si: Predicado; readonly mensaje: string }[];
}

export interface ConstruirResuelto {
  readonly titulo: string;
  readonly intro: string;
  readonly herramientas: readonly string[];
  /** En pt, que es en lo que corrige la página. */
  readonly tolerancia: number;
  readonly objetivos: readonly ObjetivoResuelto[];
  readonly trazado: readonly Trazado[];
  readonly pista: string;
  readonly desarrollo: string;
}

const SUBINDICES = '₀₁₂₃₄₅₆₇₈₉';

/** El rótulo de un objetivo por su nombre: `P1` es P₁ y `Q2` es Q₂. */
export const rotuloDe = (nombre: string): string =>
  nombre.replace(/(\d+)$/, (cifras) => [...cifras].map((c) => SUBINDICES[Number(c)]).join(''));

/** El primer diagnóstico que recoge el punto, o -1 si ninguno. */
function primeroQueRecoge(
  diagnosticos: readonly { si: Predicado }[],
  p: P2,
  marcados: Marcados,
  tol: number,
  elegidas: Elegidas,
): number {
  return diagnosticos.findIndex((d) => cumple(d.si, p, marcados, tol, elegidas));
}

/**
 * Compila el paso y comprueba cada error declarado. Lanza con el objetivo y el
 * diagnóstico delante: `objetivo «Q1», diagnóstico 2: …`.
 */
export function resuelveConstruir(paso: ConstruirDeclarado, lamina: Lamina, r: Resultado): ConstruirResuelto {
  const tol = paso.tolerancia / PT_MM;
  const nombres = paso.objetivos.map((o) => o.nombre);
  const marcados: Record<string, P2> = {};
  const elegidas: Record<string, number> = {};

  const objetivos = paso.objetivos.map((o): ObjetivoResuelto => {
    const donde = `objetivo «${o.nombre}»`;
    /* Solo el último puede ser `siempre`: uno antes recoge cualquier punto y
       tapa a todos los de detrás, y si esos no llevan `ejemplo` —el último no
       lo necesita— la comprobación de los ejemplos no lo vería (revisión del
       27 de septiembre de 2026). */
    const tapa = o.diagnosticos.slice(0, -1).findIndex((d) => d.si.trim() === 'siempre');
    if (tapa >= 0) {
      throw new Error(`${donde}, diagnóstico ${tapa + 1}: «siempre» solo puede ir el último, porque recoge cualquier punto y tapa a los de detrás`);
    }
    let es: Objetivo;
    try {
      es = compilaObjetivo(o.es, lamina, r);
    } catch (err) {
      throw new Error(`${donde}: ${(err as Error).message}`);
    }
    /* Dos ramas que caen a menos de dos tolerancias no se distinguen: una
       marca entre ellas valdría para las dos y fijaría la primera sin que
       nadie lo sepa (revisión del 27 de septiembre de 2026). */
    if (es.eleccion !== undefined) {
      for (let i = 0; i < es.ramas.length; i++)
        for (let j = i + 1; j < es.ramas.length; j++)
          for (const a of es.ramas[i])
            for (const b of es.ramas[j])
              if (Math.hypot(a[0] - b[0], a[1] - b[1]) < 2 * tol) {
                throw new Error(`${donde}: sus ramas ${i + 1} y ${j + 1} caen a menos de dos tolerancias, y una marca no diría cuál es`);
              }
    }
    const diagnosticos = o.diagnosticos.map((d, k) => {
      try {
        return { si: compilaPredicado(d.si, lamina, r, nombres), mensaje: d.mensaje };
      } catch (err) {
        throw new Error(`${donde}, diagnóstico ${k + 1}: ${(err as Error).message}`);
      }
    });

    o.diagnosticos.forEach((d, k) => {
      if (d.ejemplo === undefined) return;
      const quien = `${donde}, diagnóstico ${k + 1} («${d.si}»)`;
      let ejemplo: Objetivo;
      try {
        ejemplo = compilaObjetivo(d.ejemplo, lamina, r);
      } catch (err) {
        throw new Error(`${quien}, su ejemplo: ${(err as Error).message}`);
      }
      if (ejemplo.eleccion !== undefined || ejemplo.ramas.length !== 1 || ejemplo.ramas[0].length !== 1) {
        throw new Error(`${quien}: el ejemplo tiene que ser un solo punto; si depende de una elección, escoge la rama con rama()`);
      }
      const p = ejemplo.ramas[0][0];
      if (acierta(es, p, elegidas, tol).bien) {
        throw new Error(`${quien}: su ejemplo se da por bueno; el error no se distingue de la solución con la tolerancia de ${paso.tolerancia} mm`);
      }
      const m = primeroQueRecoge(diagnosticos, p, marcados, tol, elegidas);
      if (m === -1) throw new Error(`${quien}: su ejemplo no lo recoge ningún diagnóstico, ni este`);
      if (m !== k) throw new Error(`${quien}: su ejemplo lo recoge antes el diagnóstico ${m + 1} («${o.diagnosticos[m].si}»), y este no se vería nunca`);
    });

    /* Quien sigue adelante tiene este objetivo marcado en su sitio, en la
       primera rama si depende de una elección. */
    const rama = es.eleccion !== undefined ? (elegidas[es.eleccion] ?? 0) : 0;
    if (es.eleccion !== undefined) elegidas[es.eleccion] = rama;
    marcados[o.nombre] = es.ramas[rama][0];

    return { nombre: o.nombre, rotulo: o.rotulo ?? rotuloDe(o.nombre), pide: o.pide, bien: o.bien, es, diagnosticos };
  });

  const trazado = (paso.trazado ?? []).map((src) => compilaTrazado(src, lamina, r));
  return {
    titulo: paso.titulo,
    intro: paso.intro,
    herramientas: paso.herramientas,
    tolerancia: tol,
    objetivos,
    trazado,
    pista: paso.pista,
    desarrollo: paso.desarrollo,
  };
}

/**
 * Que un número escrito en el YAML es el de la receta. Las respuestas y los
 * distractores de un `calcular` de Expresión Gráfica se escriben con su cifra,
 * para que el esquema pueda comprobar todo lo que ya comprueba —que se lee,
 * que ningún distractor cae dentro de la tolerancia—, pero cada uno lleva al
 * lado la expresión de la receta de la que sale, y aquí se exige que la cifra
 * sea esa expresión redondeada como está escrita. Un número a mano que no
 * sale de la geometría no llega a publicarse.
 */
export function cuadraConLaReceta(escrito: string, esperado: number): boolean {
  const limpio = escrito.trim().replace(',', '.').split(/\s+/)[0];
  const v = Number(limpio);
  if (!Number.isFinite(v)) return false;
  const decimales = (limpio.split('.')[1] ?? '').length;
  return Math.abs(v - esperado) <= 0.5 * 10 ** -decimales + 1e-9;
}

/** Lo que un ejercicio de Expresión Gráfica declara de su receta. */
export interface RecetaDeclarada extends Receta {
  readonly lamina: string;
}

/** Una cifra de un `calcular` que puede ir atada a la receta. */
interface CifraDeclarada {
  readonly valor: string;
  readonly receta?: string;
}

type PasoCalcular = { readonly tipo: 'calcular'; readonly respuesta: CifraDeclarada; readonly distractores: readonly CifraDeclarada[] };
type PasoConstruir = { readonly tipo: 'construir' } & ConstruirDeclarado;

/** Lo que `resuelveEjercicio` mira de un ejercicio: su receta y sus pasos. */
export interface EjercicioConReceta {
  readonly id: string;
  readonly receta?: RecetaDeclarada;
  readonly pasos: readonly (PasoConstruir | PasoCalcular | { readonly tipo: string })[];
}

type Paso = EjercicioConReceta['pasos'][number];
const esConstruir = (p: Paso): p is PasoConstruir => p.tipo === 'construir';
const esCalcular = (p: Paso): p is PasoCalcular => p.tipo === 'calcular';

/** Las cifras de un `calcular` con lo que son, para decirlo al fallar. */
const cifrasDe = (p: PasoCalcular) => [
  { que: 'la respuesta', c: p.respuesta },
  ...p.distractores.map((c, k) => ({ que: `el distractor ${k + 1}`, c })),
];

/**
 * Todo lo que un ejercicio saca de su receta: sus pasos `construir`
 * compilados, por su índice, y la comprobación de que cada cifra de un
 * `calcular` que dice de qué expresión sale es esa expresión. Lanza con el
 * ejercicio y el paso delante: `sd1-…, paso 2: objetivo «Q1»…`.
 *
 * Un ejercicio sin receta no puede tener pasos `construir` ni cifras atadas a
 * ella. El esquema ya lo impide, y aquí se vuelve a decir por si alguien lo
 * llama con datos que no han pasado por él.
 */
export function resuelveEjercicio(e: EjercicioConReceta, datosLamina: DatosLamina | undefined): Map<number, ConstruirResuelto> {
  const resueltos = new Map<number, ConstruirResuelto>();
  const atadas = e.pasos.some((p) => esConstruir(p) || (esCalcular(p) && cifrasDe(p).some(({ c }) => c.receta !== undefined)));
  if (!e.receta) {
    if (atadas) throw new Error(`${e.id}: tiene pasos que salen de una receta y no declara ninguna`);
    return resueltos;
  }
  if (!datosLamina) throw new Error(`${e.id}: la lámina «${e.receta.lamina}» no está en src/content/laminas`);
  const lamina = laminaDe(datosLamina);
  let r: Resultado;
  try {
    r = evaluaReceta(lamina, e.receta);
  } catch (err) {
    throw new Error(`${e.id}, receta: ${(err as Error).message}`);
  }
  e.pasos.forEach((p, i) => {
    const donde = `${e.id}, paso ${i + 1}`;
    if (esConstruir(p)) {
      try {
        resueltos.set(i, resuelveConstruir(p, lamina, r));
      } catch (err) {
        throw new Error(`${donde}: ${(err as Error).message}`);
      }
    }
    if (!esCalcular(p)) return;
    for (const { que, c } of cifrasDe(p)) {
      if (c.receta === undefined) continue;
      let esperado: number;
      try {
        esperado = evaluaNumero(c.receta, lamina, r);
      } catch (err) {
        throw new Error(`${donde}, ${que}: ${(err as Error).message}`);
      }
      if (!cuadraConLaReceta(c.valor, esperado)) {
        throw new Error(`${donde}: ${que} dice ${c.valor} y su receta («${c.receta}») da ${esperado.toFixed(4)}`);
      }
    }
  });
  return resueltos;
}
