/**
 * Los simulacros nuestros (fase H3, 29 de septiembre de 2026): sus partes y
 * la nota que sale de ellas.
 *
 * POR QUÉ. Ciencia de Materiales no tiene un solo examen de teoría y
 * problemas entre el material, y su examen pide un 40 % de teoría y un 60 %
 * de problemas con un mínimo de 4,0 en cada parte: sin él, la nota se queda
 * como mucho en un 4,0. Un simulacro que diera una sola nota escondería
 * justo la regla que más suspende —un 9 en problemas con un 3 en teoría no
 * es un 6,6, es un 4—. El peso, el mínimo y el tope no se escriben en el
 * simulacro: salen de la `evaluacion` del catálogo, que es donde ya estaban
 * (§01).
 */

/** Una parte del simulacro, resuelta contra el catálogo. `n` son las filas de
 *  la hoja que la forman, contando desde 1. */
export interface ParteDelSimulacro {
  titulo: string;
  peso: number;
  minimo?: number;
  tope?: number;
  n: number[];
}

interface SubDeCatalogo {
  id: string;
  que: string;
  peso: number;
  minimo?: number;
  tope?: number;
}
interface EvaluacionDeCatalogo {
  modalidades: { partes: { sub?: SubDeCatalogo[] }[] }[];
}

/** Las partes de un simulacro, con su peso, mínimo y tope sacados de la
 *  `evaluacion` del catálogo por el `id` de la subparte. Rompe el build si
 *  una subparte no existe, si los pesos no suman 100 o si una fila de la hoja
 *  no cae en exactamente una parte: un reparto a medias publicaría una nota
 *  que no es la del examen. */
export function partesDelSimulacro(
  evaluacion: EvaluacionDeCatalogo | undefined,
  partes: readonly { sub: string; n: readonly number[] }[],
  filas: number,
  quien: string,
): ParteDelSimulacro[] {
  const subs = (evaluacion?.modalidades ?? []).flatMap((m) => m.partes.flatMap((p) => p.sub ?? []));
  const resueltas = partes.map((p) => {
    const s = subs.find((x) => x.id === p.sub);
    if (!s) throw new Error(`El simulacro ${quien} nombra la parte «${p.sub}», que la evaluación del catálogo no tiene.`);
    return { titulo: s.que, peso: s.peso, minimo: s.minimo, tope: s.tope, n: [...p.n] };
  });

  const suma = resueltas.reduce((a, p) => a + p.peso, 0);
  if (suma !== 100) throw new Error(`Las partes del simulacro ${quien} pesan ${suma}, no 100.`);

  const cuenta = new Map<number, number>();
  for (const p of resueltas) for (const n of p.n) cuenta.set(n, (cuenta.get(n) ?? 0) + 1);
  for (let n = 1; n <= filas; n++) {
    if (cuenta.get(n) !== 1)
      throw new Error(`En el simulacro ${quien}, la fila ${n} cae en ${cuenta.get(n) ?? 0} partes: tiene que caer en una.`);
  }
  for (const n of cuenta.keys()) {
    if (n < 1 || n > filas) throw new Error(`El simulacro ${quien} reparte la fila ${n}, y la hoja tiene ${filas}.`);
  }
  return resueltas;
}

/** La nota del examen a partir de la de cada parte, sobre 10. Con el mínimo
 *  sin cumplir en alguna parte, la nota se queda en su tope si lo supera. */
export function notaPorPartes(
  partes: readonly { peso: number; minimo?: number; tope?: number; nota: number }[],
): { nota: number; sinTope: number; topada: boolean } {
  const pesos = partes.reduce((a, p) => a + p.peso, 0);
  const sinTope = partes.reduce((a, p) => a + (p.peso * p.nota) / pesos, 0);
  const topes = partes
    .filter((p) => p.minimo !== undefined && p.nota < p.minimo)
    .map((p) => p.tope ?? Number.POSITIVE_INFINITY);
  const tope = Math.min(...topes, Number.POSITIVE_INFINITY);
  const nota = Math.min(sinTope, tope);
  return { nota, sinTope, topada: nota < sinTope };
}
