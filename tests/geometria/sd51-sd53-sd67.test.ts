import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  PT_MM,
  cambioPlano,
  corteRectaPlano,
  distanciaAPlano,
  gira,
  perpendicularAPlano,
  pieEnRecta,
  plano,
  planoPorLmp,
  poligonoRegular,
  proyAlzado,
  proyPlanta,
  punto3,
  rectaPorPuntos,
  simetrico,
  vm,
  vmAlzado,
  vmPlanta,
  type P2,
  type P3,
  type Plano,
  type Recta2,
} from '../../src/lib/diedrico';
import type { DatosLamina } from '../../src/lib/lamina';

/* Los Ejercicios 36 (SD51), 37 (SD53) y 51 (SD67, apartados a y b) de la
   Colección de ejercicios de diédrico (Dpto. de Expresión Gráfica y Proyectos
   de Ingeniería, EIG, UPV/EHU), págs. 37, 38 y 52, del tema 5.

   Las coordenadas son las de las láminas `sd51`, `sd53`, `sd67` y `sd67b` (la
   del apartado b, nuestra: la página con el prisma de a ya resuelto). Las
   cifras esperadas salen de un guion aparte, escrito el 8 de octubre de 2026:
   álgebra de vectores sobre esas mismas coordenadas, sin importar nada de
   `src/lib/`, con los cambios de plano hechos como en el papel y la
   visibilidad por rayos contra las caras opacas. Aquí se cotejan contra
   `lib/diedrico`. */

const lamina = (c: string) => JSON.parse(readFileSync(join(process.cwd(), 'src', 'content', 'laminas', `${c}.json`), 'utf8')) as DatosLamina;
const puntoDe = (L: DatosLamina, n: string): P3 => {
  const [a, p] = [L.puntos[`${n}2`], L.puntos[`${n}1`]];
  return punto3([a.x, a.y], [p.x, p.y]);
};
const cerca = (p: P2, [x, y]: readonly [number, number], d = 2) => {
  expect(p[0]).toBeCloseTo(x, d);
  expect(p[1]).toBeCloseTo(y, d);
};
const mm = (pt: number) => pt * PT_MM;
const lineaDe = (L: DatosLamina, n: string): Recta2 => {
  const s = L.segmentos.find((x) => x.nombre === n);
  if (!s) throw new Error(`no hay segmento ${n}`);
  return { p: s.a, d: [s.b[0] - s.a[0], s.b[1] - s.a[1]] };
};
const horizontalDe = (z: number): Plano => ({ n: { x: 0, y: 0, z: 1 }, d: z });

describe('SD51 · la pirámide recta de base rectangular, con el vértice en α', () => {
  const L = lamina('sd51');
  const [B, C, O] = ['B', 'C', 'O'].map((n) => puntoDe(L, n));
  const base = plano(B, C, O);
  const [D, E] = [simetrico(B, O), simetrico(C, O)];
  const V = corteRectaPlano(perpendicularAPlano(O, base), horizontalDe(-L.puntos.Ai.y));

  it('D y E, los simétricos de B y C respecto de O, en las dos vistas', () => {
    cerca(proyPlanta(D), [339.9600, 529.9200]);
    cerca(proyAlzado(D), [339.9600, 158.7600]);
    cerca(proyPlanta(E), [269.1600, 408.1200]);
    cerca(proyAlzado(E), [269.1600, 158.7600]);
  });

  it('O no equidista de B y C: con D y E simétricos respecto de O, la base sale con 91,7° en C', () => {
    const u = { x: C.x - B.x, y: C.y - B.y, z: C.z - B.z };
    const l = Math.hypot(u.x, u.y, u.z);
    const m = { x: (B.x + C.x) / 2, y: (B.y + C.y) / 2, z: (B.z + C.z) / 2 };
    expect(mm(((O.x - m.x) * u.x + (O.y - m.y) * u.y + (O.z - m.z) * u.z) / l)).toBeCloseTo(0.6580, 3);
  });

  it('V, en la perpendicular a la base por O y en α, por debajo de la base', () => {
    cerca(proyPlanta(V), [393.3967, 415.2236]);
    cerca(proyAlzado(V), [393.3967, 325.9200]);
    expect(V.z).toBeLessThan(B.z);
  });

  it('la altura, 65,83 mm, y sus errores', () => {
    expect(mm(vm(O, V))).toBeCloseTo(65.8292, 3);
    expect(mm(vmPlanta(O, V))).toBeCloseTo(50.6945, 3);
    expect(mm(vmAlzado(O, V))).toBeCloseTo(60.6996, 3);
    expect(mm(O.z - V.z)).toBeCloseTo(41.9947, 3);
    expect(mm(vm(V, B))).toBeCloseTo(73.9599, 3);
  });
});

describe('SD53 · la pirámide recta de base triangular y eje e', () => {
  const L = lamina('sd53');
  const [V, A, K] = ['V', 'A', 'K'].map((n) => puntoDe(L, n));
  const e = rectaPorPuntos(V, K);
  const O = pieEnRecta(A, e);
  const [g1, g2] = [gira(A, e, 120), gira(A, e, -120)];
  const [B, C] = g1.z > g2.z ? [g1, g2] : [g2, g1];
  const [n1, n2] = [lineaDe(L, 'nueva1'), lineaDe(L, 'nueva2')];
  const v4 = (X: P3) => cambioPlano(X, 'horizontal', n1, V);
  const v5 = (X: P3) => cambioPlano(X, 'horizontal', n1, V, n2);

  it('O, el centro de la base, donde el plano perpendicular a e por A corta e', () => {
    cerca(proyPlanta(O), [292.4495, 440.6493]);
    cerca(proyAlzado(O), [292.4495, 239.2151]);
  });

  it('B y C, A girado 120° alrededor de e, en las dos vistas (B, el de más cota)', () => {
    cerca(proyPlanta(B), [367.2139, 507.8421]);
    cerca(proyAlzado(B), [367.2139, 236.7214]);
    cerca(proyPlanta(C), [303.1345, 355.4657]);
    cerca(proyAlzado(C), [303.1345, 291.5639]);
  });

  it('las vistas 4 y 5: e en verdadera magnitud y de punta, y la base en verdadera magnitud', () => {
    cerca(v4(A), [441.3573, 298.6643]);
    cerca(v4(B), [496.4297, 296.9877]);
    cerca(v4(C), [325.8774, 302.1712]);
    cerca(v5(V), [431.0038, 621.2294]);
    /* e de punta: K₅ cae en V₅, a lo que dan los redondeos de la lámina */
    expect(Math.hypot(v5(K)[0] - v5(V)[0], v5(K)[1] - v5(V)[1])).toBeLessThan(0.05);
    cerca(v5(A), [454.1321, 719.0832]);
    cerca(v5(B), [504.1866, 552.2690]);
    cerca(v5(C), [334.6940, 592.3276]);
  });

  it('el lado, 61,44 mm, y sus errores', () => {
    expect(mm(vm(B, C))).toBeCloseTo(61.4405, 3);
    expect(mm(vm(O, A))).toBeCloseTo(35.4727, 3);
    expect(mm(vm(V, O))).toBeCloseTo(52.5923, 3);
    expect(mm(vm(V, A))).toBeCloseTo(63.4371, 3);
    expect(mm(vmPlanta(A, B))).toBeCloseTo(59.1251, 3);
    expect(mm(vmAlzado(B, C))).toBeCloseTo(29.7546, 3);
  });
});

describe('SD67 a) · el prisma hexagonal regular oblicuo', () => {
  const L = lamina('sd67');
  const [M, Ri, Rd, Ei, Ed] = ['M', 'Ri', 'Rd', 'Ei', 'Ed'].map((n) => puntoDe(L, n));
  const pi = planoPorLmp(rectaPorPuntos(Ri, Rd));
  const piM = planoPorLmp(rectaPorPuntos(M, { x: M.x + Rd.x - Ri.x, y: M.y + Rd.y - Ri.y, z: M.z + Rd.z - Ri.z }));
  const e = rectaPorPuntos(Ei, Ed);
  const [O, Op] = [corteRectaPlano(e, piM), corteRectaPlano(e, pi)];
  const base = poligonoRegular(piM, O, M, 6);
  const otra = base.map((X) => ({ x: X.x + Op.x - O.x, y: X.y + Op.y - O.y, z: X.z + Op.z - O.z }));
  const nombres = ['M', 'N', 'P', 'Q', 'S', 'T'];
  const esperado: Record<string, [number, number]> = {"O1": [879.0378, 605.046], "O2": [879.0378, 291.87], "Op1": [632.9567, 544.1925], "Op2": [632.9567, 291.87], "M1": [913.52, 656.84], "M2": [913.52, 257.36], "Mp1": [667.4389, 595.9864], "Mp2": [667.4389, 257.36], "N1": [844.9914, 665.0974], "N2": [844.9914, 274.629], "Np1": [598.9103, 604.2438], "Np2": [598.9103, 274.629], "P1": [810.5092, 613.3035], "P2": [810.5092, 309.139], "Pp1": [564.4281, 552.4499], "Pp2": [564.4281, 309.139], "Q1": [844.5556, 553.2521], "Q2": [844.5556, 326.38], "Qp1": [598.4745, 492.3985], "Qp2": [598.4745, 326.38], "S1": [913.0842, 544.9947], "S2": [913.0842, 309.111], "Sp1": [667.0031, 484.1411], "Sp2": [667.0031, 309.111], "T1": [947.5664, 596.7886], "T2": [947.5664, 274.601], "Tp1": [701.4853, 535.9351], "Tp2": [701.4853, 274.601], "O4": [963.5895, 548.7029], "M4": [1026.8118, 581.3453], "N4": [995.1787, 565.0164], "O5": [1004.8723, 468.7145], "M5": [1068.1119, 501.3232], "N5": [1064.732, 430.2517], "T5": [1008.2522, 539.786]};

  it('los centros O y O′, donde e corta los planos de las dos bases', () => {
    cerca(proyPlanta(O), esperado.O1);
    cerca(proyAlzado(O), esperado.O2);
    cerca(proyPlanta(Op), esperado.Op1);
    cerca(proyAlzado(Op), esperado.Op2);
  });

  it('M está en la recta de máxima pendiente del plano de su base que pasa por O', () => {
    const u = { x: M.x - O.x, y: M.y - O.y, z: M.z - O.z };
    const r = { x: Rd.x - Ri.x, y: Rd.y - Ri.y, z: Rd.z - Ri.z };
    const c = Math.hypot(u.y * r.z - u.z * r.y, u.z * r.x - u.x * r.z, u.x * r.y - u.y * r.x) / (Math.hypot(u.x, u.y, u.z) * Math.hypot(r.x, r.y, r.z));
    expect(c).toBeLessThan(0.001);
  });

  it('los doce vértices, en las dos vistas, y la otra base en π', () => {
    nombres.forEach((k, i) => {
      cerca(proyPlanta(base[i]), esperado[`${k}1`]);
      cerca(proyAlzado(base[i]), esperado[`${k}2`]);
      cerca(proyPlanta(otra[i]), esperado[`${k}p1`]);
      cerca(proyAlzado(otra[i]), esperado[`${k}p2`]);
      expect(distanciaAPlano(otra[i], pi)).toBeLessThan(1e-6);
    });
  });

  it('las vistas 4 y 5 del cambio de plano', () => {
    const [n1, n2] = [lineaDe(L, 'nueva1'), lineaDe(L, 'nueva2')];
    cerca(cambioPlano(O, 'vertical', n1, O), esperado.O4);
    cerca(cambioPlano(M, 'vertical', n1, O), esperado.M4);
    cerca(cambioPlano(base[1], 'vertical', n1, O), esperado.N4);
    cerca(cambioPlano(O, 'vertical', n1, O, n2), esperado.O5);
    cerca(cambioPlano(M, 'vertical', n1, O, n2), esperado.M5);
    cerca(cambioPlano(base[1], 'vertical', n1, O, n2), esperado.N5);
    cerca(cambioPlano(base[5], 'vertical', n1, O, n2), esperado.T5);
  });

  it('el lado, 25,10 mm; las aristas laterales, 89,43 mm, y sus errores', () => {
    expect(mm(vm(base[0], base[1]))).toBeCloseTo(25.1008, 3);
    expect(mm(vm(base[0], otra[0]))).toBeCloseTo(89.4269, 3);
    expect(mm(vmAlzado(base[0], otra[0]))).toBeCloseTo(86.8119, 3);
    expect(mm(distanciaAPlano(M, pi))).toBeCloseTo(32.0167, 3);
    expect(mm(vm(pieEnRecta(M, e), O))).toBeCloseTo(16.1952, 3);
  });
});

describe('SD67 b) · la sección por el plano proyectante vertical a 60°', () => {
  const L = lamina('sd67b');
  const nombres = ['M', 'N', 'P', 'Q', 'S', 'T'];
  const X = (n: string) => puntoDe(L, n);
  const [O, Op] = [X('O'), X('Op')];
  const G: P3 = { x: (O.x + Op.x) / 2, y: (O.y + Op.y) / 2, z: (O.z + Op.z) / 2 };
  const seccion = (s: 1 | -1) => {
    const pl = plano(G, { x: G.x + 10 * s, y: G.y, z: G.z + 10 * Math.sqrt(3) }, { x: G.x, y: G.y + 10, z: G.z });
    return nombres.map((k) => corteRectaPlano(rectaPorPuntos(X(k), X(`${k}p`)), pl));
  };
  const K = seccion(1);
  const Ki = seccion(-1);
  const esperado: Record<string, [number, number]> = {"G2": [756.0, 291.87], "K1_1": [775.9244, 622.8157], "K1_2": [775.9244, 257.36], "K1_4": [965.6967, 366.9286], "K2_1": [765.9535, 645.5529], "K2_2": [765.9535, 274.63], "K2_4": [975.4164, 395.5673], "K3_1": [746.0292, 597.3554], "K3_2": [746.0292, 309.14], "K3_4": [913.7517, 405.9777], "K4_1": [736.0756, 526.4254], "K4_2": [736.0756, 326.38], "K4_4": [842.3712, 387.7517], "K5_1": [746.0465, 503.6864], "K5_2": [746.0465, 309.11], "K5_4": [832.6499, 359.1121], "K6_1": [765.9708, 551.8846], "K6_2": [765.9708, 274.6], "K6_4": [894.3154, 348.7021]};

  it('G, y los seis puntos de la sección en las dos vistas', () => {
    cerca(proyAlzado(G), esperado.G2);
    K.forEach((k, i) => {
      cerca(proyPlanta(k), esperado[`K${i + 1}_1`]);
      cerca(proyAlzado(k), esperado[`K${i + 1}_2`]);
    });
  });

  it('la verdadera magnitud, con el cambio de plano de línea paralela a la traza', () => {
    const n = lineaDe(L, 'nueva');
    K.forEach((k, i) => cerca(cambioPlano(k, 'horizontal', n, K[4]), esperado[`K${i + 1}_4`]));
  });

  it('la diagonal mayor, 51,98 mm, y sus errores; el otro plano a 60°', () => {
    expect(mm(vm(K[1], K[4]))).toBeCloseTo(51.9809, 3);
    expect(mm(vmPlanta(K[1], K[4]))).toBeCloseTo(50.5377, 3);
    expect(mm(vmAlzado(K[1], K[4]))).toBeCloseTo(14.0455, 3);
    expect(mm(vm(K[0], K[3]))).toBeCloseTo(44.1223, 3);
    expect(mm(vm(Ki[1], Ki[4]))).toBeCloseTo(48.6457, 3);
  });
});
