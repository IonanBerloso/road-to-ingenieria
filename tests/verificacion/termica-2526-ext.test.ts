/**
 * La extraordinaria de Ingeniería Térmica de febrero de 2026. Dos respuestas
 * no cuadran y ninguna por la física: el Reynolds de los cascos se publica con
 * una tolerancia absoluta de 0,02 sobre 84.900, y la exergía destruida del
 * intercambiador pide un 0,5 % que los datos redondeados del propio paso no
 * dan. Donde el ejercicio no trae la tabla —los cp, las entropías del vapor—
 * se usa lo que el paso le da al alumno, y se dice.
 */
import { describe, expect, it } from 'vitest';
import { convocatoria } from './corpus';

const cuadra = convocatoria('ingenieria-termica', '2025-2026-ext');
const K = 273.15;

describe('1a · la resistencia dentro del tanque', () => {
  const id = 'exter2526-ext-1-la-resistencia-dentro-del-tanque';
  const [m, P1, h1, t] = [1.5, 200, 1654, 10 * 60];
  // saturación a 200 kPa: h' y h'' de la pregunta, v' y v'' de la resolución
  const [hf, hg, vf, vg] = [504.7, 2706.2, 0.0010605, 0.88568];
  const x1 = (h1 - hf) / (hg - hf);
  const v1 = vf + x1 * (vg - vf);

  it('el vapor entra con título 0,522', () => cuadra(id, 'El título inicial', x1));

  it('y acaba a 4 bar, la fila de saturación cuyo v″ es el suyo', () => {
    /* La tabla del ejercicio solo trae v'' a 2 bar (0,88568, en la resolución)
       y a 3,5 bar (0,5243, en un distractor). Entre filas de saturación v'' va
       casi como una potencia de P, así que se interpola en escala doble
       logarítmica y se extrapola hasta el v1 de este vapor. No sustituye a la
       tabla: comprueba que la fila de 4 bar es la que toca. */
    expect(Math.abs(v1 - 0.46288) / 0.46288).toBeLessThan(1e-4); // el v1 que da la pregunta
    const pendiente = Math.log(0.5243 / vg) / Math.log(3.5 / 2);
    const P2 = 3.5 * Math.exp(Math.log(v1 / 0.5243) / pendiente);
    cuadra.magnitud(id, 'La presión final', P2, 'bar');
  });

  it('la resistencia da 2,48 kW', () => {
    const hg4 = 2738.1; // h'' a 4 bar, de la resolución: la fila en que acaba el vapor
    const u1 = h1 - P1 * v1;
    const u2 = hg4 - 400 * v1; // rígido: v2 = v1
    // las dos energías internas que da la pregunta
    expect(Math.abs(u1 - 1561.4)).toBeLessThan(0.1);
    expect(Math.abs(u2 - 2552.9)).toBeLessThan(0.1);
    cuadra.magnitud(id, 'La potencia', (m * (u2 - u1)) / t, 'kW');
  });
});

describe('1b · lo que cuesta calentar con una resistencia', () => {
  const id = 'exter2526-ext-1-lo-que-cuesta-calentar-con-una-resistencia';
  const [m, We] = [1.5, 1487.3];
  const T0 = 25 + K;
  // las entropías del vapor, de la pregunta: el ejercicio no trae la tabla
  const [s1, s2] = [4.4515, 6.8959];
  const SG = m * (s2 - s1); // aislado: toda la entropía que gana el vapor es generada
  /* La exergía que gana el vapor, por su definición: rígido y aislado, ΔU es
     el trabajo eléctrico y P0·ΔV vale cero; queda −T0·ΔS. */
  const ganaVapor = We - T0 * SG;

  it('se destruyen 1.093 kJ, los mismos por los dos caminos', () => {
    // entra electricidad, exergía pura; lo que no se queda el vapor se ha destruido
    const porBalance = We - ganaVapor;
    expect(Math.abs(porBalance - T0 * SG)).toBeLessThan(1e-9 * porBalance);
    cuadra.magnitud(id, 'La exergía destruida', porBalance, 'kJ');
  });

  it('y el vapor se queda con el 26,5 % de la electricidad', () =>
    cuadra(id, 'El rendimiento exergético', ganaVapor / We));
});

describe('2 · el intercambiador que pierde un diez por ciento', () => {
  const id = 'exter2526-ext-2-el-intercambiador-que-pierde-un-diez-por-ciento';
  const [P, Vh, Taire] = [202.65, 1500, 75 + K]; // 2 atm en kPa, como lo escribe la pista
  const R = 0.287; // la del aire que usa el desarrollo
  const [TMC, T0] = [17 + K, 15 + K];
  /* Los cp del nitrógeno y del aire no están en el ejercicio, ni en el
     enunciado ni en la resolución: las dos variaciones de entropía y el calor
     perdido se toman de la pregunta del paso, que es lo que tiene el alumno. */
  const [dSN2, dSaire, Qp] = [0.1365, -0.14353, -4.59];
  const SG = dSN2 + dSaire - Qp / TMC;

  it('pasan 0,8454 kg/s de aire, con 348 K y no con los 343 que imprime la resolución', () =>
    cuadra.magnitud(id, 'El gasto de aire', (P * Vh) / 3600 / (R * Taire), 'kg/s'));

  it('los tres datos de la pregunta se sostienen entre sí', () => {
    /* Se pierde el 10 % de lo que cede el aire, así que el nitrógeno recibe
       nueve veces el calor perdido; con eso sale su ṁ·cp, y con él su Δs. */
    const mcp = (9 * -Qp) / (40 - 20);
    const dS = mcp * Math.log((40 + K) / (20 + K));
    expect(Math.abs(dS - dSN2) / dSN2).toBeLessThan(0.003);
  });

  it('se generan 0,0089 kW/K, y sin el calor perdido saldría negativa', () => {
    expect(dSN2 + dSaire).toBeLessThan(0);
    cuadra.magnitud(id, 'La entropía generada', SG, 'kW/K');
  });

  it('la exergía destruida es 2,55 kW, con la entropía generada que da la pregunta', () => {
    /* En la primera pasada no cuadró: con la entropía generada rehecha desde
       los datos redondeados del paso anterior —0,008789 kW/K— sale 2,533 kW,
       un 0,68 % por debajo del publicado con una tolerancia del 0,5 %, que se
       estrechó para echar el distractor de 290 K. Esos datos no fijan S_G
       mejor que al ±0,8 %, así que la casilla rechazaba la cuenta buena.
       Desde el 12 de septiembre de 2026 la pregunta da la S_G publicada, y
       con ella la cuenta es de un paso y el medio por ciento sí separa las
       dos temperaturas. */
    const SGdada = 0.008868;
    expect(T0 * SG).toBeCloseTo(2.533, 2); // lo que salía, para que conste
    cuadra.magnitud(id, 'La exergía destruida', T0 * SGdada, 'kW');
    // y el distractor de los 290 K queda fuera de ese medio por ciento
    expect(Math.abs(290 * SGdada - 2.55) / 2.55).toBeGreaterThan(0.005);
  });
});

describe('3 · los dos cascos en el túnel de viento', () => {
  const id = 'exter2526-ext-3-los-dos-cascos-en-el-tunel-de-viento';
  const [qA, qB] = [512.8, 596.4];
  const [tAire, tSup, D] = [18, 30.5, 0.22];
  const c = 21.6 / 3.6;
  // el aire a la temperatura de película, 24,25 °C: lo que dan las preguntas
  const [nu, Pr, k] = [1.5551e-5, 0.7298, 0.0254545];
  const [hA, hB] = [qA, qB].map((q) => q / (tSup - tAire));
  const Re = (c * D) / nu;
  const Nu = 2 + 0.6 * Re ** 0.5 * Pr ** (1 / 3);
  const h = (Nu * k) / D;

  it('el casco A tiene 41 W/(m²·K), y el B un 16 % más', () => {
    expect(hB / hA).toBeCloseTo(1.163, 2);
    cuadra.magnitud(id, 'El coeficiente del casco A', hA, 'W/(m^2 K)');
  });

  it('el Reynolds del ensayo es 84.882', () => {
    expect(Re).toBeCloseTo(84882, 0);
    /* En la primera pasada no cuadró: la casilla pedía 84900 —el 8,49·10⁴ de
       la resolución, a tres cifras— con tolerancia absoluta 0,02, y la cuenta
       exacta quedaba 18 unidades por debajo. La misma tolerancia relativa en
       un campo absoluto que el Reynolds de enero. Corregida a 400 el 12 de
       septiembre de 2026. */
    cuadra(id, 'El Reynolds del ensayo', Re);
  });

  it('y la correlación de hemiesfera lisa predice 18,4: menos de la mitad de lo medido', () => {
    expect(hA / h).toBeGreaterThan(2);
    cuadra.magnitud(id, 'El coeficiente que predice la correlación', h, 'W/(m^2 K)');
  });
});
