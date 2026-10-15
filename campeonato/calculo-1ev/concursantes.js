export const meta = {
  name: 'campeonato-calculo-1ev-concursantes',
  description: 'Campeonato de predicción, fase 2: siete concursantes predicen los rasgos de la 1.ª evaluación de Cálculo, a ciegas, en cinco rondas de pretemporada y en la del lunes, con debate después de cada ronda',
  phases: [
    { title: 'Predicción', detail: 'siete concursantes por ronda, cada uno con su estrategia, sin ver a los demás' },
    { title: 'Debate', detail: 'cada concursante ve a los demás y revisa, si quiere' },
  ],
}

// Cada ronda trae sus ids: los rasgos que ya habían salido en alguna 1.ª
// evaluación anterior, más los que no han salido nunca en ninguna. Un rasgo
// que nace en el examen que se predice no entra, porque su mera presencia en
// la lista sería una pista; el lunes, lo nuevo tampoco estará en la lista.
const { rondas, lista } = args

const ESTRATEGIAS = [
  { k: 'frecuentista', t: 'TU ESTRATEGIA: la frecuencia histórica. Cuenta en cuántos exámenes de 1.ª evaluación ha salido cada rasgo y conviértelo en probabilidad, sin dar más peso a ningún año. Ajusta solo con motivos fuertes y dilo.' },
  { k: 'reciente', t: 'TU ESTRATEGIA: lo reciente manda. Los profesores y los temarios cambian; da mucho más peso a los últimos exámenes que a los antiguos, y explica qué peso das a cada año.' },
  { k: 'lo-que-toca', t: 'TU ESTRATEGIA: la rotación. Busca alternancias y huecos: lo que lleva años sin salir puede tocar, y lo que salió el año pasado puede descansar. Antes de apostar por un patrón, comprueba en los datos que existe de verdad y no es casualidad.' },
  { k: 'banco-grande', t: 'TU ESTRATEGIA: el repertorio del profesor. Además de las 1.ª evaluaciones, lee a fondo el resto de convocatorias del fichero (ordinarias, extraordinarias, terceras, recuperaciones) con ejercicios de los mismos temas: lo que se pregunta en ellas sobre complejos y sucesiones revela el repertorio, y lo puesto hace poco en otros exámenes puede reaparecer o evitarse.' },
  { k: 'estructuralista', t: 'TU ESTRATEGIA: la forma del examen. Reconstruye la plantilla: cuántos ejercicios, qué hueco ocupa cada uno, cuántos puntos y de qué competencia (comp1, comp2, comp4). Predice hueco a hueco qué subtipo tocará en cada uno, y saca de ahí los rasgos.' },
  // Nace el 15 de octubre de 2026, tras el piloto: 2025-26 copió la plantilla
  // de 2024-25, y ningún concursante lo vio venir. Se mide en las rondas que
  // no son el piloto.
  { k: 'regimen', t: 'TU ESTRATEGIA: las épocas. Los exámenes los pone una persona o un equipo; cuando cambia quien lo pone, cambia la plantilla, y mientras no cambia, el examen se parece mucho de un año a otro. Divide la historia en épocas (tramos de cursos seguidos con la misma plantilla: mismo número de ejercicios, mismos tipos de hueco, mismas manías de redacción y de tipografía), mira cuánto suelen durar y decide con qué probabilidad el examen a predecir sigue la época actual o abre una nueva. Si sigue, predice cerca de los exámenes de la época actual; si cambia, cerca de la frecuencia de toda la historia. Mezcla las dos según esa probabilidad, y di qué épocas ves y qué probabilidad de cambio das.' },
  { k: 'esceptico', t: 'TU ESTRATEGIA: la calibración. Con tan pocos exámenes, casi todos los patrones son ruido. Parte de la frecuencia, encógela hacia el 50 % en proporción a lo poco que sabes, evita los extremos salvo en lo que ha salido siempre o nunca, y busca el Brier más bajo, no impresionar.' },
]

const probsSchema = (ids) => ({
  type: 'array',
  minItems: ids.length,
  maxItems: ids.length,
  items: {
    type: 'object',
    properties: { rasgo: { type: 'string', enum: ids }, p: { type: 'number', minimum: 0, maximum: 1 } },
    required: ['rasgo', 'p'],
  },
})

const predSchema = (ids) => ({
  type: 'object',
  properties: {
    probabilidades: probsSchema(ids),
    examen: {
      type: 'array',
      minItems: 3,
      maxItems: 5,
      items: {
        type: 'object',
        properties: {
          hueco: { type: 'string' },
          descripcion: { type: 'string', description: 'el ejercicio que esperas, en dos o tres frases' },
          rasgos: { type: 'array', items: { type: 'string', enum: ids } },
        },
        required: ['hueco', 'descripcion', 'rasgos'],
      },
    },
    razonamiento: { type: 'string', description: 'menos de 200 palabras' },
  },
  required: ['probabilidades', 'examen', 'razonamiento'],
})

const revSchema = (ids) => ({
  type: 'object',
  properties: {
    probabilidades: probsSchema(ids),
    cambios: { type: 'string', description: 'qué cambiaste y por qué, o por qué no cambiaste nada; menos de 150 palabras' },
  },
  required: ['probabilidades', 'cambios'],
})

// Al concursante le llega el nombre y la definición de cada rasgo, no la
// regla fina de los árbitros: esa regla resuelve casos dudosos describiendo
// ejercicios reales, también los del examen que se predice.
const listaTexto = (ronda) => JSON.stringify(
  lista.filter((r) => ronda.ids.includes(r.id)).map(({ id, nombre, bloque, definicion }) => ({ id, nombre, bloque, definicion })),
  null, 1)

const enunciado = (ronda, e) => `Eres el concursante «${e.k}» de un campeonato de predicción de exámenes. Se predice el examen de la 1.ª evaluación de Cálculo (1.º de ingeniería, EIG UPV/EHU; temas 1 y 2: números complejos y sucesiones y series) del curso ${ronda.curso}.

LO QUE PUEDES VER. Solo el fichero ${ronda.fichero}, con todos los exámenes de esos temas ANTERIORES al curso ${ronda.curso} (léelo con Read). No abras ningún otro fichero ni busques nada más: hacerlo es trampa, anula tu ronda, y se comprueba en tu transcripción. No escribas ningún fichero.

LA HISTORIA ETIQUETADA. Los árbitros ya han marcado qué rasgos tuvo cada 1.ª evaluación anterior:
${JSON.stringify(ronda.historia, null, 1)}

LA LISTA CERRADA DE RASGOS (un rasgo es «en el examen hay al menos un ejercicio que…»). Solo están los que ya habían salido en alguna 1.ª evaluación anterior o los que no han salido nunca en ninguna; lo que pueda ser nuevo en este examen no se puntúa:
${listaTexto(ronda)}

${e.t}

QUÉ ENTREGAS.
1. Para CADA rasgo de la lista, la probabilidad (de 0 a 1) de que el examen de ${ronda.curso} lo tenga.
2. El examen que crees más probable: 3 o 4 ejercicios, cada uno con su hueco, una descripción corta y sus rasgos.
3. Tu razonamiento, corto.

CÓMO SE PUNTÚA. Puntuación de Brier: la media de (p − resultado)² sobre todos los rasgos. Premia acertar y también saber cuánto no sabes: dar 0,95 y fallar cuesta mucho; 0 o 1 solo si estás seguro. Compites contra otros seis concursantes con estrategias distintas y contra dos guiones (la frecuencia pura y «lo mismo que el año pasado»). Escribe en castellano.`

const debate = (ronda, e, mia, otras) => `Eres el concursante «${e.k}» del campeonato de predicción del examen de 1.ª evaluación de Cálculo del curso ${ronda.curso}. ${e.t}

Ya entregaste tu predicción. Ahora ves las de los otros ${otras.length} concursantes, anónimas, con su razonamiento. Léelas con espíritu crítico: ¿alguno tiene un argumento que no habías visto, o un error que tú no cometiste? Revisa tus probabilidades solo si tienes un motivo; no cambiar nada es una respuesta válida, y seguir a la mayoría sin motivo no lo es. Se puntúan por separado tu predicción de antes y la de después del debate.

No abras ningún fichero: todo lo que necesitas está aquí.

LA LISTA CERRADA:
${listaTexto(ronda)}

TU PREDICCIÓN:
${JSON.stringify({ probabilidades: mia.probabilidades, razonamiento: mia.razonamiento }, null, 1)}

LAS DE LOS OTROS:
${otras.map((o, i) => `--- Concursante ${'ABCDEFGH'[i]} ---\n${JSON.stringify({ probabilidades: o.probabilidades, razonamiento: o.razonamiento }, null, 1)}`).join('\n')}

Entrega tus probabilidades finales para CADA rasgo y qué cambiaste. En castellano.`

const resultados = await pipeline(
  rondas,
  (ronda) => parallel(ESTRATEGIAS.map((e) => () =>
    agent(enunciado(ronda, e), { label: `${ronda.curso}:${e.k}`, phase: 'Predicción', schema: predSchema(ronda.ids) })
      .then((r) => (r ? { concursante: e.k, ...r } : null)))),
  (preds, ronda) => {
    const validas = preds.filter(Boolean)
    log(`${ronda.curso}: ${validas.length} predicciones; empieza el debate`)
    return parallel(validas.map((mia) => () => {
      const e = ESTRATEGIAS.find((x) => x.k === mia.concursante)
      const otras = validas.filter((o) => o !== mia)
      return agent(debate(ronda, e, mia, otras), { label: `${ronda.curso}:${e.k}:debate`, phase: 'Debate', schema: revSchema(ronda.ids) })
        .then((r) => ({ ronda: ronda.curso, concursante: mia.concursante, antes: mia, despues: r }))
    }))
  },
)

const plano = []
for (const r of resultados.filter(Boolean)) for (const c of r.filter(Boolean)) {
  plano.push({ ronda: c.ronda, concursante: c.concursante, fase: 'solo', probabilidades: c.antes.probabilidades })
  if (c.despues) plano.push({ ronda: c.ronda, concursante: c.concursante, fase: 'debate', probabilidades: c.despues.probabilidades })
}
// El consenso: la media de todos, antes y después del debate.
for (const curso of [...new Set(plano.map((p) => p.ronda))]) for (const fase of ['solo', 'debate']) {
  const suyos = plano.filter((p) => p.ronda === curso && p.fase === fase && p.concursante !== 'consenso')
  if (!suyos.length) continue
  const media = rondas.find((r) => r.curso === curso).ids.map((rasgo) => {
    const ps = suyos.map((s) => s.probabilidades.find((x) => x.rasgo === rasgo)?.p).filter((p) => typeof p === 'number')
    return { rasgo, p: ps.reduce((a, b) => a + b, 0) / ps.length }
  })
  plano.push({ ronda: curso, concursante: 'consenso', fase, probabilidades: media })
}
return { predicciones: plano, detalle: resultados }
