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
- **H2, el laboratorio**: revisado; su autor aplica la revisión. Al
  integrarlo, los ejercicios van al final de t02, t03 y t06, y el YAML lleva
  `enIndice`, `practica`, `ejercicios` y `donde.apartado`.
- **H3, el simulacro 40/60**: sin empezar (abajo).
- **Fase I, tanda 0, hecha**: `notas`, `pdfEs: enunciado-con-resultados`,
  `puntosImpresos` en %, la página del laboratorio para prácticas de verdad y
  el guardián de las notas en `verify.mjs` (avisa de 29). Tanda 1 en marcha:
  i-t02-t04, i-t13 e i-lab; falta i-rub.

## Lo que queda de H, Ciencia de Materiales

El encargo está en `2027 proyecto contenido/auditorias/2026-09-27/`
(`encargo-por-fases.md`, fase H, y `ciencia-materiales.md`). El plan por
unidades, hecho el 29 de septiembre, está en el scratchpad de esa sesión
(`h/PLAN-H.md`); lo esencial:

1. **H1 · Escritura y dibujo.**
   - **Hecho:** los temas 2 y 4, con su revisión independiente aplicada.
   - **En marcha:** los temas 3, 5 y 6.
   - Los ejercicios de teoría escrita van al final del tema (§04).
2. **H2 · Laboratorio:** la página, en la colección `laboratorio`, y unos ocho
   ejercicios. En marcha.
3. **H3 · Simulacro 40/60.** Lo hace la sesión principal, y falta decidir cómo:
   - un `examen.yaml` puede citar ejercicios de tema por su id (la página los
     busca en todos los `ejercicios.yaml`), así que un simulacro de problemas
     del listado no obliga a duplicar nada;
   - lo que sí pide es un tipo de convocatoria que diga que no es un examen,
     y que no cuente en las cifras de convocatorias;
   - la calculadora de «¿qué nota necesito?» ya tiene la regla de la
     diapositiva 20: basta con enlazarla.
4. **H4 · Test de 7–10:** los 12 temas de presentación, la prosa que falta
   (alótropos del carbono, aluminosilicatos, copolímeros) y un banco de unas
   60 preguntas. En marcha.
5. **H5 · Formulario:** «Lo que hay que llevar sabido» en T1–T6. En marcha.

Cada entrega de un agente pasa por una revisión independiente antes de
integrarse, y la sesión principal lee entero el diff de lo que la revisión
cambia.

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
