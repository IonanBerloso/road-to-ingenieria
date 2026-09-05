/**
 * Las primeras evaluaciones de Cálculo de 2024-2025 y 2025-2026. Nueve
 * respuestas entre las dos.
 *
 * Las primeras evaluaciones son complejos, sucesiones y series, y aquí el test
 * hace tres cosas que las resoluciones no hacen:
 *
 * - **La raíz cuarta se calcula con un módulo inventado.** El enunciado dice
 *   que los tres afijos tienen el mismo módulo pero no cuál, y la resolución
 *   argumenta que se cancela. El test lo comprueba: hace la cuenta entera con
 *   dos módulos distintos y exige que salga el mismo número.
 * - **La serie hipergeométrica se suma sumándola.** La resolución aplica la
 *   fórmula que el propio enunciado regala; el test suma dos millones de
 *   términos y mira si coinciden.
 * - **La gráfica se lee por la curva, no por las bandas.** El apartado (a) de
 *   2024-2025 se resuelve leyendo dónde el dibujo marca |g|<1; el test
 *   transcribe los vértices de la propia curva y busca dónde cruza y = ±1.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { cEntre, cModulo, cPor, type C } from './numerico';
import { resuelve } from './lineal';

const cuadra2526 = convocatoria('calculo', '2025-2026-1ev');
const cuadra2425 = convocatoria('calculo', '2024-2025-1ev');

const polar = (r: number, grados: number): C => [
  r * Math.cos((grados * Math.PI) / 180),
  r * Math.sin((grados * Math.PI) / 180),
];
const conjugado = ([a, b]: C): C => [a, -b];
const potencia = (z: C, n: number): C => {
  let p: C = [1, 0];
  for (let k = 0; k < n; k++) p = cPor(p, z);
  return p;
};
/** El argumento en grados, siempre en [0, 360). */
const grados = ([a, b]: C) => ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360;

describe('2025-2026 · 2 · la raíz cuarta de la figura', () => {
  const id = 'ex2526-2-raiz-cuarta-de-la-figura';
  /* LECTURA DE LA FIGURA: los tres afijos están sobre la misma
     circunferencia —mismo módulo, que la figura no dice cuál— y sus
     argumentos son 60°, −60° y −120°. */
  const derecha = (r: number): C => {
    const z1 = polar(r, 60);
    const z2 = polar(r, -60);
    const z3 = polar(r, -120);
    const numerador = cPor(cPor([8, 0], z1), potencia(conjugado(z2), 2));
    return cPor(cEntre(numerador, potencia(z3, 3)), [-1, Math.sqrt(3)]);
  };
  /* Con dos radios distintos: si el módulo se cancela de verdad, los dos
     tienen que dar exactamente lo mismo. */
  const [conUno, conOtro] = [derecha(1.7), derecha(0.6)];

  it('el módulo del segundo miembro no depende del radio de la figura', () => {
    if (Math.hypot(conUno[0] - conOtro[0], conUno[1] - conOtro[1]) > 1e-9)
      throw new Error('el radio de la figura sí influye, y no debería');
  });

  it('las soluciones tienen módulo 2', () => cuadra2526(id, 'El módulo de las soluciones', cModulo(conUno) ** 0.25));

  it('y el menor argumento son 75 grados', () => {
    const raices = [0, 1, 2, 3].map((k) => (grados(conUno) + 360 * k) / 4);
    /* Se comprueba que son raíces de verdad: elevada a la cuarta, cada una
       tiene que devolver el segundo miembro. */
    for (const th of raices) {
      const z = polar(cModulo(conUno) ** 0.25, th);
      if (cModulo([potencia(z, 4)[0] - conUno[0], potencia(z, 4)[1] - conUno[1]]) > 1e-9)
        throw new Error(`la raíz de ${th}° no lo es`);
    }
    cuadra2526(id, 'El menor argumento positivo', Math.min(...raices.map((t) => ((t % 360) + 360) % 360)));
  });
});

describe('2025-2026 · 3 · la cota estricta y el límite', () => {
  it('el épsilon de la reducción al absurdo es 0,3', () => {
    /* Se supone L < b. El ε que sirve es el que deja la banda (L−ε, L+ε)
       enteramente por debajo de b, y el más cómodo es la mitad de la
       distancia. Se comprueba que efectivamente separa. */
    const [b, L] = [1, 0.4];
    const eps = (b - L) / 2;
    if (!(L + eps < b)) throw new Error('ese épsilon no separa nada');
    cuadra2526('ex2526-3-cota-estricta-y-limite', 'El épsilon de la reducción al absurdo', eps);
  });
});

describe('2025-2026 · 4 · la serie hipergeométrica', () => {
  const id = 'ex2526-4-serie-hipergeometrica';
  const a = (n: number) => 1 / ((n + 2) * (n + 3));

  it('el parámetro gamma vale 4', () => {
    /* Con α = 1, el cociente a_{n+1}/a_n = (n+β)/(n+γ) da una ecuación por
       cada n. Se resuelve el sistema con dos de ellas y se comprueba el ajuste
       en otras dos: si la serie no fuera hipergeométrica, ahí fallaría. */
    const fila = (n: number) => [a(n + 1) / a(n), -1];
    const [gamma, beta] = resuelve([fila(1), fila(2)], [1 - a(2) / a(1), 2 * (1 - a(3) / a(2))]);
    for (const n of [5, 11])
      if (Math.abs(a(n + 1) / a(n) - (n + beta) / (n + gamma)) > 1e-12)
        throw new Error(`el ajuste falla en n=${n}`);
    cuadra2526(id, 'El parámetro que decide la convergencia', gamma);
  });

  it('la suma del apartado (a) es 1/3', () => {
    /* **Sumando**, no aplicando la fórmula que el enunciado regala. */
    let s = 0;
    for (let n = 2_000_000; n >= 1; n--) s += a(n);
    cuadra2526(id, 'La suma del apartado (a)', s);
  });

  it('y las áreas suman 1', () => {
    /* Base 1/n por altura 1/(n+1). Se suma de atrás hacia delante para no
       perder los términos pequeños contra un acumulado que ya vale casi 1. */
    let s = 0;
    for (let n = 2_000_000; n >= 1; n--) s += 1 / (n * (n + 1));
    cuadra2526(id, 'La suma de las áreas', s);
  });
});

describe('2024-2025 · 2 · la cúbica desplazada', () => {
  const id = 'ex2425-2-cubica-desplazada';
  /* (z − 2 − i)³ = −8. El centro está en 2+i y el radio es la raíz cúbica
     de 8. */
  const centro: C = [2, 1];
  const soluciones = [0, 1, 2].map((k) => {
    const w = polar(8 ** (1 / 3), (180 + 360 * k) / 3);
    return [centro[0] + w[0], centro[1] + w[1]] as C;
  });

  it('las tres soluciones distan 2 del centro', () => {
    const distancias = soluciones.map((z) => cModulo([z[0] - centro[0], z[1] - centro[1]]));
    for (const d of distancias) if (Math.abs(d - distancias[0]) > 1e-9) throw new Error('no están a la misma distancia');
    /* Y que resuelven la ecuación, que es lo que de verdad las valida. */
    for (const z of soluciones) {
      const cubo = potencia([z[0] - centro[0], z[1] - centro[1]], 3);
      if (cModulo([cubo[0] + 8, cubo[1]]) > 1e-9) throw new Error('esa no es solución');
    }
    cuadra2425(id, 'El módulo de las tres soluciones', distancias[0]);
  });

  it('y una de ellas es imaginaria pura', () => {
    const puras = soluciones.filter((z) => Math.abs(z[0]) < 1e-9);
    if (puras.length !== 1) throw new Error(`hay ${puras.length} imaginarias puras, y debería haber una`);
    cuadra2425(id, 'La solución más sencilla', puras[0][1]);
  });
});

describe('2024-2025 · 3 · el límite no positivo', () => {
  it('el épsilon de la reducción al absurdo es 0,4', () => {
    /* Se supone L > 0. El ε que sirve deja la banda entera por encima de cero,
       y la mitad del límite lo consigue. */
    const L = 0.8;
    const eps = L / 2;
    if (!(L - eps > 0)) throw new Error('ese épsilon no llega al absurdo');
    cuadra2425('ex2425-3-limite-no-positivo', 'El épsilon de la reducción al absurdo', eps);
  });
});

describe('2024-2025 · 4 · la serie de la gráfica', () => {
  const id = 'ex2425-4-serie-de-la-grafica';
  /* LOS VÉRTICES DE LA CURVA, en las coordenadas del propio dibujo. La
     calibración también sale de él: x = −0,25 está en el píxel 28,5 y x = 0 en
     el 266, o sea 950 píxeles por unidad; y = 1 está en el 56,7, y = −1 en el
     245,6 y y = 0 en el 151,1. */
  const trazo = [
    [28.5, 56.7], [38, 99.2], [47.5, 151.1], [57, 198.3], [66.5, 228.6], [76, 245.6],
    [85.5, 264.4], [99.8, 292.8], [123.5, 313.6], [137.8, 316.4], [147.3, 314.5],
    [171, 298.4], [185.3, 285.2], [194.7, 276.7], [204.3, 262.6], [213.8, 245.6],
    [228, 228.6], [242.2, 211.6], [256.5, 184.2], [281.2, 151.1], [289.8, 136],
    [313.5, 104.8], [337.3, 77.4], [356.3, 56.7], [370.5, 47.2], [384.8, 39.7],
    [408.5, 30.2], [432.3, 27.4], [456, 33.1], [479.8, 40.6], [503.5, 56.7],
    [527.3, 76.5], [551, 102], [574.8, 127.5], [598.5, 153.9], [622.3, 179.4],
    [646, 200.2], [669.8, 212.5], [693.5, 211.6], [717.3, 193.6], [741, 159.6],
  ];
  const enX = (px: number) => (px - 266) / 950;
  const enY = (py: number) => (151.1 - py) / 94.45;

  it('el primer tramo de convergencia acaba en −0,20', () => {
    /* La serie converge exactamente donde |g| < 1. El dibujo marca las bandas
       en verde, pero el test no las mira: recorre la curva vértice a vértice y
       busca el primer sitio donde el módulo vuelve a valer 1. */
    const curva = trazo.map(([px, py]) => [enX(px), enY(py)]);
    if (Math.abs(Math.abs(curva[0][1]) - 1) > 1e-3) throw new Error('la curva no entra valiendo 1');
    let salida = null;
    for (let i = 1; i < curva.length && salida === null; i++)
      if (Math.abs(curva[i][1]) >= 1 - 1e-9) salida = curva[i][0];
    if (salida === null) throw new Error('la curva no sale nunca de la banda');
    cuadra2425(id, 'El extremo del primer tramo', salida);
  });

  it('y donde g vale 1/2 la serie suma 2', () => {
    /* Σ k rᵏ, sumada de verdad. Con r = 1/2 converge rápido, así que sesenta
       términos bastan para las dos centésimas que pide la tolerancia. */
    const r = 0.5;
    let s = 0;
    for (let k = 60; k >= 1; k--) s += k * r ** k;
    cuadra2425(id, 'La suma, en un punto concreto', s);
  });
});
