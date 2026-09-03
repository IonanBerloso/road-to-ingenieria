import { chromium } from 'playwright';
import fs from 'node:fs';
const S = 'C:/Users/Usuario/AppData/Local/Temp/claude/c--Users-Usuario-Desktop-proyectos-2027-proyecto/cad04f37-fed5-4c4b-9b6b-c82a19a98169/scratchpad';
const uri = 'data:image/png;base64,' + fs.readFileSync(S + '/g821-174.png').toString('base64');
const b = await chromium.launch();
const p = await b.newPage();
await p.goto('about:blank');
const datos = await p.evaluate(async (src) => {
  const img = new Image();
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = src; });
  const c = document.createElement('canvas');
  c.width = img.width; c.height = img.height;
  const g = c.getContext('2d');
  g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height).data;
  const px = (x, y) => { const i = (y * c.width + x) * 4; return [d[i], d[i + 1], d[i + 2]]; };
  const esAzul = (r, gg, bb) => bb > 120 && bb - r > 40 && bb - gg > 20;
  const esNegro = (r, gg, bb) => r < 120 && gg < 120 && bb < 120;
  const colNegro = [], filNegro = [];
  for (let x = 0; x < c.width; x++) { let n = 0; for (let y = 0; y < c.height; y++) { const q = px(x, y); if (esNegro(q[0], q[1], q[2])) n++; } colNegro.push(n); }
  for (let y = 0; y < c.height; y++) { let n = 0; for (let x = 0; x < c.width; x++) { const q = px(x, y); if (esNegro(q[0], q[1], q[2])) n++; } filNegro.push(n); }
  const puntos = [];
  for (let x = 0; x < c.width; x++) {
    let s = 0, n = 0;
    for (let y = 0; y < c.height; y++) { const q = px(x, y); if (esAzul(q[0], q[1], q[2])) { s += y; n++; } }
    if (n > 0) puntos.push([x, s / n, n]);
  }
  return { w: c.width, h: c.height, colNegro, filNegro, puntos };
}, uri);

const top = (a, k) => a.map((v, i) => [i, v]).filter(x => x[1] > k).map(x => x[0]);
const agrupa = (xs) => { const g = []; let act = [xs[0]]; for (let i = 1; i < xs.length; i++) { if (xs[i] - xs[i - 1] <= 2) act.push(xs[i]); else { g.push(act); act = [xs[i]]; } } g.push(act); return g.map(a => a.reduce((s, v) => s + v, 0) / a.length); };

const cols = agrupa(top(datos.colNegro, datos.h * 0.45));
const fils = agrupa(top(datos.filNegro, datos.w * 0.45));
console.log('imagen', datos.w, 'x', datos.h);
console.log('verticales:', cols.map(v => v.toFixed(1)).join(' '));
console.log('horizontales:', fils.map(v => v.toFixed(1)).join(' '));
console.log('rango x azul:', datos.puntos[0][0], '->', datos.puntos[datos.puntos.length - 1][0]);


fs.writeFileSync(S + '/curva821.json', JSON.stringify({ cols, fils, puntos: datos.puntos }));
await b.close();
