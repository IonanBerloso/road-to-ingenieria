/**
 * La tercera evaluación de Cálculo de 2015-2016, la más antigua del corpus en
 * este bloque. Ocho respuestas.
 *
 * Con ella quedan verificadas **las once terceras evaluaciones**, de 2015-2016
 * a 2025-2026.
 *
 * El apartado (b) del ejercicio 5 es el único sólido de revolución del corpus
 * que gira alrededor de una recta que **no es un eje**: y = 1. El test no
 * traslada la figura ni cambia de variable; integra los discos con el radio
 * medido desde esa recta, que es lo que la fórmula significa.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { deriva, integra, raiz } from './numerico';

const cuadra = convocatoria('calculo', '2015-2016-3ev');

describe('2015-2016 · 1 · las dos definiciones', () => {
  it('el logaritmo principal de −1 tiene parte imaginaria π', () => {
    /* El valor principal lleva el argumento en (−π, π]; para el −1 es
       exactamente el extremo. Se saca del propio número, no de memoria. */
    cuadra('ex1516-3ev-1-dos-definiciones', 'El logaritmo de menos uno', Math.atan2(0, -1));
  });
});

describe('2015-2016 · 2 · la función valor medio', () => {
  const id = 'ex1516-3ev-2-funcion-valor-medio';
  /* LECTURA DE LA FIGURA: la quebrada vale x−1 entre 1 y 2, y 1 constante
     entre 2 y 3. */
  const y = (x: number) => (x <= 2 ? x - 1 : 1);
  const medio = (a: number, b: number) => integra(y, a, b, 1e-11) / (b - a);

  it('en [1, 3/2] el valor medio es 0,25', () => cuadra(id, 'El valor medio en el intervalo pequeño', medio(1, 1.5)));

  it('y en todo el intervalo, 0,75', () => {
    /* Se parte en el codo: Simpson sobre un tramo con un pico se equivoca, y
       aquí lo que se mide es la media, no la habilidad del integrador. */
    cuadra(id, 'El valor medio en todo el intervalo', (integra(y, 1, 2, 1e-11) + integra(y, 2, 3, 1e-11)) / 2);
  });
});

describe('2015-2016 · 3 · el punto fijo con unicidad', () => {
  it('la contracción del enunciado tiene su punto fijo en 4', () => {
    const f = (x: number) => x / 4 + 3;
    /* Las dos hipótesis: que f no se sale de [3,5] y que contrae —su derivada
       en valor absoluto se queda por debajo de 1—. */
    for (let x = 3; x <= 5; x += 0.01) {
      if (f(x) < 3 - 1e-9 || f(x) > 5 + 1e-9) throw new Error('f se sale del intervalo');
      if (Math.abs(deriva(f, x)) >= 1) throw new Error('f no contrae');
    }
    cuadra('ex1516-3ev-3-punto-fijo-con-unicidad', 'Una contracción concreta', raiz((x) => f(x) - x, 3, 5));
  });
});

describe('2015-2016 · 4 · la inversa del coseno hiperbólico', () => {
  const id = 'ex1516-3ev-4-inversa-del-coseno-hiperbolico';
  const y = (x: number) => (Math.exp(2 * x) + Math.exp(-2 * x)) / 2;

  it('el recorrido empieza en 1', () => {
    /* El dominio de la inversa es el recorrido de la función, y en [0,∞) el
       mínimo está en el borde. Se comprueba recorriendo, porque un buscador de
       máximos por sección áurea no mira los extremos. */
    let menor = Infinity;
    for (let x = 0; x <= 20; x += 0.001) menor = Math.min(menor, y(x));
    cuadra(id, 'El extremo del recorrido', menor);
  });

  it('y dx/dy en y = 2 vale 1/(2√3)', () => {
    /* Se construye la inversa resolviendo la ecuación para cada y, y se deriva
       **la inversa**, en vez de aplicar la regla del recíproco. */
    const inversa = (t: number) => raiz((x) => y(x) - t, 0, 10);
    cuadra(id, 'La derivada de la inversa', deriva(inversa, 2, 1e-4));
  });
});

describe('2015-2016 · 5 · la integral y el sólido sobre y = 1', () => {
  const id = 'ex1516-3ev-5-integral-y-solido-sobre-y-igual-uno';

  it('la integral vale √2', () => {
    /* El enunciado propone el cambio x = tan z; aquí se integra tal cual, con
       Simpson, que es el camino que no comparte ni un paso con la
       resolución. */
    cuadra(id, 'La integral', integra((x) => (x * x + 1) ** -1.5, -1, 1, 1e-12));
  });

  it('y el sólido mide 3,415', () => {
    /* La región va de y = 1 a y = 2·sen x, y gira alrededor de **y = 1**. El
       radio de cada disco es por tanto 2·sen x − 1, y los extremos son donde
       ese radio se anula: se buscan, no se copian. */
    const radio = (x: number) => 2 * Math.sin(x) - 1;
    const izquierda = raiz(radio, 0.01, Math.PI / 2);
    const derecha = raiz(radio, Math.PI / 2, Math.PI - 0.01);
    if (Math.abs(izquierda - Math.PI / 6) > 1e-9 || Math.abs(derecha - (5 * Math.PI) / 6) > 1e-9)
      throw new Error('los cortes no salen donde deberían');
    cuadra(id, 'El volumen', Math.PI * integra((x) => radio(x) ** 2, izquierda, derecha, 1e-11));
  });
});
