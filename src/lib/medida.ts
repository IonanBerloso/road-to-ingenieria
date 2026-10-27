/**
 * La primera línea de la tarjeta «Esta evaluación» de una ruta: sobre cuántas
 * convocatorias se midió, y cuántos ejercicios hay transcritos.
 *
 * Son dos cuentas distintas, y la tarjeta las ponía en la misma línea:
 *
 * - `medidoSobre` es lo que el autor de la ruta LEYÓ para medir las
 *   frecuencias. Puede no coincidir con lo transcrito: Álgebra leyó ocho PDF y
 *   transcribió cuatro; Elasticidad mide los seis parciales desde 2016-2017 y
 *   tiene once transcritos; Fluidos mide también las extraordinarias.
 * - Los ejercicios y los puntos se cuentan sobre las convocatorias de esta
 *   evaluación que hay transcritas, todas.
 *
 * Así que la ruta del primer parcial de Elasticidad publicaba «Medido sobre 6
 * convocatorias · 76 ejercicios transcritos», y los seis parciales medidos
 * tienen 44. Lo vio la lluvia de ideas del 26 de octubre de 2026, al dibujar
 * la tarjeta con sus datos; de las veinte rutas, en diez las dos cuentas no
 * salían del mismo sitio. Cuando coinciden se dicen juntas, como antes;
 * cuando no, cada número lleva su denominador.
 */
export type Medida = {
  medidoSobre: number;
  /** «convocatorias», u «hojas de examen de la colección». */
  medidas: string;
  sonHojas: boolean;
  /** Cuántas convocatorias transcritas se han contado. */
  transcritas: number;
  ejercicios: number;
  /** Los puntos, si los exámenes publican el reparto. */
  puntos?: number;
};

export function datoDeLaMedida(m: Medida): string {
  const sinFecha = m.sonHojas ? ', sin fecha' : '';
  if (m.transcritas === m.medidoSobre) {
    const cola = m.puntos === undefined ? ' transcritos' : ` · ${m.puntos} puntos`;
    return `Medido sobre ${m.medidoSobre} ${m.medidas}${sinFecha} · ${m.ejercicios} ejercicios${cola}.`;
  }
  const hay = m.transcritas === 1 ? 'De esta evaluación hay 1 transcrita' : `De esta evaluación hay ${m.transcritas} transcritas`;
  const cola = m.puntos === undefined ? '' : ` y ${m.puntos} puntos`;
  return `Medido sobre ${m.medidoSobre} ${m.medidas}${sinFecha}. ${hay}, con ${m.ejercicios} ejercicios${cola}.`;
}
