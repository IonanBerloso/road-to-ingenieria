/**
 * Cuántos ejercicios trae el cuadernillo de una convocatoria.
 *
 * No es lo mismo que cuántas resoluciones ofrece el sitio. En Térmica un
 * ejercicio tiene cinco apartados que cruzan tres temas y se parte en varias
 * piezas guiadas, así que contar entradas publicaría «7 ejercicios» de un
 * examen que tiene tres. Cuando las entradas declaran su `n`, manda el número
 * de `n` distintos; si no, las dos cifras coinciden.
 *
 * POR QUÉ ES UN FICHERO. La regla estaba escrita tres veces —en `Examen.astro`,
 * en el índice de exámenes y en la meta de cada convocatoria—, y de dos
 * maneras distintas que daban lo mismo por casualidad de la aritmética. Unida
 * el 26 de septiembre de 2026 (Regla 0): la siguiente copia que cambiara sola
 * publicaría un número distinto en cada página.
 */
export function ejerciciosDelCuadernillo(ejercicios: readonly { n?: number | null }[]): number {
  const numeros = new Set(ejercicios.map((e) => e.n).filter((n): n is number => n != null));
  return numeros.size > 0 ? numeros.size : ejercicios.length;
}

export interface FilaDelCuadernillo {
  /** Lo que se pinta en la fila: «3», o «5a» si el 5 va en varias piezas. */
  etiqueta: string;
  /** El número del ejercicio en el cuadernillo. */
  n: number;
  /** La parte del ejercicio que es esta pieza, para repartir el reloj. Las
   *  piezas de un mismo ejercicio suman 1. */
  peso: number;
  /** Si es la primera pieza de su ejercicio: la que lleva sus puntos. */
  primera: boolean;
}

/**
 * El número de cada fila de la hoja y lo que pesa en el reloj.
 *
 * POR QUÉ. Hasta el 28 de septiembre de 2026 la hoja numeraba por posición y
 * el simulacro daba a cada casilla un ejercicio entero de reloj. Las dos cosas
 * valían mientras cada entrada fuera un ejercicio. Con las piezas de Térmica
 * —tres ejercicios en siete— el reloj salía a 7 × 50 minutos para un examen
 * de 150, y con las dos resoluciones de Química, que empiezan en el 3 y
 * parten el 5 y el 6, la hoja decía «1, 2, 3» junto a un cuadernillo que
 * dice «3, 4, 5». Sin `n` se comporta como siempre.
 */
export function filasDelCuadernillo(ejercicios: readonly { n?: number | null }[]): FilaDelCuadernillo[] {
  const piezasDe = new Map<number, number>();
  for (const e of ejercicios) if (e.n != null) piezasDe.set(e.n, (piezasDe.get(e.n) ?? 0) + 1);
  const vistas = new Map<number, number>();
  return ejercicios.map((e, i) => {
    if (e.n == null) return { etiqueta: String(i + 1), n: i + 1, peso: 1, primera: true };
    const k = vistas.get(e.n) ?? 0;
    vistas.set(e.n, k + 1);
    const piezas = piezasDe.get(e.n) ?? 1;
    return {
      etiqueta: piezas > 1 ? `${e.n}${'abcdefghijklmnopqrstuvwxyz'[k]}` : String(e.n),
      n: e.n,
      peso: 1 / piezas,
      primera: k === 0,
    };
  });
}

type ConPdf = { pdf?: unknown; pdfEs: 'enunciado' | 'resolucion' | 'enunciado-con-resultados' };

/**
 * Qué PDF acompaña a un conjunto de convocatorias, dicho en media frase:
 * «Doce convocatorias, con …».
 *
 * POR QUÉ ES UNA FUNCIÓN. La portada y el índice de exámenes lo decían con
 * frases fijas de dos casos —enunciado o corrección del profesor—, y el 28 de
 * septiembre de 2026 Química pasó a tener los dos y una convocatoria sin PDF,
 * porque el documento es un escaneado y los escaneados no se publican. Una
 * frase fija habría afirmado de las tres lo que solo es cierto de una.
 */
export function queEsElPdf(exs: readonly ConPdf[]): string {
  const conPdf = exs.filter((e) => e.pdf !== undefined);
  const sin = exs.length - conPdf.length;
  /* Ninguna con PDF propio (las hojas de la colección de Expresión Gráfica):
     sin esto, el `every` de una lista vacía daba la primera rama, «el PDF
     corregido de la escuela». */
  if (conPdf.length === 0) return 'su enunciado transcrito, sin PDF propio';
  const base = conPdf.every((e) => e.pdfEs === 'resolucion')
    ? 'el PDF corregido de la escuela'
    : conPdf.every((e) => e.pdfEs === 'enunciado')
      ? 'su enunciado original en PDF'
      : conPdf.every((e) => e.pdfEs === 'enunciado-con-resultados')
        ? 'su enunciado original en PDF, con los resultados impresos'
        : conPdf.every((e) => e.pdfEs !== 'resolucion')
          ? 'su enunciado original en PDF, que en algunas trae los resultados impresos'
          : 'el PDF de la escuela, que es el enunciado o, en alguna, la corrección del profesor';
  if (sin === 0) return base;
  return sin === 1
    ? `${base}, salvo una que no lo publica y dice por qué`
    : `${base}, salvo ${sin} que no lo publican y dicen por qué`;
}

/**
 * El aviso de qué son las resoluciones de un conjunto de convocatorias.
 *
 * El índice de exámenes decía siempre «Los exámenes no publican solución: las
 * resoluciones son propuesta nuestra y están pendientes de revisión», también
 * en Ingeniería Térmica, cuyas veinte convocatorias están contrastadas con la
 * resolución completa del profesor. La página de cada examen ya lo
 * condicionaba (`esResolucion` en `Examen.astro`); el índice no. Encontrado el
 * 28 de septiembre de 2026, al meter las primeras resoluciones oficiales de
 * Química.
 */
export function avisoDeResoluciones(exs: readonly Pick<ConPdf, 'pdfEs'>[]): string {
  const oficiales = exs.filter((e) => e.pdfEs === 'resolucion').length;
  const conResultados = exs.filter((e) => e.pdfEs === 'enunciado-con-resultados').length;
  if (oficiales === 0 && conResultados === exs.length)
    return 'Los exámenes publican los resultados, no la resolución: las resoluciones son nuestras y llegan a esos resultados, o dicen dónde no.';
  if (oficiales === 0 && conResultados > 0)
    return 'Los exámenes no publican la resolución, y algunos traen los resultados impresos: las resoluciones son nuestras, y donde hay resultado llegan a él o dicen dónde no.';
  if (oficiales === 0)
    return 'Los exámenes no publican solución: las resoluciones son propuesta nuestra y están pendientes de revisión.';
  if (oficiales === exs.length)
    return 'Las resoluciones son nuestras, contrastadas con la resolución del profesor que tiene cada convocatoria.';
  return 'Donde el examen no publica solución, las resoluciones son propuesta nuestra y están pendientes de revisión. Las convocatorias con resolución del profesor lo dicen en su página, y están contrastadas con ella.';
}
