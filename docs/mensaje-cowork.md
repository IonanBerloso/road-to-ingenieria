# Mensaje para Claude Cowork

> **Antes de pegarlo.** Crea la carpeta del proyecto, mete dentro `CLAUDE.md` en
> la raíz y los ocho prototipos HTML en una subcarpeta `referencia/`. Abre
> Cowork en esa carpeta y pega lo de abajo. Sirve igual para Claude Code.

---

Vas a arrancar **Road to Ingeniería**, una plataforma de estudio gratuita para
alumnos de 1.º y 2.º de la Escuela de Ingeniería de Gipuzkoa (UPV/EHU). Sitio
estático con Astro, desplegado en GitHub Pages: sin backend, sin cuentas, sin
base de datos.

**Lee `CLAUDE.md` entero antes de nada.** Son las reglas del repositorio y no
son negociables: salen de auditar el proyecto anterior, que acabó con 79 bloques
`:root` duplicados, cuatro paletas de color, 366 MB de historial y doce scripts
de rediseño masivo. La Regla 0 te aplica directamente a ti.

En `referencia/` tienes ocho prototipos HTML ya validados con el cliente. **Son
la fuente de verdad del diseño**, pero están hechos como ficheros autónomos y
por eso llevan todo el CSS inline y el JavaScript repetido. Tu trabajo no es
copiarlos: es **extraer de ellos la capa compartida** y volver a montarlos
encima. Esa extracción es exactamente lo que nunca se hizo el año pasado.

Mapa de qué demuestra cada uno:

| fichero | qué aporta |
|---|---|
| `selector-fluido.html` | la portada: lente tipográfica, transición FLIP, paleta de comandos |
| `prototipo-figura-fija.html` | patrón Figura Fija (números complejos) |
| `prototipo-tema.html` | patrón Lectura con herramienta incrustada (Venturi) |
| `simulador-bombeo.html` | simulador de física con datos reales de examen |
| `ejercicio-guiado.html` | patrón Ejercicio Guiado con diagnóstico de error |
| `demostracion-guiada.html` | patrón Demostración por piezas |
| `regiones-complejos.html` | patrón Verificador + intérprete de expresiones complejas |
| `paleta-datos.html` | los seis colores de datos y su verificación de daltonismo |

## Qué quiero en esta primera sesión

Solo los cimientos y **una** página de contenido. Nada más.

1. **Proyecto Astro** con `@astrojs/mdx`, la estructura de carpetas de la
   sección 03 de `CLAUDE.md`, y `astro.config` preparado para GitHub Pages.

2. **`src/styles/tokens.css`** — el único `:root{}` del repositorio, extraído de
   los prototipos: tres colores semánticos, seis de datos, nueve acentos de
   asignatura, las tres familias tipográficas y el tema oscuro en
   `[data-theme="oscuro"]`.

3. **`src/styles/base.css`** y **`print.css`** — lo que se repite en los ocho
   prototipos: cabecera, cajas de error típico, paneles, botones, controles de
   rango, tarjetas, tablas. Detecta tú qué se repite de verdad; si algo aparece
   una sola vez, no lo subas a la capa compartida.

4. **Fuentes autoalojadas** con `@fontsource`. Ni una petición a Google Fonts.

5. **`src/content.config.ts`** — colecciones con esquema Zod. El catálogo de las
   nueve asignaturas y los temas, con sus campos validados: si falta un campo o
   un peso está fuera de rango, **el build debe fallar**.

6. **La portada**, portada desde `referencia/selector-fluido.html` pero ya sin
   CSS inline y leyendo el catálogo de la colección, no de un array metido en el
   script.

7. **Un tema real: `calculo/t01-complejos`**, como `index.mdx` usando el patrón
   Figura Fija. Es la prueba de que la capa compartida funciona: **si esta
   página necesita CSS propio, la extracción está mal hecha.**

8. **`scripts/verify.mjs`** — todas las comprobaciones de la sección 11 de
   `CLAUDE.md`, con código de salida distinto de cero si algo falla.

9. **GitHub Actions** que ejecute build, `verify.mjs` y tests antes de publicar.

10. **`README.md`** breve y **`tasks/todo.md`** con lo que queda.

## Qué NO quiero todavía

Ni React, ni Vue, ni Svelte — los componentes interactivos llevan `<script>`
plano dentro del `.astro`. Ni librerías de gráficas. Ni generación de PDFs, ni
service worker, ni las otras ocho asignaturas, ni los demás patrones de página.

Y no portes todavía el componente `EjercicioGuiado`: **el diseño de su formato
de datos lo discutimos antes de escribirlo**, porque de él depende que añadir un
tema sea rellenar un YAML en vez de programar.

## Criterio de aceptación

- `npm run build` termina sin errores y `verify.mjs` pasa limpio.
- Sirve el sitio, **desconecta la red y recarga**: todo debe verse exactamente
  igual, tipografías incluidas.
- La portada funciona con teclado: `/` abre la paleta, flechas navegan, Enter
  abre, Escape cierra.
- Con `prefers-reduced-motion` activado no hay ninguna animación.

## Cómo trabajar

Empieza en **Plan Mode**: escribe `tasks/todo.md` con el plan y espera mi visto
bueno antes de crear ficheros. Código en inglés, documentación e interfaz en
castellano. Conventional Commits.

Y lo más importante: si en algún momento te ves escribiendo un script que aplica
el mismo cambio a varias páginas, o copiando un bloque de CSS de un sitio a
otro, **para y dímelo**. Es la señal de que algo debería estar en la capa
compartida y no lo está.
