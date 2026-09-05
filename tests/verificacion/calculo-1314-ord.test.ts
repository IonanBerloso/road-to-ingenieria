/**
 * Convocatoria ordinaria de Cálculo, curso 2013-2014. Doce respuestas.
 *
 * Su ejercicio 5 es el único del corpus donde Green se usa **al revés**: no
 * para calcular una integral doble complicada, sino para sacar una integral de
 * línea sobre una curva que no se conoce, a partir del área del recinto y de
 * su centro de gravedad.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { integra, raiz } from './numerico';

const cuadra = convocatoria('calculo', '2013-2014-ord');

describe('1 · cuatro operaciones sobre un rectángulo', () => {
  const id = 'ex1314-ord-1-cuatro-operaciones-sobre-un-rectangulo';
  /* LECTURA DE LA FIGURA: el rectángulo va de 2 a 3 en horizontal y de 1 a 3
     en vertical. Se recorre su borde y se aplican las operaciones a cada
     punto, en vez de razonar sobre la región entera. */
  const borde: [number, number][] = [];
  for (let k = 0; k <= 40; k++) {
    const t = k / 40;
    borde.push([2 + t, 1], [2 + t, 3], [2, 1 + 2 * t], [3, 1 + 2 * t]);
  }

  it('tras sumar −1−2i, la parte imaginaria baja hasta −1', () => {
    const tras = borde.map(([x, y]) => [x - 1, y - 2]);
    cuadra(id, 'La región después de la primera operación', Math.min(...tras.map((p) => p[1])));
  });

  it('y tras multiplicar por 2i, sube hasta 4', () => {
    /* Suma, conjugado y producto por 2_{π/2} = 2i. */
    const tras = borde
      .map(([x, y]) => [x - 1, y - 2])
      .map(([x, y]) => [x, -y])
      .map(([x, y]) => [-2 * y, 2 * x]);
    cuadra(id, 'La región después de la tercera', Math.max(...tras.map((p) => p[1])));
  });
});

describe('2 · Barrow y la campana de Gauss', () => {
  const id = 'ex1314-ord-2-barrow-y-la-campana-de-gauss';
  const g = (z: number) => Math.exp(-(z * z) / 2);
  const F = (t: number) => integra(g, 0, t, 1e-13);

  it("F'(1) vale e^{−1/2}", () => {
    /* Derivada numérica de la integral: si el teorema fundamental estuviera
       mal aplicado, esto lo vería. */
    const e = 1e-5;
    cuadra(id, 'La derivada en un punto', (F(1 + e) - F(1 - e)) / (2 * e));
  });

  it('y su inflexión está en el origen', () => {
    const e = 1e-5;
    const segunda = (t: number) => (g(t + e) - g(t - e)) / (2 * e);
    cuadra(id, 'El punto de inflexión', raiz(segunda, -3, 3));
  });
});

describe('3 · Taylor de una EDO sin resolverla', () => {
  const id = 'ex1314-ord-3-taylor-de-una-edo-sin-resolverla';
  /* y′ = −2xy con y(1) = 1. La solución es y = e^{1−x²}; se comprueba antes
     de derivarla. */
  const y = (x: number) => Math.exp(1 - x * x);

  it("y''(1) vale 2", () => {
    const e = 1e-4;
    for (const x of [0.7, 1, 1.4])
      if (Math.abs((y(x + e) - y(x - e)) / (2 * e) + 2 * x * y(x)) > 1e-6)
        throw new Error(`la EDO falla en x=${x}`);
    if (Math.abs(y(1) - 1) > 1e-12) throw new Error('no pasa por (1,1)');
    cuadra(id, 'La segunda derivada', (y(1 + e) - 2 * y(1) + y(1 - e)) / (e * e));
  });

  it('y el polinomio de grado 3 da 0,6453 en 1,2', () => {
    /* P₃ con las cuatro derivadas en x = 1, tomadas numéricamente. */
    const h = 0.01;
    const d1 = (y(1 + h) - y(1 - h)) / (2 * h);
    const d2 = (y(1 + h) - 2 * y(1) + y(1 - h)) / (h * h);
    const d3 = (y(1 + 2 * h) - 2 * y(1 + h) + 2 * y(1 - h) - y(1 - 2 * h)) / (2 * h ** 3);
    const t = 0.2;
    cuadra(id, 'La aproximación', y(1) + d1 * t + (d2 * t * t) / 2 + (d3 * t ** 3) / 6);
  });
});

describe('4 · la misma EDO de tres maneras', () => {
  const id = 'ex1314-ord-4-la-misma-edo-de-tres-maneras';

  it('X(2) vale 5/3', () => {
    const X = (s: number) => (2 * s * s + 2 * s - 2) / (s * (s * s - 1));
    cuadra(id, 'La transformada', X(2));
  });

  it('y x(1) vale 2 + 2·senh 1', () => {
    /* x(t) = 2 + e^t − e^{−t}. Se comprueba que resuelve la EDO y las dos
       condiciones iniciales. */
    const x = (t: number) => 2 + Math.exp(t) - Math.exp(-t);
    const e = 1e-4;
    for (const t of [0.3, 1, 2]) {
      const xpp = (x(t + e) - 2 * x(t) + x(t - e)) / (e * e);
      if (Math.abs(xpp - x(t) + 2) > 1e-3) throw new Error(`la EDO falla en t=${t}`);
    }
    if (Math.abs(x(0) - 2) > 1e-12) throw new Error('x(0) no es 2');
    if (Math.abs((x(e) - x(-e)) / (2 * e) - 2) > 1e-6) throw new Error("x'(0) no es 2");
    cuadra(id, 'La solución en un instante', x(1));
  });
});

describe('5 · Green con el centro de gravedad', () => {
  const id = 'ex1314-ord-5-green-con-el-centro-de-gravedad';

  it('el integrando de Green lleva un +1', () => {
    /* P = 3 − y, Q = x² + 3xy. Q_x − P_y = 2x + 3y + 1, con derivadas
       numéricas. */
    const P = (x: number, y: number) => 3 - y;
    const Q = (x: number, y: number) => x * x + 3 * x * y;
    const e = 1e-6;
    const rot = (x: number, y: number) =>
      (Q(x + e, y) - Q(x - e, y)) / (2 * e) - (P(x, y + e) - P(x, y - e)) / (2 * e);
    /* El k se despeja restando la parte conocida, en varios puntos. */
    const ks = ([[1, 2], [0.4, -1], [3, 0.5]] as [number, number][]).map(
      ([x, y]) => rot(x, y) - 2 * x - 3 * y,
    );
    if (ks.some((k) => Math.abs(k - ks[0]) > 1e-5)) throw new Error('el término no es constante');
    cuadra(id, 'El integrando de Green', ks[0]);
  });

  it('y la circulación completa vale 44', () => {
    /* ∬(2x + 3y + 1) dA = 2·A·x_c + 3·A·y_c + A, con A = 8 y el centro en
       (3/2, 1/2). El truco del ejercicio es que la forma del recinto no hace
       falta: basta con su área y su centro de gravedad. */
    const A = 8;
    const xc = 1.5;
    const yc = 0.5;
    cuadra(id, 'La circulación por la frontera completa', 2 * A * xc + 3 * A * yc + A);
  });
});

describe('6 · el cuenco rematado en cono', () => {
  const id = 'ex1314-ord-6-el-cuenco-rematado-en-cono';
  /* r² = z por debajo y r² = (z−6)² por encima, hasta z = 6. */
  const radioCuadrado = (z: number) => (z <= 4 ? z : (z - 6) ** 2);
  const V = Math.PI * integra(radioCuadrado, 0, 6, 1e-11);

  it('el volumen es 32π/3', () => {
    /* Se comprueba antes que el corte está donde el test lo pone. */
    const zc = raiz((z) => z - (z - 6) ** 2, 1, 5.9);
    if (Math.abs(zc - 4) > 1e-9) throw new Error(`el corte está en ${zc}`);
    cuadra(id, 'El volumen', V);
  });

  it('y el centro de gravedad está a 3,125', () => {
    const momento = Math.PI * integra((z) => z * radioCuadrado(z), 0, 6, 1e-11);
    cuadra(id, 'La altura del centro de gravedad', momento / V);
  });
});
