/**
 * El coeficiente de frotamiento, tal como lo calcula esta escuela.
 *
 * Vive aquí y no dentro del componente por una razón de §10: **un simulador
 * con física dentro lleva su caso de prueba**, y para probarlo hay que poder
 * importarlo desde `tests/fisica/`. `PlanoComplejo` puede tener su geometría
 * dentro del `.astro` porque no modela nada; esto sí.
 *
 * Las cinco fórmulas son exactamente las de la tabla del tema 18, y las dos
 * fronteras también. Si alguna vez cambian ahí, cambian aquí: son la misma
 * cosa dicha dos veces, y esa duplicación es deliberada —la prosa la lee un
 * alumno y esto lo ejecuta un navegador— pero hay que mantenerla a la par.
 *
 * **Sobre el 3,71.** El corpus tiene tres versiones de esa constante y las
 * tres son de la escuela: la tabla del tema 18 escribe 3,71; la forma
 * alternativa que usan las soluciones oficiales, `1/√f = 1,14 + 2·log(D/ε)`,
 * implica 10^0,57 = 3,7154; y la resolución del tercer parcial de junio de
 * 2021 usó 3,7. Las tres dan el mismo `f` con **0,15 % de diferencia**, muy
 * por debajo del 2 % con que se comparan las respuestas de tipo `magnitud`.
 * Aquí se usa **3,71**, que es la que está publicada en la prosa, y el test
 * comprueba contra los números del examen con esa holgura declarada.
 */

/** Frontera lisa → semirrugosa. Tema 18. */
export const Re1 = (er: number) => 23 / er;
/** Frontera semirrugosa → rugosa. Tema 18. */
export const Re2 = (er: number) => 560 / er;

const C = 3.71;

export type Regimen =
  | 'laminar'
  | 'critica'
  | 'liso-blasius'
  | 'liso-karman'
  | 'semirrugoso'
  | 'rugoso';

/** Hagen-Poiseuille. En laminar la rugosidad no interviene: ni aparece. */
export const fLaminar = (Re: number) => 64 / Re;

/** Blasius, para tubería lisa hasta Re = 10⁵. */
export const fBlasius = (Re: number) => 0.316 / Re ** 0.25;

/** Karman-Prandtl rugoso: aquí `f` ya no depende del Reynolds. */
export const fRugoso = (er: number) => 0.25 / Math.log10(C / er) ** 2;

/**
 * Colebrook-White, resuelta por punto fijo sobre `1/√f`.
 *
 * Converge en menos de diez vueltas para todo el rango del ábaco; el tope de
 * 60 está para que un dato absurdo no cuelgue el navegador, no porque haga
 * falta. Con `er = 0` degenera en Karman-Prandtl liso, que es justo lo que
 * se quiere.
 */
export function fColebrook(Re: number, er: number): number {
  let x = 1 / Math.sqrt(fBlasius(Math.max(Re, 4000))); // 1/√f de partida
  for (let i = 0; i < 60; i++) {
    const nuevo = -2 * Math.log10(2.51 / (Re / x) + er / C);
    if (Math.abs(nuevo - x) < 1e-12) {
      x = nuevo;
      break;
    }
    x = nuevo;
  }
  return 1 / x ** 2;
}

/** Karman-Prandtl liso: Colebrook con rugosidad nula. */
export const fLisoKarman = (Re: number) => fColebrook(Re, 0);

/**
 * En qué zona del ábaco cae el punto.
 *
 * El orden importa: primero el Reynolds decide si hay turbulencia, y solo
 * después la rugosidad relativa decide cómo se comporta. Un tubo no es liso
 * ni rugoso —lo es el flujo—, y esta función es esa frase hecha código.
 */
export function regimen(Re: number, er: number): Regimen {
  if (Re < 2000) return 'laminar';
  if (Re < 4000) return 'critica';
  if (Re < Re1(er)) return Re <= 1e5 ? 'liso-blasius' : 'liso-karman';
  if (Re < Re2(er)) return 'semirrugoso';
  return 'rugoso';
}

/** El coeficiente de frotamiento, con la fórmula que le toca a cada zona. */
export function f(Re: number, er: number): number {
  switch (regimen(Re, er)) {
    case 'laminar':
    case 'critica':
      return fLaminar(Re);
    case 'liso-blasius':
      return fBlasius(Re);
    case 'liso-karman':
      return fLisoKarman(Re);
    case 'semirrugoso':
      return fColebrook(Re, er);
    case 'rugoso':
      return fRugoso(er);
  }
}

/**
 * La rugosidad que explica un `f` medido, suponiendo turbulencia completa.
 *
 * Es el camino inverso y el que piden los exámenes de diagnóstico: se mide el
 * caudal de una conducción vieja, se despeja `f`, y de ahí sale cuánto se ha
 * corroído el tubo sin abrirlo.
 */
export const rugosidadDesdeF = (fMedido: number) => C / 10 ** (0.5 / Math.sqrt(fMedido));

/** Reynolds a partir del caudal, para pasar del ábaco a la instalación. */
export const reynolds = (Q: number, D: number, nu: number) => (4 * Q) / (Math.PI * D * nu);

/**
 * Cuánto cambia `f` si el Reynolds se mueve un 1 %.
 *
 * Es el número que contesta la pregunta del simulador —«¿cuándo deja de
 * importar el Reynolds?»— sin pedirle al alumno que lo deduzca de mirar la
 * curva: en turbulencia completa sale exactamente cero.
 */
export function sensibilidadRe(Re: number, er: number): number {
  const f0 = f(Re, er);
  const f1 = f(Re * 1.01, er);
  return (f1 - f0) / f0;
}

/* ═══════════════════════════════════════════════════════════════════
   La subcapa laminar, que es la física de debajo del ábaco
   ═══════════════════════════════════════════════════════════════════
   Todo lo de arriba es contabilidad: cinco fórmulas y dos fronteras que hay
   que memorizar. Lo que sigue es **por qué** existen esas dos fronteras, y
   convierte el ábaco de una tabla en un mecanismo.

   Pegada a la pared hay siempre una capa donde el flujo es laminar por
   mucho que el resto sea turbulento. Su espesor es

       δ = 5·ν/v*      con v* = v·√(f/8)  la velocidad de fricción

   y de ahí, dividiendo entre D y metiendo el Reynolds:

       δ/D = 5·√8 / (Re·√f) = 14,142 / (Re·√f)

   El tubo se comporta como liso si esa capa **tapa** las rugosidades y como
   rugoso si las rugosidades **la atraviesan**. Nikuradse midió dónde está
   cada cosa: ε/δ por debajo de 0,3 es liso y por encima de 6 es rugoso.

   **Y ahí está lo que el ábaco no cuenta.** Sustituyendo Re = 23/(ε/D) en
   ε/δ sale 0,7·√f ≈ 0,3 con los `f` del ábaco, y con Re = 560/(ε/D) sale
   6,8·√f ≈ 6. Es decir: **los números 23 y 560 de la tabla del tema 18 no
   son constantes empíricas caídas del cielo, son ε/δ = 0,3 y ε/δ = 6
   escritos en función del Reynolds.** El test de `tests/fisica/` lo
   comprueba, porque es el tipo de afirmación que no se publica sin medir. */

/** Espesor de la subcapa laminar, relativo al diámetro. */
export const subcapaRelativa = (Re: number, fv: number) => (5 * Math.SQRT2 * 2) / (Re * Math.sqrt(fv));

/**
 * Cuántas veces la rugosidad es más alta que la subcapa laminar.
 *
 * Es **el** número del tema: por debajo de 0,3 el tubo es liso, por encima de
 * 6 es rugoso, y en medio está la franja donde hacen falta las fórmulas
 * implícitas. Un tubo no es liso ni rugoso; lo es el flujo, y este cociente
 * es esa frase convertida en un número.
 */
export function rugosidadSobreSubcapa(Re: number, er: number): number {
  return er / subcapaRelativa(Re, f(Re, er));
}

/* ═══════════════════════════════════════════════════════════════════════
   La rugosidad por material — Cuadro nº 20 de la escuela

   Hasta ahora este módulo sabía convertir una rugosidad en un coeficiente de
   fricción y no sabía de dónde sale la rugosidad, así que cada ejercicio del
   capítulo 6 traía el número a mano o no lo traía. Aquí está el cuadro, con
   sus valores **en metros** y su intervalo, porque el intervalo es la mitad
   de la información: un acero roblonado va de 0,91 a 9,1 mm, un factor diez.

   Son datos físicos publicados, no una figura ajena: se transcriben (§08).
   ═══════════════════════════════════════════════════════════════════════ */

export interface Rugosidad {
  /** El valor de diseño, en metros. Es el que usan los enunciados. */
  diseno: number;
  /** El intervalo [mínimo, máximo], en metros. */
  intervalo: [number, number];
}

/**
 * Cuadro nº 20, en metros. En el original está en centímetros; aquí va en
 * unidades del SI porque es lo que come `f(Re, er)` y porque mezclar
 * centímetros con metros en la rugosidad relativa es el fallo clásico.
 */
export const RUGOSIDAD: Record<string, Rugosidad> = {
  aceroRoblonado: { diseno: 1.8e-3, intervalo: [9.1e-4, 9.1e-3] },
  hormigon: { diseno: 1.2e-3, intervalo: [3e-4, 3e-3] },
  fundicion: { diseno: 2.6e-4, intervalo: [1.2e-4, 6e-4] },
  madera: { diseno: 6e-4, intervalo: [1.83e-4, 9e-4] },
  hierroGalvanizado: { diseno: 1.5e-4, intervalo: [6e-5, 2.4e-4] },
  fundicionAsfaltada: { diseno: 1.2e-4, intervalo: [6e-5, 1.8e-4] },
  aceroComercial: { diseno: 6e-5, intervalo: [3e-5, 9e-5] },
  hierroForjado: { diseno: 6e-5, intervalo: [3e-5, 9e-5] },
  tuboEstirado: { diseno: 2.4e-6, intervalo: [2.4e-6, 2.4e-6] },
  latonYCobre: { diseno: 1.5e-6, intervalo: [1.5e-6, 1.5e-6] },
  fibrocemento: { diseno: 1e-4, intervalo: [1e-4, 1e-4] },
  pvcYPe: { diseno: 7e-6, intervalo: [7e-6, 7e-6] },
};

export type Material = keyof typeof RUGOSIDAD;

/** La rugosidad relativa `ε/D` de un material en un diámetro dado. */
export const rugosidadRelativa = (material: Material, D: number): number =>
  RUGOSIDAD[material].diseno / D;
