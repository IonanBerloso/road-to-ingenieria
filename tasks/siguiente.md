# Siguiente sesión

Se sobrescribe cada vez; no se amplía. Lo que queda más allá está en
`pendiente.md`, con las fases en orden arriba del todo.

Escrito el 27 de septiembre de 2026, a mitad de la fase 1.

## Qué toca: el componente `Taller` y SD1 entero

Lo que ya está, con sus pruebas en `tests/geometria/`:

- `lib/diedrico.ts`: la geometría de SD1, SD3, SD4, SD5 y SD7, cotejada con
  los pilotos (rectas del espacio, punto a distancia real, pie de la
  perpendicular, plano dado por su l.m.p.).
- `lib/diedrico-receta.ts`: las recetas como datos —cuentas, elecciones para
  las láminas con dos soluciones, firmas que rechazan un argumento de más o
  mal escrito—, revisado dos veces por un agente.
- `lib/diedrico-corrige.ts`: lo único que irá a la página (`acierta`,
  `cumple`).
- `src/content/laminas/sd1.json`: la primera lámina, cotejada con el PDF a
  2.000 ppp; `scripts/lamina-sobre-pdf.mjs` para las demás.
- `lib/construir.ts`: el paso resuelto, con cada error declarado construido a
  propósito con su `ejemplo`, sin navegador.

1. **El paso `construir` en el esquema** (`content.config.ts`): la forma de
   `ConstruirDeclarado` de `lib/construir.ts`, con dos diagnósticos como
   mínimo, el último `siempre` y un `ejemplo` en todos los demás; y un campo
   `receta` en el ejercicio (`lamina`, `escena`, `solucion`, `comprueba`). Los
   `calcular` de Expresión Gráfica llevan `receta:` junto a cada cifra
   (`docs/decisiones.md`).
2. **`Taller.astro`**, portado de `taller/taller-base.html` del paquete: la
   lámina dibujada desde sus datos con los tokens del sitio; herramientas con
   enganche (punto, recta, paralela, perpendicular, vertical, horizontal,
   compás, radio, medir, borrar); la tira de objetivos; la pista al tercer
   fallo y el trazado al quinto. Corrige con `lib/diedrico-corrige`, sin
   calcular nada. `EjercicioGuiado` resuelve la receta con `lib/construir` y
   le pasa el paso compilado; se hablan por eventos.
3. **SD1 en el tema 2** de Expresión Gráfica, con su prosa, y la prueba que
   resuelve todos los `construir` del corpus sin construir el sitio.
4. **Su comprobador en el navegador**: el camino bueno y un error por
   objetivo, en claro, en oscuro y a 360 px.
5. Después SD4 y SD5, y el patrón en §05.

Mientras corren el suelo o el despliegue, la deuda de `pendiente.md`, empezando
por los seis apartados de Térmica 2025-26.
