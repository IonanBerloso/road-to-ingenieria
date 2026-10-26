# Road to Ingeniería

Plataforma de estudio gratuita para el alumnado de 1.º y 2.º de la Escuela de
Ingeniería de Gipuzkoa (UPV/EHU): **<https://ionanberloso.github.io/road-to-ingenieria/>**

Es un sitio estático, sin servidor y sin cuentas. El progreso de cada ejercicio
se guarda en el propio navegador.

## Qué hay dentro

- **La teoría de cada tema**, escrita para estudiar sola, con las figuras
  redibujadas y los errores típicos señalados.
- **Ejercicios interactivos que corrigen.** Una respuesta equivocada no recibe
  un «incorrecto»: recibe el porqué del error concreto que la produce, con
  pista y desarrollo si hacen falta.
- **Los exámenes de la escuela**, transcritos tal cual, sin cambiar un número, y
  resueltos paso a paso. Cada ejercicio cita su procedencia exacta.
- **En Expresión Gráfica**, la Colección de ejercicios de diédrico con un
  *Taller* donde se construye la solución sobre la lámina y se corrige punto a
  punto, y una animación que enseña la construcción con la escuadra, el cartabón
  y el compás de cada trazo, y por qué se hace.
- **Simuladores, formularios y rutas de estudio** donde la asignatura los pide.

## Estado (3 de octubre de 2026)

| Asignatura | Temas terminados |
| --- | --- |
| Cálculo | 11 de 11 |
| Álgebra | 7 de 8 |
| Fundamentos Químicos | 10 de 10 |
| Mecánica Aplicada | 12 de 12 |
| Ciencia de Materiales | 10 de 10 |
| Ingeniería Térmica | 10 de 10 |
| Mecánica de Fluidos | 23 de 25 |
| Expresión Gráfica | 7 de 17 (en curso) |
| Sistemas de Producción | 0 de 6 (pendiente) |

Lo que queda y en qué orden está en [`tasks/pendiente.md`](tasks/pendiente.md),
y la próxima sesión, en [`tasks/siguiente.md`](tasks/siguiente.md). El catálogo
de temas de cada asignatura vive en `src/content/catalogo/`.

## Poner en marcha

```bash
npm install
npm run dev          # http://localhost:4321/road-to-ingenieria/
```

**Las reglas del repositorio están en [`CLAUDE.md`](CLAUDE.md).** Léelo antes de
tocar nada: no es decoración.

## Comandos

| comando | qué hace |
| --- | --- |
| `npm run build` | construye el sitio en `dist/` |
| `npm run verify` | las comprobaciones de `CLAUDE.md` §11 sobre el sitio construido |
| `npm test` | los tests: lectores de respuesta, geometría, física de los simuladores |
| `npm run humo` | abre el sitio en Chromium y comprueba que funciona, no solo que está |
| `npm run talleres` | construye en el navegador la solución de cada *Taller*, como un alumno |
| `npm run suelo` | las diez comprobaciones seguidas, que es lo que corre el despliegue |
| `npm run revisa` | revisa un fichero de ejercicios antes de pegarlo |
| `npm run diario` | arma el PDF del diario del proyecto desde `diario/*.md` |

`npm run suelo` encadena `build`, `verify`, `recalcula`, `cifras`, `color`,
`contraste`, `test`, `humo`, `sim` y `talleres`.

## Cómo se añade un tema

Un tema **no se programa: se rellena**. Son dos ficheros:

```text
src/content/<asignatura>/tNN-slug/
  index.mdx           la teoría, con componentes incrustados
  ejercicios.yaml     los ejercicios, como datos
```

Y su entrada en `src/content/catalogo/<asignatura>.json`, con `hecho: true`
cuando está terminado. Si el catálogo dice que un tema está hecho y no existe su
`index.mdx`, **el build falla**, a propósito. Cómo se escribe cada parte, en
`CLAUDE.md` §04.

## El diario

`diario/` lleva un registro por día de qué se hizo, qué se rompió y qué se
decidió: la parte que el historial de git no cuenta. Se escribe en Markdown, un
fichero por día, y **eso es el original**.

`npm run diario` lo arma en un PDF con la tipografía del proyecto. Ese PDF es un
artefacto de build y no se versiona (`CLAUDE.md` §12).

## Despliegue

Cada push a `main` lanza GitHub Actions, que pasa el suelo entero y solo
entonces publica en GitHub Pages. Si el push solo toca `tasks/`, `diario/` o
`docs/`, no publica: pasa en segundos las comprobaciones de los documentos
(`.github/workflows/documentos.yml`). La URL del sitio se declara una sola vez,
en `astro.config.mjs` (`site` y `base`).

## Derechos y datos personales

La universidad ha dado permiso para usar el material docente. Aun así
(`CLAUDE.md` §08):

- **No entran diapositivas, colecciones escaneadas ni figuras de manuales.** Las
  figuras de editoriales se redibujan, nunca se recortan del PDF.
- **Sí entran los enunciados de examen originales de la escuela**, en
  `public/examenes/`, para enlazarlos desde su resolución.
- **Nunca entran datos personales**: ni listas, ni notas, ni nombres de alumnos.

`referencia/` guarda los prototipos de diseño validados al empezar. No forman
parte del sitio publicado.

## Avisar de un error

Si un enunciado, una cifra o una corrección están mal, abre un *issue* con la
plantilla que corresponda: el sitio vive de que lo que dice sea verdad. Sin
cuenta de GitHub, cada ejercicio tiene al lado de «¿Esto está mal? Dilo» un
enlace por correo, con el ejercicio y la página ya puestos.
