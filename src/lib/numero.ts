/**
 * Cómo se lee una respuesta numérica. Una sola vez, para los dos que la leen.
 *
 * POR QUÉ ES UN FICHERO. La lee el navegador, en `EjercicioGuiado`, y la lee
 * el esquema, en `content.config.ts`, para rechazar en el build un distractor
 * que el navegador daría por bueno. Si los dos no leen igual, el esquema
 * protege otra cosa que la que se publica.
 *
 * Y no leían igual. El navegador encadena dos lectores —el binómico, que
 * entiende `-16-16i`, y si ese no puede, la evaluación de expresiones, que
 * entiende `pi/4` o `sqrt(21)`—; el esquema los encadenaba en su `lector()`
 * pero **no** en las tres comprobaciones de distractores, que llamaban solo al
 * primero. Con una respuesta escrita como expresión, el primero devuelve
 * `null` y la comprobación se daba por buena en silencio: un distractor
 * `0.785` contra una respuesta `pi/4` con tolerancia 0,001 compilaba, y el
 * navegador lo corregía como acierto. §17 ya contaba este mismo fallo en el
 * `lector()`, arreglado allí sin barrer las otras tres copias; lo encontró la
 * auditoría del 26 de septiembre de 2026.
 *
 * Con el lector aquí, las copias dejan de existir: es la Regla 0 (§01).
 */
import { leeComplejo, type Complejo } from './complejo';
import { evaluaNumero } from './regiones';

/** Primero la forma binómica; si no la reconoce, se evalúa como expresión.
 *  En el examen de Cálculo no hay calculadora (§09), así que `pi/4` tiene que
 *  valer igual que su decimal. */
export const leeNumero = (texto: string): Complejo | null =>
  leeComplejo(texto) ?? evaluaNumero(texto);
