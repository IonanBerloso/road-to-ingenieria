/**
 * Convocatoria extraordinaria de Cálculo, curso 2012-2013. Quince respuestas,
 * y la más antigua del corpus.
 *
 * Su ejercicio 8 es el único con un integrando que **no está definido en
 * cuatro puntos de la propia curva**, y el test los localiza en vez de
 * copiarlos: corta la circunferencia con las dos rectas prohibidas.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { deriva, integra, maximiza, raiz } from './numerico';

const cuadra = convocatoria('calculo', '2012-2013-ext');

describe('1 · el rombo y su área', () => {
  const id = 'ex1213-ext-1-el-rombo-y-su-area';
  const z1 = [2, -1];
  const z2 = [6, 2];
  const d = Math.hypot(z2[0] - z1[0], z2[1] - z1[1]);

  it('la diagonal conocida mide 5', () => cuadra(id, 'La diagonal conocida', d));

  it('y el vértice de arriba es 1 + 4,5i', () => {
    /* La otra diagonal mide el doble y es perpendicular, cortándose en el
       punto medio. */
    const medio = [(z1[0] + z2[0]) / 2, (z1[1] + z2[1]) / 2];
    const u = [(z2[0] - z1[0]) / d, (z2[1] - z1[1]) / d];
    const perp = [-u[1], u[0]];
    const semi = d; // la mitad de la otra diagonal, que mide 2d
    const arriba = [medio[0] + semi * perp[0], medio[1] + semi * perp[1]];
    const abajo = [medio[0] - semi * perp[0], medio[1] - semi * perp[1]];
    const bueno = arriba[1] > abajo[1] ? arriba : abajo;
    /* Y se comprueba que los cuatro vértices forman un rombo de verdad: los
       cuatro lados tienen que medir lo mismo. */
    const l = (p: number[], q: number[]) => Math.hypot(p[0] - q[0], p[1] - q[1]);
    const lados = [l(z1, arriba), l(arriba, z2), l(z2, abajo), l(abajo, z1)];
    if (lados.some((v) => Math.abs(v - lados[0]) > 1e-9)) throw new Error('no es un rombo');
    cuadra.complejo(id, 'Uno de los vértices que faltan', [bueno[0], bueno[1]]);
  });
});

describe('2 · la impropia y el punto medio', () => {
  const id = 'ex1213-ext-2-la-impropia-y-el-punto-medio';

  it('r = 1 se convierte en x = −1', () => {
    /* El cambio es r = 2a/(1−x) con a = 1. Se despeja buscando la raíz. */
    cuadra(id, 'El extremo inferior transformado', raiz((x) => 2 / (1 - x) - 1, -5, 0.9));
  });

  it('y la integral vale exactamente 1/8', () => {
    /* Impropia: se integra hasta muy lejos y se comprueba que converge. */
    const lejos = [100, 1000, 10000].map((L) => integra((r) => 1 / (r + 1) ** 3, 1, L, 1e-13));
    if (!(lejos[0] < lejos[1] && lejos[1] < lejos[2])) throw new Error('no crece hacia el límite');
    cuadra(id, 'El valor exacto', lejos[2]);
  });
});

describe('3 · enunciar y demostrar Lagrange', () => {
  it('el teorema garantiza al menos un punto', () => {
    /* Es una pregunta de enunciado, no de cálculo. Lo que se puede comprobar
       es que «al menos uno» no se queda corto: hay funciones con exactamente
       uno, así que no se puede garantizar más. */
    const f = (x: number) => x * x;
    const media = (f(1) - f(0)) / 1;
    let cuantos = 0;
    let ultimo = 0;
    for (let x = 0.001; x < 1; x += 0.0005) {
      const s = Math.sign(deriva(f, x) - media);
      if (s !== 0 && ultimo !== 0 && s !== ultimo) cuantos++;
      if (s !== 0) ultimo = s;
    }
    cuadra('ex1213-ext-3-enunciar-y-demostrar-lagrange', 'Cuántos puntos garantiza el teorema', cuantos);
  });
});

describe('4 · dos integrales con truco', () => {
  const id = 'ex1213-ext-4-dos-integrales-con-truco';

  it('la raíz mayor del denominador es 5', () => {
    /* u² − 6u + 5, con u = sen x. */
    cuadra(id, 'Las raíces del denominador', raiz((u) => u * u - 6 * u + 5, 3, 9));
  });

  it('y la integral definida vale 0,247', () =>
    cuadra(
      id,
      'La integral definida del apartado b)',
      integra((x) => x / (x * x + x + 1), 0, 1, 1e-13),
    ));
});

describe('5 · el factor de potencias y el cadáver', () => {
  const id = 'ex1213-ext-5-el-factor-de-potencias-y-el-cadaver';

  it('el exponente de la x es −2', () => {
    /* Con el factor x^n y^m la EDO tiene que quedar exacta. Se comprueba que
       con n = −2 y m = 0 lo es, en varios puntos. */
    const n = -2;
    const m = 0;
    const M = (x: number, y: number) => x ** n * y ** m * y;
    const N = (x: number, y: number) => x ** n * y ** m * (x * x * y * y - x);
    const e = 1e-5;
    for (const [x, y] of [[1, 2], [2, 0.5], [0.7, 1.3]] as [number, number][]) {
      const My = (M(x, y + e) - M(x, y - e)) / (2 * e);
      const Nx = (N(x + e, y) - N(x - e, y)) / (2 * e);
      if (Math.abs(My - Nx) > 1e-4) throw new Error(`no queda exacta en (${x}, ${y})`);
    }
    cuadra(id, 'El exponente de la x', n);
  });

  it('y murió 2,5685 horas antes de las doce', () => {
    /* Enfriamiento de Newton: T = 20 + Ce^{−kt}, con T(0) = 26 y T(1) = 24,
       tomando t = 0 a las 12:00. La muerte es cuando T = 37. */
    const C = 26 - 20;
    const k = raiz((v) => 20 + C * Math.exp(-v) - 24, 0.01, 5);
    const T = (t: number) => 20 + C * Math.exp(-k * t);
    if (Math.abs(T(0) - 26) > 1e-9 || Math.abs(T(1) - 24) > 1e-9)
      throw new Error('el modelo no pasa por las dos medidas');
    const t = raiz((v) => T(v) - 37, -10, -0.01);
    cuadra(id, 'La hora de la muerte', -t);
  });
});

describe('6 · el paraboloide dentro de la esfera', () => {
  const id = 'ex1213-ext-6-el-paraboloide-dentro-de-la-esfera';
  /* r² = 3z y r² + z² = 4: igualando, 3z + z² = 4. */
  const zc = raiz((z) => 3 * z + z * z - 4, 0, 3);

  it('se cortan a un radio de √3', () => cuadra(id, 'El radio del corte', Math.sqrt(3 * zc)));

  it('y el volumen es 9,948', () => {
    /* Rebanadas: por debajo del corte manda el paraboloide, r² = 3z; por
       encima, la esfera, r² = 4 − z². */
    const abajo = Math.PI * integra((z) => 3 * z, 0, zc, 1e-12);
    const arriba = Math.PI * integra((z) => 4 - z * z, zc, 2, 1e-12);
    cuadra(id, 'El volumen', abajo + arriba);
  });
});

describe('7 · la antitransformada por dos caminos', () => {
  const id = 'ex1213-ext-7-la-antitransformada-por-dos-caminos';
  const f = (t: number) => t * Math.exp(-t);

  it('vale 1/e en t = 1', () => cuadra(id, 'El valor en t = 1', f(1)));

  it('y su máximo está en t = 1', () => cuadra(id, 'Dónde tiene su máximo', maximiza(f, 0.01, 10).x));
});

describe('8 · el campo con dos rectas prohibidas', () => {
  const id = 'ex1213-ext-8-el-campo-con-dos-rectas-prohibidas';
  const R = 2;

  it('el integrando falla en cuatro puntos de la curva', () => {
    /* Las rectas x = −1 e y = −1 cortan a la circunferencia de radio 2. Se
       cuentan los cortes de verdad. */
    const cortes: number[][] = [];
    for (const y of [Math.sqrt(R * R - 1), -Math.sqrt(R * R - 1)]) cortes.push([-1, y]);
    for (const x of [Math.sqrt(R * R - 1), -Math.sqrt(R * R - 1)]) cortes.push([x, -1]);
    for (const p of cortes)
      if (Math.abs(Math.hypot(...(p as [number, number])) - R) > 1e-9)
        throw new Error(`${p} no está en la circunferencia`);
    /* Y que sean cuatro distintos: si la circunferencia fuese más pequeña,
       las rectas la cortarían en menos sitios o en el mismo. */
    const distintos = new Set(cortes.map((p) => p.map((v) => v.toFixed(9)).join(',')));
    cuadra(id, 'Dónde falla el integrando', distintos.size);
  });

  it('y la integral, como valor principal, es cero', () => {
    /* El integrando es d[ln|x+1|] + d[ln|y+1|]: un diferencial exacto. Sobre
       una curva cerrada que vuelve al punto de partida, la suma se cancela.
       Se comprueba integrando por trozos entre las singularidades. */
    const F = (t: number) => Math.log(Math.abs(R * Math.cos(t) + 1)) + Math.log(Math.abs(R * Math.sin(t) + 1));
    /* Los ángulos de los cuatro puntos malos, ordenados. */
    const malos = [
      Math.atan2(Math.sqrt(3), -1),
      Math.atan2(-Math.sqrt(3), -1),
      Math.atan2(-1, Math.sqrt(3)),
      Math.atan2(-1, -Math.sqrt(3)),
    ]
      .map((a) => (a + 2 * Math.PI) % (2 * Math.PI))
      .sort((a, b) => a - b);
    let total = 0;
    for (let i = 0; i < malos.length; i++) {
      const desde = malos[i];
      const hasta = i + 1 < malos.length ? malos[i + 1] : malos[0] + 2 * Math.PI;
      const eps = 1e-7;
      total += F(hasta - eps) - F(desde + eps);
    }
    cuadra(id, 'El valor de la integral', total);
  });
});
