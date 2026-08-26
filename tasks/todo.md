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

**14 · ~~Los mapas de convocatoria están repartidos por tres ficheros.~~**
**Resuelto el 25 de agosto de 2026.** Eran seis listas en cuatro ficheros, no
tres: el enum y `SUFIJO_CONV` en `content.config.ts`, orden y abreviatura en la
portada, orden y nombre largo en el índice de exámenes, y otro nombre largo —el
mismo en minúscula— en la página de un examen. Ahora hay una tabla
`CONVOCATORIAS` en `content.config.ts` con la URL, la abreviatura y el nombre
largo de cada una, en orden; el enum, `SUFIJO_CONV` y `ORDEN_CONV` se derivan de
ella y las tres páginas la importan. Se hizo al necesitar una convocatoria
nueva —`recuperacion`—, que ahora es una fila.

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

**19 · ~~Las resoluciones repiten ids de encabezado dentro de una misma página.~~**
Resuelto el 23 de agosto de 2026 prefijando los ids con el id del ejercicio en
`mate()`, la capa compartida: de 309 duplicados a 0, sin tocar ni un fichero de
contenido. Decía:
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

**22 · ~~Veintitrés bloques siguen con la forma vieja.~~** Resuelto el 23 de
agosto de 2026 junto con la deuda 23: los 24 bloques están convertidos o son
planos a propósito. Decía: El 23 de agosto de 2026
se introdujo el escalón —`aprendes`, teoría, ejercicios de ejemplo a examen, y
`dominio` visible— y se convirtió **solo** el bloque «El suelo» de la primera
evaluación, a propósito: era la plantilla que había que ver funcionando antes
de repetirla. El esquema acepta `material` o `escalones`, así que los otros
veintitrés siguen en pie sin tocarlos. La conversión pendiente son 43 apartados
de teoría, y cada uno necesita mirar si hay un ejercicio por el que se pueda
entrar o si hay que escribirlo: en complejos hubo que escribir seis.

**23 · ~~Las rutas de 2.ª y 3.ª evaluación siguen en lista plana.~~** Resuelto el
23 de agosto de 2026: las tres rutas están en escalones, 56 en total, con 22
ejemplos de entrada detrás. Los siete bloques que siguen planos —los tres de
exámenes enteros, los tres de formulario y el de complejos extintos— lo están a
propósito: no enseñan una herramienta. Decía: El 23 de
agosto de 2026 se cerró la primera entera: 21 escalones en cinco bloques, con
doce ejemplos introductorios detrás. Quedan 17 bloques por convertir —8 de la
segunda y 9 de la tercera—, que son unos 35 escalones. El coste real no es
convertir el YAML: es que cada escalón necesita un ejercicio por el que se
pueda entrar, y el más simple de cada tema ya es de nivel boletín. En complejos
hicieron falta ocho ejemplos nuevos y en sucesiones cuatro; para los temas 3, 4
y 5 no hay ninguno todavía.

**24 · ~~Los temas 3 y 4 siguen casi sin figuras.~~** Resuelto el 23 de agosto de
2026: los cinco temas tienen ya entre tres y cuatro. Decía: Tras esta tanda: t01 tres,
t02 tres, t03 **cero**, t04 una, t05 cuatro. Continuidad, Bolzano, Weierstrass
y las razones de cambio son conceptos que se explican dibujando, y hoy se
explican con párrafos. Es el mismo hueco que tenía integración antes de que se
le pusieran cuatro.

**25 · ~~Tres de los seis patrones no tienen componente.~~** Resuelto el 24 de
agosto de 2026, y sin escribir código: no faltaban, estaban mal documentados.
«Verificador» y «Demostración» viven dentro de `EjercicioGuiado` como los tipos
de paso `verificar` (21 usos) y `justificar` (270), que es §13 funcionando —el
framework se destila del contenido—. Solo **Figura fija** está sin construir, y
sigue sin construirse a propósito: ningún tema lo ha pedido. §03 y §05 ya lo
dicen. Decía: `figura-fija`,
`verificador` y `demostracion` viven en `referencia/` como prototipos HTML sin
portar, y §03 dibuja un árbol de ficheros que promete `FiguraFija.astro`,
`Verificador.astro` y `Demostracion.astro`, que no existen. Lo que sí existe
son los pasos `verificar` y `justificar` dentro de `EjercicioGuiado`, que el
propio esquema clasifica como pasos y no como patrones. El 23 de agosto de
2026 el catálogo dejó de encender esas casillas, así que ya no se publica nada
falso; lo que queda es decidir si los tres patrones se construyen o si §05 se
reescribe para describir lo que el proyecto hace de verdad.
---

## Auditoría de Cálculo · 24 de agosto de 2026

Hecha al terminar los once temas, buscando lo que le falta a un alumno para
aprobar y no lo que le falta al sitio para estar completo. Las tres primeras
son las que impiden aprobar; las otras son mejoras.

**26 · Los exámenes globales sin transcribir: quedan 3 de 24.** Sigue siendo
la deuda más grande del proyecto, pero ya no es la del segundo cuatrimestre
entero: la evaluación continua está cerrada y las ordinarias han empezado.
Recuento al 26 de agosto de 2026, sobre los PDF del volcado de eGela:

| convocatoria | en el volcado | transcritas | faltan |
|---|---|---|---|
| 4.ª evaluación | 15 | **15** | 0 |
| 5.ª evaluación | 13 | **13** | 0 |
| ordinaria | 11 | **11** | 0 |
| extraordinaria | 11 | **10** | 1 |
| ordinaria-extraordinaria 2019-2020, dos parciales | 2 | 0 | 2 |

Los quince cuadernillos de cuarta y los trece de quinta están hechos, y dan
treinta y dos convocatorias en el sitio porque algunos traen dentro las dos
partes: once cuartas y seis recuperaciones, diez quintas y cinco
recuperaciones. Las ordinarias hechas son 2025-2026, 2024-2025, 2023-2024,
2022-2023, 2021-2022, 2020-2021, 2018-2019, 2017-2018, 2016-2017, 2015-2016 y
2013-2014: **las once**. Cerradas el 26 de agosto de 2026. Ojo con la última:
el cuadernillo no se llama «convocatoria ordinaria» sino **SEXTA EVALUACIÓN**,
y la escuela firma todavía como Donostiako Eskola Politeknikoa. Se archiva como
ordinaria porque es la que hace ese papel, y el comentario del `examen.yaml` lo
dice.

**Lo que este hueco bloqueaba ya no lo bloquea.** El tema 10 tiene **doce**
ejercicios de examen y el 11 tiene **diez**, y esa es toda la muestra que las
ordinarias pueden dar, porque **Laplace y Fourier no caen en ninguna evaluación
continua**: solo en las globales. Cada ordinaria añadió uno, salvo la de
2021-2022, que trajo dos de Laplace —uno de técnica y otro aplicado— y la de
2013-2014, que trajo Laplace y nada de Fourier. Con las once cerradas, auditar
esos dos temas y decidir qué prosa les falta pasa a ser trabajo pendiente, no
bloqueado. Lo que aporten las once extraordinarias será más de lo mismo.

**Los 85 PDF están ya copiados** en `public/examenes/calculo/`, verificados
byte a byte contra el volcado. Lo que queda es leer 3 y escribirlos.

**27 · ~~Los temas 8 a 11 tienen cuatro ejercicios cada uno.~~** Resuelto el 24
de agosto de 2026: los cinco temas del segundo cuatrimestre pasan de 6/4/4/4/4 a
12/8/8/8/8, con las respuestas contrastadas contra las soluciones oficiales del
boletín. Decía: El tema 1 tiene
37 y el 5 tiene 30. Cuatro alcanzan para presentar la herramienta y no para
coger soltura, y en Laplace y Fourier eso es grave porque son técnicas que se
automatizan repitiendo. El boletín de complementarios tiene material de sobra
—el tema 9 solo trae diecinueve ejercicios— y viene con soluciones.

**28 · ~~El bloque de síntesis de la ordinaria no tiene ejercicio propio.~~**
Resuelto el 24 de agosto de 2026 con  (ejercicio 10.16,
2023/2024 6E), que recorre la cadena entera: gradiente → EDO → curva → punto
final. Falta enlazarlo desde el bloque de síntesis de la ruta. Decía: El
segundo parcial trae siempre un ejercicio que encadena gradiente, ecuación
diferencial, parametrización y trabajo. La ruta lo describe y enlaza tres
repasos sueltos, pero **lo que se evalúa es la costura**, no cada pieza. Hace
falta escribir uno que recorra la cadena entera.

**29 · ~~Las EDOs de segundo orden se quedan sin práctica.~~** Resuelto el 24 de
agosto de 2026: dos ejercicios, y uno es el caso de resonancia. Decía: Coeficientes
indeterminados y variación de parámetros caen los dos —2025-2026 pedía
resolver una con segundo miembro que obliga a variación de parámetros— y no
hay ni un ejercicio guiado de ninguna de las dos.

**30 · ~~«Cuarta evaluación» no ha significado siempre lo mismo.~~**
**Resuelto el 25 de agosto de 2026, leyendo los quince cuadernillos.** La
frontera está donde el propio examen la imprime: hasta 2020-2021, el
cuadernillo de la cuarta evaluación trae **dos** exámenes, uno marcado «PRIMER
CUATRIMESTRAL (sólo para alumnos con el primer cuatrimestral suspendido)» —de
los temas 1 y 2— y otro «SEGUNDO CUATRIMESTRAL», de los temas 6 y 7. De
2021-2022 en adelante solo queda el segundo.

En 2015-2016 y 2016-2017 las dos partes comparten cuadernillo y fecha; en
2017-2018, 2018-2019 y 2020-2021 son dos exámenes con fecha propia —12 de
febrero frente al 12 de marzo, por ejemplo—. De 2019-2020 el volcado trae
**solo** la recuperación, del 24 de febrero de 2020; si aquel año hubo examen
de los temas 6 y 7, no está en el material que tenemos, y así se declara.

Corregido el 26 de agosto de 2026, al abrir los cuadernillos de la quinta: **la
recuperación no es una, son dos**. Cada curso hasta 2020-2021 tuvo dos
sesiones, una con la cuarta evaluación y otra con la quinta, así que la
convocatoria única `recuperacion` de ayer se parte en `recuperacion-cuarta`
(URL `4ev-rec`) y `recuperacion-quinta` (URL `5ev-rec`).

Cada recuperación es ahora una convocatoria propia y
`calculo-4ev.yaml` está medida sobre las once cuartas evaluaciones de verdad.
Lo que queda de esta deuda es solo lo que se dice en la 31 y en la 26.

**31 · Hay campos que se publican como texto plano y no lo dice ninguna regla.**
`invariante.fuente` en las rutas y `fuente` en los ejercicios no pasan por el
procesador de Markdown, así que si llevan LaTeX sale crudo. Lo caza el guardián
de fórmulas sin dibujar —el 26 de agosto de 2026 saltó por un `$xsin x# Qué queda

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

**14 · ~~Los mapas de convocatoria están repartidos por tres ficheros.~~**
**Resuelto el 25 de agosto de 2026.** Eran seis listas en cuatro ficheros, no
tres: el enum y `SUFIJO_CONV` en `content.config.ts`, orden y abreviatura en la
portada, orden y nombre largo en el índice de exámenes, y otro nombre largo —el
mismo en minúscula— en la página de un examen. Ahora hay una tabla
`CONVOCATORIAS` en `content.config.ts` con la URL, la abreviatura y el nombre
largo de cada una, en orden; el enum, `SUFIJO_CONV` y `ORDEN_CONV` se derivan de
ella y las tres páginas la importan. Se hizo al necesitar una convocatoria
nueva —`recuperacion`—, que ahora es una fila.

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

**19 · ~~Las resoluciones repiten ids de encabezado dentro de una misma página.~~**
Resuelto el 23 de agosto de 2026 prefijando los ids con el id del ejercicio en
`mate()`, la capa compartida: de 309 duplicados a 0, sin tocar ni un fichero de
contenido. Decía:
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

**22 · ~~Veintitrés bloques siguen con la forma vieja.~~** Resuelto el 23 de
agosto de 2026 junto con la deuda 23: los 24 bloques están convertidos o son
planos a propósito. Decía: El 23 de agosto de 2026
se introdujo el escalón —`aprendes`, teoría, ejercicios de ejemplo a examen, y
`dominio` visible— y se convirtió **solo** el bloque «El suelo» de la primera
evaluación, a propósito: era la plantilla que había que ver funcionando antes
de repetirla. El esquema acepta `material` o `escalones`, así que los otros
veintitrés siguen en pie sin tocarlos. La conversión pendiente son 43 apartados
de teoría, y cada uno necesita mirar si hay un ejercicio por el que se pueda
entrar o si hay que escribirlo: en complejos hubo que escribir seis.

**23 · ~~Las rutas de 2.ª y 3.ª evaluación siguen en lista plana.~~** Resuelto el
23 de agosto de 2026: las tres rutas están en escalones, 56 en total, con 22
ejemplos de entrada detrás. Los siete bloques que siguen planos —los tres de
exámenes enteros, los tres de formulario y el de complejos extintos— lo están a
propósito: no enseñan una herramienta. Decía: El 23 de
agosto de 2026 se cerró la primera entera: 21 escalones en cinco bloques, con
doce ejemplos introductorios detrás. Quedan 17 bloques por convertir —8 de la
segunda y 9 de la tercera—, que son unos 35 escalones. El coste real no es
convertir el YAML: es que cada escalón necesita un ejercicio por el que se
pueda entrar, y el más simple de cada tema ya es de nivel boletín. En complejos
hicieron falta ocho ejemplos nuevos y en sucesiones cuatro; para los temas 3, 4
y 5 no hay ninguno todavía.

**24 · ~~Los temas 3 y 4 siguen casi sin figuras.~~** Resuelto el 23 de agosto de
2026: los cinco temas tienen ya entre tres y cuatro. Decía: Tras esta tanda: t01 tres,
t02 tres, t03 **cero**, t04 una, t05 cuatro. Continuidad, Bolzano, Weierstrass
y las razones de cambio son conceptos que se explican dibujando, y hoy se
explican con párrafos. Es el mismo hueco que tenía integración antes de que se
le pusieran cuatro.

**25 · ~~Tres de los seis patrones no tienen componente.~~** Resuelto el 24 de
agosto de 2026, y sin escribir código: no faltaban, estaban mal documentados.
«Verificador» y «Demostración» viven dentro de `EjercicioGuiado` como los tipos
de paso `verificar` (21 usos) y `justificar` (270), que es §13 funcionando —el
framework se destila del contenido—. Solo **Figura fija** está sin construir, y
sigue sin construirse a propósito: ningún tema lo ha pedido. §03 y §05 ya lo
dicen. Decía: `figura-fija`,
`verificador` y `demostracion` viven en `referencia/` como prototipos HTML sin
portar, y §03 dibuja un árbol de ficheros que promete `FiguraFija.astro`,
`Verificador.astro` y `Demostracion.astro`, que no existen. Lo que sí existe
son los pasos `verificar` y `justificar` dentro de `EjercicioGuiado`, que el
propio esquema clasifica como pasos y no como patrones. El 23 de agosto de
2026 el catálogo dejó de encender esas casillas, así que ya no se publica nada
falso; lo que queda es decidir si los tres patrones se construyen o si §05 se
reescribe para describir lo que el proyecto hace de verdad.
---

## Auditoría de Cálculo · 24 de agosto de 2026

Hecha al terminar los once temas, buscando lo que le falta a un alumno para
aprobar y no lo que le falta al sitio para estar completo. Las tres primeras
son las que impiden aprobar; las otras son mejoras.

**26 · Los exámenes globales sin transcribir: quedan 17 de 24.** Sigue siendo
la deuda más grande del proyecto, pero ya no es la del segundo cuatrimestre
entero: la evaluación continua está cerrada y las ordinarias han empezado.
Recuento al 26 de agosto de 2026, sobre los PDF del volcado de eGela:

| convocatoria | en el volcado | transcritas | faltan |
|---|---|---|---|
| 4.ª evaluación | 15 | **15** | 0 |
| 5.ª evaluación | 13 | **13** | 0 |
| ordinaria | 11 | **7** | 4 |
| extraordinaria | 11 | 0 | 11 |
| ordinaria-extraordinaria 2019-2020, dos parciales | 2 | 0 | 2 |

Los quince cuadernillos de cuarta y los trece de quinta están hechos, y dan
treinta y dos convocatorias en el sitio porque algunos traen dentro las dos
partes: once cuartas y seis recuperaciones, diez quintas y cinco
recuperaciones. Las ordinarias hechas son 2025-2026, 2024-2025, 2023-2024,
2022-2023, 2021-2022, 2020-2021 y 2018-2019.

**Lo que este hueco bloquea, dicho con precisión:** el tema 10 tiene **ocho**
ejercicios de examen y el 11 tiene **siete**, y no pueden tener muchos más,
porque **Laplace y Fourier no caen en ninguna evaluación continua**: solo en
las globales. Cada ordinaria nueva les añade uno, salvo la de 2021-2022, que
trajo dos de Laplace —uno de técnica y otro aplicado— y ninguno de más de
Fourier. Hasta que estén las once no se pueden auditar esos dos temas ni
decidir qué prosa les falta: hacerlo ahora sería escribir el tema con media
muestra.

**Los 85 PDF están ya copiados** en `public/examenes/calculo/`, verificados
byte a byte contra el volcado. Lo que queda es leer 17 y escribirlos.

**27 · ~~Los temas 8 a 11 tienen cuatro ejercicios cada uno.~~** Resuelto el 24
de agosto de 2026: los cinco temas del segundo cuatrimestre pasan de 6/4/4/4/4 a
12/8/8/8/8, con las respuestas contrastadas contra las soluciones oficiales del
boletín. Decía: El tema 1 tiene
37 y el 5 tiene 30. Cuatro alcanzan para presentar la herramienta y no para
coger soltura, y en Laplace y Fourier eso es grave porque son técnicas que se
automatizan repitiendo. El boletín de complementarios tiene material de sobra
—el tema 9 solo trae diecinueve ejercicios— y viene con soluciones.

**28 · ~~El bloque de síntesis de la ordinaria no tiene ejercicio propio.~~**
Resuelto el 24 de agosto de 2026 con  (ejercicio 10.16,
2023/2024 6E), que recorre la cadena entera: gradiente → EDO → curva → punto
final. Falta enlazarlo desde el bloque de síntesis de la ruta. Decía: El
segundo parcial trae siempre un ejercicio que encadena gradiente, ecuación
diferencial, parametrización y trabajo. La ruta lo describe y enlaza tres
repasos sueltos, pero **lo que se evalúa es la costura**, no cada pieza. Hace
falta escribir uno que recorra la cadena entera.

**29 · ~~Las EDOs de segundo orden se quedan sin práctica.~~** Resuelto el 24 de
agosto de 2026: dos ejercicios, y uno es el caso de resonancia. Decía: Coeficientes
indeterminados y variación de parámetros caen los dos —2025-2026 pedía
resolver una con segundo miembro que obliga a variación de parámetros— y no
hay ni un ejercicio guiado de ninguna de las dos.

**30 · ~~«Cuarta evaluación» no ha significado siempre lo mismo.~~**
**Resuelto el 25 de agosto de 2026, leyendo los quince cuadernillos.** La
frontera está donde el propio examen la imprime: hasta 2020-2021, el
cuadernillo de la cuarta evaluación trae **dos** exámenes, uno marcado «PRIMER
CUATRIMESTRAL (sólo para alumnos con el primer cuatrimestral suspendido)» —de
los temas 1 y 2— y otro «SEGUNDO CUATRIMESTRAL», de los temas 6 y 7. De
2021-2022 en adelante solo queda el segundo.

En 2015-2016 y 2016-2017 las dos partes comparten cuadernillo y fecha; en
2017-2018, 2018-2019 y 2020-2021 son dos exámenes con fecha propia —12 de
febrero frente al 12 de marzo, por ejemplo—. De 2019-2020 el volcado trae
**solo** la recuperación, del 24 de febrero de 2020; si aquel año hubo examen
de los temas 6 y 7, no está en el material que tenemos, y así se declara.

Corregido el 26 de agosto de 2026, al abrir los cuadernillos de la quinta: **la
recuperación no es una, son dos**. Cada curso hasta 2020-2021 tuvo dos
sesiones, una con la cuarta evaluación y otra con la quinta, así que la
convocatoria única `recuperacion` de ayer se parte en `recuperacion-cuarta`
(URL `4ev-rec`) y `recuperacion-quinta` (URL `5ev-rec`).

Cada recuperación es ahora una convocatoria propia y
`calculo-4ev.yaml` está medida sobre las once cuartas evaluaciones de verdad.
Lo que queda de esta deuda es solo lo que se dice en la 31 y en la 26.


metido en la `fuente` del ejercicio 3 de la ordinaria de 2018-2019, y bien
saltó—, pero es una asimetría que no está documentada: todos los demás campos
largos sí se procesan.

Son dos decisiones distintas y conviene separarlas. La `fuente` de un ejercicio
es una **cita**, y que no admita fórmulas es defendible: se escribe «x·sen x» y
ya está. El `invariante.fuente` de una ruta es prosa explicativa y ahí la
restricción sí duele. O se procesan los dos, o §04 y §14 lo dicen con todas las
letras.

**32 · Dos ejercicios están duplicados en el corpus.**
`paracaidista-y-velocidad-limite` y `barra-que-se-calienta`, en el
`ejercicios.yaml` del tema 9, son los mismos problemas que la quinta evaluación
de 2016-2017 y la de 2017-2018, transcritas el 25 de agosto de 2026 desde su
PDF original. No es un error: el boletín de complementarios los recoge
etiquetados con el examen del que salen, y las dos fuentes son legítimas. Pero
un alumno que las haga las dos hace el mismo problema dos veces creyendo que
son distintos, y los recuentos de «ejercicios propios del tema» están inflados
en dos.

La ruta de la quinta enlaza solo la versión de examen y lo declara en su
`falta[]`. Lo que hay que decidir en la auditoría es si los del boletín se
retiran o se marcan como «el mismo que…». Y hay que buscar si pasa lo mismo en
otros temas: se ha comprobado el 9 y no los demás.

**33 · ~~La ruta de la ordinaria dice «medida sobre 2».~~** Resuelta el 26 de
agosto de 2026, el mismo día que se cerró la última ordinaria. Lo que había:
`calculo-ord.yaml` declara `medidoSobre: 2` porque se escribió con dos
convocatorias leídas. No es un dato falso —dice lo que se midió— pero envejece
a la vista de cualquiera que cuente los exámenes publicados, y sus recuentos de
bloque («cae los dos años», «los dos lo piden») se quedan cortos.

No se corrige a trozos. Se rehace la ruta entera cuando estén las once
ordinarias, igual que se hizo con la quinta el 25 de agosto de 2026: volver a
medirla sobre cuatro para volver a medirla sobre once es trabajo tirado.

**Y se hizo así, no retocando `medidoSobre`.** Se volvieron a contar los
cuarenta y cinco ejercicios de los segundos parciales de las once ordinarias,
uno a uno, y la ruta pasó de 3 bloques y 7 escalones a **8 y 16**. Lo que la
medición cambió, que es más de lo que se esperaba:

| antes, sobre 2 | ahora, sobre 11 |
|---|---|
| tres bloques: Fourier, Laplace y «síntesis» | ocho |
| ningún bloque de integral múltiple | **el sólido, que cae 10 de 11 años** |
| ningún suelo | **dibujar**: 20 de los 45 lo piden, 13 en el apartado a) |
| «síntesis» como un hueco | dos: la EDO suelta y el ejercicio que cruza temas |
| Fourier el primero | Laplace el primero: cae los once años, Fourier diez |

Tres hallazgos que solo aparecen al contar once:

- **el núcleo son tres y caen juntos nueve de cada once años**: Laplace, el
  sólido y Fourier;
- **la EDO suelta se ha ido.** Seis veces entre 2015-2016 y 2022-2023, y
  ninguna desde entonces: su sitio lo ocupan los ejercicios que cruzan temas,
  tres años seguidos ya;
- y el que duele: **el área de una superficie curva no está en la prosa del
  tema 7** y cae en cuatro de los diez sólidos. Es la deuda 37.

Y una regla que conviene dejar escrita, porque es la segunda vez que pasa:
**medir sobre dos convocatorias no es medir, es mirar.** Con dos, «síntesis»
parecía un hueco y la integral múltiple no parecía nada. Con once, es al revés.

**34 · La medición de `docs/como-vamos.md` se quedó atrás dos commits.** Se
regeneró el 25 de agosto de 2026 con una sola ordinaria transcrita y no se tocó
al entrar las de 2024-2025 y 2023-2024: publicaba «66 de 89 convocatorias» y
«243 ejercicios» cuando ya eran 68 y 260. Corregido el 26 de agosto de 2026.

No es una deuda de contenido, es de procedimiento, y por eso se anota: §10 dice
que un dato publicado tiene que ser cierto, y un fichero que se regenera «cada
varias tandas» lo incumple por construcción. **La regla que queda: la medición
se regenera en el mismo commit que la cambia.** Si eso resulta caro, lo que hay
que hacer es generar el fichero con `mide.mjs` en vez de escribirlo a mano — no
regenerarlo menos.

**35 · Los profesores repiten ejercicios entre convocatorias, y hay que decidir
qué hace el sitio con eso.** Saltó al transcribir la ordinaria de 2021-2022: su
ejercicio 2 y el 2 de la de 2023-2024 son el mismo —mismo enunciado, misma
figura, mismas cinco afirmaciones y mismo reparto 1/7/2—, y se comprobó página
a página en los dos PDF antes de escribirlo.

Se detectó por casualidad, al reconocer la figura, así que en vez de dejarlo
ahí se midió el corpus entero con `scratchpad/busca-gemelos.mjs`, que normaliza
el enunciado —fuera figuras, macros de LaTeX, espacios y puntuación— y agrupa.
Sobre los **404 ejercicios de examen** (28 con enunciado demasiado corto para
comparar, 361 distintos entre los 376 comparados):

| grupo | convocatorias | qué es |
|---|---|---|
| 3 veces | 2018-2019-3ev · 2019-2020-3ev · 2020-2021-3ev | enunciar y demostrar Barrow |
| 3 veces | 2019-2020-2ev · 2022-2023-1ev · 2023-2024-1ev | el paso al límite conserva el ≤ |
| 2 veces | 2021-2022-ord · 2023-2024-ord | las cinco afirmaciones sobre dos gráficas |
| 2 veces | 2017-2018-ord · 2022-2023-ord | la espiral y el campo que mide un área |
| 2 veces | **2023-2024-2ev · 2024-2025-ext** | el alambre, el cuadrado y el triángulo |
| 2 veces | **2022-2023-3ev · 2024-2025-ext** | el sector de 45° que gira alrededor de OX |
| 2 veces | **2020-2021-3ev · 2023-2024-ext** | el McLaurin de la integral de e a la z al cuadrado |
| 2 veces | **2018-2019-3ev · 2021-2022-ext** | la ecuación con el conjugado, tres soluciones en triángulo |
| 2 veces | **2016-2017-ext · 2021-2022-ext** | la curvilínea con el área de diez, misma figura |
| 2 veces | **2015-2016-3ev · 2015-2016-ext** | la función valor medio, el MISMO curso |
| 2 veces | **2013-2014-ord · 2013-2014-ext** | Barrow y la campana, el MISMO curso, un mes después |
| 2 veces | **2015-2016-ext · 2022-2023-ext** | la ecuación integral con la convolución del seno |
| 2 veces | **2017-2018-ext · 2023-2024-ext** | el cuadrado de la derivada leído en el dibujo, misma figura |

Veintiocho instancias de trece problemas. **Y el detector se queda corto**, con
dos pruebas medidas el 26 de agosto de 2026:

- El ejercicio 3 del primer cuatrimestral de **2020-2021-ext** es palabra por
  palabra el apartado a) del ejercicio 3 de **2021-2022-ext** —el McLaurin de
  orden 2 de la integral de (1+sen t)/(2+t²)—, y no aparece porque el de
  2021-2022 lleva pegado un apartado b) sobre un elipsoide. Comparar enunciados
  completos no encuentra un enunciado que está **dentro** de otro.
- La curvilínea con el área de diez ha caído **tres** veces —2016-2017-ext,
  2021-2022-ext y 2023-2024-ext, con la misma figura y el mismo A = 10— y el
  detector solo agrupa las dos primeras. La de 2023-2024 añade cinco palabras al
  enunciado, «desde el punto (−2,0) hasta el punto (2,0)», y con eso las cadenas
  ya no casan. Cinco palabras bastan para partir un grupo en dos.

Con esos dos, **treinta y una instancias de quince problemas**, y el número real
seguirá siendo mayor: solo se detecta lo que coincide carácter a carácter.

Y hay un patrón que ya no parece casualidad: de los doce grupos que el detector
sí ve, **ocho tienen una extraordinaria dentro**. En cinco de ellos la
extraordinaria reutiliza un parcial y en dos repite otra extraordinaria. Las
convocatorias globales son el sitio donde se recicla.

Y el patrón que apareció el 26 de agosto de 2026 al transcribir las dos
extraordinarias más antiguas: **repiten exámenes del propio curso**.

| curso | de dónde sale | cuánto antes |
|---|---|---|
| 2015-2016 | el ejercicio 2 de la tercera evaluación, misma figura | cinco meses |
| 2013-2014 | el ejercicio 2 de la sexta evaluación —la global de mayo— | **un mes** |

El de 2013-2014 es el más descarado: mismo enunciado, mismas palabras, y solo
cambia el reparto de puntos —1/5/4 en mayo, 1/4/5 en junio—. Para una ruta de la
extraordinaria eso es lo primero que hay que decir: **antes de estudiar nada,
mira tus propios exámenes de este curso**.

Las filas con extraordinaria dentro entraron entre el 25 y el 26 de agosto de
2026, según se iban transcribiendo, y cambian lo que se sabía: hasta entonces
todos los repetidos estaban dentro del mismo tipo de convocatoria —tres terceras
evaluaciones, dos ordinarias—. **Cuatro de las cinco son globales reutilizando un
parcial de un año anterior**: el alambre venía de la segunda evaluación de
2023-2024, el sector de la tercera de 2022-2023, el McLaurin de la tercera de
2020-2021 y la ecuación con el conjugado de la tercera de 2018-2019. La quinta es
extraordinaria contra extraordinaria: el cuadrado de la derivada, de 2017-2018 a
2023-2024, seis años después y con la misma figura.

Para una ruta de estudio eso importa más que todo lo anterior, porque significa
que preparar la extraordinaria pasa por repasar **los parciales de años previos**
y no solo las globales.

Y hay un tercer nivel que el detector no puede ver ni con enunciados exactos: el
mismo **objeto** con otra pregunta. El sólido «dentro del paraboloide `x²+y² ≤ z`
y del cono `x²+y² ≤ (z−k)²`, con `z ≤ k`» ha caído **tres veces** con tres
preguntas distintas y dos valores de `k`:

| convocatoria | `k` | qué pide |
|---|---|---|
| 2013-2014-ord, ej. 6 | 6 | dibujarlo y hallar el área de su superficie |
| 2021-2022-ord, ej. 5 | 6 | lo mismo, ocho años después |
| **2017-2018-ext, ej. 2 del 2.º** | **2** | el área **y** el centro de gravedad |

Los enunciados difieren y la normalización no los junta, pero para quien estudia
son el mismo ejercicio con otro número.

Es un límite real del método, no un fallo a corregir: comparar enunciados
encuentra los ejercicios **copiados**, no los que reutilizan el mismo objeto con
otra pregunta. Los segundos son igual de útiles para estudiar y solo salen
leyendo. Los tres que se conocen están dichos en el `fuente` de cada ejercicio.

**No es una anomalía: es cómo funciona esta asignatura**, y de hecho `CLAUDE.md` §09 ya citaba los tres Barrow sin sacar la
consecuencia. Repetir un ejercicio tres años seguidos es la mejor señal de que
va a caer, y eso es exactamente lo que una ruta de estudio debería decir en voz
alta.

Dos avisos sobre el detector, medidos al escribirlo:

- tirar todas las macros de LaTeX **junta enunciados contrarios**: `\ge` y `\le`
  desaparecen los dos, y el «límite no negativo» de 2016-2017 salía gemelo del
  «no positivo» de 2017-2018. Los comparadores se traducen antes de limpiar;
- una diferencia de puro marcado los separa: `c\,(x-4)^2` y
  `c\left(x-4\right)^2` son el mismo enunciado y el detector no los veía. Se
  alineó el marcado de los dos, pero conviene recordarlo antes de fiarse de un
  «cero repetidos».

Lo que queda por decidir, y es de la auditoría:

- si la ruta `ord` enlaza los dos gemelos o solo uno, y si el hecho de que se
  repitan se **publica** como dato de peso;
- qué significa el recuento «ejercicios de examen» de `docs/como-vamos.md`: hoy
  cuenta instancias, no problemas distintos, y la diferencia es de cinco (tres
  problemas que aparecen ocho veces);
- volver a pasar el detector después de cada tanda de convocatorias nuevas.

**36 · El seno se escribe de dos maneras en el corpus.** Medido el 26 de agosto
de 2026: **511** apariciones de la macro castellana y **88** de la inglesa,
repartidas por 8 ficheros. La inglesa se dibuja «sin» y los exámenes imprimen
«sen», así que es un incumplimiento tipográfico de §08 — pequeño, pero visible
para cualquier alumno.

Salió al comparar dos ejercicios gemelos: la espiral de 2017-2018 y la de
2022-2023 son literalmente el mismo enunciado, y el detector de repetidos no
las emparejaba porque una decía `\sin` y la otra `\operatorname{sen}`.
Se alinearon las dos —y de paso los ocho `\sin` que se habían colado hoy en
la ordinaria de 2018-2019—, y con eso el detector ya las ve.

Quedan 88 en estos ficheros:

| fichero | veces |
|---|---|
| `examenes/2022-2023-ord` | 38 |
| `examenes/2021-2022-ord` | 26 |
| `examenes/2023-2024-3ev` | 9 |
| `t01-complejos/ejercicios.yaml` | 7 |
| `examenes/2021-2022-3ev` | 3 |
| `examenes/2024-2025-3ev` | 3 |
| `examenes/2022-2023-3ev` | 1 |
| `t01-complejos/index.mdx` | 1 |

No se arregla de golpe con un script y se dice por qué: la sustitución hay que
mirarla fichero a fichero, porque en la prosa de los temas puede haber alguna
mención deliberada a la notación inglesa. Y sobre todo, **con herramienta de
ficheros, nunca por el shell**: el primer intento de hoy usó un heredoc, el
shell se comió una barra de cada par, la expresión regular pasó a casar
« in» —espacio más ene— y convirtió «la integral» en algo que rompió el YAML.
Es §17 en estado puro, y el fichero hubo que recuperarlo de git.

---

**37 · ~~El área de una superficie curva no está en la prosa del tema 7.~~**
Resuelta el 26 de agosto de 2026, el mismo día que se abrió. Lo que había,
medido
el 26 de agosto de 2026 al rehacer la ruta de la ordinaria: la palabra
«superficie» **no aparece ni una vez** en
`src/content/calculo/t07-integral-multiple/index.mdx`, y el apartado «para qué
sirve todo esto» enumera cuatro aplicaciones —área plana, volumen, masa y centro
de gravedad— sin la quinta.

Y la quinta cae. Cuatro de los diez ejercicios de integral múltiple de las once
ordinarias piden el área de la superficie del sólido: 2013-2014, 2015-2016,
2016-2017 y 2021-2022. Hoy la fórmula solo se puede aprender leyendo la
resolución de uno de esos cuatro, que es exactamente lo que §14 dice que no
vale: «toda herramienta que el examen usa está presentada en la prosa del tema,
no solo dentro de la resolución de un ejercicio».

**Lo que se ha escrito**, en el mismo commit que abrió la deuda:

- el apartado **«El área de una superficie, que no es el área de su sombra»**,
  con la fórmula de la integral doble, el atajo de los cuerpos de revolución
  —`2π∫r ds`—, el caso del paraboloide hasta el radio 2 hecho entero, y un
  error típico sobre confundir el área con el volumen;
- una **figura** que responde a la pregunta que §13 exige: por qué la fórmula
  lleva una raíz. De perfil, un trozo de superficie inclinado sobre su sombra,
  con el ángulo repetido entre la normal y la vertical;
- el ejemplo introductorio **`ej-area-de-un-plano-inclinado`**: el área del
  trozo del plano z = 2x + 2y + 1 sobre el rectángulo [0,2]×[0,1]. Sale 6, y la
  gracia es que el factor de la raíz vale 3 en todos los puntos, así que no hay
  que integrar nada. Es el único caso en que la fórmula se ve sin que la cuenta
  la tape;
- y la quinta fila en las dos tablas del tema, la de aplicaciones y la del
  formulario.

Lo que queda dicho en el `falta[]` de la ruta: entre ese ejemplo y el examen de
2015-2016 hay un salto, porque el ejemplo es un plano y el examen un casquete
esférico. Falta un escalón intermedio con un cuerpo curvado sencillo.

---

**38 · ~~La ruta de la 4.ª evaluación no enlaza ni un solo ejercicio de examen
de su convocatoria.~~** Resuelta el 26 de agosto de 2026, el mismo día que se
abrió. Lo que había: Sus tres bloques y diez escalones mandan a la prosa de los
temas y a los ejercicios propios, y a ninguna de las once cuartas evaluaciones
transcritas.

Salió a la luz arreglando otra cosa, y esa parte merece contarse. La página de
la ruta publica «esta ruta te lleva por N de esos M ejercicios», y el contador
solo miraba el `material` plano del bloque, nunca el `ejercicios` de cada
escalón. Como cinco de las seis rutas ya estaban convertidas a escalones, cinco
publicaban **«0 de esos N» siendo falso** — §10 incumplido en la capa
compartida, no en el contenido. Arreglado el contador en
`[asignatura]/preparar/[evaluacion].astro`, las cifras quedaron así:

| ruta | antes | ahora |
|---|---|---|
| 1.ª | 0 de 39 | **39 de 39** |
| 2.ª | 6 de 42 | **42 de 42** |
| 3.ª | 0 de 62 | **60 de 62** |
| 4.ª | 0 de 29 | **0 de 29** |
| 5.ª | 0 de 32 | **32 de 32** |
| ordinaria | 0 de 86 | **25 de 86** (45 son del segundo parcial, que es lo que prepara) |

La 4.ª siguió diciendo cero **porque en su caso el cero era cierto**. Es la
lección de §16 en su forma más limpia: un dato falso escondía un hueco real, y
hasta que el dato no dijo la verdad el hueco no se vio.

**Lo arreglado.** Se mapearon los veintinueve ejercicios de las once cuartas
evaluaciones —diez de varias variables, dieciocho de integral múltiple y uno de
curvilínea— y se colgaron los veintiocho de los temas 6 y 7 de los escalones que
les tocan. La ruta pasa de 10 escalones a 12, porque la medición pidió dos que
no existían:

- **«plantear sin calcular, y leer un sólido dentro de su integral»** — cuatro
  de los dieciocho: 2016-2017 pide el mismo volumen planteado en cilíndricas y
  en esféricas sin calcular ninguno; 2023-2024 dice literalmente «plantear
  (funciones y límites de integración)»; y 2022-2023 y 2025-2026 hacen el camino
  inverso, dan la integral y piden dibujar el sólido. Es una destreza propia y
  no tenía sitio;
- **«el área de la superficie»** — tres de los dieciocho: 2015-2016, 2017-2018 y
  2024-2025. O sea que la deuda 37 no era solo de las ordinarias: **siete
  ejercicios en total pedían un área de superficie que el tema no explicaba**.

El que queda fuera es el ejercicio 3 de 2020-2021, que calcula un área con una
integral curvilínea. Es del tema 8, que no entra en esta evaluación, y cayó aquí
una sola vez en once años. Está declarado en el `falta[]` del bloque, con el
recuento «veintiocho de veintinueve» dicho en voz alta.

Los 48 enlaces de la ruta pulsados en el navegador: los 48 llegan a un destino
visible. Y de comprobarlo salió una trampa nueva para §17 — la primera medición
dio 18 de 18 en verde **con la página vieja**, porque el servidor de desarrollo
no se había enterado de que el YAML había cambiado.

---

**39 · ~~Tres etiquetas de figura se publicaban recortadas.~~** Resuelta el 26
de agosto de 2026, y lo que importa aquí es **cómo se encontraron**.

Un `<text>` colocado fuera del `viewBox` de su SVG no rompe nada: el navegador
lo recorta y la página sigue en verde. Es un fallo mudo, y ya había pasado dos
veces —«y = 8x − 4» publicado como «y = 8x» en la ordinaria de 2016-2017, y
«t (s)» como «t (» en la de 2015-2016—, las dos veces cazado mirando una
captura a ojo.

A la tercera se midió. El pie de la figura del escalón del tema 10 se cortaba
por la derecha, y en vez de arreglarlo y seguir, se escribió la comprobación:
`humo.mjs` recorre ahora todos los `<svg[viewBox]>` de cada página, con el modo
completo abierto, pide el `getBBox()` de cada `<text>` y compara con el
`viewBox`. Va en el navegador y no en `verify.mjs` porque la caja de un texto
SVG solo la sabe quien elige la fuente y la mide.

**Y en su primera ejecución encontró dos que nadie había visto:**

| dónde | qué se publicaba | cuánto sobraba |
|---|---|---|
| tema 3, figura de Bolzano | «f(b) > 0» salía como «f(b) >» | 17,6 px por la derecha |
| tema 5, figura de capas y discos | «eje de giro», dos veces | 1,0 px por arriba |

El primero es exactamente el mismo fallo de siempre y llevaba meses publicado.
El segundo es de un píxel y no se ve, pero es la misma causa.

Los dos arreglados ensanchando el `viewBox`, y las veintiuna páginas en verde.
La validación al revés que pide §11 no hizo falta inventarla: **el guardián
nació rojo**, sobre dos fallos reales, y se puso verde al arreglarlos.

---

**Y al día siguiente resultó que el guardián medía en vacío.** Se descubrió al
transcribir la extraordinaria de 2022-2023: una etiqueta se salía del viewBox
—«x», dieciocho píxeles por la derecha—, se veía en la captura, y el guardián
daba verde. Medido sobre una página de examen: **32 SVG, 38 etiquetas, cero
cajas medibles**.

El motivo es que `getBBox()` de un elemento dentro de algo con
`display: none` devuelve todo ceros, y el filtro de anchura cero se las comía
todas. En las páginas de tema bastaba con pulsar «completo» y por eso el
guardián parecía funcionar el día que se escribió; en las de examen las figuras
viven dentro de resoluciones que arrancan plegadas.

Tres cosas cambiaron:

- **se destapa la página entera antes de medir** —quitando `hidden` y forzando
  el `display` de todo lo que esté a `none`— y se devuelve a su sitio después;
- **destapar y medir van en dos pasos** con una espera en medio: en el mismo
  `evaluate` el navegador seguía devolviendo ceros, hace falta un reflujo;
- y se añade **un recuento con su propia comprobación**: si una página tiene
  figuras con etiquetas y no se mide ninguna, eso es un fallo. Es la misma
  defensa que ya tenían las raíces y las barras, y que a este guardián le
  faltaba.

Con el guardián arreglado, el barrido de las 79 páginas de examen, los 11 temas
y las 6 rutas encontró **seis figuras más recortadas**, todas de meses atrás:

| dónde | qué sobraba |
|---|---|
| 2015-2016-ord, el sólido con tapa esférica | «x» 22 px por la derecha, y la etiqueta de la esfera 4,4 por la izquierda |
| 2015-2016-ord, los lugares geométricos | «a) circunferencia» 1,1 px |
| 2016-2017-ord, la parábola y su tangente | «x» 3 px y «y» 2,8 px |
| 2021-2022-2ev, el cartón y la caja | «24» 9,1 px por abajo |
| 2021-2022-4ev, la pieza con rectángulo | el pie, 15,2 px por la derecha |
| 2025-2026-ord, el valor medio | «Y» 1 px por arriba |

Las seis arregladas. Y la lección, que es la de §11 llevada un paso más allá:
**no basta con que un guardián nazca rojo. Hay que comprobar además que sigue
midiendo algo en todas las páginas donde debería.** Un guardián que se pone
verde porque no encuentra nada que medir es indistinguible de uno que funciona.

---

**40 · ~~Los temas 10 y 11 tenían la mitad de prosa que los demás.~~** Resuelta
el 26 de agosto de 2026, el mismo día que se cerró la última ordinaria — que era
la condición: **Laplace y Fourier no caen en ninguna evaluación continua**, así
que hasta tener las once globales no había muestra con la que decidir qué les
faltaba.

Con la muestra completa —doce ejercicios de Laplace y diez de Fourier— se
contaron los apartados uno a uno, y salieron seis huecos, tres por tema. El 10
pasa de 872 a 1 605 palabras y el 11 de 888 a 1 668; los dos, de una figura a
dos.

| tema | lo que faltaba | cuántos exámenes lo piden |
|---|---|---|
| 10 | **la función escalón**, usada en la tabla y nunca definida | 2 de 12 |
| 10 | **derivar la transformada**, para coeficientes variables | 1 de 12 |
| 10 | **la definición leída al revés**, para integrales impropias | 1 de 12 |
| 11 | **la ampliación par e impar**, que es el apartado a) | 4 de 10 |
| 11 | **reducir un argumento grande al periodo** | 8 de 10 |
| 11 | **el cálculo de los coeficientes**, hecho una vez entero | 9 de 10 |

Los dos últimos son los que más duelen: los pedían ocho y nueve de cada diez
exámenes, y la prosa despachaba el primero en una frase y no hacía el segundo ni
una vez. **Un tema puede tener todos los conceptos y aun así no enseñar a hacer
el ejercicio.**

Todo comprobado por dos caminos antes de escribirlo, incluidas las cinco
reducciones al periodo de 2023-2024 y 2024-2025 y la solución `y = e^{2t}` de la
ecuación con coeficientes variables.

**Lo que queda dicho**, para no dar la cosa por más cerrada de lo que está: los
dos temas siguen sin ejercicio propio para los apartados nuevos salvo dos
ejemplos introductorios —el del escalón y el de ampliar y reducir—. Y el tema
más flaco del sitio pasa a ser el 8, con 1 119 palabras y una figura.

**41 · El guardián del `viewBox` no ve a través de un `transform`.** Descubierta
el 26 de agosto de 2026, construyendo la figura de los seis mapas de curvas de
nivel de 2018-2019.

La primera versión colocaba cada uno de los seis paneles con un
`<g transform="translate(dx dy)">`, que es la forma natural de repetir un dibujo
seis veces. `humo.mjs` la declaró rota: siete etiquetas fuera del `viewBox`,
todas «20 px por arriba». Ninguna lo estaba.

El motivo es que `getBBox()` devuelve la caja en el **sistema de coordenadas
local** del elemento, sin aplicar los `transform` de sus padres, y el guardián la
compara con el `viewBox` de la raíz. Con un `translate` de por medio compara dos
sistemas distintos.

La figura se rehízo con coordenadas absolutas y sin `transform`, que además deja
el SVG más plano y más fácil de leer. Se elige esa salida y no tocar el guardián
por §13.4: cambiar la capa compartida para acomodar un contenido concreto es
justo lo que la regla prohíbe, y el arreglo de verdad —`getScreenCTM()`, o
comparar contra la caja del `<svg>` en píxeles de pantalla— hay que hacerlo una
vez, bien, y validarlo al revés como pide §11.

**Lo incómodo, y por eso queda escrito.** El fallo de la figura nueva era un
falso **positivo**, que es la dirección segura. Pero la misma ceguera da falsos
**negativos**, y ya hay contenido publicado donde puede estar dándolos: en las
179 figuras del contenido de Cálculo quedan **diez** `transform`, contados el 26
de agosto de 2026:

| dónde | qué |
|---|---|
| `t03-funciones-reales` | 2 `translate` que colocan dos paneles |
| `t05-integracion` | 3 `translate`, dos de panel y uno de un dibujo suelto |
| `t10-laplace` | 1 `rotate` sobre un `<text>` escrito en `x="-14"` |
| `2025-2026-2ev` | 4 `rotate` sobre cuadraditos sin texto |

Los cuatro últimos no llevan texto y dan igual. Los seis primeros sí, y el de
`t10` es el caso de libro: su rótulo vive en `x = -14`, fuera del `viewBox` en
coordenadas locales, y solo el `rotate` lo mete dentro. El guardián lo da por
bueno hoy y **no se sabe si es por acierto o por casualidad**. Mientras no se
arregle, esos seis sitios están sin comprobar: las figuras se han mirado a ojo y
se ven bien, que es lo único que se puede afirmar de ellas.
