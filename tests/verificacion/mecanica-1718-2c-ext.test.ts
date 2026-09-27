/**
 * La extraordinaria de junio de 2018 de Mecánica Aplicada, bloque 2
 * (Dinámica). Quince respuestas en cuatro resoluciones: dos cuestiones de
 * teoría y dos ejercicios.
 *
 * El examen **no publica resolución ni resultados**. Cada respuesta se vuelve
 * a sacar por un camino distinto del de la resolución del corpus:
 *
 * - el contacto, girando los ejes con la fórmula de Rodrigues hasta que la
 *   normal es el eje z, en vez de proyectar sobre la normal y restar;
 * - el trabajo, integrando F·dr a lo largo de la parábola que la partícula
 *   recorre de verdad —las dos que pasan por B con 3 m/s en A—, y la
 *   velocidad en B con las ecuaciones del movimiento, sin el teorema de la
 *   energía;
 * - el mecanismo, moviéndolo en el tiempo y derivando numéricamente las
 *   posiciones —el ángulo de la barra BC tangente al disco, el punto de
 *   contacto sobre ella y la condición de no deslizar—, en vez de usar el
 *   CIR y el campo de velocidades;
 * - el cilindro, con el tensor de inercia construido en ejes del eje de giro
 *   con una matriz de rotación, el momento angular derivado numéricamente
 *   mientras gira y las seis ecuaciones de Newton-Euler resueltas como un
 *   sistema lineal; el L/R que anula las dinámicas, por bisección sobre ese
 *   mismo sistema.
 *
 * Las cuestiones y el ejercicio 2 no traen números: sus casillas usan valores
 * nuestros, que la pregunta de cada paso declara, y aquí se escriben tal cual.
 */
import { describe, expect, it } from 'vitest';
import { convocatoria } from './corpus';
import { deriva, integra, raiz, trabajo } from './numerico';
import { porMatriz, porVector, productoVectorial, resuelve, traspuesta } from './lineal';

const cuadra = convocatoria('mecanica-aplicada', '2017-2018-2c-ext');

describe('1 · rodadura y pivotamiento en el contacto', () => {
  const id = 'exma1718-2cext-1-rodadura-y-pivotamiento-en-el-contacto';

  /* Valores de la pregunta: normal n = (0; 0,8; 0,6), ω₁ = (0, 0, 1) y
     ω₂ = (2, 1, 4) rad/s. */
  const n = [0, 0.8, 0.6];
  const wr = [2, 1, 4].map((x, i) => x - [0, 0, 1][i]);

  /* Rodrigues: la rotación de eje k = n × z y ángulo el que forman n y z
     lleva la normal al eje z. En esos ejes, el pivotamiento es la tercera
     componente y la rodadura, el módulo de las otras dos. */
  const eje = productoVectorial(n, [0, 0, 1]);
  const sen = Math.hypot(...eje);
  const cos = n[2];
  const k = eje.map((x) => x / sen);
  const K = [
    [0, -k[2], k[1]],
    [k[2], 0, -k[0]],
    [-k[1], k[0], 0],
  ];
  const K2 = porMatriz(K, K);
  const Rot = K.map((fila, i) => fila.map((x, j) => (i === j ? 1 : 0) + sen * x + (1 - cos) * K2[i][j]));
  const w = porVector(Rot, wr);

  it('la rotación lleva la normal al eje z', () => {
    const nz = porVector(Rot, n);
    expect(nz[0]).toBeCloseTo(0, 12);
    expect(nz[1]).toBeCloseTo(0, 12);
    expect(nz[2]).toBeCloseTo(1, 12);
  });
  it('el pivotamiento es la componente según la normal girada', () =>
    cuadra(id, 'La componente de pivotamiento', Math.abs(w[2])));
  it('y la rodadura, lo que queda en el plano tangente', () =>
    cuadra(id, 'La componente de rodadura', Math.hypot(w[0], w[1])));
});

describe('2 · el trabajo de una fuerza y la energía cinética', () => {
  const id = 'exma1718-2cext-2-el-trabajo-de-una-fuerza-y-la-energia-cinetica';

  /* Valores de la pregunta: m = 2 kg, F = (6, −2) N constante y única, pasa
     por A = (0, 0) m a 3 m/s y después por B = (6, 4) m. La trayectoria es
     r(t) = A + v₀t + F t²/(2m); se busca el instante en que llega a B con
     |v₀| = 3, que da dos soluciones: dos direcciones de lanzamiento. */
  const m = 2;
  const F = [6, -2];
  const A = [0, 0];
  const B = [6, 4];
  const vA = 3;
  const resto = (t: number) => [0, 1].map((i) => B[i] - A[i] - (F[i] * t * t) / (2 * m));
  const llega = (t: number) => Math.hypot(...resto(t)) - vA * t;
  const tiempos = [raiz(llega, 1, 2.1), raiz(llega, 2.1, 3)];

  tiempos.forEach((T, n) => {
    const v0 = resto(T).map((x) => x / T);
    const r = (t: number) => [0, 1].map((i) => A[i] + v0[i] * t + (F[i] * t * t) / (2 * m));
    const W = trabajo(() => F, r, 0, T);
    const vB = Math.hypot(...[0, 1].map((i) => v0[i] + (F[i] * T) / m));

    it(`trayectoria ${n + 1}: sale de A a 3 m/s y pasa por B`, () => {
      expect(Math.hypot(...v0)).toBeCloseTo(vA, 9);
      expect(r(T)[0]).toBeCloseTo(B[0], 9);
      expect(r(T)[1]).toBeCloseTo(B[1], 9);
    });
    it(`trayectoria ${n + 1}: el trabajo integrado sobre la parábola`, () =>
      cuadra.magnitud(id, 'El trabajo de la fuerza', W, 'J'));
    it(`trayectoria ${n + 1}: la velocidad en B, por las ecuaciones del movimiento`, () =>
      cuadra.magnitud(id, 'La velocidad en B', vB, 'm/s'));
  });
  it('la energía cinética en A que cita un distractor, 9 J', () => expect((m * vA * vA) / 2).toBe(9));
});

describe('3 · el disco que rueda sobre la barra BC', () => {
  const id = 'exma1718-2cext-3-el-disco-que-rueda-sobre-la-barra-bc';

  /* Datos: R = 0,1 m y ω₁ = 10 rad/s antihoraria. Posiciones con O en el
     origen del instante pedido: O = (0, y_O) corre por la vertical, A =
     (x_A, R) por la ranura, OA = √5·R forma el ángulo φ con la horizontal y
     B = (0, 3R) es fijo. En t = 0, OA = (2R, R). */
  const R = 0.1;
  const w1 = 10;
  const L1 = Math.sqrt(5) * R;
  const phi = (t: number) => Math.atan2(1, 2) + w1 * t;
  const xA = (t: number) => L1 * Math.cos(phi(t));
  const yO = (t: number) => R - L1 * Math.sin(phi(t));

  /* La barra BC, tangente al disco por encima: el ángulo de BA más el que
     abre la tangente, arcsen(R/|BA|). El punto de contacto está a
     s = √(|BA|² − R²) de B, y el radio AE forma el ángulo θ₃ + 90°. */
  const BA = (t: number) => Math.hypot(xA(t), R - 3 * R);
  const theta3 = (t: number) => Math.atan2(R - 3 * R, xA(t)) + Math.asin(R / BA(t));
  const s = (t: number) => Math.sqrt(BA(t) ** 2 - R * R);
  const psi = (t: number) => theta3(t) + Math.PI / 2;

  const vO = deriva(yO, 0);
  const vA = deriva(xA, 0);
  const w3 = deriva(theta3, 0);
  /* Sin deslizar en E: el contacto avanza lo mismo sobre la barra que sobre
     el borde del disco, y de ahí ω₂ = ψ' + s'/R. */
  const w2 = deriva(psi, 0) + deriva(s, 0) / R;
  /* Respecto de la barra, A está a la abscisa s y a la distancia R de ella,
     así que su velocidad relativa es s' a lo largo de BC. */
  const vRel = deriva(s, 0);

  it('la geometría: BE = √7·R y α = 24,3°', () => {
    expect(s(0) / R).toBeCloseTo(Math.sqrt(7), 9);
    expect((-theta3(0) * 180) / Math.PI).toBeCloseTo(24.295, 2);
  });
  it('O baja', () => {
    expect(vO).toBeLessThan(0);
    cuadra.magnitud(id, 'La velocidad del punto O', Math.abs(vO), 'm/s');
  });
  it('A va hacia la izquierda', () => {
    expect(vA).toBeLessThan(0);
    cuadra.magnitud(id, 'La velocidad del punto A', Math.abs(vA), 'm/s');
  });
  it('el disco gira en sentido horario', () => {
    expect(w2).toBeLessThan(0);
    cuadra(id, 'La velocidad angular del disco', Math.abs(w2));
  });
  it('la barra BC también', () => {
    expect(w3).toBeLessThan(0);
    cuadra(id, 'La velocidad angular de la barra BC', Math.abs(w3));
  });
  it('A se mueve respecto de BC a lo largo de ella, hacia B', () => {
    expect(vRel).toBeLessThan(0);
    cuadra.magnitud(id, 'La velocidad de A respecto de la barra BC', Math.abs(vRel), 'm/s');
  });
  it('y sus componentes son las que publica la colección para el 8.9, (−0,688; 0,312)', () => {
    const t = [Math.cos(theta3(0)), Math.sin(theta3(0))];
    expect(Math.abs(vRel * t[0] - -0.688)).toBeLessThan(0.002);
    expect(Math.abs(vRel * t[1] - 0.312)).toBeLessThan(0.002);
  });
  it('la forma exacta de la prosa: R·|ω₂ − ω₃| = 2/√7 m/s', () => {
    expect(R * Math.abs(w2 - w3)).toBeCloseTo(Math.abs(vRel), 6);
    expect(Math.abs(vRel)).toBeCloseTo(2 / Math.sqrt(7), 6);
  });
  it('la velocidad de arrastre que citan el distractor y el dibujo, 0,44 m/s', () =>
    expect(Math.abs(w3) * BA(0)).toBeCloseTo(0.44, 2));
});

describe('4 · el cilindro inclinado sobre un eje vertical', () => {
  const id = 'exma1718-2cext-4-el-cilindro-inclinado-sobre-un-eje-vertical';

  /* Valores de la pregunta: M = 12 kg, R = 0,1 m, L = 0,6 m, β = 30°,
     ω = 20 rad/s, h = 0,8 m y g = 9,8 m/s². */
  const M = 12;
  const R = 0.1;
  const beta = Math.PI / 6;
  const w = 20;
  const h = 0.8;
  const g = 9.8;

  /* Ejes fijos: Z₀ según el eje AB, hacia arriba, y X₀ en el plano del
     dibujo, hacia el lado del extremo alto del cilindro. Ejes del cilindro en
     t = 0, como columnas: X (= Y₀, perpendicular al dibujo), Y en el plano y
     Z según su eje, inclinado β. */
  const ejes = (L: number) => {
    const It = (M * (3 * R * R + L * L)) / 12;
    const Iz = (M * R * R) / 2;
    const Q = traspuesta([
      [0, 1, 0],
      [-Math.cos(beta), 0, Math.sin(beta)],
      [Math.sin(beta), 0, Math.cos(beta)],
    ]);
    const D = [
      [It, 0, 0],
      [0, It, 0],
      [0, 0, Iz],
    ];
    return { Q, I0: porMatriz(porMatriz(Q, D), traspuesta(Q)) };
  };

  /* El momento angular en ejes fijos cuando el cilindro ha girado ωt
     alrededor de Z₀: H(t) = Rz(ωt)·I₀·Rz(ωt)ᵀ·ω. */
  const Rz = (a: number) => [
    [Math.cos(a), -Math.sin(a), 0],
    [Math.sin(a), Math.cos(a), 0],
    [0, 0, 1],
  ];
  const Hfijo = (L: number, t: number) => {
    const { I0 } = ejes(L);
    const Rt = Rz(w * t);
    return porVector(porMatriz(porMatriz(Rt, I0), traspuesta(Rt)), [0, 0, w]);
  };
  const Hpunto = (L: number) => [0, 1, 2].map((i) => deriva((t) => Hfijo(L, t)[i], 0, 1e-6));

  /* Las seis ecuaciones con incógnitas [A_x, A_y, B_x, B_y, B_z]: A es radial
     y B toma además la axial. A está en (0, 0, h/2) y B en (0, 0, −h/2)
     respecto de G. La sexta, la de momentos según Z₀, no lleva reacciones y
     se comprueba aparte: sin par motor, tiene que salir cero. */
  const reacciones = (L: number, girando: boolean) => {
    const dH = girando ? Hpunto(L) : [0, 0, 0];
    const Mat = [
      [1, 0, 1, 0, 0],
      [0, 1, 0, 1, 0],
      [0, 0, 0, 0, 1],
      [0, -h / 2, 0, h / 2, 0],
      [h / 2, 0, -h / 2, 0, 0],
    ];
    return resuelve(Mat, [0, 0, M * g, dH[0], dH[1]]);
  };

  const L = 0.6;
  const { Q } = ejes(L);
  const Hcuerpo = porVector(traspuesta(Q), Hfijo(L, 0));
  const dH = Hpunto(L);
  const quieto = reacciones(L, false);
  const total = reacciones(L, true);
  const din = total.map((x, i) => x - quieto[i]);

  it('la tabla del enunciado, integrada sobre el volumen del cilindro', () => {
    /* I_x = ∫(y² + z²) dm con densidad uniforme: por rodajas de espesor dz,
       cada disco aporta σ(r²/4 + z²)·πr² dz. */
    const rho = M / (Math.PI * R * R * L);
    const Ix = integra((z) => rho * Math.PI * R * R * (R * R / 4 + z * z), -L / 2, L / 2);
    expect(Ix).toBeCloseTo((M * (3 * R * R + L * L)) / 12, 10);
  });
  it('la componente transversal del momento angular', () =>
    cuadra.magnitud(id, 'La componente transversal del momento angular', Hcuerpo[1], 'kg*m^2/s'));
  it('la componente según el eje del cilindro', () =>
    cuadra.magnitud(id, 'La componente del momento angular según el eje del cilindro', Hcuerpo[2], 'kg*m^2/s'));
  it('y ninguna según X, la perpendicular al plano del dibujo', () => expect(Hcuerpo[0]).toBeCloseTo(0, 10));
  it('la prosa: H_G forma unos 45° con el eje AB, al lado contrario del eje del cilindro', () => {
    const H0 = Hfijo(L, 0);
    const angulo = (Math.acos(H0[2] / Math.hypot(...H0)) * 180) / Math.PI;
    expect(Math.abs(angulo - 45)).toBeLessThan(0.5);
    /* El eje del cilindro sube hacia +X₀; el momento angular, hacia −X₀. */
    expect(Q[0][2]).toBeGreaterThan(0);
    expect(H0[0]).toBeLessThan(0);
  });
  it('la derivada, perpendicular al plano del dibujo y sin componente según el eje', () => {
    expect(dH[0]).toBeCloseTo(0, 6);
    expect(dH[2]).toBeCloseTo(0, 6);
    /* Y₀ entra en el papel: para un cilindro largo la derivada sale de él. */
    expect(dH[1]).toBeLessThan(0);
    cuadra.magnitud(id, 'La derivada del momento angular', Math.hypot(...dH), 'N*m');
  });
  it('estática: solo la axial de B, que sostiene el peso', () => {
    expect(quieto[0]).toBeCloseTo(0, 9);
    expect(quieto[1]).toBeCloseTo(0, 9);
    expect(quieto[2]).toBeCloseTo(0, 9);
    expect(quieto[3]).toBeCloseTo(0, 9);
    cuadra.magnitud(id, 'La reacción estática en B', quieto[4], 'N');
  });
  it('dinámicas: iguales y opuestas, en el plano del dibujo, la de A hacia el extremo bajo', () => {
    expect(din[0] + din[2]).toBeCloseTo(0, 6);
    expect(din[1]).toBeCloseTo(0, 6);
    expect(din[3]).toBeCloseTo(0, 6);
    expect(din[4]).toBeCloseTo(0, 9);
    expect(din[0]).toBeLessThan(0);
    cuadra.magnitud(id, 'La reacción dinámica en cada cojinete', Math.hypot(din[0], din[1]), 'N');
    cuadra.magnitud(id, 'La reacción dinámica en cada cojinete', Math.hypot(din[2], din[3]), 'N');
  });
  it('la longitud que anula las dinámicas, buscada por bisección', () => {
    const Lnula = raiz((l) => reacciones(l, true)[0], 0.12, 0.3);
    cuadra(id, 'La longitud que anula las reacciones dinámicas', Lnula / R);
  });
});
