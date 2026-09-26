# Pendiente

Lo que queda por hacer, una línea por cosa, con dónde mirar. **Se borra en el
commit que lo cierra**: la historia va en el mensaje del commit y en
`diario/`, no aquí. Sin recuentos: los da `npm run deuda`. Si este fichero pasa
de unas 150 líneas, se está usando como diario.

Abierto el 26 de septiembre de 2026, al cerrar la auditoría completa, con lo
vivo de `todo.md` y `manana.md` —congelados ese día como archivo— y lo que la
auditoría encontró y no se arregló en el momento.

## Lo decide quien mantiene el proyecto

- **Los veinte PDF de Térmica que son la resolución completa del profesor**:
  se publicaron el 10 de septiembre con un «publícalo todo» que quedó como
  provisional. ¿Siguen? (`manana.md`, 10.7 bis §1).
- **La barra de puntos de cada examen** tiene contrastes de 2,92, 1,77 y 1,65
  entre franjas: ¿basta la leyenda, o se rediseña? (`manana.md`, 10.5 bis).
- **Fluidos, cantidad de movimiento**: ¿se reescriben las 22 resoluciones para
  que nombren el volumen de control? (`todo.md`, «La reauditoría · 2»).
- **Datos del mundo que el repositorio no tiene**: cuánto dura el examen de
  Fluidos y si admite calculadora programable; qué se hizo en cada práctica de
  laboratorio; el criterio de la profesora de Materiales sobre el 4.19 (el
  sitio publica 55,2 % y explica el 44,8 % impreso).

## Hacer

### La siguiente asignatura: Expresión Gráfica

- **Sacarla de `prev`**: temario oficial y evaluación con la guía citada.
  `manana.md` §10.8 anota diédrico 30 %, dibujo técnico 55 % y CAD 15 %, con
  un 4 de mínimo en cada parte: se comprueba contra la guía antes de publicarlo.
- **El diseño antes que el contenido**: su examen es un dibujo. Fuera del
  repositorio hay un paquete (`Claude outputs/expresion-grafica-paquete.zip`:
  65 láminas en JSON, un paso `construir`, cuatro ejercicios probados). Se lee
  antes de escribir nada, y se contrasta con el paso `dibujar` y con el patrón
  «figura fija» (§05).
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
  nueve; el reloj de `Examen` y de `TestDeMinimos`; la cuenta de ejercicios
  de un cuadernillo, en tres sitios; `sinTildes`, en tres.
- **Código muerto**: la prop `crumb` de `Base.astro` (seis páginas la pasan y
  no se lee); `hayFormulario` (la portada lo reimplementa); `esFormulaQuimica`
  (solo lo usan los tests); tres selectores de `print.css` sin elemento; el
  panel «Tu avance», emitido en cada bloque de la ruta y usado solo el primero.
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
