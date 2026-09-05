/**
 * Control del segundo cuatrimestre de Fundamentos Químicos, curso 2023-2024.
 *
 * Nueve respuestas numéricas y el ejercicio más caro del corpus —la hidracina,
 * 4,00 puntos—, cuya trampa está en la primera línea del enunciado: el agua
 * sale **en vapor**, y eso mueve 176 kJ.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';

const cuadra = convocatoria('fundamentos-quimicos', '2023-2024-2c-control');

/* Del enunciado, y de ningún otro sitio. */
const HVAP = 44.03; // kJ/mol
const Hf = { H2O2l: -187.8, H2Ol: -285.8, CO2: -393.5, C8H18: -250.0, H2Olb: -285.85 };
const S0 = { H2O2: 109.6, N2H4: 121.2, H2Ol: 69.9, N2: 191.5, H2: 130.6 };
const Cp = { N2H4: 139.3, N2: 29.1, H2: 28.8 };

describe('1 · la hidracina de los cohetes', () => {
  const id = 'exfq2324-2c-control-1-la-hidracina-de-los-cohetes';

  /* La reacción publicada: N₂H₄(l) + 2 H₂O₂(l) → N₂(g) + 4 H₂O(g), −642 kJ.
     El agua es GAS, y la tabla de datos solo da la líquida. */
  const HfH2Ogas = Hf.H2Ol + HVAP;

  const HfN2H4 = 4 * HfH2Ogas + 0 - 2 * Hf.H2O2l - -642;

  it('la entalpía de formación de la hidracina es +50,52 kJ/mol', () => {
    /* De ΔHr = productos − reactivos se despeja el único término que falta. */
    cuadra(id, 'La entalpía de formación de la hidracina', HfN2H4);
  });

  /* La reacción de formación: N₂(g) + 2 H₂(g) → N₂H₄(l). */
  const dS298 = S0.N2H4 - S0.N2 - 2 * S0.H2;
  const dCp = Cp.N2H4 - Cp.N2 - 2 * Cp.H2;

  it('a 100 °C la entropía de formación es −319,7 J/(mol·K)', () => {
    /* Kirchhoff para la entropía lleva logaritmo, no es lineal: esa es la
       diferencia con la corrección de la entalpía, y el error más repetido
       del tema. */
    cuadra(id, 'La entropía de formación a 100 °C', dS298 + dCp * Math.log(373 / 298));
  });

  it('y la energía libre, +173,7 kJ/mol', () => {
    /* La entalpía a 373 K sí es lineal: ΔH(298) + ΔCp·ΔT. */
    const dH373 = HfN2H4 + (dCp * (373 - 298)) / 1000;
    const dS373 = dS298 + dCp * Math.log(373 / 298);
    cuadra(id, 'La energía libre a 100 °C', dH373 - (373 * dS373) / 1000);
  });
});

describe('2 · el octano y los cuatrocientos kilos de agua', () => {
  const id = 'exfq2324-2c-control-2-el-octano-y-los-cuatrocientos-kilos-de-agua';
  const u = { H: 1.01, C: 12.01, O: 16.0 };

  /* C₈H₁₈ + 25/2 O₂ → 8 CO₂ + 9 H₂O(g). Nueve moles de agua: es donde más
     pesa el estado del agua de todo el corpus. */
  const dHcomb = 8 * Hf.CO2 + 9 * (Hf.H2Olb + HVAP) - Hf.C8H18;

  it('la combustión con agua en vapor da −5.074,4 kJ/mol', () =>
    cuadra(id, 'La combustión del octano, con el agua en vapor', dHcomb));

  /* Llevar un mol de agua de 25 a 120 °C son tres tramos y el de en medio es
     el que se olvida. */
  const qPorMol = (75.31 * 75 + 44030 + 33.56 * 20) / 1000;

  it('un mol de agua de 25 a 120 °C pide 50,35 kJ', () =>
    cuadra(id, 'El calor que hay que dar a un mol de agua', qPorMol));

  it('con el 80 % del calor de 50 L de octano se calientan 458 kg', () => {
    const molOctano = (50e3 * 0.72) / (8 * u.C + 18 * u.H);
    const kJutiles = molOctano * Math.abs(dHcomb) * 0.8;
    const molAgua = kJutiles / qPorMol;
    cuadra(id, 'Y los kilos de agua', (molAgua * (2 * u.H + u.O)) / 1000);
  });
});

describe('3 · cinco signos de entropía', () => {
  it('la entropía aumenta en tres de los cinco procesos', () => {
    /* No hay ninguna cuenta: hay un recuento, y se hace igual de mal. El
       criterio es el desorden, y en el último es que un gas da dos gases. */
    const procesos = [
      { que: 'solidificación del agua', sube: false },
      { que: 'evaporación del isopropílico', sube: true },
      { que: 'sublimación de la cafeína', sube: true },
      { que: 'precipitación del nitrato de plata', sube: false },
      { que: 'PCl₅ (g) → PCl₃ (g) + Cl₂ (g)', sube: true },
    ];
    cuadra(
      'exfq2324-2c-control-3-cinco-signos-de-entropia',
      'Cuántos aumentan',
      procesos.filter((p) => p.sube).length,
    );
  });
});

describe('4 · la peste del estaño', () => {
  const id = 'exfq2324-2c-control-4-la-peste-del-estano';
  /* Sn(blanco) → Sn(gris). */
  const dH = -2.09; // kJ/mol
  const dS = 44.14 - 51.55; // J/(mol·K)

  it('la transformación pierde 7,41 J/(mol·K)', () =>
    cuadra(id, 'La entropía de la transformación', dS));

  it('y ocurre por debajo de 282 K', () => {
    /* En el equilibrio ΔG = 0, así que T = ΔH/ΔS. Los dos son negativos, y
       por eso la espontaneidad va al revés de lo habitual: se da por DEBAJO
       de esa temperatura, no por encima. */
    cuadra(id, 'La temperatura de la transición', (dH * 1000) / dS);
  });
});
