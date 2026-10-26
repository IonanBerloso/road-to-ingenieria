/**
 * Un escalar plegado de YAML (`>` o `>-`) une sus renglones con un espacio, y
 * tiene dos trampas que se publican sin que falle nada:
 *
 * - **Una sola línea en blanco no hace párrafo.** El plegado la deja en un
 *   «\n» suelto, y markdown lo lee como un espacio: el párrafo de debajo sale
 *   pegado al de arriba. Hacen falta dos líneas en blanco, que dejan «\n\n».
 *   Medido el 26 de octubre de 2026: 49 cortes de párrafo con dos líneas y 44
 *   con una, en 19 rutas. Entre los pegados, el «Lo que esta ruta no prepara»
 *   de casi todas, que salía en mitad del párrafo de antes.
 * - **Un dato dentro del plegado sigue siendo texto.** Todo lo que vaya más
 *   adentro que su clave es parte del texto, también un `- id:` que se pegó
 *   un nivel más arriba de donde tocaba. Pasó el 8 de septiembre de 2026 en
 *   la ruta de la ordinaria de Álgebra: dos ejercicios cayeron dentro del
 *   `aprendes` de Gram-Schmidt, y la página publicó «… los vectores
 *   anteriores. - id: ejalg6-bol62-… nota: >-» hasta el 26 de octubre. Se
 *   avisa de lo más sangrado, que ningún texto de este sitio necesita, y de lo
 *   que tiene forma de dato aunque vaya al nivel del texto.
 *
 * Se busca en el ORIGEN, como en la sección 9 de `scripts/deuda.mjs`: en el
 * valor cargado, un «\n» de párrafo y uno de renglón ya no se distinguen.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONT = join(RAIZ, 'src', 'content');

function yamls(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) return yamls(p);
    return /\.ya?ml$/.test(n) ? [p] : [];
  });
}

type Trampa = { linea: number; que: 'una línea en blanco' | 'más sangrado' | 'parece YAML' };

/** Un renglón que empieza como una entrada de lista con su clave, o que es
 *  una clave con un plegado o un literal detrás. */
const PARECE_YAML = /^(?:- [\w-]+:(?: |$)|[\w-]+:\s*[>|][-+]?\s*$)/;

/** Las trampas de cada plegado de un texto YAML, con su número de renglón. */
export function trampasDePlegado(texto: string): { plegados: number; trampas: Trampa[] } {
  const lineas = texto.split('\n');
  const trampas: Trampa[] = [];
  let plegados = 0;
  for (let i = 0; i < lineas.length; i++) {
    // «clave: >-», «- clave: >-» o un «- >-» suelto de una lista
    const m = /^(\s*)(- )?(?:([\w-]+):\s*)?>[-+]?\s*(?:#.*)?$/.exec(lineas[i]);
    if (!m || (!m[2] && !m[3])) continue;
    plegados++;
    // El texto va más adentro que la clave; en un «- >-» suelto, más que el guion.
    const sangria = m[1].length + (m[2] && m[3] ? 2 : 0);
    let base: number | null = null;
    let enBlanco = 0;
    for (let j = i + 1; j < lineas.length; j++) {
      const l = lineas[j];
      if (l.trim() === '') {
        enBlanco++;
        continue;
      }
      const s = l.length - l.trimStart().length;
      if (s <= sangria) break;
      base ??= s;
      if (enBlanco === 1) trampas.push({ linea: j, que: 'una línea en blanco' });
      if (s > base) trampas.push({ linea: j + 1, que: 'más sangrado' });
      else if (PARECE_YAML.test(l.trim())) trampas.push({ linea: j + 1, que: 'parece YAML' });
      enBlanco = 0;
    }
  }
  return { plegados, trampas };
}

describe('trampasDePlegado()', () => {
  it('dos líneas en blanco hacen párrafo y no avisan', () => {
    expect(trampasDePlegado('a: >-\n  uno\n\n\n  dos\n').trampas).toEqual([]);
  });

  it('una sola línea en blanco avisa, en el renglón vacío', () => {
    expect(trampasDePlegado('a: >-\n  uno\n\n  dos\n').trampas).toEqual([{ linea: 3, que: 'una línea en blanco' }]);
  });

  it('las líneas en blanco del final no son un hueco', () => {
    expect(trampasDePlegado('a: >-\n  uno\n\nb: 1\n').trampas).toEqual([]);
  });

  /* El caso de Álgebra, recortado: el `- id:` va al nivel del texto y su
     `nota` más adentro, así que los dos son texto del `aprendes`. */
  it('un renglón más sangrado que el texto avisa', () => {
    const t = ['    aprendes: >-', '      Ortonormalizar.', '      - id: x', '        nota: >-', '          Del boletín.', '    dominio: y'];
    expect(trampasDePlegado(t.join('\n')).trampas).toEqual([
      { linea: 3, que: 'parece YAML' },
      { linea: 4, que: 'más sangrado' },
      { linea: 5, que: 'más sangrado' },
    ]);
  });

  /* Lo que vio la revisión del 26 de octubre de 2026: sin la `nota` de
     debajo, el `- id:` va al nivel del texto y no es «más sangrado». Un
     renglón que empieza como una entrada de lista con su clave, o que es una
     clave con un plegado o un literal detrás, no es prosa. Medido ese día: en
     los 22.005 plegados del contenido no hay ninguno, así que no da falsos
     avisos. Una clave con un valor cualquiera («puntos: 3») sí sale en prosa,
     543 veces, y por eso no se mira. */
  it('un renglón con forma de dato, al nivel del texto, avisa', () => {
    expect(trampasDePlegado('    aprendes: >-\n      Ortonormalizar.\n      - id: x\n    dominio: y').trampas).toEqual([
      { linea: 3, que: 'parece YAML' },
    ]);
    expect(trampasDePlegado('    aprendes: >-\n      Texto.\n      nota: >-\n      Más.\n    dominio: y').trampas).toEqual([
      { linea: 3, que: 'parece YAML' },
    ]);
    expect(trampasDePlegado('    aprendes: >-\n      Vale 3 puntos: lo dice el enunciado.\n    dominio: y').trampas).toEqual([]);
  });

  it('lee las claves de una lista y los plegados sueltos de una lista', () => {
    expect(trampasDePlegado('l:\n  - nota: >-\n      uno\n\n      dos\n').trampas).toHaveLength(1);
    expect(trampasDePlegado('l:\n  - >-\n    uno\n\n    dos\n').trampas).toHaveLength(1);
  });

  it('un literal no es un plegado', () => {
    expect(trampasDePlegado('a: |-\n  uno\n\n  dos\n').plegados).toBe(0);
  });
});

describe('ningún plegado del contenido pega dos párrafos ni se traga datos', () => {
  const porFichero = yamls(CONT).map((f) => ({
    fichero: relative(RAIZ, f).replace(/\\/g, '/'),
    ...trampasDePlegado(readFileSync(f, 'utf8')),
  }));

  it('hay plegados que mirar', () => {
    expect(porFichero.reduce((n, f) => n + f.plegados, 0)).toBeGreaterThan(10000);
  });

  it('ninguno', () => {
    const malos = porFichero.flatMap((f) => f.trampas.map((t) => `${f.fichero}:${t.linea} · ${t.que}`));
    expect(malos).toEqual([]);
  });
});
