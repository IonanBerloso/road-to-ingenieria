/**
 * La ordinaria de Ingeniería Térmica de enero de 2024.
 *
 * La del exponente politrópico negativo, comprobada por donde menos se parece
 * a la resolución: el trabajo integrando p·dV y el volumen final por la presión
 * en vez de por la temperatura. El aire no trae sus datos en el enunciado —c_v,
 * c_p y R' son los de la resolución, y se dice en cada sitio—, y en el 3 el
 * propio desarrollo tiene un desliz de 0,06 grados que la casilla absorbe.
 */
import { describe, expect, it } from 'vitest';
import { convocatoria } from './corpus';

const cuadra = convocatoria('ingenieria-termica', '2023-2024-ord');
const K = 273.15;

describe('1 · el exponente politrópico negativo', () => {
  const id = 'exter2324-ord-1-el-exponente-politropico-negativo';
  const [m, P1, V1, n, Q] = [5, 250, 2, -0.5, -120]; // kg, kPa, m³, —, kJ
  // el aire, con los valores que usa la resolución: el enunciado no los da
  const [cv, R, gamma] = [0.718, 0.287, 1.4];
  const T1 = (P1 * V1) / (m * R);
  /* El primer principio con el trabajo de la politrópica metido dentro,
     Q = m·c_v·ΔT + m·R'·(T₁ − T₂)/(n − 1), es lineal en ΔT. */
  const T2 = T1 + Q / (m * (cv - R / (n - 1)));

  it('el aire acaba a 322,04 K, por el primer principio y por el calor específico politrópico', () => {
    const cn = (cv * (n - gamma)) / (n - 1);
    expect(cn).toBeGreaterThan(0); // con n < 0, ceder calor enfría
    expect(Math.abs(T1 + Q / (m * cn) - T2)).toBeLessThan(0.01);
    cuadra.magnitud(id, 'La temperatura final', T2, 'K');
  });

  // el volumen por la presión: T·P^((1−n)/n) se conserva, y luego la ecuación de estado
  const P2 = P1 * (T2 / T1) ** (n / (n - 1));
  const V2 = (m * R * T2) / P2;

  it('el volumen baja a 1,898 m³ y la presión también: las dos a la vez', () => {
    expect(Math.abs(V2 - V1 * (T1 / T2) ** (1 / (n - 1)))).toBeLessThan(1e-12);
    expect(P2).toBeLessThan(P1);
    expect(V2).toBeLessThan(V1);
    cuadra.magnitud(id, 'El volumen final', V2, 'm^3');
  });

  it('y el gas recibe 25,26 kJ de trabajo mientras cede calor, por la integral y por el primer principio', () => {
    // ∫p·dV con p = P₁·(V/V₁)^(−n), integrada en cerrado
    const porIntegral = (P1 * V1 ** n * (V2 ** (1 - n) - V1 ** (1 - n))) / (1 - n);
    const porPrimerPrincipio = Q - m * cv * (T2 - T1);
    expect(Math.abs(porIntegral - porPrimerPrincipio)).toBeLessThan(1e-9);
    cuadra.magnitud(id, 'El trabajo', porIntegral, 'kJ');
  });
});

describe('2 · el motor térmico que mueve un compresor', () => {
  const id = 'exter2324-ord-2-el-motor-que-mueve-un-compresor';
  const [Tc, Tf, Qc] = [300 + K, 20 + K, 60];
  const T0 = 20 + K;
  const W = 0.8 * (1 - Tf / Tc) * Qc;

  it('el motor le da 23,46 kW al compresor, y rinde en exergía justo el 80 % del enunciado', () => {
    // con T₀ igual al foco frío, la exergía del calor que entra es el trabajo de Carnot
    expect(W / (Qc * (1 - T0 / Tc))).toBeCloseTo(0.8, 12);
    cuadra.magnitud(id, 'La potencia del compresor', W, 'kW');
  });

  // el compresor: c_p es el de la resolución, y R' el del ejercicio 1 de este mismo examen
  const [m, cp, R] = [0.1, 1.005, 0.287];
  const [T1, T2, P1, P2] = [20 + K, 150 + K, 1, 5];
  const dH = m * cp * (T2 - T1);
  const Qcomp = dH - W; // volumen de control: Q = ΔH + W, con los 23,46 kW entrando

  it('el compresor cede 10,39 kW: entra más trabajo del que el aire se queda', () => {
    expect(Qcomp).toBeLessThan(0);
    cuadra.magnitud(id, 'El calor del compresor', Qcomp, 'kW');
  });

  it('y destruye 5,78 kW, con la frontera a la temperatura media del aire', () => {
    const Tsup = (T1 + T2) / 2; // la frontera que declara la pregunta
    const dS = m * (cp * Math.log(T2 / T1) - R * Math.log(P2 / P1));
    const SG = dS - Qcomp / Tsup;
    /* El balance de exergía: entra el trabajo, el aire gana exergía de flujo y
       el calor sale por una frontera a 358 K llevándose la suya. */
    const porBalance = W - (dH - T0 * dS) + Qcomp * (1 - T0 / Tsup);
    expect(Math.abs(porBalance - T0 * SG)).toBeLessThan(1e-9 * porBalance);
    // con el ambiente en el denominador saldría un tercio más: la frontera decide
    expect((T0 * dS - Qcomp) / porBalance).toBeGreaterThan(1.3);
    cuadra.magnitud(id, 'La exergía destruida', porBalance, 'kW');
  });
});

describe('3 · cuatro incógnitas en la misma cadena', () => {
  const id = 'exter2324-ord-3-cuatro-incognitas-en-la-misma-cadena';
  const L = 5;
  const [D1, D2] = [0.15, 0.18];
  // el agua a su temperatura media, 84,94 °C —entra a 85 y sale a 84,88—, y el
  // h de la resolución oficial, que es lo que publica la nota del enunciado
  const [Q, tAgua, t3, tAire] = [8000, (85 + 84.88) / 2, 71, 15];
  const [kAcero, kMag, hInt] = [14, 2.69, 3957.9];
  const [k, nu, Pr] = [0.02684, 1.7308e-5, 0.7247]; // el aire a 43 °C

  const t1 = tAgua - Q / (hInt * Math.PI * D1 * L);
  const t2 = t1 - (Q * Math.log(D2 / D1)) / (2 * Math.PI * kAcero * L);
  // la resistencia que falta hasta los 71 °C medidos, despejada en el radio
  const r3 = (D2 / 2) * Math.exp(((t2 - t3) * 2 * Math.PI * kMag * L) / Q);

  it('la cara interior del acero está a 84,1 °C', () => {
    /* La primera pasada encontró que el desarrollo escribía 85 − Q/(h·A) =
       84,08 y que esa cuenta da 84,14. Mirada la resolución oficial, el
       fallo era del corpus: se parte de la temperatura MEDIA del agua, 84,94,
       y el h es 3957,9 y no 3947. Corregido el 12 de septiembre de 2026; con
       los datos de la fuente sale exactamente el 84,08. */
    expect(t1).toBeCloseTo(84.08, 2);
    cuadra.magnitud(id, 'La superficie interior del acero', t1, '°C');
  });

  it('la magnesita mide 9,8 mm', () =>
    cuadra.magnitud(id, 'El espesor de la magnesita', 1000 * (r3 - D2 / 2), 'mm'));

  it('y el viento sopla a 16,1 m/s, con la correlación del rango bajo esta vez', () => {
    // Nu = h₃·D₃/k = Q/(π·L·Δθ·k): el Reynolds no depende del espesor, la velocidad sí
    const Nu = Q / (Math.PI * L * (t3 - tAire) * k);
    const reynolds = (C: number, e: number) => (Nu / (C * Pr ** (1 / 3))) ** (1 / e);
    const [reBajo, reAlto] = [reynolds(0.26, 0.6), reynolds(0.076, 0.7)];
    expect(reBajo).toBeGreaterThan(1000);
    expect(reBajo).toBeLessThan(2e5);
    expect(reAlto).toBeLessThan(2e5); // la del rango alto no llega a donde empieza
    cuadra.magnitud(id, 'La velocidad del viento', (reBajo * nu) / (2 * r3), 'm/s');
  });
});
