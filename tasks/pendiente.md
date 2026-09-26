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

- **A · Arreglos rápidos en todas las asignaturas** (~2 días): `siguiente.md`.
- **B · Expresión Gráfica, fase 1 tal cual.** Ya están las recetas, la
  corrección, la geometría, SD1 cotejada y el paso `construir` resuelto;
  faltan el esquema, el `Taller`, SD1 en el tema 2 y su comprobador, y
  después SD4, SD5 y el patrón en §05. El plan es el `siguiente.md` del
  commit 479053d, y los borradores están en
  `Claude outputs/fase-1-borradores/`.
- **C · Mecánica**: las cinco convocatorias bilingües, las deducciones con
  `redactar` y los diagramas con `dibujar` (6–8 días).
- **D · Demostraciones en 1.º**: Álgebra y Cálculo, con rúbricas compartidas
  y un guardián de COMP4 (4–5 días).
- **E · Herramientas que pasan la prueba de utilidad** (§13): la calculadora
  de «¿qué nota necesito?», la página de asignatura, el banco de test de
  Cálculo, el peso de las páginas de tema, decimales y distractores, y el
  inventario del material (3–4 días).
- **F · Térmica**: tablas propias, los seis apartados de 2025-26, tema 7 y
  prácticas (5–6 días).
- **G · Química**: formulación, resoluciones oficiales y teoría que falta
  (5–6 días).
- **H · Materiales**: laboratorio, simulacro 40/60 y test de 7–10 (5–6 días).
- **I · Fluidos**: prácticas, los `fuera` recuperables y los criterios del
  profesor (5–6 días).
- **J · Sistemas de Producción** (~4 semanas).
- **K · Expresión Gráfica después de la fase 1**: las hojas 52–55 son
  exámenes y ordenan la fase 2 (familias B, E y G antes que A y H); el
  bloque 2 apenas necesita `lib/vistas` y conviene que no espere a la fase 3.
- **La deuda de abajo, intercalada** en los huecos del suelo y del
  despliegue, un commit por punto: las acciones del despliegue antes del 19
  de octubre.

## Lo decide quien mantiene el proyecto

- **Los veinte PDF de Térmica que son la resolución completa del profesor**:
  se publicaron el 10 de septiembre con un «publícalo todo» que quedó como
  provisional. ¿Siguen? (`manana.md`, 10.7 bis §1).
- **La barra de puntos de cada examen** tiene contrastes de 2,92, 1,77 y 1,65
  entre franjas: ¿basta la leyenda, o se rediseña? (`manana.md`, 10.5 bis).
- **Fluidos, cantidad de movimiento**: ¿se reescriben las 22 resoluciones para
  que nombren el volumen de control? (`todo.md`, «La reauditoría · 2»).
- **Datos del mundo que el repositorio no tiene**: si el examen de Fluidos
  admite calculadora programable; qué se hizo en cada práctica de
  laboratorio; el criterio de la profesora de Materiales sobre el 4.19 (el
  sitio publica 55,2 % y explica el 44,8 % impreso). La duración de los
  exámenes sin cuadernillo que la imprima ya la dio Ionan el 27 de septiembre
  de 2026: entre 25 y 30 minutos por ejercicio.
- **Expresión Gráfica** (del brief del 8 de septiembre, §7, y de la auditoría
  del 27): de qué año son las hojas 52–55 del final de la colección —la
  auditoría las da por exámenes: la 54 se titula «Azterketa / Examen»—; el
  PDF de la rúbrica de láminas, que en la carpeta es solo el enlace de eGela;
  si en el examen de dibujo técnico se pueden usar las tablas ISO; y si el
  diédrico se examina con la figura a escala o por coordenadas.
- **Las preguntas abiertas de la auditoría del 27 de septiembre**: si el
  examen de Álgebra deja calculadora; qué entra en su examen de prácticas y
  qué son los controles del 20 %; si el examen de Sistemas da las hojas del
  catálogo Sandvik o los valores en el enunciado; los guiones del laboratorio
  de Química; y una copia limpia de las preguntas guía de Materiales, porque
  el fichero lleva «Grupos» en el nombre y no se abre.

## Hacer

### La siguiente asignatura: Expresión Gráfica

- **El diseño antes que el contenido**: su examen es un dibujo. El catálogo
  ya salió de `prev` el 26 de septiembre de 2026, con el temario y la
  evaluación de la guía 25976. Fuera del repositorio está el diseño aprobado
  el 8 de septiembre: `Claude outputs/expresion-grafica-brief.md` y
  `expresion-grafica-paquete-1.zip` (las 65 láminas en JSON, el extractor,
  los pilotos del taller para SD3, SD5 y SD7 con sus comprobaciones, y
  `sd1-ejemplo.yaml`). El orden que propone: `lib/diedrico.ts` mínimo con sus
  pruebas y los valores de referencia de SD1, el componente `Taller` y el
  paso `construir`; después SD4 y SD5, y solo entonces se cierra el patrón.
- **Los criterios de corrección del profesor como datos**
  (`Criterios_para_la_correcin_de_ejercicios_y_exmenes.pdf`): mínimos, errores
  muy graves a −2 y típicos con su precio. Los usan el bloque 2 y las rúbricas.
- **El material**: 51 ficheros, con colección resuelta y criterios de
  corrección; sin exámenes. Los dos de notas no se abren (CLAUDE.md, «Antes de
  nada»).

### Contenido

- **Térmica, ordinaria de 2025-2026**: seis apartados declarados en su `fuera`
  (1e y 2b a 2f), con la resolución oficial en el PDF. Después, contar
  apartados en las otras diecinueve convocatorias (`manana.md` 10.1).
- **Pesos de tema donde la ruta y las etiquetas no coinciden** (CLAUDE.md §10):
  Fluidos t07, t17, t18, t19 y t23; Térmica t08 y t10; Mecánica t01 (cae en
  dos de tres, como t03 y t06, y dice medio) y t02 (una de tres, dice bajo).
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
  sigue enviando las fuentes ttf y woff además de woff2; el catálogo de
  Sistemas tiene un tema sin clave `hecho`.

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

- **Ciencia de Materiales**: ruta y cierre, hasta que haya exámenes de teoría
  y problemas.
- **Sistemas de Producción**: todo, y se deja para más adelante (§00). Dos
  cosas que mirar al abrirla: si su colección trae fechas de examen
  («Ordinaria 2021-22»), que darían para medir una ruta, y que los problemas
  de CNC piden un tipo de respuesta para código.
- **Fundamentos Químicos**: la colección de los temas 3, 4, 6 y 10.
- **Mecánica de Fluidos**: doce problemas de la colección, trece ejercicios de
  examen `fuera` y las veintisiete prácticas de laboratorio.
- **Ingeniería Térmica**: ocho `fuera` que no son trabajo (temario, repetidos
  y un diagrama de Mollier de editorial).
- **Mecánica Aplicada**: cinco convocatorias solo en euskera.
