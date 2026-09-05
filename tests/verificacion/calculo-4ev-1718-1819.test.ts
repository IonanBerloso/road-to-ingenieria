/**
 * Las cuartas evaluaciones de Cálculo de 2017-2018 y 2018-2019. Diez
 * respuestas entre las dos. Con ellas quedan verificadas **las once cuartas
 * evaluaciones**, de 2014-2015 a 2025-2026.
 *
 * El ejercicio 2 de 2018-2019 **obliga** a un cambio de variable: dice qué
 * cambio hacer y pide resolver con él. Eso deja el camino contrario libre para
 * el test, que integra sobre el rombo original en x e y. Los dos tienen que
 * dar 8, y si el cambio estuviera mal planteado —un jacobiano invertido, un
 * recinto que no fuera el cuadrado— no coincidirían.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { deriva, integra, integraCasi, raiz } from './numerico';
import { det, escalar, norma, unitario } from './lineal';

const cuadra1819 = convocatoria('calculo', '2018-2019-4ev');
const cuadra1718 = convocatoria('calculo', '2017-2018-4ev');

const gradiente = (f: (x: number, y: number) => number, x: number, y: number) => [
  deriva((t) => f(t, y), x),
  deriva((t) => f(x, t), y),
];

describe('2018-2019 · 1 · la perpendicular en el origen', () => {
  it('la componente en y del gradiente vale 2', () => {
    const f = (x: number, y: number) => x * x * y * y + 2 * y + 2;
    /* Y de paso, que el origen está de verdad en la curva de nivel 2. */
    if (Math.abs(f(0, 0) - 2) > 1e-12) throw new Error('el origen no está en la curva de nivel');
    cuadra1819('ex1819-4ev-1-perpendicular-en-el-origen', 'La componente en y del gradiente', gradiente(f, 0, 0)[1]);
  });
});

describe('2018-2019 · 2 · el rombo que se vuelve cuadrado', () => {
  const id = 'ex1819-4ev-2-el-rombo-que-se-vuelve-cuadrado';

  it('el jacobiano del cambio vale 2', () =>
    cuadra1819(id, 'El jacobiano', det([
      [0.5, 0.5],
      [-2, 2],
    ])));

  it('y la integral vale 8', () => {
    /* **Sobre el rombo original**, que es justo lo que el cambio de variable
       pretende evitar. Sus cuatro lados dan |y−4x| ≤ 4 y |y+4x| ≤ 4, o sea una
       anchura vertical de 8(1−|x|). Se parte en x = 0 porque ahí hay un pico y
       Simpson no lo lleva bien. */
    const media = (x: number) => 4 * (1 - Math.abs(x));
    const franja = (x: number) =>
      integra((y) => 2 * x - y + 1, -media(x), media(x), 1e-11);
    cuadra1819(id, 'La integral', integra(franja, -1, 0, 1e-9) + integra(franja, 0, 1, 1e-9));
  });
});

describe('2018-2019 · 3 · el cono, el paraboloide y el momento', () => {
  const id = 'ex1819-4ev-3-cono-paraboloide-y-momento';
  const corte = raiz((r) => r - (6 - r * r), 0.1, 5);

  it('las dos superficies se cortan en ρ = 2', () => cuadra1819(id, 'Dónde se cortan las dos superficies', corte));

  it('y el volumen es 32π/3', () => {
    /* **Rebanando en z**: la resolución integra la diferencia de alturas sobre
       el disco. Abajo el radio lo pone el cono y arriba el paraboloide, y el
       cambio ocurre a la altura del corte. */
    const disco = (z: number) => Math.PI * (z < corte ? z * z : 6 - z);
    cuadra1819(id, 'El volumen', integra(disco, 0, corte, 1e-11) + integra(disco, corte, 6, 1e-11));
  });
});

describe('2017-2018 · 1 · el límite y la direccional', () => {
  const id = 'ex1718-4ev-1-limite-y-direccional';
  const P = [1, Math.PI / 2];
  const Q = [4, Math.PI / 2 - 4];
  const PQ = [Q[0] - P[0], Q[1] - P[1]];

  it('el vector PQ mide 5', () => cuadra1718(id, 'El módulo del vector PQ', norma(PQ)));

  it('y la derivada direccional vale 8/5', () => {
    const z = (x: number, y: number) => x * x * Math.sin(2 * y);
    /* De paso, la primera mitad del ejercicio: xy/(x²+y²) no tiene límite en el
       origen, y se ve acercándose por dos rectas distintas. */
    const porLaRecta = (m: number) => (t: number) => (t * (m * t)) / (t * t + (m * t) ** 2);
    if (Math.abs(porLaRecta(0)(1e-6) - porLaRecta(1)(1e-6)) < 1e-3)
      throw new Error('las dos direcciones dan lo mismo, y el límite existiría');
    cuadra1718(id, 'La derivada direccional', escalar(gradiente(z, P[0], P[1]), unitario(PQ)));
  });
});

describe('2017-2018 · 2 · el centro del cuarto de elipse', () => {
  const id = 'ex1718-4ev-2-centro-del-cuarto-de-elipse';
  /* x²/4 + y² ≤ 1 con x ≥ 0 e y ≥ 0: la altura del recinto en cada x es
     √(1−x²/4), con derivada infinita en x = 2. */
  const techo = (x: number) => Math.sqrt(Math.max(0, 1 - (x * x) / 4));
  const area = integraCasi(techo, 0, 2, 1e-10, 'b');

  it('el área es π/2', () => cuadra1718(id, 'El área del recinto', area));

  it('y la ordenada del centro es 4/(3π)', () => {
    const momento = integraCasi((x) => techo(x) ** 2 / 2, 0, 2, 1e-10, 'b');
    cuadra1718(id, 'La segunda coordenada del centro', momento / area);
  });
});

describe('2017-2018 · 3 · el paraboloide dentro del cilindro', () => {
  it('el volumen es 9π/2', () => {
    /* **Rebanando en z.** Hasta z = 4 manda el cilindro y el disco es siempre
       el mismo; por encima manda el paraboloide y el radio se va cerrando.
       La resolución integra en polares sobre el disco. */
    const disco = (z: number) => Math.PI * Math.min(1, 5 - z);
    cuadra1718(
      'ex1718-4ev-3-paraboloide-dentro-del-cilindro',
      'El volumen',
      integra(disco, 0, 4, 1e-11) + integra(disco, 4, 5, 1e-11),
    );
  });
});
