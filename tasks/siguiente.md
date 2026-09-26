# Siguiente sesión

Se sobrescribe cada vez; no se amplía. Lo que queda más allá está en
`pendiente.md`, con las fases en orden arriba del todo.

Escrito el 27 de septiembre de 2026, al empezar la fase 1.

## Qué toca: el patrón de construcción verificada, empezando por las recetas

Lo que ya está: `lib/diedrico.ts` con la geometría de SD1, SD3 y SD4 y treinta
pruebas cotejadas contra el piloto (`tests/geometria/`). El diseño aprobado
está en `2027 proyecto contenido/Claude outputs/expresion-grafica-brief.md` y
el ejemplo de datos en `sd1-ejemplo.yaml`.

1. **Las recetas y los predicados como datos** (`lib/diedrico-receta.ts`): un
   analizador pequeño para lo que el YAML declara —`nombre: funcion(args)`,
   referencias a la lámina (`figura.punto("P2")`), listas, `!` y `&&`— y un
   evaluador sobre `lib/diedrico`. La receta de SD1 tiene que reproducir sus
   valores de referencia; una receta que no evalúa, o una función que no
   existe, lanza con un mensaje que dice dónde. Pruebas antes que código.
2. **Lo que piden SD5 y SD7** y la gramática tiene que admitir desde el
   principio: soluciones alternativas —dos lados válidos— y objetivos que
   dependen de lo ya marcado; y el punto a una distancia real sobre una recta
   dada por sus proyecciones.
3. **Las láminas como datos**: una colección con su esquema, y SD1 revisada
   contra el PDF a la misma escala antes de escribir el primer objetivo.
4. **El paso `construir`** en el esquema, y la receta evaluada en el build: si
   no evalúa, el build falla.
5. **`Taller.astro`**, portado del motor piloto, como componente propio que
   `EjercicioGuiado` solo coloca y escucha por eventos.
6. **SD1 en el tema 2**, con su prosa, y su comprobador de Playwright en el
   suelo, construyendo el camino bueno y cada error declarado.

Mientras corren el suelo o el despliegue, la deuda de `pendiente.md`, empezando
por los seis apartados de Térmica 2025-26.
