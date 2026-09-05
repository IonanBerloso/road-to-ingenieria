/**
 * Las terceras evaluaciones de Cálculo de 2016-2017 y 2017-2018. Dieciocho
 * respuestas entre las dos.
 *
 * El ejercicio 1 de 2016-2017 tiene la condición geométrica más fácil de
 * pasar por alto: hay dos triángulos equiláteros posibles sobre el mismo lado
 * y solo uno tiene **los tres vértices en el tercer cuadrante**. El test
 * construye los dos y descarta el que se sale.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { deriva, deriva2, integra, maximiza, raiz } from './numerico';

const cuadra1718 = convocatoria('calculo', '2017-2018-3ev');
const cuadra1617 = convocatoria('calculo', '2016-2017-3ev');

describe('2017-2018 · 1 · cubo igual a menos el módulo', () => {
  const id = 'ex1718-3ev-1-cubo-igual-a-menos-el-modulo';

  it('hay cuatro soluciones', () => {
    /* z³ = −|z|. El cero, y las tres de módulo 1 con 3θ = π + 2kπ. Se
       comprueban una a una. */
    const soluciones: [number, number][] = [[0, 0]];
    for (let k = 0; k < 3; k++) {
      const th = Math.PI / 3 + (2 * Math.PI * k) / 3;
      soluciones.push([Math.cos(th), Math.sin(th)]);
    }
    for (const [x, y] of soluciones) {
      const r = Math.hypot(x, y);
      const th = Math.atan2(y, x);
      const cubo = [r ** 3 * Math.cos(3 * th), r ** 3 * Math.sin(3 * th)];
      if (Math.hypot(cubo[0] + r, cubo[1]) > 1e-9) throw new Error(`(${x}, ${y}) no cumple`);
    }
    cuadra1718(id, 'Cuántas soluciones hay', soluciones.length);
  });

  it('y la real no nula es −1', () => cuadra1718(id, 'La solución real no nula', Math.cos(Math.PI)));
});

describe('2017-2018 · 2 · suma de la geométrica', () => {
  it('desde el tercer término la suma vale 1/4', () => {
    /* Se suma de verdad y se compara con r³/(1−r). */
    const r = 0.5;
    let s = 0;
    for (let n = 3; n <= 300; n++) s += r ** n;
    if (Math.abs(s - r ** 3 / (1 - r)) > 1e-12) throw new Error('no cuadra con la fórmula');
    cuadra1718('ex1718-3ev-2-suma-de-la-geometrica', 'La suma desde el tercer término', s);
  });
});

describe('2017-2018 · 3 · definiciones y punto fijo', () => {
  it('el punto fijo de 1 + x/3 en [1,2] es 1,5', () => {
    const f = (x: number) => 1 + x / 3;
    /* Se comprueban las hipótesis del teorema: f lleva [1,2] dentro de sí
       mismo. */
    if (!(f(1) >= 1 && f(2) <= 2)) throw new Error('f se sale del intervalo');
    cuadra1718('ex1718-3ev-3-definiciones-y-punto-fijo', 'Un punto fijo concreto', raiz((x) => f(x) - x, 1, 2));
  });
});

describe('2017-2018 · 4 · serie del logaritmo y la armónica', () => {
  const id = 'ex1718-3ev-4-serie-del-logaritmo-y-la-armonica';

  it('c₄ vale −1/4', () => {
    /* ln(2−x) alrededor de x = 1 es ln(1−u) con u = x−1, o sea −Σuⁿ/n. Se
       comprueba que la serie truncada reproduce la función. */
    const c = (n: number) => -1 / n;
    const parcial = (u: number) => {
      let s = 0;
      for (let n = 1; n <= 400; n++) s += c(n) * u ** n;
      return s;
    };
    if (Math.abs(parcial(0.4) - Math.log(2 - 1.4)) > 1e-9) throw new Error('la serie no reproduce');
    cuadra1718(id, 'El coeficiente general', c(4));
  });

  it('y la armónica alternada suma ln 2', () => {
    let s = 0;
    let previa = 0;
    for (let n = 1; n < 200000; n++) {
      previa = s;
      s += (-1) ** (n + 1) / n;
    }
    cuadra1718(id, 'La suma pedida', (s + previa) / 2);
  });
});

describe('2017-2018 · 5 · parábola, recta y eje', () => {
  const id = 'ex1718-3ev-5-parabola-recta-y-eje';

  it('se cortan en x = 2', () =>
    cuadra1718(id, 'El corte entre la parábola y la recta', raiz((x) => x * x - (6 - x), 0, 5)));

  it('y el área es 22/3', () =>
    cuadra1718(id, 'El área', integra((x) => 6 - x - x * x, 0, 2, 1e-12)));
});

describe('2017-2018 · 6 · integral con tangente', () => {
  const id = 'ex1718-3ev-6-integral-con-tangente';

  it('el denominador queda t²(t² + 4)', () => {
    /* Con t = tan x, tan²x + 3sen²x pasa a t²(t²+4)/(1+t²), y el dx aporta
       otro 1/(1+t²) que se cancela con el numerador. */
    const k = 4;
    for (const x of [0.4, 1.1, 2.6]) {
      const original = Math.tan(x) ** 2 + 3 * Math.sin(x) ** 2;
      const t = Math.tan(x);
      if (Math.abs(original - (t * t * (t * t + k)) / (1 + t * t)) > 1e-9)
        throw new Error(`la reducción falla en x=${x}`);
    }
    cuadra1718(id, 'El denominador tras el cambio', k);
  });

  it('y el arcotangente lleva −1/8', () => {
    /* 1/(t²(t²+4)) = (1/4)/t² − (1/4)/(t²+4), y el segundo integra a
       −(1/8)arctan(t/2). Se comprueba que la primitiva propuesta deriva al
       integrando. */
    const C0 = -1 / 8;
    const F = (t: number) => -1 / (4 * t) + C0 * Math.atan(t / 2);
    const g = (t: number) => 1 / (t * t * (t * t + 4));
    for (const t of [0.7, 1.5, 4])
      if (Math.abs(deriva(F, t) - g(t)) > 1e-6) throw new Error(`no es primitiva en t=${t}`);
    cuadra1718(id, 'El coeficiente del arcotangente', C0);
  });
});

describe('2016-2017 · 1 · triángulo y fundamental', () => {
  const id = 'ex1617-3ev-1-triangulo-y-fundamental';
  const z1 = [-3, -1];
  const z2 = [-1, -2];
  const lado = Math.hypot(z2[0] - z1[0], z2[1] - z1[1]);

  it('el lado mide √5', () => cuadra1617(id, 'El lado del triángulo', lado));

  it('y el tercer vértice está en el tercer cuadrante', () => {
    /* Hay dos equiláteros posibles, uno a cada lado. Solo uno tiene los tres
       vértices en el tercer cuadrante, y el test lo elige comprobándolo. */
    const medio = [(z1[0] + z2[0]) / 2, (z1[1] + z2[1]) / 2];
    const u = [(z2[0] - z1[0]) / lado, (z2[1] - z1[1]) / lado];
    const altura = (Math.sqrt(3) / 2) * lado;
    const candidatos = [
      [medio[0] - altura * u[1], medio[1] + altura * u[0]],
      [medio[0] + altura * u[1], medio[1] - altura * u[0]],
    ];
    const enElTercero = candidatos.filter((p) => p[0] < 0 && p[1] < 0);
    if (enElTercero.length !== 1) throw new Error('no hay exactamente un vértice en el tercer cuadrante');
    /* Y que el triángulo sea equilátero de verdad. */
    const z3 = enElTercero[0];
    for (const v of [z1, z2])
      if (Math.abs(Math.hypot(z3[0] - v[0], z3[1] - v[1]) - lado) > 1e-9)
        throw new Error('no es equilátero');
    cuadra1617(id, 'El tercer vértice', z3[0]);
  });
});

describe('2016-2017 · 2 · dos demostraciones', () => {
  it('la segunda derivada de la inversa vale −1', () => {
    /* (y⁻¹)″ = −y″/(y′)³. Se comprueba la fórmula sobre una función concreta
       con esas derivadas en el punto. */
    const y = (x: number) => 5 - 2 * (x - 1) - 4 * (x - 1) ** 2;
    if (Math.abs(deriva(y, 1) + 2) > 1e-6 || Math.abs(deriva2(y, 1) + 8) > 1e-5)
      throw new Error('la función de prueba no tiene esas derivadas');
    /* El intervalo arranca en 0,8 y no antes: la parábola tiene su máximo en
       x = 0,75, y a la izquierda deja de ser inyectiva. */
    const yinv = (v: number) => raiz((x) => y(x) - v, 0.8, 1.5);
    cuadra1617('ex1617-3ev-2-dos-demostraciones', 'La segunda derivada de la inversa', deriva2(yinv, 5, 0.02));
  });
});

describe('2016-2017 · 3 · raíz cúbica de nueve', () => {
  const id = 'ex1617-3ev-3-raiz-cubica-de-nueve';
  const y = (x: number) => Math.cbrt(x + 8);

  it('el coeficiente lineal es 1/12', () => cuadra1617(id, 'El coeficiente lineal', deriva(y, 0)));

  it('y la cota del error son 2,01 cienmilésimas', () => {
    /* Resto de Lagrange de orden 3: máx|y⁗|·|x|⁴/4! en [0,1]. La cuarta
       derivada se saca derivando la tercera numéricamente. */
    const cuarta = (x: number) => {
      const h = 0.05;
      const d3 = (p: number) =>
        (y(p + 2 * h) - 2 * y(p + h) + 2 * y(p - h) - y(p - 2 * h)) / (2 * h ** 3);
      return (d3(x + h) - d3(x - h)) / (2 * h);
    };
    let M = 0;
    for (let x = 0; x <= 1; x += 0.01) M = Math.max(M, Math.abs(cuarta(x)));
    cuadra1617(id, 'La cota del error', (M / 24) * 1e5);
  });
});

describe('2016-2017 · 4 · el lazo', () => {
  const id = 'ex1617-3ev-4-el-lazo';
  /* 9y² = x(3−x)², o sea y = ±√x·(3−x)/3 en [0,3]. */
  const y = (x: number) => (Math.sqrt(x) * (3 - x)) / 3;

  it('el lazo sube hasta 2/3', () => cuadra1617(id, 'La altura máxima del lazo', maximiza(y, 0.001, 3).y));

  it('y encierra 2,7713', () => {
    /* El área es el doble de la de arriba. La raíz tiene derivada infinita en
       x = 0, así que hay que apartarse de ese extremo. */
    cuadra1617(id, 'El área', 2 * integra(y, 1e-12, 3, 1e-11));
  });
});

describe('2016-2017 · 5 · convergencia y la derivada de x', () => {
  it('la segunda sucesión converge a −2', () => {
    /* Los cincuenta primeros términos no cuentan para el límite: lo que
       decide es la cola. Se mira muy lejos. */
    const a = (n: number) => (n < 50 ? 2 + 1 / n : -2 - 1 / n);
    const lejos = [1000, 100000, 10000000].map(a);
    if (Math.abs(lejos[2] - lejos[1]) > 1e-4) throw new Error('no se estabiliza');
    cuadra1617('ex1617-3ev-5-convergencia-y-la-derivada-de-x', 'El límite de la segunda', lejos[2]);
  });
});
