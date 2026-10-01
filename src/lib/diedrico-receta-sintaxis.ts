/**
 * El analizador: de una línea de receta a un árbol.
 *
 * Parte de las recetas de Expresión Gráfica: el porqué y la gramática están en
 * `diedrico-receta.ts`, que es la API pública. Se partió en cuatro ficheros el
 * 1 de octubre de 2026 (fase K, tanda 0 b), sin cambiar nada de lo que hace,
 * para que quepan las funciones de los lotes siguientes.
 */
import { propio } from './diedrico-receta-valores';

/* ═══════════════════════════════ el analizador ═══════════════════════════ */

export type Operador = '+' | '-' | '*' | '/';

export type Nodo =
  | { tipo: 'numero'; v: number }
  | { tipo: 'texto'; v: string }
  | { tipo: 'nombre'; v: string }
  | { tipo: 'miembro'; objeto: string; campo: string }
  | { tipo: 'llamada'; nombre: string; objeto?: string; args: Nodo[]; porNombre: Record<string, Nodo> }
  | { tipo: 'lista'; elementos: Nodo[] }
  | { tipo: 'cuenta'; op: Operador; a: Nodo; b: Nodo }
  | { tipo: 'no'; de: Nodo }
  | { tipo: 'y'; de: Nodo[] };

export interface Ficha {
  t: 'num' | 'txt' | 'id' | 'p' | 'fin';
  v: string;
}

export function fichas(src: string): Ficha[] {
  const out: Ficha[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    if (c === '&' && src[i + 1] === '&') { out.push({ t: 'p', v: '&&' }); i += 2; continue; }
    if ('()[],:.!+-*/'.includes(c)) { out.push({ t: 'p', v: c }); i++; continue; }
    if (c === '"') {
      const j = src.indexOf('"', i + 1);
      if (j < 0) throw new Error(`falta la comilla que cierra el texto de la posición ${i}`);
      out.push({ t: 'txt', v: src.slice(i + 1, j) });
      i = j + 1;
      continue;
    }
    const num = /^\d+(\.\d+)?/.exec(src.slice(i));
    if (num) { out.push({ t: 'num', v: num[0] }); i += num[0].length; continue; }
    const id = /^[\p{L}_][\p{L}\p{N}_]*/u.exec(src.slice(i));
    if (id) { out.push({ t: 'id', v: id[0] }); i += id[0].length; continue; }
    throw new Error(`no entiendo «${c}» en la posición ${i}`);
  }
  out.push({ t: 'fin', v: '' });
  return out;
}

/** El árbol de una expresión de receta. Lanza con un mensaje que dice qué
 *  faltaba o qué sobraba. */
export function analiza(src: string): Nodo {
  const T = fichas(src);
  let p = 0;
  const mira = () => T[p];
  const esP = (v: string) => mira().t === 'p' && mira().v === v;
  const come = (v: string) => {
    const f = T[p];
    if (f.t === 'p' && f.v === v) { p++; return; }
    throw new Error(f.t === 'fin' ? `falta «${v}» al final de «${src}»` : `no esperaba «${f.v}» en «${src}»: faltaba «${v}»`);
  };

  /* De menos a más fuerte: `&&`, `!`, suma y resta, producto y cociente, el
     signo menos, y lo demás. */
  function expresion(): Nodo {
    const primero = unario();
    if (!esP('&&')) return primero;
    const de = [primero];
    while (esP('&&')) { p++; de.push(unario()); }
    return { tipo: 'y', de };
  }

  function unario(): Nodo {
    if (esP('!')) { p++; return { tipo: 'no', de: unario() }; }
    return suma();
  }

  function suma(): Nodo {
    let a = producto();
    while (esP('+') || esP('-')) {
      const op = mira().v as Operador;
      p++;
      a = { tipo: 'cuenta', op, a, b: producto() };
    }
    return a;
  }

  function producto(): Nodo {
    let a = signo();
    while (esP('*') || esP('/')) {
      const op = mira().v as Operador;
      p++;
      a = { tipo: 'cuenta', op, a, b: signo() };
    }
    return a;
  }

  function signo(): Nodo {
    if (esP('-')) { p++; return { tipo: 'cuenta', op: '-', a: { tipo: 'numero', v: 0 }, b: signo() }; }
    return primario();
  }

  function argumentos(): { args: Nodo[]; porNombre: Record<string, Nodo> } {
    come('(');
    const args: Nodo[] = [];
    const porNombre: Record<string, Nodo> = {};
    if (esP(')')) { p++; return { args, porNombre }; }
    for (;;) {
      if (mira().t === 'id' && T[p + 1].t === 'p' && T[p + 1].v === ':') {
        const nombre = mira().v;
        if (propio(porNombre, nombre)) throw new Error(`«${nombre}:» aparece dos veces en «${src}»`);
        p += 2;
        porNombre[nombre] = expresion();
      } else {
        args.push(expresion());
      }
      if (esP(',')) { p++; continue; }
      come(')');
      return { args, porNombre };
    }
  }

  function primario(): Nodo {
    const f = mira();
    if (f.t === 'num') { p++; return { tipo: 'numero', v: Number(f.v) }; }
    if (f.t === 'txt') { p++; return { tipo: 'texto', v: f.v }; }
    if (f.t === 'p' && f.v === '[') {
      p++;
      const elementos: Nodo[] = [];
      if (!esP(']')) {
        for (;;) {
          elementos.push(expresion());
          if (esP(',')) { p++; continue; }
          break;
        }
      }
      come(']');
      return { tipo: 'lista', elementos };
    }
    if (f.t === 'p' && f.v === '(') {
      p++;
      const dentro = expresion();
      come(')');
      return dentro;
    }
    if (f.t === 'id') {
      p++;
      if (esP('.')) {
        p++;
        const campo = mira();
        if (campo.t !== 'id') throw new Error(`después de «${f.v}.» esperaba un nombre en «${src}»`);
        p++;
        if (esP('(')) return { tipo: 'llamada', objeto: f.v, nombre: campo.v, ...argumentos() };
        return { tipo: 'miembro', objeto: f.v, campo: campo.v };
      }
      if (esP('(')) return { tipo: 'llamada', nombre: f.v, ...argumentos() };
      return { tipo: 'nombre', v: f.v };
    }
    if (f.t === 'fin') throw new Error(`la expresión «${src}» se corta antes de tiempo`);
    throw new Error(`no esperaba «${f.v}» en «${src}»`);
  }

  const arbol = expresion();
  if (mira().t !== 'fin') throw new Error(`no esperaba «${mira().v}» en «${src}»`);
  return arbol;
}
