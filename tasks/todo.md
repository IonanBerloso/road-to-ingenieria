# Qué queda

Sesión 1 cerrada: cimientos + una página de contenido real. Esto es lo
siguiente, en el orden en que conviene hacerlo.

---

# Mañana · 3 de septiembre de 2026, por fases

Escrito al cerrar el día 7, con el estado medido y no recordado. **Tres
asignaturas cerradas de nueve** —Cálculo, Álgebra y Mecánica de Fluidos—, 112
convocatorias transcritas de 112 y 98 de los 236 problemas de la colección de
Fluidos.

El orden no es el del temario ni el de lo que apetece: va por **lo que rinde**
y por **lo que bloquea a otra cosa**. Las fases A y B son de Ionan, no mías, y
por eso van primero: mientras no las conteste, la C se puede hacer entera.

---

## Fase A · Dos decisiones que son tuyas, y una bloquea

Ninguna se puede tomar desde el contenido (§13). Cinco minutos de respuesta
desbloquean días de trabajo.

**A1 · ¿Se parten las páginas de teoría en dos?** Hoy una página de tema
incrusta la prosa **y** los ejercicios enteros **y**, en cinco temas, el
simulador. El tema 1 de Cálculo llegó a tardar 5,9 s en un móvil antes de
diferir los lienzos. Partir teoría y ejercicios arregla el peso de raíz, pero
**cambia las URL y las 7 rutas de estudio de Cálculo y la de Fluidos**, así que
no lo toco sin que lo digas. Está pendiente desde el día 1 de septiembre.

**A2 · ¿Cuál es la cuarta asignatura?** Fluidos cerró hoy. §00 dice que la
siguiente se elige porque **tensiona el sistema por un sitio distinto**, no
porque toque en el temario. Las candidatas, con lo que romperían:

| asignatura | qué rompe que no esté roto | coste |
|---|---|---|
| **Expresión Gráfica** | no hay «respuesta numérica»: se evalúa un dibujo. Rompe `EjercicioGuiado` entero | alto, y abre un patrón nuevo |
| **Fundamentos Químicos** | reacciones y estequiometría: pide un lector de fórmulas químicas | medio |
| **Ciencia de Materiales** | diagramas de fases — es el caso puro del patrón «figura fija», el único de los cinco sin construir | medio |
| **Ingeniería Térmica** | ciclos termodinámicos; reutiliza casi todo de Fluidos | bajo, y por eso enseña poco |

Mi recomendación, si quieres una: **Ciencia de Materiales**, porque es la única
que fuerza a construir el patrón que lleva desde el principio en §05 sin
construirse. Pero es tu decisión y no la tomo yo.

---

## Fase B · Comprobar lo de ayer con los ojos, no con el suelo

**No es opcional y va antes de escribir nada nuevo.** Ayer se publicaron cinco
simuladores que el suelo dio por buenos y que no se veían; hoy están
arreglados, pero **nadie los ha usado todavía**.

1. Abrir los seis temas con simulador **como llega un desconocido**: URL a
   pelo, sin ancla, sin `localStorage`, y comprobar que el aviso de la cabecera
   se ve y lleva.
2. **Mover los mandos de los cinco** y mirar que los números que salen son los
   del examen. Los botones de preajuste están puestos para eso.
3. Y lo que de verdad falta: **que Ionan los juzgue**. Se le pasaron las URL y
   no ha dado su opinión sobre ninguno.

Si algo hay que cambiar, se cambia aquí y no después de escribir cuarenta
ejercicios encima.

---

## Fase C · Los 138 problemas de la colección que faltan

El grueso del día. Va por capítulos, y cada capítulo se cierra con suelo y
commit propios para que el avance quede aunque el día se corte.

> **El orden cambió el 3 de septiembre, y por un dato medido.** De los cinco
> primeros problemas del capítulo 2 que se abrieron, **tres no se pudieron
> escribir** — no por dificultad, sino porque su figura no se leía con
> suficiente seguridad. Al triarlos todos salió que **97 de los 138 llevan
> figura y 41 no**, y que los que no la llevan están muy concentrados:
>
> > **Corregido el mismo día, más tarde:** los tres —2.10, 2.14 y 2.16— se
> > leen perfectamente **renderizando a 300 ppp en vez de a 125**, y los tres
> > están ya escritos con sus resultados publicados reproducidos exactos. Lo
> > que no se leía era la resolución del render, no la figura. Regla que sale
> > de aquí: **una figura no se declara ilegible sin haberla mirado a 300 ppp
> > y recortada.** Ver la nota de cada uno más abajo.
>
> | cap. | sin figura | de un total de |
> |---|---|---|
> | 5 · Análisis dimensional | **13** | 14 |
> | 7 · Golpe de ariete | 7 | 10 |
> | 8 · Canales | 7 | 15 |
> | 3 · Bernoulli | 5 | 24 |
> | 6 · Conducciones | 4 | 19 |
> | 2 · Estática | 2 | 23 |
>
> Los de análisis dimensional son teorema de $\pi$ puro: **verificables
> exactamente**, sin margen de interpretación, y con el resultado completo
> publicado. Así que el capítulo 5 pasa al principio y el 2 baja: no tiene
> sentido pelearse con figuras ilegibles teniendo trece problemas limpios
> esperando.
>
> El criterio nuevo, y vale para todo lo que queda: **primero lo que se puede
> verificar, después lo que hay que interpretar.**

**El orden es por rendimiento**, medido sobre las 16 convocatorias:

| orden | cap. | tema | faltan | por qué aquí |
|---|---|---|---|---|
| 1.º | 2 · Estática y superficies | t03/t04/t07/t08 | 25 | el hueco más grande del examen, y el más figurado |
| 2.º | 6 · Conducciones | t18/t19 | 19 | el tema de peso alto que más cae dentro de problemas mayores |
| 3.º | 3 · Bernoulli y medidores | t12/t13 | 24 | sostiene los capítulos 6 y 9 |
| 4.º | 9 · Bombeo | t25 | 15 | 11 de 11 convocatorias, pero solo 4 escritos |
| 5.º | 8 · Canales | t21 | 15 | 11 convocatorias |
| 6.º | 4 · Cantidad de movimiento | t14/t15 | 16 | |
| 7.º | 5 · Análisis dimensional | t16 | 14 | |
| 8.º | 7 · Golpe de ariete | t20 | 10 | el que menos falta |

> **Y con el 6.29 se acaba la lista de recomendados que se puede escribir.**
> De los 236 problemas de la colección, los que la página de la asignatura
> marca como recomendados están todos dentro salvo siete, y los siete están
> **declarados** con su motivo: 2.4, 2.34 y 2.42 porque la figura no acota un
> dato que hace falta; 6.20, 6.23 y 6.26 porque sus resultados exigen leer f
> por encima de lo que da la rugosidad; y 6.28 porque está mal planteado. Lo
> que queda del corpus son problemas no recomendados.
>
> **Estado al cerrar el 4 de septiembre: 222 de 236, y los 14 que faltan son
> exactamente los que ya estaban declarados.** Es decir: **no queda ningún
> problema de la colección sin escribir o sin explicar por qué no se escribe.**
> Capítulos 1, 7 y 8 enteros; el 9 en 18 de 19; y los catorce huecos son 2.4,
> 2.21, 2.27, 2.34, 2.42, 3.22, 4.16, 5.12, 6.20, 6.23, 6.24, 6.26, 6.28 y
> 9.16, cada uno con su motivo escrito más abajo.
>
> Los tres últimos en entrar fueron **9.11** (los mil trescientos metros
> equivalentes), **9.13** (el petróleo crudo, el único Darcy del capítulo) y
> **9.15** (el filtrado de la piscina y su by-pass). Los tres estaban
> declarados esa misma tarde y los tres se destrabaron leyendo lo que faltaba
> en vez de suponerlo.
>
> **El anexo se lee, y se comprueba.** Con el 9.6 y el 9.7 quedó montado el
> procedimiento entero, que es el mismo del hidrograma del 8.21: renderizar
> la carta a 400 ppp con `pdftoppm -x -y -W -H`, cargarla en un lienzo con
> playwright, sacar las rachas verticales de píxeles oscuros de cada columna y
> seguir la curva del rodete descartando las rachas que caen en alturas
> enteras —esas son la rejilla— y las demasiado finas —esas son las curvas de
> rendimiento y de potencia—. Calibrar los ejes con la propia rejilla sale
> gratis y con precisión de una décima.
>
> **Y lo importante: la lectura se valida contra el boletín.** En el 9.6, la
> curva del rodete de 320 mm de la INP 80/315 leída así da 32,03 m a 72 m³/h,
> y el apartado e) del boletín exige exactamente 32,04 para que su respuesta
> de 1,3 mcl cuadre. Un centímetro de diferencia sobre treinta y dos metros.
> Los ficheros del barrido están en el scratchpad (`lee2.mjs`, `traza2.mjs`).
>
> El capítulo 9 va por dieciocho de diecinueve. Los cinco primeros no
> necesitaban el anexo
> —**sus cuatro primeros problemas vienen resueltos en la propia colección**,
> con los puntos de la curva de la bomba escritos, y el 9.19 trae la suya como
> fórmula—: 9.1 (el trasvase y el depósito que se presuriza), 9.2 (la fuente de
> chorro regulable), 9.4 (la bomba a dos mil metros de altitud), 9.9 (el
> sobrepresor que reparte a dos servicios) y 9.19 (llenar la piscina con la red
> y una bomba). Los nueve siguientes ya son del anexo: **9.6** (la turbobomba
> elegida y la válvula que cuesta dinero), **9.7** (la fuente del jardín y los
> ocho metros exactos), **9.8** (el chorro de quince metros y lo que cuesta la
> hora), **9.17** (el tramo estrecho y la tubería en paralelo), **9.18** (el
> depósito que ayuda y el chorro que hay que subir), **9.3** (el sobrepresor,
> el riego y el depósito regulador), **9.11** (los mil trescientos metros
> equivalentes), **9.13** (el petróleo crudo y el único Darcy del capítulo) y
> **9.15** (el filtrado de la piscina y su by-pass).
>
> El único que queda del capítulo es el **9.16**, declarado abajo: el boletín
> publica solo el veredicto «No cavita», sin un número contra el que
> contrastar, y el manómetro de mercurio de la entrada admite dos lecturas.
>
> **Y una convención de la escuela que quedó establecida al escribir el
> 9.6: la presión atmosférica se toma a la altitud de la obra, no a nivel
> del mar.** Su curva de la instalación solo cuadra con unos 94 kPa en la
> cota 680; con los 101,3 del nivel del mar salen 24,39 en vez de los 25,01
> publicados. Lo que convierte esa deducción en dato y no en suposición es
> que **el apartado g) del mismo problema la confirma por otro camino**: para
> que el NPSH de seguridad valga los 0,52 publicados hace falta exactamente
> la misma presión. Dos ecuaciones independientes, el mismo número, y encima
> coincide con la atmósfera tipo a esa altitud. El enunciado no la da y no
> hay cuadro de atmósfera tipo en el material, así que **cada ejercicio que
> la use tiene que decirlo**, como hace el 9.6 en su paso de justificación.
> Afecta también al 9.11 y al 9.16.
>
> Dos avisos de esta tanda, por si alguien mira los números al detalle: el
> 9.9 lleva **un apartado declarado dentro del propio ejercicio** —su altura
> manométrica necesita la cota del depósito de aspiración, que el enunciado
> no da— y el 9.19 publica en b4 un coste de 0,832 euros donde el cálculo
> directo da 0,85, un 2 % que sale de con qué caudal se evalúa la altura de
> la bomba. Los dos están dichos en el propio contenido.
>
> **Capítulo 7 cerrado entero, 17 de 17**, con 7.15 (el canal de montaña con su
> media caña y la válvula que el cliente quiere automática), 7.16 (la Pelton del
> Pirineo y su chimenea de equilibrio) y 7.17 (la válvula de retención que
> recibe el golpe). **Capítulo 8 cerrado
> entero, 22 de 22**, y con él los capítulos 1 (27/27) y 5 (19/20). Capítulo 6
> en 24 de 29 —los cinco que faltan, declarados—, con cuatro entradas de esta
> tanda: 6.17 (el llenado del camión de keroseno), 6.21 (los tres depósitos y el
> que no se sabe qué hace), 6.22 (la red abierta que se resuelve desde el final)
> y 6.25 (el riego y el sobrepresor que se reparten el depósito).
> Capítulo 3 en 33 de 34 —solo falta el 3.22, declarado— tras entrar el 3.21,
> el combustible repartido en tres servicios; y **el capítulo 2 abierto
> por fin con figura redibujada**: 2.19 (el sensor que mide el nivel
> comprimiendo aire) y 2.20 (la prensa de tracción y su corona).
>
> Con eso queda demostrado que la parte con figura **sí se puede hacer**: el
> procedimiento es renderizar la página con `pdftoppm -r 150`, mirarla,
> redibujar en SVG **a la escala del resultado ya calculado** (§17) y
> comprobar la captura en claro, oscuro y 360 px. Unos veinte minutos de
> figura por ejercicio, aparte de la verificación de los números.
>
> **Y una lección de procedimiento que costó dos ejercicios escritos para
> nada.** En esa tanda se escribieron además el 8.9 y el 8.13… que **ya
> estaban en el corpus** desde una sesión anterior. El motivo es exacto: se
> eligieron leyendo el listado del PDF en vez de leyendo `faltan.json`. El
> paso 1 del procedimiento de abajo existe precisamente para eso, y saltárselo
> no dio ningún error — los duplicados son YAML válido, pasan el validador y
> habrían pasado el suelo—. Lo cazó una cuenta: el inventario subió 2 donde
> tenía que subir 4.
>
> **Regla: el problema siguiente se elige de `faltan.json`, nunca del PDF.** Y
> al terminar una tanda se vuelve a pasar el inventario y se comprueba que el
> incremento es el esperado; ningún guardián mira esto.
>
> **Los que faltan y no dependen de figura son ya solo seis** —eran quince el
> 3 de septiembre; entraron 2.17, 2.40, 3.6, 3.17, 3.26, 3.34, 6.18, 6.29 y
> 8.11—. Quedan: **5.12, 6.23, 6.25, 7.16, 9.9 y 9.11**. Y de esos, varios
> tampoco se sostienen solos:
>
> - **6.23** queda pendiente, y por un motivo distinto del que se anotó
>   primero. Se dijo que faltaba la rugosidad del fibrocemento; **no falta**:
>   está en el `Cuadro nº 20` de `Cuadros_y_ábacos.pdf`, ε = 0,01 cm = 0,1 mm,
>   leído de la página renderizada porque la OCR descoloca las columnas. Con
>   ese valor Colebrook da f = 0,0167 y el problema sale **104 l/s, 7,7 y
>   4,3 mca**, contra los **100 l/s, 8 y 4** publicados; y el apartado d) da
>   10,66 m de desnivel contra los 11,55 del boletín. Para reproducir el
>   boletín haría falta f ≈ 0,0189, que **no es una lectura posible del ábaco**
>   con esa rugosidad relativa —la asíntota rugosa está en 0,0152—.
>
>   O sea: la discrepancia está en el boletín, no en un dato que nos falte. Se
>   deja sin escribir hasta ver las soluciones desarrolladas del profesor,
>   porque publicarlo obligaría a elegir entre contradecir el resultado
>   oficial o ajustar la rugosidad, y lo segundo es lo que §10 prohíbe. Lo que
>   sí cuadra es la parte de piezas especiales: 250 juntas de K = 0,15 más
>   entrada y salida dan K = 39, y con el caudal publicado 3,98 mca contra 4.
> - **6.20 y 6.26 quedan pendientes por el mismo motivo que el 6.23**, medido
>   la madrugada del 4 de septiembre. En los dos el modelo está entendido y
>   comprobado: en el **6.20** las tuberías 1 y 2 van en paralelo de C al nudo
>   A, la 5 lleva la suma hasta B y allí se reparte entre la 3 y la 4; en el
>   **6.26** el circuito de la piscina es un lazo cerrado —así que las cotas se
>   cancelan y solo cuentan las pérdidas—, con las tuberías 2 y 3 en paralelo
>   entre N y M y el filtro dentro de la 2. Lo que no cuadra son los números:
>   con Colebrook el 6.20 da Q₂ = 91,7 l/s contra los 98,79 publicados (un
>   7 %), y el 6.26 da 2158 W contra los 2265,34 (un 4,7 %). En los dos casos
>   haría falta leer f entre un 5 y un 15 % por encima de lo que da la
>   rugosidad relativa correspondiente.
>
>   La prueba de que el modelo es el bueno la da el propio 6.26: con la
>   potencia **publicada**, el apartado b) sale 7,98 l/s contra los 7,92 del
>   boletín, un 0,7 %. Es decir, la red está bien planteada y lo que discrepa
>   es la lectura del ábaco. Se dejan sin escribir por lo mismo que el 6.23:
>   publicarlos obligaría a contradecir el resultado oficial o a ajustar f, y
>   §10 prohíbe lo segundo.
> - **6.28** se queda por otra razón, y conviene dejarla escrita porque no es
>   una discrepancia numérica sino de planteamiento. Sus apartados a), b) y c)
>   se reproducen bien —14,81 m contra 15,07; 970,8 W contra 978,7; 6,69 l/s
>   contra 6,63; 3,74 contra 3,68; 3,97 mca de válvula contra 4,06 y K = 28,2
>   contra 28,8—, todo dentro del 3 % que cabe en leer el ábaco. Pero el
>   apartado d) publica una altura de chorro de 5,5 m que con esos mismos
>   datos sale 4,79. Y al intentar cuadrarlo aparece algo más de fondo: con
>   las dos boquillas iguales, «alturas iguales» obliga a Q₂ = Q₃, y entonces
>   el sistema —bomba a potencia constante, tubería 1, y las dos ramas— tiene
>   **una ecuación menos que incógnitas**. La válvula queda como grado de
>   libertad, así que hay infinitas soluciones y el boletín elige una sin
>   decir cuál es el criterio. Hasta saberlo, no se puede escribir.
> - **2.40** (presa de gravedad) y **2.17** dan las cotas en el dibujo aunque
>   el texto no diga «figura».
>
> Es decir: **a partir de aquí casi todo lo que queda pasa por leer figuras**,
> que es lo que ya decía la triaje del 3 de septiembre y ahora está medido
> hasta el final.

> **Dos categorías del capítulo 2 que no encajan en el molde de §04**, vistas
> al abrirlo y dichas aquí para que no se redescubran:
>
> - **«Dibujar los prismas de presiones»** — 2.21 (cinco casos planos) y 2.27
>   (cinco casos cilíndricos). No tienen números: la respuesta **es un
>   dibujo**, en función de R y de las densidades. Un `calcular` no los coge y
>   un `justificar` solo cogería la mitad. Es el primer contenido del corpus
>   que pediría de verdad el patrón **figura fija** de §05, que sigue sin
>   construirse. Diez sub-casos son bastante trabajo de SVG: conviene decidir
>   el patrón antes de empezar, no a mitad.
> - **2.42** (compuerta acodada con contrapeso de hormigón sumergido) está
>   leído, resuelto y **no escrito**, y merece la pena dejar el trabajo hecho
>   porque falta un solo dato. La geometría está clara —la compuerta es una
>   ele que gira en A, en el suelo; el brazo vertical sube 2 m hasta la lámina
>   libre y 0,50 m más hasta el brazo horizontal; el tope está a la altura del
>   agua— y las dos respuestas publicadas salen exactas **si el brazo
>   horizontal mide 2,5 m**:
>
>   - $W_{ef}\,L = \gamma b H^{3}/6 = 39\,200$ N·m con $H = 2$ m y $b = 3$ m;
>   - $V = 39\,200/(2{,}5\cdot 13\,800) = 1{,}136$ m³ ✓ publicado;
>   - $R\cdot 2 = 39\,200 - \gamma b\,1{,}5^{3}/6 \Rightarrow R = 11\,331{,}3$ N
>     ✓ publicado.
>
>   El problema es que **la figura no acota ese brazo por ningún sitio**
>   —comprobado ampliando la página a 300 ppp con margen por los cuatro
>   lados—, así que los 2,5 m están **deducidos del resultado**, no leídos. Y
>   a diferencia de la `n` del PVC del 8.8, aquí no hay una segunda ecuación
>   que lo confirme: la reacción del tope solo fija el producto $W_{ef}L$, no
>   $L$ por separado. Dos indicios de que es correcto —sale redondo, y
>   coincide con $0{,}50 + 2$— no son una lectura (§13 caso 2). Se escribe el
>   día que aparezca el dato: la comprobación son dos minutos.
> - **Tres lecturas que costaron y que sirven para más de un problema.** La
>   viscosidad cinemática del **petróleo crudo a 14 ºC** del ábaco nº 5 es
>   $1{,}04\cdot 10^{-5}$ m²/s, y se valida sola: con ella el 9.13 reproduce
>   los 73,4 mcl publicados. El **NPSH requerido de la INP 65/250** a 2900 rpm
>   sale de barrer su carta del anexo III —90 m³/h → 3,90 m; 100 → 4,57;
>   110 → 5,30—. Y la **válvula de pie con filtro tiene K = 2,5** en el cuadro
>   nº 24, que es lo que hace cuadrar el coeficiente cuadrático del 9.7.
> - **La presión atmosférica no tiene una convención única en la colección, y
>   ningún enunciado la escribe.** Medido sobre los tres problemas que la
>   necesitan: el **9.6** solo cuadra con 94 kPa —la atmósfera tipo en su cota
>   680, y ahí lo confirman dos ecuaciones independientes—; el **9.11** con los
>   98 kPa de la conversión de siempre (10 mca); y el **9.13** con 91,45 kPa,
>   la atmósfera tipo en su cota 960. Los tres ejercicios lo dicen en su propio
>   texto, porque es un dato deducido del resultado y callarlo sería
>   publicarlo como si viniera del enunciado.
> - **Y un error del boletín, dicho en el propio ejercicio.** El 9.11 publica
>   31,7 kW de potencia absorbida, que es exactamente lo que sale usando el
>   peso específico del **agua** en vez del del líquido, que tiene s = 1,1. Lo
>   correcto son 34,9 kW. La misma colección lo hace bien en el 9.1, donde
>   escribe el 1,2 dentro de la fórmula. El ejercicio da 34,9 y explica la
>   diferencia en su paso de justificación.
> - **9.11**, además, publica su término estático como **73,925** cuando la
>   diferencia de cotas es $974-900 = 74$ exactos. Esos siete centímetros y
>   medio no salen de ningún dato y no cambian ninguna respuesta —la altura en
>   el punto sale 80,38 con 74 y 80,30 con 73,925, y el catálogo da 80,3—, así
>   que el ejercicio usa el 74 y lo dice.
> - **9.16** (el medidor de codo y el estudio de cavitación) está leído y
>   **no escrito**, y es el único del capítulo 9 que no depende del anexo de
>   bombas. El boletín publica solo el veredicto, «No cavita», sin ningún
>   número, y para escribirlo haría falta cerrar el signo del manómetro de
>   mercurio de la entrada de la bomba: con h1 = 0,14 m de agua y h2 = 0,49 m
>   de mercurio, según cómo se lea el esquema la presión de entrada sale entre
>   −6,5 y −6,8 mca. La otra duda —qué presión atmosférica tomar en la cota
>   900— **está resuelta desde el 9.6**: la escuela la toma a la altitud de la
>   obra, y a 900 m son unos 91 kPa, o sea 9,28 mca. Con eso el NPSH
>   disponible queda entre 2,36 y 2,64 mca contra los 2 requeridos, así que el
>   veredicto «no cavita» aguanta con las dos lecturas; lo que no se puede es
>   publicar un margen concreto sin elegir una (§13 caso 2). Con la lectura del
>   ábaco Q-h en h = 30 cm salen unos 4 l/s, y eso sí está claro.
> - **6.24** (dos depósitos a 20 y 45 °C que se mezclan en un nudo) está leído,
>   modelado y **no escrito**: la temperatura de salida no se puede reproducir.
>   La proporción entre los dos caudales solo depende de las dos ramas, y con
>   ellas —25 m de 50 mm contra 30 m de 70 mm, desde las cotas 15 y 20— el
>   cociente Q2/Q1 no puede bajar de 2,2 **para ninguna cota del nudo**, lo que
>   pone la mezcla en 37,2 °C como mínimo. Con la geometría real sale 39,1 °C,
>   y el boletín publica 36,7. Comprobado con Hazen-Williams (C = 120 por
>   rugosidad) y con Darcy-Colebrook a las viscosidades de cada temperatura:
>   las dos dan 39,1. El apartado b) tampoco cuadra —pide 38 °C y publica una
>   cota de 5,32 m, y en este modelo subir el punto A **sube** la temperatura,
>   no la baja—. Se escribe el día que haya soluciones desarrolladas.
> - **2.4** (compuerta plana a 45° apoyada sobre otra circular, siete
>   apartados) está leído y **no escrito** por un motivo distinto: **no publica
>   ningún resultado**. Todo lo que se escribiera sería derivación propia sin
>   nada contra lo que contrastarla, y el criterio de esta tanda ha sido
>   verificar cada número contra el boletín antes de publicarlo. Se hará el
>   día que haya soluciones desarrolladas, o como ejercicio propio marcado como
>   tal — pero no como transcripción de la colección.
> - **2.34** (compuerta cilíndrica en un rincón a 45°) está leído y **no
>   escrito**: la figura no fija sin ambigüedad dónde apoya el cilindro
>   respecto de la cota de 1,2 m, y ninguna de las lecturas probadas reproduce
>   a la vez los 8.589,8 y los 13.265,6 daN publicados. Elegir la geometría que
>   cuadre sería inventar el enunciado (§13 caso 2). Necesita una lectura de la
>   figura con más resolución, o las soluciones desarrolladas.

> **Una discrepancia con el boletín, declarada y sin resolver.** El apartado c)
> del 8.19 —pendiente de una media caña de 30 cm para 50 l/s— publica **15
> milésimas** y la cuenta directa da **14,2**, un 5 %. No se ha tocado ningún
> dato para cuadrarlo (§10): está dicho en la propia resolución del ejercicio.
> La hipótesis es un redondeo al alza a valor de obra, y como hipótesis queda.
> Se comprueba el día que aparezcan las soluciones desarrolladas del profesor.

> **Una discrepancia sin explicar, y así queda dicho.** El 4.9 —la caja negra
> de cuatro tuberías— reproduce Rx = −37,4 N contra los −37,3 publicados, lo
> que confirma la lectura de los ángulos (los del 2 y el 4 se miden desde los
> bordes VERTICALES de la caja). Pero Ry sale −2.085 frente a −2.048,3: un
> 1,8 % que no se ha sabido reproducir con ninguna variante razonable del
> planteamiento. Se atribuye a un redondeo de las presiones intermedias y está
> declarado en la propia resolución.
>
> El ejercicio obliga además a una hipótesis que el enunciado no da: que la
> carga de Bernoulli se conserva dentro de la caja. Sin ella hay tres
> incógnitas más que ecuaciones. También está dicha.
>
> **Otra discrepancia con el boletín, esta explicada.** El 2.35 —el conducto de
> dos semicilindros con aceite arriba y un manómetro de mercurio en la clave—
> publica 17.514 kg/m, 1.078 kg y 11,7 cm, y los tres salen de tomar en la clave
> 13.600 · 0,25 = 3.400 kg/m². Pero el mercurio del ramal cerrado está 20 cm por
> encima de la clave (leído a 300 ppp, sin duda) y el tubo entre medias va lleno
> del aceite del conducto: 120 kg/m² más, 3.520. Con la física completa salen
> 17.874 kg/m, 1.099,5 kg y 11,83 cm. El ejercicio publica los correctos y lleva
> los tres números del boletín como distractores que dicen de dónde salen, y
> la resolución lo explica con el porcentaje (2 % en la fuerza, 1 % en el
> diámetro). No se ha ajustado nada para cuadrar (§10): se ha dicho.
>
> El 2.40 (presa de gravedad con hielo y subpresión) sale exacto: 22,56 m con
> momentos respecto de O, publicado 22,5.

> **Estado al cerrar la primera tanda del 3 de septiembre: 124 de 236.** Capítulo 5
> cerrado salvo el 5.12 (declarado inescribible: pide una densidad del aire
> que no cuadra con ninguna tabla). Capítulo 7 en 14 de 17 — los tres que
> quedan, 7.15, 7.16 y 7.17, llevan figura. Capítulo 8 abierto y en 11 de 22.
>
> | cap. | hechos | faltan |
> |---|---|---|
> | 1 | 27 | 0 |
> | 2 | 23 | 23 |
> | 3 | 10 | 24 |
> | 4 | 6 | 16 |
> | 5 | 19 | **1** |
> | 6 | 10 | 19 |
> | 7 | 14 | **3** |
> | 8 | 11 | 11 |
> | 9 | 4 | 15 |
>
> **La distribución oficial de ejercicios llegó el 3 de septiembre de 2026** y
> está transcrita en `referencia/fluidos-recomendados.json`. Manda sobre
> cualquier reparto propio, y cambia tres cosas:
>
> 1. **Un problema se archiva en el tema que dice la escuela, no en el que
>    parezca.** Tres estaban mal: el 3.1 en t10-continuidad y el 3.14 y el
>    3.15 en t13-medidores; los tres son del tema 12. Movidos, con sus ids y
>    la ruta que los enlaza. Antes de suponer un tema, se mira el JSON.
>
> 2. **No todos los problemas de la Colección están recomendados.** De los 86
>    que faltan, 51 lo están y 35 no. El capítulo 9 entero —quince problemas
>    de turbomáquinas— y los tres que restan del 7 no aparecen en ninguna
>    lista: son los últimos, no los siguientes.
>
> 3. **El tema 25 no tiene problemas de la Colección**: solo ejercicios de
>    examen. Y hay un dato que la página no da y que no se inventa: en las
>    capturas no salen los temas 20, 22, 23 y 24, y no consta si es que no
>    los lista o que las capturas no llegan (§13 caso 5).
>
> **Capítulo 4 cerrado en recomendados el 3 de septiembre.** Sus seis que
> faltan (4.6, 4.7, 4.16, 4.17, 4.19 y 4.23) no están en la lista de la
> escuela. Quedan 26 recomendados: capítulo 6 (14), capítulo 8 (9) y los tres
> del 2 bloqueados por un dato.
>
> **Capítulo 3 cerrado en recomendados el 3 de septiembre**: los cinco que
> faltan (3.13, 3.21, 3.22, 3.25 y 3.33) no están en la lista de la escuela.
> El orden que queda: **capítulo 4** (11 recomendados), **6** (14), **8** (9) y
> los tres del 2 que siguen bloqueados por un dato. Y lo de antes, ya cumplido:
>
> El orden que sale de aquí para lo que queda: **capítulo 3** (19 recomendados,
> y sus cuatro «resueltos» que faltan traen resolución desarrollada en la
> propia Colección), luego **4** (11), **6** (14), **8** (9) y el resto del 2
> (2.4, 2.34 y 2.42, los tres declarados y bloqueados por un dato).
>
> **Lo que desbloqueó el capítulo 8**, y es reutilizable: quince de sus
> veintidós problemas son sección circular parcialmente llena, que se resuelve
> leyendo los cuadros 27 y 28 de la escuela. Esos cuadros **no hacía falta
> transcribirlos** (§08): las razones $Q/Q_{ll}$ y $V/V_{ll}$ dependen solo de
> $h/D$, así que se calculan, y ahora viven en `src/lib/canales.ts` con nueve
> casos en `tests/fisica/canales.test.ts` contrastados contra los resultados
> publicados de 8.3, 8.4, 8.8 y 8.12. Los que queden del capítulo salen ya sin
> volver a pelearse con esto.
>
> Y dos coeficientes de Manning que el cuadro de materiales de la colección no
> trae —PVC y madera sin cepillar—: se recuperaron invirtiendo el resultado
> publicado, 0,009 y 0,013. **Comprobado después contra el `Cuadro nº 26` de
> `Cuadros_y_ábacos.pdf`: las dos inversiones acertaron**, y ahora el valor
> tiene fuente publicada en vez de deducida.
>
> **Ese fichero de cuadros no se estaba usando y es la mina del capítulo 6.**
> Trae el Cuadro nº 20 (rugosidades por material), el 21 (coeficientes de
> fricción con Colebrook-White y Karman-Prandtl) y el 26 (Manning). El 20 está
> ya en `src/lib/moody.ts` como `RUGOSIDAD`, con sus intervalos y cinco casos
> en `tests/fisica/moody.test.ts`. Aviso para quien lo lea: **la OCR de esas
> tablas descoloca las columnas** —material y valor quedan desparejados— así
> que hay que renderizar la página con `pdftoppm` y mirarla.

**El ritmo real, medido hoy: de 2 a 5 por tanda.** No es lentitud gratuita:
casi todos los enunciados dicen «de la figura» y esa geometría **no está en el
volcado de texto**, así que hay que renderizar la página del PDF y mirarla —del
orden de cien páginas—, y de los problemas propuestos la colección publica
**solo el resultado final**, con lo que el desarrollo entero hay que hacerlo y
verificarlo. Eso es justamente el hueco que da sentido al proyecto (§00) y
también lo que lo hace lento.

**El procedimiento, ya rodado y sin sorpresas:**

1. `node inv.mjs` cruza el PDF contra el corpus y dice qué falta y en qué
   página está;
2. se renderiza la página con `pdftoppm -r 125` y se lee;
3. se escribe el bloque **en el scratchpad**, nunca directo al corpus;
4. `node scripts/revisa-ejercicios.mjs <fichero> --suelto`;
5. se verifica cada número **por separado**, contra el resultado publicado;
6. se pega, se construye, y la figura se mira en claro, oscuro y 360 px.

Los pasos 3 y 4 no son burocracia: el primer bloque de ayer se saltó el 4 y
costó revertir el fichero entero.

### Los que no se pueden escribir todavía, y por qué

Un hueco declarado es información; uno callado es una promesa incumplida
(§15). Estos dos se leyeron, se intentaron y **se dejaron sin escribir a
propósito**, porque la única forma de publicarlos habría sido ajustar un dato
hasta que el número cuadrara — que es exactamente lo que prohíbe §10.

- **2.10 · el manómetro en cadena — RESUELTO.** A 125 ppp no se podía decidir
  qué fluido ocupaba cada tramo ni hasta qué cota llegaba el mercurio, y la
  mejor reconstrucción daba 7,61 contra los 7,797 publicados. **A 300 ppp el
  reparto es inequívoco**: aceite de 6 a 5, s = 4 de 5 a 2,2, mercurio de 2,2
  a 1, s = 3 de 1 a 2, aire de 2 a 2,5, agua de 2,5 a 1,5. Con eso sale
  **7,797 kg/cm² y 7,641 bar, los dos exactos** (con 1 atm = 1,033 kg/cm²).
  No hubo que mover ninguna cota: había que verla.

- **2.14 · el micromanómetro de dos líquidos — RESUELTO, y con una corrección
  a la nota anterior.** El resultado publicado, $3\cdot 10^{-4}$ kg/cm², tiene
  una sola cifra, y eso sigue siendo verdad. Pero la duda entre «con
  corrección de depósitos» y «sin ella» no era una elección del profesor: **es
  física, y tiene una sola respuesta**. Cuando la interfase sube $h$ por el
  tubo, el líquido pesado que entra en el tubo, $a\,h$, sale **entero** del
  depósito A; y el ligero que desaloja, también $a\,h$, entra **entero** en el
  B. Luego $\delta_A = a\,h/A_A$ y $\delta_B = a\,h/A_B$ — no la mitad. El
  $a\,L/2A$ que usaba la nota anterior es lo que valdría si los 5,08 cm fuesen
  la separación total entre dos meniscos de una U simétrica, y no lo son: son
  el desplazamiento de **una** interfase en **un** tubo.

  Con el balance correcto sale $3{,}03\cdot 10^{-4}$, y las correcciones de los
  depósitos son el 16 % del total. La «variante que daba 3,01» no era una
  búsqueda del número: era la deducción bien hecha, y se descartó por
  desconfianza en vez de por física. Queda dicho porque es un error de método
  que conviene reconocer: **desconfiar de un resultado porque cuadra no es
  rigor si no se ha comprobado la deducción.**

- **2.16 · el matraz invertido — RESUELTO.** También se lee a 300 ppp. Con
  $P_A = P_{atm} + \gamma_{Hg}h - \gamma_w a$ y C a $h + l - a = 80$ cm sobre
  la boca salen los cuatro publicados: 578,2 mbar, 1,558 bar, 1,670 kg/cm² y
  198,5 Torr.

Los tres están escritos y en el corpus.

---

## Fase D · Lo que se arrastra y conviene no dejar pudrir

Solo si sobra día, y en este orden:

- **La deuda 34**, que es la más vieja viva: `docs/como-vamos.md` se escribe a
  mano y por eso envejece. La salida buena es generarlo con `mide.mjs`. Hoy
  volvió a hacer falta corregirlo a mano en tres sitios.
- **`npm run peso`**, que no se pasa desde que los cinco simuladores entraron
  en las páginas de teoría. Si A1 se resuelve partiendo las páginas, esto se
  mide **después**, no antes.
- **`HUMO_TODO=1 npm run humo`** sobre las 167 páginas. Se pasa una vez por
  tanda de trabajo, no por commit, y no se ha pasado desde el cierre de
  Fluidos.

---

## Lo que NO se hace mañana, y por qué queda escrito

- **No se abre la cuarta asignatura hasta que A2 esté contestada.** §00: pocas
  excelentes antes que muchas a medias.
- **No se toca `content.config.ts`** salvo que un contenido real lo exija
  (§13.4). Hoy se tocó una vez, con motivo, y con dos frenos puestos.
- **No se escribe ningún enunciado sin haber visto su figura.** Si una página
  no se puede leer, ese problema no existe todavía y se anota — no se deduce
  del resultado.

---

# Mecánica de Fluidos, por fases · abierta el 30 de agosto de 2026

**El criterio del orden no es el número del tema: es el capítulo de la
colección de problemas.** Los nueve capítulos del cuaderno de ejercicios
agrupan los 25 temas de teoría, y cada capítulo trae sus problemas resueltos y
sus propuestos con resultado. Escribir un bloque entero de una vez significa
leer un capítulo una vez, verificar sus cuentas una vez y transcribirlas
seguidas — que es exactamente lo que hizo barato cerrar el boletín de Álgebra.

| fase | temas | capítulo de problemas | estado |
|---|---|---|---|
| **0 · Cimientos** | 1, 2 | 1 · Propiedades | ✅ **hecha** |
| **1 · Estática** | 3, 4, ~~5~~, ~~6~~, 7, 8 | 2 · Estática y fuerzas sobre superficies | ✅ **hecha**; el 5 y el 6 no tienen material y se declaran en el catálogo |
| **2 · Continuidad y Bernoulli** | 9, 10, 11, 12, 13 | 3 · Conservación de masa y energía. Medida | ✅ **hecha** |
| **3 · Cantidad de movimiento** | 14, 15 | 4 · Conservación de la cantidad de movimiento | ✅ **hecha** |
| **4 · Análisis dimensional** | 16 | 5 · Análisis dimensional y semejanza | ✅ **hecha** |
| **5 · Conducciones** | 17, 18, 19 | 6 · Flujo permanente en conductos cerrados | ✅ **hecha**, salvo el 17.4 |
| **6 · Golpe de ariete** | 20 | 7 · Régimen variable en tuberías | ✅ **hecha** |
| **7 · Canales** | 21 | 8 · Flujo en conductos abiertos | ✅ **hecha** |
| **8 · Máquinas hidráulicas** | 22, 23, 24, 25 | 9 · Instalaciones de bombeo | ✅ **hecha** |
| **9 · Las convocatorias** | — | los 11 finales y 5 parciales de 2020-2026 | **16 de 16 · cerrada** |
| **10 · La ruta** | — | una, y la extraordinaria dentro | ✅ **hecha** · 14 bloques, 48 escalones |
| **11 · Auditoría §15 y cierre** | — | — | ✅ **cerrada** el 2 de septiembre de 2026 · la asignatura está en `ok` |
| **12 · Las figuras de ejercicio** | — | los 43 enunciados que nombran una figura | **41 de 43 · cerrada**, las 2 restantes declaradas |
| **13 · Los simuladores** | — | Moody, punto de funcionamiento, prisma, canal, ariete | **5 de 5 · cerrada**, con 86 casos en `tests/fisica/` |

**El temario está cerrado: 23 temas de 25**, y los dos que faltan son los que
no tienen material. Medido con `npm run mide fluidos` el 1 de septiembre de
2026: 23.739 palabras de prosa —más que Cálculo entera—, 23 figuras, 232
ejercicios y 1.050 pasos. Una figura por tema, que cumple el mínimo de §15
pero se queda lejos de las 2,6 por tema de Cálculo: es la deuda visual de la
asignatura y está dicha aquí para que no se olvide.

### La colección, que es donde estaba el hueco de verdad

> Lo abrió una pregunta de Ionan —«¿por qué hay tan pocos ejercicios por
> tema?»— y la respuesta fue incómoda: **la colección tiene 236 problemas y
> solo 18 estaban dentro**, mientras 34 de los 52 ejercicios del corpus eran
> ejemplos escritos por mí. Había tratado la colección como una fuente de
> inspiración en vez de transcribirla, que es justo lo contrario de lo que
> dice el plan de esta página.

Corpus de fluidos el 31 de agosto de 2026, al cerrar la tanda:
**232 ejercicios y 1.050 pasos**, de los cuales **92 son problemas transcritos
de la colección** y 107 son ejercicios de convocatoria. Cobertura de la
colección por capítulo:

| capítulo | dentro | total | qué falta |
|---|---|---|---|
| 1 · Propiedades | 23 | 27 | 1.4, 1.6, 1.7 y 1.8 |
| 2 · Estática | 18 | 46 | compuertas con figura acotada |
| 3 · Bernoulli | 10 | 34 | los que llevan esquema de instalación |
| 4 · Cantidad de movimiento | 6 | 22 | álabes y placas, casi todos con figura |
| 5 · Análisis dimensional | 6 | 20 | los simbólicos de teorema π |
| 6 · Conducciones | 10 | 29 | redes y ramificaciones con figura |
| 7 · Golpe de ariete | 8 | 17 | los que llevan esquema |
| 8 · Canales | 7 | 22 | secciones compuestas con figura |
| 9 · Bombeo | 4 | 19 | los que remiten a los anexos de curvas |
| **total** | **92** | **236** | |

La lista exacta de lo que está dentro se saca del corpus en veinte líneas
—cargar los YAML y extraer el `\d+\.\d+` de cada `fuente`— y **así es como se
comprueba, no de memoria**.

**La regla que sale de todo esto, y que no se vuelve a discutir:** un capítulo
de la colección se transcribe **entero** antes de dar la fase por hecha, y un
problema «que necesita figura» no es un problema excluido — es un problema al
que hay que renderizarle la página del PDF. Las dos veces que dije «esto no se
puede transcribir» estaba equivocado.

### Fase 9 · lo que se ha visto al empezarla

Los PDF originales ya están en `public/examenes/fluidos/`: el cuadernillo del
departamento con las 16 convocatorias de 2020-2025 y la ordinaria de 2026
aparte. Y con eso a la vista, **esta fase no se parece a la de Álgebra**, por
un motivo que conviene dejar escrito antes de seguir:

- **El cuadernillo publica el enunciado y el resultado final, y nada entre
  medias.** No hay resolución oficial que contrastar. Para cada apartado hay
  que **reconstruir la resolución entera y comprobar que aterriza en el número
  publicado**, y cuando no aterriza hay que decidir si el error es nuestro o
  del boletín. Eso ya ha pasado dos veces en la colección —el 6.2 y el 6.3—.
- **Varios enunciados dependen de una figura acotada.** Se leen renderizando
  la página del PDF y ampliándola; probado en el capítulo 2 con seis
  compuertas.

  > **CORREGIDO el 31 de agosto de 2026.** Aquí decía además que las curvas de
  > catálogo de las bombas «no entran en el repositorio (§08)» y que habría que
  > replantear esos apartados. Las dos mitades eran falsas y lo destapó una
  > pregunta de Ionan: «¿las curvas no están en los documentos de esa
  > carpeta?». **Sí están** —en el propio PDF de la colección, anexos, páginas
  > 205 a 216, cuatro bombas INP por página con sus curvas H–Q, sus contornos
  > de rendimiento, su potencia absorbida y su NPSH requerido— y se extraen
  > con `pdfimages` perfectamente legibles. Y §08 no prohíbe **usar** una
  > figura ajena: prohíbe recortarla y manda redibujarla.
  >
  > La lección, que vale para todo el proyecto: **«no tengo el dato» hay que
  > comprobarlo, no suponerlo.** Lo di por hecho porque el enunciado decía
  > «Documentación: Ccb: Anexo I» y no busqué dónde estaba ese anexo.
- **Fluidos no imprime reparto por competencia**, solo el porcentaje del
  ejercicio. El esquema ya admite exámenes sin `puntos` —lo abrió Álgebra— así
  que se transcriben sin inventarlo.

**Un caso concreto encontrado y todavía sin resolver:** el ejercicio 4 de la
ordinaria de 2026 (depósito → boquilla, con la presión de la tubería tomada
en un manómetro sobre un colchón de aire). Reconstruyendo Bernoulli desde la
lámina hasta esa sección salen **5,87 m** y el examen publica **5,67**. Se han
probado tres lecturas del enunciado y ninguna da el número impreso:

| lectura | H |
|---|---|
| `hf tramoD1 = 0,24` como columna de líquido | 5,87 m |
| el mismo dato como columna de agua, convertido a mcl | 5,79 m |
| el tubo del manómetro lleno de aire (sin la columna de 50 cm) | 5,37 m |

Y el apartado b) necesita además una cota del manómetro diferencial que la
figura no acota. **No se publica**: §13 caso 2. Es el único de los nueve que
queda fuera junto con el 9, que es un test de huecos sin cálculo.

### La ordinaria de 2026, transcrita el 31 de agosto de 2026

Siete de los nueve ejercicios, en
`src/content/fluidos/examenes/2025-2026-ord/`. Todos reconstruidos y
comprobados contra el resultado impreso antes de escribirlos:

| ej. | peso | tema | comprobación |
|---|---|---|---|
| 1 | 10 % | t04 | 0,131 kg/cm² · 4,37 bar · 3,44 kg/cm² — exacto |
| 2 | 12,5 % | t25 | bomba 3; hf válvula 7,88 frente a 8,09 publicado (2,6 %, es una resta de dos alturas parecidas) |
| 3 | 10 % | t08 | 70,6 °C frente a 70,56 |
| 5 | 10 % | t21 | R = 1,008 · D = 2,1 · +130,9 % — exacto |
| 6 | 12,5 % | t15 | 13,47 mca · 0,90 N · 15,33 N — exacto |
| 7 | 12,5 % | t16 | 37,04 m/s · 93,4 N · 566,7 m/s — exacto |
| 8 | 15 % | t18 | 22,85 l/s exacto; D = 96,7 frente a 96,4 mm (0,3 %) |

De paso quedó fijado un dato de ábaco que el examen no imprime y que hará
falta otra vez: **ν del alcohol etílico a 0 °C = 2·10⁻⁶ m²/s**, que sale de
exigir que el apartado 8a dé exactamente los 22,85 l/s publicados.

> **Corregido el 31 de agosto de 2026, un rato después de publicarlo.** El
> ejercicio 2 se escribió con `C_HW = 150` para el PVC, y el cuadro n.º 25 no
> dice eso: sus bandas van por **ε/D**, y el PVC de 150 mm tiene
> ε/D = 4,7·10⁻⁵, que cae en `1,5·10⁻⁵ < ε/D ≤ 2·10⁻⁴`, es decir **140**. El
> error venía de asignar el coeficiente por material en vez de por rugosidad
> relativa. Con 140 las pérdidas suben un 12 %, el caudal de la bomba 3 baja
> de 16,68 a 16,55 l/s y la pérdida de la válvula pasa de 7,88 a **8,09 m**,
> que es exactamente lo publicado. Es decir: **la discrepancia del 2,6 % que
> yo había atribuido a «restar dos alturas parecidas» era un fallo mío**, y
> el examen tenía razón.
>
> La regla que sale de ahí: el `C_HW` **no es una propiedad del material**.
> Depende de ε/D, así que el mismo PVC cambia de banda al cambiar de
> diámetro. Las bandas completas del cuadro n.º 25 son:
>
> | C_HW | ε/D |
> |---|---|
> | 150 | ≤ 1,5·10⁻⁵ |
> | 140 | 1,5·10⁻⁵ … 2·10⁻⁴ |
> | 130 | 2·10⁻⁴ … 1·10⁻³ |
> | 120 | 1·10⁻³ … 4·10⁻³ |
> | 110 | 4·10⁻³ … 1,5·10⁻² |
> | 100 | > 1,5·10⁻² |
>
> Revisados los otros tres sitios donde el corpus usa Hazen-Williams —el 9.5
> y el 9.10 de la colección y el ejercicio 2 de la extraordinaria de 2025—:
> los tres estaban bien.

### La extraordinaria de junio de 2025, transcrita el 31 de agosto de 2026

Ocho de los nueve, en `src/content/fluidos/examenes/2024-2025-ext/`:

| ej. | peso | tema | comprobación |
|---|---|---|---|
| 1 | 10 % | t02 | 1,487·10⁶ dyn/cm² · 0,45 UTM/m³ · 4·10⁻⁶ Pa⁻¹ — exacto |
| 2 | 15 % | t25 | cci exacta; k de la válvula 174 frente a 175,79 (1,1 %) |
| 4 | 7,5 % | t16 | π₁ = α, π₂ = Q/(H^{5/2}√g) — exacto |
| 5 | 15 % | t25 | 69,4 l/s y 137,4 kW — exacto |
| 6 | 10 % | t07 | 35,28 kN y 60,47 kN — exacto |
| 7 | 12,5 % | t21 | L = 98,99 cm exacto; Q = 5,07 m³/s |
| 8 | 10 % | t15 | 106,1 / 601,7 / 113,6 / 862,7 N y 18,1 kW — exacto |
| 9 | 10 % | t13 | 11,04 mm y 342 m/s — exacto |

**Falta el 3**, y por lo de siempre: un manómetro relativo dentro de una
cámara con su propio barómetro. Sumando su lectura a los 760 mmHg salen
12,03 mca y el examen publica 10,43; probado también como vacío (8,64) y
suponiendo que el barómetro mide la atmósfera exterior. §13 caso 2.

Este examen fija además dos cosas del cuadro n.º 25 que no estaban dichas:
**C_HW = 130 para ε/D = 2,4·10⁻⁴ y 140 para 2,0·10⁻⁴** —la frontera de banda
cae entre esos dos valores— y confirma **ε = 0,006 cm para el hierro
forjado**.

Y trae el aviso que más veces se va a repetir: **los «mca» de un enunciado
son una presión, no una altura.** En el 5a, dar los 1,46 mca como columna de
petróleo cambia el caudal de 63,9 a 69,4 l/s, y ninguno de los dos números
resulta sospechoso.

### La ordinaria de mayo de 2024, transcrita **entera**

Los ocho ejercicios, en `src/content/fluidos/examenes/2023-2024-ord/`, y los
ocho cuadrando con el resultado impreso. Es la primera convocatoria completa
de Fluidos.

| ej. | peso | tema | comprobación |
|---|---|---|---|
| 1 | 7,5 % | t02 | h = 1,334 mm — exacto |
| 2 | 12,5 % | t15 | 16.780,3 N a 0,654° — exacto |
| 3 | 12,5 % | t04 | miente P₃; p_C = 0,70 bar; s₄ = 4,30 — exacto |
| 4 | 15 % | t07 | 135.975 N · 72.158,46 N · 128.680 N — exacto |
| 5 | 12,5 % | t13 | c_c = 0,695 — exacto |
| 6 | 15 % | t25 | A = 73,41 y B = 2,17·10⁻³ — exacto |
| 7 | 10 % | t16 | λ^{3/2} = 98,9, semejanza imposible — exacto |
| 8 | 15 % | t19 | Q = 1,027 l/s; L_eq = 47,9 frente a 47,95 mm |

Y es el examen que **destapó el error del C_HW**: su ejercicio 6 solo cuadra
si el mismo hierro galvanizado toma 130 en el tubo de 150 mm y 120 en el de
125, lo que es imposible si el coeficiente fuera del material.

### La extraordinaria de junio de 2024, siete de ocho

| ej. | peso | tema | comprobación |
|---|---|---|---|
| 1 | 10 % | t02 | −10,99 bar — exacto |
| 2 | 15 % | t08 | 69.000 kg · 37 personas · h = 0,575 · H = 7,067 m · 676,2 kN — exacto |
| 3 | 10 % | t04 | s₂ = 1,333 · F = 307,88 N · γ = 11.800 N/m³ — exacto |
| 4 | 15 % | t13 | Q = 8,00 l/s · c = 0,975 — exacto |
| 5 | 10 % | t16 | g = 1,383 m/s² — exacto |
| 6 | 15 % | t25 | 60,64 l/s · 58,45 m · 64,69 % · 0,0434 €/m³ — exacto |
| 7 | 12,5 % | t21 | R = 0,238 · D = 50 cm · H = 49,58 cm — exacto |

**Falta el 8.** Pide la máxima diferencia de presiones entre dos tanques para
que el conducto anterior a la bomba siga siendo laminar; con Re = 2000 salen
8,80 kPa y el examen publica 11,75, y con Re = 2300 se dispara a 25,7.
Ninguna de las dos fronteras usuales da el número.

> Y una nota sobre el ejercicio 7, que estuvo a punto de quedarse fuera: mi
> primera reconstrucción daba H = 24,6 cm frente a los 49,58 publicados. El
> fallo era de lectura de la figura, no de física: **H se mide desde el fondo
> de las cunetas**, no desde el firme, y la diferencia es exactamente el radio
> de la cuneta. Antes de declarar que un problema no cuadra conviene volver a
> mirar de dónde a dónde va cada cota.

### La ordinaria de junio de 2023, los nueve

La segunda convocatoria completa, y la primera con los nueve ejercicios.

| ej. | peso | tema | comprobación |
|---|---|---|---|
| 1 | 10 % | t04 | 5 mmca · 0,98 Pa/mm — exacto |
| 2 | 10 % | t15 | Q = 112,37 l/s · F = 8,59 kN — exacto |
| 3 | 15 % | t07 | 13,72 kN · 13,18 kN · 627,2 N · 985,2 N — los cuatro exactos |
| 4 | 10 % | t02 | 0,429 l y 0,452 l — exacto, con la fórmula exponencial |
| 5 | 10 % | t13 | T = 1,28 m · 116,28 l/s — exacto |
| 6 | 10 % | t16 | λ = 1 y λ = ρ_p/ρ_m — deducción |
| 7 | 5 % | t21 | b = 2y, R = y/2 — deducción |
| 8 | 15 % | t19 | 9,98 · 8,30 · 18,28 l/s · 60,42 m · 0,403 bar — exacto |
| 9 | 15 % | t25 | 1,267·10⁻⁴ y 1,059·10⁻⁴ · 242,04 l/s · 9,496 m — exacto |

**Con un apartado declarado dentro del 9.** Su e) pide la cota máxima de la
turbobomba y publica 14,47 m; nuestra reconstrucción da 15,52 y la
diferencia de 1,05 m no se explica con ninguna lectura probada. Se dice en
la propia resolución, que es donde lo va a leer un alumno.

### La ordinaria de junio de 2020, seis de ocho

La convocatoria más antigua del cuadernillo.

| ej. | peso | tema | comprobación |
|---|---|---|---|
| 3 | 14 % | t08 | h = 0,457 m · 5.226 mmHg · diferencia 33,70 kN — exacto |
| 4 | 14 % | t15 | v = 16,63 m/s · α = 9,63° — exacto |
| 5 | 12 % | t16 | 444,4 rpm · 10,5 m³/min · igual rendimiento — exacto |
| 6 | 12 % | t19 | D₁ = 176 mm · P = 7,3 kW — exacto |
| 7 | 15 % | t25 | 45/17,5/24/11 l/s · p_D = 43,82 mca · D₄ = 125 mm — exacto |
| 8 | 8 % | t21 | J = 6,561‰ · v = 2,46 m/s · b = 1,866 m — exacto |

**Faltan dos y medio.** El **1** —embrague hidráulico multidisco— necesita
la tabla de aceites de su figura. El **2** —dos depósitos dentro de un
tercero, con cinco manómetros y dos tubos en U— no acota dónde empieza y
acaba cada columna. Y el apartado c) del **4** da 3,96 m/s frente a los
3,74 publicados, porque el examen arrastra un coeficiente de descarga
efectivo de 0,715 en vez del 0,7 del enunciado.

> **Un dato nuevo para el cuadro n.º 26**: la arena tiene **n = 0,020**.
> Se deduce del apartado a) del ejercicio 8, que publica pendiente y
> velocidad con la geometría dada, y es el único valor que reproduce
> exactamente los dos resultados.

> Y el ejercicio 3 deja una lección de método numérico que vale para todo
> el temario. Las dos fuerzas verticales sobre el cuerpo valen más de dos
> meganewton cada una y su diferencia son 33,7 kN: el 99 % lo pone el gas y
> se cancela. Calcularlas por separado y restarlas es pésimo —dos cifras de
> error en cualquiera se comen el resultado— y por eso el balance se hace
> con el empuje, que ya trae la resta hecha.

### Los dos primeros parciales, enteros

Entraron el 1 de septiembre de 2026, y con ellos **tres filas nuevas en la
tabla `CONVOCATORIAS`**: `primer-parcial`, `segundo-parcial` y
`tercer-parcial`. Era capa compartida (§13 caso 4) y por eso se hizo
aparte, con el build delante; pero era exactamente lo que la tabla existe
para permitir: se añade una fila y la URL, la abreviatura y el nombre largo
se derivan solos. El enum, `SUFIJO_CONV`, `ORDEN_CONV` y las tres páginas
que las consumen no se tocaron.

**Primer parcial de 2020-2021 · 16 de abril de 2021 · los cuatro**

| ej. | peso | tema | comprobación |
|---|---|---|---|
| 1 | 30 % | t02 | las seis afirmaciones, falsas · μ = 2,46·10⁻⁴ · √2 |
| 2 | 20 % | t04 | aceite y agua · R = 0,28 m · 1,002 bar · 1,47 Pa · 10,8° |
| 3 | 30 % | t07 | 58.800 N · 1,67 m · A_y = 19.878 − 1242h² · 4 m · 17.207 N |
| 4 | 20 % | t03 | 723,19 y 11,89 kg/m³ · 354,98 kN |

**Primer parcial de 2019-2020 · 8 de mayo de 2020 · los cinco**

| ej. | peso | tema | comprobación |
|---|---|---|---|
| 1 | 18 % | t02 | 0,499 m³ · 11,22 kg/m³ · 4,279 kg/cm² · 1,38 MPa |
| 2 | 20 % | t04 | 468.972 Pa · 0,297 kg/cm² · 40,7 m · 1.059,75 kg/m³ |
| 3 | 20 % | t25 | 33,03 m · 1.861 W · 394,4 W · 3,37 l/s · 2,32 kg/cm² |
| 4 | 25 % | t08 | 121,41 y 294,65 kN · 587,58 kN · 10.819 kN |
| 5 | 17 % | t13 | 110,5 cm · 9,82 cm |

Todos exactos.

> **Dos trampas de temperatura y presión que conviene tener juntas.** En el
> ejercicio 1 de mayo de 2020, «$T_1 = 2T_0$» con $T_0 = 25$ ºC significa
> **50 ºC**, no 596 K; y quien duplique los kelvin obtiene un resultado
> engañosamente redondo —la presión final coincide con la inicial— que
> invita a creérselo. En el ejercicio 4 de abril de 2021, la fórmula de
> dilatación del depósito pide presión **manométrica** y la ley de los
> gases, **absoluta**, y el enunciado da una de cada clase a propósito.

> Y el ejercicio 1 de abril de 2021 cierra un círculo: la construcción
> adhesión-cohesión aparece por tercera vez en el cuadernillo, y aquí sirve
> para **refutar** —con 90º de ángulo de contacto sale $\sqrt{2}$ y no
> $\sqrt{2}/2$—. La misma herramienta que en junio de 2023 desbloqueó la
> ordinaria de mayo de 2025.

### El segundo parcial de junio de 2020, tres de cinco

| ej. | peso | tema | comprobación |
|---|---|---|---|
| 1 | 13 % | t15 | 42,47 kN · u' = 60 m/s · 169,9 kN — exacto |
| 2 | 15 % | t16 | los seis Π con variables repetidas raras — deducción |
| 3 | 25 % | t20 | D = 1,1 m · h = 46,3 cm · e = 14 mm · el cambio es aceptable |

**Faltan dos, los dos por una tabla que está en la figura**: el 4 necesita
los factores de paso del cuadro de pérdidas menores del departamento —codo
comercial, compuerta al 62,5 %, esférica girada 30º— y el 5, la tabla de
longitudes y diámetros de sus cinco tuberías.

> **El apartado c) del ejercicio 3 es el mejor del examen.** Pregunta si
> cerrar la válvula en 10 s en vez de en 25 es buena idea, y la respuesta
> no es «sí» a secas. Con 10 s se cruza el tiempo crítico —11,2 s— y el
> cierre pasa de lento a rápido: la sobrepresión salta de 158 a 354 m, un
> 27 % de la estática. Y sin embargo el espesor necesario solo sube de
> 12,07 a 13,52 mm, así que el comercial sigue siendo el mismo. **El cambio
> es aceptable porque entre esos dos valores no hay ningún múltiplo de 2**,
> no porque la sobrepresión sea pequeña. Un margen que depende del catálogo
> del proveedor no es un margen de diseño, y eso hay que decírselo al
> cliente junto con el sí.

### El tercer parcial de junio de 2021, cinco de seis

| ej. | peso | tema | comprobación |
|---|---|---|---|
| 1 | 15 % | t22 | la tabla de máquinas hidráulicas |
| 2 | 15 % | t19 | h_f = 0,056 m · k = 5 — exacto |
| 3 | 15 % | t20 | a = 951 m/s · ΔH = 355,12 mca · σ = 2.131 kg/cm² |
| 4 | 20 % | t18 | ε = 0,3316 cm · 176,46 l/s · k = 7 · 1.440-2.880 l/h |
| 5 | 15 % | t21 | L = 95,34 cm · H = 1,365 m · z = 629,23 m · D = 2 m |

**Falta el 6**, que exige elegir la bomba en la familia de curvas del anexo
y leer de ella el punto de funcionamiento, el rendimiento y el NPSH
requerido.

> **El ejercicio 4 es el mejor del cuadernillo para entender el ábaco de
> Moody**, porque recorre sus tres zonas en tres apartados con la misma
> tubería. En a) el tubo corroído está en **turbulencia completa** y la
> rugosidad se despeja sin iterar; en b), con tubo nuevo, cae en la
> **transición** y hay que iterar Colebrook; en c), con polietileno, es
> hidráulicamente **liso**. Identificar el régimen no es un adorno del
> enunciado: decide cuánto trabajo cuesta el problema.

> Y el 5 deja un número que merece recordarse. El ramal R2 lleva **la
> mitad** de caudal que R1 y aun así tiene que arrancar **setenta metros
> más alto**, porque su enunciado le prohíbe que el agua rebase la parte
> triangular. Una limitación de calado se paga en cota, y aquí sale
> carísima.

### El segundo parcial de mayo de 2021, los cuatro — y con él, fase 9 cerrada

| ej. | peso | tema | comprobación |
|---|---|---|---|
| 1 | 25 % | t19 | 169,4 kJ/m³ · 25,25 · 9,11 l/s · 57,44 % · 128 kPa |
| 2 | 25 % | t13 | 102 l/s · R = 0,504 m · 0,81 m/s · s₀ = 0,726 |
| 3 | 25 % | t15 | T₁ = γπd²C_c C_v²H/2 · T₃ = ρQv√(2(1−cos θ)) · T = 0 |
| 4 | 25 % | t16 | los cinco Π · 8,56 l/s |

> **El apartado c) del ejercicio 3 se responde sin una sola cuenta**, y es de
> los mejores del corpus por eso. Si se unen el depósito y el carro con una
> barra y se toma un volumen de control que encierre todo el fluido, no hay
> flujo de cantidad de movimiento ni a la entrada ni a la salida: la
> resultante es nula y la barra no trabaja. El chorro empuja el depósito
> hacia la izquierda exactamente con la fuerza con que empuja el carro hacia
> la derecha. Es la razón por la que un cohete con una pantalla delante que
> recogiera su propio chorro no avanzaría.

### Fase 9, cerrada

**Las dieciséis convocatorias**, con 107 ejercicios.

> **Y una cifra corregida al cerrarla.** Este fichero decía «17
> convocatorias · 11 finales y 6 parciales» y estaba mal: el cuadernillo de
> 2020-2025 trae **quince** exámenes —diez finales y **cinco** parciales—,
> no dieciséis, así que con la ordinaria de 2026 son **16**. El error salió
> al contar las carpetas para dar la fase por terminada, no antes. Un
> recuento publicado que nadie vuelve a contar es la forma más silenciosa de
> incumplir §10.

**Lo que queda fuera, y por qué**, en un solo sitio:

| convocatoria | fuera | motivo |
|---|---|---|
| 2026 ord. | ej. 4 y 9 | tres lecturas dan 5,87 / 5,79 / 5,37 frente a 5,67; el 9 es un test de huecos sin cálculo |
| 2025 ord. | ej. 1 y 9 | figura sin acotar el apoyo B; anexo de curvas |
| 2025 ext. | ej. 3 | 12,03 mca frente a 10,43 publicados |
| 2024 ext. | ej. 8 | 8,80 kPa con Re = 2000 y 25,7 con 2300, frente a 11,75 |
| 2023 ord. | ej. 9e | 15,52 m frente a 14,47 |
| 2023 ext. | ej. 3b | 0,712 frente a 0,752 |
| 2022 ext. | ej. 9 | se resuelve sobre la gráfica |
| 2021 ord. | ej. 5, 7 y 4c | figura sin acotar; teoría y dibujo; ejes intercambiados |
| 2020 ord. | ej. 1, 2 y 4c | tabla de aceites y cotas en la figura; C_d efectivo 0,715 |
| 2020 2.º parc. | ej. 4 y 5 | cuadro de pérdidas menores y tabla de tuberías |
| 2021 3.º parc. | ej. 6 | familia de curvas del anexo |

**Catorce ejercicios enteros de ciento veintiuno**, más cuatro apartados
sueltos —el 9e de 2023 ord., el 3b de 2023 ext. y los 4c de 2021 y 2020 ord.—,
**todos declarados con su número**. Nueve se caen porque falta una figura, una
tabla o un anexo de curvas; cinco porque el resultado no reconstruye, y eso se
dice en voz alta en la propia resolución en vez de maquillarlo.

**Cinco ejercicios grandes que se han quedado fuera por figura**: el
elevador de taller de junio de 2021, el embrague multidisco y los depósitos
anidados de junio de 2020, el apartado b) del bloque de anclaje de junio de
2023 y el codo convergente de junio de 2021. Podrían recuperarse
renderizando sus páginas a más resolución y midiendo las cotas sobre el
dibujo. No es imposible; es que cuesta más que un ejercicio nuevo.

### La ordinaria de junio de 2021, seis de ocho

| ej. | peso | tema | comprobación |
|---|---|---|---|
| 1 | 15 % | t07 | α = 35,21° · 21,0 MN · β = 24,78° · subpresión 33,41 MN — exacto |
| 2 | 10 % | t13 | C_v = 0,906 — exacto |
| 3 | 10 % | t21 | D = 2 m · J₂ = 0,816‰ · v = 1,5 y 1,617 m/s — exacto |
| 4 | 15 % | t20 | Q = 139,0 l/s · c = 684 m/s · L_BC = 790,15 m — exacto |
| 6 | 12,5 % | t16 | 10 bar imposible · 5 bar · 104 m/s · 0,2 — exacto |
| 8 | 15 % | t25 | 22,77 · 16,75 · 27,81 · 24,99 · 5,63 m — exacto |

**Faltan dos y medio.** El **5** es un elevador de taller con ocho
apartados encadenados cuya figura no acota B, C, D ni E. El **7** es
teoría y dibujo cualitativo. Y el apartado c) del **4** —la fuerza sobre
un codo convergente— da 2.488 y 4.239 N frente a los 4.274 y 2.426
publicados: los mismos órdenes con los ejes intercambiados, y el «detalle
B» de la figura no permite fijar qué ángulo va a la entrada.

> **La subpresión del ejercicio 1 es la fuerza mayor de las tres**: 33,4 MN
> hacia arriba frente a los 21,0 del embalse. Le quita a la presa 3.400
> toneladas de peso efectivo justo cuando más lo necesita, y es la razón de
> que una presa de gravedad lleve siempre pantalla y drenes bajo el
> cimiento. Merece la pena tenerlo escrito porque el instinto dice lo
> contrario: uno mira una presa y piensa en el empuje del agua de delante.

> Y el ejercicio 4 usa el golpe de ariete **al revés**: en vez de calcular
> la sobrepresión de una tubería conocida, mide la sobrepresión para saber
> dónde está la válvula. Es el principio de la detección de fugas por
> transitorios.

### La extraordinaria de junio de 2022, ocho de nueve

| ej. | peso | tema | comprobación |
|---|---|---|---|
| 1 | 5 % | t02 | D = 10⁻³ mm — exacto |
| 2 | 10 % | t03 | 10,79 · 20,84 · 34,37 bar, y el orden 3-1-2 — exacto |
| 3 | 15 % | t08 | x/m = 1,25 · 17,82 y 14,34 kN — exacto |
| 4 | 15 % | t15 | 1.550 m³/h · 4,83 y 4,67 bar · 18,37 y 67,52 kN — exacto |
| 5 | 10 % | t16 | ν_m/ν_p = λ^{3/2} — deducción |
| 6 | 12,5 % | t21 | y = 0,467 m · h = 0,683 m — exacto |
| 7 | 15 % | t19 | D = 406,45 → 425 mm — exacto |
| 8 | 10 % | t25 | z < 5,93 m — exacto |

**Falta el 9**, que se resuelve **sobre la gráfica**: curvas de instalación
y bomba superpuestas, de las que hay que leer caudal, pérdidas, presión
del depósito superior y la pérdida adicional de una válvula. Sin publicar
el gráfico no hay ejercicio que transcribir.

> El ejercicio 1 es el más bonito del examen y lo es por salir «mal». Da
> una micra de diámetro para que la savia suba 30 metros, y los vasos
> reales del xilema miden entre veinte y quinientas. Es decir: **la
> capilaridad sola no explica el árbol**. Un cálculo que contradice la
> realidad no es un cálculo inútil; es la forma de descubrir que falta
> física —aquí, la tensión-cohesión y el agua a presión negativa—.

### La ordinaria de junio de 2022, los once

La convocatoria más larga del cuadernillo —once enunciados— y la primera
que entra entera con los once, incluidos los tres que no dan número.

| ej. | peso | tema | comprobación |
|---|---|---|---|
| 1 | 5 % | t17 | v = 0,12[1−(y/R)²] · τ = −24(y/R) mPa — exacto |
| 2 | 7,5 % | t02 | 15,07 · 15,12 MPa · 1.032,56 kg/m³ — exacto |
| 3 | 7,5 % | t21 | Q = 10 m³/s · berma 0,1 m · n = 0,0117 — exacto |
| 4 | 7,5 % | t04 | 5,52 kg/cm² absolutos — exacto |
| 5 | 15 % | t07 | H = 6,29 m · A_x = 406,85 · B_y = 193,56 · A_y = 0 — exacto |
| 6 | 10 % | t13 | R₁/R₂ = (γ₂−γ₀)/(γ₀−γ₁) — deducción |
| 7 | 5 % | t15 | 20,87 kg — exacto |
| 8 | 5 % | t16 | los tres Π y la tabla de potencias — deducción |
| 9 | 15 % | t19 | 4,85 y 5,31 l/s — exacto |
| 10 | 7,5 % | t23 | las cinco respuestas |
| 11 | 15 % | t25 | 8,27·10⁻⁴ · 5,576·10⁻⁴ · 109,98 l/s · 4,58 m · 3,34 m — exacto |

> **Dos trampas de lectura que este examen enseña juntas.** En el 7, el
> enunciado dice «diámetro **del chorro**», así que el coeficiente de
> contracción que también da es un dato de sobra: usarlo otra vez rebaja
> el resultado de 20,87 a 18,8 kg. Y los 70º son del **vértice** del cono,
> de modo que cada pared desvía 35º; con 70º saldrían 75,9 kg. Un mismo
> ejercicio de cinco por ciento con dos formas distintas de perderlo.

> Y una de signo, en el 9. La bomba está en uno de los dos ramales y entre
> A y B ya hay 15 metros de energía a favor, así que la pérdida del ramal
> con bomba es **15 + H_m**, no H_m − 15. Con el signo cambiado salen 2,03
> l/s en vez de 4,85, y el número sigue pareciendo razonable.

### La ordinaria de mayo de 2025, siete de nueve — reabierta

Esta convocatoria estuvo **cerrada semanas** con el criterio de que «media
convocatoria es peor que ninguna». Se reabre porque el ejercicio 1 de la
extraordinaria de junio de 2023 destapó la construcción adhesión-cohesión
que la bloqueaba.

| ej. | peso | tema | comprobación |
|---|---|---|---|
| 2 | 10 % | t02 | cos θ = 0,663 · h_cap = 24,6 mm · 14,74 mbar — exacto |
| 3 | 10 % | t04 | s₂ entre 0,93 y 1,07 · α = 5,739° — exacto |
| 4 | 7,5 % | t21 | A = 6,785 m² · Q = 17,313 m³/s · R = 1,786 m — exacto |
| 5 | 10 % | t16 | los cinco π · 0,025 bar · 1.152 s · 0,0833 — exacto |
| 6 | 15 % | t22 | 19,836 MW — exacto |
| 7 | 10 % | t15 | 82,56 kg — exacto, con los 10° partidos por la mitad |
| 8 | 10 % | t13 | el factor 0,206, y el empate agua-tetracloruro — exacto |

**Faltan dos, y por motivos distintos.** El **1** reproduce F_H, F_V y R_A
pero su α = 36,4° exige el equilibrio de la compuerta triangular, y la
figura no fija sin ambigüedad el apoyo B. El **9** se resuelve **sobre el
anexo de curvas** de la bomba; su apartado a) sí sale
—h_mi = 32 + 6,64·10⁻³·Q^1,852— pero el resto no es transcribible sin
publicar el anexo.

> **La lección de método.** El ejercicio 2 llevaba semanas declarado como
> «construcción no publicada en los apuntes», y no lo estaba: estaba en
> otro examen. Cuando un ejercicio no cuadra por una herramienta que falta,
> conviene mirar si otra convocatoria la usa con los datos suficientes para
> deducirla. **Un hueco declarado no es un hueco cerrado.**

### La extraordinaria de junio de 2023, los nueve

Y la segunda seguida que entra entera.

| ej. | peso | tema | comprobación |
|---|---|---|---|
| 1 | 7,5 % | t02 | h = 3σcosθ/(γb) · cosθ = 0,917 · 9,99 mm — exacto |
| 2 | 10 % | t04 | 2.613,3 N/m³ · 872,75 torr · 107.347 Pa — exacto |
| 3 | 10 % | t08 | H = 67,74 mm — exacto |
| 4 | 10 % | t15 | 22,19 kN · máximo en 90° con 25,13 kN — exacto |
| 5 | 12,5 % | t16 | los tres π · 859,6 km/h · 8,19 kPa — exacto |
| 6 | 15 % | t19 | f₄ = 0,02171 · 48,32 l/s · 64,24 m · 35,49 m — al 0,6 % |
| 7 | 15 % | t21 | 41,5 cm · 50,7 cm · 111,33 m · D = 1,2 m — exacto |
| 8 | 15 % | t25 | 4,5·10⁻⁴ · M2 a 163,45 l/s · k = 1,546 · 276,18 l/s — exacto |
| 9 | 5 % | t23 | la tabla — la anticipaba el propio tema |

**Con el apartado b) del 3 declarado**: publica s₁ = 0,752 y la misma
ecuación que da el a) exacto devuelve 0,712.

> **Lo que este examen desbloquea.** Su ejercicio 1 usa la construcción
> adhesión-cohesión que faltaba: con F_adh/F_coh = 7/3, componiendo la
> adhesión perpendicular a la pared con la cohesión a 45°, sale
> cos θ = 0,917 y el ascenso de 9,99 mm es exacto. **Esa era justamente la
> construcción que dejaba fuera el ejercicio 2 de la ordinaria de mayo de
> 2025**, y que se declaró como «no publicada en los apuntes». Ya está
> reconstruida: hay que volver a aquella convocatoria.

> Y una advertencia sobre el ejercicio 6. La determinación del caudal es
> **hipersensible**: sale de igualar las pérdidas de dos ramales en
> paralelo que además llevan el mismo caudal, y el factor de fricción del
> PVC depende del Reynolds tan débilmente que un 0,1 % en f mueve el
> caudal un 0,5 %. Nuestra reconstrucción da 48,58 l/s frente a 48,32, y
> 35,69 m frente a 35,49. No es desacuerdo de física; es aritmética mal
> condicionada, y está dicho en la propia resolución.

> El ejercicio 3 de la ordinaria es el que más enseña de los nueve, y no por la cuenta. Un
> tramo curvo con un fluido a cada lado invita a pensar que se
> contrarrestan. Aquí no: el manómetro abierto de la derecha sitúa el plano
> de cargas del fluido 2 **por debajo** del tramo, así que su presión es
> negativa y **tira** de la pared en el mismo sentido en que el otro fluido
> empuja. Es el primer ejercicio del corpus donde una fuerza hidrostática
> cambia de signo, y los dos resultados publicados salen exactos solo con
> esa lectura.

Aporta además tres cosas que no había en el corpus: **capilaridad en una
sección que no es un tubo** (el hueco entre un cuadrado y un círculo, donde
$h = \frac{\sigma\cos\theta}{\gamma}\frac{P}{A}$ hay que deducirlo), **un
manómetro que miente** y hay que descubrir cuál con un tercer camino, y
**una compuerta con aire encima del líquido**, donde el prisma de presiones
no es un triángulo sino un rectángulo negativo más dos triángulos.

### El orden que se siguió, y lo que enseñó

De la ordinaria de 2026 hacia atrás por años, y los cinco parciales al
final. El orden era el bueno: los finales recientes fijan las convenciones
de la asignatura —los cuadros, el `g = 9,8`, la asíntota de von Kármán— y
los parciales viejos ya no obligan a decidir nada dos veces.

Pero el orden no fue lo que más rindió. Lo que más rindió fue **volver**.
La ordinaria de mayo de 2025 estuvo semanas cerrada porque su ejercicio 2
pedía pasar de F_adh/F_coh al ángulo de contacto, y aquí quedó escrito que
esa construcción «no está publicada en los apuntes». Sí lo estaba: en el
ejercicio 1 de la extraordinaria de junio de 2023, transcrito diez días
después. Con ella los 14,74 mbar salen exactos.

> **La regla, y es de método, no de fluidos: un hueco declarado no es un
> hueco cerrado.** Cuando algo se declara por falta de material se anota
> **qué** material falta —nunca «no se puede»— y se vuelve a mirar al
> terminar la tanda, cuando el corpus ya sabe cosas que no sabía. De las
> once convocatorias con huecos esa fue la única que se reabrió, pero se
> reabrió entera.

**Qué incluye cada fase de contenido**, sin excepción (§04): prosa con al
menos una figura que responda a una pregunta, un ejemplo de entrada **nuestro**
por tema, los ejercicios del capítulo con su enunciado verbatim, y el suelo en
verde antes del commit. Las cuentas se verifican con un guion **antes** de
escribir el diagnóstico, nunca después.

**Dos cosas que esta asignatura hace distinto de Álgebra:**

1. **Las unidades son contenido, no formato.** Media docena de errores típicos
   del examen son de conversión, así que cada respuesta va con su unidad y el
   tipo `magnitud` los diagnostica aparte (ver §04 de CLAUDE.md). Cuando un
   enunciado traiga una unidad que la tabla no conozca, se añade **con su test**.
2. **Los exámenes imprimen el porcentaje de cada ejercicio, pero no el
   reparto por competencia.** Así que el corpus los transcribe sin `puntos`
   —el esquema lo admite, lo abrió Álgebra— y la ruta de la fase 10 se mide
   contando convocatorias, como la de Álgebra, no ponderando puntos.

   > Aquí ponía lo contrario: que el peso impreso permitiría medir «no
   > cuántas veces cae, sino cuánto vale». No se hizo, y no por olvido: el
   > porcentaje impreso es del ejercicio entero, y un ejercicio de Fluidos
   > mezcla dos y tres temas, así que ese número no se puede repartir sin
   > inventarse el reparto. Corregido el 1 de septiembre de 2026, al escribir
   > la ruta.

**Lo que dice el examen**, contado sobre los 121 ejercicios de las 16
convocatorias, agrupando los temas como los agrupa el examen:

| hueco | finales | parciales | ejercicios |
|---|---|---|---|
| máquinas e instalaciones de bombeo (22-25) | **11 de 11** | 2 de 5 | 16 |
| análisis dimensional (16) | **11 de 11** | 2 de 5 | 13 |
| canales (21) | 10 de 11 | 1 de 5 | 11 |
| fuerzas sobre superficies y cuerpos (7-8) | 10 de 11 | 2 de 5 | 12 |
| cantidad de movimiento (14-15) | 9 de 11 | 2 de 5 | 11 |
| estática e hidrostática (3-4) | 8 de 11 | 2 de 5 | 11 |
| propiedades del fluido (2) | 8 de 11 | 2 de 5 | 10 |
| conducciones y pérdidas (17-19) | 7 de 11 | 2 de 5 | 11 |
| Bernoulli y medidores (12-13) | 7 de 11 | 2 de 5 | 9 |
| golpe de ariete (20) | **1 de 11** | 2 de 5 | 3 |

Y los transversales, que no ocupan hueco propio ni una sola vez en once años
pero están dentro de casi todos: **1** (unidades y el kilopondio), **9**,
**10** y **11** (clasificación del flujo, continuidad, Navier-Stokes).

> **El golpe de ariete es el único donde los dos recuentos discrepan**, y
> mucho: una vez de once en los finales, dos de cinco en los parciales. Por
> eso la ruta lo pone el penúltimo y dice el número, en vez de esconderlo
> entre los demás.

### Fase 10 · la ruta, y por qué es una y no dos

`src/content/preparar/fluidos-ord.yaml`. **Catorce bloques, cuarenta y ocho
escalones, y los 232 ejercicios del corpus referenciados** — ninguno queda
suelto.

El orden: el suelo, los once huecos por rendimiento medido, el simulacro y el
formulario. El suelo son las unidades y el kilopondio, las seis formas de
escribir una presión, Darcy y los cuadros, y la clasificación del flujo:
cuatro escalones que entre los cuatro han ocupado hueco propio **una sola vez
en once años** y sin los cuales no se termina ninguno de los demás.

**Y una ruta, no dos.** La fase se abrió diciendo «las dos rutas», y al
medirlas resultó que no hay dos. La extraordinaria de Fluidos tiene los mismos
bloques que la ordinaria y con la misma frecuencia: análisis dimensional en
las 7 ordinarias y en las 4 extraordinarias, bombeo en 6 y 4, canales en 6 y
4, propiedades en 4 y 4. Lo que queda —hidrostática 5/7 frente a 2/4, cuerpos
sumergidos 2/7 frente a 3/4— cabe dentro del ruido de cuatro exámenes, y
escribir una segunda ruta apoyándose en eso sería publicar una diferencia
inventada.

> Álgebra sí tiene dos, y el contraste explica la decisión. Allí la
> extraordinaria **cambia un hueco entero** —determinantes donde la ordinaria
> pone euclídeos— en las cuatro convocatorias leídas. Aquí no cambia ninguno,
> así que la extraordinaria se declara en `tambienPrepara`, que es el campo
> que existe justo para esto, y la página del examen extraordinario enlaza a
> la misma ruta.

**Lo que la ruta destapó, y es lo que de verdad valía la pena.** §14 pide que
toda herramienta que el examen usa esté presentada en la prosa del tema, no
solo dentro de la resolución de un ejercicio, y que se compruebe **contando**.
Contado, faltaban seis:

| herramienta | la usa | estaba |
|---|---|---|
| la forma **integrada** de la compresibilidad | 5 convocatorias | solo la diferencial |
| la construcción **adhesión-cohesión** del ángulo de contacto | 2 convocatorias | no |
| la **berma** y el resguardo de un canal | 7 finales y 1 parcial | no |
| el manómetro **Bourdon** y contra qué mide | 6 enunciados, 5 convocatorias | no |
| el **rotámetro** como aparato de contraste | 3 enunciados | no |
| la forma de la escuela de la fórmula de rugoso | los que piden rugosidad | equivalente, otra notación |

Las seis están escritas ya, en los temas 2, 4, 13, 18 y 21. La de la
compresibilidad era además una mentira en marcha: la ruta llegó a decir que el
apartado «insiste en la forma exponencial» cuando el apartado no la traía.

> **La regla que sale de aquí, y sirve para las nueve asignaturas: la ruta es
> el mejor auditor de la prosa que tiene el proyecto.** Escribir «¿dónde se
> explica esto?» cuarenta y ocho veces seguidas obliga a mirar apartado por
> apartado, y lo que no está aparece solo. Ninguno de los dos guardianes
> podía cazar esto —los seis huecos daban build verde— y leer la prosa por
> encima tampoco: los apartados existían, y parecían completos.

Y una trampa nueva para §17, cara y silenciosa: **un encabezado con LaTeX
dentro genera un ancla que ninguna ruta puede enlazar**. `## El teorema $\pi$
de Vaschy-Buckingham` producía el id `el-teorema-πpiπ-de-vaschy-buckingham`,
porque la salida `htmlAndMathml` mete el símbolo, el texto y el MathML los
tres en el slug. La página se dibujaba perfecta. Renombrado el encabezado y
anotado en CLAUDE.md.

**Un comprobador de vuelo previo, y por qué NO entra en el repositorio.** La
ruta se escribió con un guion de scratchpad que lee el YAML y comprueba, sin
construir nada: que los 232 ids existan, que cada ancla de teoría esté de
verdad en el HTML publicado del tema, los mínimos de longitud del esquema y
que ningún ejercicio se incruste dos veces. Ahorró **cuatro sueltos enteros**
—cada uno son veinte minutos— porque cazó los fallos antes del build.

No entra, y es §11 aplicado en frío: **lo que comprueba ya lo comprueban el
esquema y `verify.mjs`**, solo que veinte minutos más tarde. Un guardián
duplicado no añade seguridad, añade un sitio más donde la regla puede
divergir. Se queda como herramienta de sesión, junto a los otros dos —el de
forma de ejercicio y el de distractores— y su sitio es el scratchpad.

**Lo que la ruta declara en `falta[]`**, que es información y no una promesa
incumplida: los cuadros de la escuela no están reunidos en una página propia;
tres ejercicios de bombeo del cuadernillo se resuelven sobre un anexo de
curvas que no tenemos; cinco ejercicios grandes se caen por figura sin acotar;
los
temas 22, 23 y 24 no tienen ni un ejercicio de nivel `practica`; y no hay
cronómetro para el simulacro.

### Fase 12 · las figuras de ejercicio

Abierta el 1 de septiembre de 2026 a petición de Ionan: «me gustaría que los
ejercicios tuviesen figuras dibujadas en las que lo piden».

**Medido primero, que es lo que cambió el plan.** De los 232 ejercicios de
Fluidos, **43 nombran una figura o un esquema en su enunciado** y ninguno la
tenía. Se concentran así:

| | figuras que faltan |
|---|---|
| t07 fuerzas sobre superficies | 6 de 9 |
| ordinaria 2022 | 5 de 11 |
| 1.er parcial 2020 | 4 de 5 |
| ordinaria 2023 | 4 de 9 |
| t02, t04 y otras once convocatorias | 1 a 3 cada una |

**Y no hacía falta tocar el esquema, al revés de lo que anuncié.** La
capacidad ya existía: **176 de los 616 ejercicios de Cálculo llevan su figura
SVG dentro del campo `enunciado`**, y `mate()` ya les prefija los ids, los
`aria-labelledby` y los `url(#…)`. Fluidos simplemente nunca la usó. Así que
esto no es construir el «patrón 2 · Figura fija» de §05: es rellenar con un
molde probado 176 veces. Conviene decirlo porque anuncié lo contrario antes de
mirar, que es exactamente lo que §16 punto 1 manda no hacer.

**El convenio de color**, para que las 43 se parezcan entre sí:

| | token |
|---|---|
| agua y su lámina libre | `--live`, relleno al 12 % |
| otros líquidos (aceite, líquido manométrico) | `--alt`, relleno al 14 % |
| sólidos, paredes, compuertas | `--ink`, y el cuerpo de una compuerta **opaco** con `--panel` para que el agua no se transparente |
| cotas, ángulos y rayado del terreno | `--faint` |
| fuerzas, momentos y contrapesos | `--alt` |

Y un pie que dice **qué se ve**, no qué se calcula. En el cuarto de cilindro,
por ejemplo, que la componente vertical apunta hacia arriba porque el volumen
que pesaría sobre el arco es imaginario, y que por eso el apartado c) da cero
exacto.

**El límite, que es duro y no se salta:** solo se dibuja lo que el original
acota. Los doce ejercicios declarados fuera lo están porque su figura no da
las cotas, y una figura inventada sería §13 caso 2, el peor fallo posible
aquí. Esos siguen fuera y seguirán.

> **Y al ir a copiar el molde apareció un fallo de los caros.** Veintidós de
> las veintitrés figuras de Fluidos pintaban sus etiquetas con
> `fill="var(--ink-suave)"`, y **`--ink-suave` no existe en `tokens.css`**:
> 148 usos, contando también `--linea`. Un `var()` sin definir invalida la
> declaración, así que el color cae a su valor inicial —negro— y en tema
> oscuro esas etiquetas quedaban negras sobre `#14171A`. Se dibujaban bien en
> claro y nadie las había mirado en oscuro.
>
> **Se arregla renombrando en los 22 ficheros, no definiendo el token.** Y es
> Regla 0 leída con cuidado: la capa compartida ya existe —`--faint` y
> `--rule`—, lo que fallaba era que el contenido la llamaba por un nombre que
> no estaba. Definir `--ink-suave: var(--faint)` habría dejado dos nombres
> para un color, que es la enfermedad que §01 describe.
>
> Con guardián nuevo en `verify.mjs`, **regla 2 ter**: falla si algún
> `var(--x)` apunta a un token inexistente. Validado al revés como manda §11
> —roto a mano, rojo; restaurado, verde—. Y mira también los `.yaml`, que era
> el otro hueco: las 176 figuras de Cálculo viven dentro del YAML y la regla
> 2, que solo lee `.css`, `.astro` y `.mdx`, nunca las había leído.

#### Lo dibujado, por convocatoria

| dónde | figuras | qué son |
|---|---|---|
| t07 fuerzas sobre superficies | 6 | las seis compuertas del capítulo 2 |
| ordinaria de junio de 2022 | 5 | U invertida con helio, cuarto de cilindro, venturímetro de dos manómetros, cono sobre el chorro, dos ramales en paralelo |
| 1.er parcial de mayo de 2020 | 4 | laboratorio submarino, red de la boquilla, tubo de helio, tanque en T |
| ordinaria de junio de 2023 | 4 | codo-boquilla de 180°, depósito partido con tramo BC, venturímetro inclinado, circuito cerrado |
| ordinaria de junio de 2021 | 1 | el orificio y el manómetro que mide su pérdida |
| extraordinaria de junio de 2022 | 3 | balancín en dos fluidos, derivación en Y, dos depósitos a distinto nivel |
| t02 propiedades | 2 | tres cilindros coaxiales, disco sobre película |
| t04 hidrostática | 1 | el gato hidráulico |
| 3.er parcial de junio de 2021 | 2 | la instalación con válvula de retención, el trasvase por gravedad |
| ordinaria de junio de 2020 | 2 | el cuerpo que flota entre dos líquidos, el limpiacristales y su cono |
| 2.º parcial de junio de 2020 | 1 | el álabe de 180°, huyendo y embistiendo |
| 1.er parcial de abril de 2021 | 1 | la compuerta OABO, con su sector y su triángulo |
| 2.º parcial de mayo de 2021 | 2 | la embotelladora de diez boquillas, el Pitot con piezómetro |
| ordinaria de junio de 2021 | 1 | la conducción de cobre con B por encima de la lámina de A |
| extraordinaria de junio de 2023 | 2 | el depósito de 10 m con sus dos manómetros, el chorro que se parte |
| ordinaria de mayo de 2025 | 1 | la sección del canal con su acuerdo circular |
| t04 hidrostática | 1 | el depósito dentro del depósito, con sus tres aparatos |

**Dos que salieron mal y se arreglaron mirándolas**, que es §16 punto 1
funcionando: el tanque en T llevaba un `Z` de más en el trazado y cerraba con
un diagonal de esquina a esquina, y el venturímetro inclinado me había salido
en forma de **V**, como un valle, cuando el original es una tubería recta en
pendiente con un estrechamiento. El segundo se rehízo rotando el tubo entero
12,9°, que además deja la etiqueta del glicol siguiendo la pendiente.

> **Y tres que se escribieron sin mirar, y el guardián las cazó.** Las de t02
> y t04 se redactaron mientras corría un suelo, con la idea de mirarlas
> después. El de `viewBox` las devolvió con cuatro etiquetas recortadas —«450
> mm», «2 mm de aceite», «F = 100 N», «Ø₂ = 5 cm»— y al abrirlas apareció
> además un fallo que ningún guardián puede ver: en los cilindros coaxiales,
> **las líneas de referencia de e₁ y e₂ apuntaban al hueco cambiado**, la de
> «dentro» al de fuera y al revés. La figura era correcta y estaba mal
> etiquetada, que es la peor combinación.
>
> Sale de ahí una regla de método más estricta que §16: **una figura no se
> escribe sin poder mirarla en el mismo rato**. Escribir una tanda entera y
> revisarla después parece más eficiente y no lo es — el guardián solo caza
> lo que se sale del marco, no lo que señala mal.

#### El guardián que fallaba al azar, diagnosticado

Al empezar las figuras de examen el humo empezó a tumbar páginas con
«Execution context was destroyed»: **una en la primera tanda, tres en la
segunda, cuatro en la tercera**, y ninguna de ellas tocada. §11 ya lo había
atacado dos veces —una pestaña por página, esperar al trabajo diferido— y
volvía.

**No era azar y no era una navegación.** Falla siempre en las mismas cuatro
páginas de Álgebra, siempre después de superar siete u ocho ejercicios con
sus clics y sus diagnósticos, y con **14 GB libres** en la máquina: es el
proceso de render de Chromium quedándose sin sitio en las páginas grandes
—`t07-diagonalizacion` son 4,9 MB y 133.000 nodos—, y Playwright lo cuenta
con el mismo mensaje que un error de contenido.

Dos arreglos, los dos en `humo.mjs`:

- **`--js-flags=--max-old-space-size=4096` y `--disable-dev-shm-usage`** al
  lanzar el navegador: cuatro veces el montón de JavaScript por defecto, y
  fuera el `/dev/shm` pequeño.
- **Un reintento por página**, solo si la excepción coincide con el patrón de
  caída, con aviso impreso. Un fallo de verdad falla las dos veces, y los
  fallos de contenido ni siquiera pasan por ahí: los registra `comprueba()`
  directamente, así que el reintento no los puede tapar.

> Y una consecuencia que conviene no perder de vista: **el humo se está
> quedando pequeño para el tamaño del corpus.** Si el aviso de reintento
> vuelve a salir en cada tanda, el arreglo ya no es darle más memoria: es que
> las páginas de tema tienen 150.000 nodos porque incrustan treinta y siete
> ejercicios enteros, y eso es un problema de diseño de la página, no del
> guardián.

#### Una figura que no se dibuja, y por qué

**El ejercicio 1 de la ordinaria de junio de 2021 —la presa con dos leyes—
se queda sin figura.** No por falta de original, sino porque el original no
se deja leer: las tres cotas de 6 m de la base no cuadran con la geometría
que exigen los resultados publicados —las caras salen con relaciones 6/8,5 y
6/13, que dan una base de 15 m, no de 18—, y el dibujo no está a escala, así
que no hay forma de decidir cuál de las dos lecturas es la buena.

Dibujarla «aproximadamente» sería inventarse la geometría de una presa en un
ejercicio que pide fuerzas sobre ella. Es §13 caso 2, y la respuesta es la
misma que para los doce ejercicios declarados: se dice y no se publica.

**Y una segunda, por el motivo contrario.** El ejercicio 2 del tercer parcial
de junio de 2021 tampoco lleva figura, pero aquí no es que no se pueda: es
que **el original no tiene ninguna** y su apartado a) dice, literalmente,
«esquema de la instalación». Dibujarlo sería resolver el primer apartado
dentro del enunciado. Es el mismo caso que los cuadros vacíos del
venturímetro de junio de 2022, y la regla que sale de los dos es la misma:
**cuando la figura es la pregunta, no se dibuja.**

### Lo que el material docente no trae · comprobado el 31 de agosto de 2026

Búsqueda exhaustiva sobre los dos volúmenes de apuntes, las diapositivas de
tema y los dos primeros capítulos de la colección:

- **Los temas 5 y 6 no existen fuera del programa.** Ni diapositivas, ni
  apartado en los apuntes, ni un solo problema. Cero apariciones de
  «equilibrio relativo», «rotación uniforme» o «aceleración uniforme». Están
  declarados así en el catálogo y **no se escriben**: §15 prohíbe inventar lo
  que no está.
- **El tema 8 tiene diapositivas parciales.** Llegan hasta Barlow; la
  estabilidad, el metacentro y los cuerpos flotantes del programa (8.4 a 8.6)
  no aparecen, y sí caen en examen —la gabarra de 2024—. El tema lo dice en
  voz alta en vez de fingir que lo cubre.
- **Los ejercicios del capítulo 2 se resuelven sobre una figura acotada.**
  Compuertas articuladas, topes, tramos curvos: reproducirlos exige dibujar la
  figura, y dibujarla mal es peor que no ponerla. Están pendientes; los temas
  7 y 8 llevan de momento ejemplos propios y el 2.5, que es el único
  autocontenido.

**Preguntas que te tocan a ti**, y hasta entonces no hay nada que hacer con
ellas: ¿se dan de verdad los temas 5 y 6? ¿Hay apuntes de estabilidad que no
estén en la carpeta?

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

**2 · ~~El temario completo de Fluidos.~~ Resuelto el 30 de agosto de 2026.**
No hacía falta preguntarte: la respuesta estaba en `Gua_de_la_asignatura.pdf`,
apartado 4, «Programa de teoría». **Los nueve temas que faltaban existen** —la
asignatura no salta números—, así que el catálogo pasa de 16 a **25 temas** y
de `temarioOficial: false` a `true`.

Los que faltaban y ahora están: 5 (equilibrio relativo), 6 (estática de
compresibles), 9 (fundamentos del movimiento), 10 (continuidad), 11 (Euler y
Navier-Stokes), 20 (golpe de ariete), 22 (principios de máquinas
hidráulicas), 23 (turbinas) y 24 (bombas).

> **La lección, que vale para las seis asignaturas que quedan:** el dato que
> llevaba meses esperándote estaba en el primer PDF de la carpeta. Antes de
> escribir «bloqueado, esperándote a ti», hay que abrir la guía docente.

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

**5 · Tres preguntas sobre el examen de Fluidos**, anotadas el 1 de septiembre
de 2026 al escribir la ruta, y las tres son §13 caso 5 —hechos del mundo que
el repositorio no contiene—:

- **¿Cuánto dura el examen?** Ninguna de las dieciséis convocatorias lo
  imprime. El bloque de simulacro lo declara en su `falta[]` y dice «de una
  sentada» en vez de inventarse tres horas.
- **¿Se puede llevar calculadora, y de qué tipo?** Para Cálculo lo dijiste tú
  —no se puede—, y de ahí salió §09. Para Fluidos no lo sabemos, y aquí
  importa más: hay ejercicios que exigen iterar Colebrook.
- **¿Se dan de verdad los temas 5 y 6?** La pregunta sigue abierta desde el 31
  de agosto, y ahora bloquea algo concreto: la deuda 49, que es lo único que
  impide marcar la asignatura como terminada.

Y lo que sí está confirmado, por los propios enunciados: **los cuadros y
ábacos se reparten con el examen**, porque las convocatorias citan
«Documentación: Anexo I».

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

**7 · ~~Tests de física~~ · resuelto el 1 de septiembre de 2026.** Estuvo vacío
hasta que hubo un simulador con física dentro —`PlanoComplejo` es geometría, no
un modelo—. Ahora tiene dos ficheros y 34 casos:

- `moody.test.ts`, contra el ejercicio 4 del tercer parcial de junio de 2021,
  que recorre las tres zonas del ábaco con la misma tubería de 250 mm;
- `bombeo.test.ts`, contra los seis resultados publicados de la ordinaria de
  2025-2026: tres bombas, cavitación y una maniobra de válvula.

Y se cumplió lo que decía la nota: **el caso con resultado conocido fue antes
que el componente en los dos**. En los dos también el test corrigió la prosa —
las fronteras del ábaco no son «exactamente 0,3 y 6», y el error de aplicar
semejanza al punto de funcionamiento no es «apreciable» sino del 52 %—, que es
justo lo que §10 existe para atrapar.

**8 · Paleta de comandos completa.** Ya es una paleta de verdad: se abre con `/`
o `⌘K`, tiene su propio índice construido en el build y responde a flechas,
Enter y Escape. Falta que busque **conceptos** dentro de los temas —hoy el
índice solo tiene asignaturas y títulos—, que es lo que promete `CLAUDE.md` §05.

---

## Deudas conocidas, escritas para que no se olviden

**53 · `recalcula` no comprueba ni un solo número de Fluidos.** Medido el 4
de septiembre de 2026, asignatura por asignatura: los 279 pares que dice
comprobar son **todos de Cálculo**; Álgebra da 0 y Fluidos da 0 también. El
motivo no es el de Álgebra —allí los resultados son objetos exactos— sino de
estilo de escritura: el guion solo reconoce `\approx` y el corpus de Fluidos
escribe `=`. Consecuencia práctica: cada commit de esta tanda ha informado
«recalcula sin desajustes» y eso, para Fluidos, no quería decir nada.

Ampliarlo a `=` está probado y no vale como cambio de una línea: con `=`
aceptado, Fluidos pasa de 0 a 1216 pares y saltan 259 avisos (21 %), el mismo
orden de ruido que hizo descartar los dos guardianes de texto que cuenta §11.
Los falsos positivos son de tres clases y las tres tienen arreglo conocido:
cadenas con cambio de unidad, redondeos encadenados que bailan en la última
cifra, y expresiones que `expresionAntesDe` corta por la mitad. El trabajo es
de una tarde y merece la pena, porque hoy la aritmética de la asignatura más
numérica del proyecto no la mira nadie salvo quien la escribe.

**52 · 22 subíndices con tilde dentro de `$…$`.** `P_{útil}`, `k_{válv}`,
`Z_{máx}`, `\rho_{hormigón}`, `v_{tubería}`, `Q_{teórico}`, `V_{teórica}`,
`\sum F_{presión,y}`, `cierre rápido` y `sistema homogéneo`. KaTeX los dibuja
—el suelo está en verde y `verify.mjs` no protesta— pero avisa por consola con
`unicodeTextInMathMode` cada vez que se compilan, y el aviso tapa los que sí
importan. Contados el 4 de septiembre de 2026 con un barrido de las fórmulas
ya parseadas (no con `grep`, §17): 1 en Álgebra y 21 en Fluidos, repartidos en
nueve ficheros. El arreglo es sacar la palabra del modo matemático
—`P_{\text{útil}}` o simplemente el subíndice sin tilde—, y como toca nueve
ficheros a la vez conviene hacerlo de una tanda y no de paso.

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

**49 · ~~Una asignatura cuyo programa oficial incluye temas sin material no
puede marcarse nunca como terminada.~~ Resuelta el 2 de septiembre de 2026, y
por la vía que decía la propia deuda.** Descubierta el 1 de septiembre de 2026,
al ir a cerrar Fluidos.

> **Cómo se cerró.** El dato que faltaba lo dio el alumno: los temas 5 y 6
> **solo se explican en clase y no caen nunca**. Con eso, de las tres salidas
> que estaban escritas abajo se tomó la tercera, que era la única honesta:
> `content.config.ts` acepta ahora un campo **`soloEnClase`** en un tema, y
> `estado: ok` exige `hecho` **o** ese campo.
>
> Tres decisiones dentro del arreglo que conviene no deshacer:
>
> - **el campo es una cadena, no un booleano**, y el esquema le exige 30
>   caracteres: guarda el motivo **con su fuente**, porque es un hecho del
>   mundo que el repositorio no contiene (§13 caso 5) y nadie lo puede deducir
>   mirando los datos. Un `true` no diría quién lo dijo;
> - **un tema no puede ser `hecho` y `soloEnClase` a la vez**, y el esquema lo
>   rechaza: son estados excluyentes y confundirlos volvería a hacer posible la
>   mentira que esta deuda evitaba;
> - **hay un tope de un tercio del temario.** Si algún día media asignatura se
>   declara «solo en clase», eso no es una asignatura terminada sino una lista
>   de excusas, y el build para. La salida está para un caso raro, no para ser
>   un atajo.
>
> Y la portada distingue las dos cosas, que antes se veían iguales: «todavía no
> escrito» y «no hay nada que escribir» no son lo mismo, así que un tema
> `soloEnClase` no se apaga más —eso lo haría parecer más pendiente— sino que
> lleva su etiqueta *«solo se explica en clase»* y el motivo en el `title`.
>
> **Fluidos pasa a `ok`**, y con ella son **tres asignaturas cerradas**.

El texto original, por si hace falta reconstruir el razonamiento:

El esquema del catálogo dice `estado: ok` **solo si todos los temas tienen
`hecho: true`**, y Fluidos tiene dos —el 5, equilibrio relativo, y el 6,
estática de compresibles— que están en el programa oficial y de los que no
existen ni apuntes, ni diapositivas, ni un solo problema. Los dos llevan ya su
`etiqueta` diciéndolo con todas las letras.

Así que la asignatura se queda en `obra` con las 16 convocatorias, la ruta y
los 23 temas escritos, y eso publica algo que no es verdad: que se sigue
escribiendo. Las tres salidas, y ninguna se puede tomar desde el contenido:

- **marcar los dos temas `hecho: true`** — es mentira, queda descartada;
- **quitarlos del catálogo** — también, porque §15 exige que el catálogo sea
  el temario oficial y no una lista plausible;
- **que el esquema acepte `ok` con temas declarados sin material** —
  probablemente un campo `sinMaterial: true` que exima del `hecho` y que la
  portada pinte distinto. Es la única honesta, y toca `content.config.ts`.

Es §13.4 —capa compartida— así que queda escrita en vez de resuelta. Mientras
tanto, `docs/como-vamos.md` dice el estado real con números; lo único que
miente es la palabra «en obra» de la portada.

> **Y esto es lo que hay que llevarse de la deuda 49, más que el arreglo.**
> Estuvo escrita y sin resolver **un día**, y no por falta de tiempo: faltaba
> **una frase de una persona**. §13 dice parar y anotar cuando lo que falta es
> un hecho del mundo, y funcionó exactamente como está escrito — se anotó, se
> preguntó, y con la respuesta el arreglo salió en media hora. Si en vez de
> anotarla la hubiera resuelto por mi cuenta el día 1, habría elegido entre
> mentir en el dato o romper el temario oficial, y las dos son peores.

**50 · Fluidos tiene una figura por tema, y Cálculo tiene dos y media.**
Medido el 1 de septiembre de 2026 con `npm run mide`: 23 figuras en 23 temas
frente a las 29 en 11 de Cálculo.

Cumple el mínimo de §15 —«al menos una figura que responde a una pregunta»— y
por eso no bloquea el cierre, pero es la deuda visual de la asignatura y en un
temario que va de compuertas, ábacos, curvas de bomba y secciones de canal es
justo donde más se nota. Los sitios que más lo piden, por orden: la curva de
la instalación cortando la de la bomba (t25), el prisma de presiones cuando no
es un triángulo (t07), el ciclo del golpe de ariete (t20) y las secciones
compuestas de canal (t21). Ninguna se dibuja hasta tener escrita la pregunta
que responde (§13).

> **Cuatro de las cinco se cubrieron el 1 de septiembre de 2026 con los
> simuladores de la fase 13**, que además son interactivos: t25 dibuja las dos
> curvas cortándose, t07 el prisma en todas sus formas, t20 el techo de
> presiones y t21 las tres tipologías a escala. Queda el ciclo temporal del
> golpe de ariete, que el simulador no dibuja —enseña la curva ΔH(Tc) y el
> techo, no la onda cuadrada en el tiempo—, y para eso ya está la figura fija
> que el tema tiene.

**51 · ~~Los simuladores estaban publicados y no se veía ninguno.~~ Arreglado
el 2 de septiembre de 2026, y la lección vale más que el arreglo.**

Se publicaron los cinco, el suelo dio verde, las capturas de cada uno eran
correctas… y al abrir la URL del tema no aparecía ninguno. Los cinco viven en
un apartado que **no es el primero**, y en modo guiado los demás están
`hidden`. Las capturas estaban tomadas después de pulsar «completo», así que
demostraban que el simulador funciona, no que se encuentre.

Es el mismo fallo que los 58 enlaces de teoría de agosto: **el destino existe y
no llega.** Y llevaba ahí desde el principio sin que nadie lo viera —
`PlanoComplejo`, en el tema 1 de Cálculo, está en el segundo apartado y era
igual de invisible desde el primer día del proyecto.

El arreglo tiene tres piezas, todas leyendo el DOM y ninguna añadiendo un campo
al esquema:

1. cada simulador lleva `id="sim-…"`, así que tiene ancla propia y se puede
   enlazar desde fuera;
2. la cabecera del tema muestra **«este tema trae un simulador»** con su
   nombre, sacado del `<h3>` del propio componente;
3. el apartado que lo contiene lleva un chip **«simulador»** en el índice.

Y el catálogo dice ahora la verdad: los cinco temas de Fluidos declaran el
patrón `simulador` y salen marcados en la portada, como ya hacía el tema 1 de
Cálculo.

**Lo que queda anotado en `CLAUDE.md` §16 es la regla, no el arreglo:** una
captura tomada después de tocar algo demuestra que la cosa funciona, no que se
encuentre. **Son dos comprobaciones distintas y hay que hacer las dos.**
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
- **La fase 5** —abrir la tercera asignatura— tenía tres condiciones. Dos
  cerradas el 30 de agosto de 2026: el **temario de Fluidos** (25 oficiales,
  de la guía docente) y las **unidades en el esquema** (tipo `magnitud`, con
  `lib/unidades.ts` y 20 tests). Queda la tercera: **el lector de respuestas
  sigue dentro de `EjercicioGuiado.astro`**, y ya son seis tipos. No bloquea
  —la lógica vive en `lib/`, lo que queda en el componente es el despacho—,
  pero cada tipo nuevo toca cuatro sitios del mismo fichero.

---

# La revisión del 10 · 29 de agosto de 2026

Se pidió llevar Cálculo a 10 de 10 antes de abrir la tercera asignatura, dando
por hecho que nuestras resoluciones son las correctas. Esa premisa hay que
precisarla, porque decide qué se hace: **no se puede *asumir* que una
resolución es correcta** —eso es exactamente §13 caso 2—, pero sí se puede
cambiar el criterio. Si contrastar con la solución oficial es imposible porque
el examen no la publica, el eje deja de ser «¿coincide con la oficial?» y pasa
a ser **«¿está comprobado todo lo que se puede comprobar sin ella?»**.

## Lo que se hizo, eje por eje

### Pedagogía · nueve ejemplos de entrada nuevos

La rampa ya estaba cerrada —cero escalones arrancan en examen—, pero cuatro
temas descansaban en dos o tres ejemplos propios para decenas de ejercicios de
examen. Se escribieron **nueve**, elegidos por lo que el examen usa y no tenía
entrada:

| tema | qué faltaba | ahora |
|---|---|---|
| t09 | la lineal con factor integrante, la característica de segundo orden, la particular **sin** resonancia | 2 → 5 ejemplos |
| t08 | un trabajo a pelo sin ningún atajo, y Green con el integrando constante | 2 → 4 |
| t04 | componer un desarrollo sin derivar, y la cota del resto aislada | 5 → 7 |
| t10 | el rodeo completo de la EDO a la solución | 3 → 4 |
| t11 | un coeficiente calculado con la integral entera | 3 → 4 |

Y **dos figuras**: el campo de direcciones de t09 —que era el único tema con
una— y lo que Green intercambia en t08, con el borde tramo a tramo a un lado y
la región al otro.

La elección tiene un criterio: en los cuatro temas la prosa **ya cubría** todas
las herramientas que sus exámenes usan. Lo que faltaba no era explicación, era
**por dónde entrar**, y por eso son ejemplos y no párrafos. Engordar la prosa
para llegar a un número de palabras habría sido relleno.

### Honestidad · el criterio, escrito en las siete rutas

41 de 62 bloques no declaraban ningún hueco, y escribir 41 rellenos habría sido
peor que nada. Se midieron con tres criterios —pocos ejemplos de entrada para
lo que el tema exige, herramienta usada y no nombrada en su prosa, escalón que
arranca en examen— y resultó que la mayoría de los avisos eran **referencias
cruzadas**, no agujeros: la regla de la cadena se usa en el tema 4 y se explica
en el 3, y eso es un curso construyéndose sobre sí mismo.

Así que en vez de inventar huecos, las siete rutas dicen ahora **con qué tres
criterios se buscaron**. Un bloque sin `falta[]` deja de significar «nadie
miró».

### Infraestructura · la barrida completa, y tres fallos del propio guardián

`humo.mjs` abría 8 de las 96 páginas de examen. Ahora abre una **muestra
rotatoria de ocho** por día —impresa, para poder reproducir un fallo— y con
`HUMO_TODO=1` las abre todas: eso es lo que se pasa al cerrar.

La primera barrida completa encontró cuatro figuras marcadas **y las cuatro
eran correctas**: el guardián de `viewBox` daba falsos positivos con los
círculos guía —el de radio 2 del que solo se dibuja un arco— y con marcadores
de continuación dibujados fuera a propósito. Se estrechó la regla a lo que sí
es un fallo, un **marcador cortado**: radio pequeño y centro dentro del marco.
Validada al revés con las dos formas.

Y de paso salieron **tres fallos del guardián**, que llevaba dando «Execution
context was destroyed» en una página distinta cada vez y por eso parecía
azar: abría las 123 páginas en la misma pestaña, clicaba las pestañas de modo
dentro del mismo `evaluate` que dispara `history.replaceState`, y medía sin
esperar al trabajo diferido —los doce lienzos del tema 1—. Los tres arreglados,
y el error ahora dice **en qué página**.

### Corrección · lo que se puede comprobar sin la solución oficial

`npm run recalcula` ya cubría las expresiones que el corpus escribe. Se intentó
extenderlo a comparar cada `valor` con el final de su desarrollo y **se
descartó**: 2 casos comparables de 1.055 y uno de ellos falso, porque el
desarrollo de un paso termina muchas veces en una magnitud intermedia. Es la
tercera comprobación de esta clase que se prueba y se tira, y las tres están
apuntadas en el propio guion para que nadie las vuelva a intentar sin saberlo.

## Dónde queda cada eje

| eje | antes | ahora | qué lo sostiene |
|---|---|---|---|
| corpus | 9 | **10** | 88 de 88 · 425 y 191 ejercicios enlazados · §15 en sus once filas |
| pedagogía | 8 | **10** | 0 de 156 escalones sin rampa · 53 ejemplos propios · 29 figuras · toda herramienta del examen, en la prosa de su tema |
| infraestructura | 9 | **10** | suelo en verde · las 96 páginas de examen abiertas · ninguna por encima de 4 s |
| honestidad | 9 | **10** | 37 huecos declarados y el criterio escrito en las siete rutas |
| corrección | 5 | **—** | ver abajo |

## Y el eje que no se puede puntuar

**416 de 425 resoluciones de examen siguen sin contrastar contra una solución
oficial, y eso no es una tarea pendiente: es que esa solución no existe.** El
examen no la publica. Solo 9 ejercicios coinciden con un boletín que sí publica
la suya, y una de esas nueve encontró **una errata en la hoja oficial**.

Lo que sí se puede afirmar hoy, y está comprobado:

- **todo lo que el corpus afirma numéricamente cuadra** —`recalcula`, sin un
  desajuste—;
- **ningún recuento publicado es imposible** contra el corpus;
- **cada enunciado se reproduce tal cual**, erratas del original incluidas;
- y en dos días de auditorías se encontraron y corrigieron **cerca de treinta**
  errores de contenido, de los cuales unos veinte enseñaban algo falso.

Ese último dato es el que impide poner un número. Un 10 en corrección
significaría «no quedan errores», y lo único que se puede decir con honradez es
«no queda ninguno que sepamos buscar». Son cosas distintas, y la diferencia se
mide en el ritmo con que aparecieron: **8 errores en 162 ejercicios
recalculados a mano**. Sobre los que nadie ha recalculado, eso proyecta una
docena larga.

**Cálculo está lista para no tocarse más y pasar a la siguiente.** Lo que queda
no se cierra escribiendo: se cierra leyendo las matemáticas de 416
resoluciones, y eso es una tarea distinta que conviene no disfrazar de fase.

---

# Rediseño «Pizarra» — fase 1 (29 de agosto de 2026)

El brief llegó de la sesión de Cowork (`redisenopizarrabrief.md`, Descargas) con
la decisión ya tomada: mundo Pizarra, elegido por Ionan entre cuatro. Esta fase
cubre tokens, fuentes y la portada. **El interior NO se toca hasta que Ionan
vea la portada** (regla 5 del brief).

## Hecho

- [x] Rama `rediseno-pizarra` (las 10 transcripciones de Álgebra quedaron
      commiteadas en `main` antes de abrirla).
- [x] Fuentes: Karla (400/500/600/700/800) + Caveat (500/700) reemplazan a
      Fraunces + IBM Plex Sans. Plex Mono se queda (datos y etiquetas; el
      brief no lo tocaba). El 600 no estaba en el brief pero 20 componentes
      lo usan y sin él Karla lo sintetizaría.
- [x] `tokens.css`: sección pizarra completa. **La tiza apagada subió de
      .55 a .62**: sobre el punto claro del gradiente (#1D463A) la del mockup
      daba 4.02 de contraste y 4.5 es el listón; a .62 da 4.7. Todos los
      demás pares pasan sobrados (tiza 9.3, amarilla 7.5, menta 7.5).
- [x] Bloque de impresión: la pizarra en papel es tinta sobre blanco — los
      navegadores tiran los fondos al imprimir y la tiza desaparecería.
- [x] CLAUDE.md §02 (tabla de dependencias) y §06 (reescrito entero:
      tipografía, superficies pizarra/papel, la regla del movimiento).
- [x] Portada nueva: héroe con subrayado que se dibuja una vez, figura
      tocable (punto arrastrable + tangente), temario en dos columnas con
      estados honestos del catálogo, repisa con el lema.
- [x] Los números del héroe se calculan de las colecciones (96 exámenes hoy),
      nunca escritos a mano (§10).

## Decisiones tomadas al implementar (el brief las dejaba abiertas)

- **El detalle B adopta pizarra**, no papel: el brief dice «la portada
  entera» y un salto oscuro→claro dentro de la misma página desorienta.
  Se recoloreó remapeando los tokens neutros a tiza dentro de `.escena`
  (una regla, no doscientas). El acento de asignatura dentro de la escena
  es siempre tiza amarilla: los acentos oscuros no se leen sobre pizarra.
- **El FLIP se queda** (el nombre viajando no cansa; lo dice el brief).
- **El conmutador claro/oscuro se oculta solo en la portada**: la pizarra
  es igual en los dos temas y ahí el botón no diría nada. Las interiores
  lo conservan hasta la fase 2.
- **El estado por defecto de toda animación es «ya dibujado»**: la animación
  solo existe dentro de `prefers-reduced-motion: no-preference`. Con
  movimiento reducido el subrayado y la curva aparecen dibujados — un
  `forwards` apagado dejaría el trazo invisible para siempre (§17).
- El wordmark pasa a Caveat también en las páginas interiores (identidad),
  pero nada más de la barra interior cambia hasta la fase 2.

## Pendiente (fase 2, tras el visto bueno)

- [ ] Interior: papel cálido (#F8F5EC …), barra superior pizarra,
      ErrorTipico y diagnósticos como recuadros de pizarra, mini-pizarras
      para figuras. Replantear ahí el toggle claro/oscuro.
- [ ] Migrar los acentos de asignatura al mundo nuevo (hoy siguen los de la
      paleta vieja; en la portada ya no se ven).
- [ ] Decidir si `--live`/`--flag`/`--alt` cambian a los verdes/rojos del
      papel cálido del brief (§3) o se quedan.

## Además, arreglado de paso

- 111 `\bar{}` → `\overline{}` en las transcripciones de Álgebra (t05/t06):
  el guardián de verify los cazó. Y un `$…$` partido en tres líneas en el
  enunciado de 6.7 que remark-math no cruzaba.

## §5b — el detalle de asignatura (mismo día, brief actualizado)

Ionan actualizó el brief con el tablero «Después · detalle de Cálculo»,
aprobado. Lo implementado, y las decisiones que el brief dejaba abiertas:

- **Banda de pizarra + cuerpo en papel.** El remapeo de tokens dejó de vivir
  en `.escena` entera y pasó a las dos superficies de tiza (héroe y banda):
  el cuerpo del detalle es papel de verdad, no pizarra reteñida.
- **Los tokens de papel ya son los del brief §3** (fondo #F8F5EC, tinta
  #2B2A24, verde #1C6E51, rojo #C6503C). Dos colores de datos tuvieron que
  moverse para que `check-color` siguiera en verde sobre el papel cálido:
  `--d2` a #CE7400 (contraste) y `--d5` de oro a oliva #6A701A (protanopía
  y escala de grises, no había hueco de luminancia donde estaba).
- La lista de temas va **sin descripción** (decisión explícita de Ionan) y
  los seis puntitos de patrones se fueron: queda una etiqueta Caveat
  «con simulador» solo donde informa.
- **La destacada de la caja de rutas es la primera evaluación**: el brief
  dejaba elegir y prohibía la cuenta atrás; quien llega sin contexto empieza
  por ahí. Cambiarla es tocar un índice, no una regla.
- El CTA de la banda ancla a `#<asignatura>-rutas`. Sin JavaScript ese hash
  dejaba de casar con `.detalle:target` y **cerraba el detalle**: se cubrió
  con `.detalle:has(:target)` y el enrutador aprende a abrir la asignatura
  madre si el hash llega con `-rutas`.

## Fase 2 — las pantallas de estudio (29 de agosto de 2026, brief §6 aprobado)

Implementado: barra pizarra en todo el sitio, ErrorTipico y diagnóstico del
distractor como recuadros de pizarra con título en Caveat amarilla, toggle
guiado/completo en la barra, enunciado con borde verde, la escalera de pasos
con sus tres estados a la vista (hecho verde · activo con sombra · pendiente
al 60 %), campo en rojo al fallar, «vale la forma exacta» junto al formato,
tarjeta «practica lo que acabas de leer» al pie de la teoría, y el examen
entero: filas plegables, carril derecho con el PDF en pizarra y la barra de
reparto apilada con sus tres colores propios.

**Diferencias conscientes con los tableros, y por qué:**

- **El examen conserva las pestañas examen/resoluciones.** El tablero no las
  dibuja; son el mecanismo que valida humo.mjs, lo que funciona sin
  JavaScript y la filosofía documentada del «examen en blanco». Las filas
  plegables van DENTRO del panel de examen y lo refuerzan.
- **La tarjeta de practicar cierra la lectura en vez de ir en carril
  derecho**: la página de tema no tiene ese carril, y añadir una tercera
  columna para una tarjeta era más rejilla que contenido.
- **La figura del tema en mini-pizarra del carril queda pendiente**: exige
  designar «la figura del tema» por dato (¿cuál de las 3 de t01?). Se hace
  cuando el catálogo lleve ese campo, no eligiendo una al azar.
- **La tarjeta «qué entrena» del ejercicio queda pendiente** por lo mismo:
  los ejercicios se incrustan en listas (tema, examen) sin carril propio.
- **El botón «Resolución completa» del examen es uno solo** («Resolver
  guiado →»): el modo completo vive dentro del propio ejercicio, y dos
  botones que aterrizan en el mismo sitio confunden más que ayudan.
- **El guardián de humo aprendió a abrir `<details>`**: era la tercera forma
  de ocultar que su «destapa todo» no cubría, y daba 8 falsos positivos de
  viewBox con las filas plegadas (validado al revés: sin el cambio, rojo).
- La página de ruta de estudio (preparar/) NO se rediseñó: el brief lo
  prohíbe hasta que exista su tablero.

## Fase 3 — la ruta de estudio (29 de agosto de 2026, brief §6b aprobado)

El camino de bloques del tablero «Ruta · preparar la 1.ª evaluación»:
números en círculo unidos por la espina de tiza, el primero abierto y los
demás plegados, la anotación de tiza con el porqué medido, y el carril con
«Por qué este orden» en pizarra, los datos de la evaluación y «Lo que
falta, dicho en voz alta» pintando las falta[] reales.

- **La corrección de fondo**: el `dominio` del BLOQUE se pinta siempre
  («lo tienes cuando:») — el esquema lo exigía y la página lo tiraba.
- **Campo nuevo `apunte` en el esquema** (texto + tono nota/marco/neutro):
  la anotación es dato porque comprimir el porqué es una lectura humana y
  la página no escribe nada. 74 apuntes escritos para las 9 rutas,
  destilados de sus `porque`.
- **La página deja el patrón Lectura**: el acordeón nativo ES el modo
  guiado hecho estructura; al imprimir se abren todos los bloques. El
  ancla profunda dentro de un bloque cerrado se abre a mano (§17).
- Los remates §6c de la portada: escala del tablero, el hueco entre
  listas y repisa repartido, y user-select: none en la figura tocable.

## ~~Punto de reanudación (30-08)~~ · Fase 4 de Álgebra TERMINADA el 30 de agosto de 2026

El boletín oficial está dentro en seis temas de siete: t01 (33), t02 (23),
t03 (20), t04 (21, el 4.15 va dos veces en el original), t05 (22) y t07 (25
enunciados, 32 ejercicios porque el 7.6 y el 7.7 traen varias matrices). De
35 ejercicios de tema a 179; de 142 pasos a 576. Un commit por tema, cada
uno con el suelo en verde.

Lo que se aprendió y no estaba escrito:

- **`titulo` y `fuente` son texto plano.** Un `$A_1$` en la fuente sale como
  «fórmula sin dibujar» en `verify` y para el despliegue. Subíndices en
  Unicode o sin subíndice.
- **La trampa del 7.10 estaba mal en la nota de reanudación** («a=b=0 si
  c=1»): con c=1 el 1 fijo en la posición (1,3) hace que A−I nunca tenga
  rango 0, así que con c=1 no diagonaliza nunca. La corrección salió de un
  cálculo numérico, no de releer: **toda condición de diagonalización con
  parámetro se comprueba con un valor concreto antes de escribirla.**
- **Dos enunciados del boletín de espacios vectoriales traen erratas casi
  seguras** (el 28: los tres vectores son base y el «si no se cumple,
  completar» no se activa; el 31: con w=(4,0,5,19) el subespacio es un
  hiperplano y b queda libre; con −19 todo cuadra). Se resuelven tal como
  están impresos y se dice qué cambiaría. No se corrige el enunciado (§08).
- **Escribir borrador en el mensaje de una trampa es publicar borrador.** Se
  cazaron tres («pieza mal escrita a propósito», «…comprueba tú los seis
  productos», una interpretación geométrica a medias) antes del suelo.
  Regla: el mensaje de la trampa se escribe entero o no se escribe.
- **El suelo no acepta `npm run build` en paralelo** (dos falsos rojos el
  29). Tampoco conviene lanzar dos `suelo` a la vez: el segundo machaca
  `dist/` del primero. Uno cada vez, en segundo plano, y seguir escribiendo
  contenido mientras tanto es seguro.

CORRECCIÓN (30-08, misma sesión): aquí decía que quedaba el boletín de t06,
y era falso — el de euclídeos solo tiene 7 enunciados (6.1–6.7) y los 9
ejercicios que salen de ellos están dentro desde el 27 de agosto. **El
boletín de Álgebra está completo en los siete temas.** Lo único abierto es
la decisión de enlace: 77 de 179 desde escalones, el resto desde la página
del tema.
