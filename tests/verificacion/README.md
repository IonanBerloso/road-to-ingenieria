# `tests/verificacion/` — recalcular los exámenes desde el enunciado

## El problema que resuelve

De las 592 resoluciones de examen del sitio, **472 no tienen nada contra lo que
comprobarse**: sus exámenes no publican solución ni resultado. Su `fuente` lo
dice una por una, así que es honesto y no oculto, pero es el mayor riesgo del
proyecto: un desarrollo equivocado enseña algo falso con toda la apariencia de
estar bien.

Lo que ya existe **no cubre esto**:

- `npm run suelo` demuestra que el sitio no está roto, no que las cuentas salgan.
- `scripts/recalcula.mjs` comprueba que el corpus es **coherente consigo mismo**
  —que cada «expresión = decimal» que escribe es cierta—, no que la expresión
  sea la respuesta correcta a la pregunta.

Falta la única comprobación que de verdad verifica: **volver a resolver el
ejercicio desde su enunciado, por un camino escrito aparte, y ver si aterriza en
el número publicado.**

## Cómo funciona un fichero de aquí

Cada fichero toma una convocatoria, y para cada respuesta numérica:

1. Escribe **los datos del enunciado** como constantes, transcritos del
   enunciado y de ningún otro sitio.
2. Recalcula el resultado con código, sin mirar el `desarrollo` ni la
   `resolucion` del corpus.
3. Lo compara con el `valor` que el corpus publica, **dentro de la `tolerancia`
   que el propio corpus declara**.

El paso 3 es lo que hace que esto no caduque. El test **no repite el número**:
lo lee del YAML. Si alguien cambia una respuesta del corpus y la cuenta ya no
sale, el test se pone rojo — que es lo contrario de lo que pasa con un número
copiado a mano.

## Lo que esto NO es

**No es independencia total.** Lo escribe la misma persona que escribió la
resolución, así que un malentendido de fondo sobre el enunciado sobrevive a las
dos. Lo que sí atrapa —y es la mayor parte de lo que se falla— son erratas de
transcripción, unidades cambiadas, un dato del enunciado leído mal, un
intermedio arrastrado y una tolerancia demasiado ancha para el número que
declara.

**No es una barrida.** 472 resoluciones no se verifican de una tacada. Esto es
un ritmo: cada vez que se cierra o se toca una asignatura, entra una
convocatoria más. `node scripts/deuda.mjs` cuenta cuántas van.

## Estado

**No se escribe a mano.** `node scripts/deuda.mjs` lo cuenta leyendo las
llamadas a `cuadra()` de estos ficheros y comparándolas con los pasos de
examen que declaran una respuesta numérica. Al 5 de septiembre de 2026:

| asignatura | respuestas comparables de examen | recalculadas |
|---|---|---|
| **Fundamentos Químicos** | 67 | **67** |
| **Álgebra** | 76 | **76** |
| Cálculo | 805 | 386 |
| Fluidos | 293 | 0 |
| | **1.241** | **529 (43 %)** |

«Comparables» son las respuestas que `cuadra()` sabe contrastar: número,
vector, matriz y conjunto. Las de texto libre no cuentan porque no hay nada que
recalcular en ellas.

**Química fue primero** y no por fácil: es la asignatura más reciente —sus
veintisiete resoluciones se escribieron en dos días— y la única cuyos exámenes
no publican absolutamente nada.

**Álgebra fue segunda** porque es la más pequeña de las que quedaban y porque
obligó a ampliar la herramienta: solo 36 de sus 76 respuestas son números, y
verificar únicamente esas habría sido hacer media asignatura y decir que estaba
hecha.

Fluidos es el caso contrario a Química: sus exámenes publican el resultado, así
que sus resoluciones ya aterrizan en un número impreso o se declaran fuera, y
además sus módulos se comprueban en `tests/fisica/` contra esos mismos
resultados. Es la que menos urgencia tiene de las cuatro, aunque siga contando
aquí.

**Cálculo tiene ya las veintitrés convocatorias finales**, incluidas la más
reciente y la más antigua del corpus, que son las que más va a mirar quien se examine en 2027. Y aquí la comprobación es **más independiente** que
en las otras dos asignaturas: donde la resolución integra por partes o deriva y
despeja, el test integra por Simpson y busca el máximo por sección áurea. No es
el mismo camino con otra letra. El caso más claro es el trabajo de un campo
conservativo: el examen resta potenciales, el test integra a lo largo de la
trayectoria de verdad.

## Lo que estos pases encontraron

**En el corpus, nada.** Las 529 cuentas cuadran, incluidas las cadenas más
largas —los siete apartados del sulfúrico, la molalidad que arrastra cuatro
pasos, la matriz expresada en dos bases que no son la canónica, el trabajo de
la ventisca integrado sobre la trayectoria—.

**En el verificador, seis cosas**, y por eso los tres módulos que lo forman
—`lineal.ts`, `numerico.ts` y los lectores de `corpus.ts`— tienen cada uno su
fichero de tests:

1. Una normalización «a coordenadas enteras mínimas» que dividía por la primera
   coordenada y daba (1, 0, 0.25) donde el examen pide (4, 0, 1).
2. Un buscador de valores propios que localizaba las raíces por cambio de signo
   y **se dejaba las dobles**, porque una raíz doble toca el eje y no lo cruza.
   Lo destapó el ejercicio 4 de la extraordinaria de 2021-2022, que va
   justamente de eso.
3. Un lector de números que no sabía leer «1/√10», que es como el corpus
   escribe las bases ortonormales.
4. Una integral con singularidad que **suponía siempre que el extremo malo era
   el primero**, y al pedirle un cuarto de circunferencia de 4 a 2√2 devolvió
   el área con el signo cambiado sin quejarse de nada.
5. Un contador de extremos que buscaba productos negativos entre valores
   consecutivos de la derivada. Cuando la malla cae **justo encima** de un
   cero, el producto vale cero y el cambio de signo se pierde.
6. Un lector de complejos que leía «2i» como **2 + i**: el grupo de la parte
   real es codicioso, se quedaba con el 2 y dejaba la i suelta. Ese caso no
   está todavía en el corpus, así que lo encontró el test del lector y no una
   comparación fallida — que es justamente para lo que sirve.

Ninguna de las seis habría dado un fallo visible: habrían dado **confianza
falsa**, que es peor que no comprobar nada. Es el argumento entero para que el
verificador se verifique.
