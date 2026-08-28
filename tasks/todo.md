# Qué queda

Sesión 1 cerrada: cimientos + una página de contenido real. Esto es lo
siguiente, en el orden en que conviene hacerlo.

---

## Bloqueado, esperándote a ti

> **Lo primero, al 26 de agosto de 2026: Cálculo está cerrada contra §15 y la
> siguiente asignatura no se puede abrir.** Álgebra no tiene ni temario oficial
> ni un solo PDF en el repositorio, y §15 prohíbe inventar una lista plausible.
> Hacen falta **dos cosas tuyas**: el temario oficial con su fuente, y el
> volcado de eGela de sus convocatorias. Está escrito entero en la deuda 48, al
> final de este fichero.

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

**26 · ~~Los exámenes globales sin transcribir.~~ Resuelta el 26 de agosto de
2026.** Era la deuda más grande del proyecto y ya no queda nada de ella:
**los 85 cuadernillos del volcado de eGela están transcritos**, y con ellos las
88 convocatorias que contienen.

| convocatoria | en el volcado | transcritas | faltan |
|---|---|---|---|
| 4.ª evaluación | 15 | **15** | 0 |
| 5.ª evaluación | 13 | **13** | 0 |
| ordinaria | 11 | **11** | 0 |
| extraordinaria | 11 | **11** | 0 |
| ordinaria-extraordinaria 2019-2020 | 2 ficheros | **1 convocatoria** | 0 |

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
byte a byte contra el volcado, y los 85 leídos y escritos.

**El último cambió la cuenta, y conviene dejarlo dicho.** Los ficheros
`2019-2020-ord-ext-p1` y `-p2` se contaban como dos convocatorias pendientes.
Al abrirlos resultaron ser **una**: la cabecera dice «CONVOCATORIAS ORDINARIA Y
EXTRAORDINARIA · mayo y junio 2020» y los dos ficheros son el primer y el segundo
cuatrimestral del mismo examen. Un solo juego de trece enunciados para las dos
convocatorias del curso del confinamiento. Se archiva como `2019-2020-ord`, con
el motivo escrito en su `examen.yaml`, y **2019-2020 no tiene extraordinaria
propia**: no es un hueco, es que no existe. Por eso el total del corpus es 88 y
no 89, y este documento decía 89 desde el 25 de agosto.

Con esto **el corpus de exámenes de Cálculo está cerrado**: 425 ejercicios de
examen, 4 255 puntos repartidos, ninguna convocatoria por leer. Todo lo que se
mida a partir de ahora sobre exámenes es definitivo, no provisional — y eso
cambia el estatuto de las rutas: ya no hay «medido sobre lo que llevamos».

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
de fórmulas sin dibujar —el 26 de agosto de 2026 saltó por un `$x\sin x$`
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
Sobre los **425 ejercicios de examen**, que ya son todos (31 con enunciado
demasiado corto para comparar, 378 distintos entre los 394 comparados):

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
| 2 veces | **2019-2020-ord · 2020-2021-1ev** | el arco capaz con el conjugado, del examen global al parcial siguiente |

Treinta instancias de catorce problemas. **Y el detector se queda corto**, con
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

- El ejercicio 3 del primer cuatrimestral de **2012-2013-ext** es «enunciar y
  demostrar el teorema del valor medio (Lagrange)», y el 3 de **2015-2016-ext**
  es «enunciar y demostrar el Teorema de Lagrange (teorema del valor medio)». El
  mismo ejercicio con las dos mitades del nombre cambiadas de orden, tres años
  después. No lo agrupa nadie: son diez palabras, por debajo del umbral con el
  que el detector descarta enunciados demasiado cortos. **Los enunciados de
  demostración son justo los que el detector no puede ver**, porque son los más
  cortos del corpus.

Con esos tres, **treinta y cinco instancias de diecisiete problemas**, y el
número real seguirá siendo mayor: solo se detecta lo que coincide carácter a
carácter.

Y el último grupo, el que entró con la última convocatoria, es el que más dice
para quien prepara la primera evaluación: el **ejercicio 1** del examen global de
mayo-junio de 2020 —el arco capaz de $-\pi/4$ sobre el segmento de $-3i$ a $3i$—
reapareció como **ejercicio 1** de la primera evaluación del 19 de octubre de
2020, palabra por palabra y con el mismo reparto 1/6/3. Cinco meses, y de un
examen global al primer parcial del curso siguiente. Hasta ahora el reciclaje
medido iba del parcial a la global; este va al revés.

Y hay un patrón que ya no parece casualidad: de los catorce grupos que el
detector sí ve, **diez tienen una convocatoria global dentro**. En cinco la
extraordinaria reutiliza un parcial, en tres repite otra extraordinaria, en uno
—2013-2014— repite la ordinaria de su propio curso, y en el último la global
alimenta al parcial del curso siguiente. Las convocatorias globales son el sitio
donde se recicla, en los dos sentidos.

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

**42 · ~~`tasks/todo.md` llevaba veintiún commits partido en dos.~~ Reparada el
26 de agosto de 2026**, el mismo día que se cerró la última extraordinaria.

Lo que había: el fichero eran **1 140 líneas y contenía dos veces las deudas 1 a
30**, una encima de otra. La copia de arriba era la buena y estaba **cortada a
media frase** —dentro de la propia deuda 31, justo donde el texto llevaba un
`$x\sin x$`—; la de abajo era la versión anterior entera, con recuentos
viejos: decía «quedan 17 de 24 exámenes globales» cuando quedaban 2, y
«extraordinaria 11 · 0 transcritas» cuando estaban las once.

De dónde salió, buscado commit a commit: apareció en `16fc833`, la ordinaria de
2018-2019. Antes eran 411 líneas; después, 743 = 332 + 411. Es decir, el script
que la actualizó escribió las primeras 332 líneas de la versión nueva y **le
pegó detrás el fichero viejo completo**. Veintiún commits después seguía igual, y
nadie lo vio porque `verify.mjs` no lee `tasks/` y porque cada edición
posterior usaba `replace()`, que sustituye la **primera** aparición: todas
caían en la copia de arriba y la de abajo se quedaba fósil, publicando números
falsos.

El corte está exactamente donde había LaTeX, así que es §17 otra vez: **una
sustitución con `$` y barra invertida dentro del texto de reemplazo**. En
`String.prototype.replace`, `$` en la cadena de reemplazo es un carácter
especial —`$&`, `$1`, `$'`—, y `$'` significa «todo lo que va después del
trozo sustituido». Eso explica el fichero entero pegado detrás.

La reparación: se conservan las 333 líneas nuevas, se restaura la frase cortada
—la propia deuda dice más abajo que la fórmula era «x·sen x»—, se empalma con la
continuación que había quedado huérfana, y se borran las 324 líneas de la copia
vieja. Quedan 816 líneas, 41 deudas, una sola de cada.

Lo que queda por hacer, y no es de esta deuda: **nada comprueba `docs/` ni
`tasks/`**. Un fichero de prosa duplicado no rompe el build. Si vuelve a pasar,
se sabrá igual de tarde.

**43 · El esquema admite un PDF por convocatoria, y hay una que trae dos.**
Descubierta el 26 de agosto de 2026, al transcribir la última.

`2019-2020-ord` sale de **dos** ficheros —`2019-2020-ord-ext-p1.pdf` y
`-p2.pdf`, el primer y el segundo cuatrimestral del mismo examen— y el campo
`pdf` del esquema es una cadena, no una lista. La convocatoria cita el primero,
así que **los ocho ejercicios del segundo cuatrimestral se publican sin enlace a
su enunciado original**. Medido: de los 85 PDF de `public/examenes/calculo/`,
hay exactamente **uno** que ninguna convocatoria cita, y es ese.

No se arregla tocando `content.config.ts` por un caso: eso es §13.4. Las dos
salidas posibles, y las dos son decisión de diseño, no de contenido:

- que `pdf` admita una lista, y la ficha del examen enlace los cuadernillos que
  haga falta — es la que resuelve el problema de verdad, y solo hay un caso que
  lo pida;
- o partir la convocatoria en dos, una por cuatrimestral, lo que obligaría a
  inventar una clave de convocatoria nueva y a publicar como dos exámenes lo que
  la cabecera llama uno.

Mientras tanto, la `fuente` de cada ejercicio dice de qué cuatrimestral sale,
que es lo único que hoy permite encontrar el fichero.

**44 · ~~Faltaba la ruta de la extraordinaria.~~ Cerrada el 26 de agosto de
2026**, el mismo día que se cerró el corpus, y en ese orden a propósito: §14
manda decidir los bloques contando exámenes, y hasta esa mañana faltaban
convocatorias por leer.

Doce bloques y veintitrés escalones sobre las once convocatorias y sus noventa y
un ejercicios: la ruta más grande de las siete. Enlaza 38 de los 91.

La decisión de diseño que la separa de la ordinaria, y que sale del documento y
no de una preferencia: **la extraordinaria son dos exámenes**, uno por
cuatrimestral, con su hoja y su nota, y quien aprobó un cuatrimestre por
evaluación continua solo hace el otro. Está impreso en tres de los once
cuadernillos. Así que la ruta va partida en dos mitades y avisa desde la primera
línea de que probablemente solo se necesita una — mientras que la de la
ordinaria cubre solo el segundo parcial y remite a las de 1.ª, 2.ª y 3.ª para el
primero.

**Los 81 enlaces de teoría se comprobaron abriendo cada uno**, no leyendo el
href: `verify.mjs` parte los enlaces por `#` y **no valida fragmentos**, así
que un apartado mal escrito habría pasado el suelo en verde. El comprobador está
en el scratchpad —abre la ruta, saca los `a[href*="#"]`, carga cada destino y
busca el id— y de paso se pasó por las otras seis: 496 enlaces con ancla, cero
rotos. **Eso es un guardián que debería estar en `verify.mjs` y no lo está**, y
queda dicho aquí porque §11 pide que una comprobación nueva se añada cuando algo
se ha roto de verdad: se rompió el 23 de agosto, con 58 enlaces, y lo que se
arregló entonces fue el contenido, no el guardián.

**45 · ~~Catorce ejercicios de recuperación que no enlazaba ninguna ruta.~~
Cerrada el 26 de agosto de 2026.**

Lo que había: las cinco recuperaciones de la quinta evaluación —los exámenes que
hasta 2020-2021 venían **dentro** del cuadernillo de la quinta, marcados «sólo
para alumnos con el primer cuatrimestral suspendido»— preguntan temas 1 a 4, o
sea materia de la primera y la segunda evaluación. Sus catorce ejercicios
estaban transcritos y publicados, pero **ninguna de las siete rutas los
enlazaba**: existían en el sitio y no había forma de llegar a ellos estudiando.

Repartidos por escalón según lo que entrenan, no según de qué examen salen:

| ruta | escalón | ejercicios |
|---|---|---|
| 1.ª | cociente · ecuaciones-con-conjugado · la-definicion | 3 |
| 2.ª | inversa · bolzano · implicitas · el-polinomio · los-desarrollos · plantear · leer-la-grafica | 11 |

Y de paso quedó medido lo que enlaza cada ruta, que es el dato que hacía falta
para poder afirmar que no falta nadie: de los **425 ejercicios de examen**, las
siete rutas llevan a **303**. Los 122 restantes son 71 de las ordinarias y 53 de
las extraordinarias —selección declarada en la cabecera de cada ruta— y tres de
temas que su ruta no cubre, ya declarados en el `falta[]` correspondiente: dos
de varias variables en terceras evaluaciones y uno de curvilínea en una cuarta.

El comprobador está en el scratchpad: cruza los `id` que aparecen en
`src/content/preparar/*.yaml` con los de todos los `examen.yaml`. **Eso es
otro guardián que debería vivir en `verify.mjs`** —junto con el de las anclas
de la deuda 44— y hoy no vive.

**46 · ~~Catorce herramientas que el examen usa y la prosa no presentaba.~~
Cerrada el 26 de agosto de 2026**, en la auditoría de §15.

§15 pide que toda herramienta que el examen usa esté en la prosa del tema, y
dice cómo se comprueba: **contando apariciones**. Se contó. El procedimiento y
la lista completa están en `docs/como-vamos.md`; aquí queda lo que hay que
recordar para la próxima vez.

**Las tres que eran huecos de verdad**, no de vocabulario:

- **La integración numérica no existía en el tema 5.** Ni punto medio, ni
  trapecio, ni Simpson: la palabra «numérica» no aparecía. Y el examen de junio
  de 2013 pide literalmente «aproximar la integral empleando la regla del punto
  medio usando cuatro subintervalos». Ahora hay apartado propio, con la
  comparación de errores —el punto medio se equivoca la mitad que el trapecio, y
  con signo contrario— y con el cambio de variable que acota un intervalo
  infinito, que es el paso previo obligatorio.
- **La variación de las constantes no estaba en el tema 9.** El método de
  coeficientes indeterminados sí, sin su nombre; el otro, ni descrito ni
  nombrado. Cinco ejercicios lo usan.
- **La regla de la cadena no aparecía ni una vez en el tema 6.** Es la
  herramienta que convierte «la temperatura depende del sitio y el sitio del
  tiempo» en una cuenta, y sin ella la derivación implícita queda como una
  fórmula caída del cielo.

**Y once que eran de vocabulario**, que no es menos grave de lo que parece: un
alumno que lee en una resolución «hay resonancia» y busca la palabra en su tema
no la encontraba. Concavidad —que ocho enunciados dicen con esas letras—,
circulación, resonancia, resto de Lagrange, Leibniz, coeficientes
indeterminados, momento de inercia, espectro, diferencial total, L'Hôpital y
Darboux.

**Lo que el auditor enseñó sobre sí mismo, y es la parte que hay que conservar.**
La primera pasada dio veintiuna herramientas ausentes y **dos eran falsas**:

- «punto medio» salía en cuarenta exámenes, y en treinta y nueve era el punto
  medio de un segmento;
- «delta» salía en cinco, y en los cinco era `Delta`, un incremento.

Un buscador de subcadenas no distingue significados. **Regla: una auditoría
automática se verifica a mano antes de publicar su recuento**, y se distingue si
el término lo dice el enunciado o solo nuestra resolución — no es lo mismo que
falte una palabra del profesor que una nuestra.

El auditor está en el scratchpad y **también debería estar en `verify.mjs`**,
como los de las deudas 44 y 45. Son ya tres comprobadores que existen y no
guardan nada: eso, junto, es la deuda que queda abierta de esta tanda.

**47 · ~~Tres comprobadores que vivían en el scratchpad.~~ Resueltos dos de
tres el 26 de agosto de 2026, y el tercero rechazado a propósito.**

Las deudas 44, 45 y 46 dejaron cada una un comprobador fuera del repositorio.
La pregunta de §11 no es «¿se pueden automatizar?» sino «¿merecen quedarse?», y
la respuesta fue distinta para cada uno.

**Dentro · las anclas entre páginas.** `verify.mjs` partía los `href` por
`#` y tiraba el fragmento, así que un enlace con destino válido y ancla
inventada pasaba en verde. Ahora se comprueba que el id existe en la página de
destino: **602 anclas, todas aterrizan**.

Y aquí está lo que hay que recordar: **la primera versión no saltaba**. Al
validarla al revés —romper un ancla a mano en el HTML publicado y esperar que se
pusiera roja— siguió verde. El motivo era `candidatos.find(existsSync)`, que
devuelve el **directorio** `dist/calculo/t01-complejos` porque existe, y con
esa clave el mapa de ids no encontraba nada y la comprobación se saltaba en
silencio. Si no se hubiera validado al revés, hoy habría en el suelo un guardián
que solo sirve para dar confianza. Está escrito en el propio comentario del
código.

**Dentro · las convocatorias huérfanas.** No exige que todos los ejercicios
estén enlazados —una ruta es una selección— sino que **ninguna convocatoria
entera se quede sin una sola ruta que lleve a ella**. Se estrenó encontrando
tres: 2013-2014-ext, 2017-2018-ord y 2019-2020-ord, sin un solo ejercicio en
ninguna de las siete rutas. Enganchadas en el mismo commit; ahora 88 de 88.

**Fuera · la auditoría de herramientas.** Es la que más ha rendido —catorce
huecos de prosa— y aun así **no entra**. De sus veintiún hallazgos, dos eran
falsos, y no por un bug: porque «punto medio» y «delta» significan cosas
distintas en sitios distintos y un buscador de subcadenas no lo sabe. Un
guardián que grita sin fallo enseña a saltarse los guardianes, y ese es el daño
de verdad (§11). Se queda como **auditoría periódica**, que se pasa a mano
cuando entra material nuevo y se lee con criterio. El script está en el
scratchpad de la sesión del 26 de agosto de 2026 y su lista de términos está
transcrita en `docs/como-vamos.md`.

---

**48 · Álgebra no se puede abrir: no hay material.**

§00 dice que después de Cálculo va Álgebra, y Cálculo ya cumple §15 entera. Pero
en el repositorio **no hay nada de Álgebra**: `catalogo/algebra.json` tiene
`temarioOficial: false` y `temas: []`, y `public/examenes/` solo tiene la
carpeta de Cálculo.

Y §15 no deja fingir: «los temas del catálogo son el temario oficial, no una
lista plausible. Con su fuente. Si no la tienes, el catálogo dice `prev` y no
finge». §13 lo repite por el otro lado: inventar un enunciado que no se ha leído
es el peor fallo posible aquí, y es el más cómodo, porque sale plausible.

Así que esto no es trabajo pendiente: es un **bloqueo**, y lo que hace falta es
material que no está en el repositorio.

| qué hace falta | para qué |
|---|---|
| el temario oficial de Álgebra, con su fuente | poner `temarioOficial: true` y llenar `temas[]` |
| el volcado de eGela de sus convocatorias, en PDF | transcribir exámenes, que es de donde salen las rutas |

Mientras no estén las dos cosas, el catálogo se queda en `prev` —que es lo
correcto y lo que ya dice— y no se escribe ni un tema. Con ellas, el camino es
el mismo que se ha recorrido con Cálculo, y ahora está documentado de principio
a fin.

**Y una cosa que sí se puede adelantar sin material**, si hiciera falta llenar
el hueco: separar el lector de respuestas de `EjercicioGuiado`. Una **matriz**
no es un número ni un conjunto de puntos, y es por donde Álgebra va a tensionar
el sistema — está dicho en §00 y en la deuda de arquitectura correspondiente.
Eso es refactor de la capa compartida y se puede hacer sin un solo enunciado.

**48 · ~~Empujé con el suelo en rojo.~~ Arreglado el 27 de agosto de 2026, y la
parte que importa no es el arreglo.**

Al publicar la extraordinaria de 2023-2024 de Álgebra, `npm run suelo` imprimió

```
✗ a 360 px, las resoluciones de examen abiertas no desbordan (6 páginas)
  2023-2024-ext → 423px
1 fallo(s) en navegador. El despliegue se queda parado.
```

y **empujé igualmente**. No fue que el guardián fallara: funcionó, dijo
exactamente qué página y cuántos píxeles, y yo leí la salida por encima
buscando la palabra «verde» en vez de la palabra «fallo». El commit `8c3fb2f`
salió con el suelo rojo. §12 dice que el despliegue va detrás de `verify.mjs`,
y aquí el orden se saltó a mano.

**Regla que queda: el suelo no se lee en diagonal.** Antes de un commit se
comprueba que aparecen las dos líneas —`Suelo de calidad: en verde.` **y**
`Navegador: en verde.`—, y si falta una, no hay commit. Ausencia de «verde» no
es lo mismo que presencia de «rojo», y buscar solo lo segundo es lo que pasó.

Lo que había debajo, ya que estaba: **ninguna fórmula de bloque del sitio podía
desplazarse**. No hay una sola regla de `overflow` en `src/styles/`, así que una
fórmula ancha empujaba el documento entero de lado. En Cálculo no había saltado
nunca porque ninguna llegaba a 360 px; Álgebra escribe matrices y lo choca a la
primera. Se arregla en `base.css` —capa compartida, y a propósito: no es un
contenido, es todo el que venga— con `overflow-x: auto` sobre `.katex-display`,
más el `overflow-y: hidden` que evita que el navegador recorte los límites por
arriba. Y en el contenido, la fórmula del conjunto de traza nula pasa de línea a
bloque, porque una fórmula **en línea** no se desplaza por mucha regla que haya.

Medido: el documento pasa de 426 px de ancho a 360 clavados.

---

# Álgebra · el plan, en ocho fases

Escrito el 26 de agosto de 2026, con el material medido y antes de crear ningún
fichero de contenido (§13). Las fases van en este orden por dos reglas de
`CLAUDE.md`, y ninguna de las dos es el orden del temario:

- **§13 · empieza por el caso difícil.** El primer examen entero va antes que
  nada, porque es el que dice qué necesita el lector de respuestas. Un
  componente probado primero con el ejercicio cómodo genera la abstracción
  equivocada.
- **§13 · el framework se destila del contenido.** El lector de matrices no se
  diseña en el vacío: se diseña con cuatro ejercicios reales delante.

**La escala, medida sobre el material y no estimada:**

| | Álgebra | Cálculo, para comparar |
|---|---|---|
| ejercicios de examen | **32** (8 exámenes × 4) | 425 |
| ejercicios de boletín disponibles | **212** en 7 boletines | — |
| páginas de teoría | **141** | — |
| temas | **7** | 11 |
| rutas que pide §15 | **2** | 7 |

## Fase 1 · El primer examen, entero

La ordinaria de 2024-2025. Cuatro ejercicios, y el primero es el caso difícil
que §13 pide coger antes que ninguno: «definir $S+T$ y demostrar que es
subespacio», y después una base de $mathbb{R}^4$ con un parámetro dentro.

**Lo que esta fase tiene que producir además del examen:** la lista de qué
tipos de respuesta hace falta saber leer. Hoy el esquema tiene `numero`,
`complejo` y `conjunto`, y ninguno vale para una base.

## Fase 2 · El lector de respuestas (deuda 4)

Lo que la fase 1 haya destapado. Previsiblemente: una **base** —un conjunto de
vectores, donde el orden no importa y dos bases distintas del mismo subespacio
son las dos correctas—, una **matriz**, y un **subespacio** dado por ecuaciones.

Va en `src/lib/`, con sus tests en `tests/` como los de complejos y regiones,
y toca la capa compartida: es §13.4, y se hace **una vez y bien**, no con un
apaño en el contenido.

## ~~Fase 3 · Los siete exámenes que quedan~~ · TERMINADA el 27 de agosto de 2026

2021-2022, 2022-2023 y 2023-2024, ordinaria y extraordinaria, más la
extraordinaria de 2024-2025. Veintiocho ejercicios. Con el lector ya hecho,
esta fase era transcripción y comprobación numérica, que es trabajo conocido.

**Están los ocho.** 32 ejercicios y 140 pasos: 32 `reconocer`, 76 `calcular` y
32 `justificar`. El guardián de convocatorias huérfanas de `verify.mjs` ya las
ve las ocho, y las cuenta aparte porque Álgebra todavía no tiene ruta.

**Lo que la fase ha medido, y que la fase 7 no tendrá que estimar:** tres de
los cuatro huecos del examen son fijos las ocho veces —el 1 es espacios
vectoriales, el 2 aplicaciones lineales, el 4 diagonalización— y solo el 3
rota, entre euclídeos (4 veces) y determinantes (4).

> Esa última cifra decía «euclídeos 4, matrices 2, determinantes 2» hasta el 27
> de agosto de 2026, y era falsa: los dos ejercicios que había etiquetado como
> matrices son **inversas de matrices con parámetro**, y el temario oficial
> pone la inversa y el rango en Determinantes, apartados 4 y 5. La hoja de
> Matrices no las menciona. Salió al leer el temario para escribir el tema 3.

**Y hay DOS temas que no ocupan ningún hueco: el 3 y el 5.** Cero de treinta y
dos cada uno. Las matrices y los sistemas aparecen dentro de casi todos los
ejercicios —un núcleo es un sistema, la matriz asociada está en todas partes—
pero nunca como el ejercicio. En la ruta eso los coloca como **suelo**, no como
bloques de rendimiento.

Tres cosas que la fase ha ido enseñando y conviene no perder:

- **Las tablas de la resolución no admiten `\left|`.** La barra parte la celda
  antes de que KaTeX vea nada, y el build **no lo caza** porque el YAML y el
  esquema son válidos: sale una tabla con columnas de más y nadie avisa. Se
  escribe `\lvert` y `\rvert`, que no llevan el carácter dentro. Salió en el
  ejercicio 3 de la ordinaria de 2022-2023, que pide cinco determinantes y la
  notación natural es justo esa.
- **Los enunciados vienen en castellano y euskera en el mismo cuadernillo.** Es
  el mismo examen dos veces; se transcribe una, desde la versión castellana, y
  el `examen.yaml` lo deja dicho para que nadie los cuente como dos. Ojo al
  orden: en 2021-2022 el euskera va **primero**, y de 2022-2023 en adelante,
  segundo.
- **Los enunciados se repiten entre convocatorias más de lo que parecía.** El
  4a, «el polinomio característico no varía al cambiar de base», sale **tres
  veces** de ocho; «la expresión de una combinación lineal es única», dos; y el
  2a de la extraordinaria de 2021-2022 es literalmente el de la de 2022-2023.
  Está anotado en cada `fuente`, y para la ruta es información de primera: un
  enunciado que sale tres veces de ocho es un bloque, no una anécdota.

## Fases 4, 5 y 6 · Los siete temas

La fase más grande, y por eso va partida en tres. Cada tema necesita prosa que
responda a preguntas, ejemplos introductorios propios (§08), al menos una figura
que responda a una pregunta (§13) y ejercicios del boletín.

- **~~Fase 4 · temas 1 y 2~~**, espacios vectoriales y aplicaciones lineales.
  **TERMINADA el 27 de agosto de 2026.** Iban primero porque son los ejercicios
  1 y 2 de los ocho exámenes, sin excepción. 5.193 palabras de prosa entre los
  dos, 4 figuras, 12 ejercicios —6 de ellos ejemplos de entrada nuestros— y 45
  pasos guiados. Las cifras exactas por tema están en `docs/como-vamos.md`.
- **~~Fase 5 · temas 3, 4 y 5~~**, matrices, determinantes y sistemas.
  **TERMINADA el 27 de agosto de 2026.** Son el aparato de cálculo que los
  otros cuatro usan. Los tres son más cortos a propósito: ni el 3 ni el 5
  ocupan un hueco del examen, y el 4 solo la mitad de los suyos. Las cifras,
  medidas, en `docs/como-vamos.md`.

  Y dejó **el guardián de figuras arreglado por dos sitios**, los dos
  encontrados mirando capturas:
  1. Solo miraba los `<text>`, así que dos rectángulos del árbol de Rouché se
     salían 8 px y el suelo daba verde. Ampliado a `rect`, `circle` y `line`;
     `path` se queda fuera a propósito, y el motivo está medido en el código.
  2. Usaba `getBBox()` a secas, que **ignora las transformaciones de los
     antepasados**. Eso daba un falso positivo —la arandela del tema 5 de
     Cálculo— y, peor, el falso negativo simétrico: había **dos** etiquetas de
     Cálculo recortadas desde hacía semanas, «no llega» en Weierstrass y «el
     camino difícil» en Laplace, y el guardián no las veía porque vivían
     dentro de un `translate`. Corregido componiendo con la matriz del `<svg>`,
     y validado al revés.
- **~~Fase 6 · temas 6 y 7~~**, euclídeos y diagonalización, que cierran el
  examen. **TERMINADA el 27 de agosto de 2026.** Con ella, **los siete temas de
  Álgebra están escritos**: 13.343 palabras de prosa, 9 figuras, 35 ejercicios
  —19 de ellos ejemplos de entrada nuestros— y 142 pasos guiados.

  Y volvió a saltar la trampa de §17 del `: ` sin comillas, esta vez en un
  `titulo` —«Para qué sirve: una potencia grande…»—. El build **sí** la caza,
  con un error que apunta a la línea correcta; el aviso queda porque es la
  segunda vez en el proyecto y seguirá pasando cada vez que un título lleve dos
  puntos.

**Lo que la fase 4 ha enseñado, y que las dos siguientes heredan:**

- **La ruta `[tema].astro` llevaba `calculo` y `fluidos` escritos a fuego.** Con
  un tema de Álgebra escrito, el build **no falló**: se saltó la asignatura en
  silencio y la página no se publicó. Es la misma forma exacta del fallo que
  tenía el guardián de convocatorias huérfanas de `verify.mjs`, y van dos. La
  lección no es «arregla el `if`»: es que **una lista de asignaturas escrita
  dentro de una condición no falla, se salta**. Cuando aparezca una tercera,
  buscarla por ahí.
- **`base.css` no decía nada sobre las tablas**, y el sitio llevaba cinco temas
  y ochenta y ocho exámenes usándolas. Se descubrió mirando una captura, no con
  un guardián.
- **Los boletines caen en la trampa de §17**: están compuestos con el editor de
  ecuaciones de Word, y `pdftotext` se come flechas, igualdades y pertenencias.
  Los enunciados del boletín se leen de la página renderizada, como los
  exámenes.
- **Una figura que enseña un caso imposible «a propósito» es una trampa, no una
  lección.** Escribí la del teorema de las dimensiones representando algo que no
  puede pasar, con el pie diciendo «el dibujo miente». Quien pasa la vista por
  encima se lleva lo contrario de lo que hay que aprender. Rehecha con un caso
  real. **Regla: una figura de este sitio nunca representa algo falso, ni
  aunque lo confiese.**
- **Ningún recuento entra en un mensaje de commit sin haber LEÍDO antes la
  salida del comando que lo cuenta.** Ha pasado **dos veces** el mismo día: el
  tema 2 se publicó como «2.900 palabras» siendo 2.255, y los temas 3 y 4 como
  «1.234 y 1.322» siendo 1.750 y 1.676. Las dos veces el `wc` estaba en el
  mismo comando que el commit, y las dos veces escribí el mensaje antes de ver
  el resultado. **Medir y escribir en el mismo comando no es medir: es
  adivinar y comprobar después, cuando ya está empujado.** Si al redactar el
  mensaje no tienes el número delante, no lo pongas — enlaza a
  `docs/como-vamos.md`, que sí se mide.

## ~~Fase 7 · Las dos rutas~~ · TERMINADA el 27 de agosto de 2026

Dos rutas, 6 bloques y 17 escalones cada una, `medidoSobre: 8`, y sin un solo
porcentaje por competencia porque el examen no publica reparto de puntos.

**El hallazgo que las ordena, y que no era evidente antes de contar:** el hueco
3 del examen **no rota** entre euclídeos y determinantes. Está **partido por
convocatoria**: euclídeos en las cuatro ordinarias, determinantes en las cuatro
extraordinarias, sin una excepción. Los otros tres huecos son idénticos en las
ocho. Así que las dos rutas se diferencian en **un bloque y solo uno**, y eso es
un dato, no una decisión de diseño.

Lo que dejó por el camino:

- **El esquema no admitía la `ö` de Rouché-Fröbenius.** La alternativa era
  escribir el nombre mal para que pasara, que es «escribir peor para contentar a
  un guardián» (§11). Ampliada la clase de caracteres del slug, con el motivo en
  el propio `content.config.ts`.
- **Dos encabezados del tema 1 llevaban LaTeX y producían slugs sucios** —
  `generar-qué-significa-lglleftgrightlg` y
  `suma-e-intersección-por-qué-222222-no-da-444`—. Reescritos en palabras. Es la
  trampa de §17 que el plan viejo ya había anotado para Cálculo.
- **La trampa del `: ` sin comillas, por tercera vez el mismo día**, ahora en el
  título de un escalón.
- **Comprobado que las 97 anclas de teoría ATERRIZAN**, no solo que existan
  (§16.2): 50 en la ordinaria y 47 en la extraordinaria. La sonda tuvo dos
  rondas de falsos negativos antes de dar el número bueno —desplazamiento suave
  la primera, y navegar entre dos fragmentos de la misma página sin recargar la
  segunda—, y las dos veces el fallo estaba en la sonda y no en el sitio.

## Fase 7 · Las dos rutas

Ordinaria y extraordinaria, medidas sobre ocho convocatorias y diciéndolo. Y
aquí hay una diferencia con Cálculo que ya se sabe: **los exámenes no publican
puntos**, así que la ruta no podrá calcular porcentajes por competencia. Se
declara, no se estima.

## ~~Fase 8 · Auditoría §15 y cierre~~ · TERMINADA el 27 de agosto de 2026

**Álgebra cumple §15 entera y está en el catálogo como `ok`.** Es la segunda
asignatura terminada. Las once filas, medidas con un script sobre los ficheros
y no leídas por encima, están en `docs/como-vamos.md`.

La auditoría encontró **tres ejercicios sin enlazar desde ninguna ruta** —dos
del examen y uno nuestro—, que es exactamente el tipo de hueco que solo aparece
contando. Colocados en su escalón.

**Y una fila que Álgebra no puede cumplir, y no es un hueco nuestro:** §15 pide
transcribir cada convocatoria «con su reparto por competencia», y **ninguno de
los ocho cuadernillos lo publica**. Está declarado en los ocho `examen.yaml`, la
ficha no imprime «0 puntos» y las rutas no publican porcentajes. §10: un dato
que no existe no se estima. Si algún día §15 se reescribe, esa fila debería
decir «con su reparto por competencia **cuando el cuadernillo lo publique**».

**El script de auditoría vive en el scratchpad y no en el repositorio**, igual
que los tres de la deuda 47. Van cuatro. La pregunta de §11 no es «¿se puede
automatizar?» sino «¿merece quedarse?», y este mide cosas que solo cambian al
cerrar una asignatura: correrlo en cada build sería ruido. Pero la próxima vez
que se cierre una asignatura habrá que reescribirlo, y eso es una deuda.

---

## Lo siguiente, ya sin Álgebra

Con Cálculo y Álgebra cerradas, §00 dice que toca la tercera. Y el criterio de
§00 no es «la que toque en el temario» sino **la que tensione el sistema por un
sitio distinto**. Lo que está dicho y medido:

- **Fluidos son 25 temas**, la asignatura más cara de las nueve, y tensiona por
  las **unidades** —que el esquema todavía no tiene— y por las **figuras de
  terceros**, que hay que redibujar.
- El **lector de respuestas sigue dentro de `EjercicioGuiado`**. Álgebra lo
  estiró con `vector` y `matriz`; una asignatura con unidades lo va a romper por
  otro sitio, y esa es la deuda de arquitectura que sigue abierta.

La misma que cerró Cálculo: contar qué herramienta usa el examen y no está en
la prosa, comprobar que ninguna convocatoria se queda sin ruta, y pasar la
tabla de §15 entera.

**Lo que NO está en el plan, y hay que decirlo:** Álgebra tiene solo cuatro
cursos de exámenes y ningún parcial. Las rutas se medirán sobre ocho
convocatorias en vez de sobre ochenta y ocho, y eso limita lo que se puede
afirmar sobre «qué cae siempre». Con ocho, un hueco que aparece en seis puede
ser una costumbre o puede ser casualidad, y la ruta tendrá que decirlo con esas
palabras.

---

# La auditoría completa de Cálculo · 28 de agosto de 2026

Hecha el mismo día de cerrar la asignatura, y **después** de que §15 diera sus
once filas en verde. Ese es el punto: §15 en verde no dice que esté bien, dice
que no está roto. Lo que sigue son las nueve cosas que encontró una auditoría
que no se limita a esas once filas, ordenadas por lo que le cuestan a quien
estudia.

## Lo que se arregló el mismo día

**Cinco datos publicados que no eran ciertos.** Los cinco se corrigieron en el
sitio, contando sobre el corpus, y cada uno lleva su nota diciendo qué decía
antes:

| dónde | decía | dice |
|---|---|---|
| `4ev` · bloque `gradiente` | cae en **11** de 11 cursos | **10**: 2020-2021 no lleva varias variables, y su propio `fuente` ya lo decía |
| `ord` · bloque `edo` | **seis** convocatorias | **siete**: se dejaba fuera 2019-2020, que trae dos |
| `ord` · bloque `cruce` | **siete** ejercicios en **seis** convocatorias | **nueve** en nueve; faltaban el gradiente implícito de 2020-2021 y el integrando constante de 2019-2020 |
| `ord` · `lede` | los dos parciales, «cuarenta puntos cada uno» | entre 30 y 50; solo 3 de 12 cursos son 40+40 |
| `5ev` | la quinta de 2019-2020 «no se celebró» | no lo sabemos: es una lectura de las fechas, y ahora lo dice así |

Los tres primeros tienen la **misma causa** que los 116 ejercicios sin enlazar:
se contó a ojo sobre una lista incompleta. La lección no es «revisar mejor», es
que **todo recuento publicado tiene que salir de un guion que lea el corpus**.

**Dos herramientas que el examen usa con un nombre y la prosa con otro.**
`variación de parámetros` (la prosa decía solo «variación de las constantes») y
`centroide` (t07 decía solo «centro de gravedad»). Las dos, nombradas ahora en
su apartado.

**El criterio del cociente, que no estaba en ninguna prosa.** Lo usan cinco
convocatorias. Y el agujero era peor de lo que parecía: t04 decía «**el radio de
convergencia forma parte de la respuesta**» y el sitio **no enseñaba a
calcular ninguno**. Escrito ahora en t04, con su error típico —el caso $L=1$, que
es justo lo que pasa en los extremos— y enlazado desde t02.

## Lo que queda, medido y sin arreglar

### 1 · 417 de 425 resoluciones de examen están sin contrastar

El 98 %. Sus `fuente` lo dicen una por una —«el examen no publica solución: la
resolución es propuesta nuestra, pendiente de revisión»—, así que es honesto,
no oculto. Pero es **el mayor riesgo del proyecto** y no tiene plan.

Solo 8 se pueden contrastar hoy, porque coinciden con ejercicios del boletín que
sí publica solución. Una de ellas encontró **una errata en la hoja oficial**, lo
que da la medida de por qué esto importa.

Lo que hace falta no es más contenido: es un procedimiento de verificación.

### 2 · 42 de 156 escalones arrancan en un ejercicio de examen

> **Esta sección decía 66 y el reparto por tema estaba al revés.** La primera
> medición se hizo con el campo `nivel` incompleto: 244 ejercicios no lo
> llevaban, y 34 del boletín estaban etiquetados `examen` cuando son
> `practica`. Con el campo completo —hecho el 28 de agosto de 2026— el número
> baja a **42 de 156 (27 %)** y, sobre todo, **señala a otros temas**. Se deja
> escrito porque la lección es la de siempre: un recuento sobre datos
> incompletos no es un recuento, es una impresión con cifras.

El 27 %. Es la crítica que creó el escalón el 23 de agosto —«el primer
ejercicio de cualquier bloque ya era de nivel examen»— viva todavía en uno de
cada cuatro. Por tema, medido con el campo ya completo:

| tema | escalones | sin rampa | ejemplos propios | ejercicios propios / de examen | % de la nota |
|---|---|---|---|---|---|
| t04 estudio local | 25 | **12 (48 %)** | 5 | 18 / 85 | **20,2** |
| t03 funciones reales | 14 | **6 (43 %)** | 5 | 23 / 21 | 4,9 |
| t05 integración | 17 | **7 (41 %)** | 4 | 30 / 49 | 11,5 |
| t06 varias variables | 12 | 3 (25 %) | 4 | 12 / 20 | 4,6 |
| t01 complejos | 24 | 5 (21 %) | 8 | 37 / 74 | 17,4 |
| t08 · t09 · t10 | 31 | 2 cada uno | 2 · 2 · 3 | — | 20,2 |
| t11 fourier | 8 | **0** | 3 | 9 / 17 | 4,0 |

Y la conclusión se da la vuelta: **el agujero está en el primer cuatrimestre,
no en el segundo.** t04 concentra 12 de los 42 y es el tema que **más vale de
la asignatura**; con t03 y t05 suman 25 de 42. Los tres temas flacos —t08, t09,
t10— tienen dos cada uno, y Fourier ninguno.

**Y hay que decir de dónde salen.** De los 42, unos 28 están en los bloques del
primer parcial de la ordinaria y la extraordinaria, **escritos el 27 de agosto
de 2026**: se enlazaron ejercicios de examen sin poner un ejemplo delante. No
es deuda heredada, es deuda del día anterior.

La regla de §14 no admite matices: si el primer ejercicio de un escalón no lo
puede hacer alguien que acaba de leer la teoría, **falta un ejemplo delante**.

### 3 · 32 pasos piden decimales sin ofrecer la forma exacta

§09 dice que un enunciado nunca ordena dar decimales: se escribe «en forma
exacta, o con cuatro decimales», en ese orden, porque en el examen no hay
calculadora. Treinta y dos pasos dicen «Da cuatro decimales» y su `formato` dice
solo «un número». Varios piden decimales de respuestas que son $\pi$, $\ln 2$ o
$\pi/4$.

Y hay algo más de fondo, que es §01: **la instrucción de formato está duplicada
en dos sitios** —dentro de la `pregunta` y en el campo `formato`— y por eso se
desincroniza. El arreglo bueno no es tocar 32 preguntas: es que la instrucción
viva **solo** en `formato`, que es el campo que existe para eso, y quitarla de
la prosa de la pregunta.

### 4 · El navegador solo abre 8 de las 96 páginas de examen

`humo.mjs` abre las 35 páginas que enlaza la portada: los 18 temas, las 9 rutas
y **8 exámenes**. Los otros 88 solo los mira `verify.mjs`, que lee el HTML. §11
existe porque eso no basta: los tres fallos de agosto —la raíz sin radical, las
pestañas sin manejador— eran invisibles al HTML.

Es la superficie más grande del sitio y la menos comprobada.

### 5 · Ocho escalones con un solo ejercicio

`2ev/derivada-aplicada/diferencial` · `5ev/curvilinea/escalar` ·
`5ev/edos/cualitativo` · `5ev/formato-antiguo/gradiente-en-la-quinta` ·
`ext/los-teoremas/fermat` · `ext/los-teoremas/definiciones-de-sucesiones` ·
`ext/laplace/el-arranque-retrasado` · `ext/el-gradiente/leer-un-mapa-de-niveles`.

Un escalón con un ejercicio no es una escalera. La ruta de la quinta ya lo
declara para uno de ellos, con estas palabras: «Quien llegue sin haberla visto
empieza por arriba».

### 6 · 46 de 62 bloques no declaran nada en `falta[]`

§14 dice que un hueco declarado es información y uno escondido es una promesa
incumplida. Tres cuartas partes de los bloques no declaran ninguno. No significa
que no tengan —el punto 2 demuestra que sí—, significa que no se ha mirado.

## Lo que se comprobó y está bien

Para que la lista de arriba se pueda leer en proporción:

- **Ningún `anios` declarado es imposible** contra el corpus, después de las
  correcciones. El guion que lo comprueba queda escrito.
- **Cero enunciados duplicados por accidente.** Los cinco pares que aparecen
  están documentados: o son el mismo ejercicio del boletín que cayó en examen
  —y su `fuente` lo dice— o es el mismo enunciado repetido en tres años, que es
  §08 funcionando.
- **Cero ejercicios sin distractor** y **cero resoluciones cortas**: la más
  breve de las 425 pasa de 400 caracteres.
- **Los repartos por competencia cuadran** con lo impreso en cada cuadernillo,
  incluidos los tres de 90 puntos y el de 130, que están explicados en el
  comentario de su `examen.yaml`.
- **42,7 % de la nota no es cálculo**, contado sobre 4.255 puntos.

---

# Careo de dos auditorías · 28 de agosto de 2026

El mismo día se pasaron **dos** auditorías a Cálculo, hechas por separado. Una
—la de arriba— miró la estructura: recuentos, enlaces, rampas, terminología,
integridad. La otra recalculó **las matemáticas** con SymPy sobre los 182
ejercicios de tema y 162 de examen. Conviene dejar por escrito qué encontró
cada una y qué pasó al comprobarlas, porque la lección no está en ninguna de
las dos por separado.

## Lo primero, y es lo importante

**La auditoría estructural no comprobó ni una cuenta.** Ese es su fallo de
diseño, no un descuido: miró si los datos cuadran entre sí y nunca si son
verdad. Por eso pasó por encima de ocho ejercicios que enseñan algo falso, que
es exactamente la clase que §13 caso 2 llama «el peor fallo posible».

Peor todavía: el 27 de agosto **se enlazó `sistema-que-sale-en-espiral` en la
ruta de la ordinaria sin comprobar su resultado**, y tiene el signo cambiado en
tres sitios. Enlazar es publicar.

## Lo confirmado, comprobándolo a mano

| | qué | cómo se comprobó |
|---|---|---|
| **B3** | `sistema-que-sale-en-espiral` da $y=+e^{t}\operatorname{sen}2t$ y es $-$ | El propio ejercicio saca $Y=\frac{-2}{(s-1)^2+4}$; sustituyendo en $y'=-2x+y$, el signo positivo no la cumple |
| **B5** | Apolonio con la relación invertida | $\lvert z\rvert=2\lvert z-3\rvert$ es el doble de lejos del origen que de 3; la frase siguiente ya lo decía: «dista 2 del origen y 1 del 3» |
| **B6** | contraejemplo del satélite | $10=9+a^2\Rightarrow a=\pm1$: dos tangentes, y el punto está fuera |
| **B8** | dos valores que su desarrollo desmiente | $y(1)=0{,}4286498$ y $f(1)=0{,}1870027$, calculados |
| **M1** | el peso del catálogo invierte la escala | t03 (4,9 %) y t06 (4,6 %) en «alto», t10 (5,6 %) en «medio» |
| **D1** | 101 ejercicios sin `nivel` | exactamente 29+15+18+13+26, todos en t01–t05 |
| **M2** | los recuentos de CLAUDE.md | 5 temas → 11, 12.644 palabras → 31.382, 1.022 pasos → 2.631 |

Y un tercer error en la figura de Apolonio que no vio ninguna de las dos: el
`<desc>` decía que la circunferencia «no encierra a ninguno de los dos puntos»
y con centro 4 y radio 2 **encierra el 3**. Eso es lo que oye quien usa lector
de pantalla.

## Lo que no se sostuvo

- **«`npm run suelo` está en rojo».** No lo está. Cuatro ejecuciones el mismo
  día, la última capturada entera: las dos líneas en verde, cero `✗`, exit 0.
  Medida directa de esa etiqueta en el navegador: arranca en 25 y acaba en
  **310,2** dentro de un viewBox de 330; sin la tipografía del sitio, 286. La
  captura que aporta es real, así que en su entorno el texto se renderizó ~10 %
  más ancho. **Lección: una medida de anchura de texto no es reproducible entre
  entornos, y un informe que la use tiene que decir con qué fuente midió.**
- **«Cero enunciados ordenan dar decimales sin ofrecer la forma exacta».** Hay
  32. Se le escapan porque la frase va **partida entre dos líneas** dentro del
  bloque YAML: un `grep` por líneas no la encuentra y sobre el YAML parseado
  aparece 32 veces. Trampa nueva, anotada en §17.
- **«Rechaza al alumno que teclee bien 0,4286».** No: la diferencia era 0,0003
  y la tolerancia 0,001. El defecto era real —el ejercicio se contradecía a sí
  mismo— pero no suspendía a nadie.

## Lo que se intentó automatizar y no se pudo

Se probaron **dos** guardianes para la clase «un número mal dentro de una
resolución», y los dos se descartaron por §11 —un guardián ruidoso enseña a
saltarse los guardianes—:

1. *¿El `valor` aparece en su propio `desarrollo`?* 323 pasos comparables, **26
   marcados y casi todos falsos**: el desarrollo escribe pasos intermedios, no
   el resultado.
2. *¿Cuadran las cuentas que el desarrollo escribe?* Solo **10** patrones
   comparables en 674 ejercicios, y **8 falsos** porque la expresión regular
   cruza líneas y bloques `$$`.

**Conclusión: esta clase no es barata de mecanizar con texto.** Lo que la caza
es recalcular simbólicamente, que es lo que hizo la otra auditoría. Si esto se
quiere como guardián, el trabajo es exportar las respuestas a un recálculo
—SymPy o equivalente— y no buscar patrones en la prosa.

## Lo que queda abierto de la auditoría matemática

Sin verificar aún, por orden de lo que cuestan:

- **B2** el signo de la serie de Fourier en `la-que-no-tiene-saltos`, en dos
  sitios.
- **B4** el épsilon rechazado en `limite-de-no-negativos` y
  `signos-infinitos-limite-cero`, que contradice la prosa del propio tema.
- **B7** una comprobación alternativa que integra sobre un recinto vacío.
- **G1** ~20 distractores cuyo mensaje describe un error que no da ese número.
- **G2** dos ejercicios `nivel: examen` que no resuelven lo que piden.
- **G3** una pieza marcada `trampa: true` que es verdadera.
- **S3** las páginas de tema tardan 16,4 s en ser interactivas en un móvil de
  gama media. Ningún guardián mide el peso, y t01 son 5,8 MB de HTML y 151.846
  nodos.
- Y las **64 convocatorias parciales** que esa auditoría no recalculó. Con su
  ritmo —8 errores en 162 ejercicios— caben del orden de una docena más.

---

# Las cuatro fases · 28 de agosto de 2026

Ejecutadas seguidas, después del careo de las dos auditorías. Lo que sigue es
qué quedó hecho y qué no, con las cifras medidas y no estimadas.

## Fase 1 · los hallazgos matemáticos abiertos

Los seis, verificados a mano antes de tocarlos:

| | qué era | cómo se arregló |
|---|---|---|
| **B2** | el signo de la serie de Fourier de `la-que-no-tiene-saltos`, en dos sitios | $a_n=\frac{(-1)^n-1}{\pi n^2}$ es negativo para $n$ impar. Corregido, y añadida la comprobación que lo decide: en $t=0$ con el signo malo sale $\pi/2$ donde $f$ vale 0 |
| **B4** | el épsilon rechazado con un motivo falso, en dos ejercicios | La pregunta admitía **infinitas** respuestas y el propio ejercicio lo confesaba en otro distractor. Reescrita como «el mayor que sirve», con distractores que sí son errores |
| **B7** | una comprobación que integraba sobre un recinto vacío | Para $x>\sqrt2$ el recinto no existe. Una sola integral, y dicho por qué se para ahí |
| **G1** | distractores cuyo mensaje describe un error que no da ese número | Los seis nombrados, recalculados y reasignados. Dos cambiaron de valor porque el número no lo producía ningún error real |
| **G2** | dos ejercicios `nivel: examen` sin resolver | El de Laplace, resuelto entero —$x=t+e^{t}$, $y=1-e^{t}$, comprobado en las dos ecuaciones—. El de Green **no se puede**: su figura no la tenemos, y eso pasa de hueco callado a hueco declarado |
| **G3** | una pieza `trampa: true` que era verdadera | $S(k\pi)=\sum b_n\operatorname{sen}(nk\pi)=0$ es válido. Sustituida por la trampa real del tema: confundir $S$ con $F$ en un salto |

## Fase 2 · `npm run recalcula`

No hay Python en la máquina, y traer una dependencia habría sido lo fácil. Se
usó lo que el repositorio ya tiene: un evaluador propio de LaTeX, 160 líneas,
sin dependencias nuevas.

Comprueba solo lo que el corpus **ya afirma**: cada «expresión $\approx$
decimal», cada forma exacta declarada en un `formato`, y que un formato que
promete entero guarde un entero. Lo que no sabe evaluar lo declara saltado.

**Encontró ocho errores más** en Cálculo, todos de redondeo o de cifra
equivocada en el último dígito, más uno de fondo: un `\boxed` que llamaba
«$\sqrt[3]{0{,}9}$» a lo que era el valor del **polinomio**, con la raíz
verdadera escrita treinta líneas más abajo.

Validado al revés: se le inyectó un error y se puso rojo.

> **Su límite, y hay que repetirlo:** solo alcanza a las respuestas escritas
> como decimal. **Álgebra queda entera fuera** —sus resultados son objetos
> exactos y sus determinantes usan propiedades, no matrices escritas—. Cero
> desajustes ahí significa «no hay nada que mirar», no «está comprobada».

## Fase 3 · la rampa, y el campo que la escondía

Lo primero fue descubrir que **la medición anterior estaba mal**. Con `nivel`
completo —244 ejercicios lo tenían vacío y 34 del boletín decían `examen`— el
recuento pasó de 66 a 42, y señaló a otros temas: t04, t03 y t05, no t08/t09/t10.

Después, el trabajo:

- `nivel` es **obligatorio** en el esquema. Un ejercicio nuevo sin él rompe el
  build, y la escalera de §14 vuelve a ser comprobable.
- **42 → 0 escalones arrancan en un ejercicio de examen.** No hizo falta
  escribir ejemplos nuevos: los 44 que ya existían no estaban enlazados desde
  los escalones que los necesitaban. Era un problema de enlace, no de contenido.
- **4 → 0 escalones con los ejercicios fuera de orden.**
- **32 → 0 pasos que ordenan decimales.** Y el arreglo fue §01: la instrucción
  estaba duplicada en la `pregunta` y en el `formato`, y ahora vive solo donde
  le toca.

## Fase 4 · el peso, que no era el peso

La auditoría matemática decía 16,4 s en el tema 1. **No reprodujo**: medido
aquí, 5,9 s. Pero el hallazgo de fondo apareció al medir bien:

| página | HTML | nodos | antes | ahora |
|---|---|---|---|---|
| t01 complejos | 5,8 MB | 151.892 | **5,9 s** | **2,3 s** |
| t05 integración | 7,2 MB | 196.764 | 2,6 s | 2,1 s |
| ruta ordinaria | 3,0 MB | 77.412 | 2,5 s | 2,4 s |
| portada | 0,1 MB | 1.274 | 0,1 s | 0,1 s |

**El tema 5 pesa más que el tema 1 y tardaba menos de la mitad.** Así que no
era el peso: eran **doce lienzos del paso `verificar` pintándose al cargar**, a
360.000 píxeles cada uno — cuatro millones de evaluaciones antes de que el
alumno viera nada. t01 es el único tema con `verificar`.

Se pasaron a tiempo muerto. Y de paso quedó un aviso escrito en el código:
**un `IntersectionObserver` no vale aquí**, porque en modo guiado los lienzos
viven en paneles ocultos, no intersecan nunca y se quedarían en blanco. Se
probó, se comprobó que los seis lienzos quedaban vacíos, y se cambió.

`npm run peso` queda como medida —no como guardián— para tomarla al cerrar
cada asignatura.

Y t08, que era un tema geométrico con **una** figura, tiene ahora dos: la
segunda muestra qué intercambia Green, con el borde tramo a tramo a un lado y
la región al otro.

## Lo que sigue abierto

- **417 de 425 resoluciones de examen sin contrastar.** `recalcula` comprueba
  aritmética, no razonamiento: que una cuenta cuadre no dice que el método sea
  el correcto. Sigue siendo el mayor riesgo del proyecto.
- **Las 64 convocatorias parciales** que la auditoría matemática no recalculó a
  mano. `recalcula` ya pasa por ellas, pero solo por sus decimales.
- **Álgebra sin verificar**, y sin herramienta que la verifique.
- **t08 y t09 siguen siendo los temas más flacos**: 1.516 y 2.440 palabras, y
  dos ejemplos de entrada cada uno.
- **La fase 5** —abrir la tercera asignatura— con sus tres condiciones: el
  temario de Fluidos (16 contra 25), `unidad` en el esquema, y el lector de
  respuestas fuera de `EjercicioGuiado`.
