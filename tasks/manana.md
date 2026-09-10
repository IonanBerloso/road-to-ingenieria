# Fases del 10 de septiembre de 2026

Escritas al cerrar el día 8, sobre lo que quedó **medido**, no sobre
impresiones. Cada fase dice qué la desbloquea, qué se entrega y cómo se
comprueba.

---

## Fase 0 · La decisión que bloquea una asignatura entera

**No es trabajo: es una respuesta tuya, y va primero porque condiciona la
fase 1.**

Ingeniería Térmica no puede cerrarse contra §15 porque **no tiene ni una
convocatoria transcrita como página**, y §15 exige el PDF original en
`public/examenes/`. En el material hay 22, de las que 17 son comparables.
**Veinte de las veintidós llevan la resolución de la Escuela dentro del mismo
PDF.**

Las tres salidas, con lo que cuesta y lo que se pierde cada una:

| opción | qué se publica | coste | qué se pierde |
|---|---|---|---|
| **A · el PDF entero** | enunciado y resolución oficial | ninguno, se copia | se redistribuye la resolución del profesor |
| **B · solo el enunciado** | el PDF recortado a sus páginas de enunciado | 17 recortes a mano | nada del sitio; el alumno no ve la solución oficial |
| **C · ningún PDF** | solo los ejercicios transcritos | ninguno | **§15 no se cumple**: la asignatura no cierra |

Mi recomendación es **B**, y el motivo es concreto: los enunciados ocupan la
primera página de casi todos, así que el recorte es mecánico, y la resolución
oficial ya se usa para contrastar sin necesidad de publicarla. Pero es tu
decisión y la asignatura espera a ella.

---

## Fase 1 · Térmica, transcribir las convocatorias

**Desbloqueada por la fase 0.** Con la decisión tomada, es el trabajo más
valioso que queda en el proyecto: Térmica pasa de `obra` a cerrada.

Orden propuesto, y no es por fecha sino por rendimiento:

1. **El 30 de enero de 2024**, primero de todos. Dos de sus tres ejercicios son
   copias literales de 2020 y 2021, así que transcribirlo cubre tres
   convocatorias de una vez.
2. **Febrero de 2026 y enero de 2026**, las dos más recientes y las únicas
   compuestas a máquina — se leen con `pdftotext` y no hay que descifrar
   manuscritos.
3. **Enero de 2025 y febrero de 2025**, que traen la exigencia de resolver de
   dos maneras.
4. El resto, de más reciente a más antigua.

Cada convocatoria lleva su `examen.yaml` con reparto por competencia, su
`ejercicios.yaml` y su PDF. **Comprobación**: `verify` valida el enlace al PDF;
`deuda.mjs` cuenta las resoluciones sin nada contra lo que contrastar —hoy son
476 de 592, el 80 %— y estas nacen con la resolución oficial al lado, así que
esa cifra tiene que bajar.

---

## Fase 2 · Los 21 escalones que arrancan mal, y los 10 que van solos · HECHA

**No depende de nadie. Es la deuda de §14 mejor medida que hay.**

`deuda.mjs` cuenta hoy **10 escalones con un solo ejercicio de 293**, y nueve
de los diez son de Térmica. Con las diecisiete convocatorias leídas ya se sabe
cuáles importan: el de **la exergía destruida** tiene un solo escalón para el
bloque que cae **15 de 17 veces**, y en cinco convocatorias aparece dos veces
en el mismo examen.

Entregable: escalones nuevos para el bloque de exergía, construidos sobre lo
que las diecisiete enseñaron —los dos caminos de la exergía destruida, que
enero y febrero de 2025 piden explícitamente por separado.

**Comprobación**: la sección 5 de `deuda.mjs` baja, y ninguno de los nuevos
arranca en un ejercicio de examen (sección 2, hoy en 0).

> **Hecha el 10 de septiembre de 2026.** Los dos escalones de exergía tienen
> ya su segundo peldaño, los dos escritos por nosotros porque no hacen falta
> las convocatorias para eso: **la tubería que pierde 30 kW** —Guy-Stodola
> aplicado de verdad, con la separación entre los 30 kW de energía y los 9,22
> de exergía que se confunden siempre— y **el bloque de acero que se enfría
> solo**, que resuelve por los dos caminos sobre el molde que el del agua no
> cubría, el no adiabático, y da la cifra que más enseña de todo el bloque:
> de los 4.500 kJ que suelta, solo el 23 % era capacidad de producir trabajo.
>
> Sección 5 de `deuda.mjs`: **12 → 10**, y los dos que caen son justo los del
> bloque que cae quince de diecisiete veces. Sección 2 sigue en 0. Los dos
> pasaron `revisa-ejercicios.mjs` antes de pegarse, que es lo que pide §04, y
> `recalcula` da las 3.889 parejas del corpus cuadrando.
>
> Los diez que quedan no son deuda del mismo tipo y conviene decirlo: siete
> son escalones de suelo de Térmica —convenios de signos, decidir la zona—
> donde un solo ejemplo bien escrito basta, porque no hay dificultad que
> escalar sino una convención que aprender.

---

## Fase 3 · Las 73 frases con número que ningún guardián sabe mirar

**No depende de nadie.** Es lo que hoy dio mejor resultado por hora.

`deuda.mjs` las lista: 73 afirmaciones con cifra dentro que el guion no puede
comprobar solo. Hoy se releyeron las de Álgebra, Cálculo, Química y Fluidos y
cayeron unas veinte. **Quedan las de Térmica**, y ahora se pueden contrastar
contra diecisiete exámenes en vez de seis.

Sospechas concretas, ya localizadas:

- El `falta[]` del **diagrama de Mollier** dice que el examen lo pide y cita
  una convocatoria. Con las diecisiete delante se puede decir en cuántas.
- El del **factor de visión** dice «los cuatro publicados resuelven con el
  factor igual a uno». Verificado hoy y correcto, pero su alcance se puede
  ampliar.
- El de la **caldera** dice «una de las siete filas sin ejercicio propio».
  Comprobado hoy: la tabla tiene siete filas exactas.

---

## Fase 4 · Mirar las páginas, que es lo único que encuentra lo demás

**Media hora, y va al final del día a propósito: después de haber tocado
cosas.**

De los hallazgos de hoy, **tres no los vio ningún guardián**: los `>` sueltos
publicados, los asteriscos crudos y los chips mal etiquetados. Los tres se
vieron abriendo la página con `verify` y los 1.616 tests en verde.

Páginas a abrir, por orden de riesgo: la ruta de Térmica —es la que más se ha
tocado en dos días—, los diez temas de Térmica con sus figuras nuevas, y las
dos rutas de Álgebra.

**Comprobación**: `HUMO_TODO=1 npm run humo` sobre las 192 páginas — **sin
tubería a `tail`**, que hoy me dejó ciego durante hora y media y ocultó el
recuento por asignatura que llevaba toda la mañana diciendo que no podía dar.

---

## Lo que NO se va a hacer mañana, y por qué

- **Abrir una sexta asignatura.** §00 lo prohíbe mientras haya una en `obra`, y
  Térmica lo está.
- **La página de formulario propia** de Álgebra y Cálculo. Está declarada en
  siete `falta[]` y es trabajo de diseño, no de contenido: merece su propio día.
- **Enlazar los 97 de Álgebra y los 130 de Fluidos.** Las rutas son selectivas a
  propósito; convertirlas en catálogo sería deshacer §14.
