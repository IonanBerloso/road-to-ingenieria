/**
 * Convocatoria ordinaria de Cálculo, curso 2015-2016. Dieciséis respuestas.
 *
 * Su ejercicio 2 es el único del corpus con cuatro puntos de reconocer y solo
 * dos de cálculo: no va de integrar, va de saber qué significa cada integral.
 * Aquí se reconstruye la curva del dibujo —2 − cos(πt/2), que pasa por nudos
 * enteros— y las tres integrales se calculan de verdad.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { cEntre, deriva, integra, maximiza, raiz, type C } from './numerico';

const cuadra = convocatoria('calculo', '2015-2016-ord');

describe('1 · una circunferencia y un eje', () => {
  const id = 'ex1516-ord-1-una-circunferencia-y-un-eje';
  const w = (z: C): C => cEntre([2 * z[0], 2 * z[1] - 1], [2 - z[1], z[0]]);

  it('la circunferencia tiene radio 0,75', () => {
    /* El lugar donde ω es real. Se recorre la circunferencia propuesta
       —centro (0, 1,25), radio 0,75— y se comprueba que ahí la parte
       imaginaria de ω se anula. */
    const R = 0.75;
    let saltados = 0;
    for (let k = 0; k < 20; k++) {
      const t = (2 * Math.PI * k) / 20;
      const z: C = [R * Math.cos(t), 1.25 + R * Math.sin(t)];
      /* El punto 2i está sobre esta circunferencia Y anula el denominador:
         es el que el enunciado dice que sobra. Se salta, y se cuenta para
         comprobar que es exactamente uno. */
      if (Math.hypot(2 - z[1], z[0]) < 1e-9) {
        saltados++;
        continue;
      }
      if (Math.abs(w(z)[1]) > 1e-9) throw new Error(`en t=${t} la parte imaginaria vale ${w(z)[1]}`);
    }
    if (saltados !== 1) throw new Error(`he saltado ${saltados} puntos, y debería ser uno`);
    cuadra(id, 'El radio de la circunferencia', R);
  });

  it('y el punto que sobra es 2i', () => {
    /* Donde el denominador 2 + iz se anula. */
    const z: C = [0, 2];
    if (Math.abs(2 - z[1]) > 1e-12 || Math.abs(z[0]) > 1e-12)
      throw new Error('el denominador no se anula ahí');
    cuadra(id, 'El punto que sobra en los dos apartados', z[1]);
  });
});

describe('2 · la partícula y sus integrales', () => {
  const id = 'ex1516-ord-2-la-particula-y-sus-integrales';
  /* LECTURA DE LA FIGURA: arranca en 1 m, sube a 3 en t = 2, vuelve a 1 en
     t = 4 y repite: x(t) = 2 − cos(πt/2). */
  const x = (t: number) => 2 - Math.cos((Math.PI * t) / 2);
  const v = (t: number) => deriva(x, t);

  it('la curva pasa por los nudos que dice el dibujo', () => {
    for (const [t, valor] of [[0, 1], [2, 3], [4, 1], [6, 3], [8, 1]] as [number, number][])
      if (Math.abs(x(t) - valor) > 1e-9) throw new Error(`x(${t}) no vale ${valor}`);
  });

  it('la posición media es 2 m', () =>
    cuadra(id, 'La media de la posición', integra(x, 0, 8, 1e-11) / 8));

  it('el desplazamiento del primer segundo es 1 m', () =>
    cuadra(id, 'El desplazamiento del primer segundo', integra(v, 0, 1, 1e-9)));

  it('y la aceleración media entre 2 y 6 es cero', () => {
    const a = (t: number) => deriva(v, t, 1e-3);
    cuadra(id, 'La aceleración media', integra(a, 2, 6, 1e-6) / 4);
  });
});

describe('3 · cuál es efe y cuál su derivada', () => {
  const id = 'ex1516-ord-3-cual-es-efe-y-cual-su-derivada';
  const Fp = (x: number) =>
    x ** 4 / 4 - (4 / 3) * x ** 3 + 0.74 * x * x - 0.144 * x + 3.2474;
  /* F pasa por el origen, así que F(x) = ∫₀ˣ F′. */
  const F = (x: number) => integra(Fp, 0, x, 1e-12);

  it('el máximo de F está en 1,85', () => {
    /* Donde F′ se anula pasando de positiva a negativa. */
    const c = raiz(Fp, 1, 3);
    if (!(Fp(c - 0.1) > 0 && Fp(c + 0.1) < 0)) throw new Error('ahí no hay un máximo');
    cuadra(id, 'Dónde está el máximo', c);
  });

  it('y su otro cero, en 3,1374', () => {
    if (Math.abs(F(0)) > 1e-12) throw new Error('F no pasa por el origen');
    cuadra(id, 'El otro cero de F', raiz(F, 2, 4));
  });
});

describe('4 · una integral impropia por Laplace', () => {
  const id = 'ex1516-ord-4-una-integral-impropia-por-laplace';

  it('el exponente del denominador es 18', () => cuadra(id, 'El denominador', 17 + 1));

  it('y la integral vale 93,241', () => {
    /* 17!/5¹⁸, calculado como producto para no desbordar el double con el
       factorial suelto. */
    let v = 1;
    for (let k = 1; k <= 17; k++) v = (v * k) / 5;
    v /= 5; // el 5^18, uno más que los diecisiete repartidos
    cuadra(id, 'El valor de la integral', v);
  });
});

describe('5 · el cuenco con tapa esférica', () => {
  const id = 'ex1516-ord-5-el-cuenco-con-tapa-esferica';
  const R = Math.sqrt(6);
  /* z = r² y r² + z² = 6 se cortan donde z + z² = 6. */
  const zc = raiz((z) => z + z * z - 6, 0, 5);
  const rc = Math.sqrt(zc);

  it('el casquete parabólico mide 13,614', () =>
    cuadra(
      id,
      'El casquete parabólico',
      2 * Math.PI * integra((r) => Math.sqrt(1 + 4 * r * r) * r, 0, rc, 1e-12),
    ));

  it('y la superficie completa, 20,532', () => {
    /* La tapa es el casquete esférico entre z = zc y z = R, cuya área es
       2πR·h. Se calcula integrando la superficie de revolución, no con la
       fórmula. */
    const parabola = 2 * Math.PI * integra((r) => Math.sqrt(1 + 4 * r * r) * r, 0, rc, 1e-12);
    /* Casquete: z = √(R² − r²), dz/dr = −r/√(R²−r²). */
    const casquete =
      2 *
      Math.PI *
      integra(
        (r) => Math.sqrt(1 + (r * r) / (R * R - r * r)) * r,
        0,
        rc,
        1e-11,
      );
    cuadra(id, 'El área total', parabola + casquete);
  });
});

describe('6 · polinomio más resonancia', () => {
  const id = 'ex1516-ord-6-polinomio-mas-resonancia';
  const e = 1e-4;
  const L = (y: (x: number) => number, x: number) =>
    (y(x + e) - 2 * y(x) + y(x - e)) / (e * e) + 9 * y(x);

  it('el término independiente del polinomio es −2/81', () => {
    const c = -2 / 81;
    const y = (x: number) => x * x / 9 - x / 9 + c;
    for (const x of [-2, 0.5, 3])
      if (Math.abs(L(y, x) - (x * x - x)) > 1e-4) throw new Error(`falla en x=${x}`);
    cuadra(id, 'El término independiente del polinomio', c);
  });

  it('y el resonante lleva A = −13/6', () => {
    const A = -13 / 6;
    const y = (x: number) => x * A * Math.cos(3 * x);
    for (const x of [0.3, 1, 2.4])
      if (Math.abs(L(y, x) - 13 * Math.sin(3 * x)) > 1e-3) throw new Error(`falla en x=${x}`);
    cuadra(id, 'El coeficiente del término resonante', A);
  });
});

describe('7 · el diente de sierra de te', () => {
  const id = 'ex1516-ord-7-el-diente-de-sierra-de-te';

  it('b₁ vale 2', () =>
    cuadra(id, 'El primer armónico', (2 / Math.PI) * integra((t) => t * Math.sin(t), 0, Math.PI, 1e-12)));

  it('S(121π/2) vale π/2', () => {
    /* 121/2 = 60,5, y el periodo son 2 unidades de π: 60,5 mod 2 = 0,5, que
       cae dentro de (−1, 1) en esas unidades, donde f(t) = t. */
    let t = (121 / 2) % 2;
    if (t > 1) t -= 2;
    cuadra(id, 'El valor en el punto raro', t * Math.PI);
  });

  it('y la serie de Leibniz suma π/4', () => {
    let s = 0;
    let previa = 0;
    for (let n = 1; n < 200000; n++) {
      previa = s;
      s += (-1) ** (n - 1) / (2 * n - 1);
    }
    cuadra(id, 'La suma pedida', (s + previa) / 2);
  });
});
