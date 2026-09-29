/**
 * Modelo de examen «Examen 5» de Fundamentos Químicos, curso 2024-2025:
 * ejercicios 2, 4 y 5 (el 1 y el 3 no están en el documento).
 *
 * Es, con la ordinaria de 2013, uno de los dos documentos de Química con
 * resolución oficial detrás, así
 * que aquí se comprueba algo más que la aritmética: cada cifra se recalcula
 * desde los datos del ENUNCIADO, no desde los de la resolución. Donde la
 * oficial escribe otro dato —1125 mmHg en vez de 1122 en el 4.3—, el corpus
 * publica la cuenta con el del enunciado y este test la exige.
 *
 * Los nombres del 4.1 y las fórmulas empírica y molecular no son números:
 * los corrige el lector de `lib/quimica.ts`, y no pasan por `cuadra`.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';

const cuadra = convocatoria('fundamentos-quimicos', '2024-2025-modelo');

describe('2 · el ácido carbámico', () => {
  const id = 'exfq2425-modelo-2-el-acido-carbamico-de-lewis-a-la-polaridad';
  /* Los números atómicos del enunciado: H (1), C (6), N (7), O (8). En el
     periodo 2 los electrones de valencia son Z menos los dos del 1s. */
  const valencia = (Z: number) => (Z <= 2 ? Z : Z - 2);
  /* H₂NCOOH: un N, un C, dos O y tres H. */
  const atomos = [7, 6, 8, 8, 1, 1, 1];
  const ev = atomos.reduce((s, Z) => s + valencia(Z), 0);

  it('hay 24 electrones de valencia', () => cuadra(id, 'Los electrones de valencia', ev));

  it('caben 38, así que hay siete pares compartidos', () => {
    /* Ocho por átomo pesado y dos por hidrógeno; la diferencia con los que
       hay son electrones compartidos, y entre dos, pares. */
    const caben = atomos.reduce((s, Z) => s + (Z === 1 ? 2 : 8), 0);
    cuadra(id, 'Los pares compartidos', (caben - ev) / 2);
  });

  it('y cinco pares solitarios', () => {
    const compartidos = 7;
    cuadra(id, 'Los pares solitarios', (ev - 2 * compartidos) / 2);
  });

  it('los ángulos del carbono, con número estérico 3, son de 120°', () =>
    cuadra(id, 'El ángulo alrededor del carbono', 360 / 3));
});

/* Masas atómicas del ejercicio 4. */
const u4 = { H: 1.01, C: 12.01, O: 16.0, Cl: 35.5, Ag: 107.87, Ba: 137.33 };

describe('4 · el hipnótico: los porcentajes de la fórmula empírica', () => {
  const id = 'exfq2425-modelo-4-el-hipnotico-clorado-y-su-formula-empirica';

  it('el hidrógeno, del agua, es un 1,83 %', () => {
    /* Dos hidrógenos por molécula de agua, sobre los 0,248 g oxidados. La
       oficial divide entre 18 g/mol y escribe 1,832: cabe en la tolerancia. */
    const MH2O = 2 * u4.H + u4.O;
    cuadra(id, 'El porcentaje de hidrógeno', ((0.0405 / MH2O) * 2 * u4.H * 100) / 0.248);
  });

  it('el carbono, del BaCO₃, es un 14,53 %', () => {
    /* Un carbono por cada BaCO₃, y todo venía del compuesto. */
    const MBaCO3 = u4.Ba + u4.C + 3 * u4.O;
    cuadra(id, 'El porcentaje de carbono', ((0.592 / MBaCO3) * u4.C * 100) / 0.248);
  });

  it('el cloro, del AgCl, es un 64,35 % sobre la OTRA muestra', () => {
    /* El AgCl sale de 0,314 g de hipnótico, no de los 0,248 de la oxidación. */
    const MAgCl = u4.Ag + u4.Cl;
    cuadra(id, 'El porcentaje de cloro', ((0.816 / MAgCl) * u4.Cl * 100) / 0.314);
  });
});

describe('4 · el hipnótico: la masa molar por presión osmótica', () => {
  const id = 'exfq2425-modelo-4-el-hipnotico-por-su-presion-osmotica';

  it('1 g en 100 mL a 1122 mmHg y 25 °C da 165,6 g/mol', () => {
    /* Con el dato del ENUNCIADO, 1122 mmHg. La resolución oficial calcula con
       1125 y obtiene 165,1, que la casilla acepta porque cae en el mismo margen
       que redondear la presión a 1,48 atm; el desarrollo lo dice. */
    const pi = 1122 / 760; // atm
    const R = 0.082; // atm·L/(mol·K), la del curso
    const T = 25 + 273.15;
    cuadra(id, 'La masa molar del hipnótico', (1 * R * T) / (pi * 0.1));
  });

  it('y la casilla acepta también 298 K y R = 0,08206', () => {
    const pi = 1122 / 760;
    cuadra(id, 'La masa molar del hipnótico', (1 * 0.082 * 298) / (pi * 0.1));
    cuadra(id, 'La masa molar del hipnótico', (1 * 0.082057 * 298.15) / (pi * 0.1));
  });

  it('y el redondeo razonable de la presión a 1,48 atm', () => {
    cuadra(id, 'La masa molar del hipnótico', (1 * 0.082 * 298.15) / (1.48 * 0.1));
    cuadra(id, 'La masa molar del hipnótico', (1 * 0.08206 * 298) / (1.48 * 0.1));
  });
});

/* Masas atómicas del ejercicio 5. */
const u5 = { H: 1.01, O: 16.0, S: 32.06, Zn: 65.38 };
const MZnS = u5.Zn + u5.S;
const MH2SO4 = 2 * u5.H + u5.S + 4 * u5.O;

describe('5 · la blenda y el ácido sulfúrico', () => {
  const id = 'exfq2425-modelo-5-la-blenda-y-el-acido-sulfurico';

  it('la ecuación lleva dos O₂', () => {
    /* ZnS + x O₂ + H₂O → ZnO + H₂SO₄. Zinc, azufre e hidrógeno cuadran con 1;
       el oxígeno: 2x + 1 del agua = 1 del ZnO + 4 del ácido. */
    cuadra(id, 'El coeficiente del oxígeno', (1 + 4 - 1) / 2);
  });

  /* 200 kg de disolución de densidad 1,19 g/cm³, a 3,15 M. */
  const litros = 200000 / 1.19 / 1000;
  const molAcido = litros * 3.15;

  it('los 200 kg de disolución llevan 529,4 mol de ácido', () =>
    cuadra(id, 'Los moles de ácido en los 200 kg', molAcido));

  it('hacen falta 108,15 kg de blenda', () => {
    /* Un ZnS por ácido; el 90 % DIVIDE, porque hace falta más reactivo; y la
       blenda es un 53 % de ZnS. */
    cuadra(id, 'La blenda necesaria', ((molAcido / 0.9) * MZnS) / 0.53 / 1000);
  });

  /* Un litro de disolución: 1190 g, con 3,15 mol de ácido dentro. */
  const gAcido = 3.15 * MH2SO4;

  it('la disolución es un 25,96 % en masa', () =>
    cuadra(id, 'El porcentaje en masa', (gAcido / 1190) * 100));

  it('y 3,575 molal: por kilo de agua, no de disolución', () =>
    cuadra(id, 'La molalidad', 3.15 / ((1190 - gAcido) / 1000)));
});

describe('5 · el reactor cerrado con aire', () => {
  const id = 'exfq2425-modelo-5-el-reactor-cerrado-con-aire';
  const R = 0.082;
  const T = 30 + 273.15;
  const V = 30000; // L, el reactor

  const nAire = (1 * 65000) / (R * T);
  const nZnS = (50000 * 0.53) / MZnS;
  const nH2O = (5500 * 0.996) / (2 * u5.H + u5.O);
  /* ZnS + 2 O₂ + H₂O: el ZnS es el limitante si llegan el O₂ y el agua. */
  if (0.21 * nAire < 2 * nZnS || nH2O < nZnS) throw new Error('el limitante no es el ZnS');
  const O2gastado = 2 * nZnS;
  /* En el gas quedan el N₂ y el Ar, que no reaccionan, y el O₂ que sobra. El
     agua que sobra es líquida a 30 °C y no cuenta. */
  const nN2 = 0.78 * nAire;
  const nGas = 0.21 * nAire - O2gastado + nN2 + 0.01 * nAire;

  it('entran 2615 mol de aire', () => cuadra(id, 'Los moles de aire que entran', nAire));

  it('la oficial escribe «273 + 30»: con 303 K justos también entra', () =>
    cuadra(id, 'Los moles de aire que entran', 65000 / (R * 303)));

  it('la tostación gasta 543,9 mol de O₂', () =>
    cuadra(id, 'El oxígeno que consume la tostación', O2gastado));

  it('la presión total es 1,716 atm', () => cuadra(id, 'La presión total', (nGas * R * T) / V));

  it('la del nitrógeno, 1,690 atm, la misma que tenía en el aire pasada a 30 m³', () => {
    cuadra(id, 'La presión parcial del nitrógeno', (nN2 * R * T) / V);
    cuadra(id, 'La presión parcial del nitrógeno', (0.78 * 65) / 30);
  });

  it('y la mezcla final es un 98,49 % de N₂', () =>
    cuadra(id, 'El porcentaje de nitrógeno en la mezcla final', (nN2 / nGas) * 100));
});
