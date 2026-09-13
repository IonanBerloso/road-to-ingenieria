/**
 * La extraordinaria del bloque 1 —Estática— de Mecánica Aplicada, del 27 de
 * junio de 2025. Nueve respuestas numéricas en cuatro resoluciones, que es la
 * convocatoria más pequeña de las tres del bloque.
 *
 * Es también la más rara del bloque, y dos de sus rarezas se notan aquí:
 *
 * 1. **Al cable parabólico le falta un dato.** El enunciado pide «la carga q y
 *    la tensión T0» y no imprime ni una sola fuerza: la curva fija el
 *    **cociente** q/T0 y nada más. Así que aquí no se verifica ninguna fuerza
 *    —no hay ninguna que verificar—, sino lo que los datos sí determinan: el
 *    cociente y la longitud del cable. Inventar la fuerza que falta para que
 *    el test tuviera más líneas sería justo lo contrario de lo que estos
 *    ficheros hacen.
 * 2. **El ejercicio 2 del cuadernillo no está impreso**, así que no tiene
 *    resolución y no aparece por aquí.
 *
 * El resto es catenaria con el convenio del curso, y por eso el ejercicio 1 se
 * recalcula llamando a `src/lib/catenaria.ts` —el mismo modelo que mueve el
 * simulador del tema 5— en vez de reescribir aquí los cosenos hiperbólicos:
 * si el modelo publicado y el examen discreparan, este fichero lo diría.
 *
 * El convenio, que es lo primero que se falla: la **y se mide desde la
 * directriz**, que está una distancia c por debajo del punto más bajo. De ahí
 * c = T0/w, y = c·cosh(x/c), s = c·senh(x/c), T = w·y, y la identidad
 * y² = c² + s². Aquí ni siquiera se usa la identidad: se resuelve el sistema
 * con las dos funciones, que es un camino distinto del de la resolución.
 *
 * Todo el ejercicio 1 va **en unidades de R y de w**, que es como lo pide el
 * enunciado: se toma R = 1 y w = 1 y los números salen ya como cocientes.
 */
import { describe, it } from 'vitest';
import { convocatoria } from './corpus';
import { integra, deriva, deriva2, raiz } from './numerico';
import { altura, longitud, angulo, tension } from '../../src/lib/catenaria';

const cuadra = convocatoria('mecanica-aplicada', '2024-2025-ext');

describe('teoría 1 · el hueco cuadrado que fija el volumen de revolución', () => {
  const id = 'exma2425-ext-1-el-hueco-cuadrado-que-fija-el-volumen';

  /* Datos del enunciado y de su figura, con a = 1.
     El trapecio tiene la base inferior 2a desde el origen, la superior 3a y
     altura a, así que sus vértices son (0,0), (2a,0), (3a,a) y (0,a): el lado
     inclinado va de la abscisa 2a hasta el vértice superior derecho. El hueco
     es un cuadrado de lado b con su centro de gravedad a altura a/2 —lo dice
     el enunciado entre paréntesis, que es el único dato que hace falta de él—.
     Y el volumen que genera al girar alrededor del eje x es V = 2πa³. */
  const a = 1;
  const BASE_INFERIOR = 2 * a;
  const BASE_SUPERIOR = 3 * a;
  const ALTURA = a;
  const ALTURA_CDG_HUECO = a / 2;
  const V = 2 * Math.PI * a ** 3;

  /* El momento estático del trapecio, sin partirlo en piezas: para cada altura
     y, la anchura va de x = 0 hasta el lado inclinado. Con la base inferior en
     2a y la superior en 3a, ese lado está en x = 2a + y. */
  const anchura = (y: number) => BASE_INFERIOR + ((BASE_SUPERIOR - BASE_INFERIOR) * y) / ALTURA;
  const momentoTrapecio = integra((y) => y * anchura(y), 0, ALTURA);

  it('el trapecio entero tiene momento estático 4a³/3', () =>
    cuadra(id, 'El momento estático sin el hueco', momentoTrapecio));

  it('y el hueco que deja el volumen en 2πa³ tiene lado a·√(2/3)', () => {
    /* Pappus-Guldin: V = 2π·y_G·A = 2π·(momento estático de la superficie),
       y el hueco resta el suyo, b²·(a/2). Aquí no se despeja: se busca el
       lado que hace cierta la ecuación tal como está escrita. */
    const volumen = (b: number) => 2 * Math.PI * (momentoTrapecio - b * b * ALTURA_CDG_HUECO);
    const b = raiz((x) => volumen(x) - V, 0, BASE_INFERIOR);
    cuadra(id, 'El lado del hueco', b);
  });
});

describe('teoría 2 · el cable parabólico al que le falta una fuerza', () => {
  const id = 'exma2425-ext-2-el-cable-parabolico-al-que-le-falta-una-fuerza';

  /* Dato del enunciado: la curva, en metros, y nada más. No hay ninguna
     fuerza impresa, así que q y T0 por separado no se recalculan aquí — no se
     pueden calcular, ni con este test ni sin él. */
  const y = (x: number) => x ** 2 / 4 - x / 4;

  it('la curvatura fija q/T0 = 0,5 m⁻¹, que es todo lo que el enunciado da', () => {
    /* Cable sin peso propio con carga constante por unidad de **abscisa**:
       el equilibrio vertical de un trozo dx da T0·y'' = q, así que el cociente
       es la derivada segunda. Se toma numérica para no volver a derivar a
       mano la misma expresión. */
    cuadra(id, 'La razón entre la carga y la tensión mínima', deriva2(y, 0.5));
  });

  it('y el cable mide 1,0103 m entre los dos cortes con el eje x', () => {
    /* A está en el origen; B es el otro corte de la curva con el eje x, que la
       figura dibuja sobre el eje. La longitud es la del arco, sin fórmula
       cerrada por medio: se busca el corte y se integra √(1+y'²). */
    const xB = raiz(y, 0.5, 4);
    const L = integra((x) => Math.hypot(1, deriva(y, x)), 0, xB);
    cuadra.magnitud(id, 'La longitud entre A y B', L, 'm');
  });
});

/* ── Ejercicio 1: el cable pesado entre el disco y la polea ─────────────────
   Datos del enunciado, en unidades de R y de w:
     · peso propio por unidad de longitud w, radio del disco R;
     · s_OA = 2,5R, longitud de cable entre el punto más bajo O y el punto A;
     · el tramo vertical tras la polea mide 5R y acaba libre;
     · B está 2R por encima de A;
     · A está en la vertical del centro del disco —es su punto más alto— y el
       bloque cuelga de la periferia, del punto más a la izquierda.
   Los dos apartados comparten estos datos, así que se calculan una vez. */
const R = 1;
const w = 1;
const S_OA = 2.5 * R;
const TRAMO_VERTICAL = 5 * R;
const DESNIVEL_AB = 2 * R;

/* El tramo vertical cuelga libre, así que la tensión con que tira de la polea
   es su propio peso: T_B = w·5R. Y en la catenaria T = w·y, luego y_B = 5R.
   De ahí y_A = y_B − 2R. */
const yB = TRAMO_VERTICAL;
const yA = yB - DESNIVEL_AB;

/* El parámetro c: no se usa y² = c² + s², que es el atajo del tema. Se
   resuelve el sistema con las dos funciones del modelo: para cada c, la
   abscisa de A es la que da s = 2,5R, y c es el que además deja la altura en
   y_A. Es el mismo cable por otro camino. */
const abscisaDeA = (c: number) => c * Math.asinh(S_OA / c);
const c = raiz((k) => altura(k, abscisaDeA(k)) - yA, 0.01, 100);
const xA = abscisaDeA(c);

describe('ejercicio 1 a) · la catenaria entre el disco y la polea', () => {
  const id = 'exma2425-ext-3-la-catenaria-entre-el-disco-y-la-polea';

  it('el parámetro vale c = 1,658R', () => cuadra(id, 'El parámetro de la catenaria', c));

  it('el cable llega a A a 56,44° con la horizontal', () =>
    cuadra(id, 'El ángulo en A', angulo(c, xA)));

  it('y el cable entero mide 12,217R', () => {
    /* De A al extremo libre: el arco de A a O, el de O a B y los 5R que
       cuelgan. La abscisa de B es la que pone la altura en y_B. */
    const xB = raiz((x) => altura(c, x) - yB, 0, 100);
    cuadra(id, 'La longitud total del cable', S_OA + longitud(c, xB) + TRAMO_VERTICAL);
  });
});

describe('ejercicio 1 b) · el bloque que sujeta el disco y el rozamiento mínimo', () => {
  const id = 'exma2425-ext-3-el-bloque-que-sujeta-el-disco';

  /* El disco no pesa. Sobre él actúan la tensión del cable en A, el peso P del
     bloque colgado de la periferia izquierda y la reacción del suelo. Se toma
     el punto de contacto con el suelo como origen: ahí la normal y el
     rozamiento no dan momento, y queda una sola ecuación con una incógnita.

     La tensión en A es T = w·y_A, tirando a lo largo del cable hacia O: hacia
     la derecha y hacia abajo, con el ángulo del apartado a). */
  const T = tension(c, xA, w);
  const theta = (angulo(c, xA) * Math.PI) / 180;
  const fuerzaEnA = [T * Math.cos(theta), -T * Math.sin(theta)];
  const puntoA = [0, 2 * R]; // A es el punto más alto del disco
  const puntoBloque = [-R, R]; // el bloque cuelga del punto más a la izquierda

  const momento = (p: number[], f: number[]) => p[0] * f[1] - p[1] * f[0];

  /* Momentos respecto del contacto: el del cable, más el del peso P colgando
     en vertical del punto de la izquierda, igual a cero. */
  const P = raiz((p) => momento(puntoA, fuerzaEnA) + momento(puntoBloque, [0, -p]), 0, 100);

  it('el bloque pesa P = 3,317·wR', () => cuadra(id, 'El peso del bloque', P));

  it('y el suelo necesita μ ≥ 0,285', () => {
    /* Vertical: la normal aguanta el bloque y la componente vertical del
       cable. Horizontal: el rozamiento iguala a la componente horizontal, que
       en una catenaria es la tensión mínima, w·c. */
    const N = P - fuerzaEnA[1];
    const rozamiento = Math.abs(fuerzaEnA[0]);
    cuadra(id, 'El rozamiento mínimo', rozamiento / N);
  });
});
