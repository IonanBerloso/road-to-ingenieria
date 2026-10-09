/**
 * Los esquemas de las colecciones `piezas` y `vistas` (`lib/vistas/esquemas.ts`),
 * validados al revés (§11) sin construir el sitio: cada regla, con un fichero
 * que la rompe y es válido en todo lo demás (§17: Zod no corre las reglas de
 * un objeto al que le falta un campo). Lo que el esquema pregunta al disco se
 * le da con un `Disco` de mentira, hecho con los ficheros de verdad.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';
import { describe, expect, it } from 'vitest';
import { esquemaDePieza, esquemaDeVistas, type Disco } from '../../src/lib/vistas/esquemas.ts';
import type { Resumen } from '../../src/lib/vistas/publicadas.ts';
import { resumenDelMotor, resumenDeTexto } from '../../src/lib/vistas/resumen.ts';

const PIEZAS = join(process.cwd(), 'src', 'content', 'piezas');
const VISTAS = join(process.cwd(), 'src', 'content', 'vistas');
const ID = 'nyv-2-18-3';
const TEXTO = readFileSync(join(PIEZAS, `${ID}.yaml`), 'utf8');
const PIEZA = yaml.load(TEXTO) as Record<string, unknown>;
const JSON_VISTAS = JSON.parse(readFileSync(join(VISTAS, `${ID}.json`), 'utf8')) as Record<string, unknown> & { resumen: Resumen };
const MOTOR = resumenDelMotor(process.cwd());

/** El disco de verdad, con lo que se quiera cambiar encima. */
function disco(cambios: { textos?: Record<string, string | null>; guardados?: Record<string, Resumen | null>; motor?: string } = {}): Disco {
  return {
    textoDePieza: (id) => (cambios.textos && id in cambios.textos ? cambios.textos[id] : (() => {
      try {
        return readFileSync(join(PIEZAS, `${id}.yaml`), 'utf8');
      } catch {
        return null;
      }
    })()),
    resumenGuardado: (id) => (cambios.guardados && id in cambios.guardados ? cambios.guardados[id] : (() => {
      try {
        return (JSON.parse(readFileSync(join(VISTAS, `${id}.json`), 'utf8')) as { resumen: Resumen }).resumen;
      } catch {
        return null;
      }
    })()),
    resumenDeTexto,
    resumenDelMotor: () => cambios.motor ?? MOTOR,
  };
}

const mensajes = (r: { success: boolean; error?: { issues: { message: string; path: PropertyKey[] }[] } }) =>
  r.success ? [] : r.error!.issues.map((i) => `${i.path.join('.')}: ${i.message}`);

describe('el esquema de las piezas', () => {
  it('acepta las piezas de la colección', () => {
    for (const f of readdirSync(PIEZAS).filter((x) => x.endsWith('.yaml'))) {
      const d = yaml.load(readFileSync(join(PIEZAS, f), 'utf8'));
      expect(mensajes(esquemaDePieza(disco()).safeParse(d)), f).toEqual([]);
    }
  });

  const rechaza = (cambio: (d: Record<string, unknown>) => Record<string, unknown>, patron: RegExp, d = disco()) => {
    const m = mensajes(esquemaDePieza(d).safeParse(cambio(structuredClone(PIEZA))));
    expect(m.join('\n')).toMatch(patron);
  };

  it('rechaza un campo mal escrito en una primitiva («dentor» por «dentro»)', () => {
    rechaza((d) => {
      const suma = d.suma as Record<string, unknown>[];
      suma[0] = { ...suma[0], dentor: 'base' };
      return d;
    }, /dentor/);
  });

  it('rechaza un campo mal escrito en la pieza', () => {
    rechaza((d) => ({ ...d, simetrias: d.simetria }), /simetrias/);
  });

  /* Revisión del 9 de octubre de 2026: con la forma rota, la regla de la
     pieza (`problemasDePieza`) corría igual y lanzaba, y `safeParse` lanzaba
     en vez de devolver el fallo con su sitio: el build habría dado una traza
     sin fichero ni campo. */
  it('una suma con un número, o una resta con un null: un fallo con su sitio, no una excepción', () => {
    const conForma = (cambio: Record<string, unknown>) => {
      const r = esquemaDePieza(disco()).safeParse({ ...structuredClone(PIEZA), ...cambio });
      return mensajes(r);
    };
    const suma = conForma({ suma: [5] });
    expect(suma.length).toBeGreaterThan(0);
    expect(suma[0]).toMatch(/^suma\.0: /);
    const resta = conForma({ resta: [null] });
    expect(resta.length).toBeGreaterThan(0);
    expect(resta[0]).toMatch(/^resta\.0: /);
  });

  it('con la forma rota no corre la regla de la pieza: un solo fallo, el de la forma', () => {
    const m = mensajes(esquemaDePieza(disco()).safeParse({ ...structuredClone(PIEZA), suma: [{ nombre: 'a', caja: [1, 2] }] }));
    expect(m).toEqual([expect.stringMatching(/^suma\.0\.caja: /)]);
  });

  it('rechaza un giro en un grupo, que el motor no aplicaría', () => {
    rechaza((d) => {
      (d.suma as Record<string, unknown>[]).push({ nombre: 'grupo girado', gira: { eje: 'z', grados: 30 }, suma: [{ nombre: 'taco', caja: [0, 5, 0, 5, 8, 10] }] });
      return d;
    }, /«grupo girado»: un grupo no se gira/);
  });

  it('rechaza una primitiva que es dos cosas a la vez', () => {
    rechaza((d) => {
      (d.suma as Record<string, unknown>[])[0] = { nombre: 'base', caja: [0, 1, 0, 1, 0, 1], cilindro: { eje: 'z', centro: [0, 0], r: 1 } };
      return d;
    }, /y solo una cosa/);
  });

  it('rechaza un «noSeCorta» que nombra una primitiva que no existe (problemasDePieza)', () => {
    rechaza((d) => ({ ...d, noSeCorta: ['nervio central'] }), /«noSeCorta» nombra «nervio central», que no es ninguna primitiva/);
  });

  it('rechaza una pieza sin fuente, o con cotas que no son dadas ni proporcionales', () => {
    rechaza((d) => ({ ...d, fuente: 'NyV' }), /fuente/);
    rechaza((d) => ({ ...d, cotas: 'medidas' }), /cotas/);
  });

  it('rechaza una pieza sin la revisión de su cotejo', () => {
    rechaza((d) => {
      delete d.revision;
      return d;
    }, /revision/);
  });

  it('rechaza unas ocultas que no son todas, necesarias ni ninguna', () => {
    rechaza((d) => ({ ...d, ocultas: 'algunas' }), /ocultas/);
  });

  it('rechaza una pieza que no está en el fichero de su código', () => {
    rechaza((d) => d, /tiene que estar en src\/content\/piezas\/nyv-2-18-3\.yaml/, disco({ textos: { [ID]: null } }));
  });

  it('rechaza una pieza sin sus vistas calculadas', () => {
    rechaza((d) => d, /no tiene sus vistas en src\/content\/vistas\/nyv-2-18-3\.json: pasa `npm run vistas`/, disco({ guardados: { [ID]: null } }));
  });

  it('rechaza una pieza cambiada desde que se calcularon sus vistas', () => {
    rechaza((d) => d, /ha cambiado desde que se calcularon sus vistas/, disco({ textos: { [ID]: `${TEXTO}# otra cosa\n` } }));
  });
});

describe('el esquema de las vistas calculadas', () => {
  it('acepta las de la colección', () => {
    for (const f of readdirSync(VISTAS).filter((x) => x.endsWith('.json'))) {
      const d = JSON.parse(readFileSync(join(VISTAS, f), 'utf8'));
      expect(mensajes(esquemaDeVistas(disco()).safeParse(d)), f).toEqual([]);
    }
  });

  const rechaza = (cambio: (d: Record<string, unknown> & { resumen: Resumen }) => unknown, patron: RegExp, d = disco()) => {
    const m = mensajes(esquemaDeVistas(d).safeParse(cambio(structuredClone(JSON_VISTAS))));
    expect(m.join('\n')).toMatch(patron);
  };

  it('rechaza un resumen que no es el de su pieza', () => {
    rechaza((d) => ({ ...d, resumen: { ...d.resumen, pieza: '0'.repeat(64) } }), /la pieza ha cambiado desde que se calcularon sus vistas/);
  });

  it('rechaza unas vistas de un motor que ya no es el de hoy', () => {
    rechaza((d) => d, /el motor de vistas ha cambiado/, disco({ motor: '1'.repeat(64) }));
  });

  it('rechaza unas vistas sin pieza', () => {
    rechaza((d) => d, /no tienen pieza: falta src\/content\/piezas\/nyv-2-18-3\.yaml/, disco({ textos: { [ID]: null } }));
  });

  it('rechaza una planta espejada (los invariantes de §3.8)', () => {
    rechaza((d) => {
      const e = (d as unknown as { vistas: { planta: { encuadre: { vmin: number; vmax: number } } } }).vistas.planta.encuadre;
      [e.vmin, e.vmax] = [-e.vmax, -e.vmin];
      return d;
    }, /no tienen la misma profundidad/);
  });

  it('rechaza un tramo que no es ni visto ni oculto, y un campo de más', () => {
    rechaza((d) => {
      const t = (d as unknown as { vistas: { alzado: { tramos: { tipo: string }[] } } }).vistas.alzado.tramos[0];
      t.tipo = 'eje';
      return d;
    }, /tipo/);
    rechaza((d) => ({ ...d, calculadoEl: '2026-10-09' }), /calculadoEl/);
  });

  it('unas vistas sin la planta: un fallo con su sitio, no una excepción de los invariantes', () => {
    const d = structuredClone(JSON_VISTAS) as unknown as { vistas: Record<string, unknown> };
    delete d.vistas.planta;
    const m = mensajes(esquemaDeVistas(disco()).safeParse(d));
    expect(m).toEqual([expect.stringMatching(/^vistas\.planta: /)]);
  });

  it('rechaza un resumen que no es un sha-256', () => {
    rechaza((d) => ({ ...d, resumen: { ...d.resumen, motor: 'v1' } }), /sha-256/);
  });
});
