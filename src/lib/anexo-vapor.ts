/**
 * Lo que el anexo de tablas del curso («Tablas y diagramas de Ingeniería
 * Térmica», p. 4-15) imprime mal. Lo publica la página de tablas de Térmica,
 * en «En qué se aparta del anexo», porque el examen se hace con el anexo
 * delante y no con estas tablas.
 *
 * Sale de comparar las 3.989 celdas del anexo y sus 34 cabeceras, una a una,
 * con IAPWS-95 (`iapws95.ts`) y, donde el anexo no sale de IAPWS-95, con sus
 * propias cuentas: h = u + p·v en cada fila, y ds = dh/T entre filas vecinas
 * de una misma isobara. Fase F1 de la auditoría del 27 de septiembre de 2026.
 * La transcripción del anexo no está en el repositorio (§08): está fuera, con
 * el contraste y el guion que lo repite, en `2027 proyecto contenido/Claude
 * outputs/tablas-vapor-anexo/`. Aquí queda lo que salió de ella.
 *
 * Lo que se encontró, por partes:
 *
 * · La saturación y el sobrecalentado hasta 1000 °C son IAPWS-95 con cinco
 *   cifras significativas: coinciden con estas tablas en sus 3.106 celdas,
 *   salvo las cuatro cabeceras de `CABECERAS`. Donde la entropía pasa de 10
 *   el anexo escribe un cuarto decimal de relleno (10,4060 por 10,406).
 * · Tres partes vienen de otra fuente: la fila de 0,01 °C, las filas de 1100
 *   a 1300 °C del sobrecalentado y el líquido comprimido. Ahí las cifras se
 *   apartan de IAPWS-95 de forma suave y coherente —no son erratas—, y en
 *   esas mismas partes están las erratas de imprenta de `ERRATAS`.
 *
 * El «debería decir» es lo que el anexo quiso imprimir: la lectura de la
 * errata cuando la hay (una coma perdida, dos cifras traspuestas) y, cuando
 * no, el valor que devuelve su propia cuenta. No es el valor de estas
 * tablas: en las partes de otra fuente las dos cosas difieren un poco, y lo
 * comprueba `tests/fisica/vapor.test.ts`.
 *
 * No importa nada, como `tablas-vapor.ts`.
 */

/** Una temperatura de saturación mal puesta en la cabecera de una isobara del
 *  sobrecalentado. La fila «Sat.» de debajo sí es la de esa presión. */
export interface Cabecera {
  /** bar */
  p: number;
  /** °C, como lo imprime el anexo. */
  impreso: number;
  /** °C, como debería decir. */
  bueno: number;
  como: string;
}

export const CABECERAS: Cabecera[] = [
  { p: 8, impreso: 143.61, bueno: 170.41, como: 'es la de 4 bar, copiada de la isobara de arriba' },
  { p: 12, impreso: 187.92, bueno: 187.96, como: 'una cifra cambiada' },
  { p: 35, impreso: 242.86, bueno: 242.56, como: 'una cifra cambiada' },
  { p: 150, impreso: 342.52, bueno: 342.16, como: 'no es la de 150 bar, que el propio anexo da en su p. 7' },
];

/** Una celda del anexo con una errata de imprenta. `impreso` y `bueno` van
 *  como texto, con coma decimal, porque son lo que se lee en el papel. */
export interface Errata {
  tabla: 'sobrecalentado' | 'liquido';
  /** bar */
  p: number;
  /** °C, o la fila «Sat.» del bloque. */
  T: number | 'Sat';
  columna: 'v' | 'u' | 'h' | 's';
  impreso: string;
  bueno: string;
  como: string;
}

const HUV = 'no cumple h = u + p·v con el resto de su fila';

export const ERRATAS: Errata[] = [
  { tabla: 'sobrecalentado', p: 8, T: 1100, columna: 'h', impreso: '489,1', bueno: '4889,1', como: 'falta una cifra' },
  { tabla: 'sobrecalentado', p: 12, T: 1100, columna: 'u', impreso: '4050,0', bueno: '4254,6', como: HUV },
  { tabla: 'sobrecalentado', p: 12, T: 1200, columna: 'u', impreso: '5254,6', bueno: '4465,1', como: HUV },
  { tabla: 'sobrecalentado', p: 14, T: 1100, columna: 's', impreso: '8,9157', bueno: '8,9457', como: 'una cifra cambiada' },
  { tabla: 'sobrecalentado', p: 20, T: 1200, columna: 'u', impreso: '4459,3', bueno: '4463,3', como: HUV },
  { tabla: 'sobrecalentado', p: 40, T: 1100, columna: 's', impreso: '8,5467', bueno: '8,4567', como: 'dos cifras traspuestas' },
  { tabla: 'sobrecalentado', p: 45, T: 1100, columna: 'u', impreso: '4264,8', bueno: '4246,8', como: 'dos cifras traspuestas' },
  { tabla: 'sobrecalentado', p: 80, T: 1300, columna: 'v', impreso: '0,908000', bueno: '0,090800', como: 'el cero corrido: diez veces mayor' },
  { tabla: 'sobrecalentado', p: 80, T: 1300, columna: 's', impreso: '8,4812', bueno: '8,4842', como: 'una cifra cambiada' },
  { tabla: 'sobrecalentado', p: 100, T: 1300, columna: 'u', impreso: '4460,5', bueno: '4660,5', como: 'una cifra cambiada' },
  { tabla: 'sobrecalentado', p: 150, T: 1100, columna: 'h', impreso: '4952,6', bueno: '4852,6', como: 'una cifra cambiada' },
  { tabla: 'sobrecalentado', p: 175, T: 1300, columna: 'v', impreso: '0,415400', bueno: '0,041540', como: 'el cero corrido: diez veces mayor' },
  { tabla: 'sobrecalentado', p: 200, T: 1300, columna: 'h', impreso: '5360,1', bueno: '5365,1', como: 'una cifra cambiada' },
  { tabla: 'sobrecalentado', p: 250, T: 1200, columna: 'v', impreso: '0,025120', bueno: '0,027116', como: 'copiado de la fila de 1100 °C' },
  { tabla: 'liquido', p: 50, T: 180, columna: 's', impreso: '2,4341', bueno: '2,1341', como: 'una cifra cambiada' },
  { tabla: 'liquido', p: 100, T: 80, columna: 'u', impreso: '332,29', bueno: '332,59', como: 'una cifra cambiada' },
  { tabla: 'liquido', p: 100, T: 280, columna: 'h', impreso: '1234,7', bueno: '1234,1', como: HUV },
  { tabla: 'liquido', p: 150, T: 200, columna: 's', impreso: '2,104', bueno: '2,3104', como: 'falta una cifra' },
  { tabla: 'liquido', p: 150, T: 340, columna: 'h', impreso: '159,9', bueno: '1591,9', como: 'falta una cifra' },
  { tabla: 'liquido', p: 200, T: 'Sat', columna: 'h', impreso: '18265', bueno: '1826,5', como: 'se perdió la coma' },
  { tabla: 'liquido', p: 200, T: 160, columna: 'h', impreso: '687312', bueno: '687,12', como: 'la coma, cambiada por un 3' },
  { tabla: 'liquido', p: 500, T: 60, columna: 'v', impreso: '0,009962', bueno: '0,0009962', como: 'falta un cero: diez veces mayor' },
  { tabla: 'liquido', p: 500, T: 300, columna: 'u', impreso: '1256,7', bueno: '1258,7', como: 'una cifra cambiada' },
];

/** Las que no se pueden distinguir de un redondeo de la tabla de origen: una
 *  o dos unidades en la última cifra, y una entropía de −0,0013 impresa sin el
 *  signo. Se cuentan y no se listan. */
export const ERRATAS_PROBABLES = 6;


/** Un texto del anexo, con coma decimal, como número. */
export const numero = (texto: string): number => Number(texto.replace(',', '.'));
