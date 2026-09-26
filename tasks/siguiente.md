# Siguiente sesión

Se sobrescribe cada vez; no se amplía. Lo que queda más allá está en
`pendiente.md`, con las fases en orden arriba del todo.

Escrito el 27 de septiembre de 2026 a las 02:00, a mitad de la fase A: se
paró por límite de uso.

## Antes de nada: el último commit está sin construir y sin subir

Es local. Antes de subirlo: `npm run build` —ojo al MDX de
`calculo/t04-estudio-local`, que ahora lleva `$-1<x<1$`: si MDX toma el `<x`
por una etiqueta, se escribe con `\lt`—, después `npm run suelo`, y solo
entonces `git push` y mirar que el despliegue acabe en verde. Falta también
el diario del 27 de septiembre.

## Qué toca: seguir con la fase A de la auditoría externa

El encargo —fases A a K, con su «Acepta»— y sus pruebas están en
`2027 proyecto contenido/auditorias/2026-09-27/` (`encargo-por-fases.md`,
`00-resumen.md` y un fichero por asignatura). Regla 1: cada punto se verifica
contra su fuente antes de tocarlo, y lo que no se sostiene se dice en el
commit y no se hace.

**Hecho** (en el commit local):

- A6: `CDIGOS_SOCRATIVE.pdf` en la tabla de CLAUDE.md y la cuarta regla
  práctica, la de buscar DNI antes de volcar un PDF.
- A7: la prueba de utilidad (§13) y la duración impresa (§10).
- A2 en código: `duracion` por convocatoria en `examen.yaml`, que manda sobre
  la regla; el modo exigente (`duracionDelExamen.exigente`); el botón de la
  portada solo donde hay reloj, y `verify` comprobándolo. Base de 30 min con
  exigente de 25 en Álgebra, Fluidos y Mecánica (comprobado que sus
  cuadernillos no imprimen duración) y exigente en Cálculo.
- A1 y A5 de Cálculo, verificados: el plazo de renuncia (18 semanas desde el
  curso, guía pág. 4), el distractor de Fourier, la convergencia de ln(1+x) y
  de la binómica en la prosa y en el formulario, y las tres propiedades de
  Laplace en sus dos sitios.

**Falta**, por este orden:

1. Verificar el resto contra las fuentes —se paró a medias—: Álgebra (A1
   laboratorio, A4 los siete recuentos y t03), Química (A1 laboratorio, A2
   duraciones impresas, A3 rótulo, A4 «sin material» y «sin calculadora»),
   Térmica (A1, A2 duraciones impresas, A3 la etiqueta de la resolución y
   `deuda` §1, A4 exergía, A5 seis puntos), Materiales (A1 evaluación, A5
   cinco puntos), Mecánica (A4 bilingües, A5 la g), Fluidos (A4 laboratorio),
   Sistemas (A1) y Expresión Gráfica (A1 ficha). Un verificador por
   asignatura, que solo lee y lleva la tabla de vetados de CLAUDE.md.
2. Aplicar lo que se sostenga; los minutos impresos de Térmica y Química en
   sus `examen.yaml`.
3. A4: reescribir «Bloqueado por material» en `pendiente.md`, y la trampa
   «el volcado no es la página» en §17 (`npm run trampas`).
4. Suelo, subir, despliegue en verde.

**Al acabar la fase A**, este fichero vuelve a ser la fase 1 de Expresión
Gráfica: está en el commit 479053d, y sus borradores en
`2027 proyecto contenido/Claude outputs/fase-1-borradores/`.
