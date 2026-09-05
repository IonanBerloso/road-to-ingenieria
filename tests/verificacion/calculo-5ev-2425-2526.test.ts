/**
 * Las quintas evaluaciones de Cálculo de 2024-2025 y 2025-2026. Diez
 * respuestas entre las dos.
 *
 * Las quintas son integrales de línea y ecuaciones diferenciales, y las dos
 * cosas se prestan a comprobarse por un camino que no se parece en nada al de
 * la resolución:
 *
 * - Donde el examen reconoce que el campo es conservativo y **resta
 *   potenciales**, aquí se integra a lo largo de la trayectoria de verdad. Y de
 *   propina se recorren las dos trayectorias posibles y se comprueba que dan lo
 *   mismo, que es la razón por la que restar potenciales vale.
 * - Donde el examen estudia el signo de la derivada para decidir hacia dónde
 *   tiende una población, aquí se **integra la ecuación** con Runge-Kutta desde
 *   cuatro poblaciones iniciales distintas y se mira dónde acaba.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { deriva, deriva2, raiz, trabajo } from './numerico';

const cuadra2526 = convocatoria('calculo', '2025-2026-5ev');
const cuadra2425 = convocatoria('calculo', '2024-2025-5ev');

describe('2025-2026 · 1 · el monte y las tres subidas', () => {
  const id = 'ex2526-5ev-1-el-monte-y-las-tres-subidas';
  const altura = (x: number, y: number) => 1 / (1 + x * x + y * y);
  /* A(1,0), B(0,1) y la cima M(0,0), los tres sobre la superficie. */
  const sobreElMonte = (x: number, y: number) => [x, y, altura(x, y)];

  it('el primer viento hace 0,6534 de trabajo subiendo por C₁', () => {
    /* La proyección de C₁ es el segmento del eje X de (1,0) a (0,0). */
    const F = ([x, y, z]: number[]) => [x * z, y * z, 1 / (z * z)];
    cuadra2526(
      id,
      'Apartado a) — el trabajo por la primera trayectoria',
      trabajo(F, (t) => sobreElMonte(t, 0), 1, 0, 1e-10),
    );
  });

  it('y el segundo hace −0,5 de A a B', () => {
    /* **Integrando de verdad por la trayectoria**, no restando potenciales,
       que es lo que hace la resolución. Antes se comprueba que el campo es
       conservativo —rotacional nulo—, que es lo que da derecho a la otra vía;
       si no lo fuera, los dos caminos no tendrían por qué coincidir. */
    const F = ([x, y, z]: number[]) => [2 * x + y, x + 2 * y - z, -y];
    const p = [0.4, -0.7, 1.3];
    const parcial = (i: number, j: number) =>
      deriva((t) => F(p.map((c, k) => (k === j ? t : c)))[i], p[j]);
    const rotacional = [
      parcial(2, 1) - parcial(1, 2),
      parcial(0, 2) - parcial(2, 0),
      parcial(1, 0) - parcial(0, 1),
    ];
    if (rotacional.some((c) => Math.abs(c) > 1e-6)) throw new Error('el campo no es conservativo');
    /* C_AB va de A(1,0) a B(0,1) con la proyección sobre y = 1 − x. */
    cuadra2526(
      id,
      'Apartado b1) — el trabajo por C_AB',
      trabajo(F, (t) => sobreElMonte(t, 1 - t), 1, 0, 1e-10),
    );
  });
});

describe('2025-2026 · 2 · clasificar tres EDO', () => {
  const id = 'ex2526-5ev-2-clasificar-tres-edos';

  it('la a.1 no es exacta, y le faltan 3', () => {
    const M = (x: number, y: number) => 4 * y - x * x * y;
    const N = (x: number, y: number) => 2 * x + x * y * y;
    cuadra2526(id, 'La a.1 — ¿es exacta?', deriva((t) => M(2, t), 1) - deriva((t) => N(t, 1), 2));
  });

  it('y la solución de a.3 vale 2e² en x = 2', () => {
    /* La constante se fija con el punto (1, e) y **la solución se comprueba
       contra la ecuación**, que es lo que de verdad la valida: se mide el
       residuo de x·y′ − y − y·ln(y/x) en varios puntos. */
    const C = raiz((c) => 1 * Math.exp(c * 1) - Math.E, -3, 3);
    const y = (x: number) => x * Math.exp(C * x);
    for (const x of [0.6, 1.4, 2.3]) {
      const residuo = x * deriva(y, x) - y(x) - y(x) * Math.log(y(x) / x);
      if (Math.abs(residuo) > 1e-5) throw new Error(`la solución no cumple la EDO en x=${x}`);
    }
    cuadra2526(id, 'La solución de a.3, por un punto concreto', y(2));
  });
});

describe('2025-2026 · 3 · variación de constantes', () => {
  const id = 'ex2526-5ev-3-variacion-de-constantes';

  it('la característica tiene la raíz doble 1', () => {
    /* La raíz es DOBLE, así que el polinomio toca el eje y no lo cruza: un
       buscador por cambio de signo no la ve —y el nuestro avisa, que para eso
       está—. Se localiza donde se anula la derivada y se comprueba después que
       el polinomio también se anula ahí. */
    const p = (r: number) => r * r - 2 * r + 1;
    const doble = raiz((r) => deriva(p, r), -0.5, 3);
    if (Math.abs(p(doble)) > 1e-9) throw new Error('ahí el polinomio no se anula');
    cuadra2526(id, 'La raíz de la ecuación característica', doble);
  });

  it('y la particular vale 9,5432 en x = 1', () => {
    /* Igual que antes: la particular no se recalcula, se **verifica** metiéndola
       en la ecuación completa y midiendo el residuo. Es la comprobación que
       importa, porque el fallo típico de la variación de constantes es una
       constante mal integrada, y eso el residuo lo destapa. */
    const yp = (x: number) => Math.exp(x) * (8 * x * Math.atan(x) - 4 * Math.log(1 + x * x));
    for (const x of [-0.8, 0.5, 1.7]) {
      const residuo = deriva2(yp, x, 0.02) - 2 * deriva(yp, x) + yp(x) - (8 * Math.exp(x)) / (1 + x * x);
      if (Math.abs(residuo) > 1e-3) throw new Error(`la particular no cumple la EDO en x=${x}`);
    }
    cuadra2526(id, 'La solución particular, evaluada', yp(1));
  });
});

describe('2024-2025 · 1 · el río y las dos parábolas', () => {
  const id = 'ex2425-5ev-1-el-rio-y-las-dos-parabolas';
  /* Las dos parábolas se cortan en x = ±2, así que A(−2,1) y B(2,1). */
  const arriba = (x: number) => [x, -0.5 * x * x + 3];
  const abajo = (x: number) => [x, 0.5 * x * x - 1];

  it('las dos trayectorias arrancan y acaban en el mismo sitio', () => {
    for (const x of [-2, 2])
      if (Math.abs(arriba(x)[1] - abajo(x)[1]) > 1e-12) throw new Error(`no se cortan en x=${x}`);
  });

  it('por la parábola de abajo, el primer campo hace 6,6667', () => {
    const V = ([x, y]: number[]) => [2 * x * y - 5 * y, x * x + y];
    cuadra2425(id, 'Apartado a) — el trabajo por la parábola de abajo', trabajo(V, abajo, -2, 2, 1e-9));
  });

  it('y alrededor de la región cerrada, 27,1', () => {
    /* El único dato de la región es su área, 5,42 km², así que aquí no hay
       más camino que Green. Lo que sí se mide en vez de suponerse es el
       integrando: ∂N/∂x − ∂M/∂y, que sale constante. */
    const M = (x: number, y: number) => 2 * x * y - 5 * y;
    const N = (x: number, y: number) => x * x + y;
    let rotacional = 0;
    for (const [x, y] of [
      [0.3, 1.1],
      [-1.4, 0.2],
      [2.1, -0.6],
    ]) {
      const c = deriva((t) => N(t, y), x) - deriva((t) => M(x, t), y);
      if (rotacional && Math.abs(c - rotacional) > 1e-5) throw new Error('el integrando no es constante');
      rotacional = c;
    }
    cuadra2425(id, 'Apartado b) — el trabajo alrededor de C', rotacional * 5.42);
  });

  it('y con el campo nuevo la ida da 4 por cualquiera de las dos', () => {
    /* El campo nuevo es conservativo, y la resolución lo aprovecha para restar
       potenciales. Aquí se integra por las dos parábolas: si el trabajo es el
       mismo, la propiedad que la resolución invoca queda comprobada de paso. */
    const V = ([x, y]: number[]) => [2 * x * y + y * y, 2 * x * y + x * x];
    const porAbajo = trabajo(V, abajo, -2, 2, 1e-9);
    const porArriba = trabajo(V, arriba, -2, 2, 1e-9);
    if (Math.abs(porAbajo - porArriba) > 1e-6) throw new Error('los dos caminos no coinciden');
    cuadra2425(id, 'Apartado c) — el trabajo de ida con el campo nuevo', porAbajo);
  });
});

describe('2024-2025 · 2 · los salmones del río', () => {
  /* y′ = 5y − y² − 4. La resolución razona sobre el signo de y′; aquí se
     integra la ecuación con Runge-Kutta desde cuatro poblaciones distintas y
     se mira dónde acaba cada una. El paso se ajusta al ritmo: con 5.000
     salmones la derivada vale veinticinco millones, y un paso fijo se
     dispararía. */
  const ritmo = (y: number) => 5 * y - y * y - 4;
  const adonde = (y0: number) => {
    let y = y0;
    let t = 0;
    while (t < 30) {
      const h = Math.min(0.005 / (1 + Math.abs(ritmo(y))), 30 - t);
      const k1 = ritmo(y);
      const k2 = ritmo(y + (h * k1) / 2);
      const k3 = ritmo(y + (h * k2) / 2);
      const k4 = ritmo(y + h * k3);
      y += (h * (k1 + 2 * k2 + 2 * k3 + k4)) / 6;
      t += h;
    }
    return y;
  };

  it('desde cualquier población por encima de 1 se acaba en 4', () => {
    const finales = [2, 10, 100, 5000].map(adonde);
    for (const f of finales) if (Math.abs(f - finales[0]) > 1e-6) throw new Error('no acaban todas igual');
    cuadra2425('ex2425-5ev-2-los-salmones-del-rio', 'El equilibrio estable', finales[3]);
  });
});

describe('2024-2025 · 3 · resonancia y exponencial', () => {
  const id = 'ex2425-5ev-3-resonancia-y-exponencial';
  const residuo = (y: (x: number) => number, fuente: (x: number) => number, x: number) =>
    deriva2(y, x, 0.02) + 9 * y(x) - fuente(x);

  it('la exponencial lleva coeficiente 2/9', () => {
    /* Se busca la A que anula el residuo, en vez de despejarla del sistema. */
    const A = raiz((a) => residuo((x) => a * Math.exp(-3 * x), (x) => 4 * Math.exp(-3 * x), 0.3), -5, 5);
    cuadra2425(id, 'El coeficiente de la exponencial', A);
  });

  it('y el término que resuena, −3/2', () => {
    /* Con C = 0, que es lo que sale del término en coseno. Se comprueba que el
       residuo se anula en varios puntos, no solo en el que se usó para buscar
       la raíz: si hiciera falta un C distinto de cero, ahí se vería. */
    const conB = (B: number) => (x: number) => x * B * Math.cos(3 * x);
    const fuente = (x: number) => 9 * Math.sin(3 * x);
    const B = raiz((b) => residuo(conB(b), fuente, 0.4), -5, 5);
    for (const x of [-1.2, 0.9, 2.6])
      if (Math.abs(residuo(conB(B), fuente, x)) > 1e-3) throw new Error(`sobra algo en x=${x}`);
    cuadra2425(id, 'El coeficiente del término que resuena', B);
  });
});
