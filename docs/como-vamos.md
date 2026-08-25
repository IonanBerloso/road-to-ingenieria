# Cómo vamos · 25 de agosto de 2026

Estado del proyecto medido sobre el repositorio, no recordado. Se regenera
cuando cambien los números.

---

## En una frase

**Cálculo está partida por la mitad, y la frontera está en el tema 8.** Los
temas 1 a 7 están terminados de verdad; del 8 al 11 hay prosa pero casi ningún
examen con el que medirse. La causa es una sola y ya está identificada: faltan
los 37 exámenes del segundo cuatrimestre.

---

## Cálculo, tema a tema

| tema | prosa | fig. | ejerc. propios | ejemplos | ejerc. de examen |
|---|---|---|---|---|---|
| t01 complejos | 1 235 | 3 | 37 | 8 | **49** |
| t02 sucesiones | 920 | 3 | 19 | 4 | **30** |
| t03 funciones reales | 1 774 | 3 | 23 | 5 | 15 |
| t04 estudio local | 1 139 | 3 | 18 | 5 | **38** |
| t05 integración | 1 903 | 4 | 30 | 4 | 26 |
| t06 varias variables | 1 738 | 2 | 12 | 4 | 12 |
| t07 integral múltiple | 1 331 | 2 | 10 | 3 | 18 |
| t08 integral curvilínea | 1 050 | 1 | 7 | 2 | **1** |
| t09 ecuaciones diferenciales | 1 159 | 1 | 7 | 2 | **0** |
| t10 Laplace | 809 | 1 | 8 | 2 | **0** |
| t11 Fourier | 837 | 1 | 8 | 2 | **0** |
| **total** | **13 895** | **24** | **179** | **41** | **189** |

Los cuatro últimos temas tienen la mitad de prosa, una figura, siete u ocho
ejercicios y prácticamente ningún examen. Quien llegue a Laplace o a Fourier no
tiene con qué medirse.

## Exámenes

| convocatoria | en el volcado | transcritas | faltan |
|---|---|---|---|
| 1.ª evaluación | 11 | **11** | 0 |
| 2.ª evaluación | 11 | **11** | 0 |
| 3.ª evaluación | 11 | **11** | 0 |
| 4.ª evaluación (15 cuadernillos) | 15 | **17 convocatorias** | 0 |
| 5.ª evaluación | 13 | 0 | **13** |
| ordinaria | 11 | 0 | **11** |
| extraordinaria | 11 | 0 | **11** |
| ord.-extraord. 2019-2020, 2 parciales | 2 | 0 | **2** |
| **total** | **85** | **48 PDF · 50 entradas** | **37** |

Los quince cuadernillos de cuarta evaluación dan diecisiete convocatorias
porque dos de ellos traen dentro las dos partes: once cuartas evaluaciones y
seis recuperaciones del primer cuatrimestre.

**El primer cuatrimestre está cerrado del todo.** Del segundo, solo la cuarta.

Sobre los 1 895 puntos repartidos de los 50 exámenes: **COMP1 10,0 % · COMP2
50,9 % · COMP4 39,1 %**. Casi la mitad de la nota de Cálculo no es calcular.

## Rutas de estudio

| ruta | bloques | escalones | medida sobre | huecos declarados |
|---|---|---|---|---|
| 1.ª evaluación | 7 | 21 | 11 convocatorias | 4 |
| 2.ª evaluación | 8 | 17 | 11 | 2 |
| 3.ª evaluación | 9 | 18 | 11 | 3 |
| 4.ª evaluación | 3 | 10 | 11 | 3 |
| 5.ª evaluación | 2 | 7 | **3** | 4 |
| ordinaria | 3 | 7 | **2** | 4 |

Las dos últimas están medidas sobre 3 y 2 convocatorias en vez de sobre once
porque sus exámenes no están transcritos. Lo declaran en su `falta[]`.

## Contra el criterio de «asignatura terminada» (§15)

| criterio | |
|---|---|
| temas del temario oficial, con fuente | ✅ 11/11 |
| todo tema enlazado por una ruta tiene prosa | ✅ |
| cada tema con ejemplo introductorio propio | ✅ 41 |
| cada tema con al menos una figura | ✅ 24 |
| una ruta por evaluación | ✅ 6 |
| `tests/fisica/` con un caso por simulador | ✅ vacío, no hay simuladores |
| `falta[]` dice lo que no está | ✅ 20 huecos |
| `npm run suelo` en verde | ✅ |
| **todas las convocatorias publicadas transcritas** | ❌ **48 de 85** |

**Un solo criterio abierto**, y es el grande.

## Las otras ocho asignaturas

Cero contenido. Fluidos tiene los 16 temas en el catálogo y un README; las
otras siete están como `prev`. Es §00 funcionando: no se abre una hasta cerrar
la anterior.

---

# El plan

## Mañana

### 1 · La quinta evaluación, 13 exámenes

Es lo primero por una razón concreta: **es lo que da de comer a los temas 8 y
9**, que hoy tienen 1 y 0 ejercicios de examen. Y sube la ruta 5ev de «medida
sobre 3» a «medida sobre 13».

El trabajo por examen, que ya está rodado:

1. copiar el PDF a `public/examenes/calculo/`, con el nombre en minúscula y
   guiones;
2. leerlo — `pdftotext -layout` para la estructura, y la página renderizada a
   imagen para las fórmulas, que `pdftotext` se come;
3. **comprobar cada resultado por dos caminos** antes de escribir una línea:
   el analítico y el numérico, en un script del scratchpad;
4. escribir `examen.yaml` y `ejercicios.yaml`, con los pasos
   reconocer / calcular / justificar y los distractores sacados de errores
   reales;
5. redibujar en SVG toda figura del enunciado (§08) — **sin líneas en blanco
   dentro del `<svg>`**, que ahora la tubería lo arregla pero es mejor no
   pedírselo;
6. `npm run build`, recorrer los ejercicios en el navegador con
   `probar.mjs`, y `npm run suelo`.

Dos cosas que el día de hoy ha dejado aprendidas y conviene no volver a
tropezar:

- los distractores numéricos tienen que estar separados de la respuesta y
  entre sí por más del 2 % del valor, o el esquema los rechaza — y hace bien,
  porque si no el lector daría por bueno el error;
- una barra de valor absoluto dentro de una celda de tabla parte la fila:
  `\lvert` y `\rvert`, nunca `|`.

**Ritmo realista:** los 17 ejercicios de hoy salieron en una sesión larga. Las
trece quintas evaluaciones son del orden de 35–40 ejercicios. No entra en un
día; lo que sí entra es una parte grande, y conviene ir comprometiendo examen a
examen para no acumular.

### 2 · Después, con lo aprendido de esos exámenes

**Engordar los temas 8 y 9.** Ahora mismo son cáscara, pero *qué* les falta
solo se sabe leyendo sus exámenes — no antes. Por eso va después y no antes.

**Rehacer la ruta 5ev** con `medidoSobre: 13` y los bloques recontados. Igual
que hoy con la de la cuarta: no basta con cambiar el número, hay que releer
cada afirmación de recuento, porque las que valían sobre tres suelen ser falsas
sobre trece.

## Los días siguientes

| | trabajo | qué desbloquea |
|---|---|---|
| 3 | **11 ordinarias** | la ruta `ord` y los temas 10 y 11 |
| 4 | **11 extraordinarias** + los 2 parciales de 2019-2020 | cierra la deuda 26 |
| 5 | **Ruta de la extraordinaria**, que todavía no existe | §15 pide una por evaluación |
| 6 | **Auditoría de Cálculo entera** y cierre según §15 | |
| 7 | **Abrir Álgebra** | |

Cuando entre Álgebra habrá que separar el lector de respuestas de
`EjercicioGuiado`: una **matriz** no es un número ni un conjunto de puntos, y
ese es el sitio por donde Álgebra tensiona el sistema. Es la razón por la que
va antes que Fluidos, que son 25 temas y la asignatura más cara de las nueve.

## Deudas abiertas que no bloquean

Están todas en `tasks/todo.md` con su número. Las que siguen vivas y merecen
una línea:

- **26** — los 37 exámenes. Es el plan de arriba.
- **31** — `invariante.fuente` se publica como texto plano, sin pasar por el
  procesador, así que el LaTeX sale crudo. O se procesa, o §14 lo dice.
- **2** — el temario de Fluidos está en el catálogo sin fuente verificada.
- **5** — el patrón «figura fija» sigue sin construir, a propósito: ningún
  contenido lo ha pedido todavía.
- **18** — el bloque del formulario duplica hechos que ya están en la prosa.

Hoy se cerraron la **14** (los mapas de convocatoria repartidos por cuatro
ficheros) y la **30** (la frontera de la cuarta evaluación).
