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
     temas, el fallo aparecerá en el que nadie miró.

     Las páginas de examen entran desde el 20 de agosto de 2026, y no es un
     añadido cosmético: al crearlas, sus ejercicios quedaron fuera del filtro
     `/tNN-` y durante un rato el suelo dio verde sin haber probado **ni un
     solo distractor de examen**. Eso es exactamente la confianza falsa que
     §11 prohíbe. El índice `/examenes/` no entra: no tiene ejercicios. */
  /* Las rutas de estudio entran desde el 22 de agosto de 2026, y por el mismo
     motivo que entraron las de examen: incrustan ejercicios guiados, así que
     fuera del filtro sus distractores no se probarían y el suelo seguiría
     dando verde. Es la segunda vez que pasa lo mismo, y por eso está apuntado
     en `tasks/todo.md` que este filtro debería dejar de enumerar formas de URL
     y pasar a ser «toda página enlazada desde la portada con un
     [data-ejercicio] dentro». */
  const paginas = await (await fetch(`${ORIGEN}/`)).text().then((html) =>
    [...html.matchAll(/href="([^"]+)"/g)]
      .map((m) => m[1])
      .filter(
        (h) =>
          h.startsWith(BASE) &&
          /\/[a-z]+\/(t\d{2}-|examenes\/\d{4}-\d{4}|preparar\/)/.test(h),
      ),
  );
  const rutas = [...new Set(paginas)];

  comprueba(rutas.length > 0, `hay páginas de contenido que comprobar (${rutas.length})`);

  /** Recuento global de trazos: ver el comentario de más abajo. */
  const medidos = { raiz: 0, barra: 0 };

  for (const ruta of rutas) {
    console.log(`\n${ruta}`);
    await pagina.goto(`http://localhost:${PUERTO}${ruta}`, { waitUntil: 'networkidle' });
    await pagina.waitForTimeout(300);

    /* 1 · Los signos que se estiran se DIBUJAN, no solo existen en el DOM.
       Las fórmulas las dibuja KaTeX en el build, con sus propias fuentes: la
       raíz es un `.sqrt` con su `.sqrt-sign`, y la barra del conjugado un
       `.overline` con su `.overline-line`. Si la caja de esos trazos mide
       cero, la fórmula que ve el alumno es otra: `√3` se convierte en `3` y
       `z̄` en `z`, que es justo lo contrario de lo que dice.

       Las dos cosas fallaron de verdad con la salida MathML pura, cada una con
       una fuente distinta. Por eso se miden las dos.

       Se mide con TODO desplegado. En modo guiado casi nada está visible, y
       una comprobación que no encuentra fórmulas pasa en vacío: eso es un
       guardián de mentira. */
    await pagina.evaluate(() => {
      for (const b of document.querySelectorAll('[data-modo="completo"]')) b.click();
    });
    await pagina.waitForTimeout(200);

    const trazos = await pagina.evaluate(() => {
      const medidas = { raiz: [], barra: [] };

      /* Se destapa TODO lo oculto —desarrollos, mensajes de error, la
         resolución completa—: una fórmula rota dentro de un bloque que hoy
         está plegado sigue estando rota cuando el alumno lo abra. */
      const tapados = [...document.querySelectorAll('[hidden]')];
      for (const e of tapados) e.hidden = false;

      for (const panel of document.querySelectorAll('.panel')) {
        panel.style.display = 'block'; // ver los dos paneles a la vez, solo para medir
        /* El radical es un <svg> dentro del `.sqrt`, y la barra del conjugado
           es el borde inferior de un `.overline-line`. No son texto: si el CSS
           de KaTeX no llega, los dos se quedan a cero y la fórmula cambia de
           significado sin que nada falle. */
        for (const e of panel.querySelectorAll('.sqrt')) {
          if (!e.getBoundingClientRect().width) continue;
          const svg = e.querySelector('svg')?.getBoundingClientRect();
          medidas.raiz.push({
            texto: e.textContent.trim().slice(0, 8),
            grosor: svg ? svg.width : 0,
          });
        }

        for (const e of panel.querySelectorAll('.overline-line')) {
          if (!e.getBoundingClientRect().width) continue;
          medidas.barra.push({
            texto: e.closest('.overline')?.textContent.trim().slice(0, 8) ?? '',
            grosor: parseFloat(getComputedStyle(e).borderBottomWidth) || 0,
          });
        }
        panel.style.display = '';
      }

      for (const e of tapados) e.hidden = true;
      return medidas;
    });

    /* El recuento se acumula para todo el sitio y se comprueba al final. Un
       tema puede no tener ninguna raíz —sucesiones, por ejemplo— y eso no es
       un fallo; lo que sería un fallo es que NINGUNA página tuviera, porque
       entonces la comprobación estaría pasando en vacío. */
    for (const [cual, nombre, minimo] of [
      ['raiz', 'las raíces dibujan su radical', 4],
      ['barra', 'los conjugados dibujan su barra', 0.4],
    ]) {
      const medidas = trazos[cual];
      medidos[cual] += medidas.length;
      const mudas = medidas.filter((m) => m.grosor < minimo);
      if (medidas.length === 0) continue;
      comprueba(
        mudas.length === 0,
        `${nombre} (${medidas.length})`,
        mudas.length ? `«${mudas[0].texto}» tiene el trazo a ${mudas[0].grosor} px` : '',
      );
    }

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
       enganchado; lo que delata el fallo es el marcador.

       Los nombres de las pestañas NO se escriben aquí. Un tema tiene
       «teoría / ejercicios» y un examen «examen / resoluciones», y hasta el 20
       de agosto de 2026 este guardián buscaba los del tema a pelo: al aparecer
       los exámenes se quedó esperando un `data-pestana="ejercicios"` que en
       esa página no existe. Se busca por lo que la pestaña CONTIENE, que es lo
       que de verdad importa, y así el guardián sobrevive a la siguiente
       plantilla que se invente. */
    const nombres = await pagina.evaluate(() => {
      const enlaces = [...document.querySelectorAll('.pestanas a[data-pestana]')];
      const conEjercicios = enlaces.find((a) =>
        document.getElementById(a.dataset.pestana)?.querySelector('[data-ejercicio]'),
      );
      const otra = enlaces.find((a) => a !== conEjercicios);
      return { ejercicios: conEjercicios?.dataset.pestana, otra: otra?.dataset.pestana };
    });

    if (nombres.ejercicios) {
      await pagina.click(`[data-pestana="${nombres.ejercicios}"]`);
      await pagina.waitForTimeout(200);

      const estado = await pagina.evaluate(() => ({
        panel: document.querySelector('[data-armazon]')?.dataset.panel,
        activa: document.querySelector('.pestanas a[aria-current="page"]')?.dataset.pestana,
      }));

      comprueba(
        estado.panel === nombres.ejercicios,
        `la pestaña «${nombres.ejercicios}» abre su panel`,
      );
      comprueba(
        estado.activa === nombres.ejercicios,
        'la pestaña abierta es la que aparece marcada',
        `marcada: ${estado.activa ?? 'ninguna'} — el manejador no se ha enganchado`,
      );

      /* 3 · Los controles de la lectura no tocan las pestañas. */
      await pagina.click(`[data-pestana="${nombres.otra}"]`);
      await pagina.waitForTimeout(200);
      const siguiente = await pagina.$('[data-pasos]:not([hidden]) [data-ir="1"]');
      if (siguiente && (await siguiente.isVisible())) {
        await siguiente.click();
        await pagina.waitForTimeout(200);
        const panel = await pagina.evaluate(
          () => document.querySelector('[data-armazon]')?.dataset.panel,
        );
        comprueba(
          panel === nombres.otra,
          'avanzar de apartado no cambia de pestaña',
          `el panel pasó a "${panel}"`,
        );
      }
    }

    /* 4 · Cada ejercicio guiado diagnostica el error concreto.
       Se escribe un distractor declarado en el YAML y se exige que la
       respuesta NO sea el mensaje genérico (§05: nunca «incorrecto»).

       Se recorren TODOS los ejercicios de la página, no el primero: el día
       que haya diez, el fallo estará en el que nadie miró. */
    const cuantos = (await pagina.$$('[data-ejercicio]')).length;
    if (cuantos && nombres.ejercicios) {
      await pagina.click(`[data-pestana="${nombres.ejercicios}"]`);
    }

    for (let n = 0; n < cuantos; n++) {
      await pagina.waitForTimeout(200);

      /* Se prueban TODOS los distractores declarados, no uno de muestra. Un
         distractor cuyo valor el lector de respuestas no sepa interpretar
         —una raíz mal escrita, un signo raro— nunca se dispararía, y el
         alumno recibiría «no es correcto» donde había un diagnóstico escrito.
         Eso no se ve leyendo el YAML. */
      const prueba = await pagina.evaluate(async (n) => {
        const raiz = document.querySelectorAll('[data-ejercicio]')[n];
        const titulo = raiz.querySelector('h3')?.textContent.trim() ?? `ejercicio ${n + 1}`;
        const datos = JSON.parse(raiz.querySelector('[data-datos]').textContent);
        const espera = (ms) => new Promise((r) => setTimeout(r, ms));

        for (const paso of raiz.querySelectorAll('[data-paso]')) paso.classList.remove('bloqueado');

        const mudos = [];
        let probados = 0;

        /* Los pasos de verificación no llevan distractores: el diagnóstico sale
           de comparar dos regiones. Se comprueban de otra manera —una condición
           imposible tiene que recibir diagnóstico, y la propia condición del
           enunciado tiene que darse por buena—, que es el equivalente. */
        for (let i = 0; i < datos.length; i++) {
          if (datos[i].tipo !== 'verificar') continue;
          const paso = raiz.querySelector(`[data-paso="${i}"]`);
          paso.classList.remove('bloqueado');
          const campo = paso.querySelector('input');
          const boton = paso.querySelector('[data-comprobar]');

          campo.value = 'x > 99999';
          boton.click();
          await espera(120);
          probados++;
          const dicho = (paso.querySelector('[data-fb]').textContent ?? '').trim();
          if (!/región/i.test(dicho) || dicho.length < 60) {
            mudos.push(`región vacía (paso ${i + 1}): «${dicho.slice(0, 40)}»`);
          }

          /* La condición del enunciado, escrita tal cual, tiene que valer: es
             trivialmente la misma región que ella misma. Si esto falla, algo
             se ha roto en el intérprete o en la comparación. */
          campo.value = datos[i].condicion;
          boton.click();
          await espera(150);
          probados++;
          if (!paso.classList.contains('resuelto')) {
            mudos.push(`la condición del enunciado no se acepta (paso ${i + 1})`);
          }
        }

        for (let i = 0; i < datos.length; i++) {
          if (datos[i].tipo !== 'calcular') continue;
          const paso = raiz.querySelector(`[data-paso="${i}"]`);

          for (let k = 0; k < datos[i].distractores.length; k++) {
            const esperado = paso
              .querySelector(`[data-msg-distractor="${k}"]`)
              .textContent.trim()
              .slice(0, 40);

            paso.querySelector('input').value = datos[i].distractores[k];
            paso.querySelector('[data-comprobar]').click();
            await espera(60);
            probados++;

            const dicho = (paso.querySelector('[data-fb]').textContent ?? '').trim();
            if (!dicho.includes(esperado)) {
              mudos.push(`${datos[i].distractores[k]} (paso ${i + 1})`);
            }
          }
        }

        return { titulo, probados, mudos };
      }, n);

      comprueba(
        prueba.probados > 0,
        `«${prueba.titulo}»: hay respuestas que probar (${prueba.probados})`,
      );
      comprueba(
        prueba.mudos.length === 0,
        `«${prueba.titulo}»: cada respuesta equivocada recibe su diagnóstico`,
        prueba.mudos.length ? `sin diagnosticar: ${prueba.mudos.join(', ')}` : '',
      );
    }
  }

  console.log('');
  comprueba(
    medidos.raiz > 0 && medidos.barra > 0,
    `en todo el sitio hay raíces (${medidos.raiz}) y barras (${medidos.barra}) que medir`,
    'sin ninguna, la comprobación de trazos estaría pasando en vacío',
  );
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
