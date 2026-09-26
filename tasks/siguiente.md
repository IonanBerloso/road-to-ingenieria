# Siguiente sesión

Se sobrescribe cada vez; no se amplía. Lo que queda más allá de la próxima
sesión está en `pendiente.md`.

Escrito el 26 de septiembre de 2026, con el catálogo de Expresión Gráfica ya
fuera de `prev`.

## Qué toca: el piloto de SD1 en Expresión Gráfica

Es la última asignatura de esta tanda (CLAUDE.md §00) y la primera cuyo examen
es un dibujo. El diseño está hecho y aprobado desde el 8 de septiembre
(`2027 proyecto contenido/Claude outputs/expresion-grafica-brief.md`); lo que
falta es traerlo al repositorio sin romper ninguna regla.

1. **`npm run suelo` en verde sobre `main`** antes de tocar nada, solo, sin
   nada en paralelo.
2. **Leer el brief y el paquete** (`expresion-grafica-paquete-1.zip`): el
   piloto del taller, `sd1-ejemplo.yaml` y el extractor. No se copia nada sin
   leerlo, y el PDF de la colección no entra (§08): las láminas van como datos.
3. **`lib/diedrico.ts` con lo que SD1 necesita, y sus pruebas antes que el
   componente** (§10). **Hecho el 26 de septiembre de 2026**: doce pruebas en
   `tests/geometria/sd1.test.ts` con los valores de referencia del brief —P₁,
   Q₁, Q₂, G₂ y las cuatro longitudes— y dos caminos. Y ya enseñó algo: Q
   calculado por el plano del tejado y por el alero difiere 0,10 pt, porque el
   vértice B se separa 0,034 mm del plano de los otros tres; la solución es la
   del alero, que es la que construye el alumno.
4. **El paso `construir` en el esquema y el componente `Taller`**, con SD1
   entero. Mirarlo en claro, en oscuro, a 360 px y fallando a propósito (§16).
5. **SD4 y SD5**, que son los que más funciones piden. Con los tres hechos y
   mirados, y solo entonces, se documenta el patrón en §05.

Antes del primer tema conviene tener las cuatro respuestas que están arriba
en `pendiente.md`; sin ellas se puede avanzar en la geometría, no en las rutas.
