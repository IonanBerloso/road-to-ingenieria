/**
 * Final del segundo cuatrimestre de Fundamentos Químicos, curso 2024-2025.
 *
 * Quince respuestas numéricas y las cuatro familias del cuatrimestre en un
 * solo examen: termodinámica, termoquímica, equilibrio y redox. Es la
 * convocatoria que más ramas distintas verifica de una vez.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';

const cuadra = convocatoria('fundamentos-quimicos', '2024-2025-2c');

const R = 8.314; // J/(mol·K)
const Ratm = 0.0820574; // L·atm/(mol·K)
const F = 96485; // C/mol
const T25 = 298.15;

describe('1 · el ciclo sin un solo número', () => {
  it('el trabajo es positivo en dos de los cuatro tramos', () => {
    /* Sin números: el criterio es el signo del cambio de volumen, con el
       convenio del enunciado —se comprime, W > 0—. AB y BC expanden; CD y DA
       comprimen. */
    const tramos = [
      { de: 'A', a: 'B', comprime: false },
      { de: 'B', a: 'C', comprime: false },
      { de: 'C', a: 'D', comprime: true },
      { de: 'D', a: 'A', comprime: true },
    ];
    cuadra(
      'exfq2425-2c-1-el-ciclo-sin-un-solo-numero',
      'Cuántos tramos tienen trabajo positivo',
      tramos.filter((t) => t.comprime).length,
    );
  });
});

describe('2 · el eteno y los diez kilos de aluminio', () => {
  const id = 'exfq2425-2c-2-el-eteno-y-los-diez-kilos-de-aluminio';
  /* Datos del enunciado. */
  const Gf = { H2Ol: -237.18, CO2: -394.36, C2H4: 68.12 };
  const Cp = { H2Ol: 75.33, CO2: 37.11, C2H4: 42.84, O2: 29.4, Al: 24.29 };
  const dHcomb = -1422.6; // kJ, la tercera reacción del enunciado

  it('la combustión del eteno pierde 306,6 J/K', () => {
    /* La entropía no está tabulada: sale de ΔG = ΔH − TΔS, con ΔG calculada
       de las energías libres de formación. */
    const dG = 2 * Gf.CO2 + 2 * Gf.H2Ol - Gf.C2H4;
    cuadra(id, 'La entropía de la combustión', ((dHcomb - dG) / T25) * 1000);
  });

  it('el ΔCp de la combustión es 93,84 J/(mol·K)', () => {
    /* C₂H₄ + 3 O₂ → 2 CO₂ + 2 H₂O(l). */
    cuadra(id, 'El ΔCp, que es donde se decide el apartado b', 2 * Cp.CO2 + 2 * Cp.H2Ol - Cp.C2H4 - 3 * Cp.O2);
  });

  it('los moles de gas bajan en dos', () => {
    /* El agua sale LÍQUIDA, así que no cuenta: dos gases contra cuatro. */
    const gasProductos = 2; // 2 CO₂
    const gasReactivos = 1 + 3; // C₂H₄ y 3 O₂
    cuadra(id, 'Los moles de gas que cambian', gasProductos - gasReactivos);
  });

  const molAl = 10000 / 27;
  const Tfus = 658 + 273.15;
  const qPorMolAl = (Cp.Al * (Tfus - T25)) / 1000 + 10.67;

  it('fundir 10 kg de aluminio desde 25 °C pide 9.647 kJ', () =>
    cuadra(id, 'El calor que pide el aluminio', molAl * qPorMolAl));

  it('y el aluminio gana 14,49 kJ/K de entropía', () => {
    /* Dos tramos, y solo el primero lleva logaritmo: calentar es ∫Cp dT/T,
       fundir es ΔH/T a temperatura constante. */
    const calentando = (molAl * Cp.Al * Math.log(Tfus / T25)) / 1000;
    const fundiendo = (molAl * 10670) / Tfus / 1000;
    cuadra(id, 'La entropía que gana el aluminio', calentando + fundiendo);
  });
});

describe('3 · el gas de agua', () => {
  const id = 'exfq2425-2c-3-el-gas-de-agua-y-el-volumen-que-no-importa';
  const T1000 = 1000 + 273.15;

  /* 5,0 mol de H₂O y 4,0 mol de CO en 10 L; en el equilibrio hay 2,0 de CO₂,
     así que han reaccionado 2,0 de cada reactivo. */
  const eq = { H2O: 3, CO: 2, H2: 2, CO2: 2 };
  const Kc = (eq.H2 * eq.CO2) / (eq.H2O * eq.CO);

  it('Kc a 1000 °C vale 0,667', () => {
    /* Δn = 0, así que el volumen se cancela y Kc sale de los moles tal cual. */
    cuadra(id, 'La constante a 1000 °C', Kc);
  });

  it('en el nuevo equilibrio el H₂ está a 37,6 atm', () => {
    /* Se quita 1 mol de agua y se pasa a 5 L. Como Δn = 0, el cambio de
       volumen NO mueve el equilibrio; lo que lo mueve es haber quitado agua.
       Q = 1 > Kc, así que retrocede. */
    const n = { H2O: 2, CO: 2, H2: 2, CO2: 2 };
    /* (2−y)² / (2+y)² = Kc → (2−y)/(2+y) = √Kc */
    const r = Math.sqrt(Kc);
    const y = (2 - 2 * r) / (1 + r);
    const nH2 = n.H2 - y;
    cuadra(id, 'La presión parcial del hidrógeno en el nuevo equilibrio', (nH2 * Ratm * T1000) / 5);
  });

  it('al enfriar hasta 25 °C la constante crece en un factor e^12,91', () => {
    /* Van't Hoff. La reacción es exotérmica, así que enfriar la favorece. */
    const dH = -41800; // J
    cuadra(id, 'Cuánto crece la constante al enfriar', (-dH / R) * (1 / T25 - 1 / T1000));
  });
});

describe('4 · el amoníaco y cuatro regímenes', () => {
  const id = 'exfq2425-2c-4-el-amoniaco-y-cuatro-regimenes';
  const Kb = 1.8e-5;
  const Kw = 1e-14;
  const mmolBase = 10 * 0.25; // 10 mL de NH₄OH 0,25 M

  it('con sosa el pH es 12,85', () => {
    /* La sosa es base fuerte y aplasta la contribución del amoníaco. */
    const mmolNaOH = 25 * 0.1;
    const OH = mmolNaOH / (10 + 25);
    cuadra(id, 'Con sosa', 14 + Math.log10(OH));
  });

  it('con clorhídrico el pH es 5,20', () => {
    /* 2,5 mmol de HCl contra 2,5 mmol de base: punto de equivalencia exacto,
       así que lo que queda es la sal de un ácido débil, que hidroliza. */
    const mmolHCl = 25 * 0.1;
    if (Math.abs(mmolHCl - mmolBase) > 1e-9) throw new Error('no es el punto de equivalencia');
    const c = mmolBase / (10 + 25);
    const Ka = Kw / Kb;
    cuadra(id, 'Con clorhídrico', -Math.log10(Math.sqrt(Ka * c)));
  });

  it('con nitrato amónico el pH es 9,18', () => {
    /* Aquí no se neutraliza nada: se añade la base conjugada… al revés, se
       añade el ÁCIDO conjugado. Queda un tampón. */
    const mmolSal = 30 * 0.1;
    const pOH = -Math.log10(Kb) + Math.log10(mmolSal / mmolBase);
    cuadra(id, 'Con nitrato amónico', 14 - pOH);
  });
});

describe('5 · la pila de cobre y hierro', () => {
  const id = 'exfq2425-2c-5-la-pila-de-cobre-y-hierro';
  /* Los dos potenciales son POSITIVOS a propósito: el atajo de «el negativo
     es el ánodo» no sirve y hay que comparar de verdad. */
  const E = { CuI: 0.521, FeIII: 0.77 };
  const n = 1;
  const E0 = E.FeIII - E.CuI;

  it('el potencial estándar de la pila es 0,249 V', () => cuadra(id, 'El potencial estándar', E0));

  it('y su constante de equilibrio, ln K = 9,69', () =>
    cuadra(id, 'La constante de equilibrio', (n * F * E0) / (R * T25)));

  it('con las concentraciones del enunciado sube a 0,586 V', () => {
    /* Cu + Fe³⁺ → Cu⁺ + Fe²⁺, así que Q = [Cu⁺][Fe²⁺]/[Fe³⁺]. */
    const Q = (1e-3 * 2e-5) / 1e-2;
    cuadra(id, 'El potencial con esas concentraciones', E0 - ((R * T25) / (n * F)) * Math.log(Q));
  });
});
