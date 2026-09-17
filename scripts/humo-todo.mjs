/**
 * La barrida completa, repartida por asignatura y en paralelo.
 *
 * `HUMO_TODO=1 npm run humo` abría las 118 convocatorias en un solo navegador,
 * una detrás de otra, y tardaba **más de una hora**. Una hora es el tiempo a
 * partir del cual un guardián se deja de ejecutar: se pospone «para luego», y
 * luego es nunca. El plan pide que la tanda baje de treinta minutos.
 *
 * Aquí no se comprueba nada nuevo. Se levanta **un solo** servidor de vista
 * previa y se reparten las asignaturas entre varios procesos de `humo.mjs`,
 * cada uno con su navegador. Lo que tarda la tanda pasa a ser lo que tarde la
 * asignatura más lenta más la cola, en vez de la suma de todas.
 *
 * Dos decisiones que conviene que se lean:
 *
 * - **Cuatro a la vez, no nueve.** Cada proceso abre un Chromium con el montón
 *   de JavaScript a 4 GB (ver `humo.mjs`), y nueve de esos a la vez compiten
 *   por la memoria en vez de por el reloj: el guardián empezaría a fallar por
 *   falta de sitio, que es justo el fallo que `--disable-dev-shm-usage` está
 *   ahí para evitar. Se puede cambiar con `HUMO_A_LA_VEZ`.
 * - **La salida se guarda entera y se enseña solo la de quien falla.** Nueve
 *   registros entrelazados no los lee nadie; el de la asignatura que ha fallado
 *   sí.
 *
 *     node scripts/humo-todo.mjs
 */

import { spawn, spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const { default: astroConfig } = await import('../astro.config.mjs');
const BASE = astroConfig.base.replace(/\/$/, '');
const PUERTO = Number(process.env.HUMO_PUERTO ?? 4321);
const ORIGEN = `http://localhost:${PUERTO}`;
const A_LA_VEZ = Number(process.env.HUMO_A_LA_VEZ ?? 4);

/**
 * Para cualquier vista previa que haya quedado suelta, y arranca la nuestra.
 *
 * `astro preview` es un **demonio**: se queda de fondo y sobrevive a que muera
 * quien lo lanzó. Si ya hay uno —aunque sea en otro puerto, como el que deja
 * `peso.mjs` en el 4408— el siguiente no arranca, solo imprime «already
 * running» y se va; y entonces esta barrida se cae con «el servidor no ha
 * arrancado en 30 s» sin decir por qué. Así que primero se para el que haya.
 */
function paraLaVistaPrevia() {
  spawnSync(
    process.execPath,
    [join(ROOT, 'node_modules', 'astro', 'bin', 'astro.mjs'), 'preview', 'stop'],
    { cwd: ROOT, stdio: 'ignore' },
  );
}

paraLaVistaPrevia();
const servidor = spawn(
  process.execPath,
  [join(ROOT, 'node_modules', 'astro', 'bin', 'astro.mjs'), 'preview', '--port', String(PUERTO)],
  { cwd: ROOT, stdio: 'ignore' },
);

async function esperaServidor() {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(`${ORIGEN}${BASE}/`)).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('El servidor de vista previa no ha arrancado en 30 s.');
}

/**
 * Las asignaturas, sacadas de los enlaces de contenido de la portada.
 *
 * No vale con quedarse con el primer segmento de cualquier enlace: la portada
 * también apunta a `_astro/…` y a `favicon.svg`, y el primer intento de esta
 * barrida arrancó dos procesos para mirar una carpeta de recursos y un icono.
 * Se filtra por la misma forma que usa `humo.mjs` para decidir qué es una
 * página de contenido: tema, examen, ruta o formulario.
 */
async function asignaturas() {
  const html = await (await fetch(`${ORIGEN}${BASE}/`)).text();
  const contenido = /^\/[a-z][a-z-]*\/(t\d{2}-|examenes\/|preparar\/|formulario\/)/;
  const slugs = [...html.matchAll(/href="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((h) => h.startsWith(BASE))
    .map((h) => h.replace(BASE, ''))
    .filter((h) => contenido.test(h))
    .map((h) => h.split('/').filter(Boolean)[0]);
  return [...new Set(slugs)].sort();
}

/** Una tanda: un `humo.mjs` con su asignatura, contra el servidor de fuera. */
function corre(slug) {
  return new Promise((resuelve) => {
    const desde = Date.now();
    const hijo = spawn(process.execPath, [join(ROOT, 'scripts', 'humo.mjs')], {
      cwd: ROOT,
      env: {
        ...process.env,
        HUMO_TODO: '1',
        HUMO_ASIGNATURA: slug,
        HUMO_SERVIDOR: 'fuera',
        HUMO_PUERTO: String(PUERTO),
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let salida = '';
    hijo.stdout.on('data', (d) => { salida += d; });
    hijo.stderr.on('data', (d) => { salida += d; });
    hijo.on('close', (codigo) => {
      const minutos = (Date.now() - desde) / 60000;
      console.log(
        `  ${codigo === 0 ? '✓' : '✗'} ${slug.padEnd(24)} ${minutos.toFixed(1)} min`,
      );
      resuelve({ slug, codigo, salida, minutos });
    });
  });
}

/** Una cola sencilla: nunca más de `A_LA_VEZ` procesos vivos. */
async function enTandas(lista, cuantos) {
  const resultados = [];
  let siguiente = 0;
  const obrero = async () => {
    while (siguiente < lista.length) {
      const mio = lista[siguiente++];
      resultados.push(await corre(mio));
    }
  };
  await Promise.all(Array.from({ length: Math.min(cuantos, lista.length) }, obrero));
  return resultados;
}

const arrancado = Date.now();
let codigoFinal = 0;
try {
  await esperaServidor();
  const slugs = await asignaturas();

  /* El guardián que `humo.mjs` no puede aplicar cuando mira una sola: que
     ninguna asignatura con páginas construidas se quede sin tanda. Aquí sí se
     puede, porque aquí se ve la lista entera. */
  const conContenido = readdirSync(join(ROOT, 'src', 'content', 'catalogo'))
    .filter((n) => n.endsWith('.json'))
    .map((n) => n.replace(/\.json$/, ''))
    .filter((a) => existsSync(join(ROOT, 'dist', a)));
  const sinTanda = conContenido.filter((a) => !slugs.includes(a));
  if (sinTanda.length) {
    throw new Error(
      `estas asignaturas tienen páginas construidas y no les toca tanda: ${sinTanda.join(', ')}`,
    );
  }

  console.log(
    `Barrida completa — ${slugs.length} asignaturas, ${A_LA_VEZ} a la vez\n`,
  );
  const resultados = await enTandas(slugs, A_LA_VEZ);

  const caidas = resultados.filter((r) => r.codigo !== 0);
  console.log('');
  for (const r of caidas) {
    console.error(`── ${r.slug} ──────────────────────────────────────────`);
    /* Solo las líneas que dicen algo: el registro entero son cientos de
       palomitas y el fallo se pierde dentro. */
    console.error(
      r.salida
        .split('\n')
        .filter((l) => l.includes('✗') || /^\s{4}\S/.test(l))
        .slice(0, 40)
        .join('\n'),
    );
  }

  /* El recuento global de trazos, que ninguna tanda puede hacer sola: las
     barras son el conjugado y en Química no hay ninguna, así que cada hijo
     solo exige haber medido algo y la suma se hace aquí, leyendo la línea que
     todos imprimen. */
  const suma = { raiz: 0, barra: 0 };
  for (const r of resultados) {
    const m = r.salida.match(/hay raíces \((\d+)\) y barras \((\d+)\)/);
    if (m) { suma.raiz += Number(m[1]); suma.barra += Number(m[2]); }
  }
  console.log(`\nTrazos medidos en todo el sitio: ${suma.raiz} raíces · ${suma.barra} barras`);
  if (!(suma.raiz > 0 && suma.barra > 0)) {
    console.error('  ✗ con un cero ahí, la comprobación de trazos estaría pasando en vacío');
    codigoFinal = 1;
  }

  const total = (Date.now() - arrancado) / 60000;
  const masLenta = resultados.reduce((a, b) => (b.minutos > a.minutos ? b : a), resultados[0]);
  console.log(
    `\nTotal ${total.toFixed(1)} min` +
      ` · la más lenta, ${masLenta.slug}, ${masLenta.minutos.toFixed(1)} min`,
  );
  if (caidas.length) {
    console.error(`\n${caidas.length} asignatura(s) en rojo. El despliegue se queda parado.`);
    codigoFinal = 1;
  }
  if (codigoFinal === 0) console.log('Barrida completa: en verde.');
  else console.error('La barrida completa no está en verde.');
} catch (e) {
  console.error('La barrida no pudo completarse:', String(e));
  codigoFinal = 1;
} finally {
  /* Matar al que lo lanzó no mata al demonio: hay que pedirle que pare. */
  servidor.kill();
  paraLaVistaPrevia();
}

process.exit(codigoFinal);
