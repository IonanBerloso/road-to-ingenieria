/**
 * La extraordinaria de Mecánica de Fluidos de 2021-2022. Once respuestas en
 * ocho ejercicios cortos.
 *
 * El primero es el mejor ejemplo del corpus de **un cálculo que sale «mal» y
 * por eso enseña**: modelar el ascenso de la savia como capilaridad pura exige
 * vasos de una micra, y los del xilema miden entre veinte y quinientas. El
 * modelo no falla por aritmética: falla porque falta física. El test lo deja
 * escrito comparando el diámetro que sale con el rango real.
 *
 * Y el 5 pone número a por qué la semejanza absoluta casi nunca se puede: con
 * Froude y Reynolds a la vez y la misma gravedad, un modelo a escala 1:10
 * necesitaría un fluido con la trigésima parte de la viscosidad cinemática del
 * prototipo. El test comprueba que ni el mercurio llega.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { raiz } from './numerico';

const cuadra = convocatoria('fluidos', '2021-2022-ext');

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

describe('1 · la savia que sube treinta metros', () => {
  it('el vaso tendría que medir una micra', () => {
    /* Jurin con mojado perfecto, porque el enunciado dice que la cohesión es
       despreciable frente a la adhesión. La conversión de dinas por centímetro
       es donde más se falla: 1 dyn/cm son 10⁻³ N/m. */
    const sigma = 73.49 * 1e-3;
    const D = (4 * sigma) / (9810 * 30);
    /* Y la lección: los vasos reales del xilema van de 20 a 500 micras, así
       que la capilaridad sola subiría la savia unos centímetros. */
    if (!(D * 1e6 < 20)) throw new Error('el diámetro cabría en un vaso real, y el modelo no fallaría');
    cuadra('exflu2122-ext-1-la-savia-que-sube-treinta-metros', 'El diámetro del vaso', D * 1000);
  });
});

describe('2 · los tres coches y una sola bomba', () => {
  const id = 'exflu2122-ext-2-los-tres-coches-y-una-sola-bomba';
  const cilindros = [
    { nombre: 'A', m: 1650, D: 0.1 },
    { nombre: 'B', m: 1750, D: 0.08 },
    { nombre: 'C', m: 1900, D: 0.15 },
  ];
  const necesaria = (c: { m: number; D: number }) => (c.m * G) / area(c.D);

  it('el cilindro C arranca a 10,54 bar, y es el primero', () => {
    /* Los tres comparten bomba, así que comparten presión: sube el que menos
       necesita. Y lo que manda no es el peso sino el peso partido por la
       sección — el coche más pesado sube **primero**. */
    const orden = [...cilindros].sort((a, b) => necesaria(a) - necesaria(b));
    if (orden[0].nombre !== 'C') throw new Error(`el primero sale ${orden[0].nombre}`);
    if (orden[0].m !== Math.max(...cilindros.map((c) => c.m)))
      throw new Error('el primero no es el más pesado, y en este enunciado lo es');
    cuadra(id, 'La presión que necesita el cilindro C', necesaria(orden[0]) / 1e5);
  });

  it('y el manómetro E marca 10,79 bar', () => {
    /* El manómetro está en la cota 0,5 y el pistón, al final de su carrera de
       2 m, en la 3,5. Los tres metros de aceite se suman. */
    const columna = 0.85 * GAMMA * (1.5 + 2 - 0.5);
    cuadra(id, 'La lectura del manómetro E', (necesaria(cilindros[2]) + columna) / 1e5);
  });
});

describe('3 · el balancín en dos fluidos', () => {
  const id = 'exflu2122-ext-3-el-balancin-en-dos-fluidos';
  const [L, b, diam] = [1, 3, 1.1];
  const [s1, s2, rhoMat] = [1.4, 2.1, 873.76];
  /* Prisma triangular equilátero de lado L y profundidad b, y esfera. */
  const Vprisma = ((Math.sqrt(3) / 4) * L * L) * b;
  const Vesfera = (4 / 3) * Math.PI * (diam / 2) ** 3;
  /* Cada cuerpo tira de su brazo con su peso menos su empuje. Los dos son del
     mismo material pero están en fluidos distintos, y por eso los dos brazos
     no salen iguales. */
  const tira = (V: number, s: number) => (rhoMat - s * 1000) * G * V;

  it('la relación de brazos es 1,25', () => {
    /* Los dos empujes ganan al peso, así que los dos cuerpos tiran hacia
       arriba: se comprueba, porque si uno bajara el balancín no equilibraría
       con brazos positivos. */
    if (!(tira(Vprisma, s1) < 0 && tira(Vesfera, s2) < 0))
      throw new Error('alguno de los dos cuerpos se hundiría');
    cuadra(id, 'La relación de brazos', tira(Vesfera, s2) / tira(Vprisma, s1));
  });

  it('y el fluido 1 empuja al prisma con 17,82 kN', () => {
    /* Completamente sumergido: la resultante hidrostática es el empuje. */
    cuadra.magnitud(id, 'La fuerza hidrostática sobre el prisma', (s1 * GAMMA * Vprisma) / 1000, 'kN');
  });
});

describe('4 · la derivación en Y', () => {
  const id = 'exflu2122-ext-4-la-derivacion-en-y';
  const rho = 1500;
  const secciones = [
    { D: 0.5, Q: 1800 / 3600, dir: [0, 1] },
    { D: 0.15, Q: 250 / 3600, dir: [Math.sin(Math.PI / 3), Math.cos(Math.PI / 3)] },
    { D: 0.3, Q: (1800 - 250) / 3600, dir: [-Math.sin(Math.PI / 4), Math.cos(Math.PI / 4)] },
  ];
  const v = secciones.map((s) => s.Q / area(s.D));
  /* La pieza está en un plano horizontal, así que Bernoulli se queda en
     presión más altura cinética y el peso no interviene. */
  const p1 = 50 * GAMMA;
  const presion = (i: number) => p1 + (rho * (v[0] ** 2 - v[i] ** 2)) / 2;

  it('la salida 3 está a 4,67 bar', () => {
    /* Se lleva seis veces más caudal por una sección solo cuatro veces mayor,
       así que es la que más acelera y la que menos presión tiene. */
    if (!(presion(2) < presion(1))) throw new Error('la salida 3 debería tener menos presión que la 2');
    cuadra(id, 'La presión en la salida 3', presion(2) / 1e5);
  });

  it('y la pieza recibe 67,52 kN en vertical', () => {
    /* Volumen de control cortando las tres bridas: las presiones empujan
       siempre hacia dentro, y la diferencia con el flujo de cantidad de
       movimiento es lo que la pieza tiene que aguantar. */
    let porLasPresiones = p1 * area(secciones[0].D) * 1;
    for (const i of [1, 2]) porLasPresiones -= presion(i) * area(secciones[i].D) * secciones[i].dir[1];
    let porElChorro = -rho * secciones[0].Q * v[0];
    for (const i of [1, 2]) porElChorro += rho * secciones[i].Q * v[i] * secciones[i].dir[1];
    /* Y el reparto, que es lo que conviene mirar: la presión lo pone casi
       todo y la cantidad de movimiento resta poco más de una tonelada. */
    if (!(Math.abs(porElChorro) < 0.05 * porLasPresiones))
      throw new Error('el chorro pesa más de lo esperado en el balance');
    cuadra.magnitud(id, 'La componente vertical de la fuerza', (porLasPresiones - porElChorro) / 1000, 'kN');
  });
});

describe('5 · Reynolds y Froude en la Tierra', () => {
  it('el fluido del modelo tendría que ser 32 veces menos viscoso', () => {
    /* Con la misma gravedad, Froude fija la escala de velocidades en √λ, y
       entonces Reynolds pide que la viscosidad cinemática vaya como λ^{3/2}.
       Se despeja de las dos condiciones en vez de aplicar la fórmula. */
    const lambda = 1 / 10;
    const razonVelocidad = raiz((r) => r / Math.sqrt(lambda) - 1, 0.01, 10);
    const razonViscosidad = razonVelocidad * lambda;
    /* Con agua en el prototipo harían falta 3·10⁻⁸ m²/s, y ni el mercurio
       —de los menos viscosos que hay— baja de 1,1·10⁻⁷. */
    if (!(razonViscosidad * 1e-6 < 1.1e-7)) throw new Error('el mercurio serviría, y no sirve');
    cuadra('exflu2122-ext-5-reynolds-y-froude-en-la-tierra', 'La viscosidad que haría falta', razonViscosidad);
  });
});

describe('6 · los dos vertederos del mismo canal', () => {
  const id = 'exflu2122-ext-6-los-dos-vertederos-del-mismo-canal';
  const [L, Q] = [2, 2];

  it('sobre el de pared gruesa hay 0,467 m', () => {
    /* La ayuda del enunciado da el caudal ya maximizado en el calado crítico,
       que es y = 2h/3. Se comprueba: de todos los calados posibles sobre el
       umbral, el que más caudal deja pasar para esa carga es ese. */
    const h = raiz((x) => ((2 * x) / 3) * L * Math.sqrt(((2 * G) / 3) * x) - Q, 0.1, 5);
    let mejor = { Q: -1, y: 0 };
    for (let y = 0.01; y < h; y += 0.0001) {
      const q = L * y * Math.sqrt(2 * G * (h - y));
      if (q > mejor.Q) mejor = { Q: q, y };
    }
    if (Math.abs(mejor.y - (2 * h) / 3) > 0.002) throw new Error('el calado crítico no sale en 2h/3');
    cuadra(id, 'La lámina sobre el vertedero de pared gruesa', (2 * h) / 3);
  });

  it('y sobre el de pared delgada, 0,683 m', () => {
    /* Integrando la velocidad teórica sobre la lámina y corrigiendo con el
       coeficiente: la integral se hace de verdad, no se usa el 2/3. */
    const caudal = (h: number) => {
      let s = 0;
      const n = 200000;
      for (let k = 0; k < n; k++) s += Math.sqrt(2 * G * (h * (k + 0.5)) / n) * (h / n);
      return 0.6 * L * s;
    };
    cuadra(id, 'La lámina sobre el vertedero de pared delgada', raiz((h) => caudal(h) - Q, 0.1, 5));
  });
});

describe('7 · el diámetro que hay que despejar', () => {
  const id = 'exflu2122-ext-7-el-diametro-que-hay-que-despejar';
  const gamma = 1200 * G;
  const Q = 0.25;
  const nu = 2e-3 / 1200;

  const hf = 40000 / (gamma * Q) + 1e5 / gamma - 20;
  it('la conducción solo puede perder 2,11 m', () => {
    /* Y el rendimiento del 63 % **no entra**: los 40 kW ya son la potencia
       útil. Serviría para saber lo que la bomba absorbe de la red. */
    cuadra.magnitud(id, 'La pérdida de carga admisible', hf, 'm');
  });

  it('y hace falta un diámetro de 406 mm', () => {
    /* Dos metros de pérdida para trescientos de tubería ya avisan de que el
       diámetro va a salir grande. */
    const perdida = (D: number) => {
      const v = Q / area(D);
      return colebrook((v * D) / nu, 6e-5 / D) * (300 / D) * ((v * v) / (2 * G));
    };
    cuadra.magnitud(id, 'El diámetro exacto', raiz((D) => perdida(D) - hf, 0.1, 2) * 1000, 'mm');
  });
});

describe('8 · la cota máxima de la aspiración', () => {
  const id = 'exflu2122-ext-8-la-cota-maxima-de-la-aspiracion';
  const [D, Q] = [0.15, 2500 / 1000 / 60];
  const v = Q / area(D);
  const cinetica = (v * v) / (2 * G);
  /* Las dos longitudes equivalentes de los codos se suman al tramo recto; la
     válvula de pie va aparte, con su factor de paso. */
  const porLaTuberia = hazenWilliams(8 + 10 + 5, Q, D, 130);
  const porLaValvula = 3 * cinetica;

  it('la aspiración pierde 1,706 m', () => {
    /* La válvula de pie sola pierde tanto como los veintitrés metros de
       tubería: en una aspiración corta el problema son los accesorios. */
    if (Math.abs(porLaValvula / porLaTuberia - 1) > 0.1)
      throw new Error('la válvula y la tubería ya no pierden lo mismo');
    cuadra.magnitud(id, 'Las pérdidas de la aspiración', porLaTuberia + porLaValvula, 'm');
  });

  it('y la bomba no puede subir de 5,93 m', () => {
    /* Todo lo que puede levantar una aspiración es la presión barométrica del
       lugar, y de ahí se va descontando: lo que hay que reservar en la brida,
       lo que se pierde por el camino y la altura cinética. */
    const barometrica = (0.75 * 13600 * G) / GAMMA;
    const reserva = (0.12335e5 + 1e4) / GAMMA;
    cuadra.magnitud(id, 'La cota máxima de la bomba', barometrica - reserva - porLaTuberia - porLaValvula - cinetica, 'm');
  });
});
