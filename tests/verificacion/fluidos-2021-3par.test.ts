/**
 * El tercer parcial de Mecánica de Fluidos de 2020-2021. Diez respuestas.
 *
 * El ejercicio 1 es un «rellenar los huecos» de teoría, y su paso numérico
 * —cuántos elementos tiene la turbina que toca— **no se puede recalcular**:
 * es un dato de la máquina, no una cuenta. Así que el test hace lo único
 * honesto que se puede hacer con él: lo contrasta contra **la prosa del propio
 * sitio**. Si el tema 23 y la resolución del examen dejaran de decir lo mismo,
 * el test se pondría rojo, y esa incoherencia es un fallo de verdad aunque no
 * sea aritmético.
 *
 * Y el ejercicio 5 tiene la geometría más bonita del corpus: un canal hecho
 * con cuatro losas **cuadradas** del mismo lado, dos verticales y dos
 * inclinadas cerrando una V. Que las losas sean cuadradas obliga a que la V
 * sea un triángulo **equilátero**, y de ahí sale todo lo demás. El test lo
 * comprueba en vez de darlo por leído.
 */
import { describe, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { convocatoria } from './corpus';
import { raiz } from './numerico';

const cuadra = convocatoria('fluidos', '2020-2021-3par');

const G = 9.8;
const area = (d: number) => (Math.PI * d * d) / 4;

/** Manning: caudal a partir del área, el perímetro mojado y la pendiente. */
const manning = (A: number, P: number, n: number, J: number) =>
  (1 / n) * A * (A / P) ** (2 / 3) * Math.sqrt(J);

describe('1 · las máquinas hidráulicas de corrido', () => {
  it('la Pelton tiene dos elementos, y el tema lo dice igual', () => {
    /* Esto no es una cuenta: es un dato de la máquina. Lo que sí se puede
       comprobar es que el examen y la teoría del sitio no se contradicen, así
       que el recuento sale de la tabla del tema 23. */
    const tema = readFileSync('src/content/fluidos/t23-turbinas/index.mdx', 'utf8');
    const fila = tema.split('\n').find((l) => /\*\*elementos\*\*/.test(l));
    if (!fila) throw new Error('el tema 23 ya no tiene la fila de elementos');
    const dePelton = fila.split('|')[2].trim();
    const cuantos = dePelton.split(/\s+y\s+/).length;
    if (!/inyector/.test(dePelton) || !/rodete/.test(dePelton))
      throw new Error(`la fila del tema dice «${dePelton}», y no son los de una Pelton`);
    cuadra('exflu2021-3par-1-las-maquinas-hidraulicas-de-corrido', 'Los elementos de la turbina más adecuada', cuantos);
  });
});

describe('2 · el factor de paso de la válvula', () => {
  const id = 'exflu2021-3par-2-el-factor-de-paso-de-la-valvula';
  const [D, s, sm, R, Crot] = [0.045, 0.8, 0.96, 0.28, 0.958];

  it('la válvula se lleva 5,6 cm', () => {
    /* Un manómetro diferencial mide la diferencia de alturas piezométricas, y
       como la válvula no cambia el diámetro esa diferencia **es** la pérdida:
       las dos cotas del enunciado se cancelan y por eso sobran. */
    cuadra(id, 'La pérdida en la válvula', R * (sm / s - 1));
  });

  it('y su factor de paso es 5', () => {
    /* El caudal que hay que usar es el **real**, no la lectura del rotámetro:
       ese 0,958 mueve la k casi medio punto. */
    const Q = (2800 * Crot) / 1000 / 3600;
    const v = Q / area(D);
    const conLaLectura = 2800 / 1000 / 3600 / area(D);
    if (Math.abs((R * (sm / s - 1)) / ((conLaLectura * conLaLectura) / (2 * G)) - 5) < 0.3)
      throw new Error('el coeficiente del rotámetro no estaría cambiando nada');
    cuadra(id, 'El factor de paso', (R * (sm / s - 1)) / ((v * v) / (2 * G)));
  });
});

describe('3 · la válvula de retención y el corte de luz', () => {
  const id = 'exflu2021-3par-3-la-valvula-de-retencion-y-el-corte-de-luz';
  const [D, e, L, Q, t] = [0.6, 0.005, 2000, 1.23, 5];
  const a = 9900 / Math.sqrt(48.3 + (0.5 * D) / e);
  const v = Q / area(D);

  it('la onda viaja a 951 m/s', () => {
    /* El término de la tubería, 60, pesa más que el del agua, 48,3: la pared
       se deforma y absorbe parte del golpe. Se comprueba, porque es lo que
       explica que la celeridad esté tan lejos de los 1.400 del agua libre. */
    if (!((0.5 * D) / e > 48.3)) throw new Error('la pared no domina, y debería');
    cuadra.magnitud(id, 'La celeridad de la onda', a, 'm/s');
  });

  it('y la sobrepresión son 355 mca', () => {
    /* Cinco segundos son más que el tiempo crítico, así que el cierre es lento
       y vale Michaud. Se comprueba la desigualdad antes. */
    if (!((2 * L) / a < t)) throw new Error('el cierre no sería lento y habría que usar Allievi');
    cuadra.magnitud(id, 'La sobrepresión', (2 * L * v) / (G * t), 'mca');
  });

  it('y la pared trabaja a 2.131 kg/cm², por debajo de los 2.600', () => {
    const sobrepresion = (2 * L * v) / (G * t);
    const tension = (sobrepresion * 1000 * G * D) / (2 * e);
    if (!(tension / 98000 < 2600)) throw new Error('la tubería no aguantaría');
    cuadra.magnitud(id, 'La tensión en la pared', tension / 98000, 'kg/cm2');
  });
});

describe('4 · la tubería que se ha corroído', () => {
  const id = 'exflu2021-3par-4-la-tuberia-que-se-ha-corroido';
  const [D, Lreal, Leq, kValv, salto, nu] = [0.25, 400, 408, 4, 22, 1.02e-6];
  const A = area(D);

  it('hoy la rugosidad es de 3,3 mm', () => {
    /* Con 120 l/s medidos se despeja el f que hace falta, y sale tan alto que
       el punto solo puede estar en **turbulencia completa** —donde f ya no
       depende del Reynolds—. Eso se comprueba: la parte de Colebrook que lleva
       el Reynolds tiene que ser despreciable frente a la de la rugosidad. */
    const v = 0.12 / A;
    const cinetica = (v * v) / (2 * G);
    const f = (salto - kValv * cinetica) / ((Leq / D) * cinetica);
    const eps = 3.7 * D * 10 ** (-1 / (2 * Math.sqrt(f)));
    const Re = (v * D) / nu;
    if (2.51 / (Re * Math.sqrt(f)) > 0.02 * (eps / (3.7 * D)))
      throw new Error('el Reynolds todavía influye: no es turbulencia completa');
    cuadra(id, 'La rugosidad actual', eps * 100);
  });

  it('con el tubo nuevo trasvasaría 176 l/s', () => {
    /* Ahora el punto baja a la zona de transición y hay que iterar Colebrook
       dentro del propio balance de energía. */
    const eps = 1.5e-4;
    const desajuste = (Q: number) => {
      const v = Q / A;
      let f = 0.02;
      for (let i = 0; i < 200; i++)
        f = 1 / (-2 * Math.log10(eps / (3.7 * D) + 2.51 / (((v * D) / nu) * Math.sqrt(f)))) ** 2;
      return ((f * Leq) / D + kValv) * ((v * v) / (2 * G)) - salto;
    };
    cuadra.magnitud(id, 'El caudal con el tubo nuevo', raiz(desajuste, 0.01, 1) * 1000, 'l/s');
  });

  it('y por debajo de 2.880 l/h no se sabe si es laminar', () => {
    /* La banda de duda va de Reynolds 2.000 a 4.000. El extremo alto es el que
       pregunta el paso. */
    const caudalDe = (Re: number) => ((Re * nu) / D) * A * 1000 * 3600;
    if (!(caudalDe(4000) > caudalDe(2000))) throw new Error('la banda sale del revés');
    cuadra.magnitud(id, 'El caudal máximo del que aún se duda', caudalDe(4000), 'l/h');
  });
});

describe('5 · la red de canales de losas cuadradas', () => {
  const id = 'exflu2021-3par-5-la-red-de-canales-de-losas-cuadradas';
  /* Cuatro losas cuadradas de lado L: dos verticales de altura L y dos
     inclinadas cerrando la V. Como la boca de la V mide L y cada losa mide L,
     el triángulo es equilátero. */
  const hondoV = (L: number) => (L * Math.sqrt(3)) / 2;
  const areaV = (L: number) => (Math.sqrt(3) * L * L) / 4;

  it('el triángulo del fondo es equilátero', () => {
    /* Se comprueba: los tres lados de la V —la boca y las dos losas— miden lo
       mismo, y por eso la profundidad es L√3/2 y no cualquier otra cosa. */
    const L = 1;
    const ladoInclinado = Math.hypot(L / 2, hondoV(L));
    if (Math.abs(ladoInclinado - L) > 1e-12) throw new Error('las losas inclinadas no medirían L');
  });

  it('las losas miden 95,3 cm', () => {
    /* Sección llena, hormigón en bruto y la pendiente de R0. */
    const J = (500 - 400) / 20000;
    const caudal = (L: number) => manning(L * L + areaV(L), 4 * L, 0.015, J);
    cuadra(id, 'El lado de la losa', raiz((L) => caudal(L) - 3, 0.2, 5) * 100);
  });

  it('y el calado de R1 es de 1,365 m', () => {
    /* Con la losa comercial de 1 m, dos tercios del caudal y la pendiente de
       R1, la lámina sube por encima de la V: al área del triángulo se le suma
       un rectángulo, y el perímetro mojado añade las dos paredes. */
    const L = 1;
    const J = (559 - 500) / 12000;
    const sobreLaV = raiz((y) => manning(areaV(L) + L * y, 2 * L + 2 * y, 0.015, J) - 2, 0.01, 3);
    cuadra(id, 'El calado del ramal R1', hondoV(L) + sobreLaV);
  });

  it('y R2 tiene que arrancar en la cota 629', () => {
    /* La restricción de R2 es geométrica: el agua no puede pasar de la V. Con
       esa sección tan pequeña, mover 1 m³/s exige casi el doble de pendiente
       que R1, y eso se paga en cota. */
    const L = 1;
    const J = raiz((j) => manning(areaV(L), 2 * L, 0.015, j) - 1, 1e-5, 0.2);
    const deR1 = (559 - 500) / 12000;
    if (!(J > 1.5 * deR1)) throw new Error('R2 no necesita mucha más pendiente, y debería');
    cuadra(id, 'La cota de arranque del ramal R2', 500 + J * 14000);
  });

  it('y la media caña de sustitución sería de 2 m', () => {
    /* Berma del 15 % del diámetro deja el calado en 0,7R, y el hormigón
       acabado baja el coeficiente a 0,012. */
    const J = (500 - 400) / 20000;
    const caudal = (R: number) => {
      const theta = Math.acos(1 - 0.7);
      const A = R * R * (theta - Math.sin(theta) * Math.cos(theta));
      return manning(A, 2 * R * theta, 0.012, J);
    };
    const teorico = 2 * raiz((R) => caudal(R) - 3, 0.2, 5);
    cuadra.magnitud(id, 'El diámetro de la media caña', Math.ceil(teorico / 0.5) * 0.5, 'm');
  });
});
