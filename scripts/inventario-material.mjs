/**
 * El inventario del material: qué hay en cada PDF de la carpeta de
 * contenidos y qué usa el sitio de él (fase E6 de la auditoría del 27 de
 * septiembre de 2026).
 *
 * La prueba de utilidad de §13:
 *   · Para quién: quien mantiene el proyecto.
 *   · Cuándo: antes de escribir «no hay material», «bloqueado por material» o
 *     un `fuera` que diga que algo no se reproduce.
 *   · Qué gana: no volver a decir que falta algo que está. La auditoría contó
 *     seis «no hay material» falsos: el material lo traía, en una página que
 *     era imagen o en un PDF que nadie había abierto entero.
 *   · Cómo se comprueba: cada fila dice páginas, palabras y qué páginas son
 *     casi solo imagen —donde el texto no se lee y hay que renderizar—, y
 *     cuántas veces cita el repositorio ese fichero. Un «no hay» se escribe
 *     citando su fila y una página renderizada.
 *
 *   npm run inventario-material            → la tabla, por pantalla
 *   npm run inventario-material -- --escribe  → y además en «inventario-material.md»,
 *                                               dentro de la carpeta del material
 *
 * La tabla **no se guarda en el repositorio**, que es público: lista los
 * nombres de los ficheros del material, y un nombre puede llevar datos de
 * alguien —una presentación con los nombres de quienes la hicieron—. Se guarda
 * junto al material, fuera del repositorio, y se vuelve a sacar cuando haga
 * falta: el guion es la fuente, no la tabla.
 *
 * El material vive fuera del repositorio, en «2027 proyecto contenido», junto
 * al escritorio; `MATERIAL=<ruta>` apunta a otra carpeta. No corre en el CI,
 * que no tiene el material, ni forma parte del suelo.
 *
 * **Los ficheros con datos de terceros no se abren** (CLAUDE.md, «Antes de
 * nada»): los de la lista, por su nombre, y cualquiera con «notas»,
 * «calificaciones», «lista», «grupo» o «resultados» en el nombre salen como
 * vetados sin leerlos. De los demás se extrae el texto para contar, y si trae
 * algo con forma de DNI tampoco se inventaría: se dice y nada más.
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, basename, extname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const RAIZ = join(fileURLToPath(import.meta.url), '..', '..');
const MATERIAL = process.env.MATERIAL ?? join(RAIZ, '..', '..', '..', '2027 proyecto contenido');
const ESCRIBE = process.argv.includes('--escribe');

if (!existsSync(MATERIAL)) {
  console.error(`No encuentro la carpeta del material: ${MATERIAL}. Pásala con MATERIAL=<ruta>.`);
  process.exit(2);
}

/* La lista de CLAUDE.md, por nombre, y las palabras que hacen personal un
   fichero hasta que se demuestre lo contrario. */
const VETADOS = [
  /^PRIMER_CONTROL\._NOTAS/i,
  /^Subgrupos_para_pr.?cticas_de_ordenador/i,
  /^TRABAJO_EN_GRUPO\._NOTA_FINAL/i,
  /^TRABAJO_PERSONAL\._NOTA_FINAL/i,
  /^DISTRIBUCI.?N_DE_GRUPOS/i,
  /^CONVOCATORIA_EXTRAORDINARIA\._PARCIALES_A_REALIZAR/i,
  /^C.?DIGOS_SOCRATIVE/i,
  /^Notas_parcial/i,
  /^Grupos_Laboratorio/i,
  /^CONVOCATORIA_(EXTRA)?ORDINARIA_-_(NOTAS|CALIFICACIONES)/i,
  /^Lista_del_grupo/i,
  /^Pr.?ctica_2\._Resultados/i,
  /Nota_Pr.?cticas|Notas_de_pr.?cticas|Resultados_Test/i,
  /^Normas_y_recomendaciones_para_seguir_la_asignatura/i,
  /Grupo/i,
  /^RESULTADOS_DE_LA_PRACTICA/i,
  /^DATOS_DE_LA_PR.?CTICA_6/i,
  /^Distribuci.?n_grupos/i,
];
/* En singular también: `TRABAJO_PERSONAL._NOTA_FINAL.pdf` de Cálculo no está
   en la lista, dice «NOTA» y no «NOTAS», y la primera pasada de este guion lo
   abrió por eso; la regla del DNI lo paró antes de contar nada, pero la del
   nombre tenía que haberlo parado antes de abrirlo (28 de septiembre de 2026).
   Veta de más —la «Nota sobre la evaluación» de la UPV/EHU cae aquí—, y eso
   es lo que se quiere: un vetado de más no se cuenta, uno de menos se abre. */
const PALABRAS = /nota|calificaci|lista|grupo|resultado/i;
const DNI = /\b\d{8}[A-Z]\b/;

const herramienta = (orden, args) => {
  const r = spawnSync(orden, args, { encoding: 'latin1', maxBuffer: 256 * 1024 * 1024 });
  return r.status === 0 ? r.stdout : null;
};
if (herramienta('pdfinfo', ['-v']) === null && herramienta('pdftotext', ['-v']) === null) {
  /* poppler escribe la versión por stderr y sale con 0 o con 99 según la
     versión; si ninguna de las dos arranca, no hay nada que hacer. */
  const prueba = spawnSync('pdfinfo', ['-v']);
  if (prueba.error) {
    console.error('Hacen falta pdfinfo, pdftotext y pdfimages (poppler).');
    process.exit(2);
  }
}

function* pdfs(dir) {
  for (const n of readdirSync(dir).sort()) {
    const r = join(dir, n);
    if (statSync(r).isDirectory()) yield* pdfs(r);
    else if (extname(n).toLowerCase() === '.pdf') yield r;
  }
}

/* Lo que el repositorio cita de cada fichero: su nombre, sin extensión, en el
   contenido y en `public/`. Se lee una vez y se busca en memoria. */
function* textos(dir) {
  for (const n of readdirSync(dir)) {
    const r = join(dir, n);
    if (statSync(r).isDirectory()) yield* textos(r);
    else if (/\.(ya?ml|mdx?|json|astro|ts)$/.test(n)) yield r;
  }
}
const corpus = [...textos(join(RAIZ, 'src'))].map((f) => readFileSync(f, 'utf8')).join('\n');
const enPublic = new Set();
function* todos(dir) {
  for (const n of readdirSync(dir)) {
    const r = join(dir, n);
    if (statSync(r).isDirectory()) yield* todos(r);
    else yield n;
  }
}
if (existsSync(join(RAIZ, 'public'))) for (const n of todos(join(RAIZ, 'public'))) enPublic.add(n);

const filas = [];
for (const f of pdfs(MATERIAL)) {
  const nombre = basename(f);
  const asignatura = relative(MATERIAL, f).split(/[\\/]/)[0];
  const fila = { asignatura, fichero: relative(MATERIAL, f).replace(/\\/g, '/'), nombre };
  if (VETADOS.some((re) => re.test(nombre))) {
    filas.push({ ...fila, estado: 'vetado: datos de terceros, no se abre' });
    continue;
  }
  if (PALABRAS.test(nombre)) {
    filas.push({ ...fila, estado: 'vetado por el nombre, no se abre (puede no llevar datos)' });
    continue;
  }
  const info = herramienta('pdfinfo', [f]) ?? '';
  const paginas = Number(/Pages:\s+(\d+)/.exec(info)?.[1] ?? 0);
  const texto = herramienta('pdftotext', ['-layout', f, '-']) ?? '';
  if (DNI.test(texto)) {
    filas.push({ ...fila, paginas, estado: 'trae algo con forma de DNI: no se inventaría' });
    continue;
  }
  /* pdftotext separa las páginas con un salto de página. */
  const porPagina = texto.split('\f').slice(0, paginas || undefined).map((t) => (t.match(/\S+/g) ?? []).length);
  const palabras = porPagina.reduce((s, n) => s + n, 0);
  const imagenes = (herramienta('pdfimages', ['-list', f]) ?? '').split('\n').slice(2).filter((l) => l.trim()).length;
  const sinTexto = porPagina.map((n, i) => (n < 25 ? i + 1 : null)).filter(Boolean);
  const base = nombre.replace(/\.pdf$/i, '');
  const citas = corpus.split(base).length - 1 + (enPublic.has(nombre) ? 1 : 0);
  filas.push({
    ...fila,
    paginas,
    palabras,
    porPagina: paginas ? Math.round(palabras / paginas) : 0,
    imagenes,
    sinTexto,
    citas,
    estado: sinTexto.length && sinTexto.length >= paginas / 2 ? 'casi todo imagen: hay que renderizarlo' : 'texto',
  });
}

const rango = (xs) => {
  if (!xs?.length) return '—';
  const trozos = [];
  let ini = xs[0];
  let fin = xs[0];
  for (const x of xs.slice(1).concat([null])) {
    if (x === fin + 1) fin = x;
    else {
      trozos.push(ini === fin ? `${ini}` : `${ini}–${fin}`);
      ini = fin = x;
    }
  }
  return trozos.join(', ');
};

const hoy = new Date().toISOString().slice(0, 10);
const salida = [
  `# Inventario del material · ${hoy}`,
  '',
  `Generado con \`npm run inventario-material\` sobre «${basename(MATERIAL)}». ${filas.length} PDF,` +
    ` ${filas.filter((x) => x.estado.startsWith('vetado')).length} vetados sin abrir.`,
  'Las páginas «casi sin texto» son las de menos de 25 palabras: imagen, escaneo o figura, y lo que',
  'digan hay que leerlo renderizado. «Citas» cuenta las veces que el repositorio nombra el fichero.',
  '',
  '| asignatura | fichero | págs. | palabras/pág. | imágenes | casi sin texto | citas | estado |',
  '|---|---|---|---|---|---|---|---|',
  ...filas.map(
    (x) =>
      `| ${x.asignatura} | ${x.fichero.split('/').slice(1).join('/')} | ${x.paginas ?? '—'} | ${x.porPagina ?? '—'} | ${
        x.imagenes ?? '—'
      } | ${rango(x.sinTexto)} | ${x.citas ?? '—'} | ${x.estado} |`,
  ),
  '',
].join('\n');

console.log(salida);
if (ESCRIBE) {
  const destino = join(MATERIAL, 'inventario-material.md');
  writeFileSync(destino, salida);
  console.error(`escrito en ${destino}, fuera del repositorio`);
}
