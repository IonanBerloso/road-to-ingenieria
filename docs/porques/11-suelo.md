# Por qué CLAUDE.md §11 dice lo que dice

Las historias que iban dentro de «Suelo de calidad», en CLAUDE.md: cómo se
llegó a una regla, con la fecha y las cifras de aquel día. La regla sigue
allí; aquí está de dónde salió. Se trajeron tal cual el 3 de octubre de
2026, sin cambiar una palabra, para que CLAUDE.md pese menos en cada sesión
(`docs/decisiones.md`, «CLAUDE.md en dos niveles»). Cada bloque dice detrás
de qué iba.

*Iba en §11, detrás del párrafo que empieza «En el Windows de desarrollo, el compilador de Astro…».*

> Esta sección decía «son dos guardianes» desde agosto, cuando ya eran seis
> pasos. `recalcula`, `cifras` y `sim` entraron el 26 de septiembre de 2026:
> los tres existían, los tres habían nacido de un fallo real, y los tres se
> quedaban fuera del suelo con argumentos —«tarda», «necesita servidor», «es
> un informe»— que al medirlos ese día no se sostenían: un segundo, un minuto
> y 0,7 segundos.

*Iba en §11 › «`HUMO_TODO=1 npm run humo` — la barrida completa», detrás del párrafo que empieza «Con `HUMO_TODO=1` las abre todas —249 el 26 de…».*

> Y de paso arregló tres fallos del propio guardián, que llevaba dando
> «Execution context was destroyed» en una página distinta cada vez: abría las
> 123 en la misma pestaña, clicaba las pestañas de modo dentro del mismo
> `evaluate` que dispara `history.replaceState`, y medía sin esperar al trabajo
> diferido. Un guardián que falla al azar se acaba ignorando.

*Iba en §11 › «`npm run sim` — que un simulador se encuentre y diga la verdad», al principio del apartado.*

En el suelo desde el 26 de septiembre de 2026. Hasta entonces necesitaba un
servidor levantado a mano y se pasaba «al tocar un simulador», que en la
práctica era casi nunca: ese día la auditoría encontró leyendo el código tres
fallos de simulador —una recursión que congelaba los diagramas de la viga, un
preajuste de la catenaria que se recortaba contra el tope del mando, y veinte
cifras sin JavaScript que el modelo ya no daba— y ninguno estaba en su lista.

*Iba en §11 › «`npm run sim` — que un simulador se encuentre y diga la verdad», justo detrás del bloque anterior de este fichero.*

Existe por un fallo concreto y caro. El 2 de septiembre de 2026 se publicaron
cinco simuladores correctos y **completamente invisibles** —viven en un
apartado que no es el primero, y el modo guiado tapa los demás— con el suelo
en verde y las capturas de cada uno bien. `tests/fisica/` prueba la física;
`humo.mjs` prueba que la página no reviente. **Nadie probaba el cable entre las
dos cosas.**

*Iba en §11 › «`npm run sim` — que un simulador se encuentre y diga la verdad», detrás del párrafo que empieza «Y de dónde salen esos valores no es lo…».*

Validado al revés con dos regresiones reales: volver a poner `D/e = 40` en el
golpe de ariete —que daba 215 mca donde **el tema publica 228**— y quitar el
aviso de la cabecera. Las dos, rojas. Y ojo al ejemplo, que ilustra lo de
arriba mejor que ninguno: ese 228 no sale de un examen, sale de
`fluidos/t20-golpe-ariete/index.mdx:218`, prosa nuestra. La regresión de
validación se validó contra nosotros mismos.

*Iba en §11 › «`npm run recalcula` — comprueba que las cuentas salen», detrás del párrafo que empieza «En el suelo desde el 26 de septiembre de…».*

Existe porque el 28 de agosto de 2026 una auditoría que recalculaba las
matemáticas encontró **ocho ejercicios que enseñaban algo falso** con los dos
guardianes en verde y §15 cumplida. El signo de una antitransformada, la
relación de distancias de Apolonio invertida, un contraejemplo que no era
contraejemplo. Ninguno de esos fallos rompe nada: el sitio funciona
perfectamente enseñando algo que no es verdad.

*Iba en §11 › «`npm run recalcula` — comprueba que las cuentas salen», detrás del párrafo que empieza «Y ese último obligó a una concesión que conviene…».*

> **Y el 7 de septiembre de 2026, al cerrar Ingeniería Térmica, resultó que
> el guardián no sabía leer castellano.** Dio **veinte desajustes, los veinte
> falsos**, y todos por lo mismo: leía `110.735` —un Reynolds— como 110,735.
> El punto de millar. La tentación era reescribir el contenido; lo correcto
> era medir, y medido queda: de los **144 puntos que hay dentro de una
> fórmula en todo el corpus, los 129 con exactamente tres dígitos detrás son
> millares**, y los 15 con uno o dos son decimales de enunciados de examen
> reproducidos tal cual (§08) —`$x = 0.5$`, `$z=1.6$`—. Se distinguen por la
> forma, así que el guardián puede aprenderlo y el contenido no se toca. Es
> §01 con otra cara: **el fallo estaba en la capa que mira, no en las
> cuarenta y tres que se miran.**
>
> Quitar los millares destapó de inmediato que **los resultados enteros no se
> comprobaban nunca**: el número de la derecha tenía que llevar separador
> decimal, y `= 135.000\ \text{W}` solo entraba porque el punto lo disfrazaba
> de decimal —y entonces se comparaba 135 contra 135.000, que pasaba por la
> concesión de la potencia de diez de arriba—. Al admitirlos, la cobertura
> pasa de **2.444 a 3.819 pares**, un 56 % más.
>
> Y admitirlos destapó a su vez **dos fallos del guardián que llevaban ahí
> desde el principio y que ningún corpus había tocado**, los dos encontrados
> por los 45 avisos falsos que salieron de golpe: la lista de «esto de la
> derecha no es un resultado» usaba `\b`, y entre la `t` de `\cdot` y el `3`
> de `\cdot3` no hay frontera de palabra —medio corpus lo escribe sin
> espacio—; y el analizador leía el signo por debajo de la potencia, así que
> **`-(1+1)^{2}` valía +4**. Los dos arreglados y validados al revés.
>
> Lo que encontró de verdad, ya con todo eso limpio, fue **un desajuste real
> en Fluidos**: `1744 - 5902 = -4159` en la pieza en Y, donde los dos
> sumandos estaban redondeados y la resta arrastraba el redondeo al
> resultado —son 1743,5 y 5901,3, y da −4157,8—. Más dos divisiones escritas
> de forma ambigua, `K/p = 2{,}2\cdot 10^{9}/2{,}5\cdot 10^{6}`, que solo
> significan lo que quieren decir si el lector agrupa por su cuenta: pasadas
> a fracción.
