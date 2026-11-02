import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';
import { describe, expect, it } from 'vitest';

/* Los dos exámenes de diédrico de 2025-26 (carpeta «dibujo», 2 de noviembre de
   2026). Las recetas ya las evalúa `talleres`; esto es el segundo camino: cada
   resultado publicado se recalcula aquí con vectores, desde las coordenadas de la
   lámina y sin pasar por ninguna función de la receta, y tiene que salir lo mismo. */

type P3 = [number, number, number];
type Lamina = { puntos: Record<string, { x: number; y: number }> };
type Paso = { tipo: string; titulo?: string; respuesta?: { valor: string } };
type Ejercicio = { id: string; antes?: unknown; pasos: Paso[] };

const RAIZ = process.cwd();
const PT_A_MM = 25.4 / 72;
const lamina = (id: string): Lamina =>
  JSON.parse(readFileSync(join(RAIZ, 'src/content/laminas', `${id}.json`), 'utf8')) as Lamina;
const examen = (slug: string) =>
  yaml.load(readFileSync(join(RAIZ, 'src/content/expresion-grafica/examenes', slug, 'examen.yaml'), 'utf8')) as {
    pdf: string;
    puntosImpresos: { reparto: { n: number; puntos: number }[] };
    ejercicios: { id: string; n: number }[];
  };
const ejercicios = (slug: string) =>
  (yaml.load(readFileSync(join(RAIZ, 'src/content/expresion-grafica/examenes', slug, 'ejercicios.yaml'), 'utf8')) as {
    ejercicios: Ejercicio[];
  }).ejercicios;

/* Un punto del papel, en el espacio: x, alejamiento (la planta crece hacia abajo)
   y cota (el alzado crece hacia arriba). */
const p3 = (L: Lamina, alzado: string, planta: string): P3 => [
  L.puntos[planta].x,
  L.puntos[planta].y,
  -L.puntos[alzado].y,
];
const resta = (a: P3, b: P3): P3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const suma = (a: P3, b: P3): P3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const por = (a: P3, k: number): P3 => [a[0] * k, a[1] * k, a[2] * k];
const punto = (a: P3, b: P3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cruz = (a: P3, b: P3): P3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const largo = (a: P3) => Math.sqrt(punto(a, a));
const grados = (rad: number) => (rad * 180) / Math.PI;

const pides = (slug: string, inicio: string) => {
  const ej = ejercicios(slug).find((e) => e.id.startsWith(inicio));
  if (!ej) throw new Error(`no está ${inicio}`);
  const calc = ej.pasos.find((p) => p.tipo === 'calcular');
  if (!calc?.respuesta) throw new Error(`${inicio} no tiene paso calcular`);
  return Number(calc.respuesta.valor);
};

/* El tramo de una recta que queda dentro de un conjunto de semiespacios. */
const dentro = (a: P3, b: P3, planos: { n: P3; p: P3; interior: P3 }[]) => {
  const d = resta(b, a);
  let t0 = -Infinity;
  let t1 = Infinity;
  for (const { n, p, interior } of planos) {
    const signo = Math.sign(punto(n, resta(interior, p)));
    const num = punto(n, resta(p, a)) * signo;
    const den = punto(n, d) * signo;
    if (Math.abs(den) < 1e-9) continue;
    const t = num / den;
    if (den > 0) t0 = Math.max(t0, t);
    else t1 = Math.min(t1, t);
  }
  return [t0, t1] as const;
};

describe('El control de 2025-26', () => {
  const C = 'exeg-2526c-';
  const SLUG = '2025-2026-1c-control';
  /* 1:100: 1 mm de la lámina son 0,1 m. */
  const aMetros = (pt: number) => pt * PT_A_MM * 0.1;

  it('imprime 10 puntos, y cada entrada está resuelta y con su caja', () => {
    const e = examen(SLUG);
    expect(e.puntosImpresos.reparto.reduce((s, r) => s + r.puntos, 0)).toBe(10);
    const ej = ejercicios(SLUG);
    expect(ej.map((x) => x.id).sort()).toEqual(e.ejercicios.map((x) => x.id).sort());
    for (const x of ej) expect(x.antes, x.id).toBeDefined();
  });

  it('1: la distancia entre AA′ y CC′ son 2,00 m', () => {
    const L = lamina('ex2526c-1');
    const A = p3(L, 'A2', 'A1');
    const Ap = p3(L, 'A2p', 'A1p');
    const CC = p3(L, 'C2', 'C1');
    const d = resta(Ap, A);
    const t = aMetros(largo(cruz(resta(CC, A), d)) / largo(d));
    expect(t).toBeCloseTo(2, 2);
    expect(pides(SLUG, `${C}1`)).toBeCloseTo(t, 2);
  });

  it('2: con VF de 6 m y la pirámide recta, la altura son 4,85 m', () => {
    const L = lamina('ex2526c-2');
    const cx = (L.puntos.D1.x + L.puntos.F1.x) / 2;
    const cy = (L.puntos.D1.y + L.puntos.F1.y) / 2;
    const plantaVF = aMetros(Math.hypot(L.puntos.F1.x - cx, L.puntos.F1.y - cy));
    const h = Math.sqrt(36 - plantaVF * plantaVF);
    expect(pides(SLUG, `${C}2`)).toBeCloseTo(h, 1);
    expect(h).toBeCloseTo(4.85, 2);
  });

  it('3: el diedro de las caras EDV y GDV es 96,49°, y su suplementario también vale', () => {
    const L = lamina('ex2526c-3');
    const V = p3(L, 'V2', 'V1');
    const D = p3(L, 'D2', 'D1');
    const E = p3(L, 'E2', 'E1');
    const G = p3(L, 'G2', 'G1');
    const u = por(resta(V, D), 1 / largo(resta(V, D)));
    const quita = (w: P3): P3 => resta(w, por(u, punto(w, u)));
    const a = quita(resta(E, D));
    const b = quita(resta(G, D));
    const alfa = grados(Math.acos(punto(a, b) / (largo(a) * largo(b))));
    expect(alfa).toBeCloseTo(pides(SLUG, `${C}3`), 1);
    const ej = ejercicios(SLUG).find((x) => x.id.startsWith(`${C}3`))!;
    const calc = ej.pasos.find((p) => p.tipo === 'calcular') as unknown as { tambienValen: { valor: string }[] };
    expect(Number(calc.tambienValen[0].valor)).toBeCloseTo(180 - alfa, 1);
  });

  it('4: VF mide 7,84 m', () => {
    const L = lamina('ex2526c-4');
    const vf = aMetros(largo(resta(p3(L, 'V2', 'V1'), p3(L, 'F2', 'F1'))));
    expect(vf).toBeCloseTo(pides(SLUG, `${C}4`), 2);
  });

  it('5: de VD quedan 1,15 m dentro del prisma', () => {
    const L = lamina('ex2526c-5');
    const A = p3(L, 'A2', 'A1');
    const B = p3(L, 'B2', 'B1');
    const CC = p3(L, 'C2', 'C1');
    const d = resta(p3(L, 'A2p', 'A1p'), A);
    const V = p3(L, 'V2', 'V1');
    const D = p3(L, 'D2', 'D1');
    const [t0, t1] = dentro(V, D, [
      { n: cruz(d, resta(B, A)), p: A, interior: CC },
      { n: cruz(d, resta(CC, B)), p: B, interior: A },
      { n: cruz(d, resta(A, CC)), p: CC, interior: B },
    ]);
    expect(t1).toBeGreaterThan(t0);
    expect(aMetros((t1 - t0) * largo(resta(D, V)))).toBeCloseTo(pides(SLUG, `${C}5`), 2);
  });
});

describe('La ordinaria de 2025-26', () => {
  const O = 'exeg-2526o-';
  const SLUG = '2025-2026-ord';
  /* La cota de 100 m entre dos vértices de la base mide 50 mm: 1 mm son 2 m. */
  const aMetros = (pt: number) => pt * PT_A_MM * 2;

  it('imprime 10 puntos, y cada entrada está resuelta y con su caja', () => {
    const e = examen(SLUG);
    expect(e.puntosImpresos.reparto.reduce((s, r) => s + r.puntos, 0)).toBe(10);
    const ej = ejercicios(SLUG);
    expect(ej.map((x) => x.id).sort()).toEqual(e.ejercicios.map((x) => x.id).sort());
    for (const x of ej) expect(x.antes, x.id).toBeDefined();
  });

  it('la cota de 100 m son los 50 mm de la lámina', () => {
    const L = lamina('ex2526o-3b');
    expect((L.puntos.S1.x - L.puntos.U1.x) * PT_A_MM).toBeCloseTo(50, 1);
  });

  it('1: el rayo forma 34,11° con el espejo', () => {
    const L = lamina('ex2526o-1');
    /* Los finales dibujados de r₂ y r₁ son dos flechas, no el mismo punto: no caen
       en la misma vertical. El rayo se saca con I, donde r₁ corta al espejo. */
    const { F1, F2, R1, R2, CB1, DA1 } = L.puntos;
    const ux = R1.x - F1.x;
    const uy = R1.y - F1.y;
    const vx = DA1.x - CB1.x;
    const vy = DA1.y - CB1.y;
    const k = ((CB1.x - F1.x) * vy - (CB1.y - F1.y) * vx) / (ux * vy - uy * vx);
    const Ix = F1.x + k * ux;
    const Iy = F1.y + k * uy;
    const I2y = F2.y + ((Ix - F2.x) / (R2.x - F2.x)) * (R2.y - F2.y);
    const d: P3 = [Ix - F1.x, Iy - F1.y, F2.y - I2y];
    /* El espejo es vertical: su normal es horizontal y perpendicular a su planta. */
    const m: P3 = [vx, vy, 0];
    const n: P3 = [-m[1], m[0], 0];
    const alfa = grados(Math.asin(Math.abs(punto(d, n)) / (largo(d) * largo(n))));
    expect(alfa).toBeCloseTo(pides(SLUG, `${O}1`), 1);
  });

  it('2: el ángulo de ABC en C es 41,97°', () => {
    const L = lamina('ex2526o-2');
    const A = p3(L, 'A2', 'A1');
    const B = p3(L, 'B2', 'B1');
    const CC = p3(L, 'C2', 'C1');
    const a = resta(A, CC);
    const b = resta(B, CC);
    expect(grados(Math.acos(punto(a, b) / (largo(a) * largo(b))))).toBeCloseTo(pides(SLUG, `${O}2`), 1);
  });

  it('3.1: el agujero de 40 m de lado se lleva 34,65 m de la arista VR', () => {
    const L = lamina('ex2526o-3a');
    const A = p3(L, 'A2', 'A1');
    const B = p3(L, 'B2', 'B1');
    const V = p3(L, 'V2', 'V1');
    const R = p3(L, 'S2', 'R1');
    const u = por(resta(B, A), 1 / largo(resta(B, A)));
    const e1: P3 = [1, 0, 0];
    const e2 = cruz(u, e1);
    const medio = (40 / 2 / PT_A_MM) / 2;
    const [t0, t1] = dentro(V, R, [
      { n: e1, p: suma(A, por(e1, medio)), interior: A },
      { n: e1, p: suma(A, por(e1, -medio)), interior: A },
      { n: e2, p: suma(A, por(e2, medio)), interior: A },
      { n: e2, p: suma(A, por(e2, -medio)), interior: A },
    ]);
    expect(aMetros((t1 - t0) * largo(resta(R, V)))).toBeCloseTo(pides(SLUG, `${O}3a`), 1);
  });

  it('3.2: la distancia entre AB y r son 50,35 m', () => {
    const L = lamina('ex2526o-3b');
    const A = p3(L, 'A2', 'A1');
    const B = p3(L, 'B2', 'B1');
    const V = p3(L, 'V2', 'V1');
    const S = p3(L, 'S2', 'S1');
    const n = cruz(resta(B, A), resta(S, V));
    const d = aMetros(Math.abs(punto(resta(V, A), n)) / largo(n));
    expect(d).toBeCloseTo(pides(SLUG, `${O}3b`), 1);
  });
});

describe('La ruta del control', () => {
  const ruta = readFileSync(join(RAIZ, 'src/content/preparar/expresion-grafica-1c-control.yaml'), 'utf8');

  it('cita las nueve piezas de los dos exámenes', () => {
    for (const slug of ['2025-2026-1c-control', '2025-2026-ord']) {
      for (const { id } of examen(slug).ejercicios) expect(ruta, id).toContain(`- id: ${id}`);
    }
  });

  it('los puntos que publica de cada construcción suman los 20 de los dos exámenes', () => {
    /* figura plana C2 C4 O2; intersecciones C5 O3.1; ángulos C3 y el α de O1;
       rectas C1 O3.2; perpendicular, la trayectoria de O1. */
    expect(1.5 + 1.5 + 1.5 + (4 + 3) + (1.5 + 2) + (1.5 + 1.5) + 2).toBe(20);
    expect(ruta.replace(/\s+/g, ' ')).toContain('La figura plana da 4,5, los ángulos 3,5, las rectas que se cruzan 3 y la perpendicular 2');
  });
});
