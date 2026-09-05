/**
 * Convocatoria ordinaria de Cálculo, curso 2020-2021. Diecisiete respuestas.
 *
 * Su ejercicio 3 lleva **el mismo integrando** que el 3 de la extraordinaria
 * de 2024-2025 —1/(t²+2t+2)—, pero pregunta otras tres cosas: la forma
 * cerrada, la inflexión y el límite. Verificar las dos con la misma integral
 * numérica cruza las dos convocatorias.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { cEntre, integra, maximiza, raiz } from './numerico';

const cuadra = convocatoria('calculo', '2020-2021-ord');

describe('1 · la parte real de un cociente', () => {
  it('en z = 2i vale −0,6', () => {
    /* Se divide de verdad, con aritmética compleja. */
    const z: [number, number] = [0, 2];
    const q = cEntre([1 + z[0], z[1]], [1 - z[0], -z[1]]);
    cuadra('ex2021-ord-1-la-parte-real-de-un-cociente', 'Un valor de control', q[0]);
  });
});

describe('2 · el rectángulo que gira', () => {
  const id = 'ex2021-ord-2-el-rectangulo-que-gira';
  /* Perímetro 1 sin pérdida de generalidad: los dos apartados son razones. */
  const P = 1;
  const V = (r: number) => Math.PI * r * r * (P / 2 - r);
  const mejor = maximiza(V, 0.001, P / 2 - 0.001);

  it('el radio óptimo es P/3', () => cuadra(id, 'El lado que hace de radio', mejor.x / P));

  it('y es el doble del lado sobre el que se gira', () =>
    cuadra(id, 'La proporción entre los dos lados', mejor.x / (P / 2 - mejor.x)));
});

describe('3 · una integral con la x arriba', () => {
  const id = 'ex2021-ord-3-una-integral-con-la-x-arriba';
  const f = (t: number) => 1 / (t * t + 2 * t + 2);
  const F = (x: number) => integra(f, 0, x, 1e-12);

  it('la constante de la forma cerrada es π/4', () => {
    /* F(x) = arctan(x+1) − c. La constante sale de exigir F(0) = 0, y se
       comprueba que la fórmula coincide con la integral en varios puntos. */
    const c = Math.atan(1);
    for (const x of [-4, -1, 0.5, 3, 9])
      if (Math.abs(F(x) - (Math.atan(x + 1) - c)) > 1e-9)
        throw new Error(`la forma cerrada falla en x=${x}`);
    cuadra(id, 'La función, en forma cerrada', c);
  });

  it('el punto de inflexión está en −1', () => {
    /* F″ = f′, y f tiene su máximo ahí. Se busca ese máximo. */
    cuadra(id, 'El punto de inflexión', maximiza(f, -5, 3).x);
  });

  it('y el techo es π/4', () => {
    /* Se comprueba que la integral converge de verdad a ese valor, mirando
       cada vez más lejos. */
    const lejos = [50, 500, 5000].map(F);
    if (!(lejos[0] < lejos[1] && lejos[1] < lejos[2])) throw new Error('no crece hacia el límite');
    cuadra(id, 'El techo de la función', Math.PI / 2 - Math.atan(1));
  });
});

describe('4 · perpendicular a una curva de nivel implícita', () => {
  const id = 'ex2021-ord-4-perpendicular-a-una-curva-de-nivel-implicita';
  /* xz + ln z = y define z = f(x,y). Para cada (x,y) se despeja z buscando
     la raíz, y las parciales salen por diferencias sobre esa función. */
  const f = (x: number, y: number) => raiz((z) => x * z + Math.log(z) - y, 0.05, 20);

  it('f(0,0) vale 1, así que el punto está en la curva de nivel', () => {
    if (Math.abs(f(0, 0) - 1) > 1e-9) throw new Error('el nivel en (0,0) no es 1');
  });

  it('fₓ(0,0) vale −1', () => {
    const e = 1e-5;
    cuadra(id, 'La derivada respecto de x', (f(e, 0) - f(-e, 0)) / (2 * e));
  });

  it('y la curva de nivel tiene pendiente 1', () => {
    /* dy/dx = −fₓ/f_y sobre la curva de nivel. */
    const e = 1e-5;
    const fx = (f(e, 0) - f(-e, 0)) / (2 * e);
    const fy = (f(0, e) - f(0, -e)) / (2 * e);
    cuadra(id, 'La pendiente de la curva de nivel', -fx / fy);
  });
});

describe('5 · el cono sobre medio disco', () => {
  const id = 'ex2021-ord-5-el-cono-sobre-medio-disco';
  /* ∫∫ √(x²+y²) sobre el semidisco superior de radio a. En polares, ∫∫r·r. */
  const volumen = (a: number) => Math.PI * integra((r) => r * r, 0, a, 1e-12);

  it('el volumen es πa³/3', () => cuadra(id, 'El volumen en función de a', volumen(1) / Math.PI));

  it('y para que valga 9π/8 hace falta a = 1,5', () =>
    cuadra(id, 'El valor de a', raiz((a) => volumen(a) - (9 * Math.PI) / 8, 0.1, 5)));
});

describe('6 · variación de parámetros con una cosecante', () => {
  const id = 'ex2021-ord-6-variacion-de-parametros-con-una-cosecante';
  const y1 = (x: number) => Math.cos(4 * x);
  const y2 = (x: number) => Math.sin(4 * x);

  it('el wronskiano vale 4', () => {
    /* W = y₁y₂′ − y₂y₁′, con las derivadas numéricas y en varios puntos: si
       fuese función de x en vez de constante, esto lo vería. */
    const e = 1e-6;
    const W = (x: number) =>
      y1(x) * ((y2(x + e) - y2(x - e)) / (2 * e)) - y2(x) * ((y1(x + e) - y1(x - e)) / (2 * e));
    for (const x of [0.2, 1, 2.7])
      if (Math.abs(W(x) - W(0.2)) > 1e-6) throw new Error('el wronskiano no es constante');
    cuadra(id, 'El wronskiano', W(0.2));
  });

  it('y el término que crece sin límite lleva −1/4', () => {
    /* Variación de parámetros: el coeficiente de y₁ es −∫y₂·g/W, con
       g = 1/sen4x. El integrando se simplifica a 1/4, así que la integral es
       x/4 y el término es −(x/4)cos4x. Se integra de verdad. */
    const g = (x: number) => 1 / Math.sin(4 * x);
    const W = 4;
    const coef = integra((x) => (y2(x) * g(x)) / W, 0.1, 1.1, 1e-12);
    /* La integral vale (1,1 − 0,1)/4 = 0,25, y el signo de delante es menos. */
    cuadra(id, 'El término que crece sin límite', -coef / (1.1 - 0.1));
  });
});

describe('7 · una EDO que arranca en t igual a dos', () => {
  const id = 'ex2021-ord-7-una-edo-que-arranca-en-t-igual-a-dos';

  it('la transformada del segundo miembro vale 1/2 en s = 1', () => {
    /* f(t) = cos(t−2)·u(t−2) tiene transformada e^{−2s}·s/(s²+1). */
    const g = (s: number) => s / (s * s + 1);
    cuadra(id, 'La transformada del segundo miembro', g(1));
  });

  it('y la solución vale −0,5011 en t = 4', () => {
    /* y(t) = cos t + sen t + ((t−2)/2)·sen(t−2) para t ≥ 2. Se comprueba que
       cumple la EDO y las dos condiciones iniciales antes de evaluarla. */
    const y = (t: number) =>
      Math.cos(t) + Math.sin(t) + (t < 2 ? 0 : ((t - 2) / 2) * Math.sin(t - 2));
    const f = (t: number) => (t < 2 ? 0 : Math.cos(t - 2));
    const e = 1e-4;
    for (const t of [0.5, 3, 5.5]) {
      const ypp = (y(t + e) - 2 * y(t) + y(t - e)) / (e * e);
      if (Math.abs(ypp + y(t) - f(t)) > 1e-5) throw new Error(`la EDO falla en t=${t}`);
    }
    if (Math.abs(y(0) - 1) > 1e-12) throw new Error('y(0) no es 1');
    cuadra(id, 'Un valor de la solución', y(4));
  });
});

describe('8 · la ampliación par de una recta', () => {
  const id = 'ex2021-ord-8-la-ampliacion-par-de-una-recta';
  /* La figura da f(t) = 2π − t en (0, π): baja de 2π a π. */
  const f = (t: number) => 2 * Math.PI - t;

  it('la recta de la figura pasa por sus dos extremos', () => {
    if (Math.abs(f(0) - 2 * Math.PI) > 1e-12) throw new Error('no arranca en 2π');
    if (Math.abs(f(Math.PI) - Math.PI) > 1e-12) throw new Error('no acaba en π');
  });

  it('el término constante es 3π/2', () =>
    cuadra(id, 'El término constante', integra(f, 0, Math.PI, 1e-12) / Math.PI));

  it('a₁ vale 4/π', () =>
    cuadra(id, 'El primer armónico', (2 / Math.PI) * integra((t) => f(t) * Math.cos(t), 0, Math.PI, 1e-12)));

  it('y la serie de los impares al cuadrado suma π²/8', () => {
    let s = 0;
    for (let n = 0; n < 2_000_000; n++) s += 1 / (2 * n + 1) ** 2;
    cuadra(id, 'La suma pedida', s);
  });
});
