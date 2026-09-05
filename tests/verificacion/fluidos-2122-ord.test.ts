/**
 * La ordinaria de Mecánica de Fluidos de 2021-2022. Veintiséis respuestas en
 * once ejercicios: la convocatoria más larga de todo el corpus.
 *
 * El ejercicio 5 tiene la geometría que más costó leer, y por eso el test la
 * comprueba entera antes de usarla. La compuerta es un cuarto de cilindro con
 * el centro en 0, y el agua queda **por debajo** de su cara curva: empuja
 * hacia la derecha y hacia **arriba**, no hacia abajo. Que sea hacia arriba es
 * lo que hace que la reacción vertical en la articulación salga exactamente
 * cero, y ese cero no es casualidad: sale de que la resultante del agua pasa
 * por 0 y de que 0 está a la misma altura que A. El test integra la presión
 * sobre el arco y comprueba las dos cosas.
 *
 * Y el ejercicio 7 regala tres avisos: un dato que **sobra** —el coeficiente
 * de contracción, porque el enunciado ya da el diámetro del chorro—, un ángulo
 * que es del vértice y no de cada pared, y la lección de fondo de que el cono
 * solo se lleva el 18 % de la cantidad de movimiento. El test deja los tres
 * escritos como comprobaciones.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { raiz } from './numerico';

const cuadra = convocatoria('fluidos', '2021-2022-ord');

const G = 9.8;
const GAMMA = 1000 * G;
const area = (d: number) => (Math.PI * d * d) / 4;
const hazenWilliams = (L: number, Q: number, D: number, C: number) =>
  (10.674 * L * Q ** 1.852) / (C ** 1.852 * D ** 4.871);
const manning = (A: number, P: number, n: number, J: number) =>
  (1 / n) * A * (A / P) ** (2 / 3) * Math.sqrt(J);
/** Rango de una matriz por eliminación, para contar grupos de Buckingham. */
function rango(filas: number[][]) {
  const M = filas.map((f) => [...f]);
  let r = 0;
  for (let col = 0, fila = 0; col < M[0].length && fila < M.length; col++) {
    const piv = M.findIndex((f, i) => i >= fila && Math.abs(f[col]) > 1e-9);
    if (piv < 0) continue;
    [M[fila], M[piv]] = [M[piv], M[fila]];
    for (let i = fila + 1; i < M.length; i++) {
      const k = M[i][col] / M[fila][col];
      for (let j = col; j < M[0].length; j++) M[i][j] -= k * M[fila][j];
    }
    fila++;
    r++;
  }
  return r;
}

describe('1 · el perfil parabólico y su cortante', () => {
  const id = 'exflu2122-ord-1-el-perfil-parabolico-y-su-cortante';
  const [mu, v0, R] = [0.01, 0.12, 0.1];
  /* Dos condiciones fijan el perfil: v(0) = v₀ y v(R) = 0 por no
     deslizamiento. */
  const v = (y: number) => v0 * (1 - (y / R) ** 2);

  it('a media distancia la velocidad es 0,09 m/s', () => {
    if (Math.abs(v(R)) > 1e-12) throw new Error('el perfil no se anula en la pared');
    cuadra(id, 'La velocidad a media distancia de la pared', v(R / 2));
  });

  it('y el cortante en la pared, −24 mPa', () => {
    /* Ley de Newton, con la derivada tomada numéricamente. Y la lección de la
       tabla: la velocidad es cuadrática y el cortante **lineal**, así que a
       media distancia queda tres cuartos de velocidad pero ya la mitad del
       cortante. */
    const tau = (y: number) => mu * ((v(y + 1e-6) - v(y - 1e-6)) / 2e-6);
    if (Math.abs(tau(R / 2) / tau(R) - 0.5) > 1e-6) throw new Error('el cortante no sale lineal');
    cuadra(id, 'El cortante en la pared', tau(R) * 1000);
  });
});

describe('2 · el océano que se comprime', () => {
  const id = 'exflu2122-ord-2-el-oceano-que-se-comprime';
  const [rho0, h] = [1025, 1500];
  const K = 2.1e8 * G; // el enunciado la da en kg/m², o sea kilopondios

  const sinComprimir = rho0 * G * h;
  it('sin compresibilidad son 15,07 MPa', () =>
    cuadra.magnitud(id, 'La presión sin compresibilidad', sinComprimir / 1e6, 'MPa'));

  /* Con el agua compresible la densidad crece con la presión, así que hay que
     integrar dp = ρ(p)·g·dh. Se resuelve buscando la raíz de la relación
     implícita p − p²/(2K) = ρ₀gh, sin pasar por la ecuación de segundo grado. */
  const conComprimir = raiz((p) => p - (p * p) / (2 * K) - sinComprimir, 1e6, K);

  it('y con ella, 15,12 MPa', () => {
    if (!(conComprimir > sinComprimir)) throw new Error('comprimir debería subir la presión');
    cuadra(id, 'La presión con el agua comprimida', conComprimir / 1e6);
  });

  it('y el agua se queda en 1.032,6 kg/m³', () => {
    /* Un 0,74 % más densa, que es lo que se comprime kilómetro y medio de
       océano. */
    const rho = rho0 / (1 - conComprimir / K);
    if (rho / rho0 - 1 > 0.01) throw new Error('se estaría comprimiendo más de lo razonable');
    cuadra(id, 'La densidad a esa profundidad', rho);
  });
});

describe('3 · el canal y su berma', () => {
  const id = 'exflu2122-ord-3-el-canal-y-su-berma';
  const [B, H, J, n] = [3, 1.6, 0.001, 0.0128];
  const Qmax = manning(B * H, B + 2 * H, n, J);

  it('el canal lleva 10 m³/s lleno', () => cuadra.magnitud(id, 'El caudal máximo', Qmax, 'm3/s'));

  it('y la berma óptima son 10 cm', () => {
    /* «Hidráulicamente óptimo» quiere decir perímetro mojado mínimo **a igual
       área**, y en un rectángulo eso sale en b = 2y. Aquí el ancho ya está
       construido, así que el criterio fija el calado y lo que sobra es la
       berma. Se comprueba recorriendo: con el área que tendría el canal a ese
       calado, ningún otro reparto entre ancho y calado moja menos. */
    const calado = B / 2;
    const A = B * calado;
    let mejor = { P: Infinity, y: 0 };
    for (let y = 0.3; y <= 4; y += 0.0002) {
      const P = A / y + 2 * y;
      if (P < mejor.P) mejor = { P, y };
    }
    if (Math.abs(mejor.y - calado) > 0.001) throw new Error(`el óptimo sale en y = ${mejor.y}`);
    if (Math.abs(A / mejor.y - 2 * mejor.y) > 0.01) throw new Error('el óptimo no cumple b = 2y');
    cuadra(id, 'La berma de seguridad', H - calado);
  });

  it('y haría falta un revestimiento de n = 0,0117', () => {
    /* Ahora la incógnita es la rugosidad: los mismos 10 m³/s con el calado
       óptimo. Bajar 10 cm de calado cuesta un 6 % de área, y ese 6 % hay que
       recuperarlo alisando la pared. */
    const y = B / 2;
    cuadra(id, 'El coeficiente que haría falta', raiz((nn) => manning(B * y, B + 2 * y, nn, J) - Qmax, 0.005, 0.05));
  });
});

describe('4 · los dos depósitos y el helio', () => {
  const id = 'exflu2122-ord-4-los-dos-depositos-y-el-helio';
  /* El enunciado da s = 3 y s = 10 sin decir cuál es cuál, y lo decide la
     figura: el líquido de arriba está en una U **invertida**, así que es el
     ligero. */
  const [s1, s2] = [10, 3];
  const patm = 0.735 * 13.6 * GAMMA;

  it('el barómetro da 97.949 Pa', () => cuadra.magnitud(id, 'La presión atmosférica del lugar', patm, 'Pa'));

  it('y el manómetro absoluto de A marca 5,52 kg/cm²', () => {
    /* Recorriendo desde el manómetro de E: se baja por el pesado, se sube R
       por el ligero y se vuelve a bajar por el pesado. Las cotas de los
       meniscos se cancelan solas y solo sobrevive el desnivel R. */
    const [zE, zB, R] = [10, 6, 0.3];
    const pA = 0.3e5 + s1 * GAMMA * (zE - zB + R) - s2 * GAMMA * R;
    /* Y el helio, que se puede despreciar pero conviene demostrarlo. */
    const delHelio = 9.67e-4 * GAMMA * (8 - 6);
    if (delHelio / pA > 1e-4) throw new Error('el helio no es despreciable');
    cuadra.magnitud(id, 'La lectura del manómetro A', (pA + patm) / (10 * GAMMA), 'kg/cm2');
  });
});

describe('5 · la compuerta de cuarto de cilindro', () => {
  const id = 'exflu2122-ord-5-la-compuerta-de-cuarto-de-cilindro';
  const [R, b, F1, alfa] = [2, 3, 450e3, (50 * Math.PI) / 180];
  /* A en el origen, 0 a su derecha a distancia R y a la misma altura, B en el
     suelo bajo 0. El agua queda por debajo del arco: empuja a la derecha y
     hacia arriba. */
  const horizontal = (H: number) => GAMMA * (H - R / 2) * R * b;
  const vertical = (H: number) => GAMMA * ((Math.PI * R * R) / 4 + (H - R) * R) * b;

  it('el empuje vertical a 3 m son 151,16 kN, y va hacia arriba', () => {
    /* Se integra la presión sobre el arco para comprobar dos cosas: que la
       vertical sale hacia arriba y con ese módulo, y que la resultante pasa
       por el centro 0 —de ahí que su brazo respecto de A sea R y solo cuente
       la componente vertical—. */
    const H = 3;
    const superficie = H - R; // altura de la lámina sobre A
    let Fx = 0;
    let Fy = 0;
    let momentoEn0 = 0;
    const n = 200000;
    for (let k = 0; k < n; k++) {
      /* θ recorre el cuarto de arco desde A hasta B, con centro en 0. */
      const th = Math.PI + (Math.PI / 2) * ((k + 0.5) / n);
      const [x, y] = [R + R * Math.cos(th), R * Math.sin(th)];
      const p = GAMMA * (superficie - y);
      const ds = ((R * Math.PI) / 2 / n) * b;
      /* El agua está por fuera del arco, así que empuja hacia el centro. */
      Fx += -p * Math.cos(th) * ds;
      Fy += -p * Math.sin(th) * ds;
      momentoEn0 += ((x - R) * (-p * Math.sin(th)) - y * (-p * Math.cos(th))) * ds;
    }
    if (!(Fy > 0)) throw new Error('la vertical sale hacia abajo, y el agua está debajo del arco');
    if (Math.abs(momentoEn0) > 1e-6 * Math.abs(Fx)) throw new Error('la resultante no pasa por 0');
    if (Math.abs(Fx - horizontal(H)) / horizontal(H) > 1e-4) throw new Error('la horizontal no cuadra con el prisma');
    if (Math.abs(Fy - vertical(H)) / vertical(H) > 1e-4) throw new Error('la vertical no cuadra con el prisma');
    cuadra.magnitud(id, 'El empuje vertical', vertical(H) / 1000, 'kN');
  });

  it('y el agua puede llegar a 6,29 m', () => {
    /* El suelo solo empuja: el límite es que la reacción en B se anule.
       Tomando momentos respecto de A, el brazo de la resultante del agua y el
       de F₁ son los dos R, así que la condición queda en que la vertical del
       agua iguale a la de F₁. */
    cuadra.magnitud(id, 'La altura máxima del agua', raiz((H) => vertical(H) - F1 * Math.sin(alfa), R, 30), 'm');
  });

  it('y con 3 m la articulación aguanta 406,85 kN en horizontal', () => {
    /* El contacto en B no transmite horizontal, así que A se lleva la del agua
       y la de F₁, las dos hacia la derecha. */
    cuadra.magnitud(id, 'La reacción horizontal en A', (F1 * Math.cos(alfa) + horizontal(3)) / 1000, 'kN');
  });
});

describe('6 · los dos manómetros del venturímetro', () => {
  it('el cociente de lecturas vale 63', () => {
    /* Los dos manómetros están conectados a los **mismos** dos puntos, así que
       miden el mismo salto de altura piezométrica. El cociente no compara los
       dos líquidos entre sí: compara cuánto se aparta cada uno del que
       circula. */
    const [s0, s1, s2] = [1, 0.8, 13.6];
    const deltaH = 1; // uno cualquiera: el cociente no depende de él
    const R1 = deltaH / ((s0 - s1) / s0);
    const R2 = deltaH / ((s2 - s0) / s0);
    cuadra('exflu2122-ord-6-los-dos-manometros-del-venturimetro', 'El cociente de lecturas, con números', R1 / R2);
  });
});

describe('7 · el cono que desvía el chorro', () => {
  const id = 'exflu2122-ord-7-el-cono-que-desvia-el-chorro';
  const [v, D] = [15, 0.08];
  /* El enunciado dice **diámetro del chorro**, así que la contracción ya está
     aplicada: el C_c = 0,9 es un dato que sobra. */
  const Q = v * area(D);
  const cantidadDeMovimiento = 1000 * Q * v;

  it('el chorro lleva 1.131 N de cantidad de movimiento', () =>
    cuadra(id, 'La cantidad de movimiento del chorro', cantidadDeMovimiento));

  it('y el cono debe pesar 20,87 kg', () => {
    /* Los 70º son del **vértice**, así que cada lámina sale a 35º de la
       vertical. El cono solo se lleva la parte de la cantidad de movimiento
       que ha dejado de subir: un 18 %. */
    const semiangulo = (35 * Math.PI) / 180;
    const F = cantidadDeMovimiento * (1 - Math.cos(semiangulo));
    if (F / cantidadDeMovimiento > 0.25) throw new Error('el cono se llevaría demasiado');
    /* Y los dos errores que el ejercicio castiga, escritos para que se vea la
       diferencia: aplicar C_c otra vez, y usar los 70º enteros. */
    const siSeAplicaraCc = 0.9 * cantidadDeMovimiento * (1 - Math.cos(semiangulo));
    const conElAnguloEntero = cantidadDeMovimiento * (1 - Math.cos(2 * semiangulo));
    if (siSeAplicaraCc / G > 19.5 || conElAnguloEntero / G < 60)
      throw new Error('los dos errores clásicos no salen donde deberían');
    cuadra(id, 'El peso del cono', F / G);
  });
});

describe('8 · Buckingham con seis variables', () => {
  const id = 'exflu2122-ord-8-buckingham-con-seis-variables';
  const variables: Record<string, [number, number, number]> = {
    K: [1, -1, -2],
    nu: [0, 2, -1],
    rho: [1, -3, 0],
    dp: [1, -1, -2],
    v: [0, 1, -1],
    L: [0, 1, 0],
  };

  it('salen tres grupos', () =>
    cuadra(
      id,
      'Cuántos grupos salen',
      Object.keys(variables).length - rango([0, 1, 2].map((i) => Object.values(variables).map((d) => d[i]))),
    ));

  it('y la densidad entra con exponente −1 en el grupo de K', () => {
    /* Tres ecuaciones, una por dimensión, con las tres repetidas como
       incógnitas. El de masa lo decide solo: K y ρ son las únicas con M. */
    const M = [0, 1, 2].map((i) => [
      variables.rho[i],
      variables.v[i],
      variables.L[i],
      -variables.K[i],
    ]);
    for (let c = 0; c < 3; c++) {
      const piv = M.findIndex((f, i) => i >= c && Math.abs(f[c]) > 1e-9);
      [M[c], M[piv]] = [M[piv], M[c]];
      for (let i = 0; i < 3; i++) {
        if (i === c) continue;
        const k = M[i][c] / M[c][c];
        for (let j = c; j < 4; j++) M[i][j] -= k * M[c][j];
      }
    }
    cuadra(id, 'El exponente de la densidad', M[0][3] / M[0][0]);
  });
});

describe('9 · los dos ramales laminares', () => {
  const id = 'exflu2122-ord-9-los-dos-ramales-laminares';
  const gamma = 1260 * G;
  const nu = 80e-6;
  /* Con el régimen laminar, f = 64/Re y la pérdida es **lineal** en el caudal:
     ni la rugosidad ni el material intervienen. Que la instalación sea de
     cobre es un dato de sobra. */
  const resistencia = (L: number, D: number) => (128 * nu * L) / (Math.PI * G * D ** 4);

  const HA = 555660 / gamma;
  const HB = (15 * 2.52 * GAMMA) / gamma;

  it('en A hay 45 metros de columna', () => cuadra.magnitud(id, 'La altura de energía en A', HA, 'm'));

  const Q2 = (HA - HB) / resistencia(250, 0.04);
  it('y el ramal sin bomba lleva 0,462 l/s', () => cuadra.magnitud(id, 'El caudal del ramal sin bomba', Q2 * 1000, 'l/s'));

  /* En el ramal con bomba la energía disponible es el mismo salto **más** la
     altura de la bomba, que depende del caudal. */
  const util = 1200 * 0.54;
  const Q1 = raiz((q) => resistencia(100, 0.05) * q - (HA - HB) - util / (gamma * q), 1e-5, 0.05);

  it('y el bombeado, 4,85 l/s', () => {
    if (!(Q1 > 8 * Q2)) throw new Error('la bomba no rompe la simetría tanto como debería');
    cuadra.magnitud(id, 'El caudal bombeado', Q1 * 1000, 'l/s');
  });

  it('y por B salen 5,31 l/s', () => cuadra.magnitud(id, 'El caudal que sale del nudo B', (Q1 + Q2) * 1000, 'l/s'));
});

describe('10 · cinco preguntas de máquinas', () => {
  it('a la salida del inyector la presión relativa es cero', () => {
    /* Una Pelton es de acción: dentro del inyector todo el salto se ha
       convertido en velocidad, y el chorro sale a la atmósfera. Lo que sí se
       puede comprobar es que la energía cuadra: la altura cinética del chorro
       tiene que ser el salto entero. */
    const salto = 200; // uno cualquiera
    const v = Math.sqrt(2 * G * salto);
    const presionRelativa = salto - (v * v) / (2 * G);
    cuadra('exflu2122-ord-10-cinco-preguntas-de-maquinas', 'La presión a la salida del inyector', presionRelativa);
  });
});

describe('11 · la boquilla y la válvula que se cierra', () => {
  const id = 'exflu2122-ord-11-la-boquilla-y-la-valvula-que-se-cierra';
  const dBoq = 0.1;
  const CHW = 140;
  /* Los coeficientes de la curva de la instalación, con Q en l/s. */
  const aBoq = 1 / area(dBoq) ** 2 / (2 * G) / 1e6;
  const bTuberias =
    (hazenWilliams(5, 1, 0.35, CHW) + hazenWilliams(500, 1, 0.3, CHW)) / 1000 ** 1.852;

  it('la boquilla aporta 8,27·10⁻⁴ Q²', () => cuadra(id, 'El término de la boquilla', aBoq * 1e4));

  it('y las dos tuberías, 5,58·10⁻⁴ Q^1,852', () => {
    /* De los tres términos de la instalación, el dominante es el de la
       boquilla: quinientos metros de tubería pierden menos que los cien
       milímetros de la salida. */
    if (!(aBoq * 110 ** 2 > 2 * bTuberias * 110 ** 1.852))
      throw new Error('la boquilla no domina, y debería');
    cuadra(id, 'El término de Hazen-Williams', bTuberias * 1e4);
  });

  const instalacion = (Q: number) => 5 + aBoq * Q ** 2 + bTuberias * Q ** 1.852;
  const bomba = (Q: number) => 24.49 - 5.061e-4 * Q * Q;
  const Q0 = raiz((Q) => bomba(Q) - instalacion(Q), 1, 400);

  it('y el punto de funcionamiento son 109,98 l/s', () =>
    cuadra.magnitud(id, 'El punto de funcionamiento', Q0, 'l/s'));

  it('y la bomba no puede subir de la cota 4,58', () => {
    /* NPSH disponible por encima del requerido con el margen habitual del
       30 %. La aspiración es tan corta y tan ancha que apenas pierde
       dieciséis milímetros: lo que limita es la propia máquina. */
    const perdidaAspiracion = (hazenWilliams(5, Q0 / 1000, 0.35, CHW));
    if (perdidaAspiracion > 0.05) throw new Error('la aspiración pierde más de lo que debería');
    cuadra.magnitud(id, 'La cota máxima de la bomba', 10 - 0.2 - perdidaAspiracion - 1.3 * 4, 'm');
  });

  it('y la válvula acaba quemando 3,34 m', () => {
    /* Los dos manómetros dan la nueva altura de la bomba, y de ella sale el
       nuevo caudal; lo que la instalación no pide a ese caudal es lo que la
       válvula disipa. */
    const nueva = 1.493 * 10 + 4.5;
    const Q = raiz((q) => bomba(q) - nueva, 1, 400);
    cuadra.magnitud(id, 'La pérdida que añade la válvula', nueva - instalacion(Q), 'm');
  });
});
