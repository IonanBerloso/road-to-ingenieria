# Tests de física

Todo simulador con física dentro lleva aquí al menos un caso con resultado
conocido, verificado contra el ejercicio original o contra bibliografía.
Nunca se ajusta una constante para que salga el número esperado (CLAUDE.md §10).

Cinco ficheros y 86 casos, uno por simulador de Mecánica de Fluidos:

| fichero | simulador | de dónde salen los números |
|---|---|---|
| `moody.test.ts` | `AbacoMoody` (t18) | ejercicio 4 del 3.er parcial de junio de 2021, que recorre las tres zonas del ábaco con el mismo tubo de 250 mm |
| `bombeo.test.ts` | `PuntoFuncionamiento` (t25) | ordinaria de 2025-2026: tres bombas, cavitación y una maniobra de válvula, con seis resultados publicados |
| `compuertas.test.ts` | `PrismaDePresiones` (t07) | los dos ejemplos introductorios del propio tema, la compuerta vertical y la misma inclinada 60° |
| `canales.test.ts` | `SeccionDeCanal` (t21) | las tres secciones de 4 m² de la figura del propio tema, con sus perímetros publicados |
| `ariete.test.ts` | `GolpeDeAriete` (t20) | el error típico del propio tema, con sus **cuatro** números: los dos buenos y los dos equivocados |

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
