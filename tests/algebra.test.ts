import { describe, expect, it } from 'vitest';
import { comparaMatriz, comparaVector, leeMatriz, leeVector } from '../src/lib/algebra';

/**
 * Los casos salen de la ordinaria de Álgebra de 2024-2025, que es el examen que
 * motivó estos dos lectores. Cada bloque dice qué ejercicio lo pide.
 *
 * La regla de fondo es la misma que en `complejo.test.ts`: el alumno escribe a
 * mano y con prisa, y decirle que se ha equivocado cuando no se ha equivocado
 * es peor que no corregir nada.
 */

const v = (...xs: number[]) => xs.map((re) => ({ re, im: 0 }));

describe('leeVector · las formas en que se escribe un vector a mano', () => {
  it('lee las cuatro maneras de envolverlo, y ninguna', () => {
    for (const t of ['(1,0,-2,0)', '[1,0,-2,0]', '{1,0,-2,0}', '<1,0,-2,0>', '1,0,-2,0']) {
      expect(leeVector(t), t).toEqual(v(1, 0, -2, 0));
    }
  });

  it('admite espacios y punto y coma', () => {
    expect(leeVector('( 1 ; 0 ; -2 ; 0 )')).toEqual(v(1, 0, -2, 0));
  });

  /* La coma es separador y marca decimal a la vez, y eso es ambiguo. La regla
     es: con punto y coma delante, la coma queda libre para los decimales. */
  it('resuelve la ambigüedad de la coma con el punto y coma', () => {
    expect(leeVector('(2,5 ; 1)')).toEqual(v(2.5, 1));   // dos coordenadas
    expect(leeVector('(2,5,1)')).toEqual(v(2, 5, 1));    // tres coordenadas
    expect(leeVector('(2.5, 1)')).toEqual(v(2.5, 1));    // y con punto, dos
  });

  it('admite raíces y fracciones, que es como se escribe una base ortonormal', () => {
    // ej 3b: u₃ = (−√6/6, 0, √6/2)
    const u3 = leeVector('(-√6/6, 0, √6/2)');
    expect(u3).not.toBeNull();
    expect(u3![0].re).toBeCloseTo(-Math.sqrt(6) / 6, 10);
    expect(u3![2].re).toBeCloseTo(Math.sqrt(6) / 2, 10);
  });

  it('admite el menos tipográfico, que es el que sale al copiar de un PDF', () => {
    expect(leeVector('(0, 0, −3, 0)')).toEqual(v(0, 0, -3, 0));
  });

  it('devuelve null si una sola coordenada no se entiende', () => {
    expect(leeVector('(1, dos, 3)')).toBeNull();
    expect(leeVector('(1, , 3)')).toEqual(v(1, 3)); // la vacía se descarta, no rompe
  });

  it('una sola coordenada no es un vector: para eso está `numero`', () => {
    expect(leeVector('(5)')).toBeNull();
    expect(leeVector('5')).toBeNull();
  });
});

describe('comparaVector · el orden es la mitad de la respuesta', () => {
  // ej 1.b.iii: las coordenadas en la base canónica son (0,0,−3,0)
  const esperado = v(0, 0, -3, 0);

  it('acepta la respuesta correcta', () => {
    expect(comparaVector(v(0, 0, -3, 0), esperado, 0.001).igual).toBe(true);
  });

  it('RECHAZA los mismos números en otro orden, y lo dice', () => {
    const r = comparaVector(v(0, -3, 0, 0), esperado, 0.001);
    expect(r.igual).toBe(false);
    expect(r.soloOrden).toBe(true);
  });

  it('distingue «te has equivocado de orden» de «te has equivocado de número»', () => {
    const otroNumero = comparaVector(v(0, 0, 3, 0), esperado, 0.001);
    expect(otroNumero.igual).toBe(false);
    expect(otroNumero.soloOrden).toBe(false);
    expect(otroNumero.fallan).toBe(1);
  });

  it('detecta que faltan o sobran coordenadas', () => {
    const r = comparaVector(v(0, 0, -3), esperado, 0.001);
    expect(r.longitudDistinta).toBe(true);
  });

  it('respeta la tolerancia, que hace falta con raíces', () => {
    const u3 = v(-0.408248, 0, 1.224745);
    const exacto = v(-Math.sqrt(6) / 6, 0, Math.sqrt(6) / 2);
    expect(comparaVector(u3, exacto, 0.001).igual).toBe(true);
    expect(comparaVector(v(-0.41, 0, 1.3), exacto, 0.001).igual).toBe(false);
  });
});

describe('leeMatriz · filas con punto y coma, columnas con coma', () => {
  it('lee la matriz del ejercicio 2', () => {
    // A = [[1,0,−1],[2,4,0],[0,−2,2]]
    const A = leeMatriz('[1,0,-1; 2,4,0; 0,-2,2]');
    expect(A).toEqual([v(1, 0, -1), v(2, 4, 0), v(0, -2, 2)]);
  });

  it('lee la matriz asociada, que lleva fracciones', () => {
    // M = [[−1,0,−1],[4,4,−4],[5/2,3/2,−2]]
    const M = leeMatriz('-1,0,-1; 4,4,-4; 5/2,3/2,-2');
    expect(M).not.toBeNull();
    expect(M![2][0].re).toBeCloseTo(2.5, 10);
    expect(M![2][1].re).toBeCloseTo(1.5, 10);
  });

  it('admite saltos de línea como separador de filas', () => {
    expect(leeMatriz('1,0\n0,1')).toEqual([v(1, 0), v(0, 1)]);
  });

  it('admite que cada fila venga entre corchetes', () => {
    expect(leeMatriz('[[1,0],[0,1]]')).toEqual([v(1, 0), v(0, 1)]);
  });

  it('rechaza una tabla dentada: eso no es una matriz', () => {
    expect(leeMatriz('1,0,0; 0,1')).toBeNull();
  });

  it('rechaza lo que en realidad es un vector o un número', () => {
    expect(leeMatriz('1,2,3')).toBeNull();
    expect(leeMatriz('7')).toBeNull();
  });
});

describe('comparaMatriz · el error clásico es darla traspuesta', () => {
  const M = [v(-1, 0, -1), v(4, 4, -4), v(2.5, 1.5, -2)];

  it('acepta la correcta', () => {
    expect(comparaMatriz(M, M, 0.001).igual).toBe(true);
  });

  it('reconoce la traspuesta y la señala como tal', () => {
    const T = M[0].map((_, j) => M.map((f) => f[j]));
    const r = comparaMatriz(T, M, 0.001);
    expect(r.igual).toBe(false);
    expect(r.esLaTraspuesta).toBe(true);
  });

  it('una matriz simétrica es su propia traspuesta, y eso no es un fallo', () => {
    const S = [v(1, 2), v(2, 3)];
    const r = comparaMatriz(S, S, 0.001);
    expect(r.igual).toBe(true);
    expect(r.esLaTraspuesta).toBe(false);
  });

  it('cuenta cuántas entradas fallan cuando no es ni la buena ni la traspuesta', () => {
    const mal = [v(-1, 0, -1), v(4, 4, -4), v(2.5, 1.5, 99)];
    const r = comparaMatriz(mal, M, 0.001);
    expect(r.igual).toBe(false);
    expect(r.esLaTraspuesta).toBe(false);
    expect(r.fallan).toBe(1);
  });

  it('detecta el tamaño distinto', () => {
    const r = comparaMatriz([v(1, 0), v(0, 1)], M, 0.001);
    expect(r.tamanoDistinto).toBe(true);
  });
});

/* La raíz en el DENOMINADOR entró con Álgebra: una base ortonormal se escribe
   así de forma natural, y el esquema rechazó una respuesta correcta por no
   saber leerla. Va aquí y no en complejo.test.ts porque es Álgebra quien lo
   necesita, aunque el arreglo esté en el lector de complejos. */
describe('la raíz en el denominador, que las bases ortonormales piden', () => {
  it('lee 1/√2, 2/√10 y sus equivalentes', () => {
    const v = leeVector('(1/√2, 2/√10, 0)');
    expect(v).not.toBeNull();
    expect(v![0].re).toBeCloseTo(1 / Math.SQRT2, 10);
    expect(v![1].re).toBeCloseTo(2 / Math.sqrt(10), 10);
  });

  it('la forma racionalizada da lo mismo, que es lo que importa', () => {
    const a = leeVector('(1/√10, 2/√10, 0)');
    const b = leeVector('(√10/10, √10/5, 0)');
    expect(comparaVector(a!, b!, 1e-9).igual).toBe(true);
  });

  it('acepta sqrt() además del símbolo, que es lo que se teclea', () => {
    const v = leeVector('(1/sqrt(2), 0, -1/sqrt(2))');
    expect(v).not.toBeNull();
    expect(v![2].re).toBeCloseTo(-1 / Math.SQRT2, 10);
  });

  it('sigue rechazando lo que no es un número', () => {
    expect(leeVector('(1/√0, 1, 1)')).toBeNull();
    expect(leeVector('(1/√, 1, 1)')).toBeNull();
  });
});
