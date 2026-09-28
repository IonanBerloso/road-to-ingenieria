/**
 * «¿Qué nota necesito?» (fase E1 de la auditoría del 27 de septiembre de 2026).
 *
 * Cada caso sale de la regla de una guía docente tal como la escribe el
 * catálogo, y se lee **del catálogo de verdad**: si un día se codifica mal una
 * regla, falla aquí y no en la cuenta de un alumno. El primero es el ejemplo
 * que la propia asignatura publica: la diapositiva 20 de la presentación de
 * Ciencia de Materiales (2025-26) dice que con 3,5, 7, 4 y 9 en los trabajos
 * hace falta un 6,8 en el examen, y que con un 5 la parte teórica se queda en
 * 3,9.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { modelo, evalua, necesito, type Modalidad } from '../src/lib/nota';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const CATALOGO = join(RAIZ, 'src', 'content', 'catalogo');

type Asignatura = { evaluacion?: { modalidades: Modalidad[] } };
const cat = (id: string) => JSON.parse(readFileSync(join(CATALOGO, `${id}.json`), 'utf8')) as Asignatura;
const modalidad = (id: string, nombre: string): Modalidad => {
  const m = cat(id).evaluacion?.modalidades.find((x) => x.nombre === nombre);
  if (!m) throw new Error(`no hay «${nombre}» en ${id}`);
  return m;
};

describe('el modelo que sale del catálogo', () => {
  const todas = readdirSync(CATALOGO)
    .filter((f) => f.endsWith('.json'))
    .flatMap((f) =>
      (cat(f.replace(/\.json$/, '')).evaluacion?.modalidades ?? []).map(
        (m) => [`${f.replace(/\.json$/, '')} · ${m.nombre}`, m] as const,
      ),
    );

  it.each(todas)('%s: las hojas pesan entre todas el 100 %', (_n, m) => {
    const suma = modelo(m).hojas.reduce((s, h) => s + h.peso, 0);
    expect(suma).toBeCloseTo(1, 9);
  });
});

describe('Ciencia de Materiales, evaluación continua (presentación 2025-26, diap. 20)', () => {
  const m = modelo(modalidad('ciencia-materiales', 'Evaluación continua'));
  const trabajos = {
    'trabajo.entregables': 3.5,
    'trabajo.presentacion': 7,
    'trabajo.test': 4,
    'trabajo.cooperativo': 9,
    'practicas.informes': 8,
    'practicas.examen': 8,
  };

  it('con 3,5, 7, 4 y 9 hace falta un 6,8 en el examen, y lo decide la parte teórica', () => {
    const n = necesito(m, trabajos);
    expect(n.nota).toBe(6.8);
    expect(n.manda.tipo).toBe('grupo');
  });

  it('con un 5 en el examen, la parte teórica se queda en 3,9 y no se aprueba', () => {
    const r = evalua(m, { ...trabajos, 'examen.teoria': 5, 'examen.problemas': 5 });
    expect(r.gruposQueFallan).toHaveLength(1);
    expect(Math.round(r.gruposQueFallan[0].suma * 10) / 10).toBe(3.9);
    expect(r.aprueba).toBe(false);
  });

  it('sin el 4 en una parte del examen, la nota se queda en 4,0 como mucho', () => {
    const r = evalua(m, { ...trabajos, 'examen.teoria': 10, 'examen.problemas': 3.5 });
    expect(r.aprueba).toBe(false);
    expect(r.final).toBe(4);
  });
});

describe('Cálculo, evaluación continua (guía 2025-26, nota 2)', () => {
  const m = modelo(modalidad('calculo', 'Evaluación continua'));

  it('1,2 de los 3,75 de un cuatrimestre deja la nota en 4,5 aunque la media pase de 5', () => {
    const r = evalua(m, { 'escritos.primero': 3.2, 'escritos.segundo': 9, equipo: 9, individual: 9 });
    expect(r.media).toBeGreaterThanOrEqual(5);
    expect(r.aprueba).toBe(false);
    expect(r.final).toBe(4.5);
  });

  it('el umbral de 1,5 sobre 3,75 es un 4 sobre 10 en cada cuatrimestre', () => {
    const n = necesito(m, { 'escritos.primero': 9, equipo: 10, individual: 10 });
    expect(n.nota).toBe(4);
    expect(n.manda.tipo).toBe('minimo');
  });
});

describe('Mecánica Aplicada, convocatoria ordinaria', () => {
  const m = modelo(modalidad('mecanica-aplicada', 'Convocatoria ordinaria'));

  it('con un 7 en el bloque 1, el bloque 2 pide su 5 aunque la media se conforme con un 3', () => {
    const n = necesito(m, { estatica: 7 });
    expect(n.nota).toBe(5);
    expect(n.manda.tipo).toBe('minimo');
  });

  it('un bloque por debajo de 5 suspende aunque la media llegue', () => {
    expect(evalua(m, { estatica: 4, dinamica: 9 }).aprueba).toBe(false);
  });
});

describe('Ingeniería Térmica, evaluación continua', () => {
  it('el 40 % del examen manda sobre la media', () => {
    const m = modelo(modalidad('ingenieria-termica', 'Evaluación continua'));
    const n = necesito(m, { laboratorio: 8, ordenador: 8 });
    expect(n.nota).toBe(4);
    expect(n.manda.tipo).toBe('minimo');
  });
});

describe('Fundamentos Químicos, evaluación continua', () => {
  it('las prácticas piden un 3,5 en cada parte además del 5', () => {
    const m = modelo(modalidad('fundamentos-quimicos', 'Evaluación continua'));
    const r = evalua(m, {
      'examenes.primero': 7,
      'examenes.segundo': 7,
      controles: 7,
      'practicas.informes': 3,
      'practicas.examen': 9,
    });
    expect(r.aprueba).toBe(false);
    expect(r.minimosQueFallan.map((f) => f.id)).toEqual(['practicas.informes']);
  });
});

describe('Álgebra, evaluación continua', () => {
  it('sin mínimos en la guía, solo manda la media', () => {
    const m = modelo(modalidad('algebra', 'Evaluación continua'));
    const n = necesito(m, { puntual: 6, maxima: 5 });
    expect(n.nota).toBe(4.8);
    expect(n.manda.tipo).toBe('media');
  });
});

describe('Sistemas de Producción, convocatoria ordinaria', () => {
  it('el 5 de la prueba escrita manda aunque las prácticas vayan sobradas', () => {
    const m = modelo(modalidad('sistemas-produccion', 'Convocatoria ordinaria'));
    const n = necesito(m, { practicas: 9 });
    expect(n.nota).toBe(5);
    expect(n.manda.tipo).toBe('minimo');
  });
});

describe('Expresión Gráfica, evaluación continua', () => {
  it('un examen por debajo de 4 deja fuera la evaluación continua', () => {
    const m = modelo(modalidad('expresion-grafica', 'Evaluación continua'));
    const r = evalua(m, {
      'diedrico-trabajos': 9,
      'diedrico-control': 9,
      'tecnico-trabajos': 9,
      'tecnico-control': 9,
      'tecnico-examen': 3,
      'cad-practicas': 9,
      'cad-examen': 9,
    });
    expect(r.aprueba).toBe(false);
    expect(r.minimosQueFallan.map((f) => f.id)).toEqual(['tecnico-examen']);
  });
});

describe('las cuentas en los bordes', () => {
  const m = modelo(modalidad('algebra', 'Evaluación continua'));

  it('si ya no se llega ni con un 10, lo dice en vez de pedir un 23', () => {
    /* El 10 % de Maxima no rescata un 3 en el examen: haría falta un 23. */
    const n = necesito(m, { examen: 3, puntual: 3 });
    expect(n.nota).toBeNull();
    expect(n.manda.tipo).toBe('media');
  });

  it('un mínimo que ya no se cumple no se arregla con lo que falta', () => {
    const mec = modelo(modalidad('mecanica-aplicada', 'Convocatoria ordinaria'));
    const n = necesito(mec, { estatica: 3 });
    expect(n.nota).toBeNull();
    expect(n.yaFallan.map((f) => f.id)).toEqual(['estatica']);
  });

  it('con todo relleno no se inventa una nota: no hay huecos', () => {
    const n = necesito(m, { examen: 5, puntual: 5, maxima: 5 });
    expect(n.huecos).toEqual([]);
    expect(n.manda.tipo).toBe('nada');
  });

  it('una nota que se queda a una milésima no vale: se redondea hacia arriba', () => {
    const n = necesito(m, { puntual: 5, maxima: 5 });
    expect(evalua(m, { examen: n.nota!, puntual: 5, maxima: 5 }).media).toBeGreaterThanOrEqual(5);
  });
});
