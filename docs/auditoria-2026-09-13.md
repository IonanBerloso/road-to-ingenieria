# La auditoría completa · 13 de septiembre de 2026

De principio a fin, con el sitio en el estado en que quedó al cerrar Mecánica
Aplicada: **nueve asignaturas, seis terminadas, 246 páginas, 1.742 ejercicios,
7.468 pasos, 15 rutas, 124 bloques, 328 escalones, 9 simuladores.**

Se barrió en cinco frentes a la vez, y cada frente sin ver lo que encontraban
los otros:

| frente | qué miró |
|---|---|
| §15 asignatura por asignatura | los nueve criterios de cierre, uno a uno, contra los nueve catálogos |
| las quince rutas contra §14 | los 328 escalones: orden, rampas, anclas, `falta[]`, `dominio` |
| todas las cifras publicadas | remedidas contra el repositorio, en CLAUDE.md, `docs/`, los README y los YAML |
| código y arquitectura | los guardianes, la duplicación de §01, el peso, la accesibilidad |
| honestidad y datos personales | las 1.742 `fuente`, los 128 PDF publicados y el histórico entero de git |

Este documento es el resultado y la lista de trabajo que sale de él. Lo que ya
está arreglado va tachado con su fecha; lo que queda, ordenado por lo que
cuesta que siga roto.

---

## Lo primero, porque es lo que no puede esperar en un repositorio público

**Datos personales: limpio.** No hay ni un dato personal de terceros publicado,
y no lo ha habido nunca.

- Cero ficheros con «notas», «calificaciones», «lista» o «grupo» en el nombre,
  en `src/`, `public/`, `docs/`, `tasks/`, `diario/`, `dist/` **y en el
  histórico completo de git** (`git log --all --diff-filter=A`). Los doce
  documentos vetados nunca han entrado. Ninguno se abrió para comprobarlo.
- Cero citas a esos documentos en ninguna `fuente`, comentario o nota.
- Los **128 PDF publicados**, mirados por su primera y su última página —104
  por su capa de texto, y los 24 escaneados renderizados a imagen y mirados uno
  a uno—: todo enunciados o resoluciones, con las cabeceras de «APELLIDOS /
  DNI / GRUPO / CALIFICACIÓN» **en blanco** en todos los casos. Extraído además
  el texto completo de los 128 y buscados DNI, correos, teléfonos y secuencias
  de nombres: **cero**.
- `.gitignore` sostiene la regla: `*.pdf` vetado con la única excepción
  `!public/examenes/**/*.pdf`, y `git ls-files` confirma 0 PDF fuera de ahí.

Dos apuntes que no son incumplimientos y conviene tener escritos: la portada de
`examenes-2020-2025.pdf` de Fluidos lleva los cinco profesores autores del
departamento —autoría de un documento docente oficial, no datos de alumnos—, y
`fluidos-ord.yaml` publica «Eso lo aporta **Ionan**», que es una nota de
trabajo colada en la prosa publicada.

---

## El patrón que explica la mitad de los hallazgos

Los cinco frentes, por separado, encontraron **la misma clase de fallo** como
el más repetido: *una cifra que era verdad el día que se escribió, que dejó de
serlo al crecer el proyecto, y que nadie volvió a medir.*

El ejemplo que lo resume no está en ninguna de las cinco listas, porque lo
encontró Ionan mirando la pantalla: **la portada ya no cabía en un monitor**.
El código pintaba un botón «Entrar a X →» por cada asignatura terminada
mientras el comentario de al lado —escrito por el mismo código— decía «los
**dos** accesos directos del héroe». Fue verdad con dos asignaturas. Con seis
eran cuatro filas y 1.108 px en una pantalla de 768. Nadie mintió: el proyecto
creció y la frase se quedó quieta.

Contadas, la misma forma aparece **treinta y dos veces** en la documentación:
dieciséis en CLAUDE.md, doce en `docs/como-vamos.md`, cuatro en
`tests/verificacion/README.md`. Y una vez en una página publicada.

La conclusión operativa no es corregir las treinta y dos —eso las deja caducar
otra vez el martes—, sino **medirlas**. Ese es el cambio de fondo que sale de
esta auditoría, y está hecho: `deuda.mjs` §10.

---

## Lo arreglado hoy

### Crítico

**~~Cuatro PDF ajenos publicándose sin que ninguna página los enlazara.~~**
Los dos enunciados y las **dos resoluciones manuscritas completas del
profesor** de las convocatorias 2014-2015 de Térmica, servidos desde el 24 de
agosto en `public/examenes/ingenieria-termica/`. Publicar la resolución del
profesor es justo lo que §00 dice que no me corresponde decidir. Y un fichero
en `public/` se publica **por estar**, no por estar enlazado. *Retirados.*

**~~Nadie comprobaba el sentido disco→YAML, y el proyecto afirmaba que sí.~~**
`como-vamos.md` y un comentario de `content.config.ts` daban por automatizado
un control que no existía: el único guardián de PDF iba YAML→disco. Por eso los
cuatro llevaban tres semanas ahí. *`verify.mjs` recorre ahora
`public/examenes/` y lo compara con los `pdf:` de las convocatorias —«todo PDF
servido lo enlaza una convocatoria, 124 de 124»—. Encontró seis a la primera;
dos eran falso positivo del propio guardián, que no leía la forma de lista.*

**~~«Sin resolución detrás» era falso.~~** La ruta de Térmica y `como-vamos.md`
justificaban no transcribir las 2014-2015 con dos razones, y una no se sostenía:
la resolución existe, manuscrita y **en castellano**. El enunciado sí está solo
en euskera, así que la decisión no cambia — cambia el motivo, y el motivo se
publica.

### Cifras publicadas que no se sostenían

**~~Cinco rótulos de tiza de la ruta de Térmica seguían medidos sobre seis
convocatorias~~**, al lado de pastillas medidas sobre diecisiete. El peor decía
«la piden **las 6 convocatorias**» sobre un bloque que cae **8 de 17** — el
rótulo decía *todas* y el dato decía *menos de la mitad*, a dos centímetros uno
del otro. Su `criterioDeOrden` abría además con «los siete bloques caen en las
diecisiete», que no cumple ninguno.

**~~«Las dos convocatorias que preguntan por este tema»~~**, en la página
publicada del tema 2 de Química. Son **tres**, y el propio corpus lo sabía: un
comentario de la que faltaba dice «es el tercer enunciado de los seis».

**~~Siete recuentos caducados~~** en CLAUDE.md, `como-vamos.md` y
`tests/fisica/README.md`: 107 casos de física donde hay 153, 227 páginas donde
hay 246, 13 rutas / 110 bloques / 295 escalones donde hay 15 / 124 / 328, 86
casos en el README de física donde hay 153. **Y los cinco los compara ahora
`deuda.mjs` §10 en cada ejecución.**

**~~«Las otras tres siguen en `prev`: Expresión Gráfica, Mecánica Aplicada y
Sistemas de Producción»~~**, en `como-vamos.md`, con Mecánica cerrada el día
antes y Sistemas en `obra`. Es la **quinta** vez que ese párrafo envejece por
lo mismo, y las cuatro anteriores están confesadas justo debajo de él. Ya no
repite la lista: dice dónde está la verdad —el catálogo— y manda allí. Y la
sexta la caza el guardián.

**~~El índice de exámenes prometía a cinco asignaturas un reparto de puntos que
no tienen.~~** La `<meta description>` decía «con el enunciado original y el
reparto de puntos por competencia» sin condicional, y de las seis cerradas solo
Cálculo publica `puntos`. La página de detalle sí lo condicionaba bien; el
índice se había quedado sin el condicional. *Copiado.*

### Código

**~~`.montaje li` estaba en un `<style>` con ámbito y los `<li>` los crea el
navegador.~~** El paso `justificar` se publicaba **sin estilos en los 1.742
ejercicios del sitio**. Es exactamente el fallo que se acababa de corregir en
los nueve simuladores, escondido en el patrón más usado del proyecto. *Dos
`:global()`.*

**~~El CI repetía a mano los cinco pasos de `suelo`.~~** Eran dos definiciones
del suelo de calidad escritas por separado, así que una comprobación añadida a
`suelo` **no bloqueaba el despliegue** — y §11 afirmaba que sí. *Ahora el
workflow es una línea: `npm run suelo`.*

### Honestidad del corpus

**~~Dos `fuente` que decían lo contrario que su propia resolución.~~** La peor,
en el ejercicio 3.7 de Térmica: la `fuente` afirmaba «sus tres respuestas se
reproducen con las tablas del propio curso» mientras el desarrollo, cuatro
pantallas más abajo, explicaba que la colección publica «14,2 ºC» y sale
**140,2**. La otra, el centro de gravedad del cuarto de elipse de Cálculo,
callaba una errata del boletín que **su gemelo de examen sí declaraba**: mismo
problema, dos tratamientos opuestos.

### Huecos que existían y no se declaraban

**~~Mecánica Aplicada declaraba dos huecos en toda la asignatura~~** —12 temas,
250 ejercicios, dos rutas—, cuando §00 le atribuye cuatro. Los otros dos vivían
en comentarios YAML invisibles. Ahora están en el `falta[]` que le toca: que de
sus **ocho** convocatorias solo se publican **tres** (las otras cinco, en
euskera, no van a llegar), y que el bloque 2 está medido sobre exámenes de 2018
y 2019 — **siete años**, la medición más antigua del sitio — con seis de sus
siete bloques sin un solo ejercicio de examen que hacer.

**~~La ruta del bloque 2 afirmaba que «el índice de exámenes las declara
imposibles».~~** No las declaraba: la palabra «euskera» no aparecía en ninguna
página construida más que en el enlace a la propia ruta. Era una afirmación
sobre el producto escrita desde el fichero, sin comprobar el producto.

**~~La ruta del bloque 2 no decía que también prepara la ordinaria y la
extraordinaria~~**, que cubren los doce temas. *`tambienPrepara` añadido.*

**~~Los temas 7 a 10 de Ciencia de Materiales se publicaban como iguales a los
otros seis.~~** Medidos con `mide.mjs`: los temas 3 a 6 tienen entre 1.768 y
2.874 palabras, de 3 a 7 figuras y de 6 a 31 ejercicios. Los temas 7 a 10
tienen entre 855 y 1.363 palabras, **una** figura y **dos ejercicios, que son
sus dos ejemplos propios** — ni uno de colección, porque no hay colección suya:
son los temas sin material de la profesora. La etiqueta del catálogo lo dice
ahora.

---

## Lo que queda

### 1 · Térmica 2025-2026: enunciados reconstruidos presentados como de examen

**Es lo más grave que queda, y es §08 en su forma más seria.** El examen tiene
**3 ejercicios** y el sitio publica **7**, con los enunciados **reescritos**,
no partidos. Contrastado contra el PDF original:

- `exter2526-ord-1-el-exponente-que-sale-del-calor` **añade un apartado que no
  existe** («a) La temperatura inicial del aire»), que es un paso intermedio de
  la resolución oficial;
- dos ejercicios incrustan **en el cuerpo del enunciado** valores calculados
  —557,5 K, 134,144 kPa, n = 1,705, cₙ = 0,3107, W = 314,25 kJ, S_G = 0,2415
  kJ/K— que no están en el original;
- uno empieza «El condensado **del ejercicio anterior**», referido al ejercicio
  *del sitio*, no del examen.

Ninguna `fuente` lo dice. Y la solución buena existe en el propio repositorio:
`ingenieria-termica/examenes/2020-2021-ord/` transcribe literal y añade los
datos arrastrados en un bloque en cursiva rotulado «*Lo que hace falta del
ejercicio anterior…*». Ese es el patrón. `2025-2026-ext` publica 4 por 3 y
merece la misma revisión.

### 2 · Nueve `fuente` más que callan una discrepancia que la resolución sí cuenta

El fallo es sistemático y siempre igual: **la discrepancia se explica en la
resolución pero no sube a la `fuente`**. En cinco de ellas falta además el
valor impreso como distractor, que es la mitad del arreglo.

`calculo/t05-integracion:3096` y `:5734` · `fluidos/t07-fuerzas-superficies:3866`
· `fluidos/t21-canales:4443` · `fluidos/t15-aplicaciones-tcm:1479` ·
`fluidos/t25-bombeo:3937` y `:3284` · `ciencia-materiales/t03:2630` ·
`ingenieria-termica/examenes/2022-2023-ext:205`, `2020-2021-ord:210`,
`2020-2021-ext:470`.

Al revés, el cumplimiento es alto donde se declara: de las **56 `fuente`** que
anuncian divergencia, casi todas cumplen la regla entera, y **Mecánica Aplicada
la cumple al 100 %** en sus ~25 casos. Sirve de plantilla.

### 3 · Seis de los nueve simuladores no comparan contra nada externo, y el guardián dice que sí

`comprueba-simuladores.mjs` abre diciendo «que al pulsar "tubo corroído" salga
el 0,0417 que publica el examen», y sus propios campos `fuente` dicen otra
cosa en seis casos: «los dos ejemplos del propio tema», «la figura del propio
tema», «el error típico del propio tema», y uno con `pruebas: []`.

El caso más limpio está en CLAUDE.md §11: «volver a poner `D/e = 40` daba 215
mca donde **el examen dice 228**». El 228 no sale de ningún examen — sale de
`fluidos/t20-golpe-ariete/index.mdx:218`, prosa nuestra. La regresión de
validación se validó contra nosotros mismos.

*Medio hecho:* `tests/fisica/README.md` ya publica la distinción, fila por
fila —3 con ancla externa, 2 mixtas, 3 propias—. Falta corregir el encabezado
de `comprueba-simuladores.mjs` y la frase de §11. Ponerles ancla de verdad
exige exámenes que en Materiales y en el bloque 2 de Mecánica **no existen**:
eso no es trabajo, es material.

### 4 · Álgebra: sus dos rutas nunca pasaron por los criterios

- **12 de sus 35 escalones** ponen el ejercicio de examen **delante** de los de
  boletín. Es la forma exacta del problema que hizo nacer el escalón en agosto.
- **`revisado` = 0 en los 12 bloques**, las únicas del sitio junto con Fluidos.
- De sus 14 `falta[]`, **9 están tachadas**: declara **5 huecos abiertos** en
  la asignatura que pide demostrar en el 75 % de sus ejercicios de examen.

Son las rutas más cortas del repositorio sobre la asignatura más previsible:
arreglarlas es barato y rinde mucho.

### 5 · `calculo-ext` no ordena como dice que ordena

Su `criterioDeOrden` promete «los huecos ordenados por cuántos años caen». El
orden real del primer cuatrimestral es 11 → 7 → 6 → **8** → 5 → **9** → 3, y el
del segundo mete `el-gradiente` (3 de 11) por delante de curvilínea (8) y
Fourier (6). `calculo-ord`, escrita con el mismo criterio, sí lo respeta —así
que es un desliz de una ruta, no del sistema—, pero es la segunda más grande
del sitio y quien la sigue en orden estudia el gradiente antes que la
curvilínea.

### 6 · Rampas: `deuda.mjs` da 0 sin rampa y la escalera falla de tres formas más

Verificados los 328 escalones uno a uno:

- **21 saltan del ejemplo de entrada al ejercicio de examen** sin nada en medio
  (Química 8, Cálculo 6, Térmica 2). El criterio se aplicó a **bloque**, no a
  **escalón**, y por eso pasan.
- **13 son `practica → examen` y nada más**, y ahí «ejercicio de colección» no
  significa «suave»: `fluidos-ord / conducciones / la-linea-piezometrica`
  arranca con el sifón de queroseno que cavita.
- **10 tienen un solo ejercicio**; cinco son de Mecánica y son **un ejemplo
  propio cada uno y nada más**.

### 7 · Guardianes que dicen comprobar más de lo que comprueban

Es la categoría con más rendimiento por hora, porque un guardián que se cree
más fuerte de lo que es hace más daño que uno que falta.

| guardián | lo que dice | lo que hace |
|---|---|---|
| `verify.mjs` | «foco visible en todo elemento interactivo» | busca `outline: none`; un botón **sin** regla de foco pasa |
| `verify.mjs` | «`prefers-reduced-motion` en toda animación» | comprueba que la cadena aparezca en `base.css`. `EjercicioGuiado:634` hace `scrollIntoView({behavior:'smooth'})`, que el CSS **no** anula: es la única animación del sitio que ignora la preferencia |
| `verify.mjs` | «`alt` en toda imagen» | el sitio publica **cero** `<img>`; las 383 figuras son SVG en línea y ninguna regla les exige nombre accesible. Lo tienen las 383 por disciplina, no por guardián |
| `check-color.mjs` | «contraste y daltonismo» de la paleta | solo `--d1..--d6` y solo contra `--paper`. Fuera: `--panel`, la paleta de pizarra entera, los `--barra-*`. **Y si se renombra un token la lista queda vacía, los bucles corren cero veces y el guion imprime «Paleta verificada» y sale 0** |
| `humo.mjs` | «un cero aquí es una asignatura que el navegador no abre» | cuenta claves presentes; una asignatura con cero páginas no produce clave, produce **ausencia**. Ese cero es inalcanzable |
| `humo.mjs` | 360 px | mide **seis páginas fijas** que nunca rotan, ignora `HUMO_TODO`, se traga el fallo de abrir la resolución, y **nunca abre una página de tema** |
| `humo.mjs` | «cero errores de JavaScript en consola» | la portada se abre **sin escuchas de error**, y es la página con FLIP, `:target` y paleta de comandos |

Y dos tokens de la barra de reparto se usan como color de texto contra lo que
dice su propio comentario: `--barra-justificar` da **3,50:1** sobre `--panel`,
por debajo del 4,5:1 de AA.

### 8 · Duplicación de §01, por coste de la próxima omisión

1. **La lista de asignaturas, tres veces dentro de `content.config.ts`** — el
   fichero que documenta por qué eso está prohibido. Olvidar la tercera hace
   desaparecer una asignatura **en silencio**, que es el modo de fallo que su
   propio comentario describe.
2. **La URL de un examen, cuatro veces.** La cuarta es una *comprobación* de
   que la carpeta case con la regla: un autocontrol escrito contra una copia.
3. **Los rótulos de convocatoria, dos veces en el mismo fichero.**
   `index.astro:41-48` duplica `CONVOCATORIAS[k].corta`, importado en la línea
   19, y cubre 7 de las 17 claves: **Química y Mecánica salen con el título
   largo mientras Cálculo sale corto, y se ve en pantalla.**
4. **Los estados del catálogo, dos veces en cuatro líneas** del mismo fichero.
5. `revisa-ejercicios.mjs` reimplementa el esquema y **ya diverge**: exige
   `titulo` ≥ 5 caracteres donde el esquema exige ≥ 3.

### 9 · Lo demás, en una lista

- **Cálculo**: `PlanoComplejo` es el único simulador sin caso en
  `tests/fisica/` y el único con la física dentro del `.astro`. Es la
  asignatura que §15 usa de patrón de medida.
- **Fluidos**: cinco convocatorias transcritas —los parciales de 2019-2021—
  fuera de toda ruta, sin decirlo. Y declara 23 temas enlazando teoría de 19.
- **Química y Fluidos** tiran un reparto de puntos que el examen **sí imprime**
  («3,50 · 2 · 2 · 0,50 · 2»), porque el esquema solo sabe guardarlo por
  competencia.
- **Química**: las dos rutas prometen «cada bloque lleva anotada la fecha en
  que se revisó» y la tienen 3 de 7 y 2 de 8.
- **`calculo-ord`**: `medidoSobre: 11` con **12** ordinarias transcritas, y su
  propio `lede` dice «diez de las **doce**».
- **Peso**: `dist/calculo/t05-integracion/index.html` son **7,7 MB** de HTML
  con 3.431 fórmulas KaTeX. Por cable son 468 KB con gzip; el problema es el
  DOM. Ocho páginas más pasan de 3,8 MB.
- **Los nueve simuladores no anuncian sus resultados**: el `.readout` son
  `<span>` sin región viva, así que quien usa lector de pantalla oye lo que
  mueve y no lo que sale. El patrón correcto ya está en `EjercicioGuiado`.
- **Código muerto medido**: `EXP_HW`, `fLisoKarman`, `subcapaRelativa`,
  `ADIMENSIONAL`, `.rotulo--ink`, el token `--step`. Los dos de física, con
  cuidado: puede que el ábaco debiera estar usándolos.
- **Diez superlativos falsos en comentarios de `examen.yaml`** —tres exámenes
  distintos reclaman «el más largo del corpus»— que no se renderizan, pero se
  contradicen entre sí.

---

## El veredicto, asignatura por asignatura

| asignatura | estado | veredicto |
|---|---|---|
| **Álgebra** | ok | **en orden**, con la salvedad de sus dos rutas sin revisar (§4) |
| **Cálculo** | ok | **bloqueada por una casilla**: `PlanoComplejo` sin caso de física. Un fichero. Es la asignatura de referencia de §15 y es la única que le falta |
| **Química** | ok | en orden, con el reparto impreso que se tira |
| **Fluidos** | ok | la más fuerte en contenido de las nueve —51 escalones, 21 huecos abiertos declarados con su fuente— con los parciales fuera de ruta sin decirlo |
| **Térmica** | ok | cumplía §15 y **incumplía §08** por los cuatro PDF, ya retirados. Queda la reconstrucción de 2025-2026 (§1), que es lo más grave del informe |
| **Mecánica Aplicada** | ok | se abrió y se cerró en 24 horas, y se notaba **en los dos criterios que §15 puso para que no se pudiera ir rápido**: convocatorias sin declarar y `falta[]` casi vacío. Los dos arreglados hoy |
| **Ciencia de Materiales** | obra | **bloqueada por material, confirmado.** 152 + 7 ficheros y ni un examen: `Normativa_sobre_Exámenes` y `AZTERKETAN OHAR LUZEA` son avisos, no convocatorias. La afirmación del proyecto es exacta |
| **Sistemas de Producción** | obra | **bloqueada por material solo a medias.** No hay exámenes, cierto, y no hay diapositivas de soldadura, cierto. Pero **sí** están los nueve juegos de temas y la `Colección_problemas_2025-26.pdf` con su `Problema6_resuelto`: hay material para escribir cinco de sus seis bloques y su colección, y el sitio no publica nada. Lo bloqueado por material son **la ruta y las convocatorias**; los temas, las figuras y la colección son **trabajo** |
| **Expresión Gráfica** | prev | **no la bloquea el material.** Hay temario completo, `Colección_de_ejercicios.pdf`, `Ejercicios_-_Solución.pdf`, criterios de corrección y presentación. Lo que la bloquea es que su examen es un dibujo y hace falta una fase de diseño — eso es cierto y es trabajo. Lo evitable hoy es que siga con `temarioOficial: false` y sin `evaluacion`, teniendo el temario y los criterios entre el material |

Y una comprobación de paso: §00 decía «ninguna de las cuatro que quedan trae
exámenes en el material». Cierto para las tres de arriba; la cuarta era
Mecánica Aplicada, **que sí los traía** — y el propio fichero ya lo corrige.

---

## Lo que una segunda auditoría, hecha por la noche, corrige de esta

El mismo 13 de septiembre, ya con estos arreglos subidos, una auditoría
independiente barrió el repositorio sobre el commit `290c722`. Está en
`2027 proyecto contenido/auditorias/auditoria-2026-09-13-externa.md`. No todo
lo que dice es nuevo —coincidimos en lo grave—, pero **encontró tres cosas que
esta se dejó**, y una de ellas es incómoda.

**1 · Los veinte PDF de Térmica tampoco son enunciados.** Tienen de **14 a 32
páginas** cada uno, 58 MB entre los veinte, y son la resolución completa del
profesor con el enunciado citado en un recuadro arriba. Esta auditoría retiró
esa misma mañana cuatro PDF de esa misma carpeta **por ser resoluciones del
profesor** — y no miró los veinte que quedaban. El criterio que usó fue «no los
enlaza nadie», y ese criterio le tapó el otro: dos guardianes mirando el mismo
estante y ninguno preguntando qué había dentro. Peor, el sitio los llamaba «su
**enunciado original** en PDF» en cinco sitios, rematando con «el mismo que se
repartió en el aula». *Corregido con el campo `pdfEs`; si se siguen publicando
o no es decisión de Ionan y está en `tasks/manana.md`.*

**2 · Los escalones desordenados eran 19, no 12.** Contado de nuevo con un
guion sobre los `nivel` reales, el reparto sale clavado al suyo: `algebra-ord`
8, `algebra-ext` 6, `fundamentos-quimicos-2c` 2, `ingenieria-termica-ord` 2,
`mecanica-aplicada-1c` 1. Pero **el encargo de reordenar los diecinueve habría
estropeado cinco**: separados por forma, 10 tenían el `examen` antes que la
`practica` —el fallo de verdad—, 1 cerraba con el ejemplo introductorio que en
la ruta gemela abre el mismo escalón, y 5 son cierres deliberados que enseñan
*otro camino para lo mismo*. Los 11 primeros, arreglados; los 5 últimos son la
regla la que estaba corta, y §14 lleva ahora escrita la excepción.

**3 · La portada publicaba «primero se terminan Cálculo y Álgebra»** a quien
entraba buscando Expresión Gráfica, con las dos cerradas desde agosto. Es
exactamente el patrón que esta auditoría persigue, y se le escapó porque
`deuda.mjs` §10 mira `docs/` y esa frase vivía en una plantilla. *El motivo
sale ahora del catálogo, y el texto de reserva no nombra ninguna asignatura.*

**Y un bug que ninguna de las dos podía ver desde su máquina:** `npm test` da
tres fallos en Node 22 y ninguno en Node 24, porque `1.5 * 10 ** -5` no es el
mismo double que `1.5e-5`. No he podido reproducir el rojo, pero sí medir lo
que importa: de los **once** valores de esa tabla, **exactamente uno** difiere
entre las dos formas, y es el que la otra auditoría señaló. Arreglado
construyendo el número como texto.

**Lo que no comparto.** Su nota por asignatura y su orden de apertura son
juicios razonables, no medidas, y el veredicto de Sistemas es una decisión ya
tomada por Ionan («deja sistemas para el final»). Y su encargo de sellar
`revisado` en los 26 bloques de Álgebra y Fluidos **no se ha hecho a
propósito**: esa fecha significa «este bloque se pasó por los criterios de
hueco», y ponerla sin pasarlos sería inventar para apagar una métrica — que es
lo que el comentario de su propio esquema avisa que pasa.

---

## Lo que la auditoría cambia en cómo el proyecto se comprueba

Tres guardianes nuevos o arreglados, y son la parte que sobrevive a este
documento:

1. **`verify.mjs` · disco→YAML.** «Todo PDF servido lo enlaza una convocatoria:
   124 de 124.» Es la única carpeta del repositorio donde un descuido tiene
   consecuencias fuera, y era la única sin guardián en ese sentido.
2. **`deuda.mjs` §10 · las cifras que la documentación publica sobre sí
   misma.** Mide rutas, bloques, escalones, ejercicios, pasos, simuladores,
   ficheros de `lib/`, ficheros y casos de `tests/fisica/`, PDF, páginas
   construidas y asignaturas por estado; y compara diez afirmaciones concretas
   contra su medida. Hoy da **cero caducadas**. Añadir una es una fila más.
   *Lo que deliberadamente no mide: el total de pruebas. Contar `it(` da 1.862
   y `npm test` dice 1.923, porque los `it.each` generan varias por línea.
   Publicar 1.862 sería el mismo fallo que la sección persigue, con la
   agravante de venir de un guion.*
3. **El CI ejecuta `npm run suelo`**, una línea, la misma que se escribe en
   local. Hasta hoy eran dos definiciones del suelo escritas a mano.

Suelo al cerrar: build 246 páginas · verify en verde · paleta verificada ·
**1.923 pruebas** · `deuda.mjs` limpio, 0 escalones sin rampa y 0 afirmaciones
caducadas · 1.480 de 1.481 respuestas recalculadas.
