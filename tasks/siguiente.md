# Siguiente sesión

Se sobrescribe cada vez; no se amplía. Lo que queda más allá está en
`pendiente.md`, con las fases en orden arriba del todo.

Escrito el 29 de septiembre de 2026, al cerrar la fase G. Química la tiene
entera:

- **G1**: las tres hojas de formulación, en las dos direcciones, y la
  orgánica en la prosa.
- **G2**: la ordinaria de 2013 y el modelo de 2024-2025, los dos sin PDF y con
  sus casos en `tests/verificacion/`.
- **G3**: la teoría que el programa pide (gases, coligativas,
  Clausius-Clapeyron, cinética, pH, ion-electrón…).
- **G4**: `puntosImpresos`, `dibujar` y `redactar` en los seis exámenes, y la
  colección del curso entera en los temas 2 a 10, enlazada desde las dos
  rutas.

## Dónde se quedó, a 29 de septiembre por la noche

- **H1, H4 y H5, integrados**: la prosa y los ejercicios de los temas 2 a 6,
  las secciones nuevas de los temas 7 a 10 con su banco de 65 preguntas
  (`propio`, en `/ciencia-materiales/t07-aleaciones-metalicas/cuestiones/`) y
  el formulario de los temas 1 a 6.
- **H2, el laboratorio**: integrado, con su revisión: la página y ocho
  ejercicios al final de t02, t03 y t06.
- **H3, los simulacros**: integrados. El del examen de los temas 1 a 6
  (40/60, con la nota por partes y el tope de 4,0) y los de los dos
  entregables, con apuntes. Viven en `ciencia-materiales/simulacros/`.
- **Fase I, tanda 0, hecha**: `notas`, `pdfEs: enunciado-con-resultados`,
  `puntosImpresos` en %, la página del laboratorio para prácticas de verdad y
  el guardián de las notas en `verify.mjs` (avisa de 29). Tanda 1: i-t02-t04
  integrada; i-t13 revisada, y entra en el mismo commit que el rescate de
  2526-ord-4 (i-ex-2526); i-lab e i-rub, en revisión. Los avisos para las
  unidades de examen están en el scratchpad (`i/avisos-para-unidades.md`).

## Lo que queda: la fase I, Fluidos, y después J

H está hecha salvo lo que no depende de nosotros: la ruta medida (no hay
exámenes de teoría y problemas) y la copia limpia de las preguntas guía del
test de 7 a 10, que tiene que dar Ionan (`pendiente.md`).

La fase I sigue el plan del scratchpad de esta sesión (`i/PLAN-I.md`, §5):
tandas de cuatro unidades, cada una con su revisión independiente, y la
sesión principal lee el diff de cada revisión antes de integrar.

1. **Tanda 1**: integrar i-lab e i-rub cuando pasen su revisión. Cada
   rúbrica entra con su primer ejercicio, porque `tests/rubricas.test.ts`
   exige que la use alguno.
2. **Tanda 2**: i-ex-2526 (con el rescate de 2526-ord-4 y t13 en el mismo
   commit), i-t01-formulario, i-ex-2425-ord e i-ex-2425-ext.
3. **Tandas 3 a 5** y el cierre (§3.4 a §3.7 del plan: ruta, catálogo,
   CLAUDE.md, simuladores, `NOTAS_BLOQUEAN` a true).
4. **Fase J**, Sistemas: el plan está en `j/PLAN-J.md`. Antes, confirmar con
   Ionan que se abre (CLAUDE.md §00 dice que se deja para más adelante).

## Lo que quedó apuntado de G

- **Humo prueba cada variante de un distractor de fórmula por separado**
  (`«a | b»`): con la barra entera daba por mudos distractores que sí
  diagnosticaban.
- **El lector de unidades entiende «mm Hg» y «mm de Hg»**, que es como lo
  escriben los enunciados de Química.
- **La muestra rotatoria de humo cambia cada día** (ocho exámenes). Un fallo
  que no salió ayer puede salir hoy sin que nada haya cambiado: el «3R» de
  Mecánica 2018-2019-ext salió así.
- **Lo que queda de Química**, dicho en las rutas: los problemas 5, 6 y 7 de la
  hoja del tema 5, y dos preguntas de temperatura de fusión que se dejaron
  fuera porque la regla del curso contradice los datos medidos. Y la
  decisión sobre el PDF de la resolución de 2013, en `pendiente.md`.
