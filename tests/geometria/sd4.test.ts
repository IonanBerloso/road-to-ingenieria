import { describe, expect, it } from 'vitest';
import {
  PT_MM,
  abatidoAlzado,
  abatidoPlanta,
  anguloConPH,
  anguloConPV,
  deltaCota,
  pendiente,
  punto3,
  vm,
  vmAlzado,
  vmPlanta,
  type P3,
} from '../../src/lib/diedrico';

/* SD4 · un poste y tres cables tensores. Ejercicio 4 de la colección de
   diédrico directo (Dpto. de Expresión Gráfica, EIG, UPV/EHU): «Calcular la
   longitud y la pendiente de los cables AB, CD y EF».

   La figura es la del piloto `taller/sd4.js` del paquete de diseño del 8 de
   septiembre de 2026 —las coordenadas del extractor, curadas: los extremos de
   cada cable se toman de sus segmentos—. Los valores esperados se sacaron el
   26 de septiembre de 2026 ejecutando la biblioteca `G` del propio piloto
   sobre esos datos: esta prueba coteja dos implementaciones, y además comprueba
   lo que ninguna de las dos puede fingir (los abatidos a la distancia justa). */

const P: Record<string, P3> = {
  A: punto3([168, 381], [168, 447.48]),
  B: punto3([273.84, 268.92], [273.84, 496.08]),
  C: punto3([305.28, 268.92], [305.28, 518.52]),
  D: punto3([341.94, 349.2], [341.94, 621.96]),
  E: punto3([316.68, 268.92], [316.68, 482.16]),
  F: punto3([402.24, 383.4], [402.24, 422.16]),
};

const ESPERADO = {
  AB: { vm: 57.0214, planta: 41.0862, alzado: 54.3828, dz: 39.5393, angPH: 43.9009, angPV: 17.4983, pend: 0.96235 },
  CD: { vm: 47.9683, planta: 38.7153, alzado: 31.1342, dz: 28.321, angPH: 36.1862, angPV: 49.5294, pend: 0.731519 },
  EF: { vm: 54.6819, planta: 36.8657, alzado: 50.4191, dz: 40.386, angPH: 47.6091, angPV: 22.7734, pend: 1.095489 },
} as const;

describe('SD4 · tres cables y un poste', () => {
  for (const [cable, e] of Object.entries(ESPERADO)) {
    const [p, q] = [P[cable[0]], P[cable[1]]];

    it(`${cable}: longitud, proyecciones y diferencia de cotas, en mm`, () => {
      expect(vm(p, q) * PT_MM).toBeCloseTo(e.vm, 3);
      expect(vmPlanta(p, q) * PT_MM).toBeCloseTo(e.planta, 3);
      expect(vmAlzado(p, q) * PT_MM).toBeCloseTo(e.alzado, 3);
      expect(deltaCota(p, q) * PT_MM).toBeCloseTo(e.dz, 3);
    });

    it(`${cable}: ángulos con los dos planos de proyección y pendiente`, () => {
      expect(anguloConPH(p, q)).toBeCloseTo(e.angPH, 3);
      expect(anguloConPV(p, q)).toBeCloseTo(e.angPV, 3);
      expect(pendiente(p, q)).toBeCloseTo(e.pend, 5);
      /* Y la pendiente es la tangente del ángulo con el plano horizontal. */
      expect(Math.atan(pendiente(p, q)) * (180 / Math.PI)).toBeCloseTo(anguloConPH(p, q), 9);
    });

    it(`${cable}: los ocho abatidos quedan a la verdadera magnitud del otro extremo`, () => {
      /* Por la planta, desde P₁ o desde Q₁, y por el alzado, desde P₂ o desde
         Q₂, a cada lado: ocho posiciones que el ejercicio da por buenas. En
         todas, la distancia al otro extremo tiene que ser la verdadera
         magnitud: es el segundo camino. */
      const L = vm(p, q);
      for (const a of abatidoPlanta(p, q)) expect(Math.hypot(a[0] - p.x, a[1] - p.y)).toBeCloseTo(L, 9);
      for (const a of abatidoPlanta(q, p)) expect(Math.hypot(a[0] - q.x, a[1] - q.y)).toBeCloseTo(L, 9);
      for (const a of abatidoAlzado(p, q)) expect(Math.hypot(a[0] - p.x, a[1] + p.z)).toBeCloseTo(L, 9);
      for (const a of abatidoAlzado(q, p)) expect(Math.hypot(a[0] - q.x, a[1] + q.z)).toBeCloseTo(L, 9);
    });
  }

  it('el abatido por el alzado cae donde lo deja el piloto', () => {
    const [a] = abatidoAlzado(P.A, P.B);
    expect(a[0]).toBeCloseTo(309.1749, 3);
    expect(a[1]).toBeCloseTo(302.2877, 3);
  });
});
