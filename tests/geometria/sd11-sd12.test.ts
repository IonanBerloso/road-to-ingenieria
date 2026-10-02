import { describe, expect, it } from 'vitest';
import {
  PT_MM,
  abatido,
  abatidoJunto,
  anguloConPH,
  anguloPlanoConPH,
  anguloRectas,
  corteRectaPlano,
  distanciaAPlano,
  distanciaARecta,
  gira,
  perpendicularAPlano,
  plano,
  planoPerpendicularARecta,
  proyAlzado,
  proyPlanta,
  punto3,
  puntoEnPlanoDesdePlanta,
  puntosADistancia,
  rectaDesdeProyecciones,
  rectaPorPuntos,
  simetrico,
  vm,
  vmAlzado,
  vmPlanta,
  type P2,
  type P3,
  type Plano,
  type Recta3,
} from '../../src/lib/diedrico';

/* SD11 y SD12 · los Ejercicios 9 y 10 de la colección de diédrico directo
   (Dpto. de Expresión Gráfica y Proyectos de Ingeniería, EIG, UPV/EHU): dos
   cuadrados en el plano de las rectas r y s. En SD11, de 40 mm, con un lado
   sobre r y A de vértice más alto, por abatimiento con la horizontal por S de
   charnela. En SD12, con el lado AB sobre la frontal r y otro lado sobre s,
   cuyo alzado no se dibuja y sale del ángulo recto; AD, con un giro de eje
   vertical por A. Las láminas son `src/content/laminas/sd11.json` y
   `sd12.json`, sacadas de los trazos vectoriales del PDF.

   Las cifras esperadas se sacaron el 2 de octubre de 2026 por un segundo
   camino, sin lib/diedrico: álgebra de vectores sobre las coordenadas de las
   láminas. En SD11, B a 40 mm de A
   por r, D por el producto vectorial de la normal del plano con r, A abatido
   con el pie en la charnela y el radio por Pitágoras, y los demás abatidos con
   la distancia real con signo a la charnela. En SD12, s con la planta de s₁ y
   el alzado perpendicular a r₂, D a AB de A por s, y el giro como K₁ llevado a
   la horizontal de A₁ a la distancia A₁K₁. Aquí se cotejan con lib/diedrico.

   Los puntos se comparan a 0,05 pt (0,02 mm); las longitudes, a la milésima de
   mm, y los ángulos, a la centésima de grado. */

const mm = (v: number) => v * PT_MM;
const pl = (P: P3) => proyPlanta(P);
const al = (P: P3) => proyAlzado(P);
const cerca = (p: P2, x: number, y: number, tol = 0.05) => {
  expect(Math.abs(p[0] - x), `x ${p[0]} frente a ${x}`).toBeLessThanOrEqual(tol);
  expect(Math.abs(p[1] - y), `y ${p[1]} frente a ${y}`).toBeLessThanOrEqual(tol);
};
/** El plano horizontal que pasa por la cota de un alzado. */
const horizontalDeCota = (alz: P2): Plano => {
  const P = punto3(alz, [alz[0], 0]);
  return plano(P, { ...P, x: P.x + 50 }, { ...P, y: P.y + 50 });
};
/** La distancia de un punto de la planta a una recta de la planta. */
const aRecta2 = (q: P2, a: P2, b: P2) => Math.abs((b[0] - a[0]) * (q[1] - a[1]) - (b[1] - a[1]) * (q[0] - a[0])) / Math.hypot(b[0] - a[0], b[1] - a[1]);

describe('SD11 · el cuadrado de 40 mm con un lado sobre r y A de vértice más alto', () => {
  const A = punto3([214.68, 184.44], [214.68, 354.48]);
  const r = rectaDesdeProyecciones([[214.68, 184.44], [120, 279.12]], [[214.68, 354.48], [120, 379.92]]);
  const s = rectaDesdeProyecciones([[214.68, 184.44], [268.08, 276.96]], [[214.68, 354.48], [268.8, 448.2]]);
  const cotaS = horizontalDeCota([268.08, 276.96]);
  const S = corteRectaPlano(s, cotaS);
  const R = corteRectaPlano(r, cotaS);
  const rs = plano(A, R, S);
  const lado = 40 / PT_MM;
  const [B, Bmal] = puntosADistancia(r, A, lado);
  const normal = perpendicularAPlano(A, rs);
  const [Da, Db] = [gira(B, normal, 90), gira(B, normal, -90)];
  const [D, Dmal] = Da.z < Db.z ? [Da, Db] : [Db, Da];
  const C = simetrico(A, { x: (B.x + D.x) / 2, y: (B.y + D.y) / 2, z: (B.z + D.z) / 2 });
  const hS: Recta3 = rectaPorPuntos(R, S);

  it('S, el punto de s con el alzado del extremo de s₂, y R, el de r a su altura', () => {
    cerca(pl(S), 268.08, 446.953);
    cerca(pl(R), 122.16, 379.34);
    cerca(al(R), 122.16, 276.96);
  });

  it('B baja por r y D baja desde A: A es el vértice de mayor cota; el cuadrado tiene 40 mm de lado y ángulo recto', () => {
    cerca(pl(B), 135.913, 375.644);
    cerca(al(B), 135.913, 263.207);
    cerca(pl(D), 285.922, 425.645);
    cerca(al(D), 285.922, 236.56);
    cerca(pl(C), 207.155, 446.809);
    cerca(al(C), 207.155, 315.327);
    for (const X of [B, C, D]) expect(X.z).toBeLessThan(A.z);
    expect(Bmal.z).toBeGreaterThan(A.z);
    expect(Dmal.z).toBeGreaterThan(A.z);
    expect(mm(vm(A, B))).toBeCloseTo(40, 3);
    expect(mm(vm(A, D))).toBeCloseTo(40, 3);
    expect(mm(vm(B, D))).toBeCloseTo(40 * Math.SQRT2, 3);
    for (const X of [B, C, D]) expect(distanciaAPlano(X, rs)).toBeLessThan(1e-6);
  });

  it('r y s forman 71,67°: el lado AD, perpendicular a AB, no puede ir por s', () => {
    expect(anguloRectas(r, s)).toBeCloseTo(71.67, 2);
  });

  it('A abatido con la horizontal por S de charnela, a los dos lados: radio de 39,18 mm', () => {
    const [A0a, A0b] = abatido(A, hS, rs);
    cerca(pl(A0a), 142.148, 511.015);
    cerca(pl(A0b), 235.54, 309.462);
    expect(mm(distanciaARecta(A, hS))).toBeCloseTo(39.183, 3);
  });

  it('el cuadrado abatido, en las dos ramas, tiene los lados de verdad; J está en la charnela y en D₀C₀', () => {
    const esperado = [
      { B: [125.131, 398.913], C: [237.233, 381.897], D: [254.25, 493.998] },
      { B: [139.014, 368.952], C: [198.505, 465.478], D: [295.03, 405.987] },
    ];
    const J = corteRectaPlano(rectaPorPuntos(C, D), cotaS);
    cerca(pl(J), 245.522, 436.5);
    abatido(A, hS, rs).forEach((A0, i) => {
      const ab = (Q: P3) => abatidoJunto(Q, hS, rs, A0, A);
      for (const X of ['B', 'C', 'D'] as const) {
        const e = esperado[i][X];
        cerca(pl(ab({ B, C, D }[X])), e[0], e[1]);
      }
      expect(mm(vmPlanta(A0, ab(B)))).toBeCloseTo(40, 3);
      expect(mm(vmPlanta(ab(B), ab(C)))).toBeCloseTo(40, 3);
      expect(mm(vmPlanta(ab(C), ab(D)))).toBeCloseTo(40, 3);
      /* D₀, C₀ y J, alineados en la planta */
      expect(aRecta2(pl(J), pl(ab(D)), pl(ab(C)))).toBeLessThan(1e-6);
    });
  });

  it('C₁ y D₁ están en la paralela a r₁ por J, y C₂ y D₂ en la paralela a r₂ por J₂', () => {
    const J = corteRectaPlano(rectaPorPuntos(C, D), cotaS);
    const dr1: P2 = [120 - 214.68, 379.92 - 354.48];
    const dr2: P2 = [120 - 214.68, 279.12 - 184.44];
    const J1 = pl(J), J2 = al(J);
    expect(aRecta2(pl(C), J1, [J1[0] + dr1[0], J1[1] + dr1[1]])).toBeLessThan(1e-6);
    expect(aRecta2(pl(D), J1, [J1[0] + dr1[0], J1[1] + dr1[1]])).toBeLessThan(1e-6);
    expect(aRecta2(al(C), J2, [J2[0] + dr2[0], J2[1] + dr2[1]])).toBeLessThan(1e-6);
    expect(aRecta2(al(D), J2, [J2[0] + dr2[0], J2[1] + dr2[1]])).toBeLessThan(1e-6);
  });

  it('la cifra del calcular y sus distractores: 56,41° frente a 33,59 (el complementario), 44,00 (r) y 40,91 (s)', () => {
    const alfa = anguloPlanoConPH(rs);
    expect(alfa).toBeCloseTo(56.41, 2);
    /* el ángulo en M del triángulo del radio: la cota sobre lo que A₁ dista de la charnela */
    expect((Math.atan2(A.z - S.z, distanciaARecta({ ...A, z: S.z }, hS)) * 180) / Math.PI).toBeCloseTo(alfa, 6);
    const distractores = [90 - alfa, anguloConPH(A, R), anguloConPH(A, S)];
    expect(distractores[0]).toBeCloseTo(33.59, 2);
    expect(distractores[1]).toBeCloseTo(44.0, 2);
    expect(distractores[2]).toBeCloseTo(40.91, 2);
    for (const d of distractores) expect(Math.abs(d - alfa)).toBeGreaterThan(0.5);
  });
});

describe('SD12 · el cuadrado con el lado AB sobre r y otro lado sobre s', () => {
  const A = punto3([211.32, 266.64], [211.32, 438.12]);
  const B = punto3([108.48, 207.24], [108.48, 438.12]);
  const r = rectaDesdeProyecciones([[108.48, 207.24], [272.4, 301.92]], [[108.48, 438.12], [272.4, 438.12]]);
  /* s pasa por A y es perpendicular a r: está en el plano perpendicular a r por A */
  const Sx = puntoEnPlanoDesdePlanta([99.6, 531.84], planoPerpendicularARecta(A, r));
  const s = rectaPorPuntos(A, Sx);
  const rs = plano(A, B, Sx);
  const K = corteRectaPlano(s, horizontalDeCota([108.48, 207.24]));
  const [Da, Db] = puntosADistancia(s, A, vm(A, B));
  const [D, Dmal] = Da.z < Db.z ? [Da, Db] : [Db, Da];
  const C = simetrico(A, { x: (B.x + D.x) / 2, y: (B.y + D.y) / 2, z: (B.z + D.z) / 2 });

  it('r es frontal y A₂ está en r₂: AB mide en el alzado lo que mide de verdad, 41,90 mm', () => {
    expect(Math.abs(r.d.y)).toBeLessThan(1e-12);
    /* A₂ está en r₂ al redondeo del PDF: 0,0002 pt */
    expect(distanciaARecta(A, r)).toBeLessThan(0.01);
    expect(mm(vm(A, B))).toBeCloseTo(41.897, 3);
    expect(mm(vmAlzado(A, B))).toBeCloseTo(41.897, 3);
  });

  it('s₂ es la perpendicular a r₂ por A₂: el ángulo recto con un lado frontal se ve en el alzado', () => {
    cerca(al(Sx), 99.6, 460.061);
    const u: P2 = [al(A)[0] - al(B)[0], al(A)[1] - al(B)[1]];
    const v: P2 = [al(Sx)[0] - al(A)[0], al(Sx)[1] - al(A)[1]];
    expect(Math.abs(u[0] * v[0] + u[1] * v[1]) / (Math.hypot(...u) * Math.hypot(...v))).toBeLessThan(1e-5);
    expect(anguloRectas(r, s)).toBeCloseTo(90, 3);
  });

  it('K, el punto de s con la cota de B; D baja y se aleja; C cierra el cuadrado', () => {
    cerca(al(K), 245.629, 207.24);
    cerca(pl(K), 245.629, 409.338);
    cerca(al(D), 156.546, 361.471);
    cerca(pl(D), 156.546, 484.069);
    cerca(al(C), 53.706, 302.071);
    cerca(pl(C), 53.706, 484.069);
    cerca(al(Dmal), 266.094, 171.809);
    expect(D.y).toBeGreaterThan(A.y);
    expect(Dmal.y).toBeLessThan(A.y);
    /* A y B, los de mayor cota: C y D, por debajo de los dos */
    for (const X of [C, D]) expect(X.z).toBeLessThan(A.z);
    expect(A.z).toBeLessThan(B.z);
    expect(mm(vm(A, D))).toBeCloseTo(41.897, 3);
    /* a la milésima de pt: A₂ está en r₂ al redondeo del PDF, y el ángulo en A, a 90° con esa holgura */
    expect(vm(B, D)).toBeCloseTo(vm(A, B) * Math.SQRT2, 3);
    for (const X of [C, D]) expect(distanciaAPlano(X, rs)).toBeLessThan(1e-6);
  });

  it('«el plano proyectante vertical»: leído como el vertical de proyección elige lo mismo que la cota; leído como el de canto por r, no elige', () => {
    /* el plano de canto que contiene a r: su normal es perpendicular a r y al eje y */
    const n = { x: -r.d.z, y: 0, z: r.d.x };
    const l = Math.hypot(n.x, n.z);
    const canto: Plano = { n: { x: n.x / l, y: 0, z: n.z / l }, d: (n.x * A.x + n.z * A.z) / l };
    expect(distanciaAPlano(A, canto)).toBeLessThan(0.01);
    expect(distanciaAPlano(B, canto)).toBeLessThan(0.01);
    expect(distanciaAPlano(D, canto)).toBeCloseTo(distanciaAPlano(Dmal, canto), 6);
    /* con el vertical de proyección: D, el que baja, es también el que se aleja */
    expect(D.z < Dmal.z && D.y > Dmal.y).toBe(true);
  });

  it('el giro de eje vertical por A deja AK frontal, a los dos lados, y D′ a la cota de D y a AB de A', () => {
    const eje: Recta3 = { p: A, d: { x: 0, y: 0, z: 1 } };
    const a0 = (Math.atan2(K.y - A.y, K.x - A.x) * 180) / Math.PI;
    const izquierda = 180 - a0;
    const derecha = -a0;
    const esperado = [
      { ang: izquierda, K1: [166.537, 438.12], D2: [282.815, 361.471] },
      { ang: derecha, K1: [256.103, 438.12], D2: [139.825, 361.471] },
    ];
    for (const e of esperado) {
      const Kg = gira(K, eje, e.ang);
      const Dg = gira(D, eje, e.ang);
      cerca(pl(Kg), e.K1[0], e.K1[1]);
      cerca(al(Kg), e.K1[0], 207.24);
      cerca(al(Dg), e.D2[0], e.D2[1]);
      expect(Math.abs(Kg.y - A.y)).toBeLessThan(1e-9);
      expect(Math.abs(Dg.y - A.y)).toBeLessThan(1e-9);
      expect(Dg.z).toBeCloseTo(D.z, 9);
      expect(mm(vmAlzado(A, Dg))).toBeCloseTo(41.897, 3);
      expect(mm(vmPlanta(A, Kg))).toBeCloseTo(15.798, 3);
    }
  });

  it('la cifra del calcular y sus distractores: 41,90 mm frente a 36,28 (A₁B₁), 38,63 (A₂D₂) y 25,22 (A₁D₁)', () => {
    const ladoMm = mm(vm(A, B));
    expect(ladoMm).toBeCloseTo(41.9, 2);
    const distractores = [mm(vmPlanta(A, B)), mm(vmAlzado(A, D)), mm(vmPlanta(A, D))];
    expect(distractores[0]).toBeCloseTo(36.28, 2);
    expect(distractores[1]).toBeCloseTo(38.63, 2);
    expect(distractores[2]).toBeCloseTo(25.22, 2);
    for (const d of distractores) expect(Math.abs(d - ladoMm)).toBeGreaterThan(1);
  });
});
