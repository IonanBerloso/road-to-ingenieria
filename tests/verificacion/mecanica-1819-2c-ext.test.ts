/**
 * La extraordinaria de junio de 2019 de Mecánica Aplicada, Dinámica (el
 * bloque 2). Dieciséis respuestas en cuatro resoluciones: dos cuestiones de
 * teoría y dos ejercicios.
 *
 * El examen **no publica resolución ni resultados**, y sus dos ejercicios no
 * están en la colección de la asignatura. Cada respuesta se vuelve a sacar
 * por un camino distinto del de la resolución del corpus:
 *
 * - las componentes intrínsecas, derivando numéricamente la posición en
 *   cartesianas y proyectando la aceleración sobre la velocidad, en vez de
 *   usar s̈ y v²/ρ;
 * - la energía cinética de la varilla, partiéndola en masas puntuales y
 *   sumando ½·m·v² con v = v_G + ω × r', sin tensor y sin König;
 * - el cuadrilátero, resolviendo su posición para cada ángulo de AB y
 *   derivando numéricamente los ángulos de BC y de CD, en vez de las
 *   ecuaciones de velocidades y aceleraciones; y las reacciones con las nueve
 *   ecuaciones de las tres barras como un sistema lineal —sin dar por hecho
 *   que CD sea una biela—, separando lo estático de lo dinámico por
 *   superposición;
 * - las dos barras con deslizadera, integrando en el tiempo la ecuación del
 *   movimiento desde el reposo y buscando por secante el par que da ω al
 *   llegar, en vez del teorema de la energía; y el giro, la energía cinética
 *   y el trabajo de los pesos con posiciones calculadas numéricamente, en
 *   vez del triángulo equilátero y del centro instantáneo.
 *
 * Los cuatro enunciados son simbólicos: las comprobaciones van en forma
 * adimensional o con los valores nuestros que declara cada pregunta, y esos
 * mismos valores se escriben aquí.
 */
import { describe, expect, it } from 'vitest';
import { convocatoria } from './corpus';
import { deriva, deriva2, integra, raiz } from './numerico';
import { escalar, productoVectorial, resuelve } from './lineal';

const cuadra = convocatoria('mecanica-aplicada', '2018-2019-2c-ext');

describe('1 · las componentes intrínsecas de la aceleración', () => {
  const id = 'exma1819-2cext-1-las-componentes-intrinsecas-de-la-aceleracion';

  /* Valores de la pregunta: una circunferencia de 2 m de radio recorrida con
     s = t³, en t = 1 s. La posición en cartesianas, derivada dos veces. */
  const R = 2;
  const x = (t: number) => R * Math.cos(t ** 3 / R);
  const y = (t: number) => R * Math.sin(t ** 3 / R);
  const t = 1;
  const v = [deriva(x, t), deriva(y, t)];
  const a = [deriva2(x, t), deriva2(y, t)];
  const rapidez = Math.hypot(v[0], v[1]);
  const et = v.map((c) => c / rapidez);
  const at = a[0] * et[0] + a[1] * et[1];
  const an = Math.hypot(a[0] - at * et[0], a[1] - at * et[1]);

  it('la tangencial, proyectando la aceleración sobre la velocidad', () =>
    cuadra.magnitud(id, 'La componente tangencial', at, 'm/s^2'));
  it('y la normal, lo que queda perpendicular a la velocidad', () =>
    cuadra.magnitud(id, 'La componente normal', an, 'm/s^2'));
});

describe('2 · la energía cinética de un sólido rígido', () => {
  const id = 'exma1819-2cext-2-la-energia-cinetica-de-un-solido-rigido';

  /* La varilla de la pregunta: 3 kg y 2 m, centrada en G y a 45° entre los
     ejes x e y, con ω = (3, 1, 0) rad/s y G avanzando a 2 m/s. Se parte en N
     masas iguales, a lo largo de la varilla. */
  const [M, l, N] = [3, 2, 20000];
  const u = [Math.SQRT1_2, Math.SQRT1_2, 0];
  const w = [3, 1, 0];
  const vG = [2, 0, 0];
  const mi = M / N;
  const puntos = Array.from({ length: N }, (_, i) => u.map((c) => c * (-l / 2 + ((i + 0.5) * l) / N)));

  let Tr = 0;
  let T = 0;
  let [Ix, Iy, Iz, Ixy] = [0, 0, 0, 0];
  for (const r of puntos) {
    const wr = productoVectorial(w, r);
    Tr += 0.5 * mi * escalar(wr, wr);
    const vi = vG.map((c, k) => c + wr[k]);
    T += 0.5 * mi * escalar(vi, vi);
    Ix += mi * (r[1] ** 2 + r[2] ** 2);
    Iy += mi * (r[0] ** 2 + r[2] ** 2);
    Iz += mi * (r[0] ** 2 + r[1] ** 2);
    Ixy += mi * r[0] * r[1];
  }

  it('los momentos y el producto de inercia que da la pregunta son los de esa varilla', () => {
    expect(Ix).toBeCloseTo(0.5, 6);
    expect(Iy).toBeCloseTo(0.5, 6);
    expect(Iz).toBeCloseTo(1, 6);
    expect(Ixy).toBeCloseTo(0.5, 6);
  });
  it('la energía de rotación, sumando ½·m·|ω × r′|² punto a punto', () =>
    cuadra.magnitud(id, 'La energía de rotación', Tr, 'J'));
  it('y la total, con la velocidad absoluta de cada punto, sin König', () =>
    cuadra.magnitud(id, 'La energía cinética total', T, 'J'));
});

describe('3 · el cuadrilátero articulado y sus reacciones', () => {
  const id = 'exma1819-2cext-3-el-cuadrilatero-articulado-y-sus-reacciones';

  /* La geometría de la figura: A = (0, 0), D = (L, 0), AB de L, BC de √2·L y
     CD de 2L. θ es el ángulo de AB desde la vertical en sentido horario, el
     de ω₁; en el instante del enunciado θ = 0. C sale de cortar la
     circunferencia de centro B y radio √2·L con la de centro D y radio 2L,
     por la rama de arriba. */
  const posicion = (theta: number, L: number) => {
    const B = [L * Math.sin(theta), L * Math.cos(theta)];
    const D = [L, 0];
    const [r1, r2] = [Math.SQRT2 * L, 2 * L];
    const [dx, dy] = [D[0] - B[0], D[1] - B[1]];
    const d = Math.hypot(dx, dy);
    const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
    const h = Math.sqrt(r1 * r1 - a * a);
    const P = [B[0] + (a * dx) / d, B[1] + (a * dy) / d];
    const C1 = [P[0] + (h * dy) / d, P[1] - (h * dx) / d];
    const C2 = [P[0] - (h * dy) / d, P[1] + (h * dx) / d];
    return { B, C: C1[1] > C2[1] ? C1 : C2, D };
  };

  /* Los ángulos de BC y de CD con el eje x, antihorario positivo, en
     función de θ. Sus derivadas, por diferencias, son las velocidades y
     aceleraciones angulares por unidad de ω₁ y de ω₁². */
  const L1 = 1;
  const fiBC = (th: number) => { const p = posicion(th, L1); return Math.atan2(p.C[1] - p.B[1], p.C[0] - p.B[0]); };
  const fiCD = (th: number) => { const p = posicion(th, L1); return Math.atan2(p.C[1] - p.D[1], p.C[0] - p.D[0]); };
  const dBC = deriva(fiBC, 0);
  const ddBC = deriva2(fiBC, 0);
  const dCD = deriva(fiCD, 0);
  const ddCD = deriva2(fiCD, 0);

  it('la figura se cierra: C queda en (L, 2L), encima de D', () => {
    const { C } = posicion(0, L1);
    expect(C[0]).toBeCloseTo(1, 12);
    expect(C[1]).toBeCloseTo(2, 12);
  });
  it('BC no gira en ese instante: es la opción buena del paso de reconocer', () =>
    expect(Math.abs(dBC)).toBeLessThan(1e-8));
  it('CD gira a ω₁/2, en sentido horario', () => {
    expect(dCD).toBeLessThan(0);
    cuadra(id, 'La velocidad angular de CD', -dCD);
  });
  /* α_BC = φ''·ω₁² + φ'·α₁, y como φ' es nula en este instante, en unidades
     de ω₁² queda φ'' sola: no depende de α₁. */
  it('BC acelera su giro con ω₁²/2, antihoraria y sin depender de α₁', () => {
    expect(ddBC).toBeGreaterThan(0);
    cuadra(id, 'La aceleración angular de BC', ddBC);
  });

  /* Valores nuestros, los que declaran las preguntas: ω₁ = 2 rad/s y
     α₁ = 6 rad/s², horarios, L = 1 m, m = 6 kg y g = 9,81 m/s². Con θ̇ = ω₁
     y θ̈ = α₁, la aceleración angular de CD es φ''·ω₁² + φ'·α₁. */
  const [m, L, w1, a1, g] = [6, 1, 2, 6, 9.81];
  const aCD = ddCD * w1 * w1 + dCD * a1;
  it('CD, con valores nuestros: 2 rad/s², horaria', () => {
    expect(aCD).toBeLessThan(0);
    cuadra(id, 'La aceleración angular de CD', Math.abs(aCD));
  });

  /* Las nueve ecuaciones de las tres barras. Incógnitas, en este orden: la
     fuerza del suelo sobre AB en A, la de AB sobre BC en B, la de CD sobre BC
     en C, la del suelo sobre CD en D, y el par M₀ sobre AB, horario positivo.
     AB y CD no tienen masa; BC sí, con su I_G integrada sobre su longitud y la
     aceleración de su centro sacada de derivar su posición. No se da por
     hecho que CD sea una biela: C_x es una incógnita más. */
  const reacciones = (omega: number, alfa: number, grav: number) => {
    const { B, C, D } = posicion(0, L);
    const G = [(B[0] + C[0]) / 2, (B[1] + C[1]) / 2];
    const Gx = (th: number) => { const p = posicion(th, L); return (p.B[0] + p.C[0]) / 2; };
    const Gy = (th: number) => { const p = posicion(th, L); return (p.B[1] + p.C[1]) / 2; };
    const aG = [
      deriva2(Gx, 0) * omega ** 2 + deriva(Gx, 0) * alfa,
      deriva2(Gy, 0) * omega ** 2 + deriva(Gy, 0) * alfa,
    ];
    const aBC = ddBC * omega ** 2 + dBC * alfa;
    const lon = Math.hypot(C[0] - B[0], C[1] - B[1]);
    const IG = integra((s) => (m / lon) * s * s, -lon / 2, lon / 2);
    const cruz = (r: number[], [fx, fy]: number[]) => r[0] * fy - r[1] * fx;
    // columnas: Ax Ay Bx By Cx Cy Dx Dy M0
    const A = [
      [1, 0, -1, 0, 0, 0, 0, 0, 0],
      [0, 1, 0, -1, 0, 0, 0, 0, 0],
      [0, 0, -cruz(B, [1, 0]), -cruz(B, [0, 1]), 0, 0, 0, 0, -1],
      [0, 0, 1, 0, 1, 0, 0, 0, 0],
      [0, 0, 0, 1, 0, 1, 0, 0, 0],
      [0, 0, cruz([B[0] - G[0], B[1] - G[1]], [1, 0]), cruz([B[0] - G[0], B[1] - G[1]], [0, 1]),
        cruz([C[0] - G[0], C[1] - G[1]], [1, 0]), cruz([C[0] - G[0], C[1] - G[1]], [0, 1]), 0, 0, 0],
      [0, 0, 0, 0, -1, 0, 1, 0, 0],
      [0, 0, 0, 0, 0, -1, 0, 1, 0],
      [0, 0, 0, 0, -cruz([C[0] - D[0], C[1] - D[1]], [1, 0]), -cruz([C[0] - D[0], C[1] - D[1]], [0, 1]), 0, 0, 0],
    ];
    const b = [0, 0, 0, m * aG[0], m * aG[1] + m * grav, IG * aBC, 0, 0, 0];
    const [, , Bx, By, Cx, Cy, , , M0] = resuelve(A, b);
    return { Bx, By, Cx, Cy, M0 };
  };

  const estaticas = reacciones(0, 0, g);
  const dinamicas = reacciones(w1, a1, 0);
  const todas = reacciones(w1, a1, g);

  it('las estáticas: vertical en B y en C, sin par y sin componente horizontal', () => {
    expect(Math.abs(estaticas.Bx)).toBeLessThan(1e-9);
    expect(Math.abs(estaticas.Cx)).toBeLessThan(1e-9);
    expect(Math.abs(estaticas.M0)).toBeLessThan(1e-9);
    expect(estaticas.By).toBeCloseTo(estaticas.Cy, 9);
  });
  it('la estática en C, en unidades de mg', () => cuadra(id, 'La reacción estática en C', estaticas.Cy / (m * g)));
  it('CD sale biela sin haberlo supuesto: la fuerza en C no tiene componente horizontal', () =>
    expect(Math.abs(dinamicas.Cx)).toBeLessThan(1e-6));
  it('la dinámica horizontal en B, hacia la derecha sobre BC', () => {
    expect(dinamicas.Bx).toBeGreaterThan(0);
    cuadra.magnitud(id, 'La reacción dinámica horizontal en B', dinamicas.Bx, 'N');
  });
  it('la dinámica vertical en C, hacia abajo sobre BC', () => {
    expect(dinamicas.Cy).toBeLessThan(0);
    cuadra.magnitud(id, 'La reacción dinámica vertical en C', Math.abs(dinamicas.Cy), 'N');
  });
  it('la dinámica vertical en B, hacia arriba sobre BC', () => {
    expect(dinamicas.By).toBeGreaterThan(0);
    cuadra.magnitud(id, 'La reacción dinámica vertical en B', dinamicas.By, 'N');
  });
  it('el par que exigen ω₁ y α₁, horario', () => {
    expect(dinamicas.M0).toBeGreaterThan(0);
    cuadra.magnitud(id, 'El par que exigen esos datos', dinamicas.M0, 'N*m');
  });
  it('y las totales son la suma de las dos partes, que es lo que permite separarlas', () => {
    expect(todas.By).toBeCloseTo(estaticas.By + dinamicas.By, 9);
    expect(todas.Cy).toBeCloseTo(estaticas.Cy + dinamicas.Cy, 9);
    expect(todas.M0).toBeCloseTo(estaticas.M0 + dinamicas.M0, 9);
  });
});

describe('4 · las dos barras y la deslizadera', () => {
  const id = 'exma1819-2cext-4-las-dos-barras-y-la-deslizadera';

  /* La coordenada es φ, el ángulo de BC por debajo de la horizontal. En la
     posición de partida el ángulo de AB no sirve —BC es perpendicular a la
     pista y C baja sin que AB gire—, y φ sí. C va por la pista, a L de A:
     L·sen θ + L·cos φ = L, con θ el giro horario de AB desde la vertical. */
  const mecanismo = (m: number, L: number, g: number) => {
    const theta = (p: number) => Math.asin(1 - Math.cos(p));
    const B = (p: number) => [L * Math.sin(theta(p)), L * Math.cos(theta(p))];
    const C = (p: number) => [L, L * Math.cos(theta(p)) - L * Math.sin(p)];
    const G = (p: number) => { const b = B(p); const c = C(p); return [(b[0] + c[0]) / 2, (b[1] + c[1]) / 2]; };
    const V = (p: number) => m * g * (B(p)[1] / 2 + G(p)[1]);
    const h = 1e-6;
    const der = (f: (p: number) => number, p: number) => (p < h ? (f(p + h) - f(p)) / h : (f(p + h) - f(p - h)) / (2 * h));
    const dth = (p: number) => der(theta, p);
    const dG = (p: number) => [der((q) => G(q)[0], p), der((q) => G(q)[1], p)];
    /* T = ½·J(φ)·φ̇², con AB girando alrededor de A y BC con su centro y su
       giro, que es φ̇. */
    const J = (p: number) => {
      const gp = dG(p);
      return ((m * L * L) / 3) * dth(p) ** 2 + m * (gp[0] ** 2 + gp[1] ** 2) + (m * L * L) / 12;
    };
    const dJ = (p: number) => (p < 1e-4 ? (J(p + 1e-5) - J(p)) / 1e-5 : (J(p + 1e-5) - J(p - 1e-5)) / 2e-5);
    const dV = (p: number) => der(V, p);
    const pFinal = raiz((p) => C(p)[1], 0.1, 1.5);
    return { theta, dth, J, dJ, V, dV, pFinal };
  };

  /* Adimensional: m = L = g = 1. */
  const uno = mecanismo(1, 1, 1);
  it('el giro de AB hasta que C llega a la altura de A, en radianes', () =>
    cuadra(id, 'El trabajo del par', uno.theta(uno.pFinal)));
  it('BC gira al final igual de deprisa que AB, como dice el centro instantáneo en A', () =>
    expect(uno.dth(uno.pFinal)).toBeCloseTo(1, 6));
  it('la energía cinética final, en unidades de mL²ω²', () => {
    const pPunto = 1 / uno.dth(uno.pFinal); // con ω = 1
    cuadra(id, 'La energía cinética final', 0.5 * uno.J(uno.pFinal) * pPunto ** 2);
  });
  it('el trabajo de los pesos, integrando su fuerza generalizada por el camino', () =>
    cuadra(id, 'El trabajo de los pesos', integra((p) => -uno.dV(p), 0, uno.pFinal)));

  /* Valores nuestros de la pregunta: m = 2 kg, L = 1 m, ω = 4 rad/s y
     g = 9,81 m/s². La ecuación de Lagrange, J·φ̈ + ½·J'·φ̇² = M₀·θ' − V', se
     integra en el tiempo con Runge-Kutta desde el reposo en φ = 0 hasta que C
     llega a la altura de A. */
  const nuestro = mecanismo(2, 1, 9.81);
  const llegada = (M0: number) => {
    const acc = (p: number, w: number) => (M0 * nuestro.dth(p) - nuestro.dV(p) - 0.5 * nuestro.dJ(p) * w * w) / nuestro.J(p);
    let [p, w] = [0, 0];
    const dt = 2e-5;
    for (let i = 0; i < 1e6; i++) {
      const k1p = w;
      const k1w = acc(p, w);
      const k2p = w + (dt / 2) * k1w;
      const k2w = acc(p + (dt / 2) * k1p, w + (dt / 2) * k1w);
      const k3p = w + (dt / 2) * k2w;
      const k3w = acc(p + (dt / 2) * k2p, w + (dt / 2) * k2w);
      const k4p = w + dt * k3w;
      const k4w = acc(p + dt * k3p, w + dt * k3w);
      const pn = p + (dt / 6) * (k1p + 2 * k2p + 2 * k3p + k4p);
      const wn = w + (dt / 6) * (k1w + 2 * k2w + 2 * k3w + k4w);
      if (pn >= nuestro.pFinal) {
        const s = (nuestro.pFinal - p) / (pn - p);
        return { omegaAB: nuestro.dth(nuestro.pFinal) * (w + s * (wn - w)), t: (i + s) * dt };
      }
      [p, w] = [pn, wn];
    }
    throw new Error('C no llega a la altura de A');
  };
  /* ω² al llegar es lineal en M₀, así que la secante converge en dos
     pasos; se dan cuatro por si acaso. */
  const objetivo = (M0: number) => llegada(M0).omegaAB ** 2 - 16;
  let [a, b] = [0, 20];
  let [fa, fb] = [objetivo(a), objetivo(b)];
  for (let k = 0; k < 4 && Math.abs(fb) > 1e-9; k++) {
    const c = b - (fb * (b - a)) / (fb - fa);
    [a, fa] = [b, fb];
    [b, fb] = [c, objetivo(c)];
  }
  const M0 = b;

  it('el par que, integrando el movimiento, deja AB a 4 rad/s al llegar', () =>
    cuadra.magnitud(id, 'El par con valores nuestros', M0, 'N*m'));
  it('y C llega a la altura de A a los 0,39 s, como dice la resolución', () =>
    expect(Math.round(llegada(M0).t * 100) / 100).toBe(0.39));
});
