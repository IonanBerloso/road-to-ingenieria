# Las trampas de CLAUDE.md §17, enteras

Cosas que ya han costado horas, con su detalle y su porqué: las entradas de
CLAUDE.md §17, tal cual y en su orden. En CLAUDE.md queda el índice, una
línea por trampa, que `npm run trampas` genera a partir de este fichero y que
`verify.mjs` comprueba. Una trampa nueva se escribe aquí y se pasa
`npm run trampas`.

Se trajeron aquí el 3 de octubre de 2026, sin cambiar una palabra
(`docs/decisiones.md`, «CLAUDE.md en dos niveles»).

- **No escribas LaTeX a través del shell.** Ni heredocs, ni `node -e`, ni
  `sed`. Las barras se comen: `\\frac` llega como `\frac`, y `\f` se convierte
  en un carácter de avance de página **invisible** que rompe el YAML y no se
  ve al leer el fichero. Usa las herramientas de edición de ficheros. Pasó tres
  veces en un día.

  **Y el reemplazo de `sed` es peor que el patrón.** El 14 de septiembre de
  2026, un `sed 's/\operatorname{arctg}/\arctan/'` dejó escrito un carácter
  BEL en mitad de una fórmula: `\a` en el **lado derecho** de la sustitución
  no es «barra + a», es el timbre. El fichero se veía bien en el editor y el
  build cayó con «the stream contains non-printable characters». Dos reglas
  que salen de ahí: el reemplazo de `sed` nunca lleva una orden de LaTeX, y
  cuando un YAML falla por «non-printable», lo primero es
  `grep -c $'\a' fichero`.

  **Y las comillas invertidas tampoco pasan.** Dentro de un `node -e "…"` entre
  comillas dobles, bash toma cada `` `algo` `` por una orden que ejecutar y lo
  sustituye por su salida —casi siempre, nada—. El 26 de septiembre de 2026 un
  comentario que debía decir «viven en `lib/numero.ts`» quedó escrito «viven
  en , y», sin un solo aviso salvo un «No such file or directory» que se leía
  como ruido. Y en Markdown y en los comentarios de este repositorio hay
  comillas invertidas en casi cada frase. **La regla, entera: el texto que va
  a un fichero se escribe con la herramienta de edición o en un guion del
  scratchpad; por la shell solo pasan órdenes.**
- **Un `: ` sin comillas dentro de un valor YAML rompe el fichero**, y el error
  que da apunta a otra línea. Ojo con los apóstrofos de `f'`, que confunden a
  cualquier comprobador hecho con `grep`.
- **`dist/` abierto con `file://` no tiene CSS.** Las variables salen vacías y
  parece que los SVG no se dibujan. Levanta un servidor.
- **No reconstruyas mientras `humo.mjs` está corriendo.** El navegador lee
  `dist/` a través del servidor de vista previa, así que un `npm run build` por
  debajo le arranca las páginas de las manos y devuelve 404 que no son del
  sitio. Pasó el 13 de septiembre de 2026, con 55 y luego 130 fallos fantasma,
  y **volvió a pasar el 14** mientras se arreglaba justo eso: una barrida
  entera perdida. Una tanda en segundo plano a la vez, y nada que toque `dist/`
  hasta que termine.

  **Y si la barrida cae en el primer segundo diciendo «el servidor de vista
  previa no ha arrancado en 30 s», no es el arranque: es que hay otro
  servidor.** Astro guarda un `preview` **desprendido** entre ejecuciones y se
  niega a levantar uno nuevo, con un mensaje que `humo.mjs` no ve porque lanza
  el proceso con `stdio: 'ignore'`. Lo deja `peso.mjs` o
  `comprueba-simuladores.mjs` si se cortan a medias, y puede estar en otro
  puerto —4408, por ejemplo— así que mirar el 4321 con `netstat` no lo
  encuentra. Pasó el 15 de septiembre de 2026 y costó dos barridas. Lo que lo
  resuelve en diez segundos:

  ```
  node node_modules/astro/bin/astro.mjs preview status
  node node_modules/astro/bin/astro.mjs preview stop
  ```
- **`max-width` y `overflow` NO hacen nada en una caja `display: inline`.** El
  navegador los ignora en silencio, así que la regla se lee bien, pasa las
  revisiones y no surte efecto. `.katex` es un `<span>`, o sea `inline` por
  defecto: la regla que debía contener las fórmulas largas se escribió el 4 de
  septiembre de 2026 y **estuvo diez días inerte**, con tres páginas de tema
  yéndose de lado en un teléfono. Si una regla existe para arreglar algo
  medido, hay que volver a medirlo después (§16); que esté escrita no es que
  funcione.
- **Un track `1fr` tiene `min-width: auto`, que es min-content y no cero.**
  Cualquier hijo que no sepa encoger —una fila flex con `nowrap`, una tabla, una
  fórmula— estira la columna entera y se lleva el documento con ella. En una
  pantalla de 360 px la columna de un tema llegó a **771,8 px**. La cura es
  `min-width: 0` en los hijos de la rejilla, y conviene ponerlo al escribir la
  rejilla, no al descubrir el desborde. Y una rejilla **sin columnas
  declaradas** no se libra: su columna implícita es `auto`, que se comporta
  igual. El 28 de septiembre de 2026 la leyenda de una cuestión, con una
  fórmula de 420 px, sacaba así la página a 478; se declara
  `grid-template-columns: minmax(0, 1fr)`.
- **Una tolerancia relativa sobre una temperatura es enorme.** El lector de
  magnitudes convierte los grados Celsius a kelvin antes de comparar, así que
  el 2 % por defecto de una respuesta de 40 °C son **±6,3 K**: cualquier
  distractor a menos de seis grados se da por bueno. Lo cazó el esquema el 7
  de septiembre de 2026, en el primer ejercicio de Térmica cuya respuesta era
  una temperatura. En una respuesta de tipo temperatura, la tolerancia se pone
  a ojo mirando **cuántos kelvin** representa, no cuántos por ciento; 0,005
  son un grado y medio, que es lo razonable.
- **Los ids de encabezado se generan por `render()`, no por documento.** Astro
  instancia el slugger en cada llamada, así que dos resoluciones con un `##
  Resultado` producen dos `id="resultado"` en la misma página. Se prefijan en
  `mate()`; si añades una salida de Markdown nueva, pásale su prefijo.
- **En modo guiado, un enlace a un apartado que no es el visible no navega.**
  El destino existe pero está oculto. Lo resuelve `abreElAncla()` en
  `Lectura.astro`; si escribes otro componente con secciones, tenlo en cuenta.
- **El servidor de desarrollo sirve colecciones de contenido viejas.** Si un
  `.yaml` de `src/content/` lo escribe otro proceso —un script del scratchpad,
  un `git checkout`— el vigilante de Astro puede no enterarse, y `npm run dev`
  sigue devolviendo la versión anterior sin avisar de nada. El 26 de agosto de
  2026 costó una medición falsa: la ruta de la 4.ª evaluación se comprobó en el
  navegador con 48 enlaces nuevos ya escritos, y el navegador informó de 18
  —los de antes— con todo en verde. **Antes de creerte cualquier medición sobre
  el navegador, comprueba que el servidor ya sirve lo que acabas de escribir**:
  un `curl` a la página y un `grep` de algo que solo esté en la versión nueva.
  Si no está, se mata el proceso del puerto 4321 y se levanta otra vez.
- **`replace()` con un `$` en el texto de reemplazo se traga el fichero.** En
  `String.prototype.replace`, el `$` de la cadena de reemplazo es un carácter
  especial, y son cinco las secuencias que muerden: `$&` es lo sustituido, `$1`
  un grupo, **`$'` es todo lo que va detrás**, **`` $` `` es todo lo que va
  delante** y **`$$` se queda en un solo `$`**, que rompe sin avisar cada
  fórmula en bloque. Como aquí casi todo el texto lleva LaTeX entre dólares,
  cualquiera de las cinco mete o quita trozos del propio fichero.

  **Ha pasado dos veces, y la segunda con esta regla ya escrita.** La primera,
  en `tasks/todo.md`: quedó cortado a media frase, en el sitio exacto donde
  había un `$x\sin x$`, con la versión anterior entera pegada detrás, y así
  estuvo **veintiún commits** publicando recuentos viejos. La segunda, el 17
  de septiembre de 2026, en este mismo documento: un punto de §17 llevaba un
  dólar pegado a una comilla invertida, el `` $` `` insertó **el `CLAUDE.md`
  entero** en mitad de una frase, y así estuvo nueve días —5.472 líneas, de
  las que 2.434 eran copia—, con las ediciones posteriores cayendo en una sola
  de las dos mitades. Se vio en la auditoría del 26 de septiembre, al listar
  las secciones y encontrarlas todas dos veces.

  **Regla: para insertar texto literal se usa la función de reemplazo
  —`(...) => nuevo`— o se parte y se vuelve a juntar con `split`/`join`,
  nunca la cadena a pelo.** Después de cualquier reescritura de un fichero de
  prosa, se cuenta: `wc -l` antes y después, y un `grep -c` de un encabezado
  que solo puede aparecer una vez. Y como la regla escrita no evitó el
  segundo accidente, ahora lo vigila `verify.mjs` en «Los documentos del
  repositorio»: falla si una sección `## NN //` sale dos veces en `CLAUDE.md`
  o en `tasks/`, o si la primera línea de un fichero reaparece más abajo.
- **Borrar «desde aquí hasta allí» se lleva por delante lo que se añadió en
  medio.** Al podar una sección obsoleta de `tasks/todo.md` se ancló el
  corte en dos textos que estaban a 250 líneas de distancia, y entre ellos
  habían crecido **cinco secciones nuevas** que desaparecieron sin avisar.
  El fichero seguía compilando y el guardián no lee `tasks/`. La regla de
  §16 —contar antes y después— lo cazó, pero contar líneas no basta:
  `wc -l` solo dijo que faltaban 246, y eso podía ser lo esperado.
  **Cuenta encabezados, no líneas** (`grep -c '^### '`), y mejor aún
  compara la lista: `git diff -U0 fichero | grep '^-#'` dice exactamente
  qué secciones se han ido. Y para acotar un bloque, ánclalo por **índice
  de línea comprobando los dos bordes** antes de escribir, no por dos
  cadenas lejanas.
- **Un `IntersectionObserver` no sirve para diferir trabajo en modo guiado.**
  Los paneles cerrados están en `display: none`, no intersecan nunca, y lo que
  cuelgue del observador **no se ejecuta jamás**. Pasó el 28 de agosto de 2026
  al diferir el pintado de los lienzos del paso `verificar`: la página cargaba
  el doble de rápido y los seis lienzos se quedaban en blanco. Lo que sí vale
  es `requestIdleCallback`, que no depende de la visibilidad. **Regla: al
  diferir cualquier cosa, comprueba después que llega a ejecutarse** — que la
  página vaya más rápido puede significar que ya no hace su trabajo.
- **Una línea que empieza por `- ` parte en dos una fórmula que venía de la
  línea anterior.** Dentro de un bloque `|` el texto es Markdown, y en
  Markdown `- ` al principio de línea abre una lista: eso cierra el párrafo,
  y el `$…$` que cruzaba el salto se queda sin pareja a cada lado. El
  resultado son dos trozos de LaTeX publicados como texto crudo. Pasó el 31
  de agosto de 2026 al escribir una `pista` con
  `$NPSH_d = p_{at}/\gamma - p_v/\gamma - z_{asp}` y la continuación
  `- h_{f,asp}$` en la línea siguiente. Lo caza `verify.mjs` —«LaTeX que ha
  salido como texto»— pero se tarda menos en evitarlo: **al partir una
  fórmula entre dos líneas, la segunda nunca empieza por un signo menos**;
  se recoloca el corte o se pasa a `$$…$$`.

  **Y no es solo el menos: en Markdown abren lista `-`, `*` y `+`.** El 3 de
  septiembre de 2026 volvió a caer el suelo por lo mismo con un `+ ` — una
  raíz partida como `$\sqrt{11471{,}5^{2}` y `+ 332{,}5^{2}}$` en la línea
  siguiente. La regla completa: **la continuación de una fórmula no empieza
  nunca por `-`, `*` ni `+`.** Y hay una forma de no tener que acordarse: si
  la fórmula no cabe en una línea, va en `$$…$$` con las vallas en línea
  propia, que es la forma que el corpus usa para todo lo demás.

  **Y pasó dos veces el mismo día**, las dos con un `NPSH` y las dos
  costando un suelo entero de doce minutos. El guardián está bien donde
  está —`verify.mjs` lo caza— pero conviene barrer antes de lanzarlo: se
  cargan los YAML, y en cada cadena se cuentan los `$` línea a línea; si
  una línea deja una fórmula abierta y la siguiente empieza por `- `, ahí
  está. Veinte líneas, y devuelve el fichero y el campo.
- **Una `\frac{…}{…}` partida justo entre las dos llaves confunde a
  `recalcula`.** El corpus corta las fórmulas a 80 columnas, y si el corte cae
  entre el `}` del numerador y el `{` del denominador, `expresionAntesDe` se
  queda **solo con el denominador**: avisa de que «4,6225·10⁻¹⁰ no vale
  1,663·10⁹», que es verdad y no significa nada. Pasó el 7 de septiembre de
  2026 con el Grashof del ejercicio de Churchill y Chu. Cortar por el
  numerador sí funciona, así que la regla es corta: **la `\frac` se parte
  dentro de una llave, nunca entre las dos.** Y si no cabe, se deja la línea
  larga: ochenta columnas es una costumbre, un aviso falso cuesta diez
  minutos.
- **Un enunciado puede pedir un teorema o un método sin nombrarlo, y entonces
  ninguna búsqueda de texto lo encuentra.** Es la trampa que más recuentos ha
  estropeado, porque falla siempre **por defecto**: uno busca, sale cero, y se
  queda tranquilo publicando una ausencia. Los dos casos del 10 de septiembre
  de 2026, encontrados el mismo día y por caminos distintos:

  - El ejercicio 2 de la ordinaria de 2016-2017 pide demostrar el teorema del
    valor intermedio **enteramente en símbolos** —«$\forall H\in[m,M]\
    \exists x\in[a,b] / y(x)=H$»—, sin la palabra «teorema», sin «Bolzano» y
    sin «valor intermedio». Una búsqueda por esos tres términos da cero, y la
    ruta publicaba correctamente «dos ordinarias» porque el recuento se había
    hecho a mano. Es decir: **el guion habría empeorado el dato**.
  - El ejercicio 5 de la tercera de 2018-2019 es integración numérica —ordenar
    la suma por el extremo izquierdo, la del derecho y el valor exacto— y no
    nombra ningún método. Ahí sí ganó el guion: tres rutas llevaban meses
    publicando «un solo enunciado pide un método numérico» cuando son dos.

  La regla, entonces, no es «busca mejor»: es **busca por el concepto y por su
  descripción, y cuando el resultado sea un cero, ábrelo antes de publicarlo.**
  Un cero es la única cifra que no se puede comprobar leyendo lo que ha salido.
  Y su hermana práctica: al medir sobre `enunciado`, **quita las figuras**
  —`<figure>…</figure>`—, porque el `<desc>` de un SVG redibujado dice
  «trapecio» y «punto medio» hablando de geometría. En el barrido de ese día
  eran dos falsos positivos de tres.

- **Un `grep` por líneas no ve una frase partida dentro de un bloque YAML.**
  Los valores `|` y `>-` se escriben a 80 columnas, así que «Da cuatro
  decimales.» puede estar como «Da\n cuatro decimales.» y `grep "Da cuatro
  decimales"` devuelve cero. El 28 de agosto de 2026 eso hizo que una auditoría
  concluyera «cero enunciados ordenan dar decimales» cuando eran 32. **Regla:
  para contar cualquier cosa dentro del contenido se carga el YAML y se busca
  sobre la cadena ya parseada, nunca con `grep` sobre el fichero.** Vale igual
  para los decimales, que van en LaTeX: `0{,}42865` no lo encuentra un `grep`
  de `0,42865`.

  **Y cargar el YAML tampoco basta**, que es la segunda mitad de la misma
  trampa y costó tres números publicados mal el 6 de septiembre de 2026. Un
  bloque `>-` o `|` **conserva los saltos de línea** con los que se escribió,
  así que la cadena ya parseada trae «curva característica de la\ninstalación»
  y una expresión regular con la frase seguida no casa. Salieron cinco
  convocatorias donde había seis, y cuatro donde había diez — el error es
  siempre **por defecto**, que es el peor sentido: uno se queda tranquilo. La
  regla completa: se carga el YAML **y se normalizan los espacios**
  —`.replace(/\s+/g, ' ')`— antes de buscar cualquier frase de más de una
  palabra.
- **Una anchura de texto medida en el navegador no es reproducible entre
  máquinas.** La misma etiqueta SVG midió 285 unidades con la tipografía del
  sitio cargada y 315 en otro entorno, y en el segundo se salía del `viewBox` y
  en el primero no. Si `humo.mjs` da verde y alguien aporta una captura donde
  el texto se corta, no se están contradiciendo: están midiendo con fuentes
  distintas. **Regla: al informar de un desbordamiento de texto se dice con qué
  familia se midió**, y al dejar margen en un `viewBox` se cuenta con que la
  fuente puede no haber cargado todavía.

  **Y la forma de que no vuelva: `textLength` con `lengthAdjust="spacingAndGlyphs"`.**
  Fijar el ancho hace que la caja mida lo que dice el atributo **en cualquier
  fuente**, así que la comprobación deja de depender de la máquina. Se pone en
  las etiquetas largas —las de dos o tres términos con raíces— y se elige un
  valor cercano al natural para no deformar los glifos.
- **Astro acota los estilos, así que un elemento creado por el script se
  publica sin ninguno.** Cada regla de un `<style>` de `.astro` se compila con
  un `data-astro-cid-…` añadido al selector, y ese atributo lo pone el
  compilador en el marcado del componente — no en lo que crea el navegador con
  `createElement`. El 2 de septiembre de 2026 el chip «simulador» del índice
  salió publicado como texto pegado a la última palabra del título, sin caja ni
  color, y la regla estaba escrita y era correcta. **Regla: todo lo que el
  script cree en tiempo de ejecución se estiliza con `:global(...)`**, y se
  comprueba mirando, porque no falla nada: el elemento está, se lee, y solo se
  ve mal.
- **Ocultar un texto no es lo mismo que no tenerlo: `opacity: 0` sigue
  midiendo.** Un `<text>` invisible conserva su caja, así que sigue contando
  para el guardián de `viewBox` — y, peor, sigue diciendo lo que diga si
  alguien lo lee con un lector de pantalla. Pasó el 1 de septiembre de 2026 en
  el simulador de canales: el rótulo de la banda se apagaba en el semicírculo
  y su caja seguía ahí, escrita «de 0,0 a 0,0» y saliéndose por la izquierda.
  **Regla: para quitar un texto se le pone `textContent = ''`**; la opacidad
  se reserva para lo que sí sigue estando, como una curva de referencia.
- **Las figuras no se escriben a mano: se calculan.** Desde el 17 de
  septiembre de 2026 vive en `scripts/figuras/` un lienzo —`lienzo.mjs`— que
  convierte coordenadas de la asignatura en píxeles y emite el SVG con la
  receta de siempre: `<title>` y `<desc>` que se leen solos, clases
  prefijadas, rótulos con halo de papel. Cada tema tiene su generador
  (`calculo-t01.mjs`, …) y `pegar.mjs` mete el resultado en el paso `dibujar`
  que le toca sin tocar el resto del YAML. Tres cosas que impone y que no se
  negocian:

  1. **Nada se sale del `viewBox`, tampoco un rótulo.** El marco se comprueba
     al generar, con la caja del texto estimada por lo alto, y el error dice
     qué rótulo se sale y por dónde. Antes eso lo cazaba `humo.mjs` media hora
     más tarde, o no lo cazaba nadie.

     Y **por lo alto quiere decir con margen de verdad**: el paso de la fuente
     mono no es el mismo en todas las máquinas. Con 6,7 píxeles por letra las
     figuras cabían en Windows y tres se salían en el CI —veintisiete letras
     que aquí medían 181 píxeles allí medían más de 205—. Se mide con 7,9, se
     rechazan algunas que en realidad cabrían, y eso es lo correcto: mover un
     rótulo cuesta un minuto y uno recortado en producción no lo ve nadie
     hasta que un alumno no entiende el dibujo. La lección general: **un
     guardián que solo vale en la máquina de quien lo escribió no vale.**
  2. **Ni un `#rrggbb`.** Solo tokens, porque hay tres temas y
     `check-color.mjs` los mide todos.
  3. **Las figuras repetidas se copian, no se reescriben.** Nueve ejercicios de
     examen piden el mismo dibujo que un ejemplo de su tema; `reetiqueta()`
     copia la figura cambiándole el prefijo de ids. Escribirla dos veces es
     tener dos versiones que algún día dejarán de coincidir.
  4. **En el pie de una figura no hay Markdown.** El `<figcaption>` se emite
     tal cual y no pasa por `mate()`, así que un `**así**` se publica con los
     asteriscos a la vista. `verify` lo caza —lo ha cazado dos veces, el 17 de
     septiembre de 2026 en `ej-inversa-con-signo` y en `la-integral-de-gauss`—,
     pero llega después de construir el sitio entero: más barato es escribir
     el pie en prosa llana desde el principio. El énfasis, si hace falta, va
     en el texto del ejercicio, que sí se procesa.

  5. **Ni en el `titulo` de un paso hay LaTeX.** Es el mismo defecto por
     otro sitio: el título se emite tal cual, así que un
     `titulo: El coeficiente de $x^3$` se publica con los dólares a la
     vista. Pasó el 17 de septiembre de 2026 en
     `componer-tres-desarrollos-conocidos`, y lo cazó `verify` después de
     construir las 249 páginas. Un título de paso es una etiqueta corta en
     prosa —«El coeficiente del término cúbico»—; la fórmula va en la
     `pregunta`, que sí pasa por `mate()`.

  6. **La etiqueta de apertura del `<svg>`, en un solo renglón.** Un `<svg>`
     suelto —el de la `figura` de un paso `dibujar` no lleva `<figure>`
     alrededor— solo abre un bloque de HTML crudo en Markdown si su etiqueta
     cabe entera en la primera línea. El lienzo la escribía en dos, y del 17
     al 29 de septiembre de 2026 se publicaron así **94 de las 98 páginas**
     con una figura de `dibujar`: el `<svg>` vacío dentro de un párrafo y el
     título, la descripción y los rótulos a la vista como texto. El guardián
     de `verify` solo miraba dentro de `<figure>`, y todo daba verde. Lo vio
     un agente que dibujaba las suyas en una línea y comparó. Desde ese día
     el lienzo la escribe en una, `pegaElSvg` la pega igualmente si llega
     partida, y `verify` mira la página entera.

  Para mirarlas antes de pegarlas, `previsualiza.mjs` monta un contact sheet
  en PNG con todas las de un generador, en claro o en oscuro. Eso sigue siendo
  §16: lo que caza un error de dibujo es mirar la captura.
- **Una figura de ejercicio se dibuja a la escala del resultado, no «a
  ojo».** Al redibujar el enunciado 2.19 —un tubo cerrado que mide el nivel
  comprimiendo su aire— el agua de dentro del tubo se puso, esquemáticamente,
  más alta que la de fuera. Es exactamente lo contrario de lo que pasa, y era
  además **la idea entera del problema**: el aire comprimido impide que suba.
  Los números ya estaban calculados —1,44 m dentro contra 5 fuera— y no se
  usaron para dibujar.

  Nada lo cazó: el SVG era válido, los tokens correctos, el `viewBox` sin
  desbordes, y `verify` y `humo` en verde. Lo cazó mirar la captura (§16). La
  regla: **si has resuelto el problema, la figura se construye con esos
  números** —una escala de píxeles por metro y las cotas calculadas—, porque
  una figura esquemática es una segunda oportunidad de afirmar algo falso.
- **Una escala fija convierte una figura correcta en una figura ilegible.**
  El simulador del tema 7 encuadraba siempre 22 m de profundidad, así que una
  compuerta de 3 m hundida a 14 salía de cuarenta píxeles y no se veía ni el
  prisma ni los dos puntos que hay que comparar. Nada estaba mal calculado y
  nada lo cazó: `verify` y `humo` dan verde con una figura minúscula. **Regla:
  al dibujar una escena con un mando que cambia su tamaño, la escala se calcula
  cada vez a partir de lo que hay que enseñar**, y lo que informa es entonces
  la *forma* —el prisma pasa de triángulo a rectángulo—, no el tamaño.
- **Una normal apunta hacia arriba en cuanto la placa se inclina.** El prisma
  de presiones se dibuja perpendicular a la compuerta, y con la compuerta a
  35° la flecha del borde superior salía **por encima de la lámina libre**:
  una figura que dice que hay agua donde no la hay. Se caza mirando, no
  midiendo. **Regla: toda construcción perpendicular lleva su tope contra los
  bordes físicos de la escena** —la lámina, la solera—, no solo contra el
  `viewBox`.
- **El humo corrige las transformadas y `getBBox()` no.** Si escribes un
  guion propio para comprobar desbordes, un rótulo con `rotate(-90 …)` te dará
  un falso positivo: `getBBox()` devuelve la caja **sin** transformar. Hay que
  pasar las cuatro esquinas por `el.getCTM()`, que es lo que hace
  `scripts/humo.mjs`. Un falso positivo es caro por lo que esconde: mientras
  se le da vueltas, el desborde de verdad de otro estado pasa desapercibido.
- **`astro preview` es un demonio y sobrevive al guion que lo arrancó.** Si te
  quedas uno levantado —de una captura, de una prueba en el navegador—,
  `humo.mjs` no puede arrancar el suyo y muere con «El servidor de vista
  previa no ha arrancado en 30 s», que **no dice cuál es la causa**. Y hay una
  variante peor: si el puerto está libre pero el demonio sigue vivo en otro,
  el barrido puede arrancar y caerse a media ejecución sin marcar ningún
  fallo — pasó el 6 de septiembre de 2026, con 399 líneas todas en verde y un
  código de salida 4 que no significaba nada. **Regla: `astro preview stop`
  antes de lanzar el humo**, y si un barrido se cae sin un solo `✗`, mira si
  hay un servidor tuyo dando vueltas antes de buscar el fallo en el sitio.

  **Y lo contrario también rompe: dos guiones que levantan servidor, a la
  vez.** Cada uno para cualquier `astro preview` al arrancar, incluido el del
  otro, y el que iba primero se cae a media pasada con `ERR_CONNECTION_REFUSED`.
  Pasó el 24 de septiembre de 2026 al lanzar un humo mientras corría el suelo:
  fallos fantasma en páginas que estaban bien. Desde el 26 los cinco guiones
  que abren el navegador arrancan el servidor con el mismo `servidor.mjs`, y
  la regla es corta: **mientras corre el suelo, no se lanza nada que abra un
  navegador.**

  **Y una tercera forma de rojo que no es del sitio**, vista el mismo día: una
  página suelta que falla con `ERR_NETWORK_ACCESS_DENIED` a media barrida, con
  las 4.183 líneas restantes en verde. No era la página —abierta a mano
  devuelve 200, sus siete ejercicios y cero errores de consola—, era un
  tropiezo de red del propio navegador. **Cómo distinguirlo de un fallo de
  verdad, y es rápido:** un fallo del sitio se repite; uno de entorno no. Si
  el rojo es una sola página y su mensaje es de red y no de contenido, ábrela
  a mano antes de tocar nada. Lo que **no** vale es dar el barrido por bueno
  sin comprobarlo: eso es cómo se aprende a ignorar un guardián (§11).

- **El humo abre una muestra rotatoria de exámenes elegida por el día del año,
  así que un fallo latente aparece cualquier mañana sin que nadie haya tocado
  nada.** El 31 de agosto de 2026 el CI se puso rojo con el suelo local en
  verde: le tocó el turno a `2015-2016-ext`, cuya figura del semicírculo tenía
  dos etiquetas fuera del `viewBox` **desde el día que se escribió**. El commit
  que lo destapó era de Fluidos y no tenía nada que ver.

  Dos consecuencias prácticas. Una: **un CI rojo no significa que lo tuyo esté
  mal** — mira qué página falla antes de tocar tu cambio. Y dos: el verde de
  `npm run suelo` cubre la muestra de hoy, no el sitio entero; **para eso está
  `npm run humo:todo`**, y conviene pasarlo una vez por tanda de
  trabajo, no una vez por commit.

- **Un guardián puede dar verde sobre menos sitio del que dice, y eso no se ve
  nunca.** El filtro con el que `humo.mjs` elige qué páginas abrir decía
  `\/[a-z]+\/` para el nombre de la asignatura — **sin guion**. Las dos
  asignaturas cuyo `slug` lo lleva, `fundamentos-quimicos` e
  `ingenieria-termica`, no casaban jamás. Medido el 7 de septiembre de 2026
  sobre una barrida completa: **169 páginas abiertas, cero de Térmica y
  ninguno de los diez temas de Química**. Los veinte temas y las tres rutas
  de las dos asignaturas más nuevas del sitio **no los había abierto un
  navegador nunca**, y la barrida terminaba con «Navegador: en verde».

  Lo que lo hace peor que un fallo normal es que **no falla**: no hay rojo que
  investigar, solo un verde más barato de lo que parece. Y se coló por el
  sitio donde uno menos mira, que es la línea que elige el trabajo, no la que
  lo hace.

  Dos cosas salen de aquí. Una: **desde hoy la barrida imprime cuántas páginas
  abre de cada asignatura**, porque un cero en esa línea delata el agujero sin
  que tenga que fallar nada — es la comprobación que hoy habría bastado. Y
  dos, la regla general: **cuando un guardián recorre un conjunto, el tamaño
  de ese conjunto es un dato tan publicable como su resultado**, y hay que
  mirarlo. «Ha pasado» no significa nada si no sabes sobre cuántos.

  Y una tercera, de método, que costó una barrida entera: al arreglarlo,
  anclar el otro filtro —el de los índices `…/examenes/`— con `^` lo dejó en
  **cero exámenes**, porque `/algebra/examenes/` tiene dos segmentos y no uno.
  De 169 páginas a 90. **Un arreglo que cambia cuántas cosas mira el guardián
  se comprueba contando otra vez**, no leyendo el `diff`.

  **Y el 10 de septiembre de 2026 volvió a pasar en su forma más difícil de
  ver: la exclusión estaba razonada, y lo que había caducado era el motivo.**
  El filtro dejaba fuera los cuatro índices `…/examenes/` con este comentario
  al lado: «no entra, no tiene ejercicios». Era verdad. Pero un ejercicio no
  es lo único que se puede publicar mal, y ese día aparecieron ahí **siete
  marcas de negrita en crudo** —el `lede` de cada ruta se pinta dentro de un
  `<a>`, donde `mate()` no cabe—. Cuatro páginas que la portada enlaza, que un
  alumno abre, y que **ningún navegador había abierto nunca**, con la barrida
  diciendo «en verde» sobre 192. De 192 a 196, contadas otra vez y con la
  subida repartida como debía: una por asignatura, salvo Térmica, que no tiene
  índice de exámenes porque no tiene exámenes.

  La regla que sale, ya con dos casos y en su forma corta: **cuando excluyas
  algo de un guardián, el comentario dice qué clase de fallo no puede tener
  eso que excluyes** — no «no hace falta mirarlo». Escrito así, el día que
  aparece otra clase de fallo el comentario se relee solo. Escrito como
  estaba, la exclusión sobrevive a su motivo y nadie la vuelve a mirar.
- **`| tail` en un guardián largo te quita justo la línea que hay que leer.**
  El recuento de páginas que la regla de arriba manda mirar lo imprime
  `humo.mjs` **al principio**, antes de abrir nada. El 11 de septiembre de 2026
  se lanzó la barrida completa con `| tail -40` para no llenar la pantalla, y
  eso hizo dos cosas a la vez: guardar solo las últimas cuarenta líneas de
  4.866 —tirando el recuento— y **no mostrar nada durante veinte minutos**,
  porque `tail` no emite hasta que el proceso muere. Veinte minutos sin saber
  si el guardián avanzaba o estaba colgado, y al final un verde sin el dato que
  lo hace verificable. Hubo que repetir la barrida entera.

  **Regla: la salida de un guardián largo va a un fichero completo**
  —`node scripts/humo.mjs > salida.txt 2>&1`— y de ahí se leen las dos puntas:
  el `head` para el tamaño del conjunto y el `tail` para el veredicto. Nunca
  se poda por el camino, porque lo que se poda es siempre el principio y el
  principio es donde está el recuento.
- **Insertar delante de un elemento de lista YAML deja su campo huérfano.** Si
  un elemento es `- id: X` seguido de su `nota:`, y sustituyes solo la línea
  `- id: X` por «`- id: X` + tu nota + tu elemento nuevo», la `nota` original
  queda pegada al **último** elemento insertado, que ya tiene la suya: clave
  duplicada. Pasó tres veces el 28 de agosto de 2026. `js-yaml` lo caza —el
  build falla con «duplicated mapping key» y la línea exacta—, pero se tarda
  menos en evitarlo: **para insertar antes de un elemento, ancla la sustitución
  en el elemento anterior completo, con su `nota`, no en la línea del `- id:`.**
- **El prefijo `ex` de un id de examen no es una costumbre: está escrito dentro
  de un guardián.** La regla de convocatorias huérfanas de `verify.mjs` busca
  los ids con `/id:\s*(ex[a-z0-9-]+)/`, así que un ejercicio de examen cuyo id
  no empiece por `ex` **no existe para ella**. Salió el 10 de septiembre de
  2026 al montar la primera convocatoria de Térmica: sus siete ejercicios
  llevaban el prefijo de tema, `ejter-`, porque hasta ese día colgaban de su
  tema y no de una convocatoria, y el guardián dio «sus **0** ejercicios no los
  enlaza ninguna ruta» sobre una convocatoria cuyos siete estaban enlazados.
  Renombrados a `exter2526-ord-<n>-…`, que es la forma de las otras 118. **La
  lección no es el prefijo: es que una convención que un guardián da por
  supuesta hay que escribirla donde se lea**, porque el día que se rompe el
  mensaje de error habla de otra cosa.
- **Un id de ejercicio inventado suena igual que uno real.** Los ids llevan el
  curso, la convocatoria y el número, así que `ex2021-ext-3-el-polinomio-de-taylor`
  parece correcto y el real era `ex2021-ext-3-el-mclaurin-de-una-integral-sin-primitiva`.
  Si el ejercicio ya está enlazado desde otra ruta no aparece en la lista de
  sueltos, y es justo entonces cuando se tiende a escribirlo de memoria. **El
  id se copia del `ejercicios.yaml`, siempre.** El build lo caza —«referencia el
  ejercicio X, que no existe»—, pero una ruta enlazando el ejercicio equivocado
  **no lo caza nadie**, y eso es §13 caso 2.
- **~~El esquema no tiene `unidad`~~ · resuelto el 30 de agosto de 2026.** Lo
  que entró no es un campo `unidad` sino un **tipo de respuesta**,
  `magnitud`, con su lector en `src/lib/unidades.ts` y 20 casos en
  `tests/unidades.test.ts`. La diferencia importa: un campo `unidad` al lado
  de un número compara textos —«1 bar» y «100 kPa» serían respuestas
  distintas, y «2 m/s» valdría como caudal—; un tipo propio compara **por
  dimensión**, convirtiendo las dos a unidades base del SI.

  Tres decisiones que conviene no volver a discutir:

  1. **La tolerancia de `magnitud` es relativa** (0,02 = 2 %), al revés que
     en los otros tipos. Lo pide el ábaco de Moody: media respuesta de
     fluidos sale de leer una curva a ojo, y exigir cuatro cifras es exigir
     que el alumno y quien escribió el ejercicio lean el mismo píxel.
  2. **Tres errores, tres diagnósticos.** Número bueno sin unidad (descuido),
     unidad de otra magnitud (confusión conceptual, la grave) y número malo
     no son el mismo fallo, y el comparador devuelve cuál ha sido. Los dos
     primeros mensajes están en `EjercicioGuiado.astro` y **no hay que
     declararlos como distractor en cada ejercicio**.
  3. **Si la respuesta es adimensional, el tipo es `numero`.** Un Reynolds o
     un rendimiento no llevan unidad, y el esquema rechaza una `magnitud`
     sin unidad precisamente para que nadie la use como número con adorno.

  Y dos cosas que la tabla de unidades tiene que saber de **esta** escuela,
  porque no son estándar:

  - **`kg/cm²` es una presión**, no una masa por unidad de área: ese «kg» es
    un kilopondio, igual que el «pesa 50 kg» del tema 1. Los enunciados la
    usan sin avisar («la lectura del vacuómetro es de 0,4 kg/cm²»). Está como
    unidad compuesta, no como regla general, para no romper una densidad
    superficial de verdad el día que aparezca.
  - **La gravedad de la tabla es 9,8, no 9,80665.** Es la que usan los
    apuntes y todas las soluciones oficiales, y con ella salen exactamente
    sus conversiones publicadas: 1 mca = 9800 Pa, 1 kg/cm² = 10 mca,
    1 bar = 10,2 mca. Con la estándar la tabla quedaría descuadrada respecto
    de la fuente por un 0,07 %.

  La tabla se amplía cuando un enunciado trae una unidad que no está, y eso
  **lo caza el contenido, no la revisión**: al escribir el tema 2 seis
  respuestas correctas salieron «no he entendido» porque faltaba el
  poiseuille. Cuando pase, se añade la unidad **y su caso en
  `tests/unidades.test.ts`**.
- **`pdftotext` sin `-enc UTF-8` se come los signos.** Los exámenes escritos con
  el editor de ecuaciones de Word ponen el menos, el ≤ y el ∈ en fuente
  **Symbol**, y con la codificación por defecto salen como un espacio: el
  volcado dice `|z| = |1  z|` y no hay forma de saber si era suma o resta. Con
  `-enc UTF-8` aparece `1 − z`. Pasó el 26 de agosto de 2026 en la
  extraordinaria de 2017-2018, donde las dos lecturas daban respuestas
  distintas y las dos eran plausibles. Y renderizar la página **no** lo
  arregla: si la máquina no tiene la fuente Symbol, `pdftoppm` tampoco dibuja
  el signo, y encima avisa con un `Syntax Error: No display font for 'Symbol'`
  que es fácil dar por ruido. **Regla: el volcado de un examen se hace siempre
  con `pdftotext -enc UTF-8 -layout`, y la imagen se usa para la disposición,
  no para los signos.** Y al revés para los boletines con matrices: el volcado
  de texto destroza las matrices y la imagen las conserva; ahí manda la
  imagen y el texto solo sirve para los signos.
- **En esta máquina hay dos `pdftotext`, y no vuelcan igual.** El de Git
  (`mingw64`) es el de **xpdf 4.06**; el que instaló winget es **poppler
  25.07**, y es el que encuentra PowerShell, y por tanto el suelo. El CI
  instala poppler. El 30 de septiembre de 2026 el guardián de las notas
  impresas daba las 37 dentro desde Git Bash y una fuera en el suelo: poppler
  no deja línea en blanco entre la nota del 1 de la ordinaria de 2025 y su
  «DATO:», y la regla solo cortaba en «DATOS». Mientras avisaba no se vio;
  al pasar a bloquear, paró el suelo. **Regla: lo que dependa del volcado se
  prueba con los dos** (`PATH="<poppler>/bin:$PATH"` delante del comando), y
  si discrepan, manda poppler, que es el del CI.
- **El volcado no es la página.** Lo que `pdftotext` no saca puede estar
  impreso igual: un texto metido como imagen no aparece en el volcado, y el
  volcado no avisa. La auditoría externa del 27 de septiembre de 2026 encontró
  **seis asignaturas** con material que el proyecto daba por inexistente por
  haber mirado solo el texto extraído. Las dos más caras: cinco convocatorias
  de Mecánica Aplicada publicadas como «solo en euskera», que son bilingües
  —el castellano va en la columna derecha, **cada palabra una imagen**—, y una
  ruta de Térmica que decía «la colección no trae ni un problema de
  exergía» cuando las diapositivas del tema 7 traen los ejercicios 7.1 a 7.14
  resueltos, también como imagen. Es la misma lección que la del idioma de
  Térmica del 10 de septiembre —mirar una página no es mirar el documento—,
  un escalón más abajo: **mirar el volcado no es mirar la página.** **Regla:
  si una columna sale vacía, si `pdfimages -list` da imágenes donde debería
  haber texto, o si el volcado trae menos de lo que el nombre del fichero
  promete, se renderiza la página (`pdftoppm -r 150`) antes de afirmar que
  falta algo. Y un «no hay», un «falta» o un «no se reproduce» se escribe
  citando la página renderizada que lo comprueba.**
- **Una tilde dentro de `$…$` se dibuja, y avisa en cada build.** KaTeX pinta
  perfectamente `P_{útil}` o `k_{válv}` —no hay error, no queda ningún `$`
  suelto, el suelo da verde— pero emite un `unicodeTextInMathMode` por consola
  cada vez que se compila, y ese ruido tapa a los avisos que sí señalan algo
  roto. El 4 de septiembre de 2026 había **22 repartidos por nueve ficheros**.
  El arreglo es `P_{\text{útil}}`, que además es la tipografía correcta: un
  subíndice que es una palabra va en redonda, no en cursiva.

  Lo caza `revisa-ejercicios.mjs` desde ese día, y **la forma de cazarlo tiene
  su propia lección**: se hace **escuchando a KaTeX** —interceptando su
  `console.warn`— y no emparejando `$` con una expresión regular. La versión
  de regex daba 34 falsos positivos sobre el corpus entero, todos de prosa
  atrapada entre dos fórmulas distintas de la misma línea. Es el mismo error
  que §17 ya avisa para `grep`: **no adivines la estructura, pásala por el
  procesador de verdad.**
- **El símbolo del euro no se puede dibujar dentro de una fórmula.** KaTeX
  tiene sus propias fuentes (§07) y el `€` no está en ellas: ni suelto ni
  dentro de un `\text{…}`. Pasó el 31 de agosto de 2026 con un coste de
  bombeo escrito como `\text{€/m}^{3}` en dos sitios del mismo ejercicio.
  Lo caza `verify.mjs` —«KaTeX no sabe dibujar ese símbolo dentro de $…$»—
  pero cuesta un suelo entero: **la unidad monetaria se saca de la fórmula
  y se dice en la prosa de al lado** («Es decir, 0,0434 €/m³»). Vale para
  cualquier símbolo que no sea matemático.
- **En el pie de una figura no hay fórmulas.** Dentro de un `<figure>` el
  procesador deja pasar el HTML tal cual, así que un `$h$` en el
  `<figcaption>` se publica **con los dólares a la vista**. Lo curioso es que
  el **negrita sí funciona** —`**así**` sale como `<strong>`—, y eso engaña:
  se prueba una cosa, se ve que va, y se da por hecho que va todo. Hay un
  guardián en `verify.mjs` que lo caza, y aun así costó un suelo el 1 de
  septiembre de 2026 escribiendo las primeras figuras de ejercicio de
  Fluidos. **Regla: en un pie, las variables van en negrita o en texto
  llano** —«la cota **h**», «respecto de O»—, y la fórmula, si hace falta, en
  la prosa de fuera.
- **Un `var(--token)` que no existe no da error: pinta negro.** Es peor que un
  color literal, porque el literal al menos se ve y `verify.mjs` lo cazaba
  desde el principio. Un token inventado invalida la declaración, la propiedad
  cae a su **valor inicial** —y el inicial de `fill` es negro—, así que la
  figura sale bien en claro y en oscuro deja las etiquetas en negro sobre
  fondo casi negro. El 1 de septiembre de 2026 había **148 usos de
  `--ink-suave` y `--linea`, ninguno de los dos definido**, repartidos por 22
  de las 23 figuras de Fluidos. Lo caza la regla **2 ter** de `verify.mjs`
  desde ese día, y esa regla mira también los `.yaml` porque ahí viven las
  176 figuras de ejercicio de Cálculo. **Regla: un token nuevo se define en
  `tokens.css` antes de usarlo, y si ya existe uno que significa lo mismo, se
  usa ese** — dos nombres para un color es la Regla 0 con otra cara.
- **«No encaja en el formato» es la razón más fácil de escribir y la que menos
  se revisa.** El ejercicio 9 de la ordinaria de Fluidos 2025-2026 —un
  «rellenar los espacios» de ocho huecos sobre turbomáquinas— llevaba en
  `fuera` desde que entró la convocatoria, con el motivo «sin ningún cálculo, y
  el esquema exige un paso de cálculo». Era verdad y estaba mal pensado por dos
  sitios: un paso de cálculo puede **contar** en vez de operar, y sobre todo
  **el propio enunciado traía una cuenta** que nadie había mirado — avisa de
  que cada fallo resta lo mismo que suma un acierto, y de ahí sale cuándo
  compensa dejar un hueco en blanco, que es lo más útil del ejercicio.

  **Regla: un `fuera` cuyo motivo sea de formato y no de material se relee
  entero antes de darlo por bueno**, y se relee el enunciado, no el motivo.
  Los motivos de material —falta una tabla, falta una figura acotada, la
  respuesta publicada no se reproduce— envejecen bien porque describen algo
  ausente; los de formato describen una limitación **nuestra**, y esas cambian.

  Al aplicarla al resto de los `fuera` de Fluidos solo había otro caso, el
  ejercicio 7 de 2020-2021, y ese sí se queda: su enunciado no trae ninguna
  cuenta ni escondida. Su motivo también estaba mal escrito —daba una razón
  que no era la buena— y se ha corregido. **Que la regla nueva confirme un
  «no» es tan resultado como que desbloquee un «sí»**; lo que no vale es no
  volver a mirar.

  **Y los motivos de material tampoco envejecen bien.** La frase de arriba
  sobre los de material se escribió el 5 de septiembre de 2026 y la desmintió
  la fase I, el 30. De los trece ejercicios de Fluidos que estaban en
  `fuera`, doce tenían un motivo de material —«la figura no acota», «falta
  la tabla», «son cartas de catálogo», «el resultado publicado no se
  reproduce»— y **los doce eran falsos**. La tabla de aceites estaba en la
  imagen incrustada de la página; las cotas del elevador y de los depósitos
  anidados, en la figura a 300 ppp o en los datos del enunciado; las curvas
  de catálogo se leen y se tabulan sin reproducir la hoja; y los resultados
  «irreproducibles» salían en cuanto se leía bien la figura. El único que se
  queda es el 7 de la final de 2021, por formato: se volvió a leer entero y
  no trae ninguna cuenta, y su motivo enlaza ahora la prosa de los temas 12,
  13 y 23, que enseña lo que pregunta. Lo que envejece bien no es el tipo de
  motivo, es haberlo comprobado sobre la página renderizada —«El volcado no
  es la página», en esta misma lista—.

  **Regla: todo `fuera` se relee contra la página renderizada, a 300 ppp si
  hay figura, antes de darlo por bueno, sea de formato o de material.**

- **Un fichero sin extensión no sale en ninguna búsqueda por tipo, y ahí puede
  haber una convocatoria entera.** El 5 de septiembre de 2026 se dio por
  cerrado el inventario de exámenes de Química en cinco, encontrados con un
  `find … -iname "*.pdf"`. Horas después, rastreando otra cosa, apareció un
  fichero llamado **`1C_Control` a secas** —sin `.pdf`— que era una sexta
  convocatoria completa: cinco ejercicios, diez puntos, y el único ejercicio
  de todo el corpus que pide un ciclo de Born-Haber.

  **Regla: el inventario de una asignatura se cierra listando el directorio
  entero**, no buscando por extensión, y comprobando el tipo real de lo que no
  encaje —`file` lo dice por el contenido, no por el nombre—. Es barato y el
  coste de saltárselo es publicar una asignatura a la que le falta un examen
  sin que nadie lo eche en falta.

  Y de propina destapó dos frases falsas publicadas —«cae en las cinco
  convocatorias» en el catálogo, «abre los dos exámenes» en otro tema—, las
  dos escritas a ojo y una de ellas falsa ya el día que se escribió. Es la
  cuarta vez que este proyecto se come lo mismo, así que conviene decirlo en
  su forma más corta: **si una frase publicada lleva un número, ese número se
  cuenta con un guion antes de escribirlo.**

- **La `e` de `1.8e-5` se leía como el número de Euler, y no daba error: daba
  otro número.** El lector de respuestas evaluaba `1.8e-5` como
  $1{,}8 \times e - 5 = -0{,}107$, un valor perfectamente finito. Así que un
  alumno que escribía la constante de acidez **bien** recibía «no es
  correcto» y ninguna pista de por qué. En Química eso no es un caso raro: es
  cómo se teclea toda Ka, Kb, Kp y Kw.

  Y lo peor no es el fallo, es cómo se llegó a él. **El mismo bug se había
  arreglado esa misma mañana en `recalcula.mjs`** —el potencial normal
  `E^{0} = 0{,}249` se leía como Euler y daba un desajuste falso— y se
  arregló allí sin barrer los demás evaluadores. Allí producía un aviso falso
  a quien mantiene el proyecto; aquí rechazaba la respuesta buena de un
  alumno. **Regla: al arreglar un fallo de interpretación de texto, se busca
  el mismo patrón en todos los sitios que interpretan texto** —hay cuatro:
  `regiones.ts`, `complejo.ts`, `unidades.ts` y `recalcula.mjs`— y se dice en
  el commit cuáles se han mirado.

  El arreglo, en el lexer de `regiones.ts`: el exponente se consume solo si
  tras la `e` viene un signo opcional y **al menos un dígito**, así que `2e3`
  es 2000 y `2e` sigue siendo $2e$. Con ocho casos en
  `tests/respuesta-exacta.test.ts`, validados al revés.

  Y el barrido que la regla exige, hecho el mismo día y con su resultado:

  | lector | con `1.8e-5` | veredicto |
  |---|---|---|
  | `evaluaNumero` (`regiones.ts`) | daba **−0,107** | era el fallo · arreglado |
  | `leeComplejo` (`complejo.ts`) | devuelve `null` | falla **limpio**, y el `?? evaluaNumero` lo recoge |
  | `leeMagnitud` (`unidades.ts`) | lo lee bien | correcto ya |
  | `leeVector` · `leeMatriz` (`algebra.ts`) | devuelven `null` | limitación real, **demanda cero** |

  Los dos de Álgebra no se tocan, y eso es §13 y no pereza: sus respuestas son
  objetos exactos y no hay ni un decimal en su corpus (§11). Se arreglan el
  día que un ejercicio lo pida, no antes.

- **El esquema puede ser más estricto que el sitio, y entonces no protege
  nada.** Salió con lo anterior. `EjercicioGuiado` lee una respuesta numérica
  con `leeComplejo(t) ?? evaluaNumero(t)`, dos lectores en cadena; el
  `lector()` de `content.config.ts` llamaba **solo al primero**. Resultado:
  el build rechazaba respuestas que el navegador habría aceptado, y el aviso
  —«la respuesta correcta no se puede leer con el formato declarado»— sonaba
  a error de contenido cuando el contenido estaba bien.

  Cuesta encontrarlo porque el guardián falla en la dirección que parece
  segura: de más. **Regla: un guardián que simula al producto tiene que
  llamar exactamente a lo que llama el producto**, y si el producto encadena
  dos lectores, el guardián encadena los dos. Si los dos códigos divergen,
  eso ya es la Regla 0 (§01) con otra cara.

- **Un `<path>` sin `fill="none"` se rellena de negro, y solo se nota cuando
  el camino tiene codo.** El relleno por defecto de un `path` es negro, no
  transparente, y SVG cierra el contorno para rellenarlo aunque el camino
  esté abierto. Una flecha recta —`M235 40 L235 62`— no encierra área y no se
  ve nada; una flecha en ángulo —`M150 25 L92 25 L92 62`— encierra un
  triángulo, y ese triángulo sale pintado de negro sobre el papel. Pasó el
  5 de septiembre de 2026 en el árbol de decisión del tema 4 de Química:
  cuatro cuñas negras enormes tapando media figura, con `verify` en verde,
  el `viewBox` sin desbordes y todos los tokens definidos.

  Lo que lo hace traicionero es que el resto del corpus se libró por
  casualidad: las figuras anteriores usan `path` con codo solo dentro de un
  `<g fill="none">`, o para flechas rectas. **Regla: un `<path>` con `stroke`
  declara su relleno —propio o heredado de su `<g>`— siempre que pueda
  encerrar área**, y no se confía en que la forma sea recta hoy. Se caza
  mirando la captura, no midiendo: no hay error, no hay desborde y no hay
  token inventado.

  Lo caza `verify.mjs` desde ese día, regla **2 quater**, y **escribirlo
  costó dos rondas de falsos positivos que conviene tener anotadas**, porque
  las dos son la misma lección de §11 por sus dos lados. La primera versión
  miraba solo la etiqueta del `path` y dio nueve avisos, los nueve falsos:
  las figuras grandes de Cálculo agrupan sus curvas en un `<g fill="none">` y
  **el relleno se hereda**. Corregido con una pila de ancestros, quedaron
  seis, también falsos y por el motivo contrario: un trazo de un solo
  segmento recto, o varios sueltos separados por `M`, **no encierra área** y
  el relleno negro no pinta un píxel. La regla final solo avisa de un
  subcamino con curva, con cierre o con dos segmentos encadenados.
- **Un encabezado con LaTeX dentro produce un ancla que ninguna ruta puede
  enlazar.** `## El teorema $\pi$ de Vaschy-Buckingham` genera el id
  `el-teorema-πpiπ-de-vaschy-buckingham` —la salida de KaTeX es
  `htmlAndMathml` (§07), así que el símbolo dibujado, el texto y el MathML
  entran los tres en el slug—, y el esquema de `preparar` rechaza ese slug
  porque `π` no está en su clase de caracteres. El fallo no se ve en la
  página, que se dibuja perfecta: se ve el día que una ruta intenta apuntar
  ahí. Salió el 1 de septiembre de 2026 al escribir la ruta de Fluidos.
  **Regla: los `##` y `###` se escriben en texto plano.** Si hace falta el
  símbolo, va en la primera línea del apartado, no en su título — que es lo
  mismo que §17 ya pide para `titulo` y `fuente`, por el mismo motivo de
  fondo: **todo lo que se convierte en identificador es texto plano.**
- **El `$$` de una fórmula en bloque va en su propia línea, siempre.** El
  procesador de §07 dibuja esto:

  ```
  $$
  a = b + c
  $$
  ```

  y **no** dibuja `$$ a = b` en una línea con `= c $$` en la siguiente: ahí
  el primer `$$` se lee como dos delimitadores en línea, KaTeX se come el
  cierre y la fórmula se publica como texto crudo. El 2 de septiembre de 2026
  entraron así **27 fórmulas** en cinco ejercicios y tumbaron el suelo entero
  —doce minutos— con `verify.mjs` diciendo «LaTeX que ha salido como texto».
  Lo curioso, y lo que engaña: en **una sola línea** `$$ a = b + c $$` sí se
  dibuja, así que probar un caso corto no demuestra nada. El corpus entero
  usaba ya la forma con valla —cero apariciones de la otra en seis ficheros
  mirados— y esto fue romper la convención sin darse cuenta.

  Desde ese día lo caza `scripts/revisa-ejercicios.mjs`, que pasa cada campo
  de prosa por el procesador de verdad y mira si KaTeX ha devuelto un error:
  un segundo, contra los doce minutos del suelo. Validado al revés con el
  bloque original, que sale rojo en las tres fórmulas.

  > **Y hay dos formas de que una fórmula no se dibuje, no una.** La regla
  > vieja de `verify.mjs` buscaba un `$` suelto en el texto publicado, que es
  > lo que queda cuando el LaTeX **no llega** a KaTeX. Pero si llega y KaTeX
  > no sabe dibujarlo, no queda ningún `$`: queda un `katex-error`, o sea un
  > recuadro rojo con el LaTeX dentro, que es peor porque parece deliberado.
  >
  > Esa segunda forma no la miraba nadie. Al añadirla —3 de septiembre de
  > 2026— aparecieron **dos fallos que llevaban semanas publicados** con el
  > suelo en verde todas ellas: un `\boxed{` sin cerrar en una resolución de
  > Álgebra y un `$$…$$` partido en dos líneas en un examen de Cálculo.
  > Barridos los 22 228 campos con fórmula del contenido entero, eran los
  > únicos dos. Están arreglados y la comprobación vive ya en `verify.mjs` y
  > en `revisa-ejercicios.mjs`.
  >
  > La lección de método: **al escribir un guardián, comprueba que mira donde
  > está el fallo.** La primera versión de `revisa-ejercicios.mjs` recorría
  > los `texto` de las opciones y las piezas pero no sus `mensaje`, y el fallo
  > que motivó todo esto vivía justo en un `mensaje`.
- **`history.replaceState` no actualiza `:target`.** Es la trampa que produjo
  el único fallo grave de la auditoría externa del 4 de septiembre de 2026.
  La portada mostraba el detalle de una asignatura con
  `.detalle:target { display: block }` y cambiaba el hash con `replaceState`
  para no ensuciar el historial. Pero `:target` lo fija el navegador al
  navegar, y `replaceState` **no navega**: quien entraba en `…/#algebra` y
  pulsaba después otra asignatura veía **las dos a la vez**, y al volver se
  quedaba con la portada en blanco porque el héroe seguía oculto por la
  misma regla. Entrando **sin** hash no hay ningún `:target` y todo funciona,
  que es por lo que aguantó semanas sin que nadie lo viera.

  **Regla: si el JavaScript gobierna qué se ve, `:target` es solo el plan B
  de quien no tiene JavaScript, y las dos cosas no pueden mandar a la vez.**
  Se separan con un marcador que **ponga el script** —aquí `data-js` en la
  escena—, nunca con un atributo que ya venga en el HTML servido: ese lo
  tienen los dos casos y no distingue nada.
- **`titulo` y `fuente` son texto plano, sin `$…$`.** Un `(matriz $A_1$)` en
  la fuente de siete ejercicios paró el despliegue el 30 de agosto de 2026:
  `verify` lo lista como «LaTeX que ha salido como texto». Subíndice en
  Unicode (A₁) o sin subíndice; la fórmula va en `enunciado`.
- **Ninguna construcción de markdown que necesite sus saltos de línea
  sobrevive dentro de un escalar plegado de YAML.** La regla general, con sus
  dos casos vividos: una **cita** pierde todos sus `>` menos el primero, y una
  **tabla** se publica como un párrafo lleno de barras verticales. La segunda
  pasó el 9 de septiembre de 2026, con una tabla de seis duraciones en la ruta
  de Térmica, **el mismo día en que se documentó la primera** — y se vio igual:
  mirando la página, con `verify` y los 1.616 tests en verde. Si el campo
  necesita saltos, o se escribe en prosa o el escalar pasa a literal (`|-`).
  Lo cuenta la sección 9 de `deuda.mjs`, que mira las dos formas.
- **Una cita de markdown dentro de un escalar plegado de YAML publica sus
  «>».** El `>-` de YAML une las líneas con un espacio, así que de un
  blockquote de cinco renglones markdown solo lee el primer `>` y **los otros
  cuatro salen como texto**, en mitad de la frase: «que los dos ejercicios >
  «no tienen resolución guiada» y que «el tema 6 > todavía no está escrito»».
  Estuvo publicado así en la ruta de la tercera de Cálculo hasta el 8 de
  septiembre de 2026, y lo cazó **mirar la página**, no un guardián: `verify`
  y los tests estaban en verde. **Regla: dentro de un campo de ruta, las
  correcciones se escriben en el propio párrafo con `**~~…~~ · resuelto el
  …**`, que es como las escribe el resto del proyecto — no como cita.** Si de
  verdad hace falta una cita, el campo tiene que ser un escalar literal
  (`|-`), que conserva los saltos.

  Y una nota sobre cómo buscarlo, porque el primer intento fue peor que no
  buscar: en el HTML publicado un `>` suelto **no se distingue** de un «mayor
  que» de una fórmula, y la búsqueda daba 197 aciertos en `h > f` antes de
  llegar a uno real. Se busca en el origen. Está en la sección 9 de
  `deuda.mjs`.
- **Un rótulo destacado que dice lo contrario que el párrafo de debajo gana,
  porque es el que se lee.** El suelo de Fluidos publicaba «Cae 11 de 16 años»
  sobre un `porque` que decía «cero de once»; se corrigió el 7 de septiembre
  de 2026 **sin mirar si estaba en más sitios**, y el 8 apareció igual en los
  **dos** suelos de Álgebra, con «Cae 8 de 8 años» sobre «cero de treinta y
  dos». El origen es un supuesto del esquema: `invariante.anios` se llenaba
  con «en cuántas convocatorias se **usa**» cuando el campo cuenta en cuántas
  **cae como ejercicio propio**, y para un suelo esa respuesta es cero. Con
  cero, la página ya escribe «No cae solo, está dentro de las N».

  **Regla: cuando arregles una contradicción entre un rótulo y su texto,
  búscala en las demás asignaturas antes de darla por cerrada** — y si
  reaparece, el arreglo no es la tercera corrección sino un guardián. El de
  este caso es la sección 7 de `deuda.mjs`, y busca un patrón estrecho a
  propósito: «cero de ‹número›» sin un `para` detrás, dentro de un bloque con
  `anios > 0`. La primera versión buscaba «ninguno» a secas y daba 26 avisos
  de 110 bloques, casi todos falsos: **un guardián que acierta 2 de 26 se
  aprende a ignorar, y eso es peor que no tenerlo** (§11).
- **Un campo que se pinta sin pasar por `mate()` publica los asteriscos.**
  `invariante.fuente` se pintaba en crudo justo debajo de un `porque` que sí
  se renderiza, así que el lector veía énfasis en un párrafo y `**esto**` en
  el siguiente. Nadie lo metió por descuido: el campo nació sin renderizar y
  quien escribía suponía —razonablemente— que se portaba como su vecino.
  Corregido en la plantilla el 8 de septiembre de 2026, que arregla de una vez
  las seis marcas que había en tres asignaturas. **Antes de escribir markdown
  en un campo nuevo, mira en la plantilla si ese campo pasa por `mate()`**; y
  si escribes uno nuevo que es prosa, hazlo pasar.

  **Y pasó tres veces en tres días, así que a la tercera dejó de ser una
  corrección y pasó a ser un guardián.** El 9 fueron las meta descriptions
  —cinco páginas publicando `content="…y **son dos parciales el mismo
  día**…"` en el buscador y al compartir el enlace—; el 10, el `lede` del
  índice de exámenes, **siete marcas a la vista** en Álgebra y en Cálculo con
  las dos asignaturas cerradas y el suelo en verde. Las tres se encontraron
  mirando el HTML publicado, ninguna con un guardián.

  De ahí salen dos cosas. Una, que **hay huecos donde `mate()` no cabe**: un
  atributo, o un resumen dentro de un `<a>` —devolvería un `<p>` metido en un
  enlace—. Para esos está `sinMarcas()` en `lib/markdown.mjs`, que quita el
  énfasis y el código en línea y nada más; estaba escrito en línea dentro de
  `Base.astro` y se extrajo el 10 de septiembre porque el segundo sitio que lo
  necesitaba no lo tenía, que es la Regla 0 exacta. Y dos, el guardián: la
  regla **«cero markdown sin dibujar en el texto publicado»** de `verify.mjs`,
  hermana de la del LaTeX crudo. Solo mira `**…**`, a propósito —un asterisco
  suelto es legítimo—, y quita el `<style>` además del `<script>`: el primer
  barrido dio **401 aciertos y los 401 eran comentarios de CSS y de JS**.
  Validada al revés quitando el arreglo: siete rojos, los siete reales.

- **La tolerancia de una respuesta `numero` es absoluta, y un `0.02` escrito
  ahí no significa un 2 %.** La de `magnitud` es relativa (§17, más arriba) y
  la de `numero` no, y la costumbre de escribir `0.02` pasa de un tipo al otro
  sin que nada se queje. En un Reynolds de 5.704 eso es pedirlo a la
  centésima: **la página rechaza la cuenta exacta**, 5.701, y solo acepta a
  quien teclee el redondeo del corpus. Lo encontró el 12 de septiembre de 2026
  el recálculo de Térmica en tres pasos de examen —dos Reynolds y un Nusselt—,
  con el esquema, los cuatro guardianes y la barrida completa en verde: ninguno
  mira si una casilla acepta la respuesta buena, solo si rechaza las malas.

  Su hermana, en el mismo pase: una tolerancia de `magnitud` **estrechada para
  echar un distractor** dejaba fuera la cuenta buena, porque los datos
  redondeados del paso anterior no fijaban el resultado mejor que al 0,8 % y
  el distractor quedaba a otro 0,8 %. **Regla: una tolerancia se elige por lo
  que el enunciado deja calcular, no por el distractor.** Si el distractor
  queda más cerca que eso, el que sobra es el distractor —o falta dar un dato
  en la pregunta—, no la tolerancia.

  Donde las respuestas son exactas y no hay calculadora —Cálculo, Álgebra,
  Química— una tolerancia estrecha es lo correcto. Medido ese día, en Térmica y
  en Fluidos: cuatro casos en Térmica, corregidos, y tres en Fluidos que
  quedaron anotados en `tasks/manana.md`. **Se corrigieron esa misma noche**,
  mirando cada paso con su cuenta exacta y no con la regla: los tres
  rechazaban la cuenta buena —59,85 frente a 60, 137,8 frente a 138 y 790,3
  frente a 791, los tres con 0,02—, y un cuarto, la k del 4.22, la aceptaba
  por siete milésimas. De las nueve casillas que da la búsqueda por la forma,
  las otras cinco son estrechas con motivo: sus datos fijan el resultado a esa
  precisión y la cuenta exacta cae dentro. **Que una tolerancia sea estrecha
  no la hace mala; lo que la hace mala es que deje fuera la cuenta exacta.**

- **`evaluaNumero` lee «, » como un espacio, y el espacio como un producto.**
  Es lo que permite escribir `2 pi` o `3 sqrt(2)`, y tiene su precio: «(1, 3)»
  vale 3, «(2, −1)» vale 1 y «(1, 2, 0, 1)» vale 0. Lo destapó el 26 de
  septiembre de 2026 unificar los lectores del navegador y del esquema en
  `lib/numero.ts`: la regla de «distractores confundibles» se aplicaba también
  a los vectores, que el lector binómico devolvía como `null`, y con el
  encadenado dos vectores distintos pasaron a ser el mismo número. **Regla: una
  comprobación que lee con el lector numérico dice para qué tipos es**, y un
  vector o una matriz se leen con el suyo. Y queda una holgura sabida en las
  respuestas `numero`: quien escriba un par donde se pide un número puede
  acertar por casualidad. Es rara, y no se ha visto en ningún ejercicio.
- **Zod no corre las reglas de un objeto al que le falta un campo
  obligatorio.** Un `.refine` se evalúa sobre un objeto que ya ha pasado su
  forma; si falta `titulo` o `desarrollo`, el error sale por eso y la regla ni
  se mira. Importa al **validar al revés** (§11): el ejercicio de prueba con el
  fallo metido a propósito tiene que ser válido en todo lo demás, o el build
  falla por otra cosa y parece que la regla funciona. Pasó el 26 de septiembre
  de 2026: la primera prueba de la regla de distractores «falló» por un paso
  sin `titulo`, y solo al completarlo salió el aviso que se buscaba.
- **En Zod 4, un `z.record` con claves de un enum las exige todas.** En Zod 3
  eran opcionales, y el código que lo daba por hecho sigue compilando: el
  primer YAML que omite una clave falla con un «Required» por cada una, y por
  la trampa de arriba las reglas propias del `superRefine`, con sus mensajes
  en castellano, no llegan a correr. Pasó el 27 de septiembre de 2026 con el
  `reparto` del banco de Materiales, donde un bloque sin nombrar tenía que
  sacar cero; lo cazó el revisor de código antes de que ningún banco lo
  pisara. **Regla: si las claves pueden faltar, `z.partialRecord`.**
- **Un deslizador recorta su `value` contra el `max` que tiene EN ESE
  MOMENTO.** Si un preajuste escribe primero la posición y el código ensancha
  el tope después, el navegador ya la ha recortado sin avisar. Le pasó a la
  catenaria: «cable tenso» ponía la sección en x = 20 con el tope aún en 3, y
  medía en 3 o en 10 según qué se hubiera pulsado antes. **Regla: al aplicar
  un preajuste, primero los topes y después los valores.** El caso está en
  `comprueba-simuladores.mjs`.
- **Dos valores de un deslizador de paso 0,1 no se restan exacto, y un
  arreglo que se llama a sí mismo no para.** `2,4 − 2` da `0,3999…`: la
  comprobación «los apoyos a L/10 como poco» seguía siendo cierta después de
  corregir, la función de pintar se volvía a llamar para corregir otra vez, y
  la viga se congelaba con la pila desbordada. **Dos reglas: las comparaciones
  con valores de un mando llevan margen —`< minimo − 1e-9`—, y una corrección
  del estado se aplica una vez y se sigue, nunca con `return pinta()`.**
- **`content-visibility: auto` mueve la página mientras la mides.** Cada
  ejercicio lo lleva, y uno sin maquetar ocupa los 900 px que supone
  `contain-intrinsic-size`. Cualquier medida —un `getBBox()`, un
  `getBoundingClientRect()`— obliga a maquetar alguno y lo de debajo se
  desplaza: una posición tomada antes de medir ya no vale después. Así
  `humo.mjs` vio, el 28 de septiembre de 2026, rótulos de tres figuras
  seiscientos píxeles por debajo de su propio `<svg>`, en las páginas de
  bloque de la fase E4; en la del tema las mismas figuras medían bien por
  pura suerte de orden. **Regla: antes de medir, `content-visibility:
  visible` en todo lo que lleve `auto`, igual que al imprimir; y el fallo se
  reproduce copiando los pasos del guardián, no abriendo la página a mano,
  que con otro orden de maquetado no falla.**

- **Un enunciado transcrito conserva los números y pierde las notas.** Los 108
  ejercicios de examen de Fluidos que había el 29 de septiembre de 2026
  estaban transcritos con cada dato bien y sin una sola de sus «NOTA:», y ahí
  iban cosas que puntúan: que se penaliza no seguir los cinco pasos, que sin
  deducción la expresión no vale, que se itera como mucho tres veces. Quien
  preparaba con el sitio hacía bien la cuenta y perdía los puntos. No se vio
  porque el cotejo se hacía número a número. Lo encontró la auditoría del 27
  de septiembre de 2026. **Regla: al cotejar un enunciado, se coteja
  también lo que no es un número; y lo que se puede comprobar contra el PDF,
  lo comprueba un guardián (§11).**
