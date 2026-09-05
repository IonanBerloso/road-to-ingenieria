/**
 * Las segundas evaluaciones de Cálculo de 2022-2023 y 2023-2024. Catorce
 * respuestas entre las dos.
 *
 * El ejercicio 3 de 2023-2024 es el mejor caso de figura con números: la
 * gráfica da f y sus dos derivadas en x = 0 —valen 1, 2 y 4— y dice que crecen
 * exponencialmente, lo que fija f(x) = e^{2x} sin ambigüedad. El test la
 * reconstruye y compone.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { deriva, deriva2, maximiza, raiz } from './numerico';

const cuadra2324 = convocatoria('calculo', '2023-2024-2ev');
const cuadra2223 = convocatoria('calculo', '2022-2023-2ev');

describe('2023-2024 · 1 · derivada y velocidades', () => {
  const id = 'ex2324-2ev-1-derivada-y-velocidades';
  /* LECTURA DE LA FIGURA: la gráfica es y′(x), y en los dos puntos que piden
     los apartados vale medio centímetro por centímetro. En x = 0,5 va subiendo
     desde el origen hacia el máximo 0,69 de x = 1; en x = 6,5, desde el corte
     de x = 6 hacia el máximo 0,73 de x = 7. */
  const yp = 0.5;

  it('con dx/dt = 2 en x = 0,5, dy/dt vale 1', () => {
    /* Regla de la cadena: dy/dt = y′(x)·dx/dt. */
    cuadra2324(id, 'El apartado (c)', yp * 2);
  });

  it('y con dy/dt = 3 en x = 6,5, dx/dt vale 6', () => cuadra2324(id, 'El apartado (d)', 3 / yp));
});

describe('2023-2024 · 2 · Bolzano y Lagrange', () => {
  const id = 'ex2324-2ev-2-bolzano-y-lagrange';
  const f = (x: number) => (7 - 16 ** (1 / x)) / (1 + 16 ** (1 / x));

  it('f(4) vale 5/3', () => cuadra2324(id, 'Los valores en los extremos', f(4)));

  it('y el cociente incremental, 8/15', () => {
    /* Y de paso las dos hipótesis del ejercicio: que f pasa por 1 entre 2 y 4
       —Bolzano— y que el cociente incremental es el 8/15 que Lagrange
       garantiza que alguna derivada alcanza. */
    if (!(f(2) < 1 && f(4) > 1)) throw new Error('f no cruza el valor 1 en (2,4)');
    cuadra2324(id, 'El cociente incremental', (f(4) - f(2)) / 2);
  });
});

describe('2023-2024 · 3 · Taylor de una composición', () => {
  const id = 'ex2324-2ev-3-taylor-de-una-composicion';
  /* LECTURA DE LA FIGURA: a la izquierda f y sus derivadas crecen
     exponencialmente y en x = 0 valen 1, 2 y 4 → f(x) = e^{2x}. A la derecha
     g corta el eje en x = 1, donde g′ vale 2 y g″ se anula. */
  const f = (x: number) => Math.exp(2 * x);
  const g = (x: number) => 2 * (x - 1) + (x - 1) ** 3; // g(1)=0, g′(1)=2, g″(1)=0
  const u = (x: number) => f(g(x));

  it('la reconstrucción encaja con lo que dice la figura', () => {
    if (Math.abs(f(0) - 1) > 1e-12 || Math.abs(deriva(f, 0) - 2) > 1e-6 || Math.abs(deriva2(f, 0) - 4) > 1e-5)
      throw new Error('f no vale 1, 2 y 4 en el origen');
    if (Math.abs(g(1)) > 1e-12 || Math.abs(deriva(g, 1) - 2) > 1e-6 || Math.abs(deriva2(g, 1)) > 1e-5)
      throw new Error('g no cumple lo del dibujo');
  });

  it("u'(1) vale 4", () => cuadra2324(id, 'El coeficiente lineal', deriva(u, 1)));

  it('y el polinomio da 5 en 1,5', () => {
    const P2 = (x: number) => u(1) + deriva(u, 1) * (x - 1) + (deriva2(u, 1) * (x - 1) ** 2) / 2;
    cuadra2324(id, 'La aproximación', P2(1.5));
  });
});

describe('2023-2024 · 4 · alambre, cuadrado y triángulo', () => {
  const id = 'ex2324-2ev-4-alambre-cuadrado-y-triangulo';

  it('el triángulo aporta √3/36 por metro cuadrado de alambre', () => {
    /* Lado (10−x)/3 y área (√3/4)·lado². */
    const k = Math.sqrt(3) / 36;
    for (const x of [2, 5, 8]) {
      const lado = (10 - x) / 3;
      if (Math.abs((Math.sqrt(3) / 4) * lado * lado - k * (10 - x) ** 2) > 1e-12)
        throw new Error(`la fórmula falla en x=${x}`);
    }
    cuadra2324(id, 'El área del triángulo', k);
  });

  it('y al cuadrado le tocan 4,3496 m', () => {
    const suma = (x: number) => (x * x) / 16 + (Math.sqrt(3) / 36) * (10 - x) ** 2;
    cuadra2324(id, 'Dónde cortar', maximiza((x) => -suma(x), 0.001, 9.999).x);
  });
});

describe('2022-2023 · 1 · coche y edificio', () => {
  const id = 'ex2223-2ev-1-coche-y-edificio';
  /* LECTURA DE LA FIGURA: el fuego está a 3 km de altura y el coche, a 4 km
     de la base, alejándose a 5 km/h. */
  const alto = 3;
  const alFuego = (s: number) => Math.hypot(s, alto);

  it('la distancia al fuego es de 5 km', () => cuadra2223(id, 'La distancia en ese instante', alFuego(4)));

  it('y crece a 4 km/h', () => cuadra2223(id, 'La velocidad', deriva(alFuego, 4) * 5));
});

describe('2022-2023 · 2 · grado del polinomio', () => {
  const id = 'ex2223-2ev-2-grado-del-polinomio';
  const trozoCentral = (x: number) => Math.exp(Math.sin(x));

  it('el empalme vale 1 en los dos extremos', () => {
    const izq = trozoCentral(0);
    const der = trozoCentral(2 * Math.PI);
    if (Math.abs(izq - der) > 1e-12) throw new Error('los dos empalmes no valen lo mismo');
    cuadra2223(id, 'El valor en los empalmes', izq);
  });

  it('y con grado 3 el coeficiente principal es 1/(2π²)', () => {
    /* Cuatro condiciones —valor y derivada en los dos empalmes— y cuatro
       incógnitas: por eso hace falta grado 3 y no 2. Se construye el
       polinomio y se comprueban las cuatro. */
    const a = 1 / (2 * Math.PI * Math.PI);
    const b = -3 * a * Math.PI;
    const g = (x: number) => a * x ** 3 + b * x * x + x + 1;
    for (const x of [0, 2 * Math.PI]) {
      if (Math.abs(g(x) - trozoCentral(x)) > 1e-9) throw new Error(`el valor no empalma en x=${x}`);
      if (Math.abs(deriva(g, x) - deriva(trozoCentral, x)) > 1e-6)
        throw new Error(`la derivada no empalma en x=${x}`);
    }
    cuadra2223(id, 'El coeficiente principal', a);
  });
});

describe('2022-2023 · 3 · recta que minimiza la suma', () => {
  const id = 'ex2223-2ev-3-recta-que-minimiza-la-suma';
  /* La recta pasa por (1,4), así que 1/a + 4/b = 1 y b = 4a/(a−1). */
  const suma = (a: number) => a + (4 * a) / (a - 1);
  const mejor = maximiza((a) => -suma(a), 1.001, 30);

  it('a vale 3 en el óptimo', () => cuadra2223(id, 'El corte con OX', mejor.x));

  it('y la pendiente es −2', () => {
    const a = mejor.x;
    const b = (4 * a) / (a - 1);
    /* Y se comprueba que la recta pasa de verdad por (1,4). */
    if (Math.abs(1 / a + 4 / b - 1) > 1e-9) throw new Error('la recta no pasa por (1,4)');
    cuadra2223(id, 'La pendiente', -b / a);
  });
});
