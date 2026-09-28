/**
 * El agua y su vapor, la base de las tablas de Térmica (fase F1 de la
 * auditoría del 27 de septiembre de 2026). Dos formulaciones de la IAPWS:
 * la científica de 1995 (`src/lib/iapws95.ts`), de la que salen las tablas
 * porque es la del anexo del curso, y la industrial de 1997
 * (`src/lib/if97.ts`), que le da el punto de partida y la contrasta.
 *
 * Tres anclas, las tres externas. Los valores de verificación que publica
 * cada estándar, que se reproducen con nueve cifras: no son un ejemplo de
 * manual, son la definición de la formulación, y un solo coeficiente mal
 * copiado los rompe. Que las dos formulaciones, ajustadas por separado,
 * digan lo mismo. Y el anexo de tablas del curso, a la cifra que imprime.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  presionFrontera23,
  presionDeSaturacion,
  region1,
  region2,
  temperaturaDeSaturacion,
  temperaturaFrontera23,
} from '../../src/lib/if97';
import {
  estadoDePT,
  estadoDeRhoT,
  ideal,
  residual,
  RHOC,
  saturacion,
  saturacionDeP,
  TC,
} from '../../src/lib/iapws95';
import * as iapws95 from '../../src/lib/iapws95';
import { escribe, generaTablas } from '../../src/lib/tablas-vapor';
import { CABECERAS, ERRATAS, numero } from '../../src/lib/anexo-vapor';
import tablasPublicadas from '../../src/content/tablas/vapor-de-agua.json';
import { mollier } from '../../scripts/figuras/termica-mollier.mjs';

/** Igualdad con nueve cifras significativas, que es lo que da el estándar. */
const conNueveCifras = (medido: number, esperado: number) =>
  expect(Math.abs(medido - esperado) / Math.abs(esperado)).toBeLessThan(5e-9);

describe('región 1, el líquido (tabla 5 de IF97)', () => {
  const casos = [
    { T: 300, p: 3, v: 0.100215168e-2, h: 0.115331273e3, u: 0.112324818e3, s: 0.392294792, cp: 0.417301218e1 },
    { T: 300, p: 80, v: 0.971180894e-3, h: 0.184142828e3, u: 0.106448356e3, s: 0.368563852, cp: 0.401008987e1 },
    { T: 500, p: 3, v: 0.120241800e-2, h: 0.975542239e3, u: 0.971934985e3, s: 0.258041912e1, cp: 0.465580682e1 },
  ];
  for (const c of casos) {
    it(`a ${c.T} K y ${c.p} MPa`, () => {
      const e = region1(c.p, c.T);
      conNueveCifras(e.v, c.v);
      conNueveCifras(e.h, c.h);
      conNueveCifras(e.u, c.u);
      conNueveCifras(e.s, c.s);
      conNueveCifras(e.cp, c.cp);
    });
  }
});

describe('región 2, el vapor (tabla 15 de IF97)', () => {
  const casos = [
    { T: 300, p: 0.0035, v: 0.394913866e2, h: 0.254991145e4, u: 0.241169160e4, s: 0.852238967e1, cp: 0.191300162e1 },
    { T: 700, p: 0.0035, v: 0.923015898e2, h: 0.333568375e4, u: 0.301262819e4, s: 0.101749996e2, cp: 0.208141274e1 },
    { T: 700, p: 30, v: 0.542946619e-2, h: 0.263149474e4, u: 0.246861076e4, s: 0.517540298e1, cp: 0.103505092e2 },
  ];
  for (const c of casos) {
    it(`a ${c.T} K y ${c.p} MPa`, () => {
      const e = region2(c.p, c.T);
      conNueveCifras(e.v, c.v);
      conNueveCifras(e.h, c.h);
      conNueveCifras(e.u, c.u);
      conNueveCifras(e.s, c.s);
      conNueveCifras(e.cp, c.cp);
    });
  }
});

describe('región 4, la saturación (tablas 35 y 36 de IF97)', () => {
  it('la presión de saturación a 300, 500 y 600 K', () => {
    conNueveCifras(presionDeSaturacion(300), 0.353658941e-2);
    conNueveCifras(presionDeSaturacion(500), 0.263889776e1);
    conNueveCifras(presionDeSaturacion(600), 0.123443146e2);
  });
  it('la temperatura de saturación a 0,1, 1 y 10 MPa', () => {
    conNueveCifras(temperaturaDeSaturacion(0.1), 0.372755919e3);
    conNueveCifras(temperaturaDeSaturacion(1), 0.453035632e3);
    conNueveCifras(temperaturaDeSaturacion(10), 0.584149488e3);
  });
  it('las dos ecuaciones son inversas una de otra', () => {
    for (const T of [280, 330, 373.15, 420, 510, 600, 640]) {
      expect(temperaturaDeSaturacion(presionDeSaturacion(T))).toBeCloseTo(T, 7);
    }
  });
});

describe('la frontera entre las regiones 2 y 3', () => {
  it('pasa por 623,15 K y 16,5291643 MPa, en los dos sentidos', () => {
    conNueveCifras(presionFrontera23(623.15), 0.165291643e2);
    conNueveCifras(temperaturaFrontera23(0.165291643e2), 0.62315e3);
  });
});

/* ── IAPWS-95, la formulación científica ──────────────────────────────
   Tablas 6, 7 y 8 de la «Revised Release on the IAPWS Formulation 1995 for
   the Thermodynamic Properties of Ordinary Water Substance for General and
   Scientific Use» (IAPWS, 2018). */
describe('IAPWS-95: la energía libre y sus derivadas (tabla 6)', () => {
  const delta = 838.025 / RHOC;
  const tau = TC / 500;
  it('la parte de gas ideal', () => {
    const d = ideal(delta, tau);
    conNueveCifras(d.phi, 0.204797733e1);
    conNueveCifras(d.phid, 0.384236747);
    conNueveCifras(d.phidd, -0.147637878);
    conNueveCifras(d.phit, 0.904611106e1);
    conNueveCifras(d.phitt, -0.193249185e1);
    expect(d.phidt).toBe(0);
  });
  it('la parte residual: los 56 coeficientes', () => {
    const d = residual(delta, tau);
    conNueveCifras(d.phi, -0.342693206e1);
    conNueveCifras(d.phid, -0.364366650);
    conNueveCifras(d.phidd, 0.856063701);
    conNueveCifras(d.phit, -0.581403435e1);
    conNueveCifras(d.phitt, -0.223440737e1);
    conNueveCifras(d.phidt, -0.112176915e1);
  });
});

describe('IAPWS-95: estados sueltos (tabla 7)', () => {
  const casos = [
    { T: 300, rho: 0.996556e3, p: 0.992418352e-1, cv: 0.413018112e1, w: 0.150151914e4, s: 0.393062643 },
    { T: 500, rho: 0.435, p: 0.999679423e-1, cv: 0.150817541e1, w: 0.548314253e3, s: 0.794488271e1 },
    { T: 647, rho: 0.358e3, p: 0.220384756e2, cv: 0.618315728e1, w: 0.252145078e3, s: 0.432092307e1 },
    { T: 900, rho: 0.241, p: 0.100062559, cv: 0.175890657e1, w: 0.724027147e3, s: 0.916653194e1 },
  ];
  for (const c of casos) {
    it(`a ${c.T} K y ${c.rho} kg/m³`, () => {
      const e = estadoDeRhoT(c.rho, c.T);
      conNueveCifras(e.p, c.p);
      conNueveCifras(e.cv, c.cv);
      conNueveCifras(e.w, c.w);
      conNueveCifras(e.s, c.s);
    });
  }
});

describe('IAPWS-95: la saturación (tabla 8)', () => {
  const casos = [
    { T: 275, p: 0.698451167e-3, rl: 0.999887406e3, rv: 0.550664919e-2, hl: 0.775972202e1, hv: 0.250428995e4, sl: 0.283094670e-1, sv: 0.910660121e1 },
    { T: 450, p: 0.932203564, rl: 0.890341250e3, rv: 0.481200360e1, hl: 0.749161585e3, hv: 0.277441078e4, sl: 0.210865845e1, sv: 0.660921221e1 },
    { T: 625, p: 0.169082693e2, rl: 0.567090385e3, rv: 0.118290280e3, hl: 0.168626976e4, hv: 0.255071625e4, sl: 0.380194683e1, sv: 0.518506121e1 },
  ];
  for (const c of casos) {
    it(`a ${c.T} K`, () => {
      const s = saturacion(c.T);
      conNueveCifras(s.p, c.p);
      conNueveCifras(s.liquido.rho, c.rl);
      conNueveCifras(s.vapor.rho, c.rv);
      conNueveCifras(s.liquido.h, c.hl);
      conNueveCifras(s.vapor.h, c.hv);
      conNueveCifras(s.liquido.s, c.sl);
      conNueveCifras(s.vapor.s, c.sv);
    });
  }
  it('por presión, deshace lo que hace por temperatura', () => {
    for (const T of [280, 354.466, 400, 500, 600, 640]) {
      expect(saturacionDeP(saturacion(T).p).T).toBeCloseTo(T, 8);
    }
  });
});

describe('IAPWS-95 y un estado dado por presión y temperatura', () => {
  it('da el líquido o el vapor según el lado de la campana, y vuelve a la presión pedida', () => {
    for (const [p, T] of [[0.1, 300], [5, 353.15], [50, 653.15], [0.01, 373.15], [2, 673.15], [30, 773.15], [60, 1573.15]]) {
      const e = estadoDePT(p, T);
      expect(Math.abs(e.p - p) / p).toBeLessThan(1e-10);
      expect(e.T).toBe(T);
    }
  });
});

describe('las dos formulaciones dicen lo mismo', () => {
  /* IF97 se ajustó a IAPWS-95 por separado, término a término: que den lo
     mismo es una comprobación independiente de las dos. Lo medido, en las
     regiones 1 y 2 lejos del punto crítico: menos de medio kJ/kg en h,
     una milésima en s y un 0,1 % en v. */
  it('en el líquido y en el vapor', () => {
    for (const [p, T] of [[0.1, 300], [1, 350], [10, 450], [50, 500], [0.01, 400], [0.5, 500], [5, 700], [20, 800]]) {
      const a = estadoDePT(p, T);
      const b = T < temperaturaDeSaturacion(p) ? region1(p, T) : region2(p, T);
      expect(Math.abs(a.h - b.h)).toBeLessThan(0.5);
      expect(Math.abs(a.s - b.s)).toBeLessThan(1e-3);
      expect(Math.abs(a.v - b.v) / b.v).toBeLessThan(1e-3);
    }
  });
});

describe('el anexo de tablas del curso, a la cifra que imprime', () => {
  /* «Tablas y diagramas de Ingeniería Térmica», p. 6, la fila de 0,5 bar:
     0,50000 | 81,317 | 0,0010299 | 3,2400 | 340,54 | 2645,2 | 1,0912 | 7,5930.
     Es la que usa la ordinaria de 2025-2026 y la prosa del tema 3. Cinco
     cifras significativas: se admite media unidad de la última. */
  const aCinco = (x: number, impreso: number, ultima: number) =>
    expect(Math.abs(x - impreso)).toBeLessThanOrEqual(ultima / 2 + 1e-12);
  it('a 0,5 bar', () => {
    const s = saturacionDeP(0.05);
    aCinco(s.T - 273.15, 81.317, 0.001);
    aCinco(s.liquido.v, 0.0010299, 0.0000001);
    aCinco(s.vapor.v, 3.24, 0.0001);
    aCinco(s.liquido.h, 340.54, 0.01);
    aCinco(s.vapor.h, 2645.2, 0.1);
    aCinco(s.liquido.s, 1.0912, 0.0001);
    aCinco(s.vapor.s, 7.593, 0.0001);
  });
});

describe('las tablas publicadas', () => {
  it('son las que salen hoy de IAPWS-95 con la rejilla del anexo', () => {
    const { asignatura: _a, titulo: _t, ...datos } = tablasPublicadas;
    expect(datos).toEqual(generaTablas(iapws95, 'IAPWS-95'));
  });
  it('y el diagrama de Mollier publicado es el que sale hoy de la misma formulación', () => {
    /* El guion se para solo si una curva se aparta más de medio píxel de su
       fila de las tablas o si un rótulo pisa a otro; aquí se comprueba que
       el SVG de la página no se ha quedado atrás. */
    const publicado = readFileSync(new URL('../../src/content/tablas/vapor-de-agua-mollier.svg', import.meta.url), 'utf8');
    expect(mollier().replace(/\r\n/g, '\n')).toBe(publicado.replace(/\r\n/g, '\n'));
  });
  it('tienen la rejilla del anexo: 101, 94, 36 presiones y 6 presiones', () => {
    expect(tablasPublicadas.saturacionT.filas).toHaveLength(101);
    expect(tablasPublicadas.saturacionP.filas).toHaveLength(94);
    expect(tablasPublicadas.sobrecalentado.bloques).toHaveLength(36);
    expect(tablasPublicadas.liquido.bloques).toHaveLength(6);
  });
});

describe('las erratas del anexo que publica la página de tablas', () => {
  const bloque = (tabla: 'sobrecalentado' | 'liquido', p: number) => {
    const b = tablasPublicadas[tabla].bloques.find((x) => x.p === p);
    if (!b) throw new Error(`no hay isobara de ${p} bar en ${tabla}`);
    return b;
  };

  it('las cuatro cabeceras: lo que debería decir es la saturación de estas tablas', () => {
    for (const c of CABECERAS) {
      expect(bloque('sobrecalentado', c.p).Tsat).toBeCloseTo(c.bueno, 2);
      expect(Math.abs(c.impreso - c.bueno)).toBeGreaterThan(0.03);
    }
  });

  /* Cuánto se aparta el anexo de IAPWS-95 donde no hay errata, medido en la
     fase F1: en las filas de 1100 a 1300 °C, hasta 40,4 kJ/kg, 0,0274 en s y
     un 0,18 % en v; en el líquido comprimido, 1,17 kJ/kg, 0,0020 y un 0,4 %.
     Lo que el anexo quiso imprimir tiene que caer dentro. */
  const banda = (e: (typeof ERRATAS)[number], nuestro: number) =>
    e.tabla === 'sobrecalentado'
      ? { v: 0.0025 * nuestro, u: 41, h: 41, s: 0.028 }[e.columna]
      : { v: 0.005 * nuestro, u: 1.2, h: 1.2, s: 0.0021 }[e.columna];
  const COLUMNA = { v: 1, u: 2, h: 3, s: 4 } as const;
  const celda = (e: (typeof ERRATAS)[number]) => {
    const b = bloque(e.tabla, e.p);
    const fila = e.T === 'Sat' ? [b.Tsat!, ...b.saturado!] : b.filas.find((f) => f[0] === e.T);
    if (!fila) throw new Error(`no hay fila de ${e.T} °C a ${e.p} bar en ${e.tabla}`);
    return fila[COLUMNA[e.columna]];
  };

  it('cada errata es una celda de la rejilla, y lo que debería decir cae donde cae esa parte del anexo', () => {
    for (const e of ERRATAS) {
      const nuestro = celda(e);
      expect(numero(e.bueno)).not.toBe(numero(e.impreso));
      expect(Math.abs(numero(e.bueno) - nuestro), `${e.tabla} ${e.p} bar ${e.T} ${e.columna}`).toBeLessThanOrEqual(
        banda(e, nuestro),
      );
    }
  });

  it('y las que se ven sin cuentas, las de más de un 5 %, lo impreso se sale de esa banda', () => {
    const gruesas = ERRATAS.filter((e) => Math.abs(numero(e.impreso) / numero(e.bueno) - 1) > 0.05);
    expect(gruesas.length).toBeGreaterThanOrEqual(10);
    for (const e of gruesas) {
      const nuestro = celda(e);
      expect(Math.abs(numero(e.impreso) - nuestro)).toBeGreaterThan(banda(e, nuestro));
    }
  });
});

describe('cómo se escribe una celda', () => {
  it('con coma decimal y los ceros finales de sus cifras', () => {
    expect(escribe(3.24, { cifras: 5 })).toBe('3,2400');
    expect(escribe(0.01526, { cifras: 5 })).toBe('0,015260');
    expect(escribe(100, { cifras: 5 })).toBe('100,00');
    expect(escribe(2645.2, { cifras: 5 })).toBe('2645,2');
    expect(escribe(4891.9, { decimales: 1 })).toBe('4891,9');
    expect(escribe(6.6616, { decimales: 4 })).toBe('6,6616');
    expect(escribe(0.015, { exacto: true })).toBe('0,015');
    expect(escribe(0, { cifras: 5 })).toBe('0');
  });
});
