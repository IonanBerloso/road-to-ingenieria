# Road to Ingeniería 1.0

Medido el 28 de octubre de 2026 sobre el commit de la etiqueta `v1.0`. Ninguna cifra de esta
página está escrita a mano: salen de `scripts/mide.mjs` y `scripts/deuda.mjs`,
y se pueden volver a medir con esos dos guiones.

## Qué es la 1.0

Las nueve asignaturas del primer cuatrimestre de primero, con su teoría,
sus ejercicios resueltos paso a paso y, en ocho de las nueve, una ruta de
examen medida sobre las convocatorias que publica el propio sitio. «Medida»
quiere decir que cada bloque de la ruta dice en cuántas de esas convocatorias
cae, y que esa cifra la comprueba un guion en cada construcción.

| Asignatura | Temas | Ejercicios | Pasos | Convocatorias | Rutas |
|---|---:|---:|---:|---:|---:|
| Álgebra | 7 | 212 | 752 | 8 | 2 |
| Cálculo | 11 | 824 | 3445 | 88 | 7 |
| Ciencia de Materiales | 10 | 140 | 741 | — | — |
| Elasticidad y Resistencia de Materiales | 14 | 292 | 1672 | 31 | 4 |
| Expresión Gráfica | 11 de 17 | 101 | 481 | 4 hojas | 1 |
| Fundamentos Químicos de la Ingeniería | 10 | 202 | 1177 | 8 | 2 |
| Ingeniería Térmica | 10 | 119 | 625 | 20 | 1 |
| Mecánica Aplicada | 12 | 273 | 1345 | 8 | 2 |
| Mecánica de Fluidos | 23 de 25 | 397 | 2025 | 16 | 1 |
| **Total** | | **2560** | **12.263** | | **20** |

De los 17 temas de Expresión Gráfica, 4 se dan solo en clase (la página de la asignatura dice por qué), y 2 están sin escribir.
De los 25 temas de Mecánica de Fluidos, 2 se dan solo en clase (la página de la asignatura dice por qué).

Entre las rutas hay 197 bloques y 497 escalones. Hay además 11
simuladores y 138 exámenes originales en PDF, servidos sin metadatos de autor.

## Cuánto está comprobado

- **1718 de 2382 respuestas de examen (72 %) están recalculadas**
  aparte, en `tests/verificacion/`, por un camino escrito sin mirar la
  resolución. La cifra se cuenta leyendo las pruebas, así que no se puede
  inflar a mano.
- **4.016 pruebas** pasan en `npm test` (lo dice vitest, no un recuento).
- El suelo (`npm run suelo`) construye el sitio y pasa, antes de cada
  publicación, la validación, el recálculo, las cifras, el color, el
  contraste, las pruebas, el humo de cada página, los simuladores y los
  talleres.
- La auditoría de cierre, del 26 de octubre de 2026, no encontró nada que
  enseñe algo falso. Rehízo 36 ejercicios de seis asignaturas sin hallar un
  error de cuenta, recorrió cada ruta en el móvil y miró nombres, PDF y lo que
  el sitio dice de sí mismo. Sus dos fallos (una tolerancia que aceptaba un
  error típico y una frase de catálogo que había dejado de ser verdad) se
  arreglaron antes de la etiqueta; lo demás está en `tasks/pendiente.md`.

## Qué no es la 1.0

- **Ciencia de Materiales** sigue en obra. Temas, colección, test de mínimos, formulario, laboratorio, test de 7 a 10 y simulacros escritos. Sin exámenes de teoría y problemas no hay ruta medida.
- **Expresión Gráfica** sigue en obra. El bloque 1, el diédrico, está entero. Del bloque 2 están los temas 7, 8 (las vistas, con sus cuatro primeros ejercicios), 10, 11 y 12; faltan los cortes y el despiece (9 y 13).
- **Sistemas de Producción y Fabricación** y **el bloque 2 de Expresión
  Gráfica** son del segundo cuatrimestre y vienen después de la 1.0.
- Lo que falta de cada asignatura, con su motivo, está en `tasks/pendiente.md`.

## Después de la 1.0

Cada actualización que se publique después de esta etiqueta es una versión
nueva, con su propia etiqueta: la primera, `v1.1`; la segunda, `v1.2`; y así
seguido.
