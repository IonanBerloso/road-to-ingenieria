# Por qué CLAUDE.md §07 dice lo que dice

Las historias que iban dentro de «Matemáticas», en CLAUDE.md: cómo se
llegó a una regla, con la fecha y las cifras de aquel día. La regla sigue
allí; aquí está de dónde salió. Se trajeron tal cual el 3 de octubre de
2026, sin cambiar una palabra, para que CLAUDE.md pese menos en cada sesión
(`docs/decisiones.md`, «CLAUDE.md en dos niveles»). Cada bloque dice detrás
de qué iba.

*Iba en §07, detrás del párrafo que empieza «Cero CDN en todo el sitio. Criterio de aceptación:…».*

> Hasta el 20 de agosto de 2026 la salida era **MathML puro**, por ser nativo y
> no necesitar CSS. Se cambió porque MathML delega el dibujo en la fuente
> matemática de cada máquina, y eso rompía fórmulas sin avisar: con las fuentes
> del sistema desaparecía la barra del conjugado —`z̄` se leía como `z`, justo
> lo contrario— y con STIX Two Math autoalojada desde `@fontsource`, que viene
> subdividida, desaparecían los radicales. Una fórmula que se dibuja distinta en
> cada ordenador no es un asunto de estética. El precio son 118 ficheros de
> fuente de KaTeX en el sitio; el navegador solo descarga los que usa.

*Iba en §07 › «El otro precio, y cómo se paga (16 de septiembre de 2026)», detrás del párrafo que empieza «1. Solo va a `<template>` lo que ya era…».*

> Se probaron tres caminos y se midieron los tres. Paginar los ejercicios rompía
> los anclajes `#ej-…` que usan las siete rutas. `content-visibility: auto`
> —que se queda, y ayuda— solo compraba medio segundo, porque se salta el
> maquetado y no la construcción del DOM. Y borrar el contenido del todo era
> **peor** que el `<template>`: 3.085 ms contra 2.092, porque el fragmento
> inerte se salta también el cálculo de estilos.
>
> La paginación volvió doce días después, resolviendo lo de los anclajes: es
> la sección siguiente.
