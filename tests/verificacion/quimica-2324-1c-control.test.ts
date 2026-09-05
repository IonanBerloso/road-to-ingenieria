/**
 * Control del primer cuatrimestre de Fundamentos Químicos, curso 2023-2024.
 *
 * El examen **no publica ninguna solución**, así que las cuatro resoluciones
 * del corpus son propuesta nuestra. Aquí se vuelven a hacer las diez cuentas
 * desde los datos del enunciado, sin mirar el `desarrollo`, y se comparan con
 * lo que el corpus publica.
 *
 * Ver `tests/verificacion/README.md` para qué atrapa esto y qué no.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';

const cuadra = convocatoria('fundamentos-quimicos', '2023-2024-1c-control');

/* Las masas atómicas son las que imprime el propio examen, no las de una
   tabla nuestra: si el enunciado usa 12.01 para el carbono, la comprobación
   tiene que usar 12.01. */
const u = { H: 1.01, C: 12.01, N: 14.01, O: 16.0, S: 32.06, Fe: 55.85, Cu: 63.55 };

describe('1 · cuatro elementos y una tabla — Slater', () => {
  /* Las reglas de Slater, escritas aquí y no importadas de ningún sitio:
     la pantalla de un electrón vale 0,35 por cada compañero de su grupo
     —0,30 si el grupo es 1s—, 0,85 por cada electrón de la capa n−1 cuando
     el electrón estudiado es s o p, y 1,00 por todo lo de más adentro. Para
     un electrón d o f no hay banda intermedia: todo lo interior tapa 1,00. */
  const slater = (
    mismoGrupo: number,
    capaAnterior: number,
    masAdentro: number,
    esD = false,
  ) => 0.35 * mismoGrupo + (esD ? 1.0 : 0.85) * capaAnterior + 1.0 * masAdentro;

  it('el 3d del hierro (Z = 26) siente 6,25', () => {
    /* [Ar] 3d⁶ 4s². El electrón diferenciador es uno de los seis 3d: cinco
       compañeros de grupo, y los dieciocho de dentro tapan del todo porque el
       electrón es d. Los dos 4s son de un grupo posterior y no cuentan. */
    const S = slater(5, 0, 18, true);
    cuadra('exfq2324-1c-control-1-cuatro-elementos-y-una-tabla', 'La carga efectiva del elemento B', 26 - S);
  });

  it('el 4p del bromo (Z = 35) siente 7,60', () => {
    /* [Ar] 3d¹⁰ 4s² 4p⁵. El grupo (4s4p) tiene siete electrones, seis además
       del estudiado; la capa n−1 son los dieciocho de n = 3, incluidos los
       diez 3d; y quedan diez más adentro. */
    const S = slater(6, 18, 10);
    cuadra('exfq2324-1c-control-1-cuatro-elementos-y-una-tabla', 'La carga efectiva del elemento D', 35 - S);
  });
});

describe('3 · la fórmula de la cocaína', () => {
  /* Del enunciado: 5,00 g de compuesto dan 12,35 g de CO₂ y 3,123 g de H₂O;
     en otro ensayo, 2,35 g dan 0,132 g de amoniaco. */
  const muestra = 5.0;
  const gCO2 = 12.35;
  const gH2O = 3.123;
  const muestraN = 2.35;
  const gNH3 = 0.132;

  const M = { CO2: u.C + 2 * u.O, H2O: 2 * u.H + u.O, NH3: u.N + 3 * u.H };

  const gC = gCO2 * (u.C / M.CO2);
  const gH = gH2O * ((2 * u.H) / M.H2O);
  const molN = (gNH3 / M.NH3) * (muestra / muestraN);
  const gN = molN * u.N;
  const molO = (muestra - gC - gH - gN) / u.O;

  const id = 'exfq2324-1c-control-3-la-formula-de-la-cocaina';

  it('el carbono de la combustión son 3,370 g', () => cuadra(id, 'El carbono', gC));

  it('el nitrógeno, llevado a la base de 5 g, son 0,01648 mol', () =>
    cuadra(id, 'El nitrógeno, llevado a la misma base', molN));

  it('el oxígeno, que no se mide, sale por diferencia: 0,0655 mol', () =>
    cuadra(id, 'El oxígeno, que no se mide', molO));

  it('hay 17 carbonos por cada nitrógeno', () =>
    cuadra(id, 'Cuántos carbonos por nitrógeno', gC / u.C / molN));
});

describe('4 · la calcopirita', () => {
  const id = 'exfq2324-1c-control-4-la-calcopirita-y-la-errata-del-rendimiento';

  /* Del enunciado: 1 t de mineral al 90,20 % de CuFeS₂, y 600 m³ de oxígeno
     de densidad 0,401 g/L. La ecuación ajustada es 2 CuFeS₂ + 3 O₂ →
     2 FeO + 2 CuS + 2 SO₂. */
  const M = {
    CuFeS2: u.Cu + u.Fe + 2 * u.S,
    O2: 2 * u.O,
    FeO: u.Fe + u.O,
    SO2: u.S + 2 * u.O,
    H2SO4: 2 * u.H + u.S + 4 * u.O,
  };
  const molMineral = (1e6 * 0.902) / M.CuFeS2;
  const molO2 = (600e3 * 0.401) / M.O2;

  it('el mineral es el limitante, no el oxígeno', () => {
    /* La proporción es 2 a 3, así que se compara n/2 contra n/3. El margen es
       de un 2 %, que es justo lo que hace que dejarse la riqueza del mineral
       cambie de limitante. */
    if (!(molMineral / 2 < molO2 / 3)) throw new Error('el limitante no es el mineral');
  });

  it('cabría esperar 353,1 kg de FeO', () =>
    cuadra(id, 'El óxido que cabría esperar', (molMineral * M.FeO) / 1000));

  it('de 110 m³ de SO₂ salen 256,4 L de sulfúrico al 97 %', () => {
    /* Densidad del SO₂ 2,711 g/L; relación 1:1 con el ácido; la disolución es
       del 97 % en masa y tiene densidad 1,836 g/mL. */
    const molSO2 = (110e3 * 2.711) / M.SO2;
    const gAcidoPuro = molSO2 * M.H2SO4;
    const litros = gAcidoPuro / 0.97 / 1.836 / 1000;
    cuadra(id, 'El ácido sulfúrico que se podría sacar', litros);
  });

  it('la dilución al 7 % es 0,746 M', () => {
    /* Un litro de disolución pesa 1045 g y el 7 % es ácido. */
    const molPorLitro = (1000 * 1.045 * 0.07) / M.H2SO4;
    cuadra(id, 'La molaridad de la dilución al 7 %', molPorLitro);
  });

  it('y 0,767 molal', () => {
    /* Molalidad es por kilo de DISOLVENTE, no de disolución: de cada 100 g,
       7 son ácido y 93 son agua. */
    const molPorKgAgua = 7 / M.H2SO4 / 0.093;
    cuadra(id, 'Y su molalidad', molPorKgAgua);
  });
});
