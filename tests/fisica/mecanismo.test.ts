/**
 * El modelo del mecanismo biela-manivela del tema 8, contra los números que
 * la propia página publica en la figura de ese tema —el mecanismo de 0,1 y
 * 0,3 m a 45° girando a 10 rad/s— y contra sí mismo por un segundo camino:
 * la velocidad de la deslizadera leída del centro instantáneo tiene que
 * coincidir con la derivada numérica de su posición.
 */
import { describe, expect, it } from 'vitest';
import { base, centroInstantaneo, cinematica, posiciones, type Mecanismo } from '../../src/lib/mecanismo';

const grados = (g: number) => (g * Math.PI) / 180;

/** El de la figura del tema 8. */
const figura: Mecanismo = { r: 0.1, l: 0.3, theta: grados(45), omega: 10 };

describe('la figura del tema 8', () => {
  it('pone el centro instantáneo en (0,362; 0,362)', () => {
    const I = centroInstantaneo(figura);
    expect(I).not.toBeNull();
    expect((I as { x: number }).x).toBeCloseTo(0.362, 3);
    expect((I as { y: number }).y).toBeCloseTo(0.362, 3);
  });

  it('da IA = 0,412 m e IB = 0,362 m', () => {
    const { IA, IB } = cinematica(figura);
    expect(IA).toBeCloseTo(0.412, 3);
    expect(IB).toBeCloseTo(0.362, 3);
  });

  it('gira la biela a 2,43 rad/s', () => {
    const { omegaBiela } = cinematica(figura);
    expect(Math.abs(omegaBiela)).toBeCloseTo(2.425, 2);
  });

  it('mueve la deslizadera a 0,879 m/s', () => {
    const { vB } = cinematica(figura);
    expect(Math.abs(vB)).toBeCloseTo(0.879, 3);
  });
});

describe('los dos caminos tienen que coincidir', () => {
  it('la velocidad de B leída del CIR es la derivada de su posición', () => {
    for (const g of [20, 45, 70, 110, 160, 200, 250, 300, 340]) {
      const m: Mecanismo = { r: 0.1, l: 0.3, theta: grados(g), omega: 10 };
      const h = 1e-6;
      const x1 = posiciones({ ...m, theta: m.theta - h }).B.x;
      const x2 = posiciones({ ...m, theta: m.theta + h }).B.x;
      const derivada = ((x2 - x1) / (2 * h)) * m.omega;
      expect(cinematica(m).vB).toBeCloseTo(derivada, 4);
      /* y la del CIR, que es la que enseña el simulador */
      const { IA, IB, vA } = cinematica(m);
      expect((vA / IA) * IB).toBeCloseTo(Math.abs(derivada), 4);
    }
  });
});

describe('los puntos muertos', () => {
  it('no tienen centro instantáneo, y ahí la biela no gira', () => {
    for (const g of [0, 180]) {
      const m: Mecanismo = { r: 0.1, l: 0.3, theta: grados(g), omega: 10 };
      expect(centroInstantaneo(m)).toBeNull();
      expect(cinematica(m).omegaBiela).toBe(0);
    }
  });

  it('y son justo donde la deslizadera se para', () => {
    for (const g of [0, 180]) {
      const m: Mecanismo = { r: 0.1, l: 0.3, theta: grados(g), omega: 10 };
      expect(Math.abs(cinematica(m).vB)).toBeCloseTo(0, 9);
    }
  });
});

describe('la geometría, por dentro', () => {
  it('mantiene la biela con su longitud en todo el ciclo', () => {
    for (let g = 0; g < 360; g += 7) {
      const m: Mecanismo = { r: 0.1, l: 0.3, theta: grados(g), omega: 10 };
      const { A, B } = posiciones(m);
      expect(Math.hypot(B.x - A.x, B.y - A.y)).toBeCloseTo(m.l, 9);
    }
  });

  it('deja la deslizadera entre l−r y l+r del eje', () => {
    for (let g = 0; g < 360; g += 11) {
      const { B } = posiciones({ r: 0.1, l: 0.3, theta: grados(g), omega: 10 });
      expect(B.x).toBeGreaterThanOrEqual(0.2 - 1e-9);
      expect(B.x).toBeLessThanOrEqual(0.4 + 1e-9);
    }
  });

  it('dibuja una base con puntos a los dos lados del eje', () => {
    const pts = base(0.1, 0.3, 240);
    expect(pts.length).toBeGreaterThan(100);
    expect(pts.some((p) => p.y > 0)).toBe(true);
    expect(pts.some((p) => p.y < 0)).toBe(true);
  });
});
