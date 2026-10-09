/**
 * La edición de una sola asignatura (src/lib/edicion.mjs, scripts/verifica-solo.mjs).
 *
 * Para quién: quien publica la edición. Cuándo: cada vez que se corre
 * `npm test`. Qué gana: que el modo no se active solo, que el sitio completo
 * siga siendo el de siempre, y que el guardián de enlaces de la edición
 * detecte de verdad un enlace roto y uno que se sale. Cómo se comprueba: es
 * el propio test; el guardián se prueba con una carpeta de juguete.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
// @ts-expect-error módulo .mjs sin tipos
import { verifica } from '../../scripts/verifica-solo.mjs';

async function cargaEdicion(env: Record<string, string | undefined>) {
  vi.resetModules();
  for (const [k, v] of Object.entries(env)) {
    if (v === undefined) vi.stubEnv(k, '');
    else vi.stubEnv(k, v);
  }
  return await import('../../src/lib/edicion.mjs');
}

describe('el modo de una sola asignatura', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('sin variable no cambia nada', async () => {
    const e = await cargaEdicion({ SOLO_ASIGNATURA: undefined, BASE_SOLO: undefined });
    expect(e.enSolo).toBe(false);
    expect(e.SALIDA).toBe('dist');
    expect(e.BASE_SOLO).toBe('');
    expect(e.patronSolo('**/*.json', (id: string) => `${id}.json`)).toBe('**/*.json');
  });

  it('con variable, solo esa asignatura y su base por omisión', async () => {
    const e = await cargaEdicion({ SOLO_ASIGNATURA: 'expresion-grafica', BASE_SOLO: undefined });
    expect(e.enSolo).toBe(true);
    expect(e.SALIDA).toBe('dist-solo');
    expect(e.BASE_SOLO).toBe('/expresion-grafica');
    expect(e.patronSolo('**/*.json', (id: string) => `${id}.json`)).toBe('expresion-grafica.json');
  });

  it('respeta la base que se le da, sin barra final', async () => {
    const e = await cargaEdicion({ SOLO_ASIGNATURA: 'expresion-grafica', BASE_SOLO: '/otra/' });
    expect(e.BASE_SOLO).toBe('/otra');
  });

  it('rechaza un id que no es un id', async () => {
    await expect(cargaEdicion({ SOLO_ASIGNATURA: '../calculo' })).rejects.toThrow(/no es un id/);
  });
});

describe('el guardián de enlaces de la edición', () => {
  let dir = '';
  beforeEach(() => {
    dir = mkdtempSync(join(process.cwd(), 'tests', 'edicion', 'juguete-'));
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  const pagina = (ruta: string, cuerpo: string) => {
    mkdirSync(join(dir, ruta), { recursive: true });
    writeFileSync(join(dir, ruta, 'index.html'), `<!doctype html><body id="x">${cuerpo}</body>`);
  };
  const opts = { base: '/ed', site: 'https://ejemplo.test', otras: ['calculo'] };

  it('da por buena una edición cerrada', () => {
    pagina('.', '<a href="/ed/asig/">a</a><a href="/ed/asig/#uno">b</a>');
    pagina('asig', '<h2 id="uno">u</h2><a href="/ed/">vuelta</a><a href="#uno">aquí</a>');
    expect(verifica(dir, opts).errores).toEqual([]);
  });

  it('caza un enlace roto', () => {
    pagina('.', '<a href="/ed/no-existe/">a</a>');
    expect(verifica(dir, opts).errores.join('\n')).toMatch(/no existe en la edición/);
  });

  it('caza un ancla que no está', () => {
    pagina('.', '<a href="/ed/#fantasma">a</a>');
    expect(verifica(dir, opts).errores.join('\n')).toMatch(/ancla #fantasma/);
  });

  it('caza un enlace que se sale de la base', () => {
    pagina('.', '<a href="/">a</a>');
    expect(verifica(dir, opts).errores.join('\n')).toMatch(/sale de la edición/);
  });

  it('caza un enlace a otra asignatura, aunque exista', () => {
    pagina('.', '<a href="/ed/calculo/">a</a>');
    pagina('calculo', 'x');
    const e = verifica(dir, opts).errores.join('\n');
    expect(e).toMatch(/otra asignatura/);
  });

  it('caza un enlace externo no admitido', () => {
    pagina('.', '<a href="https://otro.test/x">a</a>');
    expect(verifica(dir, opts).errores.join('\n')).toMatch(/externo no admitido/);
  });

  it('mira también los destinos del índice de la paleta', () => {
    pagina('.', '<script type="application/json" data-indice>[{"destino":"/ed/fantasma/"}]</script>');
    expect(verifica(dir, opts).errores.join('\n')).toMatch(/fantasma/);
  });
});
