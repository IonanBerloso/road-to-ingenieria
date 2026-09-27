/**
 * La ordinaria de mayo de 2019 de Mecánica Aplicada, bloque 2 (Cinemática y
 * dinámica). Diecisiete respuestas en cinco resoluciones: tres cuestiones de
 * teoría y dos ejercicios.
 *
 * El examen **no publica resolución ni resultados**, así que la pregunta es
 * «¿es correcto el resultado?», y cada respuesta se vuelve a sacar por un
 * camino distinto del de la resolución del corpus:
 *
 * - el momento angular, sumando m·ρ × v masa a masa, con las velocidades
 *   sacadas derivando numéricamente las posiciones, en vez del tensor;
 * - la velocidad de sucesión, simulando el disco que rueda sobre el aro,
 *   buscando el CIR con las perpendiculares a dos velocidades y derivando su
 *   posición, en vez de la fórmula de los radios de curvatura;
 * - los dos discos, simulando el mecanismo y derivando dos veces la posición
 *   del punto material que pasa por Q, y el CIR con perpendiculares;
 * - las dos barras, simulando el plano que gira con la barra 1 y la
 *   deslizadera, y sacando las velocidades angulares de la derivada de los
 *   ejes de la barra (Ṙ·Rᵀ), no de la suma de giros;
 * - la placa, partida en una malla de masas puntuales, con Σ r × m·a sumado
 *   masa a masa y el sistema de las reacciones resuelto con `resuelve`.
 *
 * Las cuentas de las tres cuestiones y del ejercicio 1 usan valores nuestros,
 * que la pregunta de cada paso declara: el enunciado es simbólico.
 */
import { describe, expect, it } from 'vitest';
import { convocatoria } from './corpus';
import { resuelve } from './lineal';

const cuadra = convocatoria('mecanica-aplicada', '2018-2019-2c');

type V3 = [number, number, number];
const suma = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const resta = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const por = (k: number, a: V3): V3 => [k * a[0], k * a[1], k * a[2]];
const cruz = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const punto = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const modulo = (a: V3) => Math.hypot(a[0], a[1], a[2]);

/** Derivada central de una trayectoria vectorial. */
const velocidad = (x: (t: number) => V3, t: number, h = 1e-5): V3 => por(1 / (2 * h), resta(x(t + h), x(t - h)));
/** Segunda derivada central. */
const aceleracion = (x: (t: number) => V3, t: number, h = 1e-4): V3 =>
  por(1 / (h * h), suma(resta(x(t + h), por(2, x(t))), x(t - h)));

/** El punto del plano (2D) donde se cortan las perpendiculares a dos
 *  velocidades: el CIR, sin usar la velocidad angular. */
function cir(X1: number[], v1: number[], X2: number[], v2: number[]): number[] {
  /* (I − X1)·v1 = 0  y  (I − X2)·v2 = 0 */
  return resuelve(
    [
      [v1[0], v1[1]],
      [v2[0], v2[1]],
    ],
    [X1[0] * v1[0] + X1[1] * v1[1], X2[0] * v2[0] + X2[1] * v2[1]],
  );
}

describe('1 · el momento angular respecto de G', () => {
  const id = 'exma1819-2c-1-el-momento-angular-respecto-de-g';

  /* Valores de la pregunta: dos masas de 1 kg a 1 m de G, la varilla en el
     plano xz inclinada 30°, girando a 5 rad/s alrededor de z. Las masas se
     mueven de verdad —giro alrededor de z— y la velocidad sale de derivar
     su posición, no de ω × ρ. */
  const [m, a, w, inc] = [1, 1, 5, Math.PI / 6];
  const inicio: V3[] = [
    [a * Math.cos(inc), 0, a * Math.sin(inc)],
    [-a * Math.cos(inc), 0, -a * Math.sin(inc)],
  ];
  const gira = (p: V3) => (t: number): V3 => [
    p[0] * Math.cos(w * t) - p[1] * Math.sin(w * t),
    p[0] * Math.sin(w * t) + p[1] * Math.cos(w * t),
    p[2],
  ];
  const H = inicio.reduce<V3>((acc, p) => suma(acc, por(m, cruz(p, velocidad(gira(p), 0)))), [0, 0, 0]);

  it('la componente según el giro', () => cuadra.magnitud(id, 'La componente según el giro', H[2], 'kg*m^2/s'));
  it('la componente perpendicular al giro', () =>
    cuadra.magnitud(id, 'La componente perpendicular al giro', Math.hypot(H[0], H[1]), 'kg*m^2/s'));
  it('y el momento angular sale perpendicular a la varilla, no según ω', () => {
    expect(Math.abs(punto(H, inicio[0]))).toBeLessThan(1e-6);
    expect(Math.hypot(H[0], H[1])).toBeGreaterThan(1);
  });
});

describe('2 · la velocidad de sucesión del CIR', () => {
  const id = 'exma1819-2c-2-la-velocidad-de-sucesion-del-cir';

  /* Valores de la pregunta: disco de r = 0,1 m, aro fijo de R = 0,3 m,
     ω = 4 rad/s. El disco rueda sin deslizar: la condición se impone sobre
     el punto material de contacto, y de ahí sale el giro de la recta de los
     centros. Por fuera, P a R + r del centro del aro; por dentro, a R − r. */
  const [r, R, w] = [0.1, 0.3, 4];

  function sucesion(fuera: boolean): number {
    const d = fuera ? R + r : R - r;
    /* velocidad de contacto nula: d·β̇ ∓ r·ψ̇ = 0 */
    const psi = (t: number) => -w * t;
    const beta = (t: number) => Math.PI / 2 + ((fuera ? r : -r) / d) * psi(t);
    const P = (t: number): V3 => [d * Math.cos(beta(t)), d * Math.sin(beta(t)), 0];
    /* Dos puntos materiales del disco: su centro y el que está a r/2 a su
       derecha en el instante inicial. */
    const material = (t: number): V3 => {
      const c = P(t);
      return [c[0] + (r / 2) * Math.cos(psi(t)), c[1] + (r / 2) * Math.sin(psi(t)), 0];
    };
    const I = (t: number) => cir(P(t), velocidad(P, t), material(t), velocidad(material, t));
    const dt = 1e-4;
    const [a, b] = [I(-dt), I(dt)];
    return Math.hypot(b[0] - a[0], b[1] - a[1]) / (2 * dt);
  }

  it('rodando por fuera del aro', () => cuadra.magnitud(id, 'Rodando por fuera de un aro fijo', sucesion(true), 'm/s'));
  it('rodando por dentro', () => cuadra.magnitud(id, 'Rodando por dentro del aro', sucesion(false), 'm/s'));
});

describe('3 · el disco que rueda sobre otro que gira', () => {
  const id = 'exma1819-2c-3-el-disco-que-rueda-sobre-otro-que-gira';

  /* Valores de la pregunta, con los sentidos de la figura: todo horario.
     Ángulos antihorarios positivos, así que θ y ψ decrecen. La rodadura se
     impone sobre las velocidades de los dos puntos materiales en contacto,
     R·θ̇ = (R + r)·β̇ − r·ψ̇, que integrada da β(t) exacta. */
  const [R, r, Om, om, A, al] = [0.3, 0.1, 2, 5, 1, 4];
  const theta = (t: number) => -(Om * t + (A * t * t) / 2);
  const psi = (t: number) => -(om * t + (al * t * t) / 2);
  const beta = (t: number) => Math.PI / 2 + (R * theta(t) + r * psi(t)) / (R + r);
  const P = (t: number): V3 => [(R + r) * Math.cos(beta(t)), (R + r) * Math.sin(beta(t)), 0];

  /* El punto material del disco pequeño que en t = 0 está en Q = (0, R):
     debajo de P, a la distancia r. */
  const Qr = (t: number): V3 => {
    const c = P(t);
    const ang = -Math.PI / 2 + psi(t);
    return [c[0] + r * Math.cos(ang), c[1] + r * Math.sin(ang), 0];
  };
  /* Otro punto material del disco pequeño, fuera de la recta OP —a r/2 a la
     derecha de P en t = 0—: con P y Q las dos velocidades son paralelas y
     sus perpendiculares coinciden, así que no sirven para cortar. */
  const lateral = (t: number): V3 => {
    const c = P(t);
    return [c[0] + (r / 2) * Math.cos(psi(t)), c[1] + (r / 2) * Math.sin(psi(t)), 0];
  };
  /* Y el del disco grande que está en Q. */
  const QR = (t: number): V3 => [R * Math.cos(Math.PI / 2 + theta(t)), R * Math.sin(Math.PI / 2 + theta(t)), 0];

  const vQ = velocidad(Qr, 0);
  const aQ = aceleracion(Qr, 0);

  it('los dos puntos en contacto tienen la misma velocidad', () =>
    expect(modulo(resta(vQ, velocidad(QR, 0)))).toBeLessThan(1e-6));

  it('la velocidad de Q', () => cuadra.magnitud(id, 'La velocidad del punto de contacto', modulo(vQ), 'm/s'));

  /* En t = 0 la tangente en Q es el eje x y la normal, el y (hacia P). */
  it('la tangencial de Q', () => cuadra.magnitud(id, 'La aceleración tangencial de Q', Math.abs(aQ[0]), 'm/s^2'));
  it('la normal de Q en el disco pequeño, que apunta hacia O', () => {
    expect(aQ[1]).toBeLessThan(0);
    cuadra.magnitud(id, 'La aceleración normal de Q en el disco pequeño', Math.abs(aQ[1]), 'm/s^2');
  });

  it('el CIR del disco pequeño, cortando perpendiculares', () => {
    const I = cir(P(0), velocidad(P, 0), lateral(0), velocidad(lateral, 0));
    const Q0 = Qr(0);
    /* entre Q y O, sobre la vertical */
    expect(Math.abs(I[0])).toBeLessThan(1e-6);
    expect(I[1]).toBeLessThan(Q0[1]);
    expect(I[1]).toBeGreaterThan(0);
    cuadra.magnitud(id, 'La distancia del CIR a Q', Math.hypot(I[0] - Q0[0], I[1] - Q0[1]), 'm');
  });
});

describe('4 · las dos barras en el plano que gira', () => {
  const id = 'exma1819-2c-4-las-dos-barras-en-el-plano-que-gira';

  /* Valores de la pregunta: ω = 2 rad/s, L = 0,5 m. El plano gira a −ω
     alrededor de z; dentro de él, la barra 1 gira a 2ω alrededor de A, y C
     se queda en la horizontal de A a la distancia L√2 de B. Coordenadas del
     plano (y, z) y paso a 3D girando alrededor de z. */
  const [w, L] = [2, 0.5];
  const fi = (t: number) => -w * t;
  const th1 = (t: number) => (5 * Math.PI) / 4 + 2 * w * t;
  const enPlano = (t: number) => {
    const A = [L, 0];
    const B = [A[0] + L * Math.SQRT2 * Math.cos(th1(t)), A[1] + L * Math.SQRT2 * Math.sin(th1(t))];
    const C = [B[0] - Math.sqrt(2 * L * L - B[1] * B[1]), 0];
    return { A, B, C };
  };
  const en3D = (t: number, [y, z]: number[]): V3 => [-y * Math.sin(fi(t)), y * Math.cos(fi(t)), z];
  const A = (t: number) => en3D(t, enPlano(t).A);
  const B = (t: number) => en3D(t, enPlano(t).B);
  const C = (t: number) => en3D(t, enPlano(t).C);

  /* La velocidad angular de la barra 1 sale de sus ejes: la dirección de la
     barra, la normal al plano y su producto. ω̃ = Ṙ·Rᵀ, derivada numérica. */
  const ejes = (t: number): V3[] => {
    const e1 = resta(B(t), A(t));
    const u = por(1 / modulo(e1), e1);
    const n: V3 = [Math.cos(fi(t)), Math.sin(fi(t)), 0];
    return [u, n, cruz(u, n)];
  };
  const omega1 = (t: number): V3 => {
    const h = 1e-5;
    const [m, p, c] = [ejes(t - h), ejes(t + h), ejes(t)];
    /* Para cada eje e, ė = ω × e; con tres ejes ortonormales,
       ω = ½ Σ e × ė. */
    return c.reduce<V3>((acc, e, k) => {
      const de = por(1 / (2 * h), resta(p[k], m[k]));
      return suma(acc, por(0.5, cruz(e, de)));
    }, [0, 0, 0]);
  };
  const w1 = omega1(0);
  const alfa1 = por(1 / (2 * 1e-4), resta(omega1(1e-4), omega1(-1e-4)));

  it('la barra 1 gira según la normal al plano más el eje z', () => {
    expect(Math.abs(w1[1])).toBeLessThan(1e-6);
  });
  it('la velocidad angular de la barra 1', () => cuadra(id, 'La velocidad angular de la barra 1', modulo(w1)));
  it('A se mueve con el plano', () => expect(modulo(velocidad(A, 0))).toBeCloseTo(w * L, 6));
  it('la velocidad de B', () => cuadra.magnitud(id, 'La velocidad de B', modulo(velocidad(B, 0)), 'm/s'));
  it('la velocidad de C, sin componente vertical', () => {
    const vC = velocidad(C, 0);
    expect(Math.abs(vC[2])).toBeLessThan(1e-6);
    cuadra.magnitud(id, 'La velocidad de C', modulo(vC), 'm/s');
  });
  it('la velocidad de C vista desde el plano', () => {
    /* derivar las coordenadas del plano, sin girar */
    const h = 1e-5;
    const vRel = (enPlano(h).C[0] - enPlano(-h).C[0]) / (2 * h);
    cuadra.magnitud(id, 'La velocidad de C vista desde el plano', Math.abs(vRel), 'm/s');
  });
  it('la aceleración angular de la barra 1', () => cuadra(id, 'La aceleración angular de la barra 1', modulo(alfa1)));
});

describe('5 · la placa cuadrada en voladizo', () => {
  const id = 'exma1819-2c-5-la-placa-cuadrada-en-voladizo';

  /* Datos del enunciado, en metros: placa de 2 kg en el plano yz, de z = 0,6
     a 0,9 y de y = 0 a 0,3; A en z = 0,4 y B en el origen; ω = 5 rad/s según
     z; g = 9,8, la de la pregunta. La placa se parte en N × N masas. */
  const [M, w, g, zA] = [2, 5, 9.8, 0.4];
  const N = 120;
  const masas: { m: number; r: V3 }[] = [];
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++)
      masas.push({ m: M / (N * N), r: [0, (0.3 * (i + 0.5)) / N, 0.6 + (0.3 * (j + 0.5)) / N] });

  /* Reacciones [Ax, Ay, Bx, By] con la dinámica respecto de B: fuerzas y
     momentos, con Σ r × m·a masa a masa. Giro alrededor de z a ω constante:
     a = −ω²(x, y, 0). */
  function reacciones(cuerpo: { m: number; r: V3 }[], om: number) {
    let F: V3 = [0, 0, 0];
    let Mo: V3 = [0, 0, 0];
    let peso: V3 = [0, 0, 0];
    let Mpeso: V3 = [0, 0, 0];
    for (const { m, r } of cuerpo) {
      const a: V3 = [-om * om * r[0], -om * om * r[1], 0];
      F = suma(F, por(m, a));
      Mo = suma(Mo, cruz(r, por(m, a)));
      const W: V3 = [0, -m * g, 0];
      peso = suma(peso, W);
      Mpeso = suma(Mpeso, cruz(r, W));
    }
    /* A en (0, 0, zA): r × (Ax, Ay, 0) = (−zA·Ay, zA·Ax, 0) */
    return resuelve(
      [
        [1, 0, 1, 0],
        [0, 1, 0, 1],
        [0, -zA, 0, 0],
        [zA, 0, 0, 0],
      ],
      [F[0] - peso[0], F[1] - peso[1], Mo[0] - Mpeso[0], Mo[1] - Mpeso[1]],
    );
  }

  const [Ax, Ay, Bx, By] = reacciones(masas, w);

  it('las horizontales son nulas', () => {
    expect(Math.abs(Ax)).toBeLessThan(1e-9);
    expect(Math.abs(Bx)).toBeLessThan(1e-9);
  });
  it('la reacción en A', () => cuadra.magnitud(id, 'La reacción en A', Ay, 'N'));
  it('la de B, que tira hacia abajo', () => {
    expect(By).toBeLessThan(0);
    cuadra.magnitud(id, 'La reacción en B', Math.abs(By), 'N');
  });
  it('y la parte estática es la del eje parado: 36,75 y −17,15 N', () => {
    const [, AyE, , ByE] = reacciones(masas, 0);
    expect(AyE).toBeCloseTo(36.75, 6);
    expect(ByE).toBeCloseTo(-17.15, 6);
  });

  /* Equilibrado: dos masas de 1 kg en z = 0,1 y 0,3, en el plano yz. Se
     resuelve el sistema con los momentos de la malla, no con y_G·z_G. */
  const Sy = masas.reduce((s, { m, r }) => s + m * r[1], 0);
  const Syz = masas.reduce((s, { m, r }) => s + m * r[1] * r[2], 0);
  const [y1, y2] = resuelve(
    [
      [1, 1],
      [0.1, 0.3],
    ],
    [-Sy, -Syz],
  );

  it('la masa del plano Z = 100 mm, del lado de la placa', () => {
    expect(y1).toBeGreaterThan(0);
    cuadra.magnitud(id, 'La masa del plano Z = 100 mm', Math.abs(y1), 'm');
  });
  it('la del plano Z = 300 mm, al otro lado', () => {
    expect(y2).toBeLessThan(0);
    cuadra.magnitud(id, 'La masa del plano Z = 300 mm', Math.abs(y2), 'm');
  });
  it('y con ellas las reacciones dinámicas desaparecen', () => {
    const conjunto = [...masas, { m: 1, r: [0, y1, 0.1] as V3 }, { m: 1, r: [0, y2, 0.3] as V3 }];
    const girando = reacciones(conjunto, w);
    const parado = reacciones(conjunto, 0);
    girando.forEach((x, k) => expect(x).toBeCloseTo(parado[k], 6));
  });
});
