/**
 * La ordinaria de Ingeniería Térmica de enero de 2016, de la que solo entra el
 * ejercicio 3: los otros dos son una turbina de gas y un condensador de R-134a,
 * fuera del temario. La nota del enunciado trae la convección hecha; aquí se
 * rehace desde el Rayleigh, y la radiación sale por la red de dos resistencias
 * y por la forma cerrada de un cuerpo pequeño en un recinto grande.
 */
import { describe, expect, it } from 'vitest';
import { convocatoria } from './corpus';

const cuadra = convocatoria('ingenieria-termica', '2015-2016-ord');
const K = 273.15;

describe('3 · la plancha de pie sobre la tabla', () => {
  const id = 'exter1516-ord-3-la-plancha-de-pie-sobre-la-tabla';
  const [tHab, tSup, A, eps, H] = [20, 200, 0.037, 0.6, 0.25];
  const [kPlaca, e] = [20, 0.005];
  const sigma = 5.67e-8; // la del desarrollo
  // la nota del enunciado: el aire a la temperatura de película, 110 °C
  const [Ra, kAire] = [8.767e7, 0.03165];
  const h = (0.59 * Ra ** 0.25 * kAire) / H;
  const Qconv = h * A * (tSup - tHab);
  const [Ts, Th] = [tSup + K, tHab + K];
  // red de dos resistencias: la superficial de la plancha y la geométrica con F = 1
  const Qrad = (sigma * (Ts ** 4 - Th ** 4)) / ((1 - eps) / (eps * A) + 1 / (1 * A));

  it('la convección de la nota sale del Rayleigh: 7,228 W/(m²·K) y 48,14 W', () => {
    expect(Ra).toBeLessThan(1e9); // laminar: vale la correlación de 0,59
    expect(Math.abs(h - 7.228) / 7.228).toBeLessThan(1e-3);
    expect(Math.abs(Qconv - 48.14) / 48.14).toBeLessThan(1e-3);
  });

  it('la radiación se lleva 53,72 W y gana a la convección', () => {
    // paredes negras y F = 1: la red se reduce a ε·σ·A·(T⁴ − T∞⁴)
    expect(Math.abs(Qrad - eps * sigma * A * (Ts ** 4 - Th ** 4))).toBeLessThan(1e-9);
    expect(Qrad).toBeGreaterThan(Qconv);
    cuadra.magnitud(id, 'El calor por radiación', Qrad, 'W');
  });

  it('y la cara interior está a 200,7 °C: los 5 mm de placa se llevan siete décimas', () => {
    const tInt = tSup + ((Qconv + Qrad) * e) / (kPlaca * A);
    expect(tInt - tSup).toBeLessThan(1);
    cuadra.magnitud(id, 'La temperatura de la cara interior', tInt, '°C');
  });
});
