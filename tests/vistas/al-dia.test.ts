/**
 * Las vistas publicadas están al día (diseño de la fase M, §3.8): cada pieza
 * de `src/content/piezas/` se recalcula aquí y se compara con su JSON de
 * `src/content/vistas/`, como `tests/fisica/vapor.test.ts` hace con las
 * tablas del agua. Si falla, la salida es una sola: `npm run vistas`.
 *
 * El esquema de la colección `vistas` ya rechaza un resumen que no casa, pero
 * Astro no vuelve a validar un fichero que no ha cambiado, y un cambio del
 * motor no cambia ningún fichero de contenido: esto lo ve igual.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';
import { describe, expect, it } from 'vitest';
import { calculaVistas } from '../../src/lib/vistas/motor.ts';
import { compilaPieza, type PiezaDeclarada } from '../../src/lib/vistas/pieza.ts';
import {
  idDePieza,
  primeraDiferencia,
  problemasDeInvariantes,
  problemasDeResumen,
  publicaVistas,
  type VistasPublicadas,
} from '../../src/lib/vistas/publicadas.ts';
import { CARPETA_DE_PIEZAS, CARPETA_DE_VISTAS, resumenDelMotor, resumenDeTexto } from '../../src/lib/vistas/resumen.ts';

const RAIZ = process.cwd();
const PIEZAS = join(RAIZ, ...CARPETA_DE_PIEZAS);
const VISTAS = join(RAIZ, ...CARPETA_DE_VISTAS);
const ids = (carpeta: string, ext: string) =>
  existsSync(carpeta) ? readdirSync(carpeta).filter((f) => f.endsWith(ext)).map((f) => f.slice(0, -ext.length)).sort() : [];

const MOTOR = resumenDelMotor(RAIZ);
const PUBLICADAS = ids(PIEZAS, '.yaml').map((id) => {
  const texto = readFileSync(join(PIEZAS, `${id}.yaml`), 'utf8');
  const ruta = join(VISTAS, `${id}.json`);
  return {
    id,
    texto,
    declarada: yaml.load(texto) as PiezaDeclarada,
    publicadas: existsSync(ruta) ? (JSON.parse(readFileSync(ruta, 'utf8')) as VistasPublicadas) : null,
  };
});

describe('las piezas y sus vistas publicadas', () => {
  it('hay piezas, y cada fichero se llama como su código', () => {
    expect(PUBLICADAS.length).toBeGreaterThan(0);
    for (const p of PUBLICADAS) expect(p.id, p.id).toBe(idDePieza(p.declarada.codigo));
  });

  it('ningún JSON de vistas se ha quedado sin su pieza', () => {
    expect(ids(VISTAS, '.json')).toEqual(ids(PIEZAS, '.yaml'));
  });

  it.each(PUBLICADAS.map((p) => [p.id, p] as const))('%s: su resumen es el de su pieza y el del motor de hoy', (_, p) => {
    expect(p.publicadas, `falta src/content/vistas/${p.id}.json: pasa \`npm run vistas\``).not.toBeNull();
    expect(problemasDeResumen(p.publicadas!.resumen, { pieza: resumenDeTexto(p.texto), motor: MOTOR })).toEqual([]);
  });

  it.each(PUBLICADAS.map((p) => [p.id, p] as const))('%s: recalculadas, son las publicadas', (_, p) => {
    const hoy = publicaVistas(calculaVistas(compilaPieza(p.declarada)), p.publicadas!.resumen);
    expect(primeraDiferencia(hoy, p.publicadas), 'las vistas publicadas no son las que salen hoy: pasa `npm run vistas`').toBeNull();
  });

  it.each(PUBLICADAS.map((p) => [p.id, p] as const))('%s: alzado y planta, la misma anchura; alzado y perfil, la misma altura; planta y perfil, la misma profundidad', (_, p) => {
    expect(problemasDeInvariantes(p.publicadas!)).toEqual([]);
  });
});

describe('y al revés: lo que se ha quedado atrás se ve', () => {
  const p = PUBLICADAS[0];

  it('una cifra movida una centésima de mm en lo publicado', () => {
    const tocado = structuredClone(p.publicadas!) as unknown as { vistas: { planta: { tramos: { forma: { tipo: string; a?: number[] } }[] } } };
    const t = tocado.vistas.planta.tramos.find((x) => x.forma.tipo === 'segmento')!;
    t.forma.a![0] += 0.01;
    const hoy = publicaVistas(calculaVistas(compilaPieza(p.declarada)), p.publicadas!.resumen);
    expect(primeraDiferencia(hoy, tocado)).toMatch(/^vistas\.planta\.tramos\[\d+\]\.forma\.a\[0\]: /);
  });

  it('una pieza cambiada: su resumen ya no casa', () => {
    expect(problemasDeResumen(p.publicadas!.resumen, { pieza: resumenDeTexto(`${p.texto}# un comentario\n`), motor: MOTOR })).toEqual([
      'la pieza ha cambiado desde que se calcularon sus vistas (cuenta su texto entero, también un comentario o un espacio): pasa `npm run vistas`',
    ]);
  });

  it('un motor cambiado: tampoco', () => {
    expect(problemasDeResumen(p.publicadas!.resumen, { pieza: resumenDeTexto(p.texto), motor: resumenDeTexto('otro motor') })).toEqual([
      'el motor de vistas ha cambiado desde que se calcularon: pasa `npm run vistas`',
    ]);
  });
});
