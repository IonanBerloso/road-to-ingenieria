/**
 * Las tablas que el sitio publica, leídas del sitio.
 *
 * Un examen de Fluidos que pide un coeficiente de Hazen-Williams o una
 * rugosidad no lo calcula: lo busca en una tabla. Verificar ese paso copiando
 * el número aquí no verificaría nada —sería la misma cifra escrita dos veces—,
 * así que se lee de **la página de teoría del propio sitio**. Si el tema y el
 * examen se contradijeran, el test se pone rojo, que es exactamente lo que se
 * quiere: son la misma afirmación publicada en dos sitios.
 *
 * Este fichero nace el 6 de septiembre de 2026 por la Regla 0 (§01): el lector
 * de la tabla del tema 19 estaba copiado en dos ficheros de convocatoria y
 * estaba a punto de estarlo en un tercero.
 */
import { readFileSync } from 'node:fs';

/** El corpus escribe la coma decimal como `{,}` para que KaTeX no la trate
    como separador, así que hay que deshacer eso antes de leer el número. */
function numeroDeLaTabla(t: string) {
  const limpio = t.trim().replace(/\{,\}/g, '.').replace(/^\$\s*\\le\s*/, '$');
  const m = /^\$(?:([\d.]+)\\cdot\s*)?10\^\{(-?\d+)\}\$$/.exec(limpio);
  if (!m) throw new Error(`no sé leer «${t}»`);
  return Number(m[1] ?? '1') * 10 ** Number(m[2]);
}

/**
 * El tope superior de una celda de rango. Tres formas conviven en la tabla, y
 * las tres se leen aquí porque las tres están publicadas:
 * `$\le 1{,}5\cdot 10^{-5}$` (la primera banda), `$a$ … $b$` (las de en medio)
 * y `$> 1{,}5\cdot 10^{-2}$` (la última, que no tiene tope).
 *
 * La primera forma era la que fallaba: el lector la daba por ilegible y le
 * ponía tope infinito, así que la banda de 150 se colaba al final del orden y
 * una tubería lisísima recibía 140. Nadie lo notó porque ningún examen ha
 * pedido todavía una rugosidad relativa por debajo de 1,5·10⁻⁵ — o sea que era
 * confianza falsa esperando su turno.
 */
function topeDeLaBanda(celda: string) {
  if (celda.includes('>')) return Infinity;
  const grupos = celda.match(/\$[^$]+\$/g);
  if (!grupos) throw new Error(`no sé leer la banda «${celda}»`);
  return numeroDeLaTabla(grupos[grupos.length - 1]);
}

/**
 * El coeficiente de Hazen-Williams que la tabla del tema 19 asigna a una
 * rugosidad relativa. **Va por ε/D y no por material**, que es la trampa
 * favorita de estos exámenes: el mismo hierro galvanizado toma 130 en una
 * tubería y 120 en otra más estrecha.
 */
export function coeficienteHW(relativa: number) {
  const tema = readFileSync('src/content/fluidos/t19-conducciones/index.mdx', 'utf8');
  const bandas: { C: number; hasta: number }[] = [];
  for (const linea of tema.split('\n')) {
    const m = /^\|\s*(\d{3})\s*\|\s*(.+?)\s*\|$/.exec(linea);
    if (!m) continue;
    bandas.push({ C: Number(m[1]), hasta: topeDeLaBanda(m[2]) });
  }
  if (bandas.length < 5) throw new Error('la tabla del tema 19 ya no tiene sus bandas');
  if (bandas.filter((b) => b.hasta === Infinity).length !== 1)
    throw new Error('la tabla del tema 19 debería tener una sola banda sin tope, la última');
  const banda = bandas.sort((a, b) => a.hasta - b.hasta).find((x) => relativa <= x.hasta);
  if (!banda) throw new Error('la rugosidad relativa se sale de la tabla');
  return banda.C;
}
