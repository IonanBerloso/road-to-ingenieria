/**
 * La ordinaria de Ingeniería Térmica de enero de 2026, la más cercana a quien
 * se examine en 2027. Sus tres ejercicios van partidos en siete piezas que se
 * pasan los resultados como dato; aquí se rehace la cadena desde el primer
 * enunciado y se comprueba que esos datos son los que salen. Una respuesta no
 * cuadra, y no por la física: el Reynolds del ejercicio 3 está bien y se
 * publica con una tolerancia absoluta de 0,02 que ningún alumno alcanza.
 */
import { describe, expect, it } from 'vitest';
import { convocatoria } from './corpus';
import { integra } from './numerico';

const cuadra = convocatoria('ingenieria-termica', '2025-2026-ord');
const K = 273.15;

describe('1a · el exponente que sale del calor', () => {
  const id = 'exter2526-ord-1-el-exponente-que-sale-del-calor';
  const [m, P1, V1, R, gamma] = [3, 600, 0.8, 0.287, 1.4];
  const T2 = 27 + K;
  const Q = -240; // se ceden al medio
  const T1 = (P1 * V1) / (m * R);
  const cv = R / (gamma - 1);
  const cp = gamma * cv;
  const cn = Q / (m * (T2 - T1));
  const n = (cn - cp) / (cn - cv);

  it('el aire empieza a 557,5 K', () => cuadra.magnitud(id, 'La temperatura inicial', T1, 'K'));

  it('el calor específico del proceso es 0,3107 kJ/(kg·K): positivo, y por debajo de cv', () => {
    expect(cn).toBeGreaterThan(0);
    expect(cn).toBeLessThan(cv);
    cuadra.magnitud(id, 'El calor específico del proceso', cn, 'kJ/(kg K)');
  });

  it('y el exponente, 1,705, sale igual por el primer principio sin pasar por cn', () => {
    /* W = Q − m·cv·ΔT, y el trabajo de una politrópica es m·R·(T1 − T2)/(n − 1):
       despejando, n = 1 + m·R·(T1 − T2)/W. */
    const W = Q - m * cv * (T2 - T1);
    const porTrabajo = 1 + (m * R * (T1 - T2)) / W;
    expect(Math.abs(porTrabajo - n)).toBeLessThan(1e-9);
    expect(n).toBeGreaterThan(gamma); // una expansión que además cede calor
    cuadra(id, 'El exponente', n);
  });
});

describe('1b · un proceso reversible que genera entropía', () => {
  const id = 'exter2526-ord-1-la-entropia-que-genera-el-universo';
  const m = 3;
  const [T1, P1, T2, P2] = [557.5, 600, 27 + K, 134.144];
  const [n, cn] = [1.705, 0.3107];
  const [cv, cp, R] = [0.7175, 1.0045, 0.287];
  const TMC = 20 + K;
  const dS = m * (cp * Math.log(T2 / T1) - R * Math.log(P2 / P1));

  it('los datos de rescate son los del apartado anterior: la P2 sale de la politrópica', () => {
    const P2pol = P1 * (T2 / T1) ** (n / (n - 1));
    expect(Math.abs(P2pol - P2) / P2).toBeLessThan(0.005);
  });

  it('el aire pierde 0,5776 kJ/K de entropía', () => {
    expect(dS).toBeLessThan(0);
    cuadra.magnitud(id, 'La variación de entropía del aire', dS, 'kJ/K');
  });

  it('y el calor se lleva lo mismo, integrado a lo largo de la politrópica sin usar cn', () => {
    /* δQ = m·cv·dT + P·dV punto a punto sobre P·V^n = cte, dividido por la
       temperatura del gas en ese punto. La resolución va por m·cn·ln(T2/T1). */
    const V1 = (m * R * T1) / P1;
    const V2 = (m * R * T2) / P2;
    const P = (V: number) => P1 * (V1 / V) ** n;
    const T = (V: number) => (P(V) * V) / (m * R);
    const dTdV = (V: number) => ((1 - n) * P(V)) / (m * R);
    const integral = integra((V) => (m * cv * dTdV(V) + P(V)) / T(V), V1, V2, 1e-9);
    expect(Math.abs(integral - m * cn * Math.log(T2 / T1)) / Math.abs(integral)).toBeLessThan(0.002);
    // y la generada dentro del cilindro es cero: el proceso es reversible
    expect(Math.abs(dS - integral) / Math.abs(dS)).toBeLessThan(0.005);
    cuadra.magnitud(id, 'La entropía que se va con el calor', integral, 'kJ/K');
  });

  it('y el universo genera 0,2415 kJ/K, todo en la caída del calor hasta el medio', () =>
    cuadra.magnitud(id, 'La entropía generada en el universo', dS + 240 / TMC, 'kJ/K'));
});

describe('1c · la exergía que el universo destruye', () => {
  const id = 'exter2526-ord-1-la-exergia-que-el-universo-destruye';
  const m = 3;
  const [T1, V1, T2, V2] = [557.5, 0.8, 27 + K, 1.9255];
  const [Q, Wdato] = [-240, 314.25];
  const [T0, P0, TMC] = [15 + K, 100, 20 + K];
  const [cv, R] = [0.7175, 0.287];
  const dU = m * cv * (T2 - T1);
  const dS = m * (cv * Math.log(T2 / T1) + R * Math.log(V2 / V1));
  /* El trabajo por el primer principio, con el calor del enunciado: así el
     balance entero es coherente y los dos caminos a la destruida pueden
     coincidir exactamente. El 314,25 del enunciado se comprueba aparte. */
  const W = Q - dU;
  const sistema = dU + P0 * (V2 - V1) - T0 * dS;
  // el medio, con los tres signos cambiados
  const [Qmc, Wmc, dVmc] = [-Q, -W, -(V2 - V1)];
  const medio = (1 - T0 / TMC) * Qmc - (Wmc - P0 * dVmc);

  it('el trabajo del enunciado, 314,25 kJ, sale por la integral de la politrópica y por el primer principio', () => {
    // n de T·V^(n−1) = cte, y W = m·R·(T1 − T2)/(n − 1)
    const n = 1 + Math.log(T1 / T2) / Math.log(V2 / V1);
    const porIntegral = (m * R * (T1 - T2)) / (n - 1);
    expect(Math.abs(porIntegral - Wdato) / Wdato).toBeLessThan(0.002);
    expect(Math.abs(W - Wdato) / Wdato).toBeLessThan(0.002);
  });

  it('el sistema pierde 275,35 kJ de exergía', () => {
    expect(sistema).toBeLessThan(0);
    cuadra.magnitud(id, 'La exergía del sistema', sistema, 'kJ');
  });

  it('el medio gana 205,79, casi todo por el trabajo', () => {
    expect((1 - T0 / TMC) * Qmc).toBeLessThan(0.05 * medio);
    cuadra.magnitud(id, 'La exergía del medio circundante', medio, 'kJ');
  });

  it('y el universo destruye 69,56 kJ, los mismos por los dos caminos', () => {
    const SG = dS + Qmc / TMC;
    const porBalance = -(sistema + medio);
    expect(Math.abs(porBalance - T0 * SG)).toBeLessThan(1e-9 * porBalance);
    // y con la entropía generada que da el enunciado, 0,2415 kJ/K
    expect(Math.abs(T0 * 0.2415 - porBalance) / porBalance).toBeLessThan(0.01);
    cuadra.magnitud(id, 'La exergía destruida', porBalance, 'kJ');
  });
});

describe('2a · cuánta agua hace falta para condensar un kilo de vapor', () => {
  const id = 'exter2526-ord-2-cuanta-agua-para-condensar-un-kilo';
  const [m1, v1] = [0.7, 3];
  // la tabla de saturación a 0,5 bar del enunciado
  const [vf, vg, hf, hg] = [0.0010299, 3.24, 340.54, 2645.2];
  const cp = 4.186;
  const x1 = (v1 - vf) / (vg - vf);
  const h1 = x1 * hg + (1 - x1) * hf;

  it('el vapor entra con título 0,926: dentro de la campana, cerca del borde', () => {
    expect(v1).toBeLessThan(vg);
    cuadra(id, 'El título del vapor a la entrada', x1);
  });

  it('con 2.474,4 kJ/kg', () => cuadra.magnitud(id, 'La entalpía a la entrada', h1, 'kJ/kg'));

  it('y hacen falta 20,99 kg/s de agua: treinta veces el vapor', () => {
    /* Sin pasar por h1: lo que suelta cada kilo de vapor al salir como líquido
       saturado es solo su parte de vapor por el calor latente, x·(h'' − h'). */
    const suelta = m1 * x1 * (hg - hf);
    expect(Math.abs(suelta - m1 * (h1 - hf))).toBeLessThan(1e-9);
    const mw = suelta / (cp * (35 - 18));
    expect(mw / m1).toBeCloseTo(30, 0);
    cuadra.magnitud(id, 'El gasto de refrigeración', mw, 'kg/s');
  });
});

describe('2b · la bomba, y el signo de un trabajo que entra', () => {
  const id = 'exter2526-ord-2-la-bomba-que-consume-seis-kilovatios';
  const [h2, m] = [340.54, 0.7];
  const W = -6; // consume: el trabajo entra
  const h3 = h2 - W / m;

  it('el agua sale con 349,11 kJ/kg, más de lo que le daría una bomba ideal', () => {
    // v·ΔP con el volumen del líquido que usa la resolución, 0,00103 m³/kg
    expect(0.00103 * (5000 - 50)).toBeLessThan(h3 - h2);
    cuadra.magnitud(id, 'La entalpía de salida', h3, 'kJ/kg');
  });
});

/* La tubería del ejercicio 3, que el sitio parte en dos piezas. Sus datos van
   fuera porque la segunda pieza se comprueba contra la primera. */
const tubo = {
  Q: 0.3 * 4500 * (250 - 150), // W: 0,3 kg/s de agua de 250 a 150 °C, cp = 4.500 J/(kg·K)
  tAgua: (250 + 150) / 2,
  tSup: 110.7,
  tAire: 10,
  Rci: 2.2369e-4,
  // por metro de tubo, en K·m/W: 3 cm de acero y 6 cm de aislante sobre un radio de 0,25 m
  acero: Math.log(0.28 / 0.25) / (2 * Math.PI * 52),
  aislante: Math.log(0.34 / 0.28) / (2 * Math.PI * 0.75),
};
/* La longitud: convección interior, acero y aislante llevan el agua de sus
   200 °C a los 110,7 de la superficie, y las dos conducciones van con 1/L. */
const longitud = (tubo.acero + tubo.aislante) / ((tubo.tAgua - tubo.tSup) / tubo.Q - tubo.Rci);

describe('3a · qué resistencia manda en la tubería', () => {
  const id = 'exter2526-ord-3-que-resistencia-manda-en-la-tuberia';
  const { Q, tAgua, tSup, tAire, Rci } = tubo;
  const Rce = (tSup - tAire) / Q;

  it('el agua pierde 135 kW', () => cuadra.magnitud(id, 'La potencia térmica', Q, 'W'));

  it('la película exterior ofrece 7,46·10⁻⁴ K/W, por diferencia y sin correlación', () =>
    cuadra.magnitud(id, 'La resistencia de convección exterior', Rce, 'K/W'));

  it('y se lleva el 53 %, con las cuatro por separado sobre unos 95 m de tubo', () => {
    const [R1, R2] = [tubo.acero / longitud, tubo.aislante / longitud];
    const total = Rci + R1 + R2 + Rce;
    expect(longitud).toBeGreaterThan(94);
    expect(longitud).toBeLessThan(96);
    // en serie, la parte de la resistencia es la parte del salto de temperatura
    expect(Math.abs(Rce / total - (tSup - tAire) / (tAgua - tAire))).toBeLessThan(1e-12);
    expect(R1 / total).toBeLessThan(0.005); // el acero no pinta nada
    cuadra(id, 'El porcentaje de la resistencia dominante', (100 * Rce) / total);
  });
});

describe('3b · la convección de dentro, y por qué apenas pesa', () => {
  const id = 'exter2526-ord-3-el-agua-que-corre-por-dentro-de-la-tuberia';
  const [D, m] = [0.5, 0.3];
  const [rho, k, Pr, nu] = [864.3, 0.663, 0.91, 1.55039e-7];
  const c = m / ((rho * Math.PI * D * D) / 4);
  // por el gasto, sin pasar por la velocidad: Re = 4ṁ/(π·D·ρ·ν)
  const Re = (4 * m) / (Math.PI * D * rho * nu);
  const h = (0.023 * Re ** 0.8 * Pr ** 0.3 * k) / D; // el agua se enfría: exponente 0,3

  it('el agua va a 1,8 mm/s', () => cuadra.magnitud(id, 'La velocidad del agua', c, 'm/s'));

  it('el Reynolds, 5.701: turbulento por poco, y bien calculado aunque la casilla no lo acepte', () => {
    expect(Math.abs(Re - (c * D) / nu)).toBeLessThan(1e-9 * Re);
    expect(Re).toBeGreaterThan(2100);
    expect(Re).toBeLessThan(10000);
    expect(Re).toBeCloseTo(5701, 0);
    /* En la primera pasada no cuadró, y no por la cuenta: el paso publicaba
       5704 con `tolerancia: 0.02`, que en un `numero` es absoluta —igual en
       EjercicioGuiado—, y la cuenta exacta, 5.701, se rechazaba. Era una
       tolerancia relativa escrita en un campo absoluto. Corregida a 50 el 12
       de septiembre de 2026. */
    cuadra(id, 'El Reynolds', Re);
  });

  it('el coeficiente de película es de 30 W/(m²·K)', () =>
    cuadra.magnitud(id, 'El coeficiente de película interior', h, 'W/(m^2 K)'));

  it('y es el que esconde la R_ci que da la otra pieza: con él, la longitud sale igual', () => {
    const conEstaH = ((1 / (h * Math.PI * D) + tubo.acero + tubo.aislante) * tubo.Q) / (tubo.tAgua - tubo.tSup);
    expect(Math.abs(conEstaH - longitud) / longitud).toBeLessThan(0.005);
  });
});
