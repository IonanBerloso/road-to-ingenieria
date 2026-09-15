# Fases del 12 de septiembre de 2026

Escritas al cerrar la deuda de ejercicios de Térmica, sobre lo que quedó
**medido**, no sobre impresiones. Cada fase dice qué la desbloquea, qué se
entrega y cómo se comprueba.

Las fases del 10 y el 11 de septiembre están resumidas al final, en una línea
cada una. Su texto completo, con el rastro de cómo se corrigieron sus cifras,
está en el historial de este fichero: `git log -p tasks/manana.md`.

---

## ▶ MAÑANA · 16 de septiembre de 2026 — por dónde seguir

Escrito al cerrar el día 12. El suelo está **entero en verde** —build, verify,
color, 1.936 tests y la barrida completa del navegador— y las seis asignaturas
publicadas no tienen ninguna deuda que bloquee. Esto es el orden que
recomiendo, y por qué.

### 1 · Álgebra, las dos rutas por los criterios · §10.3

**Es lo que más rinde por hora, y lo único de contenido que queda medido.**
12 de sus 35 escalones ponen el ejercicio de examen delante de los de boletín,
`revisado` está a cero en sus 12 bloques y de sus 14 `falta[]` hay nueve
tachadas — o sea que declara cinco huecos abiertos en la asignatura que pide
demostrar en el 75 % de sus ejercicios de examen. Son las rutas más cortas del
sitio.

Se entrega: los 12 escalones con su rampa delante, los 12 bloques con fecha de
`revisado`, y los cinco `falta[]` resueltos o dichos. Se comprueba con
`npm run deuda` —secciones 2, 2 bis, 5 y 6— y con la ruta abierta en el
navegador.

### 2 · La decisión que no puedo tomar yo · §10.6 bis y §10.5 bis

Dos preguntas de diseño, las dos medidas y ninguna urgente:

- **`/calculo/t05-integracion/` pesa 10,5 MB y tarda 4,6 s** en el Chromium
  frenado de `peso.mjs`. Es la primera página del sitio que pasa de cuatro
  segundos, y la causa es mía: t05 pasó de 32 a 48 ejercicios y cada uno lleva
  su resolución entera en el HTML. Hay que decidir dos cosas — si `peso.mjs`
  entra en `npm run suelo` (una línea de `package.json`) y si una página de
  tema debe seguir sirviendo 48 resoluciones de una vez (arquitectura, no se
  improvisa).
- **La barra de reparto del examen** tiene sus tres segmentos contiguos a
  2,92, 1,77 y 1,65 de contraste. Hoy la salva la leyenda con cuadraditos.
  ¿Tiene que leerse a simple vista, o le basta con la leyenda?

### 3 · Lo suelto de §10.7, por orden de lo que cuesta

`calculo-ext` con `medidoSobre: 11` y su ventana sin declarar —la hermana del
fallo que se arregló hoy en `calculo-ord`, y conviene mirarla ahora que se sabe
qué buscar—; las dos rutas de Química, que prometen fecha de revisión por
bloque y la tienen 3 de 7 y 2 de 8; los cinco parciales de Fluidos de 2019-2021
sin ruta y sin decir por qué; y las 21 + 13 rampas que `deuda.mjs` no cuenta,
cuyo apunte **está mal redactado** y hay que volver a leer antes de tocarlo:
dice «aplicar el cuarto criterio a escalón y no a bloque» y hoy no he
conseguido reconstruir a qué se refería.

### 4 · ~~El único encargo de Cálculo que sigue bloqueado~~ · desbloqueado y hecho la misma noche

Lo dijo Ionan al cerrar el día 12: **treinta minutos por ejercicio**, así que
un cuadernillo de cuatro son dos horas. Yo lo tenía apuntado como «falta saber
cuánto dura cada parcial», y era un mal planteamiento del problema: la
duración **no es un dato por convocatoria, es una regla por asignatura**, y el
corpus ya sabe cuántos ejercicios imprime cada cuadernillo.

Así que lo que se guarda es la regla —`duracionDelExamen.minutosPorEjercicio`
en el catálogo, con su fuente— y **la página multiplica**. Guardar la duración
examen por examen serían 96 copias de una multiplicación esperando a
desincronizarse (§01). El campo es opcional: una asignatura que no ha dicho su
regla no publica duración, en vez de publicar una inventada.

Publicado ya: cada ficha de examen de Cálculo dice «· 2 h de reloj» al lado de
la fecha y los puntos, y el índice de exámenes lleva el desplegable con la
regla y de dónde sale. Comprobado sobre tres convocatorias de distinto
tamaño — 4 ejercicios → 2 h, 8 → 4 h, los 13 de mayo-junio de 2020 → 6 h 30
min— y sobre Álgebra, que no declara la regla y sigue sin decir nada.

**Lo que queda de este encargo**, y es pequeño: los siete bloques `enteros` de
las rutas de Cálculo dicen «no hay cronómetro en la página, así que el reloj lo
pones tú». Sigue siendo verdad y por eso no se ha tocado de madrugada, pero
ahora se les puede añadir **cuánto** hay que poner en ese reloj. Y queda por
decidir si el cronómetro de verdad —un contador en la propia página— merece la
pena en un sitio estático.

### Lo que NO toca mañana

Abrir una séptima asignatura. §00 lo prohíbe mientras Térmica esté en `obra`, y
lo sigue estando.

---

## Fase 6 · Térmica, de `obra` a `ok`

**Lo que le falta ya no es contenido.** Sus veinte convocatorias transcribibles
están montadas, los veinte ejercicios que dejaban fuera con la resolución detrás
están escritos, y los ocho `fuera` que quedan no son trabajo (ver «Lo que no se
va a hacer»). Lo que falta es lo que §15 y §16 piden además, y lo que las otras
cuatro asignaturas cerradas tienen y Térmica no.

Va primero **porque bloquea**: §00 prohíbe abrir una sexta asignatura mientras
Térmica esté en `obra`.

### 6.1 · La fuente de `evaluacion` cita un documento vetado

**Es la única de las cinco que puede cambiar algo ya publicado**, y por eso va
delante.

El catálogo de Térmica declara su evaluación —45 % prácticas, 55 % examen, las
dos modalidades— con esta fuente: «Normas y recomendaciones de la asignatura ·
UPV/EHU». Ese documento es `Normas_y_recomendaciones_para_seguir_la_asignatura.pdf`,
que está en la lista de ficheros con datos personales: **lleva los apellidos
de los alumnos por subgrupo al final**, y la regla dice que no se cita.

Lo que se copió de él no es personal —son pesos y plazos—, y la cita se
escribió antes de que el fichero entrara en la lista. Pero la regla está
escrita sin excepciones, y §13 caso 3 dice que una regla que estorba no se
ignora «solo por esta vez».

| salida | qué pasa | pega |
|---|---|---|
| **A · buscar la guía docente pública** | la guía docente de la UPV/EHU es pública y es la fuente que §15 pide; si dice lo mismo, se cambia la cita y el conflicto desaparece | hay que encontrarla en la web oficial y comprobar que es del curso bueno |
| B · dejarlo como está | no se publica nada personal | incumple la regla tal como está escrita |
| C · quitar la fuente | — | no vale: §10 prohíbe publicar el dato sin su fuente |

**Recomendación: A.** Si la guía docente dice otra cosa, manda la guía, y eso
se escribe.

> **Hecha el 12 de septiembre de 2026, por la A.** La guía docente de
> 2025-2026 del Grado en Ingeniería Mecánica de Gipuzkoa es pública en ehu.eus
> y confirma lo que el catálogo publicaba —55 % el examen, 45 % las prácticas,
> nueve semanas para renunciar a la continua—, y añade dos mínimos que el
> catálogo no decía y que un alumno necesita saber antes de entrar: **el 40 %
> del examen y el 25 % de cada ejercicio**. Tres detalles que solo venían del
> documento vetado —un mínimo de 2,25 en prácticas, que la nota se guarde dos
> cursos y que faltar a una sea un cero— **no están en la guía y se han
> quitado**: sin fuente que se pueda citar, §10 no deja publicarlos.
>
> Un aviso sobre cómo se leyó: la guía se consultó por la web, y el cuatrimestre
> salió distinto en dos lecturas de dos páginas —la lista del grado y la ficha
> de 2026-2027—. Los porcentajes y los mínimos coinciden en las dos; el
> cuatrimestre no se publica hasta abrirla entera.

### 6.2 · `tests/verificacion` de Térmica · el trabajo grande

`deuda.mjs`, sección 1 bis: de las **1.424 respuestas de examen comparables**
del sitio hay **1.240 recalculadas**, y de las 184 que faltan, **183 son de
Térmica**. Las otras cuatro asignaturas cerradas están enteras (Fluidos, 292 de
293, con la que falta dejada fuera a propósito). Térmica no tiene **ni un
fichero** en `tests/verificacion/`.

Por qué importa aunque Térmica se haya contrastado contra la resolución
oficial: aquel contraste se hizo a ojo y una vez. Un test lee el `valor` del
YAML y rehace la cuenta desde el enunciado, así que **no caduca**: si alguien
toca una respuesta y la cuenta ya no sale, se pone rojo. Y la sesión del 12 de
septiembre enseñó que no basta con coincidir con la oficial: la bomba de enero
de 2021 **se aparta** de ella a propósito, y lo único que puede defender esa
cifra a largo plazo es una cuenta escrita aparte que llegue a 82,7.

Entregable: veinte ficheros, uno por convocatoria, con el formato del
`README.md` de la carpeta. La herramienta ya existe —`cuadra.magnitud` llama a
los mismos lectores que corrigen al alumno, y la escribió Fluidos—; los valores
de tabla se copian del enunciado o de la nota que el ejercicio ya publica, **no
de memoria**.

**Comprobación**: la sección 1 bis de `deuda.mjs`, Térmica de 183 a 0, y
`npm test` en verde. Si alguna no cuadra, eso es un hallazgo, no un estorbo:
se para y se mira, como dice §10.

> **Hecha el 12 de septiembre de 2026: Térmica, 183 de 183.** El sitio queda
> en 1.423 de 1.424 respuestas de examen recalculadas, y la que falta es la de
> Fluidos que se deja fuera a propósito. `npm test`: 1.814 pruebas en 116
> ficheros. Las dos primeras convocatorias se escribieron a mano como
> plantilla y las otras dieciocho en cuatro tandas en paralelo.
>
> **Ningún error de cuenta**, que es lo esperable después de contrastar cada
> ejercicio contra la resolución oficial. Lo que salió fueron **seis pasos
> que corregían mal**, todos arreglados en el corpus y contados en el
> `README.md` de la carpeta: tres tolerancias relativas escritas en un campo
> absoluto, una tolerancia estrechada que dejaba fuera la cuenta buena, un
> paso que pedía datos que la página no publicaba —ahora sí, sacados de la
> resolución oficial— y una cadena escrita con un dato distinto al de la
> fuente. Más un lector que no sabía leer `3.137e9`.
>
> **Y una deuda nueva, medida y fuera de esta fase.** Buscando las demás
> casillas con el mismo fallo —un `numero` de valor grande con tolerancia
> absoluta menor que el 0,1 % del valor—, en Térmica solo quedaba una, en el
> tema 9, y se ha corregido. En **Fluidos salen tres** que tienen toda la pinta
> de ser lo mismo —dos factores de paso, 60 y 791, y un Reynolds de 138, los
> tres con 0,02— y otras cuatro dudosas. En Cálculo, Álgebra y Química una
> tolerancia estrecha es lo correcto, porque sus respuestas son exactas y no
> hay calculadora. Las de Fluidos se miran una a una antes de tocarlas: son
> ejercicios de colección y ningún recálculo las cubre.
>
> **Resuelta el 12 de septiembre de 2026, por la noche.** La búsqueda por la
> forma da nueve casillas en Fluidos, y cada una se miró con su cuenta exacta:
>
> | casilla | valor | cuenta exacta | tolerancia |
> |---|---|---|---|
> | 3.19, factor de paso K₂ | 60 | 59,85 | 0,02 → **0,5** |
> | 6.11, Reynolds | 138 | 137,8 | 0,02 → **1** |
> | 6.29, factor de paso K₁ | 791 | 790,3 | 0,02 → **2** |
> | 4.22, la k de la placa | 10,23 | 10,237 | 0,01 → **0,05** |
>
> Las tres primeras rechazaban la cuenta buena; la cuarta la aceptaba por
> siete milésimas. El valor publicado no se toca en ninguna, y el distractor
> más cercano sigue a más del 35 %. Las otras cinco —629,23 m, 1.032,59
> kg/m³, 111,33 m, un Reynolds de 200.000 y 30,68°— se quedan como están:
> sus datos fijan el resultado a esa precisión y la cuenta exacta cae dentro.

### 6.3 · Las frases con número de Térmica

`deuda.mjs` cuenta **74 afirmaciones con cifra** que el guion no sabe
comprobar solo. Las de las otras cuatro asignaturas se releyeron el 10 de
septiembre; **las de Térmica no**, y ahora se pueden contrastar contra veinte
convocatorias y 57 resoluciones en vez de seis. Es la fase 3 del día 10, que
quedó a medias.

**Comprobación**: releídas una a una, y cada una que cambie, dicha en el commit.

> **Hecha el 12 de septiembre de 2026, y más pequeña de lo que parecía.** De
> las 74, **solo tres son de Térmica** —`deuda.mjs` las lista desde ese día con
> `DEUDA_FRASES=ingenieria-termica`; antes solo daba el recuento—, y las tres
> siguen siendo ciertas con veinte convocatorias y 57 resoluciones delante:
> ningún ejercicio de examen es una **caldera**; la extraordinaria de 2025 pide,
> en efecto, la exergía destruida «mediante una de las dos maneras» y después
> «mediante la otra»; y el **factor de visión** sigue teniendo cuatro
> ejercicios de radiación publicados, los mismos cuatro. No cambia ninguna.

### 6.4 · Los escalones de un solo ejercicio

Quedan **7 de 295** en todo el sitio, y 4 son de Térmica. Dos son de suelo
—`theta-y-te` y `el-convenio-de-signos`, con `anios: 0`— y se quedan así a
propósito: son una convención que aprender, no una dificultad que escalar.
Los otros dos sí son deuda, y con 57 resoluciones de examen ya hay de dónde
tirar:

- **`decidir-la-zona`**: la cámara de mezcla de enero de 2021 (la mezcla sale
  **húmeda**, y se ve porque su entalpía cae entre $h'$ y $h''$) y la de
  febrero de 2022 (sale **sobrecalentada**, y se ve comparando entropías)
  son justo los dos lados de la decisión.
- **`la-entalpia-y-los-calores-especificos`**: sin candidato mirado todavía.
  Se busca antes de escribir uno nuevo (§16: «cuando una nota dice que no hay,
  se cuenta»).

**Comprobación**: sección 5 de `deuda.mjs`, de 7 a 5 como mínimo.

> **Hecha el 12 de septiembre de 2026.** A `decidir-la-zona` le entran las dos
> cámaras de mezcla, que deciden la zona por la entropía y por la entalpía en
> vez de por el volumen. A `la-entalpia-y-los-calores-especificos`, la turbina
> de gas de febrero de 2022, cuyo distractor de 869 kW es justo usar $c_v$ en un
> volumen de control. El candidato de enero de 2019 que salió en la búsqueda
> **no** entra ahí: su $c_n$ lleva $c_v$ aunque el sistema sea abierto, así que
> es la excepción de la regla, no un ejemplo de ella, y así queda dicho en la
> nota. Los dos de suelo se quedan con un ejercicio, a propósito.

### 6.5 · El cierre

En el mismo commit, como pide §16: `npm run peso`, `HUMO_TODO=1 npm run humo`
a un fichero, `npm run recalcula` y `node scripts/deuda.mjs`; recontar las
cifras de §04, §05, §09 y §15; `estado: ok` en el catálogo; y la sección «En
una frase» de `docs/como-vamos.md`, que pasa a decir **cinco asignaturas
terminadas**.

> **Hecha el 12 de septiembre de 2026, y con ella la fase 6 entera: Térmica
> está en `ok`.** Pasados en el mismo día `recalcula` (4.325 cuentas, ninguna
> descuadrada), `peso` (ninguna página por encima de 4 s), `deuda.mjs` (1.423
> de 1.424 respuestas recalculadas, 5 escalones de un solo ejercicio de 295,
> ninguna nota caducada) y la barrida completa del navegador —217 páginas,
> leída entera desde un fichero—, y `npm run suelo` en el commit del cierre.
> Las cifras de §04 y §05 no se movieron desde el recuento de la mañana
> —1.372 ejercicios y 5.661 pasos—, y las de §09 y §15 son de Cálculo.

---

## Fase 7 · La sexta asignatura

> **Ionan eligió Ciencia de Materiales el 12 de septiembre de 2026: «haz
> materiales primero».** Lo de abajo —la tabla del material, el hallazgo de que
> ninguna de las cuatro trae exámenes y la recomendación que no se siguió— se
> conserva porque sigue siendo cierto, y el plan de Materiales va primero.

### El plan de Ciencia de Materiales

> **Dónde está, la noche del 12 de septiembre de 2026: todo lo que se puede
> escribir, escrito.** Los diez temas están publicados con prosa, figura y
> ejemplos propios, y **los 99 ejercicios de la colección** están escritos y
> contrastados contra su resultado impreso. Los diez últimos eran los que se
> leen de una curva de libro —2.25 y 2.26 de la curva del latón, 3.20 y 3.22
> a 3.27 de las de trabajo en frío, 4.3 de las del cobre-níquel—, y entraron
> cuando esas curvas estuvieron redibujadas a escala (§08): **dieciocho
> figuras de libro** en los temas 2 a 6 —una en el 2, dos en el 3, siete en
> el 4, cuatro en el 5 y cuatro en el 6—.
>
> Lo único que falta no es trabajo:
>
> | qué | por qué no está |
> |---|---|
> | la ruta de estudio | no hay ni un examen entre el material, y §14 la mide sobre ellos |
> | cerrar contra §15 | por lo mismo: §15 exige las convocatorias con su PDF |
>
> La asignatura se queda en `obra` hasta que aparezcan exámenes. Es la
> situación de Térmica antes del 10 de septiembre, y se desbloquea igual: con
> material, no con más horas.
>
> **Y pesa poco.** `npm run peso` sobre los diez temas, la misma noche:
> ninguno pasa de 4 s en un móvil. Los tres con colección grande son los más
> lentos —el 3 con 1,4 s y 2,4 MB, el 2 con 1,3 s, el 4 con 1,2 s— y del 5 al
> 10 ninguno llega a 0,7 s. Se mide con `MSYS_NO_PATHCONV=1` delante en Git
> Bash, o las rutas llegan convertidas en rutas de Windows, y sin ningún
> `astro preview` vivo de un humo anterior, o el servidor no arranca.
>
> **Lo que el contraste encontró en la colección**, porque los datos de una
> curva se pueden volver a leer y los resultados impresos no siempre salen:
>
> | problema | impreso | lo que da la figura |
> |---|---|---|
> | 3.23 | espesor entre 0,14 y **0,19 cm** | 0,176 cm: con 0,19 el cobre ya está por debajo del 5 % de alargamiento |
> | 3.26 b) | ductilidad del **26 %** | 31 %: el 26 % es la lectura en el 10 % de trabajo en frío, no en el 7 % |
> | 3.27 b) | **10 %** de alargamiento | 1 %: el 10 % corresponde a un 32 % de trabajo en frío, no a un 60 % |
>
> En los tres el sitio publica la lectura de la figura, pone el valor impreso
> como distractor con su explicación y lo cuenta en la resolución. Otros dos
> no son erratas y la casilla acepta los dos valores: el 2.26 b) es un
> redondeo hecho antes de tiempo, y el 3.24 queda a punto y medio del borde
> que pide el enunciado, dentro de lo que da de sí una lectura a ojo.
>
> **Y una pregunta que no es mía.** El resultado impreso del 4.19 —44,8 % de
> Pb— sale de una palanca que mezcla la fase alfa a 300 °C con el eutéctico a
> 465 °C, y el 4.13 e) usa el mismo atajo en pequeño. El sitio publica la
> cuenta coherente con la fórmula del tema (55,2 %) y explica la otra. Si la
> profesora corrige con su criterio, conviene saberlo: está en la resolución
> del 4.19.

Medido el 12 de septiembre de 2026 sobre `Desktop/2027 proyecto contenido/
Ciencia de Materiales/`, abriendo solo lo que el nombre no delata como
personal —las presentaciones por grupos, los resultados y datos de prácticas
de un grupo, la carpeta de datos de laboratorio y los dos ficheros de grupos
y fechas de presentaciones se quedan sin abrir—, y mirando el final de cada
documento antes de usar nada de él.

**Lo que hay.** El temario oficial está en la guía del alumnado 2025-2026,
apartado 5: diez temas. Los seis primeros tienen diapositivas de la profesora
—370 páginas con capa de texto— y **una colección de 99 ejercicios con el
resultado impreso**: 30 del tema 2, 29 del 3 (en tres partes), 29 del 4, 7 del
5 y 4 del 6. El tema 1 no tiene colección: se evalúa con un **test de
contenidos mínimos** que hay que aprobar para aprobar la asignatura. Los
temas 7 a 10 —aleaciones, cerámicos, polímeros y compuestos— **no tienen
material de la profesora**: se trabajan con presentaciones de los alumnos por
grupos, que llevan sus nombres y no se abren, y se evalúan con un test (10 %)
y en el examen final.

**Lo que no hay: exámenes.** Ni uno. §15 los exige y §14 mide la ruta sobre
ellos, así que la ruta de Materiales **no se puede escribir todavía** y la
asignatura se queda en `obra` hasta que aparezcan. Es la misma situación que
la de Térmica antes del 10 de septiembre, y se declara igual.

**El orden:**

1. **Catálogo** — temario oficial y evaluación, las dos de la guía; `estado:
   obra`. El peso de cada tema sale de la planificación semanal de la guía y
   de qué temas entran en el examen ordinario, no de exámenes que no hay.
2. **Tema 1**, que es breve y es la puerta: sin el test de mínimos no se
   aprueba. Prosa, figura y ejercicios de reconocer.
3. **Tema 2, propiedades mecánicas**, el que mejor encaja con lo que el sitio
   ya sabe corregir —tensiones, deformaciones, módulos, durezas, con unidad—.
   Treinta ejercicios de colección.
4. **Tema 3**, estructuras, defectos y endurecimiento: veintinueve.
5. **Tema 4, diagramas de fase**: veintinueve ejercicios que **se leen sobre un
   diagrama**. Los del material son de libro, así que antes de transcribir hay
   que redibujarlos en SVG a partir de los que reparte la profesora (§08), con
   la escala construida sobre los números y no a ojo (§17).
6. **Temas 5 y 6**, transformaciones y tratamientos: once ejercicios, también
   sobre curvas de libro —TTT y Jominy— que hay que redibujar.
7. **Temas 7 a 10**, con prosa propia sobre el temario de la guía y ejemplos
   propios, porque la asignatura no reparte material suyo. Van los últimos y
   su `fuente` lo dice con todas las letras. Declararlos `soloEnClase` no vale:
   serían cuatro de diez, por encima del tercio que §15 admite, y además
   **no lo son** —entran en el test y en el examen—.

Las **prácticas de laboratorio** (20 % de la nota, con sus guiones entre el
material) quedan fuera del alcance de los temas, como en Fluidos, y se
declaran en el catálogo.

**Comprobación de cada tema**, la de siempre: `revisa-ejercicios` antes de
pegar, los resultados de la colección contra lo recalculado, el tema abierto
en claro, oscuro y 360 px con los distractores tecleados, y `npm run suelo`.

**Bloqueada por la fase 6** (§00). Pero lo que hay que averiguar para ella se
puede ir contestando mientras tanto, y hay una pregunta que no me corresponde.

### Lo medido, sin abrir un fichero

Contado el 12 de septiembre de 2026 por los **nombres** de los ficheros de
`Desktop/2027 proyecto contenido/` y de `Documents/…/Proyecto 2026-2027/`:

| asignatura | curso | material | exámenes |
|---|---|---|---|
| Expresión Gráfica | 1.º | 51 ficheros: geometría descriptiva, normalización, vistas, acotación, tolerancias, uniones y conjuntos; una colección con soluciones; criterios de corrección | **ninguno** — solo las dos actas de notas, vetadas |
| Mecánica Aplicada | 2.º | ~~17: teoría y colección de ejercicios de los **ocho temas**, del cálculo vectorial al movimiento plano~~ **38** en `Desktop/…/Mecánica`: teoría y colección de los **doce temas**, con enunciados y resoluciones completas del 9 al 12 · ver la nota de abajo | ~~**ninguno**~~ **ocho**, en `Exmenes_pasados/`: tres bilingües y cinco solo en euskera — el de notas del parcial, vetado |

> **La fila de Mecánica Aplicada estaba mal, y por la trampa que §17 ya
> avisaba.** Se contó sobre `Documents/…/Mecánica Aplicada`, que es una copia
> parcial —17 ficheros, ocho temas— y no sobre `Desktop/…/Mecánica`, que
> tiene 38 y una carpeta `Exmenes_pasados` con ocho convocatorias. Lo destapó
> listar el directorio entero al abrir la asignatura, el 12 de septiembre de
> 2026. **Un inventario se cierra listando todas las carpetas donde vive el
> material**, no la primera que aparece.
| Ciencia de Materiales | 2.º | 149, casi todos datos de laboratorio; teoría de seis temas con su listado de ejercicios, guía del alumnado, normativa de exámenes | **ninguno** |
| Sistemas de Producción | 2.º | 23: ocho temas, colección de problemas 2025-26, guía del estudiantado, un problema resuelto, un recurso de CNC para el examen | **ninguno como convocatoria** |

Una salvedad en la última fila: las notas de estudio de Ionan en `Cerebro
UPV-EHU` etiquetan varios problemas de Sistemas como «Ordinaria 2021-22»,
«Ordinaria 2023-24» o «Extraordinaria 2025-26», así que **puede** que la
colección incluya problemas de examen con su fecha. Sin comprobar: no se ha
abierto la colección.

### El hallazgo que manda

**Ninguna de las cuatro trae exámenes.** §15 exige todas las convocatorias con
su PDF, y §14 mide la ruta sobre exámenes. Sin ellos, la sexta asignatura
nacería exactamente donde estaba Térmica antes del 10 de septiembre: temas
escritos, ruta sin medir y `obra` por definición.

Así que lo primero es un hecho del mundo (§13 caso 5), y es para Ionan:
**¿hay exámenes de alguna de las cuatro, y de cuál?** Y una segunda, que decide
el orden según §00 —ir un cuatrimestre por delante—: **qué cuatrimestre es cada
una.**

> **La segunda tiene ya una primera respuesta**, de la lista de asignaturas del
> Grado en Ingeniería Mecánica de Gipuzkoa en ehu.eus, curso 2026-2027:
> **Mecánica Aplicada es anual**, Ciencia de Materiales es del primer
> cuatrimestre y Sistemas de Producción del segundo. Expresión Gráfica es de
> 1.º y no sale en esa lista. Con la misma salvedad que en la 6.1: se leyó por
> la web y en una ficha el cuatrimestre salió distinto, así que se confirma
> abriendo cada guía antes de apoyarse en él. Si se confirma, refuerza la
> recomendación de abajo: una asignatura anual es la que más semanas tiene
> alguien estudiándola.

### Mi recomendación, con lo que hay

**Mecánica Aplicada**, si aparecen sus exámenes:

- el material está completo **tema a tema**, teoría y colección de los ocho;
- es la que mejor encaja con lo que el sitio ya sabe corregir —respuestas
  `vector` y `magnitud`, figuras de sólidos, apoyos y cables— sin escribir
  código nuevo (§04);
- y es de 2.º, donde el sitio ya tiene Fluidos y Térmica.

**Expresión Gráfica es la única de 1.º** y por §00 tendría que ir primero, pero
es la que peor encaja: su examen **es un dibujo**. El sitio no sabe corregir
una vista ni un corte, el patrón `figura fija` sigue sin construir y no hay tipo
de respuesta para eso. Antes que contenido necesita **una fase de diseño
propia**, y conviene hacerla con calma y no como sexta asignatura de trámite.

Sistemas de Producción iría después —su parte de CNC es programar, y eso no es
un paso de cálculo— y Ciencia de Materiales la última: casi todo su material es
laboratorio.

---

## Fase 8 · Mecánica Aplicada, la séptima

> **Ionan lo decidió el 12 de septiembre de 2026, por la noche: «sigue con el
> plan de la siguiente fase».** Es la segunda salida del conflicto de §00 que
> quedó anotado abajo: Materiales se queda en `obra` —le falta material, no
> trabajo— y se abre la siguiente. La recomendación escrita era esta, y al
> abrirla resultó mejor de lo que decía la tabla de arriba: **sí tiene
> exámenes**.

### Lo que hay, contado listando las dos carpetas

- **La guía docente 2025/26**, pública en ehu.eus: código 25984, 9 créditos,
  anual. Doce temas en dos bloques —Estática, del 1 al 6; Cinemática y
  Dinámica, del 7 al 12— y la evaluación, que va citada en el catálogo.
- **El libro de la asignatura**, «Mecánica Aplicada» de Faustino Mujika,
  publicado por el Departamento en ehu.eus: los mismos doce temas, con su
  índice.
- **Teoría y colección de los doce temas.** Del 1 al 8, cada problema trae una
  nota del profesor y su resultado impreso; del 9 al 12, enunciados y
  resoluciones completas por separado, y el 8 tiene además problemas
  resueltos. Unos 210 problemas contados por sus «Resultado»; el recuento
  exacto se hace tema a tema, al transcribir.
- **Ocho convocatorias** en `Exmenes_pasados/`:

| convocatoria | bloque | idioma | qué hay |
|---|---|---|---|
| enero de 2024 | estática | bilingüe | cuatro cuestiones y tres ejercicios; las páginas de ejercicios llevan la cabecera del 18 de enero de 2023 |
| ordinaria, 6 de junio de 2025 | estática | bilingüe | cuatro cuestiones y dos ejercicios; la columna en castellano puntúa la teoría sobre 5 y la de euskera sobre 4, que es la que suma 10 |
| extraordinaria, 27 de junio de 2025 | estática | castellano | incompleta: dos cuestiones y el ejercicio 1; el 2 está en blanco en el PDF |
| 2017-2018 y 2018-2019, cinco ficheros | estática y dinámica | solo euskera | imposibles, como las dos de Térmica de 2014-2015 |

- **Lo que no se abre:** `Notas_parcial_esttica.pdf`, que está en las dos
  carpetas.

### Lo que eso decide

1. **Se puede cerrar contra §15**, a diferencia de Materiales: el bloque 1
   tiene tres convocatorias que se pueden transcribir. El bloque 2 solo tiene
   exámenes en euskera, así que su ruta o se mide leyendo esos cinco para
   contar qué cae —leer para clasificar no es transcribir— o se declara sin
   medir. Se decide al llegar, y se dice.
2. **La asignatura pesa en figuras.** Casi cada problema remite a «la
   figura», y §08 obliga a redibujarlas todas. Es el coste principal, y el
   orden sale de ahí.

### El orden

1. **Registro**: el catálogo con el temario y la evaluación de la guía, este
   plan y la nota de §00. Un commit.
2. **Las tres convocatorias de estática**, con su PDF en
   `public/examenes/mecanica-aplicada/` y sus figuras redibujadas. Van
   primero porque son lo escaso y porque dicen qué pesa cada tema del bloque 1.
3. **Los temas 1 a 6**, el bloque 1 —el primer cuatrimestre, el que alguien se
   encuentra antes (§00)—: prosa, figura y ejemplos propios, y la colección
   entera con sus figuras.
4. **La ruta del bloque 1**, medida sobre las tres convocatorias.
5. **Los temas 7 a 12**, el bloque 2, con sus colecciones.
6. **La ruta del bloque 2**, con la decisión del punto 1 de arriba.
7. **El cierre** contra §15, con las comprobaciones de §16.

Cada tema va en su commit, con el suelo en verde. La colección se transcribe
literal (§08) y cada resultado impreso se contrasta haciendo la cuenta, que es
lo que encontró las erratas de Materiales y de Térmica.

> **Dónde está, la madrugada del 12 de septiembre de 2026.** Hechos los
> puntos 1, 2, 3 y 5 en su parte de prosa: el registro, las tres convocatorias
> del bloque 1 con su PDF y sus figuras, y **los doce temas** escritos con
> prosa, figura y dos ejemplos propios cada uno. El catálogo los marca hechos.
>
> **Las colecciones van por tema, y cada una se contrasta.** Las del tema 1
> (18 problemas) y el tema 2 (17) están montadas detrás de los ejemplos; las
> de los temas 3 a 12 quedaron a medias: los agentes que las transcribían se
> pararon al agotarse el límite de sesión de la cuenta, que se repone a las
> 4 de la mañana. Su trabajo parcial está en el borrador de la sesión. Lo que el contraste lleva encontrado:
>
> | problema | impreso | lo que dan los datos |
> |---|---|---|
> | 1.14 | 13,52 y τ = 168,78 | 13,526 y 168,844: redondeo a mitad de cuenta |
> | 1.18 | k = 1 | también k = −7: «paralelos» no exige el mismo sentido |
> | 2.1 | x_G = 2R·sen α/α | R·sen α/α: el arco abarca 2α, y el impreso deja G fuera del arco |
> | 2.8 | 4254 mm³ | 720 mm³ leyendo el enunciado al pie de la letra; el impreso es el agujero entero |
> | 2.17 | I_x = 1.166.736, I_y = 603.043 | 1.167.736 y 636.043: erratas de copia |
>
> En todos se publica lo que dan los datos, el impreso queda como distractor
> con su explicación, y la fuente lo dice (§13).
>
> **Lo que falta:** las diez colecciones que quedan, las dos rutas —la del
> bloque 1 medida sobre las tres convocatorias; la del bloque 2 con la decisión
> del punto 1— y el cierre contra §15.
>
> **Una deuda pequeña, medida:** `normaliza()` de `src/lib/unidades.ts`
> convierte ² y ³ pero no ⁴, así que las respuestas en cm⁴ de la colección del
> tema 2 van como `numero` con la unidad en `formato` y no como `magnitud`.

> **Y dónde quedó, la tarde del 12 de septiembre de 2026.** Las **doce
> colecciones transcritas**: 250 ejercicios en la asignatura, con más de
> treinta resultados impresos que no salen —publicados con la cuenta buena y
> el impreso de distractor— y varias erratas encontradas en las resoluciones
> oficiales del profesor, incluidas dos donde el impreso acierta y la
> resolución falla.
>
> **Tres simuladores**, que era lo que de verdad le faltaba a Mecánica frente
> a Fluidos: en figuras por ejercicio ya iba por delante. La viga y sus
> diagramas (tema 6), el centro instantáneo (tema 8) y la catenaria contra la
> parábola (tema 5), cada uno con su modelo en `src/lib/`, sus pruebas contra
> números publicados, su preajuste y su entrada en el guardián.
>
> **Lo que queda de la fase 8:** las dos rutas —la del bloque 1, medida sobre
> las tres convocatorias; la del bloque 2, con la decisión sobre los exámenes
> en euskera— y el cierre contra §15, que incluye los **57 recálculos de
> examen** en `tests/verificacion/`.
>
> **Dos deudas nuevas, medidas:**
>
> 1. **Los cinco simuladores de Fluidos dibujan sin estilo lo que crean en
>    tiempo de ejecución.** El estilo con ámbito de Astro añade un atributo a
>    cada elemento en la construcción, y lo que el script inserta después no
>    lo lleva, así que sus cotas y etiquetas salen con el estilo por defecto.
>    En Mecánica se arregló pasando esos estilos a un bloque global acotado a
>    cada simulador; en Fluidos está sin tocar.
> 3. **Los cinco escalones de un solo ejercicio de las rutas de Mecánica son
>    los de `suelo`, y se quedan así a propósito**, por el mismo motivo que
>    los dos de Térmica: un convenio de signos o la directriz de la catenaria
>    son una convención que aprender, no una dificultad que escalar. La
>    sección 5 de `deuda.mjs` los cuenta, y contarlos está bien; lo que no
>    procede es inventarles un segundo ejercicio para apagar el marcador.
>
> 2. **Un guardián en verde no prueba que el modelo esté bien.** El de la viga
>    comprobaba el flector del vano —que salía bien por casualidad— y no el
>    del apoyo, que salía mal: un −8MgL en un extremo simplemente apoyado.
>    Lo cazó mirar la captura. Al elegir qué comprueba un preajuste conviene
>    incluir **lo que tiene que valer cero**, no solo lo que la fuente
>    publica como resultado.

---

## Fase 9 · Sistemas de Producción y Fabricación, la octava

> **Y Ionan decidió el 13 de septiembre de 2026 que va la última: «deja
> sistemas para el final».** Queda registrada y abierta —su catálogo publica
> ya el temario oficial y sus dos huecos declarados—, pero su contenido se
> escribe después de Expresión Gráfica. El orden de §00 vuelve así a su
> sitio: la de 1.º primero.

> **Abierta el 13 de septiembre de 2026**, con Mecánica ya cerrada. Es otra
> vez la excepción de §00 —Materiales sigue en `obra` porque le falta
> material—, y se eligió entre las dos que quedaban: Expresión Gráfica es de
> 1.º y tendría preferencia, pero **su examen es un dibujo** y el sitio no
> sabe corregir eso. Necesita una fase de diseño propia, no contenido.

### Lo que hay, contado listando las dos carpetas

- **La guía del estudiantado 25/26**, entre el material. Da el temario
  oficial —cinco bloques— y la evaluación: 70 % prueba escrita, 30 %
  prácticas, con **mínimo de 5 en el examen** y hasta +1 punto por el informe
  TM+.
- **Nueve juegos de diapositivas** por proceso: presentación, torneado,
  fresado, taladrado, CNC, rectificado, fundición, metrología y deformación
  plástica. Más catálogos de herramienta de torneado y fresado.
- **Una colección de 54 problemas** con su resultado impreso, repartidos en
  siete procesos: torneado 9, fresado 9, taladrado 6, CNC, fundición,
  metrología y deformación plástica. El recuento exacto por tema se hace al
  transcribir.
- Guiones de prácticas, un problema resuelto y el recurso de CNC que se puede
  llevar al examen.
- **Ningún examen.** Como Materiales: nace en `obra` y no se puede cerrar
  contra §15 hasta que aparezca alguno.
- **Lo que no se abre:** `Distribucin_grupos_prcticas.pdf`, que es una lista
  de grupos.

### Dos cosas declaradas desde el primer día

1. **El temario oficial son cinco bloques y el material son nueve procesos.**
   El catálogo publica los bloques de la guía, con el mecanizado agrupando
   torneado, fresado, taladrado y rectificado, y dice qué diapositivas caen en
   cada bloque.
2. **«Tecnologías de unión» no tiene material**: ni una diapositiva de
   soldadura entre los treinta y siete ficheros, ni un problema en la
   colección. Va con `soloEnClase` y su motivo. Es uno de seis, por debajo
   del tercio que §15 admite.

Y un conflicto que trae la propia guía: su tabla resumen da un **20 %** a las
prácticas y su apartado 8.1 les da un **30 %**. Se publica el 30, que es el
que suma 100 con el examen, y la fuente lo dice (§13 caso 3).

### El orden

1. **Registro**: catálogo con el temario y la evaluación de la guía, este plan
   y la nota de §00. Un commit. **Hecho.**
2. **La colección primero, en lo que se pueda**: el volcado de texto **pierde
   las unidades** —«600 .» donde el papel dice 600 rpm—, así que hay que
   leerla de las imágenes de la página, como el tema 7 de Mecánica. Eso
   condiciona el ritmo.
3. **Los temas por peso de colección**: mecanizado primero, que se lleva
   torneado, fresado y taladrado; luego deformación plástica y fundición, que
   son las otras dos con muchos problemas; después CNC, metrología y unión.
4. **La ruta**, cuando haya con qué medirla. Sin exámenes, o se declara sin
   medir —como no se hizo en Materiales— o se mide sobre la colección
   diciendo que eso es lo que se ha medido.
5. **El cierre contra §15**, que hoy no se puede: no hay convocatorias.

### Lo que hay que decidir cuando llegue

**CNC es programación, no cálculo.** Sus problemas piden escribir código de
control numérico, y el sitio no tiene un tipo de respuesta para eso. Las
salidas son tres y ninguna es obvia: pasos `reconocer` sobre código ya
escrito, un paso `redactar` con rúbrica, o declarar el bloque como práctica
de taller. Se decide al llegar al tema 2, con los problemas delante.

---

## Fase 10 · Lo que deja la auditoría completa del 13 de septiembre

El informe entero está en [`docs/auditoria-2026-09-13.md`](../docs/auditoria-2026-09-13.md),
con lo ya arreglado tachado. Aquí solo lo que queda, en el orden en que lo
haría, con el criterio de siempre: **primero lo que afecta a quien no puede
elegir, después lo que miente, después lo que estorba.**

### 10.1 · ~~Térmica 2025-2026: los enunciados~~ · hecho el 14 de septiembre

Los nueve enunciados rehechos verbatim contra el PDF, con lo que arrastra cada
pieza en el bloque en cursiva del molde de `2020-2021-ord` y con el apartado
que resuelve dicho en cada una. Suelo en verde, `recalcula` sin un solo
desajuste sobre 5.435 pares, los 34 casos de verificación de las dos
convocatorias en verde.

**Pero al releerlas contra el PDF apareció algo que ninguna de las dos
auditorías vio, porque las dos miraron el enunciado y ninguna contó los
apartados: al examen de la ordinaria le faltan SEIS de sus TRECE apartados.**

Del ejercicio 1 falta el e). Del ejercicio 2, que pide seis, están el a) y el
primer paso del d): faltan b), c), e) y f). Ya está declarado —`fuera` acepta
ahora `apartados` y la página lo dice en cinco sitios—, pero **escribirlos es
trabajo pendiente y es el que más rinde de toda esta lista**: son los
apartados de exergía y rendimiento exergético, que caen en quince y en ocho de
las diecisiete convocatorias, y están todos desarrollados en el PDF de la
escuela. No falta material: falta escribirlos.

| falta | apartado | dónde está la resolución |
|---|---|---|
| ej 1 e) | rendimiento exergético del proceso en el universo | `2025-2026-ord.pdf` |
| ej 2 b) | exergía destruida en el condensador | íd., pág. 7 |
| ej 2 c) | rendimiento exergético del condensador | íd. |
| ej 2 d) | rendimiento interno de la bomba (está el primer paso) | íd. |
| ej 2 e) | exergía destruida en la bomba | íd. |
| ej 2 f) | rendimiento exergético de la bomba | íd. |

Al terminarlos, quitar las dos entradas de `fuera` y recontar: Térmica pasa de
57 resoluciones de examen a las que salgan.

**Y una tarea que sale de aquí, para todo el sitio:** ninguna convocatoria de
ninguna asignatura declara apartados a medias, porque hasta hoy no se podía.
Conviene pasar las otras diecinueve de Térmica —las únicas cuyos ejercicios
tienen cinco y seis apartados— contando apartado por apartado contra su PDF.
Si en la ordinaria de enero faltaban seis de trece sin que nadie lo supiera,
no hay motivo para suponer que es la única.

### 10.2 · Las nueve `fuente` que callan una discrepancia

Lista con fichero y línea en el informe, §2. El arreglo es el de hoy: subir a
la `fuente` lo que la resolución ya cuenta, y en las cinco que no lo tienen,
**añadir el valor impreso como distractor** — que es la mitad que de verdad
sirve, porque quien saque el número del boletín quiere saber por qué no cuadra.

### 10.3 · Álgebra: pasar sus dos rutas por los criterios

**12 de sus 35 escalones** ponen el ejercicio de examen delante de los de
boletín, `revisado` está a **0 en sus 12 bloques**, y de sus 14 `falta[]`
nueve están tachadas: declara **5 huecos abiertos** en la asignatura que pide
demostrar en el 75 % de sus ejercicios de examen. Son las rutas más cortas del
sitio: es barato y rinde.

### 10.4 · ~~`calculo-ext`: ordenar como dice que ordena~~ · hecho el 15 de septiembre

Los seis estaban de verdad, y se han movido. Antes y después, con las veces
que cae cada bloque de once convocatorias:

| mitad | antes | ahora |
|---|---|---|
| primer cuatrimestral | 11 · 7 · 6 · 8 · 5 · 9 · 3 | 11 · 9 · 8 · 7 · 6 · 5 · 3 |
| segundo cuatrimestral | 11 · 10 · 9 · **3** · 8 · 6 | 11 · 10 · 9 · 8 · 6 · 3 |

El peor era el gradiente —tres de once— por delante de la integral de línea
—ocho—. Se eligió reordenar y no reescribir el criterio porque **no había
ninguna razón escrita** para las excepciones: ni por tema ni por dificultad
explican el orden viejo. Comprobado que el fichero conserva las mismas líneas,
solo permutadas, y que los rótulos de sección —SUELO, los dos cuatrimestrales
y CIERRE— siguen donde estaban.

Y `calculo-ord` **sí lo cumplía**, como decía la auditoría: su pareja
edo/cruce parece fuera de orden pero está declarada en el propio criterio
—«al final los dos que se reparten el hueco que sobra»—, que es la otra forma
válida de cerrar esto.

### 10.5 · Los guardianes que se creen más fuertes de lo que son

En orden de rendimiento:

1. **~~`comprueba-simuladores.mjs` y §11 dicen «contra el examen» donde no lo
   es~~ · corregido el 15 de septiembre de 2026.** La cabecera larga ya se
   había arreglado el 13, pero **la primera línea del fichero y el mensaje de
   final seguían diciéndolo**: «Los simuladores enseñan los números del
   examen» y «Los simuladores enseñan lo que publica el examen». El titular es
   lo último que se corrige y lo primero que se lee, y eso está dicho ahora en
   el propio comentario.

   Ahora dicen «los números que dice su `fuente`» y «cada simulador enseña lo
   que declara su fuente». Y el reparto de §11 pasa a **3 externas, 2 mixtas y
   4 propias**: la cuarta es el plano complejo, con lo que deja de haber un
   simulador que no compare nada. El «228» de §11 ya llevaba su aviso desde el
   13 —que no sale de un examen sino de
   `fluidos/t20-golpe-ariete/index.mdx:218`— y se ha dejado tal cual.
2. **~~`humo.mjs` y los 360 px~~ · relectura del 15 de septiembre: ya estaba
   hecho, y el apunte se había quedado viejo.** El guion honra `HUMO_TODO`,
   tiene muestra rotatoria de ocho exámenes por día del año, abre las tres
   clases de página —cuatro de examen, seis de tema, tres de ruta— y cuenta
   cuántas resoluciones ha llegado a abrir de verdad, que es lo que impedía
   tragarse el fallo. Lo describía el estado anterior al 13 de septiembre.
3. **~~La portada se abre sin escuchas de error de JavaScript~~ · hecho el 15
   de septiembre de 2026.** Era verdad, y no eran dos líneas sino un agujero:
   de las tres pestañas que abre `humo.mjs`, solo la del bucle principal
   escuchaba. Las otras dos son la de 360 px y **la portada**, que es la
   página con FLIP, `:target` y paleta de mandos. O sea que «cero errores de
   JavaScript en consola» se afirmaba sin haber mirado la página donde era más
   probable que los hubiera. Ahora hay un ayudante `escucha(pestaña, etiqueta)`
   y lo usan las tres.

   **Y encontró algo en la primera pasada**, que es la mejor defensa de que el
   hueco importaba: `portada → Invalid regular expression: /p{M}/gu: Incomplete
   quantifier`. A `index.astro:884` le faltaba una barra —`\p{M}`, la marca
   diacrítica, escrito `p{M}`—, y ese literal no es inválido al compilar sino
   **al evaluarlo**: la primera llamada a `sinTildes` lanzaba y se llevaba por
   delante el resto del script, o sea **la paleta de mandos entera**. La misma
   línea está bien doce veces más arriba, en el lado servidor. Llevaba
   publicado desde que se escribió la paleta, con la barrida diciendo «cero
   errores de JavaScript en consola» todos los días — porque la consola de esa
   página no la escuchaba nadie.
4. **~~`verify.mjs` y el foco visible~~ · hecho el 15 de septiembre de 2026,
   por el otro lado.** Un botón sin regla de foco propia pasa, y está bien:
   `base.css` tiene un `:focus-visible` global con un anillo de 2 px en
   `--live`. Lo que no había era nadie que comprobara que esa regla sigue ahí
   —borrarla habría dejado el sitio entero sin anillo con los dos guardianes en
   verde, porque ninguno APAGA nada—. Ahora se exige que exista y que su
   `outline` mida algo. Los tres simuladores que declaran su propio anillo lo
   pintan en `--d2` a 3,43:1 sobre el panel, por encima del 3:1 de 1.4.11.
5. **~~`check-color.mjs` solo mide contra `--paper`~~ · hecho el 15 de
   septiembre de 2026, y encontró más de lo que el apunte decía.**

   El guion medía dos grupos —las seis series y los nueve acentos— contra una
   superficie y a un solo listón. Ahora hay una tercera comprobación, **la capa
   de tinta**: cada color que se usa como letra, contra el fondo real sobre el
   que cae, en tres escenas —claro, oscuro y **pizarra**, cuyo remapeo se lee
   del bloque `.hero, .banda` de `index.astro` en vez de copiarse—.

   Lo que estaba publicado y nadie medía:

   | token | daba | dónde |
   |---|---|---|
   | `--faint` | 3,43:1 y 3,74:1 | claro — y con él están escritos los rótulos y la meta de media interfaz |
   | `--faint` | 4,42:1 | oscuro, sobre `--panel` |
   | `--flag` | 4,18:1 | claro, sobre el papel |
   | `--tiza-flag` | 4,20:1 | sobre el punto más claro de la pizarra |
   | `--barra-justificar` | 3,50:1 | usado como color de texto |
   | `--d2` | 3,15:1 | **124 rótulos** `<text fill="var(--d2)">` en 28 ficheros |

   Los cuatro primeros se han corregido en el propio token, con el cambio
   mínimo que llega a 4,5. Los dos últimos no se podían corregir ahí: uno es
   el relleno de una franja de la barra de reparto y el otro es un color de
   serie cuyo tono no admite oscurecerse sin juntarse con `--d3` o `--d5` bajo
   dicromacia —se recorrió el espacio entero—. Por eso hay dos tokens nuevos,
   `--marco` y `--d2-tinta`, que son esos mismos colores llevados a 4,5 y que
   **solo** valen para letra.

   Y lo que hace que esto no envejezca: **la lista de tintas no está escrita a
   mano**. Se lee de `src/` —los `color:`, los `fill:` y los
   `fill="var(--x)"` de los `<text>`, que es la forma que se me había escapado
   y donde estaban los 124 rótulos— y una tinta sin fila en la tabla rompe el
   guion. Al encenderlo saltaron dos series más que rotulan, `--d4` y `--d5`;
   las dos pasan AA y ahora están declaradas.

   De paso, dos cosas que aparecieron al abrir el fichero: `block(':root')`
   casaba con la cita «el ÚNICO `:root{}` del repositorio» **del comentario de
   cabecera**, y funcionaba de milagro; y la tabla de §06 de `CLAUDE.md`
   publicaba tres hexadecimales caducados —`--live #0D6E6B`, `--flag
   #B93A2B`—, que es §01 con otra cara. Los literales se han quitado de la
   tabla: el valor de un token se lee en `tokens.css`.

### 10.5 bis · La barra de reparto, medida y sin tocar (nuevo, 15 de septiembre)

Al meter la capa de tinta en `check-color.mjs` salieron de paso los números de
la barra apilada del examen, que no los tenía nadie. Se dejan **medidos y sin
cambiar**, porque cambiarlos es rediseñar una pieza del brief §6 y eso no se
improvisa de madrugada:

| par | contraste |
|---|---|
| `--barra-reconocer` vs `--barra-calcular` | 2,92 |
| `--barra-calcular` vs `--barra-justificar` | 1,77 |
| `--barra-reconocer` vs `--barra-justificar` | 1,65 |

Los tres segmentos son **contiguos** —la barra es un `flex` de tres cajas—, así
que lo que importa es separarlos entre sí, y los tres pares quedan por debajo
de 3:1. Contra el panel también hay dos flojos, cada uno en un tema:
`--barra-reconocer` da 2,12 en claro y `--barra-calcular` 2,68 en oscuro.

Lo que salva la pieza hoy es que **el color no es el único distintivo**: debajo
de la barra va una fila por competencia con su cuadradito y su texto, y los
tres anchos son distintos. Por eso no se ha metido en el guardián con un umbral
rebajado a la medida de lo que hay, que sería exactamente el guardián que se
apaga solo contra el que avisa la cabecera de ese fichero. La pregunta para
Ionan es si la barra tiene que leerse a simple vista o le basta con la leyenda.

### 10.6 · Las cuatro duplicaciones de §01 cuyo próximo fallo es silencioso

1. **La lista de asignaturas — comprobado el 15 de septiembre: en
   `content.config.ts` ya está una sola vez**, en `CON_TEMAS`, desde el 6 de
   septiembre. Lo que **sí** quedaba era una copia vieja fuera de ahí: el
   `getCollection(asignatura.id as ...)` de
   `preparar/[evaluacion].astro` nombraba a mano **dos** asignaturas y llevaba
   cinco sin actualizarse. No rompía nada porque el valor real siempre era
   bueno, pero el tipo mentía. Ahora usa `ConTemas`.
2. **~~La URL de un examen, cuatro veces~~ · hecha el 15 de septiembre de
   2026.** `slugExamen(curso, convocatoria)` vive en `content.config.ts`, al
   lado de `SUFIJO_CONV`, y la usan los cuatro sitios: la portada, el índice
   de exámenes, la página de un examen y la de una ruta. La cuarta era el
   **autocontrol** que comprueba que la carpeta del examen casa con sus datos,
   y estaba escrito contra una copia de la fórmula que vigilaba: un cambio en
   la plantilla se le habría colado sin protestar.
3. **~~`NOMBRE_RUTA` en `index.astro`~~ · arreglado el 15 de septiembre de
   2026.** Era una copia a mano con **7** de las 17 claves, así que las rutas
   de Química y de Mecánica —`1c` y `2c`— caían en el `??` y salían en
   pantalla con el título largo, «Preparar el examen final del primer
   cuatrimestre», reventando la retícula de la caja. Ahora `CONVOCATORIAS`
   lleva un campo `boton` con la etiqueta corta de las diecisiete, y
   `index.astro` la deriva: una clave sin etiqueta rompe el tipo, no el
   diseño.

   ~~Lo que **queda** de este punto: `ETIQUETA` y `FRASE_ESTADO` siguen siendo
   la misma tabla dos veces, a cuatro líneas de distancia.~~ · **hecho el 15 de
   septiembre de 2026**, y eran tres copias, no dos: además de las dos tablas,
   la fila de una asignatura `ok` llevaba la palabra «entera» escrita a mano
   dentro de la plantilla, así que cambiar la tabla habría dejado esa fila
   diciendo lo de antes — que es justo el fallo silencioso que este punto
   describe. Ahora hay una sola tabla, `ESTADO`, con `corta` y `larga`.
4. **~~`revisa-ejercicios.mjs` diverge del esquema~~ · comprobado el 15 de
   septiembre: no diverge.** El guion exige `titulo` de 5 caracteres y el
   esquema también —`min(5)` en el objeto `ejercicio`—. Los `min(3)` que
   parecían la discrepancia son de **otros dos objetos**: el título de un
   **tema** y el de un **paso**. La auditoría comparó campos con el mismo
   nombre en esquemas distintos.

### 10.6 bis · La página de integración se ha pasado de peso (nuevo, 15 de septiembre)

`node scripts/peso.mjs` mide con Chromium a 390 px y la CPU cuatro veces más
lenta. Después de meter los dieciséis ejercicios del boletín básico:

| página | HTML | nodos | listo |
|---|---|---|---|
| `/calculo/t05-integracion/` | **10,5 MB** | 284.977 | **4,6 s** ← |
| `/calculo/t01-complejos/` | 7,6 MB | 198.712 | 2,9 s |
| `/algebra/t07-diagonalizacion/` | 4,9 MB | 133.152 | 1,7 s |

Es la **primera página del sitio que pasa de cuatro segundos**, y la causa es
mía: t05 ha pasado de 32 ejercicios a 48, y cada uno lleva su resolución
entera en el HTML. No lo caza `npm run suelo` —`peso.mjs` no está dentro—, así
que conviene decidir dos cosas: si el umbral entra en el suelo, y si la página
de tema tiene que seguir sirviendo las 48 resoluciones de una vez. La segunda
es arquitectura y no se improvisa; la primera es una línea de `package.json`.

### 10.6 ter · Dos figuras mías recortadas (encontrado y arreglado el 15 de septiembre)

Las tres figuras de Taylor que entraron el 15 de septiembre con el encargo 2 se
verificaron a ojo, extrayendo los SVG de `dist/` y mirándolos. Dos de ellas
**se salían del `viewBox`** y la barrida las cazó en cinco páginas —el tema 4 y
las cuatro rutas que reutilizan la figura—: «eˣ» por la derecha en
`ej-taylor-orden-dos`, y «0,1» y «0,2» por la izquierda en `ej-cota-del-resto`.

La lección no es el arreglo —dos `viewBox` ensanchados— sino **por qué la
comprobación a ojo no bastó**: un rótulo que se sale se ve recortado solo si
miras el borde exacto, y en una captura de 300 px de ancho eso son dos píxeles.
El guardián mide la caja de cada `<text>` contra el marco y no se le escapa. El
orden bueno es al revés del que seguí: primero `humo.mjs`, y la mirada para lo
que el guardián no puede juzgar —si la etiqueta estorba, si el color dice algo—.

### 10.7 · Lo suelto

- **~~Cálculo~~ · hecho el 15 de septiembre de 2026.** El modelo de
  `PlanoComplejo` vive ya en `src/lib/plano.ts`, con 13 casos en
  `tests/fisica/plano.test.ts` y tres botones de caso en el simulador que
  `comprueba-simuladores.mjs` pulsa. Los nueve simuladores tienen fichero:
  **9 ficheros y 166 casos**.

  Y lo que ancla el test no es una fórmula de física —no la hay— sino una
  **distinción**: que `argumento(a,b)` y `arctanIngenuo(a,b)` no calculan lo
  mismo. El caso sale del bloque «Error típico» del propio tema: con
  $z=-1-i$, `arctan` devuelve $\pi/4$ —el argumento del número contrario— y
  el de verdad es $-3\pi/4$. El botón «z a la izquierda» lleva el simulador a
  ese punto, y el guardián comprueba las tres celdas.
- **Fluidos**: decir en la ruta que los cinco parciales de 2019-2021 no tienen
  ruta y por qué (son un formato extinto). Y usar la prosa de los cuatro temas
  que declara y no enlaza.
- **Las 21 + 13 rampas** que `deuda.mjs` no cuenta: aplicar el cuarto criterio
  a **escalón** y no a bloque.
- **~~`calculo-ord`: `medidoSobre: 11` con 12 ordinarias transcritas~~ · hecho
  el 15 de septiembre de 2026, y no era el número que había que cambiar.**

  `medidoSobre: 11` es correcto, y la ruta ya lo decía: su `criterioDeOrden`
  declara que **hay doce ordinarias transcritas y todo se cuenta sobre once**,
  las contiguas de 2015-2016 a 2025-2026, porque la duodécima —2013-2014— está
  suelta ocho años atrás, es de otro formato y ese año la global se llamaba
  «sexta evaluación». Lo que estaba mal era que **tres bloques no respetaban
  esa ventana**, y uno de ellos publicaba un número falso.

  | bloque | publicaba | publica ahora | por qué |
  |---|---|---|---|
  | `fourier` | 10 de 11 | **11 de 11** | las once ordinarias de la ventana traen ejercicio de `t11`; el que faltaba en el recuento es el de 2019-2020 |
  | `laplace` | 11 de 11, «de 2013-2014 a 2025-2026», «los doce» | 11 de 11, «de 2015-2016 a 2025-2026», **trece ejercicios en once años** | mezclaba un año de fuera y se dejaba los **dos** de 2019-2020 |
  | `solidos` | 10 de 11, «superficie en cuatro», «centro de gravedad en dos» | 10 de 11, «en tres» y «en uno» | las dos pruebas que caían eran de 2013-2014, que la propia ruta declara fuera |
  | `dibujar` | «20 de 45, 13 en el apartado a)» | **21 de 51, 14 en el apartado a)** | arrastraba el Fourier de menos, y la población no se pudo reproducir: contando ids del corpus en la ventana salen 51, no 45 |

  Y como Fourier pasa a 11, empata con Laplace y **adelanta al sólido**, que es
  lo que el criterio de esta ruta manda —«por rendimiento medido»—: los dos
  bloques se han permutado. Comprobado con `diff` de los dos ficheros
  ordenados: el multiconjunto de líneas es idéntico, solo se ha movido.

  **La trampa que lo explica todo, y que conviene recordar**: 2019-2020 es la
  única convocatoria cuyos ejercicios **no llevan `-ord-` en el id**. Son
  `ex1920-1` … `ex1920-13`, porque ese año el examen vino en dos cuadernillos y
  se numeró seguido. Cualquier recuento hecho buscando ese trozo se salta sus
  trece ejercicios sin protestar — y 2019-2020 es exactamente el año que
  faltaba en los dos recuentos que fallaban. Los del primer parcial no
  fallaban, y se ve por qué: sus `fuente` enumeran los años uno a uno, así que
  el olvido se habría visto al leerlas. **Un recuento que enumera se revisa; un
  recuento que solo da el total, no.**

  Queda dentro de `deuda.mjs` un guardián nuevo, **§6 bis**, que cierra la
  clase: `medidoSobre` nunca puede ser MENOR que las convocatorias transcritas
  de su propia `evaluacion` —mayor sí, Álgebra leyó ocho PDF y transcribió
  cuatro—. Con `calculo-ord` arreglado, las quince rutas lo cumplen.
- **Química**: las dos rutas prometen fecha de revisión por bloque y la tienen
  3 de 7 y 2 de 8.
- **Un campo `pesoImpreso`** junto a `puntos`, o aceptar por escrito que se
  tira el reparto que Química y Fluidos **sí** imprimen.
- **Los nueve `.readout` sin región viva** — *hecho el 13 de septiembre*.
- **~~Código muerto medido~~ · hecho el 15 de septiembre de 2026, y la mitad
  no estaba muerta.** `EXP_HW`, `fLisoKarman`, `subcapaRelativa` y
  `ADIMENSIONAL` se usan las cuatro **dentro de su propio módulo**: lo muerto
  no era el código sino el `export`, y eso es lo que se ha quitado. Los dos de
  física, que era donde pedía cuidado, siguen calculando lo mismo. Muertos de
  verdad y borrados: la clase `.rotulo--ink` y el token `--step`, que no los
  nombraba nadie.
- **~~`vitest` en `dependencies` y cinco guiones sin entrada~~ · hecho el 15
  de septiembre de 2026.** `vitest` ha pasado a `devDependencies` —el
  despliegue hace `npm ci` sin `--omit=dev`, así que sigue instalándose— y el
  `package-lock.json` se ha regenerado para que no queden desincronizados, que
  es lo que hace fallar a `npm ci`. Los cinco guiones tienen ya su línea:
  `deuda`, `inventario`, `revisa`, `grafica` y `curvas`. El primero era el que
  más molestaba: §04 lo declara la fuente oficial de las cifras y había que
  saberse la ruta del fichero para invocarlo.

### 10.7 bis · Lo que añade la auditoría EXTERNA del 13 de septiembre

Llegó por la noche, hecha sobre `290c722` —o sea, sobre el trabajo de esa misma
tarde— y está en `2027 proyecto contenido/auditorias/`. Lo suyo, ya hecho, va en
el commit correspondiente; esto es lo que deja abierto.

**Dos decisiones que son de Ionan, no encargos.**

1. **Los veinte PDF de Ingeniería Térmica son la resolución completa del
   profesor**, no el cuadernillo: de **14 a 32 páginas** cada uno, 58 MB entre
   los veinte, con el enunciado citado en un recuadro arriba y el desarrollo
   debajo. Comprobado contando páginas y abriendo la primera de la ordinaria de
   2025-2026. §08 autoriza «los enunciados originales»; publicar la corrección
   del profesor es otra cosa, y Ionan dio permiso el 10 de septiembre con un
   «publícalo todo y ya decidiremos después». **Queda por decidir en firme.**
   Lo que sí se ha hecho es que la página deje de llamarlo enunciado: el campo
   `pdfEs` y los cinco rótulos que dependían de él.
   Y la ironía, apuntada para no repetirla: ese mismo día la auditoría interna
   retiró cuatro PDF de esa carpeta **por ser resoluciones del profesor**. Se
   retiraron porque no los enlazaba nadie, y ese criterio tapó que veinte de la
   misma naturaleza seguían enlazados. Dos guardianes mirando el mismo estante
   y ninguno preguntando qué había dentro.
2. **El 4.19 de Materiales** contradice a la profesora en un *método*, no en
   una cuenta. Sigue abierto donde estaba.

**Lo que NO he hecho, y por qué, porque el encargo lo pedía.**

`revisado` sigue a **0 en los 12 bloques de Álgebra y en los 14 de Fluidos**.
El encargo dice «poner `revisado` con fecha»; no lo he puesto. Esa fecha
significa, según el comentario de su propio esquema, «este bloque se pasó por
los criterios de hueco que la ruta declara en su `criterioDeOrden`», y yo he
reordenado escalones, no he pasado veintiséis bloques por cuatro criterios.
Sellar la fecha sería inventar para apagar una métrica — que es literalmente
lo que ese comentario avisa que pasa cuando la métrica no distingue «mirado y
sin huecos» de «sin mirar». **Queda como trabajo de un día, no como sello.**

**Lo que queda de la externa.**

- **~~El móvil, dentro de una ruta~~ · hecho el 14 de septiembre**, y por el
  camino aparecieron **tres páginas de tema que se iban de lado en un
  teléfono** —428, 264 y 42 px— por dos causas encadenadas: un track `1fr` sin
  `min-width: 0` y una regla de KaTeX escrita el 4 de septiembre que llevaba
  diez días sin hacer nada, porque `max-width` y `overflow` **se ignoran en una
  caja `display: inline`**. Ninguna de las diez páginas medidas desborda ya, y
  la pieza dentro de una ruta pasa de 211 a 240 px (279 en una página de tema).
  `humo.mjs` mide ahora los tres tipos de página a 360 px y cuenta cuántas
  resoluciones abre de verdad.
- **~~La paleta de comandos~~ · hecho el 14 de septiembre.** Tildes
  normalizadas en las dos puntas —«entropia» ya encuentra las mismas 17 cosas
  que «entropía»— y los 1.073 títulos de ejercicio de tema indexados: «viga»
  pasa de 0 a 20, «flector» a 6, «Coriolis» a 1, «CIR» a 25. Van en un fichero
  aparte que la paleta pide al abrirse por primera vez, porque meterlos en la
  portada la subía de 27 a 79 KB comprimidos. Y el mensaje de vacío ya no
  promete buscar en los enunciados, que no se buscan.
  **Queda un hueco de contenido que salió de ahí:** «cortante» no aparece en
  ningún título de ejercicio ni en ningún apartado de prosa de todo el sitio —
  solo en siete títulos de paso. En resistencia de materiales eso es raro, y
  se arregla escribiendo, no indexando.
- **Los 3 escalones con un `ejemplo` en medio** que quedan tras el arreglo de
  hoy: los dos de `fundamentos-quimicos-2c` (`p j X`) y el de
  `ingenieria-termica-ord / los-dos-caminos-en-un-sistema-cerrado`
  (`j X X X j X`). No son cierre ni son el fallo grave: hay que mirarlos uno a
  uno. `deuda.mjs` §2 bis los lista.
- **Recontar Térmica** después de rehacer 2025-2026: pasa de 57 resoluciones
  de examen a **52**, y esa cifra está en CLAUDE.md §00 y en `como-vamos.md`.

### 10.7 ter · Cálculo, tras la tercera auditoría del 14 de septiembre

Está en `2027 proyecto contenido/auditorias/`. Verificado antes de tocar nada:
sus cifras se reproducen —425 ejercicios de examen, 59 ejemplos, **3** rúbricas
`redactar`, **0** pasos `dibujar`, y la rampa clavada: 12 de 19 escalones en
`calculo-3ev`, 1 de 12 en `-4ev`, 0 de 12 en `-5ev`—. Añado lo que no dice:
**8 de los 12 escalones de `calculo-5ev` no tienen ni un ejercicio de
colección**, y 11 de 38 en la extraordinaria.

Y una corrección: su apunte «6 ejercicios de examen sin ruta» **es falso**. Los
seis `ex*-2ev-1` de complejos son escalones con su nota en `calculo-2ev`.

**Hecho:** el encargo 7 (las normas del aula y la guía citada) y el 3 (el tipo
de paso `dibujar`, con su primer uso en el 7.3).

**Lo que queda, por rendimiento:**

1. **Los boletines de temas 6–11** (su encargo 1): 70 problemas
   complementarios y 58 básicos, más 24 de los temas 1 y 5. Es el trabajo
   grande y es de días, con el método de Fluidos: resolver a ciegas,
   contrastar con el impreso, publicar lo que dan los datos con el impreso de
   distractor si discrepan. Orden por demanda del examen: t07 (20+23), t09
   (14+6), t08 (12+7), t10 (12+7), t06 (9+10), t11 (3+5). Ojo a lo que el
   propio encargo avisa: **muchos complementarios de 6–11 ya están en el sitio
   como ejercicio de convocatoria y no se duplican** — se les añade el número
   de boletín al título y a la `fuente` para que «7.12» se encuentre.

   **~~t07~~ · terminado el 14 de septiembre de 2026: 23 básicos y 20
   complementarios, los 43.** Los básicos son los 23 del boletín «Integral
   múltiple. Problemas», con su resultado publicado y contrastado uno a uno.
   Los complementarios son 7.1, 7.2, 7.4, 7.5, 7.7 a 7.18, 7.21, 7.24, 7.26 y
   7.27; los siete que ya estaban —7.3, 7.6, 7.19, 7.20, 7.22, 7.23 y 7.25— no
   se han duplicado.

   **Y una discrepancia que hay que dejar dicha:** el **7.24** publica
   $\overline{z}=57/13\approx4{,}38$ y las condiciones tal como están escritas
   dan $9/5$. Comprobado por dos caminos —integración directa y resta al
   cilindro— y con el sólido complementario, que daría $9/2$. Se publica $9/5$
   con el impreso de distractor y el aviso escrito en la resolución. Si algún
   día se puede preguntar en clase, es la pregunta.

   Tres apartados **no** se han transcrito porque dependen de figuras del
   boletín que no se pueden leer sin ambigüedad: los (d) y (e) del 7.4. Están
   declarados en la `fuente` del ejercicio correspondiente.

   **~~t09~~ · terminado el 14 de septiembre de 2026: los 41 apartados del
   boletín básico y los 14 problemas complementarios.** Los cinco que ya
   estaban —9.1, 9.10(d), 9.14, 9.18 y 9.19— no se duplican, y el 9.12
   (b), (c), (d) y el 9.13 entero son los mismos problemas que el
   ejercicio 6 del básico: se les ha añadido la referencia cruzada en vez
   de repetirlos. **Cierra el hueco de ecuación exacta y factor
   integrante**, que tenía cero ejercicios de tema y catorce de examen.

   **~~t08~~ · terminado el 14 de septiembre de 2026: los 7 del boletín
   básico y 11 de los 12 complementarios.** Los cinco que ya estaban
   —8.8, 8.9, 8.10, 8.13 y 8.17— no se duplican. **El 8.1 no se ha
   transcrito**: son siete curvas dadas solo en figuras —tres de ellas en
   perspectiva 3D— y no se pueden describir con palabras sin inventar
   detalles. Está declarado en el comentario de cabecera del bloque.

   **Y el detalle del boletín básico de t09, ya recogido en su sitio.** Lo
   siguiente queda aquí como registro:

   El boletín básico «Ecuaciones diferenciales. Problemas» son 6 ejercicios
   con 41 apartados: el 1 (siete EDOs separables y exactas), el 2 (siete
   homogéneas, lineales y con factor integrante), el 3, 4 y 5 (dieciséis
   lineales homogéneas de coeficientes constantes) y el 6 (doce no
   homogéneas). **Los apartados del 1 y del 2 cubren el hueco declarado más
   arriba**: ecuación exacta y factor integrante, cero ejercicios de tema y
   nueve convocatorias que lo piden.

   Los 41 resultados están comprobados uno a uno —los del 1 y el 2 por
   integración directa, los del 3 al 5 por la ecuación característica y los
   del 6 sustituyendo la solución particular en la EDO—. **Tres del
   ejercicio 6 no cuadran y hay que publicarlos con aviso:**

   | apartado | lo impreso | lo que sale |
   |---|---|---|
   | 6 (d) | $\tfrac{3}{26}\cos 3x+\tfrac{1}{13}\operatorname{sen}3x$ | $\tfrac{3}{13}\cos 3x+\tfrac{2}{13}\operatorname{sen}3x$ — el doble |
   | 6 (f) | $\tfrac{1}{20}x\cos x$ | $\tfrac{1}{20}x\cos 2x$ — falta el 2 |
   | 6 (j) | $\tfrac{1}{32\cos 4x}+\tfrac{1}{4}\tfrac{\operatorname{sen}^{2}x}{\cos 4x}$ | $\tfrac{1}{32\cos 4x}$ a secas |

   Los tres verificados por sustitución analítica **y** por derivación
   numérica. Los otros treinta y ocho cuadran. Y dos de los tres tienen
   confirmación independiente: el 9.13(b) y el 9.12(b) de los problemas
   complementarios son los mismos apartados, allí bien escritos.

   **~~t10~~ · terminado el 14 de septiembre de 2026: los 7 del boletín
   básico y los 12 complementarios.** Los seis que ya estaban —10.7(a),
   10.10(a), 10.10(c), 10.12(d), 10.12(e) y 10.16— no se duplican, y el
   10.4 es el mismo ejercicio que el 4 del básico.

   **Y es el boletín con más erratas de los cuatro.** Todas comprobadas
   por sustitución, y cuatro de ellas con confirmación independiente,
   porque el mismo problema aparece en los dos boletines:

   | dónde | lo impreso | lo que sale | confirmado por |
   |---|---|---|---|
   | básico 2 | falta la $s$ del numerador | $\tfrac{s\,e^{-2\pi s/3}}{s^{2}+1}$ | 10.3(e), el mismo tipo con $c=2$ |
   | básico 5(f) | repite el resultado de 5(c) | $2t^{2}e^{t}$ | 10.5(b), el mismo problema |
   | básico 7(b) y 7(c) | intercambiados, y (b) con los exponentes de signo cambiado | ver la resolución | 10.10(d), el mismo sistema |
   | 10.8(d) | el seno con signo $+$ | $-\tfrac{5}{7\sqrt3}$ | — |
   | 10.11 | $2+e^{-t}+e^{t}$, que no cumple ni la EDO ni los datos | $-2+2e^{2t}+3e^{-t}$ | — |
   | 10.14(b) | $x=0$, que no pasa por $(3,-1)$ | $y\sqrt{x}=-\sqrt3$ | — |
   | 10.15(c) | $S(2{,}05,\,3{,}01)$ | $S(2{,}05,\,3{,}10)$ | la propia recta $y=2x-1$ |

   El **3 del básico** no trae resultado publicado; el que se da está
   calculado y contrastado sumando la serie numéricamente.

   **~~t06~~ · terminado el 14 de septiembre de 2026: los 10 del boletín
   básico y los 10 complementarios.** Los que ya estaban —6.4, 6.9, 6.10,
   6.12, 6.13, 6.14 y 6.17— no se duplican.

   **Y es el único boletín básico que no publica ningún resultado**: las
   cuarenta y una parciales y los cuatro cambios de variable están
   calculados aquí y verificados por derivación numérica, con tres scripts
   que comparan la fórmula simbólica contra diferencias finitas en varios
   puntos. Tres resultados que conviene no perder:

   | ejercicio | lo que sale |
   |---|---|
   | básico 7 | $3Z_{uv}+Z_{u}=0$ — forma canónica hiperbólica |
   | básico 8 | **no simplifica**: se publica tal cual, diciendo que no simplifica |
   | básico 10 | $\cos v\,z_{u}+\operatorname{sen}u\,z_{v}=0$ |

   **~~t11~~ · terminado el 14 de septiembre de 2026: los 5 problemas del
   boletín básico —en 6 ejercicios— y los 4 complementarios que faltaban
   (11.1, 11.2b, 11.3 y 11.4).** Los que ya estaban —11.2(a), 11.5, 11.6,
   11.7, 11.8 y 11.9— no se duplican.

   **Y una errata más, en el básico:** el apartado 2(b) —onda cuadrada de
   $\pm8$ con $T=4$— trae impreso $\tfrac{32}{\pi}$ delante del sumatorio,
   y el coeficiente correcto es $\tfrac{16}{\pi}$: lo impreso da el doble.
   Comprobado por integración numérica y contra la fórmula estándar
   $b_n=\tfrac{4A}{n\pi}$ de la onda cuadrada. Los otros cuatro apartados
   del ejercicio 2 y los ejercicios 1, 3, 4 y 5 cuadran todos.

   **~~t01~~ · terminado el 14 de septiembre de 2026: los 10 problemas del
   boletín básico «Números complejos. Problemas».** Los complementarios del
   tema 1 ya estaban todos.

   **El boletín no publica ninguna solución**, así que los diez resultados
   son míos y están comprobados numéricamente: las seis ecuaciones por
   sustitución en el seno y el coseno complejos, y los siete lugares
   geométricos comparando región contra región con `mismaRegion` de
   `src/lib/regiones.ts` —cero celdas de desacuerdo en 8.100 en los doce
   pares probados—.

   **Y aquí es donde el patrón `verificar` por fin se usa como debe.** Ocho
   de los nuevos pasos son verificadores de región, y eso sube el tipo de
   25 a 33 usos. Los lugares que entran: la circunferencia de Apolonio del
   4(f), el arco capaz del 5(c), la corona entre elipses confocales del 6,
   la media elipse del 7, la elipse de focos $4i$ y $-i$ del 8, el medio
   disco elíptico del 9 y la mediatriz del 10.

   **~~t05~~ · terminado el 14 de septiembre de 2026: el boletín básico
   «Integración. Problemas» entero, en 16 ejercicios** — las cinco tandas
   de integrales indefinidas, las dos funciones valor medio, las dos
   impropias y los nueve problemas de aplicaciones.

   **Y es, con diferencia, el boletín con más erratas de los ocho: doce.**
   Todas comprobadas derivando la primitiva impresa y comparándola con el
   integrando en cuatro puntos.

   | dónde | lo impreso | lo que sale |
   |---|---|---|
   | 1(f) | $e^{-x}(x^2+5)e^{-x}$ | $-e^{-x}(x^2+5)$ |
   | 1(g) | un $x^3$ de más delante | $-3e^{-x/3}(x^3+9x^2+54x+162)$ |
   | 1(h) | termina en $-\tfrac14$ | $-\tfrac{x}{4}$ |
   | 3(b) | $\arctan\left(\tfrac{\tan x}{2}+1\right)$ | sin el $+1$ |
   | 3(e) | $\arctan\left(\tan\tfrac x2\right)$ | con $\sqrt3$ dentro |
   | 4(d) | se lee $\tfrac{\sqrt5}{8}$ | $\sqrt{\tfrac58}$ |
   | 5(b) | tres términos multiplicados por 3 | divididos entre 3 |
   | 5(d) | $\tfrac{2\sqrt3}{9}\arctan$ | $\tfrac{4\sqrt3}{9}\arctan$ |
   | 5(f) | $\tfrac x6(\cos+\operatorname{sen})$ | $\tfrac{x}{10}(\cos+2\operatorname{sen})$ |
   | 5(g) | $\ln\lvert x^2-x+1\rvert$ y $\tfrac{\sqrt3}{2}\arctan$ | $\ln(x^2+x+1)$ y $\sqrt3\arctan$ |
   | 5(j) | otra combinación con un $\ln\lvert\tan^2x+1\rvert^3$ | la de la resolución |
   | aplic. 8 | $L=\tfrac{\operatorname{argsh}3}{2}\approx0{,}91$ | $\tfrac{3\sqrt{10}+\operatorname{argsh}3}{2}\approx5{,}65$ |

   La última se descarta sin integrar: el arco une $(-2,0)$ con $(1,0)$, así
   que **no puede medir menos de 3**.

   **Con esto el encargo 1 de Cálculo queda cerrado**: t01, t05, t06, t07,
   t08, t09, t10 y t11, los ocho boletines.

   **Y un aviso de intendencia.** Con el corpus en 1.900 ejercicios,
   `npm run humo` tarda **más de una hora**. Ya no se puede lanzar una
   barrida por cada tanda: conviene agrupar varias tandas, correr
   `build + verify + recalcula + deuda + test` en cada una —que son cinco
   minutos— y dejar la barrida para antes de empujar. Si el tiempo sigue
   creciendo habrá que partirla por asignatura.

2. **~~Los ejercicios que piden dibujar~~ · terminado el 15 de septiembre de
   2026: 178 pasos `dibujar`, de 3 que había.** El tipo pasa de ser una
   promesa a ser el tercero más usado después de `calcular` y `reconocer`.

   **Y el recuento estaba mal en las dos direcciones.** Este cuaderno decía
   185; contados con el filtro burdo salían 243; y contados bien —exigiendo
   un verbo imperativo de dibujo **fuera** del `<figure>`, porque los
   `<desc>` de los SVG contienen «dibuja» y «representa» a mansalva— son
   **178 más 7**. Los 7 no piden dibujar sino **leer** un dibujo dado —los
   cuatro de t04, el de áreas con signo de t05 y tres de examen—: esos no
   llevan paso `dibujar` y **no son deuda**.

   | dónde | pasos |
   |---|---|
   | t01 | 25 |
   | t05 | 9 |
   | t06 | 4 |
   | t07 | 10 |
   | t11 | 3 |
   | exámenes | 127 |

   Cada paso es una lista de comprobación específica del ejercicio, sacada
   de su propia resolución: qué tiene que aparecer en el dibujo y **por qué
   decide algo**. Lo que queda de esta familia es opcional y es adorno:
   mover al paso las 188 figuras que ya están en las resoluciones, para que
   el alumno pueda comparar su dibujo con el bueno. El campo `figura` del
   esquema es opcional a propósito.
3. **~~Nueve rúbricas `redactar` más~~ · seis escritas el 14 de septiembre**,
   de 3 pasos a 21. Hechas: la definición formal de límite con cuantificadores,
   el signo del límite, la unicidad del límite (no estaba en su lista y es la
   tercera demostración clásica del tema 2), Rolle, el enunciado de Taylor con
   su resto y la identidad del seno de una suma en el plano complejo.

   **~~Quedan tres~~ · las tres están, y ya estaban: comprobado el 15 de
   septiembre.** Fermat vive en
   `ex1617-ext-3-por-que-la-derivada-se-anula-en-un-maximo`, el punto fijo en
   `ex1516-3ev-3-punto-fijo-con-unicidad` y el factor integrante en
   `ex1718-ext-6-el-factor-que-hace-exacta-la-edo`. Las tres colgadas de un
   ejercicio de examen, que es donde tenían que ir. **El encargo 3 está
   cerrado.**

   Y el hueco de contenido que las acompañaba **también se cerró**, en la
   misma tanda del encargo 1: el tema 9 tiene ahora
   `seis-exactas-y-su-potencial` y `seis-factores-integrantes`, así que la
   familia que el examen pide en nueve convocatorias ya no está a cero.

   **Y ahí está el hallazgo, que es de contenido y no de rúbricas:**

   | familia | ejercicios de tema | de examen |
   |---|---|---|
   | ecuación exacta | **0** | 9 |
   | factor integrante | **0** | 5 |
   | punto fijo | **0** | 3 |
   | Fermat | **0** | 1 |
   | Darboux | **0** | 1 |

   El tema 9 no tiene ni un ejercicio de ecuación exacta y **el examen la pide
   en nueve convocatorias**. Eso no se arregla con una rúbrica: se arregla
   transcribiendo boletín, y es del encargo 1.
4. **~~El formulario imprimible~~ (encargo 5) · hecho el 15 de septiembre.**
   `/calculo/formulario/` junta los once «Lo que hay que llevar sabido» y sale
   a dos columnas al imprimir. Cierra los **dos** huecos que el bloque
   `formulario` declaraba desde el 6 de septiembre, y el segundo decidió cómo
   está hecha: «las listas son una segunda copia de la teoría, y si un día se
   corrige arriba y no aquí, esto miente». Así que **no transcribe ni una
   línea** — lee el apartado del `index.mdx` de cada tema y lo pasa por el
   mismo `mate()`. Corregir una fórmula arriba la corrige allí.

   El corte se hace sobre el markdown de origen y no sobre el HTML publicado,
   y esa fue la parte que costó: en el HTML ese apartado es el último de la
   prosa y no tiene un `<h2>` detrás donde parar, así que el trozo salía de
   **1,1 MB** — el tema entero con sus ejercicios.

   Sirve a cualquier asignatura con ese apartado; hoy solo Cálculo lo tiene en
   sus once temas.

5. **~~Los ejemplos de leer una gráfica~~ (encargo 6) · los seis, el 15 de
   septiembre**, cada uno con figura propia a escala y enlazado desde el
   escalón donde hace falta.

   | ejemplo | tema | qué hueco tapa |
   |---|---|---|
   | `ej-integral-contando-areas` | t05 | ∫ como área **con signo** —vale 0 mientras el área geométrica vale 6— y dónde hace cumbre F(x)=∫₀ˣf |
   | `ej-leer-la-grafica-de-efe` | t04 | f, f′ y f″ leídas del mismo dibujo |
   | `ej-el-cuadrado-de-la-derivada` | t04 | h=(f′)², un enunciado **repetido idéntico** en 2017-18 y 2023-24 y sin rampa |
   | `ej-leer-un-mapa-de-niveles` | t06 | curvas de nivel · **primera figura del tema** |
   | `ej-serie-decidida-en-la-grafica` | t02 | Σk·g(x)ᵏ · **primera figura del tema** |
   | `ej-signos-del-polinomio-de-taylor` | t04 | los tres coeficientes leídos del dibujo, 6 convocatorias |

   **Y el hueco era mayor que el declarado.** El encargo decía que 13
   ejercicios de examen entregan una gráfica; contados son **69**. Y dos temas
   enteros —el 2 y el 6— no tenían **ni una figura** en sus ejemplos mientras
   sus exámenes reparten gráficas: ese hueco no estaba en ninguna lista.

   Lo que queda de esta familia no son ejemplos sino **figuras que faltan**:
   `ej-taylor-orden-dos`, `ej-cota-del-resto` y `ej-componer-un-desarrollo`
   siguen explicando Taylor sin dibujo.

**~~Bloqueado por un dato que solo tiene Ionan (§13 caso 5)~~ · desbloqueado el
15 de septiembre de 2026.** El simulacro cronometrado (encargo 4) necesitaba
cuánto dura cada parcial, y no está impreso en ningún PDF ni en la normativa de
examen — se buscó ahí primero—. Lo dijo Ionan: **treinta minutos por
ejercicio**. Y estaba mal planteado por mi parte: no es un dato por
convocatoria sino **una regla por asignatura**, porque el corpus ya sabe
cuántos ejercicios imprime cada cuadernillo. Vive en el catálogo con su fuente
y la página multiplica. Ver la fase de mañana, punto 4.

**Y un hallazgo de paso, del sitio entero y no de Cálculo:** a 360 px los
rótulos de las figuras SVG se renderizan a **7-7,6 px reales**. No es una
figura mal hecha, es aritmética: los `viewBox` rondan 340-470 unidades y se
pintan en 258-328 px, así que un `font-size="10"` acaba en siete. Habría que
decidir un mínimo legible y medirlo, no arreglar una figura suelta.

### 10.8 · Expresión Gráfica: lo que se puede hacer hoy sin la fase de diseño

La auditoría confirma que **no la bloquea el material**: hay temario completo,
`Colección_de_ejercicios.pdf`, `Ejercicios_-_Solución.pdf` y los criterios de
corrección. La bloquea que su examen es un dibujo, y eso es trabajo. Pero
sigue con `temarioOficial: false` y **sin `evaluacion`** teniendo la guía y los
criterios entre el material: eso se puede escribir ya, y es lo que la sacaría
de `prev`.

**Y hay más de lo que este fichero sabía.** La auditoría externa avisa de que
la fase de diseño **ya está hecha** desde el 8 de septiembre y entregada fuera
del repositorio: `2027 proyecto contenido/Claude outputs/expresion-grafica-paquete.zip`
(y un `-1.zip` posterior), con el brief de arquitectura, un extractor que saca
las 65 láminas de la colección como coordenadas del PDF vectorial, las 65
figuras en JSON, el ejemplo YAML de un paso `construir` nuevo, el motor
genérico y cuatro ejercicios probados. **Comprobado que los ficheros existen**;
no los he abierto ni metido en el repositorio, porque eso es capa compartida y
un tipo de paso nuevo (§13). El orden que propone la externa:

1. sacarla de `prev` con lo que ya se sabe —`temarioOficial: true`, los tres
   bloques de la guía y su `evaluacion` (diédrico 30 %, dibujo técnico 55 %,
   CAD 15 %, con mínimo de 4 en cada examen)—, citando la guía;
2. meter el paquete en `referencia/expresion-grafica/` **sin el PDF de la
   colección** (las figuras van como JSON de coordenadas);
3. construir `Taller.astro` + `lib/diedrico.ts` con SD1 de primer caso, y los
   tests de geometría antes que el componente (§10).

Y su argumento de orden, que hay que responder: es la única de **1.º** sin
abrir, con 9 ECTS y todo el material, y §00 pone 1.º antes que 2.º — pero se
abrió Sistemas, que es de 2.º y sin exámenes. Ionan dijo «deja sistemas para
el final», así que el conflicto puede que ya esté resuelto; conviene decirlo
donde se vea.

⚠️ En esa carpeta hay dos ficheros de calificaciones. No se abren.

---

## Lo que NO se va a hacer, y por qué

- **Abrir la sexta antes de cerrar Térmica.** §00.
- **~~Abrir la séptima sin que lo decida Ionan~~ · decidido el 12 de
  septiembre de 2026: se abre Mecánica Aplicada, fase 8.** Lo que decía este
  punto, para que se entienda la decisión: era un conflicto de §00 y lo
  dejé anotado en vez de resolverlo (§13, caso 3). La regla dice que no se
  abre una hasta cerrar la anterior, y Materiales **no se puede cerrar**: le
  falta material, no trabajo —no hay exámenes—, y quedó en `obra` la noche
  del 12 de septiembre de 2026 con todo lo escribible escrito. Las tres que
  quedan tampoco traen exámenes, así que abrir cualquiera deja otra
  asignatura en el mismo sitio. Hay dos salidas y las dos son suyas:
  conseguir exámenes de alguna —Materiales se cerraría con su ruta, y
  Mecánica Aplicada sigue siendo la recomendación de arriba si aparecen los
  suyos—, o cambiar §00 para que una asignatura bloqueada por material no
  bloquee la siguiente.
- **Escribir los ocho `fuera` que le quedan a Térmica.** Cuatro ya tienen su
  resolución en otra convocatoria, tres examinan ciclos de potencia y R-134a,
  que salieron del temario, y el de la tobera del 30 de enero de 2023 necesita
  antes redibujar el diagrama de Mollier, que es de una editorial (§08).
- **La página de formulario propia** de Álgebra y Cálculo. Está declarada en
  siete `falta[]` y es trabajo de diseño, no de contenido: merece su propio día.
- **Enlazar los 97 de Álgebra y los 130 de Fluidos.** Las rutas son selectivas a
  propósito; convertirlas en catálogo sería deshacer §14.

---

## Lo hecho el 10, el 11 y el 12 de septiembre

- **Fase 0 · publicar los PDF de Térmica.** Ionan eligió la A el 10: «publícalo
  todo y ya decidiremos después». 64,1 MB en 24 ficheros, justificado contra
  §12. El historial de git conserva los ficheros aunque un día se recorten.
- **Fases 1 y 5B · las convocatorias.** Veinte de veintidós montadas con su
  PDF; las dos de 2014-2015, declaradas imposibles —un folio cada una, solo en
  euskera y sin resolución—.
- **Fase 2 · los escalones de exergía**, con su segundo peldaño cada uno.
- **Fase 4 · mirar las páginas**, con la barrida completa a un fichero.
- **Fase 5A · los cinco ejercicios** de las tres convocatorias a medias.
- **Fase 5C · los veinte ejercicios `fuera` con resolución detrás**, cerrada el
  12 de septiembre: 20 de 20. El contraste contra las resoluciones oficiales
  encontró erratas de copia en varias, cuatro enunciados repetidos entre
  convocatorias y, en la bomba de enero de 2021, **el primer error de concepto**
  de una resolución oficial: da un rendimiento exergético del 3,88 % donde es
  el 82,7 %.
- **Fase 3 · las frases con número**: hecha en cuatro asignaturas y pendiente
  en Térmica. Pasa a ser la 6.3.

> **Ojo con dar por hecho el idioma mirando una página**, que acabó fallando
> **seis veces en una tanda y en los dos sentidos**. Primero se publicó que
> enero de 2025 «sale solo en euskera» tras mirar su primera página, y era
> falso: el castellano está en la segunda — costó dejar fuera de alcance un
> ejercicio perfectamente transcribible durante unas horas. Después apareció el
> reverso cinco veces seguidas: enero de 2024, enero de 2022, febrero de 2021,
> febrero de 2020 y junio de 2018 llegaron a escribirse como «solo en
> castellano» y las cinco son bilingües.
>
> Siempre el mismo error: mirar **una** página de veintitantas. La regla, ya
> con seis casos: antes de decir en qué idioma está una convocatoria —para
> incluirla o para descartarla—, **se mira la página siguiente**. Si es la
> resolución, no hay otra versión; si es el mismo examen en el otro idioma, es
> bilingüe. Cuesta treinta segundos y las seis veces lo habría evitado.
