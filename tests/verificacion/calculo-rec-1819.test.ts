/**
 * Las dos recuperaciones de Cálculo de 2018-2019, la de la 4.ª y la de la 5.ª.
 * Once respuestas entre las dos.
 *
 * El ejercicio 3 de la recuperación de la 5.ª es una figura sin un solo
 * número: dos curvas, y hay que decir cuál es la derivada de cuál y después
 * contar los extremos de su cuarta potencia. El test construye una pareja
 * (F, F′) que tenga **exactamente la forma descrita** —F con dos ceros, F′ con
 * uno, y F′ derivada de F de verdad— y cuenta sobre ella los cambios de signo.
 * Si la forma elegida fuera la equivocada, el recuento no saldría.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { cCos, cModulo, cPor, cResta, cSen, deriva, raiz, type C } from './numerico';

const cuadra4 = convocatoria('calculo', '2018-2019-4ev-rec');
const cuadra5 = convocatoria('calculo', '2018-2019-5ev-rec');

/** Cuántas veces cambia de signo una función en el intervalo. */
const cambios = (f: (x: number) => number, a: number, b: number) => {
  let n = 0;
  let ultimo = 0;
  for (let x = a; x <= b; x += (b - a) / 20000) {
    const s = Math.sign(f(x));
    if (s !== 0 && ultimo !== 0 && s !== ultimo) n++;
    if (s !== 0) ultimo = s;
  }
  return n;
};

describe('2018-2019 · rec 4.ª · 1 · una desigualdad que no está definida', () => {
  const id = 'ex1819-rec-1-una-desigualdad-que-no-esta-definida';

  it('la igualdad se da en la circunferencia unidad', () => {
    /* 1/z − conj(z) = conj(z)·(1/|z|² − 1): el paréntesis se anula donde el
       módulo vale uno, y el test lo resuelve en vez de leerlo. */
    cuadra4(id, 'El radio de la circunferencia donde hay igualdad', raiz((r) => 1 / (r * r) - 1, 0.2, 5));
  });

  it('y sobre el eje real positivo llega hasta 1', () =>
    cuadra4(id, 'El extremo positivo del segmento real', raiz((x) => 1 / x - x, 0.2, 5)));
});

describe('2018-2019 · rec 4.ª · 2 · seno igual a seno del doble', () => {
  it('el coseno tiene que valer 1/2', () => {
    /* sen 2z = 2·sen z·cos z también en complejos, y de ahí sale el factor
       1 − 2cos z. La identidad se comprueba antes de usarla. */
    for (const z of [
      [0.9, -0.6],
      [-1.4, 1.1],
    ] as C[]) {
      const doble = cSen(cPor([2, 0], z));
      if (cModulo(cResta(doble, cPor([2, 0], cPor(cSen(z), cCos(z))))) > 1e-9)
        throw new Error('la fórmula del ángulo doble no cuadra');
    }
    cuadra4('ex1819-rec-2-seno-igual-a-seno-del-doble', 'El coseno que hace falta', raiz((c) => 1 - 2 * c, -3, 3));
  });
});

describe('2018-2019 · rec 4.ª · 3 · negar un límite', () => {
  it('la distancia nunca baja de 2', () => {
    /* Para negar que 1/n tienda a −2 basta un épsilon que la sucesión no
       alcance nunca, y la distancia a −2 se mantiene por encima de 2. Se mide
       el ínfimo recorriendo. */
    const distancia = (n: number) => Math.abs(1 / n - -2);
    let menor = Infinity;
    for (let n = 1; n <= 2_000_000; n++) menor = Math.min(menor, distancia(n));
    if (!(menor > 2)) throw new Error('alguna vez baja de 2, y entonces no habría contradicción');
    cuadra4('ex1819-rec-3-negar-un-limite', 'La distancia que nunca baja', Math.round(menor * 1e6) / 1e6);
  });
});

describe('2018-2019 · rec 5.ª · 1 · la sucesión que se cae en el cien', () => {
  const id = 'ex1819-5rec-1-la-sucesion-que-se-cae-en-el-cien';
  const a = (n: number) => (n >= 100 ? 5 - 2 / n : n ** 3);

  it('converge a 5', () => {
    const lejos = [1e5, 1e7, 1e9].map(a);
    if (Math.abs(lejos[2] - lejos[1]) > 1e-6) throw new Error('no se estabiliza');
    cuadra5(id, 'El límite', lejos[2]);
  });

  it('y el crecimiento se rompe una sola vez, en n = 99', () => {
    const fallos: number[] = [];
    for (let n = 1; n <= 200000; n++) if (a(n) > a(n + 1)) fallos.push(n);
    if (fallos.length !== 1) throw new Error(`falla ${fallos.length} veces, y debería fallar una`);
    cuadra5(id, 'Dónde se rompe el crecimiento', fallos[0]);
  });
});

describe('2018-2019 · rec 5.ª · 2 · tres McLaurin y uno que no existe', () => {
  const id = 'ex1819-5rec-2-tres-mclaurin-y-uno-que-no-existe';
  /* El coeficiente se saca con la fórmula integral de Cauchy: el promedio de
     f(z)·z^{−n} sobre la circunferencia unidad. Así no hay que derivar seis
     veces ni multiplicar series a mano. */
  const cExp = ([a, b]: C): C => [Math.exp(a) * Math.cos(b), Math.exp(a) * Math.sin(b)];
  const coeficiente = (n: number) => {
    const N = 256;
    let suma = 0;
    for (let j = 0; j < N; j++) {
      const th = (2 * Math.PI * j) / N;
      const z: C = [Math.cos(th), Math.sin(th)];
      const z4 = cPor(cPor(z, z), cPor(z, z));
      const valor = cPor(z4, cExp(z));
      suma += valor[0] * Math.cos(n * th) + valor[1] * Math.sin(n * th);
    }
    return suma / N;
  };

  it('el coeficiente de x⁶ es 1/2', () => {
    /* Los cuatro primeros coeficientes tienen que ser cero: multiplicar por x⁴
       desplaza la serie entera. */
    for (const n of [0, 1, 2, 3])
      if (Math.abs(coeficiente(n)) > 1e-9) throw new Error(`el coeficiente de x^${n} no es cero`);
    cuadra5(id, 'El coeficiente de x⁶', coeficiente(6));
  });

  it('y la sexta derivada en cero vale 360', () => {
    let factorial = 1;
    for (let k = 2; k <= 6; k++) factorial *= k;
    cuadra5(id, 'La sexta derivada en cero', coeficiente(6) * factorial);
  });
});

describe('2018-2019 · rec 5.ª · 3 · cuál de las dos es la derivada', () => {
  const id = 'ex1819-5rec-3-cual-de-las-dos-es-la-derivada';
  /* LECTURA DE LA FIGURA: la curva A corta el eje dos veces —una en el origen—
     y tiene un máximo en medio; la B entra alta, baja, corta el eje una sola
     vez justo bajo ese máximo, toca fondo cerca del extremo derecho y repunta.
     Una pareja con esa forma exacta: F′ = (x−1,5)² − 1 en (−1, 2), que corta
     el eje una vez y tiene su mínimo cerca del borde; y su primitiva, que pasa
     por el origen. */
  const [a, b] = [-1, 2];
  const F = (x: number) => (x - 1.5) ** 3 / 3 - x + 1.125;
  const Fp = (x: number) => (x - 1.5) ** 2 - 1;

  it('la pareja construida tiene la forma del dibujo', () => {
    for (const x of [-0.6, 0.7, 1.8])
      if (Math.abs(deriva(F, x) - Fp(x)) > 1e-6) throw new Error('la segunda no es la derivada de la primera');
    if (Math.abs(F(0)) > 1e-12) throw new Error('la primera no pasa por el origen');
    if (cambios(F, a, b) !== 2) throw new Error('la primera no corta el eje dos veces');
    if (cambios(Fp, a, b) !== 1) throw new Error('la segunda no corta el eje una vez');
  });

  it('el intervalo queda partido en cuatro', () => {
    /* g′ = 4F³F′ cambia de signo en los ceros de F y en los de F′. */
    const gp = (x: number) => 4 * F(x) ** 3 * Fp(x);
    cuadra5(id, 'En cuántos tramos se parte el intervalo', cambios(gp, a, b) + 1);
  });

  it('y g tiene tres extremos relativos', () => {
    const gp = (x: number) => 4 * F(x) ** 3 * Fp(x);
    cuadra5(id, 'Cuántos extremos relativos', cambios(gp, a, b));
  });
});

describe('2018-2019 · rec 5.ª · 4 · Darboux', () => {
  it('el punto que garantiza el teorema es c = 1', () => {
    const f = (x: number) => x ** 3 - 3 * x;
    /* Las hipótesis del enunciado, comprobadas: la derivada vale −3 en 0 y 9
       en 2, así que el cero está entre medias aunque f′ no sea continua por
       hipótesis — que es lo que separa Darboux de Bolzano. */
    if (Math.abs(deriva(f, 0) + 3) > 1e-6 || Math.abs(deriva(f, 2) - 9) > 1e-6)
      throw new Error('las derivadas en los extremos no son las del enunciado');
    cuadra5('ex1819-5rec-4-darboux', 'El teorema, sobre un caso concreto', raiz((x) => deriva(f, x), 0, 2));
  });
});
