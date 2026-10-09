/**
 * Dibuja las vistas que calcula el motor para una pieza encima de la página
 * del PDF donde están dibujadas, para cotejar una pieza descrita a ojo
 * (diseño de la fase M, §3.1). Hermano de `lamina-sobre-pdf.mjs`.
 *
 * POR QUÉ. Una pieza es un dato del que depende la corrección: el Taller de
 * vistas comparará lo que traza el alumno con las vistas calculadas desde
 * su descripción, así que una pieza mal descrita da una solución falsa con
 * todos los guardianes en verde (regla 3 del patrón 2, §05). Las del
 * material no vienen acotadas (`cotas: proporcionales`): se miden sobre la
 * figura, y lo medido se mira encima de la figura.
 *
 *   node scripts/pieza-sobre-pdf.mjs nyv-2-18-3 --pdf Normalizacin_y_Vistas.pdf --pagina 22 \
 *     --escala 2.8346 --alzado 150.2,98.4 --planta 150.2,240 --perfil 318,98.4
 *
 *   --pdf ruta        el PDF, absoluto o dentro de MATERIAL_EG (por defecto,
 *                     la carpeta de Expresión Gráfica de siempre)
 *   --pagina n        la página del PDF, no la impresa
 *   --escala s        pt de la página por mm de la pieza (2.8346 si la pieza
 *                     se describió a la medida de la página: 72 / 25,4)
 *   --alzado x,y[,g]  dónde cae en la página, en pt, el origen (u = 0, v = 0)
 *   --planta x,y[,g]  de cada vista; g, un giro de 90, 180 o 270 grados en
 *   --perfil x,y[,g]  el sentido de las agujas, para las claves que colocan
 *   --derecho x,y[,g] una vista de otro modo. Solo se dibujan las que se dan;
 *                     `derecho` es el perfil derecho, que algunas claves
 *                     dibujan a la izquierda del alzado (`lib/vistas/gira.ts`).
 *   --zoom x,y,r      un cuadrado de lado 2r pt alrededor de (x, y), a mucha
 *                     más resolución, para ver décimas de punto
 *   --yaml ruta       otra descripción de la pieza (un borrador) en vez de
 *                     src/content/piezas/<id>.yaml
 *   --salida carpeta  dónde dejar la imagen (por defecto, una temporal)
 *
 * Deja una imagen y dice dónde: la página en gris, las aristas vistas
 * encima en rojo, las ocultas en rojo a trazos y los ejes en azul. El motor
 * corre aquí, sobre la descripción: no hace falta haber pasado `npm run
 * vistas` para mirar un borrador.
 *
 * El PDF no está en el repositorio: es material de la escuela y no se
 * versiona. Hace falta `pdftoppm` (Poppler).
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { isAbsolute, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { chromium } from 'playwright';
import { compilaPieza } from '../src/lib/vistas/pieza.ts';
import { calculaVistas } from '../src/lib/vistas/motor.ts';
import { mediaVuelta } from '../src/lib/vistas/gira.ts';
import { rutaDePieza } from '../src/lib/vistas/resumen.ts';

const RAIZ = fileURLToPath(new URL('..', import.meta.url));
const MATERIAL = process.env.MATERIAL_EG ?? 'C:/Users/Usuario/Desktop/2027 proyecto contenido/Expresión Gráfica';
/* `derecho` es el perfil derecho: el izquierdo de la pieza con media vuelta
   (`lib/vistas/gira.ts`). */
const VISTAS = ['alzado', 'planta', 'perfil', 'derecho'];

const uso = () => {
  console.error('Uso: node scripts/pieza-sobre-pdf.mjs <id> --pdf <pdf> --pagina <n> --escala <pt/mm> --alzado x,y [--planta x,y] [--perfil x,y] [--derecho x,y] [--zoom x,y,r] [--yaml ruta] [--salida carpeta]');
  process.exit(1);
};

const [id, ...resto] = process.argv.slice(2);
if (!id || id.startsWith('--')) uso();
const opcion = (nombre) => {
  const i = resto.indexOf(`--${nombre}`);
  return i >= 0 ? resto[i + 1] : undefined;
};
const numeros = (texto, cuantos, nombre) => {
  const xs = texto.split(',').map(Number);
  if (!cuantos.includes(xs.length) || xs.some((x) => !Number.isFinite(x))) {
    console.error(`--${nombre} espera ${cuantos.join(' o ')} números separados por comas, y dio «${texto}»`);
    process.exit(1);
  }
  return xs;
};

const fichero = opcion('yaml') ?? rutaDePieza(RAIZ, id);
if (!existsSync(fichero)) {
  console.error(`No encuentro la pieza en ${fichero}.`);
  uso();
}
const pdfDado = opcion('pdf');
if (!pdfDado) uso();
const PDF = isAbsolute(pdfDado) ? pdfDado : join(MATERIAL, pdfDado);
if (!existsSync(PDF)) {
  console.error(`No encuentro el PDF en ${PDF}.\n  Dale la carpeta con MATERIAL_EG=<ruta> (no se versiona: es material de la escuela).`);
  process.exit(1);
}
const pagina = Number(opcion('pagina'));
const escala = Number(opcion('escala'));
if (!Number.isInteger(pagina) || pagina < 1 || !(escala > 0)) uso();

const colocadas = VISTAS.filter((k) => opcion(k) !== undefined).map((k) => {
  const [x, y, giro = 0] = numeros(opcion(k), [2, 3], k);
  if (![0, 90, 180, 270].includes(giro)) {
    console.error(`--${k}: el giro es 0, 90, 180 o 270`);
    process.exit(1);
  }
  return { k, x, y, giro };
});
if (!colocadas.length) uso();
const zoom = opcion('zoom') ? numeros(opcion('zoom'), [3], 'zoom') : null;

const declarada = yaml.load(readFileSync(fichero, 'utf8'));
const pieza = compilaPieza(declarada);
const calculadas = calculaVistas(pieza);
const derecho = colocadas.some((c) => c.k === 'derecho') ? calculaVistas(compilaPieza(mediaVuelta(declarada))).vistas.perfil : null;
const vistaDe = (k) => (k === 'derecho' ? derecho : calculadas.vistas[k]);

/* Cada forma del papel, como puntos (un arco, cada 2°), puesta en la página:
   p = origen + escala · giro(u, v), con la v hacia abajo como en el PDF. */
const enPagina = ({ x, y, giro }) => {
  const [c, s] = [Math.round(Math.cos((giro * Math.PI) / 180)), Math.round(Math.sin((giro * Math.PI) / 180))];
  return ([u, v]) => [x + escala * (c * u - s * v), y + escala * (s * u + c * v)];
};
const puntosDe = (f) => {
  if (f.tipo === 'segmento') return [f.a, f.b];
  if (f.tipo === 'polilinea') return f.puntos;
  const n = Math.max(2, Math.ceil((f.hasta - f.desde) / 2));
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = ((f.desde + ((f.hasta - f.desde) * i) / n) * Math.PI) / 180;
    return [f.c[0] + f.r * Math.cos(a), f.c[1] + f.r * Math.sin(a)];
  });
};

const trazos = [];
for (const c of colocadas) {
  const v = vistaDe(c.k);
  const P = enPagina(c);
  for (const e of v.ejes) trazos.push({ clase: 'eje', puntos: [e.a, e.b].map(P) });
  for (const t of v.tramos) trazos.push({ clase: t.tipo === 'visto' ? 'visto' : 'oculto', puntos: puntosDe(t.forma).map(P) });
}
const todos = trazos.flatMap((t) => t.puntos);
const MARGEN = 15;
const marco = zoom
  ? { x: zoom[0] - zoom[2], y: zoom[1] - zoom[2], w: 2 * zoom[2], h: 2 * zoom[2] }
  : (() => {
      const [x0, x1] = [Math.min(...todos.map((p) => p[0])) - MARGEN, Math.max(...todos.map((p) => p[0])) + MARGEN];
      const [y0, y1] = [Math.min(...todos.map((p) => p[1])) - MARGEN, Math.max(...todos.map((p) => p[1])) + MARGEN];
      return { x: Math.max(0, x0), y: Math.max(0, y0), w: x1 - Math.max(0, x0), h: y1 - Math.max(0, y0) };
    })();

const PX_PT = zoom ? Math.min(40, 1200 / marco.w) : 4;
const carpeta = opcion('salida') ?? mkdtempSync(join(tmpdir(), `pieza-${id}-`));
mkdirSync(carpeta, { recursive: true });
const base = join(carpeta, `pagina-${pagina}`);
execFileSync('pdftoppm', [
  '-f', String(pagina), '-l', String(pagina), '-r', String(72 * PX_PT),
  '-x', String(Math.round(marco.x * PX_PT)), '-y', String(Math.round(marco.y * PX_PT)),
  '-W', String(Math.round(marco.w * PX_PT)), '-H', String(Math.round(marco.h * PX_PT)),
  '-gray', '-png', '-singlefile', PDF, base,
], { stdio: ['ignore', 'ignore', 'ignore'] });
const fondo = readFileSync(`${base}.png`).toString('base64');

/* El trazo encima, más fino que el del PDF para que se vea el de debajo: un
   desplazamiento de medio punto sale como dos líneas. */
const grosor = 1.2 / PX_PT;
const estilo = {
  visto: `stroke="#d0021b" stroke-width="${grosor}"`,
  oculto: `stroke="#d0021b" stroke-width="${grosor}" stroke-dasharray="${4 / PX_PT} ${2 / PX_PT}"`,
  eje: `stroke="#0057d9" stroke-width="${grosor}" stroke-dasharray="${6 / PX_PT} ${2 / PX_PT} ${1 / PX_PT} ${2 / PX_PT}"`,
};
const svg = trazos
  .map((t) => `<polyline fill="none" points="${t.puntos.map((p) => p.map((n) => n.toFixed(3)).join(',')).join(' ')}" ${estilo[t.clase]}/>`)
  .join('\n');
const html = `<!doctype html><meta charset="utf-8"><style>
  body{margin:0;background:#fff}
  .lienzo{position:relative;width:${Math.round(marco.w * PX_PT)}px;height:${Math.round(marco.h * PX_PT)}px}
  .lienzo img,.lienzo svg{position:absolute;inset:0;width:100%;height:100%}
  .lienzo img{opacity:.55}
</style><div class="lienzo"><img src="data:image/png;base64,${fondo}">
<svg viewBox="${marco.x} ${marco.y} ${marco.w} ${marco.h}" xmlns="http://www.w3.org/2000/svg">${svg}</svg></div>`;

const navegador = await chromium.launch();
try {
  const hoja = await navegador.newPage({ viewport: { width: Math.round(marco.w * PX_PT), height: Math.round(marco.h * PX_PT) } });
  await hoja.setContent(html);
  const salida = join(carpeta, `${id}-p${pagina}${zoom ? `-${zoom.join('_')}` : ''}.png`);
  await hoja.locator('.lienzo').screenshot({ path: salida });
  for (const c of colocadas) {
    const v = vistaDe(c.k);
    console.log(`${c.k}: ${v.tramos.filter((t) => t.tipo === 'visto').length} tramos vistos, ${v.tramos.filter((t) => t.tipo === 'oculto').length} ocultos y ${v.ejes.length} ejes, con el origen en (${c.x}, ${c.y}) pt${c.giro ? ` y girada ${c.giro}°` : ''}.`);
  }
  console.log(`${pieza.codigo} encima de la página ${pagina}: ${salida}`);
} finally {
  await navegador.close();
}
