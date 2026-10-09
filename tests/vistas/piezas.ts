/**
 * Las piezas de los tests de lib/vistas: configuraciones pequeñas con la
 * respuesta conocida (diseño de la fase M, §3.8), y la de la espiga, que se
 * lee de su YAML como se leerá de la colección `piezas`.
 *
 * Todas son nuestras e inventadas para la prueba. Ejes: x a la derecha, y
 * hacia el fondo, z hacia arriba; mm.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import type { PiezaDeclarada } from '../../src/lib/vistas/pieza.ts';

const fuente = (que: string) => `Pieza de prueba de lib/vistas: ${que}.`;

/** Una L de dos cajas que comparten la cara delantera, la trasera y la
 *  izquierda. La junta, en z = 10, no es arista en ninguna de las tres
 *  caras; vista desde la izquierda, la arista cóncava del escalón (x = 20,
 *  z = 10) queda detrás de la caja de encima. */
export const L_DE_DOS_CAJAS: PiezaDeclarada = {
  codigo: 'prueba-l',
  fuente: fuente('una L de dos cajas'),
  suma: [
    { nombre: 'base', caja: [0, 60, 0, 40, 0, 10] },
    { nombre: 'encima', caja: [0, 20, 0, 40, 10, 30] },
  ],
};

/** La misma L, de una pieza: un prisma de sección en L. Tiene que dar las
 *  mismas vistas que la de dos cajas, sin junta que descartar. */
export const L_PRISMA: PiezaDeclarada = {
  codigo: 'prueba-l-prisma',
  fuente: fuente('la L de dos cajas, como un solo prisma'),
  suma: [
    {
      nombre: 'ele',
      prisma: {
        plano: 'xz',
        poligono: [
          [0, 0],
          [60, 0],
          [60, 10],
          [20, 10],
          [20, 30],
          [0, 30],
        ],
        desde: 0,
        hasta: 40,
      },
    },
  ],
};

/** Una placa con el extremo redondeado: un cilindro sumado, tangente a las
 *  caras x = 0 y x = 20 de la placa en y = 30. Ahí no hay arista. */
export const PLACA_REDONDEADA: PiezaDeclarada = {
  codigo: 'prueba-redondeo',
  fuente: fuente('una placa con un extremo redondeado'),
  suma: [
    { nombre: 'placa', caja: [0, 20, 0, 30, 0, 10] },
    { nombre: 'redondeo', cilindro: { eje: 'z', centro: [10, 30], r: 10, desde: 0, hasta: 10 } },
  ],
};

/** Un bloque con una ranura en V a lo largo de y: el fondo de la V, en
 *  x = 30 y z = 10, es una arista cóncava. La ranura es un prisma de
 *  sección triangular que sobresale por arriba y por delante y detrás. */
export const RANURA_EN_V: PiezaDeclarada = {
  codigo: 'prueba-ranura',
  fuente: fuente('un bloque con una ranura en V'),
  suma: [{ nombre: 'bloque', caja: [0, 60, 0, 40, 0, 20] }],
  resta: [
    {
      nombre: 'ranura',
      prisma: {
        plano: 'xz',
        poligono: [
          [17, 23],
          [43, 23],
          [30, 10],
        ],
        desde: -1,
        hasta: 41,
      },
    },
  ],
};

/** Un bloque con un taladro vertical pasante de radio 8 en el centro. */
export const BLOQUE_TALADRADO: PiezaDeclarada = {
  codigo: 'prueba-taladro',
  fuente: fuente('un bloque con un taladro pasante'),
  suma: [{ nombre: 'bloque', caja: [0, 60, 0, 40, 0, 20] }],
  resta: [{ nombre: 'taladro', cilindro: { eje: 'z', centro: [30, 20], r: 8 } }],
};

/** Una columna cilíndrica de radio 10 de pie sobre una base: su contorno
 *  aparente es lo único que la dibuja en el alzado y en el perfil. */
export const COLUMNA_EN_BASE: PiezaDeclarada = {
  codigo: 'prueba-columna',
  fuente: fuente('una columna cilíndrica sobre una base'),
  suma: [
    { nombre: 'base', caja: [0, 60, 0, 40, 0, 10] },
    { nombre: 'columna', cilindro: { eje: 'z', centro: [30, 20], r: 10, desde: 10, hasta: 40 } },
  ],
};

/** Un tronco de cono de pie: radio 10 abajo y 5 arriba, 20 de alto. */
export const TRONCO_DE_CONO: PiezaDeclarada = {
  codigo: 'prueba-cono',
  fuente: fuente('un tronco de cono'),
  suma: [{ nombre: 'tronco', cono: { eje: 'z', centro: [0, 0], r0: 10, r1: 5, desde: 0, hasta: 20 } }],
};

/** Un eje vertical de radio 10 con un taladro transversal de radio 4 a lo
 *  largo de x: la intersección de dos cilindros. */
export const EJE_TALADRADO: PiezaDeclarada = {
  codigo: 'prueba-eje',
  fuente: fuente('un eje con un taladro transversal'),
  suma: [{ nombre: 'eje', cilindro: { eje: 'z', centro: [0, 0], r: 10, desde: 0, hasta: 40 } }],
  resta: [{ nombre: 'pasador', cilindro: { eje: 'x', centro: [0, 20], r: 4 } }],
};

/** La pieza de la espiga, leída de su YAML, junto a este fichero: no
 *  depende de desde dónde se lancen los tests. */
export function piezaDeLaEspiga(): PiezaDeclarada {
  const ruta = fileURLToPath(new URL('./piezas/ri-v1.yaml', import.meta.url));
  return yaml.load(readFileSync(ruta, 'utf8')) as PiezaDeclarada;
}

/* ── Las de la revisión del 9 de octubre ──────────────────────────────── */

/** Dos cilindros sumados de ejes paralelos que se cortan: sus
 *  circunferencias se cruzan en x = 6, y = ±8, y por ahí va la arista de
 *  encuentro, de arriba abajo. */
export const CILINDROS_PARALELOS: PiezaDeclarada = {
  codigo: 'prueba-paralelos',
  fuente: fuente('dos cilindros de ejes paralelos que se cortan'),
  suma: [
    { nombre: 'izquierdo', cilindro: { eje: 'z', centro: [0, 0], r: 10, desde: 0, hasta: 20 } },
    { nombre: 'derecho', cilindro: { eje: 'z', centro: [12, 0], r: 10, desde: 0, hasta: 20 } },
  ],
};

/** Dos tubos del mismo radio cruzados en ángulo recto: se cortan en dos
 *  elipses de planos x = ±(z − 20), que se cruzan donde las dos superficies
 *  son tangentes, en (0, ±10, 20). En el alzado dibujan una X. */
export const CRUZ_DE_TUBOS: PiezaDeclarada = {
  codigo: 'prueba-cruz',
  fuente: fuente('dos tubos del mismo radio cruzados'),
  suma: [
    { nombre: 'vertical', cilindro: { eje: 'z', centro: [0, 0], r: 10, desde: 0, hasta: 40 } },
    { nombre: 'horizontal', cilindro: { eje: 'x', centro: [0, 20], r: 10, desde: -20, hasta: 20 } },
  ],
};

/** El caso del revisor: un eje de radio 10 con un taladro transversal del
 *  mismo radio. */
export const EJE_TALADRADO_IGUAL: PiezaDeclarada = {
  codigo: 'prueba-eje-igual',
  fuente: fuente('un eje con un taladro transversal de su mismo radio'),
  suma: [{ nombre: 'eje', cilindro: { eje: 'z', centro: [0, 0], r: 10, desde: 0, hasta: 40 } }],
  resta: [{ nombre: 'pasador', cilindro: { eje: 'x', centro: [0, 20], r: 10 } }],
};

/** Un taladro avellanado: el cilindro pasante de radio 4 y el cono a 90°,
 *  coaxiales, que se encuentran en z = 16. */
export const AVELLANADO: PiezaDeclarada = {
  codigo: 'prueba-avellanado',
  fuente: fuente('un bloque con un taladro avellanado'),
  suma: [{ nombre: 'bloque', caja: [0, 40, 0, 40, 0, 20] }],
  resta: [
    { nombre: 'taladro', cilindro: { eje: 'z', centro: [20, 20], r: 4 } },
    { nombre: 'avellanado', cono: { eje: 'z', centro: [20, 20], r0: 4, r1: 9, desde: 16, hasta: 21 } },
  ],
};

/** Un agujero ciego con el fondo cónico de la broca: cilindro de radio 5
 *  hasta z = 10 y cono hasta la punta, en z = 7. */
export const AGUJERO_CIEGO: PiezaDeclarada = {
  codigo: 'prueba-ciego',
  fuente: fuente('un agujero ciego con fondo cónico'),
  suma: [{ nombre: 'bloque', caja: [0, 40, 0, 40, 0, 30] }],
  resta: [
    { nombre: 'agujero', cilindro: { eje: 'z', centro: [20, 20], r: 5, desde: 10, hasta: 31 } },
    { nombre: 'punta', cono: { eje: 'z', centro: [20, 20], r0: 0, r1: 5, desde: 7, hasta: 10 } },
  ],
};

/** Dos cubos que solo se tocan por una arista: la recta x = 10, z = 10. */
export const CONTACTO_POR_ARISTA: PiezaDeclarada = {
  codigo: 'prueba-arista',
  fuente: fuente('dos cubos que se tocan por una arista'),
  suma: [
    { nombre: 'abajo', caja: [0, 10, 0, 10, 0, 10] },
    { nombre: 'arriba', caja: [10, 20, 0, 10, 10, 20] },
  ],
};

/** Dos cubos que solo se tocan por un vértice, el (10, 10, 10). */
export const CONTACTO_POR_VERTICE: PiezaDeclarada = {
  codigo: 'prueba-vertice',
  fuente: fuente('dos cubos que se tocan por un vértice'),
  suma: [
    { nombre: 'abajo', caja: [0, 10, 0, 10, 0, 10] },
    { nombre: 'arriba', caja: [10, 20, 10, 20, 10, 20] },
  ],
};

/** Un chaflán que se quita de la pieza entera, sin «dentro»: x + z ≥ 55. */
export const CHAFLAN_SIN_DENTRO: PiezaDeclarada = {
  codigo: 'prueba-chaflan',
  fuente: fuente('un bloque con un chaflán que se quita de toda la pieza'),
  suma: [{ nombre: 'bloque', caja: [0, 40, 0, 20, 0, 20] }],
  resta: [{ nombre: 'chaflán', semiespacio: { normal: [-1, 0, -1], pasa: [40, 0, 15] } }],
};

/** Una muesca restada cuya pared del fondo, en y = 10, sigue en el mismo
 *  plano que la cara delantera de un bloque sumado encima. Las dos miran a
 *  −y, pero la normal propia de la cara de la muesca mira a +y: lo que
 *  decide si dos caras están en el mismo plano es hacia dónde mira la piel
 *  de la pieza, no la primitiva. */
export const MUESCA_COPLANARIA: PiezaDeclarada = {
  codigo: 'prueba-muesca',
  fuente: fuente('una muesca cuya pared sigue la cara de un bloque de encima'),
  suma: [
    { nombre: 'base', caja: [0, 40, 0, 20, 0, 20] },
    { nombre: 'lomo', caja: [0, 40, 10, 20, 20, 30] },
  ],
  resta: [{ nombre: 'muesca', caja: [10, 30, -1, 10, 10, 20] }],
};

/** Primitivas giradas 30° alrededor de la vertical: una caja y un
 *  cilindro tumbado, hundido 2 mm en la base. */
export const GIRADAS: PiezaDeclarada = {
  codigo: 'prueba-giradas',
  fuente: fuente('una caja y un cilindro girados sobre una base'),
  suma: [
    { nombre: 'base', caja: [-25, 25, -15, 15, 0, 10] },
    { nombre: 'taco', caja: [-20, -5, -5, 5, 10, 20], gira: { eje: 'z', grados: 30, por: [-12.5, 0, 0] } },
    { nombre: 'rodillo', cilindro: { eje: 'x', centro: [0, 12], r: 4, desde: 5, hasta: 20 }, gira: { eje: 'z', grados: -30, por: [12.5, 0, 0] } },
  ],
};

/** Una placa con n agujeros pasantes de radio 3 en rejilla, para medir el
 *  tiempo. */
export function placaConAgujeros(n: number): PiezaDeclarada {
  const columnas = Math.ceil(Math.sqrt(n * 2));
  const filas = Math.ceil(n / columnas);
  return {
    codigo: `prueba-placa-${n}`,
    fuente: fuente(`una placa con ${n} agujeros`),
    suma: [{ nombre: 'placa', caja: [0, 20 + (columnas - 1) * 12, 0, 20 + (filas - 1) * 12, 0, 10] }],
    resta: Array.from({ length: n }, (_, k) => ({
      nombre: `agujero ${k + 1}`,
      cilindro: { eje: 'z' as const, centro: [10 + (k % columnas) * 12, 10 + Math.floor(k / columnas) * 12] as const, r: 3 },
    })),
  };
}

/* ── Las de la segunda revisión ───────────────────────────────────────── */

/** Un tubo vertical de radio 10 y otro horizontal de radio r cuyo eje pasa
 *  `desplazamiento` mm por detrás del vertical: los ejes se cruzan sin
 *  cortarse. La curva de encuentro es un lazo que gira donde la generatriz
 *  del vertical es tangente al horizontal. Restado, es un taladro
 *  descentrado. */
export function tubosDescentrados(r: number, desplazamiento: number, resta = false): PiezaDeclarada {
  const vertical = { nombre: 'vertical', cilindro: { eje: 'z' as const, centro: [0, 0] as const, r: 10, desde: 0, hasta: 40 } };
  const horizontal = { nombre: 'horizontal', cilindro: { eje: 'x' as const, centro: [desplazamiento, 20] as const, r, desde: -20, hasta: 20 } };
  const taladro = { nombre: 'horizontal', cilindro: { eje: 'x' as const, centro: [desplazamiento, 20] as const, r } };
  return {
    codigo: `prueba-descentrados-${r}-${desplazamiento}${resta ? '-resta' : ''}`,
    fuente: fuente(`dos tubos de ejes que se cruzan sin cortarse, r ${r}, a ${desplazamiento} mm`),
    suma: resta ? [vertical] : [vertical, horizontal],
    ...(resta ? { resta: [taladro] } : {}),
  };
}

/** Un eje con un pasador sumado que lo atraviesa: en el alzado, la mitad de
 *  atrás de cada curva de encuentro (oculta) cae encima de la de delante
 *  (vista). */
export const EJE_CON_PASADOR: PiezaDeclarada = {
  codigo: 'prueba-pasador',
  fuente: fuente('un eje con un pasador que lo atraviesa'),
  suma: [
    { nombre: 'eje', cilindro: { eje: 'z', centro: [0, 0], r: 10, desde: 0, hasta: 40 } },
    { nombre: 'pasador', cilindro: { eje: 'x', centro: [0, 20], r: 4, desde: -20, hasta: 20 } },
  ],
};
