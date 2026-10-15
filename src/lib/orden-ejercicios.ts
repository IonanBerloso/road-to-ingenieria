/**
 * El orden en que se ven los ejercicios de un tema, sea cual sea el orden en
 * que estén escritos en su `ejercicios.yaml`.
 *
 * POR QUÉ (15 de octubre de 2026). Ionan: «cada tema tiene los ejercicios
 * pero no siguen un orden, y tienen que seguirlo para que sean fáciles de
 * seguir». Y antes: «SIEMPRE tienen que estar ordenados». Los ficheros se
 * fueron escribiendo por tandas, y cada tanda se añadía al final: en el tema 1
 * de Cálculo el boletín salía 1.1 a 1.5, luego 1.8 a 1.13 y después 1.6 y
 * 1.7, y diez ejemplos de entrada acababan detrás de toda la práctica; en el 2,
 * 2.1, 2.12, 2.15, 2.7… Quien sigue el boletín en papel no encontraba nada.
 *
 * Se ordena al cargar la colección (`content.config.ts`) y no en cada fichero
 * (Regla 0): así todo lo que lee la lista —la página del tema, sus bloques de
 * diez, las rutas, la paleta, la colección— ve el mismo orden, y un ejercicio
 * nuevo añadido al final cae en su sitio sin que nadie lo recoloque.
 *
 * El orden:
 *   1. Por nivel: los ejemplos, la práctica y los de examen (la escalera de
 *      §14).
 *   2. Dentro de la práctica, cada boletín junto —en el orden en que aparece
 *      por primera vez en el fichero— y, dentro de él, por su número:
 *      1.2 antes que 1.10, 3 antes que 12, 2.8a antes que 2.8b.
 *   3. Lo que no lleva número («Ejercicio propio») y los empates conservan el
 *      orden del fichero.
 *
 * Los ficheros de examen son todos de nivel `examen` y no traen boletín, así
 * que salen tal cual: su orden es el de la convocatoria.
 */

/** Lo que el orden necesita saber de un ejercicio. */
export interface Ordenable {
  nivel: string;
  fuente?: string;
}

const NIVEL: Record<string, number> = { ejemplo: 0, practica: 1, examen: 2 };

/** El boletín y el número de un ejercicio, leídos de su `fuente`:
 *  «Ejercicio 1.8 · Problemas complementarios, tema 1 · Cálculo…» da el
 *  boletín «ejercicio | Problemas complementarios, tema 1» y el número [1, 8].
 *  La palabra de delante del número cuenta: «Aplicaciones de la integral,
 *  problema 3» y «Ejercicio 3» del mismo boletín son dos numeraciones. Sin
 *  número delante del primer «·», no hay número. */
export function boletinYNumero(fuente = ''): { boletin: string; numero: number[] | null; resto: string } {
  const trozos = fuente.replace(/\s+/g, ' ').split(' · ');
  const cabeza = trozos[0] ?? '';
  const m = /(\d+(?:\.\d+)*)([a-z]?)/i.exec(cabeza);
  const delante = (m ? cabeza.slice(0, m.index) : cabeza).trim().toLowerCase().replace(/s$/, '');
  const numero = m ? m[1].split('.').map(Number) : null;
  /* Un número con capítulo, «7.4», ya dice de qué boletín es, y el nombre del
     boletín no siempre se escribe igual: en el tema del golpe de ariete de
     Fluidos la misma colección sale como «Colección de Problemas, capítulo
     7», «Colección de problemas, capítulo 7» y «Colección de problemas de
     Mecánica de Fluidos, Régimen…», y agrupando por el nombre el 7.4 caía
     detrás del 7.13. Un número suelto, «3», sí necesita el nombre: en
     Cálculo, «Ejercicio 3 · Problemas, tema 1» no es el 1.3 de los
     complementarios. */
  const boletin =
    numero && numero.length > 1
      ? `${delante} | capítulo ${numero[0]}`
      : `${delante} | ${(trozos[1] ?? '').trim().toLowerCase()}`;
  if (!m) return { boletin, numero: null, resto: '' };
  return { boletin, numero, resto: m[2].toLowerCase() };
}

/** Compara dos claves elemento a elemento; un número va antes que una letra,
 *  y una clave más corta, antes que la que la continúa (1.2 antes que 1.2.1). */
function comparaClaves(a: (number | string)[], b: (number | string)[]): number {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i];
    const y = b[i];
    if (x === y) continue;
    if (x === undefined) return -1;
    if (y === undefined) return 1;
    if (typeof x === 'number' && typeof y === 'number') return x - y;
    if (typeof x === 'number') return -1;
    if (typeof y === 'number') return 1;
    return x < y ? -1 : 1;
  }
  return 0;
}

/** Los ejercicios en el orden en que se ven. Devuelve una lista nueva.
 *
 *  Cada ejercicio lleva una clave entera y se ordena por ella, sin
 *  comparaciones a medias: un comparador que mirase el número cuando los dos
 *  lo tienen y el sitio en el fichero cuando no, no sería transitivo, y el
 *  orden saldría distinto según el motor. */
export function ordenDeEjercicios<T extends Ordenable>(lista: readonly T[]): T[] {
  const primeraVez = new Map<string, number>();
  const conClave = lista.map((e, i) => {
    const nivel = NIVEL[e.nivel] ?? 3;
    // Solo la práctica se ordena por boletín y número: los ejemplos son
    // nuestros, y los de examen de un tema siguen el orden en que se
    // escribieron.
    if (nivel !== NIVEL.practica) return { e, clave: [nivel, i] };
    const { boletin, numero, resto } = boletinYNumero(e.fuente);
    if (!primeraVez.has(boletin)) primeraVez.set(boletin, i);
    const grupo = primeraVez.get(boletin)!;
    // Dentro de un boletín, primero lo numerado y por su número; lo que no
    // lleva número, detrás y en el orden del fichero.
    // El número va relleno con −1 hasta cuatro niveles, para que 1.2 caiga
    // antes que 1.2.1 y la letra no se compare con un número.
    const relleno = [...numero ?? [], -1, -1, -1, -1].slice(0, 4);
    const clave = numero ? [nivel, grupo, 0, ...relleno, resto, i] : [nivel, grupo, 1, i];
    return { e, clave };
  });
  return [...conClave].sort((a, b) => comparaClaves(a.clave, b.clave)).map((d) => d.e);
}
