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

/* ═══════════════════════════════════════════════════════════════════════
   Sección circular parcialmente llena — el caso del capítulo 8

   El tema lo despacha diciendo que «se hace con ábacos, cuadros o programa» y
   que los canales circulares completos «se dejan para asignaturas
   posteriores». Es cierto que no se despeja a mano, y es engañoso como
   prioridad: quince de los veintidós problemas de la colección son justo
   esto, resueltos leyendo los cuadros 27 y 28 de la escuela.

   Lo que hace posible ese cuadro —y el tema no dice— es que las razones
   `Q/Q_ll` y `V/V_ll` dependen **solo** de `h/D`. Ni del diámetro, ni de la
   pendiente, ni del material: se cancelan al dividir. Por eso un único cuadro
   sirve para todas las tuberías del mundo, y por eso se puede reproducir aquí
   en lugar de transcribirlo (§08: el cuadro es de la escuela; la ley no es de
   nadie).
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * El ángulo central mojado, en radianes, para un calado relativo `y = h/D`.
 *
 * Vale 0 con la tubería vacía y 2π con la tubería llena.
 */
export const anguloMojado = (y: number): number => 2 * Math.acos(1 - 2 * y);

/**
 * `Q/Q_ll`: el caudal que lleva la tubería a calado relativo `y`, dividido
 * entre el que llevaría llena.
 *
 * **No siempre es menor que 1.** Ese es el resultado que no está en la prosa:
 * el máximo está en `y ≈ 0,938` y vale un 7,6 % **más** que a sección llena,
 * porque al pasar de 0,94 a 1 el perímetro mojado crece más deprisa que el
 * área. Tiene consecuencia de diseño: un colector calculado para ir
 * exactamente lleno trabaja en un punto donde subir el calado **baja** el
 * caudal, y eso es una inestabilidad, no un margen.
 */
export function relacionCaudal(y: number): number {
  if (y <= 0) return 0;
  if (y >= 1) return 1;
  const t = anguloMojado(y);
  return ((t - Math.sin(t)) / (2 * Math.PI)) * (1 - Math.sin(t) / t) ** (2 / 3);
}

/**
 * `V/V_ll`. Es `(R/R_ll)^(2/3)`, y su máximo está en `y ≈ 0,81`: un 14 % por
 * encima de la velocidad a sección llena.
 */
export function relacionVelocidad(y: number): number {
  if (y <= 0) return 0;
  if (y >= 1) return 1;
  const t = anguloMojado(y);
  return (1 - Math.sin(t) / t) ** (2 / 3);
}

/** Caudal a sección llena. `R_ll = D/4`, que es el radio hidráulico del círculo. */
export const caudalLleno = (D: number, n: number, J: number): number =>
  (1 / n) * ((Math.PI * D * D) / 4) * (D / 4) ** (2 / 3) * Math.sqrt(J);

/** Velocidad a sección llena. */
export const velocidadLleno = (D: number, n: number, J: number): number =>
  (1 / n) * (D / 4) ** (2 / 3) * Math.sqrt(J);

/**
 * El calado relativo que da una razón de caudales, invirtiendo el cuadro.
 *
 * Se busca **solo en la rama creciente**, hasta `y = 0,938`, y esa restricción
 * es la mitad de la utilidad de esta función: por encima del máximo hay una
 * segunda solución —una tubería casi llena y otra llena del todo pueden llevar
 * el mismo caudal— y no es la que quiere ningún enunciado.
 */
export const CALADO_DE_CAUDAL_MAXIMO = 0.938;

export function caladoRelativo(razonDeCaudal: number): number {
  const tope = CALADO_DE_CAUDAL_MAXIMO;
  if (razonDeCaudal <= 0) return 0;
  if (razonDeCaudal >= relacionCaudal(tope)) return tope;
  let lo = 0;
  let hi = tope;
  for (let i = 0; i < 200; i++) {
    const m = (lo + hi) / 2;
    if (relacionCaudal(m) < razonDeCaudal) lo = m;
    else hi = m;
  }
  return (lo + hi) / 2;
}
