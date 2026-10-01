import { describe, expect, it } from 'vitest';
import {
  PT_MM,
  abatido,
  abatidoJunto,
  anguloPlanoConPH,
  anguloPlanoConPV,
  cambioPlano,
  deltaCota,
  frontalPor,
  gira,
  horizontalPor,
  pieEnRecta,
  plano,
  proyAlzado,
  proyPlanta,
  punto3,
  vm,
  vmAlzado,
  vmPlanta,
  type P2,
  type P3,
  type Recta2,
  type Recta3,
} from '../../src/lib/diedrico';

/* PVM · el ejercicio «Plano en VM» (Ejercicio_PlanoVM.pdf, la hoja de clase
   del tema 3: la verdadera magnitud del plano ABC por seis métodos). La
   lámina es `src/content/laminas/pvm.json`, sacada de los trazos vectoriales
   del PDF.

   Las cifras esperadas se sacaron el 1 de octubre de 2026 por un segundo
   camino, sin lib/diedrico: álgebra de vectores sobre las coordenadas de la
   lámina, con los abatimientos hechos con el triángulo de las diapositivas,
   los cambios de plano llevando cotas y distancias a la línea nueva, y los
   giros como rotaciones planas de cada vista. Aquí se cotejan con
   lib/diedrico, y se comprueba lo que ninguna de las dos cuentas puede
   fingir: que los seis métodos dan los mismos tres lados. */

const A = punto3([384.6, 189.96], [384.6, 528.6]);
const B = punto3([314.76, 271.8], [314.76, 463.08]);
const C = punto3([449.76, 322.32], [449.76, 423.12]);
const abc = plano(A, B, C);
const mm = (v: number) => v * PT_MM;
const d2 = (a: P2, b: P2) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const pl = (P: P3) => proyPlanta(P);
const al = (P: P3) => proyAlzado(P);

const LADOS = { AB: 44.4392, BC: 52.7684, CA: 63.9794 };

describe('PVM · el plano ABC en verdadera magnitud', () => {
  it('los tres lados, y lo que acortan la planta y el alzado', () => {
    expect(mm(vm(A, B))).toBeCloseTo(LADOS.AB, 3);
    expect(mm(vm(B, C))).toBeCloseTo(LADOS.BC, 3);
    expect(mm(vm(C, A))).toBeCloseTo(LADOS.CA, 3);
    expect(mm(vmPlanta(A, B))).toBeCloseTo(33.783, 3);
    expect(mm(vmPlanta(B, C))).toBeCloseTo(49.6676, 3);
    expect(mm(vmPlanta(C, A))).toBeCloseTo(43.7385, 3);
    expect(mm(vmAlzado(A, B))).toBeCloseTo(37.955, 3);
    expect(mm(vmAlzado(B, C))).toBeCloseTo(50.8505, 3);
    expect(mm(vmAlzado(C, A))).toBeCloseTo(52.0452, 3);
  });

  it('el plano es casi paralelo a la línea de tierra: sus ángulos con PH y PV suman 90°', () => {
    expect(anguloPlanoConPH(abc)).toBeCloseTo(51.4011, 3);
    expect(anguloPlanoConPV(abc)).toBeCloseTo(38.5991, 3);
    expect(anguloPlanoConPH(abc) + anguloPlanoConPV(abc)).toBeCloseTo(90, 2);
  });

  describe('método 5: la horizontal por C de charnela', () => {
    const h = horizontalPor(C, abc);
    const [A1, A2] = abatido(A, h, abc);
    it('A abatido cae donde lo deja el triángulo de las diapositivas, a los dos lados', () => {
      expect(pl(A1)[0]).toBeCloseTo(385.3498, 3);
      expect(pl(A1)[1]).toBeCloseTo(253.5843, 3);
      expect(pl(A2)[0]).toBeCloseTo(384.4263, 3);
      expect(pl(A2)[1]).toBeCloseTo(592.302, 3);
      expect(A1.z).toBeCloseTo(C.z, 9);
    });
    it('B, con el mismo giro que A: el triángulo abatido tiene los lados de verdad', () => {
      for (const Aab of [A1, A2]) {
        const Bab = abatidoJunto(B, h, abc, Aab, A);
        expect(mm(d2(pl(Aab), pl(Bab)))).toBeCloseTo(LADOS.AB, 3);
        expect(mm(d2(pl(Bab), pl(C)))).toBeCloseTo(LADOS.BC, 3);
        expect(mm(d2(pl(C), pl(Aab)))).toBeCloseTo(LADOS.CA, 3);
      }
      const Bab = abatidoJunto(B, h, abc, A1, A);
      expect(pl(Bab)[0]).toBeCloseTo(315.0462, 3);
      expect(pl(Bab)[1]).toBeCloseTo(358.1103, 3);
    });
    it('el radio de A es la hipotenusa de su distancia en planta a h₁ y su diferencia de cotas con C', () => {
      const M = pieEnRecta(A, h);
      expect(mm(vmPlanta(A, M))).toBeCloseTo(37.2735, 3);
      expect(mm(deltaCota(A, C))).toBeCloseTo(46.6937, 3);
      /* el triángulo de las diapositivas, con la biblioteca: su hipotenusa es la
         distancia real de A a la charnela, y la mitad de lo que separa los dos
         abatidos, que caen a los dos lados de M */
      expect(Math.hypot(vmPlanta(A, M), deltaCota(A, C))).toBeCloseTo(vm(A, M), 9);
      expect(d2(pl(A1), pl(A2)) / 2).toBeCloseTo(vm(A, M), 9);
      expect(mm(vm(A, M))).toBeCloseTo(59.7463, 3);
    });
  });

  describe('método 6: la frontal por C de charnela', () => {
    const f = frontalPor(C, abc);
    const [A1, A2] = abatido(A, f, abc);
    it('A abatido sobre el plano frontal de C, a los dos lados', () => {
      expect(al(A1)[0]).toBeCloseTo(384.7262, 3);
      expect(al(A1)[1]).toBeCloseTo(153.0226, 3);
      expect(al(A2)[0]).toBeCloseTo(383.5712, 3);
      expect(al(A2)[1]).toBeCloseTo(491.1692, 3);
      expect(A1.y).toBeCloseTo(C.y, 9);
    });
    it('y el triángulo abatido en el alzado es el mismo', () => {
      const Bab = abatidoJunto(B, f, abc, A1, A);
      expect(mm(d2(al(A1), al(Bab)))).toBeCloseTo(LADOS.AB, 3);
      expect(mm(d2(al(Bab), al(C)))).toBeCloseTo(LADOS.BC, 3);
      expect(mm(d2(al(C), al(A1)))).toBeCloseTo(LADOS.CA, 3);
    });
  });

  it('métodos 1 y 2: dos cambios de plano dan los mismos lados', () => {
    const h = horizontalPor(C, abc);
    const f = frontalPor(C, abc);
    const lados = (P: P2, Q: P2, R: P2) => [d2(P, Q), d2(Q, R), d2(R, P)].map(mm);
    // Método 1: línea nueva ⟂ h₁, a la izquierda; luego, paralela al canto.
    const n1: P2 = [-h.d.y, h.d.x];
    const l1: Recta2 = { p: [250, 423], d: n1 };
    const [A4, B4, C4] = [A, B, C].map((P) => cambioPlano(P, 'vertical', l1, C));
    const canto: P2 = [A4[0] - C4[0], A4[1] - C4[1]];
    const u = Math.hypot(...canto);
    const l2: Recta2 = { p: [C4[0] - (40 * canto[1]) / u, C4[1] + (40 * canto[0]) / u], d: canto };
    const v1 = [A, B, C].map((P) => cambioPlano(P, 'vertical', l1, C, l2));
    expect(Math.abs((B4[0] - C4[0]) * canto[1] - (B4[1] - C4[1]) * canto[0]) / u).toBeLessThan(1e-6);
    lados(v1[0], v1[1], v1[2]).forEach((l, i) => expect(l).toBeCloseTo(Object.values(LADOS)[i], 3));
    // Método 2: línea nueva ⟂ f₂; luego, paralela al canto.
    const m1: Recta2 = { p: [250, 322], d: [f.d.z, f.d.x] };
    const [W4, , WC] = [A, B, C].map((P) => cambioPlano(P, 'horizontal', m1, C));
    const cantoW: P2 = [W4[0] - WC[0], W4[1] - WC[1]];
    const uw = Math.hypot(...cantoW);
    const m2: Recta2 = { p: [WC[0] - (40 * cantoW[1]) / uw, WC[1] + (40 * cantoW[0]) / uw], d: cantoW };
    const v2 = [A, B, C].map((P) => cambioPlano(P, 'horizontal', m1, C, m2));
    lados(v2[0], v2[1], v2[2]).forEach((l, i) => expect(l).toBeCloseTo(Object.values(LADOS)[i], 3));
  });

  it('método 3: dos giros dan los mismos lados, y el segundo giro es el ángulo del plano con el PH', () => {
    const vertical: Recta3 = { p: C, d: { x: 0, y: 0, z: 1 } };
    const dePunta: Recta3 = { p: C, d: { x: 0, y: 1, z: 0 } };
    const h = horizontalPor(C, abc);
    // método 3: eje vertical hasta dejar h de punta; eje de punta hasta dejar el plano horizontal
    const g1 = 90 - (Math.atan2(h.d.y, h.d.x) * 180) / Math.PI;
    const P1 = [A, B, C].map((P) => gira(P, vertical, g1));
    /* la horizontal por C, girada, queda de punta: su otro punto, con la x y la cota de C */
    const H = gira({ x: C.x + 50 * h.d.x, y: C.y + 50 * h.d.y, z: C.z }, vertical, g1);
    expect(Math.abs(H.x - C.x)).toBeLessThan(1e-9);
    expect(Math.abs(H.z - C.z)).toBeLessThan(1e-9);
    const canto = Math.atan2(P1[0].z - P1[2].z, P1[0].x - P1[2].x);
    const cands = [canto, canto - Math.PI, canto + Math.PI].map((a) => (a * 180) / Math.PI);
    const g2 = cands.reduce((m, a) => (Math.abs(a) < Math.abs(m) ? a : m));
    const P2s = P1.map((P) => gira(P, dePunta, g2));
    expect(Math.abs(P2s[0].z - P2s[2].z)).toBeLessThan(1e-6);
    expect(Math.abs(P2s[1].z - P2s[2].z)).toBeLessThan(1e-6);
    expect(Math.abs(g2)).toBeCloseTo(51.4011, 3);
    expect(mm(vmPlanta(P2s[0], P2s[1]))).toBeCloseTo(LADOS.AB, 3);
    expect(mm(vmPlanta(P2s[1], P2s[2]))).toBeCloseTo(LADOS.BC, 3);
    expect(mm(vmPlanta(P2s[2], P2s[0]))).toBeCloseTo(LADOS.CA, 3);
  });

  it('método 4: eje de punta hasta dejar la frontal vertical, eje vertical hasta dejar el plano frontal', () => {
    const vertical: Recta3 = { p: C, d: { x: 0, y: 0, z: 1 } };
    const dePunta: Recta3 = { p: C, d: { x: 0, y: 1, z: 0 } };
    const f = frontalPor(C, abc);
    /* gira() sobre el eje de punta (0, 1, 0) lleva (x, z) a (x cos + z sen, −x sen + z cos):
       la frontal queda vertical cuando su x se anula */
    const k1 = (Math.atan2(-f.d.x, f.d.z) * 180) / Math.PI;
    const P1 = [A, B, C].map((P) => gira(P, dePunta, k1));
    const F = gira({ x: C.x + 50 * f.d.x, y: C.y, z: C.z + 50 * f.d.z }, dePunta, k1);
    expect(Math.abs(F.x - C.x)).toBeLessThan(1e-9);
    expect(Math.abs(F.y - C.y)).toBeLessThan(1e-9);
    // el canto, en la planta: A₁′, B₁′ y C₁′ en línea
    const cruz = (P1[1].x - P1[2].x) * (P1[0].y - P1[2].y) - (P1[1].y - P1[2].y) * (P1[0].x - P1[2].x);
    expect(Math.abs(cruz) / vmPlanta(P1[0], P1[2])).toBeLessThan(1e-6);
    // el segundo giro, de eje vertical, deja el canto paralelo a la línea de tierra
    const canto = Math.atan2(P1[0].y - P1[2].y, P1[0].x - P1[2].x);
    const cands = [-canto, -canto - Math.PI, -canto + Math.PI].map((a) => (a * 180) / Math.PI);
    const k2 = cands.reduce((m, a) => (Math.abs(a) < Math.abs(m) ? a : m));
    const P2s = P1.map((P) => gira(P, vertical, k2));
    expect(Math.abs(P2s[0].y - P2s[2].y)).toBeLessThan(1e-6);
    expect(Math.abs(P2s[1].y - P2s[2].y)).toBeLessThan(1e-6);
    expect(Math.abs(k2)).toBeCloseTo(38.5991, 3);
    expect(mm(vmAlzado(P2s[0], P2s[1]))).toBeCloseTo(LADOS.AB, 3);
    expect(mm(vmAlzado(P2s[1], P2s[2]))).toBeCloseTo(LADOS.BC, 3);
    expect(mm(vmAlzado(P2s[2], P2s[0]))).toBeCloseTo(LADOS.CA, 3);
  });
});
