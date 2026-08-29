/* scripts/mide.mjs — la tabla «tema a tema» de docs/como-vamos.md, medida.
 *
 * POR QUÉ EXISTE
 * Ese documento se escribía a mano y llevó dos commits publicando «66 de 89
 * convocatorias» cuando ya eran 68. §10 no admite eso, y la salida buena está
 * dicha en el propio fichero desde entonces: generarla.
 *
 * LA DEFINICIÓN DE «PALABRA», que es la parte que hay que respetar: la prosa
 * de un tema se cuenta sobre su `index.mdx` quitando la portada, los bloques
 * `<svg>`, las fórmulas entre dólares y las etiquetas HTML. No es la única
 * definición posible; lo importante es que sea **la misma** en cada medición,
 * y por eso vive aquí y no en la cabeza de nadie.
 *
 *   node scripts/mide.mjs [asignatura]
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import yaml from 'js-yaml';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const asig = process.argv[2] ?? 'calculo';
const A = join(RAIZ, 'src', 'content', asig);

/** Palabras de prosa, con la definición de arriba. */
function palabras(mdx) {
  return mdx
    .replace(/^---[\s\S]*?\n---\n/, '')          // la portada
    .replace(/<svg[\s\S]*?<\/svg>/g, ' ')        // los dibujos
    .replace(/<figcaption[\s\S]*?<\/figcaption>/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')           // fórmulas en bloque
    .replace(/\$[^$\n]*\$/g, ' ')                // fórmulas en línea
    .replace(/<[^>]+>/g, ' ')                    // etiquetas
    .replace(/^import .*$/gm, ' ')
    .split(/\s+/).filter(Boolean).length;
}

const temas = readdirSync(A).filter((d) => /^t\d\d-/.test(d)).sort();
const exams = existsSync(join(A, 'examenes')) ? readdirSync(join(A, 'examenes')) : [];

/* ejercicios de examen por tema */
const deExamen = {};
let ejerciciosExamen = 0, pasosTotal = 0, ejerciciosTotal = 0;
for (const d of exams) {
  const ex = yaml.load(readFileSync(join(A, 'examenes', d, 'examen.yaml'), 'utf8'));
  for (const x of ex.ejercicios) deExamen[x.tema] = (deExamen[x.tema] ?? 0) + 1;
  for (const e of yaml.load(readFileSync(join(A, 'examenes', d, 'ejercicios.yaml'), 'utf8')).ejercicios) {
    ejerciciosExamen++; ejerciciosTotal++; pasosTotal += (e.pasos ?? []).length;
  }
}

const filas = [];
let tp = 0, tf = 0, te = 0, tj = 0;
for (const t of temas) {
  const mdx = readFileSync(join(A, t, 'index.mdx'), 'utf8');
  const ej = yaml.load(readFileSync(join(A, t, 'ejercicios.yaml'), 'utf8')).ejercicios;
  const p = palabras(mdx);
  const f = (mdx.match(/<figure/g) || []).length;
  const ejem = ej.filter((e) => e.nivel === 'ejemplo').length;
  ejerciciosTotal += ej.length;
  for (const e of ej) pasosTotal += (e.pasos ?? []).length;
  tp += p; tf += f; te += ej.length; tj += ejem;
  filas.push({ t, p, f, n: ej.length, ejem, ex: deExamen[t] ?? 0 });
}

const nombre = (t) => t.replace(/^t(\d\d)-/, 't$1 ').replace(/-/g, ' ');
console.log('| tema | prosa | fig. | ejerc. propios | ejemplos | ejerc. de examen |');
console.log('|---|---|---|---|---|---|');
for (const f of filas) {
  console.log(`| ${nombre(f.t)} | ${f.p.toString()} | ${f.f} | ${f.n} | ${f.ejem} | ${f.ex} |`);
}
console.log(`| **total** | **${tp.toString()}** | **${tf}** | **${te}** | **${tj}** | **${ejerciciosExamen}** |`);
console.log(`\nEn todo el corpus de ${asig}: **${ejerciciosTotal} ejercicios y ${pasosTotal.toString()} pasos**.`);
