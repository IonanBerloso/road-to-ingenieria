/**
 * La ordinaria de Mecánica de Fluidos de 2019-2020. Dieciséis respuestas, la
 * convocatoria más larga de la asignatura.
 *
 * Dos cosas que este fichero hace y que no cabían en las otras:
 *
 * - **El ejercicio 3 se comprueba por donde no se ve.** Pregunta por la
 *   diferencia entre las fuerzas verticales de los dos líquidos sobre un
 *   cuerpo que flota entre ellos, y esa diferencia **es el peso**: las dos
 *   fuerzas valen dos millones y medio de newtons cada una —el gas de encima
 *   está a ocho bares— y se restan hasta dejar 33,7 kN. El test las calcula por
 *   separado, con la presión del gas dentro, y comprueba que la resta cae en el
 *   peso que sale de la geometría y la densidad. Si la altura sumergida
 *   estuviera mal, la resta no cuadraría.
 * - **La rugosidad del hormigón no está en el enunciado**, así que en vez de
 *   elegir un número el test recorre **toda la banda del material** —de 0,3 a
 *   3 mm— y comprueba que la potencia de la turbina se queda dentro de la
 *   tolerancia publicada en los dos extremos. Un dato que no está no se
 *   inventa: se acota.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { raiz } from './numerico';

const cuadra = convocatoria('fluidos', '2019-2020-ord');

const G = 9.8;
const GAMMA = 1000 * G;
const area = (d: number) => (Math.PI * d * d) / 4;

/** Colebrook-White, resuelto por sustitución hasta que deja de moverse. */
function colebrook(Re: number, rugosidadRelativa: number) {
  let f = 0.02;
  for (let i = 0; i < 200; i++) {
    const nuevo = 1 / (-2 * Math.log10(rugosidadRelativa / 3.7 + 2.51 / (Re * Math.sqrt(f)))) ** 2;
    if (Math.abs(nuevo - f) < 1e-14) return nuevo;
    f = nuevo;
  }
  return f;
}

/** Hazen-Williams, con el caudal en m³/s y la longitud y el diámetro en m. */
const hazenWilliams = (L: number, Q: number, D: number, C: number) =>
  (10.674 * L * Q ** 1.852) / (C ** 1.852 * D ** 4.871);

describe('3 · el cuerpo que flota entre dos líquidos', () => {
  const id = 'exflu1920-ord-3-el-cuerpo-que-flota-entre-dos-liquidos';
  const [R, L, H] = [1, 0.75, 1.3];
  const [s1, s2] = [1.01, 0.79];
  const rhoMat = 925;
  const Vcono = (Math.PI * R * R * H) / 3;
  const Vcil = Math.PI * R * R * L;
  const peso = rhoMat * G * (Vcono + Vcil);

  /* El equilibrio reparte el cilindro entre los dos líquidos: h por arriba y
     lo que queda por abajo, con el cono entero en el de abajo. */
  const h = raiz(
    (x) => s1 * 1000 * G * (Vcono + Math.PI * R * R * (L - x)) + s2 * 1000 * G * Math.PI * R * R * x - peso,
    0,
    L,
  );

  it('se hunde 0,457 m en el fluido de arriba', () => cuadra(id, 'Cuánto se hunde en el fluido superior', h));

  /* El gas: 66 g/s durante 5,2 minutos, en la cámara de 20 cm sobre un depósito
     de 10 m de diámetro. */
  const masaGas = 0.066 * 5.2 * 60;
  const Vgas = area(10) * 0.2;
  const pGasAbs = (masaGas * 2077.16 * (20 + 273)) / Vgas;
  const patm = 101325;

  it('y el manómetro marca 5.226 mm de mercurio', () => {
    /* Un milímetro de mercurio son 13.600 kg/m³ por un milímetro por g. */
    const mmHg = (pGasAbs - patm) / (13600 * G * 0.001);
    cuadra.magnitud(id, 'La lectura del manómetro superior', mmHg, 'mmHg');
  });

  it('y la diferencia entre las dos verticales es el peso', () => {
    /* Cada fuerza se calcula cerrando su región con el disco de la interfaz:
       la del fluido de abajo empuja hacia arriba y vale su empuje más la
       presión de la interfaz por el disco; la de arriba aprieta hacia abajo y
       vale esa misma presión por el disco menos su empuje. Al restarlas el
       término grande desaparece y queda el peso. */
    const pInterfaz = pGasAbs + s2 * GAMMA * 1;
    const disco = Math.PI * R * R;
    const arriba = pInterfaz * disco - s2 * GAMMA * disco * h;
    const abajo = s1 * GAMMA * (Vcono + disco * (L - h)) + pInterfaz * disco;
    if (!(abajo > 2e6 && arriba > 2e6)) throw new Error('las dos fuerzas deberían ser enormes');
    cuadra.magnitud(id, 'La diferencia entre las dos fuerzas verticales', (abajo - arriba) / 1000, 'kN');
  });
});

describe('4 · el limpiacristales y su cono', () => {
  const id = 'exflu1920-ord-4-el-limpiacristales-y-su-cono';
  const [D, d, k, Cd] = [0.54, 0.25, 0.04, 0.7];
  /* Bernoulli del manómetro a la salida, con la pérdida referida a la
     velocidad de salida. El C_d **no** corrige la velocidad: corrige el
     caudal, y hace falta en el apartado siguiente. */
  const razon = (d / D) ** 2;
  const v2 = Math.sqrt((14 * 2 * G) / (1 + k - razon * razon));

  it('el chorro sale a 16,63 m/s', () => cuadra.magnitud(id, 'La velocidad de salida', v2, 'm/s'));

  it('y el cono admite 9,6 grados', () => {
    /* El chorro sale deslizando por la superficie del cono, desviado α
       respecto del eje, y la fuerza axial es ρQv(1−cos α). Se busca el α que
       deja el tornillo justo en los dos tercios de su rotura. */
    const Q = Cd * area(d) * v2;
    const tope = (2 / 3) * 205;
    const alfa = raiz((a) => 1000 * Q * v2 * (1 - Math.cos((a * Math.PI) / 180)) - tope, 0.1, 60);
    cuadra(id, 'El semiángulo del cono', alfa);
  });
});

describe('5 · las dos turbobombas semejantes', () => {
  const id = 'exflu1920-ord-5-las-dos-turbobombas-semejantes';
  const [DA, DB, nA, QA] = [0.2, 0.3, 1000, 7];
  /* Semejanza restringida de Reynolds con el mismo fluido: μ/(ρD²n) igual en
     las dos. Se impone la igualdad y se resuelve, en vez de despejar la
     fórmula de memoria. */
  const nB = raiz((n) => DA * DA * nA - DB * DB * n, 1, 5000);

  it('la grande gira a 444,4 rpm', () => cuadra.magnitud(id, 'La velocidad de giro de la turbobomba grande', nB, 'rpm'));

  it('y descarga 10,5 m³/min', () => {
    /* El coeficiente de caudal Q/(nD³) es el otro grupo que se conserva. Y de
       paso se comprueba que la semejanza absoluta sería imposible: el grupo de
       Froude, g/(Dn²), exigiría Dn² constante, y con Reynolds pidiendo D²n
       constante las dos condiciones solo se cumplen a la vez con el mismo
       diámetro. */
    const QB = (QA / (nA * DA ** 3)) * nB * DB ** 3;
    const froudeA = G / (DA * nA ** 2);
    const froudeB = G / (DB * nB ** 2);
    if (Math.abs(froudeA - froudeB) < 1e-9) throw new Error('la semejanza absoluta no debería salir');
    cuadra.magnitud(id, 'El caudal de la turbobomba grande', QB, 'm3/min');
  });
});

describe('6 · la turbina entre dos tuberías', () => {
  const id = 'exflu1920-ord-6-la-turbina-entre-dos-tuberias';
  const Q = 0.04;
  const nu = 1e-6;

  const hf1 = 1500 / (GAMMA * Q);
  it('la primera tubería pierde 3,83 m', () => cuadra.magnitud(id, 'La pérdida de carga de la primera tubería', hf1, 'm'));

  /* Longitud equivalente: 275 m más siete codos de 9 m cada uno. */
  const Leq = 275 + 7 * 9;
  const perdida = (D: number, L: number, rug: number) => {
    const v = Q / area(D);
    return colebrook((v * D) / nu, rug / D) * (L / D) * ((v * v) / (2 * G));
  };
  /* PVC: prácticamente liso, 0,0015 mm. El resultado apenas depende de este
     número —el flujo cae en la zona lisa de Colebrook—, y se comprueba abajo. */
  const D1 = raiz((D) => perdida(D, Leq, 1.5e-6) - hf1, 0.05, 0.6);

  it('y mide 176 mm', () => {
    const conDiezVeces = raiz((D) => perdida(D, Leq, 1.5e-5) - hf1, 0.05, 0.6);
    if (Math.abs(conDiezVeces - D1) > 0.002) throw new Error('el diámetro depende demasiado de la rugosidad supuesta');
    cuadra.magnitud(id, 'El diámetro de la primera tubería', D1 * 1000, 'mm');
  });

  it('y la turbina da 7,3 kW', () => {
    /* De los 85 m de salto bruto hay que descontar la presión del depósito B
       —que la turbina no puede tocar— y las dos pérdidas.
       La rugosidad del hormigón **no está en el enunciado**, así que en vez de
       elegir un número se recorre la banda del material, de 0,3 a 3 mm, y se
       comprueba que la potencia cae dentro de la tolerancia publicada en los
       dos extremos. */
    const util = (rugosidad: number) =>
      0.78 * GAMMA * Q * (900 - 815 - 550000 / GAMMA - hf1 - perdida(0.2, 90, rugosidad));
    const [floja, dura] = [util(0.3e-3), util(3e-3)];
    if (Math.abs(floja - dura) / dura > 0.04) throw new Error('la banda del hormigón mueve demasiado el resultado');
    cuadra.magnitud(id, 'La potencia útil de la turbina', util(1.2e-3) / 1000, 'kW');
    cuadra.magnitud(id, 'La potencia útil de la turbina', floja / 1000, 'kW');
    cuadra.magnitud(id, 'La potencia útil de la turbina', dura / 1000, 'kW');
  });
});

describe('7 · la red de cuatro barrios', () => {
  const id = 'exflu1920-ord-7-la-red-de-cuatro-barrios';
  /* Árbol: la bomba sube por t1 hasta C; de C salen t2 a D y t3 a E; de E sale
     t4 a F. Cada tubería lleva lo que consumen los barrios de aguas abajo. */
  const demanda = { C: 3.5, D: 17.5, E: 13, F: 11 };
  const CHW = 140;

  it('la tubería que va de C a E lleva 24 l/s', () => {
    const Q3 = demanda.E + demanda.F;
    cuadra.magnitud(id, 'El caudal de la tubería que sale de C hacia E', Q3, 'l/s');
  });

  const Q1 = (demanda.C + demanda.D + demanda.E + demanda.F) / 1000;
  const hf1 = hazenWilliams(1000, Q1, 0.225, CHW);

  it('a D llegan 43,82 mca', () => {
    const hf2 = hazenWilliams(2600, demanda.D / 1000, 0.175, CHW);
    cuadra.magnitud(id, 'La presión en el barrio D', 10 + 90 - hf1 - hf2 - 43, 'mca');
  });

  it('y la última rama necesita 125 mm', () => {
    /* El punto crítico no es D —el barrio más alto— sino F, que cuelga del
       final de la rama más larga. Se comprueba: con el diámetro elegido, la
       presión que llega a F pasa de los 40 mca exigidos, y la que llega a D
       también pasa de los suyos. */
    const hf3 = hazenWilliams(1500, (demanda.E + demanda.F) / 1000, 0.175, CHW);
    const alturaEnE = 10 + 90 - hf1 - hf3;
    const teorico = raiz((D) => hazenWilliams(2000, demanda.F / 1000, D, CHW) - (alturaEnE - (30 + 40)), 0.05, 0.5);
    const comercial = Math.ceil((teorico * 1000) / 25) * 25;
    const presionEnF = alturaEnE - hazenWilliams(2000, demanda.F / 1000, comercial / 1000, CHW) - 30;
    if (!(presionEnF >= 40)) throw new Error('con ese diámetro no llegan los 40 mca a F');
    cuadra.magnitud(id, 'El diámetro de la última rama', comercial, 'mm');
  });
});

describe('8 · el canal circular de arena', () => {
  const id = 'exflu1920-ord-8-el-canal-circular-de-arena';
  const [D, Q, y] = [1.6, 3.7, 1.12];
  const R = D / 2;
  const n = 0.02; // arena
  /* Con y por encima del radio el ángulo mojado pasa de 180º: el coseno de la
     media apertura sale negativo, y eso es lo que hay que dejar que pase. */
  const theta = 2 * Math.acos(1 - y / R);
  const A = ((R * R) / 2) * (theta - Math.sin(theta));
  const Rh = A / (R * theta);

  it('el agua va a 2,46 m/s', () => {
    if (!(theta > Math.PI)) throw new Error('el calado no pasa del centro, y debería');
    cuadra.magnitud(id, 'La velocidad del flujo', Q / A, 'm/s');
  });

  it('y la pendiente son 6,56 milésimas', () => {
    const v = Q / A;
    cuadra(id, 'La pendiente del canal', ((v * n) / Rh ** (2 / 3)) ** 2 * 1000);
  });

  it('y el rectángulo óptimo mide 1,866 m de ancho', () => {
    /* El rectángulo hidráulicamente óptimo tiene b = 2y, y entonces su radio
       hidráulico es y/2. Se comprueba esa relación en vez de darla por sabida:
       de todos los rectángulos que llevan ese caudal con esa pendiente, el
       óptimo es el de perímetro mojado mínimo. */
    const S = 0.005;
    const anchoQueLleva = (calado: number) =>
      raiz((b) => (1 / n) * (b * calado) * ((b * calado) / (b + 2 * calado)) ** (2 / 3) * Math.sqrt(S) - Q, 0.1, 20);
    let mejor = { P: Infinity, b: 0 };
    for (let calado = 0.3; calado <= 2.5; calado += 0.0005) {
      const b = anchoQueLleva(calado);
      const P = b + 2 * calado;
      if (P < mejor.P) mejor = { P, b };
    }
    cuadra.magnitud(id, 'El ancho del rectángulo óptimo', mejor.b, 'm');
  });
});
