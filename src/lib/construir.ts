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
import {
  acierta,
  casaTramo,
  cumple,
  type Dibujos,
  type Elegidas,
  type Marcados,
  type Objetivo,
  type Predicado,
  type Tramo,
} from './diedrico-corrige';
import {
  compilaDibujos,
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

/** Un tramo de arista con su visibilidad (el `Taller` con segmentos, 7 de
 *  octubre de 2026): `traza` es una expresión de la receta que da un solo
 *  segmento, y `porque` lo que se le dice a quien lo pasa del otro tipo. */
export interface TramoDeclarado {
  readonly traza: string;
  readonly tipo: Tramo['tipo'];
  readonly porque: string;
}

export interface ConstruirDeclarado {
  readonly titulo: string;
  readonly intro: string;
  readonly herramientas: readonly string[];
  /** En mm, la de la regla. */
  readonly tolerancia: number;
  readonly objetivos: readonly ObjetivoDeclarado[];
  readonly tramos?: readonly TramoDeclarado[];
  readonly trazado?: readonly string[];
  readonly construccion?: readonly PasoDeConstruccionDeclarado[];
  readonly bloques?: readonly BloqueDeConstruccion[];
  readonly pista: string;
  readonly desarrollo: string;
}

/** Con qué se hace un paso de la construcción paso a paso. Las dos aristas
 *  son la regla al pasar a limpio: un tramo visto, en continua gruesa, o uno
 *  oculto, a trazos. */
export type Instrumento = 'regla' | 'escuadra-cartabon' | 'compas' | 'transportador' | 'marca' | 'arista-vista' | 'arista-oculta';

export interface PasoDeConstruccionDeclarado {
  readonly con: Instrumento;
  /** Lo que se traza: una expresión de la receta que da segmentos, arcos o
   *  puntos de la lámina. */
  readonly traza: string;
  /** Escuadra y cartabón: la recta de la que se parte para trazar la
   *  paralela (un segmento de la lámina). */
  readonly guia?: string;
  /** Compás: la distancia que se toma antes de pinchar (un segmento). */
  readonly toma?: string;
  readonly rotulo?: string;
  readonly porque: string;
  /** El bloque del método («1.er cambio de plano»…), por su nombre. */
  readonly bloque?: string;
}

/** Un bloque del método, con su explicación teórica. */
export interface BloqueDeConstruccion {
  readonly nombre: string;
  readonly explica: string;
}

export interface PasoDeConstruccion {
  readonly con: Instrumento;
  readonly dibujos: Dibujos;
  readonly guia?: readonly [P2, P2];
  readonly toma?: readonly [P2, P2];
  readonly rotulo?: string;
  readonly porque: string;
  readonly bloque?: string;
}

export interface ObjetivoResuelto {
  readonly nombre: string;
  readonly rotulo: string;
  readonly pide: string;
  readonly bien: string;
  readonly es: Objetivo;
  readonly diagnosticos: readonly { readonly si: Predicado; readonly mensaje: string }[];
}

export interface TramoResuelto extends Tramo {
  readonly porque: string;
}

export interface ConstruirResuelto {
  readonly titulo: string;
  readonly intro: string;
  readonly herramientas: readonly string[];
  /** En pt, que es en lo que corrige la página. */
  readonly tolerancia: number;
  readonly objetivos: readonly ObjetivoResuelto[];
  readonly tramos: readonly TramoResuelto[];
  readonly trazado: readonly Trazado[];
  readonly construccion?: readonly PasoDeConstruccion[];
  readonly bloques?: readonly BloqueDeConstruccion[];
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

  const tramos = resuelveTramos(paso.tramos ?? [], objetivos, lamina, r, tol);
  const trazado = (paso.trazado ?? []).map((src) => compilaTrazado(src, lamina, r));
  const construccion = paso.construccion ? resuelveConstruccion(paso.construccion, objetivos, tramos, lamina, r, tol) : undefined;
  return {
    titulo: paso.titulo,
    intro: paso.intro,
    herramientas: paso.herramientas,
    tolerancia: tol,
    objetivos,
    tramos,
    trazado,
    ...(construccion ? { construccion } : {}),
    ...(paso.bloques ? { bloques: paso.bloques } : {}),
    pista: paso.pista,
    desarrollo: paso.desarrollo,
  };
}

/**
 * Los tramos de la visibilidad, compilados. Cada uno es un solo segmento, sin
 * elección (la visibilidad de una rama no es la de la otra, y todavía no hay
 * ejercicio que lo pida), más largo que la tolerancia, que es lo que separa un
 * trazo de un punto al corregir (el tramo oculto de VH en la 55·2 mide 1,8 mm);
 * y dos tramos no se pisan, porque un trazo encima de los dos no
 * sabría de cuál es.
 */
function resuelveTramos(
  declarados: readonly TramoDeclarado[],
  objetivos: readonly ObjetivoResuelto[],
  lamina: Lamina,
  r: Resultado,
  tol: number,
): TramoResuelto[] {
  const tramos = declarados.map((t, i): TramoResuelto => {
    const quien = `tramo ${i + 1}`;
    let d: Dibujos;
    try {
      d = compilaDibujos(t.traza, lamina, r);
    } catch (err) {
      throw new Error(`${quien}: ${(err as Error).message}`);
    }
    if (d.eleccion !== undefined) throw new Error(`${quien} «${t.traza}» depende de una elección, y un tramo tiene que ser uno solo`);
    const seg = d.ramas[0];
    if (seg?.length !== 1 || seg[0].tipo !== 'segmento') throw new Error(`${quien} «${t.traza}» tiene que ser un solo segmento`);
    const { a, b } = seg[0];
    if (Math.hypot(b[0] - a[0], b[1] - a[1]) <= tol) {
      throw new Error(`${quien} «${t.traza}» no llega a la tolerancia: no se distingue de un punto`);
    }
    return { a, b, tipo: t.tipo, porque: t.porque };
  });
  tramos.forEach((t, i) =>
    tramos.forEach((u, j) => {
      if (j > i && casaTramo(u.a, u.b, u.tipo, [t], tol).que !== 'fuera') {
        throw new Error(`los tramos ${i + 1} y ${j + 1} se pisan: un trazo encima de los dos no diría de cuál es`);
      }
    }),
  );
  for (const o of objetivos) {
    if (o.es.eleccion === undefined) continue;
    const posiciones = o.es.ramas.flat();
    tramos.forEach((t, i) => {
      if ([t.a, t.b].some((x) => posiciones.some((q) => Math.hypot(q[0] - x[0], q[1] - x[1]) <= tol))) {
        throw new Error(`el tramo ${i + 1} acaba en ${o.rotulo}, que depende de una elección: la visibilidad sería la de una sola rama`);
      }
    });
  }
  return tramos;
}

/** Un segmento de la lámina, para la guía de la escuadra o la abertura del
 *  compás. */
function segmentoDe(src: string, lamina: Lamina, r: Resultado, quien: string): readonly [P2, P2] {
  const d = compilaDibujos(src, lamina, r).ramas[0];
  if (d?.length !== 1 || d[0].tipo !== 'segmento') throw new Error(`${quien} «${src}» tiene que ser un segmento de la lámina`);
  return [d[0].a, d[0].b];
}

/**
 * La construcción paso a paso, compilada, y su guardián: tiene que acabar
 * marcando cada punto de la solución. Una construcción que no llega a uno de
 * ellos enseñaría un camino que no termina, y eso se caza aquí, en el build.
 * Se mira la primera rama de cada elección, que es la que se reproduce.
 */
function resuelveConstruccion(
  pasos: readonly PasoDeConstruccionDeclarado[],
  objetivos: readonly ObjetivoResuelto[],
  tramos: readonly TramoResuelto[],
  lamina: Lamina,
  r: Resultado,
  tol: number,
): PasoDeConstruccion[] {
  const resueltos = pasos.map((p, i) => {
    const quien = `construcción, paso ${i + 1}`;
    try {
      return {
        con: p.con,
        dibujos: compilaDibujos(p.traza, lamina, r),
        ...(p.guia ? { guia: segmentoDe(p.guia, lamina, r, 'su guía') } : {}),
        ...(p.toma ? { toma: segmentoDe(p.toma, lamina, r, 'lo que toma el compás') } : {}),
        ...(p.rotulo ? { rotulo: p.rotulo } : {}),
        porque: p.porque,
        ...(p.bloque ? { bloque: p.bloque } : {}),
      };
    } catch (err) {
      throw new Error(`${quien}: ${(err as Error).message}`);
    }
  });
  const marcas = resueltos
    .filter((p) => p.con === 'marca')
    .flatMap((p) => (p.dibujos.ramas[0] ?? []).filter((d) => d.tipo === 'punto').map((d) => (d as { p: P2 }).p));
  for (const o of objetivos) {
    const buenos = o.es.ramas[0] ?? [];
    if (!buenos.some((q) => marcas.some((m) => Math.hypot(m[0] - q[0], m[1] - q[1]) <= tol))) {
      throw new Error(`la construcción paso a paso no marca ${o.rotulo}: acaba sin llegar a un punto de la solución`);
    }
  }
  /* Y pasa a limpio cada tramo con su tipo: cada arista que traza es un
     trazo que el Taller daría por bueno. */
  const pasados = new Set<number>();
  resueltos.forEach((p, i) => {
    if (p.con !== 'arista-vista' && p.con !== 'arista-oculta') return;
    const tipo = p.con === 'arista-vista' ? 'visto' : 'oculto';
    for (const d of p.dibujos.ramas[0] ?? []) {
      const quien = `construcción, paso ${i + 1}`;
      if (d.tipo !== 'segmento') throw new Error(`${quien}: una arista se pasa a limpio con un segmento`);
      const casa = casaTramo(d.a, d.b, tipo, tramos, tol);
      if (casa.que === 'tipo') throw new Error(`${quien}: pasa el tramo ${casa.tramo + 1} como ${tipo}, y va ${tramos[casa.tramo].tipo}`);
      if (casa.que !== 'bien') {
        throw new Error(`${quien}: esa arista no casa con los tramos (${casa.que === 'corte' ? 'empieza o acaba donde no cambia nada' : 'no va por ninguno'})`);
      }
      for (const k of casa.tramos) pasados.add(k);
    }
  });
  const sin = tramos.findIndex((_, k) => !pasados.has(k));
  if (sin >= 0) throw new Error(`la construcción paso a paso no pasa a limpio el tramo ${sin + 1}`);
  return resueltos;
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

type PasoCalcular = {
  readonly tipo: 'calcular';
  readonly respuesta: CifraDeclarada;
  readonly distractores: readonly CifraDeclarada[];
  readonly tambienValen?: readonly CifraDeclarada[];
};
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

/* Un objetivo encima de un punto dado de la lámina no se puede marcar: el
   imán del Taller engancha antes que nada los puntos, a 1,4 veces su radio de
   11 px (`ENGANCHE_PX`), y uno dado no se deja marcar. Con la lámina al
   máximo —1,7 px por pt, `data-ancho-max`— y la lupa a ×4, ese alcance es
   1,4 · 11 / 6,8 ≈ 2,3 pt: más cerca, no hay manera. El guardián de talleres
   no lo ve, porque esos puntos los crea por su puerta de pruebas (k-l-e2, 1
   de octubre de 2026). Basta con que cada rama tenga una posición libre. */
const PEGADO_A_UN_DADO = (1.4 * 11) / (1.7 * 4);

function compruebaMarcables(c: ConstruirResuelto, d: DatosLamina): void {
  const dados = Object.entries(d.puntos).filter(([, p]) => p.marca !== undefined);
  if (dados.length === 0) return;
  const masCerca = (q: P2) =>
    dados.map(([n, p]) => ({ n, d: Math.hypot(p.x - q[0], p.y - q[1]) })).reduce((a, b) => (b.d < a.d ? b : a));
  for (const o of c.objetivos) {
    o.es.ramas.forEach((rama, i) => {
      const cercas = rama.map(masCerca);
      if (cercas.length === 0 || cercas.some((x) => x.d >= PEGADO_A_UN_DADO)) return;
      const { n, d: dist } = cercas[0];
      const cual = o.es.ramas.length > 1 ? `, en su rama ${i + 1},` : '';
      throw new Error(
        `objetivo «${o.nombre}»${cual} cae a ${(dist * PT_MM).toFixed(2)} mm del punto dado ${n} de la lámina: el Taller engancha el punto dado y no deja marcar el objetivo, ni con la lupa`,
      );
    });
  }
}

/** Las cifras de un `calcular` con lo que son, para decirlo al fallar. */
const cifrasDe = (p: PasoCalcular) => [
  { que: 'la respuesta', c: p.respuesta },
  ...p.distractores.map((c, k) => ({ que: `el distractor ${k + 1}`, c })),
  ...(p.tambienValen ?? []).map((c, k) => ({ que: `la ${k + 1}.ª que también vale`, c })),
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
        const c = resuelveConstruir(p, lamina, r);
        compruebaMarcables(c, datosLamina);
        resueltos.set(i, c);
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
