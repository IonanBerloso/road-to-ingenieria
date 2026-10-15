/**
 * Tema 13: teoremas energéticos en estructuras planas
 * (`src/lib/erm/energia.ts`).
 *
 * El segundo camino de cada número (CLAUDE.md §10):
 *  · los casos de libro con su número (PL³/3EI, 5qL⁴/384EI, PL/2EA·sen²α,
 *    el pórtico FH²(H/3 + L/2)/EI calculado a mano en el comentario);
 *  · la elástica de `elastica.ts` en las vigas (otra ecuación: v″ = −M/EI);
 *  · el teorema de Engesser-Castigliano sin fuerza unitaria: la derivada
 *    numérica de la coenergía respecto de la carga, o de una carga ficticia
 *    que luego se anula (ec. 13.14);
 *  · los hiperestáticos contra `redundantes.ts`, contra el resorte de
 *    `elastica.ts` y un tirante contra el resorte equivalente k = EA/L;
 *  · χ = 6/5 y 10/9 integrando la ec. 13.37 sobre la sección.
 */
import { describe, expect, it } from 'vitest';
import { resuelveElastica } from '../../../src/lib/erm/elastica';
import {
  coeficienteCortante,
  coenergia,
  desplazamiento,
  menabrea,
  producto,
  solucionUnidad,
  type RigidezBarra,
} from '../../../src/lib/erm/energia';
import { resuelve, type Estructura } from '../../../src/lib/erm/estructura';
import { esfuerzosEn } from '../../../src/lib/erm/esfuerzos';
import { porRedundantes } from '../../../src/lib/erm/redundantes';
import { circular, rectanguloMacizo } from '../../../src/lib/erm/secciones';
import { vigaRecta } from '../../../src/lib/erm/vigas';

const EI = 7;

/** Derivada central: exacta en la coenergía, que es cuadrática en las cargas. */
const deriva = (f: (h: number) => number, h = 1e-3) => (f(h) - f(-h)) / (2 * h);

describe('vigas: fuerza unitaria, elástica y Castigliano', () => {
  const L = 3;
  const P = 5;

  it('ménsula con P en la punta: δ = PL³/3EI, el giro y C = P²L³/6EI', () => {
    const est = vigaRecta({ L, apoyos: [{ x: 0, tipo: 'empotramiento' }], cargas: [{ tipo: 'puntual', x: L, P }] });
    const sol = resuelve(est);
    const rig = { EI };
    const d = desplazamiento(sol, rig, { tipo: 'fuerza', nudo: 'n1', direccion: [0, -1] });
    expect(d).toBeCloseTo((P * L ** 3) / (3 * EI), 10);
    const el = resuelveElastica({ L, EI, apoyos: [{ x: 0, tipo: 'empotramiento' }], cargas: [{ tipo: 'puntual', x: L, P }] });
    expect(d).toBeCloseTo(el.v(L), 10);
    /* el giro antihorario es −θ del tema 10 (θ horario) */
    expect(desplazamiento(sol, rig, { tipo: 'par', nudo: 'n1' })).toBeCloseTo(-el.theta(L), 10);
    expect(coenergia(sol, rig).total).toBeCloseTo((P * P * L ** 3) / (6 * EI), 10);
    /* ec. 13.14: δ = ∂C/∂P */
    const C = (h: number) =>
      coenergia(resuelve(vigaRecta({ L, apoyos: [{ x: 0, tipo: 'empotramiento' }], cargas: [{ tipo: 'puntual', x: L, P: P + h }] })), rig).total;
    expect(deriva(C)).toBeCloseTo(d, 8);
  });

  it('con cortante: δ = PL³/3EI + χPL/GA', () => {
    const est = vigaRecta({ L, apoyos: [{ x: 0, tipo: 'empotramiento' }], cargas: [{ tipo: 'puntual', x: L, P }] });
    const rig: RigidezBarra = { EI, GA: 11 };
    const d = desplazamiento(resuelve(est), rig, { tipo: 'fuerza', nudo: 'n1', direccion: [0, -1] });
    expect(d).toBeCloseTo((P * L ** 3) / (3 * EI) + (1.2 * P * L) / 11, 10);
    const c = coenergia(resuelve(est), rig);
    expect(c.V).toBeCloseTo((1.2 * P * P * L) / (2 * 11), 10);
  });

  it('biapoyada con q: 5qL⁴/384EI en el centro, con la unidad en un punto de la barra', () => {
    const q = 2;
    const est = vigaRecta({
      L,
      apoyos: [
        { x: 0, tipo: 'articulado' },
        { x: L, tipo: 'movil' },
      ],
      cargas: [{ tipo: 'repartida', x1: 0, x2: L, q1: q, q2: q }],
    });
    const d = desplazamiento(resuelve(est), { EI }, { tipo: 'fuerza', barra: 'b0', s: L / 2, direccion: [0, -1] });
    expect(d).toBeCloseTo((5 * q * L ** 4) / (384 * EI), 10);
    /* giro del apoyo izquierdo: qL³/24EI horario */
    expect(desplazamiento(resuelve(est), { EI }, { tipo: 'par', nudo: 'n0' })).toBeCloseTo((-q * L ** 3) / (24 * EI), 10);
  });

  it('curvatura inicial κ0 (gradiente térmico): δ = κ0L²/8 en el centro de la biapoyada', () => {
    const est = vigaRecta({
      L,
      apoyos: [
        { x: 0, tipo: 'articulado' },
        { x: L, tipo: 'movil' },
      ],
      cargas: [],
    });
    const k0 = 1e-3;
    const d = desplazamiento(resuelve(est), { EI, kappa0: k0 }, { tipo: 'fuerza', barra: 'b0', s: L / 2, direccion: [0, -1] });
    expect(d).toBeCloseTo((k0 * L * L) / 8, 12);
  });
});

/** Pórtico: A (0,0) articulado, B (0,H), C (L,H), D (L,0) móvil. */
function portico(H: number, L: number, cargas: Estructura['cargas'], apoyoD: 'movil' | 'articulado' = 'movil'): Estructura {
  return {
    nudos: [
      { id: 'A', x: 0, y: 0 },
      { id: 'B', x: 0, y: H },
      { id: 'C', x: L, y: H },
      { id: 'D', x: L, y: 0 },
    ],
    barras: [
      { id: 'AB', i: 'A', j: 'B' },
      { id: 'BC', i: 'B', j: 'C' },
      { id: 'CD', i: 'C', j: 'D' },
    ],
    apoyos: [
      { tipo: 'articulado', nudo: 'A' },
      apoyoD === 'movil' ? { tipo: 'movil', nudo: 'D' } : { tipo: 'articulado', nudo: 'D' },
    ],
    cargas,
  };
}

describe('pórtico', () => {
  const H = 3;
  const L = 4;
  const F = 2;

  it('desplazamiento horizontal del apoyo móvil: FH²(H/3 + L/2)/EI', () => {
    /* A mano: M real en AB = F·y, en BC = F·H(1 − x/L), en CD = 0; con la
       unidad horizontal en D, m = y en AB, H en BC y lo que baja en CD.
       ∫Mm/EI = (F·H³/3 + F·H²·L/2)/EI = 2·9·(1 + 2)/7 = 54/7. */
    const sol = resuelve(portico(H, L, [{ tipo: 'nudo', nudo: 'B', Fx: F }]));
    const d = desplazamiento(sol, { EI }, { tipo: 'fuerza', nudo: 'D', direccion: [1, 0] });
    expect(d).toBeCloseTo((F * H * H * (H / 3 + L / 2)) / EI, 10);
    expect(d).toBeCloseTo(54 / 7, 10);
  });

  it('lo mismo con una carga ficticia Q en D y ∂C/∂Q en Q = 0', () => {
    const C = (Q: number) =>
      coenergia(
        resuelve(
          portico(H, L, [
            { tipo: 'nudo', nudo: 'B', Fx: F },
            { tipo: 'nudo', nudo: 'D', Fx: Q },
          ]),
        ),
        { EI },
      ).total;
    expect(deriva(C)).toBeCloseTo((F * H * H * (H / 3 + L / 2)) / EI, 8);
  });

  it('pórtico biarticulado (grado 1): la reacción horizontal de D por Menabrea, y con un tirante AD', () => {
    const base = portico(H, L, [{ tipo: 'nudo', nudo: 'B', Fx: F }]);
    const m = menabrea(base, { EI }, [{ tipo: 'fuerza', nudo: 'D', direccion: [1, 0] }]);
    /* δD0 = 54/7 y δDD = ∫m²/EI = (H³/3 + H²L + H³/3)/EI = 54/7 → X = −1 */
    expect(m.d0[0]).toBeCloseTo(54 / 7, 10);
    expect(m.d[0][0]).toBeCloseTo((2 * H ** 3) / 3 / EI + (H * H * L) / EI, 10);
    expect(m.X[0]).toBeCloseTo(-(54 / 7) / ((18 + 36) / 7), 10);
    /* la estructura final cierra: D no se mueve */
    expect(desplazamiento(m.sol, { EI }, { tipo: 'fuerza', nudo: 'D', direccion: [1, 0] })).toBeCloseTo(0, 10);
    /* tirante AD de EA = 30: lo mismo que un resorte k = EA/L hacia A */
    const t = menabrea(base, { EI }, [{ tipo: 'tirante', a: 'A', b: 'D', EA: 30 }]);
    const r = menabrea(base, { EI }, [{ tipo: 'fuerza', nudo: 'D', direccion: [-1, 0], k: 30 / L }]);
    expect(t.X[0]).toBeCloseTo(r.X[0], 10);
    expect(t.X[0]).toBeCloseTo((54 / 7) / (54 / 7 + L / 30), 10);
  });

  it('tirante que se calienta: X = −(δ0 + ε0·L)/(δ11 + L/EA)', () => {
    const base = portico(H, L, [{ tipo: 'nudo', nudo: 'B', Fx: F }]);
    const eps0 = 1e-3;
    const t = menabrea(base, { EI }, [{ tipo: 'tirante', a: 'A', b: 'D', EA: 30, eps0 }]);
    expect(t.X[0]).toBeCloseTo(-(t.d0[0] + eps0 * L) / (t.d[0][0] + L / 30), 12);
    /* sin carga, solo el calor: el tirante se alarga, el pórtico lo frena y queda comprimido */
    const solo = menabrea(portico(H, L, []), { EI }, [{ tipo: 'tirante', a: 'A', b: 'D', EA: 30, eps0 }]);
    expect(solo.X[0]).toBeLessThan(0);
  });
});

describe('celosía y otros', () => {
  it('dos barras articuladas con P en el vértice: δ = PL/(2EA·sen²α) y δ = ∂C/∂P', () => {
    const a = 3;
    const h = 4;
    const Lb = 5;
    const EA = 100;
    const P = 6;
    const est = (Pv: number): Estructura => ({
      nudos: [
        { id: 'A', x: -a, y: 0 },
        { id: 'B', x: 0, y: h },
        { id: 'C', x: a, y: 0 },
      ],
      barras: [
        { id: 'AB', i: 'A', j: 'B' },
        { id: 'CB', i: 'C', j: 'B' },
      ],
      apoyos: [
        { tipo: 'articulado', nudo: 'A' },
        { tipo: 'articulado', nudo: 'C' },
      ],
      rotulas: ['B'],
      cargas: [{ tipo: 'nudo', nudo: 'B', Fy: -Pv }],
    });
    const rig = { EI: 1e6, EA };
    const sol = resuelve(est(P));
    expect(esfuerzosEn(sol, 'AB', 1).N).toBeCloseTo(-P / (2 * (h / Lb)), 10);
    const d = desplazamiento(sol, rig, { tipo: 'fuerza', nudo: 'B', direccion: [0, -1] });
    expect(d).toBeCloseTo((P * Lb) / (2 * EA * (h / Lb) ** 2), 10);
    expect(deriva((x) => coenergia(resuelve(est(P + x)), rig).total)).toBeCloseTo(d, 8);
    /* acercamiento relativo de A y C: cero, están fijos */
    expect(desplazamiento(sol, rig, { tipo: 'relativo', a: 'A', b: 'C' })).toBeCloseTo(0, 12);
  });

  it('Menabrea en la apoyada-empotrada da lo mismo que redundantes.ts (5P/16)', () => {
    const L = 4;
    const P = 8;
    const est = vigaRecta({ L, apoyos: [{ x: 0, tipo: 'empotramiento' }], cargas: [{ tipo: 'puntual', x: L / 2, P }] });
    const m = menabrea(est, { EI }, [{ tipo: 'fuerza', nudo: 'n1', direccion: [0, 1] }]);
    const r = porRedundantes({ L, apoyos: [{ x: 0, tipo: 'empotramiento' }], cargas: [{ tipo: 'puntual', x: L / 2, P }] }, EI, [
      { tipo: 'fuerza', x: L },
    ]);
    expect(m.X[0]).toBeCloseTo((5 * P) / 16, 10);
    expect(m.X[0]).toBeCloseTo(r.X[0], 10);
    /* un resorte en la punta, contra elastica.ts */
    const k = 2;
    const mk = menabrea(est, { EI }, [{ tipo: 'fuerza', nudo: 'n1', direccion: [0, 1], k }]);
    const el = resuelveElastica({
      L,
      EI,
      apoyos: [
        { x: 0, tipo: 'empotramiento' },
        { x: L, tipo: 'resorte', k },
      ],
      cargas: [{ tipo: 'puntual', x: L / 2, P }],
    });
    expect(mk.X[0]).toBeCloseTo(el.R[1], 10);
  });

  it('producto simétrico (Maxwell, ec. 13.8) y errores', () => {
    const est = portico(3, 4, []);
    const u1 = solucionUnidad(est, { tipo: 'fuerza', nudo: 'B', direccion: [1, 0] });
    const u2 = solucionUnidad(est, { tipo: 'par', nudo: 'C' });
    expect(producto(u1, u2, { EI })).toBeCloseTo(producto(u2, u1, { EI }), 12);
    expect(() => desplazamiento(resuelve(est), { AB: { EI } }, { tipo: 'par', nudo: 'C' })).toThrow(/rigideces/);
    expect(() => desplazamiento(resuelve(est), { EI }, { tipo: 'fuerza', nudo: 'B', direccion: [0, 0] })).toThrow(/nulo/);
    expect(() => menabrea(est, { EI }, [])).toThrow();
    expect(() => menabrea(est, { EI }, [{ tipo: 'fuerza', nudo: 'Z', direccion: [1, 0] }])).toThrow(/nudo/);
    expect(() => menabrea(est, { EI }, [{ tipo: 'tirante', a: 'A', b: 'D', EA: 0 }])).toThrow(/EA/);
    expect(() => menabrea(est, { EI }, [{ tipo: 'fuerza', nudo: 'D', direccion: [1, 0], k: -1 }])).toThrow(/resorte/);
  });
});

describe('deformaciones iniciales, desplazamientos impuestos y cargas unidad sueltas', () => {
  it('ε0 en una barra: el extremo libre se alarga FL/EA + ε0·L, y la coenergía cuenta N·ε0 (tabla de la p. 16)', () => {
    const F = 4;
    const Lb = 3;
    const EA = 50;
    const eps0 = 2e-3;
    const est: Estructura = {
      nudos: [
        { id: 'A', x: 0, y: 0 },
        { id: 'B', x: Lb, y: 0 },
      ],
      barras: [{ id: 'AB', i: 'A', j: 'B' }],
      apoyos: [{ tipo: 'empotramiento', nudo: 'A' }],
      cargas: [{ tipo: 'nudo', nudo: 'B', Fx: F }],
    };
    const rig = { EI, EA, eps0 };
    const sol = resuelve(est);
    expect(desplazamiento(sol, rig, { tipo: 'fuerza', nudo: 'B', direccion: [1, 0] })).toBeCloseTo((F * Lb) / EA + eps0 * Lb, 12);
    const c = coenergia(sol, rig);
    expect(c.N).toBeCloseTo((F * F * Lb) / (2 * EA), 12);
    expect(c.iniciales).toBeCloseTo(F * eps0 * Lb, 12);
    expect(c.total).toBeCloseTo(c.N + c.M + c.V + c.iniciales, 12);
    expect(c.iniciales).toBeGreaterThan(0);
  });

  it('Menabrea con κ0: la apoyada-empotrada que el calor curva, X = −3EIκ0/2L, y el apoyo no se mueve', () => {
    /* A mano: la ménsula con κ0 > 0 (se curva como la biapoyada de arriba,
       que baja en el centro) levanta la punta κ0L²/2; δ11 = L³/3EI */
    const Lb = 3;
    const k0 = 1e-3;
    const est = vigaRecta({ L: Lb, apoyos: [{ x: 0, tipo: 'empotramiento' }], cargas: [] });
    const rig = { EI, kappa0: k0 };
    const m = menabrea(est, rig, [{ tipo: 'fuerza', nudo: 'n1', direccion: [0, 1] }]);
    expect(m.d0[0]).toBeCloseTo((k0 * Lb * Lb) / 2, 12);
    expect(m.X[0]).toBeCloseTo((-3 * EI * k0) / (2 * Lb), 12);
    expect(desplazamiento(m.sol, rig, { tipo: 'fuerza', nudo: 'n1', direccion: [0, 1] })).toBeCloseTo(0, 12);
  });

  it('un asiento y un giro impuestos, contra elastica.ts', () => {
    const L = 4;
    const P = 8;
    const delta = 0.02;
    const cargas = [{ tipo: 'puntual' as const, x: L / 2, P }];
    /* asiento δ hacia abajo en el apoyo de la punta: en la dirección (0, 1) de la redundante es −δ */
    const est = vigaRecta({ L, apoyos: [{ x: 0, tipo: 'empotramiento' }], cargas });
    const m = menabrea(est, { EI }, [{ tipo: 'fuerza', nudo: 'n1', direccion: [0, 1], desplazamiento: -delta }]);
    const el = resuelveElastica({
      L,
      EI,
      apoyos: [
        { x: 0, tipo: 'empotramiento' },
        { x: L, tipo: 'movil', asiento: delta },
      ],
      cargas,
    });
    expect(m.X[0]).toBeCloseTo(el.R[1], 10);
    /* giro antihorario θ impuesto al empotramiento de A: en el tema 10 es −θ */
    const th = 0.004;
    const bi = vigaRecta({
      L,
      apoyos: [
        { x: 0, tipo: 'articulado' },
        { x: L, tipo: 'movil' },
      ],
      cargas,
    });
    const g = menabrea(bi, { EI }, [{ tipo: 'par', nudo: 'n0', giro: th }]);
    const eg = resuelveElastica({
      L,
      EI,
      apoyos: [
        { x: 0, tipo: 'empotramiento', giro: -th },
        { x: L, tipo: 'movil' },
      ],
      cargas,
    });
    /* el par de energia.ts es antihorario; el de viga.ts, horario */
    expect(g.X[0]).toBeCloseTo(-eg.Mapoyo[0], 10);
    expect(desplazamiento(g.sol, { EI }, { tipo: 'par', nudo: 'n0' })).toBeCloseTo(th, 12);
  });

  it('el acercamiento de dos nudos libres es la suma de sus dos desplazamientos (superposición)', () => {
    /* B (0, 3) y D (4, 0): la recta BD va según (0,8; −0,6) */
    const sol = resuelve(portico(3, 4, [{ tipo: 'nudo', nudo: 'B', Fx: 2 }, { tipo: 'nudo', nudo: 'C', Fy: -1 }]));
    const rel = desplazamiento(sol, { EI }, { tipo: 'relativo', a: 'B', b: 'D' });
    const dB = desplazamiento(sol, { EI }, { tipo: 'fuerza', nudo: 'B', direccion: [0.8, -0.6] });
    const dD = desplazamiento(sol, { EI }, { tipo: 'fuerza', nudo: 'D', direccion: [-0.8, 0.6] });
    expect(rel).toBeCloseTo(dB + dD, 12);
    expect(Math.abs(rel)).toBeGreaterThan(1e-6);
  });

  it('el giro en un punto de una barra, contra el θ de elastica.ts', () => {
    const L = 4;
    const cargas = [{ tipo: 'puntual' as const, x: 1, P: 3 }];
    const apoyos = [
      { x: 0, tipo: 'articulado' as const },
      { x: L, tipo: 'movil' as const },
    ];
    const sol = resuelve(vigaRecta({ L, apoyos, cargas }));
    const el = resuelveElastica({ L, EI, apoyos, cargas });
    expect(desplazamiento(sol, { EI }, { tipo: 'par', barra: 'b0', s: 3 })).toBeCloseTo(-el.theta(3), 10);
  });

  it('rechaza una barra con EI no positiva y redundantes que no son independientes', () => {
    const est = portico(3, 4, [{ tipo: 'nudo', nudo: 'B', Fx: 2 }]);
    expect(() => desplazamiento(resuelve(est), { AB: { EI: 0 }, BC: { EI }, CD: { EI } }, { tipo: 'par', nudo: 'C' })).toThrow(/EI > 0/);
    expect(() =>
      menabrea(est, { EI }, [
        { tipo: 'fuerza', nudo: 'D', direccion: [1, 0] },
        { tipo: 'fuerza', nudo: 'D', direccion: [1, 0] },
      ]),
    ).toThrow(/independientes/);
  });

  it('rechaza rigideces no positivas también cuando son las mismas para todas las barras, y EA, GA o χ no positivos', () => {
    const sol = resuelve(portico(3, 4, [{ tipo: 'nudo', nudo: 'B', Fx: 2 }]));
    const u = { tipo: 'par' as const, nudo: 'C' };
    expect(() => desplazamiento(sol, { EI: 0 }, u)).toThrow(/EI > 0/);
    expect(() => desplazamiento(sol, { EI: -EI }, u)).toThrow(/EI > 0/);
    expect(() => desplazamiento(sol, { EI, EA: -1 }, u)).toThrow(/EA > 0/);
    expect(() => desplazamiento(sol, { EI, GA: 0 }, u)).toThrow(/GA > 0/);
    expect(() => desplazamiento(sol, { EI, GA: 5, chi: 0 }, u)).toThrow(/χ > 0/);
    expect(() => desplazamiento(sol, { AB: { EI }, BC: { EI, EA: -3 }, CD: { EI } }, u)).toThrow(/EA > 0/);
    expect(() => coenergia(sol, { EI: 0 })).toThrow(/EI > 0/);
    /* lo que sí vale: EA infinita es la barra inextensible */
    expect(desplazamiento(sol, { EI, EA: Infinity }, u)).toBeCloseTo(desplazamiento(sol, { EI }, u), 12);
  });
});

describe('coeficiente de cortante χ (ec. 13.37, p. 14)', () => {
  it('rectángulo 6/5 y círculo 10/9', () => {
    expect(coeficienteCortante(rectanguloMacizo(0.1, 0.3))).toBeCloseTo(6 / 5, 9);
    expect(coeficienteCortante(circular(0.2))).toBeCloseTo(10 / 9, 4);
  });
});
