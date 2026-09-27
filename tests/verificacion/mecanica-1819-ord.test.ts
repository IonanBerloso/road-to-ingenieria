/**
 * La ordinaria de mayo de 2019 de Mecánica Aplicada, bloque 1 (Estática).
 * Catorce respuestas en cinco resoluciones: tres cuestiones de teoría y dos
 * ejercicios.
 *
 * El examen **no publica resolución ni resultados**, así que la pregunta es
 * «¿es correcto el resultado?», y cada respuesta se vuelve a sacar por un
 * camino distinto del de la resolución del corpus:
 *
 * - la catenaria, integrando numéricamente su ecuación diferencial en vez de
 *   usar la solución cerrada;
 * - el medio disco, integrando y² sobre su área por franjas;
 * - la viga, con los flectores sacados de las fuerzas a la derecha de cada
 *   sección y buscando el máximo en una malla, en vez de leer los extremos
 *   de tramo;
 * - las medias esferas, buscando por bisección el ángulo en que el
 *   rozamiento pedido iguala al disponible, en vez de despejar la tangente.
 *
 * Las cuentas de comprobación de las cuestiones 1 y 2 usan valores nuestros
 * —x = c y un vector concreto—, que la pregunta de cada paso declara.
 */
import { describe, expect, it } from 'vitest';
import { convocatoria } from './corpus';
import { integra, raiz } from './numerico';

const cuadra = convocatoria('mecanica-aplicada', '2018-2019-ord');

describe('1 · la catenaria desde su ecuación diferencial', () => {
  const id = 'exma1819-ord-1-la-catenaria-desde-su-ecuacion-diferencial';

  /* y'' = √(1 + y'²)/c con c = 1, desde el punto más bajo, donde y' = 0.
     Runge-Kutta de orden 4 sobre p = y', que es lo único que hace falta. */
  const c = 1;
  const f = (p: number) => Math.sqrt(1 + p * p) / c;
  let p = 0;
  const pasos = 2000;
  const h = c / pasos;
  for (let i = 0; i < pasos; i++) {
    const k1 = f(p);
    const k2 = f(p + (h / 2) * k1);
    const k3 = f(p + (h / 2) * k2);
    const k4 = f(p + h * k3);
    p += (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
  }

  it('la pendiente en x = c', () => cuadra(id, 'La pendiente a una distancia c del punto más bajo', p));

  /* La tensión va a lo largo del cable y su componente horizontal es T₀. */
  it('y la tensión en ese punto, en unidades de T₀', () => cuadra(id, 'La tensión en ese mismo punto', Math.sqrt(1 + p * p)));
});

describe('2 · el virial de un vector', () => {
  const id = 'exma1819-ord-2-el-virial-de-un-vector';
  const OP = [1, 2, 1];
  const v = [2, -1, 3];
  it('el producto escalar de OP por v', () =>
    cuadra(id, 'Un virial con números', OP.reduce((s, x, i) => s + x * v[i], 0)));
});

describe('3 · el momento de inercia del medio disco', () => {
  const id = 'exma1819-ord-3-el-momento-de-inercia-del-medio-disco';

  /* M = R = 1. Densidad superficial: la masa entre el área del medio disco.
     Franjas verticales de altura h = √(1 − x²): cada una aporta
     σ·h³/3 al momento respecto del diámetro y σ·h²/2 al momento estático. */
  const sigma = 1 / (Math.PI / 2);
  const altura = (x: number) => Math.sqrt(Math.max(0, 1 - x * x));
  const IX = sigma * integra((x) => altura(x) ** 3 / 3, -1, 1);
  const yG = sigma * integra((x) => altura(x) ** 2 / 2, -1, 1);

  it('el centro de gravedad del medio disco está a 4R/3π', () => expect(yG).toBeCloseTo(4 / (3 * Math.PI), 5));
  it('el momento respecto del diámetro', () => cuadra(id, 'El momento respecto del eje X', IX));
  it('y respecto del eje paralelo por G, por Steiner desde el integrado', () =>
    cuadra(id, 'El momento respecto del eje X′', IX - yG * yG));
});

describe('4 · la viga con una rótula', () => {
  const id = 'exma1819-ord-4-la-viga-con-una-rotula';

  /* Datos del enunciado, en unidades SI: tramos de 1 m, q = 40 kN/m en CD,
     sección de 60 × 100 mm. A en x = 0, B en 1, C en 2 y D en 3. */
  const q = 40e3;
  const [xB, xC, xD] = [1, 2, 3];
  const b = 0.06;
  const hSec = 0.1;

  /* La rótula anula el flector en B: momentos en B de lo que hay a su
     derecha. La resultante de la repartida está en el centro de CD. */
  const RC = (q * (xD - xC) * ((xC + xD) / 2 - xB)) / (xC - xB);

  /* Flector y cortante en cada sección desde el lado derecho: una fuerza
     hacia arriba a la derecha de la sección da flector positivo (tracción
     abajo), y la repartida, negativo. */
  const repartida = (x: number) => {
    const desde = Math.max(x, xC);
    if (desde >= xD) return { F: 0, M: 0 };
    return { F: q * (xD - desde), M: q * ((xD - desde) ** 2) / 2 + q * (xD - desde) * (desde - x) };
  };
  const M = (x: number) => (x < xC ? RC * (xC - x) : 0) - repartida(x).M;
  const V = (x: number) => (x < xC ? RC : 0) - repartida(x).F;

  const malla = Array.from({ length: 3001 }, (_, i) => (i / 3000) * xD).filter((x) => Math.abs(x - xC) > 1e-9);
  const Mmax = Math.max(...malla.map((x) => Math.abs(M(x))));
  const Vmax = Math.max(...malla.map((x) => Math.abs(V(x))));

  it('la reacción en C', () => cuadra.magnitud(id, 'La reacción en C', RC, 'N'));

  it('el flector se anula en la rótula', () => expect(Math.abs(M(xB))).toBeLessThan(1e-6));

  /* El flector en A es el momento que tiene que poner el empotramiento. */
  it('el momento del empotramiento', () => cuadra.magnitud(id, 'El momento del empotramiento', Math.abs(M(0)), 'N*m'));

  it('la tensión normal máxima', () => cuadra.magnitud(id, 'La tensión normal máxima', Mmax / ((b * hSec ** 2) / 6), 'Pa'));

  it('la tensión tangencial máxima, en la fibra neutra de un rectángulo', () =>
    cuadra.magnitud(id, 'La tensión tangencial máxima', (1.5 * Vmax) / (b * hSec), 'Pa'));
});

describe('5 · las medias esferas', () => {
  const id = 'exma1819-ord-5-las-medias-esferas-que-no-deben-resbalar';

  /* Datos del enunciado, con g = 1: 30 kg arriba, 50 kg cada una de abajo,
     radios de 16 y 20 cm y μ = 0,4 con el suelo. */
  const [mArriba, mAbajo, r, R, mu] = [30, 50, 16, 20, 0.4];

  /* Rozamiento que pide cada media esfera de abajo menos el que el suelo
     puede dar, en función del ángulo de la recta de los centros. */
  const sobra = (alfa: number) => {
    const N = mArriba / 2 / Math.cos(alfa);
    return N * Math.sin(alfa) - mu * (mAbajo + N * Math.cos(alfa));
  };
  const alfa = raiz(sobra, 0.01, 1.5);
  const x = 2 * (r + R) * Math.sin(alfa) - 2 * R;

  it('el ángulo límite', () => cuadra(id, 'El ángulo límite', Math.tan(alfa)));
  it('la distancia máxima entre los bordes', () => cuadra.magnitud(id, 'La distancia máxima', x / 100, 'm'));
  it('y en esa posición la media esfera de arriba no toca el suelo', () =>
    expect((r + R) * Math.cos(alfa) - r).toBeGreaterThan(0));
});
