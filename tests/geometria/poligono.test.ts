import { describe, expect, it } from 'vitest';
import { plano, poligonoRegular, vm, enPlano, type P3 } from '../../src/lib/diedrico';

/* El polígono regular de un plano (lote 2 de la fase K), comprobado por lo que
   tiene que cumplir y sin repetir su cuenta: todos los vértices en el plano, a
   la misma distancia del centro, y lados iguales; el triángulo equilátero,
   con lados de √3 veces el radio. */
const p = (x: number, y: number, z: number): P3 => ({ x, y, z });
const casi = (a: number, b: number, tol = 1e-6) => expect(Math.abs(a - b), `${a} frente a ${b}`).toBeLessThanOrEqual(tol);
const pl = plano(p(10, 40, 70), p(130, 90, 20), p(60, 150, 110));
const O = p((10 + 130 + 60) / 3, (40 + 90 + 150) / 3, (70 + 20 + 110) / 3);
const V = p(10, 40, 70);

describe('poligonoRegular', () => {
  for (const n of [3, 4, 6]) {
    it(`${n} lados: en el plano, a la misma distancia del centro y con lados iguales`, () => {
      const vs = poligonoRegular(pl, O, V, n);
      expect(vs).toHaveLength(n);
      casi(vm(vs[0], V), 0);
      for (const q of vs) {
        expect(enPlano(q, pl, 1e-6)).toBe(true);
        casi(vm(q, O), vm(V, O));
      }
      const lado = vm(vs[0], vs[1]);
      for (let k = 0; k < n; k++) casi(vm(vs[k], vs[(k + 1) % n]), lado);
      casi(lado, 2 * vm(V, O) * Math.sin(Math.PI / n));
    });
  }

  it('lanza con menos de tres lados, con un punto fuera del plano o con el vértice en el centro', () => {
    expect(() => poligonoRegular(pl, O, V, 2)).toThrow(/tres lados/);
    expect(() => poligonoRegular(pl, { ...O, z: O.z + 20 }, V, 3)).toThrow(/no está en el plano/);
    expect(() => poligonoRegular(pl, O, O, 3)).toThrow(/no tiene tamaño/);
  });
});
