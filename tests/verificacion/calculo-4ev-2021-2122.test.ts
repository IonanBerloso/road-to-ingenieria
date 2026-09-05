/**
 * Las cuartas evaluaciones de Cálculo de 2020-2021 y 2021-2022. Once
 * respuestas entre las dos.
 *
 * El ejercicio 3 de 2020-2021 es el que mejor ilustra para qué sirve esto. El
 * enunciado trae una **ayuda** —«calcula el trabajo del campo (−y, x)»— y la
 * resolución la sigue: aplica Green y acaba integrando sen³t. El test hace lo
 * contrario: se da cuenta de que la curva es simétrica respecto del eje Y y de
 * que su mitad derecha es x = y√(1−y²), y mide el área como una región normal
 * y corriente. Dos caminos que no comparten ni un paso.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { deriva, integra, integraCasi, raiz } from './numerico';
import { escalar, norma, unitario } from './lineal';

const cuadra2122 = convocatoria('calculo', '2021-2022-4ev');
const cuadra2021 = convocatoria('calculo', '2020-2021-4ev');

const gradiente = (f: (x: number, y: number) => number, x: number, y: number) => [
  deriva((t) => f(t, y), x),
  deriva((t) => f(x, t), y),
];

describe('2021-2022 · 1 · el vertido en el océano', () => {
  const id = 'ex2122-4ev-1-vertido-en-el-oceano';
  const contaminacion = (A: number) => (x: number, y: number) =>
    A * Math.exp(-((x + 1) ** 2) - y * y);

  it('en la dirección v la contaminación no cambia', () => {
    /* Sale cero sea cual sea A, así que el apartado se puede contestar antes
       de conocerla — y eso es justo lo que el enunciado quiere que se vea. */
    for (const A of [1, 4, 9]) {
      const v = escalar(gradiente(contaminacion(A), 0, 1), unitario([-1, 1]));
      if (Math.abs(v) > 1e-6) throw new Error(`con A=${A} la variación no es cero`);
    }
    cuadra2122(id, 'La variación en la dirección v', escalar(gradiente(contaminacion(4), 0, 1), unitario([-1, 1])));
  });

  it('y A vale 4', () => {
    /* Se busca la A que hace que el módulo del gradiente en Q sea 16e⁻⁴, en
       vez de despejarla. */
    const objetivo = 16 * Math.exp(-4);
    cuadra2122(id, 'El valor de A', raiz((A) => norma(gradiente(contaminacion(A), 1, 0)) - objetivo, 0.1, 50));
  });
});

describe('2021-2022 · 2 · la pieza con rectángulo', () => {
  const id = 'ex2122-4ev-2-pieza-con-rectangulo';
  /* Semicírculo de radio 2 —simétrico respecto del eje Y, así que no aporta
     momento— y encima un rectángulo de x = 0 a x = 1 y altura H. */
  const areaSemicirculo = 2 * integraCasi((x) => Math.sqrt(4 - x * x), 0, 2, 1e-10, 'b');
  const centro = (H: number) => (H * 0.5) / (areaSemicirculo + H);

  it('el semicírculo mide 2π', () => cuadra2122(id, 'El área del semicírculo', areaSemicirculo));

  it('y la altura pedida es 1', () => {
    /* La condición del enunciado, resuelta buscando la raíz sobre el centro de
       gravedad calculado, no sobre la ecuación ya despejada. */
    const objetivo = 1 / (4 * Math.PI + 2);
    cuadra2122(id, 'La altura H', raiz((H) => centro(H) - objetivo, 0.05, 20));
  });
});

describe('2021-2022 · 3 · el paraboloide elíptico', () => {
  const id = 'ex2122-4ev-3-paraboloide-eliptico';
  /* y²/9 + z²/3 ≤ x, con x ≤ 3. La sección en x es una elipse de semiejes
     3√x y √(3x); su área se integra en vez de tomarla de πab. */
  const seccion = (x: number) =>
    x <= 0
      ? 0
      : 2 *
        integraCasi(
          (y) => 2 * Math.sqrt(Math.max(0, 3 * (x - (y * y) / 9))),
          0,
          3 * Math.sqrt(x),
          1e-10,
          'b',
        );

  it('el coeficiente del área es 3√3', () => cuadra2122(id, 'El área de la sección', seccion(1) / Math.PI));

  it('y el volumen es 73,46', () => cuadra2122(id, 'El volumen', integra(seccion, 0, 3, 1e-8)));
});

describe('2020-2021 · 1 · entre cilindro, esfera y paraboloide', () => {
  const id = 'ex2021-4ev-1-entre-cilindro-esfera-y-paraboloide';

  it('el sólido llega hasta ρ = 4', () =>
    cuadra2021(id, 'Hasta dónde llega el sólido', raiz((r) => 16 - r * r + Math.sqrt(Math.max(0, 16 - r * r)), 0.5, 5)));

  it('y el volumen es 313,26', () => {
    /* **Rebanando en z**, mientras que la resolución integra en cilíndricas de
       dentro hacia fuera. Cada rebanada es una corona: el agujero del cilindro
       ρ ≥ 2 siempre, y por fuera manda la esfera mientras z < 0 y el
       paraboloide cuando z > 0. */
    const corona = (z: number) =>
      Math.PI * ((z < 0 ? 16 - z * z : 16 - z) - 4);
    const abajo = integra(corona, -2 * Math.sqrt(3), 0, 1e-10);
    const arriba = integra(corona, 0, 12, 1e-10);
    cuadra2021(id, 'El volumen', abajo + arriba);
  });
});

describe('2020-2021 · 2 · región entre recta y parábola', () => {
  const id = 'ex2021-4ev-2-region-con-recta-y-parabola';
  /* **En el orden invertido**, que es lo que pide el apartado b) y lo que la
     resolución usa después: para y de 0 a 3 el borde derecho es x = y/3, y de
     3 a 4 es x = √(4−y). */
  const derecha = (y: number) => (y <= 3 ? y / 3 : Math.sqrt(4 - y));
  const area = integra(derecha, 0, 3, 1e-11) + integraCasi(derecha, 3, 4, 1e-9, 'b');
  const momento =
    integra((y) => derecha(y) ** 2 / 2, 0, 3, 1e-11) + integraCasi((y) => derecha(y) ** 2 / 2, 3, 4, 1e-9, 'b');

  it('las dos curvas se cortan en x = 1', () =>
    cuadra2021(id, 'Dónde se cortan las dos curvas', raiz((x) => 3 * x - (4 - x * x), 0.1, 5)));

  it('el área es 13/6', () => cuadra2021(id, 'El área', area));

  it('y el centro de gravedad está en 9/26', () => cuadra2021(id, 'La abscisa del centro de gravedad', momento / area));
});

describe('2020-2021 · 3 · área por integral curvilínea', () => {
  const id = 'ex2021-4ev-3-area-por-integral-curvilinea';

  it('el integrando de Green vale 2', () => {
    /* El campo del enunciado, componente a componente. */
    const componenteP = (_x: number, y: number) => -y;
    const componenteQ = (x: number, _y: number) => x;
    const dQdx = deriva((x) => componenteQ(x, 1), 1);
    const dPdy = deriva((y) => componenteP(1, y), 1);
    cuadra2021(id, 'El integrando de Green', dQdx - dPdy);
  });

  it('y el área encerrada es 2/3', () => {
    /* **Sin Green y sin la ayuda.** Para cada t y su simétrico π−t la altura
       es la misma y la abscisa cambia de signo, así que la curva es simétrica
       respecto del eje Y y su mitad derecha es x = y√(1−y²). El área es
       entonces una integral de toda la vida. Antes de usarlo se comprueba que
       la parametrización pasa de verdad por esos puntos. */
    const borde = (y: number) => y * Math.sqrt(1 - y * y);
    for (const t of [0.4, 1.1, 2.5]) {
      const [x, y] = [Math.sin(t) * Math.cos(t), Math.sin(t)];
      if (Math.abs(Math.abs(x) - borde(y)) > 1e-9) throw new Error(`la curva no cuadra en t=${t}`);
    }
    cuadra2021(id, 'El área', 2 * integraCasi(borde, 0, 1, 1e-10, 'b'));
  });
});
