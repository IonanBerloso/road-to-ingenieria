/**
 * El motor de vistas (`lib/vistas`), contra configuraciones con la respuesta
 * conocida: el diseño de la fase M, §3.8. Cada pieza es pequeña y está
 * escogida para que su dibujo se sepa de memoria; lo que se comprueba es lo
 * que un alumno de primero tiene que saber dibujar de ella.
 *
 * El primero es la junta de dos bloques sumados, el fallo que encontró la
 * espiga (§3.9): erosionando primitiva a primitiva, la arista que la junta
 * deja detrás de la caja de encima salía vista. Se escribió antes que el
 * motor, se vio fallar con esa erosión, y sigue aquí validado al revés.
 *
 * Coordenadas de cada vista, en mm, con la v hacia abajo como en el papel:
 * alzado (u, v) = (x, −z); planta (x, −y); perfil izquierdo (−y, −z).
 */
import { describe, expect, it } from 'vitest';
import type { P2 } from '../../src/lib/diedrico';
import type { VistaCalculada } from '../../src/lib/vistas/motor.ts';
import { distanciaAForma, largoDe, puntoDe as recorrido } from '../../src/lib/vistas/plano2d.ts';
import { EROSION } from '../../src/lib/vistas/tolerancias.ts';
import { TOL, cualquiera, cubierto, descarteSobre, dist, ejeSobre, firma, gradosDe, vistasDe } from './ayudas';
import {
  AGUJERO_CIEGO,
  AVELLANADO,
  BLOQUE_TALADRADO,
  CHAFLAN_SIN_DENTRO,
  CILINDROS_PARALELOS,
  COLUMNA_EN_BASE,
  CONTACTO_POR_ARISTA,
  CONTACTO_POR_VERTICE,
  CRUZ_DE_TUBOS,
  EJE_TALADRADO,
  EJE_CON_PASADOR,
  EJE_TALADRADO_IGUAL,
  GIRADAS,
  L_DE_DOS_CAJAS,
  L_PRISMA,
  MUESCA_COPLANARIA,
  PLACA_REDONDEADA,
  RANURA_EN_V,
  TRONCO_DE_CONO,
  piezaDeLaEspiga,
  tubosDescentrados,
} from './piezas';

/* ── El primero: la junta ─────────────────────────────────────────────── */

describe('la junta de dos bloques sumados, el fallo que encontró la espiga', () => {
  it('desde la izquierda, el escalón de la L queda detrás de la caja de encima: oculto', () => {
    const { perfil } = vistasDe(L_DE_DOS_CAJAS).vistas;
    expect(cubierto(perfil, [-40, -10], [0, -10], 'oculto')).toBeCloseTo(40, 1);
    expect(cubierto(perfil, [-40, -10], [0, -10], 'visto')).toBe(0);
  });

  it('en la espiga, la junta de la base con la torre va a trazos en el perfil', () => {
    const { perfil } = vistasDe(piezaDeLaEspiga()).vistas;
    expect(cubierto(perfil, [-50, -12], [0, -12], 'oculto')).toBeCloseTo(50, 1);
    expect(cubierto(perfil, [-50, -12], [0, -12], 'visto')).toBe(0);
  });

  it('validado al revés: erosionando primitiva a primitiva, la junta sale vista', () => {
    const { perfil } = vistasDe(L_DE_DOS_CAJAS, { erosion: 'primitiva' }).vistas;
    expect(cubierto(perfil, [-40, -10], [0, -10], 'visto')).toBeGreaterThan(30);
  });
});

/* ── Las configuraciones de respuesta conocida ────────────────────────── */

describe('dos cajas en el mismo plano: no hay arista', () => {
  it('en el alzado, la junta de la base con la caja de encima no se dibuja', () => {
    const { alzado } = vistasDe(L_DE_DOS_CAJAS).vistas;
    expect(cualquiera(alzado, [0, -10], [20, -10])).toBe(0);
    expect(cubierto(alzado, [0, 0], [0, -30], 'visto')).toBeCloseTo(30, 1);
  });

  it('el descarte queda en el catálogo, con su motivo y las dos primitivas', () => {
    const { alzado } = vistasDe(L_DE_DOS_CAJAS).vistas;
    const [d] = descarteSobre(alzado, [0, -10], [20, -10]);
    expect(d?.motivo).toBe('mismo-plano');
    expect(d?.primitivas).toEqual(expect.arrayContaining(['base', 'encima']));
    expect(d?.mensaje).toMatch(/mismo plano/);
  });

  it('en la planta, el escalón se ve: la arista de arriba y la del pie caen en u = 20', () => {
    const { planta } = vistasDe(L_DE_DOS_CAJAS).vistas;
    expect(cubierto(planta, [20, 0], [20, -40], 'visto')).toBeCloseTo(40, 1);
    expect(cualquiera(planta, [0, 0], [0, -40])).toBeCloseTo(40, 1);
  });

  it('la L de dos cajas y la misma L hecha prisma dan las mismas vistas', () => {
    const a = vistasDe(L_DE_DOS_CAJAS);
    const b = vistasDe(L_PRISMA);
    for (const id of ['alzado', 'planta', 'perfil'] as const) expect(firma(b.vistas[id]), id).toEqual(firma(a.vistas[id]));
    expect(b.vistas.alzado.descartes).toHaveLength(0);
  });
});

describe('caja con un cilindro tangente: no hay arista', () => {
  it('en el perfil no hay línea donde la cara plana pasa a la curva', () => {
    const { perfil } = vistasDe(PLACA_REDONDEADA).vistas;
    expect(cualquiera(perfil, [-30, 0], [-30, -10])).toBe(0);
    expect(cubierto(perfil, [-40, 0], [-40, -10], 'visto')).toBeCloseTo(10, 1);
  });

  it('el descarte dice tangencia y nombra la placa y el redondeo', () => {
    const { perfil } = vistasDe(PLACA_REDONDEADA).vistas;
    const [d] = descarteSobre(perfil, [-30, 0], [-30, -10]);
    expect(d?.motivo).toBe('tangencia');
    expect(d?.primitivas).toEqual(expect.arrayContaining(['placa', 'redondeo']));
    expect(d?.mensaje).toMatch(/tangente/);
  });

  it('en la planta, el redondeo es media circunferencia vista y la junta de arriba no se dibuja', () => {
    const { planta } = vistasDe(PLACA_REDONDEADA).vistas;
    expect(gradosDe(planta, [10, -30], 10, 'visto')).toBeCloseTo(180, 0);
    expect(cualquiera(planta, [0, -30], [20, -30])).toBe(0);
  });

  it('en el alzado solo queda el rectángulo: el contorno del cilindro cae sobre las caras de la placa', () => {
    const { alzado } = vistasDe(PLACA_REDONDEADA).vistas;
    expect(alzado.tramos.every((t) => t.tipo === 'visto' && t.forma.tipo === 'segmento')).toBe(true);
    expect(alzado.tramos).toHaveLength(4);
  });
});

describe('arista cóncava: el fondo de una ranura en V', () => {
  it('en la planta se ve, de punta a punta', () => {
    const { planta } = vistasDe(RANURA_EN_V).vistas;
    expect(cubierto(planta, [30, 0], [30, -40], 'visto')).toBeCloseTo(40, 1);
    expect(cubierto(planta, [20, 0], [20, -40], 'visto')).toBeCloseTo(40, 1);
    expect(cubierto(planta, [40, 0], [40, -40], 'visto')).toBeCloseTo(40, 1);
  });

  it('en el alzado es el vértice de la V, y las dos caras inclinadas se ven', () => {
    const { alzado } = vistasDe(RANURA_EN_V).vistas;
    expect(cubierto(alzado, [20, -20], [30, -10], 'visto')).toBeCloseTo(Math.hypot(10, 10), 1);
    expect(cubierto(alzado, [30, -10], [40, -20], 'visto')).toBeCloseTo(Math.hypot(10, 10), 1);
  });

  it('desde la izquierda queda detrás del bloque: oculta', () => {
    const { perfil } = vistasDe(RANURA_EN_V).vistas;
    expect(cubierto(perfil, [-40, -10], [0, -10], 'oculto')).toBeCloseTo(40, 1);
  });
});

describe('agujero pasante', () => {
  const { alzado, planta, perfil } = vistasDe(BLOQUE_TALADRADO).vistas;

  it('en la planta es una circunferencia vista entera', () => {
    expect(gradosDe(planta, [30, -20], 8, 'visto')).toBeCloseTo(360, 0);
  });

  it('en el alzado y en el perfil, dos generatrices ocultas de arriba abajo', () => {
    expect(cubierto(alzado, [22, 0], [22, -20], 'oculto')).toBeCloseTo(20, 1);
    expect(cubierto(alzado, [38, 0], [38, -20], 'oculto')).toBeCloseTo(20, 1);
    expect(cubierto(perfil, [-12, 0], [-12, -20], 'oculto')).toBeCloseTo(20, 1);
    expect(cubierto(perfil, [-28, 0], [-28, -20], 'oculto')).toBeCloseTo(20, 1);
  });

  it('lleva sus ejes: una cruz en la planta y una línea en el alzado y el perfil', () => {
    const horizontal = planta.ejes.some((e) => Math.abs(e.a[1] + 20) < TOL && Math.abs(e.b[1] + 20) < TOL);
    const vertical = planta.ejes.some((e) => Math.abs(e.a[0] - 30) < TOL && Math.abs(e.b[0] - 30) < TOL);
    expect(horizontal && vertical).toBe(true);
    const enAlzado = alzado.ejes.find((e) => Math.abs(e.a[0] - 30) < TOL && Math.abs(e.b[0] - 30) < TOL);
    expect(enAlzado).toBeDefined();
    const [v0, v1] = [enAlzado!.a[1], enAlzado!.b[1]].sort((p, q) => p - q);
    expect(v0).toBeLessThan(-20);
    expect(v1).toBeGreaterThan(0);
    expect(perfil.ejes.some((e) => Math.abs(e.a[0] + 20) < TOL && Math.abs(e.b[0] + 20) < TOL)).toBe(true);
  });

  it('el porqué de una oculta nombra lo que la tapa', () => {
    const oculta = alzado.tramos.find((t) => t.tipo === 'oculto');
    expect(oculta?.porque).toMatch(/bloque/);
  });
});

describe('contorno aparente de un cilindro', () => {
  const { alzado, planta, perfil } = vistasDe(COLUMNA_EN_BASE).vistas;

  it('en el alzado, las dos generatrices de contorno, vistas', () => {
    expect(cubierto(alzado, [20, -10], [20, -40], 'visto')).toBeCloseTo(30, 1);
    expect(cubierto(alzado, [40, -10], [40, -40], 'visto')).toBeCloseTo(30, 1);
    expect(cubierto(alzado, [20, -40], [40, -40], 'visto')).toBeCloseTo(20, 1);
  });

  it('en el perfil, las otras dos', () => {
    expect(cubierto(perfil, [-10, -10], [-10, -40], 'visto')).toBeCloseTo(30, 1);
    expect(cubierto(perfil, [-30, -10], [-30, -40], 'visto')).toBeCloseTo(30, 1);
  });

  it('en la planta, la circunferencia', () => {
    expect(gradosDe(planta, [30, -20], 10, 'visto')).toBeCloseTo(360, 0);
  });

  it('ninguna generatriz de contorno se dibuja donde está dentro de la base', () => {
    expect(cualquiera(alzado, [20, 0], [20, -10])).toBe(0);
  });
});

describe('cono y cilindro con cilindro', () => {
  it('el tronco de cono: el contorno inclinado en el alzado y dos circunferencias en la planta', () => {
    const { alzado, planta } = vistasDe(TRONCO_DE_CONO).vistas;
    expect(cubierto(alzado, [-10, 0], [-5, -20], 'visto')).toBeCloseTo(Math.hypot(5, 20), 1);
    expect(cubierto(alzado, [10, 0], [5, -20], 'visto')).toBeCloseTo(Math.hypot(5, 20), 1);
    expect(gradosDe(planta, [0, 0], 10, 'visto')).toBeCloseTo(360, 0);
    expect(gradosDe(planta, [0, 0], 5, 'visto')).toBeCloseTo(360, 0);
  });

  it('el taladro transversal del eje, mirado a lo largo, es una circunferencia vista', () => {
    const { perfil } = vistasDe(EJE_TALADRADO).vistas;
    expect(gradosDe(perfil, [0, -20], 4, 'visto')).toBeCloseTo(360, 0);
  });
});

/* ── Las invariantes del sistema europeo ──────────────────────────────── */

describe('las invariantes: las tres vistas se corresponden', () => {
  const piezas = [
    L_DE_DOS_CAJAS,
    L_PRISMA,
    PLACA_REDONDEADA,
    RANURA_EN_V,
    BLOQUE_TALADRADO,
    COLUMNA_EN_BASE,
    TRONCO_DE_CONO,
    EJE_TALADRADO,
    CILINDROS_PARALELOS,
    CRUZ_DE_TUBOS,
    EJE_TALADRADO_IGUAL,
    AVELLANADO,
    AGUJERO_CIEGO,
    CONTACTO_POR_ARISTA,
    CONTACTO_POR_VERTICE,
    CHAFLAN_SIN_DENTRO,
    MUESCA_COPLANARIA,
    GIRADAS,
  ];

  it.each([...piezas.map((p) => [p.codigo, p] as const), ['RI-V1', piezaDeLaEspiga()] as const])(
    '%s: alzado y planta, la misma anchura; alzado y perfil, la misma altura; planta y perfil, la misma profundidad',
    (_, pieza) => {
      const { alzado, planta, perfil } = vistasDe(pieza).vistas;
      const [a, p, f] = [alzado.encuadre, planta.encuadre, perfil.encuadre];
      expect(a.umin).toBeCloseTo(p.umin, 6);
      expect(a.umax).toBeCloseTo(p.umax, 6);
      expect(a.vmin).toBeCloseTo(f.vmin, 6);
      expect(a.vmax).toBeCloseTo(f.vmax, 6);
      expect(p.vmax - p.vmin).toBeCloseTo(f.umax - f.umin, 6);
    },
  );

  it('en la espiga, cada abscisa de un vértice del alzado está en la planta y cada altura, en el perfil', () => {
    const { alzado, planta, perfil } = vistasDe(piezaDeLaEspiga()).vistas;
    /* De un segmento cuentan sus dos extremos; de una circunferencia, los
       puntos donde es tangente a la referencia: a izquierda y derecha para
       las anchuras, arriba y abajo para las alturas. */
    const anchuras = (v: VistaCalculada) =>
      v.tramos.flatMap((t) =>
        t.forma.tipo === 'segmento' ? [t.forma.a[0], t.forma.b[0]] : t.forma.tipo === 'arco' ? [t.forma.c[0] - t.forma.r, t.forma.c[0] + t.forma.r] : t.forma.puntos.map((p) => p[0]),
      );
    const alturas = (v: VistaCalculada) =>
      v.tramos.flatMap((t) =>
        t.forma.tipo === 'segmento' ? [t.forma.a[1], t.forma.b[1]] : t.forma.tipo === 'arco' ? [t.forma.c[1] - t.forma.r, t.forma.c[1] + t.forma.r] : t.forma.puntos.map((p) => p[1]),
      );
    const esta = (x: number, lista: readonly number[]) => lista.some((y) => Math.abs(x - y) < 0.01);
    const [uPlanta, vPerfil] = [anchuras(planta), alturas(perfil)];
    for (const u of anchuras(alzado)) expect(esta(u, uPlanta), `u = ${u}`).toBe(true);
    for (const v of alturas(alzado)) expect(esta(v, vPerfil), `v = ${v}`).toBe(true);
  });
});

/* ── La pieza de la espiga ────────────────────────────────────────────── */

describe('la pieza de la espiga (RI-V1), contra lo que dibujó la espiga', () => {
  const { alzado, planta, perfil } = vistasDe(piezaDeLaEspiga()).vistas;

  it('alzado: la L con el chaflán, el agujero de la torre visto y el de la base a trazos', () => {
    expect(cubierto(alzado, [16, -50], [24, -42], 'visto')).toBeCloseTo(Math.hypot(8, 8), 1);
    expect(gradosDe(alzado, [12, -34], 6, 'visto')).toBeCloseTo(360, 0);
    expect(cubierto(alzado, [49, 0], [49, -12], 'oculto')).toBeCloseTo(12, 1);
    expect(cubierto(alzado, [63, 0], [63, -12], 'oculto')).toBeCloseTo(12, 1);
    expect(cualquiera(alzado, [0, -12], [24, -12])).toBe(0);
  });

  it('planta: el agujero de la base visto, el de la torre a trazos y las dos aristas del chaflán', () => {
    expect(gradosDe(planta, [56, -25], 7, 'visto')).toBeCloseTo(360, 0);
    expect(cubierto(planta, [6, 0], [6, -50], 'oculto')).toBeCloseTo(50, 1);
    expect(cubierto(planta, [18, 0], [18, -50], 'oculto')).toBeCloseTo(50, 1);
    expect(cubierto(planta, [16, 0], [16, -50], 'visto')).toBeCloseTo(50, 1);
    expect(cubierto(planta, [24, 0], [24, -50], 'visto')).toBeCloseTo(50, 1);
  });

  it('perfil: la arista baja del chaflán, los dos agujeros y la junta, a trazos', () => {
    expect(cubierto(perfil, [-50, -42], [0, -42], 'oculto')).toBeCloseTo(50, 1);
    expect(cubierto(perfil, [-50, -28], [0, -28], 'oculto')).toBeCloseTo(50, 1);
    expect(cubierto(perfil, [-50, -40], [0, -40], 'oculto')).toBeCloseTo(50, 1);
    expect(cubierto(perfil, [-18, 0], [-18, -12], 'oculto')).toBeCloseTo(12, 1);
    expect(cubierto(perfil, [-32, 0], [-32, -12], 'oculto')).toBeCloseTo(12, 1);
    expect(perfil.tramos.filter((t) => t.tipo === 'visto').every((t) => t.forma.tipo === 'segmento')).toBe(true);
  });

  it('el catálogo: la base y la torre en el mismo plano, y nada inventado sobre la base', () => {
    const [d] = descarteSobre(alzado, [0, -12], [24, -12]);
    expect(d?.motivo).toBe('mismo-plano');
    expect(d?.primitivas).toEqual(expect.arrayContaining(['base', 'torre']));
    /* El plano del chaflán corta la cara de arriba de la base en x = 54,
       pero ahí el chaflán no quita nada (va «dentro» de la torre): esa recta
       no es una junta de dos caras y no entra en el catálogo. */
    expect(descarteSobre(planta, [54, 0], [54, -50])).toHaveLength(0);
  });

  it('los ejes: la cruz del agujero de la base y la línea del de la torre', () => {
    /* El brazo horizontal de la cruz cae sobre el eje de simetría y se
       funde con él: basta con que haya un eje que lo cubra. */
    expect(ejeSobre(planta, [46, -25], [66, -25])).toBe(true);
    expect(ejeSobre(planta, [56, -15], [56, -35])).toBe(true);
    expect(perfil.ejes.some((e) => Math.abs(e.a[1] + 34) < TOL && Math.abs(e.b[1] + 34) < TOL)).toBe(true);
  });
});

/* ── Los casos de la revisión del 9 de octubre ────────────────────────── */

describe('dos cilindros de ejes paralelos que se cortan', () => {
  const { alzado, planta, perfil } = vistasDe(CILINDROS_PARALELOS).vistas;

  it('la arista de encuentro va de arriba abajo en x = 6, vista en el alzado', () => {
    expect(cubierto(alzado, [6, 0], [6, -20], 'visto')).toBeCloseTo(20, 1);
  });

  it('desde la izquierda, las dos aristas de encuentro quedan detrás del cilindro izquierdo', () => {
    expect(cubierto(perfil, [8, 0], [8, -20], 'oculto')).toBeCloseTo(20, 1);
    expect(cubierto(perfil, [-8, 0], [-8, -20], 'oculto')).toBeCloseTo(20, 1);
  });

  it('en la planta, cada circunferencia hasta donde entra en la otra', () => {
    const fuera = 360 - (2 * Math.atan2(8, 6) * 180) / Math.PI;
    expect(gradosDe(planta, [0, 0], 10, 'visto')).toBeCloseTo(fuera, 0);
    expect(gradosDe(planta, [12, 0], 10, 'visto')).toBeCloseTo(fuera, 0);
  });
});

describe('los conos llevan su eje', () => {
  it('el tronco de cono: una cruz en la planta y una línea en el alzado y el perfil', () => {
    const { alzado, planta, perfil } = vistasDe(TRONCO_DE_CONO).vistas;
    expect(ejeSobre(planta, [-13, 0], [13, 0])).toBe(true);
    expect(ejeSobre(planta, [0, -13], [0, 13])).toBe(true);
    expect(ejeSobre(alzado, [0, 3], [0, -23])).toBe(true);
    expect(ejeSobre(perfil, [0, 3], [0, -23])).toBe(true);
  });

  it('un avellanado restado: la cruz llega hasta su radio de 8 y no se queda en el del taladro', () => {
    const { planta } = vistasDe(AVELLANADO).vistas;
    expect(ejeSobre(planta, [9, -20], [31, -20])).toBe(true);
    expect(ejeSobre(planta, [20, -9], [20, -31])).toBe(true);
  });
});

describe('dos cilindros del mismo radio que se cruzan: la X sin huecos', () => {
  it('dos tubos sumados: en el alzado, las dos diagonales de la X enteras y vistas', () => {
    const { alzado } = vistasDe(CRUZ_DE_TUBOS).vistas;
    expect(cubierto(alzado, [-10, -10], [10, -30], 'visto')).toBeCloseTo(Math.hypot(20, 20), 1);
    expect(cubierto(alzado, [10, -10], [-10, -30], 'visto')).toBeCloseTo(Math.hypot(20, 20), 1);
  });

  it('el eje con un taladro de su mismo radio: la X entera y la circunferencia entera en el perfil', () => {
    const { alzado, perfil } = vistasDe(EJE_TALADRADO_IGUAL).vistas;
    expect(cubierto(alzado, [-10, -10], [10, -30], 'visto')).toBeCloseTo(Math.hypot(20, 20), 1);
    expect(cubierto(alzado, [10, -10], [-10, -30], 'visto')).toBeCloseTo(Math.hypot(20, 20), 1);
    expect(gradosDe(perfil, [0, -20], 10, 'visto')).toBeCloseTo(360, 0);
  });

  it('y ningún descarte sin nombres: un punto donde dos superficies se tocan no es una tangencia', () => {
    for (const pieza of [CRUZ_DE_TUBOS, EJE_TALADRADO_IGUAL]) {
      for (const v of Object.values(vistasDe(pieza).vistas)) {
        for (const d of v.descartes) {
          expect(d.primitivas.length, d.mensaje).toBeGreaterThanOrEqual(2);
          expect(d.mensaje).not.toMatch(/«\?»/);
        }
      }
    }
  });
});

describe('taladros con cono: el avellanado y el agujero ciego con punta', () => {
  it('el avellanado: dos circunferencias vistas en la planta, la del borde y la del encuentro', () => {
    const { planta } = vistasDe(AVELLANADO).vistas;
    expect(gradosDe(planta, [20, -20], 8, 'visto')).toBeCloseTo(360, 0);
    expect(gradosDe(planta, [20, -20], 4, 'visto')).toBeCloseTo(360, 0);
  });

  it('el avellanado en el alzado: el taladro, el cono y su encuentro, a trazos', () => {
    const { alzado } = vistasDe(AVELLANADO).vistas;
    expect(cubierto(alzado, [16, 0], [16, -16], 'oculto')).toBeCloseTo(16, 1);
    expect(cubierto(alzado, [24, 0], [24, -16], 'oculto')).toBeCloseTo(16, 1);
    expect(cubierto(alzado, [16, -16], [12, -20], 'oculto')).toBeCloseTo(Math.hypot(4, 4), 1);
    expect(cubierto(alzado, [24, -16], [28, -20], 'oculto')).toBeCloseTo(Math.hypot(4, 4), 1);
    expect(cubierto(alzado, [16, -16], [24, -16], 'oculto')).toBeCloseTo(8, 1);
  });

  it('el agujero ciego: las paredes, el encuentro y la punta de la broca, a trazos', () => {
    const { alzado, planta } = vistasDe(AGUJERO_CIEGO).vistas;
    expect(cubierto(alzado, [15, -10], [15, -30], 'oculto')).toBeCloseTo(20, 1);
    expect(cubierto(alzado, [25, -10], [25, -30], 'oculto')).toBeCloseTo(20, 1);
    expect(cubierto(alzado, [15, -10], [20, -7], 'oculto')).toBeCloseTo(Math.hypot(5, 3), 1);
    expect(cubierto(alzado, [25, -10], [20, -7], 'oculto')).toBeCloseTo(Math.hypot(5, 3), 1);
    expect(cubierto(alzado, [15, -10], [25, -10], 'oculto')).toBeCloseTo(10, 1);
    expect(gradosDe(planta, [20, -20], 5, 'visto')).toBeCloseTo(360, 0);
  });
});

describe('dos cubos que se tocan por una arista o por un vértice', () => {
  const cuadrado = (v: VistaCalculada, u0: number, v0: number) =>
    [
      [
        [u0, v0],
        [u0 + 10, v0],
      ],
      [
        [u0 + 10, v0],
        [u0 + 10, v0 - 10],
      ],
      [
        [u0 + 10, v0 - 10],
        [u0, v0 - 10],
      ],
      [
        [u0, v0 - 10],
        [u0, v0],
      ],
    ].map(([a, b]) => cubierto(v, a as unknown as P2, b as unknown as P2, 'visto'));

  it('por una arista: cada cubo, entero, en las tres vistas', () => {
    const { alzado, planta, perfil } = vistasDe(CONTACTO_POR_ARISTA).vistas;
    for (const lado of [...cuadrado(alzado, 0, 0), ...cuadrado(alzado, 10, -10)]) expect(lado).toBeCloseTo(10, 1);
    for (const lado of [...cuadrado(planta, 0, 0), ...cuadrado(planta, 10, 0)]) expect(lado).toBeCloseTo(10, 1);
    for (const lado of [...cuadrado(perfil, -10, 0), ...cuadrado(perfil, -10, -10)]) expect(lado).toBeCloseTo(10, 1);
  });

  it('por un vértice: lo mismo', () => {
    const { alzado, planta, perfil } = vistasDe(CONTACTO_POR_VERTICE).vistas;
    for (const lado of [...cuadrado(alzado, 0, 0), ...cuadrado(alzado, 10, -10)]) expect(lado).toBeCloseTo(10, 1);
    for (const lado of [...cuadrado(planta, 0, 0), ...cuadrado(planta, 10, -10)]) expect(lado).toBeCloseTo(10, 1);
    for (const lado of [...cuadrado(perfil, -10, 0), ...cuadrado(perfil, -20, -10)]) expect(lado).toBeCloseTo(10, 1);
  });
});

describe('un chaflán sin «dentro», que se quita de la pieza entera', () => {
  it('se ve en el alzado y en la planta, y queda detrás en el perfil', () => {
    const { alzado, planta, perfil } = vistasDe(CHAFLAN_SIN_DENTRO).vistas;
    expect(cubierto(alzado, [35, -20], [40, -15], 'visto')).toBeCloseTo(Math.hypot(5, 5), 1);
    expect(cubierto(planta, [35, 0], [35, -20], 'visto')).toBeCloseTo(20, 1);
    expect(cubierto(perfil, [-20, -15], [0, -15], 'oculto')).toBeCloseTo(20, 1);
  });
});

describe('el mismo plano lo decide la piel de la pieza, no la primitiva', () => {
  it('la pared de la muesca y la cara del lomo siguen el mismo plano: ahí no hay arista', () => {
    const { alzado } = vistasDe(MUESCA_COPLANARIA).vistas;
    expect(cualquiera(alzado, [10, -20], [30, -20])).toBe(0);
    expect(cubierto(alzado, [0, -20], [10, -20], 'visto')).toBeCloseTo(10, 1);
    const [d] = descarteSobre(alzado, [10, -20], [30, -20]);
    expect(d?.motivo).toBe('mismo-plano');
    expect(d?.primitivas).toEqual(expect.arrayContaining(['muesca', 'lomo']));
  });
});

describe('primitivas giradas', () => {
  const { alzado, planta, perfil } = vistasDe(GIRADAS).vistas;
  const gira = (c: P2, a: number, b: number, grados: number): P2 => {
    const t = (grados * Math.PI) / 180;
    return [c[0] + a * Math.cos(t) - b * Math.sin(t), c[1] + a * Math.sin(t) + b * Math.cos(t)];
  };
  /* En la planta, (u, v) = (x, −y). */
  const enPlanta = (p: P2): P2 => [p[0], -p[1]];

  it('la caja girada 30°: su cara de arriba, entera y vista en la planta', () => {
    const esquinas = [
      [-7.5, -5],
      [7.5, -5],
      [7.5, 5],
      [-7.5, 5],
    ].map(([a, b]) => enPlanta(gira([-12.5, 0], a, b, 30)));
    for (let k = 0; k < 4; k++) {
      const [a, b] = [esquinas[k], esquinas[(k + 1) % 4]];
      expect(cubierto(planta, a, b, 'visto'), `lado ${k + 1}`).toBeCloseTo(dist(a, b), 1);
    }
  });

  it('el cilindro girado −30°: sus dos generatrices de contorno, vistas en la planta', () => {
    for (const lado of [-4, 4]) {
      const [a, b] = [gira([12.5, 0], -7.5, lado, -30), gira([12.5, 0], 7.5, lado, -30)].map(enPlanta);
      expect(cubierto(planta, a, b, 'visto')).toBeCloseTo(15, 1);
    }
  });

  it('ninguna astilla: ningún tramo de menos de una erosión', () => {
    for (const v of [alzado, planta, perfil]) {
      for (const t of v.tramos) expect(largoDe(t.forma), JSON.stringify(t.forma)).toBeGreaterThanOrEqual(EROSION);
    }
  });
});

/* ── Los casos de la segunda revisión ─────────────────────────────────── */

describe('dos tubos cuyos ejes se cruzan sin cortarse: la curva de encuentro, entera', () => {
  /* La curva, calculada a mano: en la generatriz θ del vertical, x = 10 cos θ
     e y = 10 sen θ, y corta al horizontal donde (y − d)² + (z − 20)² = r².
     Cerca de donde la generatriz es tangente al horizontal, la curva gira y
     cambia muy deprisa con θ: ahí la arista tenía huecos de 1 a 9 mm. */
  function curva(r: number, d: number): [number, number, number][] {
    const puntos: [number, number, number][] = [];
    for (let k = 0; k < 360 * 8; k++) {
      const t = (k * Math.PI) / (180 * 8);
      const [x, y] = [10 * Math.cos(t), 10 * Math.sin(t)];
      const h = r * r - (y - d) ** 2;
      if (h < 0) continue;
      for (const s of [-1, 1]) puntos.push([x, y, 20 + s * Math.sqrt(h)]);
    }
    return puntos;
  }
  const sinTramo = (v: VistaCalculada, papel: (q: [number, number, number]) => P2, puntos: [number, number, number][]) =>
    puntos.filter((q) => !v.tramos.some((t) => distanciaAForma(papel(q), t.forma) < TOL));

  it.each([
    [10, 3, false],
    [8, 3, false],
    [12, 8, false],
    [15, 5, false],
    [10, 2, true],
  ])('r %s, a %s mm (restado: %s): cada punto de la curva cae en un tramo del alzado y del perfil', (r, d, resta) => {
    const { alzado, perfil } = vistasDe(tubosDescentrados(r, d, resta)).vistas;
    const puntos = curva(r, d);
    const fueraAlzado = sinTramo(alzado, (q) => [q[0], -q[2]], puntos);
    const fueraPerfil = sinTramo(perfil, (q) => [-q[1], -q[2]], puntos);
    expect(fueraAlzado.length, `alzado, el primero: ${fueraAlzado[0]?.map((n) => n.toFixed(2))}`).toBe(0);
    expect(fueraPerfil.length, `perfil, el primero: ${fueraPerfil[0]?.map((n) => n.toFixed(2))}`).toBe(0);
  });
});

describe('lo visto tapa lo oculto, también en una polilínea', () => {
  it('el eje con un pasador: ninguna oculta del alzado cae entera encima de una vista', () => {
    const { alzado } = vistasDe(EJE_CON_PASADOR).vistas;
    const vistos = alzado.tramos.filter((t) => t.tipo === 'visto').map((t) => t.forma);
    const encima = alzado.tramos
      .filter((t) => t.tipo === 'oculto')
      .filter((t) => {
        const L = largoDe(t.forma);
        return [0.1, 0.3, 0.5, 0.7, 0.9].every((f) => {
          const muestra = recorrido(t.forma, f * L);
          return vistos.some((v) => distanciaAForma(muestra, v) < 0.01);
        });
      });
    expect(encima.length, `${encima.length} ocultas de ${alzado.tramos.filter((t) => t.tipo === 'oculto').length}`).toBe(0);
    expect(vistos.length).toBeGreaterThan(0);
  });
});
