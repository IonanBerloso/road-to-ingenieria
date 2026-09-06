/**
 * La extraordinaria de Mecánica de Fluidos de 2024-2025. Veinticuatro
 * respuestas en ocho ejercicios.
 *
 * Es la convocatoria con más unidades raras del corpus —dyn/cm², UTM/m³,
 * kg/cm², mbar, mca frente a metros de petróleo— y ese es justamente su
 * riesgo: cuatro de sus respuestas se pueden fallar sin equivocarse en una
 * sola cuenta. Por eso aquí `cuadra.magnitud` trabaja más que en ninguna otra:
 * compara por dimensión llamando a lo mismo que corrige al alumno, así que un
 * factor de conversión mal puesto sale como error de número y una unidad de
 * otra magnitud sale con su nombre.
 *
 * Y trae el mejor final del corpus, el pitot del avión averiado: el aparato no
 * se rompe, sigue restando dos presiones correctamente medidas —solo que una
 * de ellas es de hace nueve kilómetros— y con el avión **parado en la pista**
 * marca 342 m/s. Es lo que hace peligrosa a una avería de instrumento: no
 * avisa.
 */
import { describe, it } from 'vitest';
import { coeficienteHW } from './tablas';
import { convocatoria } from './corpus';
import { raiz } from './numerico';

const cuadra = convocatoria('fluidos', '2024-2025-ext');

const G = 9.8;
const GAMMA = 1000 * G;
const ATM = 101325;
const area = (d: number) => (Math.PI * d * d) / 4;
function colebrook(Re: number, rugosidadRelativa: number) {
  let f = 0.02;
  for (let i = 0; i < 300; i++)
    f = 1 / (-2 * Math.log10(rugosidadRelativa / 3.7 + 2.51 / (Re * Math.sqrt(f)))) ** 2;
  return f;
}
const hazenWilliams = (L: number, Q: number, D: number, C: number) =>
  (10.674 * L * Q ** 1.852) / (C ** 1.852 * D ** 4.871);
const manning = (A: number, P: number, n: number, J: number) => (1 / n) * A * (A / P) ** (2 / 3) * Math.sqrt(J);

describe('1 · el dióxido de carbono comprimido', () => {
  const id = 'exflu2425-ext-1-el-dioxido-de-carbono-comprimido';
  const p2 = (100e3 * 0.1) / 0.04;

  it('el gas llega a 250 kPa absolutos', () => cuadra.magnitud(id, 'La presión absoluta final', p2 / 1000, 'kPa'));

  it('y eso son 1.486.750 dyn/cm² manométricos', () =>
    /* 1 Pa son 10 dyn/cm², y la atmósfera se resta porque la pregunta pide
       presión manométrica. Los dos pasos van en la misma casilla y los dos se
       fallan. */
    cuadra(id, 'La presión manométrica', (p2 - ATM) * 10));

  it('y el gas queda a 0,45 UTM/m³', () => {
    /* Gas ideal, con R en atm·l/(mol·K): la densidad sale en gramos por litro
       y de ahí a UTM hay que pasar por kilogramos y dividir por g, porque la
       UTM es la masa que pesa un kilopondio. */
    const molesPorLitro = p2 / ATM / (0.082 * 300);
    const kgPorMetroCubico = molesPorLitro * 44;
    cuadra.magnitud(id, 'La densidad final', kgPorMetroCubico / G, 'UTM/m3');
  });

  it('y su compresibilidad es 4·10⁻⁶ Pa⁻¹', () => {
    /* Para un gas ideal en isoterma el módulo volumétrico **es** la presión, así
       que el coeficiente es su inverso. Se comprueba en vez de citarse:
       K = −V·dp/dV sobre la propia isoterma pV = cte. */
    const pV = p2 * 0.04;
    const derivada = (V: number) => {
      const dV = 1e-9;
      return (pV / (V + dV) - pV / (V - dV)) / (2 * dV);
    };
    const K = -0.04 * derivada(0.04);
    if (Math.abs(K / p2 - 1) > 1e-5) throw new Error('en isoterma ideal el módulo debería ser la propia presión');
    cuadra(id, 'El coeficiente de compresibilidad', 1 / K);
  });
});

describe('2 · la bomba y la válvula que hay que cerrar', () => {
  const id = 'exflu2425-ext-2-la-bomba-y-la-valvula-que-hay-que-cerrar';
  /* Se bombea **hacia abajo** —de la cota 30 a la 17— y aun así hace falta
     bomba, porque el depósito de llegada está presurizado a 20 mca. El término
     independiente es la suma de las dos cosas, y sale positivo por poco. */
  const independiente = 17 + 1.96e5 / GAMMA - 30;

  it('el término independiente son 7 m', () => cuadra.magnitud(id, 'La altura piezométrica', independiente, 'm'));

  const Q = 76.39;
  const cineticaAsp = (Q / 1000 / area(0.25)) ** 2 / (2 * G);
  const cineticaImp = (Q / 1000 / area(0.3)) ** 2 / (2 * G);
  /* Hierro forjado, ε = 0,006 cm. Los dos diámetros vuelven a caer en bandas
     distintas de la tabla del tema 19 —2,4·10⁻⁴ contra 2·10⁻⁴ justo en el
     borde—, así que el coeficiente no es el mismo en las dos tuberías. */
  const Casp = coeficienteHW(6e-5 / 0.25);
  const Cimp = coeficienteHW(6e-5 / 0.3);
  const rozamientoAsp = hazenWilliams(200, Q / 1000, 0.25, Casp);
  /* Los tres codos vienen dados por longitud equivalente, no por factor de
     paso: se suman a la tubería antes de entrar en Hazen-Williams. */
  const rozamientoImp = hazenWilliams(400 + 3 * 2, Q / 1000, 0.3, Cimp);
  const sinValvula = 0.5 * cineticaAsp + 1 * cineticaImp + rozamientoAsp + rozamientoImp;
  const altura = independiente + sinValvula + 6 * cineticaImp;

  it('y a 76,39 l/s la instalación pide 10,76 m', () => {
    if (Casp === Cimp) throw new Error('los dos diámetros ya no caen en bandas distintas');
    cuadra.magnitud(id, 'La altura de la instalación en el punto de funcionamiento', altura, 'm');
  });

  it('y hay 11,17 m de NPSH, así que no cavita', () => {
    /* La bomba está en la cota 27 y la lámina de aspiración en la 30: está
       **por debajo**, así que los 3 m suman en vez de restar. Ese signo es
       medio ejercicio. */
    const npsh = ATM / GAMMA - 0.2 + (30 - 27) - (rozamientoAsp + 0.5 * cineticaAsp);
    if (!(npsh > 1.7)) throw new Error('con este NPSH la bomba cavitaría, y el enunciado dice que no');
    cuadra.magnitud(id, 'El NPSH disponible', npsh, 'm');
  });

  it('y bajar la presión obliga a cerrar la válvula hasta k = 174', () => {
    /* Con la mitad de presión en el depósito el término independiente se va a
       −3 m: la instalación pediría 10 m menos y la bomba se iría a otro caudal.
       Para no moverla hay que **quemar** esos 10 m en la válvula, y de ahí el
       salto de 6 a 174. */
    const nuevoIndependiente = 17 + 0.98e5 / GAMMA - 30;
    const k = (altura - nuevoIndependiente - sinValvula) / cineticaImp;
    if (!(k > 6)) throw new Error('con menos presión la válvula tiene que cerrarse, no abrirse');
    cuadra(id, 'El nuevo factor de paso de la válvula', k);
  });
});

describe('4 · el vertedero en V por análisis dimensional', () => {
  const id = 'exflu2425-ext-4-el-vertedero-en-v-por-analisis-dimensional';

  it('el fenómeno tiene dos adimensionales', () => {
    /* Q, H, α y g. El ángulo ya es adimensional y sale gratis; de las otras
       tres, solo hay **dos** dimensiones en juego —longitud y tiempo—, así que
       el rango es 2 y no 3. Confundirlo con el caso general de tres es el
       fallo del ejercicio, y por eso el rango se calcula. */
    const dims: [number, number][] = [
      [3, -1], // Q
      [1, 0], // H
      [1, -2], // g
    ];
    const M = [0, 1].map((i) => dims.map((d) => d[i]));
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
    if (rango !== 2) throw new Error(`el rango sale ${rango}, y sin masa no puede pasar de dos`);
    cuadra(id, 'Cuántos parámetros', dims.length + 1 - rango);
  });

  it('y el calado entra elevado a −2,5', () => {
    /* Se resuelve el sistema en vez de citar la fórmula del vertedero
       triangular: pidiendo que Q·H^a·g^b sea adimensional salen b = −1/2 por
       el tiempo y a = −5/2 por la longitud. Ese 5/2 es el que hace que un
       vertedero en V mida bien los caudales pequeños. */
    const b = -1 / 2;
    const a = -(3 + b);
    if (Math.abs(-1 - 2 * b) > 1e-12) throw new Error('el exponente de g no anula el tiempo');
    if (Math.abs(3 + a + b) > 1e-12) throw new Error('los exponentes no anulan la longitud');
    cuadra(id, 'El exponente del calado', a);
  });
});

describe('5 · el bombeo de petróleo en el desierto', () => {
  const id = 'exflu2425-ext-5-el-bombeo-de-petroleo-en-el-desierto';
  const s = 0.86;
  const NU = 7e-6;
  const EPS = 2.5e-4; // hierro fundido

  /* La conversión que decide el ejercicio: los 1,46 son metros de columna de
     **agua**, o sea presión, y todo lo demás se cuenta en columna de petróleo.
     El petróleo es más ligero, así que la misma presión son más metros. */
  const perdida5 = 1.46 / s;

  it('los 1,46 mca son 1,698 m de petróleo', () =>
    cuadra.magnitud(id, 'La pérdida en columna de petróleo', perdida5, 'm'));

  const darcy = (L: number, D: number, Q: number) => {
    const v = Q / area(D);
    return colebrook((v * D) / NU, EPS / D) * (L / D) * ((v * v) / (2 * G));
  };
  const Q = raiz((q) => darcy(400 + 27, 0.3, q) - perdida5, 0.005, 0.5);

  it('y la instalación mueve 69,4 l/s', () => cuadra.magnitud(id, 'El caudal bombeado', Q * 1000, 'l/s'));

  it('y cada bomba necesita 137,4 kW brutos', () => {
    /* Los tramos 2 y 4 van **en paralelo** y cada uno lleva medio caudal, así
       que su pérdida se cuenta una vez, no dos. Y el tramo 3 es de reserva: no
       circula nada por él, así que su diámetro desconocido no hace falta — es
       el dato que el enunciado deja con interrogante a propósito. */
    const perdidas = darcy(10, 0.2, Q) + darcy(5, 0.1, Q / 2) + perdida5;
    const bruta = (s * GAMMA * Q * (530 - 120 + perdidas)) / 0.88;
    if (!(darcy(5, 0.1, Q / 2) > 4 * darcy(10, 0.2, Q)))
      throw new Error('los tramos estrechos deberían dominar el rozamiento');
    cuadra.magnitud(id, 'La potencia bruta de cada bomba', bruta / 2 / 1000, 'kW');
  });
});

describe('6 · la compuerta con vacuómetro', () => {
  const id = 'exflu2425-ext-6-la-compuerta-con-vacuometro';
  const gamma = 2 * GAMMA;
  const b = 1.2;
  /* El vacuómetro marca 0,4 kg/cm², y ese «kg» es un kilopondio: 0,4·10 mca de
     depresión. */
  const vacio = 0.4 * 10 * GAMMA;
  const presion = (d: number) => -vacio + gamma * d;

  it('el plano de presión nula cae 2 m bajo A', () =>
    cuadra.magnitud(id, 'La profundidad del plano piezométrico', raiz(presion, 0, 3), 'm'));

  it('y la horizontal son 35,28 kN', () => {
    /* La proyección vertical es la altura entera de la compuerta, 3 m, y el
       prisma cambia de signo a los 2: hay 2 m de succión y 1 de empuje, y por
       eso la resultante es **hacia el fluido**. */
    let F = 0;
    const n = 400000;
    for (let k = 0; k < n; k++) F += presion((3 * (k + 0.5)) / n) * (3 / n) * b;
    if (!(F < 0)) throw new Error('con el vacuómetro la horizontal debería tirar hacia el fluido');
    cuadra.magnitud(id, 'La componente horizontal', Math.abs(F) / 1000, 'kN');
  });

  it('y la vertical, 60,47 kN', () => {
    /* La compuerta es A(0,0) → cuarto de cilindro → B(1,1) → cara plana →
       C(1,2) → cuarto de cilindro → D(0,3), con la horizontal medida hacia el
       fluido. Los dos cuartos sobresalen, así que sus centros están pegados a
       la pared, en B y en C. La cara plana es vertical y no aporta nada.
       Se integran los dos arcos, cada uno con su profundidad. */
    const arco = (profundidadDelCentro: number, sentido: number) => {
      let Fz = 0;
      const n = 200000;
      for (let k = 0; k < n; k++) {
        const psi = (Math.PI / 2) * ((k + 0.5) / n);
        const d = profundidadDelCentro + sentido * Math.cos(psi);
        /* Normal del fluido hacia la compuerta: su componente vertical es
           −sentido·cos ψ. */
        Fz += presion(d) * (-sentido * Math.cos(psi)) * (Math.PI / 2 / n) * b;
      }
      return Fz;
    };
    const total = arco(1, -1) + arco(2, 1);
    if (!(total < 0)) throw new Error('la resultante vertical debería ir hacia arriba');
    cuadra.magnitud(id, 'La componente vertical', Math.abs(total) / 1000, 'kN');
  });
});

describe('7 · el tubo de hexágono y semicírculo', () => {
  const id = 'exflu2425-ext-7-el-tubo-de-hexagono-y-semicirculo';
  const J = 11 / 10000;
  const n = 0.012;
  /* Medio hexágono regular de lado L: la base mide L, la anchura mayor 2L y la
     altura √3/2·L. Su área es la mitad de la del hexágono completo. */
  const hexagono = (L: number) => ({ A: ((3 * Math.sqrt(3)) / 4) * L * L, P: 3 * L });

  it('el lado tiene que medir 98,99 cm', () => {
    const L = raiz((x) => manning(hexagono(x).A, hexagono(x).P, n, J) - 2, 0.2, 3);
    cuadra.magnitud(id, 'La longitud del lado', L * 100, 'cm');
  });

  it('y con la berma de 20 cm caben 5,07 m³/s', () => {
    /* El semicírculo se apoya en la anchura mayor, así que su radio es L. La
       berma se mide desde la lámina hasta la coronación, de modo que el agua
       entra 0,8 m en el semicírculo — y lo que se añade es un segmento
       circular, no medio círculo. */
    const [L, R] = [1, 1];
    const y = R - 0.2;
    const segmento = { A: y * Math.sqrt(1 - y * y) + Math.asin(y), P: 2 * Math.asin(y) };
    const A = hexagono(L).A + segmento.A * R * R;
    const P = hexagono(L).P + segmento.P * R;
    /* Y la afirmación que la resolución hace y que aquí se pone a prueba:
       llenar el conducto **del todo** da **menos** caudal que dejar la berma.
       Arriba las paredes se cierran y el perímetro crece más deprisa que el
       área, así que la berma no es solo seguridad: es la sección de mayor
       capacidad. Si esto dejara de ser cierto, el párrafo que lo dice se
       quedaría publicado y falso. */
    const aTope = manning(hexagono(L).A + (Math.PI * R * R) / 2, hexagono(L).P + Math.PI * R, n, J);
    if (!(aTope < manning(A, P, n, J)))
      throw new Error('llenarlo del todo debería dar menos caudal que la berma, y la resolución lo afirma');
    cuadra.magnitud(id, 'El caudal con la berma', manning(A, P, n, J), 'm3/s');
  });
});

describe('8 · los alerones del fórmula uno', () => {
  const id = 'exflu2425-ext-8-los-alerones-del-formula-uno';
  const rho = 1.2;
  const v = 200 / 3.6;
  const h = 0.5;
  /* Álabe fijo: el aire entra a v y sale a v desviado un ángulo α, y toda la
     fuerza es cambio de dirección. La vertical va con el seno; la horizontal,
     con **uno menos el coseno**, que para ángulos pequeños es diminuto. */
  const aleron = (L: number, grados: number) => {
    const a = (grados * Math.PI) / 180;
    const flujo = rho * v * (L * h) * v;
    return { vertical: flujo * Math.sin(a), horizontal: flujo * (1 - Math.cos(a)) };
  };
  const delantero = aleron(0.95, 20);
  const trasero = aleron(1.8, 15);

  it('cada alerón delantero aprieta con 601,7 N', () =>
    cuadra.magnitud(id, 'La fuerza vertical de un alerón delantero', delantero.vertical, 'N'));

  it('y solo frena con 106,1 N', () => {
    /* Seis veces menos que la carga que produce, y esa desproporción es el
       ejercicio: a 20° el seno vale 0,34 y uno menos el coseno, 0,06. */
    if (!(delantero.vertical > 5 * delantero.horizontal))
      throw new Error('el alerón debería apretar mucho más de lo que frena');
    cuadra.magnitud(id, 'La fuerza horizontal de un alerón delantero', delantero.horizontal, 'N');
  });

  it('y el trasero, más ancho y menos inclinado, da 862,7 N', () =>
    cuadra.magnitud(id, 'El alerón trasero', trasero.vertical, 'N'));

  it('y los tres juntos cuestan 18,1 kW', () =>
    cuadra.magnitud(id, 'La potencia que cuestan', ((2 * delantero.horizontal + trasero.horizontal) * v) / 1000, 'kW'));
});

describe('9 · el pitot del avión que se bloquea', () => {
  const id = 'exflu2425-ext-9-el-pitot-del-avion-que-se-bloquea';

  it('a 9000 m y 250 km/h el manómetro marca 11,04 mm', () => {
    /* El manómetro pesa columna de mercurio contra columna de aire, y el aire
       de 9000 m pesa 22.000 veces menos: se resta igual, pero no cambia la
       tercera cifra. */
    const dinamica = 0.5 * 0.61 * (250 / 3.6) ** 2;
    const R = dinamica / ((13600 - 0.61) * G);
    cuadra.magnitud(id, 'La lectura a 9000 metros', R * 1000, 'mm');
  });

  it('y en la pista, parado, el sistema averiado marca 342 m/s', () => {
    /* El aparato no falla: sigue restando dos presiones bien medidas. Solo que
       una es la estática de 9000 m, encerrada, y la otra la de la pista con el
       avión quieto. La diferencia son 70,2 kPa, y el sistema los interpreta
       como presión dinámica con la densidad de tierra. */
    const dinamicaFalsa = 1.01e5 - 0.308e5;
    const vFalsa = Math.sqrt((2 * dinamicaFalsa) / 1.2);
    /* Y lo que lo hace peligroso, dicho con números: el sistema sano marca
       cero exacto en la misma situación, así que los dos indicadores discrepan
       en el ancho de todo el rango del avión. */
    const vSana = Math.sqrt((2 * (1.01e5 - 1.01e5)) / 1.2);
    if (vSana !== 0) throw new Error('el sistema sano debería marcar cero con el avión parado');
    cuadra.magnitud(id, 'Lo que marca el sistema averiado al aterrizar', vFalsa, 'm/s');
  });
});
