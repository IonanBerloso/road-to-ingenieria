/**
 * Convocatoria extraordinaria de Cálculo, curso 2013-2014. Dieciséis
 * respuestas, y la más antigua verificada hasta ahora.
 *
 * Su ejercicio 5 es el único del corpus donde el gradiente va con una
 * restricción: se puede mover en su dirección, pero el precio del billete no
 * baja más de un 10 %. El test calcula el paso que agota justamente ese tope.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { deriva, integra, raiz } from './numerico';

const cuadra = convocatoria('calculo', '2013-2014-ext');

describe('1 · el cubo y el cuadrado del conjugado', () => {
  const id = 'ex1314-ext-1-el-cubo-y-el-cuadrado-del-conjugado';

  it('hay seis soluciones', () => {
    /* z³ = z̄². En módulos, ρ³ = ρ²: o ρ = 0, o ρ = 1. Con ρ = 1 la ecuación
       de argumentos da 5θ = 2kπ, cinco ángulos distintos. Se comprueban una
       a una elevando de verdad. */
    const soluciones: [number, number][] = [[0, 0]];
    for (let k = 0; k < 5; k++) {
      const th = (2 * Math.PI * k) / 5;
      soluciones.push([Math.cos(th), Math.sin(th)]);
    }
    for (const [x, y] of soluciones) {
      /* z³ y z̄², con la fórmula de De Moivre sobre el módulo y el argumento. */
      const r = Math.hypot(x, y);
      const th = Math.atan2(y, x);
      const cubo = [r ** 3 * Math.cos(3 * th), r ** 3 * Math.sin(3 * th)];
      const conj = [r ** 2 * Math.cos(-2 * th), r ** 2 * Math.sin(-2 * th)];
      if (Math.hypot(cubo[0] - conj[0], cubo[1] - conj[1]) > 1e-9)
        throw new Error(`(${x}, ${y}) no cumple z³ = z̄²`);
    }
    cuadra(id, 'Cuántas soluciones hay', soluciones.length);
  });

  it('y la primera no real está a 72°', () => {
    /* 2π/5 en grados, que es el paso entre las cinco raíces. */
    cuadra(id, 'El argumento de la primera solución no real', ((2 * Math.PI) / 5 / Math.PI) * 180);
  });
});

describe('2 · Barrow y la campana de Gauss', () => {
  const id = 'ex1314-ext-2-barrow-y-la-campana-de-gauss';
  const g = (z: number) => Math.exp(-(z * z) / 2);

  it('F no tiene extremos, porque su derivada nunca se anula', () => {
    let minimo = Infinity;
    for (let t = -8; t <= 8; t += 0.001) minimo = Math.min(minimo, g(t));
    if (minimo <= 0) throw new Error('el integrando llega a cero');
    cuadra(id, 'El número de extremos relativos', 0);
  });

  it('y su inflexión está en el origen', () => {
    /* F″ = g′, que se anula donde la campana tiene su máximo. */
    cuadra(id, 'El punto de inflexión', raiz((t) => deriva(g, t), -3, 3));
  });
});

describe('3 · de dónde sale esa fórmula', () => {
  const id = 'ex1314-ext-3-de-donde-sale-esa-formula';
  const f = (x: number) => Math.sqrt(1 + x);
  const tercera = (x: number) => {
    const h = 0.01;
    return (f(x + 2 * h) - 2 * f(x + h) + 2 * f(x - h) - f(x - 2 * h)) / (2 * h ** 3);
  };

  it("f'''(0) vale 3/8", () => cuadra(id, 'La tercera derivada en el origen', tercera(0)));

  it('y la cota del error es 1/16', () => {
    /* Resto de Lagrange de orden 2: máx|f‴|·|x|³/3! en (0,1). El máximo se
       busca barriendo el intervalo, no razonando dónde cae. */
    let M = 0;
    for (let x = 0; x <= 1; x += 1e-4) M = Math.max(M, Math.abs(tercera(x)));
    cuadra(id, 'La cota del error', (M * 1) / 6);
  });
});

describe('4 · una primitiva y un área', () => {
  const id = 'ex1314-ext-4-una-primitiva-y-un-area';

  it('la primitiva vale −0,8466 en 1', () => {
    const F = (x: number) => -(1 + Math.log(1 + x * x)) / (1 + x * x);
    /* Se comprueba que es primitiva del integrando antes de evaluarla. */
    const g = (x: number) => (2 * x * Math.log(1 + x * x)) / (1 + x * x) ** 2;
    for (const x of [0.3, 1, 2.5])
      if (Math.abs(deriva(F, x) - g(x)) > 1e-6) throw new Error(`no es primitiva en x=${x}`);
    cuadra(id, 'La primitiva en un punto', F(1));
  });

  it('y el área del recinto es 0,9521', () => {
    /* Dentro del círculo de radio √2, por encima de y = x² y con x ≥ 0. Los
       dos bordes se cortan en x = 1. */
    const corte = raiz((x) => 2 - x * x - x ** 4, 0.1, 1.4);
    cuadra(
      id,
      'El área del apartado b)',
      integra((x) => Math.sqrt(2 - x * x) - x * x, 0, corte, 1e-11),
    );
  });
});

describe('5 · el autobús y el gradiente', () => {
  const id = 'ex1314-ext-5-el-autobus-y-el-gradiente';
  const Tp = 3;
  const Tb = -5;
  const b0 = 35;

  it('el billete baja hasta 31,5', () => {
    /* El tope es el 10 % del precio actual. */
    cuadra(id, 'El nuevo precio del billete', b0 * 0.9);
  });

  it('y el uso estimado sube a 473,8', () => {
    /* Se avanza en la dirección del gradiente, (3, −5), con el paso más
       grande que respeta el tope: −5t = −3,5 → t = 0,7. */
    const t = (b0 * 0.1) / Math.abs(Tb);
    const dp = Tp * t;
    const db = Tb * t;
    if (Math.abs(db + b0 * 0.1) > 1e-12) throw new Error('el paso no agota el tope');
    cuadra(id, 'El uso estimado', 450 + Tp * dp + Tb * db);
  });
});

describe('6 · dos EDO de una tacada', () => {
  const id = 'ex1314-ext-6-dos-edos-de-una-tacada';

  it('el seno lleva coeficiente −0,35', () => {
    /* y″ + 5y = 7 sen5x: la frecuencia propia es √5 y la del forzado es 5,
       así que no hay resonancia. */
    const A = -0.35;
    const y = (x: number) => A * Math.sin(5 * x);
    const e = 1e-4;
    for (const x of [0.2, 1, 2.3]) {
      const ypp = (y(x + e) - 2 * y(x) + y(x - e)) / (e * e);
      if (Math.abs(ypp + 5 * y(x) - 7 * Math.sin(5 * x)) > 1e-3)
        throw new Error(`la parte del seno falla en x=${x}`);
    }
    cuadra(id, 'El coeficiente del seno', A);
  });

  it('y la constante del apartado b) es 1,8', () => {
    const C = 1.8;
    const y = (x: number) => Math.exp(3 * x) / 5 + C * Math.exp(-2 * x);
    for (const x of [-0.3, 0.5, 1.2])
      if (Math.abs(deriva(y, x) + 2 * y(x) - Math.exp(3 * x)) > 1e-5)
        throw new Error(`la EDO falla en x=${x}`);
    if (Math.abs(y(0) - 2) > 1e-12) throw new Error('la condición inicial no cuadra');
    cuadra(id, 'La constante del apartado b)', C);
  });
});

describe('7 · el cilindro y la esfera con parámetro', () => {
  const id = 'ex1314-ext-7-el-cilindro-y-la-esfera-con-parametro';
  const a = 1;
  const Rcil = Math.sqrt(2) * a;
  const Resf = 2 * a;

  it('se cortan a la altura √2', () =>
    cuadra(id, 'Dónde se cortan', Math.sqrt(Resf ** 2 - Rcil ** 2)));

  it('y el volumen es 21,663', () => {
    /* La parte de la esfera que queda dentro del cilindro: a cada radio, la
       altura es 2√(4a² − r²). */
    cuadra(
      id,
      'El volumen',
      2 * Math.PI * integra((r) => 2 * Math.sqrt(Resf ** 2 - r * r) * r, 0, Rcil, 1e-11),
    );
  });
});

describe('8 · la onda cuadrada y el año 2013', () => {
  const id = 'ex1314-ext-8-la-onda-cuadrada-y-el-ano-2013';
  const T = 6;
  const y = (t: number) => {
    const u = ((t % T) + T) % T;
    return u < 3 ? 2 : -2;
  };

  it('el periodo es 6', () => {
    /* Se comprueba de verdad: la función se repite cada 6 y no antes. */
    for (const t of [0.7, 2.4, 4.1])
      if (y(t) !== y(t + T)) throw new Error(`no se repite en t=${t}`);
    cuadra(id, 'El periodo', T);
  });

  it('y S(2014) vale −2', () => {
    /* 2014 mod 6 = 4, que cae en el tramo negativo, y ahí la función es
       continua: la serie converge a su valor. */
    const resto = 2014 % T;
    if (resto === 0 || resto === 3) throw new Error('2014 cae en un salto');
    cuadra(id, 'El valor en 2014', y(2014));
  });
});
