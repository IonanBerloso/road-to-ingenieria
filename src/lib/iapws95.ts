/**
 * El agua y su vapor según IAPWS-95, la formulación científica («Revised
 * Release on the IAPWS Formulation 1995 for the Thermodynamic Properties of
 * Ordinary Water Substance for General and Scientific Use», IAPWS, 2018).
 *
 * Es la de las tablas de Térmica, y no la industrial (`if97.ts`), porque es
 * la del anexo del curso: sus tablas de saturación y su vapor sobrecalentado
 * hasta 1000 °C salen de ella, con cinco cifras significativas. Lo que el
 * anexo saca de otra fuente —la fila de 0,01 °C, las de 1100 a 1300 °C y el
 * líquido comprimido— lo recoge `anexo-vapor.ts`. Con IF97, h' a 0,5 bar da
 * 340,48 donde el anexo dice 340,54, y en la bomba de la ordinaria de 2025-2026 eso
 * mueve el rendimiento del 61,6 % del profesor al 59,4 %. Lo midió la fase F1
 * de la auditoría del 27 de septiembre de 2026.
 *
 * Una sola ecuación, la energía libre de Helmholtz adimensional
 * φ(δ, τ) = φ°(δ, τ) + φʳ(δ, τ), con δ = ρ/ρc y τ = Tc/T, vale para todo:
 * líquido, vapor, la zona del punto crítico y la saturación, que sale de
 * igualar presión y energía libre de Gibbs en las dos fases.
 *
 * Unidades: temperatura en K, densidad en kg/m³, presión en MPa, energías en
 * kJ/kg y entropías en kJ/(kg·K). Los coeficientes se comprueban en
 * `tests/fisica/vapor.test.ts` contra los valores de verificación del
 * propio estándar, con nueve cifras.
 *
 * No importa nada: así lo puede leer `node` tal cual, sin un cargador, desde
 * `scripts/tablas-vapor.mjs`, que es quien escribe las tablas.
 */

/** Temperatura crítica, K. */
export const TC = 647.096;
/** Densidad crítica, kg/m³. */
export const RHOC = 322;
/** Constante específica del agua en IAPWS-95, kJ/(kg·K). */
export const R = 0.46151805;

/** Un estado del agua. */
export interface Estado {
  /** Temperatura, K. */
  T: number;
  /** Densidad, kg/m³. */
  rho: number;
  /** Presión, MPa. */
  p: number;
  /** Volumen específico, m³/kg. */
  v: number;
  /** Energía interna, entalpía: kJ/kg. */
  u: number;
  h: number;
  /** Entropía y calores específicos: kJ/(kg·K). */
  s: number;
  cv: number;
  cp: number;
  /** Velocidad del sonido, m/s. */
  w: number;
}

/** La energía libre adimensional y sus derivadas en δ y en τ. */
export interface Derivadas {
  phi: number;
  phid: number;
  phidd: number;
  phit: number;
  phitt: number;
  phidt: number;
}

/* ── la parte de gas ideal (tabla 1 del estándar) ─────────────────── */
const N0 = [-8.3204464837497, 6.6832105275932, 3.00632, 0.012436, 0.97315, 1.2795, 0.96956, 0.24873] as const;
const GAMMA0 = [1.28728967, 3.53734222, 7.74073708, 9.24437796, 27.5075105] as const;

/** φ° y sus derivadas. */
export function ideal(delta: number, tau: number): Derivadas {
  let phi = Math.log(delta) + N0[0] + N0[1] * tau + N0[2] * Math.log(tau);
  let phit = N0[1] + N0[2] / tau;
  let phitt = -N0[2] / (tau * tau);
  for (let i = 0; i < 5; i++) {
    const n = N0[3 + i];
    const g = GAMMA0[i];
    const e = Math.exp(-g * tau);
    phi += n * Math.log(1 - e);
    phit += n * g * (1 / (1 - e) - 1);
    phitt -= (n * g * g * e) / (1 - e) ** 2;
  }
  return { phi, phid: 1 / delta, phidd: -1 / (delta * delta), phit, phitt, phidt: 0 };
}

/* ── la parte residual (tabla 2 del estándar) ─────────────────────────
   Cuatro familias de términos: siete polinómicos [d, t, n]; cuarenta y
   cuatro con exponencial en δ [c, d, t, n]; tres gaussianos
   [d, t, n, α, β, γ, ε] y dos no analíticos, para el punto crítico,
   [a, b, B, n, C, D, A, β]. */
const POLINOMICOS: ReadonlyArray<readonly [number, number, number]> = [
  [1, -0.5, 0.12533547935523e-1], [1, 0.875, 0.78957634722828e1], [1, 1, -0.87803203303561e1],
  [2, 0.5, 0.31802509345418], [2, 0.75, -0.26145533859358], [3, 0.375, -0.78199751687981e-2],
  [4, 1, 0.88089493102134e-2],
];
const EXPONENCIALES: ReadonlyArray<readonly [number, number, number, number]> = [
  [1, 1, 4, -0.66856572307965], [1, 1, 6, 0.20433810950965], [1, 1, 12, -0.66212605039687e-4],
  [1, 2, 1, -0.19232721156002], [1, 2, 5, -0.25709043003438], [1, 3, 4, 0.16074868486251],
  [1, 4, 2, -0.40092828925807e-1], [1, 4, 13, 0.39343422603254e-6], [1, 5, 9, -0.75941377088144e-5],
  [1, 7, 3, 0.56250979351888e-3], [1, 9, 4, -0.15608652257135e-4], [1, 10, 11, 0.11537996422951e-8],
  [1, 11, 4, 0.36582165144204e-6], [1, 13, 13, -0.13251180074668e-11], [1, 15, 1, -0.62639586912454e-9],
  [2, 1, 7, -0.10793600908932], [2, 2, 1, 0.17611491008752e-1], [2, 2, 9, 0.22132295167546],
  [2, 2, 10, -0.40247669763528], [2, 3, 10, 0.58083399985759], [2, 4, 3, 0.49969146990806e-2],
  [2, 4, 7, -0.31358700712549e-1], [2, 4, 10, -0.74315929710341], [2, 5, 10, 0.4780732991548],
  [2, 6, 6, 0.20527940895948e-1], [2, 6, 10, -0.13636435110343], [2, 7, 10, 0.14180634400617e-1],
  [2, 9, 1, 0.83326504880713e-2], [2, 9, 2, -0.29052336009585e-1], [2, 9, 3, 0.38615085574206e-1],
  [2, 9, 4, -0.20393486513704e-1], [2, 9, 8, -0.16554050063734e-2], [2, 10, 6, 0.19955571979541e-2],
  [2, 10, 9, 0.15870308324157e-3], [2, 12, 8, -0.1638856834253e-4], [3, 3, 16, 0.43613615723811e-1],
  [3, 4, 22, 0.34994005463765e-1], [3, 4, 23, -0.76788197844621e-1], [3, 5, 23, 0.22446277332006e-1],
  [4, 14, 10, -0.62689710414685e-4], [6, 3, 50, -0.55711118565645e-9], [6, 6, 44, -0.19905718354408],
  [6, 6, 46, 0.31777497330738], [6, 6, 50, -0.11841182425981],
];
const GAUSSIANOS: ReadonlyArray<readonly [number, number, number, number, number, number, number]> = [
  [3, 0, -0.31306260323435e2, 20, 150, 1.21, 1],
  [3, 1, 0.31546140237781e2, 20, 150, 1.21, 1],
  [3, 4, -0.25213154341695e4, 20, 250, 1.25, 1],
];
const NO_ANALITICOS: ReadonlyArray<readonly [number, number, number, number, number, number, number, number]> = [
  [3.5, 0.85, 0.2, -0.14874640856724, 28, 700, 0.32, 0.3],
  [3.5, 0.95, 0.2, 0.31806110878444, 32, 800, 0.32, 0.3],
];

/** φʳ y sus derivadas. */
export function residual(delta: number, tau: number): Derivadas {
  let phi = 0;
  let phid = 0;
  let phidd = 0;
  let phit = 0;
  let phitt = 0;
  let phidt = 0;

  for (const [d, t, n] of POLINOMICOS) {
    phi += n * delta ** d * tau ** t;
    phid += n * d * delta ** (d - 1) * tau ** t;
    phidd += n * d * (d - 1) * delta ** (d - 2) * tau ** t;
    phit += n * t * delta ** d * tau ** (t - 1);
    phitt += n * t * (t - 1) * delta ** d * tau ** (t - 2);
    phidt += n * d * t * delta ** (d - 1) * tau ** (t - 1);
  }

  for (const [c, d, t, n] of EXPONENCIALES) {
    const dc = delta ** c;
    const e = n * Math.exp(-dc);
    phi += e * delta ** d * tau ** t;
    phid += e * delta ** (d - 1) * tau ** t * (d - c * dc);
    phidd += e * delta ** (d - 2) * tau ** t * ((d - c * dc) * (d - 1 - c * dc) - c * c * dc);
    phit += e * delta ** d * t * tau ** (t - 1);
    phitt += e * delta ** d * t * (t - 1) * tau ** (t - 2);
    phidt += e * delta ** (d - 1) * t * tau ** (t - 1) * (d - c * dc);
  }

  for (const [d, t, n, al, be, ga, ep] of GAUSSIANOS) {
    const E = Math.exp(-al * (delta - ep) ** 2 - be * (tau - ga) ** 2);
    const base = n * delta ** d * tau ** t * E;
    const fd = d / delta - 2 * al * (delta - ep);
    const ft = t / tau - 2 * be * (tau - ga);
    phi += base;
    phid += base * fd;
    phidd +=
      n * tau ** t * E *
      (-2 * al * delta ** d + 4 * al * al * delta ** d * (delta - ep) ** 2 -
        4 * d * al * delta ** (d - 1) * (delta - ep) + d * (d - 1) * delta ** (d - 2));
    phit += base * ft;
    phitt += base * (ft * ft - t / (tau * tau) - 2 * be);
    phidt += base * fd * ft;
  }

  for (const [a, b, B, n, C, D, A, be] of NO_ANALITICOS) {
    const x = delta - 1;
    const x2 = x * x;
    const theta = 1 - tau + A * x2 ** (1 / (2 * be));
    const Del = theta * theta + B * x2 ** a;
    const psi = Math.exp(-C * x2 - D * (tau - 1) ** 2);
    const psiD = -2 * C * x * psi;
    const psiDD = (2 * C * x2 - 1) * 2 * C * psi;
    const psiT = -2 * D * (tau - 1) * psi;
    const psiTT = (2 * D * (tau - 1) ** 2 - 1) * 2 * D * psi;
    const psiDT = 4 * C * D * x * (tau - 1) * psi;
    const DelD = x * (A * theta * (2 / be) * x2 ** (1 / (2 * be) - 1) + 2 * B * a * x2 ** (a - 1));
    const DelDD =
      DelD / x +
      x2 *
        (4 * B * a * (a - 1) * x2 ** (a - 2) +
          2 * A * A * (1 / be) ** 2 * (x2 ** (1 / (2 * be) - 1)) ** 2 +
          A * theta * (4 / be) * (1 / (2 * be) - 1) * x2 ** (1 / (2 * be) - 2));
    const Db = Del ** b;
    const DbD = b * Del ** (b - 1) * DelD;
    const DbDD = b * (Del ** (b - 1) * DelDD + (b - 1) * Del ** (b - 2) * DelD * DelD);
    const DbT = -2 * theta * b * Del ** (b - 1);
    const DbTT = 2 * b * Del ** (b - 1) + 4 * theta * theta * b * (b - 1) * Del ** (b - 2);
    const DbDT =
      -A * b * (2 / be) * Del ** (b - 1) * x * x2 ** (1 / (2 * be) - 1) -
      2 * theta * b * (b - 1) * Del ** (b - 2) * DelD;
    phi += n * Db * delta * psi;
    phid += n * (Db * (psi + delta * psiD) + DbD * delta * psi);
    phidd += n * (Db * (2 * psiD + delta * psiDD) + 2 * DbD * (psi + delta * psiD) + DbDD * delta * psi);
    phit += n * delta * (DbT * psi + Db * psiT);
    phitt += n * delta * (DbTT * psi + 2 * DbT * psiT + Db * psiTT);
    phidt += n * (Db * (psiT + delta * psiDT) + delta * DbD * psiT + DbT * (psi + delta * psiD) + DbDT * delta * psi);
  }

  return { phi, phid, phidd, phit, phitt, phidt };
}

/** Todas las propiedades a partir de la densidad (kg/m³) y la temperatura (K). */
export function estadoDeRhoT(rho: number, T: number): Estado {
  const delta = rho / RHOC;
  const tau = TC / T;
  const o = ideal(delta, tau);
  const r = residual(delta, tau);
  const cv = -R * tau * tau * (o.phitt + r.phitt);
  const num = (1 + delta * r.phid - delta * tau * r.phidt) ** 2;
  const den = 1 + 2 * delta * r.phid + delta * delta * r.phidd;
  return {
    T,
    rho,
    p: (rho * R * T * (1 + delta * r.phid)) / 1000,
    v: 1 / rho,
    u: R * T * tau * (o.phit + r.phit),
    h: R * T * (1 + tau * (o.phit + r.phit) + delta * r.phid),
    s: R * (tau * (o.phit + r.phit) - o.phi - r.phi),
    cv,
    cp: cv + (R * num) / den,
    w: Math.sqrt(1000 * R * T * (den - num / (tau * tau * (o.phitt + r.phitt)))),
  };
}

/** Presión (kPa), su derivada en ρ y la energía libre de Gibbs (kJ/kg): lo
 *  que necesita el equilibrio entre fases. */
function presionYGibbs(rho: number, T: number): { p: number; dp: number; g: number } {
  const delta = rho / RHOC;
  const tau = TC / T;
  const o = ideal(delta, tau);
  const r = residual(delta, tau);
  return {
    p: rho * R * T * (1 + delta * r.phid),
    dp: R * T * (1 + 2 * delta * r.phid + delta * delta * r.phidd),
    g: R * T * (1 + o.phi + r.phi + delta * r.phid),
  };
}

/** Las densidades de partida de la saturación: las ecuaciones auxiliares de
 *  Wagner y Pruss (IAPWS, «Revised Supplementary Release on Saturation
 *  Properties», 1992). Solo arrancan la iteración. */
function densidadesDePartida(T: number): [number, number] {
  const th = 1 - T / TC;
  const rl =
    RHOC *
    (1 + 1.99274064 * th ** (1 / 3) + 1.09965342 * th ** (2 / 3) - 0.510839303 * th ** (5 / 3) -
      1.75493479 * th ** (16 / 3) - 45.5170352 * th ** (43 / 3) - 6.7469445e5 * th ** (110 / 3));
  const rv =
    RHOC *
    Math.exp(
      -2.0315024 * th ** (2 / 6) - 2.6830294 * th ** (4 / 6) - 5.38626492 * th ** (8 / 6) -
        17.2991605 * th ** (18 / 6) - 44.7586581 * th ** (37 / 6) - 63.9201063 * th ** (71 / 6),
    );
  return [rl, rv];
}

/** Una saturación: presión (MPa) y los dos estados, líquido y vapor. */
export interface Saturacion {
  T: number;
  p: number;
  liquido: Estado;
  vapor: Estado;
}

/** La saturación a `T` K: las densidades de las dos fases con la misma
 *  presión y la misma energía libre de Gibbs (criterio de Maxwell), por
 *  Newton en las dos a la vez. */
export function saturacion(T: number): Saturacion {
  if (!(T > 250 && T < TC)) throw new Error(`saturacion: ${T} K fuera de la campana`);
  let [rl, rv] = densidadesDePartida(T);
  for (let k = 0; k < 100; k++) {
    const l = presionYGibbs(rl, T);
    const v = presionYGibbs(rv, T);
    const F1 = l.p - v.p;
    const F2 = l.g - v.g;
    /* dg/dρ = (dp/dρ)/ρ a temperatura constante, porque dg = v·dp. */
    const a11 = l.dp;
    const a12 = -v.dp;
    const a21 = l.dp / rl;
    const a22 = -v.dp / rv;
    const det = a11 * a22 - a12 * a21;
    const drl = (-F1 * a22 + F2 * a12) / det;
    const drv = (-F2 * a11 + F1 * a21) / det;
    rl += drl;
    rv += drv;
    if (Math.abs(drl / rl) < 1e-14 && Math.abs(drv / rv) < 1e-14) break;
  }
  const liquido = estadoDeRhoT(rl, T);
  const vapor = estadoDeRhoT(rv, T);
  /* La presión, la del vapor. La del líquido sale de ρRT·(1 + δφʳ_δ) con
     el paréntesis casi nulo —a 275 K vale 5·10⁻⁶—, y la resta se come
     cifras: a 275 K se desvía un 2,5·10⁻⁸ del estándar, y la del vapor,
     un 5·10⁻¹⁰. */
  return { T, p: vapor.p, liquido, vapor };
}

/** La temperatura de partida de la saturación a `p` MPa: la ecuación
 *  auxiliar de Wagner y Pruss para la presión de saturación, despejada por
 *  bisección. Acierta a la centésima de kelvin; el resto lo pone Newton. */
function temperaturaDePartida(p: number): number {
  const PC = 22.064; // MPa
  const lnPs = (T: number) => {
    const th = 1 - T / TC;
    return (
      Math.log(PC) +
      (TC / T) *
        (-7.85951783 * th + 1.84408259 * th ** 1.5 - 11.7866497 * th ** 3 + 22.6807411 * th ** 3.5 -
          15.9618719 * th ** 4 + 1.80122502 * th ** 7.5)
    );
  };
  let lo = 250;
  let hi = TC;
  for (let k = 0; k < 60; k++) {
    const medio = (lo + hi) / 2;
    if (lnPs(medio) < Math.log(p)) lo = medio;
    else hi = medio;
  }
  return (lo + hi) / 2;
}

/** La saturación a `p` MPa: Newton en T con la pendiente de Clapeyron,
 *  dp/dT = (h'' − h')/(T·(v'' − v')). */
export function saturacionDeP(p: number): Saturacion {
  let T = temperaturaDePartida(p);
  let s = saturacion(T);
  for (let k = 0; k < 50; k++) {
    const pendiente = (s.vapor.h - s.liquido.h) / (T * (s.vapor.v - s.liquido.v)) / 1000; // MPa/K
    const dT = (s.p - p) / pendiente;
    T -= dT;
    s = saturacion(T);
    if (Math.abs(dT) < 1e-11) break;
  }
  return s;
}

/** Un estado de una sola fase dado por su presión (MPa) y su temperatura
 *  (K): líquido si la presión pasa de la de saturación, vapor si no, y por
 *  encima de la temperatura crítica, la única raíz. Newton protegido con
 *  bisección dentro de la rama que toca, donde la presión crece con ρ. */
export function estadoDePT(p: number, T: number): Estado {
  const pk = p * 1000;
  let lo = 1e-9;
  let hi = 1500;
  let rho: number;
  if (T < TC) {
    const s = saturacion(T);
    if (p > s.p) {
      lo = s.liquido.rho;
      rho = lo * 1.0001;
    } else {
      hi = s.vapor.rho;
      rho = Math.min(pk / (R * T), hi * 0.9999);
    }
  } else {
    rho = Math.min(pk / (R * T), hi / 2);
  }
  for (let k = 0; k < 200; k++) {
    const { p: pr, dp } = presionYGibbs(rho, T);
    const f = pr - pk;
    if (f > 0) hi = Math.min(hi, rho);
    else lo = Math.max(lo, rho);
    let siguiente = rho - f / dp;
    if (!(siguiente > lo && siguiente < hi) || !(dp > 0)) siguiente = (lo + hi) / 2;
    if (Math.abs(siguiente - rho) <= 1e-15 * rho) {
      rho = siguiente;
      break;
    }
    rho = siguiente;
  }
  return estadoDeRhoT(rho, T);
}
