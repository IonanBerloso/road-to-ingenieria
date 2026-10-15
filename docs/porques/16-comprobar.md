# Por qué CLAUDE.md §16 dice lo que dice

Las historias que iban dentro de «Cómo se comprueba lo que acabas de hacer», en CLAUDE.md: cómo se
llegó a una regla, con la fecha y las cifras de aquel día. La regla sigue
allí; aquí está de dónde salió. Se trajeron tal cual el 3 de octubre de
2026, sin cambiar una palabra, para que CLAUDE.md pese menos en cada sesión
(`docs/decisiones.md`, «CLAUDE.md en dos niveles»). Cada bloque dice detrás
de qué iba.

*Iba en §16, detrás del párrafo que empieza «La lección se apila sobre la de arriba y…».*

> **Y el 10 de septiembre de 2026, el caso más barato de todos.** Se hizo una
> captura de un ejercicio recién escrito —solo para ver que se dibujaba— y en
> la casilla de respuesta ponía: «en kW/K, con tres cifras — **vale la forma
> exacta: pi/4, sqrt(3)/2, (e^2-1)/2…**». La coletilla estaba escrita a fuego
> en `EjercicioGuiado`, con Cálculo delante, cuando Cálculo era la única
> asignatura. Medido al verlo: de los **2.695** pasos que llevan `formato`,
> **944 la recibían siendo falsa para su tipo de respuesta** —872 `magnitud`,
> 49 `vector`, 14 `matriz`, 9 `formula`—, el 35 %, y casi todos de Fluidos.
>
> Lo que lo hace peor que un descuido de texto: en una respuesta `magnitud` la
> única ayuda que importa es **que hay que escribir la unidad**, que es
> exactamente el error que el lector sabe diagnosticar aparte. Se estaba
> mandando al alumno al sitio equivocado justo en la asignatura donde la
> unidad es media nota. Cuatro guardianes en verde, 1.616 tests, dos barridas
> completas del navegador: ninguno mira **qué dice** un rótulo, solo que esté.
>
> Arreglado en el componente y no en los 944 pasos (Regla 0), con la coletilla
> dependiendo del tipo y comprobada contra `lib/algebra.ts` antes de escribir
> la de vectores y matrices, que si no habría sido inventarse un formato.

*Iba en §16 › «Y una clase de dato que envejece sin que nadie la mire: los `falta[]`», detrás del párrafo que empieza «Un `falta[]` se publica en la página de la…».*

Releídas todas a mano el 8 de septiembre de 2026: **once estaban caducadas**.
El tema 8 decía dos ejemplos y una figura cuando eran cinco y dos; el tema 9,
dos y una cuando eran cinco y tres; una nota pedía «un dibujo de qué hace
Green» que llevaba meses dibujado; otra decía que no había ningún ejercicio de
la matriz en otra base habiendo **seis**, cuatro de ellos sin enlazar desde
ninguna ruta; otra que no había ninguno de orden cuatro habiendo cuatro.
