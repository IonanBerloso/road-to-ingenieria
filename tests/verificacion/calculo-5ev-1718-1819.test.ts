/**
 * Las quintas evaluaciones de Cálculo de 2017-2018 y 2018-2019. Trece
 * respuestas entre las dos.
 *
 * El ejercicio 2 de 2017-2018 es el caso más limpio de dato que no se puede
 * recalcular: el trabajo se pide **a lo largo de una curva de la que solo se
 * conoce el dibujo**, y lo único que el enunciado da es el área que encierra
 * con otra. Así que ahí el test no puede recorrer nada; lo que sí hace es
 * medir el rotacional en varios puntos, recorrer de verdad la parábola que sí
 * tiene ecuación, y montar el resultado con esas dos piezas.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { deriva, deriva2, integraCasi, maximiza, raiz, trabajo } from './numerico';

const cuadra1819 = convocatoria('calculo', '2018-2019-5ev');
const cuadra1718 = convocatoria('calculo', '2017-2018-5ev');

/** Runge-Kutta 4 sobre y′ = f(y), de 0 a T. */
const avanza = (f: (y: number) => number, y0: number, T: number, h = 0.01) => {
  let y = y0;
  for (let t = 0; t < T; t += h) {
    const paso = Math.min(h, T - t);
    const k1 = f(y);
    const k2 = f(y + (paso * k1) / 2);
    const k3 = f(y + (paso * k2) / 2);
    const k4 = f(y + paso * k3);
    y += (paso * (k1 + 2 * k2 + 2 * k3 + k4)) / 6;
  }
  return y;
};

describe('2018-2019 · 1 · el cuarto de disco mordido', () => {
  const id = 'ex1819-5ev-1-el-cuarto-de-disco-mordido';
  /* LECTURA DE LA FIGURA: cuarto de disco de radio 2 en el primer cuadrante,
     menos el cuadrado unidad de la esquina. */
  const techo = (x: number) => Math.sqrt(Math.max(0, 4 - x * x));
  const area = integraCasi(techo, 0, 2, 1e-10, 'b') - 1;
  const momento = integraCasi((x) => x * techo(x), 0, 2, 1e-10, 'b') - 0.5;

  it('el área vale π − 1', () => cuadra1819(id, 'El área', area));

  it('y el centro de gravedad cae en 1,0117', () => {
    /* La figura es simétrica respecto de y = x, así que las dos coordenadas
       coinciden; se comprueba calculando la otra por su lado. */
    const otro = integraCasi((y) => y * techo(y), 0, 2, 1e-10, 'b') - 0.5;
    if (Math.abs(momento - otro) > 1e-9) throw new Error('la figura no sale simétrica');
    cuadra1819(id, 'La coordenada del centro de gravedad', momento / area);
  });
});

describe('2018-2019 · 2 · la semielipse que minimiza', () => {
  const id = 'ex1819-5ev-2-la-semielipse-que-minimiza';
  const F = ([x, y]: number[]) => [3 * y * y, 16 * x];
  /* Semielipse de (−1,0) a (1,0) por arriba: x = cos t, y = b·sen t, con t de
     π a 0. El trabajo se integra a lo largo de la curva, sin desarrollar. */
  const W = (b: number) => trabajo(F, (t) => [Math.cos(t), b * Math.sin(t)], Math.PI, 0, 1e-9);

  it('el término cuadrático lleva un 4', () => {
    /* W(b) = αb² + βb, así que con dos valores se despejan los dos
       coeficientes; con un tercero se comprueba que el ajuste es cierto y que
       W no tiene término independiente. */
    const alfa = (W(2) - 2 * W(1)) / 2;
    const beta = W(1) - alfa;
    for (const b of [0.5, 3.7])
      if (Math.abs(W(b) - (alfa * b * b + beta * b)) > 1e-6) throw new Error(`el ajuste falla en b=${b}`);
    cuadra1819(id, 'El coeficiente del término cuadrático', alfa);
  });

  it('y el trabajo es mínimo en b = π', () => cuadra1819(id, 'La b que minimiza', maximiza((b) => -W(b), 0.1, 12).x));
});

describe('2018-2019 · 3 · la lineal con condición inicial', () => {
  const id = 'ex1819-5ev-3-lineal-con-condicion-inicial';

  it('el factor integrante es x⁻¹', () => {
    /* μ tiene que cumplir μ′/μ = −1/x. Con μ = x^k eso es k/x = −1/x, y el k
       se busca en vez de leerse. */
    const k = raiz((t) => deriva((x) => x ** t, 1.7) / 1.7 ** t + 1 / 1.7, -4, 4);
    cuadra1819(id, 'El factor integrante', k);
  });

  it('y la solución vale 6 en x = 2', () => {
    /* La solución se comprueba contra la ecuación y contra la condición
       inicial antes de evaluarla. */
    const y = (x: number) => x ** 3 / 2 + x;
    if (Math.abs(y(1) - 1.5) > 1e-12) throw new Error('no cumple la condición inicial');
    for (const x of [0.6, 1.4, 2.8])
      if (Math.abs(x * deriva(y, x) - y(x) - x ** 3) > 1e-5) throw new Error(`la EDO falla en x=${x}`);
    cuadra1819(id, 'La solución en un punto', y(2));
  });
});

describe('2018-2019 · 4 · el coseno que resuena y la exponencial', () => {
  const id = 'ex1819-5ev-4-coseno-que-resuena-y-exponencial';
  const residuo = (y: (x: number) => number, fuente: (x: number) => number, x: number) =>
    deriva2(y, x, 0.02) + 25 * y(x) - fuente(x);

  it('la exponencial lleva −0,14', () => {
    const C = raiz((c) => residuo((x) => c * Math.exp(5 * x), (x) => -7 * Math.exp(5 * x), 0.2), -5, 5);
    cuadra1819(id, 'El coeficiente de la exponencial', C);
  });

  it('y el término que resuena, 0,4', () => {
    /* Resuena porque cos5x ya está en la homogénea; el ensayo lleva la x
       delante y sale con A = 0, así que basta la parte en seno. */
    const yp = (B: number) => (x: number) => x * B * Math.sin(5 * x);
    const fuente = (x: number) => 4 * Math.cos(5 * x);
    const B = raiz((b) => residuo(yp(b), fuente, 0.3), -5, 5);
    for (const x of [-1.1, 0.8, 2.2])
      if (Math.abs(residuo(yp(B), fuente, x)) > 2e-3) throw new Error(`sobra algo en x=${x}`);
    cuadra1819(id, 'El coeficiente del término que resuena', B);
  });
});

describe('2017-2018 · 1 · el orden que parte en dos', () => {
  const id = 'ex1718-5ev-1-el-orden-que-parte-en-dos';

  it('el recinto se parte en x = 1', () => {
    /* Al integrar primero en y, la tapa de arriba es y = x² mientras la
       parábola vaya por debajo de la recta, y pasa a ser y = (3−x)/2 en cuanto
       la adelanta. El cambio está donde se cruzan. */
    cuadra1718(id, 'Dónde se parte', raiz((x) => x * x - (3 - x) / 2, 0.1, 3));
  });

  it('y la integral vale 4/3', () => {
    /* **En el orden original**, que es el que el enunciado manda cambiar: la
       anchura de cada franja horizontal es 3−2y menos √y. */
    cuadra1718(id, 'El valor de la integral', integraCasi((y) => 3 - 2 * y - Math.sqrt(y), 0, 1, 1e-10, 'a'));
  });
});

describe('2017-2018 · 2 · el trabajo que sale del área', () => {
  const id = 'ex1718-5ev-2-el-trabajo-que-sale-del-area';
  const V = ([x, y]: number[]) => [-3 * y, 6 * x];
  /* L₂ es la parábola y = 1−x², de A(−1,0) a B(1,0). */
  const porLaParabola = trabajo(V, (t) => [t, 1 - t * t], -1, 1, 1e-10);

  it('por la parábola el trabajo es −12', () => cuadra1718(id, 'El trabajo por la parábola', porLaParabola));

  it('y por L₁, 78', () => {
    /* De L₁ solo se conoce el dibujo, así que aquí no hay curva que recorrer.
       Lo que sí se mide es el rotacional del campo —que sale constante— y con
       el área del enunciado, 10, sale la circulación del contorno cerrado. L₁
       de A a B y L₂ de B a A recorren ese contorno en sentido positivo. */
    let rot = 0;
    for (const [x, y] of [
      [0.4, -0.3],
      [-0.8, 0.5],
      [0.1, 0.9],
    ]) {
      const c = deriva((t) => V([t, y])[1], x) - deriva((t) => V([x, t])[0], y);
      if (rot && Math.abs(c - rot) > 1e-6) throw new Error('el rotacional no es constante');
      rot = c;
    }
    cuadra1718(id, 'El trabajo por L₁', rot * 10 + porLaParabola);
  });
});

describe('2017-2018 · 3 · la barra en agua hirviendo', () => {
  const id = 'ex1718-5ev-3-la-barra-en-agua-hirviendo';
  /* Ley de Newton: T′ = k(T − 100), con T(0) = 20. La k no está en el
     enunciado; sale de que en un segundo sube 2 grados, y aquí se busca
     **integrando la ecuación**, no despejando de su solución. */
  const temperatura = (k: number) => (t: number) => avanza((T) => k * (T - 100), 20, t);
  const k = raiz((c) => temperatura(c)(1) - 22, -1, -1e-4);

  it('la razón por segundo es 0,975', () => cuadra1718(id, 'La constante, en forma de razón', Math.exp(k)));

  it('a los 90 °C se llega en 82,13 s', () =>
    cuadra1718(id, 'Los segundos hasta 90 °C', raiz((t) => temperatura(k)(t) - 90, 1, 500)));

  it('y a los 98 °C, en 145,70 s', () =>
    cuadra1718(id, 'Los segundos hasta 98 °C', raiz((t) => temperatura(k)(t) - 98, 1, 500)));
});
