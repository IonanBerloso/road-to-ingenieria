/**
 * La ordinaria de Ingeniería Térmica de enero de 2021, y la primera
 * convocatoria de la asignatura que entra aquí.
 *
 * TÉRMICA NO ES COMO LAS OTRAS CUATRO, y conviene decirlo antes de nada: sus
 * PDF traen la resolución oficial del profesor, y cada ejercicio del corpus se
 * contrastó contra ella cifra a cifra al escribirse. Lo que añade este fichero
 * es lo que aquel contraste no da: una cuenta escrita aparte que **no
 * caduca**. Y en esta convocatoria defiende además una cifra en la que el
 * sitio se aparta de la oficial a propósito —el rendimiento exergético de la
 * bomba del ejercicio 3, 82,7 % y no 3,88 %—, que es justo la clase de cifra
 * que un día alguien «corrige» para que coincida con el PDF.
 *
 * Dos convenciones:
 *
 * - Las temperaturas absolutas van con 273,15; la resolución usa 273. Que las
 *   dos lleguen dentro de la tolerancia es parte de lo que se comprueba.
 * - Los valores de tabla se copian de lo que el enunciado publica —su tabla de
 *   propiedades o la nota que el corpus añade debajo—, nunca de memoria.
 */
import { describe, expect, it } from 'vitest';
import { convocatoria } from './corpus';

const cuadra = convocatoria('ingenieria-termica', '2020-2021-ord');
const K = 273.15;

describe('1 · el aceite que se lleva setenta grados', () => {
  const id = 'exter2021-ord-1-el-aceite-que-se-lleva-setenta-grados';
  // la tabla del enunciado, fila del aceite
  const [m, cp, rho, k, nu, Pr] = [0.9, 2224.4, 839.445, 0.1366, 2.005e-5, 273.96];
  const [D, L] = [0.025, 9.5];
  const Q = m * cp * (106 - 96);

  it('el aceite cede 20,02 kW', () => cuadra.magnitud(id, 'El calor que atraviesa el tubo', Q, 'W'));

  const c = m / ((rho * Math.PI * D * D) / 4);
  const Re = (c * D) / nu;
  const h = (0.023 * Re ** 0.8 * Pr ** 0.3 * k) / D;

  it('su película tiene 378,9 W/(m²·K), con el exponente del fluido que se enfría', () =>
    cuadra.magnitud(id, 'El coeficiente de convección del aceite', h, 'W/(m^2 K)'));

  it('y la cara interior del tubo está a 30,2 °C, setenta grados por debajo del aceite', () =>
    cuadra.magnitud(id, 'La temperatura de la cara interior', (106 + 96) / 2 - Q / (h * Math.PI * D * L), '°C'));
});

describe('2 · la referencia es el agua que entra', () => {
  const id = 'exter2021-ord-2-la-referencia-es-el-agua-que-entra';
  const [mA, cA, cW] = [0.9, 2224.4, 4182.3];
  const Q = mA * cA * (106 - 96);
  const mW = Q / (cW * (25 - 14));
  // «la temperatura del fluido a menor temperatura»: la del agua al entrar
  const T0 = 14 + K;
  // ψe − ψs de un líquido incompresible, con las temperaturas en °C
  const baja = (c: number, te: number, ts: number) => c * (te - ts) - T0 * c * Math.log((te + K) / (ts + K));
  const cedeAceite = mA * baja(cA, 106, 96);
  const ganaAgua = -mW * baja(cW, 14, 25);
  const SG = mA * cA * Math.log((96 + K) / (106 + K)) + mW * cW * Math.log((25 + K) / (14 + K));

  it('circulan 0,4352 kg/s de agua', () => cuadra.magnitud(id, 'El gasto de agua', mW, 'kg/s'));

  it('se generan 14,92 W/K', () => cuadra.magnitud(id, 'La entropía generada', SG, 'W/K'));

  it('y se destruyen 4,28 kW, los mismos por los dos caminos', () => {
    /* El balance de exergía y Guy-Stodola tienen que dar exactamente lo mismo:
       la energía cuadra por construcción —el agua recibe lo que suelta el
       aceite— y lo que queda es T₀ por la entropía generada. */
    const porBalance = cedeAceite - ganaAgua;
    expect(Math.abs(porBalance - T0 * SG)).toBeLessThan(1e-9 * porBalance);
    /* Y en vatios, no en kilovatios: la resolución oficial escribe «4281,9 kW»
       con los calores específicos en J/(kg·K). */
    cuadra.magnitud(id, 'La exergía destruida', porBalance, 'W');
  });

  it('y el rendimiento exergético se queda en el 8 %', () =>
    cuadra(id, 'El rendimiento exergético', (100 * ganaAgua) / cedeAceite));
});

describe('3 · la bomba del 82,7 %, y la cámara de mezcla', () => {
  const id = 'exter2021-ord-3-la-bomba-que-rinde-el-ochenta-y-tres-y-no-el-cuatro';
  const [m1, rho] = [0.435, 998.11];
  const c = 4.1823; // kJ/(kg·K), el del agua en la tabla del ejercicio 1
  const [T0, T1] = [14 + K, 25 + K];
  const etaInterno = 0.82;

  /* El modelo del sitio: la bomba ideal sube la presión, v·ΔP, y solo lo que
     la real pierde respecto de ella calienta el agua. Devuelve lo que sube la
     exergía y el trabajo real, por kilogramo. */
  const bomba = (eta: number) => {
    const ws = (600 - 140) / rho;
    const w = ws / eta;
    const T2 = T1 + (w - ws) / c;
    return { ws, w, T2, dpsi: w - T0 * c * Math.log(T2 / T1) };
  };
  /* El de la resolución oficial: todo el trabajo calienta el agua. */
  const bombaOficial = (eta: number) => {
    const w = (600 - 140) / rho / eta;
    const T2 = T1 + w / c;
    return c * (T2 - T1) - T0 * c * Math.log(T2 / T1);
  };
  const b = bomba(etaInterno);

  it('la bomba consume 0,2445 kW', () => cuadra.magnitud(id, 'La potencia que consume la bomba', m1 * b.w, 'kW'));

  it('el agua gana 0,4646 kJ/kg de exergía, casi todo por la presión', () =>
    cuadra.magnitud(id, 'Lo que gana el agua en exergía', b.dpsi, 'kJ/kg'));

  it('y la bomba rinde el 82,7 %, un poco por encima del rendimiento interno', () => {
    const eta = (100 * b.dpsi) / b.w;
    expect(eta).toBeGreaterThan(100 * etaInterno);
    cuadra(id, 'El rendimiento exergético de la bomba', eta);
  });

  it('y la prueba de que la cifra oficial no puede ser: con su cuenta, una bomba perfecta rendiría menos del 5 %', () => {
    const perfecta = bomba(1);
    expect(perfecta.dpsi / perfecta.w).toBeCloseTo(1, 12);
    const oficialPerfecta = bombaOficial(1) / perfecta.w;
    expect(oficialPerfecta).toBeLessThan(0.05);
    // y con el 82 % reproduce el orden de la cifra que imprime, 3,88 %
    expect((100 * bombaOficial(etaInterno)) / b.w).toBeGreaterThan(3);
    expect((100 * bombaOficial(etaInterno)) / b.w).toBeLessThan(4.5);
  });

  // la cámara, con los valores de tabla de la nota del enunciado
  const [h1, s1, h3, s3] = [104.89, 0.3674, 3270.3, 7.7079];
  const [hf, hg, sf, sg] = [670.56, 2756.8, 1.9312, 6.76];
  const h2 = h1 + b.w;
  const h4 = (m1 * h2 + h3) / (m1 + 1);

  it('la mezcla sale con 2.310,9 kJ/kg', () => cuadra.magnitud(id, 'La entalpía de la mezcla', h4, 'kJ/kg'));

  it('y la cámara destruye 101 kW, más de dos mil veces lo de la bomba', () => {
    expect(h4).toBeGreaterThan(hf);
    expect(h4).toBeLessThan(hg); // sale húmeda
    const x4 = (h4 - hf) / (hg - hf);
    const s4 = sf + x4 * (sg - sf);
    const s2 = s1 + c * Math.log(b.T2 / T1);
    const destruida = T0 * ((m1 + 1) * s4 - m1 * s2 - s3);
    expect(destruida / (m1 * T0 * c * Math.log(b.T2 / T1))).toBeGreaterThan(2000);
    cuadra.magnitud(id, 'La exergía destruida en la cámara', destruida, 'kW');
  });
});
