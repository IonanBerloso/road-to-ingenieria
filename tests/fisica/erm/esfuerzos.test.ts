/**
 * Tema 7 de ERM: reacciones y diagramas N, V, M (`src/lib/erm/estructura.ts`,
 * `esfuerzos.ts` y `vigas.ts`).
 *
 * El segundo camino de cada número (CLAUDE.md §10):
 *  · las cuatro vigas de `tests/fisica/viga.test.ts` (ejercicios 6.2, 6.5 y
 *    6.9 de la colección de Mecánica Aplicada y la ordinaria de 2024-2025) se
 *    resuelven aquí y en `viga.ts`, que es otro código con el mismo convenio:
 *    los dos tienen que dar lo mismo en cada punto (Regla 0);
 *  · el equilibrio de la estructura entera, que no pasa por los esfuerzos;
 *  · dM/ds = V y dV/ds = −q por diferencias finitas (tema 7, ecs. 7.14-7.15);
 *  · un pórtico en L resuelto a mano en este comentario.
 *
 * Pórtico en L, a mano. Columna de (0,0) a (0,h), empotrada abajo; viga de
 * (0,h) a (b,h); P hacia abajo en la punta (b,h) y H hacia la derecha en la
 * esquina. Reacciones: Rx = −H, Ry = P, M = P·b + H·h (antihorario), por
 * ΣF = 0 y ΣM_base = 0. En la viga (y local hacia abajo) M(s) = −P(b − s) y
 * V = P. En la columna (sube: y local hacia la derecha, hacia dentro del
 * pórtico) N = −P, V = H y M(s) = −P·b + H(s − h): en la base, −P·b − H·h.
 */
import { describe, expect, it } from 'vitest';
import { cortante, flector, type Viga } from '../../../src/lib/viga';
import { clasifica, resuelve, type Estructura } from '../../../src/lib/erm/estructura';
import { diagrama, esfuerzosEn, maximos, tramos } from '../../../src/lib/erm/esfuerzos';
import { desdeViga, esfuerzosViga, resuelveViga, vigaRecta } from '../../../src/lib/erm/vigas';

/* Las cuatro vigas de viga.test.ts, con los mismos números. */
const seisDos: Viga = {
  L: 12,
  xA: 0,
  xB: 12,
  cargas: [
    { tipo: 'puntual', x: 3, P: 10 },
    { tipo: 'puntual', x: 7, P: 6 },
  ],
};
const seisCinco: Viga = {
  L: 10,
  xA: 2,
  xB: 7,
  cargas: [
    { tipo: 'repartida', x1: 0, x2: 7, q1: 2000, q2: 2000 },
    { tipo: 'puntual', x: 10, P: 2000 },
  ],
};
const seisNueve: Viga = { L: 6, xA: 0, xB: 6, cargas: [{ tipo: 'repartida', x1: 3, x2: 6, q1: 0, q2: 3 }] };
const ordinaria2025: Viga = {
  L: 4,
  xA: 0,
  xB: 4,
  cargas: [
    { tipo: 'repartida', x1: 0, x2: 2, q1: 4, q2: 4 },
    { tipo: 'par', x: 3, M: -4 },
  ],
};

/* Dos decrecientes, que las cuatro de arriba no traen (viga.ts las tuvo mal
   hasta el 14 de octubre de 2026). */
const triDecreciente: Viga = { L: 6, xA: 0, xB: 6, cargas: [{ tipo: 'repartida', x1: 1, x2: 5, q1: 3, q2: 0 }] };
const trapDecreciente: Viga = { L: 8, xA: 2, xB: 8, cargas: [{ tipo: 'repartida', x1: 0, x2: 6, q1: 4, q2: 2 }] };

describe('viga.ts y este motor dicen lo mismo (Regla 0)', () => {
  const casos: [string, Viga][] = [
    ['6.2', seisDos],
    ['6.5', seisCinco],
    ['6.9', seisNueve],
    ['ordinaria 2025', ordinaria2025],
    ['triangular decreciente', triDecreciente],
    ['trapecio decreciente con voladizo', trapDecreciente],
  ];
  it.each(casos)('%s: V y M coinciden en 97 secciones', (_, v) => {
    const r = { est: desdeViga(v), sol: resuelve(desdeViga(v)) };
    for (let k = 1; k < 98; k++) {
      const x = (v.L * k) / 98 + 1e-7;
      const e = esfuerzosViga(r, x);
      expect(e.V).toBeCloseTo(cortante(v, x), 6);
      expect(e.M).toBeCloseTo(flector(v, x), 6);
      expect(e.N).toBeCloseTo(0, 9);
    }
  });

  it('6.5: 8600 y 7400 kg en los apoyos, como publica la colección', () => {
    const { reacciones } = resuelve(desdeViga(seisCinco));
    expect(reacciones[0].Ry).toBeCloseTo(8600, 6);
    expect(reacciones[1].Ry).toBeCloseTo(7400, 6);
    expect(reacciones[0].Rx).toBeCloseTo(0, 9);
  });

  it('6.5: el flector máximo, 1290 kg·m en x = 4,3 m, sale de V = 0; el mínimo, −6000 en B', () => {
    const sol = resuelve(desdeViga(seisCinco));
    const m = maximos(sol);
    expect(m.Mmax.valor).toBeCloseTo(1290, 6);
    /* barra b1 empieza en el apoyo A, x = 2 */
    expect(m.Mmax.barra).toBe('b1');
    expect(m.Mmax.s + 2).toBeCloseTo(4.3, 9);
    expect(m.Mmin.valor).toBeCloseTo(-6000, 6);
  });

  it('ordinaria 2025: el par de D hace saltar M de 5 a 1 (en MgL)', () => {
    const r = resuelveViga({
      L: 4,
      apoyos: [
        { x: 0, tipo: 'articulado' },
        { x: 4, tipo: 'movil' },
      ],
      cargas: ordinaria2025.cargas,
    });
    expect(esfuerzosViga(r, 3, 'izq').M).toBeCloseTo(5, 9);
    expect(esfuerzosViga(r, 3, 'der').M).toBeCloseTo(1, 9);
  });
});

describe('el equilibrio de la estructura entera', () => {
  it('las reacciones equilibran las cargas en fuerza y en momento (6.5 y 6.9)', () => {
    for (const v of [seisCinco, seisNueve]) {
      const est = desdeViga(v);
      const { reacciones } = resuelve(est);
      let Fy = 0;
      let M = 0;
      for (const r of reacciones) {
        const n = est.nudos.find((m) => m.id === r.apoyo.nudo);
        Fy += r.Ry;
        M += (n?.x ?? NaN) * r.Ry + r.M;
      }
      for (const c of v.cargas) {
        if (c.tipo === 'puntual') {
          Fy -= c.P;
          M -= c.x * c.P;
        } else if (c.tipo === 'repartida') {
          /* resultante y centroide del trapecio, calculados aparte */
          const R = ((c.q1 + c.q2) / 2) * (c.x2 - c.x1);
          const xg = c.x1 + ((c.x2 - c.x1) * (c.q1 + 2 * c.q2)) / (3 * (c.q1 + c.q2));
          Fy -= R;
          M -= xg * R;
        }
      }
      expect(Fy).toBeCloseTo(0, 6);
      expect(M).toBeCloseTo(0, 5);
    }
  });
});

describe('el pórtico en L, contra la solución a mano de la cabecera', () => {
  const h = 3;
  const b = 2;
  const P = 5;
  const H = 1.5;
  const portico: Estructura = {
    nudos: [
      { id: 'base', x: 0, y: 0 },
      { id: 'esquina', x: 0, y: h },
      { id: 'punta', x: b, y: h },
    ],
    barras: [
      { id: 'columna', i: 'base', j: 'esquina' },
      { id: 'viga', i: 'esquina', j: 'punta' },
    ],
    apoyos: [{ tipo: 'empotramiento', nudo: 'base' }],
    cargas: [
      { tipo: 'nudo', nudo: 'punta', Fy: -P },
      { tipo: 'nudo', nudo: 'esquina', Fx: H },
    ],
  };

  it('es isostático', () => {
    expect(clasifica(portico)).toEqual({ tipo: 'isostatica', grado: 0 });
  });

  it('reacciones: Rx = −H, Ry = P, M = P·b + H·h', () => {
    const [r] = resuelve(portico).reacciones;
    expect(r.Rx).toBeCloseTo(-H, 9);
    expect(r.Ry).toBeCloseTo(P, 9);
    expect(r.M).toBeCloseTo(P * b + H * h, 9);
  });

  it('viga: M = −P(b − s) y V = P', () => {
    const sol = resuelve(portico);
    for (const s of [0, 0.5, 1.3, 2]) {
      const e = esfuerzosEn(sol, 'viga', s, 'izq');
      expect(e.M).toBeCloseTo(-P * (b - s), 9);
      expect(e.V).toBeCloseTo(P, 9);
      expect(e.N).toBeCloseTo(0, 9);
    }
  });

  it('columna: N = −P, V = H, M = −P·b + H(s − h)', () => {
    const sol = resuelve(portico);
    for (const s of [0, 1, 2.2, 3]) {
      const e = esfuerzosEn(sol, 'columna', s, 'izq');
      expect(e.N).toBeCloseTo(-P, 9);
      expect(e.V).toBeCloseTo(H, 9);
      expect(e.M).toBeCloseTo(-P * b + H * (s - h), 9);
    }
  });

  it('en la esquina rígida el flector pasa de la columna a la viga sin saltar', () => {
    const sol = resuelve(portico);
    expect(esfuerzosEn(sol, 'columna', h, 'izq').M).toBeCloseTo(esfuerzosEn(sol, 'viga', 0, 'der').M, 9);
  });
});

describe('las rótulas y la clasificación', () => {
  /* Viga Gerber de prueba: empotrada en 0, rótula en 4, apoyo móvil en 7, y
     triangular de 0 a 6 kN/m entre 2 y 7 más 10 kN en 5,5. */
  const gerber = {
    L: 7,
    apoyos: [
      { x: 0, tipo: 'empotramiento' as const },
      { x: 7, tipo: 'movil' as const },
    ],
    rotulas: [4],
    cargas: [
      { tipo: 'repartida' as const, x1: 2, x2: 7, q1: 0, q2: 6 },
      { tipo: 'puntual' as const, x: 5.5, P: 10 },
    ],
  };

  it('la Gerber es isostática y deja M = 0 en la rótula, por los dos lados', () => {
    expect(clasifica(vigaRecta(gerber)).tipo).toBe('isostatica');
    const r = resuelveViga(gerber);
    expect(esfuerzosViga(r, 4, 'izq').M).toBeCloseTo(0, 9);
    expect(esfuerzosViga(r, 4, 'der').M).toBeCloseTo(0, 9);
  });

  it('cumple dM/dx = V y dV/dx = −q dentro de cada tramo (diferencias finitas)', () => {
    const r = resuelveViga(gerber);
    const h = 1e-5;
    const q = (x: number) => (x > 2 && x < 7 ? (6 * (x - 2)) / 5 : 0);
    for (const x of [1, 2.7, 3.9, 4.6, 5.2, 6.1, 6.9]) {
      const dM = (esfuerzosViga(r, x + h).M - esfuerzosViga(r, x - h).M) / (2 * h);
      const dV = (esfuerzosViga(r, x + h).V - esfuerzosViga(r, x - h).V) / (2 * h);
      expect(dM).toBeCloseTo(esfuerzosViga(r, x).V, 5);
      expect(dV).toBeCloseTo(-q(x), 5);
    }
  });

  it('una empotrada y apoyada es hiperestática de grado 1', () => {
    const v = vigaRecta({
      L: 5,
      apoyos: [
        { x: 0, tipo: 'empotramiento' },
        { x: 5, tipo: 'movil' },
      ],
      cargas: [{ tipo: 'puntual', x: 2, P: 1 }],
    });
    expect(clasifica(v)).toEqual({ tipo: 'hiperestatica', grado: 1 });
    expect(() => resuelve(v)).toThrow(/hiperestática de grado 1/);
  });

  it('dos carritos sin apoyo fijo son un mecanismo', () => {
    const v = vigaRecta({
      L: 5,
      apoyos: [
        { x: 0, tipo: 'movil' },
        { x: 5, tipo: 'movil' },
      ],
      cargas: [{ tipo: 'puntual', x: 2, P: 1 }],
    });
    expect(clasifica(v).tipo).toBe('mecanismo');
    expect(() => resuelve(v)).toThrow(/mecanismo/);
  });

  it('una carga o una abscisa fuera de [0, L] se dice, no se ignora', () => {
    const apoyos = [
      { x: 0, tipo: 'articulado' as const },
      { x: 4, tipo: 'movil' as const },
    ];
    expect(() => vigaRecta({ L: 4, apoyos, cargas: [{ tipo: 'puntual', x: 10, P: 1 }] })).toThrow(/fuera de la viga/);
    expect(() => vigaRecta({ L: 4, apoyos, cargas: [{ tipo: 'par', x: -1, M: 1 }] })).toThrow(/fuera de la viga/);
    expect(() =>
      vigaRecta({ L: 4, apoyos, cargas: [{ tipo: 'repartida', x1: 1, x2: 6, q1: 1, q2: 1 }] }),
    ).toThrow(/fuera de la viga/);
    const r = resuelveViga({ L: 4, apoyos, cargas: [{ tipo: 'puntual', x: 2, P: 1 }] });
    expect(() => esfuerzosViga(r, -5)).toThrow(/fuera de la viga/);
    expect(() => esfuerzosViga(r, 4.5)).toThrow(/fuera de la viga/);
  });

  it('una rótula de más convierte una isostática en mecanismo', () => {
    const v = vigaRecta({
      L: 6,
      apoyos: [
        { x: 0, tipo: 'articulado' },
        { x: 6, tipo: 'movil' },
      ],
      rotulas: [3],
      cargas: [{ tipo: 'puntual', x: 2, P: 1 }],
    });
    expect(clasifica(v).tipo).toBe('mecanismo');
  });
});

describe('direcciones de carga', () => {
  /* Una viga horizontal de 4, biapoyada, con 3 por unidad de longitud. */
  const conCarga = (direccion: 'perpendicular' | 'vertical'): Estructura => ({
    nudos: [
      { id: 'A', x: 0, y: 0 },
      { id: 'B', x: 4, y: 0 },
    ],
    barras: [{ id: 'AB', i: 'A', j: 'B' }],
    apoyos: [
      { tipo: 'articulado', nudo: 'A' },
      { tipo: 'movil', nudo: 'B' },
    ],
    cargas: [{ tipo: 'repartida', barra: 'AB', s1: 0, s2: 4, q1: 3, q2: 3, direccion }],
  });

  it('en una barra que va de izquierda a derecha, «vertical» y «perpendicular» son lo mismo: qL²/8 = 6', () => {
    for (const d of ['perpendicular', 'vertical'] as const) {
      const sol = resuelve(conCarga(d));
      expect(esfuerzosEn(sol, 'AB', 2).M).toBeCloseTo(6, 9);
    }
  });

  it('una barra inclinada con carga vertical: N y V son las proyecciones de la cortante de la viga horizontal', () => {
    /* Barra de (0,0) a (3,4) (L = 5), apoyos en los extremos (fijo abajo,
       carrito vertical arriba) y 2 por unidad de longitud de barra hacia
       abajo. Carga total 10, reacciones verticales 5 y 5. En la sección s, la
       fuerza vertical neta a la izquierda es 5 − 2s hacia arriba; proyectada:
       V = (5 − 2s)·cos α y N = −(5 − 2s)·sen α, con cos α = 3/5 y sen α = 4/5. */
    const est: Estructura = {
      nudos: [
        { id: 'A', x: 0, y: 0 },
        { id: 'B', x: 3, y: 4 },
      ],
      barras: [{ id: 'AB', i: 'A', j: 'B' }],
      apoyos: [
        { tipo: 'articulado', nudo: 'A' },
        { tipo: 'movil', nudo: 'B' },
      ],
      cargas: [{ tipo: 'repartida', barra: 'AB', s1: 0, s2: 5, q1: 2, q2: 2, direccion: 'vertical' }],
    };
    const sol = resuelve(est);
    for (const s of [0.5, 2, 4.2]) {
      const e = esfuerzosEn(sol, 'AB', s);
      expect(e.V).toBeCloseTo((5 - 2 * s) * 0.6, 9);
      expect(e.N).toBeCloseTo(-(5 - 2 * s) * 0.8, 9);
    }
  });

  it('una repartida que cambia de signo: V tiene su extremo donde q = 0', () => {
    /* q de −1 en 0 a +1 en 2, biapoyada: RA = −1/3, RB = 1/3 (momentos en A:
       ∫(x − 1)x dx = 2/3). V = −1/3 − (x²/2 − x), máxima en x = 1: 1/6. */
    const sol = resuelve(desdeViga({ L: 2, xA: 0, xB: 2, cargas: [{ tipo: 'repartida', x1: 0, x2: 2, q1: -1, q2: 1 }] }));
    const m = maximos(sol);
    expect(m.Vmax.valor).toBeCloseTo(1 / 6, 12);
    expect(m.Vmax.s).toBeCloseTo(1, 12);
  });
});

describe('tramos, máximos y diagrama', () => {
  it('6.9: el tramo con carga triangular tiene su V = 0 en 0,7041·L, con M = 0,026503·q0·L²', () => {
    const sol = resuelve(desdeViga(seisNueve));
    const conCero = tramos(sol).filter((t) => t.ceros.length > 0);
    expect(conCero).toHaveLength(1);
    expect(conCero[0].ceros[0].s / 6).toBeCloseTo(0.7041, 4);
    expect(conCero[0].ceros[0].M / (3 * 36)).toBeCloseTo(0.026503, 6);
  });

  it('un tramo con V ≡ 0 no tiene ceros aislados: voladizo con P en el centro', () => {
    /* empotrado en 0, L = 6, P = 4 en x = 3: de 3 a 6 no queda nada a la
       derecha, V = 0 y M = 0; de 0 a 3, V = 4 y M = −4(3 − x), −12 en el empotramiento */
    const r = resuelveViga({ L: 6, apoyos: [{ x: 0, tipo: 'empotramiento' }], cargas: [{ tipo: 'puntual', x: 3, P: 4 }] });
    const t = tramos(r.sol);
    expect(t.map((x) => [x.s0, x.s1])).toEqual([
      [0, 3],
      [3, 6],
    ]);
    for (const x of t) expect(x.ceros).toEqual([]);
    expect(maximos(r.sol).Mmin.valor).toBeCloseTo(-12, 9);
  });

  it('dos pares iguales y opuestos en una biapoyada: V ≡ 0, M constante entre ellos y sin ceros', () => {
    /* ΣM = 5 − 5 = 0: las reacciones son nulas, V = 0 en toda la viga y M = 5 entre x = 2 y x = 4 */
    const r = resuelveViga({
      L: 6,
      apoyos: [
        { x: 0, tipo: 'articulado' },
        { x: 6, tipo: 'movil' },
      ],
      cargas: [
        { tipo: 'par', x: 2, M: 5 },
        { tipo: 'par', x: 4, M: -5 },
      ],
    });
    const t = tramos(r.sol);
    expect(t).toHaveLength(3);
    for (const x of t) expect(x.ceros).toEqual([]);
    expect(t[1].inicio.M).toBeCloseTo(5, 9);
    expect(t[1].fin.M).toBeCloseTo(5, 9);
  });

  it('6.2: los tramos dan los valores de los bordes, con el salto de 10 en la carga', () => {
    const t = tramos(resuelve(desdeViga(seisDos)));
    expect(t.map((x) => [x.s0, x.s1])).toEqual([
      [0, 3],
      [3, 7],
      [7, 12],
    ]);
    expect(t[0].fin.V).toBeCloseTo(10, 9);
    expect(t[1].inicio.V).toBeCloseTo(0, 9);
    expect(t[1].inicio.M).toBeCloseTo(30, 9);
  });

  it('el diagrama repite cada punto singular con el valor de cada lado, izquierdo primero', () => {
    const sol = resuelve(desdeViga(seisDos));
    const pts = diagrama(sol, 'b0', 24);
    const en3 = pts.filter((p) => Math.abs(p.s - 3) < 1e-12);
    expect(en3.map((p) => p.V)).toEqual([expect.closeTo(10, 9), expect.closeTo(0, 9)]);
    for (let k = 1; k < pts.length; k++) expect(pts[k].s).toBeGreaterThanOrEqual(pts[k - 1].s);
    for (const p of pts) expect(Number.isFinite(p.M)).toBe(true);
  });
});
