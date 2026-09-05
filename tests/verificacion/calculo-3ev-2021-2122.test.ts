/**
 * Las terceras evaluaciones de Cálculo de 2020-2021 y 2021-2022. Veinte
 * respuestas entre las dos.
 *
 * El ejercicio 6 de 2020-2021 tiene la condición más escondida del corpus: no
 * basta con que la derivada direccional en la bisectriz valga 3√2, tiene que
 * ser **la máxima**, y eso obliga a que el gradiente sea paralelo a la
 * bisectriz. El test comprueba las dos cosas.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { deriva, deriva2, deriva3, integra, maximiza, raiz } from './numerico';

const cuadra2122 = convocatoria('calculo', '2021-2022-3ev');
const cuadra2021 = convocatoria('calculo', '2020-2021-3ev');

describe('2021-2022 · 1 · semirrecta cortada', () => {
  const id = 'ex2122-3ev-1-semirrecta-cortada';

  it('el semiplano es y ≤ 1/2', () => {
    /* |z| ≤ |z̄ + i| se reduce a y² ≤ (1−y)². Se comprueba a los dos lados
       de la frontera. */
    const cumple = (x: number, y: number) => Math.hypot(x, y) <= Math.hypot(x, 1 - y);
    if (!cumple(3, 0.49) || cumple(3, 0.51)) throw new Error('la frontera no está en 0,5');
    cuadra2122(id, 'El semiplano de la segunda condición', 0.5);
  });

  it('y la semirrecta empieza en x = 4,5', () => {
    /* arg(1/(z−2−3i)) = π/4 es arg(z−2−3i) = −π/4: la semirrecta que sale de
       (2,3) hacia abajo y a la derecha. Se corta con y = 1/2. */
    const punto = (t: number) => [2 + t * Math.cos(-Math.PI / 4), 3 + t * Math.sin(-Math.PI / 4)];
    const t = raiz((v) => punto(v)[1] - 0.5, 0, 20);
    cuadra2122(id, 'Dónde empieza la semirrecta', punto(t)[0]);
  });
});

describe('2021-2022 · 2 · verdadero o falso', () => {
  it('solo una de las tres es verdadera', () => {
    /* Las dos primeras se refutan con contraejemplos concretos; la tercera es
       cierta y se comprueba sobre una sucesión que se acerca a cero por
       arriba. */
    const divergen = { a: (n: number) => n, b: (n: number) => -n };
    const sumaConverge = Math.abs(divergen.a(1000) + divergen.b(1000)) < 1e-9;

    const noConvergen = { a: (n: number) => (-1) ** n, b: (n: number) => (-1) ** n };
    const productoConverge = [10, 11, 12].every((n) => noConvergen.a(n) * noConvergen.b(n) === 1);

    const positivaConverge = (n: number) => 1 / n; // ≥ 0 y tiende a 0
    const limiteNoNegativo = positivaConverge(1e6) >= 0;

    const verdaderas = [!sumaConverge, !productoConverge, limiteNoNegativo].filter(Boolean).length;
    cuadra2122('ex2122-3ev-2-verdadero-o-falso', 'Cuántas son verdaderas', verdaderas);
  });
});

describe('2021-2022 · 3 · serie del seno hiperbólico', () => {
  it('el coeficiente de x³ es 1/6', () => {
    /* sh x = x + x³/6 + …. Se saca la tercera derivada por diferencias sobre
       la función, no de la serie. */
    const sh = (x: number) => (Math.exp(x) - Math.exp(-x)) / 2;
    cuadra2122('ex2122-3ev-3-serie-del-seno-hiperbolico', 'El primer coeficiente no trivial', deriva3(sh, 0) / 6);
  });
});

describe('2021-2022 · 4 · integral que no converge', () => {
  it('la mitad izquierda sí converge, y vale −1', () => {
    /* Se integra cada vez más lejos y se comprueba que se estabiliza. */
    const g = (x: number) => x * Math.exp(x);
    const lejos = [-30, -60, -120].map((L) => integra(g, L, 0, 1e-12));
    if (Math.abs(lejos[2] - lejos[1]) > 1e-9) throw new Error('no converge');
    cuadra2122('ex2122-3ev-4-integral-que-no-converge', 'La parte que sí converge', lejos[2]);
  });
});

describe('2021-2022 · 5 · función error', () => {
  const id = 'ex2122-3ev-5-funcion-error';
  const f = (x: number) => integra((z) => Math.exp(-z * z), 0, x * x, 1e-12);

  it('su único extremo está en el origen', () => cuadra2122(id, 'El extremo', raiz((x) => deriva(f, x), -1, 1)));

  it('y la inflexión positiva, en 1/√2', () => {
    cuadra2122(id, 'Las inflexiones', raiz((x) => deriva2(f, x), 0.3, 1.2));
  });
});

describe('2021-2022 · 6 · parábola y recta paralela', () => {
  const id = 'ex2122-3ev-6-parabola-y-recta-paralela';
  /* x = y² − 1 y la recta y = x − 1, o sea x = y + 1. */

  it('se cortan en y = 2', () =>
    cuadra2122(id, 'Dónde se cortan la parábola y la recta', raiz((y) => y * y - 1 - (y + 1), 0.1, 5)));

  it('y el área es 10/3', () =>
    cuadra2122(id, 'El área', integra((y) => y + 1 - (y * y - 1), 0, 2, 1e-12)));
});

describe('2020-2021 · 1 · semiplano con mordisco', () => {
  const id = 'ex2021-3ev-1-semiplano-con-mordisco';

  it('a vale 2', () => {
    /* (8+8i)/(a−2i) imaginario puro: su parte real, (8a−16)/(a²+4), se anula
       en a = 2. */
    cuadra2021(id, 'El valor de a', raiz((a) => (8 * a - 16) / (a * a + 4), 0, 5));
  });

  it('y el disco que se quita está centrado en −3', () => {
    /* z₁ = 3 + 2i, y el punto es z̄₁ − i = 3 − 3i. */
    const z1 = [3, 2];
    cuadra2021(id, 'El centro del disco que se quita', -z1[1] - 1);
  });
});

describe('2020-2021 · 2 · McLaurin de la integral', () => {
  const id = 'ex2021-3ev-2-mclaurin-de-la-integral';
  const f = (x: number) => integra((z) => Math.exp(z * z), 0, x, 1e-13);

  it('el coeficiente cúbico es 1/3', () => {
    cuadra2021(id, 'El coeficiente cúbico', deriva3(f, 0) / 6);
  });

  it('y hay una sola inflexión', () => {
    /* f″ = 2x·e^{x²}, que solo se anula en el origen. Se cuentan los cambios
       de signo. */
    const segunda = (x: number) => 2 * x * Math.exp(x * x);
    let ceros = 0;
    let ultimo = 0;
    for (let x = -2; x <= 2; x += 0.001) {
      const s = Math.sign(segunda(x));
      if (s !== 0 && ultimo !== 0 && s !== ultimo) ceros++;
      if (s !== 0) ultimo = s;
    }
    cuadra2021(id, 'Las inflexiones', ceros);
  });
});

describe('2020-2021 · 3 · bidón cerrado', () => {
  const id = 'ex2021-3ev-3-bidon-cerrado';
  /* Volumen 16π: h = 16/r². Superficie con dos tapas. */
  const S = (r: number) => 2 * Math.PI * r * r + 2 * Math.PI * r * (16 / (r * r));
  const mejor = maximiza((r) => -S(r), 0.2, 20);

  it('el radio óptimo es 2 m', () => cuadra2021(id, 'El radio óptimo', mejor.x));

  it('y la superficie mínima, 24π', () => cuadra2021(id, 'La superficie mínima', -mejor.y));
});

describe('2020-2021 · 4 · Barrow demostrado', () => {
  it('la constante de la primitiva se cancela', () => {
    /* Con G(x) = x³/3 + 100, que también es primitiva, el resultado no
       cambia: eso es lo que demuestra el ejercicio. */
    const G = (x: number) => x ** 3 / 3 + 100;
    const porBarrow = G(3) - G(0);
    const porCuadratura = integra((x) => x * x, 0, 3, 1e-12);
    if (Math.abs(porBarrow - porCuadratura) > 1e-9) throw new Error('los dos caminos discrepan');
    cuadra2021('ex2021-3ev-4-barrow-demostrado', 'La constante que se cancela', porBarrow);
  });
});

describe('2020-2021 · 5 · dos integrales con trampa', () => {
  const id = 'ex2021-3ev-5-dos-integrales-con-trampa';

  it('el denominador se reduce a 1 + 3sen²x', () => {
    const k = 3;
    for (const x of [0.3, 1.1, 2.7]) {
      const original = 8 - 4 * Math.sin(x) ** 2 - 7 * Math.cos(x) ** 2;
      if (Math.abs(original - (1 + k * Math.sin(x) ** 2)) > 1e-12)
        throw new Error(`la simplificación falla en x=${x}`);
    }
    cuadra2021(id, 'El denominador simplificado', k);
  });

  it('y la primitiva lleva 1/√3 delante', () => {
    /* Se comprueba que la derivada de C·arctan(√3·sen x) es el integrando. */
    const C = 1 / Math.sqrt(3);
    const F = (x: number) => C * Math.atan(Math.sqrt(3) * Math.sin(x));
    const g = (x: number) => Math.cos(x) / (1 + 3 * Math.sin(x) ** 2);
    for (const x of [0.2, 1, 2.5])
      if (Math.abs(deriva(F, x) - g(x)) > 1e-6) throw new Error(`no es primitiva en x=${x}`);
    cuadra2021(id, 'El coeficiente de la primitiva', C);
  });
});

describe('2020-2021 · 6 · derivada direccional máxima', () => {
  const id = 'ex2021-3ev-6-derivada-direccional-maxima';
  const f = (a: number, b: number) => (x: number, y: number) =>
    Math.exp(a * x + b * y) * Math.cos(x + y);
  const grad = (a: number, b: number) => {
    const e = 1e-6;
    const F = f(a, b);
    return [(F(e, 0) - F(-e, 0)) / (2 * e), (F(0, e) - F(0, -e)) / (2 * e)];
  };

  it('con a = 3 la parcial en x vale 3', () => cuadra2021(id, 'El gradiente en el origen', grad(3, 3)[0]));

  it('y a vale 3, porque el gradiente tiene que ir por la bisectriz', () => {
    /* Dos condiciones, no una: que el módulo del gradiente sea 3√2 —esa es la
       derivada direccional MÁXIMA— y que apunte en la dirección (1,1), que
       es lo que hace que la máxima se alcance en la bisectriz. */
    const a = 3;
    const g = grad(a, a);
    if (Math.abs(g[0] - g[1]) > 1e-6) throw new Error('el gradiente no va por la bisectriz');
    if (Math.abs(Math.hypot(...(g as [number, number])) - 3 * Math.SQRT2) > 1e-5)
      throw new Error(`el módulo vale ${Math.hypot(g[0], g[1])}`);
    cuadra2021(id, 'El valor de a', a);
  });
});
