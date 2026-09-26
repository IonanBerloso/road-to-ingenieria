# CLAUDE.md — Road to Ingeniería

Reglas de este repositorio. Léelas enteras antes de tocar ningún fichero.

El código vive en la carpeta `2027/` y se publica al subir a `main`
(`IonanBerloso/road-to-ingenieria`, GitHub Pages). **El repositorio es
público**: todo lo que se escribe aquí —código, datos, estos documentos, los
mensajes de commit— lo puede leer cualquiera. De ahí sale la regla que va
antes que todas las demás.

## Antes de nada: los datos de terceros

Parte del material de las asignaturas, que vive **fuera** del repositorio en
la carpeta «2027 proyecto contenido», lleva datos de personas reales: notas,
DNI, listas de clase, grupos de prácticas. Esos ficheros **no entran en el
repositorio, no se citan, no se convierten y no se abren para «mirar un
dato»**. No hay «solo para comprobar una cifra».

| asignatura | fichero | qué lleva |
|---|---|---|
| Álgebra | `PRIMER_CONTROL._NOTAS.pdf` | DNI y notas |
| Álgebra | `Subgrupos_para_prcticas_de_ordenador.pdf` | nombres por subgrupo |
| Cálculo | `TRABAJO_EN_GRUPO._NOTA_FINAL.pdf` | notas |
| Cálculo | `DISTRIBUCIN_DE_GRUPOS_DE_PRCTICAS_DE_LABORATORIO.pdf` | nombres por grupo |
| Cálculo | `CONVOCATORIA_EXTRAORDINARIA._PARCIALES_A_REALIZAR.pdf` | DNI |
| Mecánica Aplicada | `Notas_parcial_esttica.pdf` | notas |
| Mecánica de Fluidos | `Grupos_Laboratorio_16A_2025-26_act._20260212.pdf` | nombres completos |
| Expresión Gráfica | `CONVOCATORIA_EXTRAORDINARIA_-_NOTAS.pdf`, `CONVOCATORIA_ORDINARIA_-_CALIFICACIONES.pdf` | notas |
| Fundamentos Químicos | `Lista_del_grupo_01_GL1…GL4_apellidos_*.php`, `Prctica_2._Resultados_01_GL1…GL4.php` | listas y resultados por persona |
| Ingeniería Térmica | `20252026_Nota_Prcticas_de_Laboratorio.pdf`, `Notas_de_prcticas_de_aos_anteriores.pdf`, `Resultados_Test_1.1.pdf`, `Resultados_Test_2.1.pdf` | notas |
| Ingeniería Térmica | `Normas_y_recomendaciones_para_seguir_la_asignatura.pdf` | **los apellidos del alumnado por subgrupo, en la última página** |
| Ciencia de Materiales | lo que lleva «Grupo N» en el nombre, `RESULTADOS_DE_LA_PRACTICA_5-TRABAJO_EN_FRO_GL1`, `DATOS_DE_LA_PRCTICA_6_Y_MATERIAL_DE_APOYO_GL1` | presentaciones y resultados con nombres |
| Sistemas de Producción | `Distribucin_grupos_prcticas.pdf` | nombres por grupo |

Tres reglas prácticas, porque la lista nunca estará completa:

1. **Un fichero con «notas», «calificaciones», «lista», «grupo» o
   «resultados» en el nombre se trata como personal** hasta que se demuestre
   lo contrario, y demostrarlo no exige abrirlo entero.
2. **Al volcar un PDF nuevo de material, se mira el final antes de usar
   nada.** Las normas de Térmica parecían un documento de la asignatura y
   traían los apellidos en la última hoja.
3. **Una foto o un escaneo de un examen que alguien pasa no se publica**: se
   transcribe el enunciado. La foto enseña a quien la hizo —una mano, un
   cuaderno, un nombre— y eso no es nuestro. Así se hizo con el test de
   mínimos de Materiales de 2024.

Si una tarea parece necesitar uno de estos ficheros, se para y se pregunta
(§13, caso 5).

### Lo que no se negocia, en una pantalla

- **Un enunciado de examen se copia literal y nunca se inventa** (§08; §13,
  caso 2).
- **Un dato se mide o no se publica**, y un número dentro de una frase
  publicada se cuenta con un guion antes de escribirlo (§10; §13, caso 1).
- **`npm run suelo` en verde antes de subir**, y **nunca dos guiones que
  levanten servidor a la vez**: cada uno para el del otro al arrancar (§11,
  §17).
- **Nada de `String.replace` con `$` en el texto de reemplazo, ni LaTeX ni
  comillas invertidas a través del shell** (§17): las dos cosas ya han
  destrozado ficheros de este repositorio.
- **Si te ves escribiendo un guion que recorre muchos ficheros aplicando el
  mismo cambio, para** (§01).

### Dónde está cada cosa que cambia

Este fichero lleva **reglas y sus porqués, no estado**. Una cifra en
presente escrita aquí caduca el día que crece el corpus —pasó más de diez
veces entre agosto y septiembre de 2026, y desde el 26 de septiembre lo
vigila `npm run cifras`—, así que las que aparecen van fechadas.

| qué | dónde |
|---|---|
| el estado de cada asignatura | `src/content/catalogo/<asignatura>.json`, campos `estado` y `motivo` |
| las cifras del corpus | no se escriben: `npm run deuda` |
| lo que queda por hacer | `tasks/pendiente.md` |
| el plan de la próxima sesión | `tasks/siguiente.md`, que se sobrescribe cada vez |
| lo que se decidió **no** hacer, y por qué | `docs/decisiones.md` |
| qué pasó cada día | `diario/` |
| por qué este fichero dice lo que dice | `docs/cronica.md` y el historial de git |

**Y en este repositorio manda este fichero.** Las costumbres generales —las
del asistente que trabaja aquí, las de otros proyectos— siguen valiendo donde
no chocan: la prueba antes que el código en los lectores de respuesta y en los
modelos de los simuladores (§10), la revisión antes de subir, el suelo en
verde. Donde chocan, se sigue la regla de aquí y el choque se dice en el
commit. Dos ya conocidos: aquí no se mide cobertura, se valida al revés cada
guardián (§11), porque un porcentaje de líneas no dice si un dato publicado es
verdad; y un `console.error` en un camino de error no es depuración olvidada
sino lo que escucha `humo.mjs`, que falla con cualquier error de consola
(§11).

---

## 00 // Qué es esto

Plataforma de estudio **gratuita** para alumnos de 1.º y 2.º de la Escuela de
Ingeniería de Gipuzkoa (UPV/EHU). Sitio estático en GitHub Pages: sin backend,
sin cuentas de usuario, sin base de datos. Solo en castellano.

**El plazo es septiembre de 2027**, y no es una línea de meta: es el arranque de
un curso. Quien entre entonces se topa con el tema 1 de todo, no con el 11 de
nada. El objetivo, por tanto, no es «terminarlo» sino **ir un cuatrimestre por
delante de quien lo usa**. Eso decide el orden más de lo que lo decide el
temario.

**Pocas excelentes antes que muchas a medias.** No se abre una asignatura
hasta que la anterior está terminada según §15 — con una excepción que ya se
ha usado dos veces y conviene tener escrita: **una asignatura que no se puede
cerrar por falta de material, y no de trabajo, no bloquea abrir la
siguiente.** Ciencia de Materiales está así desde el 12 de septiembre de 2026
—no hay exámenes de teoría y problemas entre el material—, y esperar a que
aparezcan habría parado el proyecto entero. La excepción se declara en el
`motivo` de su catálogo, no se aplica en silencio.

### El estado, a 26 de septiembre de 2026

Un corte con fecha, no un estado: el vivo lo dicen el catálogo y
`npm run deuda`. Los cortes anteriores están en `docs/cronica.md`.

| asignatura | curso | estado | lo que la define hoy |
|---|---|---|---|
| Cálculo | 1.º | `ok` | la referencia de tamaño: §15 la mide |
| Álgebra | 1.º | `ok` | un tema `soloEnClase` declarado |
| Fundamentos Químicos | 1.º | `ok` | sin colección en cuatro temas, porque el material no la trae |
| Expresión Gráfica | 1.º | `prev` | **la siguiente**, y antes que contenido necesita diseño: su examen es un dibujo |
| Mecánica de Fluidos | 2.º | `ok` | la de más temas; dos `soloEnClase` y trece ejercicios de examen `fuera` |
| Ingeniería Térmica | 2.º | `ok` | dos convocatorias imposibles, solo en euskera |
| Mecánica Aplicada | 2.º | `ok` | cinco convocatorias imposibles, solo en euskera |
| Ciencia de Materiales | 2.º | `obra` | escrita entera; sin exámenes de problemas no hay ruta ni cierre |
| Sistemas de Producción | 2.º | `obra` | solo el catálogo: **se deja para más adelante** |

El corpus, ese día: 83 temas publicados, 1.948 ejercicios y 8.487 pasos,
141 convocatorias con 124 PDF, 15 rutas con 328 escalones y 10 simuladores.

### El orden que queda

Decidido por quien mantiene el proyecto, en septiembre de 2026: **Expresión
Gráfica es la última asignatura de esta tanda y Sistemas de Producción se
deja para más adelante.** Ciencia de Materiales se cierra el día que aparezcan
sus exámenes, no antes. Lo que eso pide en detalle —el diseño del paso de
dibujo, el paquete que ya existe fuera del repositorio— está en
`tasks/pendiente.md`.

Y lo que no cambia de cómo se elige: la asignatura siguiente se elige por lo
que rompe del sistema, no por el orden del temario. Álgebra se abrió antes que
Fluidos porque una **matriz** no es un número y rompía la capa compartida por
otro sitio; Expresión Gráfica rompe la que queda, porque **un dibujo no se
puede corregir** en un sitio estático (§04, el paso `dibujar`).

### Qué hace distinto a este proyecto

El material que los profesores reparten da el enunciado y la respuesta final.
Nada entre medias. Un alumno que resuelve y le sale otra cosa **no tiene forma
de saber dónde se equivocó**. Ese hueco es el producto entero. Todo lo que se
construya aquí se justifica por él.

---

## 01 // Regla 0

> Si te ves escribiendo un script que recorre muchos ficheros aplicando el
> mismo cambio, **para y avisa**. Ese script es la prueba de que algo que
> debería estar en una capa compartida está duplicado.
>
> Arregla la capa compartida. No escribas el script.

El proyecto anterior (`upv-ehu-project`) acabó con 79 bloques `:root{}`
duplicados, cuatro paletas de color conviviendo, dos versiones de KaTeX,
366 MB de historial git y doce scripts de rediseño masivo en la raíz. No fueron
doce errores: fue el mismo error doce veces. Todas las reglas de abajo se
derivan de aquello.

---

## 02 // Pila técnica

**Astro + MDX + JavaScript plano.** Nada más.

La decisión de usar Astro no es por comodidad: **impide la duplicación por
construcción**. Con un único layout no hay dónde duplicar el `:root` aunque
quieras. Una regla escrita se puede saltar; una estructura donde el error es
imposible, no.

Con tres límites estrictos:

- **Nada de React, Vue ni Svelte.** Los componentes interactivos llevan
  `<script>` plano dentro del `.astro`. Los prototipos ya funcionan así.
- **Nada de librerías de gráficas** (Chart.js, Plotly, D3). Pesan, traen
  estética ajena y pelearse con ellas para que respeten los tokens cuesta más
  que escribir el SVG. SVG para esquemas y diagramas; Canvas solo cuando haya
  miles de elementos.
- **Cada dependencia nueva se justifica en el commit.** Esto lo mantiene una
  persona durante años.

Las dependencias, todas, y por qué está cada una:

| paquete | para qué | quién la exige |
|---|---|---|
| `astro` · `@astrojs/mdx` | el sitio y la prosa | §02 |
| `remark-math` · `rehype-katex` · `katex` | las fórmulas, dibujadas en el build | §07 |
| `@fontsource/karla` · `@fontsource/caveat` · `@fontsource/ibm-plex-mono` | las tres familias, autoalojadas | §06 |
| `vitest` | los tests | §11 |
| `playwright` (solo desarrollo) | `humo.mjs`, y ver lo que se dibuja | §11, §16 |
| `js-yaml` (solo desarrollo) | que el ejemplo de §04 compile de verdad | §11 |

Y nada más. Si `npm ls --depth=0` devuelve algo que no está en esta tabla, o
sobra el paquete o falta la fila: las dos cosas son un fallo.

> Esta lista decía «dependencias previstas y suficientes» y se quedó sin
> actualizar dos veces. Faltaban `katex` —que §07 nombra tres veces y llegó
> como dependencia directa al fijar la versión única— y `playwright`, del que
> depende la mitad del suelo de calidad. Una lista de dependencias que no es la
> lista de dependencias incumple §10 dentro del propio fichero de reglas.

### Lo que el sitio recuerda, y dónde

Sin cuentas y sin servidor: todo lo que el sitio sabe de quien estudia vive en
`localStorage`, en su navegador, y desaparece si borra los datos del sitio. La
página lo dice en voz alta donde se usa, y **ninguna funcionalidad depende de
que exista**: con el almacenamiento bloqueado el sitio se lee entero.

| clave | qué guarda | quién la escribe |
|---|---|---|
| `rti:hechos` | por ejercicio, `{ i: intentos, p: pista abierta, d: desarrollo abierto }`. Las entradas viejas son `true` a secas y se siguen leyendo | `EjercicioGuiado.astro` |
| `rti:dominio` | por escalón, la casilla «lo hago sin la app» que marcas tú | `[evaluacion].astro` |
| `rti:notas` | por cuadernillo, las notas que te pones al terminar un simulacro, con fecha y sobre cuántos ejercicios | `Examen.astro` |
| `simulacro:<ruta>` | el simulacro en marcha: cuándo empezó, cuánto dura y qué ejercicios dejaste fuera | `Examen.astro` |

Tres reglas para cualquier clave nueva:

1. **Se guarda el hecho, no el derivado.** El simulacro guarda cuándo empezó y
   cuánto dura, no los segundos que quedan: una cuenta atrás guardada como
   número se congela al cerrar la pestaña y entonces deja de medir lo que dice.
2. **Lo que escribe la app y lo que escribes tú van en claves distintas.**
   `rti:hechos` lo llena el ejercicio; `rti:dominio` y `rti:notas` los llenas
   tú. Mezclarlos haría imposible saber quién dijo qué.
3. **Toda lectura va en `try`/`catch` y toda escritura también.** El modo
   privado de algunos navegadores lanza al escribir, y una excepción ahí no
   puede llevarse por delante el resto del guion.

---

## 03 // Estructura

Esto es el repositorio tal como está, no como se planeó. Si al leerlo no
coincide con lo que ves, **manda lo que ves** y se corrige aquí.

```
src/
  content.config.ts        colecciones con esquema Zod. El fichero más
                           importante del repo: es donde un dato malo
                           rompe el build en vez de llegar a un alumno.
  content/
    catalogo/              una entrada .json por asignatura (las nueve)
    calculo/               una carpeta por asignatura con temas escritos
      t01-complejos/
        index.mdx          la prosa del tema
        ejercicios.yaml    los ejercicios como DATOS
      examenes/
        2024-2025-1ev/     examen.yaml (reparto) + ejercicios.yaml
    preparar/              una ruta de estudio por evaluación (§14).
                           Solo YAML: no enseña nada nuevo, ordena lo que
                           ya está y dice por qué en ese orden.
    laboratorio/           lo que la asignatura evalúa y esta app NO
                           examina: las sesiones con ordenador. Un YAML
                           por asignatura, y de momento solo Cálculo.
                           No transcribe el guion ni reparte ningún
                           fichero: lo nombra, lo resume y enlaza el
                           apartado donde está explicado (§08)
    banco/                 bancos de preguntas de test, para el simulador
                           de test (§05). Uno: el de mínimos de Materiales
  components/
    patrones/              Lectura · EjercicioGuiado · ErrorTipico
    sim/                   los simuladores (§05, §10). Su modelo vive en
                           lib/ para poder probarlo, nunca dentro del
                           .astro; el de test lee su banco de content/banco
    ui/                    Cabecera · Tema · Examen · Reparto
  layouts/
    Base.astro             el ÚNICO layout
  lib/
    markdown.mjs           el procesador de Markdown y fórmulas (§07)
    numero.ts · complejo.ts · regiones.ts · algebra.ts · unidades.ts ·
    quimica.ts             los lectores de respuesta. numero.ts es el que
                           comparten el navegador y el esquema (§17)
    plano.ts · moody.ts · bombeo.ts · compuertas.ts · canales.ts ·
    ariete.ts · viga.ts · catenaria.ts · mecanismo.ts
                           los modelos de los simuladores
    rutas.ts · peso.ts · formulario.ts
                           URLs, el peso de cada tema en la portada y qué
                           parte de un tema es formulario
  styles/
    tokens.css             el ÚNICO :root del repositorio
    base.css · print.css
  pages/                   index · [asignatura]/[tema] · examenes ·
                           preparar · formulario · laboratorio, y el
                           índice de ejercicios que busca la paleta
scripts/
  verify.mjs               lee el HTML publicado (§11)
  recalcula.mjs            que las cuentas del corpus salgan (§11)
  deuda.mjs                lo que queda, MEDIDO; con --estricto
                           (npm run cifras) falla si una cifra publicada
                           ha caducado (§11, §16)
  check-color.mjs          contraste, daltonismo y la capa de tinta
                           DECLARADOS en tokens.css
  contraste.mjs            el contraste REAL del texto ya publicado, nodo a
                           nodo y en los dos temas (§11)
  humo.mjs                 lo abre en Chromium (§11)
  humo-todo.mjs            la barrida completa, partida por asignatura y
                           en paralelo contra un solo servidor (§11)
  comprueba-simuladores.mjs  que un simulador se ENCUENTRE, que sus botones
                           den los números de su fuente y que sin
                           JavaScript no enseñe otros (§11)
  servidor.mjs             la vista previa que necesitan humo, humo-todo,
                           contraste, comprueba-simuladores y peso. Una
                           sola forma de levantarla, no cinco
  peso.mjs                 cuánto tarda una página en un móvil (§11)
  revisa-ejercicios.mjs    lo que pide §04, comprobado ANTES de pegar el
                           bloque en el corpus: en un segundo, sin construir
  inventario-coleccion.mjs qué problemas de la colección de Fluidos faltan,
                           cruzando el volcado del PDF contra el corpus
  mide.mjs                 la tabla de docs/como-vamos.md, medida
  leer-grafica.mjs · leer-curvas.mjs   comprobar una figura sin ojos
  diario.mjs               el diario en PDF
  figuras/                 el lienzo que calcula las figuras (§17), un
                           generador por tema, pegar.mjs, rehacer.mjs —que
                           las vuelve a pegar todas— y previsualiza.mjs,
                           que monta el contact sheet para mirarlas (§16)
tests/
  *.test.ts                los lectores de respuesta, con vitest
  fisica/                  casos con resultado conocido, uno por simulador,
                           sacados del corpus y nunca de un libro (§10). El
                           README dice contra qué compara cada uno; la
                           cuenta de casos la da npm run deuda
  verificacion/            cada respuesta de examen, recalculada por un
                           camino escrito aparte. Todas menos una, y la
                           que falta está dicha en npm run deuda
public/
  examenes/<asignatura>/   los enunciados originales en PDF. La ÚNICA
                           carpeta del repo donde entra un PDF ajeno (§08),
                           y la única donde un fichero se publica por estar,
                           no por estar enlazado: verify.mjs comprueba los
                           dos sentidos, disco→YAML y YAML→disco. Ojo a
                           Fluidos: quince convocatorias vienen en un
                           cuadernillo único, así que «un PDF» no es «una
                           convocatoria»
docs/                      como-vamos.md, cronica.md (la historia de este
                           fichero), decisiones.md y las auditorías
tasks/                     pendiente.md (lo vivo) y siguiente.md (la
                           próxima sesión); todo.md, manana.md y
                           mapa-examenes.md, congelados el 26-9-2026
referencia/ · diario/
CLAUDE.md
```

**De los cinco patrones de §05, solo tres son un componente**, y no es un
descuido: ve a §05, que explica dónde vive cada uno.

> El árbol de arriba prometía `FiguraFija`, `Verificador` y `Demostracion`
> como ficheros, y no existían. Dos de los tres no faltan —viven dentro de
> `EjercicioGuiado`—, pero el árbol no lo decía y §05 tampoco. Corregido el 24
> de agosto de 2026, al preparar este fichero para que lo ejecute alguien que
> no puede preguntar.

Toda página nace de un patrón de `components/patrones/`. **Nunca copiando otra
página existente**: así es como se propagan las variantes.

### Catálogo

1.º — Álgebra · Cálculo · Expresión Gráfica · Fundamentos Químicos de la
Ingeniería
2.º — Mecánica de Fluidos · Mecánica Aplicada · Ciencia de Materiales ·
Ingeniería Térmica · Sistemas de Producción y Fabricación

Las nueve existen desde el primer día con estado `ok`, `obra` o `prev`. El
catálogo es una colección de contenido con esquema validado en el build: si
falta un campo o un peso no suma, **el build falla**. Los datos no se comprueban
a ojo.

---

## 04 // Cómo se produce un tema

Esta es la sección que decide si el proyecto llega a veinte temas o se queda en
tres. **Un tema no se programa: se rellena.**

> **Cómo se añade un ejercicio sin perder media hora.** Se escribe el bloque en
> el scratchpad, se pasa `node scripts/revisa-ejercicios.mjs <fichero> --suelto`
> y **solo entonces** se pega al `ejercicios.yaml`. El guion comprueba lo mismo
> que el esquema —los tres pasos obligatorios, los mínimos de longitud, la
> pieza trampa única, los distractores dentro de la tolerancia— en un segundo y
> sin construir el sitio. Nace el 2 de septiembre de 2026 porque el primer
> bloque de los 145 de Fluidos se pegó sin validar, rompió el YAML por un `: `
> sin comillas (§17) y hubo que revertir el fichero entero.
>
> El esquema sigue mandando: si los dos discrepan, el guion está mal.

Un tema nuevo son dos ficheros:

Los dos ejemplos de abajo están **copiados del repositorio**, no escritos para
la ocasión. Si los copias, compilan. La autoridad sobre el formato es siempre
`content.config.ts`, que además lleva comentado el motivo de cada regla rara.

**`index.mdx`** — la prosa, con componentes incrustados donde hagan falta:

```mdx
---
asignatura: calculo
tema: 1
titulo: Números complejos
descripcion: Forma binómica y polar, De Moivre, raíces
peso: 8
patron: lectura
---

Un número complejo no tiene nada de imaginario...

<ErrorTipico titulo="El argumento con arctan a secas">
`arctan(1)` vale π/4 tanto si vienes del primer cuadrante como del tercero...
</ErrorTipico>
```

**`ejercicios.yaml`** — los ejercicios como datos, nunca como código. Un
ejercicio tiene cabecera y una lista de `pasos`, y **cada paso declara su
`tipo`**:

```yaml
ejercicios:
  - id: ej-punto-critico-clasificado
    titulo: Un punto crítico, y decidir qué es
    fuente: Ejemplo introductorio · Road to Ingeniería. No es de examen ni del boletín.
    nivel: ejemplo          # ejemplo | practica | examen
    enunciado: |
      Para $f(x) = x^{3} - 3x$, encontrar sus puntos críticos y clasificarlos.
    pide: Los puntos donde la derivada se anula y qué es cada uno.
    pasos:
      - tipo: reconocer     # COMP1 — antes de calcular nada
        pregunta: |
          Si $f'(c) = 0$, ¿qué se puede afirmar del punto $c$?
        opciones:
          - texto: Que es candidato a extremo, pero hay que decidirlo aparte
            correcta: true
            mensaje: |
              Eso es. Fermat dice «extremo implica derivada nula», y el
              recíproco es falso.
          - texto: Que hay un máximo o un mínimo
            mensaje: |
              No necesariamente. En $f(x) = x^{3}$ la derivada se anula en el
              origen y ahí no hay ni máximo ni mínimo.
          - texto: Que la función vale cero en $c$
            mensaje: |
              Eso sería $f(c) = 0$, otra cosa. Aquí lo que se anula es la
              **derivada**: la tangente es horizontal.

      - tipo: calcular      # COMP2
        titulo: El punto crítico positivo
        pregunta: |
          Resolviendo $f'(x) = 3x^{2} - 3 = 0$, ¿cuál es la solución positiva?
        respuesta:
          tipo: numero      # numero | complejo | conjunto
          valor: '1'
          tolerancia: 0.001
          formato: un número       # texto plano, sin LaTeX
        distractores:               # al menos uno, y son errores REALES
          - valor: '1.7320508'
            mensaje: |
              Has sacado la raíz de 3. Divide primero entre 3 los dos lados.
        pista: |
          $3x^{2} = 3$, así que $x^{2} = 1$.
        desarrollo: |
          $$ f'(x) = 3x^{2}-3 = 0 \;\Longrightarrow\; x = \pm 1 $$

      - tipo: justificar    # COMP4 — ordenar el argumento
        pregunta: Ordena la respuesta. Una pieza es falsa.
        piezas:
          - texto: $f''(x) = 6x$, y $f''(1) > 0$, luego en $x=1$ hay un mínimo.
          # ojo al `: ` de dentro — obliga a comillas o rompe el YAML (§17)
          - texto: 'Son extremos **relativos**: la función no está acotada.'
          - texto: Como la derivada se anula en dos puntos, los dos son mínimos.
            trampa: true            # exactamente una por paso
            mensaje: |
              Anularse no dice de qué tipo es. Lo decide el signo de $f''$.
    resolucion: |
      **Los candidatos.** Se buscan donde la derivada se anula...
      # …recortado aquí: el esquema exige 100 caracteres como mínimo.
```

**Tres reglas que el esquema impone y que no se ven leyendo el ejemplo.** Todo
ejercicio necesita, sí o sí:

- un paso **`reconocer`** — COMP1 antes de tocar números,
- un paso **`calcular`** o **`verificar`** — COMP2,
- un paso **`justificar`** — COMP4.

No es burocracia: es §09 metida en el esquema. Un ejercicio que solo comprueba
un número entrena la parte que menos se falla, y el build lo rechaza por eso.

Y los mínimos, que se olvidan: `fuente` ≥ 10 caracteres, `enunciado` ≥ 10,
`resolucion` ≥ 100, al menos 2 pasos, al menos 3 `opciones` en un `reconocer`
con `mensaje` ≥ 20 en cada una, al menos 1 distractor en un `calcular` y
exactamente 1 pieza `trampa` en un `justificar`.

Los **seis** tipos de paso, y qué competencia entrena cada uno:

| `tipo` | qué hace | competencia |
|---|---|---|
| `reconocer` | elegir el concepto antes de calcular | COMP1 |
| `calcular` | introducir el resultado y recibir el diagnóstico | COMP2 |
| `justificar` | ordenar las piezas, con una trampa | COMP4 |
| `verificar` | escribir una condición y compararla como región | COMP2·COMP4 |
| `redactar` | escribir en papel y contrastar con la rúbrica | COMP4 |
| `dibujar` | dibujar en papel y contrastar con la figura y la lista | COMP4 |

Los tres primeros van en todos los ejercicios —el esquema lo exige— y los
otros tres son minoría a propósito: a 26 de septiembre de 2026 eran 33, 37 y
179 pasos de 8.487.

> **`dibujar` nace el 14 de septiembre de 2026**, y el motivo es una cifra:
> de los 425 ejercicios de examen de Cálculo, **186 piden dibujar, representar
> o esbozar algo** —el recinto de una integral doble, la región del plano
> complejo, el sólido de revolución— y el sitio no pedía dibujar ni una vez.
> Treinta y nueve tenían un paso que *menciona* el recinto; ninguno lo hacía
> dibujar. Lo que se entrenaba en su lugar era el final: leer el enunciado,
> saltar a los límites y calcular. En el examen, el que no dibuja el recinto
> pone mal los límites, y eso no lo arregla calcular mejor.
>
> Es hermano de `redactar` y comparte su límite honesto: el sitio es estático
> (§02) y **no se puede corregir un dibujo**. No lo finge. Enseña la figura
> buena y la lista de lo que tiene que tener, y la comparación la haces tú.
> Su `figura` es opcional a propósito, para que el tipo se pudiera usar el
> primer día en vez de esperar a mover las 188 figuras de las resoluciones.
> El primer uso, y el molde para los demás, está en
> `calculo/t07-integral-multiple`, ejercicio `invertir-el-orden`: el que no se
> puede hacer de cabeza.

> **Los usos de cada tipo no se escriben aquí**: los da `npm run deuda`, en
> «el tamaño del corpus». Esta tabla llevaba una columna con ellos y caducó
> más de diez veces entre agosto y septiembre de 2026, cada vez que se tocaba
> el corpus; la historia entera está en `docs/cronica.md`. La lección que
> dejó es la de §16: **una cifra se cuenta con un guion, no se copia.**

`redactar` pasó de **una** a **cinco** el 5 de septiembre de 2026, con el
encargo 4 de la reauditoría. La razón de escribirlas es un dato, no una
intuición: en Cálculo **50 de los 425 ejercicios de examen piden demostrar**
—el 11,8 %— y en Álgebra, **24 de 32**, o sea el 75 %. Las cuatro nuevas son
las dos demostraciones más pedidas de cada asignatura: Barrow y Lagrange en
Cálculo, «esto es subespacio vectorial» y «núcleo trivial implica inyectiva»
en Álgebra.

Y ese día seguía sin ser un patrón maduro: cinco usos de 4.826 pasos. Se
pararon en cuatro **a propósito** (§13: el framework se destila del
contenido). Antes de escribir más había que mirar cómo se leían, no seguir
produciéndolas.

> **Mirado el 6 de septiembre de 2026, y con el resultado escrito, que es lo
> que faltaba para poder seguir.** Las cinco se leyeron enteras y se abrió una
> en el navegador. El patrón está bien resuelto y conviene no tocarlo: **no
> hay casilla donde teclear**, y eso es deliberado —lo que corrige el examen
> es un folio—; hay un botón que revela la rúbrica solo cuando dices que ya la
> has escrito, y detrás un mensaje que dice qué hacer con ella. Lo que hace
> que la rúbrica valga no es la lista de puntos sino el `porque` de cada uno:
> nombra el fallo concreto, no la manía. «Continua y derivable en $[a,b]$
> pierde el punto **y además es un teorema más débil**» enseña algo; «pon bien
> las hipótesis» no.
>
> Con eso, `redactar` pasa de cinco a **nueve**, y las cuatro nuevas son de
> **Fluidos**, que era la asignatura con la demanda medida más alta y con cero
> pasos de este tipo: **36 de sus 108 ejercicios de examen piden deducir,
> demostrar o razonar** —el 33 %, y no hay una sola de las dieciséis
> convocatorias que no lo pida—. Se han elegido las cuatro que más se repiten,
> contadas una a una: **obtener los adimensionales, en diez de las dieciséis**
> —dos de ellas nombrando el teorema de Vaschy-Buckingham, una «de uso
> obligatorio»—, **razonar la semejanza absoluta, en nueve**, **la curva
> característica de la instalación, en seis** y **la expresión del caudal de
> un aparato deprimógeno, en cuatro**, que además vale para los tres disfraces
> con que cae: venturímetro, vertedero y diafragma.
>
> La regla de arriba no se levanta, se cumple: se miró antes de escribir más,
> y las cuatro nuevas van donde el dato dice, no donde apetecía.
>
> **Y una quinta, la primera de Álgebra desde el pase de agosto**, por la
> misma razón medida: Álgebra pide demostrar en **24 de sus 32** ejercicios de
> examen, la proporción más alta de las cuatro asignaturas, y solo tenía dos
> rúbricas. Sus dos familias más pedidas ya estaban cubiertas, así que entra
> la siguiente: **las propiedades de la norma en un espacio euclídeo**, que
> abren el **ejercicio 3 de cuatro convocatorias** —Minkowsky, la identidad de
> polarización, Pitágoras— y las cuatro empiezan igual, desarrollando
> $\left\|\overline{x}+\overline{y}\right\|^{2}$ con el producto escalar.
> Cambia lo que se pide al final, no el camino.
>
> **Y la cifra de Álgebra cambia de 22 a 24, con su definición escrita**,
> porque el 22 no lo reproduce ninguna cuenta que se le pueda hacer hoy al
> corpus: buscando el verbo en el enunciado entero salen **29 de 32**, y
> mirando solo el primer apartado —que es donde vive la demostración— salen
> **24**. Se publica el 24 y se dice cómo se cuenta, que era lo que faltaba.
> **Un número sin su definición al lado no se puede volver a comprobar**, y
> entonces no se puede corregir: solo se puede sospechar de él.
>
> **Y los tres números de este párrafo estuvieron mal durante una hora**, por
> una trampa que §17 ya avisaba a medias y que ahora avisa entera: cargué el
> YAML —que es lo que §17 pedía— pero busqué la frase sobre el valor **tal
> cual**, y un bloque `>-` conserva los saltos de línea con los que se
> escribió. «Curva característica de la instalación» partida en dos líneas no
> casa con la frase escrita seguida. Salieron 5 donde había 6, y 4 donde había
> 10. Cargar el YAML no basta: hay que **normalizar los espacios** antes de
> buscar una frase.

Y dentro de `calcular`, seis tipos de respuesta según lo que se escriba en la
casilla:

| `respuesta.tipo` | qué lee | tolerancia | dónde vive el lector |
|---|---|---|---|
| `numero` | un real, con forma exacta (`pi/4`, `sqrt(3)/2`, `1.8e-5`) | absoluta | `leeComplejo` y, si falla, `evaluaNumero` |
| `complejo` | forma binómica | absoluta | `lib/complejo.ts` |
| `conjunto` | varias soluciones, sin orden | absoluta | `lib/complejo.ts` |
| `vector` | coordenadas **con** orden | absoluta | `lib/algebra.ts` |
| `matriz` | filas y columnas | absoluta | `lib/algebra.ts` |
| `magnitud` | número **con unidad**, comparado por dimensión | **relativa** | `lib/unidades.ts` |
| `formula` | una fórmula química o el nombre de un compuesto | **ninguna** | `lib/quimica.ts` |

> `formula` entra el 5 de septiembre de 2026, y su historia es el ejemplo
> limpio de §13 funcionando. Cuando lo pedía **un** ejercicio se dejó sin
> construir y se anotó; cuando apareció el **segundo** —la misma pregunta, en
> el otro control del primer cuatrimestre— se escribió, y no antes.
>
> Es el único tipo **sin tolerancia**: una fórmula se acierta o no. Lo que sí
> tiene es normalización —`Fe₂O₃` vale igual que `Fe2O3`, y un nombre se
> compara sin tildes ni conectores— y **sinónimos obligatorios**, porque la
> nomenclatura admite dos formas válidas y el propio examen imprime las dos:
> «Plomo(II) hidróxido / hidróxido plumboso». Dar una por mala sería corregir
> peor que el profesor.
>
> Sabe diagnosticar tres errores sin que haya que declararlos como distractor:
> **mayúsculas** —`CO` es monóxido y `Co` es cobalto—, **subíndices** —los
> elementos correctos en la proporción equivocada— y **columna equivocada**,
> que es contestar con el nombre donde se pedía la fórmula.
>
> Y una lección de método: los 32 tests pasaban y aun así, **al teclearlo en
> el navegador**, `k2so4` en minúsculas recibía «has contestado en la otra
> columna» y un compuesto erróneo recibía «ese número no sale de ninguna vía
> razonable». Los dos son §16 punto 1: probarlo a mano encontró lo que los
> tests no buscaban.

> Estos dos ejemplos eran inventados y **ninguno de los dos compilaba**. El de
> MDX declaraba `patron: figura-fija`, que no tiene componente, e incrustaba un
> `<Verificador>` que no existe. El de YAML no acertaba **un solo campo**: le
> faltaba el envoltorio `ejercicios:`, ponía `competencia` y `unidad` y
> `solucion` en el paso —tres campos que el esquema no tiene— y omitía `tipo`,
> que es lo primero que se lee. Un ejemplo de documentación que no compila es
> peor que no tener ejemplo: se copia, falla, y enseña que el fichero miente.
> Corregido el 24 de agosto de 2026 copiando del corpus. **Regla nueva: los
> ejemplos de este fichero se copian del repositorio, nunca se escriben aquí.**

**El componente `EjercicioGuiado` es genérico y se escribe una sola vez.** Lee
el YAML y monta la interacción. Si para añadir un ejercicio hay que tocar
JavaScript, algo está mal diseñado: vuelve atrás y generalízalo.

Solo se escribe código nuevo cuando el tema necesita **un simulador que no
existe**. Todo lo demás es prosa y datos.

### En qué orden van los ejercicios dentro de un `ejercicios.yaml`

**Primero los nuestros, y después los de la colección en el orden de la
colección.** No por nivel.

Lo pidió Ionan el 5 de septiembre de 2026 —«que estén distribuidos como están
en lo que te enseñé»— y al medirlo tenía toda la razón: los catorce temas de
Fluidos con problemas de la colección estaban **desordenados**. El tema 2
abría con el 1.13, seguía con el 1.2 y luego el 1.12. Iban agrupados por
nivel, y dentro de cada grupo en el orden en que se transcribieron, que no es
un orden: es el azar de quien fue tecleando.

El motivo de fondo, y por eso esto es una regla y no una manía: **la página de
un tema es la referencia, y la ruta es la que enseña.** Quien abre el tema
suele tener el PDF de la colección al lado y quiere encontrar el 6.14 donde
está el 6.14. Quien quiere una rampa de dificultad va a la ruta, donde §14 ya
manda que un escalón vaya de `ejemplo` a `practica` a `examen`. Ordenar el
tema por nivel duplicaba mal el trabajo de la ruta y estropeaba la referencia.

Los ejemplos introductorios nuestros van delante porque no tienen número que
respetar (§08) y porque son la entrada. Todo lo demás, por su número.

Al reordenar se cuenta (§16 punto 4): mismo conjunto de ids, mismo número de
líneas y cada bloque idéntico byte a byte antes y después — solo movido. Y se
releen los comentarios que hablan de posición: «el contrapunto de los tres
anteriores» dejó de ser cierto en el tema 16 y hubo que reescribirlo.

### Un tema está terminado cuando

- La prosa está escrita y responde a una pregunta concreta, no describe.
- Tiene al menos un ejercicio guiado con **distractores reales**, no inventados.
- Tiene modo guiado y modo completo, y el completo se imprime bien.
- Los errores típicos están marcados y salen de exámenes vistos, no de suponer.
- Si tiene simulador, tiene su test de física en `tests/`.
- `scripts/verify.mjs` pasa limpio.

---

## 05 // Los cinco patrones

Todo el contenido cae en uno de estos cinco. Si algo no encaja, es señal de que
hay que pensarlo mejor, no de que haga falta un sexto.

**Un patrón no es un fichero.** Es una forma de presentar contenido, y tres de
los cinco viven dentro de `EjercicioGuiado` como tipos de paso en vez de como
componente propio. Eso no es deuda: es §13 funcionando —el framework se destila
del contenido— y por eso la tabla va aquí antes que los patrones:

| patrón | dónde vive de verdad |
|---|---|
| **1 · Lectura** | `patrones/Lectura.astro`, en todos los temas |
| **2 · Figura fija** | **no construido** |
| **3 · Ejercicio guiado** | `patrones/EjercicioGuiado.astro`, en todos los ejercicios |
| **4 · Verificador** | paso `verificar` + `sim/PlanoComplejo.astro` |
| **5 · Demostración** | paso `justificar`, con su pieza trampa, en todos los ejercicios |
| (*simulador*) | `sim/`, cuando el tema lo pide |

A 26 de septiembre de 2026 eran 83 temas, 1.948 ejercicios guiados, 33 pasos
`verificar` y 10 simuladores; la cifra al día la da `npm run deuda`.

Solo **Figura fija** está sin construir, y sigue sin construirse a propósito:
ningún tema lo ha pedido todavía. El día que un contenido lo exija se hace; no
antes, porque un patrón diseñado en el vacío sale mal (§13). **Expresión
Gráfica es la primera candidata a pedirlo**: su examen es una vista, un corte,
una pieza que se lee de una sola figura que se transforma.

Y el `simulador` del esquema no es un sexto patrón: es la puerta que §04 deja
abierta para escribir código cuando un tema necesita algo que no existe. Hay
dos clases, y conviene no confundirlas:

- **Los de física**, uno por tema que lo pide, con su modelo en `lib/` y su
  caso en `tests/fisica/` (§10). Responden a una pregunta que la prosa sola no
  contesta: cuándo deja de importar el Reynolds, por qué el peor flector está
  en el apoyo.
- **El de test**, `sim/TestDeMinimos.astro`, que no simula física sino un
  **examen**: saca las preguntas de un banco (`src/content/banco/`) con el
  reparto por bloques del examen real, corre el reloj y corrige con la
  penalización de verdad. Nace el 24 de septiembre de 2026 para el test de
  mínimos de Materiales, donde lo que se entrena no es un contenido sino
  decidir bajo penalización. Un banco no es una colección de ejercicios: no
  hay pasos ni pista, y el esquema de `banco` exige cuatro opciones, una sola
  correcta y un `porque` en cada una —también en la buena—. **Las preguntas
  de un banco son propias y lo dicen en su `fuente`**: las del examen real se
  transcriben como ejercicio, no se mezclan con las inventadas.

**1 · Lectura.** Texto con una herramienta incrustada. Para contenido que se
sostiene solo y la figura apoya.

**2 · Figura fija.** El dibujo se ancla y el texto pasa por delante
transformándolo. Para contenido donde la figura *es* el contenido: plano
complejo, diagramas de fases, ciclos termodinámicos. **Nunca es una secuencia
de imágenes distintas**: es una sola que se transforma, y esa continuidad es lo
que hace que la idea se acumule en vez de reiniciarse en cada apartado.

**3 · Ejercicio guiado.** El alumno introduce su resultado y el sistema
diagnostica **el error concreto**. Nunca dice «incorrecto». Cada paso lleva
respuestas equivocadas reales asociadas a razonamientos equivocados reales.
Nunca se da la solución al fallar: a los dos intentos aparece la pista, al
tercero se abre el desarrollo.

**4 · Verificador.** La figura no explica: **comprueba** lo que el alumno
propone. Escribe su condición cruda y su versión simplificada, y si las dos
regiones coinciden su álgebra está bien. O elige un contraejemplo y la gráfica
valida si cumple las hipótesis. Es el patrón más diferencial del proyecto y
apareció solo, construyendo contenido real.

**5 · Demostración.** Ordenar las piezas del argumento, con **una pieza trampa**
que encarna el error típico y no debe entrar. Existe porque una demostración
escrita no se puede autocorregir, pero su estructura lógica sí.

### La portada

Es la pizarra de entrada (rediseño Pizarra, agosto 2026): héroe con el
titular subrayado en tiza y la figura tocable de la tangente, el temario en
dos columnas con **estados honestos del catálogo** —entera / la estamos
escribiendo / aún no—, y la repisa con el lema. La portada **no supone
itinerario**: son puertas, no un orden.

Al elegir una asignatura, **el nombre pulsado viaja hasta convertirse en el
título** de la vista de detalle (técnica FLIP: medir, invertir, animar), que
es banda de pizarra + cuerpo de papel (brief §5b). Paleta de comandos con
`/` o `⌘K` que busca asignaturas, temas, conceptos y rutas a la vez.

Principio: **fluido no es tener animaciones, es no perder nunca el sitio.** El
movimiento se ve una vez o bajo demanda; mientras se lee, nada se mueve.

> Hasta el 29 de agosto de 2026 esta sección describía el selector anterior
> —las nueve asignaturas como filas que crecen al posarse—. Se sustituyó por
> el mundo Pizarra elegido por Ionan; el brief vive en
> `referencia/rediseno-pizarra-brief.md`.

---

## 06 // Diseño

> Rediseño «Pizarra» (agosto 2026, brief aprobado por Ionan tras comparar
> cuatro mundos visuales). Identidad: pizarra verde con tiza. Lectura larga:
> papel cálido. La vara de medir la puso él: «lo futurista impresiona el
> primer día y cansa la vista a la semana» — calidez antes que espectáculo.

### Tipografía

Karla para interfaz y cuerpo (400/500/600/700/800; el display es la misma
familia en 800). Caveat **solo** para anotaciones manuscritas —rótulos de
tiza, apuntes al margen, estados— nunca cuerpo de texto ni párrafos.
IBM Plex Mono para datos, unidades y etiquetas. Las fórmulas no cambian:
KaTeX en el build con sus propias fuentes (§07). Autoalojadas vía
`@fontsource`.

> Hasta agosto de 2026 eran Fraunces + IBM Plex Sans. Se sustituyeron con el
> rediseño Pizarra; si un componente aún pide un peso que Karla no tiene
> importado, el peso se añade en `Base.astro`, no se aproxima con otro.

### La pizarra y el papel

- **Pizarra** (tokens `--piz-*`, `--tiza*`, `--repisa`): la portada entera,
  la barra superior de las páginas interiores, los recuadros de ErrorTipico,
  los diagnósticos del ejercicio guiado y las figuras enmarcadas como
  mini-pizarra. Es oscura por naturaleza: mismos valores en los dos temas.
- **Papel cálido**: todo donde se lee o se trabaja durante horas — prosa,
  ejercicios, exámenes, rutas. Motivo: fatiga visual e impresión (§11).
- **El movimiento se ve una vez** (entrada, `forwards`, nunca `infinite`) **o
  bajo demanda** (hover, arrastrar). Mientras se lee, nada se mueve.
  `prefers-reduced-motion` lo apaga todo.
- Nada de cuenta atrás al examen, nada de memoria de progreso en la portada,
  y la portada no supone itinerario: cada alumno entra a lo suyo.

### Color

Claro por defecto, oscuro como opción. El claro manda porque esto se lee
durante horas, las gráficas tienen que verse y el material se imprime.

**Tres colores de interfaz, con significado fijo:**

| token | significa |
|---|---|
| `--live` | se toca, se comprueba, es interactivo |
| `--flag` | esto te suspende: error típico, fallo físico |
| `--alt` | segundo objeto de una escena |

> Esta tabla llevaba los hexadecimales al lado, y los tres estaban caducados:
> decía `--live #0D6E6B` cuando vale `#1C6E51`, y `--flag #B93A2B` cuando vale
> `#BE4B38`. Es §01 con otra cara — el mismo dato en dos sitios, y el que no
> se ejecuta es el que miente. **El valor de un token se lee en
> `tokens.css`**, que es el único fichero que puede llevar un color literal;
> aquí se dice lo que significa, que es lo que el fichero no puede decir.

**Seis colores de datos**, `--d1`…`--d6` (azul, naranja, verde, magenta, oro,
pizarra), **solo** para series de gráficas.

- Los semánticos nunca son serie de datos. Los de datos nunca van en interfaz.
- Se usan en orden desde `--d1`.
- **Máximo seis series por gráfica.** Más significa que la gráfica está mal
  planteada: se parte, o se resalta una y el resto va en gris.
- El color nunca es el único distintivo: etiqueta directa o marcador de forma.
  Verificado contra deuteranopía, protanopía y escala de grises.

**Una serie es color de LÍNEA. Cuando rotula, es letra, y el listón sube.**
Los seis se diseñaron contra el listón de objeto gráfico —3:1, WCAG 1.4.11—,
pero el etiquetado directo pone el nombre de la curva en el color de la curva,
y una letra se mide a 4,5:1. Cinco de los seis lo pasan. `--d2` no —3,15:1
sobre el papel— y no hay ningún naranja que llegue a 4,5 sin juntarse con
`--d3` o `--d5` bajo dicromacia: se recorrió el espacio de tonos entero. Por
eso existe **`--d2-tinta`**, que es ese naranja oscurecido y **solo** vale para
letra. La línea sigue siendo `--d2`.

**`--marco`** es el otro token que nació de lo mismo: la anotación en tono
«marco» y el título de la caja de lo que falta estaban pintados con
`--barra-justificar`, que es el relleno de una franja de la barra de reparto y
da 3,50:1. Los tres `--barra-*` no tocan texto; `--marco` es su oro llevado
a 4,5.

> **La capa de tinta la mide `check-color.mjs`** desde el 15 de septiembre de
> 2026, en tres escenas —claro, oscuro y pizarra— y contra el fondo real de
> cada una. La lista de tintas no está escrita a mano: se lee de `src/` —los
> `color:`, los `fill:` y los `fill="var(--x)"` de los `<text>`— y una tinta
> nueva sin medir rompe el guion.

**Fondo sobre el que cae cada tinta.** No está en la hoja de estilos, está en
el árbol del documento: por eso la tabla de `check-color.mjs` lo declara fila a
fila, con su umbral y su razón. Si añades un color de texto, añade su fila.

**Color de asignatura:** cada una tiene su acento, y vive **solo en el marco** —
número, regla, migas, indicadores. En cuanto empieza el contenido vuelve la
semántica estricta de arriba.

### Reglas de CSS

- Todo el color y la tipografía en `src/styles/tokens.css`. **Un único
  `:root{}` en todo el repositorio**, y `verify.mjs` lo comprueba.
- Prohibido `<style>` con tokens dentro de páginas de contenido.
- Prohibido un color literal (`#0D6E6B`, `rgb(...)`) fuera de `tokens.css`.
  Siempre `var(--nombre)`.

---

## 07 // Matemáticas

- Se escriben en LaTeX, en el MDX del tema y en su `ejercicios.yaml`. Los dos
  pasan por el **mismo** procesador, declarado una sola vez en
  `src/lib/markdown.mjs`.
- `remark-math` + `rehype-katex` con salida **`htmlAndMathml`**, generada en el
  build: KaTeX dibuja la fórmula con sus propias fuentes y deja detrás el
  MathML, oculto, para los lectores de pantalla.
- **Prohibido KaTeX o MathJax en tiempo de ejecución.** Aquí KaTeX corre en el
  build; al navegador no llega ni una línea de JavaScript de matemáticas.
- **Una sola versión de KaTeX.** Suena a detalle y no lo es (§01): había dos
  —la de la raíz y la anidada bajo `rehype-katex`—, las clases habían cambiado
  de nombre entre ellas, y el CSS no casaba con el HTML que se generaba. Si
  `npm ls katex` devuelve más de una, eso es el fallo.
- **Cero CDN** en todo el sitio. Criterio de aceptación: desconecta la red,
  recarga, y todo se ve igual — tipografías incluidas.

> Hasta el 20 de agosto de 2026 la salida era **MathML puro**, por ser nativo y
> no necesitar CSS. Se cambió porque MathML delega el dibujo en la fuente
> matemática de cada máquina, y eso rompía fórmulas sin avisar: con las fuentes
> del sistema desaparecía la barra del conjugado —`z̄` se leía como `z`, justo
> lo contrario— y con STIX Two Math autoalojada desde `@fontsource`, que viene
> subdividida, desaparecían los radicales. Una fórmula que se dibuja distinta en
> cada ordenador no es un asunto de estética. El precio son 118 ficheros de
> fuente de KaTeX en el sitio; el navegador solo descarga los que usa.

### El otro precio, y cómo se paga (16 de septiembre de 2026)

`htmlAndMathml` cuesta **54 nodos por fórmula** — el dibujo para el ojo y el
MathML para el lector de pantalla, los dos por fórmula—. En una página de tema
con cincuenta ejercicios eso son **272.000 de los 285.000 nodos**, el 96 %. Y
la página tardaba cinco segundos en un teléfono no por maquetar sino por
**construir el DOM**: cuatro de esos cinco segundos.

El dato que da la solución: **de las 5.081 fórmulas de esa página, al cargar
solo se ven 17**. Las otras 5.064 están dentro de resoluciones y desarrollos
cerrados. Así que **lo que empieza cerrado viaja dentro de un `<template>`** y
se materializa al abrirlo. El contenido de un `<template>` se analiza en un
fragmento inerte: se lee, pero no entra en el árbol ni en el cálculo de
estilos.

|  | antes | ahora |
|---|---|---|
| `/calculo/t05-integracion/` | 284.977 nodos · 5,4 s | **102.451 · 2,7 s** |
| `/calculo/t01-complejos/` | 198.712 · 4,1 s | **84.035 · 2,5 s** |

**Las tres reglas que esto impone**, y que hay que respetar al tocar
`EjercicioGuiado.astro`:

1. **Solo va a `<template>` lo que ya era inalcanzable sin JavaScript.** La
   resolución y los desarrollos lo eran —los esconde `hidden` y los abre un
   botón—, así que no se pierde nada. El enunciado y los pasos **no se tocan**:
   sin JavaScript se siguen leyendo enteros.
2. **Todo camino que enseñe algo llama antes a `materializa()`**, y son cuatro:
   acertar un paso, terminar el ejercicio, el modo completo e imprimir. Es
   idempotente porque ninguno puede dar por hecho que es el primero.
3. **`beforeprint` es el camino oficial para materializarlo todo**, y por eso
   `humo.mjs` lo dispara antes de medir figuras en vez de usar una función de
   prueba: el guardián recorre el mismo camino que el papel, y si alguien lo
   rompe se entera ahí en vez de descubrirlo imprimiendo la noche de antes.
   Comprobado el día del cambio: el guardián mide **exactamente las mismas
   etiquetas** que antes, página por página.

> Se probaron tres caminos y se midieron los tres. Paginar los ejercicios rompía
> los anclajes `#ej-…` que usan las siete rutas. `content-visibility: auto`
> —que se queda, y ayuda— solo compraba medio segundo, porque se salta el
> maquetado y no la construcción del DOM. Y borrar el contenido del todo era
> **peor** que el `<template>`: 3.085 ms contra 2.092, porque el fragmento
> inerte se salta también el cálculo de estilos.

---

## 08 // Contenido, derechos y estilo

### Derechos

La universidad ha dado permiso para usar el material docente. Aun así:

- **No entra material de terceros en el repositorio.** Ni diapositivas, ni
  colecciones escaneadas, ni figuras sacadas de manuales.
- **Sí entran los enunciados de examen originales**, en `public/examenes/`,
  para poder enlazarlos desde su resolución. Son documentos de la propia
  escuela y están cubiertos por el permiso; ver la nota de abajo.
- Hay un límite que la universidad no puede levantar: las figuras que los
  profesores tienen escaneadas de manuales (Moody, tablas de propiedades,
  esquemas de Çengel, White o Askeland) siguen siendo de las editoriales.
  **Esas se redibujan**, nunca se recortan del PDF.
- Los enunciados de examen se reproducen **tal cual**, sin cambiar los números.
  El alumno estudia con el ejercicio que va a caer, no con una versión parecida;
  y cuando compara con la solución oficial del boletín, los números tienen que
  coincidir o la herramienta pierde toda la credibilidad.
- Se cita siempre la procedencia exacta: «Ejercicio 1.1 · Problemas
  complementarios, tema 1 · Cálculo, UPV/EHU (examen 2014/2015)».
- Lo que sí es nuestro es **la resolución**: el desarrollo, los errores típicos
  y el diagnóstico. Ahí está el valor, no en el enunciado.
- Y desde el 23 de agosto de 2026, también son nuestros los **ejemplos
  introductorios**: ejercicios cortos que escribimos para que alguien pueda
  entrar de cero. Llevan `nivel: ejemplo` y su `fuente` lo dice con todas las
  letras — «Ejemplo introductorio · Road to Ingeniería. No es de examen ni del
  boletín» —, así que nunca se pueden confundir con lo que va a caer.

> Esa última regla es nueva y contradice en parte lo de arriba, así que se
> justifica. Se midió la dificultad del corpus y **no había por dónde entrar**:
> en el bloque de lugares geométricos iba de 1,5 a 4,5 sobre 5 con la moda en
> 3,5, el único abordable sin saber el tema estaba enterrado el décimo de
> diecisiete, y las cuatro traducciones básicas que la propia prosa enumera no
> tenían ni un ejercicio propio. Un sitio hecho para el que está atascado que
> solo ofrece ejercicios de examen no sirve al que todavía no ha empezado.
>
> Lo que **no** cambia: un enunciado de examen se reproduce tal cual y no se
> inventa. Un ejemplo introductorio no es un enunciado de examen, y por eso
> tiene que ir marcado en el dato, no solo en la intención.

> Esta regla decía lo contrario hasta el 19 de agosto de 2026: reescribir los
> enunciados y cambiar los números, para que no se pudiera buscar la solución
> hecha. Se cambió a propósito. El precio asumido es que los ejercicios son
> localizables; a cambio, lo que se estudia aquí es exactamente lo que se
> examina.

> Y hasta el 20 de agosto de 2026 la primera regla prohibía expresamente los
> «exámenes en PDF». Se cambió al construir el apartado de exámenes, porque la
> prohibición mezclaba dos cosas distintas. Una figura escaneada de Çengel es
> de su editorial y no hay permiso que la libere; un examen de la Escuela de
> Ingeniería de Gipuzkoa es de la propia escuela, y para eso está el permiso.
> El motivo de conservar el original es de fondo: una resolución que no se
> puede contrastar con el enunciado que la generó pide un acto de fe, y el
> proyecto entero existe para lo contrario. Lo que **no** cambia es que las
> figuras de terceros no entran: si un enunciado trae una, se redibuja en SVG.

> Consecuencia práctica: `public/examenes/` es la **única** carpeta del
> repositorio donde entra un PDF ajeno, y solo si es un enunciado oficial
> citado por una resolución nuestra. Cualquier otro binario sigue vetado (§12).

### Estilo de la prosa

- Se tutea. Se escribe para alguien que está atascado, no para un tribunal.
- **Primero la idea, después el formalismo.** «Multiplicar es girar y escalar»
  antes que la fórmula de De Moivre.
- Se nombra el error en voz alta. Los errores típicos no son un aviso al pie:
  son contenido principal.
- Nada de «simplemente», «obviamente» ni «basta con». Si fuera obvio, el alumno
  no estaría ahí.
- Frases cortas. Sin relleno.

---

## 09 // Las tres competencias

Los exámenes de Cálculo puntúan por competencias, y eso cambia el diseño de
todo componente de ejercicios:

| | qué evalúa | peso típico |
|---|---|---|
| **COMP 1** | reconocer los conceptos a aplicar | 1–2 puntos |
| **COMP 2** | el cálculo | 6–7 puntos |
| **COMP 4** | explicación formal: enunciados, definiciones, gráficos, hipótesis | 2–9 puntos |

**Cuatro de cada diez puntos no son calcular.** Hay ejercicios enteros —como el
de sucesiones del parcial del 20 de octubre de 2025, o los tres «enunciar y
demostrar Barrow» de 2019, 2020 y 2021— donde COMP 2 vale cero y los diez
puntos son demostración.

> Esta sección decía «entre el 30 y el 40 %» hasta el 21 de agosto de 2026 y
> **49,5 %** hasta el 28. Las dos veces por lo mismo: se midió sobre el corpus
> que había en ese momento y no se volvió a mirar. Sobre las **88
> convocatorias completas**, que son 4.255 puntos con su tema y su reparto:
>
> | | puntos | del total |
> |---|---|---|
> | COMP 1 | 384,5 | **9,0 %** |
> | COMP 2 | 2.438 | **57,3 %** |
> | COMP 4 | 1.432,5 | **33,7 %** |
>
> Es decir **42,7 %**, no 49,5. La tesis no cambia —la parte que no es cálculo
> sigue siendo enorme y sigue siendo la que peor se prepara— pero el número
> concreto se movió casi siete puntos al pasar de 33 exámenes a 88, y estuvo
> publicado mal durante una semana.
>
> **La regla que sale de haberlo tenido mal dos veces:** este número no se
> recalcula «cuando entren exámenes nuevos», porque eso deja la decisión al
> criterio de alguien que está haciendo otra cosa. Se recalcula **al cerrar una
> asignatura de las que publican reparto por competencia**, y la tabla de
> arriba lleva su fecha: es un corte, no un estado.

Todo ejercicio guiado entrena las tres: una pregunta de reconocimiento antes
del cálculo, y una comprobación de justificación formal después. **Un componente
que solo verifica un número entrena la parte que menos se falla.**

### La calculadora, y en qué asignatura se puede

**En Cálculo no se puede usar calculadora.** Lo dijo el alumno el 23 de agosto
de 2026, y cambia cómo se escribe un paso de cálculo. La consecuencia no es cosmética: **la respuesta de un ejercicio no
puede exigir un decimal que solo sale con una máquina**. Si un área vale
$(e^{2}-1)/2$, pedir «cuatro decimales» es pedir algo que en el aula no se
puede hacer.

Se midió al descubrirlo: de las 380 respuestas numéricas del corpus, **128
tenían tres decimales o más** y 87 sitios lo pedían con todas las letras.

Las dos reglas que quedan:

- **La forma exacta siempre vale.** El lector de respuestas evalúa expresiones
  —`pi/4`, `(e^2-1)/2`, `sqrt(3)/2`, `2+3i`— además de decimales, y el valor
  guardado puede seguir siendo el decimal: se comparan números, no cadenas.
- **Un enunciado nunca ordena dar decimales.** Se escribe «en forma exacta, o
  con cuatro decimales», en ese orden, porque ese es el orden en que el alumno
  los va a tener.

Y en la prosa, cuidado con dar por hecha la calculadora. El error del argumento
con `arctan` no es un despiste de máquina: es que $\arctan(1) = \pi/4$ tanto si
vienes del primer cuadrante como del tercero, y esa información no la pone
nadie por ti.

**Y no vale para todas las asignaturas.** El título de este apartado decía «en
el examen no se puede usar calculadora», a secas, desde que se escribió, y era
una regla de Cálculo publicada como si fuera del sitio entero. En **Ingeniería
Térmica la calculadora sí está permitida**, y además se entrega un anexo de
tablas y diagramas: los propios enunciados dan rugosidades, propiedades del
aire a la temperatura de película y entalpías de vapor con cuatro cifras, y
sin máquina no hay ejercicio. En Mecánica de Fluidos pasa lo mismo de hecho,
porque medio examen es leer un ábaco e iterar Colebrook.

Así que la regla se lee al revés de como estaba escrita: **la forma exacta
siempre vale, en todas partes; ordenar decimales solo se prohíbe donde el aula
no tiene con qué calcularlos.** Lo que no cambia en ninguna asignatura es lo
de arriba: un enunciado no ordena decimales a secas, y la prosa no da por
hecho que haya una máquina delante.

Queda pendiente confirmarlo asignatura por asignatura con el alumno. Lo
seguro, con fuente, es Cálculo (no), Ingeniería Térmica (sí, con anexo de
tablas) y **Mecánica de Fluidos (sí)**, esta última desde el 10 de septiembre
de 2026: su guía la pide en el apartado 9.1 entre los conocimientos previos
necesarios —«habilidad y agilidad en el uso de la calculadora»—, así que deja
de ser una inferencia del tipo de ejercicios y pasa a tener fuente. Lo que
sigue sin respuesta escrita en las tres es si se admite **programable**.

> Y de paso, la regla general que ninguna de las tres decía: la nota de la
> UPV/EHU sobre evaluación de pruebas académicas invierte el supuesto. «Salvo
> indicación expresa, se consideran prohibidos libros, notas o apuntes, así
> como dispositivos telefónicos, electrónicos, informáticos o de cualquier
> otro tipo.» El anexo de tablas de Térmica y el de cuadros y ábacos de
> Fluidos no son una concesión: son **la indicación expresa**, y por eso van
> impresos con el examen.

---

## 10 // Física y datos

Una simulación equivocada enseñando a cien alumnos es peor que no tener
simulación.

- Todo simulador lleva en `tests/fisica/` al menos un caso con resultado
  conocido, verificado contra el ejercicio original o contra bibliografía.
  Y **el caso va antes que el componente**, no después: se escribió así los
  cinco de fluidos y las cinco veces el test cambió algo de la prosa.
- **Su física vive en `lib/`, no dentro del `.astro`.** No es estilo: el
  código de un `<script>` de Astro no se puede importar desde vitest, así que
  un simulador con la física dentro **no se puede probar**, y la regla de
  arriba se vuelve decorativa.
- Las constantes van con nombre y unidades explícitas.
- Si un resultado no cuadra con el original, se para y se revisa. **Nunca se
  ajusta una constante para que salga el número esperado.**
- **Un simulador que solo ilustra no vale la pena.** El listón, medido sobre
  los cinco de fluidos, es que el test descubra algo que la prosa no dice o
  dice mal: las fronteras del ábaco no son «exactamente 0,3 y 6» sino un rango
  de 0,17 a 0,61; aplicar semejanza al punto de funcionamiento se equivoca un
  52 %, no «algo»; la excentricidad del centro de presión sigue una ley exacta,
  `e/L = L/(k·Y_G)`, que el tema no tenía; el óptimo de una sección de canal es
  plano, así que un condicionante moderado sale casi gratis; y en la frontera
  de Allievi-Michaud no hay salto, porque las dos coinciden ahí. **Los cinco
  cambiaron la prosa**, y esa es la prueba de que servían.
- Los datos que se publican como ciertos tienen que serlo. Si el peso de un
  tema en el examen es estimado, se muestran tres niveles —alto, medio, bajo—
  y no un porcentaje falsamente preciso.
- **El peso de un tema se mide con su ruta**: alto si su bloque cae en más de
  la mitad de las convocatorias medidas, medio si cae en alguna, bajo si casi
  nunca. Se contrasta con las etiquetas de tema de los `examen.yaml`, que ven
  otra cosa —el tema principal de cada ejercicio, no el que va dentro— y por
  eso no bastan solas: el primer principio de Térmica casi nunca es el tema
  principal y entra en dieciséis de diecisiete. Un tema que cae dentro de
  otros lo dice su `etiqueta` («transversal: …») y conserva su peso. En
  Cálculo lo cuenta el código (`lib/peso.ts`), porque sus 88 convocatorias
  dan para contar ejercicios; en las demás el peso se declara en el catálogo
  y **su `fuenteTemario` dice de dónde sale**. Con tres convocatorias por
  cuatrimestre, como Química, la medida no distingue —todo cae en dos o en
  tres—, y ahí manda el criterio declarado.

  > El 26 de septiembre de 2026 había ocho pesos publicados en la portada que
  > las dos medidas desmentían a la vez —el análisis exergético de Térmica en
  > «medio» cayendo en quince de diecisiete; el bloque 2 de Mecánica entero en
  > «medio» con su ruta ya medida, cuando su catálogo prometía cambiarlo al
  > medirla—. Se corrigieron esos ocho y solo esos: donde las dos medidas no
  > coinciden, el caso está en `tasks/pendiente.md` para mirarlo tema a tema.

---

## 11 // Suelo de calidad

`npm run suelo` es una sola línea, la misma en local y en el despliegue —el
flujo de GitHub Actions la llama tal cual—, y son nueve pasos en este orden.
Si uno falla, no se publica.

| paso | qué comprueba | dónde |
|---|---|---|
| `build` | que el sitio se construye y que cada dato pasa su esquema | `content.config.ts` |
| `verify` | el HTML publicado y el origen: tokens, enlaces, fórmulas, accesibilidad, los documentos | `scripts/verify.mjs` |
| `recalcula` | que las cuentas que el corpus escribe salgan | `scripts/recalcula.mjs` |
| `cifras` | que ninguna cifra publicada haya caducado | `scripts/deuda.mjs --estricto` |
| `color` | el contraste **declarado** en `tokens.css`, y el daltonismo | `scripts/check-color.mjs` |
| `contraste` | el contraste **real** del texto publicado, en los dos temas | `scripts/contraste.mjs` |
| `test` | lectores de respuesta, física de los simuladores y respuestas de examen recalculadas | `tests/`, con vitest |
| `humo` | el sitio en Chromium: lo que leer el HTML no puede demostrar | `scripts/humo.mjs` |
| `sim` | que cada simulador se encuentre y diga lo que dice su fuente | `scripts/comprueba-simuladores.mjs` |

Los tres que abren un navegador —`contraste`, `humo` y `sim`— levantan su
propia vista previa con `scripts/servidor.mjs`, y por eso **dos no pueden
correr a la vez**: cada uno para el servidor del otro al arrancar. En el suelo
van encadenados y no chocan; lanzar uno a mano mientras corre el suelo, sí
(§17). El suelo entero tardó 26 minutos el 26 de septiembre de 2026, veinte
de ellos en el humo: se lanza en segundo plano, con la salida a un fichero
completo, y no se toca `dist/` mientras corre.

> Esta sección decía «son dos guardianes» desde agosto, cuando ya eran seis
> pasos. `recalcula`, `cifras` y `sim` entraron el 26 de septiembre de 2026:
> los tres existían, los tres habían nacido de un fallo real, y los tres se
> quedaban fuera del suelo con argumentos —«tarda», «necesita servidor», «es
> un informe»— que al medirlos ese día no se sostenían: un segundo, un minuto
> y 0,7 segundos.

### `scripts/verify.mjs` — lee el HTML publicado

Comprueba:

- Un solo `:root{}` en todo el repositorio.
- Cero colores literales fuera de `tokens.css`.
- Cero referencias a dominios externos.
- `lang` en `<html>`, `alt` en toda imagen, exactamente un `<h1>` por página.
- Foco visible en todo elemento interactivo.
- `prefers-reduced-motion` respetado en toda animación.
- `description`, `og:title` y `canonical` en toda página.
- Cero enlaces internos rotos.
- **Cero números rotos en el texto publicado** — ni `NaN`, ni `undefined`, ni
  `Infinity`, ni `[object Object]`. Añadida el 4 de septiembre de 2026 después
  de encontrar **`El NaN % de la nota` en negrita** en el panel principal de
  tres de las diez rutas, con las dos asignaturas declaradas terminadas y el
  suelo en verde. La causa era una división entre cero: Álgebra y Fluidos no
  publican reparto por competencia y la página lo calculaba igual.
- Responsive real hasta 360 px. **Ojo con lo que esta regla NO mira**: busca
  anchos fijos en el CSS, y el 4 de septiembre de 2026 el sitio se desplazaba
  en horizontal en toda página de tema a 360 px **sin un solo ancho fijo** —lo
  producía una fila flex que no envolvía—. Un desborde de verdad se mide
  abriendo la página, no leyendo el CSS.
- Toda página de contenido con **modo guiado y modo completo**. Nadie repasa la
  noche antes de un examen haciendo scroll por una narración; el modo completo
  se imprime bien y sirve para explicárselo a alguien.

### `scripts/humo.mjs` — abre el sitio en un navegador

Leer el HTML demuestra que algo **está**, no que **funcione**. El 19 de agosto
de 2026 se colaron tres fallos invisibles a `verify.mjs`: una raíz cuadrada con
MathML correcto que el navegador no dibujaba —el enunciado decía −3/2 donde
debía decir −√3/2—, unas pestañas que no enganchaban sus manejadores porque dos
componentes usaban el mismo `data-tema`, y un `data-ir` compartido que habría
ocultado los dos paneles.

Comprueba, en Chromium y sobre cada página de tema:

- Las raíces **dibujan su radical**, no solo su contenido.
- Cambiar de pestaña abre el panel **y marca cuál está activa**.
- Los controles de la lectura no tocan las pestañas.
- Una respuesta equivocada recibe **un diagnóstico**, no un «incorrecto».
- Cero errores de JavaScript en consola.

### `HUMO_TODO=1 npm run humo` — la barrida completa

En cada commit, `humo.mjs` abre las páginas que enlaza la portada más **una
muestra rotatoria de ocho exámenes**, elegida por el día del año e impresa para
que un fallo se pueda reproducir. En unas semanas pasan todas.

Con `HUMO_TODO=1` las abre **todas** —249 el 26 de septiembre de 2026—, y eso
es lo que se pasa al cerrar una asignatura. La barrida imprime al empezar
cuántas páginas abre de cada asignatura, y **esa línea se lee, no se ignora**:
un cero delata una asignatura que nadie ha abierto (§17). Esta frase llevaba
el recuento escrito a mano, y caducó cuatro veces —123, 227, 248…— hasta que
se dejó de escribir. La primera vez que se hizo, el 29 de agosto de 2026,
encontró cuatro figuras marcadas… y las cuatro eran correctas: el guardián de
`viewBox` daba falsos positivos con los círculos guía. Se estrechó la regla y
se dejó dicho por qué. Ese es el uso: **la barrida no busca aprobar, busca
enterarse.**

> Y de paso arregló tres fallos del propio guardián, que llevaba dando
> «Execution context was destroyed» en una página distinta cada vez: abría las
> 123 en la misma pestaña, clicaba las pestañas de modo dentro del mismo
> `evaluate` que dispara `history.replaceState`, y medía sin esperar al trabajo
> diferido. Un guardián que falla al azar se acaba ignorando.

### `npm run humo:todo` — la misma barrida, partida y en paralelo

La barrida completa en un solo navegador pasaba de **una hora**, y una hora es
el tiempo a partir del cual un guardián se deja de ejecutar: se pospone «para
luego», y luego es nunca. `scripts/humo-todo.mjs` levanta **un** servidor de
vista previa y reparte las asignaturas entre varios procesos de `humo.mjs`,
cada uno con su navegador y su `HUMO_ASIGNATURA`.

- **Cuatro a la vez**, no siete. Cada proceso abre un Chromium con el montón de
  JavaScript a 4 GB, y todos a la vez compiten por la memoria en vez de por el
  reloj — que es el fallo que `--disable-dev-shm-usage` está ahí para evitar.
  Se cambia con `HUMO_A_LA_VEZ`.
- **El guardián de cobertura cambia de sitio.** `humo.mjs` comprueba que
  ninguna asignatura con páginas construidas se queda sin abrir; mirando una
  sola, esa comprobación falla por definición. Así que con `HUMO_ASIGNATURA`
  se desactiva ahí y la hace el repartidor, que sí ve la lista entera. Sin eso
  la barrida partida fallaba siempre y en las siete.
- **Se enseña solo el registro de quien falla.** Siete registros entrelazados
  no los lee nadie.
- **Dos guardianes globales cambian de sitio, y no es un detalle.** Además del
  de cobertura, el que exige que en el sitio haya raíces **y** barras que medir
  —el conjugado— es falso mirando una sola: en Química hay veinte raíces y cero
  barras, y en Térmica cuatro y cero. Mirando una asignatura se exige haber
  medido *algo*; la suma la hace el repartidor leyendo esa misma línea de cada
  tanda. La regla general: **un guardián que mide el sitio entero no se puede
  partir sin decidir dónde vive su versión global**, y los dos primeros
  intentos de esta barrida salieron en rojo por saltársela.

Medido el 17 de septiembre de 2026 en esta máquina: **14,9 minutos** de
principio a fin, de los cuales 14,9 son Cálculo —sus 108 páginas mandan sobre
el total—. Las otras seis van de 2,2 a 6,6 y caben de sobra en ese hueco. Si
algún día Cálculo pasa de treinta, lo que toca no es subir `HUMO_A_LA_VEZ`
sino partirlo también a él.

### `npm run sim` — que un simulador se encuentre y diga la verdad

En el suelo desde el 26 de septiembre de 2026. Hasta entonces necesitaba un
servidor levantado a mano y se pasaba «al tocar un simulador», que en la
práctica era casi nunca: ese día la auditoría encontró leyendo el código tres
fallos de simulador —una recursión que congelaba los diagramas de la viga, un
preajuste de la catenaria que se recortaba contra el tope del mando, y veinte
cifras sin JavaScript que el modelo ya no daba— y ninguno estaba en su lista.

Existe por un fallo concreto y caro. El 2 de septiembre de 2026 se publicaron
cinco simuladores correctos y **completamente invisibles** —viven en un
apartado que no es el primero, y el modo guiado tapa los demás— con el suelo
en verde y las capturas de cada uno bien. `tests/fisica/` prueba la física;
`humo.mjs` prueba que la página no reviente. **Nadie probaba el cable entre las
dos cosas.**

Comprueba tres cosas, y las tres habían fallado:

- que el simulador **se encuentre** aterrizando en la URL a pelo, sin ancla y
  sin `localStorage` — que la cabecera lo anuncie, que el índice marque su
  apartado y que el aviso **lleve**;
- que cada botón de preajuste —y cada mando movido con `mueve`— deje en la
  tabla **los valores que declara su campo `fuente`**. No se recalculan aquí
  nunca: se copian de donde el `fuente` diga (§10);
- que **sin JavaScript no enseñe otros números**. Cada simulador trae escritos
  en el HTML los valores de su estado de partida, para quien no tiene
  JavaScript y para el primer instante de la carga, y el guion los compara
  cifra a cifra con lo que escribe el modelo al cargar. La primera vez, el 26
  de septiembre de 2026, encontró **veinte desfasados en ocho simuladores**:
  la catenaria decía «−4,3 %» donde su modelo da «+10,70 %».

**Un caso nuevo se valida al revés**, como todo guardián: se reintroduce el
fallo y se ve el rojo. Los dos del 26 de septiembre se validaron devolviendo
la viga y la catenaria a su versión anterior: «Maximum call stack size
exceeded» y una sección medida en 3,0 m en vez de 20,0.

**Y de dónde salen esos valores no es lo mismo en los nueve.** Hasta el 13 de
septiembre de 2026 aquí ponía «los valores que publica la convocatoria… están
copiados del examen, que es lo único contra lo que tiene sentido comparar», y
era verdad de **tres**: el ábaco de Moody, el punto de funcionamiento y los
diagramas de viga. Los otros seis comparan contra la figura o el ejemplo del
propio tema —sus `fuente` lo decían y nadie los había sumado—, así que ahí esto
es una **regresión** y no una verificación: caza que el modelo se separe de la
página, no que el número sea cierto. El reparto está tabulado fila por fila en
`tests/fisica/README.md`: 3 con ancla externa, 2 mixtas, 4 propias. La cuarta
propia es el plano complejo, que entró el 15 de septiembre de 2026 y con ella
deja de haber un simulador que no compara nada.

Validado al revés con dos regresiones reales: volver a poner `D/e = 40` en el
golpe de ariete —que daba 215 mca donde **el tema publica 228**— y quitar el
aviso de la cabecera. Las dos, rojas. Y ojo al ejemplo, que ilustra lo de
arriba mejor que ninguno: ese 228 no sale de un examen, sale de
`fluidos/t20-golpe-ariete/index.mdx:218`, prosa nuestra. La regresión de
validación se validó contra nosotros mismos.

### `npm run peso` — cuánto tarda una página en un móvil

Tampoco es un guardián: el número depende de la máquina y tardaría demasiado
en cada build. Se toma al cerrar una asignatura, como `recalcula`.

Existe porque nada medía el peso y creció sin que nadie mirase. Y la lección
de la primera medición vale más que el guion: **el tamaño del HTML explica
menos de lo que parece**. El tema 5 pesa 7,2 MB y tardaba 2,6 s; el tema 1 pesa
5,8 MB y tardaba **5,9 s**. La diferencia no era el peso, eran doce lienzos del
paso `verificar` pintándose al cargar —360.000 píxeles cada uno—. Pasados a
tiempo muerto, 2,3 s.

**Antes de culpar al peso, mira qué se ejecuta al cargar.**

### `npm run recalcula` — comprueba que las cuentas salen

**En el suelo desde el 26 de septiembre de 2026**, justo detrás de `verify`.
Se había quedado fuera con el argumento de que tardaba; medido ese día,
recorre las 5.737 cuentas del corpus en **un segundo** y sale limpio. Dejarlo
para «al cerrar una asignatura» era dejar que un error de cuenta viviera
semanas publicado. Si da un falso positivo, se arregla el guion —como los de
abajo—, no se saca del suelo.

Existe porque el 28 de agosto de 2026 una auditoría que recalculaba las
matemáticas encontró **ocho ejercicios que enseñaban algo falso** con los dos
guardianes en verde y §15 cumplida. El signo de una antitransformada, la
relación de distancias de Apolonio invertida, un contraejemplo que no era
contraejemplo. Ninguno de esos fallos rompe nada: el sitio funciona
perfectamente enseñando algo que no es verdad.

Comprueba solo **lo que el propio contenido ya afirma**, nunca algo inventado:

- cada «expresión $\approx$ decimal» **y cada «expresión = decimal»** de una
  resolución o un desarrollo,
- cada forma exacta que un `formato` declara entre paréntesis, contra su
  `valor`,
- que un `formato` que promete «un número entero» guarde un entero.

Lo que no sabe evaluar lo declara **saltado**, y no lo cuenta como fallo.

> **Su alcance, medido, y lo que le sigue quedando fuera.** Hasta el 4 de
> septiembre de 2026 solo miraba los pares escritos con `\approx`, y eso
> dejaba fuera a **Fluidos entera** —su corpus escribe `=`—, es decir la
> asignatura con más aritmética del proyecto: 279 pares comprobados, los
> 279 de Cálculo. Ese día se amplió a `=`. Medido después:
>
> | | pares comprobados | saltados |
> |---|---|---|
> | Cálculo | 575 | 1.080 |
> | Álgebra | **0** | 2 |
> | Fluidos | **1.416** | 2.917 |
>
> De 279 a 1.991, y con el primer pase **diez desajustes reales, cinco en
> Fluidos y cinco en Cálculo** —una asignatura cerrada y dada por verificada—:
> dos cifras transpuestas (`1{,}04234` por `1{,}04324`), una suma de tres
> términos mal, un resto de Lagrange con un 25 % de error, un punto de millar
> dentro de una fórmula y cinco redondeos. Ninguno rompía nada.
>
> **Álgebra sigue en cero y seguirá**, y esa parte del límite no es un
> defecto: sus respuestas son objetos exactos —vectores, matrices, bases— y
> no hay decimales que recalcular.
>
> Lo que costó la ampliación fueron los falsos positivos, que eran cuatro
> clases y no tres: expresiones partidas por el salto de línea del YAML
> —resuelto uniendo las líneas dentro de un `$$…$$` **sin mover las
> posiciones**—, coeficientes tomados por resultados (`= 1{,}1\,\frac{v^2}{2g}`),
> redondeos encadenados —resuelto propagando la incertidumbre de cada
> literal decimal en vez de comparar contra media unidad del último dígito—
> y cambios de unidad en la misma cadena.
>
> **Y ese último obligó a una concesión que conviene tener presente.** Cuando
> el número lleva unidad escrita, el guion acepta **cualquier potencia de
> diez** como lectura posible, porque el corpus calcula en centímetros y
> escribe en milímetros con toda naturalidad. Consecuencia: **un error de
> factor mil pasa desapercibido si el número lleva unidad.** Se aceptó
> porque sin ello los avisos de esa clase se comían el guardián —de 33
> avisos, 20 eran esto— y §11 dice que un guardián que se ignora es peor que
> ninguno.

> **Y el 7 de septiembre de 2026, al cerrar Ingeniería Térmica, resultó que
> el guardián no sabía leer castellano.** Dio **veinte desajustes, los veinte
> falsos**, y todos por lo mismo: leía `110.735` —un Reynolds— como 110,735.
> El punto de millar. La tentación era reescribir el contenido; lo correcto
> era medir, y medido queda: de los **144 puntos que hay dentro de una
> fórmula en todo el corpus, los 129 con exactamente tres dígitos detrás son
> millares**, y los 15 con uno o dos son decimales de enunciados de examen
> reproducidos tal cual (§08) —`$x = 0.5$`, `$z=1.6$`—. Se distinguen por la
> forma, así que el guardián puede aprenderlo y el contenido no se toca. Es
> §01 con otra cara: **el fallo estaba en la capa que mira, no en las
> cuarenta y tres que se miran.**
>
> Quitar los millares destapó de inmediato que **los resultados enteros no se
> comprobaban nunca**: el número de la derecha tenía que llevar separador
> decimal, y `= 135.000\ \text{W}` solo entraba porque el punto lo disfrazaba
> de decimal —y entonces se comparaba 135 contra 135.000, que pasaba por la
> concesión de la potencia de diez de arriba—. Al admitirlos, la cobertura
> pasa de **2.444 a 3.819 pares**, un 56 % más.
>
> Y admitirlos destapó a su vez **dos fallos del guardián que llevaban ahí
> desde el principio y que ningún corpus había tocado**, los dos encontrados
> por los 45 avisos falsos que salieron de golpe: la lista de «esto de la
> derecha no es un resultado» usaba `\b`, y entre la `t` de `\cdot` y el `3`
> de `\cdot3` no hay frontera de palabra —medio corpus lo escribe sin
> espacio—; y el analizador leía el signo por debajo de la potencia, así que
> **`-(1+1)^{2}` valía +4**. Los dos arreglados y validados al revés.
>
> Lo que encontró de verdad, ya con todo eso limpio, fue **un desajuste real
> en Fluidos**: `1744 - 5902 = -4159` en la pieza en Y, donde los dos
> sumandos estaban redondeados y la resta arrastraba el redondeo al
> resultado —son 1743,5 y 5901,3, y da −4157,8—. Más dos divisiones escritas
> de forma ambigua, `K/p = 2{,}2\cdot 10^{9}/2{,}5\cdot 10^{6}`, que solo
> significan lo que quieren decir si el lector agrupa por su cuenta: pasadas
> a fracción.

> **Y el 12 de septiembre de 2026 resultó que no comprobaba ningún porcentaje
> con decimales.** Lo destapó al revés, con cinco avisos falsos en
> Materiales, todos de la forma `\frac{5 - 2}{5}\cdot 100 = 60\ \%`: un `%`
> detrás del resultado multiplicaba la expresión por cien aunque ya llevara
> su `\cdot 100`. La misma forma con decimales —la cristalinidad del tema 9,
> `\frac{0{,}070}{0{,}1222}\cdot 100 = 57{,}3\ \%`— no avisaba, y el motivo
> era peor que el aviso: el margen de redondeo se medía contra el valor ya
> multiplicado y salía del tamaño del propio valor, así que **pasaba
> cualquier número**, y el marcador lo contaba como comprobado.
>
> Arreglado admitiendo las dos lecturas de un porcentaje —la expresión es una
> fracción, o ya está en tanto por ciento— con el margen medido en la escala
> de la expresión. Al quitar el margen roto salieron tres avisos más, en
> Fluidos, y los tres eran la segunda lectura: una interpolación entre
> rendimientos de tabla y la fórmula de dilatación del primer parcial de
> 2021, que el enunciado da en tanto por ciento. Validado al revés con un
> 67,3 donde el tema 9 dice 57,3 —que antes pasaba— y un 70 donde el tema 3
> dice 60: dos rojos, los dos. El precio es la concesión de las unidades en
> pequeño: **un error de factor cien entre fracción y porcentaje ya no se
> caza.**

Antes de escribirlo se intentaron dos guardianes de texto y los dos se
descartaron por ruidosos —26 avisos falsos de 323, y 8 de 10—. La conclusión,
que vale para la próxima vez: **esta clase de fallo no se caza con patrones en
la prosa, se caza evaluando.**

### `npm run cifras` — que ninguna cifra publicada haya caducado

Es `deuda.mjs` en modo estricto. Todo lo que ese guion imprime es un informe
—un escalón con un solo ejercicio es una decisión, no un fallo—, salvo dos
cosas que sí son fallos y que con `--estricto` salen con código 1:

- una nota **publicada** en una ruta, en su `falta[]`, con un número que ya no
  es verdad («el tema 9 tiene cinco ejemplos de entrada» cuando son seis);
- una cifra de la documentación que el guion mide y no cuadra.

Nace el 26 de septiembre de 2026 porque las dos llevaban semanas caducando con
el guion informándolo y nadie leyéndolo: ese día había tres notas del tema 9
de Cálculo publicando un número de hacía nueve días, y siete cifras de este
fichero desfasadas. La cura de fondo no es el guardián sino no escribir cifras
en presente (arriba, «Dónde está cada cosa que cambia»); el guardián es para
las que se escriben de todos modos.

### `npm run contraste` — el contraste que se ve, no el que se declara

`check-color.mjs` mide las parejas de tinta y fondo **declaradas**; este
guion abre ocho páginas, una de cada tipo, en claro y en oscuro, y mide el
texto **tal como se pinta**, nodo a nodo, contra el fondo que tiene detrás
de verdad. Nace el 18 de septiembre de 2026, cuando el bloque de rutas de la
portada salió con la paleta de la pizarra sobre el papel —1,05:1, ilegible—
con `check-color` en verde: la pareja estaba bien declarada y mal usada. Se
salta los fondos con degradado y el texto transparente, que no tienen un
contraste que medir.

**Regla de este fichero: no se añade una comprobación por si acaso.** Se añade
cuando algo se ha roto de verdad, y el comentario dice qué se rompió. Y toda
comprobación nueva se valida al revés: se reintroduce el fallo y se confirma que
el guardián se pone rojo. Una comprobación que no falla cuando el fallo existe es
peor que no tenerla, porque da confianza falsa.

**Y se retira cuando su motivo desaparece**, con la misma exigencia de prueba
con la que se añadió: se mide, se escribe la medición en el propio fichero y se
deja dicha la fecha. Un guardián que salta cuando el fallo ya no existe empuja a
escribir peor para contentarlo, y enseña a saltarse los guardianes — que es el
daño de verdad. Pasó el 20 de agosto de 2026 con la regla de `\overline`: se
escribió cuando la salida era MathML y la fuente del sistema no estiraba la
barra, y siguió viva después de que KaTeX pasara a dibujarla él mismo al 100 %.

---

## 12 // Git y despliegue

- Conventional Commits, mensaje en castellano.
- **No se versionan binarios generados.** Los PDFs son artefactos de build.
- Si un fichero pesa más de 1 MB, se justifica antes de añadirlo.
- Nombres de fichero en minúscula, sin espacios ni acentos, con guiones.
- Despliegue por GitHub Actions al subir a `main`: `npm run suelo` —la misma
  línea que en local, §11— y, si pasa, el diario en PDF y la publicación.
- **Un guion de un solo uso se borra en cuanto ha hecho su trabajo**, en el
  mismo commit o en el siguiente: queda en el historial de git. Los doce de
  `scripts/rampa/` —los que pusieron un ejemplo de entrada a cada escalón de
  Cálculo— se quedaron vivos nueve días, y tres de ellos duplicaban dieciséis
  ejercicios si alguien los volvía a lanzar. Se borraron el 26 de septiembre de
  2026. Se quedan solo los que se vuelven a usar: los generadores de figuras,
  porque `rehacer.mjs` los relanza cuando cambia el lienzo.

---

## 13 // Cómo trabajar aquí

- **Plan primero.** El de la sesión va en `tasks/siguiente.md` —se
  sobrescribe cada vez, no se amplía— y lo que queda sin hacer en
  `tasks/pendiente.md`, una línea por cosa, que se borra en el commit que la
  cierra. La historia no va en ninguno de los dos: va en el mensaje del commit
  y en `diario/`. Si hay alguien a quien preguntar, espera el visto bueno; si
  no lo hay, lee el apartado siguiente.

  > Hasta el 26 de septiembre de 2026 todo esto iba en `tasks/todo.md` y
  > `tasks/manana.md`, que habían llegado a 6.138 y 1.704 líneas: se ampliaban
  > por abajo, lo cerrado se tachaba en vez de borrarse, y de las 6.138 solo
  > unas 180 seguían vivas. Los dos se congelaron ese día como archivo —se
  > siguen citando desde comentarios del código— y lo vivo pasó a los dos
  > ficheros nuevos.

### Cuando no hay nadie a quien preguntar

Este fichero se escribió suponiendo una conversación. Cada vez más no la hay:
se entrega el objetivo y el repositorio, y se ejecuta solo. Entonces la
pregunta «¿pregunto o sigo?» no se puede dejar al criterio del momento.

**Decide tú, sin preguntar, y déjalo escrito en el commit:** cómo se ordena un
bloque, qué ejercicio va primero, cómo se redacta un distractor, qué figura
hace falta, cómo se llama un apartado, si un ejercicio necesita un ejemplo
delante. Todo eso es trabajo, no política. Equivocarse ahí es barato: se ve al
mirar el resultado y se cambia.

**Para y pregunta —o si no puedes, PARA y escríbelo en `falta[]` o en
`tasks/pendiente.md` en vez de resolverlo— solo en estos cinco casos:**

1. **No tienes el dato y lo ibas a estimar.** Un porcentaje, un recuento de
   convocatorias, un peso. §10: se publica medido o no se publica. Un número
   inventado con dos decimales es la mentira más creíble que puede producir
   este proyecto.
2. **Ibas a escribir un enunciado que no has leído.** §08. Si el PDF no está o
   no se lee, el ejercicio no existe todavía. **Inventarlo es el peor fallo
   posible aquí** y es también el más cómodo: sale plausible, encaja, y nadie
   lo nota hasta que un alumno compara con el boletín y el sitio pierde toda
   su credibilidad de golpe.
3. **Una regla de este fichero te estorba.** No la ignores «solo por esta vez»
   —§13 último punto—. Anótala como conflicto y sigue por otro lado.
4. **Ibas a tocar la capa compartida para arreglar un caso.** `tokens.css`,
   `Base.astro`, `markdown.mjs`, `content.config.ts`. Un cambio ahí afecta a
   todo; si el motivo es un solo contenido, el fallo está en el contenido.
5. **Un hecho del mundo que el repositorio no contiene.** Si en el examen se
   puede usar calculadora, cuántas convocatorias hay al año, si un profesor
   reparte formulario. Se pregunta o se anota como supuesto **declarado**,
   nunca como hecho.

La asimetría es a propósito: **decidir de más es recuperable, publicar un dato
falso no.** Un sitio con el orden de los bloques mal se arregla en una tarde;
un sitio con un enunciado inventado hay que auditarlo entero.
- **El framework se destila del contenido, nunca al revés.** Los dos primeros
  temas de cada asignatura se escriben completos antes de extraer ninguna
  abstracción. El patrón «verificador» apareció así: construyendo contenido
  real, no diseñando en el vacío.
- **Empieza por el caso difícil.** Un componente probado primero con el
  ejercicio cómodo enseña poco y genera la abstracción equivocada. El que rompe
  el formato es el que enseña dónde están los límites.
- Antes de construir una figura, escribe **la pregunta que responde**. Una
  gráfica que no responde a una pregunta concreta no se construye. Un diagrama
  de Moody bonito no enseña nada; uno donde el alumno mueve la rugosidad y ve
  cuándo deja de importar el Reynolds, sí.
- Código en inglés, documentación e interfaz en castellano.
- Este fichero funciona como restricción, no como decoración. **La primera
  excepción «solo por esta vez» es la que abre la puerta a las setenta y
  nueve.** Si una regla estorba, se discute y se cambia aquí — no se ignora.

---

## 14 // Cómo se produce una ruta de estudio

Hermana del §04. Un tema responde «¿qué es esto?»; una ruta responde **«¿por
dónde empiezo y cómo sé que he terminado?»**. Son preguntas distintas y por eso
la ruta es un artefacto propio y no un índice del tema.

Una ruta vive en `src/content/preparar/<asignatura>-<evaluacion>.yaml` y es
**un solo fichero de datos**. La página se genera con el patrón `Lectura`; no
hay componente propio ni plantilla que copiar. Lo primero que hay que entender
es esto:

> **Una ruta no contiene contenido. Contiene referencias y razones.**

Si al escribir una ruta te ves explicando algo, para: ese algo va en la prosa
del tema, y la ruta lo enlaza. La única excepción declarada es el bloque del
formulario, que sí duplica hechos a propósito y lo dice en su propio `falta[]`.

### De qué se compone

Una ruta son cuatro campos de cabecera y una lista de bloques:

- `lede` y `criterioDeOrden` — por qué los bloques van en ese orden y no en el
  del temario. Se escribe una vez y explica la ruta entera.
- `medidoSobre` — cuántas convocatorias se han leído. Es la base de todos los
  recuentos y el esquema comprueba que ningún bloque diga haber caído en más
  años de los que se han contado.
- `bloques[]`.

Y un bloque son seis cosas:

| campo | qué es |
|---|---|
| `pide` | qué pide el examen, **con las palabras del examen** |
| `porque` | por qué este bloque existe y va donde va, con el recuento |
| `invariante` | la lectura humana que no se deriva de los datos, y su fuente |
| `dominio` | cómo sabes que has terminado |
| `material[]` | referencias a teoría, ejercicios y exámenes, por `id` |
| `falta[]` | lo que el examen pide y el sitio todavía no enseña |

`dominio` es el campo que separa una guía de una lista de enlaces. Se escribe
en segunda persona y describe **lo que tienes que ser capaz de hacer**, no lo
que tienes que haber leído: «dividir dos complejos y pasarlos a polar en menos
de un minuto acertando el cuadrante a la primera». Una lista se acaba; un
bloque se domina.

### Cómo se decide un bloque

Contando exámenes, nunca por intuición ni por el peso que el temario le dé.
El procedimiento es literal: se leen las convocatorias publicadas, se agrupa
por **hueco** —el sitio que ese ejercicio ocupa en el examen— y se ordena por
lo que rinde. Que dos enunciados distintos sean «la misma propiedad con otro
disfraz» es una lectura humana: se declara en `invariante` y se dice de dónde
sale (§10).

Un hueco no es un apartado del temario. «Regiones del plano complejo» es un
hueco porque cae los once años en el mismo sitio; «números complejos» no lo es.

### El orden

Suelo → los huecos ordenados por rendimiento → simulacros → formulario.

El **suelo** es el bloque que no se examina solo y sin el cual los demás no se
terminan a tiempo. No da puntos y va primero. El **formulario** es lo que hay
que llevar en la cabeza; va el último porque es repaso, no aprendizaje.

### Qué se calcula y qué no

Los porcentajes por competencia y el peso de la evaluación **se calculan en el
build** sobre los exámenes de la colección. Nunca se escriben en el YAML: sería
una cuarta fuente de verdad que envejece sola. Lo mismo con las URL, que salen
de los `id`.

Y una consecuencia del enlace por `id`: si la ruta apunta a un apartado de
teoría, el build comprueba el anclaje contra los encabezados reales del `.mdx`.
Renombrar un apartado **rompe el build**, que es exactamente lo que se quiere.

### El escalón

Un bloque no es una lista de enlaces: es una secuencia de **escalones**, y un
escalón es **una herramienta con su escalera**. Lleva cuatro cosas, y las
cuatro son obligatorias:

| campo | qué es |
|---|---|
| `aprendes` | qué vas a saber **hacer** al acabarlo, en segunda persona |
| `teoria` | dónde se explica, enlazado al apartado exacto |
| `ejercicios` | de `ejemplo` a `practica` a `examen`, en ese orden — con **una** excepción, la de abajo |
| `dominio` | cómo sabes que este escalón está cerrado |

> Nace el 23 de agosto de 2026 de una crítica del alumno: «lo que has hecho es
> mandar con un enlace directo a la teoría, y con eso no hacemos que nadie
> aprenda nada». Tenía razón. Un bloque era una pila plana de una decena de
> filas donde «leer» y «hacer» eran visualmente lo mismo, el `dominio` se
> validaba y se tiraba sin pintarlo, y el primer ejercicio de cualquier bloque
> ya era de nivel examen.

La regla que lo resume: **si el primer ejercicio de un escalón no lo puede
hacer alguien que acaba de leer la teoría, falta un ejemplo delante.**

**Y la excepción, escrita el 13 de septiembre de 2026 en vez de saltársela.**
Un `ejemplo` puede ir **al final** de un escalón cuando enseña *otro camino
para lo mismo* que solo se aprecia después de haber hecho el principal: el
tercer método de Cramer detrás de Gauss y del rango, Cayley-Hamilton detrás de
la diagonalización, la válvula isoentálpica detrás de las otras filas de la
tabla. Ahí el orden pedagógico va al revés que el orden por nivel, y quien lo
mueve delante enseña un atajo antes de que haya nada de lo que atajar.

Esto sale de una auditoría externa que contó **19 escalones desordenados**
donde `deuda.mjs` decía «0 sin rampa» —solo miraba el primero—, y el recuento
se reprodujo exacto. Pero los 19 no eran lo mismo, y el encargo de reordenarlos
todos habría estropeado cinco: **10 tenían el `examen` colocado antes que la
`practica`**, que es el fallo de verdad y se arreglaron ese día; **1** cerraba
con el ejemplo introductorio, que en la ruta gemela abre el mismo escalón, y se
movió; **5** son estos cierres deliberados, y lo que estaba mal era la regla,
no ellos. Quedan **3** con un `ejemplo` en medio, que no son ninguna de las dos
cosas y siguen en `tasks/pendiente.md`.

`deuda.mjs` §2 bis los cuenta ahora separados por esas tres formas, porque
tratarlas como una sola es lo que llevaba a arreglar mal nueve de diecinueve.

### Una ruta está terminada cuando

- Los bloques son **huecos del examen, medidos**, no apartados del temario.
- Cada bloque dice **por qué** existe, con el recuento y su fuente.
- Cada bloque tiene **criterio de dominio**, en segunda persona.
- **Toda herramienta que el examen usa está presentada en la prosa del tema**,
  no solo dentro de la resolución de un ejercicio. Esta es la que más cuesta y
  la que decide si la ruta sirve a alguien que llega de cero: se comprueba
  contando apariciones, no leyendo por encima.
- Lo que falta está en `falta[]`, **no callado**. Un hueco declarado es
  información; un hueco escondido es una promesa incumplida.
- Los porcentajes se calculan, nunca se declaran.
- `npm run suelo` en verde, con la ruta entre las páginas que `humo.mjs` abre.

---

## 15 // Una asignatura está terminada cuando

§04 dice cuándo está terminado un tema y §14 cuándo lo está una ruta. Falta el
nivel de arriba, que es el que se entrega.

- **Los temas del catálogo son el temario oficial**, no una lista plausible.
  Con su fuente. Si no la tienes, el catálogo dice `prev` y no finge.
- **Y si un tema del temario oficial no tiene material, se dice, no se
  esconde.** Hay temas que solo se explican en clase y no aparecen ni en la
  colección ni en ninguna convocatoria: de esos no hay nada que transcribir por
  mucho que se trabaje. Se declaran con **`soloEnClase`** en el catálogo —una
  cadena con el motivo **y su fuente**, no un booleano—, y entonces no impiden
  cerrar la asignatura. Lo que sigue prohibido es lo de antes: marcarlos
  `hecho` (miente) o borrarlos del catálogo (rompe la regla de arriba). El
  esquema pone dos frenos: un tema no puede ser `hecho` y `soloEnClase` a la
  vez, y **más de un tercio del temario así rompe el build** — media asignatura
  «solo en clase» no es una asignatura terminada, es una lista de excusas.
- **Todas las convocatorias publicadas están transcritas**, con su reparto por
  competencia y su PDF original en `public/examenes/<asignatura>/`.
- **Una ruta por evaluación**, cumpliendo §14 entera.
- **Todo tema que una ruta enlaza tiene prosa**, no solo ejercicios. Enlazar a
  un tema vacío es la forma más silenciosa de romper una ruta.
- **Cada tema tiene al menos un ejemplo introductorio propio** (§08) y al menos
  una figura que responde a una pregunta (§13).
- **`tests/fisica/` tiene un caso por simulador**, si hay simuladores (§10).
- **`falta[]` dice lo que no está.** Una asignatura terminada con huecos
  declarados es un producto honesto; una sin huecos declarados es sospechosa.
- **El catálogo dice cómo se puntúa**, en el campo `evaluacion`: las
  modalidades, el peso de cada parte y el umbral si lo hay, **con la guía
  docente citada**. Nace de la auditoría externa del 4 de septiembre de 2026,
  que lo llamó «la mejora de más rendimiento» de todo el informe, y tenía
  razón: el sitio enseñaba a resolver un examen sin decir en ninguna parte
  cuánto vale. Los pesos de una modalidad **suman 100 o el build falla**, y si
  la guía no está entre el material la `fuente` lo dice con esas palabras
  (§10) — al 6 de septiembre de 2026 pasa en **dos de las cuatro**
  asignaturas abiertas: las guías de Cálculo y de Álgebra las leyó la
  auditoría externa y no están en el repositorio; las de Fluidos y Química sí,
  y por eso las suyas van citadas literalmente.

  > Decía «dos de las tres», y la cuenta seguía siendo dos pero las
  > asignaturas ya eran cuatro. Peor: la `fuente` de Fluidos afirmaba ser «el
  > único de los tres documentos que sí está entre el material», y eso **se
  > publica en la portada** — dejó de ser cierto el día que entró Química con
  > su guía. Corregido el 6 de septiembre de 2026. Es la misma clase de frase
  > que §16 persigue: verdadera al escribirla, falsa al abrir la asignatura
  > siguiente, y sin ningún guardián que la mire.
- `npm run suelo` en verde con todas sus páginas dentro.

### Cuánto es «una asignatura», medido

Cálculo es la referencia, y está cerrada entera. Medida con `mide.mjs` el 26
de septiembre de 2026: once temas con **21.657 palabras de prosa y 30
figuras**, **399 ejercicios de tema** —91 de ellos ejemplos de entrada—,
**88 convocatorias con 425 ejercicios** y **156 escalones en 62 bloques de 7
rutas**. Sirve para dimensionar, no como cuota: un tema que necesita ocho
figuras lleva ocho. Cómo envejeció esta misma cifra —decía 197 ejercicios de
tema hasta ese día— está en `docs/cronica.md`.

**La definición de «palabra» es la de `scripts/mide.mjs` y solo esa.** Este
fichero decía 32.460 hasta el 29 de agosto de 2026 —el conteo crudo del MDX,
etiquetas y LaTeX incluidos— mientras `docs/como-vamos.md` publicaba 21.545
con la definición del guion. Ninguna mentía, pero dos definiciones sin nombrar
son un descuadre esperando a que alguien las compare. Manda la del guion,
porque es la reproducible.

---

## 16 // Cómo se comprueba lo que acabas de hacer

La sección que más rinde de este fichero, y la última en escribirse.

El suelo de calidad (§11) demuestra que el sitio **no está roto**. No demuestra
que esté **bien**. La diferencia se midió en la tanda del 23 de agosto de 2026,
cinco fallos reales:

| lo que se rompió | ¿lo cazó un guardián? |
|---|---|
| distractores demasiado juntos, y uno dentro de la tolerancia | **sí**, el esquema |
| **58 enlaces de teoría rotos** | no — build verde, `verify.mjs` verde |
| una curva subiendo con la etiqueta «$f' < 0$» | no |
| etiquetas cortadas en cuatro figuras | no |
| un párrafo reescrito dos veces sobre sí mismo | no |

**Cuatro de cinco.**

> **Y el 4 de septiembre de 2026 volvió a pasar, peor y por lo mismo.** Se
> pasó el día entero puliendo guardianes —`recalcula` ampliado, tildes,
> `humo` completo, `peso`— y presentando sus verdes como si fueran calidad.
> Bastó **abrir el sitio diez minutos** para encontrar esto:
>
> | lo que estaba publicado | ¿lo cazaba algo? |
> |---|---|
> | **`El NaN % de la nota`, en negrita**, en 3 de las 10 rutas | no |
> | «7 ejercicios» en un examen de 9, sin decir que faltan dos — en 9 convocatorias | no |
> | la página se desplaza en horizontal a 360 px en **toda** página de tema | no |
> | 5 de 7 pastillas de tema cortadas en cada examen | no |
> | la columna de texto de un ejercicio en un móvil: **145 px**, tres palabras por línea | no |
> | 12 fórmulas cortadas a media letra, sin decir que se desplazan | no |
>
> **Seis de seis.** Los cuatro guardianes en verde, dos asignaturas
> declaradas terminadas, y el producto roto por donde se usa. La lección no
> es «hacen falta más guardianes» —cuatro de estos seis ya tienen el suyo
> desde ese día—: es que **el orden estaba invertido**. Se mira primero y se
> mide después; un guardián se escribe cuando mirar ha encontrado algo, no
> para no tener que mirar.

> **Y esa misma noche llegó la auditoría externa, que encontró cuatro cosas
> más — ninguna de ellas vista por haber mirado.** Un fallo grave de
> navegación que solo aparece **entrando con hash** (`…/#algebra`, o sea
> abriendo un enlace compartido) y que por eso no se ve nunca por el camino
> normal; un tema del programa oficial de Álgebra que faltaba en el catálogo;
> ningún sitio donde se dijera **cuánto vale cada cosa** en el examen; y el
> `<title>` repetido en las 112 páginas de examen.
>
> La lección se apila sobre la de arriba y la afila: **mirar no basta si
> miras por donde ya sabes que va bien.** Yo probaba la portada entrando sin
> hash y leía el catálogo en vez de compararlo contra el programa oficial.
> Los cuatro los encontró alguien de fuera entrando **como entra un alumno**.
> De ahí sale el punto 7 de esta lista.

> **Y el 10 de septiembre de 2026, el caso más barato de todos.** Se hizo una
> captura de un ejercicio recién escrito —solo para ver que se dibujaba— y en
> la casilla de respuesta ponía: «en kW/K, con tres cifras — **vale la forma
> exacta: pi/4, sqrt(3)/2, (e^2-1)/2…**». La coletilla estaba escrita a fuego
> en `EjercicioGuiado`, con Cálculo delante, cuando Cálculo era la única
> asignatura. Medido al verlo: de los **2.695** pasos que llevan `formato`,
> **944 la recibían siendo falsa para su tipo de respuesta** —872 `magnitud`,
> 49 `vector`, 14 `matriz`, 9 `formula`—, el 35 %, y casi todos de Fluidos.
>
> Lo que lo hace peor que un descuido de texto: en una respuesta `magnitud` la
> única ayuda que importa es **que hay que escribir la unidad**, que es
> exactamente el error que el lector sabe diagnosticar aparte. Se estaba
> mandando al alumno al sitio equivocado justo en la asignatura donde la
> unidad es media nota. Cuatro guardianes en verde, 1.616 tests, dos barridas
> completas del navegador: ninguno mira **qué dice** un rótulo, solo que esté.
>
> Arreglado en el componente y no en los 944 pasos (Regla 0), con la coletilla
> dependiendo del tipo y comprobada contra `lib/algebra.ts` antes de escribir
> la de vectores y matrices, que si no habría sido inventarse un formato.

El build en verde no es una comprobación: es la ausencia de una. Así que
después de construir, y antes de dar nada por hecho:

1. **Míralo.** Levanta `npm run dev` y abre la página. Si has dibujado una
   figura, **haz una captura y ábrela**: en claro, en oscuro y a 360 px. Una
   etiqueta cortada o una curva con el signo cambiado no las ve ningún
   guardián, y las dos han pasado. `scripts/leer-grafica.mjs` ayuda cuando no
   puedes mirar, pero no sustituye a mirar.

   **Y míralo como llega alguien que no sabe que está**: abriendo la URL del
   tema a pelo, sin ancla, sin pulsar nada y sin `localStorage`. El 1 de
   septiembre de 2026 se publicaron cinco simuladores y **no se veía ninguno**:
   los cinco viven en un apartado que no es el primero, y en modo guiado los
   demás están `hidden`. El sitio los servía, el suelo estaba en verde, las
   capturas de cada simulador eran correctas — porque se habían tomado tras
   pulsar «completo». Es el mismo fallo que los 58 enlaces de teoría: **el
   destino existe y no llega.**

   La regla que sale: una captura tomada después de tocar algo demuestra que
   la cosa funciona, no que se encuentre. **Las dos comprobaciones son
   distintas y hay que hacer las dos.**
2. **Pulsa lo que has enlazado.** No compruebes que el `href` existe:
   comprueba que **llega**. Los 58 enlaces rotos tenían destino válido y
   apuntaban a un elemento oculto, así que el navegador no se movía.
3. **Relee lo que acabas de escribir**, sobre todo si lo has generado con una
   sustitución. El párrafo duplicado decía «en forma exacta o en forma exacta
   o con cuatro decimales» y venía de una regla que casó dentro de su propio
   resultado.
4. **Cuenta antes y después.** Al reorganizar contenido, compara los conjuntos
   de `id` contra `git show HEAD:<fichero>`. Es la única forma de saber que no
   has perdido un ejercicio por el camino; se hizo en las tres rutas y por eso
   se sabe que no se perdió ninguno.
5. **Prueba una respuesta equivocada.** Un ejercicio nuevo no está probado
   hasta que has escrito el error y has visto salir **su** diagnóstico. Que
   acepte la buena no dice nada: los distractores son la mitad del producto.
6. **Entra por donde no sueles entrar.** Con hash y sin él, desde un enlace
   compartido, pulsando dos veces seguidas, dando marcha atrás. Los caminos
   que pruebas son los que ya sabes que funcionan, y el fallo vive en los
   otros: el de la auditoría del 4 de septiembre —dos asignaturas abiertas a
   la vez y la portada en blanco— solo aparecía **entrando con hash**, que es
   justo como llega alguien a quien le han pasado el enlace. Y lo mismo con
   los datos: un catálogo se comprueba **contra el programa oficial**, no
   releyéndolo.
7. **Y solo entonces** `npm run suelo`.

### Y al cerrar una asignatura, cuatro cosas más

El suelo se pasa en cada commit. Estas no —tardan, o dependen de la máquina,
o necesitan ojos— y por eso se pasan **al cerrar**, todas juntas, en el mismo
commit que declara la asignatura terminada:

| | qué comprueba | qué pasó por no tenerlo |
|---|---|---|
| `npm run humo:todo` | todas las páginas del sitio en un navegador, no la muestra del día | el navegador abría 8 de 96 durante meses |
| `npm run peso` | que ninguna página pase de 4 s en un móvil | el tema 1 tardaba 5,9 s y nadie lo medía |
| `npm run mide` | regenerar la tabla de `docs/como-vamos.md` | dos commits publicando una cifra vieja |
| releer a mano | las frases con número de los `falta[]` que `deuda.mjs` no sabe contar, y la primera sección de `docs/como-vamos.md` | abajo |

`recalcula` y las cifras de los `falta[]` estaban en esta tabla hasta el 26
de septiembre de 2026; desde entonces van en el suelo, en cada commit.

### Y una clase de dato que envejece sin que nadie la mire: los `falta[]`

Un `falta[]` **se publica** en la página de la ruta, y muchos llevan un número
dentro: «el tema 9 tiene dos ejemplos de entrada propios», «una sola figura»,
«sus dos ejercicios propios», «no hay ningún ejercicio guiado de X». Se
escriben cuando son verdad, el contenido se añade después, y **nadie vuelve a
leerlas**.

Releídas todas a mano el 8 de septiembre de 2026: **once estaban caducadas**.
El tema 8 decía dos ejemplos y una figura cuando eran cinco y dos; el tema 9,
dos y una cuando eran cinco y tres; una nota pedía «un dibujo de qué hace
Green» que llevaba meses dibujado; otra decía que no había ningún ejercicio de
la matriz en otra base habiendo **seis**, cuatro de ellos sin enlazar desde
ninguna ruta; otra que no había ninguno de orden cuatro habiendo cuatro.

De ahí salen dos cosas.

La primera es una regla, y es la que más rinde: **cuando una nota dice «no hay
ningún ejercicio de X», eso se cuenta antes de escribir uno nuevo.** Las tres
veces que se comprobó ese día, el contenido existía; lo que faltaba era la
prosa que lo explicara o el escalón que llevara a él. Escribir el ejercicio
habría duplicado contenido y dejado el hueco de verdad sin tocar.

La segunda es que `deuda.mjs` lo cuenta desde ese día, y **encontró un
duodécimo caso en su primera ejecución**: una nota corregida esa misma mañana
—de «tres ejemplos» a «cuatro»— que volvió a quedarse vieja unas horas después,
al añadir el quinto. Ni releerlas a conciencia basta, porque el commit
siguiente las estropea.

Lo que el guion **no** sabe comprobar lo dice también: 77 frases con número que
no encajan en ningún patrón contable —«no hay ningún ejercicio de Cramer», «cae
en once de dieciséis»—. Esas se releen a mano al cerrar una asignatura. Un
guardián que finge cubrir lo que no cubre es peor que ninguno.

**Y releer la primera sección de `docs/como-vamos.md`, «En una frase».** El
guion regenera su tabla, no su prosa, y esa prosa dice **cuántas asignaturas
hay terminadas**: es la frase más presente-continuo de todo el repositorio y
envejece el día que se cierra cualquier otra. El 7 de septiembre de 2026
llevaba desde el 6 diciendo «tres asignaturas terminadas» y «112
convocatorias» cuando eran cuatro y 118 — el mismo fallo que el propio
documento denuncia en su cabecera, cometido cuatro líneas después.
No basta con la regla del «mismo commit»: lo que cambia esa frase suele estar
en **otra** asignatura.

> Si no puedes hacer el punto 1 —sin navegador, sin capturas—, dilo en el
> commit. Un contenido visual sin mirar no es contenido terminado, es contenido
> propuesto, y hay que decirlo con esa palabra.

---

## 17 // Trampas conocidas

Cosas que ya han costado horas. No son opiniones.

<!-- índice de trampas: lo genera un guion a partir de las entradas -->

**Las 56, en una línea cada una** —el detalle y el porqué, en su entrada, más abajo y en este mismo orden—:

- No escribas LaTeX a través del shell.
- Un `: ` sin comillas dentro de un valor YAML rompe el fichero
- `dist/` abierto con `file://` no tiene CSS.
- No reconstruyas mientras `humo.mjs` está corriendo.
- `max-width` y `overflow` NO hacen nada en una caja `display: inline`.
- Un track `1fr` tiene `min-width: auto`, que es min-content y no cero.
- Una tolerancia relativa sobre una temperatura es enorme.
- Los ids de encabezado se generan por `render()`, no por documento.
- En modo guiado, un enlace a un apartado que no es el visible no navega.
- El servidor de desarrollo sirve colecciones de contenido viejas.
- `replace()` con un `$` en el texto de reemplazo se traga el fichero.
- Borrar «desde aquí hasta allí» se lleva por delante lo que se añadió en medio.
- Un `IntersectionObserver` no sirve para diferir trabajo en modo guiado.
- Una línea que empieza por `- ` parte en dos una fórmula que venía de la línea anterior.
- Una `\frac{…}{…}` partida justo entre las dos llaves confunde a `recalcula`.
- Un enunciado puede pedir un teorema o un método sin nombrarlo, y entonces ninguna búsqueda de texto lo encuentra.
- Un `grep` por líneas no ve una frase partida dentro de un bloque YAML.
- Una anchura de texto medida en el navegador no es reproducible entre máquinas.
- Astro acota los estilos, así que un elemento creado por el script se publica sin ninguno.
- Ocultar un texto no es lo mismo que no tenerlo: `opacity: 0` sigue midiendo.
- Las figuras no se escriben a mano: se calculan.
- Una figura de ejercicio se dibuja a la escala del resultado, no «a ojo».
- Una escala fija convierte una figura correcta en una figura ilegible.
- Una normal apunta hacia arriba en cuanto la placa se inclina.
- El humo corrige las transformadas y `getBBox()` no.
- `astro preview` es un demonio y sobrevive al guion que lo arrancó.
- El humo abre una muestra rotatoria de exámenes elegida por el día del año, así que un fallo latente aparece cualquier mañana sin que nadie haya tocado nada.
- Un guardián puede dar verde sobre menos sitio del que dice, y eso no se ve nunca.
- `| tail` en un guardián largo te quita justo la línea que hay que leer.
- Insertar delante de un elemento de lista YAML deja su campo huérfano.
- El prefijo `ex` de un id de examen no es una costumbre: está escrito dentro de un guardián.
- Un id de ejercicio inventado suena igual que uno real.
- ~~El esquema no tiene `unidad`~~ · resuelto el 30 de agosto de 2026.
- `pdftotext` sin `-enc UTF-8` se come los signos.
- Una tilde dentro de `$…$` se dibuja, y avisa en cada build.
- El símbolo del euro no se puede dibujar dentro de una fórmula.
- En el pie de una figura no hay fórmulas.
- Un `var(--token)` que no existe no da error: pinta negro.
- «No encaja en el formato» es la razón más fácil de escribir y la que menos se revisa.
- Un fichero sin extensión no sale en ninguna búsqueda por tipo, y ahí puede haber una convocatoria entera.
- La `e` de `1.8e-5` se leía como el número de Euler, y no daba error: daba otro número.
- El esquema puede ser más estricto que el sitio, y entonces no protege nada.
- Un `<path>` sin `fill="none"` se rellena de negro, y solo se nota cuando el camino tiene codo.
- Un encabezado con LaTeX dentro produce un ancla que ninguna ruta puede enlazar.
- El `$$` de una fórmula en bloque va en su propia línea, siempre.
- `history.replaceState` no actualiza `:target`.
- `titulo` y `fuente` son texto plano, sin `$…$`.
- Ninguna construcción de markdown que necesite sus saltos de línea sobrevive dentro de un escalar plegado de YAML.
- Una cita de markdown dentro de un escalar plegado de YAML publica sus «>».
- Un rótulo destacado que dice lo contrario que el párrafo de debajo gana, porque es el que se lee.
- Un campo que se pinta sin pasar por `mate()` publica los asteriscos.
- La tolerancia de una respuesta `numero` es absoluta, y un `0.02` escrito ahí no significa un 2 %.
- `evaluaNumero` lee «, » como un espacio, y el espacio como un producto.
- Zod no corre las reglas de un objeto al que le falta un campo obligatorio.
- Un deslizador recorta su `value` contra el `max` que tiene EN ESE MOMENTO.
- Dos valores de un deslizador de paso 0,1 no se restan exacto, y un arreglo que se llama a sí mismo no para.

<!-- fin del índice de trampas -->

- **No escribas LaTeX a través del shell.** Ni heredocs, ni `node -e`, ni
  `sed`. Las barras se comen: `\\frac` llega como `\frac`, y `\f` se convierte
  en un carácter de avance de página **invisible** que rompe el YAML y no se
  ve al leer el fichero. Usa las herramientas de edición de ficheros. Pasó tres
  veces en un día.

  **Y el reemplazo de `sed` es peor que el patrón.** El 14 de septiembre de
  2026, un `sed 's/\operatorname{arctg}/\arctan/'` dejó escrito un carácter
  BEL en mitad de una fórmula: `\a` en el **lado derecho** de la sustitución
  no es «barra + a», es el timbre. El fichero se veía bien en el editor y el
  build cayó con «the stream contains non-printable characters». Dos reglas
  que salen de ahí: el reemplazo de `sed` nunca lleva una orden de LaTeX, y
  cuando un YAML falla por «non-printable», lo primero es
  `grep -c $'\a' fichero`.

  **Y las comillas invertidas tampoco pasan.** Dentro de un `node -e "…"` entre
  comillas dobles, bash toma cada `` `algo` `` por una orden que ejecutar y lo
  sustituye por su salida —casi siempre, nada—. El 26 de septiembre de 2026 un
  comentario que debía decir «viven en `lib/numero.ts`» quedó escrito «viven
  en , y», sin un solo aviso salvo un «No such file or directory» que se leía
  como ruido. Y en Markdown y en los comentarios de este repositorio hay
  comillas invertidas en casi cada frase. **La regla, entera: el texto que va
  a un fichero se escribe con la herramienta de edición o en un guion del
  scratchpad; por la shell solo pasan órdenes.**
- **Un `: ` sin comillas dentro de un valor YAML rompe el fichero**, y el error
  que da apunta a otra línea. Ojo con los apóstrofos de `f'`, que confunden a
  cualquier comprobador hecho con `grep`.
- **`dist/` abierto con `file://` no tiene CSS.** Las variables salen vacías y
  parece que los SVG no se dibujan. Levanta un servidor.
- **No reconstruyas mientras `humo.mjs` está corriendo.** El navegador lee
  `dist/` a través del servidor de vista previa, así que un `npm run build` por
  debajo le arranca las páginas de las manos y devuelve 404 que no son del
  sitio. Pasó el 13 de septiembre de 2026, con 55 y luego 130 fallos fantasma,
  y **volvió a pasar el 14** mientras se arreglaba justo eso: una barrida
  entera perdida. Una tanda en segundo plano a la vez, y nada que toque `dist/`
  hasta que termine.

  **Y si la barrida cae en el primer segundo diciendo «el servidor de vista
  previa no ha arrancado en 30 s», no es el arranque: es que hay otro
  servidor.** Astro guarda un `preview` **desprendido** entre ejecuciones y se
  niega a levantar uno nuevo, con un mensaje que `humo.mjs` no ve porque lanza
  el proceso con `stdio: 'ignore'`. Lo deja `peso.mjs` o
  `comprueba-simuladores.mjs` si se cortan a medias, y puede estar en otro
  puerto —4408, por ejemplo— así que mirar el 4321 con `netstat` no lo
  encuentra. Pasó el 15 de septiembre de 2026 y costó dos barridas. Lo que lo
  resuelve en diez segundos:

  ```
  node node_modules/astro/bin/astro.mjs preview status
  node node_modules/astro/bin/astro.mjs preview stop
  ```
- **`max-width` y `overflow` NO hacen nada en una caja `display: inline`.** El
  navegador los ignora en silencio, así que la regla se lee bien, pasa las
  revisiones y no surte efecto. `.katex` es un `<span>`, o sea `inline` por
  defecto: la regla que debía contener las fórmulas largas se escribió el 4 de
  septiembre de 2026 y **estuvo diez días inerte**, con tres páginas de tema
  yéndose de lado en un teléfono. Si una regla existe para arreglar algo
  medido, hay que volver a medirlo después (§16); que esté escrita no es que
  funcione.
- **Un track `1fr` tiene `min-width: auto`, que es min-content y no cero.**
  Cualquier hijo que no sepa encoger —una fila flex con `nowrap`, una tabla, una
  fórmula— estira la columna entera y se lleva el documento con ella. En una
  pantalla de 360 px la columna de un tema llegó a **771,8 px**. La cura es
  `min-width: 0` en los hijos de la rejilla, y conviene ponerlo al escribir la
  rejilla, no al descubrir el desborde.
- **Una tolerancia relativa sobre una temperatura es enorme.** El lector de
  magnitudes convierte los grados Celsius a kelvin antes de comparar, así que
  el 2 % por defecto de una respuesta de 40 °C son **±6,3 K**: cualquier
  distractor a menos de seis grados se da por bueno. Lo cazó el esquema el 7
  de septiembre de 2026, en el primer ejercicio de Térmica cuya respuesta era
  una temperatura. En una respuesta de tipo temperatura, la tolerancia se pone
  a ojo mirando **cuántos kelvin** representa, no cuántos por ciento; 0,005
  son un grado y medio, que es lo razonable.
- **Los ids de encabezado se generan por `render()`, no por documento.** Astro
  instancia el slugger en cada llamada, así que dos resoluciones con un `##
  Resultado` producen dos `id="resultado"` en la misma página. Se prefijan en
  `mate()`; si añades una salida de Markdown nueva, pásale su prefijo.
- **En modo guiado, un enlace a un apartado que no es el visible no navega.**
  El destino existe pero está oculto. Lo resuelve `abreElAncla()` en
  `Lectura.astro`; si escribes otro componente con secciones, tenlo en cuenta.
- **El servidor de desarrollo sirve colecciones de contenido viejas.** Si un
  `.yaml` de `src/content/` lo escribe otro proceso —un script del scratchpad,
  un `git checkout`— el vigilante de Astro puede no enterarse, y `npm run dev`
  sigue devolviendo la versión anterior sin avisar de nada. El 26 de agosto de
  2026 costó una medición falsa: la ruta de la 4.ª evaluación se comprobó en el
  navegador con 48 enlaces nuevos ya escritos, y el navegador informó de 18
  —los de antes— con todo en verde. **Antes de creerte cualquier medición sobre
  el navegador, comprueba que el servidor ya sirve lo que acabas de escribir**:
  un `curl` a la página y un `grep` de algo que solo esté en la versión nueva.
  Si no está, se mata el proceso del puerto 4321 y se levanta otra vez.
- **`replace()` con un `$` en el texto de reemplazo se traga el fichero.** En
  `String.prototype.replace`, el `$` de la cadena de reemplazo es un carácter
  especial, y son cinco las secuencias que muerden: `$&` es lo sustituido, `$1`
  un grupo, **`$'` es todo lo que va detrás**, **`` $` `` es todo lo que va
  delante** y **`$$` se queda en un solo `$`**, que rompe sin avisar cada
  fórmula en bloque. Como aquí casi todo el texto lleva LaTeX entre dólares,
  cualquiera de las cinco mete o quita trozos del propio fichero.

  **Ha pasado dos veces, y la segunda con esta regla ya escrita.** La primera,
  en `tasks/todo.md`: quedó cortado a media frase, en el sitio exacto donde
  había un `$x\sin x$`, con la versión anterior entera pegada detrás, y así
  estuvo **veintiún commits** publicando recuentos viejos. La segunda, el 17
  de septiembre de 2026, en este mismo documento: un punto de §17 llevaba un
  dólar pegado a una comilla invertida, el `` $` `` insertó **el `CLAUDE.md`
  entero** en mitad de una frase, y así estuvo nueve días —5.472 líneas, de
  las que 2.434 eran copia—, con las ediciones posteriores cayendo en una sola
  de las dos mitades. Se vio en la auditoría del 26 de septiembre, al listar
  las secciones y encontrarlas todas dos veces.

  **Regla: para insertar texto literal se usa la función de reemplazo
  —`(...) => nuevo`— o se parte y se vuelve a juntar con `split`/`join`,
  nunca la cadena a pelo.** Después de cualquier reescritura de un fichero de
  prosa, se cuenta: `wc -l` antes y después, y un `grep -c` de un encabezado
  que solo puede aparecer una vez. Y como la regla escrita no evitó el
  segundo accidente, ahora lo vigila `verify.mjs` en «Los documentos del
  repositorio»: falla si una sección `## NN //` sale dos veces en `CLAUDE.md`
  o en `tasks/`, o si la primera línea de un fichero reaparece más abajo.
- **Borrar «desde aquí hasta allí» se lleva por delante lo que se añadió en
  medio.** Al podar una sección obsoleta de `tasks/todo.md` se ancló el
  corte en dos textos que estaban a 250 líneas de distancia, y entre ellos
  habían crecido **cinco secciones nuevas** que desaparecieron sin avisar.
  El fichero seguía compilando y el guardián no lee `tasks/`. La regla de
  §16 —contar antes y después— lo cazó, pero contar líneas no basta:
  `wc -l` solo dijo que faltaban 246, y eso podía ser lo esperado.
  **Cuenta encabezados, no líneas** (`grep -c '^### '`), y mejor aún
  compara la lista: `git diff -U0 fichero | grep '^-#'` dice exactamente
  qué secciones se han ido. Y para acotar un bloque, ánclalo por **índice
  de línea comprobando los dos bordes** antes de escribir, no por dos
  cadenas lejanas.
- **Un `IntersectionObserver` no sirve para diferir trabajo en modo guiado.**
  Los paneles cerrados están en `display: none`, no intersecan nunca, y lo que
  cuelgue del observador **no se ejecuta jamás**. Pasó el 28 de agosto de 2026
  al diferir el pintado de los lienzos del paso `verificar`: la página cargaba
  el doble de rápido y los seis lienzos se quedaban en blanco. Lo que sí vale
  es `requestIdleCallback`, que no depende de la visibilidad. **Regla: al
  diferir cualquier cosa, comprueba después que llega a ejecutarse** — que la
  página vaya más rápido puede significar que ya no hace su trabajo.
- **Una línea que empieza por `- ` parte en dos una fórmula que venía de la
  línea anterior.** Dentro de un bloque `|` el texto es Markdown, y en
  Markdown `- ` al principio de línea abre una lista: eso cierra el párrafo,
  y el `$…$` que cruzaba el salto se queda sin pareja a cada lado. El
  resultado son dos trozos de LaTeX publicados como texto crudo. Pasó el 31
  de agosto de 2026 al escribir una `pista` con
  `$NPSH_d = p_{at}/\gamma - p_v/\gamma - z_{asp}` y la continuación
  `- h_{f,asp}$` en la línea siguiente. Lo caza `verify.mjs` —«LaTeX que ha
  salido como texto»— pero se tarda menos en evitarlo: **al partir una
  fórmula entre dos líneas, la segunda nunca empieza por un signo menos**;
  se recoloca el corte o se pasa a `$$…$$`.

  **Y no es solo el menos: en Markdown abren lista `-`, `*` y `+`.** El 3 de
  septiembre de 2026 volvió a caer el suelo por lo mismo con un `+ ` — una
  raíz partida como `$\sqrt{11471{,}5^{2}` y `+ 332{,}5^{2}}$` en la línea
  siguiente. La regla completa: **la continuación de una fórmula no empieza
  nunca por `-`, `*` ni `+`.** Y hay una forma de no tener que acordarse: si
  la fórmula no cabe en una línea, va en `$$…$$` con las vallas en línea
  propia, que es la forma que el corpus usa para todo lo demás.

  **Y pasó dos veces el mismo día**, las dos con un `NPSH` y las dos
  costando un suelo entero de doce minutos. El guardián está bien donde
  está —`verify.mjs` lo caza— pero conviene barrer antes de lanzarlo: se
  cargan los YAML, y en cada cadena se cuentan los `$` línea a línea; si
  una línea deja una fórmula abierta y la siguiente empieza por `- `, ahí
  está. Veinte líneas, y devuelve el fichero y el campo.
- **Una `\frac{…}{…}` partida justo entre las dos llaves confunde a
  `recalcula`.** El corpus corta las fórmulas a 80 columnas, y si el corte cae
  entre el `}` del numerador y el `{` del denominador, `expresionAntesDe` se
  queda **solo con el denominador**: avisa de que «4,6225·10⁻¹⁰ no vale
  1,663·10⁹», que es verdad y no significa nada. Pasó el 7 de septiembre de
  2026 con el Grashof del ejercicio de Churchill y Chu. Cortar por el
  numerador sí funciona, así que la regla es corta: **la `\frac` se parte
  dentro de una llave, nunca entre las dos.** Y si no cabe, se deja la línea
  larga: ochenta columnas es una costumbre, un aviso falso cuesta diez
  minutos.
- **Un enunciado puede pedir un teorema o un método sin nombrarlo, y entonces
  ninguna búsqueda de texto lo encuentra.** Es la trampa que más recuentos ha
  estropeado, porque falla siempre **por defecto**: uno busca, sale cero, y se
  queda tranquilo publicando una ausencia. Los dos casos del 10 de septiembre
  de 2026, encontrados el mismo día y por caminos distintos:

  - El ejercicio 2 de la ordinaria de 2016-2017 pide demostrar el teorema del
    valor intermedio **enteramente en símbolos** —«$\forall H\in[m,M]\
    \exists x\in[a,b] / y(x)=H$»—, sin la palabra «teorema», sin «Bolzano» y
    sin «valor intermedio». Una búsqueda por esos tres términos da cero, y la
    ruta publicaba correctamente «dos ordinarias» porque el recuento se había
    hecho a mano. Es decir: **el guion habría empeorado el dato**.
  - El ejercicio 5 de la tercera de 2018-2019 es integración numérica —ordenar
    la suma por el extremo izquierdo, la del derecho y el valor exacto— y no
    nombra ningún método. Ahí sí ganó el guion: tres rutas llevaban meses
    publicando «un solo enunciado pide un método numérico» cuando son dos.

  La regla, entonces, no es «busca mejor»: es **busca por el concepto y por su
  descripción, y cuando el resultado sea un cero, ábrelo antes de publicarlo.**
  Un cero es la única cifra que no se puede comprobar leyendo lo que ha salido.
  Y su hermana práctica: al medir sobre `enunciado`, **quita las figuras**
  —`<figure>…</figure>`—, porque el `<desc>` de un SVG redibujado dice
  «trapecio» y «punto medio» hablando de geometría. En el barrido de ese día
  eran dos falsos positivos de tres.

- **Un `grep` por líneas no ve una frase partida dentro de un bloque YAML.**
  Los valores `|` y `>-` se escriben a 80 columnas, así que «Da cuatro
  decimales.» puede estar como «Da\n cuatro decimales.» y `grep "Da cuatro
  decimales"` devuelve cero. El 28 de agosto de 2026 eso hizo que una auditoría
  concluyera «cero enunciados ordenan dar decimales» cuando eran 32. **Regla:
  para contar cualquier cosa dentro del contenido se carga el YAML y se busca
  sobre la cadena ya parseada, nunca con `grep` sobre el fichero.** Vale igual
  para los decimales, que van en LaTeX: `0{,}42865` no lo encuentra un `grep`
  de `0,42865`.

  **Y cargar el YAML tampoco basta**, que es la segunda mitad de la misma
  trampa y costó tres números publicados mal el 6 de septiembre de 2026. Un
  bloque `>-` o `|` **conserva los saltos de línea** con los que se escribió,
  así que la cadena ya parseada trae «curva característica de la\ninstalación»
  y una expresión regular con la frase seguida no casa. Salieron cinco
  convocatorias donde había seis, y cuatro donde había diez — el error es
  siempre **por defecto**, que es el peor sentido: uno se queda tranquilo. La
  regla completa: se carga el YAML **y se normalizan los espacios**
  —`.replace(/\s+/g, ' ')`— antes de buscar cualquier frase de más de una
  palabra.
- **Una anchura de texto medida en el navegador no es reproducible entre
  máquinas.** La misma etiqueta SVG midió 285 unidades con la tipografía del
  sitio cargada y 315 en otro entorno, y en el segundo se salía del `viewBox` y
  en el primero no. Si `humo.mjs` da verde y alguien aporta una captura donde
  el texto se corta, no se están contradiciendo: están midiendo con fuentes
  distintas. **Regla: al informar de un desbordamiento de texto se dice con qué
  familia se midió**, y al dejar margen en un `viewBox` se cuenta con que la
  fuente puede no haber cargado todavía.

  **Y la forma de que no vuelva: `textLength` con `lengthAdjust="spacingAndGlyphs"`.**
  Fijar el ancho hace que la caja mida lo que dice el atributo **en cualquier
  fuente**, así que la comprobación deja de depender de la máquina. Se pone en
  las etiquetas largas —las de dos o tres términos con raíces— y se elige un
  valor cercano al natural para no deformar los glifos.
- **Astro acota los estilos, así que un elemento creado por el script se
  publica sin ninguno.** Cada regla de un `<style>` de `.astro` se compila con
  un `data-astro-cid-…` añadido al selector, y ese atributo lo pone el
  compilador en el marcado del componente — no en lo que crea el navegador con
  `createElement`. El 2 de septiembre de 2026 el chip «simulador» del índice
  salió publicado como texto pegado a la última palabra del título, sin caja ni
  color, y la regla estaba escrita y era correcta. **Regla: todo lo que el
  script cree en tiempo de ejecución se estiliza con `:global(...)`**, y se
  comprueba mirando, porque no falla nada: el elemento está, se lee, y solo se
  ve mal.
- **Ocultar un texto no es lo mismo que no tenerlo: `opacity: 0` sigue
  midiendo.** Un `<text>` invisible conserva su caja, así que sigue contando
  para el guardián de `viewBox` — y, peor, sigue diciendo lo que diga si
  alguien lo lee con un lector de pantalla. Pasó el 1 de septiembre de 2026 en
  el simulador de canales: el rótulo de la banda se apagaba en el semicírculo
  y su caja seguía ahí, escrita «de 0,0 a 0,0» y saliéndose por la izquierda.
  **Regla: para quitar un texto se le pone `textContent = ''`**; la opacidad
  se reserva para lo que sí sigue estando, como una curva de referencia.
- **Las figuras no se escriben a mano: se calculan.** Desde el 17 de
  septiembre de 2026 vive en `scripts/figuras/` un lienzo —`lienzo.mjs`— que
  convierte coordenadas de la asignatura en píxeles y emite el SVG con la
  receta de siempre: `<title>` y `<desc>` que se leen solos, clases
  prefijadas, rótulos con halo de papel. Cada tema tiene su generador
  (`calculo-t01.mjs`, …) y `pegar.mjs` mete el resultado en el paso `dibujar`
  que le toca sin tocar el resto del YAML. Tres cosas que impone y que no se
  negocian:

  1. **Nada se sale del `viewBox`, tampoco un rótulo.** El marco se comprueba
     al generar, con la caja del texto estimada por lo alto, y el error dice
     qué rótulo se sale y por dónde. Antes eso lo cazaba `humo.mjs` media hora
     más tarde, o no lo cazaba nadie.

     Y **por lo alto quiere decir con margen de verdad**: el paso de la fuente
     mono no es el mismo en todas las máquinas. Con 6,7 píxeles por letra las
     figuras cabían en Windows y tres se salían en el CI —veintisiete letras
     que aquí medían 181 píxeles allí medían más de 205—. Se mide con 7,9, se
     rechazan algunas que en realidad cabrían, y eso es lo correcto: mover un
     rótulo cuesta un minuto y uno recortado en producción no lo ve nadie
     hasta que un alumno no entiende el dibujo. La lección general: **un
     guardián que solo vale en la máquina de quien lo escribió no vale.**
  2. **Ni un `#rrggbb`.** Solo tokens, porque hay tres temas y
     `check-color.mjs` los mide todos.
  3. **Las figuras repetidas se copian, no se reescriben.** Nueve ejercicios de
     examen piden el mismo dibujo que un ejemplo de su tema; `reetiqueta()`
     copia la figura cambiándole el prefijo de ids. Escribirla dos veces es
     tener dos versiones que algún día dejarán de coincidir.
  4. **En el pie de una figura no hay Markdown.** El `<figcaption>` se emite
     tal cual y no pasa por `mate()`, así que un `**así**` se publica con los
     asteriscos a la vista. `verify` lo caza —lo ha cazado dos veces, el 17 de
     septiembre de 2026 en `ej-inversa-con-signo` y en `la-integral-de-gauss`—,
     pero llega después de construir el sitio entero: más barato es escribir
     el pie en prosa llana desde el principio. El énfasis, si hace falta, va
     en el texto del ejercicio, que sí se procesa.

  5. **Ni en el `titulo` de un paso hay LaTeX.** Es el mismo defecto por
     otro sitio: el título se emite tal cual, así que un
     `titulo: El coeficiente de $x^3$` se publica con los dólares a la
     vista. Pasó el 17 de septiembre de 2026 en
     `componer-tres-desarrollos-conocidos`, y lo cazó `verify` después de
     construir las 249 páginas. Un título de paso es una etiqueta corta en
     prosa —«El coeficiente del término cúbico»—; la fórmula va en la
     `pregunta`, que sí pasa por `mate()`.

  Para mirarlas antes de pegarlas, `previsualiza.mjs` monta un contact sheet
  en PNG con todas las de un generador, en claro o en oscuro. Eso sigue siendo
  §16: lo que caza un error de dibujo es mirar la captura.
- **Una figura de ejercicio se dibuja a la escala del resultado, no «a
  ojo».** Al redibujar el enunciado 2.19 —un tubo cerrado que mide el nivel
  comprimiendo su aire— el agua de dentro del tubo se puso, esquemáticamente,
  más alta que la de fuera. Es exactamente lo contrario de lo que pasa, y era
  además **la idea entera del problema**: el aire comprimido impide que suba.
  Los números ya estaban calculados —1,44 m dentro contra 5 fuera— y no se
  usaron para dibujar.

  Nada lo cazó: el SVG era válido, los tokens correctos, el `viewBox` sin
  desbordes, y `verify` y `humo` en verde. Lo cazó mirar la captura (§16). La
  regla: **si has resuelto el problema, la figura se construye con esos
  números** —una escala de píxeles por metro y las cotas calculadas—, porque
  una figura esquemática es una segunda oportunidad de afirmar algo falso.
- **Una escala fija convierte una figura correcta en una figura ilegible.**
  El simulador del tema 7 encuadraba siempre 22 m de profundidad, así que una
  compuerta de 3 m hundida a 14 salía de cuarenta píxeles y no se veía ni el
  prisma ni los dos puntos que hay que comparar. Nada estaba mal calculado y
  nada lo cazó: `verify` y `humo` dan verde con una figura minúscula. **Regla:
  al dibujar una escena con un mando que cambia su tamaño, la escala se calcula
  cada vez a partir de lo que hay que enseñar**, y lo que informa es entonces
  la *forma* —el prisma pasa de triángulo a rectángulo—, no el tamaño.
- **Una normal apunta hacia arriba en cuanto la placa se inclina.** El prisma
  de presiones se dibuja perpendicular a la compuerta, y con la compuerta a
  35° la flecha del borde superior salía **por encima de la lámina libre**:
  una figura que dice que hay agua donde no la hay. Se caza mirando, no
  midiendo. **Regla: toda construcción perpendicular lleva su tope contra los
  bordes físicos de la escena** —la lámina, la solera—, no solo contra el
  `viewBox`.
- **El humo corrige las transformadas y `getBBox()` no.** Si escribes un
  guion propio para comprobar desbordes, un rótulo con `rotate(-90 …)` te dará
  un falso positivo: `getBBox()` devuelve la caja **sin** transformar. Hay que
  pasar las cuatro esquinas por `el.getCTM()`, que es lo que hace
  `scripts/humo.mjs`. Un falso positivo es caro por lo que esconde: mientras
  se le da vueltas, el desborde de verdad de otro estado pasa desapercibido.
- **`astro preview` es un demonio y sobrevive al guion que lo arrancó.** Si te
  quedas uno levantado —de una captura, de una prueba en el navegador—,
  `humo.mjs` no puede arrancar el suyo y muere con «El servidor de vista
  previa no ha arrancado en 30 s», que **no dice cuál es la causa**. Y hay una
  variante peor: si el puerto está libre pero el demonio sigue vivo en otro,
  el barrido puede arrancar y caerse a media ejecución sin marcar ningún
  fallo — pasó el 6 de septiembre de 2026, con 399 líneas todas en verde y un
  código de salida 4 que no significaba nada. **Regla: `astro preview stop`
  antes de lanzar el humo**, y si un barrido se cae sin un solo `✗`, mira si
  hay un servidor tuyo dando vueltas antes de buscar el fallo en el sitio.

  **Y lo contrario también rompe: dos guiones que levantan servidor, a la
  vez.** Cada uno para cualquier `astro preview` al arrancar, incluido el del
  otro, y el que iba primero se cae a media pasada con `ERR_CONNECTION_REFUSED`.
  Pasó el 24 de septiembre de 2026 al lanzar un humo mientras corría el suelo:
  fallos fantasma en páginas que estaban bien. Desde el 26 los cinco guiones
  que abren el navegador arrancan el servidor con el mismo `servidor.mjs`, y
  la regla es corta: **mientras corre el suelo, no se lanza nada que abra un
  navegador.**

  **Y una tercera forma de rojo que no es del sitio**, vista el mismo día: una
  página suelta que falla con `ERR_NETWORK_ACCESS_DENIED` a media barrida, con
  las 4.183 líneas restantes en verde. No era la página —abierta a mano
  devuelve 200, sus siete ejercicios y cero errores de consola—, era un
  tropiezo de red del propio navegador. **Cómo distinguirlo de un fallo de
  verdad, y es rápido:** un fallo del sitio se repite; uno de entorno no. Si
  el rojo es una sola página y su mensaje es de red y no de contenido, ábrela
  a mano antes de tocar nada. Lo que **no** vale es dar el barrido por bueno
  sin comprobarlo: eso es cómo se aprende a ignorar un guardián (§11).

- **El humo abre una muestra rotatoria de exámenes elegida por el día del año,
  así que un fallo latente aparece cualquier mañana sin que nadie haya tocado
  nada.** El 31 de agosto de 2026 el CI se puso rojo con el suelo local en
  verde: le tocó el turno a `2015-2016-ext`, cuya figura del semicírculo tenía
  dos etiquetas fuera del `viewBox` **desde el día que se escribió**. El commit
  que lo destapó era de Fluidos y no tenía nada que ver.

  Dos consecuencias prácticas. Una: **un CI rojo no significa que lo tuyo esté
  mal** — mira qué página falla antes de tocar tu cambio. Y dos: el verde de
  `npm run suelo` cubre la muestra de hoy, no el sitio entero; **para eso está
  `npm run humo:todo`**, y conviene pasarlo una vez por tanda de
  trabajo, no una vez por commit.

- **Un guardián puede dar verde sobre menos sitio del que dice, y eso no se ve
  nunca.** El filtro con el que `humo.mjs` elige qué páginas abrir decía
  `\/[a-z]+\/` para el nombre de la asignatura — **sin guion**. Las dos
  asignaturas cuyo `slug` lo lleva, `fundamentos-quimicos` e
  `ingenieria-termica`, no casaban jamás. Medido el 7 de septiembre de 2026
  sobre una barrida completa: **169 páginas abiertas, cero de Térmica y
  ninguno de los diez temas de Química**. Los veinte temas y las tres rutas
  de las dos asignaturas más nuevas del sitio **no los había abierto un
  navegador nunca**, y la barrida terminaba con «Navegador: en verde».

  Lo que lo hace peor que un fallo normal es que **no falla**: no hay rojo que
  investigar, solo un verde más barato de lo que parece. Y se coló por el
  sitio donde uno menos mira, que es la línea que elige el trabajo, no la que
  lo hace.

  Dos cosas salen de aquí. Una: **desde hoy la barrida imprime cuántas páginas
  abre de cada asignatura**, porque un cero en esa línea delata el agujero sin
  que tenga que fallar nada — es la comprobación que hoy habría bastado. Y
  dos, la regla general: **cuando un guardián recorre un conjunto, el tamaño
  de ese conjunto es un dato tan publicable como su resultado**, y hay que
  mirarlo. «Ha pasado» no significa nada si no sabes sobre cuántos.

  Y una tercera, de método, que costó una barrida entera: al arreglarlo,
  anclar el otro filtro —el de los índices `…/examenes/`— con `^` lo dejó en
  **cero exámenes**, porque `/algebra/examenes/` tiene dos segmentos y no uno.
  De 169 páginas a 90. **Un arreglo que cambia cuántas cosas mira el guardián
  se comprueba contando otra vez**, no leyendo el `diff`.

  **Y el 10 de septiembre de 2026 volvió a pasar en su forma más difícil de
  ver: la exclusión estaba razonada, y lo que había caducado era el motivo.**
  El filtro dejaba fuera los cuatro índices `…/examenes/` con este comentario
  al lado: «no entra, no tiene ejercicios». Era verdad. Pero un ejercicio no
  es lo único que se puede publicar mal, y ese día aparecieron ahí **siete
  marcas de negrita en crudo** —el `lede` de cada ruta se pinta dentro de un
  `<a>`, donde `mate()` no cabe—. Cuatro páginas que la portada enlaza, que un
  alumno abre, y que **ningún navegador había abierto nunca**, con la barrida
  diciendo «en verde» sobre 192. De 192 a 196, contadas otra vez y con la
  subida repartida como debía: una por asignatura, salvo Térmica, que no tiene
  índice de exámenes porque no tiene exámenes.

  La regla que sale, ya con dos casos y en su forma corta: **cuando excluyas
  algo de un guardián, el comentario dice qué clase de fallo no puede tener
  eso que excluyes** — no «no hace falta mirarlo». Escrito así, el día que
  aparece otra clase de fallo el comentario se relee solo. Escrito como
  estaba, la exclusión sobrevive a su motivo y nadie la vuelve a mirar.
- **`| tail` en un guardián largo te quita justo la línea que hay que leer.**
  El recuento de páginas que la regla de arriba manda mirar lo imprime
  `humo.mjs` **al principio**, antes de abrir nada. El 11 de septiembre de 2026
  se lanzó la barrida completa con `| tail -40` para no llenar la pantalla, y
  eso hizo dos cosas a la vez: guardar solo las últimas cuarenta líneas de
  4.866 —tirando el recuento— y **no mostrar nada durante veinte minutos**,
  porque `tail` no emite hasta que el proceso muere. Veinte minutos sin saber
  si el guardián avanzaba o estaba colgado, y al final un verde sin el dato que
  lo hace verificable. Hubo que repetir la barrida entera.

  **Regla: la salida de un guardián largo va a un fichero completo**
  —`node scripts/humo.mjs > salida.txt 2>&1`— y de ahí se leen las dos puntas:
  el `head` para el tamaño del conjunto y el `tail` para el veredicto. Nunca
  se poda por el camino, porque lo que se poda es siempre el principio y el
  principio es donde está el recuento.
- **Insertar delante de un elemento de lista YAML deja su campo huérfano.** Si
  un elemento es `- id: X` seguido de su `nota:`, y sustituyes solo la línea
  `- id: X` por «`- id: X` + tu nota + tu elemento nuevo», la `nota` original
  queda pegada al **último** elemento insertado, que ya tiene la suya: clave
  duplicada. Pasó tres veces el 28 de agosto de 2026. `js-yaml` lo caza —el
  build falla con «duplicated mapping key» y la línea exacta—, pero se tarda
  menos en evitarlo: **para insertar antes de un elemento, ancla la sustitución
  en el elemento anterior completo, con su `nota`, no en la línea del `- id:`.**
- **El prefijo `ex` de un id de examen no es una costumbre: está escrito dentro
  de un guardián.** La regla de convocatorias huérfanas de `verify.mjs` busca
  los ids con `/id:\s*(ex[a-z0-9-]+)/`, así que un ejercicio de examen cuyo id
  no empiece por `ex` **no existe para ella**. Salió el 10 de septiembre de
  2026 al montar la primera convocatoria de Térmica: sus siete ejercicios
  llevaban el prefijo de tema, `ejter-`, porque hasta ese día colgaban de su
  tema y no de una convocatoria, y el guardián dio «sus **0** ejercicios no los
  enlaza ninguna ruta» sobre una convocatoria cuyos siete estaban enlazados.
  Renombrados a `exter2526-ord-<n>-…`, que es la forma de las otras 118. **La
  lección no es el prefijo: es que una convención que un guardián da por
  supuesta hay que escribirla donde se lea**, porque el día que se rompe el
  mensaje de error habla de otra cosa.
- **Un id de ejercicio inventado suena igual que uno real.** Los ids llevan el
  curso, la convocatoria y el número, así que `ex2021-ext-3-el-polinomio-de-taylor`
  parece correcto y el real era `ex2021-ext-3-el-mclaurin-de-una-integral-sin-primitiva`.
  Si el ejercicio ya está enlazado desde otra ruta no aparece en la lista de
  sueltos, y es justo entonces cuando se tiende a escribirlo de memoria. **El
  id se copia del `ejercicios.yaml`, siempre.** El build lo caza —«referencia el
  ejercicio X, que no existe»—, pero una ruta enlazando el ejercicio equivocado
  **no lo caza nadie**, y eso es §13 caso 2.
- **~~El esquema no tiene `unidad`~~ · resuelto el 30 de agosto de 2026.** Lo
  que entró no es un campo `unidad` sino un **tipo de respuesta**,
  `magnitud`, con su lector en `src/lib/unidades.ts` y 20 casos en
  `tests/unidades.test.ts`. La diferencia importa: un campo `unidad` al lado
  de un número compara textos —«1 bar» y «100 kPa» serían respuestas
  distintas, y «2 m/s» valdría como caudal—; un tipo propio compara **por
  dimensión**, convirtiendo las dos a unidades base del SI.

  Tres decisiones que conviene no volver a discutir:

  1. **La tolerancia de `magnitud` es relativa** (0,02 = 2 %), al revés que
     en los otros tipos. Lo pide el ábaco de Moody: media respuesta de
     fluidos sale de leer una curva a ojo, y exigir cuatro cifras es exigir
     que el alumno y quien escribió el ejercicio lean el mismo píxel.
  2. **Tres errores, tres diagnósticos.** Número bueno sin unidad (descuido),
     unidad de otra magnitud (confusión conceptual, la grave) y número malo
     no son el mismo fallo, y el comparador devuelve cuál ha sido. Los dos
     primeros mensajes están en `EjercicioGuiado.astro` y **no hay que
     declararlos como distractor en cada ejercicio**.
  3. **Si la respuesta es adimensional, el tipo es `numero`.** Un Reynolds o
     un rendimiento no llevan unidad, y el esquema rechaza una `magnitud`
     sin unidad precisamente para que nadie la use como número con adorno.

  Y dos cosas que la tabla de unidades tiene que saber de **esta** escuela,
  porque no son estándar:

  - **`kg/cm²` es una presión**, no una masa por unidad de área: ese «kg» es
    un kilopondio, igual que el «pesa 50 kg» del tema 1. Los enunciados la
    usan sin avisar («la lectura del vacuómetro es de 0,4 kg/cm²»). Está como
    unidad compuesta, no como regla general, para no romper una densidad
    superficial de verdad el día que aparezca.
  - **La gravedad de la tabla es 9,8, no 9,80665.** Es la que usan los
    apuntes y todas las soluciones oficiales, y con ella salen exactamente
    sus conversiones publicadas: 1 mca = 9800 Pa, 1 kg/cm² = 10 mca,
    1 bar = 10,2 mca. Con la estándar la tabla quedaría descuadrada respecto
    de la fuente por un 0,07 %.

  La tabla se amplía cuando un enunciado trae una unidad que no está, y eso
  **lo caza el contenido, no la revisión**: al escribir el tema 2 seis
  respuestas correctas salieron «no he entendido» porque faltaba el
  poiseuille. Cuando pase, se añade la unidad **y su caso en
  `tests/unidades.test.ts`**.
- **`pdftotext` sin `-enc UTF-8` se come los signos.** Los exámenes escritos con
  el editor de ecuaciones de Word ponen el menos, el ≤ y el ∈ en fuente
  **Symbol**, y con la codificación por defecto salen como un espacio: el
  volcado dice `|z| = |1  z|` y no hay forma de saber si era suma o resta. Con
  `-enc UTF-8` aparece `1 − z`. Pasó el 26 de agosto de 2026 en la
  extraordinaria de 2017-2018, donde las dos lecturas daban respuestas
  distintas y las dos eran plausibles. Y renderizar la página **no** lo
  arregla: si la máquina no tiene la fuente Symbol, `pdftoppm` tampoco dibuja
  el signo, y encima avisa con un `Syntax Error: No display font for 'Symbol'`
  que es fácil dar por ruido. **Regla: el volcado de un examen se hace siempre
  con `pdftotext -enc UTF-8 -layout`, y la imagen se usa para la disposición,
  no para los signos.** Y al revés para los boletines con matrices: el volcado
  de texto destroza las matrices y la imagen las conserva; ahí manda la
  imagen y el texto solo sirve para los signos.
- **Una tilde dentro de `$…$` se dibuja, y avisa en cada build.** KaTeX pinta
  perfectamente `P_{útil}` o `k_{válv}` —no hay error, no queda ningún `$`
  suelto, el suelo da verde— pero emite un `unicodeTextInMathMode` por consola
  cada vez que se compila, y ese ruido tapa a los avisos que sí señalan algo
  roto. El 4 de septiembre de 2026 había **22 repartidos por nueve ficheros**.
  El arreglo es `P_{\text{útil}}`, que además es la tipografía correcta: un
  subíndice que es una palabra va en redonda, no en cursiva.

  Lo caza `revisa-ejercicios.mjs` desde ese día, y **la forma de cazarlo tiene
  su propia lección**: se hace **escuchando a KaTeX** —interceptando su
  `console.warn`— y no emparejando `$` con una expresión regular. La versión
  de regex daba 34 falsos positivos sobre el corpus entero, todos de prosa
  atrapada entre dos fórmulas distintas de la misma línea. Es el mismo error
  que §17 ya avisa para `grep`: **no adivines la estructura, pásala por el
  procesador de verdad.**
- **El símbolo del euro no se puede dibujar dentro de una fórmula.** KaTeX
  tiene sus propias fuentes (§07) y el `€` no está en ellas: ni suelto ni
  dentro de un `\text{…}`. Pasó el 31 de agosto de 2026 con un coste de
  bombeo escrito como `\text{€/m}^{3}` en dos sitios del mismo ejercicio.
  Lo caza `verify.mjs` —«KaTeX no sabe dibujar ese símbolo dentro de $…$»—
  pero cuesta un suelo entero: **la unidad monetaria se saca de la fórmula
  y se dice en la prosa de al lado** («Es decir, 0,0434 €/m³»). Vale para
  cualquier símbolo que no sea matemático.
- **En el pie de una figura no hay fórmulas.** Dentro de un `<figure>` el
  procesador deja pasar el HTML tal cual, así que un `$h$` en el
  `<figcaption>` se publica **con los dólares a la vista**. Lo curioso es que
  el **negrita sí funciona** —`**así**` sale como `<strong>`—, y eso engaña:
  se prueba una cosa, se ve que va, y se da por hecho que va todo. Hay un
  guardián en `verify.mjs` que lo caza, y aun así costó un suelo el 1 de
  septiembre de 2026 escribiendo las primeras figuras de ejercicio de
  Fluidos. **Regla: en un pie, las variables van en negrita o en texto
  llano** —«la cota **h**», «respecto de O»—, y la fórmula, si hace falta, en
  la prosa de fuera.
- **Un `var(--token)` que no existe no da error: pinta negro.** Es peor que un
  color literal, porque el literal al menos se ve y `verify.mjs` lo cazaba
  desde el principio. Un token inventado invalida la declaración, la propiedad
  cae a su **valor inicial** —y el inicial de `fill` es negro—, así que la
  figura sale bien en claro y en oscuro deja las etiquetas en negro sobre
  fondo casi negro. El 1 de septiembre de 2026 había **148 usos de
  `--ink-suave` y `--linea`, ninguno de los dos definido**, repartidos por 22
  de las 23 figuras de Fluidos. Lo caza la regla **2 ter** de `verify.mjs`
  desde ese día, y esa regla mira también los `.yaml` porque ahí viven las
  176 figuras de ejercicio de Cálculo. **Regla: un token nuevo se define en
  `tokens.css` antes de usarlo, y si ya existe uno que significa lo mismo, se
  usa ese** — dos nombres para un color es la Regla 0 con otra cara.
- **«No encaja en el formato» es la razón más fácil de escribir y la que menos
  se revisa.** El ejercicio 9 de la ordinaria de Fluidos 2025-2026 —un
  «rellenar los espacios» de ocho huecos sobre turbomáquinas— llevaba en
  `fuera` desde que entró la convocatoria, con el motivo «sin ningún cálculo, y
  el esquema exige un paso de cálculo». Era verdad y estaba mal pensado por dos
  sitios: un paso de cálculo puede **contar** en vez de operar, y sobre todo
  **el propio enunciado traía una cuenta** que nadie había mirado — avisa de
  que cada fallo resta lo mismo que suma un acierto, y de ahí sale cuándo
  compensa dejar un hueco en blanco, que es lo más útil del ejercicio.

  **Regla: un `fuera` cuyo motivo sea de formato y no de material se relee
  entero antes de darlo por bueno**, y se relee el enunciado, no el motivo.
  Los motivos de material —falta una tabla, falta una figura acotada, la
  respuesta publicada no se reproduce— envejecen bien porque describen algo
  ausente; los de formato describen una limitación **nuestra**, y esas cambian.

  Al aplicarla al resto de los `fuera` de Fluidos solo había otro caso, el
  ejercicio 7 de 2020-2021, y ese sí se queda: su enunciado no trae ninguna
  cuenta ni escondida. Su motivo también estaba mal escrito —daba una razón
  que no era la buena— y se ha corregido. **Que la regla nueva confirme un
  «no» es tan resultado como que desbloquee un «sí»**; lo que no vale es no
  volver a mirar.

- **Un fichero sin extensión no sale en ninguna búsqueda por tipo, y ahí puede
  haber una convocatoria entera.** El 5 de septiembre de 2026 se dio por
  cerrado el inventario de exámenes de Química en cinco, encontrados con un
  `find … -iname "*.pdf"`. Horas después, rastreando otra cosa, apareció un
  fichero llamado **`1C_Control` a secas** —sin `.pdf`— que era una sexta
  convocatoria completa: cinco ejercicios, diez puntos, y el único ejercicio
  de todo el corpus que pide un ciclo de Born-Haber.

  **Regla: el inventario de una asignatura se cierra listando el directorio
  entero**, no buscando por extensión, y comprobando el tipo real de lo que no
  encaje —`file` lo dice por el contenido, no por el nombre—. Es barato y el
  coste de saltárselo es publicar una asignatura a la que le falta un examen
  sin que nadie lo eche en falta.

  Y de propina destapó dos frases falsas publicadas —«cae en las cinco
  convocatorias» en el catálogo, «abre los dos exámenes» en otro tema—, las
  dos escritas a ojo y una de ellas falsa ya el día que se escribió. Es la
  cuarta vez que este proyecto se come lo mismo, así que conviene decirlo en
  su forma más corta: **si una frase publicada lleva un número, ese número se
  cuenta con un guion antes de escribirlo.**

- **La `e` de `1.8e-5` se leía como el número de Euler, y no daba error: daba
  otro número.** El lector de respuestas evaluaba `1.8e-5` como
  $1{,}8 \times e - 5 = -0{,}107$, un valor perfectamente finito. Así que un
  alumno que escribía la constante de acidez **bien** recibía «no es
  correcto» y ninguna pista de por qué. En Química eso no es un caso raro: es
  cómo se teclea toda Ka, Kb, Kp y Kw.

  Y lo peor no es el fallo, es cómo se llegó a él. **El mismo bug se había
  arreglado esa misma mañana en `recalcula.mjs`** —el potencial normal
  `E^{0} = 0{,}249` se leía como Euler y daba un desajuste falso— y se
  arregló allí sin barrer los demás evaluadores. Allí producía un aviso falso
  a quien mantiene el proyecto; aquí rechazaba la respuesta buena de un
  alumno. **Regla: al arreglar un fallo de interpretación de texto, se busca
  el mismo patrón en todos los sitios que interpretan texto** —hay cuatro:
  `regiones.ts`, `complejo.ts`, `unidades.ts` y `recalcula.mjs`— y se dice en
  el commit cuáles se han mirado.

  El arreglo, en el lexer de `regiones.ts`: el exponente se consume solo si
  tras la `e` viene un signo opcional y **al menos un dígito**, así que `2e3`
  es 2000 y `2e` sigue siendo $2e$. Con ocho casos en
  `tests/respuesta-exacta.test.ts`, validados al revés.

  Y el barrido que la regla exige, hecho el mismo día y con su resultado:

  | lector | con `1.8e-5` | veredicto |
  |---|---|---|
  | `evaluaNumero` (`regiones.ts`) | daba **−0,107** | era el fallo · arreglado |
  | `leeComplejo` (`complejo.ts`) | devuelve `null` | falla **limpio**, y el `?? evaluaNumero` lo recoge |
  | `leeMagnitud` (`unidades.ts`) | lo lee bien | correcto ya |
  | `leeVector` · `leeMatriz` (`algebra.ts`) | devuelven `null` | limitación real, **demanda cero** |

  Los dos de Álgebra no se tocan, y eso es §13 y no pereza: sus respuestas son
  objetos exactos y no hay ni un decimal en su corpus (§11). Se arreglan el
  día que un ejercicio lo pida, no antes.

- **El esquema puede ser más estricto que el sitio, y entonces no protege
  nada.** Salió con lo anterior. `EjercicioGuiado` lee una respuesta numérica
  con `leeComplejo(t) ?? evaluaNumero(t)`, dos lectores en cadena; el
  `lector()` de `content.config.ts` llamaba **solo al primero**. Resultado:
  el build rechazaba respuestas que el navegador habría aceptado, y el aviso
  —«la respuesta correcta no se puede leer con el formato declarado»— sonaba
  a error de contenido cuando el contenido estaba bien.

  Cuesta encontrarlo porque el guardián falla en la dirección que parece
  segura: de más. **Regla: un guardián que simula al producto tiene que
  llamar exactamente a lo que llama el producto**, y si el producto encadena
  dos lectores, el guardián encadena los dos. Si los dos códigos divergen,
  eso ya es la Regla 0 (§01) con otra cara.

- **Un `<path>` sin `fill="none"` se rellena de negro, y solo se nota cuando
  el camino tiene codo.** El relleno por defecto de un `path` es negro, no
  transparente, y SVG cierra el contorno para rellenarlo aunque el camino
  esté abierto. Una flecha recta —`M235 40 L235 62`— no encierra área y no se
  ve nada; una flecha en ángulo —`M150 25 L92 25 L92 62`— encierra un
  triángulo, y ese triángulo sale pintado de negro sobre el papel. Pasó el
  5 de septiembre de 2026 en el árbol de decisión del tema 4 de Química:
  cuatro cuñas negras enormes tapando media figura, con `verify` en verde,
  el `viewBox` sin desbordes y todos los tokens definidos.

  Lo que lo hace traicionero es que el resto del corpus se libró por
  casualidad: las figuras anteriores usan `path` con codo solo dentro de un
  `<g fill="none">`, o para flechas rectas. **Regla: un `<path>` con `stroke`
  declara su relleno —propio o heredado de su `<g>`— siempre que pueda
  encerrar área**, y no se confía en que la forma sea recta hoy. Se caza
  mirando la captura, no midiendo: no hay error, no hay desborde y no hay
  token inventado.

  Lo caza `verify.mjs` desde ese día, regla **2 quater**, y **escribirlo
  costó dos rondas de falsos positivos que conviene tener anotadas**, porque
  las dos son la misma lección de §11 por sus dos lados. La primera versión
  miraba solo la etiqueta del `path` y dio nueve avisos, los nueve falsos:
  las figuras grandes de Cálculo agrupan sus curvas en un `<g fill="none">` y
  **el relleno se hereda**. Corregido con una pila de ancestros, quedaron
  seis, también falsos y por el motivo contrario: un trazo de un solo
  segmento recto, o varios sueltos separados por `M`, **no encierra área** y
  el relleno negro no pinta un píxel. La regla final solo avisa de un
  subcamino con curva, con cierre o con dos segmentos encadenados.
- **Un encabezado con LaTeX dentro produce un ancla que ninguna ruta puede
  enlazar.** `## El teorema $\pi$ de Vaschy-Buckingham` genera el id
  `el-teorema-πpiπ-de-vaschy-buckingham` —la salida de KaTeX es
  `htmlAndMathml` (§07), así que el símbolo dibujado, el texto y el MathML
  entran los tres en el slug—, y el esquema de `preparar` rechaza ese slug
  porque `π` no está en su clase de caracteres. El fallo no se ve en la
  página, que se dibuja perfecta: se ve el día que una ruta intenta apuntar
  ahí. Salió el 1 de septiembre de 2026 al escribir la ruta de Fluidos.
  **Regla: los `##` y `###` se escriben en texto plano.** Si hace falta el
  símbolo, va en la primera línea del apartado, no en su título — que es lo
  mismo que §17 ya pide para `titulo` y `fuente`, por el mismo motivo de
  fondo: **todo lo que se convierte en identificador es texto plano.**
- **El `$$` de una fórmula en bloque va en su propia línea, siempre.** El
  procesador de §07 dibuja esto:

  ```
  $$
  a = b + c
  $$
  ```

  y **no** dibuja `$$ a = b` en una línea con `= c $$` en la siguiente: ahí
  el primer `$$` se lee como dos delimitadores en línea, KaTeX se come el
  cierre y la fórmula se publica como texto crudo. El 2 de septiembre de 2026
  entraron así **27 fórmulas** en cinco ejercicios y tumbaron el suelo entero
  —doce minutos— con `verify.mjs` diciendo «LaTeX que ha salido como texto».
  Lo curioso, y lo que engaña: en **una sola línea** `$$ a = b + c $$` sí se
  dibuja, así que probar un caso corto no demuestra nada. El corpus entero
  usaba ya la forma con valla —cero apariciones de la otra en seis ficheros
  mirados— y esto fue romper la convención sin darse cuenta.

  Desde ese día lo caza `scripts/revisa-ejercicios.mjs`, que pasa cada campo
  de prosa por el procesador de verdad y mira si KaTeX ha devuelto un error:
  un segundo, contra los doce minutos del suelo. Validado al revés con el
  bloque original, que sale rojo en las tres fórmulas.

  > **Y hay dos formas de que una fórmula no se dibuje, no una.** La regla
  > vieja de `verify.mjs` buscaba un `$` suelto en el texto publicado, que es
  > lo que queda cuando el LaTeX **no llega** a KaTeX. Pero si llega y KaTeX
  > no sabe dibujarlo, no queda ningún `$`: queda un `katex-error`, o sea un
  > recuadro rojo con el LaTeX dentro, que es peor porque parece deliberado.
  >
  > Esa segunda forma no la miraba nadie. Al añadirla —3 de septiembre de
  > 2026— aparecieron **dos fallos que llevaban semanas publicados** con el
  > suelo en verde todas ellas: un `\boxed{` sin cerrar en una resolución de
  > Álgebra y un `$$…$$` partido en dos líneas en un examen de Cálculo.
  > Barridos los 22 228 campos con fórmula del contenido entero, eran los
  > únicos dos. Están arreglados y la comprobación vive ya en `verify.mjs` y
  > en `revisa-ejercicios.mjs`.
  >
  > La lección de método: **al escribir un guardián, comprueba que mira donde
  > está el fallo.** La primera versión de `revisa-ejercicios.mjs` recorría
  > los `texto` de las opciones y las piezas pero no sus `mensaje`, y el fallo
  > que motivó todo esto vivía justo en un `mensaje`.
- **`history.replaceState` no actualiza `:target`.** Es la trampa que produjo
  el único fallo grave de la auditoría externa del 4 de septiembre de 2026.
  La portada mostraba el detalle de una asignatura con
  `.detalle:target { display: block }` y cambiaba el hash con `replaceState`
  para no ensuciar el historial. Pero `:target` lo fija el navegador al
  navegar, y `replaceState` **no navega**: quien entraba en `…/#algebra` y
  pulsaba después otra asignatura veía **las dos a la vez**, y al volver se
  quedaba con la portada en blanco porque el héroe seguía oculto por la
  misma regla. Entrando **sin** hash no hay ningún `:target` y todo funciona,
  que es por lo que aguantó semanas sin que nadie lo viera.

  **Regla: si el JavaScript gobierna qué se ve, `:target` es solo el plan B
  de quien no tiene JavaScript, y las dos cosas no pueden mandar a la vez.**
  Se separan con un marcador que **ponga el script** —aquí `data-js` en la
  escena—, nunca con un atributo que ya venga en el HTML servido: ese lo
  tienen los dos casos y no distingue nada.
- **`titulo` y `fuente` son texto plano, sin `$…$`.** Un `(matriz $A_1$)` en
  la fuente de siete ejercicios paró el despliegue el 30 de agosto de 2026:
  `verify` lo lista como «LaTeX que ha salido como texto». Subíndice en
  Unicode (A₁) o sin subíndice; la fórmula va en `enunciado`.
- **Ninguna construcción de markdown que necesite sus saltos de línea
  sobrevive dentro de un escalar plegado de YAML.** La regla general, con sus
  dos casos vividos: una **cita** pierde todos sus `>` menos el primero, y una
  **tabla** se publica como un párrafo lleno de barras verticales. La segunda
  pasó el 9 de septiembre de 2026, con una tabla de seis duraciones en la ruta
  de Térmica, **el mismo día en que se documentó la primera** — y se vio igual:
  mirando la página, con `verify` y los 1.616 tests en verde. Si el campo
  necesita saltos, o se escribe en prosa o el escalar pasa a literal (`|-`).
  Lo cuenta la sección 9 de `deuda.mjs`, que mira las dos formas.
- **Una cita de markdown dentro de un escalar plegado de YAML publica sus
  «>».** El `>-` de YAML une las líneas con un espacio, así que de un
  blockquote de cinco renglones markdown solo lee el primer `>` y **los otros
  cuatro salen como texto**, en mitad de la frase: «que los dos ejercicios >
  «no tienen resolución guiada» y que «el tema 6 > todavía no está escrito»».
  Estuvo publicado así en la ruta de la tercera de Cálculo hasta el 8 de
  septiembre de 2026, y lo cazó **mirar la página**, no un guardián: `verify`
  y los tests estaban en verde. **Regla: dentro de un campo de ruta, las
  correcciones se escriben en el propio párrafo con `**~~…~~ · resuelto el
  …**`, que es como las escribe el resto del proyecto — no como cita.** Si de
  verdad hace falta una cita, el campo tiene que ser un escalar literal
  (`|-`), que conserva los saltos.

  Y una nota sobre cómo buscarlo, porque el primer intento fue peor que no
  buscar: en el HTML publicado un `>` suelto **no se distingue** de un «mayor
  que» de una fórmula, y la búsqueda daba 197 aciertos en `h > f` antes de
  llegar a uno real. Se busca en el origen. Está en la sección 9 de
  `deuda.mjs`.
- **Un rótulo destacado que dice lo contrario que el párrafo de debajo gana,
  porque es el que se lee.** El suelo de Fluidos publicaba «Cae 11 de 16 años»
  sobre un `porque` que decía «cero de once»; se corrigió el 7 de septiembre
  de 2026 **sin mirar si estaba en más sitios**, y el 8 apareció igual en los
  **dos** suelos de Álgebra, con «Cae 8 de 8 años» sobre «cero de treinta y
  dos». El origen es un supuesto del esquema: `invariante.anios` se llenaba
  con «en cuántas convocatorias se **usa**» cuando el campo cuenta en cuántas
  **cae como ejercicio propio**, y para un suelo esa respuesta es cero. Con
  cero, la página ya escribe «No cae solo, está dentro de las N».

  **Regla: cuando arregles una contradicción entre un rótulo y su texto,
  búscala en las demás asignaturas antes de darla por cerrada** — y si
  reaparece, el arreglo no es la tercera corrección sino un guardián. El de
  este caso es la sección 7 de `deuda.mjs`, y busca un patrón estrecho a
  propósito: «cero de ‹número›» sin un `para` detrás, dentro de un bloque con
  `anios > 0`. La primera versión buscaba «ninguno» a secas y daba 26 avisos
  de 110 bloques, casi todos falsos: **un guardián que acierta 2 de 26 se
  aprende a ignorar, y eso es peor que no tenerlo** (§11).
- **Un campo que se pinta sin pasar por `mate()` publica los asteriscos.**
  `invariante.fuente` se pintaba en crudo justo debajo de un `porque` que sí
  se renderiza, así que el lector veía énfasis en un párrafo y `**esto**` en
  el siguiente. Nadie lo metió por descuido: el campo nació sin renderizar y
  quien escribía suponía —razonablemente— que se portaba como su vecino.
  Corregido en la plantilla el 8 de septiembre de 2026, que arregla de una vez
  las seis marcas que había en tres asignaturas. **Antes de escribir markdown
  en un campo nuevo, mira en la plantilla si ese campo pasa por `mate()`**; y
  si escribes uno nuevo que es prosa, hazlo pasar.

  **Y pasó tres veces en tres días, así que a la tercera dejó de ser una
  corrección y pasó a ser un guardián.** El 9 fueron las meta descriptions
  —cinco páginas publicando `content="…y **son dos parciales el mismo
  día**…"` en el buscador y al compartir el enlace—; el 10, el `lede` del
  índice de exámenes, **siete marcas a la vista** en Álgebra y en Cálculo con
  las dos asignaturas cerradas y el suelo en verde. Las tres se encontraron
  mirando el HTML publicado, ninguna con un guardián.

  De ahí salen dos cosas. Una, que **hay huecos donde `mate()` no cabe**: un
  atributo, o un resumen dentro de un `<a>` —devolvería un `<p>` metido en un
  enlace—. Para esos está `sinMarcas()` en `lib/markdown.mjs`, que quita el
  énfasis y el código en línea y nada más; estaba escrito en línea dentro de
  `Base.astro` y se extrajo el 10 de septiembre porque el segundo sitio que lo
  necesitaba no lo tenía, que es la Regla 0 exacta. Y dos, el guardián: la
  regla **«cero markdown sin dibujar en el texto publicado»** de `verify.mjs`,
  hermana de la del LaTeX crudo. Solo mira `**…**`, a propósito —un asterisco
  suelto es legítimo—, y quita el `<style>` además del `<script>`: el primer
  barrido dio **401 aciertos y los 401 eran comentarios de CSS y de JS**.
  Validada al revés quitando el arreglo: siete rojos, los siete reales.

- **La tolerancia de una respuesta `numero` es absoluta, y un `0.02` escrito
  ahí no significa un 2 %.** La de `magnitud` es relativa (§17, más arriba) y
  la de `numero` no, y la costumbre de escribir `0.02` pasa de un tipo al otro
  sin que nada se queje. En un Reynolds de 5.704 eso es pedirlo a la
  centésima: **la página rechaza la cuenta exacta**, 5.701, y solo acepta a
  quien teclee el redondeo del corpus. Lo encontró el 12 de septiembre de 2026
  el recálculo de Térmica en tres pasos de examen —dos Reynolds y un Nusselt—,
  con el esquema, los cuatro guardianes y la barrida completa en verde: ninguno
  mira si una casilla acepta la respuesta buena, solo si rechaza las malas.

  Su hermana, en el mismo pase: una tolerancia de `magnitud` **estrechada para
  echar un distractor** dejaba fuera la cuenta buena, porque los datos
  redondeados del paso anterior no fijaban el resultado mejor que al 0,8 % y
  el distractor quedaba a otro 0,8 %. **Regla: una tolerancia se elige por lo
  que el enunciado deja calcular, no por el distractor.** Si el distractor
  queda más cerca que eso, el que sobra es el distractor —o falta dar un dato
  en la pregunta—, no la tolerancia.

  Donde las respuestas son exactas y no hay calculadora —Cálculo, Álgebra,
  Química— una tolerancia estrecha es lo correcto. Medido ese día, en Térmica y
  en Fluidos: cuatro casos en Térmica, corregidos, y tres en Fluidos que
  quedaron anotados en `tasks/manana.md`. **Se corrigieron esa misma noche**,
  mirando cada paso con su cuenta exacta y no con la regla: los tres
  rechazaban la cuenta buena —59,85 frente a 60, 137,8 frente a 138 y 790,3
  frente a 791, los tres con 0,02—, y un cuarto, la k del 4.22, la aceptaba
  por siete milésimas. De las nueve casillas que da la búsqueda por la forma,
  las otras cinco son estrechas con motivo: sus datos fijan el resultado a esa
  precisión y la cuenta exacta cae dentro. **Que una tolerancia sea estrecha
  no la hace mala; lo que la hace mala es que deje fuera la cuenta exacta.**

- **`evaluaNumero` lee «, » como un espacio, y el espacio como un producto.**
  Es lo que permite escribir `2 pi` o `3 sqrt(2)`, y tiene su precio: «(1, 3)»
  vale 3, «(2, −1)» vale 1 y «(1, 2, 0, 1)» vale 0. Lo destapó el 26 de
  septiembre de 2026 unificar los lectores del navegador y del esquema en
  `lib/numero.ts`: la regla de «distractores confundibles» se aplicaba también
  a los vectores, que el lector binómico devolvía como `null`, y con el
  encadenado dos vectores distintos pasaron a ser el mismo número. **Regla: una
  comprobación que lee con el lector numérico dice para qué tipos es**, y un
  vector o una matriz se leen con el suyo. Y queda una holgura sabida en las
  respuestas `numero`: quien escriba un par donde se pide un número puede
  acertar por casualidad. Es rara, y no se ha visto en ningún ejercicio.
- **Zod no corre las reglas de un objeto al que le falta un campo
  obligatorio.** Un `.refine` se evalúa sobre un objeto que ya ha pasado su
  forma; si falta `titulo` o `desarrollo`, el error sale por eso y la regla ni
  se mira. Importa al **validar al revés** (§11): el ejercicio de prueba con el
  fallo metido a propósito tiene que ser válido en todo lo demás, o el build
  falla por otra cosa y parece que la regla funciona. Pasó el 26 de septiembre
  de 2026: la primera prueba de la regla de distractores «falló» por un paso
  sin `titulo`, y solo al completarlo salió el aviso que se buscaba.
- **Un deslizador recorta su `value` contra el `max` que tiene EN ESE
  MOMENTO.** Si un preajuste escribe primero la posición y el código ensancha
  el tope después, el navegador ya la ha recortado sin avisar. Le pasó a la
  catenaria: «cable tenso» ponía la sección en x = 20 con el tope aún en 3, y
  medía en 3 o en 10 según qué se hubiera pulsado antes. **Regla: al aplicar
  un preajuste, primero los topes y después los valores.** El caso está en
  `comprueba-simuladores.mjs`.
- **Dos valores de un deslizador de paso 0,1 no se restan exacto, y un
  arreglo que se llama a sí mismo no para.** `2,4 − 2` da `0,3999…`: la
  comprobación «los apoyos a L/10 como poco» seguía siendo cierta después de
  corregir, la función de pintar se volvía a llamar para corregir otra vez, y
  la viga se congelaba con la pila desbordada. **Dos reglas: las comparaciones
  con valores de un mando llevan margen —`< minimo − 1e-9`—, y una corrección
  del estado se aplica una vez y se sigue, nunca con `return pinta()`.**

---

## 18 // Las decisiones que ya se dieron la vuelta

Siete reglas de este proyecto se escribieron con total confianza y estaban mal.
Van juntas aquí porque el patrón solo se ve cuando se miran a la vez; cada una
está razonada en su sección.

| § | decía | dice ahora | qué costó averiguarlo |
|---|---|---|---|
| 08 | reescribir los enunciados y cambiar los números | **verbatim, sin tocar un dígito** | el alumno no puede contrastar con el boletín |
| 08 | prohibido meter exámenes en PDF | **entran los oficiales**, son la fuente | una resolución sin su enunciado pide un acto de fe |
| 08 | nada de material propio | **ejemplos introductorios, marcados en el dato** | medir el corpus: no había por dónde entrar |
| 07 | MathML puro, que es nativo | **KaTeX dibujado en el build** | la fórmula salía distinta en cada ordenador |
| 09 | «entre el 30 y el 40 %» no es cálculo | **42,7 %**, sobre los 4.255 puntos de 88 convocatorias | medir dos veces: la primera, sobre 33 exámenes, dio 49,5 % |
| 14 | un bloque es una lista de material | **el escalón**, con su escalera | «con eso no hacemos que nadie aprenda nada» |
| 09 | (no se contemplaba) | **sin calculadora en Cálculo; con ella en Térmica y en Fluidos** | lo dijo el alumno; 128 respuestas a revisar, y una regla de Cálculo publicada como si fuera del sitio entero |

> Dos filas de esta tabla —el porcentaje y la calculadora— siguieron diciendo
> la versión vieja hasta el 26 de septiembre de 2026, semanas después de que su
> sección se corrigiera: la tabla de las decisiones que se dieron la vuelta no
> se había dado la vuelta a sí misma. Una tabla que resume otras secciones es
> una segunda copia (§01), y se relee cada vez que cambia lo que resume.

**Lo que tienen en común.** Ninguna era un descuido. Las siete optimizaban algo
razonable —evitar problemas de derechos, usar el estándar nativo, ser breve, no
duplicar— y en las siete el coste lo pagaba el alumno en un sitio donde no se
veía desde dentro del fichero.

De las siete, **dos salieron de medir** y cinco de mirar el resultado o de
saber algo del mundo que no está en el repositorio. Por eso §16 existe, y por
eso §13 manda declarar los supuestos en vez de resolverlos.

La regla que se saca, y es la más difícil de aplicar sobre uno mismo:

> Cuando una decisión te parezca obviamente correcta y puedas argumentarla bien,
> comprueba **a quién le sale gratis**. Si la comodidad es tuya y el coste es
> del alumno, es una de estas siete con otra cara.
