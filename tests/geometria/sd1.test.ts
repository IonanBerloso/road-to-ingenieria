import { describe, expect, it } from 'vitest';
import {
  PT_MM,
  abatidoPlanta,
  corteConSegmentos,
  distanciaAPlano,
  enPlano,
  horizontalDir,
  lmpDir,
  plano,
  proyAlzado,
  proyPlanta,
  punto3,
  puntoEnPlanoDesdeAlzado,
  puntoEnPlanoDesdePlanta,
  puntoEnSegmento,
  vm,
  vmAlzado,
  vmPlanta,
  type P2,
} from '../../src/lib/diedrico';

/* SD1 · la gota sobre el tejado. Ejercicio 1 de la colección de diédrico
   directo del Departamento de Expresión Gráfica (EIG, UPV/EHU).

   La figura, en pt del PDF con la y hacia abajo, es la del piloto
   `sd1-gota.html` del paquete de diseño del 8 de septiembre de 2026, que es
   la lámina del extractor revisada a mano: el extractor da P₂ en x = 309,18 y
   el piloto lo pone en la vertical exacta de la construcción, 309,12 —dos
   centésimas de milímetro—. Los valores esperados son los del brief, «recalculados
   aparte (Python, numpy) y coinciden con el piloto»: aquí se vuelven a
   comprobar, y además por dos caminos donde se puede (§10). */

const SUELO = 341.64;
const ALZADO: Record<string, P2> = { L: [170.04, 242.4], T: [340.08, 185.76], R: [425.04, 270.72], B: [255.0, 327.48] };
const PLANTA: Record<string, P2> = { L: [170.04, 426.6], T: [340.08, 384.12], R: [425.04, 525.84], B: [255.0, 568.32] };
const P2_: P2 = [309.12, 228.24];

const V = Object.fromEntries(Object.keys(ALZADO).map((k) => [k, punto3(ALZADO[k], PLANTA[k])]));
const tejado = plano(V.L, V.T, V.R);
const P = puntoEnPlanoDesdeAlzado(P2_, tejado);
const baja = lmpDir(tejado).baja;
const aleros: [P2, P2][] = [
  [proyPlanta(V.L), proyPlanta(V.B)],
  [proyPlanta(V.R), proyPlanta(V.B)],
];
const golpe = corteConSegmentos(proyPlanta(P), baja, aleros);
/* Q está SOBRE el alero R–B, que es como lo construye el alumno: en la
   proyección de la arista, en la vertical de Q₁. */
const Q = puntoEnSegmento(V.R, V.B, golpe!.s);
const G2: P2 = [proyAlzado(Q)[0], SUELO];

const cerca = (a: P2, b: P2, tol = 0.01) => {
  expect(Math.abs(a[0] - b[0]), `x ${a[0]} frente a ${b[0]}`).toBeLessThanOrEqual(tol);
  expect(Math.abs(a[1] - b[1]), `y ${a[1]} frente a ${b[1]}`).toBeLessThanOrEqual(tol);
};

describe('SD1 · la gota sobre el tejado', () => {
  it('los cuatro vértices están en un mismo plano: el dato es coherente', () => {
    expect(enPlano(V.B, tejado)).toBe(true);
  });

  it('P₁ cae bajo P₂ y sobre el tejado', () => {
    cerca(proyPlanta(P), [309.12, 438.13]);
    expect(proyAlzado(P)[0]).toBe(P2_[0]);
  });

  it('la gota deja el tejado por el alero delantero derecho, en Q₁ y Q₂', () => {
    expect(golpe!.indice).toBe(1); // R₁B₁, no L₁B₁
    cerca(golpe!.punto, [280.73, 561.89]);
    cerca(proyAlzado(Q), [280.73, 318.89]);
  });

  it('y cae en vertical hasta el suelo, en G₂', () => {
    cerca(G2, [280.73, 341.64]);
  });

  it('las cuatro longitudes que el ejercicio pide o que se confunden con ella', () => {
    expect(vm(P, Q) * PT_MM).toBeCloseTo(55.04, 2);
    expect(vmPlanta(P, Q) * PT_MM).toBeCloseTo(44.79, 2);
    expect(vmAlzado(P, Q) * PT_MM).toBeCloseTo(33.51, 2);
    expect((SUELO - proyAlzado(Q)[1]) * PT_MM).toBeCloseTo(8.03, 2);
  });
});

describe('SD1 por dos caminos', () => {
  it('Q por el alero y Q por el plano se separan menos de lo que ve la regla', () => {
    /* No coinciden, y la prueba lo esperaba: el 26 de septiembre de 2026 dio
       0,10 pt de diferencia en la cota. El vértice B no está exactamente en el
       plano de L, T y R —el redondeo de la lámina lo separa unas décimas—, así
       que la arista R–B y el plano solo se tocan «a la precisión del dato». Lo
       que se exige es lo que importa: que la diferencia quede por debajo de la
       tolerancia de la regla (0,7 mm son 2 pt), y muy por debajo. */
    const porPlano = puntoEnPlanoDesdePlanta(golpe!.punto, tejado);
    expect(Math.abs(porPlano.z - Q.z) * PT_MM).toBeLessThan(0.05);
    expect(distanciaAPlano(V.B, tejado) * PT_MM).toBeLessThan(0.2);
  });

  it('la verdadera magnitud por abatimiento es la de la fórmula', () => {
    /* Se abate el plano proyectante de PQ sobre la planta: Q abatido queda a
       |Δcota| de Q₁, perpendicular a P₁Q₁, y la distancia de P₁ a él es la
       verdadera magnitud. Los dos lados del abatimiento valen. */
    for (const q of abatidoPlanta(P, Q)) {
      expect(Math.hypot(q[0] - P.x, q[1] - P.y)).toBeCloseTo(vm(P, Q), 9);
    }
  });

  it('la l.m.p. es perpendicular a las horizontales del plano, en la planta', () => {
    const h = horizontalDir(tejado);
    expect(baja[0] * h[0] + baja[1] * h[1]).toBeCloseTo(0, 12);
  });

  it('y baja: recorrerla hace perder cota', () => {
    const un: P2 = [P.x + baja[0] * 10, P.y + baja[1] * 10];
    expect(puntoEnPlanoDesdePlanta(un, tejado).z).toBeLessThan(P.z);
  });
});

describe('lo que la biblioteca no deja pasar', () => {
  it('dos proyecciones que no están en la misma vertical no son un punto', () => {
    expect(() => punto3([100, 200], [103, 400])).toThrow(/misma vertical/);
  });

  it('tres puntos alineados no definen un plano', () => {
    const a = punto3([0, 0], [0, 10]);
    const b = punto3([10, -10], [10, 20]);
    const c = punto3([20, -20], [20, 30]);
    expect(() => plano(a, b, c)).toThrow(/alineados/);
  });

  it('un plano horizontal no tiene línea de máxima pendiente', () => {
    const h = plano(punto3([0, -5], [0, 0]), punto3([10, -5], [10, 0]), punto3([0, -5], [0, 10]));
    expect(() => lmpDir(h)).toThrow(/horizontal/);
  });
});
