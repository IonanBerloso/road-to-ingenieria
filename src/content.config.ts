import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

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

/** Los temas escritos. Uno por carpeta: index.mdx + (más adelante) ejercicios.yaml */
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

export const collections = { catalogo, calculo, fluidos };
