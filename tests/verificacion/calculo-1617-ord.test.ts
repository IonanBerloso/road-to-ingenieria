/**
 * Convocatoria ordinaria de Cálculo, curso 2016-2017. Trece respuestas.
 *
 * Su ejercicio 4 es el más corto de verificar y el más difícil de verificar
 * bien: la pregunta reduce un problema de curvas de nivel a una regla de
 * tres —cuánta distancia hay entre dos cotas si el gradiente mide tanto—, y
 * lo que se comprueba es esa regla sobre una función concreta.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { deriva, integra, raiz } from './numerico';

const cuadra = convocatoria('calculo', '2016-2017-ord');

describe('1 · las seis raíces y su hexágono', () => {
  const id = 'ex1617-ord-1-las-seis-raices-y-su-hexagono';
  const raices = [0, 1, 2, 3, 4, 5].map((k) => {
    const th = (2 * Math.PI * k) / 6;
    return [Math.cos(th), Math.sin(th)];
  });

  it('las raíces van de sesenta en sesenta grados', () => {
    /* Se comprueba que cada una elevada a la sexta da 1. */
    for (const [x, y] of raices) {
      const th = Math.atan2(y, x);
      if (Math.hypot(Math.cos(6 * th) - 1, Math.sin(6 * th)) > 1e-9)
        throw new Error('no es raíz sexta de la unidad');
    }
    cuadra(id, 'El paso entre raíces', 360 / raices.length);
  });

  it('y el hexágono mide 6', () => {
    /* Se suman los seis lados de verdad. */
    let p = 0;
    for (let k = 0; k < 6; k++) {
      const a = raices[k];
      const b = raices[(k + 1) % 6];
      p += Math.hypot(a[0] - b[0], a[1] - b[1]);
    }
    cuadra(id, 'El perímetro', p);
  });
});

describe('2 · el valor intermedio demostrado', () => {
  it('el mínimo de x³ − 3x en [0,2] está en x = 1', () => {
    /* La demostración es teórica; lo comprobable es el caso concreto. Se
       busca el mínimo barriendo, sin derivar. */
    const y = (x: number) => x ** 3 - 3 * x;
    let mejor = 0;
    for (let x = 0; x <= 2; x += 0.0001) if (y(x) < y(mejor)) mejor = x;
    cuadra('ex1617-ord-2-el-valor-intermedio-demostrado', 'El teorema en un caso concreto', mejor);
  });
});

describe('3 · la parábola y su tangente', () => {
  const id = 'ex1617-ord-3-la-parabola-y-su-tangente';
  const p = (x: number) => 4 * x * x;
  const tangente = (x: number) => 8 * x - 4;
  const corte = raiz(tangente, 0, 1);

  it('el área es 1/3', () =>
    cuadra(
      id,
      'El área',
      integra(p, 0, corte, 1e-12) + integra((x) => p(x) - tangente(x), corte, 1, 1e-12),
    ));

  it('y el volumen, 1,6755', () =>
    cuadra(
      id,
      'El volumen',
      Math.PI * integra((x) => p(x) ** 2, 0, corte, 1e-12) +
        Math.PI * integra((x) => p(x) ** 2 - tangente(x) ** 2, corte, 1, 1e-12),
    ));
});

describe('4 · dónde va la curva de nivel intermedia', () => {
  it('la cota intermedia está a 0,025 de distancia', () => {
    /* La regla es Δz ≈ |∇F|·Δs. Se comprueba sobre una función concreta con
       gradiente de módulo 2: la distancia entre las curvas z = 1,50 y
       z = 1,55 tiene que ser la mitad de la diferencia de cotas. */
    const F = (x: number, y: number) => 2 * x + 0 * y;
    const e = 1e-6;
    const modulo = Math.hypot((F(e, 0) - F(-e, 0)) / (2 * e), (F(0, e) - F(0, -e)) / (2 * e));
    if (Math.abs(modulo - 2) > 1e-9) throw new Error('el gradiente de prueba no mide 2');
    const x150 = raiz((x) => F(x, 0) - 1.5, -10, 10);
    const x155 = raiz((x) => F(x, 0) - 1.55, -10, 10);
    cuadra('ex1617-ord-4-donde-va-la-curva-de-nivel-intermedia', 'La distancia, con un número', Math.abs(x155 - x150));
  });
});

describe('5 · el cono tapado por un paraboloide', () => {
  const id = 'ex1617-ord-5-el-cono-tapado-por-un-paraboloide';
  /* Por debajo del corte manda el cono, r = z; por encima, el paraboloide,
     r² = 2 − z. Se cortan donde z = 2 − z². */
  const zc = raiz((z) => z - (2 - z * z), 0, 2);

  it('el volumen es 5π/6', () => {
    const abajo = Math.PI * integra((z) => z * z, 0, zc, 1e-12);
    const arriba = Math.PI * integra((z) => 2 - z, zc, 2, 1e-12);
    cuadra(id, 'El volumen', abajo + arriba);
  });

  it('y la superficie completa, 9,773', () => {
    /* Cono con dz/dr = 1 y paraboloide con dz/dr = −2r, los dos como
       superficie de revolución. */
    const cono = 2 * Math.PI * integra((r) => Math.SQRT2 * r, 0, zc, 1e-12);
    const parabola = 2 * Math.PI * integra((r) => Math.sqrt(1 + 4 * r * r) * r, 0, zc, 1e-12);
    cuadra(id, 'El área total', cono + parabola);
  });
});

describe('6 · una raíz doble y un seno', () => {
  const id = 'ex1617-ord-6-una-raiz-doble-y-un-seno';

  it('el numerador sobre (s+1)² vale 1,5', () => {
    /* B = lím_{s→−1} (s+1)²·Y(s) = (s²+2)/(s²+1) en s = −1. */
    const g = (s: number) => (s * s + 2) / (s * s + 1);
    const cerca = [-1 + 1e-6, -1 - 1e-6].map(g);
    if (Math.abs(cerca[0] - cerca[1]) > 1e-5) throw new Error('el límite no es limpio');
    cuadra(id, 'El coeficiente de la raíz doble', cerca[0]);
  });

  it('y y(2) vale 0,6817', () => {
    /* y(t) = ½e^{−t} + 1,5t·e^{−t} − ½cos t. Se comprueba que cumple la EDO
       y las dos condiciones iniciales. */
    const y = (t: number) =>
      0.5 * Math.exp(-t) + 1.5 * t * Math.exp(-t) - 0.5 * Math.cos(t);
    const e = 1e-4;
    for (const t of [0.5, 2, 4]) {
      const yp = (y(t + e) - y(t - e)) / (2 * e);
      const ypp = (y(t + e) - 2 * y(t) + y(t - e)) / (e * e);
      if (Math.abs(ypp + 2 * yp + y(t) - Math.sin(t)) > 1e-4)
        throw new Error(`la EDO falla en t=${t}`);
    }
    if (Math.abs(y(0)) > 1e-12) throw new Error('y(0) no es cero');
    if (Math.abs(deriva(y, 0) - 1) > 1e-6) throw new Error("y'(0) no es uno");
    cuadra(id, 'Un valor de la solución', y(2));
  });
});

describe('7 · el diente de sierra de menos te', () => {
  const id = 'ex1617-ord-7-el-diente-de-sierra-de-menos-te';

  it('b₁ vale −2', () =>
    cuadra(id, 'El primer armónico', (2 / Math.PI) * integra((t) => -t * Math.sin(t), 0, Math.PI, 1e-12)));

  it('S(101π) vale 0, que es la media del salto', () => {
    /* 101π se reduce a π, donde la función salta de −π a π. */
    const izquierda = -Math.PI;
    const derecha = Math.PI;
    cuadra(id, 'El valor de la serie en el salto', (izquierda + derecha) / 2);
  });

  it('y la suma alternada es π/4', () => {
    let s = 0;
    let previa = 0;
    for (let n = 0; n < 200000; n++) {
      previa = s;
      s += (-1) ** n / (2 * n + 1);
    }
    cuadra(id, 'La suma pedida', (s + previa) / 2);
  });
});
