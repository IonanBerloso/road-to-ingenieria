/**
 * Intérprete de condiciones sobre el plano complejo.
 *
 * Es el motor del patrón Verificador (CLAUDE.md §05): el alumno escribe su
 * condición simplificada y el sistema comprueba si define **la misma región**
 * que la del enunciado. No se compara texto ni se busca una respuesta
 * concreta: se comparan dos conjuntos de puntos. Por eso vale cualquier forma
 * equivalente de escribirla, que es justo lo que un examen debería premiar.
 *
 * Portado de `referencia/regiones-complejos.html`, con dos añadidos: las
 * variables reales `x` e `y` —el prototipo solo entendía `z`— y los tests.
 */

export interface Complejo {
  re: number;
  im: number;
}

const C = (re: number, im = 0): Complejo => ({ re, im });
const suma = (a: Complejo, b: Complejo) => C(a.re + b.re, a.im + b.im);
const resta = (a: Complejo, b: Complejo) => C(a.re - b.re, a.im - b.im);
const producto = (a: Complejo, b: Complejo) =>
  C(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);

const cociente = (a: Complejo, b: Complejo) => {
  const d = b.re * b.re + b.im * b.im;
  return C((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d);
};

/** Potencia. Con exponente entero se hace por cuadrados repetidos, que es
 *  exacto; con cualquier otro se pasa por la forma polar. */
function potencia(a: Complejo, b: Complejo): Complejo {
  if (Math.abs(b.im) < 1e-12 && Math.abs(b.re - Math.round(b.re)) < 1e-12) {
    let n = Math.abs(Math.round(b.re));
    const negativo = b.re < 0;
    let r = C(1, 0);
    let base = a;
    while (n) {
      if (n & 1) r = producto(r, base);
      base = producto(base, base);
      n >>= 1;
    }
    return negativo ? cociente(C(1, 0), r) : r;
  }
  const m = Math.hypot(a.re, a.im);
  if (m === 0) return C(0, 0);
  const th = Math.atan2(a.im, a.re);
  const lr = Math.log(m);
  const nr = b.re * lr - b.im * th;
  const ni = b.im * lr + b.re * th;
  const em = Math.exp(nr);
  return C(em * Math.cos(ni), em * Math.sin(ni));
}

/* ── tokenizador ─────────────────────────────────────────────────────── */

type Ficha = { t: string; v?: number | string };

function fichas(entrada: string): Ficha[] {
  const salida: Ficha[] = [];
  const s = entrada.replace(/[−–—]/g, '-').replace(/,/g, '.').replace(/≤/g, '<=').replace(/≥/g, '>=');
  let i = 0;

  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      salida.push({ t: 'num', v: parseFloat(s.slice(i, j)) });
      i = j;
      continue;
    }
    if (/[a-zA-Z]/.test(c)) {
      let j = i;
      while (j < s.length && /[a-zA-Z]/.test(s[j])) j++;
      const palabra = s.slice(i, j);
      salida.push(palabra.toLowerCase() === 'and' ? { t: 'and' } : { t: 'id', v: palabra });
      i = j;
      continue;
    }
    if (c === '<' || c === '>') {
      if (s[i + 1] === '=') {
        salida.push({ t: 'cmp', v: c + '=' });
        i += 2;
      } else {
        salida.push({ t: 'cmp', v: c });
        i++;
      }
      continue;
    }
    if (c === '=') {
      salida.push({ t: 'cmp', v: '=' });
      i++;
      continue;
    }
    if (c === '&') {
      salida.push({ t: 'and' });
      i++;
      continue;
    }
    if ('+-*/^()|'.includes(c)) {
      salida.push({ t: c });
      i++;
      continue;
    }
    throw new Error(`no entiendo el carácter «${c}»`);
  }
  return salida;
}

/* ── análisis sintáctico ─────────────────────────────────────────────── */

type Nodo = { o: string; a?: Nodo; b?: Nodo; v?: number; im?: number };
export interface Condicion {
  izq: Nodo;
  op1: string;
  centro: Nodo;
  op2: string | null;
  der: Nodo | null;
}

const FUNCIONES = ['re', 'im', 'arg', 'abs', 'conj', 'sqrt', 'exp', 'ln'];

/**
 * Convierte el texto en una condición. Lanza un error con un mensaje en
 * castellano si no se entiende: el alumno tiene que poder corregirse.
 */
export function analiza(texto: string): Condicion[] {
  const T = fichas(texto);
  let p = 0;
  /* Dentro de |…| la barra siguiente CIERRA, no abre otro factor. Sin esta
     cuenta, «|z| < 2» se lee como el producto de |z| por algo que empieza en
     la barra de cierre, y el análisis descarrila. */
  let barras = 0;
  const mirar = () => T[p];
  const comer = (x: string) => {
    if (!T[p] || T[p].t !== x) throw new Error(`falta «${x}»`);
    return T[p++];
  };

  function expr(): Nodo {
    let n = termino();
    while (mirar() && (mirar().t === '+' || mirar().t === '-')) {
      const o = T[p++].t;
      n = { o, a: n, b: termino() };
    }
    return n;
  }

  function termino(): Nodo {
    let n = factor();
    for (;;) {
      if (mirar() && (mirar().t === '*' || mirar().t === '/')) {
        const o = T[p++].t;
        n = { o, a: n, b: factor() };
        continue;
      }
      // Producto implícito: 2z, 3(x+1), x y
      const siguiente = mirar();
      const abreFactor =
        siguiente &&
        (['num', 'id', '('].includes(siguiente.t) || (siguiente.t === '|' && barras === 0));
      if (abreFactor) {
        n = { o: '*', a: n, b: factor() };
        continue;
      }
      break;
    }
    return n;
  }

  const factor = (): Nodo => unario();

  /** El signo menos se aplica DESPUÉS de la potencia: «-x^2» es «-(x^2)», no
   *  «(-x)^2». Al revés cambia la región y no salta ningún error: en el
   *  ejercicio 1.24 convertía una parábola hacia abajo en una hacia arriba. */
  function unario(): Nodo {
    if (mirar() && mirar().t === '-') {
      p++;
      return { o: 'neg', a: unario() };
    }
    if (mirar() && mirar().t === '+') {
      p++;
      return unario();
    }
    return potenciaNodo();
  }

  function potenciaNodo(): Nodo {
    const n = primario();
    if (mirar() && mirar().t === '^') {
      p++;
      return { o: '^', a: n, b: unario() };
    }
    return n;
  }

  function primario(): Nodo {
    const k = mirar();
    if (!k) throw new Error('la expresión se corta antes de tiempo');
    if (k.t === 'num') {
      p++;
      return { o: 'n', v: k.v as number };
    }
    if (k.t === '(') {
      p++;
      const e = expr();
      comer(')');
      return e;
    }
    if (k.t === '|') {
      p++;
      barras++;
      const e = expr();
      barras--;
      comer('|');
      return { o: 'abs', a: e };
    }
    if (k.t === 'id') {
      const nombre = (k.v as string).toLowerCase();
      p++;
      if (nombre === 'z') return { o: 'z' };
      if (nombre === 'x') return { o: 'x' };
      if (nombre === 'y') return { o: 'y' };
      if (nombre === 'i') return { o: 'n', v: 0, im: 1 };
      if (nombre === 'pi') return { o: 'n', v: Math.PI };
      if (nombre === 'e' && (!mirar() || mirar().t !== '(')) return { o: 'n', v: Math.E };
      if (FUNCIONES.includes(nombre)) {
        comer('(');
        const a = expr();
        comer(')');
        return { o: nombre, a };
      }
      throw new Error(`no conozco «${k.v}»`);
    }
    throw new Error('no esperaba eso aquí');
  }

  /** Una condición suelta: expr cmp expr, o la doble desigualdad a < b < c. */
  function condicion(): Condicion {
    const izq = expr();
    if (!mirar()) throw new Error('falta una comparación: <, >, <=, >= o =');
    const op1 = comer('cmp').v as string;
    const centro = expr();
    let op2: string | null = null;
    let der: Nodo | null = null;
    if (mirar() && mirar().t === 'cmp') {
      op2 = comer('cmp').v as string;
      der = expr();
    }
    return { izq, op1, centro, op2, der };
  }

  /* Casi todos los lugares geométricos del boletín piden DOS condiciones a la
     vez. Se escriben unidas por «&» o por «and»; la coma no vale, porque en
     castellano es el separador decimal. */
  const condiciones = [condicion()];
  while (mirar() && mirar().t === 'and') {
    p++;
    condiciones.push(condicion());
  }
  if (p < T.length) throw new Error('sobra algo al final de la expresión');
  return condiciones;
}

/* ── evaluación ──────────────────────────────────────────────────────── */

function valor(n: Nodo, x: number, y: number): Complejo {
  switch (n.o) {
    case 'n':
      return C(n.v ?? 0, n.im ?? 0);
    case 'z':
      return C(x, y);
    case 'x':
      return C(x, 0);
    case 'y':
      return C(y, 0);
    case '+':
      return suma(valor(n.a!, x, y), valor(n.b!, x, y));
    case '-':
      return resta(valor(n.a!, x, y), valor(n.b!, x, y));
    case '*':
      return producto(valor(n.a!, x, y), valor(n.b!, x, y));
    case '/':
      return cociente(valor(n.a!, x, y), valor(n.b!, x, y));
    case '^':
      return potencia(valor(n.a!, x, y), valor(n.b!, x, y));
    case 'neg': {
      const v = valor(n.a!, x, y);
      return C(-v.re, -v.im);
    }
    case 'abs': {
      const v = valor(n.a!, x, y);
      return C(Math.hypot(v.re, v.im), 0);
    }
    case 're':
      return C(valor(n.a!, x, y).re, 0);
    case 'im':
      return C(valor(n.a!, x, y).im, 0);
    case 'arg': {
      const v = valor(n.a!, x, y);
      return C(Math.atan2(v.im, v.re), 0);
    }
    case 'conj': {
      const v = valor(n.a!, x, y);
      return C(v.re, -v.im);
    }
    case 'sqrt':
      return potencia(valor(n.a!, x, y), C(0.5, 0));
    case 'exp':
      return potencia(C(Math.E, 0), valor(n.a!, x, y));
    case 'ln': {
      const v = valor(n.a!, x, y);
      return C(Math.log(Math.hypot(v.re, v.im)), Math.atan2(v.im, v.re));
    }
  }
  throw new Error(`nodo desconocido: ${n.o}`);
}

const compara = (a: number, op: string, b: number, eps: number) => {
  switch (op) {
    case '<':
      return a < b;
    case '>':
      return a > b;
    case '<=':
      return a <= b;
    case '>=':
      return a >= b;
    case '=':
      return Math.abs(a - b) < eps;
  }
  return false;
};

/**
 * Distancia aproximada del punto (x, y) a la curva «izq = der», medida **en el
 * plano** y no en el valor de la expresión.
 *
 * Es la corrección que hace utilizable el patrón con igualdades. Comparando
 * `|izq - der| < eps` a secas, la banda que se dibuja es más ancha allí donde
 * la expresión varía despacio, y sobre todo **cambia si multiplicas la ecuación
 * por dos**. Medido el 23 de agosto de 2026: la elipse escrita como suma de
 * distancias daba 104 puntos y la misma elipse en forma canónica 208, así que
 * `mismaRegion` declaraba distintas dos formas equivalentes de la misma curva.
 *
 * Dividiendo entre el módulo del gradiente, la banda pasa a tener una anchura
 * geométrica fija: es la linealización |d| / |∇d|, que es la distancia a la
 * curva de nivel. Cualquier forma equivalente da la misma banda.
 */
function distanciaACurva(
  izq: Nodo,
  der: Nodo,
  x: number,
  y: number,
): number {
  const d = (px: number, py: number) => valor(izq, px, py).re - valor(der, px, py).re;
  const aqui = d(x, y);
  if (!Number.isFinite(aqui)) return Infinity;
  const h = 1e-5;
  const gx = (d(x + h, y) - d(x - h, y)) / (2 * h);
  const gy = (d(x, y + h) - d(x, y - h)) / (2 * h);
  const g = Math.hypot(gx, gy);
  /* Sin gradiente no hay curva: es una identidad entre constantes, como
     `2^-1 = 0.5`, que se cumple en todo el plano o en ninguna parte. Ahí la
     normalización no significa nada y se compara el valor, como antes. */
  if (!Number.isFinite(g) || g < 1e-12) return Math.abs(aqui);
  return Math.abs(aqui) / g;
}

/** ¿Cumple el punto (x, y) la condición? */
export function cumple(cs: Condicion[], x: number, y: number, eps = 0.04): boolean {
  return cs.every((c) => cumpleUna(c, x, y, eps));
}

function cumpleUna(c: Condicion, x: number, y: number, eps: number): boolean {
  const izq = valor(c.izq, x, y).re;
  const centro = valor(c.centro, x, y).re;
  if (!Number.isFinite(izq) || !Number.isFinite(centro)) return false;
  if (c.op1 === '=') {
    if (distanciaACurva(c.izq, c.centro, x, y) >= eps) return false;
  } else if (!compara(izq, c.op1, centro, eps)) return false;
  if (c.op2 && c.der) {
    const der = valor(c.der, x, y).re;
    if (!Number.isFinite(der)) return false;
    if (c.op2 === '=') {
      if (distanciaACurva(c.centro, c.der, x, y) >= eps) return false;
    } else if (!compara(centro, c.op2, der, eps)) return false;
  }
  return true;
}

export interface Ventana {
  x: [number, number];
  y: [number, number];
}

/**
 * Compara dos condiciones muestreando una rejilla: ¿definen la misma región?
 *
 * No se exige coincidencia celda a celda. Un punto de una cuenta como
 * emparejado si la otra tiene **alguna** marca en las ocho celdas de alrededor.
 * Esa holgura de una celda es lo que hace utilizable la comparación con curvas:
 * dos formas equivalentes de la misma circunferencia rasterizan bandas que se
 * pisan pero no coinciden exactamente, y sin la holgura el desacuerdo llegaba
 * al 19 % de los puntos —medido el 23 de agosto de 2026 sobre la Apolonio de
 * 2021-2022— mientras que media circunferencia de más solo costaba el 0,4 %
 * del total. Es decir: sin holgura el umbral tenía que caer entre 52 y 54
 * puntos de 14 400, y cualquier calibrado así es mentira.
 *
 * Con la holgura, el temblor del borde desaparece y lo que sobrevive es lo que
 * de verdad sobra o falta.
 */
export function mismaRegion(
  a: Condicion[],
  b: Condicion[],
  ventana: Ventana,
  lado = 90,
): { iguales: boolean; sobra: number; falta: number; total: number } {
  /* La tolerancia de las igualdades se ata al paso de la rejilla. Con un valor
     fijo la banda puede salir más fina que la separación entre muestras, y
     entonces una recta vertical se cuela entre dos columnas y no se dibuja ni
     un punto de ella. Medido con `arg(1/(z-2-3i)) = pi/2`: cero puntos de
     40 000. Con la banda a ras del paso, la curva siempre se muestrea. */
  const paso = Math.max(
    (ventana.x[1] - ventana.x[0]) / lado,
    (ventana.y[1] - ventana.y[0]) / lado,
  );
  const eps = 0.7 * paso;

  const gA: boolean[] = new Array(lado * lado).fill(false);
  const gB: boolean[] = new Array(lado * lado).fill(false);
  for (let i = 0; i < lado; i++) {
    const x = ventana.x[0] + ((ventana.x[1] - ventana.x[0]) * (i + 0.5)) / lado;
    for (let j = 0; j < lado; j++) {
      const y = ventana.y[0] + ((ventana.y[1] - ventana.y[0]) * (j + 0.5)) / lado;
      const k = i * lado + j;
      gA[k] = cumple(a, x, y, eps);
      gB[k] = cumple(b, x, y, eps);
    }
  }

  /** ¿Hay marca en la celda o en alguna de sus vecinas? */
  const cerca = (g: boolean[], i: number, j: number) => {
    for (let di = -1; di <= 1; di++) {
      const ii = i + di;
      if (ii < 0 || ii >= lado) continue;
      for (let dj = -1; dj <= 1; dj++) {
        const jj = j + dj;
        if (jj < 0 || jj >= lado) continue;
        if (g[ii * lado + jj]) return true;
      }
    }
    return false;
  };

  let sobra = 0; // marcado en B y sin nada de A al lado
  let falta = 0; // marcado en A y sin nada de B al lado
  const total = lado * lado;
  for (let i = 0; i < lado; i++) {
    for (let j = 0; j < lado; j++) {
      const k = i * lado + j;
      if (gA[k] && !cerca(gB, i, j)) falta++;
      else if (gB[k] && !cerca(gA, i, j)) sobra++;
    }
  }

  /* Con la holgura de una celda, el desacuerdo de una respuesta correcta cae a
     casi cero, así que el margen puede ser mucho más estrecho que antes — y
     tiene que serlo. Medido sobre seis casos el 23 de agosto de 2026: las
     respuestas correctas desacuerdan en 0, 0, 4, 0, 0 y 0 puntos de 14 400, y
     las equivocadas en 50, 328, 457, 60, 118 y 488. El 1 % de antes valía 144
     y habría dado por buena media circunferencia de más. */
  const margen = Math.max(6, Math.round(total * 0.001));
  return { iguales: sobra + falta <= margen, sobra, falta, total };
}

/**
 * Evalúa una expresión numérica cerrada —sin `z`, `x` ni `y`— y devuelve su
 * valor complejo, o `null` si no se entiende.
 *
 * Existe por una razón concreta: **en el examen no se puede usar
 * calculadora**. Un área que vale exactamente $(e^{2}-1)/2$ no se puede
 * escribir con cuatro decimales en el aula, así que la forma exacta tiene que
 * valer como respuesta. Con esto, `pi/4`, `(e^2-1)/2`, `sqrt(3)/2` y
 * `2+3i` se leen igual de bien que `0,7854`.
 *
 * Reutiliza el analizador de condiciones en vez de duplicarlo: se le añade
 * `= 0` a la expresión y se evalúa el lado izquierdo (§01).
 */
export function evaluaNumero(texto: string): Complejo | null {
  const limpio = (texto ?? '').trim();
  if (!limpio) return null;
  /* Una respuesta con variable libre no es un número: `x^2` no vale como
     respuesta a «¿cuánto mide el área?», y evaluarla en cero daría un 0
     silencioso, que es peor que no entenderla. */
  if (/(^|[^a-z])[zxy]([^a-z]|$)/i.test(limpio)) return null;
  try {
    const cs = analiza(`${limpio} = 0`);
    if (cs.length !== 1) return null;
    const v = valor(cs[0].izq, 0, 0);
    return Number.isFinite(v.re) && Number.isFinite(v.im) ? v : null;
  } catch {
    return null;
  }
}
