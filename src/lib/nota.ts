/**
 * «¿Qué nota necesito?»: las cuentas de la calculadora de la página de
 * asignatura (fase E1 de la auditoría del 27 de septiembre de 2026).
 *
 * La prueba de utilidad de §13:
 *   · Para quién: el alumno a mitad de curso, con notas parciales.
 *   · Cuándo: después de un control o de un entregable, y antes de que se
 *     cierre el plazo de renuncia a la evaluación continua.
 *   · Qué gana: no suspender por una regla que no conocía. La media no es la
 *     única condición en casi ninguna asignatura: el 1,5 de 3,75 por
 *     cuatrimestre de Cálculo, el 4 en cada parte del examen de Materiales, el
 *     40 % del examen de Térmica, el 5 por bloque de Mecánica.
 *   · Cómo se comprueba: `tests/nota.test.ts` reproduce, leyendo el catálogo
 *     de verdad, el ejemplo que publica la propia Ciencia de Materiales (con
 *     3,5, 7, 4 y 9 hace falta un 6,8 en el examen) y una regla por
 *     asignatura.
 *
 * Aquí no hay datos: las reglas viven en el catálogo, en la `evaluacion` de
 * cada asignatura, y este módulo solo las cuenta. Una regla que la guía no da
 * no se codifica, así que la calculadora no dice nada que no esté escrito.
 */

export type Entrena = 'si' | 'parcial' | 'no';

export interface Subparte {
  id: string;
  que: string;
  /** Porcentaje dentro de su parte; las de una parte suman 100. */
  peso: number;
  /** Nota mínima, sobre 10, que pide la guía en esta subparte. */
  minimo?: number;
  /** La nota más alta del acta si este mínimo no se cumple, cuando la guía la da. */
  tope?: number;
}

export interface Parte {
  id: string;
  que: string;
  /** Porcentaje de la modalidad. */
  peso: number;
  entrena?: Entrena;
  fuera?: string;
  minimo?: number;
  tope?: number;
  sub?: Subparte[];
}

/** Una suma ponderada **sin renormalizar** que tiene que llegar a `puntos`:
 *  en Materiales, el examen y los trabajos, que valen 8 puntos entre los dos,
 *  tienen que sumar al menos 5. */
export interface Grupo {
  que: string;
  partes: string[];
  puntos: number;
}

export interface Modalidad {
  nombre: string;
  partes: Parte[];
  nota?: string;
  aprueba?: number;
  grupos?: Grupo[];
}

export interface Hoja {
  /** `parte` o `parte.subparte`: la clave de su casilla. */
  id: string;
  que: string;
  /** Lo que pesa en la nota final, en fracción de 1. */
  peso: number;
  /** Lo que pesa dentro de su parte, en fracción de 1. */
  enParte: number;
  parte: string;
  minimo?: number;
  tope?: number;
}

export interface ParteDelModelo {
  id: string;
  que: string;
  peso: number;
  minimo?: number;
  tope?: number;
  hojas: Hoja[];
}

export interface Modelo {
  aprueba: number;
  partes: ParteDelModelo[];
  hojas: Hoja[];
  grupos: Grupo[];
}

export interface MinimoQueFalla {
  id: string;
  que: string;
  minimo: number;
  nota: number;
  tope?: number;
}

export interface GrupoQueFalla {
  que: string;
  suma: number;
  puntos: number;
}

export interface Resultado {
  media: number;
  partes: Record<string, number>;
  minimosQueFallan: MinimoQueFalla[];
  gruposQueFallan: GrupoQueFalla[];
  /** La nota del acta: la media, o, si la media llega pero falla un mínimo con
   *  tope, el tope más bajo. */
  final: number;
  aprueba: boolean;
}

export interface Necesidad {
  /** La nota que hace falta en cada casilla en blanco, redondeada hacia arriba
   *  a la décima. `null` si no se llega ni con un 10, o si no hay huecos. */
  nota: number | null;
  /** Qué condición la decide. */
  manda: { tipo: 'media' | 'minimo' | 'grupo' | 'nada'; que: string };
  huecos: string[];
  /** Mínimos de casillas ya rellenas que no se cumplen: con ellos no se
   *  aprueba haga lo que haga en lo que falta. */
  yaFallan: MinimoQueFalla[];
}

/* Las notas se comparan con holgura de milésima de milésima: 0,6 no es exacto
   en binario, y una media de 4,9999999999 no puede suspender a nadie. */
const EPS = 1e-9;

export function modelo(m: Modalidad): Modelo {
  const partes: ParteDelModelo[] = m.partes.map((p) => {
    const hojas: Hoja[] = p.sub?.length
      ? p.sub.map((s) => ({
          id: `${p.id}.${s.id}`,
          que: s.que,
          peso: (p.peso / 100) * (s.peso / 100),
          enParte: s.peso / 100,
          parte: p.id,
          minimo: s.minimo,
          tope: s.tope,
        }))
      : [{ id: p.id, que: p.que, peso: p.peso / 100, enParte: 1, parte: p.id }];
    return { id: p.id, que: p.que, peso: p.peso / 100, minimo: p.minimo, tope: p.tope, hojas };
  });
  return {
    aprueba: m.aprueba ?? 5,
    partes,
    hojas: partes.flatMap((p) => p.hojas),
    grupos: m.grupos ?? [],
  };
}

const notaDeParte = (p: ParteDelModelo, notas: Record<string, number>) =>
  p.hojas.reduce((s, h) => s + h.enParte * notas[h.id], 0);

export function evalua(mo: Modelo, notas: Record<string, number>): Resultado {
  for (const h of mo.hojas) {
    if (!Number.isFinite(notas[h.id])) throw new Error(`falta la nota de «${h.que}» (${h.id})`);
  }
  const media = mo.hojas.reduce((s, h) => s + h.peso * notas[h.id], 0);
  const partes = Object.fromEntries(mo.partes.map((p) => [p.id, notaDeParte(p, notas)]));

  const minimosQueFallan: MinimoQueFalla[] = [];
  for (const p of mo.partes) {
    for (const h of p.hojas) {
      if (h.minimo !== undefined && h.enParte < 1 && notas[h.id] < h.minimo - EPS) {
        minimosQueFallan.push({ id: h.id, que: h.que, minimo: h.minimo, nota: notas[h.id], tope: h.tope });
      }
    }
    if (p.minimo !== undefined && partes[p.id] < p.minimo - EPS) {
      minimosQueFallan.push({ id: p.id, que: p.que, minimo: p.minimo, nota: partes[p.id], tope: p.tope });
    }
  }

  const gruposQueFallan: GrupoQueFalla[] = [];
  for (const g of mo.grupos) {
    const suma = mo.partes.filter((p) => g.partes.includes(p.id)).reduce((s, p) => s + p.peso * partes[p.id], 0);
    if (suma < g.puntos - EPS) gruposQueFallan.push({ que: g.que, suma, puntos: g.puntos });
  }

  /* El tope se aplica cuando la media llega. Es como lo escriben las guías
     —«si la suma de todas las notas es mayor o igual que cinco sin cumplir esa
     condición, la nota será 4,5», dice la de Cálculo—, y por debajo de 5 la
     guía no dice qué va al acta, así que tampoco se dice aquí. */
  const topes = minimosQueFallan.map((f) => f.tope).filter((t): t is number => t !== undefined);
  const final = topes.length && media >= mo.aprueba - EPS ? Math.min(media, ...topes) : media;
  const aprueba = media >= mo.aprueba - EPS && !minimosQueFallan.length && !gruposQueFallan.length;
  return { media, partes, minimosQueFallan, gruposQueFallan, final, aprueba };
}

/** Una condición lineal en la nota g de las casillas en blanco: a·g + b ≥ rhs. */
interface Condicion {
  tipo: 'media' | 'minimo' | 'grupo';
  que: string;
  a: number;
  b: number;
  rhs: number;
}

const redondeaArriba = (x: number) => Math.ceil(x * 10 - EPS) / 10;

export function necesito(mo: Modelo, notas: Record<string, number | undefined>): Necesidad {
  const conocida = (id: string) => Number.isFinite(notas[id]);
  const valor = (id: string) => notas[id] as number;
  const huecos = mo.hojas.filter((h) => !conocida(h.id)).map((h) => h.id);

  /* Los mínimos que ya no se cumplen con lo que está relleno: una casilla, o
     una parte que no tiene ninguna casilla en blanco. */
  const yaFallan: MinimoQueFalla[] = [];
  for (const p of mo.partes) {
    for (const h of p.hojas) {
      if (h.minimo !== undefined && h.enParte < 1 && conocida(h.id) && valor(h.id) < h.minimo - EPS) {
        yaFallan.push({ id: h.id, que: h.que, minimo: h.minimo, nota: valor(h.id), tope: h.tope });
      }
    }
    const llena = p.hojas.every((h) => conocida(h.id));
    if (p.minimo !== undefined && llena) {
      const n = p.hojas.reduce((s, h) => s + h.enParte * valor(h.id), 0);
      if (n < p.minimo - EPS) yaFallan.push({ id: p.id, que: p.que, minimo: p.minimo, nota: n, tope: p.tope });
    }
  }

  if (!huecos.length) return { nota: null, manda: { tipo: 'nada', que: '' }, huecos, yaFallan };
  if (yaFallan.length) {
    return { nota: null, manda: { tipo: 'minimo', que: yaFallan[0].que }, huecos, yaFallan };
  }

  const enHuecos = (hs: Hoja[], peso: (h: Hoja) => number) => ({
    a: hs.filter((h) => !conocida(h.id)).reduce((s, h) => s + peso(h), 0),
    b: hs.filter((h) => conocida(h.id)).reduce((s, h) => s + peso(h) * valor(h.id), 0),
  });

  const condiciones: Condicion[] = [
    { tipo: 'media', que: 'la media', ...enHuecos(mo.hojas, (h) => h.peso), rhs: mo.aprueba },
  ];
  for (const p of mo.partes) {
    for (const h of p.hojas) {
      if (h.minimo !== undefined && h.enParte < 1 && !conocida(h.id)) {
        condiciones.push({ tipo: 'minimo', que: h.que, a: 1, b: 0, rhs: h.minimo });
      }
    }
    if (p.minimo !== undefined && p.hojas.some((h) => !conocida(h.id))) {
      condiciones.push({ tipo: 'minimo', que: p.que, ...enHuecos(p.hojas, (h) => h.enParte), rhs: p.minimo });
    }
  }
  for (const g of mo.grupos) {
    const hojas = mo.partes.filter((p) => g.partes.includes(p.id)).flatMap((p) => p.hojas);
    condiciones.push({ tipo: 'grupo', que: g.que, ...enHuecos(hojas, (h) => h.peso), rhs: g.puntos });
  }

  let g = 0;
  let manda: Necesidad['manda'] = { tipo: 'media', que: 'la media' };
  for (const c of condiciones) {
    if (c.a < EPS) {
      /* Una condición en la que no entra ninguna casilla en blanco: o ya se
         cumple, o no se va a cumplir haga lo que haga. */
      if (c.b < c.rhs - EPS) return { nota: null, manda: { tipo: c.tipo, que: c.que }, huecos, yaFallan };
      continue;
    }
    const cota = (c.rhs - c.b) / c.a;
    if (cota > g + EPS) {
      g = cota;
      manda = { tipo: c.tipo, que: c.que };
    }
  }

  const nota = redondeaArriba(g);
  return { nota: nota > 10 + EPS ? null : nota, manda, huecos, yaFallan };
}
