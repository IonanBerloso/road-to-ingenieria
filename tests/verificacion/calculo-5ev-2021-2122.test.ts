/**
 * Las quintas evaluaciones de Cálculo de 2020-2021 y 2021-2022. Catorce
 * respuestas entre las dos.
 *
 * Los dos ejercicios de integral de línea de esta tanda son el caso de libro
 * de lo que este directorio pretende. Los dos están construidos para que
 * recorrer la curva sea inviable a mano —una hélice entera, y un campo con
 * arctg x y e^y— y por eso el examen usa el atajo: potencial en uno, Green en
 * el otro. El test hace justo lo que el enunciado da por imposible: **recorre
 * la curva**. Un ordenador no tiene que saber integrar e^y a lo largo de una
 * semicircunferencia, solo evaluarla muchas veces.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { deriva, deriva2, integra, raiz, trabajo } from './numerico';

const cuadra2122 = convocatoria('calculo', '2021-2022-5ev');
const cuadra2021 = convocatoria('calculo', '2020-2021-5ev');

/**
 * Integral de línea de un campo **escalar**: ∫ f(r(t))·|r′(t)| dt. No es lo
 * mismo que `trabajo`, y confundirlas es el error clásico del tema: una pesa
 * un alambre y la otra mide un empuje.
 */
const pesa = (f: (p: number[]) => number, r: (t: number) => number[], t0: number, t1: number) =>
  integra(
    (t) => {
      const h = 1e-5;
      const antes = r(t - h);
      const dr = r(t + h).map((c, i) => (c - antes[i]) / (2 * h));
      return f(r(t)) * Math.hypot(...dr);
    },
    t0,
    t1,
    1e-9,
  );

describe('2021-2022 · 1 · la hélice y el potencial', () => {
  const id = 'ex2122-5ev-1-la-helice-y-el-potencial';
  const F = ([x, y, z]: number[]) => [y * z + y + 1, x * z + x, x * y + 3 * z * z];
  const potencial = ([x, y, z]: number[]) => x * y * z + x * y + x + z ** 3;

  it('el potencial vale 249,05 en B', () => {
    /* Antes de usarlo se comprueba que es potencial de verdad: su gradiente
       numérico tiene que ser el campo, en puntos elegidos al azar. */
    for (const p of [
      [0.7, -1.3, 2.2],
      [-0.4, 0.9, 1.1],
    ]) {
      const grad = p.map((_, j) => deriva((t) => potencial(p.map((c, k) => (k === j ? t : c))), p[j]));
      if (grad.some((g, i) => Math.abs(g - F(p)[i]) > 1e-5)) throw new Error('eso no es un potencial');
    }
    cuadra2122(id, 'El potencial en B', potencial([1, 0, 2 * Math.PI]));
  });

  it('y la integral vale 248,05', () => {
    /* **Recorriendo la hélice entera**, que es lo que el enunciado presenta
       como inviable. La resolución resta potenciales; aquí se integra de t = 0
       a t = 2π sobre (cos t, sen t, t). */
    cuadra2122(
      id,
      'La integral',
      /* La tolerancia es absoluta y el resultado vale casi 250: pedir 1e-8
         sería pedirle once cifras a una derivada numérica. */
      trabajo(F, (t) => [Math.cos(t), Math.sin(t), t], 0, 2 * Math.PI, 1e-5),
    );
  });
});

describe('2021-2022 · 2 · la masa de un alambre', () => {
  const id = 'ex2122-5ev-2-la-masa-de-un-alambre';
  const cuarto = (t: number) => [Math.cos(t), Math.sin(t)];

  it('el elemento de arco es dt a secas', () => {
    /* |r′| se mide, no se recuerda: en una circunferencia de radio 1 vale 1 en
       todo punto, y eso es lo que hace que el ds sea el dt. */
    const modulo = (t: number) => {
      const h = 1e-5;
      return Math.hypot(...cuarto(t + h).map((c, i) => (c - cuarto(t - h)[i]) / (2 * h)));
    };
    for (const t of [0.2, 0.9, 1.4]) if (Math.abs(modulo(t) - modulo(0.5)) > 1e-6) throw new Error('no es constante');
    cuadra2122(id, 'El elemento de arco', modulo(0.5));
  });

  it('y el alambre pesa 0,5', () =>
    cuadra2122(id, 'La masa', pesa(([x, y]) => x * y, cuarto, 0, Math.PI / 2)));
});

describe('2021-2022 · 3 · la altura del Everest', () => {
  const id = 'ex2122-5ev-3-la-altura-del-everest';

  it('el logaritmo de 3 vale 1,0986', () =>
    cuadra2122(id, 'El logaritmo que aparece', raiz((L) => Math.exp(L) - 3, 0, 5)));

  it('y el Everest sale a 9.155 metros', () => {
    /* **Integrando la ecuación barométrica**, no despejando de su solución: se
       avanza p′ = αp con Runge-Kutta y se busca la altura a la que la presión
       ha caído a un tercio. */
    const alfa = -1.2e-4;
    const presion = (altura: number) => {
      let p = 1;
      const paso = 10;
      for (let z = 0; z < altura; z += paso) {
        const dz = Math.min(paso, altura - z);
        const k1 = alfa * p;
        const k2 = alfa * (p + (dz * k1) / 2);
        const k3 = alfa * (p + (dz * k2) / 2);
        const k4 = alfa * (p + dz * k3);
        p += (dz * (k1 + 2 * k2 + 2 * k3 + k4)) / 6;
      }
      return p;
    };
    cuadra2122(id, 'La altura, con un α realista', raiz((h) => presion(h) - 1 / 3, 100, 40000));
  });
});

describe('2021-2022 · 4 · uno partido seno', () => {
  const id = 'ex2122-5ev-4-uno-partido-seno';
  const y1 = (x: number) => Math.cos(2 * x);
  const y2 = (x: number) => Math.sin(2 * x);

  it('el wronskiano vale 2', () => {
    const W = (x: number) => y1(x) * deriva(y2, x) - y2(x) * deriva(y1, x);
    for (const x of [0.3, 1.1, 2.4]) if (Math.abs(W(x) - W(0.7)) > 1e-6) throw new Error('el wronskiano no es constante');
    cuadra2122(id, 'El wronskiano', W(0.7));
  });

  it('y la particular se anula en π/4', () => {
    const yp = (x: number) =>
      (-x / 2) * Math.cos(2 * x) + 0.25 * Math.sin(2 * x) * Math.log(Math.abs(Math.sin(2 * x)));
    /* Se comprueba que resuelve la completa antes de evaluarla. */
    for (const x of [0.5, 1.2]) {
      const residuo = deriva2(yp, x, 0.01) + 4 * yp(x) - 1 / Math.sin(2 * x);
      if (Math.abs(residuo) > 1e-3) throw new Error(`la particular no cumple la EDO en x=${x}`);
    }
    cuadra2122(id, 'La solución particular en un punto', yp(Math.PI / 4));
  });
});

describe('2020-2021 · 1 · el semianillo', () => {
  const id = 'ex2021-5ev-1-el-semianillo';
  const V = ([x, y]: number[]) => [Math.atan(x) + y ** 3, Math.exp(y) - x ** 3];

  it('el integrando de Green lleva un −3 delante', () => {
    let k = 0;
    for (const [x, y] of [
      [0.6, 1.4],
      [-2.1, 0.3],
      [1.9, -0.8],
    ]) {
      const rot = deriva((t) => V([t, y])[1], x) - deriva((t) => V([x, t])[0], y);
      const c = rot / (x * x + y * y);
      if (k && Math.abs(c - k) > 1e-5) throw new Error('el cociente no es constante');
      k = c;
    }
    cuadra2021(id, 'El integrando de Green', k);
  });

  it('y la circulación vale −60π', () => {
    /* **Recorriendo el borde entero**, que es lo que el enunciado hace
       impracticable a mano metiendo un arctg x y una e^y. Cuatro tramos: el
       eje de 1 a 3, la semicircunferencia grande en sentido positivo, el eje
       de −3 a −1 y la pequeña de vuelta, en sentido contrario. */
    const eje = (a: number, b: number) => trabajo(V, (t) => [t, 0], a, b, 1e-9);
    const arco = (R: number, t0: number, t1: number) =>
      trabajo(V, (t) => [R * Math.cos(t), R * Math.sin(t)], t0, t1, 1e-6);
    cuadra2021(
      id,
      'La circulación',
      eje(1, 3) + arco(3, 0, Math.PI) + eje(-3, -1) + arco(1, Math.PI, 0),
    );
  });
});

describe('2020-2021 · 2 · la exacta con exponencial', () => {
  const id = 'ex2021-5ev-2-la-exacta-con-exponencial';

  it('la primera es homogénea de grado 3', () => {
    const M = (x: number, y: number) => y ** 3 + 2 * x * x * y;
    const N = (x: number, y: number) => -2 * (x ** 3 + x * y * y);
    const grados = [M, N].map((f) => Math.log2(f(2 * 0.9, 2 * 1.3) / f(0.9, 1.3)));
    if (Math.abs(grados[0] - grados[1]) > 1e-9) throw new Error('los dos no tienen el mismo grado');
    cuadra2021(id, 'El grado de la primera', Math.round(grados[0]));
  });

  it('y la exacta pasa por (0,1) con C = 0', () => {
    /* La tercera EDO, escrita como M dx + N dy = 0, y su solución implícita.
       Se comprueba que F es potencial —que su gradiente es (M, N)— antes de
       evaluarla, porque eso es lo único que hace válida la respuesta. */
    const M = (x: number, y: number) => y * y * Math.exp(x * y * y) + 4 * x ** 3;
    const N = (x: number, y: number) => 2 * x * y * Math.exp(x * y * y) - 3 * y * y;
    const F = (x: number, y: number) => Math.exp(x * y * y) + x ** 4 - y ** 3;
    for (const [x, y] of [
      [0.4, 1.2],
      [-0.7, 0.8],
    ]) {
      if (Math.abs(deriva((t) => F(t, y), x) - M(x, y)) > 1e-5) throw new Error('la parcial en x no cuadra');
      if (Math.abs(deriva((t) => F(x, t), y) - N(x, y)) > 1e-5) throw new Error('la parcial en y no cuadra');
    }
    cuadra2021(id, 'La constante de la solución, en un punto', F(0, 1));
  });
});

describe('2020-2021 · 3 · recta y resonancia', () => {
  const id = 'ex2021-5ev-3-recta-y-resonancia';
  const residuo = (y: (x: number) => number, fuente: (x: number) => number, x: number) =>
    deriva2(y, x, 0.02) + 25 * y(x) - fuente(x);

  it('el término lineal lleva A = 0,4', () => {
    /* La B se busca a la vez que la A: primero la que anula el residuo en un
       punto para cada A candidata, y luego la A que lo anula en otro. Si el
       ensayo no valiera, no habría par que sirviera en los dos. */
    const conB = (A: number) => raiz((B) => residuo((x) => A * x + B, (x) => 10 * x - 4, 0), -10, 10);
    const A = raiz((a) => residuo((x) => a * x + conB(a), (x) => 10 * x - 4, 1.3), -10, 10);
    cuadra2021(id, 'El coeficiente del término lineal', A);
  });

  it('y el que resuena lleva D = 2', () => {
    const yp = (D: number) => (x: number) => x * D * Math.sin(5 * x);
    const fuente = (x: number) => 20 * Math.cos(5 * x);
    const D = raiz((d) => residuo(yp(d), fuente, 0.35), -10, 10);
    for (const x of [-0.9, 1.4]) if (Math.abs(residuo(yp(D), fuente, x)) > 2e-3) throw new Error(`sobra algo en x=${x}`);
    cuadra2021(id, 'El coeficiente del término que resuena', D);
  });
});
