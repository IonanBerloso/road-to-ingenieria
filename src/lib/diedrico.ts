/**
 * La geometría del sistema diédrico directo, para Expresión Gráfica.
 *
 * POR QUÉ EXISTE. En diédrico nada de lo que se dibuja es libre: un abatido cae
 * exactamente aquí, una verdadera magnitud mide exactamente esto. Por eso una
 * construcción se puede corregir sin profesor, y por eso **la solución se
 * calcula aquí, desde las coordenadas del enunciado, y nunca se dibuja a mano**
 * (§10; §13, caso 2). Es la física de los simuladores con otra cara: vive en
 * `lib/` para que vitest la pueda probar, y el componente que la use no
 * calculará nada (§10).
 *
 * DE DÓNDE SALE. Es la biblioteca `G` del motor piloto del paquete de diseño
 * del 8 de septiembre de 2026 (`Claude outputs/expresion-grafica-paquete-1.zip`,
 * `taller/taller-base.html`), pasada a TypeScript con lo que pide el primer
 * ejercicio, SD1, y sus pruebas en `tests/geometria/`. El resto de funciones
 * del brief se añade cuando un ejercicio las pida, con su prueba (§13).
 *
 * LAS COORDENADAS. Las de la lámina: pt del PDF, con la y hacia abajo, que es
 * como salen del extractor. Un punto del espacio se da por sus dos
 * proyecciones —el alzado y la planta, en la misma vertical— y se convierte en
 * 3D con `alejamiento = y de la planta` y `cota = −(y del alzado)`. En
 * diédrico directo no hay línea de tierra, y no hace falta: solo se miden
 * distancias y ángulos, y esos no dependen del origen. Todo se devuelve en pt;
 * a milímetros se pasa solo al publicar, con `PT_MM`.
 */

/** Un punto de la lámina, en pt del PDF, con la y hacia abajo. */
export type P2 = readonly [number, number];

/** Un punto del espacio: `x` común a las dos vistas, `y` el alejamiento (la y
 *  de la planta) y `z` la cota (menos la y del alzado). */
export interface P3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

/** Un plano como normal unitaria y distancia: `n · P = d`. */
export interface Plano {
  readonly n: P3;
  readonly d: number;
}

/** Milímetros por punto tipográfico: la lámina es 1:1 en el PDF. */
export const PT_MM = 25.4 / 72;

/** Cuánto pueden separarse, en pt, las dos proyecciones de un punto que
 *  vienen del extractor: su redondeo es de centésimas, y medio punto son
 *  0,18 mm, bastante por debajo de lo que distingue la regla. */
const TOL_VERTICAL = 0.5;

const resta = (a: P3, b: P3): P3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const escalar = (a: P3, b: P3): number => a.x * b.x + a.y * b.y + a.z * b.z;
const vectorial = (a: P3, b: P3): P3 => ({
  x: a.y * b.z - a.z * b.y,
  y: a.z * b.x - a.x * b.z,
  z: a.x * b.y - a.y * b.x,
});
const modulo = (a: P3): number => Math.hypot(a.x, a.y, a.z);
const unitario2 = (d: P2): P2 => {
  const l = Math.hypot(d[0], d[1]);
  return [d[0] / l, d[1] / l];
};
const perpendicular2 = (d: P2): P2 => [-d[1], d[0]];

/** El punto del espacio que tiene esas dos proyecciones. Si no están en la
 *  misma vertical no son un punto, y eso es un dato mal transcrito: lanza. */
export function punto3(alzado: P2, planta: P2, tol = TOL_VERTICAL): P3 {
  if (Math.abs(alzado[0] - planta[0]) > tol) {
    throw new Error(
      `las proyecciones (${alzado[0]}, ${alzado[1]}) y (${planta[0]}, ${planta[1]}) no están en la misma vertical: no son un punto`,
    );
  }
  return { x: planta[0], y: planta[1], z: -alzado[1] };
}

/** La proyección en la planta. */
export const proyPlanta = (P: P3): P2 => [P.x, P.y];

/** La proyección en el alzado. */
export const proyAlzado = (P: P3): P2 => [P.x, -P.z];

/** Verdadera magnitud del segmento PQ, en pt. */
export const vm = (P: P3, Q: P3): number => modulo(resta(Q, P));

/** Lo que mide PQ en la planta: la verdadera magnitud solo si PQ es horizontal. */
export const vmPlanta = (P: P3, Q: P3): number => Math.hypot(Q.x - P.x, Q.y - P.y);

/** Lo que mide PQ en el alzado: la verdadera magnitud solo si PQ es frontal. */
export const vmAlzado = (P: P3, Q: P3): number => Math.hypot(Q.x - P.x, Q.z - P.z);

/** La diferencia de cotas entre P y Q, en pt: lo que sube o baja, que se lee
 *  en el alzado. */
export const deltaCota = (P: P3, Q: P3): number => Math.abs(Q.z - P.z);

/** La diferencia de alejamientos entre P y Q, en pt: lo que se acerca o se
 *  aleja, que se lee en la planta. */
export const deltaAlejamiento = (P: P3, Q: P3): number => Math.abs(Q.y - P.y);

const GRADOS = 180 / Math.PI;

/** El ángulo de la recta PQ con el plano horizontal, en grados: el que da la
 *  verdadera magnitud frente a la planta. */
export const anguloConPH = (P: P3, Q: P3): number => Math.atan2(deltaCota(P, Q), vmPlanta(P, Q)) * GRADOS;

/** El ángulo de la recta PQ con el plano vertical, en grados: el que da la
 *  verdadera magnitud frente al alzado. */
export const anguloConPV = (P: P3, Q: P3): number => Math.atan2(deltaAlejamiento(P, Q), vmAlzado(P, Q)) * GRADOS;

/** La pendiente de PQ como razón —lo que sube por lo que avanza en la
 *  planta—, que es la tangente de su ángulo con el plano horizontal. En tanto
 *  por ciento, por cien. */
export const pendiente = (P: P3, Q: P3): number => deltaCota(P, Q) / vmPlanta(P, Q);

/** El plano por tres puntos. Si están alineados no hay uno: lanza. */
export function plano(A: P3, B: P3, C: P3): Plano {
  const n = vectorial(resta(B, A), resta(C, A));
  const l = modulo(n);
  if (l < 1e-9) throw new Error('los tres puntos están alineados: no definen un plano');
  const u = { x: n.x / l, y: n.y / l, z: n.z / l };
  return { n: u, d: escalar(u, A) };
}

/** Si P está en el plano, con una holgura en pt. */
export const enPlano = (P: P3, pl: Plano, tol = TOL_VERTICAL): boolean =>
  Math.abs(escalar(pl.n, P) - pl.d) <= tol;

/** El punto del plano que tiene esa proyección en el alzado. En un plano
 *  proyectante vertical —de canto sobre el alzado— la planta no queda fijada
 *  por el alzado: lanza en vez de inventarla. */
export function puntoEnPlanoDesdeAlzado(alzado: P2, pl: Plano): P3 {
  if (Math.abs(pl.n.y) < 1e-12) throw new Error('el plano es proyectante sobre el alzado: el alzado no fija el punto');
  const x = alzado[0];
  const z = -alzado[1];
  return { x, y: (pl.d - pl.n.x * x - pl.n.z * z) / pl.n.y, z };
}

/** El punto del plano que tiene esa proyección en la planta. En un plano
 *  vertical la planta no fija la cota: lanza. */
export function puntoEnPlanoDesdePlanta(planta: P2, pl: Plano): P3 {
  if (Math.abs(pl.n.z) < 1e-12) throw new Error('el plano es vertical: la planta no fija el punto');
  const [x, y] = planta;
  return { x, y, z: (pl.d - pl.n.x * x - pl.n.y * y) / pl.n.z };
}

/** La dirección de las horizontales del plano, en la planta (sentido
 *  cualquiera). Una horizontal se ve en verdadera magnitud en la planta. */
export const horizontalDir = (pl: Plano): P2 => unitario2([pl.n.y, -pl.n.x]);

/**
 * La línea de máxima pendiente, en la planta: perpendicular a las horizontales
 * del plano, con sus dos sentidos. Es por donde baja una gota.
 *
 * Un plano horizontal no tiene pendiente, y uno vertical la tiene infinita:
 * los dos lanzan, porque en ninguno de los dos hay una dirección de bajada que
 * dibujar en la planta.
 */
export function lmpDir(pl: Plano): { sube: P2; baja: P2 } {
  if (Math.abs(pl.n.z) < 1e-12) throw new Error('el plano es vertical: su máxima pendiente no se ve en la planta');
  const g: P2 = [-pl.n.x / pl.n.z, -pl.n.y / pl.n.z];
  if (Math.hypot(g[0], g[1]) < 1e-12) throw new Error('el plano es horizontal: no tiene línea de máxima pendiente');
  const sube = unitario2(g);
  return { sube, baja: [-sube[0], -sube[1]] };
}

/** La dirección de las frontales del plano, en el alzado (sentido
 *  cualquiera). Una frontal se ve en verdadera magnitud en el alzado. En
 *  coordenadas de la lámina: `[x, y del alzado]`. */
export const frontalDir = (pl: Plano): P2 => unitario2([-pl.n.z, -pl.n.x]);

/**
 * La línea de máxima inclinación, en el alzado: perpendicular a las
 * frontales, con sus dos sentidos. Es la hermana de la l.m.p. respecto del
 * plano vertical. `sube` es el sentido en que crece la cota, que en la lámina
 * es hacia arriba (y decreciente).
 */
export function lmiDir(pl: Plano): { sube: P2; baja: P2 } {
  if (Math.abs(pl.n.y) < 1e-12) throw new Error('el plano es de canto: su máxima inclinación no se ve en el alzado');
  const d = unitario2([pl.n.x, -pl.n.z]);
  const sube: P2 = d[1] < 0 ? d : [-d[0], -d[1]];
  return { sube, baja: [-sube[0], -sube[1]] };
}

/** El ángulo del plano con el plano horizontal, en grados: el de sus normales. */
export const anguloPlanoConPH = (pl: Plano): number => Math.acos(Math.min(1, Math.abs(pl.n.z))) * GRADOS;

/** El ángulo del plano con el plano vertical, en grados. */
export const anguloPlanoConPV = (pl: Plano): number => Math.acos(Math.min(1, Math.abs(pl.n.y))) * GRADOS;

/** El ángulo entre la recta PQ y la recta RS, en grados, entre 0 y 90: el de
 *  dos rectas no tiene sentido. */
export function anguloEntreRectas(P: P3, Q: P3, R: P3, S: P3): number {
  const u = resta(Q, P);
  const v = resta(S, R);
  const c = Math.abs(escalar(u, v)) / (modulo(u) * modulo(v));
  return Math.acos(Math.min(1, c)) * GRADOS;
}

/** Corte de la recta `p0 + t·d` con la recta que pasa por q0 y q1, en el
 *  plano de la lámina. `s` es el parámetro sobre q0→q1: entre 0 y 1, el corte
 *  cae dentro del segmento. `null` si son paralelas. */
export function corte2D(p0: P2, d: P2, q0: P2, q1: P2): { t: number; s: number } | null {
  const e: P2 = [q1[0] - q0[0], q1[1] - q0[1]];
  const det = d[0] * -e[1] - d[1] * -e[0];
  if (Math.abs(det) < 1e-9) return null;
  const r: P2 = [q0[0] - p0[0], q0[1] - p0[1]];
  return { t: (r[0] * -e[1] - r[1] * -e[0]) / det, s: (d[0] * r[1] - d[1] * r[0]) / det };
}

/**
 * El primer segmento que corta la semirrecta que sale de `p0` en la dirección
 * `d` —hacia delante, no hacia atrás—, con el punto de corte, el índice del
 * segmento y su parámetro sobre él. Es cómo se sabe por qué alero deja el
 * tejado una gota. `null` si no corta ninguno.
 */
export function corteConSegmentos(
  p0: P2,
  d: P2,
  segmentos: readonly (readonly [P2, P2])[],
): { punto: P2; indice: number; s: number } | null {
  let mejor: { punto: P2; indice: number; s: number; t: number } | null = null;
  segmentos.forEach(([a, b], indice) => {
    const c = corte2D(p0, d, a, b);
    if (!c || c.t <= 1e-9 || c.s < -1e-9 || c.s > 1 + 1e-9) return;
    if (!mejor || c.t < mejor.t) {
      mejor = { punto: [p0[0] + d[0] * c.t, p0[1] + d[1] * c.t], indice, s: c.s, t: c.t };
    }
  });
  if (!mejor) return null;
  const { punto, indice, s } = mejor;
  return { punto, indice, s };
}

/**
 * El punto del segmento AB en el parámetro `s` (0 en A, 1 en B), en 3D.
 *
 * Es como se construye un punto que está SOBRE una arista dibujada: su
 * proyección cae en la proyección de la arista, en la vertical de la otra. Y no
 * es lo mismo que sacarlo de un plano cuando la arista solo está en ese plano
 * «a la precisión del dato»: en SD1 el vértice B se separa unas décimas de
 * punto del plano de L, T y R —el redondeo de la lámina—, y el Q del alero y
 * el del plano difieren 0,10 pt. La solución que se corrige es la que el
 * alumno construye, sobre la arista; la diferencia, 0,04 mm, se comprueba en
 * las pruebas contra la tolerancia de la regla.
 */
export const puntoEnSegmento = (A: P3, B: P3, s: number): P3 => ({
  x: A.x + s * (B.x - A.x),
  y: A.y + s * (B.y - A.y),
  z: A.z + s * (B.z - A.z),
});

/** La distancia de P al plano, en pt. Sirve para medir cuánto se separa del
 *  plano un vértice que el enunciado da por contenido en él. */
export const distanciaAPlano = (P: P3, pl: Plano): number => Math.abs(escalar(pl.n, P) - pl.d);

/**
 * El abatimiento del plano proyectante de PQ sobre la planta: Q abatido queda
 * a |Δcota| de Q₁, perpendicular a P₁Q₁, y los dos lados valen. La distancia de
 * P₁ a cualquiera de los dos es la verdadera magnitud de PQ: es el segundo
 * camino con el que se comprueba `vm`.
 */
export function abatidoPlanta(P: P3, Q: P3): [P2, P2] {
  const n = perpendicular2(unitario2([Q.x - P.x, Q.y - P.y]));
  const h = deltaCota(P, Q);
  return [
    [Q.x + n[0] * h, Q.y + n[1] * h],
    [Q.x - n[0] * h, Q.y - n[1] * h],
  ];
}

/** Lo mismo sobre el alzado: Q abatido queda a |Δalejamiento| de Q₂,
 *  perpendicular a P₂Q₂. En coordenadas de la lámina, la y del alzado es menos
 *  la cota. */
export function abatidoAlzado(P: P3, Q: P3): [P2, P2] {
  const n = perpendicular2(unitario2([Q.x - P.x, P.z - Q.z]));
  const h = deltaAlejamiento(P, Q);
  return [
    [Q.x + n[0] * h, -Q.z + n[1] * h],
    [Q.x - n[0] * h, -Q.z - n[1] * h],
  ];
}
