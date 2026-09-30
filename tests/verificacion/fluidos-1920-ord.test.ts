/**
 * La ordinaria de Mecánica de Fluidos de 2019-2020. Treinta y dos respuestas,
 * la convocatoria más larga de la asignatura.
 *
 * Cuatro cosas que este fichero hace y que no cabían en las otras:
 *
 * - **El ejercicio 1 integra el par por la corona** en vez de usar la
 *   fórmula cerrada, y cuenta diez películas: cinco discos con aceite a los
 *   dos lados.
 * - **El ejercicio 2 recorre el manómetro diferencial** con el manómetro 4
 *   contra el aire de la cámara C, que es lo que decide todo el ejercicio.
 * - **El ejercicio 3 se comprueba por donde no se ve.** Las dos fuerzas
 *   verticales valen más de dos millones de newtons cada una —el gas de
 *   encima está a casi siete bares— y se restan hasta dejar 33,7 kN. El test
 *   las calcula por separado, con la tapa del cilindro a 1 m de la lámina
 *   (así acota la figura), y comprueba que la resta cae en el peso.
 * - **Las rugosidades son las del cuadro n.º 20**, y la zona de cada tubería
 *   del ejercicio 6 se decide con las fronteras del tema 18 antes de elegir
 *   la expresión de f, como pide la nota del enunciado.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { raiz } from './numerico';

const cuadra = convocatoria('fluidos', '2019-2020-ord');

const G = 9.8;
const GAMMA = 1000 * G;
const area = (d: number) => (Math.PI * d * d) / 4;

/** Kármán-Prandtl para tubos lisos, como la da el tema 18: 1/√f = −2·log(2,51/(Re·√f)). */
function karmanLiso(Re: number) {
  let f = 0.02;
  for (let i = 0; i < 200; i++) f = 1 / (-2 * Math.log10(2.51 / (Re * Math.sqrt(f)))) ** 2;
  return f;
}
/** Kármán-Prandtl para tubos rugosos: 1/√f = 2·log(3,71·D/ε). */
const karmanRugoso = (rugosidadRelativa: number) => 1 / (2 * Math.log10(3.71 / rugosidadRelativa)) ** 2;

/** Hazen-Williams con el J₁ del cuadro n.º 25, el del curso: h_f = J₁·L·Q^1,852,
 *  J₁ = 1,2117·10¹⁰/(C^1,852·D_mm^4,87), con el caudal en l/s. Aquí se le pasa
 *  en m³/s y el diámetro en m, como a las demás funciones del fichero. */
const hazenWilliams = (L: number, Q: number, D: number, C: number) =>
  ((1.2117e10 / (C ** 1.852 * (D * 1000) ** 4.87)) * L * (Q * 1000) ** 1.852);

describe('1 · el embrague de discos en aceite', () => {
  const id = 'exflu1920-ord-1-el-embrague-de-discos-en-aceite';
  const [N1, N2, R1, R2, M, s, e] = [260, 40, 0.075, 0.775, 4000, 0.79, 1.25e-3];
  const dw = ((N1 - N2) * 2 * Math.PI) / 60;
  const peliculas = 5 * 2;
  /* El par de una cara, integrando τ·r·dA por la corona con τ = μ·Δω·r/e,
     en vez de usar la fórmula cerrada. */
  const parPorMu = (() => {
    let m = 0;
    const n = 20000;
    for (let k = 0; k < n; k++) {
      const r = R1 + ((R2 - R1) * (k + 0.5)) / n;
      m += ((dw * r) / e) * r * 2 * Math.PI * r * ((R2 - R1) / n);
    }
    return m;
  })();
  const mu = M / (peliculas * parPorMu);
  const nu = mu / (s * 1000);

  it('trabajan diez películas', () => cuadra(id, 'Las películas de aceite que trabajan', peliculas));
  it('hace falta μ = 0,0383 Pa·s', () => cuadra.magnitud(id, 'La viscosidad dinámica que hace falta', mu, 'Pa*s'));
  it('es decir, 48,5 cSt', () => cuadra.magnitud(id, 'La viscosidad cinemática que hace falta', nu * 1e6, 'cSt'));

  const tabla = [700, 680, 460, 320, 220, 150, 100, 68, 46, 32, 22, 15, 10];
  const elegido = Math.min(...tabla.filter((v) => v >= nu * 1e6));
  it('el primer aceite de la tabla que llega es el VG 68', () => cuadra(id, 'El aceite que se elige', elegido));
  it('y la potencia sube un 40,3 %', () => {
    /* Con las velocidades fijas, la potencia va con el par, y el par con μ;
       con la misma densidad, con ν. */
    cuadra(id, 'Cuánto sube la potencia', (elegido / (nu * 1e6) - 1) * 100);
  });
});

describe('2 · los depósitos dentro de la cámara', () => {
  const id = 'exflu1920-ord-2-los-depositos-dentro-de-la-camara';
  const gHg = 13600 * G;
  const patm = 0.75 * gHg; // el barómetro: H = 750 mm
  const P3 = 1.38 * 101325;
  const P4 = 780000 * 0.1; // dyn/cm² → Pa
  /* El 4 es manométrico y está dentro de C: mide contra el aire de C. */
  const pC = P3 - P4;

  it('la cámara C está a 61.828,5 Pa', () => cuadra.magnitud(id, 'La presión de la cámara C', pC, 'Pa'));
  it('y la U de mercurio marca 286,1 mm', () =>
    cuadra.magnitud(id, 'La lectura de la U de mercurio', ((patm - pC) / gHg) * 1000, 'mm'));

  const [g1, g2, g3] = [0.9 * GAMMA, 0.6 * GAMMA, 3.2 * GAMMA];
  const [L, y, z] = [1, 0.28, 0.742];
  const pA = 18000 + patm; // el 1, fuera de C, contra la atmósfera
  /* Recorrido punto a punto: de la tapa de A por s1 hasta la interfaz de la
     rama de A, arriba por s2 hasta la de la rama de B, y por s3 hasta el
     nivel de B. R es la incógnita que cierra el recorrido en P3. */
  const R = raiz((r) => pA + g1 * (L - y) - g2 * r - g3 * (z - y - r) - P3, 0, 5);
  it('el diferencial marca R = 1,178 m', () => cuadra.magnitud(id, 'La lectura del manómetro diferencial', R, 'm'));

  /* El líquido manométrico se corre en bloque por un tubo de sección
     constante, y el s3 que entra o sale de la rama de B mueve el nivel de B
     en esa longitud por a/A_B = (π/4)·0,4²; el aire de B, isotermo. */
  const razon = (Math.PI / 4) * 0.4 ** 2;
  const aire = L - z;
  const pMin = (P3 * aire) / (aire + y * razon);
  const pMax = (P3 * aire) / (aire - (y + R) * razon);
  it('el aire de B va de 1,23 a 4,82 bar', () => {
    cuadra.magnitud(id, 'La presión mínima del aire de B', pMin / 1e5, 'bar');
    cuadra.magnitud(id, 'La presión máxima del aire de B', pMax / 1e5, 'bar');
  });
  it('y el pistón, dentro de C, soporta 1081,83 y 7427,22 N', () => {
    const Ap = area(0.15);
    cuadra.magnitud(id, 'La fuerza en el pistón con la presión mínima', (pMin - pC) * Ap, 'N');
    cuadra.magnitud(id, 'La fuerza en el pistón con la presión máxima', (pMax - pC) * Ap, 'N');
  });
});

describe('3 · el cuerpo que flota entre dos líquidos', () => {
  const id = 'exflu1920-ord-3-el-cuerpo-que-flota-entre-dos-liquidos';
  const [R, L, H] = [1, 0.75, 1.3];
  const [s1, s2] = [1.01, 0.79];
  const gamMat = 925 * G; // «925 kg/m³» de peso específico: kilopondios
  const Vcono = (Math.PI * R * R * H) / 3;
  const Vcil = Math.PI * R * R * L;
  const peso = gamMat * (Vcono + Vcil);

  /* El equilibrio reparte el cilindro entre los dos líquidos: h por arriba y
     lo que queda por abajo, con el cono entero en el de abajo. */
  const h = raiz(
    (x) => s1 * GAMMA * (Vcono + Math.PI * R * R * (L - x)) + s2 * GAMMA * Math.PI * R * R * x - peso,
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
  const pGas = pGasAbs - patm;

  it('y el manómetro marca 5.226 mm de mercurio', () => {
    /* Un milímetro de mercurio son 13.600 kg/m³ por un milímetro por g. */
    cuadra.magnitud(id, 'La lectura del manómetro superior', pGas / (13600 * G * 0.001), 'mmHg');
  });

  /* Presiones manométricas: la tapa del cilindro, 1 m por debajo de la lámina
     del fluido superior; la base del cilindro, h por s2 y L − h por s1 más
     abajo. */
  const disco = Math.PI * R * R;
  const pTapa = pGas + s2 * GAMMA * 1;
  const pBase = pTapa + s2 * GAMMA * h + s1 * GAMMA * (L - h);
  const arriba = pTapa * disco;
  /* La de abajo, integrando la presión sobre el cono en anillos, en vez de
     partirla en «disco más volumen». */
  const abajo = (() => {
    let F = 0;
    const n = 20000;
    for (let k = 0; k < n; k++) {
      const t = (k + 0.5) / n; // de la base (0) al vértice (1)
      const r = R * (1 - t);
      const p = pBase + s1 * GAMMA * H * t;
      F += p * 2 * Math.PI * r * (R / n); // proyección horizontal del anillo
    }
    return F;
  })();

  it('el fluido superior aprieta 2212,49 kN hacia abajo', () =>
    cuadra.magnitud(id, 'La fuerza vertical del fluido superior', arriba / 1000, 'kN'));
  it('y el inferior empuja 2246,19 kN hacia arriba', () =>
    cuadra.magnitud(id, 'La fuerza vertical del fluido inferior', abajo / 1000, 'kN'));

  it('y la diferencia entre las dos verticales es el peso', () => {
    if (!(abajo > 2e6 && arriba > 2e6)) throw new Error('las dos fuerzas deberían ser enormes');
    if (Math.abs(abajo - arriba - peso) > 1e-3 * peso) throw new Error('la diferencia no es el peso');
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
  const tope = (2 / 3) * 205;

  it('el chorro sale a 16,6 m/s', () => cuadra.magnitud(id, 'La velocidad de salida', v2, 'm/s'));

  it('y el cono admite 9,6 grados, o 9,7 con el caudal a la velocidad real', () => {
    /* El chorro sale deslizando por la superficie del cono, desviado α
       respecto del eje, y la fuerza axial es ρQv(1−cos α). Se busca el α que
       deja el tornillo justo en los dos tercios de su rotura.
       El caudal, como define el curso el coeficiente de descarga, va con la
       velocidad teórica, sin la pérdida de la tobera: es la lectura que da
       el 9,63 impreso. Con la velocidad real sale 9,74, y la casilla acepta
       las dos; se comprueban las dos, y que olvidar la pérdida de la tobera
       (9,54) queda fuera. */
    const vt = Math.sqrt((14 * 2 * G) / (1 - razon * razon));
    const semiangulo = (Q: number, v: number) => raiz((a) => 1000 * Q * v * (1 - Math.cos((a * Math.PI) / 180)) - tope, 0.1, 60);
    const delCurso = semiangulo(Cd * area(d) * vt, v2);
    const conLaReal = semiangulo(Cd * area(d) * v2, v2);
    const sinTobera = semiangulo(Cd * area(d) * vt, vt);
    if (Math.abs(delCurso - 9.63) > 0.01) throw new Error(`la lectura del curso da ${delCurso}, no 9,63`);
    if (Math.abs(sinTobera - 9.73) <= 0.12) throw new Error('la casilla aceptaría olvidar la pérdida de la tobera');
    cuadra(id, 'El semiángulo del cono', delCurso);
    cuadra(id, 'El semiángulo del cono', conLaReal);
  });

  it('y el cono que avanza contra el chorro rompe el tornillo a 3,74 m/s', () => {
    /* Un solo cono que avanza a u recibe ρ·A_j·(v+u) de caudal a v+u de
       velocidad relativa: la fuerza va con (v+u)². Se busca la u que la lleva
       a la carga de rotura entera, con el α del apartado anterior. */
    const Aj = Cd * area(d);
    const alfa = raiz((a) => 1000 * Aj * v2 * v2 * (1 - Math.cos(a)) - tope, 1e-3, 1);
    const u = raiz((w) => 1000 * Aj * (v2 + w) ** 2 * (1 - Math.cos(alfa)) - 205, 0, 20);
    cuadra.magnitud(id, 'La velocidad límite del cono', u, 'm/s');
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

  /* Longitud equivalente: 275 m más siete codos de 9 m cada uno. Rugosidades
     del cuadro n.º 20: PVC 0,0007 cm; hormigón, 0,12 cm de valor de diseño. */
  const Leq = 275 + 7 * 9;
  const [epsPVC, epsHormigon] = [7e-6, 1.2e-3];
  /** La f de una tubería con la zona decidida por las fronteras del tema 18. */
  const coef = (D: number, eps: number) => {
    const Re = (4 * Q) / (Math.PI * D * nu);
    const er = eps / D;
    if (Re < 23 / er) return { f: Re <= 1e5 ? 0.3164 / Re ** 0.25 : karmanLiso(Re), zona: 'lisa' };
    if (Re > 560 / er) return { f: karmanRugoso(er), zona: 'rugosa' };
    throw new Error('zona semirrugosa: este test no la espera');
  };
  const perdida = (D: number, L: number, eps: number) => {
    const v = Q / area(D);
    return coef(D, eps).f * (L / D) * ((v * v) / (2 * G));
  };
  /* Entre 150 y 300 mm el PVC se comporta como liso con este caudal; fuera de
     ahí `coef` protesta, y así la raíz no puede salir de la zona que se da
     por supuesta. */
  const D1 = raiz((D) => perdida(D, Leq, epsPVC) - hf1, 0.15, 0.3);

  it('y mide 176 mm, con el tubo hidráulicamente liso', () => {
    if (coef(D1, epsPVC).zona !== 'lisa') throw new Error('la tubería 1 debería comportarse como lisa');
    /* Blasius fuera de su rango (Re > 10⁵) da 173,9 mm: la casilla, con su
       1 %, tiene que dejarlo fuera. */
    const conBlasius = raiz((D) => {
      const v = Q / area(D);
      return (0.3164 / ((v * D) / nu) ** 0.25) * (Leq / D) * ((v * v) / (2 * G)) - hf1;
    }, 0.1, 0.4);
    if (Math.abs(conBlasius * 1000 - 176) <= 0.01 * 176) throw new Error('la casilla aceptaría Blasius');
    cuadra.magnitud(id, 'El diámetro de la primera tubería', D1 * 1000, 'mm');
  });

  it('y la turbina da 7,3 kW, con la tubería 2 rugosa', () => {
    /* De los 85 m de salto bruto hay que descontar la presión del depósito B
       —que la turbina no puede tocar— y las dos pérdidas. */
    if (coef(0.2, epsHormigon).zona !== 'rugosa') throw new Error('la tubería 2 debería comportarse como rugosa');
    const util = 0.78 * GAMMA * Q * (900 - 815 - 550000 / GAMMA - hf1 - perdida(0.2, 90, epsHormigon));
    cuadra.magnitud(id, 'La potencia útil de la turbina', util / 1000, 'kW');
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

  it('y la bomba aporta 90 mca', () => {
    /* La curva de la bomba es una gráfica de la pág. 19 del cuadernillo; estas
       son nuestras lecturas, las mismas que el enunciado da en sus «Notas
       nuestras», y se interpola entre ellas con el caudal total. */
    const curva: [number, number][] = [[0, 120], [10, 118], [20, 114], [30, 106.5], [40, 96], [45, 90], [50, 83], [60, 66.5], [70, 47], [80, 25], [90, 0]];
    const Q1 = demanda.C + demanda.D + demanda.E + demanda.F;
    /* Y de paso, que la curva leída es decreciente: una lectura mal copiada
       daría una bomba que sube con el caudal. */
    if (curva.some(([, h], k) => k > 0 && h >= curva[k - 1][1])) throw new Error('la curva leída no baja');
    const i = curva.findIndex(([q]) => q > Q1);
    const [[qa, ha], [qb, hb]] = [curva[i - 1], curva[i]];
    cuadra.magnitud(id, 'La altura manométrica de la bomba', ha + ((hb - ha) * (Q1 - qa)) / (qb - qa), 'mca');
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
       presión que llega a F pasa de los 40 mca exigidos. */
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
  const n = 0.02; // arena, cuadro n.º 26
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
