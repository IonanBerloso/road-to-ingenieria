/**
 * La ordinaria de junio de 2025 de Mecánica Aplicada, bloque 1 (Estática).
 * Veintitrés respuestas en ocho resoluciones: cuatro cuestiones de teoría y
 * los dos ejercicios, cada uno partido en dos piezas.
 *
 * El examen **no publica resolución ni resultados**, así que aquí la pregunta
 * es la de Química y no la de Fluidos: «¿es correcto el resultado?». Todo lo
 * que se compara sale de los datos del enunciado —incluida la geometría que
 * el enunciado solo da en la figura, que en este corpus es parte del
 * enunciado— y de las convenciones del curso, escritas en `src/lib/viga.ts` y
 * `src/lib/catenaria.ts`.
 *
 * Tres cosas de este examen merecen decirse antes:
 *
 * 1. **La repartida del ejercicio 2 solo llega hasta C, media viga.** Es el
 *    dato que decide el examen entero: suponerla en toda la longitud da
 *    R_A = 8Mg y un flector máximo distinto, y es el error que ya se cazó una
 *    vez. Aquí se toma de la figura del enunciado, donde la fila de flechas
 *    empieza en A y termina en C.
 *
 * 2. **La catenaria tiene la directriz en la horizontal de A**, y eso no es
 *    un dato del enunciado sino una consecuencia suya: A es el extremo libre
 *    del cable, allí la tensión es nula, y con T = w·y la tensión nula obliga
 *    a y = 0. La polea transmite la tensión, así que la misma directriz vale
 *    para el tramo curvo. De ahí sale que C, esquina superior de un bloque de
 *    lado L apoyado en esa horizontal, está a y = L.
 *
 * 3. **Casi nada lleva unidad**: el examen pide todo en unidades de Mg, L, F o
 *    b, así que aquí manda `cuadra` y no `cuadra.magnitud`. Lo que sí hace
 *    falta es decir en qué unidades se ha calculado cada cosa, y por eso los
 *    bloques trabajan con Mg = L = 1 y lo dicen.
 */
import { describe, expect, it } from 'vitest';
import { convocatoria } from './corpus';
import { escalar, productoVectorial, resuelve } from './lineal';
import { integra, raiz } from './numerico';
import { altura, angulo, longitud } from '../../src/lib/catenaria';
import { extremos, reacciones, type Viga } from '../../src/lib/viga';

const cuadra = convocatoria('mecanica-aplicada', '2024-2025-ord');

const rad = (deg: number) => (deg * Math.PI) / 180;

/**
 * Suma de fuerzas y momento resultante de una lista de fuerzas aplicadas en
 * puntos del plano, con z saliendo del papel y el momento antihorario
 * positivo. Se escribe una vez porque la usan los tres ejercicios de
 * estática, y así el signo del producto vectorial se decide en un solo sitio.
 */
type Fuerza = { p: [number, number]; f: [number, number] };
const suma = (fs: Fuerza[]) =>
  fs.reduce(
    (s, { p, f }) => ({
      Fx: s.Fx + f[0],
      Fy: s.Fy + f[1],
      Mz: s.Mz + p[0] * f[1] - p[1] * f[0],
    }),
    { Fx: 0, Fy: 0, Mz: 0 },
  );

describe('1 · el eje central que pasa por E', () => {
  const id = 'exma2425-ord-1-el-eje-central-que-pasa-por-e';

  /* Datos del enunciado. */
  const MO = [0, 0, 2];
  const OE = [0, 1, 0];

  /* E está en el eje central y el enunciado añade R = M_min, así que en E el
     momento es exactamente R. Trasladar da M_E = M_O + R×OE, y la condición
     M_E = R es un sistema lineal en R: (R×OE) − R = −M_O. No se despeja a
     mano; se monta la matriz evaluando el operador en la base canónica y se
     resuelve. */
  const A = [0, 1, 2].map((fila) =>
    [0, 1, 2].map((col) => {
      const e = [0, 0, 0];
      e[col] = 1;
      return productoVectorial(e, OE)[fila] - e[fila];
    }),
  );
  const R = resuelve(
    A,
    MO.map((m) => -m),
  );

  it('la resultante sale de igualar el momento en E a la propia resultante', () => {
    /* Contraste: si R es de verdad el momento mínimo, M_min = (τ/R²)·R tiene
       que devolver R otra vez. Es el dato del enunciado usado al revés, y si
       el traslado llevara el producto vectorial cambiado de orden no se
       cumpliría. */
    const tau = escalar(R, MO);
    const Mmin = R.map((r) => (tau / escalar(R, R)) * r);
    Mmin.forEach((m, i) => expect(m).toBeCloseTo(R[i], 10));

    cuadra.vector(id, 'La resultante', R);
  });

  it('el invariante escalar es el producto de la resultante por el momento', () => {
    /* Y es invariante: vale lo mismo con M_O que con M_E, que aquí es R. */
    const enO = escalar(R, MO);
    const enE = escalar(R, R);
    expect(enO).toBeCloseTo(enE, 10);
    cuadra(id, 'El invariante escalar', enO);
  });

  it('los parámetros salen de que la resultante es la suma de los dos vectores', () => {
    /* v1 = a(i+j+k), v2 = b·j + c·k  ⇒  R = (a, a+b, a+c). */
    const p = resuelve(
      [
        [1, 0, 0],
        [1, 1, 0],
        [1, 0, 1],
      ],
      R,
    );
    cuadra.vector(id, 'Los tres parámetros', p);
  });
});

describe('2 · la rueda con par motor y resistencia a la rodadura', () => {
  const id = 'exma2425-ord-2-el-rozamiento-que-empuja-la-rueda';

  /* Datos del enunciado, en unidades de F y de R. */
  const F = 1;
  const R = 1;
  const par = 5 * F * R; // horario
  const mur = 0.05 * R;

  /* La resistencia a la rodadura desplaza la normal hacia delante —hacia
     donde avanza la rueda— una distancia μ_r. Ese es todo el modelo: el
     contacto pasa de estar en (0, −R) a estar en (μ_r, −R), y su momento
     respecto del centro se opone al giro. Incógnitas: N, el rozamiento f
     (positivo hacia la derecha) y H. */
  const sistema = [
    [1, 0, 0], // ΣF_y: N = F
    [0, 1, 1], // ΣF_x: f + H = 0
    [mur, R, 0], // ΣM_centro: μ_r·N + R·f = 5FR
  ];
  const [N, f, H] = resuelve(sistema, [F, 0, par]);

  it('el rozamiento vale 4,95 F y empuja hacia delante', () => {
    /* Contraste por un punto distinto: momentos en el punto de contacto, que
       elimina N y f de golpe y deja H solo. Si los dos caminos dan lo mismo,
       el desplazamiento de la normal está puesto donde toca. */
    const contacto: [number, number] = [mur, -R];
    const desdeContacto = suma([
      { p: [-contacto[0], -contacto[1]], f: [H, -F] },
    ]).Mz - par;
    expect(desdeContacto).toBeCloseTo(0, 10);
    expect(N).toBeCloseTo(F, 12);

    cuadra(id, 'La fuerza de rozamiento', f);
  });

  it('y la fuerza horizontal es igual y de sentido contrario', () => cuadra(id, 'La fuerza H', H));
});

describe('3 · la resultante de una carga distribuida', () => {
  const id = 'exma2425-ord-3-la-resultante-de-una-carga-distribuida';

  /* q(x) = q0·x/L en [0, L], con q0 = L = 1. Las dos fórmulas que el apartado
     deduce se comprueban integrando de verdad, no aplicándolas. */
  const q = (x: number) => x;
  const Rq = integra(q, 0, 1);

  it('la resultante es el área del triángulo', () => cuadra(id, 'La resultante de una carga triangular', Rq));

  it('y se coloca en el centro de gravedad del diagrama', () =>
    cuadra(id, 'Dónde se coloca', integra((x) => x * q(x), 0, 1) / Rq));
});

describe('4 · el equilibrio de la rebanada', () => {
  const id = 'exma2425-ord-4-el-equilibrio-de-la-rebanada';

  /* Viga biapoyada de luz L con carga uniforme q, con q = L = 1. */
  const viga: Viga = {
    L: 1,
    xA: 0,
    xB: 1,
    cargas: [{ tipo: 'repartida', x1: 0, x2: 1, q1: 1, q2: 1 }],
  };

  it('el flector máximo de la biapoyada es qL²/8', () => {
    /* El enunciado da el cortante en el apoyo, qL/2: comprobarlo primero es
       comprobar que la viga montada es la que pide la pregunta. */
    expect(reacciones(viga).RA).toBeCloseTo(0.5, 10);

    const { MmaxPos } = extremos(viga, 20000);
    /* Y el máximo cae en el centro, que es donde se anula el cortante. */
    expect(MmaxPos.x).toBeCloseTo(0.5, 3);
    cuadra(id, 'El flector máximo de una viga biapoyada', MmaxPos.M);
  });
});

/* ─────────────────────────────────────────────────────────────────────────
   Ejercicio 1 · el bloque articulado, el muelle y la catenaria sobre la polea.
   Todo en unidades de Mg y de L, así que Mg = L = 1 y w = Mg/L = 1.
   ───────────────────────────────────────────────────────────────────────── */

const w = 1; // w = Mg/L
const thetaC = rad(30); // el cable forma 30° con la horizontal en C

/* La directriz está en la horizontal de A: A es el extremo libre del cable,
   allí la tensión es nula y T = w·y obliga a y = 0. A está a la altura de D,
   que es la horizontal en la que apoya el bloque, así que C —esquina superior
   de un cuadrado de lado L— queda a y = L, y B, dos quintos de L por encima
   de C, a y = 7L/5. */
const yC = 1;
const yB = yC + 2 / 5;

/* El parámetro no se despeja: se busca la c que hace pasar la catenaria por C
   con la pendiente que pide el enunciado. La abscisa de C es la que da esa
   pendiente, x_C = c·argsenh(tg 30°), y la condición que queda es que la
   altura ahí valga L. */
const c = raiz((cc) => altura(cc, cc * Math.asinh(Math.tan(thetaC))) - yC, 1e-3, 50);
const xC = raiz((x) => altura(c, x) - yC, 0, 100);
const xB = raiz((x) => altura(c, x) - yB, 0, 100);

describe('5 · la catenaria que cuelga de la polea', () => {
  const id = 'exma2425-ord-5-la-catenaria-que-cuelga-de-la-polea';

  it('la tensión mínima es el peso de c metros de cable', () => {
    /* Contraste: la pendiente en C tiene que salir a 30° por el otro lado,
       midiéndola sobre la curva ya construida. */
    expect(angulo(c, xC)).toBeCloseTo(30, 8);
    cuadra(id, 'La fuerza mínima del cable', w * c);
  });

  it('y el parámetro es esa tensión dividida por el peso por metro', () => cuadra(id, 'El parámetro de la catenaria', c));

  it('en B el cable se ha empinado hasta 51,8°', () => {
    /* Comprobación de que B está donde dice la figura: su altura sobre la
       directriz son los 2L/5 de más sobre la de C. */
    expect(altura(c, xB) - altura(c, xC)).toBeCloseTo(2 / 5, 10);
    cuadra(id, 'El ángulo en B', angulo(c, xB));
  });

  it('y entre C y B hay 0,6 L de cable', () => {
    const s = longitud(c, xB) - longitud(c, xC);
    /* Segundo camino, el que usa el tema: y² = c² + s², sin ángulos ni
       abscisas. Si la directriz estuviera puesta en otro sitio, los dos
       caminos seguirían coincidiendo entre sí pero no con el examen — por eso
       esto contrasta la fórmula, no la hipótesis. */
    const porIdentidad = Math.sqrt(yB ** 2 - c ** 2) - Math.sqrt(yC ** 2 - c ** 2);
    expect(s).toBeCloseTo(porIdentidad, 8);
    cuadra(id, 'La longitud del tramo BC', s);
  });
});

describe('5 · el bloque articulado en D', () => {
  const id = 'exma2425-ord-5-el-bloque-articulado-en-d';

  /* El bloque, con la esquina inferior izquierda en el origen: C = (0, L),
     E = (L, L), centro en (L/2, L/2) y D = (h, 0) sobre la cara inferior. */
  const T = w * yC; // la tensión del cable en C: T = w·y
  const muelle = (1 / 2) * 1; // k·deformación = (Mg/2L)·L

  const cargas: Fuerza[] = [
    /* El cable tira de C hacia B, arriba y a la izquierda, a 30°. */
    { p: [0, 1], f: [-T * Math.cos(thetaC), T * Math.sin(thetaC)] },
    /* El muelle está estirado y tira de E hacia la pared de la derecha. */
    { p: [1, 1], f: [muelle, 0] },
    /* El peso. */
    { p: [0.5, 0.5], f: [0, -1] },
  ];
  const { Fx, Fy, Mz } = suma(cargas);

  it('la componente horizontal de la reacción compensa cable y muelle', () =>
    cuadra(id, 'La componente horizontal de la reacción', -Fx));

  it('y la vertical, el peso menos lo que tira el cable', () =>
    cuadra(id, 'La componente vertical de la reacción', -Fy));

  it('la articulación tiene que estar a 0,268 L de la esquina', () => {
    /* Momentos en D: ΣM_O − h·ΣF_y = 0, porque trasladar el momento de O a
       (h, 0) solo resta h por la resultante vertical. La reacción no aparece:
       está aplicada justo en D. */
    const h = Mz / Fy;
    /* Contraste: con esa h, el momento de todo el sistema en D es nulo. */
    const enD = suma(cargas.map(({ p, f }) => ({ p: [p[0] - h, p[1]] as [number, number], f }))).Mz;
    expect(enD).toBeCloseTo(0, 12);
    /* Y la articulación cae dentro de la cara inferior del bloque, que es lo
       que hace que el resultado tenga sentido físico. */
    expect(h).toBeGreaterThan(0);
    expect(h).toBeLessThan(1);

    cuadra(id, 'La distancia h', h);
  });
});

/* ─────────────────────────────────────────────────────────────────────────
   Ejercicio 2 · la viga ABCDE en T. Unidades de Mg y de L, con Mg = L = 1, así
   que A = 0, B = 1, C = 2, D = 3 y E = 4.
   ───────────────────────────────────────────────────────────────────────── */

const q0 = 4; // 4Mg/L
const horizontalC = 2; // 2Mg en C, hacia la izquierda
const parD = 4; // 4MgL en D, antihorario

/* La repartida va de A a C y no más allá: la figura del enunciado dibuja las
   flechas entre esos dos puntos, media viga. Su resultante son 8Mg en x = L. */
const Q = q0 * 2;
const xQ = 1;

/* Equilibrio del sólido libre, con x a la derecha e y arriba. Incógnitas: la
   reacción vertical en A y la fuerza del muelle en E, las dos hacia arriba.
   El par entra con su signo antihorario y la carga horizontal de C no da
   momento en A porque va por el eje de la viga. */
const [Ay, FE] = resuelve(
  [
    [1, 1], // ΣF_y
    [0, 4], // ΣM_A
  ],
  [Q, Q * xQ - parD],
);
const Ax = horizontalC; // ΣF_x: la reacción compensa los 2Mg hacia la izquierda

/* La misma viga en el modelo del tema 6, cuyo convenio tiene la y hacia abajo
   y llama positivo al par que tracciona la fibra inferior. El de D es
   antihorario en la figura, y con ese convenio eso es −4MgL: para el trozo de
   viga que queda a su izquierda, un par antihorario aplicado en el corte
   resta flector. */
const viga: Viga = {
  L: 4,
  xA: 0,
  xB: 4,
  cargas: [
    { tipo: 'repartida', x1: 0, x2: 2, q1: q0, q2: q0 },
    { tipo: 'par', x: 3, M: -parD },
  ],
};

describe('6 · el muelle que sostiene la viga', () => {
  const id = 'exma2425-ord-6-el-muelle-que-sostiene-la-viga';

  it('el muelle tiene que tirar con Mg, así que k = Mg/L', () => {
    /* El muelle mide L con longitud natural nula, así que su deformación es L
       entera y k = F/L. */
    cuadra(id, 'La constante del muelle', FE / 1);
  });

  it('y en A quedan 7Mg hacia arriba', () => {
    /* Contraste con el modelo del tema 6, que reparte por su cuenta y con su
       propio convenio de signos. Que las dos rutas coincidan es lo que
       justifica el −4 del par de arriba. */
    const { RA, RB } = reacciones(viga);
    expect(RA).toBeCloseTo(Ay, 10);
    expect(RB).toBeCloseTo(FE, 10);
    expect(Ax).toBeCloseTo(2, 12);

    cuadra(id, 'La reacción vertical en A', Ay);
  });
});

describe('6 · los diagramas y las tensiones de la viga en T', () => {
  const id = 'exma2425-ord-6-los-diagramas-y-las-tensiones-de-la-viga-en-t';

  const { MmaxPos, Mabs, cortesV } = extremos(viga, 20000);

  it('el flector máximo son 49MgL/8, donde se anula el cortante', () => {
    /* dM/dx = V: el máximo del flector está donde el cortante cruza el cero,
       y aquí eso pasa dentro del tramo cargado, en x = 7L/4. */
    expect(cortesV.some((x) => Math.abs(x - MmaxPos.x) < 1e-3)).toBe(true);
    /* Y no hay nada mayor en valor absoluto: el flector no se hace negativo
       en ningún punto de esta viga. */
    expect(Mabs.M).toBeCloseTo(MmaxPos.M, 10);

    cuadra(id, 'El flector máximo', MmaxPos.M);
  });

  /* La sección en T, en unidades de b y medida desde la base del alma: ala de
     5b × b arriba, alma de b × 5b debajo. */
  const rectangulos = [
    { ancho: 5, alto: 1, yc: 5 + 0.5 }, // ala
    { ancho: 1, alto: 5, yc: 2.5 }, // alma
  ];
  const area = rectangulos.reduce((s, r) => s + r.ancho * r.alto, 0);
  const yg = rectangulos.reduce((s, r) => s + r.ancho * r.alto * r.yc, 0) / area;
  const inercia = rectangulos.reduce(
    (s, r) => s + (r.ancho * r.alto ** 3) / 12 + r.ancho * r.alto * (r.yc - yg) ** 2,
    0,
  );
  const canto = 6; // 5b de alma más b de ala

  it('el centro de gravedad está a 4b de la base', () => {
    expect(area).toBeCloseTo(10, 12);
    cuadra(id, 'El centro de gravedad de la T', yg);
  });

  it('y el momento de inercia son 100b⁴/3', () => cuadra(id, 'El momento de inercia de la T', inercia));

  it('el axil de la sección crítica comprime con 0,2 Mg/b²', () => {
    /* La sección del flector máximo cae antes de C, así que a su izquierda
       solo está la reacción horizontal de A, 2Mg hacia la derecha. El
       equilibrio del trozo izquierdo da N = −ΣF_x: compresión. */
    expect(MmaxPos.x).toBeLessThan(2);
    const N = -Ax;
    cuadra(id, 'La parte del axil', N / area);
  });

  it('la fibra superior se comprime y la inferior se tracciona', () => {
    /* El flector es positivo, o sea que tracciona la fibra inferior: arriba
       sale negativo y abajo positivo, y el reparto es lineal con la distancia
       al centro de gravedad. */
    const sigma = (y: number) => (MmaxPos.M * (yg - y)) / inercia;
    expect(sigma(yg)).toBeCloseTo(0, 12);

    cuadra(id, 'La fibra superior', sigma(canto));
    cuadra(id, 'La fibra inferior', sigma(0));
  });
});
