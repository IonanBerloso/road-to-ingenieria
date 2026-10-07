import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  PT_MM,
  cambioPlano,
  distanciaAPlano,
  distanciaRectas,
  enPlano,
  enRecta,
  frontalPor,
  perpendicularAPlano,
  pieComun,
  pieEnPlano,
  plano,
  proyAlzado,
  proyPlanta,
  punto3,
  puntoEnPlanoDesdeAlzado,
  rectaPorPuntos,
  vm,
  vmAlzado,
  vmPlanta,
  type P2,
  type P3,
} from '../../src/lib/diedrico';
import type { DatosLamina } from '../../src/lib/lamina';

/* SD54 · el Ejercicio 38 de la Colección de ejercicios de diédrico (Dpto. de
   Expresión Gráfica y Proyectos de Ingeniería, EIG, UPV/EHU), pág. 39: «a)
   Representar la recta r paralela al plano que pase por el punto P. b) Calcular
   la distancia entre la recta r y el plano ABC».

   Las coordenadas son las de la lámina `sd54`. r₁ es horizontal en el papel:
   r es frontal. Las cifras esperadas salen de un segundo camino escrito aparte
   el 2 de octubre de 2026: álgebra de vectores sobre esas mismas coordenadas,
   sin importar nada de `src/lib/`, con la distancia por tres vías que
   coinciden (la fórmula del plano, el pie de la perpendicular con su triángulo
   de verdadera magnitud y el cambio de plano horizontal, en geometría plana
   sobre el papel). Aquí se cotejan contra `lib/diedrico`. */

const L = JSON.parse(readFileSync(join(process.cwd(), 'src', 'content', 'laminas', 'sd54.json'), 'utf8')) as DatosLamina;
const punto = (alzado: string, planta: string): P3 => {
  const [a, p] = [L.puntos[alzado], L.puntos[planta]];
  return punto3([a.x, a.y], [p.x, p.y]);
};
const A = punto('A2', 'A1');
const B = punto('B2', 'B1');
const C = punto('C2', 'C1');
const P = punto('P2', 'P1');
const abc = plano(A, B, C);
const cerca = (p: P2, [x, y]: readonly [number, number], d = 2) => {
  expect(p[0]).toBeCloseTo(x, d);
  expect(p[1]).toBeCloseTo(y, d);
};
const d2 = (a: P2, b: P2) => Math.hypot(a[0] - b[0], a[1] - b[1]);

/* a) r, la frontal por P con la dirección de la frontal del plano por C. */
const f = frontalPor(C, abc);
const D = pieComun(rectaPorPuntos(A, B), f);
const enX = (x: number): P3 => ({ x, y: P.y, z: P.z + ((x - P.x) * f.d.z) / f.d.x });
const M = enX(L.puntos.M1.x);
const N = enX(L.puntos.N1.x);
const r = rectaPorPuntos(M, N);

/* b) el cambio de plano horizontal: la línea nueva perpendicular a r₂ por el
   punto de r₂ prolongada 10 mm más allá de N₂, y P de referencia. */
const M2 = proyAlzado(M);
const N2 = proyAlzado(N);
const u: P2 = [(N2[0] - M2[0]) / d2(M2, N2), (N2[1] - M2[1]) / d2(M2, N2)];
const P4: P2 = [N2[0] + (u[0] * 10) / PT_MM, N2[1] + (u[1] * 10) / PT_MM];
const nueva = { p: P4, d: [-u[1], u[0]] as P2 };
const v4 = (X: P3) => cambioPlano(X, 'horizontal', nueva, P);

describe('SD54 · la recta r paralela al plano ABC, y su distancia', () => {
  it('r₁ es horizontal: r es frontal, y P está en ella', () => {
    const r1 = L.segmentos.find((s) => s.nombre === 'r1');
    expect(r1?.a[1]).toBe(r1?.b[1]);
    expect(L.puntos.P1.y).toBe(r1?.a[1]);
    expect(enRecta(P, r)).toBe(true);
  });

  it('a) la frontal por C corta AB en D, y r₂ es paralela a f₂ = C₂D₂', () => {
    expect(enPlano(D, abc)).toBe(true);
    cerca(proyPlanta(D), [331.6938, 460.56]);
    cerca(proyAlzado(D), [331.6938, 295.3972]);
    const pendF2 = (proyAlzado(D)[1] - proyAlzado(C)[1]) / (proyAlzado(D)[0] - proyAlzado(C)[0]);
    const pendR2 = (N2[1] - M2[1]) / (N2[0] - M2[0]);
    expect(pendR2).toBeCloseTo(pendF2, 9);
    expect((Math.atan(pendR2) * 180) / Math.PI).toBeCloseTo(30.7242, 3);
    cerca(M2, [176.16, 133.3357]);
    cerca(N2, [399, 265.7758]);
    /* paralela al plano: M y N a la misma distancia que P */
    expect(distanciaAPlano(M, abc)).toBeCloseTo(distanciaAPlano(P, abc), 9);
    expect(distanciaAPlano(N, abc)).toBeCloseTo(distanciaAPlano(P, abc), 9);
    expect(distanciaRectas(r, f)).toBeCloseTo(26.0396 / PT_MM, 2);
  });

  it('b) la distancia, 25,76 mm, por la fórmula y por el pie de la perpendicular', () => {
    const d = distanciaAPlano(P, abc) * PT_MM;
    expect(d).toBeCloseTo(25.7644, 3);
    const H = pieEnPlano(P, abc);
    expect(enPlano(H, abc)).toBe(true);
    expect(enRecta(H, perpendicularAPlano(P, abc))).toBe(true);
    cerca(proyPlanta(H), [232.5508, 468.2378]);
    cerca(proyAlzado(H), [232.5508, 227.801]);
    /* el triángulo de la verdadera magnitud: la planta y la diferencia de cotas */
    expect(vmPlanta(P, H) * PT_MM).toBeCloseTo(20.2813, 3);
    expect(Math.abs(P.z - H.z) * PT_MM).toBeCloseTo(15.8895, 3);
    expect(Math.hypot(vmPlanta(P, H), P.z - H.z)).toBeCloseTo(vm(P, H), 9);
  });

  it('b) el cambio de plano: r y la frontal CD de punta, el plano de canto, y P₄H₄ la distancia', () => {
    cerca(v4(P), P4, 6);
    cerca(v4(M), P4, 6);
    cerca(v4(N), P4, 6);
    const [A4, B4, C4, D4] = [A, B, C, D].map(v4);
    cerca(D4, C4, 6);
    cerca(A4, [496.9538, 337.7691]);
    cerca(B4, [383.8847, 364.7765]);
    cerca(C4, [429.9258, 353.7792]);
    /* A₄, B₄ y C₄ en línea */
    const ab: P2 = [A4[0] - B4[0], A4[1] - B4[1]];
    expect(Math.abs((C4[0] - B4[0]) * ab[1] - (C4[1] - B4[1]) * ab[0]) / Math.hypot(...ab)).toBeLessThan(1e-6);
    /* el pie de P₄ en el canto es el pie H del espacio llevado a la vista nueva */
    const H4 = v4(pieEnPlano(P, abc));
    cerca(H4, [440.3349, 351.2929]);
    expect(d2(P4, H4) * PT_MM).toBeCloseTo(25.7644, 3);
    expect(d2(H4, C4) * PT_MM).toBeCloseTo(3.7754, 3);
  });

  it('los distractores y la casualidad que la casilla no distingue', () => {
    /* la separación de r₂ y f₂ en el alzado */
    const pieP2: P2 = (() => {
      const [c, e] = [proyAlzado(C), proyAlzado(D)];
      const w: P2 = [(e[0] - c[0]) / d2(c, e), (e[1] - c[1]) / d2(c, e)];
      const t = (L.puntos.P2.x - c[0]) * w[0] + (L.puntos.P2.y - c[1]) * w[1];
      return [c[0] + t * w[0], c[1] + t * w[1]];
    })();
    expect(vmAlzado(P, puntoEnPlanoDesdeAlzado(pieP2, abc)) * PT_MM).toBeCloseTo(21.114, 3);
    /* PH en el alzado */
    expect(vmAlzado(P, pieEnPlano(P, abc)) * PT_MM).toBeCloseTo(18.4839, 3);
    /* de frente, en alejamiento: el punto del plano con el alzado de P */
    const Y = puntoEnPlanoDesdeAlzado([L.puntos.P2.x, L.puntos.P2.y], abc);
    expect(vmPlanta(P, Y) * PT_MM).toBeCloseTo(36.9839, 3);
    /* P₄C₄, la distancia de r a la frontal CD: a menos de 1 mm de la buena */
    const rf = distanciaRectas(r, f) * PT_MM;
    expect(Math.abs(rf - distanciaAPlano(P, abc) * PT_MM)).toBeLessThan(1);
  });
});
