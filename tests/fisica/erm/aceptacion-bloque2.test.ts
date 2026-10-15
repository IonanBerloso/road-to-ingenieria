/**
 * Aceptación del bloque II del motor de ERM (temas 9 a 14): un problema real
 * de 2.ª parte por tema, de las familias que más se repiten en
 * `fase-p/p0/examenes.json`, resuelto de punta a punta con el motor y
 * comprobado a mano en el comentario de cada uno; y los tres ejercicios del
 * tema 9 que las unidades p6b, p6c y p6d resolvieron sin motor (con su guion,
 * un segundo camino y una revisión cada uno): el motor tiene que dar sus
 * mismas cifras.
 *
 * El material no trae resueltos los exámenes: lo que ancla los números es la
 * cuenta a mano de cada comentario, por un camino distinto del código. Los
 * enunciados se han leído en los PDF de `fase-p/examenes-pdf/`, con las
 * figuras renderizadas; la página es la del PDF. Las decisiones de lectura
 * (lo que la figura no dice del todo) están en cada comentario.
 */
import { describe, expect, it } from 'vitest';
import { vigaConjugada } from '../../../src/lib/erm/conjugada';
import { resuelveElastica } from '../../../src/lib/erm/elastica';
import { desplazamiento3, type Arbol } from '../../../src/lib/erm/espacial';
import { maximos } from '../../../src/lib/erm/esfuerzos';
import { resuelve } from '../../../src/lib/erm/estructura';
import { ejeNeutro, escalaMinima, momentosEquivalentes, tensionesExtremas, tensionNormal } from '../../../src/lib/erm/flexion';
import { compresionExcentricaBiaxial, inerciaParaFactor } from '../../../src/lib/erm/pandeo';
import { porRedundantes } from '../../../src/lib/erm/redundantes';
import { principales, propiedades, type Seccion } from '../../../src/lib/erm/secciones';
import { resuelveEje, torsionCerrada, tramosCirculares } from '../../../src/lib/erm/torsion';
import { esfuerzosViga, resuelveViga, vigaRecta, type VigaRecta } from '../../../src/lib/erm/vigas';

/** Rectángulos [z0, z1, y0, y1] (como los escriben los guiones de p6) a piezas de `secciones.ts`, escalados por t. */
const rects = (rs: readonly (readonly [number, number, number, number])[], t = 1): Seccion =>
  rs.map(([z0, z1, y0, y1]) => ({ tipo: 'rectangulo' as const, y0: y0 * t, y1: y1 * t, z0: z0 * t, z1: z1 * t }));

/* ─────────────────────────────────────────────────────────────────────────
 * Tema 9 · 2.ª parte del 16-01-2019, ejercicio 2
 * (`2018-2019/19-ERM-EME-urt2-ene2.pdf`, p. 2).
 *
 * Viga de 4a: apoyo fijo en A, rótulas en B (a) y D (3a), apoyo móvil en C
 * (2a), empotrada en E (4a); M0 = q0a² en A y q0 en DE; q0 = 10 kN/m,
 * a = 2,5 m, t = 20 mm. a/ diagramas; b/ tensiones normales y eje neutro en
 * la sección de momento máximo.
 *
 * Lectura: el par de A gira en sentido horario (la flecha sube por la
 * izquierda y llega arriba apuntando a la derecha). El apoyo fijo de A y el
 * empotramiento de E fijan los dos la horizontal: con cargas verticales es
 * la viga «con dos apoyos fijos en el eje», equivalente a la de apoyo simple
 * (tema 11, apartado 11.2, p. 4), y A se pone como móvil para que la
 * estática del tema 7 no vea una reacción horizontal de más. La sección (ala de arriba
 * de 9t con el alma, 20t de alto, ala de abajo de 20t) no acota dónde va el
 * alma, y se toma centrada en el ala de abajo, que es como está dibujada (el
 * eje del alma cae en el centro del ala en la figura).
 *
 * A mano. AB: M(B) = 0 = RA·a + M0 → RA = −q0a. BCD: M(D) = 0 = RA·3a + M0 +
 * RC·a → RC = 2q0a. M = −q0a·x + q0a² en [0, 2a] (q0a² en A⁺, 0 en B, −q0a²
 * en C), q0a·x − 3q0a² en CD (0 en D) y q0a(x − 3a) − q0(x − 3a)²/2 en DE
 * (q0a²/2 en E). |M|máx = q0a² = 62,5 kN·m, en A⁺ (+) y en C (−).
 * Sección (en t; y abajo desde el borde de arriba, z desde el borde izquierdo
 * del ala de abajo): ala de arriba [9,5; 18,5] × [0, 1], alma [9,5; 10,5] ×
 * [1, 19], ala de abajo [0, 20] × [19, 20]. A = 47, ȳ = 1149/94 = 12,2234,
 * z̄ = 506/47 = 10,7660; Iz = 2873,32, Iy = 845,342, Iyz = −422,043 (t⁴).
 * Ec. 9.11 con My = 0: C1 = −Mz·Iy/(Iyz² − IyIz) = 3,75571·10⁻⁴ Mz/t⁴ y
 * C2 = Mz·Iyz/(Iyz² − IyIz) = 1,87506·10⁻⁴ Mz/t⁴. En A⁺, con y, z en mm:
 * σ = 0,146707·y + 0,073245·z (MPa); eje neutro y = −0,49925·z, a 26,53° de
 * z; σmáx = +36,34 MPa en la esquina de abajo a la derecha del ala inferior,
 * σmín = −37,72 MPa en la esquina de arriba a la izquierda del ala superior
 * (en C, los mismos valores con el signo cambiado).
 * ───────────────────────────────────────────────────────────────────────── */
describe('tema 9 · 2.ª parte de 2019, ejercicio 2: la Gerber y la sección de alas desiguales', () => {
  const viga: VigaRecta = {
    L: 4,
    apoyos: [
      { x: 0, tipo: 'movil' },
      { x: 2, tipo: 'movil' },
      { x: 4, tipo: 'empotramiento' },
    ],
    rotulas: [1, 3],
    cargas: [
      { tipo: 'par', x: 0, M: 1 },
      { tipo: 'repartida', x1: 3, x2: 4, q1: 1, q2: 1 },
    ],
  };
  const t = 20;
  const sec = rects(
    [
      [9.5, 18.5, 0, 1],
      [9.5, 10.5, 1, 19],
      [0, 20, 19, 20],
    ],
    t,
  );
  const M = 62.5e6; // N·mm

  it('diagramas: M = q0a² en A⁺, 0 en B y D, −q0a² en C, q0a²/2 en E', () => {
    const s = resuelveViga(viga);
    expect(esfuerzosViga(s, 0).M).toBeCloseTo(1, 12);
    expect(esfuerzosViga(s, 1).M).toBeCloseTo(0, 12);
    expect(esfuerzosViga(s, 2).M).toBeCloseTo(-1, 12);
    expect(esfuerzosViga(s, 3).M).toBeCloseTo(0, 12);
    expect(esfuerzosViga(s, 4, 'izq').M).toBeCloseTo(0.5, 12);
    expect(esfuerzosViga(s, 1.5).V).toBeCloseTo(-1, 12);
    const m = maximos(s.sol);
    expect(m.Mmax.valor).toBeCloseTo(1, 12);
    expect(m.Mmin.valor).toBeCloseTo(-1, 12);
  });

  it('la sección, la ecuación de tensiones y el eje neutro en A⁺', () => {
    const p = propiedades(sec);
    expect(p.A / t ** 2).toBeCloseTo(47, 10);
    expect(p.yG / t).toBeCloseTo(1149 / 94, 10);
    expect(p.zG / t).toBeCloseTo(506 / 47, 10);
    expect(p.Iz / t ** 4).toBeCloseTo(2873.32092, 4);
    expect(p.Iy / t ** 4).toBeCloseTo(845.34220, 4);
    expect(p.Iyz / t ** 4).toBeCloseTo(-422.04255, 4);
    const en = ejeNeutro(p, { Mz: M });
    expect(en.C1).toBeCloseTo(0.146707, 5);
    expect(en.C2).toBeCloseTo(0.073245, 5);
    expect((en.anguloSobreZ * 180) / Math.PI).toBeCloseTo(26.531, 2);
    /* segundo camino: el eje neutro por los M′ de la ec. 9.12 que imprime el enunciado, tg = M′y·Iz/(M′z·Iy) */
    const mp = momentosEquivalentes(p, { Mz: M });
    expect(Math.atan((mp.MyP * p.Iz) / (mp.MzP * p.Iy))).toBeCloseTo(en.anguloSobreZ, 10);
    const ext = tensionesExtremas(sec, { Mz: M });
    expect(ext.max.sigma).toBeCloseTo(36.3446, 3);
    expect(ext.max.punto[0]).toBeCloseTo(20 * t, 9);
    expect(ext.max.punto[1]).toBeCloseTo(20 * t, 9);
    expect(ext.min.sigma).toBeCloseTo(-37.7198, 3);
    expect(ext.min.punto[0]).toBeCloseTo(0, 9);
    expect(ext.min.punto[1]).toBeCloseTo(9.5 * t, 9);
  });
});

/* ─────────────────────────────────────────────────────────────────────────
 * Tema 9 · los tres ejercicios de p6b, p6c y p6d (parciales 1 de 2015-2016,
 * 2014-2015 y 2013-2014, ejercicio 3), con las cifras de sus `cifras.json`.
 * ───────────────────────────────────────────────────────────────────────── */
describe('tema 9 · los ejercicios de p6b, p6c y p6d dan lo mismo con el motor', () => {
  it('p6b: alas desiguales a flexión esviada, M0 = 4000 m·kg a 20°, σadm = 1500 kg/cm² a compresión → t = 0,9271 cm', () => {
    const sec = rects([
      [0, 10, 0, 1],
      [0, 1, 1, 21],
      [0, 20, 21, 22],
    ]);
    const p = propiedades(sec);
    expect(p.A).toBeCloseTo(50, 12);
    expect(p.yG).toBeCloseTo(13.1, 12);
    expect(p.zG).toBeCloseTo(5.2, 12);
    expect(p.Iz).toBeCloseTo(3756.1666666666665, 9);
    expect(p.Iy).toBeCloseTo(1654.6666666666667, 9);
    expect(p.Iyz).toBeCloseTo(1029, 9);
    const pr = principales(p.Iz, p.Iy, p.Iyz);
    expect(pr.Imax).toBeCloseTo(4176.102412330927, 8);
    expect(pr.Imin).toBeCloseTo(1234.7309210024082, 8);
    expect((pr.phiMax * 180) / Math.PI).toBeCloseTo(22.20041164180563, 9);
    const a20 = (20 * Math.PI) / 180;
    const e = { Mz: -Math.cos(a20), My: -Math.sin(a20) };
    const ext = tensionesExtremas(sec, e);
    expect(ext.min.sigma).toBeCloseTo(-0.002988293652925819, 12);
    expect(ext.max.sigma).toBeCloseTo(0.003376558036413252, 12);
    expect(ext.min.punto[0] - p.yG).toBeCloseTo(8.9, 12);
    expect(ext.min.punto[1] - p.zG).toBeCloseTo(14.8, 12);
    expect((ejeNeutro(p, e).anguloSobreZ * 180) / Math.PI).toBeCloseTo(14.796022992312665, 9);
    const M0 = 400000; // cm·kg
    const t = escalaMinima(sec, { Mz: M0 * e.Mz, My: M0 * e.My }, { traccion: Infinity, compresion: 1500 });
    expect(t).toBeCloseTo(0.9271087249745886, 9);
  });

  it('p6c: la Gerber con el par en la rótula, Mmax = q0a² en B y la U invertida → t = 19,958 mm', () => {
    const est = vigaRecta({
      L: 3,
      apoyos: [
        { x: 0, tipo: 'movil' },
        { x: 2, tipo: 'movil' },
        { x: 3, tipo: 'articulado' },
      ],
      rotulas: [1],
      cargas: [
        { tipo: 'puntual', x: 1, P: 1 },
        { tipo: 'repartida', x1: 2, x2: 3, q1: 1, q2: 1 },
      ],
    });
    /* el par q0a² antihorario, en el extremo de AB que llega a la rótula (lectura principal de p6c) */
    est.cargas.push({ tipo: 'par', barra: 'b0', s: 1, M: 1 });
    const sol = resuelve(est);
    const m = maximos(sol);
    expect(m.Mmax.valor).toBeCloseTo(1, 12);
    expect(Math.abs(m.Mmin.valor)).toBeLessThan(1);
    const sec = rects([
      [0, 12, 0, 1],
      [0, 1, 1, 15],
      [11, 12, 1, 15],
    ]);
    const p = propiedades(sec);
    expect(p.A).toBeCloseTo(40, 12);
    expect(p.yG).toBeCloseTo(5.75, 12);
    expect(p.Iz).toBeCloseTo(930.8333333333333, 9);
    const Mmax = m.Mmax.valor * 10 * 4000 ** 2; // N·mm
    expect(escalaMinima(sec, { Mz: Mmax }, { traccion: 200 })).toBeCloseTo(19.958133848860914, 9);
  });

  it('p6d: la viga con carga triangular, Mmax = 8√6/27·q0a² y la L → t = 2,4061 cm', () => {
    const s = resuelveViga({
      L: 3,
      apoyos: [
        { x: 0, tipo: 'movil' },
        { x: 3, tipo: 'articulado' },
      ],
      cargas: [
        { tipo: 'repartida', x1: 0, x2: 1, q1: 0, q2: 1 },
        { tipo: 'repartida', x1: 1, x2: 3, q1: 1, q2: 0 },
      ],
    });
    const m = maximos(s.sol);
    expect(m.Mmax.valor).toBeCloseTo((8 * Math.sqrt(6)) / 27, 12);
    expect(m.Mmax.s).toBeCloseTo(3 - 2 * Math.sqrt(2 / 3), 7);
    const sec = rects([
      [0, 1, 0, 15],
      [1, 10, 0, 1],
    ]);
    const p = propiedades(sec);
    expect(p.Iz).toBeCloseTo(557.625, 9);
    expect(p.Iy).toBeCloseTo(202.625, 9);
    expect(p.Iyz).toBeCloseTo(-196.875, 9);
    expect((ejeNeutro(p, { Mz: 1 }).anguloSobreZ * 180) / Math.PI).toBeCloseTo(44.17539928522093, 9);
    expect(tensionesExtremas(sec, { Mz: 1 }).max.sigma).toBeCloseTo(1780.875 / 74229, 12);
    const Mmax = m.Mmax.valor * 10 * 400 ** 2; // kg·cm
    expect(escalaMinima(sec, { Mz: Mmax }, { traccion: 2000 })).toBeCloseTo(2.4061196553271635, 9);
  });
});

/* ─────────────────────────────────────────────────────────────────────────
 * Tema 10 · 2.ª parte del 13-01-2014, ejercicio 1
 * (`2013-2014/14-ERM-ene2.pdf`, p. 2). «Utilizando el método de la viga
 * conjugada»: empotrada en A, rótula en B (a), apoyo en C (2a), q0 en CD y
 * el par M0 en D (3a, extremo libre; la flecha lo dibuja antihorario).
 * a/ M0 para que la flecha de B sea nula; b/ la flecha de D con ese M0.
 *
 * A mano. M(D⁻) = M0 (un par antihorario en el extremo derecho tracciona la
 * fibra de abajo) y en CD, a s de D, M = M0 − q0s²/2: MC = M0 − q0a²/2. BC y
 * AB no tienen carga y M(B) = 0: M = MC·(x − a)/a en [0, 2a]. La ménsula AB:
 * vB = −∫(a − s)M/EI ds = MC·a²/3EI, nula si MC = 0 → M0 = q0a²/2. Entonces
 * AB y BC no flectan y son rectas con v = 0 (B y C no bajan), θC = 0, y CD
 * es una ménsula desde C: vD = −∫ s·(q0a²/2 − q0s²/2)/EI ds = −q0a⁴/8EI
 * (hacia arriba).
 * ───────────────────────────────────────────────────────────────────────── */
describe('tema 10 · 2.ª parte de 2014, ejercicio 1: la viga conjugada', () => {
  const viga = (M0: number): VigaRecta => ({
    L: 3,
    apoyos: [
      { x: 0, tipo: 'empotramiento' },
      { x: 2, tipo: 'movil' },
    ],
    rotulas: [1],
    cargas: [
      { tipo: 'repartida', x1: 2, x2: 3, q1: 1, q2: 1 },
      { tipo: 'par', x: 3, M: -M0 },
    ],
  });

  it('M0 = q0a²/2 anula la flecha de B, y entonces vD = −q0a⁴/8EI', () => {
    /* vB es lineal en M0: dos vigas conjugadas bastan */
    const v0 = vigaConjugada(viga(0), 1).v(1);
    const v1 = vigaConjugada(viga(1), 1).v(1);
    const M0 = -v0 / (v1 - v0);
    expect(M0).toBeCloseTo(0.5, 10);
    expect(v0).toBeCloseTo(-0.5 / 3, 10);
    const c = vigaConjugada(viga(M0), 1, [2.5]);
    expect(c.v(1)).toBeCloseTo(0, 10);
    expect(c.v(3)).toBeCloseTo(-1 / 8, 10);
    /* la conjugada: libre en A, empotrada en D, apoyo en B y rótula en C */
    expect(c.conjugada.rotulas).toEqual([2]);
    /* segundo camino: la elástica integrada */
    const e = resuelveElastica({ ...viga(M0), EI: 1 });
    expect(e.v(3)).toBeCloseTo(-1 / 8, 10);
    expect(e.theta(2.5)).toBeCloseTo(c.theta(2.5), 9);
  });
});

/* ─────────────────────────────────────────────────────────────────────────
 * Tema 11 · 2.ª parte del 07-01-2020, ejercicio 1
 * (`2019-2020/20-EME-ERM-urta2.pdf`, p. 2). Empotrada en A, P en B (a),
 * resorte k en C (3a), P en D (4a); EIz/ka³ = 1/3; P = 30 kN; sección en I
 * (ala de arriba 10 × 2 cm, alma de 2 cm, ala de abajo 20 × 2 cm, 20 cm de
 * canto). a/ vC; b/ diagramas; c/ a para que la tracción máxima sea 200 MPa.
 *
 * Lectura: la figura conserva los rótulos P pero no las flechas; se toman
 * hacia abajo, como las cargas de todos los ejercicios de esta familia (con
 * P hacia arriba, el apartado c daría a = 4318,6 mm, porque la sección no es
 * simétrica). La razón de rigideces: el enunciado en castellano escribe
 * EIz/kL³ = 1/3, pero la figura no define ninguna L; el de euskera escribe
 * EIz/ka³ = 1/3, que es la única lectura definida, y es la que se toma.
 *
 * A mano (redundante X, la fuerza del resorte hacia arriba, sobre la ménsula):
 * flecha en C de P en a: Pa³/3EI + Pa²/2EI·2a = 4Pa³/3EI; de P en 4a:
 * P(3a)²(12a − 3a)/6EI = 27Pa³/2EI; de X: −9Xa³/EI. Compatibilidad
 * 89Pa³/6EI − 9Xa³/EI = X/k → X = 89Pa³k/6/(9ka³ + EI) y vC = X/k =
 * 89Pa³/(6(9ka³ + EI)); con EI = ka³/3, X = 89P/56 y vC = 89Pa³/168EI.
 * Flectores (por la derecha): MA = −5Pa + 3Xa = −13Pa/56, MB = −3Pa + 2Xa =
 * 5Pa/28, MC = −Pa, MD = 0. La I: A = 92 cm², ȳ = 275/23 = 11,9565 cm desde
 * arriba, Iz = 359524/69 = 5210,49 cm⁴. La tracción máxima es la fibra de
 * arriba en C: Pa·11,9565/Iz (en B, la de abajo: 0,1786Pa·8,0435/Iz; en A,
 * la de arriba: 0,2321Pa·11,9565/Iz) → a = 200·Iz/(P·ȳ) = 2905,24 mm.
 * ───────────────────────────────────────────────────────────────────────── */
describe('tema 11 · 2.ª parte de 2020, ejercicio 1: la ménsula sobre un resorte', () => {
  const base: VigaRecta = {
    L: 4,
    apoyos: [{ x: 0, tipo: 'empotramiento' }],
    cargas: [
      { tipo: 'puntual', x: 1, P: 1 },
      { tipo: 'puntual', x: 4, P: 1 },
    ],
  };

  it('vC = 89Pa³/(6(9ka³ + EI)) para cualquier k, y 89Pa³/168EI con EI/ka³ = 1/3', () => {
    for (const k of [3, 0.7, 20]) {
      const s = porRedundantes(base, 1, [{ tipo: 'fuerza', x: 3, k }]);
      expect(s.elastica.v(3)).toBeCloseTo(89 / (6 * (9 * k + 1)), 10);
      /* segundo camino: la viga entera con el resorte en elastica.ts */
      const e = resuelveElastica({ L: 4, EI: 1, apoyos: [{ x: 0, tipo: 'empotramiento' }, { x: 3, tipo: 'resorte', k }], cargas: base.cargas });
      expect(e.R[1]).toBeCloseTo(s.X[0], 10);
    }
    const s = porRedundantes(base, 1, [{ tipo: 'fuerza', x: 3, k: 3 }]);
    expect(s.X[0]).toBeCloseTo(89 / 56, 12);
    expect(s.elastica.v(3)).toBeCloseTo(89 / 168, 12);
  });

  it('diagramas y la a con la que la tracción máxima es 200 MPa', () => {
    const s = porRedundantes(base, 1, [{ tipo: 'fuerza', x: 3, k: 3 }]);
    const M = (x: number) => esfuerzosViga(s.esfuerzos, x).M;
    expect(M(0)).toBeCloseTo(-13 / 56, 12);
    expect(M(1)).toBeCloseTo(5 / 28, 12);
    expect(M(3)).toBeCloseTo(-1, 12);
    const sec = rects([
      [-5, 5, 0, 2],
      [-1, 1, 2, 18],
      [-10, 10, 18, 20],
    ]);
    const p = propiedades(sec);
    expect(p.yG).toBeCloseTo(275 / 23, 12);
    expect(p.Iz).toBeCloseTo(359524 / 69, 9);
    /* la tracción por unidad de P·a en las secciones de M extremo (A, B, C) */
    const coef = Math.max(...[0, 1, 3].map((x) => tensionesExtremas(sec, { Mz: M(x) }).max.sigma));
    expect(coef).toBeCloseTo(p.yG / p.Iz, 12);
    /* σ = coef·P·a con P en N, a en mm y la sección en cm → ×10⁻³ */
    const a = 200 / (30e3 * coef * 1e-3);
    expect(a).toBeCloseTo(2905.2444, 3);
  });
});

/* ─────────────────────────────────────────────────────────────────────────
 * Tema 12 · 2.ª parte del 13-01-2014, ejercicio 2
 * (`2013-2014/14-ERM-ene2.pdf`, p. 2). Eje biempotrado en A y F, circular
 * hueco de espesor t: AC de 10t de diámetro exterior y CF de 5t; M0 en B
 * (AB = BC = L, CF = 2L), según +x en la figura. a/ Mt/M0; b/ φ·GIp/(M0L)
 * con Ip el de AC.
 *
 * A mano. Ip(AC) = π(10⁴ − 8⁴)t⁴/32 = 184,5πt⁴ e Ip(CF) = π(5⁴ − 3⁴)t⁴/32 =
 * 17πt⁴: Ip(AC)/Ip(CF) = 369/34. Flexibilidades desde B: a la izquierda
 * L/GIp; a la derecha L/GIp + 2L·(369/34)/GIp = (386/17)·L/GIp. El par se
 * reparte al revés de las flexibilidades: Mt(AB) = M0·(386/17)/(403/17) =
 * 386/403·M0 = 0,95782M0 y Mt(BF) = −17/403·M0 = −0,04218M0. Giros:
 * φB = 386/403 = 0,95782, φC = 386/403 − 17/403 = 369/403 = 0,91563 y
 * φF = 369/403 − (17/403)·2·(369/34) = 0 (en M0L/GIp).
 * ───────────────────────────────────────────────────────────────────────── */
describe('tema 12 · 2.ª parte de 2014, ejercicio 2: el eje tubular biempotrado', () => {
  it('Mt = 386/403 y −17/403 de M0; φB = 386/403 y φC = 369/403 de M0L/GIp', () => {
    const tramos = tramosCirculares(1, [
      { x0: 0, x1: 2, D: 10, d: 8 },
      { x0: 2, x1: 4, D: 5, d: 3 },
    ]);
    const s = resuelveEje({ L: 4, tramos, empotramientos: [{ x: 0 }, { x: 4 }], cargas: [{ tipo: 'par', x: 1, T: 1 }] });
    const GIp = tramos[0].GIt;
    expect(GIp).toBeCloseTo(184.5 * Math.PI, 10);
    expect(s.Mt(0.5)).toBeCloseTo(386 / 403, 12);
    expect(s.Mt(3)).toBeCloseTo(-17 / 403, 12);
    expect(s.phi(1) * GIp).toBeCloseTo(386 / 403, 12);
    expect(s.phi(2) * GIp).toBeCloseTo(369 / 403, 12);
    expect(s.phi(4)).toBeCloseTo(0, 12);
    expect(s.R[0] + s.R[1]).toBeCloseTo(-1, 12);
  });
});

/* ─────────────────────────────────────────────────────────────────────────
 * Tema 13 · 2.ª parte del 13-01-2014, ejercicio 4
 * (`2013-2014/14-ERM-ene2.pdf`, p. 2). Barra ABC empotrada en A: AB vertical
 * de 2b y BC horizontal de 2b; F = P√6 según CM, con N a b de A en la
 * dirección perpendicular al plano ABC y M a b de N, paralelo a BC. Sección
 * cuadrada hueca de 8t y espesor t; E = 2,5G. Desplazamiento de C vertical y
 * según AN, con flexión y torsión, en función de P, b y GIt.
 *
 * Ejes: X según BC, Y según AN, Z hacia arriba; A = 0, B = (0, 0, 2b),
 * C = (2b, 0, 2b), M = (b, b, 0): F = P(−1, 1, −2).
 * A mano. I = (8⁴ − 6⁴)t⁴/12 = 700t⁴/3; It = 4A0²/∮ds/t con la línea media de
 * 7t: 4·49²/28 = 343t⁴; EI/GIt = 2,5·(700/3)/343 = 250/147. En BC (a s de
 * B): M = P(2b − s)(0, 2, 1), sin torsor. En AB (a altura s): M =
 * P(s − 2b, 2b + s, 2b), con torsor Mt = 2Pb. Unidad vertical (0, 0, −1) en C:
 * en BC m = (2b − s)(0, 1, 0); en AB m = (0, 2b, 0), sin torsor →
 * δv = [2P·8b³/3 + 2bP·6b²]/EI = 52Pb³/3EI = 10,192Pb³/GIt. Unidad según AN
 * (0, 1, 0): en BC m = (2b − s)(0, 0, 1); en AB m = (s − 2b, 0, 2b), torsor 2b
 * → δAN = (8/3 + 8/3)Pb³/EI + 2Pb·2b·2b/GIt = 16Pb³/3EI + 8Pb³/GIt =
 * 11,136Pb³/GIt.
 * ───────────────────────────────────────────────────────────────────────── */
describe('tema 13 · 2.ª parte de 2014, ejercicio 4: la barra quebrada espacial', () => {
  it('δv = 52Pb³/3EI = 10,192Pb³/GIt y δAN = 11,136Pb³/GIt', () => {
    const G = 1;
    const sec: Seccion = [
      { tipo: 'rectangulo', y0: -4, y1: 4, z0: -4, z1: 4 },
      { tipo: 'rectangulo', y0: -3, y1: 3, z0: -3, z1: 3, hueco: true },
    ];
    const I = propiedades(sec).Iz;
    expect(I).toBeCloseTo(700 / 3, 10);
    const It = torsionCerrada(1, 49, [0, 1, 2, 3].map(() => ({ s: 7, t: 1 }))).It;
    expect(It).toBeCloseTo(343, 10);
    const rig = { EI: 2.5 * G * I, GIt: G * It };
    const arbol: Arbol = {
      nudos: [
        { id: 'A', p: [0, 0, 0] },
        { id: 'B', p: [0, 0, 2] },
        { id: 'C', p: [2, 0, 2] },
      ],
      barras: [
        { id: 'AB', i: 'A', j: 'B', rig },
        { id: 'BC', i: 'B', j: 'C', rig },
      ],
      empotramiento: 'A',
      cargas: [{ tipo: 'nudo', nudo: 'C', F: [-1, 1, -2] }],
    };
    const dv = desplazamiento3(arbol, { tipo: 'fuerza', nudo: 'C', direccion: [0, 0, -1] });
    const dAN = desplazamiento3(arbol, { tipo: 'fuerza', nudo: 'C', direccion: [0, 1, 0] });
    expect(dv).toBeCloseTo(52 / (3 * rig.EI), 12);
    expect(dv * rig.GIt).toBeCloseTo(10.192, 10);
    expect(dAN * rig.GIt).toBeCloseTo(11.136, 10);
  });
});

/* ─────────────────────────────────────────────────────────────────────────
 * Tema 14 · 2.ª parte del 19-01-2018, teoría 4 (un cálculo)
 * (`2017-2018/18-ERM-EME-urta2-ene2.pdf`, p. 1). Columna empotrada-libre de
 * 10 m, P = 10 kN en el punto B de la sección (en el eje z, en el borde),
 * E = 150 GPa; b para que el factor multiplicador del momento sea
 * sec(αL) = 2. La sección: 7b de ancho y 8b de alto con dos huecos de
 * 2b × 6b separados b entre sí y de los bordes.
 *
 * A mano. B está en z = 3,5b, y = 0: ez = 3,5b produce My, que trabaja con
 * Iy (diapositiva 17: My = −P·ez·sec(αy·L), αy = √(P/EIy)). Iy = 8·7³/12 −
 * 2·(6·2³/12 + 12·1,5²) = 686/3 − 62 = 500/3 b⁴. sec(αL) = 2 → αL = π/3 →
 * Iy = 9PL²/(π²E) = 6,07927·10⁻⁶ m⁴ → b = (6,07927·10⁻⁶·3/500)^¼ =
 * 0,013820 m = 13,82 mm.
 * ───────────────────────────────────────────────────────────────────────── */
describe('tema 14 · 2.ª parte de 2018, teoría 4: el factor de amplificación 2', () => {
  it('Iy = 500b⁴/3 y b = 13,82 mm', () => {
    const sec: Seccion = [
      { tipo: 'rectangulo', y0: -4, y1: 4, z0: -3.5, z1: 3.5 },
      { tipo: 'rectangulo', y0: -3, y1: 3, z0: -2.5, z1: -0.5, hueco: true },
      { tipo: 'rectangulo', y0: -3, y1: 3, z0: 0.5, z1: 2.5, hueco: true },
    ];
    const p = propiedades(sec);
    expect(p.Iy).toBeCloseTo(500 / 3, 10);
    const P = 10e3;
    const E = 150e9;
    const L = 10;
    const Iy = inerciaParaFactor(P, E, L, 2);
    expect(Iy).toBeCloseTo((9 * P * L * L) / (Math.PI ** 2 * E), 18);
    const b = (Iy / p.Iy) ** 0.25;
    expect(b).toBeCloseTo(0.01381976597885342, 12);
    /* y de vuelta: con ese b el factor es 2 */
    const r = compresionExcentricaBiaxial(P, 0, 3.5 * b, E, p.Iz * b ** 4, p.Iy * b ** 4, L);
    expect(r.factorY).toBeCloseTo(2, 10);
    expect(r.My).toBeCloseTo(-2 * P * 3.5 * b, 8);
    /* la tensión del empotramiento en B, con flexion.ts: −P/A − 2P·ez·3,5b/Iy */
    const pb = { ...p, A: p.A * b * b, Iz: p.Iz * b ** 4, Iy: p.Iy * b ** 4, Iyz: 0, yG: 0, zG: 0 };
    expect(tensionNormal(pb, r, [0, 3.5 * b])).toBeCloseTo(-P / pb.A - (2 * P * (3.5 * b) ** 2) / pb.Iy, 3);
  });
});
