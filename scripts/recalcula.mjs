/* scripts/recalcula.mjs — recalcular, no mirar.
 *
 * POR QUÉ EXISTE
 * El 28 de agosto de 2026 una auditoría que recalculaba las matemáticas
 * encontró ocho ejercicios que enseñaban algo falso, en un corpus donde
 * `npm run suelo` estaba en verde y §15 cumplida. Los guardianes de §11
 * demuestran que el sitio no está roto; ninguno mira si las cuentas salen.
 *
 * Antes de esto se intentaron dos guardianes de texto y los dos se
 * descartaron por ruidosos: comparar el `valor` con los números de su
 * `desarrollo` marcaba 26 de 323 y casi todos eran falsos, y comprobar la
 * aritmética escrita solo encontraba 10 patrones y fallaba en 8. Lo que sí
 * funciona es evaluar de verdad las expresiones que el propio corpus escribe.
 *
 * QUÉ COMPRUEBA — solo lo que el contenido ya afirma, nunca algo inventado:
 *   1. Cada «EXPRESIÓN \approx DECIMAL» de una resolución o un desarrollo:
 *      que el decimal sea el valor de la expresión.
 *   2. Cada `formato` que lleva la forma exacta entre paréntesis
 *      —«en forma exacta (8pi) o con cuatro decimales»—: que coincida con
 *      el `valor` guardado, dentro de su `tolerancia`.
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
  const s = normaliza(texto);
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

/** El trozo de LaTeX que precede a un `\approx`, hasta el último corte. */
function expresionAntesDe(texto, pos) {
  const desde = texto.slice(0, pos);
  const corte = Math.max(
    desde.lastIndexOf('='), desde.lastIndexOf('$$'), desde.lastIndexOf('\n'),
    desde.lastIndexOf('$'), desde.lastIndexOf('&'),
  );
  const trozo = desde.slice(corte + 1).replace(/\\boxed\s*\{/, '').trim();
  /* Un «+» al principio significa que el corte cayó en medio de una suma
     —una serie escrita en varias líneas—, así que lo que hay no es la
     expresión entera y no se puede comparar. */
  return trozo.startsWith('+') ? '' : trozo;
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

const asigPedida = process.argv[2];
const asignaturas = (asigPedida ? [asigPedida] : readdirSync(CONTENIDO))
  .filter((d) => existsSync(join(CONTENIDO, d)) && ficheros(d).length);

let pares = 0, saltados = 0, formatos = 0, formatosSaltados = 0, enteros = 0;
const fallos = [];

for (const asig of asignaturas) {
  for (const [donde, f] of ficheros(asig)) {
    const doc = yaml.load(readFileSync(f, 'utf8'));
    for (const e of doc.ejercicios ?? []) {
      /* 1 · los pares «expresión ≈ decimal» */
      const bloques = [
        ['resolucion', e.resolucion ?? ''],
        ...(e.pasos ?? []).flatMap((p, n) => [
          [`paso ${n + 1} desarrollo`, p.desarrollo ?? ''],
          [`paso ${n + 1} pista`, p.pista ?? ''],
        ]),
      ];
      for (const [sitio, txt] of bloques) {
        /* El decimal puede venir con una potencia de diez detrás
           —«2{,}13\cdot10^{-5}»— o como porcentaje. Las dos cosas cambian el
           número, así que entran en la captura o el par se compara mal. */
        const APROX = /\\approx\s*(-?\d+(?:\{,\}|\.)\d+)\s*(?:(?:\\cdot|\\times)\s*10\^\{?(-?\d+)\}?)?\s*(?:\\[,;:!\s])*\s*(\\?%)?/g;
        for (const m of txt.matchAll(APROX)) {
          /* Si a la derecha del ≈ sigue habiendo cuenta —«≈ 22,7+90,6 = 113,3»—
             el número capturado es un sumando, no el resultado: no se puede
             comparar con la expresión entera y el par se salta. */
          const cola = txt.slice(m.index + m[0].length).trimStart();
          if (/^[+\-*/^\d]/.test(cola)) { saltados++; continue; }
          let decimal = parseFloat(m[1].replace('{,}', '.'));
          if (m[2]) decimal *= 10 ** parseInt(m[2], 10);
          const esPorcentaje = Boolean(m[3]);
          const izq = expresionAntesDe(txt, m.index);
          let v = evalua(izq);
          if (v === null) { saltados++; continue; }
          if (esPorcentaje) v *= 100;
          pares++;
          /* el decimal está redondeado: media unidad de su último dígito */
          const dec = (m[1].split(/\{,\}|\./)[1] ?? '').length;
          const escala = m[2] ? 10 ** parseInt(m[2], 10) : 1;
          const margen = 0.5 * 10 ** -dec * escala + Math.abs(v) * 1e-9;
          if (Math.abs(v - decimal) > margen) {
            fallos.push(`${donde} · ${e.id} · ${sitio}\n      escribe  ${izq.replace(/\s+/g, ' ').slice(0, 70)}  ≈ ${decimal}\n      y vale   ${v.toPrecision(10)}`);
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
