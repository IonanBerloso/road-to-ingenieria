import { describe, expect, it } from 'vitest';
import { PT_MM, type P2 } from '../../src/lib/diedrico';
import { acierta, cumple } from '../../src/lib/diedrico-corrige';
import { compilaObjetivo, compilaPredicado, evaluaReceta, type Lamina } from '../../src/lib/diedrico-receta';

/* Las elecciones: láminas con más de una solución buena. En SD5 el lado AB
   puede salir de A hacia un lado o hacia el otro; en SD7 cualquiera de los dos
   extremos de cada diagonal puede ser A (o B). La receta lo declara una vez
   —la línea que da los dos puntos es la elección, y se llama como ella— y todo
   lo que se calcula a partir de ahí la hereda. La primera marca del alumno que
   la resuelve la fija para las demás (pilotos taller/sd5.js y taller/sd7.js
   del paquete de diseño del 8 de septiembre de 2026; los valores, de sus
   funciones `solucion`, como en tests/geometria/sd5.test.ts y sd7.test.ts). */

const TOL = 0.7 / PT_MM;
const cerca = (a: readonly number[], b: readonly number[], tol = 0.1) =>
  a.forEach((v, i) => expect(Math.abs(v - b[i]), `${a} frente a ${b}`).toBeLessThanOrEqual(tol));
const unitario = ([a, b]: readonly [P2, P2]): P2 => {
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
};

/* ─────────────────────────────── SD5 ─────────────────────────────── */

const R2S2: [P2, P2] = [[197.28, 385.44], [376.92, 281.64]];
const SD5: Lamina = {
  puntos: { A1: [226.68, 519.36], A2: [226.68, 368.4] },
  segmentos: {
    'r2≡s2': R2S2,
    r1: [[197.28, 448.44], [376.92, 448.44]],
    s1: [[197.28, 519.36], [376.92, 519.36]],
  },
};

const RECETA_SD5 = {
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
    lado_mm: 'en_mm(lado)',
    angulo: 'angulo_con_ph(plano(A, B, D))',
    area_planta_mm2: 'en_mm(vm_planta(A, B)) * en_mm(vm_planta(A, D))',
  },
  comprueba: ['en_recta(A, s)'],
};

const OBJETIVOS_SD5 = ['B2', 'B1', 'D1', 'C1'];
const r5 = evaluaReceta(SD5, RECETA_SD5);

describe('SD5 · una receta con una elección', () => {
  it('reproduce el piloto: el lado, el ángulo del plano y el área de la planta', () => {
    expect(r5.numero('lado_mm')).toBeCloseTo(25.019, 2);
    expect(r5.numero('angulo')).toBeCloseTo(30.02, 1);
    expect(r5.numero('area_planta_mm2')).toBeCloseTo(541.98, 0);
  });

  it('B es una elección con dos ramas, y se llama como su línea', () => {
    const b2 = compilaObjetivo('proy_alzado(solucion.B)', SD5, r5);
    expect(b2.eleccion).toBe('B');
    expect(b2.ramas).toHaveLength(2);
    cerca(b2.ramas[0][0], [288.086, 332.9703]);
    cerca(b2.ramas[1][0], [165.274, 403.9338]);
  });

  it('lo que se calcula a partir de B hereda la elección; lo que no depende de ella, no', () => {
    expect(compilaObjetivo('proy_planta(solucion.C)', SD5, r5).eleccion).toBe('B');
    expect(compilaObjetivo('proy_planta(solucion.D)', SD5, r5).eleccion).toBeUndefined();
    /* El ángulo sale del plano por A, B y D, que depende de B; pero vale lo
       mismo en las dos ramas, así que es un número y no una elección. */
    expect(() => r5.numero('angulo')).not.toThrow();
  });

  it('la primera marca que resuelve la elección la fija para las demás', () => {
    const b2 = compilaObjetivo('proy_alzado(solucion.B)', SD5, r5);
    const c1 = compilaObjetivo('proy_planta(solucion.C)', SD5, r5);
    expect(acierta(b2, [165.274, 403.9338], {}, TOL)).toEqual({ bien: true, elige: { eleccion: 'B', rama: 1 } });
    expect(acierta(c1, [165.274, 448.44], { B: 1 }, TOL)).toEqual({ bien: true });
    expect(acierta(c1, [288.086, 448.44], { B: 1 }, TOL)).toEqual({ bien: false });
    /* Sin nada marcado todavía, las dos valen. */
    expect(acierta(c1, [288.086, 448.44], {}, TOL)).toEqual({ bien: true, elige: { eleccion: 'B', rama: 0 } });
    /* Y un objetivo sin elección no elige nada. */
    const d1 = compilaObjetivo('proy_planta(solucion.D)', SD5, r5);
    expect(acierta(d1, [226.68, 448.44], {}, TOL)).toEqual({ bien: true });
  });

  it('el cuadrado cruzado: C₁ en la rama que no se eligió', () => {
    const d = compilaPredicado(
      'en_recta(figura.segmento("r1")) && cerca_de(otra_rama(proy_planta(solucion.C)))',
      SD5,
      r5,
      OBJETIVOS_SD5,
    );
    expect(cumple(d, [288.086, 448.44], {}, TOL, { B: 1 })).toBe(true);
    expect(cumple(d, [165.274, 448.44], {}, TOL, { B: 1 })).toBe(false);
    /* Sin rama elegida no hay «otra»: el diagnóstico no aplica. */
    expect(cumple(d, [288.086, 448.44], {}, TOL)).toBe(false);
  });

  it('el lado llevado en horizontal: medir en la proyección que acorta', () => {
    const d = compilaPredicado(
      'en_recta(figura.segmento("r2≡s2")) && en_vertical_de(medir_sobre(figura.segmento("s1"), desde: figura.punto("A1"), distancia: solucion.lado))',
      SD5,
      r5,
      OBJETIVOS_SD5,
    );
    /* El punto de r₂ en la vertical de A₁ corrido 70,92 pt en horizontal. */
    const x = 226.68 + 70.92;
    const y = 385.44 + ((281.64 - 385.44) / (376.92 - 197.28)) * (x - 197.28);
    expect(cumple(d, [x, y], {}, TOL)).toBe(true);
    expect(cumple(d, [288.086, 332.9703], {}, TOL)).toBe(false);
  });

  it('la diagonal en vez del lado, con la cuenta escrita en la receta', () => {
    const d = compilaPredicado(
      'en_recta(figura.segmento("r2≡s2")) && a_distancia(de: figura.punto("A2"), d: solucion.lado * raiz(2))',
      SD5,
      r5,
      OBJETIVOS_SD5,
    );
    const [u, l] = [unitario(R2S2), 70.92 * Math.SQRT2];
    expect(cumple(d, [226.68 + u[0] * l, 368.4 + u[1] * l], {}, TOL)).toBe(true);
    expect(cumple(d, [288.086, 332.9703], {}, TOL)).toBe(false);
  });
});

/* ─────────────────────────────── SD7 ─────────────────────────────── */

const R2: [P2, P2] = [[135.96, 388.2], [316.32, 207.84]];
const SD7: Lamina = {
  puntos: { O1: [212.46, 475.14], O2: [212.46, 311.7] },
  segmentos: { r2: R2, r1: [[135.96, 503.04], [316.32, 437.4]] },
};

const RECETA_SD7 = {
  escena: {
    r: 'recta3(alzado: figura.segmento("r2"), planta: figura.segmento("r1"))',
    O: 'punto3(alzado: figura.punto("O2"), planta: figura.punto("O1"))',
  },
  solucion: {
    alfa: 'plano_por_lmp(r)',
    lado: 'mm(50)',
    semidiagonal: 'lado * raiz(2) / 2',
    A: 'punto_a_distancia(r, desde: O, distancia: semidiagonal)',
    C: 'simetrico(A, respecto: O)',
    h: 'horizontal_por(O, alfa)',
    B: 'punto_a_distancia(h, desde: O, distancia: semidiagonal)',
    D: 'simetrico(B, respecto: O)',
    diagonal_mm: 'en_mm(vm(A, C))',
    angulo: 'angulo_con_ph(alfa)',
    a1c1_mm: 'en_mm(vm_planta(A, C))',
  },
  comprueba: ['en_recta(O, r)', 'en_plano(O, alfa)'],
};

const r7 = evaluaReceta(SD7, RECETA_SD7);

describe('SD7 · una receta con dos elecciones independientes', () => {
  it('reproduce el piloto: la diagonal, el plano a 43,2° y la planta de AC', () => {
    expect(r7.numero('diagonal_mm')).toBeCloseTo(70.7107, 3);
    expect(r7.numero('angulo')).toBeCloseTo(43.2195, 3);
    expect(r7.numero('a1c1_mm')).toBeCloseTo(51.5294, 3);
  });

  it('A y C comparten una elección, y B y D otra', () => {
    expect(compilaObjetivo('proy_alzado(solucion.A)', SD7, r7).eleccion).toBe('A');
    expect(compilaObjetivo('proy_alzado(solucion.C)', SD7, r7).eleccion).toBe('A');
    expect(compilaObjetivo('proy_planta(solucion.B)', SD7, r7).eleccion).toBe('B');
    expect(compilaObjetivo('proy_alzado(solucion.D)', SD7, r7).eleccion).toBe('B');
  });

  it('marcar C en un extremo decide que A es el otro, y deja libre la otra diagonal', () => {
    const a2 = compilaObjetivo('proy_alzado(solucion.A)', SD7, r7);
    const c2 = compilaObjetivo('proy_alzado(solucion.C)', SD7, r7);
    const b1 = compilaObjetivo('proy_planta(solucion.B)', SD7, r7);
    const extremo: P2 = [281.09, 243.07];
    const elegido = acierta(c2, extremo, {}, TOL);
    expect(elegido.bien).toBe(true);
    const elegidas = { [elegido.elige!.eleccion]: elegido.elige!.rama };
    expect(acierta(a2, extremo, elegidas, TOL).bien).toBe(false);
    expect(acierta(a2, [143.83, 380.33], elegidas, TOL)).toEqual({ bien: true });
    /* La diagonal BD sigue libre: cualquiera de sus extremos vale, y elige. */
    expect(acierta(b1, [246.7346, 569.3168], elegidas, TOL).elige?.eleccion).toBe('B');
    expect(acierta(b1, [178.1854, 380.9632], elegidas, TOL).elige?.eleccion).toBe('B');
  });

  it('la media diagonal medida sobre r₂, que no está en verdadera magnitud', () => {
    const d = compilaPredicado(
      'en_recta(figura.segmento("r2")) && a_distancia(de: figura.punto("O2"), d: solucion.semidiagonal)',
      SD7,
      r7,
      [],
    );
    const [u, l] = [unitario(R2), ((50 / PT_MM) * Math.SQRT2) / 2];
    expect(cumple(d, [212.46 + u[0] * l, 311.7 + u[1] * l], {}, TOL)).toBe(true);
    expect(cumple(d, [281.09, 243.07], {}, TOL)).toBe(false);
  });

  it('la perpendicular a r₂ trazada en la planta, en vez de la perpendicular a r₁', () => {
    const d = compilaPredicado('en_recta(perpendicular(por: figura.punto("O1"), a: figura.segmento("r2")))', SD7, r7, []);
    const u = unitario(R2);
    expect(cumple(d, [212.46 - u[1] * 30, 475.14 + u[0] * 30], {}, TOL)).toBe(true);
    expect(cumple(d, [246.7346, 569.3168], {}, TOL)).toBe(false);
  });

  it('B₂ fuera de la horizontal de O₂', () => {
    const d = compilaPredicado('!en_horizontal_de(figura.punto("O2"))', SD7, r7, []);
    expect(cumple(d, [246.7346, 330], {}, TOL)).toBe(true);
    expect(cumple(d, [246.7346, 311.7], {}, TOL)).toBe(false);
  });

  it('dos elecciones distintas no se mezclan en una cuenta: todavía no se sabe', () => {
    expect(() =>
      evaluaReceta(SD7, { ...RECETA_SD7, solucion: { ...RECETA_SD7.solucion, x: 'vm(A, B)' } }),
    ).toThrow(/solucion\.x: combina dos elecciones distintas, «A» y «B»/);
  });

  /* De la segunda revisión del 27 de septiembre de 2026: una elección metida
     en una lista pasaba, y fallaba después con un mensaje que no decía por qué. */
  it('una elección dentro de una lista falla en su línea, diciendo por qué', () => {
    expect(() =>
      evaluaReceta(SD7, { ...RECETA_SD7, solucion: { ...RECETA_SD7.solucion, pareja: '[A, O]' } }),
    ).toThrow(/solucion\.pareja: una elección \(«A»\) no puede ir dentro de una lista/);
  });
});

/* ────────────────────────── las cuentas y los nombres ────────────────────── */

describe('las cuentas y los nombres de una receta', () => {
  const cuenta = (src: string) => evaluaReceta(SD7, { solucion: { x: src } }).numero('x');

  it('suma, resta, producto y cociente, con su precedencia y sus paréntesis', () => {
    expect(cuenta('1 + 2 * 3')).toBe(7);
    expect(cuenta('(1 + 2) * 3')).toBe(9);
    expect(cuenta('-2 * 3')).toBe(-6);
    expect(cuenta('10 / 4 - 1')).toBe(1.5);
    expect(cuenta('2 - -1')).toBe(3);
  });

  it('mm() pasa de milímetros a puntos, y en_mm() los devuelve', () => {
    expect(cuenta('mm(25.4)')).toBeCloseTo(72, 12);
    expect(cuenta('en_mm(mm(50))')).toBeCloseTo(50, 12);
  });

  it('una cuenta con algo que no es un número, o entre cero, no pasa', () => {
    expect(() => evaluaReceta(SD7, { escena: RECETA_SD7.escena, solucion: { x: 'O + 1' } })).toThrow(
      /solucion\.x: «\+» espera un número/,
    );
    expect(() => cuenta('1 / 0')).toThrow(/divide entre cero/);
    expect(() => cuenta('raiz(-1)')).toThrow(/raiz\(\) de un número negativo/);
  });

  it('una línea no puede llamarse como una función, ni repetir un nombre de la escena', () => {
    expect(() =>
      evaluaReceta(SD7, { escena: RECETA_SD7.escena, solucion: { plano: 'plano_por_lmp(r)' } }),
    ).toThrow(/solucion\.plano: «plano» es el nombre de una función/);
    expect(() => evaluaReceta(SD7, { escena: RECETA_SD7.escena, solucion: { O: 'mm(1)' } })).toThrow(
      /solucion\.O: «O» ya está en la escena/,
    );
  });

  it('una elección se declara en una línea con nombre, no dentro de un objetivo', () => {
    expect(() =>
      compilaObjetivo('proy_planta(punto_a_distancia(r, desde: O, distancia: 10))', SD7, r7),
    ).toThrow(/elección/);
  });

  it('un objetivo y una línea de la receta no pueden llamarse igual', () => {
    expect(() => compilaPredicado('en_vertical_de(A)', SD7, r7, ['A'])).toThrow(/«A» es a la vez/);
  });

  it('en un diagnóstico todo es de la lámina: una recta del espacio se proyecta antes', () => {
    expect(() => compilaPredicado('en_recta(r)', SD7, r7, [])).toThrow(/proy_planta\(\) o proy_alzado\(\)/);
    expect(() => compilaPredicado('en_recta(proy_planta(r))', SD7, r7, [])).not.toThrow();
  });

  it('otra_rama() solo tiene sentido sobre una elección', () => {
    expect(() => compilaPredicado('cerca_de(otra_rama(figura.punto("O1")))', SD7, r7, [])).toThrow(
      /otra_rama\(\) espera una elección/,
    );
  });
});
