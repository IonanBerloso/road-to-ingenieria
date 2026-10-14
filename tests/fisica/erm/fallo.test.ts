/**
 * Tema 6 de ERM: criterios de fallo (`src/lib/erm/fallo.ts`).
 *
 * El segundo camino de cada número (CLAUDE.md §10):
 *  · los ensayos que definen los límites tienen que dar FS = 1 justo en su
 *    límite: tracción pura en todos, y compresión pura en Mohr (lo dice la
 *    p. 8 de los apuntes, bajo la ec. 6.16);
 *  · Tresca es Mohr con k = 1 y sen ϕ = 0 (p. 9);
 *  · von Mises por las componentes de un tensor girado (ec. 6.28) y por sus
 *    principales (ec. 6.29), y en el plano por las ecs. 6.30 y 6.31;
 *  · el cortante puro τ: Tresca 2τ y von Mises √3·τ, de libro;
 *  · la figura 6.5: un punto entre el hexágono y la elipse pasa von Mises y
 *    falla Tresca.
 */
import { describe, expect, it } from 'vitest';
import { mohr, rankine, saintVenant, tensionAdmisible, tresca, vonMises, vonMisesTensor } from '../../../src/lib/erm/fallo';
import { giraTensor, type Mat3 } from '../../../src/lib/erm/tensor';

const se = 250;

describe('los ensayos que definen los límites', () => {
  it('tracción pura en el límite: FS = 1 en los cinco criterios', () => {
    const p = [se, 0, 0];
    expect(rankine(p, se).FS).toBeCloseTo(1, 12);
    expect(saintVenant(p, 200e3, 0.3, se).FS).toBeCloseTo(1, 12);
    expect(mohr(p, se, 3 * se).FS).toBeCloseTo(1, 12);
    expect(tresca(p, se).FS).toBeCloseTo(1, 12);
    expect(vonMises(p, se).FS).toBeCloseTo(1, 12);
  });

  it('Mohr: la compresión pura en su límite σec da σeqv = σet', () => {
    const r = mohr([0, 0, -750], 250, 750);
    expect(r.sigmaEq).toBeCloseTo(250, 12);
    expect(r.FS).toBeCloseTo(1, 12);
  });

  it('Rankine con límites distintos usa el de compresión si manda la compresión', () => {
    expect(rankine([10, 0, -500], 250, 1000).FS).toBeCloseTo(2, 12);
  });

  it('Saint-Venant en compresión simple: E·εmax = |σ| y se compara con σec', () => {
    /* compresión pura: la deformación mayor es la axial, −500/E; de libro, E·ε = σ */
    const r = saintVenant([0, 0, -500], 200e3, 0.3, 250, 1000);
    expect(r.sigmaEq).toBeCloseTo(500, 9);
    expect(r.FS).toBeCloseTo(2, 12);
  });
});

describe('las relaciones entre criterios', () => {
  it('Tresca es Mohr con k = 1, y entonces ϕ = 0', () => {
    const p = [120, -30, -80];
    const m = mohr(p, 300, 300);
    expect(m.sigmaEq).toBeCloseTo(tresca(p, 300).sigmaEq, 12);
    expect(m.phi).toBeCloseTo(0, 15);
  });

  it('Mohr fuera del límite: 1/FS = σ1/σet − σ3/σec (la recta de los dos ensayos)', () => {
    /* σ1 = 100, σ3 = −150, σet = 250, σec = 750: 100/250 + 150/750 = 0,6 → FS = 5/3 */
    const r = mohr([100, 0, -150], 250, 750);
    expect(r.sigmaEq).toBeCloseTo(150, 12);
    expect(r.FS).toBeCloseTo(1 / (100 / 250 + 150 / 750), 12);
  });

  it('Mohr con σeqv ≤ 0 no falla: FS = ∞ (ec. 6.16), no un FS negativo', () => {
    /* compresión hidrostática: σeqv = −100 + 100/3 = −66,7 < σet, y por mucho que crezca no llega */
    const r = mohr([-100, -100, -100], 100, 300);
    expect(r.sigmaEq).toBeCloseTo(-200 / 3, 12);
    expect(r.FS).toBe(Infinity);
    expect(mohr([0, 0, 0], 100, 300).FS).toBe(Infinity);
  });

  it('sen ϕ = (1 − k)/(1 + k) (ec. 6.12)', () => {
    expect(Math.sin(mohr([1, 0, 0], 100, 300).phi)).toBeCloseTo(0.5, 15);
  });

  it('cortante puro τ: Tresca 2τ y von Mises √3·τ', () => {
    const p = [60, 0, -60];
    expect(tresca(p, se).sigmaEq).toBeCloseTo(120, 12);
    expect(vonMises(p, se).sigmaEq).toBeCloseTo(60 * Math.sqrt(3), 12);
  });

  it('von Mises por componentes (6.28) y por principales (6.29) dan lo mismo', () => {
    const c = Math.cos(0.5);
    const s = Math.sin(0.5);
    const R: Mat3 = [
      [c, 0, s],
      [0, 1, 0],
      [-s, 0, c],
    ];
    const T = giraTensor(
      [
        [140, 0, 0],
        [0, 20, 0],
        [0, 0, -70],
      ],
      R,
    );
    expect(vonMisesTensor(T, se).sigmaEq).toBeCloseTo(vonMises([140, 20, -70], se).sigmaEq, 10);
  });

  it('en el plano, las ecs. 6.30 y 6.31 coinciden', () => {
    const sx = 90;
    const sy = -40;
    const t = 35;
    const c = (sx + sy) / 2;
    const r = Math.hypot((sx - sy) / 2, t);
    const v630 = Math.sqrt(sx * sx - sx * sy + sy * sy + 3 * t * t);
    expect(vonMises([c + r, c - r, 0], se).sigmaEq).toBeCloseTo(v630, 10);
  });

  it('figura 6.5: (σ1, σ2) = (σe, σe/2)·1,1 pasa von Mises y falla Tresca', () => {
    const p = [1.1 * se, 0.55 * se, 0];
    expect(vonMises(p, se).FS).toBeGreaterThan(1);
    expect(tresca(p, se).FS).toBeLessThan(1);
  });
});

describe('detalles', () => {
  it('el orden de las principales no importa, y la tercera de la tensión plana cuenta', () => {
    expect(tresca([0, 100, 40], se).sigmaEq).toBe(100);
    expect(tresca([40, 0, 100], se).sigmaEq).toBe(100);
  });

  it('Saint-Venant en tracción biaxial: E·εmax = σ1 − ν·σ2', () => {
    const r = saintVenant([200, 100, 0], 200e3, 0.3, se);
    expect(r.sigmaEq).toBeCloseTo(170, 9);
    expect(r.FS).toBeCloseTo(se / 170, 12);
  });

  it('Rankine literal y su cociente más pequeño, en el caso del comentario', () => {
    const r = rankine([90, 0, -100], 100, 1000);
    expect(r.FS).toBeCloseTo(10, 12);
    expect(r.FSmin).toBeCloseTo(100 / 90, 12);
  });

  it('tensión admisible σe/n, con n > 1', () => {
    expect(tensionAdmisible(300, 1.5)).toBeCloseTo(200, 12);
    expect(() => tensionAdmisible(300, 1)).toThrow(/mayor que 1/);
  });

  it('pide las tres principales', () => {
    expect(() => tresca([100, 20], se)).toThrow(/tres tensiones principales/);
  });
});
