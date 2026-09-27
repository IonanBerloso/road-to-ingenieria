# Siguiente sesión

Se sobrescribe cada vez; no se amplía. Lo que queda más allá está en
`pendiente.md`, con las fases en orden arriba del todo.

Escrito el 28 de septiembre de 2026, al cerrar la fase D: cada ejercicio de
examen de Álgebra que pide demostrar y cada uno de Cálculo con COMP4 ≥ 6
tiene su paso `redactar`, y el trinquete de `deuda.mjs` §11 está a cero en las
dos. Las rúbricas compartidas viven en `src/content/rubricas/`; las dos rutas
de Álgebra tienen un bloque «Las demostraciones que caen», por frecuencia.

## Qué toca: la fase E, herramientas que pasan la prueba de utilidad

El encargo está en `2027 proyecto contenido/auditorias/2026-09-27/`
(`encargo-por-fases.md`, fase E). Cada pieza escribe antes, en su cabecera,
las cuatro respuestas de §13: para quién, cuándo, qué gana y cómo se
comprueba.

1. **E1 · «¿Qué nota necesito?»** La `evaluacion` de cada catálogo como
   números —pesos, mínimos, umbrales, si renormaliza— y un componente
   estático. Un test por regla, que reproduzca los ejemplos de las guías (el
   6,8 de Materiales, el 1,5/3,75 y el tope de 4,5 de Cálculo, el 3,5 del
   laboratorio de Química, el 40 % del examen de Térmica, el 5 por bloque de
   Mecánica). Donde la regla no está documentada, no se inventa.
2. **E2 · La página de asignatura.** Hoy `/calculo/` da 404 en las nueve. La
   ficha, la barra de la nota con `entrena: sí | parcial | no` por parte, qué
   se puede llevar al examen con su fuente, por dónde empezar y la
   calculadora de E1. Acepta: la barra suma 100 y cada «no» dice qué buscar
   fuera.
3. **E3 · El banco de test de Cálculo.** Más de 220 preguntas A–D en los PDF
   de tema, por tema en `src/content/banco/`, con un `porque` por opción;
   `TestDeMinimos` con un banco por tema. Hay opciones que son imagen.
4. **E4 · El peso de las páginas de tema.** `t05` pesa 11,9 MB. Los
   ejercicios en subpáginas, con las anclas desde `rutas.ts`, y un listón de
   3 MB en `peso.mjs`.
5. **E5 · Decimales y distractores.** `deuda.mjs` tiene que leer también el
   `formato`; los 43 pasos de Cálculo que piden seis decimales o más sin
   calculadora; y una revisión por muestreo de diez mensajes por sesión.
6. **E6 · El inventario del material**, `npm run inventario-material`, sin
   abrir los ficheros vetados.

## Lo que quedó apuntado de la fase D

- Las igualdades de la norma, las matrices especiales, la unicidad de las
  coordenadas y las definiciones no tienen un ejercicio de práctica en su
  tema: sus escalones del bloque de demostraciones arrancan en uno de examen,
  y lo declara su `falta[]`.
- `revisa-ejercicios.mjs` dibuja ya la consigna y la rúbrica de cada
  `redactar`, la compartida incluida. Úsalo antes de pegar cualquiera.
