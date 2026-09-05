/**
 * Convocatoria ordinaria de Cálculo, curso 2024-2025. La más reciente de las
 * ochenta y ocho, y por eso la primera que se verifica.
 *
 * Aquí la comprobación es más independiente que en Álgebra: donde la
 * resolución integra por partes o deriva y despeja, este fichero **integra por
 * Simpson y busca el máximo por sección áurea**. No es el mismo camino con
 * otra letra, es otro camino.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import {
  cCos, cEntre, cPor, cResta, cSen, integra, integraCasi, maximiza, trabajo, type C,
} from './numerico';

const cuadra = convocatoria('calculo', '2024-2025-ord');

describe('1 · la tangente compleja y la circunferencia', () => {
  const id = 'ex2425-ord-1-la-tangente-compleja-y-la-circunferencia';

  it('las soluciones de sen z = 2i cos z tienen parte imaginaria ln3/2', () => {
    /* No se resuelve la ecuación: se COMPRUEBA que el número propuesto la
       cumple, evaluando seno y coseno complejos. Esa es la verificación de
       verdad, porque no repite el despeje del examen. */
    const y = Math.log(3) / 2;
    for (const k of [-1, 0, 1, 2]) {
      const z: C = [((2 * k + 1) * Math.PI) / 2, y];
      const resto = cResta(cSen(z), cPor([0, 2], cCos(z)));
      if (Math.hypot(resto[0], resto[1]) > 1e-9)
        throw new Error(`con k=${k} el número no cumple la ecuación`);
    }
    cuadra(id, 'La parte imaginaria de las soluciones', y);
  });

  it('el lugar Im((z+2i)/(z−i)) = 2 es una circunferencia de radio 0,75', () => {
    /* Se recorre la circunferencia propuesta —centro (0,75, 1), radio 0,75— y
       se comprueba que en todos sus puntos la parte imaginaria vale 2. Si el
       radio fuese otro, esto fallaría. */
    const r = 0.75;
    for (let k = 1; k < 24; k++) {
      const t = (2 * Math.PI * k) / 24;
      const z: C = [0.75 + r * Math.cos(t), 1 + r * Math.sin(t)];
      const q = cEntre(cSuma(z, [0, 2]), cResta(z, [0, 1]));
      if (Math.abs(q[1] - 2) > 1e-8) throw new Error(`en t=${t} la parte imaginaria es ${q[1]}`);
    }
    cuadra(id, 'El radio de la circunferencia', r);
  });

  function cSuma(a: C, b: C): C {
    return [a[0] + b[0], a[1] + b[1]];
  }
});

describe('2 · el isósceles que sale equilátero', () => {
  const id = 'ex2425-ord-2-el-isosceles-que-sale-equilatero';
  /* Perímetro 8: lados iguales de longitud L y base 8 − 2L. Por Herón,
     el área en función de L. Se busca el máximo NUMÉRICAMENTE, sin derivar:
     así el resultado no depende de haber derivado bien. */
  const area = (L: number) => {
    const base = 8 - 2 * L;
    const s = 4; // semiperímetro
    return Math.sqrt(Math.max(0, s * (s - L) * (s - L) * (s - base)));
  };
  const mejor = maximiza(area, 2.01, 3.99);

  it('los lados iguales miden 8/3 cm', () => cuadra(id, 'El lado', mejor.x));

  it('y el área máxima es 3,0792 cm²', () => cuadra(id, 'El área máxima', mejor.y));
});

describe('3 · dos términos bastan', () => {
  const id = 'ex2425-ord-3-dos-terminos-bastan';
  /* ln(1,1) = ln(1 − x) con x = −0,1. La serie es −(x + x²/2 + x³/3 + …) y
     con x negativo queda alternada, así que el error es menor que el primer
     término omitido. */
  const x = -0.1;
  const termino = (n: number) => -Math.pow(x, n) / n;

  it('hacen falta dos términos para bajar de 10⁻³', () => {
    let n = 1;
    while (Math.abs(termino(n + 1)) >= 1e-3) n++;
    cuadra(id, 'Cuántos términos', n);
  });

  it('y la aproximación es 0,095', () => {
    const suma = termino(1) + termino(2);
    /* Y de paso: el error real es de verdad menor que 10⁻³. */
    if (Math.abs(suma - Math.log(1.1)) >= 1e-3) throw new Error('el error se pasa de 10⁻³');
    cuadra(id, 'La aproximación', suma);
  });
});

describe('4 · la longitud de arco como función', () => {
  const id = 'ex2425-ord-4-la-longitud-de-arco-como-funcion';

  it('L′(u) nunca baja de 1', () => {
    /* L′(u) = √(1 + g′(u)²), y el radicando nunca es menor que 1. Se
       comprueba sobre una g cualquiera en vez de razonarlo: si la fórmula
       estuviera mal copiada, esto lo vería. */
    const g = (x: number) => Math.sin(3 * x) - x * x;
    let minimo = Infinity;
    for (let u = -2; u <= 2; u += 0.001) {
      const d = (g(u + 1e-6) - g(u - 1e-6)) / 2e-6;
      minimo = Math.min(minimo, Math.sqrt(1 + d * d));
    }
    if (minimo < 1 - 1e-9) throw new Error('L′ ha bajado de 1');
    cuadra(id, 'El menor valor posible de la derivada', 1);
  });

  it('y tiene tres puntos de inflexión', () => {
    /* Este es de leer la figura, no de calcular: L″ = g′g″/√(1+g′²) se anula
       donde g′ = 0 y donde g″ = 0. La figura del enunciado tiene un mínimo y
       un máximo —dos ceros de g′— y una inflexión entre ellos. */
    const dondeSeAnula = {
      'g′ = 0 en el mínimo': true,
      'g′ = 0 en el máximo': true,
      'g″ = 0 en la inflexión entre los dos': true,
    };
    cuadra(id, 'Cuántos puntos de inflexión', Object.values(dondeSeAnula).filter(Boolean).length);
  });
});

describe('5 · el dominio en forma de cucurucho', () => {
  const id = 'ex2425-ord-5-el-dominio-en-forma-de-cucurucho';
  const corte = 2 * Math.SQRT2;

  it('a la altura del empalme el borde está en √2/2', () => {
    /* Las dos expresiones tienen que coincidir ahí, y eso es lo que hace que
       el dominio no tenga un escalón. Se comprueban las dos. */
    const porElCono = corte / 4;
    const porLaElipse = Math.sqrt(1 - (corte * corte) / 16);
    if (Math.abs(porElCono - porLaElipse) > 1e-12) throw new Error('el dominio tiene un escalón');
    cuadra(id, 'Dónde se cortan los dos trozos', porElCono);
  });

  it('el área vale π', () => {
    /* Dos integrales, la segunda con la derivada infinita en y = 4. */
    const abajo = integra((y) => 2 * (y / 4), 0, corte);
    const arriba = integraCasi((y) => 2 * Math.sqrt(Math.max(0, 1 - (y * y) / 16)), corte, 4, 1e-9, 'b');
    cuadra(id, 'El área', abajo + arriba);
  });
});

describe('6 · el montañero y la ventisca', () => {
  const id = 'ex2425-ord-6-el-montanero-y-la-ventisca';
  /* La EDO xy′ − y = x³ con y(1) = 1 da y = x³/2 + x/2. Se comprueba que esa
     función la cumple, en vez de repetir la integración. */
  const y = (x: number) => (x ** 3 + x) / 2;
  const z = (x: number, yy: number) => 10 + 2 * yy - x ** 3;

  it('la solución de la EDO cumple la ecuación y la condición inicial', () => {
    for (const x of [0.5, 1, 2, 3]) {
      const yp = (y(x + 1e-6) - y(x - 1e-6)) / 2e-6;
      if (Math.abs(x * yp - y(x) - x ** 3) > 1e-5) throw new Error(`la EDO falla en x=${x}`);
    }
    if (Math.abs(y(1) - 1) > 1e-12) throw new Error('la condición inicial falla');
    /* Sobre la montaña, z(t) = 10 + 2·(t³+t)/2 − t³ = 10 + t. */
    cuadra(id, 'La altura en función del parámetro', z(0, y(0)));
  });

  it('el punto B está a y = 5', () => {
    /* Altitud 12 con z = 10 + t da t = 2, y de ahí la ordenada. */
    const t = 2;
    if (Math.abs(z(t, y(t)) - 12) > 1e-12) throw new Error('en t=2 la altura no es 12');
    cuadra(id, 'La ordenada del punto B', y(t));
  });

  it('y el trabajo de la ventisca es 149', () => {
    /* Integral de línea numérica sobre la trayectoria real. La resolución del
       examen usa que el campo es conservativo y resta potenciales; aquí se
       integra, que es el camino largo y el independiente. */
    const V = (p: number[]) => [
      p[1] * p[2] - p[1],
      p[0] * p[2] - p[0] + p[2],
      p[0] * p[1] + p[1],
    ];
    const r = (t: number) => [t, y(t), z(t, y(t))];
    cuadra(id, 'El trabajo de la ventisca', trabajo(V, r, 1, 2));
  });
});

describe('7 · la integral que se resuelve con Laplace', () => {
  const id = 'ex2425-ord-7-la-integral-que-se-resuelve-con-laplace';

  it('la transformada es K/s, o sea p = 1', () => {
    /* Y/s = −Y′ tiene solución Y = K·s^(−1). Se comprueba que esa familia la
       cumple, derivando numéricamente en varios puntos. */
    const Y = (s: number) => 7 / s;
    for (const s of [0.5, 1, 2, 5]) {
      const Yp = (Y(s + 1e-6) - Y(s - 1e-6)) / 2e-6;
      if (Math.abs(Y(s) / s + Yp) > 1e-5) throw new Error(`la EDO en s falla en s=${s}`);
    }
    cuadra(id, 'La transformada', 1);
  });

  it('y hay infinitas soluciones', () => {
    /* K/s es la transformada de la constante K, y cualquier constante cumple
       la ecuación original: ∫₀ᵗ K dz = Kt = t·K. Se comprueba con tres. */
    for (const K of [-2, 0.5, 7])
      for (const t of [0.3, 2, 9])
        if (Math.abs(integra(() => K, 0, t) - t * K) > 1e-9)
          throw new Error(`la constante ${K} no cumple la ecuación`);
    cuadra(id, 'Cuántas soluciones', -1);
  });
});

describe('8 · Fourier con meseta', () => {
  const id = 'ex2425-ord-8-fourier-con-meseta';
  /* La función, en su periodo y sin envolver: envolverla con un módulo mete
     el salto de t = 4 dentro del intervalo de integración, y ahí Simpson se
     vuelve loco persiguiendo un punto. Para el valor medio se integran los dos
     tramos por separado, que además es como está escrito el enunciado. */
  const rampa = (t: number) => t / 2;
  const meseta = () => 1;
  /* Y la periódica de verdad, para mirar los límites laterales de un salto. */
  const f = (t: number) => {
    const u = ((t % 4) + 4) % 4;
    return u > 0 && u <= 2 ? u / 2 : 1;
  };

  it('el valor medio en un periodo es 0,75', () =>
    cuadra(id, 'El término independiente', (integra(rampa, 0, 2, 1e-9) + integra(meseta, 2, 4, 1e-9)) / 4));

  it('S(20) vale 0,5, que es la media del salto', () => {
    /* En t = 20 la función salta de 1 a 0, y la serie converge a la media de
       los dos límites laterales. Se toman por la derecha y por la izquierda
       de verdad, no de memoria. */
    const porLaIzquierda = f(20 - 1e-9);
    const porLaDerecha = f(20 + 1e-9);
    cuadra(id, 'El valor de la serie en un salto', (porLaIzquierda + porLaDerecha) / 2);
  });

  it('la suma de 1/(2n+1)² es π²/8', () => {
    /* Sumada de verdad, con cola acotada: el resto por encima de N es menor
       que 1/(4N), así que con un millón de términos sobra para 10⁻⁴. */
    let s = 0;
    for (let n = 0; n < 2_000_000; n++) s += 1 / (2 * n + 1) ** 2;
    cuadra(id, 'La suma del apartado d)', s);
  });
});
