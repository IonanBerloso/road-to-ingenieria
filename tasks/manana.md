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

**Bloqueada por la fase 6** (§00). Pero lo que hay que averiguar para ella se
puede ir contestando mientras tanto, y hay una pregunta que no me corresponde.

### Lo medido, sin abrir un fichero

Contado el 12 de septiembre de 2026 por los **nombres** de los ficheros de
`Desktop/2027 proyecto contenido/` y de `Documents/…/Proyecto 2026-2027/`:

| asignatura | curso | material | exámenes |
|---|---|---|---|
| Expresión Gráfica | 1.º | 51 ficheros: geometría descriptiva, normalización, vistas, acotación, tolerancias, uniones y conjuntos; una colección con soluciones; criterios de corrección | **ninguno** — solo las dos actas de notas, vetadas |
| Mecánica Aplicada | 2.º | 17: teoría y colección de ejercicios de los **ocho temas**, del cálculo vectorial al movimiento plano | **ninguno** — el de notas del parcial, vetado |
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

## Lo que NO se va a hacer, y por qué

- **Abrir la sexta antes de cerrar Térmica.** §00.
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
