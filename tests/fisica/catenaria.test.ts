/**
 * El modelo de la catenaria del tema 5, contra la figura que ese mismo tema
 * publica y contra las identidades que el curso usa para resolver.
 *
 * La figura publica: cable de 10 N/m con 20 N de tensión en el punto más
 * bajo, es decir c = 2 m; en x = 3 m la altura sobre la directriz es 4,705 m,
 * la longitud de cable desde el punto más bajo 4,259 m, la tensión 47 N y el
 * ángulo 64,8°. Y comprueba que 4,705² = 2² + 4,259².
 */
import { describe, expect, it } from 'vitest';
import {
  altura,
  angulo,
  errorParabola,
  flecha,
  longitud,
  parabola,
  parametro,
  parametroDesde,
  tension,
} from '../../src/lib/catenaria';

const c = parametro(20, 10);

describe('la figura del tema 5', () => {
  it('da el parámetro c = 2 m', () => {
    expect(c).toBeCloseTo(2, 9);
  });

  it('pone el cable a 4,705 m sobre la directriz en x = 3 m', () => {
    expect(altura(c, 3)).toBeCloseTo(4.705, 3);
  });

  it('mide 4,259 m de cable desde el punto más bajo', () => {
    expect(longitud(c, 3)).toBeCloseTo(4.259, 3);
  });

  it('da 47 N de tensión, que es el peso de 4,705 m de cable', () => {
    expect(tension(c, 3, 10)).toBeCloseTo(47, 1);
  });

  it('y 64,8° de inclinación', () => {
    expect(angulo(c, 3)).toBeCloseTo(64.8, 1);
  });
});

describe('las identidades del curso', () => {
  it('cumple y² = c² + s² en todo el cable', () => {
    for (const x of [0, 0.5, 1, 2, 3, 5, 8]) {
      expect(altura(c, x) ** 2).toBeCloseTo(c * c + longitud(c, x) ** 2, 6);
    }
  });

  it('mide la flecha desde el punto más bajo, no desde la directriz', () => {
    expect(flecha(c, 3)).toBeCloseTo(4.705 - 2, 3);
  });

  it('la tensión horizontal es la misma en todo el cable', () => {
    /* T·cosθ tiene que valer T0 = w·c en cualquier punto. */
    for (const x of [0.5, 2, 4]) {
      const T = tension(c, x, 10);
      const th = (angulo(c, x) * Math.PI) / 180;
      expect(T * Math.cos(th)).toBeCloseTo(20, 6);
    }
  });
});

describe('la parábola, y cuándo vale', () => {
  it('coincide con la catenaria en el punto más bajo', () => {
    expect(parabola(c, 0)).toBeCloseTo(altura(c, 0), 12);
  });

  it('se queda corta, y cada vez más lejos del centro', () => {
    for (const x of [1, 3, 6]) expect(parabola(c, x)).toBeLessThan(altura(c, x));
  });

  it('con el cable tenso la diferencia es despreciable', () => {
    /* vano de 100 m con 1 m de flecha: lo que se llama tenso */
    const cTenso = parametroDesde(50, 1);
    const e = errorParabola(cTenso, 50);
    expect(Math.abs(e.longitud)).toBeLessThan(0.01);
    expect(Math.abs(e.tension)).toBeLessThan(0.05);
  });

  it('y con el cable colgado deja de serlo', () => {
    /* vano de 100 m con 40 m de flecha */
    const cColgado = parametroDesde(50, 40);
    const e = errorParabola(cColgado, 50);
    expect(e.tension).toBeGreaterThan(1);
  });
});

describe('resolver el parámetro desde el vano y la flecha', () => {
  it('vuelve al mismo sitio del que salió', () => {
    for (const [a, f] of [
      [10, 1],
      [50, 5],
      [3, 2.7],
    ]) {
      const cc = parametroDesde(a, f);
      expect(flecha(cc, a)).toBeCloseTo(f, 6);
    }
  });

  it('reproduce la figura del tema desde su propia flecha', () => {
    const cc = parametroDesde(3, 4.705 - 2);
    expect(cc).toBeCloseTo(2, 3);
  });
});
