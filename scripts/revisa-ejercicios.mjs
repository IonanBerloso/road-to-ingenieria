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
import { leeMagnitud } from '../src/lib/unidades.ts';

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

      /* Y llevar unidad no basta: tiene que ser una unidad que el lector de
         `lib/unidades.ts` sepa leer. El 4 de septiembre de 2026 se escribió
         «63 mcl» —metros de columna de líquido, que es como lo dice el
         enunciado— y este guion dio verde: la comprobación de arriba solo
         mira que haya letras. Lo cazó el esquema, un build entero después.
         Aquí se pasa la misma función que usa el componente. */
      if (p.respuesta?.tipo === 'magnitud') {
        for (const v of [p.respuesta.valor, ...(p.distractores ?? []).map((d) => d.valor)]) {
          if (v != null && !leeMagnitud(String(v))) {
            mal(dónde, `unidad que el lector no sabe leer: «${v}»`);
          }
        }
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

/* ── §07 · que las fórmulas se DIBUJEN, no solo que estén equilibradas ──
   El recuento de `$` de arriba caza una fórmula sin cerrar, y no caza nada
   más. El 2 de septiembre de 2026 cinco ejercicios pasaron este guion con
   todo en verde y tumbaron el suelo entero —doce minutos— por 27 fórmulas
   publicadas como texto crudo: estaban escritas como `$$ x =` en una línea
   y `= y $$` en la siguiente, y **el procesador de §07 solo dibuja la forma
   con la valla `$$` en línea propia**. El corpus entero la usaba así; yo no.

   Como el motivo es exactamente el mismo que el del guion —enterarse antes
   de construir— la comprobación va aquí: se pasa cada campo de prosa por el
   procesador de verdad y se mira si KaTeX ha devuelto un error. Tarda un
   segundo y cubre cualquier fórmula rota, no solo esta forma. */
const camposDeProsa = (e) => {
  const salida = [['enunciado', e.enunciado], ['resolucion', e.resolucion]];
  for (const [i, p] of (e.pasos ?? []).entries()) {
    for (const c of ['pregunta', 'pista', 'desarrollo', 'titulo']) {
      if (typeof p?.[c] === 'string') salida.push([`paso ${i + 1} · ${c}`, p[c]]);
    }
    /* Los `mensaje` van también, y no es un detalle: el fallo que obligó a
       escribir la comprobación del LaTeX crudo vivía en el `mensaje` de una
       pieza trampa, y la primera versión de esta función solo miraba los
       `texto`. Un guardián que no mira donde está el fallo no es un
       guardián. */
    for (const o of p?.opciones ?? []) {
      if (o?.texto) salida.push([`paso ${i + 1} · opción`, o.texto]);
      if (o?.mensaje) salida.push([`paso ${i + 1} · diagnóstico de opción`, o.mensaje]);
    }
    for (const d of p?.distractores ?? []) {
      if (d?.mensaje) salida.push([`paso ${i + 1} · distractor`, d.mensaje]);
    }
    for (const z of p?.piezas ?? []) {
      if (z?.texto) salida.push([`paso ${i + 1} · pieza`, z.texto]);
      if (z?.mensaje) salida.push([`paso ${i + 1} · mensaje de la trampa`, z.mensaje]);
    }
  }
  return salida.filter(([, t]) => typeof t === 'string' && t.includes('$'));
};

try {
  const { mate } = await import('../src/lib/markdown.mjs');
  /* KaTeX corre en modo `strict: 'warn'` y sus quejas salen por `console.warn`.
     Se recogen aquí en vez de leerlas en la consola: son avisos de verdad, no
     ruido, y así se pueden atribuir al campo exacto que los produjo. */
  const avisos = [];
  const warnOriginal = console.warn;
  console.warn = (...a) => {
    const t = a.join(' ');
    if (t.includes('unicodeTextInMathMode')) avisos.push(t);
    else warnOriginal(...a);
  };
  for (const e of ejercicios) {
    for (const [dónde, texto] of camposDeProsa(e)) {
      /* Y el cuarto hermano, que es el más silencioso de todos: un carácter
         de control donde debía ir una barra invertida. `\text{max}` escrito a
         través del shell llega como TAB + «ext{max}» —el `\t` se come a sí
         mismo—, y entonces **todo funciona**: es LaTeX válido, KaTeX no
         protesta, no queda ningún `$` suelto, y lo que se publica es
         `J₁,ₑₓₜ{ₘₐₓ}` con las llaves a la vista. Al leer el fichero tampoco
         se ve, porque un tabulador parece sangría.

         Encontrado el 5 de septiembre de 2026 en tres sitios del mismo
         ejercicio de conducciones, publicados y con los cuatro guardianes en
         verde. Es exactamente lo que §17 avisa para `\f`, con otra letra: por
         eso se miran todas las que un `\x` mal escapado puede producir. */
      const control = /[\t\f\v\b\0]/.exec(texto);
      if (control) {
        const cual = { '\t': '\\t', '\f': '\\f', '\v': '\\v', '\b': '\\b', '\0': '\\0' }[control[0]];
        const ventana = texto
          .slice(Math.max(0, control.index - 40), control.index + 40)
          .replace(/[\t\f\v\b\0]/g, '⟦aquí⟧')
          .replace(/\s+/g, ' ');
        mal(
          e.id ?? '(sin id)',
          `${dónde}: hay un carácter de control (${cual}) donde debía ir una barra — ` +
            `…${ventana.trim()}… (§17: el LaTeX no se escribe por el shell)`,
        );
        continue;
      }

      const html = await mate(texto, 'revision');
      if (html.includes('katex-error')) {
        const motivo = /title="ParseError: ([^"]{0,110})/.exec(html)?.[1] ?? 'KaTeX no ha sabido dibujarla';
        mal(e.id ?? '(sin id)', `${dónde}: fórmula que no se dibuja — ${motivo}`);
        continue;
      }
      /* Y el fallo hermano, que NO produce error de KaTeX porque el LaTeX no
         llega a KaTeX: una fórmula partida entre dos líneas cuya continuación
         empieza por `-`, `*` o `+` abre una lista de Markdown, el párrafo se
         cierra y los `$` se publican como texto. Se detecta igual que en
         `verify.mjs`: si queda un `$` en el texto visible, algo no se dibujó.
         Añadido el 3 de septiembre de 2026, después de que esta misma trampa
         tumbara el suelo dos veces en la misma semana (§17). */
      const visible = html
        .replace(/<math[\s\S]*?<\/math>/g, '')
        .replace(/<[^>]+>/g, ' ');
      const suelto = /.{0,40}\$.{0,40}/.exec(visible)?.[0];
      if (suelto) {
        mal(
          e.id ?? '(sin id)',
          `${dónde}: LaTeX publicado como texto — …${suelto.replace(/\s+/g, ' ').trim()}…`,
        );
      }
      /* Y el tercer hermano: una tilde dentro del modo matemático. KaTeX la
         dibuja —no hay error, no hay `$` suelto— pero avisa por consola con
         `unicodeTextInMathMode` en cada build, y el aviso tapa a los que sí
         importan. El 4 de septiembre de 2026 había 22 repartidos por nueve
         ficheros: `P_{útil}`, `k_{válv}`, `\rho_{hormigón}`. El arreglo es
         `\text{}`, que además es la tipografía correcta para un subíndice que
         es una palabra.
         Se caza **escuchando a KaTeX**, no adivinando dónde empieza y acaba
         una fórmula con una expresión regular: emparejar `$` a ojo daba 34
         falsos positivos sobre el corpus entero, todos de prosa atrapada
         entre dos fórmulas distintas de la misma línea. */
      for (const aviso of avisos) {
        const trozo = /character "(.)"/.exec(aviso)?.[1] ?? '';
        mal(e.id ?? '(sin id)', `${dónde}: «${trozo}» dentro de $…$ — sácalo con \\text{…} o KaTeX avisará en cada build`);
      }
      avisos.length = 0;
    }
  }
  console.warn = warnOriginal;
} catch (err) {
  /* Que no se pueda cargar el procesador no puede tumbar la revisión del
     resto: se dice y se sigue, porque el suelo lo volverá a mirar. */
  console.log(`  · no se ha podido dibujar las fórmulas aquí: ${String(err).split('\n')[0]}`);
}

console.log(
  fallos === 0
    ? `  ✓ ${ejercicios.length} ejercicio(s), sin fallos`
    : `\n  ${fallos} fallo(s) en ${ejercicios.length} ejercicio(s)`,
);
process.exit(fallos ? 1 : 0);
