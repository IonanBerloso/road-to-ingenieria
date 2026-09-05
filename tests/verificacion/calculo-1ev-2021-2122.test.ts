/**
 * Las primeras evaluaciones de Cálculo de 2020-2021 y 2021-2022. Once
 * respuestas entre las dos.
 *
 * Los dos ejercicios de lugares geométricos de esta tanda —una circunferencia
 * de Apolonio y un arco capaz— se resuelven en el examen **manipulando la
 * ecuación** hasta dejarla en la forma (x−a)² + (y−b)² = r². El test no
 * despeja nada: busca puntos del lugar resolviendo la condición tal como está
 * escrita, y **ajusta una circunferencia a los puntos encontrados**. Si el
 * lugar no fuera una circunferencia, o lo fuera con otro centro, el ajuste lo
 * diría.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { cModulo, cPor, cSuma, maximiza, raiz, type C } from './numerico';
import { resuelve } from './lineal';

const cuadra2122 = convocatoria('calculo', '2021-2022-1ev');
const cuadra2021 = convocatoria('calculo', '2020-2021-1ev');

const polar = (r: number, gr: number): C => [
  r * Math.cos((gr * Math.PI) / 180),
  r * Math.sin((gr * Math.PI) / 180),
];
const conjugado = ([a, b]: C): C => [a, -b];

/**
 * La circunferencia que pasa por tres puntos, en la forma
 * x² + y² + Dx + Ey + F = 0, que es lineal en los tres coeficientes. Devuelve
 * el centro y el radio.
 */
function circunferencia(puntos: number[][]) {
  const [D, E, F] = resuelve(
    puntos.map(([x, y]) => [x, y, 1]),
    puntos.map(([x, y]) => -(x * x + y * y)),
  );
  return { centro: [-D / 2, -E / 2], radio: Math.sqrt((D * D + E * E) / 4 - F) };
}

describe('2021-2022 · 1 · Apolonio con el área impuesta', () => {
  const id = 'ex2122-1-apolonio-de-area-dada';
  /* |z−1| = √2·|z−bi|. Para cada b se buscan tres puntos del lugar —el de
     abscisa mayor a tres alturas distintas— y se les ajusta la
     circunferencia. */
  const condicion = (b: number) => (x: number, y: number) =>
    Math.hypot(x - 1, y) - Math.SQRT2 * Math.hypot(x, y - b);
  const lugar = (b: number) => {
    const alturas = [2 * b, 2 * b + 0.3, 2 * b - 0.5];
    return circunferencia(alturas.map((y) => [raiz((x) => condicion(b)(x, y), -1 + 1e-9, 40), y]));
  };

  it('el parámetro es b = 1', () => {
    /* Se busca la b que hace que el área valga 4π. */
    const b = raiz((t) => Math.PI * lugar(t).radio ** 2 - 4 * Math.PI, 0.05, 5);
    cuadra2122(id, 'El parámetro que pide el enunciado', b);
  });

  it('y el centro está en −1 + 2i', () => {
    const { centro, radio } = lugar(1);
    /* Y que el ajuste es de verdad el lugar: se toman puntos de la
       circunferencia ajustada y se comprueba que cumplen la condición. */
    for (const gr of [30, 140, 250]) {
      const p = polar(radio, gr);
      if (Math.abs(condicion(1)(centro[0] + p[0], centro[1] + p[1])) > 1e-6)
        throw new Error(`el punto a ${gr}° no cumple la condición`);
    }
    cuadra2122.complejo(id, 'El centro', [centro[0], centro[1]]);
  });
});

describe('2021-2022 · 2 · la quinta con conjugado', () => {
  const id = 'ex2122-2-quinta-con-conjugado';
  /* i·z⁵·conj(z) = −|z|. El residuo se anula en el cero y en cuatro puntos de
     la circunferencia unidad. */
  const residuo = (z: C) => {
    let quinta: C = [1, 0];
    for (let k = 0; k < 5; k++) quinta = cPor(quinta, z);
    const izquierda = cPor([0, 1], cPor(quinta, conjugado(z)));
    /* Lo que hay que anular es izquierda − (−|z|), o sea izquierda + |z|. */
    return cModulo(cSuma(izquierda, [cModulo(z), 0]));
  };
  /* Los módulos posibles: r⁶ = r, o sea r = 0 y r = 1. */
  const radio = raiz((r) => r ** 6 - r, 0.5, 2);
  /* Y los argumentos, buscados a barrido fino y afinados por sección áurea. */
  const argumentos: number[] = [];
  for (let gr = 0; gr < 360; gr += 0.05) {
    const [antes, aqui, luego] = [gr - 0.05, gr, gr + 0.05].map((t) => residuo(polar(radio, t)));
    if (aqui < antes && aqui < luego && aqui < 0.01)
      argumentos.push(maximiza((t) => -residuo(polar(radio, t)), gr - 0.05, gr + 0.05).x);
  }

  it('hay cinco soluciones, y una es el cero', () => {
    if (residuo([0, 0]) > 1e-12) throw new Error('el cero no es solución, y debería serlo');
    if (argumentos.length !== 4) throw new Error(`he encontrado ${argumentos.length} sobre la unidad, no 4`);
    cuadra2122(id, 'Cuántas soluciones hay', argumentos.length + 1);
  });

  it('y la primera está a 22,5 grados', () => cuadra2122(id, 'El menor argumento positivo', Math.min(...argumentos)));
});

describe('2021-2022 · 3 · la sucesión compleja por tres ventanas', () => {
  it('la parte imaginaria llega como mucho a 1', () => {
    const z = (n: number): C => polar(1 / n, (n * 90) % 360);
    let mayor = -Infinity;
    for (let n = 1; n <= 100000; n++) mayor = Math.max(mayor, z(n)[1]);
    cuadra2122('ex2122-3-sucesion-compleja-tres-partes', 'El mayor valor de la parte imaginaria', mayor);
  });
});

describe('2021-2022 · 4 · la geométrica alternada', () => {
  const id = 'ex2122-4-geometrica-alternada';
  /* Los cuatro términos que el enunciado escribe. */
  const escritos = [5, -10 / 3, 20 / 9, -40 / 27];

  it('la razón es −2/3', () => {
    /* Se mide sobre los términos publicados, y se exige que los tres cocientes
       coincidan: si no, no sería geométrica y el ejercicio no tendría suma. */
    const cocientes = escritos.slice(1).map((v, i) => v / escritos[i]);
    for (const q of cocientes) if (Math.abs(q - cocientes[0]) > 1e-12) throw new Error('no es geométrica');
    cuadra2122(id, 'La razón', cocientes[0]);
  });

  it('y suma 3', () => {
    /* Sumando de verdad. La razón vale −2/3, así que doscientos términos dejan
       un resto del orden de 10⁻³⁵. */
    const q = escritos[1] / escritos[0];
    let s = 0;
    for (let n = 200; n >= 0; n--) s += escritos[0] * q ** n;
    cuadra2122(id, 'La suma', s);
  });
});

describe('2020-2021 · 1 · el arco capaz', () => {
  const id = 'ex2021-1-arco-capaz';
  /* arg((conj z + 3i)/(conj z − 3i)) = −π/4. La condición, escrita sobre el
     punto w = conj z, es que el cociente tenga argumento −45°: parte real
     positiva y parte imaginaria igual a menos la real. */
  const cociente = (x: number, y: number) => {
    const den = x * x + (y - 3) ** 2;
    return [(x * x + y * y - 9) / den, (6 * x) / den];
  };
  const enElArco = (x: number) => {
    const y = raiz((t) => cociente(x, t)[0] + cociente(x, t)[1], 0.01, 30);
    if (cociente(x, y)[0] <= 0) throw new Error(`en x=${x} el argumento sale +45°, no −45°`);
    return [x, y];
  };
  const { centro, radio } = circunferencia([-6, -4, -1].map(enElArco));

  it('el radio del arco es 3√2', () => cuadra2021(id, 'El radio del arco', radio));

  it('y el centro está en la abscisa −3', () => cuadra2021(id, 'El centro', centro[0]));
});

describe('2020-2021 · 2 · la exponencial en el eje real', () => {
  const id = 'ex2021-2-exponencial-en-el-eje-real';
  const w: C = [-Math.sqrt(3) / 2, 0.5];

  it('el segundo miembro está a 150 grados', () => {
    if (Math.abs(cModulo(w) - 1) > 1e-12) throw new Error('el segundo miembro no tiene módulo 1');
    cuadra2021(id, 'El argumento del segundo miembro', ((Math.atan2(w[1], w[0]) * 180) / Math.PI + 360) % 360);
  });

  it('y la solución principal es −5π/6', () => {
    /* Como el módulo es 1, las soluciones son reales, y la de k=0 es menos el
       argumento. Se comprueba metiéndola en la ecuación: e^{−iz} tiene que
       devolver el segundo miembro. */
    const z = -Math.atan2(w[1], w[0]);
    const comprobacion = polar(1, (-z * 180) / Math.PI);
    if (cModulo([comprobacion[0] - w[0], comprobacion[1] - w[1]]) > 1e-12)
      throw new Error('esa z no resuelve la ecuación');
    cuadra2021(id, 'La solución principal', z);
  });
});

describe('2020-2021 · 3 · las definiciones y el supremo', () => {
  it('el ínfimo vale 0,01441', () => {
    /* (4/5)ⁿ hasta el 19 y luego 1 − 1/n: el mínimo está en el último término
       del primer tramo, no en el infinito. Se busca recorriendo. */
    const a = (n: number) => (n < 20 ? 0.8 ** n : 1 - 1 / n);
    let menor = Infinity;
    for (let n = 1; n <= 100000; n++) menor = Math.min(menor, a(n));
    cuadra2021('ex2021-3-definiciones-supremo-infimo', 'El ínfimo', menor);
  });
});
