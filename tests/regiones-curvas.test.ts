/**
 * El verificador con curvas, no solo con regiones de área.
 *
 * Hasta el 23 de agosto de 2026 `mismaRegion` solo servía para desigualdades:
 * los diez pasos `verificar` del corpus eran todos regiones con área, y no por
 * casualidad. Con igualdades fallaba por tres motivos encadenados —tolerancia
 * medida en el valor y no en el plano, banda más fina que el paso de la
 * rejilla, y margen del 1 % calibrado para áreas—, y el síntoma era que dos
 * formas equivalentes de la misma elipse se declaraban distintas.
 *
 * Estos casos son la validación en los dos sentidos que pide §11: cada uno
 * comprueba que la respuesta correcta se acepta **y** que una equivocada
 * plausible se rechaza. Si alguien vuelve a tocar la tolerancia, esto se pone
 * rojo.
 */
import { describe, expect, it } from 'vitest';
import { analiza, mismaRegion } from '../src/lib/regiones';

type Vent = { x: [number, number]; y: [number, number] };
const V = (x: [number, number], y: [number, number]): Vent => ({ x, y });

const casos: Array<{
  nombre: string;
  enunciado: string;
  correcta: string;
  equivocada: string;
  porque: string;
  ventana: Vent;
}> = [
  {
    nombre: 'semicircunferencia por el argumento de un cociente',
    enunciado: 'arg((z-2)/(z-1)) = pi/2',
    correcta: '(x-1.5)^2 + y^2 = 0.25 & y > 0',
    equivocada: '(x-1.5)^2 + y^2 = 0.25',
    porque: 'quedarse con la circunferencia entera en vez de con media',
    ventana: V([-1, 4], [-2, 3]),
  },
  {
    nombre: 'elipse por suma de distancias',
    enunciado: '|z-(1+i)| + |z-(1-i)| = 4',
    correcta: '(x-1)^2/3 + y^2/4 = 1',
    equivocada: '(x-1)^2/4 + y^2/3 = 1',
    porque: 'cambiar el semieje mayor por el menor',
    ventana: V([-3, 5], [-4, 4]),
  },
  {
    nombre: 'circunferencia de Apolonio',
    enunciado: '|(z-1)/(z-i)| = sqrt(2)',
    correcta: '(x+1)^2 + (y-2)^2 = 4',
    equivocada: '(x+1)^2 + (y-2)^2 = 2',
    porque: 'olvidar elevar al cuadrado la razón',
    ventana: V([-5, 3], [-2, 6]),
  },
  {
    nombre: 'arco capaz con conjugados',
    enunciado: 'arg((conj(z)+3i)/(conj(z)-3i)) = -pi/4',
    correcta: '(x+3)^2 + y^2 = 18 & x < 0',
    equivocada: '(x+3)^2 + y^2 = 18',
    porque: 'no quedarse con el arco que pide el signo del argumento',
    ventana: V([-10, 10], [-9, 9]),
  },
  {
    nombre: 'semirrecta desde el argumento de un inverso',
    enunciado: 'arg(1/(z-2-3i)) = pi/2',
    correcta: 'x = 2 & y < 3',
    equivocada: 'x = 2',
    porque: 'dar la recta entera cuando el argumento solo deja una semirrecta',
    ventana: V([-2, 6], [-2, 8]),
  },
  {
    nombre: 'región con área, que ya funcionaba',
    enunciado: 'abs(z) <= 2',
    correcta: 'x^2 + y^2 <= 4',
    equivocada: 'x^2 + y^2 <= 3',
    porque: 'confundir el radio con su cuadrado',
    ventana: V([-4, 4], [-4, 4]),
  },
];

describe('el verificador distingue curvas', () => {
  for (const c of casos) {
    it(`acepta la respuesta correcta · ${c.nombre}`, () => {
      const r = mismaRegion(analiza(c.enunciado), analiza(c.correcta), c.ventana, 120);
      expect(r.iguales, `desacuerdo ${r.sobra + r.falta} de ${r.total}`).toBe(true);
    });

    it(`rechaza ${c.porque} · ${c.nombre}`, () => {
      const r = mismaRegion(analiza(c.enunciado), analiza(c.equivocada), c.ventana, 120);
      expect(r.iguales, `desacuerdo ${r.sobra + r.falta} de ${r.total}`).toBe(false);
    });
  }
});
