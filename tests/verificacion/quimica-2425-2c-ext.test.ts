/**
 * Extraordinaria del segundo cuatrimestre de Fundamentos Químicos, curso
 * 2024-2025.
 *
 * Catorce respuestas numéricas. Es la convocatoria con las cadenas más
 * indirectas del corpus: casi ningún apartado sale de un dato del enunciado,
 * salen de combinar dos reacciones o dos temperaturas.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';

const cuadra = convocatoria('fundamentos-quimicos', '2024-2025-2c-ext');

const R = 8.314;
const T25 = 298.15;

describe('1 · el etanol y la gasolina', () => {
  const id = 'exfq2425-2c-ext-1-el-etanol-y-la-gasolina';
  /* Los pesos atómicos son los del enunciado, redondeados a enteros: C-12,
     O-16, H-1. Usar los de cuatro cifras daría otro número en el apartado
     del kJ por gramo. */
  const u = { C: 12, O: 16, H: 1 };
  const Hf = { C2H6: -84.7, CO2: -393.5, H2Og: -241.8 };
  const S0 = { C2H6: 229.5, O2: 205, CO2: 213.6, H2Og: 188.7 };
  const HcombEtanol = -1235.0;
  const ScombEtanol = 217.7;

  /* C₂H₆ + 7/2 O₂ → 2 CO₂ + 3 H₂O(g). El agua sale en VAPOR: la tabla del
     enunciado solo da la gaseosa, y ahí está la coherencia. */
  const HcombEtano = 2 * Hf.CO2 + 3 * Hf.H2Og - Hf.C2H6;

  it('la combustión del etano da −1.427,7 kJ/mol', () =>
    cuadra(id, 'La combustión del etano', HcombEtano));

  it('la oxidación de etano a etanol da −192,7 kJ/mol', () => {
    /* Hess: la oxidación es la combustión del etano menos la del etanol. */
    cuadra(id, 'La oxidación de etano a etanol', HcombEtano - HcombEtanol);
  });

  it('el etanol libera 26,8 kJ por gramo', () => {
    const M = 2 * u.C + 6 * u.H + u.O; // C₂H₅OH
    cuadra(id, 'El calor por gramo, que es lo que decide en un depósito', Math.abs(HcombEtanol) / M);
  });

  const ScombEtano = 2 * S0.CO2 + 3 * S0.H2Og - S0.C2H6 - 3.5 * S0.O2;

  it('la combustión del etano gana 46,3 J/(mol·K)', () =>
    cuadra(id, 'La entropía de la combustión del etano', ScombEtano));

  it('a 1200 K el etanol sí se transforma en etano: ΔG = −13,0 kJ', () => {
    /* La transformación es la INVERSA de la oxidación, así que los dos signos
       se dan la vuelta. Y su entropía sale de la misma resta de combustiones
       que la entalpía. */
    const dH = -(HcombEtano - HcombEtanol);
    const dS = -(ScombEtano - ScombEtanol);
    cuadra(id, 'Y a 1200 K, ¿se da la vuelta la reacción?', dH - (1200 * dS) / 1000);
  });
});

describe('2 · el fosgeno', () => {
  const id = 'exfq2425-2c-ext-2-el-fosgeno-y-la-raiz-que-sobra';
  /* En 1 L, así que los moles son concentraciones. */
  const eq = { CO: 0.0225, Cl2: 0.0225, COCl2: 0.109 };
  const Kc = (eq.CO * eq.Cl2) / eq.COCl2;

  it('Kc a 527 °C vale 4,645·10⁻³', () => cuadra(id, 'La constante', Kc));

  it('al añadir 0,02 mol de Cl₂ el CO baja a 0,01529 M', () => {
    /* Q sube por encima de Kc, así que el equilibrio retrocede. Se resuelve
       la cuadrática y se descarta la raíz que deja concentraciones negativas
       — de ahí el nombre del ejercicio. */
    const cl2 = eq.Cl2 + 0.02;
    /* (CO−y)(Cl₂−y)/(COCl₂+y) = Kc */
    const a = 1;
    const b = -(eq.CO + cl2 + Kc);
    const c = eq.CO * cl2 - Kc * eq.COCl2;
    const raices = [(-b - Math.sqrt(b * b - 4 * a * c)) / 2, (-b + Math.sqrt(b * b - 4 * a * c)) / 2];
    const y = raices.find((r) => r > 0 && r < eq.CO);
    if (y === undefined) throw new Error('ninguna raíz deja concentraciones positivas');
    cuadra(id, 'El nuevo equilibrio', eq.CO - y);
  });

  it('el calor de descomposición son 80,5 kJ', () => {
    /* Van't Hoff entre 100 y 527 °C. El enunciado da constantes Kc y la
       fórmula pide Kp; el examen usa Kc directamente y la resolución del
       corpus hace lo mismo, así que aquí también — lo que se verifica es que
       la cuenta del camino elegido aterriza donde dice. */
    const T1 = 100 + 273.15;
    const T2 = 527 + 273.15;
    const K1 = 4.51e-9;
    const dH = (-R * Math.log(Kc / K1)) / (1 / T2 - 1 / T1);
    cuadra(id, 'El calor de descomposición', dH / 1000);
  });
});

describe('3 · el ácido láctico y los tres regímenes', () => {
  const id = 'exfq2425-2c-ext-3-el-acido-lactico-y-los-tres-regimenes';
  const Ka = 1.37e-4;
  const Kw = 1e-14;
  const pKa = -Math.log10(Ka);
  const mmolAcido = 25 * 1; // 25 mL de disolución 1 M

  it('el ácido 1 M está disociado un 1,16 %', () => {
    /* Sin aproximar: x²/(1−x) = Ka, que con Ka de este tamaño ya se separa
       del resultado aproximado en la segunda cifra. */
    const x = (-Ka + Math.sqrt(Ka * Ka + 4 * Ka)) / 2;
    cuadra(id, 'El grado de ionización', x * 100);
  });

  it('con 10 mL de sosa el pH es 4,47', () => {
    /* Tampón: queda ácido sin neutralizar y su base conjugada. */
    const mmolBase = 10 * 2;
    cuadra(id, 'Con 10 mL de sosa', pKa + Math.log10(mmolBase / (mmolAcido - mmolBase)));
  });

  it('en el punto de equivalencia el pH es 8,84', () => {
    /* 12,5 mL × 2 M = 25 mmol, justo los del ácido. Lo que queda es lactato,
       que hidroliza: la disolución es BÁSICA, no neutra. */
    const mmolBase = 12.5 * 2;
    if (Math.abs(mmolBase - mmolAcido) > 1e-9) throw new Error('no es el punto de equivalencia');
    const c = mmolAcido / (25 + 12.5);
    const Kb = Kw / Ka;
    cuadra(id, 'Con 12,5 mL, el punto de equivalencia', 14 + Math.log10(Math.sqrt(Kb * c)));
  });

  it('con 14 mL manda la sosa que sobra: pH 12,89', () => {
    const mmolBase = 14 * 2;
    const OH = (mmolBase - mmolAcido) / (25 + 14);
    cuadra(id, 'Con 14 mL, cuando ya sobra base', 14 + Math.log10(OH));
  });
});

describe('4 · el yodo y los dos cobres', () => {
  const id = 'exfq2425-2c-ext-4-el-yodo-y-los-dos-cobres';
  const E0 = { I2: 0.54, CuI: 0.52, CuII: 0.34 };

  it('la pila más espontánea da 0,20 V', () => {
    /* Tres pares dan tres parejas posibles, y la mejor es la de mayor
       diferencia — no la que junta los dos potenciales más altos. */
    const pares = Object.values(E0);
    const mejor = Math.max(
      ...pares.flatMap((a, i) => pares.slice(i + 1).map((b) => Math.abs(a - b))),
    );
    cuadra(id, 'El potencial de la pila en condiciones estándar', mejor);
  });

  it('el electrodo de yodo sube a 0,658 V', () => {
    /* I₂(s) + 2e⁻ → 2 I⁻, con n = 2 y el sólido fuera del cociente. Bajar el
       yoduro a 10⁻² M favorece la reducción, así que el potencial sube. */
    const n = 2;
    const Q = Math.pow(1e-2, 2);
    cuadra(id, 'El potencial del electrodo de yodo', E0.I2 - ((R * T25) / (n * 96485)) * Math.log(Q));
  });
});
