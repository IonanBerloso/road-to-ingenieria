/**
 * La ordinaria de Ingeniería Térmica del 10 de enero de 2023.
 *
 * El ejercicio 1 pide seis signos y ningún número, pero los tres números con
 * que el sitio llega a ellos se rehacen igual. El 3 deja dos pasos sin
 * recalcular, y no por no cuadrar: necesitan el agua a 80 °C, cuyas
 * propiedades el corpus no publica en ninguna parte.
 */
import { describe, expect, it } from 'vitest';
import { convocatoria } from './corpus';

const cuadra = convocatoria('ingenieria-termica', '2022-2023-ord');
const K = 273.15; // la resolución usa 273; que las dos entren es parte de la prueba

describe('1 · seis signos, y los tres números que los deciden', () => {
  const id = 'exter2223-ord-1-seis-signos-y-ningun-numero';
  const [cv, g, n] = [0.7175, 1.4, 3.5];
  const [T1, P1, P2] = [20 + K, 2, 1]; // atm: solo entra su cociente
  const cn = (cv * (n - g)) / (n - 1);
  const T2 = T1 * (P2 / P1) ** ((n - 1) / n);

  it('c_n sale positivo: 0,6027 kJ/(kg·K)', () => {
    expect(cn).toBeGreaterThan(0);
    cuadra.magnitud(id, 'El calor específico del proceso', cn, 'kJ/(kg K)');
  });

  it('el aire acaba a 178,7 K, y cede calor mientras se expande', () => {
    expect(cn * (T2 - T1)).toBeLessThan(0);
    cuadra.magnitud(id, 'La temperatura final', T2, 'K');
  });

  it('y su entropía baja lo mismo por c_n que por el camino de siempre, c_p ln T − R ln P', () => {
    const [cp, R] = [g * cv, (g - 1) * cv];
    const porProceso = cn * Math.log(T2 / T1);
    const porEstados = cp * Math.log(T2 / T1) - R * Math.log(P2 / P1);
    expect(porProceso).toBeLessThan(0);
    expect(Math.abs(porProceso - porEstados)).toBeLessThan(1e-12);
  });

  it('el volumen crece un 22 %, por la politrópica y por la ecuación de estado', () => {
    // Pv = RT entre los dos estados, sin volver a elevar a 1/n
    const porEstado = (P1 / P2) * (T2 / T1);
    expect(Math.abs(porEstado - (P1 / P2) ** (1 / n))).toBeLessThan(1e-12);
    expect(porEstado).toBeGreaterThan(1); // paredes móviles
    cuadra(id, 'Cuánto cambia el volumen', porEstado);
  });
});

describe('2 · la turbina que es mala, y hay que decirlo', () => {
  const id = 'exter2223-ord-2-la-turbina-que-es-mala-y-hay-que-decirlo';
  const [W, m, T0] = [200, 0.5, 15 + K];
  const lerp = (x: number, x0: number, x1: number, y0: number, y1: number) =>
    y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);

  // la tabla del enunciado: a 80 °C entre 0,06 y 0,35 bar
  const f = (0.1 - 0.06) / (0.35 - 0.06);
  const h2 = lerp(0.1, 0.06, 0.35, 2650.1, 2645.6);
  const s2 = lerp(0.1, 0.06, 0.35, 8.5804, 7.7564);
  // el balance da h1, y con 20 bar ya hay dos propiedades para la tabla
  const h1 = W / m + h2;
  const th1 = lerp(h1, 2976.4, 3069.5, 280, 320);
  const s1 = lerp(th1, 280, 320, 6.6828, 6.8452);
  // saturación a 0,1 bar
  const [hf, hg, sf, sg] = [191.83, 2584.7, 0.6493, 8.1502];
  const x2s = (s1 - sf) / (sg - sf);
  const h2s = hf + x2s * (hg - hf);
  const af = (h: number, s: number) => h - T0 * s;

  it('0,1 bar cae a un 13,8 % del intervalo', () => cuadra(id, 'Dónde cae 0,1 bar entre las dos filas', f));

  it('el vapor entra a 311,4 °C', () => cuadra.magnitud(id, 'La temperatura de entrada', th1, '°C'));

  it('el rendimiento interno es del 44,8 %: una turbina mala', () => {
    expect(x2s).toBeGreaterThan(0);
    expect(x2s).toBeLessThan(1); // el isentrópico cae dentro de la campana
    const eta = (h1 - h2) / (h1 - h2s);
    expect(eta).toBeLessThan(0.8);
    cuadra(id, 'El rendimiento interno', eta);
  });

  it('destruye 238,5 kW, los mismos por el balance de exergía que por Guy-Stodola', () => {
    // s2 sale de la tabla del enunciado, no del 8,4667 que da la pregunta
    const porBalance = m * (af(h1, s1) - af(h2, s2)) - W;
    const porGuyStodola = T0 * m * (s2 - s1);
    expect(Math.abs(porBalance - porGuyStodola)).toBeLessThan(1e-9 * porGuyStodola);
    expect(porGuyStodola).toBeGreaterThan(W); // destruye más de lo que entrega
    cuadra.magnitud(id, 'La exergía destruida', porGuyStodola, 'kW');
  });

  it('y su rendimiento exergético es del 45,6 %', () =>
    cuadra(id, 'El rendimiento exergético', W / (m * (af(h1, s1) - af(h2, s2)))));
});

describe('3 · la tubería que mide el viento', () => {
  const id = 'exter2223-ord-3-la-tuberia-que-mide-el-viento';
  const D2 = 0.1 + 2 * 0.003;

  /* Estos dos pasos se quedaron sin recalcular en la primera pasada, y con
     razón: pedían un número que salía de las propiedades del agua a 80 °C, y
     esas propiedades no estaban en ninguna parte del corpus —el desarrollo
     saltaba directamente a R_conv,i = 0,020139—. Un alumno tampoco podía
     hacerlo desde la página. Desde el 12 de septiembre de 2026 el enunciado
     publica las que usa la resolución oficial, en su página 21, y con ellas
     sale. El Reynolds, por el gasto: Re = 4ṁ/(πD₁ρν). */
  const [mAgua, D1i, rhoAgua, kAgua, nuAgua, PrAgua] = [0.12, 0.1, 971.8, 0.67, 3.653e-7, 2.22];
  const ReAgua = (4 * mAgua) / (Math.PI * D1i * rhoAgua * nuAgua);
  const hAgua = (0.023 * ReAgua ** 0.8 * PrAgua ** 0.3 * kAgua) / D1i;
  const resistencias = 1 / (hAgua * Math.PI * D1i) + Math.log(D2 / D1i) / (2 * Math.PI * 385);
  const porMetro = (80 - 76) / resistencias;

  it('se pierden 198,4 W por metro, y casi toda la resistencia es la película de agua', () => {
    expect(ReAgua).toBeGreaterThan(2100);
    cuadra.magnitud(id, 'Las pérdidas por unidad de longitud', porMetro, 'W/m');
  });

  it('y de ese mismo calor sale el coeficiente exterior, 10,64 W/(m²·K)', () =>
    cuadra.magnitud(id, 'El coeficiente exterior', porMetro / (Math.PI * D2 * (76 - 20)), 'W/(m^2 K)'));

  it('el viento sopla a 0,94 m/s, y la otra correlación se descarta sola', () => {
    const [Nu, Pr, nu] = [41.44, 0.7233, 1.7788e-5]; // los que da la pregunta
    const Re = (Nu / (0.26 * Pr ** (1 / 3))) ** (1 / 0.6);
    const ReOtra = (Nu / (0.076 * Pr ** (1 / 3))) ** (1 / 0.7);
    expect(Re).toBeGreaterThan(1e3);
    expect(Re).toBeLessThan(2e5);
    expect(ReOtra).toBeLessThan(2e5); // su rango empieza en 2·10⁵: se contradice
    cuadra.magnitud(id, 'La velocidad del viento', (Re * nu) / D2, 'm/s');
  });
});
