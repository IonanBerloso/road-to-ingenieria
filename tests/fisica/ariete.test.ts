/**
 * El quinto caso de `tests/fisica/`, y llega con el simulador del golpe de
 * ariete.
 *
 * Los números salen del **error típico del propio tema 20**, que es el mejor
 * caso de prueba que hay porque publica los cuatro: la conducción de 800 m de
 * fundición con agua a 2 m/s da a = 1119 m/s y T = 1,43 s, y cerrando en 1 s
 * Allievi da 228 m mientras que en 5 s Michaud da 65. Publica además los dos
 * resultados **equivocados** —326 y 228— que salen de usar la fórmula que no
 * toca, y esos también se comprueban: son los que el simulador tiene que
 * saber distinguir.
 */
import { describe, expect, it } from 'vitest';
import {
  allievi,
  celeridad,
  ciclo,
  clasifica,
  golpe,
  jouguet,
  K_MATERIAL,
  longitudCritica,
  michaud,
  ondaEnValvula,
  periodo,
  techo,
} from '../../src/lib/ariete';

const cerca = (v: number, esperado: number, rel = 0.005) =>
  expect(Math.abs(v - esperado) / Math.abs(esperado)).toBeLessThan(rel);

describe('la celeridad', () => {
  it('con tubo rígido sale la velocidad del sonido en el agua, 1425 m/s', () => {
    cerca(celeridad(0, 0.3, 0.01), 1425, 0.002);
  });

  it('un acero de D/e = 50 anda por los 1200 m/s', () => {
    const a = celeridad(K_MATERIAL.acero, 0.5, 0.01);
    expect(a).toBeGreaterThan(1100);
    expect(a).toBeLessThan(1300);
  });

  it('cuanto más flexible el material, menor celeridad', () => {
    const D = 0.4;
    const e = 0.008;
    const orden = (['acero', 'fundicion', 'hormigon', 'poliester', 'pvc'] as const).map((m) =>
      celeridad(K_MATERIAL[m], D, e),
    );
    for (let i = 1; i < orden.length; i++) expect(orden[i]).toBeLessThan(orden[i - 1]);
  });

  it('y una pared fina golpea menos que una gruesa del mismo material', () => {
    expect(celeridad(1, 0.4, 0.004)).toBeLessThan(celeridad(1, 0.4, 0.02));
  });
});

describe('los 225 m que justifican el tema', () => {
  /* «Agua a 2 m/s por una tubería de fundición con a ≈ 1100 m/s: ΔH ≈ 225 m
     de columna de agua. Veintidós bares por cerrar una llave.» */
  it('a = 1100 y v = 2 dan 225 mca, o sea 22 bar', () => {
    cerca(allievi(1100, 2), 224.5, 0.005);
    cerca((allievi(1100, 2) * 9800) / 1e5, 22, 0.02);
  });
});

describe('el error típico: los mismos datos con las dos fórmulas', () => {
  /* 800 m de fundición, a = 1119 m/s, agua a 2 m/s. */
  const L = 800;
  const a = 1119;
  const v = 2;

  it('el periodo de ida y vuelta es 1,43 s', () => {
    cerca(periodo(L, a), 1.43, 0.005);
    cerca(ciclo(L, a), 2.86, 0.005);
  });

  it('cerrando en 1 s es rápido, y Allievi da 228 m', () => {
    expect(clasifica(L, a, 1)).toBe('rapido');
    cerca(golpe(L, a, v, 1), 228, 0.005);
  });

  it('cerrando en 5 s es lento, y Michaud da 65 m', () => {
    expect(clasifica(L, a, 5)).toBe('lento');
    cerca(golpe(L, a, v, 5), 65.3, 0.01);
  });

  it('los dos resultados equivocados que publica el tema: 326 y 228', () => {
    /* Michaud donde tocaba Allievi, y al revés. Los cuatro números son del
       mismo orden y ninguno chirría: por eso hay que clasificar antes. */
    cerca(michaud(L, v, 1), 326.5, 0.01);
    cerca(allievi(a, v), 228, 0.005);
  });

  it('Jouguet es exactamente la mitad de Michaud', () => {
    expect(jouguet(L, v, 5) * 2).toBeCloseTo(michaud(L, v, 5), 10);
  });
});

/**
 * Y esto es lo que convierte el simulador en teoría y no en ilustración.
 *
 * El tema presenta Allievi y Michaud como dos fórmulas con una frontera, y así
 * leídas parece que en la frontera hay un salto — que cruzar `T_c = 2L/a` por
 * una décima cambia el resultado de golpe. **No lo hay: las dos coinciden ahí
 * exactamente**, y la comprobación cabe en una línea:
 *
 *     Michaud con T_c = 2L/a  →  2Lv / (g·2L/a) = a·v/g  =  Allievi
 *
 * Es decir, el golpe frente al tiempo de cierre es **una sola curva continua**:
 * plana en Allievi mientras el cierre sea rápido y una hipérbola que cae en
 * cuanto se pasa. Eso es lo que el simulador dibuja, y de paso explica por qué
 * cerrar más despacio solo sirve **después** de la frontera: antes de ella no
 * cambia nada.
 *
 * Lo mismo con el techo de presiones, que el tema nombra —«es lo que hay que
 * usar para calcular la resistencia de la tubería, no un valor único»— y no
 * dibuja.
 */
describe('la frontera, que no es un salto', () => {
  const L = 800;
  const a = 1119;
  const v = 2;
  const T = periodo(L, a);

  it('en T_c = 2L/a las dos fórmulas dan exactamente lo mismo', () => {
    expect(michaud(L, v, T)).toBeCloseTo(allievi(a, v), 9);
    expect(clasifica(L, a, T)).toBe('critico');
  });

  it('la curva del golpe es continua al cruzar la frontera', () => {
    const antes = golpe(L, a, v, T * 0.999);
    const despues = golpe(L, a, v, T * 1.001);
    cerca(despues, antes, 0.002);
  });

  it('por debajo de la frontera, cerrar más despacio no sirve de nada', () => {
    for (const Tc of [0.1, 0.5, 1, 1.4]) {
      expect(golpe(L, a, v, Tc)).toBeCloseTo(allievi(a, v), 9);
    }
  });

  it('y por encima el golpe cae con 1/T_c: al doble de tiempo, la mitad', () => {
    cerca(golpe(L, a, v, 10), golpe(L, a, v, 5) / 2, 1e-9);
  });
});

describe('el techo de presiones, que el tema nombra y no dibuja', () => {
  const L = 800;
  const a = 1119;
  const v = 2;

  it('con cierre rápido hay un tramo a golpe completo, y empieza en L_c', () => {
    const Lc = longitudCritica(1, a);
    cerca(Lc, 559.5, 0.005);
    expect(Lc).toBeLessThan(L);
    cerca(techo(L, L, a, v, 1), allievi(a, v), 1e-9);
    cerca(techo(Lc, L, a, v, 1), allievi(a, v), 1e-9);
    cerca(techo(Lc / 2, L, a, v, 1), allievi(a, v) / 2, 1e-9);
  });

  it('en el depósito el golpe es cero, siempre', () => {
    for (const Tc of [0.2, 1, 5, 20]) expect(techo(0, L, a, v, Tc)).toBe(0);
  });

  it('con cierre lento ni la válvula llega a ver el golpe entero', () => {
    const enValvula = techo(L, L, a, v, 5);
    expect(enValvula).toBeLessThan(allievi(a, v));
    /* Y lo que ve es justamente lo que dice Michaud: el techo en la válvula
       y la fórmula de cierre lento son la misma cuenta por dos caminos. */
    cerca(enValvula, michaud(L, v, 5), 1e-9);
  });
});

describe('la onda en la válvula', () => {
  const L = 800;
  const a = 1119;
  const dH = 228;

  it('alterna signo cada 2L/a y vuelve a lo mismo cada 4L/a', () => {
    const T = periodo(L, a);
    cerca(ondaEnValvula(T * 0.5, L, a, dH), dH, 1e-9);
    cerca(ondaEnValvula(T * 1.5, L, a, dH), -dH, 1e-9);
    cerca(ondaEnValvula(T * 2.5, L, a, dH), dH, 1e-9);
  });

  it('la depresión vale tanto como la sobrepresión, que es lo que aplasta', () => {
    const T = periodo(L, a);
    expect(Math.abs(ondaEnValvula(T * 1.5, L, a, dH))).toBeCloseTo(
      ondaEnValvula(T * 0.5, L, a, dH),
      9,
    );
  });

  it('con amortiguamiento la amplitud baja, pero el primer ciclo llega entero', () => {
    const T = periodo(L, a);
    const primero = ondaEnValvula(T * 0.01, L, a, dH, 0.2);
    cerca(primero, dH, 0.01);
    expect(Math.abs(ondaEnValvula(T * 9.5, L, a, dH, 0.2))).toBeLessThan(dH / 2);
  });
});
