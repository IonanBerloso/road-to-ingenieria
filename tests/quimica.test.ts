/**
 * El lector de respuestas químicas.
 *
 * Los casos NO son inventados: los veinte compuestos salen de los dos
 * ejercicios de nombrar y formular que hay en el corpus —el 2 del control de
 * 2023-2024 y el 5 del de 2024-2025—, que son los dos que motivaron escribir
 * este lector. Los demás casos son los tres errores que tiene que saber
 * diagnosticar.
 */
import { describe, expect, it } from 'vitest';
import { comparaFormula, esFormulaQuimica, leeFormula } from '../src/lib/quimica';

describe('lee fórmulas y nombres', () => {
  it('los subíndices Unicode valen igual que los dígitos', () => {
    expect(leeFormula('Fe₂O₃')!.clave).toBe('Fe2O3');
    expect(leeFormula('Fe2O3')!.clave).toBe('Fe2O3');
    expect(leeFormula('Ba(NO₃)₂')!.clave).toBe('Ba(NO3)2');
  });

  it('distingue una fórmula de un nombre por su forma', () => {
    expect(leeFormula('H2SO3')!.esFormula).toBe(true);
    expect(leeFormula('PCl5')!.esFormula).toBe(true);
    expect(leeFormula('ácido brómico')!.esFormula).toBe(false);
    expect(leeFormula('Peróxido de zinc')!.esFormula).toBe(false);
  });

  it('un nombre se normaliza sin tildes, sin mayúsculas y sin conectores', () => {
    expect(leeFormula('Óxido de sodio')!.clave).toBe('oxido sodio');
    expect(leeFormula('oxido sodio')!.clave).toBe('oxido sodio');
    expect(leeFormula('  ÓXIDO   DE   SODIO ')!.clave).toBe('oxido sodio');
  });

  it('el número de oxidación vale con espacio o sin él', () => {
    expect(leeFormula('hidróxido de plomo (II)')!.clave).toBe(
      leeFormula('hidroxido de plomo(II)')!.clave,
    );
  });

  it('no lee lo que no tiene nada dentro', () => {
    expect(leeFormula('')).toBeNull();
    expect(leeFormula('   ')).toBeNull();
    expect(leeFormula('¿?')).toBeNull();
  });
});

describe('compara contra las formas aceptadas', () => {
  /* Los diez del control de 2023-2024, en las dos direcciones. */
  const control2324: Array<[string, string]> = [
    ['Cu(OH)', 'Cu(OH)'],
    ['H2SO3', 'H2SO3'],
    ['PCl5', 'PCl5'],
    ['Fe2O3', 'Fe2O3'],
    ['HBr', 'HBr'],
    ['ácido brómico', 'ácido brómico | acido bromico'],
    ['peróxido de zinc', 'peróxido de zinc'],
    ['seleniuro cálcico', 'seleniuro cálcico | seleniuro de calcio'],
    ['sulfato potásico', 'sulfato potásico | sulfato de potasio'],
    ['nitrato de bario', 'nitrato de bario'],
  ];

  /* Los diez del control de 2024-2025. */
  const control2425: Array<[string, string]> = [
    ['HgH', 'HgH'],
    ['HClO', 'HClO'],
    ['Ba(NO3)2', 'Ba(NO3)2'],
    ['Au(OH)3', 'Au(OH)3'],
    ['H2S', 'H2S'],
    ['óxido de sodio', 'óxido de sodio'],
    ['hidróxido plumboso', 'hidróxido de plomo(II) | hidróxido plumboso'],
    ['ácido carbónico', 'ácido carbónico'],
    ['sulfato férrico', 'sulfato férrico | sulfato de hierro(III)'],
    ['yodo molecular', 'yodo molecular | iodo molecular | I2'],
  ];

  for (const [escrito, esperado] of [...control2324, ...control2425]) {
    it(`acepta «${escrito}»`, () => {
      expect(comparaFormula(escrito, esperado).igual).toBe(true);
    });
  }

  it('acepta cualquiera de los sinónimos, no solo el primero', () => {
    const v = 'hidróxido de plomo(II) | hidróxido plumboso';
    expect(comparaFormula('hidróxido de plomo(II)', v).igual).toBe(true);
    expect(comparaFormula('hidroxido plumboso', v).igual).toBe(true);
  });
});

describe('diagnostica los tres errores que sabe distinguir', () => {
  it('mayúsculas: CO no es Co, y son sustancias distintas', () => {
    const v = comparaFormula('CO', 'Co');
    expect(v.igual).toBe(false);
    expect(v.fallo).toBe('mayusculas');
  });

  it('subíndices: los elementos correctos en la proporción equivocada', () => {
    const v = comparaFormula('FeO', 'Fe2O3');
    expect(v.igual).toBe(false);
    expect(v.fallo).toBe('subindices');
  });

  it('columna equivocada: nombre donde se pedía fórmula', () => {
    const v = comparaFormula('óxido de hierro(III)', 'Fe2O3');
    expect(v.igual).toBe(false);
    expect(v.fallo).toBe('genero-cambiado');
  });

  it('columna equivocada, también al revés', () => {
    const v = comparaFormula('Na2O', 'óxido de sodio');
    expect(v.igual).toBe(false);
    expect(v.fallo).toBe('genero-cambiado');
  });

  it('un error sin más no inventa diagnóstico', () => {
    const v = comparaFormula('CaCl2', 'Fe2O3');
    expect(v.igual).toBe(false);
    expect(v.fallo).toBeUndefined();
  });
});

describe('esFormulaQuimica reconoce en qué columna se contesta', () => {
  it('sobre el primer sinónimo', () => {
    expect(esFormulaQuimica('Fe2O3')).toBe(true);
    expect(esFormulaQuimica('sulfato férrico | sulfato de hierro(III)')).toBe(false);
  });
});

describe('la caja gana a la columna, que salió probándolo en el navegador', () => {
  /* `k2so4` no pasa el patrón de fórmula —un símbolo empieza por mayúscula—
     así que se leía como nombre y recibía «has contestado en la otra
     columna», que es falso: ha escrito la fórmula, mal escrita. */
  it('una fórmula toda en minúsculas es un error de mayúsculas, no de columna', () => {
    const v = comparaFormula('k2so4', 'K2SO4');
    expect(v.igual).toBe(false);
    expect(v.fallo).toBe('mayusculas');
  });

  it('y con subíndices Unicode también', () => {
    expect(comparaFormula('fe₂o₃', 'Fe2O3').fallo).toBe('mayusculas');
  });

  it('pero un nombre de verdad sigue siendo un error de columna', () => {
    expect(comparaFormula('sulfato potásico', 'K2SO4').fallo).toBe('genero-cambiado');
  });

  it('los espacios de más no estorban', () => {
    expect(comparaFormula('  K2SO4  ', 'K2SO4').igual).toBe(true);
  });
});
