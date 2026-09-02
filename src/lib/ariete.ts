/**
 * El modelo del tema 20: golpe de ariete.
 *
 * Vive fuera del componente porque §10 exige que un simulador con física
 * dentro lleve su caso de prueba. `tests/fisica/ariete.test.ts` lo verifica
 * contra los cuatro números del error típico del propio tema —la conducción de
 * 800 m de fundición cerrada en 1 s y en 5 s— y contra los 225 m de columna de
 * agua que la prosa usa para justificar que el tema exista.
 *
 * Unidades del SI, salvo `k`, que es adimensional y viene tabulado.
 */

/** La gravedad de los apuntes y de todas las soluciones oficiales (§17). */
export const G = 9.8;

/**
 * El coeficiente `k = 10⁷/E` del cuadro del tema, por material.
 *
 * Cuanto más flexible el material, mayor `k`, menor celeridad y menor golpe.
 * El PVC está tabulado como «33, entre 20 y 50»: se guarda el 33, que es el
 * que usan los enunciados, y el rango queda dicho aquí.
 */
export const K_MATERIAL = {
  acero: 0.5,
  fundicion: 1,
  hormigon: 5,
  fibrocemento: 5.4,
  poliester: 6.6,
  pvc: 33,
} as const;

export type Material = keyof typeof K_MATERIAL;

/**
 * La celeridad de la onda, en la forma de Allievi que usan los enunciados:
 *
 *     a = 9900 / √(48,3 + k·D/e)
 *
 * El 48,3 es el término del agua —viene de `K` y `ρ`— y el otro, el del tubo.
 * Si el tubo fuera rígido (`k = 0`) saldría 1425 m/s, la velocidad del sonido
 * en el agua, que es el caso segundo de la tabla del tema.
 */
export const celeridad = (k: number, D: number, e: number): number =>
  9900 / Math.sqrt(48.3 + (k * D) / e);

/**
 * La celeridad en la forma **de Joukowski**, que es la general:
 *
 *     a = √(K/ρ) / √(1 + (K/E)·(D/e))
 *
 * La forma de Allievi de arriba es esta misma con los valores del agua ya
 * metidos y `k = 10⁷/E` tabulado. Conviven porque el corpus usa las dos: si el
 * enunciado da el módulo de elasticidad del material, quiere Joukowski; si
 * solo nombra el material, quiere la tabla.
 *
 * Y no dan lo mismo. En el ejercicio 7.11 —fibrocemento de 150 mm y 12 de
 * espesor— Allievi da 920 m/s y Joukowski 937, un 1,8 % de diferencia que en
 * la sobrepresión son 2,6 mca. El resultado publicado es el de Joukowski, así
 * que **el que manda es el que pide el enunciado**, no el más cómodo.
 */
export const celeridadJoukowski = (
  K: number,
  E: number,
  D: number,
  e: number,
  rho = 1000,
): number => Math.sqrt(K / rho) / Math.sqrt(1 + (K / E) * (D / e));

/** El periodo de ida y vuelta de la onda: `T = 2L/a`. Es el que clasifica. */
export const periodo = (L: number, a: number): number => (2 * L) / a;

/** El ciclo completo, `4L/a`, que es lo que se ve en la gráfica de presión. */
export const ciclo = (L: number, a: number): number => (4 * L) / a;

/** Allievi: el golpe máximo, con cierre rápido. **No depende de la longitud.** */
export const allievi = (a: number, v: number, g = G): number => (a * v) / g;

/** Michaud: cierre lento. Aquí la longitud **sí** entra. */
export const michaud = (L: number, v: number, Tc: number, g = G): number =>
  (2 * L * v) / (g * Tc);

/** Jouguet, la mitad de Michaud. Está en el temario y se usa si lo piden. */
export const jouguet = (L: number, v: number, Tc: number, g = G): number =>
  michaud(L, v, Tc, g) / 2;

export type Cierre = 'rapido' | 'lento' | 'critico';

/**
 * La clasificación, que es lo primero que hay que hacer y lo que más se salta.
 *
 * `T_c < 2L/a` es cierre rápido; `T_c > 2L/a`, lento. La igualdad se marca
 * aparte porque es donde las dos fórmulas dan lo mismo, no porque haya una
 * tercera fórmula.
 */
export function clasifica(L: number, a: number, Tc: number): Cierre {
  const T = periodo(L, a);
  if (Math.abs(Tc - T) < 1e-9) return 'critico';
  return Tc < T ? 'rapido' : 'lento';
}

/** El golpe que toca, con la fórmula que toca. */
export function golpe(L: number, a: number, v: number, Tc: number, g = G): number {
  return clasifica(L, a, Tc) === 'lento' ? michaud(L, v, Tc, g) : allievi(a, v, g);
}

/**
 * La longitud crítica `L_c = T_c·a/2`.
 *
 * Es el tramo junto al depósito donde el golpe todavía no ha llegado entero.
 * Comparada con `L` da la misma clasificación que comparar `T_c` con `2L/a`,
 * y es la que se usa para dibujar el techo de presiones.
 */
export const longitudCritica = (Tc: number, a: number): number => (Tc * a) / 2;

/**
 * **El techo de presiones**: el golpe que llega a cada punto de la conducción,
 * medido desde el depósito.
 *
 * El tema dice que hay que dimensionar con esto y no con un valor único, y no
 * lo dibuja. Vale cero en el depósito, crece linealmente hasta `L_c` y se
 * queda en el golpe completo a partir de ahí. Con cierre rápido `L_c < L`, así
 * que hay un tramo a golpe completo; con cierre lento `L_c > L` y ni siquiera
 * la válvula ve el golpe entero.
 *
 * `x` se mide desde el depósito, en metros.
 */
export function techo(x: number, L: number, a: number, v: number, Tc: number, g = G): number {
  const Lc = longitudCritica(Tc, a);
  const completo = allievi(a, v, g);
  if (Lc <= 0) return completo;
  return Math.min(x / Lc, 1) * completo;
}

/**
 * La presión en la válvula a lo largo del tiempo, en incrementos sobre la
 * estática, para un cierre rápido y sin amortiguar.
 *
 * Es la onda cuadrada del ciclo de cuatro tiempos: sobrepresión durante `2L/a`,
 * depresión durante otro tanto, y otra vez. El amortiguamiento se mete como un
 * decaimiento exponencial por ciclo, declarado y no medido: sirve para que la
 * gráfica se parezca a la del tema, no para calcular nada. Por eso el módulo
 * lo devuelve aparte y el simulador lo dibuja como ilustración, mientras que
 * los números de la tabla salen de `golpe()`.
 */
export function ondaEnValvula(t: number, L: number, a: number, dH: number, amortigua = 0): number {
  const T = periodo(L, a);
  if (t < 0) return 0;
  const n = Math.floor(t / T); // cuántos medios ciclos han pasado
  const signo = n % 2 === 0 ? 1 : -1;
  return signo * dH * Math.exp(-amortigua * t);
}
