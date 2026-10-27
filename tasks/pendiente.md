# Pendiente

Lo que queda por hacer, una línea por cosa, con dónde mirar. **Se borra en el
commit que lo cierra**: la historia va en el mensaje del commit y en
`diario/`, no aquí. Sin recuentos: los da `npm run deuda`. Si este fichero pasa
de unas 150 líneas, se está usando como diario.

Abierto el 26 de septiembre de 2026, al cerrar la auditoría completa, con lo
vivo de `todo.md` y `manana.md` —congelados ese día como archivo— y lo que la
auditoría encontró y no se arregló en el momento.

## El orden de las fases (auditoría externa del 27 de septiembre de 2026)

El encargo entero, con el «Acepta» de cada fase y sus pruebas, está fuera del
repositorio: `2027 proyecto contenido/auditorias/2026-09-27/encargo-por-fases.md`.
Lo ordena el calendario —lo que se examina en enero de 2028 va antes que lo
del segundo cuatrimestre—, con una excepción decidida por Ionan: la fase 1 de
Expresión Gráfica se pausa dos días para hacer antes los arreglos rápidos, y
sigue después tal cual.

- **H · Materiales**: hecha el 29 de septiembre de 2026 (laboratorio,
  simulacros, test de 7–10, formulario y la evaluación final con su
  discrepancia dicha). Queda lo que no depende del sitio: la ruta medida, sin
  exámenes de teoría y problemas, y la copia limpia de las preguntas guía.
- **I · Fluidos**: hecha el 30 de septiembre de 2026 (las prácticas, con su
  página y su bloque en la ruta; los exámenes cotejados palabra por palabra,
  con sus notas impresas; los `fuera` recuperables, rescatados; «Cómo se
  corrige» y los formularios). Quedan fuera el 7 de la final de 2021, por
  formato, y el b) del 3 de la extraordinaria de 2023, por material.
- **J · Sistemas de Producción** (~4 semanas): aplazada por Ionan el 30 de
  septiembre de 2026, se hará más adelante; K va antes. **Desde el 25 de
  octubre de 2026 no es de la 1.0**, que se cierra con las nueve asignaturas
  del primer cuatrimestre, y desde el 26 va en la fase 3, con K. Su colección trae cinco
  problemas fechados como examen (T2 P7, P8 y P9; T3 P5 y P6), que dan para
  medir la ruta de la ordinaria; los de CNC piden un tipo de respuesta para
  código.
- **K · Expresión Gráfica, el bloque 2** (los cortes, el despiece y el resto
  de las vistas): **desde el 26 de octubre de 2026 va en la fase 3**, con
  J, porque es del segundo cuatrimestre. Las hojas 52–55 son exámenes y
  ordenarán su ruta (familias B, E y G antes que A y H).
- **N · Cierre técnico y O · Auditoría de cierre, con la etiqueta `v1.0`**:
  con ellas se cierra la 1.0, decidido el 26 de octubre de 2026. No se espera
  a lo que digan los profesores: lo que digan entra después. El plan está en
  `2027 proyecto contenido/ideas/fases-siguientes-2026-10-26.md`; lo de N está
  abajo, en «Código» y en «Contenido».
- **Fase 2, después de la 1.0** (decidido el 26 de octubre de 2026): dos
  bloques, primero el entorno de aprendizaje y después el techo visual. Lo
  demás de la lista de ideas espera. Cada bloque tiene su síntesis, con las
  preguntas que quedan por decidir, en `2027 proyecto contenido/ideas/`
  (`fase-2-entorno/` y `fase-2-techo-visual/`).
- **Fase 3**: J y K.
- **La deuda de abajo, intercalada** en los huecos del suelo y del
  despliegue, un commit por punto: mirar entero el primer despliegue después
  del 19 de octubre, cuando `ubuntu-latest` pase a Ubuntu 26.

## Lo decide quien mantiene el proyecto

Preguntado uno a uno el 27 de septiembre de 2026, y otra vez el 26 de octubre
con las hojas de las reuniones; queda abierto lo que no se sabía:

- **Expresión Gráfica**: si en el examen de dibujo técnico se pueden usar las
  tablas ISO de tolerancias (ISO 286-1) o vienen con el enunciado —la nota
  general de la UPV/EHU (`Nota_sobre_la_evaluacin_de_pruebas_acadmicas.pdf`,
  pág. 2) prohíbe libros y apuntes salvo indicación expresa—. Si vienen con
  el enunciado, se queda como está (26 de octubre de 2026). Si el diédrico se
  examina a escala o por coordenadas, se mira en las preguntas de examen de la
  colección, como se dijo ese día. La colección de 2026-27 es la misma que la
  transcrita, y la rúbrica de láminas ya está.
- **Expresión Gráfica, los Ejercicios 53 y 55 de la colección**, cuatro cosas
  que el enunciado no dice y se han supuesto, cada una declarada en su
  ejercicio: en el 55·1, que α es el menor de los dos ángulos entre AB y BC;
  en el 55·2, que el plano ABCD es una lámina opaca, que es lo que decide la
  visibilidad del alzado; en el 53·3 A, cuál es «el ángulo entre los dos
  planos»: el menor, 86,10°, o el de las caras, 93,90° (desde el 8 de octubre
  de 2026 valen los dos, con `tambienValen`, hasta que conteste el profesor;
  auditoría de EG, M3); y en el 53·3 B, la visibilidad del refuerzo, que
  el enunciado no pide y no se afirma.
- **Expresión Gráfica, el Ejercicio 46 de la colección (SD62)**: en el b), que «el ángulo
  existente entre los planos AVB y CVB» es el menor, 67,77°, o el de las caras, 112,23° (valen
  los dos desde el 8 de octubre de 2026); es la misma pregunta que el 53·3 A.
- **Expresión Gráfica, el Ejercicio 49 de la colección (SD65)**: si en clase
  se resuelve como el agujero cuadrado de lado a en la cara inclinada del
  depósito, que es la lectura literal que se ha tomado, o como la sección
  de un tubo de sección cuadrada. La página no da cifra para «a»: se ha
  tomado el segmento dibujado, de 20 mm, y el ejercicio lo dice.
- **Expresión Gráfica, el Ejercicio 47 de la colección (SD63)**, dos cosas: si
  el triángulo ABC se toma opaco para la visibilidad de la recta, como se ha
  supuesto y declarado; y si en el examen vale dar el ángulo de la recta con
  el plano por el complementario, sin construir la posición de la recta
  perpendicular.
- **Expresión Gráfica, la hoja de *Criterios*** (`src/content/criterios/`),
  tres cosas que no dice: si en el precio compuesto de la escala el medio
  punto del cajetín se cobra una vez o por pieza (se ha supuesto una vez:
  dos piezas, −1,5; por pieza serían −2); si un error muy grave repetido —dos
  ejes cortados a lo largo— cuesta −2 una vez o por caso; y si los dos muy
  graves de la escala que se solapan se suman. Y una cuarta, que el componente
  de la página supone: si un mínimo cuyo elemento no tiene la pieza (la rosca,
  en una pieza sin roscas) cuenta como cumplido, como dice el del eje, «si lo
  tiene».
- **Térmica, al profesor**: si se pueden publicar sus veinte resoluciones.
  Desde el 23 de octubre de 2026 no se sirven (`sinPdf`): cada página es la
  resolución con el enunciado encima, y no hay hoja de enunciado que partir.
  Si dice que sí, vuelven de la carpeta de material; si no, se queda así.
  El 26 de octubre de 2026 quien mantiene el proyecto contestó que sí; antes
  de volver a servirlas, que lo confirme expresamente.
- **Sistemas**: si el examen da las hojas del catálogo Sandvik o los valores
  de corte en el enunciado.
- **Materiales**: una copia limpia de las preguntas guía, porque el fichero
  lleva «Grupos» en el nombre y no se abre. El 26 de octubre de 2026 no se
  sabía; lo va a preguntar, con lo demás de Materiales.
- **Química, la resolución de 2013**: si se publica como PDF de su
  convocatoria (`2012-2013-ord`), como se hizo con las veinte de Térmica el
  10 de septiembre de 2026 (retiradas el 23 de octubre, hasta preguntar a su
  profesor). Es la corrección del profesor, mecanografiada y
  sin datos personales, y §08 solo deja entrar enunciados sin una decisión
  expresa: hasta entonces la página lleva `sinPdf`. El modelo de 2024-2025 no
  entra en la pregunta: es un escaneado con su letra, y esos no se publican.
  El 26 de octubre de 2026 la respuesta fue que sí; como con Térmica, que lo
  confirme expresamente antes de publicarla.

## Hacer

### Lo que tiene fecha: la 1.ª evaluación de Cálculo y el parcial de Elasticidad

- **Después del 19 de octubre de 2026**: conseguir el examen de la 1.ª
  evaluación, etiquetarlo con la lista y las reglas de
  `campeonato/calculo-1ev/`, puntuar las dos predicciones selladas y publicar
  la clasificación (los pasos, en su README).
- **Elasticidad, el 30 de octubre de 2026**: desde el 23, la ruta del
  parcial 1 está en los temas 1 a 6, que es lo que entra este curso. Queda
  abierto un `falta`: no hay un parcial entero solo de esos temas.

### Lo que dejó la auditoría de cierre de la 1.0

El informe está en `2027 proyecto contenido/auditorias/2026-10-27-cierre-1.0/`.
Nada enseña algo falso; los dos fallos y cuatro de los cinco mejorables se
arreglaron el 26 de octubre de 2026. Queda uno:

- **Elasticidad, el segundo parcial de 2025-26**: sus dos problemas salen de
  fotos que no están en la carpeta de contenido, así que su transcripción no
  se ha podido cotejar. Cuando vuelvan las fotos, cotejarla.

### Elasticidad, terminada el 23 de octubre de 2026

Quien mantiene el proyecto, el 15: «el objetivo claro es terminar elasti».
De `fase-p/PLAN-terminar.md` (fuera del repositorio) está hecho lo que pide
§15: los catorce temas, 31 convocatorias, una ruta para cada examen y la
evaluación de la guía docente en el catálogo. No está hecho todo el plan,
pero **nada de lo que queda es importante**: el 23 de octubre se decidió
cerrarla así, con lo que falta apuntado. Queda:

- **La práctica de clase de P8**: los ejercicios 1.1 a 1.12, 9.1 a 9.8, 10.3
  a 10.6, 12.3 y 13.1 a 13.7 (32), y las cuestiones de autoevaluación de los
  temas 9 a 14. De los temas 1 y 9 a 14 solo está su ejemplo de entrada.
- **Los ejercicios que solo están como `.php` de eGela** (10.1, 10.2, 11.1 a
  11.6 y siete del 12): hay que pedirlos en PDF. Sin ellos, el tema 11 se
  queda sin práctica de clase.
- **El curso**: la guía dice 3.º y el catálogo, 2.º. Se queda así por
  decisión del 22 de octubre («no te esfuerces por ahora en cambiar eso»);
  cambiarlo pide tocar el esquema (`curso` solo admite 1 y 2).
- **La portada**: sigue `boton`, como se decidió el 14 de octubre. El plan
  preveía pasarla a la lista al cerrar; preguntar si se queda así.
- Los `falta` de sus cuatro rutas y, si llega, el resto de la hoja de
  problemas del primer parcial de 2025-2026 (el problema 3 llegó en foto y
  está transcrito desde el 23 de octubre de 2026).
- **Un problema suelto de un primer parcial que no tenemos** (llegó en foto
  el 23 de octubre de 2026): el 4 (1p) de su hoja de problemas, un
  transductor de par con una roseta en cortadura pura. Su cabecera dice
  17/11/2023 en castellano y 2024/11/22 en euskera, así que no se sabe si es
  de 2023-2024 o de 2024-2025. **No se hace hasta saber el curso**, por
  decisión del 23 de octubre.

Las convocatorias de enero y extraordinaria de 2012-2013 a 2015-2016 y las
del plan viejo no son pendientes: quedan fuera por decisión del 22 de
octubre («de 2016 para atrás no hagas nada»).

### La siguiente asignatura: Expresión Gráfica

- **El Taller, la deuda del diédrico** (8 de octubre de 2026, al cerrarlo):
  que un trazo que cubre un tramo entero pero «corta» en otro sitio enseñe el
  `porque` de ese tramo, no el mensaje general (`Taller.astro`,
  `compruebaArista`); borrar lo que el papel borra, que hoy el Taller no
  puede (SD42 y SD49 lo dicen en su texto); pintar la lámina con «medir» en un
  ejercicio con receta y sin `construir` (el ejemplo del tema 1 manda a la
  página del 55); un desplazamiento de rótulo por punto en el reproductor.
- **Funciones de receta que propusieron los autores**, solo si un ejercicio
  nuevo las necesita (sus firmas, en los LEEME de `fase-k\`):
  `abatido_frontal` (k-t04d: `abatido()` con una charnela horizontal y
  frontal a la vez abate siempre sobre el horizontal), `cuadrado_desde_alzado`
  y `sale_de` (k-ex52b).
- **El diseño antes que el contenido**: su examen es un dibujo. El catálogo
  ya salió de `prev` el 26 de septiembre de 2026, con el temario y la
  evaluación de la guía 25976. Fuera del repositorio está el diseño aprobado
  el 8 de septiembre: `Claude outputs/expresion-grafica-brief.md` y
  `expresion-grafica-paquete-1.zip` (las 65 láminas en JSON, el extractor,
  los pilotos del taller para SD3, SD5 y SD7 con sus comprobaciones, y
  `sd1-ejemplo.yaml`). Su fase 1 está hecha: el paso `construir`, el
  `Taller`, SD1, SD4 y SD5 en el tema 2, y el patrón en §05. Lo que sigue es
  la fase K: las familias A, B y C enteras, en el orden de la colección.
- **El material**: 51 ficheros, con colección resuelta y criterios de
  corrección; sin exámenes. Los dos de notas no se abren (CLAUDE.md, «Antes de
  nada»).

### Contenido

Decidido el 27 de septiembre de 2026, al preguntar uno a uno:

- **La barra de puntos de cada examen**: rediseñarla, con borde entre franjas
  y la cifra dentro, para que no dependa del color (contrastes de 2,92, 1,77
  y 1,65).
- **Fluidos, cantidad de movimiento**: reescribir las 22 resoluciones para
  que empiecen nombrando el volumen de control y por qué.
- **Calculadora**: en los exámenes de Fluidos y de Química se usa la Casio
  fx-570SP CW, científica y no programable. Sus páginas de asignatura ya lo
  dicen; falta no usar en las resoluciones nada que ella no haga.
- **Álgebra**: el examen de prácticas se hace con Maxima en ordenador.
  Decirlo en la ficha; practicar los comandos cae en la fase D o la E. Los
  ejercicios los traerá quien mantiene el proyecto cuando los tenga (26 de
  octubre de 2026).
- **Expresión Gráfica, hojas 52–55**: nadie sabe de qué año son; se
  transcriben como examen con fuente «sin fecha» (fase K).

- **Química, los problemas 5, 6 y 7 de la hoja del tema 5**: un isóbaro y dos
  isotermos, sin transcribir. La ruta del segundo cuatrimestre lo declara.
- **Térmica, contar apartados** en las diecinueve convocatorias que no son la
  ordinaria de 2025-2026, como se hizo con ella (`manana.md` 10.1).
- **Térmica, lo que queda de la colección de T9 y T10**: 9.4, 9.10, 9.12,
  9.15, 10.4, 10.5 y 10.7. Se dejaron fuera en F3 por motivos que conviene
  mirar antes de montarlos. Tres tienen erratas en la resolución (9.10, 9.15
  y 10.5, que invierte las temperaturas del enunciado). El 9.4 repite
  Churchill-Chu, que ya cubren un ejemplo y tres exámenes; el 9.12 da las
  cotas solo en una figura; el 10.4 pide pérdidas por metro sin dar el
  diámetro, y el 10.7 necesita la transformación triángulo-estrella.
- **Pesos de tema donde la ruta y las etiquetas no coinciden** (CLAUDE.md §10):
  Fluidos t07, t17, t18, t19 y t23; Térmica t08 y t10. Los de Mecánica del
  bloque 1 se revisaron con las cinco convocatorias.
- **`revisado` en los 26 bloques de Álgebra y Fluidos**: pasarlos por los
  criterios de hueco de su `criterioDeOrden` y entonces sí fecharlos. Es un día
  de trabajo; sellar la fecha sin hacerlo sería inventar (`manana.md` 10.7).
- **Nueve `fuente` que esconden una discrepancia** que su resolución sí
  explica (`manana.md` 10.2).
- **Térmica, la extraordinaria de junio de 2017 en la medida**: no trae nada
  fuera del programa y queda fuera de la cuenta solo por el corte en
  2017-2018 (`fueraDeLaVentana`). Meterla es recontar los siete bloques sobre
  dieciocho. Visto por la revisión del 23 de octubre de 2026.
- **«Cortante» en Mecánica**: ya está en la prosa del t06 y en 216 pasos;
  falta, si acaso, un apartado propio. Acotar antes de escribir.
- Menores: once `\sin` sueltos en el corpus; KaTeX sigue enviando las
  fuentes ttf y woff además de woff2 (el navegador solo baja la woff2: pesa en
  el despliegue, no en el alumno).

### Documentación

- **`docs/como-vamos.md`**: reducirlo a lo que generan `mide.mjs` y
  `deuda.mjs`, unas 200 líneas. Hoy son 1.284, y casi todo es narración por
  asignatura con las cifras de su día; se puso al día lo que era falso el 26
  de septiembre de 2026, no lo demás.

### Despliegue

- **`ubuntu-latest` pasa a Ubuntu 26 el 19 de octubre de 2026**: mirar el
  primer despliegue de después entero, y sobre todo `humo`, `contraste` y
  las figuras, que ya han fallado antes por diferencias de máquina (§17).

### Código (auditoría del 26 de septiembre de 2026)

- **Ficheros de más de 800 líneas**, uno por commit y con `npm run humo:todo`
  detrás: `pages/index.astro` (la mitad es CSS; la paleta y la ficha pueden
  ser componentes), `EjercicioGuiado.astro` (la corrección a
  `lib/corrige.ts`, que así se puede probar), `content.config.ts` (las
  constantes de convocatorias a `lib/`), `preparar/[evaluacion].astro` (el
  avance a `lib/avance.ts`) y `ui/Examen.astro` (el simulacro aparte).
- **Tres rutas de estudio pasan de 3 MB**: `calculo/preparar/ord` (4,4),
  `fluidos/preparar/ord` (3,6) y `calculo/preparar/ext` (3,3), porque
  incrustan ejercicios guiados. `verify.mjs` las avisa sin pararlas: decidir
  si los incrustados pasan a enlazar su bloque o la ruta se parte. **Medido el
  26 de octubre de 2026 y no es de la 1.0**: comprimidas, como las sirve
  GitHub Pages, son 419, 371 y 340 KB, y en un móvil con la CPU ×4 la de
  Cálculo pinta a los 0,36 s y termina de cargar en 1,5 s (54 000 nodos).
  Queda para la 2.0.
- **Duplicados** (Regla 0): el controlador de pestañas de `Tema` y `Examen`
  —ya se desincronizó una vez, en el `afterprint`—; el CSS del armazón y del
  carril, que vive en `Armazon` (lo usan los bloques de ejercicios y las
  cuestiones) y otra vez en `Tema`, donde va enredado con las reglas de las
  pestañas; el marco CSS de los
  simuladores, copiado en diez en dos familias; el formateador `num`, en
  nueve —con variantes: unificarlo cambia salidas que `npm run sim` compara
  carácter a carácter, así que va simulador a simulador—; el reloj de
  `Examen` y de `TestDeMinimos`.
- **El lienzo pisa el color de los rótulos pequeños**: la clase `n` de
  `scripts/figuras/lienzo.mjs` fija `fill: var(--faint)` en CSS, y eso gana
  al color que pide cada rótulo `pequeno` (201 en los generadores; lo vio el
  agente de Materiales el 29 de septiembre de 2026, con la punta de flecha
  del 2.16). Se leen bien porque `--faint` está medido, pero no salen del
  color que dice el código. Arreglarlo cambia figuras publicadas: regenerar
  y mirar las que cambien.
- **Coherencia**: seis simuladores usan `data-caso` para sus preajustes y dos
  `data-accion`; `ALCANCE_CONV` del índice de exámenes está pensado para
  Cálculo; y `TestDeMinimos` no alinea como `Cuestiones` una opción que es
  solo una fórmula, que desde E3 llega en bloque (`aTamanoDeFormula`): hoy
  no se nota porque el banco de Materiales no trae fórmulas.

### Lo que dejó abierto la fase I (Fluidos)

- **`scripts/revisa-ejercicios.mjs` no valida los pasos `dibujar`**: uno con
  dos puntos de `comprueba` pasa sin aviso.
- **El guardián de las notas impresas no ve una «Nota:» a media línea** (la
  del 4 de la extraordinaria de 2023, transcrita a mano): la regla de
  `scripts/notas-impresas.mjs` exige que empiece la línea. Ampliarla sin
  traer falsos positivos, midiendo antes cuántos saca.

## Bloqueado por material

Solo lo que la carpeta no trae, mirado en la página renderizada (CLAUDE.md
§17, «El volcado no es la página»). Lo que parecía bloqueado y es trabajo
está en su fase: las convocatorias bilingües de Mecánica en C1, Sistemas en J
y la colección de Química en «Contenido». Los `fuera` de Fluidos que se
daban por bloqueados salieron en la fase I: todos menos uno eran trabajo.

- **Ciencia de Materiales**: la ruta medida, hasta que haya exámenes de
  teoría y problemas. El formulario, el simulacro 40/60 y el laboratorio no
  esperan: son la fase H.
- **Mecánica**: exámenes más recientes del bloque 2. Los conseguirá quien
  mantiene el proyecto (26 de octubre de 2026).
- **Elasticidad**: el resto de la hoja de problemas del primer parcial de
  2025-2026; de esa convocatoria solo están la de teoría y el problema 3. La traerá quien la cursa cuando
  la tenga.

Los guiones de las prácticas de Química ya no están aquí: esas prácticas se
preparan en clase y el sitio no las cubre, por decisión del 27 de septiembre
de 2026. Lo dicen sus bloques en las dos rutas.
