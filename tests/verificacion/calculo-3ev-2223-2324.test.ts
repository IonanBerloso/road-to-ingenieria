/**
 * Las terceras evaluaciones de Cálculo de 2022-2023 y 2023-2024. Diecinueve
 * respuestas entre las dos.
 *
 * El ejercicio 5 de 2023-2024 es el mejor caso de figura reconstruida de los
 * exámenes cortos: la gráfica de la velocidad es una quebrada de tres tramos
 * con todos sus vértices en nudos enteros, así que se puede escribir tal cual
 * e integrar. Y sus dos preguntas piden cosas distintas —posición y espacio
 * recorrido—, que es justo donde se falla.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { deriva, integra, raiz } from './numerico';

const cuadra2324 = convocatoria('calculo', '2023-2024-3ev');
const cuadra2223 = convocatoria('calculo', '2022-2023-3ev');

describe('2023-2024 · 1 · tangente compleja', () => {
  const id = 'ex2324-3ev-1-tangente-compleja';

  it('la parte imaginaria de las soluciones es ln3/2', () => {
    /* tan z = i/2. Se comprueba que el número propuesto la cumple, con seno
       y coseno complejos, en vez de repetir el despeje. */
    const y = Math.log(3) / 2;
    for (const k of [0, 1, -1]) {
      const [x, yy] = [k * Math.PI, y];
      const sen = [Math.sin(x) * Math.cosh(yy), Math.cos(x) * Math.sinh(yy)];
      const cos = [Math.cos(x) * Math.cosh(yy), -Math.sin(x) * Math.sinh(yy)];
      /* tan = sen/cos, y tiene que dar i/2. */
      const d = cos[0] * cos[0] + cos[1] * cos[1];
      const tan = [(sen[0] * cos[0] + sen[1] * cos[1]) / d, (sen[1] * cos[0] - sen[0] * cos[1]) / d];
      if (Math.hypot(tan[0], tan[1] - 0.5) > 1e-9) throw new Error(`con k=${k} la tangente no vale i/2`);
    }
    cuadra2324(id, 'La parte imaginaria de las soluciones', y);
  });

  it('y el disco del apartado b) tiene radio 4/3', () => {
    /* |z+i| > 2|z−i| es un disco de Apolonio. Se recorre el borde propuesto
       —centro (0, 5/3), radio 4/3— y se comprueba que ahí el cociente vale
       exactamente 2. */
    const R = 4 / 3;
    for (let k = 0; k < 16; k++) {
      const t = (2 * Math.PI * k) / 16;
      const x = R * Math.cos(t);
      const y = 5 / 3 + R * Math.sin(t);
      const cociente = Math.hypot(x, y + 1) / Math.hypot(x, y - 1);
      if (Math.abs(cociente - 2) > 1e-9) throw new Error(`en t=${t} el cociente vale ${cociente}`);
    }
    cuadra2324(id, 'El radio de la región de (b)', R);
  });
});

describe('2023-2024 · 2 · Taylor de la inversa', () => {
  const id = 'ex2324-3ev-2-taylor-de-la-inversa';
  /* LECTURA DE LA FIGURA: en el punto donde f vale 2 —que es x = 1— la
     primera derivada está en su mínimo y vale 1, y la segunda, que cruza el
     eje antes de x = 1, vale 2. */
  const fp = 1;
  const fpp = 2;

  it('f″ vale 2 donde f vale 2', () => cuadra2324(id, 'Lo que se lee en la gráfica', fpp));

  it('y el coeficiente cuadrático de la inversa es −1', () => {
    /* (f⁻¹)″ = −f″/(f′)³, y el coeficiente lleva el medio dentro. Se
       comprueba la fórmula sobre una función concreta con esas derivadas. */
    const f = (x: number) => 2 + fp * (x - 1) + (fpp / 2) * (x - 1) ** 2;
    const finv = (y: number) => raiz((x) => f(x) - y, 0.5, 3);
    const e = 1e-3;
    const segunda = (finv(2 + e) - 2 * finv(2) + finv(2 - e)) / (e * e);
    cuadra2324(id, 'El coeficiente cuadrático', segunda / 2);
  });
});

describe('2023-2024 · 3 · función integral menos exponencial', () => {
  const id = 'ex2324-3ev-3-funcion-integral-menos-exponencial';
  const f = (x: number) => integra((t) => Math.exp(t * t), 0, x * x, 1e-12) - Math.exp(x ** 4);

  it("f'(1) vale −2e", () => cuadra2324(id, 'La derivada', deriva(f, 1)));

  it('y su máximo positivo está en 1/√2', () => {
    /* f′ = 2x·e^{x⁴}(1 − 2x²), que se anula donde 1 − 2x² = 0. Se busca la
       raíz de la derivada numérica, no de la fórmula. */
    cuadra2324(id, 'Dónde está el máximo', raiz((x) => deriva(f, x), 0.3, 1.2));
  });
});

describe('2023-2024 · 4 · área de la elipse', () => {
  it('la integral del coseno al cuadrado vale π/4', () =>
    cuadra2324(
      'ex2324-3ev-4-area-de-la-elipse',
      'La integral que aparece',
      integra((t) => Math.cos(t) ** 2, 0, Math.PI / 2, 1e-12),
    ));
});

describe('2023-2024 · 5 · partícula y teoremas', () => {
  const id = 'ex2324-3ev-5-particula-y-teoremas';
  /* LECTURA DE LA FIGURA: quebrada de tres tramos. Sube de 0 a 15 entre
     t = 0 y t = 15; baja hasta −10 en t = 40, cruzando el eje en 30; y sube
     hasta 10 en t = 50, cruzando en 45. */
  const v = (t: number) => {
    if (t <= 15) return t;
    if (t <= 40) return 30 - t;
    return -10 + 2 * (t - 40);
  };

  it('la quebrada pasa por los vértices que dice el dibujo', () => {
    for (const [t, valor] of [[0, 0], [15, 15], [30, 0], [40, -10], [45, 0], [50, 10]] as [number, number][])
      if (Math.abs(v(t) - valor) > 1e-12) throw new Error(`v(${t}) no vale ${valor}`);
  });

  it('en t = 50 la partícula está en 175 m', () => {
    /* La posición es la integral de la velocidad **con su signo**. */
    const tramos = [
      integra(v, 0, 15, 1e-11),
      integra(v, 15, 40, 1e-11),
      integra(v, 40, 50, 1e-11),
    ];
    cuadra2324(id, 'La posición final', tramos.reduce((a, b) => a + b, 0));
  });

  it('y el espacio recorrido llega a 275 m en t = 40', () => {
    /* El espacio recorrido es la integral del VALOR ABSOLUTO, que es otra
       cosa: por eso el ejercicio pregunta las dos. Se integra por tramos de
       signo constante para que la cuadratura no tropiece con los picos. */
    const recorrido = (T: number) => {
      const cortes = [0, 15, 30, 40, 45, T].filter((c) => c <= T).sort((a, b) => a - b);
      let s = 0;
      for (let i = 0; i + 1 < cortes.length; i++)
        s += Math.abs(integra(v, cortes[i], cortes[i + 1], 1e-11));
      return s;
    };
    cuadra2324(id, 'Cuándo se han recorrido 275 metros', raiz((T) => recorrido(T) - 275, 31, 44));
  });
});

describe('2022-2023 · 1 · parte real de un cociente', () => {
  const id = 'ex2223-3ev-1-parte-real-de-un-cociente';

  it('el numerador racionalizado lleva un −4', () => {
    /* Re[(z+2i)(z̄+2i)] = x² + y² − 4. Se comprueba en varios puntos. */
    const k = -4;
    for (const [x, y] of [[1, 2], [-0.5, 3], [2, -1]] as [number, number][]) {
      const num = x * x + (y + 2) * (y - 2);
      if (Math.abs(num - (x * x + y * y + k)) > 1e-12) throw new Error(`falla en (${x}, ${y})`);
    }
    cuadra2223(id, 'El numerador, una vez racionalizado', k);
  });

  it('y el disco tiene radio 2', () => {
    /* Centro (0,4), radio 2: en su borde la parte real del cociente vale
       exactamente 2. */
    const R = 2;
    let saltados = 0;
    for (let k = 0; k < 16; k++) {
      const t = (2 * Math.PI * k) / 16;
      const x = R * Math.cos(t);
      const y = 4 + R * Math.sin(t);
      /* El punto 2i está sobre esta circunferencia y anula el denominador:
         es el que hay que excluir del lugar. Se salta, y se cuenta para
         comprobar que es exactamente uno. */
      if (Math.hypot(x, y - 2) < 1e-9) {
        saltados++;
        continue;
      }
      const re = (x * x + y * y - 4) / (x * x + (y - 2) ** 2);
      if (Math.abs(re - 2) > 1e-9) throw new Error(`en t=${t} la parte real vale ${re}`);
    }
    if (saltados !== 1) throw new Error(`he saltado ${saltados} puntos, y debería ser uno`);
    cuadra2223(id, 'El radio del disco', R);
  });
});

describe('2022-2023 · 2 · tangentes perpendiculares', () => {
  const id = 'ex2223-3ev-2-tangentes-perpendiculares';
  /* 4x² + y² = 72, y las tangentes tienen pendiente 2 —perpendiculares a la
     recta de pendiente −1/2—. En la elipse, y′ = −4x/y. */

  it('el punto de tangencia positivo está en x = 3', () => {
    const x = raiz((v) => {
      const y = -2 * v; // de −4x/y = 2
      return 4 * v * v + y * y - 72;
    }, 0.1, 10);
    cuadra2223(id, 'Los puntos de tangencia', x);
  });

  it('y una tangente corta al eje en −12', () => {
    const x0 = 3;
    const y0 = -2 * x0;
    if (Math.abs(4 * x0 * x0 + y0 * y0 - 72) > 1e-9) throw new Error('el punto no está en la elipse');
    cuadra2223(id, 'La ordenada en el origen', y0 + 2 * (0 - x0));
  });
});

describe('2022-2023 · 3 · McLaurin del logaritmo', () => {
  const id = 'ex2223-3ev-3-mclaurin-del-logaritmo';
  const P2 = (x: number) => 1 - x / 2 + 0.75 * x * x;

  it("f''(0) vale 1,5", () => {
    const e = 1e-3;
    cuadra2223(id, 'La segunda derivada de f', (P2(e) - 2 * P2(0) + P2(-e)) / (e * e));
  });

  it('y el coeficiente cuadrático de ln(f) es 0,625', () => {
    /* Se compone el logaritmo con el polinomio y se deriva dos veces: así no
       hace falta la fórmula de la derivada segunda de una composición. */
    const g = (x: number) => Math.log(P2(x));
    const e = 1e-3;
    cuadra2223(id, 'El coeficiente cuadrático de g', (g(e) - 2 * g(0) + g(-e)) / (e * e) / 2);
  });
});

describe('2022-2023 · 4 · sector de 45 grados', () => {
  const id = 'ex2223-3ev-4-sector-de-45-grados';
  const corte = Math.SQRT2;

  it('el volumen al girar sobre OX es 11,8477', () =>
    cuadra2223(
      id,
      'El volumen al girar sobre OX',
      Math.PI * integra((x) => 4 - x * x - x * x, 0, corte, 1e-11),
    ));

  it('y el perímetro, 5,5708', () => {
    const arco = integra(
      (t) => Math.hypot(-2 * Math.sin(t), 2 * Math.cos(t)),
      Math.PI / 4,
      Math.PI / 2,
      1e-12,
    );
    cuadra2223(id, 'El perímetro', arco + 2 + 2);
  });
});

describe('2022-2023 · 5 · integral de un valor absoluto', () => {
  const id = 'ex2223-3ev-5-integral-de-un-valor-absoluto';

  it('f(3) vale 2,5', () => {
    /* El integrando tiene un pico en z = 1: se parte ahí para que la
       cuadratura no lo persiga. */
    const g = (z: number) => Math.abs(z - 1);
    cuadra2223(id, 'El valor en un punto pasado el corte', integra(g, 0, 1, 1e-12) + integra(g, 1, 3, 1e-12));
  });

  it('y la densidad de probabilidad integra 1', () => {
    /* Impropia: se integra cada vez más lejos y se comprueba que converge. */
    const g = (x: number) => (6 * x) / (1 + 3 * x * x) ** 2;
    const lejos = [100, 1000, 10000].map((L) => integra(g, 0, L, 1e-12));
    if (!(lejos[0] < lejos[1] && lejos[1] < lejos[2])) throw new Error('no crece hacia el límite');
    cuadra2223(id, 'La integral impropia del apartado (b)', lejos[2]);
  });
});
