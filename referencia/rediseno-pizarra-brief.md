# Rediseño «Pizarra» — brief de traspaso para Claude Code

Este documento traspasa una decisión de diseño ya tomada (agosto 2026, sesión
de Cowork) a la sesión de implementación en el repo `road-to-ingenieria`.
No es una propuesta: es el resultado de comparar cuatro mundos visuales
diseñados desde cero. Ionan eligió este.

Los mockups aprobados viven en el lienzo de diseño:
https://claude.ai/code/artifact/c2c779e8-2da8-44a5-ba82-92be75f79863
(página «Comparación · antes / después»: portada Pizarra + interior T01;
cada tablero se puede exportar como PNG desde su menú).

---

## 1 · La decisión, y las reglas que la produjeron

- **Mundo elegido: Pizarra.** Pizarra verde con tiza para la identidad;
  papel cálido para la lectura larga.
- **Regla del cansancio (dicha por Ionan, sale de upv-ehu-project):** «lo
  futurista impresiona el primer día y cansa la vista a la semana». Todo lo
  que se implemente se juzga con esa vara: calidez antes que espectáculo.
- **La portada no supone itinerario:** hay alumnos que no cursan todas las
  asignaturas. Nada de ejercicio-puerta, cada uno entra a lo suyo.
- **Nada de cuenta atrás al examen** (probada el año pasado: metía presión).
- **Nada de localStorage / memoria de progreso** por ahora.
- **El movimiento se ve una vez** (entrada) **o bajo demanda** (hover,
  arrastrar). Mientras se lee, nada se mueve. `prefers-reduced-motion`
  lo apaga todo (base.css ya lo hace globalmente).

## 2 · Dónde vive cada superficie

- **PIZARRA (fondo oscuro verde):** la portada entera, la barra superior de
  las páginas interiores, los recuadros de ErrorTipico, los recuadros de
  diagnóstico del ejercicio guiado, y las figuras de tema cuando se enmarcan
  como «mini-pizarra».
- **PAPEL (fondo claro cálido):** todo donde se lee o se trabaja durante
  horas — prosa de temas, ejercicios, exámenes, rutas. Motivo: fatiga visual
  e impresión (el modo completo se imprime, §11 de CLAUDE.md).

## 3 · Tokens del mockup (punto de partida para tokens.css)

Pizarra (portada y acentos):
- fondo: gradiente radial `#1D463A → #12332A → #0D2820` + viñeta interior
  (`box-shadow: inset 0 0 150px rgba(0,0,0,.5)`)
- tiza blanca (texto principal): `#F2F0E9` (apagada: rgba(242,240,233,.55-.8))
- tiza amarilla (acento, interactivo, subrayados): `#F5D76E`
- tiza verde-menta (estado «hecho»): `#9FE8C4`
- polvo de tiza: dos capas de `radial-gradient` de puntos de 1px, opacidad ~.32
- repisa de madera: gradiente `#3A2E22 → #291F16` con tizas apoyadas

Papel (interior):
- fondo: `#F8F5EC` · panel blanco `#FFFFFF` · regla `#E2DBC8`
- tinta: `#2B2A24` · prosa `#3C3A32` · atenuado `#8A8471`
- verde identidad (enlaces, interactivo, kickers): `#1C6E51`
  (hover `#12513B`)
- error/incorrecto: `#C6503C` con fondo `#FBF1EE`

Estos valores salen del mockup aprobado. Ajustar contraste con
`scripts/check-color.mjs` antes de fijarlos (especialmente amarillo sobre
pizarra y atenuados sobre papel); si hay que moverlos, mover poco y mantener
el tono.

## 4 · Tipografía

- **Karla** — interfaz y cuerpo (400/500/700/800). `@fontsource/karla`.
- **Caveat** — SOLO anotaciones manuscritas: rótulos de tiza, apuntes al
  margen, títulos de ErrorTipico, estados («la estamos escribiendo»).
  Nunca cuerpo de texto ni párrafos. `@fontsource/caveat`.
- **Las fórmulas no cambian:** KaTeX en el build con sus propias fuentes
  (§07). El serif de los mockups era un placeholder de fórmula.
- Sustituyen a Fraunces + IBM Plex → hay que actualizar la tabla de
  dependencias de CLAUDE.md §02 y la sección §06 entera (regla del propio
  fichero: una regla que estorba se cambia ahí, no se ignora).

## 5 · La portada (fase 1)

Referencia: tablero «Después · portada Pizarra». Piezas, de arriba abajo:
1. Barra: wordmark en Caveat + «Escuela de Ingeniería de Gipuzkoa · UPV/EHU»
   + buscador (la paleta de comandos actual se conserva tal cual, `/` y `⌘K`).
2. Héroe: titular «La clase donde por fin te dicen dónde te equivocas» con
   subrayado de tiza amarilla QUE SE DIBUJA UNA VEZ (animación de
   stroke-dashoffset, `forwards`, nunca `infinite`); entradilla; dos CTA
   («Entrar a Cálculo» amarillo sólido, «Entrar a Álgebra» borde tiza);
   línea «gratis para siempre · sin cuentas · sin anuncios» en Caveat.
3. Figura tocable a la derecha: curva de tiza que se dibuja al entrar; un
   punto amarillo ARRASTRABLE por la curva cuya tangente (dashed amarilla)
   le sigue. Implementación del mockup: `path.getTotalLength()` +
   `getPointAtLength`, pointer events con `setPointerCapture`, búsqueda del
   punto más cercano muestreando ~90 puntos. JS plano en el `.astro`.
   En táctil funciona (touch-action: none); con reduced-motion la curva
   aparece dibujada y el punto queda quieto pero arrastrable.
4. El temario: dos columnas (1.er / 2.º curso), números y estados en Caveat,
   nombres en Karla. Estados honestos desde el catálogo: entera / la estamos
   escribiendo / aún no.
5. Repisa con tizas + la frase «pocas excelentes antes que muchas a medias».

Qué se conserva de la portada actual: la paleta de comandos entera, las
anclas `:target` (funciona sin JS), el foco visible, y el detalle por
asignatura si se mantiene la vista B (el FLIP puede quedarse — el nombre
viajando no cansa; decidir al implementar si el detalle adopta pizarra o
lleva ya al papel).

## 5b · El detalle de asignatura (vista B de index.astro — va con la fase 1)

Referencia: tablero «Después · detalle de Cálculo». Aprobado por Ionan.
- Banda de PIZARRA con la identidad: «02 · 1.er curso · asignatura entera»
  en Caveat amarilla, nombre en Karla 800 blanca, la descripción real del
  catálogo, y UN solo CTA amarillo que baja a las rutas.
- Cuerpo en PAPEL. La lista de temas lleva SOLO número (Caveat verde),
  título (Karla 700) y peso — **sin la descripción bajo el título**
  (decisión explícita de Ionan, 29-08-2026; la descripción sigue en el
  catálogo y puede aparecer dentro del tema, no en esta lista).
- Peso honesto del catálogo: rojo `#C6503C` SOLO para «alto» (la semántica
  de --flag: esto decide notas); medio y bajo en neutros de papel.
- Los seis puntitos de patrones de la vista actual se sustituyen por una
  etiqueta Caveat solo donde informa («con simulador» en T01).
- Carril derecho: recuadro de pizarra «Por dónde empezar» con las rutas por
  evaluación (una destacada en amarillo; cuál destacar se decide al
  implementar — NUNCA con cuenta atrás), y tarjeta de papel de exámenes con
  las convocatorias más recientes y el total calculado en el build.
- Todos los datos salen de las colecciones en el build, nunca escritos a
  mano en la página.

## 6 · Las pantallas de estudio (fase 2) — APROBADAS por Ionan (29-08-2026)

Referencia: página «Estudio · teoría, ejercicio, examen» del lienzo. Regla
común a las tres: cuerpo en PAPEL; la pizarra entra solo como barra
superior, mini-pizarra de figura, recuadro de ErrorTipico y recuadro de
diagnóstico. El toggle claro/oscuro existente se replantea aquí (el papel
cálido ES el modo claro; el oscuro puede esperar). Las fórmulas de los
tableros van en serif como marcador de posición: en el sitio las sigue
dibujando KaTeX en el build — no se toca §07.

**Teoría (patrón Lectura).** Tres columnas: carril izquierdo con los
apartados del tema (el activo con borde verde y fondo blanco, el resto con
borde `#E2DBC8`), columna de lectura a 66ch (prosa 16.5px/1.7, H2 23px,
fórmulas de bloque con borde izquierdo verde sobre blanco), y carril
derecho con la figura del tema en mini-pizarra + una tarjeta «practica lo
que acabas de leer» que enlaza al primer ejercicio de nivel ejemplo. El
toggle Modo guiado / Completo vive en la barra pizarra. Pie con
anterior/siguiente y la `fuente` del frontmatter.

**Ejercicio guiado (EjercicioGuiado).** La escalera de pasos VISIBLE:
- paso hecho: plegado, borde y fondo verde suave, check + la opción
  elegida + apunte en Caveat;
- paso activo: abierto, con sombra; el campo de respuesta en rojo
  `#C6503C`/fondo `#FBF1EE` cuando hay fallo, y debajo el diagnóstico DEL
  DISTRACTOR en recuadro de pizarra (título Caveat amarilla + mensaje del
  YAML tal cual). Junto al campo, el recordatorio «vale la forma exacta»;
- paso pendiente: plegado al 60 % de opacidad con círculo vacío.
Cabecera: chip `nivel` + la `fuente` literal + título. Enunciado en caja
blanca con borde izquierdo verde. Pie de paso: «1.er intento · al 2.º la
pista, al 3.º el desarrollo». Carril derecho: figura del ejercicio en
mini-pizarra + tarjeta «qué entrena» con los tres pasos y su estado, y el
dato medido del 42,7 % (recalcular al cerrar asignatura, §09).

**Examen (Examen.astro).** Cabecera papel con la línea Caveat «tal cual
cayó — sin cambiar un número», título con fecha real y total. Lista de
ejercicios: fila plegada = nº Caveat + título + chip de tema + reparto
«c1 + c2 + c4 = 10 pts»; la abierta añade enunciado, CTA amarillo
«Resolver guiado» + secundario «Resolución completa» y la nota de
honestidad del YAML («resolución propuesta nuestra, pendiente de
revisión»). Un ejercicio 100 % demostración lleva borde izquierdo
`#C6503C` y su aviso. Carril derecho: recuadro pizarra del PDF original +
tarjeta de reparto por competencias (barra apilada con etiquetas directas:
`#B9B29E` reconocer / `#1C6E51` calcular / `#A8842C` justificar — estos
tres son SOLO para esta barra, no entran en la interfaz general). Los
repartos se calculan de la colección, nunca a mano.

## 6b · La ruta de estudio (fase 3) — APROBADA por Ionan (29-08-2026)

Referencia: tablero «Ruta · preparar la 1.ª evaluación» (página «Estudio»
del lienzo). Cuerpo en papel con barra pizarra, como todo el interior.

- **Los bloques son un CAMINO vertical**, no una lista: números en círculo
  (Caveat, borde verde; el activo relleno verde) unidos por una espina de
  tiza discontinua (`repeating-linear-gradient` vertical verde al 50 %).
  El orden es el contenido de una ruta — la maqueta lo hace visible.
- Cabecera: kicker Caveat verde «medido sobre N convocatorias — nada por
  intuición» (N = `medidoSobre`), título, y el `lede` literal del YAML.
- **Bloque abierto** (el primero, o el que el alumno abra): título +
  anotación Caveat con el porqué medido + el `porque` resumido en gris +
  los escalones como filas con casilla vacía (los `aprendes` en segunda
  persona; el primero enseña la escalera «teoría → ejemplo → práctica» en
  verde) + el **`dominio` SIEMPRE PINTADO** como cierre: recuadro con borde
  izquierdo verde, «lo tienes cuando:» en Caveat + el texto del YAML. Esta
  es la corrección de fondo: el dominio nunca más se valida y se tira.
- **Bloques plegados**: fila blanca con número, título, anotación Caveat
  con su porqué medido («cae los 11 años — 7 pts de cálculo», «el más
  rentable — 7+ pts sin una cuenta») y el recuento de escalones. El rojo
  `#C6503C` solo en las anotaciones que hablan de puntos que deciden nota;
  ámbar `#A8842C` para el suelo y el formulario; gris para el resto.
- Carril derecho: recuadro pizarra «Por qué este orden» con el
  `criterioDeOrden` del YAML; tarjeta blanca con los datos de la
  evaluación; y una tarjeta con borde ámbar «Lo que falta, dicho en voz
  alta» que pinta las `falta[]` REALES del YAML — la honestidad declarada
  hecha interfaz, nunca se omite si el YAML las trae.
- Todo el texto sale del YAML de la ruta; nada se escribe en la página.

## 6c · Remates detectados en la verificación del 29-08-2026

Del repaso en navegador contra los tableros (todo lo demás, fiel):
- Portada: la escala sigue algo por debajo del tablero (H1/entradilla/
  nombres — valores en §5.2 y §5.4) y queda banda vacía bajo las listas.
- Figura tocable: añadir `user-select: none` a la figura y su etiqueta —
  arrastrar el punto selecciona el texto de al lado.
- Tema oscuro: pendiente declarado; cuando se haga, es una variante
  pizarra del papel, no la paleta fría antigua.

## 7 · Contenido de muestra — NO copiar al repo

Del mockup del interior, es contenido escrito para el mockup (no del corpus):
el ejercicio del argumento de z = −1−i con sus tres opciones y su
diagnóstico, y la frase «cae todos los años» junto al título. La prosa de
complejos, la fórmula del conjugado y el error típico del arctan sí
parafrasean contenido real del repo, pero al implementar se usa el contenido
del corpus tal cual está, nunca el texto del mockup.

## 8 · Orden de trabajo sugerido

1. Rama nueva. Tokens y fuentes (`tokens.css`, package.json, §02/§06 de
   CLAUDE.md). `check-color.mjs` sobre los pares nuevos.
2. Portada + detalle de asignatura (las dos vistas viven en `index.astro`;
   también `Cabecera.astro`). La figura tocable.
3. Mirarlo (§16): claro, 360 px, teclado, reduced-motion, y dejar capturas.
4. `npm run suelo`. Ojo con verify.mjs: un solo `:root{}`, cero literales
   fuera de tokens.css, cero dominios externos (las fuentes por @fontsource,
   nunca Google Fonts CDN — los mockups usaban CDN solo por ser mockups).
5. Enseñárselo a Ionan antes de tocar el interior.
