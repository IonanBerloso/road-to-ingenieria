import { describe, expect, it } from 'vitest';
import sd1 from '../../src/content/laminas/sd1.json';
import { PT_MM } from '../../src/lib/diedrico';
import { acierta, cumple } from '../../src/lib/diedrico-corrige';
import { evaluaNumero, evaluaReceta, type Lamina } from '../../src/lib/diedrico-receta';
import {
  cuadraConLaReceta,
  resuelveConstruir,
  resuelveEjercicio,
  rotuloDe,
  type ConstruirDeclarado,
  type EjercicioConReceta,
} from '../../src/lib/construir';
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

  it('un «siempre» antes del último taparía a los de detrás, aunque no lleven ejemplo', () => {
    /* El último no necesita `ejemplo`, así que la comprobación de los ejemplos
       no lo vería nunca tapado: se dice aparte (revisión del 27 de septiembre
       de 2026). */
    const [primero, siempre] = PASO.objetivos[0].diagnosticos;
    const otro = { si: 'siempre', mensaje: 'Otro «siempre», que no se vería nunca.' };
    expect(() => resuelveConstruir(conDiagnosticos('P1', [primero, siempre, otro]), SD1, r)).toThrow(
      /objetivo «P1», diagnóstico 2: «siempre» solo puede ir el último/,
    );
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

  it('evaluaNumero da la cifra de una expresión sobre la receta', () => {
    expect(evaluaNumero('vm_PQ_mm', SD1, r)).toBe(r.numero('vm_PQ_mm'));
    /* Los distractores del borrador de SD1: la planta y el alzado de PQ. */
    expect(cuadraConLaReceta('44.79', evaluaNumero('en_mm(vm_planta(P, Q))', SD1, r))).toBe(true);
    expect(cuadraConLaReceta('33.51', evaluaNumero('en_mm(vm_alzado(P, Q))', SD1, r))).toBe(true);
  });

  it('y lanza, con la expresión delante, si no es un número o no existe', () => {
    expect(() => evaluaNumero('P', SD1, r)).toThrow(/cifra «P»: .*espera un número/);
    expect(() => evaluaNumero('vm_PX_mm', SD1, r)).toThrow(/cifra «vm_PX_mm»: no hay nada que se llame «vm_PX_mm»/);
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

  it('una cifra de un calcular no puede depender de la elección', () => {
    /* Todo lo de SD5 es simétrico respecto de A —D₂ cae sobre A₂—, así que
       hace falta un punto que no lo sea: X, sobre s y a la derecha de A. B cae
       a un lado o al otro de A, y su distancia a X cambia con la rama. */
    const SD5X: Lamina = { ...SD5, puntos: { ...SD5.puntos, X1: [300, 519.36], X2: [300, 326.09] } };
    const rx = evaluaReceta(SD5X, {
      escena: {
        s: 'recta3(alzado: figura.segmento("r2≡s2"), planta: figura.segmento("s1"))',
        A: 'punto3(alzado: figura.punto("A2"), planta: figura.punto("A1"))',
        X: 'punto3(alzado: figura.punto("X2"), planta: figura.punto("X1"))',
      },
      solucion: { B: 'punto_a_distancia(s, desde: A, distancia: mm(20))' },
    });
    expect(() => evaluaNumero('en_mm(vm(solucion.B, X))', SD5X, rx)).toThrow(
      /cifra «en_mm\(vm\(solucion\.B, X\)\)»: depende de una elección \(«B»\)/,
    );
    /* La distancia a A, en cambio, vale lo mismo en las dos: deja de ser elección. */
    expect(evaluaNumero('en_mm(vm(A, solucion.B))', SD5X, rx)).toBeCloseTo(20, 9);
  });
});

describe('un ejercicio entero, con su receta: resuelveEjercicio', () => {
  const RECETA_SD1 = {
    lamina: 'sd1',
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
  };
  const calcular = (valor: string, distractor = '44.79') => ({
    tipo: 'calcular' as const,
    respuesta: { valor, receta: 'vm_PQ_mm' },
    distractores: [{ valor: distractor, receta: 'en_mm(vm_planta(P, Q))' }],
  });
  const ejercicio = (pasos: EjercicioConReceta['pasos'], receta: EjercicioConReceta['receta'] = RECETA_SD1): EjercicioConReceta => ({
    id: 'sd1-prueba',
    receta,
    pasos,
  });
  const datosSd1 = sd1 as unknown as DatosLamina;

  it('resuelve cada paso construir por su índice, y deja los demás', () => {
    const resueltos = resuelveEjercicio(ejercicio([{ tipo: 'reconocer' }, { tipo: 'construir', ...PASO }, calcular('55.04')]), datosSd1);
    expect([...resueltos.keys()]).toEqual([1]);
    expect(resueltos.get(1)!.objetivos.map((o) => o.rotulo)).toEqual(['P₁', 'Q₁', 'Q₂', 'G₂']);
  });

  it('una cifra que no es la de su receta no llega a publicarse', () => {
    expect(() => resuelveEjercicio(ejercicio([calcular('55.10')]), datosSd1)).toThrow(
      /sd1-prueba, paso 1: la respuesta dice 55\.10 y su receta \(«vm_PQ_mm»\) da 55\.03\d\d/,
    );
    expect(() => resuelveEjercicio(ejercicio([calcular('55.04', '44.70')]), datosSd1)).toThrow(/paso 1: el distractor 1 dice 44\.70/);
  });

  it('un error de un paso construir sale con el ejercicio y el paso delante', () => {
    const roto = { tipo: 'construir' as const, ...PASO, objetivos: [{ ...PASO.objetivos[0], es: 'proy_planta(solucion.X)' }] };
    expect(() => resuelveEjercicio(ejercicio([{ tipo: 'reconocer' }, roto]), datosSd1)).toThrow(/sd1-prueba, paso 2: objetivo «P1»/);
  });

  it('sin receta, nada puede salir de una receta', () => {
    const sinReceta = (pasos: EjercicioConReceta['pasos']): EjercicioConReceta => ({ id: 'sd1-prueba', pasos });
    expect(resuelveEjercicio(sinReceta([{ tipo: 'reconocer' }]), undefined).size).toBe(0);
    expect(() => resuelveEjercicio(sinReceta([{ tipo: 'construir', ...PASO }]), undefined)).toThrow(
      /sd1-prueba: tiene pasos que salen de una receta y no declara ninguna/,
    );
    expect(() => resuelveEjercicio(sinReceta([calcular('55.04')]), undefined)).toThrow(/no declara ninguna/);
  });

  it('una receta sobre una lámina que no está, o que no evalúa, rompe con su nombre', () => {
    expect(() => resuelveEjercicio(ejercicio([calcular('55.04')]), undefined)).toThrow(/la lámina «sd1» no está en src\/content\/laminas/);
    const rota = { ...RECETA_SD1, solucion: { ...RECETA_SD1.solucion, Q: 'corte(bajada, tejado)' } };
    expect(() => resuelveEjercicio(ejercicio([calcular('55.04')], rota), datosSd1)).toThrow(/sd1-prueba, receta: solucion\.Q/);
  });

  it('un objetivo encima de un punto dado de la lámina rompe el build: el Taller no deja marcarlo', () => {
    /* P₂ es una cruz de SD1. A 2 pt, el imán engancha la cruz incluso con la
       lupa a ×4; a 3 pt, ya no. */
    const sobre = (dx: number) => ({
      tipo: 'construir' as const,
      ...PASO,
      objetivos: [
        {
          nombre: 'X',
          pide: 'un punto junto a P₂',
          es: `desplaza(figura.punto("P2"), dx: ${dx})`,
          bien: 'Bien.',
          diagnosticos: [{ si: 'siempre', mensaje: 'No es ahí.' }],
        },
      ],
      trazado: [],
    });
    expect(() => resuelveEjercicio(ejercicio([sobre(0)]), datosSd1)).toThrow(
      /sd1-prueba, paso 1: objetivo «X» cae a 0\.00 mm del punto dado P2 de la lámina: el Taller engancha el punto dado/,
    );
    expect(() => resuelveEjercicio(ejercicio([sobre(2)]), datosSd1)).toThrow(/del punto dado P2/);
    expect(resuelveEjercicio(ejercicio([sobre(3)]), datosSd1).size).toBe(1);
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

describe('los tramos de la visibilidad', () => {
  /* La trayectoria de la gota en el alzado, pasada a limpio: de P₂ a Q₂
     vista y de Q₂ a G₂ oculta. La visibilidad es inventada (la gota no se
     tapa con nada): solo se prueba el mecanismo. */
  const TRAMOS = [
    { traza: 'proy_alzado(segmento3(solucion.P, solucion.Q))', tipo: 'visto' as const, porque: 'Sobre el tejado, por delante de todo.' },
    { traza: 'proy_alzado(segmento3(solucion.Q, solucion.G))', tipo: 'oculto' as const, porque: 'Por detrás del alero, que la tapa.' },
  ];
  const MARCAS = [
    { con: 'marca' as const, traza: 'proy_planta(solucion.P)', porque: 'P₁, donde la horizontal baja a la planta.' },
    { con: 'marca' as const, traza: 'proy_planta(solucion.Q)', porque: 'Q₁, donde la l.m.p. corta el alero.' },
    { con: 'marca' as const, traza: 'proy_alzado(solucion.Q)', porque: 'Q₂, en la vertical de Q₁ sobre el alero.' },
    { con: 'marca' as const, traza: 'proy_alzado(solucion.G)', porque: 'G₂, en la vertical de Q₂ sobre el suelo.' },
  ];
  const ARISTAS = [
    { con: 'arista-vista' as const, traza: 'proy_alzado(segmento3(solucion.P, solucion.Q))', porque: 'De P₂ a Q₂, vista.' },
    { con: 'arista-oculta' as const, traza: 'proy_alzado(segmento3(solucion.Q, solucion.G))', porque: 'De Q₂ a G₂, oculta.' },
  ];

  it('compila cada tramo a su segmento, con su tipo y su porqué', () => {
    const paso = resuelveConstruir({ ...PASO, tramos: TRAMOS, construccion: [...MARCAS, ...ARISTAS] }, SD1, r);
    expect(paso.tramos.map((t) => t.tipo)).toEqual(['visto', 'oculto']);
    expect(paso.tramos[0].b).toEqual(paso.tramos[1].a);
    expect(paso.tramos[1].porque).toMatch(/alero/);
  });

  it('sin tramos, la lista está vacía', () => {
    expect(resuelveConstruir(PASO, SD1, r).tramos).toEqual([]);
  });

  it('dos tramos que se pisan rompen el build', () => {
    const pisados = [TRAMOS[0], { ...TRAMOS[0], tipo: 'oculto' as const }];
    expect(() => resuelveConstruir({ ...PASO, tramos: pisados }, SD1, r)).toThrow(/los tramos 1 y 2 se pisan/);
  });

  it('un tramo que no es un segmento, o que es casi un punto, también', () => {
    expect(() => resuelveConstruir({ ...PASO, tramos: [{ ...TRAMOS[0], traza: 'proy_alzado(solucion.Q)' }] }, SD1, r)).toThrow(
      /tramo 1 .* tiene que ser un solo segmento/,
    );
    const corto = 'segmento2(proy_alzado(solucion.Q), desplaza(proy_alzado(solucion.Q), dx: mm(0.5)))';
    expect(() => resuelveConstruir({ ...PASO, tramos: [{ ...TRAMOS[0], traza: corto }] }, SD1, r)).toThrow(/no llega a la tolerancia/);
  });

  it('la construcción paso a paso tiene que pasar a limpio cada tramo, con su tipo', () => {
    expect(() => resuelveConstruir({ ...PASO, tramos: TRAMOS, construccion: [...MARCAS, ARISTAS[0]] }, SD1, r)).toThrow(
      /no pasa a limpio el tramo 2/,
    );
    const cambiada = [ARISTAS[0], { ...ARISTAS[1], con: 'arista-vista' as const }];
    expect(() => resuelveConstruir({ ...PASO, tramos: TRAMOS, construccion: [...MARCAS, ...cambiada] }, SD1, r)).toThrow(
      /pasa el tramo 2 como visto, y va oculto/,
    );
    const deUnTiron = { con: 'arista-vista' as const, traza: 'proy_alzado(segmento3(solucion.P, solucion.G))', porque: 'De P₂ a G₂ de un tirón.' };
    expect(() => resuelveConstruir({ ...PASO, tramos: TRAMOS, construccion: [...MARCAS, deUnTiron] }, SD1, r)).toThrow(/no casa con los tramos/);
  });
});
