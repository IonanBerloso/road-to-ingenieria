/**
 * Temas 10 y 11: la elástica y las vigas hiperestáticas
 * (`src/lib/erm/elastica.ts`, `singularidad.ts`, `conjugada.ts` y
 * `tresMomentos.ts`).
 *
 * El segundo camino de cada número (CLAUDE.md §10):
 *  · casos de libro, con su número: biapoyada con q, 5qL⁴/384EI y qL³/24EI;
 *    ménsula con P, PL³/3EI y PL²/2EI; apoyada-empotrada con q, 3qL/8 y
 *    −qL²/8; biempotrada con q, −qL²/12 y qL⁴/384EI; dos vanos iguales,
 *    −qL²/8 en el apoyo central;
 *  · las soluciones 10.3 y 10.4 de la colección (las dos únicas resueltas
 *    del tema), por `elastica.ts` y por la viga conjugada;
 *  · en las isostáticas, las reacciones y el flector de `estructura.ts`
 *    (otro código, el del tema 7);
 *  · los dos teoremas de Mohr (tema 10, pp. 10-11) y las funciones de
 *    singularidad en forma cerrada, contra la integración numérica;
 *  · el teorema de los tres momentos contra la compatibilidad de flechas;
 *  · v″ = −M/EI por diferencias finitas, y Maxwell-Betti (δ12 = δ21).
 */
import { describe, expect, it } from 'vitest';
import { vigaConjugada } from '../../../src/lib/erm/conjugada';
import {
  cargasIzquierda,
  diagramaElastica,
  flechaMaxima,
  integra,
  mohr1,
  mohr2,
  resuelveElastica,
  type VigaElastica,
} from '../../../src/lib/erm/elastica';
import { corchete, elasticaSingular, evalua, flectorSingular, integraTerminos } from '../../../src/lib/erm/singularidad';
import { isostatico, tresMomentos } from '../../../src/lib/erm/tresMomentos';
import { esfuerzosViga, resuelveViga, type VigaRecta } from '../../../src/lib/erm/vigas';

const EI = 7;

describe('casos de libro (isostáticos)', () => {
  const q = 3;
  const L = 4;
  const biapoyada: VigaElastica = {
    L,
    EI,
    apoyos: [
      { tipo: 'articulado', x: 0 },
      { tipo: 'movil', x: L },
    ],
    cargas: [{ tipo: 'repartida', x1: 0, x2: L, q1: q, q2: q }],
  };

  it('biapoyada con q: v(L/2) = 5qL⁴/384EI, θA = qL³/24EI (horario) y θB = −θA', () => {
    const s = resuelveElastica(biapoyada);
    expect(s.v(L / 2)).toBeCloseTo((5 * q * L ** 4) / (384 * EI), 12);
    expect(s.theta(0)).toBeCloseTo((q * L ** 3) / (24 * EI), 12);
    expect(s.theta(L)).toBeCloseTo((-q * L ** 3) / (24 * EI), 12);
    expect(s.R[0]).toBeCloseTo((q * L) / 2, 12);
    expect(s.v(0)).toBeCloseTo(0, 14);
    const fm = flechaMaxima(s);
    expect(fm.x).toBeCloseTo(L / 2, 9);
    expect(fm.v).toBeCloseTo((5 * q * L ** 4) / (384 * EI), 12);
  });

  it('ménsula empotrada en 0 con P en la punta: v = PL³/3EI, θ = PL²/2EI, M en el empotramiento −PL', () => {
    const P = 5;
    const s = resuelveElastica({ L, EI, apoyos: [{ tipo: 'empotramiento', x: 0 }], cargas: [{ tipo: 'puntual', x: L, P }] });
    expect(s.v(L)).toBeCloseTo((P * L ** 3) / (3 * EI), 12);
    expect(s.theta(L)).toBeCloseTo((P * L ** 2) / (2 * EI), 12);
    expect(s.R[0]).toBeCloseTo(P, 12);
    expect(s.Mapoyo[0]).toBeCloseTo(-P * L, 12);
    expect(s.M(0)).toBeCloseTo(-P * L, 12);
    expect(s.M(0, 'izq')).toBeCloseTo(0, 12);
    expect(s.V(L / 2)).toBeCloseTo(P, 12);
    expect(flechaMaxima(s).x).toBeCloseTo(L, 12);
  });

  it('ménsula empotrada en el extremo DERECHO con un par en la punta izquierda: M constante y v = −M0L²/2EI en la punta', () => {
    /* par de viga.ts M0 > 0 tracciona la fibra inferior: la ménsula se curva como una sonrisa y la punta sube */
    const M0 = 2;
    const s = resuelveElastica({ L, EI, apoyos: [{ tipo: 'empotramiento', x: L }], cargas: [{ tipo: 'par', x: 0, M: M0 }] });
    expect(s.M(L / 3)).toBeCloseTo(M0, 12);
    expect(s.v(0)).toBeCloseTo((-M0 * L * L) / (2 * EI), 12);
    expect(s.Mapoyo[0]).toBeCloseTo(-M0, 12);
  });

  it('v″ = −M/EI por diferencias finitas en puntos sueltos (ec. 10.14)', () => {
    const s = resuelveElastica({
      ...biapoyada,
      cargas: [
        { tipo: 'repartida', x1: 0.5, x2: 3, q1: 1, q2: 4 },
        { tipo: 'puntual', x: 3.5, P: 2 },
      ],
    });
    const h = 1e-3;
    for (const x of [0.3, 1.7, 2.9, 3.8]) {
      const d2 = (s.v(x + h) - 2 * s.v(x) + s.v(x - h)) / (h * h);
      expect(d2).toBeCloseTo(-s.M(x) / EI, 5);
      expect((s.v(x + h) - s.v(x - h)) / (2 * h)).toBeCloseTo(s.theta(x), 6);
    }
  });

  it('un mecanismo se dice: una viga con un solo apoyo móvil, aunque no tenga cargas', () => {
    expect(() => resuelveElastica({ L, EI, apoyos: [{ tipo: 'movil', x: 1 }], cargas: [{ tipo: 'puntual', x: 2, P: 1 }] })).toThrow(/mecanismo/);
    /* sin cargas el sistema es compatible (todo nulo vale), pero no tiene solución única */
    expect(() => resuelveElastica({ L, EI, apoyos: [{ tipo: 'movil', x: 1 }], cargas: [] })).toThrow(/mecanismo/);
  });

  it('flecha máxima donde θ = 0: biapoyada con P a b del apoyo derecho, en x = √((L² − b²)/3) (libro)', () => {
    const P = 5;
    const L6 = 6;
    const b = 2;
    const s = resuelveElastica({
      L: L6,
      EI,
      apoyos: [
        { tipo: 'articulado', x: 0 },
        { tipo: 'movil', x: L6 },
      ],
      cargas: [{ tipo: 'puntual', x: L6 - b, P }],
    });
    const fm = flechaMaxima(s);
    expect(fm.x).toBeCloseTo(Math.sqrt((L6 * L6 - b * b) / 3), 9);
    expect(fm.v).toBeCloseTo((P * b * (L6 * L6 - b * b) ** 1.5) / (9 * Math.sqrt(3) * L6 * EI), 12);
  });

  it('las entradas imposibles se rechazan', () => {
    const base = { L, EI, apoyos: [{ tipo: 'empotramiento' as const, x: 0 }], cargas: [] };
    expect(() => resuelveElastica({ ...base, L: 0 })).toThrow();
    expect(() => resuelveElastica({ ...base, EI: 0 })).toThrow();
    expect(() => resuelveElastica({ ...base, apoyos: [{ tipo: 'movil', x: 5 }] })).toThrow();
    expect(() => resuelveElastica({ ...base, apoyos: [{ tipo: 'resorte', x: 1, k: 0 }] })).toThrow(/resorte/);
    expect(() => resuelveElastica({ ...base, cargas: [{ tipo: 'repartida', x1: 2, x2: 1, q1: 1, q2: 1 }] })).toThrow();
    expect(() => resuelveElastica({ ...base, rotulas: [2], cargas: [{ tipo: 'par', x: 2, M: 1 }] })).toThrow(/rótula/);
    expect(() => resuelveElastica({ ...base, EI: [{ x0: 0, x1: 2, EI: 1 }] })).toThrow();
    expect(() => resuelveElastica({ ...base, EI: [{ x0: 0, x1: 2, EI: 1 }, { x0: 2.5, x1: 4, EI: 1 }] })).toThrow();
    expect(() => resuelveElastica({ ...base, EI: [] })).toThrow();
    expect(() => resuelveElastica({ ...base, EI: [{ x0: 0, x1: 4, EI: -1 }] })).toThrow();
  });
});

describe('las soluciones 10.3 y 10.4 de la colección', () => {
  /* 10.3: C(0) — A(a) — B(5a) — D(6a); 2I en [0, 2a] y [4a, 6a], I en [2a, 4a]; P hacia abajo en C y en D.
     θB = −θA = 3Pa²/2EI y δC = δD = 5Pa³/3EI (con el I del tramo central). */
  const a = 1;
  const P = 1;
  const tramos = [
    { x0: 0, x1: 2 * a, EI: 2 * EI },
    { x0: 2 * a, x1: 4 * a, EI },
    { x0: 4 * a, x1: 6 * a, EI: 2 * EI },
  ];
  const v103: VigaRecta = {
    L: 6 * a,
    apoyos: [
      { x: a, tipo: 'articulado' },
      { x: 5 * a, tipo: 'movil' },
    ],
    cargas: [
      { tipo: 'puntual', x: 0, P },
      { tipo: 'puntual', x: 6 * a, P },
    ],
  };

  it('10.3 por la elástica: θA = −3Pa²/2EI, θB = 3Pa²/2EI y vC = vD = 5Pa³/3EI', () => {
    const s = resuelveElastica({ L: v103.L, EI: tramos, apoyos: v103.apoyos, cargas: v103.cargas });
    expect(s.theta(a)).toBeCloseTo((-1.5 * P * a * a) / EI, 12);
    expect(s.theta(5 * a)).toBeCloseTo((1.5 * P * a * a) / EI, 12);
    expect(s.v(0)).toBeCloseTo((5 / 3) * ((P * a ** 3) / EI), 12);
    expect(s.v(6 * a)).toBeCloseTo((5 / 3) * ((P * a ** 3) / EI), 12);
  });

  it('10.3 por la viga conjugada (el método de la solución)', () => {
    const c = vigaConjugada(v103, tramos, [0, a, 5 * a, 6 * a]);
    expect(c.theta(a)).toBeCloseTo((-1.5 * P * a * a) / EI, 12);
    expect(c.theta(5 * a)).toBeCloseTo((1.5 * P * a * a) / EI, 12);
    expect(c.v(0)).toBeCloseTo((5 / 3) * ((P * a ** 3) / EI), 12);
    expect(c.v(6 * a)).toBeCloseTo((5 / 3) * ((P * a ** 3) / EI), 12);
    /* los apoyos de la conjugada: los extremos libres se empotran y los apoyos intermedios son rótulas */
    expect(c.conjugada.apoyos.map((x) => x.tipo).sort()).toEqual(['empotramiento', 'empotramiento']);
    expect(c.conjugada.rotulas).toEqual([a, 5 * a]);
  });

  /* 10.4: A(0) fijo — D(a) — B(2a) móvil — C(3a) libre; q en BC.
     θC = qa³/2EI, θD = −qa³/24EI, vC = 11qa⁴/24EI (↓), vD = −qa⁴/8EI (↑). */
  const q = 1;
  const v104: VigaRecta = {
    L: 3 * a,
    apoyos: [
      { x: 0, tipo: 'articulado' },
      { x: 2 * a, tipo: 'movil' },
    ],
    cargas: [{ tipo: 'repartida', x1: 2 * a, x2: 3 * a, q1: q, q2: q }],
  };

  it('10.4 por la elástica: θC = qa³/2EI, θD = −qa³/24EI, vC = 11qa⁴/24EI y vD = −qa⁴/8EI', () => {
    const s = resuelveElastica({ L: v104.L, EI, apoyos: v104.apoyos, cargas: v104.cargas });
    expect(s.theta(3 * a)).toBeCloseTo((q * a ** 3) / (2 * EI), 12);
    expect(s.theta(a)).toBeCloseTo((-q * a ** 3) / (24 * EI), 12);
    expect(s.v(3 * a)).toBeCloseTo((11 / 24) * ((q * a ** 4) / EI), 12);
    expect(s.v(a)).toBeCloseTo((-1 / 8) * ((q * a ** 4) / EI), 12);
  });

  it('10.4 por la viga conjugada', () => {
    const c = vigaConjugada(v104, EI, [a, 3 * a]);
    expect(c.theta(3 * a)).toBeCloseTo((q * a ** 3) / (2 * EI), 12);
    expect(c.theta(a)).toBeCloseTo((-q * a ** 3) / (24 * EI), 12);
    expect(c.v(3 * a)).toBeCloseTo((11 / 24) * ((q * a ** 4) / EI), 12);
    expect(c.v(a)).toBeCloseTo((-1 / 8) * ((q * a ** 4) / EI), 12);
    /* A sigue apoyada; C, libre, se empotra; B intermedio pasa a rótula */
    expect(c.conjugada.rotulas).toEqual([2 * a]);
  });
});

describe('isostáticas: lo mismo que estructura.ts, y la conjugada con rótulas', () => {
  /* Gerber: empotrada en 0, rótula en 3, apoyo en 5, voladizo hasta 7; cargas variadas */
  const gerber: VigaRecta = {
    L: 7,
    apoyos: [
      { x: 0, tipo: 'empotramiento' },
      { x: 5, tipo: 'movil' },
    ],
    rotulas: [3],
    cargas: [
      { tipo: 'repartida', x1: 1, x2: 4, q1: 2, q2: 5 },
      { tipo: 'puntual', x: 6, P: 3 },
      { tipo: 'par', x: 1.5, M: -4 },
      { tipo: 'repartida', x1: 5, x2: 7, q1: 1, q2: 0 },
    ],
  };
  const el = resuelveElastica({ L: gerber.L, EI, apoyos: gerber.apoyos, rotulas: gerber.rotulas, cargas: gerber.cargas });
  const est = resuelveViga(gerber);

  it('las reacciones y el par de empotramiento coinciden con estructura.ts', () => {
    const r = est.sol.reacciones;
    const emp = r.find((x) => x.apoyo.tipo === 'empotramiento');
    const mov = r.find((x) => x.apoyo.tipo === 'movil');
    expect(el.R[0]).toBeCloseTo(emp?.Ry as number, 10);
    expect(el.R[1]).toBeCloseTo(mov?.Ry as number, 10);
    /* el par de estructura.ts es antihorario; el de viga.ts tracciona la fibra inferior: horario */
    expect(el.Mapoyo[0]).toBeCloseTo(-(emp?.M as number), 10);
  });

  it('M y V en cada punto, a los dos lados de las cargas puntuales y del par', () => {
    for (const x of [0, 0.7, 1.5, 2.2, 3, 4.5, 5, 6, 6.6, 7]) {
      for (const lado of ['izq', 'der'] as const) {
        if ((x === 0 && lado === 'izq') || (x === 7 && lado === 'der')) continue;
        expect(el.M(x, lado)).toBeCloseTo(esfuerzosViga(est, x, lado).M, 9);
        expect(el.V(x, lado)).toBeCloseTo(esfuerzosViga(est, x, lado).V, 9);
      }
    }
    expect(el.M(3)).toBeCloseTo(0, 10);
  });

  it('la conjugada da el mismo giro (a los dos lados de la rótula) y la misma flecha', () => {
    const xs = [0.5, 2, 3, 4, 5.5, 7];
    const c = vigaConjugada(gerber, EI, xs);
    for (const x of xs) {
      expect(c.v(x)).toBeCloseTo(el.v(x), 9);
      expect(c.theta(x, 'izq')).toBeCloseTo(el.theta(x, 'izq'), 9);
      expect(c.theta(x, 'der')).toBeCloseTo(el.theta(x, 'der'), 9);
    }
    expect(Math.abs(el.saltos[0])).toBeGreaterThan(1e-3);
    expect(el.theta(3, 'der') - el.theta(3, 'izq')).toBeCloseTo(el.saltos[0], 12);
  });

  it('sin ningún empotramiento en la conjugada: biapoyada con q, θA = qL³/24EI y v(L/2) = 5qL⁴/384EI', () => {
    /* los dos apoyos extremos pasan a móviles: alguno tiene que fijar la horizontal */
    const q = 3;
    const L = 4;
    const v: VigaRecta = {
      L,
      apoyos: [
        { x: 0, tipo: 'articulado' },
        { x: L, tipo: 'movil' },
      ],
      cargas: [{ tipo: 'repartida', x1: 0, x2: L, q1: q, q2: q }],
    };
    const c = vigaConjugada(v, EI, [L / 2]);
    expect(c.theta(0, 'der')).toBeCloseTo((q * L ** 3) / (24 * EI), 12);
    expect(c.theta(L, 'izq')).toBeCloseTo((-q * L ** 3) / (24 * EI), 12);
    expect(c.v(L / 2)).toBeCloseTo((5 * q * L ** 4) / (384 * EI), 12);
  });

  it('sin ningún empotramiento en la conjugada: empotrada, rótula y apoyo, lo mismo que la elástica', () => {
    /* empotrada en 0, rótula en 3, apoyo en 5: la conjugada, libre en 0, con apoyo en 3 y en 5 */
    const v: VigaRecta = {
      L: 5,
      apoyos: [
        { x: 0, tipo: 'empotramiento' },
        { x: 5, tipo: 'movil' },
      ],
      rotulas: [3],
      cargas: [
        { tipo: 'repartida', x1: 1, x2: 4, q1: 2, q2: 5 },
        { tipo: 'puntual', x: 4.5, P: 3 },
      ],
    };
    const el = resuelveElastica({ L: v.L, EI, apoyos: v.apoyos, rotulas: v.rotulas, cargas: v.cargas });
    const xs = [1.5, 3, 4, 5];
    const c = vigaConjugada(v, EI, xs);
    expect(c.conjugada.apoyos.some((a) => a.tipo === 'empotramiento')).toBe(false);
    for (const x of xs) {
      expect(c.v(x)).toBeCloseTo(el.v(x), 9);
      expect(c.theta(x, 'izq')).toBeCloseTo(el.theta(x, 'izq'), 9);
      expect(c.theta(x, 'der')).toBeCloseTo(el.theta(x, 'der'), 9);
    }
  });

  it('un empotramiento intermedio no tiene conjugado en la figura 10.9', () => {
    const v: VigaRecta = {
      L: 6,
      apoyos: [{ x: 3, tipo: 'empotramiento' }],
      cargas: [{ tipo: 'puntual', x: 6, P: 1 }],
    };
    expect(() => vigaConjugada(v, EI)).toThrow(/intermedio/);
  });

  it('la conjugada valida la EI como la elástica: positiva y con tramos que cubran la viga', () => {
    const v: VigaRecta = {
      L: 6,
      apoyos: [{ x: 0, tipo: 'empotramiento' }],
      cargas: [{ tipo: 'puntual', x: 6, P: 1 }],
    };
    expect(() => vigaConjugada(v, 0)).toThrow(/positiva/);
    expect(() => vigaConjugada(v, -2)).toThrow(/positiva/);
    expect(() => vigaConjugada(v, [])).toThrow(/Faltan/);
    expect(() =>
      vigaConjugada(v, [
        { x0: 0, x1: 2, EI: 1 },
        { x0: 3, x1: 6, EI: 1 },
      ]),
    ).toThrow(/hueco/);
    expect(() => vigaConjugada(v, [{ x0: 0, x1: 5, EI: 1 }])).toThrow(/cubrir/);
    expect(() =>
      vigaConjugada(v, [
        { x0: 0, x1: 3, EI: 0 },
        { x0: 3, x1: 6, EI: 1 },
      ]),
    ).toThrow(/no es válido/);
  });

  it('una carga en la rótula de una Gerber va entera a la ménsula: vB = Pa³/3EI', () => {
    const s = resuelveElastica({
      L: 5,
      EI,
      apoyos: [
        { tipo: 'empotramiento', x: 0 },
        { tipo: 'movil', x: 5 },
      ],
      rotulas: [2],
      cargas: [{ tipo: 'puntual', x: 2, P: 6 }],
    });
    expect(s.R[1]).toBeCloseTo(0, 12);
    expect(s.v(2)).toBeCloseTo((6 * 8) / (3 * EI), 12);
    /* el tramo BC queda recto: gira como sólido rígido alrededor de C */
    expect(s.v(3.5)).toBeCloseTo(s.v(2) * (1.5 / 3), 12);
  });

  it('los teoremas de Mohr: ∫M/EI = θA − θB y ∫M·xB/EI = vA + θA(xB − xA) − vB', () => {
    for (const [xA, xB] of [
      [0, 2.5],
      [3.2, 4.9],
      [5, 7],
    ]) {
      expect(mohr1(el, xA, xB)).toBeCloseTo(el.theta(xA) - el.theta(xB, 'izq'), 10);
      expect(mohr2(el, xA, xB)).toBeCloseTo(el.v(xA) + el.theta(xA) * (xB - xA) - el.v(xB), 10);
    }
  });

  it('Mohr con A a la derecha de B sigue dando θA − θB y δB,A; con una rótula entre A y B, lanza', () => {
    for (const [xA, xB] of [
      [2.5, 0.4],
      [4.9, 3.2],
      [6.5, 5.5],
    ]) {
      expect(mohr1(el, xA, xB)).toBeCloseTo(el.theta(xA) - el.theta(xB), 10);
      expect(mohr2(el, xA, xB)).toBeCloseTo(el.v(xA) + el.theta(xA) * (xB - xA) - el.v(xB), 10);
    }
    /* la rótula de la Gerber está en x = 3: el giro salta y ∫M/EI no lo ve */
    expect(() => mohr1(el, 1, 4)).toThrow(/rótula/);
    expect(() => mohr1(el, 4, 1)).toThrow(/rótula/);
    expect(() => mohr2(el, 1, 4)).toThrow(/rótula/);
    /* hasta la rótula, sí: el giro de la ménsula AB en x = 3 por la izquierda */
    expect(mohr1(el, 0, 3)).toBeCloseTo(el.theta(0) - el.theta(3, 'izq'), 10);
  });

  it('el diagrama lleva los puntos singulares a los dos lados', () => {
    const d = diagramaElastica(el, 20);
    const en6 = d.filter((p) => p.x === 6);
    expect(en6).toHaveLength(2);
    expect(en6[0].V - en6[1].V).toBeCloseTo(3, 12);
  });
});

describe('funciones de singularidad (apartado 10.3)', () => {
  it('los corchetes: ⟨x − a⟩ⁿ es 0 hasta a, incluido (ec. 10.15)', () => {
    expect(corchete(2, 2, 0)).toBe(0);
    expect(corchete(2.5, 2, 0)).toBe(1);
    expect(corchete(5, 2, 2)).toBe(9);
    expect(integraTerminos([{ c: 6, a: 1, n: 2 }])).toEqual([{ c: 2, a: 1, n: 3 }]);
  });

  it('el flector de la figura 10.4: M = RA·x − P⟨x − a⟩ − ½q0⟨x − b⟩²', () => {
    const t = flectorSingular(
      [
        { tipo: 'puntual', x: 2, P: 5 },
        { tipo: 'repartida', x1: 3, x2: 6, q1: 4, q2: 4 },
      ],
      [{ x: 0, R: 9 }],
    );
    const x = 4.5;
    expect(evalua(t, x)).toBeCloseTo(9 * x - 5 * (x - 2) - 0.5 * 4 * (x - 3) ** 2, 12);
  });

  it('la elástica en forma cerrada coincide con la integración numérica (biapoyada con voladizo y cargas variadas)', () => {
    const viga: VigaElastica = {
      L: 8,
      EI,
      apoyos: [
        { tipo: 'articulado', x: 1 },
        { tipo: 'movil', x: 6 },
      ],
      cargas: [
        { tipo: 'repartida', x1: 0, x2: 4, q1: 3, q2: 1 },
        { tipo: 'puntual', x: 7.5, P: 2 },
        { tipo: 'par', x: 5, M: 3 },
      ],
    };
    const s = resuelveElastica(viga);
    const m = elasticaSingular(
      EI,
      viga.cargas,
      [
        { x: 1, R: s.R[0] },
        { x: 6, R: s.R[1] },
      ],
      [
        { x: 1, que: 'v', valor: 0 },
        { x: 6, que: 'v', valor: 0 },
      ],
    );
    for (const x of [0, 0.5, 2, 4.4, 6, 7, 8]) {
      expect(m.v(x)).toBeCloseTo(s.v(x), 10);
      expect(m.theta(x)).toBeCloseTo(s.theta(x), 10);
      expect(evalua(m.M, x)).toBeCloseTo(s.M(x), 10);
    }
  });

  it('con las reacciones de una hiperestática, la tercera condición se cumple sola', () => {
    /* apoyada en 0 y 4 y en un resorte en 9, con q: la flecha del resorte tiene que ser R/k */
    const k = 2;
    const viga: VigaElastica = {
      L: 9,
      EI,
      apoyos: [
        { tipo: 'articulado', x: 0 },
        { tipo: 'movil', x: 4 },
        { tipo: 'resorte', x: 9, k },
      ],
      cargas: [{ tipo: 'repartida', x1: 0, x2: 9, q1: 1, q2: 1 }],
    };
    const s = resuelveElastica(viga);
    const m = elasticaSingular(
      EI,
      viga.cargas,
      s.R.map((R, i) => ({ x: viga.apoyos[i].x, R })),
      [
        { x: 0, que: 'v', valor: 0 },
        { x: 4, que: 'v', valor: 0 },
      ],
    );
    expect(m.v(9)).toBeCloseTo(s.R[2] / k, 10);
  });

  it('con rótula, el salto de giro entra como incógnita', () => {
    const viga: VigaElastica = {
      L: 5,
      EI,
      apoyos: [
        { tipo: 'empotramiento', x: 0 },
        { tipo: 'movil', x: 5 },
      ],
      rotulas: [2],
      cargas: [{ tipo: 'repartida', x1: 0, x2: 5, q1: 2, q2: 2 }],
    };
    const s = resuelveElastica(viga);
    const m = elasticaSingular(
      EI,
      viga.cargas,
      [
        { x: 0, R: s.R[0], M: s.Mapoyo[0] },
        { x: 5, R: s.R[1] },
      ],
      [
        { x: 0, que: 'v', valor: 0 },
        { x: 0, que: 'theta', valor: 0 },
        { x: 5, que: 'v', valor: 0 },
      ],
      [2],
    );
    expect(m.saltos[0]).toBeCloseTo(s.saltos[0], 10);
    expect(m.v(3.3)).toBeCloseTo(s.v(3.3), 10);
    expect(() => elasticaSingular(EI, [], [], [{ x: 0, que: 'v', valor: 0 }])).toThrow(/Hacen falta/);
    expect(() =>
      elasticaSingular(EI, [], [], [
        { x: 1, que: 'v', valor: 0 },
        { x: 1, que: 'v', valor: 0 },
      ]),
    ).toThrow();
    expect(() => elasticaSingular(0, [], [], [])).toThrow();
  });

  it('la condición de giro más allá de la rótula lleva su salto: móvil, rótula y empotramiento a la derecha', () => {
    const viga: VigaElastica = {
      L: 5,
      EI,
      apoyos: [
        { tipo: 'movil', x: 0 },
        { tipo: 'empotramiento', x: 5 },
      ],
      rotulas: [1.5],
      cargas: [
        { tipo: 'puntual', x: 0.7, P: 3 },
        { tipo: 'repartida', x1: 2, x2: 5, q1: 1, q2: 2 },
      ],
    };
    const s = resuelveElastica(viga);
    const m = elasticaSingular(
      EI,
      viga.cargas,
      [
        { x: 0, R: s.R[0] },
        { x: 5, R: s.R[1], M: s.Mapoyo[1] },
      ],
      [
        { x: 0, que: 'v', valor: 0 },
        { x: 5, que: 'v', valor: 0 },
        { x: 5, que: 'theta', valor: 0 },
      ],
      [1.5],
    );
    for (const x of [0.4, 1.2, 2.6, 4.1]) {
      expect(m.v(x)).toBeCloseTo(s.v(x), 10);
      expect(m.theta(x)).toBeCloseTo(s.theta(x), 10);
    }
    expect(m.saltos[0]).toBeCloseTo(s.saltos[0], 10);
  });

  it('condiciones no nulas: un asiento y un giro impuesto, contra elastica.ts', () => {
    const delta = 0.03;
    const conAsiento: VigaElastica = {
      L: 4,
      EI,
      apoyos: [
        { tipo: 'articulado', x: 0 },
        { tipo: 'movil', x: 4, asiento: delta },
      ],
      cargas: [{ tipo: 'repartida', x1: 0, x2: 4, q1: 2, q2: 2 }],
    };
    const s = resuelveElastica(conAsiento);
    const m = elasticaSingular(
      EI,
      conAsiento.cargas,
      s.R.map((R, i) => ({ x: conAsiento.apoyos[i].x, R })),
      [
        { x: 0, que: 'v', valor: 0 },
        { x: 4, que: 'v', valor: delta },
      ],
    );
    expect(m.v(1.3)).toBeCloseTo(s.v(1.3), 12);
    expect(m.theta(0)).toBeCloseTo(s.theta(0), 12);
    /* y el giro: la ménsula con su empotramiento girado θ0 */
    const th0 = 0.01;
    const conGiro: VigaElastica = { L: 3, EI, apoyos: [{ tipo: 'empotramiento', x: 0, giro: th0 }], cargas: [{ tipo: 'puntual', x: 3, P: 1 }] };
    const g = resuelveElastica(conGiro);
    const mg = elasticaSingular(
      EI,
      conGiro.cargas,
      [{ x: 0, R: g.R[0], M: g.Mapoyo[0] }],
      [
        { x: 0, que: 'v', valor: 0 },
        { x: 0, que: 'theta', valor: th0 },
      ],
    );
    expect(mg.v(3)).toBeCloseTo(g.v(3), 12);
    /* libro: θ0·L + PL³/3EI */
    expect(mg.v(3)).toBeCloseTo(th0 * 3 + 3 ** 3 / (3 * EI), 12);
  });
});

describe('hiperestáticas (tema 11): casos de libro, resortes y asientos', () => {
  const q = 2;
  const L = 6;

  it('apoyada-empotrada con q: RB = 3qL/8, M en el empotramiento −qL²/8', () => {
    const s = resuelveElastica({
      L,
      EI,
      apoyos: [
        { tipo: 'empotramiento', x: 0 },
        { tipo: 'movil', x: L },
      ],
      cargas: [{ tipo: 'repartida', x1: 0, x2: L, q1: q, q2: q }],
    });
    expect(s.R[1]).toBeCloseTo((3 * q * L) / 8, 10);
    expect(s.R[0]).toBeCloseTo((5 * q * L) / 8, 10);
    expect(s.Mapoyo[0]).toBeCloseTo((-q * L * L) / 8, 10);
    expect(s.v(L)).toBeCloseTo(0, 12);
    expect(s.theta(0)).toBeCloseTo(0, 12);
  });

  it('biempotrada con q: −qL²/12 en los extremos, qL²/24 en el centro, v = qL⁴/384EI', () => {
    const s = resuelveElastica({
      L,
      EI,
      apoyos: [
        { tipo: 'empotramiento', x: 0 },
        { tipo: 'empotramiento', x: L },
      ],
      cargas: [{ tipo: 'repartida', x1: 0, x2: L, q1: q, q2: q }],
    });
    expect(s.M(0)).toBeCloseTo((-q * L * L) / 12, 10);
    expect(s.M(L, 'izq')).toBeCloseTo((-q * L * L) / 12, 10);
    expect(s.M(L / 2)).toBeCloseTo((q * L * L) / 24, 10);
    expect(s.v(L / 2)).toBeCloseTo((q * L ** 4) / (384 * EI), 10);
  });

  it('dos vanos iguales con q: −qL²/8 sobre el apoyo central y 5qL/4 de reacción', () => {
    const s = resuelveElastica({
      L: 2 * L,
      EI,
      apoyos: [
        { tipo: 'articulado', x: 0 },
        { tipo: 'movil', x: L },
        { tipo: 'movil', x: 2 * L },
      ],
      cargas: [{ tipo: 'repartida', x1: 0, x2: 2 * L, q1: q, q2: q }],
    });
    expect(s.M(L)).toBeCloseTo((-q * L * L) / 8, 10);
    expect(s.R[1]).toBeCloseTo((5 * q * L) / 4, 10);
  });

  it('un asiento δ en el apoyo de una apoyada-empotrada sin cargas tira de ella: RB = −3EIδ/L³', () => {
    const d = 0.01;
    const s = resuelveElastica({
      L,
      EI,
      apoyos: [
        { tipo: 'empotramiento', x: 0 },
        { tipo: 'movil', x: L, asiento: d },
      ],
      cargas: [],
    });
    expect(s.R[1]).toBeCloseTo((-3 * EI * d) / L ** 3, 12);
    expect(s.v(L)).toBeCloseTo(d, 12);
  });

  it('un giro impuesto en un empotramiento: ménsula sin cargas que gira como un sólido', () => {
    const s = resuelveElastica({ L, EI, apoyos: [{ tipo: 'empotramiento', x: 0, giro: 0.002 }], cargas: [] });
    expect(s.v(L)).toBeCloseTo(0.002 * L, 14);
  });

  it('ménsula con un resorte k en la punta y P: R = k·P·L³/(3EI + kL³)', () => {
    const k = 0.5;
    const P = 4;
    const s = resuelveElastica({
      L,
      EI,
      apoyos: [
        { tipo: 'empotramiento', x: 0 },
        { tipo: 'resorte', x: L, k },
      ],
      cargas: [{ tipo: 'puntual', x: L, P }],
    });
    expect(s.R[1]).toBeCloseTo((k * P * L ** 3) / (3 * EI + k * L ** 3), 12);
    expect(s.v(L)).toBeCloseTo(s.R[1] / k, 12);
  });

  it('Maxwell-Betti en una hiperestática con rótula y resorte: δ12 = δ21', () => {
    const base = {
      L: 9,
      EI: [
        { x0: 0, x1: 4, EI: 3 },
        { x0: 4, x1: 9, EI: 5 },
      ],
      apoyos: [
        { tipo: 'empotramiento' as const, x: 0 },
        { tipo: 'movil' as const, x: 4 },
        { tipo: 'resorte' as const, x: 9, k: 0.3 },
      ],
      rotulas: [6],
    };
    const s1 = resuelveElastica({ ...base, cargas: [{ tipo: 'puntual', x: 2, P: 1 }] });
    const s2 = resuelveElastica({ ...base, cargas: [{ tipo: 'puntual', x: 7.5, P: 1 }] });
    expect(s1.v(7.5)).toBeCloseTo(s2.v(2), 12);
    /* y con un par (horario, como θ > 0): la flecha bajo la fuerza por el par unidad es el giro bajo el par por la fuerza unidad */
    const s3 = resuelveElastica({ ...base, cargas: [{ tipo: 'par', x: 5, M: 1 }] });
    expect(s3.v(2)).toBeCloseTo(s1.theta(5), 12);
  });
});

describe('el teorema de los tres momentos (ec. 11.3) contra la compatibilidad de flechas', () => {
  it('dos vanos iguales con q: M1 = −qL²/8 (ec. 11.4); el diagrama isostático, A = qL³/12 en L/2', () => {
    const r = tresMomentos({
      E: 1,
      vanos: [
        { L: 4, I: 1, cargas: [{ tipo: 'repartida', x1: 0, x2: 4, q1: 3, q2: 3 }] },
        { L: 4, I: 1, cargas: [{ tipo: 'repartida', x1: 0, x2: 4, q1: 3, q2: 3 }] },
      ],
    });
    expect(r.M[1]).toBeCloseTo((-3 * 16) / 8, 12);
    const iso = isostatico({ L: 4, I: 1, cargas: [{ tipo: 'repartida', x1: 0, x2: 4, q1: 3, q2: 3 }] });
    expect(iso.A).toBeCloseTo((3 * 64) / 12, 12);
    expect(iso.a).toBeCloseTo(2, 12);
  });

  it('tres vanos de inercias distintas, cargas asimétricas, asientos, voladizo a la izquierda y empotramiento a la derecha', () => {
    const E = 200;
    const vanos = [
      { L: 3, I: 2, cargas: [{ tipo: 'puntual' as const, x: 1, P: 5 }] },
      { L: 5, I: 3, cargas: [{ tipo: 'repartida' as const, x1: 0.5, x2: 4, q1: 1, q2: 3 }] },
      { L: 4, I: 1.5, cargas: [{ tipo: 'par' as const, x: 2.5, M: 2 }] },
    ];
    const asientos = [0, 0.002, -0.001, 0.0005];
    /* el voladizo de 1,5 a la izquierda del apoyo 0 con P = 2 en la punta: M0 = −2·1,5 */
    const r = tresMomentos({ E, vanos, asientos, izquierda: { tipo: 'apoyo', M: -3 }, derecha: { tipo: 'empotramiento' } });
    /* la misma viga para elastica.ts: x desde la punta del voladizo */
    const x0 = 1.5;
    const xs = [x0, x0 + 3, x0 + 8, x0 + 12];
    const s = resuelveElastica({
      L: x0 + 12,
      EI: [
        { x0: 0, x1: xs[1], EI: E * 2 },
        { x0: xs[1], x1: xs[2], EI: E * 3 },
        { x0: xs[2], x1: xs[3], EI: E * 1.5 },
      ],
      apoyos: [
        { tipo: 'articulado', x: xs[0], asiento: asientos[0] },
        { tipo: 'movil', x: xs[1], asiento: asientos[1] },
        { tipo: 'movil', x: xs[2], asiento: asientos[2] },
        { tipo: 'empotramiento', x: xs[3], asiento: asientos[3] },
      ],
      cargas: [
        { tipo: 'puntual', x: 0, P: 2 },
        { tipo: 'puntual', x: x0 + 1, P: 5 },
        { tipo: 'repartida', x1: xs[1] + 0.5, x2: xs[1] + 4, q1: 1, q2: 3 },
        { tipo: 'par', x: xs[2] + 2.5, M: 2 },
      ],
    });
    expect(r.M[0]).toBeCloseTo(s.M(xs[0]), 9);
    expect(r.M[1]).toBeCloseTo(s.M(xs[1]), 9);
    expect(r.M[2]).toBeCloseTo(s.M(xs[2]), 9);
    expect(r.M[3]).toBeCloseTo(s.M(xs[3], 'izq'), 9);
    /* reacciones (sin la carga del voladizo, que va entera al apoyo 0) */
    expect(r.R[0] + 2).toBeCloseTo(s.R[0], 9);
    expect(r.R[1]).toBeCloseTo(s.R[1], 9);
    expect(r.R[2]).toBeCloseTo(s.R[2], 9);
    expect(r.flectorVano(2, 2.2)).toBeCloseTo(s.M(xs[1] + 2.2), 9);
  });

  it('el diagrama isostático de una puntual es un triángulo: su centro de gravedad a (0 + L + xP)/3 del apoyo izquierdo', () => {
    const iso = isostatico({ L: 4, I: 1, cargas: [{ tipo: 'puntual', x: 1, P: 2 }] });
    /* pico P·a·b/L = 2·1·3/4 = 1,5; área ½·4·1,5 = 3 */
    expect(iso.A).toBeCloseTo(3, 12);
    expect(iso.a).toBeCloseTo(5 / 3, 12);
    expect(iso.b).toBeCloseTo(7 / 3, 12);
  });

  it('voladizo a la derecha: dos vanos con el momento del extremo conocido, contra la viga entera', () => {
    /* apoyos en 0, 4 y 8 y un voladizo de 1 con P = 2 en la punta: M2 = −2 */
    const r = tresMomentos({
      E: 1,
      vanos: [
        { L: 4, I: 1, cargas: [{ tipo: 'repartida', x1: 0, x2: 4, q1: 1, q2: 1 }] },
        { L: 4, I: 1, cargas: [] },
      ],
      derecha: { tipo: 'apoyo', M: -2 },
    });
    const s = resuelveElastica({
      L: 9,
      EI: 1,
      apoyos: [
        { tipo: 'articulado', x: 0 },
        { tipo: 'movil', x: 4 },
        { tipo: 'movil', x: 8 },
      ],
      cargas: [
        { tipo: 'repartida', x1: 0, x2: 4, q1: 1, q2: 1 },
        { tipo: 'puntual', x: 9, P: 2 },
      ],
    });
    expect(r.M[2]).toBeCloseTo(-2, 12);
    expect(r.M[1]).toBeCloseTo(s.M(4), 9);
    expect(r.R[0]).toBeCloseTo(s.R[0], 9);
  });

  it('empotrada a la izquierda y apoyada a la derecha, un vano: M0 = −qL²/8', () => {
    const r = tresMomentos({
      E: 1,
      vanos: [{ L: 6, I: 1, cargas: [{ tipo: 'repartida', x1: 0, x2: 6, q1: 2, q2: 2 }] }],
      izquierda: { tipo: 'empotramiento' },
    });
    expect(r.M[0]).toBeCloseTo((-2 * 36) / 8, 12);
    expect(r.R[1]).toBeCloseTo((3 * 2 * 6) / 8, 12);
  });

  it('las entradas imposibles se rechazan', () => {
    expect(() => tresMomentos({ E: 1, vanos: [] })).toThrow();
    expect(() => tresMomentos({ E: 1, vanos: [{ L: 0, I: 1, cargas: [] }] })).toThrow();
    expect(() => tresMomentos({ E: 1, vanos: [{ L: 1, I: 1, cargas: [] }], asientos: [0] })).toThrow();
  });
});

describe('piezas sueltas', () => {
  it('integra: Gauss de cinco puntos es exacta en polinomios de grado 9 y parte por los cortes', () => {
    expect(integra((x) => x ** 9, 0, 2, [])).toBeCloseTo(2 ** 10 / 10, 10);
    expect(integra((x) => (x < 1 ? 1 : 3), 0, 2, [1])).toBeCloseTo(4, 14);
    expect(integra((x) => x, 2, 1, [])).toBe(0);
  });

  it('cargasIzquierda: el flector y el cortante de las cargas solas, a los dos lados', () => {
    const c = [
      { tipo: 'puntual' as const, x: 2, P: 3 },
      { tipo: 'repartida' as const, x1: 0, x2: 4, q1: 0, q2: 4 },
    ];
    expect(cargasIzquierda(c, 2, 'izq').V).toBeCloseTo(-2, 12);
    expect(cargasIzquierda(c, 2, 'der').V).toBeCloseTo(-5, 12);
    expect(cargasIzquierda(c, 3).M).toBeCloseTo(-3 * 1 - (4.5 * 3) / 3, 12);
  });
});
