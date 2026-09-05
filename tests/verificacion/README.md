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

| asignatura | respuestas numéricas de examen | recalculadas |
|---|---|---|
| **Fundamentos Químicos** | 67 | **67** |
| Cálculo | 803 | 0 |
| Fluidos | 293 | 0 |
| Álgebra | 36 | 0 |
| | **1.199** | **67 (6 %)** |

Química va primero por dos motivos, y ninguno es que fuera lo más fácil: es la
asignatura **más reciente** —sus veintisiete resoluciones se escribieron en dos
días— y la única cuyos exámenes **no publican absolutamente nada**, ni
resultado ni solución.

Fluidos es el caso contrario: sus exámenes publican el resultado, así que sus
resoluciones ya aterrizan en un número impreso o se declaran fuera, y además
sus módulos se comprueban en `tests/fisica/` contra esos mismos resultados. Es
la asignatura con menos urgencia de las cuatro, aunque siga contando aquí.

Lo que este primer pase encontró: **nada**. Las sesenta y siete cuentan
cuadran. Es un resultado, no un descarte — significa que las resoluciones de
Química se pueden citar sin la coletilla de «pendiente de revisión», y que el
procedimiento está probado para cuando toque Cálculo, donde hay 803.
