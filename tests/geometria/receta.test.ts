import { describe, expect, it } from 'vitest';
import sd1 from '../../src/content/laminas/sd1.json';
import { PT_MM, corteConSegmentos } from '../../src/lib/diedrico';
import { cumple } from '../../src/lib/diedrico-corrige';
import { analiza, compilaObjetivo, compilaPredicado, evaluaReceta, type Lamina } from '../../src/lib/diedrico-receta';
import { laminaDe, type DatosLamina } from '../../src/lib/lamina';

/* Las recetas de Expresión Gráfica: la solución de una lámina escrita como
   DATOS en el YAML y evaluada con lib/diedrico en el build (brief del 8 de
   septiembre de 2026, §3.2). Aquí se prueban con SD1, la gota sobre el tejado,
   cuyos valores de referencia ya fija tests/geometria/sd1.test.ts.

   La lámina es la de src/content/laminas/sd1.json, la misma que publica el
   sitio, cotejada con el PDF el 27 de septiembre de 2026: si alguien la toca,
   esta prueba dice si la solución sigue siendo la del piloto. */
const SD1: Lamina = laminaDe(sd1 as unknown as DatosLamina);
const P1 = { L: SD1.puntos.L1, T: SD1.puntos.T1, R: SD1.puntos.R1, B: SD1.puntos.B1 };

const ESCENA = {
  suelo: 'linea(figura.segmento("suelo"))',
  L: 'punto3(alzado: figura.punto("L2"), planta: figura.punto("L1"))',
  T: 'punto3(alzado: figura.punto("T2"), planta: figura.punto("T1"))',
  R: 'punto3(alzado: figura.punto("R2"), planta: figura.punto("R1"))',
  B: 'punto3(alzado: figura.punto("B2"), planta: figura.punto("B1"))',
  tejado: 'plano(L, T, R)',
  aleros: '[segmento3(L, B), segmento3(R, B)]',
};

const SOLUCION = {
  P: 'punto_en_plano(alzado: figura.punto("P2"), plano: tejado)',
  bajada: 'lmp(tejado, por: P, sentido: descendente)',
  Q: 'corte(bajada, aleros)',
  G: 'vertical_hasta(Q, suelo)',
  vm_PQ_mm: 'en_mm(vm(P, Q))',
};

/* Lo que el enunciado da por hecho y el build comprueba: aquí, que el cuarto
   vértice está en el plano de los otros tres. */
const COMPRUEBA = ['en_plano(B, tejado)'];

const r = evaluaReceta(SD1, { escena: ESCENA, solucion: SOLUCION, comprueba: COMPRUEBA });
const cerca = (a: readonly number[], b: readonly number[], tol = 0.01) =>
  a.forEach((v, i) => expect(Math.abs(v - b[i]), `${a} frente a ${b}`).toBeLessThanOrEqual(tol));

describe('el analizador', () => {
  it('lee llamadas con argumentos por posición y por nombre, listas y referencias a la lámina', () => {
    const a = analiza('f(1, x: [a, "b"], figura.punto("P2"))');
    expect(a).toMatchObject({ tipo: 'llamada', nombre: 'f' });
  });

  it('lee la negación y la conjunción de los diagnósticos', () => {
    expect(analiza('!en_vertical_de(Q1)')).toMatchObject({ tipo: 'no' });
    expect(analiza('a(1) && b(2)')).toMatchObject({ tipo: 'y' });
  });

  it('dice dónde se equivoca una receta mal escrita', () => {
    expect(() => analiza('plano(L, T')).toThrow(/falta «\)»/);
    expect(() => analiza('plano(L,, T)')).toThrow(/no esperaba «,»/);
  });
});

describe('la receta de SD1 reproduce su solución', () => {
  it('P₁, Q₁, Q₂ y G₂, como los fija la prueba de SD1', () => {
    cerca(r.planta('P'), [309.12, 438.13]);
    cerca(r.planta('Q'), [280.73, 561.89]);
    cerca(r.alzado('Q'), [280.73, 318.89]);
    cerca(r.alzado('G'), [280.73, 341.64]);
  });

  it('y la verdadera magnitud del tramo sobre el tejado, en mm', () => {
    expect(r.numero('vm_PQ_mm')).toBeCloseTo(55.04, 2);
  });

  it('y lo que el enunciado da por hecho, si no se cumple, para el build', () => {
    /* Un punto inventado lejos del tejado: la comprobación tiene que fallar
       diciendo cuál, y a cuánto queda del plano. */
    const conIntruso: Lamina = { ...SD1, puntos: { ...SD1.puntos, X1: [300, 500], X2: [300, 200] } };
    expect(() =>
      evaluaReceta(conIntruso, {
        escena: { ...ESCENA, X: 'punto3(alzado: figura.punto("X2"), planta: figura.punto("X1"))' },
        solucion: {},
        comprueba: ['en_plano(X, tejado)'],
      }),
    ).toThrow(/comprueba «en_plano\(X, tejado\)»: no se cumple/);
  });
});

describe('una receta que no evalúa no pasa en silencio', () => {
  it('un nombre que no existe', () => {
    expect(() => evaluaReceta(SD1, { escena: ESCENA, solucion: { X: 'plano(L, T, Z)' } })).toThrow(
      /solucion\.X: no hay nada que se llame «Z»/,
    );
  });

  it('una función que no existe', () => {
    expect(() => evaluaReceta(SD1, { escena: ESCENA, solucion: { X: 'gira(L)' } })).toThrow(
      /solucion\.X: la función «gira» no existe/,
    );
  });

  it('un punto o un segmento que la lámina no tiene', () => {
    expect(() => evaluaReceta(SD1, { escena: { A: 'figura.punto("Z9")' }, solucion: {} })).toThrow(
      /escena\.A: la lámina no tiene el punto «Z9»/,
    );
  });

  it('un argumento de tipo equivocado', () => {
    expect(() => evaluaReceta(SD1, { escena: ESCENA, solucion: { X: 'plano(L, T, suelo)' } })).toThrow(
      /solucion\.X: plano\(\) espera un punto del espacio/,
    );
  });

  it('una errata en un sentido no se convierte en otra cosa', () => {
    expect(() =>
      evaluaReceta(SD1, { escena: ESCENA, solucion: { P: SOLUCION.P, l: 'lmp(tejado, por: P, sentido: descendiente)' } }),
    ).toThrow(/no hay nada que se llame «descendiente»/);
  });

  /* Las tres de la revisión del 27 de septiembre de 2026: un argumento de
     más se perdía en silencio, uno repetido se quedaba con el segundo, y uno
     con un nombre que la función no tiene no avisaba. */
  it('un argumento de más', () => {
    expect(() => evaluaReceta(SD1, { escena: ESCENA, solucion: { X: 'plano(L, T, R, B)' } })).toThrow(
      /solucion\.X: plano\(\) espera 3 argumentos por posición, y ha recibido 4/,
    );
  });

  it('un argumento por nombre repetido', () => {
    expect(() =>
      evaluaReceta(SD1, {
        escena: ESCENA,
        solucion: { X: 'punto_en_plano(alzado: figura.punto("L2"), alzado: figura.punto("T2"), plano: tejado)' },
      }),
    ).toThrow(/«alzado:» aparece dos veces/);
  });

  it('un argumento por nombre que la función no tiene, o uno que le falta', () => {
    expect(() =>
      evaluaReceta(SD1, { escena: ESCENA, solucion: { P: SOLUCION.P, l: 'lmp(tejado, por: P, sentdo: descendente)' } }),
    ).toThrow(/lmp\(\) no tiene el argumento «sentdo:»/);
    expect(() => evaluaReceta(SD1, { escena: ESCENA, solucion: { P: SOLUCION.P, l: 'lmp(tejado, por: P)' } })).toThrow(
      /lmp\(\) necesita «sentido:»/,
    );
  });

  it('solucion.X y escena.X dicen de qué bloque es cada cosa', () => {
    expect(() => compilaObjetivo('proy_planta(solucion.L)', SD1, r)).toThrow(/«solucion\.L» no existe: «L» es de la escena/);
    expect(() => compilaObjetivo('proy_planta(escena.L)', SD1, r)).not.toThrow();
  });
});

describe('los objetivos y los diagnósticos, como los usará el taller', () => {
  const OBJETIVOS = ['P1', 'Q1', 'Q2', 'G2'];

  it('un objetivo se compila a la posición que el alumno tiene que marcar', () => {
    const q1 = compilaObjetivo('proy_planta(solucion.Q)', SD1, r);
    expect(q1.eleccion).toBeUndefined();
    expect(q1.ramas).toEqual([[expect.any(Array)]]);
    cerca(q1.ramas[0][0], [280.73, 561.89]);
  });

  it('un objetivo que no evalúa dice cuál es', () => {
    expect(() => compilaObjetivo('figura.punto("NOPE")', SD1, r)).toThrow(
      /objetivo «figura\.punto\("NOPE"\)»: la lámina no tiene el punto «NOPE»/,
    );
    expect(() => compilaObjetivo('solucion.vm_PQ_mm', SD1, r)).toThrow(/un objetivo espera un punto de la lámina, y ha recibido un número/);
  });

  it('un diagnóstico se compila a geometría y se evalúa sobre el punto marcado', () => {
    const tol = 0.7 / PT_MM;
    const d = compilaPredicado('en_vertical_de(figura.punto("P2"))', SD1, r, OBJETIVOS);
    expect(cumple(d, [309.12, 500], {}, tol)).toBe(true);
    expect(cumple(d, [330, 500], {}, tol)).toBe(false);
  });

  it('el de «la gota no sube»: en la l.m.p., pero en un borde alto del tejado', () => {
    const tol = 0.7 / PT_MM;
    const d = compilaPredicado(
      'en_recta(proy_planta(solucion.bajada)) && en_segmento(figura.segmento("LT1"), figura.segmento("TR1"))',
      SD1,
      r,
      OBJETIVOS,
    );
    /* La l.m.p. por P₁ recorrida hacia ARRIBA corta uno de los bordes altos,
       L₁T₁ o T₁R₁: ese punto cumple las dos condiciones. Q₁, en el alero, no. */
    const [p, q] = [r.planta('P'), r.planta('Q')];
    const sube = [p[0] - q[0], p[1] - q[1]] as const;
    const golpe = corteConSegmentos(p, sube, [
      [P1.L, P1.T],
      [P1.T, P1.R],
    ]);
    expect(golpe).not.toBeNull();
    expect(cumple(d, golpe!.punto, {}, tol)).toBe(true);
    expect(cumple(d, q, {}, tol)).toBe(false);
  });

  it('las referencias a lo que el alumno ya marcó se resuelven al evaluar, no al compilar', () => {
    const tol = 0.7 / PT_MM;
    const d = compilaPredicado('!en_vertical_de(Q1)', SD1, r, OBJETIVOS);
    expect(cumple(d, [280.73, 300], { Q1: [280.73, 561.89] }, tol)).toBe(false);
    expect(cumple(d, [250, 300], { Q1: [280.73, 561.89] }, tol)).toBe(true);
    /* Sin Q₁ marcado todavía, la referencia no se cumple ni se niega: el
       diagnóstico no aplica, y se pasa al siguiente. */
    expect(cumple(d, [250, 300], {}, tol)).toBe(false);
  });

  it('«siempre» es el último diagnóstico y siempre se cumple', () => {
    expect(cumple(compilaPredicado('siempre', SD1, r, OBJETIVOS), [0, 0], {}, 1)).toBe(true);
  });

  it('el pie de la perpendicular: el error de trazarla al alero y no a las horizontales', () => {
    const tol = 0.7 / PT_MM;
    const d = compilaPredicado('es_pie_perpendicular(desde: P1, sobre: figura.segmento("RB1"))', SD1, r, OBJETIVOS);
    const p = r.planta('P');
    /* El pie de la perpendicular desde P₁ al alero R₁B₁, calculado aparte. */
    const [a, b] = [P1.R, P1.B];
    const u = [b[0] - a[0], b[1] - a[1]];
    const s = ((p[0] - a[0]) * u[0] + (p[1] - a[1]) * u[1]) / (u[0] ** 2 + u[1] ** 2);
    const pie = [a[0] + s * u[0], a[1] + s * u[1]] as const;
    expect(cumple(d, pie, { P1: p }, tol)).toBe(true);
    expect(cumple(d, r.planta('Q'), { P1: p }, tol)).toBe(false);
  });

  it('el pie sobre un segmento de longitud cero no compila: nunca podría cumplirse', () => {
    const conPunto: Lamina = { ...SD1, segmentos: { ...SD1.segmentos, cero: [P1.R, P1.R] } };
    expect(() =>
      compilaPredicado('es_pie_perpendicular(desde: P1, sobre: figura.segmento("cero"))', conPunto, r, OBJETIVOS),
    ).toThrow(/longitud cero/);
  });

  it('un diagnóstico que no existe, o con los argumentos mal, dice cuál', () => {
    expect(() => compilaPredicado('en_vertical(Q1)', SD1, r, OBJETIVOS)).toThrow(
      /diagnóstico «en_vertical\(Q1\)»: el diagnóstico «en_vertical» no existe/,
    );
    expect(() => compilaPredicado('en_vertical_de(Q1, P1)', SD1, r, OBJETIVOS)).toThrow(
      /en_vertical_de\(\) espera 1 argumento por posición, y ha recibido 2/,
    );
  });
});

/* Las funciones que pide SD4, el poste y sus tres cables: la verdadera
   magnitud por abatimiento y la pendiente. Con el cable AB del piloto, cuyos
   valores fija tests/geometria/sd4.test.ts; la lámina va en línea hasta que
   SD4 entre en la colección. */
describe('el abatimiento y la pendiente, para SD4', () => {
  const SD4: Lamina = {
    puntos: {
      A1: [168, 447.48], A2: [168, 381],
      B1: [273.84, 496.08], B2: [273.84, 268.92],
      /* Lo alto y lo bajo del eje del poste: la misma planta. */
      Arriba1: [297.48, 496.08], Arriba2: [297.48, 261.84],
      Abajo1: [297.48, 496.08], Abajo2: [297.48, 403.92],
    },
    segmentos: {},
  };
  const escena = {
    A: 'punto3(alzado: figura.punto("A2"), planta: figura.punto("A1"))',
    B: 'punto3(alzado: figura.punto("B2"), planta: figura.punto("B1"))',
  };
  const r4 = evaluaReceta(SD4, {
    escena,
    solucion: {
      B0: 'abatido_planta(A, B)',
      B0_alzado: 'abatido_alzado(A, B)',
      dz_AB_mm: 'en_mm(diferencia_de_cotas(A, B))',
      pend_AB: 'pendiente(A, B)',
    },
  });
  const dist = (a: readonly number[], b: readonly number[]) => Math.hypot(a[0] - b[0], a[1] - b[1]);

  it('la diferencia de cotas y la pendiente de AB, las del piloto', () => {
    expect(r4.numero('dz_AB_mm')).toBeCloseTo(39.5393, 3);
    expect(r4.numero('pend_AB')).toBeCloseTo(0.96235, 5);
  });

  it('B abatido sobre la planta: los dos lados, y los dos a la verdadera magnitud de A₁', () => {
    const b0 = r4.valores.get('B0');
    expect(b0?.k).toBe('lista');
    if (b0?.k !== 'lista') return;
    expect(b0.v).toHaveLength(2);
    for (const lado of b0.v) {
      expect(lado.k).toBe('p2');
      if (lado.k === 'p2') expect(dist(SD4.puntos.A1, lado.v) * PT_MM).toBeCloseTo(57.0214, 3);
    }
  });

  it('y sobre el alzado, a la misma verdadera magnitud de A₂', () => {
    const b0 = r4.valores.get('B0_alzado');
    if (b0?.k !== 'lista') throw new Error('B0_alzado tendría que ser una lista');
    for (const lado of b0.v) if (lado.k === 'p2') expect(dist(SD4.puntos.A2, lado.v) * PT_MM).toBeCloseTo(57.0214, 3);
  });

  it('un abatido es una lista y no una elección: el lado no cambia nada de lo que viene después', () => {
    /* Así un objetivo acepta todos los abatidos que valen —de B o de A, a un
       lado o al otro, en la planta o en el alzado— sin fijar ninguna rama. */
    const todos = compilaObjetivo('[abatido_planta(A, B), abatido_planta(B, A), abatido_alzado(A, B), abatido_alzado(B, A)]', SD4, r4);
    expect(todos.eleccion).toBeUndefined();
    expect(todos.ramas).toHaveLength(1);
    expect(todos.ramas[0]).toHaveLength(8);
  });

  it('la pendiente de una recta vertical no existe, y lo dice', () => {
    expect(() =>
      evaluaReceta(SD4, {
        escena: {
          arriba: 'punto3(alzado: figura.punto("Arriba2"), planta: figura.punto("Arriba1"))',
          abajo: 'punto3(alzado: figura.punto("Abajo2"), planta: figura.punto("Abajo1"))',
        },
        solucion: { p: 'pendiente(arriba, abajo)' },
      }),
    ).toThrow(/solucion\.p: pendiente\(\): la recta es vertical/);
  });
});
