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
 *  0,18 mm, bastante por debajo de lo que distingue la regla. Es la holgura
 *  de la lámina, y la misma sirve para decir que un punto del enunciado está
 *  en un plano o en una recta. */
export const TOL_VERTICAL = 0.5;

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

/* ─────────────── las rectas del espacio (SD5 y SD7, figuras planas) ─────── */

/** Una recta del espacio: un punto suyo y su dirección unitaria. */
export interface Recta3 {
  readonly p: P3;
  readonly d: P3;
}

const suma = (a: P3, b: P3): P3 => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });
const por = (a: P3, k: number): P3 => ({ x: a.x * k, y: a.y * k, z: a.z * k });

/** La recta que pasa por A y B. Si son el mismo punto no hay una: lanza. */
export function rectaPorPuntos(A: P3, B: P3): Recta3 {
  const v = resta(B, A);
  const l = modulo(v);
  if (l < 1e-9) throw new Error('los dos puntos coinciden: no definen una recta');
  return { p: A, d: por(v, 1 / l) };
}

/**
 * La recta que tiene esas dos proyecciones, dadas como segmentos de la lámina.
 * Cada proyección da una coordenada en función de la x —el alzado la cota, la
 * planta el alejamiento—, así que dos x distintas dan dos puntos de la recta.
 *
 * Una recta de perfil tiene las dos proyecciones verticales y en la misma x:
 * sus proyecciones no la fijan —hace falta la tercera vista, o dos puntos—, y
 * una vertical o una de punta tienen una proyección reducida a un punto. Las
 * tres lanzan: se dan por dos puntos, con `rectaPorPuntos`.
 */
export function rectaDesdeProyecciones(alzado: readonly [P2, P2], planta: readonly [P2, P2]): Recta3 {
  const [a, b] = alzado;
  const [c, e] = planta;
  if (Math.abs(b[0] - a[0]) < 1e-9 || Math.abs(e[0] - c[0]) < 1e-9) {
    throw new Error('la recta es de perfil, vertical o de punta: sus proyecciones no la fijan; dala por dos puntos');
  }
  const en = (x: number): P3 => ({
    x,
    y: c[1] + ((x - c[0]) * (e[1] - c[1])) / (e[0] - c[0]),
    z: -(a[1] + ((x - a[0]) * (b[1] - a[1])) / (b[0] - a[0])),
  });
  return rectaPorPuntos(en(a[0]), en(b[0]));
}

/** El pie de la perpendicular desde P a la recta: su punto más cercano. */
export const pieEnRecta = (P: P3, r: Recta3): P3 => suma(r.p, por(r.d, escalar(resta(P, r.p), r.d)));

/** La distancia de P a la recta, en pt. */
export const distanciaARecta = (P: P3, r: Recta3): number => vm(P, pieEnRecta(P, r));

/** Si P está en la recta, con la holgura de la lámina. */
export const enRecta = (P: P3, r: Recta3, tol = TOL_VERTICAL): boolean => distanciaARecta(P, r) <= tol;

/**
 * Los dos puntos de la recta a una distancia REAL de `desde`, uno a cada
 * lado: el primero en el sentido de la dirección de la recta. Es llevar una
 * longitud en verdadera magnitud sobre una recta oblicua, que en la lámina
 * pide abatir; aquí es una suma.
 *
 * `desde` tiene que estar en la recta, con la holgura de la lámina, y se usa
 * tal como está —así lo toma el compás del alumno—. Si no está, el enunciado
 * dice otra cosa o el dato está mal transcrito: lanza con la distancia.
 */
export function puntosADistancia(r: Recta3, desde: P3, distancia: number): [P3, P3] {
  const fuera = distanciaARecta(desde, r);
  if (fuera > TOL_VERTICAL) {
    throw new Error(`el punto de partida no está en la recta: queda a ${(fuera * PT_MM).toFixed(2)} mm`);
  }
  return [suma(desde, por(r.d, distancia)), suma(desde, por(r.d, -distancia))];
}

/** El simétrico de P respecto de O. */
export const simetrico = (P: P3, O: P3): P3 => resta(por(O, 2), P);

function rectaDelPlanoPor(P: P3, pl: Plano, eje: P3, cual: string, fallo: string): Recta3 {
  if (!enPlano(P, pl)) {
    throw new Error(`el punto no está en el plano: queda a ${(distanciaAPlano(P, pl) * PT_MM).toFixed(2)} mm`);
  }
  const v = vectorial(pl.n, eje);
  const l = modulo(v);
  if (l < 1e-9) throw new Error(`el plano es ${fallo}: todas sus rectas son ${cual}`);
  return { p: P, d: por(v, 1 / l) };
}

/** La horizontal del plano que pasa por P: la que se ve en verdadera magnitud
 *  en la planta. En un plano horizontal todas lo son: lanza. */
export const horizontalPor = (P: P3, pl: Plano): Recta3 =>
  rectaDelPlanoPor(P, pl, { x: 0, y: 0, z: 1 }, 'horizontales', 'horizontal');

/** La frontal del plano que pasa por P: la que se ve en verdadera magnitud en
 *  el alzado. En un plano frontal todas lo son: lanza. */
export const frontalPor = (P: P3, pl: Plano): Recta3 =>
  rectaDelPlanoPor(P, pl, { x: 0, y: 1, z: 0 }, 'frontales', 'frontal');

/**
 * El plano que tiene a r por línea de máxima pendiente: el que contiene a r y
 * a las horizontales perpendiculares a r₁ en la planta. Es como se da un plano
 * en SD7. Una recta horizontal no es la l.m.p. de ningún plano inclinado, y una
 * vertical está en infinitos: las dos lanzan.
 */
export function planoPorLmp(r: Recta3): Plano {
  if (Math.abs(r.d.z) < 1e-12) throw new Error('una recta horizontal no es la línea de máxima pendiente de ningún plano');
  if (Math.hypot(r.d.x, r.d.y) < 1e-12) throw new Error('una recta vertical no fija el plano del que sería línea de máxima pendiente');
  const horizontal: P3 = { x: -r.d.y, y: r.d.x, z: 0 };
  return plano(r.p, suma(r.p, r.d), suma(r.p, horizontal));
}

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

/* ─────── el lote 0 de la fase K: ángulos, distancias, perpendiculares, ─────
   abatimientos y giros. Lo piden las hojas de examen 52-55 y las láminas de
   ángulos y distancias (SD47-SD63). Cada función con su prueba por dos caminos
   en tests/geometria/lote0.test.ts. */

const unitario3 = (a: P3): P3 => {
  const l = modulo(a);
  if (l < 1e-12) throw new Error('un vector nulo no tiene dirección');
  return por(a, 1 / l);
};
const angulo01 = (c: number): number => Math.acos(Math.max(-1, Math.min(1, c))) * GRADOS;

/** La normal del plano que apunta hacia donde gana cota; en un plano
 *  vertical, hacia donde gana alejamiento; en uno de perfil, hacia la x. Es lo
 *  que da sentido a «por encima» de un plano en las recetas. */
export function normalQueSube(pl: Plano): P3 {
  const { n } = pl;
  const s = Math.abs(n.z) > 1e-9 ? Math.sign(n.z) : Math.abs(n.y) > 1e-9 ? Math.sign(n.y) : Math.sign(n.x);
  return por(n, s);
}

/** El ángulo entre dos rectas del espacio, de 0 a 90°. */
export const anguloRectas = (r: Recta3, s: Recta3): number => angulo01(Math.abs(escalar(r.d, s.d)));

/** El ángulo de una recta con un plano, de 0 a 90°: el complementario del que
 *  forma con la normal. */
export const anguloRectaPlano = (r: Recta3, pl: Plano): number =>
  Math.asin(Math.min(1, Math.abs(escalar(r.d, pl.n)))) * GRADOS;

/** El ángulo entre dos planos, de 0 a 90°: el de sus normales. */
export const anguloPlanos = (a: Plano, b: Plano): number => angulo01(Math.abs(escalar(a.n, b.n)));

/**
 * El ángulo diedro, de 0 a 180°: el de dos semiplanos que comparten la arista,
 * cada uno dado por un punto suyo fuera de ella. Es el que mide el
 * transportador sobre la sección recta del diedro, y no se queda en 90°.
 */
export function anguloDiedro(A: P3, arista: Recta3, B: P3): number {
  const u = resta(A, pieEnRecta(A, arista));
  const v = resta(B, pieEnRecta(B, arista));
  if (modulo(u) < 1e-9 || modulo(v) < 1e-9) throw new Error('un punto de cara está en la arista: no fija su semiplano');
  return angulo01(escalar(u, v) / (modulo(u) * modulo(v)));
}

/** El pie de la perpendicular desde P al plano. */
export const pieEnPlano = (P: P3, pl: Plano): P3 => resta(P, por(pl.n, escalar(pl.n, P) - pl.d));

/**
 * El pie en r de la perpendicular común a r y s; con los argumentos al revés,
 * el de s. Dos rectas paralelas tienen infinitas perpendiculares comunes:
 * lanza.
 */
export function pieComun(r: Recta3, s: Recta3): P3 {
  const b = escalar(r.d, s.d);
  const den = 1 - b * b;
  if (den < 1e-12) throw new Error('las rectas son paralelas: tienen infinitas perpendiculares comunes');
  const w = resta(r.p, s.p);
  const t = (b * escalar(s.d, w) - escalar(r.d, w)) / den;
  return suma(r.p, por(r.d, t));
}

/** La distancia entre dos rectas, en pt: si se cruzan, la de su perpendicular
 *  común; si son paralelas, la de un punto de una a la otra. */
export function distanciaRectas(r: Recta3, s: Recta3): number {
  const c = vectorial(r.d, s.d);
  const l = modulo(c);
  if (l < 1e-9) return distanciaARecta(r.p, s);
  return Math.abs(escalar(resta(s.p, r.p), c)) / l;
}

/** El plano mediador de AB: el de los puntos que equidistan de los dos. */
export function planoMediador(A: P3, B: P3): Plano {
  const n = unitario3(resta(B, A));
  return { n, d: escalar(n, por(suma(A, B), 0.5)) };
}

/** El punto donde la recta corta al plano. Si es paralela, no lo corta: lanza. */
export function corteRectaPlano(r: Recta3, pl: Plano): P3 {
  const c = escalar(pl.n, r.d);
  if (Math.abs(c) < 1e-12) throw new Error('la recta es paralela al plano: no lo corta');
  return suma(r.p, por(r.d, (pl.d - escalar(pl.n, r.p)) / c));
}

/** La perpendicular al plano por P. */
export const perpendicularAPlano = (P: P3, pl: Plano): Recta3 => ({ p: P, d: pl.n });

/** El plano perpendicular a la recta por P. */
export const planoPerpendicularARecta = (P: P3, r: Recta3): Plano => ({ n: r.d, d: escalar(r.d, P) });

/** El plano paralelo a una distancia `d` en pt: `lado` 1, hacia donde sube
 *  (`normalQueSube`); −1, al otro lado. */
export function paraleloADistancia(pl: Plano, d: number, lado: 1 | -1): Plano {
  const m = normalQueSube(pl);
  const dm = escalar(m, pl.n) > 0 ? pl.d : -pl.d;
  return { n: m, d: dm + lado * d };
}

/**
 * El abatimiento de P, que está en el plano, alrededor de una charnela del
 * plano: P abatido queda a su misma distancia de la charnela, en el plano
 * horizontal que la contiene si es una horizontal, o en el frontal si es una
 * frontal. Los dos lados valen, como en la lámina. Una charnela que no es ni
 * horizontal ni frontal no abate sobre ningún plano de proyección: lanza.
 */
export function abatido(P: P3, charnela: Recta3, pl: Plano): [P3, P3] {
  if (!enPlano(P, pl)) throw new Error(`el punto no está en el plano: queda a ${(distanciaAPlano(P, pl) * PT_MM).toFixed(2)} mm`);
  const fuera = Math.max(distanciaAPlano(charnela.p, pl), distanciaAPlano(suma(charnela.p, charnela.d), pl));
  if (fuera > TOL_VERTICAL) throw new Error('la charnela no está en el plano');
  const sobre: P3 | null =
    Math.abs(charnela.d.z) < 1e-9 ? { x: 0, y: 0, z: 1 } : Math.abs(charnela.d.y) < 1e-9 ? { x: 0, y: 1, z: 0 } : null;
  if (!sobre) throw new Error('la charnela no es horizontal ni frontal: no abate sobre un plano de proyección');
  const pie = pieEnRecta(P, charnela);
  const r = vm(P, pie);
  const dir = unitario3(vectorial(sobre, charnela.d));
  return [suma(pie, por(dir, r)), suma(pie, por(dir, -r))];
}

/** P girado `angulo` grados alrededor del eje, en el sentido de la regla de
 *  la mano derecha respecto de la dirección del eje (Rodrigues). */
export function gira(P: P3, eje: Recta3, angulo: number): P3 {
  const k = eje.d;
  const v = resta(P, eje.p);
  const a = angulo / GRADOS;
  const [c, s] = [Math.cos(a), Math.sin(a)];
  const giro = suma(suma(por(v, c), por(vectorial(k, v), s)), por(k, escalar(k, v) * (1 - c)));
  return suma(eje.p, giro);
}

/** El cuadrado del plano que tiene EF por diagonal: [E, G, F, H], en orden.
 *  E y F tienen que estar en el plano. */
export function cuadradoPorDiagonal(pl: Plano, E: P3, F: P3): [P3, P3, P3, P3] {
  for (const [Q, n] of [[E, 'E'], [F, 'F']] as const) {
    if (!enPlano(Q, pl)) throw new Error(`${n} no está en el plano: queda a ${(distanciaAPlano(Q, pl) * PT_MM).toFixed(2)} mm`);
  }
  const O = por(suma(E, F), 0.5);
  const h = vm(E, F) / 2;
  const w = unitario3(vectorial(pl.n, resta(F, E)));
  return [E, suma(O, por(w, h)), F, suma(O, por(w, -h))];
}

/** El ápice de una pirámide recta: sobre el centro de la base (la media de
 *  sus vértices, que en un polígono regular es su centro), a `altura` pt de su
 *  plano; `lado` 1, hacia donde sube (`normalQueSube`). */
export function apice(base: readonly P3[], altura: number, lado: 1 | -1): P3 {
  if (base.length < 3) throw new Error('una base necesita tres vértices al menos');
  const pl = plano(base[0], base[1], base[2]);
  const fuera = base.find((V) => !enPlano(V, pl));
  if (fuera) throw new Error('los vértices de la base no están en un plano');
  const c = por(base.reduce((a, V) => suma(a, V), { x: 0, y: 0, z: 0 }), 1 / base.length);
  return suma(c, por(normalQueSube(pl), lado * altura));
}

/* ─────── el lote 1 de la fase K: abatir una figura entera del mismo lado ─── */

/**
 * El abatimiento de P con el mismo giro que llevó Q a `Qab`: así toda una
 * figura abatida cae junta, y no cada punto por su lado. No basta «del mismo
 * lado que Qab»: si P y Q están a lados distintos de la charnela en su plano,
 * abatidos también lo están. Lo que se conserva es el giro.
 *
 * Q tiene que estar fuera de la charnela (si no, no fija el giro) y `Qab`
 * tiene que ser uno de los dos abatidos de Q (`abatido`): eso comprueba de una
 * vez que Q está en el plano, que la charnela es horizontal o frontal y que
 * Qab cae en el plano de proyección. Así una errata en una receta —`con: B`
 * en vez de `con: Bab`— lanza en vez de dar la figura sin abatir. P tiene que
 * estar en el plano. Lo pidieron k-ex53a (la sección abatida de la hoja
 * 53) y el comentario de `abatido` en las recetas.
 */
export function abatidoJunto(P: P3, charnela: Recta3, pl: Plano, Qab: P3, Q: P3): P3 {
  if (!enPlano(P, pl)) throw new Error(`el punto no está en el plano: queda a ${(distanciaAPlano(P, pl) * PT_MM).toFixed(2)} mm`);
  const pie = pieEnRecta(Q, charnela);
  const u = resta(Q, pie);
  const w = resta(Qab, pieEnRecta(Qab, charnela));
  if (modulo(u) < 1e-9) throw new Error('el punto de referencia está en la charnela: no fija el giro');
  if (!abatido(Q, charnela, pl).some((X) => vm(X, Qab) <= TOL_VERTICAL)) {
    throw new Error('el abatido de referencia no es ninguno de los dos abatidos de su punto');
  }
  const angulo = Math.atan2(escalar(charnela.d, vectorial(u, w)), escalar(u, w)) * GRADOS;
  return gira(P, charnela, angulo);
}

/* ─────── el lote 1 de la fase K: el cambio de plano del diédrico directo ─── */

/** Una recta de la lámina: un punto suyo y su dirección, en pt. */
export interface Recta2 {
  readonly p: P2;
  readonly d: P2;
}

/** Desde qué vista se hace el cambio de plano: el vertical sale de la planta y
 *  lleva cotas; el horizontal sale del alzado y lleva alejamientos. */
export type CambioDePlano = 'vertical' | 'horizontal';

/** Una vista de dos: cómo se lee la proyección de un punto en ella, y qué
 *  distancia lleva ese punto a la vista nueva. */
interface Vista {
  readonly proyeccion: (P: P3) => P2;
  readonly distancia: (P: P3) => number;
}

const pie2 = (Q: P2, r: Recta2): P2 => {
  const u = unitario2(r.d);
  const t = (Q[0] - r.p[0]) * u[0] + (Q[1] - r.p[1]) * u[1];
  return [r.p[0] + u[0] * t, r.p[1] + u[1] * t];
};

/** La normal a la línea nueva hacia el lado contrario al de la vista de
 *  partida, que es donde va la vista nueva. La referencia decide el lado: su
 *  proyección no puede caer en la línea. */
function haciaFuera(linea: Recta2, desde: P2, quien: string): P2 {
  if (Math.hypot(linea.d[0], linea.d[1]) < 1e-9) throw new Error(`${quien}: la línea nueva no tiene dirección`);
  const n = perpendicular2(unitario2(linea.d));
  const lado = (desde[0] - linea.p[0]) * n[0] + (desde[1] - linea.p[1]) * n[1];
  if (Math.abs(lado) < TOL_VERTICAL) throw new Error(`${quien}: la línea nueva pasa por la proyección de la referencia, y no se sabe hacia qué lado va la vista nueva`);
  return lado > 0 ? [-n[0], -n[1]] : n;
}

/** Un cambio de plano: la vista nueva que sale de `vista`, con la línea nueva y
 *  la referencia R, que cae en la línea. Devuelve la vista nueva, para poder
 *  encadenar el segundo cambio. */
function cambia(vista: Vista, linea: Recta2, R: P3, quien: string): Vista {
  const n = haciaFuera(linea, vista.proyeccion(R), quien);
  const proyeccion = (P: P3): P2 => {
    const pie = pie2(vista.proyeccion(P), linea);
    const h = vista.distancia(P) - vista.distancia(R);
    return [pie[0] + n[0] * h, pie[1] + n[1] * h];
  };
  /* En el sistema nuevo, la distancia que llevaría un segundo cambio es la de
     la proyección de partida a la línea nueva, contada hacia la vista de
     partida: es el alejamiento (o la cota) del sistema nuevo. */
  const distancia = (P: P3): number => {
    const Q = vista.proyeccion(P);
    return -((Q[0] - linea.p[0]) * n[0] + (Q[1] - linea.p[1]) * n[1]);
  };
  return { proyeccion, distancia };
}

/**
 * La proyección de P en la vista auxiliar de un cambio de plano, como lo
 * enseñan las diapositivas del curso («Cambios de plano», §3): en diédrico
 * directo no hay línea de tierra, así que la vista nueva se fija con una
 * referencia R, que cae en la línea nueva, y los demás puntos llevan su cota (o
 * su alejamiento) contada desde la de R.
 *
 * - `vertical`: cada punto sale de su planta por la perpendicular a la línea
 *   nueva y se aparta de ella su cota menos la de R, hacia el lado contrario a
 *   la planta.
 * - `horizontal`: lo mismo desde el alzado, con el alejamiento.
 * - `luego`, una segunda línea: el segundo cambio, del tipo contrario, que
 *   sale de la vista auxiliar. Así se pasa un plano oblicuo a proyectante y
 *   después a paralelo, y se ve en verdadera magnitud. La distancia que lleva
 *   es la de la proyección de partida a la primera línea.
 * - `R2`, la referencia del segundo cambio, si no es la del primero: las
 *   diapositivas usan B en los dos cambios en un ejemplo (diap. 13) y A en el
 *   primero y B en el segundo en otro (diap. 14).
 *
 * Lo pidieron la prosa del tema 3 y los Ejercicios 17, 19, 20 y 21 de la
 * colección (SD22, SD25, SD26, SD28), que piden la verdadera magnitud de un
 * plano por cambio de plano.
 */
export function cambioPlano(P: P3, tipo: CambioDePlano, linea: Recta2, R: P3, luego?: Recta2, R2: P3 = R): P2 {
  const planta: Vista = { proyeccion: proyPlanta, distancia: (Q) => Q.z };
  const alzado: Vista = { proyeccion: proyAlzado, distancia: (Q) => Q.y };
  const primera = cambia(tipo === 'vertical' ? planta : alzado, linea, R, 'el primer cambio');
  return (luego ? cambia(primera, luego, R2, 'el segundo cambio') : primera).proyeccion(P);
}

/* ─────── el lote 2 de la fase K: las figuras regulares en un plano ─────── */

/**
 * Los vértices del polígono regular de `lados` lados que está en el plano,
 * tiene su centro en `centro` y uno de sus vértices en `vertice`, en orden:
 * el primero es `vertice`, y los demás siguen girando alrededor de la normal
 * del plano que sube (`normalQueSube`). Lo piden el triángulo equilátero del
 * Ejercicio 21 (SD28), el rombo, el cuadrado y el hexágono de los
 * ejercicios 7 a 10, 48 y 49 de la colección. El centro y el vértice tienen
 * que estar en el plano.
 */
export function poligonoRegular(pl: Plano, centro: P3, vertice: P3, lados: number): P3[] {
  if (!Number.isInteger(lados) || lados < 3) throw new Error('un polígono regular tiene tres lados o más');
  for (const [Q, n] of [[centro, 'el centro'], [vertice, 'el vértice']] as const) {
    if (!enPlano(Q, pl)) throw new Error(`${n} no está en el plano: queda a ${(distanciaAPlano(Q, pl) * PT_MM).toFixed(2)} mm`);
  }
  if (vm(centro, vertice) < 1e-6) throw new Error('el vértice es el centro: el polígono no tiene tamaño');
  const eje: Recta3 = { p: centro, d: normalQueSube(pl) };
  return Array.from({ length: lados }, (_, k) => gira(vertice, eje, (360 * k) / lados));
}
