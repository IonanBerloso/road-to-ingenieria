/**
 * La edición de una sola asignatura: el único sitio que lee el modo.
 *
 * Para quién: Ionan, cuando quiere enseñar UNA asignatura (hoy, Expresión
 * Gráfica) a su profesor sin que desde el sitio se pueda llegar a ninguna
 * otra, porque no está. Cuándo: al publicar esa edición, en otra dirección.
 * Qué gana: enseñar el trabajo de una asignatura sin tener que explicar el
 * resto ni arriesgar un enlace a algo a medias. Cómo se comprueba que sirve:
 * `npm run build:solo` y `npm run verifica:solo` (cada enlace interno del
 * `dist-solo/` apunta a una página que existe en él), y
 * `tests/edicion/edicion.test.ts`.
 *
 * Se activa con variables de entorno, y sin ellas el sitio es exactamente el
 * de siempre:
 *
 *   SOLO_ASIGNATURA   el id de la asignatura, p. ej. `expresion-grafica`
 *   BASE_SOLO         su base de despliegue; por omisión `/<id>`
 *
 * Es un `.mjs` porque lo leen a la vez `astro.config.mjs` (que no puede
 * importar TypeScript), `content.config.ts` y las páginas. Nada más del
 * repositorio mira el entorno: todo lo demás pregunta aquí.
 */

const entorno = typeof process !== 'undefined' ? process.env : {};

/** El id de la asignatura de la edición, o `''` en el sitio completo. */
export const SOLO = (entorno.SOLO_ASIGNATURA ?? '').trim();

/** ¿Estamos construyendo la edición de una sola asignatura? */
export const enSolo = SOLO !== '';

if (enSolo && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(SOLO)) {
  throw new Error(`SOLO_ASIGNATURA="${SOLO}" no es un id de asignatura válido (minúsculas y guiones).`);
}

/** La base de despliegue de la edición, sin barra final. */
export const BASE_SOLO = enSolo ? (entorno.BASE_SOLO || `/${SOLO}`).replace(/\/+$/, '') : '';

/** La base del sitio completo. El contenido (MDX y YAML) enlaza con ella
 *  escrita a mano en unos cuantos sitios; `rehypeEdicion` la traduce. */
export const BASE_COMPLETA = '/road-to-ingenieria';

/** La carpeta de salida: distinta de `dist/` para no pisar la del sitio. */
export const SALIDA = enSolo ? 'dist-solo' : 'dist';

/**
 * El patrón de un glob de contenido.
 *
 * `todos` es el del sitio completo; `soloEsta` es el de la edición, que se
 * calcula a partir del id. Así cada colección dice las dos cosas en el mismo
 * sitio y no hay un `if` repartido por el fichero de colecciones.
 *
 * @param {string} todos
 * @param {(id: string) => string} soloEsta
 */
export function patronSolo(todos, soloEsta) {
  return enSolo ? soloEsta(SOLO) : todos;
}

/**
 * El plugin de rehype que adapta los enlaces escritos en el contenido.
 *
 * El contenido de las asignaturas enlaza a sus propias páginas con la base del
 * sitio completo escrita a mano (`/road-to-ingenieria/expresion-grafica/…`), y
 * no se edita para la edición. Por eso, con el modo puesto:
 *
 *   · un enlace a la asignatura de la edición cambia la base por la suya;
 *   · un enlace a su PDF de `public/examenes/<id>/…`, igual;
 *   · cualquier otro enlace con la base del sitio —otra asignatura, la portada
 *     del sitio completo— deja de ser enlace: se queda su texto, y el build
 *     avisa de cuál era para que se pueda contar en el LEEME.
 *
 * Sin el modo no se registra siquiera: el HTML del sitio completo es el de
 * siempre, byte a byte.
 */
export function rehypeEdicion() {
  const prefijo = `${BASE_COMPLETA}/`;
  const propia = (href) => {
    const resto = href.slice(prefijo.length);
    if (resto === '') return `${BASE_SOLO}/`;
    if (resto === `#${SOLO}`) return `${BASE_SOLO}/${SOLO}/`;
    if (resto.startsWith(`${SOLO}/`) || resto.startsWith(`examenes/${SOLO}/`)) return `${BASE_SOLO}/${resto}`;
    return null;
  };
  const adapta = (href) => {
    if (typeof href !== 'string' || !href.startsWith(prefijo)) return href;
    return propia(href);
  };

  const recorre = (nodo) => {
    if (!nodo.children) return;
    const hijos = [];
    for (const h of nodo.children) {
      recorre(h);
      const esA = h.type === 'element' && h.tagName === 'a';
      const esJsx = (h.type === 'mdxJsxTextElement' || h.type === 'mdxJsxFlowElement') && h.name === 'a';
      if (esA || esJsx) {
        const original = esA
          ? h.properties?.href
          : h.attributes?.find((a) => a.type === 'mdxJsxAttribute' && a.name === 'href')?.value;
        const nuevo = adapta(original);
        if (nuevo === null) {
          console.warn(`[edicion-solo] enlace a otra parte del sitio, convertido en texto: ${original}`);
          hijos.push(...h.children);
          continue;
        }
        if (nuevo !== original) {
          if (esA) h.properties.href = nuevo;
          else h.attributes.find((a) => a.name === 'href').value = nuevo;
        }
      }
      hijos.push(h);
    }
    nodo.children = hijos;
  };
  return (arbol) => recorre(arbol);
}

/**
 * Una integración de Astro que, al acabar el build de la edición, quita de la
 * salida lo que `public/` copia sin preguntar: los PDF de examen de las demás
 * asignaturas. Sin el modo no hace nada.
 */
export function integracionEdicion() {
  return {
    name: 'edicion-solo',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        if (!enSolo) return;
        const { readdirSync, rmSync, existsSync } = await import('node:fs');
        const { fileURLToPath } = await import('node:url');
        const raiz = fileURLToPath(dir);
        const examenes = `${raiz}/examenes`;
        if (!existsSync(examenes)) return;
        for (const e of readdirSync(examenes, { withFileTypes: true })) {
          if (e.isDirectory() && e.name !== SOLO) rmSync(`${examenes}/${e.name}`, { recursive: true, force: true });
        }
      },
    },
  };
}
