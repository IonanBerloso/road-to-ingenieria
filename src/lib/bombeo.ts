/**
 * El modelo del tema 25: instalación, bomba, punto de funcionamiento y NPSH.
 *
 * Vive fuera del componente porque §10 exige que un simulador con física
 * dentro lleve su caso de prueba, y para probarlo hay que poder importarlo.
 * `tests/fisica/bombeo.test.ts` lo verifica contra los números publicados de
 * la **ordinaria de 2025-2026**, que es el ejercicio más completo del corpus:
 * tres bombas, una instalación, cavitación y una maniobra de válvula, con
 * seis resultados publicados.
 *
 * ── Unidades ─────────────────────────────────────────────────────────
 * Las de la escuela y las de los enunciados, no las del SI: **caudal en l/s
 * y alturas en mca**. Es a propósito. Las curvas de las bombas se publican
 * así —`H = 83 - 0,155 Q²` con Q en l/s— y convertir a m³/s obligaría a
 * reescribir todos los coeficientes del corpus, que es justo lo que §08
 * prohíbe: los números del examen se reproducen tal cual.
 */

/** El exponente de Hazen-Williams. Es de la fórmula, no un ajuste. */
export const EXP_HW = 1.852;

/** `H = A - B·Q²`, la forma en que la escuela publica una curva de bomba. */
export interface Bomba {
  /** Altura a caudal nulo, en mca. */
  A: number;
  /** Caída con el cuadrado del caudal, en mca/(l/s)². */
  B: number;
}

/**
 * `H = Hi0 + a·Q^1,852 + b·Q²`.
 *
 * `Hi0` es lo que la instalación pide a caudal nulo —desnivel más presiones—,
 * `a` recoge las pérdidas por rozamiento con Hazen-Williams y `b` las pérdidas
 * localizadas, que sí van con el cuadrado.
 */
export interface Instalacion {
  Hi0: number;
  a: number;
  b: number;
}

/**
 * Lo que la bomba da a un caudal, con las leyes de semejanza aplicadas.
 *
 * `n = N/N₀` es el régimen relativo. La altura va con `n²` y el caudal con
 * `n`, así que `H(Q) = n²·(A - B·(Q/n)²) = n²A - B·Q²`: **el coeficiente B no
 * cambia**. Es el detalle que hace que la curva no se traslade, sino que se
 * levante manteniendo su curvatura.
 */
export const hBomba = (Q: number, { A, B }: Bomba, n = 1): number => n * n * A - B * Q * Q;

/** Lo que la instalación pide a un caudal. */
export const hInstalacion = (Q: number, { Hi0, a, b }: Instalacion): number =>
  Hi0 + a * Q ** EXP_HW + b * Q * Q;

/** Un punto del plano Q-H. */
export interface Punto {
  /** Caudal, en l/s. */
  Q: number;
  /** Altura, en mca. */
  H: number;
}

/**
 * El punto de funcionamiento: donde la bomba da exactamente lo que la
 * instalación pide.
 *
 * Se busca por bisección y no despejando porque la curva de la instalación
 * lleva un exponente 1,852: no hay despeje. Bisecar es además lo que hace
 * quien lo resuelve a mano con la calculadora del examen (§09).
 *
 * Si la bomba no llega a arrancar —da menos de lo que la instalación pide ya
 * a caudal nulo— devuelve caudal cero, que es lo que físicamente pasa.
 */
export function puntoDeFuncionamiento(b: Bomba, i: Instalacion, n = 1): Punto {
  const exceso = (Q: number) => hBomba(Q, b, n) - hInstalacion(Q, i);
  if (exceso(0) <= 0) return { Q: 0, H: hInstalacion(0, i) };

  let lo = 0;
  let hi = Math.sqrt((n * n * b.A) / b.B); // caudal a altura nula: cota superior segura
  for (let k = 0; k < 80; k++) {
    const m = (lo + hi) / 2;
    if (exceso(m) > 0) lo = m;
    else hi = m;
  }
  const Q = (lo + hi) / 2;
  return { Q, H: hInstalacion(Q, i) };
}

/**
 * Los datos de aspiración: `NPSH_d = p_at/γ - p_v/γ - z_asp - h_f,asp`.
 *
 * `aAsp` es el coeficiente de Hazen-Williams del tramo de aspiración ya
 * multiplicado por su longitud, para que la expresión quede en una línea.
 */
export interface Aspiracion {
  /** Presión atmosférica en mca. Los enunciados usan 10, no 10,33. */
  pat: number;
  /** Tensión de vapor en mca. */
  pv: number;
  /** Altura de la bomba sobre la lámina, en m. Negativa si está por debajo. */
  zasp: number;
  /** Pérdida en la aspiración por unidad de `Q^1,852`. */
  aAsp: number;
}

/** El NPSH que la instalación ofrece. Baja al subir el caudal. */
export const npshDisponible = (Q: number, { pat, pv, zasp, aAsp }: Aspiracion): number =>
  pat - pv - zasp - aAsp * Q ** EXP_HW;

/** `NPSH_req = c + e·Q²`, que es como lo publica el fabricante. Sube. */
export interface Requerido {
  c: number;
  e: number;
}

/** El NPSH que la bomba exige. Sube al subir el caudal. */
export const npshRequerido = (Q: number, { c, e }: Requerido): number => c + e * Q * Q;

/**
 * El caudal al que empieza la cavitación: donde el disponible cae hasta el
 * requerido. Por encima de ese caudal la bomba cavita.
 *
 * Devuelve `Infinity` si no cavita en ningún caudal razonable, que es el caso
 * bueno y hay que poder distinguirlo de «cavita a cero».
 */
export function caudalLimite(asp: Aspiracion, req: Requerido, Qmax = 400): number {
  const margen = (Q: number) => npshDisponible(Q, asp) - npshRequerido(Q, req);
  if (margen(0) <= 0) return 0;
  if (margen(Qmax) > 0) return Infinity;
  let lo = 0;
  let hi = Qmax;
  for (let k = 0; k < 80; k++) {
    const m = (lo + hi) / 2;
    if (margen(m) > 0) lo = m;
    else hi = m;
  }
  return (lo + hi) / 2;
}

/**
 * El punto homólogo: adonde las leyes de semejanza dicen que se va el punto
 * de funcionamiento al cambiar el régimen a `n`.
 *
 * `Q` va con `n` y `H` con `n²`, así que el homólogo está sobre la parábola
 * de rendimiento constante `H = K·Q²` que pasa por el punto de partida.
 */
export const homologo = ({ Q, H }: Punto, n: number): Punto => ({ Q: n * Q, H: n * n * H });

/** La parábola de puntos homólogos que pasa por un punto: `H = K·Q²`. */
export const constanteHomologa = ({ Q, H }: Punto): number => (Q > 0 ? H / (Q * Q) : 0);

/**
 * Cuánto se equivoca quien aplica las leyes de semejanza al punto de
 * funcionamiento en vez de a la curva de la bomba, en tanto por uno de caudal.
 *
 * Este es el número que justifica el simulador. El error típico del tema dice
 * que los puntos homólogos están sobre una parábola por el origen y que la
 * instalación **solo** es una de esas parábolas si `Hi0 = 0`. Aquí se puede
 * comprobar: con desnivel, el homólogo y el punto real no son el mismo sitio.
 */
export function desvioHomologo(b: Bomba, i: Instalacion, n: number): number {
  const p0 = puntoDeFuncionamiento(b, i, 1);
  if (p0.Q === 0) return 0;
  const real = puntoDeFuncionamiento(b, i, n);
  const pred = homologo(p0, n);
  return (pred.Q - real.Q) / real.Q;
}
