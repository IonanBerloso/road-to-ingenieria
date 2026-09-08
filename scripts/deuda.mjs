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
/* Las asignaturas salen del **catálogo**, que es quien decide cuáles existen.
 *
 * Estuvo escrito a mano —«calculo, algebra, fluidos, fundamentos-quimicos»—
 * hasta el 7 de septiembre de 2026, y ese día pasó lo que el comentario de
 * `CON_TEMAS` en `content.config.ts` llevaba escrito desde el 6: una lista
 * duplicada se olvida, y la asignatura entera se salta **en silencio**. Se
 * abrió Ingeniería Térmica con once ejercicios y este guion siguió diciendo
 * 1.270, el mismo número que antes de escribirlos.
 *
 * Es de las peores formas del fallo, porque el guion no protesta: publica un
 * recuento que parece correcto y no lo es, que es §10 exactamente. */
const ASIGS = readdirSync(join(CONT, 'catalogo'))
  .filter((n) => n.endsWith('.json'))
  .map((n) => n.replace(/\.json$/, ''));

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
    /* Un bloque está declarado si dice qué le falta o si dice que se ha
       mirado y no le falta nada. Lo que se cuenta aquí es lo tercero: los que
       no dicen ninguna de las dos cosas. */
    if (!b.falta?.length && !b.revisado) sinFalta++;
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

/* ── 7 · el rótulo de frecuencia contra el texto que lleva debajo ─────
 *
 *  «Cae 8 de 8 años» encima de un `porque` que dice «cero de treinta y dos».
 *  Dos afirmaciones incompatibles a dos centímetros una de otra, y la de
 *  arriba en un rótulo destacado, que es la que se lee.
 *
 *  Pasó en el suelo de Fluidos —corregido el 7 de septiembre de 2026, y para
 *  eso el esquema dejó de exigir `anios >= 1`— y **volvió a pasar en los dos
 *  suelos de Álgebra**, que nadie miró al arreglar el primero. Un fallo que
 *  reaparece es un fallo que necesita guardián y no una corrección más (§01).
 *
 *  Se detecta por lo que el bloque dice de sí mismo, no recontando los
 *  exámenes: recontar exigiría adivinar qué tema «ocupa el hueco» y eso es una
 *  lectura humana, que es justo lo que `invariante` existe para declarar. Si
 *  el propio bloque afirma que no cae ninguna vez, el rótulo tiene que decir
 *  cero.
 *
 *  El patrón que se busca es estrecho a propósito: **«cero de <número>»**,
 *  que es como los dos bloques escribían su propio recuento —«cero de once»,
 *  «cero de treinta y dos»—. La primera versión de este guardián buscaba
 *  «ninguno» a secas y sacaba 26 avisos de 110 bloques, casi todos falsos:
 *  «la única que no pide ninguna demostración» no habla de la frecuencia del
 *  bloque, habla de un año. Un guardián que avisa 26 veces y acierta 2 se
 *  aprende a ignorar, que es peor que no tenerlo (§11).
 *
 *  Y lleva una excepción que el propio guardián encontró: un «cero de once
 *  **para** las unidades» no habla del bloque entero, habla de una de las
 *  tres cosas que el bloque junta —así lo escribe el suelo de Fluidos, que
 *  cuenta cero para las unidades y uno para las pérdidas de carga—. Una
 *  negación con `para` detrás está acotada y no contradice al rótulo. */
const NIEGA =
  /\bcero de (?:\d+|un[oa]|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|dieciséis|veinte|treinta)\b(?!\s+para\b)/i;
const contradicen = [];
for (const f of readdirSync(join(CONT, 'preparar'))) {
  const doc = yaml.load(readFileSync(join(CONT, 'preparar', f), 'utf8'));
  for (const b of doc?.bloques ?? []) {
    if (!b.invariante || b.invariante.anios === 0) continue;
    for (const [campo, txt] of [
      ['porque', b.porque],
      ['invariante.fuente', b.invariante.fuente],
    ]) {
      if (txt && NIEGA.test(txt))
        contradicen.push(
          `${f.replace('.yaml', '')} / ${b.id}: el rótulo dice «cae ${b.invariante.anios} de ` +
            `${doc.medidoSobre}» y su ${campo} dice «${NIEGA.exec(txt)[0]}»`,
        );
    }
  }
}
pinta('7 · Rótulos de frecuencia que se contradicen con su propio texto');
console.log(`   §10: el número destacado es el que se lee. Si el bloque escribe
   debajo que no cae ninguna vez, \`anios\` tiene que ser cero — y entonces la
   página escribe «No cae solo, está dentro de las N», que es lo que un suelo
   de verdad es.`);
fila('de', `${bloques} bloques, ${contradicen.length}`);
contradicen.forEach((d) => fila('', '· ' + d));

/* ── 8 · listas que anuncian su propio tamaño ────────────────────────
 *
 *  Cinco `falta[]` de Cálculo dicen lo mismo, con estas palabras: «las listas
 *  son una segunda copia de cosas que ya están explicadas en los temas, y si
 *  un día se corrige la teoría y no se corrige aquí, esto miente. **No hay
 *  ningún guardián que lo compruebe todavía**». Estaba declarado cinco veces
 *  y nadie lo había escrito.
 *
 *  Comprobar «esto repite lo de arriba y ya no coincide» en general no se
 *  puede. Lo que sí se puede es el caso en que **la propia prosa dice cuántos
 *  elementos vienen**: «Y las tres frases de COMP4:» seguido de tres viñetas.
 *  Ahí el texto lleva su propia comprobación dentro, y el día que alguien
 *  añada una cuarta frase y no toque la línea de arriba, esto lo dice.
 *
 *  Son 17 anuncios en cinco asignaturas. No cubre el riesgo entero —una
 *  fórmula corregida arriba y no abajo sigue pasando— y por eso los `falta[]`
 *  siguen abiertos, ahora diciendo qué parte queda fuera. */
const ANUNCIO = /\b(?:l[ao]s\s+)?(\w+)\s+(frases|puntos|reglas|ideas|cosas|preguntas)\b[^.\n]{0,60}:\s*\n/gi;
const ORDINAL = { un: 1, una: 1, uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12, trece: 13, catorce: 14, quince: 15 };
/* Propio, porque `sinTilde` se define más abajo y esta sección va antes. */
const llano = (s) => s.toLowerCase().replace(/[áéíóú]/g, (c) => 'aeiou'['áéíóú'.indexOf(c)]);
const descuadres = [];
let anuncios = 0;
for (const asig of ASIGS) {
  const raiz = join(CONT, asig);
  if (!existsSync(raiz)) continue;
  for (const t of readdirSync(raiz)) {
    const p = join(raiz, t, 'index.mdx');
    if (!existsSync(p)) continue;
    const mdx = readFileSync(p, 'utf8');
    ANUNCIO.lastIndex = 0;
    let m;
    while ((m = ANUNCIO.exec(mdx))) {
      const dice = /^\d+$/.test(m[1]) ? Number(m[1]) : ORDINAL[llano(m[1])];
      if (dice === undefined) continue;
      const lineas = mdx.slice(m.index + m[0].length).split('\n');
      /* Si lo que sigue no es una lista, el anuncio no habla de una lista:
         «las dos cosas conviven sin contradicción:» va seguido de prosa. Sin
         este filtro salían ocho avisos y los ocho eran prosa corriente. */
      const primera = lineas.find((l) => l.trim() !== '');
      if (!primera || !/^\s*(?:[-*]|\d+\.)\s+\S/.test(primera)) continue;
      anuncios++;
      let n = 0;
      for (const l of lineas) {
        if (/^\s*(?:[-*]|\d+\.)\s+\S/.test(l)) n++;
        else if (/^\s*$/.test(l) || /^\s{2,}\S/.test(l)) continue;
        else break;
      }
      if (n !== dice)
        descuadres.push(`${asig}/${t}: «${m[0].trim().slice(0, 54)}» anuncia ${dice} y hay ${n}`);
    }
  }
}
pinta('8 · Listas que anuncian su propio tamaño');
console.log(`   El caso comprobable de «esto es una segunda copia y puede
   quedarse vieja»: cuando la prosa dice cuántos elementos vienen, la lista de
   debajo tiene que tener esos.`);
fila('de', `${anuncios} anuncios, ${descuadres.length} descuadrados`);
descuadres.forEach((d) => fila('', '· ' + d));

/* ── 9 · blockquotes dentro de un escalar plegado ────────────────────
 *
 *  Un `>` de markdown dentro de un `>-` de YAML pierde todos sus renglones
 *  menos el primero: el plegado une las líneas con un espacio y markdown solo
 *  lee el `>` de delante. Los demás **se publican como texto**, y quedan dos
 *  «mayor que» sueltos en mitad de una frase.
 *
 *  Pasó en la ruta de la tercera de Cálculo y se publicó así: «que los dos
 *  ejercicios > «no tienen resolución guiada» y que «el tema 6 > todavía no
 *  está escrito»». Lo cazó mirar la página (§16), no un guardián.
 *
 *  Se busca en el ORIGEN a propósito. En el HTML un `>` suelto no se
 *  distingue de un «mayor que» de una fórmula: buscarlo ahí daba 197 falsos
 *  en `h > f` antes de mirar ninguno de verdad. */
const plegados = [];
for (const f of readdirSync(join(CONT, 'preparar'))) {
  const lineas = readFileSync(join(CONT, 'preparar', f), 'utf8').split('\n');
  for (let i = 0; i < lineas.length; i++) {
    const m = /^(\s*)(?:-\s+)?(?:[\w-]+:\s+)?>-?\s*$/.exec(lineas[i]);
    if (!m) continue;
    let bq = 0;
    for (let j = i + 1; j < lineas.length; j++) {
      const l = lineas[j];
      if (l.trim() === '') continue;
      if (l.match(/^\s*/)[0].length <= m[1].length) break;
      if (/^\s*>/.test(l)) bq++;
    }
    if (bq > 1) plegados.push(`${f}:${i + 1} · ${bq} renglones de cita`);
  }
}
pinta('9 · Citas dentro de un escalar plegado, que publican sus «>»');
fila('de', `${readdirSync(join(CONT, 'preparar')).length} rutas, ${plegados.length}`);
plegados.forEach((d) => fila('', '· ' + d));

pinta('6 · Bloques que no dicen si les falta algo');
console.log(`   Un falta[] vacío decía dos cosas incompatibles: «mirado y no hay
   hueco» y «sin mirar». Desde el 6 de septiembre de 2026 la primera se declara
   con la fecha en \`revisado\`, así que lo que se cuenta aquí es lo que de
   verdad está pendiente: bloques que no dicen ninguna de las dos.`);
fila('de', `${bloques} bloques, ${sinFalta} sin decir nada (${Math.round((sinFalta / bloques) * 100)} %)`);

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
    const patron =
      /const id = '([^']+)'|cuadra\w*(?:\.\w+)?\(\s*(?:'([^']+)'|\w+)\s*,\s*'([^']+)'/g;
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
    /* Las cuatro formas que `cuadra()` sabe comparar. Las de texto libre
       —`formula`, y los pasos sin respuesta— quedan fuera porque no hay nada
       que recalcular en ellas. */
    if (!['numero', 'magnitud', 'complejo', 'vector', 'matriz', 'conjunto'].includes(p.respuesta?.tipo))
      continue;
    numericas++;
    if (!cubiertas.has(clave(id, p.titulo ?? '')))
      sinCubrir.push(`${e.asig} · ${id} · «${p.titulo ?? '(sin título)'}»`);
  }
}
fila('de', `${numericas} respuestas de examen comparables, ${numericas - sinCubrir.length} recalculadas` +
  ` (${Math.round(((numericas - sinCubrir.length) / numericas) * 100)} %)`);
const porAsig = {};
for (const s of sinCubrir) {
  const a = s.split(' · ')[0];
  (porAsig[a] ??= []).push(s);
}
for (const [a, lista] of Object.entries(porAsig)) {
  fila(a, `${lista.length} sin recalcular`);
  /* Y cuando a una asignatura le quedan pocas, se dicen cuáles. Nace el 6 de
     septiembre de 2026: al cerrar Cálculo el contador se quedó en dos y hubo
     que escribir un guion aparte para averiguar qué eran. Resultó ser un
     ejercicio entero —el 4 de la 2.ª de 2022-2023— saltado sin darse cuenta al
     escribir su fichero, con los otros tres del mismo examen puestos. Un
     porcentaje no avisa de eso; una lista, sí.

     El tope se cuenta **por asignatura y no sobre el total**, y eso es lo que
     costó: la primera versión lo hacía sobre el total, y como Fluidos tenía
     293 pendientes, el hueco de una sola respuesta de Cálculo no se listaba
     nunca. Se validó al revés borrando una llamada a mano. */
  if (lista.length <= 15) for (const s of lista) fila('', `· ${s.split(' · ').slice(1).join(' · ')}`);
}

/* ── las afirmaciones de ausencia que ya no son ciertas ─────────────────
 *
 * Un `falta[]` se publica en la página de la ruta, y muchos llevan un número
 * dentro: «el tema 9 tiene dos ejemplos de entrada propios», «una sola
 * figura», «sus dos ejercicios propios». Se escriben cuando son verdad, el
 * contenido se añade después, y **nadie vuelve a leerlas**.
 *
 * El 8 de septiembre de 2026 se releyeron todas a mano y **once estaban
 * caducadas**: el tema 8 decía dos ejemplos y una figura cuando eran cinco y
 * dos; el tema 9, dos y una cuando eran cinco y tres; una nota pedía «un
 * dibujo de qué hace Green» que llevaba meses dibujado; otra decía que no
 * había ningún ejercicio de la matriz en otra base habiendo seis, cuatro de
 * ellos sin enlazar; otra que no había ninguno de orden cuatro habiendo
 * cuatro. Once en un día, y ningún guardián las mira.
 *
 * Esto cuenta lo que se puede contar: cuántos ejemplos propios y cuántas
 * figuras tiene el tema que la frase nombra. Lo demás —«no hay ningún
 * ejercicio de Cramer»— no se puede automatizar, y por eso esta sección
 * imprime también las frases con número que no ha sabido comprobar: para que
 * se relean a mano al cerrar una asignatura.
 *
 * No falla: este guion no es un guardián. Informa. */
pinta('Afirmaciones de ausencia con número dentro, contadas contra el corpus');

const PALABRA = {
  ningun: 0, ninguna: 0, cero: 0, un: 1, una: 1, uno: 1, dos: 2, tres: 3,
  cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10,
  once: 11, doce: 12, trece: 13, catorce: 14, quince: 15, dieciseis: 16,
  diecisiete: 17, dieciocho: 18, diecinueve: 19, veinte: 20, veintiun: 21,
  veintiuno: 21, veintiuna: 21, veintidos: 22, veintitres: 23,
  veinticuatro: 24, veinticinco: 25, veintiseis: 26, veintisiete: 27,
  veintiocho: 28, veintinueve: 29, treinta: 30, cuarenta: 40, cincuenta: 50,
  sesenta: 60, setenta: 70, ochenta: 80, noventa: 90, cien: 100, ciento: 100,
};
const sinTilde = (s) => s.toLowerCase().replace(/[áéíóú]/g, (c) => 'aeiou'['áéíóú'.indexOf(c)]);
/* Admite «treinta y seis» y «veintiséis», no solo «seis». Sin esto el guardián
   partía el compuesto, se quedaba con la unidad y acusaba de decir 6 a una
   frase que decía 36 — un falso positivo el mismo día en que se escribió. */
const aNumero = (s) => {
  const t = sinTilde(String(s)).trim();
  if (/^\d+$/.test(t)) return Number(t);
  const m = /^(\w+)(?:\s+y\s+(\w+))?$/.exec(t);
  if (!m) return undefined;
  const decena = PALABRA[m[1]];
  if (decena === undefined) return undefined;
  if (m[2] === undefined) return decena;
  const unidad = PALABRA[m[2]];
  if (unidad === undefined || decena < 30 || decena % 10 !== 0 || unidad > 9) return undefined;
  return decena + unidad;
};
/* Un numeral escrito: dígitos, o una palabra, o «treinta y seis». */
const NUMERAL = '(\\d+|[a-záéíóúñ]+(?:\\s+y\\s+[a-záéíóúñ]+)?)';

/* cuántos ejemplos propios y cuántas figuras tiene cada tema, de verdad */
const REAL = {};
for (const asig of ASIGS) {
  const raiz = join(CONT, asig);
  if (!existsSync(raiz)) continue;
  for (const d of readdirSync(raiz, { withFileTypes: true })) {
    if (!d.isDirectory() || !/^t\d/.test(d.name)) continue;
    const fe = join(raiz, d.name, 'ejercicios.yaml');
    const fm = join(raiz, d.name, 'index.mdx');
    const ejs = existsSync(fe) ? yaml.load(readFileSync(fe, 'utf8'))?.ejercicios ?? [] : [];
    REAL[`${asig}/${d.name}`] = {
      ejemplos: ejs.filter((e) => e.nivel === 'ejemplo').length,
      /* Todos los del tema, no solo los de entrada. Lo pide una frase real:
         «el tema 9 tiene siete ejercicios propios para diecisiete de examen»,
         que el 8 de septiembre de 2026 no cuadraba ni con los diez que hay ni
         con los cinco de entrada, y que este guardián no sabía mirar porque
         solo entendía «ejemplos propios». */
      propios: ejs.length,
      figuras: existsSync(fm) ? (readFileSync(fm, 'utf8').match(/<svg/g) ?? []).length : 0,
      deExamen: 0,
    };
  }
}

/* Y cuántos ejercicios de examen tiene cada tema, que es la otra mitad de esas
   frases: «X propios para Y de examen». Sale del reparto por tema que cada
   `examen.yaml` declara, que es el mismo dato con el que se dibujan las
   páginas de convocatoria. */
for (const asig of ASIGS) {
  const raiz = join(CONT, asig, 'examenes');
  if (!existsSync(raiz)) continue;
  for (const d of readdirSync(raiz, { withFileTypes: true })) {
    if (!d.isDirectory()) continue;
    const fx = join(raiz, d.name, 'examen.yaml');
    if (!existsSync(fx)) continue;
    for (const e of yaml.load(readFileSync(fx, 'utf8'))?.ejercicios ?? []) {
      const clave = `${asig}/${e.tema}`;
      if (REAL[clave]) REAL[clave].deExamen++;
    }
  }
}
const temaDe = (asig, n) =>
  Object.keys(REAL).find((k) => k.startsWith(asig + '/t' + String(n).padStart(2, '0')));

const desfasadas = [], sinComprobar = [];
for (const f of readdirSync(join(CONT, 'preparar'))) {
  const ruta = yaml.load(readFileSync(join(CONT, 'preparar', f), 'utf8'));
  for (const b of ruta.bloques ?? []) {
    for (const x of b.falta ?? []) {
      const t = String(x).replace(/\s+/g, ' ');
      if (t.includes('~~')) continue;             // ya declarada resuelta
      const donde = `${f.replace('.yaml', '')} · ${b.id}`;
      let comprobada = false;

      /* «el tema N tiene X ejemplos … propios» y «… y N figuras / una sola figura» */
      const mTema = /\btema (\d+)\b/i.exec(t);
      if (mTema) {
        const clave = temaDe(ruta.asignatura, mTema[1]);
        if (clave) {
          const real = REAL[clave];
          const mEj = new RegExp(`\\*{0,2}${NUMERAL} ejemplos? (?:de entrada )?propios?`, 'i').exec(t);
          if (mEj) {
            const dice = aNumero(mEj[1]);
            if (dice !== undefined) {
              comprobada = true;
              if (dice !== real.ejemplos)
                desfasadas.push(`${donde}: dice ${dice} ejemplos propios del tema ${mTema[1]}, hay ${real.ejemplos}`);
            }
          }
          /* «X ejercicios propios». Ojo al orden: se mira DESPUÉS de los
             ejemplos y solo si aquello no casó, porque «cinco ejemplos de
             entrada propios» lleva dentro la palabra «propios» y no habla del
             total. */
          if (!comprobada) {
            /* Con el verbo delante, y no a secas: «un ejercicio propio
               necesitaría el anexo» no es un recuento, es una hipótesis, y sin
               este ancla el guardián la acusaba de decir 1 donde hay 4. Lo que
               se busca es la forma en que este proyecto escribe los recuentos:
               «el tema N tiene X ejercicios propios». */
            const mProp = new RegExp(
              `(?:tiene|hay|lleva)\\s+\\*{0,2}${NUMERAL}\\*{0,2} ejercicios? propios?`,
              'i',
            ).exec(t);
            if (mProp) {
              const dice = aNumero(mProp[1]);
              if (dice !== undefined) {
                comprobada = true;
                if (dice !== real.propios)
                  desfasadas.push(
                    `${donde}: dice ${dice} ejercicios propios del tema ${mTema[1]}, hay ${real.propios}`,
                  );
              }
            }
          }
          /* «… para Y (ejercicios) de examen» */
          /* «… para treinta y seis ejercicios de examen EN TODA LA ASIGNATURA».
             La coletilla es obligatoria y va pegada, no en cualquier parte de
             la frase: una nota puede contar los de una sola evaluación
             —«diecisiete de examen» son los de la quinta— y este guion no sabe
             repartir por convocatoria. Buscar «toda la asignatura» suelta en el
             párrafo ya falló: una frase que daba las dos cifras, la de la
             evaluación y la de la asignatura, quedó acusada de decir 17 donde
             hay 36. Si la nota no se ata a un alcance, esto no la comprueba y
             pasa al montón de releer a mano, que es lo honesto. */
          const mEx = new RegExp(
            `\\*{0,2}${NUMERAL}\\*{0,2} (?:ejercicios? )?de examen,? (?:en|de) toda la asignatura`,
            'i',
          ).exec(t);
          if (mEx) {
            const dice = aNumero(mEx[1]);
            if (dice !== undefined) {
              comprobada = true;
              if (dice !== real.deExamen)
                desfasadas.push(
                  `${donde}: dice ${dice} de examen del tema ${mTema[1]} en toda la asignatura, hay ${real.deExamen}`,
                );
            }
          }
          const mFig = /\*{0,2}(?:una sola|\w+) figuras?\*{0,2}/i.exec(t);
          if (mFig) {
            const dice = /una sola/i.test(mFig[0]) ? 1 : aNumero(mFig[0].replace(/\*|figuras?/gi, '').trim());
            if (dice !== undefined) {
              comprobada = true;
              if (dice !== real.figuras)
                desfasadas.push(`${donde}: dice ${dice} figura(s) del tema ${mTema[1]}, hay ${real.figuras}`);
            }
          }
        }
      }
      /* lo que lleva número y no se ha sabido comprobar */
      if (!comprobada && /\b(ning[uú]n|ninguna|un solo|una sola|cero|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|\d+)\b/i.test(t))
        sinComprobar.push(`${donde}: ${t.slice(0, 96)}…`);
    }
  }
}
fila('desfasadas', desfasadas.length);
for (const d of desfasadas) fila('', '· ' + d);
fila('con número, sin comprobar', `${sinComprobar.length} — se releen a mano al cerrar una asignatura`);

pinta('Y el tamaño del corpus, que también se publica y también envejece');
fila('ejercicios', EJ.size);
fila('pasos', pasos);
const tipos = {};
for (const e of EJ.values()) for (const p of e.pasos ?? []) tipos[p.tipo] = (tipos[p.tipo] ?? 0) + 1;
for (const [t, n] of Object.entries(tipos).sort((a, b) => b[1] - a[1])) fila(t, n);
console.log('');
