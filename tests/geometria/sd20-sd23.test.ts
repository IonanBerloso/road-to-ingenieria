import { describe, expect, it } from 'vitest';
import {
  PT_MM,
  abatido,
  anguloConPH,
  deltaCota,
  gira,
  pieEnRecta,
  plano,
  proyAlzado,
  proyPlanta,
  punto3,
  puntoATresDistancias,
  puntosADistancia,
  rectaPorPuntos,
  vm,
  vmPlanta,
  type P2,
  type P3,
} from '../../src/lib/diedrico';

/* SD20 y SD23 · los Ejercicios 16 y 18 de la colección de diédrico directo
   (Dpto. de Expresión Gráfica y Proyectos de Ingeniería, EIG, UPV/EHU): el
   poste que se endereza tirando de dos cuerdas y la lámpara colgada del
   techo por tres varillas. Las láminas son `src/content/laminas/sd20.json`
   (trazos de JSON-EG, que casan con pdfplumber) y `sd23.json` (las cruces son
   el glifo «+» del texto, medido sobre la página).

   Las cifras esperadas se sacaron el 1 de octubre de 2026 por un segundo
   camino, sin lib/diedrico, con un guion aparte: álgebra de vectores sobre
   las coordenadas de las láminas. En SD20, el poste girado en su plano
   frontal y cada punto movido por la recta del tiro hasta el corte con la
   circunferencia de la planta de la cuerda; en SD23, la trilateración en la
   planta (el techo es horizontal) y los abatimientos de los triángulos VAB y
   VAC como giros en el plano del techo. Aquí se cotejan con lib/diedrico —el
   giro, el punto a una distancia sobre una recta, el punto a tres distancias
   y el abatimiento—, y se comprueba lo que ninguna de las dos cuentas puede
   fingir: que las cuerdas y las varillas miden lo que deben, que A y B no
   cambian de cota, y que las dos charnelas llevan al mismo V₁. */

const mm = (v: number) => v * PT_MM;
const d2 = (a: P2, b: P2) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const cerca = (p: P2, x: number, y: number) => {
  expect(p[0]).toBeCloseTo(x, 2);
  expect(p[1]).toBeCloseTo(y, 2);
};

describe('SD20 · el poste que se endereza', () => {
  const P = punto3([439.23, 272.97], [439.23, 554.83]);
  const Q = punto3([330.82, 381.38], [330.82, 554.83]);
  const A = punto3([309.14, 348.79], [309.14, 623.9]);
  const B = punto3([265.78, 348.79], [265.78, 468.11]);

  /* El poste gira alrededor de la recta de punta por su pie Q lo que le
     falta para quedar vertical; de los dos sentidos, el que sube la punta. */
  const punta = rectaPorPuntos(Q, punto3([330.82, 381.38], [330.82, 604.83]));
  const giro = 90 - anguloConPH(Q, P);
  const Pv = [gira(P, punta, giro), gira(P, punta, -giro)].sort((a, b) => b.z - a.z)[0];

  /* A y B se mueven por la horizontal de su cota que tiene por planta la
     recta A₁P₁ (o B₁P₁): las dos pasan por la vertical de P₁ a esa cota. */
  const Ah = punto3([439.23, 348.79], [439.23, 554.83]);
  const final = (X: P3) => {
    const r = rectaPorPuntos(X, Ah);
    const F = pieEnRecta(Pv, r);
    const d = Math.sqrt(vm(X, P) ** 2 - vm(Pv, F) ** 2);
    const [haciaP, lejos] = puntosADistancia(r, F, d);
    return { haciaP, lejos };
  };
  const a = final(A);
  const b = final(B);

  it('PQ es frontal, a 45°, y el poste enderezado queda en la vertical de Q con su longitud', () => {
    expect(P.y).toBeCloseTo(Q.y, 9);
    expect(giro).toBeCloseTo(45, 6);
    cerca(proyAlzado(Pv), 330.82, 228.065);
    cerca(proyPlanta(Pv), 330.82, 554.83);
    expect(vm(Pv, Q)).toBeCloseTo(vm(P, Q), 9);
    expect(mm(vm(P, Q))).toBeCloseTo(54.086, 3);
  });

  it('A y B tienen la misma cota, y P′ queda 42,59 mm por encima de ellos', () => {
    expect(A.z).toBeCloseTo(B.z, 9);
    expect(mm(deltaCota(Pv, A))).toBeCloseTo(42.589, 3);
  });

  it('A′ y B′ caen donde los deja el segundo camino, en las dos vistas', () => {
    cerca(proyPlanta(a.lejos), 265.093, 647.286);
    cerca(proyAlzado(a.lejos), 265.093, 348.79);
    cerca(proyPlanta(b.lejos), 207.091, 438.767);
    cerca(proyAlzado(b.lejos), 207.091, 348.79);
  });

  it('las cuerdas no se estiran, A y B no cambian de cota y siguen en su recta del tiro', () => {
    expect(vm(a.lejos, Pv)).toBeCloseTo(vm(A, P), 9);
    expect(vm(b.lejos, Pv)).toBeCloseTo(vm(B, P), 9);
    expect(a.lejos.z).toBeCloseTo(A.z, 9);
    expect(b.lejos.z).toBeCloseTo(B.z, 9);
    const enTiro = (X: P3, Y: P3) => {
      const [u, w] = [proyPlanta(X), proyPlanta(Y)];
      const p1 = proyPlanta(P);
      return Math.abs((u[0] - p1[0]) * (w[1] - p1[1]) - (u[1] - p1[1]) * (w[0] - p1[0])) / d2(u, p1);
    };
    expect(enTiro(A, a.lejos)).toBeLessThan(1e-6);
    expect(enTiro(B, b.lejos)).toBeLessThan(1e-6);
  });

  it('tirando, A y B se alejan del poste; el otro corte de A cae junto a P₁, al otro lado', () => {
    const p1 = proyPlanta(P);
    expect(d2(proyPlanta(a.lejos), p1)).toBeGreaterThan(d2(proyPlanta(A), p1));
    expect(d2(proyPlanta(b.lejos), p1)).toBeGreaterThan(d2(proyPlanta(B), p1));
    cerca(proyPlanta(a.haciaP), 444.227, 552.177);
    expect(mm(vm(A, a.lejos))).toBeCloseTo(17.593, 3);
    expect(mm(vm(B, b.lejos))).toBeCloseTo(23.148, 3);
  });

  it('la planta de cada cuerda nueva es el cateto del triángulo de su verdadera magnitud', () => {
    const rho = (X: P3) => Math.sqrt(vm(X, P) ** 2 - deltaCota(Pv, X) ** 2);
    expect(mm(vm(A, P))).toBeCloseTo(58.441, 3);
    expect(mm(vm(B, P))).toBeCloseTo(73.454, 3);
    expect(mm(rho(A))).toBeCloseTo(40.019, 3);
    expect(mm(rho(B))).toBeCloseTo(59.847, 3);
    expect(vmPlanta(a.lejos, Pv)).toBeCloseTo(rho(A), 9);
    expect(vmPlanta(b.lejos, Pv)).toBeCloseTo(rho(B), 9);
  });

  it('los errores del calcular dan otro retroceso, fuera de la tolerancia', () => {
    const r = rectaPorPuntos(A, Ah);
    const QA = punto3([330.82, 348.79], [330.82, 554.83]);
    const F = pieEnRecta(QA, r);
    const lejos = (radio: number) => puntosADistancia(r, F, Math.sqrt(radio ** 2 - vm(QA, F) ** 2))[1];
    // la planta de la cuerda conservada, y la verdadera magnitud en la planta
    const planta = mm(vm(A, lejos(vmPlanta(A, P))));
    const enPlanta = mm(vm(A, lejos(vm(A, P))));
    expect(planta).toBeCloseTo(30.586, 3);
    expect(enPlanta).toBeCloseTo(37.439, 3);
    // la cuerda paralela a como estaba, desde Q₁
    const u: P2 = [(A.x - P.x) / vmPlanta(A, P), (A.y - P.y) / vmPlanta(A, P)];
    const rhoA = Math.sqrt(vm(A, P) ** 2 - deltaCota(Pv, A) ** 2);
    const par: P2 = [Q.x + u[0] * rhoA, Q.y + u[1] * rhoA];
    const paralela = mm(d2(par, proyPlanta(A)));
    expect(paralela).toBeCloseTo(28.258, 3);
    // y los tres caen fuera de la tolerancia del calcular, 1 mm, alrededor de los 17,593 buenos
    for (const x of [planta, enPlanta, paralela]) expect(Math.abs(x - 17.593)).toBeGreaterThan(1);
  });
});

describe('SD23 · la lámpara de tres varillas', () => {
  const A = punto3([146.77, 195.93], [146.77, 592.81]);
  const B = punto3([260.17, 195.93], [260.17, 677.89]);
  const C = punto3([316.92, 195.93], [316.92, 564.49]);
  const [dA, dB, dC] = [40 / PT_MM, 70 / PT_MM, 60 / PT_MM];
  const V = puntoATresDistancias(A, dA, B, dB, C, dC, -1);
  const Vup = puntoATresDistancias(A, dA, B, dB, C, dC, 1);

  it('el techo es horizontal, y V cuelga por debajo con las tres varillas a su medida', () => {
    expect(B.z).toBeCloseTo(A.z, 9);
    expect(C.z).toBeCloseTo(A.z, 9);
    expect(mm(vm(V, A))).toBeCloseTo(40, 6);
    expect(mm(vm(V, B))).toBeCloseTo(70, 6);
    expect(mm(vm(V, C))).toBeCloseTo(60, 6);
    expect(V.z).toBeLessThan(A.z);
    expect(Vup.z).toBeGreaterThan(A.z);
  });

  it('V cae donde lo deja el segundo camino, y la altura es 28,44 mm (28,44 cm a escala 1:10)', () => {
    cerca(proyPlanta(V), 174.539, 518.08);
    cerca(proyAlzado(V), 174.539, 276.556);
    cerca(proyAlzado(Vup), 174.539, 115.304);
    expect(mm(deltaCota(V, A))).toBeCloseTo(28.443, 3);
  });

  it('abatido con la charnela AB, V₀ está a 40 mm de A₁ y a 70 de B₁, a los dos lados', () => {
    const lados = abatido(V, rectaPorPuntos(A, B), plano(A, B, V)).map(proyPlanta);
    const esperado: P2[] = [
      [61.987, 668.097],
      [195.341, 490.354],
    ];
    for (const [k, p] of lados.entries()) {
      cerca(p, esperado[k][0], esperado[k][1]);
      expect(mm(d2(p, proyPlanta(A)))).toBeCloseTo(40, 6);
      expect(mm(d2(p, proyPlanta(B)))).toBeCloseTo(70, 6);
    }
  });

  it('abatido con la charnela AC, V₀′ está a 40 mm de A₁ y a 60 de C₁, a los dos lados', () => {
    const lados = abatido(V, rectaPorPuntos(A, C), plano(A, C, V)).map(proyPlanta);
    const esperado: P2[] = [
      [203.334, 691.08],
      [168.454, 481.517],
    ];
    for (const [k, p] of lados.entries()) {
      cerca(p, esperado[k][0], esperado[k][1]);
      expect(mm(d2(p, proyPlanta(A)))).toBeCloseTo(40, 6);
      expect(mm(d2(p, proyPlanta(C)))).toBeCloseTo(60, 6);
    }
  });

  it('las perpendiculares a las dos charnelas por los abatidos se cortan en V₁, sea cual sea el lado', () => {
    for (const [X, Y] of [
      [A, B],
      [A, C],
    ] as const) {
      const u: P2 = [Y.x - X.x, Y.y - X.y];
      for (const p of abatido(V, rectaPorPuntos(X, Y), plano(X, Y, V)).map(proyPlanta)) {
        const v1 = proyPlanta(V);
        // V₁ − V₀ es perpendicular a la charnela
        expect(Math.abs((v1[0] - p[0]) * u[0] + (v1[1] - p[1]) * u[1]) / Math.hypot(...u)).toBeLessThan(1e-6);
      }
    }
  });

  it('el triángulo del radio: MV₀ por hipotenusa, MV₁ por cateto, y la altura por el otro', () => {
    const M = pieEnRecta(V, rectaPorPuntos(A, B));
    cerca(proyPlanta(M), 128.664, 579.225);
    expect(mm(vm(V, M))).toBeCloseTo(39.195, 3);
    expect(mm(vmPlanta(V, M))).toBeCloseTo(26.967, 3);
    expect(Math.sqrt(vm(V, M) ** 2 - vmPlanta(V, M) ** 2)).toBeCloseTo(deltaCota(V, A), 9);
    // M cae fuera del segmento AB, más allá de A: por eso se prolonga la charnela
    const t = ((M.x - A.x) * (B.x - A.x) + (M.y - A.y) * (B.y - A.y)) / vmPlanta(A, B) ** 2;
    expect(t).toBeLessThan(0);
  });

  it('las varillas no se cruzan en ninguna vista más que en V: todo se ve', () => {
    const cruzan = (a: P2, b: P2, c: P2, d: P2) => {
      const r: P2 = [b[0] - a[0], b[1] - a[1]];
      const s: P2 = [d[0] - c[0], d[1] - c[1]];
      const den = r[0] * s[1] - r[1] * s[0];
      const t = ((c[0] - a[0]) * s[1] - (c[1] - a[1]) * s[0]) / den;
      const w = ((c[0] - a[0]) * r[1] - (c[1] - a[1]) * r[0]) / den;
      return t > 1e-6 && t < 1 - 1e-6 && w > 1e-6 && w < 1 - 1e-6;
    };
    for (const pr of [proyPlanta, proyAlzado]) {
      const [a, b, c] = [A, B, C].map((X) => [pr(X), pr(V)] as const);
      expect(cruzan(...a, ...b)).toBe(false);
      expect(cruzan(...a, ...c)).toBe(false);
      expect(cruzan(...b, ...c)).toBe(false);
    }
  });
});
