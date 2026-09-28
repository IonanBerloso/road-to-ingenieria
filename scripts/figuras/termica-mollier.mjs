/**
 * El diagrama de Mollier del agua —la entalpía frente a la entropía—,
 * calculado, para la página de tablas de Ingeniería Térmica.
 *
 * La pregunta que responde (§13): dónde acaba una expansión en una turbina y
 * con qué título. En el diagrama h-s una isentrópica es una vertical, así que
 * el estado de salida se lee bajando desde el de entrada hasta la isobara de
 * salida, y se ve de un vistazo si cae dentro de la campana.
 *
 * La prueba de utilidad (§13):
 * - Para quién: quien estudia Térmica con el anexo del curso delante, que
 *   trae un diagrama de Mollier con este mismo recuadro —s de 4 a 10, h de
 *   1800 a 4000— que la página de tablas del sitio no tenía.
 * - Cuándo: al leer el estado de salida de una turbina o de una tobera, y al
 *   comprobar con el dibujo una cuenta hecha con las tablas.
 * - Qué gana: la lectura que el examen hace en el diagrama del anexo,
 *   practicada sobre uno que no es una fotocopia, y un contraste rápido de las
 *   tablas: un h leído aquí muy distinto del de la cuenta avisa de una
 *   columna o de una presión equivocadas.
 * - Cómo se comprueba: abajo, en «el cotejo con las tablas».
 *
 * Se calcula con IAPWS-95 (`src/lib/iapws95.ts`), la formulación de las
 * tablas de la misma página, y no se copia del anexo, que es de una
 * editorial (§08):
 *
 * - la saturación, con `saturacion(T)` desde 0,01 °C hasta 10⁻⁵ K del punto
 *   crítico —a 10⁻⁶ K la iteración ya no converge y devuelve NaN— y el punto
 *   crítico como límite de la ecuación en ρc y Tc, donde sus términos no
 *   analíticos dan 0/0;
 * - las isobaras, rectas dentro de la campana, de (s', h') a (s'', h''), y con
 *   `estadoDePT` fuera de ella; la de 500 bar, que pasa de la presión crítica,
 *   de una pieza;
 * - las isotermas, con `estadoDePT` desde presiones casi nulas hasta la
 *   saturación, o hasta 500 bar las que pasan de la temperatura crítica: es la
 *   isobara más alta del dibujo, y más allá no queda nada que leer;
 * - las líneas de título, s = s' + x·(s'' − s') y lo mismo con h, de 0,01 °C
 *   al punto crítico, donde se juntan todas. Terminan abajo en la línea del
 *   punto triple, que cierra la campana: por debajo de 0,01 °C no hay líquido.
 *
 * Cada curva se muestrea donde hace falta —un tramo se parte mientras mida
 * más de ocho píxeles o su punto medio se aparte de la cuerda más de una
 * décima de píxel— y se recorta al recuadro buscando el corte con el borde
 * por bisección sobre el parámetro de la curva: el lienzo se para si un
 * punto se sale del viewBox.
 *
 * El cotejo con las tablas. Cada punto de `src/content/tablas/vapor-de-agua.json`
 * que cae dentro del recuadro y sobre una curva dibujada tiene que quedar a
 * menos de medio píxel de ella: la isobara de 1 bar corta la saturación en
 * h'' = 2674,9 y s'' = 7,3588, y la de 10 bar pasa a 500 °C por h = 3479,1 y
 * s = 7,7641. Y los rótulos ni se pisan entre sí ni tocan una curva que no
 * sea la suya: cada uno se mide por lo alto, como mide el lienzo (§17), y
 * girado si va girado. Si algo de esto falla, el guion se para.
 *
 *     node scripts/figuras/termica-mollier.mjs
 *
 * escribe `src/content/tablas/vapor-de-agua-mollier.svg`. Importado, exporta
 * `mollier()`, que devuelve ese mismo texto: así una prueba puede volver a
 * generarlo y compararlo con el publicado.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as agua from '../../src/lib/iapws95.ts';
import { lienzo } from './lienzo.mjs';

const ID = 'mollier';
const DESTINO = new URL('../../src/content/tablas/vapor-de-agua-mollier.svg', import.meta.url);
const TABLAS = new URL('../../src/content/tablas/vapor-de-agua.json', import.meta.url);

/* ── lo que se dibuja ─────────────────────────────────────────────────── */

/** Bar. La serie 1-2-5, de la presión de un condensador a la de una caldera
 *  supercrítica. La de 500 bar es la única que pasa de la crítica. */
const ISOBARAS = [0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500];
/** °C. De cien en cien, que se leen sin empastar el vapor sobrecalentado.
 *  La de 800 °C no se dibuja: solo entra en el recuadro por encima de 342 bar,
 *  en un trozo de dos décimas de s sin sitio para su rótulo. */
const ISOTERMAS = [100, 200, 300, 400, 500, 600, 700];
const TITULOS = [0.8, 0.85, 0.9, 0.95];

/* ── el recuadro del anexo y su escala ────────────────────────────────── */

const S0 = 4;
const S1 = 10; //   kJ/(kg·K)
const H0 = 1800;
const H1 = 4000; // kJ/kg
const ANCHO = 680;
/* Con 640 de alto, los rótulos de 0,02 y 0,05 bar no cabían entre dos
   isotermas y tenían que cruzar una; con 680 caben todos. */
const ALTO = 680;
/* Márgenes en píxeles: a la izquierda y abajo, los números de los ejes; a la
   derecha, los rótulos de las isotermas, que salen todas por s = 10. */
const IZQ = 48;
const DER = 56;
const ARR = 12;
const ABA = 26;
const ES = (ANCHO - IZQ - DER) / (S1 - S0); // px por kJ/(kg·K)
const EH = (ALTO - ARR - ABA) / (H1 - H0); //  px por kJ/kg
const px = ([s, h]) => [IZQ + (s - S0) * ES, ALTO - ABA - (h - H0) * EH];

/* ── el agua ──────────────────────────────────────────────────────────── */

const K = 273.15;
const T_TRIPLE = 273.16; // 0,01 °C
/* Lo más cerca del punto crítico que converge `saturacion`. */
const T_CASI = agua.TC - 1e-5;
/* La isobara más alta, en MPa, y la temperatura más alta que se evalúa:
   IAPWS-95 vale hasta 1273 K, y ninguna curva la necesita más allá de 830 °C
   para salir del recuadro. */
const P_TOPE = 50;
const T_TOPE = 1000 + K;

const MPa = (bar) => bar / 10;
const sh = (e) => [e.s, e.h];

/** Se para si algo que el dibujo afirma no es cierto. */
function exige(condicion, mensaje) {
  if (!condicion) throw new Error(`termica-mollier: ${mensaje}`);
}

/** Un número con coma decimal, para los rótulos y la descripción. */
const coma = (v, d) => (d === undefined ? String(v) : v.toFixed(d)).replace('.', ',');

const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* La saturación se pide muchas veces a la misma temperatura: la curva y las
   cuatro líneas de título comparten muestras. */
const guardadas = new Map();
function sat(T) {
  let r = guardadas.get(T);
  if (!r) {
    r = agua.saturacion(T);
    guardadas.set(T, r);
  }
  return r;
}

/**
 * El punto crítico. En ρ = ρc y T = Tc exactos los términos no analíticos de
 * IAPWS-95 dan 0/0, pero h y s son continuas: se toma la media a un lado y a
 * otro de ρc, que a 10⁻⁸ ya coinciden en todas las cifras que se dibujan.
 */
function puntoCritico() {
  const a = agua.estadoDeRhoT(agua.RHOC * (1 + 1e-8), agua.TC);
  const b = agua.estadoDeRhoT(agua.RHOC * (1 - 1e-8), agua.TC);
  const c = { s: (a.s + b.s) / 2, h: (a.h + b.h) / 2, p: (a.p + b.p) / 2 };
  const v = sat(T_CASI).vapor;
  exige(Number.isFinite(c.s) && Math.abs(c.s - v.s) < 0.01 && Math.abs(c.h - v.h) < 2, 'el punto crítico no casa con la saturación');
  return c;
}

/* ── muestrear y recortar ─────────────────────────────────────────────── */

const dentro = ([s, h]) => s >= S0 && s <= S1 && h >= H0 && h <= H1;

/** Los dos extremos fuera y por el mismo lado: el tramo no toca el recuadro. */
const fueraJuntos = ([sa, ha], [sb, hb]) =>
  (sa < S0 && sb < S0) || (sa > S1 && sb > S1) || (ha < H0 && hb < H0) || (ha > H1 && hb > H1);

/** Distancia en píxeles de p a la recta que pasa por a y b. */
function aLaCuerda(p, a, b) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  if (L < 1e-9) return Math.hypot(p[0] - a[0], p[1] - a[1]);
  return Math.abs((b[0] - a[0]) * (a[1] - p[1]) - (a[0] - p[0]) * (b[1] - a[1])) / L;
}

/**
 * Una curva t → [s, h], muestreada donde hace falta: cada tramo se parte
 * mientras mida más de `paso` píxeles o su punto medio se aparte de la
 * cuerda más de `tol`. Lo que cae entero fuera del recuadro no se refina.
 */
function muestrea(F, [a, b], { n = 48, paso = 8, tol = 0.1 } = {}) {
  const puntos = [{ t: a, q: F(a) }];
  const parte = (A, B, prof) => {
    if (prof < 22 && !fueraJuntos(A.q, B.q)) {
      const tm = (A.t + B.t) / 2;
      const C = { t: tm, q: F(tm) };
      const [pa, pb, pc] = [px(A.q), px(B.q), px(C.q)];
      if (Math.hypot(pb[0] - pa[0], pb[1] - pa[1]) > paso || aLaCuerda(pc, pa, pb) > tol) {
        parte(A, C, prof + 1);
        parte(C, B, prof + 1);
        return;
      }
    }
    puntos.push(B);
  };
  for (let k = 1; k <= n; k++) {
    const t = a + ((b - a) * k) / n;
    parte(puntos[puntos.length - 1], { t, q: F(t) }, 0);
  }
  return puntos;
}

/** Dónde cruza la curva el borde entre un punto de dentro y uno de fuera,
 *  por bisección sobre el parámetro; devuelve el punto, pegado al borde. */
function borde(F, de, a) {
  let [t0, t1] = [de.t, a.t];
  for (let k = 0; k < 40; k++) {
    const tm = (t0 + t1) / 2;
    if (dentro(F(tm))) t0 = tm;
    else t1 = tm;
  }
  const [s, h] = F(t0);
  return [Math.min(Math.max(s, S0), S1), Math.min(Math.max(h, H0), H1)];
}

/** Los trozos de una curva muestreada que caen dentro del recuadro. */
function recorta(F, puntos) {
  const trozos = [];
  let actual = dentro(puntos[0].q) ? [puntos[0].q] : null;
  for (let k = 1; k < puntos.length; k++) {
    const A = puntos[k - 1];
    const B = puntos[k];
    const [da, db] = [dentro(A.q), dentro(B.q)];
    if (da && db) actual.push(B.q);
    else if (da) {
      actual.push(borde(F, A, B));
      trozos.push(actual);
      actual = null;
    } else if (db) actual = [borde(F, B, A), B.q];
  }
  if (actual) trozos.push(actual);
  return trozos.filter((t) => t.length > 1);
}

/** Ramer-Douglas-Peucker en píxeles: quita los puntos que no mueven el dibujo. */
function simplifica(qs, tol = 0.12) {
  if (qs.length < 3) return qs;
  const [a, b] = [px(qs[0]), px(qs[qs.length - 1])];
  let peor = -1;
  let donde = 0;
  for (let i = 1; i < qs.length - 1; i++) {
    const d = aLaCuerda(px(qs[i]), a, b);
    if (d > peor) [peor, donde] = [d, i];
  }
  if (peor <= tol) return [qs[0], qs[qs.length - 1]];
  return [...simplifica(qs.slice(0, donde + 1), tol).slice(0, -1), ...simplifica(qs.slice(donde), tol)];
}

/** Muestrea, recorta y simplifica: los trozos que se dibujan. */
const traza = (F, rango, op) => recorta(F, muestrea(F, rango, op)).map((t) => simplifica(t));

/* ── las curvas ───────────────────────────────────────────────────────── */

/** La saturación entera, de la rama del líquido a la del vapor pasando por
 *  el punto crítico, y la línea del punto triple que cierra la campana. */
function saturacion(C) {
  const critico = [C.s, C.h];
  const liquido = (T) => (T >= T_CASI ? critico : sh(sat(T).liquido));
  const vapor = (T) => (T >= T_CASI ? critico : sh(sat(T).vapor));
  /* La rama del líquido solo entra en el recuadro a partir de unos 365 °C. */
  const [ramaL] = traza(liquido, [340 + K, T_CASI]);
  const [ramaV] = traza(vapor, [T_TRIPLE, T_CASI]);
  exige(ramaL && ramaV, 'falta una rama de la saturación');
  /* Las dos ramas acaban en el punto crítico: se une la del líquido, de
     subida, con la del vapor dada la vuelta y sin repetirlo. */
  const curva = [...ramaL, ...[...ramaV].reverse().slice(1)];
  const t = sat(T_TRIPLE);
  const recta = (u) => [t.liquido.s + u * (t.vapor.s - t.liquido.s), t.liquido.h + u * (t.vapor.h - t.liquido.h)];
  const [triple] = traza(recta, [0, 1], { n: 1 });
  return { curva, triple, finVapor: sh(t.vapor) };
}

/** Una isobara: la recta de la campana y, pegada a ella, la curva del vapor.
 *  Por encima de la presión crítica no hay campana, y va de una pieza. */
function isobara(bar, C) {
  const p = MPa(bar);
  const vapor = (T) => sh(agua.estadoDePT(p, T));
  if (p >= C.p) return traza(vapor, [350 + K, T_TOPE]);
  const s = agua.saturacionDeP(p);
  const [L, V] = [sh(s.liquido), sh(s.vapor)];
  const recta = (u) => [L[0] + u * (V[0] - L[0]), L[1] + u * (V[1] - L[1])];
  const humedo = traza(recta, [0, 1], { n: 1 });
  const seco = traza((T) => (T <= s.T ? V : vapor(T)), [s.T, T_TOPE]);
  exige(humedo.length === 1 && seco.length === 1, `la isobara de ${bar} bar sale y vuelve a entrar`);
  return [[...humedo[0], ...seco[0].slice(1)]];
}

/** Una isoterma: de presiones casi nulas a la saturación, o a 500 bar. */
function isoterma(grados) {
  const T = grados + K;
  const bajo = T < agua.TC;
  const pFin = bajo ? sat(T).p : P_TOPE;
  const fin = bajo ? sh(sat(T).vapor) : sh(agua.estadoDePT(P_TOPE, T));
  const F = (u) => (u >= Math.log(pFin) ? fin : sh(agua.estadoDePT(Math.exp(u), T)));
  return traza(F, [Math.log(1e-6), Math.log(pFin)]);
}

/** Una línea de título, de 0,01 °C al punto crítico. */
function titulo(x, C) {
  const F = (T) => {
    if (T >= T_CASI) return [C.s, C.h];
    const { liquido: l, vapor: v } = sat(T);
    return [l.s + x * (v.s - l.s), l.h + x * (v.h - l.h)];
  };
  return traza(F, [T_TRIPLE, T_CASI]);
}

/* ── el cotejo con las tablas ─────────────────────────────────────────── */

/** Distancia en píxeles de un punto [s, h] a la más cercana de unas
 *  poligonales en [s, h]. */
function aLaCurva(q, trozos) {
  const p = px(q);
  let mejor = Infinity;
  for (const t of trozos) {
    for (let i = 1; i < t.length; i++) {
      const [a, b] = [px(t[i - 1]), px(t[i])];
      const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
      const L2 = dx * dx + dy * dy;
      const u = L2 ? Math.min(1, Math.max(0, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L2)) : 0;
      mejor = Math.min(mejor, Math.hypot(a[0] + u * dx - p[0], a[1] + u * dy - p[1]));
    }
  }
  return mejor;
}

/**
 * Cada punto de las tablas de la página que cae en el recuadro y sobre una
 * curva dibujada, a menos de medio píxel de ella. Devuelve cuántos se han
 * cotejado, para poder decir que no han sido cero.
 */
function cotejaConLasTablas({ isobaras, isotermas, titulos }) {
  const tablas = JSON.parse(readFileSync(TABLAS, 'utf8'));
  const col = (tabla, id) => tabla.columnas.findIndex((c) => c.id === id);
  const MAX = 0.5;
  let n = 0;
  const cerca = (q, trozos, que) => {
    if (!dentro(q)) return;
    const d = aLaCurva(q, trozos);
    exige(d <= MAX, `${que}: el punto (${q[0]}, ${q[1]}) de las tablas queda a ${d.toFixed(2)} px de su curva`);
    n++;
  };
  const sp = tablas.saturacionP;
  const [iP, iHl, iHv, iSl, iSv] = ['p', 'hl', 'hv', 'sl', 'sv'].map((id) => col(sp, id));
  for (const f of sp.filas) {
    const trozos = isobaras.get(f[iP]);
    if (!trozos) continue;
    cerca([f[iSv], f[iHv]], trozos, `isobara de ${f[iP]} bar en la saturación`);
    for (const [x, lineas] of titulos) {
      const q = [f[iSl] + x * (f[iSv] - f[iSl]), f[iHl] + x * (f[iHv] - f[iHl])];
      cerca(q, trozos, `isobara de ${f[iP]} bar con título ${x}`);
      cerca(q, lineas, `línea de título ${x} a ${f[iP]} bar`);
    }
  }
  const sc = tablas.sobrecalentado;
  const [iT, iH, iS] = ['T', 'h', 's'].map((id) => col(sc, id));
  for (const b of sc.bloques) {
    for (const f of b.filas) {
      const q = [f[iS], f[iH]];
      if (isobaras.has(b.p)) cerca(q, isobaras.get(b.p), `isobara de ${b.p} bar a ${f[iT]} °C`);
      if (isotermas.has(f[iT]) && b.p <= P_TOPE * 10) cerca(q, isotermas.get(f[iT]), `isoterma de ${f[iT]} °C a ${b.p} bar`);
    }
  }
  exige(n > 100, `solo se han cotejado ${n} puntos con las tablas`);
  return n;
}

/**
 * Las dos lecturas que se hacen primero, contra `estadoDePT` y no contra la
 * tabla redondeada: la isobara de 1 bar corta la saturación en su (s'', h''),
 * y el estado de 10 bar y 500 °C está a la vez en su isobara y en su
 * isoterma. Devuelve a cuántos píxeles queda cada una.
 */
function lecturas({ isobaras, isotermas }) {
  const v = agua.saturacionDeP(MPa(1)).vapor;
  const e = agua.estadoDePT(MPa(10), 500 + K);
  const r = {
    '1 bar en la saturación': aLaCurva([v.s, v.h], isobaras.get(1)),
    '10 bar y 500 °C, en la isobara': aLaCurva([e.s, e.h], isobaras.get(10)),
    '10 bar y 500 °C, en la isoterma': aLaCurva([e.s, e.h], isotermas.get(500)),
  };
  for (const [que, d] of Object.entries(r)) exige(d <= 0.5, `${que}: a ${d.toFixed(2)} px de la curva`);
  return r;
}

/* ── los rótulos ──────────────────────────────────────────────────────── */

/* Cómo se mide un rótulo de 10 px: 7,5 px por letra, de 8 px por encima de la
   línea base a 3 por debajo. Es la medida por lo alto del lienzo, que no
   depende de la máquina (§17). */
const LETRA = 7.5;
const SOBRE = 8;
const BAJO = 3;

const r1 = (n) => {
  const v = Math.round(n * 10) / 10;
  return Object.is(v, -0) ? 0 : v;
};

/** Las cuatro esquinas de un rótulo en píxeles, girado `ang` grados. */
function esquinas(x, y, texto, ang, anclaje) {
  const w = [...texto].length * LETRA;
  const u0 = anclaje === 'end' ? -w : anclaje === 'middle' ? -w / 2 : 0;
  const [c, s] = [Math.cos((ang * Math.PI) / 180), Math.sin((ang * Math.PI) / 180)];
  return [[u0, -SOBRE], [u0 + w, -SOBRE], [u0 + w, BAJO], [u0, BAJO]].map(([u, v]) => [x + u * c - v * s, y + u * s + v * c]);
}

/** ¿Se tocan dos rectángulos girados? Ejes separadores, con un píxel de aire. */
function sePisan(a, b, aire = 1) {
  for (const pol of [a, b]) {
    for (let i = 0; i < 4; i++) {
      const [p, q] = [pol[i], pol[(i + 1) % 4]];
      const L = Math.hypot(q[0] - p[0], q[1] - p[1]);
      const n = [(q[1] - p[1]) / L, (p[0] - q[0]) / L];
      const proy = (pts) => pts.map(([x, y]) => x * n[0] + y * n[1]);
      const [pa, pb] = [proy(a), proy(b)];
      if (Math.max(...pa) + aire <= Math.min(...pb) || Math.max(...pb) + aire <= Math.min(...pa)) return false;
    }
  }
  return true;
}

/**
 * Lleva la cuenta de los rótulos puestos. Cada uno nuevo tiene que caber en
 * el viewBox —y en el recuadro, si va dentro— y no puede pisar a ninguno de
 * los anteriores. Es lo que impide que el dibujo quede empastado sin que
 * nadie lo mire.
 */
function registro() {
  const puestos = [];
  return {
    pon(nombre, caja, enElRecuadro) {
      for (const [x, y] of caja) {
        exige(x >= -0.5 && x <= ANCHO + 0.5 && y >= -0.5 && y <= ALTO + 0.5, `el rótulo «${nombre}» se sale del viewBox`);
        if (enElRecuadro) {
          exige(x >= IZQ && x <= ANCHO - DER && y >= ARR && y <= ALTO - ABA, `el rótulo «${nombre}» se sale del recuadro`);
        }
      }
      const otro = puestos.find((p) => sePisan(caja, p.caja));
      exige(!otro, `los rótulos «${nombre}» y «${otro?.nombre}» se pisan`);
      puestos.push({ nombre, caja });
    },
    get cuantos() {
      return puestos.length;
    },
  };
}

/**
 * ¿Toca alguna de las curvas —poligonales en píxeles— la caja de un rótulo
 * girado? Cada tramo se pasa a los ejes del rótulo, donde la caja es un
 * rectángulo recto; los que caen lejos se descartan antes.
 */
function tocaRotulo({ x, y, texto, ang = 0, anclaje = 'start' }, curvas) {
  const w = [...texto].length * LETRA;
  const u0 = anclaje === 'end' ? -w : anclaje === 'middle' ? -w / 2 : 0;
  const [c, s] = [Math.cos((ang * Math.PI) / 180), Math.sin((ang * Math.PI) / 180)];
  const local = ([px0, py0]) => [(px0 - x) * c + (py0 - y) * s, -(px0 - x) * s + (py0 - y) * c];
  const caja = [u0, -SOBRE, u0 + w, BAJO];
  const R = w + SOBRE + BAJO;
  const lejos = (p, q) =>
    (p[0] < x - R && q[0] < x - R) || (p[0] > x + R && q[0] > x + R) || (p[1] < y - R && q[1] < y - R) || (p[1] > y + R && q[1] > y + R);
  return curvas.some((t) => t.some((q, i) => i > 0 && !lejos(t[i - 1], q) && tocaCaja(local(t[i - 1]), local(q), caja)));
}

const dentroDelRecuadro = (caja) => caja.every(([x, y]) => x >= IZQ && x <= ANCHO - DER && y >= ARR && y <= ALTO - ABA);

/** Un rótulo en píxeles, girado o no, con su halo de papel. Si lleva
 *  `evita` —curvas en píxeles—, no puede tocar ninguna de ellas. */
function rotula(l, reg, { x, y, texto, color, ang = 0, anclaje = 'start', clase = 'e', enElRecuadro = true, evita = [] }) {
  exige(!tocaRotulo({ x, y, texto, ang, anclaje }, evita), `el rótulo «${texto}» pisa una curva que no es la suya`);
  reg.pon(texto, esquinas(x, y, texto, ang, anclaje), enElRecuadro);
  const [X, Y, A] = [r1(x), r1(y), r1(ang)];
  const ancla = anclaje === 'start' ? '' : ` text-anchor="${anclaje}"`;
  const giro = A ? ` transform="rotate(${A} ${X} ${Y})"` : '';
  l.crudo(`<text class="${ID}-${clase}" x="${X}" y="${Y}"${ancla} fill="${color}"${giro}>${esc(texto)}</text>`);
}

/**
 * El sitio de un rótulo a lo largo de una curva en píxeles: su línea base es
 * la cuerda del tramo de curva que ocupa —que empieza a `desde` píxeles del
 * principio, acaba a `desdeFinal` del final o se centra en `centro`— y se
 * separa de ella hacia arriba de la letra (`lado` 1) o hacia abajo (−1). Se
 * lee siempre de izquierda a derecha.
 */
function sobreLaCurva(pts, texto, { desde, desdeFinal, centro, lado = 1, sep = 1.5 }) {
  const acum = [0];
  for (let i = 1; i < pts.length; i++) acum.push(acum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = acum[acum.length - 1];
  const en = (d) => {
    exige(d >= 0 && d <= total, `el rótulo «${texto}» no cabe a lo largo de su curva`);
    let i = 1;
    while (i < pts.length - 1 && acum[i] < d) i++;
    const u = (d - acum[i - 1]) / (acum[i] - acum[i - 1] || 1);
    return [pts[i - 1][0] + u * (pts[i][0] - pts[i - 1][0]), pts[i - 1][1] + u * (pts[i][1] - pts[i - 1][1])];
  };
  const largo = [...texto].length * LETRA;
  const d0 = centro !== undefined ? centro - largo / 2 : desde ?? total - desdeFinal - largo;
  let [a, b] = [en(d0), en(d0 + largo)];
  if (b[0] < a[0]) [a, b] = [b, a];
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const n = [Math.sin(ang), -Math.cos(ang)];
  const d = lado > 0 ? sep + BAJO : -(sep + SOBRE);
  return { x: a[0] + d * n[0], y: a[1] + d * n[1], ang: (ang * 180) / Math.PI };
}

/** La longitud de una poligonal en píxeles. */
const longitud = (pts) => pts.reduce((L, p, i) => (i ? L + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0);

/** A qué distancia del principio de una curva en píxeles, medida a lo largo
 *  de ella, está su punto más cercano a p. */
function arco(pts, p) {
  let [mejor, donde, acum] = [Infinity, 0, 0];
  for (let i = 1; i < pts.length; i++) {
    const [a, b] = [pts[i - 1], pts[i]];
    const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
    const L = Math.hypot(dx, dy);
    const u = L ? Math.min(1, Math.max(0, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (L * L))) : 0;
    const dist = Math.hypot(a[0] + u * dx - p[0], a[1] + u * dy - p[1]);
    if (dist < mejor) [mejor, donde] = [dist, acum + u * L];
    acum += L;
  }
  return donde;
}

/**
 * El sitio del rótulo de una isobara. Se recorre su tramo de vapor desde el
 * final hacia atrás hasta el primer hueco donde el rótulo, medido por lo
 * alto, no toca ninguna otra curva, y se centra en ese hueco: queda entre dos
 * isotermas y su halo no corta ninguna. Puestos todos arriba del todo, siete
 * partían la isoterma de 700 °C, que parecía discontinua, que es como se
 * dibujan las líneas de título.
 *
 * Si no hay hueco —a las presiones más bajas las isotermas se juntan—, va
 * junto al final de la curva y se le deja cruzar isotermas, que llevan su
 * nombre en el margen y no se confunden por un corte; otras isobaras, no.
 */
function sitioDeIsobara(pts, texto, { desde, ajenas, isotermas }) {
  const largo = [...texto].length * LETRA;
  const vale = (c) => {
    const s = sobreLaCurva(pts, texto, { centro: c });
    return dentroDelRecuadro(esquinas(s.x, s.y, texto, s.ang, 'start')) && !tocaRotulo({ ...s, texto }, ajenas);
  };
  const PASO = 2;
  let [fin, ini] = [null, null];
  for (let c = longitud(pts) - largo / 2; c >= desde + largo / 2; c -= PASO) {
    if (vale(c)) [fin, ini] = [fin ?? c, c];
    else if (fin !== null) break;
  }
  /* Centrado en el hueco, pero sin bajar más de 12 px desde lo más alto que
     cabe: el de 500 bar tiene libre todo su lado izquierdo, y centrado se
     iba a media altura, lejos de los demás. */
  if (fin !== null) return { ...sobreLaCurva(pts, texto, { centro: Math.max((fin + ini) / 2, fin - 12) }), evita: ajenas };
  return { ...sobreLaCurva(pts, texto, { desdeFinal: 10 }), evita: ajenas.filter((c) => !isotermas.includes(c)) };
}

/** ¿Toca el segmento ab el rectángulo [x0, y0, x1, y1]? En píxeles, por
 *  Liang-Barsky. */
function tocaCaja([ax, ay], [bx, by], [x0, y0, x1, y1]) {
  let [t0, t1] = [0, 1];
  const [dx, dy] = [bx - ax, by - ay];
  for (const [p, q] of [[-dx, ax - x0], [dx, x1 - ax], [-dy, ay - y0], [dy, y1 - ay]]) {
    if (p === 0) {
      if (q < 0) return false;
      continue;
    }
    const r = q / p;
    if (p < 0) {
      if (r > t1) return false;
      t0 = Math.max(t0, r);
    } else {
      if (r < t0) return false;
      t1 = Math.min(t1, r);
    }
  }
  return true;
}

/** Ninguna de las curvas, en píxeles, cruza el rectángulo. */
const libre = (caja, curvas) => !curvas.some((c) => c.some((p, i) => i > 0 && tocaCaja(c[i - 1], p, caja)));

/**
 * El rótulo del punto crítico. Junto al punto no cabe: la isobara de 500 bar
 * y la isoterma de 400 °C pasan a menos de 11 px por su izquierda, y por la
 * derecha está la campana. Se sube desde el punto hasta el primer sitio donde
 * sus dos líneas no tocan ninguna curva —más allá de la isobara de 500 bar no
 * hay estados dibujados— y una guía lo une al punto.
 */
function rotuloCritico(l, reg, C, curvas) {
  const [xc, yc] = px([C.s, C.h]);
  const x = IZQ + 5;
  const [arriba, abajo] = ['punto', 'crítico'];
  const ancho = Math.max(arriba.length, abajo.length) * LETRA;
  const INTERLINEA = 13;
  for (let y = yc - 14; y > ARR + INTERLINEA + SOBRE; y--) {
    if (!libre([x - 3, y - INTERLINEA - SOBRE - 3, x + ancho + 3, y + BAJO + 3], curvas)) continue;
    rotula(l, reg, { x, y: y - INTERLINEA, texto: arriba, color: 'var(--ink)', evita: curvas });
    rotula(l, reg, { x, y, texto: abajo, color: 'var(--ink)', evita: curvas });
    const xg = Math.min(Math.max(xc, x + 4), x + ancho - 4);
    l.crudo(`<path class="${ID}-guia" d="M${r1(xc)} ${r1(yc - 5)}L${r1(xg)} ${r1(y + BAJO + 2)}"/>`);
    return;
  }
  exige(false, 'no hay sitio para el rótulo del punto crítico');
}

/* ── la descripción ───────────────────────────────────────────────────── */

/** El máximo de h'' en la rama del vapor, por sección áurea. */
function maximoDeHv() {
  let [a, b] = [200 + K, 270 + K];
  const g = (Math.sqrt(5) - 1) / 2;
  for (let k = 0; k < 80; k++) {
    const [c, d] = [b - g * (b - a), a + g * (b - a)];
    if (sat(c).vapor.h > sat(d).vapor.h) b = d;
    else a = c;
  }
  const v = sat((a + b) / 2);
  return { T: v.T, s: v.vapor.s, h: v.vapor.h };
}

/** La lista de una serie con coma decimal y una «y» al final. */
const lista = (vs) => `${vs.slice(0, -1).map((v) => coma(v)).join(', ')} y ${coma(vs[vs.length - 1])}`;

/** «de 100 a 700 °C, de cien en cien», si el paso es uno; si no, la lista. */
function serie(vs, unidad) {
  const paso = vs[1] - vs[0];
  if (paso === 100 && vs.every((v, i) => v === vs[0] + i * paso)) return `de ${vs[0]} a ${vs[vs.length - 1]} ${unidad}, de cien en cien`;
  return `de ${lista(vs)} ${unidad}`;
}

function descripcion({ C, finVapor, entraLiquido }) {
  const m = maximoDeHv();
  return (
    `Diagrama h-s del agua calculado con la formulación IAPWS-95: la entropía s en abscisas, de ${S0} a ${S1} ` +
    `kJ/(kg·K), y la entalpía h en ordenadas, de ${H0} a ${H1} kJ/kg, con una rejilla tenue. La curva gruesa es ` +
    `la de saturación. Su rama del vapor, x = 1, sale de abajo a la derecha, en s = ${coma(finVapor[0], 2)} y ` +
    `h = ${coma(finVapor[1], 0)} a 0,01 °C, sube hasta un máximo de h = ${coma(m.h, 0)} en s = ${coma(m.s, 2)}, a ` +
    `${coma(m.T - K, 0)} °C, y baja hacia la izquierda hasta el punto crítico, marcado con un punto en ` +
    `s = ${coma(C.s, 2)} y h = ${coma(C.h, 0)}, a ${coma(C.p * 10, 2)} bar y ${coma(agua.TC - K, 1)} °C. Allí se ` +
    `junta con la rama del líquido, que entra por el borde izquierdo a h = ${coma(entraLiquido, 0)}. Debajo de la ` +
    'curva está la campana, cerrada abajo a la derecha por la recta del punto triple, a 0,01 °C. Las isobaras, ' +
    `continuas, de ${lista(ISOBARAS)} bar, tienen por pendiente la temperatura absoluta: dentro de la campana, ` +
    'donde la temperatura no cambia, son rectas, y fuera, en el vapor sobrecalentado, se curvan hacia arriba a ' +
    'medida que el vapor se calienta; la de 500 bar, por encima de la presión crítica, no tiene campana y va de ' +
    `una pieza. Las isotermas, ${serie(ISOTERMAS, '°C')}, solo están fuera de la campana: salen de la curva de ` +
    'saturación, o de la isobara de 500 bar las que pasan de la temperatura crítica, y se tumban hacia la derecha ' +
    'hasta quedar casi horizontales a baja presión, donde la entalpía del vapor ya casi solo depende de la ' +
    `temperatura. Las líneas de título, discontinuas, x = ${lista(TITULOS)}, van de la recta del punto triple al ` +
    'punto crítico, donde se juntan todas. Cada isobara lleva su presión escrita a lo largo de ella, en un tramo ' +
    'que no cruza ninguna isoterma; cada isoterma, su temperatura en el margen derecho, y cada línea de título, ' +
    'su valor junto a su extremo de abajo.'
  );
}

/* ── el dibujo ────────────────────────────────────────────────────────── */

function estilos(l) {
  l.clase('rej', 'stroke: var(--rule); stroke-width: .8; fill: none;');
  l.clase('x', 'stroke: var(--faint); stroke-width: 1; fill: none; stroke-dasharray: 5 3;');
  l.clase('t', 'stroke: var(--d2); stroke-width: 1.1; fill: none;');
  l.clase('p', 'stroke: var(--d1); stroke-width: 1.1; fill: none;');
  l.clase('tri', 'stroke: var(--ink); stroke-width: 1.1; fill: none;');
  l.clase('sat', 'stroke: var(--ink); stroke-width: 2.4; fill: none; stroke-linejoin: round;');
  /* El anillo de papel separa el punto crítico del haz de curvas que pasa
     junto a él. */
  l.clase('pc', 'fill: var(--ink); stroke: var(--paper); stroke-width: 1.5;');
  l.clase('guia', 'stroke: var(--ink); stroke-width: .8; fill: none;');
  l.clase('marco', 'stroke: var(--faint); stroke-width: 1; fill: none;');
  l.clase(
    'e',
    'font-size: 10px; font-family: var(--mono); font-weight: 500; paint-order: stroke;' +
      ' stroke: var(--paper); stroke-width: 3px; stroke-linejoin: round;',
  );
}

/** La rejilla: s cada 0,5 y h cada 100, por dentro del marco. */
function rejilla(l) {
  for (let k = 2 * S0 + 1; k < 2 * S1; k++) l.poli([[k / 2, H0], [k / 2, H1]], { clase: 'rej' });
  for (let h = H0 + 100; h < H1; h += 100) l.poli([[S0, h], [S1, h]], { clase: 'rej' });
}

/** El marco, las marcas y sus números, y el nombre de cada eje. Van
 *  después de las curvas, como en todas las figuras del sitio. */
function marco(l, reg, curvas) {
  l.poli([[S0, H0], [S1, H0], [S1, H1], [S0, H1]], { clase: 'marco', cerrar: true });
  const [, yAbajo] = px([S0, H0]);
  for (let k = 2 * S0; k <= 2 * S1; k++) {
    const [x] = px([k / 2, H0]);
    l.crudo(`<path class="${ID}-marco" d="M${r1(x)} ${r1(yAbajo)}L${r1(x)} ${r1(yAbajo + 4)}"/>`);
    rotula(l, reg, { x, y: yAbajo + 15, texto: coma(k / 2), color: 'var(--faint)', anclaje: 'middle', enElRecuadro: false });
  }
  for (let h = H0; h <= H1; h += 200) {
    const [x, y] = px([S0, h]);
    l.crudo(`<path class="${ID}-marco" d="M${r1(x - 4)} ${r1(y)}L${r1(x)} ${r1(y)}"/>`);
    rotula(l, reg, { x: x - 7, y: y + 3.5, texto: String(h), color: 'var(--faint)', anclaje: 'end', enElRecuadro: false });
  }
  const [xDer] = px([S1, H0]);
  const [xIzq, yArriba] = px([S0, H1]);
  rotula(l, reg, { x: xDer - 6, y: yAbajo - 7, texto: 's, kJ/(kg·K)', color: 'var(--graphite)', anclaje: 'end', evita: curvas });
  rotula(l, reg, { x: xIzq + 6, y: yArriba + 15, texto: 'h, kJ/kg', color: 'var(--graphite)', evita: curvas });
}

/** Todas las curvas, calculadas y cotejadas. */
function calcula() {
  const C = puntoCritico();
  const { curva, triple, finVapor } = saturacion(C);
  const isobaras = new Map(ISOBARAS.map((b) => [b, isobara(b, C)]));
  const isotermas = new Map(ISOTERMAS.map((t) => [t, isoterma(t)]));
  const titulos = new Map(TITULOS.map((x) => [x, titulo(x, C)]));
  for (const [que, mapa] of [['isobara', isobaras], ['isoterma', isotermas], ['línea de título', titulos]]) {
    for (const [k, trozos] of mapa) exige(trozos.length === 1, `la ${que} ${k} no es un solo trozo dentro del recuadro`);
  }
  const cotejados = cotejaConLasTablas({ isobaras, isotermas, titulos });
  const leidas = lecturas({ isobaras, isotermas });
  exige(Math.abs(curva[0][0] - S0) < 1e-9, 'la rama del líquido tiene que entrar por el borde izquierdo');
  return { C, curva, triple, finVapor, isobaras, isotermas, titulos, cotejados, leidas, entraLiquido: curva[0][1] };
}

/** Todas las curvas dibujadas, en píxeles, con la de datos de la que salen. */
function curvasDe(d) {
  const datos = [d.curva, d.triple, ...[d.isobaras, d.isotermas, d.titulos].flatMap((m) => [...m.values()].flat())];
  return new Map(datos.map((c) => [c, c.map(px)]));
}

/** Los rótulos de las tres familias y del punto crítico. Ninguno de los de
 *  dentro del recuadro toca una curva que no sea la suya. */
function rotulos(l, reg, d, enPx) {
  const todas = [...enPx.values()];
  const ajenas = (propia) => todas.filter((c) => c !== enPx.get(propia));
  const isotermas = [...d.isotermas.values()].map(([t]) => enPx.get(t));
  const [xDer] = px([S1, H0]);
  for (const [grados, [trozo]] of d.isotermas) {
    const [, y] = px(trozo[0]);
    rotula(l, reg, { x: xDer + 5, y: y + 3.5, texto: `${grados} °C`, color: 'var(--d2-tinta)', enElRecuadro: false });
  }
  for (const [bar, [trozo]] of d.isobaras) {
    const texto = `${coma(bar)} bar`;
    const pts = enPx.get(trozo);
    /* El rótulo va en el tramo de vapor, que empieza en la saturación. */
    const desde = MPa(bar) < d.C.p ? arco(pts, px(sh(agua.saturacionDeP(MPa(bar)).vapor))) : 0;
    const sitio = sitioDeIsobara(pts, texto, { desde, ajenas: ajenas(trozo), isotermas });
    rotula(l, reg, { ...sitio, texto, color: 'var(--d1)' });
  }
  for (const [x, [trozo]] of d.titulos) {
    const [px0, py0] = px(trozo[0]);
    rotula(l, reg, { x: px0 + 5, y: py0 + 12, texto: `x = ${coma(x)}`, color: 'var(--faint)', evita: todas });
  }
  const [xv, yv] = px(d.finVapor);
  rotula(l, reg, { x: xv + 5, y: yv + 12, texto: 'x = 1', color: 'var(--ink)', evita: todas });
  /* La recta del punto triple, por debajo, en el hueco donde no hay nada:
     por debajo de 0,01 °C no hay líquido. */
  const triple = sobreLaCurva(enPx.get(d.triple), '0,01 °C', { desde: 24, lado: -1 });
  rotula(l, reg, { ...triple, texto: '0,01 °C', color: 'var(--ink)', evita: ajenas(d.triple) });
  rotuloCritico(l, reg, d.C, todas);
}

/**
 * El diagrama y lo que se ha comprobado al dibujarlo: cuántos puntos de las
 * tablas se han cotejado, a cuántos píxeles quedan las dos lecturas y
 * cuántos rótulos se han medido.
 */
export function dibuja() {
  const d = calcula();
  const l = lienzo({
    id: ID,
    ancho: ANCHO,
    alto: ALTO,
    x: [S0 - IZQ / ES, S1 + DER / ES],
    y: [H0 - ABA / EH, H1 + ARR / EH],
    margen: 0,
    titulo: 'El diagrama de Mollier del agua: la entalpía frente a la entropía',
    desc: descripcion(d),
  });
  estilos(l);
  rejilla(l);
  for (const [, [t]] of d.titulos) l.poli(t, { clase: 'x' });
  for (const [, [t]] of d.isotermas) l.poli(t, { clase: 't' });
  for (const [, [t]] of d.isobaras) l.poli(t, { clase: 'p' });
  l.poli(d.triple, { clase: 'tri' });
  l.poli(d.curva, { clase: 'sat' });
  l.punto(d.C.s, d.C.h, { clase: 'pc', r: 3.6 });
  const reg = registro();
  const enPx = curvasDe(d);
  rotulos(l, reg, d, enPx);
  marco(l, reg, [...enPx.values()]);
  const svg = `${l.svg()}\n`;
  exige(!/\n\s*\n/.test(svg), 'hay una línea en blanco dentro del SVG');
  exige(!/#[0-9a-f]{3,8}\b/i.test(svg), 'hay un color literal en el SVG');
  return { svg, informe: { cotejados: d.cotejados, lecturas: d.leidas, rotulos: reg.cuantos } };
}

/** El diagrama entero, como texto SVG: lo que se publica. */
export const mollier = () => dibuja().svg;

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { svg, informe } = dibuja();
  writeFileSync(DESTINO, svg);
  console.log(`${fileURLToPath(DESTINO)}: ${(svg.length / 1024).toFixed(1)} kB`);
  console.log(`  ${informe.cotejados} puntos de las tablas, a menos de medio píxel de su curva`);
  for (const [que, dist] of Object.entries(informe.lecturas)) console.log(`  ${que}: a ${dist.toFixed(3)} px`);
  console.log(`  ${informe.rotulos} rótulos medidos, ninguno pisa a otro`);
}
