# Cómo vamos · 27 de agosto de 2026

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

**Dos asignaturas terminadas de nueve: Cálculo y Álgebra.** Las dos cumplen §15
entera y las dos están en el catálogo como `ok`. Entre las dos, **96
convocatorias transcritas de 96**, y el guardián de convocatorias huérfanas ya
no cuenta ninguna suelta.

Álgebra se abrió el 26 de agosto de 2026 y se cerró el 27: ocho convocatorias,
siete temas, dos rutas. El 30 se le metió el boletín oficial entero en seis de
los siete temas —de 35 ejercicios de tema a 179—, que es lo que separa «§15 se
cumple» de «un alumno tiene con qué practicar cada tema». Su auditoría §15 está más abajo, con las once filas
medidas.

**Cálculo se cerró el 28 de agosto de 2026**, un día después que Álgebra
aunque llevara meses abierta. Lo que faltaba no era material: era que las rutas
de la ordinaria y de la extraordinaria solo preparaban **la mitad** de su
examen. Está contado abajo, en la nota de la tabla de §15.

---

**El corpus de exámenes de Cálculo está completo: 88 convocatorias de 88.**
Once cursos, todas las evaluaciones publicadas, las doce ordinarias y las once
extraordinarias: **425 ejercicios de examen**, con su reparto por competencia
transcrito del propio cuadernillo. No queda ninguno por leer.

El «88 de 88» sustituye al «de 89» que decía este documento hasta el 26 de agosto
de 2026, y el cambio hay que explicarlo porque **no es que falte uno**: es que
uno no existía. Los dos últimos PDF, `2019-2020-ord-ext-p1` y `-p2`, se
contaban como dos convocatorias y resultaron ser **una sola**: su cabecera dice
«CONVOCATORIAS ORDINARIA Y EXTRAORDINARIA · mayo y junio 2020» y los dos ficheros
son el primer y el segundo cuatrimestral del mismo examen, el del confinamiento.
Un solo juego de enunciados para las dos convocatorias de aquel año.

La cuenta, medida: 85 PDF, más 4 cuadernillos que llevan dos convocatorias dentro
—las cuartas y quintas de 2015-2016 y 2016-2017, con su recuperación—, menos ese
cuadernillo partido en dos ficheros: 85 + 4 − 1 = **88**.

**Y el último es el examen más largo del corpus**: trece ejercicios y 130
puntos, cinco y cincuenta el primer cuatrimestral y ocho y ochenta el segundo.
Trae además el ejercicio que mejor resume de qué va COMP 4 en esta asignatura: la
figura muestra las gráficas de $y$ y de $y'$ **sin decir cuál es cuál**, y hay que
decidirlo antes de poder hacer nada. Se decide con un solo detalle del dibujo —una
curva corta al eje justo debajo del máximo de la otra— y a partir de ahí todo el
estudio de $h=e^{-4x}y^{4}$ se lee sobre la figura, sin conocer $y$.

Las extraordinarias rompieron cosas que parecían fijas. La de 2018-2019 trae uno
de los **tres ejercicios de las once con cero puntos de cálculo**: cuatro de
COMP 1 y seis de COMP 4 por emparejar seis mapas de curvas de nivel con seis pares
de derivadas parciales. Su figura, redibujada en SVG, es la más cargada de las
**216** del contenido de Cálculo: seis paneles y **68 rótulos**, casi el doble que
la siguiente, que tiene 36. Y va en el enunciado, no en la resolución, porque sin
ella el enunciado no se puede ni leer.

Los otros dos van más lejos: **cero de COMP 1, cero de COMP 2 y diez de COMP 4**,
por demostrar el teorema de Fermat en 2016-2017 y el de Lagrange en 2012-2013. Es
el reparto más extremo que existe, y en todo el corpus solo lo tienen 24
ejercicios de 425 — todos ellos demostraciones.

Y dos rompen el reparto entre cuatrimestrales: **los dos no valen lo mismo**. En
2017-2018 son tres ejercicios y treinta puntos el primero, cinco y cincuenta el
segundo; en 2015-2016, tres y treinta contra cuatro y cuarenta, que dan **siete
ejercicios en total**, el examen más corto de las once.

Y tres de ellas —2012-2013, 2013-2014 y 2016-2017, contadas sobre los once PDF—
aclaran por escrito algo que se daba por supuesto: su primer cuatrimestral lleva
impreso **«sólo para alumnos con el primer cuatrimestral suspendido»**. La
extraordinaria no es un examen único que haya que aprobar entero: se presenta por
partes, y quien aprobó un cuatrimestre por evaluación continua solo hace el otro.
Eso cambia cómo se estudia, y por eso importa.

Y la **norma que hasta ahora era palabra del alumno** —«no está permitido el uso
de calculadora en el examen»— está impresa en la cabecera de **siete de las
once**: 2016-2017, 2017-2018, 2018-2019, 2021-2022, 2022-2023, 2023-2024 y
2024-2025. Contado el 26 de agosto de 2026 sobre el volcado de los once PDF. §09
la trataba como supuesto declarado; ahora es un documento oficial repetido siete
veces. La cabecera añade un segundo aviso que también dice algo del reparto: «se
valorará la presentación».

---

## Cálculo, tema a tema

> node scripts/mide.mjs

| tema | prosa | fig. | ejerc. propios | ejemplos | ejerc. de examen |
|---|---|---|---|---|---|
| t01 complejos | 2820 | 3 | 37 | 8 | 74 |
| t02 sucesiones | 2020 | 3 | 19 | 4 | 32 |
| t03 funciones reales | 1920 | 3 | 23 | 5 | 21 |
| t04 estudio local | 2453 | 3 | 20 | 7 | 85 |
| t05 integracion | 2104 | 4 | 30 | 4 | 49 |
| t06 varias variables | 1993 | 2 | 12 | 4 | 20 |
| t07 integral multiple | 1789 | 3 | 11 | 4 | 41 |
| t08 integral curvilinea | 1163 | 2 | 9 | 4 | 26 |
| t09 ecuaciones diferenciales | 1785 | 2 | 10 | 5 | 36 |
| t10 laplace | 1563 | 2 | 10 | 4 | 24 |
| t11 fourier | 1935 | 2 | 10 | 4 | 17 |

> **Esta tabla la genera `npm run mide`**, y ahí vive también la definición de
> «palabra»: la prosa de un tema quitando la portada, los bloques `<svg>`, los
> pies de figura, las fórmulas y las etiquetas. Se escribía a mano y llegó a
> publicar dos commits con una cifra vieja; desde el 29 de agosto de 2026 se
> regenera. Los números bajan un poco respecto a la versión escrita a mano: no
> es que haya menos prosa, es que ahora se cuenta siempre igual.

> La prosa creció el 26 de agosto de 2026 por los catorce huecos que destapó la
> auditoría de §15, y el 29 por los nueve ejemplos de entrada que cerraron la
> escalera. Ninguna de las dos veces por engordar: las dos salieron de contar.

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

Con los dos, los temas del segundo cuatrimestre dejaron de tener un flaco claro.
Y después de la auditoría de §15 el más corto sigue siendo el 8, ahora con
**1 208 palabras** — que es el único que se queda por debajo de mil quinientas.

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
| ordinaria | 12 | **12** | 0 |
| extraordinaria | 11 | **11** | 0 |
| **total** | **85** | **88** | **0** |

Los quince cuadernillos de cuarta evaluación dan diecisiete convocatorias y los
trece de la quinta dan quince, porque algunos traen dentro las dos partes: la
recuperación del primer cuatrimestre y la evaluación de verdad. Desglosado:
once cuartas más seis recuperaciones, y diez quintas más cinco recuperaciones.
La quinta de 2019-2020 no se celebró.

Las doce ordinarias son once cursos más el cuadernillo doble de 2019-2020, que
sirvió para la ordinaria y para la extraordinaria de aquel año y se archiva como
ordinaria porque es la primera de las dos que se celebró.

**Los 85 PDF están ya en `public/examenes/calculo/`**, copiados y verificados
byte a byte contra el original, y **los 85 están transcritos**.

Sobre los 4 255 puntos repartidos de los 88 exámenes —y ya no van a cambiar,
porque no queda examen por transcribir—: **COMP1 9,0 % · COMP2 57,3 % · COMP4
33,7 %**. Es decir, **el 42,7 % de la nota de Cálculo no es calcular**.

Y con los dos bloques globales completos ya se puede desglosar, que es más útil
que el total. La cifra global venía bajando —49,5 % sobre 33 exámenes, 46,8 %
sobre 66, 43,6 % sobre 73—, luego subió tres mediciones seguidas y ahora está
prácticamente parada. El vaivén no es de fechas: es de **qué tipo de convocatoria
entra cada vez**.

| bloque | exámenes | puntos | COMP1 | COMP2 | COMP4 | no es cálculo |
|---|---|---|---|---|---|---|
| evaluación continua | 65 | 2 355 | 10,2 % | 52,8 % | 37,0 % | **47,2 %** |
| ordinaria | 12 | 990 | 7,6 % | 64,5 % | 27,9 % | **35,5 %** |
| extraordinaria | 11 | 910 | 7,7 % | 61,1 % | 31,2 % | **38,9 %** |

**Cuanto más global es el examen, más se parece a calcular.** Entre los tres
bloques hay casi once puntos porcentuales, y dentro de la continua la diferencia
es mucho mayor: la recuperación de la cuarta reparte el **64,1 %** de la nota
fuera del cálculo y la primera evaluación el **60,0 %**, mientras que la quinta
se queda en el **35,0 %**. Tiene una lectura práctica inmediata: quien se juega el
curso en la extraordinaria necesita, sobre todo, saber hacer cuentas; quien va
por evaluación continua se juega casi la mitad en demostrar y explicar.

Lo que no cambia es lo de siempre, y sigue siendo el dato que ordena el
proyecto: **más de cuatro de cada diez puntos de Cálculo no se ganan
calculando**. En las globales antiguas hay ejercicios enteros de solo demostrar
—la de 2016-2017 trae dos con COMP2 = 0, la de 2015-2016 uno con **cuatro puntos
de COMP1**, el máximo del corpus, y la de 2013-2014 dedica cuatro de sus diez
puntos a «enunciar y demostrar el teorema fundamental»—.

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

**Y la ruta de la extraordinaria ya existe.** Escrita el 26 de agosto de 2026,
sobre las once convocatorias y no sobre una muestra: **doce bloques y veintitrés
escalones**, la más grande de las siete. Y no es la de la ordinaria con otro
nombre, porque el examen tampoco lo es — lo primero que se ve al medirlo es que
**el formato no es uno solo**:

| formato | ejerc. | convocatorias |
|---|---|---|
| 4 + 4, 40 + 40 puntos | 8 | 2012-2013, 2013-2014, 2016-2017, 2018-2019, 2020-2021, 2021-2022, 2022-2023 |
| 5 + 5, 50 + 50 | 10 | 2023-2024, 2024-2025 |
| **3 + 5, 30 + 50** | 8 | 2017-2018 |
| **3 + 4, 30 + 40** | **7** | 2015-2016 |

El salto a diez ejercicios llega en 2023-2024 y se mantiene. El formato de ocho
es el dominante y aguanta once años, de 2013 a 2023. Las dos raras son
consecutivas, 2015-2016 y 2017-2018: **los dos cuatrimestrales no valen lo
mismo**, y la de 2015-2016 es además la más corta del corpus con siete
ejercicios.

**Y lo más importante para quien la va a hacer**, impreso en la cabecera de
2016-2017: los dos cuatrimestrales se presentan **por separado**. Quien aprobó
uno por evaluación continua solo hace el otro. La extraordinaria no es un examen,
son dos que caen el mismo día.

Con cuatro huecos por parcial se quedan fuera temas enteros, y cuáles se quedan
fuera cambia cada año — por eso la ruta de la extraordinaria no puede ser la de
la ordinaria con otro nombre.

Lo que **sí** se repite. Contado sobre las once, que ya son todas:

| tema | de 11 |
|---|---|
| complejos · estudio local · EDO | **11** |
| Laplace | 10 |
| integración · integral múltiple | 9 |
| integral curvilínea | 8 |
| Fourier | 6 |
| varias variables | 3 |
| sucesiones | **1** |
| funciones reales | **0** |

Tres temas caen **siempre** y Laplace se salta uno solo: ese es el esqueleto de
la ruta que falta, y ya no va a cambiar, porque no quedan extraordinarias por
leer. En el otro extremo, el tema 3 no ha caído nunca en una extraordinaria y el
2 una sola vez: quien se juega el curso aquí puede repartir su tiempo con esos
datos.

Y hay un hallazgo que cambia cómo hay que preparar esta convocatoria: **la
extraordinaria repite exámenes del propio curso**, no solo de años anteriores.
Dos casos medidos, y los dos aparecieron al transcribir las convocatorias más
antiguas:

| curso | de dónde sale | cuánto antes |
|---|---|---|
| 2015-2016 | el ejercicio 2 de la **tercera evaluación**, con la misma figura | cinco meses |
| 2013-2014 | el ejercicio 2 de la **sexta evaluación** —la global de mayo— | **un mes** |

El de 2013-2014 es el que más dice: el 19 de mayo se pide enunciar y demostrar
el teorema fundamental y aplicarlo a la campana de Gauss, y el 18 de junio se
pide exactamente lo mismo, con las mismas palabras y solo el reparto de puntos
cambiado. Quien se presenta a la extraordinaria debería empezar por sus propios
exámenes de ese curso.

## La ruta de la extraordinaria, y por qué no es la de la ordinaria

Escrita el 26 de agosto de 2026, en cuanto se cerró el corpus. Es la séptima y
la más grande: **doce bloques, veintitrés escalones, 38 de los 91 ejercicios**.

Lo que la hace distinta no es una decisión de estilo, es el examen: **la
extraordinaria no es un examen, son dos**, con su hoja y su nota cada uno, y
quien aprobó un cuatrimestre por evaluación continua solo hace el otro. Está
impreso en tres de los once cuadernillos —2012-2013, 2013-2014 y 2016-2017— con
todas las letras: «sólo para alumnos con el primer cuatrimestral suspendido».
Así que la ruta va partida en dos mitades y lo dice desde la primera línea: lo
más probable es que solo necesites una.

La medición que ordena los bloques, sobre las once convocatorias:

| hueco | ejercicios | de 11 convocatorias |
|---|---|---|
| **dibujar algo** (el suelo, en los dos cuatrimestrales) | 40 de 91 | **11** |
| complejos · 1.º cuatrimestral | 11 | **11** |
| ecuaciones diferenciales · 2.º | 11 | **11** |
| Laplace · 2.º | 10 | 10 |
| el sólido y su centro · 2.º | 9 | 9 |
| optimizar · 1.º | 11 | 8 |
| integral curvilínea · 2.º | 8 | 8 |
| Fourier · 2.º | 6 | 6 |
| la integral que no se sabe hacer · 1.º | 5 | 5 |

Tres cosas que solo se ven con las once delante, y que ninguna otra ruta puede
decir:

- **Complejos y EDO caen los once años, uno cada uno**, y siempre en el mismo
  sitio del cuadernillo. No hay otro par de huecos así en toda la asignatura.
- **Cinco de los diez ejercicios de Laplace son sistemas** de dos ecuaciones
  acopladas, y **cuatro de los nueve sólidos son un cilindro dentro de una
  esfera**. Cambian los números, no el procedimiento: media hora bien invertida
  cubre cuatro años.
- **El hueco que está creciendo** es «la integral que no se sabe hacer»: cinco
  ejercicios, uno por año desde 2020-2021, y ninguno antes. Es el que mejor
  separa a quien entendió el teorema fundamental de quien se lo sabe.

Y un detalle de método que conviene dejar escrito: los 81 enlaces de teoría de
la ruta se comprobaron **abriendo cada uno y buscando el id en la página de
destino**, no leyendo el href. `verify.mjs` parte los enlaces por `#` y no
valida fragmentos —lo dice el propio esquema—, así que un apartado mal escrito
habría pasado el suelo en verde y dejado al alumno en la cabecera de la página.
Es el fallo de §16.2, el de los 58 enlaces rotos, y esta vez se buscó antes de
que apareciera. De paso se pasaron por el mismo comprobador las otras seis
rutas: 496 enlaces con ancla, cero rotos.

## La auditoría de §15, y las diecinueve herramientas que faltaban

Hecha el 26 de agosto de 2026, en cuanto se cerró el corpus y se escribió la
séptima ruta. §15 pide que **toda herramienta que el examen usa esté presentada
en la prosa del tema**, y añade cómo se comprueba: «contando apariciones, no
leyendo por encima». Eso es lo que se hizo.

**El método.** Para cada tema, se cogieron los términos que nombran una
herramienta concreta —no «integral» ni «función», que no dicen nada—, se buscó
cuáles aparecen en sus ejercicios de examen, y de esos, cuáles **no aparecen ni
una vez** en su `index.mdx`. Es el mismo procedimiento con el que apareció la
deuda 37, cuando la palabra «superficie» no salía en el tema 7.

Y se distinguió una cosa que cambia mucho la gravedad: si el término lo dice
**el enunciado del examen** —la voz del profesor— o solo nuestra resolución.

**Lo que salió**, y hubo que afinarlo dos veces porque la primera pasada mentía:

| tema | lo que faltaba | usos en examen |
|---|---|---|
| t04 | **«concavidad»**, la palabra exacta que usan ocho enunciados | 15 |
| t08 | **«circulación»**, el otro nombre de la integral de línea | 15 |
| t09 | **«resonancia»**, y el verbo «resuena» | 14 |
| t04 | **«resto de Lagrange»**: la fórmula estaba, el nombre no | 11 |
| t11 | **la serie de Leibniz**, que remata nueve ejercicios | 9 |
| t09 | **«coeficientes indeterminados»**: el método sin su nombre | 8 |
| t09 | **la variación de las constantes**, que no estaba en absoluto | 5 |
| t05 | **la integración numérica entera** — punto medio, trapecio, Simpson | 6 |
| t06 | **la regla de la cadena**, que no aparecía ni una vez | 2 |
| t03 | **Darboux**, que un examen pide enunciar y demostrar, 0/0/10 | 1 |
| t07 | **el momento de inercia** | 1 |
| t11 | **el espectro** | 1 |
| t06 | **la diferencial total** | 2 |
| t04 | **L'Hôpital** | 1 |

**Dos falsos positivos, y los dos enseñan algo sobre el propio auditor.** El
primero: «punto medio» aparecía en cuarenta exámenes, y en treinta y nueve es el
punto medio de un segmento, no la regla de cuadratura. El segundo: «delta»
aparecía en cinco, y en los cinco es $Delta$, un incremento, no la delta de
Dirac. Un buscador de subcadenas no distingue significados, y publicar «faltan
seis herramientas» cuando falta una es exactamente lo que §10 prohíbe. Por eso
la lista de arriba está contada con términos precisos y verificada uno a uno.

**Lo que se escribió.** Los catorce huecos, cerrados el mismo día: la prosa de
Cálculo pasa de **19 955 a 22 109 palabras**, un 11 % más, sin que haya crecido
ningún tema por gusto. Los tres que más suben son los tres que más les faltaba:

| tema | antes | ahora | qué se le añadió |
|---|---|---|---|
| t09 EDO | 1 241 | **1 800** | resonancia con su nombre, los dos métodos de la particular, y los tres modelos con nombre propio |
| t11 Fourier | 1 668 | **2 012** | Leibniz y las otras dos sumas, con la función que produce cada una, y el espectro |
| t05 integración | 1 925 | **2 251** | un apartado nuevo de cuadratura, con la comparación de errores y el cambio que acota el intervalo |

Las tres sumas de Fourier y las tres reglas de cuadratura **se comprobaron
numéricamente antes de publicarlas**, y menos mal: la primera versión de la
tabla de series decía que $sum 1/n^{2}$ sale de la ampliación par de $t$
evaluada en el origen, y es falso —de ahí sale $pi^{2}/8$, y hace falta
$t^{2}$ en $t=pi$ para $pi^{2}/6$—. Y una cuarta fila decía que la armónica
alternada sale de una serie de Fourier: sale del desarrollo de $ln(1+x)$, que
es del tema 4. Las dos habrían sido plausibles y las dos eran mentira.

## Lo que la tanda de hoy metió en el suelo de calidad

Tres comprobadores nacieron en el scratchpad esta tanda, y la pregunta de §11 es
cuáles merecen quedarse. La respuesta no fue «los tres».

**Dentro, el de las anclas.** `verify.mjs` partía los enlaces por `#` y tiraba
el fragmento: un enlace con destino válido y ancla inventada pasaba en verde y
dejaba al lector en la cabecera de la página. Pasó de verdad el 23 de agosto,
con 58 enlaces de teoría. Ahora se comprueba que el id existe en la página de
destino: **602 anclas entre páginas, todas aterrizan**.

Y se validó al revés, como manda §11 — y menos mal, porque **la primera versión
no saltaba**. Se rompió un ancla a propósito en el HTML publicado y el guardián
siguió verde: usaba `candidatos.find(existsSync)`, que devuelve el
**directorio** `dist/calculo/t01-complejos` porque existe, y con esa clave el
mapa de ids no encontraba nada y se saltaba la comprobación en silencio. Un
guardián que no falla cuando el fallo existe es peor que no tenerlo.

**Dentro, el de las convocatorias huérfanas.** Un ejercicio de examen puede
estar transcrito, publicado y correcto, y no tener ninguna ruta que lleve a él.
Pasó hoy mismo con los catorce de las recuperaciones de la quinta. El guardián
no exige que todos estén enlazados —una ruta es una selección— sino que
**ninguna convocatoria entera se quede fuera**, que eso ya no es selección sino
descuido. Y se estrenó encontrando tres: 2013-2014-ext, 2017-2018-ord y
2019-2020-ord, las tres sin un solo ejercicio en ninguna ruta. Enganchadas.

**Fuera, la auditoría de herramientas.** Es la que encontró los catorce huecos
de prosa, y aun así no entra, porque de sus veintiún hallazgos **dos eran
falsos**: «punto medio» casi siempre es el punto medio de un segmento, y
«delta» casi siempre es un incremento. Un guardián que grita sin fallo enseña a
saltarse los guardianes, que es el daño de verdad (§11). Se queda como
auditoría periódica, que se pasa a mano y se lee con criterio.

## Contra el criterio de «asignatura terminada» (§15)

| criterio | |
|---|---|
| temas del temario oficial, con fuente | ✅ 11/11 |
| todo tema enlazado por una ruta tiene prosa | ✅ |
| **toda herramienta que el examen usa, presentada en la prosa** | ✅ **auditado el 26 de agosto de 2026, catorce huecos cerrados** |
| **todo ejercicio de examen enlazado** | ✅ **425 de 425**, cerrado el 28 de agosto de 2026 |
| **todo ejercicio de tema enlazado** | ✅ **191 de 191** |
| cada tema con ejemplo introductorio propio | ✅ **53**, y ninguno de los 156 escalones arranca en un ejercicio de examen |
| cada tema con al menos una figura | ✅ 29 |
| una ruta por evaluación | ✅ **7 rutas para los 9 tipos de convocatoria** |
| `tests/fisica/` con un caso por simulador | ✅ vacío, no hay simuladores |
| `falta[]` dice lo que no está | ✅ 37 huecos, y las siete rutas dicen con qué tres criterios se buscaron |
| `npm run suelo` en verde | ✅ |
| **todas las convocatorias publicadas transcritas** | ✅ **88 de 88** |

> **Dos de estas filas estuvieron en verde antes de tiempo, y hay que decirlo.**
> Hasta el 28 de agosto de 2026 la tabla decía «314 enlazados» y «una ruta por
> evaluación ✅ 7 de 7», y las dos afirmaciones eran optimistas. El 7 de 7
> contaba rutas, no las nueve convocatorias que hay que preparar. Y de los 425
> ejercicios de examen había **116 sin enlazar desde ninguna ruta**, casi todos
> por la misma causa: la ordinaria y la extraordinaria son **dos parciales el
> mismo día**, y las dos rutas globales solo cubrían el segundo. Se midió, se
> escribió la mitad que faltaba —**once bloques y treinta y tres escalones
> nuevos** entre las dos— y hoy la cifra es 425 de 425 y 182 de 182, contadas
> por el guion de auditoría, no a ojo.
>
> El «88 de 88» merece explicación, porque durante meses este documento dijo
> «de 89». 85 son los PDF; cuatro cuadernillos traen **dos** convocatorias
> dentro —la evaluación y su recuperación—, lo que suma 89; y el cuadernillo de
> mayo-junio de 2020 está partido en **dos** ficheros que son un solo examen, lo
> que resta 1. Total: 88, y las 88 están.

## Álgebra, abierta el 26 y cerrada el 27 de agosto de 2026

**Álgebra cumple §15 entera.** Está en el catálogo como `ok`, y esa es la
segunda asignatura terminada del proyecto. La auditoría, ejecutada sobre los
ficheros y no leída por encima:

| §15 pide | |
|---|---|
| los temas del catálogo son el temario oficial, con su fuente | ✅ **7**, `temarioOficial: true` |
| todas las convocatorias publicadas transcritas, con su PDF | ✅ **8 de 8**, y ningún PDF sin transcribir |
| una ruta por evaluación | ✅ **2 de 2** |
| todo tema que una ruta enlaza tiene prosa | ✅ **7 de 7** |
| cada tema con ejemplo introductorio propio y una figura | ✅ **7 de 7** |
| `tests/fisica/` con un caso por simulador | ✅ vacío, no hay simuladores |
| `falta[]` dice lo que no está | ✅ **12 huecos** declarados |
| toda herramienta que el examen usa, presentada en la prosa | ✅ **48 de 48** |
| todo ejercicio de examen, enlazado desde una ruta | ✅ **32 de 32** |
| todo ejercicio de tema, enlazado desde una ruta | ⚠️ **77 de 179** desde un escalón; los 102 restantes son boletín y se llegan desde la página de su tema. Con el boletín entero dentro (30 de agosto), enlazarlos todos haría de cada escalón una lista, que es lo que §14 prohíbe |
| `npm run suelo` en verde | ✅ las dos líneas, cero fallos |

> **El reparto por competencia es la única fila que Álgebra no puede cumplir, y
> no es un hueco nuestro:** §15 pide transcribir cada convocatoria «con su
> reparto por competencia», y **ninguno de los ocho cuadernillos lo publica**.
> Está declarado en los ocho `examen.yaml`, la ficha del examen no imprime «0
> puntos» y las rutas no publican porcentajes. Es §10 funcionando: un dato que
> no existe no se estima.

Las tres últimas filas —las herramientas, y los ejercicios enlazados— salieron
de la auditoría de Cálculo del 24 de agosto y son las que más cuestan. La de
las herramientas se comprueba **contando apariciones** sobre las 48 que los
treinta y dos enunciados nombran, y la lista está escrita a mano leyendo los
enunciados: un buscador de subcadenas no distingue significados, que es la
lección de la deuda 46.

## Álgebra, cómo se construyó

Se abre el mismo día que Cálculo cumple §15 entera, que es lo que §00 exige. El
material apareció completo: **ocho exámenes, la teoría de los siete temas y los
boletines de problemas**.

**El temario es oficial y con fuente**, no puesto a ojo: las transparencias del
Departamento de Matemática Aplicada numeran los temas en su portada —Matrices el
3, Determinantes el 4, Sistemas el 5, Euclídeos el 6, Diagonalización el 7— y el
orden de los ocho exámenes fija los dos primeros: el ejercicio 1 es siempre
espacios vectoriales y el 2, aplicaciones lineales.

| n | tema | peso |
|---|---|---|
| 1 | Espacios vectoriales | alto |
| 2 | Aplicaciones lineales | alto |
| 3 | Matrices | medio |
| 4 | Determinantes | medio |
| 5 | Sistemas de ecuaciones lineales | medio |
| 6 | Espacios vectoriales euclídeos | alto |
| 7 | Diagonalización de matrices cuadradas | alto |

**El corpus de exámenes de Álgebra está completo: 8 convocatorias de 8.**
Cuatro cursos, ordinaria y extraordinaria de cada uno, **32 ejercicios y 140
pasos guiados** —32 `reconocer`, 76 `calcular` y 32 `justificar`—. No queda
ninguno por leer, y `verify.mjs` lo confirma desde su propio guardián.

**Y aquí hay un dato que decide las fases siguientes:** contando el tema que
ocupa cada hueco del examen, los ocho cuadernillos se reparten así.

| hueco | tema | veces |
|---|---|---|
| ejercicio 1 | espacios vectoriales | **8 de 8** |
| ejercicio 2 | aplicaciones lineales | **8 de 8** |
| ejercicio 3 | euclídeos **4** · determinantes **4** | 8 |
| ejercicio 4 | diagonalización | **8 de 8** |

Tres huecos son **fijos las ocho veces**, y el tercero es el único que rota, y
solo entre dos temas. La consecuencia para §14 es directa: la ruta de Álgebra
tiene tres bloques obvios y uno partido en dos, y no hace falta estimar nada.

> El reparto del hueco 3 decía «euclídeos 4 · matrices 2 · determinantes 2»
> hasta el 27 de agosto de 2026, y era falso. Los dos ejercicios etiquetados
> como matrices son inversas de matrices con un parámetro, y **el temario
> oficial pone la matriz inversa y el rango en el tema de Determinantes**: son
> sus apartados 4 y 5. La hoja de Matrices no menciona ninguna de las dos.
> Salió al leer el temario para escribir el tema 3, y está corregido en los dos
> `examen.yaml` con el motivo escrito.

**Y hay dos temas que no ocupan NI UN SOLO hueco: el 3, matrices, y el 5,
sistemas de ecuaciones lineales.** Cero de treinta y dos cada uno. Los dos
aparecen dentro de otros ejercicios —todo núcleo es un sistema, y la matriz
asociada está en todas partes— pero nunca como el ejercicio. Eso no significa
que no haya que escribirlos; significa que en la ruta van como **suelo** y no
como bloques de rendimiento, que es exactamente la distinción que §14 hace.

### Los siete temas escritos: 7 de 7

Contado sobre los ficheros, el 30 de agosto de 2026, con `npm run mide
algebra` —la definición de «palabra» de `scripts/mide.mjs`, que es la única
que vale (§15); la tabla anterior decía 13.343 con el conteo crudo del MDX—:

| tema | palabras | figuras | ejercicios | de ellos propios | pasos |
|---|---|---|---|---|---|
| 1 · espacios vectoriales | **2.145** | 2 | 36 | 3 | 112 |
| 2 · aplicaciones lineales | **1.344** | 2 | 26 | 3 | 83 |
| 3 · matrices | **1.205** | 1 | 22 | 2 | 70 |
| 4 · determinantes | **1.231** | 1 | 24 | 3 | 79 |
| 5 · sistemas lineales | **1.000** | 1 | 24 | 2 | 78 |
| 6 · espacios euclídeos | **1.142** | 1 | 12 | 3 | 43 |
| 7 · diagonalización | **1.111** | 1 | 35 | 3 | 111 |
| **total** | **9.178** | **9** | **179** | **19** | **576** |

**El boletín oficial está transcrito entero en los siete temas**
(30 de agosto de 2026): los 33 de espacios vectoriales, los 23 de
aplicaciones lineales, los 20 de matrices, los 21 de determinantes (el 4.15 va
dos veces en el original), los 22 de sistemas, los 7 de euclídeos (9
ejercicios, el 6.4 trae tres bases) y los 25 de diagonalización (32
ejercicios, porque el 7.6 y el 7.7 traen varias matrices cada uno), cada uno
con su enunciado verbatim, sus pasos guiados y las cuentas comprobadas
numéricamente antes de escribir un solo mensaje de diagnóstico. Al principio
quedó escrito aquí que faltaba el de euclídeos: era falso — su boletín solo
tiene 7 enunciados y estaban los 7 desde el cierre del 27 de agosto. Dos
enunciados traen erratas casi seguras del original (el 28 y el 31 de espacios
vectoriales, más la ya conocida del 6.7) y se resuelven tal como están
impresos, diciendo qué cambiaría con el signo probable.

**El reparto de longitudes no es casual y conviene que quede dicho:** los temas
1 y 2 son los largos porque ocupan un hueco del examen **cada uno de los ocho
años**; los temas 3 y 5 son los cortos porque **no ocupan ninguno**; y el 4, el
6 y el 7 quedan en medio. Escribir tres mil palabras sobre un tema que no se
examina solo sería gastar el tiempo del alumno donde no rinde.

### Las dos rutas

| | ordinaria | extraordinaria |
|---|---|---|
| bloques | 6 | 6 |
| escalones | 17 | 17 |
| huecos declarados en `falta[]` | 6 | 6 |
| `medidoSobre` | 8 | 8 |

**Las dos rutas se diferencian en un bloque y solo en uno**, y ese hecho está
medido, no supuesto: el hueco 3 del examen es de **espacios euclídeos en las
cuatro ordinarias** y de **determinantes en las cuatro extraordinarias**. No
rota entre los dos temas: está partido por convocatoria, sin una excepción en
las ocho leídas.

Los otros tres huecos son idénticos en las dos —espacios vectoriales,
aplicaciones lineales y diagonalización, ocho de ocho cada uno—, así que los
bloques correspondientes comparten estructura y cambian solo los ejercicios de
examen que enlazan.

**Y el guardián de convocatorias huérfanas de `verify.mjs` pasa por primera vez
a `96 de 96`**: hasta ahora decía «88 de 88, y 8 más en asignaturas que aún no
tienen ruta». Ya no hay ninguna suelta.

> **Dos veces he publicado un recuento estimado en un mensaje de commit, y las
> dos estaba mal.** El tema 2 salió como «2.900 palabras» siendo 2.255, y los
> temas 3 y 4 como «1.234 y 1.322» siendo 1.750 y 1.676. El motivo es siempre
> el mismo: escribir el mensaje **antes** de mirar la medición, aunque la
> medición fuese en el mismo comando.
>
> La regla que queda, y va en `tasks/todo.md` para que no se pierda: **ningún
> recuento entra en un mensaje de commit sin haber leído antes la salida del
> comando que lo cuenta.** Si al escribir el mensaje no tienes el número
> delante, no lo pongas: enlaza a este documento, que sí se mide.
>
> Los mensajes de commit no se reescriben —reescribir historia ya empujada
> cuesta más de lo que arregla— y la corrección tiene que quedar **visible**,
> no borrada.

Los ejercicios de cada tema son **ejemplos de entrada nuestros** —que existen
porque el boletín y el examen empiezan los dos por encima del nivel de quien
acaba de leer la teoría— y **ejercicios del boletín oficial**, reproducidos
verbatim. Hasta el 29 de agosto había dos o tres del boletín por tema; desde el
30, el boletín entero en seis temas de siete, con el método que quedó escrito
en `tasks/todo.md`: renderizar el PDF a imagen (el volcado de texto se come
las matrices), comprobar cada cuenta con un guion, y solo entonces escribir.

**Los temas 3 y 4 son más cortos a propósito**, y no por falta de material:
ninguno de los dos ocupa un hueco del examen por sí mismo. El 3 es el suelo
—operaciones, traspuesta, las dos matrices especiales— y el 4 trae las dos
herramientas que sí caen, la inversa y el rango. Escribir tres mil palabras
sobre un tema que no se examina solo sería gastar el tiempo del alumno donde no
rinde.

**Un hallazgo del tema 2 que conviene no perder:** la hoja de teoría de
aplicaciones lineales **no define la matriz asociada**. Sus seis apartados son
conceptos básicos, definición y propiedades, núcleo, imagen, dimensiones y
existencia. La matriz asociada está en la hoja de **Matrices**, apartado 3.2 —
y el ejercicio 2 del examen la pide las ocho veces. Está dicho en la prosa,
porque explica una sensación de estar perdido que no es culpa del alumno.

**Y no es Cálculo con otros números.** Medido sobre los ocho PDF, antes de
transcribir ninguno:

| | Cálculo | Álgebra |
|---|---|---|
| convocatorias en el volcado | 88 | **8** |
| cursos | 11 | **4** (2021-22 a 2024-25) |
| tipos de convocatoria | 9, con parciales y recuperaciones | **2**: ordinaria y extraordinaria |
| reparto por competencia impreso | en los 425 ejercicios | **en ninguno** |
| estructura del ejercicio | variable | fija: **(a) demostrar + (b) calcular** |

Las tres últimas filas cambian el trabajo, y conviene tenerlas dichas antes de
empezar:

- **No hay parciales.** Las rutas de Álgebra se medirán sobre ocho
  convocatorias, no sobre ochenta y ocho, y eso hay que declararlo en
  `medidoSobre` — que para eso existe el campo.
- **No hay reparto de puntos.** El campo `puntos` ya era opcional en el
  esquema, así que no rompe nada; pero la ruta de Álgebra **no podrá publicar
  porcentajes por competencia**, y decirlo es mejor que estimarlos.
- **La mitad de cada ejercicio es una demostración.** «Definir $S+T$ y demostrar
  que es un subespacio», «demostrar que $f$ es inyectiva si y solo si el núcleo
  es el cero», «demostrar la invariancia del polinomio característico». En
  Cálculo el paso `justificar` era el complemento del cálculo; aquí es la
  mitad del ejercicio.

**Lo que ha costado de capa compartida, con el primer examen ya escrito.** Más
de lo que parecía al abrirla, y todo por el mismo motivo: el repositorio daba
por supuestas cosas que solo eran ciertas de Cálculo.

| dónde | qué | por qué |
|---|---|---|
| `content.config.ts` | la colección `algebra`, y dos tipos de respuesta más | una línea, igual que `fluidos` |
| `verify.mjs` | el guardián de convocatorias huérfanas, generalizado | tenía `calculo` escrito a fuego, y habría dejado a Álgebra fuera del suelo el mismo día que entró |
| `lib/algebra.ts` + tests | el lector de vectores y matrices, la deuda 4 | 23 tests nuevos |
| `EjercicioGuiado.astro` | los dos tipos nuevos y sus diagnósticos | el orden cambiado y la matriz traspuesta |
| `[examen].astro` | el reparto de puntos deja de ser obligatorio | ver abajo |
| `ui/Examen.astro` | ya no imprime «0 puntos» cuando no hay reparto | §10 |

**Las dos últimas filas son la lección de la tanda.** Este documento decía, el
mismo día, que el campo `puntos` era opcional en el esquema «así que no rompe
nada». Era verdad del esquema y **falso del sitio**: la página del examen tenía
un guardián propio que abortaba el build con «el examen los imprime en la hoja,
así que aquí son obligatorios». Ese motivo, escrito cuando solo existía Cálculo,
dejó de ser cierto en cuanto entró una asignatura cuyos cuadernillos no los
imprimen.

La regla nueva protege lo mismo con un supuesto más flojo: **dentro de un
examen, o los declaran todos o no los declara ninguno**. Sigue cazando el fallo
de verdad —transcribir un examen y olvidarse de los puntos de un ejercicio— y ya
no exige un dato que la hoja no publica. Y la cabecera de la ficha, que decía
«0 puntos», ahora no dice nada: cero no es lo mismo que «no se publica».

**El lector de respuestas, que §00 llevaba meses anunciando.** Se decidió con el
examen delante y no antes (§13), y lo que hacía falta eran dos tipos:

- **`vector`**, que compara **con el orden puesto**. Con `conjunto` la
  respuesta $(0,-3,0,0)$ se habría dado por buena frente a $(0,0,-3,0)$, y en
  una base el orden es la respuesta. Cuando los números están bien y el orden
  mal, lo dice con esas palabras.
- **`matriz`**, que reconoce **la traspuesta** y la señala como tal: es el
  error clásico de la matriz asociada, porque las coordenadas de cada imagen van
  en columna.

## Las otras siete asignaturas

Seis están como `prev`, con cero contenido. Es §00 funcionando: no se abre una
hasta cerrar la anterior.

**Mecánica de Fluidos se abrió el 30 de agosto de 2026**, en cuanto Álgebra
quedó cerrada con su boletín entero. Lo hecho el primer día:

| | antes | ahora |
|---|---|---|
| temario | 16 temas puestos a ojo, `temarioOficial: false` | **los 25 oficiales**, de la Guía de la asignatura |
| pesos | estimados | **medidos** sobre los 10 exámenes finales de 2020-2025 |
| temas escritos | 0 | **1 de 25** (t01, introducción) |
| respuestas con unidad | imposibles | tipo `magnitud`, con lector y 20 tests |

### Dónde está Fluidos el 31 de agosto de 2026

Ocho fases después, y medido con `npm run mide fluidos`:

| | |
|---|---|
| temas con prosa, figura y ejercicios | **23 de 25** |
| palabras de prosa | **22.480** (Cálculo entera son 21.545) |
| figuras | 23 |
| ejercicios | **173**, con 780 pasos |
| de ellos, problemas de la colección | **92 de 236** |
| convocatorias transcritas | **6 de 17** — 2026 ord. (7 de 9), 2025 ext. (8 de 9), 2024 ord. (**8 de 8**), 2024 ext. (7 de 8), 2023 ord. (**9 de 9**) y 2023 ext. (**9 de 9**) |
| rutas de estudio | **0 de 2** |

Los **dos temas que faltan son los que no tienen material**: el 5 (equilibrio
relativo) y el 6 (estática de compresibles) están en el programa oficial y no
aparecen ni en los dos volúmenes de apuntes, ni en las diapositivas, ni en la
colección de problemas. El catálogo lo dice con su `etiqueta` en vez de
rellenarlos por nuestra cuenta. Lo mismo con el apartado **17.4** —resistencia
sobre cuerpos sumergidos—, declarado en la prosa del tema 17.

Y lo que falta **no es material sino trabajo**: las 17 convocatorias (16 en el
cuadernillo de 2020-2025 más la ordinaria de 2026) y las dos rutas. Los PDF
originales ya están en `public/examenes/fluidos/`.

> **Una cosa que este bloque enseñó y no estaba prevista.** Al abrir «Cuadros y
> ábacos» para verificar un examen apareció que un ejercicio del tema 18 usaba
> la rugosidad del acero comercial que dan Çengel y White —0,046 mm— en vez de
> la del **cuadro n.º 20 de esta escuela**, que es 0,06 mm. Seis números
> publicados eran falsos con el suelo, los tests y el humo en verde. Los cazó
> abrir la fuente para otra cosa, y es el mejor argumento que hay para el punto
> 1 de §16: **el verde no es una comprobación, es la ausencia de una.**

### El boletín, que es donde estaba el hueco de verdad

El 31 de agosto Ionan preguntó por qué había tan pocos ejercicios por tema, y
el número le daba la razón: **la colección de problemas son 236 ejercicios y
solo había 18 dentro**. De los 52 que tenía Fluidos, 34 eran ejemplos
introductorios nuestros.

La causa era de método y conviene dejarla escrita: en las ocho fases traté la
colección como **fuente de ejemplos** —uno o dos problemas representativos por
tema— en vez de transcribirla entera, que es exactamente lo que hizo bueno el
boletín de Álgebra. El plan en `tasks/todo.md` decía «los ejercicios del
capítulo con su enunciado verbatim» y no se cumplió.

Corregido capítulo a capítulo. Y por el camino cayeron **dos supuestos falsos
que yo mismo había publicado**, los dos de la misma familia —dar por
imposible algo sin comprobarlo—:

| decía | resultó |
|---|---|
| «35 problemas del capítulo 2 dependen de figura acotada y no se pueden transcribir» | se leen renderizando la página del PDF y ampliándola |
| «las curvas de bomba del capítulo 9 son documentación de fabricante y no entran en el repositorio» | **están en el propio PDF de la colección**, anexos, páginas 205 a 216; y §08 no prohíbe usarlas, prohíbe recortarlas |

La segunda la destapó una pregunta suya: «¿las curvas no están en los
documentos de esa carpeta?». Sí estaban. **La regla que sale de ahí: «no tengo
el dato» es una afirmación, y hay que comprobarla como cualquier otra.**

Al cerrar la tanda el corpus va por **92 de 236**. Los tres capítulos que
apenas se habían tocado —el 5 de análisis dimensional, el 7 de golpe de ariete
y el 8 de canales, con uno o tres problemas cada uno— pasan a 6, 8 y 7. La
cobertura capítulo a capítulo está en la tabla de `tasks/todo.md`.

Y una cosa que la transcripción en bloque enseñó y no se sabía: **reconstruir
un problema entero casi nunca da exactamente el número del boletín.** La
mayoría de las veces la diferencia es del 0,3 al 1,6 % y viene de leer el
ábaco a ojo; esas se publican con la discrepancia dicha en la resolución y con
la tolerancia abierta lo justo para que las dos lecturas valgan. Cuando la
diferencia no se explica, el problema **no se publica**: le ha pasado al 6.23,
que se aparta un 4 % de forma sistemática con los cuadros de la escuela, y
antes al 2.33. Un problema que no se sabe reproducir no es un problema difícil:
es un problema que todavía no se entiende.

**El temario oficial son 25 temas y no 16.** El catálogo llevaba meses
publicando una lista plausible —los temas «que parecían caer»— con
`temarioOficial: false`, que es lo que §15 exige mientras no tengas la fuente.
La fuente es el apartado 4 de la Guía de la asignatura, «Programa de teoría de
Mecánica de Fluidos».

**Y los pesos no son una impresión.** Los cuadernillos de examen de esta
asignatura **imprimen el porcentaje de cada ejercicio** —cosa que Álgebra no
hacía—, así que se extrajeron los 111 ejercicios con su tanto por ciento, se
clasificó cada uno por tema y se sumó. De ahí salen los nueve temas de peso
alto (4, 7, 13, 15, 16, 18, 19, 21 y 25) y, sobre todo, las ocho `etiqueta` de
temas **transversales**: el 12 (Bernoulli) y el 14 (cantidad de movimiento)
casi nunca ocupan un hueco propio, pero caen dentro de los que sí.

### La capa de unidades, que es lo que Fluidos le pide al sistema

Cada asignatura ha tensionado el sistema por un sitio distinto: Cálculo pedía
lectura de regiones, Álgebra pidió vectores y matrices. **Fluidos pide
unidades**, y CLAUDE.md llevaba meses diciendo que eso se hacía «una vez,
bien, cuando entre la primera asignatura con unidades — no con un apaño en el
contenido».

Lo que entró es un tipo de respuesta `magnitud` (`src/lib/unidades.ts`) que
compara **por dimensión**: convierte lo escrito y lo esperado a unidades base
del SI y los contrasta allí. Consecuencias visibles para el alumno:

- **`1 bar`, `100 kPa` y `10,2 mca` son la misma respuesta**, y las tres se
  dan por buenas. La unidad la elige quien contesta, no quien redactó.
- **Faltar la unidad no es lo mismo que fallar el número.** Quien escribe
  «1,5» donde la respuesta es «1,5 bar» recibe *«el número está bien; falta la
  unidad»*, no un «mal» a secas.
- **Y dar caudal en m/s tiene mensaje propio**: *«esa unidad es de otra
  magnitud»*, con la recomendación de comprobar dimensiones antes que
  números. Es el error conceptual, y es el que más se repite.

La tolerancia de este tipo es **relativa** (2 % por defecto) y no absoluta,
porque media respuesta de fluidos sale de leer el ábaco de Moody a ojo.

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

Lo que queda por delante son las extraordinarias, y no bloquean nada. La
primera ya está: **2024-2025**, y trae dos cosas que no se sabían.

La primera es de formato: **la extraordinaria cambió de tamaño en 2023-2024**.
Las de 2023-2024 y 2024-2025 tienen diez ejercicios y cien puntos, cinco por
parcial —el examen más largo del corpus—; las de 2021-2022 y 2022-2023 tienen
**ocho y ochenta**, cuatro por parcial. Y con cuatro huecos por parcial se
quedan fuera temas enteros: en 2022-2023 no hay ni integral curvilínea ni
varias variables.

Y la de 2021-2022 trae una tercera hoja que no habíamos visto antes: además de
los dos cuatrimestrales, el cuadernillo incluye un **examen global de seis
ejercicios y sesenta puntos** para quien se examina de la asignatura entera. Sus
seis son copia literal de seis de los ocho anteriores —se quedan fuera el
pórtico y Fourier—, así que se transcriben los ocho y el global se documenta en
el comentario en vez de duplicarlo.

Y la segunda cambia lo que sabíamos de las repeticiones. **La extraordinaria
reutiliza exámenes de evaluación continua de otros años**, y con dos
transcritas ya son tres casos:

| en la extraordinaria de… | es el mismo que… |
|---|---|
| 2024-2025, el alambre | el ejercicio 4 de la 2.ª evaluación de 2023-2024 |
| 2024-2025, el sector que gira | el 4 de la 3.ª de 2022-2023 |
| 2023-2024, el McLaurin de la integral | el 2 de la 3.ª de 2020-2021 |

Hasta que entraron las extraordinarias, todos los repetidos que habíamos
encontrado estaban dentro del mismo hueco y del mismo tipo de convocatoria. Los
repetidos pasan de cuatro grupos y diez instancias a **siete y dieciséis**,
sobre 341 ejercicios — y **los tres nuevos son globales reutilizando
parciales**. Para una ruta de la extraordinaria eso es el dato más importante
que hay: preparar la extraordinaria pasa por repasar los parciales de años
anteriores, no solo las globales.

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
| 4 | ~~Las 11 extraordinarias + el cuadernillo de 2019-2020~~ | **hecho el 26 de agosto de 2026: cierra la deuda 26** |
| 5 | ~~Ruta de la extraordinaria~~ | **hecha el 26 de agosto de 2026: 12 bloques, 23 escalones** |
| 6 | ~~Enganchar las cinco recuperaciones de la quinta~~ | **hecho el 26 de agosto de 2026: los catorce, en 1.ª y 2.ª** |
| 7 | ~~Auditoría de Cálculo entera y cierre según §15~~ | **hecha el 26 de agosto de 2026** |
| 8 | **Abrir Álgebra** | ⛔ **bloqueado: no hay material en el repositorio** |

**Lo primero de la lista es ahora la fila 7, la auditoría.** Con el corpus
cerrado, las siete rutas escritas y las recuperaciones enganchadas, lo que queda
de Cálculo es trabajo de cierre y no de recogida de material. La tabla de §15 de
más arriba ya solo tiene casillas verdes: es la primera vez.

Y queda medido qué enlaza cada ruta y qué no. De los **425 ejercicios de
examen**, las siete rutas llevan a **303**; los 122 que quedan son 71 de las
ordinarias y 53 de las extraordinarias —cada ruta enlaza una selección y lo dice
en su propia cabecera—, más tres que son de temas que su ruta no cubre y que
están declarados en el `falta[]` de la ruta correspondiente: dos ejercicios de
varias variables en terceras evaluaciones y uno de integral curvilínea en una
cuarta. **Ninguno se queda sin enlazar por descuido**, que era lo que había que
comprobar.

Cuando entre Álgebra habrá que separar el lector de respuestas de
`EjercicioGuiado`: una **matriz** no es un número ni un conjunto de puntos, y
ese es el sitio por donde Álgebra tensiona el sistema. Es la razón por la que
va antes que Fluidos, que son 25 temas y la asignatura más cara de las nueve.

## Deudas abiertas que no bloquean

Están todas en `tasks/todo.md` con su número. Las que siguen vivas y merecen
una línea:

- **26** — ~~las convocatorias sin transcribir~~. **Cerrada** el 26 de agosto
  de 2026: los 85 cuadernillos leídos y las 88 convocatorias escritas.
- **43** — el esquema admite un PDF por convocatoria y el cuadernillo doble de
  2019-2020 son dos, así que los ocho ejercicios de su segundo cuatrimestral se
  publican sin enlace a su enunciado original. Es el único PDF del repositorio
  que ninguna convocatoria cita.
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
- **39** — ~~nueve etiquetas de figura se publicaban recortadas~~.
  **Cerrada** el 26 de agosto de 2026, y con guardián: `humo.mjs` mide la caja
  de cada `<text>` contra el `viewBox` de su SVG. Nació rojo sobre dos fallos
  que nadie había visto —«f(b) > 0» publicado como «f(b) >» en el tema 3— y al
  día siguiente resultó que en las páginas de examen **medía en vacío**: 38
  etiquetas y cero cajas medibles, porque `getBBox()` dentro de un
  `display: none` devuelve ceros. Arreglado eso —destapar la página, medir en
  un segundo paso, y contar—, el barrido de las 96 páginas encontró seis más, de
  meses atrás. Todas arregladas.
- **2** — ~~el temario de Fluidos está en el catálogo sin fuente verificada~~.
  **Cerrada** el 30 de agosto de 2026: los 25 temas oficiales, tomados del
  apartado 4 de la Guía de la asignatura, con `temarioOficial: true`.
- **5** — el patrón «figura fija» sigue sin construir, a propósito: ningún
  contenido lo ha pedido todavía.
- **18** — el bloque del formulario duplica hechos que ya están en la prosa.
