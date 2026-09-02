/**
 * Qué problemas de la colección de Fluidos están transcritos y cuáles no.
 *
 * Se lee el volcado del PDF y el corpus, nunca la memoria: la cifra «92 de
 * 236» que publicaba `docs/como-vamos.md` estaba desfasada en uno y nadie lo
 * habría notado. Escrito el 2 de septiembre de 2026 al abrir los 145 que
 * faltaban.
 *
 *   pdftotext -enc UTF-8 -layout <Coleccin_de_Problemas.pdf> coleccion.txt
 *   node scripts/inventario-coleccion.mjs <carpeta-con-coleccion.txt>
 *
 * Deja un `faltan.json` con la referencia, la línea y el arranque del
 * enunciado de cada uno. El mapa de páginas va aparte porque el contador de
 * saltos de página de `awk` se desfasa: hay que partir por  en node.
 */
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const S = process.argv[2];
const REPO = process.cwd();

/* ── 1 · los 236 del PDF ─────────────────────────────────────────── */
const lineas = fs.readFileSync(`${S}/coleccion.txt`, 'utf8').split('\n');
const enPdf = [];
lineas.forEach((l, i) => {
  const m = l.match(/^\s*([0-9])\.([0-9]+)\.?[-–— ]/);
  if (m) enPdf.push({ cap: +m[1], num: +m[2], linea: i + 1, texto: l.trim().slice(0, 90) });
});

/* ── 2 · los que ya están escritos ───────────────────────────────── */
const hechos = new Map(); // "cap.num" -> id
for (const d of fs.readdirSync(`${REPO}/src/content/fluidos`)) {
  const f = path.join(REPO, 'src/content/fluidos', d, 'ejercicios.yaml');
  if (!fs.existsSync(f)) continue;
  for (const e of yaml.load(fs.readFileSync(f, 'utf8')).ejercicios ?? []) {
    if (e.nivel === 'ejemplo') continue;
    /* Dos formas de citar el origen conviven en el corpus: el id `colCE` de
       los últimos y el texto «Ejercicio C.E» de la fuente en los primeros.
       Se leen las dos, porque contar solo una dejaría ocho fuera. */
    const porFuente = (e.fuente ?? '').match(/Ejercicio\s+([0-9])\.([0-9]+)/);
    const porId = (e.id ?? '').match(/col([0-9])([0-9]+)/);
    const m = porFuente ?? porId;
    if (m) hechos.set(`${m[1]}.${m[2]}`, `${d}/${e.id}`);
  }
}

/* ── 3 · el cruce ────────────────────────────────────────────────── */
const faltan = enPdf.filter((p) => !hechos.has(`${p.cap}.${p.num}`));
const sobran = [...hechos.keys()].filter(
  (k) => !enPdf.some((p) => `${p.cap}.${p.num}` === k),
);

const porCap = {};
for (const p of enPdf) {
  porCap[p.cap] ??= { total: 0, hechos: 0 };
  porCap[p.cap].total++;
  if (hechos.has(`${p.cap}.${p.num}`)) porCap[p.cap].hechos++;
}

console.log(`en el PDF: ${enPdf.length} · escritos: ${hechos.size} · faltan: ${faltan.length}`);
if (sobran.length) console.log(`⚠ citados y no encontrados en el PDF: ${sobran.join(', ')}`);
console.log('\ncap | total | hechos | faltan');
for (const [c, v] of Object.entries(porCap)) {
  console.log(`  ${c} |   ${String(v.total).padStart(3)} |    ${String(v.hechos).padStart(3)} |    ${String(v.total - v.hechos).padStart(3)}`);
}

fs.writeFileSync(
  `${S}/faltan.json`,
  JSON.stringify(faltan.map((p) => ({ ref: `${p.cap}.${p.num}`, linea: p.linea, texto: p.texto })), null, 1),
);
console.log(`\nlista en ${S}/faltan.json`);
