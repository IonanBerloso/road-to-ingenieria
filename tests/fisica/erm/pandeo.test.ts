/**
 * Tema 14: pandeo (`src/lib/erm/pandeo.ts`).
 *
 * El segundo camino de cada número (CLAUDE.md §10):
 *  · las longitudes de pandeo de la p. 7, contra el primer autovalor de
 *    EI·v'''' + P·v'' = 0 con las condiciones de cada enlace, buscado aquí
 *    como el primer cero del determinante (otra ecuación: la de cuarto orden,
 *    no la fórmula de Euler); la empotrada-articulada da 0,6992, que la
 *    tabla redondea a 0,7;
 *  · la secante (ecs. 14.17-14.20) contra la integración numérica (RK4) de
 *    la ec. 14.14 por tiro, y M = −P(e + δ) en el empotramiento (ec. 14.13);
 *  · λ0 como la esbeltez donde σcrit = σe;
 *  · el factor de amplificación pedido, comprobado hacia atrás.
 */
import { describe, expect, it } from 'vitest';
import { tensionNormal } from '../../../src/lib/erm/flexion';
import {
  cargaCritica,
  compresionExcentrica,
  compresionExcentricaBiaxial,
  esbeltez,
  esbeltezLimite,
  FACTOR_LONGITUD_PANDEO,
  inerciaParaFactor,
  longitudPandeo,
  pandeo,
  tensionCritica,
  type Enlace,
} from '../../../src/lib/erm/pandeo';
import { propiedades, rectanguloMacizo } from '../../../src/lib/erm/secciones';

/** Determinante 4×4 por eliminación con pivote. */
function det(M: number[][]): number {
  const A = M.map((f) => [...f]);
  let d = 1;
  for (let c = 0; c < 4; c++) {
    let p = c;
    for (let r = c + 1; r < 4; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    if (A[p][c] === 0) return 0;
    if (p !== c) {
      [A[p], A[c]] = [A[c], A[p]];
      d = -d;
    }
    d *= A[c][c];
    for (let r = c + 1; r < 4; r++) {
      const f = A[r][c] / A[c][c];
      for (let k = c; k < 4; k++) A[r][k] -= f * A[c][k];
    }
  }
  return d;
}

/** v = C1 + C2·x + C3·sen kx + C4·cos kx y sus derivadas, en x. */
const fila = (k: number, x: number, n: number): number[] => {
  const s = Math.sin(k * x);
  const c = Math.cos(k * x);
  if (n === 0) return [1, x, s, c];
  if (n === 1) return [0, 1, k * c, -k * s];
  if (n === 2) return [0, 0, -k * k * s, -k * k * c];
  return [0, 0, -(k ** 3) * c, k ** 3 * s];
};

/** Primer k > 0 en el que las condiciones de los dos extremos admiten v ≠ 0. */
function primerAutovalor(enlace: Enlace, L: number): number {
  const cond = (k: number): number[][] => {
    const v = (x: number, n: number) => fila(k, x, n);
    const suma = (a: number[], b: number[], f: number) => a.map((y, i) => y + f * b[i]);
    switch (enlace) {
      case 'articulada-articulada':
        return [v(0, 0), v(0, 2), v(L, 0), v(L, 2)];
      case 'empotrada-libre':
        /* libre: M = 0 y EI·v''' + P·v' = 0 */
        return [v(0, 0), v(0, 1), v(L, 2), suma(v(L, 3), v(L, 1), k * k)];
      case 'empotrada-empotrada':
        return [v(0, 0), v(0, 1), v(L, 0), v(L, 1)];
      default:
        return [v(0, 0), v(0, 1), v(L, 0), v(L, 2)];
    }
  };
  const f = (k: number) => det(cond(k));
  let k0 = 0.05 / L;
  let f0 = f(k0);
  for (let k1 = k0 + 0.001 / L; k1 < 20 / L; k1 += 0.001 / L) {
    const f1 = f(k1);
    if (f0 * f1 <= 0) {
      let a = k0;
      let b = k1;
      for (let it = 0; it < 80; it++) {
        const m = (a + b) / 2;
        if (f(a) * f(m) <= 0) b = m;
        else a = m;
      }
      return (a + b) / 2;
    }
    k0 = k1;
    f0 = f1;
  }
  throw new Error('sin autovalor');
}

describe('carga crítica y longitud de pandeo (pp. 6-7)', () => {
  it('cada Lp de la p. 7 es la del primer autovalor de la ecuación de cuarto orden', () => {
    const L = 3;
    for (const e of Object.keys(FACTOR_LONGITUD_PANDEO) as Enlace[]) {
      const k = primerAutovalor(e, L);
      /* P = k²·EI = π²EI/Lp² → Lp = π/k */
      const Lp = Math.PI / k;
      const tol = e === 'empotrada-articulada' ? 0.002 : 1e-6;
      expect(Math.abs(Lp / L - FACTOR_LONGITUD_PANDEO[e]), e).toBeLessThan(tol);
    }
  });

  it('Pcrit = π²EImin/Lp² y manda el plano de menor Pcrit', () => {
    const E = 200e9;
    const L = 2;
    expect(cargaCritica(E, 1e-6, longitudPandeo(L, 'empotrada-libre'))).toBeCloseTo((Math.PI ** 2 * E * 1e-6) / 16, 3);
    const p = pandeo({
      E,
      A: 1e-3,
      L,
      planos: [
        { I: 4e-6, enlace: 'articulada-articulada' },
        { I: 2e-6, enlace: 'empotrada-empotrada' },
      ],
    });
    /* plano 1: π²E·2e-6/1 > plano 0: π²E·4e-6/4 */
    expect(p.plano).toBe(0);
    expect(p.Pcrit).toBeCloseTo((Math.PI ** 2 * E * 4e-6) / 4, 3);
    expect(p.i).toBeCloseTo(Math.sqrt(4e-6 / 1e-3), 12);
    expect(p.sigmaCrit).toBeCloseTo(tensionCritica(E, p.lambda), 3);
  });

  it('esbeltez límite λ0 = π√(E/σe): σcrit(λ0) = σe; esbelta y corta', () => {
    const E = 210e9;
    const se = 235e6;
    const l0 = esbeltezLimite(E, se);
    expect(l0).toBeCloseTo(93.91, 2);
    expect(tensionCritica(E, l0)).toBeCloseTo(se, 3);
    const larga = pandeo({ E, A: 1e-3, L: 4, planos: [{ I: 1e-7, enlace: 'articulada-articulada' }], sigmaE: se });
    expect(larga.lambda).toBeCloseTo(esbeltez(4, Math.sqrt(1e-7 / 1e-3)), 12);
    expect(larga.tipo).toBe('esbelta');
    expect(larga.cargaAgotamiento).toBe(larga.Pcrit);
    const corta = pandeo({ E, A: 1e-3, L: 0.3, planos: [{ I: 1e-7, Lp: 0.3 }], sigmaE: se });
    expect(corta.tipo).toBe('corta');
    expect(corta.cargaAgotamiento).toBeCloseTo(se * 1e-3, 6);
  });

  it('rechaza datos imposibles', () => {
    expect(() => longitudPandeo(0, 'empotrada-libre')).toThrow();
    expect(() => longitudPandeo(1, 'libre-libre' as Enlace)).toThrow(/desconocido/);
    expect(() => cargaCritica(1, 0, 1)).toThrow();
    expect(() => esbeltez(1, 0)).toThrow();
    expect(() => tensionCritica(1, 0)).toThrow();
    expect(() => esbeltezLimite(1, 0)).toThrow();
    expect(() => pandeo({ E: 1, A: 1, L: 1, planos: [] })).toThrow(/plano/);
    expect(() => pandeo({ E: 1, A: 1, L: 1, planos: [{ I: 1 }] })).toThrow(/enlace/);
    expect(() => pandeo({ E: 1, A: 0, L: 1, planos: [{ I: 1, Lp: 1 }] })).toThrow();
    /* L se valida aunque venga Lp, y Lp con enlace a la vez es ambiguo */
    expect(() => pandeo({ E: 1, A: 1, L: 0, planos: [{ I: 1, Lp: 1 }] })).toThrow(/longitud/);
    expect(() => pandeo({ E: 1, A: 1, L: 2, planos: [{ I: 1, Lp: 1, enlace: 'empotrada-libre' }] })).toThrow(/a la vez/);
  });
});

/** RK4 de v'' = α²(e + δ − v) desde v(0) = v'(0) = 0; devuelve v(L). */
function tiro(alfa: number, e: number, delta: number, L: number): number {
  const n = 2000;
  const h = L / n;
  let v = 0;
  let w = 0;
  const f = (vv: number) => alfa * alfa * (e + delta - vv);
  for (let k = 0; k < n; k++) {
    const k1v = w;
    const k1w = f(v);
    const k2v = w + (h / 2) * k1w;
    const k2w = f(v + (h / 2) * k1v);
    const k3v = w + (h / 2) * k2w;
    const k3w = f(v + (h / 2) * k2v);
    const k4v = w + h * k3w;
    const k4w = f(v + h * k3v);
    v += (h / 6) * (k1v + 2 * k2v + 2 * k3v + k4v);
    w += (h / 6) * (k1w + 2 * k2w + 2 * k3w + k4w);
  }
  return v;
}

describe('compresión excéntrica (pp. 9-11)', () => {
  const E = 150e9;
  const I = 2e-6;
  const L = 3;
  const P = 40e3;
  const e = 0.02;

  it('δ por la ec. 14.17 y por tiro numérico de la ec. 14.14; M = −P(e + δ) = −Pe·sec(αL)', () => {
    const c = compresionExcentrica(P, e, E, I, L);
    /* v(L) es lineal en δ: dos tiros dan el δ con v(L) = δ */
    const g = (d: number) => tiro(c.alfa, e, d, L) - d;
    const d0 = 0;
    const d1 = 0.01;
    const delta = d0 - (g(d0) * (d1 - d0)) / (g(d1) - g(d0));
    expect(c.delta).toBeCloseTo(delta, 9);
    expect(c.Mmax).toBeCloseTo(-P * (e + c.delta), 6);
    expect(c.factor).toBeCloseTo(1 / Math.cos(Math.sqrt(P / (E * I)) * L), 12);
    expect(c.v(L)).toBeCloseTo(c.delta, 12);
    expect(c.v(0)).toBe(0);
  });

  it('αL → π/2 es la crítica de la empotrada-libre (ec. 14.21)', () => {
    const Pc = cargaCritica(E, I, longitudPandeo(L, 'empotrada-libre'));
    expect(compresionExcentrica(Pc * 0.999999, e, E, I, L).factor).toBeGreaterThan(1e5);
    expect(() => compresionExcentrica(Pc, e, E, I, L)).toThrow(/crítica/);
    expect(() => compresionExcentrica(-1, e, E, I, L)).toThrow();
  });

  it('biaxial: los Mz y My de la diapositiva 17 dan la tensión con flexion.ts', () => {
    const sec = rectanguloMacizo(0.06, 0.1);
    const p = propiedades(sec);
    const r = compresionExcentricaBiaxial(P, 0.01, 0.005, E, p.Iz, p.Iy, L);
    expect(r.N).toBe(-P);
    expect(r.Mz).toBeCloseTo(-P * 0.01 * compresionExcentrica(P, 1, E, p.Iz, L).factor, 9);
    expect(r.My).toBeCloseTo(-P * 0.005 * compresionExcentrica(P, 1, E, p.Iy, L).factor, 9);
    expect(r.factorY).toBeGreaterThan(r.factorZ);
    /* sin amplificación sería la excéntrica del tema 9: σ en la esquina más comprimida */
    const esquina: [number, number] = [p.yG + 0.05, p.zG + 0.03];
    const s = tensionNormal(p, r, esquina);
    const sin = tensionNormal(p, { N: -P, Mz: -P * 0.01, My: -P * 0.005 }, esquina);
    expect(s).toBeLessThan(sin);
  });

  it('el I con el que el factor de amplificación vale 2 (αL = π/3)', () => {
    const I2 = inerciaParaFactor(P, E, L, 2);
    expect(I2).toBeCloseTo((9 * P * L * L) / (Math.PI ** 2 * E), 15);
    expect(compresionExcentrica(P, e, E, I2, L).factor).toBeCloseTo(2, 12);
    expect(() => inerciaParaFactor(P, E, L, 1)).toThrow();
  });
});
