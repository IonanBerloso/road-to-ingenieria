/**
 * Las figuras del tema 11 de Cálculo: series de Fourier.
 *
 * Tres gráficas periódicas. Lo que hay que ver en las tres es la diferencia
 * entre la función y su serie: dónde coinciden, dónde la serie vale la media
 * del salto y dónde la función directamente no existe.
 *
 *     node scripts/figuras/calculo-t11.mjs
 */

import { lienzo } from './lienzo.mjs';
import { pega } from './pegar.mjs';

export const FICHERO = 'src/content/calculo/t11-fourier/ejercicios.yaml';
const P = Math.PI;

export const figuras = [];
const fig = (id, paso, hacer) => figuras.push({ id, paso, hacer });


/* ── 1 · la serie de f(t) = t ────────────────────────────────────────── */
fig('serie-de-f-igual-t', 0, () => {
  const l = lienzo({
    id: 'f-fourier-diente',
    ancho: 380, alto: 210,
    x: [-3.6 * P, 3.6 * P], y: [-4.3, 4.3],
    titulo: 'El diente de sierra de f(t)=t, con la serie valiendo cero en cada salto',
    desc: 'Tres periodos de rampas de pendiente uno que suben de menos pi a pi y caen de golpe '
      + 'en los múltiplos impares de pi. Cada salto mide dos pi. En la mitad de cada salto hay un '
      + 'punto a altura cero: es lo que vale la serie allí. La gráfica es simétrica respecto del '
      + 'origen, o sea impar.',
  });
  l.ejes({
    nombreX: 't', nombreY: 'f',
    marcasX: [[-3 * P, '−3π'], [-P, '−π'], [P, 'π'], [3 * P, '3π']],
    marcasY: [[P, 'π'], [-P, '−π']],
  });
  for (const c of [-2, 0, 2]) {
    l.poli([[c * P - P + 0.02, -P + 0.02], [c * P + P - 0.02, P - 0.02]], { clase: 'c' });
  }
  for (const k of [-3, -1, 1, 3]) {
    l.poli([[k * P, -P], [k * P, P]], { clase: 'g' });
    l.punto(k * P, 0, { clase: 'o', r: 4.2 });
  }
  l.rotulo(2 * P, 0, 'salto 2π', { dx: -4, dy: -8, anclaje: 'end', color: 'var(--faint)', pequeno: true });
  l.esquina(28, 20, 'S = 0 en cada salto', { color: 'var(--flag)' });
  return l.svg();
});

/* ── 2 · la extensión par ────────────────────────────────────────────── */
fig('extension-par-de-t', 0, () => {
  const l = lienzo({
    id: 'f-fourier-triangulo',
    ancho: 380, alto: 200,
    x: [-2.4 * P, 2.4 * P], y: [-0.8, 4.2],
    titulo: 'La onda triangular de la extensión par, continua y con esquinas',
    desc: 'Una onda triangular, no un diente de sierra: sube y baja en líneas rectas. Los valles '
      + 'están a altura cero en cero y en más y menos dos pi, y los picos a altura pi en más y '
      + 'menos pi. Es simétrica respecto del eje vertical y no tiene ningún salto: solo esquinas.',
  });
  l.ejes({
    nombreX: 't', nombreY: 'f',
    marcasX: [[-2 * P, '−2π'], [-P, '−π'], [P, 'π'], [2 * P, '2π']],
    marcasY: [[P, 'π']],
  });
  l.poli([
    [-2.35 * P, 0.35 * P], [-2 * P, 0], [-P, P], [0, 0], [P, P], [2 * P, 0], [2.35 * P, 0.35 * P],
  ], { clase: 'c' });
  for (const t of [-2 * P, 0, 2 * P]) l.punto(t, 0, { r: 3.8 });
  for (const t of [-P, P]) l.punto(t, P, { clase: 'o', r: 4.2 });
  l.rotulo(P, P, 'pico π', { dx: 8, dy: -4, color: 'var(--flag)' });
  l.rotulo(0, 0, 'valle', { dx: 7, dy: 14, color: 'var(--live)' });
  l.esquina(28, 20, 'continua, con esquinas');
  return l.svg();
});

/* ── 3 · donde la función ni existe ──────────────────────────────────── */
fig('cuando-la-funcion-ni-existe', 0, () => {
  const l = lienzo({
    id: 'f-fourier-hueco',
    ancho: 380, alto: 215,
    x: [-3.6 * P, 3.6 * P], y: [-4.5, 4.5],
    titulo: 'Las rampas que bajan, con hueco donde f no existe y punto lleno donde sí está S',
    desc: 'Tres periodos de rampas de pendiente menos uno, que bajan de pi a menos pi. En los '
      + 'múltiplos impares de pi la función no está definida y se marca con círculo hueco en los '
      + 'dos extremos de cada rampa; en esos mismos puntos, un punto lleno a altura cero indica '
      + 'lo que vale la serie. En cero, un único punto: allí las dos coinciden y valen cero.',
  });
  l.ejes({
    nombreX: 't', nombreY: 'f',
    marcasX: [[-3 * P, '−3π'], [-P, '−π'], [P, 'π'], [3 * P, '3π']],
    marcasY: [[P, 'π'], [-P, '−π']],
  });
  for (const c of [-2, 0, 2]) {
    l.poli([[c * P - P + 0.03, P - 0.03], [c * P + P - 0.03, -P + 0.03]], { clase: 'c' });
  }
  for (const k of [-3, -1, 1, 3]) {
    for (const s of [1, -1]) {
      l.crudo(`<circle class="f-fourier-hueco-hueco" cx="${Math.round(l.X(k * P) * 10) / 10}" cy="${Math.round(l.Y(s * P) * 10) / 10}" r="3.8"/>`);
    }
    l.punto(k * P, 0, { clase: 'o', r: 4.2 });
  }
  l.punto(0, 0, { r: 4.2 });
  l.rotulo(0, 0, 'f = S = 0', { dx: 8, dy: 15 });
  l.esquina(28, 20, 'hueco: f no existe · lleno: S', { color: 'var(--flag)' });

  return l.svg();
});

/* ── a pegar ─────────────────────────────────────────────────────────── */
for (const f of figuras) f.svg = f.hacer();

if (process.argv[1]?.endsWith('calculo-t11.mjs')) {
  for (const f of figuras) pega(FICHERO, f.id, f.svg, f.paso);
  console.log(`${figuras.length} figuras pegadas en ${FICHERO}`);
}
