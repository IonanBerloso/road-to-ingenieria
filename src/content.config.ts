import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { comparaComplejo, comparaConjunto, leeComplejo, leeConjunto } from './lib/complejo';

/* ═══════════════════════════════════════════════════════════════════
   Colecciones con esquema. Si falta un campo, si un peso no es uno de
   los tres niveles o si un identificador no tiene la forma esperada,
   EL BUILD FALLA. Los datos no se comprueban a ojo (CLAUDE.md §03).
   ═══════════════════════════════════════════════════════════════════ */

/** Peso de un tema en el examen. Tres niveles, nunca un porcentaje:
 *  el dato es estimado y un 12,5 % sería una precisión falsa (§10). */
const peso = z.enum(['alto', 'medio', 'bajo']);

/** Los cinco patrones de §05, más el simulador cuando el tema lo pide. */
const patron = z.enum([
  'lectura',
  'figura-fija',
  'ejercicio',
  'verificador',
  'demostracion',
  'simulador',
]);

const tema = z.object({
  n: z.number().int().min(1).max(40),
  id: z.string().regex(/^t\d{2}-[a-z0-9-]+$/, 'formato tNN-slug, en minúscula y sin acentos'),
  titulo: z.string().min(3),
  descripcion: z.string().min(3).max(140),
  peso,
  patrones: z.array(patron).min(1),
  /** true solo cuando el tema existe como index.mdx y está terminado según §04. */
  hecho: z.boolean().default(false),
});

const catalogo = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/catalogo' }),
  schema: z
    .object({
      nombre: z.string().min(3),
      curso: z.union([z.literal(1), z.literal(2)]),
      orden: z.number().int().min(1),
      estado: z.enum(['ok', 'obra', 'prev']),
      acento: z.string().regex(/^--a-[a-z]+$/, 'tiene que ser un token de tokens.css'),
      descripcion: z.string().min(10).max(200),
      /** false = el temario está puesto a ojo y hay que sustituirlo por el oficial. */
      temarioOficial: z.boolean(),
      temas: z.array(tema).default([]),
    })
    .refine((a) => a.estado === 'prev' || a.temas.length > 0, {
      message: 'una asignatura en obra o terminada necesita temario',
    })
    .refine((a) => new Set(a.temas.map((t) => t.id)).size === a.temas.length, {
      message: 'hay dos temas con el mismo id',
    })
    .refine((a) => a.estado !== 'ok' || a.temas.every((t) => t.hecho), {
      message: 'una asignatura marcada ok no puede tener temas sin hacer',
    }),
});

/* ═══════════════════════════════════════════════════════════════════
   Los ejercicios, como DATOS (CLAUDE.md §04)
   ═══════════════════════════════════════════════════════════════════ */

/** Una respuesta equivocada concreta, con el razonamiento que la produce.
 *  Nunca «incorrecto»: el mensaje tiene que decir QUÉ ha pasado (§05). */
const distractor = z.object({
  valor: z.string().min(1),
  mensaje: z.string().min(30, 'un distractor sin explicación es un «incorrecto» disfrazado'),
});

/** COMP1 · reconocer qué herramienta pide el enunciado, antes de calcular. */
const pasoReconocer = z.object({
  tipo: z.literal('reconocer'),
  pregunta: z.string().min(10),
  opciones: z
    .array(
      z.object({
        texto: z.string().min(3),
        correcta: z.boolean().default(false),
        mensaje: z.string().min(20),
      }),
    )
    .min(3),
});

/** COMP2 · el cálculo. La respuesta puede ser un complejo o un número real. */
const pasoCalcular = z.object({
  tipo: z.literal('calcular'),
  titulo: z.string().min(3),
  pregunta: z.string().min(10),
  respuesta: z.object({
    tipo: z.enum(['complejo', 'numero', 'conjunto']),
    valor: z.string().min(1),
    tolerancia: z.number().positive().default(0.001),
    /** Qué forma se espera; se muestra junto al campo para no adivinar.
     *  Texto plano: va en un rótulo, no pasa por el procesador de Markdown,
     *  así que un `$a+bi$` aquí se vería con los dólares y todo. */
    formato: z
      .string()
      .refine((s) => !s.includes('$'), 'el formato es texto plano, sin LaTeX')
      .optional(),
  }),
  distractores: z.array(distractor).min(1, 'sin distractores esto no diagnostica nada'),
  pista: z.string().min(10),
  desarrollo: z.string().min(20),
  veredicto: z.string().optional(),
})
  /* Un distractor cuyo valor no se puede leer nunca se dispara: el alumno
     escribe justo ese error y recibe «no he entendido la respuesta» en vez del
     diagnóstico que había escrito para él. Pasó con un «infinito» puesto como
     distractor de una respuesta numérica. Se caza en el build, no en el
     navegador. */
  .refine((p) => leeComplejo(p.respuesta.valor) !== null || p.respuesta.tipo === 'conjunto', {
    message: 'la respuesta correcta no se puede leer con el formato declarado',
  })
  .refine(
    (p) =>
      p.distractores.every((d) =>
        p.respuesta.tipo === 'conjunto' ? leeConjunto(d.valor) : leeComplejo(d.valor),
      ),
    {
      message:
        'hay un distractor que el lector de respuestas no sabe interpretar, así que nunca se dispararía',
    },
  )
  /* Y un distractor demasiado parecido a la respuesta buena se da por bueno.
     Pasó con un 0,995 puesto frente a una respuesta de 1 con tolerancia 0,01:
     el alumno escribía el error y el sistema le decía que había acertado. */
  .refine(
    (p) => {
      if (p.respuesta.tipo === 'conjunto') return true;
      const buena = leeComplejo(p.respuesta.valor);
      if (!buena) return true; // ya lo caza la regla anterior
      return p.distractores.every((d) => {
        const mala = leeComplejo(d.valor);
        return !mala || !comparaComplejo(mala, buena, p.respuesta.tolerancia);
      });
    },
    {
      message:
        'hay un distractor dentro de la tolerancia de la respuesta correcta: se daría por bueno',
    },
  )
  /* Lo mismo para los conjuntos, donde el parecido es más traicionero: un
     conjunto no tiene orden, así que «-2, -3» y «-3, -2» son la MISMA
     respuesta. Si lo que se pide es un par ordenado, `conjunto` no es el tipo
     adecuado y hay que partirlo en dos preguntas. */
  .refine(
    (p) => {
      if (p.respuesta.tipo !== 'conjunto') return true;
      const buena = leeConjunto(p.respuesta.valor);
      if (!buena) return true;
      return p.distractores.every((d) => {
        const mala = leeConjunto(d.valor);
        return !mala || !comparaConjunto(mala, buena, p.respuesta.tolerancia).igual;
      });
    },
    {
      message:
        'hay un distractor que es el mismo conjunto que la respuesta: recuerda que el orden no cuenta',
    },
  );

/** COMP4 · la justificación formal. Ordenar el argumento con UNA pieza trampa
 *  que encarna el error típico y no debe entrar (§05, patrón 5). */
const pasoJustificar = z.object({
  tipo: z.literal('justificar'),
  pregunta: z.string().min(10),
  piezas: z
    .array(
      z.object({
        texto: z.string().min(5),
        /** La pieza envenenada. Va exactamente una por paso. */
        trampa: z.boolean().default(false),
        /** Por qué esta pieza no entra. Obligatorio en la trampa. */
        mensaje: z.string().optional(),
      }),
    )
    .min(3)
    .refine((ps) => ps.filter((p) => p.trampa).length === 1, {
      message: 'un paso de justificación lleva exactamente una pieza trampa',
    })
    .refine((ps) => ps.every((p) => !p.trampa || p.mensaje), {
      message: 'la pieza trampa tiene que explicar por qué no entra',
    }),
  veredicto: z.string().optional(),
});

/** PATRÓN 4 · VERIFICADOR (§05). El alumno escribe su condición simplificada y
 *  la figura comprueba si define **la misma región** que la del enunciado.
 *
 *  Aquí no se guarda ninguna «respuesta correcta», y eso es lo importante: se
 *  comparan dos conjuntos de puntos, así que vale cualquier forma equivalente
 *  de escribir la región. Un examen debería premiar exactamente eso. */
const pasoVerificar = z.object({
  tipo: z.literal('verificar'),
  pregunta: z.string().min(10),
  /** La condición del enunciado, en función de `z`. Es la verdad de referencia. */
  condicion: z.string().min(3),
  /** Trozo de plano que se dibuja y sobre el que se comparan las dos regiones. */
  ventana: z
    .object({
      x: z.tuple([z.number(), z.number()]),
      y: z.tuple([z.number(), z.number()]),
    })
    .default({ x: [-4, 4], y: [-4, 4] }),
  formato: z
    .string()
    .refine((s) => !s.includes('$'), 'el formato es texto plano, sin LaTeX')
    .optional(),
  pista: z.string().min(10),
  desarrollo: z.string().min(20),
  veredicto: z.string().optional(),
});

const paso = z.discriminatedUnion('tipo', [
  pasoReconocer,
  pasoCalcular,
  pasoJustificar,
  pasoVerificar,
]);

const ejercicio = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/, 'en minúscula, sin acentos, con guiones'),
    titulo: z.string().min(5),
    /** Procedencia obligatoria: el material es adaptado, no propio (§08). */
    fuente: z.string().min(10),
    /** Un enunciado puede ser legitimamente corto: «$z^3 = -|z|$» son
     *  trece caracteres y es un enunciado completo. El minimo solo esta para
     *  cazar un campo vacio o un marcador de posicion. */
    enunciado: z.string().min(10),
    /** Qué se pide exactamente, y en qué forma. */
    pide: z.string().min(5),
    pasos: z.array(paso).min(2),
    /** La resolución de examen final: hipótesis, pasos sin saltos, comprobación
     *  y resultado. Es lo que se ve en modo completo y lo que se imprime. */
    resolucion: z.string().min(100),
  })
  .refine((e) => e.pasos.some((p) => p.tipo === 'reconocer'), {
    message: 'falta el paso de COMP1: un ejercicio que solo calcula entrena la parte que menos se falla (§09)',
  })
  .refine((e) => e.pasos.some((p) => p.tipo === 'calcular' || p.tipo === 'verificar'), {
    message: 'falta el paso de COMP2: uno de cálculo o uno de verificación de región',
  })
  .refine((e) => e.pasos.some((p) => p.tipo === 'justificar'), {
    message: 'falta el paso de COMP4, que vale entre 2 y 9 puntos (§09)',
  });

/** Un `ejercicios.yaml` por tema, junto a su `index.mdx`.
 *  El nivel superior es un objeto y no una lista porque el cargador de Astro
 *  trata cada fichero como una entrada. */
const ejercicios = defineCollection({
  loader: glob({ pattern: '**/ejercicios.yaml', base: './src/content' }),
  schema: z
    .object({ ejercicios: z.array(ejercicio).min(1) })
    .refine((f) => new Set(f.ejercicios.map((e) => e.id)).size === f.ejercicios.length, {
      message: 'hay dos ejercicios con el mismo id',
    }),
});

/** Los temas escritos. Uno por carpeta: index.mdx + ejercicios.yaml */
const temaEscrito = z.object({
  asignatura: z.string().min(3),
  tema: z.number().int().min(1).max(40),
  titulo: z.string().min(3),
  descripcion: z.string().min(10).max(200),
  patron,
  /** Competencias que entrena la página (§09). */
  competencias: z.array(z.enum(['COMP1', 'COMP2', 'COMP4'])).min(1),
  /** Procedencia del material adaptado, cuando la hay (§08). */
  fuente: z.string().optional(),
});

const calculo = defineCollection({
  loader: glob({ pattern: '**/index.mdx', base: './src/content/calculo' }),
  schema: temaEscrito,
});

const fluidos = defineCollection({
  loader: glob({ pattern: '**/index.mdx', base: './src/content/fluidos' }),
  schema: temaEscrito,
});

export const collections = { catalogo, calculo, fluidos, ejercicios };
