# Siguiente sesión

Se sobrescribe cada vez; no se amplía. Lo que queda más allá está en
`pendiente.md`, con las fases en orden arriba del todo.

Escrito el 28 de septiembre de 2026, al cerrar la fase F. Térmica la tiene
entera:

- **F1**: las tablas de vapor.
- **F2**: la ordinaria de 2025-26 completa, y en la extraordinaria el s₁ mal
  operado de la resolución oficial, declarado. Ocho ejercicios de la colección
  del tema 7 como práctica, con un test que los recalcula contra las tablas.
- **F3**:
  - las correlaciones del anexo en el tema 9, con cinco ejercicios de T9 y
    dos de T10 de las diapositivas;
  - la página del laboratorio, con Termograf y la sesión 4 de TermoLagun;
  - el formulario de los diez temas;
  - siete pasos `redactar` y seis `dibujar`, donde antes había uno y
    ninguno;
  - los enunciados que el encargo pedía devolver a su forma;
  - el 3.2 de la colección entero.

## Qué toca: G, Fundamentos Químicos

El encargo está en `2027 proyecto contenido/auditorias/2026-09-27/`
(`encargo-por-fases.md`, fase G). Cuatro partes, en este orden:

1. **G1 · Formulación** (1,5–2 días).
   - Las tres hojas de `Química/Formulacin/`, con 80, 50 y 50 compuestos.
     Las respuestas están en `Respuestas_EJERCICIOS_DE_FORMULACION_1.pdf` y
     `Respuestas,_Ejercicios_Formulacion-3.pdf`.
   - Se corrigen en las dos direcciones:
     - nombre → fórmula, con `respuesta.tipo: formula`, que lee
       `lib/quimica.ts`;
     - fórmula → nombre, con `reconocer` o con un banco de `TestDeMinimos`.
   - La prosa de t01 que falta: hidróxidos, hidruros, oxoácidos meta, piro y
     orto, oxisales, sales ácidas y la orgánica, que la guía pide y el sitio
     no tiene.
2. **G2 · Las dos resoluciones oficiales** (1–1,5 días).
   - `Modelos_de_exmenes/Examen_5_RESUELTO.pdf`, de 2024-25 y escaneado, como
     `2024-2025-modelo`: los ejercicios 2, 4 y 5, con el 1 y el 3 a `fuera`.
   - `Ejercicios_de_repaso/Resolucin_examen_31052013-11.pdf`, los ejercicios
     3 a 8, como `2012-2013-ord`.
   - Sus resultados entran en `tests/verificacion/`.
3. **G3 · La teoría que el programa pide** (2–3 días).
   - Lo nuevo: t04 (Dalton, coligativas y Clausius-Clapeyron), t08
     (velocidades iniciales), t09 (pH, Kb y el tampón básico) y t10
     (ion-electrón), más lo que el encargo pide en t03, t05 y t07.
   - Las frases falsas que el encargo lista, cada una con su línea.
4. **G4 · Examen y práctica** (1 día): `puntosImpresos`, `redactar` en los
   «razona» y «justifica», `dibujar` las estructuras de Lewis y la pila, y más
   colección de las hojas que ya hay.

Antes de abrir la carpeta de Química, mira la tabla de CLAUDE.md, «Antes de
nada: los datos de terceros». Las `Lista_del_grupo_*` y los
`Prctica_2._Resultados_*` no se abren. Los `.php` son páginas de eGela
guardadas: antes de usar uno, se busca en su texto el patrón del DNI sin
leerlo, como con cualquier fichero cuyo nombre no dice nada.

## Lo que quedó apuntado de F

- **Las tablas de vapor no se editan a mano.** `node scripts/tablas-vapor.mjs`
  escribe el JSON y `node scripts/figuras/termica-mollier.mjs` el Mollier.
  `tests/fisica/vapor.test.ts` falla si alguno se queda atrás, y
  `tests/verificacion/termica-t07-coleccion.test.ts` si una cuenta de la
  colección deja de salir con ellas.
- **`tests/verificacion/corpus.ts` tiene `tema()`** además de
  `convocatoria()`: lee los ejercicios de un tema igual que los de un examen.
  Sirve para cualquier colección cuyas cifras dependan de algo que puede
  cambiar.
- **El trabajo isentrópico de una bomba.** La tabla de líquido comprimido solo
  sirve si la salida cae cerca de una fila; si no, se usa $v\,\Delta P$. Lo
  cuentan el 7.11 y el 7.14, y el examen de 2025-26 acepta las dos lecturas.
- **Las erratas de las diapositivas del tema 7** se dicen en la `fuente` y se
  explican en la resolución, sin corregir el número en silencio: la bomba del
  7.11 (84 % donde es 77 %) y el 91,57 % de la bomba del 7.14.
