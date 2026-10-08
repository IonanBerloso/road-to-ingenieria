import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  PT_MM,
  abatido,
  abatidoJunto,
  anguloDiedro,
  anguloPlanoConPH,
  corteRectaPlano,
  enPlano,
  gira,
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
} from '../../src/lib/diedrico';
import type { DatosLamina } from '../../src/lib/lamina';

/* Los Ejercicios 29 (SD41), 31 (SD43) y 32 (SD44) de la Colección de
   ejercicios de diédrico (Dpto. de Expresión Gráfica y Proyectos de
   Ingeniería, EIG, UPV/EHU), págs. 30, 32 y 33, del tema 4: una chimenea a
   través de una cubierta piramidal, una torre hexagonal sobre dos faldones y
   un canal a través de un terraplén.

   Las coordenadas son las de sus láminas. Las cifras esperadas salen de un
   guion aparte, escrito el 8 de octubre de 2026: álgebra de vectores sobre esas
   mismas coordenadas, sin importar nada de `src/lib/`. Aquí se cotejan contra
   `lib/diedrico`. */

const lamina = (c: string) => JSON.parse(readFileSync(join(process.cwd(), 'src', 'content', 'laminas', `${c}.json`), 'utf8')) as DatosLamina;
const pt = (L: DatosLamina, n: string): P2 => [L.puntos[n].x, L.puntos[n].y];
const P = (L: DatosLamina, alzado: string, planta: string): P3 => punto3(pt(L, alzado), pt(L, planta));
const cerca = (p: P2, [x, y]: readonly [number, number], d = 2) => {
  expect(p[0]).toBeCloseTo(x, d);
  expect(p[1]).toBeCloseTo(y, d);
};
const mm = (v: number) => v * PT_MM;
const baja = (X: P3): P3 => ({ ...X, z: X.z - 50 });
/** El cruce de las rectas ab y cd del papel, prolongadas. */
const cruce = (a: P2, b: P2, c: P2, d: P2): P2 => {
  const r: P2 = [b[0] - a[0], b[1] - a[1]];
  const s: P2 = [d[0] - c[0], d[1] - c[1]];
  const t = ((c[0] - a[0]) * s[1] - (c[1] - a[1]) * s[0]) / (r[0] * s[1] - r[1] * s[0]);
  return [a[0] + t * r[0], a[1] + t * r[1]];
};

describe('SD41 · la chimenea a través de la cubierta piramidal', () => {
  const L = lamina('sd41');
  const [V, A, B] = [P(L, 'V2', 'V1'), P(L, 'A2', 'A1'), P(L, 'B2', 'B1')];
  const [C, D] = [P(L, 'B2', 'C1'), P(L, 'A2', 'D1')];
  const [Pc, Q, R] = [P(L, 'P2', 'P1'), P(L, 'Q2', 'Q1'), P(L, 'R2', 'R1')];
  const [vab, vbc, vcd] = [plano(V, A, B), plano(V, B, C), plano(V, C, D)];
  const [cpq, cqr, crp] = [plano(Pc, Q, baja(Pc)), plano(Q, R, baja(Q)), plano(R, Pc, baja(R))];
  const E = corteRectaPlano(rectaPorPuntos(Pc, baja(Pc)), vab);
  const F = corteRectaPlano(rectaPorPuntos(Q, baja(Q)), vbc);
  const G = corteRectaPlano(rectaPorPuntos(R, baja(R)), vcd);
  const H = corteRectaPlano(rectaPorPuntos(V, B), crp);
  const I = corteRectaPlano(rectaPorPuntos(V, B), cpq);
  const J = corteRectaPlano(rectaPorPuntos(V, C), crp);
  const K = corteRectaPlano(rectaPorPuntos(V, C), cqr);

  it('la intersección en el alzado: E a la altura de I, G a la de L, y F, H, I, J y K en V₂B₂', () => {
    cerca(proyAlzado(E), [248.5, 318.8479]);
    cerca(proyAlzado(F), [353.38, 402.4184]);
    cerca(proyAlzado(G), [300.94, 390.7369]);
    cerca(proyAlzado(H), [256.8466, 283.6907]);
    cerca(proyAlzado(I), [285.4317, 318.8479]);
    cerca(proyAlzado(J), [283.2301, 316.1401]);
    cerca(proyAlzado(K), [310.645, 349.858]);
    cerca(proyPlanta(J), [283.2301, 573.469]);
    /* la vertiente de la derecha es de canto: todo lo suyo, sobre V₂B₂ */
    for (const X of [F, H, I, J, K]) expect(enPlano(X, vbc)).toBe(true);
    /* L, donde la horizontal de R₁ corta V₁C₁, tiene la cota de G */
    const L1 = cruce(pt(L, 'R1'), [pt(L, 'R1')[0] + 10, pt(L, 'R1')[1]], pt(L, 'V1'), pt(L, 'C1'));
    expect(puntoEnPlanoDesdePlanta(L1, vcd).z).toBeCloseTo(G.z, 3);
  });

  it('el desarrollo: VBC abatida sobre su alero, y VAB y VCD giradas alrededor de VB y VC', () => {
    const cb = rectaPorPuntos(C, B);
    const V0 = abatido(V, cb, vbc)[0];
    cerca(proyPlanta(V0), [614.8033, 543.75]);
    const junto = (X: P3) => proyPlanta(abatidoJunto(X, cb, vbc, V0, V));
    cerca(junto(H), [564.0998, 527.4641]);
    cerca(junto(I), [518.7884, 512.91]);
    cerca(junto(F), [411.0804, 512.91]);
    cerca(junto(K), [478.8216, 587.4273]);
    cerca(junto(J), [522.2783, 573.469]);
    const d = anguloDiedro(A, rectaPorPuntos(V, B), C);
    expect(d).toBeCloseTo(103.9632, 3);
    /* de los dos giros de 180° − diedro, el que deja el punto en el plano de VBC */
    const alPlano = (X: P3, a: P3, b: P3) => {
      const [p, q] = [gira(X, rectaPorPuntos(a, b), 180 - d), gira(X, rectaPorPuntos(a, b), d - 180)];
      return enPlano(p, vbc) ? p : q;
    };
    const [Ag, Eg, Dg, Gg] = [alPlano(A, V, B), alPlano(E, V, B), alPlano(D, V, C), alPlano(G, V, C)];
    for (const X of [Ag, Eg, Dg, Gg]) expect(enPlano(X, vbc)).toBe(true);
    cerca(junto(Ag), [498.8402, 379.834]);
    cerca(junto(Eg), [548.938, 491.5805]);
    cerca(junto(Dg), [498.8402, 707.666]);
    cerca(junto(Gg), [461.1923, 629.1508]);
    expect(mm(vm(abatidoJunto(Ag, cb, vbc, V0, V), V0))).toBeCloseTo(70.8336, 3);
    expect(mm(vm(abatidoJunto(Ag, cb, vbc, V0, V), B))).toBeCloseTo(53.213, 3);
  });

  it('JG mide 29,16 mm; en el alzado 27,05 y en la planta 12,56', () => {
    expect(mm(vm(J, G))).toBeCloseTo(29.1591, 3);
    expect(mm(vmAlzado(J, G))).toBeCloseTo(27.0476, 3);
    expect(mm(vmPlanta(J, G))).toBeCloseTo(12.5585, 3);
  });
});

describe('SD43 · la torre hexagonal sobre los faldones α y β', () => {
  const L = lamina('sd43');
  const [A, B] = [P(L, 'A2', 'A1'), P(L, 'B2', 'B1')];
  const [K, Lp, M, N] = [P(L, 'A2', 'K1'), P(L, 'B2', 'L1'), P(L, 'M2', 'M1'), P(L, 'N2', 'N1')];
  const [alfa, beta] = [plano(A, B, K), plano(A, B, M)];
  const enBeta = (n: string) => puntoEnPlanoDesdePlanta(pt(L, n), beta);
  const enAlfa = (n: string) => puntoEnPlanoDesdePlanta(pt(L, n), alfa);
  const [C, D, E, F] = ['C1', 'D1', 'E1', 'F1'].map(enBeta);
  const [G, H] = ['G1', 'H1'].map(enAlfa);
  const seg = (n: string) => L.segmentos.find((s) => s.nombre === n)!;
  const I = puntoEnPlanoDesdePlanta(cruce(seg('AB1b').a, seg('AB1b').b, seg('HC1').a, seg('HC1').b), alfa);
  const J = puntoEnPlanoDesdePlanta(cruce(seg('AB1b').a, seg('AB1b').b, seg('FG1').a, seg('FG1').b), alfa);

  it('los pies de la torre: G y H en α, sobre A₂B₂; C, D, E y F en β; I y J en los dos', () => {
    expect(enPlano(Lp, alfa)).toBe(true);
    expect(enPlano(N, beta)).toBe(true);
    cerca(proyAlzado(C), [162.48, 280.1141]);
    cerca(proyAlzado(D), [214.68, 256.3425]);
    cerca(proyAlzado(E), [266.76, 280.1141]);
    cerca(proyAlzado(F), [266.76, 327.5626]);
    cerca(proyAlzado(G), [214.68, 329.8708]);
    cerca(proyAlzado(H), [162.48, 289.7169]);
    cerca(proyAlzado(I), [162.48, 289.7169]);
    cerca(proyAlzado(J), [232.1938, 343.3429]);
    expect(enPlano(I, beta)).toBe(true);
    expect(enPlano(J, beta)).toBe(true);
  });

  it('en verdadera magnitud: α sobre el frontal de KL, β sobre el horizontal de su alero BN', () => {
    const kl = rectaPorPuntos(K, Lp);
    const H0 = abatido(H, kl, alfa)[0];
    cerca(proyAlzado(H0), [112.3618, 354.8706]);
    const ja = (X: P3) => proyAlzado(abatidoJunto(X, kl, alfa, H0, H));
    cerca(ja(I), [83.1368, 392.8631]);
    cerca(ja(G), [182.9263, 371.1506]);
    cerca(ja(J), [194.2644, 392.6513]);
    const bn = rectaPorPuntos(B, N);
    const A0 = abatido(A, bn, beta)[0];
    cerca(proyPlanta(A0), [107.52, 759.002]);
    const jb = (X: P3) => abatidoJunto(X, bn, beta, A0, A);
    cerca(proyPlanta(jb(C)), [162.48, 706.2615]);
    cerca(proyPlanta(jb(D)), [214.68, 744.6321]);
    cerca(proyPlanta(jb(E)), [266.76, 706.2615]);
    cerca(proyPlanta(jb(F)), [266.76, 629.6732]);
    cerca(proyPlanta(jb(I)), [162.48, 690.7455]);
    cerca(proyPlanta(jb(J)), [232.1938, 604.2043]);
    expect(mm(vm(jb(E), jb(F)))).toBeCloseTo(27.0187, 3);
  });

  it('EF mide 27,02 mm; 21,21 en la planta y 16,74 en el alzado', () => {
    expect(mm(vm(E, F))).toBeCloseTo(27.0187, 3);
    expect(mm(vmPlanta(E, F))).toBeCloseTo(21.209, 3);
    expect(mm(vmAlzado(E, F))).toBeCloseTo(16.7388, 3);
  });
});

describe('SD44 · el canal a través del terraplén', () => {
  const L = lamina('sd44');
  const X = (n: string) => P(L, `${n}2`, `${n}1`);
  const [A, B, C, D, E, , , H] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(X);
  const [K, Lc, M, N, Pc, Q, R, S] = ['K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S'].map(X);
  const [atras, delante, fondo] = [plano(A, E, B), plano(D, H, C), plano(Lc, Q, M)];

  it('las aristas del canal atraviesan los dos taludes en 1 a 8', () => {
    const corta = (a: P3, b: P3, pl: ReturnType<typeof plano>) => corteRectaPlano(rectaPorPuntos(a, b), pl);
    cerca(proyPlanta(corta(K, Pc, atras)), [161.2976, 468.0583]);
    cerca(proyPlanta(corta(Lc, Q, atras)), [143.1461, 440.9833]);
    cerca(proyPlanta(corta(M, R, atras)), [171.9025, 424.3749]);
    cerca(proyPlanta(corta(N, S, atras)), [218.8923, 434.7941]);
    cerca(proyPlanta(corta(K, Pc, delante)), [190.1446, 484.7053]);
    cerca(proyPlanta(corta(Lc, Q, delante)), [236.9466, 495.1599]);
    cerca(proyPlanta(corta(M, R, delante)), [265.7461, 478.5286]);
    cerca(proyPlanta(corta(N, S, delante)), [247.7349, 451.4477]);
    /* las de arriba, a la cota de la coronación; las del fondo, a la suya */
    expect(proyAlzado(corta(K, Pc, atras))[1]).toBeCloseTo(233.79, 2);
    expect(proyAlzado(corta(Lc, Q, delante))[1]).toBeCloseTo(268.51, 2);
  });

  it('T y U, los puntos del extremo del terraplén a la cota del fondo, dan las horizontales de los taludes', () => {
    const T = corteRectaPlano(rectaPorPuntos(A, B), fondo);
    const U = corteRectaPlano(rectaPorPuntos(D, C), fondo);
    cerca(proyPlanta(T), [109.3863, 460.4816]);
    cerca(proyPlanta(U), [156.2637, 541.7531]);
    cerca(proyAlzado(T), [109.3863, 268.51]);
  });

  it('los taludes forman 46,87° y 46,93° con el suelo', () => {
    expect(anguloPlanoConPH(atras)).toBeCloseTo(46.8707, 3);
    expect(anguloPlanoConPH(delante)).toBeCloseTo(46.928, 3);
    expect(mm(vmPlanta(A, B))).toBeCloseTo(15.2475, 3);
    expect(mm(Math.abs(B.z - A.z))).toBeCloseTo(16.2772, 3);
  });
});
