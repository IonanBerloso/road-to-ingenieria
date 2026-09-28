/**
 * Diez diagnósticos al azar para que los revise quien no los escribió (fase E5
 * de la auditoría del 27 de septiembre de 2026).
 *
 * La prueba de utilidad de §13:
 *   · Para quién: quien mantiene el proyecto.
 *   · Cuándo: una vez por sesión, y el resultado se apunta en el diario.
 *   · Qué gana: los tests de `tests/verificacion/` recalculan las respuestas,
 *     pero nadie mira los mensajes: un distractor que diagnostica un error que
 *     no produce ese número, o una pieza trampa que no es falsa, pasan todos
 *     los guardianes en verde y enseñan algo equivocado a quien se equivoca,
 *     que es justo quien más lo va a leer.
 *   · Cómo se comprueba: la muestra es reproducible —sale de la fecha, o de la
 *     semilla que se le pase—, así que quien revise y quien corrija miran los
 *     mismos diez.
 *
 *   node scripts/muestra-distractores.mjs [semilla] [cuántos]
 *
 * Saca de tres montones a la vez: los mensajes de los distractores de un
 * `calcular`, los de las opciones equivocadas de un `reconocer` y los de las
 * piezas trampa de un `justificar`. Cada uno sale con lo que hace falta para
 * juzgarlo: la pregunta, la respuesta buena y el valor o la opción que el
 * mensaje explica.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const RAIZ = join(fileURLToPath(import.meta.url), '..', '..');
const CONTENIDO = join(RAIZ, 'src', 'content');
const [semilla = new Date().toISOString().slice(0, 10), cuantosTxt = '10'] = process.argv.slice(2);
const CUANTOS = Number(cuantosTxt);

/* Un generador con semilla, para que la muestra de un día sea la misma para
   todo el que la saque ese día (mulberry32 sobre un hash de la cadena). */
function generador(texto) {
  let h = 1779033703 ^ texto.length;
  for (let i = 0; i < texto.length; i++) {
    h = Math.imul(h ^ texto.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function* ficheros(dir) {
  for (const n of readdirSync(dir)) {
    const r = join(dir, n);
    if (statSync(r).isDirectory()) yield* ficheros(r);
    else if (n === 'ejercicios.yaml') yield r;
  }
}

const plano = (t) => String(t ?? '').replace(/\s+/g, ' ').trim();
const montón = [];
for (const f of ficheros(CONTENIDO)) {
  const doc = yaml.load(readFileSync(f, 'utf8'));
  for (const e of doc?.ejercicios ?? []) {
    for (const [i, p] of (e.pasos ?? []).entries()) {
      const donde = { fichero: relative(RAIZ, f).replace(/\\/g, '/'), id: e.id, titulo: e.titulo, paso: i + 1 };
      if (p.tipo === 'calcular') {
        for (const d of p.distractores ?? []) {
          montón.push({
            ...donde,
            clase: 'distractor',
            pregunta: plano(p.pregunta ?? p.titulo),
            buena: plano(p.respuesta?.valor),
            explicado: plano(d.valor),
            mensaje: plano(d.mensaje),
          });
        }
      }
      if (p.tipo === 'reconocer') {
        const buena = (p.opciones ?? []).find((o) => o.correcta);
        for (const o of (p.opciones ?? []).filter((x) => !x.correcta)) {
          montón.push({
            ...donde,
            clase: 'opción equivocada',
            pregunta: plano(p.pregunta),
            buena: plano(buena?.texto),
            explicado: plano(o.texto),
            mensaje: plano(o.mensaje),
          });
        }
      }
      if (p.tipo === 'justificar') {
        for (const z of (p.piezas ?? []).filter((x) => x.trampa)) {
          montón.push({
            ...donde,
            clase: 'pieza trampa',
            pregunta: plano(p.pregunta),
            buena: '(la demostración ordenada, sin esta pieza)',
            explicado: plano(z.texto),
            mensaje: plano(z.mensaje),
          });
        }
      }
    }
  }
}

const azar = generador(semilla);
const elegidos = new Set();
while (elegidos.size < Math.min(CUANTOS, montón.length)) elegidos.add(Math.floor(azar() * montón.length));

console.log(`# Diez diagnósticos para revisar · semilla ${semilla}`);
console.log(`\nDe ${montón.length} mensajes en el corpus. Para cada uno: ¿el error que describe`);
console.log('produce de verdad ese valor (o esa opción, o esa pieza)? ¿Lo explica bien y sin');
console.log('destripar lo que viene después? Lo que esté mal se corrige y se apunta en el diario.\n');
[...elegidos].forEach((k, n) => {
  const x = montón[k];
  console.log(`## ${n + 1} · ${x.clase} · ${x.id}, paso ${x.paso}`);
  console.log(`- fichero: ${x.fichero}`);
  console.log(`- ejercicio: ${x.titulo}`);
  console.log(`- pregunta: ${x.pregunta}`);
  console.log(`- respuesta buena: ${x.buena}`);
  console.log(`- lo que el mensaje explica: ${x.explicado}`);
  console.log(`- mensaje: ${x.mensaje}\n`);
});
