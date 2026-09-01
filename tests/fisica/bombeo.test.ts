/**
 * El segundo caso de `tests/fisica/`, y llega con el simulador del punto de
 * funcionamiento.
 *
 * Los números salen todos del **ejercicio 2 de la ordinaria de 2025-2026**,
 * que está transcrito en el corpus con sus resultados publicados. Se eligió
 * porque es el ejercicio más completo de bombeo que hay: tres bombas con su
 * curva analítica, una instalación con Hazen-Williams, cavitación con NPSH y
 * una maniobra de válvula. Seis resultados publicados que verifican cinco
 * ramas distintas del módulo de un tirón.
 *
 * La holgura por defecto es del 0,5 %, y está justificada, no elegida: los
 * resultados del examen están redondeados a dos decimales y algunos arrastran
 * ese redondeo por tres pasos. Donde hace falta más se dice en la línea.
 */
import { describe, expect, it } from 'vitest';
import {
  caudalLimite,
  constanteHomologa,
  desvioHomologo,
  hBomba,
  hInstalacion,
  homologo,
  npshDisponible,
  npshRequerido,
  puntoDeFuncionamiento,
  type Bomba,
  type Instalacion,
} from '../../src/lib/bombeo';

const cerca = (v: number, esperado: number, rel = 0.005) =>
  expect(Math.abs(v - esperado) / Math.abs(esperado)).toBeLessThan(rel);

/* La instalación del enunciado: dos depósitos abiertos con 40 m de desnivel,
   850 m de PVC de 150 mm y una válvula con k₀ = 5. */
const INST: Instalacion = { Hi0: 40, a: 0.02758, b: 8.17e-4 };

const BOMBA1: Bomba = { A: 76.5, B: 0.2108 };
const BOMBA2: Bomba = { A: 83, B: 0.155 };
const BOMBA3: Bomba = { A: 80, B: 0.127 };

/* La aspiración: 100 m de tubería, la bomba 5 m por encima de la lámina. */
const ASP = { pat: 10, pv: 0.2, zasp: 5, aAsp: 3.245e-5 * 100 };

describe('la ordinaria de 2025-2026, apartado a)', () => {
  it('la bomba 3 corta la curva de la instalación en 16,55 l/s', () => {
    cerca(puntoDeFuncionamiento(BOMBA3, INST).Q, 16.55);
  });

  it('la bomba 1 la corta en 12,58 l/s, por debajo del caudal mínimo de 14', () => {
    const p = puntoDeFuncionamiento(BOMBA1, INST);
    cerca(p.Q, 12.58);
    expect(p.Q).toBeLessThan(14);
  });

  it('la bomba 2 la corta en 15,71 l/s, que es el caudal donde se mira si cavita', () => {
    cerca(puntoDeFuncionamiento(BOMBA2, INST).Q, 15.71);
  });

  it('en el punto de funcionamiento las dos curvas valen lo mismo', () => {
    const { Q, H } = puntoDeFuncionamiento(BOMBA3, INST);
    cerca(hBomba(Q, BOMBA3), hInstalacion(Q, INST), 1e-6);
    cerca(H, hInstalacion(Q, INST), 1e-9);
  });
});

describe('la cavitación de la bomba 2', () => {
  it('el NPSH disponible a 15,71 l/s es 4,27 mca', () => {
    cerca(npshDisponible(15.71, ASP), 4.27);
  });

  it('el requerido es 4,91, así que cavita', () => {
    const req = { c: 2, e: 0.0118 };
    cerca(npshRequerido(15.71, req), 4.91);
    expect(npshRequerido(15.71, req)).toBeGreaterThan(npshDisponible(15.71, ASP));
  });

  it('deja de cavitar a 14,15 l/s, que es donde se cruzan los dos NPSH', () => {
    cerca(caudalLimite(ASP, { c: 2, e: 0.0118 }), 14.15);
  });

  it('la bomba 3 no cavita: su NPSH requerido apenas sube con el caudal', () => {
    const limite = caudalLimite(ASP, { c: 2.2, e: 0.0002 });
    expect(limite).toBeGreaterThan(16.55);
  });
});

describe('la maniobra de válvula del apartado b)', () => {
  /* Se cierra la válvula hasta llevar el caudal al límite de cavitación. Lo
     que se pierde es lo que la bomba sigue dando de más: 8,09 m publicados. */
  it('a 14,15 l/s la bomba da 51,98 m y la instalación pide 43,89', () => {
    cerca(hBomba(14.15, BOMBA2), 51.98);
    cerca(hInstalacion(14.15, INST), 43.89);
  });

  it('la pérdida que introduce la válvula es 8,09 mca', () => {
    cerca(hBomba(14.15, BOMBA2) - hInstalacion(14.15, INST), 8.09, 0.01);
  });
});

describe('la ordinaria de 2021-2022: otra curva de bomba, otra escala', () => {
  /* H = 24,49 − 5,061·10⁻⁴ Q², con Q en l/s. Sirve para comprobar que el
     módulo no está ajustado a los coeficientes de un solo enunciado. */
  const tb: Bomba = { A: 24.49, B: 5.061e-4 };
  it('a caudal nulo da 24,49 mca y el caudal de altura nula es coherente', () => {
    expect(hBomba(0, tb)).toBeCloseTo(24.49, 10);
    cerca(Math.sqrt(tb.A / tb.B), 219.9, 0.01);
  });
});

/**
 * Y esto es lo que convierte el simulador en teoría y no en ilustración.
 *
 * El error típico del tema 25 afirma que los puntos de igual rendimiento están
 * sobre una parábola por el origen, y que **la curva de la instalación solo es
 * una de esas parábolas si Hi0 = 0**. De ahí la consecuencia que casi nadie
 * aplica: bajar el régimen de giro no mueve el punto de funcionamiento por una
 * parábola de rendimiento constante, salvo en una instalación sin desnivel.
 *
 * Medido, la afirmación es cierta y es **mucho más grande de lo que suena**.
 * Con los 40 m de desnivel de este enunciado, aplicar las leyes de semejanza
 * al punto de funcionamiento en vez de a la curva de la bomba se equivoca en
 * el caudal así:
 *
 * | régimen | caudal real | error de la predicción |
 * |---|---|---|
 * | 95 % | 14,83 l/s | 6,0 % |
 * | 90 % | 13,00 l/s | 14,6 % |
 * | 85 % | 11,00 l/s | 27,9 % |
 * | 80 % | 8,70 l/s | **52,1 %** |
 * | 75 % | 5,79 l/s | 114,3 % |
 *
 * Bajar el régimen un 20 % no baja el caudal un 20 %: lo baja casi a la mitad,
 * porque los 40 m de desnivel hay que seguir venciéndolos enteros. Y por
 * debajo del 70,7 % la bomba ya ni arranca, que es donde `n²·80 < 40`.
 *
 * Sin desnivel el error no se anula del todo —0,20 % al 80 %— y no por un
 * fallo del modelo: la curva de la instalación lleva un término con exponente
 * 1,852, así que ni con Hi0 = 0 es exactamente una parábola. Ese resto se fija
 * aquí para que nadie lo redondee a cero y publique un «coinciden».
 */
describe('por qué no se pueden aplicar las leyes de semejanza al punto', () => {
  const SIN_DESNIVEL: Instalacion = { ...INST, Hi0: 0 };

  it('el homólogo está sobre la parábola de rendimiento constante, por construcción', () => {
    const p0 = puntoDeFuncionamiento(BOMBA3, INST);
    const K = constanteHomologa(p0);
    const h = homologo(p0, 0.8);
    cerca(h.H, K * h.Q * h.Q, 1e-9);
  });

  it('con 40 m de desnivel, bajar el régimen un 20 % baja el caudal casi a la mitad', () => {
    cerca(puntoDeFuncionamiento(BOMBA3, INST).Q, 16.55);
    cerca(puntoDeFuncionamiento(BOMBA3, INST, 0.8).Q, 8.7, 0.01);
  });

  it('y predecir ese caudal con semejanza se equivoca un 52 %', () => {
    cerca(desvioHomologo(BOMBA3, INST, 0.8), 0.521, 0.01);
  });

  it('sin desnivel el error casi desaparece, pero no del todo: queda el 1,852', () => {
    const d = desvioHomologo(BOMBA3, SIN_DESNIVEL, 0.8);
    cerca(d, 0.002016, 0.01);
    expect(Math.abs(d)).toBeGreaterThan(0);
  });

  it('el error crece cuanto más se baja el régimen: 6 %, 15 %, 28 %, 52 %', () => {
    const medido = [0.95, 0.9, 0.85, 0.8].map((n) => desvioHomologo(BOMBA3, INST, n));
    for (const [i, esperado] of [0.06, 0.146, 0.279, 0.521].entries()) {
      cerca(medido[i], esperado, 0.01);
    }
  });

  it('a régimen bajo la bomba deja de arrancar: no da ni el desnivel', () => {
    /* n²·80 < 40 en cuanto n < 0,707. Ahí el caudal es cero, no negativo. */
    expect(puntoDeFuncionamiento(BOMBA3, INST, 0.6).Q).toBe(0);
  });
});
