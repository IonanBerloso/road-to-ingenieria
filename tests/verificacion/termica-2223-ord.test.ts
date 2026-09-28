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
import tablas from '../../src/content/tablas/vapor-de-agua.json';

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

  /* Las tablas del sitio, con la rejilla del anexo del curso (fase F1): el
     enunciado ya no da ningún valor, como el examen, que se hace con el
     anexo delante. [T, v, u, h, s] de cada fila. */
  const fila = (p: number, T: number) => {
    const bloque = tablas.sobrecalentado.bloques.find((b) => b.p === p);
    const f = bloque?.filas.find((r) => r[0] === T);
    if (!f) throw new Error(`no hay fila de ${T} °C a ${p} bar`);
    return f;
  };
  // la salida, sobrecalentada a 0,1 bar: entre las filas de 50 y 100 °C
  const h2 = lerp(80, 50, 100, fila(0.1, 50)[3], fila(0.1, 100)[3]);
  const s2 = lerp(80, 50, 100, fila(0.1, 50)[4], fila(0.1, 100)[4]);
  // el balance da h1, y con 20 bar ya hay dos propiedades para la tabla
  const h1 = W / m + h2;
  const th1 = lerp(h1, fila(20, 300)[3], fila(20, 350)[3], 300, 350);
  const s1 = lerp(th1, 300, 350, fila(20, 300)[4], fila(20, 350)[4]);
  // saturación a 0,1 bar: [p, T, v', v'', h', h'', s', s'']
  const sat = tablas.saturacionP.filas.find((r) => r[0] === 0.1)!;
  const [hf, hg, sf, sg] = [sat[4], sat[5], sat[6], sat[7]];
  const x2s = (s1 - sf) / (sg - sf);
  const h2s = hf + x2s * (hg - hf);
  const af = (h: number, s: number) => h - T0 * s;

  it('el vapor sale a 0,1 bar y 80 °C con h = 2649,3 kJ/kg', () =>
    cuadra.magnitud(id, 'La entalpía de salida', h2, 'kJ/kg'));

  it('el vapor entra a 311,1 °C', () => cuadra.magnitud(id, 'La temperatura de entrada', th1, '°C'));

  it('el rendimiento interno es del 44,8 %: una turbina mala', () => {
    expect(x2s).toBeGreaterThan(0);
    expect(x2s).toBeLessThan(1); // el isentrópico cae dentro de la campana
    const eta = (h1 - h2) / (h1 - h2s);
    expect(eta).toBeLessThan(0.8);
    cuadra(id, 'El rendimiento interno', eta);
  });

  it('destruye 220,1 kW, los mismos por el balance de exergía que por Guy-Stodola', () => {
    const porBalance = m * (af(h1, s1) - af(h2, s2)) - W;
    const porGuyStodola = T0 * m * (s2 - s1);
    expect(Math.abs(porBalance - porGuyStodola)).toBeLessThan(1e-9 * porGuyStodola);
    expect(porGuyStodola).toBeGreaterThan(W); // destruye más de lo que entrega
    cuadra.magnitud(id, 'La exergía destruida', porGuyStodola, 'kW');
  });

  it('y su rendimiento exergético es del 47,6 %', () =>
    cuadra(id, 'El rendimiento exergético', W / (m * (af(h1, s1) - af(h2, s2)))));

  it('la resolución oficial da un 8 % más porque interpola la entropía en presión', () => {
    /* Sus dos filas, a 80 °C, de las tablas del Moran: s = 8,5804 a 0,06 bar
       y 7,7564 a 0,35. En línea recta en p sale el 8,4667 de la resolución;
       en ln p, que es como va la entropía de un vapor, sale lo del anexo. */
    const enP = lerp(0.1, 0.06, 0.35, 8.5804, 7.7564);
    const enLnP = lerp(Math.log(0.1), Math.log(0.06), Math.log(0.35), 8.5804, 7.7564);
    expect(enP).toBeCloseTo(8.4667, 4);
    expect(Math.abs(enLnP - s2)).toBeLessThan(0.005);
    expect(enP - s2).toBeGreaterThan(0.12);
    // con la s2 oficial, la exergía destruida sube un 8 %
    const oficial = T0 * m * (enP - s1);
    const exacta = T0 * m * (s2 - s1);
    expect(oficial / exacta - 1).toBeGreaterThan(0.075);
    expect(oficial / exacta - 1).toBeLessThan(0.09);
  });
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
