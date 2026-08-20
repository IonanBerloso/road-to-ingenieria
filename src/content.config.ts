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
  /* Y dos distractores demasiado parecidos ENTRE SÍ tampoco valen, aunque los
     dos estén lejos de la respuesta correcta: el componente busca el primero
     que encaje, así que el segundo nunca se dispara y su mensaje es letra
     muerta. Pasó el 20 de agosto de 2026 con «2» y «1,9975» en un ejercicio
     cuya respuesta era 361: la holgura sale de la tolerancia de la respuesta
     —aquí 0,5— y a esa escala los dos distractores son el mismo número.
     La holgura se replica tal como la calcula EjercicioGuiado. */
  .refine(
    (p) => {
      if (p.respuesta.tipo === 'conjunto') return true;
      const leidos = p.distractores.map((d) => leeComplejo(d.valor));
      const holgura = (v: { re: number; im: number } | null) =>
        Math.max((v ? Math.max(Math.abs(v.re), Math.abs(v.im)) : 1) * 0.02, p.respuesta.tolerancia);
      for (let i = 0; i < leidos.length; i++) {
        for (let j = i + 1; j < leidos.length; j++) {
          const a = leidos[i];
          const b = leidos[j];
          if (!a || !b) continue;
          if (comparaComplejo(a, b, Math.max(holgura(a), holgura(b)))) return false;
        }
      }
      return true;
    },
    {
      message:
        'hay dos distractores que se confunden entre sí: solo saltaría el primero y el otro nunca diagnosticaría nada',
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

/** El reparto de puntos que el propio examen declara, por competencia.
 *
 *  Esto no existía con los boletines: allí el peso lo estimábamos nosotros y
 *  por eso §10 obliga a los tres niveles en vez de a un porcentaje. Un examen
 *  sí lo dice —«COMP 2: 7 puntos por el cálculo»—, así que aquí el número es
 *  un dato, no una estimación, y se puede mostrar tal cual.
 *
 *  Es opcional: los ejercicios de boletín no lo llevan. */
const puntos = z
  .object({
    comp1: z.number().min(0).max(10).default(0),
    comp2: z.number().min(0).max(10).default(0),
    comp4: z.number().min(0).max(10).default(0),
  })
  .refine((p) => p.comp1 + p.comp2 + p.comp4 === 10, {
    message: 'los puntos de un ejercicio de examen tienen que sumar 10',
  });

const ejercicio = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/, 'en minúscula, sin acentos, con guiones'),
    titulo: z.string().min(5),
    /** Procedencia obligatoria: el material es adaptado, no propio (§08). */
    fuente: z.string().min(10),
    /** Solo en los ejercicios de examen: el reparto oficial de los 10 puntos. */
    puntos: puntos.optional(),
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

/* ═══════════════════════════════════════════════════════════════════
   Los exámenes (CLAUDE.md §08, nota del 20 de agosto de 2026)
   ═══════════════════════════════════════════════════════════════════ */

/** Un `examen.yaml` por convocatoria, junto a su `ejercicios.yaml`.
 *
 *  Un examen **cruza temas** —el de 2025-2026 tiene dos ejercicios de
 *  complejos, uno de sucesiones y uno de series—, así que no puede vivir
 *  dentro de la página de un tema. De ahí que sea su propia colección.
 *
 *  Los ejercicios NO se repiten aquí: viven en el `ejercicios.yaml` de al
 *  lado, que la colección `ejercicios` ya carga a cualquier profundidad. Este
 *  fichero solo dice cuáles son, en qué orden y de qué tema es cada uno. */
const examen = defineCollection({
  loader: glob({ pattern: '**/examen.yaml', base: './src/content' }),
  schema: z
    .object({
      asignatura: z.string().min(3),
      /** «2025-2026». Junto con la convocatoria forma la carpeta y la URL.
       *
       *  Hasta el 20 de agosto de 2026 el curso **era** la URL, a secas. Dejó
       *  de valer al llegar la segunda y la tercera evaluación: hay tres
       *  exámenes por curso y tres páginas no caben en una ruta. Ahora la
       *  carpeta es `2024-2025-2ev` y `SUFIJO_CONV` comprueba que el nombre
       *  case con lo que declara el fichero. */
      curso: z.string().regex(/^\d{4}-\d{4}$/, 'formato AAAA-AAAA'),
      /** Las cinco evaluaciones del curso más las dos convocatorias oficiales.
       *  Los nombres son los que imprime la propia cabecera del examen. */
      convocatoria: z.enum([
        'primera',
        'segunda',
        'tercera',
        'cuarta',
        'quinta',
        'ordinaria',
        'extraordinaria',
      ]),
      /** Tal como viene impresa en la cabecera del examen. */
      fecha: z.string().min(8),
      /** Nombre del PDF dentro de `public/examenes/<asignatura>/`.
       *  Que el fichero exista de verdad se comprueba al generar la ruta. */
      pdf: z.string().regex(/^[a-z0-9-]+\.pdf$/, 'en minúscula, con guiones'),
      ejercicios: z
        .array(
          z.object({
            /** Id de un ejercicio del `ejercicios.yaml` de al lado. */
            id: z.string().regex(/^[a-z0-9-]+$/),
            /** El tema del temario al que pertenece, para poder decirlo. */
            tema: z.string().regex(/^t\d{2}-[a-z0-9-]+$/),
          }),
        )
        .min(1),
    })
    .refine((e) => new Set(e.ejercicios.map((x) => x.id)).size === e.ejercicios.length, {
      message: 'el examen repite un ejercicio',
    }),
});

/** El trozo de URL que identifica a cada convocatoria.
 *
 *  Vive aquí y no en la página porque la carpeta del examen **es** la URL, y
 *  la comprobación de que las dos cosas casan se hace al generar la ruta. */
export const SUFIJO_CONV: Record<string, string> = {
  primera: '1ev',
  segunda: '2ev',
  tercera: '3ev',
  cuarta: '4ev',
  quinta: '5ev',
  ordinaria: 'ord',
  extraordinaria: 'ext',
};

const calculo = defineCollection({
  loader: glob({ pattern: '**/index.mdx', base: './src/content/calculo' }),
  schema: temaEscrito,
});

const fluidos = defineCollection({
  loader: glob({ pattern: '**/index.mdx', base: './src/content/fluidos' }),
  schema: temaEscrito,
});

export const collections = { catalogo, calculo, fluidos, ejercicios, examen };
