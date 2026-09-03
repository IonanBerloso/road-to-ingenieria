#!/usr/bin/env node
/**
 * verify.mjs — el suelo de calidad (CLAUDE.md §11).
 *
 * Corre en CI y bloquea el despliegue. Sale con código distinto de cero si
 * algo falla. No arregla nada: avisa. Arreglarlo automáticamente sería
 * exactamente el script de rediseño masivo que la Regla 0 prohíbe.
 *
 *   node scripts/verify.mjs          comprueba src/ y dist/
 *   node scripts/verify.mjs --solo-fuente   solo src/, sin necesidad de build
 *
 * Qué NO comprueba, y hay que saberlo:
 *   · el foco visible se comprueba de forma indirecta (que nadie apague el
 *     outline sin poner otra cosa), no midiendo píxeles en un navegador;
 *   · los 360 px se comprueban buscando anchos fijos, no renderizando.
 * Las dos cosas piden un navegador de verdad; cuando haya tests de interfaz,
 * se mueven allí.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, extname, dirname, posix, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');
const DIST = join(ROOT, 'dist');
/* La URL del sitio se declara UNA vez, en astro.config.mjs. Repetirla aquí
 * sería el mismo error de siempre: dos fuentes de verdad que se separan el día
 * que se renombra el repositorio. */
const { default: astroConfig } = await import('../astro.config.mjs');
const BASE = astroConfig.base.replace(/\/$/, '');
const ORIGEN = astroConfig.site.replace(/\/$/, '');
const SOLO_FUENTE = process.argv.includes('--solo-fuente');

/* Los prototipos de referencia/ están fuera a propósito: son material de
   partida, llevan su CSS inline y no se publican. */
const IGNORA = new Set(['node_modules', 'dist', '.astro', '.git', 'referencia']);

let fallos = 0;
let avisos = 0;

const fallo = (regla, detalle) => {
  console.error(`  ✗ ${regla}\n    ${detalle}`);
  fallos++;
};
const aviso = (regla, detalle) => {
  console.warn(`  · ${regla}\n    ${detalle}`);
  avisos++;
};
const ok = (texto) => console.log(`  ✓ ${texto}`);

function* archivos(dir, exts) {
  if (!existsSync(dir)) return;
  for (const nombre of readdirSync(dir)) {
    if (IGNORA.has(nombre)) continue;
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) yield* archivos(ruta, exts);
    else if (exts.includes(extname(ruta))) yield ruta;
  }
}

const leer = (f) => readFileSync(f, 'utf8');
/** Siempre con barras `/`: en Windows `relative` devuelve `\` y entonces
 *  las comparaciones de ruta de abajo no coinciden nunca. */
const rel = (f) => relative(ROOT, f).split(sep).join('/');

/** Quita comentarios: una regla no es lo mismo que hablar de una regla.
 *  Sin esto, escribir «:root{}» en un comentario cuenta como declararlo. */
const sinComentarios = (texto) =>
  texto.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

/* ═══════════════════════════════════════════════════════════════════
   1 · Un solo :root{} en todo el repositorio
   ═══════════════════════════════════════════════════════════════════ */
console.log('\nTokens');
{
  const encontrados = [];
  for (const f of archivos(SRC, ['.css', '.astro', '.mdx', '.ts', '.js'])) {
    const n = (sinComentarios(leer(f)).match(/:root\s*\{/g) ?? []).length;
    if (n) encontrados.push([rel(f), n]);
  }
  const total = encontrados.reduce((s, [, n]) => s + n, 0);

  if (total === 1 && encontrados[0][0] === posix.join('src', 'styles', 'tokens.css')) {
    ok('un único :root{}, en src/styles/tokens.css');
  } else {
    fallo(
      'Tiene que haber exactamente un :root{} y estar en tokens.css',
      encontrados.map(([f, n]) => `${f} (${n})`).join(', ') || 'no hay ninguno',
    );
  }
}

/* ═══════════════════════════════════════════════════════════════════
   2 · Cero colores literales fuera de tokens.css
   ═══════════════════════════════════════════════════════════════════ */
{
  const LITERAL = /#[0-9a-fA-F]{3,8}\b|\brgba?\s*\(|\bhsla?\s*\(/g;
  const sospechosos = [];

  for (const f of archivos(SRC, ['.css', '.astro', '.mdx'])) {
    if (rel(f).endsWith(posix.join('styles', 'tokens.css'))) continue;
    for (const linea of sinComentarios(leer(f)).split('\n')) {
      // Un id de fragmento (#seccion) o una clase no son un color.
      const encontrados = (linea.match(LITERAL) ?? []).filter(
        (m) => !m.startsWith('#') || /^#[0-9a-fA-F]{3,8}$/.test(m),
      );
      if (encontrados.length) sospechosos.push(`${rel(f)}: ${encontrados.join(' ')}`);
    }
  }

  if (sospechosos.length === 0) ok('ningún color literal fuera de tokens.css');
  else fallo('Los colores van en tokens.css y se usan con var()', sospechosos.slice(0, 12).join('\n    '));
}

/* ═══════════════════════════════════════════════════════════════════
   2 ter · Ningún var(--x) apunta a un token que no existe
   ═══════════════════════════════════════════════════════════════════
   La regla 2 caza un color literal. No caza lo contrario, que resultó ser más
   frecuente y mucho más silencioso: **usar un token que nadie ha definido**.

   Encontrado el 1 de septiembre de 2026 al empezar las figuras de ejercicio.
   Veintidós de las veintitrés figuras de Fluidos pintaban sus etiquetas
   secundarias con `fill="var(--ink-suave)"`, y `--ink-suave` **no existe en
   `tokens.css`**: son 140 usos. Un `var()` sin definir invalida la
   declaración, así que `fill` cae a su valor inicial —negro— y en tema
   oscuro esas etiquetas quedan en negro sobre #14171A. Las figuras se
   dibujaban «bien» en claro y nadie las miró en oscuro, que es §16 punto 1
   otra vez.

   Se mira también en los `.yaml`, y eso es la mitad del valor de esta regla:
   la 2 solo lee `.css`, `.astro` y `.mdx`, y **176 ejercicios de Cálculo
   llevan su figura SVG dentro del YAML**, es decir fuera del alcance de
   cualquier comprobación de color hasta hoy.

   Los tokens que se asignan en línea —`--acento` desde `Base.astro`, y los
   `--pad`/`--i` locales de la portada— se declaran aquí como conocidos: no
   viven en `tokens.css` y eso es correcto. */
{
  const TOKENS = new Set(
    [...leer(join(SRC, 'styles', 'tokens.css')).matchAll(/^\s*(--[a-z0-9-]+)\s*:/gm)].map(
      (m) => m[1],
    ),
  );
  /* Definidos en línea por un componente, no en la paleta. Si añades uno,
     añádelo aquí y di quién lo asigna. */
  const EN_LINEA = new Set([
    '--acento', // Base.astro e index.astro, con el color de la asignatura
    '--pad', //    index.astro, retículas de la portada
    '--i', //      index.astro, índice de la animación de entrada
  ]);

  const huerfanos = new Map();
  for (const f of archivos(SRC, ['.css', '.astro', '.mdx', '.yaml'])) {
    for (const m of sinComentarios(leer(f)).matchAll(/var\(\s*(--[a-z0-9-]+)/g)) {
      if (TOKENS.has(m[1]) || EN_LINEA.has(m[1])) continue;
      if (!huerfanos.has(m[1])) huerfanos.set(m[1], new Set());
      huerfanos.get(m[1]).add(rel(f));
    }
  }

  if (huerfanos.size === 0) ok(`todos los var(--x) apuntan a un token que existe (${TOKENS.size})`);
  else
    fallo(
      'Hay var(--x) que apuntan a un token inexistente: la declaración se invalida y el color cae a su valor inicial',
      [...huerfanos]
        .map(([t, fs]) => `${t} → ${fs.size} ficheros (${[...fs][0]}…)`)
        .join('\n    '),
    );
}

/* ═══════════════════════════════════════════════════════════════════
   2 bis · LaTeX que no se dibuja
   ═══════════════════════════════════════════════════════════════════
   `\bar{z}` usa un acento que muchas fuentes matemáticas no traen, y la barra
   desaparece sin aviso. Con `\overline` sí se dibuja.

   Pasó el 20 de agosto de 2026 en el ejercicio 1.2.

   ── Aquí había una segunda regla, retirada el 20 de agosto de 2026 ──

   Prohibía `\overline{...}` sobre cualquier cosa que no fuera un símbolo
   suelto, porque «Chromium no estira la barra». Era cierto **con la salida
   MathML pura**, donde el dibujo lo hacía la fuente del sistema. Dejó de serlo
   ese mismo día, al pasar a `htmlAndMathml` (§07): KaTeX ya no delega, dibuja
   la barra como el borde de un `<span>` que él mismo dimensiona.

   La regla sobrevivió a su motivo y empezó a estorbar: bloqueaba
   `\overline{z_2}`, que es la notación del enunciado del ejercicio 2 del examen
   2025-2026, y empujaba a escribirlo peor. Antes de quitarla se midió la
   cobertura real de la barra en Chromium, sobre nuestra propia tubería:

     subíndice 100 % · exponente 100 % · suma 100 % · producto 100 %
     fracción  100 % · raíz      100 % · símbolo suelto 100 %

   Los seis casos que la regla prohibía se dibujan enteros. Un guardián que no
   se pone rojo cuando el fallo existe es peor que no tenerlo (§11), y uno que
   se pone rojo cuando el fallo YA NO existe es exactamente el mismo problema
   visto del revés: enseña a desconfiar de los guardianes. */
{
  const prohibido = [
    [/\\bar\s*\{|\\bar\s+[a-zA-Z]/g, 'usa \\overline{...}: \\bar no dibuja la barra en todas las fuentes'],
  ];
  const pegas = [];

  for (const f of archivos(SRC, ['.mdx', '.yaml', '.astro'])) {
    const texto = leer(f);
    for (const [patron, porque] of prohibido) {
      for (const m of texto.match(patron) ?? []) pegas.push(`${rel(f)}: «${m.trim()}» — ${porque}`);
    }
  }

  if (pegas.length === 0) ok('ningún comando LaTeX de los que no se dibujan');
  else fallo('LaTeX que el navegador no dibuja', pegas.slice(0, 8).join('\n    '));
}

/* ═══════════════════════════════════════════════════════════════════
   3 · Foco visible: nadie apaga el outline
   ═══════════════════════════════════════════════════════════════════ */
console.log('\nAccesibilidad de la fuente');
{
  const apagones = [];
  for (const f of archivos(SRC, ['.css', '.astro'])) {
    const texto = sinComentarios(leer(f));
    for (const m of texto.matchAll(/outline\s*:\s*(none|0)\s*[;}]/g)) {
      apagones.push(`${rel(f)} → ${m[0].trim()}`);
    }
  }
  if (apagones.length === 0) ok('nadie apaga el outline del foco');
  else fallo('Foco visible obligatorio: no se apaga el outline sin poner otra cosa', apagones.join('\n    '));
}

/* ═══════════════════════════════════════════════════════════════════
   4 · prefers-reduced-motion respetado
   ═══════════════════════════════════════════════════════════════════ */
{
  const base = join(SRC, 'styles', 'base.css');
  const tieneBloque = existsSync(base) && /@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/.test(leer(base));
  if (tieneBloque) ok('base.css neutraliza animaciones con prefers-reduced-motion');
  else fallo('prefers-reduced-motion', 'base.css tiene que neutralizar animaciones y transiciones');
}

/* ═══════════════════════════════════════════════════════════════════
   5 · Anchos fijos que rompan a 360 px
   ═══════════════════════════════════════════════════════════════════ */
{
  const anchos = [];
  for (const f of archivos(SRC, ['.css', '.astro'])) {
    const texto = sinComentarios(leer(f));
    for (const m of texto.matchAll(/(?<!max-|min-)width\s*:\s*(\d{3,})px/g)) {
      if (Number(m[1]) > 360) anchos.push(`${rel(f)} → ${m[0].trim()}`);
    }
    for (const m of texto.matchAll(/min-width\s*:\s*(\d{3,})px/g)) {
      // Dentro de @media es legítimo: es un punto de ruptura.
      const antes = texto.slice(0, m.index).lastIndexOf('@media');
      const cierre = texto.slice(0, m.index).lastIndexOf('}');
      if (antes < cierre && Number(m[1]) > 360) anchos.push(`${rel(f)} → ${m[0].trim()}`);
    }
  }
  if (anchos.length === 0) ok('ningún ancho fijo por encima de 360 px');
  else fallo('Responsive real hasta 360 px', anchos.join('\n    '));
}

/* ═══════════════════════════════════════════════════════════════════
   6 · Cruce catálogo ↔ temas escritos
   ═══════════════════════════════════════════════════════════════════ */
console.log('\nContenido');
{
  const dirCatalogo = join(SRC, 'content', 'catalogo');
  const problemas = [];
  let temas = 0;
  let hechos = 0;

  for (const f of archivos(dirCatalogo, ['.json'])) {
    const datos = JSON.parse(leer(f));
    const id = rel(f).split(/[\\/]/).pop().replace('.json', '');
    temas += datos.temas.length;

    for (const t of datos.temas) {
      if (!t.hecho) continue;
      hechos++;
      const mdx = join(SRC, 'content', id, t.id, 'index.mdx');
      if (!existsSync(mdx)) problemas.push(`${id} · ${t.id} está marcado hecho y no existe ${rel(mdx)}`);
    }

    if (!datos.temarioOficial && datos.temas.length > 0) {
      aviso('Temario provisional', `${id}: puesto a ojo, hay que sustituirlo por el oficial`);
    }
  }

  if (problemas.length === 0) ok(`catálogo coherente: ${hechos} de ${temas} temas escritos`);
  else fallo('El catálogo miente sobre lo que está hecho', problemas.join('\n    '));
}

/* ═══════════════════════════════════════════════════════════════════
   Un ejercicio de examen que no enlaza ninguna ruta y que nadie declara

   §14 dice que lo que falta va en `falta[]` y no callado, y §15 lo repite
   para la asignatura entera. Pero «no enlazado» no se veía por ninguna
   parte: un ejercicio transcrito, publicado y correcto puede quedarse sin
   que ninguna ruta lleve a él, y entonces existe en el sitio sin que haya
   forma de llegar estudiando.

   Pasó el 26 de agosto de 2026 con **los catorce ejercicios de las cinco
   recuperaciones de la quinta evaluación**: llevaban días publicados y
   ninguna de las siete rutas los enlazaba. Se encontró cruzando ids a mano,
   no aquí.

   Esto no exige que TODOS estén enlazados —una ruta es una selección, y las
   de las globales enlazan menos de la mitad a propósito—. Lo que exige es
   que **cada convocatoria tenga al menos un ejercicio enlazado por alguna
   ruta**: una convocatoria entera fuera del alcance de las rutas es un
   descuido, no una selección. */
{
  const dirPreparar = join(SRC, 'content', 'preparar');
  if (existsSync(dirPreparar)) {
    const enlazados = new Set();
    for (const f of archivos(dirPreparar, ['.yaml'])) {
      for (const m of leer(f).matchAll(/id:\s*(ex[a-z0-9-]+)/g)) enlazados.add(m[1]);
    }
    const sueltas = [];
    let convocatorias = 0;
    let conAlguno = 0;
    let sinRuta = 0;
    /* Una asignatura por carpeta: se recorren todas las que tengan `examenes/`
       en vez de mirar solo Cálculo. La primera versión, del 26 de agosto de
       2026, tenía `calculo` escrito a fuego y habría dejado a Álgebra fuera del
       guardián el mismo día que entró. */
    for (const asignatura of readdirSync(join(SRC, 'content'))) {
      const dirExamenes = join(SRC, 'content', asignatura, 'examenes');
      if (!existsSync(dirExamenes)) continue;
      /* Una asignatura sin ninguna ruta todavía no incumple nada: está a medio
         empezar, y §14 dice que la ruta se escribe cuando hay exámenes que
         contar. Se cuenta aparte y se dice, en vez de ponerse rojo. */
      const tieneRuta = [...archivos(dirPreparar, ['.yaml'])]
        .some((f) => leer(f).includes(`asignatura: ${asignatura}`));
      for (const d of readdirSync(dirExamenes)) {
        const yamlExamen = join(dirExamenes, d, 'examen.yaml');
        if (!existsSync(yamlExamen)) continue;
        if (!tieneRuta) { sinRuta++; continue; }
        convocatorias++;
        const ids = [...leer(yamlExamen).matchAll(/id:\s*(ex[a-z0-9-]+)/g)].map((m) => m[1]);
        if (ids.some((x) => enlazados.has(x))) conAlguno++;
        else sueltas.push(`${asignatura}/${d} — sus ${ids.length} ejercicios no los enlaza ninguna ruta`);
      }
    }
    const cola = sinRuta ? ` (${sinRuta} más en asignaturas que aún no tienen ruta)` : '';
    if (sueltas.length === 0) {
      ok(`toda convocatoria tiene ejercicios en alguna ruta: ${conAlguno} de ${convocatorias}${cola}`);
    } else {
      fallo(
        'Hay convocatorias enteras a las que ninguna ruta lleva',
        `${sueltas.length} de ${convocatorias}:\n    ${sueltas.slice(0, 10).join('\n    ')}`,
      );
    }
  }
}

/* ═══════════════════════════════════════════════════════════════════
   Un símbolo que KaTeX no sabe dibujar, dentro de una fórmula

   Pasó el 24 de agosto de 2026: un «✗» metido dentro de un bloque `$$…$$`
   para marcar un caso descartado. Fuera de la fórmula se ve perfectamente;
   dentro, KaTeX no tiene métrica para él y lo deja sin dibujar.

   El build lo dice —«Unrecognized Unicode character»— pero solo como
   **aviso**, en medio de doscientas líneas de salida, y no para el
   despliegue. Es decir: exactamente la clase de fallo que se publica.

   La lista es corta a propósito: solo los que se han usado de verdad y
   KaTeX rechaza. El «✓» sí lo dibuja, y el «°» también; no se prohíbe lo
   que funciona.

   Ojo al emparejado de los `$`. La primera versión de esta comprobación usaba
   `\$[^$\n]+\$` para las fórmulas en línea, y eso **se salta** las que ocupan
   dos líneas — que las hay. Al saltárselas, el `$` de cierre quedaba libre y
   se emparejaba con el de la fórmula siguiente, metiendo dentro el texto
   normal que hubiera en medio. Dio un falso positivo a la primera, y un
   guardián que salta sin fallo es tan malo como uno que no salta (§11).
   Ahora se quitan primero los bloques `$$…$$` y después se emparejan los `$`
   en orden, permitiendo saltos de línea dentro.
   ═══════════════════════════════════════════════════════════════════ */
{
  /* La lista se amplía solo con lo que se ha visto rechazar, y el 26 de agosto
     de 2026 se **midió entera** en vez de ampliarla por parecido. El motivo
     fue el `€`: apareció escrito como `\text{€}` en el plan de ahorro de
     2023-2024 y KaTeX lo rechazó — ni siquiera dentro de `\text{}`, porque la
     fuente no lo trae. Se escribe «euros» y ya está.

     Al medir salieron seis más de los que había, entre ellos dos que estaban a
     punto de colarse por analogía y **sí se dibujan**: `£` y `¥`. Pasando
     dieciocho símbolos por `katex.renderToString` con `strict: 'error'`:

       rechazados  ✘ ☒ € % ‰ ✗ ✔ ☑ µ Å ∅ ħ
       se dibujan  £ ¥ ° ✓ × · − ± Ω ← → ⇒ ⇔ ∀ ∃

     Ojo con dos de la lista mala, que son los que más probable es escribir sin
     pensar: el `%` se escribe `\%`, y la micra `\mu`.

     Y por eso el `%` va aparte, con un «no precedido de barra»: `\%` es el
     escape correcto y el corpus ya lo usa bien en tres sitios. Sin esa
     salvedad el guardián los marcaba a los tres — y un guardián que salta
     sobre lo que está bien escrito enseña a ignorarlo (§11).

     **Segunda ampliación, también medida, el 26 de agosto de 2026.** Al
     construir la ordinaria de 2021-2022 el build escupió dos avisos de KaTeX
     por una raya larga dentro de `$…$`: había escrito `pequeño$—$vale` y
     `siguiente$—3!$` queriendo un guion de inciso, y lo que se publicaba era
     una fórmula cuyo único contenido era la raya. Los dos estaban ya
     **commiteados y subidos**, que es lo que hace que esto sea un fallo real y
     no una precaución.

     Se midió la familia entera de rayas y comillas con `strict: 'warn'`:

       rechazados  — (2014) – (2013) ‐ (2010) « » “ ” y el espacio duro (00A0)
       se dibujan  − (2212, el signo menos de verdad) … (2026)

     El espacio duro entra en la lista porque es invisible: se cuela al copiar
     de un PDF y no hay forma de verlo leyendo el fichero.

     Al medir el corpus con la lista nueva salió **una** aparición viva, un
     `\text{— fuera del dominio}` en la segunda evaluación de 2021-2022. Se
     reescribió como `\text{(fuera del dominio)}`, así que el guardián nace en
     cero. No se hace excepción con `\text{}`: KaTeX avisa igual ahí dentro, y
     la prosa larga dentro de una fórmula casi siempre está mejor fuera. */
  const SIN_METRICA = /(?<!\\)%|[✘☒€‰✗✔☑µÅ∅ħ—–‐«»“” ]/;
  const pegas = [];

  for (const f of archivos(join(SRC, 'content'), ['.yaml', '.mdx'])) {
    const texto = leer(f);
    const mira = (trozo, desde) => {
      const malos = [...new Set(trozo.match(new RegExp(SIN_METRICA, 'g')) ?? [])];
      if (!malos.length) return;
      pegas.push(`${rel(f)}:${texto.slice(0, desde).split('\n').length} → ${malos.join(' ')}`);
    };

    // 1 · los bloques, y se sustituyen por espacios para no desemparejar nada
    let resto = texto;
    for (const m of texto.matchAll(/\$\$([\s\S]*?)\$\$/g)) mira(m[1], m.index);
    resto = texto.replace(/\$\$[\s\S]*?\$\$/g, (b) => ' '.repeat(b.length));

    // 2 · las de línea, emparejando los `$` en orden y admitiendo saltos
    for (const m of resto.matchAll(/\$([^$]+)\$/g)) mira(m[1], m.index);
  }

  if (pegas.length === 0) ok('ningún símbolo sin métrica dentro de una fórmula');
  else
    fallo(
      'KaTeX no sabe dibujar ese símbolo dentro de $…$: sácalo fuera de la fórmula',
      pegas.slice(0, 6).join('\n    '),
    );
}

/* ═══════════════════════════════════════════════════════════════════
   Un «: » sin comillas dentro de un valor YAML

   Rompe el fichero, y el error que da apunta a otra línea. Ha pasado cuatro
   veces el 24 de agosto de 2026 —en una ruta, en un título de escalón y en
   dos textos de opción— y siempre igual: se escribe un título natural como
   «No: en el borde vale 4» y YAML lo lee como una clave.

   El build ya lo caza, sí. Pero lo caza **después** de escribir el fichero
   entero y señalando una línea equivocada, y eso son cinco minutos cada vez.
   Este chequeo lo encuentra en el sitio exacto y dice cómo se arregla.

   Solo mira valores en línea: un bloque `|` o `>-` puede llevar dos puntos
   sin problema, y de hecho los lleva por todas partes.

   Y eso hay que **seguirlo línea a línea**, no basta con mirar cómo empieza
   la línea que se está examinando. Corregido el 25 de agosto de 2026: dentro
   de la resolución de 2020-2021-3ev hay una frase que continúa de renglón
   con «general: en el óptimo … la proporción siempre es 1 : 2.», y el
   guardián la leía como una clave `general` con un «: » dentro. Prosa
   correcta, fichero que parsea, guardián en rojo. Ahora se lleva la cuenta
   de en qué bloque `|` o `>` se está: todo lo que vaya más sangrado que su
   clave es texto, no YAML.
   ═══════════════════════════════════════════════════════════════════ */
{
  const pegas = [];
  for (const f of archivos(join(SRC, 'content'), ['.yaml'])) {
    const lineas = leer(f).split('\n');
    let bloque = -1; // sangría de la clave cuyo bloque estamos atravesando
    for (const [i, linea] of lineas.entries()) {
      const sangria = linea.search(/\S/);
      if (sangria === -1) continue; // línea en blanco: el bloque sigue
      if (bloque >= 0 && sangria > bloque) continue; // dentro del bloque: es texto
      bloque = -1;

      // `clave: valor` en línea, sin comillas ni bloque, con otro «: » dentro
      const m = linea.match(/^(\s*)(-\s+)?([a-zA-Zñáéíóú_]+):\s*(.*)$/);
      if (!m) continue;
      const valor = m[4].trim();
      if (/^[|>]/.test(valor)) { bloque = sangria; continue; } // abre bloque
      if (valor === '' || /^['"&*]/.test(valor)) continue; // vacío o entrecomillado
      if (/: /.test(valor)) {
        pegas.push(`${rel(f)}:${i + 1} → ${linea.trim().slice(0, 62)}`);
      }
    }
  }

  if (pegas.length === 0) ok('ningún «: » sin comillas dentro de un valor YAML');
  else
    fallo(
      'Un «: » dentro de un valor YAML necesita comillas, o el fichero no parsea',
      pegas.slice(0, 6).join('\n    '),
    );
}

/* ═══════════════════════════════════════════════════════════════════
   Un apóstrofo suelto en el texto de una opción o de una pieza

   Se añade el 24 de agosto de 2026, después de romperse dos veces el mismo
   día. El procesador convierte el apóstrofo recto en comilla tipográfica
   (U+2019), así que `y'` se publica como `y’` — que para una derivada es
   tipográficamente falso: se lee «y comilla», no «y prima».

   Y tiene una segunda consecuencia peor, que es la que lo delató: el texto
   publicado deja de coincidir con el del YAML, así que cualquier prueba que
   busque la opción correcta por su texto no la encuentra. Las dos veces se
   descubrió así, recorriendo los ejercicios en el navegador.

   Dentro de $...$ no pasa nada, porque ahí manda KaTeX y `y'` se dibuja con
   una prima de verdad. La regla es solo para el texto plano.

   Y no vale con buscar «letra seguida de apóstrofo»: eso marca **d'Alembert**
   y **L'Hôpital**, donde la comilla curva es justo lo correcto. Lo que
   distingue a una derivada es que después del apóstrofo NO viene una letra:
   `y' = kT` sí, `d'Alembert` no.
   ═══════════════════════════════════════════════════════════════════ */
{
  const { load } = await import('js-yaml');
  const SIN_MATE = /\$[^$]*\$/g;
  const SUELTO = /[a-zA-Z]['’](?![a-zA-Zà-öø-ÿ])/;
  const pegas = [];

  for (const f of archivos(join(SRC, 'content'), ['.yaml'])) {
    if (!f.endsWith('ejercicios.yaml')) continue;
    let datos;
    try {
      datos = load(leer(f));
    } catch {
      continue; // un YAML roto ya lo caza el build, no es cosa de aquí
    }
    for (const ej of datos?.ejercicios ?? []) {
      for (const paso of ej.pasos ?? []) {
        const textos = [
          ...(paso.opciones ?? []).map((o) => o.texto),
          ...(paso.piezas ?? []).map((z) => z.texto),
        ];
        for (const t of textos) {
          if (SUELTO.test(String(t).replace(SIN_MATE, ''))) {
            pegas.push(`${rel(f)} · ${ej.id}: «${String(t).slice(0, 56)}…»`);
          }
        }
      }
    }
  }

  if (pegas.length === 0) ok('ningún apóstrofo suelto en opciones ni piezas');
  else
    fallo(
      'Un apóstrofo fuera de $…$ se publica como comilla curva: usa \\prime o escríbelo con palabras',
      pegas.slice(0, 8).join('\n    '),
    );
}

/* ═══════════════════════════════════════════════════════════════════
   LaTeX dentro de un <figure>, que no lo procesa nadie

   Se añade el 25 de agosto de 2026, después de publicarlo de verdad. El pie
   de la figura del ejercicio 2 de la quinta de 2017-2018 decía «los puntos
   $A$ y $B$» y salió en la página con los dólares puestos.

   El motivo es de Markdown, no del proyecto: un `<figure>` abre un bloque de
   HTML en bruto, y dentro de un bloque en bruto no se procesa nada — ni
   negritas, ni enlaces, ni `remark-math`. El SVG se dibuja porque es HTML;
   el `$A$` del pie no, porque es Markdown.

   Ni el esquema ni el build lo ven: es texto válido en un sitio válido. Se
   descubrió mirando la captura (§16, punto 1). De las 83 figuras del corpus
   solo esta lo tenía, así que el guardián nace midiendo cero y su trabajo es
   que siga en cero.

   El interior del `<svg>` se excluye a propósito: ahí no hay Markdown de
   ninguna manera, y un `$` en una etiqueta de dinero sería legítimo.
   ═══════════════════════════════════════════════════════════════════ */
{
  const pegas = [];
  for (const f of archivos(join(SRC, 'content'), ['.yaml', '.mdx'])) {
    const texto = leer(f);
    const figuras = texto.match(/<figure\b[\s\S]*?<\/figure>/g) ?? [];
    for (const fig of figuras) {
      const sinSvg = fig.replace(/<svg[\s\S]*?<\/svg>/g, '');
      const dolares = sinSvg.match(/\$[^$\n]+\$/g);
      if (dolares) pegas.push(`${rel(f)} → ${dolares.slice(0, 3).join(' · ')}`);
    }
  }

  if (pegas.length === 0) ok('ningún LaTeX sin procesar dentro de un <figure>');
  else
    fallo(
      'Dentro de un <figure> Markdown no procesa nada: el $…$ del pie se publica con los dólares',
      pegas.slice(0, 8).join('\n    '),
    );
}

/* ═══════════════════════════════════════════════════════════════════
   El ejemplo de ejercicio de CLAUDE.md §04 tiene que compilar

   Se añade el 24 de agosto de 2026, después de romperse de verdad y dos
   veces seguidas. El ejemplo llevaba meses inventado y no acertaba **un
   solo campo** del esquema: sin `ejercicios:`, sin `tipo` en los pasos, y
   con `competencia`, `unidad` y `solucion`, que no existen. Al reescribirlo
   copiándolo del corpus se coló la segunda: un `: ` sin comillas dentro de
   una pieza, que es la trampa que el propio §17 documenta.

   Por qué merece un guardián y no una nota. La documentación se copia. Un
   ejemplo que no compila no cuesta un build fallido: enseña que el fichero
   de reglas miente, y a partir de ahí no se lee ninguna. Y a esto lo va a
   leer cada vez más alguien que no puede preguntar si el ejemplo va en
   serio.
   ═══════════════════════════════════════════════════════════════════ */
{
  const md = leer(join(ROOT, 'CLAUDE.md'));
  const bloque = md.match(/```yaml\n([\s\S]*?)```/);
  const problemas = [];

  if (!bloque) {
    problemas.push('CLAUDE.md §04 ya no tiene un ejemplo de ejercicio en YAML');
  } else {
    try {
      // Las elipsis del ejemplo van en comentario, para que siga siendo YAML.
      const { load: parse } = await import('js-yaml');
      const datos = parse(bloque[1]);
      const e = datos?.ejercicios?.[0];
      if (!e) throw new Error('el bloque no define ejercicios[0]');

      const exige = (c, m) => c || problemas.push(m);
      exige(/^[a-z0-9-]+$/.test(e.id ?? ''), 'id: en minúscula, sin acentos');
      exige((e.titulo ?? '').length >= 5, 'titulo: mínimo 5 caracteres');
      exige((e.fuente ?? '').length >= 10, 'fuente: mínimo 10 — y §08 exige que diga de dónde sale');
      exige((e.enunciado ?? '').length >= 10, 'enunciado: mínimo 10');
      exige((e.pide ?? '').length >= 5, 'pide: mínimo 5');
      exige((e.pasos ?? []).length >= 2, 'pasos: mínimo 2');

      // Las tres competencias de §09, metidas en el esquema.
      const tipos = new Set((e.pasos ?? []).map((p) => p.tipo));
      exige(tipos.has('reconocer'), 'falta un paso `reconocer` (COMP1)');
      exige(tipos.has('calcular') || tipos.has('verificar'), 'falta un paso `calcular` o `verificar` (COMP2)');
      exige(tipos.has('justificar'), 'falta un paso `justificar` (COMP4)');

      for (const p of e.pasos ?? []) {
        if (p.tipo === 'reconocer') {
          exige((p.opciones ?? []).length >= 3, 'un `reconocer` lleva 3 opciones como mínimo');
          exige((p.opciones ?? []).filter((o) => o.correcta).length === 1, 'exactamente una opción correcta');
          exige((p.opciones ?? []).every((o) => (o.mensaje ?? '').trim().length >= 20), 'cada opción explica por qué, en 20 caracteres o más');
        }
        if (p.tipo === 'calcular') {
          exige(['numero', 'complejo', 'conjunto'].includes(p.respuesta?.tipo), 'respuesta.tipo desconocido');
          exige((p.distractores ?? []).length >= 1, 'sin distractores esto no diagnostica nada');
          exige(!(p.respuesta?.formato ?? '').includes('$'), 'el formato es texto plano, sin LaTeX');
          exige((p.pista ?? '').trim().length >= 10, 'pista: mínimo 10');
          exige((p.desarrollo ?? '').trim().length >= 20, 'desarrollo: mínimo 20');
          const tol = p.respuesta?.tolerancia ?? 0.001;
          for (const d of p.distractores ?? []) {
            const lejos = Math.abs(parseFloat(d.valor) - parseFloat(p.respuesta?.valor)) > tol;
            exige(lejos, `el distractor ${d.valor} cae dentro de la tolerancia: se daría por bueno`);
          }
        }
        if (p.tipo === 'justificar') {
          exige((p.piezas ?? []).length >= 3, 'un `justificar` lleva 3 piezas como mínimo');
          exige((p.piezas ?? []).filter((x) => x.trampa).length === 1, 'exactamente una pieza trampa');
          exige((p.piezas ?? []).every((x) => !x.trampa || x.mensaje), 'la pieza trampa explica por qué no entra');
        }
      }
    } catch (err) {
      problemas.push(`el YAML no se puede leer — ${err.message}`);
    }
  }

  if (problemas.length === 0) ok('el ejemplo de ejercicio de CLAUDE.md §04 pasa el esquema');
  else fallo('El ejemplo de CLAUDE.md §04 no compila, y la documentación se copia', problemas.join('\n    '));
}

/* ═══════════════════════════════════════════════════════════════════
   Comprobaciones sobre el sitio construido
   ═══════════════════════════════════════════════════════════════════ */
if (SOLO_FUENTE) {
  resumen();
} else if (!existsSync(DIST)) {
  fallo('No hay dist/', 'ejecuta `npm run build` antes de verificar, o usa --solo-fuente');
  resumen();
} else {
  const paginas = [...archivos(DIST, ['.html'])];
  console.log(`\nSitio construido — ${paginas.length} página(s)`);

  const externos = new Set();
  const sinDescripcion = [];
  const sinOg = [];
  const sinCanonical = [];
  const h1Malos = [];
  const sinLang = [];
  const imgSinAlt = [];
  const rotos = [];
  const sinViewport = [];
  const sinModos = [];
  const latexCrudo = [];
  const svgComoTexto = [];
  const refsRotas = [];
  /* Anclas a OTRA página: se apuntan aquí y se resuelven al final, cuando ya
     se han leído todas las páginas y se sabe qué ids declara cada una. */
  const anclasFuera = [];
  const anclasRotas = [];
  const idsPorPagina = new Map();

  for (const f of paginas) {
    const html = leer(f);
    const nombre = rel(f);

    /* dominios externos */
    for (const m of html.matchAll(/https?:\/\/[^"'\s)>]+/g)) {
      const url = m[0];
      if (url.startsWith(ORIGEN)) continue;
      if (url.startsWith('http://www.w3.org/')) continue; // espacio de nombres de MathML, no una petición
      externos.add(`${nombre} → ${url}`);
    }

    /* metadatos */
    if (!/<meta\s+name="description"\s+content="[^"]{10,}"/.test(html)) sinDescripcion.push(nombre);
    if (!/<meta\s+property="og:title"/.test(html)) sinOg.push(nombre);
    if (!/<link\s+rel="canonical"/.test(html)) sinCanonical.push(nombre);
    if (!/<html[^>]+lang="es"/.test(html)) sinLang.push(nombre);
    if (!/<meta\s+name="viewport"/.test(html)) sinViewport.push(nombre);

    /* exactamente un h1 */
    const h1 = (html.match(/<h1[\s>]/g) ?? []).length;
    if (h1 !== 1) h1Malos.push(`${nombre} (${h1})`);

    /* alt en toda imagen */
    for (const m of html.matchAll(/<img\b[^>]*>/g)) {
      if (!/\balt\s*=/.test(m[0])) imgSinAlt.push(`${nombre} → ${m[0].slice(0, 70)}`);
    }

    /* modo guiado y modo completo en páginas de contenido */
    const esContenido = /data-lectura/.test(html);
    if (esContenido && !/data-modo="guiado"/.test(html)) sinModos.push(nombre);

    /* LaTeX que se ha quedado sin procesar.
       Añadida el 21 de agosto de 2026, después de encontrar DOCE fórmulas
       publicadas como texto crudo —«$\left», «z\right|=1$»— repartidas por
       ocho páginas. Tres causas distintas, todas invisibles al build:

         · una barra de valor absoluto dentro de una celda de tabla. El `|`
           parte la celda, la fila pasa a tener más columnas que la cabecera y
           Markdown descarta las sobrantes en silencio. Se arregla escribiendo
           \lvert y \rvert, que no llevan barra literal.
         · una fórmula en línea partida por un salto de renglón cuya
           continuación empieza por `- ` o `> `: Markdown la lee como viñeta o
           como cita y descoloca el emparejamiento de los dólares.
         · un `titulo:` de paso con matemáticas dentro. Los títulos se pintan
           como texto plano, no pasan por mate(), así que el LaTeX sale tal
           cual.

       El texto publicado no tiene ningún motivo para contener un `$`: aquí no
       se habla de dólares. Si aparece uno, es una fórmula que no se ha
       dibujado. Se mira el texto sin el MathML ni la anotación de KaTeX, que
       sí guardan el LaTeX de origen a propósito. */
    const visible = html
      .replace(/<math[\s\S]*?<\/math>/g, '')
      .replace(/<script[\s\S]*?<\/script>/g, '')
      .replace(/<[^>]+>/g, ' ');
    for (const m of visible.matchAll(/.{0,45}\$.{0,45}/g)) {
      latexCrudo.push(`${nombre} → …${m[0].replace(/\s+/g, ' ').trim()}…`);
    }

    /* Y el caso hermano, que esta regla NO veía: una fórmula que sí llega a
       KaTeX pero que KaTeX no sabe dibujar. Ahí no queda ningún `$` suelto
       —KaTeX se los ha comido— sino un `katex-error`, que se publica como un
       recuadro rojo con el LaTeX dentro. Es peor que el `$` crudo, porque
       parece deliberado.

       Añadida el 3 de septiembre de 2026 tras encontrar así un `\boxed{` sin
       cerrar en la resolución de un ejercicio de Álgebra que llevaba semanas
       publicado, con el suelo en verde todas ellas. Barrido el corpus entero
       —9 650 campos con fórmula— era el único. */
    for (const m of html.matchAll(/class="katex-error"[^>]*title="([^"]{0,90})/g)) {
      latexCrudo.push(`${nombre} → KaTeX no sabe dibujarla: ${m[1].replace(/&#x27;/g, "'")}…`);
    }

    /* una figura que se ha publicado partida.
       Añadida el 25 de agosto de 2026, y es la que más ha rendido de todo el
       fichero. Una figura incrustada en un `ejercicios.yaml` es HTML crudo
       dentro de Markdown, y **una línea en blanco cierra un bloque de HTML
       crudo**: el `<svg>` se cierra solo en el primer renglón vacío y todo lo
       que venía detrás queda fuera de él. Un `<path>` fuera de un `<svg>` no
       es nada — el navegador lo tira y solo queda el texto de las etiquetas—;
       y si además va sangrado cuatro espacios, se publica como bloque de
       código, con el marcado a la vista.

       Al mirarlo salieron **52 de las 105 figuras de examen del sitio**, unas
       en blanco y otras como código. Build, esquema, consola y este mismo
       fichero, todos en verde: el HTML es válido, solo que no dibuja. La causa
       se arregló en `markdown.mjs`, que es donde tocaba (Regla 0); esto es lo
       que impide que vuelva por otro camino.

       Se comprueban los dos síntomas, que son el mismo fallo con dos caras. */
    for (const m of html.matchAll(/<figure[^>]*>([\s\S]*?)<\/figure>/g)) {
      const fuera = m[1]
        .replace(/<svg[\s\S]*?<\/svg>/g, '')
        .match(/<(path|circle|rect|line|polygon|polyline|ellipse|g|use|text)[\s>]/);
      if (fuera) svgComoTexto.push(`${nombre} → «${fuera[1]}» fuera de todo <svg>`);
    }
    for (const m of html.matchAll(/<pre[^>]*>([\s\S]*?)<\/pre>/g)) {
      const dentro = m[1].replace(/<[^>]*>/g, '');
      if (!/&#x3C;(svg|g |path|circle|rect|text |use |defs|line |polygon)/.test(dentro)) continue;
      svgComoTexto.push(`${nombre} → como bloque de código: …${dentro.replace(/\s+/g, ' ').trim().slice(0, 48)}…`);
    }

    /* referencias internas que no apuntan a nada.
       Añadida el 25 de agosto de 2026, y es la comprobación que faltaba
       debajo de la de arriba. Un `url(#loQueSea)` que no encuentra su id no
       es un error: el navegador lo ignora y sigue. Así que el recorte de una
       gráfica desaparece, el relleno se sale del marco, y build, esquema y
       consola no dicen nada.

       Salieron tres exámenes ya publicados: 2019-2020-3ev perdía un recorte y
       un `pattern`, 2020-2021-3ev un recorte, y 2025-2026-4ev otro. La causa
       era común y estaba en la capa compartida —`mate()` prefijaba los `id`
       sin reescribir los `url(#…)`—, así que se arregló allí; esto es lo que
       impide que vuelva a pasar por otro sitio.

       Se ignoran los ids que no declara la página: `#` a secas y los destinos
       de un enlace a otra página, que ya los mira la comprobación de enlaces
       rotos. */
    {
      const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
      idsPorPagina.set(f, ids);
      const refs = [...html.matchAll(/(?:url\(#|\sxlink:href="#|\shref="#)([^)"]+)/g)].map((m) => m[1]);
      for (const r of new Set(refs)) {
        if (!r || ids.has(r)) continue;
        refsRotas.push(`${nombre} → #${r}`);
      }
    }

    /* enlaces internos */
    for (const m of html.matchAll(/href="([^"#][^"]*)"/g)) {
      const href = m[1];
      if (/^(https?:|mailto:|tel:|data:)/.test(href)) continue;
      if (!href.startsWith(BASE)) {
        rotos.push(`${nombre} → ${href} (no lleva el base ${BASE}; usa ruta())`);
        continue;
      }
      const limpio = href.split('#')[0].split('?')[0];
      const fragmento = href.includes('#') ? href.slice(href.indexOf('#') + 1) : '';
      const destino = limpio.slice(BASE.length);
      const candidatos = [
        join(DIST, destino),
        join(DIST, destino, 'index.html'),
        join(DIST, `${destino.replace(/\/$/, '')}.html`),
      ];
      if (!candidatos.some(existsSync)) { rotos.push(`${nombre} → ${href}`); continue; }
      /* Para el ancla hace falta **el fichero HTML**, no el directorio: la
         primera vez que se escribió esto se usó `candidatos.find(existsSync)`,
         que devuelve el directorio `dist/calculo/t01-complejos` porque existe,
         y con esa clave el mapa de ids no encontraba nada y la comprobación se
         saltaba en silencio. Se cazó rompiendo un ancla a propósito y viendo
         que el guardián seguía verde (§11). */
      if (fragmento) {
        const conHtml = candidatos.filter((c) => c.endsWith('.html')).find(existsSync);
        if (conHtml) anclasFuera.push({ nombre, href, destino: conHtml, fragmento });
      }
    }
  }

  /* Que el ancla LLEGUE, no solo que el fichero exista.

     Hasta el 26 de agosto de 2026 esta comprobación partía el href por `#` y
     tiraba el fragmento: un enlace a `…/t01-complejos/#apartado-inventado`
     pasaba en verde y dejaba al lector en la cabecera de la página, sin que
     nada avisara. No es hipotético: el 23 de agosto se publicaron **58 enlaces
     de teoría rotos** exactamente así, con destino válido y ancla que no
     existía, y se encontraron mirando, no aquí.

     Las rutas de estudio son el sitio donde más duele, porque su campo
     `apartado` es un slug copiado a mano del título de un encabezado —con sus
     acentos— y equivocarse en una tilde no rompe nada visible. Las siete rutas
     tienen 591 enlaces con ancla entre las siete. */
  for (const a of anclasFuera) {
    const ids = idsPorPagina.get(a.destino);
    if (!ids) continue;                       // la página no se leyó: ya lo dice `rotos`
    let frag = a.fragmento;
    try { frag = decodeURIComponent(frag); } catch { /* se deja como viene */ }
    if (ids.has(frag) || ids.has(a.fragmento)) continue;
    anclasRotas.push(`${a.nombre} → ${a.href}`);
  }

  const grupo = (coleccion, regla, detalle) => {
    const lista = [...coleccion];
    if (lista.length === 0) ok(regla);
    else fallo(regla, `${detalle} (${lista.length}):\n    ${lista.slice(0, 10).join('\n    ')}`);
  };

  grupo(externos, 'cero peticiones a dominios externos', 'referencias fuera del sitio');
  grupo(sinDescripcion, 'toda página con description', 'sin description');
  grupo(sinOg, 'toda página con og:title', 'sin og:title');
  grupo(sinCanonical, 'toda página con canonical', 'sin canonical');
  grupo(sinLang, 'lang="es" en <html>', 'sin lang');
  grupo(sinViewport, 'meta viewport en toda página', 'sin viewport');
  grupo(h1Malos, 'exactamente un <h1> por página', 'páginas con otro número de h1');
  grupo(imgSinAlt, 'alt en toda imagen', 'imágenes sin alt');
  grupo(sinModos, 'modo guiado y modo completo en las páginas de contenido', 'páginas sin los dos modos');
  grupo(rotos, 'cero enlaces internos rotos', 'enlaces que no llevan a ninguna parte');
  grupo(
    anclasRotas,
    `toda ancla a otra página aterriza en un id que existe (${anclasFuera.length})`,
    'enlaces cuyo destino existe pero cuyo #ancla no: el navegador se queda en la cabecera',
  );
  grupo(latexCrudo, 'cero fórmulas sin dibujar en el texto publicado', 'LaTeX que ha salido como texto');
  grupo(
    refsRotas,
    'toda referencia interna (#id, url(#id)) apunta a algo que existe',
    'referencias a un id que no está en la página: el navegador las ignora en silencio',
  );
  grupo(
    svgComoTexto,
    'toda figura se publica entera dentro de su <svg>',
    'figuras partidas al publicarse: una línea en blanco dentro del <svg> cierra el bloque de HTML crudo y lo de detrás se pierde',
  );

  /* prefers-reduced-motion en el CSS publicado */
  const hojas = [...archivos(DIST, ['.css'])];
  const css = hojas.map(leer).join('\n');
  if (/prefers-reduced-motion/.test(css)) ok('el CSS publicado respeta prefers-reduced-motion');
  else fallo('prefers-reduced-motion', 'no aparece en el CSS publicado');

  /* Todo lo que pide el CSS tiene que estar en el propio sitio: esta es la
     comprobación de «desconecta la red y recarga», tipografías incluidas. */
  const faltan = [];
  let recursos = 0;
  for (const hoja of hojas) {
    for (const m of leer(hoja).matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
      const url = m[1].trim();
      if (url.startsWith('data:')) continue;
      recursos++;
      if (/^https?:\/\//.test(url)) {
        faltan.push(`${rel(hoja)} → ${url} (petición externa)`);
        continue;
      }
      const destino = url.startsWith('/')
        ? join(DIST, url.slice(BASE.length + 1))
        : join(dirname(hoja), url);
      if (!existsSync(destino)) faltan.push(`${rel(hoja)} → ${url}`);
    }
  }
  grupo(faltan, `sin conexión: los ${recursos} recursos del CSS están en el sitio`, 'recursos que no se sirven desde aquí');

  resumen();
}

function resumen() {
  console.log('');
  if (avisos) console.log(`${avisos} aviso(s): no bloquean, pero están ahí.`);
  if (fallos) {
    console.error(`${fallos} fallo(s). El despliegue se queda parado.`);
    process.exit(1);
  }
  console.log('Suelo de calidad: en verde.');
}
