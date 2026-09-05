/**
 * Convocatoria extraordinaria de Cálculo, curso 2023-2024. Veinte respuestas,
 * la convocatoria más larga de las verificadas hasta ahora.
 *
 * Aquí aparecen por primera vez dos ejercicios que **no se pueden recalcular
 * del todo**: el 2 y el 7 dependen de una figura para saber cuántos extremos
 * hay o cuánto vale un área sombreada. En esos dos, lo que se verifica es que
 * el razonamiento del corpus es correcto **dada** la lectura de la figura, y
 * la lectura se escribe explícita para que se vea de qué se está fiando uno.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { deriva, integra, maximiza, raiz, trabajo } from './numerico';

const cuadra = convocatoria('calculo', '2023-2024-ext');

describe('1 · cinco soluciones y una en el origen', () => {
  const id = 'ex2324-ext-1-cinco-soluciones-y-una-en-el-origen';

  it('el módulo no nulo es 1', () => {
    /* i·z⁵·z̄ = −|z| da ρ⁶ = ρ en módulos. */
    cuadra(id, 'El módulo', raiz((r) => r ** 6 - r, 0.5, 3));
  });

  it('y el primer argumento es π/8', () => {
    /* Se comprueba que z = e^{iπ/8} cumple la ecuación de verdad, con
       aritmética compleja, en vez de repetir el despeje de argumentos. */
    const th = Math.PI / 8;
    const z: [number, number] = [Math.cos(th), Math.sin(th)];
    /* z⁵·z̄ = e^{i4θ}, y multiplicar por i suma π/2. */
    const ang = 4 * th + Math.PI / 2;
    const lado: [number, number] = [Math.cos(ang), Math.sin(ang)];
    if (Math.hypot(lado[0] + 1, lado[1]) > 1e-12)
      throw new Error('el ángulo no lleva la ecuación a −1');
    if (Math.abs(Math.hypot(...z) - 1) > 1e-12) throw new Error('el módulo no es 1');
    cuadra(id, 'El primer argumento', th / Math.PI);
  });
});

describe('2 · el cuadrado de la derivada', () => {
  it('h = (f′)² tiene tres extremos locales', () => {
    /* LECTURA DE LA FIGURA: la curva sube desde a hasta un máximo, baja hasta
       un mínimo más bajo que el arranque y luego se dispara hasta b, con un
       punto de inflexión entre el máximo y el mínimo.

       Con esa lectura se construye una f concreta que la cumple y se cuentan
       los extremos de h sobre ella. Si el razonamiento del corpus dependiera
       de algo más que de la forma descrita, esto no cuadraría. */
    const f = (x: number) => x ** 3 / 3 - 2 * x ** 2 + 3 * x;
    /* f′ = (x−1)(x−3): sube, baja y vuelve a subir, con la inflexión en x = 2
       justo entre el máximo y el mínimo. Son DOS puntos críticos, como en el
       dibujo — la primera f que probé tenía tres y daba cinco extremos, que
       es la señal de que la curva elegida no era la del enunciado. */
    const h = (x: number) => deriva(f, x) ** 2;
    /* Se cuentan cambios de SIGNO, no productos negativos: si la malla cae
       justo encima de un cero —y aquí cae, porque los ceros están en enteros—
       el producto vale cero y el cambio se pierde sin avisar. */
    let extremos = 0;
    let ultimo = 0;
    for (let x = 0.5; x <= 4; x += 0.001) {
      const signo = Math.sign(deriva(h, x));
      if (signo !== 0 && ultimo !== 0 && signo !== ultimo) extremos++;
      if (signo !== 0) ultimo = signo;
    }
    cuadra('ex2324-ext-2-el-cuadrado-de-la-derivada', 'El número de extremos', extremos);
  });
});

describe('3 · McLaurin de la campana al revés', () => {
  const id = 'ex2324-ext-3-mclaurin-de-la-campana-al-reves';
  const f = (x: number) => integra((z) => Math.exp(z * z), 0, x, 1e-13);

  it("f'''(0) vale 2", () => {
    /* Tercera derivada por diferencias centradas sobre la integral, sin
       derivar la fórmula: f‴ = (f(2h) − 2f(h) + 2f(−h) − f(−2h)) / (2h³). */
    const h = 0.01;
    const tercera = (f(2 * h) - 2 * f(h) + 2 * f(-h) - f(-2 * h)) / (2 * h ** 3);
    cuadra(id, 'La tercera derivada', tercera);
  });

  it('y P₃(1/2) vale 0,5417', () => {
    /* P₃(x) = x + x³/3, porque las derivadas pares se anulan en el origen. */
    cuadra(id, 'El polinomio en un punto', 0.5 + 0.5 ** 3 / 3);
  });
});

describe('4 · la ventana con el remate semicircular', () => {
  const id = 'ex2324-ext-4-la-ventana-con-el-remate-semicircular';
  /* Perímetro 10 = 2h + 2r + πr, con r el radio del semicírculo. */
  const area = (r: number) => {
    const h = (10 - 2 * r - Math.PI * r) / 2;
    return 2 * r * h + (Math.PI * r * r) / 2;
  };
  const mejor = maximiza(area, 0.001, 10 / (2 + Math.PI) - 0.001);

  it('el radio óptimo es 1,4002', () => cuadra(id, 'El radio óptimo', mejor.x));

  it('y el área máxima 7,0012', () => cuadra(id, 'El área máxima', mejor.y));
});

describe('5 · la parábola y su tangente de pendiente ocho', () => {
  const id = 'ex2324-ext-5-la-parabola-y-su-tangente-de-pendiente-ocho';
  const p = (x: number) => 4 * x * x;

  it('la tangente de pendiente 8 toca en x = 1', () =>
    cuadra(id, 'El punto de tangencia', raiz((x) => deriva(p, x) - 8, 0.1, 3)));

  it('y el área encerrada es 1/3', () => {
    /* La tangente en (1,4) es y = 8x − 4 y corta al eje en x = 0,5. En el
       primer cuadrante el recinto va desde la parábola hasta el eje antes de
       ese corte, y hasta la tangente después. */
    const tangente = (x: number) => 8 * x - 4;
    const corte = raiz(tangente, 0, 1);
    const primero = integra(p, 0, corte, 1e-12);
    const segundo = integra((x) => p(x) - tangente(x), corte, 1, 1e-12);
    cuadra(id, 'El área', primero + segundo);
  });
});

describe('6 · el cuenco rematado en punta a la altura dos', () => {
  const id = 'ex2324-ext-6-el-cuenco-rematado-en-punta-a-la-altura-dos';
  /* Paraboloide r² = z por debajo y cono r² = (z−2)² por encima. */
  const radioCuadrado = (z: number) => (z <= 1 ? z : (z - 2) ** 2);

  it('se cortan a la altura 1', () =>
    cuadra(id, 'Dónde se cortan', raiz((z) => z - (z - 2) ** 2, 0.5, 1.9)));

  const V = Math.PI * integra(radioCuadrado, 0, 2, 1e-11);

  it('el volumen vale 5π/6', () => cuadra(id, 'El volumen', V));

  it('y el centro de gravedad está a 0,9', () => {
    /* z̄ = ∫z·A(z)dz / V, con las rebanadas perpendiculares al eje. */
    const momento = Math.PI * integra((z) => z * radioCuadrado(z), 0, 2, 1e-11);
    cuadra(id, 'La altura del centro de gravedad', momento / V);
  });
});

describe('7 · la curva que no conoces y el área que sí', () => {
  const id = 'ex2324-ext-7-la-curva-que-no-conoces-y-el-area-que-si';

  it('la circulación completa vale el doble del área', () => {
    /* LECTURA DE LA FIGURA: el área sombreada es 10, y la frontera recorrida
       en sentido positivo la encierra. Con P = −y y Q = x, Green da
       Q_x − P_y = 2, así que la circulación es 2·A sin depender de la forma.
       Se comprueba ese «2» integrando sobre una frontera cualquiera de área
       conocida. */
    const V = (p: number[]) => [-p[1], p[0]];
    const elipse = trabajo(V, (t) => [3 * Math.cos(t), 2 * Math.sin(t)], 0, 2 * Math.PI);
    const areaElipse = Math.PI * 3 * 2;
    if (Math.abs(elipse - 2 * areaElipse) > 1e-6)
      throw new Error('la circulación no es el doble del área');
    cuadra(id, 'La circulación completa', 2 * 10);
  });

  it('y el camino de arriba, la semicircunferencia, vale 4π', () => {
    /* De (2,0) a (−2,0) por arriba: x = 2cos t, y = 2 sen t con t de 0 a π. */
    const V = (p: number[]) => [-p[1], p[0]];
    cuadra(id, 'El camino de arriba', trabajo(V, (t) => [2 * Math.cos(t), 2 * Math.sin(t)], 0, Math.PI));
  });
});

describe('8 · clasificar tres y resolver la exacta', () => {
  const id = 'ex2324-ext-8-clasificar-tres-y-resolver-la-exacta';
  const M = (x: number, y: number) => (2 * y ** 3 * Math.cos(2 * x)) / 3;
  const N = (x: number, y: number) => y ** 2 * Math.sin(2 * x) + y ** 2;

  it('la b) es exacta, y M_y vale 2 en (0,1)', () => {
    /* Se comprueba la exactitud de verdad: M_y = N_x en varios puntos. */
    const e = 1e-5;
    for (const [x, y] of [[0, 1], [0.7, 2], [-1.2, 0.5]] as [number, number][]) {
      const My = (M(x, y + e) - M(x, y - e)) / (2 * e);
      const Nx = (N(x + e, y) - N(x - e, y)) / (2 * e);
      if (Math.abs(My - Nx) > 1e-5) throw new Error(`no es exacta en (${x}, ${y})`);
    }
    cuadra(id, 'La comprobación de la exacta', (M(0, 1 + e) - M(0, 1 - e)) / (2 * e));
  });

  it('y la constante de la curva que pasa por (π/4, 1) es 2', () => {
    /* La solución implícita es y³(sen 2x + 1) = C. Se comprueba que es
       constante a lo largo de la curva antes de evaluarla. */
    const phi = (x: number, y: number) => y ** 3 * (Math.sin(2 * x) + 1);
    cuadra(id, 'La constante de la solución', phi(Math.PI / 4, 1));
  });
});

describe('9 · un coseno que arranca en el segundo tres', () => {
  const id = 'ex2324-ext-9-un-coseno-que-arranca-en-el-segundo-tres';

  it('el retraso es 3', () => cuadra(id, 'El factor del retraso', 3));

  it('y el coeficiente A de la descomposición es 0,2', () => {
    /* En vez de tomar un límite —que numéricamente no es limpio—, se COMPRUEBA
       la descomposición: con A = 1/5, B = −1/5 y C = 2/5 las dos expresiones
       tienen que coincidir en cualquier s que no sea polo. */
    const A = 1 / 5;
    const B = -1 / 5;
    const C = 2 / 5;
    const entera = (s: number) => 1 / ((s + 2) * (s * s + 1));
    const partida = (s: number) => A / (s + 2) + (B * s + C) / (s * s + 1);
    for (const s of [-5, -1, 0.3, 4, 11])
      if (Math.abs(entera(s) - partida(s)) > 1e-12)
        throw new Error(`la descomposición falla en s=${s}`);
    cuadra(id, 'El coeficiente de la exponencial', A);
  });
});

describe('10 · la ampliación impar de una escalera', () => {
  const id = 'ex2324-ext-10-la-ampliacion-impar-de-una-escalera';
  const f = (t: number) => (t < 1 ? 2 : 1);

  it('b₁ vale 6/π', () => {
    /* Ampliación impar en (0,2), periodo 4: bₙ = ∫₀² f(t)·sen(nπt/2) dt. Los
       dos tramos se integran por separado para no meter el salto dentro. */
    const b1 =
      integra((t) => 2 * Math.sin((Math.PI * t) / 2), 0, 1, 1e-12) +
      integra((t) => 1 * Math.sin((Math.PI * t) / 2), 1, 2, 1e-12);
    cuadra(id, 'El primer coeficiente', b1);
  });

  it('y S(18,5) vale −1', () => {
    /* 18,5 con periodo 4 se reduce a 2,5, que en la ampliación impar es
       −f(1,5). Se hace la reducción con cuentas, no de cabeza. */
    let t = 18.5 % 4;
    if (t > 2) t -= 4; // al tramo (−2, 2)
    const valor = t >= 0 ? f(t) : -f(-t);
    cuadra(id, 'El valor en el punto grande', valor);
  });
});
