/**
 * Las cuartas evaluaciones de Cálculo de 2022-2023 y 2023-2024. Diez
 * respuestas entre las dos.
 *
 * Dos de estos ejercicios se resuelven **cambiando de coordenadas**, y ahí el
 * test tiene una ventaja que conviene aprovechar: puede quedarse en las de
 * partida. El cambio de orden de 2023-2024 se comprueba integrando en el orden
 * original, y la bola de 2022-2023 —que la resolución hace en esféricas— se
 * integra aquí en cilíndricas. Si los dos sistemas dan el mismo número, el
 * cambio de variable estaba bien hecho.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { deriva, integra, integraCasi } from './numerico';
import { det, escalar, norma, unitario } from './lineal';

const cuadra2324 = convocatoria('calculo', '2023-2024-4ev');
const cuadra2223 = convocatoria('calculo', '2022-2023-4ev');

/** Las dos parciales de una función de dos variables, por diferencias. */
const gradiente = (f: (x: number, y: number) => number, x: number, y: number) => [
  deriva((t) => f(t, y), x),
  deriva((t) => f(x, t), y),
];

describe('2023-2024 · 1 · la temperatura de la habitación', () => {
  const id = 'ex2324-4ev-1-temperatura-de-la-habitacion';
  const T = (x: number, y: number) => 2 / Math.sqrt(x * x + y * y + 1);
  const P: [number, number] = [1, 2];

  it('la temperatura máxima son 2 grados', () => {
    /* El máximo está en el origen porque el denominador es mínimo ahí. En vez
       de argumentarlo, se barre la habitación y se comprueba que nada lo
       supera. */
    for (let x = -5; x <= 5; x += 0.05)
      for (let y = -5; y <= 5; y += 0.05)
        if (T(x, y) > T(0, 0) + 1e-12) throw new Error(`hay más de 2 grados en (${x}, ${y})`);
    cuadra2324(id, 'La temperatura máxima', T(0, 0));
  });

  it('y en P se puede cambiar hasta 0,3043 grados por metro', () =>
    cuadra2324(id, 'El valor máximo de cambio en P', norma(gradiente(T, ...P))));

  it('y siguiendo la recta y = x − 3 se enfría a 0,2887', () => {
    /* La recta lleva dirección (1,1). El signo negativo es lo que responde a
       la pregunta —se enfría— y por eso no se toma el valor absoluto. */
    const v = escalar(gradiente(T, ...P), unitario([1, 1]));
    if (v >= 0) throw new Error('la mosca no se estaría enfriando');
    cuadra2324(id, 'La velocidad siguiendo la recta', v);
  });
});

describe('2023-2024 · 2 · cambiar el orden y calcular', () => {
  const id = 'ex2324-4ev-2-cambiar-el-orden-y-calcular';
  const f = (x: number, y: number) => 2 * x * x * y;

  it('los dos trozos se juntan en √2', () =>
    cuadra2324(id, 'Dónde se juntan los dos trozos', Math.sqrt(2)));

  it('y la integral vale 12,068', () => {
    /* **En el orden original**, que es justo el que el ejercicio pide
       abandonar. La resolución invierte y calcula; aquí se calcula sin
       invertir, así que el número solo puede coincidir si la inversión estaba
       bien hecha. Los dos trozos llevan una raíz en el extremo, así que se
       integran apartándose de él. */
    const franja = (y: number, medio: number) => integra((x) => f(x, y), -medio, medio, 1e-11);
    const abajo = integraCasi((y) => franja(y, Math.sqrt(y)), 0, 2, 1e-9, 'a');
    const arriba = integraCasi((y) => franja(y, Math.sqrt(4 - y)), 2, 4, 1e-9, 'b');
    cuadra2324(id, 'La integral en el nuevo orden', abajo + arriba);
  });
});

describe('2023-2024 · 3 · cono elíptico planteado', () => {
  it('el jacobiano lleva un 6 delante de rho', () => {
    /* y = 3ρcosθ, z = 2ρsenθ. En vez de derivar a mano, se monta la matriz
       jacobiana por diferencias y se saca su determinante en varios puntos:
       tiene que salir 6ρ en todos. */
    const y = (r: number, t: number) => 3 * r * Math.cos(t);
    const z = (r: number, t: number) => 2 * r * Math.sin(t);
    let coeficiente = 0;
    for (const [r, t] of [
      [0.7, 0.3],
      [1.4, 2.1],
      [2.2, 5],
    ]) {
      const J = det([
        [deriva((u) => y(u, t), r), deriva((u) => y(r, u), t)],
        [deriva((u) => z(u, t), r), deriva((u) => z(r, u), t)],
      ]);
      const c = Math.abs(J) / r;
      if (coeficiente && Math.abs(c - coeficiente) > 1e-4) throw new Error('el coeficiente no es constante');
      coeficiente = c;
    }
    cuadra2324('ex2324-4ev-3-cono-eliptico-planteado', 'El jacobiano del cambio', coeficiente);
  });
});

describe('2022-2023 · 1 · qué función puede ser', () => {
  const id = 'ex2223-4ev-1-que-funcion-puede-ser';
  /* De las tres candidatas solo una cumple los dos datos, y el test la
     encuentra probándolas en vez de darla por sabida. */
  const candidatas: Array<(x: number, y: number) => number> = [
    (x, y) => 3 * x * x + y * y,
    (x, y) => 2 * x * x - y * y,
    (x, y) => 2 * x * x + y * y,
  ];
  const cumple = (f: (x: number, y: number) => number) => {
    const g = gradiente(f, 1, 1);
    return (
      Math.abs(escalar(g, [1, 0]) - 4) < 1e-5 && Math.abs(escalar(g, unitario([1, 1])) - 2 / Math.SQRT2) < 1e-5
    );
  };
  const buenas = candidatas.filter(cumple);

  it('solo la segunda cumple las dos condiciones', () => {
    if (buenas.length !== 1) throw new Error(`cumplen ${buenas.length} funciones, y debería ser una`);
  });

  it('f_x(1,1) vale 4', () => cuadra2223(id, 'La primera componente del gradiente', gradiente(buenas[0], 1, 1)[0]));

  it('y f_y(1,1) vale −2', () => cuadra2223(id, 'La segunda componente', gradiente(buenas[0], 1, 1)[1]));
});

describe('2022-2023 · 2 · el octante de la bola', () => {
  const id = 'ex2223-4ev-2-octante-de-la-bola';

  it('el integrando queda en r⁶', () => {
    /* No se cuenta el exponente: se mide. El integrando en esféricas,
       jacobiano incluido, tiene que multiplicarse por 2ⁿ al doblar r. */
    const conJacobiano = (r: number, fi: number) => (r * r) ** 2 * (r * r * Math.sin(fi));
    const n = Math.log2(conJacobiano(2, 1) / conJacobiano(1, 1));
    cuadra2223(id, 'El integrando en esféricas', Math.round(n));
  });

  it('y la masa vale 0,2244', () => {
    /* **En cilíndricas**, que no es lo que hace la resolución. Para cada radio
       ρ el sólido baja hasta la media esfera, y el integrando es un polinomio
       en z que Simpson clava. La raíz del techo mete una derivada infinita en
       ρ = 1, así que ese extremo se aparta. */
    const cuarto = Math.PI / 2; // el octante ocupa x ≥ 0, y ≥ 0
    const columna = (rho: number) => {
      const hondo = Math.sqrt(1 - rho * rho);
      return rho * integra((z) => (rho * rho + z * z) ** 2, -hondo, 0, 1e-12);
    };
    cuadra2223(id, 'La masa', cuarto * integraCasi(columna, 0, 1, 1e-9, 'b'));
  });
});

describe('2022-2023 · 3 · cono elíptico en y', () => {
  const id = 'ex2223-4ev-3-cono-eliptico-en-y';
  /* x²/4 + z²/9 ≤ y², con 0 ≤ y ≤ 1. La sección a la altura y es una elipse
     de semiejes 2y y 3y. El área se **integra**, no se toma de la fórmula:
     es justo lo que el apartado del jacobiano da por sabido. */
  /* Se integra media sección y se dobla: la raíz tiene derivada infinita en
     los DOS extremos, y `integraCasi` solo sabe apartarse de uno. */
  const area = (y: number) =>
    y === 0 ? 0 : 2 * integraCasi((x) => 6 * Math.sqrt(Math.max(0, y * y - (x * x) / 4)), 0, 2 * y, 1e-10, 'b');

  it('el jacobiano lleva un 6', () => {
    /* Si el área de la sección es 6πy², el coeficiente es 6. Se despeja de la
       integral, que es lo único que aquí no se ha supuesto. */
    cuadra2223(id, 'El jacobiano', area(1) / Math.PI);
  });

  it('y el centro de gravedad está en y = 3/4', () => {
    const masa = integra(area, 0, 1, 1e-9);
    const momento = integra((y) => y * area(y), 0, 1, 1e-9);
    cuadra2223(id, 'La coordenada del centro', momento / masa);
  });
});
