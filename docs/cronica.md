# Crónica de CLAUDE.md

Lo que `CLAUDE.md` contaba en presente y era historia. Se sacó de allí el 26
de septiembre de 2026, en la auditoría completa, **sin tocar una coma**: cada
bloque de abajo es el texto que había, con la sección de la que salió.

**Por qué se sacó.** `CLAUDE.md` había llegado a 3.052 líneas, y su §00 —«Qué
es esto», lo primero que lee cualquiera— eran doscientas cincuenta líneas de
cortes fechados («Al 6 de septiembre…», «Y esa misma noche…») que se
contradecían entre sí: Térmica aparecía en `obra` ciento setenta líneas
después de haber pasado a `ok`. La regla de no reescribir cada corte, para
que se viera qué cambiaba y a qué velocidad, era buena; lo malo era dónde
vivía. Aquí sigue valiendo: **esto se amplía por abajo y no se reescribe.**

El estado de hoy no está aquí: está en el catálogo (`estado` y `motivo` de
cada asignatura) y las cifras las da `npm run deuda`. El día a día, en
`diario/`.

---

## §00 · El estado, corte a corte (del 6 al 13 de septiembre de 2026)

> **Al 6 de septiembre de 2026 las cuatro abiertas están cerradas contra §15**:
> Cálculo, Álgebra, Mecánica de Fluidos y Fundamentos Químicos. Son
> **51 temas publicados** —más tres declarados `soloEnClase` con su motivo—,
> **118 convocatorias** transcritas con su PDF, **doce rutas** y **1.270
> ejercicios**. Quedaban entonces cinco asignaturas en `prev` —hoy cuatro, con
> Térmica ya en `obra`—, y la regla de arriba dice qué hacer con ellas: se abre
> una, y no se abre la siguiente hasta cerrarla.
>
> **Al 10 de septiembre de 2026**, con Térmica dentro: **61 temas**,
> **124 convocatorias** —las 118 de siempre más **seis de Térmica**, montadas
> esa tarde con sus PDF, que Ionan decidió publicar—, **trece rutas** con 110
> bloques y 295 escalones, y **1.332 ejercicios**. Las cifras de esta nota son
> un corte con fecha, no un estado: se añade una línea nueva y no se reescribe
> la anterior, para que se vea qué cambia y a qué velocidad.
>
> Con eso Térmica deja de tener el hueco que la mantenía en `obra` **por
> definición** —§15 exige el PDF original y no había ninguno— y pasa a tener
> uno **medible**: de sus 22 convocatorias hay seis montadas y **dieciséis por
> transcribir**, dos de ellas en euskera y por tanto fuera del alcance del
> sitio (§00). Es un cambio de naturaleza más que de tamaño: antes faltaba una
> decisión, ahora falta trabajo.
>
> **Al 11 de septiembre de 2026, ese trabajo está hecho**: **61 temas**,
> **138 convocatorias** —las 118 de siempre más las **veinte** de Térmica que
> se pueden montar—, **trece rutas** y **1.352 ejercicios con 5.547 pasos**.
> Las dieciséis que faltaban se cerraron en una tanda: catorce montadas esa
> noche y **las dos de 2014-2015 declaradas imposibles** con su motivo, que es
> lo que §15 pide de un hueco. Son un folio cada una, solo en euskera y sin
> resolución: traducirlas sería inventarlas.
>
> Lo que a Térmica le queda para cerrarse contra §15 ya no son convocatorias
> sino **los ejercicios que cada una deja `fuera`**, y esos sí están contados,
> uno a uno, el 11 de septiembre de 2026: son **28**, y no todos son deuda.
>
> | por qué está fuera | cuántos |
> |---|---|
> | trabajo pendiente, con su resolución oficial detrás | 20 |
> | ya cubierto por otro ejercicio del corpus, o repetido | 4 |
> | fuera del temario actual — ciclos de potencia y R-134a | 3 |
> | falta material: se resuelve leyendo el diagrama de Mollier | 1 |
>
> La distinción importa porque solo la primera fila es trabajo. Los tres de
> temario no se van a escribir nunca —los ciclos salieron del programa—, los
> cuatro repetidos ya tienen su resolución en otra convocatoria, y el de
> Mollier —la tobera del 30 de enero de 2023— necesita antes que alguien
> redibuje ese diagrama, porque el del examen es de una editorial (§08).
>
> **Al 12 de septiembre de 2026, la primera fila de esa tabla está a cero.**
> Los veinte ejercicios con su resolución oficial detrás están escritos,
> contrastados cifra a cifra y enganchados en la ruta: el corpus pasa a
> **1.372 ejercicios y 5.661 pasos**, y Térmica a **57 resoluciones de
> examen** en sus veinte convocatorias. Los ocho `fuera` que quedan son las
> otras tres filas, y ninguna es trabajo. El contraste siguió encontrando
> erratas —un factor mil de unidades, un calor específico escrito donde no
> tocaba— y, por primera vez, **un error de concepto** en una resolución
> oficial: el rendimiento exergético de una bomba dado en un 3,88 % cuando es
> el 82,7 %, por dejar fuera el término v·ΔP de la entalpía de un líquido
> (enero de 2021, ejercicio 3). El sitio publica el bueno y explica el otro.
>
> Lo que le queda a Térmica para pasar a `ok` ya no es contenido, y está
> escrito en `tasks/manana.md`, fase 6.
>
> **Y ese mismo 12 de septiembre de 2026, Térmica pasa a `ok`**: la quinta
> asignatura cerrada contra §15. Lo que le faltaba no era contenido, eran tres
> cosas. La fuente de su evaluación citaba un documento con datos personales, y
> se sustituyó por la guía docente pública, que además trae dos mínimos que el
> sitio no decía: el 40 % del examen y el 25 % de cada ejercicio. Sus **183
> respuestas de examen** se recalcularon en `tests/verificacion/`, y el pase
> encontró seis casillas que corregían mal, todas arregladas (§17). Y los dos
> escalones de un solo ejercicio que eran deuda tienen ya su caso de examen.
> Siguen en pie sus huecos declarados: las dos convocatorias de 2014-2015, solo
> en euskera, y los ocho `fuera` que no son trabajo.
>
> La regla de arriba se aplica ahora a la sexta: se abre una, y no se abre la
> siguiente hasta cerrarla. **Ninguna de las cuatro que quedan trae exámenes en
> el material**, y eso decide por dónde se empieza; está en `tasks/manana.md`,
> fase 7.
>
> **Y la sexta se abre ese mismo día: Ciencia de Materiales**, por decisión de
> Ionan —«haz materiales primero»—, no por la recomendación escrita, que era
> Mecánica Aplicada. Queda en `obra` con su temario oficial de diez temas y su
> evaluación, las dos copiadas de la guía del alumnado 2025-2026. Arranca con
> dos huecos declarados desde el primer día: **no hay ni un examen** entre el
> material, así que su ruta no se puede medir, y **los temas 7 a 10 no tienen
> material de la profesora** —se trabajan con presentaciones de los alumnos,
> que llevan sus nombres y no se abren—. El plan, tema a tema, está en
> `tasks/manana.md`.
>
> **Y la noche de ese 12 de septiembre de 2026, Materiales tiene escrito todo
> lo que se puede escribir**: sus **diez temas publicados** —71 en el sitio—,
> cada uno con prosa, figura y ejemplos propios, y **los 99 ejercicios de su
> colección** resueltos paso a paso y contrastados contra su resultado
> impreso. La asignatura suma 120 ejercicios y el corpus pasa a **1.492
> ejercicios y 6.270 pasos**. Diez de esos 99 se leen de una curva de libro y
> entraron cuando las curvas estuvieron redibujadas a escala: **dieciocho
> figuras de libro** en los temas 2 a 6 (§08).
>
> Sigue en `obra`, y ya no por trabajo: sin exámenes no hay ruta que medir
> (§14) ni convocatorias que transcribir (§15). El contraste volvió a
> encontrar erratas en un documento oficial —tres resultados impresos que la
> figura no da, en los problemas 3.23, 3.26 b) y 3.27 b)— y se publicaron
> como en Térmica: la lectura buena en la casilla y la impresa como
> distractor explicado. Y queda **una pregunta para la profesora**, que no me
> corresponde resolver: el 4.19 imprime un 44,8 % que sale de mezclar dos
> temperaturas en la regla de la palanca, y el sitio publica el 55,2 %
> coherente con la fórmula del tema y explica el otro. Está en
> `tasks/manana.md`.
>
> **Y esa misma noche se abre la séptima, Mecánica Aplicada**, por decisión
> de Ionan —«sigue con el plan de la siguiente fase»— y con Materiales todavía
> en `obra`. Es una excepción a la regla de arriba y conviene decirla como
> tal: Materiales no se puede cerrar porque le falta material, no trabajo, y
> esperar a que aparezcan sus exámenes habría parado el proyecto entero.
> Mecánica Aplicada era la recomendación escrita, y al abrirla resultó que
> **sí tiene exámenes** —ocho convocatorias, tres de ellas con el enunciado en
> castellano— que la tabla del plan no veía porque se contó sobre una copia
> parcial del material. El plan está en `tasks/manana.md`, fase 8.
>
> **Y en la madrugada del 12 de septiembre de 2026, Mecánica Aplicada tiene
> los doce temas escritos y sus tres convocatorias montadas.** Cada tema con
> prosa, figura y dos ejemplos propios —**83 temas** en el sitio—, las tres
> convocatorias del bloque 1 con su PDF y sus figuras redibujadas, y las
> colecciones de los temas 1 y 2, 35 problemas guiados detrás de los ejemplos.
> El corpus pasa a **1.571 ejercicios y 6.647 pasos**. Las diez colecciones
> que faltan se quedaron a medias: los agentes que las transcribían se
> pararon al agotarse el límite de sesión, y lo suyo está en el borrador, no
> en el repositorio.
>
> El contraste volvió a encontrar resultados impresos que no salen, cinco en
> las dos colecciones montadas: **1.14** y **1.18** del tema 1 —un redondeo a
> mitad de cuenta y una segunda solución que los datos admiten— y **2.1**,
> **2.8** y **2.17** del tema 2 —el doble de lo que da la integral, dos
> lecturas del enunciado y dos erratas de copia—. Publicados como siempre: la
> cuenta buena en la casilla y la impresa como distractor explicado.
>
> **Y una deuda que duró un día:** las **57 respuestas de examen** de Mecánica
> entraron en `tests/verificacion/` el 13 de septiembre de 2026, sus tres
> convocatorias en paralelo, sin una sola discrepancia. El sitio queda en
> **1.480 de 1.481**, y la que falta es la de Fluidos que se deja fuera a
> propósito.
>
> **Y con eso, el 13 de septiembre de 2026 Mecánica Aplicada se cierra contra
> §15: es la sexta terminada.** Sus doce temas escritos con figura y ejemplos
> propios, sus doce colecciones —250 ejercicios—, las tres convocatorias
> transcribibles con su PDF, tres simuladores con su modelo y sus pruebas, las
> **dos rutas** y sus 57 respuestas recalculadas.
>
> Los huecos, que es lo que §15 pide de verdad y no que no los haya:
>
> - **Cinco convocatorias declaradas imposibles**: las de 2017-2018 y
>   2018-2019 están íntegramente en euskera y traducirlas sería inventar el
>   enunciado (§08). Es la misma decisión que las dos de Térmica. Sí se han
>   **leído para clasificar** qué tema pide cada hueco —eso no publica una
>   palabra de ellas— y de ahí sale la ruta del bloque 2.
> - **El bloque 2 no tiene ninguna convocatoria en castellano**, así que su
>   ruta está medida sobre exámenes de 2018 y 2019: siete años de antigüedad,
>   y la ruta lo dice en su cabecera.
> - **Dos huecos de material declarados en las rutas**: el círculo de Mohr y
>   la velocidad de sucesión del CIR se explican y no tienen dónde
>   practicarse, porque la colección no trae ni un problema de cada uno.
> - Y los exámenes **no publican reparto por competencia**, así que sus
>   ejercicios van sin `puntos`: no se estima lo que no se imprime (§10).
>
> **Y con Mecánica cerrada se abre la octava, Sistemas de Producción y
> Fabricación**, el 13 de septiembre de 2026. Vuelve a ser la excepción de
> arriba y conviene repetir por qué: Materiales sigue en `obra` y no se puede
> cerrar —le falta material, no trabajo—, así que esperar a que aparezcan sus
> exámenes pararía el proyecto entero.
>
> Se eligió entre las dos que quedaban, y no por descarte: **Expresión Gráfica
> es de 1.º y por §00 tendría que ir antes, pero su examen es un dibujo**. El
> sitio no sabe corregir una vista ni un corte, el patrón «figura fija» sigue
> sin construir y no hay tipo de respuesta para eso: necesita una fase de
> diseño propia antes que contenido, y hacerla con prisa saldría mal.
>
> Lo que tiene Sistemas, contado listando **sus dos carpetas** —que es la
> lección que costó el inventario de Mecánica—: treinta y siete ficheros,
> nueve juegos de diapositivas por proceso, la guía del estudiantado 25/26 y
> una **colección de 54 problemas** con su resultado impreso. **Ningún
> examen**, así que nace en `obra` como Materiales.
>
> Y nace con dos cosas declaradas desde el primer día. La primera, que el
> temario oficial son **cinco bloques** y el material son nueve juegos por
> proceso: el catálogo publica los bloques de la guía y dice qué diapositivas
> caen en cada uno. La segunda, que **«Tecnologías de unión» no tiene
> material**: ni una diapositiva de soldadura entre los treinta y siete
> ficheros, ni un problema en la colección. Va con `soloEnClase` y su motivo,
> que es para lo que existe ese campo.
>
> Un conflicto más, y está dentro de la propia guía: su tabla resumen da un
> **20 %** a las prácticas y su apartado 8.1 les da un **30 %**. Se publica el
> 30, que es el que suma 100 con el examen, y la `fuente` lo explica para que
> nadie lo lea como una errata nuestra (§13 caso 3).
>
> **Y esa misma mañana quedan transcritas las doce colecciones enteras.** La
> asignatura pasa de 191 a **250 ejercicios** y el corpus a **1.742 ejercicios
> y 7.468 pasos**. Cada resultado impreso se ha recalculado por un camino
> independiente del desarrollo escrito, y eso ha destapado **más de treinta
> que no salen**: seis en el tema 3, cuatro en el 4, siete en el 7, dos en el
> 8, tres en el 9, tres en el 10 y seis en el 12. En todos se publica lo que
> dan los datos, con el impreso de distractor explicado (§13).
>
> Y algo que no había pasado hasta ahora: **las resoluciones oficiales del
> profesor también fallan**, y no siempre del mismo lado. En el 12.17 encuadra
> una raíz que sus propias ecuaciones no dan; en el 12.18 su fórmula del par
> pierde una R y deja de ser dimensionalmente un par; y en el 10.1, al revés,
> **el impreso acierta y la resolución se lleva un signo**. Cuando las dos
> fuentes discrepan se publica la que reproducen las cuentas, y la fuente del
> ejercicio dice cuál es.
>
> **El primer simulador de la asignatura**, en el tema 6: la viga con sus
> diagramas de cortante y flector, con los apoyos móviles. Responde a por qué
> el peor flector de una viga con voladizo está en el apoyo y no en el vano,
> donde la cortante no pasa por cero sino que salta. Su modelo vive en
> `src/lib/viga.ts` y sus 19 pruebas lo atan a números publicados: los
> ejercicios 6.2, 6.5 y 6.9 de la colección y el ejercicio 2 de la ordinaria
> de 2025, cuyo flector máximo —49MgL/8 en x = 7L/4— sale de ese modelo.
>
> «Cerrada» no quiere decir sin huecos: quiere decir **con los huecos
> declarados**, que es lo que §15 pide. Los de hoy, nombrados: Química no
> tiene colección transcrita en cuatro de sus diez temas porque el material no
> la trae; Fluidos tiene trece ejercicios de examen declarados `fuera` y sus
> **veintisiete** prácticas de laboratorio sin material —decía «veintitrés»
> hasta el 10 de septiembre de 2026, que es el número de la guía y no el que
> numera el índice del guion; la ruta se corrigió el 8 y este fichero se
> quedó atrás dos días—; y de las 1.241 respuestas
> de examen comparables hay **una** que se deja sin verificar a propósito.
>
> **Y el 7 de septiembre de 2026 se abrió la quinta, Ingeniería Térmica**, que
> queda en `obra` y no en `ok`: sus **diez temas están escritos** —con su
> figura y su ejemplo de entrada cada uno, que es lo que §15 pide— y su ruta
> también, **medida sobre diecisiete convocatorias** — las comparables al
> formato de hoy, de 2017-2018 en adelante, leídas una a una el 9 de
> septiembre de 2026; decía «seis» hasta entonces. Lo que falta no es
> trabajo: son
> las **22 convocatorias sin transcribir**, y están paradas por §13 caso 5.
> Veinte de los veintidós PDF llevan dentro la resolución completa del
> profesor, así que publicarlos no es lo mismo que publicar un enunciado y la
> decisión no me corresponde. Las tres salidas están escritas en
> `tasks/todo.md`; mientras tanto los ejercicios de examen cuelgan de su tema
> con su `fuente` diciendo de qué convocatoria salen, que funciona y no
> requiere decidir nada.

## §00 · El piloto que se cambió (24 de agosto de 2026)

> Hasta el 24 de agosto de 2026 esta sección decía **«Piloto: Cálculo y Mecánica
> de Fluidos»**, elegidas porque tensionan el sistema en direcciones opuestas —
> una abstracta y de gráficas, la otra física y de esquemas de instalación—, y
> prohibía abrir nada más hasta cerrar las dos. Se cambia por dos motivos y
> conviene que los dos queden dichos.
>
> El primero es que **el piloto ya ha rendido su diagnóstico sin escribir una
> línea de Fluidos**: sabemos exactamente dónde se rompe la capa compartida
> —`unidad` no existe en el esquema, la tolerancia es absoluta donde debería ser
> relativa, y `EjercicioGuiado` importa los lectores de complejos directamente—.
> Eso era lo que la segunda asignatura tenía que averiguar, y ya está averiguado.
>
> El segundo es de coste, y salió al medir el temario real: **Fluidos son 25
> temas**, la asignatura más cara de las nueve. Aprender sobre la más cara es
> justo al revés. Álgebra son cinco bloques y ocho exámenes, rompe la misma capa
> compartida por otro sitio —una **matriz** no es un número ni un conjunto de
> puntos— y se termina en semanas. Fluidos entra después, ya con el lector de
> respuestas separado del componente.
>
> Lo que **no** cambia: la segunda asignatura sigue eligiéndose porque tensiona
> el sistema por un sitio distinto, no porque toque en el temario.

## §04 · Los recuentos del corpus, uno a uno (agosto y septiembre de 2026)

La tabla de tipos de paso de §04 llevaba una columna con los usos de cada
tipo, y caducó más de diez veces. Estos son los recuentos, en el orden en que
estaban escritos.

> Recontadas el **5 de septiembre de 2026**: 1.192 ejercicios y **4.826
> pasos**. Las dos primeras filas llevaban desfasadas desde el recuento de
> agosto —decían 1.068 y 1.989 cuando eran 1.210 y 2.394—, que es la tercera
> vez que pasa lo mismo con esta tabla. La regla de recontar al cerrar una
> asignatura no basta cuando pasan semanas sin cerrar ninguna: **se recuenta
> también al tocar el corpus en más de un fichero**.
>
> Y otra vez el mismo día al abrir Fundamentos Químicos: **1.202 ejercicios y
> 4.878 pasos**, en 43 temas de cuatro asignaturas. Los diez nuevos son seis
> de examen y cuatro ejemplos introductorios; la regla de arriba funcionó a la
> primera.
>
> **Y una tercera vez el mismo día**, al escribir las nueve rampas que faltaban:
> **1.267 ejercicios y 5.140 pasos**. Tres recuentos en un día es la señal de
> que la regla estaba bien puesta y de que la tabla no debería escribirse a
> mano: desde hoy la saca `node scripts/deuda.mjs`, que además mide la lista
> de deuda entera. La cifra se copia de su salida, no se estima.
>
> Y el 6 de septiembre de 2026, **1.270 ejercicios y 5.154 pasos**: catorce pasos
> más y tres ejercicios, y ninguno de examen. Son tres ejemplos de entrada
> —el del diferencial, que cierra el último escalón de Cálculo con un solo
> ejercicio; el de las dos líneas de alturas de una central; y el de decidir
> cuál de dos curvas dibujadas es la derivada de la otra, que es el primero de
> Cálculo con figura propia— más **cinco pasos con rúbrica**: los cuatro
> primeros de Fluidos y el tercero de Álgebra, metidos **dentro** de
> ejercicios de examen que ya estaban. Que el corpus pueda crecer por dentro
> conviene que se note: no todo crecimiento es transcribir una convocatoria
> más.
>
> Y una tercera vez el mismo día, al terminar los diez temas de Química:
> **1.228 ejercicios y 4.983 pasos en 51 temas**, con 402 figuras. Química
> aporta 36 ejercicios y 157 pasos, que es poco para diez temas y está bien
> que se note: los suyos no tienen colección transcrita, solo los dos
> ejemplos propios por tema y los dieciséis de examen. **El hueco está
> declarado en `tasks/todo.md`, no disimulado en esta cifra.**
>
> Y una cuarta, esa misma tarde, al cerrar la transcripción de Química:
> **1.254 ejercicios y 5.086 pasos**. La asignatura pasa de 36 a **62
> ejercicios** —20 ejemplos, 15 de colección y 27 de examen— y sus seis
> convocatorias quedan enteras, sin un solo `fuera`. Cuatro recuentos en un
> día es mucho, y es exactamente lo que la regla pretendía: **se recuenta al
> tocar el corpus en más de un fichero**, no cuando alguien se acuerda.
>
> Y el **7 de septiembre de 2026**, con Ingeniería Térmica escrita:
> **1.310 ejercicios y 5.342 pasos en 61 temas**, con 423 figuras. Térmica
> aporta 40 ejercicios y 256 pasos — tres de ellos escritos esa misma tarde
> para cerrar tres `falta[]` de su ruta: Churchill y Chu, el rendimiento
> exergético de un compresor y el difusor. La cifra sale de `node scripts/deuda.mjs`
> y se copia de su salida, que es la regla desde el 5 de septiembre; ese día
> el propio guion se saltaba Térmica **en silencio** porque llevaba la lista
> de asignaturas escrita a mano, y ahora la saca del catálogo.
>
> Y el **8 de septiembre de 2026**, **1.319 ejercicios y 5.388 pasos**. Los
> nueve nuevos son todos peldaños: escalones que empezaban directamente por un
> ejercicio de examen, que es lo que §14 dice que no puede pasar. Cinco de
> Cálculo —longitud de arco por dos vías, área de superficie curva, Laplace con
> coeficientes variables— y cuatro de Química —el puente del mol, los dos
> órdenes de una configuración, el radio iónico y Nernst por electrodos—. Es la
> forma de crecer que menos se nota en la cifra y más cambia el producto:
> **ningún ejercicio nuevo de examen, y nueve entradas nuevas al corpus que ya
> estaba.**
>
> Y el **10 de septiembre de 2026**, **1.322 ejercicios y 5.403 pasos**. Los
> tres nuevos son de Ingeniería Térmica —entre ellos el de las dos masas de
> agua que se mezclan, que cierra el escalón de exergía destruida por los dos
> caminos— y el ejercicio 9 de la ordinaria de Fluidos de 2026, que **no es
> nuevo**: estaba en `fuera` y se recuperó al releer los `fuera` de formato
> (§17). Conviene que esa distinción quede escrita, porque la cifra no la
> hace: **un corpus puede crecer recuperando lo que ya había transcrito**, y
> eso es más barato que cualquier otra forma de crecer.
>
> Y esa misma tarde, **1.332 ejercicios y 5.449 pasos**, con la decisión de
> Ionan de publicar los PDF de Térmica. Los nueve son de esa asignatura y de
> tres orígenes distintos, que conviene distinguir porque cuestan cosas muy
> diferentes: **tres de su colección** —los temas 2 y 4, la hoja de conducción
> y el boletín de tema 3—, que no dependían de ninguna decisión y llevaban
> ahí desde el principio; **dos ejemplos nuestros** para los escalones de
> exergía; y **cuatro de examen**, las primeras convocatorias transcritas de
> la asignatura. La forma más barata de las tres fue la primera, y era la que
> nadie había mirado.
>
> Y el **11 de septiembre de 2026**, de madrugada, **1.352 ejercicios y 5.547
> pasos**: veinte ejercicios más, y **los veinte de examen de Térmica**, uno
> por cada una de las catorce convocatorias montadas esa noche más los seis
> que ya estaban. Es el crecimiento más caro por unidad —cada uno exige
> resolver a ciegas, abrir la resolución manuscrita del profesor y contrastar
> cifra a cifra— y el único que cierra un hueco de §15 en vez de mejorar el
> corpus por dentro.
>
> Conviene anotar lo que ese contraste encontró, porque es el argumento entero
> de por qué se hace en ese orden: **cinco erratas en documentos oficiales**
> —una masa escrita como 4 donde el enunciado dice 2, dos calores específicos
> cambiados, dos temperaturas de referencia mal copiadas— y **cuatro
> enunciados que se repiten literalmente** entre convocatorias separadas por
> cuatro años o más. Nada de eso se ve leyendo la resolución primero.
>
> Y entre el 11 y el 12 de septiembre de 2026, **1.372 ejercicios y 5.661
> pasos**: veinte más, y los veinte de examen de Térmica, que son la fila
> entera de «trabajo pendiente» de la tabla de §00. Ya no había convocatoria
> que montar, solo el ejercicio que cada una dejaba fuera, y aun así cada uno
> pidió lo mismo que los anteriores: resolver a ciegas, abrir la resolución y
> contrastar. Lo que eso encontró —entre otras cosas, el primer error de
> concepto en una resolución oficial— está en §00.
>
> Y el 12 de septiembre de 2026, con Ciencia de Materiales escrita, **1.492
> ejercicios y 6.270 pasos**: 120 ejercicios y 609 pasos más, todos de
> Materiales. Es la primera asignatura sin un solo ejercicio de examen —99
> de los 120 son de su colección, y el resto, ejemplos—, porque no hay
> exámenes entre el material. Y la primera donde un problema no se podía
> escribir hasta tener dibujada la figura de la que se lee: diez esperaron a
> sus curvas.

> Las cifras de esta tabla y las de §05 y §15 se quedaron en el corpus de
> agosto y estuvieron desfasadas hasta el 28 de agosto de 2026: decían 1.022
> pasos cuando eran 2.658, y 270 ejercicios cuando eran 683. **Regla que sale
> de ahí: un número de este fichero se recalcula al cerrar cada asignatura, no
> cuando alguien se acuerda.** El guion está en el scratchpad y son veinte
> líneas: recorre las colecciones y cuenta.
>
> Recontadas el **1 de septiembre de 2026**, al cerrar Fluidos: los pasos
> pasaron de 3.092 a 4.142 y los ejercicios de 827 a 1.059, repartidos en 41
> temas de tres asignaturas. La regla funcionó — las cifras llevaban cuatro
> días desfasadas, desde el recuento del 28 de agosto, no una semana.
>
> Y recontadas otra vez el **4 de septiembre**, al meter la colección de
> Fluidos: **4.822 pasos y 1.192 ejercicios** en los mismos 41 temas. En tres
> días el corpus ha crecido un 13 % sin abrir un tema nuevo, y eso lo hace
> todo un solo trabajo: transcribir un boletín que ya existía.

## §15 · La cifra de referencia de Cálculo, y cómo envejeció

> Recontado el **8 de septiembre de 2026**, al repasar Cálculo, y **tres de las
> seis cifras habían envejecido**: 21.545 → 21.657 palabras, 193 → 197
> ejercicios de tema, 29 → 30 figuras. Ninguna se había escrito mal; las tres
> se quedaron atrás el día que se añadió contenido y nadie volvió a pasar
> `mide.mjs`. Convocatorias, ejercicios de examen y escalones sí cuadraban.
> Es el aviso de dos párrafos más abajo cumpliéndose otra vez, así que se
> vuelve a decir aquí: **esta tabla se recuenta al cerrar una asignatura, no
> se copia.**

> Esta cifra decía «cinco temas, 12.644 palabras, 127 ejercicios, 33 exámenes,
> 56 escalones» hasta el 28 de agosto de 2026, es decir la mitad de la
> asignatura contada cuando iba por la mitad. Quien la leyera para dimensionar
> un trabajo se habría quedado corto por más del doble.
