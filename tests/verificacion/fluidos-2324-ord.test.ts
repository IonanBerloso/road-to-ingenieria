/**
 * La ordinaria de Mecánica de Fluidos de 2023-2024. Veintiuna respuestas en
 * ocho ejercicios.
 *
 * Esta convocatoria tiene el mejor par de casos límite del corpus, y están en
 * dos ejercicios seguidos. En el 2, una pieza con dos boquillas donde **el 99 %
 * de la fuerza la pone la presión** sobre la brida de entrada y todo el caudal
 * solo consigue inclinar la resultante 0,65 grados. En el 4 de la
 * extraordinaria de 2022-2023 —y en el álabe de una Pelton— la presión es
 * atmosférica en todas las caras, se cancela, y **todo** el esfuerzo lo pone la
 * cantidad de movimiento. Son los dos extremos del mismo teorema, y el test
 * mide el reparto en vez de darlo por sabido.
 *
 * Y el 6 es la comprobación de que la tabla de Hazen-Williams **va por
 * rugosidad relativa y no por material**: el mismo hierro galvanizado toma
 * C = 130 en la tubería de 150 mm y 120 en la de 125, porque ε/D cae en dos
 * bandas distintas. El test lo saca de la tabla del tema 19, igual que en la
 * ordinaria de 2022-2023.
 */
import { describe, it } from 'vitest';
import { coeficienteHW } from './tablas';
import { convocatoria } from './corpus';
import { raiz } from './numerico';

const cuadra = convocatoria('fluidos', '2023-2024-ord');

const G = 9.8;
const GAMMA = 1000 * G;
const area = (d: number) => (Math.PI * d * d) / 4;
function colebrook(Re: number, rugosidadRelativa: number) {
  let f = 0.02;
  for (let i = 0; i < 300; i++)
    f = 1 / (-2 * Math.log10(rugosidadRelativa / 3.7 + 2.51 / (Re * Math.sqrt(f)))) ** 2;
  return f;
}
const hazenWilliams = (L: number, Q: number, D: number, C: number) =>
  (10.674 * L * Q ** 1.852) / (C ** 1.852 * D ** 4.871);

describe('1 · la capilaridad entre dos tubos', () => {
  const id = 'exflu2324-ord-1-la-capilaridad-entre-dos-tubos';
  const [D, b] = [0.002, 0.003];
  /* Jurin no es una ley: es el equilibrio resuelto para un tubo circular. Lo
     general es σ·cosθ·P = γ·h·A, y aquí la sección es un cuadrado menos un
     círculo. */
  const perimetro = 4 * b + Math.PI * D;
  const seccion = b * b - area(D);

  it('el contorno mojado mide 18,28 mm', () => cuadra.magnitud(id, 'El perímetro mojado de la sección', perimetro * 1000, 'mm'));

  it('y el alcohol sube 1,334 mm', () => {
    const gamma = 790 * G;
    const h = (3.31e-3 * 1 * perimetro) / (gamma * seccion);
    /* Y la comparación que da sentido al número: en un tubo circular de 2 mm
       el mismo alcohol subiría bastante menos, porque su cociente
       perímetro/área es menor. */
    const enTuboRedondo = (3.31e-3 * (Math.PI * D)) / (gamma * area(D));
    if (!(h / enTuboRedondo > 1.5)) throw new Error('el hueco no amplifica lo que debería');
    cuadra.magnitud(id, 'El ascenso capilar', h * 1000, 'mm');
  });
});

describe('2 · la pieza con dos boquillas', () => {
  const id = 'exflu2324-ord-2-la-pieza-con-dos-boquillas';
  const [pA, dA, dB, vA] = [13.5e5, 0.125, 0.01, 0.8];
  /* Sin pérdidas ni cotas, la velocidad de salida depende de la carga y no del
     diámetro: es la misma en las dos boquillas, y por eso el enunciado puede
     permitirse no dar el diámetro de C. */
  const v = Math.sqrt(2 * G * (pA / GAMMA + (vA * vA) / (2 * G)));
  const QA = vA * area(dA);
  const QB = 0.6 * area(dB) * v;
  const QC = QA - QB;

  it('los chorros salen a 51,97 m/s', () => cuadra.magnitud(id, 'La velocidad de salida', v, 'm/s'));

  it('y por B se van 2,449 l/s', () => cuadra.magnitud(id, 'El caudal por la boquilla B', QB * 1000, 'l/s'));

  /* Balance con el eje x en el sentido de entrada. B lanza hacia delante; C,
     hacia atrás y hacia abajo a 60° de la vertical. */
  const dirC = [-Math.sin(Math.PI / 3), -Math.cos(Math.PI / 3)];
  const Rx = -(pA * area(dA)) + (1000 * QB * v * 1 + 1000 * QC * v * dirC[0] - 1000 * QA * vA);
  const Ry = 1000 * QC * v * dirC[1];

  it('la pieza soporta 16,78 kN', () => {
    /* El reparto es la lección: la presión sobre la brida pone 16.567 N y los
       tres términos de cantidad de movimiento juntos, poco más de 200. */
    if (!(pA * area(dA) > 0.95 * Math.hypot(Rx, Ry))) throw new Error('la presión no domina como debería');
    cuadra.magnitud(id, 'El módulo de la fuerza', Math.hypot(Rx, Ry), 'N');
  });

  it('y la resultante se inclina 0,65 grados', () =>
    cuadra(id, 'La inclinación de la resultante', (Math.atan(Math.abs(Ry / Rx)) * 180) / Math.PI));
});

describe('3 · los dos manómetros y el que miente', () => {
  const id = 'exflu2324-ord-3-los-dos-manometros-y-el-que-miente';
  const [s1, s2, s3] = [1.2, 13.6, 8];
  const [h1, h2, h3] = [0.6, 0.4, 1.5];
  const pA = 3.57 * 98000;
  /* Bajar por el líquido de A suma; los dos tramos siguientes ascienden, así
     que restan. */
  const pB = pA + s1 * GAMMA * h1 - s2 * GAMMA * h2 - s3 * GAMMA * h3;

  it('el aire de B está a 1,86 bar', () => cuadra.magnitud(id, 'La presión absoluta del aire de B', pB / 1e5, 'bar'));

  /* Los dos manómetros redundantes están **dentro** de la cámara, así que cada
     uno da una presión de cámara distinta. El desempate lo pone un tercer
     camino independiente: el manómetro en U contra el exterior. */
  const exterior = 0.4 * 13600 * G;
  const candidatos = [1.16e5, 1.54e5].map((lectura) => pB - lectura);
  const buenos = candidatos.filter((p) => p > exterior);

  it('y la cámara está a 0,70 bar, que es la lectura que no da un peso negativo', () => {
    if (buenos.length !== 1) throw new Error(`sobreviven ${buenos.length} candidatos, y debería ser uno`);
    cuadra.magnitud(id, 'La presión de la cámara', buenos[0] / 1e5, 'bar');
  });

  it('y el líquido del tubo en U tiene s = 4,3', () =>
    cuadra(id, 'La densidad del líquido manométrico', (buenos[0] - exterior) / 0.396 / GAMMA));
});

describe('4 · la compuerta ABC con vacuómetro', () => {
  const id = 'exflu2324-ord-4-la-compuerta-abc-con-vacuometro';
  const gamma = 1.5 * GAMMA;
  const b = 2;
  const R = 2.5 / 2;
  /* Cotas medidas hacia abajo desde A: la lámina en 1, C en 5,5. El vacuómetro
     marca 14,7 kPa de depresión sobre el aire. */
  const vacio = 14.7e3;
  const presion = (z: number) => (z <= 1 ? -vacio : -vacio + gamma * (z - 1));

  it('el plano de presión nula cae 1 m bajo la lámina', () =>
    cuadra.magnitud(id, 'La profundidad del plano piezométrico', raiz(presion, 1, 5.5) - 1, 'm'));

  it('y la horizontal son 135,98 kN', () => {
    /* El prisma no es un triángulo: son tres trozos, y el del aire es un
       rectángulo negativo. Se integra la presión sobre la proyección vertical
       entera, que es lo que evita los dos errores del 10 % que el ejercicio
       castiga. */
    let F = 0;
    const n = 500000;
    for (let k = 0; k < n; k++) F += presion((5.5 * (k + 0.5)) / n) * (5.5 / n) * b;
    cuadra.magnitud(id, 'La componente horizontal', F / 1000, 'kN');
  });

  const vertical = gamma * b * ((Math.PI * R * R) / 2);

  it('y la vertical, 72,16 kN, sin que el vacuómetro pinte nada', () => {
    /* Las dos mitades del semicírculo son simétricas respecto de su centro, así
       que cualquier presión **uniforme** se cancela: solo queda el empuje del
       volumen. Se comprueba integrando con dos vacíos distintos. */
    const conOtroVacio = (v2: number) => {
      let Fz = 0;
      const n = 200000;
      for (let k = 0; k < n; k++) {
        const th = -Math.PI / 2 + (Math.PI * (k + 0.5)) / n;
        const z = 3 + 1.25 + R * Math.sin(th);
        const p = -v2 + gamma * (z - 1);
        Fz += p * Math.sin(th) * R * (Math.PI / n) * b;
      }
      return Fz;
    };
    if (Math.abs(conOtroVacio(vacio) - conOtroVacio(0)) > 1) throw new Error('el vacío sí influye, y no debería');
    if (Math.abs(conOtroVacio(vacio) - vertical) / vertical > 1e-4) throw new Error('la integral no cuadra con el empuje');
    cuadra.magnitud(id, 'La componente vertical', vertical / 1000, 'kN');
  });

  it('y el tope aguanta 128,68 kN', () => {
    /* Momentos respecto de A. La vertical resta, porque su brazo la lleva
       hacia el fluido, y su centroide es el del semicírculo. */
    let momentoH = 0;
    const n = 500000;
    for (let k = 0; k < n; k++) {
      const z = (5.5 * (k + 0.5)) / n;
      momentoH += presion(z) * (5.5 / n) * b * z;
    }
    const brazoV = (4 * R) / (3 * Math.PI);
    cuadra.magnitud(id, 'La reacción en el tope', (momentoH - vertical * brazoV) / 5.5 / 1000, 'kN');
  });
});

describe('5 · el tiempo de vaciado', () => {
  const id = 'exflu2324-ord-5-el-tiempo-de-vaciado';
  const [a, b, alto, dO, h0, k] = [0.3, 0.25, 1, 0.025, 0.2, 0.11];
  /* La carga se mide **desde el orificio**: el agua que queda por debajo no
     participa. */
  const bajada = (alto * a * b) / 4 / (a * b);
  const cargaInicial = alto - h0;
  const cargaFinal = cargaInicial - bajada;

  it('tras el primer cuarto quedan 0,55 m de carga', () => {
    if (Math.abs(cargaInicial - 0.8) > 1e-12) throw new Error('la carga inicial no son 0,8 m');
    cuadra.magnitud(id, 'La carga al empezar y al acabar el primer cuarto', cargaFinal, 'm');
  });

  it('y el coeficiente de contracción es 0,695', () => {
    /* El factor de paso da el de velocidad, y el tiempo medido da el producto:
       de ahí sale el de contracción. */
    const cv = 1 / Math.sqrt(1 + k);
    const tiempo = (cc: number) =>
      (2 * a * b * (Math.sqrt(cargaInicial) - Math.sqrt(cargaFinal))) / (cv * cc * area(dO) * Math.sqrt(2 * G));
    const cc = raiz((x) => tiempo(x) - 16, 0.1, 1);
    /* Y el apartado (b), comprobado con números: el segundo cuarto tarda más,
       porque la lámina está más baja y el caudal es menor. */
    const segundo =
      (2 * a * b * (Math.sqrt(cargaFinal) - Math.sqrt(cargaFinal - bajada))) / (cv * cc * area(dO) * Math.sqrt(2 * G));
    if (!(segundo > 16)) throw new Error('el segundo cuarto debería tardar más');
    cuadra(id, 'El coeficiente de contracción', cc);
  });
});

describe('6 · la bomba deducida de dos puntos', () => {
  const id = 'exflu2324-ord-6-la-bomba-deducida-de-dos-puntos';
  const desnivel = 24 - -6;

  it('el término independiente son 30 m', () => cuadra.magnitud(id, 'La altura piezométrica', desnivel, 'm'));

  /* Los cinco factores de paso, cada uno con la altura cinética de su tramo. */
  const menores = (Q: number) =>
    ((2.5 + 0.05) * (Q / 1000 / area(0.15)) ** 2 + (3 * 0.75 + 0.19 + 1) * (Q / 1000 / area(0.125)) ** 2) / (2 * G);
  /* Y el rozamiento. El mismo hierro galvanizado —ε = 0,015 cm— cae en dos
     bandas distintas de la tabla del tema 19 según el diámetro, y eso es lo
     que hace valioso el ejercicio. */
  const rozamiento = (Q: number) =>
    hazenWilliams(15, Q / 1000, 0.15, coeficienteHW(1.5e-4 / 0.15)) +
    hazenWilliams(50, Q / 1000, 0.125, coeficienteHW(1.5e-4 / 0.125));
  const instalacion = (Q: number) => desnivel + menores(Q) + rozamiento(Q);

  it('y a 80 l/s la instalación pide 59,52 m', () => {
    if (coeficienteHW(1.5e-4 / 0.15) === coeficienteHW(1.5e-4 / 0.125))
      throw new Error('las dos tuberías caen en la misma banda, y el ejercicio dice que no');
    cuadra.magnitud(id, 'La altura de la instalación en el punto de funcionamiento', instalacion(80), 'm');
  });

  it('y la bomba arranca en 73,41 m a caudal nulo', () => {
    /* Lo que rara vez se hace: en vez de leer la curva de un catálogo, se
       deduce de **dos puntos de funcionamiento**. Cerrar la válvula sube la
       instalación 8 m a todo caudal, y el nuevo corte está en la misma curva
       de la bomba que el viejo. */
    const [Q1, Q2] = [80, 72];
    const [H1, H2] = [instalacion(Q1), instalacion(Q2) + 8];
    const B = (H2 - H1) / (Q1 * Q1 - Q2 * Q2);
    cuadra.magnitud(id, 'La altura a caudal nulo de la bomba', H1 + B * Q1 * Q1, 'm');
  });

  it('y presurizando, el término independiente pasa a 38', () =>
    cuadra.magnitud(id, 'La curva al presurizar', desnivel + 8, 'm'));
});

describe('7 · el canal de Donostia a Barcelona', () => {
  const id = 'exflu2324-ord-7-el-canal-de-donostia-a-barcelona';

  it('el fenómeno tiene seis adimensionales', () => {
    /* Nueve variables —Q, D, μ, ρ, g, n, J, L y v— menos el rango de su matriz
       dimensional. La pendiente ya es adimensional y sale gratis; el n de
       Manning **no** lo es, y por eso necesita a v y L. */
    const dims: [number, number, number][] = [
      [0, 3, -1], // Q
      [0, 1, 0], // D
      [1, -1, -1], // mu
      [1, -3, 0], // rho
      [0, 1, -2], // g
      [0, -1 / 3, 1], // n, en s/m^{1/3}
      [0, 0, 0], // J
      [0, 1, 0], // L
      [0, 1, -1], // v
    ];
    const M = [0, 1, 2].map((i) => dims.map((d) => d[i]));
    let rango = 0;
    for (let col = 0, fila = 0; col < M[0].length && fila < M.length; col++) {
      const piv = M.findIndex((f, i) => i >= fila && Math.abs(f[col]) > 1e-9);
      if (piv < 0) continue;
      [M[fila], M[piv]] = [M[piv], M[fila]];
      for (let i = fila + 1; i < M.length; i++) {
        const k = M[i][col] / M[fila][col];
        for (let j = col; j < M[0].length; j++) M[i][j] -= k * M[fila][j];
      }
      fila++;
      rango++;
    }
    cuadra(id, 'Cuántos parámetros', dims.length - rango);
  });

  it('y haría falta un líquido 99 veces menos viscoso', () => {
    /* Reynolds y Froude a la vez con la misma gravedad: la escala de
       velocidades queda fijada por Froude y entonces Reynolds pide que la
       viscosidad vaya como la escala a la 3/2. */
    const lambda = 10 / 0.4675;
    cuadra(id, 'La relación de viscosidades que haría falta', lambda ** 1.5);
  });
});

describe('8 · el codo y su longitud equivalente', () => {
  const id = 'exflu2324-ord-8-el-codo-y-su-longitud-equivalente';
  const [D, L, s, mu] = [0.02, 0.75, 1.2, 7.2e-3];
  const nu = mu / (s * 1000);
  const eps = 1.2e-4; // fundición asfaltada

  /* El líquido manométrico es **más ligero** que el que circula, así que el
     menisco va arriba y la lectura se interpreta al revés. La diferencia de
     cota no interviene: un manómetro mide alturas piezométricas, que ya la
     llevan dentro. */
  const enElCodo = 0.3 * (1 - 1 / s);

  it('el codo se lleva 5 cm', () => cuadra.magnitud(id, 'La pérdida en el codo', enElCodo, 'm'));

  /* Y la conversión que decide el resultado: «1 mca» son metros de columna de
     **agua**, o sea una presión, y hay que pasarlos a columna del fluido. */
  const totalEnColumnaDelFluido = 1 / s;
  const enElTuboRecto = totalEnColumnaDelFluido - enElCodo;
  const perdidaRecta = (v: number) => colebrook((v * D) / nu, eps / D) * (L / D) * ((v * v) / (2 * G));
  const v = raiz((x) => perdidaRecta(x) - enElTuboRecto, 0.1, 20);

  it('y circula 1,027 l/s', () => {
    /* Sin convertir el mca saldrían 1,138 l/s: un 11 % de error que no se
       delata solo. */
    const sinConvertir = raiz((x) => perdidaRecta(x) - (1 - enElCodo), 0.1, 20) * area(D) * 1000;
    if (Math.abs(sinConvertir / (v * area(D) * 1000) - 1) < 0.05)
      throw new Error('la conversión no cambia lo suficiente como para ser la trampa que dice el enunciado');
    cuadra.magnitud(id, 'El caudal', v * area(D) * 1000, 'l/s');
  });

  it('y el codo equivale a 47,9 mm de tubo recto', () => {
    /* Longitud equivalente: la de tubo recto que perdería lo mismo, con el
       mismo factor de fricción y la misma velocidad. */
    const f = colebrook((v * D) / nu, eps / D);
    cuadra.magnitud(id, 'La longitud equivalente del codo', (enElCodo / ((f / D) * ((v * v) / (2 * G)))) * 1000, 'mm');
  });
});
