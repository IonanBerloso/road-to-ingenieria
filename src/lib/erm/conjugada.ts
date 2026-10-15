/**
 * Tema 10 de ERM: el método de la viga conjugada (apartado 10.5 de los
 * apuntes), el que usan las soluciones 10.3 y 10.4 de la colección y siete
 * de los problemas de flechas de examen («por viga conjugada»).
 *
 * Para quién: para quien tenga que resolver o explicar un problema con ese
 * método, y como segundo camino de `elastica.ts`. Cuándo: vigas isostáticas
 * rectas, con rótulas y EI por tramos. Qué gana: θ y v leídos como cortante y
 * flector de una viga ficticia que se resuelve con la estática del tema 7
 * (`vigas.ts` y `estructura.ts`), sin integrar. Cómo se comprueba:
 * `tests/fisica/erm/elastica.test.ts` resuelve con él las vigas 10.3 y 10.4
 * (θB = −θA = 3Pa²/2EI, δC = 5Pa³/3EI; θC = qa³/2EI, vC = 11qa⁴/24EI) y la
 * compara con `elastica.ts` en otras.
 *
 * EL CONVENIO ES EL DEL CURSO (tema 10, pp. 11-13): la viga conjugada lleva
 * la carga q* = M/EIz, positiva hacia abajo como q; su cortante T* es el giro
 * θ de la real y su flector M*, la flecha v (la tabla de la p. 12:
 * d(T*)/dx = −q* y d(M*)/dx = T*). Los apoyos se cambian según la figura 10.9
 * (pp. 12-13): apoyo simple en un extremo → apoyo simple; borde libre →
 * empotramiento; empotramiento → borde libre; apoyo intermedio → rótula
 * intermedia; rótula intermedia → apoyo intermedio.
 *
 * Cómo se monta la carga: q* es un polinomio a trozos; en cada trozo entre
 * puntos singulares (y los puntos por los que se pregunta) se pone su
 * resultante, ∫q*, en el centro del trozo, y el par ∫q*·(s − centro): así el
 * flector y el cortante conjugados son exactos en los bordes de cada trozo,
 * que es donde se pregunta.
 */
import type { Carga } from '../viga';
import { integra, rigidezPorTramos, type TramoEI } from './elastica';
import { esfuerzosViga, resuelveViga, type ApoyoViga, type VigaRecta } from './vigas';

export interface ConjugadaResuelta {
  /** La viga conjugada que se ha montado (apoyos cambiados, carga q*). */
  conjugada: VigaRecta;
  /** θ(x) = T*(x) y v(x) = M*(x), solo en los puntos por los que se preguntó (o singulares). */
  theta: (x: number, lado?: 'izq' | 'der') => number;
  v: (x: number) => number;
}

/** Los apoyos de la conjugada (figura 10.9). */
function apoyosConjugados(v: VigaRecta): { apoyos: ApoyoViga[]; rotulas: number[] } {
  const tol = 1e-9 * v.L;
  const extremo = (x: number) => Math.abs(x) < tol || Math.abs(x - v.L) < tol;
  const apoyos: ApoyoViga[] = [];
  const rotulas: number[] = [];
  for (const x of [0, v.L]) {
    const a = v.apoyos.find((p) => Math.abs(p.x - x) < tol);
    if (!a) apoyos.push({ x, tipo: 'empotramiento' });
    else if (a.tipo !== 'empotramiento') apoyos.push({ x, tipo: 'movil' });
  }
  for (const a of v.apoyos) {
    if (extremo(a.x)) continue;
    if (a.tipo === 'empotramiento') throw new Error('Un empotramiento intermedio no tiene conjugado en la figura 10.9.');
    rotulas.push(a.x);
  }
  for (const r of v.rotulas ?? []) apoyos.push({ x: r, tipo: 'movil' });
  /* La conjugada solo lleva cargas verticales y aquí solo hay empotramientos
     y móviles. Con dos empotramientos (una viga real con los dos extremos
     libres), la estática del tema 7 vería una reacción horizontal de más: la
     horizontal la fija el primero y los demás son deslizantes. Sin
     empotramientos, todo son móviles, que con cargas verticales la estática
     resuelve igual (la horizontal no trabaja). */
  const fijo = apoyos.findIndex((a) => a.tipo === 'empotramiento');
  const conHorizontal = apoyos.map((a, k): ApoyoViga => (a.tipo === 'empotramiento' && k !== fijo ? { ...a, deslizante: true } : a));
  return { apoyos: conHorizontal, rotulas };
}

/**
 * Resuelve la viga real (isostática), monta su conjugada y la resuelve. `EI`
 * uniforme o por tramos; `consultas`, las abscisas donde se quiere θ y v
 * exactos (los puntos singulares lo son siempre).
 */
export function vigaConjugada(v: VigaRecta, EI: number | readonly TramoEI[], consultas: readonly number[] = []): ConjugadaResuelta {
  const rig = rigidezPorTramos(v.L, EI);
  const real = resuelveViga(v);
  const sing = new Set<number>([0, v.L, ...consultas]);
  for (const a of v.apoyos) sing.add(a.x);
  for (const r of v.rotulas ?? []) sing.add(r);
  for (const c of v.cargas) {
    if (c.tipo === 'repartida') {
      sing.add(c.x1);
      sing.add(c.x2);
    } else sing.add(c.x);
  }
  if (typeof EI !== 'number') for (const t of EI) sing.add(t.x0), sing.add(t.x1);
  const xs = [...sing].filter((x) => x >= 0 && x <= v.L).sort((a, b) => a - b);
  const qEst = (s: number) => esfuerzosViga(real, s).M / rig(s);
  const cargas: Carga[] = [];
  for (let k = 0; k + 1 < xs.length; k++) {
    const a = xs[k];
    const b = xs[k + 1];
    if (b - a <= 1e-12 * v.L) continue;
    const m = (a + b) / 2;
    const R = integra(qEst, a, b, []);
    const C = integra((s) => qEst(s) * (s - m), a, b, []);
    if (R !== 0) cargas.push({ tipo: 'puntual', x: m, P: R });
    if (C !== 0) cargas.push({ tipo: 'par', x: m, M: C });
  }
  const { apoyos, rotulas } = apoyosConjugados(v);
  const conjugada: VigaRecta = { L: v.L, apoyos, rotulas, cargas };
  const sol = resuelveViga(conjugada);
  return {
    conjugada,
    theta: (x, lado = 'der') => esfuerzosViga(sol, x, lado).V,
    v: (x) => esfuerzosViga(sol, x).M,
  };
}
