/**
 * Las cuentas del plano complejo del tema 1: el paso entre la forma polar y
 * la binómica, el producto, y la diferencia entre el argumento de verdad y el
 * que devuelve `arctan(b/a)`.
 *
 * Vive fuera del componente porque §10 exige que un simulador con modelo
 * dentro lleve su caso de prueba. `tests/fisica/plano.test.ts` lo verifica
 * contra el caso que **el propio tema publica** en su bloque «Error típico ·
 * calcular el argumento con arctan a secas»: con $z = -1 - i$ el cociente
 * $b/a$ vale 1 y `arctan` devuelve $\pi/4$, que es el argumento del número
 * **contrario**; el de verdad es $-3\pi/4$, y la diferencia es exactamente
 * $\pi$.
 *
 * Y esa es la razón de que estas cuatro funciones no sean una envoltura
 * decorativa de `Math`: `argumento` y `arctanIngenuo` **no** calculan lo
 * mismo, y el simulador existe para enseñar dónde se separan.
 */

/** Parte real e imaginaria de $r\,e^{i\theta}$. */
export function binomica(r: number, theta: number): { a: number; b: number } {
  return { a: r * Math.cos(theta), b: r * Math.sin(theta) };
}

/** El módulo, $\sqrt{a^{2}+b^{2}}$. */
export function modulo(a: number, b: number): number {
  return Math.hypot(a, b);
}

/**
 * El argumento **de verdad**, en $(-\pi,\pi]$: mira el cuadrante antes de
 * dar el ángulo. Es lo que `atan2` hace y `atan` no.
 */
export function argumento(a: number, b: number): number {
  return Math.atan2(b, a);
}

/**
 * Lo que sale de escribir `arctan(b/a)` sin mirar dónde está el punto.
 * Siempre cae en $\left(-\tfrac\pi2,\tfrac\pi2\right)$, así que para
 * $a<0$ se equivoca en media vuelta.
 */
export function arctanIngenuo(a: number, b: number): number {
  return Math.atan(b / a);
}

/**
 * El desfase entre los dos: $0$ si el punto está a la derecha del eje
 * imaginario y $\pm\pi$ si está a la izquierda. Es el error que comete quien
 * no mira el cuadrante.
 */
export function desfase(a: number, b: number): number {
  return argumento(a, b) - arctanIngenuo(a, b);
}

/** El cuadrante, en números romanos, con el convenio del tema. */
export function cuadrante(a: number, b: number): 'I' | 'II' | 'III' | 'IV' {
  if (a >= 0) return b >= 0 ? 'I' : 'IV';
  return b >= 0 ? 'II' : 'III';
}

/**
 * El producto en polar: los módulos se multiplican y los argumentos se suman.
 * Devuelve el argumento ya reducido a $(-\pi,\pi]$, que es como se escribe.
 */
export function producto(
  r: number,
  theta: number,
  rw: number,
  phi: number,
): { r: number; theta: number } {
  const t = theta + phi;
  return { r: r * rw, theta: Math.atan2(Math.sin(t), Math.cos(t)) };
}
