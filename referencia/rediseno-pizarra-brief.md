# Rediseño «Pizarra» — brief de traspaso para Claude Code

Este documento traspasa una decisión de diseño ya tomada (agosto 2026, sesión
de Cowork) a la sesión de implementación en el repo `road-to-ingenieria`.
No es una propuesta: es el resultado de comparar cuatro mundos visuales
diseñados desde cero. Ionan eligió este.

Los mockups aprobados viven en el lienzo de diseño:
https://claude.ai/code/artifact/c2c779e8-2da8-44a5-ba82-92be75f79863
(página «Comparación · antes / después»: portada Pizarra + interior T01;
cada tablero se puede exportar como PNG desde su menú).

---

## 1 · La decisión, y las reglas que la produjeron

- **Mundo elegido: Pizarra.** Pizarra verde con tiza para la identidad;
  papel cálido para la lectura larga.
- **Regla del cansancio (dicha por Ionan, sale de upv-ehu-project):** «lo
  futurista impresiona el primer día y cansa la vista a la semana». Todo lo
  que se implemente se juzga con esa vara: calidez antes que espectáculo.
- **La portada no supone itinerario:** hay alumnos que no cursan todas las
  asignaturas. Nada de ejercicio-puerta, cada uno entra a lo suyo.
- **Nada de cuenta atrás al examen** (probada el año pasado: metía presión).
- **Nada de localStorage / memoria de progreso** por ahora.
- **El movimiento se ve una vez** (entrada) **o bajo demanda** (hover,
  arrastrar). Mientras se lee, nada se mueve. `prefers-reduced-motion`
  lo apaga todo (base.css ya lo hace globalmente).

## 2 · Dónde vive cada superficie

- **PIZARRA (fondo oscuro verde):** la portada entera, la barra superior de
  las páginas interiores, los recuadros de ErrorTipico, los recuadros de
  diagnóstico del ejercicio guiado, y las figuras de tema cuando se enmarcan
  como «mini-pizarra».
- **PAPEL (fondo claro cálido):** todo donde se lee o se trabaja durante
  horas — prosa de temas, ejercicios, exámenes, rutas. Motivo: fatiga visual
  e impresión (el modo completo se imprime, §11 de CLAUDE.md).

## 3 · Tokens del mockup (punto de partida para tokens.css)

Pizarra (portada y acentos):
- fondo: gradiente radial `#1D463A → #12332A → #0D2820` + viñeta interior
  (`box-shadow: inset 0 0 150px rgba(0,0,0,.5)`)
- tiza blanca (texto principal): `#F2F0E9` (apagada: rgba(242,240,233,.55-.8))
- tiza amarilla (acento, interactivo, subrayados): `#F5D76E`
- tiza verde-menta (estado «hecho»): `#9FE8C4`
- polvo de tiza: dos capas de `radial-gradient` de puntos de 1px, opacidad ~.32
- repisa de madera: gradiente `#3A2E22 → #291F16` con tizas apoyadas

Papel (interior):
- fondo: `#F8F5EC` · panel blanco `#FFFFFF` · regla `#E2DBC8`
- tinta: `#2B2A24` · prosa `#3C3A32` · atenuado `#8A8471`
- verde identidad (enlaces, interactivo, kickers): `#1C6E51`
  (hover `#12513B`)
- error/incorrecto: `#C6503C` con fondo `#FBF1EE`

Estos valores salen del mockup aprobado. Ajustar contraste con
`scripts/check-color.mjs` antes de fijarlos (especialmente amarillo sobre
pizarra y atenuados sobre papel); si hay que moverlos, mover poco y mantener
el tono.

## 4 · Tipografía

- **Karla** — interfaz y cuerpo (400/500/700/800). `@fontsource/karla`.
- **Caveat** — SOLO anotaciones manuscritas: rótulos de tiza, apuntes al
  margen, títulos de ErrorTipico, estados («la estamos escribiendo»).
  Nunca cuerpo de texto ni párrafos. `@fontsource/caveat`.
- **Las fórmulas no cambian:** KaTeX en el build con sus propias fuentes
  (§07). El serif de los mockups era un placeholder de fórmula.
- Sustituyen a Fraunces + IBM Plex → hay que actualizar la tabla de
  dependencias de CLAUDE.md §02 y la sección §06 entera (regla del propio
  fichero: una regla que estorba se cambia ahí, no se ignora).

## 5 · La portada (fase 1)

Referencia: tablero «Después · portada Pizarra». Piezas, de arriba abajo:
1. Barra: wordmark en Caveat + «Escuela de Ingeniería de Gipuzkoa · UPV/EHU»
   + buscador (la paleta de comandos actual se conserva tal cual, `/` y `⌘K`).
2. Héroe: titular «La clase donde por fin te dicen dónde te equivocas» con
   subrayado de tiza amarilla QUE SE DIBUJA UNA VEZ (animación de
   stroke-dashoffset, `forwards`, nunca `infinite`); entradilla; dos CTA
   («Entrar a Cálculo» amarillo sólido, «Entrar a Álgebra» borde tiza);
   línea «gratis para siempre · sin cuentas · sin anuncios» en Caveat.
3. Figura tocable a la derecha: curva de tiza que se dibuja al entrar; un
   punto amarillo ARRASTRABLE por la curva cuya tangente (dashed amarilla)
   le sigue. Implementación del mockup: `path.getTotalLength()` +
   `getPointAtLength`, pointer events con `setPointerCapture`, búsqueda del
   punto más cercano muestreando ~90 puntos. JS plano en el `.astro`.
   En táctil funciona (touch-action: none); con reduced-motion la curva
   aparece dibujada y el punto queda quieto pero arrastrable.
4. El temario: dos columnas (1.er / 2.º curso), números y estados en Caveat,
   nombres en Karla. Estados honestos desde el catálogo: entera / la estamos
   escribiendo / aún no.
5. Repisa con tizas + la frase «pocas excelentes antes que muchas a medias».

Qué se conserva de la portada actual: la paleta de comandos entera, las
anclas `:target` (funciona sin JS), el foco visible, y el detalle por
asignatura si se mantiene la vista B (el FLIP puede quedarse — el nombre
viajando no cansa; decidir al implementar si el detalle adopta pizarra o
lleva ya al papel).

## 5b · El detalle de asignatura (vista B de index.astro — va con la fase 1)

Referencia: tablero «Después · detalle de Cálculo». Aprobado por Ionan.
- Banda de PIZARRA con la identidad: «02 · 1.er curso · asignatura entera»
  en Caveat amarilla, nombre en Karla 800 blanca, la descripción real del
  catálogo, y UN solo CTA amarillo que baja a las rutas.
- Cuerpo en PAPEL. La lista de temas lleva SOLO número (Caveat verde),
  título (Karla 700) y peso — **sin la descripción bajo el título**
  (decisión explícita de Ionan, 29-08-2026; la descripción sigue en el
  catálogo y puede aparecer dentro del tema, no en esta lista).
- Peso honesto del catálogo: rojo `#C6503C` SOLO para «alto» (la semántica
  de --flag: esto decide notas); medio y bajo en neutros de papel.
- Los seis puntitos de patrones de la vista actual se sustituyen por una
  etiqueta Caveat solo donde informa («con simulador» en T01).
- Carril derecho: recuadro de pizarra «Por dónde empezar» con las rutas por
  evaluación (una destacada en amarillo; cuál destacar se decide al
  implementar — NUNCA con cuenta atrás), y tarjeta de papel de exámenes con
  las convocatorias más recientes y el total calculado en el build.
- Todos los datos salen de las colecciones en el build, nunca escritos a
  mano en la página.

## 6 · El interior (fase 2, tras validar la portada)

Referencia: tablero «Después · interior T01». Lectura sobre papel; la
pizarra aparece como: barra superior, mini-pizarra de figura, recuadro de
ErrorTipico (título en Caveat amarilla), recuadro de diagnóstico del
ejercicio. El toggle claro/oscuro existente se replantea aquí (el papel
cálido ES el modo claro; el oscuro del interior puede esperar a esta fase).

## 7 · Contenido de muestra — NO copiar al repo

Del mockup del interior, es contenido escrito para el mockup (no del corpus):
el ejercicio del argumento de z = −1−i con sus tres opciones y su
diagnóstico, y la frase «cae todos los años» junto al título. La prosa de
complejos, la fórmula del conjugado y el error típico del arctan sí
parafrasean contenido real del repo, pero al implementar se usa el contenido
del corpus tal cual está, nunca el texto del mockup.

## 8 · Orden de trabajo sugerido

1. Rama nueva. Tokens y fuentes (`tokens.css`, package.json, §02/§06 de
   CLAUDE.md). `check-color.mjs` sobre los pares nuevos.
2. Portada + detalle de asignatura (las dos vistas viven en `index.astro`;
   también `Cabecera.astro`). La figura tocable.
3. Mirarlo (§16): claro, 360 px, teclado, reduced-motion, y dejar capturas.
4. `npm run suelo`. Ojo con verify.mjs: un solo `:root{}`, cero literales
   fuera de tokens.css, cero dominios externos (las fuentes por @fontsource,
   nunca Google Fonts CDN — los mockups usaban CDN solo por ser mockups).
5. Enseñárselo a Ionan antes de tocar el interior.
