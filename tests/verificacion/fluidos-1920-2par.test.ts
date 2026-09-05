/**
 * El segundo parcial de Mecánica de Fluidos de 2019-2020. Ocho respuestas.
 *
 * El ejercicio 3 es el que mejor enseña para qué sirve rehacer la cuenta en
 * una asignatura cuyos exámenes publican el resultado. Su apartado (c) no se
 * contesta cambiando un 25 por un 10: al acortar el cierre, **la fórmula
 * cambia**, porque diez segundos son menos que el tiempo crítico de la
 * tubería. Y el tiempo crítico depende de la celeridad, que depende del
 * espesor, que es lo que se acaba de calcular en el apartado anterior. El test
 * recorre esa cadena entera y comprueba en el camino que el cierre de 25 s
 * es lento y el de 10 no lo es: si esa comparación se invirtiera, el 354
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
  /** Celeridad de la onda: agua a 2,2 GPa dentro de acero a 210 GPa. */
  const celeridad = (e: number) => 1 / Math.sqrt(RHO * (1 / 2.2e9 + D / (e * 210e9)));
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

  it('y cerrando en 10 s la sobrepresión sube a 354 m', () => {
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
