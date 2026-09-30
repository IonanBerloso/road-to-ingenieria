/**
 * El segundo parcial de Mecánica de Fluidos de 2019-2020. Veintiocho
 * respuestas: las ocho de los ejercicios 1 a 3 y las veinte de los dos que se
 * rescataron el 30 de septiembre de 2026, el 4 (bombeo) y el 5 (la red).
 *
 * El ejercicio 3 es el que mejor enseña para qué sirve rehacer la cuenta en
 * una asignatura cuyos exámenes publican el resultado. Su apartado (c) no se
 * contesta cambiando un 25 por un 10: al acortar el cierre, **la fórmula
 * cambia**, porque diez segundos son menos que el tiempo crítico de la
 * tubería. Y el tiempo crítico depende de la celeridad, que depende del
 * espesor, que es lo que se acaba de calcular en el apartado anterior. El test
 * recorre esa cadena entera y comprueba en el camino que el cierre de 25 s
 * es lento y el de 10 no lo es: si esa comparación se invirtiera, el 340
 * dejaría de ser el número bueno.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { raiz } from './numerico';

const cuadra = convocatoria('fluidos', '2019-2020-2par');

const G = 9.8;
const RHO = 1000;
const area = (d: number) => (Math.PI * d * d) / 4;

describe('1 · el álabe que huye y el que embiste', () => {
  const id = 'exflu1920-2par-1-el-alabe-que-huye-y-el-que-embiste';
  const [d, v] = [0.13, 60];
  /* Con el desvío de 180º el agua sale con la misma velocidad relativa y en
     sentido contrario, así que la cantidad de movimiento cambia el doble. */
  const fuerza = (relativa: number) => 2 * RHO * area(d) * relativa ** 2;

  it('con el álabe huyendo a v/3, la fuerza son 42,47 kN', () =>
    cuadra.magnitud(id, 'La fuerza con el álabe huyendo', fuerza(v - v / 3) / 1000, 'kN'));

  it('y la potencia útil se anula a 60 m/s', () => {
    /* La potencia es F·u y se anula en u = 0 y en u = v, pero **en la
       segunda no cambia de signo**: la fuerza lleva un cuadrado, así que la
       curva toca el eje y vuelve a subir. Un buscador por cambio de signo no
       la ve —es la misma trampa que la raíz doble de una característica— y
       por eso se resuelve lo que de verdad se anula: la velocidad relativa,
       que es lineal. Sin agua alcanzando al álabe no hay potencia. */
    const potencia = (u: number) => fuerza(v - u) * u;
    const u0 = raiz((u) => v - u, 1, 200);
    if (Math.abs(potencia(u0)) > 1e-9) throw new Error('ahí la potencia no se anula');
    if (!(potencia(u0 - 1) > 0 && potencia(u0 + 1) > 0)) throw new Error('debería tocar el eje sin cruzarlo');
    cuadra.magnitud(id, 'La velocidad de potencia nula', u0, 'm/s');
  });

  it('y embistiendo a 20 m/s son 169,9 kN', () => {
    /* Ahora las velocidades se suman en vez de restarse, y por eso la fuerza
       es cuatro veces la del primer apartado y no el doble. */
    const embistiendo = fuerza(v + 20);
    if (Math.abs(embistiendo / fuerza(v - v / 3) - 4) > 1e-9)
      throw new Error('la relación entre los dos casos no es la esperada');
    cuadra.magnitud(id, 'La fuerza con el álabe embistiendo', embistiendo / 1000, 'kN');
  });
});

describe('2 · el módulo de aterrizaje en Marte', () => {
  const id = 'exflu1920-2par-2-el-modulo-de-aterrizaje-en-marte';
  /* Las nueve variables del enunciado con sus dimensiones (M, L, T). El ángulo
     entra en la lista y es adimensional: cuenta como variable. */
  const variables: Record<string, [number, number, number]> = {
    F: [1, 1, -2],
    v: [0, 1, -1],
    rho: [1, -3, 0],
    mu: [1, -1, -1],
    alfa: [0, 0, 0],
    c: [0, 1, -1],
    epsilon: [0, 1, 0],
    g: [0, 1, -2],
    L: [0, 1, 0],
  };

  it('salen seis grupos adimensionales', () => {
    /* Vaschy-Buckingham: variables menos el rango de la matriz dimensional.
       El rango se **calcula**, no se supone que sea tres: con estas nueve
       variables lo es, pero es justo lo que el apartado (a) pone en duda al
       proponer una terna de repetidas que no vale. */
    const filas = [0, 1, 2].map((i) => Object.values(variables).map((d) => d[i]));
    let rango = 0;
    const M = filas.map((f) => [...f]);
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
    cuadra(id, 'Cuántos grupos salen', Object.keys(variables).length - rango);
  });

  it('y la rugosidad entra con exponente −1 en el grupo de la fuerza', () => {
    /* Π₁ = F·μ^a·ε^b·c^d tiene que ser adimensional: tres ecuaciones, una por
       dimensión, y tres incógnitas. Se resuelve el sistema en vez de despejar
       a mano. */
    const [a, b, d] = resuelveTres(
      [variables.mu, variables.epsilon, variables.c],
      variables.F.map((x) => -x) as [number, number, number],
    );
    /* Y se comprueba que el grupo sale adimensional de verdad. */
    for (let i = 0; i < 3; i++) {
      const suma =
        variables.F[i] + a * variables.mu[i] + b * variables.epsilon[i] + d * variables.c[i];
      if (Math.abs(suma) > 1e-9) throw new Error('el grupo no queda adimensional');
    }
    cuadra(id, 'El exponente de la rugosidad en el grupo de la fuerza', b);
  });
});

/** Resuelve el sistema 3×3 cuyas columnas son las tres variables repetidas. */
function resuelveTres(cols: [number, number, number][], b: [number, number, number]) {
  const M = [0, 1, 2].map((i) => [cols[0][i], cols[1][i], cols[2][i], b[i]]);
  for (let c = 0; c < 3; c++) {
    const piv = M.findIndex((f, i) => i >= c && Math.abs(f[c]) > 1e-9);
    [M[c], M[piv]] = [M[piv], M[c]];
    for (let i = 0; i < 3; i++) {
      if (i === c) continue;
      const k = M[i][c] / M[c][c];
      for (let j = c; j < 4; j++) M[i][j] -= k * M[c][j];
    }
  }
  return [0, 1, 2].map((i) => M[i][3] / M[i][i]);
}

describe('3 · el canal, la tubería forzada y la válvula', () => {
  const id = 'exflu1920-2par-3-el-canal-y-la-tuberia-forzada';

  it('el canal comercial es de 1,1 m', () => {
    /* Sección circular con el calado al 45 % del diámetro. El ángulo mojado se
       saca de la geometría —no se copia— y Manning da el diámetro teórico, que
       después sube al comercial. */
    const n = 0.013; // madera sin cepillar
    const S = 0.0015;
    const theta = Math.acos(1 - 2 * 0.45); // media apertura, desde el fondo
    const caudal = (D: number) => {
      const A = ((D * D) / 4) * (theta - Math.sin(theta) * Math.cos(theta));
      const Rh = A / (D * theta);
      return (1 / n) * A * Rh ** (2 / 3) * Math.sqrt(S);
    };
    const teorico = raiz((D) => caudal(D) - 0.44, 0.2, 5);
    if (!(teorico > 1 && teorico < 1.1)) throw new Error(`el diámetro teórico sale ${teorico}, y no está entre 1 y 1,1`);
    cuadra.magnitud(id, 'El diámetro comercial del canal', Math.ceil(teorico * 10) / 10, 'm');
  });

  /* La tubería forzada: baja de la cota 1550 a la 250 con pendiente del 18 %. */
  const D = 0.43;
  const Q = 0.39;
  const v = Q / area(D);
  const L = (1550 - 250) / 0.18;
  const estatica = 1550 - 250;
  /** Celeridad de la onda con la fórmula de Allievi del tema 20 y el
   *  coeficiente del acero de la tabla «Valores c del material» que trae la
   *  figura del enunciado, k = 0,5. Hasta el 30 de septiembre de 2026 se
   *  calculaba con 2,2 GPa y 210 GPa, dos módulos que el enunciado no da, y
   *  la sobrepresión salía 354 m en vez de 340. */
  const celeridad = (e: number) => 9900 / Math.sqrt(48.3 + (0.5 * D) / e);
  /** Barlow, con la tensión, la corrosión y el margen que da el enunciado. */
  const barlow = (sobrepresion: number) =>
    (((estatica + sobrepresion) * RHO * G * D) / (2 * 355e6) + 0.001) * 1.25;
  const comercial = (e: number) => Math.ceil((e * 1000) / 2) * 2;
  const espesor25 = comercial(barlow((2 * L * v) / (G * 25)));

  it('el espesor comercial son 14 mm', () => {
    /* Con 25 s el cierre es lento, así que vale Michaud. Se comprueba antes:
       el tiempo crítico se calcula con el espesor que va a salir, y tiene que
       quedar por debajo de los 25 s. */
    if (!((2 * L) / celeridad(espesor25 / 1000) < 25)) throw new Error('con 25 s el cierre no sería lento');
    cuadra.magnitud(id, 'El espesor de la tubería forzada', espesor25, 'mm');
  });

  it('y cerrando en 10 s la sobrepresión sube a 340 m', () => {
    /* Aquí está la trampa del apartado: diez segundos son **menos** que el
       tiempo crítico, así que Michaud deja de valer y manda Allievi. Se
       comprueba la desigualdad antes de aplicar la fórmula, y de paso que la
       de cierre lento habría dado la mitad. */
    const c = celeridad(espesor25 / 1000);
    const critico = (2 * L) / c;
    if (!(critico > 10)) throw new Error('con 10 s el cierre seguiría siendo lento y valdría Michaud');
    const conCierreLento = (2 * L * v) / (G * 25);
    const porAllievi = (c * v) / G;
    /* Más del doble que con el cierre de 25 s, que es la comparación que hace
       que el apartado tenga respuesta. */
    if (!(porAllievi > 2 * conCierreLento)) throw new Error('no sube más del doble');
    cuadra.magnitud(id, 'La sobrepresión con el cierre rápido', porAllievi, 'm');
  });
});

describe('4 · la bomba deducida presurizando el depósito', () => {
  const id = 'exflu1920-2par-4-la-bomba-deducida-presurizando-el-deposito';
  /* Hazen-Williams del cuadro 25, con Q en l/s y D en mm. La banda de C sale
     de ε/D, no se copia: fundición asfaltada, ε = 0,012 cm (cuadro 20). */
  const J1 = (C: number, Dmm: number) => 1.2117e10 / (C ** 1.852 * Dmm ** 4.87);
  const banda = (eD: number) => (eD <= 2e-4 ? 140 : eD <= 1e-3 ? 130 : eD <= 4e-3 ? 120 : 110);
  const [CA, CI] = [banda(0.12 / 100), banda(0.12 / 150)];
  /** v²/2g por (l/s)² en una tubería de diámetro d (m). */
  const cin = (d: number) => 1 / (2 * G * area(d) ** 2) / 1e6;
  /* Las k del cuadro 24: salida redondeada y codo en la aspiración; codo,
     compuerta con X/D = 0,375 y esférica a 30º en la impulsión. */
  const kAsp = 0.05 + 0.75;
  const kImp = 0.75 + 0.81 + 5.47;
  const aHW = 15 * J1(CA, 100) + 150 * J1(CI, 150);
  const bK = kAsp * cin(0.1) + kImp * cin(0.15);
  const hmi = (Q: number, dp = 0) => 12 + dp + aHW * Q ** 1.852 + bK * Q * Q;
  const dp70 = 70000 / (RHO * G);
  const H1 = hmi(55);
  const H2 = hmi(49.5, dp70);
  const B = (H2 - H1) / (0.055 ** 2 - 0.0495 ** 2);
  const A = H1 + B * 0.055 ** 2;

  it('la curva de la instalación es la impresa: 12 + 1,02·10⁻²·Q^1,852 + 1,81·10⁻³·Q²', () => {
    if (CA !== 120 || CI !== 130) throw new Error('las bandas de C no son 120 y 130');
    cuadra.magnitud(id, 'El término independiente', 14.5 - 2.5, 'm');
    cuadra(id, 'El coeficiente de las pérdidas continuas', aHW);
    cuadra(id, 'El coeficiente de las pérdidas menores', bK);
    cuadra.magnitud(id, 'La altura de la instalación a 55 l/s', H1, 'm');
  });

  it('y la bomba, 50,74 − 5333,53·Q², sale a la centésima con la curva sin redondear', () => {
    /* La B impresa solo sale así: con los coeficientes redondeados a tres
       cifras se va a 5359. Se comprueba contra lo impreso, que el corpus no
       guarda con esta precisión. */
    if (Math.abs(B - 5333.53) > 0.05) throw new Error(`B sale ${B}, no 5333,53`);
    if (Math.abs(A - 50.74) > 0.005) throw new Error(`A sale ${A}, no 50,74`);
    cuadra.magnitud(id, 'La altura del segundo punto', H2, 'm');
    cuadra(id, 'El coeficiente de la bomba', B);
  });

  it('la bomba va a −1,52 m con el margen de diseño, y los manómetros marcan −0,83 y 2,83 kg/cm²', () => {
    const hfAsp = 15 * J1(CA, 100) * 55 ** 1.852 + kAsp * cin(0.1) * 55 * 55;
    const npshR = 2.2 + 382 * 0.055 ** 2;
    const patm = 101325 / (RHO * G);
    /* Diseño: NPSHd ≥ 1,3·NPSHr (diapositiva 21 del tema 25). Con la
       condición de funcionamiento saldría −0,52 m, que no es lo impreso. */
    const zb = 2.5 + patm - 0.2 - hfAsp - 1.3 * npshR;
    const zbFuncionamiento = 2.5 + patm - 0.2 - hfAsp - npshR;
    if (Math.abs(zbFuncionamiento + 0.516) > 0.01) throw new Error('el criterio de funcionamiento no da −0,52');
    cuadra.magnitud(id, 'La pérdida en la aspiración', hfAsp, 'm');
    cuadra.magnitud(id, 'La cota de la bomba', zb, 'm');
    const vA2 = cin(0.1) * 55 * 55;
    const vI2 = cin(0.15) * 55 * 55;
    const pe = 2.5 - zb - vA2 - hfAsp;
    const ps = pe + vA2 - vI2 + H1;
    /* Y por el otro lado, de la brida de impulsión a la lámina de C, tiene
       que salir lo mismo. */
    const hfImp = 150 * J1(CI, 150) * 55 ** 1.852 + kImp * vI2;
    if (Math.abs(14.5 - zb - vI2 + hfImp - ps) > 1e-9) throw new Error('los dos balances no cierran');
    cuadra.magnitud(id, 'La lectura del manómetro de aspiración', pe / 10, 'kg/cm2');
    cuadra.magnitud(id, 'La lectura del manómetro de impulsión', ps / 10, 'kg/cm2');
  });

  it('para 52 l/s la válvula pierde 3,98 m (k = 9,02), y cerrada la diferencia es A', () => {
    const hf = A - B * 0.052 ** 2 - hmi(52);
    cuadra.magnitud(id, 'La pérdida en la válvula V2', hf, 'm');
    cuadra(id, 'El factor de paso de la válvula V2', hf / (cin(0.15) * 52 * 52));
    cuadra.magnitud(id, 'La diferencia de presiones con V2 cerrada', A / 10, 'kg/cm2');
  });
});

describe('5 · la red de cinco tuberías', () => {
  const id = 'exflu1920-2par-5-la-red-de-cinco-tuberias';
  const NU = 0.05e-4; // 0,05 St
  const s = 0.943;
  type Tramo = { L: number; D: number; eD: number };
  /** Colebrook-White, iterada hasta converger. */
  const colebrook = (Re: number, eD: number) => {
    let f = 0.02;
    for (let i = 0; i < 100; i++) f = (-2 * Math.log10(eD / 3.71 + 2.51 / (Re * Math.sqrt(f)))) ** -2;
    return f;
  };
  /* El coeficiente con el criterio del tema 18: liso si Re < 23/(ε/D), y
     entonces Blasius mientras Re ≤ 10⁵; si no, Colebrook. Solo el PVC de la
     tubería 5 cae en liso, y se comprueba abajo. */
  const tramo = (L: number, Dmm: number, epsCm: number): Tramo => ({ L, D: Dmm / 1000, eD: (epsCm * 10) / Dmm });
  const liso = (t: Tramo, v: number) => (v * t.D) / NU < 23 / t.eD;
  const coef = (t: Tramo, v: number) => {
    const Re = (v * t.D) / NU;
    return liso(t, v) && Re <= 1e5 ? 0.316 / Re ** 0.25 : colebrook(Re, t.eD);
  };
  const hf = (t: Tramo, Q: number) => {
    const v = Q / area(t.D);
    return (coef(t, v) * (t.L / t.D) * v * v) / (2 * G);
  };
  const t1 = tramo(250, 200, 0.026);
  const t2 = tramo(300, 110, 0.026);
  const t3 = tramo(100, 60, 0.015);
  const t4 = tramo(0, 85, 0.015);
  const t5 = tramo(80, 110, 0.0007);
  const cin = (Q: number, d: number) => (Q / area(d)) ** 2 / (2 * G);

  const HN1 = 140 - hf(t1, 0.05);
  const HB = 110 + 1.5e5 / (s * RHO * G);
  /* De N1 a la salida de la tubería 2 dentro de B: la válvula (k = 2) y la
     altura cinética con que el fluido entra en el depósito. */
  const Q2 = raiz((Q) => HN1 - HB - hf(t2, Q) - 3 * cin(Q, 0.11), 1e-5, 0.1);
  const Q5 = 0.05 - Q2;
  /* De N2 al chorro: la tubería 5, la boquilla (k = 2) y la altura cinética
     del chorro, las dos con la velocidad de la boquilla. */
  const HN2 = 80 + 3 * cin(Q5, 0.0675) + hf(t5, Q5);
  const dH = HN1 - HN2;
  const Q3 = raiz((Q) => hf(t3, Q) - dH, 1e-6, 0.1);
  const v4 = (Q5 - Q3) / area(t4.D);

  it('la tubería 1 pierde 3,90 m, y el fluido va de N1 hacia B: 14,75 l/s', () => {
    if (!(HN1 > HB)) throw new Error('N1 no está por encima de B: el sentido sería el contrario');
    cuadra.magnitud(id, 'La pérdida de carga en la tubería 1', 140 - HN1, 'm');
    cuadra.magnitud(id, 'El caudal de la tubería 2', Q2 * 1000, 'l/s');
  });

  it('v5 = 3,71 m/s, con el PVC liso y Blasius', () => {
    if (!liso(t5, Q5 / area(t5.D))) throw new Error('el PVC no sale liso');
    if (liso(t1, 0.05 / area(t1.D))) throw new Error('la tubería 1 no debería salir lisa');
    cuadra.magnitud(id, 'La velocidad en la tubería 5', Q5 / area(t5.D), 'm/s');
    cuadra.magnitud(id, 'La energía en el nudo N2', HN2, 'm');
  });

  it('en paralelo pierden lo mismo: v3 = 3,65 y v4 = 4,39 m/s, y L4 cerca de los 108,21 impresos', () => {
    cuadra.magnitud(id, 'La velocidad en la tubería 3', Q3 / area(t3.D), 'm/s');
    cuadra.magnitud(id, 'La velocidad en la tubería 4', v4, 'm/s');
    const L4 = (dH * t4.D * 2 * G) / (coef(t4, v4) * v4 * v4);
    /* L4 es el final de cuatro tanteos: 109,5 frente a los 108,21 impresos,
       un 1,2 %. Se comprueba también que lo impreso cae dentro de la
       tolerancia de la casilla. */
    if (Math.abs(108.21 / L4 - 1) > 0.02) throw new Error(`L4 sale ${L4}, lejos de 108,21`);
    cuadra.magnitud(id, 'La longitud de la tubería 4', L4, 'm');
  });
});
