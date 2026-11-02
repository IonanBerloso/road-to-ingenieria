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

  it('quita el nombre del sitio de la fuente solo en la edición', async () => {
    const f = 'Ejercicio propio · Road to Ingeniería, sobre el plano.';
    const completo = await cargaEdicion({ SOLO_ASIGNATURA: undefined });
    expect(completo.fuenteDeEdicion(f)).toBe(f);
    const solo = await cargaEdicion({ SOLO_ASIGNATURA: 'expresion-grafica' });
    expect(solo.fuenteDeEdicion(f)).toBe('Ejercicio propio, sobre el plano.');
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

  it('caza el nombre del sitio completo, también fuera del HTML', () => {
    pagina('.', '<p>Hola</p>');
    writeFileSync(join(dir, 'favicon.svg'), '<svg aria-label="Road to Ingeniería"></svg>');
    expect(verifica(dir, opts).errores.join('\n')).toMatch(/favicon\.svg: lleva el nombre del sitio/);
  });

  it('caza el nombre de otra asignatura en el texto, sin enlace ninguno', () => {
    pagina('.', '<p>como se ve en Cálculo</p>');
    const e = verifica(dir, { ...opts, nombres: ['Cálculo'] }).errores.join('\n');
    expect(e).toMatch(/nombra otra asignatura \(«Cálculo»\)/);
  });
});

describe('adónde lleva volver, en la edición', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('el logo y el nombre de la asignatura van a la entrada de la edición', async () => {
    vi.resetModules();
    vi.stubEnv('SOLO_ASIGNATURA', 'expresion-grafica');
    const r = await import('../../src/lib/rutas');
    expect(r.rutaInicio()).toBe(r.ruta());
    expect(r.rutaAsignatura('expresion-grafica')).toBe(r.ruta());
  });
});
