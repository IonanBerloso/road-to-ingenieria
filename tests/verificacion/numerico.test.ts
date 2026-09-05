/**
 * El verificador numérico, verificado. Mismo argumento que con `lineal.ts`:
 * un error aquí no daría un fallo, daría confianza falsa.
 *
 * Todos los casos tienen valor exacto conocido, y se comparan contra él.
 */
import { describe, expect, it } from 'vitest';
import {
  cCos, cEntre, cModulo, cPor, cSen, deriva, integra, integraCasi, maximiza, raiz, trabajo,
} from './numerico';

const cerca = (a: number, b: number, e = 1e-8) => expect(Math.abs(a - b)).toBeLessThan(e);

describe('integración', () => {
  it('∫₀¹ x² dx = 1/3', () => cerca(integra((x) => x * x, 0, 1), 1 / 3));
  it('∫₀^π sen x dx = 2', () => cerca(integra(Math.sin, 0, Math.PI), 2));
  it('∫₋₁¹ √(1−x²) dx = π/2, el semicírculo', () =>
    cerca(integraCasi((x) => Math.sqrt(Math.max(0, 1 - x * x)), -1, 1, 1e-7), Math.PI / 2, 1e-5));
  it('∫₀¹ e^x dx = e − 1', () => cerca(integra(Math.exp, 0, 1), Math.E - 1));
  it('respeta el signo del intervalo al revés', () =>
    cerca(integra((x) => x, 1, 0), -0.5));

  /* Los dos que siguen entraron el 5 de septiembre de 2026. `integraCasi`
     suponía que el extremo problemático era siempre el primero, y al pedirle
     el cuarto de circunferencia de 4 a 2√2 devolvió el área **con el signo
     cambiado** sin quejarse. Ahora hay que decir en cuál de los dos está. */
  it('con la singularidad en el extremo derecho', () =>
    cerca(integraCasi((x) => Math.sqrt(Math.max(0, 1 - x * x)), 0, 1, 1e-9, 'b'), Math.PI / 4, 1e-6));
  it('y en el izquierdo, dando lo mismo por simetría', () =>
    cerca(integraCasi((x) => Math.sqrt(Math.max(0, 1 - x * x)), -1, 0, 1e-9, 'a'), Math.PI / 4, 1e-6));
});

describe('derivada', () => {
  it('la de x³ en 2 vale 12', () => cerca(deriva((x) => x ** 3, 2), 12, 1e-6));
  it('la del seno en 0 vale 1', () => cerca(deriva(Math.sin, 0), 1, 1e-9));
});

describe('máximo', () => {
  it('el de −(x−3)² está en x = 3', () => {
    const m = maximiza((x) => -((x - 3) ** 2), 0, 10);
    cerca(m.x, 3, 1e-6);
    cerca(m.y, 0, 1e-9);
  });
  it('el del seno en (0, π) está en π/2', () =>
    cerca(maximiza(Math.sin, 0, Math.PI).x, Math.PI / 2, 1e-6));
});

describe('raíz', () => {
  it('la de x² − 2 en (0,2) es √2', () => cerca(raiz((x) => x * x - 2, 0, 2), Math.SQRT2));
  it('y se niega si no hay cambio de signo', () =>
    expect(() => raiz((x) => x * x + 1, 0, 2)).toThrow());
});

describe('integral de línea', () => {
  it('un campo conservativo da la diferencia de potencial y nada más', () => {
    /* V = ∇(xyz): el trabajo entre dos puntos no depende del camino. Se
       comprueba con dos caminos distintos entre los mismos extremos. */
    const V = (p: number[]) => [p[1] * p[2], p[0] * p[2], p[0] * p[1]];
    const recto = trabajo(V, (t) => [1 + t, 1 + t, 1 + t], 0, 1);
    const torcido = trabajo(V, (t) => [1 + t, 1 + t * t, 1 + Math.sin((Math.PI / 2) * t)], 0, 1);
    cerca(recto, 2 * 2 * 2 - 1, 1e-6);
    cerca(torcido, recto, 1e-6);
  });
  it('y uno que no lo es sí depende del camino', () => {
    const V = (p: number[]) => [-p[1], p[0], 0];
    const porArriba = trabajo(V, (t) => [Math.cos(t), Math.sin(t), 0], 0, Math.PI);
    const recto = trabajo(V, (t) => [1 - 2 * t, 0, 0], 0, 1);
    cerca(porArriba, Math.PI, 1e-6);
    cerca(recto, 0, 1e-9);
  });
});

describe('complejos', () => {
  it('sen² + cos² = 1 también fuera del eje real', () => {
    const z: [number, number] = [0.7, -1.3];
    const s = cPor(cSen(z), cSen(z));
    const c = cPor(cCos(z), cCos(z));
    cerca(s[0] + c[0], 1);
    cerca(s[1] + c[1], 0);
  });
  it('el módulo de i es 1 y el de 3+4i es 5', () => {
    cerca(cModulo([0, 1]), 1);
    cerca(cModulo([3, 4]), 5);
  });
  it('dividir por uno mismo da uno', () => {
    const q = cEntre([3, -2], [3, -2]);
    cerca(q[0], 1);
    cerca(q[1], 0);
  });
});
