/**
 * Aceptación del motor de ERM: cinco ejercicios de parciales 1 reales,
 * resueltos de punta a punta con el motor y comprobados a mano aquí.
 *
 * El material de la asignatura no trae resueltos los exámenes. Lo que ancla
 * estos números es la cuenta a mano de cada comentario, hecha por un camino
 * distinto del código (equilibrio y compatibilidad planteados como en los
 * apuntes, o una fórmula cerrada), y dos resultados exactos que se comprueban
 * sin calculadora: ε1 = 1600·10⁻⁶ y ε2 = 0 en las galgas, y M = 0 en la rótula.
 *
 * Los enunciados se han leído en los PDF de los parciales (fase-p/examenes-pdf),
 * con las figuras renderizadas; la matriz de 2017 es una imagen y se leyó en
 * ella. Unidades: N, mm y MPa salvo donde se dice.
 */
import { describe, expect, it } from 'vitest';
import { alargamiento, planoInclinado, resuelveBarraAxial } from '../../../src/lib/erm/axial';
import { resuelveBarras } from '../../../src/lib/erm/barras';
import { deformacionEnDireccion, deformacionGalga, mohrDeformacion, roseta } from '../../../src/lib/erm/deformaciones';
import { deformacionesDeTensiones, tensionPlana } from '../../../src/lib/erm/elastico';
import { maximos, tramos } from '../../../src/lib/erm/esfuerzos';
import { tresca, vonMises } from '../../../src/lib/erm/fallo';
import { componentesIntrinsecas, principalesTension } from '../../../src/lib/erm/tensiones';
import { dot, mulMV, type Mat3, type Vec3 } from '../../../src/lib/erm/tensor';
import { esfuerzosViga, resuelveViga } from '../../../src/lib/erm/vigas';

/* ─────────────────────────────────────────────────────────────────────────
 * Parcial 1 del 03-11-2017, ejercicio 1 (tensiones).
 *
 *   [σ] = [[5, 0, −12], [0, −6, 0], [−12, 0, 1]] MPa.
 *   a/ tensiones y direcciones principales; b/ componentes intrínsecas en el
 *   plano cuya normal forma 45° con el eje principal 1 y 60° con el 3.
 *
 * A mano. y es principal (fila y columna sin tangenciales): −6. El bloque xz,
 * [[5, −12], [−12, 1]], tiene centro 3 y radio √(2² + 12²) = √148 = 12,1655:
 * σ1 = 3 + √148 = 15,1655, σ2 = −6, σ3 = 3 − √148 = −9,1655. Dirección 1:
 * (5 − σ1)·nx − 12·nz = 0, nz = −0,84713·nx → n1 = ±(0,76302, 0, −0,64637).
 * b/ En ejes principales n = (cos 45°, ±1/2, cos 60°): σn = σ1/2 + σ2/4 + σ3/4
 * = 0,75 + √148/4 = 3,7914 MPa; |S|² = σ1²/2 + σ2²/4 + σ3²/4
 * = 126,75 + 1,5·√148 = 144,998, τn = √(144,998 − 3,7914²) = 11,4291 MPa.
 * ───────────────────────────────────────────────────────────────────────── */
describe('03-11-2017, ejercicio 1: el tensor de tensiones', () => {
  const sigma: Mat3 = [
    [5, 0, -12],
    [0, -6, 0],
    [-12, 0, 1],
  ];
  const r148 = Math.sqrt(148);

  it('a/ principales 3 + √148, −6 y 3 − √148', () => {
    const { valores } = principalesTension(sigma);
    expect(valores[0]).toBeCloseTo(3 + r148, 10);
    expect(valores[1]).toBeCloseTo(-6, 10);
    expect(valores[2]).toBeCloseTo(3 - r148, 10);
  });

  it('a/ la dirección 1 es ±(0,76302, 0, −0,64637) y la 2 es y', () => {
    const { direcciones } = principalesTension(sigma);
    const n1 = direcciones[0];
    const s = Math.sign(n1[0]);
    expect(s * n1[0]).toBeCloseTo(0.76302, 5);
    expect(s * n1[1]).toBeCloseTo(0, 12);
    expect(s * n1[2]).toBeCloseTo(-0.64637, 5);
    expect(Math.abs(direcciones[1][1])).toBeCloseTo(1, 12);
  });

  it('b/ σn = 0,75 + √148/4 = 3,7914 MPa y τn = 11,4291 MPa', () => {
    const { direcciones } = principalesTension(sigma);
    const [n1, n2, n3] = direcciones;
    const c = [Math.SQRT1_2, 0.5, 0.5];
    const n: Vec3 = [0, 1, 2].map((i) => c[0] * n1[i] + c[1] * n2[i] + c[2] * n3[i]) as unknown as Vec3;
    const { sigmaN, tauN } = componentesIntrinsecas(sigma, n);
    expect(sigmaN).toBeCloseTo(0.75 + r148 / 4, 10);
    expect(tauN).toBeCloseTo(Math.sqrt(126.75 + 1.5 * r148 - (0.75 + r148 / 4) ** 2), 10);
    expect(tauN).toBeCloseTo(11.4291, 4);
  });
});

/* ─────────────────────────────────────────────────────────────────────────
 * Parcial 1 del 03-11-2017, ejercicio 2 (galgas, tensión plana).
 *
 *   εa = 1200·10⁻⁶, εb = 1200·10⁻⁶, εc = 400·10⁻⁶; E = 210 GPa, ν = 0,3,
 *   σe = 800 MPa. En la figura, a va según x, b forma 60° con x y c va por la
 *   hipotenusa, que forma 30° con la base en el vértice derecho y sube hacia
 *   la izquierda: su dirección es 150° (la misma recta que −30°), no 30°.
 *
 * A mano (ec. 3.55). a: εx = 1200. b: 300 + 0,75·εy + 0,43301·γ = 1200.
 * c: 900 + 0,25·εy − 0,43301·γ = 400. Sumando, εy = 400; luego
 * γxy = 600/0,43301 = 800√3 = 1385,64 (todo en 10⁻⁶).
 * Mohr: centro 800, radio √(400² + 692,82²) = √640000 = 800, así que
 * ε1 = 1600·10⁻⁶ y ε2 = 0. θ1 = ½·atan(1385,64/800) = 30°.
 * Tensión plana (ec. 4.25): σ1 = E(ε1 + νε2)/(1 − ν²) = 336/0,91 = 369,231 MPa,
 * σ2 = E(νε1 + ε2)/(1 − ν²) = 100,8/0,91 = 110,769 MPa, σ3 = 0;
 * εz = −ν(ε1 + ε2)/(1 − ν) = −685,71·10⁻⁶.
 * Tresca: FS = 800/369,231 = 13/6 = 2,1667. Von Mises:
 * √(σ1² − σ1σ2 + σ2²) = √89187,84/0,91 = 328,180 MPa, FS = 2,4377.
 * ───────────────────────────────────────────────────────────────────────── */
describe('03-11-2017, ejercicio 2: las galgas a 0°, 60° y 150°', () => {
  const galgas = [
    { angulo: 0, epsilon: 1200e-6 },
    { angulo: 60, epsilon: 1200e-6 },
    { angulo: 150, epsilon: 400e-6 },
  ] as const;
  const E = 210e3;
  const nu = 0.3;

  it('a/ εx = 1200·10⁻⁶, εy = 400·10⁻⁶, γxy = 800√3·10⁻⁶', () => {
    const d = roseta(galgas);
    expect(d.ex).toBeCloseTo(1200e-6, 15);
    expect(d.ey).toBeCloseTo(400e-6, 15);
    expect(d.gxy).toBeCloseTo(800 * Math.sqrt(3) * 1e-6, 15);
  });

  it('b/ ε1 = 1600·10⁻⁶ y ε2 = 0, con la dirección 1 a 30° de x', () => {
    const m = mohrDeformacion(roseta(galgas));
    expect(m.sigma1).toBeCloseTo(1600e-6, 15);
    expect(m.sigma2).toBeCloseTo(0, 15);
    expect((m.theta1 * 180) / Math.PI).toBeCloseTo(30, 9);
  });

  it('b/ σ1 = 369,231 MPa, σ2 = 110,769 MPa, εz = −685,71·10⁻⁶', () => {
    const d = roseta(galgas);
    const m = mohrDeformacion(d);
    const p = tensionPlana({ ex: m.sigma1, ey: m.sigma2, gxy: 0 }, E, nu);
    expect(p.sx).toBeCloseTo(336 / 0.91, 9);
    expect(p.sy).toBeCloseTo(100.8 / 0.91, 9);
    expect(p.ez).toBeCloseTo((-0.3 / 0.7) * 1600e-6, 15);
    /* por el otro camino: tensiones en x, y y sus principales */
    const q = tensionPlana(d, E, nu);
    const c = (q.sx + q.sy) / 2;
    const R = Math.hypot((q.sx - q.sy) / 2, q.txy);
    expect(c + R).toBeCloseTo(336 / 0.91, 9);
    expect(c - R).toBeCloseTo(100.8 / 0.91, 9);
  });

  it('c/ FS de Tresca = 13/6 y de von Mises = 2,4377', () => {
    const s = [336 / 0.91, 100.8 / 0.91, 0];
    expect(tresca(s, 800).FS).toBeCloseTo(13 / 6, 12);
    expect(vonMises(s, 800).FS).toBeCloseTo(800 / (Math.sqrt(89187.84) / 0.91), 9);
    expect(vonMises(s, 800).FS).toBeCloseTo(2.4377, 4);
  });

  it('leer c a 30° en vez de 150° cambia el resultado: el ángulo de la figura importa', () => {
    const otra = roseta([galgas[0], galgas[1], { angulo: 30, epsilon: 400e-6 }]);
    /* a mano: 0,25εy + 0,433γ = −500 y 0,75εy + 0,433γ = 900 → εy = 2800·10⁻⁶ */
    expect(otra.ey).toBeCloseTo(2800e-6, 15);
    expect(deformacionGalga(otra, (30 * Math.PI) / 180)).toBeCloseTo(400e-6, 15);
  });
});

/* ─────────────────────────────────────────────────────────────────────────
 * Parcial 1 del 16-11-2018, ejercicio 1 (barra, holgura y plano inclinado).
 *
 *   Barra empotrada en la pared izquierda; P hacia la derecha a 80 cm; 20 cm
 *   más hasta el extremo libre, que está a ξ = 0,2 mm de la pared derecha.
 *   E = 210 GPa, ν = 0,3, A = 4 cm². a/ P para que toque. b/ con σ = 20 MPa
 *   en el plano dibujado (su normal forma 30° con el eje de la barra), la
 *   tangencial en ese plano. c/ con P = 30 kN, la deformación normal en la
 *   dirección u, que baja 20° desde la horizontal en el tramo de 20 cm.
 *
 * A mano. EA = 210000·400 = 84·10⁶ N. a/ El tramo derecho no trabaja: el
 * extremo se mueve lo que alarga el izquierdo, P·800/EA = 0,2 → P = 21 kN.
 * b/ σn = σx·cos²30° → σx = 26,667 MPa; τ = σx·sen30°·cos30° = σn·tg30°
 * = 11,547 MPa. c/ Cerrada: N1 − N2 = P (equilibrio del punto de carga) y
 * N1·800/EA + N2·200/EA = 0,2 (el extremo llega a la pared): N1 = 22,8 kN,
 * N2 = −7,2 kN, σ2 = −18 MPa. En el tramo de 20 cm, εx = σ/E y εy = εz = −νσ/E:
 * εu = (σ/E)(cos²20° − ν·sen²20°) = −8,5714·10⁻⁵·0,847929 = −7,2680·10⁻⁵.
 * ───────────────────────────────────────────────────────────────────────── */
describe('16-11-2018, ejercicio 1: la barra que toca la pared', () => {
  const E = 210e3;
  const A = 400;
  const EA = E * A;
  const xi = 0.2;
  const barra = (P: number) =>
    resuelveBarraAxial({
      tramos: [
        { L: 800, EA },
        { L: 200, EA },
      ],
      cargas: [{ nudo: 1, P }],
      izquierda: 'fijo',
      derecha: { holgura: xi },
    });

  it('a/ toca con P = 21 kN: por debajo no, por encima sí', () => {
    const P = (xi * EA) / 800;
    expect(P).toBeCloseTo(21000, 9);
    expect(alargamiento(P, 800, E, A)).toBeCloseTo(xi, 12);
    expect(barra(0.999 * P).contacto).toBe(false);
    expect(barra(1.001 * P).contacto).toBe(true);
  });

  it('b/ con σn = 20 MPa en el plano a 30°, τ = 20·tg 30° = 11,547 MPa', () => {
    const t = (30 * Math.PI) / 180;
    const sx = 20 / Math.cos(t) ** 2;
    const r = planoInclinado(sx, Math.PI - t);
    expect(r.sigmaN).toBeCloseTo(20, 12);
    expect(Math.abs(r.tauN)).toBeCloseTo(20 * Math.tan(t), 12);
    expect(Math.abs(r.tauN)).toBeCloseTo(11.547, 3);
  });

  it('c/ con P = 30 kN: N1 = 22,8 kN, N2 = −7,2 kN', () => {
    const s = barra(30000);
    expect(s.contacto).toBe(true);
    expect(s.N[0]).toBeCloseTo(22800, 6);
    expect(s.N[1]).toBeCloseTo(-7200, 6);
  });

  it('c/ εu = −7,2680·10⁻⁵ en la dirección u', () => {
    const s = barra(30000);
    const sigma2 = s.N[1] / A;
    const eps = deformacionesDeTensiones(
      [
        [sigma2, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ],
      E,
      0.3,
    );
    const t = (-20 * Math.PI) / 180;
    const { epsU } = deformacionEnDireccion(eps, [Math.cos(t), Math.sin(t), 0]);
    const aMano = (-18 / E) * (Math.cos(t) ** 2 - 0.3 * Math.sin(t) ** 2);
    expect(epsU).toBeCloseTo(aMano, 15);
    expect(epsU / 1e-5).toBeCloseTo(-7.268, 3);
  });
});

/* ─────────────────────────────────────────────────────────────────────────
 * Parcial 1 del 16-11-2018, ejercicio 2 (diagramas con rótula).
 *
 *   Viga A-D-B-E-C con tramos de a: apoyo fijo en A, móviles en B y C, rótula
 *   en E; P = q0·a hacia abajo en D y q0 repartida en EC.
 *
 * A mano (q0 = a = 1). EC sola, momentos en E: C·a = q0·a·a/2 → C = q0a/2, y
 * la rótula transmite q0a/2 hacia abajo sobre AE. AE, momentos en A:
 * B·2a = q0a·a + (q0a/2)·3a → B = 5q0a/4; A = q0a + q0a/2 − 5q0a/4 = q0a/4.
 * Comprobación: A + B + C = 2q0a = P + q0a. Cortantes: AD q0a/4, DB −3q0a/4,
 * BE q0a/2, EC de q0a/2 a −q0a/2. Flectores: M_D = q0a²/4, M_B = −q0a²/2,
 * M_E = 0 (la rótula), y en EC el máximo en el centro, V = 0:
 * q0a/2·a/2 − q0(a/2)²/2 = q0a²/8.
 * ───────────────────────────────────────────────────────────────────────── */
describe('16-11-2018, ejercicio 2: la viga con la rótula en E', () => {
  const r = resuelveViga({
    L: 4,
    apoyos: [
      { x: 0, tipo: 'articulado' },
      { x: 2, tipo: 'movil' },
      { x: 4, tipo: 'movil' },
    ],
    rotulas: [3],
    cargas: [
      { tipo: 'puntual', x: 1, P: 1 },
      { tipo: 'repartida', x1: 3, x2: 4, q1: 1, q2: 1 },
    ],
  });

  it('reacciones: A = q0a/4, B = 5q0a/4, C = q0a/2 y ninguna horizontal', () => {
    const [A, B, C] = r.sol.reacciones;
    expect(A.Ry).toBeCloseTo(0.25, 12);
    expect(B.Ry).toBeCloseTo(1.25, 12);
    expect(C.Ry).toBeCloseTo(0.5, 12);
    expect(A.Rx).toBeCloseTo(0, 12);
  });

  it('cortantes: q0a/4, −3q0a/4, q0a/2 y de q0a/2 a −q0a/2', () => {
    expect(esfuerzosViga(r, 0.5).V).toBeCloseTo(0.25, 12);
    expect(esfuerzosViga(r, 1.5).V).toBeCloseTo(-0.75, 12);
    expect(esfuerzosViga(r, 2.5).V).toBeCloseTo(0.5, 12);
    expect(esfuerzosViga(r, 3, 'der').V).toBeCloseTo(0.5, 12);
    expect(esfuerzosViga(r, 4, 'izq').V).toBeCloseTo(-0.5, 12);
  });

  it('en el apoyo B la cortante salta lo que vale la reacción: de −3q0a/4 a q0a/2', () => {
    expect(esfuerzosViga(r, 2, 'izq').V).toBeCloseTo(-0.75, 12);
    expect(esfuerzosViga(r, 2, 'der').V).toBeCloseTo(0.5, 12);
  });

  it('flectores: M_D = q0a²/4, M_B = −q0a²/2 y M_E = 0', () => {
    expect(esfuerzosViga(r, 1).M).toBeCloseTo(0.25, 12);
    expect(esfuerzosViga(r, 2).M).toBeCloseTo(-0.5, 12);
    expect(esfuerzosViga(r, 3, 'izq').M).toBeCloseTo(0, 12);
    expect(esfuerzosViga(r, 3, 'der').M).toBeCloseTo(0, 12);
  });

  it('en EC el flector máximo es q0a²/8 en el centro, donde V = 0', () => {
    const conCero = tramos(r.sol).filter((t) => t.ceros.length > 0);
    expect(conCero).toHaveLength(1);
    expect(conCero[0].ceros[0].s).toBeCloseTo(0.5, 10);
    expect(conCero[0].ceros[0].M).toBeCloseTo(0.125, 12);
  });

  it('máximos de la viga: +q0a²/4 en D y −q0a²/2 en B', () => {
    const m = maximos(r.sol);
    expect(m.Mmax.valor).toBeCloseTo(0.25, 12);
    expect(m.Mmin.valor).toBeCloseTo(-0.5, 12);
    expect(m.Vmin.valor).toBeCloseTo(-0.75, 12);
  });
});

/* ─────────────────────────────────────────────────────────────────────────
 * Parcial 1 del 16-11-2018, ejercicio 3 (barras con un sólido rígido).
 *
 *   AB rígida, articulada en A, forma 30° con la vertical. La barra 1 es
 *   horizontal, de la pared a B; la 2 baja de la pared a B formando 30° con la
 *   horizontal, y su apoyo está a una altura a sobre A. Misma sección A y
 *   E1 = 3E2. P vertical hacia abajo en B. a/ fuerzas en 1, 2 y AB; b/ giro de AB.
 *
 * Geometría: la 2 sube de B a la altura a: a − L·cos30° = L·sen30°·tg30°, de
 * donde L_AB = a·cos30° = (√3/2)a, B = (√3a/4, 3a/4), L1 = √3a/4, L2 = a/2.
 * A mano. Giro θ de AB (antihorario +): B se mueve θ·(−3a/4, √3a/4).
 * ΔL1 = −3aθ/4, ΔL2 = −(√3/2)aθ; con k1 = E1A/L1 = 4√3·E2A/a y
 * k2 = 2E2A/a: N1 = 3√3·E2A·(−θ), N2 = √3·E2A·(−θ), luego N1 = 3·N2.
 * ΣM_A: (3a/4)N1 + (√3a/2)N2 − (√3a/4)P = 0 → 9N2 + 2√3N2 = √3P →
 * N2 = P/(3√3 + 2) = P/7,196152 = 0,138963P, N1 = 3P/(3√3 + 2) = 0,416889P
 * (tracciones). AB solo tiene fuerzas en sus extremos: la resultante en B va
 * según AB y vale |(−N1 − (√3/2)N2, −P + N2/2)| = |(−0,537234, −0,930518)|·P
 * = 1,074470P, de compresión.
 * θ = −N2/(√3·E2A) = −P/((9 + 2√3)·E2·A) = −P/(12,464102·E2A)
 * = −0,080230·P/(E2A): horario.
 * ───────────────────────────────────────────────────────────────────────── */
describe('16-11-2018, ejercicio 3: AB rígida con las barras 1 y 2', () => {
  const a = 1000;
  const P = 20000;
  const E2A = 70e3 * 100;
  const B: [number, number] = [(Math.sqrt(3) * a) / 4, (3 * a) / 4];
  const r = resuelveBarras({
    solidos: [{ id: 'AB', tipo: 'rigido', x: 0, y: 0 }],
    barras: [
      { id: '1', a: { x: 0, y: B[1] }, b: { solido: 'AB', x: B[0], y: B[1] }, EA: 3 * E2A },
      { id: '2', a: { x: 0, y: a }, b: { solido: 'AB', x: B[0], y: B[1] }, EA: E2A },
    ],
    enlaces: [{ tipo: 'articulacion', solido: 'AB', x: 0, y: 0 }],
    cargas: [{ solido: 'AB', x: B[0], y: B[1], Fy: -P }],
  });
  const c = 3 * Math.sqrt(3) + 2;

  it('la geometría: la barra 2 forma 30° con la horizontal y mide a/2', () => {
    expect(Math.hypot(B[0], B[1] - a)).toBeCloseTo(a / 2, 9);
    expect((Math.atan2(a - B[1], B[0]) * 180) / Math.PI).toBeCloseTo(30, 9);
    expect((Math.atan2(B[0], B[1]) * 180) / Math.PI).toBeCloseTo(30, 9);
    /* y el motor mide lo mismo: L = ΔL·EA/N en cada barra */
    const L2 = ((r.barras.get('2')?.alargamiento ?? NaN) * E2A) / (r.barras.get('2')?.N ?? NaN);
    const L1 = ((r.barras.get('1')?.alargamiento ?? NaN) * 3 * E2A) / (r.barras.get('1')?.N ?? NaN);
    expect(L2).toBeCloseTo(a / 2, 9);
    expect(L1).toBeCloseTo((Math.sqrt(3) * a) / 4, 9);
  });

  it('a/ N1 = 3P/(3√3 + 2) y N2 = P/(3√3 + 2), las dos de tracción', () => {
    expect(r.barras.get('1')?.N).toBeCloseTo((3 * P) / c, 6);
    expect(r.barras.get('2')?.N).toBeCloseTo(P / c, 6);
    expect((r.barras.get('1')?.N ?? 0) / P).toBeCloseTo(0.416889, 6);
    expect((r.barras.get('2')?.N ?? 0) / P).toBeCloseTo(0.138963, 6);
  });

  it('a/ AB trabaja a compresión con 1,074470·P (la reacción en A va según AB)', () => {
    const R = r.reacciones[0];
    const eAB: [number, number] = [B[0] / Math.hypot(...B), B[1] / Math.hypot(...B)];
    /* la reacción empuja de A hacia B: compresión; su componente normal a AB es nula */
    expect(R.Fx * eAB[1] - R.Fy * eAB[0]).toBeCloseTo(0, 6);
    expect(-(R.Fx * eAB[0] + R.Fy * eAB[1]) / P).toBeCloseTo(-1.07447, 5);
  });

  it('b/ θ = −P/((9 + 2√3)·E2·A), horario', () => {
    const theta = r.desplazamientos.get('AB')?.theta ?? NaN;
    expect(theta).toBeCloseTo(-P / ((9 + 2 * Math.sqrt(3)) * E2A), 15);
    expect((theta * E2A) / P).toBeCloseTo(-0.08023, 5);
  });

  it('compatibilidad: B se mueve perpendicular a AB y alarga cada barra lo que dice 8.9', () => {
    const [u, v] = r.desplazamientoDe({ solido: 'AB', x: B[0], y: B[1] });
    expect(u * B[0] + v * B[1]).toBeCloseTo(0, 12);
    const N1 = r.barras.get('1')?.N ?? NaN;
    expect(u).toBeCloseTo((N1 * B[0]) / (3 * E2A), 12);
  });
});

/* El segundo camino de una pieza que usan dos ejercicios de arriba: la
   deformación en una dirección por la ec. 3.55 escrita a mano. */
describe('comprobación cruzada', () => {
  it('εu por {u}ᵗ[ε]{u} y por la ec. 3.55 coinciden en el caso de 2018', () => {
    const eps: Mat3 = [
      [-18 / 210e3, 0, 0],
      [0, (0.3 * 18) / 210e3, 0],
      [0, 0, (0.3 * 18) / 210e3],
    ];
    const t = (-20 * Math.PI) / 180;
    const u: Vec3 = [Math.cos(t), Math.sin(t), 0];
    expect(dot(u, mulMV(eps, u))).toBeCloseTo(deformacionGalga({ ex: eps[0][0], ey: eps[1][1], gxy: 0 }, t), 18);
  });
});
