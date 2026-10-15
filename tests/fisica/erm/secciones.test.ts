/**
 * Secciones (`src/lib/erm/secciones.ts`), que comparten los temas 9, 10, 12
 * y 14.
 *
 * El segundo camino de cada número (CLAUDE.md §10):
 *  · cada rectángulo se integra también como polígono, por el teorema de
 *    Green sobre el contorno, que no pasa por bh³/12 ni por Steiner;
 *  · el tubo, contra π(D⁴ − d⁴)/64 (tema 12, p. 7) y π(D² − d²)/4;
 *  · las tres secciones de los parciales 1 de 2013-2014 (la L), 2014-2015 (la
 *    U invertida) y 2015-2016 (la U de alas desiguales), contra los números
 *    que sacaron y revisaron p6d, p6c y p6b, cada una con su malla;
 *  · los ejes principales: en ellos el producto de inercia es nulo, y la
 *    inercia girada no pasa nunca de Imax ni baja de Imin (un barrido);
 *  · el momento estático y el ancho de una fibra, contra una malla de celdas
 *    y, en el círculo, contra ⅔(R² − y²)^(3/2) (tema 9, p. 18).
 */
import { describe, expect, it } from 'vitest';
import {
  anchoEnFibra,
  circular,
  inerciaGirada,
  integrales,
  integralesParte,
  momentoEstatico,
  parte,
  poligono,
  principales,
  propiedades,
  radioDeGiro,
  rectanguloMacizo,
  steiner,
  steinerProducto,
  type Seccion,
} from '../../../src/lib/erm/secciones';

/** Integración en una malla de celdas cuadradas de lado h, para rectángulos [y0, y1, z0, z1]. */
function malla(rects: number[][], h: number) {
  const celdas: [number, number][] = [];
  for (const [y0, y1, z0, z1] of rects) {
    const ny = Math.round((y1 - y0) / h);
    const nz = Math.round((z1 - z0) / h);
    for (let i = 0; i < ny; i++) for (let j = 0; j < nz; j++) celdas.push([y0 + (i + 0.5) * h, z0 + (j + 0.5) * h]);
  }
  const dA = h * h;
  const A = celdas.length * dA;
  const yG = celdas.reduce((s, c) => s + c[0], 0) * (dA / A);
  const zG = celdas.reduce((s, c) => s + c[1], 0) * (dA / A);
  /* el punto medio pierde h²/12 por celda en Iz e Iy: se devuelve sumado */
  const corr = (A * h * h) / 12;
  const Iz = celdas.reduce((s, c) => s + (c[0] - yG) ** 2, 0) * dA + corr;
  const Iy = celdas.reduce((s, c) => s + (c[1] - zG) ** 2, 0) * dA + corr;
  const Iyz = celdas.reduce((s, c) => s + (c[0] - yG) * (c[1] - zG), 0) * dA;
  return { A, yG, zG, Iz, Iy, Iyz, celdas, dA };
}

const deRects = (rects: number[][]): Seccion => rects.map(([y0, y1, z0, z1]) => ({ tipo: 'rectangulo', y0, y1, z0, z1 }));

/* p6d: la L de 10t × 15t, espesor t (t = 1); ala vertical a la izquierda. */
const L1314 = [
  [0, 15, 0, 1],
  [0, 1, 1, 10],
];
/* p6c: la U invertida de 12t × 15t por fuera. */
const U1415 = [
  [0, 1, 0, 12],
  [1, 15, 0, 1],
  [1, 15, 11, 12],
];
/* p6b: la U de alas desiguales: ala de 10t arriba, alma de 20t, ala de 20t abajo. */
const U1516 = [
  [0, 1, 0, 10],
  [1, 21, 0, 1],
  [21, 22, 0, 20],
];

describe('rectángulos, polígonos, círculos y Steiner', () => {
  it('Steiner: I + A·d², y el producto con las dos distancias', () => {
    expect(steiner(10, 4, 3)).toBe(46);
    expect(steinerProducto(1, 4, 2, -3)).toBe(-23);
  });

  it('un rectángulo b × h: A = bh, G en el centro, Iz = bh³/12, Iy = hb³/12, Iyz = 0', () => {
    const p = propiedades(rectanguloMacizo(30, 80));
    expect(p.A).toBe(2400);
    expect(p.yG).toBe(40);
    expect(p.zG).toBe(15);
    expect(p.Iz).toBeCloseTo((30 * 80 ** 3) / 12, 6);
    expect(p.Iy).toBeCloseTo((80 * 30 ** 3) / 12, 6);
    expect(p.Iyz).toBeCloseTo(0, 6);
  });

  it('el mismo rectángulo como polígono (Green), en los dos sentidos de recorrido', () => {
    const r = propiedades([{ tipo: 'rectangulo', y0: 2, y1: 7, z0: -1, z1: 3 }]);
    const pts: [number, number][] = [
      [2, -1],
      [2, 3],
      [7, 3],
      [7, -1],
    ];
    for (const sentido of [pts, [...pts].reverse()]) {
      const g = propiedades([{ tipo: 'poligono', puntos: sentido }]);
      for (const k of ['A', 'yG', 'zG', 'Iz', 'Iy', 'Iyz'] as const) expect(g[k]).toBeCloseTo(r[k], 10);
    }
  });

  it('un triángulo rectángulo de catetos b y h: Iz = bh³/36 e Iyz = +b²h²/72 con el ángulo recto abajo a la izquierda (y hacia abajo)', () => {
    /* Vértices [y, z]: ángulo recto en (h, 0), cateto horizontal hasta (h, b), vértice arriba en (0, 0). */
    const b = 6;
    const h = 9;
    const p = propiedades([
      {
        tipo: 'poligono',
        puntos: [
          [h, 0],
          [h, b],
          [0, 0],
        ],
      },
    ]);
    expect(p.A).toBeCloseTo((b * h) / 2, 12);
    expect(p.yG).toBeCloseTo((2 * h) / 3, 12);
    expect(p.zG).toBeCloseTo(b / 3, 12);
    expect(p.Iz).toBeCloseTo((b * h ** 3) / 36, 10);
    expect(p.Iy).toBeCloseTo((h * b ** 3) / 36, 10);
    /* Con y hacia abajo, la masa va hacia +z abajo (y > 0): Iyz = +b²h²/72. */
    expect(p.Iyz).toBeCloseTo((b * b * h * h) / 72, 10);
    expect(poligono([[h, 0], [h, b], [0, 0]]).A).toBeCloseTo(27, 12);
  });

  it('el tubo de D = 50 y d = 40: A = π(D² − d²)/4 e Iz = Iy = π(D⁴ − d⁴)/64', () => {
    const p = propiedades(circular(50, 40));
    expect(p.A).toBeCloseTo((Math.PI * (50 ** 2 - 40 ** 2)) / 4, 8);
    expect(p.Iz).toBeCloseTo((Math.PI * (50 ** 4 - 40 ** 4)) / 64, 6);
    expect(p.Iy).toBeCloseTo(p.Iz, 6);
    expect(p.Iyz).toBeCloseTo(0, 8);
    expect(radioDeGiro(p.Iz, p.A)).toBeCloseTo(Math.sqrt((50 ** 2 + 40 ** 2) / 16), 10);
  });

  it('un círculo desplazado: Steiner con las dos coordenadas', () => {
    const p = propiedades([
      { tipo: 'rectangulo', y0: -10, y1: 10, z0: -10, z1: 10 },
      { tipo: 'circulo', y: 3, z: -4, R: 2, hueco: true },
    ]);
    const Ac = 4 * Math.PI;
    const A = 400 - Ac;
    expect(p.A).toBeCloseTo(A, 10);
    expect(p.yG).toBeCloseTo((-Ac * 3) / A, 10);
    expect(p.zG).toBeCloseTo((Ac * 4) / A, 10);
    /* Iz respecto del origen y luego a G */
    const IzO = 20 ** 4 / 12 - (Math.PI * 16) / 4 - Ac * 9;
    expect(p.Iz).toBeCloseTo(IzO - A * p.yG ** 2, 8);
    const IyzO = -Ac * 3 * -4;
    expect(p.Iyz).toBeCloseTo(IyzO - A * p.yG * p.zG, 8);
  });

  it('un hueco mayor que la pieza no es una sección', () => {
    expect(() => propiedades(circular(10, 12))).toThrow(/área nula/);
    expect(() => propiedades([{ tipo: 'rectangulo', y0: 0, y1: 0, z0: 0, z1: 1 }])).toThrow(/lado nulo/);
    expect(() => propiedades([{ tipo: 'circulo', y: 0, z: 0, R: 0 }])).toThrow(/radio/);
    expect(() => propiedades([{ tipo: 'poligono', puntos: [[0, 0], [1, 1]] }])).toThrow(/tres vértices/);
  });
});

describe('las secciones de los parciales 1 (p6b, p6c, p6d), con su malla', () => {
  it('la L de 2013-2014: A = 24t², G a 4,875t de arriba y 2,375t de la izquierda; Iz = 557,625, Iy = 202,625, Iyz = −196,875 (t⁴)', () => {
    const p = propiedades(deRects(L1314));
    expect(p.A).toBe(24);
    expect(p.yG).toBeCloseTo(4.875, 12);
    expect(p.zG).toBeCloseTo(2.375, 12);
    expect(p.Iz).toBeCloseTo(557.625, 9);
    expect(p.Iy).toBeCloseTo(202.625, 9);
    expect(p.Iyz).toBeCloseTo(-196.875, 9);
    const m = malla(L1314, 1 / 20);
    expect(p.Iz).toBeCloseTo(m.Iz, 6);
    expect(p.Iy).toBeCloseTo(m.Iy, 6);
    expect(p.Iyz).toBeCloseTo(m.Iyz, 6);
  });

  it('la U invertida de 2014-2015: ȳ = 23t/4 desde arriba e Iz = 930,83t⁴', () => {
    const p = propiedades(deRects(U1415));
    expect(p.yG).toBeCloseTo(23 / 4, 12);
    expect(p.zG).toBeCloseTo(6, 12);
    expect(p.Iz).toBeCloseTo(930.8333333, 6);
    expect(p.Iyz).toBeCloseTo(0, 9);
    /* otro camino: el rectángulo exterior menos el hueco, cada uno a G */
    const resta = (12 * 15 ** 3) / 12 + 180 * (7.5 - 5.75) ** 2 - ((10 * 14 ** 3) / 12 + 140 * (8 - 5.75) ** 2);
    expect(p.Iz).toBeCloseTo(resta, 9);
    const hueca = propiedades([
      { tipo: 'rectangulo', y0: 0, y1: 15, z0: 0, z1: 12 },
      { tipo: 'rectangulo', y0: 1, y1: 15, z0: 1, z1: 11, hueco: true },
    ]);
    expect(hueca.Iz).toBeCloseTo(p.Iz, 9);
  });

  it('la U de alas desiguales de 2015-2016: A = 50t², ȳ = 13,1t, z̄ = 5,2t; Iz = 3756,17, Iy = 1654,67, Iyz = 1029 (t⁴)', () => {
    const p = propiedades(deRects(U1516));
    expect(p.A).toBe(50);
    expect(p.yG).toBeCloseTo(13.1, 12);
    expect(p.zG).toBeCloseTo(5.2, 12);
    expect(p.Iz).toBeCloseTo(3756.1667, 3);
    expect(p.Iy).toBeCloseTo(1654.6667, 3);
    expect(p.Iyz).toBeCloseTo(1029, 9);
    const m = malla(U1516, 1 / 10);
    expect(p.Iyz).toBeCloseTo(m.Iyz, 6);
    expect(p.Iz).toBeCloseTo(m.Iz, 6);
  });
});

describe('ejes principales (círculo de Mohr de inercias, ecs. 9.19-9.20)', () => {
  it('la U de 2015-2016: Imax = 4176,10, Imin = 1234,73 (t⁴), el eje de máxima a 22,2° por encima de z', () => {
    const { Iz, Iy, Iyz } = propiedades(deRects(U1516));
    const pr = principales(Iz, Iy, Iyz);
    expect(pr.centro).toBeCloseTo(2705.4167, 3);
    expect(pr.radio).toBeCloseTo(1470.69, 2);
    expect(pr.Imax).toBeCloseTo(4176.1, 1);
    expect(pr.Imin).toBeCloseTo(1234.73, 2);
    expect((pr.phiMax * 180) / Math.PI).toBeCloseTo(22.2, 1);
    /* η = (−sen φ, cos φ): con φ > 0 sube (y < 0) hacia +z */
    expect(pr.ejeMax[0]).toBeLessThan(0);
    expect(pr.ejeMax[1]).toBeGreaterThan(0);
  });

  it('la L de 2013-2014: Imax = 645,20 e Imin = 115,05 (t⁴), el eje de máxima a 23,98° de z, hacia abajo', () => {
    const { Iz, Iy, Iyz } = propiedades(deRects(L1314));
    const pr = principales(Iz, Iy, Iyz);
    expect(pr.Imax).toBeCloseTo(645.2024, 3);
    expect(pr.Imin).toBeCloseTo(115.0476, 3);
    /* Iyz < 0: φ < 0, el eje de máxima baja (y > 0) hacia +z */
    expect((pr.phiMax * 180) / Math.PI).toBeCloseTo(-23.9813, 3);
  });

  it('en los ejes principales Iξη = 0, y un barrido de φ no sale nunca de [Imin, Imax]', () => {
    for (const rects of [L1314, U1415, U1516]) {
      const { Iz, Iy, Iyz } = propiedades(deRects(rects));
      const pr = principales(Iz, Iy, Iyz);
      const g = inerciaGirada(Iz, Iy, Iyz, pr.phiMax);
      expect(g.Ixieta).toBeCloseTo(0, 8);
      expect(g.Ieta).toBeCloseTo(pr.Imax, 8);
      expect(g.Ixi).toBeCloseTo(pr.Imin, 8);
      for (let k = 0; k < 180; k++) {
        const r = inerciaGirada(Iz, Iy, Iyz, (k * Math.PI) / 180);
        expect(r.Ieta).toBeLessThanOrEqual(pr.Imax + 1e-9);
        expect(r.Ieta).toBeGreaterThanOrEqual(pr.Imin - 1e-9);
        expect(r.Ieta + r.Ixi).toBeCloseTo(Iz + Iy, 8);
      }
      expect(inerciaGirada(Iz, Iy, Iyz, 0).Ieta).toBeCloseTo(Iz, 10);
    }
  });

  it('la inercia girada es ∫ξ² dA en la malla (ξ = y cos φ + z sen φ, ec. 9.6)', () => {
    const m = malla(L1314, 1 / 20);
    const phi = 0.4;
    const xi2 = m.celdas.reduce((s, [y, z]) => s + ((y - m.yG) * Math.cos(phi) + (z - m.zG) * Math.sin(phi)) ** 2, 0) * m.dA;
    const corr = (m.A * (1 / 20) ** 2) / 12;
    const { Iz, Iy, Iyz } = propiedades(deRects(L1314));
    /* Iη es la inercia respecto del eje η: la integral de ξ² */
    expect(inerciaGirada(Iz, Iy, Iyz, phi).Ieta).toBeCloseTo(xi2 + corr, 5);
  });

  it('sin producto ni diferencia de inercias, todas las direcciones son principales', () => {
    const pr = principales(5, 5, 0);
    expect(pr.radio).toBe(0);
    expect(pr.phiMax).toBe(0);
  });
});

describe('momento estático de una parte y ancho de una fibra (ec. 9.33)', () => {
  it('rectángulo b × h: la parte de debajo de y (desde G) tiene Qz = b(h²/4 − y²)/2', () => {
    const b = 4;
    const h = 10;
    const sec = rectanguloMacizo(b, h);
    for (const yRel of [-4, -1, 0, 2.5]) {
      const q = momentoEstatico(sec, h / 2 + yRel, 'debajo');
      expect(q.Qz).toBeCloseTo((b * ((h * h) / 4 - yRel * yRel)) / 2, 10);
      expect(q.A).toBeCloseTo(b * (h / 2 - yRel), 10);
      /* las dos partes suman cero: G es G */
      expect(q.Qz + momentoEstatico(sec, h / 2 + yRel, 'encima').Qz).toBeCloseTo(0, 10);
    }
  });

  it('círculo de radio R: la parte de debajo de y tiene Qz = ⅔(R² − y²)^(3/2) y ancho 2√(R² − y²)', () => {
    const R = 3;
    const sec = circular(2 * R);
    for (const y of [-2.5, -1, 0, 0.7, 2.9]) {
      expect(momentoEstatico(sec, y, 'debajo').Qz).toBeCloseTo((2 / 3) * (R * R - y * y) ** 1.5, 10);
      expect(anchoEnFibra(sec, y)).toBeCloseTo(2 * Math.sqrt(R * R - y * y), 12);
    }
    /* el área del semicírculo y su centro a 4R/3π */
    const mitad = momentoEstatico(sec, 0, 'debajo');
    expect(mitad.A).toBeCloseTo((Math.PI * R * R) / 2, 10);
    expect(mitad.Qz / mitad.A).toBeCloseTo((4 * R) / (3 * Math.PI), 10);
  });

  it('una franja de un círculo desplazado: sus integrales contra Simpson por rodajas, y las tres franjas suman el círculo', () => {
    const yc = 1.5;
    const zc = -2;
    const R = 4;
    const sec: Seccion = [{ tipo: 'circulo', y: yc, z: zc, R }];
    /* otro camino: en cada rodaja y, la cuerda de semiancho a da ∫dz = 2a,
       ∫z dz = 2a·zc y ∫z² dz = 2a·zc² + ⅔a³; luego Simpson en y */
    const simpson = (f: (y: number) => number, y0: number, y1: number) => {
      const n = 4000;
      const h = (y1 - y0) / n;
      let s = f(y0) + f(y1);
      for (let k = 1; k < n; k++) s += (k % 2 ? 4 : 2) * f(y0 + k * h);
      return (s * h) / 3;
    };
    const a = (y: number) => Math.sqrt(R * R - (y - yc) ** 2);
    const [y0, y1] = [yc - 1, yc + 2];
    const f = integralesParte(sec, { yMin: y0, yMax: y1 });
    expect(f.A).toBeCloseTo(simpson((y) => 2 * a(y), y0, y1), 10);
    expect(f.Sy).toBeCloseTo(simpson((y) => 2 * a(y) * y, y0, y1), 10);
    expect(f.Sz).toBeCloseTo(simpson((y) => 2 * a(y) * zc, y0, y1), 10);
    expect(f.Jyy).toBeCloseTo(simpson((y) => 2 * a(y) * y * y, y0, y1), 10);
    expect(f.Jzz).toBeCloseTo(simpson((y) => 2 * a(y) * zc * zc + (2 / 3) * a(y) ** 3, y0, y1), 10);
    expect(f.Jyz).toBeCloseTo(simpson((y) => 2 * a(y) * y * zc, y0, y1), 10);
    /* las tres franjas suman el círculo entero */
    const total = integrales(sec);
    const partes = [{ yMax: y0 }, { yMin: y0, yMax: y1 }, { yMin: y1 }].map((c) => integralesParte(sec, c));
    for (const k of ['A', 'Sy', 'Sz', 'Jyy', 'Jzz', 'Jyz'] as const) {
      expect(partes.reduce((s, p) => s + p[k], 0)).toBeCloseTo(total[k], 9);
    }
    const q = [{ yMax: y0 }, { yMin: y0, yMax: y1 }, { yMin: y1 }].map((c) => parte(sec, c));
    expect(q.reduce((s, p) => s + p.Qz, 0)).toBeCloseTo(0, 10);
  });

  it('el ancho de una fibra descuenta los huecos: tubo y cajón', () => {
    expect(anchoEnFibra(circular(10, 6), 0)).toBeCloseTo(4, 12);
    expect(anchoEnFibra(circular(10, 6), 4)).toBeCloseTo(2 * 3, 12);
    const cajon: Seccion = [
      { tipo: 'rectangulo', y0: 0, y1: 10, z0: 0, z1: 6 },
      { tipo: 'rectangulo', y0: 1, y1: 9, z0: 1, z1: 5, hueco: true },
    ];
    expect(anchoEnFibra(cajon, 5)).toBeCloseTo(2, 12);
    expect(anchoEnFibra(cajon, 0.5)).toBeCloseTo(6, 12);
  });

  it('en la unión de dos piezas el ancho salta: se pide el lado, y sin lado lanza', () => {
    /* T invertida: alma de 2 × 20 encima de un ala de 20 × 2; la unión, en y = 20 */
    const T = deRects([
      [0, 20, 9, 11],
      [20, 22, 0, 20],
    ]);
    expect(anchoEnFibra(T, 20, 'encima')).toBeCloseTo(2, 12);
    expect(anchoEnFibra(T, 20, 'debajo')).toBeCloseTo(20, 12);
    expect(() => anchoEnFibra(T, 20)).toThrow(/unión/);
    /* la U de 2015-2016: alma de 1 entre un ala de 10 (arriba) y una de 20 (abajo) */
    const U = deRects(U1516);
    expect(anchoEnFibra(U, 21, 'encima')).toBeCloseTo(1, 12);
    expect(anchoEnFibra(U, 21, 'debajo')).toBeCloseTo(20, 12);
    expect(anchoEnFibra(U, 1, 'encima')).toBeCloseTo(10, 12);
    expect(anchoEnFibra(U, 1, 'debajo')).toBeCloseTo(1, 12);
    /* el cajón de 6 × 10 con hueco de 4 × 8: paredes de 1 */
    const cajon: Seccion = [
      { tipo: 'rectangulo', y0: 0, y1: 10, z0: 0, z1: 6 },
      { tipo: 'rectangulo', y0: 1, y1: 9, z0: 1, z1: 5, hueco: true },
    ];
    expect(anchoEnFibra(cajon, 9, 'encima')).toBeCloseTo(2, 12);
    expect(anchoEnFibra(cajon, 9, 'debajo')).toBeCloseTo(6, 12);
    expect(anchoEnFibra(cajon, 1, 'encima')).toBeCloseTo(6, 12);
    expect(anchoEnFibra(cajon, 1, 'debajo')).toBeCloseTo(2, 12);
    expect(() => anchoEnFibra(cajon, 9)).toThrow(/unión/);
    /* en un borde de fuera, el ancho es el de la única pieza que hay */
    expect(anchoEnFibra(T, 0)).toBeCloseTo(2, 12);
    expect(anchoEnFibra(T, 22)).toBeCloseTo(20, 12);
    expect(anchoEnFibra(T, 22, 'debajo')).toBe(0);
    /* dos piezas del mismo ancho, una encima de otra: no hay salto */
    expect(
      anchoEnFibra(
        deRects([
          [0, 1, 0, 4],
          [1, 3, 0, 4],
        ]),
        1,
      ),
    ).toBeCloseTo(4, 12);
    /* en un círculo el ancho no salta */
    expect(anchoEnFibra(circular(10), 3, 'encima')).toBeCloseTo(8, 12);
  });

  it('un triángulo partido por una recta vertical: el recorte sigue la hipotenusa', () => {
    /* catetos de 2 en [y, z]: (0, 0), (0, 2), (2, 0); la parte con z ≤ 1 es
       un trapecio de área ∫₀¹ (2 − z) dz = 3/2 y ∫z dA = ∫₀¹ z(2 − z) dz = 2/3 */
    const tri: Seccion = [
      {
        tipo: 'poligono',
        puntos: [
          [0, 0],
          [0, 2],
          [2, 0],
        ],
      },
    ];
    const f = integralesParte(tri, { zMax: 1 });
    expect(f.A).toBeCloseTo(1.5, 12);
    expect(f.Sz).toBeCloseTo(2 / 3, 12);
    /* y ∫y dA = ∫₀¹ (2 − z)²/2 dz = 7/6 */
    expect(f.Sy).toBeCloseTo(7 / 6, 12);
  });

  it('la U de alas desiguales: Q de la parte de debajo de cada fibra y su ancho, contra la malla', () => {
    const sec = deRects(U1516);
    const p = propiedades(sec);
    const m = malla(U1516, 1 / 10);
    for (const yF of [0.5, 5, 13.1, 21.5]) {
      const q = momentoEstatico(sec, yF, 'debajo');
      const Qm = m.celdas.filter((c) => c[0] > yF).reduce((s, c) => s + (c[0] - m.yG), 0) * m.dA;
      expect(q.Qz).toBeCloseTo(Qm, 6);
      const Qym = m.celdas.filter((c) => c[0] > yF).reduce((s, c) => s + (c[1] - m.zG), 0) * m.dA;
      expect(q.Qy).toBeCloseTo(Qym, 6);
    }
    expect(anchoEnFibra(sec, 0.5)).toBeCloseTo(10, 12);
    expect(anchoEnFibra(sec, p.yG)).toBeCloseTo(1, 12);
    expect(anchoEnFibra(sec, 21.5)).toBeCloseTo(20, 12);
    expect(anchoEnFibra(sec, 30)).toBe(0);
  });

  it('un trozo de ala cortado por una caja: el ala de 10t de la U invertida desde el borde hasta z = 3', () => {
    const sec = deRects(U1415);
    const p = propiedades(sec);
    const q = parte(sec, { yMax: 1, zMax: 3 });
    expect(q.A).toBeCloseTo(3, 12);
    expect(q.Qz).toBeCloseTo(3 * (0.5 - p.yG), 12);
    expect(q.Qy).toBeCloseTo(3 * (1.5 - p.zG), 12);
  });

  it('un círculo no se parte por rectas verticales', () => {
    expect(() => parte(circular(4), { zMax: 0 })).toThrow();
  });
});
