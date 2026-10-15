// El marcador del campeonato de predicción de la 1.ª evaluación de Cálculo.
//
// Fijado el 15 de octubre de 2026, ANTES de que ningún concursante predijera.
// Lo que puntúa, y por qué:
//
// - Cada concursante da, para cada rasgo de la lista cerrada, la probabilidad
//   p de que el examen lo tenga. El resultado o vale 1 si lo tiene y 0 si no.
// - BRIER = media de (p − o)² sobre todos los rasgos. Menos es mejor: 0 es
//   acertarlo todo con certeza, 0,25 es decir 0,5 a todo. Premia acertar y
//   también saber cuánto no se sabe: decir 0,95 y fallar cuesta mucho más que
//   decir 0,6 y fallar.
// - HABILIDAD = 1 − Brier / Brier del guion de frecuencias. Positiva: ese
//   concursante aporta algo sobre contar lo que ya cayó. Negativa: no.
// - ACIERTOS, para leer: de los rasgos a los que dio p ≥ 0,5, cuántos
//   salieron (precisión), y de los que salieron, a cuántos había dado
//   p ≥ 0,5 (cobertura).
//
// Los dos guiones de referencia se calculan aquí, con la misma historia que
// veían los concursantes:
// - «frecuencia»: (veces que salió + 1) / (exámenes vistos + 2), Laplace.
// - «el-de-ayer»: 0,85 si salió el año anterior, 0,15 si no.
//
// Qué rasgos cuentan en cada ronda (15 de octubre de 2026, antes de la
// primera predicción, tras ver que la lista se cerró mirando todos los
// exámenes): los que ya habían salido en alguna 1.ª evaluación anterior, más
// los que no han salido nunca en ninguna. Un rasgo que nace en el examen que
// se predice no cuenta: su sola presencia en la lista sería una pista, y el
// lunes lo nuevo tampoco estará en la lista.
//
// uso: node puntua.mjs <verdad.json> <predicciones.json> [salida.json]
//   verdad.json: { "<carpeta del examen>": ["rasgo", …], … } y la lista en "lista"
//   predicciones.json: [{ ronda, concursante, fase, probabilidades: [{rasgo, p}] }]
import { readFileSync, writeFileSync } from 'node:fs';

const [fVerdad, fPred, fSalida] = process.argv.slice(2);
const V = JSON.parse(readFileSync(fVerdad, 'utf8'));
const ids = V.lista.map((r) => r.id);
const verdad = V.verdad; // carpeta -> [rasgos]
const preds = JSON.parse(readFileSync(fPred, 'utf8'));

const carpetaDe = (curso) => `${curso}-1ev`;
const cursosAntes = (curso) => Object.keys(verdad).filter((c) => c < carpetaDe(curso)).sort();
const idsDe = (curso) => ids.filter((r) => {
  const salio = Object.keys(verdad).filter((c) => verdad[c].includes(r));
  return salio.length === 0 || salio.some((c) => c < carpetaDe(curso));
});

function referencias(curso) {
  const antes = cursosAntes(curso);
  const ultimo = antes.at(-1);
  const freq = {}, ayer = {};
  for (const r of idsDe(curso)) {
    const k = antes.filter((c) => verdad[c].includes(r)).length;
    freq[r] = (k + 1) / (antes.length + 2);
    ayer[r] = ultimo && verdad[ultimo].includes(r) ? 0.85 : 0.15;
  }
  return { frecuencia: freq, 'el-de-ayer': ayer };
}

function mide(probs, curso) {
  const o = new Set(verdad[carpetaDe(curso)]);
  let brier = 0, dichos = 0, dichosBien = 0, salieron = 0, salieronDichos = 0;
  const cuentan = idsDe(curso);
  for (const r of cuentan) {
    const p = Math.min(1, Math.max(0, probs[r] ?? 0.5));
    const y = o.has(r) ? 1 : 0;
    brier += (p - y) ** 2;
    if (p >= 0.5) { dichos++; if (y) dichosBien++; }
    if (y) { salieron++; if (p >= 0.5) salieronDichos++; }
  }
  return {
    brier: brier / cuentan.length,
    rasgos: cuentan.length,
    precision: dichos ? dichosBien / dichos : null,
    cobertura: salieron ? salieronDichos / salieron : null,
  };
}

const filas = [];
const rondas = [...new Set(preds.map((p) => p.ronda))].filter((c) => verdad[carpetaDe(c)]).sort();
for (const curso of rondas) {
  const ref = referencias(curso);
  const base = mide(ref.frecuencia, curso).brier;
  for (const [nombre, probs] of Object.entries(ref)) filas.push({ ronda: curso, concursante: nombre, fase: 'guion', ...mide(probs, curso), habilidad: 1 - mide(probs, curso).brier / base });
  for (const p of preds.filter((x) => x.ronda === curso)) {
    const probs = Object.fromEntries(p.probabilidades.map((x) => [x.rasgo, x.p]));
    const faltan = idsDe(curso).filter((r) => !(r in probs)).length;
    const m = mide(probs, curso);
    filas.push({ ronda: curso, concursante: p.concursante, fase: p.fase, ...m, habilidad: 1 - m.brier / base, faltan });
  }
}

// Clasificación: media de las rondas jugadas, por concursante y fase.
const tabla = {};
for (const f of filas) {
  const k = `${f.concursante}|${f.fase}`;
  (tabla[k] ??= { concursante: f.concursante, fase: f.fase, rondas: 0, brier: 0, habilidad: 0 });
  tabla[k].rondas++; tabla[k].brier += f.brier; tabla[k].habilidad += f.habilidad;
}
const clasif = Object.values(tabla)
  .map((t) => ({ ...t, brier: t.brier / t.rondas, habilidad: t.habilidad / t.rondas }))
  .sort((a, b) => a.brier - b.brier);

const pct = (x) => (x == null ? '  —  ' : `${(100 * x).toFixed(0).padStart(3)} %`);
console.log('ronda       concursante              fase        Brier  habilidad  precisión cobertura');
for (const f of filas) console.log(`${f.ronda}  ${f.concursante.padEnd(24)} ${f.fase.padEnd(10)} ${f.brier.toFixed(3)}  ${(f.habilidad >= 0 ? '+' : '') + f.habilidad.toFixed(2)}      ${pct(f.precision)}    ${pct(f.cobertura)}${f.faltan ? `  (faltan ${f.faltan})` : ''}`);
console.log('\nCLASIFICACIÓN (media de las rondas)');
clasif.forEach((t, i) => console.log(`${String(i + 1).padStart(2)}. ${t.concursante.padEnd(24)} ${t.fase.padEnd(10)} Brier ${t.brier.toFixed(3)}  habilidad ${(t.habilidad >= 0 ? '+' : '') + t.habilidad.toFixed(2)}  (${t.rondas} rondas)`));
if (fSalida) writeFileSync(fSalida, JSON.stringify({ filas, clasificacion: clasif }, null, 1));
