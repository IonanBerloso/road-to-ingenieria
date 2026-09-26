# Siguiente sesión

Se sobrescribe cada vez; no se amplía. Lo que queda más allá está en
`pendiente.md`, con las fases en orden arriba del todo.

Escrito el 27 de septiembre de 2026 a la 01:30. La fase 1 se aparca para una
auditoría externa del proyecto; al volver, se sigue aquí.

## Qué toca: el componente `Taller` y SD1 entero

Lo que ya está, con sus pruebas en `tests/geometria/`:

- `lib/diedrico.ts`: la geometría de SD1, SD3, SD4, SD5 y SD7, cotejada con
  los pilotos.
- `lib/diedrico-receta.ts`: las recetas como datos, con elecciones y firmas;
  revisado dos veces por un agente.
- `lib/diedrico-corrige.ts`: lo único que irá a la página.
- `src/content/laminas/sd1.json`, cotejada con el PDF, y
  `scripts/lamina-sobre-pdf.mjs` para las demás.
- `lib/construir.ts`: el paso resuelto, con cada error construido a propósito.

**Hay borradores de todo lo que sigue**, sin compilar, fuera del repositorio:
`2027 proyecto contenido/Claude outputs/fase-1-borradores/`, con un README que
dice adónde va cada uno y qué falta. Se meten en este orden:

1. **El esquema**: `pasoConstruir` y `receta` en `content.config.ts`, la regla
   de COMP2 en el esquema y en `revisa-ejercicios.mjs`, y `evaluaNumero` y
   `resuelveEjercicio` en `lib/`.
2. **`Taller.astro`** y su sitio en `EjercicioGuiado`, que le pasa el paso
   resuelto y escucha sus cinco eventos.
3. **SD1 en el tema 2**, con su prosa (`expresion-grafica` en `CON_TEMAS`,
   `hecho: true` en el catálogo), y la guarda que resuelve todos los
   `construir` del corpus. Antes de pegarlo, arreglar la diferencia de cotas
   del desarrollo (≈ 31,99 mm, no 31,53) y decidir la tolerancia.
4. **`scripts/comprueba-talleres.mjs`** en el suelo, y mirarlo en claro, en
   oscuro, a 360 px y fallando a propósito.
5. Después SD4 y SD5, y el patrón en §05 como «construcción verificada».

Mientras corren el suelo o el despliegue, la deuda de `pendiente.md`, empezando
por los seis apartados de Térmica 2025-26.
