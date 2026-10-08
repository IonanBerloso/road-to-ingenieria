import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  PT_MM,
  anguloConPH,
  anguloConPV,
  gira,
  pieEnRecta,
  proyAlzado,
  proyPlanta,
  punto3,
  rectaPorPuntos,
  vm,
  vmAlzado,
  vmPlanta,
  type P2,
  type P3,
} from '../../src/lib/diedrico';
import yaml from 'js-yaml';
import { resuelveEjercicio, type EjercicioConReceta } from '../../src/lib/construir';
import { casaTramo } from '../../src/lib/diedrico-corrige';
import type { DatosLamina } from '../../src/lib/lamina';

/* SD16 y SD17 · los dos ejercicios de giros de la colección de diédrico
   directo (Dpto. de Expresión Gráfica y Proyectos de Ingeniería, EIG,
   UPV/EHU): el Ejercicio 13, las otras dos palas de un molino que gira 120°
   alrededor de un eje de punta, y el Ejercicio 14, un cuadrado y su barra
   tras un giro de 60° de eje vertical (antihorario) y otro de eje de punta
   (horario). Las láminas son `src/content/laminas/sd16.json` y `sd17.json`.

   Las cifras esperadas se sacaron el 1 de octubre de 2026 por un segundo
   camino, sin lib/diedrico, con un guion aparte: el método
   del papel, girando en el plano la vista donde el eje es un punto, con el
   sentido como se ve, y llevando la otra vista en horizontal, porque el giro
   conserva el alejamiento (eje de punta) o la cota (eje vertical). Aquí se
   cotejan con `gira` de lib/diedrico, que gira en el espacio, y se comprueba
   lo que ninguna de las dos cuentas puede fingir: que el giro no deforma la
   figura y que el orden de los dos giros de SD17 importa. */

const mm = (v: number) => v * PT_MM;
const d2 = (a: P2, b: P2) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const cerca = (p: P2, q: readonly [number, number]) => {
  expect(p[0]).toBeCloseTo(q[0], 2);
  expect(p[1]).toBeCloseTo(q[1], 2);
};

describe('SD16 · las otras dos palas del molino', () => {
  const O = punto3([297.6, 359.04], [297.6, 664.92]);
  const P = punto3([297.6, 359.04], [297.6, 590.04]);
  const V: Record<string, P3> = {
    A: punto3([297.6, 198.36], [297.6, 664.92]),
    B: punto3([397.44, 198.36], [397.44, 615.84]),
    C: punto3([347.04, 322.08], [347.04, 640.68]),
    D: punto3([297.6, 322.08], [297.6, 664.92]),
  };
  /* El eje, de O hacia P: hacia el plano vertical. Con esa orientación, el
     ángulo positivo es el antihorario visto en el alzado; la receta llama
     A′B′C′D′ a esa pala (`rama(gira(…, angulo: 120), 1)`). */
  const eje = rectaPorPuntos(O, P);
  const ESPERADO = {
    pala2: {
      A: { alzado: [158.447, 439.38], planta: [158.447, 664.92] },
      B: { alzado: [108.527, 352.916], planta: [108.527, 615.84] },
      C: { alzado: [240.8717, 334.7037], planta: [240.8717, 640.68] },
      D: { alzado: [265.5917, 377.52], planta: [265.5917, 664.92] },
    },
    pala3: {
      A: { alzado: [436.753, 439.38], planta: [436.753, 664.92] },
      B: { alzado: [386.833, 525.844], planta: [386.833, 615.84] },
      C: { alzado: [304.8883, 420.3363], planta: [304.8883, 640.68] },
      D: { alzado: [329.6083, 377.52], planta: [329.6083, 664.92] },
    },
  } as const;

  it('el eje es de punta y O está en la recta AD: la pala arranca del eje', () => {
    expect(eje.d.x).toBeCloseTo(0, 9);
    expect(eje.d.z).toBeCloseTo(0, 9);
    expect(eje.d.y).toBeCloseTo(-1, 9);
    expect(proyAlzado(O)[0]).toBeCloseTo(proyAlzado(V.A)[0], 9);
    expect(proyPlanta(O)[1]).toBeCloseTo(proyPlanta(V.A)[1], 9);
  });

  for (const [pala, angulo] of [['pala2', 120], ['pala3', -120]] as const) {
    it(`${pala}: cada vértice cae donde lo deja el giro en el papel`, () => {
      for (const v of ['A', 'B', 'C', 'D'] as const) {
        const g = gira(V[v], eje, angulo);
        cerca(proyAlzado(g), ESPERADO[pala][v].alzado);
        cerca(proyPlanta(g), ESPERADO[pala][v].planta);
      }
    });

    it(`${pala}: el alejamiento no cambia y el alzado gira alrededor de O₂ con su radio`, () => {
      for (const v of ['A', 'B', 'C', 'D'] as const) {
        const g = gira(V[v], eje, angulo);
        expect(g.y).toBeCloseTo(V[v].y, 9);
        expect(d2(proyAlzado(g), proyAlzado(O))).toBeCloseTo(d2(proyAlzado(V[v]), proyAlzado(O)), 9);
      }
    });

    it(`${pala}: la pala no se deforma (sus lados miden lo mismo)`, () => {
      const g = Object.fromEntries((['A', 'B', 'C', 'D'] as const).map((v) => [v, gira(V[v], eje, angulo)]));
      for (const [p, q] of [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'], ['A', 'C']] as const) {
        expect(vm(g[p], g[q])).toBeCloseTo(vm(V[p], V[q]), 9);
      }
    });
  }

  it('la segunda pala, a la izquierda y por debajo de O₂ (antihorario), con O₂A₂′ a 30° de la horizontal', () => {
    const a = proyAlzado(gira(V.A, eje, 120));
    const o = proyAlzado(O);
    expect(a[0]).toBeLessThan(o[0]);
    expect(a[1]).toBeGreaterThan(o[1]);
    expect((Math.atan2(a[1] - o[1], o[0] - a[0]) * 180) / Math.PI).toBeCloseTo(30, 6);
  });

  it('la tercera pala es la segunda girada otros 120° en el mismo sentido', () => {
    for (const v of ['A', 'B', 'C', 'D'] as const) {
      const dos = gira(gira(V[v], eje, 120), eje, 120);
      const tres = gira(V[v], eje, -120);
      expect(vm(dos, tres)).toBeCloseTo(0, 9);
    }
  });

  it('el radio del giro de B es O₂B₂, y no la verdadera magnitud de OB', () => {
    const r = vm(V.B, pieEnRecta(V.B, eje));
    expect(mm(r)).toBeCloseTo(66.7357, 3);
    expect(mm(vmAlzado(O, V.B))).toBeCloseTo(66.7357, 3);
    expect(mm(vm(O, V.B))).toBeCloseTo(68.9452, 3);
    expect(mm(vmPlanta(O, V.B))).toBeCloseTo(39.247, 3);
  });

  it('B₁″ cae a 10,61 pt de B₁, en su misma horizontal (el imán del Taller)', () => {
    const b = proyPlanta(gira(V.B, eje, -120));
    expect(d2(b, proyPlanta(V.B))).toBeCloseTo(10.607, 2);
    expect(b[1]).toBeCloseTo(proyPlanta(V.B)[1], 9);
  });
});

describe('SD17 · el cuadrado y la barra tras dos giros de 60°', () => {
  const V: Record<string, P3> = {
    A: punto3([416.84, 391.53], [416.84, 575.73]),
    B: punto3([506.24, 391.53], [506.24, 575.73]),
    C: punto3([506.24, 468.81], [506.24, 575.73]),
    D: punto3([416.84, 468.81], [416.84, 575.73]),
    M: punto3([461.6, 468.81], [461.6, 575.73]),
    N: punto3([461.6, 468.81], [461.6, 675.45]),
  };
  const P = punto3([461.6, 294.81], [461.6, 675.45]);
  const Pj = punto3([461.6, 294.81], [461.6, 575.73]);
  /* e, de P hacia abajo (hacia N): ángulo positivo, antihorario visto en la
     planta. j, desde el alejamiento de M hacia el de P (hacia el observador):
     ángulo positivo, horario visto en el alzado. */
  const e = rectaPorPuntos(P, V.N);
  const j = rectaPorPuntos(Pj, P);
  const nombres = ['A', 'B', 'C', 'D', 'M', 'N'] as const;
  const tras1 = Object.fromEntries(nombres.map((v) => [v, gira(V[v], e, 60)])) as Record<(typeof nombres)[number], P3>;
  const tras2 = Object.fromEntries(nombres.map((v) => [v, gira(tras1[v], j, 60)])) as Record<(typeof nombres)[number], P3>;

  const TRAS1 = {
    A: { alzado: [352.8599, 391.53], planta: [352.8599, 664.3533] },
    B: { alzado: [397.5599, 391.53], planta: [397.5599, 586.9306] },
    C: { alzado: [397.5599, 468.81], planta: [397.5599, 586.9306] },
    D: { alzado: [352.8599, 468.81], planta: [352.8599, 664.3533] },
    M: { alzado: [375.2399, 468.81], planta: [375.2399, 625.59] },
    N: { alzado: [461.6, 468.81], planta: [461.6, 675.45] },
  } as const;
  const TRAS2 = {
    A: { alzado: [323.468, 248.9984], planta: [323.468, 664.3533] },
    B: { alzado: [345.818, 287.7097], planta: [345.818, 586.9306] },
    C: { alzado: [278.8916, 326.3497], planta: [278.8916, 586.9306] },
    D: { alzado: [256.5416, 287.6384], planta: [256.5416, 664.3533] },
    M: { alzado: [267.7316, 307.02], planta: [267.7316, 625.59] },
    N: { alzado: [310.9116, 381.81], planta: [310.9116, 675.45] },
  } as const;

  it('e es vertical y j es de punta, y P está en e', () => {
    expect(e.d.z).toBeCloseTo(-1, 9);
    expect(j.d.y).toBeCloseTo(1, 9);
    expect(proyPlanta(P)[0]).toBeCloseTo(proyPlanta(V.N)[0], 9);
    expect(proyPlanta(P)[1]).toBeCloseTo(proyPlanta(V.N)[1], 9);
  });

  it('el «cuadrado» de la figura es un rectángulo de 31,54 × 27,26 mm, frontal', () => {
    expect(mm(vm(V.A, V.B))).toBeCloseTo(31.5383, 3);
    expect(mm(vm(V.A, V.D))).toBeCloseTo(27.2627, 3);
    expect(V.A.y).toBeCloseTo(V.B.y, 9);
  });

  it('tras el primer giro: cada punto donde lo deja el giro de la planta alrededor de N₁', () => {
    for (const v of nombres) {
      cerca(proyAlzado(tras1[v]), TRAS1[v].alzado);
      cerca(proyPlanta(tras1[v]), TRAS1[v].planta);
      expect(tras1[v].z).toBeCloseTo(V[v].z, 9);
    }
  });

  it('el primer giro es antihorario visto desde arriba: M₁′ sube hacia la izquierda de N₁, a 30° de la horizontal', () => {
    const m = proyPlanta(tras1.M);
    const n = proyPlanta(V.N);
    expect(m[0]).toBeLessThan(n[0]);
    expect(m[1]).toBeLessThan(n[1]);
    expect((Math.atan2(n[1] - m[1], n[0] - m[0]) * 180) / Math.PI).toBeCloseTo(30, 6);
  });

  it('en la posición final: cada punto donde lo deja el giro del alzado alrededor de P₂', () => {
    for (const v of nombres) {
      cerca(proyAlzado(tras2[v]), TRAS2[v].alzado);
      cerca(proyPlanta(tras2[v]), TRAS2[v].planta);
      expect(tras2[v].y).toBeCloseTo(tras1[v].y, 9);
    }
  });

  it('el segundo giro es horario visto de frente: N₂″ baja hacia la izquierda de P₂, a 30° de la horizontal', () => {
    const n = proyAlzado(tras2.N);
    const p = proyAlzado(P);
    expect(n[0]).toBeLessThan(p[0]);
    expect(n[1]).toBeGreaterThan(p[1]);
    expect((Math.atan2(n[1] - p[1], p[0] - n[0]) * 180) / Math.PI).toBeCloseTo(30, 6);
  });

  it('la figura no se deforma con los dos giros', () => {
    for (const [p, q] of [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'], ['A', 'C'], ['M', 'N'], ['A', 'N']] as const) {
      expect(vm(tras2[p], tras2[q])).toBeCloseTo(vm(V[p], V[q]), 9);
    }
  });

  it('la barra al final: 48,59° con el plano horizontal, 30° con el vertical y 60° en el alzado', () => {
    const [m, n] = [tras2.M, tras2.N];
    expect(anguloConPH(m, n)).toBeCloseTo(48.5904, 3);
    expect(anguloConPV(m, n)).toBeCloseTo(30, 3);
    const [ma, na] = [proyAlzado(m), proyAlzado(n)];
    expect((Math.atan2(Math.abs(ma[1] - na[1]), Math.abs(ma[0] - na[0])) * 180) / Math.PI).toBeCloseTo(60, 6);
    expect(mm(vm(m, n))).toBeCloseTo(35.179, 3);
  });

  it('el orden de los giros importa: al revés, la figura acaba en otro sitio', () => {
    for (const v of nombres) {
      const alReves = gira(gira(V[v], j, 60), e, 60);
      expect(mm(vm(alReves, tras2[v]))).toBeGreaterThan(20);
    }
  });
});

describe('SD17 · la visibilidad en el Taller (los tramos)', () => {
  /* Lo visto y lo oculto de la posición final, de un cálculo de líneas
     ocultas hecho aparte el 8 de octubre de 2026, sin src/lib: cada arista
     muestreada y mirada por rayos contra la placa (el cuadrado, opaco; la barra
     es una varilla y no tapa nada), y cada cambio afinado por bisección.
     Coordenadas en pt de la lámina. En la planta, la barra va por debajo de la
     placa de M₁″ hasta el lado A₁″D₁″; en el alzado todo se ve, y la barra va en
     la recta del lado CD y coincide con él de M₂″ a C₂″: los dos se parten en
     M₂″ y en C₂″ para que sus tramos no se pisen. */
  const ESPERADOS: [string, string, 'visto' | 'oculto', [number, number], [number, number]][] = [
    ['planta', 'AB', 'visto', [323.47, 664.35], [345.82, 586.93]],
    ['planta', 'BC', 'visto', [345.82, 586.93], [278.89, 586.93]],
    ['planta', 'CD', 'visto', [278.89, 586.93], [256.54, 664.35]],
    ['planta', 'DA', 'visto', [256.54, 664.35], [323.47, 664.35]],
    ['planta', 'MN', 'oculto', [267.73, 625.59], [301.3, 664.35]],
    ['planta', 'MN', 'visto', [301.3, 664.35], [310.91, 675.45]],
    ['alzado', 'AB', 'visto', [323.47, 249], [345.82, 287.71]],
    ['alzado', 'BC', 'visto', [345.82, 287.71], [278.89, 326.35]],
    ['alzado', 'DA', 'visto', [256.54, 287.64], [323.47, 249]],
    ['alzado', 'CD (de D a M)', 'visto', [256.54, 287.64], [267.73, 307.02]],
    ['alzado', 'CD y MN (de M a C)', 'visto', [267.73, 307.02], [278.89, 326.35]],
    ['alzado', 'MN (de C a N)', 'visto', [278.89, 326.35], [310.91, 381.81]],
  ];
  const laminaSd17 = JSON.parse(readFileSync(join(process.cwd(), 'src', 'content', 'laminas', 'sd17.json'), 'utf8')) as DatosLamina;
  const ejercicio = (yaml.load(readFileSync(join(process.cwd(), 'src/content/expresion-grafica/t03-metodos-descriptivos/ejercicios.yaml'), 'utf8')) as {
    ejercicios: EjercicioConReceta[];
  }).ejercicios.find((e) => e.id.startsWith('sd17-'))!;
  const [indice, paso] = [...resuelveEjercicio(ejercicio, laminaSd17).entries()][1];
  const tol = paso.tolerancia;
  const junto = (p: readonly number[], q: readonly number[]) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 0.75;
  const tramoDe = (a: readonly number[], b: readonly number[]) =>
    paso.tramos.find((x) => (junto(x.a, a) && junto(x.b, b)) || (junto(x.a, b) && junto(x.b, a)));

  it('el segundo construir lleva 12 tramos, y son los del cálculo aparte, con su tipo', () => {
    expect(indice).toBe(2);
    expect(paso.tramos).toHaveLength(ESPERADOS.length);
    for (const [vista, arista, tipo, a, b] of ESPERADOS) {
      const t = tramoDe(a, b);
      expect(t, `${vista} ${arista} de (${a}) a (${b})`).toBeDefined();
      expect(t!.tipo, `${vista} ${arista} de (${a}) a (${b})`).toBe(tipo);
    }
  });

  it('el Taller da por buena esa visibilidad, tramo a tramo y de un tirón donde no cambia', () => {
    for (const [, , tipo, a, b] of ESPERADOS) expect(casaTramo(a, b, tipo, paso.tramos, tol).que).toBe('bien');
    // en el alzado, el lado D₂″C₂″ entero y la barra M₂″N₂″ entera, cada uno de un tirón
    expect(casaTramo([256.54, 287.64], [278.89, 326.35], 'visto', paso.tramos, tol).que).toBe('bien');
    expect(casaTramo([267.73, 307.02], [310.91, 381.81], 'visto', paso.tramos, tol).que).toBe('bien');
  });

  it('y rechaza una arista cambiada de tipo, con el porqué de su tramo', () => {
    // la barra de la planta entera en continua: el tramo de debajo de la placa va a trazos
    const mn = casaTramo([267.73, 625.59], [310.91, 675.45], 'visto', paso.tramos, tol);
    expect(mn.que).toBe('tipo');
    if (mn.que === 'tipo') expect(paso.tramos[mn.tramo].porque).toMatch(/La placa la tapa/);
    // el lado D₁″A₁″ a trazos: se ve entero
    expect(casaTramo([256.54, 664.35], [323.47, 664.35], 'oculto', paso.tramos, tol).que).toBe('tipo');
    // y cortado donde no cambia nada
    expect(casaTramo([256.54, 664.35], [290, 664.35], 'visto', paso.tramos, tol).que).toBe('corte');
  });
});
