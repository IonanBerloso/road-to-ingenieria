/**
 * Convocatoria extraordinaria de Cálculo, curso 2018-2019. Dieciséis
 * respuestas.
 *
 * Su ejercicio 5 es el caso más extremo de figura reconstruida: seis mapas de
 * curvas de nivel y una tabla de derivadas parciales, y hay que emparejarlos.
 * Aquí se **construyen las seis funciones** que los dibujos describen, se
 * calculan sus gradientes en P(1,0) y se busca cuál casa con cada fila de la
 * tabla. El emparejamiento sale solo, sin leer la respuesta.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { deriva, integra, maximiza, raiz } from './numerico';

const cuadra = convocatoria('calculo', '2018-2019-ext');

describe('1 · el arco capaz y la elipse imposible', () => {
  const id = 'ex1819-ext-1-el-arco-capaz-y-la-elipse-imposible';
  /* Arco capaz de π/4 sobre el segmento de −i a i, de longitud 2. */
  const R = 2 / (2 * Math.sin(Math.PI / 4));

  it('el radio es √2', () => cuadra(id, 'El radio del arco', R));

  it('y el centro está en 1', () => {
    /* Sobre la mediatriz del segmento —el eje real—, a distancia √(R²−1). */
    const c = Math.sqrt(R * R - 1);
    for (const p of [[0, 1], [0, -1]])
      if (Math.abs(Math.hypot(p[0] - c, p[1]) - R) > 1e-9)
        throw new Error('la circunferencia no pasa por ±i');
    cuadra.complejo(id, 'El centro', [c, 0]);
  });
});

describe('2 · el supremo, el ínfimo y el salto', () => {
  const id = 'ex1819-ext-2-el-supremo-el-infimo-y-el-salto';
  const x = (n: number, a: number, b: number) => (n < 10 ? -a / n : b * (-1) ** n);

  it('a vale −3 y b vale −2', () => {
    /* Se comprueban las tres condiciones del enunciado sobre la sucesión
       construida con esos valores: supremo 3, ínfimo −2 y salto 7/3. */
    const a = -3;
    const b = -2;
    const valores: number[] = [];
    for (let n = 1; n <= 400; n++) valores.push(x(n, a, b));
    const sup = Math.max(...valores);
    const inf = Math.min(...valores);
    if (Math.abs(sup - 3) > 1e-12) throw new Error(`el supremo es ${sup}`);
    if (Math.abs(inf + 2) > 1e-12) throw new Error(`el ínfimo es ${inf}`);
    const salto = Math.abs(x(10, a, b) - x(9, a, b));
    if (Math.abs(salto - 7 / 3) > 1e-12) throw new Error(`el salto es ${salto}`);
    cuadra(id, 'El parámetro a', a);
    cuadra(id, 'El parámetro b', b);
  });
});

describe('3 · el rectángulo inscrito en la parábola', () => {
  const id = 'ex1819-ext-3-el-rectangulo-inscrito-en-la-parabola';
  const y = (x: number) => 4 * x - x * x;
  /* Base de 2−t a 2+t, altura y(2−t): la parábola es simétrica en x = 2. */
  const area = (t: number) => 2 * t * y(2 - t);
  const mejor = maximiza(area, 0.001, 1.999);

  it('la semianchura óptima es 2/√3', () => cuadra(id, 'La semianchura óptima', mejor.x));

  it('y el área máxima, 6,158', () => cuadra(id, 'El área máxima', mejor.y));
});

describe('4 · dos tangentes y lo que encierran', () => {
  const id = 'ex1819-ext-4-dos-tangentes-y-lo-que-encierran';
  const f = (x: number) => x * x + 4;
  /* Las dos tangentes se calculan, no se copian. */
  const tangente = (a: number) => (x: number) => f(a) + deriva(f, a) * (x - a);
  const derecha = tangente(2);

  it('el área es 16/3', () => {
    /* Por simetría, el doble del trozo de 0 a 2 entre la parábola y su
       tangente derecha. */
    cuadra(id, 'El área', 2 * integra((x) => f(x) - derecha(x), 0, 2, 1e-12));
  });

  it('y el volumen al girar, 107,233', () =>
    cuadra(
      id,
      'El volumen',
      2 * Math.PI * integra((x) => f(x) ** 2 - derecha(x) ** 2, 0, 2, 1e-11),
    ));
});

describe('5 · seis mapas y dos derivadas', () => {
  const id = 'ex1819-ext-5-seis-mapas-y-dos-derivadas';
  /* LECTURA DE LA FIGURA, mapa por mapa:
     1-3 son circunferencias concéntricas, o sea F = k(x²+y²) con
       1: cotas que BAJAN hacia fuera de −1 a −4  → k = −1
       2: SUBEN de 1 a 9 muy juntas               → k = 4
       3: SUBEN de 1 a 6 más separadas            → k = 2
     4-6 son la misma parábola desplazada, o sea F = k(y − x²) con
       4: suben de uno en uno                      → k = 1
       5: bajan de uno en uno                      → k = −1
       6: suben de cuatro en cuatro, 4 veces más juntas → k = 4 */
  const mapas: Record<number, (x: number, y: number) => number> = {
    1: (x, y) => -(x * x + y * y),
    2: (x, y) => 4 * (x * x + y * y),
    3: (x, y) => 2 * (x * x + y * y),
    4: (x, y) => y - x * x,
    5: (x, y) => x * x - y,
    6: (x, y) => 4 * (y - x * x),
  };
  /* Gradiente numérico en P(1,0) de cada mapa. */
  const e = 1e-6;
  const grad = (n: number) => {
    const F = mapas[n];
    return [(F(1 + e, 0) - F(1 - e, 0)) / (2 * e), (F(1, e) - F(1, -e)) / (2 * e)];
  };
  const cual = (Fx: number, Fy: number) => {
    const encajan = [1, 2, 3, 4, 5, 6].filter((n) => {
      const g = grad(n);
      return Math.abs(g[0] - Fx) < 1e-4 && Math.abs(g[1] - Fy) < 1e-4;
    });
    if (encajan.length !== 1)
      throw new Error(`con (${Fx}, ${Fy}) encajan ${encajan.length} mapas: ${encajan}`);
    return encajan[0];
  };

  it('el caso c), con Fx = 8 y Fy = 0, es el mapa 2', () =>
    cuadra(id, 'El caso c)', cual(8, 0)));

  it('y el caso f), con Fx = −8 y Fy = 4, es el 6', () => cuadra(id, 'El caso f)', cual(-8, 4)));
});

describe('6 · el campo conservativo en el espacio', () => {
  const id = 'ex1819-ext-6-el-campo-conservativo-en-el-espacio';
  const V = (p: number[]) => [
    p[1] * p[2] + p[1] - 1,
    p[0] * p[2] + p[0],
    p[0] * p[1] + 3 * p[2] ** 2,
  ];
  const f = (p: number[]) => p[0] * p[1] * p[2] + p[0] * p[1] - p[0] + p[2] ** 3;

  it('el potencial lleva z³ con coeficiente 1', () => {
    /* Se comprueba que ∇f = V en varios puntos, con derivadas numéricas. */
    const e = 1e-5;
    for (const p of [[1, 2, 3], [-0.5, 0.7, 1.2], [2, -1, 0.3]]) {
      const g = [0, 1, 2].map((i) => {
        const mas = [...p];
        const menos = [...p];
        mas[i] += e;
        menos[i] -= e;
        return (f(mas) - f(menos)) / (2 * e);
      });
      const v = V(p);
      if (g.some((x, i) => Math.abs(x - v[i]) > 1e-4)) throw new Error(`∇f ≠ V en ${p}`);
    }
    cuadra(id, 'El término que solo depende de z', 1);
  });

  it('y la integral vale 1 + √2', () => {
    const A = [0, 2, 0];
    const B = [Math.SQRT2, 1, 1];
    cuadra(id, 'El valor de la integral', f(B) - f(A));
  });
});

describe('7 · la EDO que resuena consigo misma', () => {
  const id = 'ex1819-ext-7-la-edo-que-resuena-consigo-misma';
  const e = 1e-4;
  const L = (y: (x: number) => number, x: number) =>
    (y(x + e) - 2 * y(x) + y(x - e)) / (e * e) - (3 * (y(x + e) - y(x - e))) / (2 * e) + 2 * y(x);

  it('A vale −1 y B vale −2', () => {
    /* e^x es raíz simple de la característica, así que el ensayo sube un
       grado. Se comprueba que (−x² − 2x)e^x resuelve la EDO. */
    const A = -1;
    const B = -2;
    const y = (x: number) => (A * x * x + B * x) * Math.exp(x);
    for (const x of [-1, 0.5, 2])
      if (Math.abs(L(y, x) - 2 * x * Math.exp(x)) > 1e-3) throw new Error(`falla en x=${x}`);
    cuadra(id, 'El coeficiente de x²', A);
    cuadra(id, 'El coeficiente de x', B);
  });
});

describe('8 · el sistema que sale en espiral', () => {
  const id = 'ex1819-ext-8-el-sistema-que-sale-en-espiral';

  it('el cuadrado completado deja un 4', () => {
    /* X = (s−1)/((s−1)² + a) viene de X[(s−1)² + 4]/(s−1) = 1, que sale de
       sustituir Y = −2X/(s−1) en la primera ecuación. Se comprueba la
       identidad en varios s. */
    const a = 4;
    const X = (s: number) => (s - 1) / ((s - 1) ** 2 + a);
    const Y = (s: number) => (-2 * X(s)) / (s - 1);
    for (const s of [0.3, 2, 5]) {
      if (Math.abs(s * X(s) - 1 - (X(s) + 2 * Y(s))) > 1e-12)
        throw new Error(`la primera ecuación falla en s=${s}`);
      if (Math.abs(s * Y(s) - (-2 * X(s) + Y(s))) > 1e-12)
        throw new Error(`la segunda falla en s=${s}`);
    }
    cuadra(id, 'El cuadrado completado', a);
  });

  it('y y(t) = −e^t·sen 2t', () => {
    /* Se comprueba que el par (e^t cos2t, −e^t sen2t) resuelve el sistema y
       cumple las condiciones iniciales. */
    const c = -1;
    const x = (t: number) => Math.exp(t) * Math.cos(2 * t);
    const y = (t: number) => c * Math.exp(t) * Math.sin(2 * t);
    const e = 1e-6;
    for (const t of [0.3, 1, 2.2]) {
      const xp = (x(t + e) - x(t - e)) / (2 * e);
      const yp = (y(t + e) - y(t - e)) / (2 * e);
      if (Math.abs(xp - (x(t) + 2 * y(t))) > 1e-5) throw new Error(`la 1.ª falla en t=${t}`);
      if (Math.abs(yp - (-2 * x(t) + y(t))) > 1e-5) throw new Error(`la 2.ª falla en t=${t}`);
    }
    if (Math.abs(x(0) - 1) > 1e-12 || Math.abs(y(0)) > 1e-12)
      throw new Error('las condiciones iniciales no cuadran');
    cuadra(id, 'El coeficiente de la segunda función', c);
  });
});
