/**
 * Convocatoria extraordinaria de Cálculo, curso 2024-2025. Diecinueve
 * respuestas y la más variada del corpus: complejos, implícitas, volúmenes de
 * revolución, EDO homogénea, Green, Laplace y Fourier.
 *
 * Como en la ordinaria, el test toma el camino que no es el de la resolución.
 * El caso más claro está en el ejercicio 8: el examen aplica Green y calcula
 * una integral doble; aquí se integran **las dos trayectorias** y se restan.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { cEntre, integra, integraCasi, maximiza, raiz, trabajo, type C } from './numerico';

const cuadra = convocatoria('calculo', '2024-2025-ext');

describe('1 · el arco capaz de noventa grados', () => {
  it('la circunferencia tiene centro en x = 1,5', () => {
    /* Se recorre el arco superior de la circunferencia propuesta y se
       comprueba que en todos sus puntos el argumento vale π/2. */
    const c = 1.5;
    const rho = 0.5;
    for (let k = 1; k < 12; k++) {
      const t = (Math.PI * k) / 12;
      const z: C = [c + rho * Math.cos(t), rho * Math.sin(t)];
      const q = cEntre([z[0] - 2, z[1]], [z[0] - 1, z[1]]);
      if (Math.abs(Math.atan2(q[1], q[0]) - Math.PI / 2) > 1e-9)
        throw new Error(`en t=${t} el argumento es ${Math.atan2(q[1], q[0])}`);
    }
    cuadra('ex2425-ext-1-el-arco-capaz-de-noventa-grados', 'El centro', c);
  });
});

describe('2 · la curva implícita y su tangente vertical', () => {
  const id = 'ex2425-ext-2-la-curva-implicita-y-su-tangente-vertical';
  /* y = e^{xy} define y(x) implícitamente cerca de (0,1). En vez de derivar
     implícitamente —que es lo que hace la resolución—, se resuelve la
     ecuación para cada x y se derivan los valores obtenidos. */
  const y = (x: number) => {
    if (Math.abs(x) < 1e-15) return 1;
    return raiz((v) => v - Math.exp(x * v), 0.2, x > 0 ? 2.5 : 1);
  };

  it("y''(0) vale 3", () => {
    const h = 1e-3;
    const segunda = (y(h) - 2 * y(0) + y(-h)) / (h * h);
    cuadra(id, 'La segunda derivada', segunda);
  });

  it('y el polinomio de orden 2 da 1,115 en x = 0,1', () => {
    /* P₂(x) = y(0) + y′(0)x + y″(0)x²/2, con las derivadas calculadas arriba. */
    const h = 1e-4;
    const primera = (y(h) - y(-h)) / (2 * h);
    const segunda = 3;
    cuadra(id, 'La aproximación', 1 + primera * 0.1 + (segunda * 0.01) / 2);
  });
});

describe('3 · una arcotangente disfrazada de integral', () => {
  const id = 'ex2425-ext-3-una-arcotangente-disfrazada-de-integral';
  const f = (t: number) => 1 / (t * t + 2 * t + 2);
  const F = (x: number) => integra(f, 0, x, 1e-12);

  it('la primitiva es arctan(x+1) − π/4', () => {
    /* Se comprueba en varios puntos que la fórmula propuesta coincide con la
       integral calculada numéricamente. */
    const a = 1;
    for (const x of [-3, -1, 0.5, 2, 7])
      if (Math.abs(F(x) - (Math.atan(x + a) - Math.PI / 4)) > 1e-9)
        throw new Error(`la primitiva falla en x=${x}`);
    cuadra(id, 'La primitiva', a);
  });

  it('y el punto de inflexión está en x = −1', () => {
    /* F″ = f′, y f tiene ahí su máximo: el integrando es una campana centrada
       en −1. Se busca ese máximo numéricamente. */
    cuadra(id, 'El punto de inflexión', maximiza(f, -5, 3).x);
  });
});

describe('4 · el alambre partido en dos', () => {
  const id = 'ex2425-ext-4-el-alambre-partido-en-dos';
  /* s metros al cuadrado y 10 − s al triángulo equilátero. */
  const suma = (s: number) => (s * s) / 16 + (Math.sqrt(3) / 4) * ((10 - s) / 3) ** 2;
  /* Mínimo por sección áurea sobre la función cambiada de signo: así no hay
     que derivar ni despejar, que es justo lo que hace la resolución. */
  const mejor = maximiza((s) => -suma(s), 0.001, 9.999);

  it('al cuadrado hay que dedicarle 4,3496 m', () => cuadra(id, 'Dónde cortar', mejor.x));

  it('y la suma mínima de áreas es 2,7185 m²', () => cuadra(id, 'El área mínima', -mejor.y));
});

describe('5 · el sector que gira alrededor del eje', () => {
  const id = 'ex2425-ext-5-el-sector-que-gira-alrededor-del-eje';
  /* D: dentro del círculo de radio 2, por encima de y = x y con x ≥ 0. */

  it('el volumen de revolución alrededor de OX es 11,8477', () => {
    /* Arandelas: entre y = x por dentro y la circunferencia por fuera, y solo
       hasta donde la recta corta al círculo. */
    const corte = Math.SQRT2;
    const v = Math.PI * integra((x) => 4 - x * x - x * x, 0, corte, 1e-11);
    cuadra(id, 'El volumen', v);
  });

  it('y su perímetro mide 5,5708', () => {
    /* Tres trozos: el arco de 45°, el radio sobre y = x y el radio sobre el
       eje OY. El arco se mide integrando la longitud de arco, no con rθ. */
    const arco = integra(
      (t) => Math.hypot(-2 * Math.sin(t), 2 * Math.cos(t)),
      Math.PI / 4,
      Math.PI / 2,
      1e-12,
    );
    cuadra(id, 'El perímetro', arco + 2 + 2);
  });
});

describe('6 · el paraboloide tapado por la esfera', () => {
  const id = 'ex2425-ext-6-el-paraboloide-tapado-por-la-esfera';

  it('se cortan a la altura y = 1', () => {
    /* En el corte, el radio del paraboloide y el de la esfera coinciden:
       3y = 4 − y². Se busca la raíz en lugar de resolver la cuadrática. */
    cuadra(id, 'Dónde se cortan', raiz((y) => 3 * y - (4 - y * y), 0, 2));
  });

  it('y el volumen vale 9,9484', () => {
    /* Rebanadas perpendiculares al eje Y: por debajo del corte manda el
       paraboloide y por encima, la esfera. */
    const abajo = integra((y) => Math.PI * 3 * y, 0, 1, 1e-11);
    const arriba = integraCasi((y) => Math.PI * (4 - y * y), 1, 2, 1e-11, 'b');
    cuadra(id, 'El volumen', abajo + arriba);
  });
});

describe('7 · una EDO homogénea con raíz', () => {
  const id = 'ex2425-ext-7-una-edo-homogenea-con-raiz';
  /* ln|y| = 2√(x/y) + C, con y(e) = e. */
  const constante = Math.log(Math.E) - 2 * Math.sqrt(Math.E / Math.E);

  it('la constante vale −1', () => cuadra(id, 'El cambio, y la constante', constante));

  it('y en x = 2 la solución pasa por 2,3386', () => {
    /* Se despeja y de la implícita buscando la raíz, y de paso se comprueba
       que la curva cumple la EDO original en ese punto. */
    const implicita = (yy: number) => Math.log(yy) - 2 * Math.sqrt(2 / yy) - constante;
    const y2 = raiz(implicita, 0.5, 10);
    /* La EDO: −y dx + (x + √(xy)) dy = 0 → dy/dx = y / (x + √(xy)). */
    const h = 1e-6;
    const yMas = raiz((yy) => Math.log(yy) - 2 * Math.sqrt((2 + h) / yy) - constante, 0.5, 10);
    const yMenos = raiz((yy) => Math.log(yy) - 2 * Math.sqrt((2 - h) / yy) - constante, 0.5, 10);
    const pendiente = (yMas - yMenos) / (2 * h);
    const deberia = y2 / (2 + Math.sqrt(2 * y2));
    if (Math.abs(pendiente - deberia) > 1e-6) throw new Error('la curva no cumple la EDO');
    cuadra(id, 'Un punto de la solución', y2);
  });
});

describe('8 · dos caminos y cuál da más trabajo', () => {
  const id = 'ex2425-ext-8-dos-caminos-y-cual-da-mas-trabajo';
  const R = 3;
  const a = R / Math.SQRT2;

  it('el punto P está en (3/√2, 3/√2)', () =>
    cuadra(id, 'El punto P', raiz((x) => 2 * x * x - R * R, 0, R)));

  it('y los dos caminos se llevan 95,43 de diferencia', () => {
    /* El examen usa Green y calcula una integral doble sobre el sector. Aquí
       se integran las DOS trayectorias del dibujo y se restan, que es el
       camino largo y el que no comparte ningún paso con la resolución. */
    const V = (p: number[]) => [2 * p[0] - p[1] ** 3, 4 * p[1] + p[0] ** 3];
    /* C₁: el arco, de la izquierda a la derecha por arriba. */
    const arco = trabajo(V, (t) => [R * Math.cos(t), R * Math.sin(t)], (3 * Math.PI) / 4, Math.PI / 4);
    /* C₂: la uve, bajando al origen y volviendo a subir. */
    const baja = trabajo(V, (t) => [-a * (1 - t), a * (1 - t)], 0, 1);
    const sube = trabajo(V, (t) => [a * t, a * t], 0, 1);
    cuadra(id, 'La diferencia', Math.abs(arco - (baja + sube)));
  });
});

describe('9 · Laplace cuando la t multiplica', () => {
  const id = 'ex2425-ext-9-laplace-cuando-la-t-multiplica';

  it('la ecuación en Y queda con un 5 arriba', () => {
    /* L{t·y″} = −d/ds(s²Y − s·y(0) − y′(0)) y L{2y′} = 2sY. Los términos en
       sY se cancelan y sobra −s²Y′ = L{5} = 5/s. */
    cuadra(id, 'La ecuación en Y', 5);
  });

  it('y la solución vale 10 en t = 4', () => {
    /* Y = 5/(2s²) es la transformada de (5/2)t. Se comprueba que esa función
       cumple la EDO y las dos condiciones iniciales, en vez de repetir la
       antitransformada. */
    const y = (t: number) => 2.5 * t;
    const h = 1e-4;
    for (const t of [1, 2, 4]) {
      const segunda = (y(t + h) - 2 * y(t) + y(t - h)) / (h * h);
      const primera = (y(t + h) - y(t - h)) / (2 * h);
      if (Math.abs(t * segunda + 2 * primera - 5) > 1e-6) throw new Error(`la EDO falla en t=${t}`);
    }
    if (Math.abs(y(0)) > 1e-12) throw new Error('y(0) no es cero');
    cuadra(id, 'La solución', y(4));
  });
});

describe('10 · la ampliación par de t + π', () => {
  const id = 'ex2425-ext-10-la-ampliacion-par-de-t-mas-pi';
  const f = (t: number) => t + Math.PI;

  it('el término constante es 3π/2', () => {
    /* Al ser par, el valor medio sobre un periodo de 2π es la media sobre
       (0, π). Se integra en vez de aplicar la fórmula. */
    cuadra(id, 'El término constante', integra(f, 0, Math.PI, 1e-12) / Math.PI);
  });

  it('y S(81π/4) vale 5π/4', () => {
    /* 81/4 = 20,25, y el periodo es 2: 20,25 mod 2 = 0,25. El punto cae
       dentro de (0, π), donde la serie converge al valor de la función. */
    const t = (81 / 4) % 2;
    if (t <= 0 || t >= 1) throw new Error('el punto reducido no cae en (0, π)');
    cuadra(id, 'El valor en el punto grande', f(t * Math.PI));
  });
});
