/**
 * El primer parcial de Mecánica de Fluidos de 2019-2020. Trece respuestas, y
 * las primeras de la asignatura que entran aquí.
 *
 * FLUIDOS NO ES COMO LAS OTRAS TRES, y conviene decirlo antes de nada: sus
 * exámenes **publican el resultado**. Así que estas resoluciones ya tenían un
 * número impreso contra el que caer, y lo que este fichero comprueba no es
 * «¿es correcto el resultado?» sino **«¿el camino escrito llega hasta él?»**.
 * Un desarrollo puede aterrizar en la cifra buena con un paso intermedio mal y
 * otro compensándolo, y eso es justo lo que un recálculo desde el enunciado
 * destapa.
 *
 * Dos cosas nuevas de esta asignatura:
 *
 * - Casi todas las respuestas llevan **unidad**, así que se comparan con
 *   `cuadra.magnitud`, que llama a los mismos `leeMagnitud` y
 *   `comparaMagnitud` que corrigen al alumno. La tolerancia es relativa, no
 *   absoluta.
 * - La gravedad es **9,8 y no 9,80665**. Es la que usan los apuntes y todas
 *   las soluciones oficiales, y con ella salen sus conversiones publicadas
 *   (1 mca = 9800 Pa, 1 kg/cm² = 10 mca). Está razonado en §17.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { raiz } from './numerico';

const cuadra = convocatoria('fluidos', '2019-2020-1par');

const G = 9.8;
const GAMMA = 1000 * G; // N/m³ del agua
const area = (d: number) => (Math.PI * d * d) / 4;

describe('1 · el aire que se calienta a medio llenar', () => {
  const id = 'exflu1920-1par-1-el-aire-que-se-calienta-a-medio-llenar';
  const [m0, p0, T0] = [5.6, 9.6e5, 25 + 273];
  const R = 287;
  const V = (m0 * R * T0) / p0;

  it('el recipiente tiene 0,499 m³', () => cuadra(id, 'El volumen del recipiente', V));

  it('y el manómetro final marca 4,279 kg/cm²', () => {
    /* **La trampa del enunciado**, y por eso el test la escribe explícita: el
       doble de la temperatura se aplica al dato **tal como viene**, que son
       grados centígrados. 2·25 ºC son 50 ºC, no 596 K.
       Se comprueba además que la otra lectura da la coincidencia sospechosa
       que la hace tentadora: con 2·T₀ en kelvin la presión final sale
       exactamente igual a la inicial, porque media masa al doble de
       temperatura absoluta ocupa la misma presión. */
    const p1 = ((m0 / 2) * R * (2 * 25 + 273)) / V;
    const siFueraEnKelvin = ((m0 / 2) * R * (2 * T0)) / V;
    if (Math.abs(siFueraEnKelvin - p0) > 1) throw new Error('la lectura en kelvin no da la coincidencia esperada');
    /* La atmosférica del enunciado son 10,3 m.c.a., y el resultado se pide en
       kg/cm², que a 9,8 son 10 metros de columna de agua. */
    const manometrica = p1 - 10.3 * GAMMA;
    cuadra(id, 'La presión manométrica final', manometrica / (10 * GAMMA));
  });

  it('y el módulo de elasticidad son 1,38 MPa', () => {
    /* Un 15 % es demasiado para la fórmula lineal: se integra K = −V dp/dV,
       que da Δp = K·ln(V₁/V₂). Se comprueba de paso que la lineal daría 1,5,
       que es el error que el ejercicio busca. */
    const K = 225e3 / Math.log(1 / 0.85);
    if (Math.abs(225e3 / 0.15 / 1e6 - 1.5) > 1e-9) throw new Error('la lineal no da 1,5');
    cuadra(id, 'El módulo de elasticidad volumétrico', K / 1e6);
  });
});

describe('2 · el laboratorio submarino', () => {
  const id = 'exflu1920-1par-2-el-laboratorio-submarino';
  const [Z, R, H, h] = [39.5, 5.8, 4.1, 2.9];
  const gamma = 1025 * G;
  const patm = 101325;
  /* La columna de acceso llega hasta el fondo, a profundidad Z, y dentro sube
     h metros de agua. Encima de esa columna está el aire del laboratorio. */
  const pLab = patm + gamma * (Z - h);

  it('el aire del laboratorio está a 468.972 Pa', () =>
    cuadra.magnitud(id, 'La presión del aire del laboratorio', pLab, 'Pa'));

  it('y el Bourdon de la coronación marca 0,29725 kg/cm²', () => {
    /* El manómetro está en la coronación, a R por encima del fondo, y mide
       **contra el mar de ahí fuera**, no contra la atmósfera: por eso la
       lectura es tan pequeña comparada con la presión absoluta. */
    const pMarEnLaCoronacion = patm + gamma * (Z - R);
    cuadra(id, 'La lectura del manómetro A', (pLab - pMarEnLaCoronacion) / (10 * GAMMA));
  });

  it('y puede bajar hasta 40,7 m', () => {
    /* El límite es que el agua no rebose por el borde superior de la columna,
       o sea h = H. Se busca la profundidad que lo cumple manteniendo la
       presión del aire. */
    cuadra.magnitud(id, 'La profundidad máxima', raiz((z) => patm + gamma * (z - H) - pLab, 10, 200), 'm');
  });
});

describe('3 · la boquilla alimentada por dos depósitos', () => {
  const id = 'exflu1920-1par-3-la-boquilla-alimentada-por-dos-depositos';
  /* Depósito A en la cota 70 con la bomba a su salida, depósito C cerrado en
     la 105, boquilla B en la 75 con d = 25 mm. Las k de la tabla son
     coeficientes sobre v²/2g. */
  const dB = 0.025;
  const tuberia = { 1: { D: 0.08, k: 190 }, 2: { D: 0.08, k: 125 }, 3: { D: 0.07, k: 40 } } as const;
  const perdida = (n: 1 | 2 | 3, Q: number) =>
    tuberia[n].k * (Q / area(tuberia[n].D)) ** 2 / (2 * G);
  const cinetica = (v: number) => (v * v) / (2 * G);

  /* Apartado a): el chorro sube 7 m, así que sale a √(2gh). */
  const vB0 = Math.sqrt(2 * G * 7);
  const Q0 = vB0 * area(dB);
  const Hm0 = 75 - 70 + cinetica(vB0) + perdida(1, Q0) + perdida(2, Q0);

  it('la bomba aporta 33,03 m', () => {
    /* El chorro sube exactamente su altura cinética: se comprueba, porque es
       la lectura que convierte los 7 m del enunciado en una velocidad. */
    if (Math.abs(cinetica(vB0) - 7) > 1e-9) throw new Error('la altura del chorro no es la cinética');
    cuadra.magnitud(id, 'La altura manométrica inicial', Hm0, 'm');
  });

  it('y el chorro se lleva 394,43 W', () =>
    cuadra.magnitud(id, 'La potencia del chorro', GAMMA * Q0 * cinetica(vB0), 'W'));

  it('con la válvula abierta la bomba mueve 3,37 l/s', () => {
    /* Ahora entran los dos depósitos y la potencia útil de la bomba se
       mantiene. Eso deja una sola incógnita —el caudal por la rama de la
       bomba— y una ecuación de energía de A a B que se resuelve buscando la
       raíz, sin iterar a mano. */
    const potenciaUtil = GAMMA * Q0 * Hm0;
    const QB = 20.5 * area(dB);
    const desajuste = (Q1: number) =>
      70 + potenciaUtil / (GAMMA * Q1) - (75 + cinetica(20.5) + perdida(1, Q1) + perdida(2, QB));
    cuadra.magnitud(id, 'El caudal que bombea la bomba', raiz(desajuste, 1e-4, QB) * 1000, 'l/s');
  });

  it('y el depósito C está a 2,32 kg/cm²', () => {
    /* Lo que no entra por la bomba entra por C. La rama 3 lleva la diferencia,
       y su ecuación de energía da la presión que hay que tener arriba. */
    const potenciaUtil = GAMMA * Q0 * Hm0;
    const QB = 20.5 * area(dB);
    const Q1 = raiz(
      (q) => 70 + potenciaUtil / (GAMMA * q) - (75 + cinetica(20.5) + perdida(1, q) + perdida(2, QB)),
      1e-4,
      QB,
    );
    const Q3 = QB - Q1;
    const alturaEnC = 75 + cinetica(20.5) + perdida(3, Q3) + perdida(2, QB) - 105;
    cuadra(id, 'La presión del depósito C', alturaEnC / 10);
  });
});

describe('4 · el tubo de helio que tiende a abrirse', () => {
  const id = 'exflu1920-1par-4-el-tubo-de-helio-que-tiende-a-abrirse';
  const [R, L, pHe] = [2.5, 1.75, 10e5];
  const gamma = 1.75 * GAMMA;
  /* El dato h llega al punto más alto, así que el eje está h + R más abajo. */
  const enElEje = (h: number) => gamma * (h + R);

  it('la horizontal a 55 m son 121,41 kN', () => {
    /* Diferencia de presiones en el eje por la proyección vertical de media
       caña. Sale positiva hacia fuera, y eso es lo que hace que el apartado
       (c) se conteste que no: el contacto en B solo transmite compresión. */
    const F = (pHe - enElEje(55)) * 2 * R * L;
    if (!(F > 0)) throw new Error('a 55 m la resultante debería empujar hacia fuera');
    cuadra.magnitud(id, 'La fuerza horizontal sobre media caña', F / 1000, 'kN');
  });

  it('y la vertical, 294,65 kN', () => {
    /* Una presión uniforme no tiene resultante vertical sobre media caña: las
       proyecciones de arriba y de abajo se cancelan. Se comprueba integrando
       el arco, en vez de darlo por sabido. */
    let vertical = 0;
    const n = 20000;
    for (let k = 0; k < n; k++) {
      const th = -Math.PI / 2 + (Math.PI * (k + 0.5)) / n;
      vertical += pHe * Math.sin(th) * R * (Math.PI / n) * L;
    }
    if (Math.abs(vertical) > 1e-6) throw new Error('el helio sí tendría resultante vertical');
    cuadra.magnitud(id, 'La fuerza vertical sobre media caña', (gamma * ((Math.PI * R * R) / 2) * L) / 1000, 'kN');
  });

  it('y a 200 m la junta aguanta 10.819 kN', () => {
    /* Ahora el mar gana y la resultante aprieta hacia dentro; el contacto en B
       y la articulación en A se reparten la mitad cada uno. */
    const F = (enElEje(200) - pHe) * 2 * R * L;
    if (!(F > 0)) throw new Error('a 200 m la resultante debería apretar hacia dentro');
    cuadra.magnitud(id, 'La fuerza sobre la junta a doscientos metros', F / 2 / 1000, 'kN');
  });
});

describe('5 · el vaciado con cambio de sección', () => {
  const id = 'exflu1920-1par-5-el-vaciado-con-cambio-de-seccion';
  const Ao = area(0.026);
  const CD = 0.71;
  /* Sección cuadrada de lado 350 mm por encima de la cota 90 cm, y circular de
     150 mm por debajo. */
  const seccion = (h: number) => (h > 0.9 ? 0.35 * 0.35 : area(0.15));
  /**
   * **Integrando la ecuación de vaciado con Runge-Kutta**, no con su primitiva.
   * La resolución despeja 2(√h₁−√h₂) = C·t por tramos; aquí se avanza el nivel
   * paso a paso, y el cambio de sección lo lleva la propia función en vez de
   * partir la cuenta en dos.
   */
  const nivelTras = (t: number) => {
    let h = 1.2;
    const paso = 1e-3;
    const ritmo = (y: number) => (-CD * Ao * Math.sqrt(2 * G * Math.max(0, y))) / seccion(y);
    for (let s = 0; s < t; s += paso) {
      const dt = Math.min(paso, t - s);
      const k1 = ritmo(h);
      const k2 = ritmo(h + (dt * k1) / 2);
      const k3 = ritmo(h + (dt * k2) / 2);
      const k4 = ritmo(h + dt * k3);
      h += (dt * (k1 + 2 * k2 + 2 * k3 + k4)) / 6;
    }
    return h;
  };

  it('a los 6,5 s el nivel está en 110,5 cm', () => cuadra(id, 'La cota a los seis segundos y medio', nivelTras(6.5) * 100));

  it('tarda 21,5 s en llegar al cambio de sección', () =>
    cuadra.magnitud(id, 'Cuánto tarda en llegar al cambio de sección', raiz((t) => nivelTras(t) - 0.9, 1, 60), 's'));

  it('y a los 35 s queda en 9,82 cm', () => cuadra(id, 'La cota a los treinta y cinco segundos', nivelTras(35) * 100));
});
