/**
 * La ordinaria de Ingeniería Térmica de enero de 2020.
 *
 * Dos ejercicios que se entran por un dato raro: un cilindro cuyo estado final
 * lo fija una fuerza y no una presión, y un gasto de agua que cuelga de cuatro
 * décimas de grado. Esa sensibilidad es lo que conviene medir aquí: todo el
 * apartado b) del suelo radiante arrastra el calor del a).
 */
import { describe, expect, it } from 'vitest';
import { convocatoria } from './corpus';

const cuadra = convocatoria('ingenieria-termica', '2019-2020-ord');
const K = 273.15;
const g = 9.8; // la de los apuntes y la de la resolución

describe('1 · el proceso que lo define una fuerza', () => {
  const id = 'exter1920-ord-1-el-proceso-que-lo-define-una-fuerza';
  const [D, m, P1, F, P0] = [0.1, 2, 100, 2000, 100]; // m, kg, kPa, N, kPa
  const [T1, T2, T0, Tp] = [20 + K, 119 + K, 18 + K, 67 + K];
  // el enunciado no da las constantes del aire: son las que usa la resolución
  const [cv, R] = [0.718, 0.287];
  const P2 = F / ((Math.PI * D * D) / 4) / 1000; // kPa

  it('el aire acaba a 2,546 bar: la fuerza entre el área del pistón', () =>
    cuadra.magnitud(id, 'La presión final', P2, 'kPa'));

  const [v1, v2] = [(R * T1) / P1, (R * T2) / P2];
  const W = m * P2 * (v2 - v1);

  it('y recibe 203 kJ, con la presión de fuera, igual sin pasar por los volúmenes', () => {
    // m·P₂·(v₂ − v₁) = m·R·(T₂ − T₁·P₂/P₁)
    expect(Math.abs(W - m * R * (T2 - (T1 * P2) / P1))).toBeLessThan(1e-9);
    expect(W).toBeLessThan(0);
    cuadra.magnitud(id, 'El trabajo', W, 'kJ');
  });

  it('y se destruyen 66,4 kJ, los mismos por el balance de exergía que por Guy-Stodola', () => {
    const dU = m * cv * (T2 - T1);
    const Q = dU + W;
    expect(Q).toBeLessThan(0); // sale calor por las paredes, como anunciaba su temperatura
    const dS = m * (cv * Math.log(T2 / T1) + R * Math.log(v2 / v1));
    const SG = dS - Q / Tp;
    /* El balance del cilindro, con la frontera en la pared: la exergía que se
       lleva el calor a 67 °C, el trabajo útil y lo que cambia la del aire. */
    const dV = m * (v2 - v1);
    const dB = dU + P0 * dV - T0 * dS;
    const porBalance = (1 - T0 / Tp) * Q - (W - P0 * dV) - dB;
    expect(Math.abs(porBalance - T0 * SG)).toBeLessThan(1e-9 * porBalance);
    cuadra.magnitud(id, 'La exergía destruida', porBalance, 'kJ');
  });
});

describe('3 · el suelo radiante y las cuatro décimas de grado', () => {
  const id = 'exter1920-ord-3-el-suelo-radiante-y-los-cuatro-decimos-de-grado';
  // aire a la película, 25 °C, de la nota del enunciado
  const [k, mu, Pr] = [0.02551, 1.849e-5, 0.7296];
  const [A, P, dT] = [25, 20, 29 - 21];
  const L = A / P;
  const beta = 1 / ((29 + 21) / 2 + K);
  const hSuelo = (rho: number) =>
    (0.15 * ((g * beta * dT * L ** 3 * rho ** 2 * Pr) / mu ** 2) ** (1 / 3) * k) / L;
  const h = hSuelo(1.184);
  const Q = h * A * dT;

  it('el suelo da 706,6 W, y su coeficiente no depende del tamaño del suelo', () => {
    // con exponente 1/3, L³ entra al cubo y sale dividiendo: el mismo h sin longitud característica
    const sinL = 0.15 * k * ((g * beta * dT * 1.184 ** 2 * Pr) / mu ** 2) ** (1 / 3);
    expect(Math.abs(h - sinL) / h).toBeLessThan(1e-12);
    cuadra.magnitud(id, 'El calor que da el suelo', Q, 'W');
  });

  // el tubo, y el agua a 40 °C de la nota
  const [Lt, D2, D1, kt] = [35, 0.02, 0.016, 0.45];
  const [rhoW, kW, muW, PrW] = [992.1, 0.631, 6.53e-4, 4.32];
  const tubo = (q: number) => {
    const th1 = 38 + (q * Math.log(D2 / D1)) / (2 * Math.PI * kt * Lt);
    const hi = q / (Math.PI * D1 * Lt * (40 - th1));
    // Dittus-Boelter al revés, con el 0,3 del agua que se enfría
    const Re = ((hi * D1) / kW / (0.023 * PrW ** 0.3)) ** (1 / 0.8);
    // el gasto por la velocidad, c = Re·μ/(ρD), en vez de por πDμRe/4
    const c = (Re * muW) / (rhoW * D1);
    return { th1, hi, Re, m: (rhoW * c * Math.PI * D1 * D1) / 4 };
  };
  const b = tubo(Q);

  it('la cara interior está a 39,59 °C: la pared de plástico se come el 80 % de los dos grados', () => {
    expect((b.th1 - 38) / (40 - 38)).toBeGreaterThan(0.75);
    cuadra.magnitud(id, 'La cara interior del tubo', b.th1, '°C');
  });

  it('la película de agua tiene 987,6 W/(m²·K), sacados de cuatro décimas de grado', () => {
    expect(40 - b.th1).toBeLessThan(0.45);
    cuadra.magnitud(id, 'El coeficiente de convección dentro del tubo', b.hi, 'W/(m^2 K)');
  });

  it('y circulan 0,0296 kg/s, en la transición donde Dittus-Boelter solo estima', () => {
    expect(b.Re).toBeGreaterThan(2300);
    expect(b.Re).toBeLessThan(10000);
    expect(Math.abs(b.m - (Math.PI * D1 * muW * b.Re) / 4) / b.m).toBeLessThan(1e-12);
    cuadra.magnitud(id, 'El gasto de agua', b.m, 'kg/s');
  });

  it('y el 0,45 % del Grashof oficial, con ρ = 1,192, se hace un 3 % en el gasto', () => {
    /* La nota de la resolución lo afirma; aquí se mide. El calor sube medio
       punto y el gasto casi seis veces eso, por las cuatro décimas de grado. */
    const qOficial = hSuelo(1.192) * A * dT;
    const subeQ = qOficial / Q - 1;
    const subeM = tubo(qOficial).m / b.m - 1;
    expect(subeQ).toBeCloseTo(0.0045, 3);
    expect(subeM).toBeGreaterThan(0.02);
    expect(subeM).toBeLessThan(0.035);
  });
});
