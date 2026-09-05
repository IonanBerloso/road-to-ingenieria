/**
 * Las dos recuperaciones de Cálculo de 2017-2018, la de la 4.ª y la de la 5.ª.
 * Once respuestas entre las dos.
 *
 * El ejercicio 3 de la recuperación de la 4.ª es el mejor recordatorio de que
 * los primeros términos de una sucesión no deciden nada: dos sucesiones que
 * toman exactamente los mismos valores —2+1/n y −2−1/n— y solo cambia **cómo
 * se reparten**. La que alterna par e impar no converge; la que salta una vez
 * en el término cincuenta converge a −2. El test las recorre las dos.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { cModulo, cPor, maximiza, raiz, type C } from './numerico';

const cuadra4 = convocatoria('calculo', '2017-2018-4ev-rec');
const cuadra5 = convocatoria('calculo', '2017-2018-5ev-rec');

const polar = (r: number, gr: number): C => [
  r * Math.cos((gr * Math.PI) / 180),
  r * Math.sin((gr * Math.PI) / 180),
];
const grados = ([a, b]: C) => (Math.atan2(b, a) * 180) / Math.PI;

const cambios = (f: (x: number) => number, a: number, b: number) => {
  let n = 0;
  let ultimo = 0;
  for (let x = a; x <= b; x += (b - a) / 20000) {
    const s = Math.sign(f(x));
    if (s !== 0 && ultimo !== 0 && s !== ultimo) n++;
    if (s !== 0) ultimo = s;
  }
  return n;
};

describe('2017-2018 · rec 4.ª · 1 · la elipse cortada por el sector', () => {
  const id = 'ex1718-rec-1-la-elipse-cortada-por-el-sector';

  it('el semieje horizontal es 3', () => {
    /* La elipse se da por su definición —suma de distancias a ±4i igual a
       10—, así que el semieje se busca sobre el eje real resolviendo esa misma
       condición, sin pasar por a² − c². */
    const semiejeX = raiz((x) => Math.hypot(x, -4) + Math.hypot(x, 4) - 10, 0.1, 20);
    /* Y de paso el vertical, que tiene que salir 5. */
    const semiejeY = raiz((y) => Math.abs(y - 4) + Math.abs(y + 4) - 10, 4.1, 20);
    if (Math.abs(semiejeY - 5) > 1e-9) throw new Error('el semieje vertical no es 5');
    cuadra4(id, 'El semieje horizontal de la elipse', semiejeX);
  });

  it('y el borde del sector tiene pendiente √3', () => {
    /* arg z = π/3: la pendiente es la de la semirrecta, medida sobre un punto
       cualquiera de ella. */
    const p = polar(2.7, 60);
    cuadra4(id, 'La pendiente del borde superior del sector', p[1] / p[0]);
  });
});

describe('2017-2018 · rec 4.ª · 2 · el coseno del doble', () => {
  it('el denominador del seno al cuadrado es −4', () => {
    /* sen z = (e^{iz} − e^{−iz})/(2i), así que al elevar al cuadrado el
       denominador es (2i)². Se calcula, no se recuerda. */
    cuadra4('ex1718-rec-2-el-coseno-del-doble', 'El denominador que aparece al elevar el seno al cuadrado',
      cPor([0, 2], [0, 2])[0]);
  });
});

describe('2017-2018 · rec 4.ª · 3 · dos sucesiones a trozos', () => {
  it('la segunda converge a −2 y la primera no converge', () => {
    const alterna = (n: number) => (n % 2 === 1 ? 2 + 1 / n : -2 - 1 / n);
    const salta = (n: number) => (n < 50 ? 2 + 1 / n : -2 - 1 / n);
    /* La primera no se estabiliza: dos términos consecutivos siguen a cuatro
       de distancia por muy lejos que se mire. */
    if (Math.abs(alterna(1_000_001) - alterna(1_000_000)) < 3)
      throw new Error('la alternada se estaría estabilizando');
    const lejos = [1e5, 1e7, 1e9].map(salta);
    if (Math.abs(lejos[2] - lejos[1]) > 1e-6) throw new Error('la segunda no se estabiliza');
    cuadra4('ex1718-rec-3-dos-sucesiones-a-trozos', 'El límite de la segunda', lejos[2]);
  });
});

describe('2017-2018 · rec 5.ª · 1 · dos complejos atados por un cociente', () => {
  const id = 'ex1718-5rec-1-dos-complejos-atados-por-un-cociente';
  /* z₁ es la raíz cúbica de −8 del primer cuadrante. */
  const raices = [0, 1, 2].map((k) => polar(2, (180 + 360 * k) / 3));
  const z1 = raices.filter((z) => z[0] > 1e-9 && z[1] > 1e-9);

  it('z₁ está a 60 grados', () => {
    if (z1.length !== 1) throw new Error(`hay ${z1.length} raíces en el primer cuadrante`);
    const cubo = cPor(cPor(z1[0], z1[0]), z1[0]);
    if (cModulo([cubo[0] + 8, cubo[1]]) > 1e-9) throw new Error('esa no es raíz cúbica de −8');
    cuadra5(id, 'El argumento de z₁', grados(z1[0]));
  });

  it('el módulo de z₂ es 2/3', () => cuadra5(id, 'El módulo de z₂', cModulo(z1[0]) / 3));

  it('y su argumento, −30 grados', () => {
    /* z₁/z₂ tiene que caer en el eje imaginario positivo, o sea a 90°. El
       argumento de z₂ se busca resolviendo esa condición sobre el cociente
       de verdad, no restando ángulos. */
    const cociente = (gr: number) => {
      const z2 = polar(cModulo(z1[0]) / 3, gr);
      const m = cModulo(z2) ** 2;
      return [
        (z1[0][0] * z2[0] + z1[0][1] * z2[1]) / m,
        (z1[0][1] * z2[0] - z1[0][0] * z2[1]) / m,
      ];
    };
    const arg = raiz((gr) => cociente(gr)[0], -179, 89);
    if (!(cociente(arg)[1] > 0)) throw new Error('el cociente cae en el eje imaginario negativo');
    cuadra5(id, 'El argumento de z₂', arg);
  });
});

describe('2017-2018 · rec 5.ª · 2 · el tanque de propano', () => {
  const id = 'ex1718-5rec-2-el-tanque-de-propano';
  /* Cilindro de radio r y altura h con dos semiesferas: el volumen es
     πr²h + (4/3)πr³ y vale 10π. Los extremos cuestan el doble por metro
     cuadrado, y con un coste unitario cualquiera el óptimo es el mismo. */
  const altura = (r: number) => (10 - (4 / 3) * r ** 3) / (r * r);
  const coste = (r: number) => 2 * Math.PI * r * altura(r) + 2 * (4 * Math.PI * r * r);
  /* El intervalo llega hasta donde la altura del cilindro se anula: más allá
     el tanque no cabe en el volumen pedido. */
  const tope = raiz(altura, 0.1, 5);
  const mejor = maximiza((r) => -coste(r), 0.2, tope - 1e-6);

  it('el radio óptimo es 1,2331 m', () => {
    if (Math.abs(Math.PI * mejor.x ** 2 * altura(mejor.x) + (4 / 3) * Math.PI * mejor.x ** 3 - 10 * Math.PI) > 1e-9)
      throw new Error('el tanque óptimo no tiene la capacidad pedida');
    cuadra5(id, 'El radio óptimo', mejor.x);
  });

  it('y la altura es cuatro veces el radio', () => cuadra5(id, 'La proporción entre altura y radio', altura(mejor.x) / mejor.x));
});

describe('2017-2018 · rec 5.ª · 3 · la composición que cambia cuatro veces', () => {
  const id = 'ex1718-5rec-3-la-composicion-que-cambia-cuatro-veces';
  /* LECTURA DE LA FIGURA: las dos curvas pasan por nudos enteros de la
     cuadrícula, y las parábolas que los unen son f(x) = 6 − (x−3)² y
     g(u) = 1 + (u−5)². */
  const f = (x: number) => 6 - (x - 3) ** 2;
  const g = (u: number) => 1 + (u - 5) ** 2;
  const h = (x: number) => g(f(x));

  it('la reconstrucción encaja con los valores del dibujo', () => {
    if (Math.abs(f(1) - 2) > 1e-12 || Math.abs(f(5) - 2) > 1e-12 || Math.abs(f(3) - 6) > 1e-12)
      throw new Error('f no toma los valores del dibujo');
    if (Math.abs(g(2) - 10) > 1e-12 || Math.abs(g(5) - 1) > 1e-12) throw new Error('g no toma los valores del dibujo');
  });

  it('hay que partir en cuatro tramos', () => {
    /* h′ = g′(f)·f′ cambia de signo donde f vale 5 —dos veces— y donde f′ se
       anula —una—. Se cuenta sobre la composición, no sobre la regla. */
    const hp = (x: number) => (h(x + 1e-6) - h(x - 1e-6)) / 2e-6;
    cuadra5(id, 'Cuántos tramos', cambios(hp, 1.001, 4.999) + 1);
  });

  it('y el máximo relativo vale 2', () => cuadra5(id, 'El valor máximo de h', maximiza(h, 2.2, 3.8).y));
});
