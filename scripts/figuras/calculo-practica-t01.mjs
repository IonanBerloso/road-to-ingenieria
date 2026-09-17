/**
 * La figura de práctica que le faltaba al tema 1.
 *
 * El rombo del que solo se conocen dos vértices opuestos es el único ejercicio
 * de geometría del boletín que seguía sin dibujo, y es justo el tipo de
 * problema donde el dibujo **es** el método: la diagonal conocida y su
 * perpendicular por el centro dan los otros dos vértices sin resolver ningún
 * sistema.
 *
 *     node scripts/figuras/calculo-practica-t01.mjs
 */

import { lienzo } from './lienzo.mjs';
import { pegaEnCampo } from './pegar.mjs';

const FICHERO = 'src/content/calculo/t01-complejos/ejercicios.yaml';

export const figuras = [];
const fig = (id, pie, hacer) => figuras.push({ fichero: FICHERO, id, campo: 'resolucion', pie, hacer });

fig('rombo-diagonales',
  'La diagonal conocida mide 5 y la otra 10. Girando su mitad noventa grados desde el centro salen los dos vértices que faltan: 1+4,5i y 7−3,5i.',
  () => {
    const z1 = [2, -1];
    const z2 = [6, 2];
    const c = [(z1[0] + z2[0]) / 2, (z1[1] + z2[1]) / 2];
    /* La diagonal conocida es (4,3), de módulo 5; la otra mide 10, así que su
       mitad es 5 en la dirección perpendicular unitaria (−3,4)/5. */
    const z3 = [c[0] - 3, c[1] + 4];
    const z4 = [c[0] + 3, c[1] - 4];
    const l = lienzo({
      id: 'f-pt1-rombo',
      ancho: 320, alto: 250,
      x: [-0.6, 8], y: [-4.6, 5.4], cuadrado: true,
      titulo: 'El rombo con sus dos diagonales, la conocida de longitud 5 y la otra de 10',
      desc: 'Los dos vértices dados, 2−i y 6+2i, están unidos por una diagonal de longitud cinco '
        + 'cuyo punto medio es (4 ; 0,5). La otra diagonal pasa por ese mismo punto, es '
        + 'perpendicular a la primera y mide el doble: diez. Sus extremos son los dos vértices '
        + 'que faltan, 1 más cuatro coma cinco i y siete menos tres coma cinco i. Las cuatro '
        + 'lados del rombo cierran la figura.',
    });
    l.poli([z1, z3, z2, z4], { clase: 'f', cerrar: true });
    l.ejes({ marcasX: [2, 6], marcasY: [2, -1] });
    l.poli([z1, z3, z2, z4], { clase: 'c', cerrar: true });
    l.poli([z1, z2], { clase: 'cp2' });
    l.poli([z3, z4], { clase: 'cp2' });
    for (const v of [z1, z2]) l.punto(...v, { clase: 'o', r: 4.4 });
    for (const v of [z3, z4]) l.punto(...v, { r: 4.4 });
    l.punto(...c, { r: 3.2 });
    l.rotulo(...z1, 'z₁ = 2−i', { dx: 7, dy: 13, color: 'var(--flag)' });
    l.rotulo(...z2, 'z₂ = 6+2i', { dx: 6, dy: -6, color: 'var(--flag)' });
    l.rotulo(...z3, '1 + 4,5i', { dx: 6, dy: -6 });
    l.rotulo(...z4, '7 − 3,5i', { dx: -6, dy: 14, anclaje: 'end' });
    l.rotulo(...c, 'centro', { dx: -7, dy: -6, anclaje: 'end', color: 'var(--faint)', pequeno: true });
    return l.svg();
  });

/* ── a pegar ─────────────────────────────────────────────────────────── */
for (const f of figuras) f.svg = f.hacer();

if (process.argv[1]?.endsWith('calculo-practica-t01.mjs')) {
  for (const f of figuras) pegaEnCampo(f.fichero, f.id, f.campo, f.svg, f.pie);
  console.log(`${figuras.length} figura(s) de práctica pegada(s) en ${FICHERO}`);
}
