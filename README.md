# Road to Ingeniería

Plataforma de estudio gratuita para alumnos de 1.º y 2.º de la Escuela de
Ingeniería de Gipuzkoa (UPV/EHU). Sitio estático, sin backend y sin cuentas.

**Las reglas del repositorio están en [`CLAUDE.md`](CLAUDE.md) y no son
decoración.** Léelo antes de tocar nada.

Piloto: **Cálculo** (1.º) y **Mecánica de Fluidos** (2.º).

## Poner en marcha

```bash
npm install
npm run dev          # http://localhost:4321/road-to-ingenieria/
```

## Comandos

| comando | qué hace |
|---|---|
| `npm run build` | construye el sitio en `dist/` |
| `npm run verify` | el suelo de calidad de la sección 11 de `CLAUDE.md` |
| `npm run color` | verifica la paleta: contraste, deuteranopía, protanopía, grises |
| `npm test` | tests unitarios y de física de los simuladores |
| `npm run humo` | abre el sitio en Chromium y comprueba que funciona, no solo que está |
| `npm run suelo` | los cinco seguidos, que es lo que corre CI |

`npm run verify -- --solo-fuente` comprueba solo `src/`, sin necesidad de build.

## Cómo se añade un tema

Un tema **no se programa: se rellena**. Son dos ficheros:

```
src/content/<asignatura>/tNN-slug/
  index.mdx           la prosa, con componentes incrustados
  ejercicios.yaml     los ejercicios como datos (todavía sin implementar)
```

Y una entrada en `src/content/catalogo/<asignatura>.json` con `hecho: true`.
Si el catálogo dice que un tema está hecho y no existe el `index.mdx`,
**el build falla**. Es a propósito.

## Estado

Cimientos y una página de contenido real (`calculo/t01-complejos`). Lo que
falta, con su porqué, está en [`tasks/todo.md`](tasks/todo.md).

## Despliegue

GitHub Actions construye, pasa `verify.mjs`, pasa los tests y solo entonces
publica en GitHub Pages: **https://ionanberloso.github.io/road-to-ingenieria/**

La URL del sitio se declara una sola vez, en `astro.config.mjs` (`site` + `base`);
`verify.mjs` la importa de ahí. Para cambiar de dominio se tocan esas dos líneas.

## Derechos

Material docente usado con permiso de la UPV/EHU. No entra material de terceros
en el repositorio: ni diapositivas, ni exámenes en PDF, ni figuras escaneadas de
manuales. Los enunciados se reescriben y se cita la procedencia.

`referencia/` contiene los prototipos HTML de diseño validados con el cliente.
No forman parte del sitio publicado y `verify.mjs` los ignora a propósito.
