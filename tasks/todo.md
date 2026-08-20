# Qué queda

Sesión 1 cerrada: cimientos + una página de contenido real. Esto es lo
siguiente, en el orden en que conviene hacerlo.

---

## Bloqueado, esperándote a ti

**1 · El temario oficial de Cálculo.** Los diez temas del catálogo los puse a
ojo. Están marcados `temarioOficial: false` y `verify.mjs` avisa en cada
ejecución. Sustituirlos antes de que se conviertan en carpetas.

**2 · El temario completo de Fluidos.** Los dieciséis temas del catálogo salen
de los PDF que tienes descargados, así que los títulos son reales, pero hay
huecos en la numeración (faltan el 5, 6, 9, 10, 11, 20, 22, 23 y 24). Confirmar
si existen o si la asignatura salta esos números.

**3 · ~~Los seis prototipos que faltan.~~ Resuelto.** Están los ocho en
`referencia/`. Con ellos se cerraron tres cosas:

- la paleta de datos y los nueve acentos ya son los de `paleta-datos.html` y
  `selector-fluido.html`. Dos colores de datos en claro y cuatro en oscuro se
  corrigieron: el prototipo decía sostenerse bajo daltonismo y midiendo ΔE no
  era cierto. El porqué está en `tokens.css`, junto a cada valor
- la portada se rehízo desde `selector-fluido.html`: lente tipográfica, FLIP y
  paleta de comandos
- `mapa-temario.html` se borró — era la versión superada de la portada

Queda pendiente: `base.css` sigue extraído de dos prototipos, no de ocho. Los
seis nuevos traen cajas, controles de rango y tablas que todavía no se han
subido a la capa compartida. Se hará cuando un patrón real los pida, no antes.

**4 · El formato de datos de `EjercicioGuiado`.** Es la decisión que determina
si producir un tema es rellenar un YAML o programar. No se escribe hasta
haberlo discutido. Es lo siguiente en la lista después de esto.

---

## Lo siguiente que se construye

**5 · Patrón Figura Fija.** El tema de complejos pide este patrón, no Lectura.
Ahora mismo usa Lectura porque no había prototipo. Cuando aparezca, se extrae
el patrón y se pasa `t01-complejos` a él.

**6 · El segundo tema de cada asignatura, escrito entero.** `CLAUDE.md` §13:
el framework se destila del contenido. Dos temas completos por asignatura antes
de abstraer nada más. Los candidatos naturales son `calculo/t02-sucesiones`
(donde COMP2 vale cero y casi todo es demostración) y `fluidos/t25-bombeo`
(donde hay simulador y datos reales de examen).

**7 · Tests de física.** `tests/fisica/` está vacío porque todavía no hay
simulador con física dentro: `PlanoComplejo` es geometría, no un modelo. En
cuanto entre el simulador de bombeo, su caso con resultado conocido va antes que
el componente.

**8 · Paleta de comandos completa.** Ya es una paleta de verdad: se abre con `/`
o `⌘K`, tiene su propio índice construido en el build y responde a flechas,
Enter y Escape. Falta que busque **conceptos** dentro de los temas —hoy el
índice solo tiene asignaturas y títulos—, que es lo que promete `CLAUDE.md` §05.

---

## Deudas conocidas, escritas para que no se olviden

**9 · `peso` tiene dos definiciones enfrentadas en `CLAUDE.md`.** El ejemplo de
frontmatter de §04 usa `peso: 8` —un número— y §10 dice que un dato estimado se
muestra en tres niveles y nunca como porcentaje. Implementé los tres niveles
(`alto`/`medio`/`bajo`) porque el dato *es* estimado. Si en algún momento hay
pesos medidos sobre exámenes reales contados, esto hay que revisarlo — y
entonces se cambia `CLAUDE.md`, no se ignora.

**10 · ~~`verify.mjs` no abre un navegador.~~ Resuelto a medias.** Ya existe
`scripts/humo.mjs`, que abre el sitio en Chromium y corre en CI. Cubre lo que se
rompió de verdad: raíces que no se dibujan, pestañas que no responden,
diagnóstico de errores.

Sigue sin cubrir el foco visible y los 360 px, que se comprueban de forma
indirecta leyendo el CSS. Se moverán a `humo.mjs` cuando alguno de los dos falle
de verdad — la regla de ese fichero es no añadir comprobaciones por si acaso.

**11 · `referencia/` está fuera de `verify.mjs`.** Los prototipos llevan su CSS
inline y su propio `:root`, que es justo lo que la regla prohíbe. Se ignoran a
propósito y está dicho en el README. Si algún día se publican, deja de valer.

**12 · Astro 7 movió la configuración de Markdown.** `markdown.remarkPlugins`
está deprecado; se usa `processor: unified({...})` de `@astrojs/markdown-remark`.
Anotado porque cualquier ejemplo que encuentres por internet usará la forma
vieja.
