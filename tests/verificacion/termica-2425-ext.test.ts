/**
 * La extraordinaria de Ingeniería Térmica de febrero de 2025.
 *
 * El examen que pide los dos caminos con todas las letras: la exergía destruida
 * del ejercicio 1 «de una de las dos maneras» y luego «de la otra», y aquí se
 * comprueba que dan lo mismo en vez de creerlo. Del 3, el balance térmico al
 * revés, solo se recalcula la mitad de fuera: el lado del agua pide propiedades
 * que el corpus no publica, y se dice abajo.
 */
import { describe, expect, it } from 'vitest';
import { convocatoria } from './corpus';

const cuadra = convocatoria('ingenieria-termica', '2024-2025-ext');
const K = 273.15;

describe('1 · el bloque de acero y el agua que apenas se entera', () => {
  const id = 'exter2425-ext-1-el-bloque-de-acero-y-el-agua-que-apenas-se-entera';
  // capacidades térmicas en kJ/K; los 20 litros de agua, a un kilo por litro
  const cAcero = 5 * 0.44;
  const cAgua = 20 * 4.186;
  const [tAcero, tFinal, T0] = [80, 25, 15 + K];
  // ΔU = 0: lo que baja el acero por su capacidad lo sube el agua por la suya
  const tAgua = tFinal - (cAcero * (tAcero - tFinal)) / cAgua;
  const SG =
    cAcero * Math.log((tFinal + K) / (tAcero + K)) + cAgua * Math.log((tFinal + K) / (tAgua + K));

  it('el agua estaba a 23,55 °C: sube grado y medio mientras el acero baja cincuenta y cinco', () => {
    expect(tFinal - tAgua).toBeLessThan(1.5);
    cuadra.magnitud(id, 'La temperatura inicial del agua', tAgua, '°C');
  });

  it('se generan 0,0344 kJ/K', () => cuadra.magnitud(id, 'La entropía generada', SG, 'kJ/K'));

  it('y se destruyen 9,91 kJ, por el balance de exergía y por Guy-Stodola', () => {
    /* Depósito rígido y adiabático: sin calor ni trabajo, lo destruido es lo
       que baja la exergía del conjunto, ΔU − T₀ΔS con ΔU = 0 y ΔV = 0. */
    const dB = (C: number, t: number) => C * (tFinal - t) - T0 * C * Math.log((tFinal + K) / (t + K));
    const porBalance = -(dB(cAcero, tAcero) + dB(cAgua, tAgua));
    expect(Math.abs(porBalance - T0 * SG)).toBeLessThan(1e-9 * porBalance);
    cuadra.magnitud(id, 'La exergía destruida', porBalance, 'kJ');
  });
});

describe('2 · el generador que rinde el 92 % y también el 11 %', () => {
  const id = 'exter2425-ext-2-el-generador-que-rinde-el-noventa-y-dos-y-el-once';
  const [qNominal, qUtil] = [200, 184]; // kW, las dos filas de la tabla del fabricante
  const V = 16500 / 3600; // m³/s, medidos a la entrada
  const cp = 1.0045;
  const [T1, Tzona, Tgases, T0] = [11 + K, 400 + K, 70 + K, 10 + K];
  /* La presión del aire y su R' no los da el enunciado: la resolución toma la
     atmósfera estándar, 101,325 kPa, y 0,287 kJ/(kg·K). */
  const [P, R] = [101.325, 0.287];
  const m = (P * V) / (R * T1);

  it('pasan 5,698 kg/s, con la densidad a la temperatura de entrada', () =>
    cuadra.magnitud(id, 'El gasto de aire', m, 'kg/s'));

  // el salto sin pasar por el gasto: ΔT = Q·R'·T₁/(P·V̇·c_p)
  const dT = (qUtil * R * T1) / (P * V * cp);
  const T2 = T1 + dT;

  it('el aire sale a 43,15 °C, calentado solo por la potencia útil', () => {
    expect(Math.abs(dT - qUtil / (m * cp))).toBeLessThan(1e-9);
    cuadra.magnitud(id, 'La temperatura de salida', T2 - K, '°C');
  });

  it('y se destruyen 102,8 kW de los 115,9 que entran, igual por los dos caminos', () => {
    const qGases = qNominal - qUtil;
    const SG = m * cp * Math.log(T2 / T1) - (qNominal / Tzona - qGases / Tgases);
    /* El balance de exergía: entra la del calor a 400 °C, salen la de los gases
       a 70 °C y la que gana el aire, y lo que falta es lo destruido. */
    const entra = qNominal * (1 - T0 / Tzona);
    const porBalance = entra - qGases * (1 - T0 / Tgases) - m * cp * (dT - T0 * Math.log(T2 / T1));
    expect(Math.abs(porBalance - T0 * SG)).toBeLessThan(1e-9 * porBalance);
    expect(porBalance / entra).toBeGreaterThan(0.85);
    cuadra.magnitud(id, 'La exergía destruida', porBalance, 'kW');
  });
});

describe('3 · el viento que sale de una pérdida de calor', () => {
  const id = 'exter2425-ext-3-el-viento-que-sale-de-una-perdida-de-calor';
  const L = 6;
  const D1 = 0.1;
  const D2 = D1 + 2 * 0.004; // el tubo
  const D3 = D2 + 2 * 0.01; // el aislante
  const [Q, tAire, kTubo, kAisl] = [1000, 15, 20, 0.08];
  const [k, nu, Pr] = [0.02495, 1.4928e-5, 0.7316]; // el aire a la temperatura de película
  /* Las dos temperaturas intermedias se toman de las preguntas, no se
     recalculan: la media del agua, 79,21 °C, necesita su calor específico, y la
     cara del aislante, 19,95 °C, la película del agua a 80 °C. Ninguna de las
     dos propiedades está en el corpus, y buscarlas en una tabla sería meter
     aquí un dato sin fuente. Lo que sí se comprueba es que las dos cifras son
     compatibles con el tubo y el aislante que hay entre ellas. */
  const [tAgua, tSup] = [79.21, 19.95];
  const A3 = Math.PI * D3 * L;

  it('el coeficiente global referido al exterior es 6,455 W/(m²·K)', () => {
    const rTubo = Math.log(D2 / D1) / (2 * Math.PI * kTubo * L);
    const rAisl = Math.log(D3 / D2) / (2 * Math.PI * kAisl * L);
    // tubo y aislante se llevan 56 de los 59 grados, y a la película del agua le queda algo positivo
    const rAgua = (tAgua - tSup) / Q - rTubo - rAisl;
    expect(rAgua).toBeGreaterThan(0);
    expect(rAisl / (rTubo + rAisl)).toBeGreaterThan(0.99);
    cuadra.magnitud(id, 'El coeficiente global referido al exterior', Q / (A3 * (tAgua - tAire)), 'W/(m^2 K)');
  });

  it('la película del viento tiene 83,8 W/(m²·K), trece veces el global', () =>
    cuadra.magnitud(id, 'El coeficiente del viento', Q / (A3 * (tSup - tAire)), 'W/(m^2 K)'));

  it('y el viento sopla a 31 m/s, con la única correlación que cae en su propio rango', () => {
    // Nu = h₃·D₃/k = Q/(π·L·Δθ·k): el diámetro se cancela y no hace falta pasar por h
    const Nu = Q / (Math.PI * L * (tSup - tAire) * k);
    const reynolds = (C: number, e: number) => (Nu / (C * Pr ** (1 / 3))) ** (1 / e);
    const [reBajo, reAlto] = [reynolds(0.26, 0.6), reynolds(0.076, 0.7)];
    expect(reBajo).toBeGreaterThan(2e5); // la de 1000 < Re < 2·10⁵ se sale de su rango
    expect(reAlto).toBeGreaterThan(2e5);
    expect(reAlto).toBeLessThan(1e6);
    cuadra.magnitud(id, 'La velocidad del viento', (reAlto * nu) / D3, 'm/s');
  });
});
