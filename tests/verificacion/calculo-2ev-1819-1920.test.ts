/**
 * Las segundas evaluaciones de Cálculo de 2018-2019 y 2019-2020. Nueve
 * respuestas entre las dos.
 *
 * El ejercicio 3 de 2018-2019 pide el coeficiente general del desarrollo de
 * y = x·eˣ, y ahí el test hace algo que no había hecho todavía: saca el
 * coeficiente con **la fórmula integral de Cauchy**, promediando la función
 * sobre una circunferencia del plano complejo. Derivar cinco veces a mano —o
 * numéricamente— es justo lo que se quería evitar; un promedio de doscientos
 * cincuenta y seis puntos da 1/24 con diez cifras buenas.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { cModulo, cPor, deriva, deriva2, deriva3, maximiza, type C } from './numerico';

const cuadra1920 = convocatoria('calculo', '2019-2020-2ev');
const cuadra1819 = convocatoria('calculo', '2018-2019-2ev');

const cExp = ([a, b]: C): C => [Math.exp(a) * Math.cos(b), Math.exp(a) * Math.sin(b)];
const polar = (r: number, rad: number): C => [r * Math.cos(rad), r * Math.sin(rad)];

describe('2019-2020 · 1 · el logaritmo de módulo uno', () => {
  const id = 'ex1920-2ev-1-logaritmo-de-modulo-uno';
  const den: C = [1, Math.sqrt(3)];
  const argumento = Math.atan2(den[1], den[0]);

  it('el denominador está a π/3 radianes', () => cuadra1920(id, 'El argumento del denominador', argumento));

  it('y omega comparte ese argumento', () => {
    /* ω/(1+i√3) real obliga a que los dos argumentos difieran en un múltiplo
       de π; con k=0 son iguales. Se comprueba dividiendo de verdad: la parte
       imaginaria del cociente tiene que salir nula. */
    const omega = polar(1, argumento);
    const cociente = cPor(omega, [den[0] / cModulo(den) ** 2, -den[1] / cModulo(den) ** 2]);
    if (Math.abs(cociente[1]) > 1e-12) throw new Error('el cociente no sale real');
    cuadra1920(id, 'El argumento de omega', Math.atan2(omega[1], omega[0]));
  });
});

describe('2019-2020 · 2 · el orden en el límite', () => {
  it('el divisor del épsilon es 2', () => {
    /* Con ε = (x−y)/k, las dos bandas se separan cuando 2ε ≤ x−y, o sea k ≥ 2.
       Se busca el menor entero que lo consigue en vez de darlo por sabido. */
    const [x, y] = [5, 2];
    let k = 1;
    while (!(y + (x - y) / k <= x - (x - y) / k)) k++;
    cuadra1920('ex1920-2ev-2-orden-en-el-limite', 'El épsilon que hace funcionar la prueba', k);
  });
});

describe('2019-2020 · 3 · el teorema de Fermat', () => {
  it('el cociente por la derecha vale −0,1', () => {
    /* El caso concreto del enunciado: −x² tiene un máximo en el origen, y el
       cociente incremental por la derecha es negativo. Ahí está la
       demostración: por la izquierda sale positivo, y solo el cero encaja con
       las dos. */
    const f = (x: number) => -(x ** 2);
    const porLaDerecha = (f(0 + 0.1) - f(0)) / 0.1;
    if (!(porLaDerecha < 0 && (f(0 - 0.1) - f(0)) / -0.1 > 0)) throw new Error('los dos lados no discrepan');
    cuadra1920('ex1920-2ev-3-teorema-de-fermat', 'El signo del cociente por la derecha', porLaDerecha);
  });
});

describe('2019-2020 · 4 · el McLaurin de la exponencial', () => {
  const id = 'ex1920-2ev-4-maclaurin-de-la-exponencial';
  /* De f solo se conoce su polinomio de grado 2, y para lo que se pide es
     suficiente: el coeficiente cuadrático de e^f solo depende de f, f′ y f″. */
  const P2 = (x: number) => -x + 2 * x * x;

  it('la derivada segunda de f vale 4', () => cuadra1920(id, 'La derivada segunda de f', deriva2(P2, 0)));

  it('y el coeficiente cuadrático de g es 5/2', () =>
    cuadra1920(id, 'El coeficiente cuadrático de g', deriva2((x) => Math.exp(P2(x)), 0) / 2));
});

describe('2018-2019 · 1 · la potencia real negativa', () => {
  const id = 'ex1819-2ev-1-potencia-real-negativa';
  const base: C = polar(2, 2);
  const argBase = Math.atan2(base[1], base[0]);

  it('con a = 3 el argumento vale 6', () => cuadra1819(id, 'El módulo y el argumento', 3 * argBase));

  it('y el primer a que sirve es π/2', () => {
    /* z es real negativo cuando su argumento es π módulo 2π, y el módulo 2^a
       tiene que quedar entre 1 y 2⁶, o sea a entre 0 y 6. Se recorren los
       candidatos y se comprueba cada uno metiéndolo en la potencia. */
    const validos: number[] = [];
    for (let k = 0; k < 10; k++) {
      const a = (Math.PI + 2 * Math.PI * k) / argBase;
      const z = polar(2 ** a, a * argBase);
      if (z[0] < 0 && Math.abs(z[1]) < 1e-9 && cModulo(z) > 1 && cModulo(z) < 2 ** 6) validos.push(a);
    }
    if (!validos.length) throw new Error('no hay ningún a válido');
    cuadra1819(id, 'El primer valor válido', Math.min(...validos));
  });
});

describe('2018-2019 · 2 · Lagrange y Bolzano', () => {
  const id = 'ex1819-2ev-2-lagrange-y-bolzano';
  const f = (x: number) => Math.exp(x) * (x - 1) - x + 2;

  it('f(1) vale 1', () => cuadra1819(id, 'Los valores en los extremos', f(1)));

  it('y f′(1) vale e − 1', () => cuadra1819(id, 'La derivada en los extremos', deriva(f, 1)));
});

describe('2018-2019 · 3 · la serie de potencias', () => {
  const id = 'ex1819-2ev-3-serie-de-potencias';
  /* y′ = y + eˣ con y(0) = 0. La función que lo cumple es x·eˣ, y antes de
     usarla se comprueba contra la ecuación. */
  const y = (x: number) => x * Math.exp(x);

  it('la solución propuesta resuelve la ecuación', () => {
    if (Math.abs(y(0)) > 1e-12) throw new Error('no arranca en cero');
    for (const x of [-0.7, 0.4, 1.3])
      if (Math.abs(deriva(y, x) - (y(x) + Math.exp(x))) > 1e-6) throw new Error(`la EDO falla en x=${x}`);
  });

  it("y'''(0) vale 3", () => cuadra1819(id, 'Las primeras derivadas', deriva3(y, 0)));

  it('y el coeficiente de x⁵ es 1/4!', () => {
    /* **Fórmula integral de Cauchy**: el coeficiente n-ésimo del desarrollo es
       el promedio de y(z)·z^{−n} sobre una circunferencia. Con 256 puntos sale
       exacto hasta la última cifra, y sin derivar cinco veces. */
    const n = 5;
    const N = 256;
    let suma = 0;
    for (let j = 0; j < N; j++) {
      const th = (2 * Math.PI * j) / N;
      const z = polar(1, th);
      const valor = cPor(z, cExp(z));
      /* Multiplicar por e^{−inθ} y quedarse con la parte real. */
      suma += valor[0] * Math.cos(n * th) + valor[1] * Math.sin(n * th);
    }
    const coeficiente = suma / N;
    /* Y del coeficiente se despeja el factorial buscando el entero. */
    let k = 0;
    let fact = 1;
    while (Math.abs(1 / fact - coeficiente) > 1e-9) {
      k++;
      fact *= k;
      if (k > 12) throw new Error(`el coeficiente ${coeficiente} no es el inverso de ningún factorial`);
    }
    cuadra1819(id, 'El coeficiente general', k);
  });
});

describe('2018-2019 · 4 · el alambre entre círculo y cuadrado', () => {
  const id = 'ex1819-2ev-4-alambre-circulo-y-cuadrado';
  /* x metros para el círculo —radio x/(2π)— y 10−x para el cuadrado. */
  const area = (x: number) => (x * x) / (4 * Math.PI) + (10 - x) ** 2 / 16;
  const mejor = maximiza((x) => -area(x), 0.001, 9.999);

  it('al círculo le tocan 4,399 m', () => cuadra1819(id, 'Dónde cortar', mejor.x));

  it('y el área mínima es 3,5006 m²', () => cuadra1819(id, 'El área mínima', area(mejor.x)));
});
