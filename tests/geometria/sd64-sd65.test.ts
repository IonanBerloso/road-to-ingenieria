import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  PT_MM,
  abatido,
  abatidoJunto,
  anguloConPH,
  anguloPlanoConPH,
  anguloPlanos,
  cambioPlano,
  corte2D,
  corteRectaPlano,
  distanciaAPlano,
  distanciaARecta,
  enPlano,
  gira,
  horizontalPor,
  pieComun,
  pieEnRecta,
  plano,
  poligonoRegular,
  proyAlzado,
  proyPlanta,
  punto3,
  puntoEnPlanoDesdePlanta,
  puntosADistancia,
  rectaPorPuntos,
  simetrico,
  vm,
  vmPlanta,
  type P2,
  type P3,
  type Recta2,
} from '../../src/lib/diedrico';
import yaml from 'js-yaml';
import { resuelveEjercicio, type EjercicioConReceta } from '../../src/lib/construir';
import { casaTramo } from '../../src/lib/diedrico-corrige';
import type { DatosLamina } from '../../src/lib/lamina';

/* SD64 y SD65 · los Ejercicios 48 y 49 de la colección de diédrico directo
   (Dpto. de Expresión Gráfica y Proyectos de Ingeniería, EIG, UPV/EHU): la
   chapa hexagonal soldada a 30° sobre la diagonal BD de una chapa horizontal,
   y el agujero cuadrado de lado a, con dos lados horizontales, en la cara
   inclinada de un depósito, centrado donde lo pincha el eje de un tubo a 45°.
   Las láminas son `src/content/laminas/sd64.json` y `sd65.json`, sacadas de los
   trazos vectoriales del PDF.

   Las cifras esperadas se sacaron el 2 de octubre de 2026 por un segundo
   camino, sin lib/diedrico, con un guion aparte: álgebra de vectores sobre las
   coordenadas de las láminas. En SD64, cada punto del hexágono a la distancia
   real r de BD queda en la planta a r·cos 30° de BD y
   r·sen 30° por encima de la chapa; la vista 4 lleva la cota desde la línea
   nueva. En SD65, el eje se corta con la cara, el cuadrado se monta en la cara
   con la línea de máxima pendiente y la horizontal por I, y la vuelta se hace
   también por afinidad con las diagonales. Aquí se cotejan con lib/diedrico, y
   se comprueba lo que ninguna de las dos cuentas puede fingir: que el hexágono
   es regular, que el agujero es un cuadrado de lado a en la cara y que la
   visibilidad sale de comparar cotas.

   Los puntos se comparan a 0,05 pt (0,02 mm); las longitudes, a la milésima de
   mm. */

const mm = (v: number) => v * PT_MM;
const d2 = (a: P2, b: P2) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const pl = (P: P3) => proyPlanta(P);
const al = (P: P3) => proyAlzado(P);
const cerca = (p: P2, x: number, y: number, tol = 0.05) => {
  expect(Math.abs(p[0] - x), `x ${p[0]} frente a ${x}`).toBeLessThanOrEqual(tol);
  expect(Math.abs(p[1] - y), `y ${p[1]} frente a ${y}`).toBeLessThanOrEqual(tol);
};
const recta2 = (a: P2, b: P2): Recta2 => ({ p: a, d: [b[0] - a[0], b[1] - a[1]] });
/** El cruce de la recta ab con la recta ce, en el papel. */
const corte = (a: P2, b: P2, c: P2, e: P2): P2 => {
  const t = corte2D(a, [b[0] - a[0], b[1] - a[1]], c, e);
  if (!t) throw new Error('paralelas');
  return [a[0] + t.t * (b[0] - a[0]), a[1] + t.t * (b[1] - a[1])];
};
/** Punto en polígono, por paridad. */
const dentro = (p: P2, poli: P2[]) => {
  let c = false;
  for (let i = 0; i < poli.length; i++) {
    const [a, b] = [poli[i], poli[(i + 1) % poli.length]];
    if (a[1] > p[1] !== b[1] > p[1] && a[0] + ((p[1] - a[1]) * (b[0] - a[0])) / (b[1] - a[1]) > p[0]) c = !c;
  }
  return c;
};

describe('SD64 · la chapa hexagonal soldada a 30° sobre BD', () => {
  const A = punto3([297.48, 169.56], [297.48, 268.8]);
  const B = punto3([439.2, 169.56], [439.2, 268.8]);
  const C = punto3([439.2, 169.56], [439.2, 367.92]);
  const D = punto3([297.48, 169.56], [297.48, 367.92]);
  const chapa = plano(A, B, D);
  const O: P3 = { x: (B.x + D.x) / 2, y: (B.y + D.y) / 2, z: (B.z + D.z) / 2 };
  const BD = rectaPorPuntos(B, D);
  const [F, E] = puntosADistancia(BD, O, 10 / PT_MM);
  const ejeE = rectaPorPuntos(E, { ...E, z: E.z + 20 });
  const KabA = gira(F, ejeE, 60);
  const [, , GabA, HabA, IabA, JabA] = poligonoRegular(chapa, KabA, E, 6);
  // «inclinada hacia A»: el abatido del lado de A, girado 30° hacia arriba
  const sube = (P: P3) => [gira(P, BD, 30), gira(P, BD, -30)].reduce((a, b) => (a.z > b.z ? a : b));
  const baja = (P: P3) => [gira(P, BD, 30), gira(P, BD, -30)].reduce((a, b) => (a.z < b.z ? a : b));
  const [G, H, I, J] = [GabA, HabA, IabA, JabA].map(sube);
  const hexagono = plano(B, D, G);
  const nueva: Recta2 = recta2([268.63, 405.18], [196.41, 301.93]);

  it('la chapa ABCD es horizontal: sus cuatro vértices tienen la misma cota', () => {
    expect(new Set([A.z, B.z, C.z, D.z]).size).toBe(1);
    expect(anguloPlanoConPH(chapa)).toBeCloseTo(0, 9);
    expect(mm(vmPlanta(A, B))).toBeCloseTo(50.0, 2);
    expect(mm(vmPlanta(A, D))).toBeCloseTo(34.967, 2);
  });

  it('el hexágono es regular, de 20 mm, con EF sobre BD y centrado en O', () => {
    const vs = [E, F, G, H, I, J];
    vs.forEach((P, k) => expect(mm(vm(P, vs[(k + 1) % 6]))).toBeCloseTo(20, 3));
    expect(mm(vm(E, H))).toBeCloseTo(40, 3);
    expect(distanciaARecta(E, BD)).toBeLessThan(1e-9);
    expect(vm(O, E)).toBeCloseTo(vm(O, F), 9);
    for (const P of vs) expect(enPlano(P, hexagono, 1e-6)).toBe(true);
  });

  it('su plano forma 30° con la chapa y sube hacia el lado de A', () => {
    expect(anguloPlanos(hexagono, chapa)).toBeCloseTo(30, 6);
    expect(anguloPlanoConPH(hexagono)).toBeCloseTo(30, 6);
    expect(G.z).toBeGreaterThan(A.z);
    // en la planta, H₁ cae del lado de A respecto de B₁D₁
    const lado = (P: P3) => (D.x - B.x) * (P.y - B.y) - (D.y - B.y) * (P.x - B.x);
    expect(Math.sign(lado(H))).toBe(Math.sign(lado(A)));
  });

  it('las proyecciones del hexágono, como en el segundo camino', () => {
    cerca(pl(E), 391.5688, 302.1136);
    cerca(pl(F), 345.1112, 334.6064);
    cerca(pl(G), 297.5128, 316.0096);
    cerca(pl(H), 296.3721, 264.92);
    cerca(pl(I), 342.8296, 232.4273);
    cerca(pl(J), 390.428, 251.024);
    cerca(al(E), 391.5688, 169.56);
    cerca(al(F), 345.1112, 169.56);
    cerca(al(G), 297.5128, 145.0112);
    cerca(al(H), 296.3721, 120.4625);
    cerca(al(I), 342.8296, 120.4625);
    cerca(al(J), 390.428, 145.0112);
  });

  it('abatido sobre la chapa: los dos lados de BD, y la figura cae junta', () => {
    const [Ga, Gc] = abatido(G, BD, hexagono);
    cerca(pl(Ga), 293.7429, 310.6193);
    cerca(pl(Gc), 350.022, 391.0862);
    cerca(pl(abatidoJunto(H, BD, hexagono, Ga, G)), 288.8321, 254.1395);
    cerca(pl(abatidoJunto(I, BD, hexagono, Ga, G)), 335.2897, 221.6467);
    cerca(pl(abatidoJunto(J, BD, hexagono, Ga, G)), 386.658, 245.6338);
    cerca(pl(abatidoJunto(H, BD, hexagono, Gc, G)), 401.3903, 415.0733);
    // abatido, el hexágono está en la chapa y es el regular del lado de A
    expect(vm(Ga, GabA)).toBeLessThan(1e-6);
    expect(Ga.z).toBeCloseTo(A.z, 9);
  });

  it('la vista 4: BD de punta, el canto a 30° y G ≡ J, H ≡ I', () => {
    const v4 = (P: P3) => cambioPlano(P, 'vertical', nueva, B);
    cerca(v4(B), 260.6118, 393.7166);
    cerca(v4(D), 260.6118, 393.7166);
    cerca(v4(A), 214.0535, 327.1541);
    cerca(v4(G), 216.1213, 372.9403);
    cerca(v4(H), 171.6348, 352.1696);
    expect(d2(v4(G), v4(J))).toBeLessThan(0.01);
    expect(d2(v4(H), v4(I))).toBeLessThan(0.01);
    cerca(v4(GabA), 232.4673, 353.4796);
    cerca(v4(HabA), 204.3267, 313.2482);
    // la línea nueva es perpendicular a BD, y B₄G₄ forma 30° con ella
    const u: P2 = [D.x - B.x, D.y - B.y];
    expect(Math.abs(u[0] * nueva.d[0] + u[1] * nueva.d[1]) / (Math.hypot(...u) * Math.hypot(...nueva.d))).toBeLessThan(1e-3);
    const g = v4(G);
    const b = v4(B);
    const sen = Math.abs((nueva.d[0] * (g[1] - b[1]) - nueva.d[1] * (g[0] - b[0])) / Math.hypot(...nueva.d)) / d2(g, b);
    expect(Math.asin(sen) * (180 / Math.PI)).toBeCloseTo(30, 1);
  });

  it('las cifras del calcular: la altura de HI y sus tres errores', () => {
    const pie = pieEnRecta(H, BD);
    expect(mm(H.z - B.z)).toBeCloseTo(17.3205, 3);
    expect(mm(vm(H, pie))).toBeCloseTo(34.641, 3);
    expect(mm(vmPlanta(H, pie))).toBeCloseTo(30.0, 3);
    expect(mm(G.z - B.z)).toBeCloseTo(8.6603, 3);
  });

  it('la visibilidad en la planta: el hexágono, encima, tapa el rincón A', () => {
    const hex = [E, F, G, H, I, J].map(pl);
    expect(dentro(pl(A), hex)).toBe(true);
    // A₁B₁ entra bajo el hexágono hasta J₁E₁; A₁D₁, hasta G₁H₁
    const xAB = corte(pl(A), pl(B), pl(J), pl(E));
    const xDA = corte(pl(D), pl(A), pl(G), pl(H));
    cerca(xAB, 390.8249, 268.8);
    cerca(xDA, 297.48, 314.5385);
    expect(mm(d2(pl(A), xAB))).toBeCloseTo(32.93, 2);
    expect(mm(d2(pl(A), xDA))).toBeCloseTo(16.135, 2);
    // a mitad del tramo oculto de AB, el hexágono está 11,1 mm por encima
    const m: P2 = [(pl(A)[0] + xAB[0]) / 2, pl(A)[1]];
    expect(mm(puntoEnPlanoDesdePlanta(m, hexagono).z - A.z)).toBeCloseTo(11.095, 2);
    // las casualidades: G₁ sobre A₁D₁, H₁ a 1,4 mm de A₁
    expect(mm(Math.abs(G.x - A.x))).toBeLessThan(0.02);
    expect(mm(d2(pl(H), pl(A)))).toBeCloseTo(1.4235, 3);
  });

  it('el hexágono por debajo de la chapa es el simétrico: mismo alzado reflejado y misma planta', () => {
    const Gb = baja(GabA);
    cerca(pl(Gb), 297.5128, 316.0096);
    expect(A.z - Gb.z).toBeCloseTo(G.z - A.z, 9);
  });
});

describe('SD65 · el agujero cuadrado del tubo a 45°', () => {
  const A = punto3([291.6, 176.28], [291.6, 627.12]);
  const P = punto3([141.6, 266.64], [141.6, 547.08]);
  const Q = punto3([250.68, 266.64], [250.68, 477.84]);
  const R = punto3([304.44, 311.04], [304.44, 562.68]);
  const S = punto3([195.48, 311.04], [195.48, 631.8]);
  const cara = plano(P, Q, S);
  const a = 121.08 - 64.32;
  const X1: P2 = [277.8, 609.24];
  // el eje: por A, con la planta por e₁ hacia X1, y a 45°
  const dpl = [X1[0] - A.x, X1[1] - A.y];
  const l = Math.hypot(dpl[0], dpl[1]);
  const T45: P3 = { x: A.x + dpl[0] / l, y: A.y + dpl[1] / l, z: A.z - 1 };
  const eje = rectaPorPuntos(A, T45);
  const I = corteRectaPlano(eje, cara);
  const ch = rectaPorPuntos(Q, P);
  const M = pieEnRecta(I, ch);
  const h = a / 2;
  const [U] = puntosADistancia(rectaPorPuntos(I, M), I, h);
  const [Xq, Xp] = puntosADistancia(horizontalPor(I, cara), I, h);
  const medio = (X: P3, Y: P3): P3 => ({ x: (X.x + Y.x) / 2, y: (X.y + Y.y) / 2, z: (X.z + Y.z) / 2 });
  const J = simetrico(I, medio(U, Xp));
  const K = simetrico(I, medio(U, Xq));
  const L = simetrico(J, I);
  const N = simetrico(K, I);

  it('la cara de arriba es un plano inclinado 23,9°, y R está en él', () => {
    expect(distanciaAPlano(R, cara)).toBeLessThan(0.02);
    expect(anguloPlanoConPH(cara)).toBeCloseTo(23.856, 2);
    expect(mm(a)).toBeCloseTo(20.024, 3);
  });

  it('el eje forma 45° con el suelo y pincha la cara en I', () => {
    expect(anguloConPH(A, T45)).toBeCloseTo(45, 9);
    cerca(pl(I), 225.5138, 541.4952);
    cerca(al(I), 225.5138, 284.4419);
    expect(mm(vmPlanta(A, I))).toBeCloseTo(38.157, 2);
    expect(mm(A.z - I.z)).toBeCloseTo(38.157, 2);
  });

  it('I por el plano vertical del eje: A₂T₂ corta E₂F₂ en I₂', () => {
    const corteArista = (X: P3, Y: P3): P3 => {
      const t = corte2D(pl(A), [dpl[0], dpl[1]], pl(X), pl(Y))!;
      return { x: X.x + t.s * (Y.x - X.x), y: X.y + t.s * (Y.y - X.y), z: X.z + t.s * (Y.z - X.z) };
    };
    const E = corteArista(S, R);
    const F = corteArista(P, Q);
    cerca(pl(E), 262.4319, 589.3283);
    cerca(pl(F), 200.8141, 509.4931);
    // T, en la vertical de F₁, baja A₁F₁ desde la cota de A
    const T = pieComun(eje, rectaPorPuntos(F, { ...F, z: F.z + 20 }));
    cerca(al(T), 200.8141, 324.8673);
    expect(A.z - T.z).toBeCloseTo(vmPlanta(A, F), 6);
    const I2 = corte(al(A), al(T), al(E), al(F));
    cerca(I2, 225.5138, 284.4419);
    // el error: el alzado del eje a 45° en el papel pincha la cara casi en F
    const Tmal: P3 = { x: F.x, y: F.y, z: A.z - Math.abs(A.x - F.x) };
    const Imal = corteRectaPlano(rectaPorPuntos(A, Tmal), cara);
    cerca(al(Imal), 201.0616, 266.8184);
    expect(d2(pl(Imal), pl(F))).toBeLessThan(0.5);
  });

  it('el agujero es un cuadrado de lado a en la cara, con dos lados horizontales', () => {
    for (const X of [J, K, L, N]) expect(distanciaAPlano(X, cara)).toBeLessThan(1e-6);
    const vs = [J, K, L, N];
    vs.forEach((X, k) => expect(vm(X, vs[(k + 1) % 4])).toBeCloseTo(a, 6));
    expect(vm(J, L)).toBeCloseTo(a * Math.SQRT2, 6);
    expect(J.z).toBeCloseTo(K.z, 9);
    expect(L.z).toBeCloseTo(N.z, 9);
    expect(J.z).toBeGreaterThan(N.z);
    expect(vm(medio(J, L), I)).toBeLessThan(1e-9);
  });

  it('sus proyecciones, como en el segundo camino', () => {
    cerca(pl(J), 187.6435, 534.7911);
    cerca(pl(K), 235.5644, 504.3726);
    cerca(pl(L), 263.384, 548.1994);
    cerca(pl(N), 215.4631, 578.6178);
    cerca(al(J), 187.6435, 272.9638);
    cerca(al(K), 235.5644, 272.9638);
    cerca(al(L), 263.384, 295.9199);
    cerca(al(N), 215.4631, 295.9199);
  });

  it('abatido alrededor de PQ: hacia fuera y hacia dentro, el cuadrado entero', () => {
    const [Ifuera, Identro] = abatido(I, ch, cara);
    cerca(pl(Ifuera), 180.3516, 470.3471);
    cerca(pl(Identro), 227.5291, 544.6702);
    expect(mm(vm(I, M))).toBeCloseTo(15.528, 2);
    const ab = (X: P3) => abatidoJunto(X, ch, cara, Ifuera, I);
    cerca(pl(ab(J)), 171.6003, 509.5168);
    cerca(pl(ab(K)), 219.5212, 479.0984);
    cerca(pl(ab(L)), 189.1028, 431.1774);
    cerca(pl(ab(N)), 141.1819, 461.5959);
    // abatido sigue siendo un cuadrado de lado a, con JK paralelo a la charnela
    expect(d2(pl(ab(J)), pl(ab(K)))).toBeCloseTo(a, 6);
    expect(d2(pl(ab(J)), pl(ab(N)))).toBeCloseTo(a, 6);
    const jk = [ab(K).x - ab(J).x, ab(K).y - ab(J).y];
    const pq = [P.x - Q.x, P.y - Q.y];
    expect(Math.abs(jk[0] * pq[1] - jk[1] * pq[0]) / (Math.hypot(...jk) * Math.hypot(...pq))).toBeLessThan(1e-9);
  });

  it('la afinidad: las diagonales cortan PQ en G y H, que no se mueven', () => {
    const G = pieComun(rectaPorPuntos(J, L), ch);
    const H = pieComun(rectaPorPuntos(K, N), ch);
    cerca(pl(G), 166.7788, 531.0974);
    cerca(pl(H), 241.1018, 483.9199);
    expect(distanciaARecta(G, ch)).toBeLessThan(1e-6);
    expect(distanciaARecta(G, rectaPorPuntos(J, L))).toBeLessThan(1e-6);
    // en la planta, G₁, J₁, I₁ y L₁ en una recta; en el alzado, G₂, J₂, I₂ y L₂
    const alineados = (p: P2, q: P2, r: P2) => Math.abs((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])) / d2(p, q);
    expect(alineados(pl(G), pl(I), pl(J))).toBeLessThan(1e-6);
    expect(alineados(al(G), al(I), al(L))).toBeLessThan(1e-6);
    expect(alineados(pl(H), pl(I), pl(N))).toBeLessThan(1e-6);
  });

  it('la cifra del calcular y sus errores', () => {
    expect(mm(vmPlanta(J, N))).toBeCloseTo(18.313, 3);
    expect(mm(vm(J, N))).toBeCloseTo(20.024, 3);
    expect(mm((vm(J, N) * vm(J, N)) / vmPlanta(J, N))).toBeCloseTo(21.894, 3);
    expect(mm(J.z - N.z)).toBeCloseTo(8.098, 3);
    expect(mm(vmPlanta(J, K))).toBeCloseTo(20.024, 3);
  });

  it('el error que el Taller no ve: el cuadrado dibujado en la planta cae a menos de 1 mm', () => {
    // un cuadrado de lado a en la planta, centrado en I₁ y con los lados
    // paralelos y perpendiculares a P₁Q₁
    const uq = [(P.x - Q.x) / vmPlanta(P, Q), (P.y - Q.y) / vmPlanta(P, Q)];
    const um = [(M.x - I.x) / vmPlanta(I, M), (M.y - I.y) / vmPlanta(I, M)];
    const Jpl: P2 = [I.x + h * (uq[0] + um[0]), I.y + h * (uq[1] + um[1])];
    const dist = d2(Jpl, pl(J));
    expect(mm(dist)).toBeCloseTo(0.853, 2);
    expect(mm(dist)).toBeLessThan(1);
  });

  it('la otra lectura, un tubo de sección cuadrada, daría un paralelogramo sin lados horizontales', () => {
    // la sección recta del tubo: un lado horizontal (h) y el otro perpendicular
    // al eje y a h (v); sus cuatro aristas, cortadas con la cara
    const d = eje.d;
    const hx = { x: d.y, y: -d.x, z: 0 };
    const lh = Math.hypot(hx.x, hx.y);
    const hu = { x: hx.x / lh, y: hx.y / lh, z: 0 };
    const vu = { x: hu.y * d.z - hu.z * d.y, y: hu.z * d.x - hu.x * d.z, z: hu.x * d.y - hu.y * d.x };
    const arista = (sh: number, sv: number): P3 => {
      const p = { x: I.x + h * (sh * hu.x + sv * vu.x), y: I.y + h * (sh * hu.y + sv * vu.y), z: I.z + h * (sh * hu.z + sv * vu.z) };
      return corteRectaPlano(rectaPorPuntos(p, { x: p.x + d.x, y: p.y + d.y, z: p.z + d.z }), cara);
    };
    const [p0, p1, p2, p3] = [arista(1, 1), arista(-1, 1), arista(-1, -1), arista(1, -1)];
    const lados = [vm(p0, p1), vm(p1, p2)].map(mm).sort((x, y) => x - y);
    expect(lados[0]).toBeCloseTo(20.039, 2);
    expect(lados[1]).toBeCloseTo(21.482, 2);
    // los lados que vienen de los horizontales del tubo no lo son en la cara:
    // forman 4,0° con PQ y suben 1,6°
    const u = rectaPorPuntos(p0, p1).d;
    const pq = rectaPorPuntos(P, Q).d;
    const ang = (Math.acos(Math.abs(u.x * pq.x + u.y * pq.y + u.z * pq.z)) * 180) / Math.PI;
    expect(ang).toBeCloseTo(3.984, 2);
    expect((Math.asin(Math.abs(u.z)) * 180) / Math.PI).toBeCloseTo(1.61, 2);
  });

  it('el agujero se ve en las dos vistas: la cara mira hacia arriba y hacia delante', () => {
    const n = cara.n.z > 0 ? cara.n : { x: -cara.n.x, y: -cara.n.y, z: -cara.n.z };
    expect(n.z).toBeGreaterThan(0);
    expect(n.y).toBeGreaterThan(0);
  });
});

describe('SD64 · la visibilidad en el Taller (los tramos)', () => {
  /* Lo visto y lo oculto del montaje, de un cálculo de líneas ocultas hecho
     aparte el 8 de octubre de 2026, sin src/lib: cada arista muestreada y
     mirada por rayos contra las dos chapas, finas y opacas, y cada cambio
     afinado por bisección. Coordenadas en pt de la lámina. No son tramos B₁C₁,
     C₁D₁ y la chapa del alzado, que se ven enteros y ya están dibujados; ni
     E₂F₂, que va sobre A₂B₂; ni el tramo oculto de A₁D₁, de A₁ a G₁H₁, que va a
     0,36 mm o menos de G₁H₁, que se ve: lo visto manda, y en el Taller los dos
     tramos se pisarían. */
  const ESPERADOS: [string, string, 'visto' | 'oculto', [number, number], [number, number]][] = [
    ['planta', 'EF', 'visto', [391.57, 302.11], [345.11, 334.61]],
    ['planta', 'FG', 'visto', [345.11, 334.61], [297.51, 316.01]],
    ['planta', 'GH', 'visto', [297.51, 316.01], [296.37, 264.92]],
    ['planta', 'HI', 'visto', [296.37, 264.92], [342.83, 232.43]],
    ['planta', 'IJ', 'visto', [342.83, 232.43], [390.43, 251.02]],
    ['planta', 'JE', 'visto', [390.43, 251.02], [391.57, 302.11]],
    ['planta', 'AB', 'oculto', [297.48, 268.8], [390.82, 268.8]],
    ['planta', 'AB', 'visto', [390.82, 268.8], [439.2, 268.8]],
    ['alzado', 'FG', 'visto', [345.11, 169.56], [297.51, 145.01]],
    ['alzado', 'GH', 'visto', [297.51, 145.01], [296.37, 120.46]],
    ['alzado', 'HI', 'visto', [296.37, 120.46], [342.83, 120.46]],
    ['alzado', 'IJ', 'visto', [342.83, 120.46], [390.43, 145.01]],
    ['alzado', 'JE', 'visto', [390.43, 145.01], [391.57, 169.56]],
  ];
  const laminaSd64 = JSON.parse(readFileSync(join(process.cwd(), 'src', 'content', 'laminas', 'sd64.json'), 'utf8')) as DatosLamina;
  const ejercicio = (yaml.load(readFileSync(join(process.cwd(), 'src/content/expresion-grafica/t03-metodos-descriptivos/ejercicios.yaml'), 'utf8')) as {
    ejercicios: EjercicioConReceta[];
  }).ejercicios.find((e) => e.id.startsWith('sd64-'))!;
  const [indice, paso] = [...resuelveEjercicio(ejercicio, laminaSd64).entries()][1];
  const tol = paso.tolerancia;
  const junto = (p: readonly number[], q: readonly number[]) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 0.75;
  const tramoDe = (a: readonly number[], b: readonly number[]) =>
    paso.tramos.find((x) => (junto(x.a, a) && junto(x.b, b)) || (junto(x.a, b) && junto(x.b, a)));

  it('el construir de la vuelta lleva 13 tramos, y son los del cálculo aparte, con su tipo', () => {
    expect(indice).toBe(2);
    expect(paso.tramos).toHaveLength(ESPERADOS.length);
    for (const [vista, arista, tipo, a, b] of ESPERADOS) {
      const t = tramoDe(a, b);
      expect(t, `${vista} ${arista} de (${a}) a (${b})`).toBeDefined();
      expect(t!.tipo, `${vista} ${arista} de (${a}) a (${b})`).toBe(tipo);
    }
  });

  it('el Taller da por buena esa visibilidad, tramo a tramo', () => {
    for (const [, , tipo, a, b] of ESPERADOS) expect(casaTramo(a, b, tipo, paso.tramos, tol).que).toBe('bien');
  });

  it('y rechaza una arista cambiada de tipo, con el porqué de su tramo', () => {
    // A₁B₁ entera en continua: de A₁ a J₁E₁ la tapa el hexágono
    const ab = casaTramo([297.48, 268.8], [439.2, 268.8], 'visto', paso.tramos, tol);
    expect(ab.que).toBe('tipo');
    if (ab.que === 'tipo') expect(paso.tramos[ab.tramo].porque).toMatch(/El hexágono la tapa/);
    // G₁H₁ a trazos: se ve
    expect(casaTramo([297.51, 316.01], [296.37, 264.92], 'oculto', paso.tramos, tol).que).toBe('tipo');
    // y A₁B₁ cortada donde no cambia nada
    expect(casaTramo([297.48, 268.8], [340, 268.8], 'oculto', paso.tramos, tol).que).toBe('corte');
  });

  it('el tramo tapado de A₁D₁ va pegado a G₁H₁, más cerca que la tolerancia: no es tramo', () => {
    const gh = tramoDe([297.51, 316.01], [296.37, 264.92])!;
    const lejos = (p: readonly number[]) =>
      Math.abs((gh.b[0] - gh.a[0]) * (p[1] - gh.a[1]) - (gh.b[1] - gh.a[1]) * (p[0] - gh.a[0])) / Math.hypot(gh.b[0] - gh.a[0], gh.b[1] - gh.a[1]);
    // de A₁ al cruce de G₁H₁ con A₁D₁, el tramo que el hexágono tapa
    expect(lejos([297.48, 268.8]) * PT_MM).toBeCloseTo(0.36, 2);
    expect(lejos([297.48, 268.8])).toBeLessThan(tol);
    expect(paso.tramos.some((x) => junto(x.a, [297.48, 268.8]) && junto(x.b, [297.48, 314.54]))).toBe(false);
  });
});
