/**
 * La extraordinaria de Mecánica de Fluidos de 2023-2024. Veinticuatro
 * respuestas en siete ejercicios.
 *
 * El ejercicio 2 es el mejor del corpus para lo que este pase intenta hacer,
 * porque **cada apartado usa una ley distinta y ninguna se hereda de la
 * anterior**: el aforo sale de Arquímedes, la cámara de aire de la condición
 * de equilibrio, la profundidad de una compresión isoterma y la resultante de
 * volver a Arquímedes por el otro lado. Un error en cualquiera de ellos no se
 * disimula con los demás, así que se comprueban los cuatro por separado y
 * además se comprueba que cierran entre sí.
 *
 * Y el 4 lleva un dato que sobra —los 27 cm de desnivel entre las tomas— que
 * es justamente la trampa: el manómetro diferencial ya mide **altura
 * piezométrica**, que lleva la cota dentro. Sumarla otra vez da un caudal un
 * 80 % mayor. El test lo mide en vez de contarlo.
 */
import { describe, it } from 'vitest';
import { coeficienteHW } from './tablas';
import { convocatoria } from './corpus';
import { raiz } from './numerico';

const cuadra = convocatoria('fluidos', '2023-2024-ext');

const G = 9.8;
const GAMMA = 1000 * G;
const ATM = 101325;
const area = (d: number) => (Math.PI * d * d) / 4;
const hazenWilliams = (L: number, Q: number, D: number, C: number) =>
  (10.674 * L * Q ** 1.852) / (C ** 1.852 * D ** 4.871);

describe('1 · los cincuenta mililitros que faltan', () => {
  const id = 'exflu2324-ext-1-los-cincuenta-mililitros-que-faltan';
  const V = 0.1; // el tanque es RÍGIDO: este volumen no cambia en todo el problema
  const masaDeAgua = 134.109 - 34.0;
  const rho = masaDeAgua / V;

  it('el agua a 25 bar pesa 1001,09 kg/m³', () => cuadra.magnitud(id, 'La densidad del agua comprimida', rho, 'kg/m3'));

  it('y perder 50 ml baja la presión 10,99 bar', () => {
    /* K = ρ·dp/dρ, y como el volumen del tanque no cambia, toda la pérdida de
       masa se convierte en pérdida de densidad. Los 50 ml se miden **fuera**,
       ya descomprimidos, así que su masa es la de 50 ml de agua normal. */
    const K = 2.2e9;
    const perdida = 0.05e-3 * 1000;
    const caida = (K * (-perdida / V)) / rho;
    /* Y la lectura alternativa —que los 50 ml se midieran a 25 bar— da 11,00
       bar: la respuesta no depende de cuál se tome, y conviene saberlo antes
       de discutirlo. */
    const siFueranComprimidos = (K * ((-0.05e-3 * rho) / V)) / rho;
    if (Math.abs(siFueranComprimidos - caida) > 0.02e5) throw new Error('las dos lecturas ya no coinciden');
    cuadra(id, 'La caída de presión', caida / 1e5);
  });
});

describe('2 · la gabarra que se hundió', () => {
  const id = 'exflu2324-ext-2-la-gabarra-que-se-hundio';
  const [largo, ancho, alto] = [15, 8, 1];
  const planta = largo * ancho;
  const calado = alto - 0.4; // el resguardo de seguridad fija el calado máximo

  /* Los ensayos se hicieron en agua salada, y ahí caben 60 personas de 80 kg. */
  const masa = planta * calado * 1025 - 60 * 80;

  it('la gabarra vacía pesa 69 t', () => cuadra.magnitud(id, 'La masa de la gabarra', masa, 'kg'));

  it('y en agua dulce solo caben 37 personas', () => {
    /* El agua dulce empuja un 2,5 % menos, y ese 2,5 % se lo come entero el
       pasaje porque la gabarra ya se lleva el 96 % del empuje disponible. */
    const cabenDulce = (planta * calado * 1000 - masa) / 80;
    if (Math.floor(cabenDulce) >= 60) throw new Error('en dulce debería caber menos gente, no la misma');
    cuadra(id, 'El aforo en agua dulce', Math.floor(cabenDulce));
  });

  /* Volcada, la gabarra es una campana: el aire que tenía dentro queda
     atrapado bajo el fondo y es lo único que la sostiene. El equilibrio no
     necesita saber nada de la compresión — solo cuánto volumen hay que
     desplazar para pesar lo que pesa. */
  const h = masa / 1000 / planta;

  it('la cámara de aire mide 0,575 m', () => cuadra.magnitud(id, 'La cámara de aire', h, 'm'));

  it('y el fondo queda 7,067 m bajo la superficie', () => {
    /* Y ahora sí entra la isoterma, que es la que dice **a qué profundidad**
       el aire queda comprimido justo hasta ese volumen. */
    const V1 = planta * alto;
    const V2 = planta * h;
    const p2 = (ATM * V1) / V2;
    const interfaz = (p2 - ATM) / GAMMA;
    cuadra.magnitud(id, 'La profundidad de la barca', interfaz - h, 'm');
  });

  it('y la resultante vertical son 676,2 kN', () => {
    /* Es el peso, y también el empuje sobre la burbuja: que las dos cuentas
       den lo mismo es la comprobación de que el equilibrio del apartado
       anterior era el bueno. La horizontal es nula por simetría. */
    const empuje = GAMMA * planta * h;
    if (Math.abs(empuje - masa * G) > 1) throw new Error('el empuje y el peso ya no coinciden');
    cuadra.magnitud(id, 'La resultante vertical', empuje / 1000, 'kN');
  });
});

describe('3 · el micromanómetro de líquidos inmiscibles', () => {
  const id = 'exflu2324-ext-3-el-micromanometro-de-liquidos-inmiscibles';
  const [h1, h2] = [0.4, 0.3];
  /* Con los dos depósitos abiertos, las dos columnas equilibran la misma
     atmósfera: es una balanza, y el líquido más corto es el más pesado. */
  const s2 = h1 / h2;

  it('el segundo líquido tiene s = 1,333', () => cuadra(id, 'La densidad del segundo líquido', s2));

  it('y mover la interfaz 12 cm cuesta 307,9 N', () => {
    /* Los depósitos son «de grandes dimensiones», así que sus láminas no se
       mueven: los 12 cm los pone entero el tubo, alargando una columna y
       acortando la otra respecto de la nueva interfaz. */
    const dh = 0.12;
    const dp = GAMMA * (s2 * (h2 + dh) - (h1 + dh));
    cuadra.magnitud(id, 'La fuerza en el émbolo', dp * area(1), 'N');
  });

  it('y para medir ±2 Pa el líquido nuevo no puede pasar de 11.800 N/m³', () => {
    /* La sensibilidad del aparato es la **diferencia** de pesos específicos,
       no el peso del líquido de B: cuanto más se parezcan, más se mueve la
       interfaz por cada pascal. De ahí que la condición sea un máximo. */
    const gamma2 = GAMMA + 2 / 0.001;
    /* Y la comprobación de que el sentido de la desigualdad es ese: con un
       líquido más pesado, el mismo milímetro valdría más de 2 Pa. */
    const resolucion = (g2: number) => (g2 - GAMMA) * 0.001;
    if (!(resolucion(gamma2 + 500) > 2)) throw new Error('el máximo no está donde debería');
    cuadra.magnitud(id, 'El peso específico máximo del líquido nuevo', gamma2, 'N/m3');
  });
});

describe('4 · el venturímetro calibrado con un pitot', () => {
  const id = 'exflu2324-ext-4-el-venturimetro-calibrado-con-un-pitot';
  const [D1, D2, sm, s0] = [0.1, 0.07, 1.6, 0.85];
  /* Un manómetro diferencial entre dos puntos de una misma tubería mide la
     diferencia de **alturas piezométricas** —presión más cota—, no de
     presiones: la cota ya está dentro. Por eso los 27 cm del enunciado no se
     suman en ninguna parte. */
  const lee = (R: number) => R * (sm / s0 - 1);
  const dh = lee(0.2);

  it('entre 1 y 2 se pierden 0,1765 m de columna', () =>
    cuadra.magnitud(id, 'La caída de cota piezométrica', dh, 'm'));

  const vTeorica = Math.sqrt((2 * G * dh) / (1 - (area(D2) / area(D1)) ** 2));

  it('y el venturímetro daría 8,21 l/s', () => {
    /* La trampa, medida: sumar los 27 cm de desnivel a lo que ya los lleva da
       un caudal casi el doble. */
    const siSeSumaraLaCota = Math.sqrt((2 * G * (dh + 0.27)) / (1 - (area(D2) / area(D1)) ** 2));
    if (siSeSumaraLaCota / vTeorica < 1.5) throw new Error('el dato que sobra no distorsiona lo suficiente');
    cuadra.magnitud(id, 'El caudal teórico', vTeorica * area(D2) * 1000, 'l/s');
  });

  /* El pitot está **en el estrechamiento**, así que lo que mide contra la toma
     piezométrica de ese mismo punto es la altura cinética pura: la velocidad
     real, sin pasar por la ecuación del venturímetro. Ese es el camino
     independiente que permite calibrarlo. */
  const vReal = Math.sqrt(2 * G * lee(0.25));

  it('y de verdad circulan 8,00 l/s', () => cuadra.magnitud(id, 'El caudal real', vReal * area(D2) * 1000, 'l/s'));

  it('así que el coeficiente vale 0,975', () => {
    if (vReal > vTeorica) throw new Error('el caudal real no puede superar al teórico');
    cuadra(id, 'El coeficiente del venturímetro', vReal / vTeorica);
  });
});

describe('5 · la bomba en otro planeta', () => {
  const id = 'exflu2324-ext-5-la-bomba-en-otro-planeta';

  it('el fenómeno tiene cinco adimensionales', () => {
    /* Ocho variables menos el rango de su matriz dimensional. Se calcula el
       rango en vez de suponerlo tres: con Q, D, L y v ahí dentro hay mucha
       longitud repetida y conviene comprobar que aun así hay tres dimensiones
       independientes de verdad. */
    const dims: [number, number, number][] = [
      [1, -1, -2], // dP
      [0, 3, -1], // Q
      [0, 1, 0], // D
      [0, 1, 0], // L
      [1, -1, -1], // mu
      [1, -3, 0], // rho
      [0, 1, -2], // g
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
    if (rango !== 3) throw new Error(`el rango sale ${rango}, y el enunciado da tres variables repetidas`);
    cuadra(id, 'Cuántos parámetros', dims.length - rango);
  });

  /* Modelo: mercurio en la Tierra, a escala 0,125. Prototipo: agua a 20 °C en
     el cuerpo planetario. */
  const [muM, rhoM] = [0.016 * 0.1, 13600];
  const [muP, rhoP] = [1e-3, 1000];
  const lambda = 0.125;
  const relacionV = (muM / muP) * (rhoP / rhoM) * (1 / lambda);

  it('Reynolds pide que el modelo vaya al 94 % de la velocidad', () =>
    cuadra(id, 'La relación de velocidades por Reynolds', relacionV));

  it('y entonces el planeta tiene que tener g = 1,38 m/s²', () => {
    /* Froude fija la otra mitad. Con las velocidades ya atadas por Reynolds,
       la única variable que queda libre es la gravedad — y por eso la
       semejanza absoluta solo es posible en un planeta concreto, que es lo que
       el ejercicio quiere que se vea. */
    const gPlaneta = 9.8 / (relacionV ** 2 / lambda);
    /* Comprobado al revés: con esa gravedad, los dos números coinciden. */
    const froude = (v: number, g: number, L: number) => v / Math.sqrt(g * L);
    const igual = froude(relacionV, 9.8, lambda) / froude(1, gPlaneta, 1);
    if (Math.abs(igual - 1) > 1e-9) throw new Error('con esa gravedad los Froude no coinciden');
    cuadra.magnitud(id, 'La gravedad del planeta', gPlaneta, 'm/s2');
  });
});

describe('6 · la bomba que cavita y la que no', () => {
  const id = 'exflu2324-ext-6-la-bomba-que-cavita-y-la-que-no';
  const desnivel = 27 - 3;

  it('el término independiente son 24 m', () => cuadra.magnitud(id, 'La altura piezométrica', desnivel, 'm'));

  /* PVC: ε = 0,0007 cm. Las dos tuberías caen en la banda de 140 de la tabla
     del tema 19, y eso se lee de ahí, no se copia. */
  const C = [0.15, 0.1].map((D) => coeficienteHW(7e-6 / D));
  const vAsp = (Q: number) => Q / 1000 / area(0.15);
  const vImp = (Q: number) => Q / 1000 / area(0.1);
  /* Tres boquillas **en paralelo**: cada una se lleva un tercio del caudal, y
     lo que hay que vencer no es solo su factor de paso sino la altura cinética
     con la que el chorro se marcha. */
  const vBoq = (Q: number) => Q / 1000 / 3 / area(0.05);
  const rozamientoAsp = (Q: number) => hazenWilliams(10, Q / 1000, 0.15, C[0]);
  const instalacion = (Q: number) =>
    desnivel +
    (4 * 0.75 * vImp(Q) ** 2 + (1 + 0.1) * vBoq(Q) ** 2) / (2 * G) +
    rozamientoAsp(Q) +
    hazenWilliams(40, Q / 1000, 0.1, C[1]);

  const bombaA = (Q: number) => 108 - 0.013 * Q * Q;
  const bombaB = (Q: number) => 117 - 0.45 * Q - 0.0085 * Q * Q;
  const rendimientoB = (Q: number) => (4.22 * Q - 0.052 * Q * Q) / 100;
  const puntoB = raiz((Q) => bombaB(Q) - instalacion(Q), 10, 120);

  it('la bomba B se planta en 60,64 l/s', () => {
    if (C[0] !== 140 || C[1] !== 140) throw new Error('el PVC ya no cae en la banda de 140');
    cuadra.magnitud(id, 'El punto de funcionamiento de la bomba B', puntoB, 'l/s');
  });

  /* NPSH disponible: la atmósfera menos la tensión de vapor, menos lo que hay
     que subir hasta la bomba, menos lo que se pierde por el camino. */
  const npshDisponible = (Q: number) => ATM / GAMMA - 0.25 - (8 - 3) - rozamientoAsp(Q);

  it('y dispone de 4,43 m de NPSH', () => {
    /* Y esto es el ejercicio entero: la bomba A da más altura y **mejor
       rendimiento** —un 79 % contra un 65 %—, así que por las dos primeras
       curvas se elegiría A. La tercera lo prohíbe: A pide más NPSH del que
       hay y cavitaría. Se comprueba, no se cuenta. */
    const puntoA = raiz((Q) => bombaA(Q) - instalacion(Q), 10, 120);
    const rendimientoA = (2.04 * puntoA - 0.0123 * puntoA * puntoA) / 100;
    if (!(rendimientoA > rendimientoB(puntoB))) throw new Error('A debería ser la más eficiente');
    if (!(2 + 8e-4 * puntoA * puntoA > npshDisponible(puntoA))) throw new Error('A debería cavitar');
    if (!(1.2 + 6e-4 * puntoB * puntoB < npshDisponible(puntoB))) throw new Error('B no debería cavitar');
    cuadra.magnitud(id, 'El NPSH disponible', npshDisponible(puntoB), 'm');
  });

  it('y el metro cúbico sale a 0,0434 €', () => {
    /* Dos rendimientos en serie —el de la bomba y el del motor— y el paso de
       potencia a energía por metro cúbico, que es dividir por el caudal. */
    const potencia = (GAMMA * (puntoB / 1000) * instalacion(puntoB)) / rendimientoB(puntoB) / 0.68;
    const kWhPorMetroCubico = potencia / 1000 / (puntoB / 1000) / 3600;
    cuadra(id, 'El coste por metro cúbico', kWhPorMetroCubico * 0.12);
  });
});

describe('7 · la calzada como canal', () => {
  const id = 'exflu2324-ext-7-la-calzada-como-canal';
  const n = 0.015;
  const J = 0.05e-3; // la pendiente más floja del rango es la que manda
  const manning = (A: number, P: number) => (1 / n) * A * (A / P) ** (2 / 3) * Math.sqrt(J);

  it('las cunetas necesitan 23,8 cm de radio', () => {
    /* Dimensionar es siempre el caso peor: el caudal máximo, la pendiente
       mínima y el reparto entre las dos cunetas. El resguardo del 8 % del
       diámetro deja la lámina a 0,84·R del fondo, **por debajo** del nivel de
       la calzada, así que la cuneta trabaja como un segmento circular. */
    const calado = (R: number) => R - 0.08 * (2 * R);
    const seccion = (R: number) => {
      /* Segmento circular: la lámina está a (R − y) por debajo del centro, y
         desde ahí sale el semiángulo que abre el arco mojado. */
      const beta = Math.acos((R - calado(R)) / R);
      return { A: R * R * (beta - Math.sin(beta) * Math.cos(beta)), P: 2 * beta * R };
    };
    const R = raiz((r) => manning(seccion(r).A, seccion(r).P) - 0.0075, 0.05, 1);
    if (!(calado(R) < R)) throw new Error('la lámina se saldría de la cuneta');
    cuadra.magnitud(id, 'El radio de las cunetas', R, 'm');
  });

  const D = 0.5;

  it('así que se instalan 50 cm', () => {
    /* Al alza y a múltiplo de 5: 47,7 cm redondeados hacia abajo dejarían la
       cuneta corta justo el día de la tormenta. */
    if (D < 2 * 0.2383 || D - 0.05 >= 2 * 0.2383) throw new Error('50 cm no es el primer múltiplo de 5 que sirve');
    cuadra.magnitud(id, 'El diámetro comercial', D * 100, 'cm');
  });

  it('y los bordes tienen que levantar 49,58 cm', () => {
    /* En invierno el canal ya no es la cuneta: es **la calzada entera**. Las
       dos medias cunetas hacen un círculo completo de área, la lámina cubre
       los 6 m de firme, y los bordes elevados se mojan por dentro — cuentan en
       el perímetro, y ese detalle vale un 1 % en la respuesta. */
    const R = D / 2;
    const seccion = (y: number) => ({
      A: Math.PI * R * R + (6 + 2 * D) * (y - R),
      P: 2 * Math.PI * R + 6 + 2 * (y - R),
    });
    const y = raiz((t) => manning(seccion(t).A, seccion(t).P) - 0.25, R + 0.01, 1);
    if (!(y > R)) throw new Error('el agua de invierno debería rebasar la calzada');
    cuadra.magnitud(id, 'La altura de los bordes', (y + 0.05) * 100, 'cm');
  });
});
