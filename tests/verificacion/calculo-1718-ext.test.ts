/**
 * Convocatoria extraordinaria de Cálculo, curso 2017-2018. Dieciséis
 * respuestas.
 *
 * Dos de sus ejercicios son repeticiones exactas de otras convocatorias ya
 * verificadas —el 2 tiene la misma figura que el 2 de la extraordinaria de
 * 2023-2024, y el 7 es el mismo sistema que el 8 de la ordinaria de
 * 2022-2023—, así que se verifican con la misma reconstrucción y la misma
 * solución. Cuadrar dos veces con lo mismo es la comprobación cruzada más
 * barata que hay.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { deriva, integra, raiz } from './numerico';

const cuadra = convocatoria('calculo', '2017-2018-ext');

describe('1 · el círculo y la mediatriz', () => {
  const id = 'ex1718-ext-1-el-circulo-y-la-mediatriz';

  it('el módulo vale 1', () => {
    /* |z| = |1/z| obliga a |z|² = 1. Se busca la raíz positiva. */
    cuadra(id, 'El módulo', raiz((r) => r * r - 1, 0.1, 5));
  });

  it('y la solución de arriba es 1/2 + (√3/2)i', () => {
    /* La segunda condición, |z| = |1−z|, es la mediatriz del segmento de 0 a
       1: parte real 1/2. Con módulo 1, la imaginaria sale de Pitágoras. Se
       comprueban las dos condiciones sobre el punto. */
    const z: [number, number] = [0.5, Math.sqrt(3) / 2];
    if (Math.abs(Math.hypot(...z) - 1) > 1e-12) throw new Error('el módulo no es 1');
    if (Math.abs(Math.hypot(...z) - Math.hypot(1 - z[0], -z[1])) > 1e-12)
      throw new Error('no está en la mediatriz');
    cuadra.complejo(id, 'Una de las dos soluciones', z);
  });
});

describe('2 · el cuadrado de la derivada', () => {
  const id = 'ex1718-ext-2-el-cuadrado-de-la-derivada';
  /* Misma figura que la extraordinaria de 2023-2024: sube a un máximo, baja a
     un mínimo por debajo del arranque, y se dispara. Misma reconstrucción. */
  const f = (x: number) => x ** 3 / 3 - 2 * x ** 2 + 3 * x;
  const h = (x: number) => deriva(f, x) ** 2;

  it('h tiene tres extremos', () => {
    let extremos = 0;
    let ultimo = 0;
    for (let x = 0.5; x <= 4; x += 0.001) {
      const signo = Math.sign(deriva(h, x));
      if (signo !== 0 && ultimo !== 0 && signo !== ultimo) extremos++;
      if (signo !== 0) ultimo = signo;
    }
    cuadra(id, 'El número de extremos de h', extremos);
  });

  it('y vale cero en los extremos de f', () => {
    /* Donde f′ = 0, h = (f′)² = 0. Los extremos de f están en 1 y 3. */
    const enElMaximo = h(1);
    const enElMinimo = h(3);
    if (Math.abs(enElMaximo - enElMinimo) > 1e-8) throw new Error('los dos no coinciden');
    cuadra(id, 'El valor de h en los extremos de f', enElMaximo);
  });
});

describe('3 · la raíz de cero nueve', () => {
  const id = 'ex1718-ext-3-la-raiz-de-cero-nueve';
  const f = (x: number) => Math.sqrt(1 + x);

  it('el coeficiente de x² es −1/8', () => {
    const e = 1e-3;
    const segunda = (f(e) - 2 * f(0) + f(-e)) / (e * e);
    cuadra(id, 'El coeficiente de x²', segunda / 2);
  });

  it('y la aproximación de √0,9 es 0,94875', () => {
    /* P₂(x) = 1 + x/2 − x²/8 evaluado en x = −0,1. */
    const P2 = (x: number) => 1 + x / 2 - (x * x) / 8;
    cuadra(id, 'La aproximación', P2(-0.1));
  });
});

describe('4 · hacia dónde nadar para calentarse', () => {
  const id = 'ex1718-ext-4-hacia-donde-nadar-para-calentarse';
  const T = (x: number, y: number) => y * y * x + x * x * Math.log(x);
  const e = 1e-6;
  const grad = (x: number, y: number) => [
    (T(x + e, y) - T(x - e, y)) / (2 * e),
    (T(x, y + e) - T(x, y - e)) / (2 * e),
  ];

  it('la componente x del gradiente vale 10', () =>
    cuadra(id, 'La componente x del gradiente', grad(1, 3)[0]));

  it('y en la mejor dirección la temperatura sube a 11,662 por unidad', () => {
    /* El ritmo máximo es el módulo del gradiente. Se comprueba además que
       ninguna otra dirección da más, probando un abanico. */
    const g = grad(1, 3);
    const modulo = Math.hypot(...g);
    for (let k = 0; k < 60; k++) {
      const th = (2 * Math.PI * k) / 60;
      const direccional = g[0] * Math.cos(th) + g[1] * Math.sin(th);
      if (direccional > modulo + 1e-9) throw new Error('hay una dirección mejor que el gradiente');
    }
    cuadra(id, 'La rapidez con la que se calienta', modulo);
  });
});

describe('5 · el paraboloide con tapa de cono', () => {
  const id = 'ex1718-ext-5-el-paraboloide-con-tapa-de-cono';

  it('se tocan a un radio de 1', () => {
    /* r² = z y r² = (z−2)²: igualando, z = (z−2)², y el radio es √z. */
    const z = raiz((v) => v - (v - 2) ** 2, 0.2, 1.9);
    cuadra(id, 'Dónde se cortan las dos superficies', Math.sqrt(z));
  });

  it('y la superficie completa mide 9,773', () => {
    /* Dos trozos, los dos como superficie de revolución: el paraboloide con
       dz/dr = 2r y el cono con dz/dr = −1. */
    const rc = 1;
    const parabola = 2 * Math.PI * integra((r) => Math.sqrt(1 + 4 * r * r) * r, 0, rc, 1e-12);
    const cono = 2 * Math.PI * integra((r) => Math.SQRT2 * r, 0, rc, 1e-12);
    cuadra(id, 'El área total de la superficie', parabola + cono);
  });
});

describe('6 · el factor que hace exacta la EDO', () => {
  const id = 'ex1718-ext-6-el-factor-que-hace-exacta-la-edo';
  const M = (x: number, y: number) => 3 * y * (x + y) ** 2;
  const N = (x: number, y: number) => (x + 4 * y) * (x + y) ** 2;

  it('M_y vale 63 en (1,2)', () => {
    /* Y de paso se comprueba que el factor integrante hace exacta la EDO:
       M_y = N_x en varios puntos. */
    const e = 1e-5;
    for (const [x, y] of [[1, 2], [0.4, -0.7], [3, 1]] as [number, number][]) {
      const My = (M(x, y + e) - M(x, y - e)) / (2 * e);
      const Nx = (N(x + e, y) - N(x - e, y)) / (2 * e);
      if (Math.abs(My - Nx) > 1e-4) throw new Error(`no es exacta en (${x}, ${y})`);
    }
    cuadra(id, 'La derivada cruzada, ya multiplicada', (M(1, 2 + e) - M(1, 2 - e)) / (2 * e));
  });

  it('y la curva por (1,2) tiene constante 54', () => {
    /* F = y(x+y)³. Se comprueba que su gradiente es (M, N) antes de
       evaluarla. */
    const F = (x: number, y: number) => y * (x + y) ** 3;
    const e = 1e-5;
    for (const [x, y] of [[1, 2], [2, 0.5]] as [number, number][]) {
      const Fx = (F(x + e, y) - F(x - e, y)) / (2 * e);
      const Fy = (F(x, y + e) - F(x, y - e)) / (2 * e);
      if (Math.abs(Fx - M(x, y)) > 1e-3 || Math.abs(Fy - N(x, y)) > 1e-3)
        throw new Error(`el potencial no encaja en (${x}, ${y})`);
    }
    cuadra(id, 'El potencial en un punto', F(1, 2));
  });
});

describe('7 · el sistema cuya respuesta es la más simple', () => {
  const id = 'ex1718-ext-7-el-sistema-cuya-respuesta-es-la-mas-simple';
  /* El mismo sistema que el 8 de la ordinaria de 2022-2023. */

  it('el determinante en s = 3 vale 7', () => {
    const s = 3;
    cuadra(id, 'El determinante del sistema', (s - 1) * (s + 1) - 1);
  });

  it('y las dos funciones valen e en t = 1', () => {
    const x = (t: number) => Math.exp(t);
    const y = (t: number) => Math.exp(t);
    const e = 1e-6;
    for (const t of [0.2, 1, 2.5]) {
      if (Math.abs(deriva(x, t) - (x(t) + y(t) - Math.exp(t))) > 1e-6)
        throw new Error(`la 1.ª falla en t=${t}`);
      if (Math.abs(deriva(y, t) - (x(t) - y(t) + Math.exp(t))) > 1e-6)
        throw new Error(`la 2.ª falla en t=${t}`);
    }
    cuadra(id, 'La solución en t = 1', x(1));
  });
});

describe('8 · la rampa y la serie de Leibniz', () => {
  const id = 'ex1718-ext-8-la-rampa-y-la-serie-de-leibniz';

  it('b₁ vale 1', () => {
    /* f(t) = t/2 es impar, así que bₙ = (2/π)∫₀^π (t/2)·sen(nt) dt. */
    cuadra(id, 'El primer coeficiente del seno', (2 / Math.PI) * integra((t) => (t / 2) * Math.sin(t), 0, Math.PI, 1e-12));
  });

  it('y la serie de Leibniz sin su primer término suma −0,2146', () => {
    /* Es π/4 menos el término n = 0, que vale 1. Se suma de verdad. */
    let s = 0;
    let previa = 0;
    for (let n = 1; n < 200000; n++) {
      previa = s;
      s += (-1) ** n / (2 * n + 1);
    }
    cuadra(id, 'La suma del apartado e)', (s + previa) / 2);
  });
});
