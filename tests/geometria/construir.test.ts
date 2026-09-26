import { describe, expect, it } from 'vitest';
import sd1 from '../../src/content/laminas/sd1.json';
import { PT_MM } from '../../src/lib/diedrico';
import { acierta, cumple } from '../../src/lib/diedrico-corrige';
import { evaluaReceta, type Lamina } from '../../src/lib/diedrico-receta';
import { cuadraConLaReceta, resuelveConstruir, rotuloDe, type ConstruirDeclarado } from '../../src/lib/construir';
import { laminaDe, type DatosLamina } from '../../src/lib/lamina';

/* El paso `construir`, resuelto: SD1 con los objetivos y diagnósticos del
   ejemplo del brief (sd1-ejemplo.yaml), cada error con un punto que lo comete.
   La comprobación de los ejemplos es la de §16 —mirarlo fallando a
   propósito— hecha sin navegador. */

const SD1: Lamina = laminaDe(sd1 as unknown as DatosLamina);
const r = evaluaReceta(SD1, {
  escena: {
    suelo: 'linea(figura.segmento("suelo"))',
    L: 'punto3(alzado: figura.punto("L2"), planta: figura.punto("L1"))',
    T: 'punto3(alzado: figura.punto("T2"), planta: figura.punto("T1"))',
    R: 'punto3(alzado: figura.punto("R2"), planta: figura.punto("R1"))',
    B: 'punto3(alzado: figura.punto("B2"), planta: figura.punto("B1"))',
    tejado: 'plano(L, T, R)',
    aleros: '[segmento3(L, B), segmento3(R, B)]',
  },
  solucion: {
    P: 'punto_en_plano(alzado: figura.punto("P2"), plano: tejado)',
    bajada: 'lmp(tejado, por: P, sentido: descendente)',
    Q: 'corte(bajada, aleros)',
    G: 'vertical_hasta(Q, suelo)',
    vm_PQ_mm: 'en_mm(vm(P, Q))',
  },
  comprueba: ['en_plano(B, tejado)'],
});

const PASO: ConstruirDeclarado = {
  titulo: 'Construir la trayectoria',
  intro: 'Marca P₁, donde la gota deja el tejado en las dos vistas, y donde toca el suelo.',
  herramientas: ['punto', 'recta', 'paralela', 'perpendicular', 'vertical', 'horizontal', 'medir'],
  tolerancia: 0.7,
  objetivos: [
    {
      nombre: 'P1',
      pide: 'la gota, en la planta',
      es: 'proy_planta(solucion.P)',
      bien: 'P₁ está bajo P₂ y sobre una recta del tejado.',
      diagnosticos: [
        { si: 'en_vertical_de(figura.punto("P2"))', mensaje: 'Está bajo P₂, pero no en el tejado.', ejemplo: 'desplaza(proy_planta(solucion.P), dy: mm(10))' },
        { si: 'siempre', mensaje: 'Las dos proyecciones de un punto van en la misma vertical.', ejemplo: 'desplaza(proy_planta(solucion.P), dx: mm(10))' },
      ],
    },
    {
      nombre: 'Q1',
      pide: 'donde deja el tejado, en la planta',
      es: 'proy_planta(solucion.Q)',
      bien: 'Q₁ está en el alero, al final de la l.m.p. por P₁.',
      diagnosticos: [
        {
          si: 'en_recta(proy_planta(solucion.bajada)) && en_segmento(figura.segmento("LT1"), figura.segmento("TR1"))',
          mensaje: 'La gota no sube: la l.m.p. se recorre hacia abajo.',
          ejemplo: 'proy_planta(corte(lmp(tejado, por: solucion.P, sentido: ascendente), [segmento3(L, T), segmento3(T, R)]))',
        },
        {
          si: 'es_pie_perpendicular(desde: P1, sobre: figura.segmento("RB1"))',
          mensaje: 'Has trazado la perpendicular al alero, no a las horizontales.',
          ejemplo: 'pie_perpendicular(proy_planta(solucion.P), figura.segmento("RB1"))',
        },
        { si: 'en_segmento(figura.segmento("BL1"))', mensaje: 'Ese es el alero izquierdo: la l.m.p. no llega.', ejemplo: 'punto_medio(figura.segmento("BL1"))' },
        {
          si: 'en_recta(proy_planta(solucion.bajada))',
          mensaje: 'Vas por la l.m.p., pero la gota deja el tejado en el alero.',
          ejemplo: 'punto_medio(proy_planta(segmento3(solucion.P, solucion.Q)))',
        },
        { si: 'siempre', mensaje: 'Q₁: en la l.m.p. por P₁ y en el alero.' },
      ],
    },
    {
      nombre: 'Q2',
      pide: 'donde deja el tejado, en el alzado',
      es: 'proy_alzado(solucion.Q)',
      bien: 'Q₂ en el alero, en la vertical de Q₁.',
      diagnosticos: [
        { si: '!en_vertical_de(Q1)', mensaje: 'Q₂ va en la vertical de Q₁.', ejemplo: 'proy_alzado(solucion.P)' },
        { si: 'siempre', mensaje: 'En la vertical de Q₁, pero no sobre el alero.', ejemplo: 'desplaza(proy_alzado(solucion.Q), dy: mm(8))' },
      ],
    },
    {
      nombre: 'G2',
      pide: 'donde toca el suelo, en el alzado',
      es: 'proy_alzado(solucion.G)',
      bien: 'La gota cae en vertical hasta el suelo.',
      diagnosticos: [
        { si: '!en_vertical_de(Q2)', mensaje: 'La gota cae en vertical desde Q.', ejemplo: 'desplaza(proy_alzado(solucion.G), dx: mm(10))' },
        { si: 'siempre', mensaje: 'Cae hasta el suelo.', ejemplo: 'desplaza(proy_alzado(solucion.G), dy: mm(-10))' },
      ],
    },
  ],
  trazado: ['proy_alzado(segmento3(solucion.P, solucion.Q))', 'proy_alzado(segmento3(solucion.Q, solucion.G))', 'proy_planta(segmento3(solucion.P, solucion.Q))'],
  pista: '(1) horizontal por P₂; (2) bájala a la planta; (3) P₁; (4) la l.m.p.; (5) Q₁, Q₂ y G₂.',
  desarrollo: 'La trayectoria calculada, encima del trazado.',
};

/** Con una línea del paso cambiada. */
const conDiagnosticos = (objetivo: string, diagnosticos: ConstruirDeclarado['objetivos'][number]['diagnosticos']) => ({
  ...PASO,
  objetivos: PASO.objetivos.map((o) => (o.nombre === objetivo ? { ...o, diagnosticos } : o)),
});

describe('el paso construir de SD1, resuelto', () => {
  const paso = resuelveConstruir(PASO, SD1, r);

  it('compila cada objetivo a la posición buena, con su rótulo y la tolerancia en pt', () => {
    expect(paso.objetivos.map((o) => o.rotulo)).toEqual(['P₁', 'Q₁', 'Q₂', 'G₂']);
    expect(paso.tolerancia).toBeCloseTo(0.7 / PT_MM, 12);
    const q1 = paso.objetivos[1].es;
    expect(acierta(q1, [280.73, 561.89], {}, paso.tolerancia)).toEqual({ bien: true });
  });

  it('y cada diagnóstico a su árbol, que la página evalúa', () => {
    const q2 = paso.objetivos[2];
    expect(cumple(q2.diagnosticos[0].si, [300, 318.89], { Q1: [280.73, 561.89] }, paso.tolerancia)).toBe(true);
  });

  it('el trazado de la solución: tres segmentos, sin elección', () => {
    expect(paso.trazado).toHaveLength(3);
    for (const t of paso.trazado) expect(t.eleccion).toBeUndefined();
  });

  it('un diagnóstico tapado por otro anterior no llega a publicarse', () => {
    const [sube, pie, izquierdo, lmp, siempre] = PASO.objetivos[1].diagnosticos;
    /* La l.m.p. sola, delante de «la gota no sube», se lo quedaría todo. */
    expect(() => resuelveConstruir(conDiagnosticos('Q1', [lmp, sube, pie, izquierdo, siempre]), SD1, r)).toThrow(
      /objetivo «Q1», diagnóstico 2 \(«en_recta.*»\): su ejemplo lo recoge antes el diagnóstico 1/,
    );
  });

  it('un ejemplo que es la solución buena, o que no recoge nadie, tampoco', () => {
    const [primero, siempre] = PASO.objetivos[0].diagnosticos;
    expect(() =>
      resuelveConstruir(conDiagnosticos('P1', [{ ...primero, ejemplo: 'proy_planta(solucion.P)' }, siempre]), SD1, r),
    ).toThrow(/objetivo «P1», diagnóstico 1 .*: su ejemplo se da por bueno/);
    expect(() =>
      resuelveConstruir(conDiagnosticos('P1', [{ ...primero, ejemplo: 'desplaza(proy_planta(solucion.P), dx: mm(10))' }, siempre]), SD1, r),
    ).toThrow(/objetivo «P1», diagnóstico 1 .*: su ejemplo lo recoge antes el diagnóstico 2|no lo recoge ningún diagnóstico/);
  });

  it('una expresión que no evalúa dice en qué objetivo y en qué diagnóstico', () => {
    const [primero, siempre] = PASO.objetivos[0].diagnosticos;
    expect(() => resuelveConstruir(conDiagnosticos('P1', [{ ...primero, si: 'en_vertical_de(Z1)' }, siempre]), SD1, r)).toThrow(
      /objetivo «P1», diagnóstico 1: diagnóstico «en_vertical_de\(Z1\)»: no hay nada que se llame «Z1»/,
    );
    expect(() => resuelveConstruir({ ...PASO, objetivos: [{ ...PASO.objetivos[0], es: 'proy_planta(solucion.X)' }] }, SD1, r)).toThrow(
      /objetivo «P1»: objetivo «proy_planta\(solucion\.X\)»: no hay nada que se llame «solucion\.X»/,
    );
  });
});

describe('los números de un calcular, atados a la receta', () => {
  it('una cifra es la de la receta redondeada como está escrita', () => {
    expect(cuadraConLaReceta('55.04', 55.0418)).toBe(true);
    expect(cuadraConLaReceta('55,04 mm', 55.0418)).toBe(true);
    expect(cuadraConLaReceta('55', 55.0418)).toBe(true);
    expect(cuadraConLaReceta('55.1', 55.0418)).toBe(false);
    expect(cuadraConLaReceta('55.05', 55.0418)).toBe(false);
    expect(cuadraConLaReceta('cincuenta', 55.0418)).toBe(false);
  });

  it('el valor de SD1 sale de su receta', () => {
    expect(cuadraConLaReceta('55.04', r.numero('vm_PQ_mm'))).toBe(true);
  });
});

describe('rótulos', () => {
  it('las cifras del final son subíndices', () => {
    expect(rotuloDe('P1')).toBe('P₁');
    expect(rotuloDe('B12')).toBe('B₁₂');
    expect(rotuloDe('Bab')).toBe('Bab');
  });
});

/* SD5, con su elección: el ejemplo del cuadrado cruzado escoge la rama que no
   se ha elegido. Con la lámina en línea, como en elecciones.test.ts, hasta
   que SD5 entre en la colección. */
const SD5: Lamina = {
  puntos: { A1: [226.68, 519.36], A2: [226.68, 368.4] },
  segmentos: {
    'r2≡s2': [[197.28, 385.44], [376.92, 281.64]],
    r1: [[197.28, 448.44], [376.92, 448.44]],
    s1: [[197.28, 519.36], [376.92, 519.36]],
  },
};
const r5 = evaluaReceta(SD5, {
  escena: {
    r: 'recta3(alzado: figura.segmento("r2≡s2"), planta: figura.segmento("r1"))',
    s: 'recta3(alzado: figura.segmento("r2≡s2"), planta: figura.segmento("s1"))',
    A: 'punto3(alzado: figura.punto("A2"), planta: figura.punto("A1"))',
  },
  solucion: {
    D: 'pie_perpendicular(A, r)',
    lado: 'vm(A, D)',
    B: 'punto_a_distancia(s, desde: A, distancia: lado)',
    C: 'pie_perpendicular(B, r)',
  },
});

describe('un paso con elección: SD5', () => {
  const B2 = {
    nombre: 'B2',
    pide: 'el otro extremo del lado sobre s, en el alzado',
    es: 'proy_alzado(solucion.B)',
    bien: 'B₂ sobre s₂, a la longitud del lado.',
    diagnosticos: [{ si: 'siempre', mensaje: 'B₂ va sobre s₂, a la longitud del lado desde A₂.' }],
  };
  const C1 = (ejemplo: string) => ({
    nombre: 'C1',
    pide: 'el vértice opuesto a A, en la planta',
    es: 'proy_planta(solucion.C)',
    bien: 'C₁ sobre r₁, en la vertical de B₁.',
    diagnosticos: [
      { si: 'en_recta(figura.segmento("r1")) && cerca_de(otra_rama(proy_planta(solucion.C)))', mensaje: 'Has cerrado el cuadrado cruzado.', ejemplo },
      { si: 'siempre', mensaje: 'C₁: sobre r₁ y en la vertical de B₁.' },
    ],
  });
  const paso = (ejemplo: string): ConstruirDeclarado => ({ ...PASO, objetivos: [B2, C1(ejemplo)], trazado: [] });

  it('el cuadrado cruzado es la otra rama de C, con B₂ ya marcado en la primera', () => {
    const resuelto = resuelveConstruir(paso('proy_planta(rama(solucion.C, 2))'), SD5, r5);
    expect(resuelto.objetivos[1].es.eleccion).toBe('B');
  });

  it('y con la rama equivocada, el ejemplo es la solución buena', () => {
    expect(() => resuelveConstruir(paso('proy_planta(rama(solucion.C, 1))'), SD5, r5)).toThrow(/se da por bueno/);
  });

  it('un ejemplo que depende de la elección sin escoger rama no es un punto', () => {
    expect(() => resuelveConstruir(paso('proy_planta(solucion.C)'), SD5, r5)).toThrow(/escoge la rama con rama\(\)/);
  });

  it('rama() cuenta desde 1 y no se sale', () => {
    expect(() => resuelveConstruir(paso('proy_planta(rama(solucion.C, 3))'), SD5, r5)).toThrow(/tiene 2 ramas, y se ha pedido la 3/);
  });
});

describe('dos ramas que no se distinguen', () => {
  it('rompen el build: una marca entre las dos no diría cuál', () => {
    /* B a 1 pt de A por cada lado: las dos ramas quedan a 2 pt, menos de dos
       tolerancias de 0,7 mm (4 pt). */
    const casi = evaluaReceta(SD5, {
      escena: {
        s: 'recta3(alzado: figura.segmento("r2≡s2"), planta: figura.segmento("s1"))',
        A: 'punto3(alzado: figura.punto("A2"), planta: figura.punto("A1"))',
      },
      solucion: { B: 'punto_a_distancia(s, desde: A, distancia: 1)' },
    });
    const objetivo = { nombre: 'B2', pide: 'un punto casi encima de A', es: 'proy_alzado(solucion.B)', bien: 'Bien, B₂.', diagnosticos: [{ si: 'siempre', mensaje: 'B₂ va sobre s₂.' }] };
    expect(() => resuelveConstruir({ ...PASO, objetivos: [objetivo], trazado: [] }, SD5, casi)).toThrow(
      /sus ramas 1 y 2 caen a menos de dos tolerancias/,
    );
  });
});
