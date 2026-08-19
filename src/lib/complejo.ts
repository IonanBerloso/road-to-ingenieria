/**
 * Lectura y comparación de respuestas complejas.
 *
 * En Cálculo la respuesta casi nunca es un número: es $a + bi$, y el alumno la
 * escribe a mano. Corregir esto con una comparación de cadenas convierte
 * «-16-16i» y «-16 - 16i» en dos respuestas distintas, que es exactamente el
 * tipo de falso error que hace abandonar una herramienta.
 *
 * Se admite lo que se escribe de verdad en un examen: signos sueltos, comas
 * decimales, raíces y fracciones. No se admiten paréntesis ni exponenciales:
 * cuando el enunciado pide forma binómica, la respuesta va en forma binómica.
 */

export interface Complejo {
  re: number;
  im: number;
}

/** Un coeficiente tal y como se escribe: `16`, `√2`, `16√2`, `√3/2`, `1/2`, `.5` */
const COEFICIENTE = /^(\d*\.?\d*)(?:(?:√|sqrt\()(\d+\.?\d*)\)?)?(?:\/(\d+\.?\d*))?$/;

/** Normaliza lo que el teclado del alumno produce y lo que produce copiar del PDF. */
function normaliza(entrada: string): string {
  return entrada
    .trim()
    .toLowerCase()
    .replace(/[−–—]/g, '-') // menos tipográfico, guion corto y raya
    .replace(/[·*×]/g, '')
    .replace(/,/g, '.')
    .replace(/\s+/g, '');
}

/** Evalúa un coeficiente. Devuelve null si no encaja con la gramática. */
function valor(texto: string): number | null {
  if (texto === '') return 1; // el `i` suelto vale 1i
  const m = COEFICIENTE.exec(texto);
  if (!m) return null;

  const [, entero, raiz, divisor] = m;
  if (entero === '' && raiz === undefined) return null;

  let n = entero === '' || entero === '.' ? 1 : Number(entero);
  if (Number.isNaN(n)) return null;
  if (raiz !== undefined) n *= Math.sqrt(Number(raiz));
  if (divisor !== undefined) {
    const d = Number(divisor);
    if (d === 0) return null;
    n /= d;
  }
  return n;
}

/**
 * Lee una respuesta en forma binómica. Devuelve null si no se entiende: es
 * preferible pedir que lo reescriba a corregir algo que no ha dicho.
 */
export function leeComplejo(entrada: string): Complejo | null {
  const texto = normaliza(entrada ?? '');
  if (!texto) return null;

  // Trocea en términos conservando el signo: «-16-16i» → ['-16', '-16i'].
  const terminos = texto.match(/[+-]?[^+-]+/g);
  if (!terminos) return null;

  // Si los términos no reconstruyen la entrada, sobra algo: «1+» no es un 1
  // con un signo de adorno, es una respuesta a medio escribir.
  if (terminos.join('') !== texto) return null;

  let re = 0;
  let im = 0;

  for (const termino of terminos) {
    const signo = termino.startsWith('-') ? -1 : 1;
    let cuerpo = termino.replace(/^[+-]/, '');
    if (!cuerpo) return null;

    const imaginario = cuerpo.endsWith('i');
    if (imaginario) cuerpo = cuerpo.slice(0, -1);

    const n = valor(cuerpo);
    if (n === null) return null;

    if (imaginario) im += signo * n;
    else re += signo * n;
  }

  return { re, im };
}

/** Compara dos complejos con tolerancia absoluta en cada componente. */
export function comparaComplejo(a: Complejo, b: Complejo, tolerancia: number): boolean {
  return Math.abs(a.re - b.re) <= tolerancia && Math.abs(a.im - b.im) <= tolerancia;
}

/** Escribe un complejo como se escribe en un examen: sin `0 +`, sin `1i`. */
export function escribeComplejo({ re, im }: Complejo): string {
  const n = (x: number) => String(Number(x.toFixed(6)));
  if (im === 0) return n(re);

  const parteIm = Math.abs(im) === 1 ? 'i' : `${n(Math.abs(im))}i`;
  if (re === 0) return im > 0 ? parteIm : `-${parteIm}`;
  return `${n(re)} ${im > 0 ? '+' : '-'} ${parteIm}`;
}
