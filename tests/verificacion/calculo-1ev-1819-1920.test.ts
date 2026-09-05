/**
 * Las primeras evaluaciones de Cálculo de 2018-2019 y 2019-2020. Siete
 * respuestas entre las dos.
 *
 * Y una observación que sale de haber escrito ya las once primeras
 * evaluaciones seguidas: **el ejercicio 3 es siempre el mismo**. Una
 * demostración por reducción al absurdo sobre el límite de una sucesión —que
 * hereda una desigualdad, que es único, que no cambia de signo—, y en todas el
 * paso que decide es elegir el épsilon. Ocho de las once lo piden, y en las
 * ocho la respuesta es **la mitad de la distancia que hay que separar**. Por
 * eso el helper `epsilon` está escrito una vez y se usa en todas: que sea el
 * mismo código es la forma de dejar dicho que es el mismo ejercicio.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { cCos, cModulo, cPor, cSen, cSuma, raiz, type C } from './numerico';

const cuadra1920 = convocatoria('calculo', '2019-2020-1ev');
const cuadra1819 = convocatoria('calculo', '2018-2019-1ev');

const polar = (r: number, gr: number): C => [
  r * Math.cos((gr * Math.PI) / 180),
  r * Math.sin((gr * Math.PI) / 180),
];
const epsilon = (a: number, b: number) => Math.abs(a - b) / 2;

describe('2019-2020 · 1 · Apolonio con la raíz cúbica', () => {
  it('la razón del cociente vale 2', () => {
    /* z₃ es la raíz imaginaria pura de ∛(8i). Se calculan las tres y se
       filtra: si hubiera dos, o ninguna, el enunciado no tendría sentido y el
       test lo diría. */
    const raices = [0, 1, 2].map((k) => polar(2, (90 + 360 * k) / 3));
    for (const z of raices) {
      const cubo = cPor(cPor(z, z), z);
      if (cModulo([cubo[0] - 0, cubo[1] - 8]) > 1e-9) throw new Error('esa no es raíz cúbica de 8i');
    }
    const puras = raices.filter((z) => Math.abs(z[0]) < 1e-9);
    if (puras.length !== 1) throw new Error(`hay ${puras.length} raíces imaginarias puras, y debería haber una`);
    cuadra1920('ex1920-1-apolonio-con-raiz-cubica', 'La razón del cociente', cModulo(cSuma([0, 4], puras[0])));
  });
});

describe('2019-2020 · 2 · el seno de una suma', () => {
  it('la parte imaginaria de sen(2i) vale 3,627', () => {
    /* Se comprueba la fórmula que el ejercicio pide demostrar, en el caso
       concreto que el paso usa: sen(i+i) por un lado, y sen i·cos i + cos i·sen
       i por el otro. */
    const i: C = [0, 1];
    const directo = cSen([0, 2]);
    const porLaFormula = cSuma(cPor(cSen(i), cCos(i)), cPor(cCos(i), cSen(i)));
    if (cModulo([directo[0] - porLaFormula[0], directo[1] - porLaFormula[1]]) > 1e-9)
      throw new Error('la fórmula de adición no cuadra');
    if (Math.abs(directo[0]) > 1e-12) throw new Error('sen(2i) debería ser imaginario puro');
    cuadra1920('ex1920-2-seno-de-una-suma', 'Un valor que comprueba la fórmula', directo[1]);
  });
});

describe('2019-2020 · 3 · la unicidad del límite', () => {
  it('el épsilon con dos límites 2 y 3 es 0,5', () => {
    /* Con ese épsilon las dos bandas no se tocan, y ahí está el absurdo: la
       sucesión tendría que estar a la vez en las dos. */
    const [L1, L2] = [2, 3];
    const eps = epsilon(L1, L2);
    if (!(L1 + eps <= L2 - eps)) throw new Error('las dos bandas se solapan');
    cuadra1920('ex1920-3-unicidad-del-limite', 'El épsilon', eps);
  });
});

describe('2019-2020 · 4 · los tres tramos y su serie', () => {
  it('el ínfimo vale 0,9995', () => {
    /* n³ hasta el 999, después una constante y después 1−1/n. El mínimo no
       está donde uno lo buscaría: el primer tramo empieza en 1 y el tercero
       arranca justo por debajo. */
    const a = (n: number) => (n < 1000 ? n ** 3 : n < 2000 ? 1 : 1 - 1 / n);
    let menor = Infinity;
    for (let n = 1; n <= 200000; n++) menor = Math.min(menor, a(n));
    cuadra1920('ex1920-4-tres-tramos-y-su-serie', 'El ínfimo', menor);
  });
});

describe('2018-2019 · 2 · la bicúbica', () => {
  const id = 'ex1819-2-bicubica';
  /* z⁶ + 7z³ − 8 = 0. Con w = z³ queda una de segundo grado. */
  const auxiliares = [
    raiz((w) => w * w + 7 * w - 8, 0, 5),
    raiz((w) => w * w + 7 * w - 8, -20, -5),
  ];

  it('las dos raíces auxiliares son 1 y −8', () =>
    cuadra1819.conjunto(id, 'Las dos raíces auxiliares', auxiliares));

  it('y la ecuación original tiene seis soluciones', () => {
    /* Las tres raíces cúbicas de cada auxiliar, comprobadas una a una contra
       la ecuación original y contadas descartando repeticiones: si las dos
       auxiliares compartieran alguna raíz, saldrían menos de seis. */
    const soluciones: C[] = [];
    for (const w of auxiliares) {
      const modulo = Math.abs(w) ** (1 / 3);
      const base = w > 0 ? 0 : 60;
      for (const k of [0, 1, 2]) {
        const z = polar(modulo, base + 120 * k);
        let z3: C = [1, 0];
        for (let n = 0; n < 3; n++) z3 = cPor(z3, z);
        const z6 = cPor(z3, z3);
        const residuo = cSuma(cSuma(z6, cPor([7, 0], z3)), [-8, 0]);
        if (cModulo(residuo) > 1e-9) throw new Error(`${z} no resuelve la ecuación`);
        if (!soluciones.some((s) => cModulo([s[0] - z[0], s[1] - z[1]]) < 1e-9)) soluciones.push(z);
      }
    }
    cuadra1819(id, 'Cuántas soluciones tiene la ecuación original', soluciones.length);
  });
});

describe('2018-2019 · 3 · las definiciones y la desigualdad', () => {
  it('el n₀ de la divergencia es 20', () => {
    /* aₙ = −n² diverge hacia −∞: hay que dar el primer n₀ a partir del cual
       todos los términos bajan de −400. Se busca contando, no despejando. */
    const a = (n: number) => -(n ** 2);
    const M = -400;
    let n0 = 0;
    for (let n = 1; n <= 10000; n++) if (a(n) >= M) n0 = n;
    /* Y se comprueba que es el menor: en n₀ todavía no se cumple, y a partir
       de ahí sí. */
    if (a(n0) < M) throw new Error('en n₀ ya se cumplía, así que no es el menor');
    if (a(n0 + 1) >= M) throw new Error('después de n₀ sigue sin cumplirse');
    cuadra1819('ex1819-3-definiciones-y-desigualdad', 'La definición, aplicada', n0);
  });
});
