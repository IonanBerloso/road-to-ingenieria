import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  PT_MM,
  abatido,
  anguloRectas,
  corteRectaPlano,
  distanciaAPlano,
  distanciaRectas,
  horizontalPor,
  paraleloADistancia,
  perpendicularAPlano,
  pieComun,
  pieEnRecta,
  plano,
  planoPorLmp,
  proyAlzado,
  proyPlanta,
  punto3,
  puntoEnPlanoDesdeAlzado,
  rectaDesdeProyecciones,
  rectaPorPuntos,
  vm,
  vmAlzado,
  vmPlanta,
  type P2,
  type P3,
} from '../../src/lib/diedrico';
import { problemasDeLamina, type DatosLamina } from '../../src/lib/lamina';
import yaml from 'js-yaml';
import { resuelveEjercicio, type EjercicioConReceta } from '../../src/lib/construir';
import { casaTramo } from '../../src/lib/diedrico-corrige';

/* El Ejercicio 54 de la Colección de ejercicios de diédrico (Dpto. de
   Expresión Gráfica y Proyectos de Ingeniería, EIG, UPV/EHU), págs. 61-63: sin
   fecha, el único de la colección titulado «Examen». Apartado 1, sobre la
   pág. 62: «Dados los dos prismas, calcular gráficamente: a. Intersección
   entre los dos prismas. b. Ángulo entre las rectas AB y AV (por
   ABATIMIENTO)». La figura es una pirámide regular de base cuadrada ABCD y
   vértice V y un prisma triangular de aristas horizontales e, f y g (nombres
   nuestros, como C, D y los extremos E, F, G y E′, F′, G′), que la atraviesa.

   Las coordenadas son las de la lámina `ex54-1`. Las cifras esperadas salen
   de un segundo camino (1 de octubre de 2026), un guion aparte con álgebra de
   vectores sobre esas mismas coordenadas, sin pasar por `src/lib/`. Los cortes
   de las aristas del prisma, con el cuadrado que el plano horizontal de cada una corta en la pirámide (homotético de la base
   desde V₁), en 2D; los de VB y VD, con el triángulo que su plano de canto
   corta en el prisma, en 2D; y los diez, otra vez, recta contra triángulo en
   3D. El ángulo, por el producto escalar y por la construcción del
   abatimiento en la planta. Aquí se cotejan contra `lib/diedrico`, que es lo
   que usa la receta.

   Los apartados 2 y 3, al final, sobre la pág. 63 (láminas `ex54-2` y
   `ex54-3`), con el mismo método: cada cifra por dos caminos sin la lib. */

const L = JSON.parse(
  readFileSync(join(process.cwd(), 'src', 'content', 'laminas', 'ex54-1.json'), 'utf8'),
) as DatosLamina;
const xy = (n: string): P2 => [L.puntos[n].x, L.puntos[n].y];
const P3de = (v: string, p = ''): P3 => punto3(xy(`${v}2${p}`), xy(`${v}1${p}`));
const [V, A, B, C, D] = ['V', 'A', 'B', 'C', 'D'].map((v) => P3de(v));
const [E, F, G] = ['E', 'F', 'G'].map((v) => P3de(v));
const [Ep, Fp, Gp] = ['E', 'F', 'G'].map((v) => P3de(v, 'p'));
const cara = { VAB: plano(V, A, B), VBC: plano(V, B, C), VCD: plano(V, C, D), VDA: plano(V, D, A), ef: plano(E, F, Ep), fg: plano(F, G, Fp), ge: plano(G, E, Gp) };
const recta = (a: P3, b: P3) => rectaPorPuntos(a, b);
const mm = (pt: number) => pt * PT_MM;
const mul = (a: P3, k: number): P3 => ({ x: a.x * k, y: a.y * k, z: a.z * k });
const d2 = (p: P2, q: P2) => Math.hypot(p[0] - q[0], p[1] - q[1]);
/* El parámetro del punto X sobre el segmento ab: entre 0 y 1, cae dentro. */
const param = (X: P3, a: P3, b: P3) => {
  const u = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z };
  return ((X.x - a.x) * u.x + (X.y - a.y) * u.y + (X.z - a.z) * u.z) / (u.x ** 2 + u.y ** 2 + u.z ** 2);
};

const H = corteRectaPlano(recta(E, Ep), cara.VBC);
const N = corteRectaPlano(recta(E, Ep), cara.VCD);
const K = corteRectaPlano(recta(F, Fp), cara.VAB);
const Q = corteRectaPlano(recta(F, Fp), cara.VDA);
const M = corteRectaPlano(recta(G, Gp), cara.VBC);
const T = corteRectaPlano(recta(G, Gp), cara.VCD);
const J = corteRectaPlano(recta(V, B), cara.ef);
const Lc = corteRectaPlano(recta(V, B), cara.fg);
const Pc = corteRectaPlano(recta(V, D), cara.ef);
const R = corteRectaPlano(recta(V, D), cara.fg);

describe('Ejercicio 54 · la lámina del apartado 1', () => {
  it('no tiene problemas: ningún punto ni segmento fuera del encuadre', () => {
    expect(problemasDeLamina(L).length).toBe(0);
  });

  it('la pirámide es regular: base horizontal y cuadrada de 50 mm, y V a 100 mm sobre su centro', () => {
    for (const X of [B, C, D]) expect(X.z).toBe(A.z);
    for (const [p, q] of [[A, B], [B, C], [C, D], [D, A]] as const) expect(Math.abs(mm(vm(p, q)) - 50)).toBeLessThan(0.05);
    expect(Math.abs(mm(vm(A, C)) - mm(vm(B, D)))).toBeLessThan(0.01);
    const centro = { x: (A.x + C.x) / 2, y: (A.y + C.y) / 2 };
    expect(Math.hypot(V.x - centro.x, V.y - centro.y)).toBeLessThan(0.1);
    expect(mm(V.z - A.z)).toBeCloseTo(100.03, 2);
  });

  it('el prisma: aristas horizontales y paralelas, a 25° del plano vertical, y sección recta equilátera de 25 mm', () => {
    for (const [a, b] of [[E, Ep], [F, Fp], [G, Gp]] as const) expect(a.z).toBe(b.z);
    const d = recta(E, Ep).d;
    for (const [a, b] of [[F, Fp], [G, Gp]] as const) expect(anguloRectas(recta(a, b), recta(E, Ep))).toBeLessThan(0.01);
    expect((Math.atan2(d.y, d.x) * 180) / Math.PI).toBeCloseTo(24.99, 1);
    // los extremos del prisma, perpendiculares a las aristas: la distancia entre E, F y G medida en la sección
    const enSeccion = (X: P3) => {
      const t = (X.x - E.x) * d.x + (X.y - E.y) * d.y + (X.z - E.z) * d.z;
      return { x: X.x - t * d.x, y: X.y - t * d.y, z: X.z - t * d.z };
    };
    const [Es, Fs, Gs] = [E, F, G].map(enSeccion);
    for (const l of [vm(Es, Fs), vm(Fs, Gs), vm(Gs, Es)]) expect(Math.abs(mm(l) - 25)).toBeLessThan(0.05);
  });
});

describe('Ejercicio 54 · apartado 1 a, la intersección', () => {
  it('los diez puntos caen donde los deja el segundo camino, en las dos vistas', () => {
    const esperado: [P3, P2, P2][] = [
      [H, [460.2805, 504.9969], [460.2805, 187.08]],
      [J, [423.7623, 519.5101], [423.7623, 209.8845]],
      [K, [438.703, 556.0064], [438.703, 231.24]],
      [Lc, [413.1318, 516.6647], [413.1318, 241.0119]],
      [M, [452.0773, 489.5034], [452.0773, 257.16]],
      [N, [513.988, 530.032], [513.988, 187.08]],
      [Pc, [526.0667, 546.9088], [526.0667, 195.2127]],
      [Q, [488.2746, 579.1136], [488.2746, 231.24]],
      [R, [544.8638, 551.9462], [544.8638, 250.3211]],
      [T, [532.4229, 526.9555], [532.4229, 257.16]],
    ];
    for (const [X, planta, alzado] of esperado) {
      expect(d2(proyPlanta(X), planta)).toBeLessThan(0.01);
      expect(d2(proyAlzado(X), alzado)).toBeLessThan(0.01);
    }
  });

  it('cada punto está dentro de la arista que lo da: una penetración, con las tres aristas del prisma entrando y saliendo', () => {
    for (const [X, a, b] of [[H, E, Ep], [N, E, Ep], [K, F, Fp], [Q, F, Fp], [M, G, Gp], [T, G, Gp], [J, V, B], [Lc, V, B], [Pc, V, D], [R, V, D]] as const) {
      const t = param(X, a, b);
      expect(t).toBeGreaterThan(0);
      expect(t).toBeLessThan(1);
    }
    // VA y VC no tocan el prisma, y VB y VD sí: muestreadas, ningún punto de las
    // dos primeras cae dentro del prisma, y de las dos segundas sí, entre sus cortes
    const centro = mul({ x: E.x + F.x + G.x + Ep.x + Fp.x + Gp.x, y: E.y + F.y + G.y + Ep.y + Fp.y + Gp.y, z: E.z + F.z + G.z + Ep.z + Fp.z + Gp.z }, 1 / 6);
    const caras = [cara.ef, cara.fg, cara.ge, plano(E, F, G), plano(Ep, Fp, Gp)];
    const lado = (pl: (typeof caras)[number], X: P3) => pl.n.x * X.x + pl.n.y * X.y + pl.n.z * X.z - pl.d;
    const dentroDelPrisma = (X: P3) => caras.every((pl) => Math.sign(lado(pl, X)) === Math.sign(lado(pl, centro)) && Math.abs(lado(pl, X)) > 1e-6);
    const tocaElPrisma = (a: P3, b: P3) =>
      Array.from({ length: 401 }, (_, i) => i / 400).some((t) => dentroDelPrisma({ x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y), z: a.z + t * (b.z - a.z) }));
    expect(tocaElPrisma(V, A)).toBe(false);
    expect(tocaElPrisma(V, C)).toBe(false);
    expect(tocaElPrisma(V, B)).toBe(true);
    expect(tocaElPrisma(V, D)).toBe(true);
  });

  it('los dos polígonos: cada lado tiene sus dos extremos en una misma cara de la pirámide y en una misma cara del prisma', () => {
    const lados: [P3, P3, keyof typeof cara, keyof typeof cara][] = [
      [H, J, 'VBC', 'ef'], [J, K, 'VAB', 'ef'], [K, Lc, 'VAB', 'fg'], [Lc, M, 'VBC', 'fg'], [M, H, 'VBC', 'ge'],
      [N, Pc, 'VCD', 'ef'], [Pc, Q, 'VDA', 'ef'], [Q, R, 'VDA', 'fg'], [R, T, 'VCD', 'fg'], [T, N, 'VCD', 'ge'],
    ];
    for (const [a, b, cp, cq] of lados) {
      for (const X of [a, b]) {
        expect(distanciaAPlano(X, cara[cp])).toBeLessThan(0.05);
        expect(distanciaAPlano(X, cara[cq])).toBeLessThan(0.05);
      }
    }
  });
});

describe('Ejercicio 54 · apartado 1 b, el ángulo entre AB y AV', () => {
  const AB = recta(A, B);
  const [hacia, fuera] = abatido(V, AB, cara.VAB);

  it('(V), con AB de charnela: el primero de abatido() cae hacia V₁, donde lo deja el segundo camino, y dentro del encuadre', () => {
    expect(d2(proyPlanta(hacia), [669.1303, 423.0355])).toBeLessThan(0.01);
    expect(d2(proyPlanta(fuera), [163.0918, 715.6664])).toBeLessThan(0.01);
    const pie = proyPlanta(pieEnRecta(V, AB));
    const lado = (X: P2) => (X[0] - pie[0]) * (V.x - pie[0]) + (X[1] - pie[1]) * (V.y - pie[1]);
    expect(lado(proyPlanta(hacia))).toBeGreaterThan(0);
    expect(lado(proyPlanta(fuera))).toBeLessThan(0);
    const { x, y, w, h } = L.encuadre;
    const dentro = ([px, py]: P2) => px >= x && px <= x + w && py >= y && py <= y + h;
    expect(dentro(proyPlanta(hacia))).toBe(true);
    expect(dentro(proyPlanta(fuera))).toBe(false);
  });

  it('la cara abatida conserva las distancias: A(V) mide AV, 106,09 mm, y (V) queda a 103,11 mm de AB', () => {
    expect(mm(vm(A, hacia))).toBeCloseTo(mm(vm(A, V)), 6);
    expect(mm(vm(A, V))).toBeCloseTo(106.0875, 3);
    expect(mm(vm(hacia, pieEnRecta(V, AB)))).toBeCloseTo(103.1095, 3);
  });

  it('el ángulo mide 76,39°; en la planta saldría 45,04°, en el alzado 95,22° (84,78° el agudo) y en V 27,25°', () => {
    expect(anguloRectas(AB, recta(A, V))).toBeCloseTo(76.392, 3);
    // en la cara abatida, con el transportador en A₁
    const a1 = proyPlanta(A), b1 = proyPlanta(B), v1 = proyPlanta(hacia);
    const ang = (o: P2, p: P2, q: P2) => (Math.acos(((p[0] - o[0]) * (q[0] - o[0]) + (p[1] - o[1]) * (q[1] - o[1])) / (d2(o, p) * d2(o, q))) * 180) / Math.PI;
    expect(ang(a1, b1, v1)).toBeCloseTo(76.392, 3);
    expect(ang(a1, b1, proyPlanta(V))).toBeCloseTo(45.042, 3);
    expect(ang(proyAlzado(A), proyAlzado(B), proyAlzado(V))).toBeCloseTo(95.2228, 3);
    expect(anguloRectas(recta(V, A), recta(V, B))).toBeCloseTo(27.2463, 3);
  });

  it('los dos errores de longitud: con el cateto sale 75,99° (dentro de la tolerancia de 0,5°) y con A₂V₂, 75,61°', () => {
    const s = vm(A, pieEnRecta(V, AB));
    const dz = V.z - A.z;
    const a2v2 = Math.hypot(V.x - A.x, V.z - A.z);
    const grados = (r: number) => (r * 180) / Math.PI;
    expect(grados(Math.atan2(dz, s))).toBeCloseTo(75.9899, 3);
    expect(grados(Math.atan2(Math.sqrt(a2v2 ** 2 - s ** 2), s))).toBeCloseTo(75.6120, 3);
    expect(Math.abs(grados(Math.atan2(dz, s)) - anguloRectas(AB, recta(A, V)))).toBeLessThan(0.5);
  });
});

/* ── Apartado 2: «El trapecio ABCD está el en plano definido por la línea de
   máxima pendiente r. a. Completar su proyección en el plano horizontal. b.
   Dibujar un plano rectangular que es perpendicular al trapecio. Datos: un
   lado es la diagonal AC y el otro lado mide 30 mm. El rectángulo se sitúa en
   la parte superior del trapecio». Las cifras, por la normal del plano y por
   el método gráfico (el punto de r a cada cota y la perpendicular a r₁), y E
   por la normal y por la línea de máxima pendiente. Los 30 mm, de la lámina. */
const L2 = JSON.parse(readFileSync(join(process.cwd(), 'src', 'content', 'laminas', 'ex54-2.json'), 'utf8')) as DatosLamina;
const seg2 = (L: DatosLamina, n: string): [P2, P2] => {
  const s = L.segmentos.find((x) => x.nombre === n);
  if (!s) throw new Error(`la lámina no tiene el segmento ${n}`);
  return [s.a, s.b];
};
const r = rectaDesdeProyecciones(seg2(L2, 'r2'), seg2(L2, 'r1'));
const planoT = planoPorLmp(r);
const [TA, TB, TC, TD] = ['A2', 'B2', 'C2', 'D2'].map((n) => puntoEnPlanoDesdeAlzado([L2.puntos[n].x, L2.puntos[n].y], planoT));

describe('Ejercicio 54 · apartado 2', () => {
  it('a: la planta del trapecio cae donde la deja el segundo camino', () => {
    const esperado: [P3, P2][] = [
      [TA, [306.93, 406.7576]],
      [TB, [385.05, 440.1821]],
      [TC, [391.17, 534.2381]],
      [TD, [234.81, 467.3378]],
    ];
    for (const [X, planta] of esperado) expect(d2(proyPlanta(X), planta)).toBeLessThan(0.01);
  });

  it('a: AB y DC son horizontales del plano, de 30,0 y 60,0 mm, y el plano forma 32,31° con el horizontal', () => {
    expect(vm(TB, pieEnRecta(TB, horizontalPor(TA, planoT)))).toBeLessThan(0.01);
    expect(vm(TC, pieEnRecta(TC, horizontalPor(TD, planoT)))).toBeLessThan(0.01);
    expect(mm(vm(TA, TB))).toBeCloseTo(29.9756, 3);
    expect(mm(vm(TD, TC))).toBeCloseTo(59.9972, 3);
    expect((Math.acos(Math.abs(planoT.n.z)) * 180) / Math.PI).toBeCloseTo(32.3076, 3);
  });

  it('b: E y F, a 30 mm de A y de C por la perpendicular al plano, del lado que sube; AEFC es un rectángulo', () => {
    const arriba = paraleloADistancia(planoT, 30 / PT_MM, 1);
    const E2 = corteRectaPlano(perpendicularAPlano(TA, planoT), arriba);
    const F2 = corteRectaPlano(perpendicularAPlano(TC, planoT), arriba);
    expect(d2(proyPlanta(E2), [289.0512, 448.544])).toBeLessThan(0.01);
    expect(d2(proyAlzado(E2), [289.0512, 96.9655])).toBeLessThan(0.01);
    expect(d2(proyPlanta(F2), [373.2912, 576.0245])).toBeLessThan(0.01);
    expect(d2(proyAlzado(F2), [373.2912, 150.1255])).toBeLessThan(0.01);
    expect(E2.z).toBeGreaterThan(TA.z);
    expect(mm(vm(TA, E2))).toBeCloseTo(30, 6);
    expect(mm(vm(TA, TC))).toBeCloseTo(57.0733, 3);
    const u = { x: E2.x - TA.x, y: E2.y - TA.y, z: E2.z - TA.z };
    const w = { x: TC.x - TA.x, y: TC.y - TA.y, z: TC.z - TA.z };
    expect(Math.abs(u.x * w.x + u.y * w.y + u.z * w.z)).toBeLessThan(1e-6);
    // los errores: los 30 mm llevados en la planta (16,03 mm) o en el alzado (26,13 mm)
    expect(mm(vmPlanta(TA, E2))).toBeCloseTo(16.034, 3);
    expect(mm(vmAlzado(TA, E2))).toBeCloseTo(26.1284, 3);
  });
});

/* ── Apartado 3: «La trayectoria de un tren lo define la recta t. La recta s
   es un cable de electricidad. […] el punto más alto del tren está situado a 4
   metros de su trayectoria. La escala del dibujo es 1:100. a. ¿Cumple la ley de
   seguridad? ¿A qué distancia pasa? b. En la situación más cercana, definir el
   punto del tren más alto y el punto del cable más cercano a él». Los 4 m, en
   vertical: 40 mm de la lámina sobre t. La distancia, por el producto mixto y
   por la vista de perfil, donde t es un punto. */
const L3 = JSON.parse(readFileSync(join(process.cwd(), 'src', 'content', 'laminas', 'ex54-3.json'), 'utf8')) as DatosLamina;
const s3 = rectaDesdeProyecciones(seg2(L3, 's2'), seg2(L3, 's1'));
const t3 = rectaDesdeProyecciones(seg2(L3, 't2'), seg2(L3, 't1'));
const tAlta = { p: { ...t3.p, z: t3.p.z + 40 / PT_MM }, d: t3.d };
const metros = (pt: number) => (mm(pt) * 100) / 1000;

describe('Ejercicio 54 · apartado 3', () => {
  it('t es horizontal y frontal: va de izquierda a derecha', () => {
    expect(Math.abs(t3.d.y)).toBeLessThan(1e-12);
    expect(Math.abs(t3.d.z)).toBeLessThan(1e-12);
  });

  it('el punto más alto del tren pasa a 2,42 m del cable: no cumple los 3 m', () => {
    expect(metros(distanciaRectas(tAlta, s3))).toBeCloseTo(2.4169, 3);
    expect(metros(distanciaRectas(tAlta, s3))).toBeLessThan(3);
    expect(mm(distanciaRectas(tAlta, s3))).toBeCloseTo(24.1689, 3);
  });

  it('P y Q, los puntos más cercanos, en la misma vertical: la perpendicular común es de perfil', () => {
    const P = pieComun(tAlta, s3);
    const Q = pieComun(s3, tAlta);
    expect(d2(proyPlanta(P), [872.6973, 384.84])).toBeLessThan(0.01);
    expect(d2(proyAlzado(P), [872.6973, 188.6542])).toBeLessThan(0.01);
    expect(d2(proyPlanta(Q), [872.6973, 436.7697])).toBeLessThan(0.01);
    expect(d2(proyAlzado(Q), [872.6973, 143.9669])).toBeLessThan(0.01);
    expect(Math.abs(P.x - Q.x)).toBeLessThan(1e-9);
    // las proyecciones de PQ, que no son la distancia
    expect(metros(vmPlanta(P, Q))).toBeCloseTo(1.832, 3);
    expect(metros(vmAlzado(P, Q))).toBeCloseTo(1.5765, 3);
  });

  it('los errores: sin subir los 4 m saldrían 5,03 m, y restándolos después, 1,03 m', () => {
    expect(metros(distanciaRectas(t3, s3))).toBeCloseTo(5.026, 3);
    expect(metros(distanciaRectas(t3, s3)) - 4).toBeCloseTo(1.026, 3);
  });
});

describe('Ejercicio 54 · apartado 1 a, la visibilidad en el Taller (los tramos)', () => {
  /* Lo visto y lo oculto, de un cálculo de líneas ocultas hecho aparte el 8 de
     octubre de 2026, sin src/lib, con la pirámide y el prisma como una sola
     pieza maciza: lo que de una arista cae dentro del otro sólido no se dibuja,
     y lo demás va oculto si el rayo hacia el observador atraviesa una cara de
     cualquiera de los dos que no sea de las suyas. Coordenadas en pt de la
     lámina. Da la misma visibilidad que el paso dibujar que había antes. Los
     tramos van en el segundo construir, el de J, L, P y R. V₂A₂, la base del
     alzado, V₁A₁, V₁C₁ y los extremos del prisma se ven enteros y ya están en
     la lámina, y V₂C₂ y E₂G₂, enteras ocultas, ya vienen a trazos: no son
     tramos. */
  const ESPERADOS: [string, string, 'visto' | 'oculto', [number, number], [number, number]][] = [
    ['planta', 'VB', 'visto', [477.45, 533.88], [423.76, 519.51]],
    ['planta', 'VB', 'oculto', [413.14, 516.67], [380.61, 507.96]],
    ['planta', 'VD', 'visto', [477.45, 533.88], [526.07, 546.91]],
    ['planta', 'VD', 'oculto', [544.86, 551.94], [574.17, 559.8]],
    ['planta', 'AB', 'visto', [451.53, 630.6], [397.21, 536.66]],
    ['planta', 'AB', 'oculto', [397.21, 536.66], [380.61, 507.96]],
    ['planta', 'BC', 'oculto', [380.61, 507.96], [430.21, 479.31]],
    ['planta', 'BC', 'visto', [430.21, 479.31], [503.37, 437.04]],
    ['planta', 'CD', 'visto', [503.37, 437.04], [563.61, 541.49]],
    ['planta', 'CD', 'oculto', [563.61, 541.49], [574.17, 559.8]],
    ['planta', 'DA', 'oculto', [574.17, 559.8], [517.29, 592.64]],
    ['planta', 'DA', 'visto', [517.29, 592.64], [451.53, 630.6]],
    ['planta', 'e', 'visto', [356.97, 456.84], [460.28, 505]],
    ['planta', 'e', 'visto', [513.96, 530.02], [613.89, 576.6]],
    ['planta', 'f', 'visto', [333.57, 507], [438.7, 556.01]],
    ['planta', 'f', 'visto', [488.25, 579.1], [590.49, 626.76]],
    ['planta', 'g', 'visto', [361.41, 447.24], [452.08, 489.5]],
    ['planta', 'g', 'visto', [532.39, 526.94], [618.33, 567]],
    ['planta', 'HJ', 'visto', [460.28, 505], [423.76, 519.51]],
    ['planta', 'JK', 'visto', [423.76, 519.51], [438.7, 556.01]],
    ['planta', 'KL', 'oculto', [438.7, 556.01], [413.13, 516.66]],
    ['planta', 'LM', 'oculto', [413.13, 516.66], [452.08, 489.5]],
    ['planta', 'MH', 'visto', [452.08, 489.5], [460.28, 505]],
    ['planta', 'NP', 'visto', [513.99, 530.03], [526.07, 546.91]],
    ['planta', 'PQ', 'visto', [526.07, 546.91], [488.27, 579.11]],
    ['planta', 'QR', 'oculto', [488.27, 579.11], [544.86, 551.95]],
    ['planta', 'RT', 'oculto', [544.86, 551.95], [532.42, 526.96]],
    ['planta', 'TN', 'visto', [532.42, 526.96], [513.99, 530.03]],
    ['alzado', 'VB', 'visto', [477.45, 52.68], [423.76, 209.88]],
    ['alzado', 'VB', 'visto', [413.14, 240.99], [380.61, 336.24]],
    ['alzado', 'VD', 'visto', [477.45, 52.68], [526.07, 195.21]],
    ['alzado', 'VD', 'visto', [544.86, 250.3], [574.17, 336.24]],
    ['alzado', 'e', 'visto', [356.97, 187.08], [431.55, 187.08]],
    ['alzado', 'e', 'oculto', [431.55, 187.08], [460.3, 187.08]],
    ['alzado', 'e', 'oculto', [513.96, 187.08], [523.29, 187.08]],
    ['alzado', 'e', 'visto', [523.29, 187.08], [613.89, 187.08]],
    ['alzado', 'f', 'visto', [333.57, 231.24], [438.7, 231.24]],
    ['alzado', 'f', 'visto', [488.25, 231.24], [590.49, 231.24]],
    ['alzado', 'g', 'visto', [361.41, 257.16], [407.62, 257.16]],
    ['alzado', 'g', 'oculto', [407.62, 257.16], [452.1, 257.16]],
    ['alzado', 'g', 'oculto', [532.39, 257.16], [547.2, 257.16]],
    ['alzado', 'g', 'visto', [547.2, 257.16], [618.33, 257.16]],
    ['alzado', 'HJ', 'oculto', [460.28, 187.08], [423.76, 209.88]],
    ['alzado', 'JK', 'visto', [423.76, 209.88], [438.7, 231.24]],
    ['alzado', 'KL', 'visto', [438.7, 231.24], [413.13, 241.01]],
    ['alzado', 'LM', 'oculto', [413.13, 241.01], [452.08, 257.16]],
    ['alzado', 'MH', 'oculto', [452.08, 257.16], [460.28, 187.08]],
    ['alzado', 'NP', 'oculto', [513.99, 187.08], [526.07, 195.21]],
    ['alzado', 'PQ', 'visto', [526.07, 195.21], [488.27, 231.24]],
    ['alzado', 'QR', 'visto', [488.27, 231.24], [544.86, 250.32]],
    ['alzado', 'RT', 'oculto', [544.86, 250.32], [532.42, 257.16]],
    ['alzado', 'TN', 'oculto', [532.42, 257.16], [513.99, 187.08]],
  ];
  const ej = (yaml.load(readFileSync(join(process.cwd(), 'src/content/expresion-grafica/examenes/ejercicio-54/ejercicios.yaml'), 'utf8')) as {
    ejercicios: EjercicioConReceta[];
  }).ejercicios.find((e) => e.id.startsWith('exeg-h54-1a'))!;
  const pasos = resuelveEjercicio(ej, L);
  const paso = pasos.get(2)!;
  const tol = paso.tolerancia;
  const junto = (p: readonly number[], q: readonly number[]) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 0.75;

  it('el segundo construir lleva 52 tramos, y son los del cálculo aparte, con su tipo', () => {
    expect([...pasos.entries()].filter(([, p]) => p.tramos.length > 0).map(([i]) => i).join()).toBe('2');
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

  it('y rechaza una arista cambiada de tipo, con el porqué de su tramo', () => {
    // K₁L₁ en continua: va en la cara de f a g, que mira hacia abajo
    const kl = casaTramo([438.7, 556.01], [413.13, 516.66], 'visto', paso.tramos, tol);
    expect(kl.que).toBe('tipo');
    if (kl.que === 'tipo') expect(paso.tramos[kl.tramo].porque).toMatch(/mira hacia abajo/);
    // V₁D₁ de R₁ a D₁ en continua: el prisma le pasa por encima
    const rd = casaTramo([544.86, 551.95], [574.17, 559.8], 'visto', paso.tramos, tol);
    expect(rd.que).toBe('tipo');
    if (rd.que === 'tipo') expect(paso.tramos[rd.tramo].porque).toMatch(/4,3 mm/);
    // e₂ de E₂ a H₂ en continua: de su cruce con V₂B₂ a H₂ va por detrás de la pirámide
    expect(casaTramo([356.97, 187.08], [460.28, 187.08], 'visto', paso.tramos, tol).que).toBe('tipo');
    // V₂B₂ entera, de V₂ a B₂: salta lo que va por dentro del prisma
    expect(casaTramo([477.45, 52.68], [380.61, 336.24], 'visto', paso.tramos, tol).que).toBe('corte');
  });
});
