/**
 * Las piezas de NyV 2.18 contra su clave (diseño de la fase M, §3.8): la
 * validación al revés del motor con el material. Si el motor saca las vistas
 * de estas cuatro piezas como las dibuja la solución oficial, vale para las
 * piezas que no traen clave.
 *
 * QUÉ SE COMPARA. Por vista: cada arista vista y oculta, como la dibuja la
 * clave —entera, sin partir en los cruces—, emparejada una a una con las del
 * motor juntadas igual (`lineas.ts`); y las circunferencias, que son los
 * agujeros vistos de frente. Con su posición a 1 mm (la recta de un segmento,
 * la curva de un arco, el centro y el radio de una circunferencia) y sus
 * puntas a 1,5 mm: en un escaneo una punta se lee peor que una posición. Los
 * ejes no se comparan: la clave no pone eje a los redondeos y el motor sí.
 *
 * DE DÓNDE SALE LA CLAVE. De la página escaneada (NyV p. 21 y 22, a los
 * 400 ppp del escaneo), medida con los guiones del paquete de la unidad m1b
 * (fuera del repositorio: `coteja.py`, `transcribe.py`, `resuelve.py`):
 * - cada línea del motor se busca en el escaneo: tiene que tener tinta a
 *   menos de 1 mm en todo su largo, y su trazo dice si en la clave es vista
 *   (seguido) u oculta (a trazos);
 * - y al revés: la tinta de la vista que no está a menos de 1 mm de ninguna
 *   línea ni eje del motor. Solo quedaron rótulos y flechas («En esta
 *   vista»): la clave no tiene ninguna línea que el motor no saque, salvo las
 *   de las enmiendas;
 * - la recta de cada segmento, el centro y el radio de cada arco, y las
 *   puntas que se leen (esquinas, cruces, finales), son las medidas;
 * - donde una vista sigue oculta en la misma recta, el punto de cambio se lee
 *   en la fila del escaneo, donde acaba el trazo seguido; donde una línea
 *   acaba en otra, en el cruce con la otra medida; donde entra tangente en un
 *   arco, en el punto de tangencia que da la geometría medida;
 * - lo que el escaneo no deja leer no se escribe con números del motor: una
 *   punta que no se ve (una recta que entra tangente en un arco grande, dos
 *   arcos tangentes) va marcada `sinPunta` y no se compara, y un arco corto
 *   cuyo centro no se puede ajustar (la transición de la pieza 1) se escribe
 *   por los puntos de su contorno.
 * Así ningún número de la clave sale del motor, salvo las líneas que el motor
 * pone en cada enmienda, que son eso: lo que dibuja el motor y no la clave.
 * Revisión del 9 de octubre de 2026: en la primera entrega, nueve puntas y el
 * arco de la transición estaban tomados del motor o de la pieza, y el test
 * solo vigilaba que no cambiasen.
 * Las coordenadas son las del papel de cada vista (`proyeccion.ts`), en mm,
 * con 1 mm de la pieza = 1 mm de la página impresa (`cotas: proporcionales`).
 *
 * LAS ENMIENDAS. Donde la clave y el motor no dibujan lo mismo, la diferencia
 * se escribe con su porqué, y el test comprueba dos cosas: que con ella todo
 * casa, y que sin ella falla justo en esas líneas (si un día el motor o la
 * pieza cambian y la enmienda sobra, esto lo dice).
 */
import { readFileSync } from 'node:fs';
import yaml from 'js-yaml';
import { describe, expect, it } from 'vitest';
import { mediaVuelta } from '../../src/lib/vistas/gira.ts';
import { calculaVistas } from '../../src/lib/vistas/motor.ts';
import { compilaPieza, type PiezaDeclarada } from '../../src/lib/vistas/pieza.ts';
import { casan, comparaLineas, describe as cuenta, lineasDeVista, type Linea, type LineaDeClave, type Tolerancias } from './lineas';

const TOL: Tolerancias = { posicion: 1, punta: 1.5 };

/** Las puntas de una línea que el escaneo no deja leer: se escribe lo
 *  leído, pero no se compara (`LineaDeClave`, en `lineas.ts`). */
type Sin = { readonly sinPunta: readonly (1 | 2)[] };

/** Una línea de la clave: un segmento [tipo, x1, y1, x2, y2], una
 *  circunferencia [tipo, 'c', cx, cy, r], un arco [tipo, 'a', cx, cy, r,
 *  desde, hasta] (grados, con la v hacia abajo) o una curva leída por puntos
 *  del contorno [tipo, 'p', [[u, v], …]]. 'v' vista, 'o' oculta. */
type L =
  | readonly ['v' | 'o', number, number, number, number, Sin?]
  | readonly ['v' | 'o', 'c', number, number, number]
  | readonly ['v' | 'o', 'a', number, number, number, number, number, Sin?]
  | readonly ['v' | 'o', 'p', readonly (readonly [number, number])[]];

interface Enmienda {
  /** Lo que dibuja la clave y el motor no. */
  readonly clave: readonly L[];
  /** Lo que dibuja el motor en su lugar. */
  readonly motor: readonly L[];
  readonly porque: string;
}

interface Clave {
  readonly pieza: string;
  /** `derecho` es el perfil derecho: el izquierdo con media vuelta. */
  readonly vista: 'alzado' | 'planta' | 'perfil' | 'derecho';
  /** Dónde está en la página el origen de la vista, en pt, para cotejarla. */
  readonly pagina: string;
  readonly lineas: readonly L[];
  readonly enmiendas?: readonly Enmienda[];
}

const linea = (l: L): LineaDeClave => {
  const tipo = l[0] === 'v' ? 'visto' : 'oculto';
  if (l[1] === 'p') return { tipo, forma: { tipo: 'polilinea', puntos: l[2].map((q) => [q[0], q[1]]) } };
  if (l[1] === 'c') return { tipo, forma: { tipo: 'arco', c: [l[2], l[3]], r: l[4], desde: 0, hasta: 360 } };
  if (l[1] === 'a') {
    const [, , cx, cy, r, desde, hasta, sin] = l as readonly ['v' | 'o', 'a', number, number, number, number, number, Sin?];
    return { tipo, forma: { tipo: 'arco', c: [cx, cy], r, desde, hasta }, sinPunta: sin?.sinPunta };
  }
  const [, x1, y1, x2, y2, sin] = l as readonly ['v' | 'o', number, number, number, number, Sin?];
  return { tipo, forma: { tipo: 'segmento', a: [x1, y1], b: [x2, y2] }, sinPunta: sin?.sinPunta };
};

/* ── Las claves, vista a vista ─────────────────────────────────────────── */

const CLAVES: readonly Clave[] = [
  {
    pieza: 'nyv-2-18-1',
    vista: 'alzado',
    pagina: 'p. 21, origen en (228,78, 332,42) pt',
    lineas: [
      ['v', 0, -19.35, 0, -60.16], // punta 1, en la tangencia con el acuerdo (abajo); punta 2, con la cabeza
      /* Punta 1: el canto entra tangente en el arco de la transición, de
         radio grande, y en el escaneo no se ve dónde. No se compara. */
      ['v', 20, -17.33, 20, -60.16, { sinPunta: [1] }],
      ['v', -0.1, -45, 20.29, -45],
      ['v', 'a', 10.28, -60.16, 9.96, 180, 360], // la cabeza, entre sus tangencias con los cantos
      /* La transición del canto derecho al ojo: un arco corto entre dos
         tangencias, que en el escaneo da radios de 16 a 23 mm según el tramo
         que se ajuste. No se escribe como arco (sería escribir el de la
         pieza): se escriben 19 puntos de su contorno, leídos fila a fila
         cada 0,64 mm, y el motor tiene que pasar por todos. */
      [
        'v',
        'p',
        [
          [19.72, -15.67], [19.59, -15.04], [19.53, -14.4], [19.4, -13.77], [19.4, -13.13], [19.08, -12.5], [18.92, -11.86],
          [18.7, -11.23], [18.51, -10.59], [18.22, -9.96], [17.94, -9.32], [17.65, -8.69], [17.3, -8.05], [16.95, -7.42],
          [16.57, -6.78], [16.13, -6.15], [15.75, -5.51], [15.37, -4.88], [14.89, -4.24],
        ],
      ],
      /* El ojo, del acuerdo (hasta) a la transición (desde). Donde la
         transición lo toca tangente no se lee: el contorno lo deja entre los
         37° y los 41°. No se compara. */
      ['v', 'a', 6.35, -10.56, 10.55, 40, 228.8, { sinPunta: [1] }],
      ['v', 'a', -1.36, -19.35, 1.36, 0, 47.9], // el acuerdo, medido sobre el contorno: del canto al ojo
      ['v', 'c', 10.27, -60.23, 4.36],
      ['v', 'c', 6.46, -10.57, 5.27],
      ['o', -0.16, -34.5, 20.22, -34.5],
    ],
  },
  {
    pieza: 'nyv-2-18-1',
    vista: 'perfil',
    pagina: 'p. 21, origen en (462,33, 333,16) pt',
    lineas: [
      ['v', -10.3, -34.5, -31.07, -34.5], // punta 2, en la tangencia con el redondeo del codo
      ['v', -27.8, -47.83, -27.8, -70.51], // punta 1, en la tangencia con el acuerdo del codo
      ['v', -38.4, -42.07, -38.4, -70.56], // punta 1, en la tangencia con el redondeo
      ['v', 0, 0.17, 0, -45.3],
      ['v', 0.39, -45, -25.2, -45], // punta 2, en la tangencia con el acuerdo
      ['v', -10.6, 0.21, -10.6, -34.78],
      ['v', -27.51, -70.1, -38.56, -70.1],
      ['v', 0.03, 0, -11.08, 0],
      ['v', 'a', -25.2, -47.83, 2.8, 90, 180], // el acuerdo del codo, ajustado a los puntos de su curva
      ['v', 'a', -31.07, -42.07, 7.43, 90, 180], // el redondeo del codo
      ['o', -27.64, -55.95, -38.69, -55.95],
      ['o', -27.51, -64.63, -38.62, -64.63],
      ['o', 0.03, -5.24, -11.01, -5.24],
      ['o', 0.16, -15.84, -10.95, -15.84],
    ],
  },
  {
    pieza: 'nyv-2-18-2',
    vista: 'alzado',
    pagina: 'p. 21, origen en (272,5, 567,38) pt',
    lineas: [
      ['v', -0.33, 0, 26.66, 0],
      ['v', -0.26, -7.1, 26.73, -7.1],
      ['v', -34.5, -21.07, 10.11, -40.07], // las dos puntas, en las tangencias con los casquillos
      ['v', 21.64, -33.74, 26.4, -7.1], // punta 1, en la tangencia con el casquillo alto; punta 2, en la esquina de la pletina
      ['v', 0, 0.19, 0, -10.74],
      ['v', 0.25, -10.55, -23.12, -10.55],
      ['v', 26.4, 0.32, 26.4, -7.1], // punta 2, en la misma esquina
      ['v', 'c', 13.43, -32.27, 8.48],
      ['v', 'c', -31.07, -13.02, 8.52],
      ['v', 'c', 13.45, -32.26, 4.43],
      ['v', 'c', -31.06, -12.98, 4.46],
      ['o', 20.2, 0.32, 20.2, -7.3],
      ['o', 6.14, 0.26, 6.14, -7.36],
    ],
  },
  {
    pieza: 'nyv-2-18-2',
    vista: 'planta',
    pagina: 'p. 21, origen en (271,08, 778,5) pt',
    lineas: [
      ['v', 0, -13.26, 0, -48.59], // las puntas, en las tangencias con los extremos de la pletina
      ['v', 26.4, -13.26, 26.4, -48.59],
      /* Las aristas de arriba del alma: vistas hasta que se meten bajo el
         casquillo alto (donde el trazo seguido acaba, leído fila a fila: 10
         y 10,2), y otra vez desde el canto del casquillo (u = 21,8, su línea
         medida) hasta la pletina. */
      ['v', -34.84, -27.4, 10, -27.4],
      ['v', 21.8, -27.4, 26.64, -27.4],
      ['v', -34.77, -34.4, 10.2, -34.4],
      ['v', 21.8, -34.4, 26.7, -34.4],
      ['v', 21.77, -16.8, 4.37, -16.8],
      ['v', 21.96, -45, 4.63, -45],
      ['v', -22.5, -20.35, -40.09, -20.35],
      ['v', -22.31, -41.45, -39.9, -41.45],
      ['v', 4.6, -16.58, 4.6, -27.69],
      ['v', 4.6, -34.18, 4.6, -45.29],
      ['v', 21.8, -16.58, 21.8, -27.56],
      ['v', 21.8, -34.11, 21.8, -45.16],
      ['v', -39.8, -20.36, -39.8, -42.01],
      ['v', -22.6, -20.26, -22.6, -41.99],
      ['v', 'a', 13.01, -13.26, 13.2, 360, 540],
      ['v', 'a', 13.39, -48.59, 13.21, 180, 360],
      /* Los taladros de la pletina asoman por fuera del casquillo alto: sus
         puntas, donde la circunferencia medida cruza el canto medido del
         casquillo (v = −16,8 y v = −45). */
      ['v', 'a', 13, -13.29, 7.02, 330, 570],
      ['v', 'a', 13.32, -48.53, 7.04, 149.9, 390.1],
      ['o', 10, -27.4, 21.8, -27.4], // bajo el casquillo: del final del trazo seguido a su canto
      ['o', 10.2, -34.4, 21.8, -34.4],
      ['o', 8.75, -16.49, 8.75, -45.25],
      ['o', 17.65, -16.49, 17.65, -45.19],
      ['o', -35.65, -20.36, -35.65, -42.01],
      ['o', -26.75, -20.3, -26.75, -41.95],
      ['o', 'a', 13, -13.29, 7.02, 210, 330], // la circunferencia de la vista; a trazos se ajusta peor
      ['o', 'a', 13.32, -48.53, 7.04, 30.1, 149.9],
    ],
    enmiendas: [
      {
        clave: [
          ['v', 0, -13.26, 0, -48.59],
          ['v', -22.6, -20.26, -22.6, -41.99],
        ],
        motor: [
          ['v', 0, -13.2, 0, -27.45],
          ['o', 0, -27.45, 0, -34.35],
          ['v', 0, -34.35, 0, -48.6],
          ['v', -22.6, -20.35, -22.6, -27.4],
          ['v', -22.6, -34.4, -22.6, -41.45],
          ['o', -23.02, -27.4, -23.02, -34.4],
        ],
        porque:
          'La clave dibuja seguidos, por debajo del alma, el canto izquierdo de la pletina y el del casquillo bajo. El alma los tapa desde arriba —en el alzado baja hasta z = 10,55 por encima de los dos—: el canto de la pletina va oculto esos 6,9 mm, y bajo el alma el canto del casquillo no es arista, porque queda dentro del alma; la que hay es la del alma con el casquillo, 0,4 mm a la izquierda y oculta.',
      },
    ],
  },
  {
    pieza: 'nyv-2-18-3',
    vista: 'alzado',
    pagina: 'p. 22, origen en (165,6, 276,75) pt',
    lineas: [
      ['v', -0.2, -0.06, 49.33, -0.06],
      ['v', -0.06, 0.32, -0.06, -8.76],
      ['v', 49, 0.06, 49, -9.21],
      ['v', -0.2, -8, 49.33, -8],
      ['v', 49.47, -6.95, 33.28, -42.87], // punta 2, en la tangencia con el buje
      ['v', 15.79, -43.03, -0.32, -7.29], // punta 1, en la tangencia con el buje
      ['v', 21.25, -7.75, 21.25, -30.42],
      ['v', 27.81, -7.82, 27.81, -30.36],
      ['v', 'c', 24.71, -39.01, 9.56],
      ['v', 'c', 24.73, -39.03, 5.43],
      ['o', 12.26, 0.25, 12.26, -8.25],
      ['o', 4.06, 0.32, 4.06, -8.25],
      ['o', 45, 0.13, 45, -8.45],
      ['o', 36.86, 0.13, 36.86, -8.38],
    ],
    enmiendas: [
      {
        clave: [['v', 'c', 24.71, -39.01, 9.56]],
        motor: [
          ['v', 'a', 24.5, -39, 9.6, 110, 430],
          ['v', 21.25, -29.4, 27.75, -29.4],
        ],
        porque:
          'La clave dibuja entera la circunferencia del buje. Abajo, entre las caras del nervio, el frente del nervio está en el plano del frente del buje y asoma por debajo de la circunferencia hasta donde acaba su rampa, en lo más bajo del buje (z = 29,4): el motor dibuja ahí la arista de la rampa con ese frente, una recta tangente a la circunferencia que se aparta de ella 0,57 mm como mucho.',
      },
    ],
  },
  {
    pieza: 'nyv-2-18-3',
    vista: 'perfil',
    pagina: 'p. 22, origen en (457, 276,17) pt',
    lineas: [
      ['v', 0.26, -0.06, -32.95, -0.06],
      ['v', -32.5, 0.27, -32.5, -48.75],
      ['v', 0.26, -7.94, -32.95, -7.94],
      ['v', -26, -7.75, -26, -43.12],
      ['v', -19.5, -28.9, -19.5, -48.78],
      ['v', 0.33, -7.64, -20.37, -30.36],
      ['v', -19.38, -29.97, -26.37, -29.97],
      ['v', -0.06, 0.19, -0.06, -8.57],
      ['v', -19.33, -48.6, -32.86, -48.6],
      ['o', -4, 0.19, -4, -8.32],
      ['o', -12.2, 0.25, -12.2, -8.32],
      ['o', -19.33, -33.5, -32.92, -33.5],
      ['o', -19.33, -44.44, -32.86, -44.44],
    ],
  },
  {
    pieza: 'nyv-2-18-3',
    vista: 'planta',
    pagina: 'p. 22, origen en (165,6, 412,2) pt',
    lineas: [
      ['v', -0.06, -7.69, -0.06, -32.56], // punta 1, en la tangencia con el redondeo
      ['v', 48.94, -7.82, 48.94, -32.75], // punta 1, en la tangencia con el redondeo
      ['v', -0.2, -32.5, 49.33, -32.5],
      ['v', 7.7, -0.06, 41.3, -0.06], // las dos puntas, en las tangencias con los redondeos
      /* La arista del frente de la torre, vista hasta que pasa bajo el buje:
         el trazo seguido acaba en u = 15,65 y vuelve en 33,6 (leído en la
         fila del escaneo); entre medias, oculta hasta el nervio. */
      ['v', -0.17, -26, 15.65, -26],
      ['v', 33.6, -26, 49.36, -26],
      ['v', 14.78, -19.56, 34.47, -19.56],
      ['v', 21.25, -19.56, 21.25, 0.24], // punta 1: en el frente del buje (su línea medida, v = −19,56)
      ['v', 27.75, -19.56, 27.75, 0.24],
      ['v', 14.9, -19.26, 14.9, -26.18],
      ['v', 34.1, -19.32, 34.1, -26.24],
      ['v', 'a', 7.7, -7.69, 7.63, 90, 180],
      ['v', 'a', 41.3, -7.82, 7.61, 360, 450],
      ['v', 'c', 8.16, -8.09, 4.08],
      ['v', 'c', 40.91, -8.2, 4.07],
      ['o', 15.65, -26, 21.25, -26], // del final del trazo seguido a la línea del nervio
      ['o', 27.75, -26, 33.6, -26],
      ['o', 21.38, -26.01, 21.38, -19.56], // del frente de la torre al del buje
      ['o', 27.88, -26.01, 27.88, -19.56],
      ['o', 19.19, -19.27, 19.19, -32.67],
      ['o', 30.13, -19.27, 30.13, -32.73],
    ],
  },
  {
    pieza: 'nyv-2-18-4',
    vista: 'alzado',
    pagina: 'p. 22, origen en (281,84, 629,57) pt',
    lineas: [
      ['v', -0.31, 0, 61.35, 0],
      ['v', 61.36, -9.09, 44.47, -9.09],
      ['v', 45.27, -8.81, 31.76, -19.57],
      ['v', 31.85, -19.59, 31.85, -15.65],
      ['v', 32.16, -15.96, 24.73, -15.96],
      ['v', 24.91, -15.69, 24.91, -25.4],
      ['v', 25.33, -24.71, 16.14, -32.03],
      ['v', 16.97, -31.76, -0.17, -31.76],
      ['v', 0.06, -48.54, 0.06, 0.29],
      ['v', 7.94, -31.5, 7.94, -48.58],
      ['v', 61.04, 0.19, 61.04, -9.46],
      ['v', -0.13, -48.32, 8.25, -48.32],
      ['o', 56.15, 0.25, 56.15, -9.4],
      ['o', 50.03, 0.19, 50.03, -9.4],
      ['o', -0.19, -41.55, 8.25, -41.55],
      ['o', -0.19, -45.85, 8.32, -45.85],
    ],
  },
  {
    pieza: 'nyv-2-18-4',
    vista: 'planta',
    pagina: 'p. 22, origen en (281,30, 783,33) pt',
    lineas: [
      ['v', -0.25, 0, 53.32, 0], // punta 2, en la tangencia con el redondeo
      ['v', -0.12, -40.2, 53.61, -40.2], // ídem
      ['v', 0, 0.16, 0, -40.29],
      ['v', 44.85, 0.09, 44.85, -40.29],
      ['v', 31.85, 0.16, 31.85, -40.29],
      ['v', 24.91, 0.16, 24.91, -40.29],
      ['v', 16.55, 0.09, 16.55, -40.29],
      ['v', 61.1, -8.02, 61.1, -32.5], // las dos puntas, en las tangencias con los redondeos
      ['v', -0.25, -5.45, 8.13, -5.45],
      ['v', 8, -5.31, 8, -14.9],
      ['v', 8, -25.24, 8, -34.89],
      ['v', -0.25, -14.75, 8.19, -14.75],
      ['v', -0.25, -25.51, 8.19, -25.51],
      ['v', -0.19, -34.75, 8.19, -34.75],
      ['v', 50.03, -8.19, 50.03, -32.06], // las puntas, en las tangencias con los extremos del rasgado
      ['v', 56.15, -32.06, 56.15, -8.19],
      ['v', 'a', 53.32, -8.02, 7.73, 360, 450],
      ['v', 'a', 53.61, -32.5, 7.5, 270, 360],
      ['v', 'a', 53.03, -8.19, 3.03, 360, 540],
      ['v', 'a', 53.1, -32.06, 3.05, 180, 360],
      ['o', -0.25, -7.92, 8.19, -7.92],
      ['o', -0.25, -12.22, 8.19, -12.22],
      ['o', -0.19, -27.92, 8.19, -27.92],
      ['o', -0.25, -32.28, 8.25, -32.28],
    ],
  },
  {
    pieza: 'nyv-2-18-4',
    vista: 'derecho',
    pagina: 'p. 22, origen en (118,61, 629,91) pt',
    lineas: [
      ['v', 40.48, 0, -0.41, 0],
      ['v', 40.2, 0.22, 40.2, -31.98],
      ['v', 0, 0.28, 0, -31.92],
      ['v', 40.55, -9.15, -0.35, -9.15],
      ['v', 40.61, -19.5, -0.28, -19.5],
      ['v', 40.61, -25, -0.28, -25],
      ['v', 40.61, -31.7, -0.28, -31.7],
      ['v', 14.69, -31.48, 14.69, -43.75], // punta 2, en la tangencia con la cabeza de la orejeta
      ['v', 5.45, -31.48, 5.45, -43.75],
      ['v', 34.75, -31.48, 34.75, -43.72],
      ['v', 25.45, -31.48, 25.45, -43.72],
      ['v', 'a', 9.97, -43.75, 4.59, 180, 360],
      ['v', 'a', 30.22, -43.72, 4.65, 180, 360],
      ['v', 'c', 9.95, -43.71, 2.2],
      ['v', 'c', 30.23, -43.75, 2.21],
      ['o', 40.61, -15.9, -0.35, -15.9],
      ['o', 4.86, 0.31, 4.86, -9.34],
      ['o', 35.21, 0.31, 35.21, -9.34],
    ],
  },
];

/* ── Las vistas del motor ──────────────────────────────────────────────── */

const declarada = (id: string): PiezaDeclarada =>
  yaml.load(readFileSync(new URL(`../../src/content/piezas/${id}.yaml`, import.meta.url), 'utf8')) as PiezaDeclarada;

const cache = new Map<string, ReturnType<typeof calculaVistas>>();
function vistasDe(d: PiezaDeclarada, clave: string) {
  const ya = cache.get(clave);
  if (ya) return ya;
  const v = calculaVistas(compilaPieza(d));
  cache.set(clave, v);
  return v;
}

function lineasDelMotor(c: Pick<Clave, 'pieza' | 'vista'>, d = declarada(c.pieza), clave = c.pieza): Linea[] {
  if (c.vista === 'derecho') return lineasDeVista(vistasDe(mediaVuelta(d), `${clave}|media vuelta`).vistas.perfil);
  return lineasDeVista(vistasDe(d, clave).vistas[c.vista]);
}

const enmendada = (c: Clave): LineaDeClave[] => {
  const quitar = new Set((c.enmiendas ?? []).flatMap((e) => e.clave.map((l) => JSON.stringify(l))));
  return [...c.lineas.filter((l) => !quitar.has(JSON.stringify(l))), ...(c.enmiendas ?? []).flatMap((e) => e.motor)].map(linea);
};

const informe = (r: { sobran: Linea[]; faltan: Linea[] }) =>
  [...r.faltan.map((l) => `la clave tiene y el motor no: ${cuenta(l)}`), ...r.sobran.map((l) => `el motor tiene y la clave no: ${cuenta(l)}`)].join('\n');

const resumen = (c: Clave) => {
  const ls = enmendada(c);
  const n = (t: 'visto' | 'oculto', circ: boolean) =>
    ls.filter((l) => l.tipo === t && (l.forma.tipo === 'arco' && l.forma.hasta - l.forma.desde >= 359.9) === circ).length;
  return `${n('visto', false)} vistas y ${n('oculto', false)} ocultas, ${n('visto', true) + n('oculto', true)} circunferencias`;
};

/* ── Los tests ─────────────────────────────────────────────────────────── */

describe('las piezas de NyV 2.18 contra su clave (p. 21 y 22), a 1 mm', () => {
  it.each(CLAVES.map((c) => [`${c.pieza}, ${c.vista === 'derecho' ? 'perfil derecho' : c.vista}: ${resumen(c)}`, c] as const))('%s', (_, c) => {
    const r = comparaLineas(lineasDelMotor(c), enmendada(c), TOL);
    expect(informe(r)).toBe('');
  });

  it('cada enmienda hace falta: sin ella, la vista falla justo en sus líneas', () => {
    const conEnmiendas = CLAVES.filter((c) => c.enmiendas?.length);
    expect(conEnmiendas.length).toBe(2);
    for (const c of conEnmiendas) {
      const r = comparaLineas(lineasDelMotor(c), c.lineas.map(linea), TOL);
      const esperadas = c.enmiendas!.flatMap((e) => e.clave);
      expect(r.faltan.length, `${c.pieza}, ${c.vista}`).toBe(esperadas.length);
      expect(r.sobran.length, `${c.pieza}, ${c.vista}`).toBe(c.enmiendas!.flatMap((e) => e.motor).length);
      for (const l of esperadas) expect(r.faltan.map(cuenta)).toContain(cuenta(linea(l)));
    }
  });

  it('están las cuatro piezas y las diez vistas que dibuja la clave', () => {
    expect(new Set(CLAVES.map((c) => c.pieza)).size).toBe(4);
    expect(CLAVES.length).toBe(10);
  });
});

describe('y al revés: la comparación caza una pieza mal descrita', () => {
  /* Validar al revés (§11): si la descripción se aparta de la clave, la
     comparación tiene que fallar, y decir dónde. */
  /* 2 mm más de radio: la tolerancia es 1 mm, y con 1 mm (6,5 contra 5,43)
     el test pasaba por 0,07 mm. Así falla por más de un milímetro. */
  it('un taladro del buje 2 mm más ancho de radio: falla la circunferencia, y solo ella', () => {
    const d = declarada('nyv-2-18-3');
    const otra = { ...d, resta: d.resta!.map((s) => (s.nombre === 'taladro del buje' && 'cilindro' in s ? { ...s, cilindro: { ...s.cilindro, r: 7.5 } } : s)) };
    const c = CLAVES.find((k) => k.pieza === 'nyv-2-18-3' && k.vista === 'alzado')!;
    const r = comparaLineas(lineasDelMotor(c, otra, 'nyv-2-18-3 con el taladro ancho'), enmendada(c), TOL);
    expect(r.faltan.map(cuenta)).toEqual([cuenta(linea(['v', 'c', 24.73, -39.03, 5.43]))]);
    expect(r.sobran).toHaveLength(1);
  });

  it('un rasgado ciego, que no llega abajo: sus ocultas cambian', () => {
    const d = declarada('nyv-2-18-4');
    const ciego = (s: NonNullable<typeof d.resta>[number]) => {
      if ('caja' in s) return { ...s, caja: [s.caja[0], s.caja[1], s.caja[2], s.caja[3], 4, s.caja[5]] as const };
      if ('cilindro' in s && s.cilindro.eje === 'z') return { ...s, cilindro: { ...s.cilindro, desde: 4, hasta: 10 } };
      return s;
    };
    const otra = { ...d, resta: d.resta!.map((s) => (s.nombre.includes('rasgado') ? ciego(s) : s)) };
    const c = CLAVES.find((k) => k.pieza === 'nyv-2-18-4' && k.vista === 'alzado')!;
    const r = comparaLineas(lineasDelMotor(c, otra, 'nyv-2-18-4 con el rasgado ciego'), enmendada(c), TOL);
    expect(informe(r)).not.toBe('');
  });

  it('una curva leída por puntos casa con el arco que pasa por ellos, y no con uno a 1,5 mm', () => {
    const puntos = [0, 15, 30, 45].map((a): [number, number] => [10 * Math.cos((a * Math.PI) / 180), 10 * Math.sin((a * Math.PI) / 180)]);
    const leida: LineaDeClave = { tipo: 'visto', forma: { tipo: 'polilinea', puntos } };
    expect(casan({ tipo: 'visto', forma: { tipo: 'arco', c: [0, 0], r: 10, desde: -5, hasta: 50 } }, leida, TOL)).toBe(true);
    expect(casan({ tipo: 'visto', forma: { tipo: 'arco', c: [0, 0], r: 11.5, desde: -5, hasta: 50 } }, leida, TOL)).toBe(false);
    expect(casan({ tipo: 'oculto', forma: { tipo: 'arco', c: [0, 0], r: 10, desde: -5, hasta: 50 } }, leida, TOL)).toBe(false);
  });

  it('una punta que no se compara no hace pasar a la otra', () => {
    const motor: Linea = { tipo: 'visto', forma: { tipo: 'segmento', a: [0, 0], b: [10, 0] } };
    const sinLaPrimera = (b: [number, number]): LineaDeClave => ({ tipo: 'visto', forma: { tipo: 'segmento', a: [-5, 0], b }, sinPunta: [1] });
    expect(casan(motor, sinLaPrimera([10.5, 0]), TOL)).toBe(true);
    expect(casan(motor, sinLaPrimera([12, 0]), TOL)).toBe(false);
    expect(casan(motor, { ...sinLaPrimera([10.5, 0]), sinPunta: undefined }, TOL)).toBe(false);
  });

  it('el perfil izquierdo no vale por el derecho', () => {
    const c = CLAVES.find((k) => k.vista === 'derecho')!;
    const r = comparaLineas(lineasDelMotor({ pieza: c.pieza, vista: 'perfil' }), enmendada(c), TOL);
    expect(informe(r)).not.toBe('');
  });
});
