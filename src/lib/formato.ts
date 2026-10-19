/**
 * Lo que el `formato` de una respuesta no puede enseñar: la respuesta.
 *
 * El `formato` se pinta junto a la casilla **antes** de contestar
 * (`EjercicioGuiado.astro`), así que un trozo que dé el valor regala el paso.
 * Salió de tres maneras, las tres sin querer:
 *
 *   - «en forma exacta (8/5)». En 193 formatos —casi todos de Cálculo— ese
 *     paréntesis era la respuesta, con la casilla al lado esperando un 1,6.
 *     Lo vio el revisor de la muestra de diagnósticos del 28 de septiembre de
 *     2026 (fase E5), mirando otra cosa.
 *   - «un número, en MPa (vale −14/3)». Imita la coletilla «vale la forma
 *     exacta: pi/4…» y la completa con la respuesta. Lo vio el 15 de octubre
 *     de 2026 el revisor de un parcial de Elasticidad, y medido ese día eran
 *     los dieciséis «(vale …)» del sitio, sin excepción: nueve de Elasticidad
 *     y los demás de Álgebra, Fluidos y Mecánica. Hasta «(vale una fracción
 *     como 1/2)» tenía 1/2 por respuesta.
 *   - «forma binómica, por ejemplo 1.5+0.5i», con 1.5+0.5i por respuesta. Lo
 *     encontró el mismo día el barrido de `tests/formato.test.ts`: trece
 *     formatos de Cálculo y de Álgebra, tres de ellos en primeras
 *     evaluaciones de Cálculo, y entre ellos dos matrices y un «por ejemplo 1
 *     o 1+0i» que solo vio la revisión del código.
 *
 * Los dos primeros se quitan siempre: son la respuesta por construcción. El
 * ejemplo solo se quita cuando **es** la respuesta, leído con el mismo lector
 * que la casilla —`1.5+0.5i` y `3/2+i/2` son el mismo número—; un ejemplo que
 * no lo es ayuda a escribir, y se queda. Ante la duda se tapa de más: un
 * paréntesis sin cerrar se corta hasta el final, y un ejemplo que es la
 * respuesta se lleva consigo lo que venga detrás. Una pista de menos se nota
 * poco; una respuesta regalada se lleva el paso entero.
 *
 * Se hace aquí y no en cada formato (Regla 0): el dato no molesta mientras
 * no se pinte, y así no vuelve a pintarse aunque alguien lo copie. Los
 * paréntesis se cuentan, porque hay respuestas con paréntesis dentro:
 * «(sqrt(2))», «(vale 100·(2 + sqrt(3)))».
 */
import { comparaConjunto, comparaComplejo, leeConjunto } from './complejo';
import { comparaMatriz, comparaVector, leeMatriz, leeVector } from './algebra';
import { leeNumero } from './numero';

/** Lo que el formato necesita saber de la respuesta para no enseñarla. */
export interface RespuestaDelFormato {
  tipo: string;
  valor: string;
  tolerancia?: number;
}

/** Dónde empieza un paréntesis que da la respuesta: detrás de «exacta», o
 *  uno que empieza por «vale» o por «forma exacta». El índice que devuelve
 *  es el del «(» que va primero: en «(forma exacta (3 + sqrt(3))/4)» es el
 *  de fuera, y quitar el de dentro dejaba «(forma exacta/4)». */
function parentesisConLaRespuesta(formato: string): number | null {
  const exacta = /exact\w*\s*\(/i.exec(formato);
  const vale = /\(\s*vale\b/i.exec(formato);
  const forma = /\(\s*(?:en\s+)?(?:la\s+)?forma\s+exacta\b/i.exec(formato);
  const abre = [exacta ? exacta.index + exacta[0].length - 1 : -1, vale ? vale.index : -1, forma ? forma.index : -1].filter((i) => i >= 0);
  return abre.length ? Math.min(...abre) : null;
}

function sinParentesis(formato: string): string {
  const abre = parentesisConLaRespuesta(formato);
  if (abre === null) return formato;
  const antes = formato.slice(0, abre).replace(/\s+$/, '');
  let nivel = 0;
  for (let i = abre; i < formato.length; i++) {
    if (formato[i] === '(') nivel++;
    else if (formato[i] === ')' && --nivel === 0) return sinParentesis(antes + formato.slice(i + 1));
  }
  // Sin cerrar: todo lo que sigue podría ser la respuesta.
  return antes;
}

/** Igual que el texto de la respuesta, sin espacios y con el menos de verdad
 *  escrito como guion. */
const comoTexto = (s: string) => s.replace(/\s+/g, '').replace(/−/g, '-');

/** Si `texto` es la respuesta, leído como lo leería la casilla. */
function esLaRespuesta(texto: string, r: RespuestaDelFormato): boolean {
  if (!texto) return false;
  if (comoTexto(texto) === comoTexto(r.valor)) return true;
  const tol = r.tolerancia ?? 0.001;
  switch (r.tipo) {
    case 'numero':
    case 'complejo': {
      const a = leeNumero(texto);
      const b = leeNumero(r.valor);
      return !!a && !!b && comparaComplejo(a, b, tol);
    }
    case 'conjunto': {
      const a = leeConjunto(texto);
      const b = leeConjunto(r.valor);
      return !!a && !!b && comparaConjunto(a, b, tol).igual;
    }
    case 'vector': {
      const a = leeVector(texto);
      const b = leeVector(r.valor);
      return !!a && !!b && comparaVector(a, b, tol).igual;
    }
    case 'matriz': {
      const a = leeMatriz(texto);
      const b = leeMatriz(r.valor);
      return !!a && !!b && comparaMatriz(a, b, tol).igual;
    }
    default:
      return false;
  }
}

/** Los trozos de `resto` que pueden ser el ejemplo: cada principio que acaba
 *  donde podría acabar un ejemplo —antes de una coma, un punto y coma, un
 *  espacio o un paréntesis, o al final—, y cada alternativa de «A o B». */
function candidatos(resto: string): string[] {
  const salida: string[] = [];
  for (let i = 1; i <= resto.length; i++) {
    if (i < resto.length && !/[,;\s()]/.test(resto[i]) && resto[i - 1] !== ')') continue;
    const trozo = resto.slice(0, i).trim();
    salida.push(trozo, ...trozo.split(/\s+o\s+/));
  }
  return salida;
}

/** Quita «por ejemplo X» cuando X es la respuesta, y con él lo que venga
 *  detrás. Mira cada «por ejemplo», no solo el primero. */
function sinEjemploQueLaDa(formato: string, r: RespuestaDelFormato): string {
  const ejemplos = [...formato.matchAll(/[,;]?\s*por ejemplo\s+/gi)];
  for (const m of ejemplos) {
    const resto = formato.slice(m.index + m[0].length);
    if (candidatos(resto).some((c) => esLaRespuesta(c, r))) return formato.slice(0, m.index);
  }
  return formato;
}

/** Lo que queda colgando al quitar un trozo: comas y puntos y coma en los
 *  bordes, o la «o» final de «(vale A) o (vale B)». Solo se aplica si se
 *  quitó algo: un formato intacto puede acabar en una variable que se llame
 *  «o». */
const sinRestos = (s: string) => s.replace(/^[\s,;]+/, '').replace(/(?:[\s,;]+|\s+o)+$/, '');

/** El formato tal como se puede enseñar antes de contestar. Sin la
 *  respuesta, solo quita los paréntesis de «exacta» y de «vale». */
export function sinLaRespuesta(formato: string, respuesta?: RespuestaDelFormato): string {
  const limpio = sinParentesis(formato);
  const quitado = respuesta ? sinEjemploQueLaDa(limpio, respuesta) : limpio;
  return quitado === formato ? formato : sinRestos(quitado);
}
