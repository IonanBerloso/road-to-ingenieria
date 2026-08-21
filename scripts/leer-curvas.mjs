import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

/* Lector de gráficas con VARIAS curvas superpuestas, separadas por color.
 *
 * `leer-grafica.mjs` distingue la curva de la rejilla por continuidad
 * horizontal, y eso basta cuando hay **una** curva. No basta cuando hay tres
 * en el mismo panel —una función y sus dos derivadas, que es un enunciado
 * habitual en la segunda evaluación—: las tres son continuas y el criterio no
 * las separa.
 *
 * Aquí se separan por color, que es lo que hace el profesor al dibujarlas:
 * azul la función, rojo la derivada, gris la segunda. Y de paso se localiza
 * la rejilla sola, midiendo densidad de tinta por filas y columnas, para no
 * tener que leer los ejes a ojo.
 *
 * Uso:
 *   node leer-curvas.mjs <png> <x0> <x1> <y0> <y1> [xq ...]
 *
 * donde x0,x1,y0,y1 son los valores **matemáticos** de los bordes del marco
 * de la gráfica —el rectángulo que la encierra, que se detecta solo— y los
 * xq opcionales son abscisas a muestrear.
 *
 * Escrito el 21 de agosto de 2026 para el ejercicio 3 de la segunda
 * evaluación de 2023-2024.
 */
const [png, X0, X1, Y0, Y1, ...XQ] = process.argv.slice(2);
const x0 = +X0, x1 = +X1, y0 = +Y0, y1 = +Y1;
const consultas = XQ.map(Number);

const nav = await chromium.launch();
const pag = await nav.newPage();
await pag.goto('about:blank');

const res = await pag.evaluate(async (url) => {
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
  const px = (x, y) => {
    const i = (y * W + x) * 4;
    return [data[i], data[i + 1], data[i + 2]];
  };

  /* El marco: la fila y la columna con más tinta oscura de cada mitad. */
  const tinta = (r, g, b) => r < 190 && g < 190 && b < 190;
  const filas = [], cols = [];
  for (let y = 0; y < H; y++) {
    let n = 0;
    for (let x = 0; x < W; x++) if (tinta(...px(x, y))) n++;
    filas.push(n);
  }
  for (let x = 0; x < W; x++) {
    let n = 0;
    for (let y = 0; y < H; y++) if (tinta(...px(x, y))) n++;
    cols.push(n);
  }
  const mejor = (arr, desde, hasta) => {
    let iM = desde, vM = -1;
    for (let i = desde; i < hasta; i++) if (arr[i] > vM) { vM = arr[i]; iM = i; }
    return iM;
  };
  const marco = {
    izq: mejor(cols, 0, Math.floor(W / 2)),
    der: mejor(cols, Math.floor(W / 2), W),
    arr: mejor(filas, 0, Math.floor(H / 2)),
    aba: mejor(filas, Math.floor(H / 2), H),
  };

  /* Clasificación por color. Los tres estilos del enunciado son
     inconfundibles en cuanto se miran los canales por separado. */
  const clase = (r, g, b) => {
    if (r > 200 && g > 200 && b > 200) return null;
    if (b - r > 45 && b - g > 45) return 'azul';
    if (r - g > 45 && r - b > 45) return 'rojo';
    if (Math.abs(r - g) < 42 && Math.abs(g - b) < 42 && r < 175) return 'gris';
    return null;
  };

  const series = { azul: [], rojo: [], gris: [] };
  for (let x = marco.izq; x <= marco.der; x++) {
    const acum = { azul: [], rojo: [], gris: [] };
    for (let y = marco.arr; y <= marco.aba; y++) {
      const k = clase(...px(x, y));
      if (k) acum[k].push(y);
    }
    for (const k of ['azul', 'rojo', 'gris']) {
      if (acum[k].length) {
        series[k].push([x, acum[k].reduce((a, b) => a + b, 0) / acum[k].length]);
      }
    }
  }
  return { W, H, marco, series };
}, `data:image/png;base64,${readFileSync(png).toString('base64')}`);

await nav.close();

const { marco, series } = res;
console.log(`imagen ${res.W}x${res.H}`);
console.log(`marco  x: ${marco.izq}..${marco.der}   y: ${marco.arr}..${marco.aba}`);

const aX = (p) => x0 + ((p - marco.izq) / (marco.der - marco.izq)) * (x1 - x0);
const aY = (p) => y1 + ((p - marco.arr) / (marco.aba - marco.arr)) * (y0 - y1);
const f = (n, d = 3) => n.toFixed(d);

for (const [nombre, pts] of Object.entries(series)) {
  if (!pts.length) { console.log(`\n${nombre}: sin puntos`); continue; }
  const curva = pts.map(([p, q]) => ({ x: aX(p), y: aY(q) }));
  let mx = curva[0], mn = curva[0];
  for (const c of curva) { if (c.y > mx.y) mx = c; if (c.y < mn.y) mn = c; }
  console.log(`\n${nombre}  (${curva.length} px)`);
  console.log(`  máx  x=${f(mx.x)}  y=${f(mx.y)}      mín  x=${f(mn.x)}  y=${f(mn.y)}`);

  const cortes = [];
  for (let i = 1; i < curva.length; i++) {
    const a = curva[i - 1].y, b = curva[i].y;
    if ((a < 0) !== (b < 0)) {
      const t = a / (a - b);
      cortes.push(f(curva[i - 1].x + t * (curva[i].x - curva[i - 1].x), 4));
    }
  }
  if (cortes.length) console.log(`  corta y=0 en x = ${cortes.join(', ')}`);

  if (consultas.length) {
    const linea = consultas.map((xq) => {
      const c = curva.reduce((a, b) => (Math.abs(b.x - xq) < Math.abs(a.x - xq) ? b : a));
      return `${xq}:${f(c.y, 3)}`;
    });
    console.log('  ' + linea.join('   '));
  }
}
