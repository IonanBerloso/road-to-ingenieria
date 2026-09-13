/**
 * El modelo del tema 8: el mecanismo biela-manivela, su centro instantáneo de
 * rotación y la base que ese centro va dibujando.
 *
 * Vive fuera del componente porque §10 exige que un simulador con física
 * dentro lleve su caso de prueba. `tests/fisica/mecanismo.test.ts` lo verifica
 * contra la figura del propio tema 8, que publica el mecanismo de 0,1 y 0,3 m
 * a 45° girando a 10 rad/s: centro instantáneo en (0,362; 0,362), IA = 0,412,
 * IB = 0,362, velocidad angular de la biela 2,43 rad/s y velocidad de la
 * deslizadera 0,879 m/s.
 *
 * Geometría, con el origen en el eje de la manivela:
 *
 *   · la manivela OA, de longitud r, forma el ángulo θ con la horizontal;
 *   · la biela AB, de longitud l, acaba en la deslizadera B, que corre por la
 *     horizontal que pasa por O;
 *   · φ es el ángulo que la biela forma con esa horizontal, y sale de
 *     l·senφ = r·senθ.
 *
 * Todo en unidades coherentes: metros y rad/s dan m/s.
 */

export interface Punto {
  x: number;
  y: number;
}

export interface Mecanismo {
  /** Longitud de la manivela, en metros. */
  r: number;
  /** Longitud de la biela, en metros. Tiene que ser mayor que r. */
  l: number;
  /** Ángulo de la manivela con la horizontal, en radianes. */
  theta: number;
  /** Velocidad angular de la manivela, en rad/s. Positiva antihoraria. */
  omega: number;
}

/** Las posiciones de los tres puntos y el ángulo de la biela. */
export function posiciones({ r, l, theta }: Mecanismo): { A: Punto; B: Punto; phi: number } {
  const A = { x: r * Math.cos(theta), y: r * Math.sin(theta) };
  const senPhi = (r * Math.sin(theta)) / l;
  const phi = Math.asin(Math.max(-1, Math.min(1, senPhi)));
  const B = { x: A.x + l * Math.cos(phi), y: 0 };
  return { A, B, phi };
}

/**
 * El centro instantáneo de rotación de la biela.
 *
 * Está donde se cortan las dos perpendiculares a las velocidades conocidas:
 * la de A es perpendicular a la manivela, así que su perpendicular es la
 * propia recta OA prolongada; la de B es horizontal, así que la suya es la
 * vertical por B.
 *
 * Devuelve `null` en los puntos muertos —manivela alineada con la biela—,
 * donde las dos rectas son paralelas y el centro se va al infinito: ahí la
 * biela no gira, y decirlo es más honesto que devolver un número enorme.
 */
export function centroInstantaneo(m: Mecanismo): Punto | null {
  const { A, B } = posiciones(m);
  const sen = Math.sin(m.theta);
  if (Math.abs(sen) < 1e-12) return null;
  /* La recta OA es y = x·tanθ; la vertical por B es x = x_B. */
  return { x: B.x, y: B.x * Math.tan(m.theta) };
}

export interface Cinematica {
  A: Punto;
  B: Punto;
  I: Punto | null;
  /** Distancias del centro instantáneo a A y a B, en metros. */
  IA: number;
  IB: number;
  /** Velocidad de A, siempre perpendicular a la manivela: ω·r. */
  vA: number;
  /** Velocidad angular de la biela, en rad/s. */
  omegaBiela: number;
  /** Velocidad de la deslizadera, en m/s. Positiva hacia la derecha. */
  vB: number;
}

/**
 * La cinemática completa en una posición.
 *
 * La velocidad angular de la biela y la de la deslizadera salen por dos
 * caminos que tienen que coincidir, y el test los compara: leyendo el centro
 * instantáneo —ω = v_A/IA y v_B = ω·IB— y derivando la posición de B.
 */
export function cinematica(m: Mecanismo): Cinematica {
  const { A, B, phi } = posiciones(m);
  const I = centroInstantaneo(m);
  const vA = m.omega * m.r;
  const IA = I ? Math.hypot(I.x - A.x, I.y - A.y) : Infinity;
  const IB = I ? Math.hypot(I.x - B.x, I.y - B.y) : Infinity;
  /* Fuera de los puntos muertos, el centro instantáneo lo da todo. */
  const omegaBiela = I ? (vA / IA) * (Math.sin(m.theta) > 0 ? -1 : 1) * Math.sign(m.omega) : 0;
  /* Y la velocidad de B, con la fórmula cerrada, que además vale en los
     puntos muertos: v_B = −ω r sen(θ+φ)/cosφ. */
  const vB = (-m.omega * m.r * Math.sin(m.theta + phi)) / Math.cos(phi);
  return { A, B, I, IA, IB, vA, omegaBiela, vB };
}

/**
 * La base: el rastro que el centro instantáneo deja en el plano fijo cuando la
 * manivela da una vuelta.
 *
 * Es lo que el tema llama base, y no se puede dibujar sin recorrer el ciclo,
 * que es justo lo que un simulador puede hacer y una figura no. Los puntos
 * muertos se saltan porque allí el centro se va al infinito.
 */
export function base(r: number, l: number, n = 240, corte = 8): Punto[] {
  const pts: Punto[] = [];
  for (let i = 0; i <= n; i++) {
    const theta = (2 * Math.PI * i) / n;
    const I = centroInstantaneo({ r, l, theta, omega: 1 });
    if (!I) continue;
    if (Math.abs(I.y) > corte * l) continue;
    pts.push(I);
  }
  return pts;
}
