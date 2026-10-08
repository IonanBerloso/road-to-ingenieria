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
| Cálculo | `TRABAJO_PERSONAL._NOTA_FINAL.pdf` | notas, y lleva DNI; lo encontró el inventario del material el 28 de septiembre de 2026 |
| Cálculo | `DISTRIBUCIN_DE_GRUPOS_DE_PRCTICAS_DE_LABORATORIO.pdf` | nombres por grupo |
| Cálculo | `CONVOCATORIA_EXTRAORDINARIA._PARCIALES_A_REALIZAR.pdf` | DNI |
| Cálculo | `CDIGOS_SOCRATIVE.pdf` | DNI emparejados con códigos |
| Mecánica Aplicada | `Notas_parcial_esttica.pdf` | notas |
| Mecánica de Fluidos | `Grupos_Laboratorio_16A_2025-26_act._20260212.pdf` | nombres completos |
| Expresión Gráfica | `CONVOCATORIA_EXTRAORDINARIA_-_NOTAS.pdf`, `CONVOCATORIA_ORDINARIA_-_CALIFICACIONES.pdf` | notas |
| Fundamentos Químicos | `Lista_del_grupo_01_GL1…GL4_apellidos_*.php`, `Prctica_2._Resultados_01_GL1…GL4.php` | listas y resultados por persona |
| Ingeniería Térmica | `20252026_Nota_Prcticas_de_Laboratorio.pdf`, `Notas_de_prcticas_de_aos_anteriores.pdf`, `Resultados_Test_1.1.pdf`, `Resultados_Test_2.1.pdf` | notas |
| Ingeniería Térmica | `Normas_y_recomendaciones_para_seguir_la_asignatura.pdf` | **los apellidos del alumnado por subgrupo, en la última página** |
| Ciencia de Materiales | lo que lleva «Grupo N» en el nombre, `RESULTADOS_DE_LA_PRACTICA_5-TRABAJO_EN_FRO_GL1`, `DATOS_DE_LA_PRCTICA_6_Y_MATERIAL_DE_APOYO_GL1` | presentaciones y resultados con nombres |
| Sistemas de Producción | `Distribucin_grupos_prcticas.pdf` | nombres por grupo |

Cuatro reglas prácticas, porque la lista nunca estará completa:

1. **Un fichero con «notas», «calificaciones», «lista», «grupo» o
   «resultados» en el nombre se trata como personal** hasta que se demuestre
   lo contrario, y demostrarlo no exige abrirlo entero. **También en
   singular**: `TRABAJO_PERSONAL._NOTA_FINAL.pdf` dice «NOTA».
2. **Al volcar un PDF nuevo de material, se mira el final antes de usar
   nada.** Las normas de Térmica parecían un documento de la asignatura y
   traían los apellidos en la última hoja.
3. **Una foto o un escaneo de un examen que alguien pasa no se publica**: se
   transcribe el enunciado. La foto enseña a quien la hizo —una mano, un
   cuaderno, un nombre— y eso no es nuestro. Así se hizo con el test de
   mínimos de Materiales de 2024.
4. **Antes de volcar un PDF cuyo nombre no dice nada, se buscan en su texto
   patrones de DNI** (`\b\d{8}[A-Z]\b`) sin leerlo, y si aparecen no se abre.
   `CDIGOS_SOCRATIVE.pdf` no activaba ninguna de las otras tres reglas y la
   auditoría externa del 27 de septiembre de 2026 lo abrió; no se reprodujo
   nada, pero la lista no lo habría evitado.

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
| por qué este fichero dice lo que dice | `docs/cronica.md`, `docs/porques/` y el historial de git |

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
`motivo` de su catálogo, no se aplica en silencio. Y cubre el cierre, no el
trabajo: lo que se puede hacer sin el material que falta —en Materiales, el
formulario, el simulacro y el laboratorio— no espera, y tiene su fase en
`tasks/pendiente.md`.

### El estado, a 26 de septiembre de 2026

Un corte con fecha, no un estado: el vivo lo dicen el catálogo y
`npm run deuda`. Los cortes anteriores están en `docs/cronica.md`.

| asignatura | curso | estado | lo que la define hoy |
|---|---|---|---|
| Cálculo | 1.º | `ok` | la referencia de tamaño: §15 la mide |
| Álgebra | 1.º | `ok` | un tema `soloEnClase` declarado |
| Fundamentos Químicos | 1.º | `ok` | desde el 29 de septiembre (fase G), la colección del curso entera, las tres hojas de formulación y las dos resoluciones oficiales; el laboratorio no se cubre, por decisión |
| Expresión Gráfica | 1.º | `obra` | **la siguiente**: temario y evaluación de la guía desde ese día; antes que temas necesita diseño, porque su examen es un dibujo |
| Mecánica de Fluidos | 2.º | `ok` | la de más temas; dos `soloEnClase`, un ejercicio de examen `fuera` y un apartado |
| Ingeniería Térmica | 2.º | `ok` | dos convocatorias imposibles, solo en euskera |
| Mecánica Aplicada | 2.º | `ok` | ocho convocatorias, cinco transcritas de la imagen de su columna en castellano; el bloque 2 se mide sobre exámenes de 2018 y 2019 |
| Ciencia de Materiales | 2.º | `obra` | escrita entera, y desde el 29 de septiembre (fase H) con laboratorio, formulario, el banco del test de 7 a 10 y tres simulacros nuestros; sin exámenes de problemas no hay ruta ni cierre |
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

*Las historias con fecha que iban en esta sección —de dónde salen algunas de sus reglas— están en [`docs/porques/02-pila.md`](docs/porques/02-pila.md).*

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
      simulacros/          simulacros NUESTROS (Materiales, fase H3): un
        2025-2026-simulacro/  examen.yaml sin ejercicios.yaml al lado, que
                           cita ejercicios de tema por su id. Convocatoria
                           `propia` (`esPropia` en content.config.ts):
                           misma página que un examen —reloj, hoja,
                           resoluciones—, pero fuera de todo lo que cuenta
                           convocatorias; por eso vive fuera de examenes/,
                           donde la recorren mide, deuda y verify. Sus
                           partes (40/60) salen del catálogo, no se
                           escriben otra vez (src/lib/simulacro.ts)
    preparar/              una ruta de estudio por evaluación (§14).
                           Solo YAML: no enseña nada nuevo, ordena lo que
                           ya está y dice por qué en ese orden.
    laboratorio/           las prácticas de la asignatura, que esta app
                           no corrige. Un YAML por asignatura: Cálculo
                           (GeoGebra) y Térmica (Termograf), de ordenador;
                           Materiales y Fluidos, de laboratorio de verdad,
                           y en Fluidos el escrito pregunta por ellas. La
                           herramienta, la entradilla y la línea del índice
                           de la asignatura (`enIndice`) salen del YAML.
                           Con `practica` se rotula «P01»; con `sesion`,
                           se agrupa (todas o ninguna); `donde.apartado` y
                           `ejercicios` se enlazan y rompen el build si no
                           existen. No transcribe el guion ni reparte
                           ningún fichero: lo nombra, lo resume y enlaza el
                           apartado donde está explicado (§08)
    coleccion/             la Colección de ejercicios de una asignatura
                           como DATOS, en el orden de su PDF: hoy los 55
                           de diédrico de Expresión Gráfica, cada uno con
                           su número, su lámina y su página. La página
                           [asignatura]/coleccion calcula cuáles se
                           corrigen aquí desde los ejercicios que existen
    criterios/             la hoja de criterios de corrección de una
                           asignatura como DATOS, tal cual impresa:
                           mínimos, errores muy graves y típicos con su
                           precio y su tope. Hoy, Expresión Gráfica. La
                           pinta ui/Criterios, nunca una paráfrasis
    banco/                 bancos de preguntas de test (§05): el de mínimos
                           de Materiales, que alimenta un simulacro; las
                           cuestiones de las diapositivas de Cálculo, uno
                           por tema, cada uno con su página; y el de los
                           temas 7 a 10 de Materiales, `propio`: escrito
                           por nosotros, vive en la página del primer tema
                           que cubre y lo enlazan todos
    laminas/               las figuras de la colección de diédrico de
                           Expresión Gráfica como DATOS, una por fichero
                           (sd1.json), cotejadas con su página del PDF
                           antes de entrar (scripts/lamina-sobre-pdf.mjs)
    tablas/                las tablas del agua de Térmica con la rejilla
                           del anexo del curso, y su diagrama de Mollier.
                           Calculadas, nunca copiadas (§08): el JSON lo
                           escribe scripts/tablas-vapor.mjs y el SVG
                           figuras/termica-mollier.mjs. No se editan a
                           mano; tests/fisica/vapor.test.ts comprueba que
                           no se han quedado atrás
  components/
    patrones/              Lectura · EjercicioGuiado · ErrorTipico ·
                           Taller (con su lupa) · Construccion (la
                           construcción paso a paso de un `construir`,
                           con sus instrumentos y su porqué)
    sim/                   los simuladores (§05, §10). Su modelo vive en
                           lib/ para poder probarlo, nunca dentro del
                           .astro. El de test y el de cuestiones leen su
                           banco de content/banco
    ui/                    Cabecera · Tema · BloqueDeEjercicios · Armazon ·
                           Seguir · Examen · Reparto · QueNotaNecesito ·
                           Criterios (la hoja de corrección con su cuenta,
                           en la página de la asignatura y en el despiece) ·
                           EnlaceAsignatura (el nombre de la asignatura en
                           el rótulo de cada página suya, enlazado a su
                           detalle en la portada)
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
    diedrico.ts            la geometría del diédrico directo de Expresión
                           Gráfica: la solución de una lámina se calcula
                           aquí, nunca se dibuja a mano. Crece con cada
                           ejercicio que la pida, con su prueba
    diedrico-receta.ts     las recetas: la solución de una lámina y sus
                           diagnósticos escritos como DATOS en el YAML,
                           evaluados en el build, con las elecciones de
                           las láminas que tienen dos soluciones buenas.
                           Con -sintaxis, -valores y -funciones al lado;
                           una función nueva va en -funciones
    diedrico-corrige.ts    la corrección de lo que marca el alumno: lo
                           único del patrón que corre en la página, y por
                           eso no importa nada de lo demás
    lamina.ts · construir.ts
                           qué se comprueba de una lámina, y el paso
                           construir resuelto: la receta evaluada, sus
                           objetivos compilados y cada error declarado
                           construido a propósito con su ejemplo
    rutas.ts · peso.ts · formulario.ts · cuadernillo.ts · texto.ts
                           URLs, el peso de cada tema en la portada, qué
                           parte de un tema es formulario, cuántos
                           ejercicios trae un examen y la clave de búsqueda
                           sin tildes. Cada uno existe porque su regla
                           estaba escrita en dos o tres páginas (§01)
    ejercicios.ts          en qué bloque de diez vive cada ejercicio de
                           tema, y la dirección de cualquier ejercicio
                           (§07, «de diez en diez»)
    nota.ts · estado.ts    la cuenta de «¿qué nota necesito?», con su
                           prueba, y los estados de una asignatura en las
                           palabras de la pizarra
    criterios.ts           la cuenta de los criterios de corrección: si
                           una lámina se corrige y cuánto se le quita,
                           con sus topes y las lecturas que la hoja no
                           confirma (tests/criterios-cuenta.test.ts)
    banco.ts · banco-texto.ts
                           un banco de test con sus textos ya dibujados,
                           para los dos componentes que los leen, y sus
                           reglas de texto, con su prueba
    iapws95.ts · if97.ts · tablas-vapor.ts · anexo-vapor.ts
                           el agua según IAPWS-95, que es la formulación
                           del anexo y la de las tablas; IF97, que la
                           contrasta y ninguna página usa; la rejilla del
                           anexo y cómo se escribe cada columna; y en qué
                           se aparta el anexo de ellas, con sus erratas.
                           No importan nada: node los lee tal cual
  styles/
    tokens.css             el ÚNICO :root del repositorio
    base.css · print.css
  pages/                   index · [asignatura] · [asignatura]/[tema] con sus
                           bloques de ejercicios y sus cuestiones ·
                           examenes · preparar · formulario · laboratorio ·
                           tablas, y el índice de ejercicios que busca la
                           paleta
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
  comprueba-talleres.mjs   que cada taller de Expresión Gráfica se deje
                           construir en un navegador, fallando a propósito
                           (§11)
  servidor.mjs             la vista previa que necesitan humo, humo-todo,
                           contraste, comprueba-simuladores,
                           comprueba-talleres y peso. Una sola forma de
                           levantarla, no seis
  peso.mjs                 cuánto tarda una página en un móvil (§11)
  peso-maximo.mjs          el listón de 3 MB de las páginas de estudio, que
                           exige verify.mjs y marca peso.mjs (§07)
  muestra-distractores.mjs diez diagnósticos al azar para revisarlos a mano
                           (§13)
  inventario-material.mjs  qué trae cada PDF del material y qué usa el
                           sitio de él, sin abrir los vetados; la tabla se
                           guarda junto al material, no aquí
  revisa-ejercicios.mjs    lo que pide §04, comprobado ANTES de pegar el
                           bloque en el corpus: en un segundo, sin construir
  revisa-banco.mjs         lo mismo para un banco de test: la forma, el
                           recuento de diapositivas, las fórmulas y las
                           figuras
  inventario-coleccion.mjs qué problemas de la colección de Fluidos faltan,
                           cruzando el volcado del PDF contra el corpus
  lamina-sobre-pdf.mjs     una lámina de Expresión Gráfica dibujada encima
                           de su página del PDF, a la misma escala o
                           ampliada (--zoom), para cotejarla
  mide.mjs                 la tabla de docs/como-vamos.md, medida
  tablas-vapor.mjs         escribe las tablas de vapor de Térmica en
                           content/tablas, con lib/iapws95.ts (§10)
  leer-grafica.mjs · leer-curvas.mjs   comprobar una figura sin ojos
  diario.mjs               el diario en PDF
  figuras/                 el lienzo que calcula las figuras (§17), un
                           generador por tema, pegar.mjs, rehacer.mjs —que
                           las vuelve a pegar todas— y previsualiza.mjs,
                           que monta el contact sheet para mirarlas (§16).
                           termica-mollier.mjs no pega nada: escribe su
                           SVG en content/tablas, que la página de tablas
                           mete en línea
tests/
  *.test.ts                los lectores de respuesta, con vitest
  fisica/                  casos con resultado conocido, uno por simulador,
                           sacados del corpus y nunca de un libro (§10), y
                           las tablas de vapor, contra los valores de
                           verificación de la propia IAPWS. El README dice
                           contra qué compara cada uno; la cuenta de casos
                           la da npm run deuda
  verificacion/            cada respuesta de examen, recalculada por un
                           camino escrito aparte. Todas menos una, y la
                           que falta está dicha en npm run deuda. Y la
                           colección del tema 7 de Térmica, que lee las
                           tablas de vapor: corpus.ts tiene tema() además
                           de convocatoria()
  geometria/               una lámina de Expresión Gráfica por fichero, con
                           los valores de referencia de su solución y las
                           comprobaciones por dos caminos (§10)
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
  porques/                 las historias con fecha que iban dentro de este
                           fichero, una por sección, y las entradas enteras
                           de §17, de las que sale su índice
tasks/                     pendiente.md (lo vivo) y siguiente.md (la
                           próxima sesión); todo.md, manana.md y
                           mapa-examenes.md, congelados el 26-9-2026
referencia/ · diario/
CLAUDE.md
```

**De los cinco patrones de §05, solo tres son un componente propio**
—`Lectura`, `EjercicioGuiado` y `Taller`—, y no es un descuido: ve a §05, que
explica dónde vive cada uno.

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

*Las historias con fecha que iban en esta sección —de dónde salen algunas de sus reglas— están en [`docs/porques/03-estructura.md`](docs/porques/03-estructura.md).*

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

Los **siete** tipos de paso, y qué competencia entrena cada uno:

| `tipo` | qué hace | competencia |
|---|---|---|
| `reconocer` | elegir el concepto antes de calcular | COMP1 |
| `calcular` | introducir el resultado y recibir el diagnóstico | COMP2 |
| `justificar` | ordenar las piezas, con una trampa | COMP4 |
| `verificar` | escribir una condición y compararla como región | COMP2·COMP4 |
| `redactar` | escribir en papel y contrastar con la rúbrica | COMP4 |
| `dibujar` | dibujar en papel y contrastar con la figura y la lista | COMP4 |
| `construir` | construir sobre la lámina y marcar los puntos de la solución | COMP2 |

`reconocer` y `justificar` van en todos los ejercicios, y el COMP2 lo pone un
`calcular`, un `verificar` o un `construir`: el esquema lo exige. Los demás son
minoría a propósito: a 26 de septiembre de 2026, `verificar`, `redactar` y
`dibujar` eran 33, 37 y 179 pasos de 8.487.

> **`construir` nace el 27 de septiembre de 2026** con Expresión Gráfica,
> cuyo examen es un dibujo. El alumno traza con herramientas de papel sobre la
> figura exacta de la colección y marca los puntos de la solución por su
> nombre; cada uno se corrige contra la geometría calculada en el build desde
> la `receta` del ejercicio (`lib/diedrico-receta.ts`), y cada error
> declarado lleva un `ejemplo` que el build construye para ver que salta con
> su mensaje (`lib/construir.ts`). Lo pinta `patrones/Taller.astro`, y una
> cifra de un `calcular` puede atarse a la misma receta con `receta:`.
> **Sin puntero no se construye**: las herramientas y la lista de puntos son
> botones y llegan con teclado, pero trazar y marcar se hace pulsando en la
> lámina. Es el mismo límite que `dibujar` tiene con el papel, y se resuelve
> igual: la lámina, lo que se pide y la resolución completa siguen ahí, y el
> modo completo dibuja la solución encima.
>
> **La visibilidad, desde el 7 de octubre de 2026**: un `construir` puede
> llevar `tramos`, cada arista partida donde cambia de vista a oculta, con su
> `tipo` y el `porque` que lee quien la pasa del otro tipo. El alumno los
> pasa a limpio con «arista vista» y «arista oculta» (`visto` y `oculto` en
> `herramientas`), y se corrigen al momento (`casaTramo`, en
> `lib/diedrico-corrige`): un trazo de punta a punta de tramos seguidos del
> mismo tipo vale de un tirón. Los cambios se escriben con
> `cruce_aparente(r, s)`, el cruce en el papel de dos rectas de la lámina, y
> la construcción paso a paso pasa a limpio cada tramo con `con:
> arista-vista` o `arista-oculta`; el build exige que estén todos, que ninguno
> se pise con otro y que ninguno dependa de una elección. El primero es la
> 55·2, cuyo `dibujar` de visibilidad sustituye: lo que piden 5 de las 13
> preguntas de las hojas 52-55 ya no se compara a ojo.

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

> **Las rúbricas de `redactar` se comparten desde el 27 de septiembre de
> 2026** (fase D0 de la auditoría). Cuando la misma demostración cae en varios
> ejercicios, su rúbrica vive una sola vez en `src/content/rubricas/<id>.yaml`
> y el paso pone `rubrica: <id>`; escrita en el paso sigue valiendo para las
> que no se repiten. Cada punto puede llevar `minimo: true` —lo que el
> corrector exige para darla por buena— y `peso`, y la página los pinta como
> casillas que el alumno marca comparando su folio, con la cuenta y el aviso
> de los mínimos que faltan: no corrigen nada, cuentan. `que` dice si es una
> demostración, una deducción o una definición, y pone el título del paso.
> `tests/rubricas.test.ts` caza un id que no existe, y la sección 11 de
> `npm run deuda` cuenta los ejercicios de examen que piden una demostración
> y no tienen `redactar`, con un trinquete en el modo estricto: el techo no
> sube, y cuando baja hay que bajarlo. Un ejercicio que pide dos
> demostraciones de familias distintas lleva dos pasos, cada uno con la suya
> (el primero, `ex1617-3ev-2`), y `scripts/revisa-ejercicios.mjs` dibuja la
> consigna y cada punto de la rúbrica, la compartida incluida, antes de
> construir.

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

> Es el único tipo **sin tolerancia**: una fórmula se acierta o no. Lo que sí
> tiene es normalización —`Fe₂O₃` vale igual que `Fe2O3`, y un nombre se
> compara sin tildes ni conectores— y **sinónimos obligatorios**, porque la
> nomenclatura admite dos formas válidas y el propio examen imprime las dos:
> «Plomo(II) hidróxido / hidróxido plumboso». Dar una por mala sería corregir
> peor que el profesor.
>
> Sabe diagnosticar cuatro errores sin que haya que declararlos como
> distractor: **mayúsculas** —`CO` es monóxido y `Co` es cobalto—,
> **paréntesis** —`CuOH2` por `Cu(OH)2`—, **subíndices** —los elementos
> correctos en la proporción equivocada— y **columna equivocada**, que es
> contestar con el nombre donde se pedía la fórmula.
>
> Y una lección de método: los 32 tests pasaban y aun así, **al teclearlo en
> el navegador**, `k2so4` en minúsculas recibía «has contestado en la otra
> columna» y un compuesto erróneo recibía «ese número no sale de ninguna vía
> razonable». Los dos son §16 punto 1: probarlo a mano encontró lo que los
> tests no buscaban.
>
> La segunda vez fue el 28 de septiembre de 2026, y la encontraron los 180
> compuestos de las hojas de formulación. Tres agentes que las transcribían
> por separado dieron con el mismo patrón mal cortado: para ser fórmula
> bastaba empezar por mayúscula. «Amoniaco», con la mayúscula que pone el
> móvil, recibía «has contestado en la otra columna»; «(NH4)2SO3» se comparaba
> como un nombre, sin caja; y `CuOH2` recibía «cuidado con las mayúsculas» con
> todas bien puestas. Veinte compuestos de dos controles no tenían ningún
> nombre de una sola palabra ni ninguna sal de amonio al principio: **un
> lector se prueba con el corpus que va a corregir, no con el que lo motivó.**
> Ese mismo día el aviso de la otra columna dejó de decir «lo que has escrito
> es correcto como compuesto», que el lector nunca ha comprobado.

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

### Las notas del enunciado

Lo que un cuadernillo imprime como «NOTA», «Nota importante», «NOTA 1»,
«IMPRESCINDIBLE» o «Notas a tener en cuenta» va, entero y tal cual, en el
campo `notas` del ejercicio, una cadena por bloque, y sale del `enunciado`.
La página lo pinta en su caja, «Nota del enunciado», y se imprime. Lo que
añadimos nosotros va en un párrafo final del enunciado que empieza por
«**Notas nuestras.**», nunca dentro de una frase impresa. Entró el 29 de
septiembre de 2026 con Fluidos, donde las notas puntúan —«los resultados sin
deducción de la expresión NO SON VÁLIDOS»— y ningún ejercicio las llevaba; en
Fluidos lo vigila `verify.mjs` contra el PDF (§11).

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

Con una excepción: los ejercicios de práctica nuestros que **no** son la
entrada —los de teoría escrita que existen para practicar un `redactar`,
como los de Materiales, o los propios de Cálculo t04— van **al final**,
detrás de la colección. No tienen número que respetar, pero tampoco abren el
tema, y delante romperían la referencia: el primer ejercicio dejaría de ser
el de la hoja. Se escribió el 29 de septiembre de 2026, con la teoría del tema
2 de Materiales; `calculo/t04` y `mecanica-aplicada/t06` ya lo hacían.

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

*Las historias con fecha que iban en esta sección —de dónde salen algunas de sus reglas— están en [`docs/porques/04-tema.md`](docs/porques/04-tema.md).*

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
| **2 · Construcción verificada** | paso `construir` + `patrones/Taller.astro`, en Expresión Gráfica |
| **3 · Ejercicio guiado** | `patrones/EjercicioGuiado.astro`, en todos los ejercicios |
| **4 · Verificador** | paso `verificar` + `sim/PlanoComplejo.astro` |
| **5 · Demostración** | paso `justificar`, con su pieza trampa, en todos los ejercicios |
| (*simulador*) | `sim/`, cuando el tema lo pide |

A 26 de septiembre de 2026 eran 83 temas, 1.948 ejercicios guiados, 33 pasos
`verificar` y 10 simuladores; la cifra al día la da `npm run deuda`.

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
  hay pasos ni pista, y el esquema de `banco` exige una sola correcta —salvo
  en las preguntas `varias` de las cuestiones, abajo—, un `porque` en cada
  opción —también en la buena— y las opciones que tiene el original, de dos
  a seis (el de Materiales fija cuatro). **Cada banco dice en su `fuente` de
  dónde salen sus preguntas**: las de Materiales son propias; las de Cálculo,
  las de las diapositivas de clase, con la respuesta y el porqué nuestros. Las
  de un examen real se transcriben como ejercicio, no como banco.
- **Las cuestiones**, `sim/Cuestiones.astro`, que no simulan nada: son un
  banco sin `puntuacion`, y se contestan una a una, sin reloj ni nota, con el
  porqué de cada opción al marcarla. Nacen el 28 de septiembre de 2026 (fase
  E3) para las preguntas tipo test de las diapositivas de Cálculo, que se
  debaten en grupo dentro del 20 % de trabajo en equipo y son el oral de la
  final. Cada banco tiene su página, `…/tNN-…/cuestiones/`, enlazada desde el
  tema y desde el temario de la asignatura. Si sale de unas diapositivas, el
  esquema exige que **cada diapositiva sea una pregunta o esté en
  `sinPregunta` con su motivo**: es el recuento contra el PDF, hecho regla.
  Hay diapositivas que preguntan «¿cuál es cierta?» y tienen más de una —a
  veces a propósito, para debatirlo; a veces porque una cota holgada también
  es una cota—: esas llevan `varias: true`, cada opción dice si es cierta o
  falsa, y un simulacro no las admite porque no sabría puntuarlas.
  Se transcriben con `scripts/revisa-banco.mjs` detrás, las figuras se
  redibujan con el lienzo (`scripts/figuras/calculo-cuestiones-tNN.mjs`) y
  los decimales van con coma, `0{,}5`, como en el resto del corpus. Lo que
  una diapositiva deja abierto —dos lecturas defendibles, un dibujo que no
  casa con sus opciones— no se esconde: la pregunta lleva encima un
  comentario `# Decisión:` que dice qué se marca y por qué, y el porqué de
  la opción descartada lo reconoce. Un dibujo impreciso se redibuja con lo
  que las opciones dan por hecho, y el comentario dice qué se ha cambiado.

**1 · Lectura.** Texto con una herramienta incrustada. Para contenido que se
sostiene solo y la figura apoya.

**2 · Construcción verificada.** La figura exacta de la colección se ancla y
el alumno la transforma construyendo sobre ella con herramientas de papel. Lo
que se corrige no es el trazo: son los puntos de la solución, por su nombre,
contra la geometría calculada en el build desde la `receta` del ejercicio
(§04). **Nunca es una secuencia de imágenes distintas**: es una sola lámina
que se transforma, y la solución se dibuja encima de ella al quinto fallo o en
el modo completo. Tres reglas que salieron de hacerlo:

- **Cada error declarado se construye.** Todo diagnóstico que no es `siempre`
  lleva un `ejemplo`, y el build comprueba que ese punto no se da por bueno y
  que lo recoge su diagnóstico y no otro anterior. Un error que no se
  construye no se sabe si salta.
- **Lista o elección, según lo que venga después.** Si el lado no cambia nada
  —los abatidos de SD4—, las posiciones buenas son una lista y valen todas. Si
  lo cambia —el cuadrado de SD5, donde C va al mismo lado que B—, es una
  elección, y la primera marca fija la rama.
- **La lámina se coteja encima del PDF** (`scripts/lamina-sobre-pdf.mjs`)
  antes de escribir el primer objetivo, y sus correcciones van en
  `revision.notas`. Un segmento desplazado un milímetro convierte una solución
  buena en un diagnóstico falso.

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

*Las historias con fecha que iban en esta sección —de dónde salen algunas de sus reglas— están en [`docs/porques/05-patrones.md`](docs/porques/05-patrones.md).*

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
fila, con su umbral y su razón. Si añades un color de texto, añade su fila. Un
relleno de figura también cuenta, porque el guion no distingue el `fill:` de
una letra del de una forma: el dorso de las mallas 3D, en `--rule`, tiene la
suya, medida contra las líneas que lleva encima.

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

### Los ejercicios de tema, de diez en diez (28 de septiembre de 2026)

El `<template>` bajó los nodos, no los bytes: el contenido de una plantilla
viaja y se analiza igual. La auditoría del 27 de septiembre midió la página del
tema 5 de Cálculo en **11,5 MB y unos siete segundos** con la CPU a un cuarto,
y **diecinueve páginas de tema pasaban de 3 MB**. El 97 % eran los ejercicios.

Desde la fase E4 cada ejercicio de tema vive en un **bloque de diez**,
`…/t05-integracion/ejercicios/2/`, y la página del tema se queda con la teoría
y el índice de los ejercicios, agrupado por bloque. Medido con `npm run peso`
el mismo día, a 390 px y con la CPU a un cuarto:

|  | HTML | nodos | lista en |
|---|---|---|---|
| `/calculo/t05-integracion/`, antes (auditoría) | 11,5 MB | 110.000 | ~7 s |
| `/calculo/t05-integracion/`, ahora | **0,4 MB** | **9.367** | **0,9 s** |
| el bloque más pesado, `…/t05-integracion/ejercicios/3/` | 2,8 MB | 22.461 | 0,7 s |

Lo que hay que saber:

1. **`src/lib/ejercicios.ts` es la única fuente del reparto.** La página del
   tema, la de cada bloque, las rutas de estudio y el índice de la paleta
   preguntan ahí dónde vive cada ejercicio (`paginaDeEjercicio`); nadie quita
   el `/ejercicios` de un id por su cuenta. Los de examen no se parten: un
   examen no pasa de quince ejercicios.
2. **Diez por número, no por peso.** Así la dirección de un ejercicio no cambia
   cuando se reescribe la resolución de otro. Sí cambia si se **inserta** uno
   delante: un enlace escrito a mano en un YAML, `…/ejercicios/3/#ej-…`, se
   queda apuntando al bloque viejo, y `verify.mjs` lo caza porque el ancla ya
   no aterriza en un id que exista. Se arregla el número del bloque; no se
   quita la comprobación.
3. **Los enlaces viejos siguen llegando.** Un `…/t05-integracion/#ej-…` de
   antes del cambio lo manda `Tema.astro` a su bloque con `location.replace`,
   leyendo las direcciones que la propia página publica en
   `data-direcciones`. Sin JavaScript se abre la pestaña del índice.
4. **El listón de 3 MB es un guardián.** `verify.mjs` no deja publicar una
   página de tema ni un bloque que pase de 3 MB (`scripts/peso-maximo.mjs`,
   un solo número para él y para `peso.mjs`). Las demás páginas se avisan y no
   se paran: tres rutas de estudio incrustan ejercicios y pasan de 3 MB, y
   partirlas es otra decisión, apuntada en `tasks/pendiente.md`.

*Las historias con fecha que iban en esta sección —de dónde salen algunas de sus reglas— están en [`docs/porques/07-matematicas.md`](docs/porques/07-matematicas.md).*

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

> Lo que **no** cambia: un enunciado de examen se reproduce tal cual y no se
> inventa. Un ejemplo introductorio no es un enunciado de examen, y por eso
> tiene que ir marcado en el dato, no solo en la intención.

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

*Las historias con fecha que iban en esta sección —de dónde salen algunas de sus reglas— están en [`docs/porques/08-contenido.md`](docs/porques/08-contenido.md).*

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

Lo seguro, con fuente, es Cálculo (no), Ingeniería Térmica (sí, con anexo de
tablas) y **Mecánica de Fluidos (sí)**, esta última desde el 10 de septiembre
de 2026: su guía la pide en el apartado 9.1 entre los conocimientos previos
necesarios —«habilidad y agilidad en el uso de la calculadora»—, así que deja
de ser una inferencia del tipo de ejercicios y pasa a tener fuente.

Desde el 28 de septiembre de 2026 lo dice la página de cada asignatura, en
«Qué puedes llevar al examen», que lee el campo `alExamen` del catálogo:
Fluidos y Química usan la **Casio fx-570SP CW**, científica y no programable
(lo contestó Ionan el 27); Materiales pide «calculadora científica, regla»
como materiales de uso obligatorio (guía, pág. 11), y Mecánica, «solo
calculadora» (guía). De Álgebra, Expresión Gráfica y Sistemas no hay nada
escrito, y la página cita en su lugar la norma de la UPV/EHU: nada salvo
indicación expresa.

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
- **La duración de un examen: manda la impresa.** Si el cuadernillo dice
  cuánto dura, esa es la del simulacro, y va en su `examen.yaml` (`duracion`,
  con la página donde está impresa). Donde no dice nada, la regla del catálogo
  (`duracionDelExamen`): la base es de 25 a 30 minutos por ejercicio, porque
  la duración real varía con los ejercicios de cada examen (dato de Ionan, 27
  de septiembre de 2026), y el modo exigente usa el extremo corto. Donde no hay
  ni lo uno ni lo otro, no se promete un reloj: la portada solo enseña el
  botón del simulacro donde la página del examen lo tiene.

  Y el reloj reparte por **ejercicio**, no por pieza: cuando un ejercicio se
  parte en varias piezas guiadas (`n` en el `examen.yaml`), sus piezas se
  reparten sus minutos. Hasta el 28 de septiembre de 2026 cada casilla valía
  un ejercicio entero, y tres convocatorias de Mecánica Aplicada arrancaban un
  reloj más largo que el que anunciaban (4 h para 3 h 30 min).
- **Los puntos de un examen: los que imprime el cuadernillo.** Si reparte por
  competencias, como Cálculo, van en el `puntos` de cada ejercicio. Si solo
  imprime un número por ejercicio —«EJERCICIO (3.50 puntos)», como Química—,
  van en `puntosImpresos` del `examen.yaml`, por número del cuadernillo y con
  la `fuente` de dónde están. Nunca se reparte un número impreso entre
  competencias ni entre las piezas de un ejercicio: eso es inventar (§10). Y
  el total solo se publica si el cuadernillo da los puntos de todos sus
  ejercicios. Fluidos imprime porcentajes, «1. (10%)»: van con `unidad: '%'`,
  como vienen, y si no suman 100 la página lo dice en vez de corregirlos.
- **Qué es el PDF de un examen (`pdfEs`).** `enunciado`, `resolucion` o, desde
  el 29 de septiembre de 2026, `enunciado-con-resultados`: el cuadernillo de
  Fluidos trae el resultado de cada apartado sin resolverlo, y la página dice
  que las resoluciones son nuestras y llegan a esos resultados, o dónde no.
- **Una convocatoria sin PDF dice por qué.** El esquema exige `pdf` o
  `sinPdf`, nunca ninguno. Entró el 28 de septiembre de 2026 con las dos
  resoluciones oficiales de Química: una es un escaneado, y los escaneados de
  exámenes no se publican; la otra es la corrección del profesor, y §08 solo
  deja entrar en `public/examenes/` enunciados oficiales —la de Térmica se
  publicó por una decisión expresa de Ionan, y esta no la tiene—. El
  enunciado se transcribe tal cual igual, y la página dice en el sitio del
  botón por qué no hay PDF.

*Las historias con fecha que iban en esta sección —de dónde salen algunas de sus reglas— están en [`docs/porques/10-fisica-y-datos.md`](docs/porques/10-fisica-y-datos.md).*

---

## 11 // Suelo de calidad

`npm run suelo` es una sola línea, la misma en local y en el despliegue —el
flujo de GitHub Actions la llama tal cual—, y son diez pasos en este orden.
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
| `talleres` | que cada taller de Expresión Gráfica se deje construir, fallando a propósito | `scripts/comprueba-talleres.mjs` |

Los cuatro que abren un navegador —`contraste`, `humo`, `sim` y `talleres`—
levantan su propia vista previa con `scripts/servidor.mjs`, y por eso **dos no
pueden correr a la vez**: cada uno para el servidor del otro al arrancar. En el suelo
van encadenados y no chocan; lanzar uno a mano mientras corre el suelo, sí
(§17). El suelo entero tardó 26 minutos el 26 de septiembre de 2026, veinte
de ellos en el humo: se lanza en segundo plano, con la salida a un fichero
completo, y no se toca `dist/` mientras corre.

> **En el Windows de desarrollo, el compilador de Astro va en WebAssembly.**
> Desde el 28 de septiembre de 2026, Smart App Control bloquea el binario
> nativo sin firmar de `@astrojs/compiler-binding` (error 4551 al cargar
> `astro.win32-x64-msvc.node`), y `astro build` no arranca. Esa misma tarde lo
> había dejado pasar. El cargador del paquete prueba la versión WASI si la
> nativa falla, pero npm no la instala fuera de su plataforma. Se instala sin
> tocar `package.json` ni el lockfile —`npm install --no-save --force
> @astrojs/compiler-binding-wasm32-wasi@<la versión de compiler-binding>`— y se
> construye con `NAPI_RS_FORCE_WASI=1`. Un `npm ci` la quita, y hay que volver
> a ponerla. El despliegue, en Linux, no lo necesita.

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
- **Las notas impresas de Fluidos, en sus enunciados** (29 de septiembre de
  2026). Vuelca cada PDF de examen con `pdftotext`, lo parte por la fecha de
  cada examen y por ejercicios, y comprueba que cada «NOTA:» de un ejercicio
  transcrito está en sus `notas` (§04; la regla, en
  `scripts/notas-impresas.mjs`, con sus tests). Nació avisando de 29 sin
  transcribir y bloquea desde el 30 de septiembre de 2026, cuando las 37
  notas de los dieciséis exámenes quedaron dentro (`NOTAS_BLOQUEAN`). Sin
  `pdftotext` falla, no se salta: en Windows viene con Git, y en el CI lo
  instala `deploy.yml` (poppler-utils), la única herramienta del sistema que
  el suelo pide además de Node y Chromium.

### `scripts/humo.mjs` — abre el sitio en un navegador

Leer el HTML demuestra que algo **está**, no que **funcione**. El 19 de agosto
de 2026 se colaron tres fallos invisibles a `verify.mjs`: una raíz cuadrada con
MathML correcto que el navegador no dibujaba —el enunciado decía −3/2 donde
debía decir −√3/2—, unas pestañas que no enganchaban sus manejadores porque dos
componentes usaban el mismo `data-tema`, y un `data-ir` compartido que habría
ocultado los dos paneles.

Comprueba, en Chromium y sobre cada página de tema y cada bloque de sus
ejercicios —los bloques no los enlaza la portada, así que los saca de la página
de cada tema, y un tema cuyo índice lista ejercicios sin enlazar ningún bloque
es un fallo—:

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

### `npm run talleres` — que un taller se deje construir

En el suelo desde el 27 de septiembre de 2026, con el primer taller: SD1, en
el tema 2 de Expresión Gráfica. La lógica de un paso `construir` ya la
comprueba el build —`lib/construir.ts` construye cada error declarado y exige
que salte con su diagnóstico—, y en un segundo `tests/geometria/
construcciones.test.ts`, que resuelve todos los ejercicios con receta. Lo que
ninguno de los dos ve es **el cableado**: que un clic en la lámina enganche al
punto que toca, que la marca se corrija, que el mensaje llegue a la caja del
paso, que la pista salga al tercer fallo y la solución al quinto, y que al
terminar se abra el paso siguiente.

Construye como un alumno, en claro y en oscuro, a 1280 y a 360 px: llega al
taller resolviendo los pasos de antes —no con el modo completo, que ya dibuja
la solución y haría verde la comprobación del quinto fallo sin mirar nada—,
traza una vertical por cada objetivo, marca antes un punto un centímetro
desplazado y después el bueno. En el primero deja además una recta a medias
antes de marcar, para ver que marcar la abandona —lo encontró el revisor de
código el mismo día, y el caso sale en rojo sin el arreglo—. Al final
comprueba aparte, en una carga limpia, que el modo completo dibuja la
solución.

Validado al revés: con el evento `taller:fb` desenganchado a propósito en
`EjercicioGuiado`, los cuatro objetivos de SD1 salen en rojo, bien y mal
marcados, en las cuatro pasadas. Antes había salido en rojo por dos fallos
suyos, que conviene no repetir en el siguiente guardián de navegador: buscaba
la pestaña de ejercicios con un atributo que el sitio no usa —y un `catch`
vacío se tragaba el error—, y el punto malo de Q₁ caía 0,24 pt fuera de la
lámina.

**Las láminas densas** (1 de octubre de 2026, con los Ejercicios 53 a 55 de
la colección, los primeros talleres en una página de examen). Tres cosas:
- en un examen los ejercicios van en la pestaña de resoluciones, y el guion
  la abre;
- el Taller tiene una **lupa** (×1 a ×4) y el guion la usa lo justo para
  que el imán separe cada objetivo de sus vecinos. Su radio se mide con la
  escala de la pantalla, no con un número fijo, y la línea de apoyo de cada
  punto se engancha a un cruce sin otro al lado, o a una horizontal si la
  vertical no lo tiene;
- si aun así el punto construido no queda en su sitio —el imán se lo lleva
  a otra cosa de la lámina—, se crea por la **puerta de pruebas** del Taller
  (el evento `taller:punto`, sin botón: el alumno no la ve) y se avisa sin
  bloquear. Lo único que falla es un punto exacto que el Taller no acepta.

**Las aristas** (7 de octubre de 2026): cada tramo se prueba dos veces, por
la puerta de pruebas `taller:arista` con el tipo cambiado —tiene que decir su
porqué y no quedarse dibujado— y como un alumno, con su herramienta y sus dos
extremos; si el imán se lleva un extremo, por la puerta, y se avisa.

`TALLERES_SOLO=ejercicio-54 npm run talleres` prueba solo las páginas cuya
ruta lo contiene.

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

**Y mide el color al que se llega, no uno de paso.** El navegador prefiere el
tema que se mide —el script de la cabecera lo pone antes del primer pintado,
como a un alumno con el oscuro elegido— y las transiciones se apagan mientras
mide. No era así hasta el 26 de septiembre de 2026, y en la máquina de GitHub,
más lenta, leía un fotograma a medias: la tinta ya oscura sobre el fondo de un
botón todavía claro, 1,09:1. **Los despliegues del 24 y del 26 cayeron por eso
con el suelo local en verde**, y el del 24 dejó sin publicar el simulador del
test de mínimos durante dos días sin que nadie mirara el resultado del
despliegue. Se reprodujo aquí frenando la CPU seis veces. Dos lecciones: **un
guardián que depende del tiempo no vale en una máquina distinta** (§17, las
figuras en el CI), y **subir no es publicar: después de un `git push` se mira
que el despliegue termine en verde** (`gh run list`).

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

*Las historias con fecha que iban en esta sección —de dónde salen algunas de sus reglas— están en [`docs/porques/11-suelo.md`](docs/porques/11-suelo.md).*

---

## 12 // Git y despliegue

- Conventional Commits, mensaje en castellano.
- **No se versionan binarios generados.** Los PDFs son artefactos de build.
- Si un fichero pesa más de 1 MB, se justifica antes de añadirlo.
- Nombres de fichero en minúscula, sin espacios ni acentos, con guiones.
- Despliegue por GitHub Actions al subir a `main`: `npm run suelo` —la misma
  línea que en local, §11— y, si pasa, el diario en PDF y la publicación.
  Un push que solo toca `tasks/`, `diario/` o `docs/` no despliega: lo
  comprueba `documentos.yml` —`verify --solo-fuente` y `npm run cifras`—, y el
  diario en PDF se pone al día en el siguiente despliegue entero.
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

- **La prueba de utilidad.** Toda pieza nueva —componente, página, guardián,
  herramienta— escribe antes cuatro cosas: **para quién** es (qué alumno, o
  quien mantiene el proyecto), **cuándo** la usa, **qué gana** —en puntos de
  examen o en horas— y **cómo se comprueba que sirve**: un caso, una medida,
  una validación. Si no se pueden rellenar, no se construye. Lo pidió Ionan
  el 27 de septiembre de 2026: «que cada idea que entre en el proyecto sea
  realmente útil para alguien». Las cuatro respuestas van en el comentario de
  cabecera de la pieza, que es donde las busca quien la quiera quitar.

- **Diez diagnósticos por sesión, revisados por quien no los escribió.** Los
  tests recalculan las respuestas buenas y nadie mira los mensajes: un
  distractor que explica un error que no da ese número, o una pieza trampa que
  no es falsa, pasan todos los guardianes en verde. `node
  scripts/muestra-distractores.mjs` saca diez al azar de los tres montones
  —distractores, opciones equivocadas y piezas trampa—, con la fecha como
  semilla para que todos miren los mismos; los revisa alguien que no los haya
  escrito, lo que esté mal se corrige, y el resultado va en el diario del día.
  Lo pidió la auditoría del 27 de septiembre de 2026 (fase E5).

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

*Las historias con fecha que iban en esta sección —de dónde salen algunas de sus reglas— están en [`docs/porques/13-como-trabajar.md`](docs/porques/13-como-trabajar.md).*

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

*Las historias con fecha que iban en esta sección —de dónde salen algunas de sus reglas— están en [`docs/porques/15-asignatura-terminada.md`](docs/porques/15-asignatura-terminada.md).*

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

*Las historias con fecha que iban en esta sección —de dónde salen algunas de sus reglas— están en [`docs/porques/16-comprobar.md`](docs/porques/16-comprobar.md).*

---

## 17 // Trampas conocidas

Cosas que ya han costado horas. No son opiniones.

<!-- índice de trampas: lo genera un guion a partir de las entradas -->

**Las 61, en una línea cada una** —el detalle y el porqué, en su entrada de [`docs/porques/17-trampas.md`](docs/porques/17-trampas.md) y en este mismo orden—:

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
- En esta máquina hay dos `pdftotext`, y no vuelcan igual.
- El volcado no es la página.
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
- En Zod 4, un `z.record` con claves de un enum las exige todas.
- Un deslizador recorta su `value` contra el `max` que tiene EN ESE MOMENTO.
- Dos valores de un deslizador de paso 0,1 no se restan exacto, y un arreglo que se llama a sí mismo no para.
- `content-visibility: auto` mueve la página mientras la mides.
- Un enunciado transcrito conserva los números y pierde las notas.

<!-- fin del índice de trampas -->

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
