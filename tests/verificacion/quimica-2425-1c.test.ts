/**
 * Final del primer cuatrimestre de Fundamentos Químicos, curso 2024-2025.
 *
 * Trece respuestas numéricas y la cadena más larga del corpus de Química: el
 * ejercicio 1 encadena siete apartados donde cada resultado entra en el
 * siguiente, así que un error en el primero se arrastra hasta el último. Es
 * exactamente el ejercicio que más falta hacía verificar.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';

const cuadra = convocatoria('fundamentos-quimicos', '2024-2025-1c');

/* Masas atómicas del enunciado. */
const u = { H: 1.01, N: 14.01, O: 16.0, S: 32.06, Fe: 55.85 };
const M = {
  FeS2: u.Fe + 2 * u.S,
  SO2: u.S + 2 * u.O,
  SO3: u.S + 3 * u.O,
  N2: 2 * u.N,
  H2SO4: 2 * u.H + u.S + 4 * u.O,
};
/* Volumen molar a 0 °C y 1 atm, que es donde el enunciado mide los gases. */
const VM = 0.0820574 * 273.15; // L/mol

describe('1 · el ácido sulfúrico en tres etapas', () => {
  const id = 'exfq2425-1c-1-el-acido-sulfurico-en-tres-etapas';

  /* Datos del enunciado: 5 t de pirita al 90 % de FeS₂, y de la tostación
     salen 1550 m³ de SO₂ medidos a 0 °C y 1 atm. */
  const molFeS2 = (5e6 * 0.9) / M.FeS2;
  const molSO2 = 1550e3 / VM;

  it('la tostación rinde un 92,2 %', () => {
    /* 4 FeS₂ + 11 O₂ → 2 Fe₂O₃ + 8 SO₂: dos SO₂ por cada pirita. */
    const teorico = molFeS2 * 2;
    cuadra(id, 'El rendimiento de la tostación', (molSO2 / teorico) * 100);
  });

  it('las dos primeras etapas gastan 129.662 mol de O₂', () => {
    /* Etapa 1: once O₂ por cada ocho SO₂ **realmente producidos**, no por los
       teóricos — el oxígeno que no reaccionó no se gastó.
       Etapa 2: 2 SO₂ + O₂ → 2 SO₃, o sea medio O₂ por SO₂. */
    const etapa1 = molSO2 * (11 / 8);
    const etapa2 = molSO2 / 2;
    cuadra(id, 'El oxígeno de las dos primeras etapas', etapa1 + etapa2);
  });

  it('salen 3.502 L de sulfúrico líquido', () => {
    /* La etapa 2 va al 100 %, así que hay tanto SO₃ como SO₂ hubo. La
       hidratación va al 95 %, y el líquido tiene densidad 1840 kg/m³. */
    const molAcido = molSO2 * 0.95;
    const kg = (molAcido * M.H2SO4) / 1000;
    cuadra(id, 'El volumen de ácido que sale', (kg / 1840) * 1000);
  });

  it('con aire hacen falta 3.690 m³', () => {
    /* Medio volumen de O₂ por volumen de SO₂ —los gases van en proporción de
       moles—, y el aire es 21 % O₂ en volumen. */
    cuadra(id, 'El aire, y lo que arrastra consigo', 1550 / 2 / 0.21);
  });

  it('el 60,3 % en masa de lo que sale del reactor es SO₃', () => {
    /* Lo que sale son los SO₃ formados y el nitrógeno que venía en el aire y
       no reacciona. El oxígeno entra justo, así que no sobra. */
    const molSO3 = molSO2;
    const m3Aire = 1550 / 2 / 0.21;
    const molN2 = (m3Aire * 0.79 * 1000) / VM;
    const masaSO3 = molSO3 * M.SO3;
    const masaN2 = molN2 * M.N2;
    cuadra(id, 'La composición másica de lo que sale del reactor', (masaSO3 / (masaSO3 + masaN2)) * 100);
  });

  /* El ácido del laboratorio: disolución al 98 % en masa, densidad
     1,836 g/mL. */
  const molParaLaDisolucion = 0.05 * 0.5;
  const mLConcentrado = (molParaLaDisolucion * M.H2SO4) / 0.98 / 1.836;

  it('hacen falta 1,36 mL de ácido concentrado', () =>
    cuadra(id, 'El ácido del laboratorio', mLConcentrado));

  it('la dilución final es 0,203 molal', () => {
    /* Molalidad es por kilo de DISOLVENTE. El agua de la disolución final es
       la que había en los 50 mL de 0,5 M —todo menos el ácido concentrado que
       se echó— más la que se añade para llegar a 125 mL, más el 2 % de agua
       que trae el propio ácido concentrado. Volúmenes aditivos y densidad del
       agua 0,997 g/mL, los dos del enunciado. */
    const mLFinal = molParaLaDisolucion / 0.2 / 1e-3;
    const aguaEnLosCincuenta = 50 - mLConcentrado;
    const aguaAnadida = mLFinal - 50;
    const gAgua =
      (aguaEnLosCincuenta + aguaAnadida) * 0.997 + mLConcentrado * 1.836 * 0.02;
    cuadra(id, 'La dilución, y su molalidad', molParaLaDisolucion / (gAgua / 1000));
  });
});

describe('2 · el cloruro de vinilo', () => {
  const id = 'exfq2425-1c-2-el-cloruro-de-vinilo-de-lewis-a-las-fuerzas';

  it('hay 18 electrones de valencia', () => {
    /* CH₂CHCl: dos carbonos a 4, tres hidrógenos a 1 y un cloro a 7. */
    cuadra(id, 'Los electrones de valencia', 2 * 4 + 3 * 1 + 7);
  });

  it('los ángulos alrededor de cada carbono son de 120°', () => {
    /* Número estérico 3 → geometría electrónica trigonal plana, y tres
       direcciones repartidas en un plano son 360/3. */
    cuadra(id, 'El ángulo de enlace', 360 / 3);
  });
});

describe('3 · tres elementos y la tabla descolocada', () => {
  const id = 'exfq2425-1c-3-tres-elementos-y-la-tabla-descolocada';
  const pantalla = (mismoGrupo: number, anterior: number, adentro: number) =>
    0.35 * mismoGrupo + 0.85 * anterior + 1.0 * adentro;

  it('el 4s del calcio (Z = 20) siente 2,85', () => {
    /* [Ar] 4s². Un compañero de grupo, ocho en la capa 3 —el 3d está vacío—
       y diez más adentro. */
    cuadra(id, 'La carga efectiva del elemento de Z = 20', 20 - pantalla(1, 8, 10));
  });

  it('el 4p del arsénico (Z = 33) siente 6,30', () => {
    /* [Ar] 3d¹⁰ 4s² 4p³. El grupo (4s4p) tiene cinco electrones, cuatro
       además del estudiado; la capa 3 tiene dieciocho contando los 3d. */
    cuadra(id, 'La carga efectiva del elemento de Z = 33', 33 - pantalla(4, 18, 10));
  });
});

describe('5 · cuatro sólidos por lo que hacen', () => {
  it('la diferencia de electronegatividad del CaF₂ es 2,98', () => {
    /* Los valores son los de la tabla del enunciado: F = 3,98 y Ca = 1,00.
       Es la mayor de todos los pares de la lista, y por eso el CaF₂ es el
       iónico que más alto funde. */
    const en = { F: 3.98, Ca: 1.0 };
    cuadra(
      'exfq2425-1c-5-cuatro-solidos-por-lo-que-hacen',
      'La diferencia de electronegatividad del CaF₂',
      en.F - en.Ca,
    );
  });
});

describe('4 · el bañador y la presión de vapor', () => {
  it('cada NaCl da dos partículas en disolución', () => {
    /* Un Na⁺ y un Cl⁻: la fórmula dice cuántos iones se sueltan, y de ahí
       sale el factor que baja la presión de vapor. */
    const iones = ['Na+', 'Cl-'];
    cuadra('exfq2425-1c-4-el-banador-y-la-presion-de-vapor', 'Las partículas en disolución', iones.length);
  });
});
