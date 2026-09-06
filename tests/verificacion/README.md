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
examen que declaran una respuesta numérica. Al 6 de septiembre de 2026:

| asignatura | respuestas comparables de examen | recalculadas |
|---|---|---|
| **Fundamentos Químicos** | 67 | **67** |
| **Álgebra** | 76 | **76** |
| **Cálculo** | 805 | **805** |
| Fluidos | 293 | 183 |
| | **1.241** | **1.131 (91 %)** |

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

**Fluidos es el caso contrario a Química**, y por eso va la última: sus
exámenes **publican el resultado**, así que sus resoluciones ya aterrizan en un
número impreso o se declaran fuera, y además sus módulos se comprueban en
`tests/fisica/` contra esos mismos resultados.

Eso cambia lo que se comprueba aquí. En las otras tres la pregunta es «¿es
correcto el resultado?»; en Fluidos es **«¿el camino escrito llega hasta él?»**.
Un desarrollo puede aterrizar en la cifra buena con un paso intermedio mal y
otro compensándolo, y eso solo lo destapa rehacer la cuenta.

Y trae dos cosas propias. La primera: casi todas sus respuestas llevan
**unidad**, así que se comparan con `cuadra.magnitud`, que llama a los mismos
`leeMagnitud` y `comparaMagnitud` que corrigen al alumno en la página —§17 ya
dejó dicho que un guardián que simula al producto tiene que llamar a lo que
llama el producto—. La tolerancia de `magnitud` es **relativa**, no absoluta, y
una unidad de otra magnitud es un fallo distinto de un número que no cuadra: el
test lo dice con esas palabras. La segunda: la gravedad es **9,8 y no
9,80665**, que es la de los apuntes y la que hace ciertas sus conversiones
publicadas.

**Cálculo está entera**: las 805 respuestas numéricas de sus **ochenta y ocho
convocatorias**, de 2014-2015 a 2025-2026. Las veintitrés finales —ordinarias y
extraordinarias—, las cincuenta y cuatro evaluaciones parciales y las once
recuperaciones. Es la asignatura con más aritmética del proyecto y la que más
va a mirar quien se examine en 2027.

Y aquí la comprobación es **más independiente** que en las otras dos
asignaturas: donde la resolución integra por partes o deriva y despeja, el test
integra por Simpson y busca el máximo por sección áurea. No es el mismo camino
con otra letra.

El caso más claro son las integrales de línea de las quintas evaluaciones. Esos
ejercicios están construidos **para que recorrer la curva sea inviable a mano**
—una hélice entera, un campo con arctg x y e^y sobre un semianillo— y por eso el
examen usa el atajo: resta potenciales en uno, aplica Green en el otro. El test
hace justo lo que el enunciado da por imposible: recorre la curva. Un ordenador
no tiene que saber integrar e^y a lo largo de una semicircunferencia, solo
evaluarla muchas veces.

Los lugares geométricos de las primeras evaluaciones se prestan a lo mismo por
otro lado. El examen manipula la condición hasta dejarla en la forma
(x−a)² + (y−b)² = r²; el test no despeja nada: **busca puntos del lugar
resolviendo la condición tal como está escrita y les ajusta una
circunferencia**. Si el lugar no fuera una circunferencia, o lo fuera con otro
centro, el ajuste lo diría.

## Lo que estos pases encontraron

**En el corpus, ni un error de cuenta.** Las 1.131 cuadran, incluidas las
cadenas más largas —los siete apartados del sulfúrico, la molalidad que
arrastra cuatro pasos, la matriz expresada en dos bases que no son la canónica,
el trabajo de la ventisca integrado sobre la trayectoria—.

**Pero sí un número publicado con más precisión de la que el enunciado
soporta**, y es el primero en 1.131. El apartado (c) del ejercicio 6 de la
extraordinaria de Fluidos de 2022-2023 pide la longitud de una tubería, y esa
longitud sale de **restar** la altura de la bomba menos dos pérdidas casi tan
grandes como ella. El caudal del que todo depende se despeja de una ecuación
casi degenerada —el punto cae en turbulencia casi completa, donde el factor de
fricción ya no depende del Reynolds—, así que un solve independiente aterriza
en 49,18 l/s frente a los 48,32 publicados: un 1,8 % que la tolerancia del 2 %
absorbe sin problema. En la resta, ese 1,8 % se convierte en un **8,8 %**:
32,35 m frente a 35,49.

No es un fallo de aritmética. Es que ese paso está publicado con una tolerancia
del 2 % cuando el propio problema no determina el número mejor que al 10 %, y
la resolución ya avisaba de la sensibilidad sin sacar la consecuencia. Queda
anotado en `tasks/todo.md` y el paso **no se da por verificado** mientras tanto:
es el único de los 1.241 que se deja fuera a propósito.

**En el verificador, nueve cosas**, y por eso los tres módulos que lo forman
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
7. Un cálculo de trabajo que comparaba con **tolerancia absoluta de 10⁻⁹** una
   integral que vale 2.870. El integrador adaptativo nunca llegaba a ese
   listón y la recursión se hundía sola: la tolerancia de una integral es
   relativa a lo que vale la integral, no a cero.
8. Una derivada tercera con error de truncamiento O(h²) contrastada contra
   tolerancias de 5·10⁻⁶. La fórmula no estaba mal; estaba mal el **orden**.
   Se arregló con dos niveles de Richardson, que la dejan en O(h⁶).
9. Y una que no es del verificador sino de cómo se escribió: una barra perdida
   al pasar por el shell convirtió la expresión que quita los espacios en una
   que quita las eses. Es §17, primera trampa, otra vez — y ha vuelto a pasar
   al escribir **este mismo párrafo**: la barra de la expresión regular se la
   comió el heredoc que lo insertaba, y hubo que arreglarlo con la herramienta
   de edición. La regla no dice «ten cuidado con el shell»; dice que no se
   escriben barras a través de él.

Ninguna de las nueve habría dado un fallo visible: habrían dado **confianza
falsa**, que es peor que no comprobar nada. Es el argumento entero para que el
verificador se verifique.

**Y una décima, que no es del verificador sino del recuento.** Al terminar
Cálculo el contador se quedó en **dos respuestas sin recalcular** y no había
forma de saber cuáles: `deuda.mjs` publicaba el porcentaje y el reparto por
asignatura, nada más. Con un guion aparte resultaron ser los dos pasos del
ejercicio 4 de la 2.ª evaluación de 2022-2023, un ejercicio entero **saltado sin
darse cuenta** al escribir su fichero, con los otros tres del mismo examen
puestos.

Un porcentaje no avisa de eso. Desde ese día `deuda.mjs` **lista las que
faltan** cuando a una asignatura le quedan quince o menos, con su ejercicio y
su paso. El tope se cuenta por asignatura y no sobre el total, y eso fue lo
que costó: la primera versión lo hacía sobre el total, y con Fluidos en 293 el
hueco de una sola respuesta de Cálculo no se habría listado nunca. Validado al
revés borrando una llamada a mano.
