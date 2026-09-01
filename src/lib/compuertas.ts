/**
 * El modelo del tema 7: fuerza hidrostática sobre una superficie plana y su
 * centro de presión.
 *
 * Vive fuera del componente porque §10 exige que un simulador con física
 * dentro lleve su caso de prueba. `tests/fisica/compuertas.test.ts` lo
 * verifica contra los dos ejemplos publicados del tema —la compuerta vertical
 * y la misma inclinada 60°— y contra los dos tercios de la compuerta que llega
 * a la lámina libre.
 *
 * ── La convención de coordenadas, que es de donde salen los errores ───
 *
 * Hay **dos** longitudes y confundirlas cuesta un apartado:
 *
 * - `H` es la **profundidad**, medida en vertical desde la lámina libre. Es la
 *   que va en la fuerza, `F = γ·H_G·A`.
 * - `Y` es la distancia **a lo largo del plano** de la compuerta, medida desde
 *   donde ese plano cortaría a la lámina libre. Es la que va en el centro de
 *   presión, `Y_P = I_G/(Y_G·A) + Y_G`.
 *
 * Las une `H = Y·sen θ`. Aquí se calculan las dos y se devuelven las dos, con
 * nombre distinto, para que no haya forma de mezclarlas.
 */

/** El peso específico del agua que usan los apuntes y las soluciones. */
export const GAMMA = 9800;

/**
 * Las cuatro formas que aparecen en los enunciados.
 *
 * `triangulo-arriba` es el que tiene el **vértice** hacia la lámina libre y la
 * base abajo; `triangulo-abajo`, al revés. No es lo mismo: cambia dónde está
 * el centroide, aunque el momento de inercia sea el mismo.
 */
export type Forma = 'rectangulo' | 'triangulo-arriba' | 'triangulo-abajo' | 'circulo';

export interface Compuerta {
  forma: Forma;
  /** Ancho, o base del triángulo. En el círculo se ignora: manda `L`. */
  b: number;
  /** Longitud a lo largo del plano. En el círculo, el diámetro. */
  L: number;
}

export function area({ forma, b, L }: Compuerta): number {
  if (forma === 'circulo') return (Math.PI * L * L) / 4;
  if (forma === 'rectangulo') return b * L;
  return (b * L) / 2;
}

/** Momento de inercia respecto al eje horizontal que pasa por el centroide. */
export function inerciaG({ forma, b, L }: Compuerta): number {
  if (forma === 'circulo') return (Math.PI * L ** 4) / 64;
  if (forma === 'rectangulo') return (b * L ** 3) / 12;
  return (b * L ** 3) / 36;
}

/** Distancia del centroide al borde superior, a lo largo del plano. */
export function centroideDesdeArriba({ forma, L }: Compuerta): number {
  if (forma === 'triangulo-arriba') return (2 * L) / 3; // vértice arriba: el área está abajo
  if (forma === 'triangulo-abajo') return L / 3;
  return L / 2;
}

export interface Escena {
  compuerta: Compuerta;
  /** Profundidad del borde superior, en metros. */
  h1: number;
  /** Inclinación respecto a la horizontal, en grados. 90 es vertical. */
  grados: number;
  /** Peso específico del líquido. */
  gamma?: number;
}

export interface Resultado {
  A: number;
  I: number;
  /** Distancia del centroide, a lo largo del plano. */
  Yg: number;
  /** Profundidad del centroide. */
  Hg: number;
  /** Resultante, en newton. */
  F: number;
  /** Distancia del centro de presión, a lo largo del plano. */
  Yp: number;
  /** Profundidad del centro de presión. */
  Hp: number;
  /** Lo que el centro de presión baja respecto del centroide, sobre el plano. */
  excentricidad: number;
  /** Esa misma bajada, en tanto por uno de la longitud de la compuerta. */
  relativa: number;
  /** Dónde cae el centro de presión dentro de la compuerta, de 0 a 1. */
  fraccion: number;
}

export function resuelve({ compuerta, h1, grados, gamma = GAMMA }: Escena): Resultado {
  const sen = Math.sin((grados * Math.PI) / 180);
  const A = area(compuerta);
  const I = inerciaG(compuerta);
  const c = centroideDesdeArriba(compuerta);

  /* El borde superior está a h1 de profundidad, o sea a h1/senθ del corte con
     la lámina libre; el centroide, c más allá a lo largo del plano. */
  const Yg = h1 / sen + c;
  const Hg = Yg * sen;
  const F = gamma * Hg * A;

  const excentricidad = I / (Yg * A);
  const Yp = Yg + excentricidad;

  return {
    A,
    I,
    Yg,
    Hg,
    F,
    Yp,
    Hp: Yp * sen,
    excentricidad,
    relativa: excentricidad / compuerta.L,
    fraccion: (c + excentricidad) / compuerta.L,
  };
}

/**
 * **La constante de forma, que es lo que este simulador enseña y la prosa no
 * dice.**
 *
 * La excentricidad de una compuerta vale `e = I_G/(Y_G·A)`. Para las formas de
 * los enunciados, `I_G/A` es siempre `L²/k` con `k` fijo, así que
 *
 *     e/L = L / (k · Y_G)
 *
 * y `k` **solo depende de la forma**: 12 el rectángulo, 16 el círculo, 18 el
 * triángulo. Ni el ancho, ni el peso específico, ni la inclinación entran.
 *
 * De ahí sale la respuesta a «¿a partir de cuándo da igual?»: el centro de
 * presión se acerca al centroide a menos de un 1 % de la longitud de la
 * compuerta cuando el centroide está a `100·L/k` a lo largo del plano — 8,3
 * longitudes en un rectángulo, 6,3 en un círculo, 5,6 en un triángulo.
 *
 * Se verifica midiendo en `tests/fisica/compuertas.test.ts`, no se afirma.
 */
export const constanteDeForma = (forma: Forma): number =>
  forma === 'rectangulo' ? 12 : forma === 'circulo' ? 16 : 18;

/**
 * A qué distancia tiene que estar el centroide, a lo largo del plano, para que
 * el centro de presión quede a menos de `tolerancia` de él, medido en tanto
 * por uno de la longitud de la compuerta.
 */
export const profundidadIndiferente = (c: Compuerta, tolerancia = 0.01): number =>
  c.L / (constanteDeForma(c.forma) * tolerancia);
