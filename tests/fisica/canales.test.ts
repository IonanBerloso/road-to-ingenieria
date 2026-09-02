/**
 * El cuarto caso de `tests/fisica/`, y llega con el simulador de la sección
 * de canal.
 *
 * Los números salen de **la figura del propio tema 21** —las tres secciones de
 * 4 m² con sus perímetros publicados, 5,66 · 5,26 · 5,01— y de las dos
 * secciones óptimas que el tema deduce: el semicuadrado `b = 2h` y el
 * semihexágono de taludes a 60°. Si el módulo no las reprodujera, el simulador
 * estaría contradiciendo a la figura que tiene tres párrafos más arriba.
 */
import { describe, expect, it } from 'vitest';
import {
  area,
  calado,
  caudal,
  penalizacion,
  perimetro,
  radioHidraulico,
  relacionOptima,
  seccionPara,
  velocidad,
  type Seccion,
  anguloMojado,
  CALADO_DE_CAUDAL_MAXIMO,
  caudalLleno,
  caladoRelativo,
  relacionCaudal,
  relacionVelocidad,
  velocidadLleno,
} from '../../src/lib/canales';

const cerca = (v: number, esperado: number, rel = 0.005) =>
  expect(Math.abs(v - esperado) / Math.abs(esperado)).toBeLessThan(rel);

describe('las tres secciones de 4 m² de la figura del tema', () => {
  /* Se busca el calado que da 4 m² en cada tipología y se compara el
     perímetro con el publicado al pie de la figura. */
  it('el semicuadrado de 4 m² tiene 5,66 m de perímetro', () => {
    const h = Math.sqrt(2); // A = 2h² = 4
    const s: Seccion = { tipo: 'rectangulo', h, b: 2 * h };
    cerca(area(s), 4, 1e-9);
    cerca(perimetro(s), 5.66, 0.002);
  });

  it('el semihexágono de 4 m² tiene 5,26', () => {
    const h = Math.sqrt(4 / Math.sqrt(3)); // A = √3·h²
    const s: Seccion = { tipo: 'trapecio', h, b: relacionOptima('trapecio', 60) * h, alfa: 60 };
    cerca(area(s), 4, 1e-9);
    cerca(perimetro(s), 5.26, 0.002);
  });

  it('el semicírculo de 4 m² tiene 5,01, y gana', () => {
    const h = Math.sqrt(8 / Math.PI); // A = πh²/2
    const s: Seccion = { tipo: 'semicirculo', h, b: 0 };
    cerca(area(s), 4, 1e-9);
    cerca(perimetro(s), 5.01, 0.002);
    expect(perimetro(s)).toBeLessThan(5.26);
  });
});

describe('las dos secciones óptimas que el tema deduce', () => {
  it('el rectángulo óptimo es el semicuadrado, y su radio hidráulico es h/2', () => {
    expect(relacionOptima('rectangulo')).toBe(2);
    const s: Seccion = { tipo: 'rectangulo', h: 1.7, b: 3.4 };
    cerca(radioHidraulico(s), 1.7 / 2, 1e-9);
  });

  it('el trapecio óptimo a 60° es el semihexágono: solera igual que cada talud', () => {
    const alfa = 60;
    const h = 1.3;
    const s: Seccion = { tipo: 'trapecio', h, b: relacionOptima('trapecio', alfa) * h, alfa };
    const talud = h / Math.sin((alfa * Math.PI) / 180);
    cerca(s.b, talud, 1e-9);
  });

  it('con α = 90° el trapecio óptimo es el semicuadrado: la misma expresión', () => {
    cerca(relacionOptima('trapecio', 90), 2, 1e-12);
    const n = 0.014;
    const J = 0.001;
    const Q = 5;
    cerca(
      perimetro(seccionPara('trapecio', 2, n, J, Q, 90)),
      perimetro(seccionPara('rectangulo', 2, n, J, Q)),
      1e-9,
    );
  });

  /* La comprobación de verdad: que el mínimo esté donde el tema dice, buscado
     a fuerza bruta sobre el propio módulo y no repitiendo la fórmula. */
  it('barriendo b/h, el perímetro mínimo cae en la relación que dice la fórmula', () => {
    const n = 0.014;
    const J = 0.0015;
    const Q = 7;
    for (const [tipo, alfa] of [
      ['rectangulo', 90],
      ['trapecio', 60],
      ['trapecio', 45],
    ] as const) {
      let mejor = { r: 0, P: Infinity };
      for (let r = 0.2; r <= 6; r += 0.001) {
        const P = perimetro(seccionPara(tipo, r, n, J, Q, alfa));
        if (P < mejor.P) mejor = { r, P };
      }
      cerca(mejor.r, relacionOptima(tipo, alfa), 0.01);
    }
  });

  it('barriendo el ángulo del talud, el mejor trapecio es el de 60°', () => {
    const n = 0.014;
    const J = 0.001;
    const Q = 5;
    let mejor = { a: 0, P: Infinity };
    for (let a = 20; a <= 90; a += 0.1) {
      const P = perimetro(seccionPara('trapecio', relacionOptima('trapecio', a), n, J, Q, a));
      if (P < mejor.P) mejor = { a, P };
    }
    cerca(mejor.a, 60, 0.01);
  });
});

describe('Manning, en la dirección en que se usa', () => {
  it('el calado devuelto lleva exactamente el caudal pedido', () => {
    for (const [tipo, r] of [
      ['rectangulo', 2],
      ['trapecio', 1.155],
      ['semicirculo', 0],
    ] as const) {
      const h = calado(tipo, r, 0.013, 0.002, 12);
      cerca(caudal({ tipo, h, b: r * h, alfa: 60 }, 0.013, 0.002), 12, 1e-6);
    }
  });

  it('a más pendiente, menos calado hace falta', () => {
    const suave = calado('rectangulo', 2, 0.014, 0.0005, 5);
    const fuerte = calado('rectangulo', 2, 0.014, 0.005, 5);
    expect(fuerte).toBeLessThan(suave);
  });

  it('a más rugosidad, más calado y menos velocidad', () => {
    const liso = seccionPara('rectangulo', 2, 0.011, 0.001, 5);
    const rugoso = seccionPara('rectangulo', 2, 0.025, 0.001, 5);
    expect(rugoso.h).toBeGreaterThan(liso.h);
    expect(velocidad(rugoso, 0.025, 0.001)).toBeLessThan(velocidad(liso, 0.011, 0.001));
  });
});

/**
 * Y esto es lo que convierte el simulador en teoría y no en ilustración.
 *
 * El tema deduce la sección óptima y ahí lo deja, así que se lee como si
 * apartarse de ella fuera un error. Pero el ejercicio de proyecto —el tipo 2,
 * el que no tiene solución única— casi siempre llega **con un condicionante**:
 * una anchura máxima, un calado impuesto. La pregunta que nadie contesta es
 * cuánto cuesta obedecerlo.
 *
 * Medido, con un canal de 5 m³/s, n = 0,014 y J = 0,001, el perímetro de más
 * respecto del semicuadrado:
 *
 * | b/h | perímetro de más |
 * |---|---|
 * | 1 | +7,6 % |
 * | 1,5 | **+1,3 %** |
 * | 2 | óptimo |
 * | 3 | **+2,6 %** |
 * | 4 | +7,6 % |
 * | 6 | +19,7 % |
 * | 10 | +44,4 % |
 *
 * Es decir: **el óptimo es plano.** Entre b/h = 1,5 y b/h = 3 se paga menos de
 * un 3 %, así que un condicionante moderado sale casi gratis y no hay por qué
 * pelearlo. Lo que sí se paga es el canal ancho y somero: a b/h = 10, un 44 %.
 *
 * Y una precisión que evita una contradicción con la figura del tema: allí el
 * semicírculo gana **un 11 % de perímetro a igualdad de área**; aquí, medido a
 * igualdad de caudal, gana un 14 %. Las dos cifras son ciertas y comparan
 * cosas distintas.
 */
describe('cuánto cuesta de verdad no usar la sección óptima', () => {
  const n = 0.014;
  const J = 0.001;
  const Q = 5;

  it('la penalización es cero en el óptimo y positiva fuera', () => {
    cerca(penalizacion('rectangulo', 2, n, J, Q) + 1, 1, 1e-9);
    for (const r of [1, 1.5, 3, 4, 6, 10]) {
      expect(penalizacion('rectangulo', r, n, J, Q)).toBeGreaterThan(0);
    }
  });

  it('el óptimo es plano: de b/h = 1,5 a 3 se paga menos de un 3 %', () => {
    cerca(penalizacion('rectangulo', 1.5, n, J, Q), 0.013, 0.05);
    cerca(penalizacion('rectangulo', 3, n, J, Q), 0.0258, 0.05);
    for (let r = 1.5; r <= 3; r += 0.1) {
      expect(penalizacion('rectangulo', r, n, J, Q)).toBeLessThan(0.03);
    }
  });

  it('pero el canal ancho y somero sí se paga: a b/h = 10, un 44 %', () => {
    cerca(penalizacion('rectangulo', 10, n, J, Q), 0.4439, 0.02);
  });

  it('a igualdad de caudal el semicírculo gana un 14 % al semicuadrado', () => {
    const rect = perimetro(seccionPara('rectangulo', 2, n, J, Q));
    const circ = perimetro(seccionPara('semicirculo', 0, n, J, Q));
    cerca(1 - circ / rect, 0.14, 0.02);
  });

  it('a igualdad de área le gana un 11 %, que es lo que dice la figura', () => {
    const rect: Seccion = { tipo: 'rectangulo', h: Math.sqrt(2), b: 2 * Math.sqrt(2) };
    const circ: Seccion = { tipo: 'semicirculo', h: Math.sqrt(8 / Math.PI), b: 0 };
    cerca(area(rect), area(circ), 1e-9);
    cerca(1 - perimetro(circ) / perimetro(rect), 0.114, 0.02);
  });
});

/**
 * Sección circular parcialmente llena, que es el capítulo 8 entero.
 *
 * Los números salen de los problemas resueltos 8.3 y 8.4 de la colección, que
 * publican las lecturas del cuadro de la escuela, y de los resultados de 8.8 y
 * 8.12. La comprobación que importa es que **las fórmulas reproducen el cuadro
 * sin transcribirlo**: si las lecturas publicadas y estas funciones no
 * coincidieran, el cuadro sería otra cosa y habría que leerlo (§10).
 */
describe('la sección circular parcialmente llena', () => {
  it('8.3 · con h/D = 0,75 el cuadro da Q/Q_ll = 0,91, y la fórmula también', () => {
    cerca(relacionCaudal(0.75), 0.91, 0.005);
  });

  it('8.4 · con h/D = 0,68 el cuadro da Q/Q_ll = 0,806 y V/V_ll = 1,11', () => {
    cerca(relacionCaudal(0.68), 0.806, 0.005);
    cerca(relacionVelocidad(0.68), 1.11, 0.005);
  });

  it('8.4 · y de ahí salen el calado y la velocidad publicados', () => {
    /* D = 0,8 m, n = 0,020, J = 1/1200, Q = 200 l/s. */
    const Qll = caudalLleno(0.8, 0.02, 1 / 1200);
    cerca(Qll, 0.2481, 0.002);
    const y = caladoRelativo(0.2 / Qll);
    cerca(y * 0.8, 0.544, 0.01); //  h_c = 0,544 m
    cerca(relacionVelocidad(y) * velocidadLleno(0.8, 0.02, 1 / 1200), 0.55, 0.02);
  });

  it('8.3 · el diámetro que hace falta para 120 l/s con h/D ≤ 0,75', () => {
    /* Hormigón centrifugado, n = 0,015, J = 1 milésima. El de 50 cm no llega
       y el de 60 sí, que es lo que concluye el enunciado. */
    expect(caudalLleno(0.5, 0.015, 0.001)).toBeLessThan(0.1319);
    cerca(caudalLleno(0.6, 0.015, 0.001), 0.16827, 0.002);
    cerca(0.12 / caudalLleno(0.6, 0.015, 0.001), 0.713, 0.005);
  });

  it('8.8 · la acequia de PVC da los 3,094 m/s publicados', () => {
    /* D = 0,6 m, J = 16 milésimas, n = 0,009 para el PVC.
       Se obtuvo primero invirtiendo el resultado publicado, porque el cuadro
       de materiales que trae la colección no lo lista; después apareció en el
       `Cuadro nº 26` de `Cuadros_y_ábacos.pdf`, que sí lo da — y da 0,009. Lo
       mismo con la madera sin cepillar, 0,013. Las dos inversiones acertaron,
       pero **ahora el valor tiene fuente publicada y no hace falta deducirlo.** */
    const y = 0.303;
    cerca(relacionVelocidad(y) * velocidadLleno(0.6, 0.009, 0.016), 3.094, 0.005);
  });

  it('8.12 · el canal de madera da los 2,3 m/s publicados', () => {
    /* D = 0,8 m, J = 10 milésimas, n = 0,013 (madera sin cepillar). */
    const Qll = caudalLleno(0.8, 0.013, 0.01);
    const y = caladoRelativo(0.4 / Qll);
    cerca(y * 0.8, 0.3, 0.02); // h = 0,30 m
    cerca(relacionVelocidad(y) * velocidadLleno(0.8, 0.013, 0.01), 2.3, 0.01);
  });

  /* ── y lo que el cuadro enseña y la prosa del tema no dice ── */

  it('las razones NO dependen del diámetro, ni de n, ni de la pendiente', () => {
    /* Es la razón de que un solo cuadro sirva para todas las tuberías, y no
       está escrito en el tema. Aquí se comprueba directamente: tres tuberías
       que no se parecen en nada dan la misma razón a igual calado relativo. */
    const y = 0.6;
    const casos: [number, number, number][] = [
      [0.3, 0.012, 0.001],
      [1.6, 0.026, 0.02],
      [0.05, 0.009, 0.0005],
    ];
    const razones = casos.map(([D, n, J]) => {
      const Qll = caudalLleno(D, n, J);
      const t = anguloMojado(y);
      const A = ((D * D) / 8) * (t - Math.sin(t));
      const R = A / ((D * t) / 2);
      return ((1 / n) * A * R ** (2 / 3) * Math.sqrt(J)) / Qll;
    });
    for (const r of razones) expect(r).toBeCloseTo(relacionCaudal(y), 9);
  });

  it('una tubería casi llena lleva MÁS que llena: el máximo está en 0,938', () => {
    /* El resultado que no está en la prosa, y el que tiene consecuencia de
       diseño. Un colector calculado para ir exactamente lleno se apoya en un
       punto donde subir el calado baja el caudal. */
    const maximo = relacionCaudal(CALADO_DE_CAUDAL_MAXIMO);
    expect(maximo).toBeGreaterThan(1);
    cerca(maximo, 1.076, 0.005);
    expect(relacionCaudal(0.9)).toBeGreaterThan(1);
    expect(relacionCaudal(0.99)).toBeLessThan(maximo);
    /* y en 1 vuelve exactamente a 1, que es la definición */
    expect(relacionCaudal(1)).toBe(1);
  });

  it('y la velocidad máxima está antes, sobre 0,81, un 14 % por encima', () => {
    let mejor = 0;
    let dónde = 0;
    for (let y = 0.01; y < 1; y += 0.001) {
      const v = relacionVelocidad(y);
      if (v > mejor) [mejor, dónde] = [v, y];
    }
    cerca(dónde, 0.81, 0.02);
    cerca(mejor, 1.14, 0.01);
  });

  it('a media tubería lleva justo la mitad, y a la misma velocidad', () => {
    /* El único punto que se puede comprobar de cabeza: con y = 0,5 el área es
       la mitad y el radio hidráulico es el mismo, así que la velocidad no
       cambia y el caudal se parte por dos. Sirve de control de que las
       fórmulas no están del revés. */
    expect(relacionVelocidad(0.5)).toBeCloseTo(1, 9);
    expect(relacionCaudal(0.5)).toBeCloseTo(0.5, 9);
  });

  it('invertir el cuadro devuelve el calado de partida', () => {
    for (const y of [0.1, 0.303, 0.5, 0.68, 0.75, 0.9]) {
      cerca(caladoRelativo(relacionCaudal(y)), y, 1e-6);
    }
  });
});
