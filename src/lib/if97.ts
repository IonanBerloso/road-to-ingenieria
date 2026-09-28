/**
 * El agua y su vapor según IAPWS-IF97, la formulación industrial de 1997
 * («Revised Release on the IAPWS Industrial Formulation 1997 for the
 * Thermodynamic Properties of Water and Steam», IAPWS, 2007).
 *
 * Nace el 28 de septiembre de 2026 con la fase F1 de la auditoría, y no es de
 * donde salen las tablas de vapor de Térmica: esas salen de la formulación
 * científica, `iapws95.ts`, que es la del anexo del curso (allí está el
 * porqué). Esta es su contraprueba. Se ajustó a IAPWS-95 por separado,
 * término a término, así que las dos coincidiendo es una comprobación
 * independiente del cálculo de `iapws95.ts` (`tests/fisica/vapor.test.ts`).
 * No la usa ninguna página.
 *
 * Tres regiones: la 1 (líquido), la 2 (vapor) y la 4 (la curva de
 * saturación), y la frontera entre la 2 y la 3. Cada región es una función de
 * Gibbs adimensional γ(π, τ); todo lo demás sale de derivarla.
 *
 * Unidades, las del estándar: presión en MPa, temperatura en K, volumen en
 * m³/kg, energías en kJ/kg y entropías en kJ/(kg·K). La conversión a bar y °C,
 * que es como escribe el curso, la hace quien pinta.
 *
 * Los coeficientes se comprueban en `tests/fisica/vapor.test.ts` contra los
 * valores de verificación del propio estándar, con nueve cifras: un
 * coeficiente mal copiado no pasa.
 */

/** Constante específica del agua, kJ/(kg·K). */
export const R = 0.461526;

/** Un estado del agua: presión (MPa), temperatura (K) y sus propiedades. */
export interface Estado {
  p: number;
  T: number;
  /** Volumen específico, m³/kg. */
  v: number;
  /** Entalpía específica, kJ/kg. */
  h: number;
  /** Energía interna específica, kJ/kg. */
  u: number;
  /** Entropía específica, kJ/(kg·K). */
  s: number;
  /** Calor específico a presión constante, kJ/(kg·K). */
  cp: number;
}

/* ── región 1: el líquido ─────────────────────────────────────────────
   γ(π, τ) = Σ nᵢ (7,1 − π)^Iᵢ (τ − 1,222)^Jᵢ, con π = p/16,53 MPa y
   τ = 1386 K / T. Tabla 2 del estándar: [I, J, n]. */
const P1 = 16.53;
const T1 = 1386;
const R1: ReadonlyArray<readonly [number, number, number]> = [
  [0, -2, 0.14632971213167], [0, -1, -0.84548187169114], [0, 0, -0.3756360367204e1],
  [0, 1, 0.33855169168385e1], [0, 2, -0.95791963387872], [0, 3, 0.15772038513228],
  [0, 4, -0.16616417199501e-1], [0, 5, 0.81214629983568e-3], [1, -9, 0.28319080123804e-3],
  [1, -7, -0.60706301565874e-3], [1, -1, -0.18990068218419e-1], [1, 0, -0.32529748770505e-1],
  [1, 1, -0.21841717175414e-1], [1, 3, -0.5283835796993e-4], [2, -3, -0.47184321073267e-3],
  [2, 0, -0.30001780793026e-3], [2, 1, 0.47661393906987e-4], [2, 3, -0.44141845330846e-5],
  [2, 17, -0.72694996297594e-15], [3, -4, -0.31679644845054e-4], [3, 0, -0.28270797985312e-5],
  [3, 6, -0.85205128120103e-9], [4, -5, -0.22425281908e-5], [4, -2, -0.65171222895601e-6],
  [4, 10, -0.14341729937924e-12], [5, -8, -0.40516996860117e-6], [8, -11, -0.12734301741641e-8],
  [8, -6, -0.17424871230634e-9], [21, -29, -0.68762131295531e-18], [23, -31, 0.14478307828521e-19],
  [29, -38, 0.26335781662795e-22], [30, -39, -0.11947622640071e-22], [31, -40, 0.18228094581404e-23],
  [32, -41, -0.93537087292458e-25],
];

/** El líquido (región 1) a `p` MPa y `T` K. */
export function region1(p: number, T: number): Estado {
  const pi = p / P1;
  const tau = T1 / T;
  const a = 7.1 - pi;
  const b = tau - 1.222;
  let g = 0;
  let gp = 0;
  let gt = 0;
  let gtt = 0;
  for (const [I, J, n] of R1) {
    g += n * a ** I * b ** J;
    gp += -n * I * a ** (I - 1) * b ** J;
    gt += n * a ** I * J * b ** (J - 1);
    gtt += n * a ** I * J * (J - 1) * b ** (J - 2);
  }
  return {
    p,
    T,
    v: (pi * gp * R * T) / (p * 1000),
    h: tau * gt * R * T,
    u: (tau * gt - pi * gp) * R * T,
    s: (tau * gt - g) * R,
    cp: -tau * tau * gtt * R,
  };
}

/* ── región 2: el vapor ───────────────────────────────────────────────
   γ = γ° + γʳ, con π = p/1 MPa y τ = 540 K / T. La parte de gas ideal,
   γ° = ln π + Σ n°ᵢ τ^J°ᵢ (tabla 10), y la residual,
   γʳ = Σ nᵢ π^Iᵢ (τ − 0,5)^Jᵢ (tabla 11). */
const T2 = 540;
const R2_IDEAL: ReadonlyArray<readonly [number, number]> = [
  [0, -0.96927686500217e1], [1, 0.10086655968018e2], [-5, -0.5608791128302e-2],
  [-4, 0.71452738081455e-1], [-3, -0.40710498223928], [-2, 0.14240819171444e1],
  [-1, -0.4383951131945e1], [2, -0.28408632460772], [3, 0.21268463753307e-1],
];
const R2_RESIDUAL: ReadonlyArray<readonly [number, number, number]> = [
  [1, 0, -0.17731742473213e-2], [1, 1, -0.17834862292358e-1], [1, 2, -0.45996013696365e-1],
  [1, 3, -0.57581259083432e-1], [1, 6, -0.5032527872793e-1], [2, 1, -0.33032641670203e-4],
  [2, 2, -0.18948987516315e-3], [2, 4, -0.39392777243355e-2], [2, 7, -0.43797295650573e-1],
  [2, 36, -0.26674547914087e-4], [3, 0, 0.20481737692309e-7], [3, 1, 0.43870667284435e-6],
  [3, 3, -0.3227767723857e-4], [3, 6, -0.15033924542148e-2], [3, 35, -0.40668253562649e-1],
  [4, 1, -0.78847309559367e-9], [4, 2, 0.12790717852285e-7], [4, 3, 0.48225372718507e-6],
  [5, 7, 0.22922076337661e-5], [6, 3, -0.16714766451061e-10], [6, 16, -0.21171472321355e-2],
  [6, 35, -0.23895741934104e2], [7, 0, -0.5905956432427e-17], [7, 11, -0.12621808899101e-5],
  [7, 25, -0.38946842435739e-1], [8, 8, 0.11256211360459e-10], [8, 36, -0.82311340897998e1],
  [9, 13, 0.19809712802088e-7], [10, 4, 0.10406965210174e-18], [10, 10, -0.10234747095929e-12],
  [10, 14, -0.10018179379511e-8], [16, 29, -0.80882908646985e-10], [16, 50, 0.10693031879409],
  [18, 57, -0.33662250574171], [20, 20, 0.89185845355421e-24], [20, 35, 0.30629316876232e-12],
  [20, 48, -0.42002467698208e-5], [21, 21, -0.59056029685639e-25], [22, 53, 0.37826947613457e-5],
  [23, 39, -0.12768608934681e-14], [24, 26, 0.73087610595061e-28], [24, 40, 0.55414715350778e-16],
  [24, 58, -0.9436970724121e-6],
];

/** El vapor (región 2) a `p` MPa y `T` K. */
export function region2(p: number, T: number): Estado {
  const pi = p;
  const tau = T2 / T;
  let g0 = Math.log(pi);
  let g0t = 0;
  let g0tt = 0;
  for (const [J, n] of R2_IDEAL) {
    g0 += n * tau ** J;
    g0t += n * J * tau ** (J - 1);
    g0tt += n * J * (J - 1) * tau ** (J - 2);
  }
  const g0p = 1 / pi;
  const b = tau - 0.5;
  let gr = 0;
  let grp = 0;
  let grt = 0;
  let grtt = 0;
  for (const [I, J, n] of R2_RESIDUAL) {
    gr += n * pi ** I * b ** J;
    grp += n * I * pi ** (I - 1) * b ** J;
    grt += n * pi ** I * J * b ** (J - 1);
    grtt += n * pi ** I * J * (J - 1) * b ** (J - 2);
  }
  return {
    p,
    T,
    v: (pi * (g0p + grp) * R * T) / (p * 1000),
    h: tau * (g0t + grt) * R * T,
    u: (tau * (g0t + grt) - pi * (g0p + grp)) * R * T,
    s: (tau * (g0t + grt) - (g0 + gr)) * R,
    cp: -tau * tau * (g0tt + grtt) * R,
  };
}

/* ── región 4: la curva de saturación ────────────────────────────────
   Una sola ecuación cuadrática en β = (p/1 MPa)^¼ y ϑ = T/1 K + n₉/(T/1 K − n₁₀),
   que se despeja en los dos sentidos (tabla 34). */
const N4 = [
  0.11670521452767e4, -0.72421316703206e6, -0.17073846940092e2, 0.1202082470247e5,
  -0.32325550322333e7, 0.1491510861353e2, -0.48232657361591e4, 0.40511340542057e6,
  -0.23855557567849, 0.65017534844798e3,
] as const;

/** Presión de saturación, MPa, a `T` K (de 273,15 K al punto crítico). */
export function presionDeSaturacion(T: number): number {
  const [n1, n2, n3, n4, n5, n6, n7, n8, n9, n10] = N4;
  const th = T + n9 / (T - n10);
  const A = th * th + n1 * th + n2;
  const B = n3 * th * th + n4 * th + n5;
  const C = n6 * th * th + n7 * th + n8;
  return ((2 * C) / (-B + Math.sqrt(B * B - 4 * A * C))) ** 4;
}

/** Temperatura de saturación, K, a `p` MPa (de 611,213 Pa al punto crítico). */
export function temperaturaDeSaturacion(p: number): number {
  const [n1, n2, n3, n4, n5, n6, n7, n8, n9, n10] = N4;
  const be = p ** 0.25;
  const E = be * be + n3 * be + n6;
  const F = n1 * be * be + n4 * be + n7;
  const G = n2 * be * be + n5 * be + n8;
  const D = (2 * G) / (-F - Math.sqrt(F * F - 4 * E * G));
  return (n10 + D - Math.sqrt((n10 + D) ** 2 - 4 * (n9 + n10 * D))) / 2;
}

/* ── la frontera entre las regiones 2 y 3 ────────────────────────────
   Una cuadrática en T (ecuaciones 5 y 6 del estándar). Por encima de ella, y
   por encima de 623,15 K, empieza la región 3, que este módulo no cubre. */
const N23 = [0.34805185628969e3, -0.11671859879975e1, 0.10192970039326e-2, 0.57254459862746e3, 0.1391883977887e2] as const;

/** Presión, MPa, de la frontera 2-3 a `T` K. */
export function presionFrontera23(T: number): number {
  const [n1, n2, n3] = N23;
  return n1 + n2 * T + n3 * T * T;
}

/** Temperatura, K, de la frontera 2-3 a `p` MPa. */
export function temperaturaFrontera23(p: number): number {
  const [, , n3, n4, n5] = N23;
  return n4 + Math.sqrt((p - n5) / n3);
}
