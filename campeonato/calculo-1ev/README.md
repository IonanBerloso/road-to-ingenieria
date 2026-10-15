# Campeonato de predicción: la 1.ª evaluación de Cálculo

Varios concursantes predicen, antes de cada examen, qué va a tener. No adivinan
enunciados: para cada rasgo de una lista cerrada de 42 («hay una región definida
con una desigualdad», «se pide la suma de una serie», «el examen tiene cuatro
ejercicios»…) dan la probabilidad de que el examen lo tenga. Después del examen
se puntúan. El objetivo es tener un historial: saber, año tras año, a qué forma
de predecir merece la pena hacer caso cuando hay poco tiempo para estudiar.

Empezó el 15 de octubre de 2026, cuatro días antes de la 1.ª evaluación del
lunes 19 de octubre de 2026. Los cuatro simulacros de esa evaluación se
eligieron mirando estas probabilidades.

## Lo sellado antes del examen del 19 de octubre de 2026

| fichero | sha256 | cerrado (UTC) |
|---|---|---|
| `sellada-claude-2026-2027.json` | `0f1aaf1f86c8b153e466c231e18f06305f8a2c2148b515cfd43745ee8206d6f4` | 2026-10-15 00:37 |
| `sellada-agentes-2026-2027.json` | `16e4c75c0854983f110994e4f62784615e1a9213247c51284118f31b4dc0f4e4` | 2026-10-15 00:59 |

Se comprueban con `sha256sum sellada-*.json`. El commit que los sube es
anterior al examen, y no se tocan nunca: si hace falta corregir algo, va en otro
fichero y con fecha.

La de Claude se cerró antes de que predijera ningún agente. Claude había visto
las once primeras evaluaciones, así que solo compite en las rondas posteriores a
ellas.

## Las reglas, fijadas antes de la primera predicción

- **La lista y la verdad** están en `verdad.json`. Cada rasgo tiene una
  definición y una regla para los casos dudosos, escritas sin citar ningún
  examen. Dos etiquetadores las aplicaron por separado a las once primeras
  evaluaciones (2015-2016 a 2025-2026). Coincidieron en los 462 pares y no hizo
  falta ningún juez.
- **Cada ronda es a ciegas.** El concursante que predice el curso X solo ve los
  exámenes anteriores a X y las etiquetas de las primeras evaluaciones
  anteriores. Ve el nombre y la definición de cada rasgo, pero no la regla de
  los árbitros, porque esa regla describe ejercicios reales.
- **Solo cuentan los rasgos que ya existían.** En cada ronda se puntúan los
  rasgos que ya habían salido en alguna primera evaluación anterior, más los que
  no han salido nunca. Un rasgo que nace en el examen predicho no cuenta: su
  presencia en la lista ya sería una pista.
- **Brier**: la media de (p − resultado)² sobre los rasgos que cuentan; menos es
  mejor. La **habilidad** es 1 − Brier / Brier de la frecuencia: positiva si el
  concursante aporta algo sobre contar lo que ya cayó.
- **Dos guiones de referencia.** La *frecuencia* da (veces que salió + 1) /
  (exámenes vistos + 2). *El de ayer* da 0,85 a lo que salió el año anterior y
  0,15 a lo demás.
- **Debate.** Tras predecir, cada concursante ve las predicciones de los demás,
  sin nombres, y puede revisar las suyas. Se puntúan las dos versiones.
- **Trampas.** Se auditan las transcripciones: abrir cualquier fichero que no
  sea el de su ronda anula la ronda. No se encontró ninguna.

Siete concursantes, cada uno con una estrategia, escrita en `concursantes.js`:
frecuentista, reciente, lo-que-toca (rotaciones), banco-grande (el repertorio de
todas las convocatorias), estructuralista (la plantilla del examen), régimen
(épocas) y escéptico (calibración). El consenso es la media de todos. Régimen
entró después de la ronda piloto (2025-2026), así que se mide sin ella.

## La pretemporada

Son ocho rondas a ciegas, de 2018-2019 a 2025-2026. La primera que se jugó, la
piloto, fue la de 2025-2026. La media de las otras siete, antes del debate:

| concursante | Brier | habilidad |
|---|---|---|
| banco-grande | 0,169 | +0,13 |
| lo-que-toca | 0,169 | +0,14 |
| consenso | 0,171 | +0,12 |
| estructuralista | 0,172 | +0,12 |
| reciente | 0,173 | +0,11 |
| régimen | 0,174 | +0,11 |
| escéptico | 0,177 | +0,10 |
| frecuentista | 0,181 | +0,07 |
| *frecuencia (guion)* | 0,196 | 0 |
| *el de ayer (guion)* | 0,251 | −0,30 |

Todos los concursantes mejoran un poco a contar frecuencias, pero entre ellos no
se distinguen: las diferencias son menores que lo que varía una ronda a otra. El
debate apenas cambia nada. Copiar el examen del año anterior es la peor
estrategia en siete de las ocho rondas. Solo gana en la piloto, 2025-2026, que
repitió la plantilla de 2024-2025.

## Después de cada examen

1. Etiquetar el examen nuevo con la misma lista y las mismas reglas, y añadirlo
   a `verdad.json`.
2. Puntuar con
   `node puntua.mjs verdad.json <predicciones.json> [salida.json]`.
   `pretemporada-predicciones.json` y `pretemporada-marcador.json` son la
   entrada y la salida de la pretemporada: con ellos se comprueba que el
   marcador da lo mismo.
3. Publicar la clasificación.

Una regla nueva se puede añadir después de ver un examen. Pero lleva fecha, y
solo se mide en las rondas que no la inspiraron.

## Ficheros

- `sellada-*.json`: las predicciones del 19 de octubre de 2026, selladas.
- `verdad.json`: la lista cerrada de rasgos y lo que tuvo cada primera
  evaluación.
- `puntua.mjs`: el marcador.
- `concursantes.js`: el guion de los concursantes. Es un *workflow* de Claude
  Code (usa `agent`, `parallel` y `pipeline`), no un programa de Node.
- `pretemporada-predicciones.json` y `pretemporada-marcador.json`: las 126
  predicciones de la pretemporada y su puntuación.
