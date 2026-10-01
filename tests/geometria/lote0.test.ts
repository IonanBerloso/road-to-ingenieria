import { describe, expect, it } from 'vitest';
import {
  abatido,
  anguloDiedro,
  anguloPlanos,
  anguloRectaPlano,
  anguloRectas,
  apice,
  corteRectaPlano,
  cuadradoPorDiagonal,
  distanciaAPlano,
  distanciaARecta,
  distanciaRectas,
  enPlano,
  enRecta,
  gira,
  normalQueSube,
  paraleloADistancia,
  perpendicularAPlano,
  pieComun,
  pieEnPlano,
  pieEnRecta,
  plano,
  planoMediador,
  planoPerpendicularARecta,
  rectaPorPuntos,
  vm,
  type P3,
} from '../../src/lib/diedrico';
import { evaluaReceta, type Lamina } from '../../src/lib/diedrico-receta';

/* El lote 0 de la fase K (Expresión Gráfica): cada función comprobada por un
   camino distinto del que usa, como pide el plan de la fase. Los puntos son
   inventados y oblicuos a propósito: ninguna recta ni plano paralelo a uno de
   proyección, salvo donde la prueba lo pide. */
const p = (x: number, y: number, z: number): P3 => ({ x, y, z });
const A = p(10, 40, 70);
const B = p(130, 90, 20);
const C = p(60, 150, 110);
const D = p(200, 30, 60);
const pl = plano(A, B, C);
const r = rectaPorPuntos(A, B);
const s = rectaPorPuntos(C, D);
const casi = (a: number, b: number, tol = 1e-6) => expect(Math.abs(a - b), `${a} frente a ${b}`).toBeLessThanOrEqual(tol);
const resta = (a: P3, b: P3) => p(a.x - b.x, a.y - b.y, a.z - b.z);
const punto = (a: P3, b: P3) => a.x * b.x + a.y * b.y + a.z * b.z;

describe('distancias', () => {
  it('la distancia entre dos rectas que se cruzan: triple producto y perpendicular común', () => {
    casi(distanciaRectas(r, s), vm(pieComun(r, s), pieComun(s, r)));
  });

  it('el pie común es perpendicular a las dos rectas', () => {
    const v = resta(pieComun(s, r), pieComun(r, s));
    casi(punto(v, r.d), 0);
    casi(punto(v, s.d), 0);
  });

  it('dos paralelas: la distancia de un punto de una a la otra, y el pie común lanza', () => {
    const s2 = { p: C, d: r.d };
    casi(distanciaRectas(r, s2), distanciaARecta(C, r));
    expect(() => pieComun(r, s2)).toThrow(/paralelas/);
  });

  it('el pie en el plano está en el plano, y su distancia es la de P al plano', () => {
    const Q = pieEnPlano(D, pl);
    expect(enPlano(Q, pl, 1e-9)).toBe(true);
    casi(vm(D, Q), distanciaAPlano(D, pl));
  });
});

describe('ángulos', () => {
  it('recta y plano: el complementario del que forma con la normal, y el que forma con su proyección', () => {
    const conNormal = anguloRectas(s, perpendicularAPlano(C, pl));
    casi(anguloRectaPlano(s, pl), 90 - conNormal);
    const proyeccion = rectaPorPuntos(pieEnPlano(C, pl), pieEnPlano(D, pl));
    casi(anguloRectaPlano(s, pl), anguloRectas(s, proyeccion));
  });

  it('dos planos: el de sus normales, y el diedro agudo por su sección recta', () => {
    const otro = plano(A, B, D);
    const arista = r;
    const diedro = anguloDiedro(C, arista, D);
    casi(anguloPlanos(pl, otro), Math.min(diedro, 180 - diedro));
  });

  it('el diedro de un cubo es recto, y el de dos caras abiertas a 120° no se queda en 60', () => {
    const arista = rectaPorPuntos(p(0, 0, 0), p(0, 0, 1));
    casi(anguloDiedro(p(1, 0, 0), arista, p(0, 1, 0)), 90);
    const c120 = p(Math.cos((2 * Math.PI) / 3), Math.sin((2 * Math.PI) / 3), 5);
    casi(anguloDiedro(p(1, 0, 3), arista, c120), 120);
  });
});

describe('perpendiculares, mediador y corte', () => {
  it('el corte de la recta con el plano está en los dos', () => {
    const I = corteRectaPlano(s, pl);
    expect(enPlano(I, pl, 1e-9)).toBe(true);
    expect(enRecta(I, s, 1e-9)).toBe(true);
  });

  it('cualquier punto del plano mediador equidista de A y B', () => {
    const m = planoMediador(A, B);
    const Q = pieEnPlano(D, m);
    casi(vm(Q, A), vm(Q, B));
  });

  it('el plano perpendicular a la recta la corta en ángulo recto', () => {
    casi(anguloRectaPlano(s, planoPerpendicularARecta(A, s)), 90);
  });

  it('el paralelo a distancia: a esa distancia, y hacia donde sube con lado 1', () => {
    const arriba = paraleloADistancia(pl, 25, 1);
    const abajo = paraleloADistancia(pl, 25, -1);
    casi(distanciaAPlano(A, arriba), 25);
    casi(distanciaAPlano(A, abajo), 25);
    expect(normalQueSube(pl).z).toBeGreaterThan(0);
    /* subir a lo largo de la vertical de A lleva antes al de arriba */
    const vertical = rectaPorPuntos(A, p(A.x, A.y, A.z + 1));
    expect(corteRectaPlano(vertical, arriba).z).toBeGreaterThan(corteRectaPlano(vertical, abajo).z);
  });
});

describe('abatimientos y giros', () => {
  const P = p(80, 0, 0);
  const tejado = plano(p(0, 0, 0), p(100, 0, 0), p(0, 60, 45));
  const enTejado = (y: number) => p(40, y, (y * 45) / 60);
  const charnela = rectaPorPuntos(p(0, 0, 0), p(100, 0, 0)); /* una horizontal del plano */

  it('abatir conserva la distancia a la charnela y deja el punto en el horizontal que la contiene', () => {
    const Q = enTejado(60);
    const [a, b] = abatido(Q, charnela, tejado);
    for (const X of [a, b]) {
      casi(X.z, 0);
      casi(distanciaARecta(X, charnela), distanciaARecta(Q, charnela));
      casi(vm(X, P), vm(Q, P)); /* y la distancia a cualquier punto de la charnela */
    }
  });

  it('una charnela que no es horizontal ni frontal lanza', () => {
    expect(() => abatido(A, rectaPorPuntos(A, B), plano(A, B, C))).toThrow(/ni frontal/);
  });

  it('girar conserva las distancias a los puntos del eje, y 360° es no girar', () => {
    const G = gira(D, r, 37);
    casi(vm(G, A), vm(D, A));
    casi(vm(G, B), vm(D, B));
    const vuelta = gira(D, r, 360);
    casi(vm(vuelta, D), 0);
    casi(vm(gira(gira(D, r, 20), r, -20), D), 0);
  });

  it('el giro va en el sentido de la mano derecha respecto del eje', () => {
    const ejeZ = rectaPorPuntos(p(0, 0, 0), p(0, 0, 1));
    const G = gira(p(1, 0, 0), ejeZ, 90);
    casi(G.x, 0);
    casi(G.y, 1);
  });
});

describe('figuras', () => {
  it('el cuadrado por su diagonal: cuatro lados iguales, ángulos rectos y en el plano', () => {
    const E = A;
    const F = pieEnPlano(p(90, 100, 60), pl);
    const [, G, , H] = cuadradoPorDiagonal(pl, E, F);
    const lados = [vm(E, G), vm(G, F), vm(F, H), vm(H, E)];
    lados.forEach((l) => casi(l, lados[0]));
    casi(punto(resta(G, E), resta(H, E)), 0);
    expect(enPlano(G, pl, 1e-9) && enPlano(H, pl, 1e-9)).toBe(true);
  });

  it('el ápice: a la altura del plano de la base, sobre su centro y hacia donde sube', () => {
    const V = apice([A, B, C], 50, 1);
    casi(distanciaAPlano(V, pl), 50);
    const centro = p((A.x + B.x + C.x) / 3, (A.y + B.y + C.y) / 3, (A.z + B.z + C.z) / 3);
    casi(vm(pieEnPlano(V, pl), centro), 0);
    expect(V.z).toBeGreaterThan(centro.z);
  });
});

describe('las funciones nuevas, desde una receta', () => {
  /* Una lámina mínima con los cuatro puntos en sus dos proyecciones: alzado
     (x, −cota) y planta (x, alejamiento). */
  const lamina: Lamina = {
    puntos: Object.fromEntries(
      Object.entries({ A, B, C, D }).flatMap(([n, P]) => [
        [`${n}2`, [P.x, -P.z] as const],
        [`${n}1`, [P.x, P.y] as const],
      ]),
    ),
    segmentos: {},
  };
  const escena = Object.fromEntries(
    ['A', 'B', 'C', 'D'].map((n) => [n, `punto3(alzado: figura.punto("${n}2"), planta: figura.punto("${n}1"))`]),
  );
  const res = evaluaReceta(lamina, {
    escena: { ...escena, abc: 'plano(A, B, C)', r: 'recta3(A, B)', s: 'recta3(C, D)' },
    solucion: {
      d: 'distancia_rectas(r, s)',
      alfa: 'angulo_recta_plano(s, abc)',
      I: 'corte_recta_plano(s, abc)',
      cuadrado: 'cuadrado_por_diagonal(abc, A, pie_en_plano(D, abc))',
      V: 'apice([A, B, C], altura: 50, sentido: ascendente)',
      lado: 'paralelo_a_distancia(abc, 25)',
    },
  });
  const num = (n: string) => {
    const v = res.valores.get(n);
    if (v?.k !== 'num') throw new Error(`${n} no es un número`);
    return v.v;
  };

  it('dan lo mismo que las funciones de la biblioteca', () => {
    casi(num('d'), distanciaRectas(r, s));
    casi(num('alfa'), anguloRectaPlano(s, pl));
    expect(res.valores.get('I')?.k).toBe('p3');
    expect(res.valores.get('cuadrado')).toMatchObject({ k: 'lista' });
    expect(res.valores.get('V')?.k).toBe('p3');
  });

  it('el paralelo sin sentido es una elección de dos planos', () => {
    expect(res.valores.get('lado')).toMatchObject({ k: 'ramas', eleccion: 'lado' });
  });
});
