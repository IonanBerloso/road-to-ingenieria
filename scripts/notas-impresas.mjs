/**
 * Las notas que imprime un cuadernillo de examen, y si el enunciado
 * transcrito las lleva (fase I, 29 de septiembre de 2026).
 *
 * POR QUÉ. Un enunciado transcrito conserva los números y pierde las notas. Y
 * en Fluidos las notas puntúan: «NOTA: Los resultados sin deducción de la
 * expresión NO SON VÁLIDOS», «IMPRESCINDIBLE: indicar el tipo de flujo», «Nota:
 * limitar a 3 el número de iteraciones». Quien prepara el examen con el
 * enunciado sin ellas hace bien la cuenta y pierde los puntos. La auditoría
 * del 27 de septiembre encontró que ningún ejercicio de Fluidos las llevaba.
 *
 * CÓMO. Se vuelca el PDF con `pdftotext -layout`, se parte por la cabecera de
 * cada examen —«EXAMEN FINAL. 29 de Mayo de 2025»—, cada examen por sus
 * ejercicios —«3. (12,5%)»— y en cada ejercicio se recogen los bloques que
 * empiezan por NOTA, Nota, IMPRESCINDIBLE o «Notas a tener en cuenta». Un
 * bloque cuenta como transcrito si el 85 % de sus palabras de tres letras o más
 * están en las `notas` del ejercicio: las letras griegas y los subíndices se
 * pierden en el volcado, y el diseño a dos columnas mete de vez en cuando una
 * etiqueta de la figura en medio de la nota.
 *
 * Vive aparte de `verify.mjs` para poder probarlo sin PDF
 * (`tests/notas-impresas.test.ts`).
 */

/** La cabecera de cada examen del cuadernillo. «EXÁMEN» con tilde es como lo
 *  imprimen los de 2020. */
const CABECERA = /EX[AÁ]MEN\s+(?:PARCIAL|FINAL)\.\s*(\d{1,2})\s+de\s+(\p{L}+)\s+de\s+(\d{4})/iu;

/** El arranque de un ejercicio: «3. (12,5%)», «10. (5 %)» y la errata «3. (%10)»
 *  de la final de junio de 2021. */
const EJERCICIO = /^\s{0,12}(\d{1,2})\.\s*\(\s*[\d%]/;

/** El arranque de una nota. «NOTA2:» y «NOTA 1:» caen en el primero. */
const NOTA = /^\s*(?:NOTA\s*\d*\s*:|Notas?(?:\s+importante|\s+\d)?\s*:|IMPRESCINDIBLE|Notas a tener en cuenta)/;

/** Dónde acaba una nota: una línea en blanco, los resultados, las soluciones,
 *  los datos o un apartado nuevo. «DATO», en singular, porque el poppler del CI
 *  no deja línea en blanco entre la nota del 1 de la ordinaria de 2025 y su
 *  «DATO: Centroide…», y el xpdf que trae Git sí: con él pasaba en local y
 *  fallaba en el suelo (30 de septiembre de 2026). */
const FIN_DE_NOTA = /^\s*$|^\s*(?:Resultados|RESULTADOS|Soluciones|DATOS?|Datos?)\b|^\s*[a-h]\)\s/;

/** El pie y la cabecera de cada página, que el volcado mete donde caiga el
 *  salto: «Departamento de Ingeniería Energética … 28», «2º Curso. Grados…» y
 *  «Junio de 2021» solo en su línea. */
const MOBILIARIO = /Departamento de Ingenier[ií]a Energ[eé]tica|\d[ºo] Curso\. Grados|^\s*\p{L}+ de \d{4}\s*$/u;

/** Un punto de lista: «- Indicar el tipo de flujo…». */
const PUNTO = /^\s*[-–•]\s/;

/** La fecha como la escribe `examen.yaml`: «29 de mayo de 2025». */
export const clave = (dia, mes, anio) => `${Number(dia)} de ${mes.toLowerCase()} de ${anio}`;

/** El cuadernillo partido por exámenes, con la fecha como clave. Las líneas
 *  del índice, que llevan puntos de relleno, no abren examen. */
export function partePorExamen(texto) {
  const examenes = new Map();
  let actual = null;
  for (const linea of texto.split(/\r?\n/)) {
    const m = linea.match(CABECERA);
    if (m && !/\.{5,}/.test(linea)) {
      actual = clave(m[1], m[2], m[3]);
      examenes.set(actual, []);
      continue;
    }
    if (actual) examenes.get(actual).push(linea);
  }
  return new Map([...examenes].map(([k, v]) => [k, v.join('\n')]));
}

/** Un examen partido por sus ejercicios, con el número impreso como clave. */
export function partePorEjercicio(texto) {
  const ejercicios = new Map();
  let actual = null;
  for (const linea of texto.split('\n')) {
    const m = linea.match(EJERCICIO);
    if (m) {
      actual = Number(m[1]);
      if (!ejercicios.has(actual)) ejercicios.set(actual, []);
    }
    if (actual !== null) ejercicios.get(actual).push(linea);
  }
  return new Map([...ejercicios].map(([k, v]) => [k, v.join('\n')]));
}

/** Los bloques de nota de un ejercicio, cada uno con sus líneas unidas.
 *
 *  Una nota que acaba en dos puntos —«IMPRESCINDIBLE:», «Notas a tener en
 *  cuenta en la resolución del ejercicio:»— sigue en una lista de guiones
 *  separada por líneas en blanco, a veces partida por un salto de página. Esa
 *  se recoge entera: los puntos, sus líneas de continuación y lo que haya
 *  entre medias salvo el pie y la cabecera de página. */
export function bloquesDeNota(texto) {
  const bloques = [];
  let actual = null;
  let enLista = false;
  let trasBlanco = false;
  const cierra = () => {
    if (actual) bloques.push(actual.join(' '));
    actual = null;
    enLista = false;
  };
  for (const linea of texto.split('\n')) {
    if (NOTA.test(linea)) {
      cierra();
      actual = [linea.trim()];
      enLista = /:\s*$/.test(linea);
      trasBlanco = false;
      continue;
    }
    if (!actual || MOBILIARIO.test(linea)) continue;
    if (enLista) {
      if (/^\s*$/.test(linea)) trasBlanco = true;
      else if (PUNTO.test(linea) || !trasBlanco) {
        actual.push(linea.trim());
        trasBlanco = false;
      } else cierra();
      continue;
    }
    if (FIN_DE_NOTA.test(linea)) {
      cierra();
      continue;
    }
    actual.push(linea.trim());
  }
  cierra();
  return bloques.map((b) => b.replace(/\s+/g, ' ').trim());
}

/** Las palabras de tres letras o más, sin tildes, sin mayúsculas y sin los
 *  comandos de LaTeX, que en el volcado no están. */
export function palabras(texto) {
  const limpio = String(texto)
    .replace(/\\[a-zA-Z]+/g, ' ')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
  return new Set(limpio.match(/[a-z0-9]{3,}/g) ?? []);
}

/** Qué parte del bloque está en las notas, de 0 a 1. */
export function cobertura(bloque, notas) {
  const delBloque = palabras(bloque);
  if (delBloque.size === 0) return 1;
  const deLasNotas = palabras((notas ?? []).join(' '));
  let dentro = 0;
  for (const p of delBloque) if (deLasNotas.has(p)) dentro++;
  return dentro / delBloque.size;
}

export const UMBRAL = 0.85;

/** El número impreso de un ejercicio de examen de Fluidos: el campo `n` si lo
 *  lleva y, si no, el que va en su id, `exflu2526-ord-5-…`. */
export function numeroImpreso(ejercicio) {
  if (typeof ejercicio.n === 'number') return ejercicio.n;
  const m = String(ejercicio.id).match(/^exflu\d{4}-[a-z0-9]+-(\d+)/);
  return m ? Number(m[1]) : null;
}
