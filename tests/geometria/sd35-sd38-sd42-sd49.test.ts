import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  PT_MM,
  corteRectaPlano,
  enPlano,
  plano,
  proyAlzado,
  proyPlanta,
  punto3,
  puntoEnPlanoDesdeAlzado,
  rectaPorPuntos,
  vm,
  vmAlzado,
  vmPlanta,
  type P2,
  type P3,
} from '../../src/lib/diedrico';
import type { DatosLamina } from '../../src/lib/lamina';

/* Los Ejercicios 27 (SD35), 28 (SD38), 30 (SD42) y 34 (SD49) de la Colección de
   ejercicios de diédrico (Dpto. de Expresión Gráfica y Proyectos de Ingeniería,
   EIG, UPV/EHU), págs. 28, 29, 31 y 35, del tema 4: la sección de un prisma por
   un plano, el cuadrado cortado por una placa, el prisma que atraviesa una
   pirámide y el túnel del funicular.

   Las coordenadas son las de sus láminas. Las cifras esperadas salen de un
   guion aparte, escrito el 8 de octubre de 2026: álgebra de vectores sobre esas
   mismas coordenadas, sin importar nada de `src/lib/`. Aquí se cotejan contra
   `lib/diedrico`. */

const lamina = (c: string) => JSON.parse(readFileSync(join(process.cwd(), 'src', 'content', 'laminas', `${c}.json`), 'utf8')) as DatosLamina;
const punto = (L: DatosLamina, n: string): P2 => [L.puntos[n].x, L.puntos[n].y];
const seg = (L: DatosLamina, n: string): [P2, P2] => {
  const s = L.segmentos.find((x) => x.nombre === n);
  if (!s) throw new Error(`no está el segmento ${n}`);
  return [s.a, s.b];
};
const cerca = (p: P2, [x, y]: readonly [number, number], d = 2) => {
  expect(p[0]).toBeCloseTo(x, d);
  expect(p[1]).toBeCloseTo(y, d);
};
const cerca3 = (p: P3, [x, y, z]: readonly [number, number, number], d = 2) => {
  expect(p.x).toBeCloseTo(x, d);
  expect(p.y).toBeCloseTo(y, d);
  expect(p.z).toBeCloseTo(z, d);
};
const mm = (pt: number) => pt * PT_MM;
const d2 = (a: P2, b: P2) => Math.hypot(a[0] - b[0], a[1] - b[1]);
/** El cruce de las rectas ab y cd del papel, prolongadas. */
const cruce = (a: P2, b: P2, c: P2, d: P2): P2 => {
  const r: P2 = [b[0] - a[0], b[1] - a[1]];
  const s: P2 = [d[0] - c[0], d[1] - c[1]];
  const t = ((c[0] - a[0]) * s[1] - (c[1] - a[1]) * s[0]) / (r[0] * s[1] - r[1] * s[0]);
  return [a[0] + t * r[0], a[1] + t * r[1]];
};
const vertical = (p: P2): P2 => [p[0], p[1] - 10];
/** La paralela a ab por p, como segundo punto. */
const paralela = (p: P2, [a, b]: readonly [P2, P2]): P2 => [p[0] + b[0] - a[0], p[1] + b[1] - a[1]];
const corte = (P: P3, Q: P3, pl: ReturnType<typeof plano>) => corteRectaPlano(rectaPorPuntos(P, Q), pl);

describe('SD35 · la sección del prisma ABCD-EFGH por el plano MNOP', () => {
  const L = lamina('sd35');
  const p = (n: string) => punto(L, n);
  const [N, O, P] = ['N', 'O', 'P'].map((n) => punto3(p(`${n}2`), p(`${n}1`)));
  const mnop = plano(N, O, P);
  const AH2 = seg(L, 'AH2');
  const BG1 = seg(L, 'BG1');
  const G2 = cruce(p('B2'), paralela(p('B2'), AH2), p('G1'), vertical(p('G1')));
  const F2 = cruce(p('C2'), paralela(p('C2'), AH2), p('F1'), vertical(p('F1')));
  const E2 = cruce(p('D2'), paralela(p('D2'), AH2), p('E1'), vertical(p('E1')));
  const A1 = cruce(p('H1'), paralela(p('H1'), BG1), p('A2'), vertical(p('A2')));
  const C1 = cruce(p('F1'), paralela(p('F1'), BG1), p('C2'), vertical(p('C2')));
  const D1 = cruce(p('E1'), paralela(p('E1'), BG1), p('D2'), vertical(p('D2')));
  const [A, B, C, D] = [punto3(p('A2'), A1), punto3(p('B2'), p('B1')), punto3(p('C2'), C1), punto3(p('D2'), D1)];
  const [E, F, G, H] = [punto3(E2, p('E1')), punto3(F2, p('F1')), punto3(G2, p('G1')), punto3(p('H2'), p('H1'))];
  const [I, J, K, Lq] = [corte(A, H, mnop), corte(B, G, mnop), corte(C, F, mnop), corte(D, E, mnop)];

  it('M₁ no está en la vertical de M₂, pero M, por su alzado, cae en el plano de N, O y P', () => {
    expect(Math.abs(p('M2')[0] - p('M1')[0])).toBeCloseTo(0.72, 2);
    expect(enPlano(puntoEnPlanoDesdeAlzado(p('M2'), mnop), mnop)).toBe(true);
  });

  it('las vistas se completan con paralelas a A₂H₂ y a B₁G₁', () => {
    cerca(G2, [459.6, 217.4854]);
    cerca(F2, [474.96, 293.1442]);
    cerca(E2, [417.6, 268.0188]);
    cerca(A1, [262.44, 633.5215]);
    cerca(C1, [332.64, 618.8625]);
    cerca(D1, [276.24, 576.184]);
    /* las bases no son del todo iguales: las aristas laterales van de 66,8 a 68,0 mm */
    expect(mm(vm(A, H))).toBeCloseTo(66.7747, 3);
    expect(mm(vm(C, F))).toBeCloseTo(67.9784, 3);
  });

  it('las cuatro aristas laterales atraviesan la placa: la sección IJKL', () => {
    cerca3(I, [340.6545, 578.2446, -227.9369]);
    cerca3(J, [416.4781, 607.1958, -242.3962]);
    cerca3(K, [439.2689, 543.5042, -313.7624]);
    cerca3(Lq, [363.4453, 514.553, -299.303]);
    expect(mm(vm(I, J))).toBeCloseTo(29.0832, 3);
    expect(mm(vm(J, K))).toBeCloseTo(34.6893, 3);
    expect(mm(vmPlanta(J, K))).toBeCloseTo(23.8642, 3);
    expect(mm(vmAlzado(J, K))).toBeCloseTo(26.429, 3);
  });

  it('en el papel: el plano de canto de BG da J₁, y las paralelas a 1₁2₁ dan I₁', () => {
    const q1 = cruce(p('B2'), G2, p('M2'), p('N2'));
    const q2 = cruce(p('B2'), G2, p('O2'), p('P2'));
    const q1p = cruce(q1, vertical(q1), p('M1'), p('N1'));
    const q2p = cruce(q2, vertical(q2), p('O1'), p('P1'));
    expect(d2(cruce(q1p, q2p, ...BG1), proyPlanta(J))).toBeLessThan(0.02);
    const q3 = cruce(...AH2, p('M2'), p('N2'));
    const q3p = cruce(q3, vertical(q3), p('M1'), p('N1'));
    expect(d2(cruce(q3p, paralela(q3p, [q1p, q2p]), p('H1'), A1), proyPlanta(I))).toBeLessThan(0.02);
  });
});

describe('SD38 · el cuadrado de centro O y su intersección con ABCD', () => {
  const L = lamina('sd38');
  const p = (n: string) => punto(L, n);
  const [O, A, B, C, D] = ['O', 'A', 'B', 'C', 'D'].map((n) => punto3(p(`${n}2`), p(`${n}1`)));
  const [r2, r1] = [seg(L, 'r2'), seg(L, 'r1')];
  const [R, S] = [punto3(r2[0], r1[0]), punto3(r2[1], r1[1])];
  const u = (() => {
    const d = { x: S.x - R.x, y: S.y - R.y, z: S.z - R.z };
    const l = Math.hypot(d.x, d.y, d.z);
    return { x: d.x / l, y: d.y / l, z: d.z / l };
  })();
  const t = (O.x - R.x) * u.x + (O.y - R.y) * u.y + (O.z - R.z) * u.z;
  const M: P3 = { x: R.x + t * u.x, y: R.y + t * u.y, z: R.z + t * u.z };
  const h = vm(O, M);
  const E: P3 = { x: M.x + h * u.x, y: M.y + h * u.y, z: M.z + h * u.z };
  const F: P3 = { x: M.x - h * u.x, y: M.y - h * u.y, z: M.z - h * u.z };
  const G: P3 = { x: 2 * O.x - E.x, y: 2 * O.y - E.y, z: 2 * O.z - E.z };
  const H: P3 = { x: 2 * O.x - F.x, y: 2 * O.y - F.y, z: 2 * O.z - F.z };
  const [abcd, efgh] = [plano(A, B, C), plano(E, F, G)];

  it('r es horizontal, y M₁ es el pie de la perpendicular a r₁ por O₁', () => {
    expect(r2[0][1]).toBe(r2[1][1]);
    cerca(proyPlanta(M), [200.9718, 487.6088]);
    /* el ángulo recto se ve en la planta */
    const [m, o, s] = [proyPlanta(M), proyPlanta(O), proyPlanta(S)];
    expect(Math.abs((o[0] - m[0]) * (s[0] - m[0]) + (o[1] - m[1]) * (s[1] - m[1]))).toBeLessThan(1e-6);
  });

  it('OM, medio lado, mide 23,24 mm; el lado, 46,47', () => {
    expect(mm(h)).toBeCloseTo(23.236, 3);
    expect(mm(vm(E, F))).toBeCloseTo(46.472, 3);
    expect(mm(vmPlanta(O, M))).toBeCloseTo(14.7042, 3);
    expect(mm(O.z - M.z)).toBeCloseTo(17.9917, 3);
    expect(mm(vmPlanta(F, G))).toBeCloseTo(29.4083, 3);
    expect(mm(vmAlzado(E, F))).toBeCloseTo(43.671, 3);
  });

  it('los vértices E, F, G y H', () => {
    cerca3(E, [262.8678, 465.0876, -303]);
    cerca3(F, [139.0759, 510.1301, -303]);
    cerca3(G, [110.5722, 431.7924, -201]);
    cerca3(H, [234.3641, 386.7499, -201]);
  });

  it('CD atraviesa el cuadrado en I y GH atraviesa ABCD en J; K y L caen fuera de la otra placa', () => {
    const I = corte(C, D, efgh);
    const J = corte(G, H, abcd);
    const K = corte(E, F, abcd);
    const Lq = corte(A, B, efgh);
    cerca3(I, [166.0706, 478.1828, -277.56]);
    cerca3(J, [220.6894, 391.7255, -201]);
    cerca3(K, [147.9215, 506.9116, -303]);
    cerca3(Lq, [235.243, 368.6883, -180.6]);
    /* en la recta común, de izquierda a derecha: K, I, J y L */
    expect(K.x).toBeLessThan(I.x);
    expect(I.x).toBeLessThan(J.x);
    expect(J.x).toBeLessThan(Lq.x);
  });

  it('en el papel: la horizontal 1₁2₁ corta C₁D₁ en I₁, y 3₁4₁ corta G₁H₁ en J₁', () => {
    const I = corte(C, D, efgh);
    const J = corte(G, H, abcd);
    const [E2, F2, G2, H2] = [E, F, G, H].map(proyAlzado);
    const [E1, F1, G1, H1] = [E, F, G, H].map(proyPlanta);
    const p1 = cruce(p('C2'), p('D2'), F2, G2);
    const p2 = cruce(p('C2'), p('D2'), E2, H2);
    const p1p = cruce(p1, vertical(p1), F1, G1);
    const p2p = cruce(p2, vertical(p2), E1, H1);
    expect(d2(cruce(p1p, p2p, p('C1'), p('D1')), proyPlanta(I))).toBeLessThan(0.01);
    const p3 = cruce(G2, H2, p('D2'), p('A2'));
    const p4 = cruce(G2, H2, p('C2'), p('B2'));
    const p3p = cruce(p3, vertical(p3), p('D1'), p('A1'));
    const p4p = cruce(p4, vertical(p4), p('C1'), p('B1'));
    expect(d2(cruce(p3p, p4p, G1, H1), proyPlanta(J))).toBeLessThan(0.01);
  });
});

describe('SD42 · el prisma triangular que atraviesa la pirámide', () => {
  const L = lamina('sd42');
  const p = (n: string) => punto(L, n);
  const [V, A, B, C, D, E, F] = ['V', 'A', 'B', 'C', 'D', 'E', 'F'].map((n) => punto3(p(`${n}2`), p(`${n}1`)));
  const [Dp, Ep, Fp] = ['D', 'E', 'F'].map((n) => punto3(p(`${n}2`), p(`${n}1p`)));
  const [vab, vbc, vca] = [plano(V, A, B), plano(V, B, C), plano(V, C, A)];
  const [de, fd] = [plano(D, E, Dp), plano(F, D, Fp)];

  it('la entrada G M H I N y la salida J K L', () => {
    cerca3(corte(D, Dp, vab), [210.36, 462.771, -301.8]);
    cerca3(corte(E, Ep, vbc), [272.64, 492.9986, -221.04]);
    cerca3(corte(F, Fp, vbc), [306.72, 468.8372, -277.68]);
    cerca3(corte(D, Dp, vca), [210.36, 443.7437, -301.8]);
    cerca3(corte(E, Ep, vca), [272.64, 451.0515, -221.04]);
    cerca3(corte(F, Fp, vca), [306.72, 422.8865, -277.68]);
    cerca3(corte(V, B, de), [254.7691, 527.0265, -244.2137]);
    cerca3(corte(V, B, fd), [250.0269, 552.8226, -291.8709]);
  });

  it('MN, lo que de VB queda dentro del prisma, mide 19,19 mm', () => {
    const [M, N] = [corte(V, B, de), corte(V, B, fd)];
    expect(mm(vm(M, N))).toBeCloseTo(19.1904, 3);
    expect(mm(vmPlanta(M, N))).toBeCloseTo(9.2528, 3);
    expect(mm(vmAlzado(M, N))).toBeCloseTo(16.8954, 3);
  });

  it('en el papel: la sección horizontal a la altura de DD′, por homotecia desde V, da G₁', () => {
    const s1 = cruce(p('D2'), [p('D2')[0] - 10, p('D2')[1]], p('V2'), p('A2'));
    const s1p = cruce(s1, vertical(s1), p('V1'), p('A1'));
    const G1 = cruce(s1p, paralela(s1p, [p('A1'), p('B1')]), p('D1'), p('D1p'));
    expect(d2(G1, proyPlanta(corte(D, Dp, vab)))).toBeLessThan(0.01);
  });
});

describe('SD49 · el túnel del funicular', () => {
  const L = lamina('sd49');
  const p = (n: string) => punto(L, n);
  const q = (a: string, b: string) => punto3(p(a), p(b));
  const [A, B, C, D, E, F] = [q('A2', 'A1'), q('B2', 'B1'), q('C2', 'C1'), q('D2', 'D1'), q('E2', 'E1'), q('F2', 'E1')];
  const [Ap, Cp, Ep] = [q('A2p', 'A1p'), q('C2p', 'C1p'), q('E2p', 'E1p')];
  const [G, H, I, J] = [q('G2', 'G1'), q('H2', 'H1'), q('I2', 'I1'), q('J2', 'J1')];
  const [Gp, Hp, Ip, Jp] = [q('G2p', 'G1p'), q('H2p', 'H1p'), q('I2p', 'I1p'), q('J2p', 'J1p')];
  const [ladera1, ladera2, cortado] = [plano(A, B, Ap), plano(C, D, Cp), plano(E, F, Ep)];

  it('las caras GG′I′I y HH′J′J del funicular son verticales: G₁G′₁ pasa por I₁, y H₁H′₁ por J₁', () => {
    const fuera = (x: P2, a: P2, b: P2) => Math.abs((b[0] - a[0]) * (x[1] - a[1]) - (b[1] - a[1]) * (x[0] - a[0])) / d2(a, b);
    expect(fuera(p('I1'), p('G1'), p('G1p'))).toBeLessThan(0.1);
    expect(fuera(p('J1'), p('H1'), p('H1p'))).toBeLessThan(0.1);
  });

  it('las entradas, por las laderas, y las salidas, por el cortado', () => {
    cerca3(corte(G, Gp, ladera2), [328.6929, 513.2513, -222.5344]);
    cerca3(corte(H, Hp, ladera2), [384.4184, 603.8678, -211.4433]);
    cerca3(corte(I, Ip, ladera1), [283.4283, 525.355, -334.4756]);
    cerca3(corte(J, Jp, ladera1), [339.1754, 616.0172, -323.4053]);
    cerca3(corte(G, Gp, cortado), [393.3397, 495.942, -198.2441]);
    cerca3(corte(H, Hp, cortado), [446.0828, 587.3326, -188.2392]);
    cerca3(corte(I, Ip, cortado), [393.3317, 495.9282, -293.0179]);
    cerca3(corte(J, Jp, cortado), [446.1128, 587.3846, -283.0665]);
  });

  it('la boca de salida mide 33,43 mm de alto, más que la cabina, de 31,53', () => {
    const [P, Q, R] = [corte(G, Gp, cortado), corte(H, Hp, cortado), corte(I, Ip, cortado)];
    expect(mm(vm(P, R))).toBeCloseTo(33.4341, 3);
    expect(mm(vm(P, Q))).toBeCloseTo(37.3914, 3);
    expect(mm(vm(G, I))).toBeCloseTo(31.534, 3);
    expect(mm(vm(G, H))).toBeCloseTo(35.9928, 3);
  });

  it('en el papel: la pared de atrás, subida al alzado, da K₂ en G₂G′₂', () => {
    const GG1 = seg(L, 'GG1');
    const U1 = cruce(...GG1, ...seg(L, 'CC1'));
    const Z21 = cruce(...GG1, ...seg(L, 'DD1'));
    const U2 = cruce(U1, vertical(U1), ...seg(L, 'BB2'));
    const Z22 = cruce(Z21, vertical(Z21), ...seg(L, 'DD2'));
    const K2 = cruce(...seg(L, 'GG2'), U2, Z22);
    expect(d2(K2, proyAlzado(corte(G, Gp, ladera2)))).toBeLessThan(0.05);
  });
});
