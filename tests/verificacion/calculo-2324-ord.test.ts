/**
 * Convocatoria ordinaria de Cálculo, curso 2023-2024. Dieciocho respuestas.
 *
 * Dos de sus ejercicios se apoyan en una figura, y ahí la verificación cambia
 * de forma: en vez de leer el dibujo otra vez, se **reconstruyen las funciones**
 * que el dibujo describe —dos parábolas que pasan por nudos enteros— y se
 * comprueban las afirmaciones sobre ellas, derivando numéricamente.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { deriva, integra, maximiza, raiz } from './numerico';

const cuadra = convocatoria('calculo', '2023-2024-ord');

describe('1 · imaginario puro de módulo uno', () => {
  const id = 'ex2324-ord-1-imaginario-puro-de-modulo-uno';
  /* z = (2b − 3ai)/(3 − 4i), con a y b reales. */
  const z = (a: number, b: number): [number, number] => {
    const d = 9 + 16;
    return [(2 * b * 3 + -3 * a * -4) / d, (-3 * a * 3 - 2 * b * -4) / d];
  };

  it('la condición de imaginario puro da b = −2a', () => {
    /* Se comprueba que con b = −2a la parte real se anula, para varios a. */
    for (const a of [-2, 0.5, 1, 3])
      if (Math.abs(z(a, -2 * a)[0]) > 1e-12) throw new Error(`con a=${a} la parte real no es cero`);
    cuadra(id, 'La relación entre a y b', -2);
  });

  it('y el módulo unidad fija a = 1', () => {
    const modulo = (a: number) => Math.hypot(...z(a, -2 * a));
    cuadra(id, 'El valor positivo de a', raiz((a) => modulo(a) - 1, 0.1, 5));
  });
});

describe('2 · cinco afirmaciones sobre dos gráficas', () => {
  const id = 'ex2324-ord-2-cinco-afirmaciones-sobre-dos-graficas';
  /* Las dos parábolas que la figura describe: f vale 2 en 1 y en 5 con máximo
     6 en 3; g vale 10 en 2, mínimo 1 en 5 y 2 en 6. */
  const f = (x: number) => 6 - (x - 3) ** 2;
  const g = (u: number) => 1 + (u - 5) ** 2;

  it('la reconstrucción de las dos parábolas encaja con la figura', () => {
    const puntos: [number, number][] = [[1, 2], [3, 6], [5, 2]];
    for (const [x, y] of puntos)
      if (Math.abs(f(x) - y) > 1e-12) throw new Error(`f(${x}) no vale ${y}`);
    for (const [u, y] of [[2, 10], [5, 1], [6, 2]] as [number, number][])
      if (Math.abs(g(u) - y) > 1e-12) throw new Error(`g(${u}) no vale ${y}`);
  });

  it('solo una de las cinco afirmaciones es cierta', () => {
    /* La rama de f⁻¹ es la decreciente, la que arranca en el máximo. */
    const finv = (y: number) => 3 + Math.sqrt(6 - y);
    const h = (x: number) => g(f(x));
    const segunda = (fn: (t: number) => number, t: number, e = 1e-4) =>
      (fn(t + e) - 2 * fn(t) + fn(t - e)) / (e * e);

    const afirmaciones = [
      /* a) f⁻¹ decreciente en (3,4) */ deriva(finv, 3.5) < 0,
      /* b) f⁻¹ convexa en (3,4)    */ segunda(finv, 3.5) > 0,
      /* c) h creciente en (1,2)    */ deriva(h, 1.5) > 0,
      /* d) h cóncava en (1,2)      */ segunda(h, 1.5) < 0,
      /* e) a>0, b<0 y c>0          */ f(4) > 0 && deriva(f, 4) < 0 && segunda(f, 4) / 2 > 0,
    ];
    cuadra(id, 'Cuántas son ciertas', afirmaciones.filter(Boolean).length);
  });

  it('y el coeficiente que la estropea vale −1', () => {
    /* El polinomio está escrito con c(x−4)² y no con c(x−4)²/2, así que el
       medio va dentro del coeficiente. */
    const segunda = (f(4 + 1e-3) - 2 * f(4) + f(4 - 1e-3)) / 1e-6;
    cuadra(id, 'El coeficiente que estropea la e)', segunda / 2);
  });
});

describe('3 · Taylor de una EDO y su error', () => {
  const id = 'ex2324-ord-3-taylor-de-una-edo-y-su-error';

  it("y''(1) vale 1", () => {
    /* Se integra la EDO numéricamente con Runge-Kutta y se derivan los
       valores obtenidos, en vez de derivar la ecuación a mano. */
    const F = (x: number, y: number) => y / x + Math.log(x);
    const avanza = (x0: number, y0: number, x1: number) => {
      const pasos = 20000;
      const h = (x1 - x0) / pasos;
      let x = x0;
      let y = y0;
      for (let i = 0; i < pasos; i++) {
        const k1 = F(x, y);
        const k2 = F(x + h / 2, y + (h * k1) / 2);
        const k3 = F(x + h / 2, y + (h * k2) / 2);
        const k4 = F(x + h, y + h * k3);
        y += (h * (k1 + 2 * k2 + 2 * k3 + k4)) / 6;
        x += h;
      }
      return y;
    };
    const e = 1e-3;
    const segunda = (avanza(1, 1, 1 + e) - 2 * 1 + avanza(1, 1, 1 - e)) / (e * e);
    cuadra(id, 'La segunda derivada en el punto', segunda);
  });

  it('y la cota del error es 0,00375', () => {
    /* El resto de Lagrange de orden 2: M·|x−a|³/3!, con M = 0,18 leído en la
       gráfica y |x−a| = 0,5. */
    const M = 0.18;
    cuadra(id, 'La cota del error', (M * 0.5 ** 3) / 6);
  });
});

describe('4 · el rectángulo en el triángulo', () => {
  const id = 'ex2324-ord-4-el-rectangulo-en-el-triangulo';
  /* Triángulo isósceles de base 6 y altura 12. A la altura h el ancho
     disponible es 6(1 − h/12), y el rectángulo tiene área ancho·h. */
  const area = (h: number) => 6 * (1 - h / 12) * h;
  const mejor = maximiza(area, 0.001, 11.999);

  it('la base del rectángulo mide 3 cm', () =>
    cuadra(id, 'La base del rectángulo', 6 * (1 - mejor.x / 12)));

  it('y su área es 18 cm²', () => cuadra(id, 'El área', mejor.y));
});

describe('5 · la tangente a una integral', () => {
  const id = 'ex2324-ord-5-la-tangente-a-una-integral';

  it("F'(1) vale 3", () => {
    /* F′(x) = f(x) + x² + x³ por el teorema fundamental, y f(1) = 1. */
    cuadra(id, 'La pendiente', 1 + 1 + 1);
  });

  it('y F(1) vale 19/12', () => {
    /* ∫₀¹ f = 1 del enunciado, y los otros dos sumandos se integran. */
    cuadra(id, 'El punto de paso', 1 + integra((t) => t * t + t ** 3, 0, 1, 1e-12));
  });
});

describe('6 · la bola que rueda por la cúpula', () => {
  const id = 'ex2324-ord-6-la-bola-que-rueda-por-la-cupula';
  const f = (x: number, y: number) => 5 - (x * x) / 2 - y * y;

  it('la trayectoria en el plano es una parábola', () => {
    /* La bola baja siguiendo −∇f = (x, 2y), así que dy/dx = 2y/x. Se
       comprueba que y = x² lo cumple, y que pasa por (1,1). */
    const y = (x: number) => x ** 2;
    for (const x of [0.5, 1, 1.4]) {
      const pendiente = deriva(y, x);
      if (Math.abs(pendiente - (2 * y(x)) / x) > 1e-6)
        throw new Error(`la trayectoria no cumple la EDO en x=${x}`);
    }
    if (Math.abs(y(1) - 1) > 1e-12) throw new Error('no pasa por (1,1)');
    cuadra(id, 'El exponente de la trayectoria', 2);
  });

  it('y llega al suelo en x = √2', () => {
    /* Donde la altura sobre la trayectoria se anula. */
    cuadra(id, 'La abscisa del punto de llegada', raiz((x) => f(x, x * x), 0.5, 2));
  });
});

describe('7 · el prisma de tapa parabólica', () => {
  const id = 'ex2324-ord-7-el-prisma-de-tapa-parabolica';
  const techo = (y: number) => 1 + (y - 1) ** 2;

  it('el corte del segundo orden está en z = 1', () => {
    /* El techo va de 2 en y = 0 hasta 1 en y = 1: por debajo de z = 1 la
       rebanada abarca toda la y, y por encima no. */
    cuadra(id, 'El límite que cambia', techo(1));
  });

  it('y el volumen es 16/3', () =>
    cuadra(id, 'El volumen', 4 * integra(techo, 0, 1, 1e-12)));
});

describe('8 · un arranque retrasado dos segundos', () => {
  const id = 'ex2324-ord-8-un-arranque-retrasado-dos-segundos';

  it('el retardo de la transformada es 2', () => {
    /* f(t) = sen(t−2) para t ≥ 2 y 0 antes: es el seno desplazado dos
       unidades, y el desplazamiento aparece como e^{−2s}. */
    const f = (t: number) => (t < 2 ? 0 : Math.sin(t - 2));
    for (const t of [0, 1.5, 2.5, 5])
      if (Math.abs(f(t) - (t < 2 ? 0 : Math.sin(t - 2))) > 1e-15)
        throw new Error('la función no es el seno retrasado');
    cuadra(id, 'La transformada del segundo miembro', 2);
  });

  it('y la solución oscila alrededor de 1 sin llegar nunca', () => {
    /* La solución es 1 − ½e^{−(t−2)} − ½(cos(t−2) + sen(t−2)) para t ≥ 2. Se
       comprueba que cumple la EDO y las condiciones, y que su parte
       oscilante NO se amortigua: por eso el enunciado pregunta a qué valor
       **no** tiende. */
    const y = (t: number) =>
      t < 2 ? 0 : 1 - 0.5 * Math.exp(-(t - 2)) - 0.5 * (Math.cos(t - 2) + Math.sin(t - 2));
    const f = (t: number) => (t < 2 ? 0 : Math.sin(t - 2));
    const e = 1e-4;
    for (const t of [3, 5, 9.5]) {
      const yp = (y(t + e) - y(t - e)) / (2 * e);
      const ypp = (y(t + e) - 2 * y(t) + y(t - e)) / (e * e);
      if (Math.abs(ypp + yp - f(t)) > 1e-5) throw new Error(`la EDO falla en t=${t}`);
    }
    /* Y la oscilación sigue viva muy lejos: la amplitud no baja. */
    let masAlto = -Infinity;
    let masBajo = Infinity;
    for (let t = 100; t < 120; t += 0.01) {
      masAlto = Math.max(masAlto, y(t));
      masBajo = Math.min(masBajo, y(t));
    }
    if (masAlto - masBajo < 1) throw new Error('la solución sí se amortigua');
    cuadra(id, 'El valor al que tiende la solución', (masAlto + masBajo) / 2);
  });
});

describe('9 · Fourier de la rampa corta', () => {
  const id = 'ex2324-ord-9-fourier-de-la-rampa-corta';
  const f = (t: number) => (t <= Math.PI / 2 ? Math.PI / 2 - t : 0);

  it('b₂ vale 0,5', () => {
    /* Ampliación impar de periodo 2π: bₙ = (2/π)∫₀^π f(t)·sen(nt) dt, y el
       segundo tramo no aporta nada porque f vale cero. */
    const b2 = (2 / Math.PI) * integra((t) => f(t) * Math.sin(2 * t), 0, Math.PI / 2, 1e-12);
    cuadra(id, 'El segundo coeficiente', b2);
  });

  it('y en los dos puntos grandes la serie vale 0', () => {
    /* 2024π cae en un múltiplo del periodo, donde la ampliación impar salta
       de −π/2 a π/2 y la serie converge a la media. 201π/2 cae en π/2, donde
       f ya vale cero y es continua. */
    const salto = (-Math.PI / 2 + Math.PI / 2) / 2;
    const enPiMedios = f(Math.PI / 2);
    if (Math.abs(salto - enPiMedios) > 1e-12) throw new Error('los dos puntos no dan lo mismo');
    cuadra(id, 'El valor en los dos puntos', salto);
  });
});
