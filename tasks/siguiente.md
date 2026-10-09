# Siguiente sesión

Se sobrescribe cada vez; no se amplía. Lo que queda más allá está en
`pendiente.md`, con las fases en orden arriba del todo.

Escrito el 9 de octubre de 2026. El diédrico está cerrado y la auditoría de
Expresión Gráfica del 8 de octubre (74/100,
`2027 proyecto contenido/auditorias/2026-10-08/`) está casi entera hecha: A1 a
A4, M1 a M5 y B1 a B7. Además, cada bloque de un método descriptivo se pinta de
su color en «Ver cómo se construye», con su teoría y un muestrario de colores.

## Las fases que siguen, en este orden

### L · Cerrar la auditoría de Expresión Gráfica (una sesión corta)

1. **Las frases sueltas** que encontraron los agentes de los bloques: «más
   cerca» o «se acerca» sin decir de qué en SD22, SD25, SD26, SD53 y SD67b; el
   `porque` del trazo 20 del paso 2 de la 53·2 («donde la ventana gana cota»:
   lo que distingue los dos cortes es el lado); «línea de tierra» donde el
   sitio dice «línea nueva» en las pistas y resoluciones de la 55·1 c-d y la
   55·2.
2. **La prosa de los temas 2 y 3** (B4, B5 y las figuras de M6): las unidades
   `fase-k\k-prosa-t02` y `k-prosa-t03`, cortadas por el límite de gasto, se
   retoman desde lo que dejaron.
3. **Un ejemplo de entrada propio en cada tema del 2 al 6** (M6; §15 lo pide):
   hoy no tienen ninguno.
4. **B8: la rúbrica de láminas como datos**, como las de `redactar`.
5. **Para Ionan**: M7 (¿se usa como modelo del examen del bloque 2 el despiece
   resuelto de la Escuela de Bilbao, diciéndolo?), B9 (cómo se cobra la escala
   del cajetín), cuánto dura el control del bloque 1 (para el simulacro con
   reloj) y si es en noviembre (la diapositiva lo tapa).

### M · Temas 8 y 9: vistas y cortes (casi la mitad del examen del 40 %)

1. **Diseño primero**: qué puede corregir el sitio de unas vistas dibujadas a
   mano —completar la vista que falta, reconocer la buena, marcar aristas
   ocultas, elegir el corte— y qué pieza compartida hace falta (`lib/vistas`,
   el Taller de las vistas), con el material: `Normalizacin_y_Vistas.pdf`,
   `Vistas_-_Cortes.pdf` y `NORMALIZACIN.pdf`. Un documento de diseño antes de
   escribir código.
2. **La pieza compartida**, con sus tests.
3. **Prosa y ejercicios de los temas 8 y 9**, por unidades de tres o cuatro,
   con su revisor.

### N · Tema 13: conjunto y despiece

Del plano de conjunto a la pieza acotada, con la cuenta de la hoja de criterios
al final (`Tema_5_-_Conjuntos.pdf`, `Ejercicio_-_Conjunto_simple.pdf`). Depende
de M.

### O · Solid Edge (temas 14 a 17)

Decidir qué puede aportar el sitio a un examen que se hace en el ordenador.

### J · Sistemas de Producción

Aplazada por Ionan hasta acabar Expresión Gráfica; la auditoría la calcula en
unas cuatro semanas.

## Cómo trabajar

- Encargos con `fase-k\encargo-autor-comun.md` y `CHULETA-K.md`; un revisor
  por encargo, que deja sus arreglos en `rev\<unidad>\prueba\`; la sesión
  principal integra leyendo sus diffs.
- **Ojo al gasto**: el 8 de octubre por la noche, con ocho agentes a la vez,
  saltó el límite mensual y cortó a todos. Tres a la vez es lo razonable; las
  revisiones de poco riesgo (texto que solo se añade) las puede hacer la sesión
  principal leyendo.
- Un suelo por cada una o dos unidades; antes del suelo, `npx astro build`,
  `verify` y `check-color` sueltos, que son los que más paran.
- Los colores, solo en `tokens.css`, un token por línea, y medidos por
  `check-color`.
