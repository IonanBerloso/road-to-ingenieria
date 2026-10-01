/**
 * Lo que una receta puede llamar: cada función de `lib/diedrico` con sus argumentos comprobados, y los diagnósticos. Una función nueva se añade aquí y en `lib/diedrico`, con su prueba.
 *
 * Parte de las recetas de Expresión Gráfica: el porqué y la gramática están en
 * `diedrico-receta.ts`, que es la API pública. Se partió en cuatro ficheros el
 * 1 de octubre de 2026 (fase K, tanda 0 b), sin cambiar nada de lo que hace,
 * para que quepan las funciones de los lotes siguientes.
 */
import {
  PT_MM,
  TOL_VERTICAL,
  abatidoAlzado,
  abatidoPlanta,
  anguloConPH,
  anguloConPV,
  anguloPlanoConPH,
  anguloPlanoConPV,
  corteConSegmentos,
  deltaCota,
  distanciaAPlano,
  distanciaARecta,
  enPlano,
  enRecta,
  frontalPor,
  horizontalPor,
  lmpDir,
  pendiente as pendienteDe,
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
} from './diedrico';
import { propio, QUE, espera, comoNum, comoP3, comoPlano, comoRecta3, comoRecta2 } from './diedrico-receta-valores';
import type { Lamina, Valor } from './diedrico-receta-valores';

/* ════════════════════════════ las funciones ══════════════════════════════ */

export interface Entorno {
  readonly lamina: Lamina;
  readonly valores: ReadonlyMap<string, Valor>;
  /** Los nombres que son de la escena; los demás son de la solución. */
  readonly escena: ReadonlySet<string>;
  /** La línea de la receta que se está evaluando: da nombre a una elección. */
  readonly linea?: string;
}

export type Obligacion = 'obligatorio' | 'opcional';

/** Lo que admite una función: cuántos argumentos por posición —exactos, o
 *  entre dos cifras— y qué nombres. Cualquier otra cosa es una errata. */
export interface Firma {
  readonly posicion: number | readonly [number, number];
  readonly nombres?: Readonly<Record<string, Obligacion>>;
}

export interface Funcion extends Firma {
  readonly hace: (args: Valor[], n: Record<string, Valor | undefined>, e: Entorno) => Valor;
}

export function compruebaFirma(quien: string, f: Firma, posicion: number, claves: readonly string[]): void {
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

export const lineaDe = (a: P2, b: P2): Valor => ({ k: 'linea', p: a, d: [b[0] - a[0], b[1] - a[1]] });

export function proyeccion(x: Valor | undefined, vista: 'planta' | 'alzado'): Valor {
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

export function angulo(x: Valor | undefined, con: 'ph' | 'pv'): Valor {
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
export const FUNCIONES: Readonly<Record<string, Funcion>> = {
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
  /* La diferencia de cotas de dos puntos, en pt: el cateto del triángulo de
     la verdadera magnitud que se mide en el alzado. */
  diferencia_de_cotas: {
    posicion: 2,
    hace: ([a, b]) => ({ k: 'num', v: deltaCota(comoP3(a, 'diferencia_de_cotas()'), comoP3(b, 'diferencia_de_cotas()')) }),
  },
  /* Lo que sube por lo que avanza: la tangente del ángulo con el plano
     horizontal. Una recta vertical no avanza, y no se inventa un número. */
  pendiente: {
    posicion: 2,
    hace: ([a, b]) => {
      const [p, q] = [comoP3(a, 'pendiente()'), comoP3(b, 'pendiente()')];
      if (vmPlanta(p, q) < 1e-9) throw new Error('pendiente(): la recta es vertical, y su pendiente no es un número');
      return { k: 'num', v: pendienteDe(p, q) };
    },
  },
  /* Q abatido sobre la planta, con el plano proyectante de PQ: a |Δcota| de
     Q₁ y perpendicular a P₁Q₁, y los dos lados valen. Es una LISTA y no una
     elección como la de punto_a_distancia: el lado no cambia nada de lo que
     viene después —la distancia de P₁ a cualquiera de los dos es la
     verdadera magnitud de PQ—, así que un objetivo los acepta todos sin
     fijar ninguna rama. */
  abatido_planta: {
    posicion: 2,
    hace: ([a, b]) => {
      const [x, y] = abatidoPlanta(comoP3(a, 'abatido_planta()'), comoP3(b, 'abatido_planta()'));
      return { k: 'lista', v: [{ k: 'p2', v: x }, { k: 'p2', v: y }] };
    },
  },
  /* Lo mismo sobre el alzado: a |Δalejamiento| de Q₂, perpendicular a P₂Q₂. */
  abatido_alzado: {
    posicion: 2,
    hace: ([a, b]) => {
      const [x, y] = abatidoAlzado(comoP3(a, 'abatido_alzado()'), comoP3(b, 'abatido_alzado()'));
      return { k: 'lista', v: [{ k: 'p2', v: x }, { k: 'p2', v: y }] };
    },
  },
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
export const PREDICADOS: Readonly<Record<string, Firma>> = {
  en_vertical_de: { posicion: 1 },
  en_horizontal_de: { posicion: 1 },
  cerca_de: { posicion: 1 },
  a_distancia: { posicion: 0, nombres: { de: 'obligatorio', d: 'obligatorio' } },
  en_recta: { posicion: 1 },
  en_segmento: { posicion: [1, Infinity] },
  es_pie_perpendicular: { posicion: 0, nombres: { desde: 'obligatorio', sobre: 'obligatorio' } },
};

/** Palabras que no pueden ser el nombre de una línea. */
export const PALABRAS = new Set(['figura', 'escena', 'solucion', 'siempre', 'otra_rama', 'rama']);
