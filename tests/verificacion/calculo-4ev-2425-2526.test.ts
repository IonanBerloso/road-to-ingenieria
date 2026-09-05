/**
 * Las cuartas evaluaciones de Cálculo de 2024-2025 y 2025-2026. Diez
 * respuestas entre las dos.
 *
 * Las cuartas van de varias variables: gradientes leídos de un mapa de niveles
 * e integrales dobles y triples. Y traen el mejor caso de figura del corpus
 * entero: **el mapa del Mauna Kea determina la función**. Las curvas de nivel
 * son la misma cúbica trasladada, las etiquetas dicen qué altura le toca a
 * cada traslación, y de ahí sale f(x,y) = 10 − (y − (x−1)³) sin que el
 * enunciado la escriba en ninguna parte. Lo que confirma que la lectura es la
 * buena no es que dé 7 en P —eso es la etiqueta— sino que el módulo del
 * gradiente en Q salga **exactamente 1**, que es un dato que el enunciado da
 * por separado y que no se ha usado para construirla.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { deriva, integra, raiz } from './numerico';
import { escalar, norma, unitario } from './lineal';

const cuadra2526 = convocatoria('calculo', '2025-2026-4ev');
const cuadra2425 = convocatoria('calculo', '2024-2025-4ev');

/**
 * Integral doble sobre un recinto de tipo I: x de `a` a `b`, y entre dos
 * funciones de x. Simpson anidado, con el interior más fino que el exterior
 * para que el error del interior no se lea como estructura del integrando.
 */
const doble = (
  f: (x: number, y: number) => number,
  a: number,
  b: number,
  abajo: (x: number) => number,
  arriba: (x: number) => number,
) => integra((x) => integra((y) => f(x, y), abajo(x), arriba(x), 1e-9), a, b, 1e-7);

describe('2025-2026 · 1 · el mapa del Mauna Kea', () => {
  const id = 'ex2526-4ev-1-el-mapa-del-mauna-kea';
  /* LECTURA DE LA FIGURA. Las diez curvas de nivel son la misma cúbica
     trasladada en vertical, y = (x−1)³ + c. Las etiquetas dicen qué altura
     lleva cada una: la 7 pasa por Q(1,3) —o sea c = 3—, la 8 por (1,2), la 9
     por (1,1) y la 10 por (1,0). Es decir, altura = 10 − c. */
  const f = (x: number, y: number) => 10 - (y - (x - 1) ** 3);
  const P: [number, number] = [0, 2];
  const Q: [number, number] = [1, 3];
  const grad = (p: [number, number]) => [3 * (p[0] - 1) ** 2, -1];

  it('la reconstrucción cuadra con lo que el enunciado dice aparte', () => {
    /* Tres comprobaciones, y ninguna es la etiqueta de P. Primero, que el
       gradiente que se deriva de f es de verdad el gradiente. */
    for (const p of [P, Q]) {
      const g = grad(p);
      if (Math.abs(deriva((t) => f(t, p[1]), p[0]) - g[0]) > 1e-6) throw new Error('la parcial en x no cuadra');
      if (Math.abs(deriva((t) => f(p[0], t), p[1]) - g[1]) > 1e-6) throw new Error('la parcial en y no cuadra');
    }
    /* Segundo: en Q la tangente a la curva de nivel es horizontal, que es
       justo lo que dice el apartado e). */
    if (Math.abs(deriva((x) => (x - 1) ** 3 + 3, Q[0])) > 1e-6) throw new Error('la tangente en Q no es horizontal');
    /* Y tercero, el dato que no se ha usado para construir nada: el valor
       máximo de la velocidad de cambio en Q vale 1. */
    if (Math.abs(norma(grad(Q)) - 1) > 1e-9) throw new Error('el gradiente en Q no tiene módulo 1');
  });

  it('de las tres curvas propuestas, la de P es la C', () => {
    /* El apartado b) da tres candidatas y **dos pasan por P**, que es la
       trampa: la A también cumple (−1)³ − 1² = −5. Lo que la descarta es Q,
       que está en la misma curva de nivel. */
    const A = (x: number, y: number) => (x - 1) ** 3 - y * y + 5;
    const C = (x: number, y: number) => (x - 1) ** 3 - y + 3;
    if (Math.abs(A(...P)) > 1e-12) throw new Error('la A no pasa por P, y debería');
    if (Math.abs(A(...Q)) < 1) throw new Error('la A pasa por Q, y no debería');
    if (Math.abs(C(...P)) > 1e-12 || Math.abs(C(...Q)) > 1e-12) throw new Error('la C no pasa por los dos');
  });

  it('P está a 7 metros de altura', () => cuadra2526(id, 'Apartado c) — la altura de P', f(...P)));

  it('y en la dirección de u la altura no cambia', () => {
    /* u va **siguiendo la curva de nivel**, así que la derivada direccional
       tiene que salir cero. Se toma la tangente de la curva en P y se proyecta
       el gradiente sobre ella; no se supone el resultado. */
    const tangente = unitario([1, deriva((x) => (x - 1) ** 3 + 3, P[0])]);
    cuadra2526(id, 'Apartado d) — la velocidad de cambio en la dirección de u', escalar(grad(P), tangente));
  });

  it('y el gradiente en Q es (0, −1)', () => cuadra2526(id, 'Apartado e) — la segunda componente del gradiente en Q', grad(Q)[1]));
});

describe('2025-2026 · 2 · la pieza de dos materiales', () => {
  const id = 'ex2526-4ev-2-la-pieza-de-dos-materiales';
  /* La media elipse x² + y²/9 ≤ 1 con x ≤ 0, y el triángulo de vértices
     (0,3), (0,−3) y (a,0). Se integra en x, que es al revés de como lo hace
     la resolución. */
  const momentoElipse = doble(
    (x) => x,
    -1,
    0,
    (x) => -3 * Math.sqrt(1 - x * x),
    (x) => 3 * Math.sqrt(1 - x * x),
  );
  const momentoTriangulo = (a: number) =>
    doble(
      (x) => x,
      0,
      a,
      (x) => -3 * (1 - x / a),
      (x) => 3 * (1 - x / a),
    );

  it('la media elipse aporta −2', () => cuadra2526(id, 'El momento de la media elipse', momentoElipse));

  it('y el vértice va en a = 2', () => {
    /* El centro de masa está en el origen cuando el momento total se anula, y
       el aluminio pesa el doble. Se busca la raíz en vez de despejar. */
    cuadra2526(id, 'El valor de a', raiz((a) => 2 * momentoElipse + momentoTriangulo(a), 0.2, 10));
  });
});

describe('2025-2026 · 3 · entre el cono y el paraboloide', () => {
  const id = 'ex2526-4ev-3-entre-el-cono-y-el-paraboloide';
  /* z va del paraboloide z = r² − 12 al cono z = −r, sobre el medio disco
     x ≥ 0 de radio 3. */

  it('las dos superficies se cortan en r = 3', () =>
    cuadra2526(id, 'Dónde se cortan las dos superficies', raiz((r) => r * r - 12 + r, 0.1, 10)));

  it('y la masa vale 78,3', () => {
    /* **En cartesianas, que es lo que la resolución evita.** El examen pasa a
       cilíndricas y allí la integral se separa; aquí se integra tal como está
       escrita en el enunciado, y las dos cosas tienen que dar lo mismo. */
    const alto = (x: number, y: number) => -Math.hypot(x, y) - (x * x + y * y - 12);
    cuadra2526(
      id,
      'La masa',
      integra((y) => integra((x) => x * alto(x, y), 0, Math.sqrt(9 - y * y), 1e-9), -3, 3, 1e-7),
    );
  });
});

describe('2024-2025 · 1 · la curva de nivel dada', () => {
  const id = 'ex2425-4ev-1-curva-de-nivel-dada';
  const nivel = (x: number) => 2 - x * x; // x² + y = 2
  const P = -1;
  const pendiente = deriva(nivel, P);
  /* El gradiente es perpendicular a la tangente y mide 10. De las dos ramas
     se toma la de primera componente positiva. */
  const perpendicular = unitario([pendiente, -1]);
  const gradiente = perpendicular.map((c) => 10 * c * Math.sign(perpendicular[0]));

  it('la curva de nivel tiene pendiente 2 en P', () => cuadra2425(id, 'La pendiente de la curva de nivel en P', pendiente));

  it('y el gradiente arranca en 4√5', () => {
    if (Math.abs(escalar(gradiente, [1, pendiente])) > 1e-9) throw new Error('el gradiente no es perpendicular');
    if (Math.abs(norma(gradiente) - 10) > 1e-9) throw new Error('el gradiente no mide 10');
    cuadra2425(id, 'La primera componente del gradiente', gradiente[0]);
  });

  it('y hacia b se cambia a 8,6824 por unidad', () =>
    cuadra2425(id, 'La velocidad hacia el vector b', Math.abs(escalar(gradiente, unitario([-2, 3])))));
});

describe('2024-2025 · 2 · cono y paraboloide invertidos', () => {
  const id = 'ex2425-4ev-2-cono-y-paraboloide-invertidos';
  /* r ≤ |z| por dentro del cono, r² ≤ 6 + z por dentro del paraboloide, y
     z ≤ 0. */

  it('se cortan en z = −2', () =>
    cuadra2425(id, 'Dónde se cortan las dos superficies', raiz((z) => z * z - 6 - z, -5, -0.1)));

  it('y el volumen es 32π/3', () => {
    /* **Rebanando en z**, que no es como lo hace la resolución: ella integra
       en cilíndricas de dentro hacia fuera. Cada rebanada es un disco de radio
       el menor de los dos, y por eso hay que partir la integral en z = −2: ahí
       el que manda cambia de ser el cono a ser el paraboloide. */
    const radio = (z: number) => Math.min(-z, Math.sqrt(6 + z));
    const area = (z: number) => Math.PI * radio(z) ** 2;
    cuadra2425(id, 'El volumen', integra(area, -6, -2, 1e-10) + integra(area, -2, 0, 1e-10));
  });
});
