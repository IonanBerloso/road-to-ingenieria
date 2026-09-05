/**
 * Las quintas evaluaciones de Cálculo de 2015-2016 y 2016-2017. Ocho
 * respuestas entre las dos. Con ellas quedan verificadas **las diez quintas
 * evaluaciones** del corpus.
 *
 * El ejercicio 2 de 2016-2017 pide expresamente la misma integral **por dos
 * caminos distintos**, que es literalmente lo que hace este directorio con
 * todo lo demás. Así que aquí el test hace los dos y además comprueba que
 * coinciden: Green sobre el cuarto de disco, y los tres tramos del borde
 * recorridos uno a uno.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { integra, raiz, trabajo } from './numerico';
import { escalar, norma, resuelve, unitario } from './lineal';

const cuadra1617 = convocatoria('calculo', '2016-2017-5ev');
const cuadra1516 = convocatoria('calculo', '2015-2016-5ev');

const avanza = (f: (y: number) => number, y0: number, T: number, h = 0.002) => {
  let y = y0;
  const pasos = Math.ceil(Math.abs(T) / h);
  const dt = T / pasos;
  for (let i = 0; i < pasos; i++) {
    const k1 = f(y);
    const k2 = f(y + (dt * k1) / 2);
    const k3 = f(y + (dt * k2) / 2);
    const k4 = f(y + dt * k3);
    y += (dt * (k1 + 2 * k2 + 2 * k3 + k4)) / 6;
  }
  return y;
};

describe('2016-2017 · 1 · el paracaidista', () => {
  const id = 'ex1617-5ev-1-el-paracaidista-y-su-velocidad-limite';
  const [m, k, g] = [50, 10, 10];

  it('la raíz que no es cero vale −0,2', () =>
    cuadra1617(id, 'La raíz que no es cero', raiz((r) => r * r + (k / m) * r, -5, -0.01)));

  it('y la velocidad terminal son 50 m/s', () => {
    /* **Integrando la caída**, no anulando la derivada: se arranca en reposo
       con v′ = g − (k/m)v y se deja correr. Y se comprueba que llega a donde
       llega desde dos velocidades iniciales distintas, una por encima y otra
       por debajo, que es lo que hace que el límite sea terminal y no una
       casualidad del arranque. */
    const ritmo = (v: number) => g - (k / m) * v;
    const finales = [0, 20, 90].map((v0) => avanza(ritmo, v0, 300, 0.01));
    for (const v of finales) if (Math.abs(v - finales[0]) > 1e-6) throw new Error('no acaban todas igual');
    cuadra1617(id, 'La velocidad terminal', finales[0]);
  });
});

describe('2016-2017 · 2 · el cuarto de disco por dos caminos', () => {
  const id = 'ex1617-5ev-2-el-cuarto-de-disco-por-dos-caminos';
  const V = ([x, y]: number[]) => [x ** 3 - x * x * y, x * y * y];
  /* Los tres tramos del borde, en sentido positivo: el eje X de 0 a 1, el arco
     de (1,0) a (0,1), y el eje Y de 1 a 0. */
  const porElEjeX = trabajo(V, (t) => [t, 0], 0, 1, 1e-11);
  const porElArco = trabajo(V, (t) => [Math.cos(t), Math.sin(t)], 0, Math.PI / 2, 1e-10);
  const porElEjeY = trabajo(V, (t) => [0, t], 1, 0, 1e-11);

  it('por Green sale π/8', () => {
    /* El rotacional es x²+y². Se integra sobre el cuarto de disco con el
       barrido exterior en x = sen θ, que quita la derivada infinita del
       borde. */
    const porGreen = integra(
      (theta) => {
        const x = Math.sin(theta);
        const alto = Math.cos(theta);
        return integra((y) => x * x + y * y, 0, alto, 1e-11) * alto;
      },
      0,
      Math.PI / 2,
      1e-9,
    );
    /* Y los dos caminos que el enunciado pide comparar. */
    if (Math.abs(porElEjeX + porElArco + porElEjeY - porGreen) > 1e-7)
      throw new Error('Green y el recorrido directo no coinciden');
    cuadra1617(id, 'Por Green', porGreen);
  });

  it('y el arco aporta 0,1427', () => cuadra1617(id, 'El arco, por el camino directo', porElArco));
});

describe('2015-2016 · 1 · el gradiente desde dos direcciones', () => {
  const id = 'ex1516-5ev-1-el-gradiente-desde-dos-direcciones';
  /* Desde (1,2) hacia (2,2) la dirección es (1,0) y la pendiente 2; hacia
     (1,1), la dirección es (0,−1) y la pendiente −2. */
  const direcciones = [
    [1, 0],
    [0, -1],
  ];
  const pendientes = [2, -2];
  const gradiente = resuelve(direcciones.map(unitario), pendientes);

  it('la parcial respecto de y vale 2', () => {
    for (const [i, v] of direcciones.entries())
      if (Math.abs(escalar(gradiente, unitario(v)) - pendientes[i]) > 1e-9)
        throw new Error(`la dirección ${v} no da su pendiente`);
    cuadra1516(id, 'La parcial respecto de y', gradiente[1]);
  });

  it('y hacia (4,3) se cambia a 2,8', () =>
    cuadra1516(id, 'La derivada direccional en la dirección de (4,3)', escalar(gradiente, unitario([4, 3]))));
});

describe('2015-2016 · 2 · el campo que no mira el camino', () => {
  const id = 'ex1516-5ev-2-el-campo-que-no-mira-el-camino';
  const V = ([x, y]: number[]) => [6 * x * y * y - y ** 3, 6 * x * x * y - 3 * x * y * y];
  const A = [1, 2];
  const B = [3, 4];
  const centro = [2, 3];
  const radio = norma([A[0] - centro[0], A[1] - centro[1]]);
  const angulo = (p: number[]) => Math.atan2(p[1] - centro[1], p[0] - centro[0]);
  const enLaCircunferencia = (t: number) => [
    centro[0] + radio * Math.cos(t),
    centro[1] + radio * Math.sin(t),
  ];

  it('el segmento y el arco dan lo mismo, 236', () => {
    /* La resolución observa que el campo es conservativo y resta potenciales.
       Aquí se recorren **los dos caminos** y se comprueba que coinciden, que
       es la propiedad que la resolución da por sabida. */
    const porElSegmento = trabajo(V, (t) => [A[0] + t * (B[0] - A[0]), A[1] + t * (B[1] - A[1])], 0, 1, 1e-9);
    const porElArco = trabajo(V, enLaCircunferencia, angulo(A), angulo(B), 1e-9);
    if (Math.abs(porElSegmento - porElArco) > 1e-6) throw new Error('los dos caminos no coinciden');
    cuadra1516(id, 'El segmento, y también el arco', porElSegmento);
  });

  it('y la circunferencia entera, cero', () =>
    cuadra1516(id, 'La circunferencia entera', trabajo(V, enLaCircunferencia, 0, 2 * Math.PI, 1e-8)));
});

describe('2015-2016 · 3 · la hora del crimen', () => {
  const id = 'ex1516-5ev-3-la-hora-del-crimen';
  /* Enfriamiento de Newton hacia los 20 °C de la habitación. A las 14:00 el
     cuerpo está a 28 °C y a las 16:00 a 25 °C; la k sale de ahí, integrando la
     ecuación en vez de despejarla de su solución. */
  const temperatura = (k: number) => (t: number) => avanza((T) => k * (T - 20), 28, t);
  const k = raiz((c) => temperatura(c)(2) - 25, -2, -1e-4);

  it('en dos horas la diferencia queda en 0,625', () => cuadra1516(id, 'Lo que decae en dos horas', Math.exp(2 * k)));

  it('y la muerte fue 3,2075 horas antes de las 14:00', () => {
    /* Hacia atrás en el tiempo: se integra con T negativo hasta dar con los
       37 °C del cuerpo vivo. */
    const cuando = raiz((t) => temperatura(k)(-t) - 37, 0.1, 12);
    cuadra1516(id, 'Cuántas horas antes de las 14:00', cuando);
  });
});
