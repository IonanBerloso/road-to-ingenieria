/**
 * Tema 8 de ERM: alargamientos, la barra recta con holgura, depósitos y
 * anillos (`src/lib/erm/axial.ts`).
 *
 * El segundo camino de cada número (CLAUDE.md §10):
 *  · la barra cónica, δ = PL/(E·π·r1·r2), y la barra que cuelga con su peso,
 *    δ = γL²/2E, son fórmulas cerradas de libro: el código integra, el test
 *    no;
 *  · la barra empotrada en los dos extremos con una carga P en un punto
 *    interior reparte P·b/L y P·a/L (caso de libro, por compatibilidad u = 0);
 *  · la calentada entre paredes tiene N = −EAαΔT (de la ec. 8.9 con ΔL = 0);
 *  · el depósito cumple la ec. 8.14 del tema, p/t = σ1/r1 + σ2/r2, que el
 *    código no usa, y el equilibrio de su tapa (ec. 8.17) hecho aparte.
 */
import { describe, expect, it } from 'vitest';
import {
  alargamiento,
  alargamientoVariable,
  anillo,
  deformacionInicial,
  depositoCilindrico,
  depositoEsferico,
  integra,
  resuelveBarraAxial,
} from '../../../src/lib/erm/axial';

describe('alargamientos (ecs. 8.8 y 8.9)', () => {
  it('8.9: NL/EA + ε0·L', () => {
    expect(alargamiento(20e3, 2, 200e9, 1e-4, 1e-4)).toBeCloseTo(0.002 + 0.0002, 12);
  });

  it('ε0 = αΔT + h/L', () => {
    expect(deformacionInicial({ alfa: 12e-6, dT: 50 })).toBeCloseTo(6e-4, 15);
    expect(deformacionInicial({ h: 0.5e-3, L: 2 })).toBeCloseTo(2.5e-4, 15);
    expect(deformacionInicial({ alfa: 12e-6, dT: 50, h: -0.5e-3, L: 2 })).toBeCloseTo(3.5e-4, 15);
    /* un error de fabricación sin la longitud no es una deformación: se dice, no NaN */
    expect(() => deformacionInicial({ h: 0.5e-3 })).toThrow(/longitud/);
  });

  it('integra un polinomio de grado 9 sin error', () => {
    expect(integra((x) => x ** 9, 0, 2, 1)).toBeCloseTo(2 ** 10 / 10, 9);
  });

  it('con N y EA uniformes, la integral da lo mismo que 8.9', () => {
    const d = alargamientoVariable({ N: () => 20e3, EA: () => 200e9 * 1e-4, eps0: () => 1e-4 }, 2);
    expect(d).toBeCloseTo(alargamiento(20e3, 2, 200e9, 1e-4, 1e-4), 12);
  });

  it('barra cónica: δ = PL/(E·π·r1·r2)', () => {
    const P = 50e3;
    const L = 1.5;
    const E = 70e9;
    const r1 = 0.02;
    const r2 = 0.05;
    const r = (x: number) => r1 + ((r2 - r1) * x) / L;
    const d = alargamientoVariable({ N: () => P, EA: (x) => E * Math.PI * r(x) ** 2 }, L);
    expect(d / ((P * L) / (E * Math.PI * r1 * r2))).toBeCloseTo(1, 10);
  });

  it('barra que cuelga con su peso: δ = γL²/2E', () => {
    const gamma = 78.5e3;
    const L = 300;
    const E = 210e9;
    const A = 3e-4;
    const d = alargamientoVariable({ N: (x) => gamma * A * (L - x), EA: () => E * A }, L);
    expect(d / ((gamma * L * L) / (2 * E))).toBeCloseTo(1, 12);
  });
});

describe('la barra recta entre paredes', () => {
  const EA = 84e6;

  it('empotrada en los dos extremos con P en un punto interior: N = P·b/L y −P·a/L', () => {
    const a = 0.3;
    const b = 0.7;
    const P = 1000;
    const s = resuelveBarraAxial({
      tramos: [
        { L: a, EA },
        { L: b, EA },
      ],
      cargas: [{ nudo: 1, P }],
      izquierda: 'fijo',
      derecha: 'fijo',
    });
    expect(s.N[0]).toBeCloseTo((P * b) / (a + b), 9);
    expect(s.N[1]).toBeCloseTo((-P * a) / (a + b), 9);
    expect(s.reaccionIzq + s.reaccionDer + P).toBeCloseTo(0, 9);
    expect(s.u[1]).toBeCloseTo((s.N[0] * a) / EA, 15);
  });

  it('calentada entre paredes: N = −EAαΔT y no se mueve', () => {
    const eps0 = deformacionInicial({ alfa: 12e-6, dT: 40 });
    const s = resuelveBarraAxial({
      tramos: [
        { L: 0.4, EA, eps0 },
        { L: 0.6, EA, eps0 },
      ],
      izquierda: 'fijo',
      derecha: 'fijo',
    });
    expect(s.N[0]).toBeCloseTo(-EA * eps0, 6);
    expect(s.N[1]).toBeCloseTo(-EA * eps0, 6);
    expect(s.u[1]).toBeCloseTo(0, 15);
  });

  it('con holgura: abierta mientras u < ξ, y cerrada después con ΣF = 0', () => {
    const xi = 0.2e-3;
    const barra = (P: number) =>
      resuelveBarraAxial({
        tramos: [
          { L: 0.8, EA },
          { L: 0.2, EA },
        ],
        cargas: [{ nudo: 1, P }],
        izquierda: 'fijo',
        derecha: { holgura: xi },
      });
    const poca = barra(10e3);
    expect(poca.contacto).toBe(false);
    expect(poca.u[2]).toBeCloseTo((10e3 * 0.8) / EA, 15);
    expect(poca.N[1]).toBe(0);
    const mucha = barra(30e3);
    expect(mucha.contacto).toBe(true);
    expect(mucha.u[2]).toBeCloseTo(xi, 15);
    expect(mucha.reaccionIzq + mucha.reaccionDer + 30e3).toBeCloseTo(0, 6);
    expect(mucha.reaccionDer).toBeLessThan(0);
  });

  it('libre en un extremo: la reacción es toda la carga', () => {
    const s = resuelveBarraAxial({ tramos: [{ L: 1, EA }], cargas: [{ nudo: 1, P: -500 }], izquierda: 'fijo', derecha: 'libre' });
    expect(s.reaccionIzq).toBeCloseTo(500, 9);
    expect(s.N[0]).toBeCloseTo(-500, 9);
  });

  it('suelta por los dos lados es un mecanismo', () => {
    expect(() => resuelveBarraAxial({ tramos: [{ L: 1, EA }], izquierda: 'libre', derecha: 'libre' })).toThrow(/mecanismo/);
  });
});

describe('depósitos y anillos (ecs. 8.14-8.19)', () => {
  const p = 2;
  const r = 500;
  const t = 10;

  it('cilindro: σ1 = pr/t y σ2 = pr/2t, que cumplen p/t = σ1/r1 + σ2/r2 con r2 = ∞', () => {
    const c = depositoCilindrico(p, r, t);
    expect(c.circunferencial).toBeCloseTo(100, 12);
    expect(c.longitudinal).toBeCloseTo(50, 12);
    expect(c.circunferencial / r + c.longitudinal / Infinity).toBeCloseTo(p / t, 12);
  });

  it('cilindro: la tapa está en equilibrio, p·πr² = σ2·2πr·t', () => {
    const { longitudinal } = depositoCilindrico(p, r, t);
    expect(longitudinal * 2 * Math.PI * r * t).toBeCloseTo(p * Math.PI * r * r, 6);
  });

  it('esfera: σ = pr/2t, que cumple 8.14 con r1 = r2', () => {
    const s = depositoEsferico(p, r, t);
    expect(s / r + s / r).toBeCloseTo(p / t, 12);
  });

  it('anillo: tracción con presión interior, compresión con exterior, y ε = σ/E + ε0', () => {
    const E = 200e3;
    const i = anillo(p, r, t, E, 'interior');
    const e = anillo(p, r, t, E, 'exterior', 1e-4);
    expect(i.sigma).toBeCloseTo(100, 12);
    expect(e.sigma).toBeCloseTo(-100, 12);
    expect(e.epsilon).toBeCloseTo(-100 / E + 1e-4, 15);
  });
});
