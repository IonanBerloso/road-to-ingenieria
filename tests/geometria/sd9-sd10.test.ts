import { describe, expect, it } from 'vitest';
import {
  PT_MM,
  abatido,
  anguloConPH,
  anguloPlanoConPH,
  anguloPlanoConPV,
  cambioPlano,
  corteRectaPlano,
  distanciaARecta,
  pieEnRecta,
  plano,
  planoMediador,
  proyAlzado,
  proyPlanta,
  punto3,
  puntosADistancia,
  rectaDesdeProyecciones,
  rectaPorPuntos,
  simetrico,
  vm,
  vmAlzado,
  vmPlanta,
  type P2,
  type P3,
  type Recta2,
} from '../../src/lib/diedrico';

/* SD9 y SD10 · los Ejercicios 7 y 8 de la colección de diédrico directo
   (Dpto. de Expresión Gráfica y Proyectos de Ingeniería, EIG, UPV/EHU): el
   rombo con un lado horizontal y otro frontal, y su ángulo con el plano
   horizontal, y el triángulo equilátero con un vértice en A y el lado opuesto
   sobre la recta horizontal r. Las láminas son `src/content/laminas/sd9.json`,
   nuestra (la página no trae figura: la línea de tierra, el origen y A y C
   situados desde sus coordenadas, con el desplazamiento positivo hacia la
   izquierda del origen), y `sd10.json`, sacada de los trazos vectoriales del
   PDF.

   Las cifras esperadas se sacaron el 2 de octubre de 2026 por un segundo
   camino, sin lib/diedrico: álgebra de vectores sobre las coordenadas de las
   láminas. En SD9, B como la solución de la ecuación de primer grado AB = BC
   con B = (x, yC, zA); C abatido en la vertical de C₁; la mediatriz de A₁C₀
   con los cortes de dos circunferencias; la vista 4 como pie en la línea
   nueva más la cota sobre C. En SD10, el pie M de A en r, la altura AM y los
   vértices a AM/√3 de M sobre r; A abatido en la perpendicular a r₁, a la
   altura de M₁. Aquí se cotejan con lib/diedrico.

   Los puntos se comparan a 0,05 pt (0,02 mm); las longitudes, a la milésima de
   mm, y los ángulos, a la centésima de grado. */

const mm = (v: number) => v * PT_MM;
const d2 = (a: P2, b: P2) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const pl = (P: P3) => proyPlanta(P);
const al = (P: P3) => proyAlzado(P);
const cerca = (p: P2, x: number, y: number, tol = 0.05) => {
  expect(Math.abs(p[0] - x), `x ${p[0]} frente a ${x}`).toBeLessThanOrEqual(tol);
  expect(Math.abs(p[1] - y), `y ${p[1]} frente a ${y}`).toBeLessThanOrEqual(tol);
};
const recta2 = (a: P2, b: P2): Recta2 => ({ p: a, d: [b[0] - a[0], b[1] - a[1]] });

describe('SD9 · el rombo con un lado horizontal y otro frontal', () => {
  /* El origen y la línea de tierra de la lámina: O = (280; 330). */
  const O: P2 = [280, 330];
  const coord = (P: P3) => [mm(O[0] - P.x), mm(P.y - O[1]), mm(P.z + O[1])];
  const A = punto3([336.69, 131.57], [336.69, 443.39]);
  const C = punto3([166.61, 244.96], [166.61, 358.35]);
  /* l: la cota de A y el alejamiento de C, paralela a la línea de tierra */
  const LA = punto3([336.69, 131.57], [336.69, 358.35]);
  const LC = punto3([166.61, 131.57], [166.61, 358.35]);
  const l = rectaPorPuntos(LA, LC);
  const B = corteRectaPlano(l, planoMediador(A, C));
  const D = simetrico(B, { x: (A.x + C.x) / 2, y: (A.y + C.y) / 2, z: (A.z + C.z) / 2 });
  const rombo = plano(A, B, C);

  it('la lámina lee de vuelta las coordenadas del enunciado: A(-20,40,70) y C(40,10,30)', () => {
    const [ax, ay, az] = coord(A);
    const [cx, cy, cz] = coord(C);
    for (const [v, e] of [[ax, -20], [ay, 40], [az, 70], [cx, 40], [cy, 10], [cz, 30]] as const) expect(v).toBeCloseTo(e, 2);
  });

  it('B tiene la cota de A y el alejamiento de C, y AB = BC: el rombo de 46,73 mm de lado', () => {
    cerca(pl(B), 235.112, 358.35);
    cerca(al(B), 235.112, 131.57);
    expect(B.z).toBeCloseTo(A.z, 9);
    expect(B.y).toBeCloseTo(C.y, 9);
    expect(mm(vm(A, B))).toBeCloseTo(46.7345, 3);
    expect(mm(vm(B, C))).toBeCloseTo(46.7345, 3);
    const [bx, by, bz] = coord(B);
    expect(bx).toBeCloseTo(15.835, 2);
    expect(by).toBeCloseTo(10, 2);
    expect(bz).toBeCloseTo(70, 2);
  });

  it('D cierra el paralelogramo: AD frontal y CD horizontal', () => {
    cerca(pl(D), 268.188, 443.39);
    cerca(al(D), 268.188, 244.96);
    expect(D.y).toBeCloseTo(A.y, 9);
    expect(D.z).toBeCloseTo(C.z, 9);
    expect(mm(vm(C, D))).toBeCloseTo(46.7345, 3);
    expect(mm(vm(D, A))).toBeCloseTo(46.7345, 3);
  });

  it('B por abatimiento: C₀ en la vertical de C₁, 40 mm por debajo, y B₁ en la mediatriz de A₁C₀', () => {
    const frontal = plano(LA, LC, C);
    const [arriba, abajo] = abatido(C, l, frontal);
    cerca(pl(abajo), 166.61, 471.74);
    /* hacia arriba cae justo en C₂: 10 + 2·30 = 70 */
    cerca(pl(arriba), 166.61, 244.96);
    expect(mm(A.z - C.z)).toBeCloseTo(40, 2);
    expect(d2(pl(B), pl(A))).toBeCloseTo(d2(pl(B), pl(abajo)), 6);
    /* los cortes de la mediatriz con el compás abierto A₁C₀ */
    const ab = pl(abajo);
    const m: P2 = [(pl(A)[0] + ab[0]) / 2, (pl(A)[1] + ab[1]) / 2];
    const u: P2 = [ab[0] - pl(A)[0], ab[1] - pl(A)[1]];
    /* los cortes están en la perpendicular por el punto medio, a √3/2 de A₁C₀ */
    const k = Math.sqrt(3) / 2;
    const P: P2 = [m[0] - u[1] * k, m[1] + u[0] * k];
    const Q: P2 = [m[0] + u[1] * k, m[1] - u[0] * k];
    cerca(P, 227.098, 310.271);
    cerca(Q, 276.202, 604.859);
    const fuera = Math.abs((Q[0] - P[0]) * (pl(B)[1] - P[1]) - (Q[1] - P[1]) * (pl(B)[0] - P[0])) / d2(P, Q);
    expect(fuera).toBeLessThan(0.01);
  });

  it('los errores de B₁: igualar en la planta, en el alzado, o abatir C 30 mm', () => {
    const Bplanta = corteRectaPlano(l, planoMediador(A, punto3([166.61, 131.57], [166.61, 358.35])));
    const Balzado = corteRectaPlano(l, planoMediador(A, punto3([166.61, 244.96], [166.61, 443.39])));
    const B30 = corteRectaPlano(l, planoMediador(A, punto3([166.61, 131.57], [166.61, 358.35 + 30 / PT_MM])));
    cerca(pl(Bplanta), 272.91, 358.35);
    cerca(pl(Balzado), 213.852, 358.35);
    cerca(pl(B30), 251.65, 358.35);
    expect(mm(vm(A, Bplanta))).toBeCloseTo(37.5, 2);
    expect(mm(vm(Bplanta, C))).toBeCloseTo(54.83, 2);
  });

  it('el cambio de plano: línea nueva perpendicular a A₁B₁ por A₁, C de referencia', () => {
    const nueva: Recta2 = { p: pl(A), d: [-(pl(A)[1] - pl(B)[1]), pl(A)[0] - pl(B)[0]] };
    const v4 = (Q: P3) => cambioPlano(Q, 'vertical', nueva, C);
    cerca(v4(C), 308.462, 477.107);
    cerca(v4(D), 308.462, 477.107);
    cerca(v4(A), 423.633, 516.178);
    cerca(v4(B), 423.633, 516.178);
    expect(mm(d2(v4(A), pl(A)))).toBeCloseTo(40, 2);
    expect(mm(d2(v4(C), pl(A)))).toBeCloseTo(15.513, 3);
    /* el ángulo del canto con la línea nueva es el del rombo con el plano horizontal */
    const canto = recta2(v4(C), v4(A));
    const c = Math.abs(canto.d[0] * nueva.d[0] + canto.d[1] * nueva.d[1]) / (Math.hypot(...canto.d) * Math.hypot(...nueva.d));
    expect((Math.acos(c) * 180) / Math.PI).toBeCloseTo(anguloPlanoConPH(rombo), 6);
  });

  it('la cifra del calcular y sus distractores', () => {
    expect(anguloPlanoConPH(rombo)).toBeCloseTo(68.8033, 3);
    expect(90 - anguloPlanoConPH(rombo)).toBeCloseTo(21.1967, 3);
    expect(anguloConPH(B, C)).toBeCloseTo(58.8626, 3);
    expect(anguloConPH(A, C)).toBeCloseTo(30.8077, 3);
    expect(anguloPlanoConPV(rombo)).toBeCloseTo(44.3659, 3);
  });
});

describe('SD10 · el triángulo equilátero con el lado opuesto sobre r', () => {
  const A = punto3([239.64, 174.84], [239.64, 330.72]);
  const r = rectaDesdeProyecciones([[112.08, 259.92], [282.12, 259.92]], [[112.08, 316.56], [282.12, 459.24]]);
  const Ri = punto3([112.08, 259.92], [112.08, 316.56]);
  const Rd = punto3([282.12, 259.92], [282.12, 459.24]);
  const tri = plano(A, Ri, Rd);
  const M = pieEnRecta(A, r);
  const h = vm(A, M);
  const [derecha, izquierda] = puntosADistancia(r, M, h / Math.sqrt(3));

  it('r es horizontal y A está 30,01 mm más alto que ella; la altura real es 39,13 mm', () => {
    expect(r.d.z).toBeCloseTo(0, 12);
    expect(mm(A.z - M.z)).toBeCloseTo(30.0143, 3);
    expect(mm(vmPlanta(A, M))).toBeCloseTo(25.099, 3);
    expect(mm(h)).toBeCloseTo(39.1257, 3);
    cerca(pl(M), 193.908, 385.222);
  });

  it('B y C, en r a la mitad del lado de M: el triángulo equilátero de 45,18 mm', () => {
    cerca(pl(derecha), 242.96, 426.381);
    cerca(pl(izquierda), 144.856, 344.062);
    cerca(al(derecha), 242.96, 259.92);
    cerca(al(izquierda), 144.856, 259.92);
    for (const [P, Q] of [[A, derecha], [A, izquierda], [derecha, izquierda]] as const) expect(mm(vm(P, Q))).toBeCloseTo(45.1784, 3);
    expect(distanciaARecta(derecha, r)).toBeLessThan(1e-9);
    expect(distanciaARecta(izquierda, r)).toBeLessThan(1e-9);
    /* r es horizontal: B₁C₁ es la verdadera magnitud del lado */
    expect(mm(d2(pl(derecha), pl(izquierda)))).toBeCloseTo(45.1784, 3);
  });

  it('A abatido con r de charnela, a los dos lados, a la altura de M₁', () => {
    const [debajo, encima] = abatido(A, r, tri);
    cerca(pl(debajo), 122.618, 470.182);
    cerca(pl(encima), 265.198, 300.261);
    expect(mm(d2(pl(debajo), pl(M)))).toBeCloseTo(39.1257, 3);
    /* B y C están en la charnela: abatidos no se mueven, y A₀B₁C₁ es equilátero */
    expect(mm(d2(pl(debajo), pl(derecha)))).toBeCloseTo(45.1784, 3);
    expect(mm(d2(pl(debajo), pl(izquierda)))).toBeCloseTo(45.1784, 3);
  });

  it('la construcción: T, el triángulo A₀M₁P y la perpendicular por A₀ a M₁P', () => {
    const [A0] = abatido(A, r, tri);
    const a0 = pl(A0);
    const m1 = pl(M);
    /* la dirección de r₁, de su extremo izquierdo al derecho */
    const dr: P2 = [282.12 - 112.08, 459.24 - 316.56];
    const ld = Math.hypot(...dr);
    const T: P2 = [m1[0] + (dr[0] / ld) * (A.z - M.z), m1[1] + (dr[1] / ld) * (A.z - M.z)];
    cerca(T, 259.083, 439.91);
    expect(mm(d2(pl(A), T))).toBeCloseTo(39.1257, 3);
    const mid: P2 = [(a0[0] + m1[0]) / 2, (a0[1] + m1[1]) / 2];
    const w: P2 = [m1[0] - a0[0], m1[1] - a0[1]];
    const P: P2 = [mid[0] - (w[1] * Math.sqrt(3)) / 2, mid[1] + (w[0] * Math.sqrt(3)) / 2];
    cerca(P, 231.841, 489.44);
    /* la perpendicular por A₀ a M₁P corta r₁ en el vértice de la derecha */
    const pie: P2 = [(m1[0] + P[0]) / 2, (m1[1] + P[1]) / 2];
    const dir: P2 = [pie[0] - a0[0], pie[1] - a0[1]];
    const den = dir[0] * dr[1] - dir[1] * dr[0];
    const t = ((112.08 - a0[0]) * dr[1] - (316.56 - a0[1]) * dr[0]) / den;
    cerca([a0[0] + t * dir[0], a0[1] + t * dir[1]], 242.96, 426.381);
  });

  it('la cifra del calcular y sus distractores', () => {
    expect(mm(vm(derecha, izquierda))).toBeCloseTo(45.1784, 3);
    expect(mm(h)).toBeCloseTo(39.1257, 3);
    expect(mm((vmPlanta(A, M) * 2) / Math.sqrt(3))).toBeCloseTo(28.982, 3);
    expect(mm(vmPlanta(A, derecha))).toBeCloseTo(33.77, 2);
    expect(mm(vmPlanta(A, izquierda))).toBeCloseTo(33.77, 2);
    /* en el alzado, el lado de la derecha mide 30,04 (distractor) y el de la
       izquierda 44,93, a 0,25 mm del lado por casualidad: ninguno es frontal */
    expect(mm(vmAlzado(A, derecha))).toBeCloseTo(30.0372, 3);
    expect(mm(vmAlzado(A, izquierda))).toBeCloseTo(44.9326, 3);
  });
});
