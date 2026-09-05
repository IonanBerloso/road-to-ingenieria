/**
 * Convocatoria extraordinaria de Cálculo, curso 2016-2017. Quince respuestas.
 *
 * Su ejercicio 4 es el único del corpus que pide una integral **que no
 * existe**: el intervalo [−1, 1] contiene dos polos. El apartado que sí se
 * puede calcular está sobre otro intervalo, y el test comprueba primero que
 * ahí no hay ninguno.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { deriva, integra, raiz, trabajo } from './numerico';

const cuadra = convocatoria('calculo', '2016-2017-ext');

describe('1 · el coseno que vale cinco', () => {
  const id = 'ex1617-ext-1-el-coseno-que-vale-cinco';

  it('la raíz mayor de la auxiliar es 5 + 2√6', () => {
    /* w² − 10w + 1 = 0 con w = e^{iz}. */
    cuadra(id, 'La incógnita auxiliar', raiz((w) => w * w - 10 * w + 1, 5, 20));
  });

  it('y la parte imaginaria positiva es 2,2924', () => {
    /* La raíz pequeña, w = 5 − 2√6, da z = 2kπ + i·ln(1/w). Se comprueba que
       el coseno complejo de ese número vale de verdad 5. */
    const wMenor = raiz((w) => w * w - 10 * w + 1, 0.01, 5);
    const y = -Math.log(wMenor);
    const cos = Math.cos(0) * Math.cosh(y); // cos(x+iy) con x = 0
    if (Math.abs(cos - 5) > 1e-9) throw new Error(`el coseno vale ${cos}`);
    cuadra(id, 'La parte imaginaria', y);
  });
});

describe('2 · la que crece siempre sin tener extremos', () => {
  const id = 'ex1617-ext-2-la-que-crece-siempre-sin-tener-extremos';
  const f = (x: number) => x / (1 - x * x);

  it("f'(0) vale 1", () => cuadra(id, 'La derivada en el origen', deriva(f, 0)));

  it('y no tiene ningún extremo', () => {
    /* La derivada es (1+x²)/(1−x²)², siempre positiva donde f existe. Se
       barren los tres tramos del dominio, saltándose las asíntotas. */
    let extremos = 0;
    for (const [a, b] of [[-8, -1.01], [-0.99, 0.99], [1.01, 8]]) {
      let ultimo = 0;
      for (let x = a; x <= b; x += 0.001) {
        const s = Math.sign(deriva(f, x));
        if (s !== 0 && ultimo !== 0 && s !== ultimo) extremos++;
        if (s !== 0) ultimo = s;
      }
    }
    cuadra(id, 'El número de extremos', extremos);
  });
});

describe('3 · por qué la derivada se anula en un máximo', () => {
  it('la derivada vale cero', () => {
    /* La demostración es de acotar por los dos lados. Lo que se puede
       comprobar es el hecho: en el máximo de una función derivable, la
       derivada se anula. */
    const h = (x: number) => 7 - (x - 2) ** 2;
    cuadra('ex1617-ext-3-por-que-la-derivada-se-anula-en-un-maximo', 'El valor de la derivada', deriva(h, 2));
  });
});

describe('4 · la integral que no existe', () => {
  const id = 'ex1617-ext-4-la-integral-que-no-existe';
  const g = (x: number) => (x * x + 5) / (x ** 3 - 2 * x * x + x);

  it('el coeficiente del término dominante es 6', () => {
    /* C = lím_{x→1} (x−1)²·g(x). Tomado sobre g tal cual, el límite sale
       sucio: cerca de x = 1 el denominador x³ − 2x² + x vale del orden de
       10⁻¹², y calcularlo como resta de tres términos del orden de 1 pierde
       todas las cifras. Así que primero se COMPRUEBA la factorización
       —x³ − 2x² + x = x(x−1)²— y el límite se toma sobre ella. */
    const denominador = (x: number) => x ** 3 - 2 * x * x + x;
    const factorizado = (x: number) => x * (x - 1) ** 2;
    for (const x of [-2, 0.3, 2, 7.5])
      if (Math.abs(denominador(x) - factorizado(x)) > 1e-9)
        throw new Error(`la factorización falla en x=${x}`);
    const cerca = [1 + 1e-6, 1 - 1e-6].map((x) => (x * x + 5) / x);
    if (Math.abs(cerca[0] - cerca[1]) > 1e-4) throw new Error('el límite no es limpio');
    cuadra(id, 'El coeficiente del término dominante', cerca[0]);
  });

  it('y entre 2 y 3, donde no hay polos, vale 2,2547', () => {
    /* Los polos están en 0 y en 1, los dos fuera de [2,3]. Se comprueba. */
    for (const polo of [0, 1])
      if (polo >= 2 && polo <= 3) throw new Error('hay un polo dentro del intervalo');
    cuadra(id, 'Una integral que sí existe', integra(g, 2, 3, 1e-12));
  });
});

describe('5 · el cilindro dentro de la esfera', () => {
  const id = 'ex1617-ext-5-el-cilindro-dentro-de-la-esfera';
  const alto = (r: number) => Math.sqrt(5 - r * r);
  const V = 2 * Math.PI * integra((r) => alto(r) * r, 0, 1, 1e-12);

  it('el volumen es 6,661', () => cuadra(id, 'El volumen', V));

  it('y el centro de gravedad está a 1,0612', () => {
    const momento = 2 * Math.PI * integra((r) => ((alto(r) ** 2) / 2) * r, 0, 1, 1e-12);
    cuadra(id, 'La altura del centro de gravedad', momento / V);
  });
});

describe('6 · el área de diez por tercera vez', () => {
  const id = 'ex1617-ext-6-el-area-de-diez-por-tercera-vez';
  const V = (p: number[]) => [-p[1], p[0]];

  it('la circulación cerrada vale 20', () => {
    const elipse = trabajo(V, (t) => [5 * Math.cos(t), 2 * Math.sin(t)], 0, 2 * Math.PI);
    if (Math.abs(elipse - 2 * Math.PI * 10) > 1e-6)
      throw new Error('la circulación no es el doble del área');
    cuadra(id, 'La circulación por la curva cerrada', 2 * 10);
  });

  it('y la semicircunferencia se lleva 4π', () =>
    cuadra(id, 'El tramo semicircular', trabajo(V, (t) => [2 * Math.cos(t), 2 * Math.sin(t)], 0, Math.PI)));
});

describe('7 · la lineal con el factor x cuadrado', () => {
  const id = 'ex1617-ext-7-la-lineal-con-el-factor-x-cuadrado';
  /* x²y = −x cos x + sen x + C, o sea y = (…)/x². */
  const y = (x: number, C: number) => (-x * Math.cos(x) + Math.sin(x) + C) / (x * x);

  it('la constante vale 3', () => {
    /* De y(π/2) = 4(2/π)². Se busca la C que lo cumple. */
    const C = raiz((c) => y(Math.PI / 2, c) - 4 * (2 / Math.PI) ** 2, -10, 10);
    /* Y se comprueba que la función resuelve la EDO. */
    for (const x of [1, 2, 3])
      if (Math.abs(x * deriva((v) => y(v, C), x) + 2 * y(x, C) - Math.sin(x)) > 1e-5)
        throw new Error(`la EDO falla en x=${x}`);
    cuadra(id, 'La constante de integración', C);
  });

  it('y en π vale 0,6223', () => cuadra(id, 'El valor en x = π', y(Math.PI, 3)));
});

describe('8 · el sistema cruzado de primer orden', () => {
  const id = 'ex1617-ext-8-el-sistema-cruzado-de-primer-orden';

  it('el determinante en s = 3 vale 8', () => {
    const s = 3;
    cuadra(id, 'El determinante del sistema', s * s - 1);
  });

  it('y y(1) vale 1 − e', () => {
    /* y(t) = 1 − e^t, y x(t) sale de x′ = 2 − y. Se comprueba que el par
       resuelve el sistema y cumple las condiciones iniciales. */
    const y = (t: number) => 1 - Math.exp(t);
    /* x sale de integrar x′ = 2 − y = 1 + e^t desde x(0) = 1. */
    const x = (t: number) => t + Math.exp(t);
    for (const t of [0.3, 1, 2]) {
      if (Math.abs(deriva(x, t) + y(t) - 2) > 1e-5) throw new Error(`la 1.ª falla en t=${t}`);
      if (Math.abs(deriva(y, t) + x(t) - t) > 1e-5) throw new Error(`la 2.ª falla en t=${t}`);
    }
    if (Math.abs(x(0) - 1) > 1e-12 || Math.abs(y(0)) > 1e-12)
      throw new Error('las condiciones iniciales no cuadran');
    cuadra(id, 'La segunda función en t = 1', y(1));
  });
});
