/**
 * Revisa un banco de preguntas de test ANTES de meterlo en `src/content/banco/`
 * (fase E3 de la auditoría del 27 de septiembre de 2026).
 *
 * Es el hermano de `revisa-ejercicios.mjs`, y por el mismo motivo: con unas
 * doscientas cincuenta cuestiones de Cálculo por transcribir, el ciclo
 * «pegar → construir → fallar → revertir» cuesta más que el guion. No
 * sustituye al esquema de `content.config.ts`, que sigue siendo la autoridad:
 * comprueba lo mismo antes, en un segundo y sin construir, y además lo que el
 * esquema no puede ver —una fórmula que no se dibuja, una figura con un color
 * a mano—. Si los dos discrepan, manda el esquema y este guion está mal.
 *
 *   node scripts/revisa-banco.mjs <banco.yaml>
 */
import { readFileSync } from 'node:fs';
import yaml from 'js-yaml';

const ruta = process.argv[2];
if (!ruta) {
  console.error('uso: node scripts/revisa-banco.mjs <banco.yaml>');
  process.exit(2);
}

let fallos = 0;
const mal = (donde, texto) => {
  console.log(`  ✗ ${donde}: ${texto}`);
  fallos++;
};

let b;
try {
  b = yaml.load(readFileSync(ruta, 'utf8'));
} catch (err) {
  console.log(`  ✗ el YAML no se lee: ${String(err).split('\n')[0]}`);
  process.exit(1);
}

/* ── la forma: lo mismo que el esquema ─────────────────────────────── */

const texto = (x, min) => typeof x === 'string' && x.trim().length >= min;
if (!texto(b?.asignatura, 3)) mal('banco', 'falta `asignatura`');
if (!/^t\d{2}-[a-z0-9-]+$/.test(b?.tema ?? '')) mal('banco', '`tema` tiene que ser como t01-complejos');
if (!texto(b?.titulo, 8)) mal('banco', '`titulo` de al menos 8 caracteres');
if (!texto(b?.fuente, 40)) mal('banco', '`fuente` de al menos 40 caracteres: de dónde sale y qué no es');

const bloques = Array.isArray(b?.bloques) ? b.bloques : [];
if (!bloques.length) mal('banco', 'faltan los `bloques`');
const idsBloque = new Set();
for (const x of bloques) {
  if (!/^[a-z0-9.-]+$/.test(String(x?.id ?? ''))) mal('bloques', `id «${x?.id}» no vale: minúsculas, cifras, punto y guion`);
  if (!texto(x?.titulo, 3)) mal('bloques', `«${x?.id}» sin título`);
  if (idsBloque.has(String(x?.id))) mal('bloques', `«${x?.id}» repetido`);
  idsBloque.add(String(x?.id));
}

const nOpciones = b?.opciones;
if (nOpciones !== undefined && !(Number.isInteger(nOpciones) && nOpciones >= 2 && nOpciones <= 6)) {
  mal('banco', '`opciones` es un entero de 2 a 6');
}

const preguntas = Array.isArray(b?.preguntas) ? b.preguntas : [];
if (!preguntas.length) mal('banco', 'no hay `preguntas`');
const idsPregunta = new Set();
for (const [i, p] of preguntas.entries()) {
  const id = p?.id ?? `(pregunta ${i + 1})`;
  if (!/^[a-z0-9-]+$/.test(String(p?.id ?? ''))) mal(id, 'id: minúsculas, cifras y guiones');
  if (idsPregunta.has(id)) mal(id, 'id repetido');
  idsPregunta.add(id);
  if (!idsBloque.has(String(p?.bloque))) mal(id, `el bloque «${p?.bloque}» no está en bloques`);
  if (!texto(p?.pregunta, 10)) mal(id, 'la `pregunta` tiene que tener al menos 10 caracteres');
  const ops = Array.isArray(p?.opciones) ? p.opciones : [];
  if (ops.length < 2 || ops.length > 6) mal(id, `trae ${ops.length} opciones: de 2 a 6`);
  if (nOpciones && ops.length !== nOpciones) mal(id, `trae ${ops.length} opciones y el banco dice ${nOpciones}`);
  const buenas = ops.filter((o) => o?.correcta === true).length;
  if (p?.varias === true) {
    if (buenas < 2) mal(id, `dice tener varias ciertas (varias: true) y tiene ${buenas}`);
    if (b?.puntuacion) mal(id, 'un banco con simulacro no admite preguntas con varias ciertas');
  } else if (buenas !== 1) {
    mal(id, `${buenas} opciones marcadas como correctas, y tiene que haber una (o varias: true)`);
  }
  for (const [j, o] of ops.entries()) {
    if (!texto(o?.texto, 1)) mal(id, `la opción ${'ABCDEF'[j]} no tiene texto`);
    if (!texto(o?.porque, 15)) mal(id, `la opción ${'ABCDEF'[j]} no dice por qué (al menos 15 caracteres)`);
  }
}

/* El recuento contra el PDF. */
const total = b?.diapositivas;
const sinPregunta = Array.isArray(b?.sinPregunta) ? b.sinPregunta : [];
if (total !== undefined) {
  const vistas = new Map();
  const anota = (n, quien) => {
    if (!Number.isInteger(n) || n < 1 || n > total) mal(quien, `la diapositiva ${n} no existe: el PDF tiene ${total}`);
    else if (vistas.has(n)) mal(quien, `la diapositiva ${n} ya la cuenta ${vistas.get(n)}`);
    else vistas.set(n, quien);
  };
  for (const p of preguntas) {
    if (p?.diapositiva === undefined) mal(p?.id ?? '?', 'no dice su `diapositiva`');
    else anota(p.diapositiva, p.id);
  }
  for (const s of sinPregunta) {
    if (!texto(s?.motivo, 10)) mal(`sinPregunta ${s?.diapositiva}`, 'falta el `motivo`');
    anota(s?.diapositiva, `sinPregunta ${s?.diapositiva}`);
  }
  const faltan = Array.from({ length: total }, (_, i) => i + 1).filter((n) => !vistas.has(n));
  if (faltan.length) mal('recuento', `faltan las diapositivas ${faltan.join(', ')}: ni pregunta ni motivo`);
} else if (sinPregunta.length || preguntas.some((p) => p?.diapositiva !== undefined)) {
  mal('recuento', 'hay diapositivas numeradas pero falta `diapositivas`, cuántas tiene el PDF');
}

/* ── las figuras: lo que el esquema no ve ──────────────────────────── */

const idsFigura = new Map();
for (const p of preguntas) {
  const f = p?.figura;
  if (f === undefined) continue;
  const id = p.id;
  if (typeof f !== 'string' || !f.trim().startsWith('<svg')) {
    mal(id, 'la figura tiene que ser un <svg> en línea');
    continue;
  }
  if (!/viewBox="[^"]+"/.test(f)) mal(id, 'la figura no tiene viewBox');
  if (!/role="img"/.test(f)) mal(id, 'la figura no dice role="img"');
  const t = /<title id="([^"]+)"/.exec(f)?.[1];
  const d = /<desc id="([^"]+)"/.exec(f)?.[1];
  if (!t || !d) mal(id, 'la figura necesita <title id> y <desc id>, que se leen solos');
  else if (!new RegExp(`aria-labelledby="${t} ${d}"`).test(f)) mal(id, 'aria-labelledby no nombra su title y su desc');
  /* Una línea en blanco dentro del SVG cierra el bloque de HTML crudo de
     Markdown y lo que va detrás se publica como texto (verify.mjs). */
  if (/\n\s*\n/.test(f)) mal(id, 'la figura tiene una línea en blanco dentro');
  /* Los colores son tokens: el sitio tiene temas y la capa de tinta de
     check-color.mjs los mide todos. */
  const hex = /(?:fill|stroke|color|stop-color)\s*[:=]\s*"?\s*(#[0-9a-fA-F]{3,8}|rgb\(|black|white)/.exec(f);
  if (hex) mal(id, `la figura pone un color a mano (${hex[1]}): van con var(--token)`);
  for (const m of f.matchAll(/\sid="([^"]+)"/g)) {
    if (idsFigura.has(m[1]) && idsFigura.get(m[1]) !== id) mal(id, `el id «${m[1]}» ya lo usa la figura de ${idsFigura.get(m[1])}`);
    idsFigura.set(m[1], id);
  }
}

/* ── las fórmulas: que se dibujen ─────────────────────────────────── */

const campos = [];
for (const p of preguntas) {
  campos.push([p?.id, 'pregunta', p?.pregunta]);
  for (const [j, o] of (p?.opciones ?? []).entries()) {
    campos.push([p?.id, `opción ${'ABCDEF'[j]}`, o?.texto]);
    campos.push([p?.id, `porqué de ${'ABCDEF'[j]}`, o?.porque]);
  }
}

const { mate } = await import('../src/lib/markdown.mjs');
const avisos = [];
const warnOriginal = console.warn;
console.warn = (...a) => avisos.push(a.join(' '));
for (const [id, donde, t] of campos) {
  if (typeof t !== 'string') continue;
  const control = /[\t\f\v\b\0]/.exec(t);
  if (control) {
    mal(id, `${donde}: un carácter de control donde debía ir una barra invertida (§17: el LaTeX no se escribe por el shell)`);
    continue;
  }
  const html = await mate(t, 'revision');
  if (html.includes('katex-error')) {
    const motivo = /title="ParseError: ([^"]{0,110})/.exec(html)?.[1] ?? 'KaTeX no ha sabido dibujarla';
    mal(id, `${donde}: fórmula que no se dibuja — ${motivo}`);
    continue;
  }
  const rojo = /<span(?![^>]*katex-error)[^>]*style="[^"]*color:\s*#cc0000[^"]*"[^>]*>(?:<span[^>]*>)?([^<]{0,60})/i.exec(html);
  if (rojo) {
    mal(id, `${donde}: KaTeX no conoce este comando y lo pinta en rojo — ${rojo[1]}`);
    continue;
  }
  const visible = html.replace(/<math[\s\S]*?<\/math>/g, '').replace(/<[^>]+>/g, ' ');
  const suelto = /.{0,40}\$.{0,40}/.exec(visible)?.[0];
  if (suelto) mal(id, `${donde}: LaTeX publicado como texto — …${suelto.replace(/\s+/g, ' ').trim()}…`);
}
console.warn = warnOriginal;
for (const a of [...new Set(avisos)].slice(0, 5)) console.log(`  · KaTeX avisa: ${a.slice(0, 160)}`);

const conFigura = preguntas.filter((p) => p?.figura).length;
console.log(
  `\n${ruta}: ${preguntas.length} preguntas en ${idsBloque.size} bloques, ${conFigura} con figura` +
    (total !== undefined ? `, ${sinPregunta.length} diapositivas sin pregunta, de ${total}` : ''),
);
if (fallos) {
  console.log(`${fallos} fallo(s).`);
  process.exit(1);
}
console.log('En verde.');
