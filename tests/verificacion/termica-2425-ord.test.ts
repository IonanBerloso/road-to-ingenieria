/**
 * La ordinaria de Ingeniería Térmica de enero de 2025.
 *
 * Tres ejercicios que enseñan a desconfiar de una palabra del enunciado: un
 * compresor «reversible» que destruye exergía, un depósito «adiabático» que no
 * pierde un julio y sí 107 kJ de trabajo posible, y una pared cuyo dato de más
 * —la altura— solo sirve para el Nusselt. Ese Nusselt es el único paso que no
 * cuadra: la cuenta sale, lo que falla es la tolerancia de su casilla.
 */
import { describe, expect, it } from 'vitest';
import { convocatoria } from './corpus';

const cuadra = convocatoria('ingenieria-termica', '2024-2025-ord');
const K = 273.15;

describe('1 · el compresor reversible que destruye exergía', () => {
  const id = 'exter2425-ord-1-el-compresor-reversible-que-destruye-exergia';
  // los datos del helio, del enunciado
  const [m, cp, cv, R, gamma] = [2, 5.19, 3.11, 2.077, 1.667];
  const [T1, T2, T0, rc] = [20 + K, 90 + K, 15 + K, 5];
  const dS = m * (cp * Math.log(T2 / T1) - R * Math.log(rc));
  const n = Math.log(rc) / (Math.log(rc) - Math.log(T2 / T1));
  // −∫v·dP de la politrópica, en régimen estacionario
  const W = m * (n / (n - 1)) * R * (T1 - T2);
  const dH = m * cp * (T2 - T1);
  const Q = dH + W; // primer principio: Q − W = ΔH

  it('el helio pierde 4,462 kW/K: la presión pesa tres veces lo que la temperatura', () => {
    expect(dS).toBeLessThan(0);
    cuadra.magnitud(id, 'La variación de entropía del helio', dS, 'kW/K');
  });

  it('el exponente es 1,1535, mucho más cerca del isotermo que de γ', () => {
    expect(T1 * rc ** ((n - 1) / n)).toBeCloseTo(T2, 9);
    cuadra(id, 'El exponente politrópico', n);
  });

  it('consume 2.184,5 kW, igual por la integral que por el calor específico politrópico', () => {
    /* El otro camino: el calor con c_n = c_v(γ−n)/(1−n) y el primer principio.
       Los datos del helio no son del todo coherentes —c_p − c_v = 2,080 contra
       R' = 2,077—, y eso deja los dos caminos a un 0,1 % el uno del otro. */
    const cn = (cv * (gamma - n)) / (1 - n);
    const porElCalor = m * cn * (T2 - T1) - dH;
    expect(Math.abs(porElCalor - W) / Math.abs(W)).toBeLessThan(2e-3);
    cuadra.magnitud(id, 'La potencia del compresor', W, 'kW');
  });

  it('y el universo destruye 172,9 kW, los mismos por el balance de exergía que por Guy-Stodola', () => {
    // el calor que la pregunta le da al alumno, −1.457,9 kW, sale aquí al 0,1 %
    expect(Math.abs(Q + 1457.9) / 1457.9).toBeLessThan(2e-3);
    // Guy-Stodola sobre el universo: el helio más el ambiente, que recibe −Q a T₀
    const SG = dS - Q / T0;
    /* El balance de exergía del compresor: entra el trabajo, el helio gana
       exergía de flujo y el calor llega al ambiente a T₀, ya sin exergía. Es una
       resta de 1.459 menos 1.286, así que un 0,1 % en el calor es un 1 % aquí. */
    const porBalance = -W - (dH - T0 * dS);
    expect(SG).toBeGreaterThan(0);
    expect(Math.abs(porBalance - T0 * SG)).toBeLessThan(1e-9 * porBalance);
    cuadra.magnitud(id, 'La exergía destruida en el universo', porBalance, 'kW');
  });
});

describe('2 · cinco litros calientes sobre quince fríos', () => {
  const id = 'exter2425-ord-2-cinco-litros-calientes-sobre-quince-frios';
  const v = 0.001; // m³/kg, el que da la pregunta: los litros son kilos
  const [mA, mB] = [0.005 / v, 0.015 / v];
  const c = 4.186;
  const [TA, TB, T0] = [90 + K, 20 + K, 15 + K];
  const T2 = (mA * TA + mB * TB) / (mA + mB);
  const SG = mB * c * Math.log(T2 / TB) + mA * c * Math.log(T2 / TA);

  it('la mezcla acaba a 37,5 °C, muy lejos de la media de 90 y 20', () => {
    // lo que cede el agua caliente lo gana la fría, y en kelvin: la casilla está en Celsius
    expect(Math.abs(mA * c * (T2 - TA) + mB * c * (T2 - TB))).toBeLessThan(1e-9);
    expect(T2 - K).toBeLessThan((90 + 20) / 2);
    cuadra.magnitud(id, 'La temperatura de equilibrio', T2, 'K');
  });

  it('el agua fría gana 0,243 kJ/(kg·K)', () =>
    cuadra.magnitud(id, 'La entropía específica del agua que ya estaba', c * Math.log(T2 / TB), 'kJ/(kg K)'));

  it('y se destruyen 107,4 kJ sin que salga un julio, igual por los dos caminos', () => {
    /* El balance de exergía de un sistema cerrado, rígido y adiabático: lo
       destruido es lo que baja la exergía de las dos masas, sumadas. */
    const dB = (mi: number, Ti: number) => mi * (c * (T2 - Ti) - T0 * c * Math.log(T2 / Ti));
    const porBalance = -(dB(mA, TA) + dB(mB, TB));
    expect(SG).toBeGreaterThan(0);
    expect(Math.abs(porBalance - T0 * SG)).toBeLessThan(1e-9 * porBalance);
    cuadra.magnitud(id, 'La exergía destruida', porBalance, 'kJ');
  });
});

describe('3 · la pared por dos caminos, y el dato que parecía sobrar', () => {
  const id = 'exter2425-ord-3-la-pared-por-dos-caminos-y-el-numero-que-sobraba';
  const [k, H, L] = [12, 1.5, 0.3];
  const [t1, tAire, q] = [22, 5, 80]; // °C, °C, W/m²
  const kf = 0.02458;

  /* Analíticamente: θ'' = 0 da θ(x) = C₁x + C₂; la condición de primera
     especie fija C₂ = θ₁ y la de segunda, −k·C₁ = q. */
  const theta = (x: number) => (-q / k) * x + t1;
  const t2 = theta(L);

  it('la cara exterior está a 20 °C, por la integral y por la analogía', () => {
    expect(Math.abs(t2 - (t1 - q * (L / k)))).toBeLessThan(1e-12);
    cuadra.magnitud(id, 'La temperatura de la cara exterior', t2, '°C');
  });

  it('la película tiene 5,33 W/(m²·K), por Newton y por el circuito entero', () => {
    const porNewton = q / (t2 - tAire);
    // el circuito completo, 80 = (22 − 5)/(L/k + 1/h), sin pasar por θ₂
    const porCircuito = 1 / ((t1 - tAire) / q - L / k);
    expect(Math.abs(porNewton - porCircuito)).toBeLessThan(1e-12);
    cuadra.magnitud(id, 'El coeficiente de convección', porCircuito, 'W/(m^2 K)');
  });

  it('el Nusselt es 325,5, con la altura y no el espesor', () => {
    /* En la primera pasada no cuadró, y no por la cuenta: la casilla pedía
       325,5 con tolerancia absoluta 0,01, y la cuenta exacta —325,47— o la del
       h = 5,33 redondeado del desarrollo —325,26— se rechazaban. El valor está
       a la décima y la tolerancia pedía centésimas. Corregida a 1 el 12 de
       septiembre de 2026, y las dos entran. */
    const Nu = ((q / (t2 - tAire)) * H) / kf;
    expect(Math.abs(Nu - 325.47)).toBeLessThan(0.005);
    cuadra(id, 'El número de Nusselt', Nu);
    cuadra(id, 'El número de Nusselt', (5.33 * H) / kf);
  });
});
