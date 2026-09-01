/**
 * El modelo del tema 21: flujo uniforme en canales, Manning y la sección
 * hidráulicamente óptima.
 *
 * Vive fuera del componente porque §10 exige que un simulador con física
 * dentro lleve su caso de prueba. `tests/fisica/canales.test.ts` lo verifica
 * contra las tres secciones de la figura del propio tema —el semicuadrado, el
 * semihexágono y el semicírculo, las tres de 4 m²— y contra el ejercicio 8.1
 * de la colección, que es el caso general del trapecio.
 *
 * Unidades del SI en todo: metros, segundos, m³/s. Aquí sí, porque Manning se
 * escribe así en los apuntes y no hay coeficientes publicados que respetar.
 */

/**
 * Las tipologías que el tema maneja.
 *
 * `trapecio` lleva su ángulo de talud aparte, porque el semihexágono no es una
 * tipología distinta: es el trapecio con α = 60°.
 */
export type Tipo = 'rectangulo' | 'trapecio' | 'semicirculo';

export interface Seccion {
  tipo: Tipo;
  /** Calado, en metros. */
  h: number;
  /** Solera. En el semicírculo se ignora: manda el calado, que es el radio. */
  b: number;
  /** Ángulo del talud con la horizontal, en grados. Solo en el trapecio. */
  alfa?: number;
}

/** Área mojada, en m². */
export function area({ tipo, h, b, alfa = 60 }: Seccion): number {
  if (tipo === 'semicirculo') return (Math.PI * h * h) / 2;
  if (tipo === 'rectangulo') return b * h;
  /* Trapecio de solera b y taludes que se abren: cada uno añade h²/tanα. */
  return b * h + (h * h) / Math.tan((alfa * Math.PI) / 180);
}

/** Perímetro mojado, en metros. Solo lo que toca agua: la lámina no cuenta. */
export function perimetro({ tipo, h, b, alfa = 60 }: Seccion): number {
  if (tipo === 'semicirculo') return Math.PI * h;
  if (tipo === 'rectangulo') return b + 2 * h;
  return b + (2 * h) / Math.sin((alfa * Math.PI) / 180);
}

/** Radio hidráulico, área partido por perímetro mojado. */
export const radioHidraulico = (s: Seccion): number => area(s) / perimetro(s);

/**
 * Manning: `Q = (1/n)·A·R^(2/3)·J^(1/2)`.
 *
 * La `n` lleva dimensiones —s·m^(−1/3)— y no es la rugosidad ni el coeficiente
 * de frotamiento del tema 18. Está dicho en el error típico del tema y se
 * repite aquí porque el módulo la recibe como un número suelto.
 */
export const caudal = (s: Seccion, n: number, J: number): number =>
  (1 / n) * area(s) * radioHidraulico(s) ** (2 / 3) * Math.sqrt(J);

export const velocidad = (s: Seccion, n: number, J: number): number => caudal(s, n, J) / area(s);

/**
 * El calado que hace falta para llevar un caudal, con la geometría fijada por
 * la relación `b/h` —o por la tipología, en el semicírculo—.
 *
 * Se resuelve por bisección: `Q(h)` es creciente y no se despeja, que es
 * exactamente lo que dice el error típico del tema sobre la base impuesta.
 */
export function calado(
  tipo: Tipo,
  relacion: number,
  n: number,
  J: number,
  Q: number,
  alfa = 60,
): number {
  const seccionCon = (h: number): Seccion => ({ tipo, h, b: relacion * h, alfa });
  let lo = 1e-6;
  let hi = 1;
  while (caudal(seccionCon(hi), n, J) < Q && hi < 1e4) hi *= 2;
  for (let k = 0; k < 90; k++) {
    const m = (lo + hi) / 2;
    if (caudal(seccionCon(m), n, J) < Q) lo = m;
    else hi = m;
  }
  return (lo + hi) / 2;
}

/** La sección que lleva `Q` con esa relación `b/h`. */
export function seccionPara(
  tipo: Tipo,
  relacion: number,
  n: number,
  J: number,
  Q: number,
  alfa = 60,
): Seccion {
  const h = calado(tipo, relacion, n, J, Q, alfa);
  return { tipo, h, b: relacion * h, alfa };
}

/**
 * La relación `b/h` óptima, la que hace mínimo el perímetro mojado.
 *
 * Para el rectángulo el tema la deduce: `b = 2h`. Para el trapecio de ángulo
 * α cualquiera sale de `l = b/(2(1−cos α))`, con `l = h/sen α` la longitud del
 * talud, es decir `b/h = 2(1−cos α)/sen α`, que con 90° da 2 —el
 * semicuadrado— y con 60° da 2/√3 —el semihexágono—.
 *
 * Se devuelve calculada, no tabulada, para que el simulador pueda mover α.
 */
export function relacionOptima(tipo: Tipo, alfa = 60): number {
  if (tipo === 'rectangulo') return 2;
  if (tipo === 'semicirculo') return 0; // no hay relación que elegir
  const a = (alfa * Math.PI) / 180;
  return (2 * (1 - Math.cos(a))) / Math.sin(a);
}

/**
 * Cuánto perímetro de más gasta una sección respecto de la óptima de su misma
 * tipología, en tanto por uno, llevando las dos el mismo caudal.
 *
 * Es el número que contesta la pregunta del simulador: **¿cuánto cuesta de
 * verdad no poder usar la sección óptima?**
 */
export function penalizacion(
  tipo: Tipo,
  relacion: number,
  n: number,
  J: number,
  Q: number,
  alfa = 60,
): number {
  if (tipo === 'semicirculo') return 0;
  const mia = perimetro(seccionPara(tipo, relacion, n, J, Q, alfa));
  const opt = perimetro(seccionPara(tipo, relacionOptima(tipo, alfa), n, J, Q, alfa));
  return mia / opt - 1;
}
