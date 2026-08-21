# CLAUDE.md — Road to Ingeniería

Reglas de este repositorio. Léelas enteras antes de tocar ningún fichero.

---

## 00 // Qué es esto

Plataforma de estudio **gratuita** para alumnos de 1.º y 2.º de la Escuela de
Ingeniería de Gipuzkoa (UPV/EHU). Sitio estático en GitHub Pages: sin backend,
sin cuentas de usuario, sin base de datos. Solo en castellano.

**Piloto: Cálculo (1.º) y Mecánica de Fluidos (2.º).** Se eligieron porque
tensionan el sistema en direcciones opuestas — una es abstracta y vive de
gráficas, la otra es física y vive de esquemas de instalación. Si el diseño
aguanta las dos, aguanta el resto sin rediseñarlo.

No se abre una asignatura nueva hasta que las dos del piloto están terminadas.
**Pocas excelentes antes que muchas a medias.**

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

Dependencias previstas y suficientes: `astro`, `@astrojs/mdx`, `remark-math`,
`rehype-katex`, `@fontsource-variable/fraunces`, `@fontsource/ibm-plex-sans`,
`@fontsource/ibm-plex-mono`, `vitest`.

---

## 03 // Estructura

```
src/
  content.config.ts        colecciones con esquema Zod
  content/
    catalogo/              una entrada por asignatura
    calculo/
      t01-complejos/
        index.mdx          la prosa del tema
        ejercicios.yaml    los ejercicios como DATOS
    fluidos/
      t09-bombeo/
  components/
    patrones/              Lectura · FiguraFija · EjercicioGuiado
                           Verificador · Demostracion
    sim/                   simuladores concretos por tema
    ui/                    cabecera, paleta de comandos, cajas
  layouts/
    Base.astro             el ÚNICO layout
  styles/
    tokens.css             el ÚNICO :root del repositorio
    base.css
    print.css
  pages/
scripts/
  verify.mjs               el suelo de calidad, en CI
tests/
  fisica/                  casos con resultado conocido
CLAUDE.md
```

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

Un tema nuevo son dos ficheros:

**`index.mdx`** — la prosa, con componentes incrustados donde hagan falta:

```mdx
---
asignatura: calculo
tema: 1
titulo: Números complejos
descripcion: Forma binómica y polar, De Moivre, raíces
peso: 8
patron: figura-fija
---

Un número complejo no tiene nada de imaginario...

<Verificador tipo="regiones" preset="1.20" />

<ErrorTipico titulo="Error típico">
Calcular el argumento con `arctan(b/a)` a secas...
</ErrorTipico>
```

**`ejercicios.yaml`** — los ejercicios como datos, nunca como código:

```yaml
- id: bombeo-2025
  fuente: Extraordinario junio 2025 · Ejercicio 2
  pasos:
    - titulo: Altura estática de la instalación
      competencia: COMP2
      pregunta: ¿Cuánto vale H_est?
      unidad: mca
      solucion: 7
      tolerancia: 0.3
      distractores:
        - valor: -13
          mensaje: Has hecho solo z₂ − z₁. Falta la contrapresión...
        - valor: 33
          mensaje: Has sumado los 13 m en vez de restarlos...
      pista: H_est = (z₂ − z₁) + p/γ
      desarrollo: |
        H_est = (17 − 30) + 1,96·10⁵ / 9800 = 7 mca
```

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

Es un **mapa del temario**, no un selector. Las nueve asignaturas como nombres
grandes que se reparten la pantalla; al posarse encima una fila crece y las
demás se comprimen. Al elegir, **el nombre pulsado viaja hasta convertirse en
el título** de la vista de detalle (técnica FLIP: medir, invertir, animar).
Paleta de comandos con `/` o `⌘K` que busca asignaturas, temas y conceptos a la
vez.

Principio: **fluido no es tener animaciones, es no perder nunca el sitio.** Cada
movimiento contesta de dónde ha salido algo y dónde se ha ido lo otro.

---

## 06 // Diseño

### Tipografía

Fraunces para títulos, IBM Plex Sans para el cuerpo, IBM Plex Mono para datos,
unidades y etiquetas. Tres roles, tres familias, sin excepciones. Autoalojadas
vía `@fontsource`.

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

**La mitad de la nota no es calcular.** Hay ejercicios enteros —como el de
sucesiones del parcial del 20 de octubre de 2025, o los tres «enunciar y
demostrar Barrow» de 2019, 2020 y 2021— donde COMP 2 vale cero y los diez
puntos son demostración.

> Esta sección decía «entre el 30 y el 40 %» hasta el 21 de agosto de 2026. Se
> corrigió al terminar el corpus del primer cuatrimestre y poder **medirlo** en
> vez de estimarlo: sumando el reparto oficial impreso en los 143 ejercicios de
> los 33 exámenes —once cursos por tres evaluaciones, 1440 puntos— sale
>
> | | puntos | del total |
> |---|---|---|
> | COMP 1 | 147 | **10,2 %** |
> | COMP 2 | 727 | **50,5 %** |
> | COMP 4 | 566 | **39,3 %** |
>
> Es decir, **el 49,5 % de la nota no es cálculo**. La estimación anterior se
> quedaba diez puntos corta, y venía de haber mirado solo los primeros
> exámenes. El dato se recalcula cuando entren exámenes nuevos (§10: los datos
> que se publican como ciertos tienen que serlo).

Todo ejercicio guiado entrena las tres: una pregunta de reconocimiento antes
del cálculo, y una comprobación de justificación formal después. **Un componente
que solo verifica un número entrena la parte que menos se falla.**

---

## 10 // Física y datos

Una simulación equivocada enseñando a cien alumnos es peor que no tener
simulación.

- Todo simulador lleva en `tests/fisica/` al menos un caso con resultado
  conocido, verificado contra el ejercicio original o contra bibliografía.
- Las constantes van con nombre y unidades explícitas.
- Si un resultado no cuadra con el original, se para y se revisa. **Nunca se
  ajusta una constante para que salga el número esperado.**
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

- **Plan Mode primero.** Escribe `tasks/todo.md`, espera visto bueno, y solo
  entonces crea ficheros.
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
