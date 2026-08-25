# Cómo vamos · 25 de agosto de 2026

Estado del proyecto medido sobre el repositorio, no recordado. Se regenera
cuando cambien los números.

> Las «palabras de prosa» se cuentan sobre `index.mdx` quitando la portada, los
> bloques `<svg>`, las fórmulas entre dólares y las etiquetas. Es una
> definición, no la única; lo que importa es que sea la misma en cada medición.

---

## En una frase

**El segundo cuatrimestre ya no es un agujero, pero los temas 10 y 11 siguen
sin un solo examen.** Las cinco evaluaciones continuas están transcritas
enteras —65 convocatorias, 235 ejercicios— y con ellas los temas 8 y 9 han
pasado de 1 y 0 ejercicios de examen a 13 y 17. Lo que falta son las 24
convocatorias globales: once ordinarias, once extraordinarias y los dos
parciales de 2019-2020. Son las únicas donde caen Laplace y Fourier.

---

## Cálculo, tema a tema

| tema | prosa | fig. | ejerc. propios | ejemplos | ejerc. de examen |
|---|---|---|---|---|---|
| t01 complejos | 2 885 | 3 | 37 | 8 | **51** |
| t02 sucesiones | 2 035 | 3 | 19 | 4 | **31** |
| t03 funciones reales | 1 779 | 3 | 23 | 5 | 19 |
| t04 estudio local | 2 036 | 3 | 18 | 5 | **45** |
| t05 integración | 1 925 | 4 | 30 | 4 | 26 |
| t06 varias variables | 1 797 | 2 | 12 | 4 | 13 |
| t07 integral múltiple | 1 422 | 2 | 10 | 3 | 20 |
| t08 integral curvilínea | 1 119 | 1 | 7 | 2 | 13 |
| t09 ecuaciones diferenciales | 1 241 | 1 | 7 | 2 | 17 |
| t10 Laplace | 872 | 1 | 8 | 2 | **0** |
| t11 Fourier | 888 | 1 | 8 | 2 | **0** |
| **total** | **17 999** | **24** | **179** | **41** | **235** |

La frontera ya no está en el tema 8: está en el 10. Los temas 8 y 9 tienen
ahora treinta ejercicios de examen entre los dos, y eso ha permitido rehacer su
ruta contando en vez de estimando. Los temas 10 y 11 siguen con la mitad de
prosa, una figura y ningún examen, y la razón es la misma de siempre: **solo
caen en las convocatorias globales**, que son justamente las que faltan.

## Exámenes

| convocatoria | PDF | transcritas | faltan |
|---|---|---|---|
| 1.ª evaluación | 11 | **11** | 0 |
| 2.ª evaluación | 11 | **11** | 0 |
| 3.ª evaluación | 11 | **11** | 0 |
| 4.ª evaluación (15 cuadernillos) | 15 | **17** | 0 |
| 5.ª evaluación (13 cuadernillos) | 13 | **15** | 0 |
| ordinaria | 11 | 0 | **11** |
| extraordinaria | 11 | 0 | **11** |
| ord.-extraord. 2019-2020, 2 parciales | 2 | 0 | **2** |
| **total** | **85** | **65** | **24** |

Los quince cuadernillos de cuarta evaluación dan diecisiete convocatorias y los
trece de la quinta dan quince, porque algunos traen dentro las dos partes: la
recuperación del primer cuatrimestre y la evaluación de verdad. Desglosado:
once cuartas más seis recuperaciones, y diez quintas más cinco recuperaciones.
La quinta de 2019-2020 no se celebró.

**Los 85 PDF están ya en `public/examenes/calculo/`**, copiados y verificados
byte a byte contra el original. Lo que falta es transcribir 24.

Sobre los 2 355 puntos repartidos de los 65 exámenes: **COMP1 10,2 % · COMP2
52,8 % · COMP4 37,0 %**. Es decir, **el 47,2 % de la nota de Cálculo no es
calcular**. El dato baja algo respecto de la medición anterior —era 49,5 %
sobre 33 exámenes— porque las quintas evaluaciones cargan más COMP2 que la
media: en ellas el cálculo pesa siete de cada diez puntos.

## Rutas de estudio

| ruta | bloques | escalones | medida sobre | huecos declarados |
|---|---|---|---|---|
| 1.ª evaluación | 7 | 21 | 11 convocatorias | 4 |
| 2.ª evaluación | 8 | 17 | 11 | 2 |
| 3.ª evaluación | 9 | 18 | 11 | 3 |
| 4.ª evaluación | 3 | 10 | 11 | 3 |
| 5.ª evaluación | 3 | 12 | **10** | 6 |
| ordinaria | 3 | 7 | **2** | 4 |

La de la quinta se rehizo entera al terminar sus exámenes: pasó de estar medida
sobre 3 convocatorias a estarlo sobre 10, y de 2 bloques y 7 escalones a 3 y
12. La de la ordinaria sigue medida sobre 2 y lo declara; es la siguiente.

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
| **todas las convocatorias publicadas transcritas** | ❌ **65 de 89** |

Dos criterios abiertos, y el grande es el mismo de siempre.

> El «65 de 89» merece explicación: 85 son los PDF y 89 las convocatorias que
> contienen, porque cuatro cuadernillos traen dos exámenes dentro. De las 24
> que faltan, ninguna es doble.

## Las otras ocho asignaturas

Cero contenido. Fluidos tiene los 16 temas en el catálogo y un README; las
otras siete están como `prev`. Es §00 funcionando: no se abre una hasta cerrar
la anterior.

---

# El plan

## Lo siguiente: las once ordinarias

Es lo primero por la misma razón que lo fue la quinta: **es lo único que da de
comer a los temas 10 y 11**, que hoy tienen cero ejercicios de examen. La
transformada de Laplace y las series de Fourier no aparecen en ninguna
evaluación continua; solo en las globales. Mientras no estén, esos dos temas no
se pueden ni auditar: no hay con qué medirlos.

Y de paso sube la ruta `ord` de «medida sobre 2» a «medida sobre 11».

El trabajo por examen, que ya está rodado y hoy ha salido a razón de un examen
cada media hora larga:

1. el PDF ya está en `public/examenes/calculo/` — los 85 están copiados;
2. leerlo — `pdftotext -layout` para la estructura, y la página renderizada a
   imagen para las fórmulas, que `pdftotext` se come o traduce mal;
3. **comprobar cada resultado por dos caminos** antes de escribir una línea:
   el analítico y el numérico, en un script del scratchpad;
4. escribir `examen.yaml` y `ejercicios.yaml`, con los pasos
   reconocer / calcular / justificar y los distractores sacados de errores
   reales;
5. redibujar en SVG toda figura del enunciado (§08), y mirarla en claro y en
   oscuro antes de darla por buena;
6. `node scripts/verify.mjs --solo-fuente` **antes** de `npm run build`,
   recorrer los ejercicios en el navegador con `probar.mjs`, y `npm run suelo`.

Lo aprendido hoy y que conviene no volver a tropezar:

- **dentro de un `<figure>` no se procesa Markdown**: un `$A$` en el pie se
  publica con los dólares. Hay guardián nuevo desde hoy;
- los caracteres que `pdftoppm` no sabe dibujar mienten: un «10≠ m³» resultó
  ser «10π m³», y solo se vio mirando los bytes del PDF;
- los distractores numéricos tienen que estar separados de la respuesta y entre
  sí por más del 2 % del valor, o el esquema los rechaza;
- una barra de valor absoluto dentro de una celda de tabla parte la fila:
  `\lvert` y `\rvert`, nunca `|`.

## Los días siguientes

| | trabajo | qué desbloquea |
|---|---|---|
| 1 | **11 ordinarias** | los temas 10 y 11, y la ruta `ord` |
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

- **26** — las 24 convocatorias globales. Es el plan de arriba.
- **31** — `invariante.fuente` se publica como texto plano, sin pasar por el
  procesador, así que el LaTeX sale crudo. O se procesa, o §14 lo dice.
- **32** — dos ejercicios duplicados en el corpus: `paracaidista-y-velocidad-
  limite` y `barra-que-se-calienta` son los mismos problemas que las quintas de
  2016-2017 y 2017-2018, ahora transcritas desde su PDF.
- **2** — el temario de Fluidos está en el catálogo sin fuente verificada.
- **5** — el patrón «figura fija» sigue sin construir, a propósito: ningún
  contenido lo ha pedido todavía.
- **18** — el bloque del formulario duplica hechos que ya están en la prosa.
