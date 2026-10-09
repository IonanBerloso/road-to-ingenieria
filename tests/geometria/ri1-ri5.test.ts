import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';
import { describe, expect, it } from 'vitest';
import { resuelveEjercicio, type EjercicioConReceta } from '../../src/lib/construir';
import {
  PT_MM,
  abatidoPlanta,
  anguloConPH,
  anguloConPV,
  cambioPlano,
  corteRectaPlano,
  distanciaAPlano,
  enPlano,
  gira,
  pieEnPlano,
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
} from '../../src/lib/diedrico';
import type { DatosLamina } from '../../src/lib/lamina';

/* Los cinco ejemplos de entrada del diédrico (temas 2 a 6), sobre sus láminas
   nuestras, RI1 a RI5: la verdadera magnitud de AB con su triángulo, la misma
   con un cambio de plano, el punto en que una varilla atraviesa una placa, la
   distancia de un punto a un plano de canto y el ángulo de AB con el plano
   horizontal por un giro.

   Las láminas están en milímetros redondos, a escala 1:1. Las cifras
   esperadas salen de un guion aparte, escrito el 9 de octubre de 2026: álgebra
   de vectores sobre esas mismas coordenadas, sin importar nada de `src/lib/`.
   Aquí se cotejan contra `lib/diedrico` y contra la solución que el build saca
   de cada receta. */

const lamina = (c: string) => JSON.parse(readFileSync(join(process.cwd(), 'src', 'content', 'laminas', `${c}.json`), 'utf8')) as DatosLamina;
const pt = (L: DatosLamina, n: string): P2 => [L.puntos[n].x, L.puntos[n].y];
const P = (L: DatosLamina, alzado: string, planta: string): P3 => punto3(pt(L, alzado), pt(L, planta));
const cerca = (p: P2, [x, y]: readonly [number, number], d = 2) => {
  expect(p[0]).toBeCloseTo(x, d);
  expect(p[1]).toBeCloseTo(y, d);
};
const mm = (v: number) => v * PT_MM;
const ejemplo = (tema: string, id: string) =>
  (yaml.load(readFileSync(join(process.cwd(), 'src', 'content', 'expresion-grafica', tema, 'ejercicios.yaml'), 'utf8')) as {
    ejercicios: EjercicioConReceta[];
  }).ejercicios.find((e) => e.id === id)!;
/** La primera posición buena de cada objetivo del primer paso construir. */
const objetivos = (e: EjercicioConReceta, c: string) => {
  const [, paso] = [...resuelveEjercicio(e, lamina(c)).entries()][0];
  return Object.fromEntries(paso.objetivos.map((o) => [o.nombre, o.es.ramas[0]]));
};

describe('RI1 · tema 2: AB en verdadera magnitud con su triángulo', () => {
  const L = lamina('ri1');
  const [A, B] = [P(L, 'A2', 'A1'), P(L, 'B2', 'B1')];

  it('B está 27 mm a la derecha, 28 más alto y con 36 más de alejamiento que A', () => {
    expect(mm(B.x - A.x)).toBeCloseTo(26.9981, 3);
    expect(mm(B.z - A.z)).toBeCloseTo(28.0, 3);
    expect(mm(B.y - A.y)).toBeCloseTo(36.001, 3);
  });

  it('A₁B₁ mide 45 mm, A₂B₂ 38,90 y AB 53; con el alejamiento de cateto saldría 57,63', () => {
    expect(mm(vmPlanta(A, B))).toBeCloseTo(44.9996, 3);
    expect(mm(vmAlzado(A, B))).toBeCloseTo(38.896, 3);
    expect(mm(vm(A, B))).toBeCloseTo(52.9997, 3);
    expect(mm(Math.hypot(vmPlanta(A, B), B.y - A.y))).toBeCloseTo(57.6284, 3);
  });

  it('(B), a 28 mm de B₁ por la perpendicular, y A₁(B) es la verdadera magnitud', () => {
    const [, Bab] = abatidoPlanta(A, B);
    cerca(Bab, [267.5882, 337.891]);
    expect(mm(Math.hypot(Bab[0] - A.x, Bab[1] - A.y))).toBeCloseTo(52.9997, 3);
  });

  it('la receta del ejemplo pone H y (B) donde el cálculo aparte', () => {
    const o = objetivos(ejemplo('t02-punto-recta-y-plano', 'ri1-el-segmento-ab-y-su-triangulo'), 'ri1');
    cerca(o.H[0], [204.09, 226.77]);
    cerca(o.Bab[1], [267.5882, 337.891]);
  });
});

describe('RI2 · tema 3: AB en verdadera magnitud con un cambio de plano vertical', () => {
  const L = lamina('ri2');
  const [A, B] = [P(L, 'A2', 'A1'), P(L, 'B2', 'B1')];
  const s = L.segmentos.find((x) => x.nombre === 'nueva')!;
  const nueva = { p: s.a, d: [s.b[0] - s.a[0], s.b[1] - s.a[1]] as P2 };
  const [A4, B4] = [cambioPlano(A, 'vertical', nueva, A), cambioPlano(B, 'vertical', nueva, A)];

  it('A₄ cae en la línea nueva, y B₄ 16 mm por fuera', () => {
    cerca(A4, [158.739, 374.1707]);
    cerca(B4, [246.048, 333.3567]);
  });

  it('A₄B₄ mide 34 mm, lo mismo que AB, y forma 28,08° con la línea nueva', () => {
    expect(mm(Math.hypot(B4[0] - A4[0], B4[1] - A4[1]))).toBeCloseTo(33.9999, 3);
    expect(mm(vm(A, B))).toBeCloseTo(33.9999, 3);
    expect(anguloConPH(A, B)).toBeCloseTo(28.0764, 3);
  });

  it('la planta, 30 mm; el alzado, 24,08; con el alejamiento en vez de la cota, 38,42', () => {
    expect(mm(vmPlanta(A, B))).toBeCloseTo(29.9988, 3);
    expect(mm(vmAlzado(A, B))).toBeCloseTo(24.0836, 3);
    expect(mm(Math.hypot(vmPlanta(A, B), A.y - B.y))).toBeCloseTo(38.4175, 3);
  });

  it('la receta del ejemplo pone A₄ y B₄ donde el cálculo aparte', () => {
    const o = objetivos(ejemplo('t03-metodos-descriptivos', 'ri2-ab-en-verdadera-magnitud-con-un-cambio'), 'ri2');
    cerca(o.A4[0], [158.739, 374.1707]);
    cerca(o.B4[0], [246.048, 333.3567]);
  });
});

describe('RI3 · tema 4: la varilla PQ atraviesa la placa ABC', () => {
  const L = lamina('ri3');
  const [A, B, C] = [P(L, 'A2', 'A1'), P(L, 'B2', 'B1'), P(L, 'C2', 'C1')];
  const [Pv, Q] = [P(L, 'P2', 'P1'), P(L, 'Q2', 'Q1')];
  const placa = plano(A, B, C);
  const I = corteRectaPlano(rectaPorPuntos(Pv, Q), placa);

  it('I cae en (50; 75) mm en el alzado y en (50; 147) en la planta', () => {
    cerca(proyAlzado(I), [141.7278, 212.5974]);
    cerca(proyPlanta(I), [141.7278, 416.6946]);
  });

  it('I está 25 mm más alto que A y 13 mm más lejos del plano vertical', () => {
    expect(mm(I.z - A.z)).toBeCloseTo(24.9988, 3);
    expect(mm(I.y - A.y)).toBeCloseTo(13.0015, 3);
  });

  it('1 y 2, en los lados CA y BC, están en el plano vertical de la varilla', () => {
    const Pb: P3 = { ...Pv, z: Pv.z - 30 };
    const pv = plano(Pv, Q, Pb);
    const uno = corteRectaPlano(rectaPorPuntos(C, A), pv);
    const dos = corteRectaPlano(rectaPorPuntos(B, C), pv);
    cerca(proyAlzado(uno), [100.923, 239.3841]);
    cerca(proyAlzado(dos), [185.1556, 184.0887]);
    expect(enPlano(I, pv)).toBe(true);
  });

  it('la receta del ejemplo pone 1₂, 2₂, I₂ e I₁ donde el cálculo aparte', () => {
    const o = objetivos(ejemplo('t04-intersecciones', 'ri3-la-varilla-que-atraviesa-la-placa'), 'ri3');
    cerca(o.uno2[0], [100.923, 239.3841]);
    cerca(o.dos2[0], [185.1556, 184.0887]);
    cerca(o.I2[0], [141.7278, 212.5974]);
    cerca(o.I1[0], [141.7278, 416.6946]);
  });
});

describe('RI4 · tema 5: la distancia de Q al plano de canto', () => {
  const L = lamina('ri4');
  const [A, B, C, Q] = [P(L, 'A2', 'A1'), P(L, 'B2', 'B1'), P(L, 'C2', 'C1'), P(L, 'Q2', 'Q1')];
  const placa = plano(A, B, C);
  const T = pieEnPlano(Q, placa);

  it('el plano es de canto: su normal no tiene componente de alejamiento', () => {
    expect(Math.abs(placa.n.y)).toBeLessThan(1e-3);
  });

  it('QT mide 20 mm, y T cae en (58; 69) mm en el alzado y en (58; 125) en la planta', () => {
    expect(mm(distanciaAPlano(Q, placa))).toBeCloseTo(20.0006, 3);
    cerca(proyAlzado(T), [164.4067, 195.5958]);
    cerca(proyPlanta(T), [164.4067, 354.329]);
  });

  it('la planta de la perpendicular es horizontal en el papel, y mide 12 mm', () => {
    expect(T.y).toBeCloseTo(Q.y, 2);
    expect(mm(vmPlanta(Q, T))).toBeCloseTo(12.0003, 3);
  });

  it('la receta del ejemplo pone T₂ y T₁ donde el cálculo aparte', () => {
    const o = objetivos(ejemplo('t05-paralelismo-perpendicularidad-distancias', 'ri4-la-distancia-de-q-a-un-plano-de-canto'), 'ri4');
    cerca(o.T2[0], [164.4067, 195.5958]);
    cerca(o.T1[0], [164.4067, 354.329]);
  });
});

describe('RI5 · tema 6: el ángulo de AB con el plano horizontal, con un giro', () => {
  const L = lamina('ri5');
  const [A, B] = [P(L, 'A2', 'A1'), P(L, 'B2', 'B1')];

  it('AB sube 34,59°; A₂B₂ va a 45° en el papel; con el plano vertical, 36,59°', () => {
    expect(anguloConPH(A, B)).toBeCloseTo(34.5887, 3);
    expect(anguloConPH(A, { ...B, y: A.y })).toBeCloseTo(44.9949, 3);
    expect(anguloConPV(A, B)).toBeCloseTo(36.5926, 3);
  });

  it('girada alrededor del eje vertical por A hasta quedar frontal, B cae en B₁′ y B₂′', () => {
    const eje = rectaPorPuntos(A, { ...A, z: A.z + 10 });
    const giro = (Math.atan2(B.y - A.y, B.x - A.x) * 180) / Math.PI;
    /* Con el eje hacia arriba, girar −giro lleva la planta a la horizontal del papel, a la derecha de A₁. */
    const Bg = gira(B, eje, -giro);
    cerca(proyPlanta(Bg), [223.9414, 297.64]);
    cerca(proyAlzado(Bg), [223.9414, 184.25]);
    expect(Bg.y).toBeCloseTo(A.y, 6);
    expect(anguloConPH(A, Bg)).toBeCloseTo(34.5887, 3);
  });

  it('la receta del ejemplo pone B₁′ y B₂′ donde el cálculo aparte', () => {
    const o = objetivos(ejemplo('t06-angulos', 'ri5-el-angulo-de-ab-con-el-plano-horizontal'), 'ri5');
    cerca(o.B1g[0], [223.9414, 297.64]);
    cerca(o.B2g[0], [223.9414, 184.25]);
  });
});
