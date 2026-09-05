/**
 * Las terceras evaluaciones de Cálculo de 2024-2025 y 2025-2026, las dos más
 * recientes. Veintitrés respuestas entre las dos.
 *
 * Los exámenes por evaluación son más cortos que los finales —seis ejercicios
 * y dos preguntas cada uno— así que van agrupados de dos en dos por fichero.
 *
 * Lo mejor de esta pareja es la serie hipergeométrica de 2025-2026: el
 * enunciado **da la fórmula de la suma** y pide aplicarla, así que el test
 * puede comprobar el resultado por dos caminos que no comparten nada — la
 * fórmula del enunciado y la suma directa de dos millones de términos.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { deriva, integra, maximiza, raiz } from './numerico';

const cuadraNuevo = convocatoria('calculo', '2025-2026-3ev');
const cuadraAnterior = convocatoria('calculo', '2024-2025-3ev');

describe('2025-2026 · 1 · medio disco', () => {
  const id = 'ex2526-3ev-1-medio-disco';
  /* |z|² < 2(x − y) es (x−1)² + (y+1)² < 2. */
  const R = Math.SQRT2;

  it('el disco tiene radio √2', () => {
    for (let k = 0; k < 16; k++) {
      const t = (2 * Math.PI * k) / 16;
      const x = 1 + R * Math.cos(t);
      const y = -1 + R * Math.sin(t);
      if (Math.abs(x * x + y * y - 2 * (x - y)) > 1e-9)
        throw new Error(`el borde no cumple la condición en t=${t}`);
    }
    cuadraNuevo(id, 'El radio de la circunferencia', R);
  });

  it('y la región es medio disco, de área π', () => {
    /* La segunda condición es x − y ≥ 2, y esa recta pasa **por el centro**
       del disco: la distancia del centro a la recta es cero. Por eso la
       región es exactamente la mitad. */
    const distancia = Math.abs(1 - -1 - 2) / Math.SQRT2;
    if (Math.abs(distancia) > 1e-12) throw new Error('la recta no pasa por el centro');
    cuadraNuevo(id, 'El área de la región', (Math.PI * R * R) / 2);
  });
});

describe('2025-2026 · 2 · hipergeométricas', () => {
  const id = 'ex2526-3ev-2-hipergeometricas';
  const a = (n: number) => 1 / ((2 * n - 1) * (2 * n + 1) * (2 * n + 3));

  it('γ vale 5', () => {
    /* a_{n+1}/aₙ = (2n−1)/(2n+5), o sea α = 2, β = −1, γ = 5. Se comprueba
       la razón en varios n en vez de simplificarla a mano. */
    const [alfa, beta, gamma] = [2, -1, 5];
    for (const n of [1, 3, 10, 57])
      if (Math.abs(a(n + 1) / a(n) - (alfa * n + beta) / (alfa * n + gamma)) > 1e-12)
        throw new Error(`la razón falla en n=${n}`);
    cuadraNuevo(id, 'El parámetro gamma del apartado (a)', gamma);
  });

  it('y la suma es 1/12, por los dos caminos', () => {
    /* Camino 1: la fórmula que da el enunciado. */
    const [alfa, beta, gamma] = [2, -1, 5];
    const n = 100000;
    const porLaFormula = (a(n) * (alfa * n + beta) - a(1) * gamma) / (alfa + beta - gamma);
    /* Camino 2: sumar. Los dos tienen que coincidir. */
    let directa = 0;
    for (let k = 1; k <= 2_000_000; k++) directa += a(k);
    if (Math.abs(porLaFormula - directa) > 1e-9)
      throw new Error(`la fórmula da ${porLaFormula} y la suma ${directa}`);
    cuadraNuevo(id, 'La suma de la serie', directa);
  });
});

describe('2025-2026 · 3 · satélite', () => {
  const id = 'ex2526-3ev-3-satelite';
  const orbita = (x: number) => 9 - x * x;

  it('la órbita pasa por 9 en el origen', () => {
    /* (x/3)² + y/9 = 1 despejando y. Se comprueba sobre la forma original. */
    for (const x of [0, 1.5, 3])
      if (Math.abs((x / 3) ** 2 + orbita(x) / 9 - 1) > 1e-12)
        throw new Error(`la órbita despejada falla en x=${x}`);
    cuadraNuevo(id, 'La órbita, despejada', orbita(0));
  });

  it('y el punto de salida de la derecha está en x = 4', () => {
    /* La tangente en (a, 9−a²) tiene que pasar por P(3,1). Se plantea la
       condición con la pendiente numérica y se busca la raíz mayor. */
    const pasaPorP = (a: number) => orbita(a) + deriva(orbita, a) * (3 - a) - 1;
    cuadraNuevo(id, 'Los puntos de salida', raiz(pasaPorP, 3, 8));
  });
});

describe('2025-2026 · 4 · Taylor del logaritmo', () => {
  const id = 'ex2526-3ev-4-taylor-del-logaritmo';
  /* f = ln(g²) y P₂ = 2 − (x−1) − 5(x−1)². De f(1) = 2 sale g(1) = e, y de
     f′(1) = −1, con f′ = 2g′/g, sale g′(1). */

  it('g(1) vale e', () => {
    const g1 = raiz((v) => Math.log(v * v) - 2, 0.1, 10);
    cuadraNuevo(id, 'El valor de g en 1', g1);
  });

  it("y g'(1) vale −e/2", () => {
    const g1 = Math.E;
    const fp1 = -1;
    cuadraNuevo(id, 'La derivada de g', (fp1 * g1) / 2);
  });
});

describe('2025-2026 · 5 · parábola tumbada y tangente', () => {
  const id = 'ex2526-3ev-5-parabola-tumbada-y-tangente';
  /* (y−2)² = x − 1, o sea x = 1 + (y−2)². */
  const x = (y: number) => 1 + (y - 2) ** 2;

  it('la tangente corta al eje en x = −4', () => {
    /* En P(2,3): dx/dy = 2(y−2) = 2, así que la recta es x = 2 + 2(y−3).
       En y = 0 da −4. Se calcula la pendiente numéricamente. */
    const m = deriva(x, 3);
    cuadraNuevo(id, 'La tangente', x(3) + m * (0 - 3));
  });

  it('y el recinto mide 9', () => {
    /* Integrando en y de 0 a 3, entre la tangente por la izquierda y la
       parábola por la derecha. */
    const m = deriva(x, 3);
    const tangente = (y: number) => x(3) + m * (y - 3);
    cuadraNuevo(id, 'El área', integra((y) => x(y) - tangente(y), 0, 3, 1e-12));
  });
});

describe('2025-2026 · 6 · valor medio y función integral', () => {
  const id = 'ex2526-3ev-6-valor-medio-y-funcion-integral';
  const f = (t: number) => 1 + Math.sin(t);
  const [a, b] = [0, 2.5];
  const M = integra(f, a, b, 1e-12) / (b - a);

  it('la integral de f − M sobre todo el intervalo es cero', () =>
    cuadraNuevo(id, 'La integral de la diferencia', integra((t) => f(t) - M, a, b, 1e-12)));

  it('y con c en el punto medio, M es la media de las dos medias', () => {
    const c = (a + b) / 2;
    const Mac = integra(f, a, c, 1e-12) / (c - a);
    const Mcb = integra(f, c, b, 1e-12) / (b - c);
    cuadraNuevo(id, 'La media ponderada', M / (Mac + Mcb));
  });
});

describe('2024-2025 · 1 · dos triángulos', () => {
  const id = 'ex2425-3ev-1-dos-triangulos';

  it('hay siete soluciones', () => {
    /* z(z³−1)(z³−8) = 0: el cero, tres raíces cúbicas de 1 y tres de 8. Se
       comprueba que las siete son distintas y que todas anulan la ecuación. */
    const raices: [number, number][] = [[0, 0]];
    for (const r of [1, 2])
      for (let k = 0; k < 3; k++) {
        const th = (2 * Math.PI * k) / 3;
        raices.push([r * Math.cos(th), r * Math.sin(th)]);
      }
    for (const [x, y] of raices) {
      const rho = Math.hypot(x, y);
      const th = Math.atan2(y, x);
      const p = (n: number) => [rho ** n * Math.cos(n * th), rho ** n * Math.sin(n * th)];
      const v = [0, 1].map((i) => p(7)[i] - 9 * p(4)[i] + 8 * p(1)[i]);
      if (Math.hypot(v[0], v[1]) > 1e-9) throw new Error(`(${x}, ${y}) no es solución`);
    }
    const distintas = new Set(raices.map((p) => p.map((v) => v.toFixed(9)).join(',')));
    cuadraAnterior(id, 'Cuántas soluciones hay', distintas.size);
  });

  it('y la circunferencia mayor tiene radio 2', () =>
    cuadraAnterior(id, 'El módulo de las soluciones grandes', Math.cbrt(8)));
});

describe('2024-2025 · 2 · pelota que bota', () => {
  const id = 'ex2425-3ev-2-pelota-que-bota';
  const altura = (n: number) => 9 * 0.8 ** n;

  it('el quinto bote llega a 2,949 m', () => cuadraAnterior(id, 'La altura del quinto bote', altura(5)));

  it('y todos los botes suman 36 m', () => {
    /* Se suma de verdad, con bastantes términos, y se comprueba contra la
       fórmula de la geométrica. */
    let s = 0;
    for (let n = 1; n <= 400; n++) s += altura(n);
    const formula = (9 * 0.8) / (1 - 0.8);
    if (Math.abs(s - formula) > 1e-9) throw new Error('la suma no cuadra con la geométrica');
    cuadraAnterior(id, 'La suma de todas las alturas', s);
  });
});

describe('2024-2025 · 3 · McLaurin del coseno', () => {
  const id = 'ex2425-3ev-3-mclaurin-del-coseno';

  it('el coeficiente de x⁶ del coseno es −1/720', () => {
    /* 6! = 720, con el signo alternado. Se comprueba que el polinomio de
       orden 6 reproduce el coseno cerca del origen. */
    const P6 = (x: number) => 1 - x ** 2 / 2 + x ** 4 / 24 - x ** 6 / 720;
    if (Math.abs(P6(0.3) - Math.cos(0.3)) > 1e-8) throw new Error('el polinomio no aproxima');
    cuadraAnterior(id, 'El coeficiente de sexto grado', -1 / 720);
  });

  it('y g^{(8)}(0) vale 1680', () => {
    /* cos(x²) = Σ(−1)ⁿx^{4n}/(2n)!. El grado 8 sale con n = 2, coeficiente
       1/4!, y la derivada es 8! por él. */
    const n = 2;
    if (4 * n !== 8) throw new Error('el grado 8 no sale con n = 2');
    let ocho = 1;
    for (let k = 5; k <= 8; k++) ocho *= k; // 8!/4!
    cuadraAnterior(id, 'La octava derivada', (-1) ** n * ocho);
  });
});

describe('2024-2025 · 4 · recinto y volumen', () => {
  const id = 'ex2425-3ev-4-recinto-y-volumen';

  it('las dos curvas se cortan en x = 2', () =>
    cuadraAnterior(id, 'Dónde se cortan', raiz((x) => x * x + 2 * x - 8, 0, 5)));

  it('y el área es 7,6165', () => {
    /* Integrando en y de −2 a 2, entre la parábola y²  = 2x por la izquierda
       y la circunferencia por la derecha. */
    cuadraAnterior(
      id,
      'El área',
      integra((y) => Math.sqrt(8 - y * y) - (y * y) / 2, -2, 2, 1e-11),
    );
  });
});

describe('2024-2025 · 5 · triángulo de área mínima', () => {
  const id = 'ex2425-3ev-5-triangulo-de-area-minima';
  /* La recta pasa por (1,2) y corta los ejes en (a,0) y (0,b), con
     1/a + 2/b = 1. De ahí b = 2a/(a−1) y el área es a²/(a−1). */
  const area = (a: number) => (a * a) / (a - 1);
  const mejor = maximiza((a) => -area(a), 1.001, 20);

  it('a vale 2 en el óptimo', () => cuadraAnterior(id, 'El corte con el eje horizontal', mejor.x));

  it('y el área mínima es 4', () => cuadraAnterior(id, 'El área mínima', -mejor.y));
});

describe('2024-2025 · 6 · área de revolución', () => {
  it('A′(u) no se anula en ningún punto interior', () => {
    /* A′(u) = 2π·f(u)·√(1+f′(u)²), y el radical nunca es cero: A′ solo se
       anula donde f se anula. LECTURA DE LA FIGURA: f es positiva en todo el
       intervalo, así que no hay ninguno. */
    const f = (x: number) => 2 + Math.sin(x);
    let ceros = 0;
    for (let u = 0.01; u < 3; u += 0.001) {
      const d = 2 * Math.PI * f(u) * Math.sqrt(1 + deriva(f, u) ** 2);
      if (Math.abs(d) < 1e-9) ceros++;
    }
    cuadraAnterior('ex2425-3ev-6-area-de-revolucion', 'El signo de la derivada', ceros);
  });
});
