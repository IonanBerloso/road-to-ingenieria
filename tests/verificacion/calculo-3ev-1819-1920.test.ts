/**
 * Las terceras evaluaciones de Cálculo de 2018-2019 y 2019-2020. Veintiuna
 * respuestas entre las dos.
 *
 * El ejercicio 1 de 2019-2020 es el más bonito de los dos: dos discos que se
 * solapan, y sus dos bordes pasan **por el mismo punto**, z = i, que es
 * justamente el que las condiciones excluyen. El test encuentra los dos
 * vértices cortando las circunferencias, sin suponer cuáles son.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { deriva, deriva2, deriva3, integra, raiz } from './numerico';

const cuadra1920 = convocatoria('calculo', '2019-2020-3ev');
const cuadra1819 = convocatoria('calculo', '2018-2019-3ev');

describe('2019-2020 · 1 · dos discos que se solapan', () => {
  const id = 'ex1920-3ev-1-dos-discos-que-se-solapan';
  /* Con w = z − i: Re(1/w) > 1/4 es el disco (u−2)² + v² < 4, e Im(1/w) > 1/4
     es u² + (v+2)² < 4. Los dos de radio 2. */

  it('los dos discos tienen radio 2', () => {
    const R = 2;
    let saltados = 0;
    for (let k = 0; k < 12; k++) {
      const t = (2 * Math.PI * k) / 12;
      const u = 2 + R * Math.cos(t);
      const v = R * Math.sin(t);
      /* El borde pasa por w = 0 —que es z = i—, donde 1/w no existe. Es el
         punto que las dos condiciones excluyen y uno de los dos vértices de
         la región. Se salta, y tiene que ser exactamente uno. */
      if (Math.hypot(u, v) < 1e-9) {
        saltados++;
        continue;
      }
      const re = u / (u * u + v * v);
      if (Math.abs(re - 0.25) > 1e-9) throw new Error(`en t=${t} la parte real vale ${re}`);
    }
    if (saltados !== 1) throw new Error(`he saltado ${saltados} puntos, y debería ser uno`);
    cuadra1920(id, 'El radio de los discos', R);
  });

  it('y el otro vértice tiene parte real 2', () => {
    /* Los dos bordes se cortan donde u² + v² = 4u y u² + v² = −4v, o sea
       v = −u. Se busca la solución no nula y se pasa de w a z. */
    const u = raiz((x) => x * x + x * x - 4 * x, 0.5, 10);
    const v = -u;
    const z = [u, v + 1];
    /* Comprobación: el punto está en los dos bordes. */
    if (Math.abs(u / (u * u + v * v) - 0.25) > 1e-9 || Math.abs(-v / (u * u + v * v) - 0.25) > 1e-9)
      throw new Error('el vértice no está en los dos bordes');
    cuadra1920(id, 'Los vértices de la región', z[0]);
  });
});

describe('2019-2020 · 2 · raíz de dos por Taylor', () => {
  const id = 'ex1920-3ev-2-raiz-de-dos-por-taylor';
  const f = (x: number) => Math.sqrt(x);

  it('el polinomio da 1,375 para √2', () => {
    const P2 = (x: number) => f(1) + deriva(f, 1) * (x - 1) + (deriva2(f, 1) * (x - 1) ** 2) / 2;
    cuadra1920(id, 'La aproximación', P2(2));
  });

  it('y la cota del error es 1/16', () => {
    /* Resto de Lagrange: máx|f‴| en [1,2] por |x−1|³/3!. El máximo se busca
       barriendo. */
    let M = 0;
    for (let x = 1; x <= 2; x += 1e-3) M = Math.max(M, Math.abs(deriva3(f, x)));
    cuadra1920(id, 'La cota del error', M / 6);
  });
});

describe('2019-2020 · 3 · identificar las tres gráficas', () => {
  it('y(x) es la curva 2', () => {
    /* LECTURA DE LA FIGURA: la 1 entra muy alta y baja cortando el eje; la 2
       entra poco por encima, sube a un máximo y baja hasta tocar el eje en el
       origen; la 3 entra muy por debajo, sube cortando el eje y vuelve a
       bajar. Solo la 2 tiene su máximo justo donde la 1 corta al eje, que es
       lo que obliga a que la 1 sea su derivada. */
    const cual = { '1': "y'", '2': 'y', '3': "y''" };
    const deY = Object.entries(cual).find(([, papel]) => papel === 'y')![0];
    cuadra1920('ex1920-3ev-3-identificar-las-tres-graficas', 'Cuál es la función', Number(deY));
  });
});

describe('2019-2020 · 4 · Barrow otra vez', () => {
  it('la constante de la primitiva desplazada se cancela', () => {
    const G = (x: number) => Math.log(x) + 7;
    const porBarrow = G(4) - G(1);
    const porCuadratura = integra((x) => 1 / x, 1, 4, 1e-12);
    if (Math.abs(porBarrow - porCuadratura) > 1e-9) throw new Error('los dos caminos discrepan');
    cuadra1920('ex1920-3ev-4-barrow-otra-vez', 'Una primitiva desplazada', porBarrow);
  });
});

describe('2019-2020 · 5 · integral por la tangente', () => {
  const id = 'ex1920-3ev-5-integral-por-la-tangente';

  it('el denominador queda t² − 5t', () => {
    /* Dividiendo por cos²x, sen²x − 5 sen x cos x pasa a tan²x − 5 tan x. Se
       comprueba en varios puntos. */
    const k = -5;
    for (const x of [0.4, 1.1, 2.6]) {
      const original = Math.sin(x) ** 2 - 5 * Math.sin(x) * Math.cos(x);
      const t = Math.tan(x);
      if (Math.abs(original / Math.cos(x) ** 2 - (t * t + k * t)) > 1e-9)
        throw new Error(`la reducción falla en x=${x}`);
    }
    cuadra1920(id, 'El denominador tras el cambio', k);
  });

  it('y B vale 1/5', () => {
    /* B = lím_{t→5} (t−5)/(t(t−5)) = 1/5. */
    const B = 1 / 5;
    const izq = (t: number) => 1 / (t * (t - 5));
    const der = (t: number) => -B / t + B / (t - 5);
    for (const t of [1, 2.5, 8])
      if (Math.abs(izq(t) - der(t)) > 1e-12) throw new Error(`la descomposición falla en t=${t}`);
    cuadra1920(id, 'El coeficiente de las fracciones simples', B);
  });
});

describe('2019-2020 · 6 · la cucaracha', () => {
  const id = 'ex1920-3ev-6-la-cucaracha';
  const f = (x: number, y: number) => Math.exp(-((x - 1) ** 2) - (y - 1) ** 2);

  it('la parcial en y vale 0,7358 en (1,0)', () => {
    const e = 1e-6;
    cuadra1920(id, 'La componente vertical del gradiente', (f(1, e) - f(1, -e)) / (2 * e));
  });

  it('y la curva de nivel por ese punto es una circunferencia de radio 1', () => {
    /* f(1,0) = e^{−1}, y el nivel e^{−1} es (x−1)² + (y−1)² = 1. Se recorre
       la circunferencia comprobando que f vale lo mismo en todos sus
       puntos. */
    const R = 1;
    const nivel = f(1, 0);
    for (let k = 0; k < 16; k++) {
      const t = (2 * Math.PI * k) / 16;
      if (Math.abs(f(1 + R * Math.cos(t), 1 + R * Math.sin(t)) - nivel) > 1e-12)
        throw new Error(`en t=${t} la función no vale lo mismo`);
    }
    cuadra1920(id, 'El radio de la curva de nivel', R);
  });
});

describe('2018-2019 · 1 · conjugado en la ecuación', () => {
  const id = 'ex1819-3ev-1-conjugado-en-la-ecuacion';

  it('el módulo vale 1', () => cuadra1819(id, 'El módulo de las soluciones', raiz((r) => r ** 5 - 1, 0.5, 3)));

  it('y hay tres soluciones', () => {
    /* z⁴z̄·i = −1 con ρ = 1 deja 3θ = π/2 + 2kπ, que da tres ángulos
       distintos en una vuelta. Se comprueban los tres. */
    const angulos = [0, 1, 2].map((k) => Math.PI / 6 + (2 * Math.PI * k) / 3);
    for (const th of angulos) {
      const ang = 3 * th + Math.PI / 2;
      if (Math.hypot(Math.cos(ang) + 1, Math.sin(ang)) > 1e-9)
        throw new Error(`θ=${th} no cumple la ecuación`);
    }
    const distintos = new Set(angulos.map((a) => (((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)).toFixed(9)));
    cuadra1819(id, 'Cuántas soluciones hay', distintos.size);
  });
});

describe('2018-2019 · 2 · límite por sucesiones y composición', () => {
  const id = 'ex1819-3ev-2-limite-por-sucesiones-y-composicion';

  it('a lo largo de aₙ = 1/(2n) el coseno vale siempre 1', () => {
    const f = (x: number) => Math.cos(Math.PI / x);
    for (const n of [1, 5, 40])
      if (Math.abs(f(1 / (2 * n)) - 1) > 1e-9) throw new Error(`falla en n=${n}`);
    cuadra1819(id, 'El valor a lo largo de la primera sucesión', f(1 / (2 * 7)));
  });

  it("y h''(1,5) vale 23", () => {
    /* LECTURA DE LA FIGURA: las mismas dos parábolas que en la ordinaria de
       2023-2024, f = 6 − (x−3)² y g = 1 + (u−5)². Se compone y se deriva dos
       veces numéricamente. */
    const f = (x: number) => 6 - (x - 3) ** 2;
    const g = (u: number) => 1 + (u - 5) ** 2;
    cuadra1819(id, 'El signo de la segunda derivada de la composición', deriva2((x) => g(f(x)), 1.5));
  });
});

describe('2018-2019 · 3 · Barrow tercera vez', () => {
  it('la constante desaparece', () => {
    const G = (x: number) => -Math.cos(x) - 40;
    const porBarrow = G(Math.PI) - G(0);
    const porCuadratura = integra(Math.sin, 0, Math.PI, 1e-12);
    if (Math.abs(porBarrow - porCuadratura) > 1e-9) throw new Error('los dos caminos discrepan');
    cuadra1819('ex1819-3ev-3-barrow-tercera-vez', 'La constante desaparece', porBarrow);
  });
});

describe('2018-2019 · 4 · serie del logaritmo del cociente', () => {
  const id = 'ex1819-3ev-4-serie-del-logaritmo-del-cociente';
  const f = (x: number) => Math.log((1 + x) / (1 - x));

  it('el coeficiente de x³ es 2/3', () => cuadra1819(id, 'El coeficiente de tercer grado', deriva3(f, 0) / 6));

  it('y el radio de convergencia es 1', () => {
    /* La serie es 2Σx^{2k+1}/(2k+1): converge dentro de |x| < 1 y no fuera.
       Se comprueba sumando en 0,9 y en 1,1. */
    const parcial = (x: number, n: number) => {
      let s = 0;
      for (let k = 0; k <= n; k++) s += (2 * x ** (2 * k + 1)) / (2 * k + 1);
      return s;
    };
    if (Math.abs(parcial(0.9, 500) - f(0.9)) > 1e-6) throw new Error('no converge dentro');
    if (Number.isFinite(parcial(1.1, 500)) && Math.abs(parcial(1.1, 500)) < 1e6)
      throw new Error('parece converger fuera');
    cuadra1819(id, 'El radio de convergencia', 1);
  });
});

describe('2018-2019 · 5 · sumas y una integral homogénea', () => {
  const id = 'ex1819-3ev-5-sumas-y-una-integral-homogenea';

  it('con y = x en [0,2] y dos tramos, la suma por la izquierda vale 1', () => {
    const y = (x: number) => x;
    const n = 2;
    const h = 2 / n;
    let I1 = 0;
    for (let k = 0; k < n; k++) I1 += h * y(k * h);
    /* Y de paso, lo que el ejercicio quiere: por la izquierda se queda corta
       y por la derecha se pasa, porque y crece. */
    let I2 = 0;
    for (let k = 1; k <= n; k++) I2 += h * y(k * h);
    const exacta = integra(y, 0, 2, 1e-12);
    if (!(I1 < exacta && exacta < I2)) throw new Error('el orden I₁ < I₃ < I₂ no se cumple');
    cuadra1819(id, 'Un caso concreto', I1);
  });

  it('y el coeficiente del logaritmo es 1/5', () => {
    /* Con t = tan x, el integrando pasa a t²/((t²−4)(t²+1)), que se parte en
       (4/5)/(t²−4) + (1/5)/(t²+1). El primero da el logaritmo con 1/5
       delante y el segundo, x/5. Se comprueba la descomposición. */
    const C0 = 1 / 5;
    const izq = (t: number) => (t * t) / ((t * t - 4) * (t * t + 1));
    const der = (t: number) => (4 / 5) / (t * t - 4) + (1 / 5) / (t * t + 1);
    for (const t of [0.3, 1.4, 5])
      if (Math.abs(izq(t) - der(t)) > 1e-12) throw new Error(`la descomposición falla en t=${t}`);
    cuadra1819(id, 'El coeficiente del arcotangente', C0);
  });
});

describe('2018-2019 · 6 · parábola y sus dos tangentes', () => {
  const id = 'ex1819-3ev-6-parabola-y-sus-dos-tangentes';
  const p = (x: number) => 2 * x - x * x;

  it('las dos tangentes se cortan a la altura 2', () => {
    /* En los cortes con OX, x = 0 y x = 2, con pendientes ±2. Por simetría se
       cruzan en x = 1. */
    const t0 = (x: number) => p(0) + deriva(p, 0) * x;
    const t2 = (x: number) => p(2) + deriva(p, 2) * (x - 2);
    const x = raiz((v) => t0(v) - t2(v), 0.1, 1.9);
    cuadra1819(id, 'Dónde se cortan las tangentes', t0(x));
  });

  it('y el área es 2/3', () => {
    const t0 = (x: number) => deriva(p, 0) * x;
    const t2 = (x: number) => deriva(p, 2) * (x - 2);
    cuadra1819(
      id,
      'El área',
      integra((x) => t0(x) - p(x), 0, 1, 1e-12) + integra((x) => t2(x) - p(x), 1, 2, 1e-12),
    );
  });
});
