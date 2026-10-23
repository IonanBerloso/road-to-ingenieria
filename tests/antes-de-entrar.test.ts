/**
 * «Antes de entrar»: la hoja de lectura rápida de cada ruta.
 *
 * La pidió el 14 de octubre de 2026 un alumno de Cálculo que iba a preparar
 * con el sitio, en un fin de semana, el examen de la primera evaluación: algo
 * que leer en la puerta del aula, «por si sale justo algo que te hayas leído
 * antes de entrar». Lo que la distingue del formulario es eso, que se lee en
 * minutos, y por eso el test que más importa aquí es el del tamaño: una hoja
 * de antes de entrar que crece hasta ser un tema ya no sirve para lo que se
 * pidió, y nadie lo notaría mirando una sola tarjeta.
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { describe, expect, it } from 'vitest';
import { hayAntesDeEntrar, lectura, tarjetas, textosDeLaTarjeta } from '../src/lib/antes-de-entrar';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');

type Tarjeta = { pasos: string[]; trampa: string };
type Bloque = { id: string; pide: string; antesDeEntrar?: Tarjeta };

describe('tarjetas()', () => {
  const bloques: Bloque[] = [
    { id: 'a', pide: 'uno', antesDeEntrar: { pasos: ['p1', 'p2'], trampa: 't' } },
    { id: 'b', pide: 'dos' },
    { id: 'c', pide: 'tres', antesDeEntrar: { pasos: ['q1', 'q2'], trampa: 'u' } },
  ];

  it('se queda con los bloques que llevan tarjeta, en el orden de la ruta', () => {
    expect(tarjetas(bloques).map((b) => b.id)).toEqual(['a', 'c']);
  });

  it('dice si hay página: con una tarjeta basta, y sin ninguna no la hay', () => {
    expect(hayAntesDeEntrar(bloques)).toBe(true);
    expect(hayAntesDeEntrar([{ id: 'b', pide: 'dos' }])).toBe(false);
    expect(hayAntesDeEntrar([])).toBe(false);
  });
});

describe('lectura()', () => {
  it('cuenta una fórmula en línea como una palabra, que es como se lee', () => {
    expect(lectura(['Si $|r|<1$, converge.']).palabras).toBe(3);
    expect(lectura(['entre $a$ y $\\frac{x-y}{2}$']).palabras).toBe(4);
  });

  it('cuenta una fórmula centrada como una palabra', () => {
    expect(lectura(['La suma es\n\n$$\n\\sum r^n = \\frac{1}{1-r}\n$$\n\ny ya.']).palabras).toBe(6);
  });

  it('suma los textos y redondea los minutos hacia arriba, nunca a cero', () => {
    expect(lectura([]).minutos).toBe(1);
    expect(lectura(['una dos', 'tres']).palabras).toBe(3);
    const largo = Array.from({ length: 201 }, () => 'palabra').join(' ');
    expect(lectura([largo]).minutos).toBe(2);
  });
});

describe('las tarjetas de la primera evaluación de Cálculo', () => {
  const ruta = yaml.load(
    readFileSync(join(RAIZ, 'src', 'content', 'preparar', 'calculo-1ev.yaml'), 'utf8'),
  ) as { bloques: Bloque[] };
  const conTarjeta = tarjetas(ruta.bloques);

  /* Los cuatro huecos del examen, el suelo que los sostiene y el examen
     entero. El formulario no lleva tarjeta porque la página ya lo pinta
     debajo, leído de los temas: una tarjeta suya sería una segunda copia. */
  it('lleva una por cada hueco del examen, más el suelo y el examen entero', () => {
    expect(conTarjeta.map((b) => b.id)).toEqual([
      'suelo',
      'regiones',
      'segundo-de-complejos',
      'demostracion-de-sucesiones',
      'series',
      'enteros',
    ]);
  });

  /* El techo es lo que hace que esto siga siendo «de lectura rápida»: seis
     tarjetas en cinco minutos a 200 palabras por minuto. Si un día hay que
     pasarlo, la pregunta no es subir el número sino qué sobra. */
  it('se leen enteras en cinco minutos como mucho', () => {
    const textos = conTarjeta.flatMap((b) => textosDeLaTarjeta(b));
    expect(lectura(textos).minutos).toBeLessThanOrEqual(5);
  });
});

describe('las tarjetas del primer parcial de Elasticidad', () => {
  const ruta = yaml.load(
    readFileSync(join(RAIZ, 'src', 'content', 'preparar', 'elasticidad-resistencia-1par.yaml'), 'utf8'),
  ) as { bloques: Bloque[] };
  const conTarjeta = tarjetas(ruta.bloques);

  /* Los cinco huecos del examen, y nada más. Eran ocho, y con ocho la hoja
     ya estaba en su techo de cinco minutos; el 23 de octubre de 2026 salieron
     las barras, los diagramas y los depósitos, porque el parcial de este
     curso no entra en los temas 7 y 8. Una tarjeta para el suelo de
     convenios o para el simulacro sigue teniendo que ganarse el sitio. */
  it('lleva una por cada hueco del examen', () => {
    expect(conTarjeta.map((b) => b.id)).toEqual([
      'tensor',
      'galgas',
      'deformaciones',
      'fallo',
      'hooke',
    ]);
  });

  /* El mismo techo que en Cálculo: se lee igual de pie en la puerta. Se
     recortó el 15 de octubre de 2026 para caber, cuando eran ocho, quitando
     palabras y lo que dos tarjetas repetían. */
  it('se leen enteras en cinco minutos como mucho', () => {
    const textos = conTarjeta.flatMap((b) => textosDeLaTarjeta(b));
    expect(lectura(textos).minutos).toBeLessThanOrEqual(5);
  });
});
