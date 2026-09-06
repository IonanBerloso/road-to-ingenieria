import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { comparaComplejo, comparaConjunto, leeComplejo, leeConjunto } from './lib/complejo';
import { leeMatriz, leeVector } from './lib/algebra';
import { comparaMagnitud, leeMagnitud, traeUnidad } from './lib/unidades';
import { evaluaNumero } from './lib/regiones';
import { comparaFormula, leeFormula } from './lib/quimica';

/* ═══════════════════════════════════════════════════════════════════
   Colecciones con esquema. Si falta un campo, si un peso no es uno de
   los tres niveles o si un identificador no tiene la forma esperada,
   EL BUILD FALLA. Los datos no se comprueban a ojo (CLAUDE.md §03).
   ═══════════════════════════════════════════════════════════════════ */

/** El lector que le toca a cada tipo de respuesta.
 *
 *  Existe para que las comprobaciones del esquema no tengan que enumerar los
 *  tipos una por una. Antes de Álgebra eran dos y se escribía a mano
 *  —`tipo === 'conjunto' ? leeConjunto : leeComplejo`—; con cinco eso son
 *  cuatro sitios que hay que acordarse de tocar a la vez, y olvidarse de uno
 *  no rompe nada visible: simplemente deja pasar un distractor ilegible, que
 *  es el fallo que estas reglas existen para cazar. */
const lector = (tipo: string): ((s: string) => unknown | null) => {
  if (tipo === 'conjunto') return leeConjunto;
  if (tipo === 'vector') return leeVector;
  if (tipo === 'matriz') return leeMatriz;
  if (tipo === 'magnitud') return leeMagnitud;
  if (tipo === 'formula') return leeFormula;
  /* Los dos, en el mismo orden que el navegador.
     ──────────────────────────────────────────────
     `EjercicioGuiado` lee una respuesta numérica con
     `leeComplejo(t) ?? evaluaNumero(t)`: el primero entiende la forma
     binómica y el segundo las expresiones —`pi/4`, `sqrt(3)/2`, notación
     científica—. Aquí solo se llamaba al primero, así que **el esquema era
     más estricto que el sitio**: rechazaba en el build respuestas que el
     navegador habría aceptado sin problema.

     Salió el 5 de septiembre de 2026 con las constantes de equilibrio de
     Química: `1.08e-3` es una respuesta perfectamente legible en la página
     y tumbaba el build. Un guardián que no espeja lo que hace el producto
     no está protegiendo el producto, está describiendo otro (§11). */
  return (s: string) => leeComplejo(s) ?? evaluaNumero(s);
};

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
  /** Un tema del temario oficial del que **no hay nada que transcribir**: se
   *  explica en clase y no aparece ni en la colección de problemas ni en
   *  ninguna convocatoria, así que no puede tener `index.mdx` por mucho que se
   *  trabaje. El valor es el **motivo con su fuente**, no un booleano, y por
   *  eso es una cadena larga: es un hecho del mundo que el repositorio no
   *  contiene (§13 caso 5) y no se deduce de ningún dato de aquí. Escribirlo
   *  obliga a decir quién lo dijo.
   *
   *  Nace el 2 de septiembre de 2026 con los temas 5 y 6 de Fluidos, que
   *  bloqueaban el cierre de la asignatura: el esquema exigía `hecho` en
   *  todos para permitir `estado: ok`, así que Fluidos no podía cerrarse
   *  nunca. Las dos salidas malas eran borrarlos del catálogo —y entonces el
   *  temario deja de ser el oficial, contra §15— o marcarlos `hecho` —y
   *  entonces el dato miente, contra §10—. Esta es la tercera: **decirlo**. */
  soloEnClase: z.string().min(30, 'un tema sin material tiene que decir por qué, y quién lo dice').optional(),
  /** La etiqueta Caveat de la lista del detalle (brief §5b): «una etiqueta
   *  solo donde informa». Nació derivada del patrón simulador y se generalizó
   *  el 29 de agosto de 2026 cuando la auditoría cazó que t03 y t05 de
   *  Álgebra publicaban «peso medio» sin decir que son transversales: sus
   *  herramientas caen DENTRO de los demás ejercicios, nunca como hueco
   *  propio. Opcional: un tema sin etiqueta no pinta nada. */
  etiqueta: z.string().min(4).max(45).optional(),
}).refine((t) => !(t.hecho && t.soloEnClase), {
  message: 'un tema no puede estar hecho y no tener material a la vez: elige',
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
      /**
       * De dónde sale el temario, cuando se afirma que es el oficial.
       *
       * §15 lo pedía desde el principio —«los temas del catálogo son el
       * temario oficial, no una lista plausible. **Con su fuente**»— y el
       * esquema no lo tenía: `temarioOficial` era un booleano pelado, así que
       * la afirmación más importante del catálogo era la única sin respaldo.
       * Lo cazó cerrar las cuatro asignaturas el 6 de septiembre de 2026,
       * comprobando §15 criterio a criterio en vez de darlo por sabido.
       *
       * El `refine` de abajo lo hace obligatorio en cuanto se dice `true`, que
       * es la forma de que no vuelva a pasar: la afirmación y su respaldo
       * entran juntos o no entra ninguna. Es el mismo trato que ya tenía
       * `evaluacion.fuente`, y por el mismo motivo (§10).
       */
      fuenteTemario: z.string().min(20).optional(),
      temas: z.array(tema).default([]),
      /**
       * Cómo se compone la nota. Es un dato de la guía docente, no del examen.
       *
       * POR QUÉ EXISTE. Lo pidió la auditoría externa del 4 de septiembre de
       * 2026 y lo llamó «la mejora de más rendimiento de toda la auditoría»:
       * el sitio no decía en ningún sitio cómo se puntúa, y **entre el 20 y el
       * 30 % de la nota no es el examen escrito**. Un alumno que estudiara
       * solo aquí creería que la nota es el examen; en Cálculo se enteraría
       * tarde de que hay un 20 % de laboratorio y un umbral por cuatrimestre
       * que le capa la nota a 4,5.
       *
       * `fuente` es obligatoria y larga a propósito (§10): un peso publicado
       * sin decir de dónde sale es exactamente el «dato estimado con
       * apariencia de medido» que este proyecto se prohíbe. Si un día no se
       * tiene la guía, no se pone el campo — no se rellena a ojo.
       */
      evaluacion: z
        .object({
          fuente: z.string().min(25, 'de qué guía y de qué año sale esto'),
          modalidades: z
            .array(
              z.object({
                /** «Evaluación continua», «Evaluación final»… */
                nombre: z.string().min(4).max(40),
                partes: z
                  .array(
                    z.object({
                      que: z.string().min(3).max(80),
                      /** Porcentaje sobre la nota de esa modalidad. */
                      peso: z.number().int().min(1).max(100),
                    }),
                  )
                  .min(1),
                /** Umbrales y condiciones que no son un porcentaje. */
                nota: z.string().min(20).optional(),
              }),
            )
            .min(1),
        })
        .optional()
        .superRefine((e, ctx) => {
          for (const m of e?.modalidades ?? []) {
            const suma = m.partes.reduce((s, p) => s + p.peso, 0);
            if (suma !== 100) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `los pesos de «${m.nombre}» suman ${suma}, no 100`,
              });
            }
          }
        }),
    })
    .refine((a) => a.estado === 'prev' || a.temas.length > 0, {
      message: 'una asignatura en obra o terminada necesita temario',
    })
    .refine((a) => new Set(a.temas.map((t) => t.id)).size === a.temas.length, {
      message: 'hay dos temas con el mismo id',
    })
    .refine((a) => !a.temarioOficial || Boolean(a.fuenteTemario), {
      message:
        'si el temario se declara oficial hay que decir de dónde sale, en fuenteTemario (§15)',
    })
    .refine((a) => a.estado !== 'ok' || a.temas.every((t) => t.hecho || t.soloEnClase), {
      message:
        'una asignatura marcada ok no puede tener temas sin hacer, salvo los que declaren soloEnClase con su motivo',
    })
    /* Y el freno de mano: si algún día la mitad del temario se declara
       «solo en clase», eso no es una asignatura terminada, es una lista de
       excusas. El tope es un tercio, y está puesto para que salte antes de
       que a nadie se le ocurra usar la salida como atajo. */
    .refine(
      (a) => a.temas.filter((t) => t.soloEnClase).length * 3 <= a.temas.length,
      { message: 'más de un tercio del temario sin material: eso no se cierra, se investiga' },
    ),
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
    /* `vector` y `matriz` entran el 26 de agosto de 2026 con Álgebra, y no
       antes: los pidió la ordinaria de 2024-2025, que remata dos ejercicios
       con unas coordenadas y con una matriz asociada. `conjunto` no vale para
       ninguna de las dos —compara sin orden—, y en una base el orden ES la
       respuesta. */
    /* `magnitud` entra el 30 de agosto de 2026 con Mecánica de Fluidos, la
       primera asignatura donde la respuesta lleva unidad. No es un `numero`
       con la unidad metida en `formato`: eso daría por buena una presión en
       m/s y por mala la misma presión escrita en bar. Ver `lib/unidades.ts`,
       que explica los tres errores que hay que saber distinguir. */
    /* `formula` entra el 5 de septiembre de 2026 con Fundamentos Químicos, y
       se ha esperado a que lo pidieran DOS ejercicios y no uno (§13). Los dos
       son la misma pregunta —una lista de diez compuestos, la mitad para
       nombrar y la mitad para formular— y eran el único bloqueo que impedía
       dar por transcritas las seis convocatorias de la asignatura. No ajusta
       ecuaciones: ninguno de los dos lo pide. Ver `lib/quimica.ts`. */
    tipo: z.enum(['complejo', 'numero', 'conjunto', 'vector', 'matriz', 'magnitud', 'formula']),
    valor: z.string().min(1),
    /** Para `magnitud` es **relativa** (0,02 = 2 %); para todo lo demás,
     *  absoluta. Lo pide el ábaco de Moody: media respuesta de fluidos sale
     *  de leer una curva a ojo. */
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
  .refine((p) => lector(p.respuesta.tipo)(p.respuesta.valor) !== null, {
    message: 'la respuesta correcta no se puede leer con el formato declarado',
  })
  .refine(
    (p) =>
      p.distractores.every((d) =>
        lector(p.respuesta.tipo)(d.valor) !== null,
      ),
    {
      message:
        'hay un distractor que el lector de respuestas no sabe interpretar, así que nunca se dispararía',
    },
  )
  /* Una respuesta de tipo `magnitud` sin unidad es un ejercicio que no puede
     corregir lo que dice corregir: el alumno escribiría «5» y el sistema no
     tendría contra qué contrastar la unidad. Si de verdad es adimensional
     —un Reynolds, un rendimiento—, el tipo es `numero`. */
  .refine((p) => p.respuesta.tipo !== 'magnitud' || traeUnidad(p.respuesta.valor), {
    message:
      'una respuesta de tipo magnitud tiene que llevar unidad; si es adimensional, el tipo es numero',
    path: ['respuesta', 'valor'],
  })
  /* Y un distractor de otra dimensión nunca se dispararía como distractor: el
     comparador lo atrapa antes con el diagnóstico de «eso es otra magnitud».
     Declararlo es escribir un mensaje que nadie va a leer. */
  .refine(
    (p) => {
      if (p.respuesta.tipo !== 'magnitud') return true;
      const buena = leeMagnitud(p.respuesta.valor);
      if (!buena) return true;
      return p.distractores.every((d) => {
        const mala = leeMagnitud(d.valor);
        return !mala || !comparaMagnitud(mala, buena, p.respuesta.tolerancia).otraDimension;
      });
    },
    {
      message:
        'hay un distractor con unidad de otra magnitud: el comparador lo diagnostica antes, y este mensaje no se vería',
      path: ['distractores'],
    },
  )
  /* Dos distractores indistinguibles entre sí son un diagnóstico que nunca se
     ve: el alumno escribe el segundo y recibe el mensaje del primero. Pasó el
     31 de agosto de 2026 en las campanas de buceo del tema 8 de Fluidos, donde
     dos errores distintos —usar la presión absoluta y resolver la otra
     campana— daban por casualidad el mismo 30,61 m. Lo cazaba `humo.mjs` en el
     navegador diez minutos después; aquí falla el build en un segundo.

     La holgura tiene que ser **la misma que usa `EjercicioGuiado` al reconocer
     un distractor**, o esto da falsos positivos. Y no es la misma en los dos
     casos: en `magnitud` la tolerancia ya es relativa, mientras que en
     `numero` y `complejo` el componente la escala con el propio valor
     (`max(|v|·0,02, tolerancia)`). Con un 2 % fijo, los distractores `0` y
     `0,0173` de una sucesión de Cálculo salían «confundibles» y no lo son. */
  .refine(
    (p) => {
      const t = p.respuesta.tipo;
      if (t !== 'magnitud' && t !== 'numero' && t !== 'complejo') return true;
      const tol = p.respuesta.tolerancia;
      const lee = (s: string) => (t === 'magnitud' ? leeMagnitud(s) : leeComplejo(s));
      const iguales = (a: never, b: never) => {
        if (t === 'magnitud') return comparaMagnitud(a, b, Math.max(tol, 0.02)).igual;
        const v = b as { re: number; im: number };
        const escala = Math.max(Math.abs(v.re), Math.abs(v.im));
        return comparaComplejo(a, b, Math.max(escala * 0.02, tol));
      };
      /* Simétrico a propósito: la holgura se calcula sobre el segundo
         argumento, así que `a≈b` y `b≈a` no son la misma pregunta cuando los
         dos valores están justo en el límite. El componente prueba el escrito
         contra **cada** distractor, así que basta con que uno de los dos
         sentidos coincida para que el diagnóstico se pierda. */
      const vs = p.distractores.map((d) => lee(d.valor));
      for (let i = 0; i < vs.length; i++)
        for (let j = i + 1; j < vs.length; j++) {
          if (!vs[i] || !vs[j]) continue;
          if (iguales(vs[i] as never, vs[j] as never)) return false;
          if (iguales(vs[j] as never, vs[i] as never)) return false;
        }
      return true;
    },
    {
      message:
        'hay dos distractores que se confunden entre sí: el segundo nunca mostraría su diagnóstico',
      path: ['distractores'],
    },
  )
  /* La misma trampa, en la versión química. Aquí no hay tolerancia que valga:
     lo que confunde es la NORMALIZACIÓN. `Fe₂O₃` y `Fe2O3` son la misma
     respuesta para el lector, y `óxido de sodio` y `Óxido sodio` también, así
     que un distractor escrito con otra grafía **es** la respuesta buena y se
     daría por acertado. Se comprueba contra la respuesta y entre distractores.
     Validado al revés poniendo `Fe₂O₃` de distractor de `Fe2O3`. */
  .refine(
    (p) => {
      if (p.respuesta.tipo !== 'formula') return true;
      const vs = p.distractores.map((d) => d.valor);
      if (vs.some((v) => comparaFormula(v, p.respuesta.valor).igual)) return false;
      for (let i = 0; i < vs.length; i++)
        for (let j = i + 1; j < vs.length; j++)
          if (comparaFormula(vs[i], vs[j]).igual) return false;
      return true;
    },
    {
      message:
        'hay un distractor que, una vez normalizado, es la misma respuesta que otro o que la buena',
      path: ['distractores'],
    },
  )
  /* Y un distractor demasiado parecido a la respuesta buena se da por bueno.
     Pasó con un 0,995 puesto frente a una respuesta de 1 con tolerancia 0,01:
     el alumno escribía el error y el sistema le decía que había acertado. */
  .refine(
    (p) => {
      if (p.respuesta.tipo === 'magnitud') {
        const buena = leeMagnitud(p.respuesta.valor);
        if (!buena) return true;
        return p.distractores.every((d) => {
          const mala = leeMagnitud(d.valor);
          return !mala || !comparaMagnitud(mala, buena, p.respuesta.tolerancia).igual;
        });
      }
      if (p.respuesta.tipo !== 'numero' && p.respuesta.tipo !== 'complejo') return true;
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
      /* `.strict()` — un nombre de campo mal escrito TIENE que fallar.
       *
       * Zod descarta en silencio las claves que no conoce, así que escribir
       * `trambpa` en vez de `trampa` no da error: la pieza deja de ser la
       * trampa, el paso se queda sin ninguna, y el único aviso llega —si
       * llega— desde el refine que las cuenta. El 5 de septiembre de 2026
       * cometí esa errata **dos veces en la misma tarde** escribiendo
       * Fundamentos Químicos, y las dos veces pasó el guardián porque la
       * clave buena estaba justo al lado.
       *
       * Es la clase de fallo que este proyecto más teme: no rompe nada, no se
       * ve, y se pierde contenido. Aquí es donde más duele —una pieza sin su
       * `mensaje` es un diagnóstico que no llega— así que aquí entra primero.
       */
      z.object({
        texto: z.string().min(5),
        /** La pieza envenenada. Va exactamente una por paso. */
        trampa: z.boolean().default(false),
        /** Por qué esta pieza no entra. Obligatorio en la trampa. */
        mensaje: z.string().optional(),
      }).strict('esa clave no existe en una pieza: solo `texto`, `trampa` y `mensaje`. Si has escrito bien el nombre, el campo hay que declararlo en content.config.ts'),
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

/** REDACTAR — escribir la demostración en papel y contrastarla con la rúbrica.
 *
 *  Por qué hace falta un tipo más. Medido sobre las once primeras
 *  evaluaciones, el **48,7 %** de la nota es COMP4: explicación formal. Y lo
 *  que el sitio entrena hoy es otra cosa. `justificar` da las piezas del
 *  argumento hechas y pide ordenarlas: eso enseña a **reconocer** un
 *  razonamiento correcto, que no es lo que corrige el examen. El examen
 *  corrige lo que tú escribes.
 *
 *  Y aquí está el límite honesto: el sitio es estático y §02 prohíbe backend,
 *  así que **no se puede corregir texto libre**. Este paso no lo finge. Hace
 *  lo que hace un corrector cuando reparte la nota: enseñar la rúbrica. Tú
 *  escribes en papel, la despliegas y te comparas punto por punto.
 *
 *  No es un sexto patrón (§05): es un tipo de paso dentro del Ejercicio
 *  guiado, como `verificar`. */
const pasoRedactar = z.object({
  tipo: z.literal('redactar'),
  /** Qué hay que escribir, exactamente. */
  consigna: z.string().min(20),
  /** Los puntos que un corrector busca, en el orden en que se escriben.
   *  Cada uno dice **qué** se mira y **por qué** cuenta: una rúbrica que solo
   *  enumera se lee como una lista de manías. */
  rubrica: z
    .array(
      z.object({
        punto: z.string().min(10),
        porque: z.string().min(20),
      }),
    )
    .min(3),
  veredicto: z.string().optional(),
});

const paso = z.discriminatedUnion('tipo', [
  pasoReconocer,
  pasoCalcular,
  pasoJustificar,
  pasoVerificar,
  pasoRedactar,
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
    comp1: z.number().min(0).max(20).default(0),
    comp2: z.number().min(0).max(20).default(0),
    comp4: z.number().min(0).max(20).default(0),
  })
  /* Casi todos los ejercicios valen 10, pero no todos: el del dron de la
     segunda evaluación de 2017-2018 vale **20 de los 40** del examen, y su
     reparto impreso es COMP1 6, COMP2 4, COMP4 10. Hasta el 22 de agosto de
     2026 esta comprobación exigía que sumaran exactamente 10, y eso obligaba
     a dividir el reparto real entre dos — es decir, a publicar un dato falso
     para contentar al guardián, justo lo que §11 dice que no hay que hacer.
     Ahora se admite cualquier múltiplo de 10, que es lo que la escuela usa.

     ── Y el 24 de agosto de 2026 hubo que bajar a múltiplos de 5 ──

     Al transcribir la cuarta evaluación de 2018-2019 apareció un ejercicio de
     **5 puntos sobre 25**, y el guardián lo rechazaba. Antes de tocarlo se
     midió, que es lo que §11 pide: extrayendo el texto de los 50 exámenes del
     segundo cuatrimestre salen 267 repartos impresos, y este es el reparto:

       10/40 ×128 · 10/30 ×72 · 10/50 ×40 · 10/20 ×18 · 10/60 ×6
       10/25 ×2  ·  5/25 ×1

     O sea que la regla acertaba **266 veces de 267**. No estaba mal: estaba
     incompleta. Se baja a múltiplos de 5, que sigue cazando un 7 o un 12 —los
     errores de transcripción que importan— y deja de obligar a falsear el
     único ejercicio que vale 5. */
  .refine((p) => {
    const total = p.comp1 + p.comp2 + p.comp4;
    return total > 0 && total % 5 === 0;
  }, {
    message:
      'los puntos de un ejercicio de examen tienen que sumar un múltiplo de 5 (266 de 267 valen 10; el del dron de 2017-2018 vale 20 y uno de 2018-2019 vale 5)',
  });

const ejercicio = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/, 'en minúscula, sin acentos, con guiones'),
    titulo: z.string().min(5),
    /** Procedencia obligatoria (§08). Casi siempre es material adaptado; los
     *  ejemplos introductorios son nuestros y lo dicen en la propia cadena. */
    fuente: z.string().min(10),
    /** En qué escalón de la progresión entra.
     *
     *  Hasta el 23 de agosto de 2026 no existía ningún dato de dificultad en
     *  todo el corpus, y se notaba: en el bloque de regiones la dificultad
     *  estimada iba de 1,5 a 4,5 con la moda en 3,5, el único abordable de
     *  cero estaba enterrado el décimo de diecisiete, y las cuatro
     *  traducciones básicas que la prosa enumera no tenían **ni un ejercicio
     *  propio**. Sin este campo no se puede expresar una escalera.
     *
     *  · `ejemplo`  — nuestro, corto, una sola idea, para empezar de cero.
     *  · `practica` — del boletín: el mismo tipo, ya con dificultad real.
     *  · `examen`   — tal como cayó.
     *
     *  Era `.optional()` y se dedujo «con puntos es de examen, sin ellos es
     *  práctica». Esa deducción escondió el problema: el 28 de agosto de 2026
     *  había **244 ejercicios sin el campo** —101 de tema y 143 de examen—, y
     *  con ellos no se podía ni ordenar ni comprobar la escalera de §14, que
     *  es justo donde vive el peor problema pedagógico del sitio. Ahora es
     *  obligatorio: un ejercicio nuevo sin `nivel` rompe el build. */
    nivel: z.enum(['ejemplo', 'practica', 'examen']),
    /** Solo en los ejercicios de examen: el reparto oficial de puntos. */
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

/** Las convocatorias del curso, **en orden**, con todo lo que hay que saber de
 *  cada una: el trozo de URL que la identifica, cómo se abrevia en la portada
 *  y cómo se nombra en una frase.
 *
 *  Una sola tabla, y las páginas leen de ella. Hasta el 25 de agosto de 2026
 *  esto vivía repartido en **seis listas dentro de cuatro ficheros** —el enum,
 *  `SUFIJO_CONV`, dos órdenes y tres juegos de etiquetas—, así que añadir una
 *  convocatoria era editar seis sitios y olvidarse de alguno. Es la Regla 0
 *  con otra cara: la lista duplicada de siempre.
 *
 *  Los nombres son los que imprime la propia cabecera del examen.
 *
 *  **Las dos recuperaciones.** Hasta 2020-2021, los cuadernillos de la cuarta
 *  y de la quinta evaluación llevan **cada uno** dentro un segundo examen
 *  marcado «PRIMER CUATRIMESTRAL (sólo para alumnos con el primer
 *  cuatrimestral suspendido)»: uno en febrero o marzo y otro en abril o mayo.
 *  Son de los temas 1–5, no de los del cuatrimestre que les da nombre.
 *
 *  El 25 de agosto de 2026 entró una sola fila, `recuperacion`, con URL `rec`,
 *  porque solo se habían leído los cuadernillos de la cuarta. Al abrir los de
 *  la quinta apareció la segunda, y con ella el choque: `2017-2018-rec` ya no
 *  identificaba a ninguna de las dos. Se parte en dos filas y la URL dice de
 *  qué cuadernillo salió cada una, que es el dato que permite encontrar el
 *  PDF. Cada una va **antes** de su evaluación, porque cuando tienen fechas
 *  distintas la recuperación es la primera.
 *
 *  **Los tres parciales.** Entraron el 1 de septiembre de 2026 con Fluidos,
 *  que a diferencia de Cálculo no se evalúa por cuadernillos numerados sino
 *  con exámenes parciales a lo largo del curso: dos en 2019-2020 y **tres**
 *  en 2020-2021. Van después de las evaluaciones y antes de la ordinaria,
 *  que es su orden en el calendario.
 *
 *  Y aquí el nombre **no** sale de la cabecera del examen, que dice solo
 *  «EXAMEN PARCIAL» y la fecha. El ordinal es nuestro y hace falta para que
 *  dos parciales del mismo curso no compartan carpeta ni URL; se numeran por
 *  fecha, que es como los nombra un alumno.
 *
 *  **Los cuatro de cuatrimestre, y la extraordinaria partida.** Entraron el 5
 *  de septiembre de 2026 con Fundamentos Químicos, que no se evalúa ni por
 *  evaluaciones numeradas ni por parciales: su guía docente manda **dos
 *  pruebas por cuatrimestre** —un control a mitad, que vale un 5 %, y un
 *  examen final de cuatrimestre, que vale un 35 %— y una extraordinaria en la
 *  que el alumno puede presentarse a un cuatrimestre o a los dos.
 *
 *  Se podría haber metido todo en `ordinaria` y `extraordinaria`, y sería
 *  falso de una forma cara: quien prepara el primer cuatrimestre vería el
 *  examen del segundo como si fuera lo mismo, y son temas distintos —el 1.º
 *  va del tema 1 al 4 y el 2.º del 5 al 10—. Mandar a alguien a estudiar
 *  termoquímica cuando su examen es de estequiometría es el peor fallo que
 *  puede cometer una ruta.
 *
 *  Cada una de las cinco filas nuevas tiene su documento delante: dos
 *  controles de 2023-2024, dos finales de 2024-2025 y la extraordinaria del
 *  segundo cuatrimestre de 2024-2025. Ninguna se ha añadido «por si acaso»,
 *  que es como esta tabla se llenaría de filas muertas.
 *
 *  El nombre largo va en minúscula: quien lo pinta como título lo capitaliza,
 *  y así no hacen falta dos columnas que digan lo mismo. */
export const CONVOCATORIAS = {
  primera: { url: '1ev', corta: '1.ª ev.', larga: 'primera evaluación' },
  segunda: { url: '2ev', corta: '2.ª ev.', larga: 'segunda evaluación' },
  tercera: { url: '3ev', corta: '3.ª ev.', larga: 'tercera evaluación' },
  'recuperacion-cuarta': {
    url: '4ev-rec',
    corta: 'recup. 4.ª',
    larga: 'recuperación del primer cuatrimestre, con la 4.ª evaluación',
  },
  cuarta: { url: '4ev', corta: '4.ª ev.', larga: 'cuarta evaluación' },
  'recuperacion-quinta': {
    url: '5ev-rec',
    corta: 'recup. 5.ª',
    larga: 'recuperación del primer cuatrimestre, con la 5.ª evaluación',
  },
  quinta: { url: '5ev', corta: '5.ª ev.', larga: 'quinta evaluación' },
  'primer-parcial': { url: '1par', corta: '1.er parc.', larga: 'primer examen parcial' },
  'segundo-parcial': { url: '2par', corta: '2.º parc.', larga: 'segundo examen parcial' },
  'tercer-parcial': { url: '3par', corta: '3.er parc.', larga: 'tercer examen parcial' },
  'control-primer-cuatrimestre': {
    url: '1c-control',
    corta: 'control 1.er c.',
    larga: 'control del primer cuatrimestre',
  },
  'primer-cuatrimestre': {
    url: '1c',
    corta: 'final 1.er c.',
    larga: 'examen final del primer cuatrimestre',
  },
  'control-segundo-cuatrimestre': {
    url: '2c-control',
    corta: 'control 2.º c.',
    larga: 'control del segundo cuatrimestre',
  },
  'segundo-cuatrimestre': {
    url: '2c',
    corta: 'final 2.º c.',
    larga: 'examen final del segundo cuatrimestre',
  },
  ordinaria: { url: 'ord', corta: 'ordinaria', larga: 'convocatoria ordinaria' },
  extraordinaria: { url: 'ext', corta: 'extraord.', larga: 'convocatoria extraordinaria' },
  'extraordinaria-segundo-cuatrimestre': {
    url: '2c-ext',
    corta: 'extraord. 2.º c.',
    larga: 'extraordinaria del segundo cuatrimestre',
  },
} as const;

/** Las claves de la tabla, en su orden. Es el orden en que se listan. */
export const ORDEN_CONV = Object.keys(CONVOCATORIAS) as (keyof typeof CONVOCATORIAS)[];

/** Las asignaturas que tienen colección de temas, o sea prosa publicada.
 *
 *  Vivía dentro de `[tema].astro` con su porqué escrito al lado, y salió aquí
 *  el 6 de septiembre de 2026 al necesitarla también la portada, para armar el
 *  índice de conceptos de la paleta. Dos listas con los mismos cuatro nombres
 *  en dos ficheros es §01 exactamente: la que se olvide de actualizar hará que
 *  una asignatura entera se salte **en silencio**, que es la forma que ya tuvo
 *  este fallo cuando se escribió el primer tema de Álgebra.
 *
 *  Se amplía al abrir la quinta asignatura, y entonces se amplía **una sola
 *  vez**. */
export const CON_TEMAS = ['calculo', 'fluidos', 'algebra', 'fundamentos-quimicos'] as const;
export type ConTemas = (typeof CON_TEMAS)[number];

const convocatoria = z.enum(ORDEN_CONV as [string, ...string[]]);

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
      convocatoria,
      /** Tal como viene impresa en la cabecera del examen. */
      fecha: z.string().min(8),
      /** Nombre del PDF dentro de `public/examenes/<asignatura>/`, o **la
       *  lista** cuando el examen viene en más de un cuadernillo.
       *  Que los ficheros existan de verdad se comprueba al generar la ruta.
       *
       *  Admitir una lista entra el 28 de agosto de 2026, y no es una
       *  comodidad: era un supuesto falso metido en el modelo de datos. El
       *  examen de mayo-junio de 2020 —el del confinamiento— son **dos**
       *  cuadernillos, el primer y el segundo cuatrimestral, y este campo solo
       *  dejaba enlazar uno. Resultado: los ocho ejercicios del segundo se
       *  publicaban con su resolución y **sin un enunciado original que
       *  contrastar**, que es justo lo que §08 existe para impedir. Lo
       *  encontró la auditoría de §15, contando qué PDF de `public/` no
       *  enlazaba nadie. */
      pdf: z.union([
        z.string().regex(/^[a-z0-9-]+\.pdf$/, 'en minúscula, con guiones'),
        z.array(z.string().regex(/^[a-z0-9-]+\.pdf$/, 'en minúscula, con guiones')).min(1),
      ]),
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
      /**
       * Los ejercicios del cuadernillo que **no** están transcritos, con su
       * número y su motivo.
       *
       * POR QUÉ EXISTE. Hasta el 4 de septiembre de 2026 esto se escribía en
       * un **comentario** de este mismo fichero, y un comentario no llega a
       * nadie: la página de la convocatoria ordinaria de 2025-2026 anunciaba
       * «7 ejercicios» de un examen que trae **nueve**, sin decir una palabra.
       * El alumno abre el PDF de al lado —que el sitio le ofrece en un botón
       * amarillo—, encuentra un 4 y un 9 que aquí no están, y no sabe si es un
       * fallo, un descuido o que no existen. Ocho de las dieciséis
       * convocatorias de Fluidos estaban así.
       *
       * Es §15 incumplido en el sitio mientras se cumplía en el repositorio:
       * «un hueco declarado es información; uno escondido, una promesa
       * incumplida». Estaba declarado donde no lo lee nadie.
       *
       * El `motivo` es obligatorio y largo a propósito: si no se puede
       * explicar en dos líneas por qué falta, es que no está decidido.
       */
      fuera: z
        .array(
          z.object({
            /** El número con el que aparece en el cuadernillo. */
            n: z.number().int().positive(),
            /** Por qué no está, con el detalle que haga falta. */
            motivo: z.string().min(40),
          }),
        )
        .default([]),
    })
    .refine((e) => new Set(e.ejercicios.map((x) => x.id)).size === e.ejercicios.length, {
      message: 'el examen repite un ejercicio',
    }),
});

/** El trozo de URL que identifica a cada convocatoria.
 *
 *  Vive aquí y no en la página porque la carpeta del examen **es** la URL, y
 *  la comprobación de que las dos cosas casan se hace al generar la ruta. */
export const SUFIJO_CONV: Record<string, string> = Object.fromEntries(
  Object.entries(CONVOCATORIAS).map(([k, v]) => [k, v.url]),
);

/* ═══════════════════════════════════════════════════════════════════════
   Rutas de estudio
   ═══════════════════════════════════════════════════════════════════════ */

/** A qué apunta un bloque de la ruta.
 *
 *  Unión discriminada y no una cadena suelta: si esto fuera texto libre, el
 *  día que alguien escriba una URL a mano nadie se enteraría hasta que el
 *  enlace ya estuviera roto en producción. Así, cada forma de referencia tiene
 *  su validación y su resolución.
 *
 *  **Nunca se copia aquí lo que se referencia**: ni el enunciado, ni la
 *  fuente, ni los puntos. Todo eso vive en `ejercicios.yaml` y la página lo
 *  resuelve por `id`. Cualquier cosa que la ruta reescriba sería una segunda
 *  fuente de verdad que acabaría separándose (§01, §08). */
const referencia = z.discriminatedUnion('tipo', [
  z.object({
    tipo: z.literal('ejercicio'),
    id: z.string().regex(/^[a-z0-9-]+$/),
    /** `true` incrusta el ejercicio guiado entero; `false` solo lo enlaza.
     *  El defecto es enlazar: cuarenta ejercicios incrustados son una página
     *  que nadie descarga. */
    incrustado: z.boolean().default(false),
    /** Comentario nuestro sobre por qué está aquí. **Nunca** un resumen del
     *  enunciado, que se reproduce tal cual y en su sitio (§08). */
    nota: z.string().min(10).optional(),
  }),
  z.object({
    tipo: z.literal('teoria'),
    tema: z.string().regex(/^t\d{2}-[a-z0-9-]+$/),
    /** Slug del `<h2>` al que se salta. Lleva acentos: el generador de MDX no
     *  los quita, así que «Raíces n-ésimas…» produce
     *  `raíces-n-ésimas-cuántas-hay…`. Copiarlo a ojo del título es la forma
     *  segura de equivocarse, por eso se comprueba al generar la ruta:
     *  `verify.mjs` parte los href por `#` y **no valida fragmentos**, así que
     *  un apartado mal escrito pasaría el suelo en verde y dejaría al alumno
     *  en la cabecera de la página.
     *
     *  La `ö` entra el 27 de agosto de 2026, con la ruta de Álgebra. El teorema
     *  se llama **Rouché-Fröbenius** —así lo escribe la hoja de teoría oficial
     *  del Departamento— y su apartado produce un slug con diéresis. La
     *  alternativa era escribir el nombre mal para que pasara el esquema, que
     *  es exactamente «escribir peor para contentar a un guardián» (§11). La
     *  clase de caracteres enumera acentos porque el slugger de Astro no los
     *  quita; que enumerara solo los castellanos era un supuesto, no una
     *  decisión. */
    apartado: z
      .string()
      .regex(/^[a-z0-9áéíóúüñö-]+$/, 'slug de encabezado, en minúscula y con sus acentos')
      .optional(),
    nota: z.string().min(10).optional(),
  }),
  z.object({
    tipo: z.literal('examen'),
    curso: z.string().regex(/^\d{4}-\d{4}$/, 'formato AAAA-AAAA'),
    convocatoria,
    nota: z.string().min(10).optional(),
  }),
]);

/** Un escalón es **una herramienta con su escalera**: qué vas a saber hacer,
 *  dónde se explica, y los ejercicios ordenados de fácil a examen.
 *
 *  Nace el 23 de agosto de 2026 de una crítica del alumno: «lo que has hecho
 *  es mandar con un enlace directo a la teoría, y con eso no aprende nadie».
 *  Tenía razón, y por partida doble. Un bloque era una pila plana de una
 *  decena de filas que mezclaba enlaces «leer» con enlaces a ejercicios, sin
 *  jerarquía; y el primer ejercicio de cualquier bloque ya era de nivel
 *  examen, así que quien llegaba sin saber el tema no tenía por dónde entrar.
 *
 *  La diferencia con `material` no es de presentación: un escalón **obliga**
 *  a declarar qué se aprende y cómo se sabe que está aprendido. */
const escalon = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  titulo: z.string().min(5),
  /** Qué vas a saber hacer al acabarlo, en segunda persona y en una frase.
   *  No es un resumen del apartado de teoría: es la capacidad. */
  aprendes: z.string().min(20),
  /** Dónde se explica. Opcional porque hay escalones que son solo práctica. */
  teoria: z
    .object({
      tema: z.string().regex(/^t\d{2}-[a-z0-9-]+$/),
      apartado: z
        .string()
        .regex(/^[a-z0-9áéíóúüñö-]+$/, 'slug de encabezado, en minúscula y con sus acentos'),
      nota: z.string().min(10).optional(),
    })
    .optional(),
  ejercicios: z
    .array(
      z.object({
        id: z.string().regex(/^[a-z0-9-]+$/),
        incrustado: z.boolean().default(false),
        nota: z.string().min(10).optional(),
      }),
    )
    .min(1),
  /** El criterio de cierre de **este** escalón, no del bloque entero. Y este
   *  sí se pinta: el `dominio` del bloque se validaba y se tiraba. */
  dominio: z.string().min(20),
});

/** Un bloque es **un hueco del examen**, no un apartado del temario. Esa es la
 *  diferencia entre una ruta de estudio y un índice. */
const bloque = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  titulo: z.string().min(5),
  /** Qué pide el examen, con las palabras del examen. */
  pide: z.string().min(10),
  /** Por qué este bloque existe y va donde va. Sale de contar los exámenes,
   *  no de una impresión. */
  porque: z.string().min(40),
  /** La parte de la medición que **no** se puede derivar de los datos. Que dos
   *  enunciados distintos sean «la misma propiedad» es una lectura humana, así
   *  que se declara y se dice de dónde sale (§10). Los porcentajes por
   *  competencia NO van aquí: se calculan al generar la página. */
  invariante: z
    .object({
      anios: z.number().int().min(1),
      fuente: z.string().min(10),
    })
    .optional(),
  /** Cómo sabes que has terminado este bloque. Es lo que separa una ruta de
   *  estudio de una lista de enlaces: una lista se acaba, un bloque se domina.
   *  Obligatorio, y en segunda persona: describe lo que tienes que ser capaz
   *  de hacer, no lo que tienes que haber leído. */
  dominio: z.string().min(20),
  /** La anotación de tiza del camino (rediseño Pizarra, brief §6b): el
   *  porqué medido del bloque comprimido en una frase de pizarra —
   *  «cae los 11 años — 7 pts de cálculo». Es dato y no presentación
   *  porque comprimir el `porque` en ocho palabras es una lectura humana,
   *  y la regla del brief es que la página no escribe nada.
   *
   *  El `tono` dice con qué tiza se escribe, y la semántica es estricta:
   *  `nota` (rojo) SOLO si la frase habla de puntos que deciden nota;
   *  `marco` (ámbar) para lo que sostiene sin puntuar — el suelo, el
   *  formulario—; `neutro` (gris) para el resto. Opcional: un bloque sin
   *  apunte no pinta nada, nunca se inventa uno. */
  apunte: z
    .object({
      texto: z.string().min(6).max(80),
      tono: z.enum(['nota', 'marco', 'neutro']).default('neutro'),
    })
    .optional(),
  /** La forma vieja: una pila plana de referencias.
   *
   *  Sigue valiendo, y por eso es opcional en vez de estar borrada: los
   *  bloques que todavía no se han convertido a escalones funcionan tal cual.
   *  Un bloque tiene que traer `material` o `escalones`, nunca los dos. */
  material: z.array(referencia).min(1).optional(),
  escalones: z.array(escalon).min(1).optional(),
  /** Lo que el examen pide y el sitio todavía **no** enseña. Se publica tal
   *  cual: prometer material que no existe es peor que enseñar el hueco. */
  falta: z.array(z.string().min(20)).default([]),
  /** La fecha en que este bloque se pasó por los criterios de hueco que la
   *  ruta declara en su `criterioDeOrden`. No se publica: es para el recuento.
   *
   *  Existe porque un `falta[]` vacío decía dos cosas incompatibles —«se ha
   *  mirado y no hay hueco» y «no lo ha mirado nadie»— y `deuda.mjs` no podía
   *  distinguirlas: contaba 53 de 103 bloques «sin declarar» cuando las siete
   *  rutas de Cálculo llevaban desde el 29 de agosto de 2026 diciendo en su
   *  propia prosa que sus bloques sí se habían revisado. Una métrica que no
   *  puede distinguir esas dos cosas empuja a inventarse huecos para
   *  apagarla, que es justo lo contrario de lo que §10 pide.
   *
   *  Va por bloque y no por ruta a propósito: una frase en la cabecera de la
   *  ruta la hereda cualquier bloque que se añada después sin haberlo mirado
   *  nadie, y ese es el fallo que este proyecto ya se ha comido varias veces.
   *  Un bloque nuevo nace sin fecha y sale en el recuento. */
  revisado: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'la fecha va como aaaa-mm-dd').optional(),
}).refine((b) => Boolean(b.material) !== Boolean(b.escalones), {
  message: 'un bloque lleva `material` o `escalones`, uno de los dos y no los dos',
});

/** Una ruta de estudio por evaluación.
 *
 *  Se llama `preparar` —carpeta, colección y URL— y no `rutas`, porque
 *  `src/lib/rutas.ts` ya construye URLs y la página de la ruta va a importar
 *  `ruta()`. Este repositorio ya se quemó una vez con un homónimo: «tema»
 *  significaba dos cosas y el armazón enganchaba sus manejadores al botón
 *  equivocado (ver `ui/Cabecera.astro`). Una palabra, un significado.
 *
 *  La carpeta es plana, como `catalogo/`. Bajo `content/calculo/` caería
 *  dentro del territorio de los globs `**​/ejercicios.yaml` y `**​/examen.yaml`
 *  e invitaría a poner ejercicios al lado — y una ruta **no posee** ejercicios,
 *  los referencia.
 *
 *  Fíjate en lo que no tiene: ni fecha, ni semanas, ni horas. El plan se mide
 *  en bloques y en criterio de dominio, no en calendario. */
const preparar = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/preparar' }),
  schema: z
    .object({
      asignatura: z.string().min(3),
      evaluacion: convocatoria,
      /** Otras convocatorias que esta misma ruta prepara.
       *
       *  Existe porque §15 pide «una ruta por evaluación» y Cálculo tiene
       *  **nueve** tipos de convocatoria y siete rutas. Las dos que faltaban
       *  son las recuperaciones, y escribirles ruta propia habría sido
       *  duplicar: medido sobre el corpus, los 17 ejercicios de la
       *  `recuperacion-cuarta` son **todos** de los temas 1 y 2 —la primera
       *  evaluación entera— y los 14 de la `recuperacion-quinta` caen todos
       *  dentro de los temas 1 a 4, que cubre la tercera.
       *
       *  Se declara aquí, en el dato, y no en un comentario, por dos motivos:
       *  para que la página del examen pueda enlazar a su ruta, y para que la
       *  auditoría de §15 lo pueda comprobar sola. */
      tambienPrepara: z.array(convocatoria).default([]),
      titulo: z.string().min(5),
      lede: z.string().min(40).max(400),
      /** Los temas que entran. Se cruzan con el catálogo al generar la ruta:
       *  una ruta no puede mandarte a un tema que no está escrito. */
      temas: z.array(z.string().regex(/^t\d{2}-[a-z0-9-]+$/)).min(1),
      /** Cuántas convocatorias se han leído para escribir esto. */
      medidoSobre: z.number().int().min(1),
      /** Por qué los bloques van en este orden y no en el del temario. */
      criterioDeOrden: z.string().min(30),
      bloques: z.array(bloque).min(1),
    })
    .refine((r) => new Set(r.bloques.map((b) => b.id)).size === r.bloques.length, {
      message: 'hay dos bloques con el mismo id',
    })
    /* Dos veces el mismo ejercicio incrustado produce dos `<h3 id="ej-…">`
       iguales: el índice llevaría siempre al primero y `humo.mjs` probaría el
       mismo dos veces creyendo que son dos distintos. */
    .refine(
      (r) => {
        const ids = r.bloques.flatMap((b) => [
          ...(b.material ?? [])
            .filter((m) => m.tipo === 'ejercicio' && m.incrustado)
            .map((m) => m.id),
          ...(b.escalones ?? []).flatMap((e) =>
            e.ejercicios.filter((x) => x.incrustado).map((x) => x.id),
          ),
        ]);
        return new Set(ids).size === ids.length;
      },
      { message: 'el mismo ejercicio incrustado dos veces duplica su id en el DOM' },
    )
    .refine(
      (r) => r.bloques.every((b) => !b.invariante || b.invariante.anios <= r.medidoSobre),
      { message: 'un bloque no puede aparecer en más años de los que se han contado' },
    ),
});

const calculo = defineCollection({
  loader: glob({ pattern: '**/index.mdx', base: './src/content/calculo' }),
  schema: temaEscrito,
});

const fluidos = defineCollection({
  loader: glob({ pattern: '**/index.mdx', base: './src/content/fluidos' }),
  schema: temaEscrito,
});

/* Álgebra entra el 26 de agosto de 2026, cuando Cálculo cumple §15 entera.
   Una colección por asignatura y no un glob sobre `content/` porque cada una
   tiene su carpeta y Astro necesita saber la base; es el mismo patrón que
   `fluidos` y se añade una línea por asignatura, que es el precio correcto. */
const algebra = defineCollection({
  loader: glob({ pattern: '**/index.mdx', base: './src/content/algebra' }),
  schema: temaEscrito,
});

/* Y Fundamentos Químicos el 5 de septiembre de 2026, la cuarta. La clave de
   la colección tiene que ser **el id del catálogo** —`fundamentos-quimicos`,
   con guion— porque `[tema].astro` llama a `getCollection(asignatura.id)`.
   Si no coincidiera, el build fallaría con un mensaje que apunta aquí. */
const fundamentosQuimicos = defineCollection({
  loader: glob({ pattern: '**/index.mdx', base: './src/content/fundamentos-quimicos' }),
  schema: temaEscrito,
});

export const collections = {
  catalogo,
  calculo,
  fluidos,
  algebra,
  'fundamentos-quimicos': fundamentosQuimicos,
  ejercicios,
  examen,
  preparar,
};
