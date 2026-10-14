/**
 * Tema 3 de ERM: deformaciones (`src/lib/erm/deformaciones.ts`).
 *
 * El segundo camino de cada número (CLAUDE.md §10):
 *  · la roseta general (tres ecuaciones 3.55 resueltas por Cramer) contra las
 *    fórmulas cerradas de la roseta a 120° que imprimen los apuntes (ec. 3.66,
 *    p. 21) y contra las de la roseta a 45°;
 *  · la disminución del ángulo del ejercicio 3.1 resuelto de la colección
 *    contra la geometría exacta: se deforman dos vectores con dr' = (I + ε)dr
 *    y se mide el ángulo con arcocoseno;
 *  · γ = π/2 − ϕ (ec. 3.15) medido sobre aristas deformadas contra la
 *    linealización γ = u,y + v,x (ec. 3.21);
 *  · la versión plana contra la 3D, que son dos códigos.
 */
import { describe, expect, it } from 'vitest';
import {
  deformacionEnDireccion,
  deformacionGalga,
  direccionPlana,
  disminucionAngulo,
  gammaDeAristas,
  mohrDeformacion,
  principalesDeformacion,
  roseta,
  roseta45,
  roseta120,
  roseta60,
  tensorDeformaciones,
  volumetrica,
} from '../../../src/lib/erm/deformaciones';
import { dot, invariantes, mulMV, norma, type Mat3, type Vec3 } from '../../../src/lib/erm/tensor';

const eps: Mat3 = tensorDeformaciones({ ex: 600e-6, ey: -200e-6, ez: 100e-6, gxy: 500e-6, gyz: -300e-6, gzx: 150e-6 });

describe('el tensor y la deformación en una dirección (ecs. 3.35 y 3.49-3.55)', () => {
  it('lleva ½γ fuera de la diagonal', () => {
    expect(eps[0][1]).toBeCloseTo(250e-6, 18);
    expect(eps[1][2]).toBeCloseTo(-150e-6, 18);
    expect(eps[2][0]).toBeCloseTo(75e-6, 18);
  });

  it('εu sale igual que en la ec. 3.54 escrita término a término', () => {
    const u: Vec3 = [0.6, 0.48, 0.64];
    const { epsU } = deformacionEnDireccion(eps, u);
    const a = 600e-6 * 0.36 - 200e-6 * 0.2304 + 100e-6 * 0.4096;
    const b = 500e-6 * 0.6 * 0.48 - 300e-6 * 0.48 * 0.64 + 150e-6 * 0.64 * 0.6;
    expect(epsU).toBeCloseTo(a + b, 15);
  });

  it('½γu de la ec. 3.53 es, en el plano, |(εy − εx)/2·sen 2θ + γxy/2·cos 2θ| (ec. 2.61 con τ → ½γ)', () => {
    const plano = tensorDeformaciones({ ex: 600e-6, ey: -200e-6, ez: 0, gxy: 500e-6 });
    const th = 0.7;
    const u: Vec3 = [Math.cos(th), Math.sin(th), 0];
    const { mediaGammaU } = deformacionEnDireccion(plano, u);
    const aMano = ((-200e-6 - 600e-6) / 2) * Math.sin(2 * th) + (500e-6 / 2) * Math.cos(2 * th);
    expect(mediaGammaU).toBeCloseTo(Math.abs(aMano), 15);
    expect(Math.abs(aMano)).toBeGreaterThan(1e-5);
  });

  it('las principales conservan e = εx + εy + εz (ec. 3.59)', () => {
    const [a, b, c] = principalesDeformacion(eps).valores;
    expect(a + b + c).toBeCloseTo(volumetrica(eps), 15);
    expect(volumetrica(eps)).toBeCloseTo(invariantes(eps).I1, 18);
  });
});

describe('galgas y rosetas (ecs. 3.55 y 3.65-3.66)', () => {
  const real = { ex: 700e-6, ey: -250e-6, gxy: 420e-6 };

  it('la roseta a 60° (galgas a 0°, 60° y 120°, en ese orden) da εx, εy y γxy con su signo', () => {
    const e0 = deformacionGalga(real, 0);
    const e60 = deformacionGalga(real, Math.PI / 3);
    const e120 = deformacionGalga(real, (2 * Math.PI) / 3);
    const r = roseta60(e0, e60, e120);
    for (const k of ['ex', 'ey', 'gxy'] as const) expect(r[k]).toBeCloseTo(real[k], 15);
    /* la trampa que avisa el docblock de roseta120: con esas galgas en orden natural, γ sale cambiado */
    expect(roseta120(e0, e60, e120).gxy).toBeCloseTo(-real.gxy, 15);
  });

  it('la roseta a 120° de los apuntes: la general da lo mismo que la ec. 3.66', () => {
    const ea = deformacionGalga(real, 0);
    const eb = deformacionGalga(real, (120 * Math.PI) / 180);
    const ec = deformacionGalga(real, (240 * Math.PI) / 180);
    const cerrada = roseta120(ea, eb, ec);
    const general = roseta([
      { angulo: 0, epsilon: ea },
      { angulo: 120, epsilon: eb },
      { angulo: 240, epsilon: ec },
    ]);
    for (const k of ['ex', 'ey', 'gxy'] as const) {
      expect(cerrada[k]).toBeCloseTo(real[k], 15);
      expect(general[k]).toBeCloseTo(real[k], 15);
    }
  });

  it('la roseta a 45°: γxy = 2εb − εa − εc', () => {
    const ea = deformacionGalga(real, 0);
    const eb = deformacionGalga(real, Math.PI / 4);
    const ec = deformacionGalga(real, Math.PI / 2);
    const r = roseta45(ea, eb, ec);
    const g = roseta([
      { angulo: 0, epsilon: ea },
      { angulo: 45, epsilon: eb },
      { angulo: 90, epsilon: ec },
    ]);
    expect(r.gxy).toBeCloseTo(real.gxy, 15);
    expect(g.gxy).toBeCloseTo(real.gxy, 15);
  });

  it('una galga a 150° mide lo mismo que a −30°: es la misma recta', () => {
    expect(deformacionGalga(real, (150 * Math.PI) / 180)).toBeCloseTo(deformacionGalga(real, (-30 * Math.PI) / 180), 18);
  });

  it('dos galgas en la misma recta no determinan nada', () => {
    expect(() =>
      roseta([
        { angulo: 0, epsilon: 1e-4 },
        { angulo: 180, epsilon: 1e-4 },
        { angulo: 90, epsilon: 0 },
      ]),
    ).toThrow(/misma dirección/);
  });
});

describe('Mohr y la versión plana', () => {
  const d = { ex: 1200e-6, ey: 400e-6, gxy: 800 * Math.sqrt(3) * 1e-6 };

  it('ε1,2 = centro ± √(((εx − εy)/2)² + (γ/2)²)', () => {
    const m = mohrDeformacion(d);
    const R = Math.hypot((d.ex - d.ey) / 2, d.gxy / 2);
    expect(m.sigma1).toBeCloseTo(800e-6 + R, 15);
    expect(m.sigma2).toBeCloseTo(800e-6 - R, 15);
  });

  it('la dirección plana coincide con la 3D', () => {
    const T = tensorDeformaciones({ ex: d.ex, ey: d.ey, ez: 0, gxy: d.gxy });
    for (const grados of [0, 25, 70, 130]) {
      const t = (grados * Math.PI) / 180;
      const u: Vec3 = [Math.cos(t), Math.sin(t), 0];
      const tg: Vec3 = [-Math.sin(t), Math.cos(t), 0];
      const p = direccionPlana(d, t);
      expect(p.epsU).toBeCloseTo(deformacionEnDireccion(T, u).epsU, 15);
      expect(p.mediaGamma).toBeCloseTo(dot(mulMV(T, u), tg), 15);
      expect(p.epsU).toBeCloseTo(deformacionGalga(d, t), 15);
    }
  });
});

describe('ángulos que se cierran (ec. 3.15 y ejercicio 3.1)', () => {
  /* Deforma un vector con dr' = (I + ε)·dr: pura deformación, sin giro. */
  const deforma = (e: Mat3, v: Vec3): Vec3 => {
    const d = mulMV(e, v);
    return [v[0] + d[0], v[1] + d[1], v[2] + d[2]];
  };
  const angulo = (a: Vec3, b: Vec3) => Math.acos(dot(a, b) / (norma(a) * norma(b)));

  it('ejercicio 3.1: Γ coincide con la disminución medida sobre los vectores deformados', () => {
    /* deformaciones de 10⁻⁶: el error de la linealización es del orden de ε */
    const chico = eps.map((f) => f.map((v) => v / 100)) as unknown as Mat3;
    const u1: Vec3 = [1, 0, 0];
    const u2: Vec3 = [Math.cos(1.1), Math.sin(1.1) * 0.8, Math.sin(1.1) * 0.6];
    const medida = angulo(u1, u2) - angulo(deforma(chico, u1), deforma(chico, u2));
    expect(disminucionAngulo(chico, u1, u2) / medida).toBeCloseTo(1, 4);
  });

  it('con u1 = x y u2 = y, Γ es γxy', () => {
    expect(disminucionAngulo(eps, [1, 0, 0], [0, 1, 0])).toBeCloseTo(500e-6, 15);
  });

  it('γ de las aristas deformadas ≈ u,y + v,x (ec. 3.21)', () => {
    const uy = 3e-5;
    const vx = 1e-5;
    const ux = 2e-5;
    const vy = -1e-5;
    const OA: Vec3 = [1 + ux, vx, 0];
    const OB: Vec3 = [uy, 1 + vy, 0];
    expect(gammaDeAristas(OA, OB) / (uy + vx)).toBeCloseTo(1, 4);
  });

  it('γ de las aristas no pierde cifras: γ = 10⁻¹² y aristas casi paralelas', () => {
    /* tg γ = (a·b)/|a×b|: con a = x y b = (10⁻¹², 1, 0), γ = atan(10⁻¹²) */
    expect(gammaDeAristas([1, 0, 0], [1e-12, 1, 0]) / 1e-12).toBeCloseTo(1, 10);
    expect(gammaDeAristas([1, 0, 0], [1, 1e-9, 0])).toBeCloseTo(Math.PI / 2 - 1e-9, 15);
    expect(() => gammaDeAristas([0, 0, 0], [0, 1, 0])).toThrow(/nula/);
  });
});
