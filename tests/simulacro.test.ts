import { describe, expect, it } from 'vitest';
import { notaPorPartes, partesDelSimulacro } from '../src/lib/simulacro';

/* Los simulacros nuestros (fase H3, 29 de septiembre de 2026): el examen de
   Materiales es un 40 % de teoría y un 60 % de problemas, con un mínimo de
   4,0 en cada parte y un 4,0 como mucho si no se llega. */
const EVALUACION = {
  modalidades: [
    {
      partes: [
        {
          sub: [
            { id: 'teoria', que: 'Parte de teoría', peso: 40, minimo: 4, tope: 4 },
            { id: 'problemas', que: 'Parte de problemas', peso: 60, minimo: 4, tope: 4 },
          ],
        },
        { sub: [{ id: 'entregables', que: 'Entregables', peso: 100 }] },
      ],
    },
  ],
};

describe('notaPorPartes', () => {
  const partes = (t: number, p: number) => [
    { peso: 40, minimo: 4, tope: 4, nota: t },
    { peso: 60, minimo: 4, tope: 4, nota: p },
  ];

  it('con las dos partes por encima del mínimo, es la media ponderada', () => {
    const r = notaPorPartes(partes(6, 7));
    expect(r.nota).toBeCloseTo(6.6, 10);
    expect(r.topada).toBe(false);
  });

  it('un 9 en problemas con un 3 en teoría no es un 6,6: es un 4', () => {
    const r = notaPorPartes(partes(3, 9));
    expect(r.sinTope).toBeCloseTo(6.6, 10);
    expect(r.nota).toBe(4);
    expect(r.topada).toBe(true);
  });

  it('por debajo del tope, el tope no sube la nota', () => {
    const r = notaPorPartes(partes(2, 3));
    expect(r.nota).toBeCloseTo(2.6, 10);
    expect(r.topada).toBe(false);
  });

  it('sin mínimos, solo pesa', () => {
    expect(notaPorPartes([{ peso: 50, nota: 2 }, { peso: 50, nota: 8 }]).nota).toBe(5);
  });
});

describe('partesDelSimulacro', () => {
  it('saca peso, mínimo y tope del catálogo', () => {
    const r = partesDelSimulacro(EVALUACION, [{ sub: 'teoria', n: [1, 2] }, { sub: 'problemas', n: [3, 4, 5, 6] }], 6, 'x');
    expect(r).toEqual([
      { titulo: 'Parte de teoría', peso: 40, minimo: 4, tope: 4, n: [1, 2] },
      { titulo: 'Parte de problemas', peso: 60, minimo: 4, tope: 4, n: [3, 4, 5, 6] },
    ]);
  });

  it('una parte que el catálogo no tiene rompe el build', () => {
    expect(() => partesDelSimulacro(EVALUACION, [{ sub: 'practica', n: [1] }], 1, 'x')).toThrow(/no tiene/);
  });

  it('una fila sin parte, o en dos, rompe el build', () => {
    expect(() => partesDelSimulacro(EVALUACION, [{ sub: 'teoria', n: [1] }, { sub: 'problemas', n: [3] }], 3, 'x')).toThrow(
      /fila 2/,
    );
    expect(() => partesDelSimulacro(EVALUACION, [{ sub: 'teoria', n: [1, 2] }, { sub: 'problemas', n: [2] }], 2, 'x')).toThrow(
      /fila 2 cae en 2/,
    );
  });

  it('unas partes que no suman 100 rompen el build', () => {
    expect(() => partesDelSimulacro(EVALUACION, [{ sub: 'teoria', n: [1] }], 1, 'x')).toThrow(/pesan 40/);
  });
});
