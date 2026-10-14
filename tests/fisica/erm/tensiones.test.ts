/**
 * Tema 2 de ERM: tensiones (`src/lib/erm/tensiones.ts` y `tensor.ts`).
 *
 * El segundo camino de cada número (CLAUDE.md §10):
 *  · las principales cumplen [σ]{n} = σ·{n} y conservan los tres invariantes
 *    de la ec. 2.36, que se calculan aparte;
 *  · en tensión plana, la fórmula del ángulo doble (ec. 2.61) se contrasta con
 *    el vector tensión 3D proyectado sobre n y t̂ (ecs. 2.14 y 2.58): dos
 *    códigos distintos;
 *  · el círculo de Mohr se contrasta con las principales 3D y con la regla de
 *    la p. 26 de los apuntes (par horario arriba);
 *  · los tres casos de la figura 2.15 con sus fórmulas impresas;
 *  · el plano inclinado de una barra (tema 8) por la fórmula cerrada y por el
 *    tensor.
 */
import { describe, expect, it } from 'vitest';
import { planoInclinado } from '../../../src/lib/erm/axial';
import {
  circulosMohr,
  componentesIntrinsecas,
  esfericaDesviadora,
  giroEjes,
  mohrPlano,
  normalPorAngulos,
  planoTension,
  principalesPlana,
  principalesTension,
  tauMax,
  tensorTensiones,
  vectorTension,
} from '../../../src/lib/erm/tensiones';
import { dot, giraTensor, invariantes, mulMV, unitario, type Mat3, type Vec3 } from '../../../src/lib/erm/tensor';

const general: Mat3 = tensorTensiones({ sx: 40, sy: -20, sz: 10, txy: 30, tyz: -15, tzx: 5 });

describe('vector tensión y componentes intrínsecas (ecs. 2.13-2.16)', () => {
  it('Sn sale componente a componente como en la ec. 2.13', () => {
    const n = normalPorAngulos(60, 60, null);
    const S = vectorTension(general, n);
    const [nx, ny, nz] = n;
    expect(S[0]).toBeCloseTo(40 * nx + 30 * ny + 5 * nz, 12);
    expect(S[1]).toBeCloseTo(30 * nx - 20 * ny - 15 * nz, 12);
    expect(S[2]).toBeCloseTo(5 * nx - 15 * ny + 10 * nz, 12);
  });

  it('σn² + τn² = |S|², y τn es la norma de S − σn·n', () => {
    const n = normalPorAngulos(45, 60, null);
    const { S, sigmaN, tauN } = componentesIntrinsecas(general, n);
    const resto: Vec3 = [S[0] - sigmaN * n[0], S[1] - sigmaN * n[1], S[2] - sigmaN * n[2]];
    expect(tauN).toBeCloseTo(Math.sqrt(dot(resto, resto)), 12);
    expect(sigmaN * sigmaN + tauN * tauN).toBeCloseTo(dot(S, S), 9);
  });

  it('normalPorAngulos: 45° y 60° dan (√2/2, 1/2, 1/2), y rechaza ángulos imposibles', () => {
    const n = normalPorAngulos(45, 60, null);
    expect(n[0]).toBeCloseTo(Math.SQRT1_2, 15);
    expect(n[1]).toBeCloseTo(0.5, 15);
    expect(n[2]).toBeCloseTo(0.5, 15);
    expect(() => normalPorAngulos(30, 30, null)).toThrow(/suman más de 1/);
  });

  it('exige una normal unitaria', () => {
    expect(() => componentesIntrinsecas(general, [1, 1, 0])).toThrow(/unitaria/);
  });
});

describe('tensiones y direcciones principales (ecs. 2.30-2.47)', () => {
  it('cada dirección cumple [σ]{n} = σ·{n}, y son ortonormales y ordenadas', () => {
    const { valores, direcciones } = principalesTension(general);
    expect(valores[0]).toBeGreaterThanOrEqual(valores[1]);
    expect(valores[1]).toBeGreaterThanOrEqual(valores[2]);
    for (let k = 0; k < 3; k++) {
      const Sn = mulMV(general, direcciones[k]);
      for (let i = 0; i < 3; i++) expect(Sn[i]).toBeCloseTo(valores[k] * direcciones[k][i], 9);
      expect(dot(direcciones[k], direcciones[k])).toBeCloseTo(1, 12);
    }
    expect(dot(direcciones[0], direcciones[1])).toBeCloseTo(0, 12);
    expect(dot(direcciones[0], direcciones[2])).toBeCloseTo(0, 12);
  });

  it('conservan los invariantes I1, I2, I3 (ec. 2.36)', () => {
    const { I1, I2, I3 } = invariantes(general);
    const [a, b, c] = principalesTension(general).valores;
    expect(a + b + c).toBeCloseTo(I1, 9);
    expect(a * b + b * c + c * a).toBeCloseTo(I2, 7);
    expect(a * b * c).toBeCloseTo(I3, 5);
  });

  it('con dos valores iguales también da un triedro ortonormal', () => {
    const c = Math.cos(0.4);
    const s = Math.sin(0.4);
    const R: Mat3 = [
      [c, s, 0],
      [-s, c, 0],
      [0, 0, 1],
    ];
    const T = giraTensor(
      [
        [2, 0, 0],
        [0, 5, 0],
        [0, 0, 2],
      ],
      R,
    );
    const { valores, direcciones } = principalesTension(T);
    expect(valores[0]).toBeCloseTo(5, 12);
    expect(valores[1]).toBeCloseTo(2, 12);
    expect(valores[2]).toBeCloseTo(2, 12);
    expect(Math.abs(dot(direcciones[1], direcciones[2]))).toBeLessThan(1e-12);
  });

  it('las tres direcciones forman un triedro directo (determinante +1)', () => {
    const [a, b, c] = principalesTension(general).direcciones;
    const det = a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0]);
    expect(det).toBeCloseTo(1, 12);
  });

  it('un tensor no simétrico no es un tensor de tensiones (ec. 2.8)', () => {
    expect(() =>
      principalesTension([
        [1, 2, 0],
        [0, 1, 0],
        [0, 0, 1],
      ]),
    ).toThrow(/simétrico/);
  });

  it('τmax es el radio del círculo mayor, (σ1 − σ3)/2', () => {
    const [a, , c] = principalesTension(general).valores;
    expect(tauMax(general)).toBeCloseTo((a - c) / 2, 12);
  });

  it('la desviadora tiene traza nula y la esférica es I1/3 (ecs. 2.51-2.54)', () => {
    const { sigmaE, desviador } = esfericaDesviadora(general);
    expect(sigmaE).toBeCloseTo(10, 12);
    expect(desviador[0][0] + desviador[1][1] + desviador[2][2]).toBeCloseTo(0, 12);
    expect(desviador[0][1]).toBe(30);
  });
});

describe('tensión plana (ecs. 2.55-2.64)', () => {
  const p = { sx: 80, sy: -40, txy: 30 };

  it('la ec. 2.61 da lo mismo que proyectar el vector tensión sobre n y t̂', () => {
    const T = tensorTensiones({ sx: p.sx, sy: p.sy, sz: 0, txy: p.txy });
    for (const grados of [0, 17, 45, 90, 123, 170]) {
      const t = (grados * Math.PI) / 180;
      const n: Vec3 = [Math.cos(t), Math.sin(t), 0];
      const tg: Vec3 = [-Math.sin(t), Math.cos(t), 0];
      const S = vectorTension(T, n);
      const r = planoTension(p, t);
      expect(r.sigmaN).toBeCloseTo(dot(S, n), 10);
      expect(r.tauN).toBeCloseTo(dot(S, tg), 10);
    }
  });

  it('[R][σ][R]ᵗ (ec. 2.27) con R girando θ en z da lo mismo que el giro plano', () => {
    const t = 0.6;
    const R: Mat3 = [
      [Math.cos(t), Math.sin(t), 0],
      [-Math.sin(t), Math.cos(t), 0],
      [0, 0, 1],
    ];
    const g3 = giraTensor(tensorTensiones({ sx: p.sx, sy: p.sy, sz: 0, txy: p.txy }), R);
    const g2 = giroEjes(p, t);
    expect(g3[0][0]).toBeCloseTo(g2.sx, 10);
    expect(g3[1][1]).toBeCloseTo(g2.sy, 10);
    expect(g3[0][1]).toBeCloseTo(g2.txy, 10);
  });

  it('unitario normaliza y no acepta el vector nulo', () => {
    const u = unitario([3, 4, 0]);
    expect(u[0]).toBeCloseTo(0.6, 15);
    expect(u[1]).toBeCloseTo(0.8, 15);
    expect(() => unitario([0, 0, 0])).toThrow(/nulo/);
  });

  it('el giro de ejes conserva σx + σy y σxσy − τ², y en θ1 deja τ = 0 con σx\' = σ1', () => {
    const g = giroEjes(p, 0.7);
    expect(g.sx + g.sy).toBeCloseTo(p.sx + p.sy, 10);
    expect(g.sx * g.sy - g.txy ** 2).toBeCloseTo(p.sx * p.sy - p.txy ** 2, 8);
    const m = mohrPlano(p);
    const en1 = giroEjes(p, m.theta1);
    expect(en1.txy).toBeCloseTo(0, 10);
    expect(en1.sx).toBeCloseTo(m.sigma1, 10);
  });

  it('el círculo da las mismas principales que el tensor 3D', () => {
    const m = mohrPlano(p);
    const v = principalesTension(tensorTensiones({ sx: p.sx, sy: p.sy, sz: 0, txy: p.txy })).valores;
    expect(m.sigma1).toBeCloseTo(v[0], 10);
    expect(m.sigma2).toBeCloseTo(v[2], 10);
    expect(m.centro).toBeCloseTo(20, 12);
    expect(m.radio).toBeCloseTo(Math.hypot(60, 30), 12);
  });

  it('con τxy > 0 el eje x va abajo y el y arriba (p. 26, figura 2.12)', () => {
    const m = mohrPlano(p);
    expect(m.puntoX[1]).toBeLessThan(0);
    expect(m.puntoY[1]).toBeGreaterThan(0);
  });

  it('en ese dibujo, girar la dirección θ antihorario gira el punto 2θ antihorario', () => {
    const m = mohrPlano(p);
    for (const grados of [10, 35, 80, 140]) {
      const t = (grados * Math.PI) / 180;
      const r = planoTension(p, t);
      const x0 = m.puntoX[0] - m.centro;
      const y0 = m.puntoX[1];
      const rx = x0 * Math.cos(2 * t) - y0 * Math.sin(2 * t);
      const ry = x0 * Math.sin(2 * t) + y0 * Math.cos(2 * t);
      expect(r.sigmaN - m.centro).toBeCloseTo(rx, 10);
      expect(-r.tauN).toBeCloseTo(ry, 10);
    }
  });

  it('las direcciones de τ máxima están a 45° de las principales (ec. 2.64)', () => {
    const m = mohrPlano(p);
    expect(Math.abs(planoTension(p, m.theta1 + Math.PI / 4).tauN)).toBeCloseTo(m.radio, 10);
  });

  it('figura 2.15: los tres casos de tensión plana y su τmax impresa', () => {
    /* a/ σ1 > 0 > σ2: τmax = ½(σ1 − σ2) */
    expect(principalesPlana({ sx: 50, sy: -30, txy: 0 }).tauMax).toBeCloseTo(40, 12);
    /* b/ las dos positivas: τmax = ½σ1 */
    expect(principalesPlana({ sx: 50, sy: 30, txy: 0 }).tauMax).toBeCloseTo(25, 12);
    /* c/ las dos negativas: τmax = ½(−σ2), con σ2 la más negativa */
    expect(principalesPlana({ sx: -50, sy: -30, txy: 0 }).tauMax).toBeCloseTo(25, 12);
  });

  it('los tres círculos del estado general tienen como mayor el de 1-3', () => {
    const c = circulosMohr([30, 10, -20]);
    expect(c[2]).toEqual({ planos: '1-3', centro: 5, radio: 25 });
    expect(c[0].radio + c[1].radio).toBeCloseTo(c[2].radio, 12);
  });
});

describe('el plano inclinado de una barra (tema 8) por dos caminos', () => {
  it('σ cos²θ y −σ sen θ cos θ coinciden con la ec. 2.61 para σy = τxy = 0', () => {
    for (const grados of [0, 30, 45, 60, 150]) {
      const t = (grados * Math.PI) / 180;
      const a = planoInclinado(26, t);
      const b = planoTension({ sx: 26, sy: 0, txy: 0 }, t);
      expect(a.sigmaN).toBeCloseTo(b.sigmaN, 12);
      expect(a.tauN).toBeCloseTo(b.tauN, 12);
    }
  });
});
