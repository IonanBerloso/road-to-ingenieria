# Siguiente sesión

Se sobrescribe cada vez; no se amplía. Lo que queda más allá está en
`pendiente.md`, con las fases en orden arriba del todo.

Escrito el 8 de octubre de 2026 de madrugada, al cortar la sesión con el límite
de cinco horas casi gastado. La fase K, Expresión Gráfica, sigue con el
diédrico, que entra en el examen de noviembre.

## Lo primero: dos commits pendientes

1. **Los temas 5 y 6 completos y la visibilidad de las hojas** (k-t06c, k-t05d,
   k-retro-vis-a: `t05-…`, `t06-…`, `examenes/ejercicio-52/53/54`, sus láminas
   y tests, `tasks/pendiente.md`). Su suelo es
   `fase-k\suelo-t06c-t05d-vis.log`: si acaba en `EXIT 0` y no tiene ningún
   ✗, su commit; si no, suelo de nuevo. Si `git status` ya no los enseña, es
   que entraron antes de cortar.
2. **El tema 4** (`t04-intersecciones/`, `sd32.json`, `sd33.json`,
   `sd32-sd33.test.ts` y el catálogo): entró después de ese build. Necesita su
   propio suelo (antes, `npx astro sync`) y su commit.

## Dónde está K

- **Publicado**: los temas 3, 5 y 6 enteros (5 y 6, al entrar el commit 1);
  del tema 2, SD1, SD4 y SD5; las hojas 52 a 55 (de la 52, los apartados 3 y
  4). El `Taller` corrige la visibilidad con `tramos`.
- **Quedan 16 ejercicios del diédrico**: 10 del tema 4, 4 del tema 2 y los
  apartados 1 y 2 de la hoja 52; más la prosa del tema 1 y la visibilidad de
  SD17, SD64 y SD63. Todos con su encargo escrito en `fase-k\`.
- **Unidades cortadas** (siguen desde su `PROGRESO.md`, con un agente nuevo y
  el mismo encargo): `k-t02b` (por la mitad), `k-retro-vis-b` (por la mitad),
  `k-t04b` (recién empezado).

## La optimización decidida el 8 de octubre (rentable: hacerla antes de la tanda)

1. **`fase-k\visibilidad.mjs`, una herramienta común** (la sesión principal,
   lo primero tras los commits). Hoy cada autor y cada revisor se escribe su
   propio cálculo de líneas ocultas; quedan unos 15 ejercicios con
   visibilidad. Se generaliza desde `fase-k\modelo\vis-55-2\` (`geo.mjs`
   saca los puntos 3D de la receta, `ocultas.mjs` lanza rayos contra caras
   opacas, `cortes.mjs` nombra el cruce aparente de cada cambio). Entrada: el
   YAML, el id, las caras (polígonos por nombre de punto de la receta) y las
   aristas; salida: los tramos con su tipo y la expresión de cada extremo
   (`cruce_aparente(…)`), lista para pegar. Su prueba: reproducir los 28
   tramos de la 55·2. **El revisor sigue con su cálculo propio**, para que la
   comprobación sea independiente.
2. **`k-laminas`, las láminas en lote con Sonnet** (`fase-k\encargo-k-laminas.md`):
   las 10 del tema 4 y las 2 de la hoja 52, antes de lanzar k-t04c, k-t04d y
   k-ex52b; sus encargos se ajustan para que partan de esas láminas.
3. **El prefijo común**: pegar el texto entero de `CHULETA-K.md` al principio
   del prompt de cada agente, idéntico en todos, en vez de mandarlo leer. Es
   probable que la caché lo aproveche entre agentes; medir los tokens de las
   dos primeras unidades contra las de esta sesión (autor 0,6-0,75 M, revisor
   0,3-0,5 M por unidad).

## Cómo trabajar

- **Encargos de tres o cuatro ejercicios con la chuleta**, que ahora trae «Lo
  que más encuentran los revisores», y **un revisor por encargo**, con Opus.
  El revisor deja sus arreglos aplicados y probados en `rev\<unidad>\prueba\`,
  y la sesión principal lee los diffs e integra. Sonnet, solo si el revisor no
  pudo aplicarlos.
- **Dos agentes a la vez**: con tres, la ventana de cinco horas se fue en unas
  dos.
- **Un suelo por cada una o dos unidades**: es local y no gasta límite.
- **El asesor**, apagado en producción.
- Al ritmo de esta sesión, el diédrico se cierra en una o dos sesiones, y
  Expresión Gráfica entera en unas seis (el bloque 2 lleva más figuras).
