/**
 * La extraordinaria de junio de 2019 de Mecánica Aplicada, Estática. Quince
 * respuestas en cuatro resoluciones: dos cuestiones de teoría y dos
 * ejercicios.
 *
 * El examen **no publica resolución ni resultados**. Cada respuesta se vuelve
 * a sacar por un camino distinto del de la resolución del corpus:
 *
 * - la carga parabólica, integrándola numéricamente;
 * - la rebanada, integrando las relaciones diferenciales paso a paso con los
 *   valores de comprobación que declara la pregunta;
 * - la placa, integrando por franjas verticales sobre su contorno recortado
 *   —área, momentos estáticos y momento de inercia— en vez de restar figuras;
 * - el pórtico, con momentos respecto de B en vez de respecto de A, y el
 *   flector máximo de CD buscado numéricamente.
 */
import { describe, expect, it } from 'vitest';
import { convocatoria } from './corpus';
import { integra, maximiza } from './numerico';

const cuadra = convocatoria('mecanica-aplicada', '2018-2019-ext');

describe('1 · la carga parabólica', () => {
  const id = 'exma1819-ext-1-la-carga-parabolica-y-su-resultante';
  /* k = L = 1: q(x) = −(x² − 2x). */
  const q = (x: number) => -(x * x - 2 * x);
  const R = integra(q, 0, 1);
  const M = integra((x) => x * q(x), 0, 1);
  it('la resultante, en unidades de kL³', () => cuadra(id, 'La resultante', R));
  it('y su punto de aplicación, en unidades de L', () => cuadra(id, 'El punto de aplicación', M / R));
});

describe('2 · la rebanada con carga en las dos direcciones', () => {
  const id = 'exma1819-ext-2-la-rebanada-con-carga-en-las-dos-direcciones';
  /* Valores de la pregunta: q_y = 2 kN/m hacia abajo, q_x = 1 kN/m hacia la
     derecha, y en el origen N = 3 kN, V = 5 kN y M = 0. Integración de Euler
     muy fina de dN/dx = −q_x, dV/dx = −q_y y dM/dx = V. */
  const [qx, qy] = [1e3, 2e3];
  let [N, V, M] = [3e3, 5e3, 0];
  const pasos = 200000;
  const dx = 2 / pasos;
  for (let i = 0; i < pasos; i++) {
    M += (V - (qy * dx) / 2) * dx;
    V -= qy * dx;
    N -= qx * dx;
  }
  it('el flector a dos metros', () => cuadra.magnitud(id, 'El flector a dos metros', M, 'N*m'));
  it('y el axil', () => cuadra.magnitud(id, 'El axil a dos metros', N, 'N'));
});

describe('3 · la placa recortada colgada de un cable', () => {
  const id = 'exma1819-ext-3-la-placa-recortada-colgada-de-un-cable';

  /* Datos: R = 0,3 m, peso 10 kN, g = 9,81. La placa ocupa x ∈ [0, 3R]; su
     borde superior está a 4R salvo sobre el recorte, un medio disco de radio
     R centrado en (R, 4R), donde baja a 4R − √(R² − (x − R)²). */
  const R = 0.3;
  const W = 10e3;
  const g = 9.81;
  const techo = (x: number) => (x < 2 * R ? 4 * R - Math.sqrt(Math.max(0, R * R - (x - R) ** 2)) : 4 * R);
  const A = integra(techo, 0, 3 * R);
  const xG = integra((x) => x * techo(x), 0, 3 * R) / A;
  const yG = integra((x) => techo(x) ** 2 / 2, 0, 3 * R) / A;
  const Iarea = integra((x) => techo(x) ** 3 / 3, 0, 3 * R);

  /* El cable sale de D = (3R, 4R) hacia un punto R a la derecha y √3·R más
     arriba. Momentos en A: T·(D × u) = W·xG. */
  const u = [R, Math.sqrt(3) * R].map((c) => c / (2 * R));
  const brazo = 3 * R * u[1] - 4 * R * u[0];
  const T = (W * xG) / brazo;

  it('la abscisa del centro de gravedad', () => cuadra.magnitud(id, 'La abscisa del centro de gravedad', xG, 'm'));
  it('la ordenada', () => cuadra.magnitud(id, 'La ordenada del centro de gravedad', yG, 'm'));
  it('la fuerza del cable', () => cuadra.magnitud(id, 'La fuerza del cable', T, 'N'));
  it('la reacción horizontal en A, en valor absoluto', () =>
    cuadra.magnitud(id, 'La reacción horizontal en A', Math.abs(-T * u[0]), 'N'));
  it('la vertical, en valor absoluto, y hacia abajo', () => {
    const Ay = W - T * u[1];
    expect(Ay).toBeLessThan(0);
    cuadra.magnitud(id, 'La reacción vertical en A', Math.abs(Ay), 'N');
  });
  it('el momento de inercia de masa respecto del eje X', () =>
    cuadra.magnitud(id, 'El momento de inercia respecto del eje X', (W / g / A) * Iarea, 'kg*m^2'));
});

describe('4 · el pórtico articulado y su viga', () => {
  const id = 'exma1819-ext-4-el-portico-articulado-y-su-viga';

  /* Datos: luz 3 m, diagonal a 60°, q = 6 kN/m en CD, P = 10 kN hacia la
     derecha en C. */
  const L = 3;
  const h = L * Math.tan(Math.PI / 3);
  const [q, P] = [6e3, 10e3];

  /* Momentos respecto de B, antihorario positivo, con A en (−L, 0), C en
     (−L, h) y la resultante de la repartida en (−L/2, h). */
  const Ay = (-P * h + q * L * (L / 2)) / L;
  const By = q * L - Ay;
  const Ax = -P;

  /* La viga CD: biapoyada en sus articulaciones, con la carga repartida. */
  const Vc = (q * L) / 2;
  const { y: Mmax } = maximiza((x) => Vc * x - (q * x * x) / 2, 0, L);

  it('la reacción en B', () => cuadra.magnitud(id, 'La reacción en B', By, 'N'));
  it('la vertical en A, en valor absoluto, y hacia abajo', () => {
    expect(Ay).toBeLessThan(0);
    cuadra.magnitud(id, 'La reacción vertical en A', Math.abs(Ay), 'N');
  });
  it('la horizontal en A', () => cuadra.magnitud(id, 'La reacción horizontal en A', Math.abs(Ax), 'N'));

  /* Nudo C: solo AC, vertical, y CD. El axil de CD equilibra la P. */
  it('el axil de CD, que equilibra la P en el nudo C', () => cuadra.magnitud(id, 'El axil de la viga CD', P, 'N'));
  it('el flector máximo de CD', () => cuadra.magnitud(id, 'El flector máximo de CD', Mmax, 'N*m'));
});
