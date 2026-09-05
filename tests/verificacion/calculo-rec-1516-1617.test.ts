/**
 * Las cuatro recuperaciones de Cálculo de 2015-2016 y 2016-2017. Diez
 * respuestas entre las cuatro. Con ellas quedan verificadas **las once
 * recuperaciones** y, con ellas, **las ochenta y cinco convocatorias de
 * Cálculo**.
 *
 * El ejercicio 2 de la recuperación de la 5.ª de 2016-2017 pide **tres signos**
 * leídos de una gráfica: los de los tres coeficientes del polinomio de Taylor
 * en x = 2. Es el tipo de respuesta que se contesta en un segundo copiando la
 * resolución, así que aquí se construye la cúbica que el dibujo describe
 * —cortes en 0,5, 3 y 6, mínimo cerca de −1,7 y máximo cerca de 2,3— y los tres
 * signos se miden sobre ella.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { cModulo, cPor, deriva, deriva2, raiz, type C } from './numerico';
import { resuelve } from './lineal';

const cuadra1617 = convocatoria('calculo', '2016-2017-4ev-rec');
const cuadra16175 = convocatoria('calculo', '2016-2017-5ev-rec');
const cuadra1516 = convocatoria('calculo', '2015-2016-4ev-rec');
const cuadra15165 = convocatoria('calculo', '2015-2016-5ev-rec');

const polar = (r: number, rad: number): C => [r * Math.cos(rad), r * Math.sin(rad)];

describe('2016-2017 · rec 4.ª · 1 · De Moivre y el coseno cuádruple', () => {
  it('el coeficiente de cos⁴x es 8', () => {
    /* cos4x = a·cos⁴x + b·cos²x + c. Los tres coeficientes se ajustan
       evaluando en tres ángulos y resolviendo el sistema; después se comprueba
       en otros tres que la identidad es cierta y no una casualidad. */
    const angulos = [0.3, 0.9, 1.7];
    const [a, b, c] = resuelve(
      angulos.map((x) => [Math.cos(x) ** 4, Math.cos(x) ** 2, 1]),
      angulos.map((x) => Math.cos(4 * x)),
    );
    for (const x of [-0.4, 2.2, 5.1])
      if (Math.abs(a * Math.cos(x) ** 4 + b * Math.cos(x) ** 2 + c - Math.cos(4 * x)) > 1e-9)
        throw new Error(`la identidad falla en x=${x}`);
    cuadra1617('ex1617-rec-1-de-moivre-y-el-coseno-cuadruple', 'El coeficiente de cos⁴x', a);
  });
});

describe('2016-2017 · rec 4.ª · 2 · el límite de uno partido n', () => {
  it('con épsilon una centésima hace falta llegar a 101', () => {
    /* Se busca el menor natural a partir del cual la sucesión ya no se sale de
       la banda, contando: el último que sí se sale, más uno. */
    const eps = 0.01;
    let ultimoFuera = 0;
    for (let n = 1; n <= 100000; n++) if (Math.abs(1 / n) >= eps) ultimoFuera = n;
    cuadra1617('ex1617-rec-2-el-limite-de-uno-partido-n', 'El m que hace falta', ultimoFuera + 1);
  });
});

describe('2016-2017 · rec 5.ª · 1 · una sola raíz y hay que probarlo', () => {
  const id = 'ex1617-5rec-1-una-sola-raiz-y-hay-que-probarlo';
  const y = (x: number) => x * Math.exp(x) - 1;

  it('y(1) vale e − 1', () => cuadra16175(id, 'El extremo derecho del intervalo', y(1)));

  it('y el único punto crítico está en −1', () =>
    cuadra16175(id, 'El único punto crítico', raiz((x) => deriva(y, x), -5, 5)));

  it('y en total hay una sola raíz real', () => {
    /* Se recorre un intervalo ancho por los dos lados y se cuentan los cambios
       de signo. Por la izquierda la función tiende a −1, así que no hay nada
       que se escape por ahí. */
    let n = 0;
    let ultimo = 0;
    for (let x = -60; x <= 10; x += 0.0005) {
      const s = Math.sign(y(x));
      if (s !== 0 && ultimo !== 0 && s !== ultimo) n++;
      if (s !== 0) ultimo = s;
    }
    cuadra16175(id, 'Cuántas raíces reales', n);
  });
});

describe('2016-2017 · rec 5.ª · 2 · los signos de Taylor', () => {
  const id = 'ex1617-5rec-2-los-signos-de-taylor-leidos-en-la-grafica';
  /* LECTURA DE LA FIGURA: la curva entra positiva, corta el eje enseguida,
     baja a un mínimo de unos −2 poco después de x = 1, vuelve a cortar en
     x = 3, sube a un máximo de unos 2,3 entre 4 y 5, y corta en x = 6. La
     cúbica con esos tres cortes y esas dos alturas es −0,25(x−0,5)(x−3)(x−6). */
  const y = (x: number) => -0.25 * (x - 0.5) * (x - 3) * (x - 6);

  it('la cúbica reconstruida encaja con el dibujo', () => {
    for (const corte of [0.5, 3, 6]) if (Math.abs(y(corte)) > 1e-12) throw new Error(`no corta en ${corte}`);
    if (!(y(0) > 0)) throw new Error('no entra positiva');
    const minimo = raiz((x) => deriva(y, x), 1, 3);
    const maximo = raiz((x) => deriva(y, x), 3, 6);
    if (!(minimo > 1 && minimo < 2 && y(minimo) < -1.5 && y(minimo) > -2.5))
      throw new Error('el mínimo no está donde dice el dibujo');
    if (!(maximo > 4 && maximo < 5 && y(maximo) > 2 && y(maximo) < 2.6))
      throw new Error('el máximo no está donde dice el dibujo');
  });

  it('a es negativo', () => cuadra16175(id, 'El signo de a', Math.sign(y(2))));

  it('b es positivo', () => cuadra16175(id, 'El signo de b', Math.sign(deriva(y, 2))));

  it('y c también', () => cuadra16175(id, 'El signo de c', Math.sign(deriva2(y, 2) / 2)));
});

describe('2015-2016 · rec 4.ª · 1 · la potencia negativa', () => {
  const id = 'ex1516-rec-1-potencia-negativa-y-la-identidad-del-seno';
  /* z = 3∠(π/8). La potencia −4 se calcula multiplicando cuatro veces e
     invirtiendo, no aplicando la regla de los exponentes. */
  const z = polar(3, Math.PI / 8);
  let cuarta: C = [1, 0];
  for (let k = 0; k < 4; k++) cuarta = cPor(cuarta, z);
  const inversa: C = [cuarta[0] / cModulo(cuarta) ** 2, -cuarta[1] / cModulo(cuarta) ** 2];

  it('el módulo es 1/81', () => cuadra1516(id, 'El módulo de la potencia', cModulo(inversa)));

  it('y el argumento, −π/2', () =>
    cuadra1516(id, 'El argumento de la potencia', Math.atan2(inversa[1], inversa[0])));
});

describe('2015-2016 · rec 4.ª · 2 · la serie geométrica de ejemplo', () => {
  it('suma 3', () => {
    let s = 0;
    for (let n = 400; n >= 0; n--) s += (2 / 3) ** n;
    cuadra1516('ex1516-rec-2-recurrente-y-geometrica', 'El ejemplo de serie geométrica, sumado', s);
  });
});

describe('2015-2016 · rec 5.ª · 1 · el coseno hiperbólico y su inversa', () => {
  const id = 'ex1516-5rec-1-el-coseno-hiperbolico-y-su-inversa';
  const Ch = (x: number) => (Math.exp(x) + Math.exp(-x)) / 2;

  it('el mínimo vale 1', () => {
    /* Está en el borde de nada: el mínimo cae en x = 0 y es interior, así que
       se puede buscar recorriendo los dos lados. */
    let menor = Infinity;
    for (let x = -20; x <= 20; x += 0.0005) menor = Math.min(menor, Ch(x));
    cuadra15165(id, 'El valor mínimo', menor);
  });

  it('y la inversa de 2 es 1,31696', () =>
    cuadra15165(id, 'La inversa en un punto', raiz((x) => Ch(x) - 2, 0, 10)));
});

describe('2015-2016 · rec 5.ª · 2 · el logaritmo y la armónica alternada', () => {
  const id = 'ex1516-5rec-2-el-logaritmo-y-la-armonica-alternada';

  it('el coeficiente de x⁴ es −1/4', () => {
    /* **Fórmula integral de Cauchy** otra vez, y aquí es especialmente cómoda:
       ln(1+z) es analítica en el disco de radio 1 —el corte de rama empieza en
       −1— así que promediar sobre una circunferencia de radio 0,5 da el
       coeficiente sin derivar cuatro veces. */
    const r = 0.5;
    const N = 512;
    const n = 4;
    let suma = 0;
    for (let j = 0; j < N; j++) {
      const th = (2 * Math.PI * j) / N;
      const z = polar(r, th);
      const uno: C = [1 + z[0], z[1]];
      const log: C = [Math.log(cModulo(uno)), Math.atan2(uno[1], uno[0])];
      suma += (log[0] * Math.cos(n * th) + log[1] * Math.sin(n * th)) / r ** n;
    }
    cuadra15165(id, 'El coeficiente de x⁴', suma / N);
  });

  it('y la armónica alternada suma ln 2', () => {
    /* Converge despacio y alternando, así que se promedian dos sumas parciales
       consecutivas: el error pasa de 1/n a 1/n². */
    let s = 0;
    let previa = 0;
    for (let n = 1; n < 400000; n++) {
      previa = s;
      s += (-1) ** (n + 1) / n;
    }
    cuadra15165(id, 'La suma de la serie', (s + previa) / 2);
  });
});
