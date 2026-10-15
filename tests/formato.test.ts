/**
 * El `formato` de una respuesta se pinta junto a la casilla antes de
 * contestar, así que no puede llevar la respuesta (el porqué largo, en
 * `src/lib/formato.ts`).
 *
 * Dos partes: la regla, con los casos que la hicieron falta, y un barrido de
 * todos los ejercicios del sitio. El barrido es el que importa: las dos veces
 * que esto pasó, la respuesta llevaba semanas publicada en decenas de
 * formatos y no la vio ningún guardián, sino un revisor mirando otra cosa.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { describe, expect, it } from 'vitest';
import { sinLaRespuesta, type RespuestaDelFormato } from '../src/lib/formato';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONT = join(RAIZ, 'src', 'content');

describe('sinLaRespuesta()', () => {
  it('quita el paréntesis de detrás de «exacta»', () => {
    expect(sinLaRespuesta('en forma exacta (8/5)')).toBe('en forma exacta');
    expect(sinLaRespuesta('en forma exacta (sqrt(2)), con su signo')).toBe('en forma exacta, con su signo');
  });

  it('quita un paréntesis que empieza por «vale», con paréntesis dentro', () => {
    expect(sinLaRespuesta('un número, en MPa (vale -14/3)')).toBe('un número, en MPa');
    expect(sinLaRespuesta('un número, en MPa (vale 100·(2 + sqrt(3)))')).toBe('un número, en MPa');
    expect(sinLaRespuesta('un número (vale una fracción como 1/2)')).toBe('un número');
    expect(sinLaRespuesta('un número, en rad/s (vale la forma exacta pi/2)')).toBe('un número, en rad/s');
  });

  it('quita el ejemplo que es la respuesta, leído como lo lee la casilla', () => {
    const z = { tipo: 'complejo', valor: '1.5+0.5i' };
    expect(sinLaRespuesta('forma binómica, por ejemplo 1.5+0.5i', z)).toBe('forma binómica');
    expect(sinLaRespuesta('forma binómica, por ejemplo 3/2+i/2', z)).toBe('forma binómica');
    expect(sinLaRespuesta('forma binómica, por ejemplo -3+2i', z)).toBe('forma binómica, por ejemplo -3+2i');
    const v = { tipo: 'vector', valor: '(0, 0, -3, 0)' };
    expect(sinLaRespuesta('las cuatro coordenadas en orden, por ejemplo (0, 0, -3, 0)', v)).toBe(
      'las cuatro coordenadas en orden',
    );
    expect(sinLaRespuesta('las cuatro coordenadas en orden, por ejemplo (1, 2, 0, 5)', v)).toBe(
      'las cuatro coordenadas en orden, por ejemplo (1, 2, 0, 5)',
    );
  });

  /* Los que se escapaban a la primera versión y vio la revisión del código. */
  it('lo quita también en una matriz, con alternativas o con texto detrás', () => {
    const m = { tipo: 'matriz', valor: '-1, 1, 3; 1, -1, 0; -1, 1, 1' };
    expect(sinLaRespuesta('filas separadas por punto y coma, por ejemplo -1,1,3; 1,-1,0; -1,1,1', m)).toBe(
      'filas separadas por punto y coma',
    );
    const uno = { tipo: 'complejo', valor: '1' };
    expect(sinLaRespuesta('forma binómica, por ejemplo 1 o 1+0i', uno)).toBe('forma binómica');
    const n = { tipo: 'numero', valor: '1.5' };
    expect(sinLaRespuesta('un número, por ejemplo 3/2, en MPa', n)).toBe('un número');
    expect(sinLaRespuesta('un número, por ejemplo 3/2 (con su signo)', n)).toBe('un número');
    expect(sinLaRespuesta('un número, por ejemplo 2, o por ejemplo 3/2', n)).toBe('un número, por ejemplo 2');
  });

  it('ante un paréntesis sin cerrar, tapa hasta el final', () => {
    expect(sinLaRespuesta('un número (vale 3/2')).toBe('un número');
    expect(sinLaRespuesta('en forma exacta (3/2 y vale (4)')).toBe('en forma exacta');
  });

  it('no deja restos colgando', () => {
    expect(sinLaRespuesta('forma exacta (vale 1/2) o (vale 3)')).toBe('forma exacta');
  });

  it('deja los paréntesis que no dan la respuesta', () => {
    expect(sinLaRespuesta('un número, en MPa (con su signo)')).toBe('un número, en MPa (con su signo)');
    expect(sinLaRespuesta('un número entero')).toBe('un número entero');
  });
});

/** Todos los YAML de ejercicios del sitio: los de cada tema y los de cada
 *  examen, que se llaman igual. */
function ejercicios(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) return ejercicios(p);
    return n === 'ejercicios.yaml' ? [p] : [];
  });
}

type Hallazgo = { fichero: string; formato: string; respuesta?: RespuestaDelFormato };

/** Cada `formato` tal como se pinta: el de una respuesta pasa por
 *  `sinLaRespuesta()` con su respuesta; el de un paso `verificar`, tal cual. */
function formatosPintados(nodo: unknown, fichero: string, salida: Hallazgo[]): void {
  if (Array.isArray(nodo)) {
    for (const x of nodo) formatosPintados(x, fichero, salida);
    return;
  }
  if (!nodo || typeof nodo !== 'object') return;
  const o = nodo as Record<string, unknown>;
  const r = o.respuesta as { tipo?: string; formato?: string; valor?: string; tolerancia?: number } | undefined;
  if (r && typeof r.formato === 'string' && typeof r.tipo === 'string' && typeof r.valor === 'string') {
    const respuesta = { tipo: r.tipo, valor: r.valor, tolerancia: r.tolerancia };
    salida.push({ fichero, formato: sinLaRespuesta(r.formato, respuesta), respuesta });
  }
  if (o.tipo === 'verificar' && typeof o.formato === 'string') salida.push({ fichero, formato: o.formato });
  for (const v of Object.values(o)) formatosPintados(v, fichero, salida);
}

describe('ningún formato del sitio enseña la respuesta', () => {
  const pintados: Hallazgo[] = [];
  for (const f of ejercicios(CONT)) {
    formatosPintados(yaml.load(readFileSync(f, 'utf8')), relative(RAIZ, f), pintados);
  }

  it('hay formatos que mirar', () => {
    expect(pintados.length).toBeGreaterThan(1000);
  });

  it('ninguno se pinta con un «exacta (…)» ni con un «(vale …)»', () => {
    const malos = pintados.filter((p) => /exact\w*\s*\(|\(\s*vale\b/i.test(p.formato));
    expect(malos.map((p) => `${p.fichero}: ${p.formato}`)).toEqual([]);
  });

  /* Un valor de cuatro caracteres o más escrito dentro del formato es casi
     seguro la respuesta. Se compara sin espacios y con el menos escrito como
     guion, porque «-1, 1, 3» y «-1,1,3» son la misma matriz: la primera
     versión de esta prueba comparaba el texto tal cual y no vio dos. Más
     corto, «1» o «0.5», saldría en cualquier frase; para esos está la prueba
     de abajo. */
  it('ninguno lleva escrito el valor de su respuesta', () => {
    const comoTexto = (s: string) => s.replace(/\s+/g, '').replace(/−/g, '-');
    const malos = pintados.filter(
      (p) => p.respuesta && p.respuesta.valor.length >= 4 && comoTexto(p.formato).includes(comoTexto(p.respuesta.valor)),
    );
    expect(malos.map((p) => `${p.fichero}: ${p.formato} (${p.respuesta!.valor})`)).toEqual([]);
  });

  /* Lo pintado ya no tiene nada que quitar: ni un paréntesis de «exacta» o de
     «vale», ni un ejemplo que, leído como lo lee la casilla, sea la
     respuesta, por corta que sea. */
  it('pasarlo dos veces por sinLaRespuesta() no quita nada más', () => {
    const malos = pintados.filter((p) => p.respuesta && sinLaRespuesta(p.formato, p.respuesta) !== p.formato);
    expect(malos.map((p) => `${p.fichero}: ${p.formato}`)).toEqual([]);
  });
});
