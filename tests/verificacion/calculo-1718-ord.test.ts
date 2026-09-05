/**
 * Convocatoria ordinaria de Cálculo, curso 2017-2018. Quince respuestas.
 *
 * Su ejercicio 2 es el único del corpus sobre el teorema del punto fijo, y
 * las dos preguntas son justo las dos hipótesis que hay que comprobar: que g
 * lleva el intervalo dentro de sí mismo, y que contrae.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { deriva, integra, maximiza, trabajo } from './numerico';

const cuadra = convocatoria('calculo', '2017-2018-ord');

describe('1 · dos potencias que se cancelan', () => {
  const id = 'ex1718-ord-1-dos-potencias-que-se-cancelan';
  const z: [number, number] = [1 / Math.SQRT2, 1 / Math.SQRT2];

  it('cada número tiene módulo 1', () => cuadra(id, 'El módulo de cada número', Math.hypot(...z)));

  it('y al elevar a la décima el argumento queda en π/2', () => {
    /* De Moivre: el argumento se multiplica por diez y se reduce. */
    const th = Math.atan2(z[1], z[0]);
    const ang = ((10 * th) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    cuadra(id, 'El argumento de la primera potencia', ang);
  });
});

describe('2 · el punto fijo de una raíz', () => {
  const id = 'ex1718-ord-2-el-punto-fijo-de-una-raiz';
  const g = (x: number) => Math.sqrt(2 * x + 3);

  it('g manda [0,4] dentro de sí mismo', () => {
    /* El máximo se busca barriendo, y de paso se comprueba la hipótesis: el
       mínimo y el máximo tienen que caer dentro de [0,4]. */
    const mejor = maximiza(g, 0, 4);
    if (!(g(0) >= 0 && mejor.y <= 4)) throw new Error('g se sale del intervalo');
    cuadra(id, 'Dónde manda g al intervalo', mejor.y);
  });

  it('y contrae, con constante 0,577', () => {
    /* |g′| máximo en el intervalo. Si fuese ≥ 1 el teorema no se aplicaría,
       así que se comprueba. */
    const k = maximiza((x) => Math.abs(deriva(g, x)), 0, 4).y;
    if (!(k < 1)) throw new Error('g no es contractiva');
    cuadra(id, 'La constante de contracción', k);
  });
});

describe('3 · el rectángulo inscrito', () => {
  const id = 'ex1718-ord-3-el-rectangulo-inscrito';
  const r = 5;
  /* Vértice en (r cos θ, r sen θ): la base mide 2r cos θ y la altura
     2r sen θ. */
  const area = (th: number) => 2 * r * Math.cos(th) * 2 * r * Math.sin(th);
  const mejor = maximiza(area, 0.001, Math.PI / 2 - 0.001);

  it('con r = 5 la base mide 5√2', () =>
    cuadra(id, 'El lado del rectángulo óptimo', 2 * r * Math.cos(mejor.x)));

  it('y el área máxima es 2r²', () => cuadra(id, 'El área máxima', mejor.y / (r * r)));
});

describe('4 · el trabajo en la espiral', () => {
  const id = 'ex1718-ord-4-el-trabajo-en-la-espiral';
  const r = (t: number) => [t * Math.cos(t), t * Math.sin(t)];

  it('x·y′ − y·x′ vale t², o sea 9 en t = 3', () => {
    /* Se calcula con derivadas numéricas: la simplificación no se supone. */
    const e = 1e-6;
    const t = 3;
    const antes = r(t - e);
    const despues = r(t + e);
    const dr = despues.map((v, i) => (v - antes[i]) / (2 * e));
    const p = r(t);
    cuadra(id, 'La simplificación clave', p[0] * dr[1] - p[1] * dr[0]);
  });

  it('y el trabajo es 4π³/3', () =>
    cuadra(
      id,
      'El trabajo',
      trabajo((p) => [-p[1] / 2, p[0] / 2], r, 0, 2 * Math.PI),
    ));
});

describe('5 · resonancia y tipo de oscilación', () => {
  const id = 'ex1718-ord-5-resonancia-y-tipo-de-oscilacion';
  const e = 1e-4;
  const L = (y: (x: number) => number, x: number) =>
    (y(x + e) - 2 * y(x) + y(x - e)) / (e * e) + 9 * y(x);

  it('el término que crece lleva A = −1,5', () => {
    const A = -1.5;
    const y = (x: number) => x * A * Math.cos(3 * x);
    for (const x of [0.3, 1, 2.4])
      if (Math.abs(L(y, x) - 9 * Math.sin(3 * x)) > 1e-3) throw new Error(`falla en x=${x}`);
    cuadra(id, 'El coeficiente que crece', A);
  });

  it('y la exponencial, C = 1/9', () => {
    const C = 1 / 9;
    const y = (x: number) => C * Math.exp(3 * x);
    for (const x of [-0.5, 0.2, 1])
      if (Math.abs(L(y, x) - 2 * Math.exp(3 * x)) > 1e-3) throw new Error(`falla en x=${x}`);
    cuadra(id, 'El coeficiente de la exponencial', C);
  });
});

describe('6 · una ecuación integral que da un seno', () => {
  const id = 'ex1718-ord-6-una-ecuacion-integral-que-da-un-seno';

  it('el denominador es s² + 1', () => {
    /* Y + Y/s² = 1/s² deja Y = 1/(s²+1). Se comprueba la identidad. */
    const k = 1;
    const Y = (s: number) => 1 / (s * s + k);
    for (const s of [0.4, 1.3, 5])
      if (Math.abs(Y(s) + Y(s) / (s * s) - 1 / (s * s)) > 1e-12)
        throw new Error(`la identidad falla en s=${s}`);
    cuadra(id, 'El denominador que aparece', k);
  });

  it('y la solución es el seno', () => {
    /* Se sustituye y(t) = sen t en la ecuación integral original, calculando
       la convolución de verdad. */
    const y = (t: number) => Math.sin(t);
    for (const t of [0.7, 2, 4]) {
      const conv = integra((z) => (t - z) * y(z), 0, t, 1e-12);
      if (Math.abs(y(t) + conv - t) > 1e-8) throw new Error(`la ecuación falla en t=${t}`);
    }
    cuadra(id, 'Un valor de la solución', y(2));
  });
});

describe('7 · la extensión par de la identidad', () => {
  const id = 'ex1718-ord-7-la-extension-par-de-la-identidad';

  it('el término constante es π/2', () =>
    cuadra(id, 'El término constante', integra((t) => t, 0, Math.PI, 1e-12) / Math.PI));

  it('a₁ vale −4/π', () =>
    cuadra(id, 'El primer armónico', (2 / Math.PI) * integra((t) => t * Math.cos(t), 0, Math.PI, 1e-12)));

  it('y la serie de los impares al cuadrado suma π²/8', () => {
    let s = 0;
    for (let n = 1; n <= 2_000_000; n++) s += 1 / (2 * n - 1) ** 2;
    cuadra(id, 'La suma pedida', s);
  });
});
