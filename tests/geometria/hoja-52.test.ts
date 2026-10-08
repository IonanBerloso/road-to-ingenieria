import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  PT_MM,
  abatido,
  anguloConPH,
  anguloDiedro,
  anguloPlanoConPH,
  anguloPlanoConPV,
  anguloPlanos,
  anguloRectaPlano,
  anguloRectas,
  corteRectaPlano,
  deltaCota,
  distanciaAPlano,
  gira,
  paraleloADistancia,
  perpendicularAPlano,
  pieEnPlano,
  pieEnRecta,
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
import yaml from 'js-yaml';
import { resuelveEjercicio, type EjercicioConReceta } from '../../src/lib/construir';
import { casaTramo } from '../../src/lib/diedrico-corrige';

/* El Ejercicio 52 de la Colección de ejercicios de diédrico (Dpto. de
   Expresión Gráfica y Proyectos de Ingeniería, EIG, UPV/EHU), págs. 53-57: sin
   fecha, en cuatro apartados. Aquí van el 3 y el 4, con sus láminas `ex52-3`
   (pág. 56) y `ex52-4` (pág. 57); el 1 y el 2 todavía no están escritos.

   Las cifras esperadas salen de un segundo camino (2 de octubre de 2026,
   repasado el 7), un guion aparte con álgebra de vectores sobre las mismas
   coordenadas, sin pasar por `src/lib/`.
   Los ángulos, por dos o tres caminos cada uno (el diedro, por las componentes
   perpendiculares a la arista, por las normales hacia fuera y por dos cambios
   de plano hechos en el papel); el abatimiento, por la construcción del papel
   y por un giro de Rodrigues; la chapa, por la normal y por la construcción
   del triángulo y las paralelas. Aquí se cotejan contra `lib/diedrico`, que es
   lo que usa la receta. */

const LAMINAS = join(process.cwd(), 'src', 'content', 'laminas');
const lamina = (id: string): DatosLamina => JSON.parse(readFileSync(join(LAMINAS, `${id}.json`), 'utf8')) as DatosLamina;
const d2 = (p: P2, q: P2) => Math.hypot(p[0] - q[0], p[1] - q[1]);
const cerca = (p: P2, q: P2) => d2(p, q) < 1e-3;
const dRecta = (p: P2, a: P2, b: P2) =>
  Math.abs((p[0] - a[0]) * (b[1] - a[1]) - (p[1] - a[1]) * (b[0] - a[0])) / d2(a, b);
/* El ángulo en v de un triángulo de la lámina: lo que mide el transportador. */
const enVertice = (v: P2, a: P2, b: P2) => {
  const u = [a[0] - v[0], a[1] - v[1]];
  const w = [b[0] - v[0], b[1] - v[1]];
  return (Math.acos((u[0] * w[0] + u[1] * w[1]) / (Math.hypot(u[0], u[1]) * Math.hypot(w[0], w[1]))) * 180) / Math.PI;
};

/* ── Apartado 3 (lámina ex52-3, pág. 56): «Se representan las proyecciones de
   una pirámide. Determinar la verdadera magnitud de los siguientes ángulos: De
   la cara ABC con el plano horizontal. De la arista BV con la arista CV. De la
   arista AV con la cara ABC. El ángulo entre las caras AVB y AVC». ── */

const L3 = lamina('ex52-3');
const q3 = (n: string): P2 => [L3.puntos[n].x, L3.puntos[n].y];
const T = Object.fromEntries(['A', 'B', 'C', 'V'].map((v) => [v, punto3(q3(`${v}2`), q3(`${v}1`))])) as Record<'A' | 'B' | 'C' | 'V', P3>;
const base = plano(T.A, T.B, T.C);
const caraVBC = plano(T.V, T.B, T.C);
/* M, el punto de VC a la cota de B: la charnela es BM, la horizontal de la cara VBC por B. */
const sM = (T.V.z - T.B.z) / (T.V.z - T.C.z);
const M: P3 = { x: T.V.x + sM * (T.C.x - T.V.x), y: T.V.y + sM * (T.C.y - T.V.y), z: T.B.z };
const charnela = rectaPorPuntos(T.B, M);

describe('Ejercicio 52 · la lámina del apartado 3', () => {
  it('C₂ cae en B₂A₂, a 0,02 pt: la base ABC se ve de canto en el alzado', () => {
    expect(dRecta(q3('C2'), q3('B2'), q3('A2'))).toBeCloseTo(0.0212, 3);
    expect(anguloPlanoConPV(base)).toBeCloseTo(89.9904, 3);
  });

  it('V₁ cae dentro del triángulo A₁B₁C₁ y V está por encima de la base: es el vértice', () => {
    const lado = (p: P2, a: P2, b: P2) => (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
    const [a, b, c, v] = ['A1', 'B1', 'C1', 'V1'].map(q3);
    const s = [lado(v, a, b), lado(v, b, c), lado(v, c, a)];
    expect(s.every((x) => x > 0) || s.every((x) => x < 0)).toBe(true);
    expect(T.V.z).toBeGreaterThan(Math.max(T.A.z, T.B.z, T.C.z));
  });
});

describe('Ejercicio 52 · apartado 3, los cuatro ángulos', () => {
  it('la cara ABC forma 20,57° con el plano horizontal, por la normal y por B₂A₂ en el alzado', () => {
    expect(anguloPlanoConPH(base)).toBeCloseTo(20.5661, 3);
    const enAlzado = (Math.atan2(q3('A2')[1] - q3('B2')[1], q3('A2')[0] - q3('B2')[0]) * 180) / Math.PI;
    expect(enAlzado).toBeCloseTo(20.5678, 3);
  });

  it('BV con CV forman 56,66°', () => {
    expect(anguloRectas(rectaPorPuntos(T.V, T.B), rectaPorPuntos(T.V, T.C))).toBeCloseTo(56.6585, 3);
  });

  it('AV con la cara ABC forma 43,34°; con la perpendicular frontal y su seno, 43,34° también', () => {
    expect(anguloRectaPlano(rectaPorPuntos(T.A, T.V), base)).toBeCloseTo(43.3363, 3);
    /* La perpendicular desde V₂ a B₂A₂, en el alzado: VT en verdadera magnitud, porque la base es de canto. */
    const [b, a, v] = [q3('B2'), q3('A2'), q3('V2')];
    expect(dRecta(v, b, a) * PT_MM).toBeCloseTo(46.5406, 3);
    expect(vm(T.A, T.V) * PT_MM).toBeCloseTo(67.8127, 3);
    expect((Math.asin(dRecta(v, b, a) / vm(T.A, T.V)) * 180) / Math.PI).toBeCloseTo(43.3389, 3);
  });

  it('el diedro de las caras AVB y AVC mide 61,03°, agudo: el ángulo entre los planos es el mismo', () => {
    const AV = rectaPorPuntos(T.A, T.V);
    expect(anguloDiedro(T.B, AV, T.C)).toBeCloseTo(61.0313, 3);
    expect(anguloPlanos(plano(T.A, T.V, T.B), plano(T.A, T.V, T.C))).toBeCloseTo(61.0313, 3);
  });

  it('los errores atados: complementarios, suplementarios, proyecciones y rectas que no son', () => {
    expect(90 - anguloPlanoConPH(base)).toBeCloseTo(69.4339, 3);
    expect(anguloConPH(T.A, T.C)).toBeCloseTo(11.7617, 3);
    /* AB forma 20,24° con el horizontal: cae dentro del medio grado de la cara (lo dice el desarrollo) */
    expect(anguloConPH(T.A, T.B)).toBeCloseTo(20.244, 3);
    expect(enVertice(q3('V1'), q3('B1'), q3('C1'))).toBeCloseTo(85.3429, 3);
    expect(enVertice(q3('V2'), q3('B2'), q3('C2'))).toBeCloseTo(41.0611, 3);
    expect(90 - anguloRectaPlano(rectaPorPuntos(T.A, T.V), base)).toBeCloseTo(46.6637, 3);
    /* en el alzado, A₂V₂ con A₂B₂: casi el complementario, por casualidad */
    expect(enVertice(q3('A2'), q3('V2'), q3('B2'))).toBeCloseTo(46.2534, 3);
    expect(anguloConPH(T.A, T.V)).toBeCloseTo(60.8505, 3);
    expect(anguloRectas(rectaPorPuntos(T.A, T.V), rectaPorPuntos(T.A, T.B))).toBeCloseTo(45.4912, 3);
    expect(180 - anguloDiedro(T.B, rectaPorPuntos(T.A, T.V), T.C)).toBeCloseTo(118.9687, 3);
    const X = pieEnRecta(T.B, rectaPorPuntos(T.A, T.V));
    expect(anguloRectas(rectaPorPuntos(X, T.B), rectaPorPuntos(X, T.C))).toBeCloseTo(61.9515, 3);
  });
});

describe('Ejercicio 52 · apartado 3, la cara VBC abatida con su horizontal por B', () => {
  it('M cae donde lo deja el segundo camino: M₂ (303,07; 205,80) y M₁ (303,07; 456,58)', () => {
    expect(cerca(proyAlzado(M), [303.0714, 205.8])).toBe(true);
    expect(cerca(proyPlanta(M), [303.0714, 456.5772])).toBe(true);
    expect(distanciaAPlano(M, caraVBC)).toBeLessThan(1e-9);
  });

  it('el pie de V en la charnela y el radio: 20,49 mm en la planta, 33,82 de cotas, 39,55 de verdad', () => {
    const O = pieEnRecta(T.V, charnela);
    expect(cerca(proyPlanta(O), [283.4552, 472.8328])).toBe(true);
    expect(vmPlanta(T.V, O) * PT_MM).toBeCloseTo(20.4925, 3);
    expect(deltaCota(T.V, O) * PT_MM).toBeCloseTo(33.8243, 3);
    expect(vm(T.V, O) * PT_MM).toBeCloseTo(39.5478, 3);
  });

  it('los dos abatidos de V, y el segundo es el que se construye, al otro lado de la charnela', () => {
    const [uno, dos] = abatido(T.V, charnela, caraVBC).map(proyPlanta);
    expect(cerca(uno, [354.9854, 559.1504])).toBe(true);
    expect(cerca(dos, [211.9251, 386.5152])).toBe(true);
  });

  it('el abatido es un giro de V alrededor de BM, y el ángulo en V₀ es el de BV con CV, a los dos lados', () => {
    const giros = Array.from({ length: 36000 }, (_, k) => gira(T.V, charnela, k / 100)).filter((P) => Math.abs(P.z - T.B.z) < 0.02);
    for (const V0 of abatido(T.V, charnela, caraVBC)) {
      expect(Math.min(...giros.map((G) => vm(G, V0)))).toBeLessThan(0.05);
      expect(enVertice(proyPlanta(V0), q3('B1'), proyPlanta(M))).toBeCloseTo(56.6585, 3);
      expect(vm(V0, T.B)).toBeCloseTo(vm(T.V, T.B), 6);
    }
  });

  it('con el radio igual a la diferencia de cotas, el ángulo en V₀ sale 63,21° (un distractor)', () => {
    expect(enVertice([222.2771, 399.0073], q3('B1'), proyPlanta(M))).toBeCloseTo(63.2061, 2);
  });
});

/* ── Apartado 4 (lámina ex52-4, pág. 57): «A una chapa triangular ABC hay que
   colocarle otra exactamente igual en paralelo, a 25 mm de distancia.
   Representar ambas chapas teniendo en cuenta que la segunda debe quedar por
   encima de la primera». La segunda va justo encima: cada vértice en la
   perpendicular al plano por el de abajo (lo declaran las notas). ── */

const L4 = lamina('ex52-4');
const q4 = (n: string): P2 => [L4.puntos[n].x, L4.puntos[n].y];
const H = Object.fromEntries(['A', 'B', 'C'].map((v) => [v, punto3(q4(`${v}2`), q4(`${v}1`))])) as Record<'A' | 'B' | 'C', P3>;
const chapa = plano(H.A, H.B, H.C);
const D = 25 / PT_MM;
const arriba = paraleloADistancia(chapa, D, 1);
const abajo = paraleloADistancia(chapa, D, -1);
const nueva = (['A', 'B', 'C'] as const).map((v) => pieEnPlano(H[v], arriba));
const debajo = (['A', 'B', 'C'] as const).map((v) => pieEnPlano(H[v], abajo));

describe('Ejercicio 52 · apartado 4, la chapa paralela a 25 mm', () => {
  it('la lámina: seis vértices en sus verticales; el plano forma 47,26° con el horizontal', () => {
    for (const v of ['A', 'B', 'C']) expect(q4(`${v}1`)[0]).toBe(q4(`${v}2`)[0]);
    expect(anguloPlanoConPH(chapa)).toBeCloseTo(47.2581, 3);
  });

  it('A′, B′ y C′ caen donde los deja el segundo camino, en las dos vistas', () => {
    const esperado: [P2, P2][] = [
      [[228.901, 598.7914], [228.901, 280.5833]],
      [[342.301, 485.3914], [342.301, 110.4233]],
      [[455.701, 655.4314], [455.701, 195.5033]],
    ];
    nueva.forEach((P, i) => {
      expect(cerca(proyPlanta(P), esperado[i][0])).toBe(true);
      expect(cerca(proyAlzado(P), esperado[i][1])).toBe(true);
    });
  });

  it('la chapa nueva está 25 mm por encima, en la perpendicular, y es igual que ABC', () => {
    nueva.forEach((P, i) => {
      const X = [H.A, H.B, H.C][i];
      expect(vm(X, P) * PT_MM).toBeCloseTo(25, 9);
      expect(P.z).toBeGreaterThan(X.z);
      const perp = perpendicularAPlano(X, chapa);
      expect(vm(P, pieEnRecta(P, perp))).toBeLessThan(1e-9);
    });
    expect(vm(nueva[0], nueva[1])).toBeCloseTo(vm(H.A, H.B), 9);
    expect(vm(nueva[1], nueva[2])).toBeCloseTo(vm(H.B, H.C), 9);
    expect(distanciaAPlano(nueva[2], chapa) * PT_MM).toBeCloseTo(25, 9);
  });

  it('cada vértice sube 16,97 mm, se corre 18,36 en la planta y 19,79 en el alzado; la de debajo baja lo mismo', () => {
    expect(deltaCota(H.A, nueva[0]) * PT_MM).toBeCloseTo(16.9674, 3);
    expect(vmPlanta(H.A, nueva[0]) * PT_MM).toBeCloseTo(18.3605, 3);
    expect(vmAlzado(H.A, nueva[0]) * PT_MM).toBeCloseTo(19.7874, 3);
    expect(cerca(proyPlanta(debajo[0]), [286.619, 512.1686])).toBe(true);
    expect(H.A.z - debajo[0].z).toBeCloseTo(nueva[0].z - H.A.z, 9);
  });

  it('los errores: subida en vertical hasta el plano (36,84 mm) y los 25 mm sobre una proyección (23,10 y 21,44)', () => {
    const vertical = rectaPorPuntos(H.A, { ...H.A, z: H.A.z + 10 });
    expect(deltaCota(H.A, corteRectaPlano(vertical, arriba)) * PT_MM).toBeCloseTo(36.8353, 3);
    const dz = deltaCota(H.A, nueva[0]);
    expect(((25 * dz) / vmPlanta(H.A, nueva[0]))).toBeCloseTo(23.1032, 3);
    expect(((25 * dz) / vmAlzado(H.A, nueva[0]))).toBeCloseTo(21.4371, 3);
  });

  it('la construcción: 1 en el medio de AB, 2 en BC, X a la cota de C, y el triángulo de AX, 44,22 mm', () => {
    const horizontalC = plano(H.C, { ...H.C, y: H.C.y + 10 }, { ...H.C, x: H.C.x + 10 });
    const P1 = corteRectaPlano(rectaPorPuntos(H.A, H.B), horizontalC);
    expect(cerca(proyAlzado(P1), [314.46, 243.6])).toBe(true);
    expect(cerca(proyPlanta(P1), [314.46, 498.78])).toBe(true);
    const X = corteRectaPlano(perpendicularAPlano(H.A, chapa), horizontalC);
    expect(cerca(proyAlzado(X), [206.7102, 243.6])).toBe(true);
    expect(cerca(proyPlanta(X), [206.7102, 632.0952])).toBe(true);
    expect(vm(H.A, X) * PT_MM).toBeCloseTo(44.2234, 3);
    /* A′₀, A′ en el triángulo abatido: a 25 mm de A₁ sobre A₁X₀, con X₀ (135,91; 584,92) */
    const X0: P2 = [135.9078, 584.9186];
    expect(d2(proyPlanta(H.A), X0)).toBeCloseTo(vm(H.A, X), 3);
  });

  it('lo que sube se lee en el triángulo, A′₀A′₁; C₂2₂, un tramo de B₂C₂, mide 16,66 mm y cae dentro del milímetro por casualidad', () => {
    /* A′₀A′₁ es paralela a X₁X₀: la diferencia de cotas de AX por 25 / AX */
    const horizontalC = plano(H.C, { ...H.C, y: H.C.y + 10 }, { ...H.C, x: H.C.x + 10 });
    const X = corteRectaPlano(perpendicularAPlano(H.A, chapa), horizontalC);
    expect(((deltaCota(H.A, X) * 25) / vm(H.A, X))).toBeCloseTo(16.9674, 3);
    /* 2, el punto de BC con el alejamiento de A (la frontal por A) */
    const frontalA = plano(H.A, { ...H.A, x: H.A.x + 10 }, { ...H.A, z: H.A.z + 10 });
    const P2 = corteRectaPlano(rectaPorPuntos(H.B, H.C), frontalA);
    expect(d2(proyAlzado(H.C), proyAlzado(P2)) * PT_MM).toBeCloseTo(16.6591, 3);
  });

  it('la visibilidad: en cada cruce aparente, la chapa nueva va 36,84 mm por encima (planta) y 40,91 mm por delante (alzado)', () => {
    /* planta: A′₁B′₁ cruza A₁C₁ en (269,32; 558,37); alzado: C′₂A′₂ cruza A₂B₂ en (310,12; 250,12) */
    const enPlanoZ = (pl: ReturnType<typeof plano>, p: P2) => (pl.d - pl.n.x * p[0] - pl.n.y * p[1]) / pl.n.z;
    const enPlanoY = (pl: ReturnType<typeof plano>, p: P2) => (pl.d - pl.n.x * p[0] + pl.n.z * p[1]) / pl.n.y;
    const nuevaPl = plano(nueva[0], nueva[1], nueva[2]);
    expect((enPlanoZ(nuevaPl, [269.3244, 558.368]) - enPlanoZ(chapa, [269.3244, 558.368])) * PT_MM).toBeCloseTo(36.8353, 3);
    expect((enPlanoY(nuevaPl, [310.1172, 250.1165]) - enPlanoY(chapa, [310.1172, 250.1165])) * PT_MM).toBeCloseTo(40.905, 3);
  });
});

describe('Ejercicio 52 · apartado 4, la visibilidad en el Taller (los tramos)', () => {
  /* Lo visto y lo oculto, de un cálculo de líneas ocultas hecho aparte el 8 de
     octubre de 2026, sin src/lib: cada lado de las dos chapas, muestreado y
     mirado por rayos contra las dos chapas, opacas, y cada cambio afinado por
     bisección. Coordenadas en pt de la lámina. Da la misma visibilidad que el
     paso dibujar que había antes. A₁B₁, B₁C₁ y C₂A₂ se ven enteros y ya están
     en la lámina, y no son tramos; las perpendiculares AA′, BB′ y CC′ no son
     lados de las chapas, y siguen en el trazado. */
  const ESPERADOS: [string, string, 'visto' | 'oculto', [number, number], [number, number]][] = [
    ['planta', 'CA', 'visto', [484.56, 612.12], [415.28, 594.82]],
    ['planta', 'CA', 'oculto', [415.28, 594.82], [269.32, 558.37]],
    ['planta', 'CA', 'visto', [269.32, 558.37], [257.76, 555.48]],
    ['planta', 'A′B′', 'visto', [228.9, 598.79], [342.3, 485.39]],
    ['planta', 'B′C′', 'visto', [342.3, 485.39], [455.7, 655.43]],
    ['planta', 'C′A′', 'visto', [455.7, 655.43], [228.9, 598.79]],
    ['alzado', 'AB', 'visto', [257.76, 328.68], [310.12, 250.12]],
    ['alzado', 'AB', 'oculto', [310.12, 250.12], [371.16, 158.52]],
    ['alzado', 'BC', 'oculto', [371.16, 158.52], [432.2, 204.32]],
    ['alzado', 'BC', 'visto', [432.2, 204.32], [484.56, 243.6]],
    ['alzado', 'A′B′', 'visto', [228.9, 280.58], [342.3, 110.42]],
    ['alzado', 'B′C′', 'visto', [342.3, 110.42], [455.7, 195.5]],
    ['alzado', 'C′A′', 'visto', [455.7, 195.5], [228.9, 280.58]],
  ];
  const ej = (yaml.load(readFileSync(join(process.cwd(), 'src/content/expresion-grafica/examenes/ejercicio-52/ejercicios.yaml'), 'utf8')) as {
    ejercicios: EjercicioConReceta[];
  }).ejercicios.find((e) => e.id.startsWith('exeg-h52-4'))!;
  const pasos = resuelveEjercicio(ej, L4);
  const paso = pasos.get(1)!;
  const tol = paso.tolerancia;
  const junto = (p: readonly number[], q: readonly number[]) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 0.75;

  it('el paso construir lleva 13 tramos, y son los del cálculo aparte, con su tipo', () => {
    expect([...pasos.keys()].join()).toBe('1');
    expect(paso.tramos).toHaveLength(ESPERADOS.length);
    for (const [vista, arista, tipo, a, b] of ESPERADOS) {
      const t = paso.tramos.find((x) => (junto(x.a, a) && junto(x.b, b)) || (junto(x.a, b) && junto(x.b, a)));
      expect(t, `${vista} ${arista} de (${a}) a (${b})`).toBeDefined();
      expect(t!.tipo, `${vista} ${arista} de (${a}) a (${b})`).toBe(tipo);
    }
  });

  it('el Taller da por buena esa visibilidad, tramo a tramo', () => {
    for (const [, , tipo, a, b] of ESPERADOS) expect(casaTramo(a, b, tipo, paso.tramos, tol).que).toBe('bien');
  });

  it('y rechaza un lado cambiado de tipo, con el porqué de su tramo', () => {
    // A₁C₁ entera en continua: el tramo de debajo de la chapa nueva va a trazos
    const ac = casaTramo([257.76, 555.48], [484.56, 612.12], 'visto', paso.tramos, tol);
    expect(ac.que).toBe('tipo');
    if (ac.que === 'tipo') expect(paso.tramos[ac.tramo].porque).toMatch(/debajo de la chapa nueva/);
    // C′₂A′₂ a trazos: la chapa nueva va delante
    const ca = casaTramo([455.7, 195.5], [228.9, 280.58], 'oculto', paso.tramos, tol);
    expect(ca.que).toBe('tipo');
    if (ca.que === 'tipo') expect(paso.tramos[ca.tramo].porque).toMatch(/40,9 mm por delante/);
    // A₂B₂ entera en continua: la esquina de B queda detrás de la chapa nueva
    expect(casaTramo([257.76, 328.68], [371.16, 158.52], 'visto', paso.tramos, tol).que).toBe('tipo');
    // y A₁C₁ cortada donde no cambia nada
    expect(casaTramo([257.76, 555.48], [350, 578.5], 'visto', paso.tramos, tol).que).toBe('corte');
  });
});
