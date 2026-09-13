# Fases del 12 de septiembre de 2026

Escritas al cerrar la deuda de ejercicios de Térmica, sobre lo que quedó
**medido**, no sobre impresiones. Cada fase dice qué la desbloquea, qué se
entrega y cómo se comprueba.

Las fases del 10 y el 11 de septiembre están resumidas al final, en una línea
cada una. Su texto completo, con el rastro de cómo se corrigieron sus cifras,
está en el historial de este fichero: `git log -p tasks/manana.md`.

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

### 10.1 · Térmica 2025-2026: los enunciados reconstruidos (§08)

Es lo más grave que queda. El examen tiene **3 ejercicios** y el sitio publica
**7**, con los enunciados reescritos: uno **añade un apartado que no existe**,
dos incrustan en el cuerpo del enunciado valores calculados que no están en el
original, y otro dice «el condensado del ejercicio anterior» refiriéndose al
ejercicio *del sitio*. Ninguna `fuente` lo declara.

- **Desbloquea:** nada, se puede hacer ya. El PDF está en
  `public/examenes/ingenieria-termica/2025-2026-ord.pdf`.
- **El patrón bueno ya existe en el repo:** `2020-2021-ord/` transcribe literal
  y añade los datos arrastrados en un bloque en cursiva rotulado «*Lo que hace
  falta del ejercicio anterior…*». Se copia eso.
- **Se comprueba** releyendo los siete contra el PDF, apartado por apartado.
- **Y `2025-2026-ext` publica 4 por 3**: la misma revisión.

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

### 10.4 · `calculo-ext`: ordenar como dice que ordena

Seis bloques fuera de sitio en las dos mitades. O se reordenan, o el
`criterioDeOrden` dice la razón real. `calculo-ord` sí lo cumple, así que hay
patrón.

### 10.5 · Los guardianes que se creen más fuertes de lo que son

En orden de rendimiento:

1. **`comprueba-simuladores.mjs` y §11 dicen «contra el examen» donde no lo
   es.** Seis de los nueve comparan contra prosa nuestra, y el «el examen dice
   228» de §11 sale de `t20-golpe-ariete/index.mdx:218`. *Media hora, y cambia
   lo que el proyecto cree saber de sí mismo.* (`tests/fisica/README.md` ya
   publica la distinción fila por fila.)
2. **`humo.mjs` y los 360 px:** mide seis páginas fijas que nunca rotan,
   ignora `HUMO_TODO`, se traga el fallo de abrir la resolución y **nunca abre
   una página de tema** — que es justo donde el sitio se desbordaba el 4 de
   septiembre.
3. **La portada se abre sin escuchas de error de JavaScript**, y es la página
   con FLIP, `:target` y paleta de comandos. Dos líneas.
4. **`verify.mjs` y el foco visible:** busca `outline: none`; un botón sin
   ninguna regla de foco pasa.
5. **`check-color.mjs` solo mide contra `--paper`:** fuera quedan `--panel`,
   la paleta de pizarra entera y los `--barra-*`. Y `--barra-justificar` se
   usa como color de texto a 3,50:1 sobre `--panel`, por debajo de AA.

### 10.6 · Las cuatro duplicaciones de §01 cuyo próximo fallo es silencioso

1. **La lista de asignaturas, tres veces en `content.config.ts`** — cinco
   líneas de `Object.fromEntries` y deja de poder desaparecer una asignatura
   sin romper el build.
2. **La URL de un examen, cuatro veces** (una de ellas es un autocontrol
   escrito contra una copia). Una función de tres líneas.
3. **`NOMBRE_RUTA` en `index.astro`** duplica `CONVOCATORIAS[k].corta` y cubre
   7 de las 17 claves: **Química y Mecánica salen con el título largo y se ve
   en pantalla.** Y `ETIQUETA`/`FRASE_ESTADO` son la misma tabla dos veces, a
   cuatro líneas de distancia.
4. **`revisa-ejercicios.mjs` ya diverge del esquema**: `titulo` ≥ 5 contra
   ≥ 3. Un carácter.

### 10.7 · Lo suelto

- **Cálculo**: extraer la física de `PlanoComplejo` a `src/lib/plano.ts` y
  escribir su caso. Es la única casilla de §15 que le falta a la asignatura de
  referencia.
- **Fluidos**: decir en la ruta que los cinco parciales de 2019-2021 no tienen
  ruta y por qué (son un formato extinto). Y usar la prosa de los cuatro temas
  que declara y no enlaza.
- **Las 21 + 13 rampas** que `deuda.mjs` no cuenta: aplicar el cuarto criterio
  a **escalón** y no a bloque.
- **`calculo-ord`**: `medidoSobre: 11` con 12 ordinarias transcritas.
- **Química**: las dos rutas prometen fecha de revisión por bloque y la tienen
  3 de 7 y 2 de 8.
- **Un campo `pesoImpreso`** junto a `puntos`, o aceptar por escrito que se
  tira el reparto que Química y Fluidos **sí** imprimen.
- **Los nueve `.readout` sin región viva** — *hecho el 13 de septiembre*.
- **Código muerto medido**: `EXP_HW`, `fLisoKarman`, `subcapaRelativa`,
  `ADIMENSIONAL`, `.rotulo--ink`, `--step`. Los dos de física con cuidado.
- **`vitest` está en `dependencies`**, y cinco guiones no tienen entrada en
  `package.json` —entre ellos `deuda.mjs`, que §04 declara la fuente oficial
  de las cifras—.

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

- **El móvil, dentro de una ruta** (su §5). A 360 px las piezas de
  `justificar` miden **184 px** dentro de `preparar/`, contra 328 px en una
  página de tema: la ruta anida ejercicio dentro de escalón dentro de bloque y
  cada nivel se lleva 8–20 px por lado. Es el fallo de los 145 px del 4 de
  septiembre un nivel más adentro, y ningún guardián lo ve porque `humo.mjs`
  mide 360 px en seis páginas de examen fijas. *Encargo: quitar el padding
  lateral de `.bcaja`, `.escalon` y `.ejercicio` bajo 480 px hasta que el
  párrafo pase de 280 px, y meter una ruta por asignatura en esa medida.*
- **La paleta de comandos** (su §4): «viga», «flector», «cortante»,
  «Coriolis», «lmp» y «diedrico» no devuelven nada, y «entropia» sin tilde
  tampoco aunque «entropía» dé doce. Las 757 entradas son asignaturas, temas,
  rutas y apartados — **ningún ejercicio**, y el mensaje de vacío promete
  «prueba con una palabra del enunciado». *Encargo: normalizar tildes en la
  clave y en la consulta, indexar los 1.742 títulos de ejercicio, y que el
  mensaje prometa lo que hace.*
- **Los 3 escalones con un `ejemplo` en medio** que quedan tras el arreglo de
  hoy: los dos de `fundamentos-quimicos-2c` (`p j X`) y el de
  `ingenieria-termica-ord / los-dos-caminos-en-un-sistema-cerrado`
  (`j X X X j X`). No son cierre ni son el fallo grave: hay que mirarlos uno a
  uno. `deuda.mjs` §2 bis los lista.
- **Recontar Térmica** después de rehacer 2025-2026: pasa de 57 resoluciones
  de examen a **52**, y esa cifra está en CLAUDE.md §00 y en `como-vamos.md`.

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
