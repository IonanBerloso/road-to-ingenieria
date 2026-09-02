/**
 * Revisa un bloque de ejercicios ANTES de meterlo en el corpus.
 *
 * Nace el 2 de septiembre de 2026, al empezar los 145 problemas que faltaban
 * de la colección de Fluidos, y por un motivo medido: el primer bloque de
 * cuatro se pegó al fichero sin validar, rompió el YAML por un `: ` sin
 * comillas (§17) y hubo que revertir. Con 145 por delante, el ciclo
 * «pegar → construir → fallar → revertir» cuesta más que el guion.
 *
 * No sustituye al esquema de `content.config.ts`, que sigue siendo la
 * autoridad: comprueba lo mismo **antes**, en un segundo y sin construir el
 * sitio. Si los dos discrepan, manda el esquema y este guion está mal.
 *
 *   node scripts/revisa-ejercicios.mjs <fichero.yaml> [--suelto]
 *
 * `--suelto` es para un trozo que todavía no lleva la cabecera `ejercicios:`.
 */
import { readFileSync } from 'node:fs';
import yaml from 'js-yaml';

const [ruta, ...banderas] = process.argv.slice(2);
const suelto = banderas.includes('--suelto');

if (!ruta) {
  console.error('uso: node scripts/revisa-ejercicios.mjs <fichero.yaml> [--suelto]');
  process.exit(2);
}

let fallos = 0;
const mal = (id, texto) => {
  console.log(`  ✗ ${id}: ${texto}`);
  fallos++;
};

let doc;
try {
  const crudo = readFileSync(ruta, 'utf8');
  doc = yaml.load(suelto ? `ejercicios:\n${crudo}` : crudo);
} catch (e) {
  console.log(`  ✗ el YAML no se puede leer: ${String(e).split('\n')[0]}`);
  console.log(String(e).split('\n').slice(1, 6).join('\n'));
  process.exit(1);
}

const ejercicios = doc?.ejercicios ?? [];
if (!ejercicios.length) {
  console.log('  ✗ no hay ejercicios en el fichero');
  process.exit(1);
}

for (const e of ejercicios) {
  const id = e.id ?? '(sin id)';

  /* ── lo que pide §04, y los mínimos que se olvidan ── */
  /* La regla es la del esquema y solo esa: minúsculas, sin acentos, guiones.
     Escribí aquí un patrón más estricto —`ej…-slug`— y marcó 138 ejercicios
     de Cálculo que están perfectos: allí el `ej-` se pone al pintar, no en el
     dato. Cuando este guion y `content.config.ts` discrepen, manda el
     esquema. */
  if (!/^[a-z0-9-]+$/.test(id)) mal(id, 'el id tiene que ir en minúscula, sin acentos y con guiones');
  if ((e.titulo ?? '').length < 5) mal(id, '`titulo` con menos de 5 caracteres');
  if ((e.fuente ?? '').length < 10) mal(id, '`fuente` con menos de 10 caracteres');
  if ((e.enunciado ?? '').length < 10) mal(id, '`enunciado` con menos de 10 caracteres');
  if ((e.resolucion ?? '').length < 100) mal(id, '`resolucion` con menos de 100 caracteres');
  if (!e.pide) mal(id, 'falta `pide`');
  if (!['ejemplo', 'practica', 'examen'].includes(e.nivel)) mal(id, `nivel raro: ${e.nivel}`);

  const pasos = e.pasos ?? [];
  if (pasos.length < 2) mal(id, 'menos de dos pasos');

  const tipos = pasos.map((p) => p.tipo);
  if (!tipos.includes('reconocer')) mal(id, 'sin paso `reconocer` (COMP1)');
  if (!tipos.some((t) => t === 'calcular' || t === 'verificar')) {
    mal(id, 'sin paso `calcular` ni `verificar` (COMP2)');
  }
  if (!tipos.includes('justificar')) mal(id, 'sin paso `justificar` (COMP4)');

  for (const [i, p] of pasos.entries()) {
    const dónde = `${id}, paso ${i + 1} (${p.tipo})`;

    if (p.tipo === 'reconocer') {
      const op = p.opciones ?? [];
      if (op.length < 3) mal(dónde, `solo ${op.length} opciones, hacen falta 3`);
      const buenas = op.filter((o) => o.correcta).length;
      if (buenas !== 1) mal(dónde, `${buenas} opciones marcadas correctas, tiene que haber 1`);
      for (const o of op) {
        if ((o.mensaje ?? '').length < 20) mal(dónde, `una opción con mensaje de menos de 20`);
      }
    }

    if (p.tipo === 'calcular') {
      if (!p.respuesta) mal(dónde, 'sin `respuesta`');
      if (!(p.distractores ?? []).length) mal(dónde, 'sin ningún distractor');
      for (const d of p.distractores ?? []) {
        if ((d.mensaje ?? '').length < 30) {
          mal(dónde, `distractor «${d.valor}» con mensaje de menos de 30: es un «incorrecto» disfrazado`);
        }
      }
      /* §17 · una `magnitud` sin unidad es un `numero` con adorno */
      if (p.respuesta?.tipo === 'magnitud' && !/[a-zA-Z°%]/.test(String(p.respuesta.valor))) {
        mal(dónde, `magnitud sin unidad: «${p.respuesta.valor}»`);
      }

      /* Un distractor dentro de la tolerancia se daría por bueno, y entonces
         el alumno recibe un «bien» por el razonamiento equivocado. Lo caza el
         esquema, pero se tarda un build entero en enterarse; aquí, un
         segundo. Escribí dos así en el primer bloque de cuatro. */
      /* Solo tiene sentido en escalares. Un vector como `(2/3, 1/3, 2/3)` o
         una forma exacta como `sqrt(3)/2` no se comparan por su primera
         cifra, y compararlos así marcaba en falso 87 ejercicios de Álgebra y
         Cálculo que están bien: ahí la comparación es estructural y la hace
         el lector de respuestas, no una resta. */
      const escalar = (v) => {
        const s = String(v).trim();
        if (/[(,]/.test(s)) return NaN;
        const m = s.match(/^-?\d+(\.\d+)?([eE][-+]?\d+)?/);
        return m ? Number(m[0]) : NaN;
      };
      const comparable = p.respuesta?.tipo === 'numero' || p.respuesta?.tipo === 'magnitud';
      const bueno = comparable ? escalar(p.respuesta?.valor) : NaN;
      const tol = p.respuesta?.tolerancia;
      const relativa = p.respuesta?.tipo === 'magnitud';

      /* Y dos distractores parecidos ENTRE SÍ tampoco valen, aunque los dos
         estén lejos de la respuesta buena: el componente busca el primero que
         encaje, así que el segundo nunca se dispara y su mensaje es letra
         muerta. Lo caza el esquema y a mí se me escapó con «531» y «5308»
         frente a una respuesta de 5,3 millones con tolerancia 20 000: a esa
         escala los dos distractores son el mismo número.
         La holgura se replica tal como la calcula el esquema. */
      if (comparable && typeof tol === 'number') {
        const vs = (p.distractores ?? []).map((d) => escalar(d.valor));
        for (let i = 0; i < vs.length; i++) {
          for (let j = i + 1; j < vs.length; j++) {
            if (!Number.isFinite(vs[i]) || !Number.isFinite(vs[j])) continue;
            const holgura = relativa
              ? Math.max(Math.abs(vs[j]), Math.abs(vs[i])) * Math.max(tol, 0.02)
              : Math.max(Math.max(Math.abs(vs[i]), Math.abs(vs[j])) * 0.02, tol);
            if (Math.abs(vs[i] - vs[j]) <= holgura * (1 + 1e-9)) {
              mal(
                dónde,
                `los distractores «${p.distractores[i].valor}» y «${p.distractores[j].valor}» se confunden entre sí: el segundo nunca mostraría su diagnóstico`,
              );
            }
          }
        }
      }

      if (Number.isFinite(bueno) && typeof tol === 'number') {
        for (const d of p.distractores ?? []) {
          const malo = escalar(d.valor);
          if (!Number.isFinite(malo)) continue;
          /* Relativa en `magnitud` y absoluta en `numero`, que es lo que hace
             el esquema —`comparaMagnitud` frente a `comparaComplejo`— y lo que
             hace el componente al reconocer un distractor (§17).
             Probé a usar la más ancha de las dos «por prudencia» y salieron
             once falsos positivos: con respuestas del orden de 0,004 Pl, una
             tolerancia absoluta de 0,01 se traga cualquier distractor.
             El margen de 10⁻⁹ es por los casos justo en el filo: el primero
             que se me escapó fallaba en el decimoséptimo decimal. */
          const holgura = (relativa ? Math.abs(bueno) * tol : tol) * (1 + 1e-9);
          if (Math.abs(malo - bueno) <= holgura) {
            mal(
              dónde,
              `el distractor «${d.valor}» cae dentro de la tolerancia de «${p.respuesta.valor}»: se daría por bueno`,
            );
          }
        }
      }
    }

    if (p.tipo === 'justificar') {
      const trampas = (p.piezas ?? []).filter((z) => z.trampa);
      if (trampas.length !== 1) mal(dónde, `${trampas.length} piezas trampa, tiene que haber 1`);
      for (const t of trampas) {
        if ((t.mensaje ?? '').length < 20) mal(dónde, 'la pieza trampa no explica por qué lo es');
      }
    }
  }

  /* ── §17 · LaTeX que se va a publicar como texto ── */
  const textos = JSON.stringify(e);
  const dolares = (textos.match(/\$/g) ?? []).length;
  if (dolares % 2 !== 0) mal(id, `número impar de $ (${dolares}): hay una fórmula sin cerrar`);
  if (/titulo["']?:\s*["'][^"']*\$/.test(textos)) mal(id, '`titulo` con LaTeX: tiene que ser texto plano');
  /* El € solo estorba DENTRO de una fórmula: KaTeX no lo tiene en sus fuentes
     (§17). En la prosa de al lado es correcto y es la solución recomendada,
     así que buscarlo en todo el ejercicio marcaba en falso los dos de bombeo
     que ya lo habían arreglado bien. */
  for (const trozo of (textos.match(/\$[^$]*\$/g) ?? [])) {
    if (/€/.test(trozo)) mal(id, `un € dentro de una fórmula: ${trozo.slice(0, 40)}`);
  }
}

console.log(
  fallos === 0
    ? `  ✓ ${ejercicios.length} ejercicio(s), sin fallos`
    : `\n  ${fallos} fallo(s) en ${ejercicios.length} ejercicio(s)`,
);
process.exit(fallos ? 1 : 0);
