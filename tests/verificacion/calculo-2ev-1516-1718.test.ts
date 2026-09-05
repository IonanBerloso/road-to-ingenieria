/**
 * Las segundas evaluaciones de Cálculo de 2015-2016, 2016-2017 y 2017-2018.
 * Diecisiete respuestas entre las tres.
 *
 * Tres de estos pasos no piden un número sino **un signo** o **un recuento**:
 * qué signo tiene (y′)³ cuando la función crece, qué signo tiene f(a) − a
 * cuando f no se sale de su intervalo, y cuántas condiciones distintas anulan
 * una derivada. Son los que más fácil sería contestar copiando la resolución,
 * así que aquí se contestan construyendo un caso concreto que cumpla las
 * hipótesis y midiendo sobre él.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { cModulo, cPor, deriva, deriva2, maximiza, raiz, type C } from './numerico';
import { resuelve } from './lineal';

const cuadra1718 = convocatoria('calculo', '2017-2018-2ev');
const cuadra1617 = convocatoria('calculo', '2016-2017-2ev');
const cuadra1516 = convocatoria('calculo', '2015-2016-2ev');

const cExp = ([a, b]: C): C => [Math.exp(a) * Math.cos(b), Math.exp(a) * Math.sin(b)];

function circunferencia(puntos: number[][]) {
  const [D, E, F] = resuelve(
    puntos.map(([x, y]) => [x, y, 1]),
    puntos.map(([x, y]) => -(x * x + y * y)),
  );
  return { centro: [-D / 2, -E / 2], radio: Math.sqrt((D * D + E * E) / 4 - F) };
}

/** Cuántas de estas funciones cambian de signo en el intervalo. */
const cuantasSeAnulan = (fs: Array<(x: number) => number>, a: number, b: number) =>
  fs.filter((f) => {
    let primero = 0;
    for (let x = a; x <= b; x += (b - a) / 2000) {
      const s = Math.sign(f(x));
      if (s === 0) return true;
      if (primero && s !== primero) return true;
      primero = primero || s;
    }
    return false;
  }).length;

describe('2017-2018 · 1 · dos complejos con tres condiciones', () => {
  const id = 'ex1718-2ev-1-dos-complejos-con-tres-condiciones';
  /* z₁ = λz₂ con λ real, y z₁+z₂ = 1+2i, así que z₂ = (1+2i)/(1+λ). */
  const z1 = (lambda: number): C => [(lambda * 1) / (1 + lambda), (lambda * 2) / (1 + lambda)];
  /* El intervalo evita λ = −1, donde la suma no se puede repartir. */
  const lambda = raiz((t) => z1(t)[0] - 2, -3, -1.5);

  it('la constante de proporcionalidad es −2', () => {
    const uno = z1(lambda);
    const dos: C = [1 - uno[0], 2 - uno[1]];
    /* Las tres condiciones, comprobadas sobre el resultado. */
    if (Math.abs(uno[0] - lambda * dos[0]) > 1e-9 || Math.abs(uno[1] - lambda * dos[1]) > 1e-9)
      throw new Error('el cociente no es λ');
    cuadra1718(id, 'La constante de proporcionalidad', lambda);
  });

  it('y la parte imaginaria de z₁ vale 4', () => cuadra1718(id, 'La parte imaginaria de z1', z1(lambda)[1]));
});

describe('2017-2018 · 2 · el dron', () => {
  const id = 'ex1718-2ev-2-el-dron';
  const h = (x: number) => -(x ** 3) / 160 + (3 * x * x) / 80;
  /* La pendiente máxima está donde h′ es máxima, o sea en el punto de
     inflexión. Se busca maximizando h′, no anulando h″. */
  const p = maximiza((x) => deriva(h, x), 0.01, 3.99).x;

  it('la pendiente es máxima en el kilómetro 2', () => {
    if (Math.abs(deriva2(h, p)) > 1e-4) throw new Error('ahí h″ no se anula, así que no es inflexión');
    cuadra1718(id, 'El punto de pendiente máxima', p);
  });

  it('y ahí gana altura a 5,625 km/h', () => cuadra1718(id, 'El apartado (d)', deriva(h, p) * 75));
});

describe('2017-2018 · 3 · el cable entre dos postes', () => {
  const id = 'ex1718-2ev-3-cable-entre-dos-postes';
  const largo = (x: number) => Math.hypot(x, 2) + Math.hypot(5 - x, 3);
  const mejor = maximiza((x) => -largo(x), 0.001, 4.999);

  it('el cable se clava a 2 m del poste corto', () => cuadra1718(id, 'El punto óptimo', mejor.x));

  it('y hacen falta 7,0711 m', () => {
    /* El truco clásico —reflejar un poste y unir en línea recta— da √(5²+5²).
       Se comprueba que el mínimo numérico coincide con él. */
    if (Math.abs(largo(mejor.x) - Math.hypot(5, 5)) > 1e-6) throw new Error('no coincide con la reflexión');
    cuadra1718(id, 'La longitud mínima', largo(mejor.x));
  });
});

describe('2016-2017 · 1 · el cociente real o imaginario', () => {
  const id = 'ex1617-2ev-1-cociente-real-o-imaginario';
  /* (z−i)/(z+i), racionalizado: el numerador es (z−i)·conj(z+i). */
  const numerador = (x: number, y: number) => cPor([x, y - 1], [x, -(y + 1)]);

  it('la parte imaginaria del numerador lleva un −2', () => {
    let k = 0;
    for (const [x, y] of [
      [0.7, 1.4],
      [-1.9, 0.3],
      [2.5, -0.8],
    ]) {
      const c = numerador(x, y)[1] / x;
      if (k && Math.abs(c - k) > 1e-9) throw new Error('el coeficiente no es constante');
      k = c;
    }
    cuadra1617(id, 'La parte imaginaria del cociente', k);
  });

  it('y el lugar del apartado (b) es la circunferencia unidad', () => {
    /* Imaginario puro quiere decir parte real nula. Se buscan tres puntos que
       la anulen y se les ajusta la circunferencia. */
    const enElLugar = (x: number) => [x, raiz((y) => numerador(x, y)[0], 0.01, 5)];
    cuadra1617(id, 'El radio de la circunferencia', circunferencia([0.5, 0.8, -0.3].map(enElLugar)).radio);
  });
});

describe('2016-2017 · 2 · Fermat y la inversa', () => {
  it('el denominador de la fórmula es positivo', () => {
    /* Una función que cumpla las hipótesis: creciente y cóncava. El logaritmo
       lo es en todo su dominio. Se comprueba que la fórmula de la derivada
       segunda de la inversa es cierta sobre ella, y se mide el signo del
       denominador. */
    const y = Math.log;
    const x0 = 1.6;
    if (!(deriva(y, x0) > 0 && deriva2(y, x0) < 0)) throw new Error('el ejemplo no crece o no es cóncavo');
    const inversa = Math.exp;
    const porLaFormula = -deriva2(y, x0) / deriva(y, x0) ** 3;
    if (Math.abs(deriva2(inversa, y(x0)) - porLaFormula) > 1e-4) throw new Error('la fórmula no cuadra');
    cuadra1617('ex1617-2ev-2-fermat-y-la-inversa', 'El signo del denominador', Math.sign(deriva(y, x0) ** 3));
  });
});

describe('2016-2017 · 3 · prolongar la parábola', () => {
  const id = 'ex1617-2ev-3-prolongacion-y-lagrange';
  const parabola = (x: number) => (x * x) / 4 + x / 4 - 2;
  const pendienteEn3 = deriva(parabola, 3);
  /* A la derecha del 3 la velocidad se mantiene: es la recta tangente. */
  const y = (x: number) => (x <= 3 ? parabola(x) : parabola(3) + pendienteEn3 * (x - 3));

  it('la pendiente heredada es 1,75', () => cuadra1617(id, 'La pendiente heredada', pendienteEn3));

  it('y la velocidad media en [−5,7] es 5/12', () => {
    /* La función empalma con continuidad —eso es lo que la hace válida— y la
       media es el cociente incremental sobre el intervalo entero. */
    if (Math.abs(y(3) - parabola(3)) > 1e-12) throw new Error('el empalme no es continuo');
    cuadra1617(id, 'La velocidad media', (y(7) - y(-5)) / 12);
  });
});

describe('2015-2016 · 1 · la exponencial compleja', () => {
  const id = 'ex1516-2ev-1-exponencial-compleja';
  const w: C = [1, 1];

  it('el logaritmo del módulo vale 0,3466', () => cuadra1516(id, 'El módulo del segundo miembro', Math.log(cModulo(w))));

  it('y la parte real de la primera solución es π/4', () => {
    /* De e^{iz} = w salen z = arg(w) + 2kπ − i·ln|w|. Se construye la de k=0 y
       se comprueba metiéndola en la ecuación. */
    const z: C = [Math.atan2(w[1], w[0]), -Math.log(cModulo(w))];
    const izquierda = cExp([-z[1], z[0]]); // e^{iz}, con iz = −Im(z) + i·Re(z)
    if (cModulo([izquierda[0] - w[0], izquierda[1] - w[1]]) > 1e-12)
      throw new Error('esa z no resuelve la ecuación');
    cuadra1516(id, 'La parte real de la primera solución', z[0]);
  });
});

describe('2015-2016 · 2 · el depósito cilíndrico', () => {
  const id = 'ex1516-2ev-2-deposito-cilindrico';
  const V = 5000;
  const alto = (r: number) => V / (Math.PI * r * r);
  /* Base a 5 €/m² y pared a 8 €/m², sin tapa. */
  const coste = (r: number) => 5 * Math.PI * r * r + 8 * 2 * Math.PI * r * alto(r);
  const mejor = maximiza((r) => -coste(r), 1, 100);

  it('el radio óptimo son 13,6556 m', () => cuadra1516(id, 'El radio óptimo', mejor.x));

  it('y la proporción h/r queda en 0,625', () => cuadra1516(id, 'La proporción del depósito', alto(mejor.x) / mejor.x));
});

describe('2015-2016 · 3 · el teorema del punto fijo', () => {
  it('la función auxiliar arranca no negativa', () => {
    /* g(x) = f(x) − x con f llevando [a,b] dentro de sí mismo. En a, f(a) ≥ a
       por fuerza, así que g(a) ≥ 0. Se comprueba con varias f distintas: si
       alguna diera negativo, el teorema no se sostendría. */
    const [a, b] = [1, 5];
    const candidatas = [
      (x: number) => (x + 3) / 2,
      (x: number) => 5 - (x - 1) / 2,
      (x: number) => 1 + 4 * Math.sin(((x - 1) * Math.PI) / 8),
    ];
    for (const f of candidatas) {
      for (let x = a; x <= b; x += 0.01)
        if (f(x) < a - 1e-9 || f(x) > b + 1e-9) throw new Error('esa f se sale del intervalo');
      if (f(a) - a < 0) throw new Error('g(a) sale negativo, y no puede');
    }
    cuadra1516('ex1516-2ev-3-teorema-del-punto-fijo', 'La función auxiliar en los extremos', 1);
  });
});

describe('2015-2016 · 4 · cuál es la derivada', () => {
  it('h′ se anula por dos condiciones distintas', () => {
    /* h′ = 2e^{−2x}·F·(F′−F). El primer factor no se anula nunca; los otros
       dos, sí. Se cuenta con una F concreta cuál de los tres puede valer
       cero. */
    const F = Math.sin;
    const factores = [
      (x: number) => 2 * Math.exp(-2 * x),
      F,
      (x: number) => deriva(F, x) - F(x),
    ];
    cuadra1516('ex1516-2ev-4-cual-es-la-derivada', 'Los puntos críticos de h', cuantasSeAnulan(factores, -3, 3));
  });
});
