/**
 * Las dos convocatorias de Álgebra del curso 2023-2024, ordinaria y
 * extraordinaria.
 *
 * Van juntas porque comparten lo más llamativo del corpus de la asignatura:
 * **la matriz del ejercicio 4 de la extraordinaria es la misma que la del
 * ejercicio 4 de la extraordinaria del curso anterior**, con los parámetros ya
 * sustituidos. Verificarlas por separado y que las dos den lo mismo es una
 * comprobación gratis.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { det, inversa, nucleo, rango, valoresPropios } from './lineal';

const cuadraOrd = convocatoria('algebra', '2023-2024-ord');
const cuadraExt = convocatoria('algebra', '2023-2024-ext');

describe('ordinaria · 1 · cambiar de base para que salga (1,0,0)', () => {
  const id = 'exalg2324-ord-1-cambiar-de-base-para-que-salga-1-0-0';

  it('las antisimétricas de orden 2 son una recta', () => {
    /* A^T = −A obliga a que la diagonal sea nula y a que a₂₁ = −a₁₂: queda un
       solo grado de libertad. */
    const generadores = [[0, 1, -1, 0]];
    cuadraOrd(id, 'La dimensión del subespacio de las antisimétricas', rango(generadores));
  });

  it('la matriz de cambio a {x, v₂, v₃} tiene determinante 1', () => {
    /* x tiene coordenadas (1,1,1), así que la matriz de cambio lleva ese
       vector en la primera columna y los otros dos sin tocar. Que el
       determinante no sea cero es lo que demuestra que B' es base. */
    const P = [
      [1, 0, 0],
      [1, 1, 0],
      [1, 0, 1],
    ];
    cuadraOrd(id, 'El determinante de la matriz de cambio', det(P));
  });
});

describe('ordinaria · 2 · la imagen de una base genera la imagen', () => {
  const id = 'exalg2324-ord-2-la-imagen-de-una-base-genera-la-imagen';
  /* De los cuatro datos se despejan las cuatro imágenes: la primera viene
     dada y las otras tres son la suma menos la primera. */
  const M = (a: number) => {
    const f1 = [1, 1, 1, a];
    const f2 = [2, 2, a + 1, a + 1].map((v, i) => v - f1[i]);
    const f3 = [2, a + 1, 2, a + 1].map((v, i) => v - f1[i]);
    const f4 = [a + 1, 2, 2, a + 1].map((v, i) => v - f1[i]);
    const columnas = [f1, f2, f3, f4];
    return [0, 1, 2, 3].map((f) => columnas.map((c) => c[f]));
  };

  it('f deja de ser inyectiva en α = −3 y α = 1', () => {
    /* El determinante sale (α+3)(α−1)³. En vez de fiarse de esa
       factorización, se busca dónde el rango cae de verdad barriendo los
       enteros de −6 a 6: si hubiera una raíz no entera que se nos escapa,
       este barrido la dejaría fuera y el conjunto no cuadraría. */
    const rompe: number[] = [];
    for (let a = -6; a <= 6; a++) if (rango(M(a)) < 4) rompe.push(a);
    cuadraOrd.conjunto(id, 'Los valores de α que estropean la inyectividad', rompe);
  });

  it('con α = −3 el núcleo lo genera (1, 1, 1, 1)', () => {
    const base = nucleo(M(-3));
    if (base.length !== 1) throw new Error('el núcleo debería ser una recta');
    const v = base[0];
    cuadraOrd.vector(id, 'El núcleo cuando α vale −3', v.map((x) => x / v[0]));
  });
});

describe('ordinaria · 3 · un producto escalar torcido', () => {
  const id = 'exalg2324-ord-3-matrices-ortogonales-y-un-producto-escalar-torcido';
  /* ⟨x,y⟩ = 2x₁y₁ − x₁y₂ + x₁y₃ − x₂y₁ + 3x₂y₂ + x₃y₁ + 3x₃y₃ */
  const G = [
    [2, -1, 1],
    [-1, 3, 0],
    [1, 0, 3],
  ];

  it('el determinante de su matriz de Gram vale 12', () => {
    /* Que sea positivo es parte de lo que hace que esto sea un producto
       escalar de verdad y no una forma cualquiera. */
    cuadraOrd(id, 'El menor que decide si es producto escalar', det(G));
  });

  it('el segundo vector de la base ortonormal es (1/√10, 2/√10, 0)', () => {
    /* Gram-Schmidt sobre la base canónica, pero con ESTE producto. */
    const dot = (x: number[], y: number[]) =>
      x.reduce((s, xi, i) => s + xi * y.reduce((t, yj, j) => t + G[i][j] * yj, 0), 0);
    const nor = (x: number[]) => Math.sqrt(dot(x, x));
    const u1 = [1, 0, 0].map((v) => v / nor([1, 0, 0]));
    const w2 = [0, 1, 0];
    const orto = w2.map((v, i) => v - dot(w2, u1) * u1[i]);
    cuadraOrd.vector(id, 'El segundo vector de la base ortonormal', orto.map((v) => v / nor(orto)));
  });
});

describe('ordinaria · 4 · tres autovalores distintos y una base ortogonal', () => {
  const id = 'exalg2324-ord-4-tres-autovalores-distintos-y-una-base-ortogonal';
  const A = [
    [2, 1, 3],
    [1, -2, -1],
    [3, -1, 2],
  ];

  it('el tercer autovalor es −3', () => {
    const l = valoresPropios(A).sort((a, b) => a - b);
    /* Se comprueba que los otros dos son los que dice el enunciado antes de
       dar el tercero por bueno. */
    if (!l.some((x) => Math.abs(x) < 1e-6) || !l.some((x) => Math.abs(x - 5) < 1e-6))
      throw new Error('los autovalores 0 y 5 no salen');
    cuadraOrd(id, 'El autovalor que falta', l.find((x) => Math.abs(x) > 1e-6 && Math.abs(x - 5) > 1e-6)!);
  });

  it('y el autovector del 5 es (1, 0, 1)', () => {
    const M = A.map((f, i) => f.map((x, j) => x - (i === j ? 5 : 0)));
    const [v] = nucleo(M);
    cuadraOrd.vector(id, 'El autovector del cinco', v.map((x) => x / v[0]));
  });
});

describe('extraordinaria · 1 · dos combinaciones y las matrices de traza nula', () => {
  const id = 'exalg2324-ext-1-dos-combinaciones-y-las-matrices-de-traza-nula';

  it('2u + λv y λu + 3v son dependientes en λ = ±√6', () => {
    /* En coordenadas de {u, v} son las columnas de [[2, λ],[λ, 3]], y son
       dependientes cuando ese determinante se anula: 6 − λ². */
    const raiz = Math.sqrt(6);
    for (const l of [raiz, -raiz])
      if (Math.abs(det([[2, l], [l, 3]])) > 1e-9) throw new Error(`en λ=${l} no son dependientes`);
    cuadraExt.conjunto(id, 'Los valores de λ que los hacen dependientes', [raiz, -raiz]);
  });

  it('las matrices 2×2 de traza nula forman un subespacio de dimensión 3', () => {
    /* a₁₁ = −a₂₂ deja tres libres: la propia a₁₁, a₁₂ y a₂₁. */
    const generadores = [
      [1, 0, 0, -1],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
    ];
    cuadraExt(id, 'La dimensión de las matrices de traza nula', rango(generadores));
  });
});

describe('extraordinaria · 2 · tres datos torcidos y una aplicación', () => {
  const id = 'exalg2324-ext-2-tres-datos-torcidos-y-una-aplicacion';
  const fe3 = [3, 0, 1];
  const fe3menos2e2 = [1, 2, -1];
  const fe2 = fe3.map((v, i) => (v - fe3menos2e2[i]) / 2);

  it('f(e₂) vale (1, −1, 1)', () => cuadraExt.vector(id, 'La imagen del segundo vector canónico', fe2));

  it('y la matriz es (−1,1,3; 1,−1,0; −1,1,1)', () => {
    /* e1 + e2 está en el núcleo, así que f(e1) = −f(e2). */
    const fe1 = fe2.map((v) => -v);
    const columnas = [fe1, fe2, fe3];
    cuadraExt.matriz(id, 'La matriz asociada en la base canónica', [0, 1, 2].map((f) => columnas.map((c) => c[f])));
  });
});

describe('extraordinaria · 3 · la identidad de polarización y una inversa', () => {
  const id = 'exalg2324-ext-3-la-identidad-de-polarizacion-y-una-inversa';
  const A = (x: number) => [
    [x, -1, -1],
    [-x, x, -1],
    [1, -1, x],
  ];

  it('solo hay dos valores de x que la estropean, aunque el polinomio tenga tres raíces', () => {
    /* El determinante es (x−1)²(x+1): tres raíces contando multiplicidad y
       **dos** valores distintos. La pregunta es por los distintos, y ahí es
       donde se falla. */
    const malos = [1, -1];
    for (const x of malos)
      if (Math.abs(det(A(x))) > 1e-9) throw new Error(`en x=${x} la matriz sí es invertible`);
    cuadraExt(id, 'Cuántos valores de x estropean la matriz', new Set(malos).size);
  });

  it('y en x = 0 la inversa es (−1,1,1; −1,1,0; 0,−1,0)', () =>
    cuadraExt.matriz(id, 'La inversa en x = 0', inversa(A(0))));
});

describe('extraordinaria · 4 · esta sí se diagonaliza', () => {
  const id = 'exalg2324-ext-4-esta-si-se-diagonaliza';
  /* La misma matriz que salió en la extraordinaria de 2022-2023 con los
     parámetros ya puestos. */
  const A = [
    [1, 2, -2],
    [2, 1, -2],
    [2, 2, -3],
  ];

  it('el autoespacio de −1 es un plano', () => {
    const M = A.map((f, i) => f.map((x, j) => x + (i === j ? 1 : 0)));
    cuadraExt(id, 'La multiplicidad geométrica del autovalor doble', nucleo(M).length);
  });

  it('y el autovector de 1 es (1, 1, 1)', () => {
    const M = A.map((f, i) => f.map((x, j) => x - (i === j ? 1 : 0)));
    const [v] = nucleo(M);
    cuadraExt.vector(id, 'El autovector del autovalor simple', v.map((x) => x / v[0]));
  });
});
