# Ideas · auditoría de octubre de 2026

Catorce ideas, cada una pasada por la prueba de utilidad de CLAUDE.md §13: **para
quién** es, **cuándo** la usa, **qué gana** y **cómo se comprueba que sirve**.
Detrás, esfuerzo (S: una sesión; M: dos a cuatro; L: más), riesgo y una demo
que cabe en una rama. Las cifras salen de las medidas de `AUDITORIA.md`, con
su guion al lado.

Fuera de la lista, por estar descartado: cuentas atrás al examen, estética que
cansa con el uso diario y cualquier cosa que suponga que alguien cursa todas
las asignaturas. Tampoco se repite lo que ya está en `tasks/pendiente.md`
(partir los ficheros grandes, la barra de puntos, el tipo de respuesta para
código de Sistemas…). Ninguna toca un enunciado ni publica una cifra estimada.

El orden es el de impacto entre esfuerzo, de mejor a peor.

---

## 1 · Que la opción buena no sea siempre la más larga

**El problema.** En el **85 %** de los 2.409 pasos `reconocer` la opción
correcta es, ella sola, la más larga (el azar daría el 30 %): 98 % en Álgebra,
96 % en Fluidos, 87 % en Cálculo. La correcta suele traer el porqué dentro
—«Porque el agua moja cada hoja por un lado: a OA la empuja…»— y las otras
son una frase pelada. Quien elige la más larga se salta el COMP1 sin pensar, y
`rti:hechos` lo apunta como acertado a la primera. En el banco del test de
mínimos de Materiales pasa en el 52 % (azar, 25 %), y ahí tiene nota: marcando
siempre la más larga, el simulacro da una media de **3,9 sobre 10** y **aprueba
uno de cada cuatro** sin saber nada; al azar, −0,3 y nunca.

- **Para quién**: todo alumno, en cada ejercicio; y quien escribe ejercicios.
- **Cuándo**: en el primer paso de cada ejercicio, y en el simulacro del test.
- **Qué gana**: un COMP1 que mide reconocer y no leer longitudes; una nota del
  simulacro de Materiales que no engaña a la baja… ni al alza.
- **Cómo se comprueba**: la cifra de arriba, recontada con las medidas 1 y 2
  de `AUDITORIA.md`, baja hacia el azar; y el simulacro con «la más larga»
  deja de aprobar.

**Esfuerzo**: S el guardián, M reescribir a ritmo de trinquete. **Riesgo**:
es trabajo de contenido, paso a paso; un guion que recortara las opciones
largas sería lo que la Regla 0 prohíbe y se llevaría los porqués. Se
pone un trinquete en `deuda.mjs --estricto` (como la sección 11): el número de
pasos con la correcta destacada no sube, y cuando baja se baja el techo. Y una
regla de escritura: el porqué va en el `mensaje`, no en el `texto`; todas las
opciones con la misma forma («X, porque Y»).

**Demo**: el guardián con su techo de hoy, `revisa-ejercicios.mjs` avisando
del caso, y un tema reescrito (Álgebra t05, 25 ejercicios) con su recuento
antes y después.

## 2 · Diagnósticos que no hay que escribir: signo, potencia de diez, inverso

**El problema.** De los 5.158 pasos `calcular`, 3.096 llevan dos
distractores. Cualquier otra respuesta equivocada recibe «No es correcto · Ese
número no sale de ninguna vía razonable», que además **afirma algo que nadie
ha comprobado** (`EjercicioGuiado.astro:1329-1333`; es la misma clase de frase
que se quitó el 28 de septiembre del aviso de «la otra columna»). Pero hay
errores que se reconocen sin saber nada del ejercicio: el signo cambiado, un
factor de diez elevado a algo, el inverso, el doble o la mitad, π de más o de
menos, grados por radianes, el resultado intermedio de un paso anterior.

- **Para quién**: cualquiera que falle una cuenta, en las ocho asignaturas.
- **Cuándo**: en el primer intento fallido de un `calcular` sin distractor
  que case.
- **Qué gana**: un diagnóstico de verdad en lugar del genérico, en todo el
  corpus a la vez y sin tocar un YAML (Regla 0: el arreglo va en la capa
  compartida).
- **Cómo se comprueba**: tests en `tests/` con un caso por transformación, y
  el recuento de cuántos distractores ya declarados habría reconocido la
  regla genérica. Hecho en la auditoría sobre los pasos `numero` cuyo valor
  es un decimal (3.096 de 3.172): **2.278 de sus 7.585 distractores (30 %) son el doble (659), el opuesto (589), la mitad
  (570), el inverso (163), el cuadrado, la raíz o una potencia de diez** de la
  respuesta. Los autores ya los consideran errores reales; en los 1.374 pasos
  `numero` que no declaran ninguno así, hoy caen en el genérico.

**Esfuerzo**: S. **Riesgo**: una coincidencia que no sea el error que dice.
Se mitiga diciendo el hecho y no la causa —«tu número es exactamente el
opuesto del bueno: mira el signo»—, solo cuando no casa ningún distractor
declarado, y con la misma tolerancia del paso. Y el genérico pierde su
afirmación: «No he reconocido este error». Otro riesgo: decir «es el doble»
regala la respuesta a quien divida entre dos. Pasa ya con los distractores
declarados («divide primero entre 3») y cuenta como intento; si molesta, el
mensaje genérico puede nombrar la familia («te sobra un factor constante»)
sin el factor.

**Demo**: `src/lib/diagnostico.ts` con sus tests, enganchado antes del
genérico en `EjercicioGuiado`, probado a mano en un tema de Fluidos y otro de
Cálculo (§16, punto 5).

## 3 · Volver a tu asignatura desde cualquier página

**El problema.** Desde un tema, un bloque de ejercicios o un examen no hay
enlace a su asignatura: la página enlaza la portada (sin la asignatura
elegida), los temas vecinos y, en un examen, su ruta y su PDF. «Cálculo ·
Tema 05» es texto. Para pasar del tema 5 al índice de exámenes, o al tema 9,
hay que ir a la portada y volver a elegir Cálculo, o saber que existe la
paleta. Y quien llega a la ficha (`/calculo/`) encuentra el temario a 14,2
pantallas en un móvil, sin enlace en el índice de la página (M3 de la
auditoría). La vista de detalle de la portada sí lo hace bien, y es el
modelo.

- **Para quién**: cualquiera que esté dentro de una asignatura y quiera ir a
  otro sitio de ella, que es casi todo el uso.
- **Cuándo**: en cada cambio de tema o de examen.
- **Qué gana**: un toque en vez de portada + elegir + bajar; y la ficha deja
  de esconder el temario.
- **Cómo se comprueba**: humo comprueba que toda página de una asignatura
  enlaza su detalle (`/#calculo`) y que el enlace aterriza con la asignatura
  abierta; y la medida 5 de `AUDITORIA.md`, antes y después.

**Esfuerzo**: S. **Riesgo**: bajo. «Cálculo · Tema 05» pasa a ser un enlace
a `/#calculo` (la portada ya sabe abrir la asignatura con el ancla desde el
arreglo de `:target` de §17), y la ficha gana «El temario» en su índice.

**Demo**: el rótulo de asignatura enlazado en `Tema`, en la página de bloque
y en `Examen`, y el enlace de la ficha, con el caso nuevo en `humo.mjs`.

## 4 · CLAUDE.md en dos niveles

**El problema.** CLAUDE.md pesa 218 KB y 3.583 líneas —del orden de 60.000 tokens, a
los 3–4 caracteres por token habituales en castellano; es una estimación, no
una medida—, y lo lee entero cada sesión y cada agente. `tasks/siguiente.md`
midió que el 82 % del límite semanal se fue en agentes, «y casi todo fue
releer contexto», y la solución que propone —una chuleta de dos páginas fuera
del repositorio— es la Regla 0 con otra cara: una segunda copia de las
reglas, que envejecerá distinto. §17 tiene 1.065 líneas; `docs/decisiones.md`
pide repensarlo a las 1.200. El argumento nuevo es el coste medido, no la
legibilidad.

- **Para quién**: quien mantiene, y cada agente que trabaja aquí.
- **Cuándo**: siempre.
- **Qué gana**: una fracción del contexto por agente, y una sola fuente de
  reglas en vez de CLAUDE.md más la chuleta.
- **Cómo se comprueba**: el tamaño en bytes del fichero que se carga, y que
  `verify` siga encontrando el índice de §17 y el ejemplo de §04.

**Esfuerzo**: S-M (mover texto, no escribirlo). **Riesgo**: que las reglas se
lean menos. Se mitiga dejando en CLAUDE.md cada regla en una o dos líneas con
su enlace, y moviendo a `docs/porques/` las historias fechadas (las citas `>`
suman 30 KB, y §17 entero, con sus relatos, 72 KB).

**Demo**: una rama con CLAUDE.md de reglas y un `docs/porques/` con el resto,
sin cambiar una regla; la decisión se cambia en `docs/decisiones.md` diciendo
cuál es el argumento nuevo.

## 5 · «He leído…»: el eco de lo que has escrito

**El problema.** La casilla acepta forma exacta —`pi/4`, `sqrt(3)/2`,
`(e^2-1)/2`— y eso es lo que pide Cálculo sin calculadora. Pero `1/2pi` es
π/2 y no 1/(2π), y el espacio se lee como producto («(1, 3)» vale 3; está en
§17). Quien escribe mal los paréntesis recibe un diagnóstico de su
matemática cuando el fallo es de tecleo.

- **Para quién**: quien contesta con forma exacta, sobre todo en Cálculo y en
  Álgebra, y en el móvil.
- **Cuándo**: mientras escribe, antes de comprobar.
- **Qué gana**: separar el error de tecleo del error de cuenta. «He leído:
  π/2 ≈ 1,5708».
- **Cómo se comprueba**: tests del formateador contra los mismos lectores de
  `lib/numero.ts`; y a mano, los casos de §17.

**Esfuerzo**: S. **Riesgo**: KaTeX en tiempo de ejecución está prohibido
(§07), así que no se dibuja la fórmula: se escribe el valor leído y, como
mucho, la expresión con √ y π en texto. Nada de librerías.

**Demo**: una línea bajo la casilla de `numero`, `complejo` y `magnitud`,
alimentada por los lectores que ya existen.

## 6 · Una fila de símbolos encima de la casilla en el móvil

**El problema.** En el teclado de un teléfono, `sqrt(3)/2` son nueve
caracteres, la mitad en el teclado de símbolos, y `^` está en su segunda
página.
La forma exacta, que §09 dice que «siempre vale», cuesta más en el móvil que
en el ordenador.

- **Para quién**: quien estudia con el móvil.
- **Cuándo**: al contestar un `calcular` de número, complejo o magnitud.
- **Qué gana**: escribir la forma exacta en tres toques; menos respuestas
  mal tecleadas (se ve con la idea 5).
- **Cómo se comprueba**: humo con un dispositivo táctil emulado; y contar las
  pulsaciones de diez respuestas típicas antes y después.

**Esfuerzo**: S-M. **Riesgo**: el foco: la fila no puede robar el foco de la
casilla ni tapar el diagnóstico. Solo con `pointer: coarse`.

**Demo**: `π √ ^ ( ) / i e ·10^` como botones que insertan en el cursor, en
`EjercicioGuiado`, solo en pantallas táctiles.

## 7 · Enunciados y definiciones que caen, para escribirlos

**El problema.** En Cálculo, el COMP4 son 1.432,5 puntos de las 88
convocatorias; **591,5 (el 41 %) están en ejercicios que el sitio entrena solo
con un `justificar`**, que es ordenar piezas —reconocer un argumento, no
escribirlo—. Ejemplos: «Demostrar analíticamente…» (`ex1617-2ev-2`, 5 puntos
de COMP4), «dar su definición, expresarlo mediante una expresión matemática y
poner un ejemplo» (`ex1516-3ev-1`, 5 puntos). En los ejercicios de tema,
`redactar` aparece 19 veces en 399.

- **Para quién**: quien prepara Cálculo o Álgebra, donde se pide enunciar,
  definir y demostrar.
- **Cuándo**: la semana antes de cada evaluación.
- **Qué gana**: practicar la parte de la nota que no es cálculo **en papel**,
  que es como se corrige, contrastando con la rúbrica.
- **Cómo se comprueba**: el recuento de puntos de COMP4 sin paso de
  producción (medida 3 de `AUDITORIA.md`) baja; y la ruta de cada evaluación
  enlaza sus tarjetas.

**Esfuerzo**: M. **Riesgo**: inventarse lo que «cae». No se inventa: cada
tarjeta sale de un enunciado de examen que lo pide, citado, y de las 35
rúbricas compartidas que ya existen (`src/content/rubricas/`). Es el paso
`redactar` que ya está, sin ejercicio alrededor.

**Demo**: una página `calculo/enunciados` con diez tarjetas (Barrow, Lagrange,
Rolle, Fermat, Bolzano, la definición de derivada, el logaritmo complejo…),
cada una con «¿dónde cae?» enlazando sus convocatorias.

## 8 · «Para repasar»: lo que te costó, en la página de la asignatura

**El problema.** `rti:hechos` ya guarda, por ejercicio, cuántos intentos
hicieron falta y si abriste la pista o el desarrollo. Ese dato solo se pinta
en la ruta. Nadie te devuelve a los ejercicios que resolviste con el
desarrollo abierto, que son los que no sabes hacer.

- **Para quién**: quien lleva semanas usando una asignatura.
- **Cuándo**: al volver a ella, sobre todo antes de un parcial.
- **Qué gana**: una lista corta —«estos seis los sacaste con la pista o el
  desarrollo»— con enlace a cada uno, de **esa** asignatura y nada más.
- **Cómo se comprueba**: con un `rti:hechos` de prueba en el humo; y que la
  lista solo enseñe ejercicios de la asignatura de la página.

**Esfuerzo**: M. **Riesgo**: §06 prohíbe la memoria de progreso **en la
portada**; esto va en la ficha de la asignatura o en su ruta, nunca en la
portada. Sin fechas de examen ni cuenta atrás. Si se quiere ordenar por
antigüedad, `rti:hechos` tendría que guardar la fecha, que hoy no guarda; es
un hecho, así que cabe en la regla 1 de §02, y las entradas viejas sin fecha
se siguen leyendo.

**Demo**: una sección plegada «Para repasar» en `[asignatura]/index.astro`
que lee `rti:hechos` y el índice de ejercicios que ya existe
(`indice-ejercicios.json`).

## 9 · Los errores típicos de una asignatura, en una hoja

**El problema.** Hay 610 `ErrorTipico` en la prosa, y son el contenido que
§08 llama principal. Pero están repartidos por los temas, cada uno en su
apartado: no hay un sitio donde leer de un tirón «lo que suspende» de una
asignatura la noche antes.

- **Para quién**: quien repasa a última hora, en papel o en el móvil.
- **Cuándo**: la víspera del examen.
- **Qué gana**: los errores de su asignatura en una página imprimible, cada
  uno enlazado a su apartado.
- **Cómo se comprueba**: el número de errores de la hoja es el de la prosa
  (un test lo cuenta), y la hoja se imprime en una o dos caras por tema.

**Esfuerzo**: S-M. **Riesgo**: duplicar prosa (Regla 0). No se duplica: la
hoja se genera en el build leyendo los `<ErrorTipico>` de cada `index.mdx`,
como la paleta lee los apartados.

**Demo**: `[asignatura]/errores.astro` para Fluidos, enlazada desde su ficha
y su formulario.

## 10 · Avisar de un error sin cuenta de GitHub

**El problema.** «¿Esto está mal? Dilo» lleva a abrir un *issue*, y eso pide
una cuenta de GitHub, que no se puede dar por supuesta en 1.º (es un supuesto,
no un dato). El repositorio no ha recibido **ningún issue** en su historia.
El sitio vive de que lo que dice sea verdad (README), y el canal para decir
que no lo es pide un registro previo.

- **Para quién**: el alumno que encuentra un fallo; y quien mantiene, que se
  entera.
- **Cuándo**: al dar con algo que no cuadra.
- **Qué gana**: avisos con el id del ejercicio y la página ya puestos, sin
  registrarse.
- **Cómo se comprueba**: llegan avisos; y el humo comprueba que el enlace
  lleva el id, como hoy («cada ejercicio puede avisar de un error»).

**Esfuerzo**: S. **Riesgo**: publicar un correo invita al spam; un formulario
externo es un dominio ajeno (solo un enlace, no un recurso: `verify` no lo
prohíbe). Decide quien mantiene el proyecto (§13, caso 5).

**Demo**: un segundo enlace «por correo», `mailto:` con asunto y cuerpo
rellenos, junto al de GitHub.

## 11 · El despliegue en paralelo, y los commits de documentación sin suelo entero

**El problema.** Cada despliegue tarda **alrededor de una hora** (las
ejecuciones 596 y 597 del 2 de octubre: 63 y 64 minutos), y un *push* que
llega mientras otro corre deja la anterior cancelada (598 y 599). Un commit
que solo toca `tasks/` o `diario/` paga el suelo entero. En local,
`humo:todo` ya sabe partirse por asignatura con un solo servidor (§11).

- **Para quién**: quien mantiene el proyecto.
- **Cuándo**: en cada *push* a `main`.
- **Qué gana**: un despliegue en un tercio del tiempo, y los de
  documentación en minutos.
- **Cómo se comprueba**: la duración de las ejecuciones antes y después
  (`gh run list`), y que un fallo de humo en una asignatura sigue parando el
  despliegue.

**Esfuerzo**: M. **Riesgo**: los guardianes globales de humo (cobertura,
raíces y barras) viven en el repartidor (§11, «la barrida partida»); en una
matriz de GitHub hay que poner un trabajo final que los sume. Y un commit de
docs sigue pasando el `verify` de los documentos (el de `$` duplicado), que
tarda segundos.

**Demo**: `deploy.yml` con el build en un trabajo, `humo` en una matriz por
asignatura que descarga `dist/` como artefacto, un trabajo que suma, y
`paths` para que `tasks/**`, `diario/**` y `docs/**` vayan por un camino
corto.

## 12 · Las cifras de los mensajes de Expresión Gráfica, atadas a la receta

**El problema.** `docs/decisiones.md` dice que los números de un `calcular`
de Expresión Gráfica van atados a la receta y que «ningún número queda sin
comprobar». Los de los mensajes no lo están: hay **880 cifras con mm o grados**
escritas a mano en 599 campos `bien`, `mensaje`, `porque`, `intro`,
`desarrollo` y `pista` —«A₀ está… a 39,1 mm de M₁: la hipotenusa de A₁M₁
(25,1 mm)…»—. Las de la muestra cuadran, pero nada lo comprueba, y una receta
que cambia deja el texto viejo. Es también trabajo de revisor, que hoy las
recalcula a mano.

- **Para quién**: quien produce los temas de Expresión Gráfica (los 6
  producibles que faltan —los otros 4 son `soloEnClase`— y los 34 ejercicios
  de la colección).
- **Cuándo**: al escribir y al revisar cada ejercicio.
- **Qué gana**: una clase entera de error imposible, y menos tiempo de
  revisión por ejercicio.
- **Cómo se comprueba**: el build falla si una cifra de un mensaje no es la de
  su expresión; validado al revés cambiando una.

**Esfuerzo**: M. **Riesgo**: complicar el YAML. Dos caminos, y el primero es
barato: (a) la cifra se sigue escribiendo y al lado va su expresión
—`39,1 mm {distancia(A0, M1)}`—, que el build comprueba y quita, igual que en
`calcular`; (b) solo la expresión, interpolada. El (a) no cambia nada de lo
publicado.

**Demo**: el comprobador en `lib/construir.ts` y SD10 (Ejercicio 8)
migrado, con su test.

## 13 · Cada distractor, con la cuenta del error que dice

**El problema.** Es el defecto de contenido que más se repite en la muestra:
**16 de 466 distractores rehechos (3,4 %) no producen su número** con el
error que describe su mensaje, en cinco de las seis asignaturas (A3 de la
auditoría). Quien comete ese error recibe el genérico; quien recibe el
diagnóstico, no lo cometió. El esquema comprueba que el distractor cae fuera
de la tolerancia, pero no que su mensaje lo explique, y ningún guardián
puede: el mensaje es prosa. Lo que sí se puede es lo que Expresión Gráfica ya
hace con sus cifras (`docs/decisiones.md`): escribir al lado la expresión de
la que sale.

- **Para quién**: quien escribe y revisa ejercicios; y el alumno, que recibe
  el diagnóstico de su error y no el de otro.
- **Cuándo**: al escribir un distractor; y en `revisa-ejercicios.mjs`, antes
  de pegarlo.
- **Qué gana**: el revisor deja de rehacer cada distractor a mano (los tres
  revisores de esta auditoría rehicieron 466); el build caza el que no cuadra.
- **Cómo se comprueba**: con los 16 de la muestra como casos de prueba:
  escrita su cuenta, el guardián los da en rojo, y corregidos, en verde.

**Esfuerzo**: M para el campo y su comprobación (opcional, con trinquete:
los distractores nuevos lo llevan, los viejos cuando se tocan). **Riesgo**: el
evaluador. `evaluaNumero` no conoce `cos` ni `sen` (`lib/regiones.ts:154`) y
lee el espacio como producto (§17); la cuenta tiene que pasar por el mismo
lector que el sitio usa, o se convierte en un tercer camino que diverge (la
trampa de §17 «el esquema puede ser más estricto que el sitio»).

**Demo**: `cuenta:` en el distractor, evaluada en `content.config.ts` con el
lector de `lib/numero.ts`, y los distractores de la muestra de Química
(`2024-2025-2c-ext`) migrados.

## 14 · Los temas que visitas, sin conexión

**El problema.** Se estudia en el tren, en el autobús y en bibliotecas con wifi
caprichosa. Hoy, sin red, el sitio no abre; §07 garantiza que no
depende de ningún dominio externo, pero no que se pueda leer sin conexión. Se
aparcó al arrancar el proyecto («ni service worker», `docs/mensaje-cowork.md`,
«todavía»).

- **Para quién**: quien estudia en el móvil fuera de casa.
- **Cuándo**: en el transporte, o con la red caída.
- **Qué gana**: los temas y bloques ya abiertos se leen y se resuelven sin
  red (la corrección corre en el navegador).
- **Cómo se comprueba**: Playwright con `offline: true` abre una página
  visitada antes y resuelve un ejercicio.

**Esfuerzo**: M. **Riesgo**: el sitio corrige cosas a diario, y una caché
mal pensada sirve una resolución vieja. Se mitiga con red primero para el
HTML (la caché solo responde si no hay red) y sin precargar: el HTML de
Cálculo son 174 MB, no se descarga entero. Y un aviso visible cuando la página
viene de la caché.

**Demo**: un `sw.js` de cuarenta líneas, red primero, registrado en
`Base.astro`, y la prueba sin conexión en un guion aparte.
