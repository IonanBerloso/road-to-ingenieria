/**
 * Tema 8 de ERM: barras articuladas con sólidos rígidos y nudos
 * (`src/lib/erm/barras.ts`).
 *
 * Cada caso está resuelto a mano aquí, por un camino que el código no sigue
 * (CLAUDE.md §10): el código resuelve por desplazamientos, de una vez; a mano
 * se plantea equilibrio y luego compatibilidad, como en los apuntes.
 *
 * 1 · Isostática. Viga rígida AB de 2a articulada en A, colgada en B de una
 *     barra vertical de longitud L; P hacia abajo en el centro. ΣM_A = 0 da
 *     N = P/2 sea cual sea EA; la barra alarga NL/EA, B baja eso y la viga gira
 *     θ = −NL/(EA·2a) (horario).
 * 2 · Celosía de dos barras simétricas a α de la horizontal, P hacia abajo en
 *     el nudo: N = P/(2 sen α) y el nudo baja PL/(2EA sen²α) (ΔL = δ·sen α).
 * 3 · Térmica hiperestática. Viga rígida articulada en A = (0,0), barras
 *     verticales iguales colgadas en x = a (1) y x = 2a (2); la 2 se calienta.
 *     ΣM_A: a·N1 + 2a·N2 = 0. Compatibilidad: ΔL1 = −θa, ΔL2 = −2θa, y
 *     N_i = k(ΔL_i − ε0_i·L). Sale θ = −2αΔT·L/(5a), N1 = 2EAαΔT/5 y
 *     N2 = −EAαΔT/5. Con un error de fabricación h en la 2, lo mismo con αΔT·L
 *     cambiado por h.
 * 4 · Holgura. Viga rígida de 2a articulada en A, barra vertical en x = a y
 *     un tope bajo B (x = 2a) a una distancia ξ; P hacia abajo en B. Abierta:
 *     N = 2P y B baja 4PL/EA, así que toca cuando P = ξ·EA/(4L). Cerrada: B
 *     baja ξ, la barra alarga ξ/2, N = EAξ/(2L), y el tope empuja
 *     R = P − EAξ/(4L) (de ΣM_A).
 */
import { describe, expect, it } from 'vitest';
import { resuelveBarras, type SistemaBarras } from '../../../src/lib/erm/barras';

const a = 1.2;
const L = 2;
const EA = 1e5;
const P = 30;

function isostatica(ea: number): SistemaBarras {
  return {
    solidos: [{ id: 'AB', tipo: 'rigido', x: 0, y: 0 }],
    barras: [{ id: '1', a: { x: 2 * a, y: L }, b: { solido: 'AB', x: 2 * a, y: 0 }, EA: ea }],
    enlaces: [{ tipo: 'articulacion', solido: 'AB', x: 0, y: 0 }],
    cargas: [{ solido: 'AB', x: a, y: 0, Fy: -P }],
  };
}

describe('1 · isostática: la fuerza no depende de EA', () => {
  it('N = P/2 con dos rigideces distintas', () => {
    expect(resuelveBarras(isostatica(EA)).barras.get('1')?.N).toBeCloseTo(P / 2, 9);
    expect(resuelveBarras(isostatica(7 * EA)).barras.get('1')?.N).toBeCloseTo(P / 2, 9);
  });

  it('un par horario P·a hace en la barra lo mismo que P en el centro', () => {
    /* ΣM_A: 2a·N + M = 0 con M = −P·a → N = P/2; ΣFy: la articulación tira hacia abajo P/2 */
    const s = { ...isostatica(EA), cargas: [{ solido: 'AB', M: -P * a }] };
    const r = resuelveBarras(s);
    expect(r.barras.get('1')?.N).toBeCloseTo(P / 2, 9);
    expect(r.reacciones[0].Fy).toBeCloseTo(-P / 2, 9);
  });

  it('θ = −NL/(EA·2a) y la articulación lleva la otra mitad', () => {
    const r = resuelveBarras(isostatica(EA));
    expect(r.desplazamientos.get('AB')?.theta).toBeCloseTo(-((P / 2) * L) / (EA * 2 * a), 14);
    expect(r.reacciones[0].Fy).toBeCloseTo(P / 2, 9);
    expect(r.reacciones[0].Fx).toBeCloseTo(0, 9);
    expect(r.barras.get('1')?.alargamiento).toBeCloseTo(((P / 2) * L) / EA, 14);
  });
});

describe('2 · celosía de dos barras', () => {
  const b = 1.5;
  const c = 0.8;
  const sen = c / Math.hypot(b, c);
  const Lb = Math.hypot(b, c);
  const s: SistemaBarras = {
    solidos: [{ id: 'C', tipo: 'nudo', x: 0, y: -c }],
    barras: [
      { id: 'izq', a: { x: -b, y: 0 }, b: { solido: 'C', x: 0, y: -c }, EA, A: 2e-4 },
      { id: 'der', a: { x: b, y: 0 }, b: { solido: 'C', x: 0, y: -c }, EA },
    ],
    enlaces: [],
    cargas: [{ solido: 'C', Fy: -P }],
  };

  it('N = P/(2 sen α) en las dos, y σ = N/A donde hay A', () => {
    const r = resuelveBarras(s);
    expect(r.barras.get('izq')?.N).toBeCloseTo(P / (2 * sen), 9);
    expect(r.barras.get('der')?.N).toBeCloseTo(P / (2 * sen), 9);
    expect(r.barras.get('izq')?.sigma).toBeCloseTo(P / (2 * sen) / 2e-4, 6);
  });

  it('el nudo baja PL/(2EA sen²α) y no se mueve de lado', () => {
    const d = resuelveBarras(s).desplazamientos.get('C');
    expect(d?.v).toBeCloseTo(-(P * Lb) / (2 * EA * sen * sen), 14);
    expect(d?.u).toBeCloseTo(0, 14);
  });
});

function termica(extra: { dT?: number; alfa?: number; h?: number }): SistemaBarras {
  return {
    solidos: [{ id: 'AB', tipo: 'rigido', x: 0, y: 0 }],
    barras: [
      { id: '1', a: { x: a, y: L }, b: { solido: 'AB', x: a, y: 0 }, EA },
      { id: '2', a: { x: 2 * a, y: L }, b: { solido: 'AB', x: 2 * a, y: 0 }, EA, ...extra },
    ],
    enlaces: [{ tipo: 'articulacion', solido: 'AB', x: 0, y: 0 }],
    cargas: [],
  };
}

describe('3 · hiperestática térmica y de fabricación', () => {
  const alfa = 12e-6;
  const dT = 50;

  it('N1 = 2EAαΔT/5, N2 = −EAαΔT/5 y θ = −2αΔT·L/(5a)', () => {
    const r = resuelveBarras(termica({ alfa, dT }));
    expect(r.barras.get('1')?.N).toBeCloseTo((2 * EA * alfa * dT) / 5, 9);
    expect(r.barras.get('2')?.N).toBeCloseTo((-EA * alfa * dT) / 5, 9);
    expect(r.desplazamientos.get('AB')?.theta).toBeCloseTo((-2 * alfa * dT * L) / (5 * a), 14);
  });

  it('un error de fabricación h hace lo mismo que αΔT·L = h', () => {
    const h = alfa * dT * L;
    const r = resuelveBarras(termica({ h }));
    expect(r.barras.get('1')?.N).toBeCloseTo((2 * EA * h) / (5 * L), 9);
    expect(r.barras.get('2')?.N).toBeCloseTo((-EA * h) / (5 * L), 9);
  });

  it('la barra 2 alarga lo que dice 8.9: NL/EA + αΔT·L', () => {
    const r = resuelveBarras(termica({ alfa, dT }));
    const b2 = r.barras.get('2');
    expect(b2?.alargamiento).toBeCloseTo(((b2?.N ?? NaN) * L) / EA + alfa * dT * L, 14);
  });
});

function conTope(carga: number, xi: number): SistemaBarras {
  return {
    solidos: [{ id: 'AB', tipo: 'rigido', x: 0, y: 0 }],
    barras: [{ id: '1', a: { x: a, y: L }, b: { solido: 'AB', x: a, y: 0 }, EA }],
    enlaces: [
      { tipo: 'articulacion', solido: 'AB', x: 0, y: 0 },
      { tipo: 'contacto', solido: 'AB', x: 2 * a, y: 0, angulo: -90, holgura: xi },
    ],
    cargas: [{ solido: 'AB', x: 2 * a, y: 0, Fy: -carga }],
  };
}

describe('4 · holgura que se cierra', () => {
  const xi = 1e-3;
  const Pc = (xi * EA) / (4 * L);

  it('por debajo de P = ξEA/4L no toca: N = 2P y B baja 4PL/EA', () => {
    const r = resuelveBarras(conTope(0.9 * Pc, xi));
    expect(r.contactosCerrados).toEqual([]);
    expect(r.barras.get('1')?.N).toBeCloseTo(1.8 * Pc, 9);
    expect(r.desplazamientoDe({ solido: 'AB', x: 2 * a, y: 0 })[1]).toBeCloseTo((-4 * 0.9 * Pc * L) / EA, 14);
  });

  it('por encima toca: B baja ξ, N = EAξ/2L y el tope empuja P − EAξ/4L', () => {
    const r = resuelveBarras(conTope(3 * Pc, xi));
    expect(r.contactosCerrados).toEqual([1]);
    expect(r.desplazamientoDe({ solido: 'AB', x: 2 * a, y: 0 })[1]).toBeCloseTo(-xi, 14);
    expect(r.barras.get('1')?.N).toBeCloseTo((EA * xi) / (2 * L), 9);
    expect(r.reacciones[1].Fy).toBeCloseTo(3 * Pc - Pc, 9);
  });

  it('si los contactos siguen cambiando al agotar las iteraciones, lo dice', () => {
    /* cerrar el tope pide una segunda vuelta para ver que ya no cambia; con una sola no se sabe */
    expect(() => resuelveBarras(conTope(3 * Pc, xi), 1)).toThrow(/contactos/);
    expect(() => resuelveBarras(conTope(3 * Pc, xi), 2)).not.toThrow();
  });

  it('un resorte de rigidez k = EA/L hace lo mismo que la barra', () => {
    const s = conTope(3 * Pc, xi);
    const conResorte: SistemaBarras = { ...s, barras: [{ ...s.barras[0], EA: undefined, k: EA / L }] };
    expect(resuelveBarras(conResorte).barras.get('1')?.N).toBeCloseTo((EA * xi) / (2 * L), 9);
  });
});

describe('enlaces y mecanismos', () => {
  it('una viga rígida con solo una articulación es un mecanismo', () => {
    expect(() =>
      resuelveBarras({
        solidos: [{ id: 'AB', tipo: 'rigido', x: 0, y: 0 }],
        barras: [],
        enlaces: [{ tipo: 'articulacion', solido: 'AB', x: 0, y: 0 }],
        cargas: [{ solido: 'AB', x: 1, y: 0, Fy: -1 }],
      }),
    ).toThrow(/mecanismo/);
  });

  it('giro impedido y deslizadera: la barra vertical se lleva toda la carga', () => {
    const r = resuelveBarras({
      solidos: [{ id: 'S', tipo: 'rigido', x: 0, y: 0 }],
      barras: [{ id: 'v', a: { x: 0, y: L }, b: { solido: 'S', x: 0, y: 0 }, EA }],
      enlaces: [
        { tipo: 'giro', solido: 'S' },
        { tipo: 'deslizadera', solido: 'S', x: 0, y: 0, angulo: 0 },
      ],
      cargas: [{ solido: 'S', x: 0.7, y: 0, Fy: -P }],
    });
    expect(r.barras.get('v')?.N).toBeCloseTo(P, 9);
    /* la carga gira horario (−0,7P respecto de S); el enlace responde antihorario */
    expect(r.reacciones[0].M).toBeCloseTo(P * 0.7, 9);
    expect(r.desplazamientos.get('S')?.theta).toBeCloseTo(0, 15);
  });
});
