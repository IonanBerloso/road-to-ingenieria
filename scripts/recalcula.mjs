/* scripts/recalcula.mjs — recalcular, no mirar.
 *
 * POR QUÉ EXISTE
 * El 28 de agosto de 2026 una auditoría que recalculaba las matemáticas
 * encontró ocho ejercicios que enseñaban algo falso, en un corpus donde
 * `npm run suelo` estaba en verde y §15 cumplida. Los guardianes de §11
 * demuestran que el sitio no está roto; ninguno mira si las cuentas salen.
 *
 * Antes de esto se intentaron TRES comprobaciones y las tres se descartaron:
 *   · comparar el `valor` con los números de su `desarrollo` — 26 avisos de
 *     323 y casi todos falsos;
 *   · comprobar la aritmética que el desarrollo escribe — solo 10 patrones
 *     comparables en todo el corpus, y 8 falsos;
 *   · comparar el `valor` con el final del desarrollo — el desarrollo de un
 *     paso termina muchas veces en una magnitud intermedia, y restringirlo al
 *     \boxed dejaba 2 casos comparables de 1.055, con uno falso.
 * Lo que sí funciona es evaluar de verdad las expresiones que el propio
 * corpus escribe y compararlas con el decimal que él mismo declara.
 *
 * QUÉ COMPRUEBA — solo lo que el contenido ya afirma, nunca algo inventado:
 *   1. Cada «EXPRESIÓN \approx DECIMAL» **y cada «EXPRESIÓN = DECIMAL»** de
 *      una resolución, un desarrollo, una pista o la prosa de un tema: que el
 *      decimal sea el valor de la expresión.
 *   2. Cada `formato` que lleva la forma exacta entre paréntesis
 *      —«en forma exacta (8pi) o con cuatro decimales»—: que coincida con
 *      el `valor` guardado, dentro de su `tolerancia`.
 *
 * EL `=` ENTRÓ EL 4 DE SEPTIEMBRE DE 2026, y hasta ese día este guion **no
 * comprobaba ni un número de Fluidos** —su corpus escribe `=` y no `\approx`—,
 * es decir, la asignatura con más aritmética del proyecto. De 279 pares a
 * 1.991. El primer pase encontró diez desajustes reales, cinco de ellos en
 * Cálculo, una asignatura cerrada y dada por verificada.
 *
 * LA CONCESIÓN QUE HUBO QUE HACER, dicha aquí y en §11: cuando el número lleva
 * unidad escrita se acepta **cualquier potencia de diez** como lectura, porque
 * el corpus calcula en centímetros y escribe en milímetros con toda
 * naturalidad. Consecuencia: un error de factor mil pasa desapercibido si el
 * número lleva unidad detrás. Sin eso, veinte de treinta y tres avisos eran
 * ruido y el guardián se habría acabado ignorando (§11).
 *
 * QUÉ NO HACE
 * No entra en `npm run suelo`: tarda, y §11 dice que un guardián que se
 * ignora es peor que ninguno. Se pasa al CERRAR una asignatura, junto con el
 * recuento de cifras de CLAUDE.md.
 *
 * Lo que no sabe evaluar lo declara como «no evaluable» y no lo cuenta como
 * fallo. Un falso positivo aquí enseñaría a saltarse el guion.
 *
 *   node scripts/recalcula.mjs [asignatura]
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import yaml from 'js-yaml';
import { leeMagnitud } from '../src/lib/unidades.ts';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENIDO = join(RAIZ, 'src', 'content');

/* ───────────────────────── el evaluador ─────────────────────────
   LaTeX → cadena aritmética → número. Si aparece cualquier símbolo que no
   conoce, devuelve null y el par se salta. Es deliberado: preferimos no
   comprobar algo a comprobarlo mal. */

const FUNCIONES = {
  sqrt: Math.sqrt, sin: Math.sin, cos: Math.cos, tan: Math.tan,
  sen: Math.sin, tg: Math.tan, ln: Math.log, log: Math.log10,
  exp: Math.exp, abs: Math.abs, arctan: Math.atan, arcsin: Math.asin,
  arccos: Math.acos, sh: Math.sinh, ch: Math.cosh, senh: Math.sinh, cosh: Math.cosh,
};

/** Pasa una expresión LaTeX a algo que el analizador de abajo entienda. */
function normaliza(tex) {
  let s = tex;

  /* el separador decimal del corpus */
  s = s.replace(/\{,\}/g, '.');

  /* espaciadores y adornos que no cambian el valor */
  s = s.replace(/\\[,;:!]/g, ' ').replace(/\\quad|\\qquad/g, ' ');
  s = s.replace(/\\left|\\right/g, '');
  s = s.replace(/\\displaystyle/g, ' ');
  s = s.replace(/\\bigl|\\bigr|\\Bigl|\\Bigr|\\biggl|\\biggr/g, '');

  /* \frac{A}{B} → ((A)/(B)), repetido para los anidados */
  const frac = /\\[dt]?frac\s*\{((?:[^{}]|\{[^{}]*\})*)\}\s*\{((?:[^{}]|\{[^{}]*\})*)\}/;
  for (let i = 0; i < 12 && frac.test(s); i++) s = s.replace(frac, '(($1)/($2))');

  /* \sqrt[n]{A} y \sqrt{A} */
  s = s.replace(/\\sqrt\s*\[([^\]]+)\]\s*\{((?:[^{}]|\{[^{}]*\})*)\}/g, '(($2)^(1/($1)))');
  s = s.replace(/\\sqrt\s*\{((?:[^{}]|\{[^{}]*\})*)\}/g, 'sqrt($1)');
  s = s.replace(/\\sqrt\s*(\d+)/g, 'sqrt($1)');

  /* nombres de función, en todas las formas en que el corpus los escribe */
  s = s.replace(/\\(?:operatorname|mathrm|text|mathop)\s*\{\s*([A-Za-z]+)\s*\}/g, '$1');
  s = s.replace(/\\(arctan|arcsin|arccos|senh|cosh|sinh|sin|cos|tan|ln|log|exp|sh|ch|tg)\b/g, '$1');

  /* constantes */
  s = s.replace(/\\pi\b/g, 'PI');
  s = s.replace(/\\cdot|\\times/g, '*');

  /* potencias: ^{n} → ^(n) */
  s = s.replace(/\^\s*\{([^{}]*)\}/g, '^($1)');

  /* la e de Euler: solo cuando va suelta o elevada, nunca dentro de palabra */
  s = s.replace(/(?<![A-Za-z])e(?![A-Za-z])/g, 'E');

  /* llaves de agrupación que sobreviven */
  s = s.replace(/[{}]/g, '');

  return s.trim();
}

/** Analizador descendente. Devuelve null ante cualquier cosa que no entienda. */
function evalua(texto) {
  return evaluaNormalizado(normaliza(texto));
}

/** Lo mismo, sobre una cadena que ya ha pasado por `normaliza`. Existe aparte
 *  porque `margenPorRedondeo` tiene que retocar literales *después* de
 *  normalizar y volver a evaluar sin deshacer el trabajo. */
function evaluaNormalizado(s) {
  if (!s) return null;
  /* si queda alguna letra que no sea una función conocida, PI o E, no es
     un número: puede llevar una x, una n, un subíndice… */
  const restos = s.replace(/\b(?:PI|E)\b/g, '').replace(
    new RegExp(`\\b(?:${Object.keys(FUNCIONES).join('|')})\\b`, 'g'), '');
  if (/[A-Za-z\\]/.test(restos)) return null;

  let i = 0;
  const salta = () => { while (i < s.length && /\s/.test(s[i])) i++; };
  const mira = () => { salta(); return s[i]; };

  function primario() {
    salta();
    if (s[i] === '(') { i++; const v = suma(); salta(); if (s[i] !== ')') throw 0; i++; return v; }
    if (s[i] === '-') { i++; return -primario(); }
    if (s[i] === '+') { i++; return primario(); }
    const nom = /^[A-Za-z]+/.exec(s.slice(i));
    if (nom) {
      const n = nom[0]; i += n.length;
      if (n === 'PI') return Math.PI;
      if (n === 'E') return Math.E;
      const f = FUNCIONES[n];
      if (!f) throw 0;
      salta();
      if (s[i] !== '(') throw 0;
      i++; const arg = suma(); salta(); if (s[i] !== ')') throw 0; i++;
      return f(arg);
    }
    const num = /^\d+(?:\.\d+)?/.exec(s.slice(i));
    if (!num) throw 0;
    i += num[0].length;
    return parseFloat(num[0]);
  }
  function potencia() {
    const b = primario();
    salta();
    if (s[i] === '^') { i++; return b ** potencia(); }
    return b;
  }
  function producto() {
    let v = potencia();
    for (;;) {
      salta();
      if (s[i] === '*') { i++; v *= potencia(); continue; }
      if (s[i] === '/') { i++; v /= potencia(); continue; }
      /* yuxtaposición: 2PI, 3sqrt(2), (a)(b) */
      if (s[i] === '(' || /[A-Za-z]/.test(s[i] ?? '')) { v *= potencia(); continue; }
      return v;
    }
  }
  function suma() {
    let v = producto();
    for (;;) {
      salta();
      if (s[i] === '+') { i++; v += producto(); continue; }
      if (s[i] === '-') { i++; v -= producto(); continue; }
      return v;
    }
  }
  try {
    const v = suma();
    salta();
    if (i !== s.length) return null;
    return Number.isFinite(v) ? v : null;
  } catch { return null; }
}

/* ───────────────────── recorrer el corpus ───────────────────── */

/**
 * Une las líneas de dentro de un `$$…$$`, que en LaTeX no significan nada.
 *
 * El corpus parte las fórmulas largas a 80 columnas, y `expresionAntesDe`
 * cortaba por el salto: de
 * `43\,\frac{0{,}3106}{1{,}205}\n\Bigl(\frac{859{,}6}{1000}\Bigr)^{2} = 8{,}19`
 * se quedaba con el paréntesis y comparaba un trozo contra el total. Sustituir
 * el salto por un espacio **conserva las posiciones**, que es lo que permite
 * seguir leyendo la unidad que viene detrás del número.
 */
function unePartidas(txt) {
  return txt.replace(/\$\$[\s\S]*?\$\$/g, (b) => b.replace(/\n/g, ' '));
}

/** El trozo de LaTeX que precede a un signo de valor, hasta el último corte. */
function expresionAntesDe(texto, pos) {
  const desde = texto.slice(0, pos);
  /* Todo lo que separa una afirmación de la siguiente. `\quad` y `\qquad`
     entran porque el corpus pone dos fórmulas en la misma línea —«R_H = 0{,}25
     \qquad J = (…)^2»— y sin ellos el extractor arrastra la anterior entera.
     Se corta **detrás** del separador, no delante, o quedan letras sueltas. */
  const SEPARA = ['=', '\\approx', '$$', '\n', '$', '&', '\\\\', '\\qquad', '\\quad'];
  const corte = Math.max(...SEPARA.map((s) => {
    const i = desde.lastIndexOf(s);
    return i < 0 ? -1 : i + s.length - 1;
  }));
  const trozo = desde.slice(corte + 1).replace(/\\boxed\s*\{/, '').trim();
  /* Un «+» al principio significa que el corte cayó en medio de una suma
     —una serie escrita en varias líneas—, así que lo que hay no es la
     expresión entera y no se puede comparar. */
  if (trozo.startsWith('+')) return '';
  /* Empezar por un **cierre** o por un operador significa que el corte cayó
     dentro de la expresión y no delante de ella.
     Ojo con lo que NO va en esta lista: `(` y `{` abren, y una expresión
     perfectamente normal empieza por paréntesis. La primera versión los
     incluía y **se comía en silencio todos los pares cuyo lado izquierdo
     abría paréntesis** —«(10 − 6,804) + 0,212 − 0,33 = 3,08»—. No lo cazó
     ninguna cuenta: lo cazó la validación al revés que pide §11, metiendo un
     fallo a mano y viendo que el guion seguía en verde. */
  if (/^[}\])*\/^]/.test(trozo) || /^\\(cdot|times)\b/.test(trozo)) return '';
  /* Y si las llaves o los paréntesis no cierran, el corte partió la expresión
     por la mitad: pasa cuando un `=` vive dentro de un \frac o de un \left(.
     Fue la tercera clase de falso positivo al medir la ampliación a `=`. */
  for (const [a, b] of [['{', '}'], ['(', ')'], ['[', ']']]) {
    const n = trozo.split(a).length - trozo.split(b).length;
    if (n !== 0) return '';
  }
  return trozo;
}

/**
 * La unidad que el corpus escribe justo detrás de un número, si la escribe.
 *
 * Existe para la clase de falso positivo más numerosa al ampliar el guion a
 * `=`: la cadena cambia de unidad a mitad de camino —«9800·2·4 = 78,4 kN»— y
 * el evaluador, que trabaja con los números pelados, ve un factor mil. La
 * unidad la lee `src/lib/unidades.ts`, el mismo lector que corrige las
 * respuestas del alumno; aquí solo hay que extraer el símbolo.
 */
function unidadTras(texto, pos) {
  const cola = texto.slice(pos, pos + 60);
  /* Tres formas en que el corpus la escribe: `\text{kN}` dentro de la fórmula,
     `^\circ` para los grados, y —en la prosa— cerrando el `$` y poniéndola
     fuera: «$Q = 25{,}15\cdot\pi\cdot 0{,}03^{2}/4 = 17{,}8$ l/s». */
  const m = /^\s*(?:\\[,;:!\s]|\\q?quad|~)*\s*(?:\\(?:text|mathrm|textrm)\s*\{([^{}]{1,14})\}|(\^\{?\\circ\}?)|\$\s*([A-Za-zµ][A-Za-z/²³^0-9]{0,6}))/
    .exec(cola);
  if (!m) return null;
  if (m[2]) return '°';
  /* «kPa abs», «m de agua»: la unidad es la primera palabra, el resto es
     aclaración. Y si lo que queda no es un símbolo —«milésimas», «veces»—
     sigue valiendo como señal de que ahí hay una anotación, y quien llama
     decide qué hacer con ella. */
  let u = (m[1] ?? m[3]).trim().split(/\s+/)[0];
  /* Un exponente que se quedó fuera de la llave: `\text{cm}^{3}` es cm³. */
  const exp = new RegExp(`^\\^\\{?(\\d)\\}?`).exec(cola.slice(m[0].length));
  if (m[1] && exp) u += '^' + exp[1];
  /* «m/s», «kN», «cm^3»… valen; una palabra entera —«de agua»— no es unidad. */
  return /^[A-Za-zµº°]{1,4}(?:\^\d)?(?:\/[A-Za-z]{1,3}(?:\^\d)?)?$/.test(u) ? u : null;
}

/**
 * Cuánto puede bailar el valor por culpa de los decimales ya redondeados que
 * la propia expresión escribe.
 *
 * POR QUÉ HACE FALTA. Al ampliar el guion a `=` (4 de septiembre de 2026) la
 * clase de falso positivo más numerosa fue esta: el corpus encadena
 * resultados —«v = 2,04 m/s» y luego «2{,}04^2/19{,}6 = 0{,}212»— y el
 * segundo número no puede cuadrar mejor de lo que permite el redondeo del
 * primero. Comparar contra media unidad del último dígito del *resultado*
 * marca esos casos como fallos cuando no lo son.
 *
 * Cómo se mide: cada literal decimal de la expresión se mueve media unidad de
 * su último dígito arriba y abajo, se reevalúa, y se suman las desviaciones
 * máximas. Los enteros se dan por exactos, que es lo que significan.
 */
function margenPorRedondeo(tex, base) {
  const s = normaliza(tex);
  let total = 0;
  const LIT = /\d+\.\d+/g;
  for (const m of s.matchAll(LIT)) {
    const dec = m[0].split('.')[1].length;
    const paso = 0.5 * 10 ** -dec;
    let peor = 0;
    for (const d of [paso, -paso]) {
      const nuevo = s.slice(0, m.index) + (parseFloat(m[0]) + d) + s.slice(m.index + m[0].length);
      const v = evaluaNormalizado(nuevo);
      if (v !== null && Number.isFinite(v)) peor = Math.max(peor, Math.abs(v - base));
    }
    total += peor;
  }
  return total;
}

function ficheros(asig) {
  const A = join(CONTENIDO, asig);
  if (!existsSync(A)) return [];
  const temas = readdirSync(A).filter((d) => /^t\d\d-/.test(d))
    .map((d) => [`${asig}/${d}`, join(A, d, 'ejercicios.yaml')]);
  const ex = existsSync(join(A, 'examenes'))
    ? readdirSync(join(A, 'examenes')).map((d) => [`${asig}/${d}`, join(A, 'examenes', d, 'ejercicios.yaml')])
    : [];
  return [...temas, ...ex].filter(([, f]) => existsSync(f));
}

/** La prosa de los temas. Va aparte porque no es YAML: el `.mdx` se trata como
 *  un bloque de texto suelto y se le pasan las mismas dos comprobaciones de
 *  pares. Entró el 4 de septiembre de 2026, al ampliar el guion a `=`: la
 *  prosa afirma tantos números como los ejercicios y no la miraba nadie. */
function prosas(asig) {
  const A = join(CONTENIDO, asig);
  if (!existsSync(A)) return [];
  return readdirSync(A).filter((d) => /^t\d\d-/.test(d))
    .map((d) => [`${asig}/${d} · prosa`, join(A, d, 'index.mdx')])
    .filter(([, f]) => existsSync(f));
}

const asigPedida = process.argv[2];
const asignaturas = (asigPedida ? [asigPedida] : readdirSync(CONTENIDO))
  .filter((d) => existsSync(join(CONTENIDO, d)) && ficheros(d).length);

let pares = 0, saltados = 0, conUnidad = 0, formatos = 0, formatosSaltados = 0, enteros = 0;
const fallos = [];

for (const asig of asignaturas) {
  /* La prosa entra como si fuera un ejercicio con un solo campo de texto: así
     pasa por las mismas comprobaciones sin duplicar ni una línea (§01). */
  const fuentes = [
    ...ficheros(asig).map(([donde, f]) => [donde, f, true]),
    ...prosas(asig).map(([donde, f]) => [donde, f, false]),
  ];
  for (const [donde, f, esYaml] of fuentes) {
    const doc = esYaml
      ? yaml.load(readFileSync(f, 'utf8'))
      : { ejercicios: [{ id: 'index.mdx', resolucion: readFileSync(f, 'utf8') }] };
    for (const e of doc.ejercicios ?? []) {
      /* 1 · los pares «expresión ≈ decimal» */
      const bloques = [
        ['resolucion', e.resolucion ?? ''],
        ...(e.pasos ?? []).flatMap((p, n) => [
          [`paso ${n + 1} desarrollo`, p.desarrollo ?? ''],
          [`paso ${n + 1} pista`, p.pista ?? ''],
        ]),
      ];
      for (const [sitio, crudo] of bloques) {
        const txt = unePartidas(crudo);
        /* El decimal puede venir con una potencia de diez detrás
           —«2{,}13\cdot10^{-5}»— o como porcentaje. Las dos cosas cambian el
           número, así que entran en la captura o el par se compara mal. */
        const COLA = String.raw`\s*(-?\d+(?:\{,\}|\.)\d+)\s*(?:(?:\\cdot|\\times)\s*10\^\{?(-?\d+)\}?)?\s*(?:\\[,;:!\s])*\s*(\\?%)?`;
        /* Los dos signos con los que el corpus da un valor. Hasta el 4 de
           septiembre de 2026 aquí solo estaba `\approx`, y por eso **Fluidos
           entera —la asignatura más numérica del proyecto— no tenía ni un
           número comprobado**: su corpus escribe `=`. */
        const SIGNOS = [
          ['≈', new RegExp(String.raw`\\approx` + COLA, 'g')],
          ['=', new RegExp(String.raw`(?<!\\)=` + COLA, 'g')],
        ];
        for (const [signo, RE] of SIGNOS) {
          for (const m of txt.matchAll(RE)) {
            /* Si a la derecha sigue habiendo cuenta —«≈ 22,7+90,6 = 113,3»—
               el número capturado es un sumando, no el resultado: no se puede
               comparar con la expresión entera y el par se salta. */
            const cola = txt.slice(m.index + m[0].length).trimStart();
            if (/^[+\-*/^\d]/.test(cola)) { saltados++; continue; }
            /* Y el número tampoco es el resultado si a su derecha viene un
               símbolo o una fracción: «= 1{,}1\,\frac{V^2}{2g}» es un
               coeficiente, no un valor. Ojo: `\text{m/s}` sí es una unidad y
               tiene que pasar, así que aquí se enumeran los comandos, no se
               rechaza toda contrabarra. */
            if (/^(\\(cdot|times|d?frac|tfrac|sqrt|left|sum|int|pi|gamma|rho|mu|nu|eta|alpha|beta|theta|lambda|omega|Delta|delta|sigma|tau|phi|varepsilon)\b|[A-Za-z])/.test(cola)) {
              saltados++; continue;
            }
            let decimal = parseFloat(m[1].replace('{,}', '.'));
            if (m[2]) decimal *= 10 ** parseInt(m[2], 10);
            const esPorcentaje = Boolean(m[3]);
            const izq = expresionAntesDe(txt, m.index);
            /* Sin ninguna operación a la izquierda no hay nada que recalcular:
               es una reescritura —«h = 0{,}42»— y contarla infla el marcador
               con comprobaciones que no comprueban. */
            if (!/[+\-*/^]|\\frac|\\sqrt|\\cdot|\\times/.test(izq)) { saltados++; continue; }
            let v = evalua(izq);
            if (v === null) { saltados++; continue; }
            if (esPorcentaje) v *= 100;
            pares++;
            /* el decimal está redondeado: media unidad de su último dígito */
            const dec = (m[1].split(/\{,\}|\./)[1] ?? '').length;
            const escala = m[2] ? 10 ** parseInt(m[2], 10) : 1;
            const margen = 0.5 * 10 ** -dec * escala
              + margenPorRedondeo(izq, v)
              + Math.abs(v) * 1e-9;
            /* Las dos lecturas legítimas del número escrito, medidas al
               ampliar el guion a `=`. Basta con que **una** cuadre. */
            const candidatos = [decimal];
            /* 1 · cambio de unidad en la misma cadena: «9800·2·4 = 78,4 kN».
               La expresión está en unidades base y el número lleva prefijo. */
            const u = unidadTras(txt, m.index + m[0].length);
            /* Y una anotación que no es unidad —«8,93 milésimas», «6,56 por
               mil»— también anuncia un cambio de escala, aunque `leeMagnitud`
               no sepa leerla. */
            const anotado = u || /^\s*(?:\\[,;:!\s]|~)*\\(?:text|mathrm)\s*\{/
              .test(txt.slice(m.index + m[0].length, m.index + m[0].length + 30));
            if (anotado) {
              const si = u && leeMagnitud(`${decimal} ${u}`);
              if (si && Number.isFinite(si.valor)) {
                candidatos.push(si.valor);
                /* Y la expresión puede estar en un múltiplo del SI: «520,3 −
                   100,94» son kPa y el resultado se escribe en kg/cm². */
                for (let k = -6; k <= 6; k++) if (k) candidatos.push(si.valor * 10 ** k);
              }
              /* Y la expresión tampoco tiene por qué estar en unidades base:
                 «\frac{0{,}3247}{0{,}1963} = 16{,}5 mm» calcula en centímetros
                 y escribe en milímetros. Cuando hay unidad escrita, cualquier
                 potencia de diez es una lectura posible. **Es la concesión más
                 cara de este guion**: con ella deja de cazar un error de
                 factor mil si el número lleva unidad. Se acepta porque sin
                 ella la clase de falso positivo se comía el guardián entero
                 —de 33 avisos, 20 eran esto— y un guardián que se ignora es
                 peor que ninguno (§11). */
              for (let k = -6; k <= 6; k++) if (k) candidatos.push(decimal * 10 ** k);
              conUnidad++;
            }
            /* 2 · grados: el corpus escribe ángulos en grados y el evaluador,
               como cualquier biblioteca, devuelve radianes. */
            if (/\\?(arctan|arcsin|arccos)/.test(izq)) candidatos.push(decimal * Math.PI / 180);
            const cuadra = candidatos.some((c) =>
              Math.abs(v - c) <= margen * Math.max(1, Math.abs(c / (decimal || 1))));
            if (cuadra) continue;
            fallos.push(`${donde} · ${e.id} · ${sitio}\n      escribe  ${izq.replace(/\s+/g, ' ').slice(0, 70)}  ${signo} ${decimal}${u ? ' ' + u : ''}\n      y vale   ${v.toPrecision(10)}`);
          }
        }
      }
      /* 2 · un `formato` que promete un entero tiene que guardar un entero.
         Es lo único de este guion que alcanza a Álgebra, donde las respuestas
         son objetos exactos y no hay decimales que recalcular. */
      for (const [n, p] of (e.pasos ?? []).entries()) {
        if (p.respuesta?.tipo !== 'numero') continue;
        if (!/\bentero\b/i.test(p.respuesta.formato ?? '')) continue;
        const v = parseFloat(p.respuesta.valor);
        enteros++;
        if (!Number.isNaN(v) && !Number.isInteger(v)) {
          fallos.push(`${donde} · ${e.id} · paso ${n + 1}\n      el formato promete «un número entero» y el valor guardado es ${p.respuesta.valor}`);
        }
      }
      /* 3 · la forma exacta que declara el `formato` */
      for (const [n, p] of (e.pasos ?? []).entries()) {
        if (p.respuesta?.tipo !== 'numero') continue;
        const m = (p.respuesta.formato ?? '').match(/\(([^)]+)\)/);
        if (!m) continue;
        const v = evalua(m[1].replace(/pi/gi, '\\pi'));
        if (v === null) { formatosSaltados++; continue; }
        formatos++;
        const guardado = parseFloat(p.respuesta.valor);
        const tol = p.respuesta.tolerancia ?? 0;
        if (!Number.isNaN(guardado) && Math.abs(v - guardado) > tol + Math.abs(v) * 1e-9) {
          fallos.push(`${donde} · ${e.id} · paso ${n + 1} formato\n      la forma exacta «${m[1]}» vale ${v.toPrecision(10)}\n      y el valor guardado es ${guardado} (tolerancia ${tol})`);
        }
      }
    }
  }
}

console.log(`RECÁLCULO · ${asignaturas.join(', ')}`);
console.log(`  ${pares} pares «expresión ≈ decimal» evaluados (${saltados} no evaluables, saltados)`);
console.log(`  ${formatos} formas exactas del campo \`formato\` evaluadas (${formatosSaltados} saltadas)`);
console.log(`  ${enteros} respuestas declaradas «entero» comprobadas`);
if (pares === 0) {
  console.log('\n  AVISO: cero pares que recalcular. Este guion solo alcanza a las');
  console.log('  respuestas que el corpus escribe como decimal, y una asignatura');
  console.log('  de resultados exactos —Álgebra— queda fuera de su alcance. No');
  console.log('  leas este verde como «las matemáticas están comprobadas».');
}
if (fallos.length) {
  console.log(`\n${fallos.length} DESAJUSTE(S):\n`);
  for (const f of fallos) console.log(`  ${f}\n`);
} else {
  console.log('\n  ninguno: todo lo que el corpus afirma numéricamente cuadra.');
}
process.exitCode = fallos.length ? 1 : 0;
