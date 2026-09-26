/**
 * Dibuja una lámina de `src/content/laminas/` encima de su página del PDF de
 * la colección, a la misma escala, para mirarla antes de escribir su primer
 * objetivo.
 *
 * POR QUÉ. La figura de una lámina es un dato (§08): la corrección compara lo
 * que marca el alumno con la geometría calculada desde esas coordenadas, así
 * que un segmento desplazado un milímetro convierte una solución buena en un
 * diagnóstico falso, y uno que falta deja al alumno sin nada a lo que
 * engancharse. El brief del 8 de septiembre de 2026 (§4) lo pide lámina a
 * lámina, y la primera ya lo justificó: al piloto de SD1 le faltaba una pared.
 *
 *   node scripts/lamina-sobre-pdf.mjs sd1
 *   node scripts/lamina-sobre-pdf.mjs sd1 --zoom 309,228,12
 *
 * Deja una imagen en la carpeta temporal y dice dónde: la página en gris, la
 * lámina encima en rojo, los puntos con nombre en azul y los segmentos con
 * nombre rotulados. Con `--zoom x,y,r` recorta un cuadrado de lado 2r pt
 * alrededor de (x, y) a mucha más resolución, para ver décimas de punto.
 *
 * El PDF no está en el repositorio: es material de la escuela y no se
 * versiona. Se toma de `COLECCION_DIEDRICO` o de la ruta de siempre, y hace
 * falta `pdftoppm` (Poppler).
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { ROOT } from './servidor.mjs';

const PDF =
  process.env.COLECCION_DIEDRICO ??
  'C:/Users/Usuario/Desktop/2027 proyecto contenido/Expresión Gráfica/Coleccin_de_ejercicios.pdf';

const [id, ...resto] = process.argv.slice(2);
const zoomArg = resto[resto.indexOf('--zoom') + 1];
const fichero = id && join(ROOT, 'src', 'content', 'laminas', `${id}.json`);
if (!fichero || !existsSync(fichero)) {
  console.error('Uso: node scripts/lamina-sobre-pdf.mjs <id de lámina> [--zoom x,y,r]\n  la lámina tiene que estar en src/content/laminas/<id>.json');
  process.exit(1);
}
if (!existsSync(PDF)) {
  console.error(`No encuentro el PDF de la colección en ${PDF}.\n  Dale la ruta con COLECCION_DIEDRICO=<ruta> (no se versiona: es material de la escuela).`);
  process.exit(1);
}

const lamina = JSON.parse(readFileSync(fichero, 'utf8'));
const zoom = resto.includes('--zoom') ? zoomArg?.split(',').map(Number) : null;
if (zoom && (zoom.length !== 3 || zoom.some((v) => !Number.isFinite(v)))) {
  console.error('--zoom espera x,y,r en pt, por ejemplo --zoom 309,228,12');
  process.exit(1);
}

const marco = zoom ? { x: zoom[0] - zoom[2], y: zoom[1] - zoom[2], w: 2 * zoom[2], h: 2 * zoom[2] } : lamina.encuadre;
const PX_PT = zoom ? Math.min(40, 1200 / marco.w) : 4;
const dpi = 72 * PX_PT;
const carpeta = mkdtempSync(join(tmpdir(), `lamina-${id}-`));
const base = join(carpeta, 'pagina');
execFileSync('pdftoppm', [
  '-f', String(lamina.pagina), '-l', String(lamina.pagina), '-r', String(dpi),
  '-x', String(Math.round(marco.x * PX_PT)), '-y', String(Math.round(marco.y * PX_PT)),
  '-W', String(Math.round(marco.w * PX_PT)), '-H', String(Math.round(marco.h * PX_PT)),
  '-gray', '-png', '-singlefile', PDF, base,
]);
const fondo = readFileSync(`${base}.png`).toString('base64');

/* El trazo encima tiene que ser más fino que el del PDF para que se vea
   debajo: un desplazamiento de medio punto sale como dos líneas. */
const grosor = 1.2 / PX_PT;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const lineas = lamina.segmentos
  .map((s) => {
    const raya = s.tipo === 'o' ? ` stroke-dasharray="${4 / PX_PT} ${2 / PX_PT}"` : '';
    const nombre = s.nombre
      ? `<text x="${(s.a[0] + s.b[0]) / 2}" y="${(s.a[1] + s.b[1]) / 2}" class="nombre">${esc(s.nombre)}</text>`
      : '';
    return `<line x1="${s.a[0]}" y1="${s.a[1]}" x2="${s.b[0]}" y2="${s.b[1]}" stroke="#d0021b" stroke-width="${grosor}"${raya}/>${nombre}`;
  })
  .join('\n');
const puntos = Object.entries(lamina.puntos)
  .map(
    ([n, p]) =>
      `<circle cx="${p.x}" cy="${p.y}" r="${2.2 / Math.sqrt(PX_PT)}" fill="none" stroke="#0057d9" stroke-width="${grosor}"/>` +
      `<text x="${p.x + 3 / Math.sqrt(PX_PT)}" y="${p.y + 7 / Math.sqrt(PX_PT)}" class="punto">${esc(n)}</text>`,
  )
  .join('\n');
const letra = 7 / Math.sqrt(PX_PT);
const html = `<!doctype html><meta charset="utf-8"><style>
  body{margin:0;background:#fff}
  .lienzo{position:relative;width:${Math.round(marco.w * PX_PT)}px;height:${Math.round(marco.h * PX_PT)}px}
  .lienzo img,.lienzo svg{position:absolute;inset:0;width:100%;height:100%}
  .lienzo img{opacity:.55}
  text{font:${letra}px system-ui,sans-serif}
  .nombre{fill:#7a4d00} .punto{fill:#0057d9}
</style><div class="lienzo"><img src="data:image/png;base64,${fondo}">
<svg viewBox="${marco.x} ${marco.y} ${marco.w} ${marco.h}" xmlns="http://www.w3.org/2000/svg">${lineas}${puntos}</svg></div>`;

const navegador = await chromium.launch();
try {
  const pagina = await navegador.newPage({ viewport: { width: Math.round(marco.w * PX_PT), height: Math.round(marco.h * PX_PT) } });
  await pagina.setContent(html);
  const salida = join(carpeta, `${id}${zoom ? `-${zoom.join('_')}` : ''}.png`);
  await pagina.locator('.lienzo').screenshot({ path: salida });
  console.log(`${lamina.codigo}, página ${lamina.pagina}: ${lamina.segmentos.length} segmentos (${lamina.segmentos.filter((s) => s.nombre).length} con nombre) y ${Object.keys(lamina.puntos).length} puntos con nombre.`);
  console.log(`La lámina encima del PDF: ${salida}`);
} finally {
  await navegador.close();
}
