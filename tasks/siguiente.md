# Siguiente sesión

Se sobrescribe cada vez; no se amplía. Lo que queda más allá está en
`pendiente.md`, con las fases en orden arriba del todo.

Escrito el 28 de septiembre de 2026, al cerrar la fase E. Su última pieza,
E3, puso las 257 preguntas tipo test de las diapositivas de Cálculo en
`src/content/banco/`, un banco por tema, con un porqué en cada opción y una
página por tema (`…/tNN-…/cuestiones/`). El encargo pedía cuatro opciones,
una sola buena y `TestDeMinimos`; las diapositivas traen de dos a seis
opciones, algunas con más de una cierta, y se practican sin reloj. Cómo quedó y por qué, en CLAUDE.md §05, «Las cuestiones».

## Qué toca: la fase F, Ingeniería Térmica

El encargo está en `2027 proyecto contenido/auditorias/2026-09-27/`
(`encargo-por-fases.md`, fase F). Es para quien se examina en enero con unas
tablas de vapor que el sitio nunca le ha hecho usar.

1. **F1 · Tablas propias y aprender a leerlas** (2–3 días). Generarlas con
   IAPWS-IF97 (`iapws`, en Python) sobre la misma rejilla que el anexo del
   curso: saturación por T y por P, sobrecalentado y líquido comprimido.
   Van en JSON, con casos en `tests/fisica/` (a 0,5 bar: v'' = 3,24,
   h' = 340,54, h'' = 2645,2). Con los mismos datos, una página «Tablas» y
   un Mollier h-s en SVG. Se añaden 8–10 ejercicios de interpolación
   (simple, doble, inversa por s o por h, líquido comprimido con
   h ≈ h'(T)), y los valores de tabla salen de los enunciados de vapor a la
   `pista` o al `desarrollo`. Con las tablas se desbloquean la tobera de
   2022-23-ext (P₂ = 9,14 bar, θ₂ = 204,6 °C, frente a 9,2 y 205) y los
   220 kW de 2022-23-ord ej. 2.
2. **F2 · El último examen y el tema 7** (2 días).
   - La ordinaria de 2025-26: sus seis apartados sin resolver (1e, 2b–2f).
   - La extraordinaria: su `fuente` declara que el s₁ del profesor está mal
     (4,4855 donde es 4,4517), y 1077 kJ y 0,2757 entran como distractores
     explicados.
   - El tema 7: pasar a práctica 6–8 de los ejercicios 7.1–7.14, porque hoy
     no tiene ninguno.
3. **F3 · Convección, radiación, prácticas y formulario** (1–2 días).
   - t09: las correlaciones del anexo, con 6–8 ejercicios de T9 y T10.
   - Las aletas: se escriben o se quitan del catálogo.
   - Una página por práctica: la de Termograf, y el ejercicio 4 de
     TermoLagun, que está resuelto, como guiado.
   - «Lo que hay que llevar sabido» en los diez temas.
   - `redactar` en los «razónese» y `dibujar` los procesos en P-v y T-s.
   - Los tres enunciados que el encargo pide devolver a su forma.

Antes de abrir la carpeta de Térmica, mira la tabla de CLAUDE.md, «Antes de
nada: los datos de terceros». Cinco de sus ficheros son de esta asignatura, y
uno lleva en la última página los apellidos del alumnado. No se abren, ni
para comprobar un dato.

## Lo que quedó apuntado de la fase E

- Los guiones de figuras de las cuestiones
  (`scripts/figuras/calculo-cuestiones-tNN.mjs`) dibujan a mano mallas 3D y
  campos de flechas, y el de t06 pasa de mil doscientas líneas. Si otra fase
  necesita superficies o campos, esas piezas se sacan a `scripts/figuras/`
  antes de copiarlas otra vez.
- Antes de pegar un banco nuevo se pasa `revisa-banco.mjs`. Comprueba la
  forma, el recuento contra las diapositivas, las figuras y las fórmulas.
