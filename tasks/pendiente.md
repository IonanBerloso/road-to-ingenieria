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

- **D · Demostraciones en 1.º** (la siguiente; A, B y C están hechas):
  Álgebra y Cálculo, con rúbricas compartidas y un guardián de COMP4
  (4–5 días).
- **E · Herramientas que pasan la prueba de utilidad** (§13): la calculadora
  de «¿qué nota necesito?», la página de asignatura, el banco de test de
  Cálculo, el peso de las páginas de tema, decimales y distractores, y el
  inventario del material (3–4 días).
- **F · Térmica**: tablas propias, los seis apartados de 2025-26, tema 7 y
  prácticas (5–6 días).
- **G · Química**: formulación, resoluciones oficiales y teoría que falta
  (5–6 días).
- **H · Materiales**: laboratorio, simulacro 40/60 y test de 7–10 (5–6 días).
  Antes del simulacro, la evaluación final: la guía (pág. 12) pide examen
  escrito y práctico con un 5,0 en cada uno, y la diapositiva 15 da un 4,0
  al escrito.
- **I · Fluidos**: prácticas, los `fuera` recuperables y los criterios del
  profesor (5–6 días).
- **J · Sistemas de Producción** (~4 semanas). Su colección trae cinco
  problemas fechados como examen (T2 P7, P8 y P9; T3 P5 y P6), que dan para
  medir la ruta de la ordinaria; los de CNC piden un tipo de respuesta para
  código.
- **K · Expresión Gráfica después de la fase 1**: las hojas 52–55 son
  exámenes y ordenan la fase 2 (familias B, E y G antes que A y H); el
  bloque 2 apenas necesita `lib/vistas` y conviene que no espere a la fase 3.
- **La deuda de abajo, intercalada** en los huecos del suelo y del
  despliegue, un commit por punto: las acciones del despliegue antes del 19
  de octubre.

## Lo decide quien mantiene el proyecto

Preguntado uno a uno el 27 de septiembre de 2026; queda abierto lo que no se
sabía:

- **Expresión Gráfica**: si en el examen de dibujo técnico se pueden usar las
  tablas ISO —lo va a preguntar; la nota general de la UPV/EHU
  (`Nota_sobre_la_evaluacin_de_pruebas_acadmicas.pdf`, pág. 2) prohíbe libros
  y apuntes salvo indicación expresa—; si el diédrico se examina con la
  figura a escala o por coordenadas; y el PDF de la rúbrica de láminas, que
  en la carpeta es solo el enlace de eGela.
- **Sistemas**: si el examen da las hojas del catálogo Sandvik o los valores
  de corte en el enunciado.
- **Materiales**: una copia limpia de las preguntas guía, porque el fichero
  lleva «Grupos» en el nombre y no se abre.

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
- **Los criterios de corrección del profesor como datos**
  (`Criterios_para_la_correcin_de_ejercicios_y_exmenes.pdf`): mínimos, errores
  muy graves a −2 y típicos con su precio. Los usan el bloque 2 y las rúbricas.
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
  fx-570SP CW, científica y no programable. Decirlo en sus fichas y no usar
  en las resoluciones nada que ella no haga.
- **Álgebra**: el examen de prácticas se hace con Maxima en ordenador.
  Decirlo en la ficha; practicar los comandos cae en la fase D o la E.
- **Expresión Gráfica, hojas 52–55**: nadie sabe de qué año son; se
  transcriben como examen con fuente «sin fecha» (fase K).

- **Química, la colección que sí está** (verificado el 27 de septiembre de
  2026, fase G): formulación, 180 compuestos en tres hojas con la clave
  completa de la tercera; tema 2, resueltos del 4 al 11 y 35 propuestos;
  tema 3, el Born-Haber del LiF con siete preguntas y cuatro de enlace
  intermolecular; tema 4, dos de Clausius-Clapeyron con respuesta y seis de
  test de gases; tema 6, los n.º 3 y 8 de la hoja del tema 5; tema 10,
  catorce ajustes por ion-electrón y cuatro problemas resueltos de pilas con
  siete propuestos con solución (`Tema_10.2`, págs. 27–39).
- **Fluidos, el aviso de la resolución**: sus piezas con resultado publicado
  llevan el «el examen no publica solución» de `Examen.astro`, y no es
  cierto: los enunciados traen los resultados. Fase I.
- **Térmica, ordinaria de 2025-2026**: seis apartados declarados en su `fuera`
  (1e y 2b a 2f), con la resolución oficial en el PDF. Después, contar
  apartados en las otras diecinueve convocatorias (`manana.md` 10.1).
- **Pesos de tema donde la ruta y las etiquetas no coinciden** (CLAUDE.md §10):
  Fluidos t07, t17, t18, t19 y t23; Térmica t08 y t10. Los de Mecánica del
  bloque 1 se revisaron con las cinco convocatorias.
- **`revisado` en los 26 bloques de Álgebra y Fluidos**: pasarlos por los
  criterios de hueco de su `criterioDeOrden` y entonces sí fecharlos. Es un día
  de trabajo; sellar la fecha sin hacerlo sería inventar (`manana.md` 10.7).
- **Tres escalones con un `ejemplo` en medio** (`npm run deuda`, §2 bis): dos
  en `fundamentos-quimicos-2c` y uno en `ingenieria-termica-ord`.
- **Nueve `fuente` que esconden una discrepancia** que su resolución sí
  explica (`manana.md` 10.2).
- **Ruta de Fluidos**: decir por qué los cinco parciales no tienen ruta propia
  (sus 21 ejercicios están enlazados; `tambienPrepara` solo nombra la
  extraordinaria).
- **La única respuesta de examen sin recalcular**: Fluidos 2022-2023-ext,
  ejercicio 6 (`npm run deuda`, §1 bis). Ampliar la tolerancia, pasarla a
  `fuera` o releerla.
- **Térmica**: su ruta mide sobre 17 de 20 convocatorias y no lista las tres
  anteriores a 2017 en `fueraDeLaVentana`, como sí hace `calculo-ord`.
- **Seis títulos de tema** del `.mdx` que no coinciden con el catálogo:
  Cálculo t02, t03 y t04; Fluidos t03, t21 y t23.
- **«Cortante» en Mecánica**: ya está en la prosa del t06 y en 216 pasos;
  falta, si acaso, un apartado propio. Acotar antes de escribir.
- Menores: `normaliza()` no lee el ⁴; once `\sin` sueltos en el corpus; KaTeX
  sigue enviando las fuentes ttf y woff además de woff2.

### Documentación

- **`docs/como-vamos.md`**: reducirlo a lo que generan `mide.mjs` y
  `deuda.mjs`, unas 200 líneas. Hoy son 1.284, y casi todo es narración por
  asignatura con las cifras de su día; se puso al día lo que era falso el 26
  de septiembre de 2026, no lo demás.

### Despliegue

- **Las acciones del flujo avisan de Node 20 obsoleto** (`checkout`,
  `setup-node`, `cache`, `upload-pages-artifact`, `deploy-pages`, todas en
  v4): hoy GitHub las fuerza a Node 24 y funcionan. Subirlas de versión
  comprobando en su repositorio cuál es la primera que declara Node 24, no a
  ojo.
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
- **Duplicados** (Regla 0): el controlador de pestañas de `Tema` y `Examen`
  —ya se desincronizó una vez, en el `afterprint`—; el marco CSS de los
  simuladores, copiado en diez en dos familias; el formateador `num`, en
  nueve —con variantes: unificarlo cambia salidas que `npm run sim` compara
  carácter a carácter, así que va simulador a simulador—; el reloj de
  `Examen` y de `TestDeMinimos`.
- **Coherencia**: seis simuladores usan `data-caso` para sus preajustes y dos
  `data-accion`; `ALCANCE_CONV` del índice de exámenes está pensado para
  Cálculo; la plantilla de laboratorio dice «GeoGebra» y pinta `trabajo` sin
  `mate()`.

## Bloqueado por material

Solo lo que la carpeta no trae, mirado en la página renderizada (CLAUDE.md
§17, «El volcado no es la página»). Lo que parecía bloqueado y es trabajo
está en su fase: las convocatorias bilingües de Mecánica en C1, la tobera de
Térmica en F1, las prácticas y siete `fuera` de Fluidos en I1 e I2, Sistemas
en J y la colección de Química en «Contenido».

- **Ciencia de Materiales**: la ruta medida, hasta que haya exámenes de
  teoría y problemas. El formulario, el simulacro 40/60 y el laboratorio no
  esperan: son la fase H.

Los guiones de las prácticas de Química ya no están aquí: esas prácticas se
preparan en clase y el sitio no las cubre, por decisión del 27 de septiembre
de 2026. Lo dicen sus bloques en las dos rutas.
