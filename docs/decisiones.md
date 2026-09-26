# Decisiones de no hacer algo

Lo que se decidió **no** hacer, y por qué, para que una auditoría no lo vuelva
a proponer sin un argumento nuevo. Si llega uno, la decisión se cambia aquí
diciendo cuál. Se amplía por abajo, y una entrada son diez líneas como mucho.

Las decisiones que sí se tomaron y luego se dieron la vuelta están en
CLAUDE.md §18.

## Los bloques «enteros» y «formulario» de una ruta son listas planas

Una auditoría pidió convertir «los exámenes enteros» en tres escalones. No:
un escalón es **una herramienta con su escalera** (§14), y hacer un examen
entero no es una herramienta, es simulacro; el formulario es repaso. Poner un
escalón ahí sería la forma puesta donde no significa nada. Decidido al diseñar
la primera evaluación y confirmado el 16 de septiembre de 2026.

## Las rutas son selectivas

No enlazan todos los ejercicios de la asignatura —en septiembre de 2026 había
97 de Álgebra y 130 de Fluidos sin enlazar—. Una ruta dice **por dónde
empezar y cuándo has terminado** (§14); si lo enlaza todo se convierte en el
catálogo que ya es la página de cada tema.

## `revisado` no se sella para apagar una métrica

Esa fecha significa «este bloque se pasó por los criterios de hueco de su
ruta». Ponerla sin haberlo hecho, porque una métrica la pide, es inventar un
dato (§13, caso 1). Los bloques sin ella tienen su trabajo en
`tasks/pendiente.md`.

## `peso.mjs` no entra en el suelo

Mide cuánto tarda una página en un móvil emulado, y en la misma máquina da 2,8
s en una pasada y 4,3 en otra según la carga; en otra máquina, 5,8. Un
guardián que pasa o falla por la carga del ordenador falla al azar, y un
guardián que falla al azar se aprende a ignorar (§11). Se pasa al cerrar una
asignatura y se lee como medida, no como veredicto. Decidido el 26 de
septiembre de 2026; estaba abierto desde el 16.

## Paginar los ejercicios de un tema, no

Se probó el 16 de septiembre de 2026 para aligerar las páginas grandes, y
rompía los anclajes `#ej-…` con los que enlazan las siete rutas. Lo que se
hizo en su lugar —lo cerrado viaja en un `<template>`— está en §07.

## Las resoluciones siguen sin leerse sin JavaScript

Ya eran inalcanzables sin él —las esconde `hidden` y las abre un botón— antes
de ir en un `<template>`, así que no se perdió nada que se tuviera. Abrirlas
sin JavaScript pediría publicar el DOM que costaba cinco segundos en un
teléfono (§07).

## Los pesos de Química se declaran, no se miden

Con tres convocatorias por cuatrimestre, casi todos los temas caen en dos o en
tres y la medida no distingue nada (§10). Manda el criterio declarado. 26 de
septiembre de 2026.

## §17 se queda dentro de CLAUDE.md, con índice

En la auditoría del 26 de septiembre de 2026 se pensó sacar las trampas a un
fichero aparte, porque pasan de novecientas líneas. Se quedan: son lo que hay
que saber **antes** de tocar nada, y fuera se leerían menos. A cambio, abren
con un índice de una línea por trampa que genera `npm run trampas` y vigila
`verify`. Si pasan de mil doscientas líneas, se vuelve a pensar.

## `anexaPaso` se queda aunque no la llame ningún guion del repositorio

La usan los guiones del scratchpad que meten rúbricas —la última vez, el 18 de
septiembre de 2026— y volverá a hacer falta. Lo que se temía de ella, pegar
un paso dos veces, ya lo impide el esquema. 26 de septiembre de 2026.
