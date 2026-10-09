/**
 * Las holguras del motor de vistas, todas juntas, con su unidad y su porqué.
 *
 * Unas son de base y se eligen; las demás se derivan de ellas, escritas en
 * función de las de base, para que cambiar una no deje a otra
 * contradiciéndola. El orden que tienen que guardar entre sí lo comprueba
 * `tests/vistas/tolerancias.test.ts`.
 *
 * Todas en mm salvo las que dicen otra cosa. Las coordenadas de las piezas
 * del material van de décimas a centenares de mm.
 */

/* ── Las de base ──────────────────────────────────────────────────────── */

/** La erosión del diseño (§3.2): un punto es materia si él y sus seis
 *  vecinos a esta distancia lo son. Es la `HOLGURA` de
 *  `fase-k/visibilidad.mjs`, llevada a la pieza. */
export const EROSION = 0.05;

/** Lo más corto que se guarda: por debajo, una curva o un trozo es ruido de
 *  las cuentas. */
export const LARGO_MINIMO = 1e-3;

/** La exactitud de lo que se calcula exacto —segmentos, arcos, cortes de
 *  planos—: a esta distancia, una superficie pasa por un punto. Tiene que
 *  ser así de pequeña: una cara a 0,01 mm entra en la cuenta y, junto a una
 *  tangencia, alarga la arista 2,5° (lo cazó el test del redondeo). */
export const TOL_EXACTA = 1e-6;

/** El ruido de las cuentas: un denominador por debajo de esto es cero, y
 *  dos parámetros que se separan menos son el mismo. En mm, o sin unidad en
 *  los productos de vectores unitarios. */
export const CASI_CERO = 1e-12;

/** La holgura de las comparaciones: mil veces el ruido. Sin unidad cuando
 *  compara fracciones o senos (dos direcciones son paralelas si el seno de
 *  su ángulo baja de esto), en mm cuando compara longitudes. */
export const HOLGURA_NUMERICA = 1e-9;

/** Dos rectas del papel son paralelas si el seno de su ángulo baja de
 *  esto: mil veces la holgura de las comparaciones, porque su dirección sale
 *  de restar extremos ya redondeados. Sin unidad. */
export const SENO_PARALELAS = 1000 * HOLGURA_NUMERICA;

/** Las coordenadas del papel se redondean a 1/REDONDEO mm (una
 *  milmillonésima), para que 20 no salga 19,999999999. */
export const REDONDEO = 1e9;

/** Cuántas generatrices se muestrean por vuelta al cortar o proyectar una
 *  superficie curva: una por grado. */
export const GENERATRICES = 360;

/** El mayor radio para el que valen las holguras de lo muestreado. Las
 *  piezas del material no pasan de 60 mm de radio. */
export const RADIO_MAXIMO = 100;

/** Dos líneas del papel son la misma si se apartan menos de esto. */
export const TOL_FUSION = 0.01;

/** El paso con que se recorre una candidata (pliegue y visibilidad) y el eje
 *  de un cilindro (dónde asoma). Un trozo más corto que esto puede perderse:
 *  es un límite conocido (MOTOR-LEEME). */
export const PASO_MUESTREO = 0.5;

/** Bisecciones para afinar dónde cambia algo: con 40 sobre un paso de
 *  muestreo, por debajo de 1/REDONDEO. */
export const BISECCIONES = 40;

/** Dos normales son la misma si se apartan menos de esto, en grados. Una
 *  arista real más llana —un desmoldeo de menos de 2°— no se distingue de
 *  un plano: es otro límite conocido. */
export const ANGULO_LLANO = 2;

/** Cuánto sobresale un eje del contorno de su cilindro: el valor de la
 *  espiga. */
export const SOBRESALE_EJE = 3;

/** Cuánto se agranda la caja de la pieza: para lo que no tiene fin (el plano
 *  de un semiespacio, un cilindro pasante) y para el rayo, que mira hasta
 *  un poco más allá. */
export const MARGEN_CAJA = 1;

/* ── Las derivadas ────────────────────────────────────────────────────── */

/** Lo que se aleja, sobre una superficie, la sonda que mira si es piel a un
 *  lado de la candidata: la escala de la erosión. */
export const SONDA = EROSION;

/** El paso a cada lado de una superficie para ver si la pieza cambia al
 *  cruzarla. No sale de TOL_EXACTA, aunque se parezcan: el punto que se
 *  sondea ya está proyectado sobre la superficie (`pliegue.ts`, `sobre`),
 *  así que no hereda la holgura de «pasa por» y solo tiene que quedar muy
 *  por encima del ruido de las cuentas —cien veces la holgura numérica— y
 *  muy por debajo de la pieza más delgada (segunda revisión del 9 de
 *  octubre de 2026). */
export const CRUCE = 100 * HOLGURA_NUMERICA;

/** Lo que se salta el rayo al salir de la arista: dos erosiones, para que
 *  la materia que toca la propia arista no la tape. */
export const DESDE = 2 * EROSION;

/** Dónde se mira la visibilidad de los extremos de una arista: a dos
 *  erosiones de ellos, porque en el vértice mismo los rayos vecinos de la
 *  erosión se salen por la cara de al lado. */
export const BORDE_VISIBILIDAD = 2 * EROSION;

/** Lo que se aparta de su curva la cuerda de una polilínea muestreada a
 *  GENERATRICES por vuelta, en el radio mayor: r·(1 − cos(π/n)). */
export const FLECHA_MAXIMA = RADIO_MAXIMO * (1 - Math.cos(Math.PI / GENERATRICES));

/** A qué distancia pasa una superficie por un punto de una polilínea: la
 *  flecha, con margen. */
export const TOL_MUESTREADA = 1.5 * FLECHA_MAXIMA;

/** Dos líneas del papel se tocan si se acercan menos de esto: tanto como
 *  se aparta una polilínea de su curva, para que una recta que acaba en una
 *  elipse se parta donde la toca. */
export const TOL_CONTACTO = TOL_MUESTREADA;

/** Una superficie contiene la candidata si su normal se aparta de la
 *  perpendicular menos de esto, en grados: seis veces lo que se aparta la
 *  cuerda de una polilínea de su curva (medio paso de muestreo), y mucho
 *  menos de lo que la cruza la cara de un vértice. */
export const ANGULO_CONTIENE = 6 * (180 / GENERATRICES);

/** Un tramo de menos de esto es una astilla de las cuentas, y se funde con
 *  su vecino. */
export const ASTILLA = EROSION;

/** Un descarte más corto que un paso de muestreo no se distingue de un
 *  punto. */
export const DESCARTE_MINIMO = PASO_MUESTREO;

/** Lo más delgada que puede ser una primitiva: por debajo, la sonda la
 *  atraviesa de lado a lado y la arista se borra. */
export const ESPESOR_MINIMO = 2 * SONDA;

/** Un trozo llano entre dos aristas es un punto singular —dos superficies
 *  que se tocan en un punto, como dos tubos del mismo radio que se cruzan—
 *  y no una tangencia, si sus normales ya se apartan esto a un cuarto del
 *  trozo, en grados: en un punto aislado el ángulo crece desde cero, y en
 *  una tangencia de verdad se queda en cero. */
export const ANGULO_SINGULAR = ANGULO_LLANO / 4;
