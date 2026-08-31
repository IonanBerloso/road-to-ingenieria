import { describe, expect, it } from 'vitest';
import { comparaMagnitud, leeMagnitud, nombreDim, traeUnidad } from '../src/lib/unidades';

/**
 * Los casos salen de cómo se escribe de verdad en Mecánica de Fluidos: la
 * presión en bar o en metros de columna de agua según por dónde entres al
 * problema, el caudal en litros por segundo, la viscosidad en poises porque
 * el enunciado viejo la da así.
 *
 * La regla de fondo es la de `complejo.test.ts` y `algebra.test.ts`: el alumno
 * escribe a mano y con prisa, y decirle que se ha equivocado cuando no se ha
 * equivocado es peor que no corregir nada. Con una diferencia propia de esta
 * asignatura: **la unidad es parte de la respuesta**, así que faltar la unidad
 * sí es un error — pero uno distinto de equivocarse en el número, y hay que
 * poder distinguirlos.
 */

const lee = (t: string) => {
  const m = leeMagnitud(t);
  expect(m, t).not.toBeNull();
  return m!;
};

describe('leeMagnitud · las formas en que se escribe una magnitud a mano', () => {
  it('lee número y unidad separados o pegados', () => {
    expect(lee('5 m').valor).toBe(5);
    expect(lee('5m').valor).toBe(5);
    expect(lee('  5   m  ').valor).toBe(5);
  });

  it('admite coma decimal, que es lo que escribe todo el mundo aquí', () => {
    expect(lee('2,5 bar').valor).toBeCloseTo(250000, 6);
    expect(lee('2.5 bar').valor).toBeCloseTo(250000, 6);
  });

  it('admite notación científica y signo', () => {
    expect(lee('1.2e-3 m^2/s').valor).toBeCloseTo(0.0012, 12);
    expect(lee('-3 kpa').valor).toBeCloseTo(-3000, 9);
  });

  it('lee los exponentes como se teclean y como se copian del PDF', () => {
    for (const t of ['1000 kg/m^3', '1000 kg/m3', '1000 kg/m³']) {
      expect(lee(t).valor, t).toBeCloseTo(1000, 9);
    }
  });

  it('lee productos con punto, asterisco o espacio', () => {
    for (const t of ['1 n*s/m^2', '1 n·s/m^2', '1 n s/m^2']) {
      expect(lee(t).valor, t).toBeCloseTo(1, 9);
    }
  });

  /* Los valores de referencia son los que publica el tema 4 de la asignatura,
     calculados con g = 9,8. Ver la nota de `G` en `unidades.ts`. */
  it('convierte a SI las unidades de presión que usa la asignatura', () => {
    expect(lee('1 bar').valor).toBeCloseTo(1e5, 6);
    expect(lee('1 atm').valor).toBeCloseTo(101325, 6);
    expect(lee('1 mca').valor).toBeCloseTo(9800, 1); // apuntes del tema 4
    /* Los apuntes redondean el torr a 133,3 Pa; con ρ(Hg) = 13595,1 y g = 9,8
       sale 133,23. La diferencia es del 0,05 % y la tolerancia se la come. */
    expect(lee('1 torr').valor).toBeCloseTo(133.23, 1);
    expect(lee('1 kg/cm2').valor / lee('1 mca').valor).toBeCloseTo(10, 3); // apuntes
    expect(lee('1 bar').valor / lee('1 mca').valor).toBeCloseTo(10.2, 2); // apuntes
  });

  it('convierte caudales, velocidades y viscosidades', () => {
    expect(lee('50 l/s').valor).toBeCloseTo(0.05, 12);
    expect(lee('36 km/h').valor).toBeCloseTo(10, 9);
    expect(lee('1 poise').valor).toBeCloseTo(0.1, 12);
    expect(lee('1 cst').valor).toBeCloseTo(1e-6, 15);
  });

  /* Estas cuatro faltaban en la primera versión de la tabla y las cazó el
     tema 2 al escribirlo: seis respuestas correctas salían «no he entendido».
     El poiseuille es LA unidad de viscosidad de los apuntes, y el daN lo pide
     un enunciado literalmente. */
  it('lee las unidades que usan los enunciados de esta escuela', () => {
    expect(lee('0,004 pl').valor).toBeCloseTo(0.004, 12); // poiseuille = Pa·s
    expect(lee('1 pl').valor).toBeCloseTo(lee('10 p').valor, 12); // 1 Pl = 10 P
    expect(lee('0,0218 dan').valor).toBeCloseTo(0.218, 9); // decanewton
    expect(lee('1e7 dyn').valor).toBeCloseTo(100, 9); // dina
    expect(lee("1 utm").valor).toBeCloseTo(9.8, 5); // masa del Sistema Técnico
  });

  /* El «kg» del Sistema Técnico otra vez, ahora dentro de un cociente. Los
     enunciados de esta escuela dan presiones en kg/cm² constantemente: si se
     leyera como masa partido por área, el comparador diría «esa unidad es de
     otra magnitud» a una respuesta correcta. */
  it('lee kg/cm² como la presión que es, no como masa por unidad de área', () => {
    // los apuntes del tema 4: 1 kg/cm² = 9,8·10⁴ Pa
    expect(lee('1 kg/cm^2').valor).toBeCloseTo(98000, 1);
    expect(lee('1 kg/cm2').valor).toBeCloseTo(98000, 1);
    expect(lee('1 kg/cm²').valor).toBeCloseTo(98000, 1);
    expect(nombreDim(lee('0,4 kg/cm2').dim)).toBe('una presión');
    // y sigue siendo comparable con las demás presiones
    expect(comparaMagnitud(lee('1 kg/cm2'), lee('0,98 bar'), 0.01).igual).toBe(true);
  });

  it('lee un número pelado, y deja constancia de que no traía unidad', () => {
    const m = lee('101325');
    expect(m.unidad).toBeNull();
    expect(m.valor).toBe(101325);
  });

  it('lee el porcentaje como fracción', () => {
    expect(lee('75%').valor).toBeCloseTo(0.75, 12);
  });

  it('devuelve null cuando no entiende, en vez de inventarse una lectura', () => {
    for (const t of ['', 'un rato', 'm', '5 gaznápiros', '5 m^']) {
      expect(leeMagnitud(t), t).toBeNull();
    }
  });
});

describe('comparaMagnitud · lo que el alumno acierta aunque lo escriba de otra forma', () => {
  it('da por buena la misma presión en otra unidad', () => {
    const escrito = lee('1 bar');
    const esperado = lee('100 kpa');
    expect(comparaMagnitud(escrito, esperado, 0.001).igual).toBe(true);
  });

  it('da por bueno un caudal en l/s frente a uno en m^3/s', () => {
    expect(comparaMagnitud(lee('50 l/s'), lee('0,05 m^3/s'), 0.001).igual).toBe(true);
  });

  it('la tolerancia es relativa: el 2 % de una lectura de Moody', () => {
    // f = 0,0225 leído del ábaco frente a 0,0228 calculado con Colebrook
    expect(comparaMagnitud(lee('0,0225'), lee('0,0228'), 0.02).igual).toBe(true);
    expect(comparaMagnitud(lee('0,0225'), lee('0,0228'), 0.001).igual).toBe(false);
  });

  it('con el esperado a cero la tolerancia vale como absoluta', () => {
    expect(comparaMagnitud(lee('0,0005 m'), lee('0 m'), 0.001).igual).toBe(true);
  });
});

describe('comparaMagnitud · los tres errores, que no son el mismo error', () => {
  it('distingue «falta la unidad» de «el número está mal»', () => {
    const v = comparaMagnitud(lee('1,5'), lee('1,5 bar'), 0.02);
    expect(v.igual).toBe(false);
    expect(v.faltaUnidad).toBe(true);
    expect(v.otraDimension).toBe(false);

    const w = comparaMagnitud(lee('3'), lee('1,5 bar'), 0.02);
    expect(w.faltaUnidad).toBe(false);
    expect(w.igual).toBe(false);
  });

  /* Y el número pelado se compara contra la unidad EN QUE SE ESCRIBIÓ la
     respuesta: quien contesta «1,5» a «1,5 bar» ha hecho la física bien; el
     que contesta «150000» también, si el ejercicio lo pedía en pascales. */
  it('acepta el número pelado tanto en la unidad del enunciado como en SI', () => {
    expect(comparaMagnitud(lee('1,5'), lee('1,5 bar'), 0.02).faltaUnidad).toBe(true);
    expect(comparaMagnitud(lee('150000'), lee('1,5 bar'), 0.02).faltaUnidad).toBe(true);
  });

  it('caza el error conceptual: unidad de otra magnitud', () => {
    const v = comparaMagnitud(lee('2 m/s'), lee('2 m^3/s'), 0.02);
    expect(v.igual).toBe(false);
    expect(v.otraDimension).toBe(true);
  });

  it('cuando el ejercicio pide un adimensional, el número pelado es la respuesta', () => {
    const v = comparaMagnitud(lee('120000'), lee('120000'), 0.02);
    expect(v.igual).toBe(true);
    expect(v.faltaUnidad).toBe(false);
  });
});

describe('nombreDim · para que el diagnóstico hable en cristiano', () => {
  it('pone nombre a las dimensiones de la asignatura', () => {
    expect(nombreDim(lee('3 m^3/s').dim)).toBe('un caudal');
    expect(nombreDim(lee('3 m/s').dim)).toBe('una velocidad');
    expect(nombreDim(lee('3 pa').dim)).toBe('una presión');
    expect(nombreDim(lee('3 kg/m^3').dim)).toBe('una densidad');
    expect(nombreDim(lee('3 n').dim)).toBe('una fuerza');
    expect(nombreDim(lee('3 kw').dim)).toBe('una potencia');
  });
});

describe('traeUnidad · lo que el esquema usa para exigirla donde toca', () => {
  it('distingue el número pelado de la magnitud', () => {
    expect(traeUnidad('101325 pa')).toBe(true);
    expect(traeUnidad('101325')).toBe(false);
    expect(traeUnidad('no es un número')).toBe(false);
  });
});
