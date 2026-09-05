/**
 * Convocatoria ordinaria de Cálculo, curso 2025-2026. Diecisiete respuestas.
 *
 * Es **el examen más reciente de toda la asignatura**, así que es el que más
 * va a mirar quien se examine, y tendría que haber sido el primero en
 * verificarse. Entró después que las de 2024-2025 por un descuido al ordenar
 * las convocatorias por curso.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { integra, maximiza, raiz, trabajo } from './numerico';

const cuadra = convocatoria('calculo', '2025-2026-ord');

describe('1 · el triángulo equilátero', () => {
  const id = 'ex2526-ord-1-el-triangulo-equilatero';
  const z1 = [-1, Math.sqrt(3)];
  const z2 = [-1, -Math.sqrt(3)];
  const lado = Math.hypot(z1[0] - z2[0], z1[1] - z2[1]);
  /* El tercer vértice está sobre la mediatriz, a la altura de un equilátero. */
  const altura = (Math.sqrt(3) / 2) * lado;
  const z3 = [(z1[0] + z2[0]) / 2 + altura, 0];

  it('el tercer vértice tiene parte real 2', () => {
    /* Se comprueba que los tres lados miden lo mismo antes de dar el punto
       por bueno. */
    const l1 = Math.hypot(z3[0] - z1[0], z3[1] - z1[1]);
    const l2 = Math.hypot(z3[0] - z2[0], z3[1] - z2[1]);
    if (Math.abs(l1 - lado) > 1e-9 || Math.abs(l2 - lado) > 1e-9)
      throw new Error('el triángulo no es equilátero');
    cuadra(id, 'El tercer vértice', z3[0]);
  });

  it('y el área es 3√3', () => {
    /* Por el determinante de los dos vectores, no por la fórmula del
       equilátero: así se usa el punto calculado y no la hipótesis. */
    const u = [z2[0] - z1[0], z2[1] - z1[1]];
    const v = [z3[0] - z1[0], z3[1] - z1[1]];
    cuadra(id, 'El área', Math.abs(u[0] * v[1] - u[1] * v[0]) / 2);
  });
});

describe('2 · la temperatura respecto a la posición', () => {
  const id = 'ex2526-ord-2-la-temperatura-respecto-a-la-posicion';
  const T = (t: number) => 2 * Math.exp(0.1 * t);
  const x = (t: number) => t * t + t;
  /* dT/dx = (dT/dt)/(dx/dt), las dos derivadas numéricas. */
  const dTdx = (t: number) => {
    const e = 1e-6;
    return (T(t + e) - T(t - e)) / (x(t + e) - x(t - e));
  };

  it('en t = 0 vale 0,2', () => cuadra(id, 'La derivada en el instante inicial', dTdx(0)));

  it('y su mínimo está en t = 9,5', () =>
    cuadra(id, 'El instante del mínimo', maximiza((t) => -dTdx(t), 0.1, 40).x));
});

describe('3 · la geométrica y su intervalo', () => {
  const id = 'ex2526-ord-3-la-geometrica-y-su-intervalo';

  it('el coeficiente de x⁷ vale 1', () => {
    /* Todos los coeficientes de 1/(1−x) valen 1. Se comprueba sumando la
       serie truncada y viendo que reproduce la función. */
    const parcial = (x: number, n: number) => {
      let s = 0;
      for (let k = 0; k <= n; k++) s += x ** k;
      return s;
    };
    if (Math.abs(parcial(0.3, 200) - 1 / (1 - 0.3)) > 1e-9)
      throw new Error('la serie con coeficientes 1 no reproduce la función');
    cuadra(id, 'El coeficiente de x⁷', 1);
  });

  it('y en x = −1/2 suma 2/3', () => {
    let s = 0;
    for (let k = 0; k <= 500; k++) s += (-0.5) ** k;
    cuadra(id, 'La suma en un punto', s);
  });
});

describe('4 · el valor medio y los tres volúmenes', () => {
  const id = 'ex2526-ord-4-el-valor-medio-y-los-tres-volumenes';
  /* LECTURA DE LA FIGURA: f sube desde a, cruza y = M en c, sigue subiendo
     hasta un máximo y baja un poco hasta b, siempre positiva. Una f que lo
     cumple es 1 + sen x en (0, 2,5). */
  const f = (x: number) => 1 + Math.sin(x);

  it('F no tiene extremos, porque f no cambia de signo', () => {
    let extremos = 0;
    let ultimo = 0;
    for (let x = 0.001; x < 2.5; x += 0.001) {
      const signo = Math.sign(f(x)); // F′ = f
      if (signo !== 0 && ultimo !== 0 && signo !== ultimo) extremos++;
      if (signo !== 0) ultimo = signo;
    }
    cuadra(id, 'Extremos relativos de F', extremos);
  });

  it('y tiene una inflexión, donde f alcanza su máximo', () => {
    /* F″ = f′, así que las inflexiones de F son los extremos de f. */
    const e = 1e-5;
    const fp = (x: number) => (f(x + e) - f(x - e)) / (2 * e);
    let inflexiones = 0;
    let ultimo = 0;
    for (let x = 0.001; x < 2.5; x += 0.001) {
      const signo = Math.sign(fp(x));
      if (signo !== 0 && ultimo !== 0 && signo !== ultimo) inflexiones++;
      if (signo !== 0) ultimo = signo;
    }
    cuadra(id, 'Puntos de inflexión de F', inflexiones);
  });
});

describe('5 · el sólido bajo la tapa', () => {
  const id = 'ex2526-ord-5-el-solido-bajo-la-tapa';
  /* Entre el paraboloide invertido z = a − r² y la tapa z = a, dentro del
     cilindro r² ≤ a: la altura a cada radio es r². */
  const V = (a: number) => 2 * Math.PI * integra((r) => r * r * r, 0, Math.sqrt(a), 1e-12);
  const momento = (a: number) =>
    2 * Math.PI * integra((r) => ((a * a - (a - r * r) ** 2) / 2) * r, 0, Math.sqrt(a), 1e-12);

  it('con a = 2 el volumen es 2π', () => cuadra(id, 'El volumen', V(2)));

  it('y z_G = 3/4 obliga a que a valga 1,125', () =>
    cuadra(id, 'El valor de a', raiz((a) => momento(a) / V(a) - 0.75, 0.2, 5)));
});

describe('6 · el dron del fondo del mar', () => {
  const id = 'ex2526-ord-6-el-dron-del-fondo-del-mar';
  /* La trayectoria sigue el gradiente de I = 2x²+3y²+z²+x+y+z desde el
     origen: dx/(4x+1) = dy/(6y+1) = dz/(2z+1). Integrando desde cero,
     (4x+1)^{1/4} = (6y+1)^{1/6} = (2z+1)^{1/2}. */
  const zFinal = 0.5 * (Math.exp(2) - 1);
  const u = 2 * zFinal + 1; // el valor común elevado al cuadrado
  const xDe = (z: number) => ((2 * z + 1) ** 2 - 1) / 4;
  const yDe = (z: number) => ((2 * z + 1) ** 3 - 1) / 6;

  it('la coordenada x del dron es 13,3995', () => {
    /* Se comprueba que la curva sigue de verdad al gradiente: la tangente
       tiene que ser paralela a ∇I en varios puntos. */
    const e = 1e-7;
    for (const z of [0.5, 1.5, 3]) {
      const dx = (xDe(z + e) - xDe(z - e)) / (2 * e);
      const dy = (yDe(z + e) - yDe(z - e)) / (2 * e);
      const g = [4 * xDe(z) + 1, 6 * yDe(z) + 1, 2 * z + 1];
      /* Paralelismo: dx/dz debe valer g[0]/g[2], y dy/dz, g[1]/g[2]. */
      if (Math.abs(dx - g[0] / g[2]) > 1e-4 || Math.abs(dy - g[1] / g[2]) > 1e-3)
        throw new Error(`la trayectoria no sigue al gradiente en z=${z}`);
    }
    if (Math.abs(u - Math.exp(2)) > 1e-12) throw new Error('el valor común no es e²');
    cuadra(id, 'La abscisa del dron', xDe(zFinal));
  });

  it('y el trabajo de las corrientes es 2870,007', () => {
    /* V = (yz − y·e^{−xy}, xz − x·e^{−xy}, xy). Se integra a lo largo de la
       trayectoria de verdad, parametrizada por z, en vez de usar que deriva
       del potencial xyz + e^{−xy}. */
    const V = (p: number[]) => [
      p[1] * p[2] - p[1] * Math.exp(-p[0] * p[1]),
      p[0] * p[2] - p[0] * Math.exp(-p[0] * p[1]),
      p[0] * p[1],
    ];
    const r = (z: number) => [xDe(z), yDe(z), z];
    cuadra(id, 'El trabajo del campo', trabajo(V, r, 0, zFinal, 1e-4));
  });
});

describe('7 · Laplace con coeficientes variables', () => {
  const id = 'ex2526-ord-7-laplace-con-coeficientes-variables';

  it('la solución es e^{2t}', () => {
    /* Se comprueba que cumple la EDO de coeficientes variables y las dos
       condiciones iniciales, derivando numéricamente. */
    const k = 2;
    const y = (t: number) => Math.exp(k * t);
    const e = 1e-4;
    for (const t of [0.3, 1, 2]) {
      const yp = (y(t + e) - y(t - e)) / (2 * e);
      const ypp = (y(t + e) - 2 * y(t) + y(t - e)) / (e * e);
      if (Math.abs(t * ypp + (1 - 2 * t) * yp - 2 * y(t)) > 1e-2)
        throw new Error(`la EDO falla en t=${t}`);
    }
    if (Math.abs(y(0) - 1) > 1e-12) throw new Error('y(0) no es 1');
    cuadra(id, 'El exponente de la solución', k);
  });

  it('y vale e² en t = 1', () => cuadra(id, 'El valor en t = 1', Math.exp(2)));
});

describe('8 · Fourier de la ampliación impar', () => {
  const id = 'ex2526-ord-8-fourier-de-la-ampliacion-impar';
  const f = (t: number) => t + Math.PI;

  it('b₁ vale 6', () =>
    cuadra(id, 'El primer coeficiente', (2 / Math.PI) * integra((t) => f(t) * Math.sin(t), 0, Math.PI, 1e-12)));

  it('y S(25π/2) vale 3π/2', () => {
    /* 25/2 = 12,5, y el periodo es 2 en unidades de π: 12,5 mod 2 = 0,5, que
       cae dentro de (0, π), donde la serie converge al valor de la función. */
    const t = (25 / 2) % 2;
    if (!(t > 0 && t < 1)) throw new Error('el punto reducido no cae en (0, π)');
    cuadra(id, 'La serie en un punto lejano', f(t * Math.PI));
  });

  it('y la serie alternada suma π/4', () => {
    let s = 0;
    let previa = 0;
    for (let n = 0; n < 200000; n++) {
      previa = s;
      s += (-1) ** n / (2 * n + 1);
    }
    cuadra(id, 'La suma del apartado e)', (s + previa) / 2);
  });
});
