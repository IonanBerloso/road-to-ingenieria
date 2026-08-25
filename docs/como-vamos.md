# Cómo vamos · 26 de agosto de 2026

Estado del proyecto medido sobre el repositorio, no recordado. Se regenera
**en el mismo commit** que cambia los números, no en el siguiente.

> Las «palabras de prosa» se cuentan sobre `index.mdx` quitando la portada, los
> bloques `<svg>`, las fórmulas entre dólares y las etiquetas. Es una
> definición, no la única; lo que importa es que sea la misma en cada medición.

> Esta regla del «mismo commit» es nueva y viene de un fallo: el fichero llevaba
> dos commits publicando «66 de 89 convocatorias» cuando ya eran 68. §10 no
> admite eso. Está anotado como deuda 34, y la salida buena a largo plazo es
> generar este fichero con `mide.mjs` en vez de escribirlo a mano.

---

## En una frase

**Cinco de las once ordinarias están hechas, y los temas 10 y 11 ya tienen
corpus con el que trabajar.** Van 70 convocatorias de 89 y 278 ejercicios de
examen. Laplace pasa a **seis** ejercicios y Fourier a **cinco** —la ordinaria
de 2021-2022 trae dos de Laplace, algo que no había pasado nunca—. Faltan 19
convocatorias: seis ordinarias, once extraordinarias y los dos parciales de
2019-2020.

---

## Cálculo, tema a tema

| tema | prosa | fig. | ejerc. propios | ejemplos | ejerc. de examen |
|---|---|---|---|---|---|
| t01 complejos | 2 885 | 3 | 37 | 8 | **56** |
| t02 sucesiones | 2 035 | 3 | 19 | 4 | 31 |
| t03 funciones reales | 1 779 | 3 | 23 | 5 | 19 |
| t04 estudio local | 2 036 | 3 | 18 | 5 | **57** |
| t05 integración | 1 925 | 4 | 30 | 4 | 30 |
| t06 varias variables | 1 797 | 2 | 12 | 4 | 15 |
| t07 integral múltiple | 1 422 | 2 | 10 | 3 | 25 |
| t08 integral curvilínea | 1 119 | 1 | 7 | 2 | 15 |
| t09 ecuaciones diferenciales | 1 241 | 1 | 7 | 2 | 19 |
| t10 Laplace | 872 | 1 | 8 | 2 | **6** |
| t11 Fourier | 888 | 1 | 8 | 2 | **5** |
| **total** | **17 999** | **24** | **179** | **41** | **278** |

En todo el corpus: **457 ejercicios y 1 744 pasos**.

Los temas 10 y 11 siguen siendo la frontera, pero ya no están en cero. Su prosa
—872 y 888 palabras— es la mitad que la de los primeros temas y tienen una
figura cada uno; engordarlos sigue esperando a las once ordinarias, porque
escribir el tema a partir de la mitad de sus exámenes es decidir el contenido
con media muestra.

La columna «fig.» cuenta solo las figuras de la prosa de los temas. Las de los
enunciados y las resoluciones de examen van aparte: la ordinaria de 2022-2023
trajo seis y la de 2021-2022 cuatro, de las cuales **tres son nuestras y viven
en la resolución** —el lugar geométrico, la sección del sólido y la onda
cuadrada—, porque en esos tres apartados el examen pide precisamente dibujar.

## Exámenes

| convocatoria | PDF | transcritas | faltan |
|---|---|---|---|
| 1.ª evaluación | 11 | **11** | 0 |
| 2.ª evaluación | 11 | **11** | 0 |
| 3.ª evaluación | 11 | **11** | 0 |
| 4.ª evaluación (15 cuadernillos) | 15 | **17** | 0 |
| 5.ª evaluación (13 cuadernillos) | 13 | **15** | 0 |
| ordinaria | 11 | **5** | **6** |
| extraordinaria | 11 | 0 | **11** |
| ord.-extraord. 2019-2020, 2 parciales | 2 | 0 | **2** |
| **total** | **85** | **70** | **19** |

Los quince cuadernillos de cuarta evaluación dan diecisiete convocatorias y los
trece de la quinta dan quince, porque algunos traen dentro las dos partes: la
recuperación del primer cuatrimestre y la evaluación de verdad. Desglosado:
once cuartas más seis recuperaciones, y diez quintas más cinco recuperaciones.
La quinta de 2019-2020 no se celebró.

**Los 85 PDF están ya en `public/examenes/calculo/`**, copiados y verificados
byte a byte contra el original. Lo que falta es transcribir 19.

Sobre los 2 785 puntos repartidos de los 70 exámenes: **COMP1 9,5 % · COMP2
55,3 % · COMP4 35,2 %**. Es decir, **el 44,7 % de la nota de Cálculo no es
calcular**. La cifra baja según entran globales —49,5 % sobre 33 exámenes,
46,8 % sobre 66, 44,7 % sobre 70— y el motivo es estable: las convocatorias
largas reparten siete u ocho puntos de cálculo de cada diez en casi todos sus
ejercicios, mientras que en la evaluación continua hay ejercicios enteros de
solo demostrar.

## Rutas de estudio

| ruta | bloques | escalones | medida sobre | huecos declarados |
|---|---|---|---|---|
| 1.ª evaluación | 7 | 21 | 11 convocatorias | 4 |
| 2.ª evaluación | 8 | 17 | 11 | 2 |
| 3.ª evaluación | 9 | 18 | 11 | 3 |
| 4.ª evaluación | 3 | 10 | 11 | 3 |
| 5.ª evaluación | 3 | 12 | 10 | 6 |
| ordinaria | 3 | 7 | **2** | 4 |

La de la ordinaria dice estar medida sobre 2 convocatorias y ya hay 5
transcritas. No es un dato falso —se midió sobre 2 cuando se escribió—, pero es
el que peor envejece del sitio, y está anotado como deuda 33: se rehace entera
cuando estén las once, igual que se hizo con la quinta.

Y falta la ruta de la extraordinaria, que §15 pide y todavía no existe.

## Contra el criterio de «asignatura terminada» (§15)

| criterio | |
|---|---|
| temas del temario oficial, con fuente | ✅ 11/11 |
| todo tema enlazado por una ruta tiene prosa | ✅ |
| cada tema con ejemplo introductorio propio | ✅ 41 |
| cada tema con al menos una figura | ✅ 24 |
| una ruta por evaluación | ⚠️ 6 de 7 — falta la extraordinaria |
| `tests/fisica/` con un caso por simulador | ✅ vacío, no hay simuladores |
| `falta[]` dice lo que no está | ✅ 22 huecos |
| `npm run suelo` en verde | ✅ |
| **todas las convocatorias publicadas transcritas** | ❌ **70 de 89** |

> El «70 de 89» merece explicación: 85 son los PDF y 89 las convocatorias que
> contienen, porque cuatro cuadernillos traen dos exámenes dentro. De las 19
> que faltan, ninguna es doble.

## Las otras ocho asignaturas

Cero contenido. Fluidos tiene los 16 temas en el catálogo y un README; las
otras siete están como `prev`. Es §00 funcionando: no se abre una hasta cerrar
la anterior.

---

# El plan

## Lo siguiente: las seis ordinarias que faltan

Es lo primero por la misma razón que lo fue la quinta: **es lo único que da de
comer a los temas 10 y 11**. La transformada de Laplace y las series de Fourier
no aparecen en ninguna evaluación continua.

Y de paso sube la ruta `ord` de «medida sobre 2» a «medida sobre 11».

El trabajo por examen, ya rodado:

1. el PDF ya está en `public/examenes/calculo/` — los 85 están copiados;
2. leerlo — `pdftotext -layout` para la estructura, y la página renderizada a
   imagen para las fórmulas, que `pdftotext` se come o traduce mal;
3. **comprobar cada resultado por dos caminos** antes de escribir una línea:
   el analítico y el numérico, en un script del scratchpad;
4. escribir `examen.yaml` y `ejercicios.yaml`, con los pasos
   reconocer / calcular / justificar y los distractores sacados de errores
   reales;
5. redibujar en SVG toda figura del enunciado (§08), y mirarla en claro, en
   oscuro y a 360 px antes de darla por buena;
6. `node scripts/verify.mjs --solo-fuente` **antes** de `npm run build`,
   recorrer los ejercicios en el navegador con `probar.mjs`, y `npm run suelo`.

Lo aprendido en estas dos ordinarias, que conviene no volver a tropezar:

- **el cálculo analítico también se equivoca.** El volumen del sólido de
  Viviani salió 38,58 por integración numérica y 19,29 por la fórmula cerrada
  que escribí; la mala era la fórmula. Los dos caminos existen justo para esto,
  y la lección es que **discrepar no significa que el numérico esté mal**;
- **una figura redibujada hay que medirla sobre el original.** La primera
  versión de las gráficas de $f$ y $g$ tenía la escala vertical a la mitad de
  la horizontal y dos cortes de los que depende un paso quedaban invisibles. Se
  rehízo midiendo un recorte a 600 dpi; y a 260 dpi había leído mal uno de los
  ceros —3,05 en vez de 2,84—, lo que habría tirado el ejercicio entero;
- **`fill-rule="evenodd"` no es «quitar un trozo».** Es diferencia simétrica: al
  usarlo para descontar un disco de un semiplano, el trozo del disco que caía
  **fuera** del semiplano se pintaba en vez de quitarse. La forma que ya usaba
  el corpus es la buena: pintar la región y encima el hueco en `var(--paper)`,
  recortado con un `clipPath`;
- **una raya larga dentro de `$…$` la publica KaTeX como aviso y como
  desastre.** Dos casos se colaron hasta el commit y hay guardián nuevo desde
  hoy, con la familia entera de rayas y comillas medida —incluido el espacio
  duro, que es invisible al leer el fichero—;
- una etiqueta con `paint-order: stroke` y `stroke: var(--paper)` resuelve casi
  todas las colisiones entre rótulos y curvas, y funciona igual en claro y en
  oscuro.

## Los días siguientes

| | trabajo | qué desbloquea |
|---|---|---|
| 1 | **6 ordinarias** (2025-2026 a 2021-2022 ya están) | los temas 10 y 11, y la ruta `ord` |
| 2 | **11 extraordinarias** + los 2 parciales de 2019-2020 | cierra la deuda 26 |
| 3 | **Ruta de la extraordinaria**, que todavía no existe | §15 pide una por evaluación |
| 4 | **Engordar los temas 10 y 11** con lo que digan sus exámenes | |
| 5 | **Enganchar las cinco recuperaciones de la quinta** a las rutas de 1.ª, 2.ª y 3.ª: son catorce ejercicios de primer cuatrimestre que hoy no enlaza nadie | |
| 6 | **Auditoría de Cálculo entera** y cierre según §15 | |
| 7 | **Abrir Álgebra** | |

Cuando entre Álgebra habrá que separar el lector de respuestas de
`EjercicioGuiado`: una **matriz** no es un número ni un conjunto de puntos, y
ese es el sitio por donde Álgebra tensiona el sistema. Es la razón por la que
va antes que Fluidos, que son 25 temas y la asignatura más cara de las nueve.

## Deudas abiertas que no bloquean

Están todas en `tasks/todo.md` con su número. Las que siguen vivas y merecen
una línea:

- **26** — las 19 convocatorias globales que faltan. Es el plan de arriba.
- **31** — `invariante.fuente` se publica como texto plano, sin pasar por el
  procesador, así que el LaTeX sale crudo. O se procesa, o §14 lo dice.
- **32** — dos ejercicios del tema 9 duplican problemas que ahora también están
  transcritos como examen.
- **33** — la ruta `ord` dice «medida sobre 2» con cinco ordinarias hechas.
  Se rehace cuando estén las once.
- **34** — esta medición se quedó atrás dos commits. Corregido, y de ahí sale la
  regla del encabezado.
- **35** — **los profesores repiten ejercicios entre convocatorias.** Medido
  sobre los 278: tres problemas aparecen ocho veces —los tres «demostrar
  Barrow» de 2019, 2020 y 2021; el paso al límite del ≤, tres veces; y las
  cinco afirmaciones sobre dos gráficas, en las ordinarias de 2021-2022 y
  2023-2024—. Que un ejercicio se repita es la mejor señal de que va a caer, y
  hoy el sitio no lo dice en ninguna parte.
- **2** — el temario de Fluidos está en el catálogo sin fuente verificada.
- **5** — el patrón «figura fija» sigue sin construir, a propósito: ningún
  contenido lo ha pedido todavía.
- **18** — el bloque del formulario duplica hechos que ya están en la prosa.
