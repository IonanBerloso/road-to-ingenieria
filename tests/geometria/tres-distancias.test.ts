import { describe, expect, it } from 'vitest';
import { enPlano, plano, puntoATresDistancias, vm, type P3 } from '../../src/lib/diedrico';
import { evaluaReceta, type Lamina } from '../../src/lib/diedrico-receta';

/* El punto a tres distancias (lote 1 de la fase K, para SD23), comprobado
   por lo que tiene que cumplir y sin repetir su cuenta: se parte de un punto
   conocido, se miden sus distancias y la función tiene que devolverlo a él o
   a su simétrico respecto al plano de los tres puntos. */
const p = (x: number, y: number, z: number): P3 => ({ x, y, z });
const casi = (a: number, b: number, tol = 1e-6) => expect(Math.abs(a - b), `${a} frente a ${b}`).toBeLessThanOrEqual(tol);
const igual = (P: P3, Q: P3, tol = 1e-6) => expect(vm(P, Q), `${JSON.stringify(P)} frente a ${JSON.stringify(Q)}`).toBeLessThanOrEqual(tol);

/* Un techo horizontal, de cota 300, con las tres varillas colgando hasta V. */
const A = p(20, 40, 300);
const B = p(170, 60, 300);
const C = p(90, 160, 300);
const V = p(95, 85, 180);
const [dA, dB, dC] = [vm(A, V), vm(B, V), vm(C, V)];

describe('puntoATresDistancias', () => {
  it('con un techo horizontal: hacia abajo, V; hacia arriba, su simétrico por encima del techo', () => {
    igual(puntoATresDistancias(A, dA, B, dB, C, dC, -1), V);
    igual(puntoATresDistancias(A, dA, B, dB, C, dC, 1), p(95, 85, 420));
  });

  it('en un plano cualquiera: las dos soluciones están a las tres distancias y son simétricas respecto al plano', () => {
    const [P, Q, R] = [p(10, 40, 70), p(130, 90, 20), p(60, 150, 110)];
    const X = p(80, 30, 160);
    const [a, b, c] = [vm(P, X), vm(Q, X), vm(R, X)];
    const pl = plano(P, Q, R);
    const sols = ([1, -1] as const).map((l) => puntoATresDistancias(P, a, Q, b, R, c, l));
    expect(sols.some((S) => vm(S, X) <= 1e-6)).toBe(true);
    for (const S of sols) {
      casi(vm(P, S), a);
      casi(vm(Q, S), b);
      casi(vm(R, S), c);
    }
    const medio = p((sols[0].x + sols[1].x) / 2, (sols[0].y + sols[1].y) / 2, (sols[0].z + sols[1].z) / 2);
    expect(enPlano(medio, pl, 1e-6)).toBe(true);
    const d = p(sols[0].x - sols[1].x, sols[0].y - sols[1].y, sols[0].z - sols[1].z);
    casi(Math.abs(d.x * pl.n.x + d.y * pl.n.y + d.z * pl.n.z), vm(sols[0], sols[1]));
    // lado 1 es el que queda hacia donde sube el plano
    expect(sols[0].z).toBeGreaterThan(sols[1].z);
  });

  it('si las varillas solo se tocan en el plano, las dos soluciones son el mismo punto', () => {
    const E = p(80, 90, 300);
    const [a, b, c] = [vm(A, E), vm(B, E), vm(C, E)];
    igual(puntoATresDistancias(A, a, B, b, C, c, 1), E, 1e-4);
    igual(puntoATresDistancias(A, a, B, b, C, c, -1), E, 1e-4);
  });

  it('lanza si no llegan a juntarse, si los puntos están alineados o si una distancia no es positiva', () => {
    expect(() => puntoATresDistancias(A, 20, B, 20, C, 20, -1)).toThrow(/no se alcanzan: les faltan [\d.]+ mm/);
    expect(() => puntoATresDistancias(A, dA, p(70, 80, 300), dB, p(120, 120, 300), dC, -1)).toThrow(/alineados/);
    expect(() => puntoATresDistancias(A, 0, B, dB, C, dC, -1)).toThrow(/distancia a A/);
  });
});

describe('punto_a_tres_distancias, desde una receta', () => {
  /* Una lámina mínima con los puntos en sus dos proyecciones: alzado
     (x, −cota) y planta (x, alejamiento). */
  const lamina: Lamina = {
    puntos: Object.fromEntries(
      Object.entries({ A, B, C, V }).flatMap(([n, P]) => [
        [`${n}2`, [P.x, -P.z] as const],
        [`${n}1`, [P.x, P.y] as const],
      ]),
    ),
    segmentos: {},
  };
  const escena = Object.fromEntries(
    ['A', 'B', 'C', 'V'].map((n) => [n, `punto3(alzado: figura.punto("${n}2"), planta: figura.punto("${n}1"))`]),
  );
  const tres = 'A, vm(A, V), B, vm(B, V), C, vm(C, V)';

  it('con sentido descendente, el punto que cuelga del techo', () => {
    const r = evaluaReceta(lamina, { escena, solucion: { W: `punto_a_tres_distancias(${tres}, sentido: descendente)` } });
    const W = r.valores.get('W');
    if (W?.k !== 'p3') throw new Error('W no es un punto del espacio');
    igual(W.v, V);
  });

  it('sin sentido, una elección entre las dos soluciones', () => {
    const r = evaluaReceta(lamina, { escena, solucion: { W: `punto_a_tres_distancias(${tres})` } });
    const W = r.valores.get('W');
    expect(W).toMatchObject({ k: 'ramas', eleccion: 'W' });
    if (W?.k !== 'ramas') throw new Error('no es una elección');
    const cotas = W.v.map((x) => (x.k === 'p3' ? x.v.z : NaN)).sort((a, b) => a - b);
    casi(cotas[0], 180);
    casi(cotas[1], 420);
  });
});
