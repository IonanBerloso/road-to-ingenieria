# Siguiente sesión

Se sobrescribe cada vez; no se amplía. Lo que queda más allá está en
`pendiente.md`, con las fases en orden arriba del todo.

Escrito el 28 de septiembre de 2026, al cerrar F1. Térmica tiene sus tablas
de vapor en `…/ingenieria-termica/tablas/`: calculadas con IAPWS-95 sobre la
rejilla del anexo, con su diagrama de Mollier. Coinciden con el anexo en las
3.106 celdas de la saturación y del sobrecalentado hasta 1000 °C; lo que no
coincide, y las erratas del anexo, lo dice la propia página. Los enunciados
de vapor remiten a ellas. El tema 3 tiene diez ejercicios de lectura de
tablas, la tobera de 2022-23 ext ya está publicada y la caldera cierra la
fila que faltaba en el tema 4.

## Qué toca: F2 y F3 de Térmica

El encargo está en `2027 proyecto contenido/auditorias/2026-09-27/`
(`encargo-por-fases.md`, fase F).

1. **F2 · El último examen y el tema 7** (2 días).
   - La ordinaria de 2025-26: los seis apartados sin resolver (1e, 2b–2f).
     La resolución oficial está en su PDF, págs. 5 y 7–11. Dos cosas ya
     vistas:
     - En el d) escribe s₃′ = s₂ = 1,3028, que es s′ a 1 bar. Su h₃′ =
       345,82 sale con el 1,0912 bueno.
     - Su 61,6 % sale de la tabla de líquido comprimido del anexo, que es de
       otra formulación. El trabajo isentrópico de la bomba son 5 kJ/kg, así
       que dos décimas de h mueven el rendimiento dos puntos. Hay que
       rehacerlo con las tablas del sitio y decir cuánto se aparta.
   - La extraordinaria: su `fuente` declara que el s₁ del profesor está mal
     (4,4855 donde es 4,4517), y 1077 kJ y 0,2757 entran como distractores
     explicados.
   - El tema 7: pasar a práctica 6–8 de los ejercicios 7.1–7.14, porque hoy
     no tiene ninguno.
2. **F3 · Convección, radiación, prácticas y formulario** (1–2 días).
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

## Lo que quedó apuntado de F1

- Las tablas no se editan a mano. `node scripts/tablas-vapor.mjs` escribe el
  JSON y `node scripts/figuras/termica-mollier.mjs` el Mollier;
  `tests/fisica/vapor.test.ts` falla si alguno se queda atrás.
- La transcripción del anexo y el contraste celda a celda están fuera del
  repositorio, en `2027 proyecto contenido/Claude outputs/tablas-vapor-anexo/`
  (con su `LEEME.md`). `recompara.mjs` repite la comparación.
- Donde el anexo sale de otra fuente —las filas de 1100–1300 °C y el líquido
  comprimido—, un ejercicio hecho con las tablas del sitio puede dar un número
  algo distinto del de una resolución oficial. Hay que mirarlo en cada
  ejercicio que las use, empezando por la bomba de F2.
- Los guiones de figuras de las cuestiones de Cálculo dibujan a mano mallas
  3D y campos de flechas. Si otra fase necesita superficies o campos, esas
  piezas se sacan a `scripts/figuras/` antes de copiarlas otra vez.
