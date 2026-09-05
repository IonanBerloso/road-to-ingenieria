/**
 * Las recuperaciones de Cálculo de 2019-2020 y 2020-2021: la de la 4.ª de
 * 2019-2020 y las dos de 2020-2021. Trece respuestas entre las tres.
 *
 * El ejercicio 2 de la recuperación de 2020-2021 es el que mejor premia mirar
 * antes de calcular: e^{iz} − i·sen z parece una ecuación complicada y es
 * cos z disfrazado, porque la fórmula de Euler dice exactamente eso. El test
 * lo comprueba en vez de creérselo —evalúa los dos lados en varios complejos
 * elegidos al azar— y solo entonces resuelve cos z = 1.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { cCos, cModulo, cPor, cResta, cSen, deriva, deriva2, deriva3, raiz, type C } from './numerico';
import { resuelve } from './lineal';

const cuadra2021 = convocatoria('calculo', '2020-2021-4ev-rec');
const cuadra20215 = convocatoria('calculo', '2020-2021-5ev-rec');
const cuadra1920 = convocatoria('calculo', '2019-2020-4ev-rec');

const cExp = ([a, b]: C): C => [Math.exp(a) * Math.cos(b), Math.exp(a) * Math.sin(b)];
const polar = (r: number, rad: number): C => [r * Math.cos(rad), r * Math.sin(rad)];

function circunferencia(puntos: number[][]) {
  const [D, E, F] = resuelve(
    puntos.map(([x, y]) => [x, y, 1]),
    puntos.map(([x, y]) => -(x * x + y * y)),
  );
  return { centro: [-D / 2, -E / 2], radio: Math.sqrt((D * D + E * E) / 4 - F) };
}

describe('2020-2021 · rec 4.ª · 1 · las tres raíces y su triángulo', () => {
  const id = 'ex2021-rec-1-tres-raices-que-forman-un-triangulo';
  /* 4z³ + 4z² + (1−2i)z = 0. Sale el cero y las dos raíces de la cuadrática,
     que se obtienen con la fórmula de siempre pero en complejos. */
  const discriminante: C = [0, 32];
  const raizDelDiscriminante = polar(Math.sqrt(cModulo(discriminante)), Math.atan2(32, 0) / 2);

  it('la raíz del discriminante tiene parte real 4', () => {
    if (cModulo(cResta(cPor(raizDelDiscriminante, raizDelDiscriminante), discriminante)) > 1e-9)
      throw new Error('elevada al cuadrado no da el discriminante');
    cuadra2021(id, 'La raíz cuadrada que aparece en el discriminante', raizDelDiscriminante[0]);
  });

  it('y el triángulo encierra 0,25', () => {
    const raices: C[] = [
      [0, 0],
      [(-4 + raizDelDiscriminante[0]) / 8, raizDelDiscriminante[1] / 8],
      [(-4 - raizDelDiscriminante[0]) / 8, -raizDelDiscriminante[1] / 8],
    ];
    /* Cada raíz se mete en la ecuación antes de usarla para nada. */
    for (const z of raices) {
      const z2 = cPor(z, z);
      const valor = [
        4 * cPor(z2, z)[0] + 4 * z2[0] + (1 * z[0] + 2 * z[1]),
        4 * cPor(z2, z)[1] + 4 * z2[1] + (1 * z[1] - 2 * z[0]),
      ];
      if (cModulo(valor as C) > 1e-9) throw new Error(`${z} no resuelve la ecuación`);
    }
    /* El área, con el producto vectorial de los dos lados. */
    const [A, B, C3] = raices;
    const area = Math.abs((B[0] - A[0]) * (C3[1] - A[1]) - (B[1] - A[1]) * (C3[0] - A[0])) / 2;
    cuadra2021(id, 'El área del triángulo', area);
  });
});

describe('2020-2021 · rec 4.ª · 2 · la ecuación que se desarma sola', () => {
  it('lo que queda es cos z = 1', () => {
    /* Euler dice que e^{iz} = cos z + i·sen z, así que restarle i·sen z deja
       el coseno pelado. Se comprueba sobre complejos con parte imaginaria, que
       es donde la identidad podría fallar si estuviera mal recordada. */
    for (const z of [
      [0.7, -1.3],
      [-2.1, 0.4],
      [1.5, 2.2],
    ] as C[]) {
      const izquierda = cResta(cExp(cPor([0, 1], z)), cPor([0, 1], cSen(z)));
      if (cModulo(cResta(izquierda, cCos(z))) > 1e-9) throw new Error('la identidad de Euler no cuadra');
    }
    /* Y el segundo miembro es 1, así que la ecuación pendiente es cos z = 1. */
    cuadra2021('ex2021-rec-2-la-ecuacion-que-se-desarma-sola', 'La ecuación que queda', 1);
  });
});

describe('2020-2021 · rec 4.ª · 3 · la desigualdad estricta no sobrevive', () => {
  it('el contraejemplo tiende a cero', () => {
    /* 1/n es estrictamente positiva en todo término y su límite no lo es: ahí
       está la diferencia entre las dos afirmaciones. */
    const a = (n: number) => 1 / n;
    for (const n of [1, 100, 1e6]) if (!(a(n) > 0)) throw new Error('el contraejemplo no es estrictamente positivo');
    const lejos = [1e6, 1e9, 1e12].map(a);
    if (Math.abs(lejos[2] - lejos[1]) > 1e-8) throw new Error('no se estabiliza');
    cuadra2021('ex2021-rec-3-la-desigualdad-estricta-no-sobrevive', 'El contraejemplo de la b)', lejos[2]);
  });
});

describe('2020-2021 · rec 5.ª · 1 · cuando el cociente es real', () => {
  const id = 'ex2021-5rec-1-cuando-el-cociente-es-real';
  /* ω = (2z−i)/(2+iz). El lugar donde ω es real se busca anulando su parte
     imaginaria, punto a punto, y se le ajusta la circunferencia. */
  const omega = (x: number, y: number): C => {
    const num: C = [2 * x, 2 * y - 1];
    const den: C = [2 - y, x];
    const m = cModulo(den) ** 2;
    return [(num[0] * den[0] + num[1] * den[1]) / m, (num[1] * den[0] - num[0] * den[1]) / m];
  };
  /* De las dos ramas de la circunferencia se toma la de abajo; el intervalo
     la contiene entera y deja fuera el punto donde el denominador se anula. */
  const enElLugar = (x: number) => [x, raiz((y) => omega(x, y)[1], 0.3, 1.24)];
  const { centro, radio } = circunferencia([-0.4, 0, 0.5].map(enElLugar));

  it('el centro está a 1,25 de altura', () => cuadra20215(id, 'La ordenada del centro', centro[1]));

  it('el radio es 0,75', () => cuadra20215(id, 'El radio', radio));

  it('y el punto que sobra está en 2i', () => {
    /* El denominador 2+iz se anula en un solo punto, y ese punto no puede
       estar en ninguno de los dos lugares porque ahí ω no existe. Se busca
       resolviendo, y se comprueba que está sobre la circunferencia ajustada
       —por eso hay que quitarlo a mano—. */
    const denominador = (x: number, y: number): C => [2 - y, x];
    const ordenada = raiz((y) => denominador(0, y)[0], 0.5, 5);
    if (cModulo(denominador(0, ordenada)) > 1e-12) throw new Error('ahí el denominador no se anula');
    if (Math.abs(Math.hypot(0 - centro[0], ordenada - centro[1]) - radio) > 1e-9)
      throw new Error('el punto excluido no está en la circunferencia');
    cuadra20215(id, 'El punto que hay que quitar', ordenada);
  });
});

describe('2020-2021 · rec 5.ª · 2 · la tangente al folio de Descartes', () => {
  const id = 'ex2021-5rec-2-la-tangente-al-folio-de-descartes';
  /* y³ + x³ − 3xy = 0. Para cada x se despeja la y de la rama que pasa por
     (1,5, 1,5) y se deriva esa función: la derivación implícita se sustituye
     por una derivada numérica sobre la curva de verdad. */
  const rama = (x: number) => raiz((y) => y ** 3 + x ** 3 - 3 * x * y, 1.1, 2.4);
  const pendiente = deriva(rama, 1.5, 1e-4);

  it('la pendiente es −1', () => {
    if (Math.abs(rama(1.5) - 1.5) > 1e-9) throw new Error('la rama no pasa por el punto del enunciado');
    cuadra20215(id, 'La pendiente', pendiente);
  });

  it('y la tangente corta el eje en 3', () =>
    cuadra20215(id, 'Dónde corta al eje de ordenadas', 1.5 + pendiente * (0 - 1.5)));
});

describe('2020-2021 · rec 5.ª · 3 · McLaurin sin resolver la ecuación', () => {
  const id = 'ex2021-5rec-3-mclaurin-sin-resolver-la-ecuacion';
  /* y′ = (x+1)y con y(0)=1. La solución es e^{x+x²/2}, y se comprueba contra
     la ecuación antes de derivarla tres veces. */
  const y = (x: number) => Math.exp(x + (x * x) / 2);

  it('la solución cumple la ecuación', () => {
    if (Math.abs(y(0) - 1) > 1e-12) throw new Error('no pasa por (0,1)');
    for (const x of [-0.8, 0.3, 1.1])
      if (Math.abs(deriva(y, x) - (x + 1) * y(x)) > 1e-6) throw new Error(`la EDO falla en x=${x}`);
  });

  it("y''(0) vale 2", () => cuadra20215(id, 'La segunda derivada en cero', deriva2(y, 0)));

  it("y'''(0) vale 4", () => cuadra20215(id, 'La tercera derivada en cero', deriva3(y, 0)));

  it('y el coeficiente cúbico es 2/3', () =>
    cuadra20215(id, 'El coeficiente de x³', deriva3(y, 0) / 6));
});

describe('2019-2020 · rec 4.ª · 1 · media recta y parábola', () => {
  const id = 'ex1920-rec-1-media-recta-y-parabola';

  it('la recta que separa tiene pendiente 1', () => {
    /* La frontera de |z−2| > |z−2i| es la mediatriz del segmento que une los
       dos puntos. Se buscan dos de sus puntos y se mide la pendiente. */
    const enLaFrontera = (x: number) => raiz((y) => Math.hypot(x - 2, y) - Math.hypot(x, y - 2), -20, 20);
    const [a, b] = [-3, 4];
    cuadra1920(id, 'La recta que separa', (enLaFrontera(b) - enLaFrontera(a)) / (b - a));
  });

  it('y el vértice de la parábola está a altura 2', () => {
    /* La segunda frontera es |z| + Im(z) = 4. Sobre el eje vertical eso es
       y + y = 4, y ese punto es el vértice: se comprueba que es el más alto de
       la curva. */
    const enLaParabola = (x: number) => raiz((y) => Math.hypot(x, y) + y - 4, -50, 50);
    const vertice = enLaParabola(0);
    for (const x of [-3, -0.5, 1.7, 4])
      if (enLaParabola(x) > vertice + 1e-9) throw new Error(`en x=${x} la parábola sube más`);
    cuadra1920(id, 'El vértice de la parábola', vertice);
  });
});

describe('2019-2020 · rec 4.ª · 2 · el coseno que vale dos', () => {
  it('la parte imaginaria es 1,31696', () => {
    /* Sobre el eje imaginario el coseno se vuelve un coseno hiperbólico y
       puede pasar de 1. Se busca la altura donde vale 2 y se comprueba con el
       coseno complejo de verdad. */
    const c = raiz((t) => Math.cosh(t) - 2, 0.1, 5);
    const valor = cCos([0, c]);
    if (Math.abs(valor[0] - 2) > 1e-9 || Math.abs(valor[1]) > 1e-12)
      throw new Error('cos(ic) no vale 2');
    cuadra1920('ex1920-rec-2-coseno-igual-a-dos', 'La parte imaginaria de la solución', c);
  });
});

describe('2019-2020 · rec 4.ª · 3 · el signo sobrevive al límite', () => {
  it('la cota del absurdo es 0,3', () => {
    const L = 0.6;
    const eps = L / 2;
    if (!(L - eps > 0)) throw new Error('esa cota no llega al absurdo');
    cuadra1920('ex1920-rec-3-el-signo-sobrevive-al-limite', 'La cota que aparece en el absurdo', L - eps);
  });
});

describe('2019-2020 · rec 4.ª · 4 · la sucesión que se desploma', () => {
  it('el supremo vale 5', () => {
    /* 4+1/n hasta el 9 y después (2/3)ⁿ, que ya vale menos de dos centésimas.
       El supremo está en el primer término y **se alcanza**, que es la mitad
       de lo que el apartado pregunta. */
    const a = (n: number) => (n < 10 ? 4 + 1 / n : (2 / 3) ** n);
    let mayor = -Infinity;
    for (let n = 1; n <= 100000; n++) mayor = Math.max(mayor, a(n));
    cuadra1920('ex1920-rec-4-la-sucesion-que-se-desploma', 'El supremo', mayor);
  });
});
