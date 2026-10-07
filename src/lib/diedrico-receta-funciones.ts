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
  abatido,
  abatidoJunto,
  anguloDiedro,
  anguloPlanos,
  anguloRectaPlano,
  anguloRectas,
  apice,
  cambioPlano,
  poligonoRegular,
  puntoATresDistancias,
  corteRectaPlano,
  cuadradoPorDiagonal,
  distanciaRectas,
  gira,
  paraleloADistancia,
  perpendicularAPlano,
  pieComun,
  pieEnPlano,
  planoMediador,
  planoPerpendicularARecta,
  type Recta3,
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

/** Una recta del espacio, dada como recta o como segmento. */
function rectaDe(v: Valor | undefined, quien: string): Recta3 {
  if (v?.k === 'seg3') return rectaPorPuntos(v.a, v.b);
  return comoRecta3(v, quien);
}

/** `ascendente` es 1 (el lado que gana cota) y `descendente`, −1. */
const lado = (v: Valor | undefined, quien: string): 1 | -1 => (espera(v, 'sentido', quien).v === 'ascendente' ? 1 : -1);

/** Dos soluciones buenas: una elección con el nombre de su línea. */
function eleccion(e: Entorno, quien: string, v: Valor[]): Valor {
  if (!e.linea) throw new Error(`${quien} da dos soluciones, que son una elección: se declara en una línea de la receta, con nombre, o se le da un sentido`);
  return { k: 'ramas', eleccion: e.linea, v };
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
  /* ── el lote 0 de la fase K (1 de octubre de 2026): ángulos, distancias,
     perpendiculares, abatimientos y giros. Las rectas se aceptan como recta
     o como segmento del espacio. Las que tienen dos soluciones buenas
     (gira, paralelo_a_distancia y apice, si no se les da sentido) devuelven
     una elección, como punto_a_distancia: se declaran en una línea con
     nombre. `sentido: ascendente` es el lado que gana cota. ── */
  angulo_rectas: {
    posicion: 2,
    hace: ([a, b]) => ({ k: 'num', v: anguloRectas(rectaDe(a, 'angulo_rectas()'), rectaDe(b, 'angulo_rectas()')) }),
  },
  angulo_recta_plano: {
    posicion: 2,
    hace: ([a, b]) => ({ k: 'num', v: anguloRectaPlano(rectaDe(a, 'angulo_recta_plano()'), comoPlano(b, 'angulo_recta_plano()')) }),
  },
  angulo_planos: {
    posicion: 2,
    hace: ([a, b]) => ({ k: 'num', v: anguloPlanos(comoPlano(a, 'angulo_planos()'), comoPlano(b, 'angulo_planos()')) }),
  },
  angulo_diedro: {
    posicion: 3,
    hace: ([a, arista, b]) => ({
      k: 'num',
      v: anguloDiedro(comoP3(a, 'angulo_diedro()'), rectaDe(arista, 'angulo_diedro()'), comoP3(b, 'angulo_diedro()')),
    }),
  },
  pie_en_plano: {
    posicion: 2,
    hace: ([q, pl]) => ({ k: 'p3', v: pieEnPlano(comoP3(q, 'pie_en_plano()'), comoPlano(pl, 'pie_en_plano()')) }),
  },
  distancia_a_plano: {
    posicion: 2,
    hace: ([q, pl]) => ({ k: 'num', v: distanciaAPlano(comoP3(q, 'distancia_a_plano()'), comoPlano(pl, 'distancia_a_plano()')) }),
  },
  pie_comun: {
    posicion: 2,
    hace: ([a, b]) => ({ k: 'p3', v: pieComun(rectaDe(a, 'pie_comun()'), rectaDe(b, 'pie_comun()')) }),
  },
  distancia_rectas: {
    posicion: 2,
    hace: ([a, b]) => ({ k: 'num', v: distanciaRectas(rectaDe(a, 'distancia_rectas()'), rectaDe(b, 'distancia_rectas()')) }),
  },
  plano_mediador: {
    posicion: 2,
    hace: ([a, b]) => ({ k: 'plano', v: planoMediador(comoP3(a, 'plano_mediador()'), comoP3(b, 'plano_mediador()')) }),
  },
  corte_recta_plano: {
    posicion: 2,
    hace: ([a, pl]) => ({ k: 'p3', v: corteRectaPlano(rectaDe(a, 'corte_recta_plano()'), comoPlano(pl, 'corte_recta_plano()')) }),
  },
  perpendicular_a_plano: {
    posicion: 2,
    hace: ([q, pl]) => ({ k: 'recta3', v: perpendicularAPlano(comoP3(q, 'perpendicular_a_plano()'), comoPlano(pl, 'perpendicular_a_plano()')) }),
  },
  plano_perpendicular_a_recta: {
    posicion: 2,
    hace: ([q, a]) => ({
      k: 'plano',
      v: planoPerpendicularARecta(comoP3(q, 'plano_perpendicular_a_recta()'), rectaDe(a, 'plano_perpendicular_a_recta()')),
    }),
  },
  paralelo_a_distancia: {
    posicion: 2,
    nombres: { sentido: 'opcional' },
    hace: ([pl, d], n, e) => {
      const [plano, dist] = [comoPlano(pl, 'paralelo_a_distancia()'), comoNum(d, 'paralelo_a_distancia()')];
      if (n.sentido) return { k: 'plano', v: paraleloADistancia(plano, dist, lado(n.sentido, 'paralelo_a_distancia(sentido:)')) };
      return eleccion(e, 'paralelo_a_distancia()', [1, -1].map((l) => ({ k: 'plano', v: paraleloADistancia(plano, dist, l as 1 | -1) })));
    },
  },
  /* Una LISTA con los dos lados, como abatido_planta: cualquiera vale, y
     `uno()` escoge uno. Para que el alumno pueda abatir hacia cualquiera de
     los dos lados y el resto de la figura caiga con él, el primer punto se
     abate con `abatido_a_elegir` (una elección) y los demás con
     `abatido_junto`, que la hereda. */
  abatido: {
    posicion: 3,
    hace: ([q, charnela, pl]) => {
      const [a, b] = abatido(comoP3(q, 'abatido()'), rectaDe(charnela, 'abatido()'), comoPlano(pl, 'abatido()'));
      return { k: 'lista', v: [{ k: 'p3', v: a }, { k: 'p3', v: b }] };
    },
  },
  gira: {
    posicion: 2,
    nombres: { angulo: 'obligatorio', sentido: 'opcional' },
    hace: ([q, eje], n, e) => {
      const [P, r, ang] = [comoP3(q, 'gira()'), rectaDe(eje, 'gira()'), comoNum(n.angulo, 'gira(angulo:)')];
      const [a, b] = [gira(P, r, ang), gira(P, r, -ang)];
      if (n.sentido) {
        /* el que queda con más cota (ascendente) o con menos (descendente) */
        const sube = lado(n.sentido, 'gira(sentido:)') === 1;
        if (Math.abs(a.z - b.z) < 1e-9) throw new Error('gira(): los dos giros dejan el punto a la misma cota; el sentido no decide');
        return { k: 'p3', v: (a.z > b.z) === sube ? a : b };
      }
      return eleccion(e, 'gira()', [{ k: 'p3', v: a }, { k: 'p3', v: b }]);
    },
  },
  cuadrado_por_diagonal: {
    posicion: 3,
    hace: ([pl, a, b]) => ({
      k: 'lista',
      v: cuadradoPorDiagonal(comoPlano(pl, 'cuadrado_por_diagonal()'), comoP3(a, 'cuadrado_por_diagonal()'), comoP3(b, 'cuadrado_por_diagonal()')).map(
        (v): Valor => ({ k: 'p3', v }),
      ),
    }),
  },
  /* El polígono regular de un plano, dados su centro y un vértice: una lista
     de vértices, empezando por el dado. */
  poligono_regular: {
    posicion: 3,
    nombres: { lados: 'obligatorio' },
    hace: ([pl, c, v], n) => ({
      k: 'lista',
      v: poligonoRegular(
        comoPlano(pl, 'poligono_regular()'),
        comoP3(c, 'poligono_regular() (el centro)'),
        comoP3(v, 'poligono_regular() (un vértice)'),
        comoNum(n.lados, 'poligono_regular(lados:)'),
      ).map((p): Valor => ({ k: 'p3', v: p })),
    }),
  },
  apice: {
    posicion: 1,
    nombres: { altura: 'obligatorio', sentido: 'opcional' },
    hace: ([base], n, e) => {
      const vs = espera(base, 'lista', 'apice()').v.map((v) => comoP3(v, 'apice() (un vértice de la base)'));
      const h = comoNum(n.altura, 'apice(altura:)');
      if (n.sentido) return { k: 'p3', v: apice(vs, h, lado(n.sentido, 'apice(sentido:)')) };
      return eleccion(e, 'apice()', [1, -1].map((l) => ({ k: 'p3', v: apice(vs, h, l as 1 | -1) })));
    },
  },
  /* El extremo común de tres varillas fijas en tres puntos, con sus
     longitudes (SD23): `punto_a_tres_distancias(A, mm(40), B, mm(70), C,
     mm(60), sentido: descendente)`. Sin sentido, las dos soluciones, una a
     cada lado del plano de los tres puntos, son una elección; si coinciden,
     es un punto. */
  punto_a_tres_distancias: {
    posicion: 6,
    nombres: { sentido: 'opcional' },
    hace: ([A, dA, B, dB, C, dC], n, e) => {
      const q = 'punto_a_tres_distancias()';
      const una = (l: 1 | -1) => ({
        k: 'p3' as const,
        v: puntoATresDistancias(
          comoP3(A, `${q} (el primer punto)`),
          comoNum(dA, `${q} (la distancia al primero)`),
          comoP3(B, `${q} (el segundo punto)`),
          comoNum(dB, `${q} (la distancia al segundo)`),
          comoP3(C, `${q} (el tercer punto)`),
          comoNum(dC, `${q} (la distancia al tercero)`),
          l,
        ),
      });
      if (n.sentido) return una(lado(n.sentido, 'punto_a_tres_distancias(sentido:)'));
      const [sube, baja] = [una(1), una(-1)];
      if (vmDe(sube.v, baja.v) <= TOL_VERTICAL) return sube;
      return eleccion(e, q, [sube, baja]);
    },
  },
  /* ── la construcción paso a paso: lo que se traza con el compás ── */
  /* Un arco de compás con centro en un punto de la lámina, que pasa por
     `por` (el radio) y va de la dirección de `desde` a la de `hasta`, por el
     camino corto. Sin `desde` ni `hasta`, la vuelta entera. */
  arco: {
    posicion: 1,
    nombres: { por: 'obligatorio', desde: 'opcional', hasta: 'opcional' },
    hace: ([c], n) => {
      const centro = espera(c, 'p2', 'arco()').v;
      const por = espera(n.por, 'p2', 'arco(por:)').v;
      const r = Math.hypot(por[0] - centro[0], por[1] - centro[1]);
      if (r < 0.01) throw new Error('arco(): el punto por el que pasa es el centro; el radio es cero');
      const angulo = (q: P2) => (Math.atan2(q[1] - centro[1], q[0] - centro[0]) * 180) / Math.PI;
      if (!n.desde !== !n.hasta) throw new Error('arco() lleva `desde` y `hasta`, o ninguno de los dos');
      const desde = n.desde ? angulo(espera(n.desde, 'p2', 'arco(desde:)').v) : angulo(por);
      const hasta = n.hasta ? angulo(espera(n.hasta, 'p2', 'arco(hasta:)').v) : desde + 360;
      return { k: 'arco2', c: centro, r, desde, hasta };
    },
  },
  /* Los cortes, en la planta, de una recta del espacio con unos segmentos:
     el primero hacia cada lado de su punto. Es lo que se hace al trazar la
     horizontal de un plano por un punto y llevarla hasta sus bordes. */
  cortes: {
    posicion: 2,
    hace: ([recta, lista]) => {
      const r = rectaDe(recta, 'cortes()');
      const segs = espera(lista, 'lista', 'cortes()').v.map((x) => espera(x, 'seg3', 'cortes() en su lista'));
      const planta = segs.map((g) => [proyPlanta(g.a), proyPlanta(g.b)] as const);
      const origen = proyPlanta(r.p);
      const d: P2 = [r.d.x, r.d.y];
      if (Math.hypot(d[0], d[1]) < 1e-9) throw new Error('cortes(): la recta es vertical; en la planta es un punto');
      return {
        k: 'lista',
        v: [d, [-d[0], -d[1]] as P2].map((dir) => {
          const golpe = corteConSegmentos(origen, dir, planta);
          if (!golpe) throw new Error('cortes(): hacia uno de los lados la recta no corta ninguno de los segmentos');
          const g = segs[golpe.indice];
          return { k: 'p3', v: puntoEnSegmento(g.a, g.b, golpe.s) } as Valor;
        }),
      };
    },
  },
  /* ── el lote 1 de la fase K: lo que pidieron los Ejercicios 53 y 55 de la
     colección, y el cambio de plano, que piden el tema 3 y los Ejercicios 17
     a 21 ── */
  /* Los dos abatidos de un punto como una ELECCIÓN, no como una lista: así el
     alumno abate hacia el lado que quiera y, con `abatido_junto`, toda la
     figura cae con él. */
  abatido_a_elegir: {
    posicion: 3,
    hace: ([q, charnela, pl], _n, e) => {
      const [a, b] = abatido(comoP3(q, 'abatido_a_elegir()'), rectaDe(charnela, 'abatido_a_elegir()'), comoPlano(pl, 'abatido_a_elegir()'));
      return eleccion(e, 'abatido_a_elegir()', [{ k: 'p3', v: a }, { k: 'p3', v: b }]);
    },
  },
  /* El cambio de plano del diédrico directo: la proyección de un punto en la
     vista auxiliar, con la línea nueva y la referencia que cae en ella fijadas
     por el ejercicio. Con `luego:`, el segundo cambio, del tipo contrario, y
     con `ref2:`, su referencia, si no es la del primero. */
  cambio_plano_vertical: {
    posicion: 2,
    nombres: { ref: 'obligatorio', luego: 'opcional', ref2: 'opcional' },
    hace: ([q, l], n) => ({
      k: 'p2',
      v: cambioPlano(
        comoP3(q, 'cambio_plano_vertical()'),
        'vertical',
        comoRecta2(l, 'cambio_plano_vertical()'),
        comoP3(n.ref, 'cambio_plano_vertical(ref:)'),
        n.luego ? comoRecta2(n.luego, 'cambio_plano_vertical(luego:)') : undefined,
        n.ref2 ? comoP3(n.ref2, 'cambio_plano_vertical(ref2:)') : undefined,
      ),
    }),
  },
  cambio_plano_horizontal: {
    posicion: 2,
    nombres: { ref: 'obligatorio', luego: 'opcional', ref2: 'opcional' },
    hace: ([q, l], n) => ({
      k: 'p2',
      v: cambioPlano(
        comoP3(q, 'cambio_plano_horizontal()'),
        'horizontal',
        comoRecta2(l, 'cambio_plano_horizontal()'),
        comoP3(n.ref, 'cambio_plano_horizontal(ref:)'),
        n.luego ? comoRecta2(n.luego, 'cambio_plano_horizontal(luego:)') : undefined,
        n.ref2 ? comoP3(n.ref2, 'cambio_plano_horizontal(ref2:)') : undefined,
      ),
    }),
  },
  /* El elemento i de una lista, desde 1: el `rama()` de las listas. Así un
     `ejemplo` puede nombrar uno de los dos abatidos de `abatido_planta` sin
     escribirlo en cifras. */
  uno: {
    posicion: 2,
    hace: ([l, i]) => {
      const lista = espera(l, 'lista', 'uno()').v;
      const n = comoNum(i, 'uno()');
      if (!Number.isInteger(n) || n < 1 || n > lista.length) {
        throw new Error(`uno(): la lista tiene ${lista.length} elementos y se ha pedido el ${n}`);
      }
      const v = lista[n - 1];
      if (v.k === 'ramas') throw new Error('uno(): ese elemento es una elección; se nombra por su línea');
      return v;
    },
  },
  /* Un segmento de la lámina entre dos puntos de la lámina, para el `trazado`
     de una solución: el triángulo abatido de la 55·1, por ejemplo. */
  segmento2: {
    posicion: 2,
    hace: ([a, b]) => {
      const [p, q] = [espera(a, 'p2', 'segmento2()').v, espera(b, 'p2', 'segmento2()').v];
      if (Math.hypot(q[0] - p[0], q[1] - p[1]) < 0.01) throw new Error('segmento2(): los dos puntos coinciden; tiene longitud cero');
      return { k: 'seg2', a: p, b: q };
    },
  },
  /* El cruce aparente de dos rectas de la lámina: donde se cortan en el
     papel, aunque en el espacio se crucen sin tocarse. Es donde una arista
     puede cambiar de vista a oculta (el Taller con segmentos, 7 de octubre de
     2026). Las rectas se toman enteras, prolongadas. */
  cruce_aparente: {
    posicion: 2,
    hace: ([r, s]) => {
      const a = comoRecta2(r, 'cruce_aparente()');
      const b = comoRecta2(s, 'cruce_aparente()');
      const det = a.d[0] * b.d[1] - a.d[1] * b.d[0];
      const escala = Math.hypot(...a.d) * Math.hypot(...b.d);
      if (escala < 1e-12 || Math.abs(det) < 1e-9 * escala) throw new Error('cruce_aparente(): las dos rectas son paralelas, y no se cruzan');
      const t = ((b.p[0] - a.p[0]) * b.d[1] - (b.p[1] - a.p[1]) * b.d[0]) / det;
      return { k: 'p2', v: [a.p[0] + t * a.d[0], a.p[1] + t * a.d[1]] };
    },
  },
  /* P abatido con el mismo giro que llevó `de` a `con`: toda una figura
     abatida cae junta. Si `con` es una elección, el resultado la hereda rama
     a rama, y la figura entera es una sola elección. */
  abatido_junto: {
    posicion: 3,
    nombres: { con: 'obligatorio', de: 'obligatorio' },
    hace: ([q, charnela, pl], n) => ({
      k: 'p3',
      v: abatidoJunto(
        comoP3(q, 'abatido_junto()'),
        rectaDe(charnela, 'abatido_junto()'),
        comoPlano(pl, 'abatido_junto()'),
        comoP3(n.con, 'abatido_junto(con:)'),
        comoP3(n.de, 'abatido_junto(de:)'),
      ),
    }),
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
