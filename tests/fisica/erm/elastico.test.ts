/**
 * Tema 4 de ERM: el cuerpo elástico (`src/lib/erm/elastico.ts`).
 *
 * El segundo camino de cada número (CLAUDE.md §10):
 *  · ida y vuelta: σ → ε → σ por las dos leyes de Hooke, que son dos códigos;
 *  · el cortante puro deduce G como los apuntes (ecs. 4.4-4.6): sus
 *    principales son ±τ, la deformación principal ε1 = τ(1 + ν)/E tiene que
 *    ser γ/2, y de ahí G = E/2(1 + ν);
 *  · el estado hidrostático cumple p = k·e (ec. 4.15);
 *  · la energía por ½σ:ε contra la expresión en tensiones de la ec. 6.23;
 *  · los resultados de libro: σz = ν(σx + σy) en deformación plana, y
 *    σ = −EαΔT/(1 − 2ν) en un cubo calentado sin poder dilatar.
 */
import { describe, expect, it } from 'vitest';
import {
  deformacionPlana,
  deformacionesDeTensiones,
  energiaPorVolumen,
  lame,
  moduloG,
  moduloVolumetrico,
  poissonDeEG,
  tensionPlana,
  tensionesDeDeformaciones,
  variacionVolumen,
} from '../../../src/lib/erm/elastico';
import { principales, type Mat3 } from '../../../src/lib/erm/tensor';

const E = 210e3;
const nu = 0.3;
const sigma: Mat3 = [
  [120, 40, -15],
  [40, -60, 25],
  [-15, 25, 30],
];

describe('Hooke en los dos sentidos (ecs. 4.2-4.3 y 4.12-4.13)', () => {
  it('σ → ε → σ vuelve al mismo tensor', () => {
    const vuelta = tensionesDeDeformaciones(deformacionesDeTensiones(sigma, E, nu), E, nu);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) expect(vuelta[i][j]).toBeCloseTo(sigma[i][j], 9);
  });

  it('con temperatura también, si se pasa el mismo αΔT a la ida y a la vuelta', () => {
    const a = 12e-6 * 40;
    const vuelta = tensionesDeDeformaciones(deformacionesDeTensiones(sigma, E, nu, a), E, nu, a);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) expect(vuelta[i][j]).toBeCloseTo(sigma[i][j], 9);
  });

  it('tracción simple: εx = σ/E y εy = εz = −νσ/E (ec. 4.1)', () => {
    const e = deformacionesDeTensiones(
      [
        [100, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ],
      E,
      nu,
    );
    expect(e[0][0]).toBeCloseTo(100 / E, 15);
    expect(e[1][1]).toBeCloseTo((-nu * 100) / E, 15);
    expect(e[2][2]).toBeCloseTo((-nu * 100) / E, 15);
  });

  it('cortante puro: la deformación principal es γ/2, y eso es G = E/2(1 + ν)', () => {
    const tau = 50;
    const e = deformacionesDeTensiones(
      [
        [0, tau, 0],
        [tau, 0, 0],
        [0, 0, 0],
      ],
      E,
      nu,
    );
    const eps1 = principales(e).valores[0];
    expect(eps1).toBeCloseTo((tau * (1 + nu)) / E, 15);
    expect(2 * e[0][1]).toBeCloseTo(tau / moduloG(E, nu), 15);
    expect(2 * e[0][1]).toBeCloseTo(2 * eps1, 15);
  });

  it('ν a partir de E y G deshace la ec. 4.6', () => {
    expect(poissonDeEG(E, moduloG(E, nu))).toBeCloseTo(nu, 12);
  });

  it('rechaza un ν fuera de −1 < ν < 0,5 (ec. 4.18)', () => {
    expect(() => deformacionesDeTensiones(sigma, E, 0.5)).toThrow(/ec\. 4\.18/);
    expect(() => moduloG(E, -1)).toThrow(/ec\. 4\.18/);
    expect(() => lame(E, 0.5)).toThrow(/ec\. 4\.18/);
    expect(() => moduloVolumetrico(E, 0.5)).toThrow(/ec\. 4\.18/);
  });
});

describe('volumen (ecs. 4.8 y 4.14-4.16)', () => {
  it('e = (1 − 2ν)·I1/E y es la traza del tensor de deformaciones', () => {
    const e = deformacionesDeTensiones(sigma, E, nu);
    expect(variacionVolumen(sigma, E, nu)).toBeCloseTo(e[0][0] + e[1][1] + e[2][2], 15);
  });

  it('hidrostático: p = k·e', () => {
    const p = -80;
    const s: Mat3 = [
      [p, 0, 0],
      [0, p, 0],
      [0, 0, p],
    ];
    expect(p).toBeCloseTo(moduloVolumetrico(E, nu) * variacionVolumen(s, E, nu), 9);
  });

  it('λ y G dan k = λ + 2G/3', () => {
    expect(moduloVolumetrico(E, nu)).toBeCloseTo(lame(E, nu) + (2 * moduloG(E, nu)) / 3, 6);
  });
});

describe('temperatura y estados planos (ecs. 4.19-4.26)', () => {
  const alfaDT = 12e-6 * 50;

  it('dilatación libre: ε = αΔT sin tensiones', () => {
    const s = tensionesDeDeformaciones(
      [
        [alfaDT, 0, 0],
        [0, alfaDT, 0],
        [0, 0, alfaDT],
      ],
      E,
      nu,
      alfaDT,
    );
    for (let i = 0; i < 3; i++) expect(s[i][i]).toBeCloseTo(0, 9);
  });

  it('dilatación impedida: σ = −EαΔT/(1 − 2ν) en las tres direcciones', () => {
    const s = tensionesDeDeformaciones(
      [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ],
      E,
      nu,
      alfaDT,
    );
    expect(s[0][0]).toBeCloseTo((-E * alfaDT) / (1 - 2 * nu), 9);
  });

  it('tensión plana (4.25): con la εz que devuelve, la ley general da σz = 0', () => {
    const d = { ex: 900e-6, ey: -150e-6, gxy: 300e-6 };
    const p = tensionPlana(d, E, nu);
    const s = tensionesDeDeformaciones(
      [
        [d.ex, d.gxy / 2, 0],
        [d.gxy / 2, d.ey, 0],
        [0, 0, p.ez],
      ],
      E,
      nu,
    );
    expect(s[2][2]).toBeCloseTo(0, 9);
    expect(s[0][0]).toBeCloseTo(p.sx, 9);
    expect(s[1][1]).toBeCloseTo(p.sy, 9);
    expect(s[0][1]).toBeCloseTo(p.txy, 9);
  });

  it('deformación plana: σz = ν(σx + σy)', () => {
    const p = deformacionPlana({ ex: 900e-6, ey: -150e-6, gxy: 300e-6 }, E, nu);
    expect(p.sz).toBeCloseTo(nu * (p.sx + p.sy), 9);
  });
});

describe('energía de deformación (ec. 4.36)', () => {
  it('½σ:ε coincide con la expresión en tensiones de la ec. 6.23', () => {
    const e = deformacionesDeTensiones(sigma, E, nu);
    const G = moduloG(E, nu);
    const [sx, sy, sz] = [sigma[0][0], sigma[1][1], sigma[2][2]];
    const dosU =
      (sx * sx + sy * sy + sz * sz - 2 * nu * (sx * sy + sy * sz + sz * sx)) / E +
      (sigma[0][1] ** 2 + sigma[1][2] ** 2 + sigma[2][0] ** 2) / G;
    expect(energiaPorVolumen(sigma, e)).toBeCloseTo(dosU / 2, 12);
  });
});
