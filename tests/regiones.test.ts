import { describe, expect, it } from 'vitest';
import { analiza, cumple, mismaRegion, type Ventana } from '../src/lib/regiones';

const V: Ventana = { x: [-4, 4], y: [-4, 4] };

describe('analiza', () => {
  it('entiende las condiciones tal y como las escribe un examen', () => {
    expect(() => analiza('|z - (2+i)| < 3')).not.toThrow();
    expect(() => analiza('Re(1/(z-1)) > 1/2')).not.toThrow();
    expect(() => analiza('|z-4i| + |z+4i| < 10')).not.toThrow();
    expect(() => analiza('(x-1)^2 + (y+2)^2 >= 4')).not.toThrow();
    expect(() => analiza('pi/6 <= arg(z) <= pi/3')).not.toThrow();
  });

  it('acepta el producto implícito y el menos tipográfico', () => {
    expect(() => analiza('2z + 3 < 4')).not.toThrow();
    expect(() => analiza('|z − 1| < 2')).not.toThrow();
  });

  it('protesta con un mensaje entendible cuando no puede leerlo', () => {
    expect(() => analiza('|z - 1| ')).toThrow(/comparación/);
    expect(() => analiza('sen(z) < 1')).toThrow(/no conozco/);
    expect(() => analiza('|z < 1')).toThrow(/falta/);
    expect(() => analiza('z # 1')).toThrow(/carácter/);
  });
});

describe('cumple', () => {
  it('sitúa puntos dentro y fuera de un disco', () => {
    const disco = analiza('|z| < 2');
    expect(cumple(disco, 0, 0)).toBe(true);
    expect(cumple(disco, 1.9, 0)).toBe(true);
    expect(cumple(disco, 3, 0)).toBe(false);
  });

  it('entiende Re, Im y el conjugado', () => {
    expect(cumple(analiza('Re(z) > 1'), 2, 5)).toBe(true);
    expect(cumple(analiza('Re(z) > 1'), 0, 5)).toBe(false);
    expect(cumple(analiza('Im(conj(z)) > 0'), 0, -3)).toBe(true);
  });

  it('admite la doble desigualdad', () => {
    const franja = analiza('1 < Re(z) < 3');
    expect(cumple(franja, 2, 0)).toBe(true);
    expect(cumple(franja, 4, 0)).toBe(false);
  });
});

describe('mismaRegion', () => {
  it('reconoce como equivalentes dos formas de escribir el mismo disco', () => {
    const enZ = analiza('|z - (1+2i)| < 3');
    const enXY = analiza('(x-1)^2 + (y-2)^2 < 9');
    expect(mismaRegion(enZ, enXY, V).iguales).toBe(true);
  });

  it('distingue regiones parecidas pero distintas', () => {
    const buena = analiza('(x-1)^2 + (y-2)^2 < 9');
    const radioMal = analiza('(x-1)^2 + (y-2)^2 < 4');
    const centroMal = analiza('(x+1)^2 + (y-2)^2 < 9');
    expect(mismaRegion(buena, radioMal, V).iguales).toBe(false);
    expect(mismaRegion(buena, centroMal, V).iguales).toBe(false);
  });

  it('dice si al alumno le sobra región o le falta', () => {
    const buena = analiza('|z| < 2');
    const grande = analiza('|z| < 3');
    const pequena = analiza('|z| < 1');
    expect(mismaRegion(buena, grande, V).sobra).toBeGreaterThan(0);
    expect(mismaRegion(buena, grande, V).falta).toBe(0);
    expect(mismaRegion(buena, pequena, V).falta).toBeGreaterThan(0);
    expect(mismaRegion(buena, pequena, V).sobra).toBe(0);
  });

  it('no se pica por el borde: estricta y no estricta son la misma respuesta', () => {
    expect(mismaRegion(analiza('|z| < 2'), analiza('|z| <= 2'), V).iguales).toBe(true);
  });

  it('reconoce la mediatriz escrita de dos maneras: mas lejos de 2 es estar arriba de la bisectriz', () => {
    expect(mismaRegion(analiza('|z-2| > |z-2i|'), analiza('y > x'), V).iguales).toBe(true);
  });

  it('reconoce un semiplano escrito con Re y con x', () => {
    expect(mismaRegion(analiza('Re(z) >= 1'), analiza('x >= 1'), V).iguales).toBe(true);
  });
});

describe('conjunciones', () => {
  it('lee dos condiciones unidas por & o por and', () => {
    expect(analiza('x > 0 & y > 0')).toHaveLength(2);
    expect(analiza('|z| < 2 and Re(z) > 0')).toHaveLength(2);
  });

  it('exige que se cumplan las dos', () => {
    const primerCuadrante = analiza('x > 0 & y > 0');
    expect(cumple(primerCuadrante, 1, 1)).toBe(true);
    expect(cumple(primerCuadrante, 1, -1)).toBe(false);
    expect(cumple(primerCuadrante, -1, 1)).toBe(false);
  });

  it('reconoce un sistema escrito de dos maneras equivalentes', () => {
    const enZ = analiza('|z| < 2 & Re(z) > 0');
    const enXY = analiza('x^2 + y^2 < 4 & x > 0');
    expect(mismaRegion(enZ, enXY, V).iguales).toBe(true);
  });

  it('detecta que falta una de las dos condiciones', () => {
    const dos = analiza('|z| < 2 & Re(z) > 0');
    const una = analiza('|z| < 2');
    expect(mismaRegion(dos, una, V).iguales).toBe(false);
    expect(mismaRegion(dos, una, V).sobra).toBeGreaterThan(0);
  });
});

describe('precedencia del signo', () => {
  it('lee -x^2 como -(x^2), no como (-x)^2', () => {
    // y < -x^2 abre hacia abajo: en x=2 exige y < -4.
    const abajo = analiza('y < -x^2');
    expect(cumple(abajo, 2, -5)).toBe(true);
    expect(cumple(abajo, 2, -1)).toBe(false);
    // Si se leyera (-x)^2 = x^2, el punto (2, -1) SÍ entraría: y < 4.
  });

  it('admite exponentes negativos', () => {
    expect(cumple(analiza('2^-1 = 0.5'), 0, 0)).toBe(true);
  });
});
