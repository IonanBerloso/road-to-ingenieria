# Cómo vamos · 26 de agosto de 2026

Estado del proyecto medido sobre el repositorio, no recordado. Se regenera
**en el mismo commit** que cambia los números, no en el siguiente.

> Las «palabras de prosa» se cuentan sobre `index.mdx` quitando la portada, los
> bloques `<svg>`, las fórmulas entre dólares y las etiquetas. Es una
> definición, no la única; lo que importa es que sea la misma en cada medición.

> Esta regla del «mismo commit» es nueva y viene de un fallo: el fichero llevaba
> dos commits publicando «66 de 89 convocatorias» cuando ya eran 68. §10 no
> admite eso. Está anotado como deuda 34, y la salida buena a largo plazo es
> generar este fichero con `mide.mjs` en vez de escribirlo a mano.

---

## En una frase

**Las once ordinarias están hechas.** Es el primer bloque de convocatorias
globales completo, y con él los temas 10 y 11 tienen ya toda la muestra que van
a tener: Laplace llega a **doce** ejercicios y Fourier a **diez**, y no habrá
más salvo lo que traigan las extraordinarias. Van 76 convocatorias de 89 y 321
ejercicios de examen. Faltan 13: once extraordinarias y los dos parciales de
2019-2020.

---

## Cálculo, tema a tema

| tema | prosa | fig. | ejerc. propios | ejemplos | ejerc. de examen |
|---|---|---|---|---|---|
| t01 complejos | 2 885 | 3 | 37 | 8 | **62** |
| t02 sucesiones | 2 035 | 3 | 19 | 4 | 31 |
| t03 funciones reales | 1 779 | 3 | 23 | 5 | 21 |
| t04 estudio local | 2 036 | 3 | 18 | 5 | **63** |
| t05 integración | 1 925 | 4 | 30 | 4 | 35 |
| t06 varias variables | 1 797 | 2 | 12 | 4 | 17 |
| t07 integral múltiple | 1 865 | 3 | 11 | 4 | 30 |
| t08 integral curvilínea | 1 119 | 1 | 7 | 2 | 17 |
| t09 ecuaciones diferenciales | 1 241 | 1 | 7 | 2 | 23 |
| t10 Laplace | **1 605** | **2** | **9** | **3** | **12** |
| t11 Fourier | **1 668** | **2** | **9** | **3** | **10** |
| **total** | **19 955** | **27** | **182** | **44** | **321** |

En todo el corpus: **503 ejercicios y 1 934 pasos**.

El tema 10 ya no es la frontera: pasa de 872 a **1 605 palabras** y de una
figura a dos. Lo que se le añadió no salió de mirar el temario sino de contar
sus doce ejercicios de examen, y eran tres huecos de verdad:

- **la función escalón no estaba definida.** Aparecía en la tabla y en un error
  típico, y nunca se decía qué es. Sin ella no se puede escribir «la fuerza
  empieza en el segundo dos», que es lo que piden 2020-2021 y 2023-2024. Ahora
  tiene apartado, figura y ejemplo introductorio;
- **derivar la transformada** —$\mathcal{L}\{t f\}=-F'(s)$— no estaba, y es lo
  único que resuelve una ecuación con coeficientes variables. Cayó en 2025-2026;
- **usar la definición para calcular una integral impropia** tampoco. La prosa
  decía que la definición «casi nunca se usa», y hay una excepción que cayó en
  2015-2016: $\int_0^\infty t^{17}e^{-5t}dt$ es $17!/5^{18}$ y se contesta en
  una línea.

El tema 11 recibió el mismo tratamiento el mismo día: de 888 a **1 668
palabras** y de una figura a dos, y otra vez lo añadido salió de contar sus diez
ejercicios de examen, no de mirar el temario:

- **la ampliación par e impar no tenía apartado**, y es el apartado a) de cuatro
  de los diez —«obtener la ampliación impar y periódica de f(t)», y dibujarla—.
  Solo estaba como dos filas del formulario. Ahora tiene apartado, figura con
  las dos ampliaciones de la misma media función, y ejemplo introductorio;
- **reducir un argumento grande al periodo** se despachaba en una frase, y lo
  piden ocho de los diez. Ahora es un subapartado con los cinco puntos reales de
  2023-2024 y 2024-2025 reducidos uno a uno — incluido el de $T=4$, donde la
  reducción no entiende de $\pi$;
- **el cálculo de los coeficientes** no estaba hecho ni una vez. Ahora está el
  caso de siempre entero, con las dos simplificaciones que salen al evaluar
  —$\operatorname{sen}(n\pi)=0$ y $\cos(n\pi)=(-1)^{n}$— y el aviso del periodo:
  en 2024-2025 valía $4$, y copiar la fórmula de memoria estropea la serie
  entera sin que nada avise.

Con los dos, los temas del segundo cuatrimestre dejan de tener un flaco claro:
el más corto pasa a ser el 8, con 1 119 palabras.

La columna «fig.» cuenta solo las figuras de la prosa de los temas. Las de los
enunciados y las resoluciones de examen van aparte, y en estas ocho ordinarias
han sido treinta y ocho: seis en 2022-2023, cuatro en 2021-2022, cinco en
2020-2021, tres en 2018-2019, cinco en 2017-2018, seis en 2016-2017, cinco en
2015-2016 y cuatro en 2013-2014. Veintisiete de las treinta y ocho **son
nuestras**, y veintitrés viven en la **resolución** y no en el enunciado: son los
apartados donde el propio examen dice «dibujar» o «representar», y ahí la figura
no ilustra la respuesta — es la respuesta.

El primer ejercicio de 2013-2014 obligó a partir una figura en dos, y la regla
que sale de ahí merece quedar escrita. El examen trae un rectángulo sombreado y
pide «representar gráficamente» lo que sale de transformarlo cuatro veces. La
primera versión dibujaba las cuatro regiones en el enunciado, con un pie
diciendo cuál venía del examen — y eso es **resolver el ejercicio por el
alumno**. Se separó: el enunciado se queda con el rectángulo redibujado y las
cuatro regiones se van a la resolución. **Cuando el enunciado dice «dibujar»,
el dibujo es la respuesta y no puede estar arriba.**

## Exámenes

| convocatoria | PDF | transcritas | faltan |
|---|---|---|---|
| 1.ª evaluación | 11 | **11** | 0 |
| 2.ª evaluación | 11 | **11** | 0 |
| 3.ª evaluación | 11 | **11** | 0 |
| 4.ª evaluación (15 cuadernillos) | 15 | **17** | 0 |
| 5.ª evaluación (13 cuadernillos) | 13 | **15** | 0 |
| ordinaria | 11 | **11** | 0 |
| extraordinaria | 11 | 0 | **11** |
| ord.-extraord. 2019-2020, 2 parciales | 2 | 0 | **2** |
| **total** | **85** | **76** | **13** |

Los quince cuadernillos de cuarta evaluación dan diecisiete convocatorias y los
trece de la quinta dan quince, porque algunos traen dentro las dos partes: la
recuperación del primer cuatrimestre y la evaluación de verdad. Desglosado:
once cuartas más seis recuperaciones, y diez quintas más cinco recuperaciones.
La quinta de 2019-2020 no se celebró.

**Los 85 PDF están ya en `public/examenes/calculo/`**, copiados y verificados
byte a byte contra el original. Lo que falta es transcribir 13.

Sobre los 3 215 puntos repartidos de los 76 exámenes: **COMP1 9,5 % · COMP2
55,7 % · COMP4 34,8 %**. Es decir, **el 44,3 % de la nota de Cálculo no es
calcular**. La cifra venía bajando según entraban globales —49,5 % sobre 33,
46,8 % sobre 66, 43,6 % sobre 73— y lleva tres mediciones subiendo: las
ordinarias más antiguas cargan mucho más COMP4. La de 2016-2017 trae dos
ejercicios con COMP2 = 0, la de 2015-2016 tiene uno con **cuatro puntos de
COMP1** —el máximo del corpus— y la de 2013-2014 dedica cuatro de sus diez
puntos a «enunciar y demostrar el teorema fundamental». El motivo es estable:
las convocatorias largas reparten siete u ocho puntos de cálculo de cada diez en
casi todos sus ejercicios, mientras que en las globales antiguas hay ejercicios
enteros de solo demostrar.

Con las once cerradas se puede además decir algo que antes era una impresión:
**la nota de una ordinaria no se reparte como la de una evaluación continua.**
Las globales son más cortas —la de 2013-2014 son seis ejercicios y sesenta
puntos, el examen más corto del corpus— y compensan pidiendo la teoría en voz
alta.

## Rutas de estudio

| ruta | bloques | escalones | medida sobre | huecos declarados |
|---|---|---|---|---|
| 1.ª evaluación | 7 | 21 | 11 convocatorias | 4 |
| 2.ª evaluación | 8 | 17 | 11 | 2 |
| 3.ª evaluación | 9 | 18 | 11 | 3 |
| 4.ª evaluación | 3 | **12** | 11 | **4** |
| 5.ª evaluación | 3 | 12 | 10 | 6 |
| ordinaria | **8** | **19** | **11** | **6** |

**La de la ordinaria se rehizo el 26 de agosto de 2026**, el mismo día que se
cerró la última convocatoria que le faltaba. Decía estar medida sobre 2 y ahora
lo está sobre 11, y no fue retocar el número: se volvieron a contar los
cuarenta y cinco ejercicios de los segundos parciales, uno a uno, y de ahí
salieron dos bloques que no existían —el sólido de revolución, que cae en diez
de los once años, y el suelo de dibujar— y la partición del antiguo bloque de
«síntesis» en dos, porque medido sobre once no es un hueco sino dos.

Lo que la medición enseñó, y no se veía con dos convocatorias:

- **el núcleo del segundo parcial son tres ejercicios y caen juntos nueve de
  cada once años**: Laplace —los once—, el sólido —diez— y Fourier —diez—;
- **veinte de los cuarenta y cinco ejercicios piden dibujar, y trece lo piden
  en el apartado a)**. Eso convierte «dibujar» en el suelo de la ruta, en el
  sentido literal de §14: no se examina solo y sin él los demás no se terminan;
- **la EDO suelta se ha ido**. Cayó seis veces entre 2015-2016 y 2022-2023 y
  ninguna desde entonces: su sitio lo ocupan ahora los ejercicios que cruzan
  temas, que son los tres últimos años seguidos;
- y el hueco que la ruta destapó y que **se ha cerrado el mismo día**: el área
  de una superficie curva no estaba en la prosa del tema 7 —la palabra
  «superficie» no aparecía ni una vez en su `index.mdx`— y cae en cuatro de los
  diez sólidos. Ahora tiene apartado propio, figura y ejemplo de entrada.

Y falta la ruta de la extraordinaria, que §15 pide y todavía no existe.

## Contra el criterio de «asignatura terminada» (§15)

| criterio | |
|---|---|
| temas del temario oficial, con fuente | ✅ 11/11 |
| todo tema enlazado por una ruta tiene prosa | ✅ |
| cada tema con ejemplo introductorio propio | ✅ 44 |
| cada tema con al menos una figura | ✅ 27 |
| una ruta por evaluación | ⚠️ 6 de 7 — falta la extraordinaria |
| `tests/fisica/` con un caso por simulador | ✅ vacío, no hay simuladores |
| `falta[]` dice lo que no está | ✅ 25 huecos |
| `npm run suelo` en verde | ✅ |
| **todas las convocatorias publicadas transcritas** | ❌ **76 de 89** |

> El «76 de 89» merece explicación: 85 son los PDF y 89 las convocatorias que
> contienen, porque cuatro cuadernillos traen dos exámenes dentro. De las 13
> que faltan, ninguna es doble.

## Las otras ocho asignaturas

Cero contenido. Fluidos tiene los 16 temas en el catálogo y un README; las
otras siete están como `prev`. Es §00 funcionando: no se abre una hasta cerrar
la anterior.

---

# El plan

## Lo siguiente: las once extraordinarias

Las ordinarias se cerraron el 26 de agosto de 2026. Lo que queda de la deuda 26
son las once extraordinarias y los dos parciales de 2019-2020, y ya no bloquean
ningún tema: **la muestra de Laplace y Fourier está completa**. Se transcriben
porque §15 exige todas las convocatorias publicadas, no porque falte contenido
que solo ellas puedan dar.

Todo lo que las ordinarias bloqueaban se hizo el mismo día, y conviene ver la
cadena entera porque es la mejor prueba de que medir rinde:

1. se cerró la última ordinaria, la de 2013-2014;
2. con las once, se rehízo `calculo-ord.yaml` sobre 45 ejercicios en vez de
   sobre 2 —**deuda 33**—, y aparecieron dos bloques que no existían;
3. rehacerla destapó que **el área de una superficie no estaba en el tema 7**
   —deuda 37—, y arreglarlo destapó que tampoco lo estaba para la 4.ª
   evaluación: siete ejercicios en total la pedían;
4. arreglar el contador de la página de rutas destapó que **la ruta de la 4.ª
   no enlazaba ni un examen de su convocatoria** —deuda 38—, escondido detrás
   de un «0 de 29» que era falso en cinco rutas de seis;
5. y con las once ordinarias leídas se pudieron **engordar los temas 10 y 11**,
   los dos más flacos, con lo que dicen sus doce y diez ejercicios.

Ninguna de esas cinco cosas estaba en el plan de por la mañana. Las cinco
salieron de contar.

Lo que queda por delante son las once extraordinarias, y no bloquean nada.

El trabajo por examen, ya rodado:

1. el PDF ya está en `public/examenes/calculo/` — los 85 están copiados;
2. leerlo — `pdftotext -layout` para la estructura, y la página renderizada a
   imagen para las fórmulas, que `pdftotext` se come o traduce mal;
3. **comprobar cada resultado por dos caminos** antes de escribir una línea:
   el analítico y el numérico, en un script del scratchpad;
4. escribir `examen.yaml` y `ejercicios.yaml`, con los pasos
   reconocer / calcular / justificar y los distractores sacados de errores
   reales;
5. redibujar en SVG toda figura del enunciado (§08), y mirarla en claro, en
   oscuro y a 360 px antes de darla por buena;
6. `node scripts/verify.mjs --solo-fuente` **antes** de `npm run build`,
   recorrer los ejercicios en el navegador con `probar.mjs`, y `npm run suelo`.

Lo aprendido en estas ocho ordinarias, que conviene no volver a tropezar:

- **el cálculo analítico también se equivoca.** El volumen del sólido de
  Viviani salió 38,58 por integración numérica y 19,29 por la fórmula cerrada
  que escribí; la mala era la fórmula. Los dos caminos existen justo para esto,
  y la lección es que **discrepar no significa que el numérico esté mal**;
- **una figura redibujada hay que medirla sobre el original.** La primera
  versión de las gráficas de $f$ y $g$ tenía la escala vertical a la mitad de
  la horizontal y dos cortes de los que depende un paso quedaban invisibles. Se
  rehízo midiendo un recorte a 600 dpi; y a 260 dpi había leído mal uno de los
  ceros —3,05 en vez de 2,84—, lo que habría tirado el ejercicio entero;
- **`fill-rule="evenodd"` no es «quitar un trozo».** Es diferencia simétrica: al
  usarlo para descontar un disco de un semiplano, el trozo del disco que caía
  **fuera** del semiplano se pintaba en vez de quitarse. La forma que ya usaba
  el corpus es la buena: pintar la región y encima el hueco en `var(--paper)`,
  recortado con un `clipPath`;
- **una raya larga dentro de `$…$` la publica KaTeX como aviso y como
  desastre.** Dos casos se colaron hasta el commit y hay guardián nuevo desde
  hoy, con la familia entera de rayas y comillas medida —incluido el espacio
  duro, que es invisible al leer el fichero—;
- una etiqueta con `paint-order: stroke` y `stroke: var(--paper)` resuelve casi
  todas las colisiones entre rótulos y curvas, y funciona igual en claro y en
  oscuro;
- **el signo del enunciado se lee en la página renderizada, no en el volcado de
  texto.** El ejercicio de Laplace de 2013-2014 es `x'' − x + 2 = 0`, y del
  `pdftotext` había salido como `x'' + x = 2`. Son dos problemas distintos:
  con el más, senos; con el menos, exponenciales. Se cazó al mirar la imagen de
  la página antes de escribir, que es el paso 2 de la lista de arriba y existe
  exactamente para esto.

## Los días siguientes

| | trabajo | qué desbloquea |
|---|---|---|
| 1 | ~~Rehacer `calculo-ord.yaml`~~ | **hecho el 26 de agosto de 2026** |
| 2 | ~~El área de una superficie en el tema 7~~ · ~~la ruta `4ev` sin ejercicios de examen~~ | las dos, hechas el mismo día |
| 3 | **Engordar los temas 10 y 11** con lo que digan sus 12 y 10 ejercicios | los dos temas más flacos del sitio |
| 4 | **11 extraordinarias** + los 2 parciales de 2019-2020 | cierra la deuda 26 |
| 5 | **Ruta de la extraordinaria**, que todavía no existe | §15 pide una por evaluación |
| 6 | **Enganchar las cinco recuperaciones de la quinta** a las rutas de 1.ª, 2.ª y 3.ª: son catorce ejercicios de primer cuatrimestre que hoy no enlaza nadie | |
| 7 | **Auditoría de Cálculo entera** y cierre según §15 | |
| 8 | **Abrir Álgebra** | |

El orden cambia hoy: hasta esta mañana las extraordinarias iban las primeras
porque las ordinarias estaban a medias y todo lo demás dependía de ellas. Ya no.
Las dos primeras filas son trabajo que llevaba semanas esperando permiso, y
hacerlo ahora es más barato que hacerlo después de otras once transcripciones.

Cuando entre Álgebra habrá que separar el lector de respuestas de
`EjercicioGuiado`: una **matriz** no es un número ni un conjunto de puntos, y
ese es el sitio por donde Álgebra tensiona el sistema. Es la razón por la que
va antes que Fluidos, que son 25 temas y la asignatura más cara de las nueve.

## Deudas abiertas que no bloquean

Están todas en `tasks/todo.md` con su número. Las que siguen vivas y merecen
una línea:

- **26** — las 13 convocatorias globales que faltan: once extraordinarias y los
  dos parciales de 2019-2020. Ya no bloquean ningún tema.
- **31** — `invariante.fuente` se publica como texto plano, sin pasar por el
  procesador, así que el LaTeX sale crudo. O se procesa, o §14 lo dice.
- **32** — dos ejercicios del tema 9 duplican problemas que ahora también están
  transcritos como examen.
- **33** — ~~la ruta `ord` dice «medida sobre 2»~~. **Cerrada** el 26 de agosto
  de 2026: rehecha sobre las once, con ocho bloques y diecinueve escalones.
- **37** — ~~el área de una superficie curva no está en la prosa del tema 7~~.
  **Cerrada** el 26 de agosto de 2026: apartado nuevo con la fórmula, la figura
  de por qué lleva una raíz, el atajo de los cuerpos de revolución y un ejemplo
  introductorio que se resuelve sin integrar.
- **38** — ~~la ruta de la 4.ª evaluación no enlaza ni un ejercicio de examen de
  su convocatoria~~. **Cerrada** el 26 de agosto de 2026: los veintiocho de los
  veintinueve que son de los temas 6 y 7 cuelgan ya de sus escalones, y hay dos
  escalones nuevos que la medición pedía —«plantear sin calcular» y «el área de
  la superficie»—. El que falta es de integral curvilínea y está declarado.
- **34** — esta medición se quedó atrás dos commits. Corregido, y de ahí sale la
  regla del encabezado.
- **35** — **los profesores repiten ejercicios entre convocatorias.** Medido
  sobre los 321: cuatro problemas aparecen diez veces con el enunciado idéntico.
  Y hay un quinto que el detector **no** puede ver: el sólido del ejercicio 3
  de 2013-2014 es el mismo que el del 1 de 2021-2022 —paraboloide rematado en
  cono, ocho años después— pero cada uno pregunta cosas distintas y el enunciado
  cambia. Que un ejercicio se repita es la mejor señal de que va a caer, y hoy
  el sitio no lo dice en ninguna parte.
- **36** — el seno se escribe de dos maneras en el corpus: 511 veces en
  castellano y **88 en inglés**, repartidas por 8 ficheros. Los exámenes
  imprimen «sen», así que las inglesas incumplen §08 en lo tipográfico.
- **39** — ~~tres etiquetas de figura se publicaban recortadas~~. **Cerrada** el
  26 de agosto de 2026, y con guardián: `humo.mjs` mide ahora la caja de cada
  `<text>` contra el `viewBox` de su SVG. Nació rojo sobre dos fallos que nadie
  había visto —«f(b) > 0» publicado como «f(b) >» en el tema 3— y se puso verde
  al arreglarlos.
- **2** — el temario de Fluidos está en el catálogo sin fuente verificada.
- **5** — el patrón «figura fija» sigue sin construir, a propósito: ningún
  contenido lo ha pedido todavía.
- **18** — el bloque del formulario duplica hechos que ya están en la prosa.
