/**
 * El primer caso de `tests/fisica/`, y llega con el simulador del ábaco.
 *
 * Los números no son inventados ni sacados de un libro: son los del
 * **ejercicio 4 del tercer parcial del 3 de junio de 2021**, que está
 * transcrito en el corpus con su resultado publicado. Ese ejercicio es el
 * mejor caso de prueba que hay porque recorre las tres zonas del ábaco con la
 * misma tubería —turbulencia completa en a), transición en b) y régimen liso
 * en c)—, así que verifica las tres ramas de un tirón.
 *
 * La holgura es del 0,5 % y está justificada, no elegida: el corpus resolvió
 * ese apartado con la constante 3,7 y aquí se usa 3,71, que es la que publica
 * la tabla del tema 18. Las dos difieren un 0,15 %. Ajustar la constante para
 * que el test saliera exacto sería justo lo que prohíbe §10.
 */
import { describe, expect, it } from 'vitest';
import {
  Re1,
  Re2,
  f,
  fBlasius,
  fLaminar,
  fRugoso,
  fColebrook,
  regimen,
  reynolds,
  rugosidadDesdeF,
  rugosidadSobreSubcapa,
  sensibilidadRe,
} from '../../src/lib/moody';

/** Tolerancia relativa, con su motivo dicho arriba. */
const cerca = (v: number, esperado: number, rel = 0.005) =>
  expect(Math.abs(v - esperado) / esperado).toBeLessThan(rel);

describe('las cinco fórmulas del tema 18', () => {
  it('laminar es 64/Re, y la rugosidad no aparece', () => {
    expect(fLaminar(1000)).toBeCloseTo(0.064, 10);
    expect(f(1000, 0.02)).toBe(f(1000, 0.000001));
  });

  it('Blasius da 0,0316 en Re = 10⁴', () => {
    cerca(fBlasius(1e4), 0.0316, 1e-6);
  });

  it('las dos fronteras son las de la prosa: con ε/D = 0,001, 23.000 y 560.000', () => {
    expect(Re1(0.001)).toBe(23000);
    expect(Re2(0.001)).toBe(560000);
  });

  it('en rugoso, f no depende del Reynolds', () => {
    const er = 0.01;
    expect(f(1e7, er)).toBe(f(1e8, er));
    expect(sensibilidadRe(1e7, er)).toBe(0);
  });
});

describe('el ejercicio 4 del tercer parcial de junio de 2021', () => {
  const D = 0.25; // m
  const nu = 1.02e-6; // m²/s

  it('a) turbulencia completa: con ε = 0,3316 cm sale f = 0,04181', () => {
    const er = 0.003316 / D;
    cerca(f(6e5, er), 0.04181);
    expect(regimen(6e5, er)).toBe('rugoso');
  });

  it('a, al revés) de f = 0,04181 se despeja ε = 0,3316 cm', () => {
    cerca(rugosidadDesdeF(0.04181) * D * 100, 0.3316, 0.01);
  });

  it('b) transición: con tubo nuevo, ε/D = 0,0006 y Q = 176,46 l/s sale f = 0,0179', () => {
    const Re = reynolds(0.17646, D, nu);
    cerca(Re, 881000, 0.01);
    const er = 0.00015 / D;
    expect(regimen(Re, er)).toBe('semirrugoso');
    cerca(f(Re, er), 0.0179, 0.002);
  });

  it('c) polietileno: ε/D = 4·10⁻⁶ es hidráulicamente liso a ese Reynolds', () => {
    const er = 0.000001 / D;
    const Re = reynolds(0.2, D, nu);
    expect(regimen(Re, er)).toBe('liso-karman');
  });

  it('d) la zona de duda va de 1440 a 2880 l/h', () => {
    const caudal = (Re: number) => (Re * nu * Math.PI * D) / 4;
    cerca(caudal(2000) * 3.6e6, 1440, 0.01);
    cerca(caudal(4000) * 3.6e6, 2880, 0.01);
  });
});

describe('la pregunta que el simulador contesta', () => {
  it('el Reynolds importa en transición y deja de importar en rugoso', () => {
    const er = 0.001;
    const enTransicion = Math.sqrt(Re1(er) * Re2(er)); // en mitad de la franja
    expect(Math.abs(sensibilidadRe(enTransicion, er))).toBeGreaterThan(1e-4);
    expect(sensibilidadRe(Re2(er) * 10, er)).toBe(0);
  });

  it('Colebrook con rugosidad nula es la curva de tubería lisa', () => {
    cerca(fColebrook(1e6, 0), f(1e6, 1e-9), 1e-6);
  });

  it('el rugoso de Karman-Prandtl cuadra con el ábaco: ε/D = 0,01 da 0,038', () => {
    cerca(fRugoso(0.01), 0.038, 0.01);
  });
});

/**
 * Y esto es lo que convierte el simulador en teoría y no en ilustración.
 *
 * La tabla del tema 18 da dos fronteras, 23/(ε/D) y 560/(ε/D), sin decir de
 * dónde salen. La hipótesis era que salen de comparar la rugosidad con el
 * espesor de la subcapa laminar: los ε/δ = 0,3 y ε/δ = 6 de Nikuradse.
 *
 * **Medido, la hipótesis es casi cierta, y por eso hay que decirla bien.** Al
 * recorrer el ábaco entero, ε/δ en la primera frontera va de 0,17 a 0,61 y en
 * la segunda de 3,6 a 10,6: no son constantes. En el rango de rugosidades
 * habituales —de 10⁻⁴ a 10⁻²— se quedan en 0,22-0,33 y 4,6-6,7, que sí son
 * los números clásicos.
 *
 * Así que lo que se publica es esto y no un «son exactamente 0,3 y 6»: el 23
 * y el 560 son la versión en Reynolds de un criterio sobre la subcapa,
 * redondeada para no tener que iterar. El test fija los rangos medidos, que
 * es lo único que §10 permite afirmar.
 */
describe('de dónde salen el 23 y el 560', () => {
  const habituales = [2e-4, 1e-3, 4e-3];
  const todas = [1e-5, 5e-5, 2e-4, 1e-3, 4e-3, 1.5e-2, 5e-2];

  it('en las rugosidades habituales, la primera frontera es el 0,3 de Nikuradse', () => {
    for (const er of habituales) {
      const v = rugosidadSobreSubcapa(Re1(er) * 1.0001, er);
      expect(v).toBeGreaterThan(0.21);
      expect(v).toBeLessThan(0.34);
    }
  });

  it('y la segunda es el 6', () => {
    for (const er of habituales) {
      const v = rugosidadSobreSubcapa(Re2(er) * 1.0001, er);
      expect(v).toBeGreaterThan(4.5);
      expect(v).toBeLessThan(6.8);
    }
  });

  it('pero en el ábaco entero se abren, y por eso no se publica «exactamente»', () => {
    const enRe1 = todas.map((er) => rugosidadSobreSubcapa(Re1(er) * 1.0001, er));
    const enRe2 = todas.map((er) => rugosidadSobreSubcapa(Re2(er) * 1.0001, er));
    cerca(Math.min(...enRe1), 0.167, 0.02);
    cerca(Math.max(...enRe1), 0.607, 0.02);
    cerca(Math.min(...enRe2), 3.555, 0.02);
    cerca(Math.max(...enRe2), 10.586, 0.02);
  });

  it('el cociente crece con el Reynolds: la subcapa se adelgaza', () => {
    const er = 0.001;
    expect(rugosidadSobreSubcapa(1e6, er)).toBeGreaterThan(rugosidadSobreSubcapa(1e5, er));
  });

  it('la subcapa del ejercicio de junio de 2021 tapa el tubo nuevo y no el corroído', () => {
    const D = 0.25;
    expect(rugosidadSobreSubcapa(6e5, 0.003316 / D)).toBeGreaterThan(6);
    expect(rugosidadSobreSubcapa(8.81e5, 0.00015 / D)).toBeLessThan(6);
  });
});
