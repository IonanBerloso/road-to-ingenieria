/**
 * Los esquemas de las colecciones `piezas` y `vistas` (diseño de la fase M,
 * §3.7), aquí y no dentro de `content.config.ts` para que los tests los
 * puedan validar al revés sin construir el sitio: un campo mal escrito, una
 * primitiva que no existe en `noSeCorta`, un JSON con el resumen de otra
 * pieza, una planta espejada (`tests/vistas/esquemas.test.ts`).
 * `content.config.ts` los usa tal cual, con el `z` de Astro, que es este.
 *
 * `.strict()` en todo: Zod quita en silencio lo que no conoce, y un
 * `dentor: torre` mal escrito dejaría un chaflán mordiendo la base sin que
 * nadie lo viera (§17). Lo que se comprueba de la pieza más allá de su forma
 * es `problemasDePieza`, la misma función que corre el motor antes de
 * compilarla: un guardián que simula al producto llama a lo que llama el
 * producto (§17).
 *
 * LO QUE ESTÁ EN EL DISCO SE PREGUNTA, NO SE LEE AQUÍ. Cada esquema recibe un
 * `Disco` con lo que necesita saber de los otros ficheros: el texto de una
 * pieza, el resumen guardado en sus vistas, el del motor de hoy. El build le
 * da el de verdad (`discoDe` en `content.config.ts`, con `resumen.ts`); los
 * tests, uno de mentira.
 *
 * Una limitación que hay que saber: Astro guarda lo validado entre builds y
 * no vuelve a validar un fichero que no ha cambiado. Por eso cada colección
 * comprueba el lado que puede cambiar ella —la pieza, que sus vistas sean
 * las de su texto; las vistas, que su resumen sea el de su pieza y su
 * motor—, y por eso `tests/vistas/al-dia.test.ts` recalcula todo igual. Un
 * cambio del motor solo lo ve un build limpio, como el del CI, o ese test.
 */
import { z } from 'astro/zod';
import { problemasDePieza, type PiezaDeclarada } from './pieza.ts';
import { idDePieza, problemasDeInvariantes, problemasDeResumen, type Resumen } from './publicadas.ts';

/** Lo que los esquemas preguntan al disco. */
export interface Disco {
  /** El texto del fichero `src/content/piezas/<id>.yaml`, o null. */
  textoDePieza(id: string): string | null;
  /** El resumen guardado en `src/content/vistas/<id>.json`, o null. */
  resumenGuardado(id: string): Resumen | null;
  /** El resumen de un texto (sha-256 con LF). */
  resumenDeTexto(texto: string): string;
  /** El resumen del motor de hoy. */
  resumenDelMotor(): string;
}

/* ── La pieza ─────────────────────────────────────────────────────────── */

/* En Zod 4 un número ya es finito: NaN e Infinity no pasan. */
const numero = z.number();
const par = z.tuple([numero, numero]);
const terna = z.tuple([numero, numero, numero]);
const eje = z.enum(['x', 'y', 'z']);
const giro = z.object({ eje, grados: numero, por: terna.optional() }).strict();

/** Lo que lleva cualquier primitiva o grupo: su nombre, un giro y, en una
 *  resta, la suma de su nivel a la que se limita. */
const comun = {
  nombre: z.string().min(1),
  gira: giro.optional(),
  dentro: z.string().min(1).optional(),
};

const caja = z.object({ ...comun, caja: z.tuple([numero, numero, numero, numero, numero, numero]) }).strict();
const prisma = z
  .object({
    ...comun,
    prisma: z.object({ plano: z.enum(['xy', 'xz', 'yz']), poligono: z.array(par).min(3), desde: numero, hasta: numero }).strict(),
  })
  .strict();
const cilindro = z
  .object({
    ...comun,
    cilindro: z.object({ eje, centro: par, r: numero, desde: numero.optional(), hasta: numero.optional() }).strict(),
  })
  .strict();
const cono = z
  .object({
    ...comun,
    cono: z.object({ eje, centro: par, r0: numero, r1: numero, desde: numero, hasta: numero }).strict(),
  })
  .strict();
const semiespacio = z.object({ ...comun, semiespacio: z.object({ normal: terna, pasa: terna }).strict() }).strict();

/** Una primitiva o un grupo, por la clave que lleva. Se elige el esquema
 *  por esa clave en vez de probarlos todos, para que el error diga qué está
 *  mal de la caja y no que no es ni caja ni prisma ni cilindro. */
const CLASES = ['caja', 'prisma', 'cilindro', 'cono', 'semiespacio', 'suma'] as const;
const solido: z.ZodType<unknown> = z.lazy(() =>
  z.unknown().superRefine((s, ctx) => {
    const claves = s && typeof s === 'object' && !Array.isArray(s) ? CLASES.filter((k) => k in s) : [];
    if (claves.length !== 1) {
      ctx.addIssue({ code: 'custom', message: 'cada sólido es una caja, un prisma, un cilindro, un cono, un semiespacio o un grupo con «suma», y solo una cosa' });
      return;
    }
    const esquema = { caja, prisma, cilindro, cono, semiespacio, suma: grupo }[claves[0]];
    const r = esquema.safeParse(s);
    if (!r.success) for (const i of r.error.issues) ctx.addIssue({ code: 'custom', message: i.message, path: i.path });
  }),
);
/* Un grupo no lleva `gira`: `compilaPieza` gira primitivas y deja el de un
   grupo sin aplicar, sin decir nada. Hasta que el motor lo haga, el esquema
   no lo deja escribir. */
const grupo = z
  .object({
    ...comun,
    suma: z.array(solido).min(1),
    resta: z.array(solido).optional(),
    interseca: z.array(solido).optional(),
  })
  .strict()
  .superRefine((g, ctx) => {
    if (g.gira) {
      ctx.addIssue({ code: 'custom', path: ['gira'], message: `«${g.nombre}»: un grupo no se gira (el motor no aplicaría el giro); gira cada primitiva del grupo` });
    }
  });

/** Las notas del cotejo, como en las láminas: cuándo se miró la pieza
 *  encima de su página y qué se corrigió. */
const revision = z
  .object({
    fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    notas: z.array(z.string().min(20)).min(1),
  })
  .strict();

/**
 * Las reglas de cada colección (`problemasDePieza`, los invariantes, los
 * resúmenes) solo corren si la forma está bien. Zod 4 corre un `superRefine`
 * aunque haya fallos de forma, y con una `suma: [5]` o una `resta: [null]` la
 * regla lanzaba: `safeParse` lanzaba en vez de devolver el fallo, y el build
 * habría dado una traza sin fichero ni campo (revisión del 9 de octubre de
 * 2026). Con la forma rota se ven sus fallos, con su sitio, y nada más.
 */
const SOLO_CON_LA_FORMA_BIEN = { when: (p: { issues: readonly unknown[] }) => p.issues.length === 0 };

/** Lo que diga una regla, y si lanza, eso mismo como fallo: un guardián no
 *  puede romper el build sin decir dónde. */
function reglas(regla: () => string[]): string[] {
  try {
    return regla();
  } catch (e) {
    return [`no se ha podido comprobar: ${(e as Error).message}`];
  }
}

/** El código de una pieza: RI-V1, o el de su página del material, NyV-2.18-3. */
export const CODIGO_DE_PIEZA = /^[A-Za-z][A-Za-z0-9]*(?:[-.][A-Za-z0-9]+)*$/;

export function esquemaDePieza(disco: Disco) {
  return z
    .object({
      codigo: z.string().regex(CODIGO_DE_PIEZA, 'letras y cifras, partidas por guiones o puntos: NyV-2.18-3, RI-V1'),
      /** De dónde sale, por su título y su página: sin nombres de persona. */
      fuente: z.string().min(10),
      /** «dadas» si el material la acota; «proporcionales» si se ha medido
       *  sobre la figura, y entonces el ejercicio lo dice. */
      cotas: z.enum(['dadas', 'proporcionales']),
      suma: z.array(solido).min(1),
      resta: z.array(solido).optional(),
      interseca: z.array(solido).optional(),
      /** Nervios, ejes, tornillos: lo que no se raya a lo largo (M3). */
      noSeCorta: z.array(z.string().min(1)).optional(),
      simetria: z.array(z.object({ plano: eje, en: numero }).strict()).optional(),
      /** La convención del ejercicio (§1.3 del diseño): el motor calcula
       *  siempre todas; esto dice cuáles se dibujan. Sin decir, todas. */
      ocultas: z.enum(['todas', 'necesarias', 'ninguna']).optional(),
      revision,
    })
    .strict()
    .superRefine((d, ctx) => {
      for (const message of reglas(() => problemasDePieza(d as unknown as PiezaDeclarada))) ctx.addIssue({ code: 'custom', message });
      const id = idDePieza(d.codigo);
      const texto = disco.textoDePieza(id);
      if (texto === null) {
        ctx.addIssue({ code: 'custom', message: `la pieza ${d.codigo} tiene que estar en src/content/piezas/${id}.yaml: cada fichero se llama como su código` });
        return;
      }
      const guardado = disco.resumenGuardado(id);
      if (!guardado) {
        ctx.addIssue({ code: 'custom', message: `la pieza ${d.codigo} no tiene sus vistas en src/content/vistas/${id}.json: pasa \`npm run vistas\`` });
      } else if (guardado.pieza !== disco.resumenDeTexto(texto)) {
        ctx.addIssue({
          code: 'custom',
          message: `la pieza ${d.codigo} ha cambiado desde que se calcularon sus vistas (cuenta su texto entero, también un comentario o un espacio): pasa \`npm run vistas\``,
        });
      }
    }, SOLO_CON_LA_FORMA_BIEN);
}

/* ── Las vistas calculadas ────────────────────────────────────────────── */

const punto = par;
const forma = z.discriminatedUnion('tipo', [
  z.object({ tipo: z.literal('segmento'), a: punto, b: punto }).strict(),
  z.object({ tipo: z.literal('arco'), c: punto, r: numero.positive(), desde: numero, hasta: numero }).strict(),
  z.object({ tipo: z.literal('polilinea'), puntos: z.array(punto).min(2) }).strict(),
]);
const nombres = z.array(z.string().min(1));

const vista = (id: 'alzado' | 'planta' | 'perfil') =>
  z
    .object({
      vista: z.literal(id),
      encuadre: z.object({ umin: numero, umax: numero, vmin: numero, vmax: numero }).strict(),
      tramos: z
        .array(z.object({ forma, tipo: z.enum(['visto', 'oculto']), porque: z.string().min(1), de: nombres }).strict())
        .min(1),
      ejes: z.array(z.object({ a: punto, b: punto, de: nombres }).strict()),
      descartes: z.array(
        z
          .object({
            forma,
            motivo: z.enum(['mismo-plano', 'tangencia']),
            primitivas: nombres.min(2),
            mensaje: z.string().min(1),
            fuente: z.string().min(1),
          })
          .strict(),
      ),
    })
    .strict();

const hexadecimal = z.string().regex(/^[0-9a-f]{64}$/, 'un sha-256 en hexadecimal');

export function esquemaDeVistas(disco: Disco) {
  return z
    .object({
      codigo: z.string().regex(CODIGO_DE_PIEZA),
      resumen: z.object({ pieza: hexadecimal, motor: hexadecimal }).strict(),
      ocultas: z.enum(['todas', 'necesarias', 'ninguna']),
      vistas: z.object({ alzado: vista('alzado'), planta: vista('planta'), perfil: vista('perfil') }).strict(),
    })
    .strict()
    .superRefine((d, ctx) => {
      const id = idDePieza(d.codigo);
      const texto = disco.textoDePieza(id);
      if (texto === null) {
        ctx.addIssue({ code: 'custom', message: `las vistas de ${d.codigo} no tienen pieza: falta src/content/piezas/${id}.yaml` });
      } else {
        const hoy = { pieza: disco.resumenDeTexto(texto), motor: disco.resumenDelMotor() };
        for (const message of problemasDeResumen(d.resumen, hoy)) ctx.addIssue({ code: 'custom', message: `${d.codigo}: ${message}` });
      }
      for (const message of reglas(() => problemasDeInvariantes(d))) ctx.addIssue({ code: 'custom', message: `${d.codigo}: ${message}` });
    }, SOLO_CON_LA_FORMA_BIEN);
}
