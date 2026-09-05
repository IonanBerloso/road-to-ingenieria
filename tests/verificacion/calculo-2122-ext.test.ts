/**
 * Convocatoria extraordinaria de Cálculo, curso 2021-2022. Quince respuestas.
 *
 * Su ejercicio 4 —el pórtico de tres barras— es el problema de optimización
 * más bonito del corpus: tres barras iguales y el suelo, y el ángulo que
 * maximiza el área sale valiendo exactamente 60°.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { deriva, integra, maximiza, raiz, trabajo } from './numerico';

const cuadra = convocatoria('calculo', '2021-2022-ext');

describe('1 · tres soluciones y un triángulo', () => {
  const id = 'ex2122-ext-1-tres-soluciones-y-un-triangulo';

  it('el módulo va elevado a 5', () => {
    /* |z⁴·z̄| = ρ⁴·ρ = ρ⁵. Se comprueba sobre un módulo cualquiera. */
    const r = 1.7;
    const izq = r ** 4 * r;
    if (Math.abs(izq - r ** 5) > 1e-12) throw new Error('el exponente no es 5');
    cuadra(id, 'El exponente del módulo', 5);
  });

  it('y el primer argumento es π/6', () => {
    /* z⁴z̄·i = −1 → z⁴z̄ = i. Con ρ = 1, el argumento cumple 3θ = π/2 + 2kπ.
       Se comprueba que θ = π/6 lleva la ecuación a −1. */
    const th = Math.PI / 6;
    const ang = 3 * th + Math.PI / 2; // el ángulo de z⁴z̄·i
    if (Math.hypot(Math.cos(ang) + 1, Math.sin(ang)) > 1e-12)
      throw new Error('la ecuación no da −1');
    cuadra(id, 'El primer argumento', th / Math.PI);
  });
});

describe('2 · cuál es la función y cuál la derivada', () => {
  it('h = e^{−2x}y² tiene cuatro extremos', () => {
    /* LECTURA DE LA FIGURA: y empieza bajo el eje, sube cruzándolo, alcanza
       un máximo y baja; y′ empieza arriba y cruza el eje justo en ese máximo.
       Una y que lo cumple es (x−1)(4−x)/2 en (0, 6).

       h′ = 2e^{−2x}·y·(y′ − y), así que los extremos están donde y se anula
       y donde y′ corta a y. */
    const y = (x: number) => ((x - 1) * (4 - x)) / 2;
    const yp = (x: number) => (5 - 2 * x) / 2;
    if (Math.abs(yp(2.5)) > 1e-12) throw new Error('y′ no se anula en el máximo de y');
    if (!(y(0) < 0)) throw new Error('y no empieza por debajo del eje');
    const s = (x: number) => Math.sign(y(x) * (yp(x) - y(x)));
    let extremos = 0;
    let ultimo = 0;
    for (let x = 0; x <= 6; x += 0.0005) {
      const signo = s(x);
      if (signo !== 0 && ultimo !== 0 && signo !== ultimo) extremos++;
      if (signo !== 0) ultimo = signo;
    }
    cuadra('ex2122-ext-2-cual-es-la-funcion-y-cual-la-derivada', 'Cuántos extremos', extremos);
  });
});

describe('3 · un McLaurin y un elipsoide', () => {
  const id = 'ex2122-ext-3-un-mclaurin-y-un-elipsoide';

  it('el coeficiente cuadrático es 1/4', () => {
    const g = (t: number) => (1 + Math.sin(t)) / (2 + t * t);
    const F = (x: number) => 3 + integra(g, 0, x, 1e-13);
    const e = 1e-3;
    cuadra(id, 'El coeficiente cuadrático', (F(e) - 2 * F(0) + F(-e)) / (e * e) / 2);
  });

  it('y el elipsoide mide 104,72', () => {
    /* Girando alrededor de OY: a cada altura y, el radio es 5√(1−y²). */
    cuadra(
      id,
      'El volumen',
      Math.PI * integra((y) => 25 * (1 - y * y), -1, 1, 1e-12),
    );
  });
});

describe('4 · el pórtico de tres barras', () => {
  const id = 'ex2122-ext-4-el-portico-de-tres-barras';
  /* LECTURA DE LA FIGURA: trapecio isósceles abierto por abajo. La barra de
     arriba mide L y las dos laterales, inclinadas α respecto del suelo,
     también. Con L = 1, el área es sen α · (1 + cos α). */
  const area = (a: number) => Math.sin(a) * (1 + Math.cos(a));
  const mejor = maximiza(area, 0.01, Math.PI - 0.01);

  it('el coseno del ángulo óptimo vale 1/2', () =>
    cuadra(id, 'El ángulo óptimo', Math.cos(mejor.x)));

  it('y el área máxima, 1,299 L²', () => cuadra(id, 'El área máxima', mejor.y));
});

describe('5 · la curva desconocida y el área de diez', () => {
  const id = 'ex2122-ext-5-la-curva-desconocida-y-el-area-de-diez';
  const V = (p: number[]) => [-p[1], p[0]];

  it('la circulación completa es el doble del área', () => {
    /* Q_x − P_y = 2, así que ∮ = 2A sin depender de la forma. Se comprueba
       ese 2 sobre una elipse de área conocida. */
    const elipse = trabajo(V, (t) => [4 * Math.cos(t), Math.sin(t)], 0, 2 * Math.PI);
    if (Math.abs(elipse - 2 * Math.PI * 4) > 1e-6)
      throw new Error('la circulación no es el doble del área');
    cuadra(id, 'La circulación completa', 2 * 10);
  });

  it('y a L₁ le tocan 7,434', () => {
    /* La otra mitad de la frontera es la semicircunferencia de radio 2, de
       (2,0) a (−2,0) por arriba. */
    const arriba = trabajo(V, (t) => [2 * Math.cos(t), 2 * Math.sin(t)], 0, Math.PI);
    cuadra(id, 'El resultado', 20 - arriba);
  });
});

describe('6 · una exacta entre tres', () => {
  const id = 'ex2122-ext-6-una-exacta-entre-tres';
  const M = (x: number, y: number) => Math.exp(y);
  const N = (x: number, y: number) => 2 * y + x * Math.exp(y);

  it('M_y y N_x valen e en (2,1)', () => {
    const e = 1e-5;
    for (const [x, y] of [[2, 1], [0.5, -0.3], [3, 2]] as [number, number][]) {
      const My = (M(x, y + e) - M(x, y - e)) / (2 * e);
      const Nx = (N(x + e, y) - N(x - e, y)) / (2 * e);
      if (Math.abs(My - Nx) > 1e-4) throw new Error(`no es exacta en (${x}, ${y})`);
    }
    cuadra(id, 'La comprobación de la exacta', (M(2, 1 + e) - M(2, 1 - e)) / (2 * e));
  });

  it('y la curva por (1,0) tiene constante 1', () => {
    const F = (x: number, y: number) => x * Math.exp(y) + y * y;
    /* Se comprueba que su gradiente es (M, N). */
    const e = 1e-5;
    for (const [x, y] of [[1, 0], [2, 1]] as [number, number][]) {
      const Fx = (F(x + e, y) - F(x - e, y)) / (2 * e);
      const Fy = (F(x, y + e) - F(x, y - e)) / (2 * e);
      if (Math.abs(Fx - M(x, y)) > 1e-4 || Math.abs(Fy - N(x, y)) > 1e-4)
        throw new Error(`el potencial no encaja en (${x}, ${y})`);
    }
    cuadra(id, 'La constante de una solución', F(1, 0));
  });
});

describe('7 · el sistema acoplado por Laplace', () => {
  const id = 'ex2122-ext-7-el-sistema-acoplado-por-laplace';

  it('la raíz positiva del denominador es 5', () => {
    /* (s−2)² − 9 = (s−5)(s+1). Se comprueba la identidad. */
    for (const s of [-3, 0.5, 4, 9])
      if (Math.abs((s - 2) ** 2 - 9 - (s - 5) * (s + 1)) > 1e-12)
        throw new Error(`la factorización falla en s=${s}`);
    cuadra(id, 'Las raíces del sistema', 5);
  });

  it('y y(0,2) vale 1,8996', () => {
    /* y(t) = e^{5t} − e^{−t}, con x(t) = e^{5t} + e^{−t}. Se comprueba que el
       par resuelve el sistema y cumple las condiciones iniciales. */
    const x = (t: number) => Math.exp(5 * t) + Math.exp(-t);
    const y = (t: number) => Math.exp(5 * t) - Math.exp(-t);
    for (const t of [0.1, 0.3, 0.6]) {
      if (Math.abs(deriva(x, t) - (2 * x(t) + 3 * y(t))) > 1e-3)
        throw new Error(`la 1.ª falla en t=${t}`);
      if (Math.abs(deriva(y, t) - (3 * x(t) + 2 * y(t))) > 1e-3)
        throw new Error(`la 2.ª falla en t=${t}`);
    }
    if (Math.abs(x(0) - 2) > 1e-12 || Math.abs(y(0)) > 1e-12)
      throw new Error('las condiciones iniciales no cuadran');
    cuadra(id, 'La solución en un instante', y(0.2));
  });
});

describe('8 · la rampa que solo ocupa media onda', () => {
  const id = 'ex2122-ext-8-la-rampa-que-solo-ocupa-media-onda';
  /* f vale 0 en (−π, 0] y t en (0, π), con periodo 2π. */
  const f = (t: number) => {
    let u = ((t % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    if (u > Math.PI) u -= 2 * Math.PI;
    return u > 0 ? u : 0;
  };

  it('el término constante es π/4', () =>
    cuadra(id, 'El término constante', integra((t) => t, 0, Math.PI, 1e-12) / (2 * Math.PI)));

  it('y S(3π) vale π/2, que es la media del salto', () => {
    /* 3π se reduce a π, que es justo donde la rampa cae de golpe de π a 0.
       Los dos límites laterales se toman de verdad. */
    const izquierda = f(3 * Math.PI - 1e-9);
    const derecha = f(3 * Math.PI + 1e-9);
    if (Math.abs(izquierda - derecha) < 1) throw new Error('ahí no hay salto');
    cuadra(id, 'El valor en el punto grande', (izquierda + derecha) / 2);
  });
});
