import { describe, expect, it } from 'vitest';
import {
  PT_MM,
  anguloPlanoConPH,
  distanciaARecta,
  pieEnRecta,
  plano,
  proyAlzado,
  proyPlanta,
  punto3,
  puntosADistancia,
  rectaDesdeProyecciones,
  vm,
  vmPlanta,
  type P2,
} from '../../src/lib/diedrico';

/* SD5 · un cuadrado entre dos rectas. Ejercicio 5 de la colección de diédrico
   directo (Dpto. de Expresión Gráfica, EIG, UPV/EHU): «Dibujar las
   proyecciones diédricas de un cuadrado. Datos: el punto A es un vértice del
   cuadrado, un lado está situado sobre la recta r y el lado opuesto en la
   recta s».

   La figura es la del piloto `taller/sd5.js` del paquete de diseño del 8 de
   septiembre de 2026. Los valores esperados se sacaron el 27 de septiembre de
   2026 ejecutando la función `solucion` del propio piloto sobre esos datos.

   Una diferencia de método, medida: el piloto pone B₂ sobre la recta r₂ ≡ s₂
   dibujada, y aquí B sale de A tal como está en la lámina, que es como lo
   construye el alumno con el compás. A₂ queda a 0,05 pt de s₂ —el redondeo de
   la lámina—, así que las posiciones se cotejan a 0,1 pt (0,035 mm), veinte
   veces por debajo de la regla. */

const R2S2: [P2, P2] = [[197.28, 385.44], [376.92, 281.64]];
const R1: [P2, P2] = [[197.28, 448.44], [376.92, 448.44]];
const S1: [P2, P2] = [[197.28, 519.36], [376.92, 519.36]];
const A = punto3([226.68, 368.4], [226.68, 519.36]);

const r = rectaDesdeProyecciones(R2S2, R1);
const s = rectaDesdeProyecciones(R2S2, S1);

const ESPERADO = {
  B: [
    { alzado: [288.086, 332.9703], planta: [288.086, 519.36] },
    { alzado: [165.274, 403.9338], planta: [165.274, 519.36] },
  ],
  C: [
    { alzado: [288.086, 332.9703], planta: [288.086, 448.44] },
    { alzado: [165.274, 403.9338], planta: [165.274, 448.44] },
  ],
  D: { alzado: [226.68, 368.4], planta: [226.68, 448.44] },
  ladoMm: 25.019,
  angPH: 30.0203,
  plantaAbMm: 21.6627,
} as const;

const cerca = (a: readonly number[], b: readonly number[], tol = 0.1) =>
  a.forEach((v, i) => expect(Math.abs(v - b[i]), `${a} frente a ${b}`).toBeLessThanOrEqual(tol));

describe('SD5 · un cuadrado entre dos rectas', () => {
  const D = pieEnRecta(A, r);
  const lado = vm(A, D);
  const B = puntosADistancia(s, A, lado);
  const C = B.map((b) => pieEnRecta(b, r));

  it('r y s son frontales y paralelas: la planta horizontal es alejamiento constante', () => {
    expect(Math.abs(r.d.y)).toBeLessThan(1e-12);
    expect(Math.abs(s.d.y)).toBeLessThan(1e-12);
    expect(Math.abs(r.d.x * s.d.z - r.d.z * s.d.x)).toBeLessThan(1e-12);
  });

  it('A está en s, a la precisión de la lámina', () => {
    expect(distanciaARecta(A, s)).toBeLessThan(0.5);
    expect(distanciaARecta(A, r)).toBeGreaterThan(70);
  });

  it('D es el pie de la perpendicular desde A sobre r: AD es de punta', () => {
    cerca(proyPlanta(D), ESPERADO.D.planta);
    cerca(proyAlzado(D), ESPERADO.D.alzado);
    /* De punta: solo cambia el alejamiento, y en el alzado es un punto. */
    expect(Math.abs(D.x - A.x)).toBeLessThan(0.1);
    expect(Math.abs(D.z - A.z)).toBeLessThan(0.1);
  });

  it('el lado es la distancia entre r y s, y se lee en la planta', () => {
    expect(lado * PT_MM).toBeCloseTo(ESPERADO.ladoMm, 3);
  });

  it('B, a la longitud del lado sobre s, a un lado o al otro de A', () => {
    B.forEach((b, i) => {
      cerca(proyAlzado(b), ESPERADO.B[i].alzado);
      cerca(proyPlanta(b), ESPERADO.B[i].planta);
      expect(vm(A, b)).toBeCloseTo(lado, 9);
    });
  });

  it('C, el pie desde B sobre r: BC también es de punta', () => {
    C.forEach((c, i) => {
      cerca(proyAlzado(c), ESPERADO.C[i].alzado);
      cerca(proyPlanta(c), ESPERADO.C[i].planta);
    });
  });

  it('el plano del cuadrado es de canto, a 30° del horizontal', () => {
    expect(anguloPlanoConPH(plano(A, B[0], D))).toBeCloseTo(ESPERADO.angPH, 1);
  });

  it('la planta acorta los lados frontales, y no los de punta', () => {
    expect(vmPlanta(A, B[0]) * PT_MM).toBeCloseTo(ESPERADO.plantaAbMm, 1);
    expect(vmPlanta(A, D) * PT_MM).toBeCloseTo(ESPERADO.ladoMm, 2);
  });

  it('un punto de partida que no está en la recta es un error, no una aproximación', () => {
    expect(() => puntosADistancia(r, A, lado)).toThrow(/no está en la recta/);
  });

  it('una recta de perfil no la fijan sus proyecciones: se da por dos puntos', () => {
    const perfil: [P2, P2] = [[200, 300], [200, 400]];
    expect(() => rectaDesdeProyecciones(perfil, perfil)).toThrow(/perfil/);
  });
});
