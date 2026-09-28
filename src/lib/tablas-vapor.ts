/**
 * Las tablas del agua y su vapor de Térmica: la rejilla del anexo del curso
 * («Tablas y diagramas de Ingeniería Térmica», p. 4-15) y cómo se redondea
 * cada columna. Fase F1 de la auditoría del 27 de septiembre de 2026.
 *
 * La rejilla es la del anexo, fila por fila, para que lo que se practica aquí
 * sea lo que se hace en el examen con el anexo delante: las mismas presiones,
 * las mismas temperaturas y los mismos huecos entre ellas, que son los que
 * obligan a interpolar. Los valores no se copian: se calculan con IAPWS-95
 * (`iapws95.ts`), que es la formulación de la que sale casi todo el anexo.
 * Su saturación y su sobrecalentado hasta 1000 °C los reproducen a la cifra
 * que imprime; la fila de 0,01 °C, las de 1100 a 1300 °C y el líquido
 * comprimido vienen en el anexo de otra fuente, y ahí se apartan un poco. Lo
 * cuenta, con las erratas del anexo, `anexo-vapor.ts`.
 *
 * No importa nada: la formulación entra como argumento de `generaTablas`.
 * Así `node` lee este fichero tal cual desde `scripts/tablas-vapor.mjs`, que
 * escribe el JSON, y la prueba de `tests/fisica/vapor.test.ts` lo vuelve a
 * generar para comprobar que el JSON publicado no se ha quedado atrás.
 */

/** Cómo se escribe una columna: con tantas cifras significativas, con
 *  tantos decimales, o tal cual la da la rejilla. */
export type Formato = { cifras: number } | { decimales: number } | { exacto: true };

export interface Columna {
  id: string;
  titulo: string;
  unidad: string;
  formato: Formato;
}

/** Una tabla de filas: la de saturación por temperatura o por presión. */
export interface TablaDeFilas {
  columnas: Columna[];
  filas: number[][];
}

/** Un bloque de una presión: el vapor sobrecalentado o el líquido
 *  comprimido a `p` bar, con su fila de saturación si la presión la tiene. */
export interface Bloque {
  p: number;
  /** Temperatura de saturación a esa presión, °C; nula por encima de la crítica. */
  Tsat: number | null;
  /** v, u, h, s de la saturación (vapor en el sobrecalentado, líquido en el
   *  comprimido), o nulo si la tabla no la trae. */
  saturado: number[] | null;
  /** [T, v, u, h, s], T en °C. */
  filas: number[][];
}

export interface TablaDeBloques {
  columnas: Columna[];
  bloques: Bloque[];
}

export interface TablasVapor {
  formulacion: string;
  saturacionT: TablaDeFilas;
  saturacionP: TablaDeFilas;
  sobrecalentado: TablaDeBloques;
  liquido: TablaDeBloques;
}

/** Lo que `generaTablas` necesita de la formulación. */
export interface Formulacion {
  saturacion(T: number): { T: number; p: number; liquido: Propiedades; vapor: Propiedades };
  saturacionDeP(p: number): { T: number; p: number; liquido: Propiedades; vapor: Propiedades };
  estadoDePT(p: number, T: number): Propiedades;
}
interface Propiedades {
  v: number;
  u: number;
  h: number;
  s: number;
}

/* ── la rejilla del anexo ─────────────────────────────────────────── */

const serie = (desde: number, hasta: number, paso: number): number[] => {
  const n = Math.round((hasta - desde) / paso);
  return Array.from({ length: n + 1 }, (_, i) => Number((desde + i * paso).toFixed(6)));
};

/** Saturación por temperatura, p. 4-5: 0,01 °C y de 1 a 100 °C. */
export const TEMPERATURAS_SATURACION = [0.01, ...serie(1, 100, 1)];

/** Saturación por presión, p. 6-7, en bar: 94 presiones. */
export const PRESIONES_SATURACION = [
  ...serie(0.01, 0.1, 0.005),
  ...serie(0.2, 1, 0.1),
  ...serie(1.5, 10, 0.5),
  ...serie(11, 30, 1),
  32, 34, 36, 38, 40,
  ...serie(45, 100, 5),
  ...serie(110, 210, 10),
];

/** Vapor sobrecalentado, p. 8-13: cada presión en bar, con las temperaturas
 *  propias de su bloque; todas comparten además las de 400 a 1300 °C. */
const COMUNES = serie(400, 1300, 100);
const SOBRECALENTADO: ReadonlyArray<readonly [number[], number[]]> = [
  [[0.1], [50, 100, 150, 200, 250, 300]],
  [[0.5, 1], [100, 150, 200, 250, 300]],
  [[2, 3, 4], [150, 200, 250, 300]],
  [[5, 6, 8, 10, 12, 14], [200, 250, 300, 350]],
  [[16, 18, 20], [225, 250, 300, 350]],
  [[25], [225, 250, 300, 350, 450]],
  [[30, 35], [250, 300, 350, 450]],
  [[40, 45, 50], [275, 300, 350, 450]],
  [[60, 70, 80], [300, 350, 450, 550]],
  [[90, 100], [325, 350, 450, 550, 650]],
  [[125, 150], [350, 450, 550, 650]],
  [[175, 200], [450, 550, 650]],
  [[250, 300, 350, 400, 500, 600], [375, 425, 450, 550, 650]],
];

/** Líquido comprimido, p. 14-15: presión en bar y temperatura más alta, de
 *  20 en 20 °C desde 0. */
const LIQUIDO: ReadonlyArray<readonly [number, number]> = [
  [50, 260], [100, 300], [150, 340], [200, 360], [300, 380], [500, 380],
];

/** Presión crítica del agua, bar: por encima no hay fila de saturación. */
const P_CRITICA_BAR = 220.64;

/* ── cómo se escribe cada columna ─────────────────────────────────── */

const SAT_T: Columna[] = [
  { id: 'T', titulo: 'T', unidad: '°C', formato: { exacto: true } },
  { id: 'p', titulo: 'p', unidad: 'bar', formato: { cifras: 5 } },
  { id: 'vl', titulo: 'v′', unidad: 'm³/kg', formato: { cifras: 5 } },
  { id: 'vv', titulo: 'v″', unidad: 'm³/kg', formato: { cifras: 5 } },
  { id: 'hl', titulo: 'h′', unidad: 'kJ/kg', formato: { cifras: 5 } },
  { id: 'hv', titulo: 'h″', unidad: 'kJ/kg', formato: { cifras: 5 } },
  { id: 'sl', titulo: 's′', unidad: 'kJ/(kg·K)', formato: { cifras: 5 } },
  { id: 'sv', titulo: 's″', unidad: 'kJ/(kg·K)', formato: { cifras: 5 } },
];
const SAT_P: Columna[] = [
  { id: 'p', titulo: 'p', unidad: 'bar', formato: { exacto: true } },
  { id: 'T', titulo: 'T', unidad: '°C', formato: { cifras: 5 } },
  ...SAT_T.slice(2),
];
/* La entropía del sobrecalentado, con cinco cifras significativas y no con
   cuatro decimales. El anexo la escribe con cuatro decimales, pero su fuente
   solo tiene cinco cifras: donde s pasa de 10 imprime un cero de relleno,
   «10,4060» por 10,406, y con cuatro decimales de verdad estas tablas decían
   10,4055 y parecían contradecirlo en 50 celdas. Con cinco cifras coinciden
   con él en las 1.748 hasta 1000 °C (fase F1, contraste celda a celda). */
const SOBRE: Columna[] = [
  { id: 'T', titulo: 'T', unidad: '°C', formato: { exacto: true } },
  { id: 'v', titulo: 'v', unidad: 'm³/kg', formato: { cifras: 5 } },
  { id: 'u', titulo: 'u', unidad: 'kJ/kg', formato: { decimales: 1 } },
  { id: 'h', titulo: 'h', unidad: 'kJ/kg', formato: { decimales: 1 } },
  { id: 's', titulo: 's', unidad: 'kJ/(kg·K)', formato: { cifras: 5 } },
];
/* En el líquido la entropía baja hasta 0,0001, y ahí cinco cifras serían
   «0,00010000»: se queda con los cuatro decimales del anexo. */
const COMPRIMIDO: Columna[] = [
  SOBRE[0],
  SOBRE[1],
  { id: 'u', titulo: 'u', unidad: 'kJ/kg', formato: { decimales: 2 } },
  { id: 'h', titulo: 'h', unidad: 'kJ/kg', formato: { decimales: 2 } },
  { id: 's', titulo: 's', unidad: 'kJ/(kg·K)', formato: { decimales: 4 } },
];

/** Un número redondeado como lo escribe su columna. Lo que es cero por
 *  definición se queda en cero: la entropía del líquido en el punto triple
 *  sale del cálculo con un 10⁻¹⁴ de ruido, y con cinco cifras significativas
 *  se escribiría «1,7216·10⁻¹⁴». */
export function redondea(x: number, formato: Formato): number {
  if (Math.abs(x) < 1e-10) return 0;
  if ('cifras' in formato) return Number(x.toPrecision(formato.cifras));
  if ('decimales' in formato) return Number(x.toFixed(formato.decimales));
  return x;
}

/** Un número como se escribe en la tabla publicada: con coma decimal y con
 *  las cifras o los decimales de su columna, ceros finales incluidos
 *  («3,2400», no «3,24»), que es como el anexo dice cuánto se sabe. */
export function escribe(x: number, formato: Formato): string {
  let texto: string;
  if (x === 0) texto = '0';
  else if ('cifras' in formato) texto = x.toPrecision(formato.cifras);
  else if ('decimales' in formato) texto = x.toFixed(formato.decimales);
  else texto = String(x);
  return texto.replace('.', ',');
}

const fila = (valores: number[], columnas: Columna[]): number[] =>
  valores.map((x, i) => redondea(x, columnas[i].formato));

const K = 273.15;

/** Las cuatro tablas, calculadas con la formulación `f` y redondeadas como
 *  las escribe el anexo. */
export function generaTablas(f: Formulacion, nombre: string): TablasVapor {
  const saturacionT: TablaDeFilas = {
    columnas: SAT_T,
    filas: TEMPERATURAS_SATURACION.map((t) => {
      const s = f.saturacion(t + K);
      return fila([t, s.p * 10, s.liquido.v, s.vapor.v, s.liquido.h, s.vapor.h, s.liquido.s, s.vapor.s], SAT_T);
    }),
  };

  const saturacionP: TablaDeFilas = {
    columnas: SAT_P,
    filas: PRESIONES_SATURACION.map((p) => {
      const s = f.saturacionDeP(p / 10);
      return fila([p, s.T - K, s.liquido.v, s.vapor.v, s.liquido.h, s.vapor.h, s.liquido.s, s.vapor.s], SAT_P);
    }),
  };

  const bloque = (p: number, temperaturas: number[], columnas: Columna[], lado: 'liquido' | 'vapor'): Bloque => {
    const s = p < P_CRITICA_BAR ? f.saturacionDeP(p / 10) : null;
    const sat = s ? s[lado] : null;
    return {
      p,
      // con cinco cifras, como la tabla de saturación y las cabeceras del
      // anexo: 81,317 °C a 0,5 bar, no 81,32
      Tsat: s ? redondea(s.T - K, { cifras: 5 }) : null,
      saturado: sat ? fila([sat.v, sat.u, sat.h, sat.s], columnas.slice(1)) : null,
      filas: temperaturas.map((t) => {
        const e = f.estadoDePT(p / 10, t + K);
        return fila([t, e.v, e.u, e.h, e.s], columnas);
      }),
    };
  };

  const sobrecalentado: TablaDeBloques = {
    columnas: SOBRE,
    bloques: SOBRECALENTADO.flatMap(([presiones, propias]) =>
      presiones.map((p) => bloque(p, [...propias, ...COMUNES].sort((a, b) => a - b), SOBRE, 'vapor')),
    ),
  };

  const liquido: TablaDeBloques = {
    columnas: COMPRIMIDO,
    bloques: LIQUIDO.map(([p, hasta]) => bloque(p, serie(0, hasta, 20), COMPRIMIDO, 'liquido')),
  };

  return { formulacion: nombre, saturacionT, saturacionP, sobrecalentado, liquido };
}
