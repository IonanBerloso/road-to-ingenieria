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

**11 bis · El sitio pesa 2,5 MB, y 1,1 MB son fuentes de KaTeX.** Al pasar a
salida `htmlAndMathml` (§07) entraron 118 ficheros de fuente: cada familia en
woff2, woff y ttf. El navegador solo descarga los woff2 que la página usa, así
que el coste real por visita es pequeño, pero el repositorio y el despliegue
cargan con todo. Se puede recortar copiando solo los woff2 y reescribiendo el
`@font-face`. No es urgente; queda escrito para que no se descubra por sorpresa.

**12 · Astro 7 movió la configuración de Markdown.** `markdown.remarkPlugins`
está deprecado; se usa `processor: unified({...})` de `@astrojs/markdown-remark`.
Anotado porque cualquier ejemplo que encuentres por internet usará la forma
vieja.

**13 · `ui/Tema.astro` y `ui/Examen.astro` son gemelos.** Misma rejilla
`.shell` con `var(--rail)`, mismo rail sticky, mismas `.pestanas` con
`aria-current`, mismo doble mecanismo `:target` + `data-panel`, y sus dos
`<script>` son el mismo algoritmo escrito dos veces. Piden un
`ui/Armazon.astro`.

No se hizo al añadir la ruta de estudio porque la ruta **no necesita ese
armazón**: nace de `patrones/Lectura.astro`, que trae su propia rejilla y sus
modos, así que no copia nada y no empeora la duplicación. Pero la deuda sigue
ahí, y el día que haga falta una cuarta página con pestañas hay que pagarla
antes, no después.

**14 · Los mapas de convocatoria están repartidos por tres ficheros.**
`NOMBRE_CONV` en `[examen].astro` y en `examenes/index.astro`; `ORDEN_CONV` en
`examenes/index.astro` y en `index.astro`; `ABREV_CONV` en `index.astro`. Piden
un `src/lib/convocatorias.ts` junto a `SUFIJO_CONV`. Bonus: eso arregla de paso
el apaño de `examenes/index.astro`, que tuvo que meter `ORDEN_CONV` **dentro**
de `getStaticPaths` porque no ve el frontmatter — un import sí se ve.

**15 · El filtro de páginas de `humo.mjs` enumera formas de URL.** Va por la
tercera: `/tNN-`, luego `examenes/AAAA-AAAA`, y ahora `preparar/`. Cada vez que
aparece un tipo de página con ejercicios dentro hay que acordarse de tocarlo, y
las dos veces anteriores nadie se acordó hasta que se buscó a propósito. La
regla duradera sería «toda página enlazada desde la portada que contenga un
`[data-ejercicio]`». Se cambia la próxima vez que falle.

**16 · `ALCANCE_CONV` y la ruta declaran los mismos temas.**
`examenes/index.astro` codifica «1.ª ev = temas 1–2, 10 % de la nota» y
`preparar/calculo-1ev.yaml` vuelve a declarar `temas: [t01, t02]`. Es una
segunda fuente de verdad de verdad, pero unificarla acopla el índice de
exámenes a la colección `preparar`. Se deja escrito y se decide cuando haya
rutas de las otras dos evaluaciones.

**17 · ~~`PlanoComplejo` no admite una segunda instancia.~~** Resuelto el 23 de
agosto de 2026: lleva un `id` por instancia y el script recorre todas.
Comprobado en el navegador con dos planos, que mover uno no toca al otro. Las
tres figuras de lugares geométricos siguen siendo SVG estático porque el
verificador cubre ya esa necesidad mejor. Decía: Su `<script>` usa
`document.querySelector` contra ids fijos —`plano-titulo`, `modulo`, `arg`,
`giro`—, así que dos en la misma página se pelean por los mismos nodos. Se topó
al escribir los lugares geométricos del tema 1: las tres figuras de Apolonio,
arco capaz y elipse **son SVG estático** por esto, cuando la herramienta
interactiva habría enseñado más —ver cómo la circunferencia de Apolonio se
desplaza al mover `k` es justo la intuición que falta—. La cura es la de
siempre: raíz por componente y `querySelector` acotado a ella, como ya hacen
los ejercicios guiados. Se paga cuando un tema necesite dos planos.

**18 · El formulario duplica hechos que ya están en la prosa.** Los dos
apartados «Lo que hay que llevar sabido» reescriben definiciones y fórmulas que
están explicadas más arriba en el mismo fichero, a propósito: son para releer
la última hora y tienen que caber en papel. El riesgo es real y conocido —si un
día se corrige la teoría y no el formulario, el formulario miente— y está
declarado en el `falta[]` del bloque. No hay guardián que lo compruebe y no se
escribe uno todavía (§11: se añaden cuando algo se rompe de verdad). Si llega a
pasar una vez, la comprobación es viable: las fórmulas del formulario son un
subconjunto literal de las de los apartados.

**19 · Las resoluciones repiten ids de encabezado dentro de una misma página.**
Medido en `/calculo/t01-complejos/`: `resultado` aparece 29 veces,
`6--comprobación` 13, `5--comprobación` 12, y ocho más. Salen de los `##` que
llevan dentro los `resolucion` de `ejercicios.yaml`, que se renderizan todos en
el mismo documento. No lo cazó `verify.mjs` —comprueba enlaces internos rotos,
no ids repetidos— y no rompe nada visible hoy: nadie enlaza a `#resultado`. Lo
que sí hace es que un lector de pantalla con navegación por encabezados vea
veintinueve destinos con el mismo nombre. La cura barata es prefijar los ids de
los encabezados de cada resolución con el id del ejercicio, en el mismo sitio
donde ya se prefijan los `ej-…`. Se anota, no se arregla ahora: es
preexistente y ortogonal a la ruta de estudio.

**20 · La gramática de condiciones tiene «y» pero no «o».** `src/lib/regiones.ts`
entiende `&` y la palabra `and`, y nada más. Se topó al aplicar el patrón
verificador a los lugares geométricos: el apartado a) de
`ex2223-1-recta-y-conjunto-vacio` es la recta `y = x - 1` **menos** el segmento
central, o sea la unión de dos semirrectas, y sin unión no hay forma de que el
alumno la escriba. Es el único de los veintidós ejercicios de región que se ha
quedado sin verificador. Añadir `|` chocaría con el módulo, así que el token
tendría que ser `or` o `;`. No se hace hasta que un segundo ejercicio lo pida:
uno solo no justifica tocar la gramática.

**21 · ~~`data-ejercicio` es un atributo sin valor.~~** Resuelto el 23 de agosto
de 2026: lleva el id, y de paso es lo que permite anotar el progreso. Decía: Para localizar un ejercicio
concreto en la página hay que ir por su ancla `#ej-<id>`, que sí lleva el id.
Costó un rato de depuración al probar los verificadores en el navegador, porque
`[data-ejercicio="<id>"]` no casa con nada y el selector cae silenciosamente al
primer ejercicio de la página. Poner el id como valor del atributo es un cambio
de una línea y haría que `humo.mjs` y cualquier prueba futura puedan apuntar a
un ejercicio sin adivinar la estructura del DOM.

**22 · Veintitrés bloques siguen con la forma vieja.** El 23 de agosto de 2026
se introdujo el escalón —`aprendes`, teoría, ejercicios de ejemplo a examen, y
`dominio` visible— y se convirtió **solo** el bloque «El suelo» de la primera
evaluación, a propósito: era la plantilla que había que ver funcionando antes
de repetirla. El esquema acepta `material` o `escalones`, así que los otros
veintitrés siguen en pie sin tocarlos. La conversión pendiente son 43 apartados
de teoría, y cada uno necesita mirar si hay un ejercicio por el que se pueda
entrar o si hay que escribirlo: en complejos hubo que escribir seis.
