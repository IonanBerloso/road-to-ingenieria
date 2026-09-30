/**
 * La ordinaria de Mecánica de Fluidos de 2024-2025. Treinta y una respuestas en
 * los nueve ejercicios: el 1 y el 9 entraron el 30 de septiembre de 2026.
 *
 * El 1 se comprueba integrando las presiones cara a cara, sin el atajo de la
 * resolución —la resultante del arco pasa por A— ni el volumen ficticio: si
 * el atajo estuviera mal, la integral no aterrizaría en π/4 − 1/3. Y el 9,
 * con las lecturas del anexo que publica el propio enunciado y Hazen-Williams
 * en unidades del SI, que es otra forma de escribir la misma J₁.
 *
 * Dos de ellos son de los que más rinde recalcular, y por motivos opuestos.
 *
 * El 7, el flyboard, porque **el enunciado se comprueba a sí mismo**: los
 * diámetros están elegidos para que 2·c_c·A_B sea exactamente A_A, así que el
 * agua sale a la misma velocidad a la que entra. Eso convierte la continuidad
 * en un examen del resto de la cadena —presión, coeficientes de velocidad,
 * ángulo— que el test aprovecha, y de paso fija la única lectura posible del
 * ángulo: los 10° son **entre los dos chorros**, no de cada uno con la
 * vertical. Con la otra lectura el empuje sale 7 N corto.
 *
 * Y el 6, la central, porque enseña lo contrario de lo que parece: se pasa
 * medio ejercicio afinando un rozamiento de 2,55 m sobre un salto de 340. El
 * test mide esa desproporción en vez de dejarla implícita — mover la rugosidad
 * del hormigón por toda su banda cambia la pérdida un 7 % y la potencia final
 * un 0,08 %.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { integra, raiz } from './numerico';

const cuadra = convocatoria('fluidos', '2024-2025-ord');

const G = 9.8;
const GAMMA = 1000 * G;
const NU = 1e-6;
const area = (d: number) => (Math.PI * d * d) / 4;
function colebrook(Re: number, rugosidadRelativa: number) {
  let f = 0.02;
  for (let i = 0; i < 300; i++)
    f = 1 / (-2 * Math.log10(rugosidadRelativa / 3.7 + 2.51 / (Re * Math.sqrt(f)))) ** 2;
  return f;
}
const manning = (A: number, P: number, n: number, J: number) => (1 / n) * A * (A / P) ** (2 / 3) * Math.sqrt(J);

describe('1 · el cuarto de cilindro y la compuerta triangular', () => {
  const id = 'exflu2425-ord-1-el-cuarto-de-cilindro-y-la-compuerta-triangular';
  /* Todo en unidades de γ = R = b = 1: los resultados son los coeficientes de
     γR²b. O1 = (0, 0), A = (1, 0), y la lámina libre en y = 0, así que la
     presión en un punto es −y. El arco tiene su centro en A y va de O1, a la
     izquierda, al punto (1, −1), debajo de A. */
  const punto = (t: number) => [1 + Math.cos(t), Math.sin(t)]; // t de π a 3π/2
  /* En cada elemento del arco, la presión empuja hacia el cuerpo, es decir
     hacia A: fuerza = p·(−cos t, −sin t)·ds, con ds = dt. */
  const fx = integra((t) => -punto(t)[1] * -Math.cos(t), Math.PI, 1.5 * Math.PI);
  const fy = integra((t) => -punto(t)[1] * -Math.sin(t), Math.PI, 1.5 * Math.PI);

  it('la pared curva recibe γR²b/2 en horizontal', () => cuadra(id, 'La componente horizontal sobre la pared curva', fx));
  it('y πγR²b/4 en vertical, hacia arriba', () => {
    if (!(fy > 0)) throw new Error('el empuje vertical debería ir hacia arriba');
    cuadra(id, 'La componente vertical sobre la pared curva', fy);
  });

  /* Momento respecto de O1 (antihorario positivo), elemento a elemento. */
  const momentoArco = integra((t) => {
    const [x, y] = punto(t);
    const p = -y;
    const [Fx, Fy] = [p * -Math.cos(t), p * -Math.sin(t)];
    return x * Fy - y * Fx;
  }, Math.PI, 1.5 * Math.PI);
  /* La cara vertical x = 1, mojada por el agua del hueco, que empuja hacia −x
     con p = −y: dM = x·0 − y·(−p) = −y². */
  const momentoCara = integra((y) => -y * y, -1, 0);
  /* El tope empuja hacia abajo en A, con brazo 1: R_A equilibra lo demás. */
  const RA = momentoArco + momentoCara;

  it('el tope sujeta A con 0,452γR²b, hacia abajo', () => {
    /* La comprobación del atajo de la resolución: el momento del arco tiene
       que ser π/4, el de su componente vertical con brazo R, porque su
       resultante pasa por A. */
    if (Math.abs(momentoArco - Math.PI / 4) > 1e-9) throw new Error(`el arco da ${momentoArco}, no π/4`);
    if (!(RA > 0)) throw new Error('el tope debería empujar hacia abajo');
    cuadra(id, 'La reacción del tope en A', RA);
  });

  it('y el triángulo la iguala con α = 36,4°', () => {
    /* Triángulo con B = (−L, 0), C = (−L, −1), O2 = (0, 0) y L = 1/tg α. Se
       integra la presión en la cara vertical y en la hipotenusa, y el momento
       respecto de O2 da R_B·L. */
    const RB = (alfaGrados: number) => {
      const L = 1 / Math.tan((alfaGrados * Math.PI) / 180);
      // cara vertical x = −L, empuje hacia +x: dM = x·0 − y·(p·1)
      const mVert = integra((y) => -y * -y, -1, 0);
      // hipotenusa de C a O2, parámetro s de 0 a 1; normal hacia el cuerpo
      const largo = Math.hypot(L, 1);
      const n = [-1 / largo, L / largo]; // hacia arriba y a la izquierda
      const mHip = integra((s) => {
        const [x, y] = [-L + s * L, -1 + s];
        const p = -y;
        return (x * p * n[1] - y * p * n[0]) * largo;
      }, 0, 1);
      return -(mVert + mHip) / L; // el tope, hacia abajo en B, equilibra
    };
    const alfa = raiz((a) => RB(a) - RA, 10, 80);
    cuadra(id, 'El ángulo que iguala las dos reacciones', alfa);
  });
});

describe('2 · el piezómetro que miente por capilaridad', () => {
  const id = 'exflu2425-ord-2-el-piezometro-que-miente-por-capilaridad';

  /* Adhesión y cohesión no dan el ángulo por una fórmula: dan una resultante.
     La adhesión tira del menisco hacia la pared (horizontal) y la cohesión
     hacia el seno del líquido a 45°; la superficie se coloca perpendicular a
     la suma, y el ángulo de contacto es lo que queda entre la pared y esa
     superficie. */
  const razon = 4 / 3;
  const resultante = [-razon + Math.SQRT1_2, -Math.SQRT1_2];
  const cosTheta = Math.abs(resultante[0]) / Math.hypot(resultante[0], resultante[1]);

  it('el ángulo de contacto tiene coseno 0,663', () => {
    /* Comprobación de que la construcción es la buena y no una fórmula
       recordada: con adhesión y cohesión iguales en el sentido que hace la
       superficie horizontal, el ángulo tiene que salir recto. */
    const conResultanteVertical = Math.abs(-Math.SQRT1_2 + Math.SQRT1_2);
    if (conResultanteVertical > 1e-12) throw new Error('el caso de contraste no da superficie horizontal');
    cuadra(id, 'El coseno del ángulo de contacto', cosTheta);
  });

  const lado = 1e-3;
  const gamma = 0.77 * GAMMA;
  /* Jurin vale para un tubo redondo; lo general es σ·cosθ·P = γ·h·A, y aquí la
     sección es un cuadrado. */
  const capilar = (0.07 * cosTheta * ((4 * lado) / (lado * lado))) / gamma;

  it('y sube 24,6 mm solo por capilaridad', () => cuadra(id, 'El ascenso capilar del tubo', capilar * 1000));

  it('así que la cámara está a 14,74 mbar', () => {
    /* Los 22 cm que se leen **no** son presión: hay que descontarles lo que el
       tubo sube por su cuenta. Sin descontarlo salen 16,6 mbar, un 13 % de más,
       y ese es el ejercicio entero. */
    const sinDescontar = (gamma * 0.22) / 100;
    const presion = (gamma * (0.22 - capilar)) / 100;
    if (sinDescontar / presion < 1.1) throw new Error('la capilaridad no distorsiona lo suficiente');
    cuadra.magnitud(id, 'La presión de la cámara', presion, 'mbar');
  });
});

describe('3 · diseñar la sensibilidad del micromanómetro', () => {
  const id = 'exflu2425-ord-3-disenar-la-sensibilidad-del-micromanometro';
  /* Los dos aparatos miden lo mismo por caminos distintos, y la comparación es
     entre **cuántos pascales vale un milímetro** en cada uno. El de tubo
     inclinado gasta el seno del ángulo; el de líquidos inmiscibles, la
     diferencia de pesos específicos. */
  const porMilimetroInclinado = (grados: number) => GAMMA * 0.001 * Math.sin((grados * Math.PI) / 180);
  const porMilimetroInmiscible = (s2: number) => GAMMA * Math.abs(s2 - 1) * 0.001;

  it('el otro líquido no puede pasar de s = 1,07', () => {
    const sMax = raiz((s) => porMilimetroInmiscible(s) - porMilimetroInclinado(4), 1.001, 2);
    /* «Como mínimo la misma precisión» es un máximo de densidad, no un mínimo:
       cuanto más se parezcan los dos líquidos, menos pascales vale el
       milímetro y mejor mide. Se comprueba el sentido. */
    if (!(porMilimetroInmiscible(sMax - 0.01) < porMilimetroInclinado(4)))
      throw new Error('acercar las densidades debería mejorar la precisión, no empeorarla');
    cuadra(id, 'La densidad relativa máxima', sMax);
  });

  it('y con parafina el tubo tendría que ir a 5,739°', () =>
    cuadra(id, 'El ángulo equivalente a la parafina', raiz((a) => porMilimetroInclinado(a) - porMilimetroInmiscible(0.9), 0.5, 45)));
});

describe('4 · el canal con acuerdo circular', () => {
  const id = 'exflu2425-ord-4-el-canal-con-acuerdo-circular';
  const R = 1;
  /* La sección, recorrida tramo a tramo desde el fondo: 3 m de solera, el
     acuerdo de radio 1 que sustituye a la esquina viva de la derecha, 1 m de
     pared a la izquierda, el escalón de 1 m a cada lado y 0,5 m de pared
     arriba. */
  const A = 4 * 1 - (R * R - (Math.PI * R * R) / 4) + 6 * 0.5;
  const P = 3 + (Math.PI * R) / 2 + 1 + 2 * 1 + 2 * 0.5;

  it('el área mojada son 6,785 m²', () => {
    /* El acuerdo no es un adorno: se come 0,215 m² de la esquina, un 3 % de la
       sección, y sustituye 2 m de regla por 1,57 m de arco. */
    const conEsquinaViva = 4 * 1 + 6 * 0.5;
    if (!(conEsquinaViva > A)) throw new Error('el acuerdo debería quitar área, no añadirla');
    cuadra.magnitud(id, 'El área mojada', A, 'm2');
  });

  it('y transporta 17,313 m³/s', () => cuadra.magnitud(id, 'El caudal máximo', manning(A, P, 0.015, 0.002), 'm3/s'));

  it('y un semicírculo de hormigón acabado lo iguala con 1,786 m', () => {
    /* Hormigón acabado, n = 0,012, que es el valor del cuadro n.º 26 y el que
       usan otras cinco convocatorias del corpus. Un semicírculo lleno tiene
       radio hidráulico R/2, sea cual sea el radio. */
    const Q = manning(A, P, 0.015, 0.002);
    const r = raiz((x) => manning((Math.PI * x * x) / 2, Math.PI * x, 0.012, 0.002) - Q, 0.5, 5);
    /* Y la comprobación que da sentido al apartado: con el mismo hormigón en
       bruto haría falta más radio, así que lo que abarata la obra es el
       acabado, no la forma. */
    const conElMismoHormigon = raiz((x) => manning((Math.PI * x * x) / 2, Math.PI * x, 0.015, 0.002) - Q, 0.5, 5);
    if (!(conElMismoHormigon > r)) throw new Error('el hormigón acabado debería permitir un canal más pequeño');
    cuadra.magnitud(id, 'El radio del canal semicircular', r, 'm');
  });
});

describe('5 · la maniobra de la compuerta a escala', () => {
  const id = 'exflu2425-ord-5-la-maniobra-de-la-compuerta-a-escala';
  const lambda = 1 / 12;
  /* «Respetando el número que contiene la viscosidad» es Reynolds, y con el
     mismo fluido en los dos lados eso fija la escala de velocidades sin más:
     lo que se gana en tamaño se paga en velocidad. */
  const relacionV = 1 / lambda;

  it('el prototipo solo sufre 0,025 bar', () => {
    /* Euler: la presión va con el cuadrado de la velocidad, así que el modelo
       exagera la maniobra 144 veces. Es la trampa del ensayo a escala con
       Reynolds — y por eso 3,6 bar en el laboratorio no asustan. */
    cuadra.magnitud(id, 'La variación de presión en el prototipo', 3.6 / relacionV ** 2, 'bar');
  });

  it('y su maniobra dura 1152 s', () =>
    /* El tiempo entra por el grupo v·t/D: se alarga por el tamaño y otra vez
       por la lentitud. */
    cuadra.magnitud(id, 'El tiempo de la maniobra en el prototipo', 8 * relacionV * (1 / lambda), 's'));

  it('y el modelo mueve la doceava parte del caudal', () =>
    cuadra(id, 'La relación de caudales', relacionV * lambda ** 2));
});

describe('6 · la central de tres turbinas', () => {
  const id = 'exflu2425-ord-6-la-central-de-tres-turbinas';
  const Q = 6;
  const [D1, L1] = [2.4, 1200];
  const v1 = Q / area(D1);
  const cinetica1 = (v1 * v1) / (2 * G);
  /* Hormigón: ε = 0,12 cm del cuadro n.º 20. */
  const relativa1 = 0.0012 / D1;
  const perdida1 = (eps: number) =>
    colebrook((v1 * D1) / NU, eps / D1) * (L1 / D1) * cinetica1 + 20 * cinetica1;

  it('el tubo principal pierde 2,55 m', () => {
    /* Y el reparto, que es lo que no se ve en el número: de esos 2,55 m,
       **1,80 los ponen los accesorios** y solo 0,76 el rozamiento de 1,2 km de
       tubería. Un k = 20 pesa más que un kilómetro de hormigón. */
    if (!(20 * cinetica1 > 2 * (perdida1(0.0012) - 20 * cinetica1)))
      throw new Error('los accesorios deberían pesar más que el rozamiento');
    /* Y el régimen: con ε/D = 5·10⁻⁴ el Reynolds de 3,2 millones está muy por
       encima del Re'' = 560/(ε/D) que el tema 18 da como frontera, así que
       esto es turbulencia rugosa y f no depende del caudal. */
    if (!((v1 * D1) / NU > 560 / relativa1)) throw new Error('el tubo no está en régimen rugoso');
    cuadra.magnitud(id, 'La pérdida del tubo principal', perdida1(0.0012), 'm');
  });

  it('y la central da 19,836 MW', () => {
    /* Los tres tubos de turbina van en paralelo: cada uno se lleva 2 m³/s, y su
       pérdida es la de uno solo, no la suma. */
    const v2 = Q / 3 / area(1);
    const perdida2 = colebrook((v2 * 1) / NU, 4.6e-5 / 1) * (28 / 1) * ((v2 * v2) / (2 * G));
    const neta = 860 - 520 - perdida1(0.0012) - perdida2;
    /* La desproporción, medida: barrer la rugosidad del hormigón por toda su
       banda mueve la pérdida del tubo 1 un 7 % y la potencia final un 0,08 %.
       Medio ejercicio afinando algo que no decide nada. */
    const extremos = [0.0003, 0.003].map((eps) => 9800 * Q * (860 - 520 - perdida1(eps) - perdida2));
    const potencia = 9800 * Q * neta;
    if (Math.abs(extremos[0] - extremos[1]) / potencia > 0.002)
      throw new Error('la potencia sí depende de la rugosidad, y el comentario dice que no');
    cuadra.magnitud(id, 'La potencia hidráulica', potencia / 1e6, 'MW');
  });
});

describe('7 · el flyboard y sus dos chorros', () => {
  const id = 'exflu2425-ord-7-el-flyboard-y-sus-dos-chorros';
  const [DA, DB] = [0.042, 0.03];
  const Qentrada = 28.4e-3;
  const rho = 1050;
  const gammaMar = rho * G;
  const vA = Qentrada / area(DA);

  it('el agua entra a 20,5 m/s', () => cuadra.magnitud(id, 'La velocidad de entrada', vA, 'm/s'));

  /* La velocidad de salida sale de la energía, no de la continuidad: carga de
     presión más carga cinética, corregidas por el coeficiente de velocidad.
     La presión viene en metros de un líquido de s = 0,5, que no es el que
     circula. */
  const cargaA = (4.4 * 0.5 * 1000 * G) / gammaMar + (vA * vA) / (2 * G);
  const vB = 0.9545 * Math.sqrt(2 * G * cargaA);

  /* Los dos chorros forman **entre ellos** un ángulo de 10°, así que cada uno
     se aparta 5° de la vertical. Con la otra lectura —10° cada uno— el empuje
     baja 7 N y el usuario pierde casi un kilo. */
  const medioAngulo = (5 * Math.PI) / 180;

  it('y el conjunto recibe 1250 N de empuje', () => {
    /* La comprobación que el propio enunciado permite y que casi nadie hace:
       el caudal que sale por las dos boquillas tiene que ser el que entra. Que
       cuadre al 0,01 % dice que la presión, los dos coeficientes y los tres
       diámetros son coherentes entre sí. */
    const Qsalida = 2 * 0.98 * area(DB) * vB;
    if (Math.abs(Qsalida / Qentrada - 1) > 1e-3) throw new Error('lo que sale no es lo que entra');
    const empuje = rho * Qentrada * (vA + vB * Math.cos(medioAngulo)) + 4.4 * 0.5 * 1000 * G * area(DA);
    cuadra(id, 'El empuje total', empuje);
  });

  it('y aguanta a un usuario de 82,6 kg', () => {
    const empuje = rho * Qentrada * (vA + vB * Math.cos(medioAngulo)) + 4.4 * 0.5 * 1000 * G * area(DA);
    cuadra(id, 'El peso máximo del usuario', (empuje - 45 * G) / G);
  });
});

describe('8 · el diafragma y su líquido manométrico', () => {
  const id = 'exflu2425-ord-8-el-diafragma-y-su-liquido-manometrico';
  /* La sensibilidad de un diafragma con manómetro en U va con |1 − s_m/s_0|:
     cuanto más se parezca el líquido manométrico al que circula, más se mueve
     la lectura por cada litro. */
  const glicerina = 1.26;
  const factor = (sm: number) => Math.abs(1 - sm / glicerina);
  const candidatos = { etanol: 0.81, agua: 1.0, tetracloruro: 1.52, mercurio: 13.6 };

  it('con agua el factor vale 0,206, y el tetracloruro empata con él', () => {
    /* Aquí está la gracia del enunciado, y solo se ve al ordenar los cuatro:
       **el agua y el tetracloruro dan exactamente la misma sensibilidad**,
       porque 1,26 es el punto medio de 1,00 y 1,52. Uno es más ligero que la
       glicerina y el otro más pesado, así que el manómetro se lee al revés en
       cada caso — y por eso el apartado a) dice que «existen dos opciones
       posibles» y las da las dos por válidas. Con un solo candidato ganador esa
       frase no tendría sentido. */
    const orden = Object.entries(candidatos).sort((a, b) => factor(a[1]) - factor(b[1]));
    if (orden[0][0] !== 'agua' && orden[0][0] !== 'tetracloruro')
      throw new Error(`el más sensible sale ${orden[0][0]}`);
    if (Math.abs(factor(candidatos.agua) - factor(candidatos.tetracloruro)) > 1e-12)
      throw new Error('el agua y el tetracloruro deberían empatar');
    if (!(candidatos.agua < glicerina && candidatos.tetracloruro > glicerina))
      throw new Error('los dos empatados deberían caer a lados distintos de la glicerina');
    /* Y el tercero, para que se vea que el empate no es que todo dé igual: el
       etanol se va a 0,357 y el mercurio a 9,79, casi cincuenta veces peor. */
    if (!(factor(candidatos.mercurio) > 40 * factor(candidatos.agua)))
      throw new Error('el mercurio debería ser malísimo aquí');
    cuadra(id, 'El factor de sensibilidad del agua', factor(candidatos.agua));
  });
});

describe('9 · la bomba leída en su anexo de curvas', () => {
  const id = 'exflu2425-ord-9-la-bomba-leida-en-su-anexo-de-curvas';
  /* Hazen-Williams en el SI, J = 10,7·Q^1,852/(C^1,852·D^4,87) con Q en m³/s
     y D en m, que es la misma fórmula que la J₁ del cuadro n.º 25 escrita en
     otras unidades. El coeficiente se pasa a l/s para compararlo. Fundición,
     ε = 0,026 cm (cuadro n.º 20): ε/D cae en la banda de C = 120 en los dos
     tramos. */
  const hw = (L: number, D: number, C: number) => (10.7 * L) / (C ** 1.852 * D ** 4.87);
  for (const D of [0.2, 0.15]) {
    const r = 0.00026 / D;
    if (!(r > 1e-3 && r < 4e-3)) throw new Error(`ε/D = ${r} no está en la banda de C = 120`);
  }
  const K = (hw(15, 0.2, 120) + hw(150, 0.15, 120)) * 0.001 ** 1.852;
  const hAsp = (q: number) => hw(15, 0.2, 120) * (q / 1000) ** 1.852;
  const instalacion = (q: number) => 32 + K * q ** 1.852;

  it('la curva de la instalación lleva 6,64·10⁻³ delante de Q^1,852', () =>
    cuadra(id, 'El coeficiente de la curva de la instalación', K));

  /* Las lecturas del anexo que publica el propio enunciado, bajo «Notas
     nuestras»: la altura del rodete de 214 mm, y dónde lo cortan las curvas
     de igual rendimiento. */
  const alturaBomba: [number, number][] = [[70, 58.1], [75, 56.5], [80, 54.7], [85, 52.4], [90, 49.6]];
  const lineal = (t: [number, number][], q: number) => {
    for (let i = 0; i < t.length - 1; i++)
      if (t[i][0] <= q && q <= t[i + 1][0]) return t[i][1] + ((q - t[i][0]) / (t[i + 1][0] - t[i][0])) * (t[i + 1][1] - t[i][1]);
    throw new Error(`${q} l/s está fuera de la tabla`);
  };
  const Q = raiz((q) => lineal(alturaBomba, q) - instalacion(q), 70, 90);
  const H = instalacion(Q);
  const eta = 80 - (3 * (Q - 76.6)) / (86.1 - 76.6); // entre la marca de 80 % y la de 77 %

  it('el punto de funcionamiento está en 80,5 l/s', () => cuadra.magnitud(id, 'El caudal del punto de funcionamiento', Q, 'l/s'));
  it('y 54,5 m', () => cuadra.magnitud(id, 'La altura del punto de funcionamiento', H, 'm'));
  it('con un rendimiento de 78,7 %', () => {
    /* Y cae a la derecha del óptimo: más caudal que el de la marca de 80. */
    if (!(Q > 76.6)) throw new Error('el punto debería estar a la derecha del rendimiento máximo');
    cuadra(id, 'El rendimiento en el punto de funcionamiento', eta);
  });
  it('y absorbe 54,63 kW', () =>
    cuadra.magnitud(id, 'La potencia absorbida', (GAMMA * (Q / 1000) * H) / (eta / 100), 'W'));
  /* El NPSH requerido, de la misma tabla de lecturas, en el caudal del cruce. */
  const npshReq: [number, number][] = [[75, 4.0], [80, 4.5], [85, 5.2]];
  it('y pide unos 4,7 m de NPSH', () => cuadra.magnitud(id, 'El NPSH requerido', lineal(npshReq, Q), 'm'));

  /* De aquí en adelante, con el punto impreso, que es el que usan los
     apartados c), d) y e) del cuadernillo. */
  const [Qi, Hi, etai] = [80.5, 54.5, 0.787];
  const patm = (1.04 * 101325) / GAMMA;

  it('el NPSH disponible son 5,41 m, por encima del requerido', () => {
    const npsh = patm - 0.2 - 4.6 - hAsp(Qi);
    /* 4,7 m es el requerido que imprime el cuadernillo, y 0,5 m el margen que
       pide el anexo: se cumplen los dos. */
    if (!(npsh > 4.7 + 0.5)) throw new Error('con este NPSH la bomba cavitaría');
    cuadra.magnitud(id, 'El NPSH disponible', npsh, 'm');
  });

  const ve = Qi / 1000 / area(0.2);
  const vs = Qi / 1000 / area(0.15);
  const pEntrada = patm - 4.6 - hAsp(Qi) - (ve * ve) / (2 * G); // m, absoluta

  it('el Bourdon marca 388,2 torr, en absolutas', () =>
    cuadra.magnitud(id, 'La lectura del Bourdon de la aspiración', pEntrada * GAMMA, 'Pa'));

  it('y el de fuelle 0,473 MPa, en manométricas', () => {
    const salida = pEntrada - patm + Hi + (ve * ve - vs * vs) / (2 * G);
    /* Por el otro lado de la bomba tiene que salir lo mismo: de la brida de
       salida a la lámina de arriba, 32 − 4,6 m más la pérdida de la
       impulsión, menos la altura cinética. */
    const porArriba = 32 - 4.6 + (K * Qi ** 1.852 - hAsp(Qi)) - (vs * vs) / (2 * G);
    if (Math.abs(salida - porArriba) > 0.1) throw new Error(`por la bomba ${salida} m, por la impulsión ${porArriba} m`);
    cuadra.magnitud(id, 'La lectura del manómetro de fuelle', salida * GAMMA, 'Pa');
  });

  it('y un día cuesta 105,31 €', () => {
    const kW = (GAMMA * (Qi / 1000) * Hi) / etai / 0.83 / 1000;
    cuadra(id, 'El coste diario de la instalación', kW * 16 * 0.1);
  });
});
