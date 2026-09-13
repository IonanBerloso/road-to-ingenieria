/**
 * El modelo del tema 6 de Mecánica Aplicada: esfuerzos de sección en una viga
 * recta, y sus diagramas.
 *
 * Vive fuera del componente porque §10 exige que un simulador con física
 * dentro lleve su caso de prueba. `tests/fisica/viga.test.ts` lo verifica
 * contra los ejercicios 6.2, 6.5 y 6.9 de la colección de la asignatura, que
 * son los tres que fijan lo que hay que saber calcular: dos cargas puntuales,
 * una repartida con dos voladizos y una triangular.
 *
 * **El convenio de signos es el del curso**, no el de otro libro, y es lo
 * primero que hay que tener claro para leer cualquier número de aquí:
 *
 *   · x recorre la viga de izquierda a derecha, y apunta hacia ABAJO;
 *   · una carga q_y es positiva hacia abajo, y una fuerza P también;
 *   · dV/dx = −q_y  y  dM/dx = V;
 *   · M es positivo cuando tracciona la fibra INFERIOR.
 *
 * Con ese convenio, una viga biapoyada con carga hacia abajo tiene el flector
 * positivo, que es como sale dibujado en los apuntes.
 *
 * Todo en unidades coherentes: si las cargas van en kg y las longitudes en m,
 * los flectores salen en kg·m. El modelo no convierte nada.
 */

/** Una carga puntual: `P` hacia abajo, aplicada en `x`. */
export interface Puntual {
  tipo: 'puntual';
  x: number;
  P: number;
}

/**
 * Una carga repartida entre `x1` y `x2`, que vale `q1` en `x1` y `q2` en `x2`
 * y varía linealmente entre las dos. Con `q1 === q2` es la uniforme, y con
 * `q1 === 0` la triangular. Positiva hacia abajo.
 */
export interface Repartida {
  tipo: 'repartida';
  x1: number;
  x2: number;
  q1: number;
  q2: number;
}

/** Un par aplicado en `x`. Positivo el que tracciona la fibra inferior. */
export interface Par {
  tipo: 'par';
  x: number;
  M: number;
}

export type Carga = Puntual | Repartida | Par;

/**
 * Una viga recta de longitud `L` con dos apoyos en `xA` y `xB`. Lo que quede
 * fuera de ellos es voladizo, que es justo lo que hace interesantes a la
 * mitad de los problemas del tema.
 */
export interface Viga {
  L: number;
  xA: number;
  xB: number;
  cargas: Carga[];
}

/** Resultante de una carga repartida, hacia abajo. */
function resultante(c: Repartida): number {
  return ((c.q1 + c.q2) / 2) * (c.x2 - c.x1);
}

/** Abscisa del centro de gravedad del diagrama de una carga repartida. */
function centroide(c: Repartida): number {
  const l = c.x2 - c.x1;
  if (l === 0) return c.x1;
  const total = c.q1 + c.q2;
  /* El trapecio se parte en rectángulo (q1) y triángulo (q2 − q1). */
  if (total === 0) return c.x1 + l / 2;
  const xRect = c.x1 + l / 2;
  const rect = c.q1 * l;
  const tri = ((c.q2 - c.q1) / 2) * l;
  const xTri = c.q2 >= c.q1 ? c.x1 + (2 * l) / 3 : c.x1 + l / 3;
  const suma = rect + tri;
  if (suma === 0) return c.x1 + l / 2;
  return (rect * xRect + tri * xTri) / suma;
}

/** Lo que vale la carga repartida en un punto, interpolando. */
function qEn(c: Repartida, x: number): number {
  if (x < c.x1 || x > c.x2) return 0;
  const l = c.x2 - c.x1;
  if (l === 0) return 0;
  return c.q1 + ((c.q2 - c.q1) * (x - c.x1)) / l;
}

/** Parte de una carga repartida que queda a la izquierda de `x`: su resultante. */
function resultanteHasta(c: Repartida, x: number): { R: number; xg: number } {
  if (x <= c.x1) return { R: 0, xg: c.x1 };
  const hasta = Math.min(x, c.x2);
  const trozo: Repartida = { tipo: 'repartida', x1: c.x1, x2: hasta, q1: c.q1, q2: qEn(c, hasta) };
  return { R: resultante(trozo), xg: centroide(trozo) };
}

/**
 * Las reacciones de los dos apoyos, positivas hacia arriba.
 *
 * Momentos en B para sacar A, y en A para sacar B; que la suma cuadre con la
 * carga total es la comprobación que hace el test.
 */
export function reacciones(v: Viga): { RA: number; RB: number } {
  let total = 0;
  let momentoA = 0; // de las cargas respecto de A, positivo el que hunde a la derecha
  for (const c of v.cargas) {
    if (c.tipo === 'puntual') {
      total += c.P;
      momentoA += c.P * (c.x - v.xA);
    } else if (c.tipo === 'repartida') {
      const R = resultante(c);
      total += R;
      momentoA += R * (centroide(c) - v.xA);
    } else {
      /* El par entra con su signo, el mismo con el que suma en el flector.
         Con el contrario las reacciones salían intercambiadas y el flector no
         se cerraba en cero en un apoyo extremo: en la viga de la ordinaria de
         2025 aparecía un −8MgL en B, que no puede existir. Lo delató mirar la
         captura del simulador, no ningún guardián. */
      momentoA += c.M;
    }
  }
  const luz = v.xB - v.xA;
  const RB = momentoA / luz;
  const RA = total - RB;
  return { RA, RB };
}

/**
 * El esfuerzo cortante en `x`.
 *
 * V(x) = suma de las fuerzas verticales a la izquierda de x, hacia arriba
 * positivas. En un punto donde hay una carga puntual o un apoyo, el diagrama
 * salta: `lado` dice de qué lado del salto se pregunta.
 */
export function cortante(v: Viga, x: number, lado: 'izq' | 'der' = 'der'): number {
  const { RA, RB } = reacciones(v);
  const cuenta = (xi: number) => (lado === 'der' ? xi <= x + 1e-12 : xi < x - 1e-12);
  let V = 0;
  if (cuenta(v.xA)) V += RA;
  if (cuenta(v.xB)) V += RB;
  for (const c of v.cargas) {
    if (c.tipo === 'puntual') {
      if (cuenta(c.x)) V -= c.P;
    } else if (c.tipo === 'repartida') {
      V -= resultanteHasta(c, x).R;
    }
  }
  return V;
}

/**
 * El momento flector en `x`, positivo cuando tracciona la fibra inferior.
 *
 * Momentos de todo lo que queda a la izquierda de x, tomados en x.
 */
export function flector(v: Viga, x: number): number {
  const { RA, RB } = reacciones(v);
  let M = 0;
  if (v.xA <= x + 1e-12) M += RA * (x - v.xA);
  if (v.xB <= x + 1e-12) M += RB * (x - v.xB);
  for (const c of v.cargas) {
    if (c.tipo === 'puntual') {
      if (c.x <= x + 1e-12) M -= c.P * (x - c.x);
    } else if (c.tipo === 'repartida') {
      const { R, xg } = resultanteHasta(c, x);
      if (R !== 0) M -= R * (x - xg);
    } else if (c.x <= x + 1e-12) {
      M += c.M;
    }
  }
  return M;
}

export interface PuntoDiagrama {
  x: number;
  V: number;
  M: number;
}

/**
 * Los dos diagramas muestreados en `n` puntos, con los puntos singulares
 * duplicados a los dos lados para que los saltos se dibujen verticales.
 */
export function diagrama(v: Viga, n = 400): PuntoDiagrama[] {
  const singulares = new Set<number>([0, v.L, v.xA, v.xB]);
  for (const c of v.cargas) {
    if (c.tipo === 'repartida') {
      singulares.add(c.x1);
      singulares.add(c.x2);
    } else singulares.add(c.x);
  }
  const xs: number[] = [];
  for (let i = 0; i <= n; i++) xs.push((v.L * i) / n);
  for (const s of singulares) {
    xs.push(Math.max(0, s - 1e-9));
    xs.push(Math.min(v.L, s + 1e-9));
  }
  xs.sort((a, b) => a - b);
  return xs.map((x) => ({ x, V: cortante(v, x), M: flector(v, x) }));
}

/**
 * Dónde está el flector extremo y cuánto vale, y dónde se anula la cortante.
 *
 * Los dos van juntos a propósito: que el flector sea extremo donde V = 0 es
 * la consecuencia de dM/dx = V que el tema quiere que se vea, y el simulador
 * la enseña marcando los dos a la vez.
 */
export function extremos(v: Viga, n = 2000): {
  MmaxPos: PuntoDiagrama;
  MmaxNeg: PuntoDiagrama;
  Mabs: PuntoDiagrama;
  cortesV: number[];
} {
  const pts = diagrama(v, n);
  let MmaxPos = pts[0];
  let MmaxNeg = pts[0];
  for (const p of pts) {
    if (p.M > MmaxPos.M) MmaxPos = p;
    if (p.M < MmaxNeg.M) MmaxNeg = p;
  }
  const Mabs = Math.abs(MmaxPos.M) >= Math.abs(MmaxNeg.M) ? MmaxPos : MmaxNeg;
  const cortesV: number[] = [];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    if (a.V === 0) cortesV.push(a.x);
    else if (a.V * b.V < 0 && b.x - a.x > 1e-6) {
      /* interpolación lineal: dentro de un tramo V es lineal o constante */
      cortesV.push(a.x + ((b.x - a.x) * (0 - a.V)) / (b.V - a.V));
    }
  }
  return { MmaxPos, MmaxNeg, Mabs, cortesV };
}
