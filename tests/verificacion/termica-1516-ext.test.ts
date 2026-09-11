/**
 * La extraordinaria de Ingeniería Térmica del 16 de junio de 2016: el
 * compresor que el modelo da por reversible y la medida no, y el termopar que
 * mide su propia temperatura. Los dos traen algo más que tiene que cuadrar: el
 * trabajo técnico por Simpson además de por la fórmula, un modelo que no
 * genera entropía, y dos alumnos que miden mal el mismo gas y llegan a él.
 */
import { describe, expect, it } from 'vitest';
import { convocatoria } from './corpus';
import { integra, raiz } from './numerico';

const cuadra = convocatoria('ingenieria-termica', '2015-2016-ext');

describe('1 · el modelo dice reversible, y la medida dice que no', () => {
  const id = 'exter1516-ext-1-el-modelo-dice-reversible-y-la-medida-no';
  const [T1, P1, P2, n] = [290, 98, 670, 1.2];
  const [cp, R] = [1.0045, 0.287]; // la nota del enunciado
  const cv = cp - R;
  const T2 = T1 * (P2 / P1) ** ((n - 1) / n);
  const w = (n / (n - 1)) * R * (T1 - T2);

  it('el modelo saca el aire a 399,5 K, más frío que el adiabático', () => {
    expect(T2).toBeLessThan(T1 * (P2 / P1) ** (R / cp));
    cuadra.magnitud(id, 'La temperatura que predice el modelo', T2, 'K');
  });

  it('y consume 188,56 kJ/kg, igual por Simpson que por la fórmula', () => {
    // el trabajo técnico, −∫v·dP, con v = v1·(P1/P)^(1/n) a lo largo de la politrópica
    const v1 = (R * T1) / P1;
    const porSimpson = -integra((P) => v1 * (P1 / P) ** (1 / n), P1, P2, 1e-8);
    expect(Math.abs(porSimpson - w) / Math.abs(w)).toBeLessThan(1e-7);
    cuadra.magnitud(id, 'El trabajo que predice el modelo', porSimpson, 'kJ/kg');
  });

  it('el modelo no genera nada: su Δs es exactamente la entropía que se lleva el calor', () => {
    /* Con n = 1,2 y γ = 1,4 el calor específico politrópico es justo −cv; el
       calor del primer principio tiene que ser cn·ΔT, y Δs, cn·ln(T2/T1). */
    const cn = cv - R / (n - 1);
    expect(cn).toBeCloseTo(-cv, 12);
    const q = cp * (T2 - T1) + w;
    expect(Math.abs(q - cn * (T2 - T1))).toBeLessThan(1e-9);
    const ds = cp * Math.log(T2 / T1) - R * Math.log(P2 / P1);
    expect(Math.abs(ds - cn * Math.log(T2 / T1))).toBeLessThan(1e-12);
  });

  const [T2m, wm, Tsup] = [420, -220, 345]; // lo medido: salida, consumo y superficie
  const q = cp * (T2m - T1) + wm;

  it('la máquina real cede 89,42 kJ/kg, más que el modelo', () => {
    expect(q).toBeLessThan(cp * (T2 - T1) + w);
    cuadra.magnitud(id, 'El calor que cede la máquina real', q, 'kJ/kg');
  });

  it('y genera 0,0796 kJ/(kg·K) con la entropía del aire bajando: el compresor real es irreversible', () => {
    const ds = cp * Math.log(T2m / T1) - R * Math.log(P2 / P1);
    const sG = ds - q / Tsup;
    expect(ds).toBeLessThan(0);
    expect(sG).toBeGreaterThan(0);
    cuadra.magnitud(id, 'La entropía generada según las medidas', sG, 'kJ/(kg K)');
  });
});

describe('3 · el termopar que no mide lo que cree', () => {
  const id = 'exter1516-ext-3-el-termopar-que-no-mide-lo-que-cree';
  const [h, eps] = [142, 0.8];
  const sigma = 5.67e-8; // la del desarrollo
  // el gas en que un termopar a T se equilibra radiando contra una superficie a Tv
  const gas = (T: number, Tv: number) => T + (eps * sigma * (T ** 4 - Tv ** 4)) / h;
  const error = (lectura: number, Tg: number) => (100 * (Tg - lectura)) / Tg;
  const desnudo = gas(600, 500);
  const conEscudo = gas(619, 610);

  it('el gas está a 621,4 K, por encima de la lectura', () => {
    expect(desnudo).toBeGreaterThan(600);
    cuadra.magnitud(id, 'La temperatura de verdad del gas', desnudo, 'K');
  });

  it('el que no protege se equivoca un 3,45 %', () =>
    cuadra(id, 'El error del que no protege', error(600, desnudo)));

  it('el que protege, un 0,43 %: ocho veces menos', () => {
    expect(error(600, desnudo) / error(619, conEscudo)).toBeGreaterThan(7.5);
    cuadra(id, 'El error del que sí protege', error(619, conEscudo));
  });

  it('y los dos miden el mismo gas: en el que ve el escudo, el termopar desnudo marcaría 600 K', () => {
    /* Al revés que la resolución: se toma el gas que sale del escudo y se busca
       por bisección qué leería en él un termopar desnudo frente a las paredes. */
    const lectura = raiz((T) => gas(T, 500) - conEscudo, 500, conEscudo);
    expect(Math.abs(lectura - 600)).toBeLessThan(0.5);
  });
});
