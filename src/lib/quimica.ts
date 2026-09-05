/**
 * Lector de respuestas químicas: fórmulas y nombres de compuestos.
 * ════════════════════════════════════════════════════════════════
 *
 * POR QUÉ EXISTE, que en una capa compartida hay que justificarlo (§13 caso 4).
 *
 * No lo pide un contenido: lo piden **los dos controles del primer
 * cuatrimestre que hay transcritos**, y en los dos con el mismo formato —una
 * lista de diez compuestos, la mitad para nombrar y la mitad para formular—.
 * Son 1,25 y 1,00 puntos, y hasta hoy eran los dos únicos ejercicios de
 * Fundamentos Químicos que se quedaban enteros en `fuera`: el único bloqueo
 * que impedía dar por transcritas las seis convocatorias.
 *
 * Se ha esperado a que lo pidieran dos y no uno, que es lo que manda §13. Con
 * uno solo habría sido diseñar en el vacío; con dos, y siendo la misma
 * pregunta, el alcance está medido.
 *
 * LO QUE HACE Y LO QUE NO. Compara una fórmula o un nombre de compuesto. **No
 * ajusta ecuaciones** y no sabe nada de estequiometría: ninguno de los dos
 * ejercicios lo pide, y añadirlo sería construir para un caso que no existe.
 *
 * LAS DOS MITADES, y por qué se distinguen solas. Una fórmula se compara
 * **respetando las mayúsculas**, porque en química son significado: `Co` es
 * cobalto y `CO` es monóxido de carbono. Un nombre, en cambio, se compara sin
 * tildes, sin mayúsculas y sin los conectores —«óxido de sodio» y «oxido
 * sodio» son la misma respuesta—. Cuál de las dos cosas es se decide por la
 * forma del texto esperado, no por un campo aparte: una fórmula no lleva
 * espacios y empieza por mayúscula.
 *
 * LOS SINÓNIMOS SON OBLIGATORIOS EN LOS NOMBRES. La nomenclatura admite dos
 * formas válidas para el mismo compuesto —la de stock y la tradicional— y el
 * propio examen imprime las dos en el mismo enunciado: «Plomo(II) hidróxido /
 * hidróxido plumboso». Dar una por mala sería corregir peor que el profesor.
 * Se escriben separadas por ` | ` en el campo `valor`.
 */

export interface Formula {
  /** Texto ya normalizado, que es lo que se compara. */
  clave: string;
  /** Si el texto tiene forma de fórmula química o de nombre. */
  esFormula: boolean;
  /** Los símbolos de elemento encontrados, para poder diagnosticar. */
  elementos: string[];
}

/** Subíndices y superíndices Unicode a dígitos normales.
 *
 *  Hace falta porque el enunciado se lee de un PDF donde los subíndices son
 *  caracteres propios, y porque un alumno con el móvil puede escribir
 *  cualquiera de las dos formas. `Fe₂O₃` y `Fe2O3` son la misma respuesta. */
const DIGITOS: Record<string, string> = {
  '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
  '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
  '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
};

const aDigitos = (s: string) => s.replace(/[₀-₉⁰-⁹]/g, (c) => DIGITOS[c] ?? c);

/** ¿Esto tiene pinta de fórmula química y no de nombre?
 *
 *  Una fórmula es una cadena de símbolos de elemento —mayúscula y opcional
 *  minúscula— con dígitos, paréntesis y puntos de hidratación, y **sin
 *  espacios**. Cualquier otra cosa se trata como nombre. */
const PINTA_DE_FORMULA = /^[A-Z][A-Za-z0-9()·.]*$/;

/** Los conectores que no cambian el significado de un nombre. Se quitan para
 *  que «óxido de sodio» y «óxido sodio» valgan lo mismo, que es lo que el
 *  corrector humano hace. */
const CONECTORES = new Set(['de', 'del', 'la', 'el']);

const sinTildes = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Los símbolos de elemento de una fórmula, en orden. */
const simbolos = (s: string): string[] => [...s.matchAll(/[A-Z][a-z]?/g)].map((m) => m[0]);

/**
 * Lee una fórmula o un nombre y devuelve su forma normalizada.
 *
 * Devuelve `null` solo cuando no hay nada legible: cadena vacía o puro signo
 * de puntuación. Todo lo demás se acepta como respuesta *posible* — decidir si
 * es la buena es cosa de `comparaFormula`.
 */
export function leeFormula(entrada: string): Formula | null {
  const bruto = aDigitos((entrada ?? '').trim());
  if (!bruto) return null;

  /* Los paréntesis con el número de oxidación se pegan al nombre para que
     «plomo (II)» y «plomo(II)» sean lo mismo. */
  const pegado = bruto.replace(/\s*\(\s*/g, '(').replace(/\s*\)/g, ')');

  if (PINTA_DE_FORMULA.test(pegado)) {
    /* Fórmula: se quitan los puntos de hidratación y se conserva el resto tal
       cual, mayúsculas incluidas. */
    const clave = pegado.replace(/[·.]/g, '');
    if (!clave) return null;
    return { clave, esFormula: true, elementos: simbolos(clave) };
  }

  /* Nombre: fuera tildes, mayúsculas y conectores. */
  const palabras = sinTildes(pegado.toLowerCase())
    .replace(/[^a-z0-9()\s]/g, ' ')
    .split(/\s+/)
    .filter((p) => p && !CONECTORES.has(p));

  if (palabras.length === 0) return null;
  return { clave: palabras.join(' '), esFormula: false, elementos: [] };
}

export interface VeredictoFormula {
  igual: boolean;
  /** Qué ha fallado, cuando se puede decir algo mejor que «no es». */
  fallo?: 'mayusculas' | 'subindices' | 'genero-cambiado';
}

/** Separa las formas aceptadas de un `valor`. */
const alternativas = (valor: string) =>
  valor
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean);

/**
 * Compara lo escrito con las formas aceptadas.
 *
 * `esperado` puede traer varias separadas por ` | `; basta acertar una. Y
 * cuando no acierta ninguna, intenta decir **por qué**, que es la mitad del
 * valor de este proyecto:
 *
 * - `mayusculas` — los mismos caracteres pero con otra caja. Es el error de
 *   escribir `CO` por `Co`, y merece su propio aviso porque son dos sustancias
 *   distintas y el alumno cree que ha acertado.
 * - `subindices` — los mismos elementos en el mismo orden pero con otros
 *   números. El compuesto es el que toca y la proporción no.
 * - `genero-cambiado` — ha escrito un nombre donde se pedía una fórmula, o al
 *   revés. Pasa cuando la lista tiene dos columnas y se contesta en la que no
 *   es.
 */
export function comparaFormula(escrito: string, esperado: string): VeredictoFormula {
  const a = leeFormula(escrito);
  if (!a) return { igual: false };

  const formas = alternativas(esperado)
    .map(leeFormula)
    .filter((f): f is Formula => f !== null);

  if (formas.some((b) => b.clave === a.clave)) return { igual: true };

  /* La caja se comprueba ANTES que la columna, y ese orden importa.
     ─────────────────────────────────────────────────────────────
     `k2so4` en minúsculas no pasa el patrón de fórmula —un símbolo de
     elemento empieza por mayúscula— así que se lee como si fuera un nombre,
     y sin esta comprobación se diagnosticaba «has contestado en la otra
     columna»: falso, y encima desorientador, porque el alumno ha escrito la
     fórmula correcta con el teclado en minúsculas. Salió al probarlo a mano
     en el navegador, no al pasar los tests.

     Se compara sobre el texto crudo sin puntuación, porque `a.clave` ya está
     normalizado como nombre y ha perdido la caja original. */
  const soloAlfanum = (s: string) => aDigitos(s).replace(/[^A-Za-z0-9]/g, '');
  const crudo = soloAlfanum(escrito ?? '');
  for (const b of formas) {
    if (!b.esFormula) continue;
    if (crudo.toLowerCase() === soloAlfanum(b.clave).toLowerCase())
      return { igual: false, fallo: 'mayusculas' };
  }

  /* ¿Ha contestado en la columna equivocada? */
  if (formas.length && formas.every((b) => b.esFormula !== a.esFormula))
    return { igual: false, fallo: 'genero-cambiado' };

  for (const b of formas) {
    if (!a.esFormula || !b.esFormula) continue;
    if (
      a.elementos.length === b.elementos.length &&
      a.elementos.every((e, i) => e === b.elementos[i])
    )
      return { igual: false, fallo: 'subindices' };
  }

  return { igual: false };
}

/** ¿El valor esperado es una fórmula? Lo usa el esquema para comprobar que el
 *  `formato` declarado dice en qué columna se contesta. */
export function esFormulaQuimica(valor: string): boolean {
  const primera = leeFormula(alternativas(valor)[0] ?? '');
  return primera?.esFormula ?? false;
}
