/**
 * Las cuartas evaluaciones de Cálculo de 2014-2015, 2015-2016 y 2016-2017.
 * Doce respuestas entre las tres. La de 2014-2015 es la convocatoria más
 * antigua de todo el corpus.
 *
 * El ejercicio 2 de 2016-2017 pide plantear el mismo volumen **en cilíndricas
 * y en esféricas**, y calcularlo por una de las dos. Aquí se hace por una
 * tercera: rebanando en z. Cada rebanada es un disco, y quien manda cambia a
 * media altura —el cono abajo, la esfera arriba—, así que la integral se parte
 * justo donde las dos superficies se cortan.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { integra, raiz } from './numerico';
import { norma, resuelve, escalar, unitario } from './lineal';

const cuadra1617 = convocatoria('calculo', '2016-2017-4ev');
const cuadra1516 = convocatoria('calculo', '2015-2016-4ev');
const cuadra1415 = convocatoria('calculo', '2014-2015-4ev');

/**
 * Integral doble sobre un disco de radio R centrado en el origen. El
 * integrando se evalúa en cartesianas —que es lo que la separa del camino de
 * las resoluciones, todas en cilíndricas—, pero el barrido exterior va con
 * x = R·sen θ. El motivo es puramente numérico: la anchura del disco tiene
 * derivada infinita en los bordes, y el cambio la convierte en un coseno.
 * Sin él, la versión con `integraCasi` anidada tardaba quince segundos.
 */
const sobreElDisco = (f: (x: number, y: number) => number, R: number) =>
  integra(
    (theta) => {
      const x = R * Math.sin(theta);
      const alto = R * Math.cos(theta);
      return integra((y) => f(x, y), -alto, alto, 1e-9) * alto;
    },
    -Math.PI / 2,
    Math.PI / 2,
    1e-7,
  );

describe('2016-2017 · 1 · la montaña con dos pendientes', () => {
  const id = 'ex1617-4ev-1-montana-con-dos-pendientes';
  /* Dos derivadas direccionales conocidas dan dos ecuaciones lineales sobre
     las componentes del gradiente. */
  const direcciones = [
    [3, 4],
    [4, -3],
  ];
  const pendientes = [3, -1];
  const gradiente = resuelve(direcciones, direcciones.map((v, i) => pendientes[i] * norma(v)));

  it('la primera ecuación queda igualada a 15', () =>
    cuadra1617(id, 'La primera ecuación', pendientes[0] * norma(direcciones[0])));

  it('y la primera componente del gradiente es 1', () => {
    /* Se comprueba al revés: con ese gradiente, las dos derivadas
       direccionales del enunciado tienen que salir. */
    for (const [i, v] of direcciones.entries())
      if (Math.abs(escalar(gradiente, unitario(v)) - pendientes[i]) > 1e-9)
        throw new Error(`la dirección ${v} no da la pendiente que dice el enunciado`);
    cuadra1617(id, 'La primera componente del gradiente', gradiente[0]);
  });

  it('y hacia (1,1) se sube a 2√2', () =>
    cuadra1617(id, 'La velocidad hacia (1,1)', escalar(gradiente, unitario([1, 1]))));
});

describe('2016-2017 · 2 · el cono de helado', () => {
  const id = 'ex1617-4ev-2-cono-de-helado';

  it('el cono abre hasta 45 grados', () => {
    /* En esféricas, x²+y² ≤ z² es ρ sen φ ≤ ρ cos φ. El límite está donde las
       dos coinciden, y se busca en vez de recordarlo. */
    const limite = raiz((fi) => Math.sin(fi) - Math.cos(fi), 0.01, Math.PI / 2 - 0.01);
    cuadra1617(id, 'El ángulo del cono', (limite * 180) / Math.PI);
  });

  it('y el volumen es 4,9074', () => {
    /* **Rebanando en z**, que no es ninguno de los dos planteamientos que el
       enunciado pide. Abajo manda el cono y arriba la esfera; el cambio ocurre
       donde se cortan, y ese punto se busca. */
    const corte = raiz((z) => z * z + z * z - 4, 0.1, 2);
    const disco = (z: number) => Math.PI * (z < corte ? z * z : 4 - z * z);
    cuadra1617(id, 'El volumen', integra(disco, 0, corte, 1e-11) + integra(disco, corte, 2, 1e-11));
  });
});

describe('2015-2016 · 1 · el paraboloide y su centro', () => {
  const id = 'ex1516-4ev-1-paraboloide-y-su-centro';
  /* z = 1 − ρ² sobre el disco unidad, integrado **en cartesianas**: la
     resolución lo hace en cilíndricas. */
  const alto = (x: number, y: number) => 1 - x * x - y * y;
  const volumen = sobreElDisco(alto, 1);

  it('el volumen es π/2', () => cuadra1516(id, 'El volumen', volumen));

  it('y el centro de gravedad está a un tercio de altura', () => {
    /* El momento respecto del plano XY es ∫∫∫ z, que por columnas es la mitad
       del cuadrado de la altura. */
    const momento = sobreElDisco((x, y) => alto(x, y) ** 2 / 2, 1);
    cuadra1516(id, 'La altura del centro de gravedad', momento / volumen);
  });
});

describe('2015-2016 · 2 · los dos gradientes encadenados', () => {
  it('la parcial respecto del límite inferior vale −1 en el origen', () => {
    /* f(x,y) = ∫ₓ^y cos(t²)dt. El teorema fundamental dice que derivar
       respecto del límite **inferior** cambia el signo; aquí no se usa el
       teorema: se construye la integral y se deriva numéricamente. */
    const f = (x: number, y: number) => integra((t) => Math.cos(t * t), x, y, 1e-12);
    const h = 1e-5;
    const parcialX = (f(0 + h, 1) - f(0 - h, 1)) / (2 * h);
    /* Y de paso, que la parcial en y sí es el integrando sin cambiar de
       signo, que es la mitad del enunciado. */
    const parcialY = (f(0, 1 + h) - f(0, 1 - h)) / (2 * h);
    if (Math.abs(parcialY - Math.cos(1)) > 1e-6) throw new Error('la parcial en y no es cos(y²)');
    cuadra1516('ex1516-4ev-2-dos-gradientes-encadenados', 'La derivada respecto del límite inferior', parcialX);
  });
});

describe('2014-2015 · 1 · la masa bajo el paraboloide', () => {
  const id = 'ex1415-4ev-1-masa-bajo-el-paraboloide';
  /* Tapa z = x²+y²+2 sobre el disco de radio 2. */
  const tapa = (x: number, y: number) => x * x + y * y + 2;

  it('en el borde el sólido tiene 6 de altura', () => cuadra1415(id, 'La altura del sólido en el borde', tapa(2, 0)));

  it('y la masa es 72π', () => {
    /* **En cartesianas**, tres integrales anidadas, mientras que la resolución
       pasa a cilíndricas. La columna sobre cada punto se integra de verdad, no
       con la primitiva. */
    const columna = (x: number, y: number) =>
      integra((z) => x * x + y * y + z, 0, tapa(x, y), 1e-11);
    cuadra1415(id, 'La masa', sobreElDisco(columna, 2));
  });
});

describe('2014-2015 · 2 · dónde la derivada máxima vale cuatro', () => {
  const id = 'ex1415-4ev-2-donde-la-derivada-maxima-vale-cuatro';
  const grad = (x: number, y: number) => [4 * x, 2 * y];

  it('la elipse tiene semieje 2 en la vertical', () => {
    /* El lugar es donde el módulo del gradiente vale 4. Su semieje vertical es
       el corte con el eje Y, y se busca resolviendo. */
    const semiejeY = raiz((y) => norma(grad(0, y)) - 4, 0.1, 20);
    const semiejeX = raiz((x) => norma(grad(x, 0)) - 4, 0.1, 20);
    if (Math.abs(semiejeX - 1) > 1e-9) throw new Error('el semieje horizontal no es 1');
    cuadra1415(id, 'La curva que sale', semiejeY);
  });

  it('y el punto pedido está en y = 2', () => {
    /* La dirección de máximo cambio es la del gradiente. Para que sea (0,1)
       hace falta que la primera componente se anule; después, el módulo fija
       la altura. */
    const x = raiz((t) => grad(t, 1)[0], -5, 5);
    const y = raiz((t) => norma(grad(x, t)) - 4, 0.1, 20);
    if (Math.abs(escalar(unitario(grad(x, y)), [0, 1]) - 1) > 1e-9)
      throw new Error('el gradiente no apunta hacia (0,1)');
    cuadra1415(id, 'El punto concreto', y);
  });
});
