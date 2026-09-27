# Siguiente sesión

Se sobrescribe cada vez; no se amplía. Lo que queda más allá está en
`pendiente.md`, con las fases en orden arriba del todo.

Escrito el 27 de septiembre de 2026, al cerrar la fase C: Mecánica Aplicada
tiene sus ocho convocatorias transcritas —las cinco bilingües, solo la columna
en castellano—, cada bloque de sus dos rutas con ejercicios de examen, las
nueve deducciones en la prosa con `redactar`, doce pasos `dibujar` entre
diagramas N/V/M y sólidos libres, y su formulario.

## Qué toca: la fase D, las demostraciones de 1.º

El encargo está en `2027 proyecto contenido/auditorias/2026-09-27/`
(`encargo-por-fases.md`, fase D):

1. **D0 · Esquema y guardián.** Rúbricas compartidas por familia, con
   `redactar: { rubrica: <id> }` apuntando a una colección de rúbricas en vez
   de copiar la misma en nueve ejercicios; la rúbrica como casillas que
   cuentan puntos y marcan los mínimos; y un guardián en `deuda.mjs` que
   cuente los ejercicios de examen que piden demostrar, deducir, razonar o
   justificar y no tienen `redactar`.
2. **D1 · Álgebra** (2–3 días): las demostraciones que caen, por frecuencia;
   `redactar` en los (a) de examen que no lo tienen; la teoría de t03 y t07;
   la instrucción de portada «Razonar todas las respuestas…» como campo
   `instrucciones`.
3. **D2 · Cálculo** (1,5–2 días): `redactar` en los diez ejercicios de
   demostración pura, Barrow y el valor medio en t05, Bolzano en t03, y la
   teoría que el encargo lista.

Antes de cada pieza nueva, la prueba de utilidad de §13.

## Lo que quedó apuntado de la fase C

- `recalcula` se salta en silencio un número pegado a un comando, como
  `2\pi` o `4\sqrt{7}`, según dos de los agentes que transcribieron; los dos
  lo esquivaron escribiendo `2\,\pi`. Hay que reproducirlo y, si es así,
  enseñar al evaluador la yuxtaposición en ese punto.
- `lib/unidades.ts` no lee `rad/s`, así que las velocidades angulares de
  examen van como `numero` con la unidad en el `formato`. Si alguna vez se
  añade el radián, tiene que ser adimensional para no romper las magnitudes
  que ya existen.
- Las figuras escritas a mano no pasan por el lienzo, así que nadie mide sus
  rótulos al escribirlas: la cota «100 mm» de mayo de 2019 se salió en el CI y
  paró un despliegue. La cuenta que la habría cazado —0,64 del cuerpo por
  letra— vivió en el scratchpad de esa sesión; si vuelve a pasar, merece ser
  un guion del repositorio.
