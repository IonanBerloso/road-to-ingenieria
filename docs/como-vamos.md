# Cómo vamos · 26 de agosto de 2026

Estado del proyecto medido sobre el repositorio, no recordado. Se regenera
cuando cambien los números.

> Las «palabras de prosa» se cuentan sobre `index.mdx` quitando la portada, los
> bloques `<svg>`, las fórmulas entre dólares y las etiquetas. Es una
> definición, no la única; lo que importa es que sea la misma en cada medición.

> **Este fichero llevaba dos commits siendo falso.** La medición anterior se
> escribió con una sola ordinaria transcrita y no se regeneró al entrar las de
> 2024-2025 y 2023-2024: decía «66 de 89» y «243 ejercicios» cuando ya eran 68
> y 260. §10 no admite eso ni un commit, así que la regla práctica que sale de
> aquí es la de siempre, escrita para no volver a saltársela: **la medición se
> regenera en el mismo commit que la cambia, no en el siguiente.**

---

## En una frase

**Cuatro de las once ordinarias están hechas, y con ellas los temas 10 y 11
empiezan a tener corpus.** Van 69 convocatorias de 89 y 269 ejercicios de
examen. Laplace y Fourier pasan de un ejercicio cada uno a **cuatro cada uno**,
que es todo lo que hay: solo caen en las globales. Faltan 20 convocatorias:
siete ordinarias, once extraordinarias y los dos parciales de 2019-2020.

---

## Cálculo, tema a tema

| tema | prosa | fig. | ejerc. propios | ejemplos | ejerc. de examen |
|---|---|---|---|---|---|
| t01 complejos | 2 885 | 3 | 37 | 8 | **55** |
| t02 sucesiones | 2 035 | 3 | 19 | 4 | 31 |
| t03 funciones reales | 1 779 | 3 | 23 | 5 | 19 |
| t04 estudio local | 2 036 | 3 | 18 | 5 | **55** |
| t05 integración | 1 925 | 4 | 30 | 4 | 29 |
| t06 varias variables | 1 797 | 2 | 12 | 4 | 15 |
| t07 integral múltiple | 1 422 | 2 | 10 | 3 | 24 |
| t08 integral curvilínea | 1 119 | 1 | 7 | 2 | 15 |
| t09 ecuaciones diferenciales | 1 241 | 1 | 7 | 2 | 18 |
| t10 Laplace | 872 | 1 | 8 | 2 | **4** |
| t11 Fourier | 888 | 1 | 8 | 2 | **4** |
| **total** | **17 999** | **24** | **179** | **41** | **269** |

La frontera sigue estando en el 10 y el 11, pero ya se mueve: cuatro
ejercicios cada uno, uno por ordinaria transcrita, y ninguno de ellos en la
evaluación continua. Los dos temas siguen con la mitad de prosa que los
primeros y una sola figura; engordarlos tiene que esperar a tener los once
exámenes, porque hacerlo antes sería decidir el contenido por lo que dicen
cuatro convocatorias.

La columna «fig.» cuenta solo las figuras de la prosa de los temas. Las de los
enunciados de examen van aparte: la ordinaria de 2022-2023 ha traído seis, y de
ellas dos son nuestras —la base del sólido de Viviani y la escalera de Fourier,
que es literalmente el apartado a) del ejercicio—.

## Exámenes

| convocatoria | PDF | transcritas | faltan |
|---|---|---|---|
| 1.ª evaluación | 11 | **11** | 0 |
| 2.ª evaluación | 11 | **11** | 0 |
| 3.ª evaluación | 11 | **11** | 0 |
| 4.ª evaluación (15 cuadernillos) | 15 | **17** | 0 |
| 5.ª evaluación (13 cuadernillos) | 13 | **15** | 0 |
| ordinaria | 11 | **4** | **7** |
| extraordinaria | 11 | 0 | **11** |
| ord.-extraord. 2019-2020, 2 parciales | 2 | 0 | **2** |
| **total** | **85** | **69** | **20** |

Los quince cuadernillos de cuarta evaluación dan diecisiete convocatorias y los
trece de la quinta dan quince, porque algunos traen dentro las dos partes: la
recuperación del primer cuatrimestre y la evaluación de verdad. Desglosado:
once cuartas más seis recuperaciones, y diez quintas más cinco recuperaciones.
La quinta de 2019-2020 no se celebró.

**Los 85 PDF están ya en `public/examenes/calculo/`**, copiados y verificados
byte a byte contra el original. Lo que falta es transcribir 20.

Sobre los 2 695 puntos repartidos de los 69 exámenes: **COMP1 9,6 % · COMP2
54,6 % · COMP4 35,8 %**. Es decir, **el 45,4 % de la nota de Cálculo no es
calcular**. Sigue bajando según entran exámenes —era 49,5 % sobre 33 y 46,8 %
sobre 66— y el motivo es el mismo: las convocatorias largas cargan más COMP2
que la media. Las ordinarias reparten 7 u 8 puntos de cálculo de cada 10 en
casi todos sus ejercicios.

## Rutas de estudio

| ruta | bloques | escalones | medida sobre | huecos declarados |
|---|---|---|---|---|
| 1.ª evaluación | 7 | 21 | 11 convocatorias | 4 |
| 2.ª evaluación | 8 | 17 | 11 | 2 |
| 3.ª evaluación | 9 | 18 | 11 | 3 |
| 4.ª evaluación | 3 | 10 | 11 | 3 |
| 5.ª evaluación | 3 | 12 | 10 | 6 |
| ordinaria | 3 | 7 | **2** | 4 |

La de la ordinaria dice estar medida sobre 2 convocatorias y ya hay 4
transcritas. No es un dato falso —se midió sobre 2 cuando se escribió—, pero sí
uno que envejece a la vista: se rehace entera cuando estén las once, igual que
se hizo con la quinta, y no antes, porque medirla sobre cuatro para volver a
medirla sobre once es trabajo tirado.

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
| **todas las convocatorias publicadas transcritas** | ❌ **69 de 89** |

> El «69 de 89» merece explicación: 85 son los PDF y 89 las convocatorias que
> contienen, porque cuatro cuadernillos traen dos exámenes dentro. De las 20
> que faltan, ninguna es doble.

## Las otras ocho asignaturas

Cero contenido. Fluidos tiene los 16 temas en el catálogo y un README; las
otras siete están como `prev`. Es §00 funcionando: no se abre una hasta cerrar
la anterior.

---

# El plan

## Lo siguiente: las siete ordinarias que faltan

Es lo primero por la misma razón que lo fue la quinta: **es lo único que da de
comer a los temas 10 y 11**. La transformada de Laplace y las series de Fourier
no aparecen en ninguna evaluación continua. Con cuatro ejercicios de cada uno
todavía no se puede auditar nada; con once sí.

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

Lo aprendido en la ordinaria de 2022-2023, que conviene no volver a tropezar:

- **el cálculo analítico también se equivoca.** El volumen del sólido de
  Viviani salió 38,58 por integración numérica y 19,29 por la fórmula cerrada
  que escribí; la mala era la fórmula —había puesto $\pi/2$ donde iba $\pi$ y
  $2/3$ donde iba $4/3$—. Los dos caminos existen justo para esto, y la lección
  es que **discrepar no significa que el numérico esté mal**;
- **una figura redibujada hay que medirla sobre el original, no estimarla.**
  La primera versión de las gráficas de $f$ y $g$ tenía la escala vertical a la
  mitad de la horizontal, y los dos cortes de $g$ cerca de los extremos —de los
  que depende la respuesta de un paso— quedaban invisibles. Se rehizo midiendo
  un recorte a 600 dpi: cuadrícula cuadrada, ceros en 1,15 y 2,85, amplitud
  0,553;
- **y hay que mirar el recorte bueno.** A 260 dpi leí el segundo cero de $f$ en
  3,05, y a 600 dpi estaba en 2,84. Con el primer valor la función no cortaba
  al eje dentro del intervalo y el ejercicio entero se caía;
- una etiqueta con `paint-order: stroke` y `stroke: var(--paper)` resuelve casi
  todas las colisiones entre rótulos y curvas, y funciona igual en claro y en
  oscuro.

## Los días siguientes

| | trabajo | qué desbloquea |
|---|---|---|
| 1 | **7 ordinarias** (2025-2026, 2024-2025, 2023-2024 y 2022-2023 ya están) | los temas 10 y 11, y la ruta `ord` |
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

- **26** — las 20 convocatorias globales que faltan. Es el plan de arriba.
- **31** — `invariante.fuente` se publica como texto plano, sin pasar por el
  procesador, así que el LaTeX sale crudo. O se procesa, o §14 lo dice.
- **32** — dos ejercicios duplicados en el corpus: `paracaidista-y-velocidad-
  limite` y `barra-que-se-calienta` son los mismos problemas que las quintas de
  2016-2017 y 2017-2018, ahora transcritas desde su PDF.
- **33** — la ruta `ord` dice «medida sobre 2» con cuatro ordinarias hechas.
  Se rehace cuando estén las once.
- **2** — el temario de Fluidos está en el catálogo sin fuente verificada.
- **5** — el patrón «figura fija» sigue sin construir, a propósito: ningún
  contenido lo ha pedido todavía.
- **18** — el bloque del formulario duplica hechos que ya están en la prosa.
