import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  PT_MM,
  abatidoAlzado,
  abatidoPlanta,
  anguloConPV,
  anguloRectaPlano,
  anguloRectas,
  apice,
  corteRectaPlano,
  cuadradoPorDiagonal,
  distanciaAPlano,
  distanciaARecta,
  distanciaRectas,
  pieComun,
  pieEnPlano,
  pieEnRecta,
  plano,
  planoMediador,
  proyAlzado,
  proyPlanta,
  punto3,
  rectaDesdeProyecciones,
  rectaPorPuntos,
  vm,
  vmAlzado,
  vmPlanta,
  type P3,
} from '../../src/lib/diedrico';
import yaml from 'js-yaml';
import { resuelveEjercicio, type EjercicioConReceta } from '../../src/lib/construir';
import { casaTramo } from '../../src/lib/diedrico-corrige';
import type { DatosLamina } from '../../src/lib/lamina';

/* El Ejercicio 55 de la Colección de ejercicios de diédrico (Dpto. de
   Expresión Gráfica y Proyectos de Ingeniería, EIG, UPV/EHU), págs. 64-66:
   uno de los cuatro ejercicios de varios apartados, sin fecha, con que cierra
   la colección. Apartado 1, sobre el prisma triangular ABC-A′B′C′ de la pág. 65:
   «a. El ángulo entre las rectas AB y BC (α). b. El ángulo entre el plano
   A′B′C′ y la recta BB′ (β). c. La distancia mínima entre el punto Z′ y el
   plano BCB′C′ (d) [...]. d. La distancia mínima ente las rectas BB′ y ZZ′
   (t) [...]». Y los apartados de la pág. 66: el 2, «la pirámide cuya base cuadrada se
   haya en el plano ABCD» con diagonal EF, altura el doble de BC y «de mayor
   cota»; y el 3, las dos tuberías de igual longitud desde A y B hasta un punto
   P del colector r.

   Las coordenadas son las de las láminas `ex55-1ab`, `ex55-1cd`, `ex55-2` y
   `ex55-3`. Las cifras
   esperadas salen de un segundo camino escrito aparte el 1 de octubre de 2026:
   álgebra de vectores sobre esas mismas coordenadas, sin importar nada de
   `src/lib/`, y cada una por dos vías
   que coinciden (α por el producto escalar y en la planta; β por la normal y
   por el triángulo de la verdadera magnitud; d por |n·(Z′−B)| y por la
   construcción del papel con un plano auxiliar; t por el triple producto y por
   los pies de la perpendicular común). Aquí se cotejan contra `lib/diedrico`. */

const lamina = (id: string): DatosLamina =>
  JSON.parse(readFileSync(join(process.cwd(), 'src', 'content', 'laminas', `${id}.json`), 'utf8')) as DatosLamina;
const punto = (L: DatosLamina, alzado: string, planta: string): P3 => {
  const [a, p] = [L.puntos[alzado], L.puntos[planta]];
  return punto3([a.x, a.y], [p.x, p.y]);
};
const VERTICES = ['A', 'B', 'C', 'Ap', 'Bp', 'Cp'] as const;
const prisma = (L: DatosLamina): Record<(typeof VERTICES)[number], P3> =>
  Object.fromEntries(VERTICES.map((v) => [v, punto(L, `${v[0]}2${v.slice(1)}`, `${v[0]}1${v.slice(1)}`)])) as Record<
    (typeof VERTICES)[number],
    P3
  >;

const L1 = lamina('ex55-1ab');
const L2 = lamina('ex55-1cd');

describe('Ejercicio 55 · las dos láminas del apartado 1', () => {
  it('las dos bases son horizontales: sus tres alzados a la misma altura', () => {
    for (const L of [L1, L2]) {
      const P = prisma(L);
      expect(P.B.z).toBe(P.A.z);
      expect(P.C.z).toBe(P.A.z);
      expect(P.Bp.z).toBe(P.Ap.z);
      expect(P.Cp.z).toBe(P.Ap.z);
    }
  });

  it('el prisma de c-d es el de a-b trasladado (22,20; 532,80), vértice a vértice', () => {
    const [P, Q] = [prisma(L1), prisma(L2)];
    for (const v of VERTICES) {
      expect(Q[v].x - P[v].x).toBeCloseTo(22.2, 6);
      expect(Q[v].y - P[v].y).toBeCloseTo(532.8, 6);
      expect(Q[v].z - P[v].z).toBeCloseTo(-532.8, 6);
    }
  });

  it('ZZ′ está corrida 0,48 pt entre las dos vistas, dentro de la holgura de la lámina', () => {
    for (const [a, p] of [['Z2', 'Z1'], ['Z2p', 'Z1p']]) {
      expect(Math.abs(L2.puntos[a].x - L2.puntos[p].x)).toBeCloseTo(0.48, 6);
    }
  });
});

describe('Ejercicio 55 · apartado 1, a y b (ex55-1ab)', () => {
  const P = prisma(L1);
  const BBp = rectaPorPuntos(P.B, P.Bp);
  const base = plano(P.Ap, P.Bp, P.Cp);

  it('α: el ángulo entre AB y BC es 69,23°, y el del triángulo en B, su suplementario', () => {
    const alfa = anguloRectas(rectaPorPuntos(P.A, P.B), rectaPorPuntos(P.B, P.C));
    expect(alfa).toBeCloseTo(69.2303, 3);
    /* En la planta, que da el plano ABC en verdadera magnitud. */
    const u = [P.A.x - P.B.x, P.A.y - P.B.y];
    const w = [P.C.x - P.B.x, P.C.y - P.B.y];
    const enB = (Math.acos((u[0] * w[0] + u[1] * w[1]) / (Math.hypot(u[0], u[1]) * Math.hypot(w[0], w[1]))) * 180) / Math.PI;
    expect(enB).toBeCloseTo(110.7697, 3);
    expect(alfa + enB).toBeCloseTo(180, 9);
  });

  it('β: el ángulo de BB′ con el plano A′B′C′ es 32,67°', () => {
    expect(anguloRectaPlano(BBp, base)).toBeCloseTo(32.6707, 3);
    /* Y es el del triángulo abatido: Δz frente a la planta. */
    expect((Math.atan2(P.B.z - P.Bp.z, vmPlanta(P.B, P.Bp)) * 180) / Math.PI).toBeCloseTo(32.6707, 3);
  });

  it('los distractores de β: el alzado deforma (68,02°) y el abatimiento por el alzado da el ángulo con el PV (54,40°)', () => {
    expect((Math.atan2(P.B.z - P.Bp.z, P.Bp.x - P.B.x) * 180) / Math.PI).toBeCloseTo(68.0228, 3);
    expect(anguloConPV(P.B, P.Bp)).toBeCloseTo(54.4009, 3);
  });

  it('BB′: verdadera magnitud, planta, alzado y diferencia de cotas, en mm', () => {
    expect(vm(P.B, P.Bp) * PT_MM).toBeCloseTo(74.8152, 3);
    expect(vmPlanta(P.B, P.Bp) * PT_MM).toBeCloseTo(62.9785, 3);
    expect(vmAlzado(P.B, P.Bp) * PT_MM).toBeCloseTo(43.5507, 3);
    expect((P.B.z - P.Bp.z) * PT_MM).toBeCloseTo(40.386, 3);
  });

  it('los cuatro extremos abatidos sobre la planta caen donde los deja el segundo camino', () => {
    const esperados = [
      [283.14, 367.4265],
      [504.3, 308.1735],
      [329.34, 539.8665],
      [550.5, 480.6135],
    ];
    const dados = [...abatidoPlanta(P.Bp, P.B), ...abatidoPlanta(P.B, P.Bp)];
    for (const e of esperados) expect(dados.some((d) => Math.hypot(d[0] - e[0], d[1] - e[1]) < 1e-3)).toBe(true);
    /* El de B′ por el alzado, que es el ejemplo de un error del ejercicio. */
    const [a] = abatidoAlzado(P.B, P.Bp);
    expect(Math.hypot(a[0] - 280.0108, a[1] - 324.9336)).toBeLessThan(1e-3);
  });
});

describe('Ejercicio 55 · apartado 1, c y d (ex55-1cd)', () => {
  const P = prisma(L2);
  const Z = punto(L2, 'Z2', 'Z1');
  const Zp = punto(L2, 'Z2p', 'Z1p');
  const cara = plano(P.B, P.C, P.Bp);
  const BBp = rectaPorPuntos(P.B, P.Bp);
  const ZZp = rectaPorPuntos(Z, Zp);

  it('C′ está en el plano de B, C y B′ a la precisión del dibujo (0,02 mm)', () => {
    expect(distanciaAPlano(P.Cp, cara) * PT_MM).toBeCloseTo(0.0196, 3);
  });

  it('d: la distancia de Z′ a la cara es 30,85 mm, y H cae donde lo deja el segundo camino', () => {
    expect(distanciaAPlano(Zp, cara) * PT_MM).toBeCloseTo(30.8478, 3);
    const H = pieEnPlano(Zp, cara);
    expect(proyPlanta(H)[0]).toBeCloseTo(427.0734, 3);
    expect(proyPlanta(H)[1]).toBeCloseTo(938.2178, 3);
    expect(proyAlzado(H)[1]).toBeCloseTo(720.9176, 3);
    expect(vmPlanta(Zp, H) * PT_MM).toBeCloseTo(17.3596, 3);
    expect(vmAlzado(Zp, H) * PT_MM).toBeCloseTo(27.34, 3);
  });

  it('la distancia de Z′ a la arista BB′ casi coincide con d, pero su pie está a más de 2 mm de H', () => {
    expect(distanciaARecta(Zp, BBp) * PT_MM).toBeCloseTo(30.9423, 3);
    const H = pieEnPlano(Zp, cara);
    const pie = pieEnRecta(Zp, BBp);
    expect(Math.hypot(...([0, 1] as const).map((i) => proyPlanta(pie)[i] - proyPlanta(H)[i])) * PT_MM).toBeGreaterThan(2);
    expect(Math.hypot(...([0, 1] as const).map((i) => proyAlzado(pie)[i] - proyAlzado(H)[i])) * PT_MM).toBeGreaterThan(2);
  });

  it('t: la distancia entre BB′ y ZZ′ es 20,20 mm, y M y N caen donde los deja el segundo camino', () => {
    expect(distanciaRectas(BBp, ZZp) * PT_MM).toBeCloseTo(20.1997, 3);
    const M = pieComun(BBp, ZZp);
    const N = pieComun(ZZp, BBp);
    expect(vm(M, N) * PT_MM).toBeCloseTo(20.1997, 3);
    expect(proyPlanta(M)[0]).toBeCloseTo(428.4721, 3);
    expect(proyPlanta(M)[1]).toBeCloseTo(917.4504, 3);
    expect(proyAlzado(M)[1]).toBeCloseTo(709.8232, 3);
    expect(proyPlanta(N)[0]).toBeCloseTo(452.6603, 3);
    expect(proyPlanta(N)[1]).toBeCloseTo(884.4031, 3);
    expect(proyAlzado(N)[1]).toBeCloseTo(749.8405, 3);
    expect(vmPlanta(M, N) * PT_MM).toBeCloseTo(14.4475, 3);
    expect(vmAlzado(M, N) * PT_MM).toBeCloseTo(16.4957, 3);
  });

  it('las dos rectas se cruzan: sus plantas y sus alzados se cortan en verticales a 8,79 mm', () => {
    const corte = (p: number[], dp: number[], q: number[], dq: number[]) => {
      const det = dp[0] * -dq[1] - dp[1] * -dq[0];
      const t = ((q[0] - p[0]) * -dq[1] - (q[1] - p[1]) * -dq[0]) / det;
      return p[0] + dp[0] * t;
    };
    const [b1, bp1, z1, zp1] = [P.B, P.Bp, Z, Zp].map(proyPlanta);
    const [b2, bp2, z2, zp2] = [P.B, P.Bp, Z, Zp].map(proyAlzado);
    const xPlanta = corte([...b1], [bp1[0] - b1[0], bp1[1] - b1[1]], [...z1], [zp1[0] - z1[0], zp1[1] - z1[1]]);
    const xAlzado = corte([...b2], [bp2[0] - b2[0], bp2[1] - b2[1]], [...z2], [zp2[0] - z2[0], zp2[1] - z2[1]]);
    expect(xPlanta).toBeCloseTo(421.682, 3);
    expect(xAlzado).toBeCloseTo(446.602, 3);
    expect(Math.abs(xPlanta - xAlzado) * PT_MM).toBeCloseTo(8.791, 3);
  });
});

describe('Ejercicio 55 · apartado 2, la pirámide de mayor cota (ex55-2)', () => {
  const L = lamina('ex55-2');
  const [A, B, C, D, E, F] = ['A', 'B', 'C', 'D', 'E', 'F'].map((n) => punto(L, `${n}2`, `${n}1`));
  const cara = plano(A, B, D);
  const base = cuadradoPorDiagonal(cara, E, F);
  /* G, el vértice de mayor cota de los dos que faltan; H, el de menor. La
     receta los toma por su posición en la lista, uno(base, 2) y uno(base, 4):
     la primera prueba de abajo vigila que sigan siendo esos. */
  const [G, H] = [base[1], base[3]];

  it('cuadrado_por_diagonal da [E, G, F, H], con G el de mayor cota (la receta los toma así)', () => {
    expect(base[0]).toBe(E);
    expect(base[2]).toBe(F);
    expect(G.z).toBeGreaterThan(H.z);
  });
  const h = 2 * vm(B, C);

  it('AD y BC son horizontales, y C, E y F están en el plano de A, B y D', () => {
    expect(A.z).toBe(D.z);
    expect(B.z).toBe(C.z);
    for (const X of [C, E, F]) expect(distanciaAPlano(X, cara) * PT_MM).toBeLessThan(0.01);
  });

  it('la altura es dos veces BC, 108,03 mm, y BC está en verdadera magnitud en la planta', () => {
    expect(h * PT_MM).toBeCloseTo(108.0311, 3);
    expect(vmPlanta(B, C)).toBeCloseTo(vm(B, C), 9);
    expect(vmAlzado(B, C) * PT_MM).toBeCloseTo(27.0087, 3);
  });

  it('la base: G y H donde los deja el segundo camino, y el lado, 40,37 mm', () => {
    expect(proyPlanta(G)[0]).toBeCloseTo(86.243, 2);
    expect(proyPlanta(G)[1]).toBeCloseTo(528.682, 2);
    expect(proyAlzado(G)[1]).toBeCloseTo(256.288, 2);
    expect(proyPlanta(H)[0]).toBeCloseTo(221.617, 2);
    expect(proyPlanta(H)[1]).toBeCloseTo(511.118, 2);
    expect(proyAlzado(H)[1]).toBeCloseTo(343.232, 2);
    expect(vm(E, G) * PT_MM).toBeCloseTo(40.3724, 3);
    expect(vm(E, F) * PT_MM).toBeCloseTo(57.0952, 3);
    expect(vmPlanta(E, G) * PT_MM).toBeCloseTo(34.73, 3);
    expect(vmAlzado(E, G) * PT_MM).toBeCloseTo(26.6835, 3);
  });

  it('el vértice de la de mayor cota, y el de la de menor, que cae fuera del marco de la hoja', () => {
    const V = apice(base, h, 1);
    expect(proyPlanta(V)[0]).toBeCloseTo(304.558, 2);
    expect(proyPlanta(V)[1]).toBeCloseTo(433.036, 2);
    expect(proyAlzado(V)[1]).toBeCloseTo(47.683, 2);
    expect(vm(V, E) * PT_MM).toBeCloseTo(111.7394, 3);
    const Vbaja = apice(base, h, -1);
    expect(proyPlanta(Vbaja)[0]).toBeCloseTo(3.302, 2);
    expect(proyAlzado(Vbaja)[1]).toBeCloseTo(551.837, 2);
    expect(V.z).toBeGreaterThan(Vbaja.z);
  });
});

describe('Ejercicio 55 · apartado 3, las dos tuberías (ex55-3)', () => {
  const L = lamina('ex55-3');
  const A = punto(L, 'A2', 'A1');
  const B = punto(L, 'B2', 'B1');
  const seg = (n: string) => {
    const s = L.segmentos.find((x) => x.nombre === n);
    if (!s) throw new Error(`la lámina no tiene el segmento ${n}`);
    return [s.a, s.b] as const;
  };
  const r = rectaDesdeProyecciones(seg('r2'), seg('r1'));
  const P = corteRectaPlano(r, planoMediador(A, B));

  it('P está en r y equidista de A y de B: las dos tuberías miden 49,02 mm', () => {
    expect(proyPlanta(P)[0]).toBeCloseTo(814.463, 2);
    expect(proyPlanta(P)[1]).toBeCloseTo(634.962, 2);
    expect(proyAlzado(P)[1]).toBeCloseTo(295.465, 2);
    expect(vm(P, A)).toBeCloseTo(vm(P, B), 9);
    expect(vm(P, A) * PT_MM).toBeCloseTo(49.0249, 3);
  });

  it('las proyecciones de las tuberías, que son los distractores y las casualidades de la figura', () => {
    expect(vmAlzado(P, A) * PT_MM).toBeCloseTo(33.5753, 3);
    expect(vmPlanta(P, B) * PT_MM).toBeCloseTo(17.1714, 3);
    expect(vmPlanta(P, A) * PT_MM).toBeCloseTo(48.8534, 3);
    expect(vmAlzado(P, B) * PT_MM).toBeCloseTo(48.8375, 3);
  });
});

describe('Ejercicio 55 · apartado 2, la visibilidad en el Taller (los tramos)', () => {
  /* Lo visto y lo oculto, de un cálculo de líneas ocultas hecho aparte el 7 de
     octubre de 2026, sin src/lib: cada arista muestreada y mirada por rayos
     contra las caras opacas —la lámina ABCD y las cinco de la pirámide, con la
     base apoyada encima de la lámina—, y cada cambio afinado por bisección.
     Coordenadas en pt de la lámina; los cambios, con la holgura de medio pt de
     la lámina «gruesa» del cálculo. Junto a F, que cae justo sobre CD, el
     cálculo daba dos restos de menos de 1 pt, que son redondeo y no tramos.
     Los bordes de la lámina que se ven enteros no son tramos: ya están
     dibujados. */
  const ESPERADOS: [string, string, 'visto' | 'oculto', [number, number], [number, number]][] = [
    ['planta', 'BC', 'visto', [155.73, 430.44], [161.92, 441.17]],
    ['planta', 'BC', 'oculto', [161.92, 441.17], [219.04, 540.09]],
    ['planta', 'BC', 'visto', [219.04, 540.09], [232.29, 563.04]],
    ['planta', 'DA', 'visto', [147.09, 612.12], [109.28, 546.58]],
    ['planta', 'DA', 'oculto', [109.28, 546.58], [92.54, 517.57]],
    ['planta', 'DA', 'visto', [92.54, 517.57], [70.65, 479.64]],
    ['planta', 'EG', 'visto', [134.37, 442.8], [86.24, 528.68]],
    ['planta', 'GF', 'visto', [86.24, 528.68], [173.49, 597]],
    ['planta', 'FH', 'oculto', [173.49, 597], [221.62, 511.12]],
    ['planta', 'HE', 'oculto', [221.62, 511.12], [134.37, 442.8]],
    ['planta', 'VE', 'visto', [304.56, 433.04], [134.37, 442.8]],
    ['planta', 'VG', 'visto', [304.56, 433.04], [86.24, 528.68]],
    ['planta', 'VF', 'visto', [304.56, 433.04], [173.49, 597]],
    ['planta', 'VH', 'oculto', [304.56, 433.04], [221.62, 511.12]],
    ['alzado', 'EG', 'oculto', [134.37, 314.64], [92.64, 264.04]],
    ['alzado', 'EG', 'visto', [92.64, 264.04], [86.24, 256.29]],
    ['alzado', 'GF', 'visto', [86.24, 256.29], [109.88, 264.03]],
    ['alzado', 'GF', 'oculto', [109.88, 264.03], [173.49, 284.88]],
    ['alzado', 'FH', 'oculto', [173.49, 284.88], [212.22, 331.84]],
    ['alzado', 'FH', 'visto', [212.22, 331.84], [221.62, 343.23]],
    ['alzado', 'HE', 'visto', [221.62, 343.23], [186.87, 331.84]],
    ['alzado', 'HE', 'oculto', [186.87, 331.84], [134.37, 314.64]],
    ['alzado', 'VE', 'oculto', [304.56, 47.68], [134.37, 314.64]],
    ['alzado', 'VG', 'visto', [304.56, 47.68], [86.24, 256.29]],
    ['alzado', 'VF', 'visto', [304.56, 47.68], [173.49, 284.88]],
    ['alzado', 'VH', 'visto', [304.56, 47.68], [226.16, 327.04]],
    ['alzado', 'VH', 'oculto', [226.16, 327.04], [224.81, 331.84]],
    ['alzado', 'VH', 'visto', [224.81, 331.84], [221.62, 343.23]],
  ];
  const ej = (yaml.load(readFileSync(join(process.cwd(), 'src/content/expresion-grafica/examenes/ejercicio-55/ejercicios.yaml'), 'utf8')) as {
    ejercicios: EjercicioConReceta[];
  }).ejercicios.find((e) => e.id.startsWith('exeg-h55-2'))!;
  const pasos = resuelveEjercicio(ej, lamina('ex55-2'));
  const [indice, paso] = [...pasos.entries()][0];
  const tol = paso.tolerancia;
  const cerca = (p: readonly number[], q: readonly number[]) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 0.75;

  it('el paso construir lleva 28 tramos, y son los del cálculo aparte, con su tipo', () => {
    expect(indice).toBe(1);
    expect(paso.tramos).toHaveLength(ESPERADOS.length);
    for (const [vista, arista, tipo, a, b] of ESPERADOS) {
      const t = paso.tramos.find((x) => (cerca(x.a, a) && cerca(x.b, b)) || (cerca(x.a, b) && cerca(x.b, a)));
      expect(t, `${vista} ${arista} de (${a}) a (${b})`).toBeDefined();
      expect(t!.tipo, `${vista} ${arista} de (${a}) a (${b})`).toBe(tipo);
    }
  });

  it('el Taller da por buena esa visibilidad, tramo a tramo y de un tirón donde no cambia', () => {
    for (const [, , tipo, a, b] of ESPERADOS) expect(casaTramo(a, b, tipo, paso.tramos, tol).que).toBe('bien');
    // VG y VE en la planta, enteras de un tirón: no cambian
    expect(casaTramo([304.56, 433.04], [86.24, 528.68], 'visto', paso.tramos, tol).que).toBe('bien');
  });

  it('y rechaza una arista cambiada de tipo, con el porqué de su tramo', () => {
    const ve = casaTramo([304.56, 433.04], [134.37, 442.8], 'oculto', paso.tramos, tol);
    expect(ve.que).toBe('tipo');
    if (ve.que === 'tipo') expect(paso.tramos[ve.tramo].porque).toMatch(/contorno de la planta/);
    // el borde BC de la planta entero en continua: el tramo de debajo de la pirámide va a trazos
    const bc = casaTramo([155.73, 430.44], [232.29, 563.04], 'visto', paso.tramos, tol);
    expect(bc.que).toBe('tipo');
    if (bc.que === 'tipo') expect(paso.tramos[bc.tramo].tipo).toBe('oculto');
    // VH del alzado entera en continua: el tramo corto junto a C₂ va oculto
    expect(casaTramo([304.56, 47.68], [221.62, 343.23], 'visto', paso.tramos, tol).que).toBe('tipo');
    // y cortada donde no cambia nada
    expect(casaTramo([304.56, 47.68], [260, 200], 'visto', paso.tramos, tol).que).toBe('corte');
  });
});
