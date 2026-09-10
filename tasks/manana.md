# Fases del 10 de septiembre de 2026

Escritas al cerrar el día 8, sobre lo que quedó **medido**, no sobre
impresiones. Cada fase dice qué la desbloquea, qué se entrega y cómo se
comprueba.

---

## Fase 0 · La decisión que bloquea una asignatura entera · RESUELTA

> **Ionan eligió la A el 10 de septiembre de 2026: «publícalo todo y ya
> decidiremos después».** Los 22 PDF están en `public/examenes/`, con la
> resolución oficial dentro, y con eso se levantó el bloqueo.
>
> Lo único que conviene tener presente, y se dijo al hacerlo: **el historial
> de git conserva los ficheros aunque un día se sustituyan por versiones
> recortadas.** «Decidiremos después» funciona para todo menos para eso.
>
> Lo que costó: 64,1 MB en 24 ficheros, que más que duplican el historial. Se
> intentó comprimirlos y no hay ganancia —son escaneos ya optimizados—.
> Justificado contra §12 en el commit.

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

## Fase 1 · Térmica, transcribir las convocatorias · EN MARCHA, 6 de 22

**Desbloqueada por la fase 0.** Con la decisión tomada, es el trabajo más
valioso que queda en el proyecto: Térmica pasa de `obra` a cerrada.

> **Al cierre del 10 de septiembre de 2026 hay seis montadas**: enero de 2018
> (1 de 3 ejercicios), febrero de 2022 (1 de 3), enero de 2023 (3 de 3), enero
> de 2025 (2 de 3), enero de 2026 (3 de 3, en 7 resoluciones) y febrero de
> 2026 (3 de 3). Todo lo que falta está en un `fuera` con su motivo, y el
> motivo es siempre el mismo: **no falta material, falta escribirlo**. Es una
> distinción que conviene mantener limpia, porque los `fuera` de Fluidos son
> casi todos de material y esos no se arreglan trabajando.
>
> **Lo que cambió el orden propuesto sobre la marcha.** El plan ponía primero
> enero de 2024 por rendimiento, pero al medir *qué se puede leer* resultó que
> solo cuatro convocatorias tienen capa de texto aprovechable —2025-2026 las
> dos, enero de 2023 y febrero de 2022— y que junio de 2017, que parecía
> tenerla, la tiene **corrupta**. El resto son escaneos que hay que abrir
> página a página. Así que se empezó por las legibles, que es lo que permitió
> montar seis en una tarde.
>
> **Y dos que no se van a poder**: las de 2014-2015 están en euskera. §00 dice
> que el sitio es solo en castellano y §08 prohíbe reescribir un enunciado, así
> que se publican como PDF y no como página. Declarado, no escondido.

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
> **~~Los diez que quedan no son deuda del mismo tipo: siete son escalones de
> suelo de Térmica donde un solo ejemplo basta.~~ · falso, corregido esa misma
> tarde al mirarlos uno a uno.** Solo **dos** de los siete son suelo —`theta-y-te`
> y `el-convenio-de-signos`, los dos con `anios: 0`, donde efectivamente no hay
> dificultad que escalar sino una convención que aprender—. Los otros
> **cinco sostienen bloques que caen 16 de 17 convocatorias**: el trabajo de
> frontera, la entalpía y los calores específicos, decidir la zona, el título
> del depósito rígido y el circuito de resistencias. Eso no es deuda de suelo:
> es el núcleo de la asignatura con un solo peldaño cada uno.
>
> Escribí esa frase sin abrir los escalones, y es exactamente el fallo que
> llevo el día entero corrigiendo en notas ajenas: **una afirmación cómoda que
> nadie contó**. Al contarla, uno de los cinco ya está resuelto —el trabajo de
> frontera, con el ejercicio 2 de la colección— y los otros cuatro tienen
> ahora un camino que no depende de ninguna decisión: la colección de Térmica.

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

## Fase 5 · Cerrar Térmica, que es lo único que bloquea el resto

**Escrita al final del 10 de septiembre de 2026, con las fases 0, 2, 3 y 4
cerradas y la 1 a medias.** No es una fase nueva: es la 1 partida en dos, porque
al hacerla se vio que sus dos mitades cuestan cosas muy distintas.

Va primero **porque bloquea**: §00 prohíbe abrir una sexta asignatura mientras
Térmica esté en `obra`, y quedan cuatro sin abrir con septiembre de 2027
encima. Nada de lo demás está bloqueado por nada.

### 5A · Los cinco ejercicios de las tres convocatorias a medias

Lo más barato que queda, y con diferencia: **los cinco enunciados ya están
leídos** y descritos uno a uno en su `fuera`. No hay que descifrar ningún
manuscrito nuevo; hay que escribirlos.

| convocatoria | faltan | qué son |
|---|---|---|
| enero de 2018 | 2 de 3 | una cámara de mezcla · dos gases con un pistón interno |
| febrero de 2022 | 2 de 3 | mezcla adiabática de dos corrientes · tubería con aislante |
| enero de 2025 | 1 de 3 | el molde del agua caliente vertida sobre agua fría |

El de enero de 2025 es el que más rinde: es **el molde que más se repite de
toda la asignatura** y vuelve a salir en febrero de 2020 y febrero de 2025. El
de los dos gases separados por un pistón móvil es el único así en el corpus, y
el de febrero de 2022 cierra por una entropía en vez de por una temperatura.

**Comprobación**: las tres convocatorias pasan a decir «3 de 3» y desaparecen
sus bloques `fuera`.

### 5B · Las catorce que faltan por montar

Aquí está el trabajo de verdad, y conviene no engañarse con el ritmo de hoy:
de las seis montadas, **tres fueron montar ejercicios ya escritos** y solo dos
se transcribieron enteras desde cero. Las catorce que quedan son todas desde
cero.

Y sobre todo: **solo tres tienen capa de texto aprovechable**. Las once
restantes son escaneos manuscritos que hay que abrir página a página. Junio de
2017 parecía tenerla y la tiene **corrupta** —el volcado sale como ruido—, así
que cuenta como escaneo.

Orden por rendimiento, no por fecha:

1. Las tres legibles primero, para hacer camino.
2. **Enero de 2024**, porque dos de sus tres ejercicios se repiten literalmente
   en 2020 y 2021 — transcribirlo cubre tres convocatorias de una vez. *(Esto
   viene de la lectura del 9 de septiembre y conviene volver a comprobarlo
   antes de apoyarse en ello.)*
3. El resto, de más reciente a más antigua.

**Y dos que no se van a poder**, declaradas: las de 2014-2015 son un folio cada
una y solo en euskera. §00 dice que el sitio es solo en castellano y §08
prohíbe reescribir un enunciado.

> **Ojo con dar por hecho el idioma mirando una página.** El 10 de septiembre
> se publicó que enero de 2025 «sale solo en euskera» tras mirar su primera
> página, y era falso: el castellano está en la segunda. Costó dejar fuera de
> alcance un ejercicio perfectamente transcribible durante unas horas. Antes de
> declarar que una convocatoria no se puede transcribir, **se mira el documento
> entero**, no su portada.

---

## Lo que NO se va a hacer mañana, y por qué

- **Abrir una sexta asignatura.** §00 lo prohíbe mientras haya una en `obra`, y
  Térmica lo está.
- **La página de formulario propia** de Álgebra y Cálculo. Está declarada en
  siete `falta[]` y es trabajo de diseño, no de contenido: merece su propio día.
- **Enlazar los 97 de Álgebra y los 130 de Fluidos.** Las rutas son selectivas a
  propósito; convertirlas en catálogo sería deshacer §14.
