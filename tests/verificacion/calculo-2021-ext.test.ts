/**
 * Convocatoria extraordinaria de Cálculo, curso 2020-2021. Dieciséis
 * respuestas.
 *
 * Su ejercicio 6 pide **calcular la misma integral de dos formas** —
 * parametrizando y con Green—, así que el propio enunciado trae la
 * comprobación cruzada dentro. Aquí se hacen las dos y se exige que coincidan.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { deriva, integra, integraCasi, maximiza, raiz, trabajo } from './numerico';

const cuadra = convocatoria('calculo', '2020-2021-ext');

describe('1 · el cuadrado que contiene el afijo', () => {
  const id = 'ex2021-ext-1-el-cuadrado-que-contiene-el-afijo';
  const z1 = [-3, 3];
  const z2 = [-2, 1];
  const lado = [z2[0] - z1[0], z2[1] - z1[1]];

  it('el vértice pegado a z₂ es 2i', () => {
    /* Hay dos cuadrados posibles, uno a cada lado. Se elige el que contiene
       al afijo −2+2i, que es la condición del enunciado, comprobándolo. */
    const dentro = (perp: number[]) => {
      const z3 = [z2[0] + perp[0], z2[1] + perp[1]];
      const centro = [(z1[0] + z3[0]) / 2, (z1[1] + z3[1]) / 2];
      const semidiagonal = Math.hypot(z1[0] - centro[0], z1[1] - centro[1]);
      return Math.hypot(-2 - centro[0], 2 - centro[1]) < semidiagonal;
    };
    const candidatos = [
      [-lado[1], lado[0]],
      [lado[1], -lado[0]],
    ];
    const bueno = candidatos.filter(dentro);
    if (bueno.length !== 1) throw new Error('no hay exactamente un cuadrado que contenga el afijo');
    cuadra.complejo(id, 'El vértice contiguo a z₂', [z2[0] + bueno[0][0], z2[1] + bueno[0][1]]);
  });

  it('y el centro está en −1,5 + 2,5i', () => {
    const z3 = [z2[0] - lado[1], z2[1] + lado[0]];
    cuadra.complejo(id, 'El centro del cuadrado', [(z1[0] + z3[0]) / 2, (z1[1] + z3[1]) / 2]);
  });
});

describe('2 · derecha, izquierda y la rapidez máxima', () => {
  const id = 'ex2021-ext-2-derecha-izquierda-y-la-rapidez-maxima';
  const x = (t: number) => (4 * t - 1) * (t - 1) ** 2;
  const v = (t: number) => deriva(x, t);

  it('va más rápido hacia atrás en t = 0,75', () => {
    /* El tramo de retroceso está donde v < 0. Se localiza barriendo y se
       busca dentro el mínimo de v. */
    let desde = NaN;
    let hasta = NaN;
    for (let t = 0.001; t < 3; t += 0.0005) {
      if (v(t) < 0 && Number.isNaN(desde)) desde = t;
      if (!Number.isNaN(desde) && Number.isNaN(hasta) && v(t) > 0) hasta = t;
    }
    if (Number.isNaN(desde) || Number.isNaN(hasta)) throw new Error('no encuentro el tramo de retroceso');
    cuadra(id, 'El instante de la rapidez máxima hacia la izquierda', maximiza((t) => -v(t), desde, hasta).x);
  });

  it('y allí la velocidad vale −0,75', () => cuadra(id, 'La velocidad en ese instante', v(0.75)));
});

describe('3 · el McLaurin de una integral sin primitiva', () => {
  const id = 'ex2021-ext-3-el-mclaurin-de-una-integral-sin-primitiva';
  const g = (t: number) => (1 + Math.sin(t)) / (2 + t * t);
  const F = (x: number) => 3 + integra(g, 0, x, 1e-13);
  const e = 1e-3;
  const segunda = (F(e) - 2 * F(0) + F(-e)) / (e * e);

  it("F''(0) vale 1/2", () => cuadra(id, 'La segunda derivada en el origen', segunda));

  it('y el coeficiente de x² es 1/4', () => cuadra(id, 'El coeficiente de x²', segunda / 2));
});

describe('4 · la recta, la hipérbola y la arandela', () => {
  const id = 'ex2021-ext-4-la-recta-la-hiperbola-y-la-arandela';
  const arriba = (x: number) => x;
  const abajo = (x: number) => 1 / x;

  it('el área es 6,114', () =>
    cuadra(id, 'El área del recinto', integra((x) => arriba(x) - abajo(x), 1, 4, 1e-12)));

  it('y el volumen, 63,617', () =>
    cuadra(
      id,
      'El volumen',
      Math.PI * integra((x) => arriba(x) ** 2 - abajo(x) ** 2, 1, 4, 1e-12),
    ));
});

describe('5 · el cilindro dentro de la esfera', () => {
  const id = 'ex2021-ext-5-el-cilindro-dentro-de-la-esfera';
  /* Cilindro de radio 3 según el eje Y, cortado por la esfera de radio 5 y
     por y ≥ 0: a cada radio r del plano XZ, la altura es √(25 − r²). */
  const alto = (r: number) => Math.sqrt(25 - r * r);
  const V = 2 * Math.PI * integra((r) => alto(r) * r, 0, 3, 1e-12);

  it('el volumen es 127,758', () => cuadra(id, 'El volumen', V));

  it('y el centro de gravedad está a 2,268', () => {
    /* ȳ = ∫y dV / V, y en cada columna vertical ∫y dy = alto²/2. */
    const momento = 2 * Math.PI * integra((r) => ((alto(r) ** 2) / 2) * r, 0, 3, 1e-12);
    cuadra(id, 'La altura del centro de gravedad', momento / V);
  });
});

describe('6 · Green entre dos parábolas', () => {
  const id = 'ex2021-ext-6-green-entre-dos-parabolas';
  const V = (p: number[]) => [2 * p[0] * p[1] - p[0] ** 2, p[0] + p[1] ** 2];

  it('el tramo de y = x² vale 7/6', () =>
    cuadra(id, 'El tramo de la parábola y = x²', trabajo(V, (t) => [t, t * t], 0, 1)));

  it('y la circulación completa vale 1/30, por los dos caminos', () => {
    /* Parametrizando: la ida por y = x² y la vuelta por x = y², que es la
       misma parábola reflejada, recorrida de (1,1) a (0,0). */
    const ida = trabajo(V, (t) => [t, t * t], 0, 1);
    const vuelta = trabajo(V, (t) => [t * t, t], 1, 0);
    /* Y por Green: ∬(Q_x − P_y) dA con Q_x − P_y = 1 − 2x. */
    /* La raíz tiene derivada infinita en x = 0, así que hay que apartarse
       de ese extremo. */
    const porGreen = integraCasi(
      (x) => (1 - 2 * x) * (Math.sqrt(x) - x * x),
      0,
      1,
      1e-10,
      'a',
    );
    if (Math.abs(ida + vuelta - porGreen) > 1e-6)
      throw new Error(`los dos caminos discrepan: ${ida + vuelta} contra ${porGreen}`);
    cuadra(id, 'La integral completa', ida + vuelta);
  });
});

describe('7 · el embalse que se evapora', () => {
  const id = 'ex2021-ext-7-el-embalse-que-se-evapora';

  it('se estabiliza en 20.000 litros', () => {
    /* C′ = 1000 − 0,05C. El equilibrio es donde la derivada se anula. */
    cuadra(id, 'El nivel de equilibrio', raiz((C) => 1000 - 0.05 * C, 0, 1e6));
  });

  it('y arrancando vacío K vale −20.000', () => {
    /* Se comprueba que C(t) = 20000 + K e^{−0,05t} con K = −20000 cumple la
       EDO y arranca en cero. */
    const K = -20000;
    const C = (t: number) => 20000 + K * Math.exp(-0.05 * t);
    for (const t of [1, 10, 50])
      if (Math.abs(deriva(C, t) - (1000 - 0.05 * C(t))) > 1e-3)
        throw new Error(`la EDO falla en t=${t}`);
    if (Math.abs(C(0)) > 1e-9) throw new Error('el embalse no arranca vacío');
    cuadra(id, 'La constante, si el embalse empieza vacío', K);
  });
});

describe('8 · Laplace con término constante', () => {
  const id = 'ex2021-ext-8-laplace-con-termino-constante';

  it('el cuadrado completado deja un 4', () => {
    /* (s+1)² + a = s² + 2s + 1 + a, y tiene que dar s² + 2s + 5. */
    const a = 4;
    for (const s of [-2, 0.5, 3])
      if (Math.abs((s + 1) ** 2 + a - (s * s + 2 * s + 5)) > 1e-12)
        throw new Error(`el cuadrado no cuadra en s=${s}`);
    cuadra(id, 'El cuadrado completado', a);
  });

  it('y la oscilación lleva coeficiente 1', () => {
    const c = 1;
    const y = (t: number) => 1 + c * Math.exp(-t) * Math.sin(2 * t);
    const e = 1e-4;
    for (const t of [0.3, 1, 2.5]) {
      const yp = (y(t + e) - y(t - e)) / (2 * e);
      const ypp = (y(t + e) - 2 * y(t) + y(t - e)) / (e * e);
      if (Math.abs(ypp + 2 * yp + 5 * y(t) - 5) > 1e-3) throw new Error(`la EDO falla en t=${t}`);
    }
    if (Math.abs(y(0) - 1) > 1e-12) throw new Error('y(0) no es 1');
    if (Math.abs(deriva(y, 0) - 2) > 1e-6) throw new Error("y'(0) no es 2");
    cuadra(id, 'El coeficiente de la oscilación', c);
  });
});
