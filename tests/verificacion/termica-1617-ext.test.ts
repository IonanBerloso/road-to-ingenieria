/**
 * La extraordinaria de Ingeniería Térmica del 19 de junio de 2017.
 *
 * Dos ejercicios que se prestan a un camino de verdad distinto. La pantalla de
 * radiación se diseña sin σ ni temperaturas —un tercio del calor es el triple
 * de resistencia— y su temperatura sale como en un divisor de tensión. El
 * compresor de nitrógeno trae tres datos del gas que no son del todo el mismo
 * gas, y la pregunta del isentrópico lo zanja fijando γ = 1,4: se dice abajo.
 */
import { describe, expect, it } from 'vitest';
import { convocatoria } from './corpus';

const cuadra = convocatoria('ingenieria-termica', '2016-2017-ext');
const K = 273.15;

describe('1 · el compresor que rinde más en exergía que en isentrópico', () => {
  const id = 'exter1617-ext-1-el-compresor-que-rinde-mas-exergetico-que-isentropico';
  const [m, rc] = [0.5, 7];
  const [T1, T2, T0] = [20 + K, 280 + K, 18 + K];
  const [cp, R, gamma] = [1.034, 0.297, 1.4]; // la nota del enunciado
  const W = m * cp * (T1 - T2);
  const ds = cp * Math.log(T2 / T1) - R * Math.log(rc);
  const T2s = T1 * rc ** ((gamma - 1) / gamma);
  const etaS = (100 * (T2s - T1)) / (T2 - T1);
  // adiabático: toda la entropía que gana el nitrógeno es generada
  const exD = T0 * m * ds;

  it('consume 134,42 kW', () => cuadra.magnitud(id, 'La potencia del compresor', W, 'kW'));

  it('el isentrópico es el 83,8 %, con el exponente que fija la pregunta', () => {
    /* La pregunta da T₂' con (γ−1)/γ = 0,2857. Con el Δs = 0 de c_p y R' de la
       nota, el exponente sería R'/c_p = 0,2872: el ideal saldría a 512,7 K y el
       rendimiento a 84,4 %, fuera de la casilla. Manda la pregunta. */
    const conR = T1 * rc ** (R / cp);
    expect((100 * (conR - T1)) / (T2 - T1)).toBeGreaterThan(84.3);
    cuadra(id, 'El rendimiento isentrópico', etaS);
  });

  it('destruye 11,47 kW, por Guy-Stodola y por el balance de exergía', () => {
    // entra el trabajo y el nitrógeno se lleva su exergía de flujo; lo que falta está destruido
    const porBalance = -W - m * (cp * (T2 - T1) - T0 * ds);
    expect(Math.abs(porBalance - exD)).toBeLessThan(1e-9 * exD);
    cuadra.magnitud(id, 'La exergía destruida', porBalance, 'kW');
  });

  it('y rinde el 91,5 % en exergía, siete puntos más que en isentrópico', () => {
    const eta = (100 * m * (cp * (T2 - T1) - T0 * ds)) / -W;
    expect(Math.abs(eta - 100 * (1 - exD / -W))).toBeLessThan(1e-9);
    expect(eta).toBeGreaterThan(etaS);
    cuadra(id, 'El rendimiento exergético', eta);
  });
});

describe('3 · la pantalla de radiación que hay que diseñar', () => {
  const id = 'exter1617-ext-3-la-pantalla-que-hay-que-disenar';
  const A = 4 * 2; // m², cada pared
  const [T1, T2] = [200 + K, 20 + K];
  const [e1, e2] = [0.8, 0.4];
  const [F12, Fp] = [0.52, 0.71]; // del ábaco, en la nota del enunciado
  const sigma = 5.67e-8; // W/(m²·K⁴), la que usa la resolución
  const sup = (e: number) => (1 - e) / (e * A);
  const geo = (F: number) => 1 / (F * A);
  const R0 = sup(e1) + geo(F12) + sup(e2);
  const Q0 = (sigma * (T1 ** 4 - T2 ** 4)) / R0;

  it('sin pantalla pasan 5.271 W', () => cuadra.magnitud(id, 'El intercambio sin pantalla', Q0, 'W'));

  /* La emisividad sin σ ni temperaturas: el numerador es el mismo con pantalla
     y sin ella, así que un tercio del calor es el triple de resistencia. La
     pantalla pone dos caras y parte el hueco en dos. */
  const porCara = (3 * R0 - sup(e1) - 2 * geo(Fp) - sup(e2)) / 2;
  const ep = 1 / (1 + A * porCara);

  it('la pantalla necesita una emisividad de 0,237: una chapa pintada, no un espejo', () => {
    expect(ep).toBeGreaterThan(0);
    expect(ep).toBeLessThan(1);
    // y una negra solo recortaría un 20 %
    const negra = sup(e1) + 2 * geo(Fp) + sup(e2);
    expect(1 - R0 / negra).toBeGreaterThan(0.15);
    expect(1 - R0 / negra).toBeLessThan(0.25);
    cuadra(id, 'La emisividad de la pantalla', ep);
  });

  it('y se queda a 147 °C, más cerca de la pared caliente, como en un divisor de tensión', () => {
    const r1p = sup(e1) + geo(Fp) + sup(ep);
    const rp2 = sup(ep) + geo(Fp) + sup(e2);
    const Tp = (T1 ** 4 - ((T1 ** 4 - T2 ** 4) * r1p) / (r1p + rp2)) ** 0.25;
    // por los dos huecos pasa lo mismo, y es un tercio del de partida
    const q1p = (sigma * (T1 ** 4 - Tp ** 4)) / r1p;
    const qp2 = (sigma * (Tp ** 4 - T2 ** 4)) / rp2;
    expect(Math.abs(q1p - Q0 / 3) / Q0).toBeLessThan(1e-12);
    expect(Math.abs(qp2 - Q0 / 3) / Q0).toBeLessThan(1e-12);
    expect(Tp - K).toBeGreaterThan((200 + 20) / 2);
    cuadra.magnitud(id, 'La temperatura de la pantalla', Tp, 'K');
  });
});
