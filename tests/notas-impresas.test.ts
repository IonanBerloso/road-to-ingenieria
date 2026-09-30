import { describe, expect, it } from 'vitest';
import * as n from '../scripts/notas-impresas.mjs';

/* El guardián de las notas impresas de Fluidos (verify.mjs), sin PDF: el
   texto es como lo vuelca `pdftotext -layout`. Nace el 29 de septiembre de
   2026 (fase I, tanda 0). */
const CUADERNILLO = [
  'EXAMEN FINAL. 29 de Mayo de 2025 ............................................ 57',
  'EXAMEN FINAL. 23 de Junio de 2025............................................ 62',
  '                          EXAMEN FINAL. 29 de Mayo de 2025',
  '1. (10%) Una compuerta semicircular…',
  '',
  'NOTA: A la hora de calcular cualquier fuerza hidrostática, es OBLIGATORIO dibujar el',
  'correspondiente prisma de presiones acotado.',
  '',
  '3. (%10) El aliviadero lateral…',
  'a) Calcular el caudal.',
  'IMPRESCINDIBLE:',
  '',
  '    - Indicar el tipo de flujo y la expresión empleada.',
  'Departamento de Ingeniería Energética  Escuela de Ingeniería de Gipuzkoa (San Sebastian) 58',
  '                                                                    Mayo de 2025',
  '    - En caso de realizar iteraciones, el cambio debe ser menor',
  '    al 5%.',
  '',
  'Resultados: Q = 12 l/s.',
  '                          EXAMEN FINAL. 23 de Junio de 2025',
  '1. (10%) Otra cosa.',
].join('\n');

describe('partePorExamen', () => {
  it('parte por la cabecera y no por las líneas del índice', () => {
    const ex = n.partePorExamen(CUADERNILLO);
    expect([...ex.keys()]).toEqual(['29 de mayo de 2025', '23 de junio de 2025']);
    expect(ex.get('29 de mayo de 2025')).toMatch(/compuerta semicircular/);
  });
});

describe('partePorEjercicio y bloquesDeNota', () => {
  const ej = n.partePorEjercicio(n.partePorExamen(CUADERNILLO).get('29 de mayo de 2025'));

  it('reconoce «3. (%10)», la errata de 2021', () => {
    expect([...ej.keys()]).toEqual([1, 3]);
  });

  it('una nota de dos líneas acaba en la línea en blanco', () => {
    expect(n.bloquesDeNota(ej.get(1))).toEqual([
      'NOTA: A la hora de calcular cualquier fuerza hidrostática, es OBLIGATORIO dibujar el correspondiente prisma de presiones acotado.',
    ]);
  });

  it('una nota pegada a su «DATO:» acaba en el dato, como la vuelca poppler', () => {
    const trozo = [
      '1. (10%) Una compuerta de cuarto de círculo…',
      'NOTA: A la hora de calcular cualquier fuerza hidrostática, es OBLIGATORIO dibujar el',
      'correspondiente prisma de presiones acotado.',
      'DATO: Centroide del cuarto de círculo: xG=4·R/(3·).',
    ].join('\n');
    expect(n.bloquesDeNota(trozo)).toEqual([
      'NOTA: A la hora de calcular cualquier fuerza hidrostática, es OBLIGATORIO dibujar el correspondiente prisma de presiones acotado.',
    ]);
  });

  it('una lista tras dos puntos se recoge entera, saltándose el pie de página', () => {
    expect(n.bloquesDeNota(ej.get(3))).toEqual([
      'IMPRESCINDIBLE: - Indicar el tipo de flujo y la expresión empleada. - En caso de realizar iteraciones, el cambio debe ser menor al 5%.',
    ]);
  });
});

describe('cobertura', () => {
  const bloque = 'NOTA: A la hora de calcular cualquier fuerza hidrostática, es OBLIGATORIO dibujar el correspondiente prisma de presiones acotado.';

  it('la nota transcrita, con tildes y énfasis, cubre el bloque', () => {
    const notas = ['A la hora de calcular cualquier fuerza hidrostática, es **obligatorio** dibujar el correspondiente prisma de presiones acotado.'];
    expect(n.cobertura(bloque, notas)).toBeGreaterThanOrEqual(n.UMBRAL);
  });

  it('sin la nota, no la cubre: el guardián se pone rojo', () => {
    expect(n.cobertura(bloque, [])).toBeLessThan(n.UMBRAL);
    expect(n.cobertura(bloque, ['Despreciar el peso de la compuerta.'])).toBeLessThan(n.UMBRAL);
  });
});

describe('numeroImpreso', () => {
  it('sale del id cuando no hay `n`', () => {
    expect(n.numeroImpreso({ id: 'exflu2526-ord-5-el-canal-con-berma' })).toBe(5);
    expect(n.numeroImpreso({ id: 'exflu2021-1par-1a-algo' })).toBe(1);
  });

  it('manda el `n` si lo lleva', () => {
    expect(n.numeroImpreso({ id: 'exflu2526-ord-5-x', n: 7 })).toBe(7);
  });
});
