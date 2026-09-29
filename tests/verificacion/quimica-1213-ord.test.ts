/**
 * Convocatoria ordinaria del 31 de mayo de 2013 de Fundamentos Químicos,
 * curso 2012-2013: los ejercicios 3 a 8, transcritos de su resolución oficial.
 *
 * Treinta y seis respuestas numéricas, y la primera convocatoria de Química
 * con una resolución del profesorado detrás. Aquí cada cifra se recalcula
 * desde el enunciado con las constantes finas —R = 8,314 y 0,0820574,
 * 273,15 K, masas atómicas de tabla—; `recalcula.mjs`, en el encargo, hace lo
 * mismo con las del curso —0,082, 8,31, 273 K, masas enteras—, que son las de
 * la resolución oficial. Las tolerancias del YAML aceptan los dos caminos.
 *
 * Los ejercicios 5 y 6 cruzan temas y van en dos piezas cada uno.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';

const cuadra = convocatoria('fundamentos-quimicos', '2012-2013-ord');

const R = 8.314; // J/(mol·K)
const Ratm = 0.0820574; // L·atm/(mol·K)
const T0 = 273.15;
const atmL = 101.325; // J por atm·L
const u = { H: 1.008, N: 14.007, O: 15.999, S: 32.06 };

describe('3 · la mezcla de gases con etano', () => {
  const id = 'exfq1213-ord-3-la-mezcla-de-gases-con-etano';
  /* Cada gas a moles con SUS condiciones: el aire a 25 °C y 1 atm, el etano
     en condiciones normales y el nitrógeno por su masa. */
  const nN2 = 42 / (2 * u.N);
  const nEtano = (1 * 5) / (Ratm * T0);
  const nAire = (1 * 100) / (Ratm * (25 + T0));
  const f = (Ratm * (40 + T0)) / 25; // atm por mol en el recipiente, a 40 °C

  it('antes de reaccionar hay 5,97 atm', () =>
    cuadra.magnitud(id, 'La presión antes de reaccionar', (nN2 + nAire + nEtano) * f, 'atm'));

  /* C₂H₆ + 7/2 O₂ → 2 CO₂ + 3 H₂O(l). El etano es el limitante y el agua,
     líquida a 40 °C, no cuenta como gas. */
  const O2sobra = 0.21 * nAire - 3.5 * nEtano;
  const pO2 = O2sobra * f;
  const pCO2 = 2 * nEtano * f;
  const pN2 = (nN2 + 0.78 * nAire) * f;
  const pAr = 0.01 * nAire * f;

  it('sobran 0,0797 atm de O₂, y no los 0,082 de la resolución oficial', () =>
    cuadra.magnitud(id, 'La presión parcial del oxígeno que sobra', pO2, 'atm'));
  it('el CO₂ formado ejerce 0,4586 atm', () =>
    cuadra.magnitud(id, 'La presión parcial del CO₂', pCO2, 'atm'));
  it('el nitrógeno, el añadido y el del aire, 4,817 atm', () =>
    cuadra.magnitud(id, 'La presión parcial del nitrógeno', pN2, 'atm'));
  it('el argón, 0,0420 atm', () => cuadra.magnitud(id, 'La presión parcial del argón', pAr, 'atm'));
  it('y la presión final baja a 5,397 atm', () =>
    cuadra.magnitud(id, 'La presión final', pO2 + pCO2 + pN2 + pAr, 'atm'));
});

describe('4 · la calcopirita y sus tres rendimientos', () => {
  const id = 'exfq1213-ord-4-la-calcopirita-y-sus-tres-rendimientos';
  /* La densidad del ENUNCIADO, 1,4987 kg/L; la resolución oficial calcula
     con 1,487 y por eso sus cifras del a) y el b) salen un 0,8 % cortas. */
  const mAcido = 2000 * 1.4987 * 0.6; // kg
  const MAcido = 2 * u.H + u.S + 4 * u.O;
  const nSO2 = (mAcido * 1000) / MAcido / 0.98; // hacia atrás se divide
  const nS = nSO2 / 0.93;
  const mineral = (nS * u.S) / 0.45 / 1000; // kg

  it('en los 2000 L hay 1798,4 kg de ácido puro', () =>
    cuadra.magnitud(id, 'El ácido puro que hay en los 2000 L', mAcido, 'kg'));
  it('hay que procesar 1432 kg de calcopirita', () =>
    cuadra.magnitud(id, 'La calcopirita que hay que procesar', mineral, 'kg'));
  it('y salen 14,98 kg de cobre', () =>
    /* Hacia delante se multiplica: el 93 % de la tostación, que también forma
       el CuO, y el 75 % de la reducción. */
    cuadra.magnitud(id, 'El cobre que se obtiene', mineral * 0.015 * 0.93 * 0.75, 'kg'));
  it('por kilo de mineral escapan 12,55 g de SO₂', () =>
    /* Un cociente: no depende de cuánto mineral, ni por tanto de la densidad. */
    cuadra(id, 'El SO₂ que escapa por kilo de mineral', (0.015 * nSO2 * (u.S + 2 * u.O)) / mineral));
});

describe('5a · el gas monoatómico, isóbaro y adiabático', () => {
  const id = 'exfq1213-ord-5-el-gas-monoatomico-isobaro-y-adiabatico';
  const n = 2;
  const Cv = 1.5 * R;
  const Cp = 2.5 * R;
  const T1 = (2 * 5) / (n * Ratm);
  const T2 = (2 * 3) / (n * Ratm);
  const W1 = -2 * (3 - 5) * atmL; // ΔU = q + W, y W > 0 al comprimir

  it('comprimir a 2 atm de 5 a 3 L mete 405,3 J de trabajo', () =>
    cuadra.magnitud(id, 'El trabajo de la compresión a presión constante', W1, 'J'));
  it('el calor, que a presión constante es ΔH, vale −1013,4 J', () => {
    cuadra.magnitud(id, 'El calor a presión constante', n * Cp * (T2 - T1), 'J');
    cuadra.magnitud(id, 'La entalpía del tramo isóbaro', n * Cp * (T2 - T1), 'J');
  });
  it('ΔU = nCvΔT = −608,1 J', () =>
    cuadra.magnitud(id, 'La energía interna del tramo isóbaro', n * Cv * (T2 - T1), 'J'));
  it('la entropía baja nCp ln(3/5) = −21,22 J/K', () =>
    cuadra.magnitud(id, 'La entropía del tramo isóbaro', n * Cp * Math.log(T2 / T1), 'J/K'));

  /* El adiabático, reversible: TV^(γ−1) constante con γ = 5/3. */
  const T3 = T2 * 1.5 ** (2 / 3);
  it('la compresión adiabática calienta el gas hasta 47,94 K', () =>
    cuadra.magnitud(id, 'La temperatura al final de la compresión adiabática', T3, 'K'));
  it('con q = 0, W = ΔU = 283,1 J', () =>
    cuadra.magnitud(id, 'El trabajo del tramo adiabático, que es su ΔU', n * Cv * (T3 - T2), 'J'));
  it('ΔH = nCpΔT = 471,8 J, aunque q sea cero', () =>
    cuadra.magnitud(id, 'La entalpía del tramo adiabático', n * Cp * (T3 - T2), 'J'));
  it('y ΔS = 0: el calentamiento y la compresión se cancelan', () =>
    cuadra.magnitud(
      id,
      'La entropía del tramo adiabático',
      n * Cv * Math.log(T3 / T2) + n * R * Math.log(2 / 3),
      'J/K',
    ));
});

describe('5b · el orden por velocidades iniciales', () => {
  const id = 'exfq1213-ord-5-el-orden-por-velocidades-iniciales';
  const exp = [
    { v: 0.254, X: 0.2, Y: 0.6 },
    { v: 0.509, X: 0.4, Y: 0.3 },
    { v: 1.02, X: 0.4, Y: 0.6 },
  ];

  it('orden 2 en X: del 1 al 3 solo cambia [X]', () =>
    cuadra(id, 'El orden respecto de X', Math.log(exp[2].v / exp[0].v) / Math.log(exp[2].X / exp[0].X)));
  it('orden 1 en Y: del 2 al 3 solo cambia [Y]', () =>
    cuadra(id, 'El orden respecto de Y', Math.log(exp[2].v / exp[1].v) / Math.log(exp[2].Y / exp[1].Y)));

  const k = exp[0].v / (exp[0].X ** 2 * exp[0].Y);
  it('k = 10,58 M⁻²·s⁻¹ del experimento 1', () => cuadra(id, 'La constante de velocidad', k));
  it('y con 0,30 M de X y 0,40 M de Y, v = 0,381 M/s', () =>
    cuadra(id, 'La velocidad con 0,30 M de X y 0,40 M de Y', k * 0.3 ** 2 * 0.4));
});

describe('6a · la trinitroglicerina por Hess', () => {
  const id = 'exfq1213-ord-6-la-trinitroglicerina-por-hess';
  /* C₃H₅N₃O₉(l) → 3 CO₂(g) + 5/2 H₂O(l) + 3/2 N₂(g) + 1/4 O₂(g),
     ΔH = −1541,4 kJ/mol; el N₂ y el O₂ valen cero. */
  const productos = 3 * -393.5 + 2.5 * -285.8;

  it('los productos suman −1895,0 kJ', () =>
    cuadra(id, 'Lo que suman las formaciones de los productos', productos));
  it('y la formación de la trinitroglicerina es −353,6 kJ/mol', () =>
    cuadra(id, 'La entalpía de formación de la trinitroglicerina', productos - -1541.4));
});

describe('6b · el hielo que se funde en agua caliente', () => {
  const id = 'exfq1213-ord-6-el-hielo-que-se-funde-en-agua-caliente';
  /* El enunciado está cortado; los 3600 g de agua a 350 K salen de la
     resolución oficial. */
  const M = 2 * u.H + u.O;
  const nh = 1800 / M;
  const na = 3600 / M;
  const Cph = 36.56;
  const Cpa = 75.39;
  const fusion = 6010;
  const Tfus = T0;
  /* El agua cede al enfriarse lo que el hielo absorbe en tres tramos. */
  const Tf = (na * Cpa * 350 - nh * Cph * (Tfus - 260) - nh * fusion + nh * Cpa * Tfus) / ((na + nh) * Cpa);

  it('la mezcla acaba a 295,66 K', () => cuadra.magnitud(id, 'La temperatura final', Tf, 'K'));
  it('el hielo gana 2981 J/K: dos logaritmos y una división', () =>
    cuadra.magnitud(
      id,
      'La entropía que gana el hielo',
      nh * (Cph * Math.log(Tfus / 260) + fusion / Tfus + Cpa * Math.log(Tf / Tfus)),
      'J/K',
    ));
  it('y el agua pierde 2544 J/K', () =>
    cuadra.magnitud(id, 'La entropía que pierde el agua', na * Cpa * Math.log(Tf / 350), 'J/K'));
});

describe('7 · el carbamato amónico y el NOBr', () => {
  const id = 'exfq1213-ord-7-el-carbamato-amonico-y-el-nobr';

  it('Kp del carbamato = 7,086·10⁻³ atm³', () => {
    /* El sólido no entra; sus gases salen 2 a 1: p(NH₃) = 2p, p(CO₂) = p. */
    const p = 0.363 / 3;
    cuadra(id, 'La constante del carbamato', (2 * p) ** 2 * p);
  });

  /* 2 NOBr ⇌ 2 NO + Br₂: de n moles quedan n(1 − α) y se forman nα y nα/2,
     n(1 + α/2) en total. */
  const a = 0.34;
  const P = 0.25;
  const Kp = (P * a ** 2 * (a / 2)) / ((1 + a / 2) * (1 - a) ** 2);

  it('Kp del NOBr = 9,64·10⁻³ atm', () => cuadra(id, 'La Kp del bromuro de nitrosilo', Kp));
  it('y Kc = Kp/RT = 3,94·10⁻⁴ mol/L, porque Δn = +1', () =>
    cuadra(id, 'La Kc del bromuro de nitrosilo', Kp / (Ratm * (25 + T0))));
});

describe('8 · el cianhídrico, la sosa y su mezcla', () => {
  const id = 'exfq1213-ord-8-el-cianhidrico-la-sosa-y-su-mezcla';
  const Ka = 5.8e-10;
  const Kw = 1e-14;

  it('el HCN 0,1 M tiene pH 5,12', () =>
    cuadra(id, 'El pH del ácido cianhídrico', -Math.log10(Math.sqrt(Ka * 0.1))));
  it('la sosa 0,2 M, pH 13,30', () => cuadra(id, 'El pH de la sosa', 14 + Math.log10(0.2)));

  /* 0,02 mol de cada uno: la equivalencia. Queda NaCN en 300 mL. */
  const C = (0.1 * 0.2) / (0.2 + 0.1);
  const Kh = Kw / Ka;

  it('queda NaCN 0,0667 M', () => {
    if (Math.abs(0.1 * 0.2 - 0.2 * 0.1) > 1e-12) throw new Error('no es el punto de equivalencia');
    cuadra(id, 'La concentración de cianuro sódico en la mezcla', C);
  });
  it('el CN⁻ hidroliza con Kh = Kw/Ka = 1,724·10⁻⁵', () =>
    cuadra(id, 'La constante de hidrólisis del cianuro', Kh));
  it('y la mezcla tiene pH 11,03, no los 11 de la resolución oficial', () => {
    /* La ecuación de segundo grado, sin despreciar x: sale 11,027, dentro. */
    const x = (-Kh + Math.sqrt(Kh ** 2 + 4 * Kh * C)) / 2;
    cuadra(id, 'El pH de la mezcla', 14 + Math.log10(x));
  });
});
