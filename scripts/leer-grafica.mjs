import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

/* Lector de gráficas de examen.
 *
 * El problema: la curva, la rejilla punteada y las etiquetas de los ejes son
 * todas negras. Lo que las distingue es que **la curva es continua en
 * horizontal**: en cualquier ventana de columnas vecinas hay tinta a la misma
 * altura. Una línea punteada vertical no la tiene —sus vecinas son blancas— y
 * un rótulo tampoco, porque es corto.
 *
 * Uso: node medir-grafica.mjs <png> <py_y1> <py_y0> <py_ym1> <px_x0> <px_xref> <xref>
 */
const [png, PY1, PY0, PYm1, PX0, PXREF, XREF] = process.argv.slice(2);
const py1 = +PY1, py0 = +PY0, pym1 = +PYm1, px0 = +PX0, pxref = +PXREF, xref = +XREF;
const UY = ((py0 - py1) + (pym1 - py0)) / 2;
const UX = (pxref - px0) / xref;

const nav = await chromium.launch();
const pag = await nav.newPage();
await pag.goto('about:blank');

const crudo = await pag.evaluate(
  async ({ url, py0, py1, pym1 }) => {
    const img = new Image();
    img.src = url;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const { data } = ctx.getImageData(0, 0, c.width, c.height);
    const W = c.width, H = c.height;
    const oscuro = (x, y) => x >= 0 && x < W && y >= 0 && y < H && data[(y * W + x) * 4] < 110;

    /** Cuántas de las 17 columnas vecinas tienen tinta a esta altura (±6 px). */
    const continuidad = (x, y) => {
      let n = 0;
      for (let dx = -8; dx <= 8; dx++) {
        for (let dy = -6; dy <= 6; dy++) {
          if (oscuro(x + dx, y + dy)) { n++; break; }
        }
      }
      return n;
    };

    const esRef = (y) =>
      Math.abs(y - py0) <= 5 || Math.abs(y - py1) <= 7 || Math.abs(y - pym1) <= 7;

    const puntos = [];
    for (let x = 0; x < W; x++) {
      const candidatos = [];
      let ini = null;
      for (let y = 0; y <= H; y++) {
        if (y < H && oscuro(x, y)) {
          if (ini === null) ini = y;
        } else if (ini !== null) {
          const centro = (ini + y - 1) / 2;
          const grosor = y - ini;
          if (grosor >= 4 && !esRef(centro) && continuidad(x, centro) >= 15) {
            candidatos.push(centro);
          }
          ini = null;
        }
      }
      if (candidatos.length === 1) puntos.push([x, candidatos[0]]);
    }
    return puntos;
  },
  { url: `data:image/png;base64,${readFileSync(png).toString('base64')}`, py0, py1, pym1 },
);

const curva = crudo.map(([px, py]) => ({ x: (px - px0) / UX, y: (py0 - py) / UY }));
const f = (n, d = 3) => n.toFixed(d);

let max = curva[0], min = curva[0];
for (const p of curva) { if (p.y > max.y) max = p; if (p.y < min.y) min = p; }

console.log(`trazados ${curva.length} px  ·  x de ${f(curva[0].x)} a ${f(curva.at(-1).x)}`);
console.log(`MÁXIMO  x=${f(max.x)}  g=${f(max.y)}`);
console.log(`MÍNIMO  x=${f(min.x)}  g=${f(min.y)}`);

console.log('\ncortes con 0, 1 y -1:');
for (let i = 1; i < curva.length; i++) {
  if (curva[i].x - curva[i - 1].x > 0.01) continue; // no interpolar sobre huecos
  for (const [nivel, et] of [[0, ' g=0'], [1, ' g=1'], [-1, 'g=-1']]) {
    const a = curva[i - 1].y - nivel, b = curva[i].y - nivel;
    if ((a < 0) !== (b < 0)) {
      const t = a / (a - b);
      console.log(
        `  ${et}  x = ${f(curva[i - 1].x + t * (curva[i].x - curva[i - 1].x), 4)}` +
          `   ${b > a ? 'subiendo' : 'bajando'}`,
      );
    }
  }
}

console.log('\nmuestreo:');
let linea = '';
for (let xq = -0.275; xq <= 0.5001; xq += 0.025) {
  const c = curva.reduce((a, b) => (Math.abs(b.x - xq) < Math.abs(a.x - xq) ? b : a));
  linea += Math.abs(c.x - xq) < 0.006 ? `${f(xq, 3)}:${f(c.y, 2)}  ` : `${f(xq, 3)}:—  `;
  if (linea.length > 70) { console.log('  ' + linea); linea = ''; }
}
if (linea) console.log('  ' + linea);

await nav.close();
