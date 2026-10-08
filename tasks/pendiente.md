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
  septiembre de 2026, se hará más adelante; K va antes. Su colección trae cinco
  problemas fechados como examen (T2 P7, P8 y P9; T3 P5 y P6), que dan para
  medir la ruta de la ordinaria; los de CNC piden un tipo de respuesta para
  código.
- **K · Expresión Gráfica después de la fase 1**: las hojas 52–55 son
  exámenes y ordenan la fase 2 (familias B, E y G antes que A y H); el
  bloque 2 apenas necesita `lib/vistas` y conviene que no espere a la fase 3.
- **La deuda de abajo, intercalada** en los huecos del suelo y del
  despliegue, un commit por punto: mirar entero el primer despliegue después
  del 19 de octubre, cuando `ubuntu-latest` pase a Ubuntu 26.

## Lo decide quien mantiene el proyecto

Preguntado uno a uno el 27 de septiembre de 2026; queda abierto lo que no se
sabía:

- **Expresión Gráfica**: si en el examen de dibujo técnico se pueden usar las
  tablas ISO —lo va a preguntar; la nota general de la UPV/EHU
  (`Nota_sobre_la_evaluacin_de_pruebas_acadmicas.pdf`, pág. 2) prohíbe libros
  y apuntes salvo indicación expresa—; si el diédrico se examina con la
  figura a escala o por coordenadas; y si la Colección de ejercicios de
  2026-27 es la misma que la de 2025-26, que es la que se ha transcrito (la
  carpeta de eGela de este curso, añadida el 1 de octubre de 2026, no la
  trae). La rúbrica de láminas ya está: viene en esa carpeta.
- **Expresión Gráfica, los Ejercicios 53 y 55 de la colección**, cuatro cosas
  que el enunciado no dice y se han supuesto, cada una declarada en su
  ejercicio: en el 55·1, que α es el menor de los dos ángulos entre AB y BC;
  en el 55·2, que el plano ABCD es una lámina opaca, que es lo que decide la
  visibilidad del alzado; en el 53·3 A, que «el ángulo entre los dos planos»
  es el menor, 86,10°, y no el de las caras, 93,90°, que se da como
  distractor sin castigar; y en el 53·3 B, la visibilidad del refuerzo, que
  el enunciado no pide y no se afirma.
- **Expresión Gráfica, el Ejercicio 46 de la colección (SD62)**: en el b), que «el ángulo
  existente entre los planos AVB y CVB» es el menor, 67,77°, y no el de las caras, 112,23°, que
  se da como distractor sin castigar; es la misma pregunta que el 53·3 A.
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
- **Sistemas**: si el examen da las hojas del catálogo Sandvik o los valores
  de corte en el enunciado.
- **Materiales**: una copia limpia de las preguntas guía, porque el fichero
  lleva «Grupos» en el nombre y no se abre.
- **Química, la resolución de 2013**: si se publica como PDF de su
  convocatoria (`2012-2013-ord`), como se hizo con las veinte de Térmica el
  10 de septiembre de 2026. Es la corrección del profesor, mecanografiada y
  sin datos personales, y §08 solo deja entrar enunciados sin una decisión
  expresa: hasta entonces la página lleva `sinPdf`. El modelo de 2024-2025 no
  entra en la pregunta: es un escaneado con su letra, y esos no se publican.

## Hacer

### La siguiente asignatura: Expresión Gráfica

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

- **Térmica, los veinte PDF que son la resolución completa del profesor**:
  servir solo el enunciado, como en las otras convocatorias. Partir cada PDF,
  y que el aviso de `Examen.astro` diga que la resolución del profesor está
  en el material de la asignatura.
- **La barra de puntos de cada examen**: rediseñarla, con borde entre franjas
  y la cifra dentro, para que no dependa del color (contrastes de 2,92, 1,77
  y 1,65).
- **Fluidos, cantidad de movimiento**: reescribir las 22 resoluciones para
  que empiecen nombrando el volumen de control y por qué.
- **Calculadora**: en los exámenes de Fluidos y de Química se usa la Casio
  fx-570SP CW, científica y no programable. Sus páginas de asignatura ya lo
  dicen; falta no usar en las resoluciones nada que ella no haga.
- **Álgebra**: el examen de prácticas se hace con Maxima en ordenador.
  Decirlo en la ficha; practicar los comandos cae en la fase D o la E.
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
- **Ruta de Fluidos**: decir por qué los cinco parciales no tienen ruta propia
  (sus 21 ejercicios están enlazados; `tambienPrepara` solo nombra la
  extraordinaria).
- **Térmica**: su ruta mide sobre 17 de 20 convocatorias y no lista las tres
  anteriores a 2017 en `fueraDeLaVentana`, como sí hace `calculo-ord`.
- **Seis títulos de tema** del `.mdx` que no coinciden con el catálogo:
  Cálculo t02, t03 y t04; Fluidos t03, t21 y t23.
- **«Cortante» en Mecánica**: ya está en la prosa del t06 y en 216 pasos;
  falta, si acaso, un apartado propio. Acotar antes de escribir.
- **Los pasos bloqueados se leen**: `EjercicioGuiado` los pinta atenuados, y
  las piezas de un `justificar` repiten a veces las cifras de los `calcular`
  de antes (`ex1617-3ev-3`, `colfq1-2`, `ejflu14-col42`). Decidir si el cuerpo
  de un paso bloqueado se oculta con JavaScript, sin romper la página sin él.
  Lo vio la revisión de la muestra del 28 de septiembre de 2026.
- **Cálculo, 11.8 `extension-par-de-t`** (t11): el enunciado define $f$ en
  $[0,\pi)$ y la resolución da $f(\pi)=\pi$. Decir que es el valor que la
  extensión toma por continuidad, o que $f$ no está definida ahí.
- Menores: `normaliza()` no lee el ⁴; once `\sin` sueltos en el corpus; KaTeX
  sigue enviando las fuentes ttf y woff además de woff2.

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
  si los incrustados pasan a enlazar su bloque o la ruta se parte.
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
- **La hoja de impresión no cambia los colores**: en `tokens.css`, el bloque
  `@media print { html {…} }` nunca se aplica, porque `html` pesa menos que
  `:root`, y en tema oscuro se imprimiría texto claro. Lo comprobó en
  Chromium, emulando la impresión, el revisor del laboratorio de Materiales
  el 29 de septiembre de 2026. Un arreglo es `html[lang]`, y toca todo el
  sitio: mirar la impresión de un tema, un examen y un formulario antes y
  después.
- **Coherencia**: seis simuladores usan `data-caso` para sus preajustes y dos
  `data-accion`; `ALCANCE_CONV` del índice de exámenes está pensado para
  Cálculo; y `TestDeMinimos` no alinea como `Cuestiones` una opción que es
  solo una fórmula, que desde E3 llega en bloque (`aTamanoDeFormula`): hoy
  no se nota porque el banco de Materiales no trae fórmulas.

### Lo que dejó abierto la fase I (Fluidos)

- **`src/lib/unidades.ts` lee «mN» como meganewton.** Hoy no muerde: todas
  las preguntas piden N. Es una trampa para la primera que pida milinewton.
- **`scripts/revisa-ejercicios.mjs` no valida los pasos `dibujar`**: uno con
  dos puntos de `comprueba` pasa sin aviso.
- **El guardián de las notas impresas no ve una «Nota:» a media línea** (la
  del 4 de la extraordinaria de 2023, transcrita a mano): la regla de
  `scripts/notas-impresas.mjs` exige que empiece la línea. Ampliarla sin
  traer falsos positivos, midiendo antes cuántos saca.
- **La frase de la ruta de Fluidos sobre la colección** («224 problemas
  transcritos y esta ruta enlaza 94», contada el 8 de septiembre): un
  recuento de hoy por ids da 216 y 86. Contar con el mismo criterio que
  entonces antes de cambiarla.
- **Los metadatos de los PDF de Fluidos** en `public/examenes/fluidos/`
  llevan un nombre en el campo Author. Preguntado a Ionan si se borra (no
  cambia la página); sin respuesta.

## Bloqueado por material

Solo lo que la carpeta no trae, mirado en la página renderizada (CLAUDE.md
§17, «El volcado no es la página»). Lo que parecía bloqueado y es trabajo
está en su fase: las convocatorias bilingües de Mecánica en C1, Sistemas en J
y la colección de Química en «Contenido». Los `fuera` de Fluidos que se
daban por bloqueados salieron en la fase I: todos menos uno eran trabajo.

- **Ciencia de Materiales**: la ruta medida, hasta que haya exámenes de
  teoría y problemas. El formulario, el simulacro 40/60 y el laboratorio no
  esperan: son la fase H.

Los guiones de las prácticas de Química ya no están aquí: esas prácticas se
preparan en clase y el sitio no las cubre, por decisión del 27 de septiembre
de 2026. Lo dicen sus bloques en las dos rutas.
