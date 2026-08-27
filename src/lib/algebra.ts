/**
 * Lectura y comparación de vectores y matrices.
 *
 * Nace el 26 de agosto de 2026, con la ordinaria de Álgebra de 2024-2025
 * delante y no antes (§13: el framework se destila del contenido). Ese examen
 * pide dos cosas que ningún lector del repositorio sabía leer:
 *
 *  · **las coordenadas de un vector**, $(0,0,-3,0)$. Con `conjunto` —que
 *    compara sin orden— la respuesta $(0,-3,0,0)$ se habría dado por buena, y
 *    en una base el orden ES la respuesta;
 *  · **una matriz** de $3\times3$ con $5/2$ y $3/2$ dentro.
 *
 * Se apoya en `leeComplejo`, que ya sabe leer `√6/2`, `-1/3` y `2,5`, así que
 * aquí no se vuelve a escribir ninguna gramática de números. Y admite
 * complejos porque una base de un espacio vectorial sobre ℂ los lleva; en los
 * ocho exámenes leídos todos los coeficientes son reales, pero restringirlo
 * habría sido una decisión sin motivo.
 */

import { leeComplejo, comparaComplejo, type Complejo } from './complejo';

/** Un vector es una lista ORDENADA de coordenadas. */
export type Vector = Complejo[];

/** Una matriz es una lista de filas, todas de la misma longitud. */
export type Matriz = Vector[];

/** Quita los envoltorios con los que se escribe un vector a mano.
 *
 *  Se admiten los cuatro que usa la gente —`(1,2,3)`, `[1,2,3]`, `{1,2,3}`,
 *  `<1,2,3>`— y también ninguno. Rechazar `1,2,3` por no llevar paréntesis
 *  sería el mismo falso error que motivó el lector de complejos. */
function desenvuelve(t: string): string {
  let s = (t ?? '').trim();
  const pares: [string, string][] = [['(', ')'], ['[', ']'], ['{', '}'], ['<', '>']];
  /* Se quitan todas las capas, no solo una: `[[1,0;0,1]]` sale de juntar las
     filas de una matriz escrita `[[1,0],[0,1]]`.
     Y se comprueba que el paréntesis de apertura sea el que cierra al final,
     contando profundidad. Sin eso, `(1,2);(3,4)` empieza por `(` y acaba por
     `)` sin que sean pareja, y quitarlos deja `1,2);(3,4`, que es basura. */
  for (let vuelta = 0; vuelta < 4; vuelta++) {
    const par = pares.find(([a, b]) => s.startsWith(a) && s.endsWith(b));
    if (!par) break;
    const [a, b] = par;
    let prof = 0;
    let cierraAlFinal = true;
    for (let i = 0; i < s.length; i++) {
      if (s[i] === a) prof++;
      else if (s[i] === b) prof--;
      if (prof === 0 && i < s.length - 1) { cierraAlFinal = false; break; }
    }
    if (!cierraAlFinal) break;
    s = s.slice(1, -1).trim();
  }
  return s;
}

/**
 * Lee un vector: `(1, 0, -2, 0)`, `1;0;-2;0`, `[√2/2, 0, 1]`.
 *
 * Devuelve null si alguna coordenada no se entiende. Media respuesta no es
 * una respuesta: es la misma regla que en `leeConjunto`, y por el mismo
 * motivo — devolver un vector a medias haría que el diagnóstico hablara de
 * una respuesta que el alumno no ha dado.
 */
export function leeVector(entrada: string): Vector | null {
  const cuerpo = desenvuelve(entrada ?? '');
  /* La coma es separador **y** marca decimal, y eso es ambiguo de verdad:
     `(2,5 , 1)` puede ser el vector de dos coordenadas $(2{,}5;\,1)$ o el de
     tres $(2,5,1)$. No se adivina. La regla, que además es la que la gente usa
     sola: **si hay punto y coma, separa el punto y coma** y la coma queda
     libre para los decimales; si no lo hay, separa la coma y los decimales van
     con punto. El campo `formato` del ejercicio lo dice. */
  const separador = cuerpo.includes(';') ? /;/ : /,/;
  const partes = cuerpo
    .split(separador)
    .map((p) => p.trim())
    .filter((p) => p !== '');
  if (partes.length < 2) return null; // un vector de una coordenada es un número

  const salida: Vector = [];
  for (const p of partes) {
    const z = leeComplejo(p);
    if (!z) return null;
    salida.push(z);
  }
  return salida;
}

/**
 * Compara dos vectores **con el orden puesto**, que es la diferencia entera
 * con `comparaConjunto`.
 *
 * Devuelve además cuántas coordenadas fallan y si el fallo es solo de orden,
 * porque eso es el diagnóstico: dar las coordenadas correctas cambiadas de
 * sitio es un error distinto de calcularlas mal, y merece otro mensaje.
 */
export function comparaVector(
  dado: Vector,
  esperado: Vector,
  tolerancia: number,
): { igual: boolean; longitudDistinta: boolean; fallan: number; soloOrden: boolean } {
  if (dado.length !== esperado.length) {
    return { igual: false, longitudDistinta: true, fallan: esperado.length, soloOrden: false };
  }
  let fallan = 0;
  for (let i = 0; i < esperado.length; i++) {
    if (!comparaComplejo(dado[i], esperado[i], tolerancia)) fallan++;
  }
  if (fallan === 0) return { igual: true, longitudDistinta: false, fallan: 0, soloOrden: false };

  /* ¿son los mismos números en otro orden? Se empareja cada uno con el primero
     libre que le cuadre, igual que en `comparaConjunto`. */
  const usados = new Set<number>();
  let emparejados = 0;
  for (const e of esperado) {
    const k = dado.findIndex((d, i) => !usados.has(i) && comparaComplejo(d, e, tolerancia));
    if (k >= 0) { usados.add(k); emparejados++; }
  }
  return {
    igual: false,
    longitudDistinta: false,
    fallan,
    soloOrden: emparejados === esperado.length,
  };
}

/**
 * Lee una matriz. Las filas se separan con `;` o con salto de línea, y las
 * columnas con `,`:
 *
 *     [1, 0, -1; 2, 4, 0; 0, -2, 2]
 *
 * Devuelve null si las filas no miden todas lo mismo, que es un error del
 * alumno y no una ambigüedad: una tabla dentada no es una matriz.
 */
export function leeMatriz(entrada: string): Matriz | null {
  /* `],[` es como se escribe una matriz cuando se copia de un sitio donde las
     filas van entre corchetes, y sin esto `[[1,0],[0,1]]` se leía como una
     sola fila con basura dentro. Se sustituye ANTES de quitar envoltorios,
     porque después ya no queda el `],[` que reconocer. */
  const cuerpo = desenvuelve((entrada ?? '').replace(/\]\s*,\s*\[/g, '];['));
  const filas = cuerpo
    .split(/[;\n]/)
    .map((f) => f.trim())
    .filter((f) => f !== '');
  if (filas.length < 1) return null;

  const salida: Matriz = [];
  for (const f of filas) {
    const partes = desenvuelve(f)
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p !== '');
    if (!partes.length) return null;
    const fila: Vector = [];
    for (const p of partes) {
      const z = leeComplejo(p);
      if (!z) return null;
      fila.push(z);
    }
    salida.push(fila);
  }
  const ancho = salida[0].length;
  if (salida.some((f) => f.length !== ancho)) return null;
  /* Una matriz de 1×1 es un número, y una de 1×n o n×1 es un vector: para esos
     ya hay lectores, y aceptarlos aquí solo serviría para que el mismo dato
     tuviera dos formas de escribirse. La primera versión usaba `&&` en vez de
     `||` y daba por buena una fila suelta como matriz de 1×3. */
  if (salida.length < 2 || ancho < 2) return null;
  return salida;
}

/**
 * Compara dos matrices, y distingue el error que más se comete: **darla
 * traspuesta**. Al calcular la matriz asociada a una aplicación lineal hay que
 * poner las coordenadas de cada imagen en COLUMNA, y ponerlas en fila es el
 * fallo clásico. Detectarlo permite decirlo con esas palabras en vez de
 * «incorrecto».
 */
export function comparaMatriz(
  dada: Matriz,
  esperada: Matriz,
  tolerancia: number,
): { igual: boolean; tamanoDistinto: boolean; fallan: number; esLaTraspuesta: boolean } {
  const filasE = esperada.length;
  const colsE = esperada[0].length;

  const traspuesta = (M: Matriz): Matriz => M[0].map((_, j) => M.map((f) => f[j]));
  const coincide = (A: Matriz, B: Matriz): number | null => {
    if (A.length !== B.length || A[0].length !== B[0].length) return null;
    let n = 0;
    for (let i = 0; i < A.length; i++) {
      for (let j = 0; j < A[0].length; j++) {
        if (!comparaComplejo(A[i][j], B[i][j], tolerancia)) n++;
      }
    }
    return n;
  };

  const directo = coincide(dada, esperada);
  if (directo === 0) {
    return { igual: true, tamanoDistinto: false, fallan: 0, esLaTraspuesta: false };
  }

  const conTraspuesta = coincide(dada, traspuesta(esperada));
  if (conTraspuesta === 0) {
    return { igual: false, tamanoDistinto: false, fallan: 0, esLaTraspuesta: true };
  }

  if (directo === null) {
    return {
      igual: false,
      tamanoDistinto: true,
      fallan: filasE * colsE,
      esLaTraspuesta: false,
    };
  }
  return { igual: false, tamanoDistinto: false, fallan: directo, esLaTraspuesta: false };
}
