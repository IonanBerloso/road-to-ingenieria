# Siguiente sesión

Se sobrescribe cada vez; no se amplía. Lo que queda más allá está en
`pendiente.md`, con las fases en orden arriba del todo.

Escrito el 8 de octubre de 2026 por la tarde. **El diédrico de Expresión
Gráfica está cerrado**: lo que entra en el examen del bloque 1 de noviembre.

## Dónde está K

- **Publicado, el bloque 1 entero**: los temas 1 a 6 (el 1, prosa y un
  ejemplo nuestro; el 2, 7 ejercicios; el 4, los 12 de la colección) y las
  cuatro hojas de varios apartados, del 52 al 55, con todos sus apartados.
  El `Taller` corrige la visibilidad con `tramos` donde el enunciado la pide
  o las piezas se leen opacas.
- **El PDF de la colección**, publicado sin metadatos de autor
  (`public/examenes/expresion-grafica/coleccion-de-ejercicios.pdf`, §08): la
  página de la colección enlaza la página de cada ejercicio, y cada ejercicio
  corregido, «el original en papel».
- **Del bloque 2** están los temas 7, 10, 11 y 12; faltan el 8 (vistas y
  perspectivas), el 9 (cortes y secciones), el 13 (conjunto y despiece) y los
  de Solid Edge, del 14 al 17.

## Lo que sigue, en este orden

1. **La auditoría externa del diédrico.** Lo que más conviene que mire:
   - las **lecturas nuestras**: cada ejercicio las dice en sus Notas o en su
     `intro` (piezas opacas en el tema 4; una sola pieza maciza en SD42; el
     canal de SD44 como artesa abierta; la base superior de la 52·2), y si
     alguna otra lectura razonable se da por falsa;
   - la **visibilidad**: los tramos que se dejan fuera porque «lo visto manda»
     (SD38, SD64) y los que el papel borra y el Taller no (SD42, SD49);
   - los **métodos nuestros**: el desarrollo de la cubierta (SD41), la chapa
     desplegada (SD29), los abatimientos de cada faldón (SD43);
   - las **cifras**: cada una tiene su test por un segundo camino
     (`tests/geometria/`);
   - el **Taller en el móvil**: a 360 px el imán se lleva clics en las láminas
     densas (SD41), y la lupa es la salida; que se entienda.
2. **La deuda** (en `pendiente.md`): el primer despliegue después del 19 de
   octubre (Ubuntu 26) y lo que tarda el de CI; que el Taller, ante un trazo
   que cubre un tramo pero «corta» en otro sitio, enseñe el `porque` de ese
   tramo; un desplazamiento de rótulo por punto en el reproductor; borrar en el
   Taller lo que el papel borra (SD42, SD49); pintar la lámina con «medir» en
   un ejercicio con receta y sin `construir` (lo pidió el tema 1); las
   funciones de receta que propusieron los autores (`cuadrado_desde_alzado`,
   `sale_de`, `abatido_frontal`), solo si un ejercicio nuevo las necesita.
3. **El bloque 2**: los temas 8, 9 y 13, con el mismo método.

## Cómo trabajar

- Encargos de tres o cuatro ejercicios con `fase-k\encargo-autor-comun.md` y
  `CHULETA-K.md`; un revisor Opus por encargo, con
  `encargo-revisor-comun.md`, que deja sus arreglos aplicados en
  `rev\<unidad>\prueba\`; la sesión principal lee sus diffs e integra.
- **Dos agentes a la vez**: con tres, la ventana de cinco horas se fue en unas
  dos. Esta sesión: unos 0,5-0,8 M de tokens por autor y 0,3-0,5 M por
  revisor.
- `fase-k\visibilidad.mjs` para los tramos (desde el 8 de octubre, con el plano
  de Newell y sin tapar lo que cae en el contorno de una cara);
  `comprueba-todo` con rutas absolutas, también en sus argumentos.
- Un suelo por cada una o dos unidades: es local y no gasta límite. El
  guardián de talleres crea por la puerta de pruebas lo que el imán no deja
  pulsar, y lo avisa; un aviso no es un fallo.
- El asesor, apagado en producción.
