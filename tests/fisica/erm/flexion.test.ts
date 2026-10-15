/**
 * Tema 9, flexión: tensiones (`src/lib/erm/flexion.ts`).
 *
 * El segundo camino de cada número (CLAUDE.md §10):
 *  · la forma 9.11 (C1, C2) contra la 9.12 (M'z, M'y) y contra la tensión
 *    rehecha en ejes principales con el momento proyectado en ellos;
 *  · el campo de tensiones integrado en una malla devuelve N, My y Mz
 *    (ec. 9.8): es el equilibrio, que no pasa por las fórmulas;
 *  · Collignon contra las fórmulas cerradas del rectángulo y del círculo
 *    (pp. 17-19), y el ala de una I contra τ = T·h1·s/(2Iz) (p. 20);
 *  · el núcleo general de un rectángulo, contra el rombo de h/6 y b/6, y el
 *    eje neutro de un vértice del núcleo, tangente a la sección;
 *  · el dimensionado, contra t = ∛(σ1/σadm) cuando no hay axil, y con axil,
 *    la fibra crítica justo en la admisible.
 * Las tres secciones de los parciales 1 de p6b, p6c y p6d se resuelven en
 * `aceptacion-bloque2.test.ts`; aquí van sus tensiones y su eje neutro.
 */
import { describe, expect, it } from 'vitest';
import {
  coeficientesNavier,
  cortantesEquivalentes,
  cortanteCircular,
  cortanteEnAla,
  cortanteEnFibra,
  cortanteRectangulo,
  cortesEjeNeutro,
  ejeNeutro,
  escalaMinima,
  excentrica,
  flujoCortante,
  fuerzaUnion,
  momentosEquivalentes,
  moduloNecesario,
  moduloResistente,
  nucleoCentral,
  nucleoCircular,
  nucleoRectangulo,
  separacionUniones,
  tensionNormal,
  tensionesExtremas,
  type EsfuerzosSeccion,
} from '../../../src/lib/erm/flexion';
import { circular, principales, propiedades, rectanguloMacizo, type Seccion } from '../../../src/lib/erm/secciones';

const deRects = (rects: number[][]): Seccion => rects.map(([y0, y1, z0, z1]) => ({ tipo: 'rectangulo', y0, y1, z0, z1 }));
const L1314 = deRects([
  [0, 15, 0, 1],
  [0, 1, 1, 10],
]);
const U1516R = [
  [0, 1, 0, 10],
  [1, 21, 0, 1],
  [21, 22, 0, 20],
];
const U1516 = deRects(U1516R);

/**
 * Segundo camino del cortante en una fibra: la sección en celdas de lado h
 * (rectángulos [y0, y1, z0, z1, signo], los huecos con signo −1), con Iz, Iy
 * e Iyz exactos por celda (el h²/12 de cada una), Qz y Qy de las celdas de
 * debajo de la fibra, T′ de la ec. 9.31, y b contando las celdas de la fila de
 * justo encima o de justo debajo. Las cotas y la fibra caen en la malla.
 */
function tauMalla(rects: number[][], Ty: number, yF: number, lado: 'encima' | 'debajo', h: number) {
  const celdas: { y: number; z: number; w: number }[] = [];
  for (const [y0, y1, z0, z1, signo = 1] of rects) {
    for (let i = 0; i < Math.round((y1 - y0) / h); i++) {
      for (let j = 0; j < Math.round((z1 - z0) / h); j++) celdas.push({ y: y0 + (i + 0.5) * h, z: z0 + (j + 0.5) * h, w: signo * h * h });
    }
  }
  const suma = (f: (c: { y: number; z: number; w: number }) => number, cs = celdas) => cs.reduce((s, c) => s + f(c), 0);
  const A = suma((c) => c.w);
  const yG = suma((c) => c.w * c.y) / A;
  const zG = suma((c) => c.w * c.z) / A;
  const Iz = suma((c) => c.w * ((c.y - yG) ** 2 + (h * h) / 12));
  const Iy = suma((c) => c.w * ((c.z - zG) ** 2 + (h * h) / 12));
  const Iyz = suma((c) => c.w * (c.y - yG) * (c.z - zG));
  const ac = celdas.filter((c) => c.y > yF);
  const Qz = suma((c) => c.w * (c.y - yG), ac);
  const Qy = suma((c) => c.w * (c.z - zG), ac);
  const k = 1 - (Iyz * Iyz) / (Iy * Iz);
  const qc = ((Ty / k) * Qz) / Iz + ((((-Ty * Iyz) / Iz) / k) * Qy) / Iy;
  const fila = lado === 'encima' ? yF - h / 2 : yF + h / 2;
  const b = suma((c) => c.w / h, celdas.filter((c) => Math.abs(c.y - fila) < h / 4));
  return { qc, b, tau: qc / b };
}

/** Integra σ en una malla de la sección (rectángulos) y devuelve N, My = ∫σz y Mz = ∫σy (ec. 9.8). */
function equilibrio(sec: Seccion, e: EsfuerzosSeccion, h: number) {
  const p = propiedades(sec);
  let N = 0;
  let My = 0;
  let Mz = 0;
  for (const pz of sec) {
    if (pz.tipo !== 'rectangulo') throw new Error('solo rectángulos');
    const ny = Math.round((pz.y1 - pz.y0) / h);
    const nz = Math.round((pz.z1 - pz.z0) / h);
    for (let i = 0; i < ny; i++) {
      for (let j = 0; j < nz; j++) {
        const y = pz.y0 + (i + 0.5) * h;
        const z = pz.z0 + (j + 0.5) * h;
        const s = tensionNormal(p, e, [y, z]);
        /* σ es lineal: ∫σ·y en la celda lleva además (∂σ/∂y)·h⁴/12 */
        const c = coeficientesNavier(p, e);
        N += s * h * h;
        My += (s * (z - p.zG) + (c.C2 * h * h) / 12) * h * h;
        Mz += (s * (y - p.yG) + (c.C1 * h * h) / 12) * h * h;
      }
    }
  }
  return { N, My, Mz };
}

describe('Navier: flexión simple, esviada y compuesta', () => {
  it('rectángulo con Mz: σ = Mz·y/Iz (ec. 9.23), máxima Mz/Wz en la fibra de abajo (ec. 9.24)', () => {
    const sec = rectanguloMacizo(20, 60);
    const p = propiedades(sec);
    const e = { Mz: 3e6 };
    expect(tensionNormal(p, e, [60, 10])).toBeCloseTo((3e6 * 30) / p.Iz, 9);
    expect(tensionNormal(p, e, [0, 10])).toBeCloseTo((-3e6 * 30) / p.Iz, 9);
    const W = moduloResistente(p.Iz, 30);
    expect(W).toBeCloseTo((20 * 60 ** 2) / 6, 9);
    expect(tensionesExtremas(sec, e).max.sigma).toBeCloseTo(3e6 / W, 9);
    expect(moduloNecesario(-3e6, 150)).toBe(20000);
    expect(() => moduloNecesario(1, 0)).toThrow();
    expect(() => moduloResistente(1, 0)).toThrow();
  });

  it('con My > 0 tracciona z > 0, y con Mz > 0 tracciona y > 0 (abajo)', () => {
    const sec = rectanguloMacizo(20, 60);
    const p = propiedades(sec);
    expect(tensionNormal(p, { My: 1 }, [30, 20])).toBeGreaterThan(0);
    expect(tensionNormal(p, { My: 1 }, [30, 0])).toBeLessThan(0);
    expect(tensionNormal(p, { Mz: 1 }, [60, 10])).toBeGreaterThan(0);
  });

  it('la forma 9.11 y la 9.12 dan la misma tensión en la U de alas desiguales', () => {
    const p = propiedades(U1516);
    const e = { Mz: -Math.cos((20 * Math.PI) / 180), My: -Math.sin((20 * Math.PI) / 180) };
    const { MzP, MyP } = momentosEquivalentes(p, e);
    for (const [y, z] of [
      [0, 0],
      [22, 20],
      [21, 1],
      [0, 10],
    ]) {
      const viaP = (MzP * (y - p.yG)) / p.Iz + (MyP * (z - p.zG)) / p.Iy;
      expect(tensionNormal(p, e, [y, z])).toBeCloseTo(viaP, 12);
    }
  });

  it('y la misma que en ejes principales, con el momento proyectado en ellos', () => {
    for (const sec of [U1516, L1314]) {
      const p = propiedades(sec);
      const pr = principales(p.Iz, p.Iy, p.Iyz);
      const e = { Mz: 0.7, My: -1.3 };
      /* M = My·j − Mz·k como vector físico (y, z); en los ejes principales
         η (máxima) y ξ (mínima), σ = −Mη·ξ/Iη... se hace con el vector:
         la tensión de un vector momento m sobre un eje u principal de inercia
         I_u es (m·u)·(distancia con signo según u × x)/I_u. */
      const m = [e.My, -e.Mz]; // componentes [y, z] del vector M
      const ejes = [
        { u: pr.ejeMax, I: pr.Imax },
        { u: pr.ejeMin, I: pr.Imin },
      ];
      for (const [y, z] of [
        [0, 0],
        [14, 0.5],
        [3, 9],
      ]) {
        const r = [y - p.yG, z - p.zG];
        let s = 0;
        for (const { u, I } of ejes) {
          /* momento según u: Mu = m·u; produce σ = Mu·(r·w)/I con w = x × u, que en
             [y, z] es (−u_z, u_y) — el mismo que M = My·j da σ = My·z/Iy. */
          const Mu = m[0] * u[0] + m[1] * u[1];
          const w = [-u[1], u[0]];
          s += (Mu * (r[0] * w[0] + r[1] * w[1])) / I;
        }
        expect(tensionNormal(p, e, [y, z])).toBeCloseTo(s, 10);
      }
    }
  });

  it('el campo de tensiones integrado en la malla devuelve N, My y Mz (ec. 9.8)', () => {
    const e = { N: 2.5, Mz: 3, My: -1.7 };
    for (const sec of [U1516, L1314]) {
      const r = equilibrio(sec, e, 0.25);
      expect(r.N).toBeCloseTo(2.5, 9);
      expect(r.My).toBeCloseTo(-1.7, 9);
      expect(r.Mz).toBeCloseTo(3, 9);
    }
  });

  it('flexión compuesta: el axil suma N/A en todos los puntos (ec. 9.41)', () => {
    const p = propiedades(L1314);
    const conN = tensionNormal(p, { N: 48, Mz: 5 }, [3, 4]);
    const sinN = tensionNormal(p, { Mz: 5 }, [3, 4]);
    expect(conN - sinN).toBeCloseTo(2, 12);
  });

  it('sin inercia en una dirección no hay Navier', () => {
    expect(() => coeficientesNavier({ A: 1, yG: 0, zG: 0, Iz: 1, Iy: 1, Iyz: 1 }, { Mz: 1 })).toThrow();
  });
});

describe('eje neutro', () => {
  it('la U de 2015-2016 con M0 a 20° por encima de +z: el eje neutro sube 14,80° sobre z (p6b)', () => {
    const p = propiedades(U1516);
    const e = { Mz: -Math.cos((20 * Math.PI) / 180), My: -Math.sin((20 * Math.PI) / 180) };
    const en = ejeNeutro(p, e);
    expect((en.anguloSobreZ * 180) / Math.PI).toBeCloseTo(14.8, 2);
    /* por la ec. 9.13: y/z = −M'y·Iz/(M'z·Iy) */
    const { MzP, MyP } = momentosEquivalentes(p, e);
    expect(en.pendiente).toBeCloseTo((-MyP * p.Iz) / (MzP * p.Iy), 12);
    /* sin axil pasa por G */
    expect(en.yN).toBeCloseTo(0, 12);
  });

  it('la L de 2013-2014 con Mz > 0 y My = 0: el eje neutro sube 44,18° sobre z (p6d)', () => {
    const p = propiedades(L1314);
    const en = ejeNeutro(p, { Mz: 1 });
    expect((en.anguloSobreZ * 180) / Math.PI).toBeCloseTo(44.18, 2);
    expect(Math.tan(en.anguloSobreZ)).toBeCloseTo(-p.Iyz / p.Iy, 12);
  });

  it('los puntos del eje neutro tienen σ = 0, también con axil (cortes yN, zN)', () => {
    const p = propiedades(L1314);
    const e = { N: 10, Mz: 4, My: 3 };
    const en = ejeNeutro(p, e);
    expect(tensionNormal(p, e, [p.yG + en.yN, p.zG])).toBeCloseTo(0, 12);
    expect(tensionNormal(p, e, [p.yG, p.zG + en.zN])).toBeCloseTo(0, 12);
    expect(() => ejeNeutro(p, { N: 3 })).toThrow();
    const vertical = ejeNeutro(propiedades(rectanguloMacizo(2, 4)), { My: 1 });
    expect(vertical.anguloSobreZ).toBeCloseTo(Math.PI / 2, 12);
    expect(vertical.pendiente).toBe(Infinity);
  });
});

describe('tensiones extremas', () => {
  it('la U de 2015-2016: la más comprimida es la esquina de abajo a la derecha, −2,988·10⁻³ M0/t³ (p6b)', () => {
    const e = { Mz: -Math.cos((20 * Math.PI) / 180), My: -Math.sin((20 * Math.PI) / 180) };
    const { min } = tensionesExtremas(U1516, e);
    expect(min.sigma).toBeCloseTo(-2.988e-3, 6);
    expect(min.punto).toEqual([22, 20]);
  });

  it('la L de 2013-2014 con Mz = 1: la máxima, 0,023992 en la esquina interior del pie (p6d)', () => {
    const { max, min } = tensionesExtremas(L1314, { Mz: 1 });
    expect(max.sigma).toBeCloseTo(1780.875 / 74229, 12);
    expect(max.punto).toEqual([15, 1]);
    expect(min.sigma).toBeCloseTo(-0.0196066, 7);
  });

  it('en un círculo, el extremo está en el borde según el gradiente: M/W con W = πD³/32', () => {
    const D = 40;
    const e = { Mz: 300, My: 400 };
    const { max, min } = tensionesExtremas(circular(D), e);
    expect(max.sigma).toBeCloseTo((500 * 32) / (Math.PI * D ** 3), 12);
    expect(min.sigma).toBeCloseTo(-max.sigma, 12);
  });
});

describe('dimensionado: la escala t mínima', () => {
  it('sin axil, t = ∛(σ1/σadm) con la fibra de mayor cociente (L de 2013-2014, σadm = 2000)', () => {
    const coef = 1780.875 / 74229;
    const M = 1161239.58;
    const t = escalaMinima(L1314, { Mz: M }, { traccion: 2000 });
    expect(t).toBeCloseTo(Math.cbrt((coef * M) / 2000), 10);
  });

  it('con admisibles distintas manda la que antes se agota', () => {
    /* rectángulo 1 × 2 (t = 1): σ = ±M·1/(2/3) = ±1,5M; tracción 100, compresión 10 → manda la compresión */
    const t = escalaMinima(rectanguloMacizo(1, 2), { Mz: 1000 }, { traccion: 100, compresion: 10 });
    expect(t).toBeCloseTo(Math.cbrt(1500 / 10), 10);
  });

  it('con axil, la fibra crítica queda justo en la admisible y con un poco menos de t se pasa', () => {
    const unidad = rectanguloMacizo(1, 2);
    const e = { N: -500, Mz: 800 };
    const adm = { traccion: 30, compresion: 60 };
    const t = escalaMinima(unidad, e, adm);
    const escalada = rectanguloMacizo(t, 2 * t);
    const { max, min } = tensionesExtremas(escalada, e);
    const exceso = Math.max(max.sigma / 30, -min.sigma / 60);
    expect(exceso).toBeCloseTo(1, 9);
    const menos = rectanguloMacizo(0.999 * t, 2 * 0.999 * t);
    const r = tensionesExtremas(menos, e);
    expect(Math.max(r.max.sigma / 30, -r.min.sigma / 60)).toBeGreaterThan(1);
  });

  it('sin esfuerzos o con admisibles no positivas no hay nada que dimensionar', () => {
    expect(() => escalaMinima(rectanguloMacizo(1, 2), {}, { traccion: 10 })).toThrow(/Sin esfuerzos/);
    expect(() => escalaMinima(rectanguloMacizo(1, 2), { Mz: 1 }, { traccion: 0 })).toThrow(/positivas/);
    expect(() => escalaMinima(rectanguloMacizo(1, 2), { Mz: 1 }, { traccion: 10, compresion: -1 })).toThrow(/positivas/);
  });
});

describe('cortantes: teorema del flujo cortante (ecs. 9.34-9.37)', () => {
  it('rectángulo b × h: τ en cada fibra = 6T/(bh³)(h²/4 − y²), máxima 3T/2bh', () => {
    const b = 30;
    const h = 90;
    const T = 5000;
    const sec = rectanguloMacizo(b, h);
    for (const y of [-40, -10, 0, 25]) {
      const r = cortanteEnFibra(sec, { Ty: T }, h / 2 + y);
      expect(r.b).toBeCloseTo(b, 12);
      expect(r.tau).toBeCloseTo(cortanteRectangulo(T, b, h, y), 10);
    }
    expect(cortanteRectangulo(T, b, h, 0)).toBeCloseTo((1.5 * T) / (b * h), 12);
    expect(() => cortanteRectangulo(T, b, h, 46)).toThrow();
  });

  it('círculo: τxy en la cuerda = 4T(R² − y²)/3πR⁴, máxima 4T/3πR² en el eje z', () => {
    const R = 20;
    const T = 1000;
    const sec = circular(2 * R);
    for (const y of [-15, 0, 12]) {
      const r = cortanteEnFibra(sec, { Ty: T }, y);
      expect(r.tau).toBeCloseTo(cortanteCircular(T, R, y).tauXY, 10);
    }
    expect(cortanteCircular(T, R, 0).tauXY).toBeCloseTo((4 * T) / (3 * Math.PI * R * R), 12);
    /* en el borde, τM = 4T√(R² − y²)/(3πR³) */
    expect(cortanteCircular(T, R, 12).tauBorde).toBeCloseTo((4 * T * Math.sqrt(R * R - 144)) / (3 * Math.PI * R ** 3), 12);
    expect(() => cortanteCircular(T, R, 20)).toThrow();
  });

  it('ala de una I: τzx = T·h1·s/(2Iz) a la distancia s del borde, y el alma junto al ala', () => {
    /* I simétrica: alas de 100 × 10, alma de 8 × 180; h1 = 190 entre líneas medias de las alas */
    const sec = deRects([
      [0, 10, 0, 100],
      [10, 190, 46, 54],
      [190, 200, 0, 100],
    ]);
    const p = propiedades(sec);
    const T = 20000;
    for (const s of [10, 25, 46]) {
      const r = cortanteEnAla(sec, { Ty: T }, { yMin: 190, zMax: s }, 10);
      expect(r.tau).toBeCloseTo((T * 190 * s) / (2 * p.Iz), 10);
    }
    /* el alma justo debajo del ala de arriba: Q = ala entera, b = 8 */
    const alma = cortanteEnFibra(sec, { Ty: T }, 10, 'debajo');
    expect(alma.b).toBe(8);
    expect(Math.abs(alma.tau)).toBeCloseTo((T * 100 * 10 * 95) / (p.Iz * 8), 10);
    expect(() => cortanteEnAla(sec, { Ty: T }, { yMin: 190 }, 0)).toThrow();
    expect(() => cortanteEnFibra(sec, { Ty: T }, 300)).toThrow();
  });

  it('en la unión ala-alma con el ala debajo, la τ del alma lleva el ancho del alma (T invertida, U de 2015-2016, cajón), contra la malla', () => {
    const T = 1000;
    const casos: { rects: number[][]; y: number; alma: number; ala: number }[] = [
      /* T invertida: alma de 2 × 20, ala de 20 × 2 debajo */
      {
        rects: [
          [0, 20, 9, 11],
          [20, 22, 0, 20],
        ],
        y: 20,
        alma: 2,
        ala: 20,
      },
      /* la U de 2015-2016 en y = 21, la unión con el ala de abajo (Iyz ≠ 0) */
      { rects: U1516R, y: 21, alma: 1, ala: 20 },
      /* el cajón de 6 × 10 con paredes de 1, en y = 9 */
      {
        rects: [
          [0, 10, 0, 6],
          [1, 9, 1, 5, -1],
        ],
        y: 9,
        alma: 2,
        ala: 6,
      },
    ];
    for (const c of casos) {
      const sec: Seccion = c.rects.map(([y0, y1, z0, z1, s = 1]) => ({ tipo: 'rectangulo', y0, y1, z0, z1, hueco: s < 0 }));
      const enAlma = cortanteEnFibra(sec, { Ty: T }, c.y, 'encima');
      const mAlma = tauMalla(c.rects, T, c.y, 'encima', 1);
      expect(enAlma.b).toBeCloseTo(c.alma, 12);
      expect(mAlma.b).toBeCloseTo(c.alma, 12);
      expect(enAlma.qc).toBeCloseTo(mAlma.qc, 9);
      expect(enAlma.tau).toBeCloseTo(mAlma.tau, 9);
      const enAla = cortanteEnFibra(sec, { Ty: T }, c.y, 'debajo');
      expect(enAla.b).toBeCloseTo(c.ala, 12);
      expect(enAla.tau).toBeCloseTo(tauMalla(c.rects, T, c.y, 'debajo', 1).tau, 9);
      /* el salto: la τ del alma es ala/alma veces la del ala */
      expect(enAlma.tau / enAla.tau).toBeCloseTo(c.ala / c.alma, 12);
      expect(() => cortanteEnFibra(sec, { Ty: T }, c.y)).toThrow(/unión/);
    }
    /* la T invertida a mano: A = 80, yG = 15,5, Iz = 11300/3, Q del ala = 40·5,5 = 220 */
    const Tinv = deRects([
      [0, 20, 9, 11],
      [20, 22, 0, 20],
    ]);
    expect(cortanteEnFibra(Tinv, { Ty: T }, 20, 'encima').tau).toBeCloseTo((T * 220) / ((11300 / 3) * 2), 10);
  });

  it('el flujo de la sección entera es nulo, y el de dos partes complementarias, opuesto', () => {
    const p = { Ty: 3, Tz: 2 };
    expect(flujoCortante(U1516, p, {})).toBeCloseTo(0, 10);
    expect(flujoCortante(U1516, p, { yMin: 7 }) + flujoCortante(U1516, p, { yMax: 7 })).toBeCloseTo(0, 10);
  });

  it('T′y y T′z (ec. 9.31) son las derivadas de M′z y M′y (ec. 9.12), y se deshacen con Ty = T′y + T′z·Iyz/Iy', () => {
    const p = propiedades(L1314);
    const T = cortantesEquivalentes(p, { Ty: 3, Tz: -2 });
    /* M′ es lineal en M: con dMz/dx = Ty y dMy/dx = Tz, T′ es el M′ de (Ty, Tz) */
    const Mp = momentosEquivalentes(p, { Mz: 3, My: -2 });
    expect(T.TyP).toBeCloseTo(Mp.MzP, 12);
    expect(T.TzP).toBeCloseTo(Mp.MyP, 12);
    expect(T.TyP + (T.TzP * p.Iyz) / p.Iy).toBeCloseTo(3, 12);
    expect(T.TzP + (T.TyP * p.Iyz) / p.Iz).toBeCloseTo(-2, 12);
  });

  it('con Iyz ≠ 0 entra T′ (ec. 9.31): en la L, una Ty sola da flujo también en las partes verticales', () => {
    const p = propiedades(L1314);
    /* la parte z > 1 (el ala de arriba sin la esquina): Qz y Qy */
    const conIyz = flujoCortante(L1314, { Ty: 1 }, { zMin: 1 });
    const k = 1 - (p.Iyz * p.Iyz) / (p.Iy * p.Iz);
    const Qz = 9 * (0.5 - p.yG);
    const Qy = 9 * (5.5 - p.zG);
    expect(conIyz).toBeCloseTo(((1 / k) * Qz) / p.Iz + ((-p.Iyz / p.Iz / k) * Qy) / p.Iy, 12);
  });

  it('vigas compuestas: e = nS/qc con S = τπD²/4 (ecs. 9.39-9.40)', () => {
    const S = fuerzaUnion(80, 10);
    expect(S).toBeCloseTo(2000 * Math.PI, 9);
    expect(separacionUniones(-50, 2, S)).toBeCloseTo((4000 * Math.PI) / 50, 9);
    expect(() => separacionUniones(0, 2, S)).toThrow();
  });
});

describe('tracción y compresión excéntrica, núcleo central (pp. 24-29)', () => {
  it('P en (ey, ez) da N = P, Mz = P·ey, My = P·ez (ec. 9.43), y σ = P/A + Pey·y/Iz + Pez·z/Iy', () => {
    const sec = rectanguloMacizo(40, 60);
    const p = propiedades(sec);
    const e = excentrica(-1200, 8, -5);
    expect(e).toEqual({ N: -1200, Mz: -9600, My: 6000 });
    const s = tensionNormal(p, e, [60, 40]);
    expect(s).toBeCloseTo(-1200 / p.A + (-9600 * 30) / p.Iz + (6000 * 20) / p.Iy, 10);
  });

  it('el eje neutro de la excéntrica corta en yN = −iz²/ey y zN = −iy²/ez (ec. 9.46)', () => {
    const sec = rectanguloMacizo(40, 60);
    const p = propiedades(sec);
    const e = excentrica(1000, 6, 4);
    const en = ejeNeutro(p, e);
    const c = cortesEjeNeutro(p.Iz / p.A, p.Iy / p.A, 6, 4);
    expect(en.yN).toBeCloseTo(c.yN, 10);
    expect(en.zN).toBeCloseTo(c.zN, 10);
    expect(c.yN).toBeCloseTo(-300 / 6, 10);
    expect(cortesEjeNeutro(1, 1, 0, 2).yN).toBe(Infinity);
    expect(cortesEjeNeutro(1, 1, 2, 0).zN).toBe(Infinity);
  });

  it('el núcleo general de un rectángulo es el rombo de semidiagonales h/6 y b/6', () => {
    const b = 30;
    const h = 72;
    const nuc = nucleoCentral(rectanguloMacizo(b, h));
    const esperado = nucleoRectangulo(b, h);
    for (const v of esperado) expect(nuc.some((w) => Math.abs(w[0] - v[0]) < 1e-9 && Math.abs(w[1] - v[1]) < 1e-9)).toBe(true);
    expect(nuc).toHaveLength(4);
  });

  it('una fuerza en un vértice del núcleo de la L deja el eje neutro tangente: ningún punto cambia de signo', () => {
    const p = propiedades(L1314);
    for (const [ey, ez] of nucleoCentral(L1314)) {
      const e = excentrica(-1, ey, ez);
      const s = [
        [0, 0],
        [0, 10],
        [1, 10],
        [1, 1],
        [15, 1],
        [15, 0],
      ].map(([y, z]) => tensionNormal(p, e, [y, z]));
      expect(Math.max(...s)).toBeLessThan(1e-12);
      expect(s.filter((x) => Math.abs(x) < 1e-12).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('el núcleo del círculo tiene radio D/8: la fuerza ahí deja σ = 0 en el borde opuesto', () => {
    const D = 80;
    expect(nucleoCircular(D)).toBe(10);
    const p = propiedades(circular(D));
    const e = excentrica(-1, nucleoCircular(D), 0);
    expect(tensionNormal(p, e, [-D / 2, 0])).toBeCloseTo(0, 14);
    expect(() => nucleoCentral(circular(D))).toThrow();
  });

  it('una compresión dentro del núcleo deja el eje neutro fuera: toda la sección comprimida, y el dimensionado lo ve', () => {
    /* rectángulo de 2t × 6t, P = 1200 de compresión en ey = 0,5 (h/12 con t = 1, dentro del rombo de h/6) */
    const P = 1200;
    const e = excentrica(-P, 0.5, 0);
    const uno = propiedades(rectanguloMacizo(2, 6));
    const en1 = ejeNeutro(uno, e);
    /* yN = −iz²/ey = −3/0,5 = −6: fuera del canto (|yN| > 3) */
    expect(en1.yN).toBeCloseTo(-6, 12);
    const { max, min } = tensionesExtremas(rectanguloMacizo(2, 6), e);
    /* σ = −P/A·(1 + ey·y/iz²): −P/24 arriba y −P/8 abajo */
    expect(max.sigma).toBeCloseTo(-P / 24, 10);
    expect(max.punto[0]).toBe(0);
    expect(min.sigma).toBeCloseTo(-P / 8, 10);
    /* con t: σ abajo = −100/t² − 50/t³ = −50 con t³ − 2t − 1 = 0, t = (1 + √5)/2; la tracción no manda */
    const t = escalaMinima(rectanguloMacizo(2, 6), e, { traccion: 10, compresion: 50 });
    expect(t).toBeCloseTo((1 + Math.sqrt(5)) / 2, 10);
    const sec = rectanguloMacizo(2 * t, 6 * t);
    const ext = tensionesExtremas(sec, e);
    expect(ext.min.sigma).toBeCloseTo(-50, 8);
    expect(ext.max.sigma).toBeLessThan(0);
    expect(Math.abs(ejeNeutro(propiedades(sec), e).yN)).toBeGreaterThan(3 * t);
  });
});
