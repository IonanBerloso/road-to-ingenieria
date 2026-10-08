import { describe, expect, it } from 'vitest';
import { cuentaPorTema, pesoPublicado, MINIMO_CONTADO } from '../src/lib/peso';

/* El peso de un tema, contado en vez de estimado (lib/peso.ts). La auditoría
   de Expresión Gráfica del 8 de octubre de 2026 encontró sus trece temas en
   «PESO BAJO»: las cuatro hojas sin fecha de la colección, 17 ejercicios, se
   medían con los cortes de Cálculo, calibrados sobre 425. */

const examen = (convocatoria: string, temas: string[]) => ({
  data: { asignatura: 'a', convocatoria, ejercicios: temas.map((tema) => ({ tema })) },
});

describe('cuentaPorTema', () => {
  it('cuenta ejercicio a ejercicio, no examen a examen', () => {
    const c = cuentaPorTema([examen('ordinaria', ['t1', 't1', 't2'])], 'a');
    expect(c.get('t1')).toBe(2);
    expect(c.get('t2')).toBe(1);
  });

  it('no cuenta las hojas sin fecha: no dicen cuándo ni cuánto cae', () => {
    const c = cuentaPorTema([examen('hoja', ['t1', 't1']), examen('ordinaria', ['t2'])], 'a');
    expect(c.has('t1')).toBe(false);
    expect(c.get('t2')).toBe(1);
  });

  it('solo cuenta la asignatura pedida', () => {
    const otra = { data: { asignatura: 'b', convocatoria: 'ordinaria', ejercicios: [{ tema: 't1' }] } };
    expect(cuentaPorTema([otra], 'a').size).toBe(0);
  });
});

describe('pesoPublicado', () => {
  const mucho = new Map([
    ['alto', 50],
    ['medio', 30],
    ['bajo', 20],
    ['resto', MINIMO_CONTADO],
  ]);

  it('con datos de sobra, los cortes de siempre', () => {
    expect(pesoPublicado(undefined, mucho, 'alto')).toBe('alto');
    expect(pesoPublicado(undefined, mucho, 'medio')).toBe('medio');
    expect(pesoPublicado(undefined, mucho, 'bajo')).toBe('bajo');
    expect(pesoPublicado(undefined, mucho, 'ninguno')).toBe('bajo');
  });

  it('manda lo declarado en el catálogo', () => {
    expect(pesoPublicado('alto', new Map(), 't1')).toBe('alto');
  });

  it('sin exámenes contados, nada', () => {
    expect(pesoPublicado(undefined, new Map(), 't1')).toBeNull();
  });

  it(`con menos de ${MINIMO_CONTADO} ejercicios contados, nada: todos saldrían «bajo»`, () => {
    const poco = new Map([
      ['t1', 9],
      ['t2', 8],
    ]);
    expect(pesoPublicado(undefined, poco, 't1')).toBeNull();
  });
});
