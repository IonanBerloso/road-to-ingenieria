/**
 * Temas 12 y 13: barras quebradas en el espacio (`src/lib/erm/espacial.ts`).
 *
 * El segundo camino de cada número (CLAUDE.md §10):
 *  · la barra en L con su fórmula cerrada, escrita a mano en el comentario
 *    (flexión de los dos tramos y torsión del primero);
 *  · las barras planas contra `energia.ts` y `estructura.ts`, que son otro
 *    motor (el del tema 7): el desplazamiento y el signo de Mz;
 *  · Engesser-Castigliano sin fuerza unitaria: la derivada numérica de la
 *    coenergía respecto de la carga o de una carga ficticia (ec. 13.14);
 *  · el hiperestático, contra la fórmula X = −δ0/δ11 a mano y el tirante
 *    contra el resorte equivalente.
 */
import { describe, expect, it } from 'vitest';
import { desplazamiento } from '../../../src/lib/erm/energia';
import {
  coenergia3,
  desplazamiento3,
  esfuerzos3,
  menabrea3,
  reaccionEmpotramiento,
  resultanteEn,
  type Arbol,
  type Carga3,
} from '../../../src/lib/erm/espacial';
import { resuelve, type Estructura } from '../../../src/lib/erm/estructura';
import { esfuerzosEn } from '../../../src/lib/erm/esfuerzos';

const EI = 7;
const GIt = 3;
const a = 2;
const b = 1.5;

/** A empotrado en el origen, AB según +X (a), BC según +Y (b). */
function enL(cargas: readonly Carga3[], rig = { EI, GIt }): Arbol {
  return {
    nudos: [
      { id: 'A', p: [0, 0, 0] },
      { id: 'B', p: [a, 0, 0] },
      { id: 'C', p: [a, b, 0] },
    ],
    barras: [
      { id: 'AB', i: 'A', j: 'B', rig },
      { id: 'BC', i: 'B', j: 'C', rig },
    ],
    empotramiento: 'A',
    cargas,
  };
}

describe('la barra en L con P vertical en C', () => {
  const P = 4;
  const L = enL([{ tipo: 'nudo', nudo: 'C', F: [0, 0, -P] }]);

  it('esfuerzos: Mt = −Pb en AB, Mt = 0 en BC, flectores P(a − s) y P(b − s)', () => {
    /* en AB, r = (a − s, b, 0) y r × (0, 0, −P) = (−Pb, P(a − s), 0) */
    const e = esfuerzos3(L, 'AB', 0.5);
    expect(e.Mt).toBeCloseTo(-P * b, 12);
    expect(e.Mf[1]).toBeCloseTo(P * (a - 0.5), 12);
    expect(e.N).toBeCloseTo(0, 12);
    expect(e.T[2]).toBeCloseTo(-P, 12);
    const f = esfuerzos3(L, 'BC', 0.5);
    expect(f.Mt).toBeCloseTo(0, 12);
    expect(f.Mf[0]).toBeCloseTo(-P * (b - 0.5), 12);
  });

  it('δC = Pb³/3EI + Pa³/3EI + Pb²a/GIt, y lo mismo por ∂C/∂P', () => {
    const d = desplazamiento3(L, { tipo: 'fuerza', nudo: 'C', direccion: [0, 0, -1] });
    const mano = (P * b ** 3) / (3 * EI) + (P * a ** 3) / (3 * EI) + (P * b * b * a) / GIt;
    expect(d).toBeCloseTo(mano, 10);
    const C = (h: number) => coenergia3(enL([{ tipo: 'nudo', nudo: 'C', F: [0, 0, -(P + h)] }])).total;
    expect((C(1e-3) - C(-1e-3)) / 2e-3).toBeCloseTo(mano, 8);
    const c = coenergia3(L);
    expect(c.Mt).toBeCloseTo((P * P * b * b * a) / (2 * GIt), 10);
  });

  it('giro de B alrededor de X (la torsión de AB) y carga ficticia en C según X', () => {
    expect(desplazamiento3(L, { tipo: 'momento', nudo: 'B', direccion: [1, 0, 0] })).toBeCloseTo((-P * b * a) / GIt, 10);
    /* C según X: la barra solo trabaja en Z, así que es 0; por ∂C/∂Q también */
    expect(desplazamiento3(L, { tipo: 'fuerza', nudo: 'C', direccion: [1, 0, 0] })).toBeCloseTo(0, 12);
    const C = (Q: number) =>
      coenergia3(
        enL([
          { tipo: 'nudo', nudo: 'C', F: [0, 0, -P] },
          { tipo: 'nudo', nudo: 'C', F: [Q, 0, 0] },
        ]),
      ).total;
    expect((C(1e-3) - C(-1e-3)) / 2e-3).toBeCloseTo(0, 9);
  });

  it('reacción del empotramiento: F = (0, 0, P) y M = (Pb, −Pa, 0)', () => {
    const r = reaccionEmpotramiento(L);
    expect(r.F[2]).toBeCloseTo(P, 12);
    expect(r.M[0]).toBeCloseTo(P * b, 12);
    expect(r.M[1]).toBeCloseTo(-P * a, 12);
    /* la sección de A del lado de la barra: lo que A recibe es lo contrario */
    const s = resultanteEn(L, 'AB', 0);
    expect(s.M[0]).toBeCloseTo(-r.M[0], 12);
  });

  it('repartida q en BC: δC = qb⁴/8EI + qba³/3EI + qb³a/2GIt', () => {
    const q = 3;
    const R = enL([{ tipo: 'repartida', barra: 'BC', w: [0, 0, -q] }]);
    const d = desplazamiento3(R, { tipo: 'fuerza', nudo: 'C', direccion: [0, 0, -1] });
    expect(d).toBeCloseTo((q * b ** 4) / (8 * EI) + (q * b * a ** 3) / (3 * EI) + (q * b ** 3 * a) / (2 * GIt), 10);
  });
});

describe('barras planas: lo mismo que energia.ts (tema 7)', () => {
  it('ménsula en L en el plano XY: desplazamientos y el signo de Mz con ejeZ', () => {
    const H = 3;
    const Lv = 2;
    const P = 5;
    /* columna A(0,0) → B(0,H), viga B → C(Lv,H), P hacia −Y en C */
    const plano: Estructura = {
      nudos: [
        { id: 'A', x: 0, y: 0 },
        { id: 'B', x: 0, y: H },
        { id: 'C', x: Lv, y: H },
      ],
      barras: [
        { id: 'AB', i: 'A', j: 'B' },
        { id: 'BC', i: 'B', j: 'C' },
      ],
      apoyos: [{ tipo: 'empotramiento', nudo: 'A' }],
      cargas: [{ tipo: 'nudo', nudo: 'C', Fy: -P }],
    };
    const sol = resuelve(plano);
    /* en el plano XY la y local de estructura.ts es x girada 90° horaria y z = x × y = −Z */
    const arbol: Arbol = {
      nudos: [
        { id: 'A', p: [0, 0, 0] },
        { id: 'B', p: [0, H, 0] },
        { id: 'C', p: [Lv, H, 0] },
      ],
      barras: [
        { id: 'AB', i: 'A', j: 'B', rig: { EIy: 99, EIz: EI, ejeZ: [0, 0, -1] } },
        { id: 'BC', i: 'B', j: 'C', rig: { EIy: 99, EIz: EI, ejeZ: [0, 0, -1] } },
      ],
      empotramiento: 'A',
      cargas: [{ tipo: 'nudo', nudo: 'C', F: [0, -P, 0] }],
    };
    for (const [id, s] of [
      ['AB', 0],
      ['AB', 1.7],
      ['BC', 0.4],
      ['BC', 1.9],
    ] as const) {
      const e3 = esfuerzos3(arbol, id, s);
      const e2 = esfuerzosEn(sol, id, s);
      expect(e3.Mz).toBeCloseTo(e2.M, 10);
      expect(e3.N).toBeCloseTo(e2.N, 10);
      expect(e3.Ty).toBeCloseTo(e2.V, 10);
      expect(e3.My).toBeCloseTo(0, 12);
    }
    for (const dir of [
      [0, -1],
      [1, 0],
    ] as const) {
      const d2 = desplazamiento(sol, { EI }, { tipo: 'fuerza', nudo: 'C', direccion: dir });
      const d3 = desplazamiento3(arbol, { tipo: 'fuerza', nudo: 'C', direccion: [dir[0], dir[1], 0] });
      expect(d3).toBeCloseTo(d2, 10);
    }
    /* a mano: δC vertical = PLv³/3EI + PLv²H/EI */
    expect(desplazamiento3(arbol, { tipo: 'fuerza', nudo: 'C', direccion: [0, -1, 0] })).toBeCloseTo(
      (P * Lv ** 3) / (3 * EI) + (P * Lv * Lv * H) / EI,
      10,
    );
  });

  it('ménsula recta con axil y cortante: PL/EA y PL³/3EI + χPL/GA', () => {
    const L = 3;
    const arbol = (F: [number, number, number]): Arbol => ({
      nudos: [
        { id: 'A', p: [0, 0, 0] },
        { id: 'B', p: [L, 0, 0] },
      ],
      barras: [{ id: 'AB', i: 'A', j: 'B', rig: { EI, EA: 50, GA: 20 } }],
      empotramiento: 'A',
      cargas: [{ tipo: 'nudo', nudo: 'B', F }],
    });
    expect(desplazamiento3(arbol([2, 0, 0]), { tipo: 'fuerza', nudo: 'B', direccion: [1, 0, 0] })).toBeCloseTo((2 * L) / 50, 12);
    expect(desplazamiento3(arbol([0, 0, -2]), { tipo: 'fuerza', nudo: 'B', direccion: [0, 0, -1] })).toBeCloseTo(
      (2 * L ** 3) / (3 * EI) + (1.2 * 2 * L) / 20,
      10,
    );
  });
});

describe('hiperestático (Menabrea, ecs. 13.51 y 13.53)', () => {
  const P = 4;

  it('la L con P en B y un apoyo vertical en C: X = (Pa³/3EI)/δCC', () => {
    const base = enL([{ tipo: 'nudo', nudo: 'B', F: [0, 0, -P] }]);
    const m = menabrea3(base, [{ tipo: 'fuerza', nudo: 'C', direccion: [0, 0, 1] }]);
    const dCC = a ** 3 / (3 * EI) + b ** 3 / (3 * EI) + (b * b * a) / GIt;
    expect(m.d0[0]).toBeCloseTo((-P * a ** 3) / (3 * EI), 10);
    expect(m.d[0][0]).toBeCloseTo(dCC, 10);
    expect(m.X[0]).toBeCloseTo((P * a ** 3) / (3 * EI) / dCC, 10);
    expect(desplazamiento3(m.final, { tipo: 'fuerza', nudo: 'C', direccion: [0, 0, 1] })).toBeCloseTo(0, 10);
  });

  it('un tirante de C a un punto fijo encima es un resorte k = EA/h', () => {
    const base = enL([{ tipo: 'nudo', nudo: 'B', F: [0, 0, -P] }]);
    const h = 2.5;
    const EA = 40;
    const t = menabrea3(base, [{ tipo: 'tirante', a: 'C', punto: [a, b, h], EA }]);
    const k = menabrea3(base, [{ tipo: 'fuerza', nudo: 'C', direccion: [0, 0, 1], k: EA / h }]);
    expect(t.X[0]).toBeCloseTo(k.X[0], 10);
    expect(t.X[0]).toBeGreaterThan(0);
  });

  it('«F para que C no se mueva» con un par M0 en B: dos incógnitas a la vez', () => {
    const M0 = 3;
    const base = enL([{ tipo: 'nudo', nudo: 'B', M: [M0, 0, 0] }]);
    const m = menabrea3(base, [
      { tipo: 'fuerza', nudo: 'C', direccion: [0, 0, 1] },
      { tipo: 'momento', nudo: 'C', direccion: [0, 1, 0] },
    ]);
    expect(desplazamiento3(m.final, { tipo: 'fuerza', nudo: 'C', direccion: [0, 0, 1] })).toBeCloseTo(0, 10);
    expect(desplazamiento3(m.final, { tipo: 'momento', nudo: 'C', direccion: [0, 1, 0] })).toBeCloseTo(0, 10);
    expect(m.d[0][1]).toBeCloseTo(m.d[1][0], 12);
  });

  it('rechaza ciclos, nudos sueltos, ejes z según la barra y redundantes vacías', () => {
    const base = enL([]);
    expect(() => desplazamiento3({ ...base, barras: [...base.barras, { id: 'CA', i: 'C', j: 'A', rig: { EI } }] }, { tipo: 'fuerza', nudo: 'C', direccion: [0, 0, 1] })).toThrow(/tantas como nudos/);
    expect(() =>
      desplazamiento3(
        { ...base, nudos: [...base.nudos, { id: 'D', p: [9, 9, 9] }], barras: [base.barras[0], { id: 'BD', i: 'B', j: 'D', rig: { EI } }, { id: 'BB', i: 'B', j: 'A', rig: { EI } }] },
        { tipo: 'fuerza', nudo: 'C', direccion: [0, 0, 1] },
      ),
    ).toThrow(/ciclo|unidos/);
    const malZ: Arbol = { ...base, barras: base.barras.map((x) => ({ ...x, rig: { EIy: 1, EIz: 2, ejeZ: [1, 0, 0] as const } })) };
    expect(() => esfuerzos3(malZ, 'AB', 0.5)).toThrow(/eje z/);
    const sinZ: Arbol = { ...base, cargas: [{ tipo: 'nudo', nudo: 'C', F: [0, 0, 1] }], barras: base.barras.map((x) => ({ ...x, rig: { EIy: 1, EIz: 2 } })) };
    expect(() => desplazamiento3(sinZ, { tipo: 'fuerza', nudo: 'C', direccion: [0, 0, 1] })).toThrow(/ejeZ/);
    expect(() => menabrea3(base, [])).toThrow();
    expect(() => desplazamiento3(base, { tipo: 'fuerza', nudo: 'Z', direccion: [0, 0, 1] })).toThrow(/No existe el nudo/);
  });

  it('rechaza nudos sueltos, nombres repetidos, barras imposibles, cargas a nudos que no existen y redundantes mal dadas', () => {
    const base = enL([{ tipo: 'nudo', nudo: 'C', F: [0, 0, -1] }]);
    const u = { tipo: 'fuerza' as const, nudo: 'C', direccion: [0, 0, 1] as [number, number, number] };
    /* C y D unidos entre sí dos veces, pero no al empotramiento */
    const suelto: Arbol = {
      ...base,
      nudos: [...base.nudos, { id: 'D', p: [5, 5, 5] }],
      barras: [base.barras[0], { id: 'CD', i: 'C', j: 'D', rig: { EI } }, { id: 'DC', i: 'D', j: 'C', rig: { EI } }],
    };
    expect(() => desplazamiento3(suelto, u)).toThrow(/unidos/);
    expect(() => desplazamiento3({ ...base, nudos: [...base.nudos, { id: 'B', p: [9, 9, 9] }], barras: [...base.barras, { id: 'BX', i: 'B', j: 'C', rig: { EI } }] }, u)).toThrow(
      /mismo nombre/,
    );
    expect(() => desplazamiento3({ ...base, empotramiento: 'Z' }, u)).toThrow(/nudo empotrado/);
    expect(() => desplazamiento3({ ...base, barras: [base.barras[0], { id: 'BZ', i: 'B', j: 'Z', rig: { EI } }] }, u)).toThrow(/no existen/);
    expect(() => desplazamiento3({ ...base, nudos: [base.nudos[0], { id: 'B', p: [0, 0, 0] }, base.nudos[2]] }, u)).toThrow(/longitud nula/);
    expect(() => esfuerzos3(base, 'ZZ', 0)).toThrow(/No existe la barra/);
    expect(() => esfuerzos3({ ...base, cargas: [{ tipo: 'nudo', nudo: 'Z', F: [1, 0, 0] }] }, 'AB', 0.5)).toThrow(/carga va a un nudo/);
    expect(() => desplazamiento3(enL(base.cargas, { EI: 0, GIt }), u)).toThrow(/EI > 0/);
    expect(() => menabrea3(base, [{ tipo: 'tirante', a: 'C', punto: [a, b, 2], EA: 0 }])).toThrow(/EA/);
    expect(() => menabrea3(base, [{ tipo: 'fuerza', nudo: 'C', direccion: [0, 0, 1], k: -1 }])).toThrow(/resorte/);
    expect(() => menabrea3(base, [{ tipo: 'tirante', a: 'C', EA: 1 }])).toThrow(/ancla/);
    expect(() => menabrea3(base, [u, u])).toThrow(/independientes/);
  });
});

describe('más casos: barras al revés, dos inercias, repartidas, relativos, tirantes calientes y desplazamientos impuestos', () => {
  const P = 4;

  it('una barra escrita del extremo libre al empotramiento da los mismos N y Mt', () => {
    /* en C: P según +Y (axil de BC) y un par T según +Y (torsor de BC) */
    const T = 1.5;
    const cargas: Carga3[] = [{ tipo: 'nudo', nudo: 'C', F: [0, P, 0], M: [0, T, 0] }];
    const recto = enL(cargas);
    const reves: Arbol = { ...recto, barras: [recto.barras[0], { id: 'BC', i: 'C', j: 'B', rig: { EI, GIt } }] };
    const e1 = esfuerzos3(recto, 'BC', 0.5);
    const e2 = esfuerzos3(reves, 'BC', b - 0.5);
    expect(e1.N).toBeCloseTo(P, 12);
    expect(e1.Mt).toBeCloseTo(T, 12);
    expect(e2.N).toBeCloseTo(e1.N, 12);
    expect(e2.Mt).toBeCloseTo(e1.Mt, 12);
    expect(desplazamiento3(reves, { tipo: 'momento', nudo: 'C', direccion: [0, 1, 0] })).toBeCloseTo(
      desplazamiento3(recto, { tipo: 'momento', nudo: 'C', direccion: [0, 1, 0] }),
      12,
    );
  });

  it('ménsula con EIy ≠ EIz: PL³/3EIz en el plano de y y PL³/3EIy en el de z', () => {
    const L = 2;
    const EIy = 2;
    const EIz = 5;
    /* x = +X, ejeZ = +Z, y = z × x = +Y: la fuerza según Y flecta con Mz (EIz) y la de Z con My (EIy) */
    const arbol: Arbol = {
      nudos: [
        { id: 'A', p: [0, 0, 0] },
        { id: 'B', p: [L, 0, 0] },
      ],
      barras: [{ id: 'AB', i: 'A', j: 'B', rig: { EIy, EIz, ejeZ: [0, 0, 1] } }],
      empotramiento: 'A',
      cargas: [{ tipo: 'nudo', nudo: 'B', F: [0, 3, -2] }],
    };
    expect(desplazamiento3(arbol, { tipo: 'fuerza', nudo: 'B', direccion: [0, 1, 0] })).toBeCloseTo((3 * L ** 3) / (3 * EIz), 12);
    expect(desplazamiento3(arbol, { tipo: 'fuerza', nudo: 'B', direccion: [0, 0, -1] })).toBeCloseTo((2 * L ** 3) / (3 * EIy), 12);
  });

  it('una repartida en AB no llega a BC, y la reacción de la repartida en BC: F = (0, 0, qb), M = (qb²/2, −qab, 0)', () => {
    const q = 3;
    const enAB = enL([{ tipo: 'repartida', barra: 'AB', w: [0, 0, -q] }]);
    const e = esfuerzos3(enAB, 'BC', 0.7);
    expect(e.N).toBeCloseTo(0, 12);
    expect(e.Mt).toBeCloseTo(0, 12);
    expect(e.Mf[0]).toBeCloseTo(0, 12);
    expect(e.Mf[2]).toBeCloseTo(0, 12);
    const r = reaccionEmpotramiento(enL([{ tipo: 'repartida', barra: 'BC', w: [0, 0, -q] }]));
    expect(r.F[2]).toBeCloseTo(q * b, 12);
    expect(r.M[0]).toBeCloseTo((q * b * b) / 2, 12);
    expect(r.M[1]).toBeCloseTo(-q * a * b, 12);
  });

  it('el acercamiento de dos nudos libres es la suma de sus dos desplazamientos (superposición)', () => {
    const h = 1.2;
    const arbol: Arbol = {
      nudos: [
        { id: 'A', p: [0, 0, 0] },
        { id: 'B', p: [a, 0, 0] },
        { id: 'C', p: [a, b, 0] },
        { id: 'D', p: [a, b, h] },
      ],
      barras: [
        { id: 'AB', i: 'A', j: 'B', rig: { EI, GIt } },
        { id: 'BC', i: 'B', j: 'C', rig: { EI, GIt } },
        { id: 'CD', i: 'C', j: 'D', rig: { EI, GIt } },
      ],
      empotramiento: 'A',
      cargas: [
        { tipo: 'nudo', nudo: 'D', F: [1, -2, 0.5] },
        { tipo: 'nudo', nudo: 'C', F: [0, 0, -1] },
      ],
    };
    const n = Math.hypot(b, h);
    const e: [number, number, number] = [0, b / n, h / n];
    const rel = desplazamiento3(arbol, { tipo: 'relativo', a: 'B', b: 'D' });
    const dB = desplazamiento3(arbol, { tipo: 'fuerza', nudo: 'B', direccion: e });
    const dD = desplazamiento3(arbol, { tipo: 'fuerza', nudo: 'D', direccion: [-e[0], -e[1], -e[2]] });
    expect(rel).toBeCloseTo(dB + dD, 12);
    expect(Math.abs(rel)).toBeGreaterThan(1e-6);
  });

  it('tirante que se calienta: X = −(δ0 + ε0·L)/(δ11 + L/EA), y un desplazamiento impuesto se cumple', () => {
    const base = enL([{ tipo: 'nudo', nudo: 'B', F: [0, 0, -P] }]);
    const h = 2.5;
    const EA = 40;
    const eps0 = 1e-3;
    const t = menabrea3(base, [{ tipo: 'tirante', a: 'C', punto: [a, b, h], EA, eps0 }]);
    expect(t.X[0]).toBeCloseTo(-(t.d0[0] + eps0 * h) / (t.d[0][0] + h / EA), 12);
    const sinCalor = menabrea3(base, [{ tipo: 'tirante', a: 'C', punto: [a, b, h], EA }]);
    expect(t.X[0]).toBeLessThan(sinCalor.X[0]);
    /* C sube 0,01 impuesto: la estructura final lo cumple */
    const imp = menabrea3(base, [{ tipo: 'fuerza', nudo: 'C', direccion: [0, 0, 1], impuesto: 0.01 }]);
    expect(desplazamiento3(imp.final, { tipo: 'fuerza', nudo: 'C', direccion: [0, 0, 1] })).toBeCloseTo(0.01, 12);
  });
});
