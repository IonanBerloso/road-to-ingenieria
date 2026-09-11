/**
 * La ordinaria de Ingeniería Térmica de enero de 2018, la más antigua con el
 * temario de ahora.
 *
 * Las tres cadenas se comprueban solas: en la cámara de mezcla, la exergía que
 * se pierde entre la entrada y la salida es la destruida; en los dos gases, el
 * volumen del helio sale igual por P·V^γ que por la ecuación de estado; y en la
 * tubería, la emisividad es lo que sobra de una resta y tiene que quedar bajo 1.
 */
import { describe, expect, it } from 'vitest';
import { convocatoria } from './corpus';
import { integra } from './numerico';

const cuadra = convocatoria('ingenieria-termica', '2017-2018-ord');
const K = 273.15;
const g = 9.8; // la de los apuntes y la de la resolución

describe('1 · la cámara de mezcla y la definición que decide', () => {
  const id = 'exter1718-ord-1-la-camara-de-mezcla-y-la-definicion-que-decide';
  const T0 = 18 + K;
  const m1 = 2;
  /* Valores de tabla: el vapor, el agua fría y el estado muerto son los de las
     preguntas; h_f y h_g a 10 bar, los de la resolución. s₃ solo está hecho, en
     la pregunta: el YAML no trae s_f ni s_g a 10 bar para rehacerlo. */
  const [h1, s1] = [2827.9, 6.694];
  const [h2, s2] = [83.72, 0.2955];
  const [hf, hg] = [762.81, 2778.1];
  const h3 = hf + 0.8 * (hg - hf);
  const s3 = 5.697;
  const [h0, s0] = [75.34, 0.2673];
  const m2 = (m1 * (h1 - h3)) / (h3 - h2);
  const m3 = m1 + m2;
  const SG = m3 * s3 - m1 * s1 - m2 * s2;

  it('entran 0,395 kg/s de agua fría', () => cuadra.magnitud(id, 'El gasto de agua fría', m2, 'kg/s'));

  it('y se destruyen 41 kW, los mismos por el balance de exergía que por Guy-Stodola', () => {
    const psi = (h: number, s: number) => h - T0 * s;
    const porBalance = m1 * psi(h1, s1) + m2 * psi(h2, s2) - m3 * psi(h3, s3);
    expect(Math.abs(porBalance - T0 * SG)).toBeLessThan(1e-9 * porBalance);
    cuadra.magnitud(id, 'La exergía destruida', porBalance, 'kW');
  });

  it('el rendimiento es 0,977, y la otra definición da 0,874 sobre los mismos datos', () => {
    const af = (h: number, s: number) => h - h0 - T0 * (s - s0);
    const entra = m1 * af(h1, s1) + m2 * af(h2, s2);
    const sale = m3 * af(h3, s3);
    // lo que no sale es exactamente lo destruido: ata los dos apartados
    expect(Math.abs(entra - sale - T0 * SG)).toBeLessThan(1e-9 * entra);
    const otra = (m2 * (af(h3, s3) - af(h2, s2))) / (m1 * (af(h1, s1) - af(h3, s3)));
    expect(otra).toBeCloseTo(0.874, 2);
    cuadra(id, 'El rendimiento exergético', sale / entra);
  });
});

describe('2 · dos gases y un pistón que se mueve solo', () => {
  const id = 'exter1718-ord-2-dos-gases-y-un-piston-que-se-mueve-solo';
  const [mA, mB] = [2, 0.85];
  const [P1, P2, T1, Tf] = [100, 130, 22 + K, 400 + K];
  // las constantes son las de la resolución; el c_v del aire, como c_p − R'
  const [RA, cpA] = [0.287, 1.005];
  const cvA = cpA - RA;
  const [RB, gB] = [2.077, 1.667];
  const cvB = RB / (gB - 1);
  const TB2 = T1 * (P2 / P1) ** ((gB - 1) / gB);
  const VB1 = (mB * RB * T1) / P1;
  // P·V^γ constante, sin pasar por la temperatura del helio
  const VB2 = VB1 * (P1 / P2) ** (1 / gB);
  // las paredes exteriores son rígidas: se conserva la suma de los dos volúmenes
  const Vtot = ((mA * RA + mB * RB) * T1) / P1;
  const TA2 = (P2 * (Vtot - VB2)) / (mA * RA);

  it('el helio acaba a 327,7 K, y su volumen es el mismo por P·V^γ que por la ecuación de estado', () => {
    expect(Math.abs(VB2 - (mB * RB * TB2) / P2) / VB2).toBeLessThan(1e-12);
    cuadra.magnitud(id, 'La temperatura final del helio', TB2, 'K');
  });

  it('el aire, a 555,3 K: lejos de los 673 del foco', () => {
    expect(TA2).toBeLessThan(Tf);
    cuadra.magnitud(id, 'La temperatura final del aire', TA2, 'K');
  });

  it('y el universo genera 0,437 kJ/K, todos en la frontera con el foco', () => {
    /* El calor por dos caminos: la energía de los dos gases juntos, y la del
       aire solo más el trabajo que le hace al helio, integrado sobre su
       isentrópica. */
    const Q = mA * cvA * (TA2 - T1) + mB * cvB * (TB2 - T1);
    const trabajoHelio = integra((V) => P1 * (VB1 / V) ** gB, VB1, VB2, 1e-10);
    expect(trabajoHelio).toBeLessThan(0); // el helio lo recibe
    expect(Math.abs(Q - (mA * cvA * (TA2 - T1) - trabajoHelio)) / Q).toBeLessThan(1e-9);
    const dSHelio = mB * ((cvB + RB) * Math.log(TB2 / T1) - RB * Math.log(P2 / P1));
    expect(Math.abs(dSHelio)).toBeLessThan(1e-12);
    const dSAire = mA * (cpA * Math.log(TA2 / T1) - RA * Math.log(P2 / P1));
    cuadra.magnitud(id, 'La entropía generada en el universo', dSAire + dSHelio - Q / Tf, 'kJ/K');
  });
});

describe('3 · la emisividad que sale de lo que sobra', () => {
  const id = 'exter1718-ord-3-la-emisividad-que-sale-de-lo-que-sobra';
  const [L, c, D1, e, kt] = [18, 0.3, 0.03, 0.01, 55];
  const D2 = D1 + 2 * e;
  const [tE, tS, tNave] = [97, 93, 15];
  // agua a 95 °C y aire a 54,42 °C, del enunciado; σ, la de la pista
  const [rho, cp, kW, PrW, nuW] = [961.4, 4212, 0.677, 1.85, 3.0889e-7];
  const [kA, PrA, nuA] = [0.02767, 0.7217, 1.84e-5];
  const sigma = 5.67e-8;
  const m = (rho * Math.PI * D1 * D1 * c) / 4;
  const Q = m * cp * (tE - tS);

  // el Reynolds por el gasto, 4ṁ/(πDμ) con μ = ρν, sin volver a la velocidad
  const Re = (4 * m) / (Math.PI * D1 * rho * nuW);
  const h1 = (0.023 * Re ** 0.8 * PrW ** 0.3 * kW) / D1;
  const th2 = (tE + tS) / 2 - Q * (1 / (h1 * Math.PI * D1 * L) + Math.log(D2 / D1) / (2 * Math.PI * kt * L));

  const tCar = (th2 + tNave) / 2;
  const Ra = ((g / (tCar + K)) * (th2 - tNave) * D2 ** 3 * PrA) / nuA ** 2;
  const h2 = (0.53 * Ra ** 0.25 * kA) / D2;
  const A2 = Math.PI * D2 * L;
  const Qconv = h2 * A2 * (th2 - tNave);

  it('el agua pierde 3.435 W en los dieciocho metros', () =>
    cuadra.magnitud(id, 'El calor que pierde el agua', Q, 'W'));

  it('la cara exterior está a 93,85 °C: poco más de un grado por debajo del agua', () => {
    expect(Re).toBeGreaterThan(10000);
    expect((tE + tS) / 2 - th2).toBeLessThan(1.2);
    cuadra.magnitud(id, 'La temperatura de la superficie exterior', th2, '°C');
  });

  it('la convección natural se lleva 1.842 W, a la temperatura de las propiedades del enunciado', () => {
    // la media entre superficie y nave es la temperatura a la que el enunciado da el aire
    expect(tCar).toBeCloseTo(54.42, 1);
    expect(Ra).toBeLessThan(1e9);
    cuadra.magnitud(id, 'El calor que se va por convección natural', Qconv, 'W');
  });

  it('y la emisividad es 0,885: casi la mitad del calor se va radiando', () => {
    const Qrad = Q - Qconv;
    const [Ts, Tn] = [th2 + K, tNave + K];
    const eps = Qrad / (A2 * sigma * (Ts ** 4 - Tn ** 4));
    // la misma, con el coeficiente de radiación linealizado: T⁴ − T∞⁴ = (T² + T∞²)(T + T∞)(T − T∞)
    const hRad = sigma * (Ts ** 2 + Tn ** 2) * (Ts + Tn);
    expect(Math.abs(eps - Qrad / (hRad * A2 * (Ts - Tn))) / eps).toBeLessThan(1e-12);
    expect(eps).toBeGreaterThan(0);
    expect(eps).toBeLessThan(1);
    expect(Qrad / Q).toBeCloseTo(0.46, 1);
    cuadra(id, 'La emisividad', eps);
  });
});
