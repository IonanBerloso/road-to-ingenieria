/**
 * Las figuras de las prácticas del tema 8 que tienen varios apartados.
 *
 * Seis ejercicios del boletín piden lo mismo sobre cuatro, cinco o siete
 * curvas distintas, y ahí el mosaico no es un capricho de maquetación: el
 * ejercicio **es** la comparación. Ver los cinco caminos de O a A uno al lado
 * del otro es lo que hace evidente que dan resultados distintos, que es justo
 * lo que el ejercicio quiere enseñar —y lo contrario de lo que pasa con el
 * campo conservativo del ejercicio de al lado—.
 *
 *     node scripts/figuras/calculo-practica-t08-apartados.mjs
 */

import { mosaico, vista3d } from './lienzo.mjs';
import { pegaEnCampo } from './pegar.mjs';

export const FICHERO = 'src/content/calculo/t08-integral-curvilinea/ejercicios.yaml';

export const figuras = [];
const fig = (id, pie, hacer) =>
  figuras.push({ fichero: FICHERO, id, campo: 'resolucion', pie, hacer });

const P = Math.PI;

const arco = (cx, cy, r, t0, t1, n = 80) =>
  Array.from({ length: n + 1 }, (_, k) => {
    const t = t0 + ((t1 - t0) * k) / n;
    return [cx + r * Math.cos(t), cy + r * Math.sin(t)];
  });

const param = (f, t0, t1, n = 120) =>
  Array.from({ length: n + 1 }, (_, k) => f(t0 + ((t1 - t0) * k) / n));

/** Los tres ejes de una vista isométrica, con sus nombres. */
const ejes3d = (l, p3, largo = 1.8) => {
  l.poli([p3(0, 0, 0), p3(largo, 0, 0)], { clase: 'eje' });
  l.poli([p3(0, 0, 0), p3(0, largo, 0)], { clase: 'eje' });
  l.poli([p3(0, 0, 0), p3(0, 0, largo)], { clase: 'eje' });
  l.rotulo(...p3(largo, 0, 0), 'x', { dx: 3, dy: 9, color: 'var(--faint)', pequeno: true });
  l.rotulo(...p3(0, largo, 0), 'y', { dx: -9, dy: 9, color: 'var(--faint)', pequeno: true });
  l.rotulo(...p3(0, 0, largo), 'z', { dx: 4, dy: 1, color: 'var(--faint)', pequeno: true });
};

/* ── 1 · tres caminos, el mismo trabajo ──────────────────────────────── */

fig('tres-caminos-mismo-trabajo',
  'A(1,2) y B(3,4) son diametralmente opuestos en la circunferencia de centro (2,3): el segmento AB es el diámetro. Por eso los tres caminos del enunciado unen los mismos dos puntos, y por eso el campo, que es conservativo, da lo mismo en los tres —y cero en el cerrado—.',
  () => {
    const cx = 2, cy = 3, R = Math.SQRT2;
    const A = [1, 2], B = [3, 4];
    const marca = (l) => {
      l.punto(...A, { clase: 'o', r: 4 });
      l.punto(...B, { clase: 'o', r: 4 });
      l.rotulo(...A, 'A', { dx: -6, dy: 12, anclaje: 'end', color: 'var(--flag)' });
      l.rotulo(...B, 'B', { dx: 6, dy: -5, color: 'var(--flag)' });
    };
    /* El encuadre incluye el origen a propósito. Recortar a la zona de la
       circunferencia y dibujar dos rectas por el borde llamándolas «x» e «y»
       queda más limpio y es falso: esas rectas no son los ejes. */
    const celda = (etiqueta, dibuja) => ({
      etiqueta,
      x: [-0.4, 4.0], y: [-0.4, 4.9], cuadrado: true,
      dibuja: (l) => {
        l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 3], marcasY: [2, 4] });
        dibuja(l);
        marca(l);
      },
    });
    return mosaico({
      id: 'f-tres-caminos',
      columnas: 3,
      titulo: 'Los tres caminos del enunciado entre los mismos dos puntos',
      desc: 'Tres recuadros con los mismos dos puntos marcados, A en uno coma dos abajo a la '
        + 'izquierda y B en tres coma cuatro arriba a la derecha. En el primero los une un '
        + 'segmento recto. En el segundo los une un arco de circunferencia de centro dos coma '
        + 'tres, que pasa por arriba y por la izquierda. En el tercero se dibuja la '
        + 'circunferencia entera, que empieza y acaba en el mismo punto. Como A y B son '
        + 'diametralmente opuestos, el segmento del primer recuadro es exactamente el diámetro '
        + 'de esa circunferencia.',
      celdas: [
        celda('(a) el segmento', (l) => {
          l.poli([A, B], { clase: 'c' });
          l.flecha([1.8, 2.8], [2.2, 3.2], { clase: 'c' });
        }),
        celda('(b) el arco', (l) => {
          l.poli(arco(cx, cy, R, (5 * P) / 4, P / 4, 70), { clase: 'c' });
          l.flecha(
            [cx + R * Math.cos(2.5), cy + R * Math.sin(2.5)],
            [cx + R * Math.cos(2.2), cy + R * Math.sin(2.2)],
            { clase: 'c' },
          );
        }),
        celda('(c) la circunferencia', (l) => {
          l.circunferencia(cx, cy, R, { clase: 'c' });
          l.flecha(
            [cx + R * Math.cos(0.5), cy + R * Math.sin(0.5)],
            [cx + R * Math.cos(0.85), cy + R * Math.sin(0.85)],
            { clase: 'c' },
          );
        }),
      ],
    });
  });

/* ── 2 · la misma integral por cinco caminos ─────────────────────────── */

fig('la-misma-integral-por-cinco-caminos',
  'Los cinco caminos unen O(0,0) con A(2,1) y ninguno da lo mismo que otro salvo por casualidad: este campo no es conservativo, y el dibujo es la prueba de que «de O a A» no determina la integral.',
  () => {
    const O = [0, 0], A = [2, 1];
    const celda = (etiqueta, dibuja) => ({
      etiqueta,
      x: [-0.35, 2.45], y: [-0.35, 1.45], cuadrado: true,
      dibuja: (l) => {
        l.ejes({ nombreX: 'x', nombreY: 'y' });
        dibuja(l);
        l.punto(...O, { clase: 'o', r: 3.8 });
        l.punto(...A, { clase: 'o', r: 3.8 });
        l.rotulo(...O, 'O', { dx: -5, dy: 13, anclaje: 'end', color: 'var(--flag)' });
        l.rotulo(...A, 'A', { dx: 5, dy: -5, color: 'var(--flag)' });
      },
    });
    return mosaico({
      id: 'f-cinco-caminos',
      columnas: 3,
      titulo: 'Los cinco caminos que unen el origen con el punto dos coma uno',
      desc: 'Cinco recuadros, cada uno con el origen O abajo a la izquierda y el punto A, de '
        + 'coordenadas dos y uno, arriba a la derecha. En el primero los une una recta. En el '
        + 'segundo, una parábola de eje vertical que sale plana del origen y se empina al '
        + 'llegar a A. En el tercero, una parábola de eje horizontal, que hace justo lo '
        + 'contrario: sale empinada y llega plana. En el cuarto, una quebrada que va primero '
        + 'por el eje x hasta el punto dos coma cero y luego sube. En el quinto, la otra '
        + 'quebrada: primero sube por el eje y hasta cero coma uno y luego avanza en '
        + 'horizontal.',
      celdas: [
        celda('(a) recta OmA', (l) => {
          l.poli([O, A], { clase: 'c' });
          l.flecha([0.85, 0.425], [1.15, 0.575], { clase: 'c' });
        }),
        celda('(b) parábola OnA', (l) => {
          l.curva((x) => (x * x) / 4, [0, 2], { clase: 'c', n: 60 });
          l.flecha([1.0, 0.25], [1.3, 0.4225], { clase: 'c' });
        }),
        celda('(c) parábola OpA', (l) => {
          l.poli(param((t) => [2 * t * t, t], 0, 1, 60), { clase: 'c' });
          l.flecha([0.5, 0.5], [0.98, 0.7], { clase: 'c' });
        }),
        celda('(d) quebrada OBA', (l) => {
          l.poli([O, [2, 0], A], { clase: 'c' });
          l.flecha([0.85, 0], [1.15, 0], { clase: 'c' });
          l.flecha([2, 0.42], [2, 0.62], { clase: 'c' });
          l.punto(2, 0, { r: 3.2 });
          l.rotulo(2, 0, 'B', { dx: 5, dy: 13, pequeno: true });
        }),
        celda('(e) quebrada ODA', (l) => {
          l.poli([O, [0, 1], A], { clase: 'c' });
          l.flecha([0, 0.42], [0, 0.62], { clase: 'c' });
          l.flecha([0.85, 1], [1.15, 1], { clase: 'c' });
          l.punto(0, 1, { r: 3.2 });
          l.rotulo(0, 1, 'D', { dx: -5, dy: -5, anclaje: 'end', pequeno: true });
        }),
      ],
    });
  });

/* ── 3 · parametrizar cuatro curvas ──────────────────────────────────── */

fig('parametrizar-cuatro-curvas',
  'Las dos primeras están en el plano y las dos últimas en el espacio, y eso cambia lo que hay que escribir: en el plano basta un parámetro y dos funciones; en el espacio hacen falta tres, y en el triángulo además hay que partirlo en tres tramos.',
  () => {
    const p3 = vista3d({ escalaXY: 1.0, inclinacion: 0.45 });
    return mosaico({
      id: 'f-parametrizar-cuatro',
      columnas: 2,
      ancho: 190,
      alto: 168,
      titulo: 'Las cuatro curvas del enunciado: dos en el plano y dos en el espacio',
      desc: 'Cuatro recuadros. En el primero, la mitad de arriba de una circunferencia de radio '
        + 'uno centrada en el punto dos coma dos: solo el trozo con y mayor que dos. En el '
        + 'segundo, la mitad de arriba de una elipse de semieje horizontal dos y semieje '
        + 'vertical uno centrada en el origen. En el tercero, una vista en perspectiva de los '
        + 'tres ejes con una semicircunferencia de radio tres dibujada en el plano y igual a '
        + 'tres, la mitad con x positiva. En el cuarto, otra vista en perspectiva con el '
        + 'triángulo que une los puntos uno cero uno, uno cero cero y cero uno cero, cerrado '
        + 'sobre sí mismo.',
      celdas: [
        {
          etiqueta: '(a) arco, y > 2',
          x: [-0.35, 3.45], y: [-0.35, 3.45], cuadrado: true,
          dibuja: (l) => {
            l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [2], marcasY: [2] });
            l.poli(arco(2, 2, 1, P, 2 * P, 70), { clase: 'fue' });
            l.poli(arco(2, 2, 1, 0, P, 70), { clase: 'c' });
            l.poli([[0.9, 2], [3.1, 2]], { clase: 'g' });
            l.punto(2, 2, { r: 3 });
            l.rotulo(2, 3, 'y > 2', { dx: 6, dy: -4, pequeno: true });
          },
        },
        {
          etiqueta: '(b) media elipse',
          x: [-2.4, 2.4], y: [-1.3, 1.35], cuadrado: true,
          dibuja: (l) => {
            l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-2, 2], marcasY: [1] });
            l.poli(param((t) => [2 * Math.cos(t), Math.sin(t)], P, 2 * P, 70), { clase: 'fue' });
            l.poli(param((t) => [2 * Math.cos(t), Math.sin(t)], 0, P, 70), { clase: 'c' });
          },
        },
        {
          etiqueta: '(c) x²+z²=y², y=3',
          x: [-3.9, 3.9], y: [-2.8, 4.9], cuadrado: true,
          dibuja: (l) => {
            ejes3d(l, p3, 3.6);
            l.poli(param((s) => p3(3 * Math.cos(s), 3, 3 * Math.sin(s)), -P / 2, P / 2, 80), { clase: 'c' });
            l.poli([p3(0, 3, -3), p3(0, 3, 3)], { clase: 'g' });
            l.rotulo(...p3(3, 3, 0), 'radio 3', { dx: 5, dy: 3, pequeno: true });
            l.esquina(186, 13, 'plano y = 3', { color: 'var(--faint)', anclaje: 'end' });
          },
        },
        {
          etiqueta: '(d) el triángulo ABCA',
          x: [-1.7, 1.7], y: [-0.45, 1.95], cuadrado: true,
          dibuja: (l) => {
            ejes3d(l, p3, 1.55);
            const A = p3(1, 0, 1), B = p3(1, 0, 0), C = p3(0, 1, 0);
            l.poli([A, B, C], { clase: 'c', cerrar: true });
            for (const v of [A, B, C]) l.punto(...v, { clase: 'o', r: 3.4 });
            l.rotulo(...A, 'A', { dx: 5, dy: -4, color: 'var(--flag)' });
            l.rotulo(...B, 'B', { dx: 5, dy: 11, color: 'var(--flag)' });
            l.rotulo(...C, 'C', { dx: -5, dy: 11, anclaje: 'end', color: 'var(--flag)' });
          },
        },
      ],
    });
  });

/* ── 4 · cinco veces Green ───────────────────────────────────────────── */

fig('cinco-veces-green',
  'Los cinco recintos de Green, con su sentido. Dos de ellos —el cuarto de corona y el triángulo— vienen recorridos en sentido horario, y eso cambia el signo del resultado: el teorema se enuncia para el sentido positivo.',
  () => {
    const celda = (etiqueta, x, y, dibuja) => ({ etiqueta, x, y, cuadrado: true, dibuja });
    return mosaico({
      id: 'f-cinco-green',
      columnas: 3,
      titulo: 'Los cinco recintos del ejercicio, cada uno con el sentido en que se recorre',
      desc: 'Cinco recuadros con regiones sombreadas. El primero es un cuarto de corona en el '
        + 'primer cuadrante, entre los radios dos y cuatro, con flechas en sentido horario. El '
        + 'segundo es el triángulo de vértices cero coma uno, uno coma uno y uno coma cero, '
        + 'medio cuadrado, también en sentido horario. El tercero es el disco de radio uno, en '
        + 'sentido antihorario. El cuarto es el disco de radio R, igual. El quinto es el '
        + 'interior de una elipse de semiejes a y b, también antihorario.',
      celdas: [
        celda('(a) cuarto de corona', [-0.6, 4.7], [-0.6, 4.7], (l) => {
          l.poli([...arco(0, 0, 4, 0, P / 2, 60), ...arco(0, 0, 2, P / 2, 0, 60)], { clase: 'f', cerrar: true });
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [2, 4] });
          l.poli(arco(0, 0, 4, 0, P / 2, 60), { clase: 'c' });
          l.poli(arco(0, 0, 2, 0, P / 2, 60), { clase: 'c' });
          l.poli([[2, 0], [4, 0]], { clase: 'c' });
          l.poli([[0, 2], [0, 4]], { clase: 'c' });
          l.flecha([4 * Math.cos(1.0), 4 * Math.sin(1.0)], [4 * Math.cos(0.75), 4 * Math.sin(0.75)], { clase: 'c' });
          l.flecha([2 * Math.cos(0.55), 2 * Math.sin(0.55)], [2 * Math.cos(0.85), 2 * Math.sin(0.85)], { clase: 'c' });
          l.rotulo(2.8, 2.8, 'horario', { dx: 0, dy: 0, anclaje: 'middle', pequeno: true });
        }),
        celda('(b) triángulo ABC', [-0.35, 1.45], [-0.35, 1.45], (l) => {
          l.poli([[0, 1], [1, 1], [1, 0]], { clase: 'f', cerrar: true });
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1], marcasY: [1] });
          l.poli([[0, 1], [1, 1], [1, 0]], { clase: 'c', cerrar: true });
          l.flecha([0.42, 1], [0.62, 1], { clase: 'c' });
          l.flecha([1, 0.58], [1, 0.38], { clase: 'c' });
          l.punto(0, 1, { clase: 'o', r: 3.4 });
          l.punto(1, 1, { clase: 'o', r: 3.4 });
          l.punto(1, 0, { clase: 'o', r: 3.4 });
          l.rotulo(0, 1, 'A', { dx: -5, dy: -5, anclaje: 'end', color: 'var(--flag)' });
          l.rotulo(1, 1, 'B', { dx: 5, dy: -5, color: 'var(--flag)' });
          l.rotulo(1, 0, 'C', { dx: 5, dy: 12, color: 'var(--flag)' });
        }),
        celda('(c) x²+y²=1', [-1.4, 1.4], [-1.4, 1.4], (l) => {
          l.disco(0, 0, 1, { clase: 'f' });
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1] });
          l.circunferencia(0, 0, 1, { clase: 'c' });
          l.flecha([Math.cos(0.42), Math.sin(0.42)], [Math.cos(0.66), Math.sin(0.66)], { clase: 'c' });
        }),
        celda('(d) x²+y²=R²', [-1.45, 1.45], [-1.45, 1.45], (l) => {
          l.disco(0, 0, 1, { clase: 'f' });
          l.ejes({ nombreX: 'x', nombreY: 'y' });
          l.circunferencia(0, 0, 1, { clase: 'c' });
          l.flecha([Math.cos(0.42), Math.sin(0.42)], [Math.cos(0.66), Math.sin(0.66)], { clase: 'c' });
          l.rotulo(Math.cos(-0.7), Math.sin(-0.7), 'R', { dx: 6, dy: 5 });
        }),
        celda('(e) la elipse', [-1.95, 1.95], [-1.4, 1.4], (l) => {
          l.poli(param((t) => [1.7 * Math.cos(t), Math.sin(t)], 0, 2 * P, 100), { clase: 'f', cerrar: true });
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [[1.7, 'a']], marcasY: [[1, 'b']] });
          l.poli(param((t) => [1.7 * Math.cos(t), Math.sin(t)], 0, 2 * P, 100), { clase: 'c', cerrar: true });
          l.flecha([1.7 * Math.cos(0.42), Math.sin(0.42)], [1.7 * Math.cos(0.66), Math.sin(0.66)], { clase: 'c' });
        }),
      ],
    });
  });

/* ── 5 · siete curvilíneas directas ──────────────────────────────────── */

fig('siete-curvilineas-directas',
  'Las seis curvas del enunciado que viven en el plano; la del apartado (f) es un segmento del espacio y no necesita dibujo. Todas son de parametrización inmediata, que es lo que el ejercicio entrena: elegir el parámetro y no equivocarse con los extremos.',
  () => {
    const celda = (etiqueta, x, y, cuadrado, dibuja) => ({ etiqueta, x, y, cuadrado, dibuja });
    return mosaico({
      id: 'f-siete-curvilineas',
      columnas: 3,
      titulo: 'Las seis curvas del plano que aparecen en el ejercicio',
      desc: 'Seis recuadros. El primero, el cuarto de circunferencia unidad del primer '
        + 'cuadrante. El segundo, la cúbica y igual a x al cubo desde el origen hasta el punto '
        + 'dos coma ocho, muy empinada al final. El tercero, la parábola y igual a x al '
        + 'cuadrado desde el origen hasta el punto uno coma uno. El cuarto, el logaritmo '
        + 'neperiano entre x igual a uno y x igual a e, que sube de cero a uno. El quinto, el '
        + 'cuarto de elipse del primer cuadrante. El sexto, la semicircunferencia de arriba. '
        + 'Cada curva lleva una flecha con el sentido en que se recorre.',
      celdas: [
        celda('(a) cuarto de circ.', [-0.25, 1.35], [-0.25, 1.35], true, (l) => {
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1], marcasY: [1] });
          l.poli(arco(0, 0, 1, 0, P / 2, 60), { clase: 'c' });
          l.flecha([Math.cos(0.5), Math.sin(0.5)], [Math.cos(0.74), Math.sin(0.74)], { clase: 'c' });
        }),
        celda('(b) y = x³', [-0.3, 2.3], [-0.9, 8.8], false, (l) => {
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, 2], marcasY: [8] });
          l.curva((x) => x ** 3, [0, 2], { clase: 'c', n: 70 });
          l.flecha([1.3, 2.197], [1.55, 3.724], { clase: 'c' });
          l.punto(2, 8, { clase: 'o', r: 3.4 });
        }),
        celda('(c) y = x²', [-0.25, 1.35], [-0.25, 1.35], true, (l) => {
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1], marcasY: [1] });
          l.curva((x) => x * x, [0, 1], { clase: 'c', n: 60 });
          l.flecha([0.55, 0.3025], [0.75, 0.5625], { clase: 'c' });
          l.punto(1, 1, { clase: 'o', r: 3.4 });
        }),
        celda('(d) y = ln x', [-0.2, 2.95], [-0.3, 1.35], false, (l) => {
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [1, [Math.E, 'e']], marcasY: [1] });
          l.curva((x) => Math.log(x), [1, Math.E], { clase: 'c', n: 70 });
          l.flecha([1.6, Math.log(1.6)], [1.9, Math.log(1.9)], { clase: 'c' });
          l.punto(Math.E, 1, { clase: 'o', r: 3.4 });
        }),
        celda('(e) cuarto de elipse', [-0.3, 2.05], [-0.3, 1.45], true, (l) => {
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [[1.7, 'a']], marcasY: [[1, 'b']] });
          l.poli(param((t) => [1.7 * Math.cos(t), Math.sin(t)], 0, P / 2, 60), { clase: 'c' });
          l.flecha([1.7 * Math.cos(0.5), Math.sin(0.5)], [1.7 * Math.cos(0.74), Math.sin(0.74)], { clase: 'c' });
        }),
        celda('(g) semicircunf.', [-1.35, 1.35], [-0.35, 1.35], true, (l) => {
          l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [-1, 1] });
          l.poli(arco(0, 0, 1, 0, P, 70), { clase: 'c' });
          l.flecha([Math.cos(0.45), Math.sin(0.45)], [Math.cos(0.7), Math.sin(0.7)], { clase: 'c' });
        }),
      ],
    });
  });

/* ── 6 · cuatro integrales respecto al arco ──────────────────────────── */

fig('cuatro-integrales-respecto-al-arco',
  'Las cuatro curvas sobre las que se integra respecto de dl. Aquí no hay sentido que valga: la integral respecto a la longitud de arco no cambia de signo al recorrer la curva al revés, y esa es la diferencia con todas las demás del tema.',
  () => {
    const p3 = vista3d({ escalaXY: 2.4, inclinacion: 0.4 });
    const K = 2.0;
    return mosaico({
      id: 'f-cuatro-arco',
      columnas: 2,
      ancho: 190,
      alto: 168,
      titulo: 'Las cuatro curvas de las integrales respecto a la longitud de arco',
      desc: 'Cuatro recuadros. En el primero, el segmento de la recta y igual a x desde el '
        + 'origen hasta el punto dos coma dos. En el segundo, el cuarto de circunferencia de '
        + 'radio R del primer cuadrante. En el tercero, la circunferencia entera de radio R. En '
        + 'el cuarto, una vista en perspectiva de una hélice que da vuelta y media mientras '
        + 'sube, con el eje vertical comprimido para que quepa y la proyección circular '
        + 'dibujada abajo con trazo discontinuo.',
      celdas: [
        {
          etiqueta: '(a) y = x hasta (2,2)',
          x: [-0.35, 2.45], y: [-0.35, 2.45], cuadrado: true,
          dibuja: (l) => {
            l.ejes({ nombreX: 'x', nombreY: 'y', marcasX: [2], marcasY: [2] });
            l.poli([[0, 0], [2, 2]], { clase: 'c' });
            l.punto(0, 0, { clase: 'o', r: 3.6 });
            l.punto(2, 2, { clase: 'o', r: 3.6 });
          },
        },
        {
          etiqueta: '(b) cuarto de circ.',
          x: [-0.3, 1.4], y: [-0.3, 1.4], cuadrado: true,
          dibuja: (l) => {
            l.ejes({ nombreX: 'x', nombreY: 'y' });
            l.poli(arco(0, 0, 1, 0, P / 2, 60), { clase: 'c' });
            l.rotulo(Math.cos(0.5), Math.sin(0.5), 'R', { dx: 6, dy: -3 });
          },
        },
        {
          etiqueta: '(c) la circunferencia',
          x: [-1.45, 1.45], y: [-1.45, 1.45], cuadrado: true,
          dibuja: (l) => {
            l.ejes({ nombreX: 'x', nombreY: 'y' });
            l.circunferencia(0, 0, 1, { clase: 'c' });
            l.rotulo(Math.cos(-0.7), Math.sin(-0.7), 'R', { dx: 6, dy: 5 });
          },
        },
        {
          etiqueta: '(d) la hélice',
          x: [-5.0, 5.0], y: [-1.5, 7.6], cuadrado: false,
          dibuja: (l) => {
            l.poli(p3.aro(0, 1), { clase: 'g' });
            l.poli([p3(0, 0, 0), p3(0, 0, (4 * P) / K + 0.7)], { clase: 'eje' });
            l.poli([p3(0, 0, 0), p3(1.7, 0, 0)], { clase: 'eje' });
            l.poli([p3(0, 0, 0), p3(0, 1.7, 0)], { clase: 'eje' });
            l.poli(param((t) => p3(Math.sin(3 * t), Math.cos(3 * t), (4 * t) / K), 0, P, 240), { clase: 'c' });
            l.rotulo(...p3(0, 0, (4 * P) / K + 0.7), 'z', { dx: 4, dy: 2, color: 'var(--faint)', pequeno: true });
            l.rotulo(...p3(1.7, 0, 0), 'x', { dx: 3, dy: 9, color: 'var(--faint)', pequeno: true });
            l.rotulo(...p3(0, 1.7, 0), 'y', { dx: -9, dy: 9, color: 'var(--faint)', pequeno: true });
          },
        },
      ],
    });
  });

/* ── a pegar ─────────────────────────────────────────────────────────── */
for (const f of figuras) f.svg = f.hacer();

if (process.argv[1]?.endsWith('calculo-practica-t08-apartados.mjs')) {
  for (const f of figuras) pegaEnCampo(f.fichero, f.id, f.campo, f.svg, f.pie);
  console.log(`${figuras.length} mosaicos pegados en ${FICHERO}`);
}
