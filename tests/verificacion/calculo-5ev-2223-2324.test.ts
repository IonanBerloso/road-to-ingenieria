/**
 * Las quintas evaluaciones de Cálculo de 2022-2023 y 2023-2024. Doce
 * respuestas entre las dos.
 *
 * Dos cosas que este fichero hace y los anteriores no:
 *
 * - **El plan de ahorro se integra con Runge-Kutta.** La resolución obtiene la
 *   fórmula cerrada y despeja dos veces; aquí no se usa la fórmula en ningún
 *   sitio: se integra la ecuación y se busca por bisección la aportación
 *   inicial que da 1.000 € a los cinco años, y después el año en que se llega a
 *   5.000.
 * - **La EDO con parámetro se resuelve dejando fallar al buscador de raíces.**
 *   La pregunta es para qué valor de a deja de valer la fórmula, y la respuesta
 *   sale de intentar resolverla para varios valores y quedarse con el único en
 *   el que no hay solución: el aviso de «no hay cambio de signo» deja de ser un
 *   error y pasa a ser el resultado.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { deriva, deriva2, integra, raiz, trabajo } from './numerico';

const cuadra2324 = convocatoria('calculo', '2023-2024-5ev');
const cuadra2223 = convocatoria('calculo', '2022-2023-5ev');

/** Runge-Kutta 4 sobre y′ = f(y), de 0 a T. */
const avanza = (f: (y: number) => number, y0: number, T: number, h = 0.02) => {
  let y = y0;
  for (let t = 0; t < T; t += h) {
    const paso = Math.min(h, T - t);
    const k1 = f(y);
    const k2 = f(y + (paso * k1) / 2);
    const k3 = f(y + (paso * k2) / 2);
    const k4 = f(y + paso * k3);
    y += (paso * (k1 + 2 * k2 + 2 * k3 + k4)) / 6;
  }
  return y;
};

describe('2023-2024 · 1 · el camino con semicircunferencia', () => {
  const id = 'ex2324-5ev-1-el-camino-con-semicircunferencia';
  const F = ([x, y]: number[]) => [x ** 3 - y ** 3, x ** 3 + y ** 3];
  const porElEje = (a: number, b: number) => trabajo(F, (t) => [t, 0], a, b, 1e-10);
  const porElArco = trabajo(F, (t) => [2 * Math.cos(t), 2 * Math.sin(t)], Math.PI, 0, 1e-10);

  it('los dos tramos rectos se cancelan', () => {
    /* No es que cada uno valga cero —valen 3,75 y −3,75—: es que se anulan
       entre ellos, y por eso el enunciado los pone. */
    if (Math.abs(porElEje(-1, -2)) < 1) throw new Error('el primer tramo no aporta nada, y debería');
    cuadra2324(id, 'Lo que aportan los dos tramos rectos', porElEje(-1, -2) + porElEje(2, 1));
  });

  it('y el trabajo total es −12π', () => {
    /* El arco se contrasta además con Green: cerrando la semicircunferencia
       por el eje se obtiene una curva en sentido horario, y el eje no aporta
       nada porque x³ es impar. El área del rotacional se integra en polares.
       Los dos números tienen que coincidir. */
    const porGreen = -integra(
      (_theta) => integra((r) => 3 * r ** 3, 0, 2, 1e-11),
      0,
      Math.PI,
      1e-9,
    );
    if (Math.abs(porElArco - porGreen) > 1e-6) throw new Error('el arco y Green no coinciden');
    cuadra2324(id, 'El trabajo total', porElEje(-1, -2) + porElArco + porElEje(2, 1));
  });
});

describe('2023-2024 · 2 · el plan de ahorro', () => {
  const id = 'ex2324-5ev-2-el-plan-de-ahorro';
  /* Cada año entran 100 € y el banco añade el 1 % del saldo. */
  const ritmo = (M: number) => 100 + 0.01 * M;
  const saldo = (inicial: number, años: number) => avanza(ritmo, inicial, años);
  const aportacion = raiz((m) => saldo(m, 5) - 1000, 0, 5000);

  it('la aportación inicial fueron 463,52 €', () =>
    cuadra2324(id, 'La aportación inicial', aportacion));

  it('y se llega a 5.000 € en el año 36,02', () =>
    cuadra2324(id, 'Cuándo se llega a 5.000 €', raiz((T) => saldo(aportacion, T) - 5000, 1, 100)));
});

describe('2023-2024 · 3 · deducir el coeficiente y resolver', () => {
  const id = 'ex2324-5ev-3-deducir-el-coeficiente-y-resolver';
  const y0 = (x: number) => Math.exp(2 * x);

  it('el coeficiente vale −2', () => {
    /* Se busca la a que hace que e^{2x} sea solución de la homogénea. */
    const a = raiz((c) => deriva2(y0, 1, 0.02) + c * deriva(y0, 1), -6, 6);
    for (const x of [-0.5, 0.8])
      if (Math.abs(deriva2(y0, x, 0.02) + a * deriva(y0, x)) > 1e-4)
        throw new Error(`e^{2x} no resuelve la homogénea en x=${x}`);
    cuadra2324(id, 'El coeficiente', a);
  });

  it('y el término que resuena lleva 3/2', () => {
    /* Resuena porque e^{2x} ya está en la homogénea; por eso el ensayo lleva
       la x delante. El coeficiente se busca anulando el residuo. */
    const residuo = (A: number, x: number) => {
      const yp = (t: number) => A * t * Math.exp(2 * t);
      return deriva2(yp, x, 0.02) - 2 * deriva(yp, x) - 3 * Math.exp(2 * x);
    };
    const A = raiz((a) => residuo(a, 0.6), -8, 8);
    for (const x of [-0.4, 1.1]) if (Math.abs(residuo(A, x)) > 1e-3) throw new Error(`sobra algo en x=${x}`);
    cuadra2324(id, 'El coeficiente del término que resuena', A);
  });
});

describe('2022-2023 · 1 · la semicircunferencia en el plano y = 3', () => {
  const id = 'ex2223-5ev-1-la-semicircunferencia-en-el-plano-y-tres';
  /* x²+z² = y² con y = 3 y x ≥ 0 es media circunferencia de radio 3 en el
     plano y = 3. Se recorre de (0,3,−3) a (0,3,3) pasando por (3,3,0). */
  const arco = (t: number) => [3 * Math.cos(t), 3, 3 * Math.sin(t)];
  const desde = -Math.PI / 2;
  const hasta = Math.PI / 2;

  it('la curva cumple las tres condiciones', () => {
    for (const t of [-1.2, 0, 0.9]) {
      const [x, y, z] = arco(t);
      if (Math.abs(x * x + z * z - y * y) > 1e-9) throw new Error('no está en el cono');
      if (y !== 3 || x < 0) throw new Error('se sale de las condiciones');
    }
  });

  it('el primer término no aporta nada', () => {
    /* Y no porque sea pequeño: sobre la curva x²+z² vale 9 constante, así que
       lo que queda es 9·(x_final − x_inicial), y los dos extremos tienen x=0. */
    const soloElPrimero = ([x, , z]: number[]) => [x * x + z * z, 0, 0];
    cuadra2223(id, 'Lo que aporta el primer término', trabajo(soloElPrimero, arco, desde, hasta, 1e-10));
  });

  it('y la integral vale 18', () => {
    const F = ([x, y, z]: number[]) => [x * x + z * z, x * x - z * z, y * y - x * x];
    cuadra2223(id, 'El valor de la integral', trabajo(F, arco, desde, hasta, 1e-10));
  });
});

describe('2022-2023 · 2 · la altura que da ocho julios', () => {
  const id = 'ex2223-5ev-2-la-altura-que-da-ocho-julios';
  const V = ([x, y]: number[]) => [x ** 3 * Math.sin(x), 2 * x];
  /* El triángulo (0,0) → (3,0) → (3,h) → (0,0), recorrido en sentido
     positivo. Se integra por los tres lados **sin usar Green**, que es lo que
     hace la resolución: el x³sen x se cancela solo al cerrar el circuito, y
     eso es justo lo que hay que ver. */
  const vueltaEntera = (h: number) =>
    trabajo(V, (t) => [3 * t, 0], 0, 1, 1e-10) +
    trabajo(V, (t) => [3, h * t], 0, 1, 1e-10) +
    trabajo(V, (t) => [3 - 3 * t, h - h * t], 0, 1, 1e-10);

  it('el integrando de Green vale 2', () => {
    const M = (x: number, y: number) => x ** 3 * Math.sin(x);
    const N = (x: number, y: number) => 2 * x;
    cuadra2223(id, 'El integrando de Green', deriva((t) => N(t, 1), 1.4) - deriva((t) => M(1.4, t), 1));
  });

  it('y la altura que da 8 J es 8/3', () =>
    cuadra2223(id, 'La altura', raiz((h) => vueltaEntera(h) - 8, 0.2, 20)));
});

describe('2022-2023 · 3 · una de cada tipo', () => {
  const id = 'ex2223-5ev-3-una-de-cada-tipo';

  it('la segunda es homogénea de grado 3', () => {
    /* El grado se **mide**: se escala el punto y se mira por cuánto se
       multiplica cada coeficiente. Los dos tienen que dar el mismo. */
    const M = (x: number, y: number) => x * x * y;
    const N = (x: number, y: number) => y ** 3 - x ** 3;
    const grados = [M, N].map((f) => Math.log(f(2 * 1.3, 2 * 0.7) / f(1.3, 0.7)) / Math.log(2));
    if (Math.abs(grados[0] - grados[1]) > 1e-9) throw new Error('los dos coeficientes no tienen el mismo grado');
    cuadra2223(id, 'El grado de homogeneidad de la segunda', Math.round(grados[0]));
  });

  it('y la curva por (1,1) lleva C = 1/3', () => {
    /* Antes de evaluarla se comprueba que la solución implícita es de verdad
       solución: derivando F a lo largo de la curva, x²y·dx + (y³−x³)·dy tiene
       que anularse. */
    const F = (x: number, y: number) => x ** 3 / (3 * y ** 3) + Math.log(Math.abs(y));
    for (const [x, y] of [
      [1.4, 0.9],
      [0.6, 1.7],
    ]) {
      const Fx = deriva((t) => F(t, y), x);
      const Fy = deriva((t) => F(x, t), y);
      /* dF = 0 tiene que ser la misma ecuación que M dx + N dy = 0, o sea que
         los dos gradientes han de ser proporcionales. */
      if (Math.abs(Fx * (y ** 3 - x ** 3) - Fy * (x * x * y)) > 1e-6)
        throw new Error(`la solución no cumple la EDO en (${x}, ${y})`);
    }
    cuadra2223(id, 'La solución de la homogénea, comprobada en un punto', F(1, 1));
  });
});

describe('2022-2023 · 4 · la EDO con parámetro', () => {
  const id = 'ex2223-5ev-4-la-edo-con-parametro';
  /* y″ + a y′ = 7 con el ensayo y_p = Kx. El residuo es aK − 7. */
  const residuo = (a: number, K: number) => {
    const yp = (x: number) => K * x;
    return deriva2(yp, 1, 0.02) + a * deriva(yp, 1) - 7;
  };
  const buscaK = (a: number) => raiz((K) => residuo(a, K), -1e4, 1e4);

  it('con a = 2 el coeficiente es 3,5', () =>
    cuadra2223(id, 'El coeficiente de la particular cuando a no es cero', buscaK(2)));

  it('y con a = 0 no hay ningún K que valga', () => {
    /* Aquí el fallo **es** la respuesta: `raiz` exige un cambio de signo, y
       con a = 0 el residuo vale −7 haga lo que haga K. Se recorre una rejilla
       de valores de a y se recoge el único donde el ensayo no tiene solución;
       si hubiera más de uno, el test lo diría. */
    const rejilla = [-3, -2, -1, -0.5, 0, 0.5, 1, 2, 3];
    const sinSolucion = rejilla.filter((a) => {
      try {
        buscaK(a);
        return false;
      } catch {
        return true;
      }
    });
    if (sinSolucion.length !== 1) throw new Error(`fallan ${sinSolucion.length} valores de a, y debería ser uno`);
    cuadra2223(id, 'El caso que se sale', sinSolucion[0]);
  });
});
