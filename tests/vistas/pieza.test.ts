/**
 * La pieza como datos (`lib/vistas/pieza.ts`): lo que se comprueba antes de
 * calcular nada. Una pieza mal escrita tiene que caer aquí con un mensaje
 * que diga qué primitiva y qué le pasa, nunca dentro del motor con «un
 * vector de longitud cero» y sin el código de la pieza (revisión del 9 de
 * octubre de 2026).
 */
import { describe, expect, it } from 'vitest';
import { compilaPieza, dentro, problemasDePieza, type PiezaCompilada, type PiezaDeclarada } from '../../src/lib/vistas/pieza.ts';
import { calculaVistas } from '../../src/lib/vistas/motor.ts';
import { loQueTapa } from '../../src/lib/vistas/rayo.ts';
import { unitario3 } from '../../src/lib/vistas/vector.ts';
import { firma, vistasDe } from './ayudas';
import { L_PRISMA, piezaDeLaEspiga } from './piezas';

const fuente = 'Pieza mal escrita a propósito.';

describe('la pieza como datos', () => {
  it('la espiga no tiene problemas, y su pertenencia es la del dibujo', () => {
    const d = piezaDeLaEspiga();
    expect(problemasDePieza(d)).toEqual([]);
    const p = compilaPieza(d);
    expect(dentro(p, [70, 10, 6])).toBe(true); // la base
    expect(dentro(p, [56, 25, 6])).toBe(false); // el agujero de la base
    expect(dentro(p, [12, 10, 34])).toBe(false); // el agujero de la torre
    expect(dentro(p, [23, 10, 49])).toBe(false); // el chaflán
    expect(dentro(p, [60, 10, 11])).toBe(true); // el chaflán no toca la base
  });

  it('caza los nombres repetidos, un «dentro» que no existe y una caja vacía', () => {
    const mala: PiezaDeclarada = {
      codigo: 'mala',
      fuente,
      suma: [
        { nombre: 'a', caja: [0, 10, 0, 10, 0, 10] },
        { nombre: 'a', caja: [10, 5, 0, 10, 0, 10] },
      ],
      resta: [{ nombre: 'b', cilindro: { eje: 'z', centro: [5, 5], r: 0 }, dentro: 'nadie' }],
      noSeCorta: ['fantasma'],
    };
    const problemas = problemasDePieza(mala).join('\n');
    expect(problemas).toMatch(/dos primitivas que se llaman «a»/);
    expect(problemas).toMatch(/«a».*x0 < x1/);
    expect(problemas).toMatch(/«b».*radio/);
    expect(problemas).toMatch(/«nadie»/);
    expect(problemas).toMatch(/«fantasma»/);
    expect(() => compilaPieza(mala)).toThrow(/mala/);
  });
});

describe('los polígonos de un prisma', () => {
  const conPoligono = (poligono: [number, number][]): PiezaDeclarada => ({
    codigo: 'prueba-poligono',
    fuente,
    suma: [{ nombre: 'ele', prisma: { plano: 'xz', poligono, desde: 0, hasta: 40 } }],
  });
  const ele: [number, number][] = [
    [0, 0],
    [60, 0],
    [60, 10],
    [20, 10],
    [20, 30],
    [0, 30],
  ];

  it('el vértice de cierre repetido se quita al compilar: dibuja lo mismo que sin él', () => {
    const cerrado = conPoligono([...ele, [0, 0]]);
    expect(problemasDePieza(cerrado)).toEqual([]);
    const [a, b] = [vistasDe(L_PRISMA), vistasDe(cerrado)];
    for (const id of ['alzado', 'planta', 'perfil'] as const) expect(firma(b.vistas[id]), id).toEqual(firma(a.vistas[id]));
  });

  it('dos vértices seguidos iguales, también', () => {
    const repetido = conPoligono([ele[0], ele[1], ele[1], ...ele.slice(2)]);
    expect(problemasDePieza(repetido)).toEqual([]);
    const [a, b] = [vistasDe(L_PRISMA), vistasDe(repetido)];
    for (const id of ['alzado', 'planta', 'perfil'] as const) expect(firma(b.vistas[id]), id).toEqual(firma(a.vistas[id]));
  });

  it('un vértice casi repetido se dice como tal, y no como una pieza delgada', () => {
    const casi = conPoligono([
      [0, 0],
      [60, 0],
      [60, 0.005],
      [60, 10],
      [20, 10],
      [20, 30],
      [0, 30],
    ]);
    expect(problemasDePieza(casi).join('\n')).toMatch(/«ele».*vértices 2 y 3.*casi repetido/);
  });

  it('un polígono que se corta a sí mismo no es una sección', () => {
    const lazo = conPoligono([
      [0, 0],
      [10, 10],
      [10, 0],
      [0, 10],
    ]);
    expect(problemasDePieza(lazo).join('\n')).toMatch(/«ele».*se corta a sí mismo/);
  });
});

describe('lo demás que se comprueba antes de calcular', () => {
  it('el punto de un giro tiene tres coordenadas', () => {
    const d: PiezaDeclarada = {
      codigo: 'prueba-giro',
      fuente,
      suma: [{ nombre: 'taco', caja: [0, 10, 0, 10, 0, 10], gira: { eje: 'z', grados: 30, por: [1, 2] as unknown as [number, number, number] } }],
    };
    expect(problemasDePieza(d).join('\n')).toMatch(/«taco».*giro.*por/);
  });

  it('una intersección vacía, escrita o que no deja nada, se dice con el código de la pieza', () => {
    const escrita: PiezaDeclarada = { codigo: 'prueba-vacia', fuente, suma: [{ nombre: 'a', caja: [0, 10, 0, 10, 0, 10] }], interseca: [] };
    expect(problemasDePieza(escrita).join('\n')).toMatch(/interseca.*vacía/);
    const sinNada: PiezaDeclarada = {
      codigo: 'prueba-nada',
      fuente,
      suma: [{ nombre: 'a', caja: [0, 10, 0, 10, 0, 10] }],
      interseca: [{ nombre: 'b', caja: [20, 30, 0, 10, 0, 10] }],
    };
    expect(() => compilaPieza(sinNada)).toThrow(/prueba-nada.*nada en común/);
  });

  it('una primitiva más delgada que dos sondas se borraría: no se acepta', () => {
    const d: PiezaDeclarada = { codigo: 'prueba-lamina', fuente, suma: [{ nombre: 'chapa', caja: [0, 10, 0, 10, 0, 0.05] }] };
    expect(problemasDePieza(d).join('\n')).toMatch(/«chapa».*más delgad/);
  });

  it('un vector sin dirección lanza, también si sale NaN de una cuenta', () => {
    expect(() => unitario3([0, 0, 0])).toThrow(/longitud cero/);
    expect(() => unitario3([Number.NaN, 0, 0])).toThrow(/longitud cero/);
  });

  it('lo que tapa una arista se nombra por su primitiva; si no hay cuál, «?», nunca la primera por defecto', () => {
    const p = compilaPieza({
      codigo: 'prueba-tapa',
      fuente,
      suma: [
        { nombre: 'delante', caja: [0, 10, -10, 0, 0, 10] },
        { nombre: 'detras', caja: [0, 10, 10, 20, 0, 10] },
      ],
    });
    expect(loQueTapa(p, [5, 5, 5], [0, -1, 0])).toBe('delante');
    /* Un árbol estropeado en que todo es materia y ninguna primitiva la
       pone: antes se culpaba a «delante», la primera. */
    const rota: PiezaCompilada = { ...p, arbol: { op: 'interseca', hijos: [] } };
    expect(loQueTapa(rota, [5, 5, 5], [0, -1, 0])).toBe('?');
  });

  it('si algo falla dentro del motor, el error lleva el código de la pieza', () => {
    /* Una pieza compilada y estropeada después, saltándose la comprobación:
       un vértice repetido en el polígono del prisma. */
    const p = compilaPieza({ ...L_PRISMA, codigo: 'prueba-rota' });
    const rota: PiezaCompilada = {
      ...p,
      primitivas: p.primitivas.map((x) => (x.forma.tipo === 'prisma' ? { ...x, forma: { ...x.forma, poligono: [x.forma.poligono[0], ...x.forma.poligono] } } : x)),
    };
    expect(() => calculaVistas(rota)).toThrow(/prueba-rota.*longitud cero/);
  });
});
