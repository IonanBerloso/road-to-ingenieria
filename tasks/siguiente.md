# Siguiente sesión

Se sobrescribe cada vez; no se amplía. Lo que queda más allá está en
`pendiente.md`, con las fases en orden arriba del todo.

Escrito el 8 de octubre de 2026 de madrugada, al cerrar la sesión. La fase K,
Expresión Gráfica, sigue con el diédrico, que entra en el examen de noviembre.

## Lo primero: el tema 4

El tema 4 (`t04-intersecciones/`: prosa nueva, SD32 y SD33; `sd32.json`,
`sd33.json`, `sd32-sd33.test.ts` y el catálogo) está en el árbol sin commit.
Su suelo quedó corriendo: `fase-k\suelo-t04a.log`. Si acaba en `EXIT 0` y sin
ningún ✗, su commit; si no se terminó (se apagó el ordenador), `npx astro sync`
y `npm run suelo` de nuevo.

## Dónde está K

- **Publicado**: los temas 3, 5 y 6 enteros; del tema 2, SD1, SD4 y SD5; las
  hojas 52 a 55 (de la 52, los apartados 3 y 4). El `Taller` corrige la
  visibilidad con `tramos` en la 55·2, la 52·4, la 53·1, la 54·1 a y los
  ejercicios nuevos de los temas 5 y 6 que la piden.
- **Quedan 16 ejercicios del diédrico**: 10 del tema 4, 4 del tema 2 y los
  apartados 1 y 2 de la hoja 52; más la prosa del tema 1 y la visibilidad de
  SD17, SD64 y SD63.

## Lo que sigue, en este orden

1. **Las tres unidades cortadas**, desde su `PROGRESO.md` en `fase-k\` (un
   agente nuevo, el mismo encargo y «sigue desde tu PROGRESO.md»): `k-t02b`
   (por la mitad), `k-retro-vis-b` (por la mitad) y `k-t04b` (sin empezar).
2. **`k-t04c`, `k-t04d` y `k-ex52b`**, y después `k-t01`. Sus encargos ya
   apuntan a las láminas preparadas y a la herramienta de visibilidad.
3. **La auditoría externa**, con el diédrico cerrado.
4. **La deuda**: el primer despliegue después del 19 de octubre (Ubuntu 26);
   que el Taller, ante un trazo que cubre un tramo entero pero «corta» en otro
   sitio, enseñe el `porque` de ese tramo; un desplazamiento de rótulo por
   punto en el reproductor.

## La optimización del 8 de octubre: hecha

- **`fase-k\visibilidad.mjs`**: los tramos de lo visto y lo oculto desde la
  receta y un `config.json` de caras y aristas; reproduce los 28 de la 55·2
  (`fase-k\modelo\vis-55-2\`). Para autores; el revisor hace su cálculo propio.
- **`fase-k\k-laminas\`**: las 12 láminas que faltaban (las 10 del tema 4 y la
  52·1 y la 52·2), cotejadas, por 0,3 M de tokens con Sonnet.
- **La chuleta** trae «Lo que más encuentran los revisores», y la plantilla del
  revisor le pide dejar los arreglos aplicados en `rev\<unidad>\prueba\`.
- **Por probar: el prefijo común.** Pegar el texto de `CHULETA-K.md` al
  principio del prompt de cada agente, idéntico en todos, y medir los tokens
  de las dos primeras unidades contra los de esta sesión (autor 0,6-0,75 M y
  revisor 0,3-0,5 M por unidad).

## Cómo trabajar

- Encargos de tres o cuatro ejercicios, un revisor Opus por encargo, y la
  sesión principal integra leyendo los diffs del revisor.
- **Dos agentes a la vez**: con tres, la ventana de cinco horas se fue en unas
  dos.
- Un suelo por cada una o dos unidades: es local y no gasta límite.
- El asesor, apagado en producción.
- Al ritmo de esta sesión, el diédrico se cierra en una o dos sesiones, y
  Expresión Gráfica entera, en unas seis.
