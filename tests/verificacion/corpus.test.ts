/**
 * Los lectores de `corpus.ts`, verificados.
 *
 * Estos son los que traducen lo que el corpus **escribe** a lo que el test
 * **compara**, así que un fallo suyo no rompe nada: hace que una comparación
 * pase por casualidad, o que falle una que estaba bien. Ya pasó dos veces —el
 * lector no sabía leer «1/√10», y una barra invertida perdida convirtió el
 * limpiador de espacios en un borrador de eses—.
 */
import { describe, expect, it } from 'vitest';
import { complejo, convocatoria, matriz, vector } from './corpus';
import { coeficienteHW } from './tablas';

describe('vectores', () => {
  it('con paréntesis y sin ellos', () => {
    expect(vector('(1, -1, 2)')).toEqual([1, -1, 2]);
    expect(vector('1, -1, 2')).toEqual([1, -1, 2]);
  });
  it('con fracciones', () => {
    const v = vector('(-5/3, 1/3, 2/3)');
    expect(v[0]).toBeCloseTo(-5 / 3, 12);
    expect(v[2]).toBeCloseTo(2 / 3, 12);
  });
  it('con raíces, que es como se escriben las bases ortonormales', () => {
    const v = vector('(1/√10, 2/√10, 0)');
    expect(v[0]).toBeCloseTo(1 / Math.sqrt(10), 12);
    expect(v[1]).toBeCloseTo(2 / Math.sqrt(10), 12);
    expect(v[2]).toBe(0);
  });
  it('y con la raíz arriba', () => {
    const v = vector('(√3/3, -√6/6)');
    expect(v[0]).toBeCloseTo(Math.sqrt(3) / 3, 12);
    expect(v[1]).toBeCloseTo(-Math.sqrt(6) / 6, 12);
  });
  it('se niega ante algo que no sabe leer, en vez de adivinar', () =>
    expect(() => vector('(1, dos, 3)')).toThrow());
});

describe('matrices', () => {
  it('con corchetes y sin ellos', () => {
    expect(matriz('[1, 2; 3, 4]')).toEqual([[1, 2], [3, 4]]);
    expect(matriz('1, 2; 3, 4')).toEqual([[1, 2], [3, 4]]);
  });
  it('con fracciones dentro', () => {
    const M = matriz('-1, 0, -1; 4, 4, -4; 5/2, 3/2, -2');
    expect(M[2][0]).toBeCloseTo(2.5, 12);
    expect(M[2][1]).toBeCloseTo(1.5, 12);
  });
});

describe('complejos', () => {
  it('parte real y parte imaginaria', () => expect(complejo('-1+9.5i')).toEqual([-1, 9.5]));
  it('solo imaginario', () => expect(complejo('2i')).toEqual([0, 2]));
  it('la unidad imaginaria sola', () => expect(complejo('i')).toEqual([0, 1]));
  it('y con signo', () => expect(complejo('-i')).toEqual([0, -1]));
  it('solo real', () => expect(complejo('3')).toEqual([3, 0]));
  it('con espacios', () => expect(complejo('  -1 + 9.5i ')).toEqual([-1, 9.5]));
  it('se niega ante algo que no sabe leer', () => expect(() => complejo('1+2j')).toThrow());
});

/**
 * `cuadra.magnitud` no tiene lector propio: llama a `leeMagnitud` y
 * `comparaMagnitud` de `src/lib/unidades.ts`, que son las que corrigen al
 * alumno. Lo que sí hay que comprobar es que **el cable está bien puesto**, y
 * en concreto las dos cosas que lo separan de una comparación numérica normal:
 * que la tolerancia es relativa y que una unidad de otra magnitud es un fallo
 * distinto, no un número que no cuadra.
 *
 * Se comprueba contra una convocatoria de verdad para que el día que cambie el
 * corpus se entere alguien.
 */
describe('el cable de las magnitudes', () => {
  const cuadra = convocatoria('fluidos', '2019-2020-1par');
  const id = 'exflu1920-1par-2-el-laboratorio-submarino';
  const titulo = 'La presión del aire del laboratorio';

  it('acepta el valor en otra unidad de la misma magnitud', () => {
    /* El corpus publica 468.972 Pa; en kPa son los mismos y tiene que pasar. */
    cuadra.magnitud(id, titulo, 468.972, 'kPa');
  });

  it('rechaza un número fuera de la tolerancia relativa', () => {
    /* La tolerancia es el 2 %, así que un 10 % de más tiene que fallar. */
    expect(() => cuadra.magnitud(id, titulo, 468972 * 1.1, 'Pa')).toThrow();
  });

  it('y distingue una unidad de otra magnitud', () => {
    /* Este es el error conceptual, y el mensaje lo dice con esas palabras en
       vez de enseñar dos números que no se parecen. */
    expect(() => cuadra.magnitud(id, titulo, 468972, 'm/s')).toThrow(/magnitudes distintas/);
  });
});

describe('la tabla de Hazen-Williams del tema 19', () => {
  /* Se lee del sitio y no se copia, así que lo que hay que comprobar es que se
     lee bien: las seis bandas, y sobre todo los bordes, que es donde estaba el
     fallo. Con el lector anterior la primera banda quedaba sin tope y una
     tubería lisísima recibía 140 en vez de 150. */
  it('asigna las seis bandas por rugosidad relativa', () => {
    expect(coeficienteHW(1e-6)).toBe(150);
    expect(coeficienteHW(1.5e-5)).toBe(150);
    expect(coeficienteHW(4.7e-5)).toBe(140);
    expect(coeficienteHW(7e-5)).toBe(140);
    expect(coeficienteHW(6e-4)).toBe(130);
    expect(coeficienteHW(2e-3)).toBe(120);
    expect(coeficienteHW(1e-2)).toBe(110);
    expect(coeficienteHW(3e-2)).toBe(100);
  });
  it('y los bordes caen del lado de la banda que los declara', () => {
    /* La tabla escribe «$1{,}5\cdot 10^{-5}$ … $2\cdot 10^{-4}$», y ese 2·10⁻⁴
       es el tope de 140, no el suelo de 130. */
    expect(coeficienteHW(2e-4)).toBe(140);
    expect(coeficienteHW(2.0001e-4)).toBe(130);
  });
});
