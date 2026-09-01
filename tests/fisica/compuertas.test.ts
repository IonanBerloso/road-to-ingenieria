/**
 * El tercer caso de `tests/fisica/`, y llega con el simulador del prisma de
 * presiones.
 *
 * Los números salen de los **dos ejemplos introductorios del tema 7** —la
 * compuerta vertical entre 1 y 3 m, y la misma inclinada 60°—, que están
 * publicados en `t07-fuerzas-superficies/ejercicios.yaml` con su resultado
 * paso a paso, y del caso clásico de la compuerta que llega a la lámina libre,
 * cuyo centro de presión está a dos tercios.
 *
 * Se eligieron esos y no un ejercicio de examen a propósito: son los dos que
 * la prosa usa para explicar, así que si el módulo no los reprodujera, el
 * simulador estaría contradiciendo al tema en la misma página.
 */
import { describe, expect, it } from 'vitest';
import {
  area,
  centroideDesdeArriba,
  constanteDeForma,
  inerciaG,
  profundidadIndiferente,
  resuelve,
  type Compuerta,
  type Forma,
} from '../../src/lib/compuertas';

const cerca = (v: number, esperado: number, rel = 0.005) =>
  expect(Math.abs(v - esperado) / Math.abs(esperado)).toBeLessThan(rel);

describe('la compuerta vertical entre 1 y 3 metros', () => {
  /* 2 m de ancho, 2 m de alto, borde superior a 1 m. Publicado: F = 78,4 kN,
     centroide a 2 m y centro de presión a 2,17 m. */
  const escena = { compuerta: { forma: 'rectangulo' as Forma, b: 2, L: 2 }, h1: 1, grados: 90 };

  it('la resultante es 78,4 kN', () => {
    cerca(resuelve(escena).F, 78400, 1e-9);
  });

  it('el centroide está a 2 m y el centro de presión a 2,17', () => {
    const r = resuelve(escena);
    cerca(r.Hg, 2, 1e-9);
    cerca(r.Hp, 2.1667, 0.001);
  });

  it('en vertical, la profundidad y la distancia sobre el plano coinciden', () => {
    const r = resuelve(escena);
    expect(r.Hg).toBeCloseTo(r.Yg, 10);
    expect(r.Hp).toBeCloseTo(r.Yp, 10);
  });
});

describe('la misma compuerta inclinada sesenta grados', () => {
  /* 2 m de ancho, 1,2 m de longitud sobre el plano, borde superior a 1 m.
     Publicado: H_G = 1,520, A = 2,4, F = 35,74 kN, Y_G = 1,755,
     I_G = 0,288 y Y_P = 1,823 m. */
  const escena = { compuerta: { forma: 'rectangulo' as Forma, b: 2, L: 1.2 }, h1: 1, grados: 60 };

  it('el área es 2,4 m² y la inercia 0,288 m⁴', () => {
    cerca(area(escena.compuerta), 2.4, 1e-9);
    cerca(inerciaG(escena.compuerta), 0.288, 1e-9);
  });

  it('el centroide está a 1,520 m de profundidad y a 1,755 sobre el plano', () => {
    const r = resuelve(escena);
    cerca(r.Hg, 1.52, 0.001);
    cerca(r.Yg, 1.755, 0.001);
  });

  it('la resultante es 35,74 kN, con la profundidad y no con la distancia', () => {
    cerca(resuelve(escena).F, 35741, 0.001);
  });

  it('el centro de presión está a 1,823 m sobre el plano', () => {
    cerca(resuelve(escena).Yp, 1.823, 0.001);
  });

  it('confundir Y_G con H_G daría 41,3 kN: por eso van con nombres distintos', () => {
    const r = resuelve(escena);
    cerca(9800 * r.Yg * r.A, 41278, 0.001);
    expect(r.F).toBeLessThan(9800 * r.Yg * r.A);
  });
});

describe('los dos tercios, y cuándo dejan de valer', () => {
  it('una compuerta rectangular que llega a la lámina libre: 2h/3', () => {
    for (const L of [1, 2.5, 7]) {
      const r = resuelve({ compuerta: { forma: 'rectangulo', b: 3, L }, h1: 0, grados: 90 });
      cerca(r.Hp, (2 * L) / 3, 1e-9);
      cerca(r.fraccion, 2 / 3, 1e-9);
    }
  });

  it('en cuanto la compuerta se hunde un poco, ya no son dos tercios', () => {
    const r = resuelve({ compuerta: { forma: 'rectangulo', b: 3, L: 2 }, h1: 1, grados: 90 });
    expect(r.fraccion).toBeLessThan(2 / 3);
    cerca(r.fraccion, 0.5833, 0.001);
  });

  it('y con un triángulo tampoco valen, aunque toque la lámina libre', () => {
    const puntaArriba: Compuerta = { forma: 'triangulo-arriba', b: 2, L: 3 };
    const puntaAbajo: Compuerta = { forma: 'triangulo-abajo', b: 2, L: 3 };
    cerca(resuelve({ compuerta: puntaArriba, h1: 0, grados: 90 }).fraccion, 0.75, 1e-9);
    cerca(resuelve({ compuerta: puntaAbajo, h1: 0, grados: 90 }).fraccion, 0.5, 1e-9);

    /* Los dos triángulos tienen la misma área y la misma inercia, y el centro
       de presión cae en sitios distintos. Lo único que cambia es dónde está el
       centroide, que es lo que la fórmula de los dos tercios da por supuesto. */
    expect(area(puntaArriba)).toBeCloseTo(area(puntaAbajo), 10);
    expect(inerciaG(puntaArriba)).toBeCloseTo(inerciaG(puntaAbajo), 10);
    expect(centroideDesdeArriba(puntaArriba)).toBeCloseTo(2, 10);
    expect(centroideDesdeArriba(puntaAbajo)).toBeCloseTo(1, 10);
  });
});

/**
 * Y esto es lo que convierte el simulador en teoría y no en ilustración.
 *
 * El tema dice que el centro de presión cae por debajo del centroide «tanto
 * más cuanto más cerca esté la superficie de la lámina libre», que es cierto y
 * no se puede usar para nada: no dice cuánto ni a partir de dónde.
 *
 * Medido, la ley es exacta y sale de dos líneas. La excentricidad vale
 * `e = I_G/(Y_G·A)`, y para las formas de los enunciados `I_G/A` es `L²/k` con
 * `k` fijo por la forma. Es decir
 *
 *     e/L = L / (k·Y_G)
 *
 * con **k = 12 en un rectángulo, 16 en un círculo y 18 en un triángulo**, sea
 * cual sea el ancho, el líquido y la inclinación. Y de ahí la respuesta a la
 * pregunta que el tema deja abierta: la excentricidad baja del 1 % de la
 * longitud de la compuerta cuando el centroide está a 8,3 longitudes en un
 * rectángulo, 6,3 en un círculo y 5,6 en un triángulo.
 *
 * Esto no está en la prosa del tema y es lo que el simulador publica.
 */
describe('la constante de forma, y a partir de cuándo da igual', () => {
  const FORMAS: [Forma, number][] = [
    ['rectangulo', 12],
    ['circulo', 16],
    ['triangulo-arriba', 18],
    ['triangulo-abajo', 18],
  ];

  it('I_G/A vale L²/k, con k propio de cada forma', () => {
    for (const [forma, k] of FORMAS) {
      const c: Compuerta = { forma, b: 3.7, L: 2.4 };
      cerca(inerciaG(c) / area(c), (c.L * c.L) / k, 1e-9);
      expect(constanteDeForma(forma)).toBe(k);
    }
  });

  it('e/L = L/(k·Y_G): ni el ancho, ni la inclinación, ni el líquido entran', () => {
    for (const [forma, k] of FORMAS) {
      for (const b of [1, 9]) {
        for (const grados of [30, 90]) {
          const compuerta: Compuerta = { forma, b, L: 1.5 };
          const r = resuelve({ compuerta, h1: 4, grados, gamma: 8000 });
          cerca(r.relativa, compuerta.L / (k * r.Yg), 1e-9);
        }
      }
    }
  });

  it('la excentricidad baja del 1 % a 8,3 longitudes en un rectángulo', () => {
    const compuerta: Compuerta = { forma: 'rectangulo', b: 2, L: 1.5 };
    const Yg = profundidadIndiferente(compuerta);
    cerca(Yg / compuerta.L, 8.333, 0.001);
    /* Se comprueba resolviendo, no repitiendo la fórmula: se busca el h1 que
       deja el centroide justo ahí y se mira la excentricidad que sale. */
    const r = resuelve({ compuerta, h1: Yg - compuerta.L / 2, grados: 90 });
    cerca(r.relativa, 0.01, 1e-9);
  });

  it('y a 6,3 en un círculo y 5,6 en un triángulo', () => {
    cerca(profundidadIndiferente({ forma: 'circulo', b: 1, L: 1 }), 6.25, 1e-9);
    cerca(profundidadIndiferente({ forma: 'triangulo-abajo', b: 1, L: 1 }), 5.556, 0.001);
  });

  it('el centro de presión nunca se sale de la compuerta, por hondo que vaya', () => {
    for (const [forma] of FORMAS) {
      for (const h1 of [0, 0.5, 20, 500]) {
        const r = resuelve({ compuerta: { forma, b: 2, L: 3 }, h1, grados: 45 });
        expect(r.fraccion).toBeGreaterThan(0);
        expect(r.fraccion).toBeLessThanOrEqual(1);
      }
    }
  });
});
