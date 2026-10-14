/**
 * Tema 6 de ERM: criterios de fallo. Rankine, Saint-Venant, los estados
 * límites de Mohr, Tresca y von Mises, con su tensión equivalente y el factor
 * de seguridad.
 *
 * Para quién: el alumno del parcial 1. Cuándo: los «factores de seguridad
 * según los criterios de Tresca y de Von Mises» de las galgas de 2016 y 2017,
 * los cuatro criterios de 2014 y los tres de 2022, y las cuestiones del
 * criterio de Mohr de 2015, 2018, 2020 y 2022. Qué gana: el factor de cada criterio sin
 * equivocar el orden σ1 ≥ σ2 ≥ σ3 cuando la tercera principal es el 0 de la
 * tensión plana. Cómo se comprueba: `tests/fisica/erm/fallo.test.ts`
 * (tracción y compresión puras, que tienen que fallar justo en su límite;
 * Tresca como Mohr con k = 1; von Mises por las componentes y por las
 * principales; la figura 6.5) y las galgas del 03-11-2017 en
 * `aceptacion.test.ts`.
 *
 * EL CONVENIO ES EL DEL CURSO (apuntes del tema 6):
 *   · p. 4, ec. 6.1: factor de seguridad FS = σe/σeqv. Ec. 6.2: la tensión
 *     admisible del diseño es σadm = σe/n.
 *   · p. 4, ecs. 6.3-6.5: Rankine, σeqv = la principal de mayor valor
 *     absoluto, comparada con el límite de tracción si es positiva y con el de
 *     compresión si es negativa.
 *   · p. 5, ecs. 6.6-6.9: Saint-Venant, σeqv = E·εmax, con εmax la deformación
 *     principal de mayor valor absoluto, y el mismo reparto de límites.
 *   · pp. 7-8, ecs. 6.12-6.16: Mohr, k = σet/σec, sen ϕ = (1 − k)/(1 + k),
 *     σeqv = σ1 − k·σ3 y no hay fallo si σeqv < σet.
 *   · p. 9, ec. 6.19: Tresca, σeqv = σ1 − σ3 (Mohr con k = 1).
 *   · pp. 11-12, ecs. 6.28-6.31: von Mises, por componentes o por principales.
 * Las tensiones límite se dan positivas, también la de compresión.
 */
import type { Mat3, Vec3 } from './tensor';

export interface Criterio {
  sigmaEq: number;
  /** FS = límite / σeqv (ec. 6.1). */
  FS: number;
}

/** Las tres principales de mayor a menor (en tensión plana, pasar la tercera como 0). */
function ordena(p: readonly number[]): Vec3 {
  if (p.length !== 3) throw new Error('Hacen falta las tres tensiones principales (en tensión plana, una es 0).');
  const v = [...p].sort((a, b) => b - a);
  return [v[0], v[1], v[2]];
}

/** El valor de mayor módulo y el límite que le toca por su signo (ecs. 6.5 y 6.9). */
function porSigno(valores: Vec3, et: number, ec: number): { valor: number; limite: number } {
  const valor = Math.abs(valores[0]) >= Math.abs(valores[2]) ? valores[0] : valores[2];
  return { valor, limite: valor >= 0 ? et : ec };
}

/**
 * Ecs. 6.3-6.5. Con límites distintos el curso compara solo la principal de
 * mayor valor absoluto: si σ1 = 90 y σ3 = −100 con σet = 100 y σec = 1000, da
 * FS = 10 aunque la tracción esté a un 90 % de su límite. Se devuelve también
 * `FSmin`, el menor de los dos cocientes, para quien quiera mirarlo.
 */
export function rankine(principales: readonly number[], sigmaEt: number, sigmaEc = sigmaEt): Criterio & { FSmin: number } {
  const v = ordena(principales);
  const { valor, limite } = porSigno(v, sigmaEt, sigmaEc);
  const sigmaEq = Math.abs(valor);
  const cocientes = [v[0] > 0 ? sigmaEt / v[0] : Infinity, v[2] < 0 ? sigmaEc / -v[2] : Infinity];
  return { sigmaEq, FS: limite / sigmaEq, FSmin: Math.min(...cocientes) };
}

/** Ecs. 6.6-6.9: deformación máxima. */
export function saintVenant(
  principales: readonly number[],
  E: number,
  nu: number,
  sigmaEt: number,
  sigmaEc = sigmaEt,
): Criterio & { epsMax: number } {
  const [s1, s2, s3] = ordena(principales);
  const e: Vec3 = [(s1 - nu * (s2 + s3)) / E, (s2 - nu * (s1 + s3)) / E, (s3 - nu * (s1 + s2)) / E];
  const { valor, limite } = porSigno(ordena(e), sigmaEt, sigmaEc);
  const sigmaEq = E * Math.abs(valor);
  return { sigmaEq, FS: limite / sigmaEq, epsMax: valor };
}

/**
 * Ecs. 6.12-6.16: estados límites de Mohr. Con σeqv ≤ 0 no hay fallo por mucho
 * que crezcan las cargas (ec. 6.16): FS = ∞, no un cociente negativo.
 */
export function mohr(principales: readonly number[], sigmaEt: number, sigmaEc: number): Criterio & { k: number; phi: number } {
  const [s1, , s3] = ordena(principales);
  const k = sigmaEt / sigmaEc;
  const sigmaEq = s1 - k * s3;
  return { sigmaEq, FS: sigmaEq <= 0 ? Infinity : sigmaEt / sigmaEq, k, phi: Math.asin((1 - k) / (1 + k)) };
}

/** Ec. 6.19: tensión cortante máxima. */
export function tresca(principales: readonly number[], sigmaE: number): Criterio {
  const [s1, , s3] = ordena(principales);
  const sigmaEq = s1 - s3;
  return { sigmaEq, FS: sigmaE / sigmaEq };
}

/** Ec. 6.29: von Mises con las principales. */
export function vonMises(principales: readonly number[], sigmaE: number): Criterio {
  const [s1, s2, s3] = ordena(principales);
  const sigmaEq = Math.sqrt(((s1 - s2) ** 2 + (s2 - s3) ** 2 + (s3 - s1) ** 2) / 2);
  return { sigmaEq, FS: sigmaE / sigmaEq };
}

/** Ec. 6.28: von Mises con las componentes de un tensor cualquiera. */
export function vonMisesTensor(s: Mat3, sigmaE: number): Criterio {
  const [sx, sy, sz] = [s[0][0], s[1][1], s[2][2]];
  const sigmaEq = Math.sqrt(
    ((sx - sy) ** 2 + (sy - sz) ** 2 + (sz - sx) ** 2 + 6 * (s[0][1] ** 2 + s[1][2] ** 2 + s[2][0] ** 2)) / 2,
  );
  return { sigmaEq, FS: sigmaE / sigmaEq };
}

/** Ec. 6.2: tensión admisible con coeficiente de seguridad n. */
export function tensionAdmisible(sigmaE: number, n: number): number {
  if (!(n > 1)) throw new Error('El coeficiente de seguridad tiene que ser mayor que 1 (ec. 6.2).');
  return sigmaE / n;
}
