/**
 * Las cuentas de los criterios de corrección (`src/lib/criterios.ts`) con la
 * hoja de verdad, la de Expresión Gráfica: un caso por cada clase de tope
 * (por pieza, en todo el plano y sobre el total), los que no topan, el precio
 * compuesto de la escala y los mínimos. Es la prueba de utilidad del
 * componente de los Criterios (PLAN-K §3.3).
 *
 * Las cuentas de dos o más partes usan las lecturas de la cabecera de la
 * biblioteca, que la hoja no confirma: lo que no lleva `por` se cobra una vez
 * y, en el compuesto, el cajetín también.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { describe, expect, it } from 'vitest';
import { corrige, descuentoDe, formaDe, type Cuenta, type HojaDeCriterios } from '../src/lib/criterios';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const HOJA = yaml.load(readFileSync(join(RAIZ, 'src', 'content', 'criterios', 'expresion-grafica.yaml'), 'utf8')) as HojaDeCriterios;
const TODOS = HOJA.minimos.map((m) => m.id);
const error = (id: string) => {
  const e = [...HOJA.muyGraves, ...HOJA.tipicos].find((x) => x.id === id);
  if (!e) throw new Error(`la hoja no tiene «${id}»`);
  return e;
};
const cuesta = (id: string, cuenta: Cuenta, piezas = 1) => descuentoDe(error(id), cuenta, piezas);

describe('cómo se cuenta cada error de la hoja de Expresión Gráfica', () => {
  it('cada uno tiene la forma que dicen sus datos', () => {
    const formas = Object.fromEntries([...HOJA.muyGraves, ...HOJA.tipicos].map((e) => [e.id, formaDe(e)]));
    expect(formas).toEqual({
      'escala-en-el-cajetin': 'una-vez',
      'acotar-rayas-discontinuas': 'una-vez',
      'montaje-imposible': 'una-vez',
      'eje-cortado-a-lo-largo': 'una-vez',
      'acotar-o-dibujar-sin-escala': 'una-vez',
      'dibujar-sin-escala-por-pieza': 'veces',
      'faltan-cotas-funcionales': 'por-pieza',
      'faltan-cotas-no-funcionales': 'por-pieza',
      'ejes-en-agujeros-y-cilindros': 'veces',
      'rayado-en-agujero-roscado': 'veces',
      'longitud-de-rosca': 'veces',
      'escala-general-mal-identificada': 'una-vez',
      'escala-de-una-pieza': 'compuesto',
      'marcas-de-las-piezas': 'veces',
      'vista-extra-en-pieza-de-revolucion': 'veces',
    });
  });
});

describe('los descuentos, uno a uno', () => {
  it('un muy grave cuesta −2, una vez', () => {
    expect(cuesta('escala-en-el-cajetin', 1)).toEqual({ descuento: -2, topado: false });
    expect(cuesta('escala-en-el-cajetin', 0)).toEqual({ descuento: 0, topado: false });
    expect(() => cuesta('eje-cortado-a-lo-largo', 2)).toThrow(/se cobra una vez/);
  });

  it('el de la escala «por pieza» cuesta −2 por cada pieza, y no más piezas de las que hay', () => {
    expect(cuesta('dibujar-sin-escala-por-pieza', 2, 3)).toEqual({ descuento: -4, topado: false });
    expect(() => cuesta('dibujar-sin-escala-por-pieza', 4, 3)).toThrow(/más piezas/);
  });

  it('sin tope, el precio por cada caso: tres rayados mal en roscas, −1,5; dos vistas de más, −2', () => {
    expect(cuesta('rayado-en-agujero-roscado', 3)).toEqual({ descuento: -1.5, topado: false });
    expect(cuesta('vista-extra-en-pieza-de-revolucion', 2)).toEqual({ descuento: -2, topado: false });
  });

  it('tope en todo el plano: cuatro ejes sin indicar, −2; seis, −2,5 y no −3', () => {
    expect(cuesta('ejes-en-agujeros-y-cilindros', 4)).toEqual({ descuento: -2, topado: false });
    expect(cuesta('ejes-en-agujeros-y-cilindros', 6)).toEqual({ descuento: -2.5, topado: true });
  });

  it('tope sobre el total: cuatro marcas sin poner, −2; cinco, también −2', () => {
    expect(cuesta('marcas-de-las-piezas', 4)).toEqual({ descuento: -2, topado: false });
    expect(cuesta('marcas-de-las-piezas', 5)).toEqual({ descuento: -2, topado: true });
  });

  it('tope por pieza: cada pieza topa por su lado', () => {
    /* cuatro cotas funcionales en la primera (−2, que topa en −1,5) y una en la segunda */
    expect(cuesta('faltan-cotas-funcionales', [4, 1], 2)).toEqual({ descuento: -2, topado: true });
    /* cinco no funcionales en la primera (−1,25, que topa en −1) y tres en la segunda (−0,75) */
    expect(cuesta('faltan-cotas-no-funcionales', [5, 3], 2)).toEqual({ descuento: -1.75, topado: true });
    expect(cuesta('faltan-cotas-funcionales', [3, 3], 2)).toEqual({ descuento: -3, topado: false });
    expect(() => cuesta('faltan-cotas-funcionales', [1], 2)).toThrow(/una cuenta por pieza/);
  });

  it('el precio compuesto de la escala: falta en dos piezas y en el cajetín, −1,5; en cinco, se queda en −2', () => {
    expect(cuesta('escala-de-una-pieza', { piezas: 2, cajetin: true }, 2)).toEqual({ descuento: -1.5, topado: false });
    expect(cuesta('escala-de-una-pieza', { piezas: 5, cajetin: true }, 5)).toEqual({ descuento: -2, topado: true });
    expect(cuesta('escala-de-una-pieza', { piezas: 1, cajetin: false }, 3)).toEqual({ descuento: -0.5, topado: false });
    expect(cuesta('escala-de-una-pieza', { piezas: 0, cajetin: true }, 3)).toEqual({ descuento: -0.5, topado: false });
    expect(() => cuesta('escala-de-una-pieza', { piezas: 3, cajetin: false }, 2)).toThrow(/más piezas/);
    expect(() => cuesta('escala-de-una-pieza', 2, 2)).toThrow(/las piezas y el cajetín/);
    expect(() => cuesta('escala-de-una-pieza', null as unknown as Cuenta, 2)).toThrow(/las piezas y el cajetín/);
    expect(() => cuesta('escala-de-una-pieza', { piezas: 1, cajetin: 'sí' } as unknown as Cuenta, 2)).toThrow(/sí o no/);
  });

  it('una cuenta que no es un entero de 0 en adelante, lanza', () => {
    expect(() => cuesta('longitud-de-rosca', -1)).toThrow(/entero/);
    expect(() => cuesta('longitud-de-rosca', 1.5)).toThrow(/entero/);
    expect(() => cuesta('longitud-de-rosca', [1])).toThrow(/con un número/);
  });
});

describe('corrige: los mínimos y la suma', () => {
  it('con todos los mínimos y sin errores, se corrige y no se quita nada', () => {
    expect(corrige(HOJA, { cumple: TODOS, piezas: 1, errores: {} })).toEqual({ seCorrige: true, faltan: [], lineas: [], total: 0 });
  });

  it('si falta un mínimo, no se corrige, y dice cuál', () => {
    const r = corrige(HOJA, { cumple: TODOS.filter((id) => id !== 'rosca-con-m'), piezas: 1, errores: {} });
    expect(r.seCorrige).toBe(false);
    expect(r.faltan.map((m) => m.id)).toEqual(['rosca-con-m']);
  });

  it('suma los errores en el orden de la hoja, los muy graves primero, y deja fuera los que no quitan nada', () => {
    const r = corrige(HOJA, {
      cumple: TODOS,
      piezas: 2,
      errores: {
        'marcas-de-las-piezas': 1,
        'escala-de-una-pieza': { piezas: 2, cajetin: true },
        'montaje-imposible': 1,
        'acotar-rayas-discontinuas': 0,
        'faltan-cotas-funcionales': [0, 0],
      },
    });
    expect(r.lineas.map((l) => [l.error.id, l.descuento])).toEqual([
      ['montaje-imposible', -2],
      ['escala-de-una-pieza', -1.5],
      ['marcas-de-las-piezas', -0.5],
    ]);
    expect(r.total).toBe(-4);
  });

  it('un id que no es de la hoja, o un despiece sin piezas, lanza', () => {
    expect(() => corrige(HOJA, { cumple: ['inventado'], piezas: 1, errores: {} })).toThrow(/no es un mínimo/);
    expect(() => corrige(HOJA, { cumple: TODOS, piezas: 1, errores: { inventado: 1 } })).toThrow(/no es un error/);
    expect(() => corrige(HOJA, { cumple: TODOS, piezas: 0, errores: {} })).toThrow(/al menos una pieza/);
  });
});
