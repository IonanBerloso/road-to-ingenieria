/**
 * Media vuelta de una pieza alrededor del eje vertical, para sacar con el
 * motor una vista que no calcula: el PERFIL DERECHO.
 *
 * El motor da el alzado, la planta y el perfil izquierdo del sistema
 * europeo (`proyeccion.ts`). Algunas claves del material dibujan el perfil
 * derecho, a la izquierda del alzado (NyV p. 22, pieza 4). El perfil
 * derecho de una pieza es el perfil izquierdo de la misma pieza girada 180°
 * alrededor de z, y con las mismas coordenadas del papel: el izquierdo mira
 * desde las x negativas con u = −y, y en la pieza girada eso es mirar desde
 * las x positivas de la de verdad con u = +y, que es el perfil derecho.
 *
 * Prueba de utilidad (§13): para quien coteja o compara con su clave una
 * pieza cuyo material dibuja el perfil derecho (`pieza-sobre-pdf.mjs
 * --derecho`, `tests/vistas/claves.test.ts`); gana poder comparar esa vista
 * en vez de dejarla fuera; y se comprueba en `tests/vistas/gira.test.ts`:
 * dos medias vueltas son la pieza, y un taladro ciego que entra por la
 * derecha se ve en el perfil derecho y va oculto en el izquierdo.
 *
 * La media vuelta es (x, y, z) → (−x, −y, z), y se aplica a cada cosa
 * escrita: las cajas cambian de esquinas, los polígonos de signo, los
 * intervalos `desde`/`hasta` a lo largo de x o de y se dan la vuelta (y los
 * radios de un cono con ellos), y un giro alrededor de x o de y cambia de
 * sentido. No toca el motor: devuelve otra pieza declarada.
 */
import type { Eje, Giro, PiezaDeclarada, SolidoDeclarado } from './pieza.ts';
import type { V3 } from './vector.ts';

const punto = (p: V3): V3 => [-p[0], -p[1], p[2]];
/** Un número que cambia de signo con la media vuelta si va a lo largo de x
 *  o de y. */
const cambia = (eje: Eje) => eje !== 'z';
const intervalo = (eje: Eje, desde: number, hasta: number): [number, number] => (cambia(eje) ? [-hasta, -desde] : [desde, hasta]);
/** El centro de algo con eje: las otras dos coordenadas, en orden. */
const centro = (eje: Eje, c: readonly [number, number]): [number, number] => {
  if (eje === 'z') return [-c[0], -c[1]]; // (x, y)
  return [-c[0], c[1]]; // eje x: (y, z); eje y: (x, z)
};

function giro(g: Giro | undefined): Giro | undefined {
  if (!g) return undefined;
  /* Girar alrededor de z conmuta con la media vuelta; alrededor de x o de
     y, el eje se da la vuelta y el giro cambia de sentido. */
  return { eje: g.eje, grados: g.eje === 'z' ? g.grados : -g.grados, ...(g.por ? { por: punto(g.por) } : {}) };
}

function solido(s: SolidoDeclarado): SolidoDeclarado {
  const comun = { nombre: s.nombre, ...(s.gira ? { gira: giro(s.gira) } : {}), ...(s.dentro !== undefined ? { dentro: s.dentro } : {}) };
  if ('suma' in s) {
    return {
      ...comun,
      suma: s.suma.map(solido),
      ...(s.resta ? { resta: s.resta.map(solido) } : {}),
      ...(s.interseca ? { interseca: s.interseca.map(solido) } : {}),
    };
  }
  if ('caja' in s) {
    const [x0, x1, y0, y1, z0, z1] = s.caja;
    return { ...comun, caja: [-x1, -x0, -y1, -y0, z0, z1] };
  }
  if ('prisma' in s) {
    const { plano, poligono, desde, hasta } = s.prisma;
    /* xy: (x, y) cambian los dos; xz: cambia x y la extrusión, por y; yz:
       cambia y y la extrusión, por x. */
    const pol = poligono.map(([a, b]) => (plano === 'xy' ? [-a, -b] : [-a, b]) as [number, number]);
    const [d, h] = plano === 'xy' ? [desde, hasta] : [-hasta, -desde];
    return { ...comun, prisma: { plano, poligono: pol, desde: d, hasta: h } };
  }
  if ('cilindro' in s) {
    const { eje, r, desde, hasta } = s.cilindro;
    const c = { eje, centro: centro(eje, s.cilindro.centro), r };
    if (desde === undefined || hasta === undefined) return { ...comun, cilindro: c };
    const [d, h] = intervalo(eje, desde, hasta);
    return { ...comun, cilindro: { ...c, desde: d, hasta: h } };
  }
  if ('cono' in s) {
    const { eje, r0, r1, desde, hasta } = s.cono;
    const [d, h] = intervalo(eje, desde, hasta);
    /* Si el intervalo se da la vuelta, el radio de `desde` es el de antes en
       `hasta`. */
    const [a, b] = cambia(eje) ? [r1, r0] : [r0, r1];
    return { ...comun, cono: { eje, centro: centro(eje, s.cono.centro), r0: a, r1: b, desde: d, hasta: h } };
  }
  return { ...comun, semiespacio: { normal: punto(s.semiespacio.normal), pasa: punto(s.semiespacio.pasa) } };
}

/** La pieza con media vuelta alrededor de z. El código no cambia. */
export function mediaVuelta(d: PiezaDeclarada): PiezaDeclarada {
  return {
    ...d,
    suma: d.suma.map(solido),
    ...(d.resta ? { resta: d.resta.map(solido) } : {}),
    ...(d.interseca ? { interseca: d.interseca.map(solido) } : {}),
    ...(d.simetria ? { simetria: d.simetria.map((s) => ({ plano: s.plano, en: s.plano === 'z' ? s.en : -s.en })) } : {}),
  };
}
