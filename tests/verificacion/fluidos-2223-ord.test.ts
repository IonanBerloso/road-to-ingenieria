/**
 * La ordinaria de Mecánica de Fluidos de 2022-2023. Veintitrés respuestas en
 * nueve ejercicios.
 *
 * Dos ejercicios de esta convocatoria enseñan lo mismo por dos caminos: **lo
 * que decide no es la cota, es la altura piezométrica**. En el 8, un depósito
 * que está veinticinco metros por encima del nudo resulta que **aporta** caudal
 * en vez de recibirlo, porque su manómetro le añade otros treinta y cuatro. En
 * el 3, dos fluidos a ambos lados de una pared no se contrarrestan: los dos
 * empujan en el mismo sentido, porque el de la derecha está en depresión y
 * **succiona**. El test comprueba los dos signos antes de publicar nada.
 *
 * Y el 9 tiene un paso que no es una cuenta sino una lectura de tabla —el
 * coeficiente de Hazen-Williams del acero galvanizado a 250 mm—. No se copia:
 * se saca de **la tabla que el propio tema 19 publica**, que asigna el
 * coeficiente por bandas de rugosidad relativa y no por material. Si el tema
 * cambiara esa tabla, el test se pondría rojo.
 */
import { describe, it } from 'vitest';
import { coeficienteHW } from './tablas';
import { convocatoria } from './corpus';
import { raiz } from './numerico';

const cuadra = convocatoria('fluidos', '2022-2023-ord');

const G = 9.8;
const GAMMA = 1000 * G;
const area = (d: number) => (Math.PI * d * d) / 4;
function colebrook(Re: number, rugosidadRelativa: number) {
  let f = 0.02;
  for (let i = 0; i < 200; i++)
    f = 1 / (-2 * Math.log10(rugosidadRelativa / 3.7 + 2.51 / (Re * Math.sqrt(f)))) ** 2;
  return f;
}
const hazenWilliams = (L: number, Q: number, D: number, C: number) =>
  (10.674 * L * Q ** 1.852) / (C ** 1.852 * D ** 4.871);

describe('1 · el micromanómetro de dos líquidos', () => {
  const id = 'exflu2223-ord-1-el-micromanometro-de-dos-liquidos';
  const [s1, s2] = [1, 0.9];
  /* Los depósitos son anchos, así que sus niveles no se mueven: lo único que
     ocurre es que en un tramo de altura d el pesado sustituye al ligero. */
  const presionPor = (d: number) => d * (s1 - s2) * GAMMA;

  it('cinco centímetros de menisco son cinco milímetros de agua', () =>
    cuadra(id, 'El incremento de presión', (presionPor(0.05) / GAMMA) * 1000));

  it('y la sensibilidad es de 0,98 Pa por milímetro', () => {
    /* El aparato amplifica por diez, y ese factor —γ₁/(γ₁−γ₂)— es su fórmula
       de diseño: la pareja se elige por lo parecidas que son las densidades. */
    if (Math.abs(s1 / (s1 - s2) - 10) > 1e-9) throw new Error('la amplificación no sale diez');
    cuadra(id, 'La sensibilidad', presionPor(0.001));
  });
});

describe('2 · el codo-boquilla que da la vuelta', () => {
  const id = 'exflu2223-ord-2-el-codo-boquilla-que-da-la-vuelta';
  const gamma = 0.85 * GAMMA;
  const [D1, D2, k, kBoq] = [0.3, 0.1, 5, 0.1];
  /* Con D₁/D₂ = 3 la continuidad da v₂ = 9v₁, y todo queda en función de v₁. */
  const razon = (D1 / D2) ** 2;
  const v1 = raiz(
    (v) => 100000 / gamma + (v * v) / (2 * G) - ((razon * v) ** 2 / (2 * G)) * (1 + kBoq) - (k * v * v) / (2 * G),
    0.01,
    20,
  );
  const Q = v1 * area(D1);

  it('circulan 112,37 l/s', () => cuadra.magnitud(id, 'El caudal', Q * 1000, 'l/s'));

  it('y el conjunto recibe 8,59 kN', () => {
    /* Volumen de control por la brida de entrada y la salida del chorro, que
       sale en sentido contrario. De la fuerza total, la presión pone 7,07 kN y
       el chorro solo 1,52: por eso las bridas de un codo se calculan con la
       presión de servicio y no con el caudal. */
    const caudalMasico = 850 * Q;
    const v2 = razon * v1;
    const porElChorro = caudalMasico * (v2 + v1);
    const porLaPresion = 100000 * area(D1);
    if (!(porLaPresion > 4 * porElChorro)) throw new Error('la presión no domina como debería');
    cuadra.magnitud(id, 'La fuerza sobre el conjunto', (porElChorro + porLaPresion) / 1000, 'kN');
  });
});

describe('3 · el tramo circular entre dos fluidos', () => {
  const id = 'exflu2223-ord-3-el-tramo-circular-entre-dos-fluidos';
  const [s1, s2] = [1.2, 0.8];
  const [g1, g2] = [s1 * GAMMA, s2 * GAMMA];
  const [h1, R1, b] = [1.2, 0.4, 1];
  /* El plano de cargas de la izquierda: el Bourdon marca 2,30 mca sobre la
     superficie, y hay que pasarlos a metros de **este** fluido. */
  const planoIzq = h1 + (2.3 * GAMMA) / g1;
  /* El de la derecha lo pone el manómetro abierto, justo en la cota de C. */
  const planoDer = 0;

  it('la horizontal del fluido pesado son 13,72 kN', () => {
    /* Presión en el centro de gravedad de la proyección vertical del tramo, un
       rectángulo de R₁ por b. */
    cuadra.magnitud(id, 'La fuerza horizontal del fluido de la izquierda', (g1 * (planoIzq - R1 / 2) * R1 * b) / 1000, 'kN');
  });

  it('y su vertical, 13,18 kN', () => {
    /* El volumen de presiones: el prisma que va del arco hasta el plano de
       cargas. Sobre la proyección horizontal del arco hay la columna hasta B
       más el trozo que queda entre el arco y la esquina. */
    const entreElArcoYLaEsquina = R1 * R1 - (Math.PI * R1 * R1) / 4;
    const volumen = (R1 * (planoIzq - R1) + entreElArcoYLaEsquina) * b;
    cuadra.magnitud(id, 'La fuerza vertical del fluido de la izquierda', (g1 * volumen) / 1000, 'kN');
  });

  it('y el de la derecha empuja en el mismo sentido, no en contra', () => {
    /* Con el plano de cargas justo en C, el volumen se reduce **exactamente**
       al cuarto de círculo. Y el signo es lo que sorprende: al estar el plano
       por debajo de la pared, el fluido 2 succiona, así que su empuje va en el
       mismo sentido que el del 1 en vez de contrarrestarlo. */
    if (!(planoDer < R1)) throw new Error('el plano de cargas de la derecha no está por debajo del tramo');
    cuadra.magnitud(id, 'Las dos fuerzas del fluido de la derecha', g2 * ((Math.PI * R1 * R1) / 4) * b, 'N');
  });
});

describe('4 · el aceite que sostiene la chatarra', () => {
  const id = 'exflu2223-ord-4-el-aceite-que-sostiene-la-chatarra';
  const [D, L, alfa] = [0.15, 0.49, 1.667e-10];
  const dp = (550000 * G) / area(D);
  const V0 = area(D) * L;

  it('la presión sube 3.050 bar', () => cuadra(id, 'El incremento de presión', dp / 1e5));

  it('y el aceite se encoge 0,429 litros', () => {
    /* La ley integrada, no la lineal: a tres mil bares la aproximación de
       siempre se sale un 2,5 %, y este ejercicio está puesto justo por encima
       de esa frontera. Se comprueba la diferencia. */
    const exacta = V0 * (1 - Math.exp(-alfa * dp));
    const lineal = alfa * V0 * dp;
    if (!(lineal / exacta - 1 > 0.02)) throw new Error('la lineal no se separa lo suficiente');
    cuadra(id, 'Los litros que faltan', exacta * 1000);
  });

  it('y la botella tiene que ser de 0,452 litros', () => {
    /* El hueco está medido **dentro** del cilindro, con el aceite ya
       comprimido; el que se compra está a presión atmosférica y se encogerá al
       entrar. Los veintitrés mililitros de diferencia son justo eso. */
    const hueco = V0 * (1 - Math.exp(-alfa * dp));
    cuadra(id, 'La botella que hay que comprar', hueco * Math.exp(alfa * dp) * 1000);
  });
});

describe('5 · el venturímetro que dice hacia dónde va', () => {
  const id = 'exflu2223-ord-5-el-venturimetro-que-dice-hacia-donde-va';
  const [D1, D2, sGlicol] = [0.3, 0.25, 1.1];
  const Qteorico = 0.1 / 0.97;
  const v2 = Qteorico / area(D2);
  const deltaH = ((v2 * v2) * (1 - (area(D2) / area(D1)) ** 2)) / (2 * G);

  it('el manómetro marca 1,28 m', () => {
    /* El líquido manométrico es **agua**, más ligera que el glicol que
       circula, así que va arriba en una U invertida y el factor no es el de
       siempre: en vez de (s_m/s − 1) es (1 − s_ag/s_gl). */
    const factor = 1 - 1 / sGlicol;
    if (!(factor < 1)) throw new Error('el factor de una U invertida tiene que ser menor que uno');
    cuadra(id, 'La lectura del manómetro', deltaH / factor);
  });

  it('y el rotámetro marca 116,28 l/s', () => {
    /* Cada aparato marca el caudal **teórico** que corresponde a su propia
       medida; el real es el mismo para los dos, y por eso dos coeficientes
       distintos dan dos lecturas distintas y las dos son correctas. */
    cuadra.magnitud(id, 'La lectura del rotámetro', (100 / 0.86), 'l/s');
  });
});

describe('6 · Mach y Reynolds a la vez', () => {
  it('a escala 1:4 hace falta cuatro veces la presión', () => {
    /* Con el mismo gas y la misma temperatura, c y μ no cambian. Mach obliga
       entonces a igualar velocidades, y Reynolds deja ρ·L constante: la
       densidad tiene que crecer lo que baja el tamaño, y a temperatura fija la
       densidad va con la presión. */
    const lambda = 1 / 4;
    const razonVelocidad = 1; // lo que impone Mach con la misma c
    const razonDensidad = raiz((r) => r * lambda * razonVelocidad - 1, 0.1, 100);
    cuadra('exflu2223-ord-6-mach-y-reynolds-a-la-vez', 'La escala que queda libre', razonDensidad);
  });
});

describe('7 · la sección óptima del canal rectangular', () => {
  const id = 'exflu2223-ord-7-la-seccion-optima-del-canal-rectangular';
  /* «Óptima» significa perímetro mojado mínimo para el área dada, porque con
     Manning el caudal solo depende de P una vez fijada A. */
  const optimo = (A: number) => {
    let mejor = { P: Infinity, y: 0 };
    for (let y = 0.05; y <= 10; y += 0.00005) {
      const P = A / y + 2 * y;
      if (P < mejor.P) mejor = { P, y };
    }
    return { ...mejor, b: A / mejor.y };
  };

  it('el ancho es el doble del calado', () => {
    /* Se comprueba con tres áreas distintas: la relación no depende del
       tamaño. */
    for (const A of [2, 8, 30]) {
      const o = optimo(A);
      if (Math.abs(o.b / o.y - 2) > 0.01) throw new Error(`con A=${A} sale b/y = ${o.b / o.y}`);
    }
    cuadra(id, 'La relación entre ancho y calado', optimo(8).b / optimo(8).y);
  });

  it('y con ocho metros cuadrados el radio hidráulico es 1', () => {
    const o = optimo(8);
    cuadra(id, 'Un canal óptimo de ocho metros cuadrados', 8 / o.P);
  });
});

describe('8 · la red con un depósito que alimenta', () => {
  const id = 'exflu2223-ord-8-la-red-con-un-deposito-que-alimenta';
  const gamma = 0.93 * GAMMA;
  const nu = 1.47e-6;
  const epsForjado = 6e-5;
  const epsPVC = 7e-6;
  const perdida = (L: number, D: number, Q: number, eps: number) => {
    const v = Q / area(D);
    return colebrook((v * D) / nu, eps / D) * (L / D) * ((v * v) / (2 * G));
  };

  /* Los conductos 0 y 1 tienen el mismo diámetro, así que no hay término
     cinético: la altura de la bomba es la diferencia de las dos lecturas, con
     el vacuómetro **sumando**. */
  const Hm = (420000 + 0.322 * 13600 * G) / gamma;
  const Q1 = (7000 * 0.66) / (gamma * Hm);

  it('la bomba da 50,79 m', () => cuadra.magnitud(id, 'La altura manométrica de la bomba', Hm, 'm'));

  it('y mueve 9,98 l/s', () => cuadra.magnitud(id, 'El caudal que pasa por la bomba', Q1 * 1000, 'l/s'));

  const alturaNudo = 15 + Hm - perdida(52, 0.125, Q1, epsForjado);
  const alturaB = 40 + (32 * GAMMA) / gamma;

  it('y el depósito B aporta 8,30 l/s en vez de recibirlos', () => {
    /* Lo que decide no es la cota: B está veinticinco metros por encima del
       nudo, pero además su manómetro le añade otros treinta y cuatro. Se
       comprueba el signo antes de resolver. */
    if (!(alturaB > alturaNudo)) throw new Error('B recibiría caudal en vez de aportarlo');
    const Q3 = raiz((q) => perdida(22, 0.05, q, epsForjado) - (alturaB - alturaNudo), 1e-5, 0.05);
    cuadra.magnitud(id, 'El caudal que aporta el depósito B', Q3 * 1000, 'l/s');
  });

  const Q3 = raiz((q) => perdida(22, 0.05, q, epsForjado) - (alturaB - alturaNudo), 1e-5, 0.05);
  const Q2 = Q1 + Q3;
  const vBoq = Q2 / area(0.05);

  it('y la boquilla está en la cota 60,42', () =>
    cuadra.magnitud(
      id,
      'La cota de la boquilla',
      alturaNudo - perdida(65, 0.175, Q2, epsPVC) - (1 + 0.1) * ((vBoq * vBoq) / (2 * G)),
      'm',
    ));

  it('y el chorro sale a 0,403 bar de presión dinámica', () =>
    cuadra(id, 'La presión dinámica del chorro', (0.5 * 930 * vBoq * vBoq) / 1e5));
});

describe('9 · el circuito cerrado de filtrado', () => {
  const id = 'exflu2223-ord-9-el-circuito-cerrado-de-filtrado';
  const D = 0.25;

  it('el acero galvanizado a 250 mm cae en la banda de 130', () => {
    /* **La tabla la publica el propio tema 19**, y asigna el coeficiente por
       bandas de rugosidad relativa, no por material. Se lee de ahí y se busca
       la banda que contiene a este tubo: si el tema la cambiara, esto se
       pondría rojo.
       Acero galvanizado: ε = 0,015 cm, la misma que usa el corpus en el
       tercer parcial de 2020-2021. */
    cuadra(id, 'El coeficiente de Hazen-Williams', coeficienteHW(1.5e-4 / D));
  });

  /* Longitud total: los tres tramos más el metro equivalente de la válvula. */
  const rozamiento = hazenWilliams(10 + 5 + 25 + 1, 1e-3, D, 130) / 1e-3 ** 1.852;
  const filtro = (5 * (1 / area(D)) ** 2) / (2 * G);

  it('el término de rozamiento lleva 1,267·10⁻⁴', () =>
    cuadra(id, 'El término de rozamiento de la curva', (rozamiento / 1000 ** 1.852) * 1e4));

  it('y el del filtro, 1,059·10⁻⁴', () => cuadra(id, 'El término del filtro', (filtro / 1e6) * 1e4));

  const instalacion = (Q: number) => (rozamiento / 1000 ** 1.852) * Q ** 1.852 + (filtro / 1e6) * Q * Q;
  const bomba = (Q: number) => 30 - 3.5e-4 * Q * Q;
  const Q0 = raiz((Q) => bomba(Q) - instalacion(Q), 1, 500);

  it('y el punto de funcionamiento son 242 l/s', () => {
    /* El circuito es cerrado: sale y vuelve al mismo depósito, así que la
       altura geométrica es cero y la curva de la instalación arranca en el
       origen. Y por eso presurizar el depósito no cambiaría nada. */
    if (Math.abs(instalacion(0)) > 1e-12) throw new Error('la curva no arranca en el origen');
    cuadra.magnitud(id, 'El punto de funcionamiento', Q0, 'l/s');
  });

  it('y la bomba da ahí 9,496 m', () => cuadra.magnitud(id, 'La altura del punto de funcionamiento', bomba(Q0), 'm'));
});
