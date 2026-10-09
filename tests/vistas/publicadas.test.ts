/**
 * Lo que se publica de las vistas y cómo se resume (`lib/vistas/publicadas.ts`
 * y `lib/vistas/resumen.ts`): el id de una pieza, el JSON que escribe
 * `npm run vistas`, los invariantes del build y qué entra en el resumen del
 * motor.
 */
import { describe, expect, it } from 'vitest';
import { calculaVistas, type VistasCalculadas } from '../../src/lib/vistas/motor.ts';
import { compilaPieza } from '../../src/lib/vistas/pieza.ts';
import {
  DECIMALES,
  idDePieza,
  primeraDiferencia,
  problemasDeInvariantes,
  publicaVistas,
  textoDeVistas,
  type VistasPublicadas,
} from '../../src/lib/vistas/publicadas.ts';
import { ficherosDelMotor, importados, resumenDelMotor, resumenDeTexto } from '../../src/lib/vistas/resumen.ts';
import { piezaDeLaEspiga } from './piezas';

const RESUMEN = { pieza: 'a'.repeat(64), motor: 'b'.repeat(64) };
const espiga = (): VistasCalculadas => calculaVistas(compilaPieza(piezaDeLaEspiga()));

describe('el id de una pieza', () => {
  it('es su código en minúsculas y con guiones', () => {
    expect(idDePieza('NyV-2.18-3')).toBe('nyv-2-18-3');
    expect(idDePieza('RI-V1')).toBe('ri-v1');
    expect(idDePieza('CUAD p. 20, 3')).toBe('cuad-p-20-3');
  });
});

describe('el JSON publicado', () => {
  const v = espiga();
  const p = publicaVistas(v, RESUMEN);

  it('las cifras van a la diezmilésima, y esa decisión entra en el resumen del motor', () => {
    /* Cambiar DECIMALES cambia lo publicado: por eso `publicadas.ts` está en
       el resumen del motor (lo comprueba «el resumen del motor», abajo), y el
       build pide `npm run vistas`. Este test lo fija para que el cambio se vea. */
    expect(DECIMALES).toBe(4);
  });

  it('lleva el resumen delante y las cifras a la diezmilésima, sin −0', () => {
    expect(Object.keys(p)).toEqual(['codigo', 'resumen', 'ocultas', 'vistas']);
    const torcida = structuredClone(v) as unknown as { vistas: { alzado: { encuadre: Record<string, number> } } };
    torcida.vistas.alzado.encuadre.umin = 1.23456789;
    torcida.vistas.alzado.encuadre.umax = -0.00001;
    const q = publicaVistas(torcida as unknown as VistasCalculadas, RESUMEN);
    expect(q.vistas.alzado.encuadre.umin).toBe(1.2346);
    expect(Object.is(q.vistas.alzado.encuadre.umax, 0)).toBe(true);
  });

  it('se lee y es lo mismo que se escribió', () => {
    const leido = JSON.parse(textoDeVistas(p)) as VistasPublicadas;
    expect(primeraDiferencia(p, leido, '', 0)).toBeNull();
  });

  it('va en un renglón por tramo, por eje y por descarte', () => {
    const texto = textoDeVistas(p);
    const tramos = Object.values(p.vistas).reduce((n, x) => n + x.tramos.length + x.ejes.length + x.descartes.length, 0);
    expect(texto.split('\n').filter((l) => l.trimStart().startsWith('{"')).length).toBe(tramos);
    expect(texto.endsWith('}\n')).toBe(true);
    expect(texto).not.toContain('\r');
  });
});

describe('los invariantes del build (§3.8)', () => {
  const v = espiga();

  it('la espiga los cumple', () => {
    expect(problemasDeInvariantes(v)).toEqual([]);
  });

  /* Al revés: una planta espejada (la v cambiada de signo, como si se mirase
     desde abajo) o un perfil movido no pueden pasar. */
  const conPlanta = (f: (e: VistasCalculadas['vistas']['planta']['encuadre']) => VistasCalculadas['vistas']['planta']['encuadre']) => ({
    vistas: { ...v.vistas, planta: { ...v.vistas.planta, encuadre: f(v.vistas.planta.encuadre) } },
  });

  it('una planta espejada no tiene la profundidad del perfil', () => {
    const r = problemasDeInvariantes(conPlanta((e) => ({ ...e, vmin: -e.vmax, vmax: -e.vmin })));
    expect(r).toHaveLength(1);
    expect(r[0]).toMatch(/la planta y el perfil no tienen la misma profundidad/);
  });

  it('una planta girada no tiene la anchura del alzado', () => {
    const r = problemasDeInvariantes(conPlanta((e) => ({ umin: e.vmin, umax: e.vmax, vmin: e.umin, vmax: e.umax })));
    expect(r.join(' ')).toMatch(/el alzado y la planta no tienen la misma anchura/);
  });

  it('un perfil movido 0,1 mm hacia arriba no tiene la altura del alzado', () => {
    const e = v.vistas.perfil.encuadre;
    const r = problemasDeInvariantes({ vistas: { ...v.vistas, perfil: { ...v.vistas.perfil, encuadre: { ...e, vmin: e.vmin - 0.1, vmax: e.vmax - 0.1 } } } });
    expect(r).toEqual([expect.stringMatching(/el alzado y el perfil no tienen la misma altura/)]);
  });
});

describe('la primera diferencia', () => {
  it('dice dónde, con el camino entero', () => {
    expect(primeraDiferencia({ a: [1, { b: 2 }] }, { a: [1, { b: 2.5 }] })).toBe('a[1].b: 2 hoy contra 2.5 publicado');
    expect(primeraDiferencia({ a: 1 }, { a: 1, b: 2 })).toBe('b: no está hoy y sí en lo publicado');
    expect(primeraDiferencia([1, 2], [1])).toBe('(raíz): 2 elementos hoy contra 1 publicados');
    expect(primeraDiferencia({ t: 'visto' }, { t: 'oculto' })).toBe('t: "visto" hoy contra "oculto" publicado');
  });

  it('y no ve lo que cae dentro de la tolerancia', () => {
    expect(primeraDiferencia({ x: 1 }, { x: 1.0005 })).toBeNull();
    expect(primeraDiferencia({ x: 1 }, { x: 1.002 })).not.toBeNull();
  });
});

describe('el resumen', () => {
  it('de un texto no depende de sus finales de línea', () => {
    expect(resumenDeTexto('a: 1\r\nb: 2\r\n')).toBe(resumenDeTexto('a: 1\nb: 2\n'));
    expect(resumenDeTexto('a: 1\n')).not.toBe(resumenDeTexto('a: 2\n'));
  });

  it('del motor lleva lo que corre al compilar y calcular, y lo que decide lo que se escribe; nada más', () => {
    const fs = ficherosDelMotor(process.cwd());
    for (const f of ['pieza.ts', 'motor.ts', 'rayo.ts', 'pliegue.ts', 'candidatas.ts', 'tolerancias.ts', 'publicadas.ts']) expect(fs).toContain(`src/lib/vistas/${f}`);
    for (const f of ['dibujo.ts', 'resumen.ts', 'esquemas.ts', 'figura.ts', 'gira.ts']) expect(fs).not.toContain(`src/lib/vistas/${f}`);
    expect(fs.some((f) => f.includes('diedrico'))).toBe(false);
    expect(resumenDelMotor(process.cwd())).toMatch(/^[0-9a-f]{64}$/);
  });

  it('sigue los import que corren y no los que son solo de tipos', () => {
    const texto = [
      "import type { P2 } from '../diedrico.ts';",
      "import { a, type B } from './uno.ts';",
      'import {',
      '  c,',
      '  d,',
      "} from './dos.ts';",
      "export { e } from './tres.ts';",
      "import './cuatro.ts';",
      "import yaml from 'js-yaml';",
    ].join('\n');
    expect(importados(texto)).toEqual(['./uno.ts', './dos.ts', './tres.ts', './cuatro.ts']);
  });
});
