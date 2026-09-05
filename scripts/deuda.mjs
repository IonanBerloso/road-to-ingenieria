/* scripts/deuda.mjs — la lista «lo que queda, medido y sin arreglar», medida.
 *
 * POR QUÉ EXISTE
 * Esa lista se escribió a mano el 24 de agosto de 2026, sobre Cálculo sola y
 * con seis puntos numerados. El 5 de septiembre se volvió a medir y **cinco de
 * los seis estaban mal**: uno ya lo habíamos resuelto sin tacharlo, otro contaba
 * 32 casos donde había 2, y el reparto por asignatura señalaba a la asignatura
 * equivocada porque entretanto habían entrado otras tres.
 *
 * Peor: un `falta[]` publicado en la ruta de Química decía «es el único bloque
 * de las dos rutas donde falta el primer peldaño», y eran ocho escalones en seis
 * bloques. Una frase con un número dentro, escrita a ojo. §10 no lo admite, y la
 * salida buena es la misma que con `mide.mjs`: que la cuente un guion.
 *
 * NO ES UN GUARDIÁN. No falla nunca ni rompe el build: imprime el estado. Los
 * números que salgan de aquí son los que se pueden publicar en `tasks/todo.md`
 * o en `docs/como-vamos.md`, y se vuelven a sacar antes de tocar esa prosa.
 *
 *   node scripts/deuda.mjs
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import yaml from 'js-yaml';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONT = join(RAIZ, 'src', 'content');
const ASIGS = ['calculo', 'algebra', 'fluidos', 'fundamentos-quimicos'];

/* ── el corpus entero, indexado por id ──────────────────────────────── */
const EJ = new Map();
for (const asig of ASIGS) {
  const raiz = join(CONT, asig);
  if (!existsSync(raiz)) continue;
  for (const d of readdirSync(raiz, { withFileTypes: true })) {
    if (!d.isDirectory()) continue;
    const dir = join(raiz, d.name);
    const ficheros = [join(dir, 'ejercicios.yaml')];
    if (d.name === 'examenes')
      for (const e of readdirSync(dir, { withFileTypes: true }))
        if (e.isDirectory()) ficheros.push(join(dir, e.name, 'ejercicios.yaml'));
    for (const f of ficheros) {
      if (!existsSync(f)) continue;
      for (const e of yaml.load(readFileSync(f, 'utf8'))?.ejercicios ?? [])
        EJ.set(e.id, { ...e, asig, deExamen: f.includes('examenes') });
    }
  }
}

const pinta = (t) => console.log(`\n\x1b[1m${t}\x1b[0m`);
const fila = (a, b) => console.log(`   ${String(a).padEnd(28)} ${b}`);

/* ── 1 · contra qué se contrasta cada resolución de examen ──────────── */
pinta('1 · Las resoluciones de examen, y contra qué se pueden contrastar');
console.log(`   Las tres categorías son las que importan, y no son dos: hay una
   diferencia real entre no tener nada y tener el número final.`);
const CONTRA = {
  'el resultado publicado': /publica los resultados pero no la resoluci|publica el resultado|publica la tabla resuel|publica el razo|publica que todas/i,
  'el boletín': /es el ejercicio [\d.]+ del bolet|son los ejercicios .* del bolet|coincide con el del ejercicio/i,
  nada: /.^/,
};
let totalNada = 0, totalEj = 0;
for (const asig of ASIGS) {
  const suyos = [...EJ.values()].filter((e) => e.asig === asig && e.deExamen);
  if (!suyos.length) continue;
  const c = { 'el resultado publicado': 0, 'el boletín': 0, nada: 0 };
  for (const e of suyos) {
    const f = e.fuente ?? '';
    const clave = Object.keys(CONTRA).find((k) => CONTRA[k].test(f)) ?? 'nada';
    c[clave]++;
  }
  totalNada += c.nada;
  totalEj += suyos.length;
  fila(asig, `${suyos.length} · resultado ${c['el resultado publicado']} · boletín ${c['el boletín']} · nada ${c.nada}`);
}
fila('TOTAL', `${totalEj} resoluciones, ${totalNada} sin nada contra lo que comprobar (${Math.round((totalNada / totalEj) * 100)} %)`);

/* ── 2, 5, 6 · las rutas ────────────────────────────────────────────── */
let escalones = 0, sinRampa = 0, unEjercicio = 0, bloques = 0, sinFalta = 0;
const detSinRampa = [], detUno = [];
for (const f of readdirSync(join(CONT, 'preparar'))) {
  const doc = yaml.load(readFileSync(join(CONT, 'preparar', f), 'utf8'));
  const ruta = f.replace('.yaml', '');
  for (const b of doc?.bloques ?? []) {
    bloques++;
    if (!b.falta?.length) sinFalta++;
    for (const esc of b.escalones ?? []) {
      escalones++;
      const ids = (esc.ejercicios ?? []).map((x) => x.id);
      if (ids.length === 1) detUno.push(`${ruta} / ${b.id} / ${esc.id}`);
      if (EJ.get(ids[0])?.nivel === 'examen') detSinRampa.push(`${ruta} / ${b.id} / ${esc.id}`);
    }
  }
}
sinRampa = detSinRampa.length;
unEjercicio = detUno.length;

pinta('2 · Escalones que arrancan en un ejercicio de examen');
console.log(`   §14: si el primero no lo puede hacer alguien que acaba de leer la
   teoría, falta un peldaño delante.`);
fila('de', `${escalones} escalones, ${sinRampa} sin rampa (${Math.round((sinRampa / escalones) * 100)} %)`);
detSinRampa.forEach((d) => fila('', d));

pinta('5 · Escalones con un solo ejercicio');
fila('de', `${escalones} escalones, ${unEjercicio}`);
detUno.forEach((d) => fila('', d));

pinta('6 · Bloques que no declaran ningún hueco');
fila('de', `${bloques} bloques, ${sinFalta} sin nada en falta[] (${Math.round((sinFalta / bloques) * 100)} %)`);

/* ── 3 · pasos que piden decimales sin ofrecer la forma exacta ──────── */
pinta('3 · Pasos que ordenan dar decimales');
console.log(`   §09: en el examen no hay calculadora, así que un enunciado nunca
   ordena decimales a secas. Se cuenta como fallo solo si NI la pregunta NI el
   formato ofrecen la forma exacta — dar el valor exacto dentro de la pregunta
   y pedir su decimal es correcto.`);
let pasos = 0;
const detDec = [];
for (const [id, e] of EJ)
  for (const p of e.pasos ?? []) {
    pasos++;
    const preg = String(p.pregunta ?? '');
    const fmt = String(p.formato ?? p.respuesta?.formato ?? '');
    const ofreceExacta = /exact/i.test(preg) || /exact/i.test(fmt) || /\$/.test(preg);
    if (/\bdecimales?\b/i.test(preg) && !ofreceExacta) detDec.push(`${e.asig} · ${id}`);
  }
fila('de', `${pasos} pasos, ${detDec.length}`);
detDec.forEach((d) => fila('', d));

/* ── 1 bis · cuántas respuestas se han vuelto a calcular ────────────── */
pinta('1 bis · Respuestas de examen recalculadas en tests/verificacion/');
console.log(`   Lo único que verifica de verdad una resolución que no tiene solución
   publicada: rehacer la cuenta desde el enunciado por un camino escrito
   aparte. Se cuenta leyendo las llamadas a cuadra() de los tests, así que
   esta cifra no se puede inflar a mano.`);
const dirV = join(RAIZ, 'tests', 'verificacion');
const cubiertas = new Set();
const clave = (id, titulo) => id + ' · ' + titulo;
if (existsSync(dirV))
  for (const f of readdirSync(dirV).filter((n) => n.endsWith('.test.ts'))) {
    /* Muchas llamadas pasan el id por una variable declarada encima del
       `describe`, y otras lo escriben literal pero partiendo la llamada en
       varias líneas. Las dos formas se cubren mirando el fichero entero como
       un solo texto con los saltos de línea aplanados, y resolviendo la
       variable por la última asignación vista. Un barrido tonto, pero no
       compensa traerse un analizador de TypeScript para esto. */
    const texto = readFileSync(join(dirV, f), 'utf8').replace(/\s+/g, ' ');
    let ultimo = null;
    const patron = /const id = '([^']+)'|cuadra\(\s*(?:'([^']+)'|\w+)\s*,\s*'([^']+)'/g;
    for (const m of texto.matchAll(patron)) {
      if (m[1]) ultimo = m[1];
      else {
        const id = m[2] ?? ultimo;
        if (id) cubiertas.add(clave(id, m[3]));
      }
    }
  }
/* Y el denominador: cada paso de examen con respuesta numérica. */
let numericas = 0;
const sinCubrir = [];
for (const [id, e] of EJ) {
  if (!e.deExamen) continue;
  for (const p of e.pasos ?? []) {
    if (!['numero', 'magnitud', 'complejo'].includes(p.respuesta?.tipo)) continue;
    numericas++;
    if (!cubiertas.has(clave(id, p.titulo ?? ''))) sinCubrir.push(`${e.asig} · ${id}`);
  }
}
fila('de', `${numericas} respuestas numéricas de examen, ${numericas - sinCubrir.length} recalculadas` +
  ` (${Math.round(((numericas - sinCubrir.length) / numericas) * 100)} %)`);
const porAsig = {};
for (const s of sinCubrir) {
  const a = s.split(' · ')[0];
  porAsig[a] = (porAsig[a] ?? 0) + 1;
}
for (const [a, n] of Object.entries(porAsig)) fila(a, `${n} sin recalcular`);

pinta('Y el tamaño del corpus, que también se publica y también envejece');
fila('ejercicios', EJ.size);
fila('pasos', pasos);
const tipos = {};
for (const e of EJ.values()) for (const p of e.pasos ?? []) tipos[p.tipo] = (tipos[p.tipo] ?? 0) + 1;
for (const [t, n] of Object.entries(tipos).sort((a, b) => b[1] - a[1])) fila(t, n);
console.log('');
