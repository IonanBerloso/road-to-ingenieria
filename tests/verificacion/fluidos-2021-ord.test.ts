/**
 * La ordinaria de Mecánica de Fluidos de 2020-2021. Dieciséis respuestas.
 *
 * El ejercicio 1 es el que más enseña de toda la asignatura y su moraleja no
 * es una fórmula: **la subpresión del terreno vale más que las dos fuerzas del
 * agua juntas**, y va hacia arriba. Le quita a la presa tres mil cuatrocientas
 * toneladas de peso efectivo. El test lo comprueba comparando los tres módulos
 * antes de publicar ninguno.
 *
 * Y el 8 pide **la misma tubería por dos métodos distintos** —Darcy-Weisbach
 * con la bomba apagada y Hazen-Williams con ella encendida—, que no es una
 * incoherencia del enunciado sino la forma de que se comparen. Aquí eso le
 * viene de perlas al test: cada apartado se resuelve por su método y el
 * contraste entre los dos queda dentro del propio ejercicio.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { raiz } from './numerico';

const cuadra = convocatoria('fluidos', '2020-2021-ord');

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
const manning = (A: number, P: number, n: number, J: number) =>
  (1 / n) * A * (A / P) ** (2 / 3) * Math.sqrt(J);

describe('1 · la presa con dos leyes', () => {
  const id = 'exflu2021-ord-1-la-presa-con-dos-leyes';
  const b = 25;
  const [gDulce, gSalada] = [GAMMA, 1.05 * GAMMA];
  /* El paramento de aguas arriba sube inclinado hasta la cota 8,5 con 6 m de
     retranqueo, y de ahí sigue vertical. */
  const [quiebro, retranqueo] = [8.5, 6];

  it('con poca agua la resultante va a 35,21 grados', () => {
    /* Mientras el agua no pasa del quiebro, el volumen que descansa sobre el
       paramento es un triángulo semejante, así que las dos componentes crecen
       igual y el ángulo **no cambia con el calado**. Se comprueba con tres
       calados distintos. */
    const angulo = (H: number) => {
      const horizontal = 0.5 * gDulce * H * H * b;
      const vertical = gDulce * b * 0.5 * H * ((retranqueo * H) / quiebro);
      return (Math.atan(vertical / horizontal) * 180) / Math.PI;
    };
    for (const H of [3, 5.5, 8.5])
      if (Math.abs(angulo(H) - angulo(3)) > 1e-9) throw new Error(`el ángulo cambia con H=${H}`);
    cuadra(id, 'El ángulo de la resultante con poca agua', angulo(8));
  });

  const H = 12;
  const horizontal = 0.5 * gDulce * H * H * b;
  const vertical =
    gDulce * b * (0.5 * quiebro * retranqueo + retranqueo * (H - quiebro));

  it('y con la presa llena son 21 MN', () => {
    /* Por encima del quiebro el paramento es vertical, así que al triángulo se
       le suma un rectángulo de 6 m de ancho. */
    cuadra.magnitud(id, 'La resultante con la presa llena', Math.hypot(horizontal, vertical) / 1e6, 'MN');
  });

  it('y la subpresión, 33,41 MN, más que las dos juntas', () => {
    /* El terreno transmite a la base la presión del agua de cada lado y varía
       linealmente entre las dos: el prisma es un trapecio sobre los 18 m. */
    const subpresion = ((gDulce * H + gSalada * 3) / 2) * 18 * b;
    const delAguaSalada = 0.5 * gSalada * 9 * b * Math.hypot(1, 6 / 13);
    if (!(subpresion > Math.hypot(horizontal, vertical) + delAguaSalada))
      throw new Error('la subpresión no supera a las dos fuerzas del agua, y debería');
    cuadra.magnitud(id, 'La subpresión del terreno', subpresion / 1e6, 'MN');
  });
});

describe('2 · el coeficiente medido por la pérdida', () => {
  it('el coeficiente de velocidad es 0,906', () => {
    /* Lo habitual es medir C_v midiendo el chorro; aquí se mide **lo que
       falta**. La energía degradada es (1−C_v²) veces la disponible, y el
       manómetro la lee amplificada por el salto de densidades. */
    const [razon, s, sm] = [0.02, 1, 10];
    const Cv = raiz((c) => 1 - c * c - razon * (sm / s - 1), 0.1, 0.999);
    if (!(Cv < 0.95)) throw new Error('un orificio así de bueno no perdería tanto');
    cuadra('exflu2021-ord-2-el-coeficiente-medido-por-la-perdida', 'El coeficiente de velocidad', Cv);
  });
});

describe('3 · el aliviadero de dos rampas', () => {
  const id = 'exflu2021-ord-3-el-aliviadero-de-dos-rampas';
  const n = 0.012; // hormigón acabado
  const Q = 3;

  it('la media caña comercial es de 2 m', () => {
    /* Sección llena: A = πR²/2, P = πR. El comercial se redondea **hacia
       arriba** porque es una capacidad y hacia abajo no llegaría al caudal. */
    const teorico = 2 * raiz((R) => manning((Math.PI * R * R) / 2, Math.PI * R, n, 0.0015) - Q, 0.2, 5);
    if (!(teorico < 2)) throw new Error('el teórico ya pasa del comercial');
    cuadra.magnitud(id, 'El diámetro comercial de la media caña', Math.ceil(teorico / 0.05) * 0.05, 'm');
  });

  it('y el rectangular óptimo necesita 0,816 milésimas', () => {
    /* Óptimo con calado 1 m quiere decir b = 2H. Se comprueba que de todos los
       rectángulos que llevan el caudal con esa pendiente, el de b = 2 es el de
       perímetro mojado mínimo. */
    const J = raiz((j) => manning(2 * 1, 2 + 2 * 1, n, j) - Q, 1e-6, 0.1);
    let mejor = { P: Infinity, b: 0 };
    for (let y = 0.3; y <= 3; y += 0.0005) {
      const b = raiz((x) => manning(x * y, x + 2 * y, n, J) - Q, 0.05, 40);
      if (b + 2 * y < mejor.P) mejor = { P: b + 2 * y, b };
    }
    if (Math.abs(mejor.b - 2) > 0.01) throw new Error(`el óptimo sale con b = ${mejor.b}, no 2`);
    cuadra(id, 'La pendiente del canal rectangular', J * 1000);
  });

  it('y con la milésima entera el agua va a 1,617 m/s', () => {
    /* En obra la pendiente se ejecuta redondeada hacia arriba, y entonces
       sobra capacidad: el mismo caudal baja con menos calado y más deprisa. */
    const y = raiz((h) => manning(2 * h, 2 + 2 * h, n, 0.001) - Q, 0.2, 3);
    if (!(y < 1)) throw new Error('con más pendiente el calado debería bajar');
    cuadra.magnitud(id, 'La velocidad con la pendiente redondeada', Q / (2 * y), 'm/s');
  });
});

describe('4 · el sifón que cavita arriba y el ariete que mide', () => {
  const id = 'exflu2021-ord-4-el-ariete-con-la-longitud-por-incognita';
  const gamma = 940 * G;
  const [D, e] = [0.4, 0.002];
  /* El punto B está por encima de la lámina de A: el fluido tiene que subir
     antes de bajar, y eso solo es posible en depresión. El tope de la
     depresión es la tensión de vapor. */
  const alturaEnB = (2320 - 0.987e5) / gamma;
  const cinetica = 215 - 1.4 - (224 + alturaEnB);
  const v = Math.sqrt(2 * G * cinetica);

  it('el caudal máximo son 139 l/s', () => {
    if (!(cinetica < 0.1)) throw new Error('un sifón así debería dejar muy poco margen');
    cuadra.magnitud(id, 'El caudal máximo', v * area(D) * 1000, 'l/s');
  });

  const c = Math.sqrt(2200e6 / 940) / Math.sqrt(1 + (2200e6 / 1.1e11) * (D / e));

  it('y la onda viaja a 684 m/s', () => cuadra.magnitud(id, 'La celeridad de la onda', c, 'm/s'));

  it('y el tramo BC mide 790 m', () => {
    /* Michaud, porque el tiempo crítico queda por debajo de los 3 s de cierre.
       La L de la fórmula es la distancia a la superficie libre más próxima
       aguas arriba —A, pasando por B—, así que hay que descontar el tramo AB. */
    const total = (70 * G * 3) / (2 * v);
    if (!((2 * total) / c < 3)) throw new Error('el cierre no sería lento');
    cuadra.magnitud(id, 'La longitud del tramo BC', total - 140, 'm');
  });
});

describe('6 · el túnel de viento presurizado', () => {
  const id = 'exflu2021-ord-6-el-tunel-de-viento-presurizado';
  const [Lp, vp, escala, sonido] = [1.12, 52, 1 / 10, 346];

  it('la semejanza absoluta pediría 10 bar', () => {
    /* Con la misma temperatura, la velocidad del sonido y la viscosidad son
       iguales en modelo y prototipo. Mach obliga entonces a igualar las
       velocidades, y con eso Reynolds pide que la densidad suba lo que baja el
       tamaño. Y diez bares no caben en un túnel que llega a seis. */
    const vm = vp; // lo que impone Mach
    const razonDensidad = (Lp * vp) / (Lp * escala * vm);
    if (!(razonDensidad * 1 > 6)) throw new Error('cabría en el túnel, y el ejercicio dice que no');
    cuadra.magnitud(id, 'La presión que exige la semejanza absoluta', razonDensidad * 1, 'bar');
  });

  /* Renunciando a Mach —permitido por debajo de 0,3— la única condición es
     Reynolds, y conviene apurar la velocidad hasta el límite del criterio: a
     más velocidad, menos presión hace falta. */
  const vm = 0.3 * sonido;
  const razonDensidad = (Lp * vp) / (Lp * escala * vm);

  it('y renunciando a Mach bastan 5 bar', () => {
    if (!(vm / sonido <= 0.3 + 1e-12)) throw new Error('se estaría pasando del criterio');
    cuadra.magnitud(id, 'La presión del ensayo aceptable', razonDensidad * 1, 'bar');
  });

  it('y la sustentación del modelo es la quinta parte', () =>
    cuadra(id, 'La relación de sustentaciones', razonDensidad * escala ** 2 * (vm / vp) ** 2));
});

describe('8 · la boquilla con bomba y sin ella', () => {
  const id = 'exflu2021-ord-8-la-boquilla-con-bomba-y-sin-ella';
  const [dBoq, D, L] = [0.04, 0.2, 90];
  const salto = 22 - 5;
  const nu = 1e-6;
  const epsAcero = 4.6e-5;

  /* a) Con la bomba apagada, por Darcy-Weisbach. */
  const porDarcy = (Q: number) => {
    const v = Q / area(D);
    return colebrook((v * D) / nu, epsAcero / D) * (L / D) * ((v * v) / (2 * G));
  };
  const cinetica = (Q: number) => (Q / area(dBoq)) ** 2 / (2 * G);
  const Qapagada = raiz((Q) => cinetica(Q) + 1.1 * porDarcy(Q) - salto, 1e-4, 0.2);

  it('con la bomba apagada salen 22,77 l/s', () =>
    cuadra.magnitud(id, 'El caudal con la bomba apagada', Qapagada * 1000, 'l/s'));

  it('y el chorro sube 16,75 m', () => {
    /* Casi todo el salto se convierte en velocidad: la tubería es ancha para
       ese caudal y apenas pierde. */
    if (!(porDarcy(Qapagada) < 0.3)) throw new Error('la tubería pierde más de lo que debería');
    cuadra(id, 'La altura del chorro con la bomba apagada', cinetica(Qapagada));
  });

  /* b) Con la bomba encendida, por Hazen-Williams: la curva de la instalación
     se corta con la de la bomba, cuya expresión da el enunciado en l/s. */
  const Hm = (Q: number) => 11.23 - 3.63e-3 * (Q * 1000) ** 2;
  const porHW = (Q: number) => hazenWilliams(L, Q, D, 130);
  const Qencendida = raiz((Q) => 22 + Hm(Q) - (5 + cinetica(Q) + 1.1 * porHW(Q)), 1e-4, 0.06);

  it('y con ella encendida, 27,81 l/s', () => {
    if (!(Qencendida > Qapagada)) throw new Error('la bomba debería aumentar el caudal');
    cuadra.magnitud(id, 'El caudal con la bomba encendida', Qencendida * 1000, 'l/s');
  });

  it('y la válvula tiene que quemar 5,63 m para dejar el chorro en 20', () => {
    /* Veinte metros de chorro fijan la velocidad de salida y con ella el
       caudal; a ese caudal la bomba da más de lo que la instalación pide, y la
       diferencia la disipa la válvula. */
    const Q = Math.sqrt(2 * G * 20) * area(dBoq);
    const disponible = 22 + Hm(Q);
    const pedido = 5 + 20 + 1.1 * porHW(Q);
    cuadra.magnitud(id, 'La válvula que baja el chorro a veinte metros', disponible - pedido, 'm');
  });
});
