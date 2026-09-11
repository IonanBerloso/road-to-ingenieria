/**
 * La ordinaria de Ingeniería Térmica del 11 de enero de 2022.
 *
 * Es un examen encadenado —el ejercicio 2 es el aparato del 1—, pero con nota
 * de rescate: si no se ha resuelto el 1, el 2 da la temperatura del agua,
 * 56 °C. El corpus dice que las casillas aceptan también lo que sale con ese
 * dato, y aquí se comprueba en vez de creerlo.
 *
 * Las temperaturas absolutas van con 273,15 (la resolución usa 273), y los
 * valores de tabla son los que el enunciado del corpus publica en su nota.
 */
import { describe, expect, it } from 'vitest';
import { convocatoria } from './corpus';

const cuadra = convocatoria('ingenieria-termica', '2021-2022-ord');
const K = 273.15;

describe('1 · los conductos concéntricos, y el agua que hay que suponer', () => {
  const id = 'exter2122-ord-1-la-temperatura-del-agua-que-hay-que-suponer';
  // aire a 80 °C
  const [mA, cpA, rhoA, kA, nuA, PrA] = [0.5, 1008, 0.9994, 0.02953, 2.097e-5, 0.7154];
  const [D1, D2, D3, L, kMat] = [0.06, 0.08, 0.2, 10, 45];
  const Q = mA * cpA * (90 - 70);

  /* El Reynolds por el gasto, sin pasar por la velocidad: Re = 4ṁ/(πDμ), con
     μ = ρν. La resolución va por la velocidad —177 m/s— y el camino de aquí
     deja ver que la presión del aire no entra. */
  const ReA = (4 * mA) / (Math.PI * D1 * rhoA * nuA);
  const h1 = (0.023 * ReA ** 0.8 * PrA ** 0.3 * kA) / D1;
  const th1 = 80 - Q / (h1 * Math.PI * D1 * L);
  const th2 = th1 - (Q * Math.log(D2 / D1)) / (2 * Math.PI * kMat * L);

  it('el aire suelta 10,08 kW', () => cuadra.magnitud(id, 'El calor que suelta el aire', Q, 'W'));
  it('su película tiene 374,7 W/(m²·K)', () =>
    cuadra.magnitud(id, 'El coeficiente de convección del aire', h1, 'W/(m^2 K)'));
  it('la cara interior está a 65,73 °C', () => cuadra.magnitud(id, 'La cara interior del conducto', th1, '°C'));
  it('y la exterior a 64,70 °C: el metal se lleva un grado', () => {
    expect(th1 - th2).toBeLessThan(1.1);
    cuadra.magnitud(id, 'La cara exterior del conducto', th2, '°C');
  });

  it('y el agua, 56,9 °C, que ya lo da la primera vuelta dentro de la tolerancia', () => {
    /* Solo se puede reproducir la primera vuelta. El enunciado da las
       propiedades del agua a 60 °C; la segunda vuelta de la resolución oficial
       se hace a 57,06 °C y sus propiedades no se publican, así que copiarlas
       de una tabla sería meter aquí un dato sin fuente. Lo que sí se comprueba
       es que la primera vuelta ya cae dentro de lo que la casilla acepta, y
       que la corrección que falta es menor que esa tolerancia. */
    const [kW, muW, PrW] = [0.654, 4.67e-4, 2.99];
    const Dh = D3 - D2;
    // ṁ·Dh/(A·μ) con A = π(D3² − D2²)/4 se queda en 8/(π(D3+D2)μ): la densidad no entra
    const ReW = 8 / (Math.PI * (D3 + D2) * muW);
    const h2 = (0.023 * ReW ** 0.8 * PrW ** 0.4 * kW) / Dh;
    const primeraVuelta = th2 - Q / (h2 * Math.PI * D2 * L);
    expect(primeraVuelta).toBeLessThan(60);
    expect(Math.abs(primeraVuelta - 56.9)).toBeLessThan(0.2);
    cuadra.magnitud(id, 'La temperatura media del agua', primeraVuelta, '°C');
  });
});

describe('2 · el tercio del calor que se escapa', () => {
  const id = 'exter2122-ord-2-el-tercio-del-calor-que-se-escapa';
  const [mA, cpA, mW, cW] = [0.5, 1008, 2, 4183.8];
  const T0 = 20 + K;
  const Qa = mA * cpA * (90 - 70);
  const Qp = Qa / 3;
  const Qw = Qa - Qp;

  /* Todo el balance, con la temperatura media del agua como dato. Por el
     camino exacto: temperaturas de entrada y salida del agua y su logaritmo,
     sin la aproximación Q/T que usa la resolución del sitio. */
  const balance = (tAgua: number) => {
    const Tm = tAgua + K;
    const dT = Qw / (mW * cW);
    const [Te, Ts] = [Tm - dT / 2, Tm + dT / 2];
    const SG = mA * cpA * Math.log((70 + K) / (90 + K)) + mW * cW * Math.log(Ts / Te) + Qp / Tm;
    const cedeAire = mA * (cpA * 20 - T0 * cpA * Math.log((90 + K) / (70 + K)));
    const ganaAgua = mW * (cW * dT - T0 * cW * Math.log(Ts / Te));
    const seVa = Qp * (1 - T0 / Tm);
    return { SG, cedeAire, ganaAgua, seVa, destruida: cedeAire - ganaAgua - seVa };
  };
  const b = balance(56.9);

  it('el agua se queda con 6,72 kW', () => cuadra.magnitud(id, 'El calor que se queda el agua', Qw, 'W'));
  it('se generan 1,99 W/K', () => cuadra.magnitud(id, 'La entropía generada', b.SG, 'W/K'));

  it('y se destruyen 583,7 W, los mismos por los dos caminos', () => {
    expect(Math.abs(b.destruida - T0 * b.SG)).toBeLessThan(1e-9 * b.destruida);
    cuadra.magnitud(id, 'La exergía destruida', b.destruida, 'W');
  });

  it('el rendimiento exergético es del 43,9 %', () =>
    cuadra(id, 'El rendimiento exergético', (100 * b.ganaAgua) / b.cedeAire));

  it('y el tercio que se escapa no cambia la entropía generada: aislado saldría igual', () => {
    /* Con el conducto aislado el agua recibiría el calor entero y el término
       del calor perdido desaparece. La generada es la misma porque el calor
       perdido sale a la temperatura del agua. */
    const Tm = 56.9 + K;
    const dT = Qa / (mW * cW);
    const aislado = mA * cpA * Math.log((70 + K) / (90 + K)) + mW * cW * Math.log((Tm + dT / 2) / (Tm - dT / 2));
    expect(Math.abs(aislado - b.SG) / b.SG).toBeLessThan(1e-3);
    // y su rendimiento, el 65,9 % que publica la resolución
    const ganaAislado = mW * (cW * dT - T0 * cW * Math.log((Tm + dT / 2) / (Tm - dT / 2)));
    expect((100 * ganaAislado) / b.cedeAire).toBeCloseTo(65.9, 1);
  });

  it('y con los 56 °C de la nota de rescate, las tres casillas aceptan lo que sale', () => {
    const r = balance(56);
    cuadra.magnitud(id, 'La entropía generada', r.SG, 'W/K');
    cuadra.magnitud(id, 'La exergía destruida', r.destruida, 'W');
    cuadra(id, 'El rendimiento exergético', (100 * r.ganaAgua) / r.cedeAire);
  });
});

describe('3 · cincuenta kilojulios de calor que quitan exergía', () => {
  const id = 'exter2122-ord-3-cincuenta-kilojulios-de-calor-que-quitan-exergia';
  const [cv, cp] = [0.718, 1.005];
  const R = cp - cv;
  const [q, T1, T2, P1] = [50, 20 + K, 60 + K, 200];
  const [T0, P0] = [15 + K, 100];
  const cn = q / (T2 - T1);
  const n = (cn - cp) / (cn - cv);
  const P2 = P1 * (T2 / T1) ** (n / (n - 1));

  it('el aire acaba a 1,793 bar: el exponente es menor que uno y la presión baja', () => {
    expect(n).toBeGreaterThan(0);
    expect(n).toBeLessThan(1);
    cuadra.magnitud(id, 'La presión final', P2, 'kPa');
  });

  it('y hace 21,28 kJ/kg de trabajo, igual por la politrópica que por el primer principio', () => {
    const w = (R * (T2 - T1)) / (1 - n);
    expect(Math.abs(w - (q - cv * (T2 - T1)))).toBeLessThan(1e-9);
    cuadra.magnitud(id, 'El trabajo intercambiado', w, 'kJ/kg');
  });

  it('y su exergía baja 6,09 kJ/kg habiéndole entrado calor', () => {
    const ds = cp * Math.log(T2 / T1) - R * Math.log(P2 / P1);
    const [v1, v2] = [(R * T1) / P1, (R * T2) / P2];
    const db = cv * (T2 - T1) + P0 * (v2 - v1) - T0 * ds;
    expect(db).toBeLessThan(0);
    cuadra.magnitud(id, 'La variación de exergía', db, 'kJ/kg');
  });
});
