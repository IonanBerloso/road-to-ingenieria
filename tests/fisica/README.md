# Tests de física

Todo simulador con física dentro lleva aquí al menos un caso con resultado
conocido. Nunca se ajusta una constante para que salga el número esperado
(CLAUDE.md §10).

**Nueve ficheros y 166 casos**, para nueve simuladores. La cifra la da
`node scripts/deuda.mjs`, que desde el 13 de septiembre de 2026 la compara con
la que hay escrita aquí: esta línea llegó a decir «cinco ficheros y 86 casos»
y estuvo tres días diciéndolo con ocho ficheros en la carpeta.

**Y una distinción que hay que leer antes que la tabla.** «Verificado» no
significa lo mismo en todas las filas. En **tres** de las nueve el número contra
el que se compara sale de una **convocatoria**; en **dos** sale de nuestra
propia figura pero hay además una **invariante matemática independiente** que
el test comprueba aparte; y en las **tres** restantes sale solo de nuestra
prosa o de nuestra figura, y entonces el test comprueba que el modelo y la
página digan lo mismo, no que digan la verdad. Es una prueba de regresión, que
también sirve, pero no es un ancla. Lo encontró la auditoría del 13 de septiembre de 2026, y
está dicho aquí porque un guardián que se cree más fuerte de lo que es hace más
daño que uno que falta.

| fichero | casos | simulador | de dónde salen los números | ancla |
|---|---|---|---|---|
| `moody.test.ts` | 22 | `AbacoMoody` (t18) | ejercicio 4 del 3.er parcial de junio de 2021, que recorre las tres zonas del ábaco con el mismo tubo de 250 mm | **externa** |
| `bombeo.test.ts` | 17 | `PuntoFuncionamiento` (t25) | ordinaria de 2025-2026: tres bombas, cavitación y una maniobra de válvula, con seis resultados publicados | **externa** |
| `viga.test.ts` | 22 | `DiagramasDeViga` (mecánica t06) | ejercicios 6.2, 6.5 y 6.9 de la colección y el 49MgL/8 de la ordinaria de 2024-2025 | **externa** |
| `catenaria.test.ts` | 14 | `LaCatenaria` (mecánica t05) | la figura del propio tema — pero con la invariante y² = c² + s² comprobada aparte, que sí es independiente | mixta |
| `mecanismo.test.ts` | 10 | `CentroInstantaneo` (mecánica t08) | la figura del propio tema — con la velocidad contrastada contra la derivada numérica de la posición, que sí es independiente | mixta |
| `compuertas.test.ts` | 16 | `PrismaDePresiones` (t07) | los dos ejemplos introductorios del propio tema, la compuerta vertical y la misma inclinada 60° | propia |
| `canales.test.ts` | 27 | `SeccionDeCanal` (t21) | las tres secciones de 4 m² de la figura del propio tema, con sus perímetros publicados | propia |
| `ariete.test.ts` | 25 | `GolpeDeAriete` (t20) | el error típico del propio tema, con sus **cuatro** números: los dos buenos y los dos equivocados | propia |
| `plano.test.ts` | 13 | `PlanoComplejo` (cálculo t01) | el error típico del propio tema: con z = −1 − i, arctan devuelve π/4 y el argumento es −3π/4 | propia |

**Los nueve simuladores tienen ya su fichero.** El último en llegar fue
`PlanoComplejo`, el 15 de septiembre de 2026: hasta entonces era el único cuyo
modelo vivía dentro del `.astro`. Ahora está en `src/lib/plano.ts`, y lo que
el test ancla no es una fórmula de física sino una **distinción**: que
`argumento` y `arctanIngenuo` no calculan lo mismo, que es justo lo que el
simulador existe para enseñar.

## Dos reglas que salieron de escribirlos

**El caso va antes que el componente.** Los cinco se escribieron así, y las
cinco veces el test cambió algo de la prosa:

- las fronteras del ábaco de Moody no son «exactamente los 0,3 y 6 de
  Nikuradse»: medidas sobre el ábaco entero van de 0,17 a 0,61 y de 3,6 a 10,6;
- aplicar las leyes de semejanza al punto de funcionamiento en vez de a la
  curva de la bomba se equivoca un **52 %** al bajar el régimen un 20 %, no
  «algo»;
- la excentricidad del centro de presión sigue una ley exacta que el tema no
  tenía, `e/L = L/(k·Y_G)`, con `k` 12, 16 o 18 según la forma;
- el óptimo de una sección de canal es **plano**: de `b/h` 1,5 a 3 se paga
  menos de un 3 %, así que un condicionante moderado sale casi gratis;
- y en la frontera entre Allievi y Michaud **no hay salto**, porque Michaud
  con `T_c = 2L/a` es exactamente `a·v/g`.

**La física vive en `src/lib/`, no dentro del `.astro`.** No es estilo: el
código de un `<script>` de Astro no se puede importar desde vitest, así que un
simulador con la física dentro no se puede probar y la regla de arriba se
queda en decoración.

## Y los números salen del corpus, no de un libro

En los cinco casos se eligió a propósito un ejercicio o una figura **del propio
tema o de una convocatoria transcrita**, y no un ejemplo de manual. El motivo
es concreto: si el módulo no reprodujera esos números, el simulador estaría
contradiciendo a la figura que tiene tres párrafos más arriba en la misma
página.
