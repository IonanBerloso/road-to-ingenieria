# Auditoría completa · 3 de octubre de 2026

Sobre `main` en `557b221` («docs: el README, al día»). Solo lectura: no se ha
cambiado nada del sitio. Este documento y `IDEAS.md` son lo único que añade la
rama `audit/2026-10`.

## Cómo se ha hecho

- **Leído antes de nada**: CLAUDE.md entero, README, `tasks/pendiente.md`,
  `tasks/siguiente.md`, `docs/decisiones.md`, la auditoría del 13 de
  septiembre y el diario del 2 de octubre. Lo que ya está apuntado se marca
  **(conocido)** y no se vuelve a proponer como nuevo.
- **El suelo**, `npm ci` y los diez pasos de `npm run suelo`, uno detrás de
  otro, en un contenedor Linux con Node 22 (el CI usa Node 24). Playwright 1.62
  pide Chromium 1234 y el contenedor trae el 1194 (Chromium 141): se enlazó
  el que había en lugar de descargar otro. Resultado y tiempos en
  [El suelo](#el-suelo-hoy).
- **El sitio en un navegador**: el `dist/` construido, servido aparte (sin
  `astro preview`, para no chocar con el suelo) y recorrido con Playwright a
  360 y a 1366 px, en claro y en oscuro, como un alumno: portada, ficha,
  tema, bloque de ejercicios, examen; respuestas equivocadas a propósito;
  teclado.
- **El contenido, por muestreo**: dos temas de cada asignatura terminada
  (seis), con cada cifra rehecha desde el enunciado con sympy/numpy y cada
  enunciado de examen cotejado con su PDF. Lo han hecho tres revisores
  independientes con las mismas instrucciones; los críticos se han vuelto a
  comprobar a mano antes de escribirlos aquí.
- **Las medidas del corpus** (pedagogía y producción) se han hecho cargando
  los YAML, nunca con `grep` (§17). Los guiones están al final, en
  [Cómo repetir las medidas](#cómo-repetir-las-medidas), para que cada cifra
  se pueda recontar.

Gravedad: **crítico**, el sitio enseña algo falso o el enunciado no es el
impreso; **alto**, falla el núcleo del producto para alguien (un diagnóstico
falso, un paso que se aprueba sin pensar, una pérdida de datos, el bucle
principal inaccesible); **medio**, incoherencia, navegación, coste de
producción; **bajo**, higiene.

## En una pantalla

1. **El suelo está en verde** y los guardianes hacen lo que dicen. La
   arquitectura cumple la Regla 0 donde importa: un `:root`, un layout, KaTeX
   en el build, 124 KB de JavaScript en todo el sitio.
2. **El contenido muestreado tiene nueve críticos**, todos de los que ningún
   guardián puede ver: dos figuras con un sentido al revés (la curva de Green,
   las reacciones de un rotor), dos guiones de prosa que enseñan un criterio
   sin su hipótesis, una convocatoria de Térmica traducida del euskera en vez
   de copiada del castellano, una fórmula despejada al revés, una pieza falsa
   que no es la trampa, un coeficiente mal en la prosa de Moody y un error de
   dilución que se da por bueno. Las 198 respuestas buenas rehechas son
   correctas; lo que falla es lo de alrededor: de 466 distractores, **16 no
   producen su número**, y varias tolerancias de Química aceptan el error que
   quieren diagnosticar.
3. **El hallazgo más grande es pedagógico y es nuevo**: en el **85 %** de los
   pasos `reconocer` la opción buena es la más larga (azar: 30 %). El COMP1
   se puede aprobar sin leer. En el simulacro del test de Materiales, marcar
   siempre la más larga da una media de 3,9 y aprueba uno de cada cuatro.
4. **El COMP4 de Cálculo** —el 33,7 % de los puntos— se entrena escribiendo
   en el 59 % de sus puntos; el 41 % restante, solo ordenando piezas.
5. **La experiencia del alumno** es buena en lo que se ve (cero desbordes a
   360 px, contraste real en verde, paleta de búsqueda rápida), y floja en
   tres sitios: el diagnóstico probablemente no llega a un lector de pantalla,
   «Borrar mi avance» borra todas las asignaturas sin preguntar, y desde un
   tema no se puede volver a su asignatura.
6. **Producir un ejercicio de Expresión Gráfica cuesta el doble de YAML que
   cualquier otro** (549 líneas frente a 184–264), con 880 cifras escritas a
   mano en los mensajes que nada comprueba. Lo que más frena hoy no es el
   código: es el ciclo de revisión, el suelo de una hora y el contexto que
   relee cada agente.

---

## Hallazgos

### Crítico

| # | dónde | qué | prueba |
|---|---|---|---|
| C1 | `src/content/calculo/t08-integral-curvilinea/ejercicios.yaml:1633-1675` (SVG), `:1637` (`<desc>`), `:1455` (enunciado) | La figura del 8.13 (`trabajo-con-el-area-dada`) dibuja L₁ **por encima** del eje, de A(−1,0) a B(1,0), y vuelve por el eje: es sentido **horario**. El enunciado y el `<desc>` dicen «sentido positivo» y la respuesta es 90. Con la figura, el trabajo es **−90**. Está incrustado en la ruta `preparar/calculo-ext.yaml:1995`. | Área con signo del polígono del SVG < 0; integral directa con y = 7,5(1−x²): −90, y con la curva por debajo, +90. El examen de origen (`public/examenes/calculo/2017-2018-5ev-p2.pdf`, pág. 2) la dibuja por debajo. |
| C2 | `src/content/calculo/t08-integral-curvilinea/index.mdx:137-144`, `:271-273`, `:278-279` | La prosa da $P_y = Q_x$ como **el** criterio de campo conservativo, sin «en un dominio sin agujeros». Su guion de «lo que hay que llevar sabido» da 0 en el 8.10 y en `ex1516-ext-4`, que valen 2π. Los ejercicios del propio tema lo dicen bien (`ejercicios.yaml:1355`, `:3769`, `:3841`). | $(-y, x)/(x^2+y^2)$: $Q_x - P_y = 0$ y la circulación por la circunferencia es 2π (sympy). |
| C3 | `src/content/algebra/t05-sistemas-lineales/index.mdx:222-227` | El guion «Con parámetro» dice que, si el sistema no es cuadrado, donde no se anule «el determinante de la mayor submatriz cuadrada» el sistema es **determinado**. Falso: con más ecuaciones que incógnitas puede ser incompatible; con menos, nunca es determinado. Contradice las líneas 233-236 de la misma página. | El 5.1 del propio boletín (`ejalg5-bol51`, 4×3) con a = 5, b = 3: menor −5, r(A) = 3, r(A\|B) = 4, incompatible. |
| C4 | `src/content/ingenieria-termica/examenes/2021-2022-ext/ejercicios.yaml:7-20`, `:240-251`, `:445-462` | Los enunciados de los ejercicios 1, 2 y 3 **traducen la versión en euskera** (pág. 1 del PDF) en vez de copiar la castellana (pág. 2). Los números coinciden, pero en el 3 el dato de 50 °C pasa de «la superficie exterior de **la tubería**» (impreso) a «del **aislante**», y el 1 lleva una nota de estado de referencia que solo imprime el euskera. §08: tal cual. | `pdftotext -enc UTF-8 -layout -f 2 -l 2`, líneas 27-36. Las otras convocatorias bilingües con texto (2017-2018-ord, 2022-2023-ord) sí casan con el castellano. |
| C5 | mismo fichero, `:577` (desarrollo) y `:631` (resolución) | La conductividad del aislante se enseña despejada al revés: la expresión escrita vale **14,27**, no 0,07. El resultado publicado y la pista están bien; quien copie el despeje obtiene 1/k. | $(63{,}43-50)/(442{,}8\cdot\ln(0{,}08/0{,}07)/(2\pi\cdot10)) = 14{,}27$; la buena, $442{,}8\ln(8/7)/(2\pi\cdot10\cdot13{,}43) = 0{,}0701$. |
| C6 | `src/content/ingenieria-termica/examenes/2025-2026-ord/ejercicios.yaml:2046-2048` | Una pieza **no trampa** del `justificar` es falsa: «la convección interior pesa un 15,9 %… **más que las dos conducciones juntas**». Las conducciones suman 0,26 + 30,85 = 31,1 %. El propio mensaje de la trampa dice que el aislante es el 30,8 %. Hay dos piezas falsas en un paso que promete una. | Resolución oficial, `public/examenes/ingenieria-termica/2025-2026-ord.pdf`, pág. 17. |
| C7 | `src/content/fluidos/t18-perdidas-carga/index.mdx:208-210` | «Sustituyendo $Re' = 23/(\varepsilon/D)$… sale $0{,}7\sqrt f$, que ronda 0,3». Con la expresión de la línea 202 sale $23/14{,}14 = 1{,}63\sqrt f$; con f de 0,02 a 0,04 da 0,23–0,33, que sí ronda 0,3. Con 0,7√f saldría 0,10–0,14. | `tests/fisica/moody.test.ts` usa 14,14 y da 0,17–0,61 en esa frontera, que es 1,63√f. |
| C8 | `src/content/mecanica-aplicada/t11-eje-fijo/index.mdx:128`, `:130` | En la figura del **desequilibrio dinámico**, las reacciones van al revés: A hacia arriba y B hacia abajo. Con la convención de la mitad de arriba de la misma figura (fuerzas sobre el rotor, que en el estático se oponen a los 50 N), momentos en A: 0,2·50 − 0,4·50 + 0,6·R_B = 0, así que R_B = +16,7 N (arriba) y R_A = −16,7 N (abajo). Tal como está dibujado, el momento neto es −20 N·m. Es la figura que explica el tema. | Momentos sobre las coordenadas del SVG (A en x = 90, masas en 183,3 y 276,7, B en 370). |
| C9 | `src/content/fundamentos-quimicos/examenes/2024-2025-2c-ext/ejercicios.yaml:895-904`, `:1062` | **El error de la dilución da por buena la respuesta y la resolución lo explica al revés.** En el punto de equivalencia del láctico (pH 8,84), olvidar que el volumen pasa a 37,5 mL da **8,93**, que la tolerancia de 0,1 **acepta**. El distractor 8,68 dice ser ese error y no lo es, y la resolución afirma que «usar la concentración original daría 8,68»: no diluir **sube** el pH, no lo baja. | $K_b = 10^{-14}/1{,}37\cdot10^{-4}$; $\mathrm{pH} = 14 + \log\sqrt{K_b C}$: C = 0,667 → 8,844; C = 1 → 8,932. |

### Alto

| # | dónde | qué | prueba |
|---|---|---|---|
| A1 | todo el corpus (`reconocer`) | **La opción correcta es, ella sola, la más larga en 2.056 de 2.409 pasos (85,3 %)**; el azar daría el 30,5 %. Álgebra 98 %, Fluidos 96 %, Cálculo 87 %, Mecánica 85 %, Térmica 82 %, Química 72 %, Materiales 71 %, Expresión Gráfica 65 %. Mediana: la correcta mide 1,5 veces la más larga de las otras. Suele llevar el porqué dentro y las otras no. El COMP1 se aprueba eligiendo la más larga, y `rti:hechos` lo apunta como acierto a la primera. Las posiciones sí se barajan bien (uniforme, comprobado con el `baraja()` del build). **Nuevo.** | Medida 1. |
| A2 | `src/content/banco/ciencia-materiales-t01.yaml` (las cien del test de mínimos, propias) | El mismo sesgo con nota: la correcta es la más larga en el 52 % (azar 25 %). **Simulado con el reparto y la penalización del propio banco** (25 preguntas, +0,4/−0,15, aprueba con 5): marcar siempre la más larga da una media de **3,91** y **aprueba el 23 %** de los simulacros sin saber nada; al azar, −0,32 y nunca. El simulacro sobrestima a quien llega justo. Los bancos de Cálculo, que vienen de las diapositivas, no tienen sesgo (6–36 %). **Nuevo.** | Medida 2. |
| A3 | dieciséis distractores de la muestra | **El mensaje no produce el número**, así que quien comete el error descrito no recibe ese diagnóstico, y quien lo recibe no cometió ese error. **16 de 466 distractores rehechos (3,4 %)**, en cinco de las seis asignaturas: `fluidos/t18-perdidas-carga/ejercicios.yaml:550` (392 l/s: los dos errores que nombra dan 691 y 1.147); `ingenieria-termica/examenes/2021-2022-ext/ejercicios.yaml:327` (53,66 K es 1073/20, no el exponente al revés, que da 0,03), `:534` (285,6 W es la mitad de 571,1; el error descrito da 590), `:567` (0,0113: ninguna variante del error descrito lo da); `calculo/examenes/2015-2016-ext/ejercicios.yaml:893-899` (6π y 18π con los mensajes cambiados); `calculo/t08-integral-curvilinea/ejercicios.yaml:1523` (−6: el error descrito da 0, que es la buena) y `:1517` (12: el mensaje confiesa que «no sale de ninguna cuenta»); `algebra/examenes/2021-2022-ext/ejercicios.yaml:482` (la tercera columna es el vector y no su imagen); `fundamentos-quimicos/examenes/2024-2025-2c-ext/ejercicios.yaml:105` y `:347` (−1597,1 es sumar la ΔHf del etano; el «agua líquida» del mensaje da −1559,7), `:110` (dejarse un mol de agua da −1185,9, no −1258,3), `:215` (763,8 es olvidar solo el O₂), `:940` (el exceso de sosa en 25 mL da 13,08, no 11,11); `…/2024-2025-2c/ejercicios.yaml:1232` (13,40 es dividir entre 10 mL); `mecanica-aplicada/t05-cables/ejercicios.yaml:2361` (con la longitud entera sale c = 2,36 L, no 1,9) y `:2822` (225 es olvidar dividir entre 2, no «integrar una vez»). Ningún guardián puede verlos: el esquema comprueba que el distractor no cae en la tolerancia, no que su mensaje lo explique. Ver `IDEAS.md`, 13. | Cuentas en los informes de los revisores (sección «Contenido por asignatura»). |
| A4 | Química: `fundamentos-quimicos/examenes/2024-2025-2c-ext/ejercicios.yaml:895-904`, `…/2024-2025-2c/ejercicios.yaml:1259`, `…/2023-2024-2c-control/ejercicios.yaml:393`, `:427`, `:461`; Mecánica: `mecanica-aplicada/t11-eje-fijo/ejercicios.yaml:1738` | **Tolerancias que aceptan el error o rechazan la cuenta.** En los pH de Química, ±0,1 es del tamaño de los errores que se quieren diagnosticar: acepta olvidar la dilución en el láctico (C9) y en el 5,13 de la ordinaria; en el control de 2023-2024, ±60 kJ/mol acepta vaporizar 8 moles de agua en vez de 9, y usar el Cp del líquido por encima de 100 °C da 51,18 kJ/mol y 450,8 kg, y se aceptan los dos. Al revés en Mecánica: A_x = −0,0267 N con la tolerancia por defecto (0,1 %) **rechaza** −0,02667, la cuenta exacta, y el −0,027 de la propia resolución. Es la trampa de §17 («una tolerancia se elige por lo que el enunciado deja calcular, no por el distractor») con otra cara: aquí se ha elegido sin mirar los errores. | Réplica de `comparaMagnitud` y de la lógica de `EjercicioGuiado` (informe de Química y Mecánica). |
| A5 | Cálculo, exámenes | **El 41 % de los puntos de COMP4 se entrena solo ordenando piezas.** De 1.432,5 puntos de COMP4 en las 88 convocatorias, 841 (58,7 %) están en ejercicios con un paso de producción (`redactar` o `dibujar`); **591,5 en 235 ejercicios no tienen ninguno**: su único COMP4 es un `justificar`, que es reconocer un argumento ya escrito. Ejemplos: `ex1617-2ev-2` («Demostrar analíticamente…», 5 puntos de COMP4) y `ex1516-3ev-1` («dar su definición… y poner un ejemplo», 5). Por tema, t04 (177 puntos), t09 (83), t05 (64) y t10 (55). En los ejercicios de tema, `redactar` sale 19 veces en 399. **Conocido en parte**: `deuda.mjs` §11 cuenta las demostraciones sin `redactar` con trinquete; no cuenta definiciones, enunciados ni «razonar». | Medida 3. |
| A6 | `src/components/patrones/EjercicioGuiado.astro:775`, `:922-934`, `:1004` | **El diagnóstico probablemente no llega a un lector de pantalla.** La caja `[data-fb]` es una región `aria-live` que está `hidden` hasta que se rellena, y se rellena y se muestra en el mismo instante; `limpiaFb` la vuelve a ocultar. Una región viva tiene que existir en el árbol de accesibilidad antes del cambio. Y al pulsar una opción equivocada, el botón se deshabilita y **el foco cae al `<body>`** (comprobado con teclado en Chromium): quien navega con lector pierde el sitio justo cuando recibe el diagnóstico. No hay ni un `.focus()` en el componente. El diagnóstico es el producto (§00). | Playwright: `document.activeElement` tras Enter en una opción mala = `BODY`. Lo del anuncio se razona por la especificación; falta confirmarlo con NVDA o VoiceOver. |
| A7 | `src/pages/[asignatura]/preparar/[evaluacion].astro:540`, `:832-839` | **«Borrar mi avance» borra sin preguntar el avance de todas las asignaturas.** Está en la ruta de una evaluación, al lado de «Cargar», y hace `removeItem('rti:hechos')` y `removeItem('rti:dominio')`, que son de todo el sitio. Sin confirmación y sin deshacer. | Lectura del código. |

### Medio

| # | dónde | qué |
|---|---|---|
| M1 | `src/pages/[asignatura]/preparar/[evaluacion].astro:900-912` | **Cargar un avance pisa las notas de simulacro de este navegador.** `rti:notas` guarda un array por cuadernillo, y la fusión hace `actual[k] = v`: si el fichero trae notas de un examen, sustituye las de aquí. El comentario de encima promete lo contrario («no debe borrar lo que hiciste en casa»). |
| M2 | `src/components/patrones/EjercicioGuiado.astro:1325-1334` | **El mensaje genérico afirma algo que nadie ha comprobado**: «No es correcto · Ese número no sale de ninguna vía razonable». Es la misma clase de frase que se corrigió el 28 de septiembre en el aviso de «la otra columna». Y es el que recibe casi cualquier error: de 5.158 pasos `calcular`, 3.096 llevan dos distractores y 79 uno. No hay diagnósticos genéricos (signo, potencia de diez, inverso). Ver `IDEAS.md`, 2. |
| M3 | `src/pages/[asignatura]/[tema].astro` y las páginas de bloque y de examen | **Desde un tema, un bloque o un examen no se vuelve a la asignatura.** Los enlaces de la página son la portada (sin asignatura elegida), los temas vecinos y, en un examen, su ruta y su PDF. «Cálculo · Tema 05» es texto. Para ir del tema 5 al índice de exámenes de Cálculo hay que pasar por la portada y volver a elegir. Y en la ficha (`[asignatura]/index.astro:136-139`), el índice de la página no enlaza «El temario» (`:305`), que queda a 14,2 pantallas en un móvil en Cálculo y a 6,4 en escritorio. La portada, en cambio, lo resuelve bien: su vista de detalle pone el temario justo bajo el primer pantallazo. |
| M4 | `src/content/catalogo/expresion-grafica.json:6` | **Un `motivo` publicado y caducado**: la ficha de Expresión Gráfica dice «Faltan los temas: su examen es un dibujo, y antes hay que construir cómo se corrige una construcción geométrica», con el Taller hecho desde el 27 de septiembre y siete temas publicados. Ningún guardián mira un `motivo`. |
| M5 | `src/content/expresion-grafica/**/ejercicios.yaml` | **880 cifras con mm o grados escritas a mano** en 599 campos `bien`, `mensaje`, `porque`, `intro`, `desarrollo` y `pista`. `docs/decisiones.md` dice de las cifras de Expresión Gráfica que «ningún número queda sin comprobar», y es verdad de las de `calcular`, que van atadas a la receta; no de estas. Las de la muestra cuadran (39,1 = √(25,1² + 30²); 22,6 = 39,1/√3), pero un cambio de receta las deja viejas sin que nada falle. Ver `IDEAS.md`, 12. |
| M6 | `src/content/ingenieria-termica/**` | **Térmica no usa el campo `notas`**: siete notas impresas siguen dentro del `enunciado` (2021-2022-ext `:19`, `:250`; 2021-2022-ord `:329`; 2023-2024-ord `:482`; 2024-2025-ext `:21`, `:217`; 2024-2025-ord `:571`). La regla de §04 entró con Fluidos y no se extendió, y el guardián de las notas impresas solo mira Fluidos. |
| M7 | `src/content/calculo/t10-laplace/ejercicios.yaml:5628-5630` y `src/lib/regiones.ts:154` | El paso del RLC pide «cuatro decimales» de una expresión con $e^{-1}$, cos 1 y sen 1, en una asignatura sin calculadora, y **la forma exacta no se puede teclear**: el lector solo conoce `re, im, arg, abs, conj, sqrt, exp, ln`. Otros cinco pasos del t10 ordenan «con cuatro decimales» sin ofrecer la forma exacta (`:2448`, `:2650`, `:3834`, `:5415`, `:6102`), contra §09. |
| M8 | contenido, varios | Los medios de la muestra, uno por línea en «Contenido por asignatura»: una trampa cuyo «contraejemplo» no lo es (Álgebra t05), un criterio de diagonalización sin «raíces reales» (Álgebra t07), dos recuentos publicados sin medir (Álgebra t07, Cálculo t10), un ErrorTipico mal explicado (Cálculo t08), una casilla que pide «la dirección» y exige un representante (Álgebra t07), supuestos presentados como datos del enunciado («aire en reposo», «pared de cobre»), una afirmación falsa sobre el redondeo de ΔG y una pieza que contradice a su resolución (Química), dos retoques del enunciado sin declarar (Química) y una docena de cifras de prosa o de mensaje que no son las de la cuenta (Fluidos t18, Térmica t04 y t09, Química t06 y t09). |
| M9 | `.github/workflows/deploy.yml` | **Cada despliegue tarda alrededor de una hora** (ejecuciones 594–597 del 2 de octubre: 56, 57, 63 y 64 minutos), y dos *push* seguidos dejan cancelada la primera ejecución (598 y 599). Un commit de solo `tasks/` o `diario/` paga el suelo entero. En el despliegue del 2 de octubre, el paso del suelo fueron 62 de sus 63 minutos; aquí, 1 h 4 min ([El suelo](#el-suelo-hoy)). |
| M10 | `CLAUDE.md` | **218 KB y 3.583 líneas que lee entero cada agente.** `tasks/siguiente.md` midió que el 82 % del límite semanal se fue en agentes, «casi todo releyendo contexto», y la salida que propone —una chuleta fuera del repositorio— es una segunda copia de las reglas. §17 tiene 1.065 líneas; `docs/decisiones.md` pide repensarlo a las 1.200. Ver `IDEAS.md`, 4. |
| M11 | `dist/index.html`, de `src/pages/index.astro:808` | **El 60 % de la portada es el índice de la paleta**: 224 KB de 374 KB son un JSON en línea que solo se usa al abrir la búsqueda. Comprimido son 53 KB en total, así que no es grave en red, pero es la primera página que ve todo el mundo y el índice de ejercicios ya se carga aparte (`indice-ejercicios.json`). |
| M12 | `public/examenes/**/*.pdf`, metadatos | **La pregunta de los metadatos no es solo de Fluidos.** `pendiente.md` la abre para los PDF de Fluidos, que llevan un nombre en el campo Author. Contado con `pdfinfo` (sin copiar ningún valor aquí): **102 de los 129 PDF** tienen el campo Author relleno —Cálculo 77 de 85, Mecánica 8 de 8, Química 6 de 6, Álgebra 6 de 8, Fluidos 2 de 2, Térmica 3 de 20— y **al menos 11** tienen forma de nombre y apellidos (dos o tres palabras con mayúscula). Son autores de documentos oficiales, no alumnado, pero el repositorio es público y la decisión pendiente debería tomarse para los 129 a la vez. |
| M13 | `scripts/comprueba-talleres.mjs`, salida de hoy | **Dónde no se puede construir con el dedo.** En las láminas densas, el guardián no consigue que un punto construido a clics quede en su sitio (el imán se lo lleva a otra cosa) y lo crea por la puerta de pruebas del Taller, avisando sin parar. Es el comportamiento diseñado (§11, «Las láminas densas»), pero el aviso es la medida de lo difícil que lo tendrá un alumno: **76 avisos con 255 puntos en 7 páginas**, casi todos en los dos bloques del tema 3 (46 avisos) y en los Ejercicios 53, 54 y 55 (22). Merece mirar esas láminas en un móvil antes de seguir con las del tema 5. |

### Bajo

| # | dónde | qué |
|---|---|---|
| B1 | `_match.txt` (raíz) | Un volcado de trabajo versionado en la raíz de un repositorio público («Ejemplos disponibles por tema», 33 KB). §12: lo de un solo uso se borra. |
| B2 | `src/pages/index.astro:162`, `:316` | La portada dice «151 exámenes de verdad resueltos paso a paso». Incluye los Ejercicios 53–55 de la colección de Expresión Gráfica, que su ficha dice que no son convocatorias; `verify` cuenta 148 convocatorias más esos 3. |
| B3 | CLAUDE.md §02, tabla de `localStorage` | Faltan tres claves que el sitio escribe: `tema`, `modo-lectura` y `simtest:<ruta>` (`TestDeMinimos.astro:156`). |
| B4 | `package-lock.json` | `npm audit`: 1 crítica (Astro, ejecución de código al optimizar AVIF; no aplica, el sitio no optimiza imágenes de terceros) y 6 altas transitivas o de desarrollo (`js-yaml`, `undici`, `sharp`, `svgo`…). `npm audit fix` las resuelve sin cambio mayor; se mira con el suelo, como cualquier dependencia. |
| B5 | `justificar` | Pista leve en las trampas: «siempre» aparece en 95 trampas y 64 piezas buenas, siendo las buenas tres o cuatro veces más; la trampa es la más corta en el 28,6 % (azar 21,7 %). No es el problema de A1, pero va en la misma revisión. |
| B6 | contenido, varios | Los bajos de la muestra (erratas, una figura de t24 cuyo punto no cae en el corte, cifras redondeadas de más, dos erratas del original corregidas en silencio): uno por línea en «Contenido por asignatura». |

---

## Contenido por asignatura

Seis asignaturas terminadas, dos temas cada una, elegidos por peso y por no
haber sido los de la auditoría anterior. Para cada tema: catálogo frente a
prosa y ejercicios, cinco o más afirmaciones de la prosa rehechas, tres
ejercicios de tema y dos de examen con cada `calcular`, distractor, opción y
pieza rehechos, y el enunciado cotejado con el PDF.

| | ejercicios | `calcular` rehechos | distractores | piezas | enunciados contra PDF |
|---|---|---|---|---|---|
| Cálculo t08, t10 · Álgebra t05, t07 | 21 | 52 | 141 | 104 | 9 |
| Fluidos t18, t24 · Térmica t04, t09 | 16 | 65 | 140 | 85 | 9 |
| Química t06, t09 · Mecánica t05, t11 | 24 | 81 | 185 | 125 | 8 |
| **total** | **61** | **198** | **466** | **314** | **26** |

Además, 118 pasos `reconocer` y unas 110 afirmaciones de prosa rehechas.

**Lo que da confianza**: las 198 respuestas `calcular` rehechas son correctas,
y solo una tolerancia rechaza la cuenta exacta (A4, en Mecánica); en Fluidos y
Térmica se comprobó con la lógica real de `EjercicioGuiado`, y las de la bomba
de 2026 aceptan también los valores IAPWS-95. Los números de las
transcripciones coinciden con los PDF salvo C4, y las de Mecánica, que llevan
el castellano como imagen, casan palabra por palabra con su columna. Lo que
falla está en lo que ningún guardián mira: el texto de los mensajes, la prosa,
las figuras y el lado de los errores de las tolerancias.

### Cálculo

- **C1, C2** (arriba). **A3**: `examenes/2015-2016-ext/ejercicios.yaml:893-899` y `t08…/ejercicios.yaml:1517-1527`.
- **Medio**: `t08…/index.mdx:158-160`, el ErrorTipico «+C en vez de +g(y)» dice que el resultado sale «casi bien» porque la constante se cancela; lo que falta es g(y), que no se cancela (con $V = (2xy, x^2+3y^2)$ de (0,0) a (1,1): 2 frente a 1). `t10…/index.mdx:310-312`: dice que las ecuaciones integrales caen «siempre que aparece Laplace» (son 6 de 22 convocatorias con t10) y que sin Laplace no hay forma razonable (derivando dos veces sale $y'' = t$); la trampa de `examenes/2015-2016-ext/ejercicios.yaml:1479` repite lo segundo y `ex2425-ord-7` dice lo contrario. **M7** (el RLC).
- **Bajo**: el escalón se escribe $u(t-a)$ en la prosa y $\theta(t-c)$ en los ejercicios sin decir que es lo mismo; `t10…/index.mdx:136` cita «la tabla de arriba» por algo que la tabla no tiene; en `ex2425-ord-6` se ha quitado una coma del original.
- **Duda**: el enunciado del 8.13 no es el del examen que cita (2017-2018, 5.ª, cuya respuesta es 78 y está transcrita en `ex1718-5ev-2`). Si el boletín reproduce el examen, el 8.13 está reescrito (§13, caso 2). Hay que cotejarlo con el boletín, que no está en el repositorio.

### Álgebra

- **C3** (arriba). **A3**: `examenes/2021-2022-ext/ejercicios.yaml:482-487`.
- **Medio**: la trampa del 5.4 (`t05…/ejercicios.yaml:1122-1134`, y `:1170`) da como contraejemplo k = −2, que no lo es (raíz simple y dimensión 1 coinciden), y su conclusión es cierta. `t07…/index.mdx:108-111` dice que «el subespacio propio es subespacio» cayó dos veces: son tres (también la extraordinaria de 2023-2024, 4b), y con ella las cuatro demostraciones cubren las ocho convocatorias. `t07…/index.mdx:201`, `:337`, `:412`: «diagonaliza ⇔ m_g = m_a» sin «y todas las raíces reales» (hoy ningún ejercicio tiene autovalores complejos). `t07…/ejercicios.yaml:980-983` pide «la dirección entera» y `comparaVector` exige un representante concreto: (−1,−1,2) se rechaza.
- **Bajo**: `t07…/index.mdx:19` («elevar n cada número»); la trampa de `exalg2122-ext-4` (`:1126`) dice «este mismo curso 2022-2023» en un ejercicio de 2021-2022; en `exalg2122-ext-2` se ha quitado un «sistema sistema» del original.

### Mecánica de Fluidos

- **C7** (arriba). **A3**: `t18…/ejercicios.yaml:550`.
- **Medio**: `examenes/2020-2021-3par/ejercicios.yaml:1063-1069`, `:1225-1230` escribe la asíntota rugosa con 3,7 (el tema usa 3,71) y explica la diferencia con el cuadernillo por g = 9,81; con 3,71 y g = 9,8 sale exactamente el 0,3316 impreso. `t18…/ejercicios.yaml:718`: «cinco veces» el coeficiente en caliente es 2,5 (0,1005 frente a 0,0408).
- **Bajo**: `t18…/ejercicios.yaml:471`, el distractor 30,1 m debería ser 29,59 (lo caza igual, por la holgura del 2 %); en la figura de `t24-bombas/index.mdx:137` el punto de la turbobomba no cae en ningún corte de curvas (los cortes están en (213, 87) y (311, 122); el punto, en (236, 93)).
- **Duda**: el mensaje del distractor 37,5 de `examenes/2025-2026-ord/ejercicios.yaml:2388` es ambiguo.
- t24 no tiene ejercicios de examen con `tema: t24-bombas` (es transversal, se examina dentro del 25); se revisó en su lugar el 9 de la ordinaria de 2026.

### Ingeniería Térmica

- **C4, C5, C6** (arriba). **A3**: `examenes/2021-2022-ext/ejercicios.yaml:327`, `:534`, `:567`. **M6** (las notas).
- **Medio**: `examenes/2021-2022-ext/ejercicios.yaml:467`, `:481`, `:596` dice que el enunciado pone «aire en reposo» y no lo pone (es un supuesto de la resolución, y se dice como dato); `:554` habla de «pared de cobre» con k = 2 W/(m·K). `t04…/ejercicios.yaml:200`: «aprovecha el 99,8 %» es 97,75 %; `:78`, «19,55 vienen del 200» son 20,00. `t09…/index.mdx:418-421`: «un tercio más» es un 18 %. `t09…/ejercicios.yaml:318`: «trece m²» son 18,85. `catalogo/ingenieria-termica.json:167` promete «intercambiadores de calor» en t09, y la prosa solo los nombra.
- **Bajo**: `:360` «un 1,3 %» es 1,23 %; `t09…/ejercicios.yaml:317`, «dos órdenes de magnitud» son casi tres (944); `t09…/index.mdx:464`, «casi 5.800» es 5.733.
- **Duda**: `t09…/index.mdx:195`, `:497` da a Dittus-Boelter el rango 0,7 ≤ Pr ≤ 17.600, que en Çengel es el de Sieder-Tate (Dittus-Boelter: Pr ≤ 160). Si el anexo del curso lo imprime así, está bien citado; el anexo no está en el repositorio.

### Fundamentos Químicos

Abreviado: `…/2c-ext` es `src/content/fundamentos-quimicos/examenes/2024-2025-2c-ext/ejercicios.yaml`, y `…/2c` y `…/2c-control` siguen el mismo patrón (`2024-2025-2c`, `2023-2024-2c-control`).

- **C9** (arriba). **A3**: `…/2c-ext:105`, `:110`, `:215`, `:347`, `:940`; `…/2c:1232`. **A4**: `…/2c-ext:895-904`, `…/2c:1259`, `…/2c-control:393`, `:427`, `:461`.
- **Medio**: `…/2c-ext:405` dice que redondear a 46 o a 171 cambia el signo de ΔG (salen −13,3 y −12,5: no lo cambia), y `:403` dice «76 grados más» donde son menos. `…/2c:1228`, `:1300`: 11,13 es el pH del amoniaco 0,1 M; con 0,25 M sale 11,33, y el distractor salta solo por la holgura del 2 %. `…/2c-ext:783-790` renumera en silencio el «3.1» duplicado del PDF (pág. 2) y corrige «ioniación» sin declararlo. `…/2c-ext:976`: una pieza dice que en los tres casos hay que recalcular el volumen y la resolución del tampón dice que ahí no hace falta. `t09-equilibrio-acido-base/ejercicios.yaml:342` dice «única vez en la asignatura» y `index.mdx:119` del mismo tema lo contradice; `:277` y `:313`, «no de 4,7» y «casi cinco», son 2,74 y 5,00. `t06-termoquimica/ejercicios.yaml:255`, `:278`: «ocho veces» son 7,3.
- **Bajo**: dos distractores con una centésima de más (`t06…:369`, `t09…:278`); «ΔU sale siempre menos negativo que ΔH» en una tabla con un Δn = 0 (`t06…:705-706`); «milímetro» por mililitro (`…/2c-ext:1089`); «tres fórmulas» y «cuatro fórmulas» en la misma prosa (`t09…/index.mdx:21`, `:254`); tres retoques de literalidad sin cambio de datos (`…/2c-control:332`, `…/2c:1184`); y dos notas nuestras en cursiva dentro del enunciado en vez de «**Notas nuestras.**» (`t09…:2094-2095`, `t06…:912`).
- **Dudas**: el distractor 9,28 de `…/2c-ext:935` («has seguido usando Henderson»; la variante más cercana da 9,22); «treinta veces más» en `…/2c:1230`; el mensaje vago del 8,80.

### Mecánica Aplicada

- **C8** (arriba). **A3**: `t05-cables/ejercicios.yaml:2361`, `:2822`. **A4**: `t11-eje-fijo/ejercicios.yaml:1738`.
- **Bajo**: `t11-eje-fijo/index.mdx:24-25` dice que los dos exámenes van «transcritos con su resolución» y sus `examen.yaml` dicen «El examen no publica resolución»; `t11…/ejercicios.yaml:1780` (−33,3 mm con tolerancia del 0,1 %) acepta «−33.333» y rechaza «−33.3333»; en la práctica no muerde.
- **Duda**: `t05-cables/index.mdx:30`, «solo por detrás de la resistencia de materiales», es cierto contando piezas (t06 = 7, t05 = 6) y no contando convocatorias (empatan a 4 de 5).
- **Lo que está exacto**: el 11.3, el cilindro de 2018, la placa de 2019 y las dos catenarias de 2025, hasta los distractores. Los enunciados de Mecánica, con el castellano como imagen, se cotejaron renderizando la página: casan palabra por palabra y ninguno traduce el euskera.

---

## La experiencia del alumno

Medido en Chromium sobre el `dist/` de hoy.

- **Móvil, 360 px**: cero desbordamiento horizontal en nueve páginas de siete
  clases (portada, dos fichas, un tema, un bloque, un examen, una ruta, un
  bloque con Taller y las tablas de vapor), en claro y en oscuro. Los botones de modo «guiado» y «completo» miden 24 px
  de alto, justo el mínimo de WCAG 2.2 AA.
- **Portada**: el héroe y los dos accesos (Cálculo y Térmica) ocupan el primer
  pantallazo; la lista de asignaturas empieza en y = 827 px, debajo. La vista de
  detalle de una asignatura pone el temario a y = 749, bien. La paleta se abre
  con `/`, pone el foco en la búsqueda y encuentra «green» en temas,
  apartados y ejercicios.
- **Un ejercicio en el móvil**: la casilla lleva `autocomplete`,
  `autocapitalize` y `spellcheck` apagados, etiqueta para lectores y el
  formato debajo; el diagnóstico aparece dentro de la pantalla, bajo la
  casilla. Lo flojo: A6 (foco y región viva) y M2 (el genérico).
- **Teclado**: «Saltar al contenido» es lo primero; la portada se recorre
  entera con Tab; el anillo de foco se ve (lo comprueba `verify`).
- **Lo que guarda el navegador**: siete claves, todas con `try/catch` en cada
  lectura y escritura, y un guardar/cargar el avance en fichero en las rutas
  (bien pensado: sin cuenta y sin servidor). Lo flojo: A7 y M1, y B3.
- **Contraste**: `npm run contraste` mide el texto real en ocho páginas y dos
  temas: en verde.
- **Avisar de un error**: el enlace abre un *issue* de GitHub con el id
  puesto. El repositorio no ha recibido ningún *issue*. Ver `IDEAS.md`, 10.

## Rendimiento y técnica

- **JavaScript**: 15 ficheros, 124 KB en total; el más grande,
  `EjercicioGuiado`, 31 KB. Ningún `is:inline` repetido por instancia. KaTeX
  no viaja al navegador. Bien.
- **HTML**: 494 páginas, 364 MB (media 755 KB); `dist/` entero, 463 MB con los
  93 MB de PDF. Ninguna página de tema ni de bloque pasa de 3 MB; tres rutas sí
  (**conocido**). Comprimido, la ruta más pesada son 418 KB en la red; el
  coste es de análisis, no de descarga.
- **El repositorio**: `public/examenes/` son 93 MB de PDF y `src/` 37 MB,
  casi todo YAML (el mayor, `calculo/t07`, 953 KB). Los PDF de Térmica son el
  62 % de los exámenes (58 MB), porque veinte son la resolución completa del
  profesor (**conocido**: servir solo el enunciado). El clon que se ha usado
  es superficial (50 commits) y ya pesa 96 MB.
- **Dependencias**: las once de la tabla de §02, ni una más; una sola versión
  de KaTeX. B4 para las alertas.
- **Lo que ya está en `pendiente.md` y esta auditoría confirma sin añadir
  nada**: ficheros de más de 800 líneas (`EjercicioGuiado` 2.399,
  `index.astro` 2.338, `content.config.ts` 2.692, `Examen.astro` 1.620), los
  duplicados de pestañas, reloj y formateador, la hoja de impresión que no
  cambia los colores, las acciones de Node 20 y Ubuntu 26.

## Producción: qué cuesta hoy añadir un tema

**Un tema de cualquier asignatura menos Expresión Gráfica** son dos ficheros y
una línea del catálogo, como promete §04, y se cumple: el `EjercicioGuiado`
es genérico, `revisa-ejercicios.mjs` valida un bloque en un segundo y el
esquema para lo demás. Un ejercicio ocupa de 184 (Álgebra) a 264 (Cálculo,
Fluidos) líneas de YAML. Lo que cuesta es el contenido, no el código.

**Un ejercicio de Expresión Gráfica** cuesta 549 líneas de media (33,5 KB),
el doble, y el tema 3 tiene 13.775. El 70 % son dos campos del paso
`construir`: `objetivos` (cada punto con tres o cuatro diagnósticos, cada uno
con un `ejemplo` que el build construye) y `construccion` (cada trazo con su
instrumento, su guía y su porqué). A eso se suma la lámina en JSON cotejada
sobre el PDF, la receta, un test en `tests/geometria/` y un revisor
independiente que, según el diario del 2 de octubre, «casi siempre encontró
algo serio». Es caro porque es bueno; lo que se puede abaratar es lo que se
escribe a mano y se podría calcular (M5) y lo que el revisor recalcula.

**Dónde está cada asignatura pendiente**:

- **Expresión Gráfica**: 7 de 17 temas, y 4 de los 10 que faltan son
  `soloEnClase` (Solid Edge): quedan 6 producibles (1, 4, 5, 8, 9 y 13).
  Colección: 21 de 55. Lo que la frena, en orden: el coste por ejercicio de
  arriba; cinco puntos abiertos en `pendiente.md` («Lo decide quien mantiene
  el proyecto»), varios de los cuales hay que preguntar a la asignatura; la deuda que encontró `comprueba-todo` en lo
  publicado; y que el kit de trabajo (chuleta, modelo, `comprueba-todo`) vive
  **fuera** del repositorio, así que una sesión sin esa carpeta no lo tiene.
- **Sistemas de Producción**: 0 de 6, aplazada por decisión el 30 de
  septiembre (fase J, unas cuatro semanas). No tiene ninguna convocatoria
  entera, solo cinco problemas fechados; los de CNC piden un tipo de respuesta
  nuevo; y queda la pregunta del catálogo Sandvik. Nada de eso es un fallo:
  está declarado.

**Lo que frena a las dos, y a todo lo que venga**:

1. **El ciclo de comprobación**: el suelo tarda una hora en el CI (62 minutos
   de los 63 del despliegue del 2 de octubre) y 1 h 4 min aquí, el 91 % en
   `humo` y `talleres`; `siguiente.md` ya se ha resignado a «un
   suelo por cada dos encargos». Ver `IDEAS.md`, 11.
2. **El contexto de cada agente**: CLAUDE.md entero en cada uno (M10). Ver
   `IDEAS.md`, 4.
3. **Las cifras a mano en los mensajes** (M5). Ver `IDEAS.md`, 12.

## El suelo, hoy

`npm ci` y los diez pasos, sin parar en el primer fallo:

| paso | resultado | tiempo |
|---|---|---|
| `npm ci` | 367 paquetes | 7 s |
| `build` | verde, 494 páginas | 3 min 45 s |
| `verify` | verde, 1 aviso (las tres rutas de más de 3 MB, **conocido**) | 36 s |
| `recalcula` | verde | 1 s |
| `cifras` | verde: ninguna cifra publicada caducada | 2 s |
| `color` | verde | menos de 1 s |
| `contraste` | verde | 22 s |
| `test` | verde: 171 ficheros, 2.997 tests | 15 s |
| `humo` | verde: 361 páginas, 5.417 comprobaciones, cero errores de JavaScript | 34 min 47 s |
| `sim` | verde | 34 s |
| `talleres` | verde: 3.648 comprobaciones; 76 avisos que no bloquean (M13) | 23 min 28 s |
| **total** | **los diez en verde** | **1 h 4 min** |

El 91 % del suelo son `humo` y `talleres`, los dos que abren un navegador
página a página; es lo que la idea 11 propone repartir.

Chromium: el que trae el contenedor (141, revisión 1194) enlazado como la
1234 que pide Playwright 1.62; no se descargó ningún navegador.

## Lo que está bien y no hay que tocar

- **La Regla 0 funciona donde se diseñó para funcionar**: un `:root`, un
  layout, un procesador de Markdown, KaTeX en el build y una sola versión. La
  arquitectura hace imposible el desastre del proyecto anterior, y lo hace
  por construcción, no por disciplina.
- **Los guardianes validados al revés.** Cada uno dice qué fallo real lo
  trajo, y los que se probaron hoy dicen lo que dicen: 2.997 tests, 494
  páginas, 5.679 anclas que aterrizan, contraste medido en el texto pintado.
- **Las cuentas**: las 198 respuestas `calcular` que se rehicieron en seis
  asignaturas eran correctas, y todas sus tolerancias menos una aceptan la
  cuenta exacta. El trabajo de `recalcula` y de las tolerancias de §17 se nota.
- **Las transcripciones** son fieles en números, matrices, notas impresas y
  reparto, salvo una convocatoria (C4). El guardián de notas de Fluidos es un
  buen modelo para Térmica (M6).
- **El barajado** de opciones y piezas es uniforme y estable entre builds.
- **El `<template>` y los bloques de diez** (§07): la página del tema 5 de
  Cálculo pesa 0,4 MB, y su bloque más pesado, 2,8.
- **Lo que guarda el navegador**: todo en `try/catch`, hechos y no derivados,
  y un fichero para llevarse el avance sin cuenta.
- **La honestidad del dato**: `soloEnClase`, `fuera` con motivo, `sinPdf`,
  `# Decisión:`, `falta[]`. En la muestra no ha aparecido ningún hueco
  escondido; lo que falla son cosas dichas mal, no calladas.
- **El patrón de construcción** de Expresión Gráfica: corregir por puntos
  con la geometría calculada, cada error construido a propósito, la lámina
  cotejada sobre el PDF. Es caro, y es el único sitio donde se corrige un
  dibujo sin fingir.
- **Las rúbricas compartidas** con `minimo` y `porque`: el porqué nombra el
  fallo concreto. Es el mejor material de COMP4 del sitio, y la idea 7 lo
  reaprovecha.

---

## Cómo repetir las medidas

Desde la raíz del repositorio, con Python 3 y `pyyaml`.

**Medida 1 · la opción correcta, ¿es la más larga?**

```python
import yaml, glob, re, collections
tot = largo = 0; azar = 0.0; por = collections.Counter(); n = collections.Counter()
for f in glob.glob('src/content/**/ejercicios.yaml', recursive=True):
    asig = f.split('/')[2]
    for e in (yaml.safe_load(open(f)) or {}).get('ejercicios') or []:
        for p in e.get('pasos', []):
            if p.get('tipo') != 'reconocer': continue
            L = [len(re.sub(r'\s+', ' ', o['texto'])) for o in p['opciones']]
            c = next(i for i, o in enumerate(p['opciones']) if o.get('correcta'))
            tot += 1; azar += 1 / len(L); n[asig] += 1
            if L[c] == max(L) and L.count(max(L)) == 1: largo += 1; por[asig] += 1
print(largo, tot, largo / tot, azar / tot)
for a in n: print(a, por[a], n[a])
```

**Medida 2 · el simulacro del test de Materiales, marcando la más larga**

```python
import yaml, re, random, statistics
d = yaml.safe_load(open('src/content/banco/ciencia-materiales-t01.yaml'))
P = d['puntuacion']; porb = {}
for q in d['preguntas']: porb.setdefault(q['bloque'], []).append(q)
def nota(estrategia):
    s = 0
    for b, k in P['reparto'].items():
        for q in random.sample(porb[b], k):
            ops = q['opciones']
            if estrategia == 'larga':
                L = [len(re.sub(r'\s+', ' ', str(o['texto']))) for o in ops]
                i = random.choice([j for j, l in enumerate(L) if l == max(L)])
            else:
                i = random.randrange(len(ops))
            s += P['acierto'] if ops[i].get('correcta') is True else P['fallo']
    return s
random.seed(1)
for e in ('larga', 'azar'):
    xs = [nota(e) for _ in range(20000)]
    print(e, statistics.mean(xs), sum(x >= P['aprueba'] for x in xs) / len(xs))
```

**Medida 3 · los puntos de COMP4 de Cálculo y el paso que los entrena**

```python
import yaml, glob
tot = con = 0; sin = 0
for f in glob.glob('src/content/calculo/examenes/*/ejercicios.yaml'):
    for e in yaml.safe_load(open(f))['ejercicios']:
        c4 = (e.get('puntos') or {}).get('comp4', 0) or 0
        prod = any(p['tipo'] in ('redactar', 'dibujar') for p in e['pasos'])
        tot += c4; con += c4 if prod else 0; sin += 1 if (c4 and not prod) else 0
print(tot, con, tot - con, sin)
```

**Medida 4 · cifras escritas a mano en los mensajes de Expresión Gráfica**:
el mismo recorrido sobre `src/content/expresion-grafica/**/ejercicios.yaml`,
contando `\d+(,\d+)?\s?(mm|°)` en los campos `bien`, `mensaje`, `porque`,
`intro`, `desarrollo` y `pista`.

**Medida 5 · la navegación**: con Playwright a 360 × 740, la posición del
primer `<a>` visible cuyo `href` contiene `/tNN-` en `/calculo/`,
`/fluidos/` y `/expresion-grafica/`, dividida entre la altura de la ventana.
