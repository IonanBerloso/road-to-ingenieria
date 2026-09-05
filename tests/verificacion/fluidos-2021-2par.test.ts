/**
 * El segundo parcial de Mecánica de Fluidos de 2020-2021. Once respuestas.
 *
 * El ejercicio 1 tiene la lección de red más útil del corpus: el depósito D
 * está **por debajo** del nudo —cota 6 frente a una altura piezométrica de
 * 16,6— y aun así le manda caudal, porque está presurizado. El test lo deja
 * comprobado en vez de dicho: calcula el caudal de la bomba, resta, y verifica
 * que lo que sobra tiene que entrar por el tercer conducto y no salir por él.
 *
 * Y el 4 es la razón de que los catálogos de accesorios sirvan para algo: un
 * factor de paso es adimensional, así que **describe la geometría y no el
 * fluido**. Una válvula caracterizada con agua sirve para dimensionar una
 * instalación de mercurio.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { raiz } from './numerico';

const cuadra = convocatoria('fluidos', '2020-2021-2par');

const G = 9.8;
const area = (d: number) => (Math.PI * d * d) / 4;

describe('1 · la embotelladora de diez boquillas', () => {
  const id = 'exflu2021-2par-1-la-embotelladora-de-diez-boquillas';
  const gamma = 1040 * G;
  const [D1, D2, dBoq] = [0.08, 0.1, 0.025];
  /* El consumo lo fijan las boquillas: 2,5 mcl de presión dinámica. */
  const vBoq = Math.sqrt(2 * G * 2.5);
  const Q2 = 10 * vBoq * area(dBoq);
  const v2 = Q2 / area(D2);
  /* Remontando de la línea de llenado hasta el nudo. Los 60 W de rozamiento
     del conducto 2 se pasan a metros con la propia potencia. */
  const energiaN =
    12 + 2.5 + 60 / (gamma * Q2) + 2 * 0.84 * ((v2 * v2) / (2 * G)) + 0.12 * ((vBoq * vBoq) / (2 * G));

  it('en el nudo hay 169,4 kJ/m³', () => {
    if (Math.abs(vBoq - 7) > 1e-9) throw new Error('la presión dinámica no da 7 m/s');
    cuadra(id, 'La energía del nudo', (energiaN * gamma) / 1000);
  });

  /* Los dos aparatos: el vacuómetro **suma** a la altura de la bomba. */
  const Hm = (0.66 * 13600 * G) / gamma + (1 * 98000) / gamma;
  const perdidasAspiracion = 0.6 + 0.84 + 0.6;
  const v1 = raiz((v) => 1 + Hm - perdidasAspiracion * ((v * v) / (2 * G)) - energiaN, 0.1, 30);
  const Q1 = v1 * area(D1);

  it('la bomba mueve 25,25 l/s', () => cuadra.magnitud(id, 'El caudal que bombea la bomba', Q1 * 1000, 'l/s'));

  it('y el tercer conducto trae 9,11 l/s desde D', () => {
    /* Lo que las boquillas piden y la bomba no da tiene que entrar por el 3.
       Que el signo salga positivo es lo que dice que D alimenta y no recibe. */
    const Q3 = Q2 - Q1;
    if (!(Q3 > 0)) throw new Error('el tercer conducto saldría del nudo en vez de entrar');
    cuadra.magnitud(id, 'El caudal del tercer conducto', Q3 * 1000, 'l/s');
  });

  it('y el rendimiento es del 57,4 %', () =>
    cuadra(id, 'El rendimiento de la bomba', ((gamma * Q1 * Hm) / 8176) * 100));
});

describe('2 · el Pitot y el piezómetro juntos', () => {
  const id = 'exflu2021-2par-2-el-pitot-y-el-piezometro-juntos';
  const s = 0.68;
  const [D, dGarganta, dBoq] = [0.4, 0.2, 0.08];
  /* Sin pérdidas, la instalación es un Torricelli con 21 m de desnivel. */
  const vBoq = Math.sqrt(2 * G * (24 - 3));
  const Q = vBoq * area(dBoq);
  const vTuberia = Q / area(D);

  it('circulan 102 l/s de gasolina', () => cuadra.magnitud(id, 'El caudal circulante', Q * 1000, 'l/s'));

  it('y el venturímetro marca 0,504 m', () => {
    /* El manómetro en U invertida está lleno de **aire**, así que su lectura es
       directamente la diferencia de alturas piezométricas, y esa diferencia es
       el salto de alturas cinéticas entre la tubería y la garganta. */
    const vGarganta = Q / area(dGarganta);
    cuadra(id, 'La lectura del venturímetro', (vGarganta * vGarganta - vTuberia * vTuberia) / (2 * G));
  });

  it('y el líquido del Pitot tiene s = 0,726', () => {
    /* La diferencia entre el Pitot y el piezómetro es la altura cinética de la
       tubería, tres centímetros y medio, y el manómetro la lee con medio metro
       de columna: casi quince veces de amplificación, y eso es lo que fija la
       densidad del líquido. */
    const cinetica = (vTuberia * vTuberia) / (2 * G);
    const s0 = raiz((x) => 0.5 * (x / s - 1) - cinetica, 0.4, 3);
    if (!(s0 < 1)) throw new Error('con agua el líquido flotaría, y ese es el apartado (e)');
    cuadra(id, 'La densidad del líquido manométrico', s0);
  });
});

describe('3 · el carro con el álabe', () => {
  const id = 'exflu2021-2par-3-el-carro-con-el-alabe';
  const [d, Cc, Cv, H] = [0.02, 0.62, 0.98, 2];
  const v = Cv * Math.sqrt(2 * G * H);
  const Q = Cc * area(d) * v;

  it('la barra del depósito aguanta 7,33 N', () => cuadra(id, 'La tensión de la barra del depósito', 1000 * Q * v));

  it('y con sesenta grados el álabe recibe justo ρQv', () => {
    /* El chorro entra y sale con la misma velocidad, desviado θ. El módulo del
       cambio de velocidad es v·√(2(1−cos θ)), y a 60° ese factor vale
       exactamente 1: se comprueba componiendo los dos vectores. */
    const theta = Math.PI / 3;
    const entra = [v, 0];
    const sale = [v * Math.cos(theta), v * Math.sin(theta)];
    const cambio = Math.hypot(sale[0] - entra[0], sale[1] - entra[1]);
    cuadra(id, 'La reacción del álabe con sesenta grados', cambio / v);
  });
});

describe('4 · el aerosol y la válvula con mercurio', () => {
  const id = 'exflu2021-2par-4-el-aerosol-y-la-valvula-con-mercurio';

  it('el aula tiene cinco adimensionales', () => {
    /* Ocho variables —C, D, σ, ρ, A, v, w, ν— y el rango de su matriz
       dimensional, que se calcula en vez de suponerse. */
    const dims: [number, number, number][] = [
      [1, -3, 0], // C, concentración (masa por volumen)
      [0, 1, 0], // D
      [1, 0, -2], // sigma
      [1, -3, 0], // rho
      [0, 2, 0], // A
      [0, 1, -1], // v
      [0, 1, -1], // w
      [0, 2, -1], // nu
    ];
    const M = [0, 1, 2].map((i) => dims.map((d) => d[i]));
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
    cuadra(id, 'Cuántos adimensionales tiene el aerosol', dims.length - rango);
  });

  it('y por la válvula pasan 8,56 l/s de mercurio', () => {
    /* El factor de paso es adimensional, así que es el mismo con los dos
       fluidos: Δp = k·ρv²/2 deja Q proporcional a √(Δp/ρ). Se comprueba
       calculando la k con los datos del agua y usándola con el mercurio, en
       vez de aplicar la proporción directamente. */
    const k = (1200 * 2) / (1000 * (0.01 / area(0.05)) ** 2); // con un diámetro cualquiera
    const dpHg = 1.22 * 1000 * G;
    const QHg = area(0.05) * Math.sqrt((2 * dpHg) / (13600 * k));
    if (Math.abs(QHg / 0.01 - Math.sqrt(dpHg / 13600 / (1200 / 1000))) > 1e-9)
      throw new Error('el diámetro elegido influye, y no debería');
    cuadra.magnitud(id, 'El caudal de mercurio', QHg * 1000, 'l/s');
  });
});
