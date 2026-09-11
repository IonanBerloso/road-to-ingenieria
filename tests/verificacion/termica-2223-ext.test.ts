/**
 * La extraordinaria de Ingeniería Térmica del 30 de enero de 2023.
 *
 * El nitrógeno llega sin R ni calores específicos en el enunciado: se toman de
 * la resolución, que es de donde los toma el corpus, y aquí se comprueba al
 * menos que casan entre sí. La tubería defiende una cifra en la que el sitio
 * se aparta de la oficial: el Nusselt es 341,8, no 371,7.
 */
import { describe, expect, it } from 'vitest';
import { convocatoria } from './corpus';

const cuadra = convocatoria('ingenieria-termica', '2022-2023-ext');
const K = 273.15; // la resolución usa 273

describe('2 · el nitrógeno que se reparte, y la irreversibilidad que manda', () => {
  const id = 'exter2223-ext-2-el-nitrogeno-que-se-reparte-y-la-irreversibilidad-que-manda';
  // N₂, de la resolución del corpus: el enunciado no los publica
  const [R, cv, cp] = [0.297, 0.742, 1.039];
  const [VA, P1, P2] = [0.2, 2000, 500]; // m³, kPa
  // «sin aislamiento» y «nuevo estado de equilibrio»: acaba a la del pabellón
  const [T1, T2] = [60 + K, 20 + K];
  const m = (P1 * VA) / (R * T1);
  const Q = m * cv * (T2 - T1); // rígido: todo el calor es ΔU
  const dS = m * (cp * Math.log(T2 / T1) - R * Math.log(P2 / P1));
  const Suniv = dS - Q / T2; // el pabellón recibe −Q a 20 °C

  it('las tres constantes del nitrógeno casan: c_p − c_v = R', () => expect(cp - cv).toBeCloseTo(R, 10));

  it('el depósito vacío mide 0,504 m³, por el cociente de estados y por la masa', () => {
    const porCociente = VA * (P1 / P2) * (T2 / T1) - VA;
    const porMasa = (m * R * T2) / P2 - VA;
    expect(Math.abs(porCociente - porMasa)).toBeLessThan(1e-12);
    cuadra.magnitud(id, 'El volumen del depósito vacío', porMasa, 'm^3');
  });

  it('el universo genera 1,537 kJ/K, y el 98 % lo pone el trasvase y no el calor', () => {
    expect(Q).toBeLessThan(0);
    expect(dS).toBeGreaterThan(0); // sube aunque el gas ceda calor
    // la NOTA: el calor sale del sistema a la temperatura media del proceso
    const Tm = (T1 + T2) / 2;
    const trasvase = dS - Q / Tm;
    const calor = -Q / T2 + Q / Tm;
    expect(Math.abs(trasvase + calor - Suniv)).toBeLessThan(1e-12);
    expect(trasvase / Suniv).toBeGreaterThan(0.98);
    cuadra.magnitud(id, 'La entropía generada en el universo', Suniv, 'kJ/K');
  });
});

describe('3 · la tubería de hierro fundido, y el metal que esta vez sí cuenta', () => {
  const id = 'exter2223-ext-3-el-metal-que-esta-vez-si-cuenta';
  // el agua a 41,5 °C, de la nota del enunciado
  const [cp, rho, k, nu, Pr] = [4179, 991.5, 0.6328, 6.4135e-7, 4.197];
  const [m, D1, e, L, kFe] = [2, 0.05, 0.005, 1.2, 52];
  const D2 = D1 + 2 * e;
  const Q = m * cp * (45 - 38);

  /* El Reynolds por el gasto, 4ṁ/(πDμ) con μ = ρν, sin pasar por la
     velocidad de 1,03 m/s que usa la resolución. */
  const Re = (4 * m) / (Math.PI * D1 * rho * nu);
  const Nu = 0.023 * Re ** 0.8 * Pr ** 0.4; // 0,4: el agua se calienta
  const h = (Nu * k) / D1;
  const Rconv = 1 / (h * Math.PI * D1 * L);
  const Rpared = Math.log(D2 / D1) / (2 * Math.PI * kFe * L);
  const tp1 = (38 + 45) / 2 + Q * Rconv;
  const tp2 = tp1 + Q * Rpared;

  it('el agua recibe 58,5 kW', () => cuadra.magnitud(id, 'El calor que recibe el agua', Q, 'W'));

  it('su película tiene 4.326 W/(m²·K): el Nusselt es 341,8, no el 371,7 de la resolución oficial', () => {
    expect(Re).toBeGreaterThan(1e4);
    expect(Math.abs(Nu - 371.71)).toBeGreaterThan(25);
    cuadra.magnitud(id, 'El coeficiente de convección', h, 'W/(m^2 K)');
  });

  it('y la cara exterior está a 140,5 °C: el hierro es el 27,5 % de la resistencia', () => {
    expect(Rpared / (Rpared + Rconv)).toBeCloseTo(0.275, 2);
    cuadra.magnitud(id, 'La temperatura de la cara exterior', tp2, '°C');
  });
});
