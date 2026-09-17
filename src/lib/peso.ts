/**
 * El peso de un tema en el examen, contado en vez de estimado.
 *
 * POR QUÉ EXISTE. El campo `peso` del catálogo nació a ojo, y entonces estaba
 * bien: no había exámenes transcritos con los que contar nada. Hoy hay 88
 * convocatorias de Cálculo con sus 425 ejercicios etiquetados por tema en el
 * `examen.yaml` de cada una, así que poner la etiqueta a mano es exactamente
 * lo que §10 prohíbe — estimar un dato que está ahí para contarse, y que
 * además envejece solo: cada convocatoria nueva lo desplaza y nadie relee las
 * once etiquetas.
 *
 * Medido el 17 de septiembre de 2026 sobre Cálculo: de los once temas, **diez
 * coincidían** con lo que el catálogo declaraba a mano. El que no,
 * `t10-laplace`, decía «medio» con 24 ejercicios, por debajo del corte. O sea
 * que la etiqueta no estaba lejos; lo que no se sostiene es seguir
 * escribiéndola cuando se puede contar.
 *
 * POR QUÉ SIGUEN SIENDO TRES NIVELES Y NO UN PORCENTAJE. Porque el dato sirve
 * para decidir por dónde empezar, y «19,5 %» no se decide mejor que «alto».
 * §10 pide no publicar precisión que no ayuda.
 */

/** Cuántos ejercicios de examen hacen falta para cada nivel.
 *
 *  Los cortes están escritos aquí y no en una constante suelta porque son la
 *  única parte discutible de todo esto. Salen de repartir los once temas de
 *  Cálculo en tres grupos que se parezcan: con 425 ejercicios la media es 39
 *  por tema, y estos dos cortes dejan 3 altos, 4 medios y 4 bajos.
 *
 *  Un tema «alto» es uno del que cae algo en más de la mitad de las
 *  convocatorias; uno «bajo», del que puede no caer nada en dos años. */
export const CORTES = { alto: 45, medio: 25 } as const;

/** El nivel que le toca a un tema por su número de ejercicios de examen. */
export function pesoDeTema(cuantos: number): 'alto' | 'medio' | 'bajo' {
  if (cuantos >= CORTES.alto) return 'alto';
  if (cuantos >= CORTES.medio) return 'medio';
  return 'bajo';
}

/**
 * Cuenta los ejercicios de examen de cada tema, para una asignatura.
 *
 * `examenes` son las entradas de la colección `examen`; cada una lista sus
 * ejercicios con el `tema` al que pertenece cada uno. Un examen cruza temas,
 * y por eso el recuento se hace ejercicio a ejercicio y no examen a examen.
 */
export function cuentaPorTema(
  examenes: { data: { asignatura: string; ejercicios: { tema: string }[] } }[],
  asignatura: string,
): Map<string, number> {
  const cuenta = new Map<string, number>();
  for (const e of examenes) {
    if (e.data.asignatura !== asignatura) continue;
    for (const x of e.data.ejercicios) cuenta.set(x.tema, (cuenta.get(x.tema) ?? 0) + 1);
  }
  return cuenta;
}

/**
 * El peso que se publica para un tema.
 *
 * Manda el catálogo si lo declara —es la excepción, y quien la escribe tiene
 * que poder defenderla—; si no, se deriva del recuento. Cuando no hay ningún
 * ejercicio de examen contado para esa asignatura devuelve `null`, y entonces
 * la ficha no pinta la pastilla: **una asignatura sin exámenes transcritos no
 * sabe qué pesa más, y fingir que sí lo sabe es el fallo que esto arregla.**
 */
export function pesoPublicado(
  declarado: 'alto' | 'medio' | 'bajo' | undefined,
  cuenta: Map<string, number>,
  temaId: string,
): 'alto' | 'medio' | 'bajo' | null {
  if (declarado) return declarado;
  if (cuenta.size === 0) return null;
  return pesoDeTema(cuenta.get(temaId) ?? 0);
}
