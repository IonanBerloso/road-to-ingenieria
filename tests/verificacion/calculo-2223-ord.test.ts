/**
 * Convocatoria ordinaria de Cálculo, curso 2022-2023. Veinte respuestas.
 *
 * Su ejercicio 3 es el mejor caso hasta ahora de figura reconstruida: el
 * enunciado da la parábola f y el dibujo dice dónde corta la otra curva al
 * eje, así que **g se recupera integrando f** y ajustando la constante con un
 * dato del dibujo. Que los otros dos cortes caigan donde el dibujo dice —justo
 * por debajo del eje al empezar y justo por encima al acabar— es la
 * comprobación de que la reconstrucción es la buena.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { deriva, integra, integraCasi, raiz, trabajo } from './numerico';

const cuadra = convocatoria('calculo', '2022-2023-ord');

describe('1 · el tercer vértice del isósceles', () => {
  const id = 'ex2223-ord-1-el-tercer-vertice-del-isosceles';
  const z1 = [1, 3];
  const z2 = [3, 4];
  const base = Math.hypot(z2[0] - z1[0], z2[1] - z1[1]);

  it('la base mide √5', () => cuadra(id, 'La base', base));

  it('y el tercer vértice es −1 + 9,5i', () => {
    /* Altura = 3·base, levantada desde el punto medio en dirección
       perpendicular. La figura pide el vértice de arriba a la izquierda, o
       sea el sentido de giro que lleva la base hacia allí. */
    const medio = [(z1[0] + z2[0]) / 2, (z1[1] + z2[1]) / 2];
    const dir = [(z2[0] - z1[0]) / base, (z2[1] - z1[1]) / base];
    const perp = [-dir[1], dir[0]];
    const z3 = [medio[0] + 3 * base * perp[0], medio[1] + 3 * base * perp[1]];
    /* Y se comprueba que el triángulo sale isósceles de verdad. */
    const l1 = Math.hypot(z3[0] - z1[0], z3[1] - z1[1]);
    const l2 = Math.hypot(z3[0] - z2[0], z3[1] - z2[1]);
    if (Math.abs(l1 - l2) > 1e-9) throw new Error('el triángulo no es isósceles');
    cuadra.complejo(id, 'El tercer vértice', [z3[0], z3[1]]);
  });
});

describe('2 · el cohete y el ángulo de la cámara', () => {
  const id = 'ex2223-ord-2-el-cohete-y-el-angulo-de-la-camara';
  const D = 5000;
  const h = 1000;

  it('sec²θ vale 1,04 en ese instante', () => {
    /* tan θ = h/D, y sec² = 1 + tan². Se calcula el ángulo de verdad y se
       eleva su secante, en vez de usar la identidad. */
    const th = Math.atan(h / D);
    cuadra(id, 'El factor que aparece al derivar', 1 / Math.cos(th) ** 2);
  });

  it('y el ángulo cambia a 0,1154 rad/s', () => {
    /* Derivada numérica del ángulo respecto del tiempo: la altura sube a
       600 m/s, así que se mira θ(h) medio segundo antes y después. */
    const th = (altura: number) => Math.atan(altura / D);
    const e = 1e-4;
    cuadra(id, 'La velocidad angular', (th(h + 600 * e) - th(h - 600 * e)) / (2 * e));
  });
});

describe('3 · cuál es la función y cuál la derivada', () => {
  const id = 'ex2223-ord-3-cual-es-la-funcion-y-cual-la-derivada';
  /* El enunciado da f, y la figura dice que la otra curva se anula en x = 2.
     Como y = g y f = g′, g se recupera integrando f desde 2. */
  const f = (x: number) => 1.35 * (x - 1.15) * (x - 2.85);
  const g = (x: number) => integra(f, 2, x, 1e-12);

  it('la reconstrucción de g encaja con lo que dibuja la figura', () => {
    /* La figura dice: g sale justo por debajo del eje en 0,5, lo cruza
       enseguida, y vuelve a cruzarlo muy cerca del extremo derecho. */
    if (!(g(0.5) < 0 && g(0.5) > -0.1)) throw new Error(`g(0,5) = ${g(0.5)}, no sale «justo por debajo»`);
    if (!(g(3.5) > 0 && g(3.5) < 0.1)) throw new Error(`g(3,5) = ${g(3.5)}, no acaba «justo por encima»`);
    /* Y sus extremos caen donde f corta al eje. */
    if (Math.abs(deriva(g, 1.15)) > 1e-6) throw new Error('g no tiene extremo en 1,15');
  });

  it('el dominio de h = ln(g) tiene dos trozos', () => {
    /* Se cuentan los tramos donde g > 0, barriendo el intervalo. */
    let trozos = 0;
    let dentro = false;
    for (let x = 0.5; x <= 3.5; x += 0.0005) {
      const positivo = g(x) > 0;
      if (positivo && !dentro) trozos++;
      dentro = positivo;
    }
    cuadra(id, 'El dominio de h', trozos);
  });

  it('y su extremo en el trozo grande está en 1,15', () => {
    /* h′ = g′/g = f/g, y en el dominio g > 0: el signo de h′ es el de f. El
       extremo cae donde f se anula dentro del trozo grande. */
    cuadra(id, 'El extremo de h', raiz(f, 0.6, 2));
  });
});

describe('4 · McLaurin para el logaritmo de nueve décimas', () => {
  const id = 'ex2223-ord-4-mclaurin-para-el-logaritmo-de-nueve-decimas';
  const f = (x: number) => Math.log(x + 3);

  it('el coeficiente de segundo grado es −1/18', () => {
    const e = 1e-3;
    const segunda = (f(e) - 2 * f(0) + f(-e)) / (e * e);
    cuadra(id, 'El coeficiente de segundo grado', segunda / 2);
  });

  const P2 = (x: number) => Math.log(3) + x / 3 - x * x / 18;

  it('y la aproximación de ln 0,9 es −0,105', () => {
    /* ln 0,9 = ln(2,7) − ln 3 = f(−0,3) − ln 3, que es donde el polinomio
       sigue siendo bueno. Evaluarlo en x = −2,1 sería usarlo lejísimos. */
    cuadra(id, 'La aproximación', P2(-0.3) - Math.log(3));
  });

  it('con una cota de error de 0,00046', () => {
    /* Resto de Lagrange de orden 2: máx|f‴| en [−0,3, 0] por |x|³/3!. El
       máximo se busca barriendo, no razonando dónde está. */
    const tercera = (x: number) => 2 / (x + 3) ** 3;
    let M = 0;
    for (let x = -0.3; x <= 0; x += 1e-4) M = Math.max(M, Math.abs(tercera(x)));
    cuadra(id, 'La cota del error', (M * 0.3 ** 3) / 6);
  });
});

describe('5 · la esfera cortada por el cilindro', () => {
  const id = 'ex2223-ord-5-la-esfera-cortada-por-el-cilindro';

  it('en polares el cilindro es r ≤ 4 sen θ', () => {
    /* x² + y² ≤ 4y con x = r cos θ e y = r sen θ da r ≤ 4 sen θ. Se
       comprueba sobre puntos del borde. */
    for (const th of [0.3, 1.0, 2.4]) {
      const r = 4 * Math.sin(th);
      const x = r * Math.cos(th);
      const y = r * Math.sin(th);
      if (Math.abs(x * x + y * y - 4 * y) > 1e-9) throw new Error(`el borde falla en θ=${th}`);
    }
    cuadra(id, 'El radio en polares', 4);
  });

  it('y el volumen vale 38,576', () => {
    /* Integral doble en polares: la altura es la media esfera. */
    /* El integrando tiene derivada infinita cuando el radio llega a 4, que es
       lo que pasa en θ = π/2: hay que apartarse del extremo. */
    const interior = (th: number) =>
      integraCasi((r) => Math.sqrt(Math.max(0, 16 - r * r)) * r, 0, 4 * Math.sin(th), 1e-10, 'b');
    cuadra(id, 'El volumen', integra(interior, 0, Math.PI, 1e-9));
  });
});

describe('6 · el trabajo en la espiral y su área', () => {
  const id = 'ex2223-ord-6-el-trabajo-en-la-espiral-y-su-area';
  const V = (p: number[]) => [-p[1] / 2, p[0] / 2];
  const r = (t: number) => [t * Math.cos(t), t * Math.sin(t)];
  const W = trabajo(V, r, 0, 2 * Math.PI);

  it('el trabajo a lo largo de la espiral es 4π³/3', () => cuadra(id, 'El trabajo', W));

  it('y el área sombreada vale lo mismo, que es lo que el ejercicio enseña', () => {
    /* Con este campo la circulación mide el área barrida, así que los dos
       apartados dan el mismo número. Se comprueba por otro lado: el área del
       sector barrido es ½∫r²dθ, que con r = t y θ = t es ½∫t²dt. */
    const area = 0.5 * integra((t) => t * t, 0, 2 * Math.PI, 1e-11);
    if (Math.abs(area - W) > 1e-6) throw new Error('el área y el trabajo no coinciden');
    cuadra(id, 'El área sombreada', area);
  });
});

describe('7 · un factor integrante que te dan hecho', () => {
  const id = 'ex2223-ord-7-un-factor-integrante-que-te-dan-hecho';
  /* sen x + ln|1−y| = C. */
  const phi = (x: number, y: number) => Math.sin(x) + Math.log(Math.abs(1 - y));

  it('la constante de la solución que pasa por (0, 1−e) vale 1', () =>
    cuadra(id, 'La constante de una solución concreta', phi(0, 1 - Math.E)));

  it('y esa solución vale −0,6487 en π/6', () => {
    /* Se despeja y de la implícita buscando la raíz, y se comprueba de paso
       que la curva cumple la EDO original. */
    const C = 1;
    const y = raiz((v) => phi(Math.PI / 6, v) - C, -5, 0.99);
    const e = 1e-6;
    const yMas = raiz((v) => phi(Math.PI / 6 + e, v) - C, -5, 0.99);
    const yMenos = raiz((v) => phi(Math.PI / 6 - e, v) - C, -5, 0.99);
    const pendiente = (yMas - yMenos) / (2 * e);
    /* (1−y)cos x dx − dy = 0 → dy/dx = (1−y)cos x. */
    if (Math.abs(pendiente - (1 - y) * Math.cos(Math.PI / 6)) > 1e-6)
      throw new Error('la curva no cumple la EDO');
    cuadra(id, 'Un valor de esa solución', y);
  });
});

describe('8 · un sistema de dos ecuaciones por Laplace', () => {
  const id = 'ex2223-ord-8-un-sistema-de-dos-ecuaciones-por-laplace';

  it('el determinante del sistema en s = 3 vale 7', () => {
    const s = 3;
    cuadra(id, 'El determinante del sistema algebraico', (s - 1) * (s + 1) - 1);
  });

  it('y x(1) vale e', () => {
    /* La solución es x(t) = y(t) = e^t. Se comprueba que cumple las dos
       ecuaciones y las dos condiciones iniciales, derivando numéricamente,
       en vez de repetir la antitransformada. */
    const x = (t: number) => Math.exp(t);
    const y = (t: number) => Math.exp(t);
    const e = 1e-6;
    for (const t of [0.2, 1, 2.5]) {
      const xp = (x(t + e) - x(t - e)) / (2 * e);
      const yp = (y(t + e) - y(t - e)) / (2 * e);
      if (Math.abs(xp - (x(t) + y(t) - Math.exp(t))) > 1e-6) throw new Error(`la 1.ª falla en t=${t}`);
      if (Math.abs(yp - (x(t) - y(t) + Math.exp(t))) > 1e-6) throw new Error(`la 2.ª falla en t=${t}`);
    }
    if (Math.abs(x(0) - 1) > 1e-12 || Math.abs(y(0) - 1) > 1e-12)
      throw new Error('las condiciones iniciales no se cumplen');
    cuadra(id, 'El valor de la solución', x(1));
  });
});

describe('9 · Fourier de la escalera de dos peldaños', () => {
  const id = 'ex2223-ord-9-fourier-de-la-escalera-de-dos-peldanos';

  it('el término constante es 0,75', () => {
    /* Los dos peldaños se integran por separado para no meter el salto
       dentro de una sola cuadratura. */
    const media = (integra(() => 1, 0, 1, 1e-12) + integra(() => 0.5, 1, 2, 1e-12)) / 2;
    cuadra(id, 'El término constante', media);
  });

  it('b₁ vale 1/π', () => {
    const b1 =
      integra((t) => 1 * Math.sin(Math.PI * t), 0, 1, 1e-12) +
      integra((t) => 0.5 * Math.sin(Math.PI * t), 1, 2, 1e-12);
    cuadra(id, 'El primer armónico', b1);
  });

  it('y la serie alternada suma π/4', () => {
    /* Sumada de verdad. Es alternada, así que la media de dos sumas
       parciales consecutivas converge mucho más deprisa que las sumas
       sueltas. */
    let s = 0;
    let previa = 0;
    for (let n = 0; n < 200000; n++) {
      previa = s;
      s += (-1) ** n / (2 * n + 1);
    }
    cuadra(id, 'La suma de la serie numérica', (s + previa) / 2);
  });
});
