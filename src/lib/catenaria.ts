/**
 * El modelo del tema 5: la catenaria, con el convenio del curso, y la
 * parábola con la que tantas veces se la confunde.
 *
 * Vive fuera del componente porque §10 exige que un simulador con física
 * dentro lleve su caso de prueba. `tests/fisica/catenaria.test.ts` lo
 * verifica contra la figura del propio tema 5 —cable de 10 N/m con 20 N en el
 * punto más bajo: c = 2 m, y en x = 3 m la altura es 4,705 m, la longitud
 * 4,259 m y la tensión 47 N— y contra la identidad y² = c² + s², que es la
 * que el tema usa para resolver casi todos sus problemas.
 *
 * **El convenio es el del curso**, y es lo primero que hay que tener claro:
 * la y NO se mide desde el punto más bajo, sino desde la **directriz**, que
 * está una distancia c por debajo de él. Con eso:
 *
 *   c = T0/w      y = c·cosh(x/c)      s = c·senh(x/c)      T = w·y
 *
 * y de ahí sale y² = c² + s², que relaciona altura y longitud sin ángulos.
 */

/** El parámetro de la catenaria: c = T0/w, en metros. */
export function parametro(T0: number, w: number): number {
  return T0 / w;
}

/** Altura sobre la directriz, en metros. */
export function altura(c: number, x: number): number {
  return c * Math.cosh(x / c);
}

/** Longitud de cable desde el punto más bajo, en metros. */
export function longitud(c: number, x: number): number {
  return c * Math.sinh(x / c);
}

/** Tensión en el punto de abscisa x: el peso de `y` metros de cable. */
export function tension(c: number, x: number, w: number): number {
  return w * altura(c, x);
}

/** Ángulo de la tensión con la horizontal, en grados. */
export function angulo(c: number, x: number): number {
  return (Math.atan(Math.sinh(x / c)) * 180) / Math.PI;
}

/** La flecha: cuánto baja el cable desde los amarres hasta su punto más bajo. */
export function flecha(c: number, a: number): number {
  return altura(c, a) - c;
}

/**
 * La parábola que el tema contrapone a la catenaria: la del cable con la
 * carga repartida por unidad de abscisa, no por unidad de cable.
 *
 * Se escribe con el mismo origen en la directriz para poder restarlas:
 * y_p = c + x²/(2c), que son los dos primeros términos del desarrollo del
 * coseno hiperbólico. Por eso se parecen tanto con flecha pequeña.
 */
export function parabola(c: number, x: number): number {
  return c + (x * x) / (2 * c);
}

/**
 * El parámetro c de la catenaria que salva un vano 2a con una flecha f.
 *
 * No se despeja: c·(cosh(a/c) − 1) = f es trascendente, así que se resuelve
 * por bisección, que para esto sobra y no mete una dependencia (§02).
 */
export function parametroDesde(a: number, f: number): number {
  if (a <= 0 || f <= 0) return NaN;
  const g = (c: number) => c * (Math.cosh(a / c) - 1) - f;
  /* g es decreciente en c: con c grande la catenaria se estira y baja poco. */
  let lo = 1e-6;
  let hi = Math.max(1, (a * a) / (2 * f));
  while (g(hi) > 0) hi *= 2;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (g(mid) > 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * Lo que se equivoca quien usa la parábola donde hay una catenaria, en tanto
 * por ciento, medido en las dos cosas que se preguntan en un examen: la
 * longitud del cable y la tensión máxima.
 *
 * Es la pregunta que el simulador contesta moviendo la flecha: con vanos
 * tensos los dos modelos son el mismo, y la diferencia crece deprisa en
 * cuanto el cable cuelga de verdad.
 */
export function errorParabola(c: number, a: number): { longitud: number; tension: number } {
  const sCat = 2 * longitud(c, a);
  /* Longitud de la parábola y = x²/(2c) entre −a y a, integrada numéricamente
     con Simpson: no hay fórmula elemental cómoda y así no se copia mal. */
  const n = 2000;
  let sPar = 0;
  const dl = (x: number) => Math.sqrt(1 + (x / c) ** 2);
  for (let i = 0; i < n; i++) {
    const x1 = -a + (2 * a * i) / n;
    const x2 = -a + (2 * a * (i + 1)) / n;
    const xm = (x1 + x2) / 2;
    sPar += ((x2 - x1) / 6) * (dl(x1) + 4 * dl(xm) + dl(x2));
  }
  const tCat = altura(c, a);
  const tPar = parabola(c, a);
  return {
    longitud: ((sCat - sPar) / sPar) * 100,
    tension: ((tCat - tPar) / tPar) * 100,
  };
}
