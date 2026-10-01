import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  PT_MM,
  abatido,
  abatidoJunto,
  anguloConPH,
  anguloDiedro,
  anguloPlanoConPH,
  anguloPlanos,
  anguloRectas,
  corteRectaPlano,
  deltaCota,
  distanciaAPlano,
  distanciaARecta,
  distanciaRectas,
  gira,
  perpendicularAPlano,
  pieComun,
  pieEnRecta,
  plano,
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
import type { DatosLamina } from '../../src/lib/lamina';

/* El Ejercicio 53 de la Colección de ejercicios de diédrico (Dpto. de
   Expresión Gráfica y Proyectos de Ingeniería, EIG, UPV/EHU), págs. 58-60:
   sin fecha, en tres apartados. Los apartados 2 y 3 van al final, con sus
   láminas `ex53-2` y `ex53-3`. Apartado 1, sobre la mitad izquierda de la
   pág. 59: «El plano definido por
   las rectas paralelas r y s secciona la columna que tiene por bases los
   rectángulos ABCD y EFGI. Se pide dibujar: A. La intersección entre el plano y
   la columna. B. La verdadera magnitud de la intersección mediante el método
   de abatimientos».

   Las coordenadas son las de la lámina `ex53-1`. Las cifras esperadas salen
   de un segundo camino (1 de octubre de 2026): álgebra de vectores sobre esas
   mismas coordenadas, sin pasar por `src/lib/`. El plano, por el producto vectorial de la dirección de r
   y el salto de r a s; los cortes, por el parámetro de cada arista; los
   abatidos, por la definición (el pie en s, la distancia real y la horizontal
   perpendicular a s) y por un giro de Rodrigues alrededor de s, que dan lo
   mismo. Aquí se cotejan contra `lib/diedrico`, que es lo que usa la receta. */

/* Las láminas de los tres apartados, desde una sola carpeta. */
const LAMINAS = join(process.cwd(), 'src', 'content', 'laminas');
const lamina = (id: string): DatosLamina => JSON.parse(readFileSync(join(LAMINAS, `${id}.json`), 'utf8')) as DatosLamina;
const L = lamina('ex53-1');
const xy = (n: string): P2 => [L.puntos[n].x, L.puntos[n].y];
const P = Object.fromEntries(
  ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'I'].map((v) => [v, punto3(xy(`${v}2`), xy(`${v}1`))]),
) as Record<'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'I', P3>;
const seg = (n: string): [P2, P2] => {
  const s = L.segmentos.find((x) => x.nombre === n);
  if (!s) throw new Error(`la lámina no tiene el segmento ${n}`);
  return [s.a, s.b];
};
const r = rectaDesdeProyecciones(seg('r2'), seg('r1'));
const s = rectaDesdeProyecciones(seg('s2'), seg('s1'));
const plano_rs = plano(pieEnRecta(P.A, r), pieEnRecta(P.G, r), pieEnRecta(P.A, s));
const corte = (a: P3, b: P3) => corteRectaPlano(rectaPorPuntos(a, b), plano_rs);
const K = corte(P.A, P.G);
const Lc = corte(P.B, P.I);
const M = corte(P.C, P.E);
const N = corte(P.D, P.F);
const d2 = (p: P2, q: P2) => Math.hypot(p[0] - q[0], p[1] - q[1]);
/* La distancia de un punto de la lámina a la recta de un segmento, en pt. */
const aRecta = (p: P2, [a, b]: [P2, P2]) =>
  Math.abs((p[0] - a[0]) * (b[1] - a[1]) - (p[1] - a[1]) * (b[0] - a[0])) / d2(a, b);

describe('Ejercicio 53 · la lámina del apartado 1', () => {
  it('cada arranque de arista apunta al vértice de la otra base: A con G, B con I, C con E, D con F', () => {
    for (const [arranque, otro] of [
      ['AG2', 'G2'],
      ['GA2', 'A2'],
      ['BI2', 'I2'],
      ['IB2', 'B2'],
      ['CE2', 'E2'],
      ['EC2', 'C2'],
      ['DF2', 'F2'],
      ['FD2', 'D2'],
      ['AG1', 'G1'],
      ['GA1', 'A1'],
      ['DF1', 'F1'],
      ['FD1', 'D1'],
    ] as const) {
      expect(aRecta(xy(otro), seg(arranque))).toBeLessThan(1.1);
    }
  });

  it('r y s son paralelas y horizontales: los alzados, horizontales, y las plantas, a 45°', () => {
    expect(Math.abs(r.d.z)).toBeLessThan(1e-12);
    expect(Math.abs(s.d.z)).toBeLessThan(1e-12);
    expect(Math.abs(r.d.x * s.d.y - r.d.y * s.d.x)).toBeLessThan(1e-12);
    expect(Math.abs(r.d.x + r.d.y)).toBeLessThan(1e-12);
  });

  it('B₁, C₁, E₁ e I₁ caen sobre s₁, a menos de 0,3 pt: la cara BCEI contiene a s', () => {
    const esperado = { B1: 0.17, C1: 0.255, E1: 0.085, I1: 0.085 };
    for (const [n, d] of Object.entries(esperado)) expect(aRecta(xy(n), seg('s1'))).toBeCloseTo(d, 2);
  });
});

describe('Ejercicio 53 · apartado 1, la sección', () => {
  it('el plano de r y s forma 47,41° con el plano horizontal', () => {
    expect(anguloPlanoConPH(plano_rs)).toBeCloseTo(47.4146, 3);
  });

  it('K, L, M y N caen donde los deja el segundo camino, en las dos vistas', () => {
    const esperado: [P3, P2, P2][] = [
      [K, [151.6176, 527.0362], [151.6176, 217.4766]],
      [Lc, [181.2701, 566.6812], [181.2701, 270.7918]],
      [M, [241.0479, 506.8049], [241.0479, 270.7159]],
      [N, [200.1133, 478.5908], [200.1133, 217.5153]],
    ];
    for (const [X, planta, alzado] of esperado) {
      expect(d2(proyPlanta(X), planta)).toBeLessThan(1e-3);
      expect(d2(proyAlzado(X), alzado)).toBeLessThan(1e-3);
    }
  });

  it('el plano corta las cuatro aristas laterales entre sus bases, y ninguna base', () => {
    for (const [X, a, b] of [
      [K, P.A, P.G],
      [Lc, P.B, P.I],
      [M, P.C, P.E],
      [N, P.D, P.F],
    ] as const) {
      const t = (X.z - a.z) / (b.z - a.z);
      expect(t).toBeGreaterThan(0);
      expect(t).toBeLessThan(1);
    }
  });

  it('L y M están en s (a 0,23 y 0,33 pt), y KN es horizontal y paralela a s', () => {
    expect(distanciaARecta(Lc, s)).toBeCloseTo(0.2285, 3);
    expect(distanciaARecta(M, s)).toBeCloseTo(0.3315, 3);
    expect(Math.abs(K.z - N.z)).toBeLessThan(0.05);
    const u = [N.x - K.x, N.y - K.y];
    const angulo = (Math.acos(Math.abs(u[0] * s.d.x + u[1] * s.d.y) / Math.hypot(u[0], u[1])) * 180) / Math.PI;
    expect(angulo).toBeLessThan(0.05);
  });

  it('los lados en verdadera magnitud, en planta, en alzado y su diferencia de cotas, en mm', () => {
    const lado = (a: P3, b: P3) => [vm(a, b), vmPlanta(a, b), vmAlzado(a, b), deltaCota(a, b)].map((x) => x * PT_MM);
    const esperado: [P3, P3, number[]][] = [
      [K, Lc, [25.6669, 17.4652, 21.5217, 18.8084]],
      [Lc, M, [29.8479, 29.8479, 21.0883, 0.0268]],
      [M, N, [25.6874, 17.5387, 23.6807, 18.768]],
      [N, K, [24.1821, 24.1821, 17.1082, 0.0137]],
    ];
    for (const [a, b, e] of esperado) lado(a, b).forEach((x, i) => expect(x).toBeCloseTo(e[i], 3));
  });
});

describe('Ejercicio 53 · apartado 1, la sección abatida con s de charnela', () => {
  it('K y N quedan a 25,63 y 25,61 mm de la charnela', () => {
    expect(vm(K, pieEnRecta(K, s)) * PT_MM).toBeCloseTo(25.6262, 3);
    expect(vm(N, pieEnRecta(N, s)) * PT_MM).toBeCloseTo(25.6076, 3);
  });

  it('los abatidos de K y N, a los dos lados, caen donde los deja el segundo camino', () => {
    const esperado: [P3, P2[]][] = [
      [K, [[237.7407, 613.1593], [135.0107, 510.4293]]],
      [N, [[286.1741, 564.6516], [183.5184, 461.9959]]],
    ];
    for (const [X, lados] of esperado) {
      const dados = abatido(X, s, plano_rs).map(proyPlanta);
      for (const e of lados) expect(dados.some((d) => d2(d, e) < 1e-3)).toBe(true);
    }
  });

  it('el abatido es un giro de 47,41° alrededor de s, hacia un lado o 180° − 47,41° hacia el otro', () => {
    const a = anguloPlanoConPH(plano_rs);
    const giros = [a, -a, 180 - a, a - 180].map((g) => gira(K, s, g)).filter((Q) => Math.abs(Q.z - s.p.z) < 1e-6);
    const abatidos = abatido(K, s, plano_rs);
    expect(giros.length).toBe(2);
    for (const Q of abatidos) expect(giros.some((G) => vm(G, Q) < 1e-6)).toBe(true);
  });

  it('(N) con el mismo giro que llevó K a (K), como la receta, es el abatido de N del mismo lado', () => {
    const [nA, nB] = abatido(N, s, plano_rs).map(proyPlanta);
    const esperado: P2[][] = [
      [[237.7407, 613.1593], [286.1741, 564.6516]],
      [[135.0107, 510.4293], [183.5184, 461.9959]],
    ];
    for (const kAb of abatido(K, s, plano_rs)) {
      const n = proyPlanta(abatidoJunto(N, s, plano_rs, kAb, K));
      expect(Math.min(d2(n, nA), d2(n, nB))).toBeLessThan(1e-6);
      const par = esperado.find(([k]) => d2(proyPlanta(kAb), k) < 1e-3);
      expect(par !== undefined && d2(n, par[1]) < 1e-3).toBe(true);
      /* Y la traslación (K) + (N − K), que vale porque KN es paralela a s, cae
         a menos de 0,1 pt. */
      const t: P2 = [kAb.x + N.x - K.x, kAb.y + N.y - K.y];
      expect(d2(t, n)).toBeLessThan(0.1);
    }
  });

  it('KL abatido mide lo mismo que KL en el espacio, 25,67 mm, y medido hasta L₁ no se aparta ni 0,15 mm', () => {
    /* El abatimiento no deforma: (K)(L) es KL, a cada lado. L está a 0,23 pt de
       s, así que (L) se separa de L₁ 0,08 mm, y lo que el alumno mide, de (K) a
       L₁, da 25,69 mm por un lado y 25,80 mm por el otro: dentro del milímetro. */
    const [kA, kB] = abatido(K, s, plano_rs).map(proyPlanta);
    const [lA, lB] = abatido(Lc, s, plano_rs).map(proyPlanta);
    const ladoA = d2(lA, kA) < d2(lB, kA) ? lA : lB;
    const ladoB = ladoA === lA ? lB : lA;
    expect(d2(kA, ladoA) * PT_MM).toBeCloseTo(25.6669, 3);
    expect(d2(kB, ladoB) * PT_MM).toBeCloseTo(25.6669, 3);
    for (const k of [kA, kB]) expect(Math.abs(d2(k, proyPlanta(Lc)) * PT_MM - 25.6669)).toBeLessThan(0.15);
    expect(Math.hypot(17.4652, 18.8084)).toBeCloseTo(25.6669, 3);
  });

  it('el abatido con r de charnela, que es el ejemplo de un error, cae en (167,58; 543,00) por delante', () => {
    const dados = abatido(K, r, plano_rs).map(proyPlanta);
    expect(dados.some((d) => d2(d, [167.576, 542.995]) < 1e-2)).toBe(true);
  });
});

/* ── Apartado 2 (lámina ex53-2, pág. 59, mitad derecha): «Una ventana cuadrada
   de lado AB se sitúa cerrada en la pared 1234. La ventana gira alrededor del
   lado AB. Se pide dibujar: A. […] cerrada. B. […] abierta hacia fuera de la
   pared un ángulo de 60º». «Hacia fuera» es el lado de la pared que se ve en
   las dos vistas. Las cifras, de un segundo camino: la pared por producto
   vectorial, el cuadrado por la perpendicular a AB en la pared, y el giro en
   la base (abajo en la pared, normal hacia fuera), cotejado con Rodrigues. ── */

const L2 = lamina('ex53-2');
const xy2 = (n: string): P2 => [L2.puntos[n].x, L2.puntos[n].y];
const V = [1, 2, 3, 4].map((i) => punto3(xy2(`${i}_2`), xy2(`${i}_1`)));
const pared = plano(V[0], V[1], V[3]);
const Aw = puntoEnPlanoDesdeAlzado(xy2('A2'), pared);
const Bw = puntoEnPlanoDesdeAlzado(xy2('B2'), pared);
const abajo = (cands: P3[]) => cands.reduce((a, b) => (b.z < a.z ? b : a));
const arriba = (cands: P3[]) => cands.reduce((a, b) => (b.z > a.z ? b : a));
const Dw = abajo([90, -90].map((g) => gira(Bw, perpendicularAPlano(Aw, pared), g)));
const Cw = abajo([90, -90].map((g) => gira(Aw, perpendicularAPlano(Bw, pared), g)));
const ejeAB = rectaPorPuntos(Aw, Bw);
const Cp = arriba([60, -60].map((g) => gira(Cw, ejeAB, g)));
const Dp = arriba([60, -60].map((g) => gira(Dw, ejeAB, g)));
const cerca = (p: P2, q: P2) => d2(p, q) < 1e-3;

describe('Ejercicio 53 · apartado 2, la ventana', () => {
  it('la pared es un plano inclinado a 69,02° del PH: 3 está en el plano de 1, 2 y 4, y 1-4 y 2-3 son de perfil', () => {
    expect(distanciaAPlano(V[2], pared)).toBeLessThan(1e-9);
    expect(anguloPlanoConPH(pared)).toBeCloseTo(69.0151, 3);
    expect(V[0].x).toBe(V[3].x);
    expect(V[1].x).toBe(V[2].x);
  });

  it('A₁ y B₁, la ventana cerrada y la abierta caen donde los deja el segundo camino', () => {
    const esperado: [P3, P2, P2][] = [
      [Aw, [662.61, 341.645], [662.61, 124.2]],
      [Bw, [754.41, 320.0939], [754.41, 124.2]],
      [Cw, [762.1279, 352.9695], [762.1279, 212.2416]],
      [Dw, [670.3279, 374.5206], [670.3279, 212.2416]],
      [Cp, [775.6949, 410.7599], [775.6949, 138.9756]],
      [Dp, [683.8949, 432.311], [683.8949, 138.9756]],
    ];
    for (const [X, pl, al] of esperado) {
      expect(cerca(proyPlanta(X), pl)).toBe(true);
      expect(cerca(proyAlzado(X), al)).toBe(true);
    }
  });

  it('ABCD es un cuadrado de 33,27 mm en la pared, y abierta la ventana forma 60° con ella', () => {
    expect(vm(Aw, Bw) * PT_MM).toBeCloseTo(33.2654, 3);
    for (const [p, q] of [
      [Bw, Cw],
      [Cw, Dw],
      [Dw, Aw],
      [Bw, Cp],
      [Cp, Dp],
      [Dp, Aw],
    ] as const) {
      expect(vm(p, q)).toBeCloseTo(vm(Aw, Bw), 6);
    }
    expect(distanciaAPlano(Cw, pared)).toBeLessThan(1e-9);
    expect(distanciaAPlano(Dw, pared)).toBeLessThan(1e-9);
    const u = { x: Cw.x - Bw.x, y: Cw.y - Bw.y, z: Cw.z - Bw.z };
    const w = { x: Cp.x - Bw.x, y: Cp.y - Bw.y, z: Cp.z - Bw.z };
    const coseno = (u.x * w.x + u.y * w.y + u.z * w.z) / (Math.hypot(u.x, u.y, u.z) * Math.hypot(w.x, w.y, w.z));
    expect((Math.acos(coseno) * 180) / Math.PI).toBeCloseTo(60, 6);
  });

  it('«hacia fuera» es el giro que deja C′ más alto: hacia la cara que se ve en las dos vistas, con más alejamiento', () => {
    const otro = abajo([60, -60].map((g) => gira(Cw, ejeAB, g)));
    expect(Cp.y).toBeGreaterThan(Cw.y);
    expect(otro.y).toBeLessThan(Cw.y);
    /* la normal de la pared hacia la cara vista apunta a +y y a +z */
    const n = pared.n.y > 0 ? pared.n : { x: -pared.n.x, y: -pared.n.y, z: -pared.n.z };
    expect(n.z).toBeGreaterThan(0);
    expect((Cp.x - Bw.x) * n.x + (Cp.y - Bw.y) * n.y + (Cp.z - Bw.z) * n.z).toBeGreaterThan(0);
  });

  it('el borde DC sube 25,85 mm hacia fuera, 5,21 hacia dentro y 2,25 con la ventana a 60° del PH', () => {
    expect(deltaCota(Cw, Cp) * PT_MM).toBeCloseTo(25.8466, 3);
    const dentro = abajo([60, -60].map((g) => gira(Cw, ejeAB, g)));
    expect(deltaCota(Cw, dentro) * PT_MM).toBeCloseTo(5.2125, 3);
    const a60 = arriba([1, -1].map((k) => gira(Cw, ejeAB, k * (anguloPlanoConPH(pared) - 60))));
    expect(deltaCota(Cw, a60) * PT_MM).toBeCloseTo(2.2504, 3);
    expect(vm(Cw, Cp) * PT_MM).toBeCloseTo(33.2654, 3);
    expect(anguloConPH(Bw, Cp)).toBeCloseTo(9.0151, 3);
  });
});

/* ── Apartado 3 (lámina ex53-3, pág. 60, figura A): «Los planos ABC y ABD
   […] definen un tejado. A. Calcular gráficamente el ángulo entre los dos
   planos. B. […] Determinar la distancia mínima entre las rectas AD y BC y
   dibujar las proyecciones diédricas del refuerzo». Las cifras, de un segundo
   camino: el diedro por las componentes perpendiculares a AB y por las
   normales; la distancia por el triple producto y por los pies. ── */

const L3 = lamina('ex53-3');
const xy3 = (n: string): P2 => [L3.puntos[n].x, L3.puntos[n].y];
const T = Object.fromEntries(['A', 'B', 'C', 'D'].map((v) => [v, punto3(xy3(`${v}2`), xy3(`${v}1`))])) as Record<
  'A' | 'B' | 'C' | 'D',
  P3
>;

describe('Ejercicio 53 · apartado 3, el tejado', () => {
  const AB = rectaPorPuntos(T.A, T.B);
  const AD = rectaPorPuntos(T.A, T.D);
  const BC = rectaPorPuntos(T.B, T.C);

  it('A: los planos ABC y ABD forman 86,10° (el menor de los dos); las caras, 93,90° por dentro', () => {
    const planos = anguloPlanos(plano(T.A, T.B, T.C), plano(T.A, T.B, T.D));
    expect(anguloDiedro(T.C, AB, T.D)).toBeCloseTo(93.9009, 3);
    expect(planos).toBeCloseTo(86.0991, 3);
    expect(anguloDiedro(T.C, AB, T.D) + planos).toBeCloseTo(180, 6);
  });

  it('A: los distractores, el ángulo CAD (67,26°), la suma de las pendientes (89,90°) y la sección vista en la planta (26,19°)', () => {
    expect(anguloRectas(AD, rectaPorPuntos(T.A, T.C))).toBeCloseTo(67.2591, 3);
    const p1 = anguloPlanoConPH(plano(T.A, T.B, T.C));
    const p2 = anguloPlanoConPH(plano(T.A, T.B, T.D));
    expect(p1).toBeCloseTo(44.1365, 3);
    expect(p2).toBeCloseTo(45.7594, 3);
    expect(p1 + p2).toBeCloseTo(89.8959, 3);
    /* la sección por C perpendicular a AB, vista en la planta: F₁C₁ y F₁X₁ */
    const F = pieEnRecta(T.C, AB);
    const nAB = { x: T.B.x - T.A.x, y: T.B.y - T.A.y, z: T.B.z - T.A.z };
    const k = (nAB.x * (F.x - T.A.x) + nAB.y * (F.y - T.A.y) + nAB.z * (F.z - T.A.z)) /
      (nAB.x * (T.D.x - T.A.x) + nAB.y * (T.D.y - T.A.y) + nAB.z * (T.D.z - T.A.z));
    const X = { x: T.A.x + k * (T.D.x - T.A.x), y: T.A.y + k * (T.D.y - T.A.y), z: T.A.z + k * (T.D.z - T.A.z) };
    const u = [T.C.x - F.x, T.C.y - F.y];
    const w = [X.x - F.x, X.y - F.y];
    const enPlanta = (Math.acos((u[0] * w[0] + u[1] * w[1]) / (Math.hypot(u[0], u[1]) * Math.hypot(w[0], w[1]))) * 180) / Math.PI;
    expect(enPlanta).toBeCloseTo(153.8086, 3);
    expect(180 - enPlanta).toBeCloseTo(26.1914, 3);
    /* F y X, los puntos del construir; y el ángulo CFX es el de las caras */
    expect(cerca(proyAlzado(F), [179.6069, 159.0186])).toBe(true);
    expect(cerca(proyPlanta(X), [212.2855, 239.5465])).toBe(true);
    expect(anguloDiedro(T.C, AB, T.D)).toBeCloseTo(
      (Math.acos(((T.C.x - F.x) * (X.x - F.x) + (T.C.y - F.y) * (X.y - F.y) + (T.C.z - F.z) * (X.z - F.z)) /
        (vm(T.C, F) * vm(X, F))) * 180) / Math.PI,
      6,
    );
  });

  it('B: la distancia mínima entre AD y BC es 36,05 mm, y los pies caen donde los deja el segundo camino', () => {
    expect(distanciaRectas(AD, BC) * PT_MM).toBeCloseTo(36.0508, 3);
    const P = pieComun(AD, BC);
    const Q = pieComun(BC, AD);
    expect(cerca(proyPlanta(P), [200.3899, 240.7011])).toBe(true);
    expect(cerca(proyAlzado(P), [200.3899, 203.2171])).toBe(true);
    expect(cerca(proyPlanta(Q), [217.0243, 338.3699])).toBe(true);
    expect(cerca(proyAlzado(Q), [217.0243, 178.1743])).toBe(true);
    expect(vm(P, Q) * PT_MM).toBeCloseTo(36.0508, 3);
    expect(vmPlanta(P, Q) * PT_MM).toBeCloseTo(34.9515, 3);
    expect(vmAlzado(P, Q) * PT_MM).toBeCloseTo(10.6059, 3);
    expect(vm(T.A, pieEnRecta(T.A, BC)) * PT_MM).toBeCloseTo(45.4666, 3);
  });

  it('B: P está en AD a 0,80 de A y Q en BC a 0,46 de B, dentro de los dos lados', () => {
    const P = pieComun(AD, BC);
    const Q = pieComun(BC, AD);
    expect(vm(T.A, P) / vm(T.A, T.D)).toBeCloseTo(0.7995, 3);
    expect(vm(T.B, Q) / vm(T.B, T.C)).toBeCloseTo(0.4557, 3);
  });

  it('el cruce aparente de A₂D₂ y B₂C₂, que es el ejemplo de un error, está en (192,54; 200,97)', () => {
    const [a0, a1, b0, b1] = [xy3('A2'), xy3('D2'), xy3('B2'), xy3('C2')];
    const r = [a1[0] - a0[0], a1[1] - a0[1]];
    const q = [b1[0] - b0[0], b1[1] - b0[1]];
    const u = ((b0[0] - a0[0]) * q[1] - (b0[1] - a0[1]) * q[0]) / (r[0] * q[1] - r[1] * q[0]);
    expect(cerca([a0[0] + u * r[0], a0[1] + u * r[1]], [192.5365, 200.9733])).toBe(true);
  });
});
