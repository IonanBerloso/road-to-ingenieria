/**
 * La ordinaria de Ingeniería Térmica de enero de 2026, la más cercana a quien
 * se examine en 2027. Sus tres ejercicios van partidos en ocho piezas que se
 * pasan los resultados como dato; aquí se rehace la cadena desde el primer
 * enunciado y se comprueba que esos datos son los que salen. Una respuesta no
 * cuadra, y no por la física: el Reynolds del ejercicio 3 está bien y se
 * publica con una tolerancia absoluta de 0,02 que ningún alumno alcanza.
 * Los trece apartados están resueltos desde la fase F2; los de la bomba se
 * comprueban además contra IAPWS-95, porque restan números casi iguales.
 */
import { describe, expect, it } from 'vitest';
import { convocatoria } from './corpus';
import tablas from '../../src/content/tablas/vapor-de-agua.json';
import { estadoDePT, saturacionDeP } from '../../src/lib/iapws95';
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

  it('su rendimiento exergético es del 74,7 %: lo que gana el medio entre lo que pierde el sistema', () => {
    const eta = medio / -sistema;
    expect(Math.abs(eta - (1 + (sistema + medio) / -sistema))).toBeLessThan(1e-12);
    expect(eta).toBeLessThan(1);
    cuadra(id, 'El rendimiento exergético', eta);
  });
});

describe('2a · cuánta agua hace falta para condensar un kilo de vapor', () => {
  const id = 'exter2526-ord-2-cuanta-agua-para-condensar-un-kilo';
  const [m1, v1] = [0.7, 3];
  /* La tabla de saturación a 0,5 bar de las tablas del sitio, la rejilla del
     anexo (fase F1): el enunciado ya no da los valores. [p, T, v', v'', h', h'', s', s''] */
  const sat = tablas.saturacionP.filas.find((r) => r[0] === 0.5)!;
  const [vf, vg, hf, hg] = [sat[2], sat[3], sat[4], sat[5]];
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

describe('2b · el condensador, que tira cuatro quintas partes de la exergía del vapor', () => {
  const id = 'exter2526-ord-2-la-exergia-que-destruye-el-condensador';
  const sat = tablas.saturacionP.filas.find((r) => r[0] === 0.5)!; // [p, T, v', v'', h', h'', s', s'']
  const [vf, vg, hf, hg, sf, sg] = sat.slice(2);
  const [m1, cp, T0] = [0.7, 4.186, 288]; // T0 = 288 K, como la resolución
  const x1 = (3 - vf) / (vg - vf);
  const [h1, s1] = [hf + x1 * (hg - hf), sf + x1 * (sg - sf)];
  const [h2, s2] = [hf, sf];
  const mw = (m1 * (h1 - h2)) / (cp * (35 - 18));
  const pierdeVapor = m1 * (h1 - h2 - T0 * (s1 - s2));
  const [Te, Ts] = [18 + 273, 35 + 273];
  const ganaAgua = mw * (cp * (Ts - Te) - T0 * cp * Math.log(Ts / Te));

  it('el vapor pierde 280,08 kW de exergía, de 1.493,7 kW de energía', () => {
    expect(pierdeVapor).toBeLessThan(0.2 * m1 * (h1 - h2));
    cuadra.magnitud(id, 'La exergía que pierde el vapor', pierdeVapor, 'kW');
  });

  it('el agua gana 56,97 kW', () => cuadra.magnitud(id, 'La exergía que gana el agua', ganaAgua, 'kW'));

  it('se destruyen 223,12 kW, los mismos por el balance y por Guy-Stodola', () => {
    const porBalance = pierdeVapor - ganaAgua;
    const SG = m1 * (s2 - s1) + mw * cp * Math.log(Ts / Te);
    expect(m1 * (s2 - s1)).toBeLessThan(0); // el vapor solo pierde entropía
    expect(Math.abs(porBalance - T0 * SG)).toBeLessThan(1e-9 * porBalance);
    cuadra.magnitud(id, 'La exergía destruida', porBalance, 'kW');
  });

  it('y su rendimiento exergético es del 20,3 %', () =>
    cuadra(id, 'El rendimiento exergético del condensador', ganaAgua / pierdeVapor));
});

describe('2c · la bomba, del signo de su trabajo a sus dos rendimientos', () => {
  const id = 'exter2526-ord-2-la-bomba-que-consume-seis-kilovatios';
  // líquido saturado a 0,5 bar, de las tablas del sitio: h' = 340,54 y s' = 1,0912
  const sat = tablas.saturacionP.filas.find((r) => r[0] === 0.5)!;
  const [h2, s2] = [sat[4], sat[6]];
  const [m, T0] = [0.7, 288];
  const W = -6; // consume: el trabajo entra
  const h3 = h2 - W / m;
  /* La tabla de líquido comprimido a 50 bar, [T, v, u, h, s]: la salida ideal
     y la real caen las dos entre las filas de 80 y 100 °C. */
  const filas = tablas.liquido.bloques.find((b) => b.p === 50)!.filas;
  const [a, b] = [filas.find((f) => f[0] === 80)!, filas.find((f) => f[0] === 100)!];
  const h3s = a[3] + ((s2 - a[4]) / (b[4] - a[4])) * (b[3] - a[3]);
  const s3 = a[4] + ((h3 - a[3]) / (b[3] - a[3])) * (b[4] - a[4]);
  const etaS = (h3s - h2) / (h3 - h2);
  const destruida = T0 * m * (s3 - s2);
  const etaEx = (m * (h3 - h2 - T0 * (s3 - s2))) / -W;

  it('el agua sale con 349,11 kJ/kg, más de lo que le daría una bomba ideal', () => {
    expect(h3s).toBeLessThan(h3);
    cuadra.magnitud(id, 'La entalpía de salida', h3, 'kJ/kg');
  });

  it('la ideal saldría con 345,81 kJ/kg: la fila de la entropía de 0,5 bar, no la de 1 bar que escribe la resolución', () => {
    cuadra.magnitud(id, 'La entalpía de salida ideal', h3s, 'kJ/kg');
    // con s = 1,3028, la de 1 bar, saldría casi a 100 °C
    const conLaDe1bar = a[3] + ((1.3028 - a[4]) / (b[4] - a[4])) * (b[3] - a[3]);
    expect(conLaDe1bar).toBeGreaterThan(420);
    expect(tablas.saturacionP.filas.find((r) => r[0] === 1)![6]).toBe(1.3028);
  });

  it('el rendimiento interno es del 61,5 %, y la destruida 1,83 kW, con la tabla', () => {
    cuadra(id, 'El rendimiento interno', etaS);
    cuadra.magnitud(id, 'La exergía destruida en la bomba', destruida, 'kW');
    cuadra(id, 'El rendimiento exergético de la bomba', etaEx);
    // y por el balance: lo que no se destruye es lo que gana el agua
    expect(Math.abs(-W - destruida - etaEx * -W)).toBeLessThan(1e-9);
  });

  it('con la formulación completa salen 59,4 %, 1,97 kW y 67 %, y las casillas los aceptan', () => {
    /* Sin interpolar: la isentrópica de verdad desde el líquido saturado a
       0,5 bar, y el estado real a 50 bar con h3. Newton en T, en K y MPa. */
    const s = saturacionDeP(0.05).liquido;
    const aT = (f: (T: number) => number, T: number) => {
      for (let k = 0; k < 50; k++) T -= f(T) / ((f(T + 0.01) - f(T)) / 0.01);
      return T;
    };
    const Tis = aT((T) => estadoDePT(5, T).s - s.s, 355);
    const Tr = aT((T) => estadoDePT(5, T).h - (s.h + 6 / 0.7), 355);
    const eta = (estadoDePT(5, Tis).h - s.h) / (6 / 0.7);
    const Exd = T0 * m * (estadoDePT(5, Tr).s - s.s);
    expect(eta).toBeCloseTo(0.594, 3);
    expect(Exd).toBeCloseTo(1.97, 2);
    cuadra(id, 'El rendimiento interno', eta);
    cuadra.magnitud(id, 'La exergía destruida en la bomba', Exd, 'kW');
    cuadra(id, 'El rendimiento exergético de la bomba', 1 - Exd / 6);
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
