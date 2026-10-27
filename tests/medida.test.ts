import { describe, expect, it } from 'vitest';
import { datoDeLaMedida } from '../src/lib/medida';

/* La línea de la tarjeta «Esta evaluación» de una ruta. El porqué, en
 * `src/lib/medida.ts`: hasta el 26 de octubre de 2026 juntaba en una misma
 * línea lo que la ruta midió y lo que hay transcrito, aunque fueran
 * convocatorias distintas. Los casos son los de las rutas de ese día. */
describe('datoDeLaMedida', () => {
  it('cuando lo medido y lo transcrito coinciden, lo dice en una línea', () => {
    expect(
      datoDeLaMedida({ medidoSobre: 11, medidas: 'convocatorias', sonHojas: false, transcritas: 11, ejercicios: 39, puntos: 390 }),
    ).toBe('Medido sobre 11 convocatorias · 39 ejercicios · 390 puntos.');
  });

  it('sin reparto, igual que antes', () => {
    expect(
      datoDeLaMedida({ medidoSobre: 6, medidas: 'convocatorias', sonHojas: false, transcritas: 6, ejercicios: 40 }),
    ).toBe('Medido sobre 6 convocatorias · 40 ejercicios transcritos.');
  });

  it('las hojas sin fecha', () => {
    expect(
      datoDeLaMedida({ medidoSobre: 4, medidas: 'hojas de examen de la colección', sonHojas: true, transcritas: 4, ejercicios: 17 }),
    ).toBe('Medido sobre 4 hojas de examen de la colección, sin fecha · 17 ejercicios transcritos.');
  });

  it('el primer parcial de Elasticidad ya no dice «6 convocatorias · 76 ejercicios»', () => {
    const dato = datoDeLaMedida({ medidoSobre: 6, medidas: 'convocatorias', sonHojas: false, transcritas: 11, ejercicios: 76 });
    expect(dato).not.toMatch(/6 convocatorias · 76/);
    expect(dato).toBe('Medido sobre 6 convocatorias. De esta evaluación hay 11 transcritas, con 76 ejercicios.');
  });

  it('con reparto, los puntos van con lo transcrito (la ordinaria de Cálculo deja una fuera de la ventana)', () => {
    expect(
      datoDeLaMedida({ medidoSobre: 11, medidas: 'convocatorias', sonHojas: false, transcritas: 12, ejercicios: 99, puntos: 990 }),
    ).toBe('Medido sobre 11 convocatorias. De esta evaluación hay 12 transcritas, con 99 ejercicios y 990 puntos.');
  });

  it('una sola transcrita, en singular', () => {
    expect(
      datoDeLaMedida({ medidoSobre: 3, medidas: 'convocatorias', sonHojas: false, transcritas: 1, ejercicios: 5 }),
    ).toBe('Medido sobre 3 convocatorias. De esta evaluación hay 1 transcrita, con 5 ejercicios.');
  });
});
