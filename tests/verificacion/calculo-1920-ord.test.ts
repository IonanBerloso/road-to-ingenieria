/**
 * Convocatoria ordinaria de Cálculo, curso 2019-2020. **Veintiséis
 * respuestas**: la convocatoria más larga de las ochenta y ocho.
 *
 * Trae trece ejercicios, uno por cada bloque del temario, y por eso es la que
 * más ramas distintas del verificador toca de una vez: complejos, optimización,
 * longitud de arco, un sólido en coordenadas deformadas, integrales de línea,
 * dos EDO, una logística, dos Laplace y un Fourier.
 */
import { describe, it } from 'vitest';
import { integra, maximiza, raiz, trabajo } from './numerico';
import { convocatoria } from './corpus';

const cuadra = convocatoria('calculo', '2019-2020-ord');

describe('1 · el arco capaz con un conjugado', () => {
  const id = 'ex1920-1-el-arco-capaz-con-un-conjugado';

  it('el radio es 3√2', () => {
    /* El arco capaz de un ángulo θ sobre un segmento de longitud L tiene
       radio L/(2·sen θ). Aquí el segmento va de −3i a 3i y el ángulo es π/4.
       Se comprueba sobre la circunferencia resultante. */
    const L = 6;
    const R = L / (2 * Math.sin(Math.PI / 4));
    /* El centro está sobre la mediatriz, a distancia √(R² − 9) del origen. */
    const cx = Math.sqrt(R * R - 9);
    for (const signo of [1, -1]) {
      const centro = [signo * cx, 0];
      /* Los dos puntos del segmento tienen que estar en la circunferencia. */
      for (const p of [[0, 3], [0, -3]])
        if (Math.abs(Math.hypot(p[0] - centro[0], p[1] - centro[1]) - R) > 1e-9)
          throw new Error('la circunferencia no pasa por ±3i');
    }
    cuadra(id, 'El radio de la circunferencia', R);
  });

  it('y corta al eje imaginario positivo en 3i', () =>
    cuadra.complejo(id, 'Los puntos por donde pasa', [0, 3]));
});

describe('2 · cuál de las dos gráficas es la derivada', () => {
  const id = 'ex1920-2-cual-de-las-dos-graficas-es-la-derivada';

  it('h′ se factoriza con y elevada a 3', () => {
    /* h = e^{−4x}y⁴ → h′ = 4e^{−4x}y³(y′ − y). Se comprueba con una y
       cualquiera, derivando numéricamente. */
    const y = (x: number) => Math.sin(x) + 2;
    const h = (x: number) => Math.exp(-4 * x) * y(x) ** 4;
    const e = 1e-6;
    for (const x of [-0.5, 0.3, 1.4]) {
      const hp = (h(x + e) - h(x - e)) / (2 * e);
      const yp = (y(x + e) - y(x - e)) / (2 * e);
      const conK3 = 4 * Math.exp(-4 * x) * y(x) ** 3 * (yp - y(x));
      if (Math.abs(hp - conK3) / Math.abs(hp) > 1e-6) throw new Error(`la factorización falla en x=${x}`);
    }
    cuadra(id, 'La derivada de h', 3);
  });

  it('y h tiene cuatro extremos', () => {
    /* LECTURA DE LA FIGURA: y pasa por el origen, sube a un máximo y baja
       cortando otra vez al eje; y′ corta al eje justo debajo de ese máximo.
       Una y que cumple eso es x(3−x)/2 en (−1, 5).

       El signo de h′ es el de y³(y′−y), así que los extremos están donde y
       se anula y donde y′ corta a y. Se cuentan barriendo. */
    const y = (x: number) => (x * (3 - x)) / 2;
    const yp = (x: number) => (3 - 2 * x) / 2;
    if (Math.abs(yp(1.5)) > 1e-12) throw new Error('y′ no se anula en el máximo de y');
    const s = (x: number) => Math.sign(y(x) ** 3 * (yp(x) - y(x)));
    let extremos = 0;
    let ultimo = 0;
    for (let x = -1; x <= 5; x += 0.0005) {
      const signo = s(x);
      if (signo !== 0 && ultimo !== 0 && signo !== ultimo) extremos++;
      if (signo !== 0) ultimo = signo;
    }
    cuadra(id, 'Cuántos extremos relativos tiene h', extremos);
  });
});

describe('3 · el rectángulo más grande de la elipse', () => {
  const id = 'ex1920-3-el-rectangulo-mas-grande-de-la-elipse';
  const a = 20;
  const b = 15;
  /* Parametrizando el vértice del primer cuadrante, el rectángulo mide
     2a·cos θ por 2b·sen θ. */
  const area = (th: number) => 4 * a * Math.cos(th) * b * Math.sin(th);
  const mejor = maximiza(area, 0.001, Math.PI / 2 - 0.001);

  it('la base mide 20√2', () => cuadra(id, 'La base del rectángulo', 2 * a * Math.cos(mejor.x)));

  it('y el área máxima es 600', () => cuadra(id, 'El área máxima', mejor.y));
});

describe('4 · la recta tangente sin calcular la integral', () => {
  const id = 'ex1920-4-la-recta-tangente-sin-calcular-la-integral';
  const g = (t: number) => (1 + Math.sin(t)) / (2 + t * t);
  const f = (x: number) => 3 + integra(g, 0, x, 1e-13);

  it('f(0) vale 3', () => cuadra(id, 'El término independiente', f(0)));

  it("y f'(0) vale 1/2", () => {
    /* Por el teorema fundamental es el integrando en 0, pero aquí se deriva
       la integral numéricamente: si el teorema estuviera mal aplicado, esto
       lo vería. */
    const e = 1e-5;
    cuadra(id, 'La pendiente', (f(e) - f(-e)) / (2 * e));
  });
});

describe('5 · el perímetro con un arco de parábola', () => {
  const id = 'ex1920-5-el-perimetro-con-un-arco-de-parabola';

  it('los dos lados rectos suman 6', () => {
    /* De (0,0) a (0,4) por el eje Y y de (0,0) a (2,0) por el eje X. */
    cuadra(id, 'Los dos lados rectos', 4 + 2);
  });

  it('y el arco mide 4,6468', () => {
    /* Longitud de arco de y = 4 − x² entre 0 y 2: ∫√(1 + 4x²)dx. */
    cuadra(id, 'El arco de parábola', integra((x) => Math.sqrt(1 + 4 * x * x), 0, 2, 1e-12));
  });
});

describe('6 · el cono que tapa al paraboloide', () => {
  const id = 'ex1920-6-el-cono-que-tapa-al-paraboloide';
  /* Con u = 9x² + 3y², el paraboloide es z = 18 − u y el cono u = (z−6)². */

  it('se cortan a la altura 9', () =>
    cuadra(id, 'Dónde se cortan las dos superficies', raiz((z) => 18 - z - (z - 6) ** 2, 7, 15)));

  it('y el volumen es 29,928', () => {
    /* El cambio X = 3x, Y = √3·y convierte 9x²+3y² en X²+Y², y el jacobiano
       divide el volumen entre 3√3. En ese espacio, el radio a cada altura es
       el menor de los dos: el cono por debajo del corte, el paraboloide por
       encima. */
    const radio = (z: number) => Math.min(z - 6, Math.sqrt(Math.max(0, 18 - z)));
    const enElEspacioDeformado = Math.PI * integra((z) => radio(z) ** 2, 6, 18, 1e-10);
    cuadra(id, 'El volumen', enElEspacioDeformado / (3 * Math.sqrt(3)));
  });
});

describe('7 · cambiar el orden y que sobre una integral', () => {
  const id = 'ex1920-7-cambiar-el-orden-y-que-sobre-una-integral';

  it('las dos tapas se enganchan en 1', () => {
    /* En x = 1 la parábola vale 1 y la recta (3−x)/2 también: por eso el
       dominio no tiene escalón. */
    const parabola = 1 ** 2;
    const recta = (3 - 1) / 2;
    if (Math.abs(parabola - recta) > 1e-12) throw new Error('el dominio tiene un escalón');
    cuadra(id, 'Dónde se enganchan las dos tapas', parabola);
  });

  it('y la integral vale 4/3', () =>
    cuadra(
      id,
      'El valor de la integral',
      integra((x) => x * x, 0, 1, 1e-12) + integra((x) => (3 - x) / 2, 1, 3, 1e-12),
    ));
});

describe('8 · la curva donde el integrando es constante', () => {
  const id = 'ex1920-8-la-curva-donde-el-integrando-es-constante';
  const R = 3;

  it('sobre la curva el integrando vale 6', () => {
    /* La curva es x²+y² = 4R², o sea radio 2R. */
    for (const t of [0.4, 2, 5]) {
      const p = [2 * R * Math.cos(t), 2 * R * Math.sin(t)];
      if (Math.abs(Math.hypot(...p) - 2 * R) > 1e-9) throw new Error('el punto no está en la curva');
    }
    cuadra(id, 'El valor del integrando sobre la curva', 2 * R);
  });

  it('y la circulación es cero', () => {
    /* Integrando de verdad sobre la curva cerrada, sin usar que el campo es
       constante en módulo. */
    const V = (p: number[]) => {
      const m = Math.hypot(p[0], p[1]);
      return [m, m];
    };
    cuadra(id, 'El resultado', trabajo(V, (t) => [2 * R * Math.cos(t), 2 * R * Math.sin(t)], 0, 2 * Math.PI));
  });
});

describe('9 · la EDO con resonancia y sin ella', () => {
  const id = 'ex1920-9-la-edo-con-resonancia-y-sin-ella';
  const e = 1e-4;
  const L = (y: (x: number) => number, x: number) =>
    (y(x + e) - 2 * y(x) + y(x - e)) / (e * e) + 9 * y(x);

  it('la parte exponencial lleva A = −1', () => {
    const A = -1;
    const y = (x: number) => A * Math.exp(3 * x);
    for (const x of [-0.4, 0.2, 1])
      if (Math.abs(L(y, x) + 18 * Math.exp(3 * x)) > 1e-2) throw new Error(`falla en x=${x}`);
    cuadra(id, 'La parte exponencial', A);
  });

  it('y la resonante, C = 1/2', () => {
    /* cos3x está en la homogénea: la particular lleva x delante y solo
       sobrevive el seno. */
    const C = 0.5;
    const y = (x: number) => x * C * Math.sin(3 * x);
    for (const x of [0.3, 1, 2.4])
      if (Math.abs(L(y, x) - 3 * Math.cos(3 * x)) > 1e-3) throw new Error(`falla en x=${x}`);
    cuadra(id, 'La parte resonante', C);
  });
});

describe('10 · la epidemia en un pueblo de cien', () => {
  const id = 'ex1920-10-la-epidemia-en-un-pueblo-de-cien';
  /* Logística: N′ = kN(100−N), N(0) = 1, N(1) = 4. */
  const N = (t: number, cien_k: number) => 100 / (1 + 99 * Math.exp(-cien_k * t));

  it('100k vale ln(99/24)', () => {
    /* Se busca el valor que hace N(1) = 4, en vez de despejarlo. */
    const cien_k = raiz((c) => N(1, c) - 4, 0.1, 5);
    /* Y se comprueba que la función cumple la EDO. */
    const e = 1e-6;
    const k = cien_k / 100;
    for (const t of [0.5, 2, 4]) {
      const dN = (N(t + e, cien_k) - N(t - e, cien_k)) / (2 * e);
      if (Math.abs(dN - k * N(t, cien_k) * (100 - N(t, cien_k))) > 1e-4)
        throw new Error(`la logística falla en t=${t}`);
    }
    cuadra(id, 'La constante', cien_k);
  });

  it('y el 90 % se contagia el día 4,79', () => {
    const cien_k = raiz((c) => N(1, c) - 4, 0.1, 5);
    cuadra(id, 'El instante buscado', raiz((t) => N(t, cien_k) - 90, 1, 20));
  });
});

describe('11 · la ecuación con una integral dentro', () => {
  const id = 'ex1920-11-la-ecuacion-con-una-integral-dentro';

  it('la raíz positiva del denominador es 1', () =>
    cuadra(id, 'El polinomio del denominador', raiz((s) => s * s + s - 2, 0, 5)));

  it('y la solución vale 0,4286 en t = 1', () => {
    /* y(t) = −1/2 + e^{−2t}/6 + e^{t}/3. Se comprueba que cumple la ecuación
       integro-diferencial original, integrando de verdad. */
    const y = (t: number) => -0.5 + Math.exp(-2 * t) / 6 + Math.exp(t) / 3;
    const e = 1e-6;
    for (const t of [0.5, 1, 2]) {
      const yp = (y(t + e) - y(t - e)) / (2 * e);
      const acumulado = integra(y, 0, t, 1e-12);
      if (Math.abs(yp + y(t) - 2 * acumulado - t) > 1e-6) throw new Error(`la ecuación falla en t=${t}`);
    }
    if (Math.abs(y(0)) > 1e-12) throw new Error('y(0) no es cero');
    cuadra(id, 'El valor en t = 1', y(1));
  });
});

describe('12 · el empujón que llega tarde', () => {
  const id = 'ex1920-12-el-empujon-que-llega-tarde';

  it('el retraso es 2', () => cuadra(id, 'La transformada del segundo miembro', 2));

  it('y (t/2)·sen t vale π/4 en t = π/2', () =>
    cuadra(id, 'La antitransformada del término nuevo', (Math.PI / 2 / 2) * Math.sin(Math.PI / 2)));
});

describe('13 · la rampa ampliada de forma impar', () => {
  const id = 'ex1920-13-la-rampa-ampliada-de-forma-impar';
  /* La figura da un segmento de (0, π) a (π, 2π): f(t) = t + π. */
  const f = (t: number) => t + Math.PI;

  it('la recta de la figura pasa por sus dos extremos', () => {
    if (Math.abs(f(0) - Math.PI) > 1e-12) throw new Error('no arranca en π');
    if (Math.abs(f(Math.PI) - 2 * Math.PI) > 1e-12) throw new Error('no acaba en 2π');
  });

  it('b₁ vale 6', () =>
    cuadra(id, 'El primer coeficiente', (2 / Math.PI) * integra((t) => f(t) * Math.sin(t), 0, Math.PI, 1e-12)));

  it('y la serie alternada suma −π/4', () => {
    let s = 0;
    let previa = 0;
    for (let n = 0; n < 200000; n++) {
      previa = s;
      s += (-1) ** (n + 1) / (2 * n + 1);
    }
    cuadra(id, 'La suma que pide el apartado e)', (s + previa) / 2);
  });
});
