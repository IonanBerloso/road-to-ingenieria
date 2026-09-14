/**
 * El modelo del plano complejo del tema 1, contra el caso que ese mismo tema
 * publica.
 *
 * El tema, en su bloque «Error típico · calcular el argumento con arctan a
 * secas», dice: con z = −1 − i el cociente b/a vale 1 y arctan devuelve π/4,
 * «que es el argumento de 1 + i, el número contrario». El argumento de verdad
 * es −3π/4, y el módulo, en cambio, sale bien. Eso es lo que se comprueba
 * aquí, junto con las identidades que el simulador dibuja.
 */
import { describe, expect, it } from 'vitest';
import {
  arctanIngenuo,
  argumento,
  binomica,
  cuadrante,
  desfase,
  modulo,
  producto,
} from '../../src/lib/plano';

const PI = Math.PI;

describe('el caso que publica el tema: z = −1 − i', () => {
  const a = -1;
  const b = -1;

  it('el módulo sale bien: vale raíz de dos', () => {
    expect(modulo(a, b)).toBeCloseTo(Math.SQRT2, 12);
  });

  it('arctan(b/a) devuelve π/4, el argumento del número contrario', () => {
    expect(arctanIngenuo(a, b)).toBeCloseTo(PI / 4, 12);
    expect(arctanIngenuo(a, b)).toBeCloseTo(argumento(1, 1), 12);
  });

  it('el argumento de verdad es −3π/4', () => {
    expect(argumento(a, b)).toBeCloseTo((-3 * PI) / 4, 12);
  });

  it('la diferencia entre los dos es exactamente π', () => {
    expect(Math.abs(desfase(a, b))).toBeCloseTo(PI, 12);
  });

  it('y el punto está en el tercer cuadrante', () => {
    expect(cuadrante(a, b)).toBe('III');
  });
});

describe('dónde se separan arctan y el argumento', () => {
  it('coinciden en el primer y el cuarto cuadrante', () => {
    for (const [a, b] of [
      [1, 1],
      [3, -2],
      [0.5, 0],
      [2, 5],
    ] as const) {
      expect(desfase(a, b)).toBeCloseTo(0, 12);
    }
  });

  it('se separan exactamente π en el segundo y el tercero', () => {
    for (const [a, b] of [
      [-1, 1],
      [-3, -2],
      [-0.5, 4],
      [-2, -5],
    ] as const) {
      expect(Math.abs(desfase(a, b))).toBeCloseTo(PI, 12);
    }
  });

  it('los cuatro cuadrantes se nombran con el convenio del tema', () => {
    expect(cuadrante(1, 1)).toBe('I');
    expect(cuadrante(-1, 1)).toBe('II');
    expect(cuadrante(-1, -1)).toBe('III');
    expect(cuadrante(1, -1)).toBe('IV');
  });
});

describe('el paso entre las dos formas', () => {
  it('de polar a binómica y vuelta, sin perder nada', () => {
    for (const r of [0.4, 1, 2.5, 4]) {
      for (const th of [-3, -1.2, 0, 0.79, 2.9]) {
        const { a, b } = binomica(r, th);
        expect(modulo(a, b)).toBeCloseTo(r, 12);
        expect(argumento(a, b)).toBeCloseTo(th, 12);
      }
    }
  });

  it('z = 2 con argumento π/4 es raíz de dos más raíz de dos i', () => {
    const { a, b } = binomica(2, PI / 4);
    expect(a).toBeCloseTo(Math.SQRT2, 12);
    expect(b).toBeCloseTo(Math.SQRT2, 12);
  });
});

describe('el producto: multiplicar módulos y sumar argumentos', () => {
  it('multiplicar por 1 con argumento π/2 gira un cuarto de vuelta', () => {
    const p = producto(2, PI / 4, 1, PI / 2);
    expect(p.r).toBeCloseTo(2, 12);
    expect(p.theta).toBeCloseTo((3 * PI) / 4, 12);
  });

  it('el argumento sale reducido al intervalo (−π, π]', () => {
    const p = producto(1, (3 * PI) / 4, 1, (3 * PI) / 4);
    expect(p.theta).toBeCloseTo((-PI) / 2, 12);
  });

  it('multiplicar por i cuatro veces devuelve al punto de partida', () => {
    let p = { r: 1.7, theta: 0.3 };
    for (let k = 0; k < 4; k++) p = producto(p.r, p.theta, 1, PI / 2);
    expect(p.r).toBeCloseTo(1.7, 12);
    expect(p.theta).toBeCloseTo(0.3, 12);
  });
});
