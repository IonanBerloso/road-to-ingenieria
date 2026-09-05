/**
 * Control del primer cuatrimestre de Fundamentos Químicos, curso 2024-2025.
 *
 * Tampoco publica solución. Seis respuestas numéricas, y tres de ellas son
 * recuentos —cuántas ionizaciones, cuántos electrones de valencia, cuántos
 * enlaces sigma— que también se recalculan aquí: un recuento mal hecho es tan
 * falso como una cuenta mal hecha, y se equivoca con más facilidad porque no
 * parece un cálculo.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';

const cuadra = convocatoria('fundamentos-quimicos', '2024-2025-1c-control');

describe('1 · cinco elementos del periodo cinco — Slater', () => {
  const id = 'exfq2425-1c-control-1-cinco-elementos-del-periodo-cinco';
  /* Misma escritura de las reglas que en el control del curso anterior, y a
     propósito: si las dos convocatorias comparten un error de interpretación,
     compartir también el código lo dejaría invisible. Aquí está escrito otra
     vez, desde el reparto en capas. */
  const pantalla = (mismoGrupo: number, anterior: number, adentro: number) =>
    0.35 * mismoGrupo + 0.85 * anterior + 1.0 * adentro;

  it('el 5s del rubidio (Z = 37) siente 2,20', () => {
    /* 1s² 2s²2p⁶ 3s²3p⁶3d¹⁰ 4s²4p⁶ 5s¹. El grupo (5s5p) solo lo ocupa él;
       la capa n−1 son los ocho de 4s4p, porque el 4d está vacío; y quedan
       veintiocho más adentro. */
    cuadra(id, 'La carga efectiva del elemento A', 37 - pantalla(0, 8, 28));
  });

  it('el 5s del itrio (Z = 39) siente 3,00', () => {
    /* …4s²4p⁶ 4d¹ 5s². Ahora el electrón estudiado tiene un compañero de
       grupo, y la capa n−1 tiene nueve electrones porque el 4d¹ está ahí. */
    cuadra(id, 'La carga efectiva del elemento B', 39 - pantalla(1, 9, 28));
  });
});

describe('2 · el Born-Haber del yoduro de bario', () => {
  it('el bario aporta dos ionizaciones', () => {
    /* La fórmula BaI₂ pide Ba²⁺, y cada carga positiva del catión es una
       energía de ionización. */
    const cargaDelCation = 2;
    cuadra(
      'exfq2425-1c-control-2-el-born-haber-del-yoduro-de-bario',
      'Cuántas ionizaciones hacen falta',
      cargaDelCation,
    );
  });
});

describe('3 · cinco temperaturas de fusión', () => {
  it('la diferencia de electronegatividad del MgO es 2,13', () => {
    /* Los valores son los que imprime el enunciado, no los de ninguna tabla
       nuestra: O = 3,44 y Mg = 1,31. */
    const en = { O: 3.44, Mg: 1.31 };
    cuadra(
      'exfq2425-1c-control-3-cinco-temperaturas-de-fusion',
      'La diferencia que hace iónico al óxido de magnesio',
      en.O - en.Mg,
    );
  });
});

describe('4 · el acetilcianuro', () => {
  const id = 'exfq2425-1c-control-4-el-acetilcianuro-y-tres-hibridaciones';

  it('hay 26 electrones de valencia que repartir', () => {
    /* CH₃COCN, contando por átomo: tres carbonos a 4, tres hidrógenos a 1,
       un oxígeno a 6 y un nitrógeno a 5. */
    const valencia = { C: 4, H: 1, O: 6, N: 5 };
    const total = 3 * valencia.C + 3 * valencia.H + valencia.O + valencia.N;
    cuadra(id, 'Los electrones de valencia', total);
  });

  it('la molécula tiene siete enlaces sigma', () => {
    /* La estructura es H₃C–C(=O)–C≡N. Cada par de átomos unidos aporta
       exactamente un sigma, sea el enlace simple, doble o triple; los pi son
       los enlaces múltiples que sobran. */
    const parejasUnidas = [
      'C1-H', 'C1-H', 'C1-H',   // el metilo
      'C1-C2',                   // metilo con carbonilo
      'C2-O',                    // el carbonilo
      'C2-C3',                   // carbonilo con nitrilo
      'C3-N',                    // el nitrilo
    ];
    cuadra(id, 'Los enlaces sigma', parejasUnidas.length);
  });
});
