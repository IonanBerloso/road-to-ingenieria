/**
 * Las figuras de las prácticas del tema 7 que son sólidos del espacio.
 *
 * Aquí está la mitad más cara del tema: «el volumen limitado por el elipsoide
 * y el cono», «cuánta esfera recorta el cilindro», «el cono truncado por un
 * cilindro». Todos son intersecciones de dos superficies, y en una
 * intersección lo único difícil es saber **qué manda arriba y qué manda
 * abajo**, que es exactamente lo que se ve en el dibujo y no en la ecuación.
 *
 * Todos van en la misma isometría que los sólidos del resto del tema, para
 * que se lean con el mismo ojo.
 *
 *     node scripts/figuras/calculo-practica-t07-solidos.mjs
 */

import { lienzo, mosaico, vista3d } from './lienzo.mjs';
import { pegaEnCampo } from './pegar.mjs';

export const FICHERO = 'src/content/calculo/t07-integral-multiple/ejercicios.yaml';

export const figuras = [];
const fig = (id, pie, hacer) =>
  figuras.push({ fichero: FICHERO, id, campo: 'resolucion', pie, hacer });

const P = Math.PI;
const param = (f, a, b, n = 120) =>
  Array.from({ length: n + 1 }, (_, k) => f(a + ((b - a) * k) / n));

/** Los tres ejes de la isometría, con sus nombres. */
const ejes3d = (l, p3, lx, ly, lz) => {
  l.poli([p3(0, 0, 0), p3(lx, 0, 0)], { clase: 'eje' });
  l.poli([p3(0, 0, 0), p3(0, ly, 0)], { clase: 'eje' });
  l.poli([p3(0, 0, 0), p3(0, 0, lz)], { clase: 'eje' });
  l.rotulo(...p3(lx, 0, 0), 'x', { dx: 4, dy: 10, color: 'var(--faint)', pequeno: true });
  l.rotulo(...p3(0, ly, 0), 'y', { dx: -9, dy: 10, color: 'var(--faint)', pequeno: true });
  l.rotulo(...p3(0, 0, lz), 'z', { dx: 5, dy: 2, color: 'var(--faint)', pequeno: true });
};

/* ── 1 · la ventana de Viviani ───────────────────────────────────────── */

fig('area-de-la-ventana-de-viviani',
  'El cilindro pasa por el centro de la esfera y es tangente a ella por dentro: su base es la circunferencia de diámetro R apoyada en el origen. La ventana que recorta es la parte de esfera que queda encima de ese círculo, y su proyección es justo ρ = R·cos θ.',
  () => {
    const p3 = vista3d({ escalaXY: 0.95, inclinacion: 0.45 });
    const R = 2;
    const l = lienzo({
      id: 'f-ventana-viviani',
      ancho: 330, alto: 275,
      x: [-4.4, 4.4], y: [-2.6, 4.6], cuadrado: false,
      titulo: 'La esfera con el cilindro que la atraviesa recortando la ventana de Viviani',
      desc: 'Una esfera vista en perspectiva, con su ecuador y su contorno dibujados. '
        + 'Atravesándola verticalmente hay un cilindro más estrecho, cuya base es una '
        + 'circunferencia que pasa por el centro de la esfera y es tangente a ella por el lado '
        + 'derecho; la base está dibujada sobre el plano del suelo, sombreada. La curva por la '
        + 'que el cilindro corta a la superficie de la esfera se dibuja con trazo grueso: es la '
        + 'ventana, y tiene forma de ocho tumbado visto de lado.',
    });
    /* La esfera se dibuja con dos meridianos y el ecuador, que es la
       convención del resto de sólidos del tema. Un contorno elíptico trazado
       en coordenadas de pantalla se vería plano: parecería un disco. */
    l.poli(param((t) => p3(R * Math.cos(t), R * Math.sin(t), 0), 0, 2 * P, 120), { clase: 'g', cerrar: true });
    for (const th of [0, P / 2]) {
      l.poli(param((f) => p3(R * Math.sin(f) * Math.cos(th), R * Math.sin(f) * Math.sin(th), R * Math.cos(f)), 0, 2 * P, 110), { clase: 'c' });
    }
    /* El cilindro: base ρ = R cos θ, es decir el círculo de centro (R/2,0). */
    const base = param((t) => p3(R / 2 + (R / 2) * Math.cos(t), (R / 2) * Math.sin(t), 0), 0, 2 * P, 100);
    l.poli(base, { clase: 'f', cerrar: true });
    l.poli(base, { clase: 'cp2', cerrar: true });
    const ventana = (signo) => param((t) => {
      const x = R / 2 + (R / 2) * Math.cos(t), y = (R / 2) * Math.sin(t);
      const z = signo * Math.sqrt(Math.max(0, R * R - x * x - y * y));
      return p3(x, y, z);
    }, 0, 2 * P, 160);
    l.poli(ventana(1), { clase: 'c2', cerrar: true });
    for (const t of [0.6, 2.4, 3.9, 5.5]) {
      const x = R / 2 + (R / 2) * Math.cos(t), y = (R / 2) * Math.sin(t);
      const z = Math.sqrt(Math.max(0, R * R - x * x - y * y));
      l.poli([p3(x, y, 0), p3(x, y, z)], { clase: 'g' });
    }
    ejes3d(l, p3, 3.1, 3.1, 3.2);
    l.rotulo(...p3(R / 2, 0, 0), 'ρ = R cos θ', { dx: 0, dy: 16, anclaje: 'middle', color: 'var(--alt)', pequeno: true });
    l.esquina(10, 17, 'la ventana: el corte de los dos');
    return l.svg();
  });

/* ── 2 · un elipsoide recortado por un cono ──────────────────────────── */

fig('elipsoide-cortado-por-cono',
  'Las dos condiciones se cortan donde el elipsoide y el cono coinciden, y ahí sale z = c: el corte es una elipse horizontal a esa altura. Por debajo manda el cono y por encima, el elipsoide. Ese reparto es lo que decide los límites de la integral.',
  () => {
    const p3 = vista3d({ escalaXY: 0.95, inclinacion: 0.45 });
    const a = 2, b = 1.4, c = 1.6;
    const l = lienzo({
      id: 'f-elipsoide-cono',
      ancho: 330, alto: 280,
      x: [-4.4, 4.4], y: [-2.2, 5.6], cuadrado: false,
      titulo: 'El elipsoide y el cono que lo recorta, cortándose a la altura c',
      desc: 'Una superficie con forma de cuenco invertido, el elipsoide, y dentro de ella un '
        + 'cono que sale del origen abriéndose hacia arriba. Las dos se cortan en una elipse '
        + 'horizontal dibujada con trazo grueso y sombreada, situada a la altura c. Por debajo '
        + 'de esa altura el sólido está limitado por el cono y por encima, por el elipsoide. Los '
        + 'tres ejes salen del origen. Una línea de puntos marca la altura del corte sobre el '
        + 'eje vertical.',
    });
    const zc = c;
    const rc = Math.sqrt(2 - (zc * zc) / (c * c));
    const aro = (z, k) => param((t) => p3(a * k * Math.cos(t), b * k * Math.sin(t), z), 0, 2 * P, 100);
    /* Elipsoide (x/a)²+(y/b)²+(z/c)² = 2: en cada z el corte tiene k=√(2−z²/c²). */
    for (const z of [0.6, 1.1, zc]) l.poli(aro(z, Math.sqrt(2 - (z * z) / (c * c))), { clase: 'g', cerrar: true });
    l.poli(param((t) => p3(a * Math.SQRT2 * Math.cos(t), b * Math.SQRT2 * Math.sin(t), 0), 0, 2 * P, 100), { clase: 'g', cerrar: true });
    const perfil = (theta) => param((z) => {
      const k = Math.sqrt(Math.max(0, 2 - (z * z) / (c * c)));
      return p3(a * k * Math.cos(theta), b * k * Math.sin(theta), z);
    }, 0, c * Math.SQRT2, 60);
    for (const th of [0, P / 2, P, (3 * P) / 2]) l.poli(perfil(th), { clase: 'c' });
    /* El cono (x/a)²+(y/b)² = (z/c)²: en cada z, k = z/c. */
    for (const th of [0, P / 2, P, (3 * P) / 2]) {
      l.poli(param((z) => p3((a * z * Math.cos(th)) / c, (b * z * Math.sin(th)) / c, z), 0, zc, 30), { clase: 'c2' });
    }
    l.poli(aro(zc, rc), { clase: 'f', cerrar: true });
    l.poli(aro(zc, rc), { clase: 'c2', cerrar: true });
    ejes3d(l, p3, 3.4, 3.4, c * Math.SQRT2 + 0.7);
    l.rotulo(...p3(0, 0, zc), 'z = c', { dx: -7, dy: 2, anclaje: 'end', color: 'var(--flag)' });
    l.esquina(10, 17, 'debajo el cono, encima el elipsoide');
    return l.svg();
  });

/* ── 3 · el octante del elipsoide ────────────────────────────────────── */

fig('centro-de-gravedad-del-octante-del-elipsoide',
  'Un octavo de elipsoide, el del primer octante. Por simetría de las tres direcciones, el centro de gravedad tiene la misma forma en las tres coordenadas: cada una vale ⅜ del semieje correspondiente. Basta calcular una y las otras salen por analogía.',
  () => {
    const p3 = vista3d({ escalaXY: 1.0, inclinacion: 0.48 });
    const a = 2.4, b = 1.7, c = 2;
    const l = lienzo({
      id: 'f-octante-elipsoide',
      ancho: 320, alto: 275,
      x: [-3.4, 3.4], y: [-1.2, 5.2], cuadrado: false,
      titulo: 'El octavo de elipsoide que queda en el primer octante',
      desc: 'Un trozo de elipsoide con forma de gajo, limitado por tres caras planas —los tres '
        + 'planos coordenados— y una superficie curva por fuera. Está apoyado en el origen y '
        + 'ocupa el octante donde las tres coordenadas son positivas. Las tres caras planas '
        + 'están sombreadas y los tres cuartos de elipse que las bordean, dibujados con trazo '
        + 'grueso. Dentro hay un punto marcado: el centro de gravedad, que queda a tres octavos '
        + 'de cada semieje.',
    });
    const cuarto = (f, n = 40) => param(f, 0, P / 2, n);
    const caraXY = cuarto((t) => p3(a * Math.cos(t), b * Math.sin(t), 0));
    const caraXZ = cuarto((t) => p3(a * Math.cos(t), 0, c * Math.sin(t)));
    const caraYZ = cuarto((t) => p3(0, b * Math.cos(t), c * Math.sin(t)));
    l.poli([p3(0, 0, 0), ...caraXY], { clase: 'f', cerrar: true });
    l.poli([p3(0, 0, 0), ...caraXZ], { clase: 'f', cerrar: true });
    l.poli([p3(0, 0, 0), ...caraYZ], { clase: 'f2', cerrar: true });
    for (const cara of [caraXY, caraXZ, caraYZ]) l.poli(cara, { clase: 'c' });
    for (const th of [0.5, 1.05]) {
      l.poli(param((f) => p3(a * Math.sin(f) * Math.cos(th), b * Math.sin(f) * Math.sin(th), c * Math.cos(f)), 0, P / 2, 40), { clase: 'g' });
    }
    ejes3d(l, p3, a + 0.8, b + 0.9, c + 0.8);
    l.punto(...p3((3 * a) / 8, (3 * b) / 8, (3 * c) / 8), { clase: 'o', r: 4.8 });
    l.rotulo(...p3((3 * a) / 8, (3 * b) / 8, (3 * c) / 8), 'G', { dx: 8, dy: 4, color: 'var(--flag)' });
    l.esquina(10, 17, 'G = (3a/8, 3b/8, 3c/8)');
    return l.svg();
  });

/* ── 4 · la inercia del elipsoide ────────────────────────────────────── */

fig('inercia-del-elipsoide-respecto-a-ox',
  'El truco es estirar: con x = au, y = bv, z = cw el elipsoide se convierte en la bola unidad, cuyo momento de inercia se sabe. El jacobiano es abc, constante, así que sale fuera y lo único que queda es deshacer el estiramiento en el integrando.',
  () => {
    const p3 = vista3d({ escalaXY: 0.9, inclinacion: 0.45 });
    const celda = (etiqueta, a, b, c, nota) => ({
      etiqueta,
      x: [-3.6, 3.6], y: [-1.6, 4.2], cuadrado: false,
      dibuja: (l) => {
        for (const th of [0, P / 2]) {
          l.poli(param((f) => p3(a * Math.sin(f) * Math.cos(th), b * Math.sin(f) * Math.sin(th), c * Math.cos(f)), 0, 2 * P, 100), { clase: 'c' });
        }
        l.poli(param((t) => p3(a * Math.cos(t), b * Math.sin(t), 0), 0, 2 * P, 100), { clase: 'cp2', cerrar: true });
        ejes3d(l, p3, a + 0.7, b + 0.8, c + 0.7);
        l.esquina(6, 13, nota);
      },
    });
    return mosaico({
      id: 'f-inercia-elipsoide',
      columnas: 2,
      ancho: 210,
      alto: 195,
      titulo: 'El elipsoide y la bola en la que se convierte al estirar los ejes',
      desc: 'Dos recuadros en perspectiva. En el primero, un elipsoide dibujado con dos '
        + 'meridianos y su ecuador, más ancho que alto. En el segundo, una esfera de radio uno '
        + 'dibujada igual: es en lo que se convierte el elipsoide al dividir cada coordenada por '
        + 'su semieje. Bajo cada uno está escrito lo que aporta: el elipsoide es el cuerpo del '
        + 'problema y la bola, el que tiene la inercia conocida.',
      celdas: [
        celda('el elipsoide', 2.4, 1.5, 1.1, 'lo que hay'),
        celda('la bola unidad', 1.6, 1.6, 1.6, 'lo que se sabe'),
      ],
    });
  });

/* ── 5 · la semiesfera con densidad radial ───────────────────────────── */

fig('centro-de-gravedad-semiesfera-densidad-radial',
  'La densidad crece con la distancia al centro, así que el material pesado está en la corteza y no en el eje. Eso sube el centro de gravedad respecto del de una semiesfera homogénea: pasa de 3a/8 a 2a/5. Las capas del dibujo son las de densidad constante.',
  () => {
    const p3 = vista3d({ escalaXY: 1.0, inclinacion: 0.48 });
    const a = 2.4;
    const l = lienzo({
      id: 'f-semiesfera-densidad',
      ancho: 330, alto: 255,
      x: [-3.8, 3.8], y: [-1.4, 4.4], cuadrado: false,
      titulo: 'La semiesfera con sus capas de densidad constante y los dos centros de gravedad',
      desc: 'Media esfera apoyada en el plano del suelo por su cara plana, vista en perspectiva. '
        + 'Dentro se dibujan tres cascarones concéntricos con trazo fino: son las superficies '
        + 'donde la densidad es constante, y la densidad crece hacia fuera. Sobre el eje '
        + 'vertical hay dos puntos marcados: el más bajo es el centro de gravedad que tendría si '
        + 'fuera homogénea, a tres octavos del radio, y el más alto es el de verdad, a dos '
        + 'quintos, un poco por encima. El desplazamiento está señalado con una flecha corta.',
    });
    /* Media esfera: cada meridiano va del polo al ecuador, y hacen falta los
       cuatro para que se cierre la figura. Con f de 0 a π se dibujaría también
       la mitad de abajo, que aquí no existe. */
    const cascaron = (r, clase) => {
      for (const th of [0, P / 2, P, (3 * P) / 2]) {
        l.poli(param((f) => p3(r * Math.sin(f) * Math.cos(th), r * Math.sin(f) * Math.sin(th), r * Math.cos(f)), 0, P / 2, 40), { clase });
      }
      l.poli(param((t) => p3(r * Math.cos(t), r * Math.sin(t), 0), 0, 2 * P, 90), { clase, cerrar: true });
    };
    cascaron(a * 0.45, 'g');
    cascaron(a * 0.75, 'g');
    cascaron(a, 'c');
    ejes3d(l, p3, a + 0.8, a + 0.8, a + 0.8);
    l.punto(...p3(0, 0, (3 * a) / 8), { r: 3.8 });
    l.punto(...p3(0, 0, (2 * a) / 5), { clase: 'o', r: 4.8 });
    l.flecha(p3(0, 0, (3 * a) / 8), p3(0, 0, (2 * a) / 5), { clase: 'c2', color: 'var(--alt)', punta: 6 });
    l.rotulo(...p3(0, 0, (2 * a) / 5), 'G = 2a/5', { dx: 8, dy: -4, color: 'var(--flag)' });
    l.rotulo(...p3(0, 0, (3 * a) / 8), 'homogénea: 3a/8', { dx: -8, dy: 12, anclaje: 'end', color: 'var(--faint)', pequeno: true });
    return l.svg();
  });

/* ── 6 · tres triples en cartesianas ─────────────────────────────────── */

fig('tres-triples-en-cartesianas',
  'El sólido del apartado (b) es el tetraedro que el plano 3x+2y+z = 6 recorta en el primer octante: corta a los ejes en 2, 3 y 6. Con esos tres números los límites salen solos, y no hace falta más geometría que leer las tres intersecciones.',
  () => {
    const p3 = vista3d({ escalaXY: 1.05, inclinacion: 0.5 });
    const A = p3(2, 0, 0), B = p3(0, 3, 0), C = p3(0, 0, 6), O = p3(0, 0, 0);
    const l = lienzo({
      id: 'f-tetraedro-plano',
      ancho: 320, alto: 280,
      x: [-3.6, 3.6], y: [-1.2, 8], cuadrado: false,
      titulo: 'El tetraedro que el plano recorta en el primer octante',
      desc: 'Un tetraedro apoyado en el origen, con tres aristas sobre los ejes: una llega al dos '
        + 'sobre el eje x, otra al tres sobre el eje y y la tercera al seis sobre el eje z. La '
        + 'cara inclinada que une esos tres extremos es el plano del enunciado y está sombreada. '
        + 'Las dos caras verticales visibles también se sombrean, de otro tono. Los tres puntos '
        + 'de corte con los ejes están marcados y rotulados con su valor.',
    });
    l.poli([O, A, B], { clase: 'f2', cerrar: true });
    l.poli([O, A, C], { clase: 'f2', cerrar: true });
    l.poli([A, B, C], { clase: 'f', cerrar: true });
    l.poli([O, A, B], { clase: 'g', cerrar: true });
    l.poli([A, B, C], { clase: 'c', cerrar: true });
    l.poli([O, C], { clase: 'c' });
    l.poli([O, A], { clase: 'c' });
    l.poli([O, B], { clase: 'c' });
    ejes3d(l, p3, 3.1, 4, 7.2);
    for (const [pt, t] of [[A, '2'], [B, '3'], [C, '6']]) {
      l.punto(...pt, { clase: 'o', r: 4.4 });
      l.rotulo(...pt, t, { dx: 7, dy: 4, color: 'var(--flag)' });
    }
    l.esquina(10, 17, '3x + 2y + z = 6');
    return l.svg();
  });

/* ── 7 · tres triples en cilíndricas ─────────────────────────────────── */

fig('tres-triples-en-cilindricas',
  'El sólido de (a) es el hueco entre el paraboloide x²+y² = 3z y la tapa z = 3. El paraboloide sube abriéndose y la tapa lo corta en la circunferencia de radio 3: en cilíndricas eso es ρ de 0 a 3 y z de ρ²/3 a 3, dos límites que se leen del dibujo.',
  () => {
    const p3 = vista3d({ escalaXY: 0.85, inclinacion: 0.45 });
    const l = lienzo({
      id: 'f-paraboloide-con-tapa',
      ancho: 320, alto: 275,
      x: [-3.9, 3.9], y: [-1.4, 5.6], cuadrado: false,
      titulo: 'El paraboloide cortado por el plano z igual a tres',
      desc: 'Un paraboloide con forma de copa sale del origen abriéndose hacia arriba. A la '
        + 'altura tres lo corta un plano horizontal, y el corte es una circunferencia de radio '
        + 'tres, dibujada con trazo grueso y con el disco que encierra sombreado: es la tapa. El '
        + 'sólido del ejercicio es lo que queda entre la copa y la tapa. Dos meridianos de la '
        + 'copa se dibujan con trazo grueso y varios aros horizontales con trazo fino, para que '
        + 'se vea cómo se va abriendo.',
    });
    const R = 3, H = 3;
    const aro = (z) => param((t) => {
      const r = Math.sqrt(3 * z);
      return p3(r * Math.cos(t), r * Math.sin(t), z);
    }, 0, 2 * P, 90);
    for (const z of [0.6, 1.4, 2.2]) l.poli(aro(z), { clase: 'g', cerrar: true });
    l.poli(aro(H), { clase: 'f', cerrar: true });
    l.poli(aro(H), { clase: 'c2', cerrar: true });
    for (const th of [0, P / 2, P, (3 * P) / 2]) {
      l.poli(param((z) => {
        const r = Math.sqrt(3 * z);
        return p3(r * Math.cos(th), r * Math.sin(th), z);
      }, 0, H, 40), { clase: 'c' });
    }
    ejes3d(l, p3, R + 0.9, R + 0.9, H + 1.2);
    l.rotulo(...p3(R, 0, H), 'ρ = 3', { dx: 6, dy: -4, color: 'var(--alt)' });
    l.rotulo(...p3(0, 0, H), 'z = 3', { dx: -7, dy: 2, anclaje: 'end', color: 'var(--flag)' });
    l.esquina(10, 17, 'z va de ρ²/3 a 3');
    return l.svg();
  });

/* ── 8 · tres triples en esféricas ───────────────────────────────────── */

fig('tres-triples-en-esfericas',
  'La bola entera y el octante de bola, que son los dos recintos de los apartados. En esféricas la bola entera es el rectángulo r∈[0,5], φ∈[0,π], θ∈[0,2π], y el octante es el mismo con los dos ángulos partidos por la mitad: límites constantes en los dos casos.',
  () => {
    const p3 = vista3d({ escalaXY: 0.95, inclinacion: 0.48 });
    const bola = (l, R, entera) => {
      const lim = entera ? 2 * P : P / 2;
      for (const th of entera ? [0, P / 2] : [0, P / 2]) {
        l.poli(param((f) => p3(R * Math.sin(f) * Math.cos(th), R * Math.sin(f) * Math.sin(th), R * Math.cos(f)), 0, entera ? 2 * P : P / 2, 70), { clase: 'c' });
      }
      l.poli(param((t) => p3(R * Math.cos(t), R * Math.sin(t), 0), 0, lim, 80), { clase: 'cp2', cerrar: entera });
    };
    return mosaico({
      id: 'f-esfericas-dos-recintos',
      columnas: 2,
      ancho: 205,
      alto: 195,
      titulo: 'La bola entera y el octante de bola',
      desc: 'Dos recuadros en perspectiva. En el primero, una esfera completa dibujada con dos '
        + 'meridianos y su ecuador. En el segundo, un octavo de esfera: un gajo apoyado en el '
        + 'origen y limitado por los tres planos coordenados, con las caras planas sombreadas. '
        + 'Bajo cada uno están escritos los tres intervalos que le corresponden en coordenadas '
        + 'esféricas, y en los dos casos son intervalos de extremos constantes.',
      celdas: [
        {
          etiqueta: 'la bola: r ≤ 5',
          x: [-3.6, 3.6], y: [-2.2, 4.2], cuadrado: false,
          dibuja: (l) => {
            bola(l, 2.2, true);
            ejes3d(l, p3, 3, 3, 3);
            l.esquina(6, 13, 'φ: 0→π, θ: 0→2π');
          },
        },
        {
          etiqueta: 'el octante',
          x: [-3.6, 3.6], y: [-1.2, 4.6], cuadrado: false,
          dibuja: (l) => {
            const R = 2.2;
            const cuarto = (f) => param(f, 0, P / 2, 40);
            const cXY = cuarto((t) => p3(R * Math.cos(t), R * Math.sin(t), 0));
            const cXZ = cuarto((t) => p3(R * Math.cos(t), 0, R * Math.sin(t)));
            const cYZ = cuarto((t) => p3(0, R * Math.cos(t), R * Math.sin(t)));
            l.poli([p3(0, 0, 0), ...cXY], { clase: 'f', cerrar: true });
            l.poli([p3(0, 0, 0), ...cXZ], { clase: 'f2', cerrar: true });
            l.poli([p3(0, 0, 0), ...cYZ], { clase: 'f2', cerrar: true });
            for (const c of [cXY, cXZ, cYZ]) l.poli(c, { clase: 'c' });
            ejes3d(l, p3, 3, 3, 3);
            l.esquina(6, 13, 'φ: 0→π/2, θ: 0→π/2');
          },
        },
      ],
    });
  });

/* ── 9 · dos piezas con densidad cuadrática ──────────────────────────── */

fig('dos-piezas-con-densidad-cuadratica',
  'La pieza es el cilindro al que se le ha quitado el cono de dentro, no el cono. Dibujarla es la mitad del ejercicio: en cuanto se ve que el hueco es un cono con el vértice abajo, los límites en cilíndricas son z de ρ a la altura del cilindro.',
  () => {
    const p3 = vista3d({ escalaXY: 0.95, inclinacion: 0.45 });
    const R = 2, H = 2;
    const l = lienzo({
      id: 'f-cilindro-menos-cono',
      ancho: 330, alto: 265,
      x: [-3.9, 3.9], y: [-1.6, 4.8], cuadrado: false,
      titulo: 'El cilindro con el cono vaciado por dentro',
      desc: 'Un cilindro vertical dibujado con sus dos tapas circulares y sus generatrices '
        + 'laterales. Dentro, saliendo del centro de la base y abriéndose hacia arriba hasta '
        + 'tocar el borde de la tapa, hay un cono dibujado con trazo de otro color: es el hueco. '
        + 'La pieza es el cilindro menos ese cono, es decir, la parte que queda por fuera del '
        + 'cono, que está sombreada en el corte. Los aros del cono se dibujan finos para que se '
        + 'vea cómo se ensancha.',
    });
    const aro = (r, z, clase, cerrar = true) =>
      l.poli(param((t) => p3(r * Math.cos(t), r * Math.sin(t), z), 0, 2 * P, 90), { clase, cerrar });
    aro(R, 0, 'g');
    aro(R, H, 'c');
    for (const th of [0, P]) l.poli([p3(R * Math.cos(th), R * Math.sin(th), 0), p3(R * Math.cos(th), R * Math.sin(th), H)], { clase: 'c' });
    for (const z of [0.7, 1.35]) aro(z, z, 'g');
    for (const th of [0, P / 2, P, (3 * P) / 2]) {
      l.poli([p3(0, 0, 0), p3(H * Math.cos(th), H * Math.sin(th), H)], { clase: 'c2' });
    }
    aro(H, H, 'c2');
    ejes3d(l, p3, R + 0.9, R + 0.9, H + 1.3);
    l.rotulo(...p3(0, 0, 0), 'vértice del cono', { dx: 8, dy: 14, color: 'var(--alt)', pequeno: true });
    l.esquina(10, 17, 'la pieza es lo de fuera del cono');
    return l.svg();
  });

/* ── 10 · el cono truncado por un cilindro ───────────────────────────── */

fig('el-cono-truncado-por-un-cilindro',
  'El cono x²+y² = (z−6)² tiene el vértice arriba, en z = 6, y se abre hacia abajo. El cilindro de radio 4 lo corta a la altura z = 2: por debajo manda el cilindro y por encima, el cono. El sólido es un cubo de helado al revés, y el corte está en esa altura.',
  () => {
    const p3 = vista3d({ escalaXY: 0.82, inclinacion: 0.45 });
    const l = lienzo({
      id: 'f-cono-truncado-cilindro',
      ancho: 320, alto: 285,
      x: [-4.4, 4.4], y: [-1.6, 8.4], cuadrado: false,
      titulo: 'El cono con el vértice arriba y el cilindro que lo recorta por abajo',
      desc: 'Un cono con el vértice en la altura seis y abierto hacia abajo, y un cilindro '
        + 'vertical de radio cuatro que sube desde el suelo. Se cortan a la altura dos, en una '
        + 'circunferencia dibujada con trazo grueso y sombreada. Por debajo de esa altura la '
        + 'pared del sólido es la del cilindro, recta; por encima es la del cono, inclinada. Una '
        + 'línea de puntos horizontal marca la altura del corte sobre el eje vertical.',
    });
    const Rc = 4, zc = 2;
    const aro = (r, z, clase, cerrar = true) =>
      l.poli(param((t) => p3(r * Math.cos(t), r * Math.sin(t), z), 0, 2 * P, 90), { clase, cerrar });
    aro(Rc, 0, 'c');
    for (const th of [0, P]) l.poli([p3(Rc * Math.cos(th), Rc * Math.sin(th), 0), p3(Rc * Math.cos(th), Rc * Math.sin(th), zc)], { clase: 'c' });
    for (const th of [0, P]) l.poli([p3(Rc * Math.cos(th), Rc * Math.sin(th), zc), p3(0, 0, 6)], { clase: 'c' });
    for (const z of [3, 4, 5]) aro(6 - z, z, 'g');
    aro(Rc, zc, 'f');
    aro(Rc, zc, 'c2');
    ejes3d(l, p3, Rc + 1.2, Rc + 1.2, 7.4);
    l.punto(...p3(0, 0, 6), { clase: 'o', r: 4.4 });
    l.rotulo(...p3(0, 0, 6), 'vértice, z = 6', { dx: 7, dy: -4, color: 'var(--flag)' });
    l.rotulo(...p3(0, 0, zc), 'z = 2', { dx: -7, dy: 2, anclaje: 'end', color: 'var(--alt)' });
    l.esquina(10, 17, 'debajo el cilindro, encima el cono');
    return l.svg();
  });

/* ── a pegar ─────────────────────────────────────────────────────────── */
for (const f of figuras) f.svg = f.hacer();

if (process.argv[1]?.endsWith('calculo-practica-t07-solidos.mjs')) {
  for (const f of figuras) pegaEnCampo(f.fichero, f.id, f.campo, f.svg, f.pie);
  console.log(`${figuras.length} figuras de sólidos pegadas en ${FICHERO}`);
}
