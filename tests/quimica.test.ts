/**
 * El lector de respuestas químicas.
 *
 * Los casos NO son inventados: los veinte compuestos salen de los dos
 * ejercicios de nombrar y formular que hay en el corpus —el 2 del control de
 * 2023-2024 y el 5 del de 2024-2025—, que son los dos que motivaron escribir
 * este lector. Los demás casos son los errores que tiene que saber
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

describe('diagnostica los errores que sabe distinguir', () => {
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

describe('lo que cazaron las hojas de formulación, el 28 de septiembre de 2026', () => {
  /* Tres agentes que transcribían las 180 fórmulas de las hojas del curso
     dieron, cada uno por su lado, con el mismo patrón mal cortado: bastaba una
     mayúscula al principio para ser fórmula. «Amoniaco» con la mayúscula que
     pone el móvil recibía «has contestado en la otra columna», y «(NH4)2SO3»,
     que empieza por paréntesis, se comparaba como un nombre, sin caja. */
  it('un nombre de una palabra con mayúscula sigue siendo un nombre', () => {
    for (const n of ['Metano', 'Amoniaco', 'Agua', 'Fosfina', 'Silano', 'Oxidano'])
      expect(leeFormula(n)!.esFormula).toBe(false);
    expect(comparaFormula('Amoniaco', 'amoniaco').igual).toBe(true);
    expect(comparaFormula('Metano', 'metano').igual).toBe(true);
  });

  it('y se acepta aunque venga entero en mayúsculas', () => {
    expect(comparaFormula('METANO', 'metano').igual).toBe(true);
    expect(comparaFormula('ÓXIDO DE SODIO', 'óxido de sodio').igual).toBe(true);
  });

  it('una fórmula puede empezar por paréntesis', () => {
    expect(leeFormula('(NH4)2SO3')!.esFormula).toBe(true);
    expect(leeFormula('(NH₄)₃AsO₄')!.clave).toBe('(NH4)3AsO4');
    expect(comparaFormula('(NH4)2SO3', '(NH4)2SO3').igual).toBe(true);
  });

  it('y entonces se compara con caja, como las demás', () => {
    const v = comparaFormula('(nh4)2so3', '(NH4)2SO3');
    expect(v.igual).toBe(false);
    expect(v.fallo).toBe('mayusculas');
    expect(comparaFormula('sulfito amónico', '(NH4)2SO3').fallo).toBe('genero-cambiado');
  });

  it('las fórmulas de siempre siguen siéndolo', () => {
    for (const f of ['Fe2O3', 'H2O2', 'NaHCO3', 'Cu(OH)2', 'CuSO4·5H2O', 'KMnO4', 'Si', 'Co'])
      expect(leeFormula(f)!.esFormula).toBe(true);
  });
});

describe('los paréntesis que faltan no son un error de mayúsculas', () => {
  /* `CuOH2` por `Cu(OH)2` recibía «cuidado con las mayúsculas», porque esa
     comprobación quitaba los paréntesis antes de comparar. El alumno había
     escrito bien todas las mayúsculas. */
  it('sin paréntesis', () => {
    expect(comparaFormula('CuOH2', 'Cu(OH)2').fallo).toBe('parentesis');
    expect(comparaFormula('Al2SO43', 'Al2(SO4)3').fallo).toBe('parentesis');
    expect(comparaFormula('NH42SO4', '(NH4)2SO4').fallo).toBe('parentesis');
  });

  it('o con los paréntesis en otro sitio', () => {
    expect(comparaFormula('Cu(OH2)', 'Cu(OH)2').fallo).toBe('parentesis');
  });

  it('cuando fallan la caja y los paréntesis, primero la caja', () => {
    expect(comparaFormula('cuoh2', 'Cu(OH)2').fallo).toBe('mayusculas');
  });

  it('y CO por Co sigue siendo de mayúsculas', () => {
    expect(comparaFormula('CO', 'Co').fallo).toBe('mayusculas');
  });
});
