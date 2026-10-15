/**
 * Tema 11: la viga hiperestática por superposición de redundantes
 * (`src/lib/erm/redundantes.ts`).
 *
 * El segundo camino de cada número (CLAUDE.md §10):
 *  · los casos de libro con su número (apoyada-empotrada 5P/16 y −3PL/16;
 *    biempotrada con q, qL/2 y −qL²/12; δ de la ménsula 5PL³/48EI y L³/3EI);
 *  · la misma viga planteada entera en `elastica.ts` (las reacciones como
 *    incógnitas de un único sistema, sin superposición);
 *  · los dos caminos de la figura 11.2 (p. 5): quitar el apoyo B o liberar el
 *    giro de A tienen que dar la misma viga;
 *  · la viga continua con asiento, contra los tres momentos (ec. 11.3).
 */
import { describe, expect, it } from 'vitest';
import { resuelveElastica } from '../../../src/lib/erm/elastica';
import { porRedundantes } from '../../../src/lib/erm/redundantes';
import { tresMomentos } from '../../../src/lib/erm/tresMomentos';
import { esfuerzosViga, type VigaRecta } from '../../../src/lib/erm/vigas';

const EI = 7;

describe('apoyada-empotrada con P en el centro (fig. 11.2, p. 5)', () => {
  const L = 4;
  const P = 10;
  const cargas = [{ tipo: 'puntual' as const, x: L / 2, P }];

  it('quitando el apoyo B: δB0 = 5PL³/48EI, δBB = −L³/3EI y RB = 5P/16', () => {
    const base: VigaRecta = { L, apoyos: [{ x: 0, tipo: 'empotramiento' }], cargas };
    const s = porRedundantes(base, EI, [{ tipo: 'fuerza', x: L }]);
    expect(s.d0[0]).toBeCloseTo((5 * P * L ** 3) / (48 * EI), 10);
    expect(s.d[0][0]).toBeCloseTo(-(L ** 3) / (3 * EI), 10);
    expect(s.X[0]).toBeCloseTo((5 * P) / 16, 10);
    expect(s.elastica.v(L)).toBeCloseTo(0, 10);
    expect(esfuerzosViga(s.esfuerzos, L / 2).M).toBeCloseTo((5 * P * L) / 32, 10);
    expect(esfuerzosViga(s.esfuerzos, 0).M).toBeCloseTo((-3 * P * L) / 16, 10);
  });

  it('liberando el giro de A: MA = −3PL/16 y la misma viga', () => {
    const base: VigaRecta = {
      L,
      apoyos: [
        { x: 0, tipo: 'articulado' },
        { x: L, tipo: 'movil' },
      ],
      cargas,
    };
    const s = porRedundantes(base, EI, [{ tipo: 'par', x: 0 }]);
    /* un par en x = 0 con el signo de viga.ts es M(0⁺) */
    expect(s.X[0]).toBeCloseTo((-3 * P * L) / 16, 10);
    expect(s.elastica.theta(0)).toBeCloseTo(0, 10);
    for (const x of [0.5, 1.7, 2, 3.1]) {
      const otra = porRedundantes({ L, apoyos: [{ x: 0, tipo: 'empotramiento' }], cargas }, EI, [{ tipo: 'fuerza', x: L }]);
      expect(esfuerzosViga(s.esfuerzos, x).M).toBeCloseTo(esfuerzosViga(otra.esfuerzos, x).M, 10);
      expect(s.elastica.v(x)).toBeCloseTo(otra.elastica.v(x), 10);
    }
  });

  it('la viga entera en elastica.ts da las mismas reacciones', () => {
    const entera = resuelveElastica({
      L,
      EI,
      apoyos: [
        { x: 0, tipo: 'empotramiento' },
        { x: L, tipo: 'movil' },
      ],
      cargas,
    });
    const s = porRedundantes({ L, apoyos: [{ x: 0, tipo: 'empotramiento' }], cargas }, EI, [{ tipo: 'fuerza', x: L }]);
    expect(s.X[0]).toBeCloseTo(entera.R[1], 10);
  });
});

describe('dos redundantes', () => {
  it('biempotrada con q: la ménsula con fuerza y par en L da qL/2 y −qL²/12', () => {
    const L = 3;
    const q = 4;
    const base: VigaRecta = { L, apoyos: [{ x: 0, tipo: 'empotramiento' }], cargas: [{ tipo: 'repartida', x1: 0, x2: L, q1: q, q2: q }] };
    const s = porRedundantes(base, EI, [
      { tipo: 'fuerza', x: L },
      { tipo: 'par', x: L },
    ]);
    expect(s.X[0]).toBeCloseTo((q * L) / 2, 10);
    /* un par en el extremo derecho: M(L⁻) = −X */
    expect(s.X[1]).toBeCloseTo((q * L * L) / 12, 10);
    expect(esfuerzosViga(s.esfuerzos, L, 'izq').M).toBeCloseTo((-q * L * L) / 12, 10);
    expect(esfuerzosViga(s.esfuerzos, L / 2).M).toBeCloseTo((q * L * L) / 24, 10);
    expect(s.elastica.v(L / 2)).toBeCloseTo((q * L ** 4) / (384 * EI), 10);
    /* Maxwell (ec. 13.8): X1 hacia arriba trabaja con −v y el par horario con
       θ, así que −δ12 (la v del par unidad) = δ21 (el θ de la fuerza unidad) */
    expect(-s.d[0][1]).toBeCloseTo(s.d[1][0], 12);
    expect(s.d[1][0]).toBeCloseTo(-(L * L) / (2 * EI), 12);
    const entera = resuelveElastica({
      L,
      EI,
      apoyos: [
        { x: 0, tipo: 'empotramiento' },
        { x: L, tipo: 'empotramiento' },
      ],
      cargas: base.cargas,
    });
    expect(s.X[1]).toBeCloseTo(entera.Mapoyo[1], 10);
  });

  it('continua de tres vanos con un asiento: lo mismo que los tres momentos y que la viga entera', () => {
    const L = 2;
    const q = 3;
    const delta = 0.05;
    const EIs = 7;
    const base: VigaRecta = {
      L: 3 * L,
      apoyos: [
        { x: 0, tipo: 'articulado' },
        { x: 3 * L, tipo: 'movil' },
      ],
      cargas: [{ tipo: 'repartida', x1: 0, x2: 3 * L, q1: q, q2: q }],
    };
    const s = porRedundantes(base, EIs, [
      { tipo: 'fuerza', x: L, asiento: delta },
      { tipo: 'fuerza', x: 2 * L },
    ]);
    const tm = tresMomentos({
      E: EIs,
      vanos: [0, 1, 2].map(() => ({ L, I: 1, cargas: [{ tipo: 'repartida' as const, x1: 0, x2: L, q1: q, q2: q }] })),
      asientos: [0, delta, 0, 0],
    });
    expect(s.X[0]).toBeCloseTo(tm.R[1], 9);
    expect(s.X[1]).toBeCloseTo(tm.R[2], 9);
    expect(esfuerzosViga(s.esfuerzos, L).M).toBeCloseTo(tm.M[1], 9);
    expect(esfuerzosViga(s.esfuerzos, 2 * L).M).toBeCloseTo(tm.M[2], 9);
    expect(s.elastica.v(L)).toBeCloseTo(delta, 10);
    const entera = resuelveElastica({
      L: 3 * L,
      EI: EIs,
      apoyos: [
        { x: 0, tipo: 'articulado' },
        { x: L, tipo: 'movil', asiento: delta },
        { x: 2 * L, tipo: 'movil' },
        { x: 3 * L, tipo: 'movil' },
      ],
      cargas: base.cargas,
    });
    expect(s.X[0]).toBeCloseTo(entera.R[1], 9);
  });
});

describe('resorte y giro impuesto', () => {
  it('apoyos en A y B y un resorte en C (la familia de 2015-2016): v(C) = X/k', () => {
    const L = 3;
    const q = 2;
    const k = 1.5;
    const base: VigaRecta = {
      L: 2 * L,
      apoyos: [
        { x: 0, tipo: 'articulado' },
        { x: L, tipo: 'movil' },
      ],
      cargas: [{ tipo: 'repartida', x1: 0, x2: 2 * L, q1: q, q2: q }],
    };
    const s = porRedundantes(base, EI, [{ tipo: 'fuerza', x: 2 * L, k }]);
    expect(s.elastica.v(2 * L)).toBeCloseTo(s.X[0] / k, 10);
    const entera = resuelveElastica({
      L: 2 * L,
      EI,
      apoyos: [...base.apoyos, { x: 2 * L, tipo: 'resorte', k }],
      cargas: base.cargas,
    });
    expect(s.X[0]).toBeCloseTo(entera.R[2], 10);
  });

  it('empotramiento en A que gira θ0, apoyo en B y sin cargas: MA = 3EIθ0/L', () => {
    const L = 2;
    const th = 0.01;
    const base: VigaRecta = {
      L,
      apoyos: [
        { x: 0, tipo: 'articulado' },
        { x: L, tipo: 'movil' },
      ],
      cargas: [],
    };
    const s = porRedundantes(base, EI, [{ tipo: 'par', x: 0, giro: th }]);
    /* biapoyada con par M0 en A: θA = M0·L/3EI */
    expect(s.X[0]).toBeCloseTo((3 * EI * th) / L, 10);
    expect(s.elastica.theta(0)).toBeCloseTo(th, 12);
  });

  it('un resorte cuyo apoyo asienta δ: v = δ + X/k, y X = −δ/(L³/3EI + 1/k) en la ménsula sin cargas', () => {
    const L = 3;
    const k = 2;
    const delta = 0.02;
    const f = L ** 3 / (3 * EI) + 1 / k;
    const base: VigaRecta = { L, apoyos: [{ x: 0, tipo: 'empotramiento' }], cargas: [] };
    const s = porRedundantes(base, EI, [{ tipo: 'fuerza', x: L, k, asiento: delta }]);
    expect(s.X[0]).toBeCloseTo(-delta / f, 12);
    expect(s.elastica.v(L)).toBeCloseTo(delta + s.X[0] / k, 12);
    expect(s.elastica.v(L)).toBeCloseTo((delta * L ** 3) / (3 * EI) / f, 12);
    /* con carga, se suma lo del resorte sin asiento (que ya cuadra con elastica.ts) */
    const conP: VigaRecta = { ...base, cargas: [{ tipo: 'puntual', x: 1, P: 4 }] };
    const sinAsiento = porRedundantes(conP, EI, [{ tipo: 'fuerza', x: L, k }]);
    const conAsiento = porRedundantes(conP, EI, [{ tipo: 'fuerza', x: L, k, asiento: delta }]);
    expect(conAsiento.X[0]).toBeCloseTo(sinAsiento.X[0] - delta / f, 12);
  });

  it('rechaza una base hiperestática, redundantes repetidas y datos imposibles', () => {
    const base: VigaRecta = { L: 2, apoyos: [{ x: 0, tipo: 'empotramiento' }], cargas: [{ tipo: 'puntual', x: 1, P: 1 }] };
    const hiper: VigaRecta = { ...base, apoyos: [...base.apoyos, { x: 2, tipo: 'movil' }] };
    expect(() => porRedundantes(hiper, EI, [{ tipo: 'fuerza', x: 1 }])).toThrow(/hiperestática/);
    expect(() =>
      porRedundantes(base, EI, [
        { tipo: 'fuerza', x: 2 },
        { tipo: 'fuerza', x: 2 },
      ]),
    ).toThrow(/independientes/);
    expect(() => porRedundantes(base, EI, [])).toThrow();
    expect(() => porRedundantes(base, EI, [{ tipo: 'fuerza', x: 3 }])).toThrow(/La redundante en x = 3 está fuera/);
    expect(() => porRedundantes(base, EI, [{ tipo: 'fuerza', x: 2, k: 0 }])).toThrow(/resorte/);
  });
});
