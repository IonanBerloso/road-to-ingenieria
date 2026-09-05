/**
 * Las primeras evaluaciones de Cálculo de 2015-2016, 2016-2017 y 2017-2018.
 * Once respuestas entre las tres. Son las más antiguas del corpus y también
 * las más cortas: tres ejercicios cada una, y el tercero siempre la misma
 * demostración con el mismo épsilon.
 *
 * El ejercicio 1 de 2016-2017 es el único del corpus que construye un
 * triángulo **rectángulo** isósceles a partir de su hipotenusa. Hay dos
 * vértices posibles, uno a cada lado, y el enunciado pide el de mayor parte
 * imaginaria; el test construye los dos, comprueba que los dos son rectángulos
 * e isósceles, y elige.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { cEntre, cModulo, raiz, type C } from './numerico';
import { resuelve } from './lineal';

const cuadra1718 = convocatoria('calculo', '2017-2018-1ev');
const cuadra1617 = convocatoria('calculo', '2016-2017-1ev');
const cuadra1516 = convocatoria('calculo', '2015-2016-1ev');

const epsilon = (a: number, b: number) => Math.abs(a - b) / 2;

/** La circunferencia por tres puntos, igual que en la tanda de 2020-2022. */
function circunferencia(puntos: number[][]) {
  const [D, E, F] = resuelve(
    puntos.map(([x, y]) => [x, y, 1]),
    puntos.map(([x, y]) => -(x * x + y * y)),
  );
  return { centro: [-D / 2, -E / 2], radio: Math.sqrt((D * D + E * E) / 4 - F) };
}

describe('2017-2018 · 1 · la semicircunferencia', () => {
  const id = 'ex1718-1-semicircunferencia';
  /* arg((z−2)/(z−1)) = π/2: el cociente tiene que ser un imaginario puro con
     parte imaginaria positiva. */
  const cociente = (x: number, y: number): C => cEntre([x - 2, y], [x - 1, y]);
  const enElArco = (x: number) => {
    const y = raiz((t) => cociente(x, t)[0], 0.01, 5);
    if (cociente(x, y)[1] <= 0) throw new Error(`en x=${x} el argumento sale −π/2`);
    return [x, y];
  };
  const { centro, radio } = circunferencia([1.2, 1.5, 1.8].map(enElArco));

  it('el radio es 0,5', () => cuadra1718(id, 'El radio', radio));

  it('y el punto más alto es 1,5 + 0,5i', () => {
    /* El más alto de una circunferencia es el centro subido el radio, y aquí
       está en el arco porque el arco es justo la mitad de arriba. */
    const alto: [number, number] = [centro[0], centro[1] + radio];
    if (cociente(alto[0], alto[1])[1] <= 0) throw new Error('el punto más alto no está en el lugar');
    cuadra1718.complejo(id, 'El punto más alto', alto);
  });
});

describe('2017-2018 · 2 · la exponencial y la recta vertical', () => {
  const id = 'ex1718-2-exponencial-recta-vertical';
  const w: C = [-1, Math.sqrt(3)];

  it('la parte real de las soluciones es ln 2', () => {
    /* e^z = w con z = x+iy da e^x = |w| y y = arg(w) + 2kπ: la parte real es la
       misma para todas, y de ahí la recta vertical. Se busca la x que hace que
       la exponencial alcance el módulo. */
    cuadra1718(id, 'La parte real de las soluciones', raiz((x) => Math.exp(x) - cModulo(w), -5, 5));
  });

  it('y el segundo miembro está a 120 grados', () =>
    cuadra1718(id, 'El argumento del segundo miembro', ((Math.atan2(w[1], w[0]) * 180) / Math.PI + 360) % 360));
});

describe('2017-2018 · 3 · el límite no positivo', () => {
  it('el épsilon con L = 0,6 es 0,3', () => {
    const L = 0.6;
    const eps = epsilon(L, 0);
    if (!(L - eps > 0)) throw new Error('ese épsilon no llega al absurdo');
    cuadra1718('ex1718-3-limite-no-positivo', 'El épsilon de la reducción al absurdo', eps);
  });
});

describe('2016-2017 · 1 · el triángulo rectángulo isósceles', () => {
  const id = 'ex1617-1-triangulo-isosceles';
  const z1: C = [Math.sqrt(3) / 2, -0.5];
  const z2: C = [0, 1];
  const hipotenusa = Math.hypot(z2[0] - z1[0], z2[1] - z1[1]);

  it('la hipotenusa mide √3', () => cuadra1617(id, 'La hipotenusa', hipotenusa));

  it('y el tercer vértice tiene abscisa 1,183', () => {
    /* El vértice del ángulo recto está sobre la mediatriz, a media hipotenusa
       del punto medio. Hay dos, uno a cada lado; se construyen los dos, se
       comprueba que los dos son rectángulos e isósceles, y se elige el de
       mayor parte imaginaria, que es lo que pide el enunciado. */
    const medio = [(z1[0] + z2[0]) / 2, (z1[1] + z2[1]) / 2];
    const u = [(z2[0] - z1[0]) / hipotenusa, (z2[1] - z1[1]) / hipotenusa];
    const candidatos = [
      [medio[0] - (hipotenusa / 2) * u[1], medio[1] + (hipotenusa / 2) * u[0]],
      [medio[0] + (hipotenusa / 2) * u[1], medio[1] - (hipotenusa / 2) * u[0]],
    ];
    for (const z3 of candidatos) {
      const [a, b] = [
        [z1[0] - z3[0], z1[1] - z3[1]],
        [z2[0] - z3[0], z2[1] - z3[1]],
      ];
      if (Math.abs(Math.hypot(...a) - Math.hypot(...b)) > 1e-9) throw new Error('no es isósceles');
      if (Math.abs(a[0] * b[0] + a[1] * b[1]) > 1e-9) throw new Error('el ángulo no es recto');
    }
    const arriba = candidatos.reduce((p, q) => (p[1] > q[1] ? p : q));
    cuadra1617(id, 'El tercer vértice', arriba[0]);
  });
});

describe('2016-2017 · 2 · la elipse por definición', () => {
  it('el semieje menor vale √3', () => {
    /* Los focos son 1±i, así que el eje focal es vertical y el centro está en
       (1,0). El semieje menor es la mitad de la anchura horizontal, y se busca
       resolviendo la propia definición: la suma de distancias vale 4. */
    const suma = (x: number, y: number) => Math.hypot(x - 1, y - 1) + Math.hypot(x - 1, y + 1);
    const derecha = raiz((x) => suma(x, 0) - 4, 1.01, 20);
    cuadra1617('ex1617-2-elipse-por-definicion', 'El semieje menor', derecha - 1);
  });
});

describe('2016-2017 · 3 · el límite no negativo', () => {
  it('el épsilon con L = −0,5 es 0,25', () => {
    const L = -0.5;
    const eps = epsilon(L, 0);
    if (!(L + eps < 0)) throw new Error('ese épsilon no llega al absurdo');
    cuadra1617('ex1617-3-limite-no-negativo', 'El épsilon', eps);
  });
});

describe('2015-2016 · 1 · el parámetro real', () => {
  const id = 'ex1516-1-parametro-real';
  const z = (a: number): C => cEntre([2, 1], [a, -1]);

  it('z es real cuando a = −2', () => {
    /* Se busca la a que anula la parte imaginaria del cociente, sin
       racionalizarlo a mano. */
    const a = raiz((t) => z(t)[1], -10, 10);
    if (Math.abs(z(a)[0]) < 1e-9) throw new Error('además sale nulo, y no debería');
    cuadra1516(id, 'Apartado (a)', a);
  });

  it('y está en la circunferencia unidad con a = ±2', () => {
    const positivo = raiz((t) => cModulo(z(t)) - 1, 0.1, 20);
    const negativo = raiz((t) => cModulo(z(t)) - 1, -20, -0.1);
    cuadra1516.conjunto(id, 'Apartado (d)', [positivo, negativo]);
  });
});

describe('2015-2016 · 3 · verdadera o falsa', () => {
  it('el épsilon con L = −1 es 0,5', () => {
    const L = -1;
    const eps = epsilon(L, 0);
    if (!(L + eps < 0)) throw new Error('ese épsilon no llega al absurdo');
    cuadra1516('ex1516-3-verdadera-o-falsa', 'El épsilon de la reducción al absurdo', eps);
  });
});
