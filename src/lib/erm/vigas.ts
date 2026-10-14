/**
 * Tema 7 de ERM: vigas rectas horizontales con cualquier combinación de
 * apoyos, empotramientos y rótulas intermedias (vigas Gerber), escritas con
 * las cargas de `viga.ts`.
 *
 * Para quién y cuándo: los problemas de diagramas de los parciales 1, que son
 * vigas en los siete de los diez leídos que los traen (2012-2022). Qué gana:
 * que una viga del examen se escriba como se lee —«apoyo fijo en A, móvil en
 * B y C, rótula en E»— sin montar nudos ni barras a mano. Cómo se comprueba:
 * `tests/fisica/erm/esfuerzos.test.ts` resuelve aquí los cuatro casos de
 * `viga.test.ts` y exige que `viga.ts` y este motor den lo mismo en cada
 * punto, y `aceptacion.test.ts` resuelve la viga con rótula del 16-11-2018.
 *
 * No es un segundo modelo de viga (CLAUDE.md §01, Regla 0): las cargas son
 * los mismos tipos de `viga.ts`, con su convenio —x de izquierda a derecha,
 * P y q positivas hacia abajo, un par positivo el que tracciona la fibra
 * inferior—, y la estructura que se monta se resuelve en `estructura.ts`, con
 * el convenio del curso para los esfuerzos (V suma de fuerzas hacia arriba a
 * la izquierda, M > 0 tracciona la fibra inferior), que es el de `viga.ts`.
 */
import type { Carga as CargaViga, Viga } from '../viga';
import { resuelve, type Apoyo, type Carga, type Estructura, type Solucion } from './estructura';
import { esfuerzosEn, type Esfuerzos } from './esfuerzos';

export interface ApoyoViga {
  x: number;
  tipo: 'empotramiento' | 'articulado' | 'movil';
}

export interface VigaRecta {
  L: number;
  apoyos: ApoyoViga[];
  /** Abscisas de las rótulas intermedias. */
  rotulas?: number[];
  cargas: CargaViga[];
}

/** Nombre del nudo en la abscisa x de una viga recta. */
function idNudo(k: number): string {
  return `n${k}`;
}

/** Nudos en los extremos, los apoyos y las rótulas; una barra entre cada dos. */
export function vigaRecta(v: VigaRecta): Estructura {
  const tol = 1e-9 * v.L;
  const xs: number[] = [];
  for (const x of [0, v.L, ...v.apoyos.map((a) => a.x), ...(v.rotulas ?? [])]) {
    if (x < -tol || x > v.L + tol) throw new Error(`La abscisa ${x} está fuera de la viga.`);
    if (!xs.some((y) => Math.abs(y - x) < tol)) xs.push(x);
  }
  xs.sort((a, b) => a - b);
  const kDe = (x: number) => xs.findIndex((y) => Math.abs(y - x) < tol);
  const nudos = xs.map((x, k) => ({ id: idNudo(k), x, y: 0 }));
  const barras = xs.slice(1).map((_, k) => ({ id: `b${k}`, i: idNudo(k), j: idNudo(k + 1) }));
  const apoyos: Apoyo[] = v.apoyos.map((a) =>
    a.tipo === 'movil' ? { tipo: 'movil', nudo: idNudo(kDe(a.x)) } : { tipo: a.tipo, nudo: idNudo(kDe(a.x)) },
  );
  /* La barra que contiene x (si x es un nudo, la de su derecha; la última si es L). */
  const tramoDe = (x: number) => {
    for (let k = 0; k + 1 < xs.length; k++) if (x < xs[k + 1] - tol) return k;
    return xs.length - 2;
  };
  const cargas: Carga[] = [];
  const fuera = (x: number) => {
    if (x < -tol || x > v.L + tol) throw new Error(`La carga en ${x} está fuera de la viga (0 a ${v.L}).`);
  };
  for (const c of v.cargas) {
    if (c.tipo === 'repartida') {
      fuera(c.x1);
      fuera(c.x2);
      xs.slice(1).forEach((x1, k) => {
        const x0 = xs[k];
        const a = Math.max(c.x1, x0);
        const b = Math.min(c.x2, x1);
        if (b - a <= tol) return;
        const qEn = (x: number) => c.q1 + ((c.q2 - c.q1) * (x - c.x1)) / (c.x2 - c.x1);
        cargas.push({ tipo: 'repartida', barra: `b${k}`, s1: a - x0, s2: b - x0, q1: qEn(a), q2: qEn(b) });
      });
      continue;
    }
    fuera(c.x);
    const kn = kDe(c.x);
    /* Un par de `viga.ts` es positivo cuando tracciona la fibra inferior:
       horario. Aquí los pares son antihorarios: cambia el signo. */
    if (kn >= 0) {
      cargas.push(c.tipo === 'puntual' ? { tipo: 'nudo', nudo: idNudo(kn), Fy: -c.P } : { tipo: 'nudo', nudo: idNudo(kn), M: -c.M });
    } else {
      const k = tramoDe(c.x);
      const s = c.x - xs[k];
      cargas.push(c.tipo === 'puntual' ? { tipo: 'puntual', barra: `b${k}`, s, Fy: -c.P } : { tipo: 'par', barra: `b${k}`, s, M: -c.M });
    }
  }
  const rotulas = (v.rotulas ?? []).map((x) => idNudo(kDe(x)));
  return { nudos, barras, apoyos, rotulas, cargas };
}

/** La viga de `viga.ts` (apoyo fijo en xA, móvil en xB) como estructura de este motor. */
export function desdeViga(v: Viga): Estructura {
  return vigaRecta({
    L: v.L,
    apoyos: [
      { x: v.xA, tipo: 'articulado' },
      { x: v.xB, tipo: 'movil' },
    ],
    cargas: v.cargas,
  });
}

/** Una viga recta resuelta, con su estructura a mano para preguntar por x. */
export interface VigaResuelta {
  est: Estructura;
  sol: Solucion;
}

export function resuelveViga(v: VigaRecta): VigaResuelta {
  const est = vigaRecta(v);
  return { est, sol: resuelve(est) };
}

/**
 * N, V y M en la abscisa x de una viga recta resuelta. En un nudo, `izq`
 * pregunta por el final de la barra de la izquierda y `der` por el principio
 * de la de la derecha.
 */
export function esfuerzosViga(v: VigaResuelta, x: number, lado: 'izq' | 'der' = 'der'): Esfuerzos {
  const nudos = v.est.nudos;
  const L = nudos[nudos.length - 1].x;
  const tol = 1e-9 * L;
  if (x < -tol || x > L + tol) throw new Error(`La abscisa ${x} está fuera de la viga (0 a ${L}).`);
  for (let k = 0; k < v.est.barras.length; k++) {
    const x0 = nudos[k].x;
    const x1 = nudos[k + 1].x;
    const ultima = k === v.est.barras.length - 1;
    const enNudoFinal = Math.abs(x - x1) < tol;
    if (x < x1 - tol || (enNudoFinal && (lado === 'izq' || ultima))) {
      return esfuerzosEn(v.sol, `b${k}`, Math.min(Math.max(x - x0, 0), x1 - x0), lado);
    }
  }
  throw new Error(`La abscisa ${x} está fuera de la viga.`);
}
