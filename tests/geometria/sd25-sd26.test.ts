import { describe, expect, it } from 'vitest';
import {
  PT_MM,
  abatido,
  abatidoJunto,
  anguloPlanoConPH,
  anguloRectas,
  cambioPlano,
  distanciaAPlano,
  gira,
  plano,
  proyAlzado,
  proyPlanta,
  punto3,
  rectaPorPuntos,
  vm,
  vmAlzado,
  vmPlanta,
  type P2,
  type P3,
  type Recta2,
  type Recta3,
} from '../../src/lib/diedrico';

/* SD25 y SD26 · los Ejercicios 19 y 20 de la colección de diédrico directo
   (Dpto. de Expresión Gráfica y Proyectos de Ingeniería, EIG, UPV/EHU): la
   verdadera magnitud de un plano por abatimiento, cambio de plano y giro.
   Las láminas son `src/content/laminas/sd25.json` y `sd26.json`, sacadas de
   los trazos vectoriales del PDF.

   Las cifras esperadas se sacaron el 1 de octubre de 2026 por un segundo
   camino, sin lib/diedrico: álgebra de vectores sobre las coordenadas de las láminas, con los
   abatimientos hechos con el triángulo de las diapositivas, los cambios de
   plano llevando cotas y distancias a la línea nueva, y los giros como giros
   planos de cada vista. Aquí se cotejan con lib/diedrico, y se comprueba lo
   que ninguna de las dos cuentas puede fingir: que cada método conserva las
   longitudes, y que los tres dan la misma figura. Las longitudes se comparan
   a la milésima de pt: los vértices de las láminas están en su plano a menos
   de 0,07 pt (el redondeo del PDF), y abatir o girar un punto que se aparta
   así del plano mueve sus distancias unas cienmilésimas. */

const mm = (v: number) => v * PT_MM;
const d2 = (a: P2, b: P2) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const pl = (P: P3) => proyPlanta(P);
const al = (P: P3) => proyAlzado(P);
const cerca = (p: P2, x: number, y: number) => {
  expect(p[0]).toBeCloseTo(x, 2);
  expect(p[1]).toBeCloseTo(y, 2);
};
const recta2 = (a: P2, b: P2): Recta2 => ({ p: a, d: [b[0] - a[0], b[1] - a[1]] });

describe('SD25 · tres caras de un bloque cortado', () => {
  const P = (x: number, ya: number, yp: number) => punto3([x, ya], [x, yp]);
  const A = P(165.36, 306.84, 393.8);
  const B = P(207.84, 306.84, 351.32);
  const C = P(292.8, 221.76, 351.32);
  const D = P(292.8, 179.28, 393.8);
  const E = P(250.32, 179.28, 436.4);
  const F = P(165.36, 264.24, 436.4);
  const G = P(250.32, 179.28, 464.72);
  const H = P(165.36, 306.84, 436.4);
  const J = P(292.8, 306.84, 478.88);
  const K = P(292.8, 179.28, 478.88);
  const alfa = plano(A, B, D);
  const beta = plano(F, E, G);
  const delta = plano(H, J, K);

  it('los tres planos: α oblicuo, β de canto, δ vertical', () => {
    for (const Q of [C, E, F]) expect(distanciaAPlano(Q, alfa)).toBeLessThan(0.1);
    expect(anguloPlanoConPH(alfa)).toBeCloseTo(54.761, 2);
    expect(Math.abs(beta.n.y)).toBeLessThan(1e-9);
    expect(Math.abs(delta.n.z)).toBeLessThan(1e-9);
    for (const Q of [F, G]) expect(distanciaAPlano(Q, delta)).toBeLessThan(1e-9);
  });

  describe('a) α abatido con la charnela AB', () => {
    const ab = rectaPorPuntos(A, B);
    const [C1, C2] = abatido(C, ab, alfa);
    it('C abatido cae donde lo deja el triángulo, a los dos lados', () => {
      cerca(pl(C1), 323.967, 382.487);
      cerca(pl(C2), 176.673, 235.193);
    });
    it('D, E y F con el mismo giro: los dos hexágonos abatidos tienen los lados y las diagonales de verdad', () => {
      const esperado = [
        { C: [323.967, 382.487], D: [339.516, 440.516], E: [297.01, 483.09], F: [180.953, 451.993] },
        { C: [176.673, 235.193], D: [118.644, 219.644], E: [76.07, 262.15], F: [107.167, 378.207] },
      ];
      [C1, C2].forEach((Cab, i) => {
        const ab3 = { A, B, C: Cab, D: abatidoJunto(D, ab, alfa, Cab, C), E: abatidoJunto(E, ab, alfa, Cab, C), F: abatidoJunto(F, ab, alfa, Cab, C) };
        for (const k of ['C', 'D', 'E', 'F'] as const) cerca(pl(ab3[k]), esperado[i][k][0], esperado[i][k][1]);
        const V = { A, B, C, D, E, F };
        for (const s of ['AB', 'BC', 'CD', 'DE', 'EF', 'FA', 'BE', 'CF', 'AD']) {
          const [p, q] = [s[0], s[1]] as (keyof typeof V)[];
          expect(d2(pl(ab3[p]), pl(ab3[q]))).toBeCloseTo(vm(V[p], V[q]), 3);
        }
      });
    });
    it('los radios: la hipotenusa de lo que dista en la planta y de la cota', () => {
      const radio = (Q: P3) => d2(pl(abatido(Q, ab, alfa)[0]), pl(abatido(Q, ab, alfa)[1])) / 2;
      expect(mm(radio(C))).toBeCloseTo(36.7426, 3);
      expect(mm(radio(D))).toBeCloseTo(55.0967, 3);
      expect(mm(radio(E))).toBeCloseTo(55.1139, 3);
      expect(mm(radio(F))).toBeCloseTo(18.4059, 3);
    });
  });

  describe('b) β por un cambio de plano horizontal', () => {
    const nueva = recta2([114.48, 255], [240.48, 129]);
    const [F4, E4, G4] = [F, E, G].map((Q) => cambioPlano(Q, 'horizontal', nueva, F));
    it('F₄ y E₄ en la línea nueva, G₄ a 10 mm por fuera', () => {
      cerca(F4, 135.3, 234.18);
      cerca(E4, 220.26, 149.22);
      cerca(G4, 200.235, 129.195);
    });
    it('el triángulo de la vista nueva es β en verdadera magnitud, recto en E', () => {
      expect(mm(d2(F4, E4))).toBeCloseTo(42.3868, 3);
      expect(mm(d2(E4, G4))).toBeCloseTo(9.9907, 3);
      expect(mm(d2(G4, F4))).toBeCloseTo(43.5483, 3);
      expect(d2(G4, F4)).toBeCloseTo(vm(G, F), 6);
    });
  });

  describe('c) δ girada alrededor de la arista HF hasta quedar frontal', () => {
    const eje: Recta3 = rectaPorPuntos(H, F);
    const giro = -(Math.atan2(J.y - H.y, J.x - H.x) * 180) / Math.PI;
    const [Gg, Kg, Jg] = [G, K, J].map((Q) => gira(Q, eje, giro));
    it('el giro es de 18,43°, y deja la planta de δ horizontal con J a la derecha', () => {
      expect(Math.abs(giro)).toBeCloseTo(18.4349, 3);
      cerca(pl(Gg), 254.916, 436.4);
      cerca(pl(Kg), 299.694, 436.4);
      expect(Jg.y).toBeCloseTo(H.y, 6);
      expect(Gg.z).toBeCloseTo(G.z, 9);
    });
    it('el alzado de δ girada es su verdadera magnitud', () => {
      const V2 = { H: al(H), J: al(Jg), K: al(Kg), G: al(Gg), F: al(F) };
      const V3 = { H, J, K, G, F };
      for (const s of ['HJ', 'JK', 'KG', 'GF', 'FH']) {
        const [p, q] = [s[0], s[1]] as (keyof typeof V3)[];
        expect(d2(V2[p], V2[q])).toBeCloseTo(vm(V3[p], V3[q]), 6);
      }
      expect(mm(d2(V2.H, V2.J))).toBeCloseTo(47.3899, 3);
      expect(mm(d2(V2.K, V2.G))).toBeCloseTo(15.7966, 3);
    });
    it('girar hacia el otro lado también la deja frontal, pero lleva J₁ a x = 31, pegado al marco de la hoja y fuera de la lámina', () => {
      expect(pl(gira(J, eje, giro + 180))[0]).toBeCloseTo(31.026, 2);
    });
  });

  it('las dos cifras del calcular y sus distractores', () => {
    expect(mm(vm(B, E))).toBeCloseTo(56.1291, 3);
    expect(mm(vmPlanta(B, E))).toBeCloseTo(33.5476, 3);
    expect(mm(vmAlzado(B, E))).toBeCloseTo(47.4301, 3);
    expect(mm(vm(F, G))).toBeCloseTo(43.5483, 3);
    expect(mm(vmPlanta(F, G))).toBeCloseTo(31.5933, 3);
    expect(mm(vmAlzado(F, G))).toBeCloseTo(42.3868, 3);
  });
});

describe('SD26 · el plano oblicuo ABCDEFGH por los tres métodos', () => {
  const P = (x: number, ya: number, yp: number) => punto3([x, ya], [x, yp]);
  const V = {
    A: P(192.72, 218.16, 374.04),
    B: P(223.8, 218.16, 327.36),
    C: P(255, 280.56, 327.36),
    D: P(161.52, 280.56, 467.64),
    E: P(130.32, 218.16, 467.64),
    F: P(161.52, 218.16, 420.84),
    G: P(130.32, 155.88, 420.84),
    H: P(161.52, 155.88, 374.04),
  };
  type K = keyof typeof V;
  const { C, D, E, G } = V;
  const abc = plano(C, D, E);
  const LADOS = ['AB', 'BC', 'CD', 'DE', 'EF', 'FG', 'GH', 'HA', 'CG', 'DG'];
  const comprueba = (fig: Record<K, P2>) => {
    for (const s of LADOS) {
      const [p, q] = [s[0], s[1]] as K[];
      expect(d2(fig[p], fig[q])).toBeCloseTo(vm(V[p], V[q]), 3);
    }
  };

  it('los ocho vértices están en un plano oblicuo, a 67,4° del horizontal', () => {
    for (const Q of Object.values(V)) expect(distanciaAPlano(Q, abc)).toBeLessThan(0.05);
    expect(anguloPlanoConPH(abc)).toBeCloseTo(67.4088, 3);
  });

  describe('1 · dos cambios de plano, con C de referencia', () => {
    const l1 = recta2([246, 224], [312, 268]);
    const l2 = recta2([321.58, 279.49], [354.3, 112.66]);
    const v4 = Object.fromEntries(Object.entries(V).map(([k, Q]) => [k, cambioPlano(Q, 'vertical', l1, C)])) as Record<K, P2>;
    const v5 = Object.fromEntries(Object.entries(V).map(([k, Q]) => [k, cambioPlano(Q, 'vertical', l1, C, l2)])) as Record<K, P2>;
    it('la vista 4 es el canto: tres puntos en una recta, con las horizontales de punta', () => {
      cerca(v4.C, 299.935, 259.957);
      cerca(v4.A, 312.976, 193.655);
      cerca(v4.G, 325.923, 127.435);
      expect(d2(v4.A, v4.E)).toBeLessThan(0.1);
      expect(d2(v4.G, v4.H)).toBeLessThan(0.1);
      const [a, b] = [v4.C, v4.G];
      const fuera = Math.abs((v4.A[0] - a[0]) * (b[1] - a[1]) - (v4.A[1] - a[1]) * (b[0] - a[0])) / d2(a, b);
      expect(fuera).toBeLessThan(0.1);
    });
    it('la vista 5 es la verdadera magnitud', () => {
      cerca(v5.D, 489.887, 297.22);
      cerca(v5.E, 519.876, 234.23);
      cerca(v5.G, 494.649, 160.523);
      cerca(v5.B, 354.456, 201.777);
      comprueba(v5);
    });
  });

  describe('2 · abatimiento con la charnela CD', () => {
    const cd = rectaPorPuntos(C, D);
    const esperado = [
      { E: [95.683, 444.559], G: [61.133, 374.735], H: [92.328, 327.931], B: [189.163, 304.279] },
      { E: [208.168, 519.516], G: [285.911, 524.523], H: [317.098, 477.714], B: [301.648, 379.236] },
    ];
    it('a los dos lados, el octógono abatido es la verdadera magnitud', () => {
      abatido(E, cd, abc).forEach((Eab, i) => {
        const fig = Object.fromEntries(
          Object.entries(V).map(([k, Q]) => [k, k === 'C' || k === 'D' ? pl(Q) : pl(k === 'E' ? Eab : abatidoJunto(Q, cd, abc, Eab, E))]),
        ) as Record<K, P2>;
        for (const k of ['E', 'G', 'H', 'B'] as const) cerca(fig[k], esperado[i][k][0], esperado[i][k][1]);
        comprueba(fig);
      });
    });
  });

  describe('3 · dos giros con los ejes por C', () => {
    const vertical: Recta3 = { p: C, d: { x: 0, y: 0, z: -1 } };
    const punta: Recta3 = { p: C, d: { x: 0, y: 1, z: 0 } };
    const g1 = anguloRectas(rectaPorPuntos(C, D), punta);
    const V1 = Object.fromEntries(Object.entries(V).map(([k, Q]) => [k, gira(Q, vertical, g1)])) as Record<K, P3>;
    it('el primer giro, de 33,68°, deja CD de punta con D₁ debajo de C₁, y el plano de canto', () => {
      expect(g1).toBeCloseTo(33.6788, 3);
      cerca(pl(V1.D), 255, 495.933);
      cerca(pl(V1.G), 203.084, 474.29);
      cerca(al(V1.G), 203.084, 155.88);
      const canto = plano(V1.D, V1.E, V1.G);
      /* de canto: perpendicular al plano vertical, con la holgura de la lámina */
      expect(Math.abs(canto.n.y)).toBeLessThan(1e-3);
    });
    it('el segundo, de eje de punta, es el abatimiento del canto con esa charnela: los dos sentidos valen', () => {
      const canto = plano(V1.D, V1.E, V1.G);
      const [Gi, Gd] = abatido(V1.G, punta, canto);
      cerca(pl(Gi), 119.943, 474.29);
      cerca(pl(Gd), 390.057, 474.29);
      /* el mismo punto que con gira(): 67,39° hacia un lado y 112,61° hacia el otro */
      const conGira = [-67.3936, 112.6064].flatMap((a) => [gira(V1.G, punta, a), gira(V1.G, punta, -a)]);
      for (const X of [Gi, Gd]) expect(Math.min(...conGira.map((Y) => vm(X, Y)))).toBeLessThan(0.01);
      for (const Gab of [Gi, Gd]) {
        const fig = Object.fromEntries(
          Object.entries(V1).map(([k, Q]) => [k, pl(k === 'C' ? Q : k === 'G' ? Gab : abatidoJunto(Q, punta, canto, Gab, V1.G))]),
        ) as Record<K, P2>;
        comprueba(fig);
      }
      const Ed = abatidoJunto(V1.E, punta, canto, Gd, V1.G);
      const Bd = abatidoJunto(V1.B, punta, canto, Gd, V1.G);
      cerca(pl(Ed), 322.586, 513.235);
      cerca(pl(Bd), 322.586, 344.662);
    });
  });

  it('las dos cifras del calcular, iguales por los tres caminos, y sus distractores', () => {
    const angulo = (p: P2, q: P2, r: P2) => {
      const [a, b] = [[q[0] - p[0], q[1] - p[1]], [r[0] - p[0], r[1] - p[1]]];
      return (Math.acos((a[0] * b[0] + a[1] * b[1]) / (Math.hypot(a[0], a[1]) * Math.hypot(b[0], b[1]))) * 180) / Math.PI;
    };
    expect(180 - anguloRectas(rectaPorPuntos(D, C), rectaPorPuntos(D, E))).toBeCloseTo(104.359, 3);
    expect(anguloRectas(rectaPorPuntos(D, C), rectaPorPuntos(D, E))).toBeCloseTo(75.641, 3);
    expect(angulo(pl(D), pl(C), pl(E))).toBeCloseTo(123.6788, 3);
    expect(angulo(al(D), al(C), al(E))).toBeCloseTo(116.5651, 3);
    expect(mm(vm(C, G))).toBeCloseTo(70.4043, 3);
    expect(mm(vmPlanta(C, G))).toBeCloseTo(54.9741, 3);
    expect(mm(vmAlzado(C, G))).toBeCloseTo(62.2032, 3);
  });
});
