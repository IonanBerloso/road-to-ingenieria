/**
 * Convocatoria extraordinaria de Cálculo, curso 2015-2016. Trece respuestas.
 *
 * Su ejercicio 4 es el contraejemplo de Green del corpus: el rotacional del
 * campo es **cero en todos los puntos donde está definido** y la circulación
 * sobre la circunferencia vale 2π. El test comprueba las dos cosas, que es lo
 * que hace visible que el teorema no se puede aplicar con un agujero dentro.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { cEntre, integra, trabajo, type C } from './numerico';

const cuadra = convocatoria('calculo', '2015-2016-ext');

describe('1 · el logaritmo que sale real', () => {
  const id = 'ex1516-ext-1-el-logaritmo-que-sale-real';

  it('el cociente de dentro vale i', () => {
    const q = cEntre([1, 1], [1, -1]);
    cuadra.complejo(id, 'El cociente de dentro', q);
  });

  it('y z vale π', () => {
    /* ln principal de i es iπ/2, y (2/i)·(iπ/2) = π. La división por i se
       hace con la aritmética compleja, no de cabeza. */
    const q = cEntre([1, 1], [1, -1]);
    const ln: C = [Math.log(Math.hypot(...q)), Math.atan2(q[1], q[0])];
    const z = cEntre([2, 0], [0, 1]); // 2/i
    const producto: C = [z[0] * ln[0] - z[1] * ln[1], z[0] * ln[1] + z[1] * ln[0]];
    if (Math.abs(producto[1]) > 1e-9) throw new Error('el resultado no es real');
    cuadra(id, 'El valor principal', producto[0]);
  });
});

describe('2 · la función valor medio', () => {
  const id = 'ex1516-ext-2-la-funcion-valor-medio';
  /* LECTURA DE LA FIGURA: y vale 0 en 1, sube recto hasta 1 en 2, y de 2 a 3
     se queda plana en 1. */
  const y = (x: number) => (x <= 2 ? x - 1 : 1);
  const media = (a: number, b: number) => integra(y, a, b, 1e-12) / (b - a);

  it('la quebrada pasa por los tres puntos del dibujo', () => {
    for (const [x, v] of [[1, 0], [2, 1], [3, 1]] as [number, number][])
      if (Math.abs(y(x) - v) > 1e-12) throw new Error(`y(${x}) no vale ${v}`);
  });

  it('el promedio hasta x = 2 es 0,5', () => cuadra(id, 'El promedio hasta x = 2', media(1, 2)));

  it('y en [1, 3/2] vale 0,25', () => cuadra(id, 'El apartado c)', media(1, 1.5)));
});

describe('3 · enunciar y demostrar Lagrange', () => {
  it('la pendiente de la cuerda vale 2', () => {
    const f = (x: number) => x ** 3 - 2 * x + 1;
    cuadra('ex1516-ext-3-enunciar-y-demostrar-lagrange', 'La pendiente que hay que igualar', (f(2) - f(0)) / 2);
  });
});

describe('4 · el agujero que rompe Green', () => {
  const id = 'ex1516-ext-4-el-agujero-que-rompe-green';
  const V = (p: number[]) => {
    const d = p[0] * p[0] + p[1] * p[1];
    return [-p[1] / d, p[0] / d];
  };

  it('parametrizando, la circulación vale 2π', () =>
    cuadra(
      id,
      'El valor por parametrización',
      trabajo(V, (t) => [3 * Math.cos(t), 3 * Math.sin(t)], 0, 2 * Math.PI),
    ));

  it('y el rotacional es cero en todas partes, que es la trampa', () => {
    /* Q_x − P_y se anula en cualquier punto que no sea el origen. Se
       comprueba en varios, incluido el que pide el enunciado: si Green fuese
       aplicable, la integral tendría que dar cero, y da 2π. */
    const e = 1e-6;
    const rot = (x: number, y: number) =>
      (V([x + e, y])[1] - V([x - e, y])[1]) / (2 * e) -
      (V([x, y + e])[0] - V([x, y - e])[0]) / (2 * e);
    for (const [x, y] of [[1, 2], [-3, 0.5], [0.2, -1.7]] as [number, number][])
      if (Math.abs(rot(x, y)) > 1e-6) throw new Error(`el rotacional no es cero en (${x}, ${y})`);
    cuadra(id, 'El rotacional', rot(1, 2));
  });
});

describe('5 · el factor integrante exponencial', () => {
  const id = 'ex1516-ext-5-el-factor-integrante-exponencial';
  const M = (x: number, y: number) => 2 * x * y + x * x * y + y ** 3 / 3;
  const N = (x: number, y: number) => x * x + y * y;

  it('M_y vale 7 en (1,2), y sin el factor la EDO no es exacta', () => {
    const e = 1e-6;
    const My = (M(1, 2 + e) - M(1, 2 - e)) / (2 * e);
    const Nx = (N(1 + e, 2) - N(1 - e, 2)) / (2 * e);
    if (Math.abs(My - Nx) < 1e-3) throw new Error('sin el factor ya sería exacta');
    cuadra(id, 'La derivada cruzada, sin factor', My);
  });

  it('y con el factor, la curva por (0,3) tiene constante 9', () => {
    /* Con e^x delante sí es exacta, y su potencial es e^x(x²y + y³/3). Se
       comprueba que el gradiente del potencial es el campo multiplicado. */
    const F = (x: number, y: number) => Math.exp(x) * (x * x * y + y ** 3 / 3);
    const e = 1e-6;
    for (const [x, y] of [[0, 3], [1, 2], [-0.5, 1]] as [number, number][]) {
      const Fx = (F(x + e, y) - F(x - e, y)) / (2 * e);
      const Fy = (F(x, y + e) - F(x, y - e)) / (2 * e);
      if (Math.abs(Fx - Math.exp(x) * M(x, y)) > 1e-4 || Math.abs(Fy - Math.exp(x) * N(x, y)) > 1e-4)
        throw new Error(`el potencial no encaja en (${x}, ${y})`);
    }
    cuadra(id, 'La constante de la solución', F(0, 3));
  });
});

describe('6 · la ecuación integral por convolución', () => {
  const id = 'ex1516-ext-6-la-ecuacion-integral-por-convolucion';

  it('la transformada del núcleo vale 0,2 en s = 2', () =>
    cuadra(id, 'La transformada del núcleo', 1 / (2 * 2 + 1)));

  it('y y(3) vale 7,5', () => {
    /* y(t) = t + t³/6. Se sustituye en la ecuación original con la
       convolución calculada de verdad. */
    const y = (t: number) => t + t ** 3 / 6;
    for (const t of [1, 2, 3]) {
      const conv = integra((u) => Math.sin(t - u) * y(u), 0, t, 1e-12);
      if (Math.abs(y(t) - (t + conv)) > 1e-8) throw new Error(`la ecuación falla en t=${t}`);
    }
    cuadra(id, 'El valor de la solución', y(3));
  });
});

describe('7 · el semicírculo y los dos órdenes', () => {
  const id = 'ex1516-ext-7-el-semicirculo-y-los-dos-ordenes';
  /* ∫∫(x²+y²) sobre el semidisco superior de radio a. En polares, ∫∫r²·r. */
  const valor = (a: number) => Math.PI * integra((r) => r ** 3, 0, a, 1e-12);

  it('el coeficiente es π/4', () => cuadra(id, 'El coeficiente del resultado', valor(1)));

  it('y con a = 2 vale 4π', () => cuadra(id, 'El valor con a = 2', valor(2)));
});
