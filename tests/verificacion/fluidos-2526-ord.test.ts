/**
 * La ordinaria de Mecánica de Fluidos de 2025-2026, que es la última
 * convocatoria del corpus y la que cierra este pase.
 *
 * Veinte respuestas en ocho ejercicios, y una decisión de método que conviene
 * dejar dicha: en el ejercicio 1 los tres resultados se recalculan **en
 * pascales** y se comparan contra los kg/cm² y los bar que publica el corpus,
 * en vez de convertirlos aquí. La conversión la hace el mismo comparador que
 * corrige al alumno en la página, así que si la tabla de unidades se
 * equivocara —y «kg/cm²» es una presión solo porque esta escuela lo usa así—
 * estos tres se pondrían rojos. Es el uso para el que se escribió.
 *
 * Y el 9 es el ejercicio que §17 rescató de `fuera`: parecía no tener ninguna
 * cuenta y la tenía en el propio enunciado, en el aviso de que cada fallo
 * resta lo que suma un acierto. De ahí sale lo más útil del ejercicio, que es
 * cuándo compensa dejar un hueco en blanco.
 */
import { describe, it } from 'vitest';
import { coeficienteHW } from './tablas';
import { convocatoria } from './corpus';
import { raiz } from './numerico';

const cuadra = convocatoria('fluidos', '2025-2026-ord');

const G = 9.8;
const GAMMA = 1000 * G;
const area = (d: number) => (Math.PI * d * d) / 4;
function colebrook(Re: number, rugosidadRelativa: number) {
  let f = 0.02;
  for (let i = 0; i < 300; i++)
    f = 1 / (-2 * Math.log10(rugosidadRelativa / 3.7 + 2.51 / (Re * Math.sqrt(f)))) ** 2;
  return f;
}
const hazenWilliams = (L: number, Q: number, D: number, C: number) =>
  (10.674 * L * Q ** 1.852) / (C ** 1.852 * D ** 4.871);
const manning = (A: number, P: number, n: number, J: number) => (1 / n) * A * (A / P) ** (2 / 3) * Math.sqrt(J);

describe('1 · el manómetro dentro del depósito presurizado', () => {
  const id = 'exflu2526-ord-1-el-manometro-dentro-del-deposito-presurizado';
  /* Un manómetro no mide una presión: mide una **diferencia**, y aquí lo que
     cambia entre los tres apartados no es el fluido ni el punto de medida,
     sino contra qué se compara. La rama abierta del tubo en U desemboca en el
     aire del depósito exterior, así que lo que el tubo pesa es la presión del
     punto **respecto de ese aire**. */
  const relativaAlDeposito = 13.6 * GAMMA * 0.1 - 1.2 * GAMMA * 0.04;

  it('dentro del depósito marca 0,1312 kg/cm²', () =>
    cuadra.magnitud(id, 'La lectura dentro del depósito', relativaAlDeposito, 'Pa'));

  /* Los 2430 Torr del depósito exterior son **manométricos**: sumarlos sin
     añadir el barómetro deja la absoluta en 3,37 bar en vez de 4,37, y esa es
     la trampa del apartado b. */
  const torr = (mm: number) => (mm / 1000) * 13.6 * GAMMA;
  const atmosfera = torr(750);
  const absoluta = relativaAlDeposito + torr(2430) + atmosfera;

  it('y en absoluto, 4,365 bar', () => {
    const siLosTorrFueranAbsolutos = relativaAlDeposito + torr(2430);
    if (Math.abs(absoluta - siLosTorrFueranAbsolutos) / absoluta < 0.15)
      throw new Error('la lectura del barómetro debería pesar bastante más que esto');
    cuadra.magnitud(id, 'La misma lectura en absoluto', absoluta, 'Pa');
  });

  it('y sacado fuera del depósito marca 3,435 kg/cm²', () =>
    /* Fuera, el mismo punto y la misma presión absoluta se comparan contra la
       atmósfera de la calle: la lectura se dispara porque el depósito
       exterior estaba tapando dos atmósferas y media. */
    cuadra.magnitud(id, 'El manómetro sacado fuera', absoluta - atmosfera, 'Pa'));
});

describe('2 · elegir la bomba entre tres', () => {
  const id = 'exflu2526-ord-2-elegir-la-bomba-entre-tres';
  /* PVC de 150 mm: ε/D = 4,7·10⁻⁵, banda de 140 en la tabla del tema 19. */
  const C = coeficienteHW(7e-6 / 0.15);
  const cinetica = (Q: number) => (Q / 1000 / area(0.15)) ** 2 / (2 * G);
  const instalacion = (Q: number) => 40 + 5 * cinetica(Q) + hazenWilliams(850, Q / 1000, 0.15, C);
  const bomba3 = (Q: number) => 80 - 0.127 * Q * Q;

  it('la bomba 3 se planta en 16,55 l/s', () =>
    cuadra.magnitud(id, 'El caudal con la bomba 3', raiz((Q) => bomba3(Q) - instalacion(Q), 5, 40), 'l/s'));

  /* El enunciado da el punto de la bomba 2 —15,81 l/s— y aquí se usa tal cual,
     porque es un dato del enunciado y no un resultado. Rehacerlo con la tabla
     da 15,71, un 0,6 % de diferencia que es la precisión con la que se leen
     estas curvas. */
  const puntoB2 = 15.81;
  const npshDisponible = (Q: number) => 10 - 0.2 - 5 - hazenWilliams(100, Q / 1000, 0.15, C);

  it('y la bomba 2 solo dispone de 4,27 mca de NPSH', () => {
    const rehecho = raiz((Q) => 83 - 0.155 * Q * Q - instalacion(Q), 5, 40);
    if (Math.abs(rehecho / puntoB2 - 1) > 0.01)
      throw new Error(`el punto de la bomba 2 sale ${rehecho}, y el enunciado dice ${puntoB2}`);
    cuadra.magnitud(id, 'El NPSH disponible de la bomba 2', npshDisponible(puntoB2), 'mca');
  });

  it('y hay que quemar 8,09 m en la válvula para que deje de cavitar', () => {
    /* Cerrar la válvula baja el caudal, y eso ataca la cavitación por los dos
       lados a la vez: el NPSH requerido cae con el cuadrado del caudal y el
       disponible sube porque la aspiración pierde menos. El punto de corte es
       donde se cruzan. */
    const requerido = (Q: number) => 2 + 0.0118 * Q * Q;
    if (!(requerido(puntoB2) > npshDisponible(puntoB2))) throw new Error('la bomba 2 debería cavitar');
    const nuevo = raiz((Q) => npshDisponible(Q) - requerido(Q), 10, puntoB2);
    /* Y el freno que el enunciado pone: el servicio exige 14 l/s como mínimo,
       así que la maniobra solo vale si el caudal nuevo se queda por encima. */
    if (!(nuevo > 14)) throw new Error('cerrando tanto la válvula el caudal bajaría del mínimo del servicio');
    cuadra.magnitud(id, 'La pérdida que hay que meter en la válvula', 83 - 0.155 * nuevo * nuevo - instalacion(nuevo), 'm');
  });
});

describe('3 · el globo aerostático', () => {
  const id = 'exflu2526-ord-3-el-globo-aerostatico';
  const Z = 825;
  const p = (1 - 9e-5 * Z) * 101325;
  const T = 23 - (2 * Z) / 300 + 273.15;
  const densidad = p / (287 * T);

  it('el aire de fuera pesa 1,1245 kg/m³ a 825 m', () =>
    cuadra.magnitud(id, 'La densidad del aire a 825 m', densidad, 'kg/m3'));

  it('y hay que calentar el de dentro hasta 70,6 °C', () => {
    /* Flotar es que el empuje iguale al peso total, y la única incógnita es la
       densidad del aire de dentro: el globo la baja calentándolo, con la misma
       presión exterior. Las 25 UTM son 245 kg — la UTM es la masa que pesa un
       kilopondio, y confundirla con el kilo deja el globo 22 kg más ligero. */
    const carga = 25 * G + 6 * 75;
    const densidadDentro = densidad - carga / 4000;
    if (!(densidadDentro < densidad)) throw new Error('el aire de dentro tiene que pesar menos, o no sube');
    cuadra(id, 'La temperatura del aire interior', p / (287 * densidadDentro) - 273.15);
  });
});

describe('5 · el canal con berma y la pared de invierno', () => {
  const id = 'exflu2526-ord-5-el-canal-con-berma-y-la-pared-de-invierno';
  const [n, J] = [0.015, 1.2e-3];
  const Qverano = 5400 / 3600;
  /* Con la berma de 0,22·R la lámina queda por debajo del centro, así que la
     sección mojada es un segmento circular y no medio círculo. */
  const conBerma = (R: number) => {
    const beta = Math.acos(0.22);
    return { A: R * R * (beta - Math.sin(beta) * Math.cos(beta)), P: 2 * beta * R };
  };

  it('el radio tiene que ser 1,008 m', () => {
    const R = raiz((r) => manning(conBerma(r).A, conBerma(r).P, n, J) - Qverano, 0.2, 5);
    cuadra.magnitud(id, 'El radio necesario', R, 'm');
  });

  it('así que se instala un diámetro de 2,1 m', () => {
    /* Al alza: 2,016 m redondeado hacia abajo dejaría el canal corto. */
    if (2.1 < 2 * 1.008 || 2.0 >= 2 * 1.008) throw new Error('2,1 no es el primer múltiplo de 10 cm que sirve');
    cuadra.magnitud(id, 'El diámetro comercial', 2.1, 'm');
  });

  it('y en invierno la pared duplica el caudal, un 130,9 % más', () => {
    /* La pared vertical sobre el diámetro añade un rectángulo de área y solo
       dos trozos de pared al perímetro: 20 cm de agua más multiplican el
       caudal por 2,3. El aumento se mide **contra el caudal de verano de
       diseño**, los 5400 m³/h, no contra lo que da el tubo comercial. */
    const R = 1.05;
    const h = 0.2;
    const A = (Math.PI * R * R) / 2 + 2 * R * h;
    const P = Math.PI * R + 2 * h;
    const Qinvierno = manning(A, P, n, J);
    if (!(Qinvierno > 2 * Qverano)) throw new Error('la pared debería más que duplicar el caudal');
    cuadra(id, 'El incremento de caudal en invierno', (Qinvierno / Qverano - 1) * 100);
  });
});

describe('6 · el cabezal de la ducha', () => {
  const id = 'exflu2526-ord-6-el-cabezal-de-la-ducha';
  const Q = 10 / 60 / 1000;
  const vFlexible = Q / area(0.01);
  const vOrificios = Q / (90 * area(0.0005));
  const perdidaFlexible = 0.1e5 / GAMMA;

  it('el cabezal se come 13,47 mca', () => {
    /* Bernoulli del mando a la salida de los orificios. Lo que hace grande a
       esta pérdida no es el cabezal: es que 90 agujeros de medio milímetro
       aceleran el agua de 2,1 a 9,4 m/s, y esa altura cinética ya se lleva
       4,5 m de los 20 que entran. */
    const perdida = 20 + (vFlexible * vFlexible) / (2 * G) - (vOrificios * vOrificios) / (2 * G) - 1.2 - perdidaFlexible;
    if (!(vOrificios > 4 * vFlexible)) throw new Error('los orificios deberían acelerar mucho más el agua');
    cuadra.magnitud(id, 'Las pérdidas del cabezal', perdida, 'mca');
  });

  /* Para la fuerza hace falta la presión **a la entrada del cabezal**, no la
     del mando: por el camino se han perdido la cota y el flexible. */
  const presionEntrada = 20 * GAMMA - 1.2 * GAMMA - 0.1e5;
  const flujo = 1000 * Q;
  const alfa = (35 * Math.PI) / 180;

  it('y la fijación aguanta 0,9 N en horizontal', () =>
    cuadra.magnitud(id, 'La componente horizontal', flujo * vOrificios * Math.sin(alfa), 'N'));

  it('y 15,33 N en vertical', () => {
    /* El agua sube por el flexible y sale hacia abajo, así que los dos
       términos de cantidad de movimiento **suman** en vez de restarse. Y aun
       así los pone casi todos la presión sobre la brida: 13,7 de los 15,3. */
    const vertical = presionEntrada * area(0.01) + flujo * (vFlexible + vOrificios * Math.cos(alfa));
    if (!(presionEntrada * area(0.01) > 0.8 * vertical)) throw new Error('la presión debería poner la mayor parte');
    cuadra.magnitud(id, 'La componente vertical', vertical, 'N');
  });
});

describe('7 · el submarino que no se puede ensayar', () => {
  const id = 'exflu2526-ord-7-el-submarino-que-no-se-puede-ensayar';
  const [Lp, Up, nup, rhop] = [4, 5, 1.35e-6, 1025];
  const [Lm, num, rhom, cm] = [0.4, 1e-6, 1000, 1481];
  const porReynolds = (nu: number) => (Up * Lp * nu) / (nup * Lm);

  it('el modelo hay que arrastrarlo a 37 m/s', () => {
    const Um = porReynolds(num);
    /* Y la comprobación que el enunciado pide expresamente: a esa velocidad el
       Mach sigue muy por debajo de 0,3, así que la compresibilidad no estropea
       la semejanza y el ensayo es válido. */
    if (!(Um / cm < 0.3)) throw new Error('a esta velocidad ya no se podría despreciar la compresibilidad');
    cuadra.magnitud(id, 'La velocidad del modelo por Reynolds', Um, 'm/s');
  });

  it('y el submarino real arrastraría 93,4 N', () => {
    /* El coeficiente de fuerza F/(ρU²L²) es el mismo en los dos, y el
       prototipo gana cien veces en área lo que pierde cincuenta y cinco en
       velocidad al cuadrado: el resultado es que el real arrastra menos del
       doble que el modelo. */
    const Um = porReynolds(num);
    cuadra.magnitud(id, 'La fuerza en el prototipo', 50 * (rhop / rhom) * (Up / Um) ** 2 * (Lp / Lm) ** 2, 'N');
  });

  it('y con gas habría que ir a 567 m/s, que es supersónico', () => {
    const Ugas = porReynolds(1.53e-5);
    /* Aquí está la respuesta al apartado d, y es un no: ese ensayo tendría
       Mach 1,7, así que dejaría de valer justo la hipótesis con la que se
       montó todo. Cambiar de fluido para bajar la velocidad la sube. */
    if (!(Ugas / 340 > 1)) throw new Error('el ensayo con gas debería salir supersónico');
    if (!(Ugas > porReynolds(num))) throw new Error('el gas debería empeorar el problema, no arreglarlo');
    cuadra.magnitud(id, 'La velocidad si se cambia a gas', Ugas, 'm/s');
  });
});

describe('8 · el alcohol entre A y B', () => {
  const id = 'exflu2526-ord-8-el-alcohol-entre-a-y-b';
  const gamma = 7732;
  const NU = 2e-6;
  /* Los dos piezómetros marcan 15 y 30 cm, así que la carga se pierde **de B
     hacia A** y no al revés. Lo que importa para el caudal es el módulo. */
  const perdida = Math.abs(0.3 - 0.15);
  const caida = (D: number, L: number, Q: number, eps: number) => {
    const v = Q / area(D);
    return colebrook((v * D) / NU, eps / D) * (L / D) * ((v * v) / (2 * G));
  };

  it('circulan 22,85 l/s de alcohol', () => {
    /* Hierro galvanizado, ε = 0,015 cm, la misma que el resto del corpus. Y un
       detalle que no cambia el número pero sí el razonamiento: el peso
       específico del alcohol no entra en ninguna parte, porque la pérdida ya
       viene medida en columna del propio fluido. */
    const Q = raiz((q) => caida(0.1, 1.5, q, 1.5e-4) - perdida, 1e-4, 0.2);
    if (Math.abs(gamma / GAMMA - 0.789) > 0.01) throw new Error('el alcohol ya no tiene la densidad que dice el enunciado');
    cuadra.magnitud(id, 'El caudal con hierro galvanizado', Q * 1000, 'l/s');
  });

  it('y la tubería de cobre tiene que medir 96,7 mm', () => {
    /* El cobre es tan liso que su rugosidad exacta da igual, y eso se
       demuestra en vez de suponerse: barriendo desde el tubo perfectamente
       liso hasta ε = 0,00015 cm, el diámetro se mueve un 0,15 % y los dos
       extremos caen dentro de la tolerancia publicada. Es la regla de acotar
       en vez de inventar un dato que no está en el enunciado. */
    const diametro = (eps: number) => raiz((d) => caida(d, 1.5, 0.025, eps) - perdida, 0.03, 0.3);
    const extremos = [0, 1.5e-6].map(diametro);
    if (Math.abs(extremos[0] / extremos[1] - 1) > 0.005)
      throw new Error('la rugosidad del cobre sí decide el resultado, y el comentario dice que no');
    cuadra.magnitud(id, 'El diámetro de la tubería de cobre', extremos[1] * 1000, 'mm');
  });
});

describe('9 · ocho huecos y un descuento', () => {
  const id = 'exflu2526-ord-9-ocho-huecos-y-un-descuento';

  it('acertando cinco de ocho te llevas el 25 %', () => {
    const nota = (aciertos: number, contestados: number) => ((aciertos - (contestados - aciertos)) / 8) * 100;

    /* Y lo que el descuento significa de verdad, que es la parte útil del
       ejercicio: con esta regla, contestar un hueco del que no tienes ni idea
       tiene esperanza **negativa** en cuanto tu probabilidad de acertar baja
       del 50 %, y dejarlo en blanco vale exactamente cero. */
    const esperanza = (p: number) => p * 1 + (1 - p) * -1;
    if (esperanza(0.4) >= 0) throw new Error('por debajo del 50 % contestar debería salir a perder');
    if (esperanza(0.6) <= 0) throw new Error('por encima del 50 % debería compensar');
    if (Math.abs(esperanza(0.5)) > 1e-12) throw new Error('el punto de indiferencia debería estar justo en el 50 %');
    /* Corolario con números: quien deje en blanco los tres que no sabe y
       acierte los cinco restantes saca más del doble. */
    if (!(nota(5, 5) > 2 * nota(5, 8))) throw new Error('dejar en blanco lo dudoso debería rentar mucho más');

    cuadra(id, 'Lo que te llevas si fallas tres', nota(5, 8));
  });
});
