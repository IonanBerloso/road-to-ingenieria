/**
 * Convocatoria ordinaria de Cálculo, curso 2018-2019. Diecisiete respuestas.
 *
 * Su ejercicio 7 es la comprobación más redonda de las que han salido: la
 * ecuación integral se resuelve con Laplace en el examen, y aquí se toma la
 * solución propuesta —−t·e^{−t}— y se sustituye en la ecuación original,
 * integrando las dos convoluciones de verdad.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { cEntre, deriva, integra, raiz, type C } from './numerico';

const cuadra = convocatoria('calculo', '2018-2019-ord');

describe('1 · un argumento que vale noventa grados', () => {
  it('en z = 2 la parte imaginaria vale 1', () => {
    const z: C = [2, 0];
    const q = cEntre([z[0], z[1] + 2], [z[0], z[1] - 2]);
    /* Y de paso: ahí el argumento es π/2, que es la condición del enunciado. */
    if (Math.abs(Math.atan2(q[1], q[0]) - Math.PI / 2) > 1e-12)
      throw new Error('el punto de control no cumple la condición');
    cuadra('ex1819-ord-1-un-argumento-que-vale-noventa-grados', 'La parte imaginaria en un punto de control', q[1]);
  });
});

describe('2 · Lagrange y cuándo no se puede aplicar', () => {
  const id = 'ex1819-ord-2-lagrange-y-cuando-no-se-puede-aplicar';
  const y = (x: number) => 3 * Math.sqrt(x) - 4 * x;

  it('la pendiente media vale −3', () =>
    cuadra(id, 'La pendiente que hay que igualar', (y(4) - y(1)) / 3));

  it('y el punto del teorema es 2,25', () => {
    /* Se busca dónde la derivada iguala a esa pendiente, y se comprueba que
       cae dentro del intervalo abierto. */
    const media = (y(4) - y(1)) / 3;
    const c = raiz((x) => deriva(y, x) - media, 1.01, 3.99);
    if (!(c > 1 && c < 4)) throw new Error('el punto no cae dentro del intervalo');
    cuadra(id, 'El punto que da el teorema', c);
  });
});

describe('3 · la serie de equis por seno', () => {
  const id = 'ex1819-ord-3-la-serie-de-equis-por-seno';

  it('el coeficiente de x⁴ es −1/6', () => {
    /* x·sen x = Σ(−1)ⁿx^{2n+2}/(2n+1)!. El de grado 4 sale con n = 1. */
    const n = 1;
    if (2 * n + 2 !== 4) throw new Error('el grado 4 no sale con n = 1');
    cuadra(id, 'El coeficiente de cuarto grado', (-1) ** n / 6);
  });

  it('y la derivada veinticuatro vale −24', () => {
    /* Grado 24 con n = 11: coeficiente (−1)¹¹/23!, y la derivada es 24! por
       él, o sea −24!/23! = −24. Se calcula el cociente sin construir los
       factoriales, que se salen del rango de un double. */
    const n = 11;
    if (2 * n + 2 !== 24) throw new Error('el grado 24 no sale con n = 11');
    cuadra(id, 'La derivada veinticuatro', (-1) ** n * 24);
  });
});

describe('4 · un cambio y después unas partes', () => {
  const id = 'ex1819-ord-4-un-cambio-y-despues-unas-partes';
  const g = (x: number) => (2 * x * Math.log(1 + x * x)) / (1 + x * x) ** 2;

  it('la primitiva lleva un +1 dentro del logaritmo', () => {
    /* F(x) = −(ln(1+x²) + k)/(1+x²). Se comprueba que con k = 1 su derivada
       es el integrando, en varios puntos. */
    const k = 1;
    const F = (x: number) => -(Math.log(1 + x * x) + k) / (1 + x * x);
    for (const x of [-1.5, 0.4, 2.2])
      if (Math.abs(deriva(F, x) - g(x)) > 1e-6) throw new Error(`la primitiva falla en x=${x}`);
    cuadra(id, 'La constante que deja la integración por partes', k);
  });

  it('y entre 0 y 1 la integral vale 0,1534', () =>
    cuadra(id, 'Un valor de control', integra(g, 0, 1, 1e-13)));
});

describe('5 · el cucurucho esférico', () => {
  const id = 'ex1819-ord-5-el-cucurucho-esferico';
  const R = 3;
  /* x²+y² ≤ z² con z ≥ 0 es el cono de semiángulo 45°. */
  const phi = Math.PI / 4;

  it('el ángulo polar llega a 45°', () => {
    /* tan φ = r/z, y en el borde del cono r = z. */
    cuadra(id, 'El ángulo del cono en esféricas', (Math.atan(1) * 180) / Math.PI);
  });

  it('el volumen es 16,563', () => {
    /* En esféricas, ∫∫∫ρ²senφ dρ dφ dθ. */
    const V = 2 * Math.PI * integra((f) => Math.sin(f), 0, phi, 1e-12) * integra((p) => p * p, 0, R, 1e-12);
    cuadra(id, 'El volumen', V);
  });

  it('y la superficie completa, 36,556', () => {
    /* Dos trozos: el casquete esférico y el lateral del cono. El casquete es
       ∫∫R²senφ dφ dθ; el lateral, la superficie de revolución de la recta
       z = r desde el vértice hasta el borde. */
    const casquete = 2 * Math.PI * R * R * integra((f) => Math.sin(f), 0, phi, 1e-12);
    const rBorde = R * Math.sin(phi);
    const lateral = 2 * Math.PI * integra((r) => Math.sqrt(1 + 1) * r, 0, rBorde, 1e-12);
    cuadra(id, 'El área de la superficie', casquete + lateral);
  });
});

describe('6 · el pez de Bertalanffy', () => {
  const id = 'ex1819-ord-6-el-pez-de-bertalanffy';
  const A = 60;
  const L0 = 5;
  const k = 0.4;
  const L = (t: number) => A - (A - L0) * Math.exp(-k * t);

  it('a los tres años mide 43,43 cm', () => {
    /* Se comprueba que la función cumple L′ = k(A − L) antes de evaluarla. */
    for (const t of [0.5, 3, 8])
      if (Math.abs(deriva(L, t) - k * (A - L(t))) > 1e-6) throw new Error(`la EDO falla en t=${t}`);
    if (Math.abs(L(0) - L0) > 1e-12) throw new Error('la longitud inicial no cuadra');
    cuadra(id, 'La longitud al cabo de un rato', L(3));
  });

  it('y llega a 30 cm en el año 1,52', () =>
    cuadra(id, 'Cuándo llega a la mitad de su talla máxima', raiz((t) => L(t) - 30, 0.1, 10)));
});

describe('7 · una ecuación integral por Laplace', () => {
  const id = 'ex1819-ord-7-una-ecuacion-integral-por-laplace';
  /* G(s) = 1/(s(s−1)) es la transformada de e^t − 1. */
  const g = (t: number) => Math.exp(t) - 1;

  it('g(1) vale e − 1', () => cuadra(id, 'La función que dan por su transformada', g(1)));

  it('y f(1) vale −1/e', () => {
    /* f(t) = −t·e^{−t}. Se sustituye en la ecuación original, integrando las
       dos convoluciones de verdad: es la comprobación completa, sin repetir
       ni un paso del camino de Laplace. */
    const f = (t: number) => -t * Math.exp(-t);
    for (const t of [0.4, 1, 2.5]) {
      const conv = integra((x) => Math.exp(-(t - x)) * g(x), 0, t, 1e-12);
      const acumulado = integra(f, 0, t, 1e-12);
      const derecha = 1 - Math.exp(t) + 2 * conv - acumulado;
      if (Math.abs(f(t) - derecha) > 1e-8) throw new Error(`la ecuación falla en t=${t}`);
    }
    cuadra(id, 'La solución, en un punto', f(1));
  });
});

describe('8 · el diente de sierra con media onda nula', () => {
  const id = 'ex1819-ord-8-el-diente-de-sierra-con-media-onda-nula';

  it('el término constante es π/4', () =>
    cuadra(id, 'El término constante', integra((t) => t, 0, Math.PI, 1e-12) / (2 * Math.PI)));

  it('b₁ vale 1', () =>
    cuadra(id, 'El primer coeficiente en seno', integra((t) => t * Math.sin(t), 0, Math.PI, 1e-12) / Math.PI));

  it('y la serie de los impares al cuadrado suma π²/8', () => {
    let s = 0;
    for (let n = 1; n <= 2_000_000; n++) s += 1 / (2 * n - 1) ** 2;
    cuadra(id, 'La suma pedida', s);
  });
});
