/**
 * Tema 12: torsión (`src/lib/erm/torsion.ts`).
 *
 * El segundo camino de cada número (CLAUDE.md §10):
 *  · la circular, por las ecs. 12.11 y 12.12 escritas aparte y por el
 *    equilibrio ∫τ·r dA = Mt integrado numéricamente;
 *  · la tabla α, β de la p. 10 contra la serie de Saint-Venant (otra fuente:
 *    la solución exacta del rectángulo, sumada aquí);
 *  · Bredt contra el tubo circular hueco de pared delgada, y la abierta
 *    contra el rectángulo muy alargado de la tabla y contra 3Mt/(s·t²);
 *  · el centro de torsión de la U integrando el flujo de las alas con
 *    `flexion.ts` (ecs. 12.30-12.31 sin la 12.33);
 *  · la flexión-torsión: σ por `flexion.ts` (Navier) y τmax por el radio del
 *    círculo de Mohr;
 *  · el eje: fórmulas cerradas a mano (ménsula, biempotrado, reparto por
 *    rigideces k = GIp/L) y, en el hiperestático con par repartido, el
 *    teorema de Menabrea (∂U/∂R = 0, tema 13) en vez de la compatibilidad.
 */
import { describe, expect, it } from 'vitest';
import { integra } from '../../../src/lib/erm/elastica';
import { flujoCortante, tensionNormal } from '../../../src/lib/erm/flexion';
import { circular, propiedades, type Seccion } from '../../../src/lib/erm/secciones';
import {
  centroTorsionU,
  coeficientesRectangular,
  diametroFlexionTorsion,
  flexionTorsion,
  inerciaPolar,
  resuelveEje,
  TABLA_RECTANGULAR,
  torsionAbierta,
  torsionCerrada,
  torsionCircular,
  torsionRectangular,
  tramosCirculares,
  type Eje,
} from '../../../src/lib/erm/torsion';

describe('sección circular (ecs. 12.10-12.12, p. 7)', () => {
  it('maciza: τmax = 16Mt/πD³ y el equilibrio ∫τ·r dA = Mt', () => {
    const Mt = 1200;
    const D = 0.05;
    const c = torsionCircular(Mt, D);
    expect(c.Ip).toBeCloseTo((Math.PI * D ** 4) / 32, 15);
    expect(c.tauMax).toBeCloseTo((16 * Mt) / (Math.PI * D ** 3), 6);
    expect(c.tauMin).toBe(0);
    expect(c.Wt).toBeCloseTo((Math.PI * D ** 3) / 16, 15);
    /* ∫ τ(r)·r·2πr dr de 0 a R */
    const momento = integra((r) => c.tau(r) * r * 2 * Math.PI * r, 0, D / 2, []);
    expect(momento).toBeCloseTo(Mt, 9);
  });

  it('hueca: la ec. 12.12, τmin = τmax·d/D y el equilibrio', () => {
    const Mt = -800;
    const D = 0.1;
    const d = 0.08;
    const c = torsionCircular(Mt, D, d);
    expect(c.tauMax).toBeCloseTo((16 * Mt) / (Math.PI * D ** 3 * (1 - d ** 4 / D ** 4)), 6);
    expect(c.tauMin).toBeCloseTo((c.tauMax * d) / D, 9);
    const momento = integra((r) => c.tau(r) * r * 2 * Math.PI * r, d / 2, D / 2, []);
    expect(momento).toBeCloseTo(Mt, 9);
    /* Ip es el momento polar de `secciones.ts`: Iz + Iy del mismo tubo */
    const p = propiedades(circular(D, d));
    expect(c.Ip).toBeCloseTo(p.Iz + p.Iy, 15);
  });

  it('rechaza diámetros imposibles y radios fuera de la sección', () => {
    expect(() => inerciaPolar(0)).toThrow();
    expect(() => inerciaPolar(1, 1)).toThrow();
    expect(() => inerciaPolar(1, -0.1)).toThrow();
    expect(() => torsionCircular(1, 1, 0.5).tau(0.1)).toThrow(/fuera/);
    expect(() => torsionCircular(1, 1).tau(0.6)).toThrow(/fuera/);
  });
});

/** La solución de Saint-Venant del rectángulo h ≥ b: β = k1 y α = k1/k. */
function saintVenant(hb: number): { alfa: number; beta: number } {
  let s1 = 0;
  let s2 = 0;
  for (let n = 1; n < 400; n += 2) {
    const a = (n * Math.PI * hb) / 2;
    s1 += Math.tanh(a) / n ** 5;
    s2 += a > 700 ? 0 : 1 / (n * n * Math.cosh(a));
  }
  const beta = (1 / 3) * (1 - ((192 / Math.PI ** 5) * s1) / hb);
  const k = 1 - (8 / Math.PI ** 2) * s2;
  return { alfa: beta / k, beta };
}

describe('sección rectangular: la tabla de la p. 10', () => {
  it('cada columna de la tabla coincide con la serie de Saint-Venant (a tres decimales)', () => {
    TABLA_RECTANGULAR.hb.forEach((hb, k) => {
      const sv = hb === Infinity ? { alfa: 1 / 3, beta: 1 / 3 } : saintVenant(hb);
      expect(Math.abs(TABLA_RECTANGULAR.alfa[k] - sv.alfa), `α en h/b = ${hb}`).toBeLessThan(0.0015);
      expect(Math.abs(TABLA_RECTANGULAR.beta[k] - sv.beta), `β en h/b = ${hb}`).toBeLessThan(0.0015);
    });
  });

  it('lee la tabla con los lados en cualquier orden', () => {
    const a = coeficientesRectangular(0.04, 0.02);
    const b = coeficientesRectangular(0.02, 0.04);
    expect(a).toEqual(b);
    expect(a).toEqual({ hb: 2, alfa: 0.246, beta: 0.229, deTabla: true });
    expect(coeficientesRectangular(1, 1)).toEqual({ hb: 1, alfa: 0.208, beta: 0.141, deTabla: true });
  });

  it('interpola entre columnas, y por encima de 10 en b/h hasta 1/3', () => {
    const c = coeficientesRectangular(1.25, 1);
    expect(c.deTabla).toBe(false);
    expect(c.alfa).toBeCloseTo((0.208 + 0.231) / 2, 12);
    expect(c.beta).toBeCloseTo((0.141 + 0.196) / 2, 12);
    const m = coeficientesRectangular(20, 1);
    expect(m.alfa).toBeCloseTo((0.313 + 0.333) / 2, 12);
    expect(m.beta).toBeCloseTo((0.313 + 0.333) / 2, 12);
    const muy = coeficientesRectangular(1e6, 1);
    expect(muy.alfa).toBeCloseTo(0.333, 5);
    /* entre columnas, cerca de la serie */
    for (const hb of [1.2, 2.2, 3.5, 5, 7]) {
      const sv = saintVenant(hb);
      const t = coeficientesRectangular(hb, 1);
      expect(Math.abs(t.alfa - sv.alfa)).toBeLessThan(0.006);
      expect(Math.abs(t.beta - sv.beta)).toBeLessThan(0.006);
    }
  });

  it('τmax = Mt/(α·h·b²) e It = β·h·b³ con h el lado mayor', () => {
    const r = torsionRectangular(500, 0.02, 0.06);
    expect(r.h).toBe(0.06);
    expect(r.b).toBe(0.02);
    expect(r.alfa).toBe(0.267);
    expect(r.tauMax).toBeCloseTo(500 / (0.267 * 0.06 * 0.02 ** 2), 6);
    expect(r.It).toBeCloseTo(0.263 * 0.06 * 0.02 ** 3, 15);
    expect(() => coeficientesRectangular(0, 1)).toThrow();
  });
});

describe('pequeño espesor (pp. 10-14)', () => {
  it('abierta: It = ⅓Σt³s, la τ en el trozo más grueso y 3Mt/(s·t²) con t constante', () => {
    const Mt = 30;
    const I = torsionAbierta(Mt, [
      { s: 0.1, t: 0.008 },
      { s: 0.2, t: 0.005 },
      { s: 0.1, t: 0.008 },
    ]);
    expect(I.It).toBeCloseTo((2 * 0.1 * 0.008 ** 3 + 0.2 * 0.005 ** 3) / 3, 18);
    expect(I.tMax).toBe(0.008);
    expect(I.tauMax).toBeCloseTo((Mt * 0.008) / I.It, 3);
    expect(I.tau(0.005)).toBeCloseTo((I.tauMax * 0.005) / 0.008, 3);
    const una = torsionAbierta(Mt, [{ s: 0.3, t: 0.004 }]);
    expect(una.tauMax).toBeCloseTo((3 * Mt) / (0.3 * 0.004 ** 2), 3);
  });

  it('abierta: un rectángulo muy alargado da lo mismo que la tabla (h/b → ∞)', () => {
    const s = 1;
    const t = 0.001;
    const a = torsionAbierta(1, [{ s, t }]);
    const r = torsionRectangular(1, s, t);
    /* la tabla redondea 1/3 a 0,333: un 0,1 % */
    expect(Math.abs(r.It / a.It - 1)).toBeLessThan(0.002);
    expect(Math.abs(r.tauMax / a.tauMax - 1)).toBeLessThan(0.002);
  });

  it('cerrada (Bredt): el tubo circular delgado es el tubo de la ec. 12.12', () => {
    const R = 0.1;
    const t = 0.002;
    const Mt = 400;
    const b = torsionCerrada(Mt, Math.PI * R * R, [{ s: 2 * Math.PI * R, t }]);
    const c = torsionCircular(Mt, 2 * R + t, 2 * R - t);
    /* It = 2πR³t y el Ip exacto es 2πR³t + πRt³/2: difieren en t²/4R² */
    expect(b.It).toBeCloseTo(2 * Math.PI * R ** 3 * t, 15);
    expect(c.Ip / b.It - 1).toBeCloseTo(t ** 2 / (4 * R * R), 12);
    expect(Math.abs(b.tauMax / ((Mt * R) / c.Ip) - 1)).toBeLessThan(0.001);
    expect(b.q).toBeCloseTo(Mt / (2 * Math.PI * R * R), 9);
  });

  it('cerrada: cajón de dos espesores, la τ máxima en el más delgado', () => {
    const b0 = 0.2;
    const h0 = 0.1;
    const Mt = 1000;
    const c = torsionCerrada(Mt, b0 * h0, [
      { s: b0, t: 0.004 },
      { s: h0, t: 0.006 },
      { s: b0, t: 0.004 },
      { s: h0, t: 0.006 },
    ]);
    expect(c.It).toBeCloseTo((4 * (b0 * h0) ** 2) / ((2 * b0) / 0.004 + (2 * h0) / 0.006), 15);
    expect(c.tMin).toBe(0.004);
    expect(c.tauMax).toBeCloseTo(Mt / (2 * b0 * h0 * 0.004), 6);
    expect(c.tau(0.006)).toBeCloseTo(Mt / (2 * b0 * h0 * 0.006), 6);
    expect(c.Wt).toBeCloseTo(2 * b0 * h0 * 0.004, 15);
    expect(() => torsionCerrada(1, 0, [{ s: 1, t: 1 }])).toThrow();
    expect(() => torsionCerrada(1, 1, [])).toThrow();
    expect(() => torsionAbierta(1, [{ s: 1, t: 0 }])).toThrow();
  });
});

describe('centro de torsión de la U (fig. 12.11, ec. 12.33, p. 15)', () => {
  it('OC = b0²h0²t1/4Iz, y lo mismo integrando el flujo de un ala con flexion.ts', () => {
    const b0 = 0.06;
    const h0 = 0.12;
    const t = 0.004;
    /* línea media del alma en z = 0; las alas hacia +z; y hacia abajo */
    const U: Seccion = [
      { tipo: 'rectangulo', y0: -h0 / 2 - t / 2, y1: h0 / 2 + t / 2, z0: -t / 2, z1: t / 2 },
      { tipo: 'rectangulo', y0: -h0 / 2 - t / 2, y1: -h0 / 2 + t / 2, z0: t / 2, z1: b0 },
      { tipo: 'rectangulo', y0: h0 / 2 - t / 2, y1: h0 / 2 + t / 2, z0: t / 2, z1: b0 },
    ];
    const p = propiedades(U);
    expect(p.yG).toBeCloseTo(0, 15);
    const T = 1;
    /* flujo del ala de arriba en el corte z = zc (Ac, lo que queda hacia la punta) */
    const q = (zc: number) => flujoCortante(U, { Ty: T }, { yMax: -h0 / 2 + t / 2, zMin: zc });
    const F1 = integra(q, 0, b0, []);
    const OC = Math.abs(F1 * h0) / T;
    expect(OC).toBeCloseTo(centroTorsionU(b0, h0, t, p.Iz), 12);
    expect(() => centroTorsionU(0, 1, 1, 1)).toThrow();
  });
});

describe('flexión-torsión de ejes circulares (pp. 16-17)', () => {
  it('σ por Navier, τmax por el radio del círculo de Mohr y el D de la ec. 12.36', () => {
    const M = 900;
    const Mt = 1200;
    const D = 0.04;
    const f = flexionTorsion(M, Mt, D);
    const sigmaNavier = tensionNormal(propiedades(circular(D)), { Mz: M }, [D / 2, 0]);
    expect(f.sigma).toBeCloseTo(sigmaNavier, 3);
    expect(f.tau).toBeCloseTo(torsionCircular(Mt, D).tauMax, 6);
    expect(f.tauMax).toBeCloseTo(Math.sqrt((f.sigma / 2) ** 2 + f.tau ** 2), 6);
    const tauAdm = 80e6;
    const Dn = diametroFlexionTorsion(M, Mt, tauAdm);
    expect(flexionTorsion(M, Mt, Dn).tauMax).toBeCloseTo(tauAdm, 3);
    expect(() => diametroFlexionTorsion(1, 1, 0)).toThrow();
    expect(() => flexionTorsion(1, 1, 0)).toThrow();
  });
});

describe('el eje (ecs. 12.13-12.14, p. 8)', () => {
  const GJ = 50;

  it('ménsula empotrada en 0 con un par T en L: Mt = T, φ(L) = TL/GJ', () => {
    const T = 6;
    const L = 2;
    const s = resuelveEje({ L, tramos: [{ x0: 0, x1: L, GIt: GJ }], empotramientos: [{ x: 0 }], cargas: [{ tipo: 'par', x: L, T }] });
    expect(s.R[0]).toBeCloseTo(-T, 12);
    expect(s.Mt(0.3)).toBeCloseTo(T, 12);
    expect(s.Mt(L, 'izq')).toBeCloseTo(T, 12);
    expect(s.Mt(L, 'der')).toBeCloseTo(0, 12);
    expect(s.phi(0)).toBeCloseTo(0, 12);
    expect(s.phi(L)).toBeCloseTo((T * L) / GJ, 12);
  });

  it('ménsula empotrada en L con el par en 0: Mt = −T y el extremo libre gira +TL/GJ', () => {
    const T = 6;
    const L = 2;
    const s = resuelveEje({ L, tramos: [{ x0: 0, x1: L, GIt: GJ }], empotramientos: [{ x: L }], cargas: [{ tipo: 'par', x: 0, T }] });
    expect(s.Mt(1)).toBeCloseTo(-T, 12);
    expect(s.phi(0)).toBeCloseTo((T * L) / GJ, 12);
    expect(s.phi(L)).toBeCloseTo(0, 12);
  });

  it('escalonado: φ(L) = T(L1/GJ1 + L2/GJ2) y τ en cada tramo con su Wt', () => {
    const G = 80e9;
    const tramos = tramosCirculares(G, [
      { x0: 0, x1: 0.5, D: 0.04 },
      { x0: 0.5, x1: 1.2, D: 0.03 },
    ]);
    const T = 300;
    const s = resuelveEje({ L: 1.2, tramos, empotramientos: [{ x: 0 }], cargas: [{ tipo: 'par', x: 1.2, T }] });
    const J1 = (Math.PI * 0.04 ** 4) / 32;
    const J2 = (Math.PI * 0.03 ** 4) / 32;
    expect(s.phi(1.2)).toBeCloseTo(T * (0.5 / (G * J1) + 0.7 / (G * J2)), 12);
    expect(s.tauMax(0.2)).toBeCloseTo((16 * T) / (Math.PI * 0.04 ** 3), 3);
    expect(s.tauMax(0.5, 'der')).toBeCloseTo((16 * T) / (Math.PI * 0.03 ** 3), 3);
    expect(s.tauMax(0.5, 'izq')).toBeCloseTo((16 * T) / (Math.PI * 0.04 ** 3), 3);
  });

  it('biempotrado con T en a: reacciones −Tb/L y −Ta/L, φ(a) = Tab/(L·GJ)', () => {
    const L = 3;
    const a = 1;
    const b = L - a;
    const T = 9;
    const s = resuelveEje({ L, tramos: [{ x0: 0, x1: L, GIt: GJ }], empotramientos: [{ x: 0 }, { x: L }], cargas: [{ tipo: 'par', x: a, T }] });
    expect(s.R[0]).toBeCloseTo((-T * b) / L, 12);
    expect(s.R[1]).toBeCloseTo((-T * a) / L, 12);
    expect(s.Mt(0.5)).toBeCloseTo((T * b) / L, 12);
    expect(s.Mt(2)).toBeCloseTo((-T * a) / L, 12);
    expect(s.phi(a)).toBeCloseTo((T * a * b) / (L * GJ), 12);
    expect(s.phi(L)).toBeCloseTo(0, 12);
  });

  it('biempotrado escalonado: el par se reparte según las rigideces k = GJ/L', () => {
    const tramos = [
      { x0: 0, x1: 2, GIt: 40, Wt: 1 },
      { x0: 2, x1: 3, GIt: 10, Wt: 0.5 },
    ];
    const T = 12;
    const s = resuelveEje({ L: 3, tramos, empotramientos: [{ x: 0 }, { x: 3 }], cargas: [{ tipo: 'par', x: 2, T }] });
    const k1 = 40 / 2;
    const k2 = 10 / 1;
    expect(s.Mt(1)).toBeCloseTo((T * k1) / (k1 + k2), 12);
    expect(s.Mt(2.5)).toBeCloseTo((-T * k2) / (k1 + k2), 12);
    expect(s.phi(2)).toBeCloseTo(T / (k1 + k2), 12);
    expect(s.tauMax(2.5)).toBeCloseTo((T * k2) / (k1 + k2) / 0.5, 12);
  });

  it('par repartido uniforme: ménsula φ(L) = mL²/2GJ; biempotrado R = −mL/2 y φ(L/2) = mL²/8GJ', () => {
    const m = 4;
    const L = 2;
    const men = resuelveEje({ L, tramos: [{ x0: 0, x1: L, GIt: GJ }], empotramientos: [{ x: 0 }], cargas: [{ tipo: 'repartido', x1: 0, x2: L, m1: m }] });
    expect(men.Mt(0.5)).toBeCloseTo(m * (L - 0.5), 12);
    expect(men.phi(L)).toBeCloseTo((m * L * L) / (2 * GJ), 12);
    const bi = resuelveEje({ L, tramos: [{ x0: 0, x1: L, GIt: GJ }], empotramientos: [{ x: 0 }, { x: L }], cargas: [{ tipo: 'repartido', x1: 0, x2: L, m1: m }] });
    expect(bi.R[0]).toBeCloseTo((-m * L) / 2, 12);
    expect(bi.R[1]).toBeCloseTo((-m * L) / 2, 12);
    expect(bi.phi(L / 2)).toBeCloseTo((m * L * L) / (8 * GJ), 12);
  });

  it('par repartido triangular en un biempotrado escalonado: lo mismo por Menabrea (∂U/∂R = 0)', () => {
    const L = 4;
    const tramos = [
      { x0: 0, x1: 1.5, GIt: 30 },
      { x0: 1.5, x1: L, GIt: 70 },
    ];
    const carga = { tipo: 'repartido' as const, x1: 1, x2: L, m1: 0, m2: 5 };
    const s = resuelveEje({ L, tramos, empotramientos: [{ x: 0 }, { x: L }], cargas: [carga] });
    /* Menabrea: quitando el empotramiento de L, Mt(x) = RB + pares de la carga a la derecha de x */
    const mEn = (u: number) => (5 * (u - 1)) / 3;
    const derecha = (x: number) => {
      const a = Math.max(x, 1);
      return a >= L ? 0 : ((mEn(a) + 5) / 2) * (L - a);
    };
    const GIt = (x: number) => (x < 1.5 ? 30 : 70);
    /* U(RB) = ∫(RB + d(x))²/2GIt; dU/dRB = ∫(RB + d)/GIt = 0 */
    const c0 = integra((x) => 1 / GIt(x), 0, L, [1, 1.5]);
    const c1 = integra((x) => derecha(x) / GIt(x), 0, L, [1, 1.5]);
    const RB = -c1 / c0;
    expect(s.R[1]).toBeCloseTo(RB, 10);
    expect(s.R[0] + s.R[1]).toBeCloseTo(-((0 + 5) / 2) * 3, 10);
    expect(s.Mt(2)).toBeCloseTo(RB + derecha(2), 10);
  });

  it('giro impuesto en un empotramiento, sin cargas: Mt = GJ·φB/L', () => {
    const L = 2;
    const s = resuelveEje({ L, tramos: [{ x0: 0, x1: L, GIt: GJ }], empotramientos: [{ x: 0 }, { x: L, giro: 0.01 }], cargas: [] });
    expect(s.Mt(1)).toBeCloseTo((GJ * 0.01) / L, 12);
    expect(s.phi(1)).toBeCloseTo(0.005, 12);
  });

  it('rechaza un eje sin empotramientos, tramos que no cubren el eje y cargas fuera', () => {
    const base: Eje = { L: 2, tramos: [{ x0: 0, x1: 2, GIt: 1 }], empotramientos: [], cargas: [{ tipo: 'par', x: 1, T: 1 }] };
    expect(() => resuelveEje(base)).toThrow(/mecanismo/);
    expect(() => resuelveEje({ ...base, empotramientos: [{ x: 0 }, { x: 0 }] })).toThrow(/única/);
    expect(() => resuelveEje({ ...base, empotramientos: [{ x: 0 }], tramos: [{ x0: 0, x1: 1, GIt: 1 }] })).toThrow(/cubrir/);
    expect(() =>
      resuelveEje({ ...base, empotramientos: [{ x: 0 }], tramos: [{ x0: 0, x1: 1, GIt: 1 }, { x0: 1.5, x1: 2, GIt: 1 }] }),
    ).toThrow(/contiguos/);
    expect(() => resuelveEje({ ...base, empotramientos: [{ x: 3 }] })).toThrow(/fuera/);
    expect(() => resuelveEje({ ...base, empotramientos: [{ x: 0 }], cargas: [{ tipo: 'par', x: 5, T: 1 }] })).toThrow(/fuera/);
    expect(() => resuelveEje({ ...base, empotramientos: [{ x: 0 }] }).tauMax(1)).toThrow(/Wt/);
  });
});
