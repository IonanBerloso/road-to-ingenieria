/**
 * Las segundas evaluaciones de Cálculo de 2024-2025 y 2025-2026. Dieciséis
 * respuestas entre las dos.
 *
 * Las segundas evaluaciones van de derivadas: composición, implícitas,
 * inversas y optimización. Dos de sus ejercicios se apoyan en gráficas que
 * **no dan ningún número**, solo la forma; ahí se construye una función que
 * tenga esa forma y se cuenta sobre ella.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { deriva, deriva2, maximiza, raiz } from './numerico';

const cuadra2526 = convocatoria('calculo', '2025-2026-2ev');
const cuadra2425 = convocatoria('calculo', '2024-2025-2ev');

describe('2025-2026 · 1 · composición de dos gráficas', () => {
  const id = 'ex2526-2ev-1-composicion-de-dos-graficas';
  /* LECTURA DE LA FIGURA: x(t) baja de b a a aplanándose al pasar por q en
     t = p; h(x) sube de r a s aplanándose al pasar por u en x = q. Las dos
     tienen un solo punto de tangente horizontal, y es el MISMO punto de la
     composición. Con p = 0 y q = 0, valen x(t) = −t³ y h(x) = x³. */
  const x = (t: number) => -(t ** 3);
  const h = (u: number) => u ** 3;
  const f = (t: number) => h(x(t));

  it('f no tiene ningún extremo local', () => {
    /* f′ = h′(x)·x′ es siempre ≤ 0 y solo se anula en p: la composición de
       una que baja con una que sube baja siempre. */
    let extremos = 0;
    let ultimo = 0;
    for (let t = -1; t <= 1; t += 0.001) {
      const s = Math.sign(deriva(f, t));
      if (s !== 0 && ultimo !== 0 && s !== ultimo) extremos++;
      if (s !== 0) ultimo = s;
    }
    cuadra2526(id, 'El signo de la derivada', extremos);
  });

  it('y f″(p) vale cero, porque los dos factores se anulan a la vez', () => {
    if (Math.abs(deriva(x, 0)) > 1e-6) throw new Error('x′(p) no es cero');
    if (Math.abs(deriva(h, 0)) > 1e-6) throw new Error('h′(q) no es cero');
    cuadra2526(id, 'El coeficiente cuadrático', deriva2(f, 0));
  });
});

describe('2025-2026 · 2 · béisbol', () => {
  const id = 'ex2526-2ev-2-beisbol';
  /* Home en el origen, primera en (90,0), segunda en (90,90), tercera en
     (0,90). El corredor va de segunda a tercera, y está a 20 pies de esta. */
  const posicion = (s: number) => [s, 90]; // s = distancia a tercera
  const aHome = (s: number) => Math.hypot(...(posicion(s) as [number, number]));

  it('está a 92,195 pies del plato', () => cuadra2526(id, 'La distancia en ese instante', aHome(20)));

  it('y se acerca a 6,508 pies por segundo', () => {
    /* La distancia a tercera baja a 30 pies/s, así que ds/dt = −30 y la
       derivada de aHome respecto del tiempo es su derivada por esa
       velocidad. */
    cuadra2526(id, 'La velocidad', deriva(aHome, 20) * -30);
  });
});

describe('2025-2026 · 3 · derivadas de la inversa', () => {
  const id = 'ex2526-2ev-3-derivadas-de-la-inversa';

  it("(arcsen)''(0) vale cero", () => cuadra2526(id, 'La derivada segunda del arcoseno', deriva2(Math.asin, 0)));

  it('y el primer término que falta es el de grado 3', () => {
    /* arcsen x = x + x³/6 + …: se comprueba que el error de aproximar por x
       se comporta como x³ y no como x². */
    const error = (x: number) => Math.asin(x) - x;
    const razon = (x: number) => error(x) / x ** 3;
    const valores = [0.05, 0.02, 0.01].map(razon);
    if (Math.abs(valores[2] - valores[1]) > 1e-3) throw new Error('el error no va como x³');
    cuadra2526(id, 'Por qué la aproximación es tan buena', 3);
  });
});

describe('2025-2026 · 4 · triángulo bajo la exponencial', () => {
  const id = 'ex2526-2ev-4-triangulo-bajo-la-exponencial';
  const f = (x: number) => Math.exp(-x);
  /* La tangente en (a, e^{−a}) corta a OX donde la recta se anula. */
  const corteX = (a: number) => raiz((x) => f(a) + deriva(f, a) * (x - a), a, a + 20);
  const area = (a: number) => {
    const base = corteX(a);
    const alto = f(a) + deriva(f, a) * (0 - a); // el corte con OY
    return (base * alto) / 2;
  };

  it('con a = 2 la tangente corta al eje en x = 3', () => cuadra2526(id, 'Los cortes de la tangente', corteX(2)));

  it('y el área es máxima en a = 1', () => cuadra2526(id, 'El punto óptimo', maximiza(area, 0.05, 8).x));
});

describe('2024-2025 · 1 · gráfica de la derivada', () => {
  const id = 'ex2425-2ev-1-grafica-de-la-derivada';
  /* LECTURA DE LA FIGURA: h′ entra positiva, corta al eje, baja a un mínimo,
     vuelve a cortar, sube a un máximo y corta por tercera vez. Una función
     con esa forma es −(x−1)(x−2)(x−3) en (0,5, 3,5). */
  const hp = (x: number) => -(x - 1) * (x - 2) * (x - 3);
  const [a, b] = [0.5, 3.5];
  const cambios = (g: (x: number) => number) => {
    let n = 0;
    let ultimo = 0;
    for (let x = a; x <= b; x += 0.0005) {
      const s = Math.sign(g(x));
      if (s !== 0 && ultimo !== 0 && s !== ultimo) n++;
      if (s !== 0) ultimo = s;
    }
    return n;
  };

  it('h tiene dos puntos de inflexión', () => {
    /* Las inflexiones de h son los extremos de h′, o sea los ceros de h″. */
    cuadra2425(id, 'Los puntos de inflexión', cambios((x) => deriva(hp, x)));
  });

  it('y f = (h′)^{2n} tiene cinco extremos', () => {
    /* f′ = 2n(h′)^{2n−1}h″, que se anula donde h′ = 0 —tres veces— y donde
       h″ = 0 —dos—. La paridad del exponente hace que todos sean extremos. */
    const n = 3;
    const f = (x: number) => hp(x) ** (2 * n);
    cuadra2425(id, 'Los extremos de f', cambios((x) => deriva(f, x)));
  });
});

describe('2024-2025 · 2 · Taylor implícito', () => {
  const id = 'ex2425-2ev-2-taylor-implicito';
  /* y = y³ + xy + 1 define y(x) cerca de P(−1,1). Para cada x se despeja la
     y que está cerca de 1 y se deriva esa función. */
  /* El intervalo empieza en 0,8 y no antes: con x = −1 la ecuación es
     (v−1)(v²+v−1) = 0, y su otra raíz cae en 0,618. Un intervalo que
     abarcara las dos no tendría cambio de signo y el buscador lo diría. */
  const y = (x: number) => raiz((v) => v ** 3 + x * v + 1 - v, 0.8, 1.6);

  it('la curva pasa por (−1,1)', () => {
    if (Math.abs(y(-1) - 1) > 1e-9) throw new Error('el punto no está en la curva');
  });

  it("y'(−1) vale −1", () => cuadra2425(id, 'La derivada primera', deriva(y, -1, 1e-4)));

  it("y y''(−1) vale −4", () => cuadra2425(id, 'La derivada segunda', deriva2(y, -1, 0.02)));
});

describe('2024-2025 · 3 · reconstruir la cúbica', () => {
  const id = 'ex2425-2ev-3-reconstruir-la-cubica';
  /* Inflexión en 0 → b = 0. Tangente en x = 1 igual a 2x − 1 → f(1) = 1 y
     f′(1) = 2. Y la cota del resto de McLaurin de orden 2 en x = 1 es
     |f‴|/3! = 6a/6 = a, que vale 1/2. */
  const a = 0.5;
  const b = 0;
  const c = 2 - 3 * a;
  const d = 1 - a - b - c;
  const f = (x: number) => a * x ** 3 + b * x * x + c * x + d;

  it('el coeficiente cúbico es 1/2', () => {
    /* Se comprueban las tres condiciones sobre la función construida. */
    if (Math.abs(deriva2(f, 0)) > 1e-6) throw new Error('no hay inflexión en 0');
    if (Math.abs(f(1) - 1) > 1e-12 || Math.abs(deriva(f, 1) - 2) > 1e-6)
      throw new Error('la tangente en 1 no es 2x − 1');
    cuadra2425(id, 'El coeficiente cúbico', a);
  });

  it('y el término independiente es cero', () => cuadra2425(id, 'El término independiente', d));
});

describe('2024-2025 · 4 · distancia mínima a la parábola', () => {
  const id = 'ex2425-2ev-4-distancia-minima-a-la-parabola';
  /* y² = x + 1 con y > 0: los puntos son (a, √(a+1)). */
  const distancia = (a: number) => Math.hypot(a - 3, Math.sqrt(a + 1));
  const mejor = maximiza((a) => -distancia(a), -0.99, 10);

  it('la abscisa óptima es 2,5', () => cuadra2425(id, 'La abscisa óptima', mejor.x));

  it('y la ordenada, √3,5', () => cuadra2425(id, 'La ordenada', Math.sqrt(mejor.x + 1)));
});
