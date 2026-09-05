/**
 * Las primeras evaluaciones de Cálculo de 2022-2023 y 2023-2024. Nueve
 * respuestas entre las dos.
 *
 * El ejercicio 1 de 2022-2023 tiene el apartado más raro del corpus: pregunta
 * por los complejos que cumplen |z|⁴ = 1 + i√3, y **no hay ninguno**, porque el
 * primer miembro es un real no negativo y el segundo no es real. El test no se
 * limita a escribir el cero: mide la distancia mínima entre los dos miembros
 * sobre una malla y comprueba que nunca baja de √3, que es la razón de que el
 * conjunto esté vacío.
 *
 * Y las dos convocatorias repiten literalmente el mismo ejercicio de
 * demostración —la desigualdad que sobrevive al límite— con distintos números.
 * Los dos épsilon se calculan con la misma función, que es lo que deja dicho
 * que son el mismo ejercicio.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { cCos, cEntre, cModulo, cPor, raiz, type C } from './numerico';

const cuadra2324 = convocatoria('calculo', '2023-2024-1ev');
const cuadra2223 = convocatoria('calculo', '2022-2023-1ev');

const polar = (r: number, gr: number): C => [
  r * Math.cos((gr * Math.PI) / 180),
  r * Math.sin((gr * Math.PI) / 180),
];
const grados = ([a, b]: C) => ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360;
/** El épsilon de la reducción al absurdo: la mitad de lo que hay que separar. */
const epsilon = (mayor: number, menor: number) => (mayor - menor) / 2;

describe('2023-2024 · 1 · la semirrecta vertical', () => {
  it('el extremo del lugar geométrico es 2 + 0,5i', () => {
    /* Primera condición: arg(1/(z−2−3i)) = π/2, o sea que el inverso de
       z−2−3i es un imaginario puro. Se resuelve tal cual: se anula la parte
       real de ese inverso, a una altura cualquiera. */
    const inverso = (x: number, y: number): C => cEntre([1, 0], [x - 2, y - 3]);
    const abscisa = raiz((x) => inverso(x, 0)[0], -10, 10);
    if (!(inverso(abscisa, 0)[1] > 0)) throw new Error('el argumento sale −π/2, no π/2');
    /* Segunda: |z| ≤ |conj z + i|. La frontera se busca en y. */
    const frontera = (x: number) => (y: number) =>
      Math.hypot(x, y) - Math.hypot(x, 1 - y);
    const ordenada = raiz(frontera(abscisa), -10, 10);
    /* Y se comprueba que el punto cumple de verdad las dos condiciones: que
       z−2−3i mira hacia abajo, y que la desigualdad está en su borde. */
    const bajoElCentro = [abscisa - 2, ordenada - 3];
    if (Math.abs(bajoElCentro[0]) > 1e-9 || bajoElCentro[1] >= 0)
      throw new Error('el punto no está en la semirrecta');
    cuadra2324.complejo('ex2324-1-semirrecta-vertical', 'El extremo del lugar geométrico', [abscisa, ordenada]);
  });
});

describe('2023-2024 · 2 · el triángulo girado', () => {
  const id = 'ex2324-2-triangulo-girado';
  /* Un vértice girado 15° cae en 3∠135°. Deshacer el giro es dividir por el
     complejo unitario del giro. */
  const girado = polar(3, 135);
  const giro = polar(1, 180 / 12);
  const original = cEntre(girado, giro);
  /* Y los otros dos vértices, a 120° cada uno: es un triángulo equilátero
     centrado en el origen. */
  const vertices = [0, 1, 2].map((k) => polar(cModulo(original), grados(original) + 120 * k));

  it('el vértice original está a 120 grados', () => {
    if (Math.abs(cModulo(original) - 3) > 1e-9) throw new Error('el giro ha cambiado el módulo');
    cuadra2324(id, 'Deshacer el giro', grados(original));
  });

  it('y uno de los tres es el 3 real', () => {
    const reales = vertices.filter((z) => Math.abs(z[1]) < 1e-9);
    if (reales.length !== 1) throw new Error(`hay ${reales.length} vértices reales, y debería haber uno`);
    cuadra2324(id, 'El vértice real', reales[0][0]);
  });
});

describe('2023-2024 · 3 · la desigualdad al límite', () => {
  it('el épsilon con x = 5 e y = 2 es 1,5', () => {
    const [x, y] = [5, 2];
    const eps = epsilon(x, y);
    /* Con ese épsilon las dos bandas quedan separadas, y ahí está el absurdo:
       x_n acabaría por encima de y_n. */
    if (!(y + eps <= x - eps)) throw new Error('las dos bandas se solapan');
    cuadra2324('ex2324-3-desigualdad-al-limite', 'El épsilon', eps);
  });
});

describe('2023-2024 · 4 · la sucesión y la serie a trozos', () => {
  const id = 'ex2324-4-sucesion-y-serie-a-trozos';
  const a = (n: number) => (n <= 2 ? n * n : 1 / 3 ** n);

  it('la sucesión tiende a cero', () => {
    /* Los dos primeros términos valen 1 y 4 y no cuentan para el límite: se
       mira muy lejos. */
    const lejos = [100, 1000, 5000].map(a);
    if (lejos.some((v) => v > 1e-40)) throw new Error('no se acerca a cero');
    cuadra2324(id, 'El límite de la sucesión', lejos[2]);
  });

  it('y la serie suma 91/18', () => {
    /* Los dos primeros términos sí cuentan para la suma, y son la mitad de la
       gracia del ejercicio. */
    let s = 0;
    for (let n = 300; n >= 1; n--) s += a(n);
    cuadra2324(id, 'La suma de la serie', s);
  });
});

describe('2022-2023 · 1 · la recta y el conjunto vacío', () => {
  const id = 'ex2223-1-recta-y-conjunto-vacio';

  it('los afijos del apartado (a) están en una recta de pendiente 1', () => {
    /* arg((z + conj(1−2i))/(1−z)) = π. Para cada abscisa se busca la ordenada
       que hace real el cociente, y se exige además que la parte real sea
       negativa —que es lo que distingue el argumento π del argumento 0—. */
    const cociente = (x: number, y: number) => cEntre([x + 1, y + 2], [1 - x, -y]);
    const enLaRecta = (x: number) => {
      const y = raiz((t) => cociente(x, t)[1], x - 6, x + 4);
      if (cociente(x, y)[0] >= 0) throw new Error(`en x=${x} el argumento sale 0, no π`);
      return y;
    };
    const [a, b] = [-3, 3];
    cuadra2223(id, 'La recta del apartado (a)', (enLaRecta(b) - enLaRecta(a)) / (b - a));
  });

  it('y el apartado (b) no tiene ninguna solución', () => {
    /* |z|⁴ es un real no negativo y 1+i√3 no es real, así que los dos miembros
       no se pueden encontrar. Se mide: sobre una malla ancha del plano, la
       distancia entre ellos nunca baja de √3, que es exactamente la parte
       imaginaria que sobra. */
    let masCerca = Infinity;
    for (let x = -4; x <= 4; x += 0.02)
      for (let y = -4; y <= 4; y += 0.02)
        masCerca = Math.min(masCerca, Math.hypot(Math.hypot(x, y) ** 4 - 1, Math.sqrt(3)));
    if (masCerca < Math.sqrt(3) - 1e-9) throw new Error('alguno se acerca más de lo posible');
    /* Y el recuento que se publica sale de contar, no de escribirlo: puntos
       de la malla que cumplen la ecuación con margen amplio. */
    let cuantos = 0;
    for (let x = -4; x <= 4; x += 0.02)
      for (let y = -4; y <= 4; y += 0.02)
        if (Math.hypot(Math.hypot(x, y) ** 4 - 1, Math.sqrt(3)) < 0.5) cuantos++;
    cuadra2223(id, 'El apartado (b)', cuantos);
  });
});

describe('2022-2023 · 2 · la identidad del coseno al cuadrado', () => {
  it('el coseno al cuadrado de i vale 2,381', () => {
    /* Se calcula por los dos lados de la identidad que el ejercicio pide
       demostrar: al cuadrado directamente, y por (1+cos 2z)/2. Que coincidan
       es la comprobación; que valga más de 1 es lo que en los reales sería
       imposible. */
    const directo = cPor(cCos([0, 1]), cCos([0, 1]));
    const porLaFormula = cEntre([1 + cCos([0, 2])[0], cCos([0, 2])[1]], [2, 0]);
    if (cModulo([directo[0] - porLaFormula[0], directo[1] - porLaFormula[1]]) > 1e-9)
      throw new Error('los dos lados de la identidad no coinciden');
    if (Math.abs(directo[1]) > 1e-12) throw new Error('debería salir real');
    cuadra2223('ex2223-2-identidad-coseno-cuadrado', 'Un valor que en los reales sería imposible', directo[0]);
  });
});

describe('2022-2023 · 3 · la desigualdad al límite, otra vez', () => {
  it('el épsilon con x = 1 e y = 0,4 es 0,3', () => {
    /* Mismo ejercicio que el 3 de 2023-2024 con otros números, y por eso mismo
       épsilon: la mitad de la distancia. */
    const eps = epsilon(1, 0.4);
    if (!(0.4 + eps <= 1 - eps)) throw new Error('las dos bandas se solapan');
    cuadra2223('ex2223-3-desigualdad-al-limite', 'El épsilon', eps);
  });
});

describe('2022-2023 · 4 · las definiciones y la serie', () => {
  it('el mayor valor de la sucesión es 361', () => {
    /* n² hasta el 19 y luego una cola que se acerca a 2 por debajo: el máximo
       está en el salto, no en el infinito. Se busca recorriendo. */
    const a = (n: number) => (n < 20 ? n * n : 2 - 1 / (n * n));
    let mayor = -Infinity;
    for (let n = 1; n <= 100000; n++) mayor = Math.max(mayor, a(n));
    cuadra2223('ex2223-4-definiciones-y-serie', 'El supremo de la sucesión', mayor);
  });
});
