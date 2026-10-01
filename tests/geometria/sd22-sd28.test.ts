import { describe, expect, it } from 'vitest';
import {
  PT_MM,
  abatido,
  abatidoJunto,
  anguloPlanoConPH,
  anguloRectas,
  cambioPlano,
  corteRectaPlano,
  distanciaAPlano,
  distanciaARecta,
  gira,
  horizontalPor,
  pieEnRecta,
  plano,
  poligonoRegular,
  proyAlzado,
  proyPlanta,
  punto3,
  puntoEnPlanoDesdeAlzado,
  puntosADistancia,
  rectaDesdeProyecciones,
  rectaPorPuntos,
  simetrico,
  vm,
  vmAlzado,
  vmPlanta,
  type P2,
  type P3,
  type Recta2,
  type Recta3,
} from '../../src/lib/diedrico';

/* SD22 y SD28 · los Ejercicios 17 y 21 de la colección de diédrico directo
   (Dpto. de Expresión Gráfica y Proyectos de Ingeniería, EIG, UPV/EHU): el
   cuadrado con dos lados sobre las paralelas r y s, por cambio de plano y por
   abatimiento, y el triángulo equilátero de centro O y vértice D en el plano
   ABC, por cambio de plano, abatimiento y giros. Las láminas son
   `src/content/laminas/sd22.json` y `sd28.json`, sacadas de los trazos
   vectoriales del PDF.

   Las cifras esperadas se sacaron el 1 de octubre de 2026 por un segundo
   camino, sin lib/diedrico: álgebra de vectores sobre las coordenadas de las
   láminas, con los cambios de plano llevando cotas y distancias a la línea
   nueva, los abatimientos con el triángulo de las diapositivas, los giros como
   giros planos de cada vista y el triángulo equilátero girando D₀ 120° en su
   verdadera magnitud, en 2D. Aquí se cotejan con lib/diedrico, y se comprueba
   lo que ninguna de las dos cuentas puede fingir: que cada método conserva las
   longitudes y que todos dan la misma figura.

   Los puntos se comparan a 0,05 pt (0,02 mm). En SD22 el segundo camino toma S
   sobre s₁ y la receta sobre el plano de r y s; r y s son paralelas a 0,01°,
   el redondeo del PDF, y eso los separa hasta 0,02 pt. Las longitudes, a la
   milésima de mm. */

const mm = (v: number) => v * PT_MM;
const d2 = (a: P2, b: P2) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const pl = (P: P3) => proyPlanta(P);
const al = (P: P3) => proyAlzado(P);
const cerca = (p: P2, x: number, y: number, tol = 0.05) => {
  expect(Math.abs(p[0] - x), `x ${p[0]} frente a ${x}`).toBeLessThanOrEqual(tol);
  expect(Math.abs(p[1] - y), `y ${p[1]} frente a ${y}`).toBeLessThanOrEqual(tol);
};
const recta2 = (a: P2, b: P2): Recta2 => ({ p: a, d: [b[0] - a[0], b[1] - a[1]] });

describe('SD22 · el cuadrado con dos lados sobre r y s', () => {
  const A = punto3([173.64, 294.84], [173.64, 394.08]);
  const r = rectaDesdeProyecciones([[108.24, 294.84], [188.4, 156.0]], [[99.48, 378.0], [243.24, 294.96]]);
  const s = rectaDesdeProyecciones([[173.64, 294.84], [237.48, 184.32]], [[124.92, 422.16], [269.04, 339.0]]);
  const cotaA = plano(A, punto3([223.64, 294.84], [223.64, 394.08]), punto3([173.64, 294.84], [173.64, 444.08]));
  const R = corteRectaPlano(r, cotaA);
  const D = pieEnRecta(A, r);
  const rs = plano(A, R, D);
  const S = puntoEnPlanoDesdeAlzado([237.48, 184.32], rs);
  const lado = vm(A, D);
  const [B, Bmal] = puntosADistancia(s, A, lado);
  const C = simetrico(A, { x: (B.x + D.x) / 2, y: (B.y + D.y) / 2, z: (B.z + D.z) / 2 });
  const V = { A, B, C, D };
  type K = keyof typeof V;
  const lados = (fig: Record<K, P2>) => {
    for (const k of ['AB', 'BC', 'CD', 'DA'] as const) expect(mm(d2(fig[k[0] as K], fig[k[1] as K]))).toBeCloseTo(mm(lado), 3);
    /* la diagonal, a la centésima: r y s se separan 0,01° de paralelas, y el
       ángulo en A sale de 90,01° */
    expect(mm(d2(fig.A, fig.C))).toBeCloseTo(mm(lado) * Math.SQRT2, 2);
  };

  it('r y s son paralelas, A está en s, y el plano es oblicuo, a 63,7° del horizontal', () => {
    expect(anguloRectas(r, s)).toBeLessThan(0.02);
    expect(distanciaARecta(A, s)).toBeLessThan(0.05);
    expect(anguloPlanoConPH(rs)).toBeCloseTo(63.66, 1);
    /* R, el punto de r con la cota de A, es el extremo de abajo de r₂ */
    cerca(al(R), 108.24, 294.84);
    cerca(pl(R), 108.24, 372.94);
    cerca(pl(S), 237.48, 357.211);
  });

  it('el lado es la distancia real entre r y s, y A es el vértice de menor cota', () => {
    expect(mm(lado)).toBeCloseTo(22.5094, 3);
    cerca(pl(D), 120.514, 365.85);
    cerca(al(D), 120.514, 273.582);
    cerca(pl(B), 204.301, 376.372);
    cerca(al(B), 204.301, 241.759);
    cerca(pl(C), 151.175, 348.143);
    cerca(al(C), 151.175, 220.501);
    for (const Q of [B, C, D]) expect(Q.z).toBeGreaterThan(A.z);
    /* el otro lado de A sobre s dejaría B por debajo de A */
    expect(Bmal.z).toBeLessThan(A.z);
    expect(distanciaARecta(C, r)).toBeLessThan(0.05);
    expect(distanciaAPlano(C, rs)).toBeLessThan(0.05);
  });

  describe('1 · dos cambios de plano, con A de referencia en los dos', () => {
    const l1 = recta2([274.0, 441.23], [299.84, 361.31]);
    const l2 = recta2([275.18, 509.25], [428.51, 486.55]);
    const v4 = (Q: P3) => cambioPlano(Q, 'vertical', l1, A);
    const v5 = (Q: P3) => cambioPlano(Q, 'vertical', l1, A, l2);
    it('la vista 4 es el canto: A₄ ≡ R₄ en la línea nueva y S₄ a 39 mm', () => {
      cerca(v4(A), 278.303, 427.92);
      cerca(v4(R), 278.302, 427.925);
      cerca(v4(S), 400.298, 409.854);
      /* S₄ se aparta de la línea nueva lo que S está más alto que A */
      const q = v4(S);
      const fuera = Math.abs((q[0] - l1.p[0]) * l1.d[1] - (q[1] - l1.p[1]) * l1.d[0]) / Math.hypot(l1.d[0], l1.d[1]);
      expect(mm(fuera)).toBeCloseTo(mm(S.z - A.z), 2);
      expect(mm(S.z - A.z)).toBeCloseTo(38.99, 2);
      for (const [Q, x, y] of [[B, 336.895, 419.243], [C, 360.358, 415.776], [D, 301.766, 424.454]] as const) cerca(v4(Q), x, y);
    });
    it('la vista 5 es la verdadera magnitud: el cuadrado, con sus lados y su diagonal', () => {
      cerca(v5(A), 290.019, 507.053);
      cerca(v5(S), 404.779, 440.123);
      cerca(v5(R), 300.082, 575.044);
      cerca(v5(B), 345.136, 474.908);
      cerca(v5(C), 377.273, 530.03);
      cerca(v5(D), 322.155, 562.176);
      lados({ A: v5(A), B: v5(B), C: v5(C), D: v5(D) });
    });
  });

  describe('2 · abatimiento con la horizontal por A de charnela', () => {
    const hA = rectaPorPuntos(R, A);
    it('la charnela es la horizontal de A, y pasa por R', () => {
      const h = horizontalPor(A, rs);
      expect(anguloRectas(h, hA)).toBeLessThan(1e-6);
    });
    it('S abatido a los dos lados, con el radio del triángulo', () => {
      const [S1, S2] = abatido(S, hA, rs);
      cerca(pl(S1), 182.719, 526.621);
      cerca(pl(S2), 258.581, 291.93);
      expect(mm(d2(pl(S1), pl(S2)) / 2)).toBeCloseTo(43.506, 2);
    });
    it('el cuadrado abatido, a los dos lados, tiene los lados de verdad; Bmal cae al otro lado de la charnela', () => {
      const esperado = [
        { B: [178.001, 457.737], C: [114.343, 462.088], D: [109.982, 398.431], Bmal: [169.279, 330.423] },
        { B: [214.436, 345.019], C: [165.369, 304.231], D: [124.573, 353.292], Bmal: [132.844, 443.141] },
      ];
      abatido(S, hA, rs).forEach((Sab, i) => {
        const ab = (Q: P3) => pl(abatidoJunto(Q, hA, rs, Sab, S));
        const fig = { A: pl(A), B: ab(B), C: ab(C), D: ab(D) };
        for (const k of ['B', 'C', 'D'] as const) cerca(fig[k], esperado[i][k][0], esperado[i][k][1]);
        cerca(ab(Bmal), esperado[i].Bmal[0], esperado[i].Bmal[1]);
        lados(fig);
      });
    });
  });

  it('la cifra del calcular y sus distractores', () => {
    expect(mm(lado)).toBeCloseTo(22.5094, 3);
    expect(mm(vmPlanta(A, D))).toBeCloseTo(21.2234, 3);
    expect(mm(vmAlzado(A, D))).toBeCloseTo(20.1866, 3);
    expect(mm(vm(A, R))).toBeCloseTo(24.2471, 3);
  });
});

describe('SD28 · el triángulo equilátero de centro O, por los tres métodos', () => {
  const A = punto3([276, 294.48], [276, 402.12]);
  const B = punto3([360.48, 173.88], [360.48, 464.52]);
  const C = punto3([451.32, 237.48], [451.68, 345.0]);
  const abc = plano(A, B, C);
  const O = puntoEnPlanoDesdeAlzado([360.48, 230.52], abc);
  const D = puntoEnPlanoDesdeAlzado([391.68, 237.72], abc);
  const [, E, F] = poligonoRegular(abc, O, D, 3);
  const V = { D, E, F };
  type K = keyof typeof V;
  const lados = (fig: Record<K, P2>) => {
    for (const k of ['DE', 'EF', 'FD'] as const) expect(mm(d2(fig[k[0] as K], fig[k[1] as K]))).toBeCloseTo(25.5333, 3);
  };

  it('O y D, con sus plantas sacadas del plano; D, en la horizontal por C', () => {
    cerca(pl(O), 360.48, 409.899);
    cerca(pl(D), 391.68, 383.05);
    expect(distanciaARecta(D, horizontalPor(C, abc))).toBeLessThan(0.5);
    expect(anguloPlanoConPH(abc)).toBeCloseTo(50.8899, 3);
  });

  it('el triángulo: E, el de más cota, y F; lados de 25,53 mm y radio de 14,74', () => {
    cerca(pl(E), 363.627, 437.766);
    cerca(al(E), 363.627, 199.541);
    cerca(pl(F), 326.133, 408.882);
    cerca(al(F), 326.133, 254.299);
    expect(E.z).toBeGreaterThan(F.z);
    expect(mm(vm(O, D))).toBeCloseTo(14.7416, 3);
    for (const [P, Q] of [[D, E], [E, F], [F, D]] as const) expect(mm(vm(P, Q))).toBeCloseTo(25.5333, 3);
  });

  describe('1 · dos cambios de plano, con A de referencia en el primero y O en el segundo', () => {
    const l1 = recta2([248.47, 405.45], [314.09, 508.3]);
    const l2 = recta2([171.21, 429.71], [141.44, 519.47]);
    const v4 = (Q: P3) => cambioPlano(Q, 'vertical', l1, A);
    const v5 = (Q: P3) => cambioPlano(Q, 'vertical', l1, A, l2, O);
    it('la vista 4 es el canto: A₄B₄, con O₄ y D₄ en él', () => {
      cerca(v4(A), 254.925, 415.567);
      cerca(v4(B), 205.99, 563.087);
      cerca(v4(O), 228.972, 493.804);
      cerca(v4(D), 231.893, 484.996);
      const [a, b] = [v4(A), v4(B)];
      for (const Q of [O, D, E, F]) {
        const q = v4(Q);
        expect(Math.abs((q[0] - a[0]) * (b[1] - a[1]) - (q[1] - a[1]) * (b[0] - a[0])) / d2(a, b)).toBeLessThan(0.01);
      }
    });
    it('la vista 5 es la verdadera magnitud, con O₅ en la línea nueva y E, el de más cota, abajo', () => {
      cerca(v5(O), 157.783, 470.193);
      /* O es la referencia del segundo cambio: O₅ cae en la segunda línea nueva */
      const o5 = v5(O);
      expect(Math.abs((o5[0] - l2.p[0]) * l2.d[1] - (o5[1] - l2.p[1]) * l2.d[0]) / Math.hypot(l2.d[0], l2.d[1])).toBeLessThan(0.01);
      /* la cota crece de A₄ a B₄, hacia abajo de la hoja: E₅ queda por debajo de F₅ */
      expect(v5(B)[1]).toBeGreaterThan(v5(A)[1]);
      expect(v5(E)[1]).toBeGreaterThan(v5(F)[1]);
      cerca(v5(D), 122.032, 448.56);
      cerca(v5(E), 156.924, 511.972);
      cerca(v5(F), 194.394, 450.048);
      expect(mm(d2(v5(O), v5(D)))).toBeCloseTo(14.7416, 3);
      lados({ D: v5(D), E: v5(E), F: v5(F) });
    });
  });

  describe('2 · abatimiento con la horizontal por B de charnela', () => {
    const hB = horizontalPor(B, abc);
    const esperado = [
      { O: [424.509, 510.255], D: [463.849, 496.163], E: [392.635, 483.233], F: [417.044, 551.371] },
      { O: [345.985, 387.181], D: [375.342, 357.443], E: [357.06, 427.474], F: [305.553, 376.625] },
    ];
    it('a los dos lados, el triángulo abatido es el equilátero, y E es el más cercano a la charnela', () => {
      abatido(O, hB, abc).forEach((Oab, i) => {
        const ab = (Q: P3) => pl(abatidoJunto(Q, hB, abc, Oab, O));
        const fig = { O: pl(Oab), D: ab(D), E: ab(E), F: ab(F) };
        for (const k of ['O', 'D', 'E', 'F'] as const) cerca(fig[k], esperado[i][k][0], esperado[i][k][1]);
        lados(fig);
        expect(distanciaARecta(abatidoJunto(E, hB, abc, Oab, O), hB)).toBeLessThan(distanciaARecta(abatidoJunto(F, hB, abc, Oab, O), hB));
      });
    });
    it('la horizontal por C no conviene de charnela: O está a 3 mm de ella', () => {
      expect(mm(distanciaARecta(O, horizontalPor(C, abc)))).toBeCloseTo(3.16, 2);
    });
  });

  describe('3 · dos giros: eje vertical por C y eje de punta por A′', () => {
    const vertical: Recta3 = { p: C, d: { x: 0, y: 0, z: -1 } };
    const punta: Recta3 = { p: C, d: { x: 0, y: 1, z: 0 } };
    const g1 = anguloRectas(horizontalPor(C, abc), punta);
    const G = (Q: P3) => gira(Q, vertical, g1);
    it('el primer giro, de 57,46°, deja la horizontal por C de punta, con D₁′ debajo de C₁, y el plano de canto', () => {
      expect(g1).toBeCloseTo(57.4612, 3);
      cerca(pl(G(D)), 451.485, 416.048);
      /* D₁′ en la vertical de C₁, y debajo */
      expect(Math.abs(pl(G(D))[0] - pl(C)[0])).toBeLessThan(0.5);
      expect(pl(G(D))[1]).toBeGreaterThan(pl(C)[1]);
      /* el otro sentido, 122,5°, lo deja encima, metido en el alzado */
      expect(pl(gira(D, vertical, g1 - 180))[1]).toBeLessThan(pl(C)[1]);
      cerca(pl(G(O)), 457.338, 456.792);
      cerca(pl(G(A)), 405.341, 523.826);
      cerca(al(G(O)), 457.338, 230.52);
      cerca(pl(G(E)), 482.523, 469.128);
      cerca(pl(G(F)), 438.007, 485.2);
      expect(Math.abs(plano(G(A), G(B), C).n.y)).toBeLessThan(1e-3);
    });
    it('el segundo, de eje de punta por A′, lleva el canto al plano horizontal de A: los dos sentidos valen', () => {
      const Ag = G(A);
      const puntaA: Recta3 = { p: Ag, d: { x: 0, y: -1, z: 0 } };
      const canto = plano(Ag, G(B), C);
      const esperado = [
        { O: [487.77, 456.792], D: [478.491, 416.048], E: [527.695, 469.128], F: [457.124, 485.2] },
        { O: [322.911, 456.792], D: [332.19, 416.048], E: [282.986, 469.128], F: [353.557, 485.2] },
      ];
      abatido(G(O), puntaA, canto).forEach((Ogg, i) => {
        const gg = (Q: P3) => abatidoJunto(G(Q), puntaA, canto, Ogg, G(O));
        const fig = { O: pl(Ogg), D: pl(gg(D)), E: pl(gg(E)), F: pl(gg(F)) };
        for (const k of ['O', 'D', 'E', 'F'] as const) cerca(fig[k], esperado[i][k][0], esperado[i][k][1]);
        for (const Q of [D, E, F]) expect(gg(Q).z).toBeCloseTo(A.z, 6);
        lados(fig);
        /* E, el de más cota, queda más lejos del eje */
        expect(Math.abs(fig.E[0] - pl(Ag)[0])).toBeGreaterThan(Math.abs(fig.F[0] - pl(Ag)[0]));
      });
      /* el mismo punto que con gira(): 50,89° hacia un lado o 129,11° hacia el otro */
      const conGira = [50.8899, -129.1101].flatMap((a) => [gira(G(O), puntaA, a), gira(G(O), puntaA, -a)]);
      for (const X of abatido(G(O), puntaA, canto)) expect(Math.min(...conGira.map((Y) => vm(X, Y)))).toBeLessThan(0.01);
    });
  });

  it('la cifra del calcular y sus distractores', () => {
    expect(mm(vm(D, E))).toBeCloseTo(25.5333, 3);
    expect(mm(vm(O, D))).toBeCloseTo(14.7416, 3);
    expect(mm(vmPlanta(D, E))).toBeCloseTo(21.6919, 3);
    expect(mm(vmAlzado(D, E))).toBeCloseTo(16.7138, 3);
  });
});
