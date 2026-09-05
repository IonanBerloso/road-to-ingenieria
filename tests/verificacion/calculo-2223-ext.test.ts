/**
 * Convocatoria extraordinaria de Cálculo, curso 2022-2023. Diecisiete
 * respuestas.
 *
 * Su ejercicio 3 tiene lo más difícil de verificar sin repetir el examen: una
 * curva definida implícitamente. Aquí se despeja **numéricamente** la y para
 * cada x cercana al punto y se deriva el resultado, en vez de derivar la
 * ecuación implícita como hace la resolución.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { integra, maximiza, raiz } from './numerico';

const cuadra = convocatoria('calculo', '2022-2023-ext');

describe('1 · un seno complejo y una elipse', () => {
  const id = 'ex2223-ext-1-un-seno-complejo-y-una-elipse';

  it('sen(π + i ln 2) tiene parte imaginaria −0,75', () => {
    /* sen(x+iy) = sen x·ch y + i·cos x·sh y. */
    const x = Math.PI;
    const y = Math.log(2);
    cuadra(id, 'La parte imaginaria del seno', Math.cos(x) * Math.sinh(y));
  });

  it('y la elipse tiene b² = 3', () => {
    /* Focos en (1,1) y (1,−1), suma de distancias 4. Se comprueba sobre
       puntos de la elipse propuesta que la suma vale de verdad 4. */
    const a2 = 4;
    const b2 = 3;
    for (let k = 0; k < 16; k++) {
      const t = (2 * Math.PI * k) / 16;
      /* Eje mayor vertical: el centro es (1,0) y los focos están en y = ±1. */
      const p = [1 + Math.sqrt(b2) * Math.cos(t), Math.sqrt(a2) * Math.sin(t)];
      const suma = Math.hypot(p[0] - 1, p[1] - 1) + Math.hypot(p[0] - 1, p[1] + 1);
      if (Math.abs(suma - 4) > 1e-9) throw new Error(`en t=${t} la suma es ${suma}`);
    }
    cuadra(id, 'El semieje menor', b2);
  });
});

describe('2 · de la velocidad a la posición', () => {
  const id = 'ex2223-ext-2-de-la-velocidad-a-la-posicion';
  const v = (t: number) => (1 - t) * (t - 3);
  const x = (t: number) => 2 + integra(v, 0, t, 1e-12);

  it('el máximo de la posición está en t = 3', () => {
    /* Se busca el máximo de x sobre el intervalo, sin mirar dónde se anula v. */
    cuadra(id, 'El máximo', maximiza(x, 0.5, 5).x);
  });

  it('y allí el objeto ha vuelto a 2 cm', () => {
    /* Lo bonito del ejercicio: el área bajo v entre 0 y 3 es cero, así que
       vuelve exactamente al punto de partida. */
    cuadra(id, 'La posición en el máximo', x(3));
  });
});

describe('3 · un extremo que no lo es y un valor absoluto', () => {
  const id = 'ex2223-ext-3-un-extremo-que-no-lo-es-y-un-valor-absoluto';

  it("y' vale −1/2 en (π, π/2)", () => {
    /* F(x,y) = x·cos y + y·sen x. Para cada x se despeja la y que anula F
       cerca de π/2, y se deriva esa función numéricamente. */
    const F = (x: number, y: number) => x * Math.cos(y) + y * Math.sin(x);
    if (Math.abs(F(Math.PI, Math.PI / 2)) > 1e-12) throw new Error('el punto no está en la curva');
    const y = (x: number) => raiz((v) => F(x, v), Math.PI / 2 - 0.4, Math.PI / 2 + 0.4);
    const e = 1e-5;
    cuadra(id, 'La pendiente en el punto', (y(Math.PI + e) - y(Math.PI - e)) / (2 * e));
  });

  it('y el coeficiente cuadrático del McLaurin es −1/2', () => {
    /* f(x) = ∫₀ˣ|z−1|dz. Cerca del origen el valor absoluto vale 1−z, así
       que la segunda derivada se puede sacar por diferencias sobre la
       integral misma. */
    const f = (x: number) => integra((z) => Math.abs(z - 1), 0, x, 1e-13);
    const e = 1e-3;
    const segunda = (f(e) - 2 * f(0) + f(-e)) / (e * e);
    cuadra(id, 'El coeficiente cuadrático', segunda / 2);
  });
});

describe('4 · la chapa y el rectángulo que cabe dentro', () => {
  const id = 'ex2223-ext-4-la-chapa-y-el-rectangulo-que-cabe-dentro';
  const techo = (x: number) => 4 - x * x;

  it('la parábola y la recta se cortan en √3', () =>
    cuadra(id, 'Los cortes', raiz((x) => techo(x) - 1, 0.1, 2)));

  const corte = Math.sqrt(3);

  it('la chapa mide 4√3', () =>
    cuadra(id, 'El área', integra((x) => techo(x) - 1, -corte, corte, 1e-12)));

  it('y el rectángulo máximo tiene área 4', () => {
    /* Un lado sobre y = 1, así que el rectángulo va de −x a x con altura
       4 − x² − 1. El máximo se busca, no se deriva. */
    cuadra(id, 'El rectángulo', maximiza((x) => 2 * x * (techo(x) - 1), 0.001, corte).y);
  });
});

describe('5 · el cilindro con fondo de paraboloide', () => {
  const id = 'ex2223-ext-5-el-cilindro-con-fondo-de-paraboloide';
  /* Dentro del cilindro de radio 1, entre el paraboloide z = 1 − r² y z = 4. */
  const altura = (r: number) => 4 - (1 - r * r);

  it('el volumen es 3,5π', () =>
    cuadra(id, 'El volumen', 2 * Math.PI * integra((r) => altura(r) * r, 0, 1, 1e-12)));

  it('y la masa, con densidad proporcional a la distancia al eje, es 2,4π', () =>
    cuadra(id, 'La masa', 2 * Math.PI * integra((r) => r * altura(r) * r, 0, 1, 1e-12)));
});

describe('6 · dos segundos miembros y uno resuena', () => {
  const id = 'ex2223-ext-6-dos-segundos-miembros-y-uno-resuena';
  const e = 1e-4;
  const segunda = (f: (t: number) => number, t: number) => (f(t + e) - 2 * f(t) + f(t - e)) / (e * e);

  it('la parte exponencial lleva A = 1/2', () => {
    /* Se comprueba que y = ½eˣ resuelve y″ + 25y = 13eˣ, derivando. */
    const A = 0.5;
    const y = (x: number) => A * Math.exp(x);
    for (const x of [-1, 0, 2])
      if (Math.abs(segunda(y, x) + 25 * y(x) - 13 * Math.exp(x)) > 1e-4)
        throw new Error(`la exponencial falla en x=${x}`);
    cuadra(id, 'La parte exponencial', A);
  });

  it('y la que resuena, C = 1/5', () => {
    /* cos5x está en la solución homogénea, así que la particular lleva una x
       delante. Se comprueba igual. */
    const C = 0.2;
    const y = (x: number) => C * x * Math.sin(5 * x);
    for (const x of [0.3, 1, 2.2])
      if (Math.abs(segunda(y, x) + 25 * y(x) - 2 * Math.cos(5 * x)) > 1e-3)
        throw new Error(`la resonante falla en x=${x}`);
    cuadra(id, 'La parte que resuena', C);
  });
});

describe('7 · la ecuación integral del seno', () => {
  const id = 'ex2223-ext-7-la-ecuacion-integral-del-seno';

  it('la transformada tiene s⁴ en el denominador', () => {
    /* Y = 1/s² + Y/(s²+1) da Y = (s²+1)/s⁴. Se comprueba la identidad en
       varios s en vez de repetir el despeje. */
    const Y = (s: number) => (s * s + 1) / s ** 4;
    for (const s of [0.7, 1.5, 4])
      if (Math.abs(Y(s) - (1 / (s * s) + Y(s) / (s * s + 1))) > 1e-12)
        throw new Error(`la identidad falla en s=${s}`);
    cuadra(id, 'La transformada despejada', 4);
  });

  it('y la solución vale 7,5 en t = 3', () => {
    /* y(t) = t + t³/6. Se comprueba que cumple la ecuación integral original
       —integrando de verdad la convolución— antes de evaluarla. */
    const y = (t: number) => t + t ** 3 / 6;
    for (const t of [1, 2, 3]) {
      const conv = integra((u) => Math.sin(t - u) * y(u), 0, t, 1e-12);
      if (Math.abs(y(t) - (t + conv)) > 1e-8) throw new Error(`la ecuación falla en t=${t}`);
    }
    cuadra(id, 'La solución en un instante', y(3));
  });
});

describe('8 · la ampliación par de t − 2π', () => {
  const id = 'ex2223-ext-8-la-ampliacion-par-de-t-menos-dos-pi';
  const f = (t: number) => t - 2 * Math.PI;

  it('el término constante es −3π/2', () =>
    cuadra(id, 'El término constante', integra(f, 0, Math.PI, 1e-12) / Math.PI));

  it('y S(0) vale −2π, porque la ampliación par no salta ahí', () => {
    /* Los dos límites laterales coinciden: por la derecha f(0⁺) y por la
       izquierda, la reflexión del mismo valor. */
    const porLaDerecha = f(1e-9);
    const porLaIzquierda = f(1e-9); // la ampliación par refleja: F(−t) = f(t)
    cuadra(id, 'El valor en el origen', (porLaDerecha + porLaIzquierda) / 2);
  });
});
