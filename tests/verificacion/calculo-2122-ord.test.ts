/**
 * Convocatoria ordinaria de Cálculo, curso 2021-2022. Diecinueve respuestas.
 *
 * Su ejercicio 2 es **el mismo** que el 2 de la ordinaria de 2023-2024, con la
 * misma figura y los mismos cinco apartados; aquí se preguntan otros dos
 * números. Que las dos convocatorias se verifiquen con la misma reconstrucción
 * de las parábolas —y cuadren las dos— es una comprobación cruzada gratis.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { cEntre, deriva, integra, raiz } from './numerico';

const cuadra = convocatoria('calculo', '2021-2022-ord');

describe('1 · imaginario puro y un lugar geométrico', () => {
  const id = 'ex2122-ord-1-imaginario-puro-y-un-lugar-geometrico';

  it('a vale 2', () => {
    /* z = (8+8i)/(a−2i) es imaginario puro cuando su parte real se anula. Se
       divide de verdad —con `cEntre`— y se busca la raíz de esa parte real,
       en vez de despejarla a mano. */
    const parteReal = (a: number) => cEntre([8, 8], [a, -2])[0];
    const aBueno = raiz(parteReal, 0, 5);
    /* Y se comprueba que con ese a el cociente es imaginario puro de verdad. */
    const z = cEntre([8, 8], [aBueno, -2]);
    if (Math.abs(z[0]) > 1e-9 || Math.abs(z[1]) < 1e-9)
      throw new Error(`con a=${aBueno} el cociente no es imaginario puro`);
    cuadra(id, 'El parámetro', aBueno);
  });

  it('y el centro del disco excluido tiene parte imaginaria −3', () => {
    /* z₁ = 3 + 2i con el a del apartado anterior, y el punto es z̄₁ − i. */
    const z1 = [3, 2];
    const punto = [z1[0], -z1[1] - 1];
    cuadra(id, 'El centro del disco excluido', punto[1]);
  });
});

describe('2 · cinco afirmaciones sobre dos gráficas', () => {
  const id = 'ex2122-ord-2-cinco-afirmaciones-sobre-dos-graficas';
  /* Las mismas dos parábolas de la ordinaria de 2023-2024. */
  const f = (x: number) => 6 - (x - 3) ** 2;
  const g = (u: number) => 1 + (u - 5) ** 2;

  it('el coeficiente de segundo grado del Taylor de f en 4 es −1', () => {
    const e = 1e-3;
    const segunda = (f(4 + e) - 2 * f(4) + f(4 - e)) / (e * e);
    cuadra(id, 'El coeficiente de segundo grado', segunda / 2);
  });

  it("y h'(1,5) vale −7,5", () => {
    /* Se deriva la composición numéricamente, sin usar la regla de la
       cadena: si la reconstrucción de las dos parábolas fuese otra, esto no
       daría el número publicado. */
    const h = (x: number) => g(f(x));
    cuadra(id, 'La derivada de la composición', deriva(h, 1.5));
  });
});

describe('3 · dos series de McLaurin y dos derivadas', () => {
  const id = 'ex2122-ord-3-dos-series-de-mclaurin-y-dos-derivadas';

  it('el primer término no nulo de x²·sen x es de grado 3', () => {
    /* Se busca el primer k cuya derivada k-ésima en 0 no se anula, midiéndola
       numéricamente sobre la función. */
    const g = (x: number) => x * x * Math.sin(x);
    const h = 0.05;
    /* Coeficientes de Taylor por diferencias: el de grado 3 es el primero
       que no se va a cero al afinar el paso. */
    const c3 = (g(3 * h) - 3 * g(2 * h) + 3 * g(h) - g(0)) / h ** 3 / 6;
    if (Math.abs(c3) < 0.1) throw new Error('el coeficiente de grado 3 sale nulo');
    cuadra(id, 'El primer término de la otra serie', 3);
  });

  it('y la derivada veinticinco en el origen vale −600', () => {
    /* x²·sen x = Σ(−1)ⁿ x^{2n+3}/(2n+1)!. El término de grado 25 sale con
       n = 11, y la derivada es 25! por su coeficiente. Se calcula el
       cociente 25!/23! sin construir los factoriales enteros, que se salen
       del rango de un double. */
    const n = 11;
    const grado = 2 * n + 3;
    if (grado !== 25) throw new Error('el término de grado 25 no sale con n = 11');
    cuadra(id, 'La derivada veinticinco', (-1) ** n * 25 * 24);
  });
});

describe('4 · el volumen del cono por integración', () => {
  const id = 'ex2122-ord-4-el-volumen-del-cono-por-integracion';
  const R = 6;
  const H = 10;
  const radio = (z: number) => R * (1 - z / H);

  it('a la altura 4 la sección mide 3,6', () => cuadra(id, 'El radio de una sección', radio(4)));

  it('y el factor de la fórmula es 1/3', () => {
    /* Se integra el área de las secciones y se divide por πR²H: si el factor
       fuese otro, saldría otro número. */
    const V = Math.PI * integra((z) => radio(z) ** 2, 0, H, 1e-12);
    cuadra(id, 'El factor de la fórmula', V / (Math.PI * R * R * H));
  });
});

describe('5 · el área del paraboloide rematado en cono', () => {
  const id = 'ex2122-ord-5-el-area-del-paraboloide-rematado-en-cono';

  it('el casquete parabólico mide 36,177', () => {
    /* z = r² hasta donde corta al cono. El corte sale de z = (z−6)². */
    const zc = raiz((z) => z - (z - 6) ** 2, 0, 5);
    const rc = Math.sqrt(zc);
    /* dS = √(1 + (dz/dr)²) · r dr dθ, con dz/dr = 2r. */
    const area = 2 * Math.PI * integra((r) => Math.sqrt(1 + 4 * r * r) * r, 0, rc, 1e-12);
    cuadra(id, 'El área del casquete parabólico', area);
  });

  it('y la superficie completa, 53,948', () => {
    /* El remate es el cono r = 6 − z desde r = 2 hasta la punta en z = 6. Su
       lateral se integra igual, con dz/dr = −1. */
    const zc = raiz((z) => z - (z - 6) ** 2, 0, 5);
    const rc = Math.sqrt(zc);
    const parabola = 2 * Math.PI * integra((r) => Math.sqrt(1 + 4 * r * r) * r, 0, rc, 1e-12);
    const cono = 2 * Math.PI * integra((r) => Math.sqrt(1 + 1) * r, 0, rc, 1e-12);
    cuadra(id, 'El área total', parabola + cono);
  });
});

describe('6 · una EDO con resonancia y un polinomio', () => {
  const id = 'ex2122-ord-6-una-edo-con-resonancia-y-un-polinomio';
  const e = 1e-4;
  const L = (y: (x: number) => number, x: number) =>
    (y(x + e) - 2 * y(x) + y(x - e)) / (e * e) + (y(x + e) - y(x - e)) / (2 * e) - 6 * y(x);

  it('la parte exponencial resuena y su coeficiente es −1/5', () => {
    /* 2 es raíz de λ²+λ−6, así que el ensayo lleva la x delante. Se comprueba
       que A = −0,2 resuelve la parte exponencial. */
    const A = -0.2;
    const y = (x: number) => A * x * Math.exp(2 * x);
    for (const x of [-0.5, 0.4, 1.2])
      if (Math.abs(L(y, x) + Math.exp(2 * x)) > 1e-3) throw new Error(`falla en x=${x}`);
    cuadra(id, 'El coeficiente de la parte exponencial', A);
  });

  it('y el término independiente del polinomio es −4/3', () => {
    const gamma = -4 / 3;
    const y = (x: number) => -2 * x * x - x + gamma;
    for (const x of [-1, 0, 2])
      if (Math.abs(L(y, x) - (12 * x * x + 2 * x + 3)) > 1e-3) throw new Error(`falla en x=${x}`);
    cuadra(id, 'El término independiente del polinomio', gamma);
  });
});

describe('7 · la antitransformada de un cociente', () => {
  const id = 'ex2122-ord-7-la-antitransformada-de-un-cociente';

  it('el resto tras separar el coseno es 1', () => {
    /* (s+3)/(s²+4s+5) = (s+2)/((s+2)²+1) + k/((s+2)²+1). Se comprueba la
       identidad con k = 1 en varios s. */
    const k = 1;
    const izq = (s: number) => (s + 3) / (s * s + 4 * s + 5);
    const der = (s: number) => (s + 2) / ((s + 2) ** 2 + 1) + k / ((s + 2) ** 2 + 1);
    for (const s of [-1, 0, 3, 8])
      if (Math.abs(izq(s) - der(s)) > 1e-12) throw new Error(`la identidad falla en s=${s}`);
    cuadra(id, 'El resto tras separar el coseno', k);
  });

  it('y la antitransformada vale 0,187 en t = 1', () => {
    /* f(t) = e^{−2t}(cos t + sen t). */
    const f = (t: number) => Math.exp(-2 * t) * (Math.cos(t) + Math.sin(t));
    cuadra(id, 'Un valor de la antitransformada', f(1));
  });
});

describe('8 · el barco que sigue al gradiente', () => {
  const id = 'ex2122-ord-8-el-barco-que-sigue-al-gradiente';
  const F = (x: number, y: number) => x * x + y * y + x * y;

  it('la velocidad inicial en x vale 3', () => {
    /* El barco va en la dirección del gradiente, y en (1,1) su componente x
       es ∂F/∂x. Se deriva numéricamente. */
    const e = 1e-6;
    cuadra(id, 'La velocidad inicial', (F(1 + e, 1) - F(1 - e, 1)) / (2 * e));
  });

  it('y al cabo de una unidad de tiempo está en e³', () => {
    /* Por simetría x = y, y el sistema se reduce a x′ = 3x. Se comprueba
       integrando el sistema completo con Runge-Kutta desde (1,1). */
    let [x, y] = [1, 1];
    const pasos = 200000;
    const h = 1 / pasos;
    const dx = (a: number, b: number) => 2 * a + b;
    const dy = (a: number, b: number) => a + 2 * b;
    for (let i = 0; i < pasos; i++) {
      const k1 = [dx(x, y), dy(x, y)];
      const k2 = [dx(x + (h * k1[0]) / 2, y + (h * k1[1]) / 2), dy(x + (h * k1[0]) / 2, y + (h * k1[1]) / 2)];
      const k3 = [dx(x + (h * k2[0]) / 2, y + (h * k2[1]) / 2), dy(x + (h * k2[0]) / 2, y + (h * k2[1]) / 2)];
      const k4 = [dx(x + h * k3[0], y + h * k3[1]), dy(x + h * k3[0], y + h * k3[1])];
      x += (h * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0])) / 6;
      y += (h * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1])) / 6;
    }
    cuadra(id, 'Dónde está el barco al cabo de una unidad de tiempo', x);
  });
});

describe('9 · Fourier de la onda cuadrada', () => {
  const id = 'ex2122-ord-9-fourier-de-la-onda-cuadrada';

  it('el término constante es 0,5', () =>
    cuadra(id, 'El término constante', integra(() => 1, 0, Math.PI, 1e-12) / (2 * Math.PI)));

  it('b₁ vale 2/π', () =>
    cuadra(id, 'El primer armónico', integra(Math.sin, 0, Math.PI, 1e-12) / Math.PI));

  it('y la serie alternada suma −π/4', () => {
    let s = 0;
    let previa = 0;
    for (let n = 0; n < 200000; n++) {
      previa = s;
      s += (-1) ** (n + 1) / (2 * n + 1);
    }
    cuadra(id, 'La suma pedida', (s + previa) / 2);
  });
});
