#!/usr/bin/env node
/**
 * humo.mjs — el suelo de calidad que `verify.mjs` no puede cubrir.
 *
 * `verify.mjs` lee el HTML publicado. Eso basta para comprobar que algo ESTÁ,
 * pero no que FUNCIONE. Tres fallos reales se colaron por ahí el 19 de agosto
 * de 2026, los tres invisibles a un análisis de texto:
 *
 *   · el MathML de una raíz cuadrada era correcto y el navegador no la
 *     dibujaba, porque la fuente no tenía tabla MATH: el enunciado decía
 *     -3/2 donde debía decir -√3/2
 *   · las pestañas de teoría y ejercicios no enganchaban sus manejadores
 *     porque `data-tema` lo usaban dos componentes distintos
 *   · el mismo atributo `data-ir` en dos sitios hacía que «siguiente»
 *     ocultara los dos paneles
 *
 * Cada comprobación de aquí abajo es un fallo que ya ocurrió. No se añaden
 * comprobaciones por si acaso: se añaden cuando algo se rompe.
 *
 * Abre el sitio construido en Chromium y sale con código != 0 si algo falla.
 */

import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const { default: astroConfig } = await import('../astro.config.mjs');
const BASE = astroConfig.base.replace(/\/$/, '');
const PUERTO = 4321;
const ORIGEN = `http://localhost:${PUERTO}${BASE}`;

let fallos = 0;
const ok = (t) => console.log(`  ✓ ${t}`);
const fallo = (t, detalle) => {
  console.error(`  ✗ ${t}`);
  if (detalle) console.error(`    ${detalle}`);
  fallos++;
};
const comprueba = (condicion, t, detalle) => (condicion ? ok(t) : fallo(t, detalle));

/* ── servidor ───────────────────────────────────────────────────────── */

const servidor = spawn(
  process.execPath,
  [join(ROOT, 'node_modules', 'astro', 'bin', 'astro.mjs'), 'preview', '--port', String(PUERTO)],
  { cwd: ROOT, stdio: 'ignore' },
);

async function esperaServidor() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`${ORIGEN}/`);
      if (r.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('El servidor de vista previa no ha arrancado en 30 s.');
}

/* ── comprobaciones ─────────────────────────────────────────────────── */

async function main() {
  await esperaServidor();

  const navegador = await chromium.launch();
  const pagina = await navegador.newPage({ viewport: { width: 1280, height: 1000 } });

  const erroresConsola = [];
  pagina.on('pageerror', (e) => erroresConsola.push(String(e)));
  pagina.on('console', (m) => {
    if (m.type() === 'error') erroresConsola.push(m.text());
  });

  /* Se recorre cada página de contenido, no solo una: el día que haya veinte
     temas, el fallo aparecerá en el que nadie miró. */
  const paginas = await (await fetch(`${ORIGEN}/`)).text().then((html) =>
    [...html.matchAll(/href="([^"]+)"/g)]
      .map((m) => m[1])
      .filter((h) => h.startsWith(BASE) && /\/[a-z]+\/t\d{2}-/.test(h)),
  );
  const rutas = [...new Set(paginas)];

  comprueba(rutas.length > 0, `hay páginas de tema que comprobar (${rutas.length})`);

  for (const ruta of rutas) {
    console.log(`\n${ruta}`);
    await pagina.goto(`http://localhost:${PUERTO}${ruta}`, { waitUntil: 'networkidle' });
    await pagina.waitForTimeout(300);

    /* 1 · Los signos que se estiran se DIBUJAN, no solo existen en el DOM.
       Que un <msqrt> tenga caja no basta: sin una fuente con tabla MATH el
       navegador coloca el contenido y se come el radical, y la caja mide
       exactamente lo que el contenido. Con radical sobran entre 8 y 14 px;
       sin él, 0 clavado. Se exige un margen de 4 px, que separa los dos
       casos sin depender de la fuente concreta del sistema.

       Se mide con TODO desplegado. En modo guiado casi nada está visible, y
       una comprobación que no encuentra raíces pasa en vacío: eso es un
       guardián de mentira. */
    await pagina.evaluate(() => {
      for (const b of document.querySelectorAll('[data-modo="completo"]')) b.click();
    });
    await pagina.waitForTimeout(200);

    const raices = await pagina.evaluate(() => {
      const medidas = [];
      for (const panel of document.querySelectorAll('.panel')) {
        panel.style.display = 'block'; // ver los dos paneles a la vez, solo para medir
        for (const e of panel.querySelectorAll('msqrt')) {
          const propio = e.getBoundingClientRect();
          if (!propio.width) continue;
          const hijo = e.firstElementChild?.getBoundingClientRect();
          medidas.push({
            texto: e.textContent.trim().slice(0, 8),
            sobrante: hijo ? propio.width - hijo.width : Infinity,
          });
        }
        panel.style.display = '';
      }
      return medidas;
    });

    const mudas = raices.filter((m) => m.sobrante < 4);
    comprueba(raices.length > 0, `hay raíces que medir (${raices.length})`);
    comprueba(
      mudas.length === 0,
      'las raíces dibujan su radical, no solo el contenido',
      mudas.length
        ? `√${mudas[0].texto} ocupa lo mismo que su contenido — falta una fuente con tabla MATH`
        : '',
    );

    /* La lectura recuerda el modo en localStorage, así que hay que borrarlo
       antes de recargar: si no, el resto de comprobaciones se harían sobre una
       página en modo completo, que no es el estado en el que llega el alumno. */
    await pagina.evaluate(() => {
      try {
        localStorage.removeItem('modo-lectura');
      } catch {}
    });
    await pagina.reload({ waitUntil: 'networkidle' });
    await pagina.waitForTimeout(300);

    /* 2 · Las pestañas cambian de panel Y marcan cuál está activa.
       Con `:target` el panel cambia aunque el JavaScript no se haya
       enganchado; lo que delata el fallo es el marcador. */
    const pestanas = await pagina.$$('[data-pestana]');
    if (pestanas.length) {
      await pagina.click('[data-pestana="ejercicios"]');
      await pagina.waitForTimeout(200);

      const estado = await pagina.evaluate(() => ({
        panel: document.querySelector('[data-armazon]')?.dataset.panel,
        activa: document.querySelector('.pestanas a[aria-current="page"]')?.dataset.pestana,
      }));

      comprueba(estado.panel === 'ejercicios', 'la pestaña de ejercicios abre su panel');
      comprueba(
        estado.activa === 'ejercicios',
        'la pestaña abierta es la que aparece marcada',
        `marcada: ${estado.activa ?? 'ninguna'} — el manejador no se ha enganchado`,
      );

      /* 3 · Los controles de la lectura no tocan las pestañas. */
      await pagina.click('[data-pestana="teoria"]');
      await pagina.waitForTimeout(200);
      const siguiente = await pagina.$('[data-pasos]:not([hidden]) [data-ir="1"]');
      if (siguiente && (await siguiente.isVisible())) {
        await siguiente.click();
        await pagina.waitForTimeout(200);
        const panel = await pagina.evaluate(
          () => document.querySelector('[data-armazon]')?.dataset.panel,
        );
        comprueba(
          panel === 'teoria',
          'avanzar de apartado no cambia de pestaña',
          `el panel pasó a "${panel}"`,
        );
      }
    }

    /* 4 · El ejercicio guiado diagnostica el error concreto.
       Se escribe un distractor declarado en el YAML y se exige que la
       respuesta NO sea el mensaje genérico (§05: nunca «incorrecto»). */
    const ejercicio = await pagina.$('[data-ejercicio]');
    if (ejercicio) {
      await pagina.click('[data-pestana="ejercicios"]');
      await pagina.waitForTimeout(200);

      const diagnostico = await pagina.evaluate(async () => {
        const raiz = document.querySelector('[data-ejercicio]');
        const datos = JSON.parse(raiz.querySelector('[data-datos]').textContent);

        // Se desbloquean los pasos poniéndose en modo completo.
        raiz.querySelector('[data-modo="completo"]').click();
        await new Promise((r) => setTimeout(r, 50));
        raiz.querySelector('[data-modo="guiado"]').click();
        await new Promise((r) => setTimeout(r, 50));

        const i = datos.findIndex((d) => d.tipo === 'calcular' && d.distractores.length);
        if (i < 0) return { hay: false };

        const paso = raiz.querySelector(`[data-paso="${i}"]`);
        paso.classList.remove('bloqueado');
        paso.querySelector('input').value = datos[i].distractores[0];
        paso.querySelector('[data-comprobar]').click();
        await new Promise((r) => setTimeout(r, 100));

        const fb = paso.querySelector('[data-fb]');
        return {
          hay: true,
          visible: !fb.hidden,
          texto: (fb.textContent ?? '').trim(),
        };
      });

      if (diagnostico.hay) {
        comprueba(diagnostico.visible, 'una respuesta equivocada recibe respuesta del sistema');
        comprueba(
          !/no es correcto|incorrecto/i.test(diagnostico.texto) && diagnostico.texto.length > 80,
          'el fallo se diagnostica en vez de decir «incorrecto»',
          diagnostico.texto.slice(0, 90),
        );
      }
    }
  }

  comprueba(
    erroresConsola.length === 0,
    'cero errores de JavaScript en consola',
    erroresConsola.slice(0, 3).join(' | '),
  );

  await navegador.close();
}

try {
  console.log('Navegador — comprobaciones que el HTML no puede dar\n');
  await main();
} catch (e) {
  fallo('la comprobación no pudo completarse', String(e));
} finally {
  servidor.kill();
}

console.log('');
if (fallos) {
  console.error(`${fallos} fallo(s) en navegador. El despliegue se queda parado.`);
  process.exit(1);
}
console.log('Navegador: en verde.');
