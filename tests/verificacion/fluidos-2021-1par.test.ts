/**
 * El primer parcial de Mecánica de Fluidos de 2020-2021. Doce respuestas.
 *
 * El ejercicio 3 tiene la idea más bonita de la asignatura y por eso el test la
 * comprueba en vez de usarla: **todas las presiones sobre un arco circular
 * pasan por su centro**. De ahí sale que el brazo de la resultante respecto de
 * la articulación sea el medio metro que separa O de C, y solo para la
 * componente horizontal —la vertical comparte vertical con O y no da momento—.
 * El test integra la presión punto a punto sobre el arco y comprueba que la
 * línea de acción pasa de verdad por C antes de usar ese medio metro para
 * nada.
 *
 * Y el ejercicio 4 es el que más unidades cobra del corpus: UTM que hay que
 * multiplicar por g, dinas por centímetro cuadrado que son décimas de pascal,
 * y dos presiones dadas a propósito de maneras distintas —una absoluta y otra
 * manométrica— cuando la fórmula de dilatación pide siempre la manométrica y
 * la ley de los gases siempre la absoluta.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { integra, raiz } from './numerico';

const cuadra = convocatoria('fluidos', '2020-2021-1par');

const G = 9.8;
const GAMMA = 1000 * G;

describe('1 · seis afirmaciones, y las seis falsas', () => {
  const id = 'exflu2021-1par-1-seis-afirmaciones-y-las-seis-falsas';

  it('la viscosidad dinámica son 2,46·10⁻⁴ Pl, no 10⁻³', () => {
    /* Un centistokes es 10⁻⁶ St, o sea 10⁻⁶ m²/s. El peso específico que da el
       enunciado en kg/m³ es en realidad la densidad. La afirmación falla por
       un factor diez. */
    const mu = 820 * 0.3e-6;
    if (Math.abs(mu - 2.46e-3) < 1e-9) throw new Error('la afirmación del enunciado sería cierta, y es falsa');
    cuadra(id, 'La viscosidad dinámica de la afirmación e)', mu);
  });

  it('y la relación de fuerzas es √2, no √2/2', () => {
    /* Con la adhesión perpendicular a la pared y la cohesión a 45°, el ángulo
       de contacto de 90° exige que la componente perpendicular de la
       resultante se anule. Se resuelve esa condición en vez de recordar el
       resultado. */
    const razon = raiz((r) => 1 / r - Math.cos(Math.PI / 4), 0.5, 5);
    cuadra(id, 'La relación de fuerzas de la afirmación d)', razon);
  });
});

describe('2 · el micromanómetro que hay que diseñar', () => {
  const id = 'exflu2021-1par-2-el-micromanometro-que-hay-que-disenar';
  /* Tres fluidos inmiscibles disponibles. La lectura es R = p/(γ₂−γ₁), así que
     la pareja más precisa es la de densidades más parecidas: se eligen
     probándolas todas, no leyendo la tabla. */
  const fluidos = { aceite: 0.85, agua: 1, tetracloruro: 1.52 };
  const parejas = Object.entries(fluidos).flatMap(([a, sa], i, todos) =>
    todos.slice(i + 1).map(([b, sb]) => ({ nombre: `${a}+${b}`, salto: Math.abs(sb - sa) })),
  );
  const elegida = parejas.reduce((p, q) => (q.salto < p.salto ? q : p));

  it('la lectura es de 28 cm', () => {
    if (elegida.nombre !== 'aceite+agua') throw new Error(`la pareja elegida sale ${elegida.nombre}`);
    cuadra(id, 'La lectura del micromanómetro', 0.042 / elegida.salto);
  });

  it('y la presión absoluta del depósito, 1,002 bar', () => {
    /* 755 mm de mercurio menos los 42 mm de columna de agua del vacío. */
    const barometro = 0.755 * 13600 * G;
    cuadra(id, 'La presión absoluta del depósito', (barometro - 0.042 * GAMMA) / 1e5);
  });

  it('y el tubo inclinado equivalente va a 10,8 grados', () => {
    /* Para que un tubo inclinado de alcohol dé la misma sensibilidad, la
       componente vertical de su columna tiene que valer lo mismo que el salto
       de densidades de la pareja elegida. */
    const alfa = raiz((a) => 0.8 * Math.sin((a * Math.PI) / 180) - elegida.salto, 1, 89);
    cuadra(id, 'El ángulo del tubo inclinado equivalente', alfa);
  });
});

describe('3 · la compuerta que se abre a los cuatro metros', () => {
  const id = 'exflu2021-1par-3-la-compuerta-que-se-abre-a-los-cuatro-metros';
  /* Con el fondo en z = 0: A al nivel del fondo, C un metro por debajo, O medio
     metro por debajo de C. El arco tiene radio 6 centrado en C. */
  const [R, a, c, b] = [6, 1, 0.5, 3];
  const xA = Math.sqrt(R * R - a * a);
  const pesoTotal = 1000 * b * G;
  const xG = 4;

  it('el centro de presiones está a 1,67 m de C', () => {
    /* El de una pared vertical de calado h está a h/3 del fondo, y C queda a
       metro por debajo. Se integra la presión y su momento, en vez de
       aplicar la fórmula. */
    const h = 2;
    const fuerza = integra((z) => GAMMA * (h - z) * b, 0, h, 1e-11);
    const momento = integra((z) => GAMMA * (h - z) * b * (z + a), 0, h, 1e-11);
    cuadra(id, 'El centro de presiones de la fuerza horizontal', momento / fuerza);
  });

  /* La resultante del agua sobre el arco pasa por C, así que su brazo respecto
     de O es c, y solo para la horizontal. */
  const horizontal = (h: number) => (GAMMA * h * h * b) / 2;
  const reaccion = (h: number) => (pesoTotal * xG - c * horizontal(h)) / xA;

  it('sin agua el apoyo aguanta 19.878 N', () => {
    /* Antes de usar el brazo de medio metro se comprueba lo que lo justifica:
       cada elemento del arco empuja según su radio, así que la línea de acción
       de la resultante pasa por el centro de curvatura. Se integra la presión
       sobre el arco mojado y se mira dónde corta su resultante. */
    const h = 2;
    const hasta = Math.acos((h - -a) / R); // ángulo desde la vertical de C
    let Fx = 0;
    let Fz = 0;
    let momentoEnC = 0;
    const n = 200000;
    for (let k = 0; k < n; k++) {
      const th = hasta + ((Math.acos(a / R) - hasta) * (k + 0.5)) / n;
      const z = -a + R * Math.cos(th);
      const x = R * Math.sin(th);
      const p = GAMMA * (h - z);
      const ds = ((R * (Math.acos(a / R) - hasta)) / n) * b;
      Fx += -p * Math.sin(th) * ds;
      Fz += -p * Math.cos(th) * ds;
      momentoEnC += (x * (-p * Math.cos(th)) - (z + a) * (-p * Math.sin(th))) * ds;
    }
    if (Math.abs(momentoEnC) > 1e-6 * Math.abs(Fx)) throw new Error('la resultante no pasa por C');
    if (Math.abs(Math.abs(Fx) - horizontal(h)) / horizontal(h) > 1e-4)
      throw new Error('la horizontal integrada no coincide con el prisma');
    cuadra.magnitud(id, 'La reacción del apoyo con el embalse vacío', reaccion(0), 'N');
  });

  it('y se abre sola a los 4 m', () => {
    /* El apoyo solo puede empujar: la compuerta se abre cuando su reacción
       llega a cero. */
    cuadra.magnitud(id, 'El calado al que la compuerta se abre sola', raiz(reaccion, 0.1, R - a), 'm');
  });

  it('y la vertical a 2 m son 17.207 N', () => {
    /* El agua que descansa sobre el arco, entre la vertical de A y la propia
       curva. El corte con la superficie se busca, no se copia. */
    const h = 2;
    const anchoDelArco = (z: number) => Math.sqrt(R * R - (z + a) ** 2);
    const volumen = integra((z) => xA - anchoDelArco(z), 0, h, 1e-10);
    cuadra.magnitud(id, 'La fuerza vertical del agua', GAMMA * b * volumen, 'N');
  });
});

describe('4 · el depósito que se dilata', () => {
  const id = 'exflu2021-1par-4-el-deposito-que-se-dilata';
  const patm = 0.99e5;
  /* Las tres trampas de unidades del enunciado, escritas donde se ven. */
  const rho0 = 73.5 * G; // UTM/m³ → kg/m³
  const K = 2e10 * 0.1; // dyn/cm² → Pa
  const pQuerosenoAbs = 60.8 * 13600 * G; // 6080 cmcHg, absoluta
  const manometrica = pQuerosenoAbs - patm;

  it('el queroseno comprimido pesa 723,19 kg/m³', () => {
    if (Math.abs(manometrica / 1e5 - 80.04) > 0.05) throw new Error('la manométrica no sale en 80 bar');
    cuadra(id, 'La densidad del queroseno comprimido', rho0 * Math.exp(manometrica / K));
  });

  it('y el butano, 11,89 kg/m³', () => {
    /* Los 4 bar del butano son **manométricos**, y la ley de los gases pide la
       absoluta; además R viene en atmósferas. */
    const absolutaEnAtm = (4e5 + patm) / 101325;
    cuadra.magnitud(id, 'La densidad del butano', (absolutaEnAtm * 58) / (0.082 * (20 + 273)), 'kg/m3');
  });

  it('y el depósito lleno de queroseno pesa 354,98 kN', () => {
    /* Cilindro de 5 m más dos semiesferas de radio 1,5, dilatado por la
       fórmula del enunciado, que pide la presión manométrica en bar. */
    const [L, R] = [5, 1.5];
    const geometrico = Math.PI * R * R * L + (4 / 3) * Math.PI * R ** 3;
    const dilatado = geometrico * (1 + (Math.exp(manometrica / 1e5 / 100) - 1) / 100);
    const conQueroseno = rho0 * Math.exp(manometrica / K) * G * dilatado;
    /* Y de paso el porqué del apartado: con butano pesaría sesenta veces
       menos, así que el tejado lo dimensiona el queroseno. */
    const conButano = (((4e5 + patm) / 101325) * 58) / (0.082 * 293) * G * geometrico * 1.04;
    if (!(conQueroseno > 50 * conButano)) throw new Error('el butano no queda tan lejos como debería');
    cuadra(id, 'El peso máximo del depósito lleno', conQueroseno / 1000);
  });
});
