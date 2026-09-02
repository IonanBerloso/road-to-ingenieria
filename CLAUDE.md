# CLAUDE.md — Road to Ingeniería

Reglas de este repositorio. Léelas enteras antes de tocar ningún fichero.

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

**El orden: Cálculo entera, luego Álgebra.** Y sigue en pie lo único que
importaba de la regla vieja: **pocas excelentes antes que muchas a medias.** No
se abre una asignatura hasta que la anterior está terminada según §15.

> Hasta el 24 de agosto de 2026 esta sección decía **«Piloto: Cálculo y Mecánica
> de Fluidos»**, elegidas porque tensionan el sistema en direcciones opuestas —
> una abstracta y de gráficas, la otra física y de esquemas de instalación—, y
> prohibía abrir nada más hasta cerrar las dos. Se cambia por dos motivos y
> conviene que los dos queden dichos.
>
> El primero es que **el piloto ya ha rendido su diagnóstico sin escribir una
> línea de Fluidos**: sabemos exactamente dónde se rompe la capa compartida
> —`unidad` no existe en el esquema, la tolerancia es absoluta donde debería ser
> relativa, y `EjercicioGuiado` importa los lectores de complejos directamente—.
> Eso era lo que la segunda asignatura tenía que averiguar, y ya está averiguado.
>
> El segundo es de coste, y salió al medir el temario real: **Fluidos son 25
> temas**, la asignatura más cara de las nueve. Aprender sobre la más cara es
> justo al revés. Álgebra son cinco bloques y ocho exámenes, rompe la misma capa
> compartida por otro sitio —una **matriz** no es un número ni un conjunto de
> puntos— y se termina en semanas. Fluidos entra después, ya con el lector de
> respuestas separado del componente.
>
> Lo que **no** cambia: la segunda asignatura sigue eligiéndose porque tensiona
> el sistema por un sitio distinto, no porque toque en el temario.

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
    calculo/
      t01-complejos/
        index.mdx          la prosa del tema
        ejercicios.yaml    los ejercicios como DATOS
      examenes/
        2024-2025-1ev/     examen.yaml (reparto) + ejercicios.yaml
    fluidos/               todavía solo un README
    preparar/              una ruta de estudio por evaluación (§14).
                           Solo YAML: no enseña nada nuevo, ordena lo que
                           ya está y dice por qué en ese orden.
  components/
    patrones/              Lectura · EjercicioGuiado · ErrorTipico
    sim/                   PlanoComplejo (cálculo) y los cinco de fluidos:
                           AbacoMoody · PuntoFuncionamiento · PrismaDePresiones
                           SeccionDeCanal · GolpeDeAriete. Su física vive en
                           lib/ para poder probarla (§10), nunca dentro
    ui/                    Cabecera · Tema · Examen · Reparto
  layouts/
    Base.astro             el ÚNICO layout
  lib/                     markdown.mjs (el procesador, §07) · rutas.ts
                           complejo.ts y regiones.ts (lectores de respuesta)
  styles/
    tokens.css             el ÚNICO :root del repositorio
    base.css · print.css
  pages/                   index + [asignatura]/[tema] · examenes · preparar
scripts/
  verify.mjs               lee el HTML publicado (§11)
  humo.mjs                 lo abre en Chromium (§11)
  check-color.mjs          contraste y daltonismo
  leer-grafica.mjs · leer-curvas.mjs   comprobar una figura sin ojos
  recalcula.mjs            que las cuentas del corpus salgan (§11)
  revisa-ejercicios.mjs    lo que pide §04, comprobado ANTES de pegar el
                           bloque en el corpus: en un segundo, sin construir
  inventario-coleccion.mjs qué problemas de la colección faltan, cruzando el
                           volcado del PDF contra el corpus
  comprueba-simuladores.mjs  que un simulador se ENCUENTRE y que sus botones
                           den los números del examen (§10, §16)
  peso.mjs                 cuánto tarda una página en un móvil (§11)
  mide.mjs                 la tabla de docs/como-vamos.md, generada
  diario.mjs               el diario en PDF
tests/
  *.test.ts                los lectores de respuesta, con vitest
  fisica/                  casos con resultado conocido, uno por simulador:
                           moody · bombeo · compuertas · canales · ariete,
                           86 casos sacados del corpus, nunca de un libro (§10)
public/
  examenes/<asignatura>/   los enunciados originales en PDF —85 de cálculo y
                           8 de álgebra. La ÚNICA carpeta del repo donde entra
                           un PDF ajeno (§08)
docs/ · tasks/ · referencia/ · diario/
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

Los cinco tipos de paso, y qué competencia entrena cada uno:

| `tipo` | qué hace | competencia | usos en el corpus |
|---|---|---|---|
| `reconocer` | elegir el concepto antes de calcular | COMP1 | 1.068 |
| `calcular` | introducir el resultado y recibir el diagnóstico | COMP2 | 1.989 |
| `justificar` | ordenar las piezas, con una trampa | COMP4 | 1.059 |
| `verificar` | escribir una condición y compararla como región | COMP2·COMP4 | 25 |
| `redactar` | escribir en papel y contrastar con la rúbrica | COMP4 | 1 |

`redactar` se ha usado **una vez de 4.142 pasos**. Está construido y razonado
en `content.config.ts`, pero no es un patrón probado: úsalo si el ejercicio lo
pide, no porque esté en la tabla.

Y dentro de `calcular`, seis tipos de respuesta según lo que se escriba en la
casilla:

| `respuesta.tipo` | qué lee | tolerancia | dónde vive el lector |
|---|---|---|---|
| `numero` | un real, con forma exacta (`pi/4`, `sqrt(3)/2`) | absoluta | `lib/regiones.ts` |
| `complejo` | forma binómica | absoluta | `lib/complejo.ts` |
| `conjunto` | varias soluciones, sin orden | absoluta | `lib/complejo.ts` |
| `vector` | coordenadas **con** orden | absoluta | `lib/algebra.ts` |
| `matriz` | filas y columnas | absoluta | `lib/algebra.ts` |
| `magnitud` | número **con unidad**, comparado por dimensión | **relativa** | `lib/unidades.ts` |

> Las cifras de esta tabla y las de §05 y §15 se quedaron en el corpus de
> agosto y estuvieron desfasadas hasta el 28 de agosto de 2026: decían 1.022
> pasos cuando eran 2.658, y 270 ejercicios cuando eran 683. **Regla que sale
> de ahí: un número de este fichero se recalcula al cerrar cada asignatura, no
> cuando alguien se acuerda.** El guion está en el scratchpad y son veinte
> líneas: recorre las colecciones y cuenta.
>
> Recontadas el **1 de septiembre de 2026**, al cerrar Fluidos: los pasos
> pasan de 3.092 a 4.142 y los ejercicios de 827 a 1.059, repartidos en 41
> temas de tres asignaturas. La regla funcionó — las cifras llevaban cuatro
> días desfasadas, desde el recuento del 28 de agosto, no una semana.

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

| patrón | dónde vive de verdad | usos |
|---|---|---|
| **1 · Lectura** | `patrones/Lectura.astro` | los 41 temas |
| **2 · Figura fija** | **no construido** | 0 |
| **3 · Ejercicio guiado** | `patrones/EjercicioGuiado.astro` | 1.059 ejercicios |
| **4 · Verificador** | paso `verificar` + `sim/PlanoComplejo.astro` | 25 |
| **5 · Demostración** | paso `justificar`, con su pieza trampa | 1.059 |
| (*simulador*) | `sim/`, cuando el tema lo pide | 6 |

Solo **Figura fija** está sin construir, y sigue sin construirse a propósito:
ningún tema lo ha pedido todavía. El día que un contenido lo exija se hace; no
antes, porque un patrón diseñado en el vacío sale mal (§13).

Y el `simulador` del esquema no es un sexto patrón: es la puerta que §04 deja
abierta para escribir código cuando un tema necesita algo que no existe.

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
| `--live` `#0D6E6B` | se toca, se comprueba, es interactivo |
| `--flag` `#B93A2B` | esto te suspende: error típico, fallo físico |
| `--alt` `#7A4FB5` | segundo objeto de una escena |

**Seis colores de datos**, `--d1`…`--d6` (azul, naranja, verde, magenta, oro,
pizarra), **solo** para series de gráficas.

- Los semánticos nunca son serie de datos. Los de datos nunca van en interfaz.
- Se usan en orden desde `--d1`.
- **Máximo seis series por gráfica.** Más significa que la gráfica está mal
  planteada: se parte, o se resalta una y el resto va en gris.
- El color nunca es el único distintivo: etiqueta directa o marcador de forma.
  Verificado contra deuteranopía, protanopía y escala de grises.

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
> asignatura**, junto con las cifras de §04, §05 y §15, y se comprueba que la
> tabla de aquí y lo que digan `docs/` y `tasks/` dicen lo mismo.

Todo ejercicio guiado entrena las tres: una pregunta de reconocimiento antes
del cálculo, y una comprobación de justificación formal después. **Un componente
que solo verifica un número entrena la parte que menos se falla.**

### En el examen no se puede usar calculadora

Lo dijo el alumno el 23 de agosto de 2026, y cambia cómo se escribe un paso de
cálculo. La consecuencia no es cosmética: **la respuesta de un ejercicio no
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

---

## 11 // Suelo de calidad

Son dos guardianes y comprueban cosas distintas. Los dos corren en CI y
bloquean el despliegue.

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
- Responsive real hasta 360 px.
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

Con `HUMO_TODO=1` las abre **todas** —123 páginas—, y eso es lo que se pasa al
cerrar una asignatura. La primera vez que se hizo, el 29 de agosto de 2026,
encontró cuatro figuras marcadas… y las cuatro eran correctas: el guardián de
`viewBox` daba falsos positivos con los círculos guía. Se estrechó la regla y
se dejó dicho por qué. Ese es el uso: **la barrida no busca aprobar, busca
enterarse.**

> Y de paso arregló tres fallos del propio guardián, que llevaba dando
> «Execution context was destroyed» en una página distinta cada vez: abría las
> 123 en la misma pestaña, clicaba las pestañas de modo dentro del mismo
> `evaluate` que dispara `history.replaceState`, y medía sin esperar al trabajo
> diferido. Un guardián que falla al azar se acaba ignorando.

### `npm run sim` — que un simulador se encuentre y diga la verdad

Tampoco es un guardián del suelo: necesita el sitio levantado. Se pasa **al
tocar un simulador**, como `recalcula` al tocar el corpus.

Existe por un fallo concreto y caro. El 2 de septiembre de 2026 se publicaron
cinco simuladores correctos y **completamente invisibles** —viven en un
apartado que no es el primero, y el modo guiado tapa los demás— con el suelo
en verde y las capturas de cada uno bien. `tests/fisica/` prueba la física;
`humo.mjs` prueba que la página no reviente. **Nadie probaba el cable entre las
dos cosas.**

Comprueba dos cosas, y las dos habían fallado:

- que el simulador **se encuentre** aterrizando en la URL a pelo, sin ancla y
  sin `localStorage` — que la cabecera lo anuncie, que el índice marque su
  apartado y que el aviso **lleve**;
- que cada botón de preajuste deje en la tabla **los valores que publica la
  convocatoria** de la que sale. No se recalculan aquí: están copiados del
  examen, que es lo único contra lo que tiene sentido comparar (§10).

Validado al revés con dos regresiones reales: volver a poner `D/e = 40` en el
golpe de ariete —que daba 215 mca donde el examen dice 228— y quitar el aviso
de la cabecera. Las dos, rojas.

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

**No es un guardián: no entra en `npm run suelo` y no bloquea nada.** Se pasa
al **cerrar una asignatura**, junto con el recuento de las cifras de §04, §05,
§09 y §15.

Existe porque el 28 de agosto de 2026 una auditoría que recalculaba las
matemáticas encontró **ocho ejercicios que enseñaban algo falso** con los dos
guardianes en verde y §15 cumplida. El signo de una antitransformada, la
relación de distancias de Apolonio invertida, un contraejemplo que no era
contraejemplo. Ninguno de esos fallos rompe nada: el sitio funciona
perfectamente enseñando algo que no es verdad.

Comprueba solo **lo que el propio contenido ya afirma**, nunca algo inventado:

- cada «expresión $\approx$ decimal» de una resolución o un desarrollo,
- cada forma exacta que un `formato` declara entre paréntesis, contra su
  `valor`,
- que un `formato` que promete «un número entero» guarde un entero.

Lo que no sabe evaluar lo declara **saltado**, y no lo cuenta como fallo.

> **Su límite, dicho aquí para que nadie lea mal su verde.** Solo alcanza a las
> respuestas escritas como decimal. **Álgebra queda entera fuera**: sus
> resultados son objetos exactos —vectores, matrices— y sus ejercicios de
> determinantes usan propiedades, no matrices escritas. Cero desajustes en
> Álgebra significa «no hay nada que este guion sepa mirar», no «está
> comprobada». Ahí la verificación sigue siendo leer las matemáticas.

Antes de escribirlo se intentaron dos guardianes de texto y los dos se
descartaron por ruidosos —26 avisos falsos de 323, y 8 de 10—. La conclusión,
que vale para la próxima vez: **esta clase de fallo no se caza con patrones en
la prosa, se caza evaluando.**

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
- Despliegue por GitHub Actions: build, `verify.mjs`, tests, y solo entonces
  publicar.

---

## 13 // Cómo trabajar aquí

- **Plan primero.** Escribe `tasks/todo.md` antes de crear ficheros. Si hay
  alguien a quien preguntar, espera el visto bueno; si no lo hay, lee el
  apartado siguiente.

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
`tasks/todo.md` en vez de resolverlo— solo en estos cinco casos:**

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
| `ejercicios` | de `ejemplo` a `practica` a `examen`, en ese orden |
| `dominio` | cómo sabes que este escalón está cerrado |

> Nace el 23 de agosto de 2026 de una crítica del alumno: «lo que has hecho es
> mandar con un enlace directo a la teoría, y con eso no hacemos que nadie
> aprenda nada». Tenía razón. Un bloque era una pila plana de una decena de
> filas donde «leer» y «hacer» eran visualmente lo mismo, el `dominio` se
> validaba y se tiraba sin pintarlo, y el primer ejercicio de cualquier bloque
> ya era de nivel examen.

La regla que lo resume: **si el primer ejercicio de un escalón no lo puede
hacer alguien que acaba de leer la teoría, falta un ejemplo delante.**

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
- `npm run suelo` en verde con todas sus páginas dentro.

### Cuánto es «una asignatura», medido

Cálculo es la referencia, y ya está cerrada entera. Once temas dan **21.545
palabras de prosa, 191 ejercicios de tema, 88 convocatorias con 425 ejercicios,
156 escalones en 7 rutas y 29 figuras.** Sirve para dimensionar, no como cuota:
un tema que necesita ocho figuras lleva ocho.

**La definición de «palabra» es la de `scripts/mide.mjs` y solo esa.** Este
fichero decía 32.460 hasta el 29 de agosto de 2026 —el conteo crudo del MDX,
etiquetas y LaTeX incluidos— mientras `docs/como-vamos.md` publicaba 21.545
con la definición del guion. Ninguna mentía, pero dos definiciones sin nombrar
son un descuadre esperando a que alguien las compare. Manda la del guion,
porque es la reproducible.

> Esta cifra decía «cinco temas, 12.644 palabras, 127 ejercicios, 33 exámenes,
> 56 escalones» hasta el 28 de agosto de 2026, es decir la mitad de la
> asignatura contada cuando iba por la mitad. Quien la leyera para dimensionar
> un trabajo se habría quedado corto por más del doble.

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

**Cuatro de cinco.** El build en verde no es una comprobación: es la ausencia
de una. Así que después de construir, y antes de dar nada por hecho:

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
6. **Y solo entonces** `npm run suelo`.

### Y al cerrar una asignatura, cuatro cosas más

El suelo se pasa en cada commit. Estas cuatro no —tardan, o dependen de la
máquina— y por eso se pasan **al cerrar**, todas juntas, en el mismo commit que
declara la asignatura terminada:

| | qué comprueba | qué pasó por no tenerlo |
|---|---|---|
| `npm run recalcula` | que las cuentas del corpus salgan | ocho ejercicios enseñaban algo falso con el suelo en verde |
| `HUMO_TODO=1 npm run humo` | las 96 páginas de examen en un navegador | el navegador abría 8 de 96 durante meses |
| `npm run peso` | que ninguna página pase de 4 s en un móvil | el tema 1 tardaba 5,9 s y nadie lo medía |
| `npm run mide` | regenerar la tabla de `docs/como-vamos.md` | dos commits publicando una cifra vieja |

Y con ellas, recontar las cifras de §04, §05, §09 y §15, que es lo que más se
olvida: el 28 de agosto de 2026 llevaban una semana diciendo la mitad de la
verdad.

> Si no puedes hacer el punto 1 —sin navegador, sin capturas—, dilo en el
> commit. Un contenido visual sin mirar no es contenido terminado, es contenido
> propuesto, y hay que decirlo con esa palabra.

---

## 17 // Trampas conocidas

Cosas que ya han costado horas. No son opiniones.

- **No escribas LaTeX a través del shell.** Ni heredocs, ni `node -e`, ni
  `sed`. Las barras se comen: `\\frac` llega como `\frac`, y `\f` se convierte
  en un carácter de avance de página **invisible** que rompe el YAML y no se
  ve al leer el fichero. Usa las herramientas de edición de ficheros. Pasó tres
  veces en un día.
- **Un `: ` sin comillas dentro de un valor YAML rompe el fichero**, y el error
  que da apunta a otra línea. Ojo con los apóstrofos de `f'`, que confunden a
  cualquier comprobador hecho con `grep`.
- **`dist/` abierto con `file://` no tiene CSS.** Las variables salen vacías y
  parece que los SVG no se dibujan. Levanta un servidor.
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
  especial: `$&` es lo sustituido, `$1` un grupo, y **`$'` es todo lo que va
  detrás**. Como aquí casi todo el texto lleva LaTeX entre dólares, un
  reemplazo que contenga `$'`, `$&` o `$1` inserta trozos del propio fichero sin
  avisar. Pasó en `tasks/todo.md`: quedó cortado a media frase, en el sitio
  exacto donde había un `$x\sin x$`, con la versión anterior entera pegada
  detrás, y así estuvo **veintiún commits** publicando recuentos viejos. Nadie
  lo vio porque `verify.mjs` no lee `docs/` ni `tasks/`. **Regla: para insertar
  texto literal se usa la función de reemplazo —`(...) => nuevo`— o se parte y
  se vuelve a juntar con `split`/`join`, nunca la cadena a pelo.** Y después de
  cualquier reescritura de un fichero de prosa, se cuenta: `wc -l` antes y
  después, y un `grep -c` de un encabezado que solo puede aparecer una vez.
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

  **Y pasó dos veces el mismo día**, las dos con un `NPSH` y las dos
  costando un suelo entero de doce minutos. El guardián está bien donde
  está —`verify.mjs` lo caza— pero conviene barrer antes de lanzarlo: se
  cargan los YAML, y en cada cadena se cuentan los `$` línea a línea; si
  una línea deja una fórmula abierta y la siguiente empieza por `- `, ahí
  está. Veinte líneas, y devuelve el fichero y el campo.
- **Un `grep` por líneas no ve una frase partida dentro de un bloque YAML.**
  Los valores `|` y `>-` se escriben a 80 columnas, así que «Da cuatro
  decimales.» puede estar como «Da\n cuatro decimales.» y `grep "Da cuatro
  decimales"` devuelve cero. El 28 de agosto de 2026 eso hizo que una auditoría
  concluyera «cero enunciados ordenan dar decimales» cuando eran 32. **Regla:
  para contar cualquier cosa dentro del contenido se carga el YAML y se busca
  sobre la cadena ya parseada, nunca con `grep` sobre el fichero.** Vale igual
  para los decimales, que van en LaTeX: `0{,}42865` no lo encuentra un `grep`
  de `0,42865`.
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
- **El humo abre una muestra rotatoria de exámenes elegida por el día del año,
  así que un fallo latente aparece cualquier mañana sin que nadie haya tocado
  nada.** El 31 de agosto de 2026 el CI se puso rojo con el suelo local en
  verde: le tocó el turno a `2015-2016-ext`, cuya figura del semicírculo tenía
  dos etiquetas fuera del `viewBox` **desde el día que se escribió**. El commit
  que lo destapó era de Fluidos y no tenía nada que ver.

  Dos consecuencias prácticas. Una: **un CI rojo no significa que lo tuyo esté
  mal** — mira qué página falla antes de tocar tu cambio. Y dos: el verde de
  `npm run suelo` cubre la muestra de hoy, no las 96 páginas; **para eso está
  `HUMO_TODO=1 npm run humo`**, y conviene pasarlo una vez por tanda de
  trabajo, no una vez por commit.
- **Insertar delante de un elemento de lista YAML deja su campo huérfano.** Si
  un elemento es `- id: X` seguido de su `nota:`, y sustituyes solo la línea
  `- id: X` por «`- id: X` + tu nota + tu elemento nuevo», la `nota` original
  queda pegada al **último** elemento insertado, que ya tiene la suya: clave
  duplicada. Pasó tres veces el 28 de agosto de 2026. `js-yaml` lo caza —el
  build falla con «duplicated mapping key» y la línea exacta—, pero se tarda
  menos en evitarlo: **para insertar antes de un elemento, ancla la sustitución
  en el elemento anterior completo, con su `nota`, no en la línea del `- id:`.**
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
- **`titulo` y `fuente` son texto plano, sin `$…$`.** Un `(matriz $A_1$)` en
  la fuente de siete ejercicios paró el despliegue el 30 de agosto de 2026:
  `verify` lo lista como «LaTeX que ha salido como texto». Subíndice en
  Unicode (A₁) o sin subíndice; la fórmula va en `enunciado`.

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
| 09 | «entre el 30 y el 40 %» no es cálculo | **49,5 %**, contado sobre 1.440 puntos | la estimación se quedaba diez puntos corta |
| 14 | un bloque es una lista de material | **el escalón**, con su escalera | «con eso no hacemos que nadie aprenda nada» |
| 09 | (no se contemplaba) | **en el examen no hay calculadora** | lo dijo el alumno; 128 respuestas a revisar |

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
