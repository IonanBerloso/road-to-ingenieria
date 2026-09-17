/**
 * Las figuras de los dos ejercicios propios del tema 5.
 *
 * Son las dos caras del teorema fundamental, y las dos se entienden mucho
 * antes mirándolas: la primera enseña que derivar una integral de límites
 * variables es medir cómo se ensancha el intervalo, y la segunda enseña de un
 * vistazo que integrar suaviza —un salto se convierte en un pico— y que lo
 * que se pierde en el punto malo es la derivada, no la continuidad.
 *
 *     node scripts/figuras/calculo-propios-t05.mjs
 */

import { lienzo, mosaico } from './lienzo.mjs';
import { pegaEnCampo } from './pegar.mjs';

export const FICHERO = 'src/content/calculo/t05-integracion/ejercicios.yaml';

export const figuras = [];
const fig = (id, pie, hacer) =>
  figuras.push({ fichero: FICHERO, id, campo: 'resolucion', pie, hacer });

/* ── 1 · el intervalo que se ensancha ────────────────────────────────── */

fig('derivar-una-integral-de-limites-variables',
  'F(x) es el área sombreada, entre x² y x³. Al crecer x, el límite de la derecha corre más deprisa que el de la izquierda, así que la franja se ensancha y el área crece: por eso F′(1) sale positiva.',
  () => {
    const g = (t) => Math.exp(-t * t);
    /* Con x = 1,15 los dos limites ya se han separado lo bastante para que la
       franja se vea, y siguen dentro de la zona donde el integrando no es
       practicamente cero. Con x = 1 la franja seria un segmento. */
    const X = 1.15;
    const a = X * X;
    const b = X ** 3;
    /* La ventana va pegada a la franja, no a la campana entera: con la
       campana completa a la vista la franja cae en la cola, mide cuatro
       pixeles de alto y no se ve nada de lo que la figura quiere enseñar. */
    const l = lienzo({
      id: 'f-integral-limites-variables',
      ancho: 340, alto: 250,
      x: [0.82, 2.05], y: [-0.16, 0.62], cuadrado: false,
      margen: 30,
      titulo: 'Un tramo de la campana con la franja entre x al cuadrado y x al cubo sombreada',
      desc: 'Un tramo de la curva e elevado a menos t al cuadrado, ampliado entre t igual a cero '
        + 'coma ocho y t igual a dos, donde la curva ya solo baja. Bajo ella hay una franja '
        + 'sombreada vertical que va desde t igual a uno coma treinta y dos, que es x al '
        + 'cuadrado, hasta t igual a uno coma cincuenta y dos, que es x al cubo, para el valor x '
        + 'igual a uno coma quince. El área de esa franja es el valor de F en ese punto, y está '
        + 'rotulada. Los dos bordes están marcados con sus nombres, x al cuadrado el izquierdo y '
        + 'x al cubo el derecho. Bajo el eje, de cada borde sale una flecha que apunta a la '
        + 'derecha: la del borde derecho es mucho más larga que la del izquierdo, porque al '
        + 'crecer x el límite x al cubo se mueve más deprisa que el límite x al cuadrado. Por eso '
        + 'la franja se ensancha y su área crece, y por eso la derivada de F sale positiva.',
    });
    l.ejes({ nombreX: 't', nombreY: '', enY: 0.85, marcasX: [1, 1.5, 2], marcasY: [0.5] });
    l.region([[a, 0], ...Array.from({ length: 40 }, (_, k) => {
      const t = a + ((b - a) * k) / 39;
      return [t, g(t)];
    }), [b, 0]], { clase: 'f' });
    l.curva(g, [0.85, 2.02], { clase: 'c', n: 170 });
    l.poli([[a, 0], [a, g(a)]], { clase: 'g' });
    l.poli([[b, 0], [b, g(b)]], { clase: 'g' });
    l.flecha([a, -0.075], [a + 0.055, -0.075], { clase: 'c2' });
    l.flecha([b, -0.075], [b + 0.175, -0.075], { clase: 'c2' });
    l.rotulo(a, g(a), 'x²', { dx: -5, dy: -6, anclaje: 'end', color: 'var(--faint)' });
    l.rotulo(b, g(b), 'x³', { dx: 5, dy: -6, color: 'var(--faint)' });
    l.rotulo((a + b) / 2, 0, 'F(x)', { dx: 0, dy: -14, anclaje: 'middle', color: 'var(--flag)' });
    l.rotulo(b + 0.09, -0.075, 'corre más deprisa', { dx: 0, dy: 15, anclaje: 'middle', color: 'var(--alt)', pequeno: true });
    l.rotulo(0.88, g(0.88), 'e^(−t²)', { dx: 5, dy: -7, color: 'var(--d1)' });
    return l.svg();
  });

/* ── 2 · integrar suaviza: de un salto a un pico ─────────────────────── */

fig('la-funcion-integral-de-una-funcion-a-trozos',
  'A la izquierda el integrando, que salta en x = 1. A la derecha su integral, que en ese mismo punto no salta: hace un pico. Un escalón de suavidad ganado, y es siempre así.',
  () => mosaico({
    id: 'f-integral-de-una-a-trozos',
    titulo: 'El integrando con su salto y la función integral con su pico',
    desc: 'Dos gráficas una al lado de la otra. La de la izquierda es el integrando: vale uno '
      + 'entre cero y uno y vale dos entre uno y dos, con un salto vertical en x igual a uno '
      + 'dibujado a puntos, porque la función no es continua ahí. Las dos zonas bajo ella están '
      + 'sombreadas, y sus áreas son uno y dos. La de la derecha es la función integral: sube en '
      + 'línea recta con pendiente uno desde el origen hasta el punto uno coma uno, y desde ahí '
      + 'sigue subiendo en línea recta pero con pendiente dos hasta el punto dos coma tres. En x '
      + 'igual a uno las dos rectas se juntan sin dejar hueco, así que la función integral es '
      + 'continua, pero cambian de inclinación bruscamente: hay un pico y no hay derivada. El '
      + 'punto uno coma uno está marcado en las dos gráficas.',
    columnas: 2, ancho: 250, alto: 225, hueco: 26,
    celdas: [
      {
        etiqueta: 'el integrando f, que salta',
        x: [-0.35, 2.4], y: [-0.4, 2.6], cuadrado: false,
        dibuja: (l) => {
          l.ejes({ nombreX: 'x', nombreY: 'f', marcasX: [1, 2], marcasY: [1, 2] });
          l.region([[0, 0], [1, 0], [1, 1], [0, 1]], { clase: 'f' });
          l.region([[1, 0], [2, 0], [2, 2], [1, 2]], { clase: 'f2' });
          l.poli([[0, 1], [1, 1]], { clase: 'c' });
          l.poli([[1, 2], [2, 2]], { clase: 'c' });
          l.poli([[1, 1], [1, 2]], { clase: 'g' });
          l.punto(1, 1, { clase: 'hueco', r: 4 });
          l.punto(1, 2, { clase: 'pt', r: 4 });
          l.rotulo(0.5, 0.5, 'área 1', { dx: 0, dy: 4, anclaje: 'middle', color: 'var(--faint)', pequeno: true });
          l.rotulo(1.5, 1, 'área 2', { dx: 0, dy: 4, anclaje: 'middle', color: 'var(--faint)', pequeno: true });
        },
      },
      {
        etiqueta: 'su integral F, que hace un pico',
        x: [-0.35, 2.4], y: [-0.5, 3.4], cuadrado: false,
        dibuja: (l) => {
          l.ejes({ nombreX: 'x', nombreY: 'F', marcasX: [1, 2], marcasY: [1, 3] });
          l.poli([[0, 0], [1, 1], [2, 3]], { clase: 'c' });
          l.punto(1, 1, { clase: 'o', r: 4.4 });
          l.rotulo(1, 1, 'pico', { dx: -7, dy: 2, anclaje: 'end', color: 'var(--flag)' });
          l.rotulo(0.45, 0.45, 'pendiente 1', { dx: 4, dy: 14, color: 'var(--faint)', pequeno: true });
          l.rotulo(1.6, 2.2, 'pendiente 2', { dx: -4, dy: 14, anclaje: 'end', color: 'var(--faint)', pequeno: true });
        },
      },
    ],
  }));

/* ── a pegar ─────────────────────────────────────────────────────────── */
for (const f of figuras) f.svg = f.hacer();

if (process.argv[1]?.endsWith('calculo-propios-t05.mjs')) {
  for (const f of figuras) pegaEnCampo(f.fichero, f.id, f.campo, f.svg, f.pie);
  console.log(`${figuras.length} figuras propias pegadas en ${FICHERO}`);
}
