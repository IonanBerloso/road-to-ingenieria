# Siguiente sesión

Se sobrescribe cada vez; no se amplía. Lo que queda más allá está en
`pendiente.md`, con las fases en orden arriba del todo.

Escrito el 27 de septiembre de 2026, a mitad de la fase B (la fase 1 de
Expresión Gráfica). El paso `construir` ya está publicado con SD1.

## Qué hay ya

- El esquema: `pasoConstruir` y `receta` en `content.config.ts`, cifras de un
  `calcular` atadas a la receta con `receta:`, y la regla de COMP2 en el
  esquema y en `revisa-ejercicios.mjs`.
- `lib/construir.ts` con `resuelveEjercicio`, y `evaluaNumero` en
  `lib/diedrico-receta.ts`, con sus pruebas en `tests/geometria/`.
- `patrones/Taller.astro`, cableado en `EjercicioGuiado` por eventos; el modo
  completo y la impresión le piden la solución con `taller:muestra`.
- SD1 en el tema 2, con su prosa. La tolerancia es la del brief, 1 mm: a esa
  distancia la guarda sigue distinguiendo cada error de la solución.
- La guarda del corpus (`tests/geometria/construcciones.test.ts`) y el
  comprobador de navegador en el suelo (`npm run talleres`, CLAUDE.md §11).

## Qué toca

1. **SD4 y SD5** en su tema, con el mismo camino que SD1: la lámina cotejada
   con `scripts/lamina-sobre-pdf.mjs`, la receta (SD5 con su elección), los
   objetivos con un `ejemplo` por error, y la guarda y el comprobador en
   verde. Los borradores de SD1 están en
   `2027 proyecto contenido/Claude outputs/fase-1-borradores/`, y los valores
   del piloto de SD5 y SD7, en `tests/geometria/sd5.test.ts` y `sd7.test.ts`.
2. **El patrón en §05** como «construcción verificada», cuando SD4 y SD5
   hayan confirmado que el camino de SD1 no era un caso único.
3. **En el móvil, la lista de puntos va debajo de la lámina**: para marcar
   hay que bajar a elegir el nombre y subir a pulsar el punto. La línea de
   estado ya avisa del fallo; mirar si la lista cabe encima, o pegada, sin
   tapar el dibujo.
4. Al tema 2 le faltan la figura propia y el ejemplo propio de entrada (§15),
   que son de la fase 2.

Antes de cada pieza nueva, la prueba de utilidad de §13. Mientras corren el
suelo o el despliegue, la deuda de `pendiente.md`, un commit por punto,
empezando por las acciones del despliegue, que tienen que estar antes del 19
de octubre.
