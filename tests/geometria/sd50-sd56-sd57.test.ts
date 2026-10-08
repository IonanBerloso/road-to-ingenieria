import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  PT_MM,
  anguloRectas,
  cambioPlano,
  distanciaAPlano,
  distanciaRectas,
  enPlano,
  paraleloADistancia,
  pieComun,
  pieEnRecta,
  plano,
  proyAlzado,
  proyPlanta,
  punto3,
  puntoEnPlanoDesdePlanta,
  rectaPorPuntos,
  vm,
  vmAlzado,
  vmPlanta,
  type P2,
  type P3,
  type Recta2,
} from '../../src/lib/diedrico';
import type { DatosLamina } from '../../src/lib/lamina';

/* Los Ejercicios 35 (SD50), 40 (SD56) y 41 (SD57) de la Colección de
   ejercicios de diédrico (Dpto. de Expresión Gráfica y Proyectos de
   Ingeniería, EIG, UPV/EHU), págs. 36, 41 y 42.

   Las coordenadas son las de las láminas `sd50`, `sd56` y `sd57`. Las cifras
   esperadas salen de un guion aparte, escrito el 7 de octubre de 2026: álgebra
   de vectores sobre esas mismas coordenadas, sin importar nada de `src/lib/`,
   con los cambios de plano hechos como en el papel (el pie en la línea nueva y,
   hacia fuera, la cota o el alejamiento menos los de la referencia) y la
   visibilidad por rayos contra las caras opacas. Aquí se cotejan contra
   `lib/diedrico`. */

const lee = (codigo: string) =>
  JSON.parse(readFileSync(join(process.cwd(), 'src', 'content', 'laminas', `${codigo}.json`), 'utf8')) as DatosLamina;
const puntoDe = (L: DatosLamina, n: string): P3 => {
  const [a, p] = [L.puntos[`${n}2`], L.puntos[`${n}1`]];
  return punto3([a.x, a.y], [p.x, p.y]);
};
const linea = (L: DatosLamina, nombre: string): Recta2 => {
  const s = L.segmentos.find((x) => x.nombre === nombre);
  if (!s) throw new Error(`falta ${nombre}`);
  return { p: s.a, d: [s.b[0] - s.a[0], s.b[1] - s.a[1]] };
};
const cerca = (p: P2, [x, y]: readonly [number, number], d = 2) => {
  expect(p[0]).toBeCloseTo(x, d);
  expect(p[1]).toBeCloseTo(y, d);
};
const d2 = (a: P2, b: P2) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const enMm = (pt: number) => pt * PT_MM;

describe('SD56 · la tubería más corta entre AB y CD, que se cruzan', () => {
  const L = lee('sd56');
  const [A, B, C, D] = ['A', 'B', 'C', 'D'].map((n) => puntoDe(L, n));
  const ab = rectaPorPuntos(A, B);
  const cd = rectaPorPuntos(C, D);
  const Q = pieComun(ab, cd);
  const P = pieComun(cd, ab);
  const nueva = linea(L, 'nueva');
  const v4 = (X: P3) => cambioPlano(X, 'horizontal', nueva, C);

  it('la planta rotula D₁ la cruz de la derecha (la página dice «D2», una errata)', () => {
    expect(L.puntos.D1.rotulo).toBe('D₁');
    expect(L.puntos.D1.x).toBe(L.puntos.D2.x);
  });

  it('CD es frontal: C₁D₁ es horizontal en el papel', () => {
    expect(L.puntos.C1.y).toBe(L.puntos.D1.y);
  });

  it('la perpendicular común: 23,86 mm, con los dos pies dentro de las tuberías', () => {
    expect(enMm(distanciaRectas(ab, cd))).toBeCloseTo(23.8558, 3);
    expect(enMm(vm(P, Q))).toBeCloseTo(23.8558, 3);
    const s = (Q.x - A.x) / (B.x - A.x);
    const t = (P.x - C.x) / (D.x - C.x);
    expect(s).toBeCloseTo(0.5046, 3);
    expect(t).toBeCloseTo(0.3734, 3);
    cerca(proyPlanta(Q), [205.6088, 539.2747]);
    cerca(proyAlzado(Q), [205.6088, 314.1097]);
    cerca(proyPlanta(P), [218.1512, 476.16]);
    cerca(proyAlzado(P), [218.1512, 334.8958]);
  });

  it('el cambio de plano horizontal deja CD de punta, y C₄Q₄ es la tubería', () => {
    const [A4, B4, C4, D4, Q4] = [A, B, C, D, Q].map(v4);
    expect(d2(C4, D4)).toBeLessThan(0.01);
    cerca(A4, [373.9356, 134.21]);
    cerca(B4, [486.3687, 221.5867]);
    cerca(C4, [389.1725, 231.6931]);
    cerca(Q4, [430.6682, 178.2994]);
    expect(enMm(d2(C4, Q4))).toBeCloseTo(23.8558, 3);
    /* C₄Q₄ perpendicular a A₄B₄ (a la centésima de pt: la línea nueva de la
       lámina va redondeada a la centésima, y CD no queda de punta del todo) */
    const u: P2 = [B4[0] - A4[0], B4[1] - A4[1]];
    expect(Math.abs((Q4[0] - C4[0]) * u[0] + (Q4[1] - C4[1]) * u[1]) / Math.hypot(...u)).toBeLessThan(0.01);
    /* lo que se lleva: el alejamiento sobre el de CD */
    expect(enMm(A.y - C.y)).toBeCloseTo(13.1657, 3);
    expect(enMm(B.y - C.y)).toBeCloseTo(31.1997, 3);
  });

  it('en el alzado, P₂Q₂ es perpendicular a C₂D₂, porque CD es frontal', () => {
    const [P2, Q2, C2, D2] = [P, Q, C, D].map(proyAlzado);
    const u: P2 = [D2[0] - C2[0], D2[1] - C2[1]];
    expect(Math.abs((P2[0] - Q2[0]) * u[0] + (P2[1] - Q2[1]) * u[1])).toBeLessThan(1e-6);
  });

  it('los distractores y las casualidades', () => {
    expect(enMm(vmPlanta(P, Q))).toBeCloseTo(22.7008, 3);
    expect(enMm(vmAlzado(P, Q))).toBeCloseTo(8.5644, 3);
    expect(enMm(vm(C, pieEnRecta(C, ab)))).toBeCloseTo(27.9868, 3);
    expect(enMm(vmAlzado(A, Q))).toBeCloseTo(24.6588, 3);
    expect(enMm(vmAlzado(Q, B))).toBeCloseTo(24.2101, 3);
  });

  it('la tubería va entre los dos muros (x de 181,32 a 279,96), y en el alzado AB le tapa el trozo de Q₂ al borde de A₂B₂', () => {
    for (const X of [P, Q]) {
      expect(X.x).toBeGreaterThan(181.32);
      expect(X.x).toBeLessThan(279.96);
    }
    /* Q está más adelante que P: la tubería sale de AB hacia atrás, y AB, opaca, le pasa por delante */
    expect(Q.y).toBeGreaterThan(P.y);
    const [a2, b2, q2, p2] = [A, B, Q, P].map(proyAlzado);
    const aEje = (X: P2) =>
      Math.abs((X[0] - a2[0]) * (b2[1] - a2[1]) - (X[1] - a2[1]) * (b2[0] - a2[0])) / d2(a2, b2);
    expect(aEje(p2)).toBeCloseTo(6.8486, 3);
    const f = 1.8 / PT_MM / aEje(p2);
    cerca([q2[0] + f * (p2[0] - q2[0]), q2[1] + f * (p2[1] - q2[1])], [214.9533, 329.5959]);
  });
});

describe('SD57 · la tubería más corta entre AB y CD, que son paralelas', () => {
  const L = lee('sd57');
  const [A, B, C, D] = ['A', 'B', 'C', 'D'].map((n) => puntoDe(L, n));
  const ab = rectaPorPuntos(A, B);
  const cd = rectaPorPuntos(C, D);
  const Q = pieEnRecta(D, ab);
  const v4 = (X: P3) => cambioPlano(X, 'vertical', linea(L, 'nueva1'), B);
  const v5 = (X: P3) => cambioPlano(X, 'vertical', linea(L, 'nueva1'), B, linea(L, 'nueva2'));

  it('AB y CD son paralelas: 0,04° con lo que da la medida de la imagen', () => {
    expect(anguloRectas(ab, cd)).toBeLessThan(0.05);
  });

  it('la tubería que sale de D: Q dentro de AB, y 18,18 mm', () => {
    const k = (Q.x - A.x) / (B.x - A.x);
    expect(k).toBeCloseTo(0.9153, 3);
    expect(enMm(vm(D, Q))).toBeCloseTo(18.1808, 3);
    cerca(proyPlanta(Q), [303.9761, 542.4985]);
    cerca(proyAlzado(Q), [303.9761, 329.9599]);
    /* cualquier otra perpendicular mide lo mismo con lo que distingue la regla */
    expect(enMm(vm(A, pieEnRecta(A, cd)))).toBeCloseTo(18.1621, 3);
  });

  it('con 0,04°, la perpendicular común de las rectas prolongadas cae lejísimos: no es la tubería', () => {
    const lejos = pieComun(ab, cd);
    expect(Math.abs((lejos.x - A.x) / (B.x - A.x))).toBeGreaterThan(10);
    expect(enMm(distanciaRectas(ab, cd))).toBeLessThan(16);
  });

  it('el primer cambio pone las dos en verdadera magnitud, y paralelas', () => {
    const [A4, B4, C4, D4, Q4] = [A, B, C, D, Q].map(v4);
    cerca(A4, [154.3799, 602.7413]);
    cerca(B4, [301.6594, 569.2883]);
    cerca(C4, [151.7496, 625.6161]);
    cerca(D4, [294.0155, 593.4039]);
    cerca(Q4, [289.1821, 572.1224]);
    const u: P2 = [B4[0] - A4[0], B4[1] - A4[1]];
    const w: P2 = [D4[0] - C4[0], D4[1] - C4[1]];
    expect(Math.abs(u[0] * w[1] - u[1] * w[0]) / (Math.hypot(...u) * Math.hypot(...w))).toBeLessThan(0.001);
    /* D₄Q₄ perpendicular a A₄B₄ (a la centésima de pt, por el redondeo de la
       línea nueva); y acortada en esta vista */
    expect(Math.abs((Q4[0] - D4[0]) * u[0] + (Q4[1] - D4[1]) * u[1]) / Math.hypot(...u)).toBeLessThan(0.01);
    expect(enMm(d2(D4, Q4))).toBeCloseTo(7.6988, 3);
  });

  it('el segundo cambio deja las dos de punta, y A₅C₅ es la distancia', () => {
    const [A5, B5, C5, D5] = [A, B, C, D].map(v5);
    expect(d2(A5, B5)).toBeLessThan(0.01);
    expect(enMm(d2(C5, D5))).toBeLessThan(0.05);
    cerca(A5, [133.9376, 607.3844]);
    cerca(C5, [93.2366, 638.9062]);
    expect(enMm(d2(A5, C5))).toBeCloseTo(18.161, 3);
  });

  it('los distractores', () => {
    expect(enMm(vmAlzado(D, Q))).toBeCloseTo(13.1498, 3);
    expect(enMm(vmPlanta(D, Q))).toBeCloseTo(17.1779, 3);
    const H = L.puntos;
    const n: P2 = [-(H.B1.y - H.A1.y), H.B1.x - H.A1.x];
    const dC = Math.abs((H.C1.x - H.A1.x) * n[0] + (H.C1.y - H.A1.y) * n[1]) / Math.hypot(...n);
    expect(enMm(dC)).toBeCloseTo(16.4648, 3);
  });
});

describe('SD50 · el cuadrado de 35 mm paralelo a ABC, con P a 20 mm por encima', () => {
  const L = lee('sd50');
  const [A, B, C] = ['A', 'B', 'C'].map((n) => puntoDe(L, n));
  const abc = plano(A, B, C);
  const P1: P2 = [L.puntos.P1.x, L.puntos.P1.y];
  const pi = paraleloADistancia(abc, 20 / PT_MM, 1);
  const P = puntoEnPlanoDesdePlanta(P1, pi);
  const Pabc = puntoEnPlanoDesdePlanta(P1, abc);
  const lado = 35 / PT_MM;
  const uCB = ((): P3 => {
    const l = vm(B, C);
    return { x: (C.x - B.x) / l, y: (C.y - B.y) / l, z: (C.z - B.z) / l };
  })();
  /* en el plano, perpendicular a CB, bajando */
  const w = ((): P3 => {
    const n = pi.n;
    let v: P3 = { x: n.y * uCB.z - n.z * uCB.y, y: n.z * uCB.x - n.x * uCB.z, z: n.x * uCB.y - n.y * uCB.x };
    if (v.z > 0) v = { x: -v.x, y: -v.y, z: -v.z };
    return v;
  })();
  const mas = (X: P3, u: P3, k: number): P3 => ({ x: X.x + u.x * k, y: X.y + u.y * k, z: X.z + u.z * k });
  const Q = mas(P, uCB, lado);
  const S = mas(P, w, lado);
  const R = mas(Q, w, lado);
  const v4 = (X: P3) => cambioPlano(X, 'vertical', linea(L, 'nueva1'), C);
  const v5 = (X: P3) => cambioPlano(X, 'vertical', linea(L, 'nueva1'), C, linea(L, 'nueva2'), B);

  it('P está a 20 mm del plano, del lado de arriba, y 26,06 mm por encima en su vertical', () => {
    expect(enMm(distanciaAPlano(P, abc))).toBeCloseTo(20, 6);
    expect(P.z).toBeGreaterThan(Pabc.z);
    cerca(proyAlzado(P), [301.68, 128.2617]);
    cerca(proyAlzado(Pabc), [301.68, 202.1188]);
    expect(enMm(P.z - Pabc.z)).toBeCloseTo(26.0551, 3);
    /* la otra lectura: 20 mm en vertical dejaría el plano a 15,35 mm */
    const Pv: P3 = { ...Pabc, z: Pabc.z + 20 / PT_MM };
    expect(enMm(distanciaAPlano(Pv, abc))).toBeCloseTo(15.3521, 3);
  });

  it('el cuadrado: en el plano paralelo, de 35 mm, con PQ paralelo a CB y P el vértice más alto', () => {
    for (const X of [Q, R, S]) expect(enPlano(X, pi)).toBe(true);
    expect(enMm(vm(P, Q))).toBeCloseTo(35, 6);
    expect(enMm(vm(Q, R))).toBeCloseTo(35, 6);
    expect(enMm(vm(P, S))).toBeCloseTo(35, 6);
    expect(anguloRectas(rectaPorPuntos(P, Q), rectaPorPuntos(C, B))).toBeLessThan(1e-6);
    expect(anguloRectas(rectaPorPuntos(P, S), rectaPorPuntos(C, B))).toBeCloseTo(90, 6);
    for (const X of [Q, R, S]) expect(X.z).toBeLessThan(P.z);
    cerca(proyPlanta(Q), [206.9458, 368.4785]);
    cerca(proyAlzado(Q), [206.9458, 143.2737]);
    cerca(proyPlanta(R), [236.0062, 296.5023]);
    cerca(proyAlzado(R), [236.0062, 205.0642]);
    cerca(proyPlanta(S), [330.7405, 321.8639]);
    cerca(proyAlzado(S), [330.7405, 190.0522]);
    expect(enMm(P.z - Q.z)).toBeCloseTo(5.2959, 3);
    expect(enMm(P.z - S.z)).toBeCloseTo(21.7983, 3);
    expect(enMm(P.z - R.z)).toBeCloseTo(27.0942, 3);
  });

  it('el primer cambio pone ABC de canto, y P₄ en la paralela a 20 mm', () => {
    const [A4, B4, C4, P4] = [A, B, C, P].map(v4);
    cerca(A4, [512.3978, 474.0427]);
    cerca(B4, [451.8219, 388.9241]);
    cerca(C4, [420.0143, 344.2266]);
    cerca(P4, [537.9082, 412.1128]);
    const u: P2 = [A4[0] - C4[0], A4[1] - C4[1]];
    const fuera = (X: P2) => Math.abs((X[0] - C4[0]) * u[1] - (X[1] - C4[1]) * u[0]) / Math.hypot(...u);
    expect(fuera(B4)).toBeLessThan(0.01);
    expect(enMm(fuera(P4))).toBeCloseTo(20, 2);
    expect(enMm(P.z - C.z)).toBeCloseTo(43.3134, 3);
  });

  it('el segundo cambio pone el cuadrado en verdadera magnitud', () => {
    const [B5, C5, P5, Q5, R5, S5] = [B, C, P, Q, R, S].map(v5);
    cerca(B5, [321.4606, 481.6951]);
    cerca(C5, [105.6816, 567.9201]);
    cerca(P5, [314.5402, 571.0717]);
    cerca(Q5, [222.4109, 607.8864]);
    cerca(R5, [185.5961, 515.7571]);
    cerca(S5, [277.7254, 478.9423]);
    expect(enMm(d2(P5, Q5))).toBeCloseTo(35, 3);
    expect(enMm(d2(P5, S5))).toBeCloseTo(35, 3);
    expect(enMm(d2(Q5, R5))).toBeCloseTo(35, 3);
  });
});
