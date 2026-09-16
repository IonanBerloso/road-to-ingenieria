/**
 * El lienzo de las figuras.
 *
 * Las figuras del sitio no se dibujan a mano: se calculan. Una parábola con
 * cincuenta puntos escritos a ojo es una parábola que miente en el tercer
 * decimal y que nadie puede corregir después, y §10 dice que un dato
 * publicado tiene que ser cierto — también cuando el dato es una curva.
 *
 * Esto convierte coordenadas de la asignatura en coordenadas de la pantalla y
 * emite el SVG con la misma receta que las figuras escritas antes de que esto
 * existiera: un `<title>` y un `<desc>` que se leen solos, un bloque `<style>`
 * con las clases prefijadas, y los rótulos con halo de papel para que se lean
 * encima de cualquier curva.
 *
 * Tres reglas que el lienzo impone y que no se pueden saltar:
 *
 * 1. **Nada se sale del viewBox.** Cada punto emitido se compara con el marco
 *    y salirse es un error en el momento de generar, no un fallo que descubra
 *    `humo.mjs` media hora después.
 * 2. **Los colores son tokens.** Ni un `#rrggbb` en una figura: el sitio tiene
 *    tres temas y la capa de tinta de `check-color.mjs` mide todos.
 * 3. **Los ids llevan prefijo.** Una misma figura puede aparecer dos veces en
 *    la misma página —el paso y la resolución—, y dos ids iguales rompen el
 *    `aria-labelledby` de las dos.
 */

/** Las clases de siempre: la receta visual compartida por todas las figuras. */
function clasesBase() {
  return new Map([
    ['eje', 'stroke: var(--rule); stroke-width: 1.1; fill: none;'],
    ['c', 'stroke: var(--d1); stroke-width: 2.8; fill: none;'],
    ['c2', 'stroke: var(--alt); stroke-width: 2.8; fill: none;'],
    ['cp', 'stroke: var(--d1); stroke-width: 2.4; fill: none; stroke-dasharray: 6 4;'],
    ['cp2', 'stroke: var(--alt); stroke-width: 2.4; fill: none; stroke-dasharray: 6 4;'],
    ['g', 'stroke: var(--faint); stroke-width: 1.1; fill: none; stroke-dasharray: 3 3;'],
    ['fue', 'stroke: var(--faint); stroke-width: 1.4; fill: none; stroke-dasharray: 5 4;'],
    ['f', 'fill: var(--live); fill-opacity: .12; stroke: none;'],
    ['f2', 'fill: var(--alt); fill-opacity: .12; stroke: none;'],
    ['pt', 'fill: var(--live);'],
    ['punta', 'fill: var(--live); stroke: none;'],
    ['hueco', 'fill: var(--paper); stroke: var(--live); stroke-width: 2;'],
    ['o', 'fill: var(--flag);'],
    [
      'n',
      'fill: var(--faint); font-size: 10px; font-family: var(--mono); paint-order: stroke;' +
        ' stroke: var(--paper); stroke-width: 3px; stroke-linejoin: round;',
    ],
    [
      'l',
      'font-size: 10.5px; font-family: var(--mono); font-weight: 700; paint-order: stroke;' +
        ' stroke: var(--paper); stroke-width: 3.4px; stroke-linejoin: round;',
    ],
  ]);
}

const r1 = (n) => {
  const v = Math.round(n * 10) / 10;
  return Object.is(v, -0) ? 0 : v;
};

/** Escapa lo que va dentro de un nodo de texto del SVG. */
const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Un lienzo con su sistema de coordenadas.
 *
 * `x` e `y` son los rangos de la asignatura; `ancho` y `alto`, los píxeles.
 * Con `cuadrado` los dos ejes usan la misma escala, que es obligatorio en
 * cuanto la figura tiene una circunferencia: una circunferencia dibujada en
 * ejes de distinta escala es una elipse, y el alumno la copia como la ve.
 */
export function lienzo({
  id,
  ancho = 340,
  alto = 265,
  x,
  y,
  margen = 26,
  cuadrado = false,
  titulo,
  desc,
}) {
  if (!id || !/^[a-z][a-z0-9-]*$/.test(id)) throw new Error(`id feo: ${id}`);
  if (!titulo || !desc) throw new Error(`${id}: toda figura lleva título y descripción`);

  let [x0, x1] = x;
  let [y0, y1] = y;

  if (cuadrado) {
    /* Se estira el rango corto, nunca se encoge el largo: así no se pierde
       nada de lo que el que pidió la figura quería que se viera. */
    const ex = (ancho - 2 * margen) / (x1 - x0);
    const ey = (alto - 2 * margen) / (y1 - y0);
    const e = Math.min(ex, ey);
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;
    const anchoUtil = (ancho - 2 * margen) / e;
    const altoUtil = (alto - 2 * margen) / e;
    x0 = cx - anchoUtil / 2;
    x1 = cx + anchoUtil / 2;
    y0 = cy - altoUtil / 2;
    y1 = cy + altoUtil / 2;
  }

  const X = (u) => margen + ((u - x0) / (x1 - x0)) * (ancho - 2 * margen);
  const Y = (v) => alto - margen - ((v - y0) / (y1 - y0)) * (alto - 2 * margen);

  const piezas = [];
  const clases = new Map();
  let desbordes = 0;
  /* Qué se ha salido, para no tener que adivinarlo. */
  const culpables = [];
  let quien = 'una curva';

  const dentro = (px, py) => {
    if (px < -0.5 || px > ancho + 0.5 || py < -0.5 || py > alto + 0.5) {
      desbordes++;
      if (culpables.length < 4) culpables.push(`${quien} en (${r1(px)}, ${r1(py)})`);
    }
    return [r1(px), r1(py)];
  };

  const P = (u, v) => dentro(X(u), Y(v));

  /** Une puntos ya en píxeles en un `d` de path. */
  const trazo = (puntos, cerrar = false) =>
    puntos.map(([px, py], i) => `${i ? 'L' : 'M'}${px} ${py}`).join('') + (cerrar ? 'Z' : '');

  /**
   * Cuánto mide un rótulo, a ojo pero por lo alto.
   *
   * La familia es monoespaciada, así que el ancho es el número de letras por el
   * paso de la fuente. Se redondea hacia arriba: equivocarse de más aprieta el
   * margen, equivocarse de menos deja salir una palabra del marco y lo caza
   * `humo.mjs` media hora después.
   */
  const mideTexto = (texto, pequeno) => [...String(texto)].length * (pequeno ? 6.3 : 6.7);

  const encuadra = (px, py, texto, anclaje, pequeno) => {
    quien = `el rótulo «${texto}»`;
    const w = mideTexto(texto, pequeno);
    const izq = anclaje === 'end' ? px - w : anclaje === 'middle' ? px - w / 2 : px;
    dentro(izq, py - 8);
    dentro(izq + w, py + 3);
    quien = 'una curva';
  };

  const api = {
    id,
    X,
    Y,
    rango: { x: [x0, x1], y: [y0, y1] },

    clase(nombre, css) {
      clases.set(nombre, css);
      return api;
    },

    crudo(xml) {
      piezas.push(xml);
      return api;
    },

    /** Los dos ejes, con sus nombres al final de cada uno. */
    ejes({ nombreX = 'Re', nombreY = 'Im', enX = 0, enY = 0, marcasX = [], marcasY = [] } = {}) {
      const [ax, ay] = P(x0, enX);
      const [bx, by] = P(x1, enX);
      const [cx, cy] = P(enY, y0);
      const [dx, dy] = P(enY, y1);
      piezas.push(`<path class="${id}-eje" d="M${ax} ${ay}L${bx} ${by}M${cx} ${cy}L${dx} ${dy}"/>`);

      const notas = [];
      for (const m of marcasX) {
        const [u, texto] = Array.isArray(m) ? m : [m, String(m)];
        const [px, py] = P(u, enX);
        piezas.push(`<path class="${id}-eje" d="M${px} ${r1(py - 3.5)}L${px} ${r1(py + 3.5)}"/>`);
        notas.push(`<text x="${px}" y="${r1(py + 15)}" text-anchor="middle">${esc(texto)}</text>`);
      }
      for (const m of marcasY) {
        const [v, texto] = Array.isArray(m) ? m : [m, String(m)];
        const [px, py] = P(enY, v);
        piezas.push(`<path class="${id}-eje" d="M${r1(px - 3.5)} ${py}L${r1(px + 3.5)} ${py}"/>`);
        notas.push(`<text x="${r1(px - 7)}" y="${r1(py + 3.6)}" text-anchor="end">${esc(texto)}</text>`);
      }
      notas.push(`<text x="${bx}" y="${r1(by - 8)}" text-anchor="end">${esc(nombreX)}</text>`);
      notas.push(`<text x="${r1(dx + 6)}" y="${r1(dy + 10)}">${esc(nombreY)}</text>`);
      piezas.push(`<g class="${id}-n">${notas.join('')}</g>`);
      return api;
    },

    /** Muestrea `f` sobre `[a,b]` y devuelve los puntos en píxeles. */
    muestra(f, [a, b], n = 96) {
      const salida = [];
      for (let k = 0; k <= n; k++) {
        const t = a + ((b - a) * k) / n;
        const q = f(t);
        const [u, v] = Array.isArray(q) ? q : [t, q];
        if (!Number.isFinite(u) || !Number.isFinite(v)) continue;
        salida.push(P(u, v));
      }
      return salida;
    },

    /** Una curva: `y = f(x)` si `f` devuelve un número, paramétrica si un par. */
    curva(f, dominio, { clase = 'c', n = 96, cerrar = false } = {}) {
      piezas.push(`<path class="${id}-${clase}" d="${trazo(api.muestra(f, dominio, n), cerrar)}"/>`);
      return api;
    },

    /** Una poligonal por vértices de la asignatura. */
    poli(puntos, { clase = 'c', cerrar = false } = {}) {
      piezas.push(`<path class="${id}-${clase}" d="${trazo(puntos.map(([u, v]) => P(u, v)), cerrar)}"/>`);
      return api;
    },

    /**
     * Una región rellena, dada por su contorno: una lista de tramos, cada uno
     * una función y su dominio, recorridos en orden.
     */
    region(tramos, { clase = 'f', n = 96 } = {}) {
      const puntos = [];
      for (const t of tramos) {
        if (typeof t.f === 'function') puntos.push(...api.muestra(t.f, t.en, t.n ?? n));
        else puntos.push(P(t[0], t[1]));
      }
      piezas.push(`<path class="${id}-${clase}" d="${trazo(puntos, true)}"/>`);
      return api;
    },

    /**
     * Lo que queda del marco al quitarle unos cuantos contornos.
     *
     * Media docena de ejercicios piden sombrear el **exterior** de un círculo,
     * y el exterior de un círculo no se dibuja con un círculo: se dibuja con
     * el marco entero y un agujero. `fill-rule="evenodd"` hace el agujero.
     */
    exteriorDe(contornos, { clase = 'f' } = {}) {
      const marco = `M0 0L${ancho} 0L${ancho} ${alto}L0 ${alto}Z`;
      const huecos = contornos
        .map((c) => trazo(typeof c === 'function' ? api.muestra(c, [0, 2 * Math.PI], 120) : c.map(([u, v]) => P(u, v)), true))
        .join('');
      piezas.push(`<path class="${id}-${clase}" fill-rule="evenodd" d="${marco}${huecos}"/>`);
      return api;
    },

    circunferencia(cx, cy, radio, { clase = 'c', n = 120 } = {}) {
      return api.curva(
        (t) => [cx + radio * Math.cos(t), cy + radio * Math.sin(t)],
        [0, 2 * Math.PI],
        { clase, n, cerrar: true },
      );
    },

    disco(cx, cy, radio, { clase = 'f', n = 120 } = {}) {
      return api.curva(
        (t) => [cx + radio * Math.cos(t), cy + radio * Math.sin(t)],
        [0, 2 * Math.PI],
        { clase, n, cerrar: true },
      );
    },

    /** Una flecha, con la punta dibujada en píxeles para que no se deforme. */
    flecha(desde, hasta, { clase = 'c', punta = 7, color = 'var(--live)' } = {}) {
      const [ax, ay] = P(...desde);
      const [bx, by] = P(...hasta);
      const ang = Math.atan2(by - ay, bx - ax);
      const ala = (d) => [
        r1(bx - punta * Math.cos(ang + d)),
        r1(by - punta * Math.sin(ang + d)),
      ];
      const [p1x, p1y] = ala(0.42);
      const [p2x, p2y] = ala(-0.42);
      piezas.push(`<path class="${id}-${clase}" d="M${ax} ${ay}L${bx} ${by}"/>`);
      piezas.push(
        `<path class="${id}-punta" fill="${color}" d="M${bx} ${by}L${p1x} ${p1y}L${p2x} ${p2y}Z"/>`,
      );
      return api;
    },

    punto(u, v, { clase = 'pt', r = 4 } = {}) {
      const [px, py] = P(u, v);
      piezas.push(`<circle class="${id}-${clase}" cx="${px}" cy="${py}" r="${r}"/>`);
      return api;
    },

    /** Un rótulo en coordenadas de la asignatura, con su halo de papel. */
    rotulo(u, v, texto, { color = 'var(--live)', anclaje = 'start', dx = 0, dy = 0, pequeno = false } = {}) {
      const [px, py] = P(u, v);
      encuadra(px + dx, py + dy, texto, anclaje, pequeno);
      piezas.push(
        `<text class="${id}-${pequeno ? 'n' : 'l'}" x="${r1(px + dx)}" y="${r1(py + dy)}"` +
          ` text-anchor="${anclaje}" fill="${color}">${esc(texto)}</text>`,
      );
      return api;
    },

    /** Un rótulo colocado en píxeles, para las esquinas del marco. */
    esquina(px, py, texto, { color = 'var(--live)', anclaje = 'start' } = {}) {
      encuadra(px, py, texto, anclaje, false);
      piezas.push(
        `<text class="${id}-l" x="${r1(px)}" y="${r1(py)}" text-anchor="${anclaje}" fill="${color}">${esc(texto)}</text>`,
      );
      return api;
    },

    /** Las piezas en crudo, para montar un mosaico con varias en la misma
     *  figura. El marco se comprueba igual: cada panel es su propio lienzo. */
    partes() {
      if (desbordes) throw new Error(`${id}: ${desbordes} punto(s) fuera del panel — ${culpables.join("; ")}`);
      return { piezas: piezas.slice(), clases: new Map(clases), ancho, alto };
    },

    svg() {
      if (desbordes) throw new Error(`${id}: ${desbordes} punto(s) fuera del viewBox — ${culpables.join("; ")}`);

      const base = clasesBase();
      for (const [k, v] of clases) base.set(k, v);

      const css = [...base]
        .map(([k, v]) => `      .${id}-${k} { ${v} }`)
        .join('\n');

      return [
        `<svg viewBox="0 0 ${ancho} ${alto}" role="img" width="${ancho}" height="${alto}"`,
        `     aria-labelledby="${id}-t ${id}-d">`,
        `  <title id="${id}-t">${esc(titulo)}</title>`,
        `  <desc id="${id}-d">${esc(desc)}</desc>`,
        '  <style>',
        css,
        '  </style>',
        ...piezas.map((p) => '  ' + p),
        '</svg>',
      ].join('\n');
    },
  };

  return api;
}

/** Sangra un SVG para pegarlo bajo `figura: |` en un `ejercicios.yaml`. */
export function paraYaml(svg, sangria = 10) {
  const s = ' '.repeat(sangria);
  return svg
    .split('\n')
    .map((l) => (l.trim() ? s + l : l))
    .join('\n');
}

/**
 * Varias figuritas en un mismo SVG.
 *
 * Hay ejercicios del boletín que piden ocho representaciones —una por
 * apartado— y la consigna dice expresamente «cada una en unos ejes pequeños e
 * independientes». Amontonarlas en un solo par de ejes sería dibujar otra cosa
 * distinta de la que se pide.
 *
 * Cada celda recibe su propio lienzo, con el mismo prefijo de clases, y se
 * coloca con un `translate`. El marco de cada panel se comprueba por separado.
 */
export function mosaico({ id, titulo, desc, columnas, celdas, ancho = 168, alto = 150, hueco = 6 }) {
  const filas = Math.ceil(celdas.length / columnas);
  const W = columnas * ancho + (columnas - 1) * hueco;
  const H = filas * (alto + 16) + (filas - 1) * hueco;

  const piezas = [];
  const clases = clasesBase();

  celdas.forEach((celda, k) => {
    const col = k % columnas;
    const fil = Math.floor(k / columnas);
    const dx = col * (ancho + hueco);
    const dy = fil * (alto + 16 + hueco);

    const panel = lienzo({
      id,
      ancho,
      alto,
      x: celda.x,
      y: celda.y,
      margen: celda.margen ?? 18,
      cuadrado: celda.cuadrado ?? true,
      titulo,
      desc,
    });
    celda.dibuja(panel);
    const { piezas: dentro, clases: extra } = panel.partes();
    for (const [a, b] of extra) clases.set(a, b);

    piezas.push(
      `<g transform="translate(${dx} ${dy + 16})">` +
        `<text class="${id}-l" x="2" y="-5" fill="var(--live)">${esc(celda.etiqueta)}</text>` +
        dentro.join('') +
        '</g>',
    );
  });

  const css = [...clases].map(([k, v]) => `      .${id}-${k} { ${v} }`).join('\n');

  return [
    `<svg viewBox="0 0 ${W} ${H}" role="img" width="${W}" height="${H}"`,
    `     aria-labelledby="${id}-t ${id}-d">`,
    `  <title id="${id}-t">${esc(titulo)}</title>`,
    `  <desc id="${id}-d">${esc(desc)}</desc>`,
    '  <style>',
    css,
    '  </style>',
    ...piezas.map((p) => '  ' + p),
    '</svg>',
  ].join('\n');
}

/**
 * Una vista isométrica, para los sólidos del tema 7.
 *
 * No hace falta un motor 3D: los sólidos de la asignatura son superficies de
 * revolución y prismas, y todos se leen bien con una isometría de las de toda
 * la vida —la misma que se dibuja a mano en el examen—. Lo que devuelve es un
 * proyector: le das un punto del espacio y te da el punto del plano, y a
 * partir de ahí se usa el lienzo normal.
 *
 * El eje Z va hacia arriba en la pantalla, que es como lo dibuja el enunciado.
 */
export function vista3d({ escalaXY = 0.62, inclinacion = 0.45 } = {}) {
  const c = Math.cos(Math.PI / 6);
  const s = Math.sin(Math.PI / 6);
  const p3 = (x, y, z) => [
    (x - y) * c * escalaXY,
    z + (x + y) * s * inclinacion,
  ];

  /** Una circunferencia horizontal a altura z, con radios distintos en x e y. */
  p3.aro = (z, a, b = a, n = 96, cx = 0, cy = 0) =>
    Array.from({ length: n + 1 }, (_, k) => {
      const t = (2 * Math.PI * k) / n;
      return p3(cx + a * Math.cos(t), cy + b * Math.sin(t), z);
    });

  /** Un meridiano: el perfil r(z) girado al ángulo `theta`. */
  p3.meridiano = (rDe, [z0, z1], theta, n = 60) =>
    Array.from({ length: n + 1 }, (_, k) => {
      const z = z0 + ((z1 - z0) * k) / n;
      const r = rDe(z);
      return p3(r * Math.cos(theta), r * Math.sin(theta), z);
    });

  return p3;
}

/**
 * La misma figura, con otro prefijo de ids.
 *
 * Nueve ejercicios de examen piden exactamente el mismo dibujo que un ejemplo
 * de su tema —son el mismo problema, uno como examen y otro como material de
 * entrada—. Volver a escribirlo sería tener dos figuras que pueden dejar de
 * coincidir; copiarlo tal cual chocaría con los ids si los dos acaban en la
 * misma página. Esto copia y renombra.
 */
export const reetiqueta = (svg, viejo, nuevo) => {
  if (!svg.includes(viejo)) throw new Error(`reetiqueta: no encuentro ${viejo}`);
  return svg.replaceAll(viejo, nuevo);
};
