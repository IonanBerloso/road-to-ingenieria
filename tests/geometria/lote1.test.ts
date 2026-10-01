import { describe, expect, it } from 'vitest';
import { abatido, abatidoJunto, abatidoPlanta, gira, plano, rectaPorPuntos, vm, type P3 } from '../../src/lib/diedrico';
import { evaluaReceta, type Lamina } from '../../src/lib/diedrico-receta';

/* El lote 1 de la fase K (Expresión Gráfica): lo que pidieron las hojas 53 y
   55, cada función por un camino distinto del que usa. */
const p = (x: number, y: number, z: number): P3 => ({ x, y, z });
const casi = (a: number, b: number, tol = 1e-6) => expect(Math.abs(a - b), `${a} frente a ${b}`).toBeLessThanOrEqual(tol);

/* Un tejado inclinado con una horizontal por charnela, y tres puntos suyos:
   Q y P al mismo lado de la charnela, R al otro. */
const charnela = rectaPorPuntos(p(0, 0, 0), p(100, 0, 0));
const tejado = plano(p(0, 0, 0), p(100, 0, 0), p(0, 60, 45));
const enTejado = (x: number, y: number) => p(x, y, (y * 45) / 60);
const Q = enTejado(30, 60);
const P = enTejado(70, 24);
const R = enTejado(50, -40);

describe('abatidoJunto', () => {
  for (const lado of [0, 1] as const) {
    const Qab = abatido(Q, charnela, tejado)[lado];
    it(`conserva todas las distancias de la figura (lado ${lado + 1})`, () => {
      const Pab = abatidoJunto(P, charnela, tejado, Qab, Q);
      const Rab = abatidoJunto(R, charnela, tejado, Qab, Q);
      casi(vm(Pab, Qab), vm(P, Q));
      casi(vm(Rab, Qab), vm(R, Q));
      casi(vm(Pab, Rab), vm(P, R));
      casi(Pab.z, 0);
      casi(Rab.z, 0);
    });

    it(`es el giro que lleva Q a su abatido (lado ${lado + 1})`, () => {
      const candidatos = [-180, -90, -36.87, 36.87, 90, 180].concat(
        [...Array(721).keys()].map((k) => -180 + k * 0.5),
      );
      /* el ángulo que lleva Q a Qab, buscado sin la función */
      const fi = candidatos.reduce((mejor, a) => (vm(gira(Q, charnela, a), Qab) < vm(gira(Q, charnela, mejor), Qab) ? a : mejor));
      casi(vm(abatidoJunto(P, charnela, tejado, Qab, Q), gira(P, charnela, fi)), 0, 0.5);
    });
  }

  it('R, al otro lado de la charnela, cae al otro lado también', () => {
    const Qab = abatido(Q, charnela, tejado)[0];
    const Rab = abatidoJunto(R, charnela, tejado, Qab, Q);
    expect(Math.sign(Rab.y)).toBe(-Math.sign(Qab.y));
  });

  it('un abatido de referencia que no lo es, lanza: un punto cualquiera, Q sin abatir o Q girado 30°', () => {
    expect(() => abatidoJunto(P, charnela, tejado, p(30, 10, 0), Q)).toThrow(/no es ninguno de los dos abatidos/);
    expect(() => abatidoJunto(P, charnela, tejado, Q, Q)).toThrow(/no es ninguno de los dos abatidos/);
    expect(() => abatidoJunto(P, charnela, tejado, gira(Q, charnela, 30), Q)).toThrow(/no es ninguno de los dos abatidos/);
  });

  it('un punto de referencia fuera del plano, o en la charnela, lanza', () => {
    const fuera = { ...Q, z: Q.z + 20 };
    expect(() => abatidoJunto(P, charnela, tejado, abatido(Q, charnela, tejado)[0], fuera)).toThrow(/no está en el plano/);
    expect(() => abatidoJunto(P, charnela, tejado, p(40, 0, 0), p(40, 0, 0))).toThrow(/en la charnela/);
  });

  it('un punto de la charnela se queda donde está', () => {
    const enCharnela = p(80, 0, 0);
    casi(vm(abatidoJunto(enCharnela, charnela, tejado, abatido(Q, charnela, tejado)[1], Q), enCharnela), 0);
  });

  it('con una charnela frontal, la figura cae entera en el plano frontal de la charnela', () => {
    const frontal = rectaPorPuntos(p(0, 30, 0), p(100, 30, 100));
    const pared = plano(p(0, 30, 0), p(100, 30, 100), p(0, 90, 20));
    const enPared = (t: number, s: number) => p(100 * t, 30 + 60 * s, 100 * t + 20 * s);
    const [Qf, Pf] = [enPared(0.3, 1), enPared(0.8, 0.6)];
    for (const Qab of abatido(Qf, frontal, pared)) {
      const Pab = abatidoJunto(Pf, frontal, pared, Qab, Qf);
      casi(Pab.y, 30);
      casi(vm(Pab, Qab), vm(Pf, Qf));
    }
  });
});

describe('uno, segmento2 y abatido_junto, desde una receta', () => {
  const A = p(10, 40, 70);
  const B = p(130, 90, 20);
  const C = p(60, 150, 110);
  /* Una lámina mínima con los tres puntos en sus dos proyecciones: alzado
     (x, −cota) y planta (x, alejamiento). */
  const lamina: Lamina = {
    puntos: Object.fromEntries(
      Object.entries({ A, B, C }).flatMap(([n, P]) => [
        [`${n}2`, [P.x, -P.z] as const],
        [`${n}1`, [P.x, P.y] as const],
      ]),
    ),
    segmentos: {},
  };
  const escena = Object.fromEntries(
    ['A', 'B', 'C'].map((n) => [n, `punto3(alzado: figura.punto("${n}2"), planta: figura.punto("${n}1"))`]),
  );
  const res = evaluaReceta(lamina, {
    escena: { ...escena, abc: 'plano(A, B, C)', h: 'horizontal_por(A, abc)' },
    solucion: {
      primero: 'uno(abatido_planta(A, B), 1)',
      lado: 'segmento2(figura.punto("A1"), figura.punto("B1"))',
      Bab: 'uno(abatido(B, h, abc), 2)',
      Cab: 'abatido_junto(C, h, abc, con: Bab, de: B)',
    },
  });
  const p3 = (n: string) => {
    const v = res.valores.get(n);
    if (v?.k !== 'p3') throw new Error(`${n} no es un punto del espacio`);
    return v.v;
  };

  it('uno() da el primer elemento de la lista', () => {
    const [x] = abatidoPlanta(A, B);
    expect(res.valores.get('primero')).toEqual({ k: 'p2', v: x });
  });

  it('segmento2() da el segmento de la lámina', () => {
    expect(res.valores.get('lado')).toMatchObject({ k: 'seg2', a: [A.x, A.y], b: [B.x, B.y] });
  });

  it('abatido_junto() deja el triángulo abatido entero, con sus lados', () => {
    casi(vm(p3('Bab'), p3('Cab')), vm(B, C));
    casi(vm(A, p3('Cab')), vm(A, C));
    casi(p3('Cab').z, A.z);
  });

  it('abatido_a_elegir() es una elección, y abatido_junto() la hereda: la figura cae entera hacia cualquiera de los dos lados', () => {
    const r = evaluaReceta(lamina, {
      escena: { ...escena, abc: 'plano(A, B, C)', h: 'horizontal_por(A, abc)' },
      solucion: { Bg: 'abatido_a_elegir(B, h, abc)', Cg: 'abatido_junto(C, h, abc, con: Bg, de: B)' },
    });
    const [Bg, Cg] = [r.valores.get('Bg'), r.valores.get('Cg')];
    expect(Bg).toMatchObject({ k: 'ramas', eleccion: 'Bg' });
    expect(Cg).toMatchObject({ k: 'ramas', eleccion: 'Bg' });
    if (Bg?.k !== 'ramas' || Cg?.k !== 'ramas') throw new Error('no son elecciones');
    for (const i of [0, 1]) {
      const [b, c] = [Bg.v[i], Cg.v[i]];
      if (b.k !== 'p3' || c.k !== 'p3') throw new Error('no son puntos');
      casi(vm(b.v, c.v), vm(B, C));
    }
  });

  it('uno() fuera de rango y segmento2() de longitud cero lanzan', () => {
    expect(() =>
      evaluaReceta(lamina, { escena: {}, solucion: { x: 'uno([1, 2], 3)' } }),
    ).toThrow(/tiene 2 elementos/);
    expect(() => evaluaReceta(lamina, { escena: {}, solucion: { x: 'uno([1, 2], 0)' } })).toThrow(/tiene 2 elementos/);
    expect(() =>
      evaluaReceta(lamina, { escena: {}, solucion: { x: 'segmento2(figura.punto("A1"), figura.punto("A1"))' } }),
    ).toThrow(/longitud cero/);
  });
});
