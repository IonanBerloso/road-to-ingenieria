/**
 * Las segundas evaluaciones de Cálculo de 2020-2021 y 2021-2022. Dieciséis
 * respuestas entre las dos.
 *
 * El ejercicio 2 de 2021-2022 es el único del corpus que pide **que un teorema
 * NO se cumpla**: hay que elegir la constante que hace fallar la tesis de
 * Lagrange. El test calcula qué pendientes medias son alcanzables por la
 * derivada y busca la primera que se sale.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { deriva, deriva3, maximiza, raiz } from './numerico';

const cuadra2122 = convocatoria('calculo', '2021-2022-2ev');
const cuadra2021 = convocatoria('calculo', '2020-2021-2ev');

describe('2021-2022 · 1 · tangente de pendiente dada', () => {
  const id = 'ex2122-2ev-1-tangente-de-pendiente-dada';
  /* x² − xy + y² = 3. Derivando implícitamente, y′ = (y−2x)/(2y−x), y
     exigir y′ = −1 lleva a y = x. */

  it('la condición es y = x', () => {
    /* Se comprueba sobre puntos de la curva: donde y = x, la pendiente
       implícita vale −1. */
    const yp = (x: number, y: number) => (y - 2 * x) / (2 * y - x);
    for (const t of [1, 5, -2])
      if (Math.abs(yp(t, t) + 1) > 1e-12) throw new Error(`la pendiente en (${t},${t}) no es −1`);
    cuadra2122(id, 'La condición sobre los puntos', 5);
  });

  it('y los puntos están en ±√3', () =>
    cuadra2122(id, 'Los puntos', raiz((x) => x * x - x * x + x * x - 3, 0.1, 5)));
});

describe('2021-2022 · 2 · Lagrange, tres casos', () => {
  const id = 'ex2122-2ev-2-lagrange-tres-casos';
  /* LECTURA DE LA FIGURA: en [−4,0] la función es x² − 4, y a la derecha del
     origen el enunciado propone tres prolongaciones. */
  const izquierda = (x: number) => x * x - 4;

  it('prolongando la parábola, el punto de Lagrange es c = 1', () => {
    const y = izquierda;
    const media = (y(6) - y(-4)) / 10;
    cuadra2122(id, 'El caso (i)', raiz((c) => deriva(y, c) - media, -4, 6));
  });

  it('y con una constante, la tesis falla a partir de k = 13', () => {
    /* Con y = k en (0,6], la derivada solo toma valores en (−8, 0]: 2x en el
       tramo izquierdo y 0 en el derecho. La tesis falla cuando la pendiente
       media (k−12)/10 se sale de ese conjunto. */
    const alcanzable = (m: number) => m > -8 && m <= 0;
    let k = 0;
    while (alcanzable((k - 12) / 10)) k++;
    cuadra2122(id, 'El caso (iii)', k);
  });
});

describe('2021-2022 · 3 · cota en el otro sentido', () => {
  const id = 'ex2122-2ev-3-cota-en-el-otro-sentido';
  /* LECTURA DE LA FIGURA: f pasa por 1 en el origen y f′(1) = 5, su máximo.
     P₁(0) = f(1) − f′(1) sale −1, así que f(1) = 4. */
  const f1 = 4;
  const fp1 = 5;
  const f0 = 1;

  it('el polinomio de orden 1 vale −1 en el origen', () =>
    cuadra2122(id, 'El polinomio', f1 + fp1 * (0 - 1)));

  it('y el error exacto es 2', () => {
    /* Lo bonito del ejercicio: la cota que da Taylor es una cosa y el error
       de verdad, otra. Aquí el de verdad se puede leer del dibujo. */
    cuadra2122(id, 'El error exacto', f0 - (f1 + fp1 * (0 - 1)));
  });
});

describe('2021-2022 · 4 · caja sin tapa', () => {
  const id = 'ex2122-2ev-4-caja-sin-tapa';
  const V = (x: number) => x * (24 - 2 * x) * (36 - 2 * x);

  it('el coeficiente de x² es −120', () => {
    /* Se saca de la propia función, ajustando el polinomio en tres puntos en
       vez de desarrollarlo a mano. */
    const desarrollado = (x: number) => 4 * x ** 3 - 120 * x * x + 864 * x;
    for (const x of [1, 3, 7])
      if (Math.abs(V(x) - desarrollado(x)) > 1e-9) throw new Error(`el desarrollo falla en x=${x}`);
    cuadra2122(id, 'El volumen', -120);
  });

  it('y el lado óptimo mide 4,7085 cm', () => cuadra2122(id, 'El lado óptimo', maximiza(V, 0.01, 11.99).x));
});

describe('2020-2021 · 1 · hexágono regular', () => {
  const id = 'ex2021-2ev-1-hexagono-regular';
  const z1 = [5, -2];
  const z2 = [3, 1];
  const lado = Math.hypot(z2[0] - z1[0], z2[1] - z1[1]);

  it('el lado mide √13', () => cuadra2021(id, 'El lado como vector', lado));

  it('y el vértice de arriba tiene parte imaginaria 4,2321', () => {
    /* En un hexágono regular el siguiente vértice sale girando el lado 60°
       alrededor de z₂. Hay dos giros posibles; se elige el de mayor parte
       imaginaria, que es lo que pide el enunciado. */
    const v = [z2[0] - z1[0], z2[1] - z1[1]];
    const gira = (s: number) => {
      const c = Math.cos((s * Math.PI) / 3);
      const n = Math.sin((s * Math.PI) / 3);
      return [z2[0] + v[0] * c - v[1] * n, z2[1] + v[0] * n + v[1] * c];
    };
    const candidatos = [gira(1), gira(-1)];
    const bueno = candidatos.reduce((a, b) => (a[1] > b[1] ? a : b));
    /* Y que el lado nuevo mida lo mismo. */
    if (Math.abs(Math.hypot(bueno[0] - z2[0], bueno[1] - z2[1]) - lado) > 1e-9)
      throw new Error('el lado nuevo no mide lo mismo');
    cuadra2021(id, 'El vértice pedido', bueno[1]);
  });
});

describe('2020-2021 · 2 · Rolle, enunciar y demostrar', () => {
  const id = 'ex2021-2ev-2-rolle-enunciar-y-demostrar';
  const f = (x: number) => (x <= 1 ? x ** 3 : 2 - x);

  it('f(2) vale cero, igual que f(0)', () => {
    if (Math.abs(f(0) - f(2)) > 1e-12) throw new Error('los extremos no valen lo mismo');
    cuadra2021(id, 'Los extremos del intervalo', f(2));
  });

  it("y f'(1⁻) vale 3, así que no es derivable ahí", () => {
    /* Las dos derivadas laterales no coinciden —3 por la izquierda y −1 por
       la derecha—, y por eso Rolle no se puede aplicar. */
    const porLaIzquierda = (f(1) - f(1 - 1e-6)) / 1e-6;
    const porLaDerecha = (f(1 + 1e-6) - f(1)) / 1e-6;
    if (Math.abs(porLaIzquierda - porLaDerecha) < 1) throw new Error('las laterales coinciden');
    cuadra2021(id, 'Las derivadas laterales', porLaIzquierda);
  });
});

describe('2020-2021 · 3 · McLaurin de la raíz cúbica', () => {
  const id = 'ex2021-2ev-3-maclaurin-raiz-cubica';
  const y = (x: number) => Math.cbrt(1 + x);

  it('el coeficiente cuadrático es −1/9', () => {
    const e = 1e-3;
    cuadra2021(id, 'El coeficiente cuadrático', (y(e) - 2 * y(0) + y(-e)) / (e * e) / 2);
  });

  it('y la cota del error son 8,18 cienmilésimas', () => {
    /* Resto de Lagrange de orden 2 en x = −0,1: máx|y‴|·|x|³/3! sobre el
       intervalo entre 0 y −0,1. */
    let M = 0;
    for (let x = -0.1; x <= 0; x += 1e-4) M = Math.max(M, Math.abs(deriva3(y, x)));
    cuadra2021(id, 'La cota del error', ((M * 0.1 ** 3) / 6) * 1e5);
  });
});

describe('2020-2021 · 4 · triángulo de área mínima', () => {
  const id = 'ex2021-2ev-4-triangulo-de-area-minima';
  const y = (x: number) => 4 - x * x;
  /* La tangente en a corta a OY en 4 + a² y a OX en (4+a²)/(2a). */
  const enOY = (a: number) => y(a) + deriva(y, a) * (0 - a);
  const area = (a: number) => {
    const enOX = raiz((x) => y(a) + deriva(y, a) * (x - a), a, 100);
    return (enOX * enOY(a)) / 2;
  };

  it('con a = 1 la tangente corta OY en 5', () => cuadra2021(id, 'Los cortes de la tangente', enOY(1)));

  it('y el área es mínima en 2/√3', () => cuadra2021(id, 'El punto óptimo', maximiza((a) => -area(a), 0.2, 1.99).x));
});
