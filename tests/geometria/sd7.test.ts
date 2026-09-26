import { describe, expect, it } from 'vitest';
import {
  PT_MM,
  anguloPlanoConPH,
  distanciaARecta,
  enPlano,
  horizontalPor,
  lmpDir,
  planoPorLmp,
  proyAlzado,
  proyPlanta,
  punto3,
  puntosADistancia,
  rectaDesdeProyecciones,
  rectaPorPuntos,
  simetrico,
  vm,
  vmAlzado,
  vmPlanta,
  type P2,
} from '../../src/lib/diedrico';

/* SD7 · un cuadrado sobre su diagonal. Ejercicio 7 de la colección de
   diédrico directo: «Dibujar las proyecciones diédricas del cuadrado de 5 cm
   de lado situado en el plano definido por la l.m.p. que se muestra. Datos: el
   centro del cuadrado es el punto O y una de las diagonales se encuentra sobre
   la l.m.p.».

   La figura es la del piloto `taller/sd7.js` del paquete de diseño del 8 de
   septiembre de 2026, y los valores esperados salen de ejecutar su función
   `solucion` el 27 de septiembre de 2026. O₁ queda a 0,06 pt de r₁ —el
   redondeo de la lámina—: las posiciones se cotejan a 0,1 pt. La trampa del
   ejercicio es que r₂ está a 45° justos y el plano no. */

const R2: [P2, P2] = [[135.96, 388.2], [316.32, 207.84]];
const R1: [P2, P2] = [[135.96, 503.04], [316.32, 437.4]];
const O = punto3([212.46, 311.7], [212.46, 475.14]);

const r = rectaDesdeProyecciones(R2, R1);
const pl = planoPorLmp(r);
const semidiagonal = ((50 / PT_MM) * Math.SQRT2) / 2;

const ESPERADO = {
  A: { alzado: [281.09, 243.07], planta: [281.09, 450.1629] },
  C: { alzado: [143.83, 380.33], planta: [143.83, 500.1171] },
  B: { alzado: [246.7346, 311.7], planta: [246.7346, 569.3168] },
  D: { alzado: [178.1854, 311.7], planta: [178.1854, 380.9632] },
  diagonalMm: 70.7107,
  angPH: 43.2195,
  a1c1Mm: 51.5294,
  a2c2Mm: 68.4795,
} as const;

const cerca = (a: readonly number[], b: readonly number[], tol = 0.1) =>
  a.forEach((v, i) => expect(Math.abs(v - b[i]), `${a} frente a ${b}`).toBeLessThanOrEqual(tol));

describe('SD7 · un cuadrado sobre su diagonal', () => {
  const [A, C] = puntosADistancia(r, O, semidiagonal);
  const h = horizontalPor(O, pl);
  const [B, D] = puntosADistancia(h, O, semidiagonal);

  it('r es la línea de máxima pendiente del plano que define', () => {
    const sube = lmpDir(pl).sube;
    /* La l.m.p. del plano va, en la planta, por donde va r₁. */
    expect(Math.abs(sube[0] * r.d.y - sube[1] * r.d.x)).toBeLessThan(1e-9);
  });

  it('el plano está a 43,2° del horizontal, no a los 45° que parece en el alzado', () => {
    expect(anguloPlanoConPH(pl)).toBeCloseTo(ESPERADO.angPH, 3);
    expect(Math.abs(anguloPlanoConPH(pl) - 45)).toBeGreaterThan(1);
  });

  it('O está en r y en el plano, a la precisión de la lámina', () => {
    expect(distanciaARecta(O, r)).toBeLessThan(0.5);
    expect(enPlano(O, pl)).toBe(true);
  });

  it('A y C, a media diagonal de O en verdadera magnitud sobre r', () => {
    cerca(proyAlzado(A), ESPERADO.A.alzado);
    cerca(proyPlanta(A), ESPERADO.A.planta);
    cerca(proyAlzado(C), ESPERADO.C.alzado);
    cerca(proyPlanta(C), ESPERADO.C.planta);
    expect(vm(A, C) * PT_MM).toBeCloseTo(ESPERADO.diagonalMm, 3);
  });

  it('C es el simétrico de A respecto de O', () => {
    const c = simetrico(A, O);
    cerca(proyPlanta(c), proyPlanta(C), 1e-9);
    cerca(proyAlzado(c), proyAlzado(C), 1e-9);
  });

  it('B y D, sobre la horizontal del plano por O, que se mide en la planta', () => {
    /* El sentido de una horizontal no está fijado: se cotejan como pareja. */
    const [b, d] = proyPlanta(B)[0] > proyPlanta(D)[0] ? [B, D] : [D, B];
    cerca(proyAlzado(b), ESPERADO.B.alzado);
    cerca(proyPlanta(b), ESPERADO.B.planta);
    cerca(proyAlzado(d), ESPERADO.D.alzado);
    cerca(proyPlanta(d), ESPERADO.D.planta);
    expect(Math.abs(B.z - O.z)).toBeLessThan(1e-9);
    expect(vmPlanta(B, D) * PT_MM).toBeCloseTo(ESPERADO.diagonalMm, 3);
  });

  it('las proyecciones de la diagonal AC: la planta la acorta más que el alzado', () => {
    expect(vmPlanta(A, C) * PT_MM).toBeCloseTo(ESPERADO.a1c1Mm, 3);
    expect(vmAlzado(A, C) * PT_MM).toBeCloseTo(ESPERADO.a2c2Mm, 3);
  });

  it('una recta horizontal no es la l.m.p. de ningún plano, ni una vertical', () => {
    const horizontal = rectaPorPuntos({ x: 0, y: 0, z: 10 }, { x: 10, y: 5, z: 10 });
    const vertical = rectaPorPuntos({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
    expect(() => planoPorLmp(horizontal)).toThrow(/horizontal/);
    expect(() => planoPorLmp(vertical)).toThrow(/vertical/);
  });

  it('un plano horizontal no tiene una horizontal que elegir, y el punto tiene que estar en el plano', () => {
    const horizontal = { n: { x: 0, y: 0, z: 1 }, d: -300 };
    expect(() => horizontalPor({ x: 0, y: 0, z: -300 }, horizontal)).toThrow(/horizontal/);
    expect(() => horizontalPor({ x: 0, y: 0, z: 0 }, pl)).toThrow(/no está en el plano/);
  });
});
