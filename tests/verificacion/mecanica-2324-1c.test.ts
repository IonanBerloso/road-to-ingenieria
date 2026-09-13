/**
 * El examen de enero de 2024 del bloque 1 —Estática— de Mecánica Aplicada.
 * Veinticinco respuestas numéricas en ocho resoluciones: cuatro cuestiones de
 * teoría y tres ejercicios, uno de ellos partido en dos piezas.
 *
 * Este cuadernillo **no publica resolución** —lo dice su `examen.yaml`—, así
 * que aquí la pregunta es la fuerte: «¿es correcto el resultado?», no «¿llega
 * el camino hasta él?».
 *
 * Dos convenios mandan sobre casi todo lo de abajo, y son los del curso:
 *
 *  · **Vigas** (tema 6): x a lo largo de la pieza, y hacia ABAJO, q_y positiva
 *    hacia abajo, dV/dx = −q_y, dM/dx = V, y M positivo cuando tracciona la
 *    fibra INFERIOR —que es lo mismo que decir que comprime la superior, que
 *    es como lo pregunta el ejercicio 7—. Es el de `src/lib/viga.ts`, que se
 *    importa aquí porque el apartado a) del ejercicio 7 **es** exactamente esa
 *    cuenta.
 *  · **Catenaria** (tema 5): c = T0/w, la y se mide desde la DIRECTRIZ —c por
 *    debajo del vértice—, y = c·cosh(x/c), s = c·senh(x/c), T = w·y, y de ahí
 *    y² = c² + s², que es la que resuelve el ejercicio 5b sin ángulos.
 *
 * Tres ejercicios —el 2, el 3 y el 4— piden la deducción de una fórmula y
 * traen un paso numérico «de comprobación» con datos que **no son del
 * enunciado** sino de la propia pregunta del paso; así lo dice cada una, y así
 * se transcriben aquí, marcados.
 *
 * Dos sitios donde recalcular tiene que **elegir** en vez de solo operar, que
 * es donde este fichero gana lo que cuesta:
 *
 *  1. En el ejercicio 6 el equilibrio de la barra deja dos soluciones, una por
 *     cada sentido del rozamiento en A. La ecuación no desempata: el que
 *     desempata es que el momento P salga **en el sentido que dibuja la
 *     figura**. El test plantea las dos ramas y comprueba que sobrevive una.
 *  2. En el ejercicio 5b la tensión en D se calcula por dos caminos que no se
 *     parecen —T = q·y con y desde la directriz, y el módulo de sus dos
 *     componentes con la horizontal constante e igual a T_O— y se exige que
 *     coincidan antes de comparar con el corpus.
 */
import { describe, it, expect } from 'vitest';
import { convocatoria } from './corpus';
import { altura, longitud, parametro, tension } from '../../src/lib/catenaria';
import { extremos, flector, reacciones, type Viga } from '../../src/lib/viga';

const cuadra = convocatoria('mecanica-aplicada', '2023-2024-1c');

const grados = (a: number) => (a * Math.PI) / 180;

/* ── Utilidades de vectores, para el ejercicio 1 ───────────────────────── */
type V3 = [number, number, number];
const suma = (...vs: V3[]): V3 =>
  vs.reduce((a, v) => [a[0] + v[0], a[1] + v[1], a[2] + v[2]] as V3, [0, 0, 0]);
const escala = (k: number, v: V3): V3 => [k * v[0], k * v[1], k * v[2]];
const punto = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cruz = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const modulo = (v: V3) => Math.sqrt(punto(v, v));

/** Momento en el plano de una fuerza (Fx, Fy) aplicada en (x, y): antihorario positivo. */
const momentoZ = (x: number, y: number, Fx: number, Fy: number) => x * Fy - y * Fx;

describe('teoría 1 · el momento en el origen sabiendo por dónde pasa el eje central', () => {
  const id = 'exma2324-1c-1-el-momento-en-el-origen';

  /* Datos del enunciado. */
  const v1: V3 = [3, -2, 0];
  const v2: V3 = [-1, -1, -1];
  const v3: V3 = [2, 3, -2];
  const W = 25; // invariante escalar
  const P: V3 = [3, 2, 5]; // un punto del eje central
  const O: V3 = [0, 0, 0];

  const R = suma(v1, v2, v3);

  it('el momento mínimo mide 5, que es la proyección W/R', () => {
    /* El eje central es el lugar de momento mínimo, y ese momento es paralelo
       a la resultante: su módulo es la proyección W/|R|. */
    cuadra(id, 'El módulo del momento mínimo', W / modulo(R));
  });

  it('y en el origen el momento vale (−2, 29, −11)', () => {
    const Mmin = escala(W / punto(R, R), R); // el momento en P: mínimo, paralelo a R
    const OP: V3 = [P[0] - O[0], P[1] - O[1], P[2] - O[2]];
    const MO = suma(Mmin, cruz(OP, R)); // campo de momentos: M_O = M_P + OP × R

    /* La comprobación que audita el traslado sin repetirlo: el invariante
       escalar es invariante, así que M_O·R tiene que seguir valiendo 25.
       Si el producto vectorial se hubiera escrito al revés, esto se cae. */
    expect(punto(MO, R)).toBeCloseTo(W, 9);

    cuadra.vector(id, 'El momento en el origen', MO);
  });
});

describe('teoría 2 · la longitud y la tensión de la catenaria', () => {
  const id = 'exma2324-1c-2-la-longitud-y-la-tension-de-la-catenaria';
  /* La cuestión es una deducción; los dos pasos numéricos comprueban las
     expresiones en x = c, en unidades de c y de wc. */
  const c = 1;
  const w = 1;
  const x = c;

  it('a una abscisa c del vértice hay 1,1752·c de cable', () =>
    cuadra(id, 'La longitud a una distancia c del vértice', longitud(c, x) / c));

  it('y la tensión allí vale 1,5431·wc', () => {
    /* T = w·y, con y desde la directriz. Y la identidad del tema, y² = c² + s²,
       tiene que darla también: son las dos formas de escribir lo mismo. */
    const porIdentidad = w * Math.hypot(c, longitud(c, x));
    expect(tension(c, x, w)).toBeCloseTo(porIdentidad, 12);
    cuadra(id, 'La tensión en ese mismo punto', tension(c, x, w) / (w * c));
  });
});

describe('teoría 3 · el disco que no debe rodar cuesta abajo', () => {
  const id = 'exma2324-1c-3-el-disco-que-no-debe-rodar-cuesta-abajo';
  /* Los números NO son del enunciado: los da la propia pregunta del paso, que
     pide comprobar con ellos la expresión deducida. */
  const beta = grados(30);
  const muR = 0.05; // en unidades de R
  const R = 1;
  const Mg = 1;

  /* Resistencia a la rodadura: la normal no pasa por el punto de contacto
     teórico, sino desplazada μ_r en el sentido del movimiento inminente —cuesta
     abajo—. Ejes: x hacia arriba del plano, y normal saliente; centro en (0, R),
     contacto en (−μ_r, 0). */
  const N = Mg * Math.cos(beta);
  /* Momentos respecto del centro: la normal, aplicada en (−μ_r, −R) respecto de
     él, y el rozamiento f, horizontal en el mismo punto. F y el peso pasan por
     el centro y no dan momento. */
  const f = (muR * R * N) / R ** 2; // de −μ_r·N + R·f = 0
  const Fmin = Mg * Math.sin(beta) - f; // equilibrio a lo largo del plano

  it('hace falta 0,4567·Mg para que no ruede', () => {
    /* Sin rodadura la fuerza sería Mg·senβ = 0,5·Mg: la resistencia a la
       rodadura ayuda, así que el resultado tiene que quedar por debajo. */
    expect(Fmin).toBeLessThan(Mg * Math.sin(beta));
    cuadra(id, 'La fuerza mínima, con números', Fmin / Mg);
  });

  it('y el rozamiento mínimo es 0,05, que es μ_r/R y no depende de β', () => {
    const muS = f / N;
    /* Que no dependa de la pendiente no es casualidad: N se cancela. Se
       comprueba rehaciéndolo con otro ángulo cualquiera. */
    const otro = grados(50);
    const Notro = Mg * Math.cos(otro);
    expect((muR * R * Notro) / R ** 2 / Notro).toBeCloseTo(muS, 12);
    cuadra(id, 'El rozamiento mínimo', muS);
  });
});

describe('teoría 4 · la torsión en una sección circular', () => {
  const id = 'exma2324-1c-4-la-torsion-en-una-seccion-circular';
  /* Tampoco son del enunciado: la pregunta los pone para comprobar la fórmula. */
  const D = 0.040; // m
  const Mt = 500; // N·m

  const Ip = (Math.PI * D ** 4) / 32; // momento polar de una sección maciza
  const tauMax = (Mt * (D / 2)) / Ip;

  it('la tensión máxima del eje de 40 mm es 39,79 MPa', () =>
    cuadra.magnitud(id, 'La tensión máxima de un eje concreto', tauMax / 1e6, 'MPa'));

  it('y a mitad de radio se queda en la mitad, porque τ va con r', () => {
    const tauMitad = (Mt * (D / 4)) / Ip;
    cuadra(id, 'A mitad de radio', tauMitad / tauMax);
  });
});

/* ── Ejercicio 1 del cuadernillo (n 5): la barra, el resorte y el cable ──── */

/* Geometría y datos comunes a las dos piezas, en unidades Mg = 1 y L = 1. */
const alpha = grados(36.87);
const k = 5 / 2; // Mg/L
const L0 = 0;
const qCable = 2 / 3; // Mg/L, peso por unidad de longitud de cable
const T0 = 4 / 3; // Mg, fuerza mínima del cable

const A5: [number, number] = [0, 0];
const C5: [number, number] = [Math.cos(alpha), Math.sin(alpha)];
const E5: [number, number] = [0, Math.sin(alpha)]; // en la vertical de A y en la horizontal de C
const B5: [number, number] = [0.75 * Math.cos(alpha), 0.75 * Math.sin(alpha)];

/* El resorte EC es horizontal —E y C comparten horizontal— y de longitud
   natural nula, así que su fuerza es k por su longitud entera. */
const largoResorte = Math.hypot(C5[0] - E5[0], C5[1] - E5[1]);
const Fresorte = k * (largoResorte - L0);

describe('ejercicio 1a (n 5) · la barra, el resorte y el cable', () => {
  const id = 'exma2324-1c-5-la-barra-el-resorte-y-el-cable';

  it('el resorte tira con 2·Mg', () => {
    /* El enunciado da α con dos decimales porque es el 3-4-5: cosα = 0,8. */
    expect(Math.cos(alpha)).toBeCloseTo(0.8, 4);
    cuadra(id, 'La fuerza del resorte', Fresorte);
  });

  it('y el cable tira de B hacia abajo con Mg/3', () => {
    /* Momentos respecto de A, con las tres fuerzas que no pasan por él: el
       peso en el centro de la barra, el resorte en C —horizontal, hacia la
       pared— y la del cable en B. De esta última se conoce la componente
       horizontal: en una catenaria la tensión horizontal es constante e igual
       a la mínima, T_O, y tira de B hacia D, o sea hacia la derecha. */
    const Mpeso = momentoZ(0.5 * Math.cos(alpha), 0.5 * Math.sin(alpha), 0, -1);
    const Mresorte = momentoZ(C5[0], C5[1], -Fresorte, 0);
    const MporVb = momentoZ(B5[0], B5[1], 0, 1); // coeficiente de V_B
    const MporHb = momentoZ(B5[0], B5[1], T0, 0);

    const Vb = -(Mpeso + Mresorte + MporHb) / MporVb;

    /* Sale negativa: el cable tira de B hacia abajo, que es lo que tiene que
       hacer un cable que cuelga. El paso pide el módulo. */
    expect(Vb).toBeLessThan(0);
    cuadra(id, 'La componente vertical en B', Math.abs(Vb));
  });
});

describe('ejercicio 1b (n 5) · la fuerza del cable en su amarre D', () => {
  const id = 'exma2324-1c-5-la-fuerza-del-cable-en-d';

  const c = parametro(T0, qCable);

  it('el parámetro de la catenaria vale 2·L', () =>
    cuadra(id, 'El parámetro de la catenaria', c));

  /* La vertical en B se rehace aquí igual que en el apartado a): esta pieza es
     otra resolución y no puede depender de que la otra se haya ejecutado. */
  const Vb = Math.abs(
    -(momentoZ(0.5 * Math.cos(alpha), 0.5 * Math.sin(alpha), 0, -1) +
      momentoZ(C5[0], C5[1], -Fresorte, 0) +
      momentoZ(B5[0], B5[1], T0, 0)) / momentoZ(B5[0], B5[1], 0, 1),
  );
  const sB = Vb / qCable;

  it('y desde B al vértice hay medio L de cable', () =>
    cuadra(id, 'La longitud de cable hasta el punto más bajo', sB));

  it('en D el cable tira con 1,4744·Mg', () => {
    /* y² = c² + s², con y desde la directriz. */
    const yB = Math.hypot(c, sB);

    /* Y D está en la horizontal de C, o sea 0,15·L por encima de B: esa
       diferencia de cotas se saca de la geometría del enunciado, no se copia. */
    const desnivel = C5[1] - B5[1];
    expect(desnivel).toBeCloseTo(0.15, 4);
    const yD = yB + desnivel;

    const porPeso = qCable * yD; // T = w·y

    /* Segundo camino, que no se parece al primero: la horizontal de la tensión
       es constante y vale T_O, y la vertical es el peso del cable que cuelga
       desde el vértice, q·s_D, con s_D otra vez de y² = c² + s². */
    const sD = Math.sqrt(yD * yD - c * c);
    const porComponentes = Math.hypot(T0, qCable * sD);
    expect(porComponentes).toBeCloseTo(porPeso, 10);

    /* Y un tercero, con el módulo del tema: y y s puestos en función de x. */
    const xD = c * Math.asinh(sD / c);
    expect(altura(c, xD)).toBeCloseTo(yD, 10);

    cuadra(id, 'La fuerza en D', porPeso);
  });
});

describe('ejercicio 2 (n 6) · la barra articulada al disco, a punto de deslizar en A', () => {
  const id = 'exma2324-1c-6-la-barra-apoyada-en-el-disco';

  /* Datos del enunciado, en unidades Mg = 1 y R = 1. */
  const R = 1;
  const Mg = 1;
  const fA = Math.sqrt(3) / 2;
  const theta = grados(30); // la barra con el suelo

  /* A en el origen; B, extremo de la barra, es el centro del disco. */
  const B: [number, number] = [2 * R * Math.cos(theta), 2 * R * Math.sin(theta)];

  it('la geometría se cierra: el extremo de la barra cae justo en el centro del disco', () => {
    /* Barra de 2R a 30° sube exactamente R, que es la altura del centro de un
       disco de radio R apoyado en el suelo. El enunciado se comprueba a sí
       mismo, y si el ángulo fuera otro el sistema no encajaría. */
    expect(B[1]).toBeCloseTo(R, 12);
  });

  /* Equilibrio de la barra, momentos respecto de B. Incógnitas: N_A y el
     rozamiento en A, ligados por |F_A| = f·N_A al ser inminente el
     deslizamiento — pero el signo del rozamiento no lo fija esa ecuación. Se
     plantean las dos ramas. */
  function rama(signo: 1 | -1) {
    /* momentoZ respecto de B con posiciones relativas a B: A y el centro de la
       barra. F_A = signo·f·N_A, así que el coeficiente de N_A agrupa los dos. */
    const rA: [number, number] = [-B[0], -B[1]];
    const rG: [number, number] = [-B[0] / 2, -B[1] / 2];
    const coefNA = momentoZ(rA[0], rA[1], signo * fA, 1);
    const Mpeso = momentoZ(rG[0], rG[1], 0, -Mg);
    const NA = -Mpeso / coefNA;
    const FA = signo * fA * NA;
    /* El resto sale del conjunto y del disco por separado:
       · verticales del conjunto:  N_A + N_C = 2Mg
       · horizontales del conjunto: F_A + F_C = 0
       · momentos del disco en su centro: R·F_C = P, con P horario positivo. */
    const NC = 2 * Mg - NA;
    const FC = -FA;
    const P = R * FC;
    return { NA, FA, NC, FC, P };
  }

  const ramas = [rama(1), rama(-1)];
  /* El desempate: la figura dibuja P en sentido HORARIO, y con el criterio de
     arriba eso es P > 0. Y las dos normales tienen que ser de compresión. */
  const buenas = ramas.filter((r) => r.P > 0 && r.NA > 0 && r.NC > 0);

  it('solo una de las dos ramas da el momento P en el sentido que dibuja la figura', () => {
    expect(
      buenas.length,
      `sobreviven ${buenas.length} ramas: ${ramas.map((r) => `P=${r.P.toFixed(4)}`).join(' · ')}`,
    ).toBe(1);
  });

  const s = buenas[0];

  it('la normal en A vale Mg/3', () => cuadra(id, 'La normal en A', s.NA));

  it('y el rozamiento en A, √3/6·Mg, que es todo el que hay', () => {
    expect(Math.abs(s.FA)).toBeCloseTo(fA * s.NA, 12); // deslizamiento inminente
    cuadra(id, 'El rozamiento en A', Math.abs(s.FA));
  });

  it('el momento P vale 0,2887·MgR', () => cuadra(id, 'El momento P', s.P));

  it('la normal en C carga los cinco tercios que le deja A', () => {
    expect(s.NA + s.NC).toBeCloseTo(2 * Mg, 12); // el peso total, y nada más
    cuadra(id, 'La normal en C', s.NC);
  });

  it('y el rozamiento en C es el de A cambiado de signo', () => {
    expect(s.FA + s.FC).toBeCloseTo(0, 12); // no hay más horizontales fuera
    cuadra(id, 'El rozamiento en C', Math.abs(s.FC));
  });
});

describe('ejercicio 3 (n 7) · la viga con dos voladizos y la sección en T', () => {
  const id = 'exma2324-1c-7-la-viga-con-dos-voladizos-y-la-seccion-en-t';

  /* a) Datos del enunciado, en unidades q0 = 1 y L = 1: viga de 4L con carga
     uniforme en toda su longitud, articulación en B a L del extremo A y apoyo
     móvil en C, a 2L de B; queda un voladizo de L a cada lado. */
  const q0 = 1;
  const L = 1;
  const viga: Viga = {
    L: 4 * L,
    xA: 1 * L,
    xB: 3 * L,
    cargas: [{ tipo: 'repartida', x1: 0, x2: 4 * L, q1: q0, q2: q0 }],
  };

  it('la reacción en B es 2·q₀L, la mitad de la carga total', () => {
    const { RA, RB } = reacciones(viga);
    expect(RA + RB).toBeCloseTo(q0 * 4 * L, 12); // toda la carga y nada más
    expect(RA).toBeCloseTo(RB, 12); // la viga es simétrica
    cuadra(id, 'La reacción en B', RA / (q0 * L));
  });

  it('el flector en el apoyo vale −0,5·q₀L², que es el del voladizo', () =>
    cuadra(id, 'El flector en el apoyo', flector(viga, viga.xA) / (q0 * L * L)));

  it('y en el centro del vano se anula: los voladizos se comen el flector positivo', () =>
    cuadra(id, 'El flector en el centro del vano', flector(viga, 2 * L) / (q0 * L * L)));

  /* b) La sección en T invertida: ala inferior de 5e × 2e y alma de e × 3e
     encima. Datos de la figura del enunciado. */
  const areas = [
    { A: 5 * 2, y: 2 / 2, I: (5 * 2 ** 3) / 12 }, // ala, medida desde la base
    { A: 1 * 3, y: 2 + 3 / 2, I: (1 * 3 ** 3) / 12 }, // alma
  ];
  const Atot = areas.reduce((s, p) => s + p.A, 0);
  const yG = areas.reduce((s, p) => s + p.A * p.y, 0) / Atot;
  const Ineutro = areas.reduce((s, p) => s + p.I + p.A * (p.y - yG) ** 2, 0);
  const canto = 5; // 2e del ala más 3e del alma

  it('el centro de gravedad queda a 1,5769·e de la base', () => {
    expect(Atot).toBeCloseTo(13, 12); // 13·e², el que usa el peso propio
    cuadra(id, 'El centro de gravedad de la T', yG);
  });

  it('y el momento de inercia respecto del eje neutro es 20,006·e⁴', () =>
    cuadra(id, 'El momento de inercia', Ineutro));

  /* b1) y b2). Peso específico 18000 N/m³, L = 2 m, σ₀ = 200 MPa. */
  const PESO_ESPECIFICO = 18000; // N/m³
  const Lm = 2; // m
  const SIGMA0 = 200e6; // Pa

  /* El flector de cálculo no se supone: se busca el extremo del diagrama. */
  const { Mabs } = extremos(viga);
  /* La fibra que agota es la más lejana del eje neutro; en una T invertida es
     la punta del alma, arriba. Con el flector negativo —tracciona la fibra
     superior— esa punta trabaja a TRACCIÓN, que es lo que pide decir b1). */
  const distancia = Math.max(yG, canto - yG);

  /** Tensión máxima en Pa para un espesor e en metros. */
  function sigmaMax(e: number): number {
    const q = PESO_ESPECIFICO * Atot * e * e; // N/m: peso específico por el área
    const M = Math.abs(Mabs.M) * q * Lm * Lm; // el coeficiente sale en q₀L²
    return (M * (distancia * e)) / (Ineutro * e ** 4);
  }

  it('la fibra que agota es la de arriba, y trabaja a tracción', () => {
    expect(Mabs.M).toBeLessThan(0); // negativo: tracciona la fibra superior
    expect(canto - yG).toBeGreaterThan(yG); // y esa es además la más lejana
  });

  it('con e = 1 mm la tensión máxima sería 80,07 MPa', () =>
    cuadra.magnitud(id, 'La tensión máxima para un e concreto', sigmaMax(0.001) / 1e6, 'MPa'));

  it('y el espesor que agota los 200 MPa es 0,4004 mm', () => {
    /* σ va como 1/e —el flector con e², la distancia con e y la inercia con
       e⁴—, así que basta escalar; pero se comprueba que va como 1/e en vez de
       darlo por supuesto. */
    expect(sigmaMax(0.002)).toBeCloseTo(sigmaMax(0.001) / 2, 6);
    const e = (0.001 * sigmaMax(0.001)) / SIGMA0;
    expect(sigmaMax(e)).toBeCloseTo(SIGMA0, 0); // el espesor agota, ni más ni menos
    cuadra.magnitud(id, 'La dimensión e', e * 1000, 'mm');
  });
});
